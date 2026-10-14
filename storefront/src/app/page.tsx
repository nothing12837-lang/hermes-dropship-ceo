import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { formatPrice, computeDiscount, type Product } from '@/lib/data/products';
import { getNewProducts, getTrendingProducts, getProductsFromDB } from '@/lib/products-server';

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

export default async function Home() {
  const [trending, fresh, allProducts] = await Promise.all([
    getTrendingProducts(8),
    getNewProducts(8),
    getProductsFromDB(),
  ]);

  return (
    <main className="page-top min-h-screen bg-[#FFFBF5] text-[#161311] pb-16">
      {/* COMPACT PRODUCT-FIRST CATEGORY BAR */}
      <section className="border-b border-black/[0.06] bg-white/70 backdrop-blur-xl sticky top-16 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            {CATEGORY_TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="no-underline px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap bg-neutral-100/80 hover:bg-[#161311] text-neutral-800 hover:text-white active:scale-95 shadow-2xs"
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-neutral-500 shrink-0">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Pan-India 2-4 Days Express Active
            </span>
            <span>•</span>
            <span>💵 Cash on Delivery (COD)</span>
            <span>•</span>
            <span>🛡️ 7-Day Easy Return</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 flex flex-col gap-10">
        {/* FESTIVE GRAND UTSAV HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#781803] via-[#b8380e] to-[#5a1000] text-white p-5 md:p-8 shadow-xl border-2 border-amber-400/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-black uppercase tracking-wider">
                <span>🪔</span> Grand Indian Festive Utsav • Live Now
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-[#FFF275] tracking-tight leading-tight">
                🪔 Happy Navratri & Happy Diwali Grand Festive Sale! ✨
              </h1>
              <p className="text-sm md:text-base text-amber-100 font-medium leading-relaxed">
                Celebrate the auspicious season of lights! Enjoy verified domestic lifestyle and home upgrades. Express 2–4 days pan-India doorstep delivery with Cash on Delivery (COD).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
              <div className="bg-black/35 backdrop-blur-md border border-amber-300/50 rounded-2xl p-3 px-4 flex flex-col justify-center text-center">
                <span className="text-[11px] font-bold text-amber-200 uppercase tracking-widest">Festive Coupon</span>
                <span className="font-mono text-xl font-black text-amber-300 tracking-wider">DIWALI100</span>
                <span className="text-[10px] text-amber-100/80 font-medium">Flat ₹100 OFF above ₹499</span>
              </div>
              <Link
                href="/shop"
                className="no-underline inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm tracking-wide shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <span>Shop Festive Deals</span>
                <span>⚡</span>
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION 1: TOP BEST SELLERS (HIGH DEMAND) */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 text-xs font-black uppercase tracking-wider mb-1.5">
                <span>🔥</span> Verified Best Sellers
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900">
                Top Rated & Trending Products
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-extrabold text-neutral-900 hover:text-[#FF4D24] no-underline flex items-center gap-1 shrink-0 pb-1 border-b border-black/10 transition-colors"
            >
              <span>View All ({allProducts.length})</span>
              <span>→</span>
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {trending.slice(0, 8).map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 30}>
                <ProductCard {...toCard(p, i + 1)} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* SECTION 2: NEW ARRIVALS & IN-HUB DROPS */}
        <section className="rounded-[2rem] bg-gradient-to-b from-white to-amber-500/[0.03] border border-black/[0.06] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-black uppercase tracking-wider mb-1.5">
                <span>⚡</span> Just Landed In Warehouse
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900">
                Fresh Factory Drops
              </h2>
            </div>
            <Link
              href="/shop?cat=new"
              className="text-xs font-extrabold text-neutral-900 hover:text-[#FF4D24] no-underline flex items-center gap-1 shrink-0 pb-1 border-b border-black/10 transition-colors"
            >
              <span>Explore New</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {fresh.slice(0, 4).map((p) => (
              <ScrollReveal key={p.id}>
                <ProductCard {...toCard(p)} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* SECTION 3: ORGANIZED DEPARTMENT SHORTCUTS */}
        <section>
          <div className="mb-5">
            <h3 className="text-lg font-black tracking-tight text-neutral-900">
              Browse By Department
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Instant catalog filtering by category
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Link
              href="/shop?cat=electronics"
              className="p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-black/20 hover:-translate-y-1 hover:shadow-md transition-all text-neutral-900 no-underline flex items-center gap-3.5"
            >
              <span className="text-3xl">💻</span>
              <div>
                <span className="block font-black text-sm">Electronics</span>
                <span className="text-[11px] text-neutral-400 font-semibold">Tech & Gadgets</span>
              </div>
            </Link>

            <Link
              href="/shop?cat=fashion"
              className="p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-black/20 hover:-translate-y-1 hover:shadow-md transition-all text-neutral-900 no-underline flex items-center gap-3.5"
            >
              <span className="text-3xl">👕</span>
              <div>
                <span className="block font-black text-sm">Fashion</span>
                <span className="text-[11px] text-neutral-400 font-semibold">Curated Apparel</span>
              </div>
            </Link>

            <Link
              href="/shop?cat=home-garden"
              className="p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-black/20 hover:-translate-y-1 hover:shadow-md transition-all text-neutral-900 no-underline flex items-center gap-3.5"
            >
              <span className="text-3xl">🪴</span>
              <div>
                <span className="block font-black text-sm">Home & Living</span>
                <span className="text-[11px] text-neutral-400 font-semibold">Living & Garden</span>
              </div>
            </Link>

            <Link
              href="/shop?cat=general"
              className="p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-black/20 hover:-translate-y-1 hover:shadow-md transition-all text-neutral-900 no-underline flex items-center gap-3.5"
            >
              <span className="text-3xl">🔥</span>
              <div>
                <span className="block font-black text-sm">Viral Trends</span>
                <span className="text-[11px] text-neutral-400 font-semibold">Lifestyle & Travel</span>
              </div>
            </Link>
          </div>
        </section>

        {/* SECTION 4: ASSURANCE BAR */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-black/[0.06] text-xs">
          <div className="p-4 rounded-2xl bg-white border border-black/[0.05] flex items-center gap-3">
            <span className="text-2xl">🚚</span>
            <div>
              <span className="block font-bold text-neutral-900">Free Express Delivery</span>
              <span className="text-[11px] text-neutral-500">Pan-India 2–5d, Global 7–14d</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-black/[0.05] flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <span className="block font-bold text-neutral-900">7-Day Easy Return</span>
              <span className="text-[11px] text-neutral-500">Free replacement for defects</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-black/[0.05] flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div>
              <span className="block font-bold text-neutral-900">COD Available</span>
              <span className="text-[11px] text-neutral-500">Across 19,000+ PIN codes</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-black/[0.05] flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <span className="block font-bold text-neutral-900">256-Bit SSL Gateway</span>
              <span className="text-[11px] text-neutral-500">Instant UPI & Cards</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
