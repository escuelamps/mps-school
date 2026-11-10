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
    let cargo = null;
    let cargoTitle = null;

    // Bloqueo de cuentas personales antiguas
    if (email === 'william@escuelamps.com' || email === 'juanse@escuelamps.com' || email === 'lpineda@escuelamps.com') {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      }, { status: 401 });
    }

    // Mapeo institucional por CARGOS acordado en reunión de TICs:
    if (email === 'direccion@escuelamps.com') {
      role = 'admin';
      cargo = 'direccion';
      cargoTitle = 'Dirección General';
      username = 'Dirección';
    } else if (email === 'coordinacion@escuelamps.com') {
      role = 'admin';
      cargo = 'coordinacion_academica';
      cargoTitle = 'Coordinación Académica';
      username = 'Coordinación';
    } else if (email === 'administracion@escuelamps.com' || email === 'contabilidad@escuelamps.com') {
      role = 'admin';
      cargo = 'administracion';
      cargoTitle = 'Administración y Contabilidad';
      username = 'Administración';
    } else if (email === 'recepcion@escuelamps.com' || email === 'secretaria@escuelamps.com') {
      role = 'admin';
      cargo = 'recepcion';
      cargoTitle = 'Recepción y Reservas';
      username = 'Recepción';
    } else if (email.startsWith('profe-')) {
      role = 'teacher';
      cargo = 'docente';
      cargoTitle = 'Docente MPS';
      username = username.replace('profe-', '');
    } else if (email.startsWith('estudiante-')) {
      role = 'student';
      cargo = 'estudiante';
      cargoTitle = 'Estudiante MPS';
      username = username.replace('estudiante-', '');
    } else {
      role = 'student';
      cargo = 'estudiante';
      cargoTitle = 'Estudiante MPS';
    }

    // 4. Set the secure session cookie (almacena cargo, username, role y email)
    const sessionData = JSON.stringify({ username, role, cargo, cargoTitle, email });
    const response = NextResponse.json({ success: true, username, role, cargo, cargoTitle });
    
    response.cookies.set({
      name: 'mps_admin_session', // Keeping the name so existing admin works, but it's now a generic session
      value: sessionData, 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4 // 4 horas máximo
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}
