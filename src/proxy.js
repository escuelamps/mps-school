import { NextResponse } from 'next/server';

export function proxy(request) {
  const path = request.nextUrl.pathname;
  
  // Proteger rutas que empiezan con /admin/ (ej. /admin/cenas, /admin/contabilidad)
  // Pero permitir el paso libre a /admin (el hub/login combinado)
  if (path.startsWith('/admin/') && path !== '/admin/login') {
    const authCookie = request.cookies.get('mps_admin_session');
    
    // Si no hay cookie o está vacía, redireccionar a /admin (donde está el login ahora)
    if (!authCookie || !authCookie.value) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    const username = authCookie.value;

    // VALIDACIÓN DE SEGURIDAD REAL:
    // Si alguien intenta entrar a /admin/contabilidad y NO es lpineda, bloqueado
    if (path.startsWith('/admin/contabilidad') && username !== 'lpineda') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
