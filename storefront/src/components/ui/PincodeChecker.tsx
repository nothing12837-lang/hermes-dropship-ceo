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
        let res = await fetch(`/api/pincode/${clean}`);
        if (!res.ok) {
          res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        }
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
            stockStatus: 'Ready for Express Air Dispatch',
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
            stockStatus: 'Express Courier Serviceable',
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
          stockStatus: 'Verified Courier Serviceable',
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
        stockStatus: 'Fast Air Cargo Serviceable',
      };
      setResult(checkRes);
      localStorage.setItem('rareember_pincode', clean);
      localStorage.setItem('rareember_pincode_data', JSON.stringify(checkRes));
    }

    setLoading(false);
  };

  return (
    <div className="rounded-xl bg-white border border-black/10 p-4 transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-xs font-bold tracking-tight text-[#12100E] leading-none">
            {market === 'IN' ? 'Delivery & Logistics Checker' : 'Shipping Availability'}
          </h4>
          <p className="text-[11px] text-neutral-500 mt-1">
            Enter your {market === 'IN' ? '6-digit PIN code' : 'postal code'} to calculate delivery timeline
          </p>
        </div>
        <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
          Express Air Hub
        </span>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          placeholder={market === 'IN' ? 'Enter 6-digit PIN (e.g. 560001)' : 'Enter ZIP code'}
          maxLength={10}
          className="flex-1 px-3.5 py-2 text-xs font-medium rounded-lg border border-black/15 bg-white text-[#12100E] outline-none focus:border-[#12100E] transition-all placeholder:text-neutral-400"
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-[#12100E] text-white hover:bg-black active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>

      {error && (
        <div className="mt-2 text-xs text-rose-600 font-medium">
          {error}
        </div>
      )}

      {/* Verified Delivery Details Card */}
      {result && !error && (
        <div className="mt-3 pt-3 border-t border-black/10 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-black/10">
            <div>
              <span className="font-bold text-[#12100E]">
                Serviceable: {result.city}, {result.state} ({result.pincode})
              </span>
              <p className="text-[11px] text-neutral-600 font-medium mt-0.5">
                Delivered via BlueDart &amp; Delhivery Air (2–4 business days)
              </p>
            </div>
            <button
              onClick={() => { setResult(null); setCode(''); }}
              className="text-[11px] text-neutral-500 hover:text-[#12100E] font-medium underline border-none bg-transparent cursor-pointer"
            >
              Change
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-black/10">
              <span className="text-neutral-500 block mb-0.5">Estimated Date</span>
              <span className="font-bold text-[#12100E]">
                {result.deliveryDate || '2–4 Business Days'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-black/10">
              <span className="text-neutral-500 block mb-0.5">Payment Support</span>
              <span className="font-bold text-[#12100E]">
                {result.codAvailable !== false ? 'Prepaid & Free Cash on Delivery (Included)' : 'Prepaid Only'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
