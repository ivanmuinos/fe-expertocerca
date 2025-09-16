import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/config/supabase-server'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json({ error: error.message }, {
        status: 401,
        headers: corsHeaders()
      })
    }

    return NextResponse.json({ data: session }, {
      headers: corsHeaders()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: corsHeaders()
      }
    )
  }
}