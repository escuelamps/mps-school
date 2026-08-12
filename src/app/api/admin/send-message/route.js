import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE;

export async function POST(request) {
  try {
    const { to, text } = await request.json();

    if (!to || !text) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    if (!WHATSAPP_TOKEN || !PHONE_ID) {
      console.error('Falta WHATSAPP_TOKEN o PHONE_ID en .env.local');
      return NextResponse.json({ error: 'Falta config' }, { status: 500 });
    }

    // 1. Enviar el mensaje a través de Meta API
    const res = await fetch(`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: text }
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error de Meta API:', errorText);
      return NextResponse.json({ error: 'Error enviando mensaje a Meta' }, { status: 500 });
    }

    // 2. Si se envió bien, guardarlo en Firestore
    const chatRef = doc(db, 'whatsapp_chats', to);
    
    // Actualizar el documento principal del chat y forzar el estado a pausado
    await setDoc(chatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      phone: to,
      updatedAt: serverTimestamp(),
      botState: 'PAUSADO_ASESOR_HUMANO' // Pausar automáticamente el bot
    }, { merge: true });

    // Guardar el mensaje individual como 'admin'
    const messagesRef = collection(chatRef, 'messages');
    await addDoc(messagesRef, {
      text: text,
      sender: 'admin',
      timestamp: serverTimestamp()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
