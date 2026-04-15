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
    const id = url.searchParams.get('id');
    if (!id) throw new Error('ID da rifa é obrigatório');

    const rawSupabaseUrl = process.env.SUPABASE_URL || "https://ggafunjazgsxxjkbmiwv.supabase.co";
    const supabaseUrl = new URL(rawSupabaseUrl).origin;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    // Busca na tabela 'raffles'
    const res = await fetch(`${supabaseUrl}/rest/v1/raffles?id=eq.${encodeURIComponent(id)}&select=*`, {
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
    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: 'Rifa não encontrada' }), { status: 404, headers: corsHeaders });
    }

    return new Response(JSON.stringify(data[0]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
