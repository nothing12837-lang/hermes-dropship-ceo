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
    badge: '160–400 GSM ARCHIVE',
    gsmDisplay: 'All Weights',
    fabricName: 'The Complete RareEmber™ Textile Spectrum',
    feel: 'From featherlight 160 GSM American Supima to 400 GSM fortress-grade brushed fleece.',
    climate: 'Every Indian season & climate condition.',
    pros: '100% verified factory blanks sourced directly from domestic makers.',
    cons: 'Browse all pieces to find your exact desired silhouette.',
    anchor: '/gsm',
  },
  {
    id: '400',
    label: '400 GSM Ultra-Heavy',
    badge: '400 GSM BRUSHED FLEECE',
    gsmDisplay: '400 GSM',
    fabricName: 'Heavyweight Cotton-Poly Brushed Thermal Fleece',
    feel: 'Fortress-grade thickness, ultra-plush thermal interior, rigid structural hood.',
    climate: 'Cold winter nights, hill stations, AC workspaces (10°C–18°C).',
    pros: 'Ultimate cold-weather insulation, zero hood slouch, lifetime shape retention.',
    cons: 'Substantial heft; too warm for humid summer afternoons.',
    anchor: '/gsm#gsm-400',
  },
  {
    id: '300',
    label: '300 GSM Acid Wash',
    badge: '300 GSM ACID WASH FLEECE',
    gsmDisplay: '300 GSM',
    fabricName: '100% Super Combed Cotton French Terry Fleece',
    feel: 'Artisanal enzyme mineral wash texture, soft exterior with breathable loopback interior.',
    climate: 'Autumn, mild winter, evening streetwear (15°C–24°C).',
    pros: '100% pure cotton breathability with distinctive vintage acid-wash patina.',
    cons: 'Requires gentle cold wash to preserve vintage high-contrast enzyme tones.',
    anchor: '/gsm#gsm-300',
  },
  {
    id: '260',
    label: '260 GSM French Terry',
    badge: '260 GSM FRENCH TERRY',
    gsmDisplay: '260 GSM',
    fabricName: '100% Cotton French Terry & Tie-Dye Blends',
    feel: 'Distinctive micro-loop interior, weighty tactile exterior, natural horizontal drape.',
    climate: 'Monsoon, transition months, year-round air-conditioned spaces (18°C–28°C).',
    pros: 'Exceptional sweat absorption from loopback weave; zero chest cling.',
    cons: 'Slightly thicker than jersey; dry time is slightly longer.',
    anchor: '/gsm#gsm-260',
  },
  {
    id: '240',
    label: '240 GSM Architectural',
    badge: '240 GSM HEAVYWEIGHT',
    gsmDisplay: '240 GSM',
    fabricName: 'Super Combed Cotton, Aeroknit Mesh & Woven Canvas',
    feel: 'The gold standard of luxury streetwear. Substantial, structured, 100% opaque.',
    climate: 'Year-round daily street rotation across all Indian cities (20°C–32°C).',
    pros: 'Clean drop-shoulder drape that hangs away from the body without clinging or see-through.',
    cons: 'Noticeably heavier than fast-fashion 140 GSM summer mall tees.',
    anchor: '/gsm#gsm-240',
  },
  {
    id: '220',
    label: '220 GSM Cotton Pique',
    badge: '220 GSM AIRTEX PIQUE',
    gsmDisplay: '220 GSM',
    fabricName: '100% Super Combed Cotton Airtex Pique',
    feel: 'Classic micro-waffle honeycomb knit with structured anti-roll collar.',
    climate: 'Warm afternoons, executive casual meetings, daytime events (22°C–34°C).',
    pros: 'Engineered honeycomb ventilation for active airflow; sharp polo structure.',
    cons: 'Textured weave rather than smooth jersey finish.',
    anchor: '/gsm#gsm-220',
  },
  {
    id: '180',
    label: '180 GSM Bio-Washed',
    badge: '180 GSM SUPER COMBED',
    gsmDisplay: '180 GSM',
    fabricName: '100% Super Combed Bio-Washed Single Jersey',
    feel: 'Featherlight, ultra-soft second-skin hand feel with non-sheer bio-wash finish.',
    climate: 'Peak summer heatwaves, base-layering under hoodies/jackets (24°C–40°C).',
    pros: 'Effortless all-day breathability, quick-drying, perfect full-sleeve layering.',
    cons: 'Fluid relaxed drape rather than rigid architectural boxiness.',
    anchor: '/gsm#gsm-180',
  },
  {
    id: '160',
    label: '160–170 GSM Supima & Active',
    badge: '160–170 GSM LUXURY & SPEED',
    gsmDisplay: '160–170 GSM',
    fabricName: 'Long-Staple American Supima & Salina Quick-Dry',
    feel: 'Cashmere-silky Supima touch or weightless moisture-wicking micro-mesh.',
    climate: 'Tropical coastal humidity (Mumbai, Chennai, Goa) and workout sessions.',
    pros: 'Supima fibers are 45% stronger and never pill; Salina wicks sweat in seconds.',
    cons: 'Requires gentle cycle laundering; delicate fine-yarn weave.',
    anchor: '/gsm#gsm-160',
  },
];

function getProductGsm(p: Product): number {
  const str = `${p.title || ''} ${p.id || ''} ${p.badge || ''} ${p.qikinkSkuPrefix || ''} ${(p as any).blank_sku || ''}`.toLowerCase();
  if (/32493938|uh32/i.test(str)) return 400;
  if (/32493953|uh62/i.test(str)) return 300;
  if (/32493470|uh83|32476620|ut27|32476436|ut58/i.test(str)) return 260;
  if (/32476332|uc22|32476438|uc61|32476629|uc28|32476280|uj35|32476716|ft47/i.test(str)) return 240;
  if (/32476788|mp25/i.test(str)) return 220;
  if (/32476281|us02/i.test(str)) return 170;
  if (/32476663|uc23|32476284|ud15/i.test(str)) return 160;
  return 180;
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
    if (activeTierId === '400') return products.filter((p) => getProductGsm(p) === 400);
    if (activeTierId === '300') return products.filter((p) => getProductGsm(p) === 300);
    if (activeTierId === '260') return products.filter((p) => getProductGsm(p) === 260);
    if (activeTierId === '240') return products.filter((p) => getProductGsm(p) === 240);
    if (activeTierId === '220') return products.filter((p) => getProductGsm(p) === 220);
    if (activeTierId === '180') return products.filter((p) => getProductGsm(p) === 180);
    if (activeTierId === '160') return products.filter((p) => [160, 170].includes(getProductGsm(p)));
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
            Choose your silhouette by verified fabric density. From breathable 160 GSM American Supima to fortress-like 400 GSM winter fleece.
          </p>
        </div>

        {/* KNOW ABOUT GSM PROMINENT CTA BUTTON */}
        <Link
          href="/gsm"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white hover:bg-[#E04F33] text-xs sm:text-sm font-mono font-bold transition-all shadow-sm no-underline shrink-0 self-start sm:self-auto group"
        >
          <span>🧵 Know About GSM? Explore Full Guide</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
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
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
            <Link
              href={activeTier.anchor}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-all no-underline inline-flex items-center gap-1.5"
            >
              <span>Deep-Dive Pros &amp; Cons</span>
              <span>→</span>
            </Link>
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
