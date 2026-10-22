import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client that REQUIRES the service-role key.
 *
 * There is deliberately NO fallback to the public anon key.
 *
 * Why: under RLS the anon key cannot read the `orders` table, so any code path
 * that silently fell back to it behaved as if the order did not exist (paid
 * orders never shipped, customer order lookup always returned empty). Worse,
 * while a permissive `FOR INSERT ... WITH CHECK (true)` policy existed on
 * `orders`, the anon key could WRITE a forged row -- including
 * `status = 'paid'` -- which the fulfilment retry worker would then print and
 * ship, unpaid.
 *
 * A missing key must be a loud, visible failure. Never mask it.
 */
export function getServiceSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Throws when the service-role key is missing. Use in server-only code paths. */
export function requireServiceSupabase(): SupabaseClient {
  const sb = getServiceSupabase();
  if (!sb) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. Server-side order, payment and fulfilment operations require it.'
    );
  }
  return sb;
}
