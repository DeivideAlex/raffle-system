
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, data, type } = req.body;
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const rawSupabaseUrl = process.env.SUPABASE_URL || "https://ggafunjazgsxxjkbmiwv.supabase.co";
    const supabaseUrl = new URL(rawSupabaseUrl).origin;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (action === 'payment.created' || action === 'payment.updated' || req.query.topic === 'payment' || type === 'payment') {
      const paymentId = data?.id || req.query.id || req.body.data?.id;
      if (!paymentId) return res.status(200).send('OK');

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!mpResponse.ok) return res.status(200).send('OK');
      const payment = await mpResponse.json();

      if (payment.status === 'approved') {
        const purchaseId = payment.external_reference; 
        
        if (purchaseId) {
          const purchaseRes = await fetch(`${supabaseUrl}/rest/v1/purchases?id=eq.${encodeURIComponent(purchaseId)}&select=*`, {
            headers: { 'apikey': supabaseKey!, 'Authorization': `Bearer ${supabaseKey}` }
          });
          
          const purchaseData = await purchaseRes.json();
          if (purchaseData && purchaseData.length > 0) {
            const purchase = purchaseData[0];
            
            await fetch(`${supabaseUrl}/rest/v1/purchases?id=eq.${encodeURIComponent(purchaseId)}`, {
              method: 'PATCH',
              headers: { 
                'apikey': supabaseKey!, 
                'Authorization': `Bearer ${supabaseKey}`, 
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'paid' })
            });

            const raffleId = purchase.raffle_id;
            const numbers: number[] = purchase.numbers;
            
            for (const num of numbers) {
              await fetch(`${supabaseUrl}/rest/v1/tickets?raffle_id=eq.${encodeURIComponent(raffleId)}&number=eq.${num}&status=eq.reserved`, {
                method: 'PATCH',
                headers: { 
                  'apikey': supabaseKey!, 
                  'Authorization': `Bearer ${supabaseKey}`, 
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'paid' })
              });
            }
          }
        }
      }
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(200).send('OK');
  }
}
