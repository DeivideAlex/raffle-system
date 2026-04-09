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
    // 1. /save-raffle
    if (path.endsWith('/save-raffle') && req.method === 'POST') {
      const b = await req.json();
      const { error } = await supabase.from('raffles').upsert({
        id: b.id,
        prize_name: b.prizeName,
        prize_value: b.prizeValue,
        prize_description: b.prizeDescription,
        ticket_price: parseFloat(b.ticketPrice || '0'),
        total_numbers: parseInt(b.totalNumbers || '0'),
        prize_image: b.prizeImage,
        end_date: b.endDate,
        winner_number: b.winnerNumber,
        status: b.status || 'active'
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. /get-raffles
    if (path.endsWith('/get-raffles') && req.method === 'GET') {
      const { data, error } = await supabase.from('raffles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const formatted = data.map(r => ({
        id: r.id, prizeName: r.prize_name, prizeValue: r.prize_value, prizeDescription: r.prize_description,
        ticketPrice: r.ticket_price, totalNumbers: r.total_numbers, prizeImage: r.prize_image,
        endDate: r.end_date, winnerNumber: r.winner_number, createdAt: r.created_at
      }));
      return new Response(JSON.stringify(formatted), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. /get-raffle
    if (path.endsWith('/get-raffle') && req.method === 'GET') {
      const id = url.searchParams.get('id');
      const { data, error } = await supabase.from('raffles').select('*').eq('id', id).single();
      if (error) throw error;
      const formatted = {
        id: data.id, prizeName: data.prize_name, prizeValue: data.prize_value, prizeDescription: data.prize_description,
        ticketPrice: data.ticket_price, totalNumbers: data.total_numbers, prizeImage: data.prize_image,
        endDate: data.end_date, winnerNumber: data.winner_number, createdAt: data.created_at
      };
      return new Response(JSON.stringify(formatted), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. /update-tickets
    if (path.endsWith('/update-tickets') && req.method === 'POST') {
      const { raffleId, tickets } = await req.json();
      const rows = tickets.map((t: any) => ({
        raffle_id: raffleId,
        number: parseInt(t.number),
        status: t.status,
        owner_phone: t.owner,
        owner_email: t.email,
        reserved_at: t.reservedAt
      }));
      const { error } = await supabase.from('tickets').upsert(rows, { onConflict: 'raffle_id,number' });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. /get-tickets
    if (path.endsWith('/get-tickets') && req.method === 'GET') {
      const raffleId = url.searchParams.get('raffleId');
      const { data, error } = await supabase.from('tickets').select('*').eq('raffle_id', raffleId).order('number');
      if (error) throw error;
      const formatted = data.map(t => ({
        number: t.number, status: t.status, owner: t.owner_phone, email: t.owner_email, reservedAt: t.reserved_at
      }));
      return new Response(JSON.stringify(formatted), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 6. /create-payment (Mercado Pago)
    if (path.endsWith('/create-payment') && req.method === 'POST') {
      const b = await req.json();
      const token = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ title: `Rifa ${b.raffleName}`, quantity: 1, currency_id: 'BRL', unit_price: b.totalAmount }],
          payer: { phone: { number: b.phone } },
          external_reference: `raffle_${b.raffleId}`
        })
      });
      const data = await res.json();
      return new Response(JSON.stringify({ init_point: data.init_point, preferenceId: data.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 7. /save-purchase
    if (path.endsWith('/save-purchase') && req.method === 'POST') {
      const b = await req.json();
      const { error } = await supabase.from('purchases').upsert({
        id: b.id || `purchase:${b.phone}:${Date.now()}`,
        raffle_id: b.raffleId,
        numbers: b.numbers,
        phone: b.phone.replace(/\D/g, ''),
        email: b.email,
        total_amount: parseFloat(b.totalAmount || '0'),
        status: b.status || 'pending',
        purchase_date: b.purchaseDate || new Date().toISOString()
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.endsWith('/my-purchases') && req.method === 'GET') {
      const term = url.searchParams.get('phone');
      if (!term) throw new Error('Search term required');
      
      const phoneOnly = term.replace(/\D/g, '');
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .or(`phone.eq.${phoneOnly},email.eq.${term}`);
        
      if (error) throw error;
      const formatted = data.map(p => ({
        id: p.id,
        raffleId: p.raffle_id,
        raffleName: p.raffle_name,
        numbers: p.numbers,
        phone: p.phone,
        email: p.email,
        totalAmount: p.total_amount,
        status: p.status,
        purchaseDate: p.purchase_date
      }));
      return new Response(JSON.stringify(formatted), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 9. /get-winners
    if (path.endsWith('/get-winners') && req.method === 'GET') {
      const { data, error } = await supabase.from('winners').select('*').order('date', { ascending: false });
      if (error) throw error;
      const formatted = data.map(w => ({
        id: w.id, raffleId: w.raffle_id, raffleName: w.raffle_name, prizeValue: w.prize_value,
        winnerNumber: w.winner_number, winnerName: w.winner_name, prizeImage: w.prize_image, date: w.date
      }));
      return new Response(JSON.stringify(formatted), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 10. /save-winners
    if (path.endsWith('/save-winners') && req.method === 'POST') {
      const winners = await req.json();
      const rows = winners.map((w: any) => ({
        raffle_id: w.raffleId, raffle_name: w.raffleName, prize_value: w.prizeValue,
        winner_number: w.winnerNumber, winner_name: w.winnerName, prize_image: w.prizeImage, date: w.date
      }));
      const { error } = await supabase.from('winners').upsert(rows);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found: ' + path }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('SERVER ERROR:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
