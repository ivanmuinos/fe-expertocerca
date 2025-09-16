import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/config/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get professional profile
    const { data: profile, error } = await supabase
      .from('professional_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching professional profile:', error)
      return NextResponse.json({ error: 'Failed to fetch professional profile' }, { status: 500 })
    }

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('Error in professional profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}