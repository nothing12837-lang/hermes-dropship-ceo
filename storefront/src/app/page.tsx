import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { formatPrice, computeDiscount, type Product } from '@/lib/data/products';
import { getNewProducts, getTrendingProducts, getProductsFromDB } from '@/lib/products-server';
import { getFlag } from '@/lib/flags';

export const revalidate = 60; // 60s ISR: Edge cached in Mumbai/Delhi CDN for ~15ms instant delivery

export const metadata = {
  title: 'Rare Ember — Curated Streetwear, Drinkware & Creator Lifestyle',
  description: 'Curated heavyweight streetwear, artisan drinkware & aesthetic desk gear. 100% Qikink Print-on-Demand domestic manufacturing, express dispatch & 7-day replacements.',
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
    chapter: undefined,
    pet: undefined,
    rating: p.rating,
    reviews: p.reviews,
    discount: computeDiscount(p.price, p.compareAtPrice, p.price_inr),
    rank,
  };
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Catalog', emoji: '🛍️', href: '/shop' },
  { id: 'fashion', label: 'Streetwear Apparel (86)', emoji: '👕', href: '/shop?cat=fashion' },
  { id: 'home-garden', label: 'Artisan Drinkware (30)', emoji: '☕', href: '/shop?cat=home-garden' },
  { id: 'electronics', label: 'Desk & Workstation (5)', emoji: '🖥️', href: '/shop?cat=electronics' },
  { id: 'general', label: 'Bags & Accessories (26)', emoji: '🎒', href: '/shop?cat=general' },
];

const DEPARTMENTS = [
  { href: '/shop?cat=fashion', emoji: '👕', title: 'Streetwear Apparel', sub: '240 GSM Tees & 380 GSM Hoodies', count: '86 Drops' },
  { href: '/shop?cat=home-garden', emoji: '☕', title: 'Artisan Drinkware', sub: 'Stoneware Mugs & Table Accents', count: '30 Drops' },
  { href: '/shop?cat=electronics', emoji: '🖥️', title: 'Desk & Workstation', sub: 'Extended Mats & Gaming Pads', count: '5 Drops' },
  { href: '/shop?cat=general', emoji: '🎒', title: 'Bags & Accessories', sub: 'Heavy Canvas Totes & Scarves', count: '26 Drops' },
];

const ASSURANCES = [
  { emoji: '🚚', title: 'Free Express Delivery', sub: 'Pan-India 2–5d, Global 7–14d' },
  { emoji: '🛡️', title: '7-Day Easy Return', sub: 'Free replacement for defects' },
  { emoji: '💵', title: 'COD Available', sub: 'Across 19,000+ PIN codes' },
  { emoji: '🔒', title: '256-Bit SSL Gateway', sub: 'Instant UPI & Cards' },
];

const MARQUEE_ITEMS = [
  '🔥 Rare Ember Streetwear Drops Live',
  '⚡ 240 GSM Heavyweight Combed Cotton',
  '✨ Custom Name & Graphic Upload Studio',
  '🚚 BlueDart Air Express Pan-India',
  '💵 Cash on Delivery across 29,000+ PINs',
  '🛡️ 7-Day Free Doorstep Replacement',
  '🏷️ Use Code RARE100 for ₹100 OFF',
  '⭐ 4.9 Rated Verified Architecture',
];

export default async function Home() {
  const [trending, freshRaw, allProducts] = await Promise.all([
    getTrendingProducts(8),
    getNewProducts(16),
    getProductsFromDB(),
  ]);

  // Ensure 100% unique products across homepage sections (zero duplicates)
  const trendingIds = new Set(trending.map((p) => p.id));
  const freshDistinct = freshRaw.filter((p) => !trendingIds.has(p.id));
  const freshTopUp = allProducts.filter(
    (p) => !trendingIds.has(p.id) && !freshDistinct.some((f) => f.id === p.id)
  );
  const fresh = [...freshDistinct, ...freshTopUp].slice(0, 4);

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
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="px-4 py-1.5 rounded-full bg-white/70 border border-black/[0.06] text-[11px] font-bold text-text-secondary whitespace-nowrap backdrop-blur-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 flex flex-col gap-8">

        {/* NARROW & SLEEK STREETWEAR HERO BANNER */}
        <section className="relative overflow-hidden rounded-2xl text-white grain bg-gradient-night shadow-[0_16px_40px_rgba(48,26,12,0.2)] border border-white/10">
          {/* Subtle ambient glow */}
          <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
            <span className="aurora-blob hero-rise" style={{ width: 280, height: 280, top: -100, right: -50, background: 'rgba(255,154,61,0.35)' }} />
            <span className="aurora-blob aurora-blob-b hero-rise hero-rise-2" style={{ width: 220, height: 220, bottom: -80, left: -40, background: 'rgba(232,36,75,0.25)' }} />
          </div>

          <div className="relative z-10 px-5 py-4 md:py-4.5 md:px-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-[#FF4D24]/40 text-[#FF9A3D] text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                <span>🔥</span> Drops Live
              </div>
              <h1 className="text-lg md:text-2xl font-black tracking-tight leading-snug">
                <span className="text-gradient-ember-animated">Rare Ember</span> — Heavyweight Streetwear &amp; Custom Studio
              </h1>
              <p className="text-xs md:text-sm text-white/70 font-medium leading-relaxed">
                240 GSM Combed Cotton • 380 GSM Fleece • Custom Graphics &amp; Names • Dispatched direct from Tirupur Hub with 1-Click COD.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
              <div className="relative overflow-hidden bg-black/50 backdrop-blur-md border border-[#FF4D24]/45 rounded-xl px-3.5 py-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#FF9A3D] uppercase tracking-wider">Code:</span>
                <span className="font-mono text-sm font-black text-[#FF4D24] tracking-wider">RARE100</span>
                <span className="text-[10px] text-white/60 font-medium">(₹100 OFF)</span>
              </div>
              <Link
                href="/shop"
                className="no-underline inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl btn-ember font-black text-xs md:text-sm tracking-wide cursor-pointer whitespace-nowrap shadow-ember"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  Explore Drops <span>⚡</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Bottom subtle gradient ribbon */}
          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: 'linear-gradient(90deg, #FF9A3D, #FF4D24 35%, #E8244B 65%, #F7B733)' }}
          />
        </section>

        {/* SECTION 1: TOP BEST SELLERS (HIGH DEMAND) */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="hero-rise inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-ember text-white text-xs font-black uppercase tracking-wider mb-2 shadow-ember">
                <span>🔥</span> Verified Best Sellers
              </div>
              <h2 className="hero-rise hero-rise-1 text-2xl md:text-4xl font-black tracking-tight text-[#1C1310]">
                Top Rated & <span className="text-gradient-ember">Trending</span> Products
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-extrabold text-[#1C1310] hover:text-[#FF4D24] no-underline flex items-center gap-1.5 shrink-0 pb-1 border-b-2 border-black/15 hover:border-ember transition-all group"
            >
              <span>View All ({allProducts.length})</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {trending.slice(0, 8).map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 50}>
                <ProductCard {...toCard(p, i + 1)} priority={i < 2} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* SECTION 2: NEW ARRIVALS & IN-HUB DROPS (Deferred for instant LCP) */}
        <section className="deferred-section rounded-[2rem] bg-gradient-to-b from-white via-white to-[#FF9A3D]/[0.05] border border-black/[0.06] p-6 md:p-8 shadow-[0_10px_40px_rgba(48,26,12,0.06)] relative overflow-hidden">
          <span aria-hidden className="aurora-blob" style={{ width: 300, height: 300, top: -120, right: -100, background: 'rgba(247,183,51,0.14)' }} />
          <div className="relative z-10">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <div className="hero-rise inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/12 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2 border border-emerald-500/20">
                  <span>⚡</span> Direct From Tirupur Hub
                </div>
                <h2 className="hero-rise hero-rise-1 text-2xl md:text-4xl font-black tracking-tight text-[#1C1310]">
                  Fresh Streetwear & Creator <span className="text-gradient-ember">Drops</span>
                </h2>
              </div>
              <Link
                href="/shop?cat=new"
                className="text-xs font-extrabold text-[#1C1310] hover:text-[#FF4D24] no-underline flex items-center gap-1.5 shrink-0 pb-1 border-b-2 border-black/15 hover:border-ember transition-all group"
              >
                <span>Explore New</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {fresh.slice(0, 4).map((p) => (
                <ScrollReveal key={p.id} delay={40}>
                  <ProductCard {...toCard(p)} />
                </ScrollReveal>
              ))}
            </div>
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
                Explore our 4 domestic product pillars — all made on-demand with 1-click COD
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
