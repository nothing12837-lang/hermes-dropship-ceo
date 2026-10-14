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

const GeoContext = createContext<GeoContextType>({
  market: 'IN',
  currency: 'INR',
  currencySymbol: '₹',
  setMarket: () => {},
  formatPrice: (priceUsd: number, priceInr?: number) => `₹${Math.round(priceInr ?? (priceUsd >= 80 ? priceUsd : priceUsd * 85)).toLocaleString('en-IN')}`,
  formatPriceByMarket: (priceUsd: number, priceInr?: number) => `₹${Math.round(priceInr ?? (priceUsd >= 80 ? priceUsd : priceUsd * 85)).toLocaleString('en-IN')}`,
});

export function GeoProvider({ children }: { children: React.ReactNode }) {
  const [market, setMarketState] = useState<MarketRegion>('IN');

  useEffect(() => {
    // Check saved market preference first
    const saved = localStorage.getItem('rareember_market') as MarketRegion | null;
    if (saved === 'IN' || saved === 'GLOBAL') {
      setMarketState(saved);
      return;
    }

    // Auto-detect visitor location via lightweight timezone & locale check
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const isIndia = tz.includes('Calcutta') || tz.includes('Kolkata') || navigator.language.includes('en-IN');
      const detected = isIndia ? 'IN' : 'GLOBAL';
      setMarketState(detected);
      localStorage.setItem('rareember_market', detected);
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

  const currency = market === 'IN' ? 'INR' : 'USD';
  const currencySymbol = market === 'IN' ? '₹' : '$';

  const formatPrice = (priceUsd: number, priceInr?: number) => {
    if (market === 'IN') {
      const val = priceInr ?? (priceUsd >= 80 ? Math.round(priceUsd) : Math.round(priceUsd * 85));
      return `₹${val.toLocaleString('en-IN')}`;
    }
    const val = priceUsd >= 80 ? (priceUsd / 85) : priceUsd;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
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
