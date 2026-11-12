import { NextResponse } from 'next/server';

export async function GET(request) {
  const authCookie = request.cookies.get('mps_admin_session');
  
  if (!authCookie || !authCookie.value) {
    return NextResponse.json({ username: null, role: null }, { status: 401 });
  }

  try {
    const data = JSON.parse(authCookie.value);
    
    // Sesión institucional con cargos y roles normalizados
    const cargo = data.cargo || 'direccion';
    const cargoTitle = data.cargoTitle || 'Dirección General';

    return NextResponse.json({ 
      username: data.username, 
      role: data.role, 
      cargo: cargo,
      cargoTitle: cargoTitle,
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
