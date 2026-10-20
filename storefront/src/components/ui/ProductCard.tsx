'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/store/cart';
import { useWishlist } from '@/lib/store/wishlist';
import { cleanBrandTitle } from '@/lib/data/products';
import PrebuiltMockupRenderer from '@/components/PrebuiltMockupRenderer';
import { useGeo } from '@/context/GeoContext';

const BUNDLE_ITEM_NAMES: Record<string, string> = {
  'bundle-winter-spec-ops': '380 GSM Hoodie + Fleece Joggers',
  'bundle-3am-coder': '380 GSM Hoodie + Desk Mat + Mug',
  'bundle-college-fest-varsity': 'Varsity Jacket + 240 GSM Tee',
  'bundle-winter-layering': '380 GSM Hoodie + Acid-Wash Tee',
  'bundle-crewneck-workstation': '320 GSM Crewneck + Desk Mat',
  'bundle-streetwear-duo': '2x Heavyweight Oversized Tees',
  'bundle-founding-50': '240 GSM Tee + 900×400mm Desk Mat',
  'bundle-creator-workstation': 'Desk Mat + Heavyweight Tee + Mug',
  'bundle-winter-heavyweight': '380 GSM Hoodie + Heavyweight Tee',
};

interface ProductCardProps {
  id: string;
  slug?: string;
  emoji?: string;
  tag?: string;
  tagColor?: string;
  tagBg?: string;
  title: string;
  desc?: string;
  price: string;
  oldPrice?: string;
  rawPrice?: number;
  rawComparePrice?: number;
  gradient?: string;
  imageUrl?: string;
  chapter?: string;
  pet?: 'dog' | 'cat' | 'both';
  rating?: number;
  reviews?: number;
  discount?: number;
  rank?: number;
  inStock?: boolean;
  stock?: number;
  priority?: boolean;
  images?: string[];
  isPrebuilt?: boolean;
  lockedSvgMotif?: string;
  lockedGraphicTitle?: string;
  lockedGraphicPlacement?: string;
  lockedAccentHex?: string;
}

export default function ProductCard({
  id,
  slug,
  title,
  price,
  rawPrice,
  rawComparePrice,
  chapter,
  tag,
  inStock = true,
  stock,
  lockedSvgMotif,
  lockedGraphicTitle,
  lockedGraphicPlacement,
  lockedAccentHex,
}: ProductCardProps) {
  const router = useRouter();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { formatPrice: geoFormatPrice } = useGeo();
  const wished = has(id);
  const isInStock = inStock !== false && (stock == null || stock > 0);
  const productHref = `/product/${(slug || id).replace(/^meesho-/, '')}`;
  const cleanTitle = cleanBrandTitle(title);

  const isBundle = id.startsWith('bundle-');
  const inr = rawPrice ?? (parseFloat(price.replace(/[^0-9.]/g, '')) || 449);
  const displayPrice = rawPrice ? geoFormatPrice(rawPrice) : `₹${inr.toLocaleString('en-IN')}`;

  // Luxury comparison anchor (₹3,800 retail equivalent)
  const calculatedCompareInr = (() => {
    if (rawComparePrice != null && rawComparePrice > inr) {
      return rawComparePrice >= 80 ? rawComparePrice : Math.round(rawComparePrice * 85);
    }
    if (isBundle) return Math.max(3499, Math.round(inr * 1.85));
    if (inr >= 1000) return 3800;
    if (inr >= 700) return 3200;
    return 2800;
  })();

  // Editorial GSM Micro Spec
  const lower = (cleanTitle + ' ' + (tag || '') + ' ' + id).toLowerCase();
  const gsmLabel = isBundle
    ? 'CURATED ATELIER COMBO'
    : lower.includes('hoodie')
    ? '380 GSM HEAVY FLEECE'
    : lower.includes('crewneck') || lower.includes('sweatshirt')
    ? '320 GSM BRUSHED FLEECE'
    : lower.includes('varsity')
    ? '350 GSM CONTRAST WOOL-BLEND'
    : lower.includes('acid')
    ? '240 GSM ACID-WASH COMBED COTTON'
    : lower.includes('desk mat') || lower.includes('mouse pad') || id.includes('deskmat')
    ? '900×400MM DESK MAT'
    : lower.includes('mug')
    ? '11 OZ CERAMIC STONEWARE'
    : '240 GSM COMBED COTTON';

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
  };

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Direct shopper cleanly to product page to choose exact size
    router.push(productHref);
  };

  return (
    <div className="group flex flex-col h-full rounded-2xl bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden relative">
      <Link href={productHref} className="no-underline flex flex-col flex-1">
        {/* Studio Flat-Lay Render (Zero Stock Photos Anywhere) */}
        <div className="relative aspect-square m-2 rounded-xl overflow-hidden bg-[#0C0B0A]">
          <PrebuiltMockupRenderer
            id={id}
            title={cleanTitle}
            collection={chapter}
            subCategory={tag}
            qikinkSkuPrefix={id}
            accentHex={lockedAccentHex}
            svgMotif={lockedSvgMotif}
            placement={lockedGraphicPlacement}
            angle={1}
            comboBadge={isBundle ? (BUNDLE_ITEM_NAMES[id] || '+ 2nd Item Included') : undefined}
            className="w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />

          {/* Minimalist Wishlist Button */}
          <button
            onClick={handleWishlist}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full border border-white/15 cursor-pointer text-sm flex items-center justify-center bg-black/40 backdrop-blur-md hover:scale-110 active:scale-95 transition-all z-10"
            style={{ color: wished ? '#FF4D24' : '#F4F4F5' }}
          >
            <motion.span
              key={String(wished)}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 520, damping: 14 }}
              style={{ display: 'inline-flex' }}
            >
              {wished ? '♥' : '♡'}
            </motion.span>
          </button>
        </div>

        {/* Refined 3-Line Editorial Product Layout */}
        <div className="p-4 flex flex-col flex-1">
          {/* Line 1: Micro Spec */}
          <p className="text-[10px] uppercase tracking-[0.16em] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
            ARCHIVE EDITION • {gsmLabel}
          </p>

          {/* Line 2: Piece Title */}
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 mb-2 group-hover:text-amber-600 transition-colors">
            {cleanTitle}
          </h3>

          {/* Line 3: Jio × Luxury Price Anchor */}
          <div className="flex items-baseline gap-2 flex-wrap mt-auto pt-1">
            <span className="text-base font-bold text-zinc-950 dark:text-white">
              {displayPrice}
            </span>
            <span className="text-[11px] text-amber-600/90 dark:text-amber-400/80 font-medium tracking-tight">
              Atelier Direct (Retail Equiv. ₹{calculatedCompareInr.toLocaleString('en-IN')})
            </span>
          </div>
        </div>
      </Link>

      {/* Minimal High-Fashion CTA Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAction}
          className="w-full py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase bg-[#18181B] hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <span>{isBundle ? 'SELECT SIZES' : 'ACQUIRE PIECE'}</span>
          <span className="text-xs font-light">→</span>
        </button>
      </div>
    </div>
  );
}
