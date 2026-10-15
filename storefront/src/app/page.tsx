import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { formatPrice, computeDiscount, type Product } from '@/lib/data/products';
import { getNewProducts, getTrendingProducts, getProductsFromDB } from '@/lib/products-server';
import { getFlag } from '@/lib/flags';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'RareEmber | Handpicked Quality Catalog',
  description: 'Verified dropshipping catalog with instant order checkout, pan-India & global express courier, and 7-day easy replacements.',
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
    gradient: p.gradient,
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
  { id: 'electronics', label: 'Tech & Gadgets', emoji: '⚡', href: '/shop?cat=electronics' },
  { id: 'general', label: 'Viral & Lifestyle', emoji: '🔥', href: '/shop?cat=general' },
  { id: 'home-garden', label: 'Home & Living', emoji: '🪴', href: '/shop?cat=home-garden' },
  { id: 'fashion', label: 'Curated Fashion', emoji: '✨', href: '/shop?cat=fashion' },
];

const DEPARTMENTS = [
  { href: '/shop?cat=electronics', emoji: '💻', title: 'Electronics', sub: 'Tech & Gadgets' },
  { href: '/shop?cat=fashion', emoji: '👕', title: 'Fashion', sub: 'Curated Apparel' },
  { href: '/shop?cat=home-garden', emoji: '🪴', title: 'Home & Living', sub: 'Living & Garden' },
  { href: '/shop?cat=general', emoji: '🔥', title: 'Viral Trends', sub: 'Lifestyle & Travel' },
];

const ASSURANCES = [
  { emoji: '🚚', title: 'Free Express Delivery', sub: 'Pan-India 2–5d, Global 7–14d' },
  { emoji: '🛡️', title: '7-Day Easy Return', sub: 'Free replacement for defects' },
  { emoji: '💵', title: 'COD Available', sub: 'Across 19,000+ PIN codes' },
  { emoji: '🔒', title: '256-Bit SSL Gateway', sub: 'Instant UPI & Cards' },
];

const MARQUEE_ITEMS = [
  '🪔 Festive Utsav Live',
  '⚡ DIWALI100 Flat ₹100 OFF',
  '🚚 2–4 Day Express Pan-India',
  '💵 Cash on Delivery 19,000+ PINs',
  '🛡️ 7-Day Easy Replacement',
  '⭐ 4.8 Rated Verified Catalog',
  '🔒 Secure Razorpay UPI Checkout',
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 flex flex-col gap-10">
        {getFlag('hero_evaa') && (
          <div className="rounded-2xl glass-dark text-white px-5 py-4 flex items-center gap-4 overflow-hidden relative hero-rise">
            <span className="text-3xl relative z-10">👩‍🦰</span>
            <div className="relative z-10">
              <p className="font-bold text-sm">Namaste! Main Eva ✨</p>
              <p className="text-xs text-neutral-300">Hindi me curated drops, COD + 2-4 din delivery. Aaj ka hero: Water Sensor Diyas.</p>
            </div>
            <Link href="/shop" className="ml-auto relative z-10 px-4 py-2 rounded-full bg-gradient-ember text-white text-xs font-bold no-underline shadow-ember hover:shadow-ember-lg hover:-translate-y-0.5 transition-all">
              Shop Eva's Picks →
            </Link>
          </div>
        )}

        {/* FESTIVE GRAND UTSAV HERO BANNER */}
        <section className="relative overflow-hidden rounded-[2rem] text-white grain bg-gradient-night shadow-[0_30px_80px_rgba(48,26,12,0.28)] border border-white/10">
          {/* Aurora ambience */}
          <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
            <span className="aurora-blob hero-rise" style={{ width: 420, height: 420, top: -140, right: -100, background: 'rgba(255,154,61,0.45)' }} />
            <span className="aurora-blob aurora-blob-b hero-rise hero-rise-2" style={{ width: 340, height: 340, bottom: -150, left: -90, background: 'rgba(232,36,75,0.35)' }} />
            <span className="aurora-blob aurora-blob-c hero-rise hero-rise-3" style={{ width: 260, height: 260, top: 30, left: '40%', background: 'rgba(247,183,51,0.3)' }} />
          </div>

          {/* Diya float accents */}
          <span aria-hidden className="absolute top-6 right-8 text-3xl animate-float-y opacity-90 hero-rise hero-rise-3" style={{ '--float-rot': '8deg' } as React.CSSProperties}>🪔</span>
          <span aria-hidden className="absolute bottom-7 left-10 text-2xl animate-float-y opacity-70 hidden md:block hero-rise hero-rise-4" style={{ '--float-rot': '-10deg' } as React.CSSProperties}>✨</span>

          <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="hero-rise hero-rise-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#F7B733]/40 text-[#FFD36E] text-xs font-black uppercase tracking-[0.18em] backdrop-blur-md">
                <span>🪔</span> Grand Indian Festive Utsav • Live Now
              </div>
              <h1 className="hero-rise hero-rise-2 text-[1.75rem] md:text-5xl font-black tracking-tight leading-[1.05]">
                <span className="text-gradient-gold">Happy Navratri</span>{' '}
                <span className="text-white/50">&</span>{' '}
                <span className="text-gradient-ember-animated">Happy Diwali</span>
                <br className="hidden md:block" /> Grand Festive Sale!
              </h1>
              <p className="hero-rise hero-rise-3 text-sm md:text-base text-white/70 font-medium leading-relaxed max-w-xl">
                Celebrate the auspicious season of lights! Enjoy verified domestic lifestyle and home upgrades. Express 2–4 days pan-India doorstep delivery with Cash on Delivery (COD).
              </p>
              <div className="hero-rise hero-rise-4 flex flex-wrap gap-x-5 gap-y-2 pt-1 text-xs font-bold text-white/75">
                <span className="flex items-center gap-1.5"><span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-400 text-emerald-400" /> 103 Verified Products</span>
                <span className="text-white/25">•</span>
                <span>Free Express Shipping</span>
                <span className="text-white/25">•</span>
                <span>7-Day Replacement</span>
              </div>
            </div>

            <div className="hero-rise hero-rise-5 flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
              <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-[#F7B733]/45 rounded-2xl p-3.5 px-5 flex flex-col justify-center text-center animate-glow-pulse">
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-30 animate-shimmer-bg"
                  style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(247,183,51,0.35) 50%, transparent 70%)', backgroundSize: '220% 100%' }}
                />
                <span className="relative text-[11px] font-bold text-[#FFD36E] uppercase tracking-widest">Festive Coupon</span>
                <span className="relative font-mono text-xl font-black text-[#F7B733] tracking-wider">DIWALI100</span>
                <span className="relative text-[10px] text-white/65 font-medium">Flat ₹100 OFF above ₹499</span>
              </div>
              <Link
                href="/shop"
                className="no-underline inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl btn-ember font-black text-sm tracking-wide cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Shop Festive Deals <span>⚡</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Bottom gradient ribbon */}
          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 h-1.5"
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
              <ScrollReveal key={p.id} delay={i * 60}>
                <ProductCard {...toCard(p, i + 1)} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* SECTION 2: NEW ARRIVALS & IN-HUB DROPS */}
        <section className="rounded-[2rem] bg-gradient-to-b from-white via-white to-[#FF9A3D]/[0.05] border border-black/[0.06] p-6 md:p-8 shadow-[0_10px_40px_rgba(48,26,12,0.06)] relative overflow-hidden">
          <span aria-hidden className="aurora-blob" style={{ width: 300, height: 300, top: -120, right: -100, background: 'rgba(247,183,51,0.14)' }} />
          <div className="relative z-10">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <div className="hero-rise inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/12 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2 border border-emerald-500/20">
                  <span>⚡</span> Just Landed In Warehouse
                </div>
                <h2 className="hero-rise hero-rise-1 text-2xl md:text-4xl font-black tracking-tight text-[#1C1310]">
                  Fresh Factory <span className="text-gradient-ember">Drops</span>
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
        <section>
          <div className="mb-5">
            <h3 className="hero-rise text-lg md:text-xl font-black tracking-tight text-[#1C1310]">
              Browse By Department
            </h3>
            <p className="hero-rise hero-rise-1 text-xs text-neutral-500 mt-1">
              Instant catalog filtering by category
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {DEPARTMENTS.map((d, i) => (
              <ScrollReveal key={d.href} delay={i * 70}>
                <Link
                  href={d.href}
                  className="group p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-transparent hover:-translate-y-1.5 hover:shadow-lg transition-all duration-500 text-[#161311] no-underline flex items-center gap-3.5 relative overflow-hidden ring-ember-animated"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(135deg, rgba(255,154,61,0.10), rgba(232,36,75,0.06))' }}
                  />
                  <span className="text-3xl relative z-10 transition-transform duration-500 group-hover:scale-115 group-hover:-rotate-6">{d.emoji}</span>
                  <div className="relative z-10">
                    <span className="block font-black text-sm">{d.title}</span>
                    <span className="text-[11px] text-neutral-400 font-semibold">{d.sub}</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* SECTION 4: ASSURANCE BAR */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-black/[0.06] text-xs">
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
