'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart';
import { useWishlist } from '@/lib/store/wishlist';
import SmartSearch from './SmartSearch';
import { supabase } from '@/lib/supabase-client';
import { useGeo } from '@/context/GeoContext';
import FestiveEffects from './FestiveEffects';

const links = [
  { href: '/shop', label: 'Shop' },
  { href: '/quiz', label: 'Quiz' },
  { href: '/blog', label: 'Journal' },
  { href: '/track', label: 'Track' },
];

export default function Navbar() {
  const router = useRouter();
  const { market, setMarket } = useGeo();
  const { count, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100]">
        <FestiveEffects />
        {/* Main bar */}
        <div
          className="bg-[#FFF9F1]/80 backdrop-blur-2xl border-b border-black/[0.06] px-4 md:px-8 h-16 flex items-center gap-4 md:gap-8 transition-shadow duration-300"
          style={{ boxShadow: scrolled ? '0 8px 30px rgba(0,0,0,0.06)' : 'none' }}
        >
          <Link href="/" className="no-underline shrink-0 flex items-center gap-2 font-display text-2xl tracking-tight transition-transform active:scale-95 whitespace-nowrap">
            <Image src="/flame-icon.png" alt="RareEmber" width={26} height={26} className="object-contain shrink-0" priority />
            <span className="whitespace-nowrap font-bold">rareember<span className="text-[#FF4D24]">.</span></span>
          </Link>

          <div className="hidden lg:flex flex-1 max-w-[420px]">
            <SmartSearch />
          </div>

          <nav className="hidden lg:flex gap-7 text-sm font-semibold ml-auto">
            {links.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                className="text-text-primary/90 no-underline hover:text-ember transition-colors py-1"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-2.5 items-center ml-auto lg:ml-0 shrink-0">
            <Link
              href="/wishlist"
              className="w-10 h-10 rounded-full border border-black/[0.08] bg-white/80 backdrop-blur-md hidden sm:flex items-center justify-center no-underline text-base relative shadow-xs hover:bg-white active:scale-95 transition-all"
              aria-label="Wishlist"
            >
              ♡
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-ember text-white text-[0.65rem] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {wishCount}
                </span>
              )}
            </Link>
            {session ? (
              <Link
                href="/profile"
                className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white hidden sm:flex items-center justify-center no-underline text-base shadow-xs hover:bg-black active:scale-95 transition-all"
                aria-label="Profile"
              >
                👤
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold no-underline text-text-primary hidden sm:block px-3 py-1.5 rounded-full hover:bg-black/[0.04] transition-all"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => {
                const next = market === 'IN' ? 'GLOBAL' : 'IN';
                setMarket(next);
                router.refresh();
              }}
              title={`Switch Market: Currently ${market === 'IN' ? 'India (INR)' : 'USA / Global (USD)'}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-black/[0.08] bg-white/80 backdrop-blur-md text-text-primary flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-white active:scale-95 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{market === 'IN' ? '🇮🇳 INR' : '🇺🇸 USD'}</span>
            </button>
            <button
              onClick={openCart}
              className="text-sm font-semibold px-5 py-2 bg-[#1d1d1f] text-white rounded-full border-none cursor-pointer shadow-xs hover:bg-black active:scale-95 transition-all"
            >
              Bag ({count})
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="w-10 h-10 rounded-full border border-black/[0.08] bg-white/80 backdrop-blur-md cursor-pointer text-base lg:hidden flex items-center justify-center active:scale-95 transition-all"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="bg-[#FFF9F1]/80 backdrop-blur-2xl border-b border-black/[0.06] px-4 pb-2.5 lg:hidden">
          <SmartSearch />
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[199] bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-[min(340px,88vw)] z-[200] bg-[#FFF9F1] shadow-2xl flex flex-col rounded-l-3xl overflow-hidden">
            <div className="p-5 flex justify-between items-center">
              <span className="font-display text-2xl flex items-center gap-2">
                <Image src="/flame-icon.png" alt="RareEmber" width={24} height={24} className="object-contain" />
                <span>rareember<span className="text-ember">.</span></span>
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-10 h-10 rounded-full border border-border-subtle bg-white cursor-pointer text-base"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col p-3 gap-1">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop all' },
                { href: '/shop?cat=new', label: 'New drops' },
                { href: '/quiz', label: 'Find my match' },
                { href: '/blog', label: 'Journal' },
                { href: '/track', label: 'Track order' },
                { href: '/wishlist', label: 'Wishlist' },
                {
                  href: session ? '/profile' : '/login',
                  label: session ? 'My Account (Profile)' : 'Sign In / Register',
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-text-primary no-underline py-3.5 px-4 font-display text-2xl hover:text-ember transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto p-5">
              <div className="rounded-2xl bg-gradient-ember text-white p-5 font-bold text-sm leading-relaxed">
                Free standard shipping on every order. No minimums, no code.
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
