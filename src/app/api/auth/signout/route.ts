import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/config/supabase-server'

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}