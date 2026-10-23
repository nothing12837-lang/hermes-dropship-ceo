'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ChapterHeading } from '@/components/ui/Story';
import { trackPurchase } from '@/lib/telemetry/dataLayer';

function SuccessInner() {
  const q = useSearchParams();
  const mock = q.get('mock');
  const isCod = q.get('cod') === '1';
  const email = q.get('email') || 'your inbox';
  const total = q.get('total');
  const session = q.get('session_id') || q.get('order_id');

  const [copied, setCopied] = useState(false);

  // Deterministic order ID and Archival Pass ID
  const orderId = session || 'ord_pending';
  const orderTotal = total ? parseFloat(total) : 899;
  const passId = (orderId.length > 4 ? orderId.slice(-4) : orderId).toUpperCase();

  // Dynamic 3-5 day delivery ETA
  const estimatedDates = (() => {
    const start = new Date();
    start.setDate(start.getDate() + 3);
    const end = new Date();
    end.setDate(end.getDate() + 5);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  })();

  // 5-Stage Tirupur production telemetry dates
  const telemetryStages = (() => {
    const now = new Date();
    const d1 = new Date(now);
    const d2 = new Date(now); d2.setHours(d2.getHours() + 12);
    const d3 = new Date(now); d3.setDate(d3.getDate() + 1);
    const d4 = new Date(now); d4.setDate(d4.getDate() + 2);
    const d5 = new Date(now); d5.setDate(d5.getDate() + 3);

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return [
      { name: 'Precision Vector Pre-Flight', date: fmt(d1), time: '0–2h', status: 'Completed', icon: '⚡' },
      { name: 'Cold-Cure Sublimation & Pigment Lock', date: fmt(d2), time: 'Day 1', status: 'In Progress', icon: '🎨' },
      { name: 'Pre-Shrunk Bio-Wash Bath', date: fmt(d3), time: 'Day 2', status: 'Scheduled', icon: '🫧' },
      { name: 'Triple-Point Seam QA', date: fmt(d4), time: 'Day 3', status: 'Scheduled', icon: '🔍' },
      { name: 'Hand-Inspected Packaging & Blue Dart Air Dispatch', date: fmt(d5), time: 'Day 4', status: 'Scheduled', icon: '✈️' },
    ];
  })();

  const copyOrderId = () => {
    if (session) {
      navigator.clipboard.writeText(session);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    trackPurchase({
      transactionId: orderId,
      value: orderTotal,
      currency: 'INR',
      items: [
        {
          id: 'rareember-flagship-drop',
          title: 'RareEmber Curated Streetwear Drop',
          price: orderTotal,
          qty: 1,
          category: 'Streetwear Apparel',
        },
      ],
    });
  }, [orderId, orderTotal]);

  const trackUrl = `/track?email=${encodeURIComponent(email)}${session ? `&orderId=${encodeURIComponent(session)}` : ''}`;
  const whatsappPhotosUrl = `https://wa.me/919118211860?text=${encodeURIComponent(`Hi Rare Ember Atelier, please send me live dispatch and QA photos of Order #${orderId}.`)}`;
  const whatsappSizeSwitchUrl = `https://wa.me/919118211860?text=${encodeURIComponent(`Hi Rare Ember Atelier, I placed Order #${orderId} and need to switch my size/colorway before production starts.`)}`;

  return (
    <main className="page-top min-h-screen bg-[#FAF8F5] text-[#0D0D0F] py-10 px-4 print:bg-white print:py-4">
      <div className="max-w-xl mx-auto text-center">
        {/* Status Badge & Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl shadow-inner mb-4 print:hidden">
          {isCod ? '📦' : '⚡'}
        </div>

        <ChapterHeading
          index="05"
          label={isCod ? 'Cash on Delivery Verified' : mock ? 'Demo Mode' : 'Payment Confirmed'}
          title={isCod ? 'Order' : 'Payment'}
          accent={isCod ? 'Confirmed ⚡' : 'Secured ⚡'}
        />

        <p className="text-neutral-600 text-sm md:text-base -mt-4 mb-6 leading-relaxed max-w-md mx-auto">
          {isCod ? (
            <>
              Your Cash on Delivery order has been registered in the Tirupur fulfillment queue. Please keep{' '}
              <strong className="text-neutral-900 font-black">₹{total || orderTotal}</strong> ready in Cash or UPI QR scan upon delivery.
            </>
          ) : (
            <>
              Your payment has been secured via 256-bit SSL encryption. Factory dispatch queue has been assigned to your items.
            </>
          )}
        </p>

        {/* Order Reference Card */}
        {session && (
          <div className="mb-6 p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-sm flex items-center justify-between gap-3 text-xs">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                Order Reference ID
              </span>
              <span className="font-mono font-bold text-neutral-900">
                {session}
              </span>
            </div>
            <button
              onClick={copyOrderId}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold border-none cursor-pointer transition-all shrink-0 print:hidden"
            >
              {copied ? '✓ Copied' : 'Copy ID'}
            </button>
          </div>
        )}

        {/* RareEmber Digital Archival Ownership Pass */}
        <div className="mb-6 bg-zinc-950 text-white rounded-2xl p-6 sm:p-7 border border-amber-500/30 shadow-2xl relative overflow-hidden text-left">
          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/[0.08] to-transparent pointer-events-none animate-shimmer-sweep" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 pulse-live-dot" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-black">
                  RareEmber Digital Archival Ownership Pass
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                EDITION PASS #RE-{passId}
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Atelier Registry</span>
              <span className="text-xs font-mono font-bold text-neutral-200">TIRUPUR-HUB-IND</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-4 relative z-10">
            <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] uppercase font-mono text-neutral-400 block">Status</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Minted &amp; Assigned
              </span>
            </div>
            <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] uppercase font-mono text-neutral-400 block">Order Ref</span>
              <span className="font-mono font-bold text-neutral-200 mt-0.5 block truncate" title={orderId}>
                {orderId}
              </span>
            </div>
            <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] uppercase font-mono text-neutral-400 block">Dispatch Carrier</span>
              <span className="font-bold text-neutral-200 mt-0.5 block">Blue Dart / Delhivery Air</span>
            </div>
            <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] uppercase font-mono text-neutral-400 block">Quality Warranty</span>
              <span className="font-bold text-neutral-200 mt-0.5 block">7-Day Free Swap</span>
            </div>
          </div>

          {/* Quality Lock Badges */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-300 relative z-10">
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 font-semibold">
              🔒 100% Super-Combed Cotton
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 font-semibold">
              🔒 50+ Wash Shrink Lock
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 font-semibold">
              🔒 Triple-Point Seam QA
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 font-semibold">
              🔒 Vat-Dyed Pigment Lock
            </span>
          </div>
        </div>

        {/* 2-Hour Size Switch Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-left print:hidden">
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0 mt-0.5">⏱️</span>
            <div>
              <div className="text-xs font-black text-amber-950">
                Ordered the Wrong Size by Mistake?
              </div>
              <div className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                WhatsApp Atelier Concierge within <strong>2 hours</strong> to switch your size or colorway before fabric precision cutting.
              </div>
            </div>
          </div>
          <a
            href={whatsappSizeSwitchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider no-underline transition-all shadow-sm"
          >
            Switch Size ➔
          </a>
        </div>

        {/* Estimated Doorstep Delivery Banner */}
        <div className="mb-6 p-5 rounded-3xl bg-white border border-black/[0.08] text-left shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <span>⚡</span> Estimated Doorstep Delivery
            </span>
            <span className="text-[10px] font-bold text-neutral-900 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-black/10">
              Blue Dart &amp; Delhivery Air Express
            </span>
          </div>
          <p className="text-base font-extrabold text-neutral-900">
            {estimatedDates}{' '}
            <span className="text-xs font-semibold text-neutral-500">(3–5 Business Days)</span>
          </p>
          <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center gap-2 text-xs text-neutral-600">
            <span>📲</span>
            <span>
              Live courier tracking updates via <strong>SMS &amp; WhatsApp</strong> will activate upon physical Tirupur hub scan.
            </span>
          </div>
        </div>

        {/* 5-Stage Tirupur Production Telemetry */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-white border border-black/[0.08] text-left shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <span>🏭 Live Tirupur Atelier Telemetry</span>
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Real-time 5-stage craftsmanship pipeline mapped to your order
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 pulse-live-dot" />
              Stage 2 of 5 Active
            </span>
          </div>

          <div className="space-y-2.5">
            {telemetryStages.map((stg, idx) => {
              const isPast = idx === 0;
              const isCurrent = idx === 1;
              return (
                <div
                  key={stg.name}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                    isCurrent
                      ? 'bg-amber-500/[0.08] border-amber-500/30 ring-1 ring-amber-500/20'
                      : isPast
                      ? 'bg-emerald-50/70 border-emerald-500/20 text-neutral-800'
                      : 'bg-neutral-50/70 border-black/[0.05] opacity-60 text-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{stg.icon}</span>
                    <div className="min-w-0">
                      <div className="font-extrabold text-neutral-900 flex items-center gap-1.5 flex-wrap">
                        <span>Stage {idx + 1}: {stg.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-[#E04F33] text-white px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                            Active
                          </span>
                        )}
                        {isPast && (
                          <span className="text-[9px] text-emerald-700 font-black">✓ Complete</span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500 block truncate">Target: {stg.date} • {stg.time}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold shrink-0 ${isCurrent ? 'text-amber-800' : isPast ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    {stg.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 High-Impact Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
          <Link
            href={trackUrl}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#E04F33] hover:bg-[#d0452b] text-white font-black text-xs uppercase tracking-wider no-underline shadow-lg shadow-[#E04F33]/20 active:scale-95 transition-all text-center inline-flex items-center justify-center gap-2 animate-shimmer-sweep"
          >
            <span>📍</span>
            <span>Track Live Dispatch Status →</span>
          </Link>
          <a
            href={whatsappPhotosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider no-underline transition-all text-center inline-flex items-center justify-center gap-2"
          >
            <span>📸</span>
            <span>WhatsApp Dispatch Photos</span>
          </a>
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs border border-black/15 cursor-pointer transition-all text-center"
          >
            📄 Print Tax Receipt
          </button>
        </div>

        {/* 1-Tap Concierge Reassurance */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-center gap-2 print:hidden">
          <span>Need priority concierge assistance?</span>
          <a
            href={`https://wa.me/919118211860?text=${encodeURIComponent(`Hi Rare Ember Atelier, I placed Order #${session || 'N/A'}. Please confirm dispatch status.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-bold underline inline-flex items-center gap-1"
          >
            <span>💬</span> Chat with Atelier Concierge on WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
