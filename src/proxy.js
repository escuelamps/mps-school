import { NextResponse } from 'next/server';

export function proxy(request) {
  const path = request.nextUrl.pathname;
  
  // Only protect /admin/chats
  if (path.startsWith('/admin/chats')) {
    const authCookie = request.cookies.get('admin_session');
    
    // If no session cookie, redirect to login
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // If user goes to /admin directly, redirect to /admin/chats
  if (path === '/admin') {
    return NextResponse.redirect(new URL('/admin/chats', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
