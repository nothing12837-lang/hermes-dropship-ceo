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
  { id: 'fashion', label: 'Curated Streetwear', count: 14, hint: 'Style', emoji: '👕' },
  { id: 'home-garden', label: 'Drinkware & Living', count: 3, hint: 'Drinkware', emoji: '☕' },
  { id: 'electronics', label: 'Desk & Creator Gear', count: 3, hint: 'Workstation', emoji: '⚡' },
  { id: 'general', label: 'Lifestyle Drops', count: 5, hint: 'Accessories', emoji: '🔥' },
];

export const products: Product[] = [
  {
  "id": "qikink-oversized-t-shirt-uc22",
  "slug": "qikink-oversized-t-shirt-uc22",
  "title": "Rare Ember Unisex Oversized Classic T-Shirt | UC22",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1799,
  "compare_at_price": 21.16,
  "category": "fashion",
  "emoji": "👕",
  "tag": "Signature Drop",
  "tagColor": "#FF4D24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/3/4d542001-463c-416c-86ea-93effc54f669.jpg",
  "supplier": "qikink",
  "short": "240 GSM with 100% Cotton. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Unisex Oversized Classic T-Shirt | UC22 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "240 GSM",
    "100% Cotton",
    "Super Combed",
    "Pre Shrunk",
    "Bio Washed",
    "Lycra Ribbed Neck"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-acid-wash-oversized-t-shirt-uc61",
  "slug": "qikink-acid-wash-oversized-t-shirt-uc61",
  "title": "Rare Ember Unisex Acid Wash Oversized Tee | UC61",
  "price": 11.75,
  "price_inr": 999,
  "old_price": 1999,
  "compare_at_price": 23.52,
  "category": "fashion",
  "emoji": "👕",
  "tag": "Vintage Wash",
  "tagColor": "#f59e0b",
  "tagBg": "rgba(245, 158, 11, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/4ca57c05-41a5-45b1-9856-5c6ac1e7f33f.jpg",
  "supplier": "qikink",
  "short": "240 GSM with 100% Cotton. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Unisex Acid Wash Oversized Tee | UC61 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "240 GSM",
    "100% Cotton",
    "Super Combed",
    "Pre Shrunk",
    "Acid-Washed",
    "Lycra Ribbed Neck"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-terry-oversized-t-shirt-ut27",
  "slug": "qikink-terry-oversized-t-shirt-ut27",
  "title": "Rare Ember Unisex Terry Oversized Tee | UT27",
  "price": 11.16,
  "price_inr": 949,
  "old_price": 1899,
  "compare_at_price": 22.34,
  "category": "fashion",
  "emoji": "👕",
  "tag": "Heavy French Terry",
  "tagColor": "#8b5cf6",
  "tagBg": "rgba(139, 92, 246, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/44/df1b411b-46ec-4c8f-aa0d-75b796bcda00.jpg",
  "supplier": "qikink",
  "short": "260 GSM with 90% Cotton 10% Polyester. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Unisex Terry Oversized Tee | UT27 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "260 GSM",
    "90% Cotton 10% Polyester",
    "Unisex Style",
    "Pre Shrunk",
    "Drop Shoulder",
    "Looped inners"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-supima-cotton-t-shirts-uc23",
  "slug": "qikink-supima-cotton-t-shirts-uc23",
  "title": "Rare Ember Unisex Supima T-Shirt | UC23",
  "price": 11.16,
  "price_inr": 949,
  "old_price": 1899,
  "compare_at_price": 22.34,
  "category": "fashion",
  "emoji": "🖤",
  "tag": "Luxury Supima",
  "tagColor": "#6366f1",
  "tagBg": "rgba(99, 102, 241, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/41/d4c73929-12bd-4e79-ad05-ec41d8d14d5f.jpg",
  "supplier": "qikink",
  "short": "160 GSM with 100% Cotton. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Unisex Supima T-Shirt | UC23 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "160 GSM",
    "100% Cotton",
    "Unisex Style",
    "Pre Shrunk",
    "Softer Feel",
    "Lycra Ribbed Neck"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-round-neck-t-shirt-classic-uc21",
  "slug": "qikink-round-neck-t-shirt-classic-uc21",
  "title": "Rare Ember Male Classic Crew T-Shirt",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1399,
  "compare_at_price": 16.46,
  "category": "fashion",
  "emoji": "👕",
  "tag": "Classic Everyday",
  "tagColor": "#0ea5e9",
  "tagBg": "rgba(14, 165, 233, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/6/f787f104-9e35-4cad-acab-05be0c7f322d.jpg",
  "supplier": "qikink",
  "short": "180 GSM with 100% Cotton. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Male Classic Crew T-Shirt featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "180 GSM",
    "100% Cotton",
    "Super Combed",
    "Pre Shrunk",
    "Bio Washed",
    "Lycra Ribbed Neck"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-polo-t-shirts-mp25",
  "slug": "qikink-polo-t-shirts-mp25",
  "title": "Rare Ember Male Polo | MP25",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1799,
  "compare_at_price": 21.16,
  "category": "fashion",
  "emoji": "👔",
  "tag": "Structured Knit",
  "tagColor": "#10b981",
  "tagBg": "rgba(16, 185, 129, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/18/10c8083a-3fff-4839-a473-f6c07cc6b708.jpg",
  "supplier": "qikink",
  "short": "220 GSM with 100% Cotton. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Male Polo | MP25 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "220 GSM",
    "100% Cotton",
    "Super Combed",
    "Pre Shrunk",
    "Bio Washed",
    "Collar and Cuff"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-gym-vest-men-ms36",
  "slug": "qikink-gym-vest-men-ms36",
  "title": "Rare Ember Male Sleeveless T-Shirt | MS36",
  "price": 7.64,
  "price_inr": 649,
  "old_price": 1299,
  "compare_at_price": 15.28,
  "category": "fashion",
  "emoji": "🎽",
  "tag": "Athletic Muscle Tank",
  "tagColor": "#ef4444",
  "tagBg": "rgba(239, 68, 68, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/66/84dab9ed-cfbd-4259-b12f-50dc3f96154e.jpg",
  "supplier": "qikink",
  "short": "180 GSM with 100% Cotton. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Male Sleeveless T-Shirt | MS36 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "180 GSM",
    "100% Cotton",
    "Super Combed",
    "Pre Shrunk",
    "Bio Washed",
    "Folded Neck"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-crop-top-fc39",
  "slug": "qikink-crop-top-fc39",
  "title": "Rare Ember Female Crop Top | FC39",
  "price": 8.22,
  "price_inr": 699,
  "old_price": 1399,
  "compare_at_price": 16.46,
  "category": "fashion",
  "emoji": "🤍",
  "tag": "Women's Boxy Crop",
  "tagColor": "#ec4899",
  "tagBg": "rgba(236, 72, 153, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/37/604e613a-23a0-44ff-9c78-8c9711aa4332.jpg",
  "supplier": "qikink",
  "short": "180 GSM with 100% Cotton. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Female Crop Top | FC39 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "180 GSM",
    "100% Cotton",
    "Super Combed",
    "Pre Shrunk",
    "Bio Washed",
    "Lycra Ribbed Neck"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-oversized-hoodie-uh32",
  "slug": "qikink-oversized-hoodie-uh32",
  "title": "Rare Ember Unisex Oversized Hoodie | UH32",
  "price": 19.99,
  "price_inr": 1699,
  "old_price": 3499,
  "compare_at_price": 41.16,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Flagship 380 GSM",
  "tagColor": "#FF4D24",
  "tagBg": "rgba(255, 77, 36, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/82/ddc7518f-afc2-4370-8d1a-43db4863d356.jpg",
  "supplier": "qikink",
  "short": "400 GSM with 90% Cotton 10% Polyester. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Unisex Oversized Hoodie | UH32 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "400 GSM",
    "90% Cotton 10% Polyester",
    "Super Combed",
    "Pre Shrunk",
    "Bio Washed",
    "Derby Ribbed Hem & Cuff"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-unisex-fleece-heavyweight-zip-hoodie-uh38",
  "slug": "qikink-unisex-fleece-heavyweight-zip-hoodie-uh38",
  "title": "Rare Ember Unisex Zip Hoodie | UH38",
  "price": 21.16,
  "price_inr": 1799,
  "old_price": 3599,
  "compare_at_price": 42.34,
  "category": "fashion",
  "emoji": "🧥",
  "tag": "Heavyweight Full-Zip",
  "tagColor": "#8b5cf6",
  "tagBg": "rgba(139, 92, 246, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/76/e8cb03d3-db36-4ffa-8415-682598c26626.jpg",
  "supplier": "qikink",
  "short": "400 GSM with 90% Cotton 10% Polyester. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Unisex Zip Hoodie | UH38 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "400 GSM",
    "90% Cotton 10% Polyester",
    "Super Combed",
    "Pre Shrunk",
    "Bio Washed",
    "Derby Ribbed Hem & Cuff"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-oversized-sweatshirt-uh35",
  "slug": "qikink-oversized-sweatshirt-uh35",
  "title": "Rare Ember Unisex Oversized Sweatshirt | UH35",
  "price": 16.46,
  "price_inr": 1399,
  "old_price": 2799,
  "compare_at_price": 32.93,
  "category": "fashion",
  "emoji": "🧶",
  "tag": "Boxy Crewneck",
  "tagColor": "#14b8a6",
  "tagBg": "rgba(20, 184, 166, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/42/e1aabdde-178c-4773-9b54-93df46230600.jpg",
  "supplier": "qikink",
  "short": "400 GSM with 90% Cotton 10% Polyester. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Unisex Oversized Sweatshirt | UH35 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "400 GSM",
    "90% Cotton 10% Polyester",
    "Super Combed",
    "Pre Shrunk",
    "Bio Washed",
    "Derby Ribbed Hem & Cuff"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-cropped-hoodie-fc32",
  "slug": "qikink-cropped-hoodie-fc32",
  "title": "Rare Ember Female Cropped Hoodie | FC32",
  "price": 16.46,
  "price_inr": 1399,
  "old_price": 2799,
  "compare_at_price": 32.93,
  "category": "fashion",
  "emoji": "✨",
  "tag": "Women's Cropped Fleece",
  "tagColor": "#d946ef",
  "tagBg": "rgba(217, 70, 239, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/14/905f2760-b428-4095-9427-4e0373b550fd.jpg",
  "supplier": "qikink",
  "short": "300 GSM with 90% Cotton 10% Polyester. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Female Cropped Hoodie | FC32 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "300 GSM",
    "90% Cotton 10% Polyester",
    "Super Combed",
    "Pre Shrunk",
    "Bio Wash",
    "Derby Rib Hem"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-joggers-uj29",
  "slug": "qikink-joggers-uj29",
  "title": "Rare Ember Unisex Joggers | UJ29",
  "price": 17.64,
  "price_inr": 1499,
  "old_price": 2999,
  "compare_at_price": 35.28,
  "category": "fashion",
  "emoji": "👖",
  "tag": "Streetwear Joggers",
  "tagColor": "#3b82f6",
  "tagBg": "rgba(59, 130, 246, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/32/3f45e6d3-837a-461b-9f52-b2c615eb14e4.jpg",
  "supplier": "qikink",
  "short": "260 GSM with 90% Cotton 10% Polyester. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Unisex Joggers | UJ29 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "260 GSM",
    "90% Cotton 10% Polyester",
    "Super Combed",
    "Pre Shrunk",
    "Bio Washed",
    "Derby Ribbed at Waist and Legs"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-sweatpants-us52",
  "slug": "qikink-sweatpants-us52",
  "title": "Rare Ember Unisex Sweatpants | US52",
  "price": 16.46,
  "price_inr": 1399,
  "old_price": 2799,
  "compare_at_price": 32.93,
  "category": "fashion",
  "emoji": "👖",
  "tag": "Heavy Sweatpants",
  "tagColor": "#64748b",
  "tagBg": "rgba(100, 116, 139, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/320/c87587e9-0faa-4c24-8c3d-a74f012c3eb3.webp",
  "supplier": "qikink",
  "short": "260 GSM with 90% Cotton 10% Polyester. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Unisex Sweatpants | US52 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "260 GSM",
    "90% Cotton 10% Polyester",
    "Terry Fabric",
    "Looped Inners",
    "Two Front Pockets",
    "Loose Fit"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-steel-water-bottle",
  "slug": "qikink-steel-water-bottle",
  "title": "Rare Ember Steel Water bottle",
  "price": 9.4,
  "price_inr": 799,
  "old_price": 1599,
  "compare_at_price": 18.81,
  "category": "home-garden",
  "emoji": "💧",
  "tag": "Food-Grade 304 Steel",
  "tagColor": "#10b981",
  "tagBg": "rgba(16, 185, 129, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/273/d0aa5134-38bf-4c42-9b59-df25de4bf1c2.jpg",
  "supplier": "qikink",
  "short": "25 Oz with Stainless Steel. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Steel Water bottle featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "25 Oz",
    "Stainless Steel",
    "Engraved",
    "Leak Proof",
    "BPA Free",
    "Eco Friendly"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tumbler-bottle",
  "slug": "qikink-tumbler-bottle",
  "title": "Rare Ember Tumbler Bottle",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1799,
  "compare_at_price": 21.16,
  "category": "home-garden",
  "emoji": "🥤",
  "tag": "Insulated Tumbler",
  "tagColor": "#06b6d4",
  "tagBg": "rgba(6, 182, 212, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/57/d42bf518-cd45-411b-8eb0-d0c0384e3fd1.jpg",
  "supplier": "qikink",
  "short": "20 Oz with 304 Stainless Steel. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Tumbler Bottle featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "20 Oz",
    "304 Stainless Steel",
    "Fade Proof Print",
    "Double Wall Insulated",
    "Metal Straw",
    "Splash-Proof Lid"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-sipper-bottle",
  "slug": "qikink-sipper-bottle",
  "title": "Rare Ember Sipper Bottle",
  "price": 7.05,
  "price_inr": 599,
  "old_price": 1199,
  "compare_at_price": 14.11,
  "category": "home-garden",
  "emoji": "🧋",
  "tag": "Aesthetic Sipper",
  "tagColor": "#f59e0b",
  "tagBg": "rgba(245, 158, 11, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/53/39f2c346-c5f8-45dc-918a-08e56b1a90c5.jpg",
  "supplier": "qikink",
  "short": "750 ml with Glossy Finish. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Sipper Bottle featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "750 ml",
    "Glossy Finish",
    "Fade Proof Print",
    "Aluminum Bottle",
    "Clip Cap",
    "OEKO-TEX Certified"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-desk-mat",
  "slug": "qikink-desk-mat",
  "title": "Rare Ember Gaming Pad",
  "price": 10.58,
  "price_inr": 899,
  "old_price": 1799,
  "compare_at_price": 21.16,
  "category": "electronics",
  "emoji": "🖥️",
  "tag": "Creator Workstation",
  "tagColor": "#3b82f6",
  "tagBg": "rgba(59, 130, 246, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg",
  "supplier": "qikink",
  "short": "3 MM Thickness with 2 Sizes. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Gaming Pad featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "3 MM Thickness",
    "2 Sizes",
    "Stitched Edges",
    "Strong Back Grip",
    "Extended Design",
    "Home & Office Use"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-mouse-pad",
  "slug": "qikink-mouse-pad",
  "title": "Rare Ember Mouse Pad",
  "price": 4.69,
  "price_inr": 399,
  "old_price": 799,
  "compare_at_price": 9.4,
  "category": "electronics",
  "emoji": "🖱️",
  "tag": "Precision Glide",
  "tagColor": "#6366f1",
  "tagBg": "rgba(99, 102, 241, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/52/1da2d780-a6a8-4fab-9eb2-c7fbd75c37ef.jpg",
  "supplier": "qikink",
  "short": "3 mm Thickness with Skid Proof. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Mouse Pad featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "3 mm Thickness",
    "Skid Proof",
    "Smooth Surface",
    "Precised Cut-outs",
    "Fade Proof Print",
    "OEKO-TEX Certified"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-clear-phone-case",
  "slug": "qikink-clear-phone-case",
  "title": "Rare Ember Hard Clear Case | CC32",
  "price": 6.46,
  "price_inr": 549,
  "old_price": 1099,
  "compare_at_price": 12.93,
  "category": "electronics",
  "emoji": "📱",
  "tag": "Impact Shield",
  "tagColor": "#ec4899",
  "tagBg": "rgba(236, 72, 153, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/325/c0b869cd-33d3-4167-a9ec-365dbc0860fd.webp",
  "supplier": "qikink",
  "short": "Hybrid Case with TPU Sides. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Hard Clear Case | CC32 featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "Hybrid Case",
    "TPU Sides",
    "PC Back",
    "Detachable Camera Protector",
    "2mm Thick back",
    "Fade-proof Prints"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-tote-bag",
  "slug": "qikink-tote-bag",
  "title": "Rare Ember Unisex Tote Bag Zipper",
  "price": 5.28,
  "price_inr": 449,
  "old_price": 999,
  "compare_at_price": 11.75,
  "category": "general",
  "emoji": "👜",
  "tag": "100% Cotton Canvas",
  "tagColor": "#10b981",
  "tagBg": "rgba(16, 185, 129, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/19/eb4b0c27-02ab-4a23-8c02-e60e9460c4f6.jpg",
  "supplier": "qikink",
  "short": "Canvas Tote with 100% Cotton. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Unisex Tote Bag Zipper featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "Canvas Tote",
    "100% Cotton",
    "Double Stitched",
    "Long Handle",
    "Eco-Friendly Nature",
    "Stylish"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-large-tote-bag",
  "slug": "qikink-large-tote-bag",
  "title": "Rare Ember Unisex Everyday Large Tote bag",
  "price": 6.46,
  "price_inr": 549,
  "old_price": 1199,
  "compare_at_price": 14.11,
  "category": "general",
  "emoji": "👜",
  "tag": "Extra Heavy Canvas",
  "tagColor": "#0ea5e9",
  "tagBg": "rgba(14, 165, 233, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/106/ff357000-e9f9-4162-84ce-8603053ba68f.jpg",
  "supplier": "qikink",
  "short": "100% cotton with Zippered closure. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Unisex Everyday Large Tote bag featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "100% cotton",
    "Zippered closure",
    "Nylon inner lining",
    "2 Inner pockets",
    "Water bottle holder",
    "Key holder"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-notebook",
  "slug": "qikink-notebook",
  "title": "Rare Ember Notebook",
  "price": 4.69,
  "price_inr": 399,
  "old_price": 799,
  "compare_at_price": 9.4,
  "category": "general",
  "emoji": "📓",
  "tag": "Hardbound Journal",
  "tagColor": "#8b5cf6",
  "tagBg": "rgba(139, 92, 246, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/280/9d7c853e-f1f6-4e3b-beed-472e9ecda38b.jpg",
  "supplier": "qikink",
  "short": "300 GSM Cover with 70 GSM Pages. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Notebook featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "300 GSM Cover",
    "70 GSM Pages",
    "120 Pages",
    "A5 Size",
    "Eco Friendly",
    "Soft Binded"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-die-cut-stickers",
  "slug": "qikink-die-cut-stickers",
  "title": "Rare Ember Stickers",
  "price": 3.52,
  "price_inr": 299,
  "old_price": 599,
  "compare_at_price": 7.05,
  "category": "general",
  "emoji": "✨",
  "tag": "Vinyl Die-Cut Decals",
  "tagColor": "#ec4899",
  "tagBg": "rgba(236, 72, 153, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/58/de1e7992-9b6b-4803-8d77-0fbcff706eb3.jpg",
  "supplier": "qikink",
  "short": "100 Microns with Indoor / Outdoor Applications. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Stickers featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "100 Microns",
    "Indoor / Outdoor Applications",
    "Custom Shape",
    "Die-Cutting",
    "Matte Laminated",
    "Digital Print"
  ],
  "gradient": "linear-gradient(135deg, #18181b, #09090b)",
  "active": true
},
  {
  "id": "qikink-poster-frames",
  "slug": "qikink-poster-frames",
  "title": "Rare Ember Framed Poster",
  "price": 11.75,
  "price_inr": 999,
  "old_price": 1999,
  "compare_at_price": 23.52,
  "category": "general",
  "emoji": "🖼️",
  "tag": "Solid Wood Framed",
  "tagColor": "#f59e0b",
  "tagBg": "rgba(245, 158, 11, 0.12)",
  "stock": 500,
  "rating": 4.9,
  "reviews": 120,
  "image_url": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/62/8fec1804-d535-4b39-a0b7-5ed822944e22.jpg",
  "supplier": "qikink",
  "short": "300 GSM Artboard with Glossy Finish. Dispatched direct from Tirupur manufacturing floor.",
  "story": "Genuine Qikink domestic print-on-demand production engineered for Rare Ember. Framed Poster featuring factory-certified materials, zero shrinkage, and vibrant long-lasting prints.",
  "details": [
    "300 GSM Artboard",
    "Glossy Finish",
    "1â³ Frame (0.25â³ Tolerance)",
    "2 mm Board Thickness",
    "Laminated",
    "13 Sizes"
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
  "qikink-oversized-t-shirt-uc22": [
    "qikink-acid-wash-oversized-t-shirt-uc61",
    "qikink-terry-oversized-t-shirt-ut27"
  ],
  "qikink-acid-wash-oversized-t-shirt-uc61": [
    "qikink-terry-oversized-t-shirt-ut27",
    "qikink-supima-cotton-t-shirts-uc23"
  ],
  "qikink-terry-oversized-t-shirt-ut27": [
    "qikink-supima-cotton-t-shirts-uc23",
    "qikink-round-neck-t-shirt-classic-uc21"
  ],
  "qikink-supima-cotton-t-shirts-uc23": [
    "qikink-round-neck-t-shirt-classic-uc21",
    "qikink-polo-t-shirts-mp25"
  ],
  "qikink-round-neck-t-shirt-classic-uc21": [
    "qikink-polo-t-shirts-mp25",
    "qikink-gym-vest-men-ms36"
  ],
  "qikink-polo-t-shirts-mp25": [
    "qikink-gym-vest-men-ms36",
    "qikink-crop-top-fc39"
  ],
  "qikink-gym-vest-men-ms36": [
    "qikink-crop-top-fc39",
    "qikink-oversized-hoodie-uh32"
  ],
  "qikink-crop-top-fc39": [
    "qikink-oversized-hoodie-uh32",
    "qikink-unisex-fleece-heavyweight-zip-hoodie-uh38"
  ],
  "qikink-oversized-hoodie-uh32": [
    "qikink-unisex-fleece-heavyweight-zip-hoodie-uh38",
    "qikink-oversized-sweatshirt-uh35"
  ],
  "qikink-unisex-fleece-heavyweight-zip-hoodie-uh38": [
    "qikink-oversized-sweatshirt-uh35",
    "qikink-cropped-hoodie-fc32"
  ],
  "qikink-oversized-sweatshirt-uh35": [
    "qikink-cropped-hoodie-fc32",
    "qikink-joggers-uj29"
  ],
  "qikink-cropped-hoodie-fc32": [
    "qikink-joggers-uj29",
    "qikink-sweatpants-us52"
  ],
  "qikink-joggers-uj29": [
    "qikink-sweatpants-us52",
    "qikink-steel-water-bottle"
  ],
  "qikink-sweatpants-us52": [
    "qikink-steel-water-bottle",
    "qikink-tumbler-bottle"
  ],
  "qikink-steel-water-bottle": [
    "qikink-tumbler-bottle",
    "qikink-sipper-bottle"
  ],
  "qikink-tumbler-bottle": [
    "qikink-sipper-bottle",
    "qikink-desk-mat"
  ],
  "qikink-sipper-bottle": [
    "qikink-desk-mat",
    "qikink-mouse-pad"
  ],
  "qikink-desk-mat": [
    "qikink-mouse-pad",
    "qikink-clear-phone-case"
  ],
  "qikink-mouse-pad": [
    "qikink-clear-phone-case",
    "qikink-tote-bag"
  ],
  "qikink-clear-phone-case": [
    "qikink-tote-bag",
    "qikink-large-tote-bag"
  ],
  "qikink-tote-bag": [
    "qikink-large-tote-bag",
    "qikink-notebook"
  ],
  "qikink-large-tote-bag": [
    "qikink-notebook",
    "qikink-die-cut-stickers"
  ],
  "qikink-notebook": [
    "qikink-die-cut-stickers",
    "qikink-poster-frames"
  ],
  "qikink-die-cut-stickers": [
    "qikink-poster-frames",
    "qikink-oversized-t-shirt-uc22"
  ],
  "qikink-poster-frames": [
    "qikink-oversized-t-shirt-uc22",
    "qikink-acid-wash-oversized-t-shirt-uc61"
  ]
};

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id || p.slug === id);
}
