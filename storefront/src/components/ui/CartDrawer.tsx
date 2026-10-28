'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/lib/store/cart';
import { formatPrice, products, cleanBrandTitle, type Product } from '@/lib/data/products';
import { COPY } from '@/lib/data/copy';
import Image from 'next/image';
import PrebuiltMockupRenderer from '@/components/PrebuiltMockupRenderer';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { CURATED_PRODUCT_GALLERIES } from '@/lib/data/product-gallery';
import { supabase } from '@/lib/supabase-client';
import MagneticButton from './MagneticButton';
import { useGeo } from '@/context/GeoContext';
import { trackBeginCheckout } from '@/lib/telemetry/dataLayer';

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

const ulVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const SIZE_CHEST_MAP: Record<string, string> = {
  XS: '36" Chest',
  S: '38" Chest',
  M: '40" Chest',
  L: '42" Chest',
  XL: '44" Chest',
  '2XL': '46" Chest',
  XXL: '46" Chest',
  '3XL': '48" Chest',
};

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQty, remove, add } = useCart();
  const { market } = useGeo();
  const isIndia = market === 'IN';

  const isUsdFloat = (p: number) => p > 0 && p < 60 && !Number.isInteger(p);

  const getItemPrice = (item: { price?: number; price_inr?: number }) => {
    if (isIndia) {
      if (item.price_inr != null && Number(item.price_inr) > 0) {
        return Math.round(Number(item.price_inr));
      }
      if (item.price != null && Number(item.price) > 0) {
        const p = Number(item.price);
        return isUsdFloat(p) ? Math.round(p * 85) : Math.round(p);
      }
      return 449;
    }
    // Global / USD market
    if (item.price != null && Number(item.price) > 0) {
      const p = Number(item.price);
      return p >= 80 ? Number((p / 85).toFixed(2)) : p;
    }
    if (item.price_inr != null && Number(item.price_inr) > 0) {
      return Number((Number(item.price_inr) / 85).toFixed(2));
    }
    return 14.99;
  };

  const formatCartPrice = (val: number) => {
    if (market === 'GLOBAL') {
      const usdVal = val >= 80 ? val / 85 : val;
      return `$${Number(usdVal).toFixed(2)}`;
    }
    const inrVal = isUsdFloat(val) ? Math.round(val * 85) : Math.round(val);
    return `₹${inrVal.toLocaleString('en-IN')}`;
  };

  const detailed = items
    .map((i) => {
      const found = products.find((p) => p.id === i.id || p.id === i.id.split('__')[0]);
      const resolvedColorImage = (() => {
        const itemColor = (i as any).color;
        if (found && itemColor && found.colors) {
          const colorIdx = found.colors.findIndex(
            (c) => c.toLowerCase() === itemColor.toLowerCase()
          );
          if (colorIdx >= 0) {
            if (Array.isArray(found.images) && found.images[colorIdx]) {
              return found.images[colorIdx];
            }
            if (CURATED_PRODUCT_GALLERIES[found.id]?.[colorIdx]) {
              return CURATED_PRODUCT_GALLERIES[found.id][colorIdx];
            }
          }
        }
        if (i.imageUrl) return i.imageUrl;
        return found ? resolveProductImage(found.id, found.image_url) : resolveProductImage(i.id, i.imageUrl);
      })();

      if (found) {
        return {
          ...i,
          imageUrl: resolvedColorImage || i.imageUrl,
          product: {
            ...found,
            price_inr: found.price_inr ?? found.price,
            image_url: resolvedColorImage || resolveProductImage(found.id, found.image_url),
          },
        };
      }
      const inferredInr = i.price_inr != null ? Number(i.price_inr) : (i.price ? (isUsdFloat(Number(i.price)) ? Math.round(Number(i.price) * 85) : Math.round(Number(i.price))) : 449);
      return {
        ...i,
        imageUrl: resolvedColorImage || i.imageUrl,
        product: {
          id: i.id,
          slug: i.id,
          title: i.title || 'Curated Essential',
          price: Number(i.price ?? inferredInr),
          price_inr: inferredInr,
          emoji: i.emoji || '',
          image_url: resolvedColorImage || resolveProductImage(i.id, i.imageUrl),
          gradient: i.gradient || 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
          short: '',
          story: '',
          details: [],
          rating: 4.8,
          reviews: 120,
          tag: '',
          tagColor: '',
          tagBg: '',
          chapter: '',
          pet: 'both' as const,
          ages: ['all' as const],
          benefits: [],
          safety: '',
          vetNote: '',
          subscribeEligible: false,
          wash: '',
          badges: [],
        },
      };
    })
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const subtotal = detailed.reduce((a, b) => a + getItemPrice((b as any).product) * b.qty, 0);

  const isAddOn = (p: Product) => {
    const t = p.title.toLowerCase();
    return (
      t.includes('mug') ||
      t.includes('coaster') ||
      t.includes('tote') ||
      t.includes('pad') ||
      t.includes('mat')
    );
  };

  const inCart = new Set(items.map((i) => i.id));

  const upsells = products
    .filter(
      (p) =>
        !inCart.has(p.id) &&
        p.active !== false &&
        !p.id.startsWith('bundle-') &&
        !p.id.startsWith('meesho-') &&
        p.category !== 'pets' &&
        p.category !== 'beds' &&
        p.category !== 'toys' &&
        !p.id.toLowerCase().includes('dog') &&
        !p.id.toLowerCase().includes('cat') &&
        !p.id.toLowerCase().includes('paw')
    )
    .sort((a, b) => {
      const aAdd = isAddOn(a) ? 1 : 0;
      const bAdd = isAddOn(b) ? 1 : 0;
      if (aAdd !== bAdd) return bAdd - aAdd;
      return (a.price_inr || a.price) - (b.price_inr || b.price);
    })
    .slice(0, 3)
    .map((p) => ({
      ...p,
      image_url: resolveProductImage(p.id, p.image_url),
    }));

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/checkout' && isOpen) {
      closeCart();
    }
  }, [pathname, isOpen, closeCart]);

  // Lock body scroll and allow Escape key dismissal when Cart is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  const handleCheckout = () => {
    trackBeginCheckout(
      detailed.map((d) => ({
        id: d.id,
        title: d.product.title,
        price: d.product.price_inr || d.product.price,
        qty: d.qty,
        size: d.size,
        category: 'Streetwear Apparel',
      })),
      subtotal
    );
    closeCart();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 z-[149] backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-[min(460px,100vw)] z-[150] bg-white text-[#18181B] border-l border-neutral-200 shadow-2xl flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="p-6 border-b border-neutral-200 flex justify-between items-center bg-white"
            >
              <div className="font-display text-xl text-[#18181B] font-black">
                Shopping Bag{' '}
                <span className="font-bold text-neutral-500 text-sm">
                  ({detailed.length})
                </span>
              </div>
              <motion.button
                onClick={closeCart}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-[#18181B] flex items-center justify-center transition-colors font-bold"
              >
                ✕
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 overflow-y-auto p-6"
            >
              {detailed.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-16 text-text-secondary flex flex-col items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center font-mono text-xs text-neutral-400">
                    00
                  </div>
                  <p className="font-extrabold text-lg text-text-primary">
                    Your bag is empty
                  </p>
                  <p className="text-sm">Discover our latest streetwear and creator drops.</p>
                  <Link href="/shop" onClick={closeCart}>
                    <MagneticButton variant="primary" size="md" iconRight="→">
                      Explore Collection
                    </MagneticButton>
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.ul
                    variants={ulVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-3.5"
                  >
                    {detailed.map((d) => (
                      <motion.li
                        key={d.id}
                        variants={itemVariants}
                        className="flex gap-4 bg-bg-elevated/50 backdrop-blur-sm rounded-2xl p-4 border border-border-subtle/50"
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0 overflow-hidden relative border border-black/[0.04]"
                          style={{ background: d.product.gradient }}
                        >
                          {d.product.id?.startsWith('re-prebuilt-') ? (
                            <PrebuiltMockupRenderer
                              id={d.product.id}
                              title={d.product.title}
                              svgMotif={(d.product as any).lockedSvgMotif}
                              accentHex={(d.product as any).lockedAccentHex}
                              className="w-full h-full"
                            />
                          ) : (d.imageUrl || d.product.image_url) ? (
                            <Image
                              src={(d.imageUrl || d.product.image_url)!}
                              alt={d.product.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <span>{d.product.emoji}</span>
                          )}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${(((d.product as any)?.slug || d.id.split('__')[0]).replace(/^qikink-(?:t-shirts-|tops-|hoodies-|accessories-|bottomwear-|bags-|drinkware-|home-decor-|kids-clothes-|pet-products-)?/, 'rare-ember-').replace(/^qikink-/, 'rare-ember-').replace(/^meesho-/, ''))}`} className="no-inherit">
                            <p className="font-extrabold text-sm text-text-primary truncate">
                              {cleanBrandTitle(d.product.title)}
                            </p>
                          </Link>
                          {(d.size || d.color || d.phoneModel || d.customText || (d as any).customImageName || (d as any).customImage) && (
                            <div className="flex flex-wrap gap-1 mt-1 text-[11px]">
                              {d.color && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/10 font-bold">
                                  <span className="w-2 h-2 rounded-full border border-black/20" style={{ backgroundColor: d.color.toLowerCase() === 'white' ? '#FFFFFF' : d.color.toLowerCase() === 'black' ? '#111111' : d.color.toLowerCase().includes('navy') ? '#1E293B' : d.color.toLowerCase().includes('grey') ? '#9CA3AF' : d.color.toLowerCase().includes('red') ? '#DC2626' : d.color.toLowerCase().includes('blue') ? '#2563EB' : d.color.toLowerCase().includes('green') ? '#15803D' : '#888888' }} />
                                  Color: {d.color}
                                </span>
                              )}
                              {d.size && (
                                <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/10 font-bold">
                                  Size: {d.size}{SIZE_CHEST_MAP[d.size] ? ` (${SIZE_CHEST_MAP[d.size]})` : ''}
                                </span>
                              )}
                              {d.phoneModel && (
                                <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/10 font-bold">
                                  {d.phoneModel}
                                </span>
                              )}
                              {d.customText && (
                                <span className="px-1.5 py-0.5 rounded bg-[#ff4d24]/10 text-[#ff4d24] border border-[#ff4d24]/20 font-bold">
                                  Custom: &quot;{d.customText}&quot; {d.customPlacement ? `(${d.customPlacement})` : ''}
                                </span>
                              )}
                              {((d as any).customImageName || (d as any).customImage) && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 font-bold">
                                  Artwork: {(d as any).customImageName || 'Attached'} {d.customPlacement ? `(${d.customPlacement})` : ''}
                                </span>
                              )}
                              {(d as any).customBackText && (
                                <span className="px-1.5 py-0.5 rounded bg-[#ff4d24]/10 text-[#ff4d24] border border-[#ff4d24]/20 font-bold">
                                  Back Text: &quot;{(d as any).customBackText}&quot; (Oversized Back)
                                </span>
                              )}
                              {(d as any).customBackImage && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-500/20 font-bold">
                                  Back Artwork: Attached (Oversized Back)
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-neutral-600 font-semibold mt-1">
                            <span>7-Day Returns Guarantee</span>
                          </div>
                          <p className="text-ember font-extrabold mt-1">
                            {formatCartPrice(getItemPrice((d as any).product))}
                          </p>
                          <div className="flex gap-2 items-center mt-2">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => setQty(d.id, d.qty - 1)}
                              disabled={d.qty <= 1}
                              className="w-8 h-8 rounded-full border border-border-subtle bg-bg-surface cursor-pointer font-bold text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              −
                            </motion.button>
                            <span className="font-extrabold min-w-[28px] text-center text-neutral-900 dark:text-white">{d.qty}</span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => setQty(d.id, d.qty + 1)}
                              className="w-8 h-8 rounded-full border border-border-subtle bg-bg-surface cursor-pointer font-bold text-text-primary"
                            >
                              +
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => remove(d.id)}
                              className="ml-auto bg-transparent border-none text-neutral-700 dark:text-neutral-300 cursor-pointer text-xs font-bold px-2 py-1 rounded-lg transition-colors hover:text-ember"
                            >
                              Remove
                            </motion.button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>

                  {upsells.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6"
                    >
                      <p className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-3">
                        Recommended With Your Drop
                      </p>
                      {upsells.map((u) => (
                        <motion.div
                          key={u.id}
                          whileHover={{ x: 4 }}
                          className="flex gap-3 items-center bg-white border border-black/[0.06] rounded-2xl p-3 mb-2 shadow-xs"
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden relative border border-black/[0.04]"
                            style={{ background: u.gradient }}
                          >
                            {u.image_url ? (
                              <Image
                                src={u.image_url}
                                alt={u.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <span>{u.emoji}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${(((u as any)?.slug || u.id).replace(/^qikink-(?:t-shirts-|tops-|hoodies-|accessories-|bottomwear-|bags-|drinkware-|home-decor-|kids-clothes-|pet-products-)?/, 'rare-ember-').replace(/^qikink-/, 'rare-ember-').replace(/^meesho-/, ''))}`} className="no-underline">
                              <p className="font-bold text-xs text-neutral-900 truncate">{u.title}</p>
                            </Link>
                            <p className="text-xs text-amber-600 font-extrabold mt-0.5">
                              {formatCartPrice(getItemPrice(u))} <span className="text-neutral-400 font-medium">★ {u.rating}</span>
                            </p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              add(u.id, 1, {
                                title: u.title,
                                price: Number(((u.price_inr || u.price) / 85).toFixed(2)),
                                price_inr: u.price_inr || u.price,
                                emoji: u.emoji,
                                imageUrl: u.image_url,
                                gradient: u.gradient,
                              })
                            }
                            className="bg-[#1d1d1f] hover:bg-black text-white border-none rounded-full px-3.5 py-1.5 font-bold text-xs cursor-pointer whitespace-nowrap active:scale-95 transition-all shadow-xs"
                          >
                            + Add
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-6 border-t border-neutral-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
            >
              <div className="bg-[#F4EFEA] rounded-xl p-3 mb-4 border border-black/[0.08]">
                <p className="text-xs font-bold text-[#12100E]">
                  7-Day Returns
                </p>
                <p className="text-[11px] text-neutral-600 font-medium">
                  Hassle-free 7-day returns and express air delivery.
                </p>
              </div>

              <div className="flex justify-between text-sm mb-2 text-[#12100E] font-semibold">
                <span>Subtotal</span>
                <span className="font-bold">{formatCartPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-xs mb-3 text-neutral-600 font-medium">
                <span>Shipping (Express Air)</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>

              <div className="flex justify-between font-black text-lg text-[#12100E] pt-3 border-t border-black/10 mb-3">
                <span>Total</span>
                <span className="text-[#FF4D24] font-black">{formatCartPrice(subtotal)}</span>
              </div>

              {/* Free-Shipping & Instant UPI Savings Bar with smooth 500ms animation */}
              <div className="mb-4 p-3 rounded-xl bg-[#FAF8F5] border border-black/[0.06]">
                <div className="flex justify-between items-center text-[11px] font-bold text-neutral-800">
                  <span className="flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>
                      {subtotal >= 449
                        ? 'FREE Pan-India Express Air Shipping & ₹30 UPI Off'
                        : 'FREE Pan-India Express Air Shipping Active'}
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 font-extrabold">
                    100% FREE
                  </span>
                </div>
              </div>

              {/* Why Zero Customers Regret Their Fit Reassurance Strip */}
              <div className="mb-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-black/[0.08] text-center">
                <p className="text-[9px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                  Why Zero Customers Regret Their Fit
                </p>
                <div className="text-[10px] text-neutral-800 flex items-center justify-between gap-1 font-bold">
                  <span>📏 Exact Chest Size Verified</span>
                  <span className="text-neutral-300">•</span>
                  <span>🧶 Heavyweight Bio-Washed Cotton</span>
                  <span className="text-neutral-300">•</span>
                  <span>🔄 Free 7-Day Size Swap</span>
                </div>
              </div>

              <motion.button
                onClick={handleCheckout}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="block text-center w-full btn-ember py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer border-none shadow-md active:scale-95 transition-all"
              >
                {`Proceed to Checkout • ${formatCartPrice(subtotal)}`}
              </motion.button>

              <p className="text-center text-xs mt-3">
                <Link href="/shop" onClick={closeCart} className="text-neutral-600 hover:text-[#18181B] font-bold no-underline transition-colors">
                  ← Keep exploring
                </Link>
              </p>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
