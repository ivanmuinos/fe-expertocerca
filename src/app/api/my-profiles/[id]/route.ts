import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/config/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createSupabaseServerClient()

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profileId = id

    // Get the specific professional profile
    const { data: profile, error: profileError } = await supabase
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
      .eq('id', profileId)
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get profile data for the current user
    const { data: profileData, error: profileDataError } = await supabase
      .from('profiles')
      .select('full_name, location_city, location_province, skills, avatar_url')
      .eq('user_id', session.user.id)
      .single();

    if (profileDataError || !profileData) {
      return NextResponse.json({ error: 'Failed to load profile data' }, { status: 500 })
    }

    // Map the data to include profile information at the top level
    const mappedProfile = {
      id: profile.id,
      trade_name: profile.trade_name,
      description: profile.description,
      years_experience: profile.years_experience,
      hourly_rate: profile.hourly_rate,
      whatsapp_phone: profile.whatsapp_phone,
      work_phone: profile.work_phone,
      user_id: profile.user_id,
      profile_full_name: profileData.full_name,
      profile_location_city: profileData.location_city,
      profile_location_province: profileData.location_province,
      profile_skills: profileData.skills || [],
      profile_avatar_url: profileData.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return NextResponse.json({ data: mappedProfile })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}