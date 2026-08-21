import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    let userDoc = null;

    try {
      // 1. Conectarnos a Firebase para buscar al administrador
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs, query, where, addDoc } = await import('firebase/firestore');

      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('username', '==', username), where('password', '==', password));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        userDoc = querySnapshot.docs[0].data();
      } else {
        // Auto-crear si la base de datos está vacía
        const allAdmins = await getDocs(adminsRef);
        if (allAdmins.empty) {
          if (username === 'lpineda' && password === 'escuelamps2026*') {
            await addDoc(adminsRef, { username: "lpineda", password: "escuelamps2026*" });
            await addDoc(adminsRef, { username: "william", password: "william2026*" });
            userDoc = { username: "lpineda" };
          } else if (username === 'william' && password === 'william2026*') {
            await addDoc(adminsRef, { username: "lpineda", password: "escuelamps2026*" });
            await addDoc(adminsRef, { username: "william", password: "william2026*" });
            userDoc = { username: "william" };
          }
        }
      }
    } catch (firebaseError) {
      console.error("Firebase Auth Error, usando fallback local:", firebaseError);
    }

    // FALLBACK LOCAL: Si Firebase falló por red/grpc, igual los dejamos entrar si la clave es correcta
    if (!userDoc) {
      if (username === 'lpineda' && password === 'escuelamps2026*') userDoc = { username: 'lpineda' };
      if (username === 'william' && password === 'william2026*') userDoc = { username: 'william' };
    }

    if (userDoc) {
      const response = NextResponse.json({ success: true, username: userDoc.username });
      
      response.cookies.set({
        name: 'mps_admin_session',
        value: userDoc.username,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      });
      
      return response;
    }
    
    return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}
