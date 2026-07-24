import { NextResponse } from 'next/server';
import { processMessage } from '@/lib/whatsappBot';

// Configuración de Meta
// Estos valores se configurarán en tu entorno local (.env.local) o en Vercel
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'mps_token_secreto_2026';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

/**
 * GET - Para la verificación del Webhook de Meta
 * Meta enviará una solicitud GET a esta URL cuando configures el webhook en su panel.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK VERIFICADO CORRECTAMENTE');
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  
  return new NextResponse('Bad Request', { status: 400 });
}

/**
 * POST - Para recibir los mensajes enviados por los clientes
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Verificamos que el evento provenga de la API de WhatsApp
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      // Si hay un mensaje entrante
      if (messages && messages.length > 0) {
        const message = messages[0];
        const fromNumber = message.from; // Número de teléfono del cliente
        const messageText = message.text?.body; // El texto que envió el cliente
        const phoneNumberId = value.metadata.phone_number_id;

        if (messageText) {
          console.log(`Mensaje recibido de ${fromNumber}: ${messageText}`);

          // Procesamos el mensaje con nuestra lógica del bot
          const replyText = processMessage(messageText);

          // Enviamos la respuesta usando la API de Meta
          await sendMessage(phoneNumberId, fromNumber, replyText);
        }
      }
      
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Error procesando el webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Función auxiliar para enviar un mensaje usando Meta Cloud API
 */
async function sendMessage(phoneNumberId, to, text) {
  if (!WHATSAPP_TOKEN) {
    console.warn('WHATSAPP_TOKEN no configurado. Mensaje simulado en consola:');
    console.log(`A -> ${to}: ${text}`);
    return;
  }

  const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
  
  const data = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: { body: text }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error enviando el mensaje a Meta:', errorData);
    } else {
      console.log(`Mensaje enviado correctamente a ${to}`);
    }
  } catch (error) {
    console.error('Fallo en la petición fetch a Meta:', error);
  }
}
