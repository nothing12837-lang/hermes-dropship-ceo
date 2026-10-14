'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { COPY } from '@/lib/data/copy';
import { formatPrice, computeDiscount, SHOP_CATEGORIES } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { supabase, type ProductRow } from '@/lib/supabase';

const TABS = [{ id: 'all', label: 'All', hint: 'Everything', emoji: '🛍️' }, ...SHOP_CATEGORIES, { id: 'new', label: 'New In', hint: 'Fresh drops', emoji: '✨' }];

const DB_CATEGORIES = new Set(['electronics', 'fashion', 'home-garden', 'general']);

function isDisallowedRow(p: ProductRow): boolean {
  const text = `${p.id || ''} ${p.slug || ''} ${p.category || ''} ${p.title || ''} ${(p as any).description || ''} ${(p as any).short || ''}`.toLowerCase();
  return /calmcloud|ember-glow|warm-paw|lickmat|pawtrack|cozy-nest|aesthetic-scratch|smart-fetch|disinfectant|medicine|medicinal|pharma|ortho|anxiety|pet|dog|cat|veterinary|therapy|healing|antibacterial|sanitizer/i.test(text);
}

export function matchesCategory(cat: string, p: ProductRow): boolean {
  if (isDisallowedRow(p)) return false;
  if (cat === 'all') return true;
  if (cat === 'new') return p.is_new === true;
  if (cat === 'home-garden') return p.category === 'home-garden' || p.category === 'home-living';
  if (cat === 'general') return p.category === 'general' || p.category === 'lifestyle' || p.category === 'viral';
  return (p.category ?? 'general') === cat;
}

function ShopInner() {
  const search = useSearchParams();
  const param = search.get('cat') || 'all';
  const initial = TABS.some((t) => t.id === param) ? param : 'all';
  const [cat, setCat] = useState<string>(initial);
  const [query, setQuery] = useState(search.get('q') || '');
  const [sort, setSort] = useState('featured');
  const [products, setProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    setCat(TABS.some((t) => t.id === param) ? param : 'all');
    const q = search.get('q') || '';
    if (q) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param, search]);

  useEffect(() => {
    let cancelled = false;
    let q = supabase.from('products').select('*').eq('active', true);
    if (DB_CATEGORIES.has(cat)) q = q.eq('category', cat);
    q.order('created_at', { ascending: false }).then(({ data }) => {
      if (!cancelled) {
        const filtered = ((data ?? []) as ProductRow[]).filter((p) => !isDisallowedRow(p));
        setProducts(filtered);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cat]);

  const list = useMemo(() => {
    let l = products.filter((p) => matchesCategory(cat, p));
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
  }, [products, cat, query, sort]);

  const active = TABS.find((c) => c.id === cat) ?? TABS[0];

  return (
    <main className="page-top min-h-screen bg-bg-base">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-block px-5 py-2 rounded-full bg-bg-surface border border-border-subtle text-xs font-extrabold tracking-[0.2em] uppercase text-text-secondary backdrop-blur-sm">
            The Everything Store
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-text-primary mt-5">
            Everything. <span className="text-gradient-ember">Everyday.</span>
          </h1>
          <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto mt-4">
            Every rare find in one place — filter by vibe or search the whole stash.
          </p>
        </motion.div>

        <div className="flex gap-3 flex-wrap justify-center mt-9">
          {TABS.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => setCat(c.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-3 rounded-full border cursor-pointer font-extrabold text-sm min-h-[44px] transition-all duration-200"
              style={{
                borderColor: cat === c.id ? 'var(--color-ember)' : 'var(--color-border-subtle)',
                background: cat === c.id ? 'var(--color-ember)' : 'var(--color-bg-surface)',
                color: cat === c.id ? 'white' : 'var(--color-text-primary)',
                boxShadow: cat === c.id ? '0 10px 30px rgba(255,107,53,0.3)' : 'none',
              }}
            >
              {'emoji' in c && c.emoji ? `${c.emoji} ` : ''}{c.label}
            </motion.button>
          ))}
        </div>
        <div className="mt-3 text-sm text-text-secondary">
          {active.hint} — showing {list.length} items
        </div>

        <div className="flex gap-3 flex-wrap justify-center mt-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search everything… e.g. earbuds, lamp, sneakers"
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
      </div>

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
                  chapter={p.chapter || undefined}
                  pet={undefined}
                  rating={Number(p.rating ?? 4.3)}
                  reviews={Number(p.reviews ?? 120)}
                  discount={computeDiscount(
                    Number(p.price),
                    p.compare_at_price ? Number(p.compare_at_price) : undefined,
                    (p as any).price_inr ? Number((p as any).price_inr) : undefined
                  )}
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
