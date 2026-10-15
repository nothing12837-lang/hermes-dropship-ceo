'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { ScrollReveal } from './ScrollReveal';
import { formatPrice, computeDiscount, type Product } from '@/lib/data/products';

interface ViralDropsSectionProps {
  products: Product[];
}

function toCard(p: Product, rank?: number) {
  return {
    id: p.id,
    slug: p.slug,
    emoji: p.emoji || '🔥',
    tag: p.tag || 'Trending',
    tagColor: p.tagColor || '#FF4D24',
    tagBg: p.tagBg || 'rgba(255, 77, 36, 0.12)',
    title: p.title,
    desc: p.short,
    price: formatPrice(p.price_inr || p.price),
    oldPrice: p.compareAtPrice ? formatPrice(p.compareAtPrice) : undefined,
    rawPrice: p.price_inr || p.price,
    rawComparePrice: p.compareAtPrice,
    gradient: p.gradient || 'linear-gradient(135deg, #18181b, #09090b)',
    imageUrl: p.image_url,
    rating: p.rating,
    reviews: p.reviews,
    discount: computeDiscount(p.price, p.compareAtPrice, p.price_inr),
    rank,
  };
}

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All 50 Drops', emoji: '🔥', count: 50 },
  { id: 'anime', label: 'Anime & Cyberpunk', emoji: '👁️', count: 10 },
  { id: 'indic', label: 'Cyber Indic', emoji: '🔱', count: 8 },
  { id: 'gym', label: 'Gym & Iron', emoji: '⚡', count: 8 },
  { id: 'stoic', label: 'Stoic & Dark Academia', emoji: '🏛️', count: 8 },
  { id: 'synth', label: 'Retro & Synthwave', emoji: '🌆', count: 8 },
  { id: 'creator', label: 'Dev & Workspace', emoji: '💻', count: 8 },
];

const TYPE_FILTERS = [
  { id: 'all_types', label: 'All Silhouettes' },
  { id: 'oversized_tee', label: '👕 240 GSM Oversized Tees (₹699)' },
  { id: 'hoodie', label: '🧥 380 GSM Heavy Hoodies (₹1,299)' },
  { id: 'classic_tee', label: '✨ 180 GSM Classic Tees (₹499)' },
  { id: 'drinkware', label: '☕ Ceramic Mugs & Tumblers' },
  { id: 'desk_tote', label: '🖥️ Extended Desk Mats & Totes' },
];

export default function ViralDropsSection({ products }: ViralDropsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all_types');
  const [visibleLimit, setVisibleLimit] = useState<number>(12);

  const filteredProducts = useMemo(() => {
    let list = products;

    // Filter by Niche Category
    if (selectedCategory !== 'all') {
      list = list.filter((p) => {
        const text = `${p.id} ${p.title} ${p.short} ${p.story}`.toLowerCase();
        switch (selectedCategory) {
          case 'anime':
            return (
              text.includes('gojo') ||
              text.includes('sukuna') ||
              text.includes('monarch') ||
              text.includes('tokyo') ||
              text.includes('samurai') ||
              text.includes('itachi') ||
              text.includes('akatsuki') ||
              text.includes('gtr') ||
              text.includes('titan') ||
              text.includes('evangelion')
            );
          case 'indic':
            return (
              text.includes('mahadev') ||
              text.includes('rudra') ||
              text.includes('hanuman') ||
              text.includes('trishul') ||
              text.includes('sacred om') ||
              text.includes('varanasi') ||
              text.includes('bengal tiger') ||
              text.includes('bhagavad') ||
              text.includes('filter coffee')
            );
          case 'gym':
            return (
              text.includes('pump cover') ||
              text.includes('no days off') ||
              text.includes('berserk') ||
              text.includes('guts') ||
              text.includes('iron therapy') ||
              text.includes('raw power') ||
              text.includes('progressive overload') ||
              text.includes('discipline') ||
              text.includes('beast mode')
            );
          case 'stoic':
            return (
              text.includes('memento mori') ||
              text.includes('amor fati') ||
              text.includes('marcus aurelius') ||
              text.includes('meditations') ||
              text.includes('the thinker') ||
              text.includes('dead poets') ||
              text.includes('raven') ||
              text.includes('sisyphus')
            );
          case 'synth':
            return (
              text.includes('outrun') ||
              text.includes('lo-fi') ||
              text.includes('cassette') ||
              text.includes('cyberwave') ||
              text.includes('sunset palm') ||
              text.includes('glitch') ||
              text.includes('pixel') ||
              text.includes('synthwave')
            );
          case 'creator':
            return (
              text.includes('git commit') ||
              text.includes('404') ||
              text.includes('linux') ||
              text.includes('clean code') ||
              text.includes('dark mode') ||
              text.includes('mechanical keyboard') ||
              text.includes('terminal') ||
              text.includes('eat sleep code')
            );
          default:
            return true;
        }
      });
    }

    // Filter by Silhouette Type
    if (selectedType !== 'all_types') {
      list = list.filter((p) => {
        const titleLower = p.title.toLowerCase();
        switch (selectedType) {
          case 'oversized_tee':
            return titleLower.includes('oversized');
          case 'hoodie':
            return titleLower.includes('hoodie') || titleLower.includes('sweatshirt');
          case 'classic_tee':
            return titleLower.includes('classic') || (titleLower.includes('tee') && !titleLower.includes('oversized'));
          case 'drinkware':
            return titleLower.includes('mug') || titleLower.includes('tumbler');
          case 'desk_tote':
            return titleLower.includes('mat') || titleLower.includes('tote');
          default:
            return true;
        }
      });
    }

    return list;
  }, [products, selectedCategory, selectedType]);

  const displayed = filteredProducts.slice(0, visibleLimit);
  const hasMore = visibleLimit < filteredProducts.length;

  return (
    <section className="relative rounded-3xl bg-gradient-to-b from-white via-neutral-50/60 to-white border border-black/[0.08] p-5 sm:p-7 md:p-9 shadow-[0_12px_44px_rgba(48,26,12,0.06)] overflow-hidden">
      {/* Decorative ambient aurora background glow */}
      <span
        aria-hidden
        className="aurora-blob pointer-events-none"
        style={{ width: 380, height: 380, top: -140, right: -120, background: 'rgba(255, 77, 36, 0.12)' }}
      />
      <span
        aria-hidden
        className="aurora-blob pointer-events-none"
        style={{ width: 320, height: 320, bottom: -100, left: -80, background: 'rgba(247, 183, 51, 0.12)' }}
      />

      <div className="relative z-10">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-ember text-white text-[11px] font-black uppercase tracking-wider shadow-ember">
              <span>🔥</span>
              <span>50 VIRAL TRENDING DROPS • LIVE ON STOREFRONT</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-[#1C1310] leading-tight">
              India&apos;s Most Wanted <span className="text-gradient-ember">Streetwear &amp; Creator</span> Culture
            </h2>
            <p className="text-xs md:text-sm text-neutral-600 font-medium leading-relaxed">
              Curated across Anime, Cyber-Indic, Gym Motivation, Dark Academia, Retro Lo-Fi &amp; Minimalist Dev aesthetics.
              Dispatched direct from Tirupur Hub with 1-Click COD &amp; 7-Day Easy Replacements.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-emerald-700 flex items-center justify-end gap-1.5">
                <span className="live-dot w-2 h-2 rounded-full bg-emerald-500" />
                All 50 SKUs Ready to Ship
              </span>
              <span className="text-[11px] text-neutral-500 font-semibold">Cash on Delivery Across 19,000+ PIN Codes</span>
            </div>
          </div>
        </div>

        {/* CATEGORY NICHE TABS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setVisibleLimit(12);
                }}
                className={`cursor-pointer px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#1C1310] text-white border-[#1C1310] shadow-md scale-[1.02]'
                    : 'bg-white/80 text-neutral-700 border-black/[0.08] hover:bg-neutral-100 hover:border-black/20'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* SILHOUETTE QUICK FILTER PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6 border-b border-black/[0.05]">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
            Silhouette:
          </span>
          {TYPE_FILTERS.map((type) => {
            const isActive = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  setVisibleLimit(12);
                }}
                className={`cursor-pointer px-3 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#FF4D24]/10 text-[#FF4D24] border-[#FF4D24]/40 font-black'
                    : 'bg-transparent text-neutral-600 border-transparent hover:bg-neutral-100/80 hover:text-neutral-900'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        {/* PRODUCT GRID */}
        {displayed.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-4xl">🔍</span>
            <h3 className="text-base font-bold text-neutral-800 mt-2">No items match this filter</h3>
            <p className="text-xs text-neutral-500 mt-1">Try selecting another silhouette or niche category tab above.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedType('all_types');
              }}
              className="mt-4 px-4 py-2 rounded-full bg-[#1C1310] text-white text-xs font-bold border-none cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayed.map((p, idx) => (
              <ScrollReveal key={p.id} delay={(idx % 4) * 40}>
                <ProductCard {...toCard(p, idx + 1)} />
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* SHOW MORE / EXPLORE ALL BUTTON */}
        {hasMore && (
          <div className="mt-10 flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => setVisibleLimit((prev) => Math.min(prev + 12, filteredProducts.length))}
              className="cursor-pointer px-8 py-3.5 rounded-full bg-[#1C1310] text-white text-xs md:text-sm font-black tracking-wide border-none shadow-lg hover:bg-[#FF4D24] hover:shadow-ember hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center gap-2"
            >
              <span>Load More Trending Drops ({filteredProducts.length - visibleLimit} Remaining)</span>
              <span>⚡</span>
            </button>
            <span className="text-[11px] text-neutral-500 font-semibold">
              Showing {displayed.length} of {filteredProducts.length} curated drops
            </span>
          </div>
        )}

        {/* TRUST BANNER BOTTOM FOOTER */}
        <div className="mt-10 pt-6 border-t border-black/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-white/60 border border-black/[0.04]">
            <span className="text-base">👕</span>
            <div className="text-xs font-black text-neutral-900 mt-1">240 GSM Combed Cotton</div>
            <div className="text-[10px] text-neutral-500 font-medium">Heavy drape drop-shoulder</div>
          </div>
          <div className="p-3 rounded-xl bg-white/60 border border-black/[0.04]">
            <span className="text-base">🧥</span>
            <div className="text-xs font-black text-neutral-900 mt-1">380 GSM Heavy Fleece</div>
            <div className="text-[10px] text-neutral-500 font-medium">Double-layer structured hoods</div>
          </div>
          <div className="p-3 rounded-xl bg-white/60 border border-black/[0.04]">
            <span className="text-base">💵</span>
            <div className="text-xs font-black text-neutral-900 mt-1">1-Click Cash on Delivery</div>
            <div className="text-[10px] text-neutral-500 font-medium">Zero online payment risk</div>
          </div>
          <div className="p-3 rounded-xl bg-white/60 border border-black/[0.04]">
            <span className="text-base">🚚</span>
            <div className="text-xs font-black text-neutral-900 mt-1">Direct Tirupur Hub</div>
            <div className="text-[10px] text-neutral-500 font-medium">2–4 days express air dispatch</div>
          </div>
        </div>
      </div>
    </section>
  );
}
