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
    const needsOnboarding = hasProfile && !isCompleted && userType === 'professional'

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