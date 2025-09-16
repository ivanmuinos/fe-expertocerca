import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/config/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { session }, error } = await supabase.auth.getSession()

    // Get all cookies for debugging
    const cookies = request.cookies.getAll()

    return NextResponse.json({
      hasSession: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email
      } : null,
      sessionError: error?.message,
      cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}