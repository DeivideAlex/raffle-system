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
    const rawSupabaseUrl = process.env.SUPABASE_URL || 'https://ggafunjazgsxxjkbmiwv.supabase.co';
    const supabaseUrl = new URL(rawSupabaseUrl).origin;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    // Busca todas as compras pagas
    const res = await fetch(
      `${supabaseUrl}/rest/v1/purchases?status=eq.paid&select=raffle_id,total_amount`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: 'Supabase error: ' + err }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const data: { raffle_id: string; total_amount: number }[] = await res.json();

    // Calcula receita total geral
    const totalRevenue = data.reduce((acc, p) => acc + Number(p.total_amount), 0);

    // Agrupa receita por rifa
    const byRaffle: Record<string, number> = {};
    for (const p of data) {
      byRaffle[p.raffle_id] = (byRaffle[p.raffle_id] || 0) + Number(p.total_amount);
    }

    return new Response(
      JSON.stringify({ totalRevenue, byRaffle }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
