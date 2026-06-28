import { createClient } from '@supabase/supabase-js';

// Browser-side Supabase client — uses anon key, handles session cookies automatically.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
