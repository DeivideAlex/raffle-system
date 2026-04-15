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
    const supabaseUrl = "https://ggafunjazgsxxjkbmiwv.supabase.co";
    
    // Tentando chamar a Edge Function que você mencionou
    const res = await fetch(`${supabaseUrl}/functions/v1/dynamic-action`, {
      method: 'POST', // Geralmente Edge Functions usam POST
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'get-raffles' }) // Chute de payload comum
    });
    
    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: 'Supabase error: ' + err }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const raffles = await res.json();

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
