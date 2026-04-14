import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const adminPassword = process.env.ADMIN_PASSWORD

  // Protect home page
  if (pathname === '/') {
    const session = request.cookies.get('jh_session')
    if (!session || session.value !== adminPassword) {
      return NextResponse.redirect(new URL('/jobhunting/login', request.url))
    }
  }

  // Protect /feedback/admin/curriculo and /feedback/admin/feedback
  if (
    pathname.startsWith('/feedback/admin/curriculo') ||
    pathname.startsWith('/feedback/admin/feedback')
  ) {
    const session = request.cookies.get('admin_session')
    if (!session || session.value !== adminPassword) {
      return NextResponse.redirect(new URL('/feedback/admin', request.url))
    }
  }

  // Protect /jobhunting (but not /jobhunting/login)
  if (pathname === '/jobhunting' || (pathname.startsWith('/jobhunting/') && !pathname.startsWith('/jobhunting/login'))) {
    const session = request.cookies.get('jh_session')
    if (!session || session.value !== adminPassword) {
      return NextResponse.redirect(new URL('/jobhunting/login', request.url))
    }
  }

  // Protect /email
  if (pathname === '/email' || pathname.startsWith('/email/')) {
    const session = request.cookies.get('jh_session')
    if (!session || session.value !== adminPassword) {
      return NextResponse.redirect(new URL('/jobhunting/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/feedback/admin/curriculo/:path*',
    '/feedback/admin/feedback/:path*',
    '/jobhunting',
    '/jobhunting/:path*',
    '/email',
    '/email/:path*',
  ],
}
