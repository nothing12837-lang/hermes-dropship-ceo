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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Deterministic order ID and Archival Pass ID
  const orderId = session || 'ord_pending';
  const orderTotal = total ? parseFloat(total) : 548;
  const passId = (orderId.length > 4 ? orderId.slice(-4) : orderId).toUpperCase();

  // Formatted current date for certificate pass
  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

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

  // 5-Stage Tirupur production telemetry dates & exact specs
  const telemetryStages = (() => {
    const now = new Date();
    const d1 = new Date(now);
    const d2 = new Date(now); d2.setHours(d2.getHours() + 10);
    const d3 = new Date(now); d3.setDate(d3.getDate() + 1);
    const d4 = new Date(now); d4.setDate(d4.getDate() + 2);
    const d5 = new Date(now); d5.setDate(d5.getDate() + 4);

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return [
      {
        stageNum: 1,
        title: 'Order & Size Specs Locked',
        timing: 'Active Now (Just Now)',
        desc: 'Your exact chest & garment measurements are locked in our Tirupur queue.',
        isActive: true,
        isDone: false,
        icon: '🔒',
        badge: 'Active Now — Green Pulse',
      },
      {
        stageNum: 2,
        title: '300 DPI Archival Print & Heat Curing',
        timing: `Next • Within 6–12 Hours (${fmt(d2)})`,
        desc: 'Precision DTF/Sublimation curing at 165°C for 50+ wash durability.',
        isActive: false,
        isDone: false,
        icon: '🎨',
        badge: 'Within 6–12 Hours',
      },
      {
        stageNum: 3,
        title: '240–380 GSM Fabric & Stitch Inspection',
        timing: `Tomorrow (${fmt(d3)})`,
        desc: '12-point manual quality check for zero loose threads or shade defects.',
        isActive: false,
        isDone: false,
        icon: '🧵',
        badge: 'Tomorrow',
      },
      {
        stageNum: 4,
        title: 'BlueDart / Delhivery Airway Bill Generated',
        timing: `Day 2 (${fmt(d4)})`,
        desc: 'Insured express air dispatch with live SMS/WhatsApp AWB link.',
        isActive: false,
        isDone: false,
        icon: '✈️',
        badge: 'Day 2',
      },
      {
        stageNum: 5,
        title: 'Doorstep Delivery',
        timing: `Est. Delivery: +3 to 5 Days (${fmt(d5)})`,
        desc: 'Backed by our 7-Day Zero-Question Size Replacement Guarantee.',
        isActive: false,
        isDone: false,
        icon: '📦',
        badge: '+3 to 5 Days',
      },
    ];
  })();

  const copyOrderId = () => {
    if (session) {
      navigator.clipboard.writeText(session);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrintInvoice = () => {
    setShowInvoiceModal(true);
    setTimeout(() => {
      window.print();
    }, 250);
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
  const whatsappVipUrl = `https://wa.me/919118211860?text=${encodeURIComponent(`Hi RareEmber Atelier! Please lock in VIP dispatch updates for my Order #${orderId}`)}`;
  const whatsappSizeSwitchUrl = `https://wa.me/919118211860?text=${encodeURIComponent(`Hi RareEmber Atelier! I need to switch my size/colorway for Order #${orderId} within the 2-hour grace window.`)}`;

  // GST Breakdown calculations
  const cgst = (orderTotal * 0.0238).toFixed(2);
  const sgst = (orderTotal * 0.0238).toFixed(2);
  const taxableValue = (orderTotal - Number(cgst) - Number(sgst)).toFixed(2);

  return (
    <main className="page-top min-h-screen bg-[#FAF8F5] text-[#0D0D0F] py-10 px-4">
      {/* Clean @media print stylesheet: prints ONLY structured tax invoice and hides navigation/buttons */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header, footer, nav, button, .print-hide, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
          .tax-invoice-printable-sheet {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 24px !important;
            margin: 0 !important;
            border: 2px solid #000000 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .tax-invoice-printable-sheet * {
            visibility: visible !important;
          }
        }
      `}</style>

      <div className="max-w-xl mx-auto text-center print-hide">
        {/* Status Badge & Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl shadow-inner mb-4">
          {isCod ? '📦' : '⚡'}
        </div>

        <ChapterHeading
          index="05"
          label={isCod ? 'Cash on Delivery Verified' : mock ? 'Demo Mode' : 'Payment Confirmed'}
          title={isCod ? 'Order' : 'Payment'}
          accent={isCod ? 'Confirmed ⚡' : 'Secured ⚡'}
        />

        <p className="text-neutral-600 text-sm md:text-base -mt-4 mb-6 leading-relaxed max-w-md mx-auto font-medium">
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
              className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold border-none cursor-pointer transition-all shrink-0"
            >
              {copied ? '✓ Copied' : 'Copy ID'}
            </button>
          </div>
        )}

        {/* MODULE 3.1: RareEmber Digital Archival Ownership Pass */}
        <div className="mb-6 bg-zinc-950 text-white rounded-2xl p-6 sm:p-7 border border-amber-500/30 shadow-2xl relative overflow-hidden text-left">
          {/* Subtle animated metallic shimmer gradient across the card border */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/[0.12] to-transparent pointer-events-none animate-shimmer-sweep" />

          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4 mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 pulse-live-dot" />
                <span className="text-[11px] font-mono tracking-widest uppercase text-amber-300 font-black">
                  RARE EMBER ATELIER • VERIFIED ARCHIVAL PASS
                </span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  ✓
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                EDITION PASS #RE-{passId}
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Issue Date</span>
              <span className="text-xs font-mono font-bold text-amber-200">{currentDateStr}</span>
            </div>
          </div>

          {/* Serial & Order ID Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-4 relative z-10">
            <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] uppercase font-mono text-neutral-400 block">Pass Status</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Minted &amp; Verified
              </span>
            </div>
            <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] uppercase font-mono text-neutral-400 block">Order ID</span>
              <span className="font-mono font-bold text-neutral-200 mt-0.5 block truncate" title={orderId}>
                #{orderId.slice(0, 8)}…
              </span>
            </div>
            <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] uppercase font-mono text-neutral-400 block">Dispatch Carrier</span>
              <span className="font-bold text-neutral-200 mt-0.5 block">Delhivery / Blue Dart Air</span>
            </div>
            <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] uppercase font-mono text-neutral-400 block">Atelier Origin</span>
              <span className="font-bold text-neutral-200 mt-0.5 block">Tirupur Hub, India</span>
            </div>
          </div>

          {/* Quality Lock Badges */}
          <div className="pt-3 border-t border-amber-500/20 flex flex-wrap items-center gap-2 text-[11px] text-amber-100 font-semibold relative z-10">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>300 DPI Master Print Queued</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Bio-Washed Tirupur Grade-A Cotton</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>7-Day Free Size Exchange Protected</span>
            </span>
          </div>
        </div>

        {/* Reassuring 2-Hour Size Change Grace Window Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0 mt-0.5">⏱️</span>
            <div>
              <div className="text-xs font-black text-amber-950">
                Ordered the Wrong Size by Mistake?
              </div>
              <div className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                You have a <strong>2-hour grace window</strong> before fabric cutting begins to switch your size for free via 1-tap WhatsApp.
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
              Delhivery Air &amp; Blue Dart Express
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

        {/* MODULE 3.2: Live 5-Stage Tirupur Atelier Production Telemetry */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-white border border-black/[0.08] text-left shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <span>🏭 Live Tirupur Atelier Production Telemetry</span>
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">
                Real-time 5-stage craftsmanship pipeline mapped to your order
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 pulse-live-dot" />
              Stage 1 Active
            </span>
          </div>

          <div className="space-y-3">
            {telemetryStages.map((stg) => (
              <div
                key={stg.stageNum}
                className={`p-3.5 rounded-2xl border transition-all ${
                  stg.isActive
                    ? 'bg-emerald-50/70 border-emerald-500/30 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-neutral-50/70 border-black/[0.05] opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-lg shrink-0 mt-0.5">{stg.icon}</span>
                    <div className="min-w-0">
                      <div className="font-extrabold text-neutral-900 flex items-center gap-2 flex-wrap">
                        <span>Stage {stg.stageNum}: {stg.title}</span>
                        {stg.isActive && (
                          <span className="text-[9px] bg-[#059669] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Active Now
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                        &ldquo;{stg.desc}&rdquo;
                      </p>
                      <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                        Estimated Target: {stg.timing}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold shrink-0 px-2 py-0.5 rounded ${stg.isActive ? 'text-emerald-800 bg-emerald-100' : 'text-neutral-500 bg-neutral-200/60'}`}>
                    {stg.isActive ? 'In Progress' : 'Queued'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODULE 3.3: Zero-Regret Post-Order Actions (3 Primary Action Buttons) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Action 1: WhatsApp VIP Dispatch Updates */}
          <a
            href={whatsappVipUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider no-underline transition-all text-center inline-flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <span>📲</span>
            <span>Get Live Dispatch Photos on WhatsApp</span>
          </a>

          {/* Action 2: Download / Print Official GST Tax Invoice */}
          <button
            onClick={handlePrintInvoice}
            className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs border border-black/15 cursor-pointer transition-all text-center inline-flex items-center justify-center gap-2 shadow-xs active:scale-95"
          >
            <span>📄</span>
            <span>Download / Print Official GST Tax Invoice</span>
          </button>

          {/* Action 3: Open Live Order Tracker */}
          <Link
            href={trackUrl}
            className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-[#0D0D0F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider no-underline transition-all text-center inline-flex items-center justify-center gap-2 shadow-sm active:scale-95 animate-shimmer-sweep"
          >
            <span>📍</span>
            <span>Open Live Order Tracker (/track)</span>
          </Link>
        </div>

        {/* 1-Tap Concierge Reassurance */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>Need priority concierge assistance?</span>
          <a
            href={whatsappVipUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-bold underline inline-flex items-center gap-1"
          >
            <span>💬</span> Chat with Atelier Concierge on WhatsApp
          </a>
        </div>
      </div>

      {/* Printable Structured GST Tax Invoice (Always printed via window.print(), or visible in preview modal) */}
      <div className={`${showInvoiceModal ? 'fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center' : 'hidden'} print:block print:p-0`}>
        <div className="tax-invoice-printable-sheet bg-white text-[#161311] rounded-2xl p-6 sm:p-10 shadow-2xl border border-black/10 text-left font-sans max-w-2xl w-full my-8">
          <div className="no-print flex justify-between items-center mb-4 pb-3 border-b border-neutral-200">
            <span className="font-mono text-xs font-bold text-neutral-500">Official GST Invoice Preview</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-[#0D0D0F] text-white text-xs font-bold cursor-pointer hover:bg-black transition-all"
              >
                🖨️ Print Now
              </button>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-bold flex items-center justify-center cursor-pointer border-none transition-all"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Top Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-neutral-900 gap-4">
            <div>
              <div className="text-2xl font-black tracking-tight text-neutral-950">RARE EMBER™</div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF4D24] mt-0.5">
                Original Tax Invoice / Bill of Supply
              </p>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Rare Ember Private Limited • Atelier Streetwear Division<br />
                Bangalore Hub, Karnataka — 562107<br />
                Support: support@rareember.shop | +91 91182 11860
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-black uppercase tracking-wider text-neutral-700">
                Original for Recipient
              </span>
              <p className="text-xs font-mono font-bold text-neutral-900 mt-2">
                Invoice No: INV-RE-{passId}
              </p>
              <p className="text-[11px] text-neutral-500">
                Date: {currentDateStr}
              </p>
              <p className="text-[11px] font-mono text-neutral-500">
                Order Ref: #{orderId.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Consignee & Supplier Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-neutral-200 text-xs">
            <div>
              <p className="font-black uppercase tracking-wider text-neutral-400 text-[10px] mb-1">
                Billed To / Delivery Consignee
              </p>
              <p className="font-extrabold text-neutral-900 text-sm">
                Valued Patron
              </p>
              <p className="text-neutral-600 mt-0.5 leading-relaxed">
                Customer Delivery Address • India
              </p>
              <p className="text-[11px] font-mono text-neutral-500 mt-1">
                Email: {email}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="font-black uppercase tracking-wider text-neutral-400 text-[10px] mb-1">
                Fulfillment &amp; Payment Terms
              </p>
              <p className="font-bold text-neutral-900">
                Payment Mode: {isCod ? 'Cash on Delivery (COD)' : 'Prepaid (Online SSL)'}
              </p>
              <p className="text-neutral-600 mt-0.5">
                Carrier: Delhivery Air Express (Domestic Air)
              </p>
              <p className="font-mono text-neutral-700 font-bold mt-0.5">
                AWB Ref: Pre-Manifested
              </p>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                Status: Insured Express Dispatch Assigned
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 text-[10px] uppercase font-black tracking-wider text-neutral-600">
                  <th className="py-2.5">#</th>
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">HSN</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Rate</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="py-3 text-neutral-400 font-bold">1</td>
                  <td className="py-3 font-bold text-neutral-900">
                    Rare Ember Curated Garment Drop (Atelier Limited Edition)
                  </td>
                  <td className="py-3 text-center font-mono text-neutral-500">6109</td>
                  <td className="py-3 text-center font-bold text-neutral-900">1</td>
                  <td className="py-3 text-right text-neutral-600">₹{orderTotal}</td>
                  <td className="py-3 text-right font-extrabold text-neutral-900">₹{orderTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & GST Summary */}
          <div className="pt-4 border-t-2 border-neutral-900 flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Taxable Value:</span>
                <span className="font-mono">₹{taxableValue}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>CGST (2.5%):</span>
                <span className="font-mono">₹{cgst}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>SGST (2.5%):</span>
                <span className="font-mono">₹{sgst}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-neutral-950 pt-2 border-t border-neutral-200">
                <span>Total Amount:</span>
                <span className="font-mono">₹{orderTotal}</span>
              </div>
            </div>
          </div>

          {/* Tax Invoice Footer */}
          <div className="mt-8 pt-4 border-t border-dashed border-neutral-200 text-[10px] text-neutral-500 flex justify-between items-center flex-wrap gap-2">
            <span>GST Composition / Micro-Enterprise D2C Declaration. This is a computer-generated tax invoice.</span>
            <span className="font-bold text-neutral-800">support@rareember.shop</span>
          </div>
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
