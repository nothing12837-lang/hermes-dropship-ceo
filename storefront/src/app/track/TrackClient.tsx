'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChapterHeading } from '@/components/ui/Story';
import { formatPrice, products } from '@/lib/data/products';
import { useGeo } from '@/context/GeoContext';

interface OrderItem {
  id: string;
  qty: number;
  title?: string;
  price?: number;
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
      label: 'Picked & Packed 📦',
      badgeBg: 'bg-blue-500/10 text-blue-900 border-blue-500/20',
      stepIndex: 1,
      stageOneTitle: isCod ? 'Order Confirmed ⚡' : 'Payment Confirmed 💳',
      stageOneDesc: isCod ? 'COD order placed.' : 'Prepaid transaction verified.',
      icon: '📦',
    };
  }
  if (s === 'shipped' || s === 'in transit') {
    return {
      label: 'In Transit with Courier 🚚',
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

export function TrackClient() {
  const { formatPrice: geoFormatPrice } = useGeo();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [looked, setLooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qOrder = searchParams.get('orderId') || searchParams.get('order_id');
    if (qEmail || qOrder) {
      if (qEmail) setEmail(qEmail);
      if (qOrder) setOrderId(qOrder);
      executeLookup(qEmail || '', qOrder || '');
    }
  }, [searchParams]);

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
      }
    } catch {
      setOrders([]);
      setErrorMessage('Network error while looking up order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <ChapterHeading index="📍" label="Order tracking" title="Where is" accent="my order?" />
        <p className="text-neutral-500 text-sm -mt-6 mb-8">
          Enter your Order ID and registered Email for real-time live package tracking with door-to-door courier milestones.
        </p>

        {/* Search Card */}
        <div className="rounded-[1.75rem] bg-white border border-black/[0.06] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
              placeholder="Order ID (e.g. 6c7e6415…)"
              className="flex-1 px-4 py-3.5 text-sm rounded-full border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all"
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
        </div>

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
                  
                  const timeline = [
                    {
                      title: meta.stageOneTitle,
                      desc: meta.stageOneDesc,
                      icon: isCod ? '💵' : '💳',
                    },
                    {
                      title: 'Picked & Packed 📦',
                      desc: 'Factory quality check complete. Packed in tamper-proof bubble mailer.',
                      icon: '📦',
                    },
                    {
                      title: 'Dispatched with Courier 🚚',
                      desc: 'Carrier scanned package. Moving across national transit hubs.',
                      icon: '🚚',
                    },
                    {
                      title: 'Delivered to Doorstep 🏠',
                      desc: 'Package handed over. 7-Day Easy Return Guarantee activated.',
                      icon: '🏠',
                    },
                  ];

                  const totalItems = o.items && o.items.length > 0
                    ? o.items.reduce((acc, curr) => acc + (Number(curr.qty) || 1), 0)
                    : 1;

                  return (
                    <div
                      key={o.id}
                      className="rounded-[1.75rem] bg-white border border-black/[0.06] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-black/[0.06]">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm md:text-base font-extrabold text-neutral-900 tracking-tight">
                              Order #{o.id.slice(0, 8)}…
                            </h2>
                            <button
                              onClick={() => copyToClipboard(o.id)}
                              className="text-[11px] text-neutral-400 hover:text-neutral-900 border-none bg-transparent cursor-pointer p-0 underline"
                              title="Copy Full Order ID"
                            >
                              {copiedId === o.id ? '✓ Copied' : 'Copy ID'}
                            </button>
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Placed on {new Date(o.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {totalItems} item{totalItems === 1 ? '' : 's'} • {geoFormatPrice(o.total)}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${meta.badgeBg}`}>
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                          <span>{meta.label}</span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      {o.items && o.items.length > 0 && (
                        <div className="py-4 border-b border-black/[0.06]">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                            Purchased Items
                          </p>
                          <div className="flex flex-wrap gap-2.5">
                            {o.items.map((it, idx) => {
                              const prod = products.find((p) => p.id === it.id);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2.5 p-2 pr-3 rounded-2xl bg-neutral-50 border border-black/[0.04] text-xs"
                                >
                                  <div className="w-8 h-8 rounded-xl bg-white border border-black/5 flex items-center justify-center shrink-0 overflow-hidden relative text-base">
                                    {prod?.image_url ? (
                                      <Image
                                        src={prod.image_url}
                                        alt={prod.title}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <span>{prod?.emoji || '🛍️'}</span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-neutral-900 truncate max-w-[160px]">
                                      {prod?.title || it.title || it.id}
                                    </p>
                                    <p className="text-[10px] text-neutral-400">
                                      Qty: {it.qty || 1}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 4-Stage Visual Milestones */}
                      <div className="pt-6">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-4">
                          Fulfillment Progress
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          {timeline.map((step, idx) => {
                            const isDone = idx < meta.stepIndex;
                            const isCurrent = idx === meta.stepIndex;
                            return (
                              <div
                                key={idx}
                                className={`p-4 rounded-2xl border transition-all ${
                                  isCurrent
                                    ? 'bg-[#161311] text-white border-black/10 shadow-md ring-2 ring-[#FF4D24]/20'
                                    : isDone
                                    ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-emerald-950'
                                    : 'bg-neutral-50/50 border-black/[0.04] text-neutral-400 opacity-60'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xl">{step.icon}</span>
                                  {isDone && (
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                      ✓ Done
                                    </span>
                                  )}
                                  {isCurrent && (
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4D24] bg-white/10 px-2 py-0.5 rounded-full">
                                      Active
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

                      {/* Tracking link bar */}
                      {(o.tracking_number || o.tracking_url) && (
                        <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🚚</span>
                            <div>
                              <p className="text-xs font-bold text-amber-950">Courier Airway Bill (AWB)</p>
                              <p className="text-[11px] text-amber-800 font-mono font-semibold">
                                {o.tracking_number || 'Live Courier Dispatch'}
                              </p>
                            </div>
                          </div>
                          {o.tracking_url && (
                            <a
                              href={o.tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-xs font-bold no-underline transition-all"
                            >
                              Open Live Courier Map 📍 →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Clean Support Concierge Footer Card */}
        <div className="mt-8 p-5 rounded-2xl bg-white border border-black/[0.06] shadow-xs text-xs text-neutral-600 flex items-start gap-3.5">
          <span className="text-2xl shrink-0">🛡️</span>
          <div>
            <p className="font-bold text-neutral-900 text-sm">Need immediate assistance with your delivery?</p>
            <p className="mt-1 text-neutral-500 leading-relaxed">
              Our concierge team at <a href="mailto:rareemberagency@gmail.com" className="font-bold text-[#FF4D24] no-underline hover:underline">rareemberagency@gmail.com</a> replies in under 12 hours. Please include your registered email address and Order ID for immediate priority lookup.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
