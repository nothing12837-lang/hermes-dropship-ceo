'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/lib/store/cart';
import { formatPrice, products, type Product } from '@/lib/data/products';
import { COPY } from '@/lib/data/copy';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { supabase } from '@/lib/supabase-client';
import MagneticButton from './MagneticButton';
import { useGeo } from '@/context/GeoContext';

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

const ulVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQty, remove, add } = useCart();
  const { market } = useGeo();
  const isIndia = market === 'IN';

  const getItemPrice = (item: { price?: number; price_inr?: number }) => {
    if (isIndia) {
      if (item.price_inr != null && Number(item.price_inr) > 0) {
        return Math.round(Number(item.price_inr));
      }
      if (item.price != null && Number(item.price) > 0) {
        const p = Number(item.price);
        return p >= 80 ? Math.round(p) : Math.round(p * 85);
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
    if (isIndia) {
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    }
    return `$${Number(val).toFixed(2)}`;
  };

  const detailed = items
    .map((i) => {
      const found = products.find((p) => p.id === i.id || p.id === i.id.split('__')[0]);
      if (found) {
        return {
          ...i,
          product: {
            ...found,
            price_inr: found.price_inr ?? found.price,
            image_url: resolveProductImage(found.id, found.image_url),
          },
        };
      }
      const inferredInr = i.price_inr != null ? Number(i.price_inr) : (i.price && i.price >= 80 ? Math.round(i.price) : Math.round((i.price || 4.99) * 85));
      return {
        ...i,
        product: {
          id: i.id,
          slug: i.id,
          title: i.title || 'Curated Essential',
          price: Number(i.price ?? inferredInr),
          price_inr: inferredInr,
          emoji: i.emoji || '🛍️',
          image_url: resolveProductImage(i.id, i.imageUrl),
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

  const handleCheckout = async () => {
    closeCart();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login?redirect=/checkout');
      } else {
        router.push('/checkout');
      }
    } catch {
      router.push('/checkout');
    }
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
            className="fixed top-0 right-0 bottom-0 w-[min(460px,100vw)] z-[150] bg-bg-surface/95 backdrop-blur-2xl border-l border-border-subtle shadow-2xl flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="p-6 border-b border-border-subtle flex justify-between items-center"
            >
              <div className="font-display text-xl text-text-primary">
                Your Pack 🛒{' '}
                <span className="font-normal text-text-secondary text-sm">
                  ({detailed.length})
                </span>
              </div>
              <motion.button
                onClick={closeCart}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full border border-border-subtle bg-bg-surface cursor-pointer text-text-secondary flex items-center justify-center transition-colors hover:border-ember"
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
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl"
                  >
                    🛍️
                  </motion.div>
                  <p className="font-extrabold text-lg text-text-primary">
                    Your cart is empty
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
                          {d.product.image_url ? (
                            <Image
                              src={d.product.image_url}
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
                          <Link href={`/product/${((d.product as any)?.slug || d.id.split('__')[0]).replace(/^meesho-/, '')}`} className="no-inherit">
                            <p className="font-extrabold text-sm text-text-primary truncate">
                              {d.product.title}
                            </p>
                          </Link>
                          {(d.size || d.phoneModel || d.customText || (d as any).customImageName || (d as any).customImage) && (
                            <div className="flex flex-wrap gap-1 mt-1 text-[11px]">
                              {d.size && (
                                <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-text-secondary border border-black/10 dark:border-white/10 font-bold">
                                  Size: {d.size}
                                </span>
                              )}
                              {d.phoneModel && (
                                <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-text-secondary border border-black/10 dark:border-white/10 font-medium">
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
                                  🖼️ Graphic: {(d as any).customImageName || 'Artwork Attached'} {d.customPlacement ? `(${d.customPlacement})` : ''}
                                </span>
                              )}
                            </div>
                          )}
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
                            <span className="font-extrabold min-w-[28px] text-center">{d.qty}</span>
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
                              className="ml-auto bg-transparent border-none text-text-secondary cursor-pointer text-xs font-semibold px-2 py-1 rounded-lg transition-colors hover:text-ember"
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
                        ✨ Complete Your Drop (1-Click Add-Ons)
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
                            <Link href={`/product/${((u as any)?.slug || u.id).replace(/^meesho-/, '')}`} className="no-underline">
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
              className="p-6 border-t border-black/[0.06] bg-white/80 backdrop-blur-md"
            >
              <div className="bg-[#FFF9F1] rounded-2xl p-3.5 mb-4 border border-black/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="text-base">🛡️</span>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      7-Day Easy Replacement
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Free replacements • Insured tracked delivery
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-bold text-sm mb-2 text-neutral-600">
                <span>Subtotal</span>
                <span className="text-neutral-900 font-black">{formatCartPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-xs text-neutral-500 mb-3">
                <span>Standard Shipping</span>
                <span className="text-emerald-600 font-bold">FREE ⚡</span>
              </div>

              <div className="flex justify-between font-black text-xl text-neutral-950 pt-3 border-t border-black/[0.06] mb-3">
                <span>Total</span>
                <span className="text-[#FF4D24]">{formatCartPrice(subtotal)}</span>
              </div>

              <motion.button
                onClick={handleCheckout}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="block text-center w-full bg-[#1d1d1f] hover:bg-black text-white py-3.5 rounded-full font-black text-sm tracking-tight border-none cursor-pointer shadow-md active:scale-95 transition-all"
              >
                {`PROCEED TO CHECKOUT ⚡ • ${formatCartPrice(subtotal)}`}
              </motion.button>

              <p className="text-center text-xs text-neutral-400 mt-3">
                <Link href="/shop" onClick={closeCart} className="text-neutral-500 hover:text-neutral-900 font-semibold no-underline transition-colors">
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
