'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/store/cart';
import { useWishlist } from '@/lib/store/wishlist';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { cleanBrandTitle } from '@/lib/data/products';
import PrebuiltMockupRenderer from '@/components/PrebuiltMockupRenderer';

import { useGeo } from '@/context/GeoContext';

const BUNDLE_FALLBACK_IMAGES: Record<string, string[]> = {
  'bundle-winter-spec-ops': [
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/5/9bd43925-3bff-4f53-9d92-80c14714fd19.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/32/3f45e6d3-837a-461b-9f52-b2c615eb14e4.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/118/7b58b1da-f241-4994-a5a2-f1a4ec2b5c94.jpg',
  ],
  'bundle-3am-coder': [
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/5/9bd43925-3bff-4f53-9d92-80c14714fd19.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/26/b10e9b51-65a6-43f7-9e93-0e184c5853e9.jpg',
  ],
  'bundle-college-fest-varsity': [
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/95/b3298941-1294-4945-ac9c-c5aaafd3403d.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/variations/b8d5807e-f669-4087-9dd4-a136e0af3e87.webp',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg',
  ],
  'bundle-winter-layering': [
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/118/7b58b1da-f241-4994-a5a2-f1a4ec2b5c94.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/variations/b8d5807e-f669-4087-9dd4-a136e0af3e87.webp',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/5/9bd43925-3bff-4f53-9d92-80c14714fd19.jpg',
  ],
  'bundle-crewneck-workstation': [
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/4/23175e0b-febe-4d12-83e2-f9a76506d24f.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/42/e1aabdde-178c-4773-9b54-93df46230600.jpg',
  ],
  'bundle-streetwear-duo': [
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/variations/b8d5807e-f669-4087-9dd4-a136e0af3e87.webp',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/28/30c13fe2-0ca2-4f63-b857-7970c0c0a593.jpg',
  ],
  'bundle-founding-50': [
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/variations/b8d5807e-f669-4087-9dd4-a136e0af3e87.webp',
  ],
  'bundle-creator-workstation': [
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/26/b10e9b51-65a6-43f7-9e93-0e184c5853e9.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/variations/b8d5807e-f669-4087-9dd4-a136e0af3e87.webp',
  ],
  'bundle-winter-heavyweight': [
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/5/9bd43925-3bff-4f53-9d92-80c14714fd19.jpg',
    'https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/118/7b58b1da-f241-4994-a5a2-f1a4ec2b5c94.jpg',
  ],
};

const BUNDLE_ITEM_NAMES: Record<string, string> = {
  'bundle-winter-spec-ops': '380 GSM Hoodie + Fleece Joggers',
  'bundle-3am-coder': '380 GSM Hoodie + Desk Mat + Fuel Mug',
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
  /** Variant options. When a product has more than one, "ORDER NOW" must send
   *  the customer to the PDP to choose -- adding blind shipped size L/Black. */
  sizes?: string[];
  colors?: string[];
}

export default function ProductCard({
  id,
  slug,
  emoji = '🛍️',
  tag,
  title,
  price,
  oldPrice,
  rawPrice,
  rawComparePrice,
  gradient = 'linear-gradient(135deg, #18181b, #09090b)',
  imageUrl,
  chapter,
  rating = 4.3,
  reviews = 120,
  discount,
  rank,
  inStock = true,
  stock,
  priority = false,
  images,
  isPrebuilt,
  lockedSvgMotif,
  lockedGraphicTitle,
  lockedGraphicPlacement,
  lockedAccentHex,
  sizes,
  colors,
}: ProductCardProps) {
  const router = useRouter();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { formatPrice: geoFormatPrice } = useGeo();
  const wished = has(id);
  const [imgFailed, setImgFailed] = useState(false);
  const resolvedSrc = resolveProductImage(id, imageUrl);
  const showImage = Boolean(resolvedSrc) && !imgFailed;
  const isInStock = inStock !== false && (stock == null || stock > 0);
  const productHref = `/product/${(slug || id).replace(/^meesho-/, '')}`;
  const cleanTitle = cleanBrandTitle(title);
  const isBundle = id.startsWith('bundle-');
  const bundleResolvedImages = (images && images.length > 0 ? images : []).filter(Boolean);
  // User Requirement: "create bundels too pack of 2 and 3 with all one img front"
  // Disable multi-image collage so cards always show a clean, high-resolution single front hero image.
  const hasMultipleImages = false;
  const ctaLabel = isBundle ? 'ACQUIRE BUNDLE ⚡' : 'ORDER NOW ⚡';

  const inr = rawPrice ?? (parseFloat(price.replace(/[^0-9.]/g, '')) || 449);
  const displayPrice = rawPrice ? geoFormatPrice(rawPrice) : (price.startsWith('₹') ? price : geoFormatPrice(inr));

  // Fabric badge mapping (Directive 4):
  // Hoodies -> "380 GSM Heavy Fleece"
  // Sweatshirts/Joggers -> "320 GSM Terry"
  // Varsity Jackets -> "350 GSM Varsity"
  // Jerseys -> "180 GSM Quick-Dry Mesh"
  const itemSearch = `${cleanTitle} ${id} ${tag || ''}`.toLowerCase();
  const fabricTag = (() => {
    if (tag && (tag.includes('Trending') || tag.includes('PACK OF'))) return tag;
    if (/varsity|bomber/i.test(itemSearch)) return '350 GSM Varsity';
    if (/hoodie/i.test(itemSearch)) return '380 GSM Heavy Fleece';
    if (/sweatshirt|crewneck|jogger|sweatpant/i.test(itemSearch)) return '320 GSM Terry';
    if (/jersey|dryfit|dry fit/i.test(itemSearch)) return '180 GSM Quick-Dry Mesh';
    if (/polo/i.test(itemSearch)) return '220 GSM Pique';
    return tag || '240 GSM Combed Cotton';
  })();

  // Ensure M.R.P. is ALWAYS strictly higher than selling price and formatted accurately
  const calculatedCompareInr = (() => {
    if (rawComparePrice != null && rawComparePrice > 0) {
      const cmp = rawComparePrice >= 80 ? rawComparePrice : Math.round(rawComparePrice * 85);
      if (cmp > inr) return cmp;
    }
    // Standard retail markup (44% OFF floor)
    return Math.round(inr / 0.56);
  })();

  const displayOldPrice = geoFormatPrice(calculatedCompareInr);
  const calculatedDiscount = Math.max(5, Math.min(80, discount ?? Math.round((1 - inr / calculatedCompareInr) * 100)));

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // A blind "ORDER NOW" added the item with NO size and NO colour, so the
    // factory fell back to its defaults: size L, Black. A customer who wanted
    // a medium navy tee received a large black one.
    const needsVariantChoice =
      (Array.isArray(sizes) && sizes.length > 1) ||
      (Array.isArray(colors) && colors.length > 1);
    if (isBundle || needsVariantChoice) {
      router.push(productHref);
      return;
    }
    add(id, 1, {
      title: cleanTitle,
      price: inr,
      price_inr: inr,
      emoji,
      imageUrl: (resolvedSrc as string) || imageUrl,
      gradient,
    });
    router.push('/checkout');
  };

  const isLcpCandidate = priority || (typeof rank === 'number' && rank <= 2);

  return (
    <div className="group flex flex-col h-full rounded-2xl sm:rounded-3xl bg-white border border-black/[0.08] hover:border-[#FF4D24]/40 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(255,77,36,0.12)] hover:-translate-y-1.5 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden relative ring-ember-animated deferred-card gpu-smooth">
      <Link href={productHref} className="no-underline flex flex-col flex-1">
        <div
          className="relative aspect-square m-1.5 sm:m-2.5 mb-0 rounded-xl sm:rounded-2xl overflow-hidden shine-hover bg-neutral-900/5"
          style={{ background: gradient }}
        >
          {hasMultipleImages ? (
            /* MULTI-IMAGE COMPOSITE BUNDLE SHOWCASE */
            <div className="relative w-full h-full p-2 sm:p-2.5 flex items-center justify-center">
              {/* Layer 2: Secondary Garment/Item (Bottom-Right) */}
              <div className="absolute right-1.5 bottom-1.5 sm:right-2 sm:bottom-2 w-[65%] h-[65%] rounded-lg sm:rounded-xl overflow-hidden shadow-lg border-2 border-white/90 transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-1">
                <Image
                  src={bundleResolvedImages[1]}
                  alt={`${cleanTitle} - Item 2`}
                  fill
                  sizes="(max-width: 640px) 40vw, 20vw"
                  quality={75}
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Layer 3: Accessory / Mug (only for 3-item packs like creator-workstation and 3am-coder) */}
              {(id.includes('creator-workstation') || id.includes('3am-coder')) && bundleResolvedImages.length >= 3 && (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-[42%] h-[42%] rounded-lg sm:rounded-xl overflow-hidden shadow-xl border-2 border-white/95 z-10 transition-transform duration-500 ease-out group-hover:scale-105">
                  <Image
                    src={bundleResolvedImages[2]}
                    alt={`${cleanTitle} - Item 3`}
                    fill
                    sizes="(max-width: 640px) 25vw, 15vw"
                    quality={75}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Layer 1: Primary Garment/Item (Top-Left) */}
              <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 w-[70%] h-[70%] rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border-2 border-white z-20 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-1">
                <Image
                  src={bundleResolvedImages[0] || (resolvedSrc as string)}
                  alt={`${cleanTitle} - Item 1`}
                  fill
                  priority={isLcpCandidate}
                  sizes="(max-width: 640px) 48vw, 25vw"
                  quality={75}
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Multi-Item Included Floating Pill */}
              <div className="absolute z-30 bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#161311]/92 backdrop-blur-md text-white text-[8px] sm:text-[10px] font-black tracking-wider uppercase border border-white/20 shadow-xl flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                <span className="text-[#FF9A3D]">⚡</span>
                <span>
                  {id.includes('creator-workstation') || id.includes('3am-coder')
                    ? '3 ITEMS'
                    : id.includes('streetwear-duo')
                    ? '2x TEES'
                    : '2 ITEMS'}
                </span>
              </div>
            </div>
          ) : (isPrebuilt || id.startsWith('re-prebuilt-')) ? (
            <>
              <PrebuiltMockupRenderer
                id={id}
                title={cleanTitle}
                collection={chapter}
                subCategory={tag}
                qikinkSkuPrefix={id}
                accentHex={lockedAccentHex}
                svgMotif={lockedSvgMotif}
                placement={lockedGraphicPlacement}
                className="w-full h-full"
              />
              {lockedGraphicTitle && (
                <span
                  className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 z-10 text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-white shadow-md backdrop-blur-md border border-white/20 truncate max-w-[70%]"
                  style={{ backgroundColor: `${lockedAccentHex || '#FF4D24'}E6` }}
                >
                  {lockedGraphicTitle}
                </span>
              )}
            </>
          ) : showImage ? (
            <>
              <Image
                src={resolvedSrc as string}
                alt={cleanTitle}
                fill
                priority={isLcpCandidate}
                loading={isLcpCandidate ? undefined : 'lazy'}
                sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 280px"
                quality={75}
                style={{ objectFit: 'cover' }}
                className="group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                onError={() => setImgFailed(true)}
              />
              {isBundle && (
                <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 z-20 px-2.5 py-1 rounded-full bg-[#161311]/92 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase border border-amber-500/40 shadow-xl flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-[#FF9A3D]">⚡</span>
                  <span>
                    {id.includes('pack-of-3') || cleanTitle.toLowerCase().includes('pack of 3')
                      ? 'PACK OF 3'
                      : 'PACK OF 2'}
                  </span>
                  <span className="text-emerald-400 font-extrabold">• VALUE COMBO</span>
                </div>
              )}
            </>
          ) : (
            <span className="text-5xl sm:text-7xl flex items-center justify-center h-full group-hover:scale-110 transition-transform duration-500">
              {emoji}
            </span>
          )}

          {/* Category / Curated / Out-of-Stock badge */}
          {!isInStock ? (
            <span
              className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 bg-gradient-to-r from-rose-600 to-red-500 text-white text-[9px] sm:text-[10px] md:text-[11px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-full uppercase tracking-wide shadow-md"
            >
              ⚠️ Sold Out
            </span>
          ) : fabricTag ? (
            <span
              className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 text-[9px] sm:text-[10px] md:text-[11px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-full uppercase tracking-wider backdrop-blur-md shadow-xs"
              style={{
                background: fabricTag.includes('Trending') ? 'var(--gradient-ember)' : 'rgba(255,255,255,0.95)',
                color: fabricTag.includes('Trending') ? '#fff' : '#1C1310',
              }}
            >
              {fabricTag}
            </span>
          ) : null}

          <button
            onClick={handleWishlist}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border border-black/[0.08] cursor-pointer text-xs sm:text-sm flex items-center justify-center bg-white/92 backdrop-blur-md shadow-xs hover:scale-110 hover:border-ember/50 active:scale-95 transition-all z-10"
            style={{ color: wished ? '#FF4D24' : '#1d1d1f' }}
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

          {rank != null && (
            <span className="absolute bottom-1.5 left-2 sm:bottom-2 sm:left-3 font-display text-3xl sm:text-5xl leading-none drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] text-white/95">
              {String(rank).padStart(2, '0')}
            </span>
          )}

          {/* Discount chip: Hidden on mobile (< 640px) to prevent badge collision on 2-col grids */}
          {isInStock && calculatedDiscount > 0 && (
            <span className="hidden sm:inline-block absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 text-[9px] sm:text-[10px] md:text-[11px] font-black px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 rounded-md sm:rounded-full text-white shadow-md bg-gradient-to-r from-emerald-600 to-teal-600">
              −{calculatedDiscount}%
            </span>
          )}
        </div>

        <div className="p-2.5 sm:p-3.5 md:p-4 flex flex-col flex-1">
          {isInStock ? (
            <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">In Stock • 2–4d COD</span>
            </div>
          ) : (
            <div className="text-[10px] sm:text-[11px] font-bold text-rose-600 flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span className="truncate">Temporarily Restocking</span>
            </div>
          )}
          <h3 className="text-xs sm:text-sm md:text-[15px] font-bold leading-tight sm:leading-snug mb-1.5 sm:mb-2 text-[#1d1d1f] transition-colors duration-300 group-hover:text-[#FF4D24] line-clamp-2 min-h-[2rem] sm:min-h-[2.4rem] md:min-h-[2.6rem]">
            {cleanTitle}
          </h3>

          {isBundle && (
            <div className="text-[10px] sm:text-[11px] font-bold text-[#FF4D24] bg-[#FF4D24]/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg inline-flex items-center gap-1 mb-1.5 w-fit border border-[#FF4D24]/20">
              <span>📦</span>
              <span className="truncate max-w-[140px] sm:max-w-none">
                {BUNDLE_ITEM_NAMES[id] || (
                  id.includes('streetwear-duo')
                    ? '2x Heavyweight Tees'
                    : id.includes('winter-heavyweight')
                    ? '380 GSM Hoodie + Tee'
                    : id.includes('creator-workstation')
                    ? 'Desk Mat + Tee + Mug'
                    : 'Curated Value Combo'
                )}
              </span>
            </div>
          )}
          <div className="flex flex-col mt-auto pt-1">
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-[#1d1d1f]">{displayPrice}</span>
              {displayOldPrice && (
                <span className="text-[10px] sm:text-xs text-neutral-400 line-through font-medium">M.R.P.: {displayOldPrice}</span>
              )}
              {calculatedDiscount > 0 && (
                <span className="text-[10px] sm:text-xs font-black text-emerald-600">({calculatedDiscount}% off)</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-2.5 pb-2.5 sm:px-3.5 sm:pb-3.5 md:px-4 md:pb-4">
        {isInStock ? (
          <button
            onClick={handleOrderNow}
            className="w-full py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl md:rounded-full font-black text-[11px] sm:text-xs md:text-[13px] tracking-wide border-none cursor-pointer btn-ember flex items-center justify-center gap-1 sm:gap-1.5 active:scale-[0.98] shadow-xs"
          >
            <span className="relative z-10 flex items-center gap-1">
              {ctaLabel}
            </span>
          </button>
        ) : (
          <Link
            href={productHref}
            className="w-full py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl md:rounded-full font-bold text-[11px] sm:text-xs tracking-tight border border-rose-200 cursor-pointer bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-[0.98] transition-all flex items-center justify-center gap-1 no-underline"
          >
            <span>NOTIFY RESTOCK 🔔</span>
          </Link>
        )}
      </div>
    </div>
  );
}
