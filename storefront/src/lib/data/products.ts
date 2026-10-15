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
  chapter: string;
  pet: PetType;
  ages: AgeGroup[];
  benefits: string[];
  safety: string;
  vetNote: string;
  subscribeEligible: boolean;
  wash: string;
  badges: string[];
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
  { id: 'fashion', label: 'Curated Streetwear', count: 4, hint: 'Style', emoji: '👕' },
  { id: 'home-garden', label: 'Drinkware & Living', count: 3, hint: 'Home', emoji: '☕' },
  { id: 'electronics', label: 'Desk & Creator Gear', count: 1, hint: 'Setup', emoji: '⚡' },
  { id: 'general', label: 'Lifestyle Drops', count: 2, hint: 'Essentials', emoji: '🔥' },
];

export const products: Product[] = [
  {
    "id": "rareember-oversized-streetwear-tee-obsidian",
    "slug": "rareember-oversized-streetwear-tee-obsidian",
    "emoji": "\ud83d\udc55",
    "tag": "Bestseller",
    "tagColor": "#ffffff",
    "tagBg": "#d97706",
    "title": "Rare Ember Heavyweight Oversized Graphic Tee (240 GSM) \u2014 Obsidian Black",
    "short": "Heavyweight 240 GSM bio-washed French terry cotton with relaxed dropped shoulders and high-density chest typography.",
    "story": "Engineered for effortless street silhouettes. Tailored from 100% combed French terry with pre-shrunk bio-washing to ensure zero shrinkage and unmatched drape.",
    "details": [
      "240 GSM 100% Combed Bio-Washed French Terry Cotton",
      "Relaxed Dropped Shoulder Oversized Fit",
      "High-Density Durable Screen / DTF Print",
      "Zero-Shrinkage Silicone Wash Treated",
      "Pan-India Tracked 2\u20134 Day Express Delivery with White-Label Packaging"
    ],
    "price": 10.58,
    "price_inr": 899.0,
    "compareAtPrice": 1999.0,
    "rating": 4.9,
    "reviews": 84,
    "category": "fashion",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    "images": [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
    ],
    "gradient": "linear-gradient(135deg, #1e293b, #0f172a)",
    "chapter": "CHAPTER-1",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "100% Certified Premium Quality",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Pan-India Express",
      "Cash on Delivery",
      "7-Day Replacement"
    ],
    "active": true
  },
  {
    "id": "rareember-oversized-streetwear-tee-offwhite",
    "slug": "rareember-oversized-streetwear-tee-offwhite",
    "emoji": "\ud83e\udd0d",
    "tag": "Trending",
    "tagColor": "#ffffff",
    "tagBg": "#b45309",
    "title": "Rare Ember Heavyweight Oversized Graphic Tee (240 GSM) \u2014 Vintage Off-White",
    "short": "Premium 240 GSM combed cotton with minimal cyberpunk flame crest. Breathable, durable, and shrink-resistant.",
    "story": "The signature Rare Ember daily uniform. Subtle Japanese typography and minimal chest crest inspired by nocturnal Tokyo streets.",
    "details": [
      "240 GSM Heavyweight Premium Combed Cotton",
      "Ribbed Lycra Collar That Never Sags",
      "Double-Needled Hemming & Precision Stitching",
      "Pan-India Express Delivery & Cash on Delivery Available"
    ],
    "price": 10.58,
    "price_inr": 899.0,
    "compareAtPrice": 1999.0,
    "rating": 4.8,
    "reviews": 62,
    "category": "fashion",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    "images": [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #e2e8f0)",
    "chapter": "CHAPTER-1",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "100% Certified Premium Quality",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Pan-India Express",
      "Cash on Delivery",
      "7-Day Replacement"
    ],
    "active": true
  },
  {
    "id": "rareember-heavyweight-fleece-hoodie-onyx",
    "slug": "rareember-heavyweight-fleece-hoodie-onyx",
    "emoji": "\ud83e\udde5",
    "tag": "Winter Drop",
    "tagColor": "#ffffff",
    "tagBg": "#dc2626",
    "title": "Rare Ember Heavyweight Streetwear Hoodie (380 GSM Fleece) \u2014 Onyx Black",
    "short": "Ultra-plush 380 GSM fleece hoodie with double-layered hood, kangaroo pocket, and ribbed cuffs. Built for winter warmth and street aesthetic.",
    "story": "Constructed from 380 GSM ultra-heavy combed cotton fleece. Features a structured double-layer hood that stands upright without collapsing.",
    "details": [
      "380 GSM Super-Heavyweight Cotton Fleece",
      "Double-Layered Self-Fabric Heavy Hood",
      "Spacious Kangaroo Pocket with Reinforced Bar-Tacks",
      "Branded Rare Ember Neck Tag & Custom White-Label Packaging",
      "7-Day Hassle-Free Replacement Guarantee"
    ],
    "price": 19.99,
    "price_inr": 1699.0,
    "compareAtPrice": 3499.0,
    "rating": 4.9,
    "reviews": 118,
    "category": "fashion",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    "images": [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
    ],
    "gradient": "linear-gradient(135deg, #09090b, #18181b)",
    "chapter": "CHAPTER-1",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "100% Certified Premium Quality",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Pan-India Express",
      "Cash on Delivery",
      "7-Day Replacement"
    ],
    "active": true
  },
  {
    "id": "rareember-essential-crewneck-sweatshirt-heather",
    "slug": "rareember-essential-crewneck-sweatshirt-heather",
    "emoji": "\u2728",
    "tag": "Limited Edition",
    "tagColor": "#ffffff",
    "tagBg": "#475569",
    "title": "Rare Ember Minimalist Essential Crewneck Sweatshirt (320 GSM) \u2014 Heather Charcoal",
    "short": "Structured 320 GSM brushed fleece with tonal Rare Ember insignia. Clean luxury lounge & street silhouette.",
    "story": "Versatile minimalism at its peak. Pairs effortlessly over collared shirts or casual denim.",
    "details": [
      "320 GSM Brushed Interior Fleece",
      "Tonal High-Definition Chest Embroidery",
      "Pre-Shrunk Fade-Resistant Reactive Dye",
      "Pan-India Tracked BlueDart / Delhivery Dispatch"
    ],
    "price": 16.46,
    "price_inr": 1399.0,
    "compareAtPrice": 2799.0,
    "rating": 4.8,
    "reviews": 47,
    "category": "fashion",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    "images": [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80"
    ],
    "gradient": "linear-gradient(135deg, #334155, #1e293b)",
    "chapter": "CHAPTER-1",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "100% Certified Premium Quality",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Pan-India Express",
      "Cash on Delivery",
      "7-Day Replacement"
    ],
    "active": true
  },
  {
    "id": "rareember-matte-black-ceramic-coffee-mug",
    "slug": "rareember-matte-black-ceramic-coffee-mug",
    "emoji": "\u2615",
    "tag": "Desk Essential",
    "tagColor": "#ffffff",
    "tagBg": "#78350f",
    "title": "Rare Ember Artisan Matte Black Ceramic Coffee Mug (350ml)",
    "short": "Ceramic handcrafted coffee mug in matte stone black with golden ember deboss. Microwave & dishwasher safe.",
    "story": "Designed for long focus sessions and quiet morning rituals. High-fired stoneware retains heat significantly longer than standard mugs.",
    "details": [
      "350ml Handcrafted Heavy Ceramic Stoneware",
      "Silky Smooth Matte Black Exterior Finish",
      "Ergonomic Wide Handle for Comfortable Grip",
      "100% Microwave & Dishwasher Safe",
      "Shatter-Resistant Multi-Layer Cushion Packaging"
    ],
    "price": 5.87,
    "price_inr": 499.0,
    "compareAtPrice": 999.0,
    "rating": 4.9,
    "reviews": 93,
    "category": "home-garden",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    "images": [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ],
    "gradient": "linear-gradient(135deg, #27272a, #18181b)",
    "chapter": "CHAPTER-2",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "100% Certified Premium Quality",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Pan-India Express",
      "Cash on Delivery",
      "7-Day Replacement"
    ],
    "active": true
  },
  {
    "id": "rareember-thermal-insulated-travel-tumbler-straw",
    "slug": "rareember-thermal-insulated-travel-tumbler-straw",
    "emoji": "\ud83e\udd64",
    "tag": "Everyday Carry",
    "tagColor": "#ffffff",
    "tagBg": "#0284c7",
    "title": "Rare Ember Double-Wall Insulated Steel Travel Tumbler with Straw (500ml)",
    "short": "Food-grade 304 stainless steel tumbler keeping beverages ice-cold for 16 hours or piping hot for 8 hours. Spill-proof lid with steel straw.",
    "story": "Double-wall vacuum insulation prevents condensation on your desk while preserving temperature from morning commute to late-night studio work.",
    "details": [
      "Double-Wall Vacuum 304 Stainless Steel Construction",
      "Keeps Ice-Cold for 16 Hours, Hot for 8 Hours",
      "Spill-Resistant BPA-Free Tritan Lid + Metal Straw Included",
      "Fits Standard Car Cup Holders & Gym Backpack Sleeves"
    ],
    "price": 9.4,
    "price_inr": 799.0,
    "compareAtPrice": 1699.0,
    "rating": 4.8,
    "reviews": 76,
    "category": "home-garden",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80",
    "images": [
      "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80"
    ],
    "gradient": "linear-gradient(135deg, #0369a1, #0c4a6e)",
    "chapter": "CHAPTER-2",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "100% Certified Premium Quality",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Pan-India Express",
      "Cash on Delivery",
      "7-Day Replacement"
    ],
    "active": true
  },
  {
    "id": "rareember-extended-desk-mat-gaming-mousepad",
    "slug": "rareember-extended-desk-mat-gaming-mousepad",
    "emoji": "\ud83d\udda5\ufe0f",
    "tag": "Setup Upgrade",
    "tagColor": "#ffffff",
    "tagBg": "#4338ca",
    "title": "Rare Ember Extended Desk Mat & Creator Mousepad (900\u00d7400mm, 4mm)",
    "short": "Micro-textured aesthetic desk surface with anti-fray stitched edges and high-density non-slip natural rubber base.",
    "story": "Transform your desk into a curated battlestation. 4mm thick natural rubber dampens mechanical keyboard vibration and provides butter-smooth mouse gliding.",
    "details": [
      "Massive 900mm \u00d7 400mm Workspace Coverage",
      "Ultra-Smooth Micro-Weave Cloth Surface for Pixel-Precision Tracking",
      "Reinforced 360\u00b0 Anti-Fray Stitched Edges",
      "Water-Resistant Spill-Proof Coating (Wipes Clean in Seconds)",
      "Non-Slip Heavy Textured Rubber Base"
    ],
    "price": 10.58,
    "price_inr": 899.0,
    "compareAtPrice": 1899.0,
    "rating": 4.9,
    "reviews": 128,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80",
    "images": [
      "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80"
    ],
    "gradient": "linear-gradient(135deg, #312e81, #1e1b4b)",
    "chapter": "CHAPTER-3",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "100% Certified Premium Quality",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Pan-India Express",
      "Cash on Delivery",
      "7-Day Replacement"
    ],
    "active": true
  },
  {
    "id": "rareember-heavyweight-canvas-tote-bag",
    "slug": "rareember-heavyweight-canvas-tote-bag",
    "emoji": "\ud83d\udc5c",
    "tag": "Eco Style",
    "tagColor": "#ffffff",
    "tagBg": "#059669",
    "title": "Rare Ember Heavyweight Canvas Everyday Tote Bag (400 GSM)",
    "short": "Reinforced 400 GSM natural cotton canvas with inner zipper pocket. Durable, sustainable everyday companion.",
    "story": "Built to carry laptops, books, groceries, and creative gear without fraying. 400 GSM heavy weave stands up to daily city life.",
    "details": [
      "400 GSM 100% Unbleached Heavy Cotton Canvas",
      "Inner Zipper Pocket for Keys, Cards & Phone",
      "Reinforced Cross-Stitched Shoulder Handles",
      "Holds Up to 15kg with Ease"
    ],
    "price": 5.28,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.8,
    "reviews": 51,
    "category": "fashion",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    "images": [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ],
    "gradient": "linear-gradient(135deg, #047857, #064e3b)",
    "chapter": "CHAPTER-3",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "100% Certified Premium Quality",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Pan-India Express",
      "Cash on Delivery",
      "7-Day Replacement"
    ],
    "active": true
  },
  {
    "id": "rareember-frosted-glass-sipper-bamboo-lid",
    "slug": "rareember-frosted-glass-sipper-bamboo-lid",
    "emoji": "\ud83c\udf75",
    "tag": "Aesthetic Pick",
    "tagColor": "#ffffff",
    "tagBg": "#d97706",
    "title": "Rare Ember Frosted Aesthetic Glass Sipper with Natural Bamboo Lid (450ml)",
    "short": "Borosilicate frosted glass can with reusable glass straw and leak-resistant silicone-sealed bamboo lid. Ideal for iced matchas & cold brews.",
    "story": "The cafe experience at home. Temperature-resistant borosilicate glass accommodates both boiling hot beverages and ice-filled drinks without thermal shock.",
    "details": [
      "450ml Heat & Freeze Resistant Borosilicate Glass",
      "Satin Translucent Frosted Finish with Subtle Ember Emblem",
      "Eco-Friendly Natural Bamboo Lid with Snug Silicone Seal",
      "Reusable Curved Clear Glass Straw Included"
    ],
    "price": 7.05,
    "price_inr": 599.0,
    "compareAtPrice": 1299.0,
    "rating": 4.9,
    "reviews": 89,
    "category": "home-garden",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    "images": [
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80"
    ],
    "gradient": "linear-gradient(135deg, #78350f, #451a03)",
    "chapter": "CHAPTER-2",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "100% Certified Premium Quality",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Pan-India Express",
      "Cash on Delivery",
      "7-Day Replacement"
    ],
    "active": true
  },
  {
    "id": "rareember-hardbound-minimalist-dot-journal",
    "slug": "rareember-hardbound-minimalist-dot-journal",
    "emoji": "\ud83d\udcd3",
    "tag": "Focus Tool",
    "tagColor": "#ffffff",
    "tagBg": "#0f766e",
    "title": "Rare Ember Minimalist Hardbound Dotted Journal / Notebook (A5)",
    "short": "160 GSM bleed-proof ivory paper with foil stamped ember emblem, ribbon bookmark, and elastic closure.",
    "story": "Designed for designers, builders, and thinkers. Thick 160 GSM pages ensure zero fountain pen or marker bleed-through.",
    "details": [
      "160 GSM Heavy Bleed-Proof Ivory Dotted Pages (192 Pages)",
      "Vegan Leather Hardbound Cover with Foil-Debossed Logo",
      "Lays Completely Flat 180\u00b0 for Effortless Writing",
      "Ribbon Page Marker & Expandable Back Document Pocket"
    ],
    "price": 4.69,
    "price_inr": 399.0,
    "compareAtPrice": 799.0,
    "rating": 4.8,
    "reviews": 41,
    "category": "general",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    "images": [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
    ],
    "gradient": "linear-gradient(135deg, #115e59, #134e4a)",
    "chapter": "CHAPTER-3",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "100% Certified Premium Quality",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Pan-India Express",
      "Cash on Delivery",
      "7-Day Replacement"
    ],
    "active": true
  }
];

export const PET_META: Record<string, any> = {
  dog: { emoji: '🐕', label: 'For Dogs', color: '#9a3412', bg: '#fff7ed' },
  cat: { emoji: '🐈', label: 'For Cats', color: '#831843', bg: '#fdf2f8' },
  both: { emoji: '🐾', label: 'For Pets', color: '#0f172a', bg: '#f1f5f9' }
};

export const bundles: Record<string, string[]> = {
  "rareember-oversized-streetwear-tee-obsidian": ["rareember-heavyweight-fleece-hoodie-onyx", "rareember-matte-black-ceramic-coffee-mug"],
  "rareember-heavyweight-fleece-hoodie-onyx": ["rareember-oversized-streetwear-tee-offwhite", "rareember-thermal-insulated-travel-tumbler-straw"],
  "rareember-matte-black-ceramic-coffee-mug": ["rareember-extended-desk-mat-gaming-mousepad", "rareember-hardbound-minimalist-dot-journal"],
  "rareember-thermal-insulated-travel-tumbler-straw": ["rareember-heavyweight-canvas-tote-bag", "rareember-oversized-streetwear-tee-obsidian"],
};

export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id || p.slug === id);
}
