import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/config/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userType } = await request.json()

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id, user_type, onboarding_completed')
      .eq('user_id', session.user.id)
      .maybeSingle()

    let result

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          user_type: userType,
          onboarding_completed: userType === 'customer' // Solo customers completan aquí
        })
        .eq('user_id', session.user.id)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      result = data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: session.user.id,
          user_type: userType,
          onboarding_completed: userType === 'customer',
          full_name: session.user.user_metadata?.full_name || null,
          avatar_url: session.user.user_metadata?.avatar_url || null
        })
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      result = data
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}