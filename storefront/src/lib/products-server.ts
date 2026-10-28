import { createClient } from '@supabase/supabase-js';
import { products as localProducts, cleanBrandTitle, enforcePriceFloor, isKidsProduct, type Product, type ProductCategory, type PetType, type AgeGroup } from '@/lib/data/products';
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
  s = s
    .replace(/\bprinting\s+using\.?$/i, 'precision DTF printing.')
    .replace(/\bFeatures\s+s\.?$/i, 'Features reinforced double-needle stitching.')
    .replace(/\bsublimation\s+pri\.?$/i, 'vibrant sublimation printing.')
    .replace(/\band\s+fad\.?$/i, 'and fade-resistant durability.')
    .replace(/[-–—\s]+$/, '')
    .replace(/,\s*(?:pr|pre|bio|and|with|for|privat|priva|con|fad|pri)$/i, '')
    .replace(/\s+(?:bio|Rar|pr|as a Rar|privat|priva|con|fad|pri)$/i, '');
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
    .replace(/^Sell full sleeve crop tops \(AOP\) with (?:Qikink|Rare Ember Studio)'s print-on-demand model\..*$/i, 'Crafted in small batches for everyday comfort and durability. 220 GSM 4-way stretch poly-spandex with vibrant, fade-proof all-over print.')
    .replace(/^Design & sell custom dry fit t-shirts with quick-dry fabric.*$/i, 'Engineered for intense workouts and high-heat street sessions. Breathable, moisture-wicking quick-dry fabric with crisp sublimation graphics.')
    .replace(/^Design & sell custom jersey t-shirts in mesh fabric.*$/i, 'Authentic breathable mesh athletic jersey engineered for pitch performance and streetwear layering. Deep sublimation graphics and athletic seams.')
    .replace(/^Design & sell custom oversized jersey T-shirts.*$/i, 'Heavyweight oversized boxy jersey blending 90s basketball aesthetics with modern streetwear drape. Premium breathable mesh with fade-proof graphics.')
    .replace(/^Sell gym\/sports crop tops.*$/i, 'Performance athletic crop top crafted from 220 GSM poly-spandex with 4-way compression stretch and sweat-wicking comfort.')
    .replace(/^Sell custom acrylic photo frames.*$/i, 'Museum-grade crystal clear acrylic photo display paired with a solid wooden stand. High-definition UV print with rich contrast for your desk setup.')
    .replace(/^Personalized Pens with custom laser engraving.*$/i, 'Precision-crafted metal executive pen with ergonomic balanced weight, smooth blue ballpoint ink, and permanent laser engraving.')
    .replace(/\|\s*[A-Z0-9]{2,6}/gi, '')
    .replace(/(?:with\s+)?custom\s+(?:laser\s+engraving|printing|embroidery|engraving)\s+on\s+Rare\s+Ember\s+Studio,?\s*/gi, '')
    .replace(/on\s+Rare\s+Ember\s+Studio,?\s*/gi, '')
    .replace(/with (?:Qikink|Rare Ember Studio)'s print-on-demand model\./gi, 'crafted with precision from verified domestic makers.')
    .replace(/,?\s*order\s+as\s+a\s+Rare\s+Ember\s+premium[^\n.]*/gi, '')
    .replace(/\b(?:no minimums|no MOQ|start your brand today|start selling)\b\.?/gi, 'crafted for daily rotation.')
    .replace(/,\s*blue\s*$/i, ', smooth blue ballpoint ink.')
    .replace(/,\s*a\s*z\s*$/i, ' with dual interior pockets.')
    .replace(/\bprinting\s+using\.?$/i, 'precision DTF printing.')
    .replace(/\bFeatures\s+s\.?$/i, 'Features reinforced double-needle stitching.')
    .replace(/\bsublimation\s+pri\.?$/i, 'vibrant sublimation printing.')
    .replace(/\band\s+fad\.?$/i, 'and fade-resistant durability.')
    .replace(/[-–—\s]+$/, '')
    .replace(/,\s*(?:pr|pre|bio|and|with|for|privat|priva|con|fad|pri)$/i, '')
    .replace(/\s+(?:bio|Rar|pr|as a Rar|privat|priva|con|fad|pri)$/i, '')
    .trim();
  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }
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
  
  const titleAndId = (cleanedTitle + ' ' + (r.id ?? '')).toLowerCase();
  const isKids = /kid|boy|girl|baby|toddler|infant/i.test(titleAndId);
  const isDeskMat = /desk|pad|mat/i.test(titleAndId);
  const isDrinkware = /mug|cup|bottle|tumbler/i.test(titleAndId);
  const isPen = /pen\b|pens\b|ballpoint|stationery/i.test(titleAndId);

  let tag = r.tag ?? '';
  if (isKids) {
    tag = '180 GSM Combed Cotton';
  } else if (isPen) {
    tag = 'Executive Metal';
  } else if (isDeskMat) {
    tag = 'Extended 900×400mm';
  } else if (isDrinkware) {
    tag = /bottle|tumbler/i.test(titleAndId) ? 'Insulated Steel' : 'Ceramic Stoneware';
  } else if (tag === '240 GSM Combed Cotton' && !/tee|t-shirt|top/i.test(titleAndId)) {
    tag = 'Creator Lifestyle';
  }

  // Extract clean complete first sentence for short description instead of slicing at 140 chars
  let shortText = r.short && r.short.trim().length > 0
    ? cleanSentence(cleanWholesaleDescription(r.short))
    : (description.split(/[.!?]\s+/)[0]?.trim() || 'Premium domestic heavyweight quality with fast express dispatch across India.');

  if (isKids && shortText.includes('240 GSM')) {
    shortText = shortText.replace(/240 GSM/g, '180 GSM');
  }

  return {
    id: r.id,
    slug: cleanBrandSlug(r.slug ?? r.id),
    emoji: isKids ? '👕' : (r.emoji ?? '🔥'),
    tag,
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
    supplier: (r as any).supplier || 'RareEmber™ Direct Studio',
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
  '64953488',
  '64953664',
  '32476832',
  '32476744',
  'girls-crew-neck',
  'boys-crew-neck',
  'baby-romper',
  'rare-ember-gateway-test-pass',
  'gateway-test',
];

export function isDisallowedProduct(p: { id?: string; slug?: string; title?: string; category?: string; gender?: string; sizes?: string[] }): boolean {
  if (!p) return true;
  if (isKidsProduct(p)) return true;
  const targetId = `${p.id || ''} ${p.slug || ''} ${p.title || ''}`.toLowerCase();
  if (/(gateway|test[-_ ]?pass|test[-_ ]?sku|sandbox|verification|10rs|5rs)/i.test(targetId)) return true;
  return DISALLOWED_KEYWORDS.some((kw) => targetId.includes(kw));
}

// Server-side product fetch: Return all genuine Qikink drops with live DB status overrides
export async function getProductsFromDB(): Promise<Product[]> {
  const localList = localProducts.filter((p) => !isDisallowedProduct(p) && !isKidsProduct(p)).map(sanitizeLocalProduct);
  try {
    const supabase = await serverClient();
    if (supabase) {
      const { data: dbRows, error } = (await supabase
        .from('products')
        .select('id, active, price, price_inr, compare_at_price, title')) as any;
      if (!error && Array.isArray(dbRows) && dbRows.length > 0) {
        const dbMap = new Map(dbRows.map((r: any) => [r.id, r]));
        return localList.map((p) => {
          const dbRow = dbMap.get(p.id);
          if (!dbRow) return enforcePriceFloor(p);
          return enforcePriceFloor({
            ...p,
            active: dbRow.active !== false,
            ...(dbRow.price != null ? { price: Number(dbRow.price) } : {}),
            ...(dbRow.price_inr != null ? { price_inr: Number(dbRow.price_inr) } : {}),
            ...(dbRow.compare_at_price != null ? { compareAtPrice: Number(dbRow.compare_at_price), compare_at_price: Number(dbRow.compare_at_price) } : {}),
            ...(dbRow.title ? { title: cleanBrandTitle(dbRow.title) } : {}),
          });
        });
      }
    }
  } catch (err) {
    console.warn('[Products Server] Supabase getProducts warning:', err);
  }
  return localList.map(enforcePriceFloor);
}

async function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key);
}

/** Homepage: up to `limit` trending products */
export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  const prods = await getProductsFromDB();
  return prods.filter((p) => p.active !== false).slice(0, limit);
}

/** Homepage: newest arrivals first */
export async function getNewProducts(limit = 8): Promise<Product[]> {
  const prods = await getProductsFromDB();
  return prods.filter((p) => p.active !== false).slice(0, limit);
}

function sanitizeLocalProduct(p: Product): Product {
  const resolvedImg = resolveProductImage(p.id, p.image_url);
  const resolvedImgs = resolveProductImages(p.id, resolvedImg, p.category, p.images);
  return {
    ...p,
    active: p.active !== false,
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
  if (!term) return null;
  const cleanTerm = term.trim().toLowerCase();
  if (/(gateway|test[-_ ]?pass|test[-_ ]?sku|sandbox|verification|10rs|5rs)/i.test(cleanTerm)) return null;
  const cleanedSlug = cleanBrandSlug(cleanTerm);
  const match = localProducts.find((p) => {
    if (p.id.toLowerCase() === cleanTerm || p.slug.toLowerCase() === cleanTerm) return true;
    if (p.qikinkClientProductId && cleanTerm.includes(p.qikinkClientProductId)) return true;
    if ((cleanTerm === "64950694" || cleanTerm === "64951032") && (p.id.includes(cleanTerm) || p.slug.includes(cleanTerm))) return true;
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
  const local = findLocalProduct(id);
  if (!local) return null;
  try {
    const supabase = await serverClient();
    if (supabase) {
      const { data: dbRow } = (await supabase
        .from('products')
        .select('active, price, price_inr, compare_at_price, title')
        .eq('id', local.id)
        .maybeSingle()) as any;
      if (dbRow) {
        return enforcePriceFloor({
          ...local,
          active: dbRow.active !== false,
          ...(dbRow.price != null ? { price: Number(dbRow.price) } : {}),
          ...(dbRow.price_inr != null ? { price_inr: Number(dbRow.price_inr) } : {}),
          ...(dbRow.compare_at_price != null ? { compareAtPrice: Number(dbRow.compare_at_price), compare_at_price: Number(dbRow.compare_at_price) } : {}),
          ...(dbRow.title ? { title: cleanBrandTitle(dbRow.title) } : {}),
        });
      }
    }
  } catch (err) {
    console.warn('[Products Server] Supabase getProduct warning:', err);
  }
  return enforcePriceFloor(local);
}
