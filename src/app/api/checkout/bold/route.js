import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const data = await request.json();
    const { title, price, email, studentName, orderId, phone } = data;

    // Llaves Bold (Producción por defecto)
    const apiKey = process.env.BOLD_IDENTITY_KEY || 'sXJLbfDixiYWVBlS3eOGNnxXuqbEWRhsVYvhZ_Ct9NM';
    const secretKey = process.env.BOLD_SECRET_KEY || 'zbnVywe9C2jTSJBbhGRzuA';

    const cleanOrderId = orderId || `MPS-${Date.now()}`;
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
    const description = `${title || 'Matrícula Escuela MPS'} - ${studentName || 'Estudiante'}`;

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
