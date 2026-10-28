'use client';

import { enforcePriceFloor, getProduct } from '@/lib/data/products';
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
  customScale?: number;
  customPosition?: { x: number; y: number } | string;
  customRotation?: number;
  customBackText?: string;
  customBackImage?: string;
  customBackPlacement?: string;
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
            .filter((i) => {
              const baseId = i.id.split('__')[0];
              const p = getProduct(baseId) || getProduct(i.id);
              // Cleanly drop permanently inactive or discontinued items from stale localStorage
              return !(p && p.active === false);
            })
            .map((i) => {
              const baseId = i.id.split('__')[0];
              const catalogProd = getProduct(baseId) || getProduct(i.id);
              const floored = enforcePriceFloor({
                id: baseId,
                title: i.title || catalogProd?.title || '',
                price: catalogProd?.price_inr ?? catalogProd?.price ?? i.price_inr ?? i.price ?? 849,
                price_inr: catalogProd?.price_inr ?? i.price_inr ?? catalogProd?.price ?? i.price ?? 849,
              } as any);
              const canonicalPrice = floored.price_inr || floored.price;
              return {
                ...i,
                id: i.id.trim(),
                price: canonicalPrice,
                price_inr: canonicalPrice,
                qty: Math.min(99, Math.max(1, Math.floor(Number(i.qty) || 1))),
              };
            });
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
        const cleanBaseId = id.split('__')[0];
        const sizeSlug = meta?.size ? `size-${meta.size.trim().replace(/\s+/g, '_')}` : '';
        const colorSlug = meta?.color ? `color-${meta.color.trim().replace(/\s+/g, '_')}` : '';
        const otherSuffix = [meta?.phoneModel, meta?.customText, meta?.customImageName].filter(Boolean).join('-');
        
        // Uniquely key by product.id, size, and color so different sizes/colors create distinct line items
        const variantSuffix = [sizeSlug, colorSlug, otherSuffix].filter(Boolean).join('__');
        const cartItemId = variantSuffix ? `${cleanBaseId}__${variantSuffix}` : cleanBaseId;

        // Ensure newly added items strictly respect true-profit pricing floors
        const catalogProd = getProduct(cleanBaseId) || getProduct(id);
        const floored = enforcePriceFloor({
          id: cleanBaseId,
          title: meta?.title || catalogProd?.title || '',
          price: catalogProd?.price_inr ?? catalogProd?.price ?? meta?.price_inr ?? meta?.price ?? 849,
          price_inr: catalogProd?.price_inr ?? meta?.price_inr ?? catalogProd?.price ?? meta?.price ?? 849,
        } as any);
        const canonicalPrice = floored.price_inr || floored.price;
        const normalizedMeta = {
          ...meta,
          price: canonicalPrice,
          price_inr: canonicalPrice,
        };

        setItems((prev) => {
          const found = prev.find((i) => i.id === cartItemId);
          if (found) {
            const nextQty = Math.min(99, found.qty + addQty);
            return prev.map((i) =>
              i.id === cartItemId ? { ...i, ...normalizedMeta, qty: nextQty, size: normalizedMeta?.size ?? i.size, color: normalizedMeta?.color ?? i.color } : i
            );
          }
          const initialQty = Math.min(99, addQty);
          return [...prev, { ...normalizedMeta, id: cartItemId, qty: initialQty, size: normalizedMeta?.size, color: normalizedMeta?.color }];
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
