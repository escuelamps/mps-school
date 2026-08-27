import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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

    const uid = verifyData.users[0].localId;

    // 2. Fetch the user's role from Firestore
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado en la base de datos' }, { status: 403 });
    }

    const userData = userDocSnap.data();

    // 3. Check if user is an admin
    if (userData.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Acceso denegado: No tienes permisos de administrador' }, { status: 403 });
    }

    // 4. Set the secure session cookie
    const response = NextResponse.json({ success: true, username: userData.username || userData.email });
    
    response.cookies.set({
      name: 'mps_admin_session',
      value: userData.username || userData.email, // In a real app, storing a JWT here is better, but this matches proxy.js
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
