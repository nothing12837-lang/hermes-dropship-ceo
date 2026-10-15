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
}

export const USD_TO_INR_RATE = 85;

export function getClientMarket(): 'IN' | 'GLOBAL' {
  if (typeof window === 'undefined') return 'IN';
  try {
    const saved = localStorage.getItem('rareember_market');
    if (saved === 'IN' || saved === 'GLOBAL') return saved;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const isIndia =
      tz.includes('Calcutta') ||
      tz.includes('Kolkata') ||
      tz.includes('Asia/Kolkata') ||
      navigator.language.includes('en-IN') ||
      (Boolean(navigator.languages) && navigator.languages.some((l) => l.includes('en-IN')));
    return isIndia ? 'IN' : 'GLOBAL';
  } catch {
    return 'IN';
  }
}

export function formatPrice(num: number, marketOverride?: 'IN' | 'GLOBAL'): string {
  const m = marketOverride ?? getClientMarket();
  if (m === 'IN') {
    const val = num >= 80 ? Math.round(num) : Math.round(num * USD_TO_INR_RATE);
    return `₹${val.toLocaleString('en-IN')}`;
  }
  const val = num >= 80 ? num / USD_TO_INR_RATE : num;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
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
  { id: 'fashion', label: 'Curated Streetwear', count: 86, hint: 'Style', emoji: '👕' },
  { id: 'home-garden', label: 'Drinkware & Living', count: 30, hint: 'Drinkware', emoji: '☕' },
  { id: 'electronics', label: 'Desk & Creator Gear', count: 5, hint: 'Workstation', emoji: '⚡' },
  { id: 'general', label: 'Lifestyle Drops', count: 26, hint: 'Accessories', emoji: '🔥' },
];

export const products: Product[] = [
  {
  "id": "qikink-accessories-desk-mat",
  "slug": "qikink-accessories-desk-mat",
  "title": "Rare Ember Gaming Pad",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "electronics",
  "emoji": "⚡",
  "tag": "Precision Micro-Weave",
  "tagColor": "#6366f1",
  "tagBg": "rgba(99, 102, 241, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg",
  "supplier": "qikink",
  "short": "Gaming Pad Made with a 3 mm thick rubber base, stitched edges, strong anti-slip grip, and extended desk coverage. Printed using fade-proof s",
  "story": "Gaming Pad Made with a 3 mm thick rubber base, stitched edges, strong anti-slip grip, and extended desk coverage. Printed using fade-proof sublimation with OEKO-TEX certified Epson inks. Available in 60 × 30 cm and 80 × 33 cm sizes.",
  "details": [
    "Gaming Pad with custom printing on Rare Ember Studio, order as a Rare Ember premium privat",
    "Printed using fade-proof sublimation with OEKO-TEX certified Epson inks",
    "Available in 60 × 30 cm and 80 × 33 cm sizes"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-mobile-clear-phone-case",
  "slug": "qikink-accessories-mobile-clear-phone-case",
  "title": "Rare Ember Hard Clear Case | CC32",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "electronics",
  "emoji": "📱",
  "tag": "Impact Resistant",
  "tagColor": "#8b5cf6",
  "tagBg": "rgba(139, 92, 246, 0.12)",
  "stock": 500,
  "rating": 4.5,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/325/c0b869cd-33d3-4167-a9ec-365dbc0860fd.webp",
  "supplier": "qikink",
  "short": "Clear Phone Case Made from transparent TPU material with a slim and lightweight profile, precise cut-outs, and shock-absorbing construction ",
  "story": "Clear Phone Case Made from transparent TPU material with a slim and lightweight profile, precise cut-outs, and shock-absorbing construction for everyday protection. Printed using high-quality UV printing for vibrant, fade-resistant designs. Compatible with a wide range of smartphone models.",
  "details": [
    "Clear Phone Case with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from transparent TPU material with a slim and lightweight profile, precise cut-outs,",
    "Printed using high-quality UV printing for vibrant, fade-resistant designs"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-mouse-pad",
  "slug": "qikink-accessories-mouse-pad",
  "title": "Rare Ember Mouse Pad",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "electronics",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/52/1da2d780-a6a8-4fab-9eb2-c7fbd75c37ef.jpg",
  "supplier": "qikink",
  "short": "Mouse Pad Made with a 3 mm thick skid-proof rubber base and smooth fabric surface for precise mouse control. Features fade-proof sublimation",
  "story": "Mouse Pad Made with a 3 mm thick skid-proof rubber base and smooth fabric surface for precise mouse control. Features fade-proof sublimation printing using OEKO-TEX certified Epson inks and is available in Square and Circle variants.",
  "details": [
    "Mouse Pad with custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made with a 3 mm thick skid-proof rubber base and smooth fabric surface for precise mouse",
    "Features fade-proof sublimation printing using OEKO-TEX certified Epson inks and is availa"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-mobile-phone-grip",
  "slug": "qikink-accessories-mobile-phone-grip",
  "title": "Rare Ember Phone Grip | MS65",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "electronics",
  "emoji": "📱",
  "tag": "Impact Resistant",
  "tagColor": "#8b5cf6",
  "tagBg": "rgba(139, 92, 246, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/326/5b8c2114-ac88-4a2d-bbe9-35ed672a917c.jpg",
  "supplier": "qikink",
  "short": "Phone Grip | MS65 Made with a durable lightweight construction featuring a strong adhesive backing, ergonomic grip design, and high-quality ",
  "story": "Phone Grip | MS65 Made with a durable lightweight construction featuring a strong adhesive backing, ergonomic grip design, and high-quality UV printing for vibrant, fade-proof results. Functions as a secure phone grip, media stand, and everyday mobile accessory.",
  "details": [
    "Phone Grip | MS65 with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made with a durable lightweight construction featuring a strong adhesive backing, ergonomi",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-mobile-glass-phone-case",
  "slug": "qikink-accessories-mobile-glass-phone-case",
  "title": "Rare Ember iPhone Glass Case",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "electronics",
  "emoji": "📱",
  "tag": "Impact Resistant",
  "tagColor": "#8b5cf6",
  "tagBg": "rgba(139, 92, 246, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/133/9b17d26a-2c7e-4265-9a05-caf401954ac4.jpg",
  "supplier": "qikink",
  "short": "Glass Phone Case Made with a premium tempered glass back and shock-absorbing TPU edges for everyday protection. Features vibrant fade-proof ",
  "story": "Glass Phone Case Made with a premium tempered glass back and shock-absorbing TPU edges for everyday protection. Features vibrant fade-proof printing using UV technology, precise cut-outs for easy access, and support for a wide range of smartphone models.",
  "details": [
    "Glass Phone Case with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Features vibrant fade-proof printing using UV technology, precise cut-outs for easy access",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-all-over-print-full-sleeve-crop-top-fc38",
  "slug": "qikink-tops-all-over-print-full-sleeve-crop-top-fc38",
  "title": "Rare Ember AOP Full Sleeve Crop Top | FC38",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/360/736d2f6b-2708-4861-b05a-a36bf8911045.webp",
  "supplier": "qikink",
  "short": "Sell full sleeve crop tops (AOP) with Rare Ember Studio's print-on-demand model. 220 GSM poly-spandex, no minimums. Start selling.",
  "story": "Sell full sleeve crop tops (AOP) with Rare Ember Studio's print-on-demand model. 220 GSM poly-spandex, no minimums. Start selling.",
  "details": [
    "Sell full sleeve crop tops (AOP) with Rare Ember Studio's print-on-demand model",
    "220 GSM poly-spandex, no minimums",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-arm-sleeves",
  "slug": "qikink-accessories-arm-sleeves",
  "title": "Rare Ember Arm Sleeves | AS12",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/322/9e0e1239-3baa-4d3d-9684-8b5cf8a2ca75.webp",
  "supplier": "qikink",
  "short": "Arm Sleeves Made from lightweight poly spandex fabric with an anti-microbial finish, stretchable construction, UV protection, and fade-proof",
  "story": "Arm Sleeves Made from lightweight poly spandex fabric with an anti-microbial finish, stretchable construction, UV protection, and fade-proof all-over sublimation printing. Suitable for sports, cycling, running, biking, and outdoor activities.",
  "details": [
    "Arm Sleeves with custom printing on Rare Ember Studio, order as a Rare Ember premium priva",
    "Made from lightweight poly spandex fabric with an anti-microbial finish, stretchable const",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-balaclava",
  "slug": "qikink-accessories-balaclava",
  "title": "Rare Ember Balaclava | UB39",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/321/c740f054-e496-4d61-ae4b-b91b23e91b9c.jpg",
  "supplier": "qikink",
  "short": "Balaclava | UB39 Made from lightweight poly spandex fabric with an anti-microbial finish, stretchable construction, and fade-proof all-over ",
  "story": "Balaclava | UB39 Made from lightweight poly spandex fabric with an anti-microbial finish, stretchable construction, and fade-proof all-over sublimation printing for full-coverage customization. Designed with a snug helmet-ready fit for riding, sports, and outdoor activities.",
  "details": [
    "Balaclava | UB39 with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from lightweight poly spandex fabric with an anti-microbial finish, stretchable const",
    "Designed with a snug helmet-ready fit for riding, sports, and outdoor activities"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-kids-clothes-boys-t-shirts-bc21",
  "slug": "qikink-kids-clothes-boys-t-shirts-bc21",
  "title": "Rare Ember Boy Classic Crew T-Shirt",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/50/b3aa346d-6808-4573-9441-0fdbd9f0f66e.jpg",
  "supplier": "qikink",
  "short": "Boy Classic Crew T-Shirt | BC21 Made from 180 GSM 100% super combed cotton with a unisex regular fit, lycra ribbed neck, pre-shrunk and bio-",
  "story": "Boy Classic Crew T-Shirt | BC21 Made from 180 GSM 100% super combed cotton with a unisex regular fit, lycra ribbed neck, pre-shrunk and bio-washed fabric, and double-stitched seams.",
  "details": [
    "Boy Classic Crew T-Shirt | BC21 with custom printing on Rare Ember Studio, order as a Rare",
    "Made from 180 GSM 100% super combed cotton with a unisex regular fit, lycra ribbed neck, p",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-dry-fit-t-shirts-ud15",
  "slug": "qikink-t-shirts-dry-fit-t-shirts-ud15",
  "title": "Rare Ember Dry Fit T-Shirt | UD15",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/365/32170f2e-477d-4661-9c6c-8527440255a9.webp",
  "supplier": "qikink",
  "short": "Design & sell custom dry fit t-shirts with quick-dry fabric, sublimation printing & no minimums. Start selling with Rare Ember Studio today.",
  "story": "Design & sell custom dry fit t-shirts with quick-dry fabric, sublimation printing & no minimums. Start selling with Rare Ember Studio today.",
  "details": [
    "Design & sell custom dry fit t-shirts with quick-dry fabric, sublimation printing & no min",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-headwear-bandana-mask",
  "slug": "qikink-headwear-bandana-mask",
  "title": "Rare Ember Face Bandana",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/73/6f57c79f-9fe6-42e3-9cba-cdbb773a9699.jpg",
  "supplier": "qikink",
  "short": "Face Bandana Made from polyester fabric with fade-proof all-over sublimation printing using OEKO-TEX certified Epson inks. Designed as a mul",
  "story": "Face Bandana Made from polyester fabric with fade-proof all-over sublimation printing using OEKO-TEX certified Epson inks. Designed as a multipurpose face covering for outdoor activities and everyday use. Available in a standard size.",
  "details": [
    "Face Bandana with custom printing on Rare Ember Studio, order as a Rare Ember premium priv",
    "Made from polyester fabric with fade-proof all-over sublimation printing using OEKO-TEX ce",
    "Available in a standard size"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-dresses-all-over-print-a-line-dress-fd16",
  "slug": "qikink-dresses-all-over-print-a-line-dress-fd16",
  "title": "Rare Ember Female AOP A Line Dress | FD16",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/304/f23ad3cd-630b-4d8a-b024-a1fdb401b315.jpg",
  "supplier": "qikink",
  "short": "Female AOP A Line Dress Made from 220 GSM poly spandex fabric with a fit and flare silhouette, breathable stretch construction, and wrinkle-",
  "story": "Female AOP A Line Dress Made from 220 GSM poly spandex fabric with a fit and flare silhouette, breathable stretch construction, and wrinkle-free finish. Compatible with sublimation printing.",
  "details": [
    "Female AOP A Line Dress with custom printing on Rare Ember Studio, order as a Rare Ember p",
    "Made from 220 GSM poly spandex fabric with a fit and flare silhouette, breathable stretch",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-dresses-all-over-print-bodycon-dress-fd74",
  "slug": "qikink-dresses-all-over-print-bodycon-dress-fd74",
  "title": "Rare Ember Female AOP Bodycon Dress | FD74",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.5,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/305/3d41b735-7fba-4430-8359-def9c69e26b1.jpg",
  "supplier": "qikink",
  "short": "Female AOP Bodycon Dress Made from 220 GSM poly spandex fabric with a skin-fit silhouette, side slit, and stretchable breathable constructio",
  "story": "Female AOP Bodycon Dress Made from 220 GSM poly spandex fabric with a skin-fit silhouette, side slit, and stretchable breathable construction. Compatible with sublimation printing.",
  "details": [
    "Female AOP Bodycon Dress with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 220 GSM poly spandex fabric with a skin-fit silhouette, side slit, and stretchab",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-bomber-jacket-women-fa30",
  "slug": "qikink-hoodies-bomber-jacket-women-fa30",
  "title": "Rare Ember Female AOP Bomber Jacket | FA30",
  "price": 15.28,
  "price_inr": 1299,
  "old_price": 2349,
  "compare_at_price": 27.64,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/103/dc865e38-a2cc-40b8-a0b3-0e003d04705f.jpg",
  "supplier": "qikink",
  "short": "Female AOP Bomber Jacket Made from 240 GSM premium poly brushed fleece with lycra ribbed hem and cuffs, YKK zipper, long sleeves, side pocke",
  "story": "Female AOP Bomber Jacket Made from 240 GSM premium poly brushed fleece with lycra ribbed hem and cuffs, YKK zipper, long sleeves, side pockets, and fade-proof all-over printed construction. Available in multiple sizes. Compatible with all-over printing.",
  "details": [
    "Female AOP Bomber Jacket with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 240 GSM premium poly brushed fleece with lycra ribbed hem and cuffs, YKK zipper,",
    "Available in multiple sizes",
    "Compatible with all-over printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-all-over-print-crop-tank-fa33",
  "slug": "qikink-tops-all-over-print-crop-tank-fa33",
  "title": "Rare Ember Female AOP Crop Tank | FA33",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/92/6795f4a6-f770-4f75-8db0-dbb7ac645c06.jpg",
  "supplier": "qikink",
  "short": "Female AOP Crop Tank Made from 180 GSM 100% spun polyester fabric with a regular fit, folded edges, crew neck, and fade-proof print. Compati",
  "story": "Female AOP Crop Tank Made from 180 GSM 100% spun polyester fabric with a regular fit, folded edges, crew neck, and fade-proof print. Compatible with sublimation printing.",
  "details": [
    "Female AOP Crop Tank with custom printing on Rare Ember Studio, order as a Rare Ember prem",
    "Made from 180 GSM 100% spun polyester fabric with a regular fit, folded edges, crew neck,",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-all-over-print-crop-top-fa32",
  "slug": "qikink-tops-all-over-print-crop-top-fa32",
  "title": "Rare Ember Female AOP Crop Top | FA32",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/90/64e29342-1a2d-4c02-b8a1-5c29614a9111.jpg",
  "supplier": "qikink",
  "short": "Female AOP Crop Top Made from 180 GSM 100% spun polyester fabric with a regular fit, crew neck, fade-proof print, and OEKO-TEX certified ink",
  "story": "Female AOP Crop Top Made from 180 GSM 100% spun polyester fabric with a regular fit, crew neck, fade-proof print, and OEKO-TEX certified inks. Compatible with sublimation printing.",
  "details": [
    "Female AOP Crop Top with custom printing on Rare Ember Studio, order as a Rare Ember premi",
    "Made from 180 GSM 100% spun polyester fabric with a regular fit, crew neck, fade-proof pri",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bottomwear-womens-gym-leggings-fa41",
  "slug": "qikink-bottomwear-womens-gym-leggings-fa41",
  "title": "Rare Ember Female AOP Gym legging | FA41",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/107/60f56f07-a7f0-446d-995b-75d71f473733.jpg",
  "supplier": "qikink",
  "short": "Female AOP Gym legging Made from 180 GSM Lycra polyester with a slim fit, stretchable construction, double-stitched seams, and fade-proof pr",
  "story": "Female AOP Gym legging Made from 180 GSM Lycra polyester with a slim fit, stretchable construction, double-stitched seams, and fade-proof print. Compatible with all-over printing.",
  "details": [
    "Female AOP Gym legging with custom printing on Rare Ember Studio, order as a Rare Ember pr",
    "Made from 180 GSM Lycra polyester with a slim fit, stretchable construction, double-stitch",
    "Compatible with all-over printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-dresses-all-over-print-pencil-skirt-fs58",
  "slug": "qikink-dresses-all-over-print-pencil-skirt-fs58",
  "title": "Rare Ember Female AOP Pencil Skirt | FS58",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/306/0d62cdf1-0770-4ff2-8816-760987a0e06c.jpg",
  "supplier": "qikink",
  "short": "Female AOP Pencil Skirt Made from 220 GSM poly spandex fabric with a pencil fit, side slit, stretchable construction, and elastic waistband.",
  "story": "Female AOP Pencil Skirt Made from 220 GSM poly spandex fabric with a pencil fit, side slit, stretchable construction, and elastic waistband. Compatible with sublimation printing.",
  "details": [
    "Female AOP Pencil Skirt with custom printing on Rare Ember Studio, order as a Rare Ember p",
    "Made from 220 GSM poly spandex fabric with a pencil fit, side slit, stretchable constructi",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-all-over-print-sports-bra-fa50",
  "slug": "qikink-tops-all-over-print-sports-bra-fa50",
  "title": "Rare Ember Female AOP Sports Bra | FA50",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/99/6db1e3d9-1737-4f37-b39e-4a9ad8a292fd.jpg",
  "supplier": "qikink",
  "short": "Female AOP Sports Bra Made from 220 GSM poly spandex fabric with mesh inner lining for breathability, racerback design, removable pads, and ",
  "story": "Female AOP Sports Bra Made from 220 GSM poly spandex fabric with mesh inner lining for breathability, racerback design, removable pads, and stretchable construction for comfort and support. Fade-proof all-over print suitable for sublimation printing.",
  "details": [
    "Female AOP Sports Bra with custom printing on Rare Ember Studio, designed for print-on-dem",
    "Made from 220 GSM poly spandex fabric with mesh inner lining for breathability, racerback",
    "Fade-proof all-over print suitable for sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-dresses-all-over-print-t-shirt-dress-fa35",
  "slug": "qikink-dresses-all-over-print-t-shirt-dress-fa35",
  "title": "Rare Ember Female AOP T-Shirt Dress | FA35",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/98/7a384a34-0135-4a1f-baff-f6df251f033a.jpg",
  "supplier": "qikink",
  "short": "Female AOP T-Shirt Dress Made from 180 GSM 100% spun polyester fabric with a relaxed fit silhouette, crew neck, fade-proof sublimation print",
  "story": "Female AOP T-Shirt Dress Made from 180 GSM 100% spun polyester fabric with a relaxed fit silhouette, crew neck, fade-proof sublimation print, and edge-to-edge all-over printing. Compatible with sublimation printing.",
  "details": [
    "Female AOP T-Shirt Dress with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 180 GSM 100% spun polyester fabric with a relaxed fit silhouette, crew neck, fad",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-all-over-print-womens-t-shirt-fa21",
  "slug": "qikink-t-shirts-all-over-print-womens-t-shirt-fa21",
  "title": "Rare Ember Female AOP T-Shirt | FA21",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/71/9c7d2649-6581-4b6c-b728-087dd463f42e.jpg",
  "supplier": "qikink",
  "short": "Female AOP T-Shirt Made from 180 GSM 100% spun polyester fabric with a regular fit, folded neck, fade-proof print, and OEKO-TEX certified in",
  "story": "Female AOP T-Shirt Made from 180 GSM 100% spun polyester fabric with a regular fit, folded neck, fade-proof print, and OEKO-TEX certified inks. Compatible with sublimation printing.",
  "details": [
    "Female AOP T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember premiu",
    "Made from 180 GSM 100% spun polyester fabric with a regular fit, folded neck, fade-proof p",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-all-over-print-tank-top-fa37",
  "slug": "qikink-tops-all-over-print-tank-top-fa37",
  "title": "Rare Ember Female AOP Tank Top | FA37",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/91/26987347-573e-4e76-8812-d7bf55088d48.jpg",
  "supplier": "qikink",
  "short": "Female AOP Tank Top Made from 180 GSM 100% spun polyester fabric with a regular fit, crew neck, folded edges, and fade-proof print. Compatib",
  "story": "Female AOP Tank Top Made from 180 GSM 100% spun polyester fabric with a regular fit, crew neck, folded edges, and fade-proof print. Compatible with sublimation printing.",
  "details": [
    "Female AOP Tank Top with custom printing on Rare Ember Studio, order as a Rare Ember premi",
    "Made from 180 GSM 100% spun polyester fabric with a regular fit, crew neck, folded edges,",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-all-over-print-tube-top-ft12",
  "slug": "qikink-tops-all-over-print-tube-top-ft12",
  "title": "Rare Ember Female AOP Tube Top | FT12",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/307/bcccc440-379b-4440-acd6-cee25d0e3e31.jpg",
  "supplier": "qikink",
  "short": "Female AOP Tube Top Made from 220 GSM poly spandex fabric with a skin-fit silhouette, elastic top edge, and breathable stretchable construct",
  "story": "Female AOP Tube Top Made from 220 GSM poly spandex fabric with a skin-fit silhouette, elastic top edge, and breathable stretchable construction. Compatible with sublimation printing.",
  "details": [
    "Female AOP Tube Top with custom printing on Rare Ember Studio, order as a Rare Ember premi",
    "Made from 220 GSM poly spandex fabric with a skin-fit silhouette, elastic top edge, and br",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-baby-tee-ft47",
  "slug": "qikink-tops-baby-tee-ft47",
  "title": "Rare Ember Female Baby Tee | FT47",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/303/ddd6f291-0609-4da6-8afc-84b26571cc24.jpg",
  "supplier": "qikink",
  "short": "Baby Tee Made from 240 GSM 95% cotton and 5% spandex with a fitted silhouette, cropped length, pre-shrunk and bio-washed fabric.",
  "story": "Baby Tee Made from 240 GSM 95% cotton and 5% spandex with a fitted silhouette, cropped length, pre-shrunk and bio-washed fabric.",
  "details": [
    "Baby Tee with custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from 240 GSM 95% cotton and 5% spandex with a fitted silhouette, cropped length, pre-",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-women-t-shirt-uc21",
  "slug": "qikink-t-shirts-women-t-shirt-uc21",
  "title": "Rare Ember Female Classic Crew T-Shirt",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.5,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/35/9348ae4f-9ae7-4c14-b289-e34b500d03f2.jpg",
  "supplier": "qikink",
  "short": "Women T-Shirt Made from 180 GSM 100% cotton with a regular fit, folded neck, pre-shrunk and bio-washed fabric. Supports DTG, DTF, embroidery",
  "story": "Women T-Shirt Made from 180 GSM 100% cotton with a regular fit, folded neck, pre-shrunk and bio-washed fabric. Supports DTG, DTF, embroidery, vinyl, and screen printing.",
  "details": [
    "Women T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember premium pri",
    "Made from 180 GSM 100% cotton with a regular fit, folded neck, pre-shrunk and bio-washed f",
    "Supports DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-crop-tank-fc40",
  "slug": "qikink-tops-crop-tank-fc40",
  "title": "Rare Ember Female Crop Tank | FC40",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/36/db54afc0-4147-490b-a5bb-cdbd07594e1b.jpg",
  "supplier": "qikink",
  "short": "Crop Tank Made from 180 GSM 100% cotton with a regular fit, folded neck, double-stitched seams, pre-shrunk and bio-washed fabric.",
  "story": "Crop Tank Made from 180 GSM 100% cotton with a regular fit, folded neck, double-stitched seams, pre-shrunk and bio-washed fabric.",
  "details": [
    "Crop Tank with custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from 180 GSM 100% cotton with a regular fit, folded neck, double-stitched seams, pre-",
    "Compatible with DTG, DTF, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-crop-top-fc39",
  "slug": "qikink-tops-crop-top-fc39",
  "title": "Rare Ember Female Crop Top | FC39",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/37/604e613a-23a0-44ff-9c78-8c9711aa4332.jpg",
  "supplier": "qikink",
  "short": "Crop Top Made from 180 GSM 100% cotton with a regular fit, lycra ribbed neck, double-stitched seams, pre-shrunk and bio-washed fabric.",
  "story": "Crop Top Made from 180 GSM 100% cotton with a regular fit, lycra ribbed neck, double-stitched seams, pre-shrunk and bio-washed fabric.",
  "details": [
    "Crop Top with custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from 180 GSM 100% cotton with a regular fit, lycra ribbed neck, double-stitched seams",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-cropped-hoodie-fc32",
  "slug": "qikink-hoodies-cropped-hoodie-fc32",
  "title": "Rare Ember Female Cropped Hoodie | FC32",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/14/905f2760-b428-4095-9427-4e0373b550fd.jpg",
  "supplier": "qikink",
  "short": "Cropped Hoodie Made from 300 GSM 90% cotton and 10% polyester fabric with a cropped fit, hooded construction, derby ribbed cuffs and hem, su",
  "story": "Cropped Hoodie Made from 300 GSM 90% cotton and 10% polyester fabric with a cropped fit, hooded construction, derby ribbed cuffs and hem, super combed, pre-shrunk and bio-washed finish.",
  "details": [
    "Cropped Hoodie with custom printing on Rare Ember Studio, order as a Rare Ember premium pr",
    "Made from 300 GSM 90% cotton and 10% polyester fabric with a cropped fit, hooded construct",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-dresses-maternity-dresses-fm44",
  "slug": "qikink-dresses-maternity-dresses-fm44",
  "title": "Rare Ember Female Maternity Dress | FM44",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/47/4ec08e14-d7dd-4b9d-b753-1f294d8e7174.jpg",
  "supplier": "qikink",
  "short": "Maternity Dress Made from 180 GSM 100% cotton with a regular fit, round neck, side gathers, pre-shrunk and bio-washed fabric.",
  "story": "Maternity Dress Made from 180 GSM 100% cotton with a regular fit, round neck, side gathers, pre-shrunk and bio-washed fabric.",
  "details": [
    "Maternity Dress with custom printing on Rare Ember Studio, order as a Rare Ember premium p",
    "Made from 180 GSM 100% cotton with a regular fit, round neck, side gathers, pre-shrunk and",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-dresses-t-shirt-dress-fc43",
  "slug": "qikink-dresses-t-shirt-dress-fc43",
  "title": "Rare Ember Female T-Shirt Dress | FC43",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/48/85ac8383-8a57-4d5d-b64d-3c4dd0b0c1e9.jpg",
  "supplier": "qikink",
  "short": "T-Shirt Dress Made from 180 GSM 100% cotton with a relaxed fit, round neck, pre-shrunk and bio-washed fabric.",
  "story": "T-Shirt Dress Made from 180 GSM 100% cotton with a relaxed fit, round neck, pre-shrunk and bio-washed fabric.",
  "details": [
    "T-Shirt Dress with custom printing on Rare Ember Studio, order as a Rare Ember premium pri",
    "Made from 180 GSM 100% cotton with a relaxed fit, round neck, pre-shrunk and bio-washed fa",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-tank-top-ft37",
  "slug": "qikink-tops-tank-top-ft37",
  "title": "Rare Ember Female Tank Top | FT37",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/46/16627c6b-5e64-45fb-b1cb-376d8e88a41d.jpg",
  "supplier": "qikink",
  "short": "Female Tank Top Made from 180 GSM 100% cotton with a regular fit, folded neck, pre-shrunk and bio-washed fabric with double-stitched seams.",
  "story": "Female Tank Top Made from 180 GSM 100% cotton with a regular fit, folded neck, pre-shrunk and bio-washed fabric with double-stitched seams.",
  "details": [
    "Female Tank Top with custom printing on Rare Ember Studio, order as a Rare Ember premium p",
    "Made from 180 GSM 100% cotton with a regular fit, folded neck, pre-shrunk and bio-washed f",
    "Compatible with DTG, DTF, Vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-kids-clothes-t-shirt-for-girls-gc21",
  "slug": "qikink-kids-clothes-t-shirt-for-girls-gc21",
  "title": "Rare Ember Girl Classic Crew T-Shirt",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/59/5d086ca2-e1f3-4e3a-8889-a28e8cb369e5.jpg",
  "supplier": "qikink",
  "short": "Girl Classic Crew T-Shirt Made from 180 GSM 100% super combed cotton with a regular fit, lycra ribbed neck, pre-shrunk and bio-washed fabric",
  "story": "Girl Classic Crew T-Shirt Made from 180 GSM 100% super combed cotton with a regular fit, lycra ribbed neck, pre-shrunk and bio-washed fabric, and double-stitched seams.",
  "details": [
    "Girl Classic Crew T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 180 GSM 100% super combed cotton with a regular fit, lycra ribbed neck, pre-shru",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-all-over-print-headband",
  "slug": "qikink-accessories-all-over-print-headband",
  "title": "Rare Ember Headband | UB58",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/332/b1585864-cf05-4e4f-93e2-84fd866fa92f.webp",
  "supplier": "qikink",
  "short": "Headband Made from a poly spandex blend with a lightweight, stretchable, quick-dry construction and elastic fit. Compatible with sublimation",
  "story": "Headband Made from a poly spandex blend with a lightweight, stretchable, quick-dry construction and elastic fit. Compatible with sublimation printing for edge-to-edge all-over prints.",
  "details": [
    "Headband with custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from a poly spandex blend with a lightweight, stretchable, quick-dry construction and",
    "Compatible with sublimation printing for edge-to-edge all-over prints"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-jersey-t-shirt-us02",
  "slug": "qikink-t-shirts-jersey-t-shirt-us02",
  "title": "Rare Ember Jersey T-Shirt | US02",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/366/7d40a8f7-9778-456d-8190-cd2afdda2bc6.webp",
  "supplier": "qikink",
  "short": "Design & sell custom jersey t-shirts in mesh fabric with sublimation printing. For football, cricket, and kabaddi. Start selling with Rare E",
  "story": "Design & sell custom jersey t-shirts in mesh fabric with sublimation printing. For football, cricket, and kabaddi. Start selling with Rare Ember Studio today.",
  "details": [
    "Design & sell custom jersey t-shirts in mesh fabric with sublimation printing",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-dresses-kaftan-dress",
  "slug": "qikink-dresses-kaftan-dress",
  "title": "Rare Ember Kaftan Dress",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/328/4091aea0-1c85-429b-97aa-7efb7916d9cb.webp",
  "supplier": "qikink",
  "short": "Kaftan Dress Made from polyester fabric with a relaxed fit, V-neck, side slits, and all-over printed construction. Available in multiple siz",
  "story": "Kaftan Dress Made from polyester fabric with a relaxed fit, V-neck, side slits, and all-over printed construction. Available in multiple sizes. Compatible with all-over printing.",
  "details": [
    "Kaftan Dress with custom printing on Rare Ember Studio, order as a Rare Ember premium priv",
    "Made from polyester fabric with a relaxed fit, V-neck, side slits, and all-over printed co",
    "Available in multiple sizes",
    "Compatible with all-over printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-kids-clothes-kids-bomber-jacket-ka30",
  "slug": "qikink-kids-clothes-kids-bomber-jacket-ka30",
  "title": "Rare Ember Kids AOP Bomber Jacket | KA30",
  "price": 15.28,
  "price_inr": 1299,
  "old_price": 2349,
  "compare_at_price": 27.64,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/104/8339a283-0cf9-4d19-bcad-4ecdb79a1254.jpg",
  "supplier": "qikink",
  "short": "Kids AOP Bomber Jacket Made from 240 GSM premium poly brushed fleece with lycra ribbed hem and cuffs, YKK zipper closure, and fade-proof all",
  "story": "Kids AOP Bomber Jacket Made from 240 GSM premium poly brushed fleece with lycra ribbed hem and cuffs, YKK zipper closure, and fade-proof all-over printing using OEKO-TEX certified inks. Compatible with sublimation printing.",
  "details": [
    "Kids AOP Bomber Jacket with custom printing on Rare Ember Studio, order as a Rare Ember pr",
    "Made from 240 GSM premium poly brushed fleece with lycra ribbed hem and cuffs, YKK zipper",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-kids-clothes-all-over-print-sports-shorts-ka52",
  "slug": "qikink-kids-clothes-all-over-print-sports-shorts-ka52",
  "title": "Rare Ember Kids AOP Sports Shorts | KA52",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👖",
  "tag": "Athletic Fleece",
  "tagColor": "#3b82f6",
  "tagBg": "rgba(59, 130, 246, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/116/6dd5af52-4846-4f8b-929f-c8babf8591a8.jpg",
  "supplier": "qikink",
  "short": "Kids AOP Sports Shorts Made from 170 GSM poly mesh fabric with Dri-FIT technology, an inner drawstring cord, unisex styling, and slip-on poc",
  "story": "Kids AOP Sports Shorts Made from 170 GSM poly mesh fabric with Dri-FIT technology, an inner drawstring cord, unisex styling, and slip-on pockets for everyday comfort. Features fade-proof all-over prints and is compatible with sublimation printing.",
  "details": [
    "Kids AOP Sports Shorts with custom printing on Rare Ember Studio, order as a Rare Ember pr",
    "Made from 170 GSM poly mesh fabric with Dri-FIT technology, an inner drawstring cord, unis",
    "Features fade-proof all-over prints and is compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-kids-clothes-all-over-print-sports-t-shirt-ka51",
  "slug": "qikink-kids-clothes-all-over-print-sports-t-shirt-ka51",
  "title": "Rare Ember Kids AOP Sports T-Shirt | KA51",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/115/e6759c06-ecfe-48ee-b9bb-6771b8f3fec2.jpg",
  "supplier": "qikink",
  "short": "Kids AOP Sports T-Shirt Made from 170 GSM poly mesh fabric with Dri-FIT technology, a unisex regular fit, and fade-proof prints for active w",
  "story": "Kids AOP Sports T-Shirt Made from 170 GSM poly mesh fabric with Dri-FIT technology, a unisex regular fit, and fade-proof prints for active wear. Compatible with sublimation printing.",
  "details": [
    "Kids AOP Sports T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember p",
    "Made from 170 GSM poly mesh fabric with Dri-FIT technology, a unisex regular fit, and fade",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-kids-clothes-all-over-print-sweatshirt-ka35",
  "slug": "qikink-kids-clothes-all-over-print-sweatshirt-ka35",
  "title": "Rare Ember Kids AOP Sweatshirt | KA35",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/96/a006b216-cc8d-4050-a66b-96553d97abdb.jpg",
  "supplier": "qikink",
  "short": "Kids AOP Sweatshirt Made from 240 GSM premium 100% polyester with premium poly brushed fleece, a unisex regular fit, derby ribbed hem and cu",
  "story": "Kids AOP Sweatshirt Made from 240 GSM premium 100% polyester with premium poly brushed fleece, a unisex regular fit, derby ribbed hem and cuffs, and fade-proof all-over prints using OEKO-TEX certified inks. Compatible with dye sublimation printing.",
  "details": [
    "Kids AOP Sweatshirt with custom printing on Rare Ember Studio, order as a Rare Ember premi",
    "Made from 240 GSM premium 100% polyester with premium poly brushed fleece, a unisex regula",
    "Compatible with dye sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-kids-clothes-all-over-print-t-shirt-ka71",
  "slug": "qikink-kids-clothes-all-over-print-t-shirt-ka71",
  "title": "Rare Ember Kids AOP T-Shirt | KA71",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/271/953b88c1-a814-4ec0-86ac-e35b86795468.jpg",
  "supplier": "qikink",
  "short": "Kids AOP T-Shirt Made from 180 GSM spun polyester fabric with a unisex regular fit, folded neck, fade-proof all-over print, and double-stitc",
  "story": "Kids AOP T-Shirt Made from 180 GSM spun polyester fabric with a unisex regular fit, folded neck, fade-proof all-over print, and double-stitched construction. Compatible with sublimation printing.",
  "details": [
    "Kids AOP T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from 180 GSM spun polyester fabric with a unisex regular fit, folded neck, fade-proof",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-kids-clothes-hoodie-kh63",
  "slug": "qikink-kids-clothes-hoodie-kh63",
  "title": "Rare Ember Kids Hoodie",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/10/47e49ed9-f1cd-4c59-9987-3c592b3c3094.jpg",
  "supplier": "qikink",
  "short": "Kids Hoodie Made from 300 GSM 100% super combed cotton brushed fleece with a unisex regular fit, derby ribbed waist, pre-shrunk and bio-wash",
  "story": "Kids Hoodie Made from 300 GSM 100% super combed cotton brushed fleece with a unisex regular fit, derby ribbed waist, pre-shrunk and bio-washed fabric, and double-stitched seams.",
  "details": [
    "Kids Hoodie with custom printing on Rare Ember Studio, order as a Rare Ember premium priva",
    "Made from 300 GSM 100% super combed cotton brushed fleece with a unisex regular fit, derby",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-all-over-print-full-sleeve-t-shirt-ma27",
  "slug": "qikink-t-shirts-all-over-print-full-sleeve-t-shirt-ma27",
  "title": "Rare Ember Male AOP Full Sleeve Tee | MA27",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/94/8932083e-236b-4354-b3b7-de8d9daf7d34.jpg",
  "supplier": "qikink",
  "short": "Male AOP Full Sleeve Tee Made from 180 GSM 100% spun polyester fabric with a unisex regular fit, folded neck, and fade-proof print. Compatib",
  "story": "Male AOP Full Sleeve Tee Made from 180 GSM 100% spun polyester fabric with a unisex regular fit, folded neck, and fade-proof print. Compatible with sublimation printing.",
  "details": [
    "Male AOP Full Sleeve Tee with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 180 GSM 100% spun polyester fabric with a unisex regular fit, folded neck, and f",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-all-over-print-vest-ma29",
  "slug": "qikink-tops-all-over-print-vest-ma29",
  "title": "Rare Ember Male AOP Sleeveless Tee | MA29",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/77/419a3d50-9cf0-4d8d-9729-cc80fea0af85.jpg",
  "supplier": "qikink",
  "short": "Male AOP Sleeveless Tee Made from 180 GSM 100% spun polyester fabric with a regular fit, folded edges, and fade-proof print. Compatible with",
  "story": "Male AOP Sleeveless Tee Made from 180 GSM 100% spun polyester fabric with a regular fit, folded edges, and fade-proof print. Compatible with sublimation printing.",
  "details": [
    "Male AOP Sleeveless Tee with custom printing on Rare Ember Studio, order as a Rare Ember p",
    "Made from 180 GSM 100% spun polyester fabric with a regular fit, folded edges, and fade-pr",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-all-over-print-t-shirt-ua21",
  "slug": "qikink-t-shirts-all-over-print-t-shirt-ua21",
  "title": "Rare Ember Male AOP T-Shirt | UA21",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.8,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/88/7a810370-e3f7-4151-939d-12c5c6966b2c.jpg",
  "supplier": "qikink",
  "short": "Male AOP T-Shirt Made from 180 GSM 100% spun polyester fabric with a unisex regular fit, folded neck, double-stitched construction, and fade",
  "story": "Male AOP T-Shirt Made from 180 GSM 100% spun polyester fabric with a unisex regular fit, folded neck, double-stitched construction, and fade-proof print. Compatible with sublimation printing.",
  "details": [
    "Male AOP T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from 180 GSM 100% spun polyester fabric with a unisex regular fit, folded neck, doubl",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-bike-rider-t-shirt-ma39",
  "slug": "qikink-t-shirts-bike-rider-t-shirt-ma39",
  "title": "Rare Ember Male Bike Rider T-Shirt | MA39",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/274/b4d525d7-4286-4dc2-9260-057ebadb7a62.jpg",
  "supplier": "qikink",
  "short": "Male Bike Rider T-Shirt Made from 170 GSM poly mesh fabric with a lightweight regular fit and all-over printed construction. Compatible with",
  "story": "Male Bike Rider T-Shirt Made from 170 GSM poly mesh fabric with a lightweight regular fit and all-over printed construction. Compatible with all-over printing.",
  "details": [
    "Male Bike Rider T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember p",
    "Made from 170 GSM poly mesh fabric with a lightweight regular fit and all-over printed con",
    "Compatible with all-over printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-round-neck-t-shirt-classic-uc21",
  "slug": "qikink-t-shirts-round-neck-t-shirt-classic-uc21",
  "title": "Rare Ember Male Classic Crew T-Shirt",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.6,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/6/f787f104-9e35-4cad-acab-05be0c7f322d.jpg",
  "supplier": "qikink",
  "short": "Round Neck T-Shirt Classic Made from 180 GSM cotton fabric with a regular fit, ribbed neck, double-stitched seams, pre-shrunk and bio-washed",
  "story": "Round Neck T-Shirt Classic Made from 180 GSM cotton fabric with a regular fit, ribbed neck, double-stitched seams, pre-shrunk and bio-washed construction.",
  "details": [
    "Round Neck T-Shirt Classic with custom printing on Rare Ember Studio, order as a Rare Embe",
    "Made from 180 GSM cotton fabric with a regular fit, ribbed neck, double-stitched seams, pr",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-full-sleeve-t-shirt-mf31",
  "slug": "qikink-t-shirts-full-sleeve-t-shirt-mf31",
  "title": "Rare Ember Male Full Sleeve T-Shirt",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.3,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/21/6f2f965a-2e18-4da3-b3b7-897814e6f0a4.jpg",
  "supplier": "qikink",
  "short": "Full Sleeve T-Shirt Made from 180 GSM 100% cotton with a regular fit, lycra ribbed neck, super combed, pre-shrunk and bio-washed fabric.",
  "story": "Full Sleeve T-Shirt Made from 180 GSM 100% cotton with a regular fit, lycra ribbed neck, super combed, pre-shrunk and bio-washed fabric.",
  "details": [
    "Full Sleeve T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember premi",
    "Made from 180 GSM 100% cotton with a regular fit, lycra ribbed neck, super combed, pre-shr",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-polo-t-shirts-mp25",
  "slug": "qikink-t-shirts-polo-t-shirts-mp25",
  "title": "Rare Ember Male Polo | MP25",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.8,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/18/10c8083a-3fff-4839-a473-f6c07cc6b708.jpg",
  "supplier": "qikink",
  "short": "Polo T-Shirt Made from 220 GSM 100% cotton with a regular fit, polo collar, button placket, super combed, pre-shrunk and bio-washed fabric.",
  "story": "Polo T-Shirt Made from 220 GSM 100% cotton with a regular fit, polo collar, button placket, super combed, pre-shrunk and bio-washed fabric.",
  "details": [
    "Polo T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember premium priv",
    "Made from 220 GSM 100% cotton with a regular fit, polo collar, button placket, super combe",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-raglan-t-shirt-ur37",
  "slug": "qikink-t-shirts-raglan-t-shirt-ur37",
  "title": "Rare Ember Male Raglan T-Shirt | UR37",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.7,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/67/9527b8eb-b761-441c-954e-a652bdff46bc.jpg",
  "supplier": "qikink",
  "short": "Unisex Raglan T-Shirt Made from 180 GSM 100% cotton with a regular fit, contrast raglan sleeves, ribbed neck, pre-shrunk and bio-washed fabr",
  "story": "Unisex Raglan T-Shirt Made from 180 GSM 100% cotton with a regular fit, contrast raglan sleeves, ribbed neck, pre-shrunk and bio-washed fabric.",
  "details": [
    "Unisex Raglan T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember pre",
    "Made from 180 GSM 100% cotton with a regular fit, contrast raglan sleeves, ribbed neck, pr",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-gym-vest-men-ms36",
  "slug": "qikink-tops-gym-vest-men-ms36",
  "title": "Rare Ember Male Sleeveless T-Shirt | MS36",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/66/84dab9ed-cfbd-4259-b12f-50dc3f96154e.jpg",
  "supplier": "qikink",
  "short": "Gym Vest Men Made from 180 GSM 100% cotton with a regular fit, sleeveless construction, folded neck, pre-shrunk and bio-washed fabric.",
  "story": "Gym Vest Men Made from 180 GSM 100% cotton with a regular fit, sleeveless construction, folded neck, pre-shrunk and bio-washed fabric.",
  "details": [
    "Gym Vest Men with custom printing on Rare Ember Studio, order as a Rare Ember premium priv",
    "Made from 180 GSM 100% cotton with a regular fit, sleeveless construction, folded neck, pr",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-round-neck-t-shirt-standard-us21",
  "slug": "qikink-t-shirts-round-neck-t-shirt-standard-us21",
  "title": "Rare Ember Male Standard Crew T-Shirt | US21",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.8,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/2/3c5206a9-268b-41bc-9dfa-d75511b34045.jpg",
  "supplier": "qikink",
  "short": "Round Neck T-Shirt Standard custom printing on Rare Ember Studio, Made from 180 GSM 100% cotton, super combed, pre-shrunk, bio-washed fabric",
  "story": "Round Neck T-Shirt Standard custom printing on Rare Ember Studio, Made from 180 GSM 100% cotton, super combed, pre-shrunk, bio-washed fabric with a regular fit and folded neck.",
  "details": [
    "Round Neck T-Shirt Standard custom printing on Rare Ember Studio, order as a Rare Ember pr",
    "Made from 180 GSM 100% cotton, super combed, pre-shrunk, bio-washed fabric with a regular",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-v-neck-t-shirts-uv34",
  "slug": "qikink-t-shirts-v-neck-t-shirts-uv34",
  "title": "Rare Ember Male V Neck T-Shirt | UV34",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/8/25490195-bffb-4a40-aaf9-34ae07831760.jpg",
  "supplier": "qikink",
  "short": "V-Neck T-Shirt Made from 180 GSM 100% cotton with a regular fit, V-neck collar, super combed, pre-shrunk and bio-washed fabric.",
  "story": "V-Neck T-Shirt Made from 180 GSM 100% cotton with a regular fit, V-neck collar, super combed, pre-shrunk and bio-washed fabric.",
  "details": [
    "V-Neck T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember premium pr",
    "Made from 180 GSM 100% cotton with a regular fit, V-neck collar, super combed, pre-shrunk",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-dresses-all-over-print-mini-skirt-fs59",
  "slug": "qikink-dresses-all-over-print-mini-skirt-fs59",
  "title": "Rare Ember Mini Skirt | FS59",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/329/6d1e21d1-e3a7-46f4-a8c6-a4d90d21dcde.webp",
  "supplier": "qikink",
  "short": "Mini Skirt Made from 220 GSM poly spandex fabric with a mid-rise fit, elastic waistband, and stretchable construction. Compatible with subli",
  "story": "Mini Skirt Made from 220 GSM poly spandex fabric with a mid-rise fit, elastic waistband, and stretchable construction. Compatible with sublimation printing for edge-to-edge all-over prints.",
  "details": [
    "Mini Skirt with custom printing on Rare Ember Studio, order as a Rare Ember premium privat",
    "Made from 220 GSM poly spandex fabric with a mid-rise fit, elastic waistband, and stretcha",
    "Compatible with sublimation printing for edge-to-edge all-over prints"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-oversized-jersey-t-shirt-uj35",
  "slug": "qikink-t-shirts-oversized-jersey-t-shirt-uj35",
  "title": "Rare Ember Oversized Jersey T-Shirt | UJ35",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/364/bf16dfd9-c6c1-493b-a45b-92058dd67b6e.webp",
  "supplier": "qikink",
  "short": "Design & sell custom oversized jersey T-shirts in fade-proof sublimation. No minimums - start your brand with Rare Ember Studio today.",
  "story": "Design & sell custom oversized jersey T-shirts in fade-proof sublimation. No minimums - start your brand with Rare Ember Studio today.",
  "details": [
    "Design & sell custom oversized jersey T-shirts in fade-proof sublimation",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-oversized-raglan-t-shirt-ur50",
  "slug": "qikink-t-shirts-oversized-raglan-t-shirt-ur50",
  "title": "Rare Ember Oversized Raglan T-Shirt | UR50",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.8,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/350/1fe3c23a-b035-4215-b44a-42966c9936c7.webp",
  "supplier": "qikink",
  "short": "Oversized Raglan T-Shirt Made from 180 GSM 100% cotton with an oversized fit, ribbed neck, bio-washed and pre-shrunk fabric featuring contra",
  "story": "Oversized Raglan T-Shirt Made from 180 GSM 100% cotton with an oversized fit, ribbed neck, bio-washed and pre-shrunk fabric featuring contrast raglan sleeves.",
  "details": [
    "Oversized Raglan T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 180 GSM 100% cotton with an oversized fit, ribbed neck, bio-washed and pre-shrun",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-pullover-hoodie-uh83",
  "slug": "qikink-hoodies-pullover-hoodie-uh83",
  "title": "Rare Ember Pullover Hoodie | UH83",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/323/1f4a0177-315c-4dd0-ad0a-395c38aa4f83.webp",
  "supplier": "qikink",
  "short": "Pullover Hoodie Made from 260 GSM 90% cotton and 10% polyester tri-layer terry fabric with a unisex regular fit, ribbed cuffs, ribbed hem, a",
  "story": "Pullover Hoodie Made from 260 GSM 90% cotton and 10% polyester tri-layer terry fabric with a unisex regular fit, ribbed cuffs, ribbed hem, and hooded construction.",
  "details": [
    "Pullover Hoodie with custom printing on Rare Ember Studio, order as a Rare Ember premium p",
    "Made from 260 GSM 90% cotton and 10% polyester tri-layer terry fabric with a unisex regula",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-ringer-t-shirt-ur39",
  "slug": "qikink-t-shirts-ringer-t-shirt-ur39",
  "title": "Rare Ember Ringer T-Shirt | UR39",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/347/39ce3000-586f-447c-b0b9-a6f2b9b1bcd6.webp",
  "supplier": "qikink",
  "short": "Ringer T-Shirt custom printing on Rare Ember Studio, Made from 180 GSM 100% cotton, super combed, pre-shrunk, and bio-washed fabric with con",
  "story": "Ringer T-Shirt custom printing on Rare Ember Studio, Made from 180 GSM 100% cotton, super combed, pre-shrunk, and bio-washed fabric with contrast rib neck and self-turned sleeves. Supports DTG, DTF, embroidery, vinyl, and screen printing.",
  "details": [
    "Ringer T-Shirt custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from 180 GSM 100% cotton, super combed, pre-shrunk, and bio-washed fabric with contra",
    "Supports DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tops-sports-crop-top",
  "slug": "qikink-tops-sports-crop-top",
  "title": "Rare Ember Sports Crop top | FC34",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/358/8d69fff6-2da7-4674-9329-5677d9604ae4.webp",
  "supplier": "qikink",
  "short": "Sell gym/sports crop tops with Rare Ember Studio's print-on-demand model. 220 GSM poly-spandex, all-over print ready, no minimums. Start sel",
  "story": "Sell gym/sports crop tops with Rare Ember Studio's print-on-demand model. 220 GSM poly-spandex, all-over print ready, no minimums. Start selling.",
  "details": [
    "Sell gym/sports crop tops with Rare Ember Studio's print-on-demand model",
    "220 GSM poly-spandex, all-over print ready, no minimums",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-all-over-print-bomber-jacket-ua30",
  "slug": "qikink-hoodies-all-over-print-bomber-jacket-ua30",
  "title": "Rare Ember Unisex AOP Bomber Jacket | UA30",
  "price": 15.28,
  "price_inr": 1299,
  "old_price": 2349,
  "compare_at_price": 27.64,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 4.7,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/102/25a6fc74-6152-48f5-b465-72c5c8d4be72.webp",
  "supplier": "qikink",
  "short": "Unisex AOP Bomber Jacket Made from 240 GSM premium poly brushed fleece fabric with a unisex regular fit, lycra ribbed collar, cuffs and hem,",
  "story": "Unisex AOP Bomber Jacket Made from 240 GSM premium poly brushed fleece fabric with a unisex regular fit, lycra ribbed collar, cuffs and hem, front YKK zipper closure, and functional side pockets. Fade-proof all-over sublimation print suitable for custom designs.",
  "details": [
    "Unisex AOP Bomber Jacket with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 240 GSM premium poly brushed fleece fabric with a unisex regular fit, lycra ribb",
    "Fade-proof all-over sublimation print suitable for custom designs"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-all-over-print-oversized-t-shirt-ua22",
  "slug": "qikink-t-shirts-all-over-print-oversized-t-shirt-ua22",
  "title": "Rare Ember Unisex AOP Oversized Tee | UA22",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.2,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/93/fb09bc1b-f0dd-4a3f-b538-46bcd407ef19.jpg",
  "supplier": "qikink",
  "short": "Unisex AOP Oversized Tee Made from 240 GSM micro knitted polyester fabric with a unisex oversized fit, folded neck, and fade-proof print. Co",
  "story": "Unisex AOP Oversized Tee Made from 240 GSM micro knitted polyester fabric with a unisex oversized fit, folded neck, and fade-proof print. Compatible with sublimation printing.",
  "details": [
    "Unisex AOP Oversized Tee with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 240 GSM micro knitted polyester fabric with a unisex oversized fit, folded neck,",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bottomwear-all-over-print-shorts-ma45",
  "slug": "qikink-bottomwear-all-over-print-shorts-ma45",
  "title": "Rare Ember Unisex AOP Shorts | MA45",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👖",
  "tag": "Athletic Fleece",
  "tagColor": "#3b82f6",
  "tagBg": "rgba(59, 130, 246, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/100/c7ed33b9-1490-4ac7-ad12-b8f5b4dcf113.jpg",
  "supplier": "qikink",
  "short": "Unisex AOP Shorts Made from 240 GSM micro knitted polyester fabric with a unisex regular fit, slip-on pockets, inner drawstring cord, and fa",
  "story": "Unisex AOP Shorts Made from 240 GSM micro knitted polyester fabric with a unisex regular fit, slip-on pockets, inner drawstring cord, and fade-proof all-over sublimation print. Compatible with sublimation printing.",
  "details": [
    "Unisex AOP Shorts with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from 240 GSM micro knitted polyester fabric with a unisex regular fit, slip-on pocket",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bottomwear-all-over-print-sports-shorts-ua52",
  "slug": "qikink-bottomwear-all-over-print-sports-shorts-ua52",
  "title": "Rare Ember Unisex AOP Sports Shorts | UA52",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "👖",
  "tag": "Athletic Fleece",
  "tagColor": "#3b82f6",
  "tagBg": "rgba(59, 130, 246, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/112/3ae88a86-ea21-46f4-a52f-509e6d30f62d.jpg",
  "supplier": "qikink",
  "short": "Unisex AOP Sports Shorts Made from 170 GSM poly mesh fabric with a unisex regular fit, inner drawstring cord, slip-on pockets, and fade-proo",
  "story": "Unisex AOP Sports Shorts Made from 170 GSM poly mesh fabric with a unisex regular fit, inner drawstring cord, slip-on pockets, and fade-proof all-over sublimation print designed for sports use. Compatible with sublimation printing.",
  "details": [
    "Unisex AOP Sports Shorts with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 170 GSM poly mesh fabric with a unisex regular fit, inner drawstring cord, slip-",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-all-over-print-sports-t-shirt-ua51",
  "slug": "qikink-t-shirts-all-over-print-sports-t-shirt-ua51",
  "title": "Rare Ember Unisex AOP Sports T-Shirt | UA51",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.5,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/111/c208cba0-757f-49ff-8be8-e1c3db94cd4a.jpg",
  "supplier": "qikink",
  "short": "Unisex AOP Sports T-Shirt Made from 170 GSM poly mesh fabric with a unisex regular fit, Dri-FIT structure, and fade-proof all-over sublimati",
  "story": "Unisex AOP Sports T-Shirt Made from 170 GSM poly mesh fabric with a unisex regular fit, Dri-FIT structure, and fade-proof all-over sublimation print designed for sports use. Compatible with sublimation printing.",
  "details": [
    "Unisex AOP Sports T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 170 GSM poly mesh fabric with a unisex regular fit, Dri-FIT structure, and fade-",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-all-over-print-sweatshirt-ua26",
  "slug": "qikink-hoodies-all-over-print-sweatshirt-ua26",
  "title": "Rare Ember Unisex AOP Sweatshirt | UA26",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/39/858a2e48-f3f9-4789-aaf2-fe61b3c9f0f7.webp",
  "supplier": "qikink",
  "short": "Unisex AOP Sweatshirt Made from 240 GSM premium poly brushed fleece fabric with a regular unisex fit, derby ribbed hem and cuffs, and HD fad",
  "story": "Unisex AOP Sweatshirt Made from 240 GSM premium poly brushed fleece fabric with a regular unisex fit, derby ribbed hem and cuffs, and HD fade-proof all-over sublimation print. Compatible with sublimation printing.",
  "details": [
    "Unisex AOP Sweatshirt with custom printing on Rare Ember Studio, order as a Rare Ember pre",
    "Made from 240 GSM premium poly brushed fleece fabric with a regular unisex fit, derby ribb",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-acid-wash-hoodie-uh62",
  "slug": "qikink-hoodies-acid-wash-hoodie-uh62",
  "title": "Rare Ember Unisex Acid Wash Hoodie | UH62",
  "price": 15.28,
  "price_inr": 1299,
  "old_price": 2349,
  "compare_at_price": 27.64,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/118/7b58b1da-f241-4994-a5a2-f1a4ec2b5c94.jpg",
  "supplier": "qikink",
  "short": "Unisex Acid Wash Hoodie Made from 300 GSM 100% cotton fabric with a unisex regular fit, super combed, pre-shrunk, acid-washed finish, and de",
  "story": "Unisex Acid Wash Hoodie Made from 300 GSM 100% cotton fabric with a unisex regular fit, super combed, pre-shrunk, acid-washed finish, and derby ribbed hem and cuffs.",
  "details": [
    "Unisex Acid Wash Hoodie with custom printing on Rare Ember Studio, order as a Rare Ember p",
    "Made from 300 GSM 100% cotton fabric with a unisex regular fit, super combed, pre-shrunk,",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-acid-wash-oversized-t-shirt-uc61",
  "slug": "qikink-t-shirts-acid-wash-oversized-t-shirt-uc61",
  "title": "Rare Ember Unisex Acid Wash Oversized Tee | UC61",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.6,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/4ca57c05-41a5-45b1-9856-5c6ac1e7f33f.jpg",
  "supplier": "qikink",
  "short": "Unisex Acid Wash Oversized Tee Made from 240 GSM 100% super combed cotton with an oversized fit, Lycra ribbed neck, pre-shrunk and acid-wash",
  "story": "Unisex Acid Wash Oversized Tee Made from 240 GSM 100% super combed cotton with an oversized fit, Lycra ribbed neck, pre-shrunk and acid-washed fabric.",
  "details": [
    "Unisex Acid Wash Oversized Tee with custom printing on Rare Ember Studio, order as a Rare",
    "Made from 240 GSM 100% super combed cotton with an oversized fit, Lycra ribbed neck, pre-s",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-headwear-baseball-ottoman-cap-bc50",
  "slug": "qikink-headwear-baseball-ottoman-cap-bc50",
  "title": "Rare Ember Unisex Baseball Ottoman Cap | BC50",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "🧢",
  "tag": "Structured Fit",
  "tagColor": "#14b8a6",
  "tagBg": "rgba(20, 184, 166, 0.12)",
  "stock": 500,
  "rating": 2.5,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/143/4c568048-d0bd-4de6-97e6-236c7482f19e.jpg",
  "supplier": "qikink",
  "short": "Unisex Baseball Ottoman Cap Made from polyester ottoman fabric with a 6-panel mid-profile construction, candy Velcro closure, six eyelets, l",
  "story": "Unisex Baseball Ottoman Cap Made from polyester ottoman fabric with a 6-panel mid-profile construction, candy Velcro closure, six eyelets, lightweight design, and universal fit.",
  "details": [
    "Unisex Baseball Ottoman Cap with custom printing on Rare Ember Studio, order as a Rare Emb",
    "Made from polyester ottoman fabric with a 6-panel mid-profile construction, candy Velcro c",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-basic-t-shirt-ub73",
  "slug": "qikink-t-shirts-basic-t-shirt-ub73",
  "title": "Rare Ember Unisex Basic T-Shirt PC | UB73",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 2.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/270/d1b64a8e-af6f-4a9d-b064-6d5c43935d51.jpg",
  "supplier": "qikink",
  "short": "Basic T-Shirt custom printing on Rare Ember Studio, Made from a 180 GSM poly-cotton blend with bio-wash and silicon-wash finish, a unisex fi",
  "story": "Basic T-Shirt custom printing on Rare Ember Studio, Made from a 180 GSM poly-cotton blend with bio-wash and silicon-wash finish, a unisex fit, and lycra rib neck. Available in 8 colours, sizes XS to 2XL.",
  "details": [
    "Basic T-Shirt custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from a 180 GSM poly-cotton blend with bio-wash and silicon-wash finish, a unisex fit,",
    "Available in 8 colours, sizes XS to 2XL",
    "Compatible with DTF, DTG, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-headwear-bucket-hat-bh35",
  "slug": "qikink-headwear-bucket-hat-bh35",
  "title": "Rare Ember Unisex Classic Bucket Hat | BH35",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "🧢",
  "tag": "Structured Fit",
  "tagColor": "#14b8a6",
  "tagBg": "rgba(20, 184, 166, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/123/183ffc8d-4f4e-4a7a-a575-9848a54ed707.jpg",
  "supplier": "qikink",
  "short": "Unisex Classic Bucket Hat Made from 100% heavy cotton with a soft brim, foldable construction, breathable fabric, and unisex fit for everyda",
  "story": "Unisex Classic Bucket Hat Made from 100% heavy cotton with a soft brim, foldable construction, breathable fabric, and unisex fit for everyday wear.",
  "details": [
    "Unisex Classic Bucket Hat with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 100% heavy cotton with a soft brim, foldable construction, breathable fabric, an",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-headwear-snapback-cap-sb30",
  "slug": "qikink-headwear-snapback-cap-sb30",
  "title": "Rare Ember Unisex Classic Snapback Cap | SB30",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "🧢",
  "tag": "Structured Fit",
  "tagColor": "#14b8a6",
  "tagBg": "rgba(20, 184, 166, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/75/e3fb02ee-b805-4e64-9e46-f56218ba5cb3.jpg",
  "supplier": "qikink",
  "short": "Unisex Classic Snapback Cap Made from 100% cotton with a 6-panel construction, flat visor, plastic snapback closure, six eyelets, and breath",
  "story": "Unisex Classic Snapback Cap Made from 100% cotton with a 6-panel construction, flat visor, plastic snapback closure, six eyelets, and breathable fabric.",
  "details": [
    "Unisex Classic Snapback Cap with custom printing on Rare Ember Studio, order as a Rare Emb",
    "Made from 100% cotton with a 6-panel construction, flat visor, plastic snapback closure, s",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-headwear-trucker-cap-tc55",
  "slug": "qikink-headwear-trucker-cap-tc55",
  "title": "Rare Ember Unisex Classic Trucker Cap | TC55",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "🧢",
  "tag": "Structured Fit",
  "tagColor": "#14b8a6",
  "tagBg": "rgba(20, 184, 166, 0.12)",
  "stock": 500,
  "rating": 2.5,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/140/7cf92d8b-a5aa-4e82-810e-a6d721959500.jpg",
  "supplier": "qikink",
  "short": "Unisex Classic Trucker Cap Made from 100% cotton with a 6-panel mesh side and back construction, mid-profile fit, snapback closure, and brea",
  "story": "Unisex Classic Trucker Cap Made from 100% cotton with a 6-panel mesh side and back construction, mid-profile fit, snapback closure, and breathable fabric.",
  "details": [
    "Unisex Classic Trucker Cap with custom printing on Rare Ember Studio, order as a Rare Embe",
    "Made from 100% cotton with a 6-panel mesh side and back construction, mid-profile fit, sna",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-headwear-baseball-cap-bc33",
  "slug": "qikink-headwear-baseball-cap-bc33",
  "title": "Rare Ember Unisex Classic baseball Cap |  BC33",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "🧢",
  "tag": "Structured Fit",
  "tagColor": "#14b8a6",
  "tagBg": "rgba(20, 184, 166, 0.12)",
  "stock": 500,
  "rating": 3.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/86/49d1de97-9b42-4d4a-90f3-faf73458deef.jpg",
  "supplier": "qikink",
  "short": "Unisex Classic Baseball Cap Made from 280 GSM breathable cotton drill fabric with a double-stitched finish, and universal fit.",
  "story": "Unisex Classic Baseball Cap Made from 280 GSM breathable cotton drill fabric with a double-stitched finish, and universal fit.",
  "details": [
    "Unisex Classic Baseball Cap with custom printing on Rare Ember Studio, order as a Rare Emb",
    "Made from 280 GSM breathable cotton drill fabric with a double-stitched finish, and univer",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-stretch-t-shirt-uc48",
  "slug": "qikink-t-shirts-stretch-t-shirt-uc48",
  "title": "Rare Ember Unisex Cotton Stretch T-Shirt | UC48",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.4,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/281/f4b09fc0-67e7-4c43-931e-38916ab758fe.jpg",
  "supplier": "qikink",
  "short": "Stretch T-Shirt Made from 240 GSM 95% cotton and 5% elastane with a unisex fit, lycra rib neck, stretchable, bio-washed, and breathable fabr",
  "story": "Stretch T-Shirt Made from 240 GSM 95% cotton and 5% elastane with a unisex fit, lycra rib neck, stretchable, bio-washed, and breathable fabric.",
  "details": [
    "Stretch T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember premium p",
    "Made from 240 GSM 95% cotton and 5% elastane with a unisex fit, lycra rib neck, stretchabl",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-pet-products-dog-t-shirt-dt59",
  "slug": "qikink-pet-products-dog-t-shirt-dt59",
  "title": "Rare Ember Unisex Dog T-Shirts | DT59",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/149/d5058b9b-372f-4ed1-8336-df42d216f05a.jpg",
  "supplier": "qikink",
  "short": "Unisex Dog T-Shirts Made from 240 GSM 100% cotton fabric with an adjustable neck, sleeveless design, high-tummy cut, breathable construction",
  "story": "Unisex Dog T-Shirts Made from 240 GSM 100% cotton fabric with an adjustable neck, sleeveless design, high-tummy cut, breathable construction, and double-stitched finish for durability.",
  "details": [
    "Unisex Dog T-Shirts with custom printing on Rare Ember Studio, order as a Rare Ember premi",
    "Made from 240 GSM 100% cotton fabric with an adjustable neck, sleeveless design, high-tumm",
    "Compatible with DTF and vinyl printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-unisex-hoodie-uh24",
  "slug": "qikink-hoodies-unisex-hoodie-uh24",
  "title": "Rare Ember Unisex Hoodie",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 4.4,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/5/9bd43925-3bff-4f53-9d92-80c14714fd19.jpg",
  "supplier": "qikink",
  "short": "Unisex Hoodie Made from 300 GSM 90% cotton and 10% polyester fabric with a unisex regular fit, super combed, pre-shrunk, bio-washed finish, ",
  "story": "Unisex Hoodie Made from 300 GSM 90% cotton and 10% polyester fabric with a unisex regular fit, super combed, pre-shrunk, bio-washed finish, and derby ribbed hem and cuffs.",
  "details": [
    "Unisex Hoodie with custom printing on Rare Ember Studio, order as a Rare Ember premium pri",
    "Made from 300 GSM 90% cotton and 10% polyester fabric with a unisex regular fit, super com",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bottomwear-joggers-uj29",
  "slug": "qikink-bottomwear-joggers-uj29",
  "title": "Rare Ember Unisex Joggers | UJ29",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "👖",
  "tag": "Athletic Fleece",
  "tagColor": "#3b82f6",
  "tagBg": "rgba(59, 130, 246, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/32/3f45e6d3-837a-461b-9f52-b2c615eb14e4.jpg",
  "supplier": "qikink",
  "short": "Unisex Joggers Made from 260 GSM 90% cotton and 10% polyester fabric with a unisex regular fit, super combed, pre-shrunk, bio-washed finish,",
  "story": "Unisex Joggers Made from 260 GSM 90% cotton and 10% polyester fabric with a unisex regular fit, super combed, pre-shrunk, bio-washed finish, derby ribbed waist and legs, and back and side pockets.",
  "details": [
    "Unisex Joggers with custom printing on Rare Ember Studio, order as a Rare Ember premium pr",
    "Made from 260 GSM 90% cotton and 10% polyester fabric with a unisex regular fit, super com",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-oversized-t-shirt-uc22",
  "slug": "qikink-t-shirts-oversized-t-shirt-uc22",
  "title": "Rare Ember Unisex Oversized Classic T-Shirt | UC22",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.4,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/3/4d542001-463c-416c-86ea-93effc54f669.jpg",
  "supplier": "qikink",
  "short": "Oversized T-Shirt custom printing on Rare Ember Studio, Made from 240 GSM 100% cotton, super combed, pre-shrunk, bio-washed fabric with a dr",
  "story": "Oversized T-Shirt custom printing on Rare Ember Studio, Made from 240 GSM 100% cotton, super combed, pre-shrunk, bio-washed fabric with a drop shoulder and oversized fit. Supports DTG, DTF, embroidery, vinyl, and screen printing.",
  "details": [
    "Oversized T-Shirt custom printing on Rare Ember Studio, order as a Rare Ember premium priv",
    "Made from 240 GSM 100% cotton, super combed, pre-shrunk, bio-washed fabric with a drop sho",
    "Supports DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-oversized-hoodie-uh32",
  "slug": "qikink-hoodies-oversized-hoodie-uh32",
  "title": "Rare Ember Unisex Oversized Hoodie | UH32",
  "price": 15.28,
  "price_inr": 1299,
  "old_price": 2349,
  "compare_at_price": 27.64,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 4.4,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/82/ddc7518f-afc2-4370-8d1a-43db4863d356.jpg",
  "supplier": "qikink",
  "short": "Unisex Oversized Hoodie Made from 400 GSM 90% cotton and 10% polyester fabric with a drop shoulder oversized fit, derby ribbed cuffs and hem",
  "story": "Unisex Oversized Hoodie Made from 400 GSM 90% cotton and 10% polyester fabric with a drop shoulder oversized fit, derby ribbed cuffs and hem, super combed, pre-shrunk and bio-washed finish.",
  "details": [
    "Unisex Oversized Hoodie with custom printing on Rare Ember Studio, order as a Rare Ember p",
    "Made from 400 GSM 90% cotton and 10% polyester fabric with a drop shoulder oversized fit,",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-short-sleeve-oversized-shirt-uc28",
  "slug": "qikink-t-shirts-short-sleeve-oversized-shirt-uc28",
  "title": "Rare Ember Unisex Oversized Shirt | UC28",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/119/22618348-6284-4d1d-a039-c45243d37e62.jpg",
  "supplier": "qikink",
  "short": "Unisex Short Sleeve Oversized Shirt Made from 240 GSM 100% cotton with a straight hem and front-shoulder detail. Half-sleeve, oversized unis",
  "story": "Unisex Short Sleeve Oversized Shirt Made from 240 GSM 100% cotton with a straight hem and front-shoulder detail. Half-sleeve, oversized unisex fit.",
  "details": [
    "Unisex Short Sleeve Oversized Shirt with custom printing on Rare Ember Studio, order as a",
    "Made from 240 GSM 100% cotton with a straight hem and front-shoulder detail",
    "Half-sleeve, oversized unisex fit"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-oversized-t-shirt-standard-us22",
  "slug": "qikink-t-shirts-oversized-t-shirt-standard-us22",
  "title": "Rare Ember Unisex Oversized Standard T-Shirt | US22",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.5,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg",
  "supplier": "qikink",
  "short": "Oversized T-Shirt Standard custom printing on Rare Ember Studio, Made from 180 GSM 100% cotton, super combed, pre-shrunk, and bio-washed fab",
  "story": "Oversized T-Shirt Standard custom printing on Rare Ember Studio, Made from 180 GSM 100% cotton, super combed, pre-shrunk, and bio-washed fabric with a drop shoulder and oversized fit. Supports DTG, DTF, embroidery, vinyl, and screen printing.",
  "details": [
    "Oversized T-Shirt Standard custom printing on Rare Ember Studio, order as a Rare Ember pre",
    "Made from 180 GSM 100% cotton, super combed, pre-shrunk, and bio-washed fabric with a drop",
    "Supports DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-oversized-sweatshirt-uh35",
  "slug": "qikink-hoodies-oversized-sweatshirt-uh35",
  "title": "Rare Ember Unisex Oversized Sweatshirt | UH35",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/42/e1aabdde-178c-4773-9b54-93df46230600.jpg",
  "supplier": "qikink",
  "short": "Unisex Oversized Sweatshirt Made from 400 GSM 90% cotton and 10% polyester with a drop shoulder oversized fit, derby ribbed hem and cuffs, s",
  "story": "Unisex Oversized Sweatshirt Made from 400 GSM 90% cotton and 10% polyester with a drop shoulder oversized fit, derby ribbed hem and cuffs, super combed, pre-shrunk and bio-washed fabric.",
  "details": [
    "Unisex Oversized Sweatshirt with custom printing on Rare Ember Studio, order as a Rare Emb",
    "Made from 400 GSM 90% cotton and 10% polyester with a drop shoulder oversized fit, derby r",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-headwear-sports-cap-sp45",
  "slug": "qikink-headwear-sports-cap-sp45",
  "title": "Rare Ember Unisex Sports Cap | SP45",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "🧢",
  "tag": "Structured Fit",
  "tagColor": "#14b8a6",
  "tagBg": "rgba(20, 184, 166, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/141/579bd56f-3d83-4145-8658-c4d2f0c84779.jpg",
  "supplier": "qikink",
  "short": "Unisex Sports Cap Made from lightweight polyester fabric with perforated side panels, a 6-panel mid-profile construction, candy Velcro closu",
  "story": "Unisex Sports Cap Made from lightweight polyester fabric with perforated side panels, a 6-panel mid-profile construction, candy Velcro closure, and universal fit.",
  "details": [
    "Unisex Sports Cap with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from lightweight polyester fabric with perforated side panels, a 6-panel mid-profile",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-supima-cotton-t-shirts-uc23",
  "slug": "qikink-t-shirts-supima-cotton-t-shirts-uc23",
  "title": "Rare Ember Unisex Supima T-Shirt | UC23",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.8,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/41/d4c73929-12bd-4e79-ad05-ec41d8d14d5f.jpg",
  "supplier": "qikink",
  "short": "Supima Cotton T-Shirt Made from 160 GSM 100% Supima cotton with a regular fit, lycra ribbed neck, pre-shrunk and bio-washed fabric.",
  "story": "Supima Cotton T-Shirt Made from 160 GSM 100% Supima cotton with a regular fit, lycra ribbed neck, pre-shrunk and bio-washed fabric.",
  "details": [
    "Supima Cotton T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember pre",
    "Made from 160 GSM 100% Supima cotton with a regular fit, lycra ribbed neck, pre-shrunk and",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bottomwear-sweatpants-us52",
  "slug": "qikink-bottomwear-sweatpants-us52",
  "title": "Rare Ember Unisex Sweatpants | US52",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "👖",
  "tag": "Athletic Fleece",
  "tagColor": "#3b82f6",
  "tagBg": "rgba(59, 130, 246, 0.12)",
  "stock": 500,
  "rating": 4.8,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/320/c87587e9-0faa-4c24-8c3d-a74f012c3eb3.webp",
  "supplier": "qikink",
  "short": "Unisex Sweatpants Made from 260 GSM 90% cotton and 10% polyester terry fabric with looped inners, a loose fit, and two front pockets.",
  "story": "Unisex Sweatpants Made from 260 GSM 90% cotton and 10% polyester terry fabric with looped inners, a loose fit, and two front pockets.",
  "details": [
    "Unisex Sweatpants with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from 260 GSM 90% cotton and 10% polyester terry fabric with looped inners, a loose fi",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-sweatshirt-uh26",
  "slug": "qikink-hoodies-sweatshirt-uh26",
  "title": "Rare Ember Unisex Sweatshirt | UH26",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/4/23175e0b-febe-4d12-83e2-f9a76506d24f.jpg",
  "supplier": "qikink",
  "short": "Unisex Sweatshirt Made from 300 GSM 90% cotton and 10% polyester fabric with a unisex regular fit, super combed, pre-shrunk, bio-washed fini",
  "story": "Unisex Sweatshirt Made from 300 GSM 90% cotton and 10% polyester fabric with a unisex regular fit, super combed, pre-shrunk, bio-washed finish, and derby ribbed hem and cuffs.",
  "details": [
    "Unisex Sweatshirt with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from 300 GSM 90% cotton and 10% polyester fabric with a unisex regular fit, super com",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-terry-oversized-t-shirt-ut27",
  "slug": "qikink-t-shirts-terry-oversized-t-shirt-ut27",
  "title": "Rare Ember Unisex Terry Oversized Tee | UT27",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.8,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/44/df1b411b-46ec-4c8f-aa0d-75b796bcda00.jpg",
  "supplier": "qikink",
  "short": "Terry Oversized T-Shirt Made from 260 GSM, 90% cotton and 10% polyester terry fabric with looped inners, a drop shoulder, lycra ribbed neck,",
  "story": "Terry Oversized T-Shirt Made from 260 GSM, 90% cotton and 10% polyester terry fabric with looped inners, a drop shoulder, lycra ribbed neck, and pre-shrunk unisex fit.",
  "details": [
    "Terry Oversized T-Shirt with custom printing on Rare Ember Studio, order as a Rare Ember p",
    "Made from 260 GSM, 90% cotton and 10% polyester terry fabric with looped inners, a drop sh",
    "Compatible with DTG, DTF, embroidery, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bottomwear-terry-shorts-mt45",
  "slug": "qikink-bottomwear-terry-shorts-mt45",
  "title": "Rare Ember Unisex Terry Shorts | MT45",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "👖",
  "tag": "Athletic Fleece",
  "tagColor": "#3b82f6",
  "tagBg": "rgba(59, 130, 246, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/45/b0082153-be94-4108-90a0-f0f5852aa260.jpg",
  "supplier": "qikink",
  "short": "Unisex Terry Shorts Made from 260 GSM 90% cotton and 10% polyester fabric with a unisex fit, drawcord elastic waist, slip-in pockets, and pr",
  "story": "Unisex Terry Shorts Made from 260 GSM 90% cotton and 10% polyester fabric with a unisex fit, drawcord elastic waist, slip-in pockets, and pre-shrunk finish.",
  "details": [
    "Unisex Terry Shorts with custom printing on Rare Ember Studio, order as a Rare Ember premi",
    "Made from 260 GSM 90% cotton and 10% polyester fabric with a unisex fit, drawcord elastic",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-t-shirts-tie-and-dye-oversized-t-shirt-ut58",
  "slug": "qikink-t-shirts-tie-and-dye-oversized-t-shirt-ut58",
  "title": "Rare Ember Unisex Tie Dye Oversized T-Shirt | UT58",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.8,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/286/84f8f6ae-6521-4be1-9e33-07110cf93ec9.jpg",
  "supplier": "qikink",
  "short": "Unisex Tie Dye Oversized T-Shirt Made from 260 GSM 90% cotton and 10% polyester with a drop shoulder, lycra ribbed neck, pre-shrunk and bio-",
  "story": "Unisex Tie Dye Oversized T-Shirt Made from 260 GSM 90% cotton and 10% polyester with a drop shoulder, lycra ribbed neck, pre-shrunk and bio-washed fabric.",
  "details": [
    "Unisex Tie Dye Oversized T-Shirt with custom printing on Rare Ember Studio, order as a Rar",
    "Made from 260 GSM 90% cotton and 10% polyester with a drop shoulder, lycra ribbed neck, pr",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bottomwear-tie-dye-shorts-ut68",
  "slug": "qikink-bottomwear-tie-dye-shorts-ut68",
  "title": "Rare Ember Unisex Tie Dye Shorts | UT68",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "fashion",
  "emoji": "👖",
  "tag": "Athletic Fleece",
  "tagColor": "#3b82f6",
  "tagBg": "rgba(59, 130, 246, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/287/2933eee6-bcfa-4275-a43b-ec2b735b83e6.jpg",
  "supplier": "qikink",
  "short": "Unisex Tie Dye Shorts Made from 260 GSM 90% cotton and 10% polyester fabric with a unisex fit, drawcord elastic waist, slip-in pockets, pre-",
  "story": "Unisex Tie Dye Shorts Made from 260 GSM 90% cotton and 10% polyester fabric with a unisex fit, drawcord elastic waist, slip-in pockets, pre-shrunk and bio-washed finish.",
  "details": [
    "Unisex Tie Dye Shorts with custom printing on Rare Ember Studio, order as a Rare Ember pre",
    "Made from 260 GSM 90% cotton and 10% polyester fabric with a unisex fit, drawcord elastic",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-varsity-jacket-uj31",
  "slug": "qikink-hoodies-varsity-jacket-uj31",
  "title": "Rare Ember Unisex Varsity Jacket | UJ31",
  "price": 15.28,
  "price_inr": 1299,
  "old_price": 2349,
  "compare_at_price": 27.64,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/95/b3298941-1294-4945-ac9c-c5aaafd3403d.jpg",
  "supplier": "qikink",
  "short": "Unisex Varsity Jacket Made from 300 GSM 90% cotton and 10% polyester with a unisex fit, derby ribbed hem and collars, button closure, and tw",
  "story": "Unisex Varsity Jacket Made from 300 GSM 90% cotton and 10% polyester with a unisex fit, derby ribbed hem and collars, button closure, and two front pockets.",
  "details": [
    "Unisex Varsity Jacket with custom printing on Rare Ember Studio, order as a Rare Ember pre",
    "Made from 300 GSM 90% cotton and 10% polyester with a unisex fit, derby ribbed hem and col",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-hoodies-unisex-fleece-heavyweight-zip-hoodie-uh38",
  "slug": "qikink-hoodies-unisex-fleece-heavyweight-zip-hoodie-uh38",
  "title": "Rare Ember Unisex Zip Hoodie | UH38",
  "price": 15.28,
  "price_inr": 1299,
  "old_price": 2349,
  "compare_at_price": 27.64,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Streetwear",
  "tagColor": "#f97316",
  "tagBg": "rgba(249, 115, 22, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/76/e8cb03d3-db36-4ffa-8415-682598c26626.jpg",
  "supplier": "qikink",
  "short": "Unisex Zip Hoodie Made from 400 GSM 90% cotton and 10% polyester with a regular fit, metal zipper, derby ribbed hem and cuffs, super combed,",
  "story": "Unisex Zip Hoodie Made from 400 GSM 90% cotton and 10% polyester with a regular fit, metal zipper, derby ribbed hem and cuffs, super combed, pre-shrunk and bio-washed fabric.",
  "details": [
    "Unisex Zip Hoodie with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from 400 GSM 90% cotton and 10% polyester with a regular fit, metal zipper, derby rib",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bags-all-over-print-large-tote-bag",
  "slug": "qikink-bags-all-over-print-large-tote-bag",
  "title": "Rare Ember AOP Large Tote Bag | UT20",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "general",
  "emoji": "🎒",
  "tag": "Heavy Canvas",
  "tagColor": "#10b981",
  "tagBg": "rgba(16, 185, 129, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/333/4a974e92-0061-4971-a44c-c9bdec02742c.webp",
  "supplier": "qikink",
  "short": "AOP Large Tote Bag Made from 300 GSM fabric with a poly inner lining, key holder, two inner pockets, water bottle holder, and a zippered inn",
  "story": "AOP Large Tote Bag Made from 300 GSM fabric with a poly inner lining, key holder, two inner pockets, water bottle holder, and a zippered inner pocket for organized storage. Designed for fade-resistant all-over printing using OEKO-TEX certified inks.",
  "details": [
    "AOP Large Tote Bag with custom printing on Rare Ember Studio, order as a Rare Ember premiu",
    "Made from 300 GSM fabric with a poly inner lining, key holder, two inner pockets, water bo",
    "Designed for fade-resistant all-over printing using OEKO-TEX certified inks"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-all-over-print-scarf",
  "slug": "qikink-accessories-all-over-print-scarf",
  "title": "Rare Ember AOP Scarf",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/308/0c0d917b-c97c-4c7d-8390-27ccc9ee3c98.jpg",
  "supplier": "qikink",
  "short": "AOP Scarf Made from satin poly woven fabric with a lightweight, silk-like feel and soft, flowy construction. Compatible with sublimation pri",
  "story": "AOP Scarf Made from satin poly woven fabric with a lightweight, silk-like feel and soft, flowy construction. Compatible with sublimation printing for edge-to-edge all-over prints.",
  "details": [
    "AOP Scarf with custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from satin poly woven fabric with a lightweight, silk-like feel and soft, flowy const",
    "Compatible with sublimation printing for edge-to-edge all-over prints"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-all-over-print-stole",
  "slug": "qikink-accessories-all-over-print-stole",
  "title": "Rare Ember AOP Stole",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/309/7a70c078-2bf7-45a2-9f73-a99beac60f0b.jpg",
  "supplier": "qikink",
  "short": "AOP Stole Made from satin poly woven fabric with a lightweight, silk-like feel and soft, flowy construction. Compatible with sublimation pri",
  "story": "AOP Stole Made from satin poly woven fabric with a lightweight, silk-like feel and soft, flowy construction. Compatible with sublimation printing for edge-to-edge all-over prints.",
  "details": [
    "AOP Stole with custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from satin poly woven fabric with a lightweight, silk-like feel and soft, flowy const",
    "Compatible with sublimation printing for edge-to-edge all-over prints"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-scrunchies",
  "slug": "qikink-accessories-scrunchies",
  "title": "Rare Ember AOP Womens Scrunchies",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/276/286a0419-7fdc-4ef2-bc70-d9c7a05c57b8.jpg",
  "supplier": "qikink",
  "short": "Scrunchies Made from lightweight poly spandex fabric with fade-proof all-over printing, durable elastic construction, and individual box pac",
  "story": "Scrunchies Made from lightweight poly spandex fabric with fade-proof all-over printing, durable elastic construction, and individual box packing. Compatible with sublimation printing. Available in a standard size.",
  "details": [
    "Scrunchies with custom printing on Rare Ember Studio, order as a Rare Ember premium privat",
    "Made from lightweight poly spandex fabric with fade-proof all-over printing, durable elast",
    "Compatible with sublimation printing",
    "Available in a standard size"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-acrylic-display-stand",
  "slug": "qikink-accessories-acrylic-display-stand",
  "title": "Rare Ember Acrylic Display Stand",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/301/2f57fe16-4252-44c7-8d18-24da17a382de.jpg",
  "supplier": "qikink",
  "short": "Acrylic Display Stand Made from 3 mm clear acrylic with a glossy finish, two sturdy acrylic support stands, waterproof construction, and fad",
  "story": "Acrylic Display Stand Made from 3 mm clear acrylic with a glossy finish, two sturdy acrylic support stands, waterproof construction, and fade-proof UV printing for vibrant, smudge-free designs. Available in a 4 × 6 inch size.",
  "details": [
    "Acrylic Display Stand with custom printing on Rare Ember Studio, order as a Rare Ember pre",
    "Made from 3 mm clear acrylic with a glossy finish, two sturdy acrylic support stands, wate",
    "Available in a 4 × 6 inch size"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-bar-pendant",
  "slug": "qikink-accessories-bar-pendant",
  "title": "Rare Ember Bar Pendant | UP11",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 1.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/346/97fd86a3-6463-4336-a02a-200b4c9543b4.webp",
  "supplier": "qikink",
  "short": "Bar Pendant with custom engraving on Rare Ember Studio, Made from durable stainless steel with an anti-rust glossy finish in a slim 0.5 × 5 ",
  "story": "Bar Pendant with custom engraving on Rare Ember Studio, Made from durable stainless steel with an anti-rust glossy finish in a slim 0.5 × 5 cm cuboid design. Supports permanent front and back laser engraving and includes a matching chain with gift-ready box packing.",
  "details": [
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-button-badge",
  "slug": "qikink-accessories-button-badge",
  "title": "Rare Ember Black Badge",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/131/e13d62a8-5301-4ac0-b232-b72c8e272d6c.jpg",
  "supplier": "qikink",
  "short": "Button Badge Features a glossy finish, rust-free metal construction, attached safety pin backing, and high-resolution digital printing using",
  "story": "Button Badge Features a glossy finish, rust-free metal construction, attached safety pin backing, and high-resolution digital printing using OEKO-TEX certified Epson inks for vibrant, fade-proof results. Available in multiple badge sizes.",
  "details": [
    "Button Badge with custom printing on Rare Ember Studio, order as a Rare Ember premium priv",
    "Features a glossy finish, rust-free metal construction, attached safety pin backing, and h",
    "Available in multiple badge sizes"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-bookmarks",
  "slug": "qikink-accessories-bookmarks",
  "title": "Rare Ember Bookmark",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/297/7c671510-af4b-4aeb-975b-4e78e71f4825.jpg",
  "supplier": "qikink",
  "short": "Bookmark Made from 3 mm acrylic with a glossy finish, lightweight and waterproof construction, and high-resolution UV printing for vibrant, ",
  "story": "Bookmark Made from 3 mm acrylic with a glossy finish, lightweight and waterproof construction, and high-resolution UV printing for vibrant, fade-proof designs. Available in Classic and Curved Top variants.",
  "details": [
    "Bookmark with custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from 3 mm acrylic with a glossy finish, lightweight and waterproof construction, and",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-all-over-print-bow-scrunchie",
  "slug": "qikink-accessories-all-over-print-bow-scrunchie",
  "title": "Rare Ember Bow Scrunchies | FS37",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/331/ba57d674-d20f-43cb-8e34-898b7cf07ce5.webp",
  "supplier": "qikink",
  "short": "Bow Scrunchies Made from satin poly woven fabric with a lightweight finish, durable, soft texture, and removable bow tail design. Compatible",
  "story": "Bow Scrunchies Made from satin poly woven fabric with a lightweight finish, durable, soft texture, and removable bow tail design. Compatible with sublimation printing for all-over edge-to-edge prints.",
  "details": [
    "Bow Scrunchies with custom printing on Rare Ember Studio, order as a Rare Ember premium pr",
    "Made from satin poly woven fabric with a lightweight finish, durable, soft texture, and re",
    "Compatible with sublimation printing for all-over edge-to-edge prints"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-dog-tags",
  "slug": "qikink-accessories-dog-tags",
  "title": "Rare Ember Dog Tag",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🐾",
  "tag": "Pet Studio",
  "tagColor": "#f43f5e",
  "tagBg": "rgba(244, 63, 94, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/296/9d30eb31-dc89-496e-ac56-e8a586912272.jpg",
  "supplier": "qikink",
  "short": "Dog Tag with custom engraving on Rare Ember Studio, Made from 2 mm thick 304 stainless steel with a glossy anti-rust finish, precision engra",
  "story": "Dog Tag with custom engraving on Rare Ember Studio, Made from 2 mm thick 304 stainless steel with a glossy anti-rust finish, precision engraving, and an included stainless steel ball chain. Supports single- or double-sided engraving for names, dates, logos, or messages.",
  "details": [
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-embroidered-patches",
  "slug": "qikink-accessories-embroidered-patches",
  "title": "Rare Ember Embroidery Patches",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/89/fb56d55e-5827-446f-8538-8ed0d9bd7edb.jpg",
  "supplier": "qikink",
  "short": "Embroidered Patches with custom embroidery on Rare Ember Studio, Made from 100% cotton fabric with premium OEKO-TEX certified Madeira thread",
  "story": "Embroidered Patches with custom embroidery on Rare Ember Studio, Made from 100% cotton fabric with premium OEKO-TEX certified Madeira threads, satin border finish, and iron-on or sew-on application. Available in square, circle, and rectangle variants.",
  "details": [
    "Made from 100% cotton fabric with premium OEKO-TEX certified Madeira threads, satin border",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-fridge-magnets",
  "slug": "qikink-accessories-fridge-magnets",
  "title": "Rare Ember Fridge Magnet",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/80/74b1fcd1-bfd0-45f4-ba07-d12422a7e1bc.jpg",
  "supplier": "qikink",
  "short": "Fridge Magnet Made from 3 mm thick acrylic with smooth edges, a strong magnetic backing, and vibrant fade-proof UV printing using GreenGuard",
  "story": "Fridge Magnet Made from 3 mm thick acrylic with smooth edges, a strong magnetic backing, and vibrant fade-proof UV printing using GreenGuard certified inks. Packed in an individual box and available in a square shape.",
  "details": [
    "Fridge Magnet with custom printing on Rare Ember Studio, order as a Rare Ember premium pri",
    "Made from 3 mm thick acrylic with smooth edges, a strong magnetic backing, and vibrant fad",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-greeting-card",
  "slug": "qikink-accessories-greeting-card",
  "title": "Rare Ember Greeting Cards",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/74/d26f5f69-dbc3-4f03-8178-f4850b34aefd.jpg",
  "supplier": "qikink",
  "short": "Greeting Cards Printed on premium A5 folded artboard paper with four printable pages, a matching envelope, and high-quality digital printing",
  "story": "Greeting Cards Printed on premium A5 folded artboard paper with four printable pages, a matching envelope, and high-quality digital printing using OEKO-TEX certified inks. Suitable for birthdays, weddings, anniversaries, festivals, and gifting.",
  "details": [
    "Greeting Cards with custom printing on Rare Ember Studio, order as a Rare Ember premium pr",
    "Printed on premium A5 folded artboard paper with four printable pages, a matching envelope",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-keychain",
  "slug": "qikink-accessories-keychain",
  "title": "Rare Ember Keychain",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/298/6e2700dd-b309-4962-abb8-3311298064c3.jpg",
  "supplier": "qikink",
  "short": "Keychain Made from 3 mm acrylic with a glossy finish, attached metal chain, and vibrant fade-proof UV printing for logos, photos, names, and",
  "story": "Keychain Made from 3 mm acrylic with a glossy finish, attached metal chain, and vibrant fade-proof UV printing for logos, photos, names, and artwork. Available in Rectangle, Square, and Slim variants.",
  "details": [
    "Keychain with custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from 3 mm acrylic with a glossy finish, attached metal chain, and vibrant fade-proof",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-kids-clothes-baby-romper-kr23",
  "slug": "qikink-kids-clothes-baby-romper-kr23",
  "title": "Rare Ember Kids Rompers | KR23",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/34/e3740950-e41e-48f1-ba4f-9fb201f76fce.jpg",
  "supplier": "qikink",
  "short": "Kids Rompers Made from 180 GSM 100% super combed cotton with a regular fit, lycra ribbed neck, pre-shrunk and bio-washed fabric, and double-",
  "story": "Kids Rompers Made from 180 GSM 100% super combed cotton with a regular fit, lycra ribbed neck, pre-shrunk and bio-washed fabric, and double-stitched seams.",
  "details": [
    "Kids Rompers with custom printing on Rare Ember Studio, order as a Rare Ember premium priv",
    "Made from 180 GSM 100% super combed cotton with a regular fit, lycra ribbed neck, pre-shru",
    "Compatible with DTG, DTF, vinyl, and screen printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-luggage-tags",
  "slug": "qikink-accessories-luggage-tags",
  "title": "Rare Ember Luggage Tag",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/293/ec6b5701-e7a1-4b30-b52f-eaae35e8b736.jpg",
  "supplier": "qikink",
  "short": "Luggage Tag Made from 3 mm acrylic with a glossy finish, strong locking strap, and double-sided UV printing using OEKO-TEX certified inks fo",
  "story": "Luggage Tag Made from 3 mm acrylic with a glossy finish, strong locking strap, and double-sided UV printing using OEKO-TEX certified inks for vibrant, fade-resistant results. Designed for secure attachment and repeated travel use.",
  "details": [
    "Luggage Tag with custom printing on Rare Ember Studio, order as a Rare Ember premium priva",
    "Made from 3 mm acrylic with a glossy finish, strong locking strap, and double-sided UV pri",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-personalized-pens",
  "slug": "qikink-accessories-personalized-pens",
  "title": "Rare Ember Personalized Pens",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/324/221a521b-fb05-4e15-a87b-fe47e4166dd6.webp",
  "supplier": "qikink",
  "short": "Personalized Pens with custom laser engraving on Rare Ember Studio, Features a premium metal body with a balanced weight, smooth grip, blue ",
  "story": "Personalized Pens with custom laser engraving on Rare Ember Studio, Features a premium metal body with a balanced weight, smooth grip, blue ballpoint ink, and permanent high-precision laser engraving that won't peel, fade, or smudge. Available in Classic, Twist, and Click variants.",
  "details": [
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-pet-products-pet-tags",
  "slug": "qikink-pet-products-pet-tags",
  "title": "Rare Ember Pet Tags",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🐾",
  "tag": "Pet Studio",
  "tagColor": "#f43f5e",
  "tagBg": "rgba(244, 63, 94, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/148/c7888aa2-d00c-415f-8496-4e116a31f016.jpg",
  "supplier": "qikink",
  "short": "Pet Tags with custom engraving on Rare Ember Studio, Made from 2 mm thick 304 stainless steel with an anti-rust finish, precision laser engr",
  "story": "Pet Tags with custom engraving on Rare Ember Studio, Made from 2 mm thick 304 stainless steel with an anti-rust finish, precision laser engraving, and an included keyring for secure attachment. Available in bone and circle shapes with multiple size options.",
  "details": [
    "Available in bone and circle shapes with multiple size options",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-die-cut-stickers",
  "slug": "qikink-accessories-die-cut-stickers",
  "title": "Rare Ember Stickers",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "✨",
  "tag": "Waterproof Die-Cut",
  "tagColor": "#ec4899",
  "tagBg": "rgba(236, 72, 153, 0.12)",
  "stock": 500,
  "rating": 3.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/58/de1e7992-9b6b-4803-8d77-0fbcff706eb3.jpg",
  "supplier": "qikink",
  "short": "Stickers Made from 100-micron material with a matte laminated finish, custom shape die-cutting, and fade-proof digital printing using OEKO-T",
  "story": "Stickers Made from 100-micron material with a matte laminated finish, custom shape die-cutting, and fade-proof digital printing using OEKO-TEX certified inks. Suitable for both indoor and outdoor applications. Available in multiple sizes.",
  "details": [
    "Stickers with custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from 100-micron material with a matte laminated finish, custom shape die-cutting, and",
    "Available in multiple sizes"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-temporary-tattoo",
  "slug": "qikink-accessories-temporary-tattoo",
  "title": "Rare Ember Temporary Tattoos",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/122/29f1b748-06c8-4216-901c-08f8eed37376.jpg",
  "supplier": "qikink",
  "short": "Temporary Tattoos Printed on premium 175-gram transfer paper using high-resolution digital printing with OEKO-TEX certified inks. Features s",
  "story": "Temporary Tattoos Printed on premium 175-gram transfer paper using high-resolution digital printing with OEKO-TEX certified inks. Features skin-friendly, bubble-free application, fine-detail reproduction, and easy removal after 2–3 days. Available in multiple sizes.",
  "details": [
    "Temporary Tattoos with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Printed on premium 175-gram transfer paper using high-resolution digital printing with OEK",
    "Available in multiple sizes"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bags-all-over-print-drawstring-bag",
  "slug": "qikink-bags-all-over-print-drawstring-bag",
  "title": "Rare Ember Unisex AOP Drawstring Bag",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "general",
  "emoji": "🎒",
  "tag": "Heavy Canvas",
  "tagColor": "#10b981",
  "tagBg": "rgba(16, 185, 129, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/13/d251a1ce-41d9-4e44-99f1-d3d5530ec230.jpg",
  "supplier": "qikink",
  "short": "Unisex AOP Drawstring Bag Made from 250 GSM canvas fabric with attached drawstrings, a sporty design, and fade-proof all-over printing using",
  "story": "Unisex AOP Drawstring Bag Made from 250 GSM canvas fabric with attached drawstrings, a sporty design, and fade-proof all-over printing using OEKO-TEX certified inks. Compatible with sublimation printing.",
  "details": [
    "Unisex AOP Drawstring Bag with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 250 GSM canvas fabric with attached drawstrings, a sporty design, and fade-proof",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bags-all-over-print-tote-bag",
  "slug": "qikink-bags-all-over-print-tote-bag",
  "title": "Rare Ember Unisex AOP Tote bags Zipper",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "general",
  "emoji": "🎒",
  "tag": "Heavy Canvas",
  "tagColor": "#10b981",
  "tagBg": "rgba(16, 185, 129, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/127/f9762e1c-5668-4bb0-b207-8e6188c4b918.jpg",
  "supplier": "qikink",
  "short": "Unisex AOP Tote Bags Zipper Made from 250 GSM canvas fabric with a zippered closure, lengthy handles, fade-proof all-over printing using OEK",
  "story": "Unisex AOP Tote Bags Zipper Made from 250 GSM canvas fabric with a zippered closure, lengthy handles, fade-proof all-over printing using OEKO-TEX certified inks, and a durable construction for everyday use. Compatible with sublimation printing.",
  "details": [
    "Unisex AOP Tote Bags Zipper with custom printing on Rare Ember Studio, order as a Rare Emb",
    "Made from 250 GSM canvas fabric with a zippered closure, lengthy handles, fade-proof all-o",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-accessories-cotton-apron",
  "slug": "qikink-accessories-cotton-apron",
  "title": "Rare Ember Unisex Apron",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "general",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/51/c2e2e57f-b066-4f92-822b-39885a567543.jpg",
  "supplier": "qikink",
  "short": "Unisex Apron Made from 280 GSM breathable cotton drill fabric with adjustable straps, two front pockets, holder attachment, and double-stitc",
  "story": "Unisex Apron Made from 280 GSM breathable cotton drill fabric with adjustable straps, two front pockets, holder attachment, and double-stitched construction for durability.",
  "details": [
    "Unisex Apron with custom printing on Rare Ember Studio, order as a Rare Ember premium priv",
    "Made from 280 GSM breathable cotton drill fabric with adjustable straps, two front pockets",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bags-cotton-drawstring-bags",
  "slug": "qikink-bags-cotton-drawstring-bags",
  "title": "Rare Ember Unisex Drawstring Bag",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "general",
  "emoji": "🎒",
  "tag": "Heavy Canvas",
  "tagColor": "#10b981",
  "tagBg": "rgba(16, 185, 129, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/9/40598b82-d91a-428d-b467-e1c867b0638f.jpg",
  "supplier": "qikink",
  "short": "Unisex Drawstring Bag Made from 280 GSM 100% cotton with a breathable construction and double-stitched drawstrings. Available in 7 colours.",
  "story": "Unisex Drawstring Bag Made from 280 GSM 100% cotton with a breathable construction and double-stitched drawstrings. Available in 7 colours.",
  "details": [
    "Unisex Drawstring Bag with custom printing on Rare Ember Studio, order as a Rare Ember pre",
    "Made from 280 GSM 100% cotton with a breathable construction and double-stitched drawstrin",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bags-large-tote-bag",
  "slug": "qikink-bags-large-tote-bag",
  "title": "Rare Ember Unisex Everyday Large Tote bag",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "general",
  "emoji": "🎒",
  "tag": "Heavy Canvas",
  "tagColor": "#10b981",
  "tagBg": "rgba(16, 185, 129, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/106/ff357000-e9f9-4162-84ce-8603053ba68f.jpg",
  "supplier": "qikink",
  "short": "Unisex Everyday Large Tote bag Made from 100% cotton with a zippered closure, nylon inner lining, two inner pockets, a zippered inner pocket",
  "story": "Unisex Everyday Large Tote bag Made from 100% cotton with a zippered closure, nylon inner lining, two inner pockets, a zippered inner pocket, water bottle holder, and key holder.",
  "details": [
    "Unisex Everyday Large Tote bag with custom printing on Rare Ember Studio, order as a Rare",
    "Made from 100% cotton with a zippered closure, nylon inner lining, two inner pockets, a zi",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-bags-tote-bag",
  "slug": "qikink-bags-tote-bag",
  "title": "Rare Ember Unisex Tote Bag Zipper",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "general",
  "emoji": "🎒",
  "tag": "Heavy Canvas",
  "tagColor": "#10b981",
  "tagBg": "rgba(16, 185, 129, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/19/eb4b0c27-02ab-4a23-8c02-e60e9460c4f6.jpg",
  "supplier": "qikink",
  "short": "Unisex Tote Bag Zipper Made from minimum 200 GSM 100% cotton canvas with double-stitched side seams and long self-handles.",
  "story": "Unisex Tote Bag Zipper Made from minimum 200 GSM 100% cotton canvas with double-stitched side seams and long self-handles.",
  "details": [
    "Unisex Tote Bag Zipper with custom printing on Rare Ember Studio, order as a Rare Ember pr",
    "Made from minimum 200 GSM 100% cotton canvas with double-stitched side seams and long self",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-acrylic-coasters",
  "slug": "qikink-home-decor-acrylic-coasters",
  "title": "Rare Ember Acrylic Coaster",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/290/7c3c7758-6139-470c-abcc-75d8364eff75.jpg",
  "supplier": "qikink",
  "short": "Acrylic Coaster Made from 3 mm thick durable clear acrylic with a full white base, glossy finish, fade-proof UV printing using OEKO-TEX cert",
  "story": "Acrylic Coaster Made from 3 mm thick durable clear acrylic with a full white base, glossy finish, fade-proof UV printing using OEKO-TEX certified inks, and water-resistant construction. Available in Square and Circle variants.",
  "details": [
    "Acrylic Coaster with custom printing on Rare Ember Studio, order as a Rare Ember premium p",
    "Made from 3 mm thick durable clear acrylic with a full white base, glossy finish, fade-pro",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-acrylic-photo-frame-with-wood-stand",
  "slug": "qikink-home-decor-acrylic-photo-frame-with-wood-stand",
  "title": "Rare Ember Acrylic Photo Frame With Stand",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "🖼️",
  "tag": "Gallery Grade Art",
  "tagColor": "#f59e0b",
  "tagBg": "rgba(245, 158, 11, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/349/b0be2ea5-199e-49e1-acce-13d740ff9121.webp",
  "supplier": "qikink",
  "short": "Sell custom acrylic photo frames with a wooden stand without MOQ. Shipped with box packing. Start your photo frame business with Rare Ember ",
  "story": "Sell custom acrylic photo frames with a wooden stand without MOQ. Shipped with box packing. Start your photo frame business with Rare Ember Studio.",
  "details": [
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-poster-acrylic-poster",
  "slug": "qikink-home-decor-poster-acrylic-poster",
  "title": "Rare Ember Acrylic Poster",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "🖼️",
  "tag": "Gallery Grade Art",
  "tagColor": "#f59e0b",
  "tagBg": "rgba(245, 158, 11, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/292/844eaaaf-7aad-470d-9cea-1dce9a4b8761.jpg",
  "supplier": "qikink",
  "short": "Acrylic Poster Made from 3 mm thick acrylic with a glossy finish, UV printing using OEKO-TEX certified inks, fade-proof output, and wall-mou",
  "story": "Acrylic Poster Made from 3 mm thick acrylic with a glossy finish, UV printing using OEKO-TEX certified inks, fade-proof output, and wall-mounted construction with adhesive backing. Available in multiple sizes.",
  "details": [
    "Acrylic Poster with custom printing on Rare Ember Studio for print-on-demand and dropshipp",
    "Made from 3 mm thick acrylic with a glossy finish, UV printing using OEKO-TEX certified in",
    "Available in multiple sizes"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-drinkware-coffee-mug-black-mug",
  "slug": "qikink-drinkware-coffee-mug-black-mug",
  "title": "Rare Ember Black Coffee Mug",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/130/c4d6d737-e7b6-4927-a4b9-1fbe856ffd9f.jpg",
  "supplier": "qikink",
  "short": "Black Coffee Mug Made from premium ceramic in an 11 Oz size with a glossy finish, full black exterior, fade-proof sublimation printing using",
  "story": "Black Coffee Mug Made from premium ceramic in an 11 Oz size with a glossy finish, full black exterior, fade-proof sublimation printing using OEKO-TEX certified Epson inks, and individual box packing for secure delivery.",
  "details": [
    "Black Coffee Mug with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from premium ceramic in an 11 Oz size with a glossy finish, full black exterior, fade",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-canvas-prints",
  "slug": "qikink-home-decor-canvas-prints",
  "title": "Rare Ember Canvas",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "home-garden",
  "emoji": "🖼️",
  "tag": "Gallery Grade Art",
  "tagColor": "#f59e0b",
  "tagBg": "rgba(245, 158, 11, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/125/68e96a4a-318a-4ac8-aa27-3700af0baae1.jpg",
  "supplier": "qikink",
  "short": "Canvas Prints Printed on premium Poly canvas fabric using high-resolution printing with fade-resistant inks and professionally stretched ove",
  "story": "Canvas Prints Printed on premium Poly canvas fabric using high-resolution printing with fade-resistant inks and professionally stretched over a durable wooden frame. Ready to hang and available in multiple sizes for home and office décor.",
  "details": [
    "Canvas Prints with custom printing on Rare Ember Studio, order as a Rare Ember premium pri",
    "Printed on premium Poly canvas fabric using high-resolution printing with fade-resistant i",
    "Ready to hang and available in multiple sizes for home and office décor"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-ornament",
  "slug": "qikink-home-decor-ornament",
  "title": "Rare Ember Christmas Ornaments",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/317/d311878b-ae10-4dda-9f2e-97d3642eb91f.webp",
  "supplier": "qikink",
  "short": "Christmas Ornament Made from 3 mm thick acrylic with a glossy lightweight construction, waterproof finish, and direct UV printing for fade-p",
  "story": "Christmas Ornament Made from 3 mm thick acrylic with a glossy lightweight construction, waterproof finish, and direct UV printing for fade-proof output. Includes a satin ribbon for hanging and is available in four shapes.",
  "details": [
    "Christmas Ornament with custom printing on Rare Ember Studio for print-on-demand and drops",
    "Made from 3 mm thick acrylic with a glossy lightweight construction, waterproof finish, an",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-cloth-napkins",
  "slug": "qikink-home-decor-cloth-napkins",
  "title": "Rare Ember Cloth Napkin",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/108/95278267-a588-44b8-b7c6-b7239e7e3ed1.jpg",
  "supplier": "qikink",
  "short": "Cloth Napkins Made from 100% polyester fabric with a lightweight woven structure, hemmed edges on all sides, soft finish, and sublimation pr",
  "story": "Cloth Napkins Made from 100% polyester fabric with a lightweight woven structure, hemmed edges on all sides, soft finish, and sublimation printing using OEKO-TEX certified inks. Designed for reusable dining and table use with fade-proof output.",
  "details": [
    "Cloth Napkins with custom printing on Rare Ember Studio for print-on-demand and dropshippi",
    "Made from 100% polyester fabric with a lightweight woven structure, hemmed edges on all si",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-coaster",
  "slug": "qikink-home-decor-coaster",
  "title": "Rare Ember Coasters",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/23/2a2d8a2c-0de6-4655-8c17-54c7afc1790a.jpg",
  "supplier": "qikink",
  "short": "Coaster Made from 3 mm thick MDF board with a glossy finish and square or circle variants, fade-proof sublimation printing using OEKO-TEX ce",
  "story": "Coaster Made from 3 mm thick MDF board with a glossy finish and square or circle variants, fade-proof sublimation printing using OEKO-TEX certified inks, and water-resistant surface. Designed with lightweight rigid construction for tabletop use.",
  "details": [
    "Coaster with custom printing on Rare Ember Studio for print-on-demand and dropshipping in",
    "Made from 3 mm thick MDF board with a glossy finish and square or circle variants, fade-pr",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-drinkware-coffee-mug-color-coffee-mug",
  "slug": "qikink-drinkware-coffee-mug-color-coffee-mug",
  "title": "Rare Ember Color Coffee Mug",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/16/c7ba48fd-fa21-400d-ba66-a8856cffbb96.jpg",
  "supplier": "qikink",
  "short": "Color Coffee Mug Made from premium ceramic in an 11 Oz size with a glossy finish, coloured handle and inner finish available in multiple col",
  "story": "Color Coffee Mug Made from premium ceramic in an 11 Oz size with a glossy finish, coloured handle and inner finish available in multiple colour options, fade-proof sublimation printing using OEKO-TEX certified Epson inks, and individual box packing for secure delivery.",
  "details": [
    "Color Coffee Mug with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from premium ceramic in an 11 Oz size with a glossy finish, coloured handle and inner",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-daily-planner",
  "slug": "qikink-home-decor-daily-planner",
  "title": "Rare Ember Daily Planner",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "📓",
  "tag": "Acid-Free Dot Grid",
  "tagColor": "#a855f7",
  "tagBg": "rgba(168, 85, 247, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/279/ace94cb1-136d-44b3-b203-b5dce1a41af5.jpg",
  "supplier": "qikink",
  "short": "Daily Planner Made with a 300 GSM printed cover and 70 GSM inner pages in A5 format with 204 undated pages and 5 dotted note pages. Features",
  "story": "Daily Planner Made with a 300 GSM printed cover and 70 GSM inner pages in A5 format with 204 undated pages and 5 dotted note pages. Features soft-bound perfect binding, digital printing using fade-proof OEKO-TEX certified inks, and structured layout for daily scheduling use.",
  "details": [
    "Daily Planner with custom printing on Rare Ember Studio for print-on-demand and dropshippi",
    "Made with a 300 GSM printed cover and 70 GSM inner pages in A5 format with 204 undated pag",
    "Features soft-bound perfect binding, digital printing using fade-proof OEKO-TEX certified"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-poster-poster-frames",
  "slug": "qikink-home-decor-poster-poster-frames",
  "title": "Rare Ember Framed Poster",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "home-garden",
  "emoji": "🖼️",
  "tag": "Gallery Grade Art",
  "tagColor": "#f59e0b",
  "tagBg": "rgba(245, 158, 11, 0.12)",
  "stock": 500,
  "rating": 4.5,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/62/8fec1804-d535-4b39-a0b7-5ed822944e22.jpg",
  "supplier": "qikink",
  "short": "Framed Poster Made from 300 GSM art paper laminated under a 1-inch frame with 2 mm board thickness and 0.25-inch tolerance. Printed using di",
  "story": "Framed Poster Made from 300 GSM art paper laminated under a 1-inch frame with 2 mm board thickness and 0.25-inch tolerance. Printed using digital printing with fade-proof output and OEKO-TEX certified inks. Includes a mounting kit and is available in 13 sizes.",
  "details": [
    "Framed Poster with custom printing on Rare Ember Studio for print-on-demand and dropshippi",
    "Made from 300 GSM art paper laminated under a 1-inch frame with 2 mm board thickness and 0",
    "Printed using digital printing with fade-proof output and OEKO-TEX certified inks",
    "Includes a mounting kit and is available in 13 sizes"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-jigsaw-puzzle",
  "slug": "qikink-home-decor-jigsaw-puzzle",
  "title": "Rare Ember Jigsaw Puzzle",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 3.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/87/40fc9757-77a1-472f-954b-12ad6645799a.jpg",
  "supplier": "qikink",
  "short": "Jigsaw Puzzle Made from recycled paper with a 120-piece construction, semi-gloss finish, and sublimation printing using OEKO-TEX certified i",
  "story": "Jigsaw Puzzle Made from recycled paper with a 120-piece construction, semi-gloss finish, and sublimation printing using OEKO-TEX certified inks for fade-proof output. Supplied in A4 size with a printed reference sheet inside the box.",
  "details": [
    "Jigsaw Puzzle with custom printing on Rare Ember Studio for print-on-demand and dropshippi",
    "Made from recycled paper with a 120-piece construction, semi-gloss finish, and sublimation",
    "Supplied in A4 size with a printed reference sheet inside the box"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-wooden-puzzle",
  "slug": "qikink-home-decor-wooden-puzzle",
  "title": "Rare Ember MDF Wooden Puzzle",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/318/e473ce83-e348-4d16-afdf-1770b10ecf56.webp",
  "supplier": "qikink",
  "short": "MDF Wooden Puzzle Made from 3 mm MDF with a glossy finish, 30-piece construction, edge-to-edge sublimation printing, and waterproof fade-pro",
  "story": "MDF Wooden Puzzle Made from 3 mm MDF with a glossy finish, 30-piece construction, edge-to-edge sublimation printing, and waterproof fade-proof output. Measures 6 × 8 inches and is supplied as a reusable puzzle board.",
  "details": [
    "MDF Wooden Puzzle with custom printing on Rare Ember Studio for print-on-demand and dropsh",
    "Made from 3 mm MDF with a glossy finish, 30-piece construction, edge-to-edge sublimation p",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-drinkware-coffee-mug-magic-mug",
  "slug": "qikink-drinkware-coffee-mug-magic-mug",
  "title": "Rare Ember Magic Coffee Mug",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/132/e6960bd3-f075-431d-a86d-a16fdbf883dc.jpg",
  "supplier": "qikink",
  "short": "Magic Coffee Mug Made from premium ceramic in an 11 Oz size with a glossy heat-sensitive finish that reveals the printed design when filled ",
  "story": "Magic Coffee Mug Made from premium ceramic in an 11 Oz size with a glossy heat-sensitive finish that reveals the printed design when filled with a hot beverage. Printed using OEKO-TEX certified Epson inks with fade-proof sublimation printing and packed individually for secure delivery.",
  "details": [
    "Magic Coffee Mug with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from premium ceramic in an 11 Oz size with a glossy heat-sensitive finish that reveal",
    "Printed using OEKO-TEX certified Epson inks with fade-proof sublimation printing and packe"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-poster-metal-posters",
  "slug": "qikink-home-decor-poster-metal-posters",
  "title": "Rare Ember Metal Posters",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "home-garden",
  "emoji": "🖼️",
  "tag": "Gallery Grade Art",
  "tagColor": "#f59e0b",
  "tagBg": "rgba(245, 158, 11, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/65/f1e86079-030c-44b9-bf80-4c6a2f4840c9.jpg",
  "supplier": "qikink",
  "short": "Metal Posters Made from 1 mm thick aluminium with a glossy waterproof finish, built-in magnetic mounting, and sublimation printing using OEK",
  "story": "Metal Posters Made from 1 mm thick aluminium with a glossy waterproof finish, built-in magnetic mounting, and sublimation printing using OEKO-TEX certified inks. Available in two sizes.",
  "details": [
    "Metal Posters with custom printing on Rare Ember Studio for print-on-demand and dropshippi",
    "Made from 1 mm thick aluminium with a glossy waterproof finish, built-in magnetic mounting",
    "Available in two sizes"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-notepad",
  "slug": "qikink-home-decor-notepad",
  "title": "Rare Ember NotePad",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/69/741f8a93-c122-4dee-a75c-df041bf18f98.jpg",
  "supplier": "qikink",
  "short": "Notepad Made with 300 GSM printed front and back cover and 70 GSM inner pages in A5 size with 120 pages in ruled and unruled variants. Featu",
  "story": "Notepad Made with 300 GSM printed front and back cover and 70 GSM inner pages in A5 size with 120 pages in ruled and unruled variants. Features wire-bound construction, digital printing on cover using fade-proof OEKO-TEX certified inks, and standard tear-off writing format.",
  "details": [
    "Notepad with custom printing on Rare Ember Studio for print-on-demand and dropshipping in",
    "Made with 300 GSM printed front and back cover and 70 GSM inner pages in A5 size with 120",
    "Features wire-bound construction, digital printing on cover using fade-proof OEKO-TEX cert"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-notebook",
  "slug": "qikink-home-decor-notebook",
  "title": "Rare Ember Notebook",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "📓",
  "tag": "Acid-Free Dot Grid",
  "tagColor": "#a855f7",
  "tagBg": "rgba(168, 85, 247, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/280/9d7c853e-f1f6-4e3b-beed-472e9ecda38b.jpg",
  "supplier": "qikink",
  "short": "Notebook Made with a 300 GSM printed cover and 70 GSM inner pages in A5 size with 120 pages, available in ruled and unruled variants. Soft-b",
  "story": "Notebook Made with a 300 GSM printed cover and 70 GSM inner pages in A5 size with 120 pages, available in ruled and unruled variants. Soft-bound or wire-bound construction with eco-friendly paper and digital printing on the cover using fade-proof inks.",
  "details": [
    "Notebook with custom printing on Rare Ember Studio for print-on-demand and dropshipping in",
    "Made with a 300 GSM printed cover and 70 GSM inner pages in A5 size with 120 pages, availa",
    "Soft-bound or wire-bound construction with eco-friendly paper and digital printing on the"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-placemats",
  "slug": "qikink-home-decor-placemats",
  "title": "Rare Ember Placemat",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/109/71901230-e17c-4bc1-ba9d-b047e2994dac.jpg",
  "supplier": "qikink",
  "short": "Placemat Made from 100% polyester with a lightweight woven construction, printed top with a white underside, and fade-proof sublimation prin",
  "story": "Placemat Made from 100% polyester with a lightweight woven construction, printed top with a white underside, and fade-proof sublimation printing using OEKO-TEX certified inks.",
  "details": [
    "Placemat with custom printing on Rare Ember Studio for print-on-demand and dropshipping in",
    "Made from 100% polyester with a lightweight woven construction, printed top with a white u",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-photo-postcard",
  "slug": "qikink-home-decor-photo-postcard",
  "title": "Rare Ember Postcards",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/61/1b9cc82d-00f2-409a-8dc7-663b9f48057c.jpg",
  "supplier": "qikink",
  "short": "Photo Postcard Made from 300 GSM artboard in A6 size with a glossy finish and dual-sided digital printing using OEKO-TEX certified inks. Inc",
  "story": "Photo Postcard Made from 300 GSM artboard in A6 size with a glossy finish and dual-sided digital printing using OEKO-TEX certified inks. Includes envelope packaging with fade-proof output and compact postcard format suitable for mailing or gifting.",
  "details": [
    "Photo Postcard with custom printing on Rare Ember Studio for print-on-demand and dropshipp",
    "Made from 300 GSM artboard in A6 size with a glossy finish and dual-sided digital printing",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-poster-paper-poster",
  "slug": "qikink-home-decor-poster-paper-poster",
  "title": "Rare Ember Poster",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "home-garden",
  "emoji": "🖼️",
  "tag": "Gallery Grade Art",
  "tagColor": "#f59e0b",
  "tagBg": "rgba(245, 158, 11, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/124/07a331d0-8130-428f-a0a8-87aaa8e63697.jpg",
  "supplier": "qikink",
  "short": "Poster Made from 300 GSM art board with rolled construction, digital printing, fade-proof output, adhesive strips for wall mounting, and OEK",
  "story": "Poster Made from 300 GSM art board with rolled construction, digital printing, fade-proof output, adhesive strips for wall mounting, and OEKO-TEX certified inks. Packed in carton tubes and available in multiple sizes.",
  "details": [
    "Poster with custom printing on Rare Ember Studio for print-on-demand and dropshipping in I",
    "Made from 300 GSM art board with rolled construction, digital printing, fade-proof output,",
    "Packed in carton tubes and available in multiple sizes"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-drinkware-sipper-bottle",
  "slug": "qikink-drinkware-sipper-bottle",
  "title": "Rare Ember Sipper Bottle",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "home-garden",
  "emoji": "☕",
  "tag": "Thermal Insulated",
  "tagColor": "#06b6d4",
  "tagBg": "rgba(6, 182, 212, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/53/39f2c346-c5f8-45dc-918a-08e56b1a90c5.jpg",
  "supplier": "qikink",
  "short": "Sipper Bottle Made from premium aluminium with a 750 ml capacity, glossy finish, clip cap, fade-proof sublimation printing using OEKO-TEX ce",
  "story": "Sipper Bottle Made from premium aluminium with a 750 ml capacity, glossy finish, clip cap, fade-proof sublimation printing using OEKO-TEX certified Epson inks, and an eco-friendly reusable design.",
  "details": [
    "Sipper Bottle with custom printing on Rare Ember Studio, order as a Rare Ember premium pri",
    "Made from premium aluminium with a 750 ml capacity, glossy finish, clip cap, fade-proof su",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-sketchbook",
  "slug": "qikink-home-decor-sketchbook",
  "title": "Rare Ember Sketchbook",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/319/d537cfe7-11b7-41bd-b319-2ff637a74ba5.webp",
  "supplier": "qikink",
  "short": "Sketchbook Made with 140 GSM inner drawing paper and a 300 GSM printed cover in A5 size with 30 sheets. Features spiral binding, acid-free p",
  "story": "Sketchbook Made with 140 GSM inner drawing paper and a 300 GSM printed cover in A5 size with 30 sheets. Features spiral binding, acid-free paper suitable for sketching and doodling, and digital printing on the cover using fade-proof inks.",
  "details": [
    "Sketchbook with custom printing on Rare Ember Studio for print-on-demand and dropshipping",
    "Made with 140 GSM inner drawing paper and a 300 GSM printed cover in A5 size with 30 sheet",
    "Features spiral binding, acid-free paper suitable for sketching and doodling, and digital"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-drinkware-steel-water-bottle",
  "slug": "qikink-drinkware-steel-water-bottle",
  "title": "Rare Ember Steel Water bottle",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1249,
  "compare_at_price": 14.69,
  "category": "home-garden",
  "emoji": "👕",
  "tag": "240 GSM Combed Cotton",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/273/d0aa5134-38bf-4c42-9b59-df25de4bf1c2.jpg",
  "supplier": "qikink",
  "short": "Steel Water Bottle with custom laser engraving on Rare Ember Studio, Made from 25 Oz premium 304 stainless steel with a 750 ml capacity, lea",
  "story": "Steel Water Bottle with custom laser engraving on Rare Ember Studio, Made from 25 Oz premium 304 stainless steel with a 750 ml capacity, leak-proof, BPA-free, and eco-friendly construction. Precision laser engraving ensures a permanent finish without fading or peeling. Available in black and silver.",
  "details": [
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-table-runner",
  "slug": "qikink-home-decor-table-runner",
  "title": "Rare Ember Tablerunner",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/110/ab096cfd-d59a-4551-adb5-b6d727d75fab.jpg",
  "supplier": "qikink",
  "short": "Table Runner Made from 100% polyester with a lightweight woven construction, hemmed edges, printed top with a white underside, and fade-proo",
  "story": "Table Runner Made from 100% polyester with a lightweight woven construction, hemmed edges, printed top with a white underside, and fade-proof sublimation printing using OEKO-TEX certified inks.",
  "details": [
    "Table Runner with custom printing on Rare Ember Studio for print-on-demand and dropshippin",
    "Made from 100% polyester with a lightweight woven construction, hemmed edges, printed top",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-wall-tapestry",
  "slug": "qikink-home-decor-wall-tapestry",
  "title": "Rare Ember Tapestry",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/126/a218a076-3fb2-4474-b3e3-85126346f1f9.jpg",
  "supplier": "qikink",
  "short": "Tapestry Made from super soft lightweight fabric with fade-proof sublimation printing using OEKO-TEX certified inks. Features metal grommets",
  "story": "Tapestry Made from super soft lightweight fabric with fade-proof sublimation printing using OEKO-TEX certified inks. Features metal grommets on all four corners, includes four adhesive screws for easy mounting, and is available in seven sizes for home and office décor.",
  "details": [
    "Tapestry with custom printing on Rare Ember Studio, order as a Rare Ember premium private",
    "Made from super soft lightweight fabric with fade-proof sublimation printing using OEKO-TE",
    "Features metal grommets on all four corners, includes four adhesive screws for easy mounti"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-drinkware-tumbler-bottle",
  "slug": "qikink-drinkware-tumbler-bottle",
  "title": "Rare Ember Tumbler Bottle",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "home-garden",
  "emoji": "☕",
  "tag": "Thermal Insulated",
  "tagColor": "#06b6d4",
  "tagBg": "rgba(6, 182, 212, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/57/d42bf518-cd45-411b-8eb0-d0c0384e3fd1.jpg",
  "supplier": "qikink",
  "short": "Tumbler Bottle Made from 20 Oz 304 stainless steel with double-wall insulated construction, a splash-proof lid, reusable metal straw, and fa",
  "story": "Tumbler Bottle Made from 20 Oz 304 stainless steel with double-wall insulated construction, a splash-proof lid, reusable metal straw, and fade-proof sublimation printing using OEKO-TEX certified inks. Suitable for hot and cold beverages.",
  "details": [
    "Tumbler Bottle with custom printing on Rare Ember Studio, order as a Rare Ember premium pr",
    "Made from 20 Oz 304 stainless steel with double-wall insulated construction, a splash-proo",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-all-over-print-cushion-cover",
  "slug": "qikink-home-decor-all-over-print-cushion-cover",
  "title": "Rare Ember Unisex AOP Cushion Cover",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/15/b37db5c0-c7e8-4829-adef-2b0b0a112764.jpg",
  "supplier": "qikink",
  "short": "Unisex AOP Cushion Cover Made from 180 GSM poly lycra fabric with a perfect fit design, cut-and-sewn construction, double-stitched finish, a",
  "story": "Unisex AOP Cushion Cover Made from 180 GSM poly lycra fabric with a perfect fit design, cut-and-sewn construction, double-stitched finish, and fade-proof all-over print using OEKO-TEX certified Epson inks. Compatible with sublimation printing.",
  "details": [
    "Unisex AOP Cushion Cover with custom printing on Rare Ember Studio, order as a Rare Ember",
    "Made from 180 GSM poly lycra fabric with a perfect fit design, cut-and-sewn construction,",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-home-decor-all-over-print-pillow-cover",
  "slug": "qikink-home-decor-all-over-print-pillow-cover",
  "title": "Rare Ember Unisex AOP Pillow Cover",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/101/c99e44d2-b68a-4995-aef6-5e54a11c99ab.jpg",
  "supplier": "qikink",
  "short": "Unisex AOP Pillow Cover Made from 180 GSM premium poly lycra fabric with a cut-and-sewn finish, double-stitched construction, and fade-proof",
  "story": "Unisex AOP Pillow Cover Made from 180 GSM premium poly lycra fabric with a cut-and-sewn finish, double-stitched construction, and fade-proof all-over print using OEKO-TEX certified Epson inks. Compatible with sublimation printing.",
  "details": [
    "Unisex AOP Pillow Cover with custom printing on Rare Ember Studio, order as a Rare Ember p",
    "Made from 180 GSM premium poly lycra fabric with a cut-and-sewn finish, double-stitched co",
    "Compatible with sublimation printing"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-drinkware-coffee-mug-white-mug",
  "slug": "qikink-drinkware-coffee-mug-white-mug",
  "title": "Rare Ember White Coffee Mug",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 549,
  "compare_at_price": 6.46,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 5.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/26/b10e9b51-65a6-43f7-9e93-0e184c5853e9.jpg",
  "supplier": "qikink",
  "short": "White Coffee Mug Made from premium ceramic in an 11 Oz size with a glossy finish, fade-proof sublimation printing using OEKO-TEX certified i",
  "story": "White Coffee Mug Made from premium ceramic in an 11 Oz size with a glossy finish, fade-proof sublimation printing using OEKO-TEX certified inks, and individual box packing for secure delivery. Microwave and dishwasher safe.",
  "details": [
    "White Coffee Mug with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from premium ceramic in an 11 Oz size with a glossy finish, fade-proof sublimation pr",
    "Microwave and dishwasher safe"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-drinkware-coffee-mug-enamel-mug",
  "slug": "qikink-drinkware-coffee-mug-enamel-mug",
  "title": "Rare Ember White Enamel Mugs",
  "price": 5.87,
  "price_inr": 499,
  "old_price": 899,
  "compare_at_price": 10.58,
  "category": "home-garden",
  "emoji": "🔥",
  "tag": "Creator Lifestyle",
  "tagColor": "#ff4d24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.0,
  "reviews": 45,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/64/11d5d1cf-4777-4ae1-b624-9a9b2ed95a13.jpg",
  "supplier": "qikink",
  "short": "White Enamel Mugs Made from 11 Oz enamel-coated stainless steel with a silver rim, dishwasher-safe construction, fade-proof sublimation prin",
  "story": "White Enamel Mugs Made from 11 Oz enamel-coated stainless steel with a silver rim, dishwasher-safe construction, fade-proof sublimation printing using OEKO-TEX certified inks, and a lightweight, durable design for everyday and outdoor use.",
  "details": [
    "White Enamel Mugs with custom printing on Rare Ember Studio, order as a Rare Ember premium",
    "Made from 11 Oz enamel-coated stainless steel with a silver rim, dishwasher-safe construct",
    "Dispatched direct from Tirupur manufacturing floor in 2-4 business days",
    "100% Doorstep 7-Day Free Replacement Guarantee",
    "Cash on Delivery & 1-Click UPI Available Pan-India"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
];

export const PET_META: Record<string, any> = {
  dog: { emoji: '🐕', label: 'For Dogs', color: '#9a3412', bg: '#fff7ed' },
  cat: { emoji: '🐈', label: 'For Cats', color: '#831843', bg: '#fdf2f8' },
  both: { emoji: '🐾', label: 'For Pets', color: '#0f172a', bg: '#f1f5f9' },
};

export const bundles: Record<string, string[]> = {
  "qikink-accessories-desk-mat": [
    "qikink-accessories-mobile-clear-phone-case",
    "qikink-accessories-mouse-pad"
  ],
  "qikink-accessories-mobile-clear-phone-case": [
    "qikink-accessories-mouse-pad",
    "qikink-accessories-mobile-phone-grip"
  ],
  "qikink-accessories-mouse-pad": [
    "qikink-accessories-mobile-phone-grip",
    "qikink-accessories-mobile-glass-phone-case"
  ],
  "qikink-accessories-mobile-phone-grip": [
    "qikink-accessories-mobile-glass-phone-case",
    "qikink-tops-all-over-print-full-sleeve-crop-top-fc38"
  ],
  "qikink-accessories-mobile-glass-phone-case": [
    "qikink-tops-all-over-print-full-sleeve-crop-top-fc38",
    "qikink-accessories-arm-sleeves"
  ],
  "qikink-tops-all-over-print-full-sleeve-crop-top-fc38": [
    "qikink-accessories-arm-sleeves",
    "qikink-accessories-balaclava"
  ],
  "qikink-accessories-arm-sleeves": [
    "qikink-accessories-balaclava",
    "qikink-kids-clothes-boys-t-shirts-bc21"
  ],
  "qikink-accessories-balaclava": [
    "qikink-kids-clothes-boys-t-shirts-bc21",
    "qikink-t-shirts-dry-fit-t-shirts-ud15"
  ],
  "qikink-kids-clothes-boys-t-shirts-bc21": [
    "qikink-t-shirts-dry-fit-t-shirts-ud15",
    "qikink-headwear-bandana-mask"
  ],
  "qikink-t-shirts-dry-fit-t-shirts-ud15": [
    "qikink-headwear-bandana-mask",
    "qikink-dresses-all-over-print-a-line-dress-fd16"
  ],
  "qikink-headwear-bandana-mask": [
    "qikink-dresses-all-over-print-a-line-dress-fd16",
    "qikink-dresses-all-over-print-bodycon-dress-fd74"
  ],
  "qikink-dresses-all-over-print-a-line-dress-fd16": [
    "qikink-dresses-all-over-print-bodycon-dress-fd74",
    "qikink-hoodies-bomber-jacket-women-fa30"
  ],
  "qikink-dresses-all-over-print-bodycon-dress-fd74": [
    "qikink-hoodies-bomber-jacket-women-fa30",
    "qikink-tops-all-over-print-crop-tank-fa33"
  ],
  "qikink-hoodies-bomber-jacket-women-fa30": [
    "qikink-tops-all-over-print-crop-tank-fa33",
    "qikink-tops-all-over-print-crop-top-fa32"
  ],
  "qikink-tops-all-over-print-crop-tank-fa33": [
    "qikink-tops-all-over-print-crop-top-fa32",
    "qikink-bottomwear-womens-gym-leggings-fa41"
  ],
  "qikink-tops-all-over-print-crop-top-fa32": [
    "qikink-bottomwear-womens-gym-leggings-fa41",
    "qikink-dresses-all-over-print-pencil-skirt-fs58"
  ],
  "qikink-bottomwear-womens-gym-leggings-fa41": [
    "qikink-dresses-all-over-print-pencil-skirt-fs58",
    "qikink-tops-all-over-print-sports-bra-fa50"
  ],
  "qikink-dresses-all-over-print-pencil-skirt-fs58": [
    "qikink-tops-all-over-print-sports-bra-fa50",
    "qikink-dresses-all-over-print-t-shirt-dress-fa35"
  ],
  "qikink-tops-all-over-print-sports-bra-fa50": [
    "qikink-dresses-all-over-print-t-shirt-dress-fa35",
    "qikink-t-shirts-all-over-print-womens-t-shirt-fa21"
  ],
  "qikink-dresses-all-over-print-t-shirt-dress-fa35": [
    "qikink-t-shirts-all-over-print-womens-t-shirt-fa21",
    "qikink-tops-all-over-print-tank-top-fa37"
  ],
  "qikink-t-shirts-all-over-print-womens-t-shirt-fa21": [
    "qikink-tops-all-over-print-tank-top-fa37",
    "qikink-tops-all-over-print-tube-top-ft12"
  ],
  "qikink-tops-all-over-print-tank-top-fa37": [
    "qikink-tops-all-over-print-tube-top-ft12",
    "qikink-tops-baby-tee-ft47"
  ],
  "qikink-tops-all-over-print-tube-top-ft12": [
    "qikink-tops-baby-tee-ft47",
    "qikink-t-shirts-women-t-shirt-uc21"
  ],
  "qikink-tops-baby-tee-ft47": [
    "qikink-t-shirts-women-t-shirt-uc21",
    "qikink-tops-crop-tank-fc40"
  ],
  "qikink-t-shirts-women-t-shirt-uc21": [
    "qikink-tops-crop-tank-fc40",
    "qikink-tops-crop-top-fc39"
  ],
  "qikink-tops-crop-tank-fc40": [
    "qikink-tops-crop-top-fc39",
    "qikink-hoodies-cropped-hoodie-fc32"
  ],
  "qikink-tops-crop-top-fc39": [
    "qikink-hoodies-cropped-hoodie-fc32",
    "qikink-dresses-maternity-dresses-fm44"
  ],
  "qikink-hoodies-cropped-hoodie-fc32": [
    "qikink-dresses-maternity-dresses-fm44",
    "qikink-dresses-t-shirt-dress-fc43"
  ],
  "qikink-dresses-maternity-dresses-fm44": [
    "qikink-dresses-t-shirt-dress-fc43",
    "qikink-tops-tank-top-ft37"
  ],
  "qikink-dresses-t-shirt-dress-fc43": [
    "qikink-tops-tank-top-ft37",
    "qikink-kids-clothes-t-shirt-for-girls-gc21"
  ],
  "qikink-tops-tank-top-ft37": [
    "qikink-kids-clothes-t-shirt-for-girls-gc21",
    "qikink-accessories-all-over-print-headband"
  ],
  "qikink-kids-clothes-t-shirt-for-girls-gc21": [
    "qikink-accessories-all-over-print-headband",
    "qikink-t-shirts-jersey-t-shirt-us02"
  ],
  "qikink-accessories-all-over-print-headband": [
    "qikink-t-shirts-jersey-t-shirt-us02",
    "qikink-dresses-kaftan-dress"
  ],
  "qikink-t-shirts-jersey-t-shirt-us02": [
    "qikink-dresses-kaftan-dress",
    "qikink-kids-clothes-kids-bomber-jacket-ka30"
  ],
  "qikink-dresses-kaftan-dress": [
    "qikink-kids-clothes-kids-bomber-jacket-ka30",
    "qikink-kids-clothes-all-over-print-sports-shorts-ka52"
  ],
  "qikink-kids-clothes-kids-bomber-jacket-ka30": [
    "qikink-kids-clothes-all-over-print-sports-shorts-ka52",
    "qikink-kids-clothes-all-over-print-sports-t-shirt-ka51"
  ],
  "qikink-kids-clothes-all-over-print-sports-shorts-ka52": [
    "qikink-kids-clothes-all-over-print-sports-t-shirt-ka51",
    "qikink-kids-clothes-all-over-print-sweatshirt-ka35"
  ],
  "qikink-kids-clothes-all-over-print-sports-t-shirt-ka51": [
    "qikink-kids-clothes-all-over-print-sweatshirt-ka35",
    "qikink-kids-clothes-all-over-print-t-shirt-ka71"
  ],
  "qikink-kids-clothes-all-over-print-sweatshirt-ka35": [
    "qikink-kids-clothes-all-over-print-t-shirt-ka71",
    "qikink-kids-clothes-hoodie-kh63"
  ],
  "qikink-kids-clothes-all-over-print-t-shirt-ka71": [
    "qikink-kids-clothes-hoodie-kh63",
    "qikink-t-shirts-all-over-print-full-sleeve-t-shirt-ma27"
  ],
  "qikink-kids-clothes-hoodie-kh63": [
    "qikink-t-shirts-all-over-print-full-sleeve-t-shirt-ma27",
    "qikink-tops-all-over-print-vest-ma29"
  ],
  "qikink-t-shirts-all-over-print-full-sleeve-t-shirt-ma27": [
    "qikink-tops-all-over-print-vest-ma29",
    "qikink-t-shirts-all-over-print-t-shirt-ua21"
  ],
  "qikink-tops-all-over-print-vest-ma29": [
    "qikink-t-shirts-all-over-print-t-shirt-ua21",
    "qikink-t-shirts-bike-rider-t-shirt-ma39"
  ],
  "qikink-t-shirts-all-over-print-t-shirt-ua21": [
    "qikink-t-shirts-bike-rider-t-shirt-ma39",
    "qikink-t-shirts-round-neck-t-shirt-classic-uc21"
  ],
  "qikink-t-shirts-bike-rider-t-shirt-ma39": [
    "qikink-t-shirts-round-neck-t-shirt-classic-uc21",
    "qikink-t-shirts-full-sleeve-t-shirt-mf31"
  ],
  "qikink-t-shirts-round-neck-t-shirt-classic-uc21": [
    "qikink-t-shirts-full-sleeve-t-shirt-mf31",
    "qikink-t-shirts-polo-t-shirts-mp25"
  ],
  "qikink-t-shirts-full-sleeve-t-shirt-mf31": [
    "qikink-t-shirts-polo-t-shirts-mp25",
    "qikink-t-shirts-raglan-t-shirt-ur37"
  ],
  "qikink-t-shirts-polo-t-shirts-mp25": [
    "qikink-t-shirts-raglan-t-shirt-ur37",
    "qikink-tops-gym-vest-men-ms36"
  ],
  "qikink-t-shirts-raglan-t-shirt-ur37": [
    "qikink-tops-gym-vest-men-ms36",
    "qikink-t-shirts-round-neck-t-shirt-standard-us21"
  ],
  "qikink-tops-gym-vest-men-ms36": [
    "qikink-t-shirts-round-neck-t-shirt-standard-us21",
    "qikink-t-shirts-v-neck-t-shirts-uv34"
  ],
  "qikink-t-shirts-round-neck-t-shirt-standard-us21": [
    "qikink-t-shirts-v-neck-t-shirts-uv34",
    "qikink-dresses-all-over-print-mini-skirt-fs59"
  ],
  "qikink-t-shirts-v-neck-t-shirts-uv34": [
    "qikink-dresses-all-over-print-mini-skirt-fs59",
    "qikink-t-shirts-oversized-jersey-t-shirt-uj35"
  ],
  "qikink-dresses-all-over-print-mini-skirt-fs59": [
    "qikink-t-shirts-oversized-jersey-t-shirt-uj35",
    "qikink-t-shirts-oversized-raglan-t-shirt-ur50"
  ],
  "qikink-t-shirts-oversized-jersey-t-shirt-uj35": [
    "qikink-t-shirts-oversized-raglan-t-shirt-ur50",
    "qikink-hoodies-pullover-hoodie-uh83"
  ],
  "qikink-t-shirts-oversized-raglan-t-shirt-ur50": [
    "qikink-hoodies-pullover-hoodie-uh83",
    "qikink-t-shirts-ringer-t-shirt-ur39"
  ],
  "qikink-hoodies-pullover-hoodie-uh83": [
    "qikink-t-shirts-ringer-t-shirt-ur39",
    "qikink-tops-sports-crop-top"
  ],
  "qikink-t-shirts-ringer-t-shirt-ur39": [
    "qikink-tops-sports-crop-top",
    "qikink-hoodies-all-over-print-bomber-jacket-ua30"
  ],
  "qikink-tops-sports-crop-top": [
    "qikink-hoodies-all-over-print-bomber-jacket-ua30",
    "qikink-t-shirts-all-over-print-oversized-t-shirt-ua22"
  ],
  "qikink-hoodies-all-over-print-bomber-jacket-ua30": [
    "qikink-t-shirts-all-over-print-oversized-t-shirt-ua22",
    "qikink-bottomwear-all-over-print-shorts-ma45"
  ],
  "qikink-t-shirts-all-over-print-oversized-t-shirt-ua22": [
    "qikink-bottomwear-all-over-print-shorts-ma45",
    "qikink-bottomwear-all-over-print-sports-shorts-ua52"
  ],
  "qikink-bottomwear-all-over-print-shorts-ma45": [
    "qikink-bottomwear-all-over-print-sports-shorts-ua52",
    "qikink-t-shirts-all-over-print-sports-t-shirt-ua51"
  ],
  "qikink-bottomwear-all-over-print-sports-shorts-ua52": [
    "qikink-t-shirts-all-over-print-sports-t-shirt-ua51",
    "qikink-hoodies-all-over-print-sweatshirt-ua26"
  ],
  "qikink-t-shirts-all-over-print-sports-t-shirt-ua51": [
    "qikink-hoodies-all-over-print-sweatshirt-ua26",
    "qikink-hoodies-acid-wash-hoodie-uh62"
  ],
  "qikink-hoodies-all-over-print-sweatshirt-ua26": [
    "qikink-hoodies-acid-wash-hoodie-uh62",
    "qikink-t-shirts-acid-wash-oversized-t-shirt-uc61"
  ],
  "qikink-hoodies-acid-wash-hoodie-uh62": [
    "qikink-t-shirts-acid-wash-oversized-t-shirt-uc61",
    "qikink-headwear-baseball-ottoman-cap-bc50"
  ],
  "qikink-t-shirts-acid-wash-oversized-t-shirt-uc61": [
    "qikink-headwear-baseball-ottoman-cap-bc50",
    "qikink-t-shirts-basic-t-shirt-ub73"
  ],
  "qikink-headwear-baseball-ottoman-cap-bc50": [
    "qikink-t-shirts-basic-t-shirt-ub73",
    "qikink-headwear-bucket-hat-bh35"
  ],
  "qikink-t-shirts-basic-t-shirt-ub73": [
    "qikink-headwear-bucket-hat-bh35",
    "qikink-headwear-snapback-cap-sb30"
  ],
  "qikink-headwear-bucket-hat-bh35": [
    "qikink-headwear-snapback-cap-sb30",
    "qikink-headwear-trucker-cap-tc55"
  ],
  "qikink-headwear-snapback-cap-sb30": [
    "qikink-headwear-trucker-cap-tc55",
    "qikink-headwear-baseball-cap-bc33"
  ],
  "qikink-headwear-trucker-cap-tc55": [
    "qikink-headwear-baseball-cap-bc33",
    "qikink-t-shirts-stretch-t-shirt-uc48"
  ],
  "qikink-headwear-baseball-cap-bc33": [
    "qikink-t-shirts-stretch-t-shirt-uc48",
    "qikink-pet-products-dog-t-shirt-dt59"
  ],
  "qikink-t-shirts-stretch-t-shirt-uc48": [
    "qikink-pet-products-dog-t-shirt-dt59",
    "qikink-hoodies-unisex-hoodie-uh24"
  ],
  "qikink-pet-products-dog-t-shirt-dt59": [
    "qikink-hoodies-unisex-hoodie-uh24",
    "qikink-bottomwear-joggers-uj29"
  ],
  "qikink-hoodies-unisex-hoodie-uh24": [
    "qikink-bottomwear-joggers-uj29",
    "qikink-t-shirts-oversized-t-shirt-uc22"
  ],
  "qikink-bottomwear-joggers-uj29": [
    "qikink-t-shirts-oversized-t-shirt-uc22",
    "qikink-hoodies-oversized-hoodie-uh32"
  ],
  "qikink-t-shirts-oversized-t-shirt-uc22": [
    "qikink-hoodies-oversized-hoodie-uh32",
    "qikink-t-shirts-short-sleeve-oversized-shirt-uc28"
  ],
  "qikink-hoodies-oversized-hoodie-uh32": [
    "qikink-t-shirts-short-sleeve-oversized-shirt-uc28",
    "qikink-t-shirts-oversized-t-shirt-standard-us22"
  ],
  "qikink-t-shirts-short-sleeve-oversized-shirt-uc28": [
    "qikink-t-shirts-oversized-t-shirt-standard-us22",
    "qikink-hoodies-oversized-sweatshirt-uh35"
  ],
  "qikink-t-shirts-oversized-t-shirt-standard-us22": [
    "qikink-hoodies-oversized-sweatshirt-uh35",
    "qikink-headwear-sports-cap-sp45"
  ],
  "qikink-hoodies-oversized-sweatshirt-uh35": [
    "qikink-headwear-sports-cap-sp45",
    "qikink-t-shirts-supima-cotton-t-shirts-uc23"
  ],
  "qikink-headwear-sports-cap-sp45": [
    "qikink-t-shirts-supima-cotton-t-shirts-uc23",
    "qikink-bottomwear-sweatpants-us52"
  ],
  "qikink-t-shirts-supima-cotton-t-shirts-uc23": [
    "qikink-bottomwear-sweatpants-us52",
    "qikink-hoodies-sweatshirt-uh26"
  ],
  "qikink-bottomwear-sweatpants-us52": [
    "qikink-hoodies-sweatshirt-uh26",
    "qikink-t-shirts-terry-oversized-t-shirt-ut27"
  ],
  "qikink-hoodies-sweatshirt-uh26": [
    "qikink-t-shirts-terry-oversized-t-shirt-ut27",
    "qikink-bottomwear-terry-shorts-mt45"
  ],
  "qikink-t-shirts-terry-oversized-t-shirt-ut27": [
    "qikink-bottomwear-terry-shorts-mt45",
    "qikink-t-shirts-tie-and-dye-oversized-t-shirt-ut58"
  ],
  "qikink-bottomwear-terry-shorts-mt45": [
    "qikink-t-shirts-tie-and-dye-oversized-t-shirt-ut58",
    "qikink-bottomwear-tie-dye-shorts-ut68"
  ],
  "qikink-t-shirts-tie-and-dye-oversized-t-shirt-ut58": [
    "qikink-bottomwear-tie-dye-shorts-ut68",
    "qikink-hoodies-varsity-jacket-uj31"
  ],
  "qikink-bottomwear-tie-dye-shorts-ut68": [
    "qikink-hoodies-varsity-jacket-uj31",
    "qikink-hoodies-unisex-fleece-heavyweight-zip-hoodie-uh38"
  ],
  "qikink-hoodies-varsity-jacket-uj31": [
    "qikink-hoodies-unisex-fleece-heavyweight-zip-hoodie-uh38",
    "qikink-bags-all-over-print-large-tote-bag"
  ],
  "qikink-hoodies-unisex-fleece-heavyweight-zip-hoodie-uh38": [
    "qikink-bags-all-over-print-large-tote-bag",
    "qikink-accessories-all-over-print-scarf"
  ],
  "qikink-bags-all-over-print-large-tote-bag": [
    "qikink-accessories-all-over-print-scarf",
    "qikink-accessories-all-over-print-stole"
  ],
  "qikink-accessories-all-over-print-scarf": [
    "qikink-accessories-all-over-print-stole",
    "qikink-accessories-scrunchies"
  ],
  "qikink-accessories-all-over-print-stole": [
    "qikink-accessories-scrunchies",
    "qikink-accessories-acrylic-display-stand"
  ],
  "qikink-accessories-scrunchies": [
    "qikink-accessories-acrylic-display-stand",
    "qikink-accessories-bar-pendant"
  ],
  "qikink-accessories-acrylic-display-stand": [
    "qikink-accessories-bar-pendant",
    "qikink-accessories-button-badge"
  ],
  "qikink-accessories-bar-pendant": [
    "qikink-accessories-button-badge",
    "qikink-accessories-bookmarks"
  ],
  "qikink-accessories-button-badge": [
    "qikink-accessories-bookmarks",
    "qikink-accessories-all-over-print-bow-scrunchie"
  ],
  "qikink-accessories-bookmarks": [
    "qikink-accessories-all-over-print-bow-scrunchie",
    "qikink-accessories-dog-tags"
  ],
  "qikink-accessories-all-over-print-bow-scrunchie": [
    "qikink-accessories-dog-tags",
    "qikink-accessories-embroidered-patches"
  ],
  "qikink-accessories-dog-tags": [
    "qikink-accessories-embroidered-patches",
    "qikink-accessories-fridge-magnets"
  ],
  "qikink-accessories-embroidered-patches": [
    "qikink-accessories-fridge-magnets",
    "qikink-accessories-greeting-card"
  ],
  "qikink-accessories-fridge-magnets": [
    "qikink-accessories-greeting-card",
    "qikink-accessories-keychain"
  ],
  "qikink-accessories-greeting-card": [
    "qikink-accessories-keychain",
    "qikink-kids-clothes-baby-romper-kr23"
  ],
  "qikink-accessories-keychain": [
    "qikink-kids-clothes-baby-romper-kr23",
    "qikink-accessories-luggage-tags"
  ],
  "qikink-kids-clothes-baby-romper-kr23": [
    "qikink-accessories-luggage-tags",
    "qikink-accessories-personalized-pens"
  ],
  "qikink-accessories-luggage-tags": [
    "qikink-accessories-personalized-pens",
    "qikink-pet-products-pet-tags"
  ],
  "qikink-accessories-personalized-pens": [
    "qikink-pet-products-pet-tags",
    "qikink-accessories-die-cut-stickers"
  ],
  "qikink-pet-products-pet-tags": [
    "qikink-accessories-die-cut-stickers",
    "qikink-accessories-temporary-tattoo"
  ],
  "qikink-accessories-die-cut-stickers": [
    "qikink-accessories-temporary-tattoo",
    "qikink-bags-all-over-print-drawstring-bag"
  ],
  "qikink-accessories-temporary-tattoo": [
    "qikink-bags-all-over-print-drawstring-bag",
    "qikink-bags-all-over-print-tote-bag"
  ],
  "qikink-bags-all-over-print-drawstring-bag": [
    "qikink-bags-all-over-print-tote-bag",
    "qikink-accessories-cotton-apron"
  ],
  "qikink-bags-all-over-print-tote-bag": [
    "qikink-accessories-cotton-apron",
    "qikink-bags-cotton-drawstring-bags"
  ],
  "qikink-accessories-cotton-apron": [
    "qikink-bags-cotton-drawstring-bags",
    "qikink-bags-large-tote-bag"
  ],
  "qikink-bags-cotton-drawstring-bags": [
    "qikink-bags-large-tote-bag",
    "qikink-bags-tote-bag"
  ],
  "qikink-bags-large-tote-bag": [
    "qikink-bags-tote-bag",
    "qikink-home-decor-acrylic-coasters"
  ],
  "qikink-bags-tote-bag": [
    "qikink-home-decor-acrylic-coasters",
    "qikink-home-decor-acrylic-photo-frame-with-wood-stand"
  ],
  "qikink-home-decor-acrylic-coasters": [
    "qikink-home-decor-acrylic-photo-frame-with-wood-stand",
    "qikink-home-decor-poster-acrylic-poster"
  ],
  "qikink-home-decor-acrylic-photo-frame-with-wood-stand": [
    "qikink-home-decor-poster-acrylic-poster",
    "qikink-drinkware-coffee-mug-black-mug"
  ],
  "qikink-home-decor-poster-acrylic-poster": [
    "qikink-drinkware-coffee-mug-black-mug",
    "qikink-home-decor-canvas-prints"
  ],
  "qikink-drinkware-coffee-mug-black-mug": [
    "qikink-home-decor-canvas-prints",
    "qikink-home-decor-ornament"
  ],
  "qikink-home-decor-canvas-prints": [
    "qikink-home-decor-ornament",
    "qikink-home-decor-cloth-napkins"
  ],
  "qikink-home-decor-ornament": [
    "qikink-home-decor-cloth-napkins",
    "qikink-home-decor-coaster"
  ],
  "qikink-home-decor-cloth-napkins": [
    "qikink-home-decor-coaster",
    "qikink-drinkware-coffee-mug-color-coffee-mug"
  ],
  "qikink-home-decor-coaster": [
    "qikink-drinkware-coffee-mug-color-coffee-mug",
    "qikink-home-decor-daily-planner"
  ],
  "qikink-drinkware-coffee-mug-color-coffee-mug": [
    "qikink-home-decor-daily-planner",
    "qikink-home-decor-poster-poster-frames"
  ],
  "qikink-home-decor-daily-planner": [
    "qikink-home-decor-poster-poster-frames",
    "qikink-home-decor-jigsaw-puzzle"
  ],
  "qikink-home-decor-poster-poster-frames": [
    "qikink-home-decor-jigsaw-puzzle",
    "qikink-home-decor-wooden-puzzle"
  ],
  "qikink-home-decor-jigsaw-puzzle": [
    "qikink-home-decor-wooden-puzzle",
    "qikink-drinkware-coffee-mug-magic-mug"
  ],
  "qikink-home-decor-wooden-puzzle": [
    "qikink-drinkware-coffee-mug-magic-mug",
    "qikink-home-decor-poster-metal-posters"
  ],
  "qikink-drinkware-coffee-mug-magic-mug": [
    "qikink-home-decor-poster-metal-posters",
    "qikink-home-decor-notepad"
  ],
  "qikink-home-decor-poster-metal-posters": [
    "qikink-home-decor-notepad",
    "qikink-home-decor-notebook"
  ],
  "qikink-home-decor-notepad": [
    "qikink-home-decor-notebook",
    "qikink-home-decor-placemats"
  ],
  "qikink-home-decor-notebook": [
    "qikink-home-decor-placemats",
    "qikink-home-decor-photo-postcard"
  ],
  "qikink-home-decor-placemats": [
    "qikink-home-decor-photo-postcard",
    "qikink-home-decor-poster-paper-poster"
  ],
  "qikink-home-decor-photo-postcard": [
    "qikink-home-decor-poster-paper-poster",
    "qikink-drinkware-sipper-bottle"
  ],
  "qikink-home-decor-poster-paper-poster": [
    "qikink-drinkware-sipper-bottle",
    "qikink-home-decor-sketchbook"
  ],
  "qikink-drinkware-sipper-bottle": [
    "qikink-home-decor-sketchbook",
    "qikink-drinkware-steel-water-bottle"
  ],
  "qikink-home-decor-sketchbook": [
    "qikink-drinkware-steel-water-bottle",
    "qikink-home-decor-table-runner"
  ],
  "qikink-drinkware-steel-water-bottle": [
    "qikink-home-decor-table-runner",
    "qikink-home-decor-wall-tapestry"
  ],
  "qikink-home-decor-table-runner": [
    "qikink-home-decor-wall-tapestry",
    "qikink-drinkware-tumbler-bottle"
  ],
  "qikink-home-decor-wall-tapestry": [
    "qikink-drinkware-tumbler-bottle",
    "qikink-home-decor-all-over-print-cushion-cover"
  ],
  "qikink-drinkware-tumbler-bottle": [
    "qikink-home-decor-all-over-print-cushion-cover",
    "qikink-home-decor-all-over-print-pillow-cover"
  ],
  "qikink-home-decor-all-over-print-cushion-cover": [
    "qikink-home-decor-all-over-print-pillow-cover",
    "qikink-drinkware-coffee-mug-white-mug"
  ],
  "qikink-home-decor-all-over-print-pillow-cover": [
    "qikink-drinkware-coffee-mug-white-mug",
    "qikink-drinkware-coffee-mug-enamel-mug"
  ],
  "qikink-drinkware-coffee-mug-white-mug": [
    "qikink-drinkware-coffee-mug-enamel-mug",
    "qikink-accessories-desk-mat"
  ],
  "qikink-drinkware-coffee-mug-enamel-mug": [
    "qikink-accessories-desk-mat",
    "qikink-accessories-mobile-clear-phone-case"
  ]
};

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id || p.slug === id);
}
