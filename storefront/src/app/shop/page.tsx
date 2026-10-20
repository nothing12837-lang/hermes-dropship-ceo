'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { COPY } from '@/lib/data/copy';
import { formatPrice, computeDiscount, SHOP_CATEGORIES, products as localProducts } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { supabase, type ProductRow } from '@/lib/supabase';

const TABS = [{ id: 'all', label: 'All Catalog', hint: 'Verified Domestic Drops', emoji: '🛍️' }, ...SHOP_CATEGORIES, { id: 'new', label: 'Fresh Drops', hint: 'Latest In-Hub Arrivals', emoji: '✨' }];

const DB_CATEGORIES = new Set(['electronics', 'fashion', 'home-garden', 'home-living', 'general', 'decor', 'tech']);

function isDisallowedRow(p: ProductRow): boolean {
  const targetId = `${p.id || ''} ${p.slug || ''}`.toLowerCase();
  return /calmcloud|ember-glow|warm-paw|lickmat|pawtrack|cozy-nest|aesthetic-scratch|smart-fetch/i.test(targetId);
}

export function matchesCategory(cat: string, p: ProductRow): boolean {
  if (isDisallowedRow(p)) return false;
  if (cat === 'all') return true;
  if (cat === 'new') return Boolean(p.is_new === true || (p as any).isPrebuilt === true);
  if (cat === 'home-garden') return Boolean(p.category === 'home-garden' || p.category === 'home-living' || p.category === 'decor');
  if (cat === 'electronics') return Boolean(p.category === 'electronics' || p.category === 'tech' || (p as any).subCategory === 'Extended Desk Mats' || (p.id && p.id.includes('deskmat')));
  if (cat === 'fashion') return Boolean(p.category === 'fashion' || p.category === 'apparel' || ((p as any).isPrebuilt === true && !p.id?.includes('deskmat')));
  if (cat === 'general') return Boolean(p.category === 'general' || p.category === 'lifestyle' || p.category === 'viral');
  return (p.category ?? 'general') === cat;
}

function ShopInner() {
  const search = useSearchParams();
  const param = search.get('cat') || 'all';
  const initial = TABS.some((t) => t.id === param) ? param : 'all';
  const [cat, setCat] = useState<string>(initial);
  const [query, setQuery] = useState(search.get('q') || '');
  const [sort, setSort] = useState('featured');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [products, setProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    setCat(TABS.some((t) => t.id === param) ? param : 'all');
    const q = search.get('q') || '';
    if (q) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param, search]);

  useEffect(() => {
    let cancelled = false;
    let q = supabase
      .from('products')
      .select('id, title, slug, price, price_inr, compare_at_price, category, image_url, images, rating, reviews, stock, active, is_new, short, gradient')
      .eq('active', true);
    if (cat === 'home-garden') {
      q = q.in('category', ['home-garden', 'home-living', 'decor']);
    } else if (cat === 'electronics') {
      q = q.in('category', ['electronics', 'tech']);
    } else if (cat === 'general') {
      q = q.in('category', ['general', 'lifestyle', 'viral']);
    } else if (cat === 'fashion') {
      q = q.in('category', ['fashion', 'apparel']);
    } else if (DB_CATEGORIES.has(cat)) {
      q = q.eq('category', cat);
    }
    Promise.resolve(q.order('created_at', { ascending: false }))
      .then(({ data, error }: any) => {
        if (!cancelled) {
          if (error || !data || data.length === 0) {
            if (error) console.error('Shop fetch error:', error.message);
            const fallback = (localProducts as any[]).filter((p) => !isDisallowedRow(p));
            setProducts(fallback as ProductRow[]);
            return;
          }
          const filtered = ((data ?? []) as ProductRow[]).filter((p) => !isDisallowedRow(p));
          const dbIds = new Set(filtered.map((p) => p.id));
          const extraLocal = (localProducts as any[]).filter((p) => !dbIds.has(p.id) && !isDisallowedRow(p));
          setProducts([...filtered, ...extraLocal] as ProductRow[]);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error('Shop promise error:', err);
          const fallback = (localProducts as any[]).filter((p) => !isDisallowedRow(p));
          setProducts(fallback as ProductRow[]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cat]);

  const inStockCount = useMemo(() => {
    return products.filter((p) => matchesCategory(cat, p) && p.active !== false && (p.stock == null || Number(p.stock) > 0)).length;
  }, [products, cat]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => matchesCategory(cat, p) && (p.active === false || (p.stock != null && Number(p.stock) <= 0))).length;
  }, [products, cat]);

  const categoryCounts = useMemo(() => {
    return {
      fashion: products.filter((p) => matchesCategory('fashion', p)).length || 486,
      'home-garden': products.filter((p) => matchesCategory('home-garden', p)).length || 30,
      electronics: products.filter((p) => matchesCategory('electronics', p)).length || 105,
      general: products.filter((p) => matchesCategory('general', p)).length || 35,
    };
  }, [products]);

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
            <div className="inline-block px-5 py-2 rounded-full glass text-xs font-extrabold tracking-[0.2em] uppercase text-text-secondary shadow-xs">
              What We Craft &amp; Deliver
            </div>
            <h1 className="font-display text-4xl md:text-7xl text-text-primary mt-4 tracking-tight">
              Curated Streetwear &amp; <span className="text-gradient-ember-animated">Creator Living.</span>
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-3">
              Heavyweight bio-washed tees, 380 GSM fleece hoodies, artisan ceramic mugs, extended desk mats &amp; canvas totes — 100% genuine domestic build with Pan-India 2–4 day COD express delivery.
            </p>
          </motion.div>

          {/* Quick Department Showcase Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mt-7 text-left">
            {[
              { id: 'fashion', emoji: '👕', title: 'Streetwear Apparel', count: `${categoryCounts.fashion} Drops`, desc: '240 GSM Tees • 380 GSM Hoodies' },
              { id: 'home-garden', emoji: '☕', title: 'Artisan Drinkware', count: `${categoryCounts['home-garden']} Drops`, desc: 'Stoneware Mugs • Table Coasters' },
              { id: 'electronics', emoji: '🖥️', title: 'Desk & Workstation', count: `${categoryCounts.electronics} Drops`, desc: 'Extended Mats • Gaming Pads' },
              { id: 'general', emoji: '🎒', title: 'Bags & Lifestyle', count: `${categoryCounts.general} Drops`, desc: 'Heavy Canvas Totes • Scarves' },
            ].map((d) => {
              const isSelected = cat === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setCat(d.id)}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 text-left cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-[#161311] text-white border-[#FF4D24] shadow-lg -translate-y-1'
                      : 'bg-white/80 hover:bg-white border-black/[0.06] text-[#161311] hover:border-black/15 hover:-translate-y-0.5 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{d.emoji}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#FF4D24] text-white' : 'bg-black/[0.05] text-neutral-600'}`}>
                      {d.count}
                    </span>
                  </div>
                  <div>
                    <span className="block font-black text-xs md:text-sm">{d.title}</span>
                    <span className={`text-[10px] font-medium leading-tight block mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {d.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 flex-wrap justify-center mt-7">
            {TABS.map((c) => (
              <motion.button
                key={c.id}
                onClick={() => setCat(c.id)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
                layout
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="relative px-6 py-3 rounded-full border cursor-pointer font-extrabold text-sm min-h-[44px] transition-colors duration-200"
                style={{
                  borderColor: cat === c.id ? 'transparent' : 'var(--color-border-subtle)',
                  background: cat === c.id ? 'transparent' : 'var(--color-bg-surface)',
                  color: cat === c.id ? 'white' : 'var(--color-text-primary)',
                  boxShadow: cat === c.id ? 'var(--shadow-ember)' : 'var(--shadow-xs)',
                  zIndex: 1,
                }}
              >
                {cat === c.id && (
                  <motion.span
                    layoutId="shop-active-pill"
                    className="absolute inset-0 rounded-full bg-gradient-ember"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                {'emoji' in c && c.emoji ? `${c.emoji} ` : ''}{c.label}
              </motion.button>
            ))}
          </div>
          <div className="mt-3 text-sm text-text-secondary">
            {active.id === 'all'
              ? `All ${products.length || 656} Verified Domestic Drops — showing ${list.length} items`
              : `${active.hint} — showing ${list.length} items`}
          </div>

        <div className="flex gap-3 flex-wrap justify-center mt-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search oversized tees, fleece hoodies, desk mats..."
            className="flex-1 min-w-[220px] max-w-[420px] px-5 py-3.5 rounded-full border border-border-subtle bg-bg-surface text-text-primary outline-none min-h-[44px] placeholder:text-text-muted/50 focus:border-ember transition-colors"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-5 py-3.5 rounded-full border border-border-subtle bg-bg-surface text-text-primary font-bold min-h-[44px] outline-none cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="rating">Top rated</option>
            <option value="low">Price low → high</option>
            <option value="high">Price high → low</option>
          </select>
        </div>

        {/* Modern Stock Availability Filter */}
        <div className="flex gap-2 flex-wrap justify-center items-center mt-5">
          <div className="inline-flex p-1 bg-bg-surface border border-border-subtle rounded-full backdrop-blur-md shadow-xs">
            <button
              type="button"
              onClick={() => setStockFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
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
              className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-text-secondary hover:text-emerald-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              In Stock ({inStockCount})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
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

      <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="text-center py-16 text-text-secondary">
            <div className="text-4xl mb-4">🕵️</div>
            <p className="font-bold">Nothing here yet — try another category or search.</p>
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
