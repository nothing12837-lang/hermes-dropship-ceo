export type ProductCategory = 'general' | 'electronics' | 'fashion' | 'home-garden' | 'home-living' | 'pets' | 'beds' | 'toys' | 'tech' | 'decor' | 'lifestyle' | 'mens' | 'womens' | 'kids';
export type PetType = 'dog' | 'cat' | 'both';
export type AgeGroup = 'puppy' | 'adult' | 'senior' | 'all';

export interface Product {
  id: string;
  slug: string;
  emoji?: string;
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
  gender?: 'men' | 'women' | 'kids';
  is_printed?: boolean;
  print_design_name?: string;
  design_code?: string | null;
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
  const isUsdFloat = num > 0 && num < 60 && !Number.isInteger(num);
  const val = isUsdFloat ? Math.round(num * USD_TO_INR_RATE) : Math.round(num);
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
  const isUsdFloat = (n: number) => n > 0 && n < 60 && !Number.isInteger(n);
  const actualPriceInr = priceInr && priceInr > 0 
    ? priceInr 
    : (isUsdFloat(rawPrice) ? Math.round(rawPrice * USD_TO_INR_RATE) : Math.round(rawPrice));
  const actualCompareInr = isUsdFloat(rawCompare) 
    ? Math.round(rawCompare * USD_TO_INR_RATE) 
    : Math.round(rawCompare);
  if (actualCompareInr <= actualPriceInr) return undefined;
  const pct = Math.round((1 - actualPriceInr / actualCompareInr) * 100);
  if (pct < 5 || pct > 95) return undefined;
  return pct;
}

export const SHOP_CATEGORIES = [
  { id: 'mens-printed', label: "Men's Graphic Drops", count: 18, hint: '240 GSM Combed Cotton Drops' },
  { id: 'printed', label: 'All Graphic Prints', count: 24, hint: 'High-Density Direct-to-Film Prints' },
  { id: 'mens', label: "Men's & Unisex", count: 23, hint: 'Oversized & Full Sleeve Graphic Tees' },
  { id: 'womens', label: "Women's Collection", count: 7, hint: 'Crops, Tees & Typographic Prints' },
  { id: 'kids', label: "Kids Streetwear", count: 2, hint: '180 GSM Bio-Washed Combed Cotton' },
  { id: 'blanks', label: 'Essential Blanks', count: 8, hint: 'Solid Silhouettes & Acid Wash' },
];


export function enforcePriceFloor(p: Product): Product {
  const pid = (p.id || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  let price = p.price_inr ?? p.price;
  let compare = p.compareAtPrice ?? p.compare_at_price;

  // Preserve test drops / gateway verification price without enforcing higher retail floor
  if (pid.includes('verification') || pid.includes('test') || pid.includes('gateway') || p.price === 5 || p.price_inr === 5 || p.price === 10 || p.price_inr === 10) {
    const fixedPrice = p.price_inr === 5 || p.price === 5 || pid.includes('5rs') || pid.includes('verification') ? 5 : 10;
    return {
      ...p,
      price: fixedPrice,
      price_inr: fixedPrice,
      compareAtPrice: compare || 99,
      compare_at_price: compare || 99,
    };
  }

  // 1. Unisex Oversized Jersey — Creator Edition: ₹679 (compare ₹1,299)
  if (pid.includes('64950694') || pid.includes('32476280') || (title.includes('oversized') && title.includes('jersey'))) {
    price = 679;
    compare = 1299;
  }
  // 2. Rare Ember Unisex Oversized Standard T-Shirt & Gaming Pad: ₹649 (compare ₹1,199)
  else if (title.includes('oversized standard') || title.includes('gaming pad') || title.includes('desk mat') || pid.includes('desk-mat') || pid.includes('32476431')) {
    price = 649;
    compare = 1199;
  }
  // 3. Curated Value Combos:
  // The Streetwear Duo (2x Heavyweight Oversized Tees): ₹1,199
  else if (pid.includes('streetwear-duo') || pid.includes('pack-of-2')) {
    price = 1199;
    compare = 1799;
  }
  // The Founding 50 Builder Pack: ₹1,199
  else if (pid.includes('founding-50')) {
    price = 1199;
    compare = 1799;
  }
  // The Creator Workstation Pack: ₹1,399
  else if (pid.includes('workstation')) {
    price = 1399;
    compare = 1999;
  }
  else if (pid.includes('pack-of-3')) {
    price = 1599;
    compare = 2699;
  }
  else if (pid.includes('64953648') || (title.includes('full sleeve') && title.includes('graphic'))) {
    price = 999;
    compare = 1799;
  } else if (pid.includes('64953512') || pid.includes('t-shirt-dress') || pid.includes('maternity-dress') || title.includes('dress')) {
    price = 949;
    compare = 1699;
  } else if (pid.includes('64953544') || pid.includes('32476772') || title.includes('v neck') || title.includes('v-neck')) {
    price = 849;
    compare = 1499;
  } else if (pid.includes('64953576') || pid.includes('32476788') || title.includes('polo')) {
    price = 799;
    compare = 1399;
  } else if (pid.includes('64953600') || pid.includes('32476800') || title.includes('sleeveless') || title.includes('raglan') || title.includes('ringer')) {
    price = 699;
    compare = 1199;
  } else if (
    ['64953748', '64953702', '64953664', '64953528', '64953488', '32476874', '32476851', '32476764', '32476832', '32476744', '32476681', '32476284'].some((k) => pid.includes(k)) ||
    ["women's classic", "crop top", "tank top", "crop tank", "girl's crew", "boy's crew", "basic t-shirt", "dryfit"].some((k) => title.includes(k))
  ) {
    if (price < 649) price = 649;
    if (!compare || compare < 1099) compare = 1099;
  } else if (pid.includes('hoodie')) {
    price = 1399;
    compare = 2699;
  }

  return {
    ...p,
    price,
    price_inr: price,
    compareAtPrice: compare,
    compare_at_price: compare,
  };
}

export const BUNDLE_FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'bundle-streetwear-duo',
    slug: 'bundle-streetwear-duo',
    title: 'The Streetwear Duo — 2x Heavyweight Oversized Tees',
    short: 'Two signature 240 GSM super combed cotton oversized tees with fade-proof archival screen prints.',
    story: 'Engineered for high-rotation streetwear. Crafted from premium 240 GSM bio-washed cotton and reinforced Lycra collar.',
    details: [
      '2x 240 GSM Heavyweight Oversized Drop-Shoulder Tees',
      '100% Super Combed Bio-Washed Cotton',
      'High-Density Archival Fade-Proof Prints',
      '7-Day Easy Returns Guarantee'
    ],
    price: 1199,
    price_inr: 1199,
    compareAtPrice: 1799,
    compare_at_price: 1799,
    rating: 4.9,
    reviews: 68,
    tag: 'PACK OF 2 (SAVE ₹600)',
    tagColor: '#FFFFFF',
    tagBg: '#FF4D24',
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    image_url: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/4ca57c6b-67a6-4a41-b841-f050b182fb32.jpg',
    images: [
      'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/4ca57c6b-67a6-4a41-b841-f050b182fb32.jpg',
      'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg'
    ],
    active: true,
    category: 'fashion'
  },
  {
    id: 'bundle-founding-50',
    slug: 'bundle-founding-50',
    title: 'The Founding 50 Builder Pack — 240 GSM Tee + Desk Mat',
    short: 'Heavyweight 240 GSM builder tee paired with a 900×400mm micro-weave precision desk mat.',
    story: 'Designed for engineers, designers, and creators who ship daily. Features archival graphics and water-repellent precision desk surface.',
    details: [
      '1x 240 GSM Heavyweight Oversized Drop-Shoulder Tee',
      '1x 900×400mm Extended Precision Micro-Weave Desk Mat',
      'Zero-Fray 360° Reinforced Edge Stitching',
      '7-Day Easy Returns Guarantee'
    ],
    price: 1199,
    price_inr: 1199,
    compareAtPrice: 1799,
    compare_at_price: 1799,
    rating: 5.0,
    reviews: 52,
    tag: 'BUILDER PACK (SAVE ₹600)',
    tagColor: '#FFFFFF',
    tagBg: '#FF4D24',
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    image_url: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
    images: [
      'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
      'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/variations/b8d5807e-f669-4087-9dd4-a136e0af3e87.webp'
    ],
    active: true,
    category: 'fashion'
  },
  {
    id: 'bundle-workstation',
    slug: 'bundle-workstation',
    title: 'The Creator Workstation Pack — Desk Mat + Tee + Ceramic Mug',
    short: 'Complete setup upgrade: 900×400mm desk mat, 240 GSM heavyweight tee, and 330ml stoneware ceramic mug.',
    story: 'Your desk daily rotation in one coordinated package. Dispatched directly from verified domestic makers.',
    details: [
      '1x 900×400mm Extended Precision Desk Mat',
      '1x 240 GSM Combed Cotton Heavyweight Tee',
      '1x 330ml Microwave-Safe Stoneware Ceramic Mug',
      '7-Day Easy Returns Guarantee'
    ],
    price: 1399,
    price_inr: 1399,
    compareAtPrice: 1999,
    compare_at_price: 1999,
    rating: 4.9,
    reviews: 44,
    tag: 'TRIPLE COMBO (SAVE ₹600)',
    tagColor: '#FFFFFF',
    tagBg: '#FF4D24',
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    image_url: 'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
    images: [
      'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
      'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/variations/b8d5807e-f669-4087-9dd4-a136e0af3e87.webp',
      'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/26/b10e9b51-65a6-43f7-9e93-0e184c5853e9.jpg'
    ],
    active: true,
    category: 'fashion'
  }
];

export const ADULT_SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL'] as const;
export const KIDS_SIZE_ORDER = [
  '0-12M', '12-23M', '24-35M', '36-47M',
  '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5Yrs', '5-6Y',
  '6-7Y', '7Yrs', '7-8Y', '8-9Y', '9Yrs', '9-10Y',
  '10-11Y', '11Yrs', '11-12Y', '12-13Y', '13Yrs', '13-14Y',
] as const;

export function sortSizes(sizes?: string[]): string[] {
  if (!Array.isArray(sizes) || sizes.length === 0) return [];
  // Strict regex for kids sizes: must match month pattern like '0-12M' or year pattern like '5Y' / '5Yrs'
  const isKids = sizes.some(s => (KIDS_SIZE_ORDER as readonly string[]).includes(s) || /^\d+[-–]\d+M$/i.test(s) || /\b\d+Y(?:rs)?\b/i.test(s));
  const order = (isKids ? KIDS_SIZE_ORDER : ADULT_SIZE_ORDER) as readonly string[];
  return [...sizes].sort((a, b) => {
    const idxA = order.indexOf(a as any);
    const idxB = order.indexOf(b as any);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
}

/**
 * Returns the authoritative technical garment specification badge.
 * Binds directly to the product object attributes, never by array index.
 */
export function getGarmentSpecBadge(p?: { title?: string; id?: string; tag?: string; category?: string; subCategory?: string }): string {
  if (!p) return '240 GSM Combed Cotton';
  const str = `${p.title || ''} ${p.id || ''} ${p.subCategory || ''} ${p.tag || ''}`.toLowerCase();

  if (/\b(mat|pad|desk\s*mat|mouse\s*pad|gaming\s*pad)\b|desk-mat/i.test(str)) {
    return 'Extended 900×400mm';
  }
  if (/varsity|bomber/i.test(str)) {
    return '350 GSM Varsity';
  }
  if (/hoodie/i.test(str)) {
    return '380 GSM Heavy Fleece';
  }
  if (/sweatshirt|crewneck|jogger|sweatpant/i.test(str)) {
    return '320 GSM French Terry';
  }
  if (/oversized\s+jersey|jersey/i.test(str)) {
    return '220 GSM Breathable Mesh';
  }
  if (/dryfit|dry fit/i.test(str)) {
    return '180 GSM Quick-Dry Mesh';
  }
  if (/polo/i.test(str)) {
    return '220 GSM Pique Cotton';
  }
  if (/crop/i.test(str)) {
    return '220 GSM Cotton Spandex';
  }
  if (/kid|boy|girl|baby/i.test(str)) {
    return '180 GSM Combed Cotton';
  }
  if (/streetwear-duo|pack-of-2/i.test(str)) {
    return 'Pack of 2 • 240 GSM';
  }
  if (/founding-50|workstation|pack-of-3|bundle/i.test(str)) {
    return 'Multi-Item Value Pack';
  }
  return '240 GSM Combed Cotton';
}

// Bundles paused until store reaches 10 successful orders (per strategic roadmap)
export const products: Product[] = (qikinkCatalog as unknown as Product[])
  .filter((p) => !p.id.startsWith('bundle-'))
  // Filter out squished 1-inch print artifacts (Boy's 64953488 and Girl's 64953664)
  .filter((p) => !String(p.id).includes('64953488') && !String(p.id).includes('64953664'))
  // Gateway/test SKUs are internal fixtures and excluded from public catalog
  .filter((p) => !/(gateway|test[-_ ]?pass|test[-_ ]?sku|sandbox|verification)/i.test(`${p.id} ${p.title}`))
  .map((p) => ({
    ...p,
    sizes: sortSizes(p.sizes),
  }))
  .map(enforcePriceFloor);

export const PET_META: Record<string, any> = {
  dog: { emoji: '🐕', label: 'For Dogs', color: '#9a3412', bg: '#fff7ed' },
  cat: { emoji: '🐈', label: 'For Cats', color: '#831843', bg: '#fdf2f8' },
  both: { emoji: '🐾', label: 'For Pets', color: '#0f172a', bg: '#f1f5f9' },
};

export const bundles: Record<string, string[]> = {};

export function getProduct(id: string): Product | undefined {
  if (!id) return undefined;
  const cleanId = id.trim().toLowerCase();
  const baseId = cleanId.split('__')[0];
  return products.find((p) => 
    p.id.toLowerCase() === baseId || 
    p.slug.toLowerCase() === baseId ||
    p.id.toLowerCase() === cleanId || 
    p.slug.toLowerCase() === cleanId ||
    (p.qikinkClientProductId && (cleanId.includes(p.qikinkClientProductId) || baseId.includes(p.qikinkClientProductId)))
  );
}
