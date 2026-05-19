
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { purchaseId } = req.query;
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const rawSupabaseUrl = process.env.SUPABASE_URL || 'https://ggafunjazgsxxjkbmiwv.supabase.co';
  const supabaseUrl = new URL(rawSupabaseUrl).origin;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!purchaseId) return res.status(400).json({ error: 'purchaseId é obrigatório' });

  try {
    // 1. Busca a compra no banco para obter raffle_id e números
    const purchaseRes = await fetch(
      `${supabaseUrl}/rest/v1/purchases?id=eq.${encodeURIComponent(purchaseId as string)}&select=*`,
      { headers: { apikey: supabaseKey!, Authorization: `Bearer ${supabaseKey}` } }
    );
    const purchaseData = await purchaseRes.json();
    if (!purchaseData || purchaseData.length === 0) {
      return res.status(404).json({ error: 'Compra não encontrada' });
    }
    const purchase = purchaseData[0];

    // Já está pago, retorna sucesso imediato
    if (purchase.status === 'paid') {
      return res.status(200).json({ status: 'approved', already_paid: true });
    }

    // 2. Busca pagamentos no Mercado Pago pelo external_reference
    const searchRes = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(purchaseId as string)}&sort=date_created&criteria=desc`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!searchRes.ok) {
      return res.status(200).json({ status: 'pending', detail: 'MP search failed' });
    }

    const searchData = await searchRes.json();
    const payments = searchData.results || [];

    // Encontra o primeiro pagamento aprovado
    const approvedPayment = payments.find((p: any) => p.status === 'approved');

    if (!approvedPayment) {
      // Retorna o status mais recente para informar o frontend
      const latest = payments[0];
      return res.status(200).json({ status: latest?.status || 'pending' });
    }

    // 3. Pagamento aprovado — atualiza a compra
    await fetch(
      `${supabaseUrl}/rest/v1/purchases?id=eq.${encodeURIComponent(purchaseId as string)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey!,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'paid' }),
      }
    );

    // 4. Atualiza todos os tickets para 'paid'
    const numbers: number[] = purchase.numbers;
    const raffleId: string = purchase.raffle_id;

    for (const num of numbers) {
      await fetch(
        `${supabaseUrl}/rest/v1/tickets?raffle_id=eq.${encodeURIComponent(raffleId)}&number=eq.${num}&status=eq.reserved`,
        {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey!,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'paid' }),
        }
      );
    }

    return res.status(200).json({ status: 'approved', payment_id: approvedPayment.id });
  } catch (error: any) {
    console.error('confirm-payment error:', error);
    return res.status(500).json({ error: error.message });
  }
}
