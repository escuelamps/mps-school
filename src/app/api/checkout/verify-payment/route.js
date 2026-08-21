import { NextResponse } from 'next/server';
import { validatePaymentReceipt } from '@/lib/gemini';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const data = await request.json();
    const { base64Image, mimeType, expectedAmount } = data;

    if (!base64Image) {
      return NextResponse.json({ error: 'Falta la imagen del comprobante' }, { status: 400 });
    }

    // Usar Gemini para validar la imagen
    const validationResult = await validatePaymentReceipt(base64Image, mimeType || 'image/jpeg');

    if (!validationResult) {
      return NextResponse.json({ error: 'Error procesando el comprobante' }, { status: 500 });
    }

    // Lógica de negocio
    const isAmountCorrect = validationResult.monto === expectedAmount || validationResult.monto >= expectedAmount;
    
    // Guardar el comprobante en Firebase para auditoría manual por lpineda
    const receiptRecord = await addDoc(collection(db, 'pagos_pendientes'), {
      ...validationResult,
      expectedAmount,
      status: (validationResult.es_valido && isAmountCorrect) ? 'APPROVED_BY_AI' : 'REQUIRES_MANUAL_REVIEW',
      createdAt: serverTimestamp()
    });

    return NextResponse.json({ 
      success: true, 
      validation: validationResult,
      isAmountCorrect,
      requiresManualReview: !(validationResult.es_valido && isAmountCorrect)
    });
    
  } catch (error) {
    console.error('API Error verify-payment:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
