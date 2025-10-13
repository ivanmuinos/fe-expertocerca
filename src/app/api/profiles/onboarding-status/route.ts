import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/config/supabase-server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_completed, user_type')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const hasProfile = !!profile
    const isCompleted = profile?.onboarding_completed || false
    const userType = profile?.user_type || null
    
    // Check if user has any portfolio photos (publications)
    let hasPublications = false
    if (hasProfile && userType === 'professional') {
      const { data: professionalProfile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()
      
      if (professionalProfile) {
        const { count } = await supabase
          .from('portfolio_photos')
          .select('id', { count: 'exact', head: true })
          .eq('professional_profile_id', professionalProfile.id)
        
        hasPublications = (count || 0) > 0
      }
    }
    
    // Only show onboarding alert if:
    // 1. User is professional
    // 2. Onboarding is not completed
    // 3. User has NO publications (never completed onboarding before)
    const needsOnboarding = hasProfile && !isCompleted && userType === 'professional' && !hasPublications

    return NextResponse.json({
      data: {
        hasProfile,
        isCompleted,
        userType,
        needsOnboarding,
        profileData: profile
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}