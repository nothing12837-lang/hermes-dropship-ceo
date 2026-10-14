/**
 * Shared input validation for API routes (pure functions — unit-tested).
 * Keep limits tight: these run before any DB or upstream call.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ORDER_ID_RE = /^[a-zA-Z0-9_-]{4,64}$/;
const SKU_RE = /^[a-zA-Z0-9_:-]{2,64}$/;

export function isValidEmail(v: unknown): v is string {
  return typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v.trim());
}

export function normalizeEmail(v: unknown): string | null {
  if (!isValidEmail(v)) return null;
  return (v as string).toLowerCase().trim();
}

export function isValidOrderId(v: unknown): v is string {
  return typeof v === 'string' && ORDER_ID_RE.test(v.trim());
}

export function isValidSku(v: unknown): v is string {
  return typeof v === 'string' && SKU_RE.test(v.trim());
}

export interface CheckoutItemInput {
  id: string;
  qty: number;
}

export function sanitizeCheckoutItems(v: unknown): CheckoutItemInput[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > 50) return null;
  const out: CheckoutItemInput[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== 'object') return null;
    const { id, qty } = raw as { id?: unknown; qty?: unknown };
    if (typeof id !== 'string' || id.length === 0 || id.length > 128) return null;
    const q = Math.floor(Number(qty));
    if (!Number.isFinite(q) || q < 1 || q > 99) return null;
    out.push({ id: id.trim(), qty: q });
  }
  return out;
}

export function sanitizeMessage(v: unknown, max = 1000): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim().replace(/\0/g, '');
  if (t.length === 0 || t.length > max) return null;
  return t;
}

export function clientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}
