'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/store/cart';
import { useWishlist } from '@/lib/store/wishlist';
import { resolveProductImage } from '@/lib/data/fallback-images';

import { useGeo } from '@/context/GeoContext';

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

  const displayPrice = rawPrice ? geoFormatPrice(rawPrice) : price;
  const displayOldPrice = rawComparePrice ? geoFormatPrice(rawComparePrice) : oldPrice;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const inr = rawPrice ?? (parseFloat(price.replace(/[^0-9.]/g, '')) || 449);
    add(id, 1, {
      title,
      price: Number((inr / 85).toFixed(2)),
      price_inr: inr,
      emoji,
      imageUrl,
      gradient,
    });
    router.push('/checkout');
  };

  const isLcpCandidate = priority || (typeof rank === 'number' && rank <= 2);

  return (
    <div className="group flex flex-col h-full rounded-[1.75rem] bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(48,26,12,0.05)] hover:shadow-[0_22px_48px_rgba(48,26,12,0.14)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden relative ring-ember-animated deferred-card gpu-smooth">
      <Link href={productHref} className="no-underline flex flex-col flex-1">
        <div
          className="relative aspect-square m-2.5 mb-0 rounded-2xl overflow-hidden shine-hover"
          style={{ background: gradient }}
        >
          {showImage ? (
            <Image
              src={resolvedSrc as string}
              alt={title}
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
          {isInStock && discount != null && discount > 0 && (
            <span className="absolute bottom-2.5 right-2.5 text-[11px] font-black px-2.5 py-1 rounded-full text-white shadow-md bg-gradient-to-r from-emerald-500 to-teal-500">
              −{discount}%
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
            {title}
          </h3>
          <div className="flex flex-col mt-auto pt-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg font-black tracking-tight text-[#1d1d1f]">{displayPrice}</span>
              {displayOldPrice && (
                <span className="text-xs text-text-muted line-through font-medium">M.R.P.: {displayOldPrice}</span>
              )}
              {discount != null && discount > 0 && (
                <span className="text-xs font-extrabold text-emerald-600">({discount}% off)</span>
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
