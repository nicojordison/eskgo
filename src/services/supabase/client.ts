/**
 * Configuration adapter reserved for the future Supabase integration.
 * It deliberately does not create a network client in the front-end prototype.
 */
export function getSupabaseConfig() {
  const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env
  if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) return null
  return { url: VITE_SUPABASE_URL, anonKey: VITE_SUPABASE_ANON_KEY }
}
