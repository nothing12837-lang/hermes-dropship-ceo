import Link from 'next/link';
import { Shirt, Sparkles, Monitor, ShoppingBag, Truck, ShieldCheck, Banknote, Lock } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { formatPrice, computeDiscount, type Product } from '@/lib/data/products';
import { getProductsFromDB } from '@/lib/products-server';

export const revalidate = 60; // 60s ISR: Edge cached in Mumbai (bom1) for <10ms instant response

export const metadata = {
  title: 'Rare Ember — Curated Streetwear, Workstation Gear & Graphic Drops',
  description: 'Curated 240 GSM heavyweight streetwear, graphic printed tees, 380 GSM fleece hoodies & aesthetic desk gear. 100% Domestic Tirupur Hub POD, express air dispatch & 7-day replacements.',
};

function toCard(p: Product, rank?: number) {
  return {
    id: p.id,
    slug: p.slug,
    emoji: p.emoji || '🛍️',
    tag: p.tag || (p.is_printed ? 'Graphic Print' : 'Essential Blank'),
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
  { id: 'bundles', label: 'Pack of 2 & 3 Bundles', emoji: '⚡', href: '#value-bundles' },
  { id: 'mens-printed', label: "Men's Graphic Drops", emoji: '🔥', href: '/shop?cat=mens-printed' },
  { id: 'printed', label: 'All Graphic Prints', emoji: '✨', href: '/shop?cat=printed' },
  { id: 'womens', label: "Women's Drops", emoji: '👗', href: '/shop?cat=womens' },
  { id: 'kids', label: 'Kids Streetwear', emoji: '🧸', href: '/shop?cat=kids' },
  { id: 'blanks', label: 'Premium Blanks', emoji: '⚡', href: '/shop?cat=blanks' },
  { id: 'bulk-orders', label: 'Bulk & Factory Merch', emoji: '🏭', href: '/bulk-orders' },
  { id: 'support', label: 'Help Desk & Tickets', emoji: '🎫', href: '/support' },
];

const DEPARTMENTS = [
  { href: '/shop?cat=mens-printed', icon: Shirt, title: "Men's Graphic Prints", sub: '17 Heavyweight Oversized & DTF Drops', count: '17 Drops', color: 'text-[#FF4D24] bg-orange-50' },
  { href: '/shop?cat=womens', icon: Sparkles, title: "Women's Collection", sub: 'Crop Tops, Classic Tees & A-Line Dresses', count: '7 Drops', color: 'text-amber-600 bg-amber-50' },
  { href: '/shop?cat=kids', icon: Monitor, title: 'Kids Graphic Tees', sub: 'Bio-Washed 100% Combed Cotton', count: '2 Drops', color: 'text-cyan-600 bg-cyan-50' },
  { href: '/shop?cat=blanks', icon: ShoppingBag, title: 'Essential Blanks', sub: 'Acid Wash, Polos & Minimal Silhouettes', count: '8 Drops', color: 'text-purple-600 bg-purple-50' },
];

const ASSURANCES = [
  { icon: Truck, title: 'Free Express Air Delivery', sub: 'Pan-India 2–4d via BlueDart & Delhivery', color: 'text-emerald-600 bg-emerald-50' },
  { icon: ShieldCheck, title: '7-Day Easy Return', sub: 'Free doorstep replacement guarantee', color: 'text-blue-600 bg-blue-50' },
  { icon: Banknote, title: 'COD Available', sub: 'Across 19,000+ PIN codes Pan-India', color: 'text-amber-600 bg-amber-50' },
  { icon: Lock, title: '256-Bit SSL Gateway', sub: 'Instant UPI & 1-Click Cards', color: 'text-purple-600 bg-purple-50' },
];

const MARQUEE_ITEMS = [
  '⚡ 100% Fade-Proof High-Density DTF & Sublimation Prints',
  '⚡ 240 GSM Bio-Washed Combed Cotton Streetwear',
  '🧥 380 GSM French Terry Brushed Fleece Drops',
  '🚚 Direct from Tirupur Hub in 2–4 Days',
  '💵 Cash on Delivery across 19,000+ PINs',
  '🛡️ 7-Day Free Doorstep Replacement',
  '⚡ Extra ₹30 OFF on Instant UPI Checkout (Auto-Applied)',
  '✨ Use Code FIRST50 for ₹50 OFF Individual Drops',
  '⭐ 4.9 Rated Verified Domestic Build',
];

export default async function Home() {
  const allProducts = await getProductsFromDB();

  // 1. Pack of 2 & Pack of 3 Value Bundles
  const bundleDrops = allProducts.filter((p) => p.id.startsWith('bundle-'));

  // 2. Men's Graphic Printed Streetwear (Priority showcase)
  const mensPrinted = allProducts.filter(
    (p) => (p.gender === 'men' || p.category === 'mens') && (p.is_printed === true || (p as any).isPrinted === true) && !p.id.startsWith('bundle-')
  );

  // 3. Women's & Kids' Printed Graphic Drops
  const otherPrinted = allProducts.filter(
    (p) => (p.gender === 'women' || p.gender === 'kids' || p.category === 'womens' || p.category === 'kids') && (p.is_printed === true || (p as any).isPrinted === true) && !p.id.startsWith('bundle-')
  );

  // 4. Essential Streetwear Blanks (Acid Wash, Solid Oversized Tees, Polos, Minimal Silhouettes)
  const blanks = allProducts.filter(
    (p) => (p.is_printed === false || (p as any).isPrinted === false) && !p.id.startsWith('bundle-')
  );

  return (
    <main className="page-top min-h-screen text-[#161311] pb-16">
      {/* COMPACT PRODUCT-FIRST CATEGORY BAR */}
      <section className="glass-strong relative z-20 border-b border-black/[0.04] transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {CATEGORY_TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="no-underline px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap bg-white/80 border border-black/[0.06] hover:bg-[#161311] hover:text-white hover:border-[#161311] hover:-translate-y-0.5 active:scale-95 shadow-xs"
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
      <section className="overflow-hidden py-2 sm:py-2.5 border-b border-black/[0.05]" aria-hidden>
        <div className="flex w-max animate-marquee gap-2.5">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/70 border border-black/[0.06] text-[10px] sm:text-[11px] font-bold text-text-secondary whitespace-nowrap backdrop-blur-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-3 sm:pt-4 flex flex-col gap-8 sm:gap-12">

        {/* NARROW & SLEEK STREETWEAR HERO BANNER */}
        <section className="relative overflow-hidden rounded-xl sm:rounded-2xl text-white grain bg-gradient-night shadow-[0_12px_32px_rgba(48,26,12,0.18)] border border-white/10">
          <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
            <span className="aurora-blob hero-rise" style={{ width: 280, height: 280, top: -100, right: -50, background: 'rgba(255,154,61,0.35)' }} />
            <span className="aurora-blob aurora-blob-b hero-rise hero-rise-2" style={{ width: 220, height: 220, bottom: -80, left: -40, background: 'rgba(232,36,75,0.25)' }} />
          </div>

          <div className="relative z-10 px-4 py-4 sm:px-6 sm:py-6 md:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-[#FF4D24]/40 text-[#FF9A3D] text-[9px] sm:text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                <span>🔥</span> Genuine Tirupur Hub Drops
              </div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
                <span className="text-gradient-ember-animated">Rare Ember</span> — Graphic Streetwear &amp; Designer Drops
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-white/70 font-medium leading-relaxed">
                240 GSM Bio-Washed Combed Cotton • High-Density Fade-Proof Prints • Dispatched direct from Tirupur Hub with 1-Click COD.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
              <div className="relative overflow-hidden bg-black/50 backdrop-blur-md border border-[#FF4D24]/45 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#FF9A3D] uppercase tracking-wider">UPI Offer:</span>
                <span className="font-mono text-xs sm:text-sm font-black text-[#FF4D24] tracking-wider">PREPAID30</span>
                <span className="text-[9px] sm:text-[10px] text-white/60 font-medium">(₹30 OFF)</span>
              </div>
              <a
                href="#value-bundles"
                className="no-underline inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl btn-ember font-black text-xs sm:text-sm tracking-wide cursor-pointer whitespace-nowrap shadow-ember"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  Pack of 2 &amp; 3 Bundles <span>⚡</span>
                </span>
              </a>
              <Link
                href="/bulk-orders"
                className="no-underline inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm tracking-wide transition-all border border-white/15 whitespace-nowrap"
              >
                <span>🏭</span> Bulk Orders
              </Link>
            </div>
          </div>

          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: 'linear-gradient(90deg, #FF9A3D, #FF4D24 35%, #E8244B 65%, #F7B733)' }}
          />
        </section>

        {/* SECTION 1: VALUE BUNDLES (PACK OF 2 & PACK OF 3) */}
        {bundleDrops.length > 0 && (
          <section id="value-bundles" className="scroll-mt-28">
            <div className="flex items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <div className="hero-rise inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1.5 sm:mb-2">
                  <span>⚡</span> Multi-Pack Value Combos
                </div>
                <h2 className="hero-rise hero-rise-1 text-xl sm:text-2xl md:text-4xl font-black tracking-tight text-[#1C1310]">
                  Pack of 2 &amp; Pack of 3 <span className="text-gradient-ember">Value Bundles</span>
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-neutral-500 mt-0.5 sm:mt-1">
                  Save up to ₹1,100 on multi-piece drops. Premium 240 GSM tees and 380 GSM fleece hoodies with unified express air delivery.
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-extrabold text-[#1C1310] hover:text-[#FF4D24] no-underline flex items-center gap-1 shrink-0 pb-1 border-b-2 border-black/15 hover:border-ember transition-all group whitespace-nowrap"
              >
                <span>Explore All</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Bundles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {bundleDrops.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 40}>
                  <ProductCard {...toCard(p)} priority={i === 0} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}
        {/* SECTION 2: MEN'S PRINTED STREETWEAR (PRIORITY USER SPOTLIGHT) */}
        {mensPrinted.length > 0 && (
          <section id="mens-printed" className="scroll-mt-28">
            <div className="flex items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <div className="hero-rise inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-ember text-white text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1.5 sm:mb-2 shadow-ember">
                  <span>🔥</span> Flagship Graphic Prints
                </div>
                <h2 className="hero-rise hero-rise-1 text-xl sm:text-2xl md:text-4xl font-black tracking-tight text-[#1C1310]">
                  Men&apos;s Graphic <span className="text-gradient-ember">Streetwear Drops</span>
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-neutral-500 mt-0.5 sm:mt-1">
                  High-Density Fade-Proof Prints • 240 GSM Bio-Washed Combed Cotton • Dispatched in 2-4 Days with 1-Click COD
                </p>
              </div>
              <Link
                href="/shop?cat=mens-printed"
                className="text-xs font-extrabold text-[#1C1310] hover:text-[#FF4D24] no-underline flex items-center gap-1 shrink-0 pb-1 border-b-2 border-black/15 hover:border-ember transition-all group whitespace-nowrap"
              >
                <span>View All ({mensPrinted.length})</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Men's Printed Grid: 2-column on mobile, 4-column on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {mensPrinted.map((p, i) => (
                <ScrollReveal key={p.id} delay={Math.min(i * 30, 240)}>
                  <ProductCard {...toCard(p)} priority={i < 4} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: WOMEN'S & KIDS' PRINTED GRAPHIC DROPS */}
        {otherPrinted.length > 0 && (
          <section id="other-printed" className="scroll-mt-28">
            <div className="flex items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <div className="hero-rise inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.05] text-neutral-800 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1.5 sm:mb-2">
                  <span>✨</span> Graphic Art Drops
                </div>
                <h2 className="hero-rise hero-rise-1 text-xl sm:text-2xl md:text-4xl font-black tracking-tight text-[#1C1310]">
                  Women&apos;s &amp; Kids&apos; <span className="text-gradient-ember">Printed Edition</span>
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-neutral-500 mt-0.5 sm:mt-1">
                  Aesthetic Typographic Prints &amp; Pastel Graphics on Super-Combed Bio-Washed Cotton
                </p>
              </div>
              <Link
                href="/shop?cat=printed"
                className="text-xs font-extrabold text-[#1C1310] hover:text-[#FF4D24] no-underline flex items-center gap-1 shrink-0 pb-1 border-b-2 border-black/15 hover:border-ember transition-all group whitespace-nowrap"
              >
                <span>Explore Prints</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Other Printed Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {otherPrinted.map((p, i) => (
                <ScrollReveal key={p.id} delay={Math.min(i * 30, 240)}>
                  <ProductCard {...toCard(p)} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: ESSENTIAL STREETWEAR BLANKS */}
        {blanks.length > 0 && (
          <section id="streetwear-blanks" className="scroll-mt-28">
            <div className="flex items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <div className="hero-rise inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.05] text-neutral-800 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1.5 sm:mb-2">
                  <span>⚡</span> Minimalist Wardrobe
                </div>
                <h2 className="hero-rise hero-rise-1 text-xl sm:text-2xl md:text-4xl font-black tracking-tight text-[#1C1310]">
                  Essential Streetwear <span className="text-gradient-ember">Blanks</span>
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-neutral-500 mt-0.5 sm:mt-1">
                  Acid Wash Oversized, Raglan Sleeves, Solid Crop Tops &amp; Polos for clean everyday luxury
                </p>
              </div>
              <Link
                href="/shop?cat=blanks"
                className="text-xs font-extrabold text-[#1C1310] hover:text-[#FF4D24] no-underline flex items-center gap-1 shrink-0 pb-1 border-b-2 border-black/15 hover:border-ember transition-all group whitespace-nowrap"
              >
                <span>View Blanks ({blanks.length})</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Blanks Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {blanks.map((p, i) => (
                <ScrollReveal key={p.id} delay={Math.min(i * 30, 240)}>
                  <ProductCard {...toCard(p)} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: ORGANIZED DEPARTMENT SHORTCUTS */}
        <section className="deferred-section">
          <div className="mb-4 sm:mb-5 flex items-end justify-between">
            <div>
              <div className="hero-rise inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.05] text-neutral-800 text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1.5 sm:mb-2">
                <span>✨</span> Curated Brand Pillars
              </div>
              <h3 className="hero-rise text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-[#1C1310]">
                What We Craft &amp; Deliver
              </h3>
              <p className="hero-rise hero-rise-1 text-[11px] sm:text-xs md:text-sm text-neutral-500 mt-0.5 sm:mt-1">
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            {DEPARTMENTS.map((d, i) => (
              <ScrollReveal key={d.href} delay={i * 50}>
                <Link
                  href={d.href}
                  className="group p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-black/[0.06] hover:border-[#FF4D24]/40 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-500 text-[#161311] no-underline flex flex-col justify-between gap-2.5 sm:gap-3 relative overflow-hidden"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(135deg, rgba(255,154,61,0.08), rgba(232,36,75,0.04))' }}
                  />
                  <div className="flex items-center justify-between relative z-10">
                    <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${d.color} transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                      <d.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full bg-black/[0.05] text-neutral-600 group-hover:bg-[#FF4D24] group-hover:text-white transition-colors">
                      {d.count}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <span className="block font-black text-xs sm:text-sm group-hover:text-[#FF4D24] transition-colors">{d.title}</span>
                    <span className="text-[10px] sm:text-[11px] text-neutral-500 font-medium leading-tight block mt-0.5">{d.sub}</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* SECTION 5: ASSURANCE BAR */}
        <section className="deferred-section grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-4 sm:pt-6 border-t border-black/[0.06] text-xs">
          {ASSURANCES.map((a, i) => (
            <ScrollReveal key={a.title} delay={i * 70}>
              <div className="group h-full p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-black/[0.05] flex items-center gap-2.5 sm:gap-3 hover:border-[#FF4D24]/30 hover:shadow-md transition-all duration-400">
                <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${a.color} transition-transform duration-500 group-hover:scale-110`}>
                  <a.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <div>
                  <span className="block font-bold text-[11px] sm:text-xs text-neutral-900">{a.title}</span>
                  <span className="text-[9px] sm:text-[11px] text-neutral-500">{a.sub}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </section>
      </div>
    </main>
  );
}
