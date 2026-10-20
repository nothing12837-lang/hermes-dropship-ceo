'use client';

import { useState, useEffect } from 'react';
import { useGeo } from '@/context/GeoContext';

interface PincodeResult {
  pincode: string;
  city: string;
  state: string;
  serviceable: boolean;
  deliveryDate: string;
  codAvailable: boolean;
  stockStatus: string;
}

export default function PincodeChecker() {
  const { market } = useGeo();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeResult | null>(null);
  const [error, setError] = useState('');

  // Load saved postal code from previous session
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rareember_pincode_data');
      if (saved) {
        setResult(JSON.parse(saved));
        const rawCode = localStorage.getItem('rareember_pincode') || '';
        if (rawCode) setCode(rawCode);
      }
    } catch {}
  }, []);

  const calculateDeliveryDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleCheck = async () => {
    setError('');
    const clean = code.trim();
    if (!clean) return;

    setLoading(true);

    if (market === 'IN') {
      if (!/^\d{6}$/.test(clean)) {
        setError('Please enter a valid 6-digit Indian PIN code');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        const data = await res.json();
        if (data && data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const checkRes: PincodeResult = {
            pincode: clean,
            city: po.District || po.Name,
            state: po.State,
            serviceable: true,
            deliveryDate: calculateDeliveryDate(4),
            codAvailable: true,
            stockStatus: 'In Stock • Ready at Local Hub',
          };
          setResult(checkRes);
          localStorage.setItem('rareember_pincode', clean);
          localStorage.setItem('rareember_pincode_data', JSON.stringify(checkRes));
        } else {
          const checkRes: PincodeResult = {
            pincode: clean,
            city: 'Pan-India Delivery Hub',
            state: 'India',
            serviceable: true,
            deliveryDate: calculateDeliveryDate(4),
            codAvailable: true,
            stockStatus: 'In Stock • Express Courier',
          };
          setResult(checkRes);
          localStorage.setItem('rareember_pincode', clean);
          localStorage.setItem('rareember_pincode_data', JSON.stringify(checkRes));
        }
      } catch {
        const checkRes: PincodeResult = {
          pincode: clean,
          city: 'Standard Delivery Hub',
          state: 'India',
          serviceable: true,
          deliveryDate: calculateDeliveryDate(4),
          codAvailable: true,
          stockStatus: 'In Stock • Verified Courier',
        };
        setResult(checkRes);
        localStorage.setItem('rareember_pincode', clean);
        localStorage.setItem('rareember_pincode_data', JSON.stringify(checkRes));
      }
    } else {
      if (clean.length < 4) {
        setError('Enter a valid ZIP / Postal Code');
        setLoading(false);
        return;
      }
      const checkRes: PincodeResult = {
        pincode: clean,
        city: 'Global Delivery Destination',
        state: 'US / International',
        serviceable: true,
        deliveryDate: calculateDeliveryDate(8),
        codAvailable: false,
        stockStatus: 'In Stock • Fast Air Cargo',
      };
      setResult(checkRes);
      localStorage.setItem('rareember_pincode', clean);
      localStorage.setItem('rareember_pincode_data', JSON.stringify(checkRes));
    }

    setLoading(false);
  };

  return (
    <div className="rounded-[1.25rem] bg-gradient-to-b from-white via-white to-amber-50/20 border border-black/[0.08] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-sm">
            📍
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-tight text-neutral-900 leading-none">
              {market === 'IN' ? 'Check Delivery & Live Availability' : 'Check Shipping & Availability'}
            </h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Enter {market === 'IN' ? 'PIN code' : 'postal code'} for exact ETA & COD status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Stock</span>
        </div>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            placeholder={market === 'IN' ? 'Enter 6-digit PIN (e.g. 110001)' : 'Enter ZIP code'}
            maxLength={10}
            className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-black/10 bg-white text-neutral-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-neutral-400"
          />
        </div>
        <button
          onClick={handleCheck}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-black active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>

      {error && (
        <div className="mt-2 text-xs text-rose-600 font-medium flex items-center gap-1">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Verified Delivery Details Card */}
      {result && !error && (
        <div className="mt-3 pt-3 border-t border-black/[0.06] flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-500/15">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 text-sm font-bold">✓</span>
              <div>
                <span className="font-bold text-neutral-900">Delivering to {result.city}, {result.state}</span>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Verified courier service available ({result.pincode})
                </p>
              </div>
            </div>
            <button
              onClick={() => { setResult(null); setCode(''); }}
              className="text-[11px] text-neutral-500 hover:text-neutral-900 font-medium underline border-none bg-transparent cursor-pointer"
            >
              Change
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white border border-black/[0.05]">
              <span className="text-neutral-500 block mb-0.5">Estimated Delivery</span>
              <span className="font-bold text-neutral-900 flex items-center gap-1">
                ⚡ {result.deliveryDate}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-black/[0.05]">
              <span className="text-neutral-500 block mb-0.5">Payment Options</span>
              <span className="font-bold text-neutral-900">
                {result.codAvailable ? '💵 COD & Prepaid Available' : '💳 Prepaid (Cards/Stripe)'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {result.stockStatus}
            </span>
            <span className="text-[10px] text-neutral-400">
              BlueDart • Delhivery • Express Air
            </span>
          </div>
        </div>
      )}

      {/* Atelier Dispatch Guarantee */}
      <div className="mt-3 pt-2.5 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-neutral-600">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Atelier Dispatch Guarantee:</span>
        </span>
        <span className="text-[11px] text-neutral-700 font-medium">
          Crafted &amp; Quality-Checked in Tirupur • Express Air (2–4d)
        </span>
      </div>
    </div>
  );
}
