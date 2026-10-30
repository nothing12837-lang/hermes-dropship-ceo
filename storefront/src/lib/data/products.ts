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
  { id: 'mens-printed', label: "Men's Graphic Drops", count: 18, hint: '180–260 GSM Bio-Washed Drops' },
  { id: 'printed', label: 'All Graphic Prints', count: 24, hint: 'High-Density Direct-to-Film Prints' },
  { id: 'mens', label: "Men's & Unisex", count: 23, hint: 'Oversized & Full Sleeve Graphic Tees' },
  { id: 'womens', label: "Women's Collection", count: 7, hint: 'Crops, Tees & Typographic Prints' },
  { id: 'blanks', label: 'Essential Blanks', count: 8, hint: 'Solid Silhouettes & Acid Wash' },
];

export function isKidsProduct(p: { id?: string; title?: string; category?: string; gender?: string; sizes?: string[] } | null | undefined): boolean {
  if (!p) return false;
  const id = (p.id || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  const category = (p.category || '').toLowerCase();
  const gender = (p.gender || '').toLowerCase();
  if (category === 'kids' || gender === 'kids') return true;
  if (/64953488|64953664|32476832|32476744|girls-crew-neck|boys-crew-neck|baby-romper|romper/i.test(id)) return true;
  if (/girl's crew|boy's crew|baby romper|kids bomber|kids aop|kids hoodie|kids sweatshirt|kids t-shirt|kids clothes/i.test(title)) return true;
  if (Array.isArray(p.sizes) && p.sizes.some(s => /^\d+[-–]\d+M$/i.test(s) || /\b\d+Y(?:rs)?\b/i.test(s) || /0-12M|12-23M|24-35M|36-47M/i.test(s))) return true;
  return false;
}

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
  // 3. 380 GSM Heavyweight Winter Hoodie: min ₹1,399 (M.R.P. ₹2,699)
  else if (pid.includes('hoodie') || title.includes('hoodie') || pid.includes('uhd') || pid.includes('uzhd') || pid.includes('blank-hoodie')) {
    if (price < 1399) price = 1399;
    if (compare < 2699) compare = 2699;
  }
  // 4. 320 GSM Crewneck Sweatshirt & 320 GSM Heavyweight Joggers: min ₹1,099 (M.R.P. ₹1,899)
  else if (
    pid.includes('sweatshirt') || pid.includes('crewneck') || pid.includes('jogger') || pid.includes('sweatpant') ||
    title.includes('sweatshirt') || title.includes('crewneck') || title.includes('jogger') || title.includes('sweatpant') ||
    pid.includes('uss') || pid.includes('ujg') || pid.includes('blank-crewneck')
  ) {
    if (price < 1099) price = 1099;
    if (compare < 1899) compare = 1899;
  }
  // 5. Full-Sleeve Tees & T-Shirt Dresses: min ₹999 (M.R.P. ₹1,799)
  else if (
    pid.includes('64953648') || pid.includes('32477737') || pid.includes('32476824') || pid.includes('mrnfs') ||
    title.includes('full sleeve') || pid.includes('full-sleeve') ||
    pid.includes('64953512') || pid.includes('32476756') || pid.includes('32476736') || pid.includes('t-shirt-dress') || pid.includes('maternity-dress') || title.includes('dress')
  ) {
    if (price < 999) price = 999;
    if (compare < 1799) compare = 1799;
  }
  // 6. 240 GSM Oversized Tees, Oversized Jerseys (Cyber Sublimation, Matrix), Supima, V-Neck, Acid Wash, Tie Dye, French Terry: min ₹849 (M.R.P. ₹1,499)
  else if (
    pid.includes('64950694') || pid.includes('32476280') || pid.includes('32476281') ||
    title.includes('cyber sublimation') || title.includes('matrix') ||
    (title.includes('oversized') && title.includes('jersey')) || title.includes('mesh jersey') ||
    pid.includes('32476431') || title.includes('chrome bengaluru') ||
    pid.includes('32476332') || title.includes('tokyo street') ||
    pid.includes('32476663') || title.includes('supima') ||
    pid.includes('32476772') || pid.includes('64953544') || title.includes('v neck') || title.includes('v-neck') ||
    pid.includes('32476620') || pid.includes('ut27') || title.includes('french terry') || title.includes('terry') ||
    pid.includes('32476438') || pid.includes('blank-acid-tee') || pid.includes('uc61') || pid.includes('ate') || title.includes('acid') ||
    pid.includes('32476436') || pid.includes('ut58') || title.includes('tie dye') || title.includes('tie-dye') ||
    pid.includes('blank-oversized-tee') || title.includes('oversized')
  ) {
    if (price < 849) price = 849;
    if (compare < 1499) compare = 1499;
  }
  // 7. 900×400mm Extended Gaming Desk Mat / Pad & Custom Blank Jersey: min ₹799 (M.R.P. ₹1,399)
  else if (
    title.includes('gaming pad') || title.includes('desk mat') || title.includes('mouse pad') ||
    pid.includes('desk-mat') || pid.includes('desk_mat') || pid.includes('mpad') || pid.includes('blank-deskmat') ||
    pid.includes('blank-jersey') || pid.includes('uj35') || pid.includes('us02') ||
    pid.includes('64953576') || pid.includes('32476788') || title.includes('polo') || pid.includes('mp25')
  ) {
    if (price < 799) price = 799;
    if (compare < 1399) compare = 1399;
  }
  // 8. Ceramic Mug: min ₹499 (M.R.P. ₹999)
  else if (title.includes('mug') || pid.includes('mug') || pid.includes('blank-mug')) {
    if (price < 499) price = 499;
    if (compare < 999) compare = 999;
  }
  // 9. Standard Crew, Raglan, Ringer, Stretch, DryFit, Women's Tee, Crop Top, Essential Blank: min ₹749 (M.R.P. ₹1,299)
  else if (
    title.includes('standard crew') || title.includes('classic crew') || title.includes('raglan') || title.includes('ringer') ||
    title.includes('stretch') || title.includes('dryfit') || title.includes('dry fit') ||
    title.includes('crop') || title.includes('tank') || title.includes('baby tee') || title.includes('sleeveless') || title.includes('basic') ||
    ['32476313', '32476636', '32476299', '32476699', '32476681', '32476319', '32476284', '32476722', '32476716', '32476800', '32476326', '32476874', '32476851', '32476764', '64953748', '64953600'].some(k => pid.includes(k))
  ) {
    if (price < 749) price = 749;
    if (compare < 1299) compare = 1299;
  }
  // 10. Default fallback: min ₹849 (M.R.P. ₹1,499)
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

export const CANONICAL_ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'] as const;
export const ADULT_SIZE_ORDER = CANONICAL_ADULT_SIZES;
export const KIDS_SIZE_ORDER = [
  '0-12M', '12-23M', '24-35M', '36-47M',
  '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5Yrs', '5-6Y',
  '6-7Y', '7Yrs', '7-8Y', '8-9Y', '9Yrs', '9-10Y',
  '10-11Y', '11Yrs', '11-12Y', '12-13Y', '13Yrs', '13-14Y',
] as const;

export function formatSizeRange(sizes?: string[]): string {
  if (!Array.isArray(sizes) || sizes.length === 0) {
    return 'Sizes XS–3XL';
  }
  const first = (sizes[0] || '').trim();
  if (/^\d+x\d+mm$/i.test(first) || /^\d+\s*oz/i.test(first) || /330ml/i.test(first)) {
    return first;
  }

  const sizeMap: Record<string, number> = {
    'XS': 0,
    'S': 1,
    'M': 2,
    'L': 3,
    'XL': 4,
    'XXL': 5,
    '2XL': 5,
    '3XL': 6,
  };

  const valid = sizes
    .map(s => s.trim())
    .filter(s => sizeMap[s.toUpperCase()] !== undefined)
    .sort((a, b) => sizeMap[a.toUpperCase()] - sizeMap[b.toUpperCase()]);

  if (valid.length === 0) {
    return 'Sizes XS–3XL';
  }
  if (valid.length === 1) {
    return `Size ${valid[0]}`;
  }
  return `Sizes ${valid[0]}–${valid[valid.length - 1]}`;
}

export function sortSizes(sizes?: string[]): string[] {
  if (!Array.isArray(sizes) || sizes.length === 0) return [];
  // Strict regex for kids sizes if any remain
  const isKids = sizes.some(s => (KIDS_SIZE_ORDER as readonly string[]).includes(s) || /^\d+[-–]\d+M$/i.test(s) || /\b\d+Y(?:rs)?\b/i.test(s));
  if (isKids) {
    return [...sizes].sort((a, b) => {
      const idxA = (KIDS_SIZE_ORDER as readonly string[]).indexOf(a);
      const idxB = (KIDS_SIZE_ORDER as readonly string[]).indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }
  // Adult sizes: cap at 3XL and filter out 4XL/5XL
  const adultOrder = CANONICAL_ADULT_SIZES as readonly string[];
  const filtered = sizes.filter(s => !/^[45]XL$/i.test(s));
  return [...filtered].sort((a, b) => {
    const idxA = adultOrder.indexOf(a.toUpperCase());
    const idxB = adultOrder.indexOf(b.toUpperCase());
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
  if (/mug|ceramic|drinkware|cup|sipper|bottle/i.test(str)) {
    return /bottle|sipper/i.test(str) ? 'Insulated Steel 750ml' : 'Gloss Ceramic 330ml';
  }
  if (/varsity|bomber/i.test(str)) {
    return '350 GSM Varsity';
  }

  // Exact Qikink Hoodies
  if (/32493953|uh62|acid.*hoodie/i.test(str)) {
    return '300 GSM Acid Wash';
  }
  if (/32493938|uh32|unstoppable.*tiger/i.test(str)) {
    return '400 GSM Heavy Fleece';
  }
  if (/32493470|uh83/i.test(str)) {
    return '260 GSM French Terry';
  }
  if (/pullover\s*hoodie/i.test(str)) {
    return '320 GSM French Terry';
  }
  if (/hoodie/i.test(str)) {
    return '380 GSM Heavy Fleece';
  }
  if (/sweatshirt|crewneck|jogger|sweatpant/i.test(str)) {
    return '320 GSM French Terry';
  }

  // Exact Qikink Specialties
  if (/32476280|uj35/i.test(str)) {
    return '240 GSM Breathable Mesh';
  }
  if (/32476281|us02/i.test(str)) {
    return '170 GSM Honeycomb Mesh';
  }
  if (/jersey-01/i.test(str)) {
    return '220 GSM Breathable Mesh';
  }
  if (/oversized\s+jersey|jersey/i.test(str)) {
    return '220 GSM Breathable Mesh';
  }
  if (/32476284|ud15|dryfit|dry fit/i.test(str)) {
    return '160 GSM Quick-Dry';
  }
  if (/32476663|uc23|supima/i.test(str)) {
    return '160 GSM Supima Cotton';
  }
  if (/32476788|mp25|polo/i.test(str)) {
    return '220 GSM Pique Cotton';
  }
  if (/32476620|ut27/i.test(str)) {
    return '260 GSM Cotton Terry';
  }
  if (/32476436|ut58|tie\s*dye/i.test(str)) {
    return '260 GSM Tie-Dye';
  }
  if (/32476716|baby\s*tee|ft47/i.test(str)) {
    return '240 GSM Cotton Spandex';
  }
  if (/32476629|uc28|oversized-shirt|button[- ]down/i.test(str)) {
    return '240 GSM Woven Cotton';
  }
  if (/32476438|uc61/i.test(str)) {
    return '240 GSM Acid Wash';
  }
  if (/32476332|uc22|tokyo\s*street/i.test(str)) {
    return '240 GSM Combed Cotton';
  }

  // 180 GSM Qikink Blanks
  if (/32477737|32476824|mrnfs|full\s*sleeve/i.test(str)) {
    return '180 GSM Super Combed';
  }
  if (/32476431|us22/i.test(str)) {
    return '180 GSM Relaxed Fit';
  }
  if (/32476313|32476326|mrnhs/i.test(str)) {
    return '180 GSM Classic Crew';
  }
  if (/32476319|us21/i.test(str)) {
    return '180 GSM Standard Crew';
  }
  if (/32476299|ur39|ringer/i.test(str)) {
    return '180 GSM Retro Ringer';
  }
  if (/32476295|ur50/i.test(str)) {
    return '180 GSM Oversized Raglan';
  }
  if (/32476636|ur37|raglan/i.test(str)) {
    return '180 GSM Raglan';
  }
  if (/32476772|uv34|v\s*neck/i.test(str)) {
    return '180 GSM V-Neck';
  }
  if (/32476699|uc48|stretch/i.test(str)) {
    return '180 GSM Cotton Stretch';
  }
  if (/32476681|ub73|basic.*t-shirt/i.test(str)) {
    return '180 GSM Poly-Cotton';
  }
  if (/32476800|ms36|sleeveless/i.test(str)) {
    return '180 GSM Sleeveless';
  }
  if (/32476874|frnhs/i.test(str)) {
    return '180 GSM Classic Tee';
  }
  if (/32476851|fc39|crop\s*top/i.test(str)) {
    return '180 GSM Crop Top';
  }
  if (/32476722|fc40|crop\s*tank/i.test(str)) {
    return '180 GSM Crop Tank';
  }
  if (/32476764|ft37|tank\s*top/i.test(str)) {
    return '180 GSM Tank Top';
  }
  if (/32476756|fc43|t-shirt\s*dress/i.test(str)) {
    return '180 GSM T-Shirt Dress';
  }
  if (/32476736|fm44|maternity/i.test(str)) {
    return '180 GSM Maternity Dress';
  }
  if (/crop/i.test(str)) {
    return '180 GSM Cotton';
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

export interface GarmentFabricSpec {
  gsm: number;
  composition: string;
  badge: string;
  category: string;
}

export function getGarmentFabricSpecs(p?: { title?: string; id?: string; blank_sku?: string; tag?: string }): GarmentFabricSpec {
  const badge = getGarmentSpecBadge(p);
  const str = `${p?.title || ''} ${p?.id || ''} ${p?.blank_sku || ''}`.toLowerCase();

  if (/32493938|uh32|unstoppable.*tiger/i.test(str)) {
    return { gsm: 400, composition: '400 GSM Heavy Brushed Cotton-Poly Thermal Fleece', badge, category: 'Outerwear' };
  }
  if (/32493953|uh62|acid.*hoodie/i.test(str)) {
    return { gsm: 300, composition: '300 GSM 100% Super Combed Cotton French Terry Fleece', badge, category: 'Outerwear' };
  }
  if (/32493470|uh83|pullover.*hoodie/i.test(str)) {
    return { gsm: 260, composition: '260 GSM Tri-Layer French Terry (90% Cotton / 10% Poly)', badge, category: 'Outerwear' };
  }
  if (/varsity|bomber/i.test(str)) {
    return { gsm: 350, composition: '350 GSM Heavyweight Fleece with Contrast Sleeves', badge, category: 'Outerwear' };
  }
  if (/sweatshirt|crewneck|jogger/i.test(str)) {
    return { gsm: 320, composition: '320 GSM Super Combed French Terry Cotton Fleece', badge, category: 'Streetwear' };
  }
  if (/32476620|ut27/i.test(str)) {
    return { gsm: 260, composition: '260 GSM 100% Cotton French Terry Loop-Back Fabric', badge, category: 'Oversized' };
  }
  if (/32476436|ut58|tie\s*dye/i.test(str)) {
    return { gsm: 260, composition: '260 GSM Heavyweight French Terry (90% Cotton / 10% Poly)', badge, category: 'Oversized' };
  }
  if (/32476716|baby\s*tee|ft47/i.test(str)) {
    return { gsm: 240, composition: '240 GSM 95% Combed Cotton / 5% Spandex Stretch Jersey', badge, category: 'Tops' };
  }
  if (/32476280|uj35/i.test(str)) {
    return { gsm: 240, composition: '240 GSM Double-Knit Aeroknit Performance Polyester Mesh', badge, category: 'Athletic' };
  }
  if (/32476629|uc28|oversized-shirt|button[- ]down/i.test(str)) {
    return { gsm: 240, composition: '240 GSM 100% Premium Woven Combed Cotton Canvas', badge, category: 'Shirts' };
  }
  if (/32476438|uc61/i.test(str)) {
    return { gsm: 240, composition: '240 GSM 100% Combed Cotton Single Jersey (Enzyme Acid Wash)', badge, category: 'Oversized' };
  }
  if (/32476332|uc22|tokyo\s*street/i.test(str)) {
    return { gsm: 240, composition: '240 GSM 100% Super Combed Bio-Washed Heavyweight Cotton', badge, category: 'Oversized' };
  }
  if (/32476788|mp25|polo/i.test(str)) {
    return { gsm: 220, composition: '220 GSM 100% Super Combed Cotton Airtex Pique Knit', badge, category: 'Polo' };
  }
  if (/32476281|us02/i.test(str)) {
    return { gsm: 170, composition: '170 GSM Lightweight Polyester Honeycomb Aeromesh', badge, category: 'Athletic' };
  }
  if (/32476284|ud15|dryfit|dry fit/i.test(str)) {
    return { gsm: 160, composition: '160 GSM Salina Micro-Knit Quick-Dry Performance Polyester', badge, category: 'Athletic' };
  }
  if (/32476663|uc23|supima/i.test(str)) {
    return { gsm: 160, composition: '160 GSM 100% Long-Staple American Supima Cotton Single Jersey', badge, category: 'Luxury' };
  }
  if (/32477737|32476824|mrnfs|full\s*sleeve/i.test(str)) {
    return { gsm: 180, composition: '180 GSM 100% Super Combed Bio-Washed Cotton with Ribbed Cuffs', badge, category: 'Full Sleeve' };
  }
  if (/32476699|uc48|stretch/i.test(str)) {
    return { gsm: 180, composition: '180 GSM 95% Cotton / 5% Lycra Dynamic Stretch Jersey', badge, category: 'Tees' };
  }
  if (/32476681|ub73|basic.*t-shirt/i.test(str)) {
    return { gsm: 180, composition: '180 GSM Poly-Cotton Durable Everyday Blend', badge, category: 'Tees' };
  }
  if (/\b(mat|pad|desk\s*mat|mouse\s*pad|gaming\s*pad)\b|desk-mat/i.test(str)) {
    return { gsm: 0, composition: 'Extended 900×400mm Waterproof Micro-Weave Cloth & Natural Rubber Base', badge, category: 'Gear' };
  }
  if (/mug|ceramic|drinkware|cup|sipper|bottle/i.test(str)) {
    return { gsm: 0, composition: 'Gloss Ceramic 330ml / Insulated Stainless Steel', badge, category: 'Drinkware' };
  }
  return { gsm: 180, composition: '180 GSM 100% Super Combed Bio-Washed Cotton', badge, category: 'Streetwear' };
}

export const CUSTOM_BLANK_PRODUCTS: Product[] = [];

// Bundles paused until store reaches 10 successful orders (per strategic roadmap)
export const products: Product[] = [
  ...((qikinkCatalog as unknown as Product[])
    .filter((p) => !p.id.startsWith('bundle-'))
    // Filter out kids/baby clothes completely from catalog
    .filter((p) => !isKidsProduct(p))
    // Gateway/test SKUs and custom mockups are excluded from public catalog
    .filter((p) => !/(gateway|test[-_ ]?pass|test[-_ ]?sku|sandbox|verification|rare-ember-custom|blank-)/i.test(`${p.id} ${p.title} ${p.slug || ''}`))
    .map((p) => ({
      ...p,
      sizes: sortSizes(p.sizes),
    }))
    .map(enforcePriceFloor)),
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
  if (/(gateway|test[-_ ]?pass|rare-ember-custom|blank-)/i.test(cleanId)) return undefined;
  const baseId = cleanId.split('__')[0];
  return products.find((p) => 
    p.id.toLowerCase() === baseId || 
    p.slug.toLowerCase() === baseId ||
    p.id.toLowerCase() === cleanId || 
    p.slug.toLowerCase() === cleanId ||
    (p.qikinkClientProductId && (cleanId.includes(p.qikinkClientProductId) || baseId.includes(p.qikinkClientProductId)))
  );
}
