import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const data = await request.json();
    const { title, price, email, studentName, orderId, phone } = data;

    // Llaves Bold con soporte multi-variable y fallback de producción
    const rawApiKey = 
      process.env.BOLD_IDENTITY_KEY || 
      process.env.BOLD_API_KEY || 
      process.env.NEXT_PUBLIC_BOLD_IDENTITY_KEY || 
      process.env.NEXT_PUBLIC_BOLD_API_KEY || 
      "sXJLbFDixiYWVBlS3eOGNnxXuqbEWRhsVYvhZ_Ct9NM";

    const rawSecretKey = 
      process.env.BOLD_SECRET_KEY || 
      process.env.NEXT_PUBLIC_BOLD_SECRET_KEY || 
      "zbnVywe9C2jTSJBbhGRzuA";

    const apiKey = String(rawApiKey).trim();
    const secretKey = String(rawSecretKey).trim();

    if (!apiKey || !secretKey) {
      console.error('Error de configuración: Llaves de pasarela Bold no encontradas.');
      return NextResponse.json(
        { error: 'Configuración de pasarela de pago incompleta en el servidor.' },
        { status: 500 }
      );
    }

    // Identificador de orden alfanumérico limpio (Bold exige entre 2 y 60 caracteres alfanuméricos con guiones)
    const cleanOrderId = String(orderId || `MPS-${Date.now()}`)
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 50);

    const amountStr = String(Math.round(Number(price) || 0));
    const currency = 'COP';

    // Firma de integridad requerida por Bold: SHA256(order_id + amount + currency + secret_key)
    const rawSignature = `${cleanOrderId}${amountStr}${currency}${secretKey}`;
    const integritySignature = crypto
      .createHash('sha256')
      .update(rawSignature)
      .digest('hex');

    const host = process.env.NEXT_PUBLIC_BASE_URL || 'https://escuelamps.com';
    const redirectionUrl = `${host}/checkout?status=approved&order=${cleanOrderId}`;

    // Limpieza estricta de descripción: Bold exige máximo 100 caracteres y sin caracteres especiales
    const safeTitle = String(title || 'Matrícula Escuela MPS')
      .replace(/[^\w\sÁÉÍÓÚáéíóúñÑ.,+-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const safeStudent = String(studentName || '')
      .replace(/[^\w\sÁÉÍÓÚáéíóúñÑ]/g, '')
      .trim();
    const rawDesc = safeStudent ? `${safeTitle} - ${safeStudent}` : safeTitle;
    const description = rawDesc.slice(0, 80);

    return NextResponse.json({
      success: true,
      apiKey,
      orderId: cleanOrderId,
      amount: amountStr,
      currency,
      integritySignature,
      description,
      redirectionUrl
    });

  } catch (error) {
    console.error('Error generando firma de integridad Bold:', error);
    return NextResponse.json(
      { error: 'Error procesando pasarela de pago Bold' },
      { status: 500 }
    );
  }
}
