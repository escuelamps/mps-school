import { NextResponse } from 'next/server';
import { getAvailability } from '@/lib/calendar';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || process.env.GOOGLE_CALENDAR_ID;
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    if (!calendarId || !timeMin || !timeMax) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos (calendarId, timeMin, timeMax)' }, { status: 400 });
    }

    const busySlots = await getAvailability(calendarId, timeMin, timeMax);
    
    if (!busySlots) {
      return NextResponse.json({ error: 'No se pudo obtener disponibilidad' }, { status: 500 });
    }

    return NextResponse.json({ busy: busySlots });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
