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
    const winners = await req.json();
    
    const supabaseUrl = process.env.SUPABASE_URL || "https://ggafunjazgsxxjkbmiwv.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseKey) {
      throw new Error('Supabase key not configured in Vercel Environment Variables');
    }

    // Winners is an array — insert each one individually into the 'winners' table
    // We only insert the last item (newest) since previous ones should already be in DB
    const newWinners = Array.isArray(winners) ? winners : [winners];
    
    // Map to the 'winners' table columns
    const rows = newWinners.map((w: any) => ({
      "raffleId": w.raffleId || null,
      "raffleName": w.raffleName,
      "prizeValue": w.prizeValue,
      "winnerNumber": w.winnerNumber,
      "winnerName": w.winnerName,
      "prizeImage": w.prizeImage || null,
      date: w.date || new Date().toISOString(),
    }));

    // Insert into the 'winners' table (allow duplicates since each winner is unique)
    const res = await fetch(`${supabaseUrl}/rest/v1/winners`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(rows)
    });
    
    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: 'Supabase error: ' + err }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
