import { NextResponse } from 'next/server';

const FIREBASE_API_KEY = "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28";

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token requerido' }, { status: 400 });
    }

    // 1. Verify the Firebase ID token using Google's Identity Toolkit REST API
    const verifyRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token })
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.users || verifyData.users.length === 0) {
      return NextResponse.json({ success: false, message: 'Token inválido o expirado' }, { status: 401 });
    }

    const email = verifyData.users[0].email;
    let role = 'user';
    let username = email.split('@')[0];

    // Determine role by email prefix
    if (email === 'william@escuelamps.com' || email === 'lpineda@escuelamps.com' || email === 'juanse@escuelamps.com') {
        role = 'admin';
    } else if (email.startsWith('profe-')) {
        role = 'teacher';
        username = username.replace('profe-', '');
    } else if (email.startsWith('estudiante-')) {
        role = 'student';
        username = username.replace('estudiante-', '');
    } else {
        // Fallback to student if no prefix is provided for regular users
        role = 'student';
    }

    // 4. Set the secure session cookie (we use JSON to store both username and role)
    const sessionData = JSON.stringify({ username, role, email });
    const response = NextResponse.json({ success: true, username, role });
    
    response.cookies.set({
      name: 'mps_admin_session', // Keeping the name so existing admin works, but it's now a generic session
      value: sessionData, 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}
