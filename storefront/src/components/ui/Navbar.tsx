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

const links = [
  { href: '/shop', label: 'Catalog' },
  { href: '/shop?cat=mens-printed', label: 'Graphic Drops' },
  { href: '/track', label: 'Tracking' },
];

const drawerLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'All Catalog' },
  { href: '/shop?cat=mens-printed', label: 'Graphic Streetwear' },
  { href: '/shop?cat=blanks', label: 'Essential Blanks' },
  { href: '/track', label: 'Track Order' },
  { href: '/returns', label: '7-Day Easy Returns' },
  { href: '/support', label: 'Customer Support' },
  { href: '/wishlist', label: 'Saved Items' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { market, setMarket } = useGeo();
  const { count, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    setMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

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
        {/* Top Announcement Bar */}
        <div className="bg-zinc-950 text-[#FAF8F5] text-[11px] py-1.5 px-3 text-center tracking-wide font-medium flex items-center justify-center gap-1.5 border-b border-white/5">
          <span>⚡ ₹30 OFF ON UPI • FREE EXPRESS AIR DELIVERY • 7-DAY EASY RETURNS</span>
        </div>

        {/* Desktop Navbar (>= lg) */}
        <div
          className="hidden lg:flex glass-strong h-16 transition-all duration-300 relative border-b border-black/[0.08]"
          style={{
            boxShadow: scrolled ? '0 4px 20px rgba(18,16,14,0.06)' : 'none',
          }}
        >
          <div className="max-w-[1600px] 2xl:max-w-[1760px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between gap-6">
            {/* Brand Logo & Name */}
            <Link
              href="/"
              className="no-underline shrink-0 flex items-center gap-2.5 transition-transform active:scale-95 whitespace-nowrap group"
            >
              <Image
                src="/flame-icon.png"
                alt="Rare Ember"
                width={26}
                height={26}
                className="object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
                priority
              />
              <div className="flex flex-col">
                <span className="whitespace-nowrap font-black text-lg text-[#0D0D0F] tracking-tight leading-tight">
                  Rare Ember
                </span>
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#E04F33] uppercase leading-none">
                  Atelier
                </span>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="flex flex-1 max-w-[340px]">
              <SmartSearch />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex gap-7 text-sm font-bold text-neutral-800">
              {links.map((l) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  className="text-[#0D0D0F]/80 no-underline hover:text-[#E04F33] transition-colors py-1 link-underline"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Right Action Icons */}
            <div className="flex gap-2 sm:gap-2.5 items-center shrink-0">
              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="w-9 h-9 rounded-lg border border-black/10 bg-white/90 flex items-center justify-center no-underline text-sm relative hover:border-[#E04F33] transition-colors"
                aria-label="Wishlist"
              >
                <span>♡</span>
                {wishCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E04F33] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {wishCount}
                  </span>
                )}
              </Link>

              {/* Account / Login */}
              <Link
                href={accountLink}
                aria-label={session ? 'Profile' : 'Login'}
                className="text-xs font-bold no-underline text-[#0D0D0F] px-3 py-1.5 rounded-lg border border-black/10 bg-white/90 hover:border-black/30 transition-colors"
              >
                {session ? 'Account' : 'Sign In'}
              </Link>

              {/* Market Switcher */}
              <button
                onClick={() => {
                  const next = market === 'IN' ? 'GLOBAL' : 'IN';
                  setMarket(next);
                  router.refresh();
                }}
                title={`Market: ${market === 'IN' ? 'India (INR)' : 'Global (USD)'}`}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-black/10 bg-white/90 text-[#0D0D0F] flex items-center gap-1.5 cursor-pointer hover:border-black/30 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] pulse-live-dot" />
                <span>{market === 'IN' ? 'INR (₹)' : 'USD ($)'}</span>
              </button>

              {/* Cart Trigger */}
              <button
                onClick={openCart}
                className={`relative text-xs font-black px-4 py-2 rounded-lg cursor-pointer transition-all shine-hover animate-shimmer-sweep flex items-center gap-1.5 active:scale-95 ${
                  count > 0 ? 'btn-ember shadow-md' : 'btn-ink'
                }`}
              >
                <span>Bag</span>
                {count > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[#E04F33] text-[10px] font-black flex items-center justify-center badge-pop">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sleek 3-Zone Mobile Header (< lg) */}
        <div className="lg:hidden h-14 px-3 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between gap-2">
          {/* Zone 1 (Left): Hamburger (40x40) + Search Lens */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="w-10 h-10 rounded-xl bg-white/90 border border-zinc-200/80 flex items-center justify-center text-base text-zinc-900 active:scale-95 transition-all shadow-xs cursor-pointer"
              aria-label="Open navigation menu"
            >
              ☰
            </button>
            <button
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all border shadow-xs cursor-pointer ${
                mobileSearchOpen
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white/90 text-zinc-800 border-zinc-200/80 active:scale-95'
              }`}
              aria-label="Search catalog"
            >
              🔍
            </button>
          </div>

          {/* Zone 2 (Center): Architectural Wordmark + Sub-label */}
          <Link href="/" className="no-underline flex flex-col items-center justify-center text-center shrink-0">
            <span className="font-black text-sm tracking-[0.22em] text-[#0D0D0F] uppercase whitespace-nowrap">
              RARE EMBER
            </span>
            <span className="text-[8px] font-bold tracking-[0.28em] text-[#E04F33] uppercase -mt-0.5">
              ATELIER
            </span>
          </Link>

          {/* Zone 3 (Right): Track Icon + Bag Pill Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/track"
              className="w-9 h-9 rounded-xl bg-white/90 border border-zinc-200/80 flex items-center justify-center text-sm text-zinc-800 no-underline shadow-xs hover:border-black/30 transition-all"
              aria-label="Track order"
              title="Track order"
            >
              📍
            </Link>
            <button
              onClick={openCart}
              className="bg-zinc-950 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer border-none"
              aria-label="Open shopping bag"
            >
              <span>Bag</span>
              <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-[#E04F33] text-white text-[10px] font-black flex items-center justify-center">
                {count}
              </span>
            </button>
          </div>
        </div>

        {/* Expandable Mobile Search Slide-Down Bar */}
        {mobileSearchOpen && (
          <div className="lg:hidden bg-[#FAF8F5]/95 backdrop-blur-md px-3 py-2.5 border-b border-zinc-200/80 shadow-md">
            <SmartSearch />
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-xs"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 w-[min(320px,85vw)] z-[200] shadow-2xl flex flex-col bg-[#12100E] text-white overflow-hidden"
            >
              <div className="p-4 flex justify-between items-center border-b border-white/10">
                <span className="font-black text-lg flex items-center gap-2">
                  <Image src="/flame-icon.png" alt="Rare Ember" width={22} height={22} className="object-contain" />
                  <span>Rare Ember</span>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-lg border border-white/15 bg-white/5 text-white/80 cursor-pointer text-xs hover:bg-white/15 transition-all flex items-center justify-center"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col p-4 gap-1 overflow-y-auto">
                {drawerLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-white/80 no-underline py-2.5 px-3 rounded-lg text-sm font-bold hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-white/10" />
                <Link
                  href={accountLink}
                  onClick={() => setMenuOpen(false)}
                  className="text-white/80 no-underline py-2.5 px-3 rounded-lg text-sm font-bold hover:text-white hover:bg-white/5 transition-colors"
                >
                  {session ? 'Account Profile' : 'Sign In / Register'}
                </Link>
              </nav>

              <div className="mt-auto p-4 border-t border-white/10 bg-black/40">
                <p className="text-xs text-white/60 font-medium leading-relaxed">
                  Pan-India 2–4d express air dispatch. Standard delivery included in all prices.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
