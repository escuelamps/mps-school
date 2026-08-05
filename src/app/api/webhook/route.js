import { NextResponse } from 'next/server';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'escuelamps_secreto_2026';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// Memoria temporal para guardar el estado de cada usuario (en producción usaríamos una base de datos)
const userSessions = new Map();

async function sendMessage(to, text) {
  if (!WHATSAPP_TOKEN || !PHONE_ID) {
    console.error('Falta WHATSAPP_TOKEN o PHONE_ID en .env.local');
    return;
  }
  try {
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
    if (!res.ok) console.error('Error de Meta API:', await res.text());
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WEBHOOK VERIFICADO EXITOSAMENTE POR META');
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.object) {
      if (
        body.entry && body.entry[0].changes && body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // Número del cliente
        const msg_body = message.text?.body?.trim() || '';
        
        console.log(`📩 Mensaje de ${from}: ${msg_body}`);

        // LÓGICA DEL BOT (Árbol de decisión)
        let state = userSessions.get(from) || 'MENU_PRINCIPAL';

        // Si escriben 'menu', 'hola', 'salir', reiniciamos
        if (msg_body.toLowerCase().match(/^(hola|menu|menú|salir|volver|inicio)$/)) {
          state = 'MENU_PRINCIPAL';
        }

        switch (state) {
          case 'MENU_PRINCIPAL':
            await sendMessage(from, "¡Hola! 🎵 Bienvenido a la Escuela de Música MPS.\n\n¿En qué te podemos ayudar hoy? Responde con el número de tu opción:\n\n1️⃣ Oferta Académica y Programas\n2️⃣ Tarifas y Horarios\n3️⃣ Proceso de Inscripción\n4️⃣ Hablar con un asesor humano");
            userSessions.set(from, 'ESPERANDO_OPCION_PRINCIPAL');
            break;

          case 'ESPERANDO_OPCION_PRINCIPAL':
            if (msg_body === '1') {
              await sendMessage(from, "🎸 *Nuestra Oferta Académica*\nSelecciona el área de tu interés:\n\n1. Área de Música (Instrumentos y Canto)\n2. Producción Musical & DJ\n3. Actuación / Artes Escénicas\n4. Fotografía y Eventos\n\n*(Escribe 0 para volver al menú principal)*");
              userSessions.set(from, 'ESPERANDO_PROGRAMA');
            } else if (msg_body === '2') {
              await sendMessage(from, "Para darte la información exacta de precios y horarios, ¿el estudiante es niño o adulto?\n\n1. Niño (2 a 12 años)\n2. Joven o Adulto (13+ años)");
              userSessions.set(from, 'ESPERANDO_EDAD');
            } else if (msg_body === '3') {
              await sendMessage(from, "📝 *Proceso de Inscripción*\n\n¡Inscribirte es muy fácil! No requieres conocimientos previos.\n1. Llena nuestro formulario en la web.\n2. Realiza el pago de la matrícula.\n3. ¡Comienza tus clases!\n\n👉 Enlace: https://escuelamps.com/inscripcion\n\n*(Escribe 'menu' para volver)*");
              userSessions.set(from, 'MENU_PRINCIPAL');
            } else if (msg_body === '4') {
              await sendMessage(from, "👤 Un asesor humano de la Escuela MPS ha sido notificado y te responderá por aquí mismo en unos minutos. ¡Gracias por tu paciencia!");
              userSessions.set(from, 'PAUSADO_ASESOR_HUMANO');
            } else if (msg_body === '0') {
              userSessions.set(from, 'MENU_PRINCIPAL');
              await sendMessage(from, "¿En qué más te puedo ayudar?\n1. Programas\n2. Tarifas\n3. Inscripción\n4. Asesor");
              userSessions.set(from, 'ESPERANDO_OPCION_PRINCIPAL');
            } else {
              await sendMessage(from, "⚠️ Por favor responde con un número del 1 al 4.");
            }
            break;

          case 'ESPERANDO_PROGRAMA':
            if (msg_body === '1') {
              await sendMessage(from, "🎹 *Área de Música*\n¿Qué instrumento te interesa?\n\n1. Técnica Vocal y Canto\n2. Guitarra\n3. Bajo\n4. Piano y Teclados\n5. Batería y Percusión\n6. Violín\n7. Instrumentos de Viento\n\n*(Escribe 0 para volver)*");
              userSessions.set(from, 'ESPERANDO_INSTRUMENTO');
            } else if (['2', '3', '4'].includes(msg_body)) {
              await sendMessage(from, `Genial, has elegido la opción ${msg_body}. Puedes ver todos los detalles, módulos y profesores de esta cátedra directamente en nuestra página web:\n\n👉 https://escuelamps.com/quienes-somos\n\n*(Escribe 'menu' para volver al inicio)*`);
              userSessions.set(from, 'MENU_PRINCIPAL');
            } else if (msg_body === '0') {
              userSessions.set(from, 'MENU_PRINCIPAL');
              await sendMessage(from, "Volviendo al menú principal... Escribe 'hola'.");
            } else {
              await sendMessage(from, "⚠️ Por favor responde con un número del 1 al 4.");
            }
            break;

          case 'ESPERANDO_INSTRUMENTO':
            if (['1','2','3','4','5','6','7'].includes(msg_body)) {
              await sendMessage(from, "🎵 ¡Excelente elección! Nuestras clases son 100% prácticas.\n\nPuedes ver toda la info de esta cátedra aquí: https://escuelamps.com/quienes-somos\n\n¿Quieres saber los horarios y precios?\nResponde: *menu* y luego elige la opción 2.");
              userSessions.set(from, 'MENU_PRINCIPAL');
            } else if (msg_body === '0') {
              userSessions.set(from, 'MENU_PRINCIPAL');
              await sendMessage(from, "Escribe 'hola' para ver el menú principal nuevamente.");
            } else {
              await sendMessage(from, "⚠️ Selecciona un instrumento del 1 al 7.");
            }
            break;

          case 'ESPERANDO_EDAD':
            if (msg_body === '1') {
              await sendMessage(from, "👶 *Planes Infantiles (2 a 12 años)*\nContamos con estimulación temprana e iniciación musical. Horarios flexibles en las tardes y sábados en la mañana.\nValor mensualidad: $150.000 COP.\n\nPara agendar tu primera clase, escribe '4' (Asesor humano) o 'menu'.");
              userSessions.set(from, 'MENU_PRINCIPAL');
            } else if (msg_body === '2') {
              await sendMessage(from, "👨‍🎤 *Planes Jóvenes y Adultos*\nClases personalizadas o grupales. Horarios de lunes a sábado según disponibilidad.\nValor mensualidad: $180.000 COP.\n\nPara agendar tu primera clase, escribe '4' (Asesor humano) o 'menu'.");
              userSessions.set(from, 'MENU_PRINCIPAL');
            } else {
              await sendMessage(from, "⚠️ Por favor responde '1' para Niño o '2' para Adulto.");
            }
            break;

          case 'PAUSADO_ASESOR_HUMANO':
            // El bot se queda callado para dejar que el humano hable
            // Si el admin quiere reiniciar al usuario, el usuario tendría que enviar una palabra clave oculta
            if (msg_body === 'REINICIAR_BOT') {
              userSessions.set(from, 'MENU_PRINCIPAL');
              await sendMessage(from, "Bot reiniciado.");
            }
            break;

          default:
            userSessions.set(from, 'MENU_PRINCIPAL');
            break;
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
