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
  { id: 'fashion', label: 'Curated Streetwear', count: 4, hint: 'Style', emoji: '👕' },
  { id: 'home-garden', label: 'Drinkware & Living', count: 3, hint: 'Home', emoji: '☕' },
  { id: 'electronics', label: 'Desk & Creator Gear', count: 1, hint: 'Setup', emoji: '⚡' },
  { id: 'general', label: 'Lifestyle Drops', count: 2, hint: 'Essentials', emoji: '🔥' },
];

export const products: Product[] = [
  {
    id: 'rareember-oversized-streetwear-tee-obsidian',
    slug: 'rareember-oversized-streetwear-tee-obsidian',
    title: "Rare Ember Heavyweight Oversized Graphic Tee (240 GSM) \u2014 Obsidian Black",
    price: 10.58,
    price_inr: 899,
    old_price: 1799,
    compare_at_price: 21.16,
    category: 'fashion',
    emoji: '👕',
    tag: 'Best Seller',
    tagColor: '#FF4D24',
    tagBg: 'rgba(255, 77, 36, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 184,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "240 GSM French terry combed cotton with structured streetwear drape and drop shoulders.",
    story: "Engineered for creators and streetwear purists. Cut from dense 240 GSM bio-washed combed cotton with double-needle ribbed collar that never sags after washing.",
    details: [
      "240 GSM 100% Super-Combed Bio-Washed Cotton",
      "Pre-Shrunk Silicone Washed for Zero Shrinkage",
      "Signature Drop Shoulder Streetwear Fit",
      "Double-Stitched Lycra Ribbed Neckline",
      "Direct-to-Film (DTF) High-Density Print"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-oversized-streetwear-tee-offwhite',
    slug: 'rareember-oversized-streetwear-tee-offwhite',
    title: "Rare Ember Heavyweight Oversized Graphic Tee (240 GSM) \u2014 Vintage Off-White",
    price: 10.58,
    price_inr: 899,
    old_price: 1799,
    compare_at_price: 21.16,
    category: 'fashion',
    emoji: '👕',
    tag: 'Trending Drop',
    tagColor: '#0ea5e9',
    tagBg: 'rgba(14, 165, 233, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 142,
    image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Dense 240 GSM vintage off-white cotton with relaxed boxy drop-shoulder proportions.",
    story: "Vintage off-white raw aesthetic with subtle micro-slub texture. Manufactured in Tirupur from 100% long-staple combed cotton.",
    details: [
      "240 GSM 100% Super-Combed Bio-Washed Cotton",
      "Vintage Off-White Tone with Anti-Pilling Finish",
      "Signature Drop Shoulder Boxy Cut",
      "Double-Stitched Reinforced Hemline",
      "Breathable All-Season Cotton Fabric"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-heavyweight-fleece-hoodie-onyx',
    slug: 'rareember-heavyweight-fleece-hoodie-onyx',
    title: "Rare Ember Heavyweight Streetwear Hoodie (380 GSM Fleece) \u2014 Onyx Black",
    price: 19.99,
    price_inr: 1699,
    old_price: 3499,
    compare_at_price: 41.16,
    category: 'fashion',
    emoji: '🧥',
    tag: 'Signature Drop',
    tagColor: '#8b5cf6',
    tagBg: 'rgba(139, 92, 246, 0.12)',
    stock: 500,
    rating: 5.0,
    reviews: 218,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Dense 380 GSM brushed fleece with double-layer hood and structured kangaroo pouch.",
    story: "Our flagship winter piece. Heavyweight 380 GSM brushed interior fleece keeps you cozy while maintaining a crisp, architectural silhouette.",
    details: [
      "380 GSM Ultra-Heavy Brushed Terry Fleece",
      "Double-Layer Structured Hood without Sag",
      "Heavy Ribbed Cuffs and Hem for Superior Retention",
      "Spacious Reinforced Kangaroo Pocket",
      "Pre-Washed for Zero Shrinkage and Colorfastness"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-essential-crewneck-sweatshirt-heather',
    slug: 'rareember-essential-crewneck-sweatshirt-heather',
    title: "Rare Ember Minimalist Essential Crewneck Sweatshirt (320 GSM) \u2014 Heather Charcoal",
    price: 16.46,
    price_inr: 1399,
    old_price: 2799,
    compare_at_price: 32.93,
    category: 'fashion',
    emoji: '🧶',
    tag: 'Limited Edition',
    tagColor: '#10b981',
    tagBg: 'rgba(16, 185, 129, 0.12)',
    stock: 500,
    rating: 4.8,
    reviews: 96,
    image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "320 GSM French terry fleece with ergonomic raglan shoulders and tailored ribbing.",
    story: "Minimalist creator luxury. Pure 320 GSM cotton-poly terry blend offering high-tier thermal insulation with zero bulk.",
    details: [
      "320 GSM Combed French Terry Cotton",
      "Anti-Lint Brush Exterior Treatment",
      "Ribbed Collar, Cuffs and Waistband with 5% Spandex",
      "Relaxed Everyday Modern Tailoring"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-acid-wash-vintage-oversized-tee',
    slug: 'rareember-acid-wash-vintage-oversized-tee',
    title: "Rare Ember Vintage Acid-Wash Oversized Tee (240 GSM) \u2014 Mineral Grey",
    price: 11.75,
    price_inr: 999,
    old_price: 1999,
    compare_at_price: 23.52,
    category: 'fashion',
    emoji: '👕',
    tag: 'Vintage Wash',
    tagColor: '#f59e0b',
    tagBg: 'rgba(245, 158, 11, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 112,
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Hand-treated mineral acid wash on 240 GSM French terry with distressed hems.",
    story: "Each tee features an individualized stone-wash mineral pattern. Dense fabric weight with an ultra-soft broken-in vintage feel.",
    details: [
      "240 GSM Heavyweight Mineral Washed Cotton",
      "Unique Distressed Acid Wash Gradient on Every Piece",
      "Reinforced Shoulder-to-Shoulder Neck Taping",
      "Oversized Streetwear Proportions"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-supima-luxury-minimalist-tee',
    slug: 'rareember-supima-luxury-minimalist-tee',
    title: "Rare Ember 100% Supima Cotton Crewneck Tee (190 GSM) \u2014 Pitch Black",
    price: 11.16,
    price_inr: 949,
    old_price: 1899,
    compare_at_price: 22.34,
    category: 'fashion',
    emoji: '🖤',
    tag: 'Supima Luxury',
    tagColor: '#6366f1',
    tagBg: 'rgba(99, 102, 241, 0.12)',
    stock: 500,
    rating: 5.0,
    reviews: 89,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Extra-long staple American Supima cotton with silk-like sheen and breathability.",
    story: "The pinnacle of everyday basics. 100% Supima certified cotton delivers unmatched softness, twice the fiber strength of regular cotton, and deep jet-black luster.",
    details: [
      "100% Certified Long-Staple Supima Cotton",
      "190 GSM Featherlight Luxury Weight",
      "Ultra-Smooth Silk Luster Finish",
      "Tailored Classic Regular Fit"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-heavyweight-zip-up-hoodie-bone',
    slug: 'rareember-heavyweight-zip-up-hoodie-bone',
    title: "Rare Ember Heavyweight Full-Zip Streetwear Hoodie (380 GSM) \u2014 Bone White",
    price: 21.16,
    price_inr: 1799,
    old_price: 3599,
    compare_at_price: 42.34,
    category: 'fashion',
    emoji: '🧥',
    tag: 'Heavyweight',
    tagColor: '#ec4899',
    tagBg: 'rgba(236, 72, 153, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 164,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "380 GSM bone white fleece with matte gunmetal YKK-style two-way zipper.",
    story: "A versatile layering powerhouse. Built with thick 380 GSM fleece, heavy custom metal puller, and clean split kangaroo pockets.",
    details: [
      "380 GSM Premium Thermal Terry Fleece",
      "Heavy-Duty Metal Zipper with Smooth Glide",
      "Double-Stitched Ribbed Side Panels for Mobility",
      "Deep Double-Layered Thermal Hood"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-streetwear-heavyweight-cargo-joggers',
    slug: 'rareember-streetwear-heavyweight-cargo-joggers',
    title: "Rare Ember Streetwear Heavyweight Terry Joggers (320 GSM) \u2014 Washed Charcoal",
    price: 17.64,
    price_inr: 1499,
    old_price: 2999,
    compare_at_price: 35.28,
    category: 'fashion',
    emoji: '👖',
    tag: 'Streetwear',
    tagColor: '#14b8a6',
    tagBg: 'rgba(20, 184, 166, 0.12)',
    stock: 500,
    rating: 4.8,
    reviews: 78,
    image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "320 GSM cotton fleece joggers with tapered cuffs, deep zip pockets, and thick drawstring.",
    story: "Designed for all-day creator comfort with street-ready tailoring. Features deep zippered phone pockets so essentials stay secure.",
    details: [
      "320 GSM 100% Combed Terry Cotton",
      "Dual Zippered Concealed Security Pockets",
      "Custom Metal Aglet Drawstrings with Elastic Waist",
      "Ergonomic Ankle Cuffs for Sneaker Stacking"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-premium-matty-polo-tshirt',
    slug: 'rareember-premium-matty-polo-tshirt',
    title: "Rare Ember Structured Matty Cotton Polo T-Shirt (220 GSM) \u2014 Deep Navy",
    price: 10.58,
    price_inr: 899,
    old_price: 1799,
    compare_at_price: 21.16,
    category: 'fashion',
    emoji: '👔',
    tag: 'Smart Casual',
    tagColor: '#3b82f6',
    tagBg: 'rgba(59, 130, 246, 0.12)',
    stock: 500,
    rating: 4.8,
    reviews: 65,
    image_url: 'https://images.unsplash.com/photo-1625910513413-7a918a38b603?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "220 GSM breathable honeycomb matty knit with crisp ribbed collar and wood-finish buttons.",
    story: "Classic polo elevated for creators. Engineered with high-durability honeycomb cotton knit that breathes easily in warm climates.",
    details: [
      "220 GSM 100% Cotton Honeycomb Matty Fabric",
      "Anti-Curl Collar Technology",
      "Reinforced Placket with Premium Buttons",
      "Side Slits for Unrestricted Movement"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-sleeveless-athletic-tank-top',
    slug: 'rareember-sleeveless-athletic-tank-top',
    title: "Rare Ember Raw-Cut Streetwear Drop-Arm Tank Top (180 GSM) \u2014 Jet Black",
    price: 7.64,
    price_inr: 649,
    old_price: 1299,
    compare_at_price: 15.28,
    category: 'fashion',
    emoji: '🎽',
    tag: 'Gym & Athleisure',
    tagColor: '#ef4444',
    tagBg: 'rgba(239, 68, 68, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 54,
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "180 GSM bio-washed cotton tank with dropped armholes for gym workouts and warm days.",
    story: "Engineered for maximum range of motion. Deep drop-armholes and curved bottom hem give this tank an authentic bodybuilding and streetwear edge.",
    details: [
      "180 GSM 100% Combed Bio-Washed Cotton",
      "Extended Drop Armholes for Free Range of Motion",
      "Scoop Neck with Anti-Chafe Seaming",
      "Curved Droptail Hem for Back Coverage"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-womens-cropped-fleece-hoodie',
    slug: 'rareember-womens-cropped-fleece-hoodie',
    title: "Rare Ember Women's Boxy Cropped Fleece Hoodie (320 GSM) \u2014 Mocha Brown",
    price: 16.46,
    price_inr: 1399,
    old_price: 2799,
    compare_at_price: 32.93,
    category: 'fashion',
    emoji: '✨',
    tag: "Women's Drop",
    tagColor: '#d946ef',
    tagBg: 'rgba(217, 70, 239, 0.12)',
    stock: 500,
    rating: 5.0,
    reviews: 128,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "320 GSM soft fleece cropped hoodie with raw-edge hem and roomy balloon sleeves.",
    story: "Chic, comfortable, and effortlessly stylish. Tailored with a boxy crop cut that sits naturally at the waist.",
    details: [
      "320 GSM Brushed Cotton-Poly Fleece",
      "On-Trend Boxy Crop Silhouette",
      "Raw-Edge Bottom Hem with Stay-Stitch",
      "Oversized Hood with Color-Matched Cords"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-womens-boxy-heavyweight-crop-tee',
    slug: 'rareember-womens-boxy-heavyweight-crop-tee',
    title: "Rare Ember Women's Heavyweight Boxy Crop Tee (200 GSM) \u2014 Crisp White",
    price: 8.22,
    price_inr: 699,
    old_price: 1399,
    compare_at_price: 16.46,
    category: 'fashion',
    emoji: '🤍',
    tag: 'Clean Essential',
    tagColor: '#8b5cf6',
    tagBg: 'rgba(139, 92, 246, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 92,
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "200 GSM combed cotton crop tee with wide sleeves and clean minimal aesthetic.",
    story: "The ultimate everyday crop tee. Dense enough to never be sheer, yet light and breathable for Indian summers.",
    details: [
      "200 GSM 100% Combed Bio-Washed Cotton",
      "Non-Sheer Opaque Dense Weave",
      "Boxy Drop-Shoulder Relaxed Proportions",
      "Pre-Shrunk Treated for Long-Lasting Shape"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-matte-black-ceramic-coffee-mug',
    slug: 'rareember-matte-black-ceramic-coffee-mug',
    title: "Rare Ember Artisan Matte Black Ceramic Coffee Mug (350ml)",
    price: 5.87,
    price_inr: 499,
    old_price: 999,
    compare_at_price: 11.75,
    category: 'home-garden',
    emoji: '☕',
    tag: 'Artisan Craft',
    tagColor: '#f59e0b',
    tagBg: 'rgba(245, 158, 11, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 142,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Hand-glazed matte ceramic with ergonomic wide handle and 350ml morning brew capacity.",
    story: "Elevate your morning coffee ritual. Kiln-fired at 1280\u00b0C for exceptional thermal retention and durability.",
    details: [
      "High-Density Kiln-Fired Ceramic (350ml)",
      "Scratch-Resistant Matte Charcoal Exterior",
      "Microwave & Dishwasher Safe Non-Toxic Glaze",
      "Ergonomic 3-Finger Balanced Comfort Handle"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-thermal-insulated-travel-tumbler-straw',
    slug: 'rareember-thermal-insulated-travel-tumbler-straw',
    title: "Rare Ember Double-Wall Insulated Steel Travel Tumbler with Straw (500ml)",
    price: 9.4,
    price_inr: 799,
    old_price: 1599,
    compare_at_price: 18.81,
    category: 'home-garden',
    emoji: '🥤',
    tag: 'Hot & Cold',
    tagColor: '#06b6d4',
    tagBg: 'rgba(6, 182, 212, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 115,
    image_url: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Vacuum-insulated 304 stainless steel tumbler keeping drinks cold for 18h and hot for 8h.",
    story: "Built for long creative sessions and commutes. Double-wall copper vacuum insulation prevents exterior sweat completely.",
    details: [
      "Double-Wall 304 Food-Grade Stainless Steel",
      "18 Hours Cold / 8 Hours Hot Thermal Lock",
      "Spill-Resistant Lid with Reusable Steel Straw",
      "Sweat-Proof Matte Powder-Coated Grip"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-frosted-glass-sipper-bamboo-lid',
    slug: 'rareember-frosted-glass-sipper-bamboo-lid',
    title: "Rare Ember Frosted Aesthetic Glass Sipper with Natural Bamboo Lid (450ml)",
    price: 7.05,
    price_inr: 599,
    old_price: 1199,
    compare_at_price: 14.11,
    category: 'home-garden',
    emoji: '🧋',
    tag: 'Creator Aesthetic',
    tagColor: '#10b981',
    tagBg: 'rgba(16, 185, 129, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 84,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Frosted borosilicate glass can tumbler with genuine bamboo lid and clear glass straw.",
    story: "The viral iced coffee favorite. Crafted from thermal shock resistant borosilicate glass with airtight silicone-sealed bamboo lid.",
    details: [
      "Thermal Shock Proof Borosilicate Frosted Glass",
      "100% Natural Sustainable Bamboo Lid with Gasket",
      "Reusable Borosilicate Glass Straw Included",
      "Ideal for Iced Coffee, Matcha, Boba & Juices"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-magic-thermochromic-ceramic-mug',
    slug: 'rareember-magic-thermochromic-ceramic-mug',
    title: "Rare Ember Color-Changing Thermo Magic Ceramic Mug (350ml) \u2014 Matte Midnight",
    price: 7.05,
    price_inr: 599,
    old_price: 1199,
    compare_at_price: 14.11,
    category: 'home-garden',
    emoji: '🔮',
    tag: 'Thermo Magic',
    tagColor: '#6366f1',
    tagBg: 'rgba(99, 102, 241, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 98,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Heat-sensitive pigment reveals bespoke Rare Ember typography when hot liquid is poured.",
    story: "Watch the design magically come to life. Solid black when cold, transforming into glowing artwork with your morning coffee.",
    details: [
      "Thermochromic Heat-Activated Ceramic Surface",
      "High-Grade Sublimation Print Technology",
      "Comfort Curved Handle with Balanced Counterweight",
      "350ml Generous Capacity"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-stainless-sports-insulated-flask',
    slug: 'rareember-stainless-sports-insulated-flask',
    title: "Rare Ember Wide-Mouth Stainless Steel Sports Flask (750ml) \u2014 Matte Sage",
    price: 10.58,
    price_inr: 899,
    old_price: 1799,
    compare_at_price: 21.16,
    category: 'home-garden',
    emoji: '💧',
    tag: 'Active Life',
    tagColor: '#10b981',
    tagBg: 'rgba(16, 185, 129, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 76,
    image_url: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "750ml leakproof insulated flask with sports loop cap and wide-mouth ice opening.",
    story: "Hydration built for gym, hikes, and all-day hustle. Double-wall insulated stainless steel guarantees 24-hour ice-cold water.",
    details: [
      "750ml High-Capacity Pro Flask",
      "18/8 Pro-Grade Stainless Steel Construction",
      "Honeycomb Insulated Cap with Flex Grip Strap",
      "BPA-Free, Phthalate-Free & Toxin-Free"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-extended-desk-mat-gaming-mousepad',
    slug: 'rareember-extended-desk-mat-gaming-mousepad',
    title: "Rare Ember Extended Desk Mat & Creator Mousepad (900\u00d7400mm, 4mm)",
    price: 10.58,
    price_inr: 899,
    old_price: 1799,
    compare_at_price: 21.16,
    category: 'electronics',
    emoji: '🖥️',
    tag: 'Desk Setup',
    tagColor: '#3b82f6',
    tagBg: 'rgba(59, 130, 246, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 167,
    image_url: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Ultra-smooth high-density microfiber with anti-fray precision stitching and natural rubber grip.",
    story: "The centerpiece of your workstation. 900\u00d7400mm extended surface accommodates full mechanical keyboard, mouse, and workspace gear.",
    details: [
      "Extra-Large 900\u00d7400mm Coverage (4mm Plush Thickness)",
      "Precision Micro-Woven Textile for Flawless Mouse Tracking",
      "360\u00b0 Anti-Fray Seamless Precision Edge Stitching",
      "Textured Non-Slip Natural Vulcanized Rubber Base"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-compact-microfiber-desk-mousepad',
    slug: 'rareember-compact-microfiber-desk-mousepad',
    title: "Rare Ember Precision Microfiber Compact Desk Mousepad (240\u00d7200mm) \u2014 Minimal Monolith",
    price: 4.69,
    price_inr: 399,
    old_price: 799,
    compare_at_price: 9.4,
    category: 'electronics',
    emoji: '🖱️',
    tag: 'Essential Gear',
    tagColor: '#6366f1',
    tagBg: 'rgba(99, 102, 241, 0.12)',
    stock: 500,
    rating: 4.8,
    reviews: 62,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Portable 240\u00d7200mm high-speed microfiber mousepad with non-slip rubber backing.",
    story: "Perfect for minimal laptop desks and cafe work. Features spill-resistant coating and micro-weave glide surface.",
    details: [
      "Compact 240\u00d7200mm Travel & Cafe Friendly Footprint",
      "Spill-Resistant Water-Repellent Surface Coating",
      "Zero-Slip Textured Rubber Bottom Base",
      "Optimized for Optical & Laser Gaming Sensors"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-shockproof-matte-iphone-case',
    slug: 'rareember-shockproof-matte-iphone-case',
    title: "Rare Ember Minimalist Shockproof Impact Phone Case \u2014 Frosted Smoke",
    price: 6.46,
    price_inr: 549,
    old_price: 1099,
    compare_at_price: 12.93,
    category: 'electronics',
    emoji: '📱',
    tag: 'Impact Shield',
    tagColor: '#ec4899',
    tagBg: 'rgba(236, 72, 153, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 110,
    image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Military-grade drop-tested hybrid case with raised camera bezel and anti-fingerprint matte back.",
    story: "Sleek protection without bulk. Shock-absorbing TPU bumpers pair with rigid scratch-resistant polycarbonate backplate.",
    details: [
      "Certified 6.6ft Military Drop-Test Protection",
      "1.2mm Raised Screen Edge & Camera Ring Lip",
      "Oleophobic Anti-Fingerprint Matte Touch",
      "Wireless Charging & MagSafe Compatible"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-padded-creator-laptop-sleeve',
    slug: 'rareember-padded-creator-laptop-sleeve',
    title: "Rare Ember Neoprene Padded Creator Laptop Sleeve (13-15 Inch) \u2014 Stealth Slate",
    price: 9.4,
    price_inr: 799,
    old_price: 1599,
    compare_at_price: 18.81,
    category: 'electronics',
    emoji: '💻',
    tag: 'Creator Armor',
    tagColor: '#14b8a6',
    tagBg: 'rgba(20, 184, 166, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 88,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Thick foam padding with plush faux-fur interior lining and waterproof dual zipper.",
    story: "Shield your Mac or PC laptop from everyday bumps and scratches. Streamlined profile slips easily into backpacks.",
    details: [
      "Multi-Layer Shockproof Foam Cushioning",
      "Scratch-Free Faux-Fur Plush Interior",
      "Water-Resistant High-Density Exterior Fabric",
      "Smooth Dual Metal Top-Loading Zippers"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-heavyweight-canvas-tote-bag',
    slug: 'rareember-heavyweight-canvas-tote-bag',
    title: "Rare Ember Heavyweight Canvas Everyday Tote Bag (400 GSM)",
    price: 5.28,
    price_inr: 449,
    old_price: 999,
    compare_at_price: 11.75,
    category: 'general',
    emoji: '👜',
    tag: 'Eco Style',
    tagColor: '#10b981',
    tagBg: 'rgba(16, 185, 129, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 134,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Dense 400 GSM natural organic cotton canvas with reinforced box-stitched shoulder handles.",
    story: "Built to carry laptops, cameras, groceries, and daily essentials with effortless minimal style.",
    details: [
      "400 GSM 100% Unbleached Heavy Cotton Canvas",
      "Reinforced Cross-Box Stitched Handles for 15kg Load",
      "Spacious Main Compartment with Inner Zipper Pocket",
      "100% Biodegradable & Plastic-Free"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-hardbound-minimalist-dot-journal',
    slug: 'rareember-hardbound-minimalist-dot-journal',
    title: "Rare Ember Minimalist Hardbound Dotted Journal / Notebook (A5)",
    price: 4.69,
    price_inr: 399,
    old_price: 799,
    compare_at_price: 9.4,
    category: 'general',
    emoji: '📓',
    tag: 'Productivity',
    tagColor: '#8b5cf6',
    tagBg: 'rgba(139, 92, 246, 0.12)',
    stock: 500,
    rating: 4.8,
    reviews: 89,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "120 GSM bleed-resistant ivory dot-grid paper with vegan leather hardcover and lay-flat binding.",
    story: "The ideation engine for creators and builders. Lay-flat 180\u00b0 binding ensures comfortable writing with zero ink bleed.",
    details: [
      "192 Pages of 120 GSM Acid-Free Bleedproof Ivory Paper",
      "5mm Minimalist Dot-Grid Matrix",
      "Thread-Bound Lay-Flat 180\u00b0 Binding",
      "Elastic Closure Band & Silk Ribbon Bookmark"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-wooden-framed-streetwear-art-poster',
    slug: 'rareember-wooden-framed-streetwear-art-poster',
    title: "Rare Ember Gallery-Grade Framed Streetwear Art Poster (A3 Solid Wood Frame) \u2014 'Tokyo Nocturne'",
    price: 11.75,
    price_inr: 999,
    old_price: 1999,
    compare_at_price: 23.52,
    category: 'general',
    emoji: '🖼️',
    tag: 'Wall Art',
    tagColor: '#f59e0b',
    tagBg: 'rgba(245, 158, 11, 0.12)',
    stock: 500,
    rating: 4.9,
    reviews: 68,
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "300 GSM matte art print in natural wooden frame with shatterproof acrylic glass front.",
    story: "Transform your creative studio or room. Printed on museum-grade heavyweight matte paper with fade-resistant archival pigment inks.",
    details: [
      "A3 Standard Size (297\u00d7420mm) Museum Art Print",
      "300 GSM Heavyweight Acid-Free Archival Paper",
      "Solid Natural Wood Frame with Pre-Installed Wall Mount",
      "Shatter-Resistant Optical-Grade Acrylic Glass"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
  },
  {
    id: 'rareember-waterproof-vinyl-sticker-pack',
    slug: 'rareember-waterproof-vinyl-sticker-pack',
    title: "Rare Ember Die-Cut Waterproof Vinyl Creator Sticker Pack (Set of 10)",
    price: 3.52,
    price_inr: 299,
    old_price: 599,
    compare_at_price: 7.05,
    category: 'general',
    emoji: '✨',
    tag: 'Best Add-On',
    tagColor: '#ec4899',
    tagBg: 'rgba(236, 72, 153, 0.12)',
    stock: 500,
    rating: 5.0,
    reviews: 145,
    image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1000&q=80',
    supplier: 'qikink',
    short: "Set of 10 matte-laminated die-cut vinyl stickers for laptops, journals, and bottles.",
    story: "Deck out your laptop and gear. Printed on ultra-thick 6 mil vinyl with UV and scratch-resistant matte laminate that resists dishwasher heat.",
    details: [
      "Set of 10 Unique Bespoke Creator & Streetwear Decals",
      "100% Waterproof, Weatherproof & Sun-Resistant Vinyl",
      "Removable Adhesive with Zero Sticky Residue",
      "Matte Soft-Touch Protective Top Laminate"
],
    gradient: 'linear-gradient(135deg, #18181b, #09090b)',
    active: true,
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
