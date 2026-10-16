import { createClient } from '@supabase/supabase-js';
import { products as localProducts, cleanBrandTitle, type Product, type ProductCategory, type PetType, type AgeGroup } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { resolveProductImages } from '@/lib/data/product-gallery';
import type { Database, Json } from '@/lib/database.types';

type ProductRow = Database['public']['Tables']['products']['Row'];

function toStringArray(value: Json | null | undefined): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function toAgeGroups(value: string[]): AgeGroup[] {
  const allowed: AgeGroup[] = ['puppy', 'adult', 'senior', 'all'];
  const filtered = value.filter((v): v is AgeGroup => (allowed as string[]).includes(v));
  return filtered.length > 0 ? filtered : ['all'];
}

const KNOWN_CATEGORIES: ProductCategory[] = [
  'general',
  'electronics',
  'fashion',
  'home-garden',
  'home-living',
  'pets',
  'beds',
  'toys',
  'tech',
  'decor',
];

export function toCategory(value: string | null | undefined): ProductCategory {
  return (KNOWN_CATEGORIES as string[]).includes(value ?? '')
    ? (value as ProductCategory)
    : 'general';
}

function toPet(value: string): PetType {
  return value === 'dog' || value === 'cat' || value === 'both' ? value : 'both';
}

export { cleanBrandTitle };

function cleanSentence(text: string): string {
  if (!text) return '';
  let s = text.trim();
  s = s.replace(/[-–—\s]+$/, '');
  s = s.replace(/,\s*(?:pr|pre|bio|and|with|for)$/i, '');
  s = s.replace(/\s+(?:bio|Rar|pr|as a Rar)$/i, '');
  if (s && !/[.!?]$/.test(s)) s += '.';
  return s;
}

function cleanDetailsArray(details: string[]): string[] {
  return details
    .map((d) => cleanSentence(d))
    .filter((d) => d.length > 10 && !/^(compatible with|order as a|unisex .* with custom printing)/i.test(d));
}

function mapRowToProduct(r: ProductRow): Product {
  const description = r.description ?? '';
  const cleanedTitle = cleanBrandTitle(r.title ?? '');
  
  // Extract clean complete first sentence for short description instead of slicing at 140 chars
  const shortText = r.short && r.short.trim().length > 0
    ? cleanSentence(r.short)
    : (description.split(/[.!?]\s+/)[0]?.trim() || 'Premium domestic heavyweight quality with fast express dispatch across India.');

  return {
    id: r.id,
    slug: r.slug ?? r.id,
    emoji: r.emoji ?? '🔥',
    tag: r.tag ?? '',
    tagColor: r.tag_color ?? '#ff6b35',
    tagBg: r.tag_bg ?? 'rgba(255,107,53,0.12)',
    title: cleanedTitle,
    short: cleanSentence(shortText),
    story: cleanSentence(r.story || description),
    details: cleanDetailsArray(toStringArray(r.details)),
    price: Number(r.price ?? 0),
    price_inr: (r as any).price_inr != null ? Number((r as any).price_inr) : Math.round(Number(r.price ?? 0) * 85),
    compareAtPrice: r.compare_at_price != null ? Number(r.compare_at_price) : undefined,
    rating: Number(r.rating ?? 0),
    reviews: Number(r.reviews ?? 0),
    category: toCategory(r.category ?? 'general'),
    market: ((r as any).market as 'IN' | 'GLOBAL') || 'GLOBAL',
    supplier: (r as any).supplier || 'Domestic Factory Direct',
    is_trending: Boolean(r.is_trending),
    is_new: Boolean(r.is_new),
    image_url: resolveProductImage(r.id, r.image_url),
    images: resolveProductImages(r.id, r.image_url, r.category ?? 'home-living', toStringArray((r as any).images)),
    gradient: r.gradient || 'linear-gradient(135deg, #fff3e0, #ffe8d6)',
    chapter: r.chapter ?? '',
    pet: toPet(r.pet ?? 'both'),
    ages: toAgeGroups(r.ages ?? ['all']),
    benefits: toStringArray(r.benefits as Json),
    safety: r.safety ?? '',
    vetNote: r.vet_note ?? '',
    subscribeEligible: Boolean(r.subscribe_eligible),
    wash: r.wash ?? '#fff3e0',
    badges: toStringArray(r.badges as Json),
  };
}

export const DISALLOWED_KEYWORDS = [
  'calmcloud',
  'lickmat',
  'warm-paw',
  'ember-glow',
  'pawtrack',
  'cozy-nest',
  'aesthetic-scratch',
  'smart-fetch',
];

export function isDisallowedProduct(p: { id?: string; slug?: string }): boolean {
  if (!p) return true;
  const targetId = `${p.id || ''} ${p.slug || ''}`.toLowerCase();
  return DISALLOWED_KEYWORDS.some((kw) => targetId.includes(kw));
}

// Server-side product fetch: Supabase first, local fallback (never breaks the store).
export async function getProductsFromDB(): Promise<Product[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return localProducts.filter((p) => !isDisallowedProduct(p)).map(sanitizeLocalProduct);
  try {
    const sb = createClient<Database>(url, key);
    const { data, error } = await sb
      .from('products')
      .select('*')
      .eq('active', true)
      .order('chapter', { ascending: true });
    if (error || !data || data.length === 0) return localProducts.filter((p) => !isDisallowedProduct(p)).map(sanitizeLocalProduct);
    const dbProducts = data.filter((r) => !isDisallowedProduct(r)).map(mapRowToProduct);
    const existingIds = new Set(dbProducts.map((p) => p.id));
    const extraLocal = localProducts
      .filter((p) => !existingIds.has(p.id) && !isDisallowedProduct(p))
      .map(sanitizeLocalProduct);
    return [...dbProducts, ...extraLocal];
  } catch {
    return localProducts.filter((p) => !isDisallowedProduct(p)).map(sanitizeLocalProduct);
  }
}

async function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key);
}

/** Homepage: up to `limit` trending products (purely tech, lifestyle, home). */
export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  const sb = await serverClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('products')
        .select('*')
        .eq('active', true)
        .eq('is_trending', true)
        .order('reviews', { ascending: false })
        .limit(30);
      if (!error && data && data.length > 0) {
        const mapped = data.filter((r) => !isDisallowedProduct(r)).map(mapRowToProduct);
        const sorted = mapped.sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews));
        return sorted.slice(0, limit);
      }
    } catch {
      // fall through to local
    }
  }
  return localProducts
    .filter((p) => !isDisallowedProduct(p) && p.is_trending)
    .slice(0, limit);
}

/** Homepage: newest arrivals first (purely tech, lifestyle, home). */
export async function getNewProducts(limit = 8): Promise<Product[]> {
  const sb = await serverClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('products')
        .select('*')
        .eq('active', true)
        .eq('is_new', true)
        .order('created_at', { ascending: false })
        .limit(30);
      if (!error && data && data.length > 0) {
        return data.filter((r) => !isDisallowedProduct(r)).map(mapRowToProduct).slice(0, limit);
      }
    } catch {
      // fall through to local
    }
  }
  return localProducts
    .filter((p) => !isDisallowedProduct(p) && p.is_new)
    .map(sanitizeLocalProduct)
    .slice(0, limit);
}


function sanitizeLocalProduct(p: Product): Product {
  const resolvedImg = resolveProductImage(p.id, p.image_url);
  const resolvedImgs = resolveProductImages(p.id, resolvedImg, p.category, p.images);
  return {
    ...p,
    title: cleanBrandTitle(p.title),
    short: cleanSentence(p.short),
    story: cleanSentence(p.story),
    details: cleanDetailsArray(p.details || []),
    image_url: resolvedImg,
    images: resolvedImgs && resolvedImgs.length > 0 ? resolvedImgs : (p.images || [resolvedImg || '']),
  };
}

export async function getProductFromDB(id: string): Promise<Product | null> {
  if (!id) return null;
  const cleanId = id.trim().toLowerCase();
  // Immediate rejection for any medicinal, orthopedic, or pet URL
  if (DISALLOWED_KEYWORDS.some((kw) => cleanId.includes(kw))) {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    const local = localProducts.find((p) => p.id === id || p.slug === id);
    if (!local || isDisallowedProduct(local)) return null;
    return sanitizeLocalProduct(local);
  }
  try {
    const cleanId = String(id).trim().replace(/[^a-zA-Z0-9_:-]/g, '').slice(0, 128);
    if (!cleanId) return null;

    const sb = createClient<Database>(url, key);
    const meeshoPrefixed = cleanId.startsWith('meesho-') ? cleanId : `meesho-${cleanId}`;
    const unprefixed = cleanId.replace(/^meesho-/, '');
    const { data, error } = await sb
      .from('products')
      .select('*')
      .or(`id.eq.${cleanId},slug.eq.${cleanId},id.eq.${meeshoPrefixed},slug.eq.${meeshoPrefixed},id.eq.${unprefixed},slug.eq.${unprefixed}`)
      .eq('active', true)
      .maybeSingle();
    if (error || !data) {
      const local = localProducts.find((p) => p.id === id || p.slug === id);
      if (!local || isDisallowedProduct(local)) return null;
      return sanitizeLocalProduct(local);
    }
    if (isDisallowedProduct(data)) {
      return null;
    }
    return mapRowToProduct(data);
  } catch {
    const local = localProducts.find((p) => p.id === id || p.slug === id);
    if (!local || isDisallowedProduct(local)) return null;
    return sanitizeLocalProduct(local);
  }
}
