import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _service: SupabaseClient | null = null;

export function getSupabaseService(): SupabaseClient {
  if (!_service) {
    _service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return _service;
}

export const supabaseService = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return (getSupabaseService() as any)[prop];
  },
});
