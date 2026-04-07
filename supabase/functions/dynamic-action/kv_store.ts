import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function set(key: string, value: any) {
  const { error } = await supabase
    .from('kv_store_0639182c')
    .upsert({ key, value });
  if (error) throw error;
}

export async function get(key: string) {
  const { data, error } = await supabase
    .from('kv_store_0639182c')
    .select('value')
    .eq('key', key)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // ignore not found
  return data ? data.value : null;
}

export async function getByPrefix(prefix: string) {
  const { data, error } = await supabase
    .from('kv_store_0639182c')
    .select('value')
    .like('key', `${prefix}%`);
  if (error) throw error;
  return data ? data.map(d => d.value) : [];
}
