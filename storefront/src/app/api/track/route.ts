import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/validation';
import { getServiceSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Privacy-first first-party analytics beacon.
 * - No cookies, no IP stored, no PII. session_id is a random client token.
 * - Payload validated + size-capped; junk becomes a security signal.
 * - Always answers 204 so the storefront never feels the agent.
 */

const TYPES = new Set(['pageview', 'view_product', 'add_to_cart', 'session_ping', 'click', 'initiate_checkout']);

function clean(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.replace(/\0/g, '').trim();
  return s ? s.slice(0, max) : null;
}

function ipHash(headers: Headers): string {
  return createHash('sha256').update(clientIp(headers)).digest('hex').slice(0, 24);
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`track:${ipHash(req.headers)}`, 120, 60_000);
  let stored = false;
  try {
    if (rl.allowed) {
      const raw = await req.text();
      if (raw.length <= 1_500) {
        let body: Record<string, unknown> | null = null;
        try {
          body = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          body = null;
        }
        const type = body ? String(body.t || '') : '';
        if (body && TYPES.has(type)) {
          const meta = (body.m && typeof body.m === 'object' ? body.m : {}) as Record<string, unknown>;
          const row = {
            type,
            session_id: clean(body.s, 64),
            path: clean(body.p, 300),
            referrer: clean(body.r, 700),
            product_id: clean(body.pr, 200),
            meta: { d: clean(meta.d, 20), q: clean(meta.q, 300), a: clean(meta.a, 100), label: clean(meta.label, 100) },
          };
          const svc = getServiceSupabase();
          if (svc) {
            await svc.from('analytics_events').insert(row);
            stored = true;
          } else {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (url && key) {
              // analytics_events allows anon INSERT only (RLS) — validated above.
              await createClient(url, key).from('analytics_events').insert(row);
              stored = true;
            }
          }
        }
      }
    }
  } catch {
    // Never let analytics affect the storefront experience.
  }
  if (!stored) {
    // Security signal, best-effort, never changes the response.
    try {
      const svc = getServiceSupabase();
      if (svc) {
        await svc
          .from('security_events')
          .insert({ kind: rl.allowed ? 'invalid_beacon' : 'throttled', ip_hash: ipHash(req.headers), detail: { at: 'track' } })
          .then(() => undefined, () => undefined);
      }
    } catch {
      /* ignore */
    }
  }
  return new NextResponse(null, { status: 204 });
}