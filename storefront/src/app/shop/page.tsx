'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import { COPY } from '@/lib/data/copy';
import { formatPrice, computeDiscount, getGarmentSpecBadge, enforcePriceFloor, isKidsProduct, SHOP_CATEGORIES, matchesCategory, products as localProducts } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { type ProductRow } from '@/lib/supabase';

const TABS = [
  { id: 'all', label: 'All Collection', count: 18, hint: 'Independent Luxury Streetwear Drops' },
  ...SHOP_CATEGORIES,
];

function isDisallowedRow(p: ProductRow): boolean {
  if (isKidsProduct(p as any)) return true;
  const targetId = `${p.id || ''} ${p.slug || ''} ${p.title || ''}`.toLowerCase();
  if (/(gateway|test[-_ ]?pass|test[-_ ]?sku|sandbox|verification|64953488|64953664|32476832|32476744)/i.test(targetId)) return true;
  return /calmcloud|ember-glow|warm-paw|lickmat|pawtrack|cozy-nest|aesthetic-scratch|smart-fetch|button-badge|temporary-tattoo|scrunchies|bookmark|balaclava|arm sleeve|full[-_ ]?sleeve|basic[-_ ]?t[-_ ]?shirt|classic[-_ ]?crew|round[-_ ]?neck[-_ ]?t[-_ ]?shirt|raglan|ringer|v[-_ ]?neck|stretch[-_ ]?t[-_ ]?shirt|dry[-_ ]?fit|dryfit|polo|sleeveless|tank|crop|baby[-_ ]?tee|t-shirt[-_ ]?dress|maternity|supima|kaftan|shorts|legging|stole|apron|drawstring|tote|poster|mug|puzzle|notebook|sketchbook|water[-_ ]?bottle|tapestry|pillow|cushion|case|bandana|mask|cap|hat|patches|greeting|sticker|coaster|planner|sipper|tablerunner|tumbler|bra|headband|bike[-_ ]?rider/i.test(targetId);
}

export { matchesCategory };


const shopCollectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'RareEmber™ — Luxury Streetwear Collection',
  description: 'Modern Streetwear. Timeless Cuts. Statement art & refined silhouettes crafted for the rare, never the crowd.',
  url: 'https://www.rareember.shop/shop',
  brand: {
    '@type': 'Brand',
    name: 'RareEmber',
  },
  isPartOf: {
    '@type': 'WebSite',
    name: 'RareEmber',
    url: 'https://www.rareember.shop',
  },
};

const shopFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do RareEmber streetwear silhouettes fit compared to standard retail?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All RareEmber pieces feature an authentic architectural drop-shoulder cut with generous chest and sleeve volume. Engineered to hang with substantial, structured drape without clinging. If you prefer a tailored streetwear drape, select your true size; for an exaggerated high-street volume, size up one size.',
      },
    },
    {
      '@type': 'Question',
      name: 'How should I care for RareEmber 240 GSM tees and 380 GSM fleece garments?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Turn garments inside-out before laundering. Machine wash on a gentle cycle in cold water with mild liquid detergent. Line dry in the shade to maintain cotton fiber integrity and prevent shrinkage. Never iron directly on archival graphic prints.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are your delivery timelines across India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We provide complimentary express air shipping across 29,000+ PIN codes in India via BlueDart Air and Delhivery. Orders are prepared within 24 to 48 hours and arrive at your doorstep within 3 to 5 business days with full milestone tracking.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the RareEmber 7-Day Doorstep Size Exchange Policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We guarantee a 7-day doorstep size exchange. If the silhouette or size does not fit your proportions as desired, initiate an exchange via our /returns portal. Our logistics partner will pick up the piece from your doorstep and deliver your replacement free of charge.',
      },
    },
  ],
};

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
    let mounted = true;
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (mounted && data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products as unknown as ProductRow[]);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
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
        <div className="max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
          <span className="text-xs sm:text-sm font-mono font-bold text-[#E04F33] uppercase tracking-wider block mb-2">
            Catalog &amp; Drops
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0D0D0F] tracking-tight">
            All Garments &amp; Graphic Drops
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto mt-2 font-medium">
            240 GSM combed cotton tees, 320–380 GSM fleece outerwear &amp; curated workstation gear. Directly sourced from verified makers with free express air delivery.
          </p>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2 px-1 max-w-full justify-start sm:justify-center mt-6">
            {TABS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
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
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold cursor-pointer transition-all ${
                  stockFilter === 'all' ? 'bg-[#12100E] text-white' : 'text-neutral-600'
                }`}
              >
                All ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('in_stock')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  stockFilter === 'in_stock' ? 'bg-[#12100E] text-white' : 'text-neutral-600'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] pulse-live-dot" />
                <span>In Stock ({inStockCount})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <div className="max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-8 overflow-x-hidden">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-zinc-200/80">
          <div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E04F33] font-bold mb-0.5">
              Store Catalog
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {active.label}
            </h2>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-neutral-500 bg-white px-3 py-1 rounded-full border border-black/10">
            {list.length} {list.length === 1 ? 'drop' : 'drops'}
          </span>
        </div>

        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          <AnimatePresence mode="popLayout">
            {list.map((rawP, i) => {
              const p = enforcePriceFloor(rawP as any);
              return (
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
                  tag={getGarmentSpecBadge(p)}
                  title={p.title}
                  desc={(p as any).short || (p as any).description || ''}
                  price={formatPrice(Number(p.price_inr || p.price))}
                  oldPrice={p.compareAtPrice ? formatPrice(Number(p.compareAtPrice)) : undefined}
                  rawPrice={Number(p.price_inr || p.price)}
                  rawComparePrice={p.compareAtPrice ? Number(p.compareAtPrice) : undefined}
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
            );
            })}
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopCollectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopFaqSchema) }}
      />
      <Suspense>
        <ShopInner />
      </Suspense>
    </>
  );
}
