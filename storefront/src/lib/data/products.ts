export type ProductCategory = 'general' | 'electronics' | 'fashion' | 'home-garden' | 'home-living' | 'pets' | 'beds' | 'toys' | 'tech' | 'decor' | 'lifestyle';
export type PetType = 'dog' | 'cat' | 'both';
export type AgeGroup = 'puppy' | 'adult' | 'senior' | 'all';

export interface Product {
  id: string;
  slug: string;
  emoji: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  title: string;
  short: string;
  story: string;
  details: string[];
  price: number;
  price_inr?: number;
  compareAtPrice?: number;
  compare_at_price?: number;
  old_price?: number;
  rating: number;
  reviews: number;
  image_url?: string;
  images?: string[];
  category?: ProductCategory;
  market?: 'IN' | 'GLOBAL';
  supplier?: string;
  is_trending?: boolean;
  is_new?: boolean;
  gradient: string;
  chapter?: string;
  pet?: PetType;
  ages?: AgeGroup[];
  benefits?: string[];
  safety?: string;
  vetNote?: string;
  subscribeEligible?: boolean;
  wash?: string;
  badges?: string[];
  stock?: number;
  active?: boolean;
  name?: string;
  isPrebuilt?: boolean;
  isCustomBlank?: boolean;
  lockedGraphicTitle?: string;
  lockedGraphicPlacement?: string;
  lockedAccentHex?: string;
  lockedSvgMotif?: string;
  subtitle?: string;
  subCategory?: string;
  collection?: string;
  badge?: string;
  sizes?: string[];
  colors?: string[];
  colorImages?: Record<string, string>;
  qikinkSkuPrefix?: string;
  qikinkClientProductId?: string;
  qikinkPrintType?: string;
  sizeChartLink?: string;
  variants?: Array<{
    product_sku?: string;
    variant_sku: string;
    color: string;
    size: string;
    cost_price?: string;
    selling_price: number;
    variant_image?: string;
  }>;
  image?: string;
}

import qikinkCatalog from './qikink-products.json';

export const USD_TO_INR_RATE = 85;

export function getClientMarket(): 'IN' | 'GLOBAL' {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('rareember_market', 'IN');
    } catch {}
  }
  return 'IN';
}

export function formatPrice(num: number, _marketOverride?: 'IN' | 'GLOBAL'): string {
  const val = num >= 80 ? Math.round(num) : Math.round(num * USD_TO_INR_RATE);
  return `₹${val.toLocaleString('en-IN')}`;
}

export function cleanBrandTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/\|\s*[A-Z0-9-]{2,10}/gi, '')
    .replace(/\b(qikink|ut58|cc32|ms65|fc38|fa30|uj31|fd16|ur50|ua22|ut27|mt45|ut68|uc61|us22|uh32|uh62|uh83|mp25)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeDiscount(rawPrice: number, rawCompare?: number, priceInr?: number): number | undefined {
  if (!rawCompare || rawCompare <= 0) return undefined;
  const actualPriceInr = priceInr && priceInr > 0 
    ? priceInr 
    : (rawPrice >= 80 ? rawPrice : Math.round(rawPrice * USD_TO_INR_RATE));
  const actualCompareInr = rawCompare >= 80 
    ? rawCompare 
    : Math.round(rawCompare * USD_TO_INR_RATE);
  if (actualCompareInr <= actualPriceInr) return undefined;
  const pct = Math.round((1 - actualPriceInr / actualCompareInr) * 100);
  if (pct < 5 || pct > 80) return undefined;
  return pct;
}

export const SHOP_CATEGORIES = [
  { id: 'fashion', label: 'Streetwear Apparel', count: 86, hint: 'Heavyweight Tees, 380 GSM Hoodies & Sweatshirts', emoji: '👕' },
  { id: 'home-garden', label: 'Artisan Drinkware & Living', count: 30, hint: 'Ceramic Stoneware, Mugs & Coasters', emoji: '☕' },
  { id: 'electronics', label: 'Desk & Creator Setup', count: 5, hint: 'Extended Gaming Desk Mats & Precision Pads', emoji: '🖥️' },
  { id: 'general', label: 'Bags & Everyday Essentials', count: 26, hint: 'Reinforced Canvas Totes, Scarves & Accessories', emoji: '🎒' },
];


export const products: Product[] = qikinkCatalog as unknown as Product[];

export const PET_META: Record<string, any> = {
  dog: { emoji: '🐕', label: 'For Dogs', color: '#9a3412', bg: '#fff7ed' },
  cat: { emoji: '🐈', label: 'For Cats', color: '#831843', bg: '#fdf2f8' },
  both: { emoji: '🐾', label: 'For Pets', color: '#0f172a', bg: '#f1f5f9' },
};

export const bundles: Record<string, string[]> = {};

export function getProduct(id: string): Product | undefined {
  if (!id) return undefined;
  const cleanId = id.trim().toLowerCase();
  return products.find((p) => 
    p.id.toLowerCase() === cleanId || 
    p.slug.toLowerCase() === cleanId ||
    (p.qikinkClientProductId && cleanId.includes(p.qikinkClientProductId))
  );
}
