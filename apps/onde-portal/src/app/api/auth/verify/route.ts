import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicLink } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/account?error=missing_token', request.url))
  }

  const session = await verifyMagicLink(token)

  if (!session) {
    return NextResponse.redirect(new URL('/account?error=invalid_token', request.url))
  }

  // Redirect to account page on success
  return NextResponse.redirect(new URL('/account?success=true', request.url))
}
