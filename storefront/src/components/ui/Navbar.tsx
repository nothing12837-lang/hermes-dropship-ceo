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
  { href: '/custom-drops', label: 'Custom Studio' },
  { href: '/bulk-orders', label: 'Bulk Orders' },
  { href: '/track', label: 'Tracking' },
];

const drawerLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'All Catalog' },
  { href: '/shop?cat=mens-printed', label: 'Graphic Streetwear' },
  { href: '/shop?cat=blanks', label: 'Essential Blanks' },
  { href: '/custom-drops', label: 'Custom Studio' },
  { href: '/bulk-orders', label: 'Bulk & Factory Merch' },
  { href: '/track', label: 'Track Order' },
  { href: '/returns', label: '7-Day Replacements' },
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
        {/* Main Bar */}
        <div
          className="glass-strong h-16 px-4 md:px-8 flex items-center gap-4 md:gap-8 transition-all duration-300 relative border-b border-black/[0.08]"
          style={{
            boxShadow: scrolled ? '0 4px 20px rgba(18,16,14,0.06)' : 'none',
          }}
        >
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
            <span className="whitespace-nowrap font-black text-lg md:text-xl text-[#0D0D0F] tracking-tight">
              Rare Ember
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-[380px]">
            <SmartSearch />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex gap-6 text-[13px] font-bold ml-auto text-neutral-800">
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
          <div className="flex gap-2 sm:gap-2.5 items-center ml-auto lg:ml-0 shrink-0">
            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="w-9 h-9 rounded-lg border border-black/10 bg-white/90 hidden sm:flex items-center justify-center no-underline text-sm relative hover:border-[#E04F33] transition-colors"
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
              className="text-xs font-bold no-underline text-[#0D0D0F] hidden sm:block px-3 py-1.5 rounded-lg border border-black/10 bg-white/90 hover:border-black/30 transition-colors"
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

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 rounded-lg border border-black/10 bg-white/90 cursor-pointer text-sm lg:hidden flex items-center justify-center hover:border-black/30 transition-colors"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="glass-strong px-3 py-2 lg:hidden border-b border-black/[0.08]">
          <SmartSearch />
        </div>
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
