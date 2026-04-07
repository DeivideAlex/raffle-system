import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { set, get, getByPrefix } from './kv_store.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const path = url.pathname;

  try {
    if (path.endsWith('/health')) {
      return new Response(JSON.stringify({ status: 'ok', version: '2.0' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/test-mp')) {
      const token = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      return new Response(JSON.stringify({ success: !!token }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (path.endsWith('/create-payment') && req.method === 'POST') {
      const body = await req.json();
      const token = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

      const preferenceData = {
        items: [
          {
            title: `Rifa ${body.raffleName} - ${body.numbers.length} números`,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: body.totalAmount
          }
        ],
        payer: {
          phone: { number: body.phone }
        },
        external_reference: `raffle_${body.raffleId}_${Date.now()}`
      };

      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferenceData)
      });
      
      const mpData = await mpResponse.json();

      return new Response(JSON.stringify({
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        preferenceId: mpData.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/save-purchase') && req.method === 'POST') {
      const body = await req.json();
      const purchaseId = `purchase:${body.phone}:${Date.now()}`;
      await set(purchaseId, body);
      return new Response(JSON.stringify({ success: true, id: purchaseId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/my-purchases') && req.method === 'GET') {
      const phone = url.searchParams.get('phone');
      if (!phone) throw new Error('Phone required');
      const records = await getByPrefix(`purchase:${phone}:`);
      return new Response(JSON.stringify(records), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
