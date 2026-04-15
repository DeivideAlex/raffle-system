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
    const url = new URL(req.url);
    const search = url.searchParams.get('phone') || url.searchParams.get('email');
    if (!search) throw new Error('Termo de busca é obrigatório');
    
    const rawSupabaseUrl = process.env.SUPABASE_URL || "https://ggafunjazgsxxjkbmiwv.supabase.co";
    const supabaseUrl = new URL(rawSupabaseUrl).origin;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    let query: string;
    if (search.includes('@')) {
      query = `email=eq.${encodeURIComponent(search)}`;
    } else {
      const normalizedPhone = search.replace(/\D/g, '');
      query = `phone=eq.${encodeURIComponent(normalizedPhone)}`;
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/purchases?${query}&select=*&order=purchase_date.desc`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: 'Supabase error: ' + err }), { status: 500, headers: corsHeaders });
    }

    const data = await res.json();
    const mapped = data.map((p: any) => ({
        id: p.id,
        raffleId: p.raffle_id,
        numbers: p.numbers,
        phone: p.phone,
        email: p.email,
        totalAmount: p.total_amount,
        status: p.status,
        purchaseDate: p.purchase_date
    }));

    return new Response(JSON.stringify(mapped), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
