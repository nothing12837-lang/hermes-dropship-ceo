'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import { COPY } from '@/lib/data/copy';
import { formatPrice, computeDiscount, SHOP_CATEGORIES, products as localProducts } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { type ProductRow } from '@/lib/supabase';

const TABS = [
  { id: 'all', label: 'All Catalog', count: 33, hint: 'Complete Domestic Hub Drops' },
  ...SHOP_CATEGORIES,
];

function isDisallowedRow(p: ProductRow): boolean {
  const targetId = `${p.id || ''} ${p.slug || ''} ${p.title || ''}`.toLowerCase();
  return /calmcloud|ember-glow|warm-paw|lickmat|pawtrack|cozy-nest|aesthetic-scratch|smart-fetch|button-badge|button_badge|button badge|temporary-tattoo|temporary tattoo|tattoo|scrunchies|bow scrunchie|bookmark|balaclava|arm sleeves|arm sleeve|basic t-shirt pc|^bundle-|bundle/i.test(targetId);
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
    <main className="page-top min-h-screen text-[#0D0D0F] pb-20">
      {/* Editorial Catalog Header */}
      <section className="bg-[#F3F0EA] border-b border-black/[0.08] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <span className="text-xs font-mono font-bold text-[#E04F33] uppercase tracking-wider block mb-2">
            Catalog &amp; Drops
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0D0D0F] tracking-tight">
            All Garments &amp; Graphic Drops
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto mt-2 font-medium">
            240 GSM combed cotton tees, French terry hoodies &amp; blank silhouettes. Dispatched pan-India from Tirupur Hub.
          </p>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2 px-1 max-w-full justify-start sm:justify-center mt-6">
            {TABS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                  cat === c.id
                    ? 'bg-[#12100E] text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-black/10 hover:border-black/30'
                }`}
              >
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* Search, Sort & Availability */}
          <div className="flex gap-2.5 sm:gap-3 flex-wrap justify-center items-center mt-5 max-w-xl mx-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drops, fabric, colors..."
              className="flex-1 min-w-[200px] px-3.5 py-2 rounded-lg border border-black/15 bg-white text-[#12100E] text-xs sm:text-sm outline-none placeholder:text-neutral-400 focus:border-[#12100E] transition-colors"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-lg border border-black/15 bg-white text-[#12100E] text-xs sm:text-sm font-bold outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
            </select>
            <div className="flex rounded-lg border border-black/15 bg-white overflow-hidden p-0.5">
              <button
                type="button"
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all ${
                  stockFilter === 'all' ? 'bg-[#12100E] text-white' : 'text-neutral-600'
                }`}
              >
                All ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('in_stock')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all ${
                  stockFilter === 'in_stock' ? 'bg-[#12100E] text-white' : 'text-neutral-600'
                }`}
              >
                In Stock ({inStockCount})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8">
        <div className="text-xs font-semibold text-neutral-500 mb-4">
          Showing {list.length} drops in {active.label}
        </div>

        <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.04 }}
              >
                <ProductCard
                  id={p.id}
                  slug={(p as any).slug || undefined}
                  tag={(p as any).tag || ((p as any).is_printed ? 'Graphic Print' : 'Essential Blank')}
                  title={p.title}
                  desc={(p as any).short || p.description || ''}
                  price={formatPrice(Number((p as any).price_inr || p.price))}
                  oldPrice={p.compare_at_price ? formatPrice(Number(p.compare_at_price)) : undefined}
                  rawPrice={Number((p as any).price_inr || p.price)}
                  rawComparePrice={p.compare_at_price ? Number(p.compare_at_price) : undefined}
                  imageUrl={resolveProductImage(p.id, p.image_url)}
                  images={(p as any).images}
                  sizes={(p as any).sizes}
                  colors={(p as any).colors}
                  chapter={p.chapter || undefined}
                  discount={computeDiscount(
                    Number(p.price),
                    p.compare_at_price ? Number(p.compare_at_price) : undefined,
                    (p as any).price_inr ? Number((p as any).price_inr) : undefined
                  )}
                  inStock={p.active !== false && (p.stock == null || Number(p.stock) > 0)}
                  stock={p.stock != null ? Number(p.stock) : undefined}
                  priority={i < 4}
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
          <div className="max-w-md mx-auto text-center py-16 px-6 rounded-xl bg-white border border-black/10 my-8">
            <h3 className="text-base font-bold text-[#12100E] mb-1">No drops found</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Try adjusting your search query or switching to another category.
            </p>
            <button
              onClick={() => { setQuery(''); setCat('all'); setStockFilter('all'); }}
              className="px-4 py-2 rounded-lg bg-[#12100E] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
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
