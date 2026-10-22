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
  size?: string;
  color?: string;
  phoneModel?: string;
  customText?: string;
  customPlacement?: string;
  customPosition?: string;
  customScale?: number;
  customTextColor?: string;
  customFont?: string;
  customImage?: string;
  customImageName?: string;
  imageUrl?: string;
  selectedStyle?: string;
}

export function sanitizeCheckoutItems(v: unknown): CheckoutItemInput[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > 50) return null;
  const out: CheckoutItemInput[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== 'object') return null;
    const {
      id,
      qty,
      size,
      color,
      phoneModel,
      customText,
      customPlacement,
      customPosition,
      customScale,
      customTextColor,
      customFont,
      customImage,
      customImageName,
      imageUrl,
      selectedStyle,
    } = raw as Record<string, unknown>;
    if (typeof id !== 'string' || id.length === 0 || id.length > 128) return null;
    const q = Math.floor(Number(qty));
    if (!Number.isFinite(q) || q < 1 || q > 99) return null;
    out.push({
      id: id.trim(),
      qty: q,
      size: typeof size === 'string' && size.length <= 10 ? size.trim() : undefined,
      color: typeof color === 'string' && color.length <= 50 ? color.trim() : undefined,
      phoneModel: typeof phoneModel === 'string' && phoneModel.length <= 50 ? phoneModel.trim() : undefined,
      customText: typeof customText === 'string' && customText.length <= 100 ? customText.trim() : undefined,
      customPlacement: typeof customPlacement === 'string' && customPlacement.length <= 50 ? customPlacement.trim() : undefined,
      customPosition: typeof customPosition === 'string' && ['center', 'pocket', 'mural'].includes(customPosition) ? customPosition : undefined,
      customScale: typeof customScale === 'number' && Number.isFinite(customScale) && customScale >= 50 && customScale <= 200 ? Math.round(customScale) : undefined,
      customTextColor: typeof customTextColor === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(customTextColor) ? customTextColor : undefined,
      customFont: typeof customFont === 'string' && customFont.length <= 100 ? customFont.trim() : undefined,
      customImage: typeof customImage === 'string' && (customImage.startsWith('http://') || customImage.startsWith('https://') || customImage.startsWith('/') || customImage.length <= 2_000_000) ? customImage : undefined,
      customImageName: typeof customImageName === 'string' && customImageName.length <= 100 ? customImageName.trim() : undefined,
      imageUrl: typeof imageUrl === 'string' && imageUrl.length <= 1000 ? imageUrl.trim() : undefined,
      selectedStyle: typeof selectedStyle === 'string' && selectedStyle.length <= 50 ? selectedStyle.trim() : undefined,
    });
  }
  return out;
}

export function sanitizeMessage(v: unknown, max = 1000): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim().replace(/\0/g, '');
  if (t.length === 0 || t.length > max) return null;
  return t;
}

/**
 * Resolve the client IP for rate limiting and abuse controls.
 *
 * The LEFT-most x-forwarded-for entry is supplied by the caller and can be
 * rotated at will, which made every rate limit bypassable. Prefer the edge
 * platform headers, then fall back to the LAST proxy-appended hop.
 */
export function clientIp(headers: Headers): string {
  const platform =
    headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('cf-connecting-ip')?.trim() ||
    headers.get('true-client-ip')?.trim();
  if (platform) return platform;

  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const hops = xff.split(',').map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }

  return headers.get('x-real-ip')?.trim() || 'unknown';
}
