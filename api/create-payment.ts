export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.body;
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token) {
      return res.status(500).json({ error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado na Vercel.' });
    }

    // 1. Tentar criar a Preferência PRIMEIRO (Checkout Pro)
    const preferenceData = {
      items: [
        {
          title: `Rifa ${body.raffleName} - ${body.numbers.length} números`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: body.totalAmount
        }
      ],
      external_reference: `raffle_${body.raffleId}_${Date.now()}`
    };

    const prefResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    });
    
    const prefData = await prefResponse.json();

    if (!prefResponse.ok) {
        return res.status(prefResponse.status).json({ 
          error: 'Token Inválido ou sem permissão (Preferência)', 
          details: prefData 
        });
    }

    // 2. Agora tentar criar o PIX Direto
    const paymentData = {
      transaction_amount: body.totalAmount,
      description: `Rifa ${body.raffleName} - ${body.numbers.length} números`,
      payment_method_id: 'pix',
      notification_url: 'https://raffle-system-chi.vercel.app/api/webhooks', // URL opcional para retorno
      payer: {
        email: body.email || 'comprador@exemplo.com',
        first_name: 'Comprador',
        last_name: 'Rifa',
        phone: {
          number: body.phone
        }
      },
      external_reference: preferenceData.external_reference
    };

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': Date.now().toString()
      },
      body: JSON.stringify(paymentData)
    });
    
    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return res.status(200).json({
        pix_code: null,
        init_point: prefData.init_point,
        warning: 'Não foi possível gerar PIX direto. Use o Checkout.',
        details: mpData
      });
    }

    return res.status(200).json({
      pix_code: mpData.point_of_interaction.transaction_data.qr_code,
      qr_code_64: mpData.point_of_interaction.transaction_data.qr_code_base64,
      init_point: prefData.init_point,
      paymentId: mpData.id
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
