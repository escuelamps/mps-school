import { NextResponse } from 'next/server';

export async function GET(request) {
  const authCookie = request.cookies.get('mps_admin_session');
  
  if (!authCookie || !authCookie.value) {
    return NextResponse.json({ username: null, role: null }, { status: 401 });
  }

  try {
    const data = JSON.parse(authCookie.value);
    
    // Fallback retrocompatible para sesiones previas sin campo cargo
    let cargo = data.cargo;
    let cargoTitle = data.cargoTitle;
    if (!cargo && data.role === 'admin') {
      if (data.username === 'lpineda' || data.email === 'lpineda@escuelamps.com') {
        cargo = 'direccion';
        cargoTitle = 'Dirección General';
      } else if (data.username === 'juanse' || data.email === 'juanse@escuelamps.com') {
        cargo = 'coordinacion_academica';
        cargoTitle = 'Coordinación Académica';
      } else {
        cargo = 'direccion';
        cargoTitle = 'Dirección General';
      }
    }

    return NextResponse.json({ 
      username: data.username, 
      role: data.role, 
      cargo: cargo || 'usuario',
      cargoTitle: cargoTitle || 'Usuario MPS',
      email: data.email 
    });
  } catch (e) {
    // Fallback for old sessions that only stored the username string
    return NextResponse.json({ 
      username: authCookie.value, 
      role: 'admin',
      cargo: 'direccion',
      cargoTitle: 'Dirección General'
    });
  }
}
