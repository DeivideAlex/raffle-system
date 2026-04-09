import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    if (path.endsWith('/save-raffle') && req.method === 'POST') {
      const body = await req.json();
      
      // Ensure numeric types are correct for Postgres
      const raffleData = {
        ...body,
        ticketPrice: parseFloat(body.ticketPrice),
        totalNumbers: parseInt(body.totalNumbers)
      };

      const { data, error } = await supabase.from('raffles').upsert(raffleData);
      
      if (error) {
        console.error('Error saving raffle:', error);
        return new Response(JSON.stringify({ error: error.message, details: error.details }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, id: body.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/get-raffles') && req.method === 'GET') {
      const { data, error } = await supabase.from('raffles').select('*').order('createdAt', { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/get-raffle') && req.method === 'GET') {
      const id = url.searchParams.get('id');
      const { data, error } = await supabase.from('raffles').select('*').eq('id', id).single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/update-tickets') && req.method === 'POST') {
      const { raffleId, tickets } = await req.json();
      const ticketsToUpsert = tickets.map((t: any) => ({
        raffleId: raffleId,
        number: parseInt(t.number),
        status: t.status,
        ownerPhone: t.owner,
        ownerEmail: t.email,
        reservedAt: t.reservedAt
      }));
      
      const { error } = await supabase.from('tickets').upsert(ticketsToUpsert, { onConflict: 'raffleId,number' });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/get-tickets') && req.method === 'GET') {
      const raffleId = url.searchParams.get('raffleId');
      const { data, error } = await supabase.from('tickets').select('*').eq('raffleId', raffleId).order('number');
      if (error) throw error;
      const formatted = data.map((t: any) => ({
        number: t.number,
        status: t.status,
        owner: t.ownerPhone,
        email: t.ownerEmail,
        reservedAt: t.reservedAt
      }));
      return new Response(JSON.stringify(formatted), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/get-winners') && req.method === 'GET') {
      const { data, error } = await supabase.from('winners').select('*').order('date', { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/save-winners') && req.method === 'POST') {
      const winners = await req.json();
      const { error } = await supabase.from('winners').upsert(winners);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        init_point: mpData.init_point, sandbox_init_point: mpData.sandbox_init_point, preferenceId: mpData.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/save-purchase') && req.method === 'POST') {
      const body = await req.json();
      const purchaseData = {
        ...body,
        totalAmount: parseFloat(body.totalAmount)
      };
      const { error } = await supabase.from('purchases').upsert(purchaseData);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/my-purchases') && req.method === 'GET') {
      const phone = url.searchParams.get('phone');
      if (!phone) throw new Error('Phone required');
      const { data, error } = await supabase.from('purchases').select('*').eq('phone', phone.replace(/\D/g, ''));
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found: ' + path }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('SERVER ERROR:', error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
