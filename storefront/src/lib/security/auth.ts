import { timingSafeEqual } from 'crypto';

/**
 * Shared-secret auth for ops endpoints (admin panel, cron worker).
 * Secrets come from env only — never hardcode, never log.
 */

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function extractToken(req: Request): string | null {
  const auth = req.headers.get('authorization') ?? '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim() || null;
  return null;
}

export function requireEnvSecret(name: 'ADMIN_SECRET' | 'CRON_SECRET'): string | null {
  const v = process.env[name];
  return v && v.trim() !== '' ? v.trim() : null;
}

export function isAuthorized(req: Request, expected: string | null): boolean {
  if (!expected) return false;
  const token = extractToken(req);
  if (!token) return false;
  return safeEqual(token, expected);
}

/** Admin panel + admin API. Falls back to CRON_SECRET so one secret can run ops. */
export function isAdmin(req: Request): boolean {
  return (
    isAuthorized(req, requireEnvSecret('ADMIN_SECRET')) ||
    isAuthorized(req, requireEnvSecret('CRON_SECRET'))
  );
}

/** Cron worker (Vercel Cron sends Authorization: Bearer <CRON_SECRET>). */
export function isCron(req: Request): boolean {
  return (
    isAuthorized(req, requireEnvSecret('CRON_SECRET')) ||
    isAuthorized(req, requireEnvSecret('ADMIN_SECRET'))
  );
}
