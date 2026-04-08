export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token) {
      return new Response(JSON.stringify({ 
        error: 'Token do Mercado Pago não configurado nas variáveis de ambiente da Vercel.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Diagnostic log if it fails unauthorized (we use it in the catch block if needed)
    console.log(`Iniciando tentativa de pagamento com token iniciado em: ${token.substring(0, 7)}...`);
    const paymentData = {
      transaction_amount: body.totalAmount,
      description: `Rifa ${body.raffleName} - ${body.numbers.length} números`,
      payment_method_id: 'pix',
      payer: {
        email: body.email || 'comprador@exemplo.com',
        first_name: 'Comprador',
        last_name: 'Rifa',
        phone: {
          number: body.phone
        }
      },
      external_reference: `raffle_${body.raffleId}_${Date.now()}`
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
      // Retorna o erro detalhado do Mercado Pago para debug
      return new Response(JSON.stringify({ 
        error: 'Erro no Mercado Pago (Pagamento)', 
        details: mpData 
      }), {
        status: mpResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Também criar uma preferência para ter um link de checkout como backup
    const preferenceData = {
      items: [
        {
          title: `Rifa ${body.raffleName} - ${body.numbers.length} números`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: body.totalAmount
        }
      ],
      external_reference: paymentData.external_reference
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
        return new Response(JSON.stringify({ 
          error: 'Erro no Mercado Pago (Preferência)', 
          details: prefData 
        }), {
          status: prefResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({
      pix_code: mpData.point_of_interaction.transaction_data.qr_code,
      qr_code_64: mpData.point_of_interaction.transaction_data.qr_code_base64,
      init_point: prefData.init_point,
      paymentId: mpData.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
