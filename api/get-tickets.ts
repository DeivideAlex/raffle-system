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
    const raffleId = url.searchParams.get('raffleId');
    if (!raffleId) throw new Error('raffleId is required');

    const supabaseUrl = process.env.SUPABASE_URL || "https://ggafunjazgsxxjkbmiwv.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseKey) {
      throw new Error('Supabase key not configured');
    }

    // Query the 'tickets' table for this raffle
    const res = await fetch(`${supabaseUrl}/rest/v1/tickets?raffleId=eq.${encodeURIComponent(raffleId)}&select=number,status,ownerPhone,ownerEmail,reservedAt&order=number.asc`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: 'Supabase error: ' + err }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const data = await res.json();
    
    // Map DB columns to frontend format
    const tickets = data.map((t: any) => ({
      number: t.number,
      status: t.status,
      owner: t.ownerPhone || undefined,
      email: t.ownerEmail || undefined,
      reservedAt: t.reservedAt || undefined,
    }));

    return new Response(JSON.stringify(tickets), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
