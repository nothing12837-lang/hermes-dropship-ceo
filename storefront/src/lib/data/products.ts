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
  { id: 'mens-printed', label: "Men's Printed", count: 18, hint: 'Heavyweight DTF & Sublimation Drops', emoji: '🔥' },
  { id: 'printed', label: 'All Graphic Prints', count: 24, hint: 'Every High-Definition Fade-Proof Print', emoji: '✨' },
  { id: 'mens', label: "Men's & Unisex", count: 23, hint: 'Oversized Tees, Hoodies & Jerseys', emoji: '👕' },
  { id: 'womens', label: "Women's Drops", count: 7, hint: 'Baby Tees, Crop Tops & Graphic Dresses', emoji: '👗' },
  { id: 'kids', label: "Kids Streetwear", count: 2, hint: '100% Super Combed Cotton Graphic Tees', emoji: '🧸' },
  { id: 'blanks', label: 'Premium Blanks', count: 8, hint: 'Essential Acid Wash, Tie-Dye & Garment Blanks', emoji: '⚡' },
];


export function enforcePriceFloor(p: Product): Product {
  const pid = (p.id || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  let price = p.price_inr ?? p.price;
  let compare = p.compareAtPrice ?? p.compare_at_price;

  // Preserve test drops / gateway verification price without enforcing higher retail floor
  if (pid.includes('test') || pid.includes('gateway') || p.price === 10 || p.price_inr === 10) {
    return {
      ...p,
      price: 10,
      price_inr: 10,
      compareAtPrice: compare || 99,
      compare_at_price: compare || 99,
    };
  }

  if (pid.includes('64950694') || pid.includes('32476280') || (title.includes('oversized') && title.includes('jersey'))) {
    price = 679;
    compare = 1299;
  } else if ((title.includes('oversized standard') || title.includes('desk mat') || pid.includes('desk-mat')) && price <= 499) {
    price = 649;
    compare = 1199;
  } else if (pid.includes('64953648') || (title.includes('full sleeve') && title.includes('graphic'))) {
    price = 899;
    compare = 1599;
  } else if (pid.includes('64953512') || pid.includes('t-shirt-dress') || pid.includes('maternity-dress') || title.includes('dress')) {
    price = 849;
    compare = 1499;
  } else if (pid.includes('64953544') || pid.includes('32476772') || title.includes('v neck') || title.includes('v-neck')) {
    price = 749;
    compare = 1299;
  } else if (pid.includes('64953576') || pid.includes('32476788') || title.includes('polo')) {
    price = 699;
    compare = 1249;
  } else if (pid.includes('64953600') || pid.includes('32476800') || title.includes('sleeveless')) {
    price = 599;
    compare = 1099;
  } else if (
    ['64953748', '64953702', '64953664', '64953528', '64953488', '32476874', '32476851', '32476764', '32476832', '32476744', '32476681', '32476284'].some((k) => pid.includes(k)) ||
    ["women's classic", "crop top", "tank top", "crop tank", "girl's crew", "boy's crew", "basic t-shirt", "dryfit"].some((k) => title.includes(k))
  ) {
    if (price < 549) price = 549;
    if (!compare || compare < 999) compare = 999;
  } else if (pid.includes('streetwear-duo') || pid.includes('pack-of-2')) {
    price = 1199;
    compare = 1799;
  } else if (pid.includes('founding-50')) {
    price = 1199;
    compare = 1799;
  } else if (pid.includes('workstation')) {
    price = 1399;
    compare = 1999;
  } else if (pid.includes('pack-of-3')) {
    price = 1499;
    compare = 2499;
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
    story: 'Engineered for high-rotation streetwear. Crafted in Tirupur with premium 240 GSM bio-washed cotton and reinforced Lycra collar.',
    details: [
      '2x 240 GSM Heavyweight Oversized Drop-Shoulder Tees',
      '100% Super Combed Bio-Washed Cotton',
      'High-Density Archival Fade-Proof Prints',
      '7-Day Doorstep Replacement Guarantee'
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
      '7-Day Doorstep Replacement Guarantee'
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
    story: 'Your desk daily rotation in one coordinated package. Dispatched directly from our domestic Tirupur hub.',
    details: [
      '1x 900×400mm Extended Precision Desk Mat',
      '1x 240 GSM Combed Cotton Heavyweight Tee',
      '1x 330ml Microwave-Safe Stoneware Ceramic Mug',
      '7-Day Doorstep Replacement Guarantee'
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

// Bundles paused until store reaches 10 successful orders (per strategic roadmap)
export const products: Product[] = (qikinkCatalog as unknown as Product[])
  .filter((p) => !p.id.startsWith('bundle-'))
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
