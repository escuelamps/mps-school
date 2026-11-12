import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const data = await request.json();
    const { title, price, email, studentName, orderId, phone } = data;

    // Llaves Bold (exclusivamente desde variables de entorno)
    const apiKey = process.env.BOLD_IDENTITY_KEY;
    const secretKey = process.env.BOLD_SECRET_KEY;

    if (!apiKey || !secretKey) {
      console.error('Error de configuración: BOLD_IDENTITY_KEY o BOLD_SECRET_KEY no configuradas en variables de entorno.');
      return NextResponse.json(
        { error: 'Configuración de pasarela de pago incompleta en el servidor.' },
        { status: 500 }
      );
    }

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
