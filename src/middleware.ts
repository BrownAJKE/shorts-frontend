import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the user is trying to access a protected route
  const isProtectedRoute = pathname.startsWith('/overview') || 
                          pathname.startsWith('/details') || 
                          pathname.startsWith('/settings')
  
  // Check if the user is on the login page
  const isLoginPage = pathname === '/login'
  
  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value
  
  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If accessing login page with token, redirect to overview
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/overview', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
