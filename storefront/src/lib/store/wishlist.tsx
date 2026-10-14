'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface WishCtx {
  wishes: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  count: number;
}

const Ctx = createContext<WishCtx | null>(null);
const KEY = 'rareember_wishlist_v1';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishes, setWishes] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setWishes(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(wishes));
    } catch {}
  }, [wishes]);

  const value = useMemo<WishCtx>(
    () => ({
      wishes,
      count: wishes.length,
      has: (id) => wishes.includes(id),
      toggle: (id) =>
        setWishes((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id])),
    }),
    [wishes]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
}
