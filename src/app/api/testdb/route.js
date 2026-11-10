import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function GET(request) {
  // Proteger endpoint de prueba: restringido solo a administradores autorizados
  const authCookie = request.cookies.get('mps_admin_session');
  if (!authCookie || !authCookie.value) {
    return NextResponse.json({ success: false, message: 'Acceso no autorizado' }, { status: 401 });
  }

  try {
    const q = query(collection(db, 'cenas'), orderBy('createdAt', 'desc'), limit(10));
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
