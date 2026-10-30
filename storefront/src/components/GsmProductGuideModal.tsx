'use client';

import { useState, useMemo } from 'react';

export interface GsmTierDetail {
  gsm: number;
  label: string;
  badge: string;
  composition: string;
  feel: string;
  pros: string[];
  cons: string[];
  climate: string;
  care: string;
}

export const GSM_TIERS_DATA: GsmTierDetail[] = [
  {
    gsm: 160,
    label: '160–170 GSM',
    badge: 'LUXURY SUPIMA & ACTIVE DRYFIT',
    composition: 'American Long-Staple Supima Cotton or Salina Micro-Knit Polyester',
    feel: 'Cashmere-silky Supima touch or weightless moisture-wicking micro-mesh.',
    pros: [
      'Ultra-breathable in extreme Indian heat and humidity',
      'Long-staple fibers resist pilling for years',
      'Rapid sweat evaporation and quick dry-time',
    ],
    cons: [
      'Fluid relaxed drape (not rigid boxy streetwear)',
      'Requires gentle wash cycle to protect fine yarns',
    ],
    climate: 'Peak summer heat (28°C–42°C), coastal humidity (Mumbai, Chennai, Goa), workout sessions.',
    care: 'Cold machine wash gentle, shade line dry, low iron inside-out.',
  },
  {
    gsm: 180,
    label: '180 GSM',
    badge: 'DAILY ESSENTIAL BIO-WASH',
    composition: '100% Super Combed Bio-Washed Single Jersey Cotton',
    feel: 'Silky smooth, lightweight, breathable second-skin drape.',
    pros: [
      'Effortless all-day comfort without feeling heavy',
      'Bio-wash eliminates all surface fuzz and friction',
      'Ideal weight for full-sleeve tees and warm weather layering',
    ],
    cons: [
      'More fluid silhouette than heavyweight 240 GSM drops',
      'Can show subtle body contouring when wet',
    ],
    climate: 'Year-round daily wear (22°C–38°C), under jackets/hoodies, summer days.',
    care: 'Machine wash cold (30°C max) inside-out, line dry in shade.',
  },
  {
    gsm: 220,
    label: '220 GSM',
    badge: 'AIRTEX HONEYCOMB PIQUE',
    composition: '100% Super Combed Cotton Micro-Waffle Pique Knit',
    feel: 'Structured, breathable honeycomb texture with anti-roll ribbing.',
    pros: [
      'Engineered air channels allow continuous ventilation',
      'Holds sharp collar shape through 50+ washes',
      'Premium smart-casual executive appearance',
    ],
    cons: [
      'Textured micro-waffle finish rather than smooth jersey',
      'Heavier than daily 180 GSM crews',
    ],
    climate: 'Warm afternoons, executive casual settings, breezy evenings (20°C–34°C).',
    care: 'Wash cold inside-out, button collar before washing, flat dry.',
  },
  {
    gsm: 240,
    label: '240 GSM',
    badge: 'ARCHITECTURAL STREETWEAR',
    composition: '100% Super Combed Bio-Washed Heavyweight Cotton / Aeroknit',
    feel: 'The gold standard of luxury streetwear. Substantial, structured, crisp.',
    pros: [
      'Iconic drop-shoulder silhouette that hangs away from the body',
      '100% opaque (completely zero see-through under bright light)',
      'Pre-shrunk compacted yarn eliminates post-wash warping',
      'Anti-pilling, museum-grade canvas for high-density DTF graphics',
    ],
    cons: [
      'Heavier than fast-fashion summer mall tees (140 GSM)',
      'Takes slightly longer to line dry due to fiber density',
    ],
    climate: 'Year-round streetwear rotation across all Indian cities (18°C–34°C).',
    care: 'Turn inside-out, wash cold (≤ 30°C), shade dry, iron inside-out.',
  },
  {
    gsm: 260,
    label: '260 GSM',
    badge: 'FRENCH TERRY & TIE-DYE',
    composition: '100% Cotton French Terry Loop-Back & Heavy Blends',
    feel: 'Distinctive textured micro-loops inside, velvety tactile exterior.',
    pros: [
      'Natural moisture-wicking loops absorb perspiration rapidly',
      'Relaxed boxy silhouette with clean shoulder drape',
      'Substantial tactile weight with exceptional skin softness',
    ],
    cons: [
      'Heavier loop-knit construction requires shaded flat drying',
    ],
    climate: 'Monsoon, transition months, air-conditioned rooms, breezy evenings (18°C–28°C).',
    care: 'Machine wash cold inside-out, reshape when damp, flat or line dry.',
  },
  {
    gsm: 300,
    label: '300 GSM',
    badge: 'VINTAGE ACID WASH FLEECE',
    composition: '100% Super Combed Cotton French Terry Fleece',
    feel: 'Artisanal enzyme mineral wash texture, soft shell with loopback interior.',
    pros: [
      'Pure 100% cotton breathability in a true fleece hoodie',
      'One-of-a-kind vintage marbled patina on every piece',
      'Substantial weight without synthetic poly sweating',
    ],
    cons: [
      'Requires mild detergent to protect high-contrast vintage wash patina',
    ],
    climate: 'Autumn, mild winter, air-conditioned creator studios (14°C–24°C).',
    care: 'Wash separately in cold water with gentle liquid detergent, shade dry.',
  },
  {
    gsm: 320,
    label: '320–350 GSM',
    badge: 'MID-HEAVY FLEECE & VARSITY',
    composition: 'Super Combed Cotton & Poly-Fleece Heavy Blend',
    feel: 'Thick, insulating, cozy brushed interior with structured shell.',
    pros: [
      'Dense thermal insulation against chilly winds',
      'Rigid collar and ribbed cuffs that never lose tension',
      'Substantial luxury drape that holds its shape all day',
    ],
    cons: [
      'Substantial winter heft; too warm for humid daytime heat',
    ],
    climate: 'Winter months, nighttime travel, northern India winters (10°C–20°C).',
    care: 'Turn inside-out, wash cold on gentle cycle, dry flat.',
  },
  {
    gsm: 400,
    label: '400 GSM',
    badge: 'ULTRA-HEAVYWEIGHT BRUSHED FLEECE',
    composition: 'Heavyweight Cotton-Poly Thermal Brushed Fleece',
    feel: 'Fortress-grade thickness, ultra-dense thermal interior, rigid hood.',
    pros: [
      'Maximum thermal insulation engineered for deep winter',
      'Double-layered structured hood that never slouches or collapses',
      'Armor-like streetwear presence built for a lifetime',
    ],
    cons: [
      'Very heavy garment; exclusively for cold weather and hill stations',
    ],
    climate: 'Deep winter, hill stations (Manali, Shimla, Ooty), cold AC nights (8°C–18°C).',
    care: 'Cold wash gentle cycle, avoid heat tumble dryers, reshape and dry flat.',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentGsm?: number;
}

export default function GsmProductGuideModal({ isOpen, onClose, currentGsm = 240 }: Props) {
  // Find matching tier or default to 240
  const initialTierGsm = useMemo(() => {
    if (currentGsm >= 380) return 400;
    if (currentGsm >= 320) return 320;
    if (currentGsm >= 290) return 300;
    if (currentGsm >= 250) return 260;
    if (currentGsm >= 230) return 240;
    if (currentGsm >= 200) return 220;
    if (currentGsm >= 175) return 180;
    return 160;
  }, [currentGsm]);

  const [selectedGsm, setSelectedGsm] = useState<number>(initialTierGsm);

  const activeTier = useMemo(() => {
    return GSM_TIERS_DATA.find((t) => t.gsm === selectedGsm) || GSM_TIERS_DATA[3];
  }, [selectedGsm]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gsm-guide-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-black/10 relative my-auto max-h-[90vh] overflow-y-auto"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-black/[0.08] pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🧵</span>
              <h3 id="gsm-guide-title" className="text-base sm:text-lg font-black text-zinc-950 tracking-tight">
                Garment Fabric &amp; GSM Guide
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              GSM = Grams per Square Meter. Defines fabric thickness &amp; drape.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm shrink-0"
            aria-label="Close guide"
          >
            ✕
          </button>
        </div>

        {/* QUICK EXPLAINER */}
        <div className="p-3 rounded-xl bg-neutral-50 border border-black/[0.06] text-xs text-neutral-700 leading-relaxed mb-4">
          <p>
            <strong>Why GSM Matters:</strong> Cheap mall tees use <strong>130–150 GSM</strong> (flimsy, transparent, twists after 2 washes). RareEmber uses <strong>180 to 400 GSM</strong> verified blanks for structured, long-lasting silhouettes that never cling.
          </p>
        </div>

        {/* TIER SELECTOR PILLS */}
        <div className="mb-4">
          <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-2 flex items-center justify-between">
            <span>Select Fabric Weight:</span>
            {currentGsm > 0 && (
              <span className="text-[#E04F33] font-bold">
                This Piece: {currentGsm} GSM
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {GSM_TIERS_DATA.map((tier) => {
              const isSelected = tier.gsm === selectedGsm;
              const isCurrent = tier.gsm === initialTierGsm;
              return (
                <button
                  key={tier.gsm}
                  type="button"
                  onClick={() => setSelectedGsm(tier.gsm)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-zinc-950 text-white shadow-sm ring-2 ring-[#E04F33]/40'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <span>{tier.label}</span>
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E04F33]" title="Current Garment" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE TIER DETAIL CARD */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#12100E] via-zinc-900 to-neutral-950 text-white border border-white/10 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E04F33]/25 text-[#FF6B4A] text-[10px] font-mono font-bold tracking-wider">
              {activeTier.badge}
            </span>
            {activeTier.gsm === initialTierGsm && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                ✓ Matches This Product
              </span>
            )}
          </div>

          <div>
            <div className="text-[11px] text-neutral-400 font-medium">Composition</div>
            <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
              {activeTier.composition}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-neutral-400 font-medium">Hand Feel &amp; Drape</div>
            <div className="text-xs text-neutral-200 mt-0.5 leading-relaxed">
              {activeTier.feel}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
              <span className="font-bold text-emerald-400 text-[11px] block">✓ Pros (Advantages):</span>
              <ul className="list-disc pl-3.5 space-y-1 text-[11px] text-neutral-300">
                {activeTier.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
              <span className="font-bold text-amber-300 text-[11px] block">⚠ Honest Trade-Offs:</span>
              <ul className="list-disc pl-3.5 space-y-1 text-[11px] text-neutral-300">
                {activeTier.cons.map((con, i) => (
                  <li key={i}>{con}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-2 text-[11px] space-y-1">
            <p>
              <strong className="text-white">Optimal Indian Climate:</strong>{' '}
              <span className="text-neutral-300">{activeTier.climate}</span>
            </p>
            <p>
              <strong className="text-white">Garment Care:</strong>{' '}
              <span className="text-neutral-300">{activeTier.care}</span>
            </p>
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[11px] text-neutral-500">
            All factory blanks verified by RareEmber™
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-950 text-white hover:bg-neutral-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Got It — Back to Garment
          </button>
        </div>
      </div>
    </div>
  );
}
