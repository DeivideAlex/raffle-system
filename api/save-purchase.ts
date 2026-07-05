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
    const normalizedPhone = (body.phone || '').replace(/\D/g, '');
    const purchaseId = body.id || `purchase-${normalizedPhone}-${Date.now()}`;

    const rawSupabaseUrl = process.env.SUPABASE_URL || 'https://ggafunjazgsxxjkbmiwv.supabase.co';
    const supabaseUrl = new URL(rawSupabaseUrl).origin;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    // Row sem 'name' (compatível com a tabela atual)
    const baseRow = {
      id: purchaseId,
      raffle_id: body.raffleId,
      numbers: body.numbers,
      phone: normalizedPhone,
      email: body.email || '',
      total_amount: parseFloat(body.totalAmount) || 0,
      status: body.status || 'pending',
      purchase_date: body.purchaseDate || new Date().toISOString(),
    };

    // Row com 'name' (para quando a coluna existir no Supabase)
    const rowWithName = { ...baseRow, name: body.name || '' };

    const postToSupabase = async (row: object) => {
      return fetch(`${supabaseUrl}/rest/v1/purchases`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(row),
      });
    };

    // Tenta salvar com 'name' primeiro
    let res = await postToSupabase(rowWithName);

    // Se o Supabase retornar erro de coluna inexistente (PGRST204), tenta sem 'name'
    if (!res.ok) {
      const errText = await res.text();
      if (errText.includes('PGRST204') || errText.includes("Could not find the 'name' column")) {
        res = await postToSupabase(baseRow);
        if (!res.ok) {
          const err2 = await res.text();
          return new Response(
            JSON.stringify({ error: 'Supabase error: ' + err2 }),
            { status: 500, headers: corsHeaders }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Supabase error: ' + errText }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    return new Response(JSON.stringify({ success: true, id: purchaseId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
