import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = searchParams.get('next') ?? '/dashboard'

  // Supabase email callback is no longer used (MongoDB + Credentials auth).
  return NextResponse.redirect(`${origin}${next}`)
}
