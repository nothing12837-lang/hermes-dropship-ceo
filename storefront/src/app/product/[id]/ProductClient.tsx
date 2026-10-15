'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart';
import { useWishlist } from '@/lib/store/wishlist';
import { formatPrice, computeDiscount, PET_META, bundles, getProduct } from '@/lib/data/products';
import type { Product } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { resolveProductImages } from '@/lib/data/product-gallery';
import ProductCard from '@/components/ui/ProductCard';
import PincodeChecker from '@/components/ui/PincodeChecker';
import ProductReviews from '@/components/ui/ProductReviews';
import { useGeo } from '@/context/GeoContext';

const PERSPECTIVE_LABELS = ['Hero Front', 'Detail Macro', 'In-Room Setup', 'Unboxed & Scale'];

interface Props {
  product: Product;
}

export function ProductClient({ product }: Props) {
  const router = useRouter();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { formatPrice: geoFormatPrice } = useGeo();
  const [qty, setQty] = useState(1);
  const galleryImages = resolveProductImages(
    product.id,
    product.image_url,
    product.category,
    product.images
  );
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Keyboard navigation for image gallery
  useEffect(() => {
    if (galleryImages.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedImgIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImgIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryImages.length]);

  const validImage = galleryImages.find((_, idx) => !failedImages[idx]) || product.image_url || '';
  const currentSrc: string = !failedImages[selectedImgIndex] ? (galleryImages[selectedImgIndex] || validImage) : validImage;
  const showImage = Boolean(currentSrc && !failedImages[selectedImgIndex] || validImage);
  const wished = has(product.id);

  const relatedIds = bundles[product.id] ?? [];
  const related = relatedIds
    .map((id) => getProduct(id))
    .filter((p): p is Product => Boolean(p));

  const cleanSubtitle = (() => {
    if (!product.short) return 'Handpicked verified domestic quality with fast express dispatch across India.';
    let s = product.short.trim();
    const t = (product.title || '').trim();
    if (t && s.toLowerCase().startsWith(t.toLowerCase())) {
      s = s.slice(t.length).replace(/^[\s\-–—:.]+/, '').trim();
    }
    if (!s || s.toLowerCase() === t.toLowerCase()) {
      return 'Handpicked verified domestic quality with fast express dispatch across India.';
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  })();

  const cleanStory = (() => {
    const story = product.story || '';
    let s = story.trim();
    const t = (product.title || '').trim();
    if (t && s.toLowerCase().startsWith(t.toLowerCase())) {
      s = s.slice(t.length).replace(/^[\s\-–—:.]+/, '').trim();
    }
    if (!s || s.toLowerCase() === t.toLowerCase() || s.toLowerCase() === cleanSubtitle.toLowerCase()) {
      return 'Inspected and certified by the Rare Ember quality curation team. Dispatched via tier-1 domestic express couriers (BlueDart & Delhivery) with comprehensive 7-day replacement guarantee.';
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  })();

  const featureHighlights = (() => {
    if (product.details && product.details.length > 0) {
      return product.details;
    }
    const titleLower = (product.title || '').toLowerCase();
    const cat = (product.category || '').toLowerCase();

    if (titleLower.includes('tee') || titleLower.includes('t-shirt') || titleLower.includes('hoodie') || titleLower.includes('sweatshirt')) {
      return [
        '100% Combed Bio-Washed Heavyweight Cotton Fleece / French Terry',
        'Pre-Shrunk Silicone Wash Treated for Flawless Long-Lasting Drape',
        'High-Density Fade-Resistant Reactive Screen & DTF Printing',
        'Double-Needled Hemming with Lycra-Ribbed Anti-Sag Collar',
        'Pan-India Tracked 2–4 Day Express Delivery with White-Label Packaging',
      ];
    }
    if (titleLower.includes('mug') || titleLower.includes('tumbler') || titleLower.includes('sipper') || titleLower.includes('glass')) {
      return [
        'Artisan High-Fired Ceramic Stoneware / Food-Grade 304 Stainless Steel',
        'Superior Temperature Retention (Keeps Hot 8h, Cold 16h)',
        '100% BPA-Free, Lead-Free & Eco-Friendly Construction',
        'Multi-Layer Protective Cushion Box for Safe Doorstep Transit',
        'Rare Ember 7-Day Zero-Risk Replacement Guarantee',
      ];
    }
    if (titleLower.includes('mat') || titleLower.includes('mousepad') || titleLower.includes('desk') || cat.includes('electronics')) {
      return [
        'Massive Workspace Coverage with Ultra-Smooth Micro-Weave Cloth',
        'Precision Tracking Sensor Compatible with All Optical & Laser Mice',
        'Reinforced 360° Anti-Fray Stitched Edges for Multi-Year Durability',
        'Non-Slip High-Density Natural Rubber Base (Prevents Desk Gliding)',
        'Spill-Proof Coating: Liquid Beads Up and Wipes Clean in Seconds',
      ];
    }
    return [
      '100% Brand New & Verified Authentic Factory Build',
      'Carefully Packaged with Multi-Layer Protective Cushioning',
      'Inspected for Flawless Finish & Function Prior to Dispatch',
      'Pan-India Tracked 2–4 Day Express Delivery via BlueDart & Delhivery',
      'Full Rare Ember 7-Day Easy Replacement Guarantee',
    ];
  })();

  const handleOrderNow = () => {
    const inr = product.price_inr || (product.price >= 80 ? product.price : Math.round(product.price * 85));
    add(product.id, qty, {
      title: product.title,
      price: Number((inr / 85).toFixed(2)),
      price_inr: inr,
      emoji: product.emoji,
      imageUrl: currentSrc || product.image_url,
      gradient: product.gradient,
    });
    router.push('/checkout');
  };

  return (
    <main className="page-top" style={{ background: '#fffbf5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem)' }}>
        <Link href="/shop" style={{ color: '#8a7b6b', fontWeight: 700, textDecoration: 'none' }}>
          ← All chapters
        </Link>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%, 320px),1fr))',
            gap: 'clamp(1.25rem, 3vw, 2.5rem)',
            marginTop: '1.25rem',
            alignItems: 'start',
          }}
        >
          {/* Multi-Image Interactive Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                aspectRatio: '1',
                background: product.gradient || '#f8fafc',
                borderRadius: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.07)',
                border: '1px solid rgba(0,0,0,0.06)',
                touchAction: 'pan-y',
              }}
              onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStartX === null || galleryImages.length <= 1) return;
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;
                if (diff > 40) {
                  setSelectedImgIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                } else if (diff < -40) {
                  setSelectedImgIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                }
                setTouchStartX(null);
              }}
            >
              {showImage && currentSrc ? (
                <Image
                  key={currentSrc}
                  src={currentSrc}
                  alt={`${product.title} - Photo ${selectedImgIndex + 1}`}
                  fill
                  priority={selectedImgIndex === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover', transition: 'opacity 0.25s ease-in-out' }}
                  onError={() => setFailedImages((prev) => ({ ...prev, [selectedImgIndex]: true }))}
                />
              ) : (
                <span style={{ fontSize: '6rem', filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.15))' }}>
                  {product.emoji}
                </span>
              )}

              {/* Photo Count Pill */}
              {galleryImages.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    zIndex: 2,
                  }}
                >
                  <span>📷</span>
                  <span>{selectedImgIndex + 1} / {galleryImages.length}</span>
                </div>
              )}

              {/* Previous / Next Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImgIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                    }}
                    aria-label="Previous photo"
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(6px)',
                      color: '#0f172a',
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      transition: 'transform 0.15s ease, background 0.15s ease',
                      zIndex: 3,
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImgIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                    }}
                    aria-label="Next photo"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(6px)',
                      color: '#0f172a',
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      transition: 'transform 0.15s ease, background 0.15s ease',
                      zIndex: 3,
                    }}
                  >
                    ›
                  </button>
                </>
              )}

              {product.chapter && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1.2rem',
                    fontWeight: 900,
                    fontSize: '2rem',
                    color: 'rgba(0,0,0,0.06)',
                    pointerEvents: 'none',
                  }}
                >
                  {product.chapter}
                </span>
              )}
            </div>

            {/* Clickable Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  overflowX: 'auto',
                  padding: '0.25rem 0.1rem',
                  scrollbarWidth: 'none',
                }}
              >
                {galleryImages.map((imgUrl: string, idx: number) => {
                  if (failedImages[idx]) return null;
                  const isSelected = idx === selectedImgIndex;
                  return (
                    <div
                      key={imgUrl + idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.35rem',
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() => setSelectedImgIndex(idx)}
                        aria-label={`View photo ${idx + 1}`}
                        style={{
                          position: 'relative',
                          width: '4.75rem',
                          height: '4.75rem',
                          borderRadius: '0.85rem',
                          overflow: 'hidden',
                          border: isSelected ? '2.5px solid #ff6b35' : '1.5px solid rgba(0,0,0,0.1)',
                          transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                          boxShadow: isSelected ? '0 4px 12px rgba(255,107,53,0.25)' : 'none',
                          cursor: 'pointer',
                          padding: 0,
                          background: '#f1f5f9',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        <Image
                          src={imgUrl}
                          alt={`${product.title} thumbnail ${idx + 1}`}
                          fill
                          sizes="80px"
                          style={{ objectFit: 'cover' }}
                          onError={() => setFailedImages((prev) => ({ ...prev, [idx]: true }))}
                        />
                      </button>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: isSelected ? 800 : 600,
                          color: isSelected ? '#ff4d24' : '#64748b',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {PERSPECTIVE_LABELS[idx] || `Angle ${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span
                style={{
                  padding: '0.35rem 0.9rem',
                  borderRadius: '9999px',
                  background: product.tagBg || 'rgba(255,107,53,0.12)',
                  color: product.tagColor || '#ff6b35',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {product.tag || 'HOT DEAL'}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.75rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.25 }}>
              {product.title}
            </h1>
            <p style={{ color: '#52453e', marginTop: '0.6rem', lineHeight: 1.6, fontSize: '0.98rem', fontWeight: 500 }}>
              {cleanSubtitle}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#212121' }}>
                {geoFormatPrice(product.price, product.price_inr)}
              </span>
              {product.compareAtPrice && (
                <span style={{ color: '#8a7b6b', textDecoration: 'line-through', fontSize: '1rem', fontWeight: 500 }}>
                  M.R.P.: {geoFormatPrice(product.compareAtPrice, product.compareAtPrice)}
                </span>
              )}
              {computeDiscount(product.price, product.compareAtPrice, product.price_inr) && (
                <span style={{ color: '#059669', fontWeight: 800, fontSize: '1rem' }}>
                  ({computeDiscount(product.price, product.compareAtPrice, product.price_inr)}% OFF)
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                ✓ 100% Genuine Quality
              </span>
            </div>

            {/* Real Honest Inventory & Verification Badges */}
            {(() => {
              const isOutOfStock = (product as any).active === false || ((product as any).stock != null && Number((product as any).stock) <= 0);
              return (
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  {!isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 font-semibold border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> In Stock • Ready to Dispatch (Domestic Hub)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-800 font-bold border border-rose-500/20">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Currently Out of Stock at Supplier
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-800 font-semibold border border-blue-500/20">
                    <span>🛡️</span> 100% Genuine & Quality Tested
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 font-semibold border border-amber-500/20">
                    <span>🚚</span> 2–4 Days Express Pan-India
                  </span>
                </div>
              );
            })()}

            {/* Product Story Card */}
            <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: '#ffffff', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ff6b35', marginBottom: '0.35rem' }}>
                Curator&apos;s Note
              </div>
              <p style={{ lineHeight: 1.7, color: '#2d2522', fontSize: '0.92rem' }}>
                {cleanStory}
              </p>
            </div>

            {/* Key Highlights */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8a7b6b', marginBottom: '0.6rem' }}>
                Product Highlights & Specs
              </div>
              <ul style={{ display: 'grid', gap: '0.45rem', color: '#443731', fontSize: '0.88rem' }}>
                {featureHighlights.map((d) => (
                  <li key={d} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#059669', fontWeight: 900, flexShrink: 0 }}>✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {((product as any).active === false || ((product as any).stock != null && Number((product as any).stock) <= 0)) ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1.75rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '0.85rem 1.75rem', borderRadius: '9999px', background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>⚠️</span> CURRENTLY OUT OF STOCK AT SUPPLIER
                </div>
                <button
                  onClick={() => toggle(product.id)}
                  aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={wishBtn}
                >
                  {wished ? '♥' : '♡'}
                </button>
                <button
                  onClick={async () => {
                    const contact = prompt('Back in stock alert ke liye email/phone likho:');
                    if (!contact) return;
                    try {
                      await fetch('/api/restock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id, contact }) });
                      alert('✅ Notify-Me ON! Stock aate hi message milega.');
                    } catch { alert('Try again later.'); }
                  }}
                  style={{ ...wishBtn, border: '1.5px solid #FF4D24', color: '#FF4D24' }}
                >
                  🔔 Notify Me
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    style={qtyBtn}
                  >
                    −
                  </button>
                  <span style={{ fontWeight: 800, minWidth: '2rem', textAlign: 'center' }}>{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    aria-label="Increase quantity"
                    style={qtyBtn}
                  >
                    +
                  </button>
                </div>
                <button onClick={handleOrderNow} style={addBtn}>
                  ORDER NOW ⚡ • {geoFormatPrice(product.price * qty, product.price_inr ? product.price_inr * qty : undefined)}
                </button>
                <button
                  onClick={() => toggle(product.id)}
                  aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={wishBtn}
                >
                  {wished ? '♥' : '♡'}
                </button>
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <PincodeChecker />
            </div>

            {/* Apple-styled Trust & Security Guarantee Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/returns"
                className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-xs no-underline hover:border-black/20 transition-all text-inherit"
              >
                <div className="text-base mb-1">🛡️</div>
                <div className="font-bold text-neutral-950 flex items-center justify-between">
                  <span>7-Day Replacement</span>
                  <span className="text-[10px] text-amber-600 font-bold">Policy →</span>
                </div>
                <div className="text-[11px] text-neutral-500">Free replacement for defects</div>
              </Link>
              <div className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                <div className="text-base mb-1">🔒</div>
                <div className="font-bold text-neutral-950">256-Bit SSL Checkout</div>
                <div className="text-[11px] text-neutral-500">Bank-grade encrypted gateway</div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                <div className="text-base mb-1">⚡</div>
                <div className="font-bold text-neutral-950">Express Insured</div>
                <div className="text-[11px] text-neutral-500">Tracked door-to-door courier</div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                <div className="text-base mb-1">✨</div>
                <div className="font-bold text-neutral-950">100% Genuine Quality</div>
                <div className="text-[11px] text-neutral-500">Verified factory inspection</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <ProductReviews productId={product.id} productTitle={product.title} />

        {related.length > 0 && (
          <section style={{ marginTop: 'clamp(2rem, 5vw, 3.5rem)' }}>
            <h2 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: '1.5rem' }}>
              Pairs well with
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
                gap: '1.5rem',
              }}
            >
              {related.map((p: any) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  emoji={p.emoji}
                  tag={p.tag}
                  tagColor={p.tagColor}
                  tagBg={p.tagBg}
                  title={p.title}
                  desc={p.short}
                  price={geoFormatPrice(p.price)}
                  oldPrice={p.compareAtPrice ? geoFormatPrice(p.compareAtPrice) : undefined}
                  rawPrice={p.price}
                  rawComparePrice={p.compareAtPrice}
                  gradient={p.gradient}
                  chapter={p.chapter}
                  pet={undefined}
                  rating={p.rating}
                  reviews={p.reviews}
                  discount={computeDiscount(p.price, p.compareAtPrice, p.price_inr)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const qtyBtn: React.CSSProperties = {
  width: '42px',
  height: '42px',
  borderRadius: '50%',
  border: '1px solid rgba(0,0,0,0.08)',
  background: 'white',
  cursor: 'pointer',
  fontWeight: 800,
  fontSize: '1.1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const addBtn: React.CSSProperties = {
  flex: 1,
  minWidth: '220px',
  padding: '1.1rem 2.2rem',
  background: 'linear-gradient(135deg, #1d1d1f 0%, #000000 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '9999px',
  fontWeight: 900,
  fontSize: '1rem',
  letterSpacing: '-0.01em',
  cursor: 'pointer',
  boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
};

const wishBtn: React.CSSProperties = {
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  border: '1px solid rgba(0,0,0,0.08)',
  background: 'white',
  cursor: 'pointer',
  fontSize: '1.3rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};
