'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface CartItem {
  id: string;
  qty: number;
  title?: string;
  price?: number;
  price_inr?: number;
  emoji?: string;
  imageUrl?: string;
  gradient?: string;
  size?: string;
  color?: string;
  customText?: string;
  customPlacement?: string;
  customImage?: string;
  customImageName?: string;
  phoneModel?: string;
  customTextColor?: string;
  customFont?: string;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (id: string, qty?: number, meta?: Partial<CartItem>) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

const KEY = 'rareember_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const validated = parsed
            .filter((i): i is CartItem => Boolean(i && typeof i.id === 'string' && i.id.trim()))
            .map((i) => ({
              ...i,
              id: i.id.trim(),
              qty: Math.min(99, Math.max(1, Math.floor(Number(i.qty) || 1))),
            }));
          setItems(validated);
        }
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, isHydrated]);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((a, b) => a + b.qty, 0);
    return {
      items,
      count,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add: (id, qty = 1, meta?: Partial<CartItem>) => {
        const addQty = Math.max(1, Math.floor(qty));
        const variantSuffix = [meta?.color, meta?.size, meta?.phoneModel, meta?.customText, meta?.customImageName].filter(Boolean).join('-');
        const cartItemId = variantSuffix ? `${id}__${variantSuffix}` : id;

        setItems((prev) => {
          const found = prev.find((i) => i.id === cartItemId);
          if (found) {
            const nextQty = Math.min(99, found.qty + addQty);
            return prev.map((i) =>
              i.id === cartItemId ? { ...i, ...meta, qty: nextQty } : i
            );
          }
          const initialQty = Math.min(99, addQty);
          return [...prev, { ...meta, id: cartItemId, qty: initialQty }];
        });
        setIsOpen(true);
      },
      remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      setQty: (id, qty) => {
        const q = Math.floor(qty);
        if (q <= 0) {
          return setItems((prev) => prev.filter((i) => i.id !== id));
        }
        const clamped = Math.min(99, q);
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, qty: clamped } : i))
        );
      },
      clear: () => setItems([]),
    };
  }, [items, isOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
