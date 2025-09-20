import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/config/supabase-server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get professional profiles for current user
    const { data: profiles, error: profilesError } = await supabase
      .from('professional_profiles')
      .select(`
        id,
        trade_name,
        description,
        years_experience,
        hourly_rate,
        whatsapp_phone,
        work_phone,
        user_id,
        created_at,
        updated_at
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (profilesError) {
      return NextResponse.json({ error: 'Failed to load profiles' }, { status: 500 })
    }

    // Get profile data for the current user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, location_city, location_province, skills, avatar_url')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'Failed to load profile data' }, { status: 500 })
    }

    // Map the data to include profile information at the top level
    const mappedProfiles = (profiles || []).map(prof => ({
      id: prof.id,
      trade_name: prof.trade_name,
      description: prof.description,
      years_experience: prof.years_experience,
      hourly_rate: prof.hourly_rate,
      whatsapp_phone: prof.whatsapp_phone,
      work_phone: prof.work_phone,
      user_id: prof.user_id,
      profile_full_name: profileData.full_name,
      profile_location_city: profileData.location_city,
      profile_location_province: profileData.location_province,
      profile_skills: profileData.skills || [],
      profile_avatar_url: profileData.avatar_url,
      created_at: prof.created_at,
      updated_at: prof.updated_at,
    }));

    return NextResponse.json({ data: mappedProfiles })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('id')

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('professional_profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', session.user.id); // Ensure user can only delete their own profiles

    if (error) {
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
    }

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}