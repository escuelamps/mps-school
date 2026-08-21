import { NextResponse } from 'next/server';

export async function GET(request) {
  const authCookie = request.cookies.get('mps_admin_session');
  
  if (!authCookie || !authCookie.value) {
    return NextResponse.json({ username: null }, { status: 401 });
  }

  return NextResponse.json({ username: authCookie.value });
}
