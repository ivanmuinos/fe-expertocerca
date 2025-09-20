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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') // 'discover' or 'browse'

    // Check auth for browse mode
    if (mode === 'browse') {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (!session) {
        return NextResponse.json({
          error: 'Unauthorized - No valid session found',
          details: sessionError?.message
        }, {
          status: 401,
          headers: corsHeaders()
        })
      }
    }

    const rpcFunction = mode === 'browse' ? 'browse_professionals' : 'discover_professionals'
    const { data, error } = await supabase.rpc(rpcFunction)

    if (error) {
      return NextResponse.json({ error: error.message }, {
        status: 400,
        headers: corsHeaders()
      })
    }

    return NextResponse.json({ data: data || [] }, {
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, {
        status: 401,
        headers: corsHeaders()
      })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('professional_profiles')
      .insert([{
        ...body,
        user_id: session.user.id
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, {
        status: 400,
        headers: corsHeaders()
      })
    }

    return NextResponse.json({ data: data[0] }, {
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