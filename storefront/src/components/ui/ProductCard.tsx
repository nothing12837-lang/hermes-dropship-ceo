'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart';
import { useWishlist } from '@/lib/store/wishlist';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { cleanBrandTitle } from '@/lib/data/products';
import PrebuiltMockupRenderer from '@/components/PrebuiltMockupRenderer';
import { useGeo } from '@/context/GeoContext';

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
  sizes?: string[];
  colors?: string[];
}

export default function ProductCard({
  id,
  slug,
  tag,
  title,
  price,
  rawPrice,
  rawComparePrice,
  gradient = '#F4EFEA',
  imageUrl,
  chapter,
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

  const cleanSlug = (slug || id)
    .replace(/^qikink-(?:t-shirts-|tops-|hoodies-|accessories-|bottomwear-|bags-|drinkware-|home-decor-|kids-clothes-|pet-products-)?/, 'rare-ember-')
    .replace(/^qikink-/, 'rare-ember-')
    .replace(/^meesho-/, '');
  const productHref = `/product/${cleanSlug}`;
  const cleanTitle = cleanBrandTitle(title);
  const isBundle = id.startsWith('bundle-');

  const inr = rawPrice ?? (parseFloat(price.replace(/[^0-9.]/g, '')) || 549);
  const displayPrice = rawPrice ? geoFormatPrice(rawPrice) : (price.startsWith('₹') ? price : geoFormatPrice(inr));

  // Technical Streetwear Tag (Clean, concise fabric & cut descriptor)
  const itemSearch = `${cleanTitle} ${id} ${tag || ''}`.toLowerCase();
  const fabricTag = (() => {
    if (/varsity|bomber/i.test(itemSearch)) return '350 GSM Varsity';
    if (/hoodie/i.test(itemSearch)) return '380 GSM Heavy Fleece';
    if (/sweatshirt|crewneck|jogger|sweatpant/i.test(itemSearch)) return '320 GSM French Terry';
    if (/jersey|dryfit|dry fit/i.test(itemSearch)) return '180 GSM Quick-Dry Mesh';
    if (/polo/i.test(itemSearch)) return '220 GSM Pique Cotton';
    if (/crop/i.test(itemSearch)) return '220 GSM Cotton Spandex';
    if (/kid|boy|girl/i.test(itemSearch)) return '180 GSM Combed Cotton';
    return '240 GSM Combed Cotton';
  })();

  // Server-authoritative M.R.P. markup
  const calculatedCompareInr = (() => {
    if (rawComparePrice != null && rawComparePrice > 0) {
      const cmp = rawComparePrice >= 80 ? rawComparePrice : Math.round(rawComparePrice * 85);
      if (cmp > inr) return cmp;
    }
    return Math.round(inr / 0.56);
  })();

  const displayOldPrice = geoFormatPrice(calculatedCompareInr);
  const calculatedDiscount = Math.max(5, Math.min(80, discount ?? Math.round((1 - inr / calculatedCompareInr) * 100)));

  const needsVariantChoice =
    (Array.isArray(sizes) && sizes.length > 1) ||
    (Array.isArray(colors) && colors.length > 1);

  const ctaLabel = needsVariantChoice ? 'Select Size' : 'Order Now';

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBundle || needsVariantChoice) {
      router.push(productHref);
      return;
    }
    add(id, 1, {
      title: cleanTitle,
      price: inr,
      price_inr: inr,
      imageUrl: (resolvedSrc as string) || imageUrl,
      gradient,
    });
    router.push('/checkout');
  };

  const isLcpCandidate = priority || (typeof rank === 'number' && rank <= 2);

  return (
    <div className="group flex flex-col h-full rounded-xl bg-white border border-black/[0.08] hover:border-black/25 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden relative">
      <Link href={productHref} className="no-underline flex flex-col flex-1">
        {/* Garment Image Container (Consistent 4:5 Aspect Ratio for Streetwear drapes) */}
        <div className="relative aspect-[4/5] bg-[#F7F4EF] overflow-hidden">
          {(isPrebuilt || id.startsWith('re-prebuilt-')) ? (
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
          ) : showImage ? (
            <Image
              src={resolvedSrc as string}
              alt={cleanTitle}
              fill
              priority={isLcpCandidate}
              loading={isLcpCandidate ? undefined : 'lazy'}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={80}
              className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#F7F4EF] text-neutral-400">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Rare Ember</span>
              <span className="text-[11px] text-neutral-400 mt-1">{cleanTitle}</span>
            </div>
          )}

          {/* Technical Fabric Pill */}
          <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white tracking-wider uppercase backdrop-blur-xs">
            {fabricTag}
          </span>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/10 cursor-pointer flex items-center justify-center bg-white/90 shadow-xs hover:border-[#FF4D24] active:scale-95 transition-all z-10"
            style={{ color: wished ? '#FF4D24' : '#12100E' }}
          >
            <span className="text-sm font-bold">{wished ? '♥' : '♡'}</span>
          </button>

          {/* Out of stock badge */}
          {!isInStock && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex items-center justify-center z-20">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-[#12100E] text-white rounded">
                Restocking Soon
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <h3 className="text-xs sm:text-sm font-bold text-[#12100E] line-clamp-2 min-h-[2rem] leading-snug group-hover:text-[#FF4D24] transition-colors">
            {cleanTitle}
          </h3>

          <div className="flex flex-col mt-auto pt-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-black text-[#12100E] tracking-tight">{displayPrice}</span>
              {displayOldPrice && (
                <span className="text-[11px] text-neutral-400 line-through font-medium">{displayOldPrice}</span>
              )}
              {calculatedDiscount > 0 && (
                <span className="text-[11px] font-bold text-[#FF4D24]">-{calculatedDiscount}%</span>
              )}
            </div>

            <div className="text-[10px] text-neutral-500 font-medium mt-1">
              Delivery Included • 2–4d Dispatch
            </div>
          </div>
        </div>
      </Link>

      {/* Action Button */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-0">
        {isInStock ? (
          <button
            onClick={handleOrderNow}
            className="w-full py-2 sm:py-2.5 rounded-lg font-bold text-xs tracking-wide cursor-pointer btn-ember active:scale-[0.98]"
          >
            {ctaLabel}
          </button>
        ) : (
          <Link
            href={productHref}
            className="w-full py-2 sm:py-2.5 rounded-lg font-bold text-xs tracking-wide border border-neutral-300 bg-neutral-100 text-neutral-600 flex items-center justify-center no-underline hover:bg-neutral-200"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
