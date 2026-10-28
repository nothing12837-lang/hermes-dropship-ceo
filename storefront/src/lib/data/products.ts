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
  const rawPrice = p.price_inr ?? p.price;
  let price = (rawPrice != null && !Number.isNaN(Number(rawPrice)) && Number(rawPrice) > 0)
    ? Number(rawPrice)
    : 0;
  const rawCompare = p.compareAtPrice ?? p.compare_at_price;
  let compare = (rawCompare != null && !Number.isNaN(Number(rawCompare)) && Number(rawCompare) > 0)
    ? Number(rawCompare)
    : 0;

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

  // 1. Curated Value Combos
  // - bundle-streetwear-duo (2x Heavyweight 240 GSM Tees): min ₹1,499 (M.R.P. ₹2,499)
  if (pid.includes('bundle-streetwear-duo') || pid.includes('streetwear-duo') || pid.includes('pack-of-2')) {
    if (price < 1499) price = 1499;
    if (compare < 2499) compare = 2499;
  }
  // - bundle-founding-50 (Oversized Tee + Desk Mat): min ₹1,499 (M.R.P. ₹2,499)
  else if (pid.includes('bundle-founding-50') || pid.includes('founding-50')) {
    if (price < 1499) price = 1499;
    if (compare < 2499) compare = 2499;
  }
  // - bundle-workstation (Hoodie + Desk Mat): min ₹1,899 (M.R.P. ₹3,199)
  else if (pid.includes('bundle-workstation') || pid.includes('workstation')) {
    if (price < 1899) price = 1899;
    if (compare < 3199) compare = 3199;
  }
  else if (pid.includes('pack-of-3')) {
    if (price < 1999) price = 1999;
    if (compare < 3299) compare = 3299;
  }
  // Any other bundle combos
  else if (pid.startsWith('bundle-')) {
    if (price < 1499) price = 1499;
    if (compare < 2499) compare = 2499;
  }
  // 2. 350 GSM Contrast-Sleeve Varsity Jacket & Bomber Jacket: min ₹1,499 (M.R.P. ₹2,599)
  else if (
    pid.includes('varsity') || pid.includes('bomber') || pid.includes('uvj') ||
    title.includes('varsity') || title.includes('bomber')
  ) {
    if (price < 1499) price = 1499;
    if (compare < 2599) compare = 2599;
  }
  // 3. 380 GSM Heavyweight Winter Hoodie: min ₹1,399 (M.R.P. ₹2,299)
  else if (pid.includes('hoodie') || title.includes('hoodie') || pid.includes('uhd') || pid.includes('uzhd')) {
    if (price < 1399) price = 1399;
    if (compare < 2299) compare = 2299;
  }
  // 4. 320 GSM Crewneck Sweatshirt & 320 GSM Heavyweight Joggers: min ₹1,099 (M.R.P. ₹1,899)
  else if (
    pid.includes('sweatshirt') || pid.includes('crewneck') || pid.includes('jogger') || pid.includes('sweatpant') ||
    title.includes('sweatshirt') || title.includes('crewneck') || title.includes('jogger') || title.includes('sweatpant') ||
    pid.includes('uss') || pid.includes('ujg')
  ) {
    if (price < 1099) price = 1099;
    if (compare < 1899) compare = 1899;
  }
  // 5. 240 GSM French Terry Oversized Tee, Vintage Acid-Wash Oversized Tee, T-Shirt Dress (64953512) & Men's Full-Sleeve Tee (64953648): min ₹949 (M.R.P. ₹1,699)
  else if (
    pid.includes('64953648') || pid.includes('32477737') || pid.includes('32476824') || pid.includes('mrnfs') ||
    title.includes('full sleeve') || pid.includes('full-sleeve') ||
    pid.includes('64953512') || pid.includes('32476756') || pid.includes('32476736') || pid.includes('t-shirt-dress') || pid.includes('maternity-dress') || title.includes('dress') ||
    title.includes('french terry') || title.includes('terry') || pid.includes('terry') || pid.includes('32476620') || pid.includes('ut27') ||
    title.includes('acid') || pid.includes('acid') || pid.includes('32476438') || pid.includes('uc61') || pid.includes('ate') ||
    title.includes('tie dye') || title.includes('tie-dye') || pid.includes('32476436') || pid.includes('ut58')
  ) {
    if (price < 949) price = 949;
    if (compare < 1699) compare = 1699;
  }
  // 6. 900×400mm Extended Gaming Desk Mat / Pad: min ₹799 (M.R.P. ₹1,399)
  else if (
    title.includes('gaming pad') || title.includes('desk mat') || title.includes('mouse pad') ||
    pid.includes('desk-mat') || pid.includes('desk_mat') || pid.includes('mpad')
  ) {
    if (price < 799) price = 799;
    if (compare < 1399) compare = 1399;
  }
  // 7. Unisex Oversized Mesh Jersey (UJ35 / 64950694) & Men's Polo (220 GSM): min ₹799 (M.R.P. ₹1,399)
  else if (
    pid.includes('64950694') || pid.includes('32476280') || pid.includes('32476281') || pid.includes('uj35') || pid.includes('us02') ||
    (title.includes('oversized') && title.includes('jersey')) || title.includes('mesh jersey') || title.includes('jersey') ||
    pid.includes('64953576') || pid.includes('32476788') || title.includes('polo') || pid.includes('mp25')
  ) {
    if (price < 799) price = 799;
    if (compare < 1399) compare = 1399;
  }
  // 8. Women's Classic Tee, Crop Top, Tank Top, Men's Sleeveless Tee: min ₹699 (M.R.P. ₹1,199)
  else if (
    ['64953748', '64953702', '64953664', '64953528', '64953488', '32476874', '32476851', '32476764', '32476722', '32476716', '32476832', '32476744', '64953600', '32476800'].some((k) => pid.includes(k)) ||
    ["women's classic", "womens classic", "crop top", "tank top", "crop tank", "baby tee", "girl's crew", "boy's crew", "sleeveless", "muscle vest"].some((k) => title.includes(k))
  ) {
    if (price < 699) price = 699;
    if (compare < 1199) compare = 1199;
  }
  // 9. 240 GSM Unisex Oversized Standard T-Shirt & Unisex V-Neck (64953544): min ₹849 (M.R.P. ₹1,499)
  else if (
    pid.includes('64953544') || pid.includes('32476772') || title.includes('v neck') || title.includes('v-neck') ||
    pid.includes('32476431') || title.includes('oversized standard') || title.includes('standard t-shirt') ||
    title.includes('standard crew') || title.includes('classic crew') || title.includes('raglan') || title.includes('ringer') ||
    title.includes('basic t-shirt') || title.includes('dryfit') || title.includes('supima')
  ) {
    if (price < 849) price = 849;
    if (compare < 1499) compare = 1499;
  }
  // 10. Default fallback for standard tees and any other items: min ₹849 (M.R.P. ₹1,499)
  else {
    if (price < 849) price = 849;
    if (compare < 1499) compare = 1499;
  }

  if (compare <= price) {
    compare = Math.max(compare, price + 500);
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
    price: 1499,
    price_inr: 1499,
    compareAtPrice: 2499,
    compare_at_price: 2499,
    rating: 4.9,
    reviews: 68,
    tag: 'PACK OF 2 (SAVE ₹1,000)',
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
    price: 1499,
    price_inr: 1499,
    compareAtPrice: 2499,
    compare_at_price: 2499,
    rating: 5.0,
    reviews: 52,
    tag: 'BUILDER PACK (SAVE ₹1,000)',
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
    title: 'The Creator Workstation Pack — Hoodie + Desk Mat',
    short: 'Complete setup upgrade: 380 GSM heavyweight fleece hoodie paired with 900×400mm precision desk mat.',
    story: 'Your desk daily rotation in one coordinated package. Dispatched directly from verified domestic makers.',
    details: [
      '1x 380 GSM Heavyweight Winter Fleece Hoodie',
      '1x 900×400mm Extended Precision Desk Mat',
      '7-Day Easy Returns Guarantee'
    ],
    price: 1899,
    price_inr: 1899,
    compareAtPrice: 3199,
    compare_at_price: 3199,
    rating: 4.9,
    reviews: 44,
    tag: 'WORKSTATION COMBO (SAVE ₹1,300)',
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

export const CUSTOM_BLANK_PRODUCTS: Product[] = [
  {
    id: 'blank-jersey',
    slug: 'rare-ember-custom-oversized-jersey',
    title: 'Unisex Oversized Jersey | UJ35',
    short: '180 GSM Quick-Dry Mesh Aeroknit athletic jersey for creator custom drops.',
    story: '180 GSM Quick-Dry Mesh Aeroknit athletic jersey for creator custom drops.',
    details: ['180 GSM Quick-Dry Mesh Aeroknit', 'Sublimation / DTF Print Ready', 'Pan-India Express Delivery'],
    tag: '220 GSM Breathable Mesh',
    tagColor: '#FF4D24',
    tagBg: 'rgba(255, 77, 36, 0.1)',
    price: 799,
    price_inr: 799,
    rating: 4.9,
    reviews: 18,
    isCustomBlank: true,
    active: true,
    stock: 50,
    gradient: 'linear-gradient(135deg, #111 0%, #222 100%)',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  },
  {
    id: 'blank-hoodie',
    slug: 'rare-ember-custom-heavyweight-winter-hoodie',
    title: '380 GSM Heavyweight Winter Hoodie',
    short: '380 GSM Combed French Terry Cotton Fleece with double-lined hood.',
    story: '380 GSM Combed French Terry Cotton Fleece with double-lined hood.',
    details: ['380 GSM Combed French Terry', 'Double-Lined Hood', 'Pan-India Express Delivery'],
    tag: '380 GSM Heavy Fleece',
    tagColor: '#FF4D24',
    tagBg: 'rgba(255, 77, 36, 0.1)',
    price: 1399,
    price_inr: 1399,
    rating: 5.0,
    reviews: 24,
    isCustomBlank: true,
    active: true,
    stock: 50,
    gradient: 'linear-gradient(135deg, #111 0%, #222 100%)',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  },
  {
    id: 'blank-crewneck',
    slug: 'rare-ember-custom-winter-crewneck-sweatshirt',
    title: '320 GSM Winter Crewneck Sweatshirt',
    short: '320 GSM Super Combed Terry Fleece with derby ribbed collar.',
    story: '320 GSM Super Combed Terry Fleece with derby ribbed collar.',
    details: ['320 GSM Super Combed Terry Fleece', 'Derby Ribbed Collar', 'Pan-India Express Delivery'],
    tag: '320 GSM French Terry',
    tagColor: '#FF4D24',
    tagBg: 'rgba(255, 77, 36, 0.1)',
    price: 1099,
    price_inr: 1099,
    rating: 4.8,
    reviews: 16,
    isCustomBlank: true,
    active: true,
    stock: 50,
    gradient: 'linear-gradient(135deg, #111 0%, #222 100%)',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  },
  {
    id: 'blank-varsity',
    slug: 'rare-ember-custom-varsity-jacket',
    title: '350 GSM Contrast Varsity Jacket',
    short: '350 GSM Heavyweight Fleece Varsity with metal snap buttons.',
    story: '350 GSM Heavyweight Fleece Varsity with metal snap buttons.',
    details: ['350 GSM Heavyweight Fleece', 'Metal Snap Buttons', 'Pan-India Express Delivery'],
    tag: '350 GSM Varsity',
    tagColor: '#FF4D24',
    tagBg: 'rgba(255, 77, 36, 0.1)',
    price: 1499,
    price_inr: 1499,
    rating: 4.9,
    reviews: 12,
    isCustomBlank: true,
    active: true,
    stock: 50,
    gradient: 'linear-gradient(135deg, #111 0%, #222 100%)',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
  },
  {
    id: 'blank-oversized-tee',
    slug: 'rare-ember-custom-oversized-tee',
    title: '240 GSM Drop-Shoulder Oversized Tee',
    short: '240 GSM Bio-Washed Combed Cotton with drop-shoulder streetwear fit.',
    story: '240 GSM Bio-Washed Combed Cotton with drop-shoulder streetwear fit.',
    details: ['240 GSM Bio-Washed Combed Cotton', 'Drop-Shoulder Streetwear Fit', 'Pan-India Express Delivery'],
    tag: '240 GSM Combed Cotton',
    tagColor: '#FF4D24',
    tagBg: 'rgba(255, 77, 36, 0.1)',
    price: 849,
    price_inr: 849,
    rating: 5.0,
    reviews: 31,
    isCustomBlank: true,
    active: true,
    stock: 100,
    gradient: 'linear-gradient(135deg, #111 0%, #222 100%)',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  },
  {
    id: 'blank-acid-tee',
    slug: 'rare-ember-custom-acid-wash-tee',
    title: '240 GSM Vintage Acid-Wash Heavy Tee',
    short: '240 GSM Custom Enzyme Acid-Wash Cotton with vintage fade.',
    story: '240 GSM Custom Enzyme Acid-Wash Cotton with vintage fade.',
    details: ['240 GSM Enzyme Acid-Wash Cotton', 'Vintage Streetwear Fade', 'Pan-India Express Delivery'],
    tag: '240 GSM French Terry',
    tagColor: '#FF4D24',
    tagBg: 'rgba(255, 77, 36, 0.1)',
    price: 949,
    price_inr: 949,
    rating: 4.9,
    reviews: 19,
    isCustomBlank: true,
    active: true,
    stock: 50,
    gradient: 'linear-gradient(135deg, #111 0%, #222 100%)',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
  },
  {
    id: 'blank-deskmat',
    slug: 'rare-ember-custom-desk-mat',
    title: '900×400mm Extended Creator Desk Mat',
    short: '3mm Micro-Weave Cloth with stitched anti-fray edges and natural rubber base.',
    story: '3mm Micro-Weave Cloth with stitched anti-fray edges and natural rubber base.',
    details: ['900×400mm Extended Surface', 'Anti-Fray Double Stitched Edges', 'Pan-India Express Delivery'],
    tag: 'Extended 900×400mm',
    tagColor: '#FF4D24',
    tagBg: 'rgba(255, 77, 36, 0.1)',
    price: 799,
    price_inr: 799,
    rating: 5.0,
    reviews: 27,
    isCustomBlank: true,
    active: true,
    stock: 100,
    gradient: 'linear-gradient(135deg, #111 0%, #222 100%)',
    sizes: ['900×400mm'],
  },
  {
    id: 'blank-mug',
    slug: 'rare-ember-custom-coffee-mug',
    title: '11 Oz High-Fired Ceramic Coffee Mug',
    short: '330ml Gloss Ceramic Stoneware with high-gloss sublimation glaze.',
    story: '330ml Gloss Ceramic Stoneware with high-gloss sublimation glaze.',
    details: ['330ml Gloss Ceramic Stoneware', 'Microwave & Dishwasher Safe', 'Pan-India Express Delivery'],
    tag: 'Ceramic Stoneware',
    tagColor: '#FF4D24',
    tagBg: 'rgba(255, 77, 36, 0.1)',
    price: 499,
    price_inr: 499,
    rating: 4.8,
    reviews: 14,
    isCustomBlank: true,
    active: true,
    stock: 100,
    gradient: 'linear-gradient(135deg, #111 0%, #222 100%)',
    sizes: ['11 Oz (330ml)'],
  },
];

// Bundles paused until store reaches 10 successful orders (per strategic roadmap)
export const products: Product[] = [
  ...((qikinkCatalog as unknown as Product[])
    .filter((p) => !p.id.startsWith('bundle-'))
    // Filter out squished 1-inch print artifacts (Boy's 64953488 and Girl's 64953664)
    .filter((p) => !String(p.id).includes('64953488') && !String(p.id).includes('64953664'))
    // Gateway/test SKUs are internal fixtures and excluded from public catalog
    .filter((p) => !/(gateway|test[-_ ]?pass|test[-_ ]?sku|sandbox|verification)/i.test(`${p.id} ${p.title}`))
    .map((p) => ({
      ...p,
      sizes: sortSizes(p.sizes),
    }))
    .map(enforcePriceFloor)),
  ...CUSTOM_BLANK_PRODUCTS,
];

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
  const blankMatch = CUSTOM_BLANK_PRODUCTS.find(
    (b) => b.id.toLowerCase() === baseId || b.id.toLowerCase() === cleanId
  );
  if (blankMatch) return blankMatch;
  return products.find((p) => 
    p.id.toLowerCase() === baseId || 
    p.slug.toLowerCase() === baseId ||
    p.id.toLowerCase() === cleanId || 
    p.slug.toLowerCase() === cleanId ||
    (p.qikinkClientProductId && (cleanId.includes(p.qikinkClientProductId) || baseId.includes(p.qikinkClientProductId)))
  );
}
