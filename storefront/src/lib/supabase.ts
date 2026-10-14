import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type ProductRow = Database['public']['Tables']['products']['Row'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase environment variables not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.'
  );
}

function createSupabaseClient(): SupabaseClient<Database> {
  // Placeholder URL/key keeps `next build` from crashing when env is missing.
  // All queries must still guard `isSupabaseConfigured()` / handle empty results.
  return createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-anon-key'
  );
}

export const supabase = createSupabaseClient();

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}