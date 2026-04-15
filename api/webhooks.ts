
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
        
        if (purchaseId && purchaseId.startsWith('purchase:')) {
          const purchaseRes = await fetch(`${supabaseUrl}/rest/v1/kv_store_0639182c?select=value&key=eq.${purchaseId}`, {
            headers: { 'apikey': supabaseKey!, 'Authorization': `Bearer ${supabaseKey}` }
          });
          
          const purchaseData = await purchaseRes.json();
          if (purchaseData && purchaseData.length > 0) {
            const purchase = purchaseData[0].value;
            purchase.status = 'paid';
            
            await fetch(`${supabaseUrl}/rest/v1/kv_store_0639182c`, {
              method: 'POST',
              headers: { 
                'apikey': supabaseKey!, 
                'Authorization': `Bearer ${supabaseKey}`, 
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
              },
              body: JSON.stringify({ key: purchaseId, value: purchase })
            });

            const raffleId = purchase.raffleId;
            const ticketKey = raffleId.startsWith('tickets:') ? raffleId : `tickets:${raffleId.replace('raffle:', '')}`;
            
            const ticketsRes = await fetch(`${supabaseUrl}/rest/v1/kv_store_0639182c?select=value&key=eq.${ticketKey}`, {
              headers: { 'apikey': supabaseKey!, 'Authorization': `Bearer ${supabaseKey}` }
            });
            const ticketsData = await ticketsRes.json();
            
            if (ticketsData && ticketsData.length > 0) {
              let tickets = ticketsData[0].value;
              let changed = false;
              tickets = tickets.map((t: any) => {
                if (purchase.numbers.includes(t.number) && t.status === 'reserved') {
                  changed = true;
                  return { ...t, status: 'paid' };
                }
                return t;
              });

              if (changed) {
                await fetch(`${supabaseUrl}/rest/v1/kv_store_0639182c`, {
                  method: 'POST',
                  headers: { 
                    'apikey': supabaseKey!, 
                    'Authorization': `Bearer ${supabaseKey}`, 
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                  },
                  body: JSON.stringify({ key: ticketKey, value: tickets })
                });
              }
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
