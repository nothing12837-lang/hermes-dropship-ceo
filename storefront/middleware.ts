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
  // Prefer the edge platform header, then the LAST proxy-appended hop.
  // The left-most x-forwarded-for entry is supplied by the caller and can be
  // rotated per request, which made every rate limit bypassable.
  const ip =
    req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    'unknown';

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

  // Razorpay webhooks must never be rate limited: a 429 makes the gateway give
  // up, the order stays unpaid and never ships.
  if (req.nextUrl.pathname.startsWith('/api/webhooks/')) {
    const res = NextResponse.next();
    res.headers.set('X-Content-Type-Options', 'nosniff');
    return res;
  }

  // Newsletter + checkout abuse guard (stricter bucket)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const key = `api:${ip}`;
    const now = Date.now();
    const hits = (buckets.get(key) || []).filter(t => now - t < WINDOW_MS);
    hits.push(now);
    buckets.set(key, hits);
    if (hits.length > 30) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  } else if (!hit(ip)) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

// Narrow the matcher. The previous pattern also matched RSC prefetch requests
// and static assets, so browsing a page consumed the 120/min page budget and
// the 30/min API budget, and real visitors (and crawlers) got 429'd.
export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\.(?:svg|png|jpg|jpeg|webp|gif|ico|webmanifest|txt|xml)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
        { type: 'header', key: 'rsc', value: 'prefetch' },
      ],
    },
  ],
};
