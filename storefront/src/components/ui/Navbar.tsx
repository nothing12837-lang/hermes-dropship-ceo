'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/lib/store/cart';
import { useWishlist } from '@/lib/store/wishlist';
import SmartSearch from './SmartSearch';
import { supabase } from '@/lib/supabase-client';
import { useGeo } from '@/context/GeoContext';
import FestiveEffects from './FestiveEffects';

const links = [
  { href: '/shop', label: 'Shop' },
  { href: '/team', label: 'AI Team' },
  { href: '/quiz', label: 'Quiz' },
  { href: '/blog', label: 'Journal' },
  { href: '/track', label: 'Track' },
];

const drawerLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop all' },
  { href: '/shop?cat=new', label: 'New drops' },
  { href: '/quiz', label: 'Find my match' },
  { href: '/blog', label: 'Journal' },
  { href: '/track', label: 'Track order' },
  { href: '/wishlist', label: 'Wishlist' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname?.startsWith('/dots')) {
    return null;
  }
  const { market, setMarket } = useGeo();
  const { count, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      setSession(data?.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const accountLink = session ? '/profile' : '/login';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100]">
        <FestiveEffects />

        {/* Main bar */}
        <div
          className="glass-strong h-16 px-4 md:px-8 flex items-center gap-4 md:gap-8 transition-all duration-500 relative"
          style={{
            boxShadow: scrolled ? '0 12px 40px rgba(48,26,12,0.10)' : 'none',
          }}
        >
          {/* Gradient hairline */}
          <div
            aria-hidden
            className="absolute left-0 right-0 bottom-0 h-[2px] opacity-80"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,77,36,0.65) 22%, rgba(247,183,51,0.75) 50%, rgba(232,36,75,0.6) 78%, transparent)',
              opacity: scrolled ? 1 : 0.35,
              transition: 'opacity 500ms ease',
            }}
          />

          <Link
            href="/"
            className="no-underline shrink-0 flex items-center gap-2.5 font-display text-2xl tracking-tight transition-transform active:scale-95 whitespace-nowrap group"
          >
            <span className="relative flex items-center justify-center">
              <Image
                src="/flame-icon.png"
                alt="RareEmber"
                width={28}
                height={28}
                className="object-contain shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                priority
              />
              <span
                aria-hidden
                className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"
                style={{ background: 'radial-gradient(circle, rgba(255,77,36,0.55), transparent 70%)' }}
              />
            </span>
            <span className="whitespace-nowrap font-bold text-text-primary tracking-tight">
              Rare Ember<span className="text-gradient-ember-animated">.</span>
            </span>
          </Link>

          <div className="hidden lg:flex flex-1 max-w-[420px]">
            <SmartSearch />
          </div>

          <nav className="hidden lg:flex gap-7 text-sm font-semibold ml-auto">
            {links.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                className="text-text-primary/90 no-underline hover:text-ember transition-colors py-1 link-underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-2.5 items-center ml-auto lg:ml-0 shrink-0">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.94 }}>
              <Link
                href="/wishlist"
                className="w-10 h-10 rounded-full border border-black/[0.07] bg-white/85 backdrop-blur-md hidden sm:flex items-center justify-center no-underline text-base relative shadow-xs hover:border-ember/50 hover:bg-white active:scale-95 transition-all"
                aria-label="Wishlist"
              >
                <motion.span key={wishCount} initial={wishCount ? { scale: 0.5 } : false} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 14 }}>
                  ♡
                </motion.span>
                {wishCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 16 }}
                    className="absolute -top-1 -right-1 bg-gradient-ember text-white text-[0.65rem] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                  >
                    {wishCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.94 }}>
              <Link
                href={accountLink}
                aria-label={session ? 'Profile' : 'Login'}
                className={
                  session
                    ? 'w-10 h-10 rounded-full btn-ink hidden sm:flex items-center justify-center no-underline text-base'
                    : 'text-sm font-semibold no-underline text-text-primary hidden sm:block px-4 py-2 rounded-full border border-black/[0.07] bg-white/85 backdrop-blur-md hover:border-ember/50 hover:text-ember active:scale-95 transition-all'
                }
              >
                {session ? '👤' : 'Login'}
              </Link>
            </motion.div>

            <button
              onClick={() => {
                const next = market === 'IN' ? 'GLOBAL' : 'IN';
                setMarket(next);
                router.refresh();
              }}
              title={`Switch Market: Currently ${market === 'IN' ? 'India (INR)' : 'USA / Global (USD)'}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-black/[0.07] bg-white/85 backdrop-blur-md text-text-primary flex items-center gap-2 cursor-pointer shadow-xs hover:border-emerald-400/60 active:scale-95 transition-all"
            >
              <span className="live-dot w-2 h-2 rounded-full bg-emerald-500 text-emerald-500" />
              <span>{market === 'IN' ? '🇮🇳 INR' : '🇺🇸 USD'}</span>
            </button>

            <motion.button
              onClick={openCart}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`relative text-sm font-black px-5 py-2.5 rounded-full border-none cursor-pointer transition-all ${
                count > 0 ? 'btn-ember' : 'btn-ink'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Bag
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 15 }}
                  className="min-w-[22px] h-[22px] px-1 rounded-full bg-white/25 border border-white/40 text-[11px] font-black flex items-center justify-center"
                >
                  {count}
                </motion.span>
              </span>
            </motion.button>

            <button
              onClick={() => setMenuOpen(true)}
              className="w-10 h-10 rounded-full border border-black/[0.07] bg-white/85 backdrop-blur-md cursor-pointer text-base lg:hidden flex items-center justify-center hover:border-ember/50 active:scale-95 transition-all"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="glass-strong px-4 pb-2.5 lg:hidden">
          <SmartSearch />
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[199] bg-black/50 backdrop-blur-[3px]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 w-[min(340px,88vw)] z-[200] shadow-2xl flex flex-col rounded-l-3xl overflow-hidden relative"
              style={{ background: 'var(--gradient-night)' }}
            >
              <div aria-hidden className="absolute inset-0 overflow-hidden grain pointer-events-none">
                <span className="aurora-blob" style={{ width: 240, height: 240, top: -70, right: -70, background: 'rgba(255,77,36,0.4)' }} />
                <span className="aurora-blob aurora-blob-c" style={{ width: 200, height: 200, bottom: 40, left: -80, background: 'rgba(247,183,51,0.28)' }} />
              </div>

              <div className="p-5 flex justify-between items-center relative z-10">
                <span className="font-display text-2xl flex items-center gap-2 text-white">
                  <Image src="/flame-icon.png" alt="RareEmber" width={24} height={24} className="object-contain" />
                  <span>rareember<span className="text-gradient-ember-animated">.</span></span>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 rounded-full border border-white/15 bg-white/10 text-white cursor-pointer text-base backdrop-blur-md hover:border-ember/60 hover:rotate-90 transition-all"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col p-3 gap-1 relative z-10">
                {drawerLinks.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.055, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-white/85 no-underline py-3.5 px-4 font-display text-2xl hover:text-[#FF9A3D] transition-colors block"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + drawerLinks.length * 0.055, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={accountLink}
                    onClick={() => setMenuOpen(false)}
                    className="text-white/85 no-underline py-3.5 px-4 font-display text-2xl hover:text-[#FF9A3D] transition-colors block"
                  >
                    {session ? 'My Account (Profile)' : 'Sign In / Register'}
                  </Link>
                </motion.div>
              </nav>

              <div className="mt-auto p-5 relative z-10">
                <div className="rounded-2xl bg-gradient-ember p-5 font-bold text-sm leading-relaxed text-white shadow-ember">
                  Free standard shipping on every order. No minimums, no code.
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
