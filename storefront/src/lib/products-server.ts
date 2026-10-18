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

export function cleanBrandSlug(rawSlug: string): string {
  if (!rawSlug) return '';
  return rawSlug
    .replace(/^qikink-(t-shirts-|tops-|hoodies-|accessories-|bottomwear-|bags-|drinkware-|home-decor-|kids-clothes-|pet-products-)?/, 'rare-ember-')
    .replace(/-[a-z]{1,3}[0-9]{1,4}$/, '')
    .replace(/^qikink-/, 'rare-ember-');
}

export function cleanWholesaleDescription(text: string): string {
  if (!text) return '';
  let s = text
    .replace(/^Sell full sleeve crop tops \(AOP\) with (?:Qikink|Rare Ember Studio)'s print-on-demand model\..*$/i, 'Crafted in small batches at our Tirupur studio for everyday comfort and durability. 220 GSM 4-way stretch poly-spandex with vibrant, fade-proof all-over print.')
    .replace(/^Design & sell custom dry fit t-shirts with quick-dry fabric.*$/i, 'Engineered for intense workouts and high-heat street sessions. Breathable, moisture-wicking quick-dry fabric with crisp sublimation graphics.')
    .replace(/^Design & sell custom jersey t-shirts in mesh fabric.*$/i, 'Authentic breathable mesh athletic jersey engineered for pitch performance and streetwear layering. Deep sublimation graphics and athletic seams.')
    .replace(/^Design & sell custom oversized jersey T-shirts.*$/i, 'Heavyweight oversized boxy jersey blending 90s basketball aesthetics with modern streetwear drape. Premium breathable mesh with fade-proof graphics.')
    .replace(/^Sell gym\/sports crop tops.*$/i, 'Performance athletic crop top crafted from 220 GSM poly-spandex with 4-way compression stretch and sweat-wicking comfort.')
    .replace(/^Sell custom acrylic photo frames.*$/i, 'Museum-grade crystal clear acrylic photo display paired with a solid wooden stand. High-definition UV print with rich contrast for your desk setup.')
    .replace(/with (?:Qikink|Rare Ember Studio)'s print-on-demand model\./gi, 'crafted with precision in our Tirupur studio.')
    .replace(/\b(?:no minimums|no MOQ|start your brand today|start selling)\b\.?/gi, 'crafted for daily rotation.');
  return s;
}

function cleanDetailsArray(details: string[]): string[] {
  return details
    .map((d) => cleanSentence(cleanWholesaleDescription(d)))
    .filter((d) => d.length > 10 && !/^(compatible with|order as a|unisex .* with custom printing)/i.test(d));
}

function mapRowToProduct(r: ProductRow): Product {
  const description = cleanWholesaleDescription(r.description ?? '');
  const cleanedTitle = cleanBrandTitle(r.title ?? '');
  
  // Extract clean complete first sentence for short description instead of slicing at 140 chars
  const shortText = r.short && r.short.trim().length > 0
    ? cleanSentence(cleanWholesaleDescription(r.short))
    : (description.split(/[.!?]\s+/)[0]?.trim() || 'Premium domestic heavyweight quality with fast express dispatch across India.');

  return {
    id: r.id,
    slug: cleanBrandSlug(r.slug ?? r.id),
    emoji: r.emoji ?? '🔥',
    tag: r.tag ?? '',
    tagColor: r.tag_color ?? '#ff6b35',
    tagBg: r.tag_bg ?? 'rgba(255,107,53,0.12)',
    title: cleanedTitle,
    short: cleanSentence(shortText),
    story: cleanSentence(cleanWholesaleDescription(r.story || description)),
    details: cleanDetailsArray(toStringArray(r.details)),
    price: Number(r.price ?? 0),
    price_inr: (r as any).price_inr != null ? Number((r as any).price_inr) : Math.round(Number(r.price ?? 0) * 85),
    compareAtPrice: r.compare_at_price != null ? Number(r.compare_at_price) : undefined,
    rating: Number(r.rating ?? 0),
    reviews: Number(r.reviews ?? 0),
    category: toCategory(r.category ?? 'general'),
    market: ((r as any).market as 'IN' | 'GLOBAL') || 'GLOBAL',
    supplier: (r as any).supplier || 'RareEmber™ Tirupur Studio',
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
    slug: cleanBrandSlug(p.slug || p.id),
    title: cleanBrandTitle(p.title),
    short: cleanSentence(cleanWholesaleDescription(p.short)),
    story: cleanSentence(cleanWholesaleDescription(p.story)),
    details: cleanDetailsArray(p.details || []),
    image_url: resolvedImg,
    images: resolvedImgs && resolvedImgs.length > 0 ? resolvedImgs : (p.images || [resolvedImg || '']),
  };
}

function findLocalProduct(term: string): Product | null {
  const cleanTerm = term.trim().toLowerCase();
  const cleanedSlug = cleanBrandSlug(cleanTerm);
  const match = localProducts.find((p) => {
    if (p.id.toLowerCase() === cleanTerm || p.slug.toLowerCase() === cleanTerm) return true;
    const pCleanSlug = cleanBrandSlug(p.slug).toLowerCase();
    if (pCleanSlug === cleanedSlug || pCleanSlug === cleanTerm) return true;
    if (cleanBrandSlug(p.id).toLowerCase() === cleanedSlug) return true;
    // Base match without category/sku code
    const pIdBase = p.id.replace(/-[a-z]{1,3}[0-9]{1,4}$/, '').toLowerCase();
    const termBase = cleanTerm.replace(/-[a-z]{1,3}[0-9]{1,4}$/, '').toLowerCase();
    if (pIdBase === termBase || pIdBase.replace(/^qikink-/, '') === termBase.replace(/^rare-ember-/, '')) return true;
    return false;
  });
  return match && !isDisallowedProduct(match) ? sanitizeLocalProduct(match) : null;
}

export async function getProductFromDB(id: string): Promise<Product | null> {
  if (!id) return null;
  const cleanId = id.trim().toLowerCase();
  // Immediate rejection for any medicinal, orthopedic, or pet URL
  if (DISALLOWED_KEYWORDS.some((kw) => cleanId.includes(kw))) {
    return null;
  }

  const cleanedSlug = cleanBrandSlug(cleanId);
  const localMatch = findLocalProduct(cleanId);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return localMatch;
  }
  try {
    const safeCleanId = String(id).trim().replace(/[^a-zA-Z0-9_:-]/g, '').slice(0, 128);
    if (!safeCleanId) return localMatch;

    const sb = createClient<Database>(url, key);
    const meeshoPrefixed = safeCleanId.startsWith('meesho-') ? safeCleanId : `meesho-${safeCleanId}`;
    const unprefixed = safeCleanId.replace(/^meesho-/, '');
    const { data, error } = await sb
      .from('products')
      .select('*')
      .or(`id.eq.${safeCleanId},slug.eq.${safeCleanId},slug.eq.${cleanedSlug},id.eq.${meeshoPrefixed},slug.eq.${meeshoPrefixed},id.eq.${unprefixed},slug.eq.${unprefixed}`)
      .eq('active', true)
      .maybeSingle();

    if (error || !data) {
      return localMatch;
    }
    if (isDisallowedProduct(data)) {
      return null;
    }
    return mapRowToProduct(data);
  } catch {
    return localMatch;
  }
}
