import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    // Check against Vercel environment variables (or local .env.local)
    const validUsername = process.env.ADMIN_USERNAME || 'lpineda';
    const validPassword = process.env.ADMIN_PASSWORD || 'escuelamps2026*';
    
    if (username === validUsername && password === validPassword) {
      // Create response
      const response = NextResponse.json({ success: true });
      
      // Set secure HTTP-only cookie
      response.cookies.set({
        name: 'admin_session',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      return response;
    }
    
    return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}
