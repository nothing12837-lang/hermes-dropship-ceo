export type ProductCategory = 'general' | 'electronics' | 'fashion' | 'home-garden' | 'home-living' | 'pets' | 'beds' | 'toys' | 'tech' | 'decor';
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
  
  // Normalize prices to the same currency (INR)
  const actualPriceInr = priceInr && priceInr > 0 
    ? priceInr 
    : (rawPrice >= 80 ? rawPrice : Math.round(rawPrice * USD_TO_INR_RATE));
    
  const actualCompareInr = rawCompare >= 80 
    ? rawCompare 
    : Math.round(rawCompare * USD_TO_INR_RATE);

  if (actualCompareInr <= actualPriceInr) return undefined;
  
  const pct = Math.round((1 - actualPriceInr / actualCompareInr) * 100);
  // Ensure sanity: never show ridiculous 90%+ discounts caused by currency mismatch
  if (pct < 5 || pct > 80) return undefined;
  return pct;
}

export const SHOP_CATEGORIES = [
  { id: 'electronics', label: 'Electronics & Tech', count: 24, hint: 'Tech', emoji: '⚡' },
  { id: 'home-garden', label: 'Home & Living', count: 65, hint: 'Home', emoji: '🪴' },
  { id: 'fashion', label: 'Curated Fashion', count: 14, hint: 'Style', emoji: '👕' },
  { id: 'general', label: 'Viral & Lifestyle', count: 103, hint: 'Trends', emoji: '🔥' },
];

export const products: Product[] = [
  {
    "id": "meesho-10in1-electronic-cleaner-kit-keyboard-earbuds",
    "slug": "meesho-10in1-electronic-cleaner-kit-keyboard-earbuds",
    "emoji": "🎧",
    "tag": "Viral Utility",
    "tagColor": "#3b82f6",
    "tagBg": "rgba(59,130,246,0.12)",
    "title": "10-in-1 Multi-Tool Electronic Cleaning Kit for Earbuds, Phone & Keyboard",
    "short": "All-in-one 10-piece electronics cleaner kit with spray, keyboard brush and earbud cleaning pen.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.8,
    "reviews": 3450,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/609133396/ujs4q_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/609133396/ujs4q_512.jpg",
      "https://images.meesho.com/images/products/609133396/cuyiv_512.jpg",
      "https://images.meesho.com/images/products/609133396/advra_512.jpg",
      "https://images.meesho.com/images/products/609133396/07ptk_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "ELECTRONICS",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-360-rotating-makeup-cosmetic-organizer-acrylic",
    "slug": "meesho-360-rotating-makeup-cosmetic-organizer-acrylic",
    "emoji": "💄",
    "tag": "Vanity Essential",
    "tagColor": "#ec4899",
    "tagBg": "rgba(236,72,153,0.12)",
    "title": "360° Rotating Acrylic Cosmetic & Makeup Carousel Organizer",
    "short": "Large capacity 360° rotating diamond-cut acrylic vanity cosmetic and skincare organizer.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 599.0,
    "price_inr": 599.0,
    "compareAtPrice": 1399.0,
    "rating": 4.8,
    "reviews": 2890,
    "category": "fashion",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/239049045/hx7yx_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/239049045/hx7yx_512.jpg",
      "https://images.meesho.com/images/products/239049045/cpwii_512.jpg",
      "https://images.meesho.com/images/products/239049045/uedwl_512.jpg",
      "https://images.meesho.com/images/products/239049045/6vof0_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "FASHION",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-360-rotating-spice-rack-turntable-lazy-susan",
    "slug": "meesho-360-rotating-spice-rack-turntable-lazy-susan",
    "emoji": "🔄",
    "tag": "Space Saver",
    "tagColor": "#14b8a6",
    "tagBg": "rgba(20,184,166,0.12)",
    "title": "360° Rotating Turntable Spice Rack Organizer for Kitchen & Fridge",
    "short": "Smooth 360° rotating turntable organizer tray for kitchen cabinets, pantry, and fridge.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1099.0,
    "rating": 4.7,
    "reviews": 1670,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/681447111/bwzxw_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/681447111/bwzxw_512.jpg",
      "https://images.meesho.com/images/products/681447111/kujc8_512.jpg",
      "https://images.meesho.com/images/products/681447111/ctjts_512.jpg",
      "https://images.meesho.com/images/products/681447111/d5mvi_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "HOME-LIVING",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-3in1-foldable-magnetic-wireless-charging-pad",
    "slug": "meesho-3in1-foldable-magnetic-wireless-charging-pad",
    "emoji": "⚡",
    "tag": "Fast Charging",
    "tagColor": "#2563eb",
    "tagBg": "rgba(37,99,235,0.1)",
    "title": "3-in-1 Foldable Magnetic Fast Wireless Charging Pad",
    "short": "Pocket-sized foldable charging station that fast-charges your Phone, Smartwatch, and Earbuds simultaneously.",
    "story": "Eliminate tangled bedside cords forever. Folds flat into a pocket square for effortless travel.",
    "details": [
      "Simultaneous 3-device 15W charging",
      "Strong magnetic alignment",
      "Foldable 180° travel design",
      "Universal Qi compatibility"
    ],
    "price": 799.0,
    "price_inr": 799.0,
    "compareAtPrice": 1699.0,
    "rating": 4.8,
    "reviews": 620,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/614873040/qmb1a_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/614873040/qmb1a_512.jpg",
      "https://images.meesho.com/images/products/614873040/udpwg_512.jpg",
      "https://images.meesho.com/images/products/614873040/fww1j_512.jpg",
      "https://images.meesho.com/images/products/614873040/nsq0j_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #eff6ff, #dbeafe)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Zero wire clutter",
      "180° Foldable pocket travel"
    ],
    "safety": "Overheat & surge protection",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Top Tech",
      "Pan-India COD"
    ],
    "active": true
  },
  {
    "id": "meesho-4-layer-rotating-jewelry-storage-box-mirror",
    "slug": "meesho-4-layer-rotating-jewelry-storage-box-mirror",
    "emoji": "💍",
    "tag": "360 Rotating",
    "tagColor": "#db2777",
    "tagBg": "rgba(219,39,119,0.1)",
    "title": "360° Rotating 4-Layer Jewelry Storage Tower with Vanity Mirror Lid",
    "short": "Space-saving cylindrical tower that smoothly spins out 4 separate trays for rings, earrings, and trinkets.",
    "story": "Compact dressing table organizer with built-in high-definition mirror inside the top lid.",
    "details": [
      "360-degree smooth swivel mechanism",
      "4 layered felt-lined compartments",
      "Integrated HD vanity mirror",
      "Dust-proof compact footprint"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.8,
    "reviews": 930,
    "category": "fashion",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/775000307/ogeoi_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/775000307/ogeoi_512.jpg",
      "https://images.meesho.com/images/products/775000307/3fktz_512.jpg",
      "https://images.meesho.com/images/products/775000307/9xu5y_512.jpg",
      "https://images.meesho.com/images/products/775000307/f83r3_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fdf2f8, #fce7f3)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Zero clutter jewelry tower",
      "Built-in vanity mirror lid"
    ],
    "safety": "Shatter-proof ABS plastic",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Vanity Essential",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-4in1-handheld-electric-vegetable-cutter-set",
    "slug": "meesho-4in1-handheld-electric-vegetable-cutter-set",
    "emoji": "🥒",
    "tag": "Viral Gadget",
    "tagColor": "#10b981",
    "tagBg": "rgba(16,185,129,0.12)",
    "title": "4-in-1 Handheld Electric Vegetable Cutter & Meat Grinder Set",
    "short": "Multi-function 4-in-1 handheld electric cutter with direct slicer port and cleaning brush.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 599.0,
    "price_inr": 599.0,
    "compareAtPrice": 1399.0,
    "rating": 4.6,
    "reviews": 2240,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/527716065/erpia_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/527716065/erpia_512.jpg",
      "https://images.meesho.com/images/products/527716065/vtjxs_512.jpg",
      "https://images.meesho.com/images/products/527716065/tq811_512.jpg",
      "https://images.meesho.com/images/products/527716065/5js3e_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "HOME-LIVING",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-8in1-type-c-hub-hdmi-sd-card-usb3",
    "slug": "meesho-8in1-type-c-hub-hdmi-sd-card-usb3",
    "emoji": "🔌",
    "tag": "Power User",
    "tagColor": "#3b82f6",
    "tagBg": "rgba(59,130,246,0.12)",
    "title": "8-in-1 Aluminum USB-C Hub Adapter with 4K HDMI, SD Reader & 100W PD",
    "short": "Compact 8-in-1 machined aluminum USB-C multiport adapter hub with 4K HDMI and 100W PD.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 899.0,
    "price_inr": 899.0,
    "compareAtPrice": 2199.0,
    "rating": 4.8,
    "reviews": 1950,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/1015542681/5pias_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1015542681/5pias_512.jpg",
      "https://images.meesho.com/images/products/1015542681/qfeag_512.jpg",
      "https://images.meesho.com/images/products/1015542681/wpw6a_512.jpg",
      "https://images.meesho.com/images/products/542736092/cgqgt_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-acrylic-led-glow-message-note-board",
    "slug": "meesho-acrylic-led-glow-message-note-board",
    "emoji": "📝",
    "tag": "Trending",
    "tagColor": "#f59e0b",
    "tagBg": "rgba(245,158,11,0.12)",
    "title": "Acrylic LED Glow Message Note Board with Erasable Pen (Warm Night Lamp)",
    "short": "Glowing warm LED acrylic message board for to-do notes, quotes, and ambient bedside lighting.",
    "story": "Write daily affirmations, to-do lists, or sweet festive messages that glow radiantly at night.",
    "details": [
      "Crystal transparent acrylic panel",
      "Warm glowing wooden LED stand",
      "Includes erasable pen & cloth",
      "USB plug-and-play"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1199.0,
    "rating": 4.8,
    "reviews": 2100,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/596541532/x9tqj_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/596541532/x9tqj_512.jpg",
      "https://images.meesho.com/images/products/596541532/9h1y7_512.jpg",
      "https://images.meesho.com/images/products/596541532/5sypb_512.jpg",
      "https://images.meesho.com/images/products/596541532/x9tqj_1024.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fefce8, #fef08a)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Rewritable daily planner",
      "Warm ambient bedroom light"
    ],
    "safety": "Shatter-resistant acrylic",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Hot Trend",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-adhesive-bathroom-corner-shower-caddy-2pk",
    "slug": "meesho-adhesive-bathroom-corner-shower-caddy-2pk",
    "emoji": "🚿",
    "tag": "Spa Bathroom",
    "tagColor": "#1e293b",
    "tagBg": "rgba(30,41,59,0.12)",
    "title": "Rustproof Matte Black Stainless Steel Bathroom Corner Shelf (Pack of 2)",
    "short": "Pack of 2 matte black rustproof corner shower organizer racks with no-drill adhesive pads.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1199.0,
    "rating": 4.8,
    "reviews": 3410,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/719201159/owu7i_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/719201159/owu7i_512.jpg",
      "https://images.meesho.com/images/products/719201159/hukkb_512.jpg",
      "https://images.meesho.com/images/products/719201159/grtiy_512.jpg",
      "https://images.meesho.com/images/products/719201159/wpmdy_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-anti-blue-light-blocking-computer-glasses",
    "slug": "meesho-anti-blue-light-blocking-computer-glasses",
    "emoji": "👓",
    "tag": "Digital Wellness",
    "tagColor": "#0284c7",
    "tagBg": "rgba(2,132,199,0.12)",
    "title": "Retro Matte Acetate Anti-Blue Light Blocking Eyeglasses (Zero Power)",
    "short": "Lightweight stylish anti-blue light computer glasses for fatigue-free screen work.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.7,
    "reviews": 3840,
    "category": "fashion",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/613749826/dk2bi_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/613749826/dk2bi_512.jpg",
      "https://images.meesho.com/images/products/613749826/2nsxv_512.jpg",
      "https://images.meesho.com/images/products/613749826/9vz7j_512.jpg",
      "https://images.meesho.com/images/products/613749826/wkpxx_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-astronaut-magnetic-cable-organizer-desk-clips",
    "slug": "meesho-astronaut-magnetic-cable-organizer-desk-clips",
    "emoji": "🧑‍🚀",
    "tag": "Desk Aesthetic",
    "tagColor": "#6366f1",
    "tagBg": "rgba(99,102,241,0.1)",
    "title": "Astronaut Magnetic Cable Organizer Clips (Pack of 3 Desk Wire Management)",
    "short": "Cute astronaut figures with strong magnetic clamps to keep charging cords neat and ready on your workstation.",
    "story": "No more dropped charging wires behind your desk or bedside table. Strong 3M adhesive base stays firm.",
    "details": [
      "Pack of 3 cute astronaut magnetic clips",
      "Strong neodymium magnetic clamping",
      "Damage-free 3M acrylic base tape",
      "Universal fit for all mobile & laptop wires"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 599.0,
    "rating": 4.9,
    "reviews": 610,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/543109748/h4xcn_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/543109748/h4xcn_512.jpg",
      "https://images.meesho.com/images/products/543109748/rouwo_512.jpg",
      "https://images.meesho.com/images/products/543109748/wp0o0_512.jpg",
      "https://images.meesho.com/images/products/543109748/3z4yu_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Zero wire drops behind desk",
      "Cute aesthetic desk companion"
    ],
    "safety": "Smooth non-scratch silicone",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Desk Aesthetic",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-automatic-magnetic-self-stirring-mug",
    "slug": "meesho-automatic-magnetic-self-stirring-mug",
    "emoji": "☕",
    "tag": "Office Favorite",
    "tagColor": "#78350f",
    "tagBg": "rgba(120,53,15,0.12)",
    "title": "Automatic Magnetic Self-Stirring Coffee & Chai Mug (380ml USB)",
    "short": "One-touch magnetic self-stirring stainless steel thermal mug for coffee, chai & shakes.",
    "story": "Say goodbye to spoons and messy clumpy drinks. Double-wall insulated food grade 304 stainless steel.",
    "details": [
      "Detachable magnetic capsule rotor",
      "Double-wall vacuum thermal insulation",
      "380ml capacity with leakproof lid",
      "Food-grade 304 steel inside"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1199.0,
    "rating": 4.7,
    "reviews": 1930,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/753399984/fpmqz_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/753399984/fpmqz_512.jpg",
      "https://images.meesho.com/images/products/753399984/retdj_512.jpg",
      "https://images.meesho.com/images/products/753399984/xs3wz_512.jpg",
      "https://images.meesho.com/images/products/753399984/zcbmo_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Perfect lump-free mixing",
      "One-touch spoonless convenience"
    ],
    "safety": "BPA-free & food-grade steel",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Trending Desk Gadget",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-automatic-wall-toothpaste-dispenser-cup-holder",
    "slug": "meesho-automatic-wall-toothpaste-dispenser-cup-holder",
    "emoji": "🪥",
    "tag": "Bathroom Smart",
    "tagColor": "#06b6d4",
    "tagBg": "rgba(6,182,212,0.12)",
    "title": "Wall-Mounted Automatic Toothpaste Dispenser with Magnetic Cups",
    "short": "Hygienic automatic toothpaste squeezer with magnetic draining cups and toothbrush slots.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.7,
    "reviews": 2150,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/884033635/rytgi_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/884033635/rytgi_512.jpg",
      "https://images.meesho.com/images/products/884033635/gxzid_512.jpg",
      "https://images.meesho.com/images/products/884033635/s8tfj_512.jpg",
      "https://images.meesho.com/images/products/884033635/wdoka_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "HOME-LIVING",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-boho-macrame-woven-wall-hanging-shelf",
    "slug": "meesho-boho-macrame-woven-wall-hanging-shelf",
    "emoji": "🧶",
    "tag": "Boho Chic",
    "tagColor": "#d97706",
    "tagBg": "rgba(217,119,6,0.12)",
    "title": "Handcrafted Boho Macrame Wooden Hanging Display Wall Shelf",
    "short": "Handwoven macrame rope hanging wall shelf with solid wood plank for small succulents and decor.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 549.0,
    "price_inr": 549.0,
    "compareAtPrice": 1299.0,
    "rating": 4.8,
    "reviews": 1740,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/494516454/yxtv3_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/494516454/yxtv3_512.jpg",
      "https://images.meesho.com/images/products/494516454/xdlb7_512.jpg",
      "https://images.meesho.com/images/products/494516454/ihgdz_512.jpg",
      "https://images.meesho.com/images/products/494516454/8vaeq_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-capsule-mini-pocket-uv-sun-umbrella",
    "slug": "meesho-capsule-mini-pocket-uv-sun-umbrella",
    "emoji": "☂️",
    "tag": "UV Shield",
    "tagColor": "#e11d48",
    "tagBg": "rgba(225,29,72,0.12)",
    "title": "Ultralight Capsule Pocket Sun & Rain Mini Umbrella with Hard Travel Case (UPF 50+)",
    "short": "Pocket-sized 18cm capsule sun and rain folding umbrella with UPF 50+ anti-UV vinyl coating.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1099.0,
    "rating": 4.8,
    "reviews": 2130,
    "category": "fashion",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/410882010/iidgy_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/410882010/iidgy_512.jpg",
      "https://images.meesho.com/images/products/410882010/g1iv5_512.jpg",
      "https://images.meesho.com/images/products/410882010/ckvxo_512.jpg",
      "https://images.meesho.com/images/products/410882010/83nix_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-ceramic-aroma-diffuser-electric-touch-lamp",
    "slug": "meesho-ceramic-aroma-diffuser-electric-touch-lamp",
    "emoji": "🪔",
    "tag": "Pooja & Decor",
    "tagColor": "#f97316",
    "tagBg": "rgba(249,115,22,0.12)",
    "title": "Electric Ceramic Aroma Oil Burner & Dimmable Night Lamp",
    "short": "Touch-dimmable ceramic aroma lamp that gently diffuses fragrant essential oils and camphor.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 599.0,
    "price_inr": 599.0,
    "compareAtPrice": 1299.0,
    "rating": 4.8,
    "reviews": 1890,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/538967791/xiqyt_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/538967791/xiqyt_512.jpg",
      "https://images.meesho.com/images/products/538967791/vvsxc_512.jpg",
      "https://images.meesho.com/images/products/538967791/taxob_512.jpg",
      "https://images.meesho.com/images/products/538967791/d7njm_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "HOME-LIVING",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-collapsible-silicone-leakproof-water-bottle",
    "slug": "meesho-collapsible-silicone-leakproof-water-bottle",
    "emoji": "🍶",
    "tag": "Travel Smart",
    "tagColor": "#0284c7",
    "tagBg": "rgba(2,132,199,0.12)",
    "title": "600ml Collapsible Food-Grade Silicone Sports Travel Water Bottle (BPA-Free)",
    "short": "Foldable 600ml leakproof silicone travel water bottle that collapses down to pocket size.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 849.0,
    "rating": 4.7,
    "reviews": 1650,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/440375513/mxce7_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/440375513/mxce7_512.jpg",
      "https://images.meesho.com/images/products/440375513/x6z1w_512.jpg",
      "https://images.meesho.com/images/products/440375513/pw92m_512.jpg",
      "https://images.meesho.com/images/products/440375513/bq81n_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-cordless-fabric-lint-shaver-rechargeable",
    "slug": "meesho-cordless-fabric-lint-shaver-rechargeable",
    "emoji": "🧶",
    "tag": "Fabric Care",
    "tagColor": "#7c3aed",
    "tagBg": "rgba(124,58,237,0.12)",
    "title": "High-Power Cordless Fabric Shaver & Woolen Sweater Lint Remover",
    "short": "Rechargeable electric lint fuzz remover shaver for sweaters, coats, blankets, and upholstery.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.8,
    "reviews": 3190,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/635083873/wfasw_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/635083873/wfasw_512.jpg",
      "https://images.meesho.com/images/products/635083873/mv0un_512.jpg",
      "https://images.meesho.com/images/products/635083873/lgzvk_512.jpg",
      "https://images.meesho.com/images/products/635083873/wfasw_1024.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-cordless-mini-portable-vacuum-cleaner-usb",
    "slug": "meesho-cordless-mini-portable-vacuum-cleaner-usb",
    "emoji": "🧹",
    "tag": "Car & Desk",
    "tagColor": "#475569",
    "tagBg": "rgba(71,85,105,0.12)",
    "title": "Cordless Mini Handheld Vacuum Cleaner for Car & Desk (USB)",
    "short": "Portable high-power cordless handheld vacuum cleaner with washable HEPA filter for car & desk.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 599.0,
    "price_inr": 599.0,
    "compareAtPrice": 1399.0,
    "rating": 4.6,
    "reviews": 1780,
    "category": "electronics",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/1048478715/32eci_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1048478715/32eci_512.jpg",
      "https://images.meesho.com/images/products/1048478715/s2sck_512.jpg",
      "https://images.meesho.com/images/products/1048478715/mq2cw_512.jpg",
      "https://images.meesho.com/images/products/1048478715/w7hbk_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "ELECTRONICS",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base",
    "slug": "meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base",
    "emoji": "🔮",
    "tag": "Bestseller",
    "tagColor": "#8b5cf6",
    "tagBg": "rgba(139,92,246,0.12)",
    "title": "3D Crystal Ball Galaxy Night Lamp with Natural Beech Wood Base",
    "short": "3D laser-engraved galaxy crystal ball night light on natural solid wood illuminated base.",
    "story": "Transform any room into a tranquil celestial observatory with razor-sharp 3D solar system optics.",
    "details": [
      "Optical grade K9 crystal",
      "Solid natural beech wood stand",
      "USB powered with inline switch",
      "Express 2-4 day pan-India dispatch"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.9,
    "reviews": 3400,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/1038078401/hha6k_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1038078401/hha6k_512.jpg",
      "https://images.meesho.com/images/products/1038078401/t7ub2_512.jpg",
      "https://images.meesho.com/images/products/1038078401/l7wwn_512.jpg",
      "https://images.meesho.com/images/products/1038078401/hha6k_1024.jpg"
    ],
    "gradient": "linear-gradient(135deg, #faf5ff, #f3e8ff)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Warm ambient glow",
      "Scratch-resistant crystal"
    ],
    "safety": "Low heat USB LED safe",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Top Pick",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-crystal-diamond-touch-led-table-lamp",
    "slug": "meesho-crystal-diamond-touch-led-table-lamp",
    "emoji": "💎",
    "tag": "Viral Hit",
    "tagColor": "#06b6d4",
    "tagBg": "rgba(6,182,212,0.1)",
    "title": "Crystal Diamond Touch LED Table Lamp (16 Colors RGB with Remote)",
    "short": "Precision faceted crystal touch lamp that casts stunning 3D rose shadow light projections.",
    "story": "Instantly elevate romantic dinners, bedrooms, or festive corners with 16 touch-switchable RGB hues.",
    "details": [
      "16 Colors RGB with wireless remote",
      "Touch sensor top on/off/color change",
      "USB rechargeable battery (8h runtime)",
      "Faceted rose optical dispersion"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1299.0,
    "rating": 4.9,
    "reviews": 1340,
    "category": "home-garden",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/1023667594/w5bxr_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1023667594/w5bxr_512.jpg",
      "https://images.meesho.com/images/products/1023667594/t0ds8_512.jpg",
      "https://images.meesho.com/images/products/1023667594/bgtil_512.jpg",
      "https://images.meesho.com/images/products/1023667594/h7qsy_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #ecfeff, #cffafe)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Stunning rose shadow light",
      "Rechargeable cordless freedom"
    ],
    "safety": "Durable acrylic crystal",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Viral Instagram",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-crystal-rose-diamond-touch-lamp-16rgb",
    "slug": "meesho-crystal-rose-diamond-touch-lamp-16rgb",
    "emoji": "💎",
    "tag": "Bestseller",
    "tagColor": "#ec4899",
    "tagBg": "rgba(236,72,153,0.12)",
    "title": "Crystal Rose Diamond Touch Sensor Rechargeable Table Lamp (16 RGB Modes)",
    "short": "16 RGB color rechargeable crystal touch lamp casting blooming rose light shadows.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1099.0,
    "rating": 4.7,
    "reviews": 3200,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/1023667594/w5bxr_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1023667594/w5bxr_512.jpg",
      "https://images.meesho.com/images/products/1023667594/t0ds8_512.jpg",
      "https://images.meesho.com/images/products/1023667594/bgtil_512.jpg",
      "https://images.meesho.com/images/products/1023667594/h7qsy_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-digital-kitchen-food-scale-10kg-lcd",
    "slug": "meesho-digital-kitchen-food-scale-10kg-lcd",
    "emoji": "⚖️",
    "tag": "Fitness Pick",
    "tagColor": "#0284c7",
    "tagBg": "rgba(2,132,199,0.12)",
    "title": "Precision Digital Kitchen Food Weighing Scale (1g to 10kg LCD)",
    "short": "High-precision 10kg digital kitchen scale with Tare function for accurate diet & cooking measurement.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.7,
    "reviews": 3820,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/1043226086/u33az_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1043226086/u33az_512.jpg",
      "https://images.meesho.com/images/products/1043226086/nf3gp_512.jpg",
      "https://images.meesho.com/images/products/1043226086/mo6pr_512.jpg",
      "https://images.meesho.com/images/products/1043226086/7nlnp_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "HOME-LIVING",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-digital-kitchen-gram-weighing-scale",
    "slug": "meesho-digital-kitchen-gram-weighing-scale",
    "emoji": "⚖️",
    "tag": "Kitchen Scale",
    "tagColor": "#0ea5e9",
    "tagBg": "rgba(14,165,233,0.12)",
    "title": "High-Precision 10kg/1g Digital Food & Kitchen Weighing Scale (Tare Function)",
    "short": "Electronic kitchen gram scale with 10kg capacity, 1g precision, and instant tare button.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.8,
    "reviews": 3670,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/1043226086/u33az_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1043226086/u33az_512.jpg",
      "https://images.meesho.com/images/products/1043226086/nf3gp_512.jpg",
      "https://images.meesho.com/images/products/1043226086/mo6pr_512.jpg",
      "https://images.meesho.com/images/products/1043226086/7nlnp_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-digital-wooden-led-alarm-clock-temp",
    "slug": "meesho-digital-wooden-led-alarm-clock-temp",
    "emoji": "⏰",
    "tag": "Nordic Desk",
    "tagColor": "#d97706",
    "tagBg": "rgba(217,119,6,0.12)",
    "title": "Triangular Wooden Digital LED Desk Alarm Clock with Temperature & Voice Sensor",
    "short": "Modern wooden LED desk clock featuring temperature display and sound-activated wake.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.8,
    "reviews": 2610,
    "category": "electronics",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/510843012/lrw2j_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/510843012/lrw2j_512.jpg",
      "https://images.meesho.com/images/products/510843012/exmwi_512.jpg",
      "https://images.meesho.com/images/products/510843012/vv2vz_512.jpg",
      "https://images.meesho.com/images/products/510843012/ul2el_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-egg-boiler-poacher-steamer-7eggs",
    "slug": "meesho-egg-boiler-poacher-steamer-7eggs",
    "emoji": "🥚",
    "tag": "Breakfast Fast",
    "tagColor": "#f59e0b",
    "tagBg": "rgba(245,158,11,0.12)",
    "title": "Rapid 350W Electric Egg Boiler & Vegetable Food Steamer (7 Eggs Capacity)",
    "short": "Automatic 7-egg electric boiler and food steamer with auto shut-off safety protection.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.8,
    "reviews": 2680,
    "category": "home-living",
    "is_trending": false,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/891713961/6ppzx_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/891713961/6ppzx_512.jpg",
      "https://images.meesho.com/images/products/891713961/oxxdm_512.jpg",
      "https://images.meesho.com/images/products/891713961/e1moe_512.jpg",
      "https://images.meesho.com/images/products/891713961/na9ab_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-electric-dry-spice-nut-coffee-grinder",
    "slug": "meesho-electric-dry-spice-nut-coffee-grinder",
    "emoji": "🌶️",
    "tag": "Masala Magic",
    "tagColor": "#dc2626",
    "tagBg": "rgba(220,38,38,0.12)",
    "title": "Stainless Steel Electric Spice, Dry Masala & Coffee Bean Grinder (300W)",
    "short": "Compact 300W high-speed stainless steel grinder for spices, coffee beans, and nuts.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 649.0,
    "price_inr": 649.0,
    "compareAtPrice": 1499.0,
    "rating": 4.8,
    "reviews": 2320,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/1031980035/blvuo_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1031980035/blvuo_512.jpg",
      "https://images.meesho.com/images/products/1031980035/wapwf_512.jpg",
      "https://images.meesho.com/images/products/1031980035/ij3ye_512.jpg",
      "https://images.meesho.com/images/products/1031980035/kbhyy_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-electric-fabric-shaver-lint-remover-usb",
    "slug": "meesho-electric-fabric-shaver-lint-remover-usb",
    "emoji": "🧥",
    "tag": "Wardrobe Reviver",
    "tagColor": "#0284c7",
    "tagBg": "rgba(2,132,199,0.1)",
    "title": "Rechargeable Electric Lint Remover & Fabric Shaver (USB Sweaters & Blankets)",
    "short": "Make old sweaters, winter jackets, sofas, and blankets look brand new by shaving fuzz and lint balls in seconds.",
    "story": "Honeycomb protective mesh shields delicate fabrics while 6 stainless steel rotary blades shear fuzz cleanly.",
    "details": [
      "High-speed motor with 6-leaf rotary blade",
      "Stainless steel honeycomb protective mesh",
      "USB rechargeable battery",
      "Transparent detachable lint collection chamber"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.8,
    "reviews": 1210,
    "category": "home-garden",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/635083873/wfasw_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/635083873/wfasw_512.jpg",
      "https://images.meesho.com/images/products/635083873/mv0un_512.jpg",
      "https://images.meesho.com/images/products/635083873/lgzvk_512.jpg",
      "https://images.meesho.com/images/products/635083873/wfasw_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Restores clothes like brand new",
      "Safe on wool, cotton & sofas"
    ],
    "safety": "Auto-shutoff if mesh unscrewed",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Winter Must-Have",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-electric-manicure-pedicure-nail-drill-kit",
    "slug": "meesho-electric-manicure-pedicure-nail-drill-kit",
    "emoji": "💅",
    "tag": "Salon at Home",
    "tagColor": "#f43f5e",
    "tagBg": "rgba(244,63,94,0.12)",
    "title": "5-in-1 Cordless Electric Nail Polisher & Cuticle Care Drill Kit",
    "short": "Portable 5-in-1 electric manicure and pedicure drill polisher with 5 interchangeable heads.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.7,
    "reviews": 1490,
    "category": "fashion",
    "is_trending": false,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/696522587/zm2pg_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/696522587/zm2pg_512.jpg",
      "https://images.meesho.com/images/products/696522587/lwrca_512.jpg",
      "https://images.meesho.com/images/products/696522587/wiiot_512.jpg",
      "https://images.meesho.com/images/products/696522587/rgcai_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-electric-milk-frother-coffee-whisk",
    "slug": "meesho-electric-milk-frother-coffee-whisk",
    "emoji": "🥛",
    "tag": "Coffee Lover",
    "tagColor": "#b45309",
    "tagBg": "rgba(180,83,9,0.12)",
    "title": "Rechargeable 3-Speed Electric Milk Frother & Handheld Coffee Whisk (Dual Heads)",
    "short": "Cordless 3-speed electric milk frother and egg whisk with dual stainless steel spiral heads.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.8,
    "reviews": 4350,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/508283374/wqk4r_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/508283374/wqk4r_512.jpg",
      "https://images.meesho.com/images/products/508283374/gviyp_512.jpg",
      "https://images.meesho.com/images/products/508283374/7lgaj_512.jpg",
      "https://images.meesho.com/images/products/508283374/h4q8p_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-electric-mini-wireless-garlic-chopper",
    "slug": "meesho-electric-mini-wireless-garlic-chopper",
    "emoji": "🧄",
    "tag": "Kitchen Must-Have",
    "tagColor": "#16a34a",
    "tagBg": "rgba(22,163,74,0.1)",
    "title": "Electric Mini Wireless Food & Garlic Chopper (250ml USB)",
    "short": "One-touch wireless electric food processor with 3 stainless steel blades. Chops in 5 seconds.",
    "story": "Chop garlic, ginger, chilies, nuts, and baby food instantly with zero eye tears and zero cable hassles.",
    "details": [
      "Food-grade 304 stainless steel blades",
      "USB rechargeable 1200mAh battery",
      "Waterproof one-touch wash",
      "250ml BPA-free container"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1099.0,
    "rating": 4.8,
    "reviews": 1120,
    "category": "home-garden",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/1001131290/b8mad_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1001131290/b8mad_512.jpg",
      "https://images.meesho.com/images/products/1001131290/kclrg_512.jpg",
      "https://images.meesho.com/images/products/1001131290/ljonu_512.jpg",
      "https://images.meesho.com/images/products/1001131290/eo5kz_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f0fdf4, #dcfce7)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Chops in 5 seconds without tears",
      "Wireless USB portability"
    ],
    "safety": "BPA-free & magnetic safety lock",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Viral Kitchen",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-ergonomic-aluminum-folding-laptop-stand",
    "slug": "meesho-ergonomic-aluminum-folding-laptop-stand",
    "emoji": "💻",
    "tag": "Ergonomic Essential",
    "tagColor": "#3b82f6",
    "tagBg": "rgba(59,130,246,0.12)",
    "title": "Heavy-Duty Ergonomic Aluminum Foldable Laptop Stand Riser (6-Angle Adjust)",
    "short": "All-aluminum 6-level adjustable folding laptop stand for ergonomic posture and cooling.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 549.0,
    "price_inr": 549.0,
    "compareAtPrice": 1299.0,
    "rating": 4.9,
    "reviews": 4120,
    "category": "electronics",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/407794791/oa7n5_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/407794791/oa7n5_512.jpg",
      "https://images.meesho.com/images/products/407794791/vylxl_512.jpg",
      "https://images.meesho.com/images/products/407794791/bt1n6_512.jpg",
      "https://images.meesho.com/images/products/407794791/jh5rd_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-extended-rgb-gaming-desk-mat-mousepad",
    "slug": "meesho-extended-rgb-gaming-desk-mat-mousepad",
    "emoji": "🎮",
    "tag": "Desk Setup",
    "tagColor": "#8b5cf6",
    "tagBg": "rgba(139,92,246,0.12)",
    "title": "Extended XXL RGB Edge-Glow Waterproof Gaming Desk Mat (800x300mm)",
    "short": "XXL 800x300mm waterproof desk mouse pad with customizable RGB edge perimeter glow.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1199.0,
    "rating": 4.8,
    "reviews": 3480,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/802952646/snrfn_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/802952646/snrfn_512.jpg",
      "https://images.meesho.com/images/products/802952646/hhjlb_512.jpg",
      "https://images.meesho.com/images/products/802952646/vy1xy_512.jpg",
      "https://images.meesho.com/images/products/802952646/5xuqq_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-eyewear-multi-tier-sunglasses-display-case",
    "slug": "meesho-eyewear-multi-tier-sunglasses-display-case",
    "emoji": "🕶️",
    "tag": "Eyewear Organizer",
    "tagColor": "#78716c",
    "tagBg": "rgba(120,113,108,0.12)",
    "title": "Multi-Slot Foldable Travel Sunglasses & Spectacles Hanging Organizer",
    "short": "Foldable 5-slot hanging sunglasses organizer case that rolls into a compact travel box.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.8,
    "reviews": 1450,
    "category": "fashion",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/419515147/mw4b2_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/419515147/mw4b2_512.jpg",
      "https://images.meesho.com/images/products/419515147/wow9x_512.jpg",
      "https://images.meesho.com/images/products/419515147/20vvr_512.jpg",
      "https://images.meesho.com/images/products/419515147/6i2pz_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-flameless-rechargeable-led-tealights-6pk",
    "slug": "meesho-flameless-rechargeable-led-tealights-6pk",
    "emoji": "🕯️",
    "tag": "Festive Safe",
    "tagColor": "#f59e0b",
    "tagBg": "rgba(245,158,11,0.12)",
    "title": "Flameless Rechargeable Flickering LED Tea Light Candles with Charging Dock (Pack of 6)",
    "short": "Pack of 6 rechargeable flameless flickering LED tea lights with charging base and frosted cups.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1199.0,
    "rating": 4.7,
    "reviews": 1420,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/422092075/limiv_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/422092075/limiv_512.jpg",
      "https://images.meesho.com/images/products/145847757/lgpjf_512.jpg",
      "https://images.meesho.com/images/products/377353982/j8f8n_512.jpg",
      "https://images.meesho.com/images/products/377353982/9qcid_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-floating-water-lotus-led-candles-6pk",
    "slug": "meesho-floating-water-lotus-led-candles-6pk",
    "emoji": "🌸",
    "tag": "Urli Decor",
    "tagColor": "#ec4899",
    "tagBg": "rgba(236,72,153,0.12)",
    "title": "Waterproof Floating Lotus LED Candles for Urli & Pools (Pack of 6)",
    "short": "Pack of 6 waterproof floating lotus LED lights that glow automatically in water urlis.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.7,
    "reviews": 1250,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/335562144/phlca_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/335562144/phlca_512.jpg",
      "https://images.meesho.com/images/products/335562144/5qpem_512.jpg",
      "https://images.meesho.com/images/products/335562144/yoact_512.jpg",
      "https://images.meesho.com/images/products/335562144/g84kd_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "HOME-LIVING",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-foldable-heavy-base-mobile-tablet-desk-stand",
    "slug": "meesho-foldable-heavy-base-mobile-tablet-desk-stand",
    "emoji": "📱",
    "tag": "Sturdy Metal",
    "tagColor": "#0284c7",
    "tagBg": "rgba(2,132,199,0.1)",
    "title": "Heavy Base Foldable Mobile & Tablet Desk Stand (Height & Angle Adjustable)",
    "short": "Weighted metal base phone holder with anti-slip silicone pads. Perfect for Zoom calls, studying, and watching reels.",
    "story": "Engineered with dual rotating hinges so you can adjust viewing angles perfectly with zero wobbling.",
    "details": [
      "Heavy alloy weighted base for zero tipping",
      "Dual 180° hinge height & angle adjustment",
      "Reserved charging cable cutout",
      "Folds completely flat for pocket portability"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.9,
    "reviews": 1350,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/923863159/v0tf5_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/923863159/v0tf5_512.jpg",
      "https://images.meesho.com/images/products/923863159/iqnuo_512.jpg",
      "https://images.meesho.com/images/products/923863159/xra2v_512.jpg",
      "https://images.meesho.com/images/products/923863159/u3euu_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Zero screen wobble on video calls",
      "Folds flat for pocket carry"
    ],
    "safety": "Smooth non-scratch silicone cushions",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "WFH Winner",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-foldable-linen-laundry-hamper-basket",
    "slug": "meesho-foldable-linen-laundry-hamper-basket",
    "emoji": "🧺",
    "tag": "Laundry Neat",
    "tagColor": "#78716c",
    "tagBg": "rgba(120,113,108,0.12)",
    "title": "Waterproof Standing Linen Fabric Laundry Hamper with Natural Bamboo Handles",
    "short": "Freestanding 75L waterproof linen laundry basket with comfortable natural bamboo carry handles.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1099.0,
    "rating": 4.8,
    "reviews": 1580,
    "category": "home-living",
    "is_trending": false,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/1025428764/rypet_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1025428764/rypet_512.jpg",
      "https://images.meesho.com/images/products/889178028/vph5p_512.jpg",
      "https://images.meesho.com/images/products/772421946/gqxam_512.jpg",
      "https://images.meesho.com/images/products/772421946/1t3w2_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-foldable-wooden-accordion-book-lamp",
    "slug": "meesho-foldable-wooden-accordion-book-lamp",
    "emoji": "📖",
    "tag": "Editor's Choice",
    "tagColor": "#b45309",
    "tagBg": "rgba(180,83,9,0.12)",
    "title": "Magnetic Foldable Wooden Accordion Book Lamp (3 Color Temperatures)",
    "short": "Magical folding book lamp with walnut wooden cover and soft ambient 360° illuminating pages.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 549.0,
    "price_inr": 549.0,
    "compareAtPrice": 1249.0,
    "rating": 4.9,
    "reviews": 1690,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/947626968/5l7dz_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/947626968/5l7dz_512.jpg",
      "https://images.meesho.com/images/products/47737179/4u4tl_512.jpg",
      "https://images.meesho.com/images/products/47737179/8x1s2_512.jpg",
      "https://images.meesho.com/images/products/947626968/r9tzk_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-galaxy-star-astronaut-projector-night-lamp",
    "slug": "meesho-galaxy-star-astronaut-projector-night-lamp",
    "emoji": "🚀",
    "tag": "Trending",
    "tagColor": "#2563eb",
    "tagBg": "rgba(37,99,235,0.1)",
    "title": "Astronaut Galaxy Star Projector LED Night Lamp (360° Rotating)",
    "short": "Magnetic 360° rotating astronaut head projecting HD galaxy nebula clouds and twinkling green stars.",
    "story": "Immerse your bedroom or gaming desk in vibrant high-definition cosmos effects with remote control.",
    "details": [
      "360° Magnetic head swivel",
      "8 Vivid nebula color modes",
      "Wireless remote control included",
      "Timer auto shut-off (45m/90m)"
    ],
    "price": 899.0,
    "price_inr": 899.0,
    "compareAtPrice": 1899.0,
    "rating": 4.9,
    "reviews": 2150,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/759223858/29bl5_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/759223858/29bl5_512.jpg",
      "https://images.meesho.com/images/products/759223858/khoop_512.jpg",
      "https://images.meesho.com/images/products/759223858/4oagn_512.jpg",
      "https://images.meesho.com/images/products/759223858/rr44h_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #eff6ff, #dbeafe)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Immersive bedroom galaxy",
      "Wireless remote control"
    ],
    "safety": "Class 1 eye safe LED/Laser",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Top Viral",
      "Free Shipping"
    ],
    "active": true
  },
  {
    "id": "meesho-gold-hexagonal-geometric-wall-shelf",
    "slug": "meesho-gold-hexagonal-geometric-wall-shelf",
    "emoji": "⬡",
    "tag": "Wall Decor",
    "tagColor": "#eab308",
    "tagBg": "rgba(234,179,8,0.12)",
    "title": "Modern Metal Wire Hexagonal Floating Wall Shelves (Set of 3, Gold Finish)",
    "short": "Set of 3 modern gold hexagonal metal wire floating wall display shelves with wooden base.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 649.0,
    "price_inr": 649.0,
    "compareAtPrice": 1499.0,
    "rating": 4.8,
    "reviews": 1390,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/990496085/lfgyn_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/990496085/lfgyn_512.jpg",
      "https://images.meesho.com/images/products/565856240/tdm47_512.jpg",
      "https://images.meesho.com/images/products/565856240/13m3j_512.jpg",
      "https://images.meesho.com/images/products/990496085/0u2l1_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-heated-eyelash-curler-rechargeable",
    "slug": "meesho-heated-eyelash-curler-rechargeable",
    "emoji": "👁️",
    "tag": "Beauty Tech",
    "tagColor": "#ec4899",
    "tagBg": "rgba(236,72,153,0.12)",
    "title": "USB Fast-Heating Long-Lasting Silicone Electric Eyelash Curler",
    "short": "Rechargeable electric heated eyelash curler with 10s fast heating and thermal silicone pad.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.7,
    "reviews": 1650,
    "category": "fashion",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/778648310/w6bwe_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/778648310/w6bwe_512.jpg",
      "https://images.meesho.com/images/products/778648310/2e19d_512.jpg",
      "https://images.meesho.com/images/products/778648310/22s69_512.jpg",
      "https://images.meesho.com/images/products/778648310/j3v4z_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-heavy-duty-welcome-textured-mesh-door-mat",
    "slug": "meesho-heavy-duty-welcome-textured-mesh-door-mat",
    "emoji": "🚪",
    "tag": "High Margin",
    "tagColor": "#16a34a",
    "tagBg": "rgba(22,163,74,0.1)",
    "title": "Welcome Textured Mesh Entrance Door Mat (Dirt Trapping 57x37.5cm)",
    "short": "Heavy-duty textured PVC coil mesh mat that traps dust, mud, and water instantly at your entrance.",
    "story": "Keep your home spotless during monsoon and festive gatherings with premium anti-skid backing.",
    "details": [
      "Heavy-duty dirt trapping loop coils",
      "Anti-skid rubberized backing",
      "Washable & quick drying",
      "Dimensions: 57cm x 37.5cm"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 899.0,
    "rating": 4.9,
    "reviews": 730,
    "category": "home-garden",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/1047084829/kradx_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1047084829/kradx_512.jpg",
      "https://images.meesho.com/images/products/1047084829/vn6uc_512.jpg",
      "https://images.meesho.com/images/products/1047084829/gba5w_512.jpg",
      "https://images.meesho.com/images/products/1047084829/bl8e3_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f0fdf4, #dcfce7)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Deep dirt trapping",
      "Anti-slip base"
    ],
    "safety": "Eco PVC waterproof",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Heavy Duty",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-himalayan-rock-salt-lamp-wooden-base",
    "slug": "meesho-himalayan-rock-salt-lamp-wooden-base",
    "emoji": "🧂",
    "tag": "Air Purifying",
    "tagColor": "#e11d48",
    "tagBg": "rgba(225,29,72,0.12)",
    "title": "Authentic Himalayan Pink Rock Salt Lamp with Solid Neem Wood Base & Dimmer",
    "short": "Pure natural Himalayan pink rock salt crystal night lamp mounted on solid polished wood base.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 699.0,
    "price_inr": 699.0,
    "compareAtPrice": 1599.0,
    "rating": 4.9,
    "reviews": 2450,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/61440567/hpbkq_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/61440567/hpbkq_512.jpg",
      "https://images.meesho.com/images/products/61440567/rurmf_512.jpg",
      "https://images.meesho.com/images/products/61440567/4w3e6_512.jpg",
      "https://images.meesho.com/images/products/61440567/y6xik_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-honeycomb-drawer-divider-organizer-8pk",
    "slug": "meesho-honeycomb-drawer-divider-organizer-8pk",
    "emoji": "🧦",
    "tag": "Drawer Bliss",
    "tagColor": "#10b981",
    "tagBg": "rgba(16,185,129,0.12)",
    "title": "Adjustable Honeycomb Drawer Separator Grid Organizer (8-Piece Interlocking Set)",
    "short": "8-piece customizable honeycomb drawer separator grid for organizing socks and accessories.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.7,
    "reviews": 2230,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/177067863/3xhlp_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/177067863/3xhlp_512.jpg",
      "https://images.meesho.com/images/products/177067863/0i1g7_512.jpg",
      "https://images.meesho.com/images/products/177067863/u1gfl_512.jpg",
      "https://images.meesho.com/images/products/177067863/9t6t3_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-instant-water-pump-dispenser-5gallon",
    "slug": "meesho-instant-water-pump-dispenser-5gallon",
    "emoji": "🚰",
    "tag": "Everyday Hero",
    "tagColor": "#0284c7",
    "tagBg": "rgba(2,132,199,0.12)",
    "title": "Wireless Automatic Electric Drinking Water Bottle Can Dispenser Pump",
    "short": "Rechargeable electric water can dispenser pump for 20L Indian standard mineral water cans.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.7,
    "reviews": 3890,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/1048315040/xz6kv_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1048315040/xz6kv_512.jpg",
      "https://images.meesho.com/images/products/1048315040/m6unz_512.jpg",
      "https://images.meesho.com/images/products/1048315040/52lcq_512.jpg",
      "https://images.meesho.com/images/products/1048315040/1ckvf_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-insulated-stainless-steel-coffee-tumbler",
    "slug": "meesho-insulated-stainless-steel-coffee-tumbler",
    "emoji": "🥤",
    "tag": "On The Go",
    "tagColor": "#0f766e",
    "tagBg": "rgba(15,118,110,0.12)",
    "title": "510ml Double-Wall Vacuum Insulated Travel Coffee Mug with Flip Spill-Proof Lid",
    "short": "510ml double-wall stainless steel vacuum insulated travel coffee tumbler with silicone grip.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.9,
    "reviews": 3280,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/210011159/9kxpl_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/210011159/9kxpl_512.jpg",
      "https://images.meesho.com/images/products/902281753/q7ouv_512.jpg",
      "https://images.meesho.com/images/products/902281753/0p71h_512.jpg",
      "https://images.meesho.com/images/products/210011159/3e2vj_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-leather-desk-pad-blotter-dual-sided",
    "slug": "meesho-leather-desk-pad-blotter-dual-sided",
    "emoji": "💼",
    "tag": "Desk Aesthetic",
    "tagColor": "#9a3412",
    "tagBg": "rgba(154,52,18,0.12)",
    "title": "Premium Waterproof Vegan Leather Dual-Sided Desk Blotter Mat (90x45cm)",
    "short": "Large 90x45cm waterproof dual-sided vegan leather desk blotter mat with non-slip edge.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1149.0,
    "rating": 4.8,
    "reviews": 1890,
    "category": "home-living",
    "is_trending": false,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/933394706/fq9aa_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/933394706/fq9aa_512.jpg",
      "https://images.meesho.com/images/products/933485053/amdsd_512.jpg",
      "https://images.meesho.com/images/products/933485053/z2779_512.jpg",
      "https://images.meesho.com/images/products/933394706/u4kvi_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-leather-travel-passport-wallet-rfid",
    "slug": "meesho-leather-travel-passport-wallet-rfid",
    "emoji": "🛂",
    "tag": "Travel Safe",
    "tagColor": "#1e3a8a",
    "tagBg": "rgba(30,58,138,0.12)",
    "title": "RFID Blocking Genuine Vegan Leather Multi-Card Passport Travel Wallet",
    "short": "Slim RFID-blocking vegan leather travel wallet with dedicated passport and boarding pass slots.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.8,
    "reviews": 1820,
    "category": "fashion",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/701625906/bt0gl_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/701625906/bt0gl_512.jpg",
      "https://images.meesho.com/images/products/701625906/5e73y_512.jpg",
      "https://images.meesho.com/images/products/410065409/6rr6b_512.jpg",
      "https://images.meesho.com/images/products/410065409/8q2g9_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-luxury-travel-jewelry-organizer-box",
    "slug": "meesho-luxury-travel-jewelry-organizer-box",
    "emoji": "💍",
    "tag": "Luxury Style",
    "tagColor": "#ec4899",
    "tagBg": "rgba(236,72,153,0.1)",
    "title": "Luxury Travel Jewelry Organizer Case with Zip & Velvet Lining",
    "short": "Compact zippered jewelry travel box with anti-tarnish velvet dividers, ring rolls, and necklace hooks.",
    "story": "Keep your gold, silver, rings, and festive jewelry completely tangle-free in your handbag or luggage.",
    "details": [
      "Premium PU leather waterproof shell",
      "Anti-tarnish soft velvet interior",
      "Smooth metallic zipper closure",
      "Compartments for rings, chains, studs"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 999.0,
    "rating": 4.9,
    "reviews": 840,
    "category": "fashion",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/896906604/tw2yq_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/896906604/tw2yq_512.jpg",
      "https://images.meesho.com/images/products/896906604/h2r93_512.jpg",
      "https://images.meesho.com/images/products/896906604/psqwf_512.jpg",
      "https://images.meesho.com/images/products/896906604/skhgo_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fdf2f8, #fce7f3)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Zero tangle jewelry protection",
      "Compact purse size"
    ],
    "safety": "Lead-free eco PU leather",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Best Seller",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-magnetic-desk-cable-cord-organizer-hub",
    "slug": "meesho-magnetic-desk-cable-cord-organizer-hub",
    "emoji": "🧲",
    "tag": "Cable Clean",
    "tagColor": "#64748b",
    "tagBg": "rgba(100,116,139,0.12)",
    "title": "Silicone Magnetic Desk Cable Clip & Cord Organizer Dock (Pack of 3)",
    "short": "Pack of 3 magnetic desk cable organizer clips with damage-free adhesive mounting docks.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 699.0,
    "rating": 4.8,
    "reviews": 3220,
    "category": "electronics",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/600742548/3z26u_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/600742548/3z26u_512.jpg",
      "https://images.meesho.com/images/products/600742548/9h4u8_512.jpg",
      "https://images.meesho.com/images/products/600742548/59l6c_512.jpg",
      "https://images.meesho.com/images/products/600742548/r8o5a_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-magnetic-kitchen-knife-strip-16inch",
    "slug": "meesho-magnetic-kitchen-knife-strip-16inch",
    "emoji": "🔪",
    "tag": "Chef Wall",
    "tagColor": "#475569",
    "tagBg": "rgba(71,85,105,0.12)",
    "title": "16-Inch Heavy Duty Magnetic Wall Kitchen Knife Holder & Tool Bar",
    "short": "Sleek 16-inch stainless steel magnetic kitchen knife rack strip for backsplash walls.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.8,
    "reviews": 1670,
    "category": "home-living",
    "is_trending": false,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/447363625/2753y_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/447363625/2753y_512.jpg",
      "https://images.meesho.com/images/products/447363625/j1e8p_512.jpg",
      "https://images.meesho.com/images/products/447363625/f8y0y_512.jpg",
      "https://images.meesho.com/images/products/447363625/3h0o9_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-magnetic-levitation-floating-moon-lamp",
    "slug": "meesho-magnetic-levitation-floating-moon-lamp",
    "emoji": "🌕",
    "tag": "Luxury Tech",
    "tagColor": "#8b5cf6",
    "tagBg": "rgba(139,92,246,0.12)",
    "title": "3D Magnetic Levitation Floating Moon Lamp (3 Color Modes with Touch)",
    "short": "Futuristic magnetic levitation lamp featuring a realistic 3D moon sphere floating and spinning in mid-air.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 1299.0,
    "price_inr": 1299.0,
    "compareAtPrice": 2999.0,
    "rating": 4.9,
    "reviews": 1670,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/524838612/8o2n5_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/524838612/8o2n5_512.jpg",
      "https://images.meesho.com/images/products/524838612/h5a7v_512.jpg",
      "https://images.meesho.com/images/products/524838612/5y2g3_512.jpg",
      "https://images.meesho.com/images/products/524838612/2f0gq_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-mandir-om-trishul-illusion-3d-acrylic-lamp",
    "slug": "meesho-mandir-om-trishul-illusion-3d-acrylic-lamp",
    "emoji": "🕉️",
    "tag": "Mandir Sacred",
    "tagColor": "#d97706",
    "tagBg": "rgba(217,119,6,0.12)",
    "title": "Sacred OM & Trishul 3D Optical Illusion LED Night Lamp for Pooja Room",
    "short": "Aesthetic 3D illusion OM and Trishul LED night lamp on warm wooden illuminated base.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.9,
    "reviews": 2980,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/481977114/x1e4a_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/481977114/x1e4a_512.jpg",
      "https://images.meesho.com/images/products/481977114/u584i_512.jpg",
      "https://images.meesho.com/images/products/481977114/3f1ea_512.jpg",
      "https://images.meesho.com/images/products/481977114/l9u1c_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-metal-headphone-stand-desk-hanger",
    "slug": "meesho-metal-headphone-stand-desk-hanger",
    "emoji": "🎧",
    "tag": "Audio Desk",
    "tagColor": "#475569",
    "tagBg": "rgba(71,85,105,0.12)",
    "title": "Solid Aluminum Desktop Headphone Stand with Silicone Headrest Cushion",
    "short": "Solid aluminum alloy gaming headset display stand with weighted anti-slip round base.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.8,
    "reviews": 1590,
    "category": "electronics",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/884238611/jjqnu_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/884238611/jjqnu_512.jpg",
      "https://images.meesho.com/images/products/860971099/3fsa4_512.jpg",
      "https://images.meesho.com/images/products/860971099/v9z4e_512.jpg",
      "https://images.meesho.com/images/products/884238611/k4y1q_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-mini-desktop-ultrasonic-mist-humidifier",
    "slug": "meesho-mini-desktop-ultrasonic-mist-humidifier",
    "emoji": "💧",
    "tag": "Air Comfort",
    "tagColor": "#06b6d4",
    "tagBg": "rgba(6,182,212,0.12)",
    "title": "Desktop Ultrasonic Cool Mist Air Humidifier with Warm Ambient Light (300ml)",
    "short": "Quiet 300ml personal desk mist humidifier with built-in warm LED soothing night lamp.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.7,
    "reviews": 1870,
    "category": "home-living",
    "is_trending": false,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/489371052/3d8g4_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/489371052/3d8g4_512.jpg",
      "https://images.meesho.com/images/products/489371052/8f9s2_512.jpg",
      "https://images.meesho.com/images/products/489371052/9e2d7_512.jpg",
      "https://images.meesho.com/images/products/489371052/w4y0z_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-mini-thermal-bag-sealer-cutter",
    "slug": "meesho-mini-thermal-bag-sealer-cutter",
    "emoji": "🍟",
    "tag": "Kitchen Lifehack",
    "tagColor": "#16a34a",
    "tagBg": "rgba(22,163,74,0.12)",
    "title": "2-in-1 Portable Mini Heat Bag Sealer & Express Unboxing Cutter (Magnetic)",
    "short": "Handheld magnetic heat bag sealer with built-in parcel unboxing cutter blade.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 649.0,
    "rating": 4.7,
    "reviews": 3810,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/697543460/s7dp5_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/697543460/s7dp5_512.jpg",
      "https://images.meesho.com/images/products/410742450/jvz02_512.jpg",
      "https://images.meesho.com/images/products/410742450/q3l0f_512.jpg",
      "https://images.meesho.com/images/products/697543460/7v6s0_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-monitor-screenbar-light-eye-care",
    "slug": "meesho-monitor-screenbar-light-eye-care",
    "emoji": "🖥️",
    "tag": "Eye Comfort",
    "tagColor": "#0ea5e9",
    "tagBg": "rgba(14,165,233,0.12)",
    "title": "Computer Monitor ScreenBar LED Light with Asymmetric Optical Eye Care",
    "short": "Asymmetric optical monitor screen light bar with touch stepless dimming and USB power.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 899.0,
    "price_inr": 899.0,
    "compareAtPrice": 1999.0,
    "rating": 4.8,
    "reviews": 1640,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/907682400/hgi7s_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/907682400/hgi7s_512.jpg",
      "https://images.meesho.com/images/products/907682400/8acpg_512.jpg",
      "https://images.meesho.com/images/products/907682400/hmioz_512.jpg",
      "https://images.meesho.com/images/products/907682400/d7kl9_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-moroccan-golden-metal-fairy-lantern-string",
    "slug": "meesho-moroccan-golden-metal-fairy-lantern-string",
    "emoji": "🏮",
    "tag": "Festive Special",
    "tagColor": "#d97706",
    "tagBg": "rgba(217,119,6,0.12)",
    "title": "Moroccan Golden Metal Lantern Fairy String Lights (16 LEDs)",
    "short": "16 handcrafted Moroccan golden lantern fairy string lights with intricate shadow cutouts.",
    "story": "Bring exotic royal ambiance and warm festive elegance to your living room, balcony, or festive backdrop.",
    "details": [
      "16 Golden hollow metal globes",
      "Warm white steady LED glow",
      "Plug-in 3.5m length",
      "Durable rust-resistant metal finish"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.7,
    "reviews": 1480,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/447300037/08eir_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/447300037/08eir_512.jpg",
      "https://images.meesho.com/images/products/447300037/z1f4u_512.jpg",
      "https://images.meesho.com/images/products/447300037/8w21o_512.jpg",
      "https://images.meesho.com/images/products/447300037/k8m0r_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fffbeb, #fef3c7)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Royal Moroccan shadow aesthetics",
      "Durable non-breakable metal"
    ],
    "safety": "Shockproof insulated wiring",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Festive Hot Pick",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-moving-sand-art-round-glass-deep-sea",
    "slug": "meesho-moving-sand-art-round-glass-deep-sea",
    "emoji": "⏳",
    "tag": "Zen Desk",
    "tagColor": "#0284c7",
    "tagBg": "rgba(2,132,199,0.12)",
    "title": "3D Dynamic Moving Sand Art Round Glass Picture (Deep Sea Desk Ornament)",
    "short": "Mesmerizing 3D cascading moving sand art desktop frame with smooth circular wooden stand.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1099.0,
    "rating": 4.8,
    "reviews": 2340,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/541476859/1wsma_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/541476859/1wsma_512.jpg",
      "https://images.meesho.com/images/products/1044174595/secsd_512.jpg",
      "https://images.meesho.com/images/products/1044174595/m1v8g_512.jpg",
      "https://images.meesho.com/images/products/541476859/2f80q_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-multi-blade-mandoline-vegetable-slicer-cutter",
    "slug": "meesho-multi-blade-mandoline-vegetable-slicer-cutter",
    "emoji": "🥗",
    "tag": "Kitchen Pro",
    "tagColor": "#16a34a",
    "tagBg": "rgba(22,163,74,0.1)",
    "title": "Multi-Function Adjustable Vegetable Slicer & Mandoline Cutter (With Safety Guard)",
    "short": "Slice cucumbers, onions, potatoes, and carrots with wafer-thin precision in seconds with hand-safe guard.",
    "story": "Cut meal prep time by 70%. Stainless steel razor-sharp interchangeable blades with non-slip base.",
    "details": [
      "6 Interchangeable stainless steel blades",
      "Ergonomic hand protector guard",
      "Catch container with drain basket",
      "BPA-free food-safe ABS"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1199.0,
    "rating": 4.7,
    "reviews": 990,
    "category": "home-garden",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/425468842/uvflh_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/425468842/uvflh_512.jpg",
      "https://images.meesho.com/images/products/425468842/mc5pd_512.jpg",
      "https://images.meesho.com/images/products/425468842/t7qck_512.jpg",
      "https://images.meesho.com/images/products/425468842/9ibyq_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f0fdf4, #dcfce7)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "70% faster meal prep",
      "Safety hand protector included"
    ],
    "safety": "BPA-free & finger safe",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Kitchen Bestseller",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-multi-device-bluetooth-wireless-keyboard",
    "slug": "meesho-multi-device-bluetooth-wireless-keyboard",
    "emoji": "⌨️",
    "tag": "Multi-Device",
    "tagColor": "#6366f1",
    "tagBg": "rgba(99,102,241,0.12)",
    "title": "Ultra-Slim Multi-Device Bluetooth Wireless Keyboard for Mac, Windows, iPad",
    "short": "Whisper-quiet ultra-slim wireless keyboard with instant 3-device Bluetooth switching.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 699.0,
    "price_inr": 699.0,
    "compareAtPrice": 1499.0,
    "rating": 4.7,
    "reviews": 1820,
    "category": "electronics",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/689037412/1r8k2_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/689037412/1r8k2_512.jpg",
      "https://images.meesho.com/images/products/689037412/9e2o1_512.jpg",
      "https://images.meesho.com/images/products/689037412/w5c1j_512.jpg",
      "https://images.meesho.com/images/products/689037412/4z8n0_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-neon-led-coffee-aesthetic-wall-sign",
    "slug": "meesho-neon-led-coffee-aesthetic-wall-sign",
    "emoji": "☕",
    "tag": "Neon Vibe",
    "tagColor": "#ea580c",
    "tagBg": "rgba(234,88,12,0.12)",
    "title": "Aesthetic Acrylic LED Neon Flex Wall Light Sign (Warm Amber Glow)",
    "short": "Chic warm neon flex sign on clear acrylic plate with inline brightness dimmer switch.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 599.0,
    "price_inr": 599.0,
    "compareAtPrice": 1299.0,
    "rating": 4.8,
    "reviews": 1780,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/1025223800/tiowq_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1025223800/tiowq_512.jpg",
      "https://images.meesho.com/images/products/1025223800/ia0ic_512.jpg",
      "https://images.meesho.com/images/products/1025223800/mc5bw_512.jpg",
      "https://images.meesho.com/images/products/1025223800/tiowq_1024.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-nordic-ceramic-donut-vase-minimalist",
    "slug": "meesho-nordic-ceramic-donut-vase-minimalist",
    "emoji": "🏺",
    "tag": "Ceramic Art",
    "tagColor": "#a8a29e",
    "tagBg": "rgba(168,162,158,0.12)",
    "title": "Nordic Matte Ceramic Hollow Donut Flower Vase for Centerpiece",
    "short": "Minimalist matte off-white circular ceramic hollow donut vase for modern tabletop styling.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1199.0,
    "rating": 4.8,
    "reviews": 2190,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/462090785/k8dzr_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/462090785/k8dzr_512.jpg",
      "https://images.meesho.com/images/products/538459453/ojw1a_512.jpg",
      "https://images.meesho.com/images/products/538459453/9a2b5_512.jpg",
      "https://images.meesho.com/images/products/462090785/m2v7w_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-nordic-insulated-coffee-tumbler-straw-500ml",
    "slug": "meesho-nordic-insulated-coffee-tumbler-straw-500ml",
    "emoji": "🥤",
    "tag": "Daily Aesthetic",
    "tagColor": "#10b981",
    "tagBg": "rgba(16,185,129,0.12)",
    "title": "Nordic Insulated Stainless Steel Coffee Tumbler with Straw (500ml)",
    "short": "500ml double-wall thermal stainless travel tumbler with straw for iced coffee & hot tea.",
    "story": "Premium matte finish Nordic tumbler with leakproof lid and reusable stainless straw.",
    "details": [
      "Double-wall vacuum insulation",
      "304 food-grade stainless steel",
      "Reusable straw with silicone tip",
      "500ml capacity fits car cup holders"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1199.0,
    "rating": 4.8,
    "reviews": 3100,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/678942110/ha4pc_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/678942110/ha4pc_512.jpg",
      "https://images.meesho.com/images/products/678942110/stts5_512.jpg",
      "https://images.meesho.com/images/products/678942110/7y2m1_512.jpg",
      "https://images.meesho.com/images/products/678942110/ha4pc_1024.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff7ed, #ffedd5)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Keeps cold for 12 hours",
      "Car cup holder friendly"
    ],
    "safety": "BPA-free & food grade",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Top Pick",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-nordic-minimalist-corner-rgb-floor-lamp",
    "slug": "meesho-nordic-minimalist-corner-rgb-floor-lamp",
    "emoji": "🏮",
    "tag": "Smart Floor Lamp",
    "tagColor": "#6366f1",
    "tagBg": "rgba(99,102,241,0.12)",
    "title": "Nordic Minimalist Corner Standing RGB Floor Light Bar with Bluetooth App",
    "short": "Sleek corner standing RGB LED floor light bar with music sync and wireless smartphone control.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 1199.0,
    "price_inr": 1199.0,
    "compareAtPrice": 2699.0,
    "rating": 4.8,
    "reviews": 1190,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/340659595/xmh66_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/340659595/xmh66_512.jpg",
      "https://images.meesho.com/images/products/1085280793/b7wyx_512.jpg",
      "https://images.meesho.com/images/products/1085280793/k1p2e_512.jpg",
      "https://images.meesho.com/images/products/340659595/9d01f_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-oil-dispenser-bottle-silicone-basting-brush",
    "slug": "meesho-oil-dispenser-bottle-silicone-basting-brush",
    "emoji": "🍳",
    "tag": "Healthy Cooking",
    "tagColor": "#ea580c",
    "tagBg": "rgba(234,88,12,0.1)",
    "title": "2-in-1 Glass Oil Dispenser Bottle with Heat-Resistant Silicone Basting Brush",
    "short": "Control oil intake effortlessly while cooking dosas, rotis, parathas, and air frying with squeeze brush applicator.",
    "story": "No more over-pouring oil or dirty sticky spoons. High borosilicate glass with heat-resistant silicone bristles.",
    "details": [
      "High borosilicate clear glass bottle (250ml)",
      "Food-grade heat resistant silicone brush (250°C)",
      "Measured pipette suction top",
      "Easy one-piece disassembly for washing"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 699.0,
    "rating": 4.8,
    "reviews": 740,
    "category": "home-garden",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/1015066204/ixzkh_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1015066204/ixzkh_512.jpg",
      "https://images.meesho.com/images/products/1015066204/l9abu_512.jpg",
      "https://images.meesho.com/images/products/1015066204/k0cv9_512.jpg",
      "https://images.meesho.com/images/products/1015066204/gc7b0_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff7ed, #ffedd5)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Save 50% cooking oil intake",
      "Zero messy drips or spills"
    ],
    "safety": "Heat-resistant & food-grade",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Healthy Kitchen",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-orthopedic-memory-foam-lumbar-cushion",
    "slug": "meesho-orthopedic-memory-foam-lumbar-cushion",
    "emoji": "🪑",
    "tag": "Posture Support",
    "tagColor": "#2563eb",
    "tagBg": "rgba(37,99,235,0.12)",
    "title": "Ergonomic High-Density Memory Foam Lumbar Support Back Cushion for Desk Chair",
    "short": "Orthopedic contoured memory foam lumbar cushion with adjustable chair strap.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 699.0,
    "price_inr": 699.0,
    "compareAtPrice": 1499.0,
    "rating": 4.9,
    "reviews": 3120,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/524810372/2r8q0_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/524810372/2r8q0_512.jpg",
      "https://images.meesho.com/images/products/524810372/h4xcn_512.jpg",
      "https://images.meesho.com/images/products/524810372/rouwo_512.jpg",
      "https://images.meesho.com/images/products/524810372/8u1m4_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-portable-hanging-neck-bladeless-fan",
    "slug": "meesho-portable-hanging-neck-bladeless-fan",
    "emoji": "🌬️",
    "tag": "Summer Hit",
    "tagColor": "#0284c7",
    "tagBg": "rgba(2,132,199,0.12)",
    "title": "Bladeless 360° Hands-Free Portable Rechargeable Neck Fan (3 Speeds)",
    "short": "Hands-free bladeless rechargeable neck fan with 3-speed 360-degree surrounding airflow.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 549.0,
    "price_inr": 549.0,
    "compareAtPrice": 1299.0,
    "rating": 4.7,
    "reviews": 2490,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/739104825/2f9w1_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/739104825/2f9w1_512.jpg",
      "https://images.meesho.com/images/products/739104825/8m3y0_512.jpg",
      "https://images.meesho.com/images/products/739104825/4r1p7_512.jpg",
      "https://images.meesho.com/images/products/739104825/u1e7a_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-portable-mini-thermal-bluetooth-pocket-printer",
    "slug": "meesho-portable-mini-thermal-bluetooth-pocket-printer",
    "emoji": "🖨️",
    "tag": "Viral Study Tool",
    "tagColor": "#7c3aed",
    "tagBg": "rgba(124,58,237,0.1)",
    "title": "Mini Portable Wireless Bluetooth Thermal Pocket Printer (Zero Ink Required)",
    "short": "Print study notes, to-do lists, black-and-white photos, and shipping labels straight from your phone with zero ink.",
    "story": "Uses heat technology so you never have to buy expensive ink cartridges. Connects over Bluetooth in 3 seconds.",
    "details": [
      "Zero ink thermal technology (200 DPI)",
      "Bluetooth 4.0 iOS & Android app",
      "Includes 1 roll thermal paper",
      "1000mAh rechargeable USB battery"
    ],
    "price": 899.0,
    "price_inr": 899.0,
    "compareAtPrice": 1999.0,
    "rating": 4.8,
    "reviews": 1780,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/437142472/5tplp_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/437142472/5tplp_512.jpg",
      "https://images.meesho.com/images/products/437142472/fvfg7_512.jpg",
      "https://images.meesho.com/images/products/437142472/g85ur_512.jpg",
      "https://images.meesho.com/images/products/437142472/soj5i_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f5f3ff, #ede9fe)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Zero ink printing forever",
      "Instant pocket note printing"
    ],
    "safety": "Heat-safe thermal printing",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Viral Student Gadget",
      "Free Shipping"
    ],
    "active": true
  },
  {
    "id": "meesho-press-type-olive-oil-spray-bottle",
    "slug": "meesho-press-type-olive-oil-spray-bottle",
    "emoji": "🫒",
    "tag": "Healthy Cooking",
    "tagColor": "#65a30d",
    "tagBg": "rgba(101,163,13,0.12)",
    "title": "200ml Glass Olive Oil & Vinegar Continuous Mist Spray Bottle",
    "short": "200ml clear glass continuous oil mister spray dispenser bottle for healthy cooking.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.8,
    "reviews": 2940,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/556406917/oxgsj_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/556406917/oxgsj_512.jpg",
      "https://images.meesho.com/images/products/1011221994/sq2rl_512.jpg",
      "https://images.meesho.com/images/products/1011394064/48lu8_512.jpg",
      "https://images.meesho.com/images/products/570625349/wvbu9_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-punch-free-mop-broom-holder-wall-mount",
    "slug": "meesho-punch-free-mop-broom-holder-wall-mount",
    "emoji": "🧹",
    "tag": "Tidy Home",
    "tagColor": "#0ea5e9",
    "tagBg": "rgba(14,165,233,0.12)",
    "title": "Heavy-Duty Self-Adhesive Wall Mount Mop & Broom Gripper (Pack of 4)",
    "short": "Pack of 4 damage-free adhesive wall clips for storing brooms, mops, and cleaning tools.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 699.0,
    "rating": 4.7,
    "reviews": 2890,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/396503059/g8f2t_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/396503059/g8f2t_512.jpg",
      "https://images.meesho.com/images/products/470345860/ll2in_512.jpg",
      "https://images.meesho.com/images/products/446775261/46zdb_512.jpg",
      "https://images.meesho.com/images/products/548838954/dc0hz_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-rechargeable-automatic-hair-curler-cordless",
    "slug": "meesho-rechargeable-automatic-hair-curler-cordless",
    "emoji": "💇‍♀️",
    "tag": "Salon Curls",
    "tagColor": "#e11d48",
    "tagBg": "rgba(225,29,72,0.12)",
    "title": "Cordless Smart Automatic Ceramic Rotating Hair Curler & Waver",
    "short": "Rechargeable cordless automatic hair curler with anti-tangle ceramic heating chamber.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 999.0,
    "price_inr": 999.0,
    "compareAtPrice": 2299.0,
    "rating": 4.8,
    "reviews": 1780,
    "category": "fashion",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/986144453/2asdl_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/986144453/2asdl_512.jpg",
      "https://images.meesho.com/images/products/984049591/pcmnt_512.jpg",
      "https://images.meesho.com/images/products/694063478/zecwx_512.jpg",
      "https://images.meesho.com/images/products/975930471/xjl2s_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-rechargeable-motion-sensor-led-cabinet-stair-light",
    "slug": "meesho-rechargeable-motion-sensor-led-cabinet-stair-light",
    "emoji": "💡",
    "tag": "Home Essential",
    "tagColor": "#059669",
    "tagBg": "rgba(5,150,105,0.1)",
    "title": "Smart Motion Sensor LED Light Bar for Wardrobe & Stairs (Magnetic Rechargeable)",
    "short": "PIR motion sensor automatically turns on warm light when you approach in the dark. Sticks with magnetic strip.",
    "story": "No drilling, no wiring. Illuminates dark wardrobes, kitchen counters, staircases, and hallways automatically.",
    "details": [
      "PIR infrared motion sensing (3-5m range)",
      "Magnetic peel-and-stick installation",
      "USB-C rechargeable battery (up to 30 days runtime)",
      "Auto shut-off after 20s"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.8,
    "reviews": 1450,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/386678326/lkdki_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/386678326/lkdki_512.jpg",
      "https://images.meesho.com/images/products/386678326/qc8rs_512.jpg",
      "https://images.meesho.com/images/products/386678326/t2ige_512.jpg",
      "https://images.meesho.com/images/products/386678326/02soa_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Hands-free night safety",
      "Zero drilling magnetic mount"
    ],
    "safety": "Cool LED touch-safe",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Top Practical Item",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-retractable-foldable-balcony-clothes-drying-rack",
    "slug": "meesho-retractable-foldable-balcony-clothes-drying-rack",
    "emoji": "👕",
    "tag": "Balcony Smart",
    "tagColor": "#3b82f6",
    "tagBg": "rgba(59,130,246,0.12)",
    "title": "Retractable Foldable Balcony & Window Clothes Drying Rack",
    "short": "Foldable window & balcony clothes drying rack with heavy duty rustproof stainless rods.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1199.0,
    "rating": 4.7,
    "reviews": 1520,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/1066962640/ok3hn_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1066962640/ok3hn_512.jpg",
      "https://images.meesho.com/images/products/482414741/dkekg_512.jpg",
      "https://images.meesho.com/images/products/763479666/ofkrn_512.jpg",
      "https://images.meesho.com/images/products/1015643569/hldmt_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "HOME-LIVING",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-reusable-silicone-food-storage-bags-4pk",
    "slug": "meesho-reusable-silicone-food-storage-bags-4pk",
    "emoji": "🥦",
    "tag": "Eco Fresh",
    "tagColor": "#15803d",
    "tagBg": "rgba(21,128,61,0.12)",
    "title": "Reusable Airtight Silicone Fresh Food Storage Bags (Pack of 4, Leakproof)",
    "short": "Pack of 4 reusable thick silicone ziplock food storage pouches for fridge and freezer.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.8,
    "reviews": 2100,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/473960771/p4iru_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/473960771/p4iru_512.jpg",
      "https://images.meesho.com/images/products/1011477786/pgx9j_512.jpg",
      "https://images.meesho.com/images/products/552785797/w4mwa_512.jpg",
      "https://images.meesho.com/images/products/452851399/koq3w_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-rotating-wall-hook-6claws-kitchen",
    "slug": "meesho-rotating-wall-hook-6claws-kitchen",
    "emoji": "⚓",
    "tag": "Space Saver",
    "tagColor": "#0284c7",
    "tagBg": "rgba(2,132,199,0.12)",
    "title": "360° Rotating 6-Claw Adhesive Ceiling & Cabinet Kitchen Hook (Pack of 2)",
    "short": "Pack of 2 under-cabinet rotating 6-claw adhesive utility hooks for utensils and kitchen tools.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 649.0,
    "rating": 4.7,
    "reviews": 1940,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/648912744/awzsx_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/648912744/awzsx_512.jpg",
      "https://images.meesho.com/images/products/1031626967/ulnyz_512.jpg",
      "https://images.meesho.com/images/products/974504201/cycjb_512.jpg",
      "https://images.meesho.com/images/products/1048262960/n1e5h_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-scented-soy-wax-bubble-cube-candle-set",
    "slug": "meesho-scented-soy-wax-bubble-cube-candle-set",
    "emoji": "🕯️",
    "tag": "Aesthetic Candle",
    "tagColor": "#f43f5e",
    "tagBg": "rgba(244,63,94,0.12)",
    "title": "Hand-Poured French Vanilla & Rose Soy Wax Bubble Cube Candles (Set of 2)",
    "short": "Set of 2 hand-poured geometric soy wax bubble candles with natural vanilla aromatherapy.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 849.0,
    "rating": 4.9,
    "reviews": 2840,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/232388766/ivnjj_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/232388766/ivnjj_512.jpg",
      "https://images.meesho.com/images/products/408233342/d64hb_512.jpg",
      "https://images.meesho.com/images/products/942637903/zmlyi_512.jpg",
      "https://images.meesho.com/images/products/419372939/czdbe_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-silent-rechargeable-dual-mode-mouse",
    "slug": "meesho-silent-rechargeable-dual-mode-mouse",
    "emoji": "🖱️",
    "tag": "Quiet Click",
    "tagColor": "#10b981",
    "tagBg": "rgba(16,185,129,0.12)",
    "title": "Silent Click Slim Rechargeable Wireless 2.4GHz & Bluetooth Mouse",
    "short": "Ultra-quiet slim rechargeable mouse with dual Bluetooth and 2.4GHz USB nano receiver.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.7,
    "reviews": 2730,
    "category": "electronics",
    "is_trending": false,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/922911674/9upfo_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/922911674/9upfo_512.jpg",
      "https://images.meesho.com/images/products/943170729/23z48_512.jpg",
      "https://images.meesho.com/images/products/989159246/5fvav_512.jpg",
      "https://images.meesho.com/images/products/1050791560/7j3s4_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-silicone-heat-resistant-pinch-mitts-pair",
    "slug": "meesho-silicone-heat-resistant-pinch-mitts-pair",
    "emoji": "🧤",
    "tag": "Daily Must-Have",
    "tagColor": "#e11d48",
    "tagBg": "rgba(225,29,72,0.12)",
    "title": "Silicone Heat-Resistant Oven Cooking Pinch Mitts (Pair)",
    "short": "Pair of heat-resistant silicone oven pinch gloves for safe pot and microwave handling.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 249.0,
    "price_inr": 249.0,
    "compareAtPrice": 599.0,
    "rating": 4.8,
    "reviews": 1450,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/699869518/b4rhd_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/699869518/b4rhd_512.jpg",
      "https://images.meesho.com/images/products/890638492/ybz9d_512.jpg",
      "https://images.meesho.com/images/products/3146940/7qlsx_512.jpg",
      "https://images.meesho.com/images/products/60031336/tgglr_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "HOME-LIVING",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-silicone-microwave-popcorn-maker-bowl",
    "slug": "meesho-silicone-microwave-popcorn-maker-bowl",
    "emoji": "🍿",
    "tag": "Snack Time",
    "tagColor": "#eab308",
    "tagBg": "rgba(234,179,8,0.12)",
    "title": "Collapsible BPA-Free Silicone Microwave Hot Popcorn Maker Bowl with Lid",
    "short": "Collapsible silicone bowl for making oil-free hot healthy popcorn in minutes in microwave.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.7,
    "reviews": 1280,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/635441666/dnor2_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/635441666/dnor2_512.jpg",
      "https://images.meesho.com/images/products/982796786/4qmbr_512.jpg",
      "https://images.meesho.com/images/products/1022713936/11ohb_512.jpg",
      "https://images.meesho.com/images/products/372506625/hex2a_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-smart-automatic-motion-sensor-trash-can",
    "slug": "meesho-smart-automatic-motion-sensor-trash-can",
    "emoji": "🗑️",
    "tag": "Smart Home",
    "tagColor": "#475569",
    "tagBg": "rgba(71,85,105,0.12)",
    "title": "Smart Touchless Infrared Motion Sensor Waterproof Trash Can (12L Narrow)",
    "short": "12L touchless automatic infrared sensor bin with silent odor-sealing motorized lid.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 799.0,
    "price_inr": 799.0,
    "compareAtPrice": 1799.0,
    "rating": 4.9,
    "reviews": 1540,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/885890734/s8bd0_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/885890734/s8bd0_512.jpg",
      "https://images.meesho.com/images/products/514478987/wqibz_512.jpg",
      "https://images.meesho.com/images/products/94334738/szjwy_512.jpg",
      "https://images.meesho.com/images/products/1015994213/3rtmp_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-solar-firefly-garden-lights-pack-of-4",
    "slug": "meesho-solar-firefly-garden-lights-pack-of-4",
    "emoji": "✨",
    "tag": "Garden Glow",
    "tagColor": "#16a34a",
    "tagBg": "rgba(22,163,74,0.12)",
    "title": "Solar Powered Swaying Firefly Garden Stake Lights (Pack of 4, 32 LEDs)",
    "short": "Pack of 4 solar stake lights with swaying bendable branches that mimic dancing fireflies at night.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 599.0,
    "price_inr": 599.0,
    "compareAtPrice": 1399.0,
    "rating": 4.7,
    "reviews": 1920,
    "category": "home-garden",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/408076693/6flv9_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/408076693/6flv9_512.jpg",
      "https://images.meesho.com/images/products/408077588/gpor2_512.jpg",
      "https://images.meesho.com/images/products/408075880/oayi2_512.jpg",
      "https://images.meesho.com/images/products/731123819/lplxi_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-sonic-facial-cleansing-silicone-brush",
    "slug": "meesho-sonic-facial-cleansing-silicone-brush",
    "emoji": "✨",
    "tag": "Self Care",
    "tagColor": "#f43f5e",
    "tagBg": "rgba(244,63,94,0.12)",
    "title": "Waterproof Rechargeable Sonic Silicone Facial Cleansing Massager",
    "short": "Cordless IPX7 waterproof sonic vibrating silicone facial brush and contour massager.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.8,
    "reviews": 3410,
    "category": "fashion",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/658257709/gl2rf_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/658257709/gl2rf_512.jpg",
      "https://images.meesho.com/images/products/424694596/waij7_512.jpg",
      "https://images.meesho.com/images/products/393894183/bvwyo_512.jpg",
      "https://images.meesho.com/images/products/986904325/qi8zl_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-stackable-clear-shoe-storage-boxes-3pk",
    "slug": "meesho-stackable-clear-shoe-storage-boxes-3pk",
    "emoji": "👟",
    "tag": "Sneaker Display",
    "tagColor": "#dc2626",
    "tagBg": "rgba(220,38,38,0.12)",
    "title": "Stackable Clear Magnetic Drop-Front Shoe Display Boxes (Pack of 3)",
    "short": "Pack of 3 heavy-duty transparent stackable shoe organizer boxes with magnetic front doors.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 799.0,
    "price_inr": 799.0,
    "compareAtPrice": 1799.0,
    "rating": 4.9,
    "reviews": 1820,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/367162417/htuav_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/367162417/htuav_512.jpg",
      "https://images.meesho.com/images/products/428087551/76ukm_512.jpg",
      "https://images.meesho.com/images/products/274307389/bgpjz_512.jpg",
      "https://images.meesho.com/images/products/898817520/i9lme_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-stainless-steel-garlic-rocker-crusher",
    "slug": "meesho-stainless-steel-garlic-rocker-crusher",
    "emoji": "🧄",
    "tag": "Chef's Hack",
    "tagColor": "#52525b",
    "tagBg": "rgba(82,82,91,0.12)",
    "title": "Ergonomic Stainless Steel Garlic Press Rocker with Silicone Tube Peeler",
    "short": "Heavy stainless steel garlic press rocker with silicone roller peeler and cleaning brush.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 649.0,
    "rating": 4.8,
    "reviews": 2150,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/406355988/wilmr_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/406355988/wilmr_512.jpg",
      "https://images.meesho.com/images/products/999719743/mgyif_512.jpg",
      "https://images.meesho.com/images/products/1060612263/9h2wo_512.jpg",
      "https://images.meesho.com/images/products/906311736/f1kr7_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-sunset-projection-lamp-16-colors",
    "slug": "meesho-sunset-projection-lamp-16-colors",
    "emoji": "🌅",
    "tag": "Trending Glow",
    "tagColor": "#f97316",
    "tagBg": "rgba(249,115,22,0.12)",
    "title": "Sunset Projection Lamp (16 RGB Colors with Remote & 360° Rotation)",
    "short": "16-color RGB aesthetic sunset projection lamp with wireless remote control and 360° rotating gimbal.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1199.0,
    "rating": 4.8,
    "reviews": 3100,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/1004575037/ine42_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1004575037/ine42_512.jpg",
      "https://images.meesho.com/images/products/1007396287/kk1iq_512.jpg",
      "https://images.meesho.com/images/products/919076950/gqxbr_512.jpg",
      "https://images.meesho.com/images/products/419916386/nf7ps_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-super-absorbent-quick-dry-hair-towel-wrap-2pk",
    "slug": "meesho-super-absorbent-quick-dry-hair-towel-wrap-2pk",
    "emoji": "🧖‍♀️",
    "tag": "Self Care",
    "tagColor": "#a855f7",
    "tagBg": "rgba(168,85,247,0.12)",
    "title": "Super Absorbent Microfiber Quick-Dry Hair Towel Wrap (Pack of 2)",
    "short": "Pack of 2 plush quick-dry microfiber hair turbans with secure button lock for frizz-free drying.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 699.0,
    "rating": 4.8,
    "reviews": 2680,
    "category": "fashion",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/407527523/mc5dt_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/407527523/mc5dt_512.jpg",
      "https://images.meesho.com/images/products/431782988/j2hhh_512.jpg",
      "https://images.meesho.com/images/products/550410435/svmbq_512.jpg",
      "https://images.meesho.com/images/products/418600821/ba3vg_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "FASHION",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-travel-velvet-jewelry-organizer-box",
    "slug": "meesho-travel-velvet-jewelry-organizer-box",
    "emoji": "💍",
    "tag": "Travel Luxe",
    "tagColor": "#ec4899",
    "tagBg": "rgba(236,72,153,0.12)",
    "title": "Compact Zipper Velvet Travel Jewelry Organizer Case with Built-in Mirror",
    "short": "Mini travel velvet jewelry organizer box with zipper closure and interior vanity mirror.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 349.0,
    "price_inr": 349.0,
    "compareAtPrice": 799.0,
    "rating": 4.9,
    "reviews": 2980,
    "category": "fashion",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/966755702/nov6y_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/966755702/nov6y_512.jpg",
      "https://images.meesho.com/images/products/412204733/uffcm_512.jpg",
      "https://images.meesho.com/images/products/650769317/jm9m5_512.jpg",
      "https://images.meesho.com/images/products/376509029/wo0gw_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-tulip-cloud-mirror-diy-night-lamp",
    "slug": "meesho-tulip-cloud-mirror-diy-night-lamp",
    "emoji": "🌷",
    "tag": "Viral TikTok",
    "tagColor": "#ec4899",
    "tagBg": "rgba(236,72,153,0.12)",
    "title": "2-in-1 Infinite Tulip Cloud Mirror & Ambient LED Night Light",
    "short": "Viral 2-in-1 cloud vanity mirror that transforms into an endless sea of illuminated tulips.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.9,
    "reviews": 3890,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/447324762/hdd4x_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/447324762/hdd4x_512.jpg",
      "https://images.meesho.com/images/products/501873312/cdm4w_512.jpg",
      "https://images.meesho.com/images/products/653346735/7yek9_512.jpg",
      "https://images.meesho.com/images/products/1033905205/iynib_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-ultrasonic-flame-mist-aroma-diffuser",
    "slug": "meesho-ultrasonic-flame-mist-aroma-diffuser",
    "emoji": "🕯️",
    "tag": "Top Rated",
    "tagColor": "#ea580c",
    "tagBg": "rgba(234,88,12,0.1)",
    "title": "Ultrasonic Flame Mist Aroma Air Diffuser & Humidifier (200ml)",
    "short": "Hypnotic realistic flame simulation lighting combined with ultra-quiet ultrasonic cold mist.",
    "story": "Infuse your bedroom or living space with calming humidity and soothing essential aroma notes.",
    "details": [
      "Realistic flame visual effect",
      "Auto shut-off when reservoir empty",
      "Whisper quiet 20dB operation",
      "Type-C USB powered"
    ],
    "price": 699.0,
    "price_inr": 699.0,
    "compareAtPrice": 1499.0,
    "rating": 4.9,
    "reviews": 940,
    "category": "home-garden",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/984668048/khohq_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/984668048/khohq_512.jpg",
      "https://images.meesho.com/images/products/984668048/qhzrl_512.jpg",
      "https://images.meesho.com/images/products/984668048/awdtr_512.jpg",
      "https://images.meesho.com/images/products/984668048/khohq_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff7ed, #fed7aa)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Aesthetic flame atmosphere",
      "Whisper-quiet air hydration"
    ],
    "safety": "Cool mist ultrasonic safety",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Aesthetic",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-under-desk-cable-management-tray-clamp",
    "slug": "meesho-under-desk-cable-management-tray-clamp",
    "emoji": "🗄️",
    "tag": "Clean Desk",
    "tagColor": "#1e293b",
    "tagBg": "rgba(30,41,59,0.12)",
    "title": "No-Drill Under-Desk Cable Management Mesh Tray with Heavy-Duty Clamp",
    "short": "Clamp-on under-desk steel cable organizer tray requiring zero drilling or wall holes.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 599.0,
    "price_inr": 599.0,
    "compareAtPrice": 1299.0,
    "rating": 4.9,
    "reviews": 1140,
    "category": "electronics",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/86139588/poaub_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/86139588/poaub_512.jpg",
      "https://images.meesho.com/images/products/955500434/kbceb_512.jpg",
      "https://images.meesho.com/images/products/624187468/ykhpv_512.jpg",
      "https://images.meesho.com/images/products/860971033/lz2nx_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-underbed-dustproof-storage-bag-2pk",
    "slug": "meesho-underbed-dustproof-storage-bag-2pk",
    "emoji": "🧳",
    "tag": "Decluttering",
    "tagColor": "#475569",
    "tagBg": "rgba(71,85,105,0.12)",
    "title": "Large Foldable Under-Bed Clothes & Blanket Storage Bags with Clear Window (2-Pack)",
    "short": "Pack of 2 large moisture-resistant under-bed storage organizer bags with clear view windows.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 449.0,
    "price_inr": 449.0,
    "compareAtPrice": 999.0,
    "rating": 4.8,
    "reviews": 3120,
    "category": "home-living",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/20518899/a6d99_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/20518899/a6d99_512.jpg",
      "https://images.meesho.com/images/products/581991010/r7fui_512.jpg",
      "https://images.meesho.com/images/products/671199571/sftvu_512.jpg",
      "https://images.meesho.com/images/products/693205175/xcxsa_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-universal-360-magnetic-car-phone-mount",
    "slug": "meesho-universal-360-magnetic-car-phone-mount",
    "emoji": "🚗",
    "tag": "Car Gear",
    "tagColor": "#64748b",
    "tagBg": "rgba(100,116,139,0.12)",
    "title": "Universal 360° Magnetic Car Phone Mount Dashboard Holder",
    "short": "Heavy duty 360° rotating magnetic car dashboard phone mount with ultra-strong N52 grip.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 699.0,
    "rating": 4.7,
    "reviews": 2980,
    "category": "electronics",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/1034147026/hhtwq_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/1034147026/hhtwq_512.jpg",
      "https://images.meesho.com/images/products/165350536/nmwuj_512.jpg",
      "https://images.meesho.com/images/products/947077909/0lg9l_512.jpg",
      "https://images.meesho.com/images/products/526002321/ic8nl_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "ELECTRONICS",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-usb-heated-coffee-mug-warmer-plate",
    "slug": "meesho-usb-heated-coffee-mug-warmer-plate",
    "emoji": "☕",
    "tag": "Daily Essential",
    "tagColor": "#d97706",
    "tagBg": "rgba(217,119,6,0.12)",
    "title": "Smart Constant Temperature (55°C) USB Ceramic Mug Warmer Plate",
    "short": "Smart gravity-induction 55°C constant temperature hot drink warmer for coffee and tea.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.8,
    "reviews": 2780,
    "category": "electronics",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/657115078/gijtl_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/657115078/gijtl_512.jpg",
      "https://images.meesho.com/images/products/929946036/inuw3_512.jpg",
      "https://images.meesho.com/images/products/275248825/nksnn_512.jpg",
      "https://images.meesho.com/images/products/514611342/tqv9e_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-usb-heated-steam-eye-mask-sleep-therapy",
    "slug": "meesho-usb-heated-steam-eye-mask-sleep-therapy",
    "emoji": "😴",
    "tag": "Sleep Therapy",
    "tagColor": "#6366f1",
    "tagBg": "rgba(99,102,241,0.12)",
    "title": "USB Heated Steam Eye Mask with Adjustable Temperature & Timer",
    "short": "Thermal heated electric eye mask with 4 heat settings and timer for eye fatigue & sleep therapy.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 499.0,
    "price_inr": 499.0,
    "compareAtPrice": 1199.0,
    "rating": 4.7,
    "reviews": 1420,
    "category": "fashion",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/673489727/raent_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/673489727/raent_512.jpg",
      "https://images.meesho.com/images/products/909135826/z0yjb_512.jpg",
      "https://images.meesho.com/images/products/768836395/xtspa_512.jpg",
      "https://images.meesho.com/images/products/509835912/9v1gx_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "FASHION",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  },
  {
    "id": "meesho-vacuum-wine-bottle-stopper-airtight",
    "slug": "meesho-vacuum-wine-bottle-stopper-airtight",
    "emoji": "🍾",
    "tag": "Kitchen Tool",
    "tagColor": "#9f1239",
    "tagBg": "rgba(159,18,57,0.12)",
    "title": "Stainless Steel Vacuum Wine & Beverage Bottle Stopper with Date Dial",
    "short": "Stainless steel vacuum preservation bottle stopper with integrated date dial tracker.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 649.0,
    "rating": 4.8,
    "reviews": 1410,
    "category": "home-living",
    "is_trending": false,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/629181565/psrui_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/629181565/psrui_512.jpg",
      "https://images.meesho.com/images/products/548235802/qqgq4_512.jpg",
      "https://images.meesho.com/images/products/629165842/kuq8t_512.jpg",
      "https://images.meesho.com/images/products/388969849/6fkz2_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-vintage-amber-edison-decorative-led-filament-bulb",
    "slug": "meesho-vintage-amber-edison-decorative-led-filament-bulb",
    "emoji": "💡",
    "tag": "Warm Vintage",
    "tagColor": "#d97706",
    "tagBg": "rgba(217,119,6,0.1)",
    "title": "Vintage Amber Glass Edison LED Filament Bulb (4W Warm Golden Glow B22/E27)",
    "short": "Classic antique filament bulb casting cozy amber romantic warmth for cafes, bedroom pendant lights, and lamps.",
    "story": "Energy efficient 4W LED delivers the nostalgic charm of century-old Edison lamps without excessive electricity.",
    "details": [
      "Antique amber tinted glass",
      "4W LED equivalent to 40W tungsten",
      "Standard Indian B22/E27 brass base",
      "Over 25,000 hours lifespan"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 699.0,
    "rating": 4.8,
    "reviews": 860,
    "category": "home-garden",
    "is_trending": true,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/891936253/wxcmw_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/891936253/wxcmw_512.jpg",
      "https://images.meesho.com/images/products/891936253/t3jul_512.jpg",
      "https://images.meesho.com/images/products/891936253/agos3_512.jpg",
      "https://images.meesho.com/images/products/891936253/dspki_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fffbeb, #fef3c7)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Ultra-cozy golden amber hue",
      "90% electricity saving vs old bulbs"
    ],
    "safety": "Low heat emission",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Cafe Aesthetic",
      "COD Available"
    ],
    "active": true
  },
  {
    "id": "meesho-vintage-edison-filament-table-lamp",
    "slug": "meesho-vintage-edison-filament-table-lamp",
    "emoji": "💡",
    "tag": "Vintage Warmth",
    "tagColor": "#d97706",
    "tagBg": "rgba(217,119,6,0.12)",
    "title": "Vintage Industrial Edison Filament Solid Wood Desk Lamp",
    "short": "Retro industrial desk lamp crafted from natural solid wood with warm spiral filament Edison bulb.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 649.0,
    "price_inr": 649.0,
    "compareAtPrice": 1499.0,
    "rating": 4.8,
    "reviews": 1130,
    "category": "home-living",
    "is_trending": false,
    "is_new": false,
    "image_url": "https://images.meesho.com/images/products/891936253/wxcmw_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/891936253/wxcmw_512.jpg",
      "https://images.meesho.com/images/products/533387156/auc2j_512.jpg",
      "https://images.meesho.com/images/products/476760972/7vun4_512.jpg",
      "https://images.meesho.com/images/products/555131126/96idx_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-water-ripple-dynamic-crystal-flame-lamp",
    "slug": "meesho-water-ripple-dynamic-crystal-flame-lamp",
    "emoji": "🌊",
    "tag": "Relaxation",
    "tagColor": "#06b6d4",
    "tagBg": "rgba(6,182,212,0.12)",
    "title": "Dynamic Water Ripple Ocean Wave Projector Crystal Lamp",
    "short": "Rotating dynamic crystal projector lamp creating moving water ripple reflections on ceilings.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 599.0,
    "price_inr": 599.0,
    "compareAtPrice": 1399.0,
    "rating": 4.8,
    "reviews": 2180,
    "category": "home-living",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/675041132/zdvf8_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/675041132/zdvf8_512.jpg",
      "https://images.meesho.com/images/products/436508648/nmcnp_512.jpg",
      "https://images.meesho.com/images/products/576132591/hzqcx_512.jpg",
      "https://images.meesho.com/images/products/540261616/5ceg9_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-water-sensor-led-diyas-pack-of-12",
    "slug": "meesho-water-sensor-led-diyas-pack-of-12",
    "emoji": "🪔",
    "tag": "Festive Winner",
    "tagColor": "#ea580c",
    "tagBg": "rgba(234,88,12,0.1)",
    "title": "Water Sensor LED Diyas (Pack of 12 Smokeless & Reusable)",
    "short": "Magical water-activated LED diyas that glow automatically when water is poured into them.",
    "story": "Celebrate with authentic warm golden flicker without oil mess, smoke, or accidental fire hazards.",
    "details": [
      "Activates automatically with water",
      "Pack of 12 reusable diyas",
      "Zero oil or flames",
      "Long-life replaceable button cells"
    ],
    "price": 399.0,
    "price_inr": 399.0,
    "compareAtPrice": 899.0,
    "rating": 4.8,
    "reviews": 890,
    "category": "home-garden",
    "is_trending": true,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/431985757/t7ur4_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/431985757/t7ur4_512.jpg",
      "https://images.meesho.com/images/products/431985757/xh4yc_512.jpg",
      "https://images.meesho.com/images/products/431985757/yjvmd_512.jpg",
      "https://images.meesho.com/images/products/431985757/bgc81_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff7ed, #ffedd5)",
    "chapter": "",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Zero smoke or oil spills",
      "Completely pet and child safe"
    ],
    "safety": "No flame hazard",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Smokeless",
      "Festive Special"
    ],
    "active": true
  },
  {
    "id": "meesho-waterproof-silicone-sink-splash-guard",
    "slug": "meesho-waterproof-silicone-sink-splash-guard",
    "emoji": "🚰",
    "tag": "Dry Counter",
    "tagColor": "#64748b",
    "tagBg": "rgba(100,116,139,0.12)",
    "title": "Silicone Faucet Water Splash Catcher & Dish Soap Draining Mat",
    "short": "Sloped food-grade silicone faucet splash guard mat with automatic dual sink drainage spouts.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 649.0,
    "rating": 4.7,
    "reviews": 2790,
    "category": "home-living",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/754097453/rbmd7_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/754097453/rbmd7_512.jpg",
      "https://images.meesho.com/images/products/917698103/fzyzs_512.jpg",
      "https://images.meesho.com/images/products/987369410/dyner_512.jpg",
      "https://images.meesho.com/images/products/1038387606/8rzcb_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #fff3e0, #ffe8d6)",
    "chapter": "Dropship Collection",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [
      "Express Delivery",
      "7-Day Replacement",
      "COD Available"
    ],
    "safety": "100% Quality Checked",
    "vetNote": "Domestic Indian Supplier",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [
      "Meesho Verified",
      "Pan-India COD",
      "Express Dispatch"
    ],
    "active": true
  },
  {
    "id": "meesho-wireless-bluetooth-smart-gps-tag-tracker",
    "slug": "meesho-wireless-bluetooth-smart-gps-tag-tracker",
    "emoji": "🏷️",
    "tag": "Smart Tag",
    "tagColor": "#0ea5e9",
    "tagBg": "rgba(14,165,233,0.12)",
    "title": "Wireless Bluetooth Smart Anti-Lost Tracker Tag for Keys & Wallet",
    "short": "Smart Bluetooth anti-loss item finder tag for keys, luggage, wallets, and pet collars.",
    "story": "Curated direct from verified domestic Indian manufacturers on Meesho with strict quality checks, authentic materials, and lightning-fast express delivery.",
    "details": [
      "⚡ 2-4 Days Express All-India Delivery (Delhivery / Shadowfax / BlueDart)",
      "💵 Cash on Delivery (COD) Available Across All 19,000+ PIN Codes",
      "🛡️ 7-Day Easy Doorstep Replacement Guarantee (Meesho Domestic Reseller Hub)",
      "✅ 100% Quality Checked & Sealed",
      "📦 Express Dispatched from Domestic Logistics Hub"
    ],
    "price": 299.0,
    "price_inr": 299.0,
    "compareAtPrice": 699.0,
    "rating": 4.6,
    "reviews": 2340,
    "category": "electronics",
    "is_trending": false,
    "is_new": true,
    "image_url": "https://images.meesho.com/images/products/453294115/yxaaj_512.jpg",
    "images": [
      "https://images.meesho.com/images/products/453294115/yxaaj_512.jpg",
      "https://images.meesho.com/images/products/579194526/99y7e_512.jpg",
      "https://images.meesho.com/images/products/586911852/wtwkr_512.jpg",
      "https://images.meesho.com/images/products/487361185/omn9m_512.jpg"
    ],
    "gradient": "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    "chapter": "ELECTRONICS",
    "pet": "both",
    "ages": [
      "all"
    ],
    "benefits": [],
    "safety": "Safe & certified domestic materials",
    "vetNote": "",
    "subscribeEligible": false,
    "wash": "#fff3e0",
    "badges": [],
    "active": true
  }
];

export const PET_META: Record<string, any> = {
  dog: { emoji: '🐕', label: 'For Dogs', color: '#9a3412', bg: '#fff7ed' },
  cat: { emoji: '🐈', label: 'For Cats', color: '#831843', bg: '#fdf2f8' },
  both: { emoji: '🐾', label: 'For Pets', color: '#0f172a', bg: '#f1f5f9' }
};

export const bundles: Record<string, string[]> = {
  "meesho-water-sensor-led-diyas-pack-of-12": ["meesho-fairy-curtain-string-led-lights-300-led", "meesho-floating-water-lotus-led-candles-6pk"],
  "meesho-crystal-diamond-touch-led-table-lamp": ["meesho-sunset-projection-lamp-16-colors-rgb", "meesho-3d-moon-touch-ambient-night-lamp"],
  "meesho-galaxy-star-astronaut-projector-night-lamp": ["meesho-3d-moon-touch-ambient-night-lamp", "meesho-sunset-projection-lamp-16-colors-rgb"],
  "meesho-electric-mini-wireless-garlic-chopper": ["meesho-2in1-oil-spray-pour-glass-dispenser", "meesho-3in1-rotary-drum-vegetable-slicer"],
  "meesho-glowcharge-540-magnetic-fast-cable": ["meesho-3in1-foldable-magnetic-wireless-charging-pad", "meesho-universal-360-magnetic-car-phone-mount"],
};

export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id || p.slug === id);
}
