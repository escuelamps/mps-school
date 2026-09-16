import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/admin/') && path !== '/admin/login') {
    const authCookie = request.cookies.get('mps_admin_session');
    
    if (!authCookie || !authCookie.value) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    let username = authCookie.value;
    try {
      const parsed = JSON.parse(authCookie.value);
      if (parsed.username) {
        username = parsed.username;
      }
    } catch (e) {
      // Ignorar si no es JSON (ej. sesión vieja legacy)
    }

    if (path.startsWith('/admin/contabilidad') && username !== 'lpineda') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

// Ensure the exported function is named middleware or proxy if Vercel is looking for it
export const proxy = middleware;

export const config = {
  matcher: ['/admin/:path*'],
};
