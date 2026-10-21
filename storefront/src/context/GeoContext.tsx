'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type MarketRegion = 'IN' | 'GLOBAL';

interface GeoContextType {
  market: MarketRegion;
  currency: 'INR' | 'USD';
  currencySymbol: '₹' | '$';
  setMarket: (m: MarketRegion) => void;
  formatPrice: (priceUsd: number, priceInr?: number) => string;
  formatPriceByMarket: (priceUsd: number, priceInr?: number) => string;
}

const formatInrPrice = (priceUsd: number, priceInr?: number): string => {
  const val = priceInr ?? (priceUsd >= 80 ? Math.round(priceUsd) : Math.round(priceUsd * 85));
  return `₹${val.toLocaleString('en-IN')}`;
};

const GeoContext = createContext<GeoContextType>({
  market: 'IN',
  currency: 'INR',
  currencySymbol: '₹',
  setMarket: () => {},
  formatPrice: formatInrPrice,
  formatPriceByMarket: formatInrPrice,
});

export function GeoProvider({ children }: { children: React.ReactNode }) {
  // RareEmber is exclusively an Indian streetwear & creator brand (INR ₹).
  // Hard-default and lock to IN market on SSR and client so $ never appears.
  const [market, setMarketState] = useState<MarketRegion>('IN');

  useEffect(() => {
    // Only check if user explicitly switched to GLOBAL in localStorage
    try {
      const saved = localStorage.getItem('rareember_market');
      if (saved === 'GLOBAL') {
        setMarketState('GLOBAL');
      } else {
        setMarketState('IN');
        localStorage.setItem('rareember_market', 'IN');
      }
    } catch {
      setMarketState('IN');
    }
  }, []);

  const setMarket = (m: MarketRegion) => {
    setMarketState(m);
    try {
      localStorage.setItem('rareember_market', m);
      if (typeof document !== 'undefined') {
        document.cookie = `rareember_market=${m}; path=/; max-age=31536000; SameSite=Lax`;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rareember_market_changed', { detail: m }));
      }
    } catch {}
  };

  const currency = market === 'GLOBAL' ? 'USD' : 'INR';
  const currencySymbol = market === 'GLOBAL' ? '$' : '₹';

  const formatPrice = (priceUsd: number, priceInr?: number) => {
    if (market === 'GLOBAL') {
      const val = priceUsd >= 80 ? priceUsd / 85 : priceUsd;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }
    return formatInrPrice(priceUsd, priceInr);
  };

  const formatPriceByMarket = formatPrice;

  return (
    <GeoContext.Provider value={{ market, currency, currencySymbol, setMarket, formatPrice, formatPriceByMarket }}>
      {children}
    </GeoContext.Provider>
  );
}

export function useGeo() {
  return useContext(GeoContext);
}

// Aliases for explicit CurrencyContext / useCurrency imports
export const CurrencyContext = GeoContext;
export const CurrencyProvider = GeoProvider;
export const useCurrency = useGeo;
