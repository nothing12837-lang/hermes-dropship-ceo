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
  emoji: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  title: string;
  desc: string;
  price: string;
  oldPrice?: string;
  rawPrice?: number;
  rawComparePrice?: number;
  gradient: string;
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
}

export default function ProductCard({
  id,
  slug,
  emoji,
  tag,
  title,
  price,
  oldPrice,
  rawPrice,
  rawComparePrice,
  gradient,
  imageUrl,
  rating = 4.3,
  reviews = 120,
  discount,
  rank,
  inStock = true,
  stock,
  priority = false,
  images,
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
  const bundleFallbackList = BUNDLE_FALLBACK_IMAGES[id];
  const rawBundleImgs = bundleFallbackList || (images && images.length > 1 ? images : []);
  const bundleResolvedImages = rawBundleImgs
    .map((img, idx) => resolveProductImage(`${id}__${idx}`, img))
    .filter(Boolean) as string[];
  const hasMultipleImages = isBundle && bundleResolvedImages.length >= 2;

  const inr = rawPrice ?? (parseFloat(price.replace(/[^0-9.]/g, '')) || 449);
  const displayPrice = rawPrice ? geoFormatPrice(rawPrice) : price;

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
    add(id, 1, {
      title: cleanTitle,
      price: Number((inr / 85).toFixed(2)),
      price_inr: inr,
      emoji,
      imageUrl: (resolvedSrc as string) || imageUrl,
      gradient,
    });
    router.push('/checkout');
  };

  const isLcpCandidate = priority || (typeof rank === 'number' && rank <= 2);

  return (
    <div className="group flex flex-col h-full rounded-[1.75rem] bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(48,26,12,0.05)] hover:shadow-[0_22px_48px_rgba(48,26,12,0.14)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden relative ring-ember-animated deferred-card gpu-smooth">
      <Link href={productHref} className="no-underline flex flex-col flex-1">
        <div
          className="relative aspect-square m-2.5 mb-0 rounded-2xl overflow-hidden shine-hover bg-neutral-900/5"
          style={{ background: gradient }}
        >
          {hasMultipleImages ? (
            /* MULTI-IMAGE COMPOSITE BUNDLE SHOWCASE */
            <div className="relative w-full h-full p-2.5 flex items-center justify-center">
              {/* Layer 2: Secondary Garment/Item (Bottom-Right) */}
              <div className="absolute right-2 bottom-2 w-[65%] h-[65%] rounded-xl overflow-hidden shadow-lg border-2 border-white/90 transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-1">
                <Image
                  src={bundleResolvedImages[1]}
                  alt={`${cleanTitle} - Item 2`}
                  fill
                  sizes="(max-width: 640px) 40vw, 20vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Layer 3: Accessory / Mug (only for 3-item packs like creator-workstation and 3am-coder) */}
              {(id.includes('creator-workstation') || id.includes('3am-coder')) && bundleResolvedImages.length >= 3 && (
                <div className="absolute top-2 right-2 w-[42%] h-[42%] rounded-xl overflow-hidden shadow-xl border-2 border-white/95 z-10 transition-transform duration-500 ease-out group-hover:scale-105">
                  <Image
                    src={bundleResolvedImages[2]}
                    alt={`${cleanTitle} - Item 3`}
                    fill
                    sizes="(max-width: 640px) 25vw, 15vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Layer 1: Primary Garment/Item (Top-Left) */}
              <div className="absolute left-2 top-2 w-[70%] h-[70%] rounded-xl overflow-hidden shadow-2xl border-2 border-white z-20 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-1">
                <Image
                  src={bundleResolvedImages[0] || (resolvedSrc as string)}
                  alt={`${cleanTitle} - Item 1`}
                  fill
                  priority={isLcpCandidate}
                  sizes="(max-width: 640px) 50vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Multi-Item Included Floating Pill */}
              <div className="absolute z-30 bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#161311]/92 backdrop-blur-md text-white text-[10px] font-black tracking-wider uppercase border border-white/20 shadow-xl flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[#FF9A3D]">⚡</span>
                <span>
                  {id.includes('creator-workstation') || id.includes('3am-coder')
                    ? '3 ITEMS INCLUDED'
                    : id.includes('streetwear-duo')
                    ? '2x TEES INCLUDED'
                    : '2 ITEMS INCLUDED'}
                </span>
              </div>
            </div>
          ) : showImage ? (
            <Image
              src={resolvedSrc as string}
              alt={cleanTitle}
              fill
              priority={isLcpCandidate}
              loading={isLcpCandidate ? undefined : 'lazy'}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ objectFit: 'cover' }}
              className="group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="text-7xl flex items-center justify-center h-full group-hover:scale-115 group-hover:-rotate-6 transition-transform duration-500">
              {emoji}
            </span>
          )}

          {/* Category / Curated / Out-of-Stock badge */}
          {!isInStock ? (
            <span
              className="absolute top-3 left-3 z-10 bg-gradient-to-r from-rose-600 to-red-500 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wide shadow-md backdrop-blur-md"
              style={{ transform: 'rotate(-4deg)' }}
            >
              ⚠️ Out of Stock
            </span>
          ) : tag ? (
            <span
              className="absolute top-3 left-3 z-10 text-[11px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wide backdrop-blur-md shadow-xs"
              style={{
                transform: 'rotate(-4deg)',
                background: tag.includes('Trending') ? 'var(--gradient-ember)' : 'rgba(255,255,255,0.95)',
                color: tag.includes('Trending') ? '#fff' : 'var(--color-text-primary)',
              }}
            >
              {tag}
            </span>
          ) : null}

          <button
            onClick={handleWishlist}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full border border-black/[0.06] cursor-pointer text-base flex items-center justify-center bg-white/92 backdrop-blur-md shadow-xs hover:scale-115 hover:border-ember/50 active:scale-95 transition-all z-10"
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
            <span className="absolute bottom-2 left-3 font-display text-5xl leading-none drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] text-white/95">
              {String(rank).padStart(2, '0')}
            </span>
          )}

          {/* Discount chip */}
          {isInStock && calculatedDiscount > 0 && (
            <span className="absolute bottom-2.5 right-2.5 text-[11px] font-black px-2.5 py-1 rounded-full text-white shadow-md bg-gradient-to-r from-emerald-500 to-teal-500">
              −{calculatedDiscount}%
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          {isInStock ? (
            <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 mb-1.5">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 text-emerald-500" />
              <span>In Stock • Verified Domestic Hub • COD Ready</span>
            </div>
          ) : (
            <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Temporarily Out of Stock • Restocking Soon</span>
            </div>
          )}
          <h3
            className="text-[15px] font-bold leading-snug mb-2 overflow-hidden text-[#1d1d1f] transition-colors duration-300 group-hover:text-ember-deep"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {cleanTitle}
          </h3>

          {isBundle && (
            <div className="text-[11px] font-bold text-[#FF4D24] bg-[#FF4D24]/10 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 mb-2 w-fit border border-[#FF4D24]/20">
              <span>📦</span>
              <span>
                {BUNDLE_ITEM_NAMES[id] || (
                  id.includes('streetwear-duo')
                    ? '2x Heavyweight Tees Included'
                    : id.includes('winter-heavyweight')
                    ? '380 GSM Hoodie + Heavyweight Tee'
                    : id.includes('creator-workstation')
                    ? 'Desk Mat + Tee + Ceramic Mug'
                    : 'Curated Value Combo'
                )}
              </span>
            </div>
          )}
          <div className="flex flex-col mt-auto pt-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg font-black tracking-tight text-[#1d1d1f]">{displayPrice}</span>
              {displayOldPrice && (
                <span className="text-xs text-text-muted line-through font-medium">M.R.P.: {displayOldPrice}</span>
              )}
              {calculatedDiscount > 0 && (
                <span className="text-xs font-extrabold text-emerald-600">({calculatedDiscount}% off)</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        {isInStock ? (
          <button
            onClick={handleOrderNow}
            className="w-full py-3 rounded-full font-black text-[13px] tracking-wide border-none cursor-pointer btn-ember flex items-center justify-center gap-1.5"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              ORDER NOW
              <span>⚡</span>
            </span>
          </button>
        ) : (
          <Link
            href={productHref}
            className="w-full py-3 rounded-full font-bold text-sm tracking-tight border border-rose-200 cursor-pointer bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 no-underline"
          >
            <span>NOTIFY ME WHEN RESTOCKED 🔔</span>
          </Link>
        )}
      </div>
    </div>
  );
}
