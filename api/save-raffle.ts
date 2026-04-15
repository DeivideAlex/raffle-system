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
    const body = await req.json();
    const raffleId = body.id || `raffle-${Date.now()}`;
    
    const rawSupabaseUrl = process.env.SUPABASE_URL || "https://ggafunjazgsxxjkbmiwv.supabase.co";
    const supabaseUrl = new URL(rawSupabaseUrl).origin;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    const row = {
      id: raffleId,
      "prizeName": body.prizeName,
      "prizeValue": body.prizeValue,
      "prizeDescription": body.prizeDescription || '',
      "ticketPrice": parseFloat(body.ticketPrice) || 0,
      "totalNumbers": parseInt(body.totalNumbers) || 100,
      "prizeImage": body.prizeImage || '',
      "endDate": body.endDate,
      "winnerNumber": body.winnerNumber ?? null,
      status: body.status || 'active',
      type: body.type || 'numbers',
      "createdAt": body.createdAt || new Date().toISOString(),
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/raffles`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(row)
    });
    
    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: 'Supabase error: ' + err }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, id: raffleId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
