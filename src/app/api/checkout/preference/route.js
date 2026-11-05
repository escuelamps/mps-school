import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request) {
  try {
    const data = await request.json();
    const { title, price, email, studentName, orderId } = data;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      // Si aún no han colocado el token en producción, retornamos simulación limpia
      return NextResponse.json({
        success: true,
        isSimulated: true,
        message: 'Credencial MERCADOPAGO_ACCESS_TOKEN pendiente por configurar.'
      });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const host = process.env.NEXT_PUBLIC_BASE_URL || 'https://escuelamps.com';

    const response = await preference.create({
      body: {
        items: [
          {
            id: orderId || 'MPS-REGISTRO',
            title: title || 'Curso / Matrícula Escuela MPS',
            unit_price: Number(price),
            quantity: 1,
            currency_id: 'COP'
          }
        ],
        payer: {
          email: email,
          name: studentName
        },
        payment_methods: {
          excluded_payment_types: [
            { id: 'ticket' } // Excluir pago en efectivo físico tipo Efecty
          ],
          installments: 12
        },
        back_urls: {
          success: `${host}/checkout?status=approved&order=${orderId || ''}`,
          failure: `${host}/checkout?status=failure&order=${orderId || ''}`,
          pending: `${host}/checkout?status=pending&order=${orderId || ''}`
        },
        auto_return: 'approved'
      }
    });

    return NextResponse.json({
      success: true,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      id: response.id
    });

  } catch (error) {
    console.error('Error creando preferencia Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Error procesando pasarela de pago' },
      { status: 500 }
    );
  }
}
