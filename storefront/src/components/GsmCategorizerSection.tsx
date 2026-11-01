'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { formatPrice, computeDiscount, getGarmentSpecBadge, enforcePriceFloor, type Product } from '@/lib/data/products';

interface Props {
  products: Product[];
}

interface GsmTier {
  id: string;
  label: string;
  badge: string;
  gsmDisplay: string;
  fabricName: string;
  feel: string;
  climate: string;
  pros: string;
  cons: string;
  anchor: string;
}

const GSM_TIERS: GsmTier[] = [
  {
    id: 'all',
    label: 'All Fabric Weights',
    badge: '240–380 GSM ARCHIVE',
    gsmDisplay: 'All Weights',
    fabricName: 'The Complete RareEmber™ Textile Spectrum',
    feel: 'From 240 GSM structured cotton & aeroknit mesh to 380 GSM brushed thermal fleece.',
    climate: 'Every Indian season & climate condition.',
    pros: '100% verified factory blanks sourced directly from domestic makers.',
    cons: 'Browse all pieces to find your exact desired silhouette.',
    anchor: '/gsm',
  },
  {
    id: '380',
    label: '380 GSM Heavyweight Fleece',
    badge: '380 GSM BRUSHED FLEECE',
    gsmDisplay: '380 GSM',
    fabricName: 'Heavyweight Cotton-Poly Brushed Thermal Fleece',
    feel: 'Substantial thickness, ultra-plush thermal interior, rigid structural hood drape.',
    climate: 'Cold winter nights, hill stations, AC workspaces (10°C–20°C).',
    pros: 'Heavyweight insulation, zero hood slouch, lifetime shape retention.',
    cons: 'Substantial heft; suited for colder weather and evening streetwear.',
    anchor: '/gsm#gsm-380',
  },
  {
    id: '320',
    label: '320 GSM French Terry & Acid Wash',
    badge: '320 GSM HEAVY FLEECE',
    gsmDisplay: '320 GSM',
    fabricName: '100% Super Combed Cotton French Terry & Acid Wash Fleece',
    feel: 'Artisanal enzyme mineral wash and dense loopback French Terry fleece.',
    climate: 'Autumn, mild winter, evening streetwear (15°C–24°C).',
    pros: 'Pure cotton breathability with distinctive vintage streetwear drape.',
    cons: 'Requires gentle cold wash to preserve high-contrast enzyme tones.',
    anchor: '/gsm#gsm-320',
  },
  {
    id: '260',
    label: '260 GSM French Terry',
    badge: '260 GSM FRENCH TERRY',
    gsmDisplay: '260 GSM',
    fabricName: '100% Cotton French Terry',
    feel: 'Distinctive micro-loop interior, weighty tactile exterior, natural horizontal drape.',
    climate: 'Monsoon, transition months, year-round air-conditioned spaces (18°C–28°C).',
    pros: 'Exceptional sweat absorption from loopback weave; zero chest cling.',
    cons: 'Slightly thicker than jersey; dry time is slightly longer.',
    anchor: '/gsm#gsm-260',
  },
  {
    id: '240',
    label: '240 GSM Structured Cotton',
    badge: '240 GSM STRUCTURED COTTON',
    gsmDisplay: '240 GSM',
    fabricName: 'Super Combed Cotton & Aeroknit Mesh',
    feel: 'The gold standard of luxury streetwear. Substantial, structured, 100% opaque.',
    climate: 'Year-round daily street rotation across all Indian cities (20°C–32°C).',
    pros: 'Clean drop-shoulder drape that hangs away from the body without clinging or see-through.',
    cons: 'Noticeably heavier than fast-fashion summer mall tees.',
    anchor: '/gsm#gsm-240',
  },
];

function getProductGsm(p: Product): number {
  const str = `${p.title || ''} ${p.id || ''} ${p.badge || ''} ${p.qikinkSkuPrefix || ''} ${(p as any).blank_sku || ''}`.toLowerCase();
  if (/32493938|uh32/i.test(str)) return 380;
  if (/32493953|uh62|32493470|uh83/i.test(str)) return 320;
  if (/32476620|ut27/i.test(str)) return 260;
  return 240;
}

function toCard(rawP: Product, rank?: number) {
  const p = enforcePriceFloor(rawP);
  return {
    id: p.id,
    slug: p.slug,
    tag: getGarmentSpecBadge(p),
    tagColor: p.tagColor,
    tagBg: p.tagBg,
    title: p.title,
    desc: p.short,
    price: formatPrice(p.price_inr || p.price),
    oldPrice: p.compareAtPrice ? formatPrice(p.compareAtPrice) : undefined,
    rawPrice: p.price_inr || p.price,
    rawComparePrice: p.compareAtPrice,
    imageUrl: p.image_url,
    images: p.images,
    isPrebuilt: (p as any).isPrebuilt,
    lockedSvgMotif: (p as any).lockedSvgMotif,
    lockedGraphicTitle: (p as any).lockedGraphicTitle,
    lockedGraphicPlacement: (p as any).lockedGraphicPlacement,
    lockedAccentHex: (p as any).lockedAccentHex,
    sizes: p.sizes,
    colors: p.colors,
    chapter: undefined,
    pet: undefined,
    rating: p.rating,
    reviews: p.reviews,
    discount: computeDiscount(p.price, p.compareAtPrice, p.price_inr),
    rank,
  };
}

export default function GsmCategorizerSection({ products }: Props) {
  const [activeTierId, setActiveTierId] = useState<string>('all');

  const activeTier = useMemo(() => {
    return GSM_TIERS.find((t) => t.id === activeTierId) || GSM_TIERS[0];
  }, [activeTierId]);

  const filteredProducts = useMemo(() => {
    if (activeTierId === 'all') return products;
    if (activeTierId === '380') return products.filter((p) => getProductGsm(p) === 380);
    if (activeTierId === '320') return products.filter((p) => getProductGsm(p) === 320);
    if (activeTierId === '260') return products.filter((p) => getProductGsm(p) === 260);
    if (activeTierId === '240') return products.filter((p) => getProductGsm(p) === 240);
    return products;
  }, [products, activeTierId]);

  return (
    <section id="gsm-categorizer" className="scroll-mt-24 overflow-x-hidden">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5">
        <div>
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E04F33] font-bold mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E04F33] pulse-live-dot" />
            TECHNICAL TEXTILE ARCHIVE
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-950">
            Categorize By Exact Fabric Weight (GSM)
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-1 font-medium max-w-2xl">
            Choose your silhouette by verified fabric density. From architectural 240 GSM structured cotton to 380 GSM heavyweight thermal fleece.
          </p>
        </div>

        
      </div>

      {/* GSM FILTER TABS (DESKTOP + MOBILE HORIZONTAL SCROLL) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        {GSM_TIERS.map((tier) => {
          const isSelected = activeTierId === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setActiveTierId(tier.id)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-zinc-950 text-white shadow-md ring-2 ring-[#E04F33]/40'
                  : 'bg-white text-neutral-700 border border-black/10 hover:border-black/30 hover:bg-neutral-50'
              }`}
            >
              <span>{tier.label}</span>
              {tier.id !== 'all' && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                  {tier.gsmDisplay}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ACTIVE TIER TECHNICAL SPEC CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12100E] via-zinc-900 to-neutral-950 text-white border border-white/10 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E04F33]/20 border border-[#E04F33]/50 text-[#FF6B4A] text-[11px] font-mono font-bold tracking-wider uppercase">
                {activeTier.badge}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'} in Catalog
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {activeTier.fabricName}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
              <span className="text-neutral-400 font-semibold">Hand Feel &amp; Drape:</span> {activeTier.feel}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-400">
              <div>
                <span className="text-white font-semibold">Ideal Climate:</span> {activeTier.climate}
              </div>
              <span className="hidden sm:inline text-white/20">•</span>
              <div>
                <span className="text-emerald-400 font-semibold">Advantage:</span> {activeTier.pros}
              </div>
              {activeTier.cons && (
                <>
                  <span className="hidden sm:inline text-white/20">•</span>
                  <div>
                    <span className="text-amber-300 font-semibold">Honest Note:</span> {activeTier.cons}
                  </div>
                </>
              )}
            </div>
          </div>

          
        </div>
      </div>

      {/* PRODUCTS MATCHING THIS GSM */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-black/10 p-6">
          <p className="text-neutral-500 font-medium text-sm">No pieces currently listed for this specific GSM filter.</p>
          <button
            onClick={() => setActiveTierId('all')}
            className="mt-3 px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-bold"
          >
            Reset to All Weights
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {filteredProducts.map((p, i) => (
            <ScrollReveal key={p.id} delay={Math.min(i * 25, 200)}>
              <ProductCard {...toCard(p)} priority={i < 4} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </section>
  );
}
