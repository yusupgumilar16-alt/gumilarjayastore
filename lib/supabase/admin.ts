import { createClient } from '@supabase/supabase-js';

// PENTING: hanya dipakai di server-side (API routes, server actions).
// JANGAN pernah import file ini di komponen client.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL atau SERVICE_ROLE_KEY tidak diset di environment');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}