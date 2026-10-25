import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { getCanonicalSiteUrl } from '@/lib/canonical';

/**
 * Supabase Auth Callback Route.
 * Exchanges the auth code for a session and redirects to canonical domain URL.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';
  const siteUrl = getCanonicalSiteUrl();

  if (code) {
    try {
      if (typeof supabase.auth.exchangeCodeForSession === 'function') {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('[Auth Callback] Code exchange error:', error.message);
        }
      }
    } catch (e: any) {
      console.error('[Auth Callback] Exception during code exchange:', e?.message || e);
    }
  }

  // Ensure safe local path redirect to prevent open redirect vulnerabilities
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  const targetUrl = new URL(safeNext, siteUrl);

  return NextResponse.redirect(targetUrl.toString());
}
