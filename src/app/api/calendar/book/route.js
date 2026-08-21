import { NextResponse } from 'next/server';
import { createBooking } from '@/lib/calendar';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const data = await request.json();
    const { calendarId, start, end, studentName, studentEmail, teacherName, classType } = data;

    if (!start || !end || !studentEmail) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const targetCalendarId = calendarId || process.env.GOOGLE_CALENDAR_ID;

    // 1. Crear en Google Calendar
    const eventDetails = {
      summary: `Clase de ${classType} - ${studentName}`,
      description: `Clase agendada con ${teacherName} vía Plataforma MPS.`,
      start,
      end,
      studentEmail
    };

    const calendarResult = await createBooking(targetCalendarId, eventDetails);

    if (!calendarResult) {
      return NextResponse.json({ error: 'Fallo al sincronizar con Google Calendar' }, { status: 500 });
    }

    // 2. Guardar respaldo en Firebase
    await addDoc(collection(db, 'reservas'), {
      studentName,
      studentEmail,
      teacherName,
      classType,
      start,
      end,
      googleEventId: calendarResult.id,
      status: 'CONFIRMED',
      createdAt: serverTimestamp()
    });

    return NextResponse.json({ success: true, event: calendarResult });
  } catch (error) {
    console.error('API Error booking:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
