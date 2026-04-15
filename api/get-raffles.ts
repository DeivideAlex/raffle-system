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
    const rawSupabaseUrl = process.env.SUPABASE_URL || "https://ggafunjazgsxxjkbmiwv.supabase.co";
    const supabaseUrl = new URL(rawSupabaseUrl).origin;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseKey || supabaseKey.length < 50) {
        return new Response(JSON.stringify({ 
          error: 'Chave do Supabase inválida ou não configurada na Vercel.',
          currentKey: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'null',
          hint: 'A chave configurada na Vercel deve começar com eyJ e ser bem longa.' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Voltando para a tabela kv_store que você usava antes
    const res = await fetch(`${supabaseUrl}/rest/v1/kv_store_0639182c?select=value&key=like.raffle:%25`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
        const err = await res.text();
       return new Response(JSON.stringify({ error: 'Supabase error: ' + err }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await res.json();
    const raffles = data.map((d: any) => d.value);

    return new Response(JSON.stringify(raffles), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
