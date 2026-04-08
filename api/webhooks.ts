
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, data } = req.body;
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    // O Mercado Pago envia várias notificações. Só nos interessa quando um pagamento é criado/atualizado.
    if (action === 'payment.created' || action === 'payment.updated' || req.query.topic === 'payment') {
      const paymentId = data?.id || req.query.id;
      
      // Buscar detalhes do pagamento no Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!mpResponse.ok) return res.status(200).send('OK'); // Ignora se não conseguir ler o MP

      const payment = await mpResponse.json();

      // Se o status for 'approved', damos baixa no nosso banco
      if (payment.status === 'approved') {
        const externalReference = payment.external_reference; // ex: raffle_123_456
        
        // Aqui você deve implementar a lógica de mudar o status no seu Banco de Dados (Supabase/LocalStorage/etc)
        // Como o sistema atual usa um KV Store no Supabase para simular persistência:
        console.log(`PAGAMENTO APROVADO: ${externalReference} para o pagamento ${paymentId}`);
        
        // Lógica de atualização (exemplo):
        // 1. Decodificar externalReference para pegar raffleId
        // 2. Buscar os números reservados no Supabase e mudar para 'paid'
      }
    }

    // O Mercado Pago exige que respondamos 200 OK rapidamente
    return res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(200).send('OK'); // Sempre responde 200 para o MP parar de tentar
  }
}
