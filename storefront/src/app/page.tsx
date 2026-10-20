import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { formatPrice, computeDiscount, type Product } from '@/lib/data/products';
import { getProductsFromDB } from '@/lib/products-server';

export const revalidate = 60; // 60s ISR: Edge cached in Mumbai (bom1) for <10ms instant response

export const metadata = {
  title: 'Rare Ember — Curated Streetwear, Workstation Gear & Value Combos',
  description: 'Curated 240 GSM heavyweight streetwear, 380 GSM fleece hoodies & aesthetic desk gear. 100% Domestic Tirupur Hub POD, express air dispatch & 7-day replacements.',
};

function toCard(p: Product, rank?: number) {
  return {
    id: p.id,
    emoji: p.emoji || '🛍️',
    tag: p.tag || 'New',
    tagColor: p.tagColor,
    tagBg: p.tagBg,
    title: p.title,
    desc: p.short,
    price: formatPrice(p.price_inr || p.price),
    oldPrice: p.compareAtPrice ? formatPrice(p.compareAtPrice) : undefined,
    rawPrice: p.price_inr || p.price,
    rawComparePrice: p.compareAtPrice,
    gradient: p.gradient || 'linear-gradient(135deg, #18181b, #09090b)',
    imageUrl: p.image_url,
    images: p.images,
    isPrebuilt: (p as any).isPrebuilt,
    lockedSvgMotif: (p as any).lockedSvgMotif,
    lockedGraphicTitle: (p as any).lockedGraphicTitle,
    lockedGraphicPlacement: (p as any).lockedGraphicPlacement,
    lockedAccentHex: (p as any).lockedAccentHex,
    chapter: undefined,
    pet: undefined,
    rating: p.rating,
    reviews: p.reviews,
    discount: computeDiscount(p.price, p.compareAtPrice, p.price_inr),
    rank,
  };
}

const CATEGORY_TABS = [
  { id: 'bundles', label: 'Curated Value Combos', emoji: '🔥', href: '#bundles' },
  { id: 'tees', label: '240 GSM Heavyweight Tees', emoji: '👕', href: '#hero-drops' },
  { id: 'hoodies', label: '380 GSM Fleece Hoodies', emoji: '🧥', href: '#hero-drops' },
  { id: 'desk', label: 'Workstation Desk Mats', emoji: '🖥️', href: '#hero-drops' },
  { id: 'b2b', label: 'Campus & Startup Merch', emoji: '⚡', href: '/custom-drops' },
];

const DEPARTMENTS = [
  { href: '/shop?cat=fashion', emoji: '👕', title: 'Streetwear Apparel', sub: '240 GSM Tees & 380 GSM Hoodies', count: 'Curated' },
  { href: '/custom-drops', emoji: '⚡', title: 'Campus & Startup Merch', sub: 'Bulk Runs from ₹269 with Free Mockups', count: 'B2B Studio' },
  { href: '/shop?cat=electronics', emoji: '🖥️', title: 'Desk & Workstation', sub: '900x400 Extended Mats & Pads', count: 'Precision' },
  { href: '/shop', emoji: '🎒', title: 'Complete Catalog', sub: 'Artisan Drinkware & Totes', count: 'Shop All' },
];

const ASSURANCES = [
  { emoji: '🚚', title: 'Free Express Air Delivery', sub: 'Pan-India 2–4d via BlueDart & Delhivery' },
  { emoji: '🛡️', title: '7-Day Easy Return', sub: 'Free doorstep replacement guarantee' },
  { emoji: '💵', title: 'COD Available', sub: 'Across 19,000+ PIN codes Pan-India' },
  { emoji: '🔒', title: '256-Bit SSL Gateway', sub: 'Instant UPI & 1-Click Cards' },
];

const MARQUEE_ITEMS = [
  '⚡ Rare Ember Value Combos Live — Save Up to 25%',
  '⚡ 240 GSM Bio-Washed Combed Cotton',
  '🧥 380 GSM French Terry Brushed Fleece',
  '🖥️ 900x400mm Extended Gaming Desk Mats',
  '🚚 Direct from Tirupur Hub in 2–4 Days',
  '💵 Cash on Delivery across 19,000+ PINs',
  '🛡️ 7-Day Free Doorstep Replacement',
  '⚡ Extra ₹30 OFF on Instant UPI Checkout (Auto-Applied)',
  '✨ Use Code FIRST50 for ₹50 OFF Individual Drops',
  '⭐ 4.9 Rated Verified Domestic Build',
];

export default async function Home() {
  const allProducts = await getProductsFromDB();

  // 1. Curated Winter & Value Combos (Engine 1: AOV ₹1,099–₹1,849)
  const bundleIds = [
    'bundle-winter-spec-ops',
    'bundle-3am-coder',
    'bundle-college-fest-varsity',
    'bundle-winter-layering',
    'bundle-crewneck-workstation',
    'bundle-founding-50',
    'bundle-streetwear-duo',
    'bundle-creator-workstation',
  ];
  const bundles = bundleIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  // 2. The 12 Flagship Drops (380 GSM Hoodies, Heavyweight Tees, Varsity & Workstation)
  const heroDropIds = [
    // 4 380 GSM Heavyweight Winter Hoodies & Varsity
    're-prebuilt-blr-01-hoodie',
    're-prebuilt-desi-01-hoodie',
    're-prebuilt-myth-01-hoodie',
    're-prebuilt-desi-05-varsity',
    // 6 240 GSM Combed Streetwear Graphic & Acid Wash Tees
    're-prebuilt-blr-02-oversized-tee',
    'qikink-t-shirts-acid-wash-oversized-t-shirt-uc61',
    're-prebuilt-myth-01-oversized-tee',
    'qikink-t-shirts-oversized-t-shirt-standard-us22',
    'qikink-t-shirts-terry-oversized-t-shirt-ut27',
    're-prebuilt-blr-01-varsity',
    // 2 Premium Workstation Desk Gear
    'qikink-accessories-desk-mat',
    're-prebuilt-blr-02-deskmat',
  ];

  const heroDrops = heroDropIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  return (
    <main className="page-top min-h-screen text-[#161311] pb-16">
      {/* COMPACT PRODUCT-FIRST CATEGORY BAR */}
      <section className="glass-strong sticky top-16 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            {CATEGORY_TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="no-underline px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap bg-white/70 border border-black/[0.06] hover:bg-[#161311] hover:text-white hover:border-[#161311] hover:-translate-y-0.5 active:scale-95 shadow-xs"
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-neutral-500 shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-500 text-emerald-500" />
              Pan-India 2-4 Days Express Active
            </span>
            <span className="text-black/15">•</span>
            <span>💵 Cash on Delivery (COD)</span>
            <span className="text-black/15">•</span>
            <span>🛡️ 7-Day Easy Return</span>
          </div>
        </div>
      </section>

      {/* TRUST MARQUEE STRIP */}
      <section className="overflow-hidden py-3 border-b border-black/[0.05]" aria-hidden>
        <div className="flex w-max animate-marquee gap-3">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="px-4 py-1.5 rounded-full bg-white/70 border border-black/[0.06] text-[11px] font-bold text-text-secondary whitespace-nowrap backdrop-blur-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 flex flex-col gap-10">

        {/* NARROW & SLEEK STREETWEAR HERO BANNER */}
        <section className="relative overflow-hidden rounded-2xl text-white grain bg-gradient-night shadow-[0_16px_40px_rgba(48,26,12,0.2)] border border-white/10">
          <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
            <span className="aurora-blob hero-rise" style={{ width: 280, height: 280, top: -100, right: -50, background: 'rgba(255,154,61,0.35)' }} />
            <span className="aurora-blob aurora-blob-b hero-rise hero-rise-2" style={{ width: 220, height: 220, bottom: -80, left: -40, background: 'rgba(232,36,75,0.25)' }} />
          </div>

          <div className="relative z-10 px-5 py-5 md:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-[#FF4D24]/40 text-[#FF9A3D] text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                <span>🔥</span> Flagship Curated Drops
              </div>
              <h1 className="text-xl md:text-3xl font-black tracking-tight leading-snug">
                <span className="text-gradient-ember-animated">Rare Ember</span> — Heavyweight Streetwear &amp; Creator Gear
              </h1>
              <p className="text-xs md:text-sm text-white/70 font-medium leading-relaxed">
                240 GSM Combed Cotton • 380 GSM Fleece • 900x400mm Desk Mats • Dispatched direct from Tirupur Hub with 1-Click COD.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
              <div className="relative overflow-hidden bg-black/50 backdrop-blur-md border border-[#FF4D24]/45 rounded-xl px-3.5 py-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#FF9A3D] uppercase tracking-wider">UPI Offer:</span>
                <span className="font-mono text-sm font-black text-[#FF4D24] tracking-wider">PREPAID30</span>
                <span className="text-[10px] text-white/60 font-medium">(₹30 OFF)</span>
              </div>
              <Link
                href="#bundles"
                className="no-underline inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl btn-ember font-black text-xs md:text-sm tracking-wide cursor-pointer whitespace-nowrap shadow-ember"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  Explore Combos <span>⚡</span>
                </span>
              </Link>
            </div>
          </div>

          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: 'linear-gradient(90deg, #FF9A3D, #FF4D24 35%, #E8244B 65%, #F7B733)' }}
          />
        </section>

        {/* SECTION 1: CURATED VALUE COMBOS (AOV ₹1,099–₹1,849) */}
        <section id="bundles" className="scroll-mt-28">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="hero-rise inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-ember text-white text-xs font-black uppercase tracking-wider mb-2 shadow-ember">
                <span>🔥</span> Maximum Value Combos
              </div>
              <h2 className="hero-rise hero-rise-1 text-2xl md:text-4xl font-black tracking-tight text-[#1C1310]">
                Curated Value Combos — <span className="text-gradient-ember">Save Up to 25%</span>
              </h2>
              <p className="text-xs md:text-sm text-neutral-500 mt-1">
                Save up to ₹1,200 with combined express air shipping. 380 GSM fleece hoodies, varsity jackets &amp; 100% bio-washed Tirupur combed cotton.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-extrabold text-[#1C1310] hover:text-[#FF4D24] no-underline flex items-center gap-1.5 shrink-0 pb-1 border-b-2 border-black/15 hover:border-ember transition-all group"
            >
              <span>Explore All</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* 4 Bundles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {bundles.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 50}>
                <ProductCard {...toCard(p, i + 1)} priority={i < 2} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* B2B CAMPUS & STARTUP MERCH SPOTLIGHT BANNER */}
        <section className="rounded-3xl bg-gradient-to-r from-[#171412] via-[#211b17] to-[#171412] text-white p-6 md:p-8 border border-white/10 shadow-xl relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <span className="aurora-blob" style={{ width: 300, height: 300, top: -100, right: -50, background: 'rgba(255,77,36,0.3)' }} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FF9A3D] text-[11px] font-black uppercase tracking-wider">
                ⚡ Campus &amp; Startup Merch Studio
              </span>
              <h3 className="text-xl md:text-3xl font-black tracking-tight leading-snug">
                Organizing a Hackathon, College Fest or Team Launch?
              </h3>
              <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                Zero setup fees. Bulk 240 GSM Heavyweight Tees &amp; 380 GSM Hoodies from <b>₹269/unit</b>. 
                Chat with our <b>Hermes AI Desk</b> for instant tier quotes, 20% advance booking, and free 3D mockups in 2 hours.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/custom-drops"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF4D24] to-[#f59e0b] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider text-center no-underline transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>🏛️</span> Talk to Hermes AI Desk ➔
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/\D/g, '')}?text=Hi%20Ajay%2C%20I%20need%20custom%20merch%20for%20our%20team` : '/custom-drops'}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider text-center no-underline transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>💬</span> Custom Merch Desk
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE 12 FLAGSHIP HERO DROPS (NO CLUTTER) */}
        <section id="hero-drops" className="scroll-mt-28">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="hero-rise inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.05] text-neutral-800 text-xs font-black uppercase tracking-wider mb-2">
                <span>✨</span> Zero Filler Catalog
              </div>
              <h2 className="hero-rise hero-rise-1 text-2xl md:text-4xl font-black tracking-tight text-[#1C1310]">
                The 12 Flagship <span className="text-gradient-ember">Hero Drops</span>
              </h2>
              <p className="text-xs md:text-sm text-neutral-500 mt-1">
                4× 380 GSM Fleece Hoodies &amp; Varsity • 6× Heavyweight Graphic Tees • 2× Workstation Gear
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-extrabold text-[#1C1310] hover:text-[#FF4D24] no-underline flex items-center gap-1.5 shrink-0 pb-1 border-b-2 border-black/15 hover:border-ember transition-all group"
            >
              <span>View All Catalog</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* 12 Hero Drops Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {heroDrops.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 35}>
                <ProductCard {...toCard(p)} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* SECTION 3: ORGANIZED DEPARTMENT SHORTCUTS */}
        <section className="deferred-section">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="hero-rise inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.05] text-neutral-800 text-[11px] font-black uppercase tracking-wider mb-2">
                <span>✨</span> Curated Brand Pillars
              </div>
              <h3 className="hero-rise text-xl md:text-3xl font-black tracking-tight text-[#1C1310]">
                What We Craft &amp; Deliver
              </h3>
              <p className="hero-rise hero-rise-1 text-xs md:text-sm text-neutral-500 mt-1">
                Explore our domestic product pillars — all made on-demand with 1-click COD
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#FF4D24] hover:underline hidden sm:inline-block"
            >
              Explore All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {DEPARTMENTS.map((d, i) => (
              <ScrollReveal key={d.href} delay={i * 50}>
                <Link
                  href={d.href}
                  className="group p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-[#FF4D24]/40 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-500 text-[#161311] no-underline flex flex-col justify-between gap-3 relative overflow-hidden"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(135deg, rgba(255,154,61,0.08), rgba(232,36,75,0.04))' }}
                  />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-3xl transition-transform duration-500 group-hover:scale-115 group-hover:-rotate-6">{d.emoji}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/[0.05] text-neutral-600 group-hover:bg-[#FF4D24] group-hover:text-white transition-colors">
                      {d.count}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <span className="block font-black text-sm group-hover:text-[#FF4D24] transition-colors">{d.title}</span>
                    <span className="text-[11px] text-neutral-500 font-medium leading-tight block mt-0.5">{d.sub}</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* SECTION 4: ASSURANCE BAR */}
        <section className="deferred-section grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-black/[0.06] text-xs">
          {ASSURANCES.map((a, i) => (
            <ScrollReveal key={a.title} delay={i * 70}>
              <div className="group h-full p-4 rounded-2xl bg-white border border-black/[0.05] flex items-center gap-3 hover:border-ember/30 hover:shadow-md transition-all duration-400">
                <span className="text-2xl transition-transform duration-500 group-hover:scale-115 group-hover:-rotate-6">{a.emoji}</span>
                <div>
                  <span className="block font-bold text-neutral-900">{a.title}</span>
                  <span className="text-[11px] text-neutral-500">{a.sub}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </section>
      </div>
    </main>
  );
}
