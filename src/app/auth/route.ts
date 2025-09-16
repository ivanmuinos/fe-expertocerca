import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  // If this is an OAuth callback (has code), redirect to callback handler
  const code = searchParams.get('code')
  if (code) {
    const callbackUrl = new URL('/auth/callback', origin)
    // Preserve all search params
    searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value)
    })

    return NextResponse.redirect(callbackUrl.toString())
  }

  // If no code, redirect to home
  return NextResponse.redirect(`${origin}/`)
}