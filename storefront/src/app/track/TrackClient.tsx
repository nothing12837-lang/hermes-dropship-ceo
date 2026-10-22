'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChapterHeading } from '@/components/ui/Story';
import { products, cleanBrandTitle } from '@/lib/data/products';
import { useGeo } from '@/context/GeoContext';

interface OrderItem {
  id: string;
  qty: number;
  title?: string;
  price?: number;
  imageUrl?: string;
  size?: string;
  color?: string;
  selectedStyle?: string;
}

interface Order {
  id: string;
  email: string;
  user_email?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  payment_method?: string;
  shipping_name?: string | null;
  shipping_address?: {
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
    line1?: string | null;
  } | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
}

function getStatusDetails(status: string, paymentMethod?: string) {
  const s = (status || 'pending').toLowerCase();
  const isCod = s.includes('cod') || paymentMethod === 'cod';

  if (s === 'pending_cod') {
    return {
      label: 'Cash on Delivery Confirmed',
      badgeBg: 'bg-amber-500/10 text-amber-900 border-amber-500/20',
      stepIndex: 0,
      stageOneTitle: 'Order Confirmed ⚡',
      stageOneDesc: 'Cash on Delivery verified. Warehouse preparing dispatch.',
      icon: '💵',
    };
  }
  if (s === 'paid') {
    return {
      label: 'Payment Verified ⚡',
      badgeBg: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20',
      stepIndex: 0,
      stageOneTitle: 'Payment Confirmed 💳',
      stageOneDesc: 'Payment secured via 256-bit SSL gateway. Warehouse notified.',
      icon: '💳',
    };
  }
  if (s === 'processing' || s === 'fulfilled') {
    return {
      label: 'In Production & Quality Check 🧵',
      badgeBg: 'bg-indigo-500/10 text-indigo-900 border-indigo-500/20',
      stepIndex: 1,
      stageOneTitle: isCod ? 'Order Confirmed ⚡' : 'Payment Confirmed 💳',
      stageOneDesc: isCod ? 'COD order placed & verified.' : 'Prepaid transaction verified.',
      icon: '🧵',
    };
  }
  if (s === 'shipped' || s === 'in transit') {
    return {
      label: 'Dispatched with Delhivery Air 🚚',
      badgeBg: 'bg-purple-500/10 text-purple-900 border-purple-500/20',
      stepIndex: 2,
      stageOneTitle: isCod ? 'Order Confirmed ⚡' : 'Payment Confirmed 💳',
      stageOneDesc: isCod ? 'COD order placed.' : 'Prepaid transaction verified.',
      icon: '🚚',
    };
  }
  if (s === 'delivered') {
    return {
      label: 'Delivered to Doorstep 🏠',
      badgeBg: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20',
      stepIndex: 3,
      stageOneTitle: isCod ? 'Order Confirmed ⚡' : 'Payment Confirmed 💳',
      stageOneDesc: isCod ? 'COD order placed.' : 'Prepaid transaction verified.',
      icon: '🏠',
    };
  }
  return {
    label: isCod ? 'COD Order Placed' : 'Order Registered ⏳',
    badgeBg: 'bg-neutral-500/10 text-neutral-800 border-neutral-500/20',
    stepIndex: 0,
    stageOneTitle: isCod ? 'Order Confirmed (COD)' : 'Order Received',
    stageOneDesc: 'Order registered in system. Preparing warehouse dispatch queue.',
    icon: isCod ? '💵' : '⏳',
  };
}

function getEstimatedDeliveryDate(createdAt: string): string {
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return '3–5 Business Days';
  const start = new Date(d);
  start.setDate(start.getDate() + 3);
  const end = new Date(d);
  end.setDate(end.getDate() + 5);

  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

export function TrackClient() {
  const { formatPrice: geoFormatPrice } = useGeo();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [looked, setLooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const executeLookup = async (targetEmail: string, targetOrderId: string) => {
    setErrorMessage(null);
    const cleanEmail = targetEmail.trim();
    const cleanOrderId = targetOrderId.trim();

    if (!cleanEmail && !cleanOrderId) {
      setLooked(true);
      setErrorMessage('Please enter both your Order ID and registered Email address.');
      setOrders([]);
      return;
    }

    if (!cleanOrderId || !cleanEmail.includes('@')) {
      setLooked(true);
      setErrorMessage('Security verification: Please enter BOTH your Order ID and registered Email address to view tracking milestones.');
      setOrders([]);
      return;
    }

    setLoading(true);
    setLooked(true);
    try {
      const params = new URLSearchParams();
      params.set('email', cleanEmail);
      params.set('orderId', cleanOrderId);
      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setOrders([]);
        setErrorMessage(data.error || 'Unable to locate order tracking details.');
      } else {
        setOrders(data.orders ?? []);
        if (data.orders && data.orders.length > 0) {
          setShowSearchForm(false);
        }
      }
    } catch {
      setOrders([]);
      setErrorMessage('Network error while looking up order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qOrder = searchParams.get('orderId') || searchParams.get('order_id');
    if (qEmail || qOrder) {
      if (qEmail) setEmail(qEmail);
      if (qOrder) setOrderId(qOrder);
      executeLookup(qEmail || '', qOrder || '');
    } else {
      setShowSearchForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleManualLookup = () => {
    executeLookup(email, orderId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="page-top min-h-screen bg-[#FFFBF5] text-[#161311] py-8 md:py-12">
      {/* Print-only stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, footer, nav, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .tax-invoice-modal-backdrop {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .tax-invoice-sheet {
            box-shadow: none !important;
            border: 2px solid #111 !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 24px !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <ChapterHeading index="📍" label="Real-Time Order Tracking" title="Where is" accent="my order?" />
        <p className="text-neutral-500 text-sm -mt-6 mb-8 no-print">
          Door-to-door courier tracking with live manufacturing milestones, carrier AWB, and doorstep dispatch updates.
        </p>

        {/* Collapsible Search Card or Compact Banner */}
        {orders.length > 0 && !showSearchForm ? (
          <div className="no-print mb-8 p-4 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5 text-xs text-neutral-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Tracking active order for <strong className="text-neutral-900">{email}</strong>
              </span>
            </div>
            <button
              onClick={() => setShowSearchForm(true)}
              className="text-xs font-bold text-[#FF4D24] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
            >
              <span>🔍</span> Track Another Order
            </button>
          </div>
        ) : (
          <div className="no-print rounded-[1.75rem] bg-white border border-black/[0.06] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
                placeholder="Order ID (e.g. 7792e434…)"
                className="flex-1 px-4 py-3.5 text-sm rounded-full border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all font-mono"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
                placeholder="Registered Email (you@email.com)"
                className="flex-1 px-4 py-3.5 text-sm rounded-full border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all"
              />
              <button
                onClick={handleManualLookup}
                disabled={loading}
                className="px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-wider text-white bg-[#1d1d1f] hover:bg-black active:scale-95 transition-all cursor-pointer border-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Searching…' : '📍 Track Order →'}
              </button>
            </div>

            <div className="mt-3.5 pt-3 border-t border-black/[0.04] flex items-center justify-between flex-wrap gap-2 text-[11px] text-neutral-500">
              <span>💡 Need to test or preview tracking?</span>
              <button
                type="button"
                onClick={() => {
                  setOrderId('RE-2026-DELHIVERY');
                  setEmail('vip@rareember.shop');
                  setLooked(true);
                  setErrorMessage(null);
                  setShowSearchForm(false);
                  setOrders([
                    {
                      id: '7792e434-7bf5-4ff4-9296-cf2f4c2af57f',
                      email: 'aj************@gmail.com',
                      items: [
                        {
                          id: 'qikink-32477737-mens-full-sleeve-t-shirt__size-M__color-Grey_Melange',
                          qty: 1,
                          title: "Men's Full Sleeve T-Shirt — Rare Ember Signature Graphic",
                          price: 899,
                          size: 'M',
                          color: 'Grey Melange',
                          imageUrl: 'https://qikink-assets.s3.ap-south-1.amazonaws.com/clients/658581/clientProducts/32477737/images/Front_1_c_4.jpg',
                        },
                      ],
                      subtotal: 499,
                      shipping: 49,
                      total: 548,
                      status: 'processing',
                      payment_method: 'cod',
                      shipping_name: 'Ajay Rajbhar',
                      shipping_address: {
                        city: 'Bangalore',
                        state: 'Karnataka',
                        zip: '562107',
                        country: 'India',
                      },
                      tracking_number: 'BD-18023747616',
                      tracking_url: null,
                      created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
                    },
                  ]);
                }}
                className="font-bold text-[#FF4D24] hover:underline cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1"
              >
                <span>⚡</span> Preview Sample Live Courier Timeline →
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {looked && (
          <div>
            {errorMessage ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-6 flex items-center gap-2">
                <span>⚠️</span> {errorMessage}
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-[1.75rem] bg-white border border-black/[0.06] p-8 text-center shadow-sm">
                <span className="text-4xl block mb-3">🔍</span>
                <h3 className="font-bold text-base text-neutral-900 mb-1">No orders located</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
                  We couldn&apos;t find an order matching <span className="font-bold text-neutral-800">{orderId}</span> and <span className="font-bold text-neutral-800">{email}</span>. Double-check your confirmation receipt or try searching by email.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d1d1f] text-white text-xs font-bold no-underline hover:bg-black transition-all"
                >
                  Explore Trending Catalog ⚡ →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map((o) => {
                  const meta = getStatusDetails(o.status, o.payment_method);
                  const isCod = o.status.toLowerCase().includes('cod') || o.payment_method === 'cod';
                  const estimatedDelivery = getEstimatedDeliveryDate(o.created_at);

                  const timeline = [
                    {
                      title: meta.stageOneTitle,
                      desc: isCod
                        ? 'Cash on Delivery verified & queued on factory ledger.'
                        : 'Prepaid transaction verified via SSL gateway.',
                      icon: isCod ? '💵' : '💳',
                      label: 'Verified',
                    },
                    {
                      title: 'In Production & Quality Check 🧵',
                      desc: 'Garment blank pulled from warehouse. High-def DTF print applied & dual QA inspected.',
                      icon: '🧵',
                      label: 'Printing & QA',
                    },
                    {
                      title: 'Dispatched with Courier 🚚',
                      desc: 'Packed in tamper-proof bubble mailer. Handed to Delhivery Air Express.',
                      icon: '🚚',
                      label: 'Air Transit',
                    },
                    {
                      title: 'Delivered to Doorstep 🏠',
                      desc: 'Handed over at doorstep. 7-Day Free Replacement Guarantee active.',
                      icon: '🏠',
                      label: 'Doorstep',
                    },
                  ];

                  const totalItems = o.items && o.items.length > 0
                    ? o.items.reduce((acc, curr) => acc + (Number(curr.qty) || 1), 0)
                    : 1;

                  // Clean tracking number & external courier URL
                  const rawAwb = (o.tracking_number || '').replace(/^BD-/, '').trim();
                  const courierUrl = o.tracking_url && !o.tracking_url.endsWith('?awb=')
                    ? o.tracking_url
                    : rawAwb
                    ? `https://www.delhivery.com/track/package/${rawAwb}`
                    : null;

                  return (
                    <div
                      key={o.id}
                      className="print-clean rounded-[2rem] bg-white border border-black/[0.06] p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-black/[0.06]">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base md:text-lg font-black text-neutral-900 tracking-tight font-mono">
                              Order #{o.id.slice(0, 8)}…
                            </h2>
                            <button
                              onClick={() => copyToClipboard(o.id)}
                              className="no-print text-[11px] text-neutral-400 hover:text-neutral-900 border-none bg-transparent cursor-pointer p-0 underline font-sans"
                              title="Copy Full Order ID"
                            >
                              {copiedId === o.id ? '✓ Copied' : 'Copy ID'}
                            </button>
                            <span className="no-print text-neutral-300">•</span>
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceOrder(o)}
                              className="no-print px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[11px] text-neutral-800 font-bold border border-black/5 cursor-pointer inline-flex items-center gap-1 font-sans transition-all"
                              title="View & Download Official Retail Bill / Tax Invoice"
                            >
                              <span>📄</span> View Tax Invoice
                            </button>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">
                            Placed on {new Date(o.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {totalItems} item{totalItems === 1 ? '' : 's'} • {geoFormatPrice(o.total)}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${meta.badgeBg}`}>
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                          <span>{meta.label}</span>
                        </div>
                      </div>

                      {/* Estimated Delivery Highlight Banner */}
                      <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.05] to-transparent border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center text-lg shrink-0">
                            ⚡
                          </div>
                          <div>
                            <p className="text-xs font-black text-amber-950 uppercase tracking-wider">
                              Estimated Doorstep Delivery
                            </p>
                            <p className="text-sm font-extrabold text-neutral-900">
                              {estimatedDelivery}{' '}
                              <span className="text-xs font-medium text-neutral-500">(Domestic Express)</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-[11px] font-bold text-amber-900 bg-amber-100/70 border border-amber-300/40 px-3 py-1 rounded-full">
                          {isCod ? '💵 COD — Cash / UPI on Delivery' : '✓ 100% Prepaid & Insured'}
                        </div>
                      </div>

                      {/* Connected Fulfillment Stepper (Responsive) */}
                      <div className="pt-7">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                            Fulfillment Journey
                          </p>
                          <span className="text-[11px] font-semibold text-neutral-400">
                            Stage {meta.stepIndex + 1} of 4
                          </span>
                        </div>

                        {/* Progress Line Bar (Desktop/Tablet) */}
                        <div className="relative mb-6 hidden sm:block">
                          <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200/80 -translate-y-1/2 rounded-full z-0" />
                          <div
                            className="absolute top-1/2 left-0 h-1 bg-[#FF4D24] -translate-y-1/2 rounded-full transition-all duration-700 z-0"
                            style={{
                              width: `${Math.min(100, (meta.stepIndex / 3) * 100)}%`,
                            }}
                          />
                          <div className="relative z-10 flex justify-between">
                            {timeline.map((step, idx) => {
                              const isDone = idx < meta.stepIndex;
                              const isCurrent = idx === meta.stepIndex;
                              return (
                                <div key={idx} className="flex flex-col items-center">
                                  <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                      isDone
                                        ? 'bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-500/20'
                                        : isCurrent
                                        ? 'bg-[#161311] text-white shadow-md ring-4 ring-[#FF4D24]/30 scale-110'
                                        : 'bg-white text-neutral-400 border-2 border-neutral-200'
                                    }`}
                                  >
                                    {isDone ? '✓' : step.icon}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Stepper Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          {timeline.map((step, idx) => {
                            const isDone = idx < meta.stepIndex;
                            const isCurrent = idx === meta.stepIndex;
                            return (
                              <div
                                key={idx}
                                className={`p-4 rounded-2xl border transition-all ${
                                  isCurrent
                                    ? 'bg-[#161311] text-white border-black/10 shadow-lg ring-2 ring-[#FF4D24]/30'
                                    : isDone
                                    ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-emerald-950'
                                    : 'bg-neutral-50/50 border-black/[0.04] text-neutral-400 opacity-60'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xl sm:hidden">{step.icon}</span>
                                  {isDone && (
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                      ✓ Done
                                    </span>
                                  )}
                                  {isCurrent && (
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4D24] bg-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D24] animate-ping" />
                                      Active
                                    </span>
                                  )}
                                  {!isDone && !isCurrent && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                      Upcoming
                                    </span>
                                  )}
                                </div>
                                <h3 className={`font-bold text-xs ${isCurrent ? 'text-white' : 'text-neutral-900'}`}>
                                  {idx + 1}. {step.title}
                                </h3>
                                <p className={`text-[11px] mt-1 leading-relaxed ${isCurrent ? 'text-neutral-300' : 'text-neutral-500'}`}>
                                  {step.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Purchased Items Section */}
                      {o.items && o.items.length > 0 && (
                        <div className="py-6 border-b border-black/[0.06]">
                          <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-3">
                            Purchased Drop Items
                          </p>
                          <div className="flex flex-col gap-2.5">
                            {o.items.map((it, idx) => {
                              const baseId = it.id.split('__')[0];
                              const prod = products.find((p) => p.id === it.id || p.id === baseId);
                              const itemImage = it.imageUrl || prod?.image_url;
                              const displayTitle = cleanBrandTitle(it.title || prod?.title || it.id);
                              const itemPrice = it.price || prod?.price || Math.round(o.total / Math.max(1, o.items.length));

                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-neutral-50/70 border border-black/[0.04]"
                                >
                                  <div className="w-14 h-14 rounded-xl bg-white border border-black/5 flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
                                    {itemImage ? (
                                      <Image
                                        src={itemImage}
                                        alt={displayTitle}
                                        fill
                                        sizes="56px"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <span className="text-2xl">{prod?.emoji || '🛍️'}</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                                      {displayTitle}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                      {it.size && (
                                        <span className="text-[10px] font-bold bg-white border border-black/10 px-2 py-0.5 rounded-md text-neutral-700">
                                          Size: {it.size}
                                        </span>
                                      )}
                                      {it.color && (
                                        <span className="text-[10px] font-bold bg-white border border-black/10 px-2 py-0.5 rounded-md text-neutral-700">
                                          Color: {it.color}
                                        </span>
                                      )}
                                      <span className="text-[10px] font-semibold text-neutral-500">
                                        Qty: {it.qty || 1}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xs sm:text-sm font-black text-neutral-900">
                                      {geoFormatPrice(itemPrice * (it.qty || 1))}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Delivery Destination & Payment Breakdown Card */}
                      {o.shipping_address && (
                        <div className="py-6 border-b border-black/[0.06]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Shipping Destination */}
                            <div className="p-4 rounded-2xl bg-neutral-50/70 border border-black/[0.04] space-y-1">
                              <div className="flex items-center gap-1.5 text-neutral-400">
                                <span className="text-sm">📍</span>
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                  Delivery Destination
                                </span>
                              </div>
                              <p className="text-xs font-bold text-neutral-900">
                                {o.shipping_name || 'Valued Customer'}
                              </p>
                              <p className="text-xs text-neutral-600 leading-relaxed">
                                {[o.shipping_address.city, o.shipping_address.state, o.shipping_address.zip].filter(Boolean).join(', ')} • India
                              </p>
                              <p className="text-[10px] text-emerald-700 font-semibold pt-1">
                                ✓ Domestic Pin Serviceable via Delhivery Air
                              </p>
                            </div>

                            {/* Payment Summary */}
                            <div className="p-4 rounded-2xl bg-neutral-50/70 border border-black/[0.04] space-y-1">
                              <div className="flex items-center gap-1.5 text-neutral-400">
                                <span className="text-sm">💵</span>
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                  Billing & Payment
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs pt-0.5">
                                <span className="text-neutral-600">Payment Mode:</span>
                                <span className="font-bold text-neutral-900">
                                  {isCod ? 'Cash on Delivery (COD)' : 'Prepaid (SSL Secured)'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-neutral-600">Grand Total:</span>
                                <span className="font-black text-neutral-900">{geoFormatPrice(o.total)}</span>
                              </div>
                              {isCod && (
                                <p className="text-[10px] text-amber-800 font-semibold bg-amber-500/10 px-2 py-1 rounded-md mt-1">
                                  💡 Pay {geoFormatPrice(o.total)} via Cash or UPI QR to delivery executive
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Courier Tracking Link Bar */}
                      {(o.tracking_number || courierUrl) && (
                        <div className="mt-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-purple-500/[0.07] to-indigo-500/[0.04] border border-purple-500/20 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-700 flex items-center justify-center text-xl shrink-0">
                              🚚
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-purple-950 uppercase tracking-wider">
                                  Carrier: Delhivery Air Express
                                </p>
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.2 rounded-full">
                                  Domestic Air
                                </span>
                              </div>
                              <p className="text-xs text-neutral-700 font-mono font-bold mt-0.5">
                                AWB / Reference: {o.tracking_number || rawAwb}
                              </p>
                              <p className="text-[11px] text-neutral-500 mt-0.5">
                                Scans update in real-time as the package moves through courier air hubs.
                              </p>
                            </div>
                          </div>
                          {courierUrl && (
                            <a
                              href={courierUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="no-print px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-xs font-bold no-underline transition-all shadow-md shrink-0 inline-flex items-center gap-1.5"
                            >
                              <span>Open Live Delhivery Tracker</span>
                              <span>📍 →</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* 7-Day Free Replacement Guarantee Banner */}
                      <div className="mt-5 pt-4 border-t border-black/[0.06] flex items-center justify-between flex-wrap gap-3">
                        <div className="text-xs text-neutral-500 flex items-center gap-2">
                          <span>🛡️</span>
                          <span>Protected by Rare Ember 7-Day Free Replacement Guarantee</span>
                        </div>
                        <Link
                          href={`/returns?order_id=${encodeURIComponent(o.id)}&email=${encodeURIComponent(o.email)}`}
                          className="no-print px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold transition-all no-underline inline-flex items-center gap-1.5"
                        >
                          <span>🔄</span> Request Size Replacement or Issue Resolution →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 1-Tap Atelier Concierge Support Card with Pre-Populated Order ID */}
        {(() => {
          const currentOrderId = orderId.trim() || (orders.length > 0 ? orders[0].id : '');
          const currentEmail = email.trim() || (orders.length > 0 ? orders[0].email : '');
          const orderMention = currentOrderId ? `Order #${currentOrderId}` : 'my order';

          const waMessage = currentOrderId
            ? `Hi Rare Ember Atelier Concierge, I need urgent dispatch help regarding Order ID: ${currentOrderId}${currentEmail ? ` (${currentEmail})` : ''}. Please check my order status.`
            : 'Hi Rare Ember Atelier Concierge, I need urgent dispatch help regarding my order. Please check my status.';

          const waUrl = `https://wa.me/919118211860?text=${encodeURIComponent(waMessage)}`;

          const emailSubject = currentOrderId
            ? `Urgent Dispatch Help — Order ${currentOrderId}`
            : 'Urgent Dispatch Help — Rare Ember Order';
          const emailBody = `Hi Rare Ember Atelier Concierge,\n\nI need urgent dispatch help regarding ${orderMention}.\nOrder ID: ${currentOrderId || 'N/A'}\nEmail: ${currentEmail || 'N/A'}\n\nPlease provide an update on dispatch and courier tracking.\n\nThank you!`;
          const mailUrl = `mailto:rareemberagency@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

          return (
            <div className="no-print mt-8 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#161311] to-[#26201c] text-white border border-white/10 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF4D24]/20 border border-[#FF4D24]/40 text-[#FF9A3D] text-[11px] font-black uppercase tracking-wider">
                    <span>⚡</span> 12-Hour Priority SLA
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Need Urgent Dispatch Help? Chat with Atelier Concierge
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-lg leading-relaxed">
                    Direct access to our domestic Tirupur dispatch hub. Tap below to chat instantly on WhatsApp or send an email with your {currentOrderId ? <strong>Order #{currentOrderId}</strong> : 'Order ID'} pre-filled.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs no-underline shadow-lg shadow-emerald-900/30 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>💬</span>
                    <span>1-Tap WhatsApp Concierge</span>
                  </a>
                  <a
                    href={mailUrl}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs no-underline border border-white/15 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>✉️</span>
                    <span>Email Atelier</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Official Tax Invoice / Bill of Supply Modal */}
        {selectedInvoiceOrder && (
          <div className="tax-invoice-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl my-8">
              {/* Action Bar (hidden when printing) */}
              <div className="no-print flex items-center justify-between mb-3 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📄</span>
                  <span className="font-bold text-sm">Official Tax Invoice / Bill of Supply</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF4D24] to-[#FF6B35] hover:brightness-105 text-white font-black text-xs uppercase tracking-wider border-none shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <span>🖨️</span>
                    <span>Print / Save as PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceOrder(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white border-none flex items-center justify-center cursor-pointer text-sm font-bold transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Printable A4 Tax Invoice Document Sheet */}
              <div className="tax-invoice-sheet bg-white text-[#161311] rounded-3xl p-6 sm:p-10 shadow-2xl border border-black/10 text-left font-sans">
                {/* Top Header */}
                <div className="flex items-start justify-between pb-6 border-b-2 border-neutral-900 gap-4">
                  <div>
                    <div className="text-2xl font-black tracking-tight text-neutral-950">RARE EMBER™</div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF4D24] mt-0.5">
                      Official Tax Invoice / Retail Bill
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                      Rare Ember Apparel Atelier • Bangalore Hub<br />
                      Tirupur Garment Complex, Tamil Nadu — 641602<br />
                      Contact: rareemberagency@gmail.com | +91 91182 11860
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-black uppercase tracking-wider text-neutral-700">
                      Original for Recipient
                    </span>
                    <p className="text-xs font-mono font-bold text-neutral-900 mt-2">
                      Invoice No: INV-RE-{selectedInvoiceOrder.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Date: {new Date(selectedInvoiceOrder.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[11px] font-mono text-neutral-500">
                      Order Ref: #{selectedInvoiceOrder.id.slice(0, 8)}
                    </p>
                  </div>
                </div>

                {/* Billed To & Logistics Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-neutral-200 text-xs">
                  <div>
                    <p className="font-black uppercase tracking-wider text-neutral-400 text-[10px] mb-1">
                      Billed To / Delivery Consignee
                    </p>
                    <p className="font-extrabold text-neutral-900 text-sm">
                      {selectedInvoiceOrder.shipping_name || 'Valued Customer'}
                    </p>
                    <p className="text-neutral-600 mt-0.5 leading-relaxed">
                      {[
                        selectedInvoiceOrder.shipping_address?.line1,
                        selectedInvoiceOrder.shipping_address?.city,
                        selectedInvoiceOrder.shipping_address?.state,
                        selectedInvoiceOrder.shipping_address?.zip
                      ].filter(Boolean).join(', ')} • India
                    </p>
                    <p className="text-[11px] font-mono text-neutral-500 mt-1">
                      Email: {selectedInvoiceOrder.email}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-black uppercase tracking-wider text-neutral-400 text-[10px] mb-1">
                      Fulfillment &amp; Payment Terms
                    </p>
                    <p className="font-bold text-neutral-900">
                      Payment Method: {selectedInvoiceOrder.payment_method?.toUpperCase() === 'COD' ? '💵 Cash on Delivery (COD)' : '💳 Prepaid (Online UPI/Cards)'}
                    </p>
                    <p className="text-neutral-600 mt-0.5">
                      Carrier: Delhivery Air Express (Domestic Air)
                    </p>
                    <p className="font-mono text-neutral-700 font-bold mt-0.5">
                      AWB Ref: {selectedInvoiceOrder.tracking_number || 'BD-18023747616'}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">
                      Status: Express Doorstep Delivery Assigned
                    </p>
                  </div>
                </div>

                {/* Itemized Invoice Table */}
                <div className="py-5">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-neutral-900 text-[10px] uppercase font-black tracking-wider text-neutral-600">
                        <th className="py-2.5">#</th>
                        <th className="py-2.5">Item Description</th>
                        <th className="py-2.5 text-center">HSN</th>
                        <th className="py-2.5 text-center">Variant</th>
                        <th className="py-2.5 text-center">Qty</th>
                        <th className="py-2.5 text-right">Unit Rate</th>
                        <th className="py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedInvoiceOrder.items.map((it, idx) => {
                        const baseId = it.id.split('__')[0];
                        const prod = products.find((p) => p.id === it.id || p.id === baseId);
                        const displayTitle = cleanBrandTitle(it.title || prod?.title || it.id);
                        const unitRate = it.price || prod?.price || Math.round(selectedInvoiceOrder.total / Math.max(1, selectedInvoiceOrder.items.length));
                        return (
                          <tr key={idx}>
                            <td className="py-3 text-neutral-400 font-bold">{idx + 1}</td>
                            <td className="py-3 font-bold text-neutral-900">
                              {displayTitle}
                            </td>
                            <td className="py-3 text-center font-mono text-neutral-500">6109</td>
                            <td className="py-3 text-center text-neutral-600">
                              {[it.size ? `Size: ${it.size}` : '', it.color ? `Color: ${it.color}` : ''].filter(Boolean).join(' / ') || 'Standard'}
                            </td>
                            <td className="py-3 text-center font-bold text-neutral-900">{it.qty || 1}</td>
                            <td className="py-3 text-right text-neutral-600">₹{unitRate.toLocaleString('en-IN')}</td>
                            <td className="py-3 text-right font-extrabold text-neutral-900">₹{(unitRate * (it.qty || 1)).toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                      {selectedInvoiceOrder.payment_method?.toLowerCase().includes('cod') && (
                        <tr>
                          <td className="py-3 text-neutral-400 font-bold">{selectedInvoiceOrder.items.length + 1}</td>
                          <td className="py-3 font-bold text-neutral-900">
                            Cash on Delivery (COD) Express Courier Surcharge
                          </td>
                          <td className="py-3 text-center font-mono text-neutral-500">9968</td>
                          <td className="py-3 text-center text-neutral-600">Standard Air</td>
                          <td className="py-3 text-center font-bold text-neutral-900">1</td>
                          <td className="py-3 text-right text-neutral-600">₹49.00</td>
                          <td className="py-3 text-right font-extrabold text-neutral-900">₹49.00</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals & Tax Calculation Breakdown */}
                <div className="pt-4 border-t-2 border-neutral-900 flex flex-col sm:flex-row justify-between gap-6 text-xs">
                  <div className="space-y-1.5 max-w-sm">
                    <p className="font-bold text-neutral-900">Tax Classification:</p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Integrated GST (5% inclusive on garments up to ₹1,000, 18% on courier charges). All taxes are inclusive in total collectible value.
                    </p>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600">
                      <span>Tax Breakdown: CGST (2.5%): ₹{(selectedInvoiceOrder.total * 0.0238).toFixed(2)} | SGST (2.5%): ₹{(selectedInvoiceOrder.total * 0.0238).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 w-full sm:w-64 shrink-0">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal:</span>
                      <span>₹{selectedInvoiceOrder.subtotal || selectedInvoiceOrder.total}</span>
                    </div>
                    {selectedInvoiceOrder.payment_method?.toLowerCase().includes('cod') && (
                      <div className="flex justify-between text-neutral-600">
                        <span>COD Courier Handling:</span>
                        <span>₹49.00</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-600">
                      <span>Express Air Shipping:</span>
                      <span className="text-emerald-700 font-bold">FREE</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-neutral-950 pt-2 border-t-2 border-neutral-900">
                      <span>TOTAL PAYABLE:</span>
                      <span className="text-[#FF4D24]">₹{selectedInvoiceOrder.total}</span>
                    </div>
                    {selectedInvoiceOrder.payment_method?.toLowerCase().includes('cod') && (
                      <p className="text-[11px] font-bold text-amber-800 text-right bg-amber-50 p-1.5 rounded border border-amber-200">
                        💵 Collectible at Doorstep: ₹{selectedInvoiceOrder.total}
                      </p>
                    )}
                  </div>
                </div>

                {/* Legal Footer & Signatory */}
                <div className="mt-8 pt-5 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-neutral-500">
                  <div>
                    <p className="font-bold text-neutral-700">Protected by Rare Ember 7-Day Doorstep Replacement Guarantee</p>
                    <p className="mt-0.5">This is a system-generated official retail bill. Certified for domestic delivery.</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="w-24 h-8 border border-dashed border-neutral-300 rounded flex items-center justify-center text-[9px] font-black uppercase text-neutral-400">
                      Rare Ember Seal
                    </div>
                    <span className="text-[10px] font-bold text-neutral-700 mt-1">Authorized Signatory</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
