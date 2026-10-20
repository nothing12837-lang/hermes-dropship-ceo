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
  // RareEmber is exclusively an Indian streetwear & creator brand (INR ₹).
  // Default and lock to IN market so all visitors see clean ₹ prices.
  const [market, setMarketState] = useState<MarketRegion>('IN');

  useEffect(() => {
    setMarketState('IN');
    try {
      // Purge any stale GLOBAL value from browser storage
      localStorage.setItem('rareember_market', 'IN');
      if (typeof document !== 'undefined') {
        document.cookie = 'rareember_market=IN; path=/; max-age=31536000; SameSite=Lax';
      }
    } catch {}
  }, []);

  const setMarket = (m: MarketRegion) => {
    setMarketState('IN'); // Always maintain IN for Indian domestic fulfillment
    try {
      localStorage.setItem('rareember_market', 'IN');
      if (typeof document !== 'undefined') {
        document.cookie = 'rareember_market=IN; path=/; max-age=31536000; SameSite=Lax';
      }
    } catch {}
  };

  const currency = 'INR';
  const currencySymbol = '₹';

  const formatPrice = (priceUsd: number, priceInr?: number) => {
    const val = priceInr ?? (priceUsd >= 80 ? Math.round(priceUsd) : Math.round(priceUsd * 85));
    return `₹${val.toLocaleString('en-IN')}`;
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

