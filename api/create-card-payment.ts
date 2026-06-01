export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    // @ts-ignore
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token) {
      return res.status(500).json({ error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado.' });
    }

    // Validate required fields
    const { cardToken, paymentMethodId, installments, totalAmount, email, docType, docNumber, purchaseId, raffleName, numbers } = body;

    if (!cardToken || !paymentMethodId || !totalAmount || !email || !purchaseId) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando: cardToken, paymentMethodId, totalAmount, email, purchaseId' });
    }

    const paymentData = {
      transaction_amount: parseFloat(totalAmount),
      token: cardToken,
      description: `Rifa ${raffleName || 'Rifa'} - ${numbers?.length || 1} números`,
      installments: parseInt(installments) || 1,
      payment_method_id: paymentMethodId,
      payer: {
        email: email,
        identification: {
          type: docType || 'CPF',
          number: docNumber || '12345678909'
        }
      },
      external_reference: purchaseId,
      notification_url: 'https://raffle-system-chi.vercel.app/api/webhooks'
    };

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `card-${purchaseId}-${Date.now()}`
      },
      body: JSON.stringify(paymentData)
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return res.status(400).json({
        error: 'Erro ao processar pagamento',
        details: mpData
      });
    }

    // Map MP status to our format
    const statusMap: Record<string, string> = {
      approved: 'approved',
      pending: 'pending',
      in_process: 'pending',
      rejected: 'rejected',
      cancelled: 'cancelled'
    };

    return res.status(200).json({
      paymentId: mpData.id,
      status: statusMap[mpData.status] || mpData.status,
      status_detail: mpData.status_detail,
      external_reference: mpData.external_reference,
      // For 3DS or additional action required
      three_ds_info: mpData.three_ds_info || null,
      additional_info: mpData.additional_info || null
    });

  } catch (error: any) {
    console.error('create-card-payment error:', error);
    return res.status(500).json({ error: error.message });
  }
}
