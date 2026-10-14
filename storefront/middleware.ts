import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge rate limiter (per-IP sliding window, in-memory).
// NOTE: resets on cold start / across regions — use Redis/Upstash in prod.
const buckets = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQ = 120;

function hit(ip: string): boolean {
  const now = Date.now();
  const hits = (buckets.get(ip) || []).filter(t => now - t < WINDOW_MS);
  hits.push(now);
  buckets.set(ip, hits);
  if (buckets.size > 5000) {
    const first = buckets.keys().next().value;
    if (first) buckets.delete(first);
  }
  return hits.length <= MAX_REQ;
}

export function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || (req as any).ip
    || 'unknown';

  // Strict edge block: return HTTP 404 immediately for any blacklisted/medicinal/pet URLs
  const pathname = req.nextUrl.pathname.toLowerCase();
  if (
    /(calmcloud|lickmat|warm-paw|ember-glow|pawtrack|cozy-nest|aesthetic-scratch|smart-fetch|disinfectant|medicine|medicinal|pharma|pharmaceutical|drug|anti-anxiety|veterinary|antibacterial|sanitizer)/i.test(
      pathname
    )
  ) {
    return new NextResponse('404 Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Newsletter + checkout abuse guard (stricter bucket)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const key = `api:${ip}`;
    const now = Date.now();
    const hits = (buckets.get(key) || []).filter(t => now - t < WINDOW_MS);
    hits.push(now);
    buckets.set(key, hits);
    if (hits.length > 30) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
    }
  } else if (!hit(ip)) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
