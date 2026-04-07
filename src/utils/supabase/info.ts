export const projectId = "ggafunjazgsxxjkbmiwv";
export const supabaseUrl = "https://ggafunjazgsxxjkbmiwv.supabase.co";

export const getSupabaseFunctionUrl = (functionName: string) => {
  return `${supabaseUrl}/functions/v1/${functionName}`;
};
