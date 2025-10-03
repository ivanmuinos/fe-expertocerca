import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/config/supabase-server'

interface Context {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    const supabase = await createSupabaseServerClient()

    // Get professional profile with profile info first
    const { data, error } = await supabase
      .from('professional_profiles')
      .select(`
        *,
        profiles!inner(
          user_id,
          full_name,
          avatar_url,
          location_city,
          location_province,
          skills
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    // Get user metadata separately (from auth.users)
    let userMetadata = null;
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(data.user_id);
      userMetadata = userData?.user?.user_metadata;
    } catch (userError) {
      console.log('Could not fetch user metadata:', userError);
    }

    // Format the response to match the expected structure
    const professional = {
      id: data.id,
      trade_name: data.trade_name,
      description: data.description,
      specialty: data.specialty,
      years_experience: data.years_experience,
      user_id: data.user_id,
      profile_full_name: data.profiles.full_name,
      profile_location_city: data.profiles.location_city,
      profile_location_province: data.profiles.location_province,
      profile_skills: data.profiles.skills,
      profile_avatar_url: data.profiles.avatar_url,
      main_portfolio_image: data.main_portfolio_image,
      hourly_rate: data.hourly_rate,
      has_contact_info: data.whatsapp_phone ? true : false,
      whatsapp_phone: data.whatsapp_phone,
      user_metadata: userMetadata
    }

    return NextResponse.json({ data: professional })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify ownership
    const { data: profile } = await supabase
      .from('professional_profiles')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!profile || profile.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('professional_profiles')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data[0] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: profile } = await supabase
      .from('professional_profiles')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!profile || profile.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('professional_profiles')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}