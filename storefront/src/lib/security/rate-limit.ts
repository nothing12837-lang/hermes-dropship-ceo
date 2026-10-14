/**
 * Minimal in-memory sliding-window rate limiter for API routes.
 * Best-effort on serverless (per-instance memory); still stops casual
 * abuse and is dependency-free. For multi-instance guarantees, swap the
 * Map for Upstash/Vercel KV behind the same interface.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

function prune(now: number, windowMs: number, bucket: Bucket): void {
  while (bucket.hits.length > 0 && bucket.hits[0] <= now - windowMs) {
    bucket.hits.shift();
  }
}

export interface RateLimit {
  allowed: boolean;
  remaining: number;
  resetAfterMs: number;
}

export function checkRateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000,
  now = Date.now()
): RateLimit {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  prune(now, windowMs, bucket);
  if (bucket.hits.length >= limit) {
    return { allowed: false, remaining: 0, resetAfterMs: bucket.hits[0] + windowMs - now };
  }
  bucket.hits.push(now);
  return { allowed: true, remaining: limit - bucket.hits.length, resetAfterMs: windowMs };
}

/** Test/maintenance hook — not used in production code paths. */
export function clearRateLimits(): void {
  buckets.clear();
}
