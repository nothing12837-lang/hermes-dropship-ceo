'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Shirt, Flame, Sparkles, ShieldCheck } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { COPY } from '@/lib/data/copy';
import { formatPrice, computeDiscount, SHOP_CATEGORIES, products as localProducts } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { supabase, type ProductRow } from '@/lib/supabase';

const TABS = [
  { id: 'all', label: 'All Catalog', count: 31, hint: 'Complete Domestic Hub Drops', emoji: '🛍️' },
  ...SHOP_CATEGORIES,
];

function isDisallowedRow(p: ProductRow): boolean {
  const targetId = `${p.id || ''} ${p.slug || ''} ${p.title || ''}`.toLowerCase();
  // Filter legacy pet products and low-margin novelty filler items (Directive 3)
  return /calmcloud|ember-glow|warm-paw|lickmat|pawtrack|cozy-nest|aesthetic-scratch|smart-fetch|button-badge|button_badge|button badge|temporary-tattoo|temporary tattoo|tattoo|scrunchies|bow scrunchie|bookmark|balaclava|arm sleeves|arm sleeve|basic t-shirt pc/i.test(targetId);
}

export function matchesCategory(cat: string, p: any): boolean {
  if (isDisallowedRow(p)) return false;
  if (cat === 'all') return true;
  if (cat === 'new') return Boolean(p.is_new === true);
  if (cat === 'mens-printed') return Boolean((p.gender === 'men' || p.category === 'mens') && (p.is_printed === true || p.isPrinted === true));
  if (cat === 'printed') return Boolean(p.is_printed === true || p.isPrinted === true);
  if (cat === 'mens') return Boolean(p.gender === 'men' || p.category === 'mens');
  if (cat === 'womens') return Boolean(p.gender === 'women' || p.category === 'womens' || p.category === 'women');
  if (cat === 'kids') return Boolean(p.gender === 'kids' || p.category === 'kids');
  if (cat === 'blanks') return Boolean(p.is_printed === false || p.isPrinted === false);
  return (p.category ?? 'mens') === cat;
}

function ShopInner() {
  const search = useSearchParams();
  const param = search.get('cat') || 'all';
  const initial = TABS.some((t) => t.id === param) ? param : 'all';
  const [cat, setCat] = useState<string>(initial);
  const [query, setQuery] = useState(search.get('q') || '');
  const [sort, setSort] = useState('featured');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [products, setProducts] = useState<ProductRow[]>(localProducts as unknown as ProductRow[]);

  useEffect(() => {
    setCat(TABS.some((t) => t.id === param) ? param : 'all');
    const q = search.get('q') || '';
    if (q) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param, search]);

  useEffect(() => {
    setProducts(localProducts as unknown as ProductRow[]);
  }, [cat]);

  const inStockCount = useMemo(() => {
    return products.filter((p) => matchesCategory(cat, p) && p.active !== false && (p.stock == null || Number(p.stock) > 0)).length;
  }, [products, cat]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => matchesCategory(cat, p) && (p.active === false || (p.stock != null && Number(p.stock) <= 0))).length;
  }, [products, cat]);

  const list = useMemo(() => {
    let l = products.filter((p) => matchesCategory(cat, p));

    // Stock Filter
    if (stockFilter === 'in_stock') {
      l = l.filter((p) => p.active !== false && (p.stock == null || Number(p.stock) > 0));
    } else if (stockFilter === 'out_of_stock') {
      l = l.filter((p) => p.active === false || (p.stock != null && Number(p.stock) <= 0));
    }

    if (query) {
      const q = query.toLowerCase();
      l = l.filter((p) =>
        `${p.title} ${p.description ?? ''} ${p.short ?? ''}`.toLowerCase().includes(q)
      );
    }
    if (sort === 'low') l = [...l].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'high') l = [...l].sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'rating')
      l = [...l].sort((a, b) => Number(b.rating ?? 5) - Number(a.rating ?? 5));
    return l;
  }, [products, cat, query, sort, stockFilter]);

  const active = TABS.find((c) => c.id === cat) ?? TABS[0];

  return (
    <main className="page-top min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <span className="aurora-blob" style={{ width: 420, height: 420, top: -180, right: -120, background: 'rgba(255,122,24,0.14)' }} />
          <span className="aurora-blob aurora-blob-b" style={{ width: 360, height: 360, top: -140, left: -140, background: 'rgba(232,36,75,0.10)' }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-block px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full glass text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-text-secondary shadow-xs">
              What We Craft &amp; Deliver
            </div>
            <h1 className="font-display text-2xl sm:text-4xl md:text-6xl text-text-primary mt-3 sm:mt-4 tracking-tight">
              Curated Streetwear &amp; <span className="text-gradient-ember-animated">Graphic Drops.</span>
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-2 sm:mt-3 font-medium">
              Heavyweight 240 GSM bio-washed tees, aeroknit jerseys, Y2K baby tees &amp; premium blanks — 100% genuine domestic build from our Tirupur hub with Pan-India 1-Click COD.
            </p>
          </motion.div>

          {/* Quick Pillar Showcase Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-4xl mx-auto mt-5 sm:mt-7 text-left">
            {[
              { id: 'mens-printed', icon: Flame, title: "Men's Printed", count: '17 Drops', desc: 'Heavyweight DTF & Sublimation', color: 'text-[#FF4D24]' },
              { id: 'printed', icon: Sparkles, title: 'All Graphic Prints', count: '23 Drops', desc: 'Fade-Proof Streetwear Art', color: 'text-amber-500' },
              { id: 'womens', icon: Shirt, title: "Women's Drops", count: '7 Drops', desc: 'Baby Tees, Crop Tops & Dresses', color: 'text-pink-500' },
              { id: 'blanks', icon: ShieldCheck, title: 'Premium Blanks', count: '8 Drops', desc: 'Acid Wash, Tie-Dye & Basics', color: 'text-neutral-600' },
            ].map((d) => {
              const isSelected = cat === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setCat(d.id)}
                  className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-300 text-left cursor-pointer flex flex-col justify-between gap-1.5 sm:gap-2.5 ${
                    isSelected
                      ? 'bg-[#161311] text-white border-[#FF4D24] shadow-md -translate-y-0.5'
                      : 'bg-white/80 hover:bg-white border-black/[0.06] text-[#161311] hover:border-black/15 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-white/10 text-white" : "bg-black/[0.04] " + d.color}`}><d.icon className="w-4 h-4 sm:w-5 sm:h-5" /></span>
                    <span className={`text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#FF4D24] text-white' : 'bg-black/[0.05] text-neutral-600'}`}>
                      {d.count}
                    </span>
                  </div>
                  <div>
                    <span className="block font-black text-xs sm:text-sm">{d.title}</span>
                    <span className={`text-[9px] sm:text-[10px] font-medium leading-tight block mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {d.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Responsive Horizontal Scroll Category Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2 px-1 max-w-full justify-start sm:justify-center mt-5 sm:mt-7">
            {TABS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border cursor-pointer font-black text-xs sm:text-sm whitespace-nowrap min-h-[34px] sm:min-h-[40px] transition-all flex items-center gap-1.5 shrink-0 ${
                  cat === c.id
                    ? 'bg-neutral-900 text-white border-[#FF4D24] shadow-md ring-1 ring-[#FF4D24]/40'
                    : 'bg-white/80 hover:bg-white text-neutral-700 border-black/10 hover:border-black/25'
                }`}
              >
                {'emoji' in c && c.emoji ? <span className="text-sm">{c.emoji}</span> : null}
                <span>{c.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-text-secondary font-medium">
            {active.id === 'all'
              ? `All ${list.length} Verified Domestic Drops — showing ${list.length} items`
              : `${active.hint} — showing ${list.length} items`}
          </div>

        <div className="flex gap-2 sm:gap-3 flex-wrap justify-center items-center mt-4 sm:mt-5 max-w-xl mx-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drops, graphics, colors, sizes..."
            className="flex-1 min-w-[180px] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border-subtle bg-bg-surface text-text-primary text-xs sm:text-sm outline-none placeholder:text-text-muted/60 focus:border-ember transition-colors shadow-xs"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 sm:py-2.5 rounded-xl border border-border-subtle bg-bg-surface text-text-primary text-xs sm:text-sm font-bold outline-none cursor-pointer shadow-xs"
          >
            <option value="featured">Featured First</option>
            <option value="rating">Top Rated</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
          </select>
        </div>

        {/* Modern Stock Availability Filter */}
        <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center items-center mt-3 sm:mt-4">
          <div className="inline-flex p-1 bg-bg-surface border border-border-subtle rounded-full backdrop-blur-md shadow-xs">
            <button
              type="button"
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                stockFilter === 'all'
                  ? 'bg-[#1d1d1f] text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('in_stock')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-text-secondary hover:text-emerald-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              In Stock ({inStockCount})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                stockFilter === 'out_of_stock'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-text-secondary hover:text-rose-600'
              }`}
            >
              <span>⚠️</span>
              Restocking ({outOfStockCount})
            </button>
          </div>
        </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 pt-6 sm:pt-8 pb-20">
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard
                  id={p.id}
                  slug={p.slug || undefined}
                  emoji={p.emoji || '🛍️'}
                  tag={p.is_trending ? 'Trending' : p.tag || 'New'}
                  tagColor={p.tag_color || '#FFFFFF'}
                  tagBg={p.tag_bg || 'var(--color-ember)'}
                  title={p.title}
                  desc={p.short || p.description || ''}
                  price={formatPrice(Number((p as any).price_inr || p.price))}
                  oldPrice={p.compare_at_price ? formatPrice(Number(p.compare_at_price)) : undefined}
                  rawPrice={Number((p as any).price_inr || p.price)}
                  rawComparePrice={p.compare_at_price ? Number(p.compare_at_price) : undefined}
                  gradient={p.gradient || 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(194,65,12,0.1))'}
                  imageUrl={resolveProductImage(p.id, p.image_url)}
                  images={(p as any).images}
                  chapter={p.chapter || undefined}
                  pet={undefined}
                  rating={Number(p.rating ?? 4.3)}
                  reviews={Number(p.reviews ?? 120)}
                  discount={computeDiscount(
                    Number(p.price),
                    p.compare_at_price ? Number(p.compare_at_price) : undefined,
                    (p as any).price_inr ? Number((p as any).price_inr) : undefined
                  )}
                  inStock={p.active !== false && (p.stock == null || Number(p.stock) > 0)}
                  stock={p.stock != null ? Number(p.stock) : undefined}
                  priority={i < 3}
                  isPrebuilt={(p as any).isPrebuilt}
                  lockedSvgMotif={(p as any).lockedSvgMotif}
                  lockedGraphicTitle={(p as any).lockedGraphicTitle}
                  lockedGraphicPlacement={(p as any).lockedGraphicPlacement}
                  lockedAccentHex={(p as any).lockedAccentHex}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {list.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-16 px-6 rounded-3xl bg-neutral-900/60 border border-white/10 shadow-2xl backdrop-blur-xl my-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FF4D24]/20 to-[#E8244B]/20 border border-[#FF4D24]/40 flex items-center justify-center text-3xl shadow-inner">
              ⚡
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FF9A3D] text-[11px] font-black uppercase tracking-wider mb-3">
              Vault Refresh In Progress
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-3">
              New Collection Launching Soon
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-lg mx-auto mb-8">
              All previous catalog pieces have been archived. We are curating our next official drop of heavyweight apparel and creator gear direct from our Tirupur studio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/custom-drops"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF4D24] to-[#f59e0b] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider no-underline shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>🎨</span> Open Custom Design Studio
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider no-underline transition-all flex items-center justify-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        <ScrollReveal>
          <div className="mt-12 flex gap-3 flex-wrap justify-center text-sm font-bold text-text-secondary">
            {COPY.trustBar.map((t) => (
              <span key={t.title} className="bg-bg-surface border border-border-subtle px-4 py-2.5 rounded-full backdrop-blur-sm">
                {t.icon} {t.title} ({t.sub})
              </span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopInner />
    </Suspense>
  );
}
