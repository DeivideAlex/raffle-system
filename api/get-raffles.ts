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
    const supabaseUrl = process.env.SUPABASE_URL || "https://ggafunjazgsxxjkbmiwv.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseKey) {
        return new Response(JSON.stringify({ 
          error: 'SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY não configurada na Vercel.',
          hint: 'Adicione as chaves no painel da Vercel (Settings > Environment Variables) para conectar ao banco.' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Use URL-encoded %25 for the PostgREST `like` wildcard character %
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
