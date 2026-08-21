import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Limpiar la nueva cookie segura
  response.cookies.set({
    name: 'mps_admin_session',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });

  // Limpiar rastros de las cookies antiguas si existen
  response.cookies.set({ name: 'admin_session', value: '', expires: new Date(0), path: '/' });
  response.cookies.set({ name: 'admin_username', value: '', expires: new Date(0), path: '/' });
  
  return response;
}
