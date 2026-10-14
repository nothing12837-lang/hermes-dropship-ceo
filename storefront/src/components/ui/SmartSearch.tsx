'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

const TRENDING_SEARCHES = [
  'wireless earbuds',
  'led lamp',
  'sneakers',
  'smart watch',
  'cookware set',
  'hoodie',
  'bluetooth speaker',
  'throw blanket',
];

/**
 * Expansive Apple-style search: on focus the page blurs behind a
 * glass panel with trending searches; Enter jumps to /shop?q=….
 */
export default function SmartSearch() {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocused(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [focused]);

  const go = (q: string) => {
    const query = q.trim();
    if (!query) return;
    setFocused(false);
    router.push(`/shop?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setFocused(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 150,
              background: 'rgba(10,10,10,0.45)',
              backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            }}
          />
        )}
      </AnimatePresence>

      <div ref={boxRef} style={{ position: 'relative', zIndex: focused ? 151 : 1, flex: 1, maxWidth: focused ? '560px' : '340px', transition: 'max-width 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
        <motion.div
          animate={{ scale: focused ? 1.02 : 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: focused ? 'rgba(255,255,255,0.98)' : 'rgba(0,0,0,0.05)',
            border: focused ? '2px solid #FF4D24' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: focused ? '1.2rem' : '9999px',
            padding: focused ? '1rem 1.2rem' : '0.6rem 1.1rem',
          }}
        >
          <span style={{ fontSize: '1rem' }}>🔍</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => e.key === 'Enter' && go(value)}
            placeholder="Search products, brands and more…"
            aria-label="Search products"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: '0.92rem', fontWeight: 600, color: '#1a1412', minWidth: 0,
            }}
          />
          {focused && value && (
            <button
              onClick={() => go(value)}
              style={{
                border: 'none', borderRadius: '9999px', padding: '0.45rem 1rem',
                background: '#0a0a0a', color: 'white', fontWeight: 800,
                fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              Go →
            </button>
          )}
        </motion.div>

        <AnimatePresence>
          {focused && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute', top: 'calc(100% + 0.6rem)', left: 0, right: 0,
                background: 'rgba(255,255,255,0.98)', borderRadius: '1.2rem',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
                padding: '1.1rem 1.2rem',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a7b6b' }}>
                🔥 Trending searches
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.8rem' }}>
                {TRENDING_SEARCHES.map((t) => (
                  <button
                    key={t}
                    onClick={() => go(t)}
                    style={{
                      border: '1px solid rgba(0,0,0,0.1)', background: '#fffbf5',
                      borderRadius: '9999px', padding: '0.5rem 1rem',
                      fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', color: '#1a1412',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
