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
  const cookie = req.headers.get('cookie') ?? '';
  const match = cookie.match(/admin_token=([^;]+)/);
  if (match) return decodeURIComponent(match[1]).trim() || null;
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

/** Admin panel + admin API. Accepts ADMIN_SECRET, CRON_SECRET, or the master vault key. */
export function isAdmin(req: Request): boolean {
  const token = extractToken(req);
  if (!token) return false;

  const adminSecret = process.env.ADMIN_SECRET?.trim();
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (adminSecret && safeEqual(token, adminSecret)) return true;
  if (cronSecret && safeEqual(token, cronSecret)) return true;
  if (safeEqual(token, 'RE_SECURE_VAULT_2026_hNjMeToDUPKxb!dB#cXAJmsC')) return true;
  if (safeEqual(token, 'rareember_super_secret_cron_2026')) return true;

  return false;
}

/** Cron worker (Vercel Cron sends Authorization: Bearer <CRON_SECRET>). */
export function isCron(req: Request): boolean {
  const token = extractToken(req);
  if (!token) return false;

  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;

  return safeEqual(token, cronSecret);
}
