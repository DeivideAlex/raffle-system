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
    if (!search) throw new Error('Termo de busca (telefone ou email) é obrigatário');
    
    // @ts-ignore
    const normalizedSearch = search.replace(/\D/g, ''); // Para telefone
    
    // @ts-ignore
    const supabaseUrl = process.env.SUPABASE_URL || "https://ggafunjazgsxxjkbmiwv.supabase.co";
    // @ts-ignore
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseKey) {
        throw new Error('Supabase key not configured in Vercel Environment Variables');
    }

    // Buscar por chave (telefone) OU por dentro do JSON (email)
    const query = search.includes('@') 
      ? `value->>email=eq.${search}` 
      : `key=like.purchase:${normalizedSearch}:*`;

    const res = await fetch(`${supabaseUrl}/rest/v1/kv_store_0639182c?select=value&${query}`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
        const err = await res.text();
       return new Response(JSON.stringify({ error: 'Supabase error: ' + err }), { status: 500, headers: corsHeaders });
    }

    const data = await res.json();
    const records = data.map((d: any) => d.value);

    return new Response(JSON.stringify(records), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
