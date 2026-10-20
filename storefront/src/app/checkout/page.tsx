'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart';
import { formatPrice, products, cleanBrandTitle } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { supabase } from '@/lib/supabase-client';
import { useGeo } from '@/context/GeoContext';
import { validateCouponCode } from '@/lib/festivals';
import { scoreRtoRisk } from '@/lib/rto';
import { trackBeginCheckout, trackAddShippingInfo } from '@/lib/telemetry/dataLayer';

export default function CheckoutPage() {
  const router = useRouter();
  const { market } = useGeo();
  const { items, setQty, remove, clear } = useCart();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [hpCompany, setHpCompany] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      const session = data?.session;
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        if (session.user.email && !email) setEmail(session.user.email);
      }
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        if (session.user.email && !email) setEmail(session.user.email);
      } else {
        setUserId(null);
        setUserEmail(null);
      }
    });

    try {
      const savedPin = localStorage.getItem('rareember_pincode');
      const savedPinData = localStorage.getItem('rareember_pincode_data');
      if (savedPin) setZip(savedPin);
      if (savedPinData) {
        const parsed = JSON.parse(savedPinData);
        if (parsed.city) setCity(parsed.city);
      }
    } catch {}

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const detailed = useMemo(
    () =>
      items
        .map((i) => {
          const found = products.find((p) => p.id === i.id || p.id === i.id.split('__')[0]);
          if (found) {
            return {
              ...i,
              product: {
                ...found,
                price_inr: found.price_inr ?? found.price,
                image_url: resolveProductImage(found.id, found.image_url),
              },
            };
          }
          const inferredInr = i.price_inr != null ? Number(i.price_inr) : (i.price && i.price >= 80 ? Math.round(i.price) : Math.round((i.price || 4.99) * 85));
          return {
            ...i,
            product: {
              id: i.id,
              slug: i.id,
              title: i.title || 'Curated Lifestyle Drop',
              price: Number(i.price ?? inferredInr),
              price_inr: inferredInr,
              emoji: i.emoji || '🛍️',
              image_url: resolveProductImage(i.id, i.imageUrl),
              gradient: i.gradient || 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              short: '',
              story: '',
              details: [],
              rating: 4.8,
              reviews: 120,
              tag: '',
              tagColor: '',
              tagBg: '',
              chapter: '',
              pet: 'both' as const,
              ages: ['all' as const],
              benefits: [],
              safety: '',
              vetNote: '',
              subscribeEligible: false,
              wash: '',
              badges: [],
            },
          };
        })
        .filter((d): d is NonNullable<typeof d> => Boolean(d)),
    [items]
  );

  const isIndia = market === 'IN';
  const getProductItemPrice = (p: { price: number; price_inr?: number }) => {
    if (isIndia) {
      if (p.price_inr && p.price_inr > 0) return p.price_inr;
      return p.price >= 80 ? Math.round(p.price) : Math.round(p.price * 85);
    }
    return p.price >= 80 ? p.price / 85 : p.price;
  };
  const subtotal = detailed.reduce((a, b) => a + getProductItemPrice(b.product) * b.qty, 0);
  const isAboveCodThreshold = isIndia && subtotal >= 3000;

  // Auto-switch away from COD if cart crosses ₹3,000 threshold
  useEffect(() => {
    if (isAboveCodThreshold && paymentMethod === 'cod') {
      setPaymentMethod('online');
    }
  }, [isAboveCodThreshold, paymentMethod]);

  const codFee = paymentMethod === 'cod' && !isAboveCodThreshold ? (isIndia ? 49 : 2) : 0;
  const rawTotal = subtotal + codFee - discount;
  const total = Math.max(0, rawTotal);

  // Telemetry: track begin_checkout on checkout load
  useEffect(() => {
    if (detailed.length > 0) {
      trackBeginCheckout(
        detailed.map((d) => ({
          id: d.id,
          title: d.product.title,
          price: d.product.price_inr || d.product.price,
          qty: d.qty,
          size: d.size,
          category: 'Streetwear Apparel',
        })),
        total,
        isIndia ? 'INR' : 'USD',
        appliedCouponCode
      );
    }
  }, []);

  const formatCheckoutPrice = (val: number) => {
    if (isIndia) {
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    }
    return `$${Number(val).toFixed(2)}`;
  };

  const applyCoupon = () => {
    const hasBundle = detailed.some((d) => d.id.startsWith('bundle-') || (d.product && d.product.id.startsWith('bundle-')));
    if (hasBundle) {
      setError('Promotional discount codes cannot be stacked on pre-discounted combo bundles. Add individual drops to use this coupon!');
      setCouponApplied(false);
      setDiscount(0);
      setAppliedCouponCode('');
      return;
    }

    const res = validateCouponCode(coupon, subtotal);
    if (!res.valid) {
      setError(res.error || 'Invalid coupon code.');
      setCouponApplied(false);
      setDiscount(0);
      setAppliedCouponCode('');
      return;
    }

    setDiscount(res.discountAmount);
    setAppliedCouponCode(res.label);
    setCouponApplied(true);
    setError('');
  };

  interface RazorpayInstance {
    open(): void;
    on(event: 'payment.failed', cb: (resp: { error: { description: string } }) => void): void;
  }

  interface RazorpayWindow extends Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }

  const pay = async () => {
    setError('');
    if (hpCompany) return setError('Automated submission rejected.');
    // Guest checkout fully supported; user_id attached if signed in
    if (!email.includes('@')) return setError('Please enter a valid email address for tracking.');
    if (!name.trim()) return setError('Please enter your full name for courier delivery.');
    const digits = phone.replace(/\D/g, '');
    const normalizedPhone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : (digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits);
    if (!normalizedPhone || normalizedPhone.length !== 10) return setError('Please enter a valid 10-digit mobile number for order & COD confirmation.');
    if (!address.trim()) return setError('Please enter your delivery street address.');
    if (!zip.trim()) return setError('Please enter your PIN / postal code.');
    if (detailed.length === 0) return setError('Your cart is empty. Add a product first.');
    if (loading || processing) return;
    if (paymentMethod === 'cod') {
      if (isAboveCodThreshold) {
        return setError('Cash on Delivery is limited to orders up to ₹2,999. Please select Instant Online Payment (UPI / Cards) for priority doorstep dispatch.');
      }
      const rto = scoreRtoRisk({ phone, pincode: zip, totalInr: 0 });
      if (rto.recommendation === 'PREPAID_ONLY') {
        return setError(`Cash on Delivery is currently unavailable for PIN code ${zip}. Please select Instant Online Payment (UPI / Cards) for priority doorstep delivery.`);
      }
    }

    // Telemetry: track add_shipping_info before order submission
    trackAddShippingInfo(
      detailed.map((d) => ({
        id: d.id,
        title: d.product.title,
        price: d.product.price_inr || d.product.price,
        qty: d.qty,
        size: d.size,
        category: 'Streetwear Apparel',
      })),
      total,
      paymentMethod === 'cod' ? 'Cash on Delivery Air' : 'Insured Express Air',
      isIndia ? 'INR' : 'USD'
    );

    localStorage.setItem('rareember_email', email);
    setLoading(true);
    setProcessing(true);

    // If COD selected, process directly
    if (paymentMethod === 'cod') {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            phone: normalizedPhone,
            address: { line1: address, city, zip, phone: normalizedPhone },
            items: detailed.map((d) => ({
              id: d.id,
              product_id: d.id.split('__')[0],
              title: cleanBrandTitle(d.product.title),
              qty: d.qty,
              imageUrl: d.imageUrl || (d.product as any).image_url,
              selectedStyle: (d as any).selectedStyle,
              size: d.size,
              color: (d as any).color,
              phoneModel: d.phoneModel,
              customText: d.customText,
              customPlacement: d.customPlacement,
              customPosition: (d as any).customPosition,
              customScale: (d as any).customScale,
              customTextColor: (d as any).customTextColor,
              customFont: (d as any).customFont,
              customImage: (d as any).customImage,
              customImageName: (d as any).customImageName,
            })),
            payment_method: 'cod',
            total_amount: total,
            user_id: userId,
            coupon_code: appliedCouponCode || undefined,
            discount: discount || 0,
            _hp_company: hpCompany,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || 'Failed to place COD order.');
          setLoading(false);
          setProcessing(false);
          return;
        }
        clear();
        window.location.href = `/success?cod=1&email=${encodeURIComponent(email)}&total=${total.toFixed(2)}&order_id=${data.order_id || ''}`;
        return;
      } catch {
        setError('Failed to place COD order. Please retry.');
        setLoading(false);
        setProcessing(false);
        return;
      }
    }

    // Razorpay Online Flow
    const rzWindow = window as unknown as RazorpayWindow;
    if (!rzWindow.Razorpay) {
      const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existingScript) {
        await new Promise((r) => setTimeout(r, 300));
      } else {
        try {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
            document.body.appendChild(script);
          });
        } catch {
          setError('Payment gateway failed to load. Please check your internet connection or ad blocker.');
          setLoading(false);
          setProcessing(false);
          return;
        }
      }
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          phone: normalizedPhone,
          address: { line1: address, city, zip, phone: normalizedPhone },
          items: detailed.map((d) => ({
            id: d.id,
            product_id: d.id.split('__')[0],
            title: cleanBrandTitle(d.product.title),
            qty: d.qty,
            imageUrl: d.imageUrl || (d.product as any).image_url,
            selectedStyle: (d as any).selectedStyle,
            size: d.size,
            color: (d as any).color,
            phoneModel: d.phoneModel,
            customText: d.customText,
            customPlacement: d.customPlacement,
            customPosition: (d as any).customPosition,
            customScale: (d as any).customScale,
            customTextColor: (d as any).customTextColor,
            customFont: (d as any).customFont,
            customImage: (d as any).customImage,
            customImageName: (d as any).customImageName,
          })),
          user_id: userId,
          market,
          coupon_code: appliedCouponCode || undefined,
          discount: discount || 0,
          _hp_company: hpCompany,
        }),
      });
      const data = await res.json();

      if (data.mock) {
        clear();
        window.location.href = `/success?mock=1&email=${encodeURIComponent(email)}&total=${total.toFixed(2)}`;
        return;
      }

      if (data.error) {
        setError(data.error);
        setLoading(false);
        setProcessing(false);
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Rare Ember',
        description: 'Secure Store Purchase',
        order_id: data.order_id,
        handler: function () {
          clear();
          window.location.href = `/success?session_id=${data.order_id}`;
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setProcessing(false);
          },
        },
        prefill: { name: name.trim(), email: email.trim(), contact: normalizedPhone },
        theme: { color: '#FF4D24' },
      };

      const RazorpayCtor = (window as unknown as RazorpayWindow).Razorpay;
      if (!RazorpayCtor) {
        setError('Payment gateway failed to initialize. Please refresh.');
        setLoading(false);
        setProcessing(false);
        return;
      }

      const rzp = new RazorpayCtor(options);
      rzp.on('payment.failed', function (response) {
        setError('Payment Unsuccessful: ' + response.error.description);
        setLoading(false);
        setProcessing(false);
      });
      rzp.open();
      setLoading(false);
    } catch {
      setError('Connection interrupted. Please check network and retry.');
      setLoading(false);
      setProcessing(false);
    }
  };

  return (
    <main className="page-top min-h-screen bg-[#FFFBF5] text-[#161311] pt-28 md:pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Top bar breadcrumb & guarantee */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-black no-underline transition-colors"
          >
            <span>←</span> Return to catalog
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-bold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>256-Bit Bank-Grade SSL Encrypted Checkout</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900">
            Express Checkout<span className="text-[#FF4D24]">.</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Complete your order in under 60 seconds with verified door-to-door tracking.
          </p>
        </div>

        {/* Empty Bag Warning Banner */}
        {detailed.length === 0 && (
          <div className="mb-8 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛍️</span>
              <div>
                <h2 className="text-sm font-bold text-amber-950">Your shopping bag is currently empty</h2>
                <p className="text-xs text-amber-800 mt-0.5">Click &ldquo;ORDER NOW ⚡&rdquo; on any product in our shop to checkout immediately.</p>
              </div>
            </div>
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0 text-center no-underline"
            >
              Explore Products ⚡ →
            </Link>
          </div>
        )}

        {/* Guest Checkout Active Notice */}
        {!userId && !authChecking && (
          <div className="mb-8 p-4 md:p-5 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">1-Click Express Guest Checkout Active</h3>
                <p className="text-xs text-neutral-600 mt-0.5">
                  No account or password needed! Fill in delivery address below to place your order with Cash on Delivery (COD) or UPI.
                </p>
              </div>
            </div>
            <Link
              href="/login?redirect=/checkout"
              className="px-4 py-2 rounded-full bg-white hover:bg-neutral-100 text-[#161311] border border-black/10 text-xs font-bold transition-all shrink-0 text-center no-underline whitespace-nowrap"
            >
              Sign In (Optional) →
            </Link>
          </div>
        )}

        {userId && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                ✓
              </span>
              <div>
                <p className="text-xs font-bold text-emerald-950">Verified Shopper Account</p>
                <p className="text-[11px] text-emerald-800">
                  Signed in as <span className="font-semibold">{userEmail || email}</span>
                </p>
              </div>
            </div>
            <Link href="/profile" className="text-xs font-bold text-emerald-900 hover:underline no-underline">
              My Orders & Profile →
            </Link>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Shipping & Payment (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Step 1: Destination */}
            <div className="rounded-[1.75rem] bg-white border border-black/[0.06] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#161311] text-white text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                    Delivery Destination & Contact
                  </h2>
                </div>
                {zip && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    📍 PIN Verified
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    Email Address (For Courier Tracking Updates) *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First & Last name"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    Door / Street Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat/House no., Street, Landmark"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                      Phone (10-digit, COD confirm) *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        let d = e.target.value.replace(/\D/g, '');
                        if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
                        if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
                        setPhone(d.slice(0, 10));
                      }}
                      placeholder="98765 43210"
                      maxLength={14}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                      {market === 'IN' ? '6-Digit PIN Code *' : 'Postal / ZIP Code *'}
                    </label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder={market === 'IN' ? 'e.g. 110001' : 'e.g. 10001'}
                      maxLength={10}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all"
                    />
                  </div>
                  <div className="flex items-end">
                    {zip.trim().length >= 6 ? (
                      <p className="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                        <span>⚡</span>
                        <span>Express Delivery Serviceable</span>
                      </p>
                    ) : (
                      <p className="text-[11px] font-medium text-neutral-400 py-1.5">
                        Free delivery across India
                      </p>
                    )}
                  </div>
                </div>

                {/* Anti-Bot Honeypot */}
                <input
                  type="text"
                  name="_hp_company"
                  value={hpCompany}
                  onChange={(e) => setHpCompany(e.target.value)}
                  style={{ display: 'none', position: 'absolute', left: '-9999px', opacity: 0 }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="rounded-[1.75rem] bg-white border border-black/[0.06] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-7 h-7 rounded-full bg-[#161311] text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  Payment Method
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {/* Option 1: Instant Online (UPI/Cards) */}
                <label
                  onClick={() => setPaymentMethod('online')}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-[#FF4D24] bg-amber-500/[0.04] ring-1 ring-[#FF4D24]/20'
                      : 'border-black/10 hover:border-black/20 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="mt-1 accent-[#FF4D24]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-neutral-900">
                        Online Payment (UPI, Cards, NetBanking)
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Instant 1-click payment via Google Pay, PhonePe, Paytm, Cards &amp; NetBanking. Fastest dispatch queue.
                    </p>
                    {isAboveCodThreshold && (
                      <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 inline-flex items-center gap-1.5">
                        <span>⚡</span>
                        <span>Zero COD Fee • Free Insured Air Express Dispatch Pan-India</span>
                      </div>
                    )}
                  </div>
                </label>

                {/* Option 2: Cash on Delivery */}
                {isAboveCodThreshold ? (
                  <div className="p-4 rounded-2xl border border-dashed border-amber-300 bg-amber-500/[0.04] opacity-85">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🛡️</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-neutral-800">
                            Cash on Delivery (Capped at ₹2,999)
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30">
                            High-Value Order Protection
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                          To protect against courier transit damages and guarantee doorstep air delivery, orders of <b>₹3,000 and above</b> require Instant Online Payment (UPI / Cards). Enjoy <b>zero COD fees</b> and priority domestic fulfillment.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#FF4D24] bg-amber-500/[0.04] ring-1 ring-[#FF4D24]/20'
                        : 'border-black/10 hover:border-black/20 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-[#FF4D24]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-neutral-900">
                          Cash on Delivery (COD)
                        </span>
                        {market === 'IN' && (
                          <span className="text-xs font-bold text-neutral-600">+₹49 fee</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Pay cash or UPI directly to the courier agent upon doorstep arrival.
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* Error box */}
              {error && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Action (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="rounded-[1.75rem] bg-[#161311] text-white p-6 md:p-8 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <h3 className="font-bold text-base text-white">Your Order Summary</h3>
                <span className="text-xs font-medium text-neutral-400">
                  {detailed.length} item{detailed.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto no-scrollbar mb-4">
                {detailed.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 overflow-hidden relative">
                      {d.product.image_url ? (
                        <Image
                          src={d.product.image_url}
                          alt={d.product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span>{d.product.emoji}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-xs text-white truncate">
                        {cleanBrandTitle(d.product.title)}
                      </span>
                      {(d.size || (d as any).color || d.phoneModel || d.customText) && (
                        <div className="flex flex-wrap gap-1 mt-0.5 mb-0.5 text-[10px]">
                          {(d as any).color && (
                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/15 font-semibold">
                              Color: {(d as any).color}
                            </span>
                          )}
                          {d.size && (
                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/15 font-semibold">
                              Size: {d.size}
                            </span>
                          )}
                          {d.phoneModel && (
                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/15">
                              {d.phoneModel}
                            </span>
                          )}
                          {d.customText && (
                            <span className="px-1.5 py-0.5 rounded bg-[#FF4D24]/20 text-[#FF4D24] border border-[#FF4D24]/30 font-semibold">
                              &quot;{d.customText}&quot; {d.customPlacement ? `(${d.customPlacement})` : ''}
                            </span>
                          )}
                          {((d as any).customImageName || (d as any).customImage) && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                              🖼️ {(d as any).customImageName || 'Graphic Attached'} {d.customPlacement ? `(${d.customPlacement})` : ''}
                            </span>
                          )}
                        </div>
                      )}
                      <span className="text-[11px] text-neutral-400">
                        Qty: {d.qty} × {formatCheckoutPrice(getProductItemPrice(d.product))}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setQty(d.id, Math.max(1, d.qty - 1))}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white border-none flex items-center justify-center cursor-pointer text-xs"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{d.qty}</span>
                      <button
                        onClick={() => setQty(d.id, d.qty + 1)}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white border-none flex items-center justify-center cursor-pointer text-xs"
                      >
                        +
                      </button>
                      <button
                        onClick={() => remove(d.id)}
                        className="text-[11px] text-neutral-500 hover:text-rose-400 border-none bg-transparent cursor-pointer ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Discount code (e.g. EMBER)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-white/[0.06] border border-white/10 text-white outline-none focus:border-[#FF4D24] uppercase placeholder:normal-case placeholder:text-neutral-500"
                />
                <button
                  onClick={applyCoupon}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all border-none cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Financial Breakdown */}
              <div className="flex flex-col gap-2 text-xs text-neutral-300 pb-4 border-b border-white/10 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">{formatCheckoutPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount ({appliedCouponCode || 'Festive Promo'})</span>
                    <span className="font-bold">−{formatCheckoutPrice(discount)}</span>
                  </div>
                )}
                {codFee > 0 && (
                  <div className="flex justify-between">
                    <span>COD Courier Fee</span>
                    <span className="font-semibold text-white">{formatCheckoutPrice(codFee)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    FREE ⚡
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <span className="block text-xs uppercase tracking-wider text-neutral-400 font-bold">
                    Total Amount
                  </span>
                  <span className="text-[10px] text-neutral-500">Includes all taxes & duties</span>
                </div>
                <span className="text-2xl font-black tracking-tight text-white">
                  {formatCheckoutPrice(total)}
                </span>
              </div>

              {/* Quick Payment Preference Cards */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Payment Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('online');
                      if (!couponApplied && !appliedCouponCode && subtotal >= 449) {
                        const res = validateCouponCode('PREPAID30', subtotal);
                        if (res.valid) {
                          setCoupon('PREPAID30');
                          setAppliedCouponCode('PREPAID30');
                          setDiscount(res.discountAmount);
                          setCouponApplied(true);
                        }
                      }
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'online'
                        ? 'border-[#FF4D24] bg-[#FF4D24]/20 ring-1 ring-[#FF4D24] text-white shadow-md'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <span>⚡</span>
                      <span>Pay via UPI</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold mt-1">
                      Extra ₹30 OFF • Express Air
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={isAboveCodThreshold}
                    onClick={() => {
                      setPaymentMethod('cod');
                      if (appliedCouponCode === 'PREPAID30') {
                        setCoupon('');
                        setAppliedCouponCode('');
                        setDiscount(0);
                        setCouponApplied(false);
                      }
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'cod'
                        ? 'border-[#FF4D24] bg-[#FF4D24]/20 ring-1 ring-[#FF4D24] text-white shadow-md'
                        : isAboveCodThreshold
                        ? 'border-white/5 bg-white/[0.02] text-neutral-500 opacity-60 cursor-not-allowed'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <span>💵</span>
                      <span>Cash on Delivery</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold mt-1">
                      {isAboveCodThreshold ? 'Cap: <₹3,000' : 'Pay at Doorstep'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error Box above Place Order button */}
              {error && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* High-Converting Executive Checkout Button */}
              <button
                onClick={pay}
                disabled={loading || processing || detailed.length === 0}
                className="w-full py-4 rounded-full font-black text-sm tracking-tight border-none cursor-pointer text-white bg-gradient-to-r from-[#FF4D24] via-[#FF6B35] to-[#FF9900] shadow-[0_12px_36px_rgba(255,77,36,0.45)] hover:shadow-[0_16px_44px_rgba(255,77,36,0.6)] hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || processing ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{paymentMethod === 'cod' ? 'Confirming COD Order…' : 'Processing Order…'}</span>
                  </>
                ) : detailed.length === 0 ? (
                  <span>BAG IS EMPTY • ADD ITEMS FIRST 🛍️</span>
                ) : paymentMethod === 'cod' ? (
                  <>
                    <span>Complete COD Order</span>
                    <span>⚡</span>
                    <span>• {formatCheckoutPrice(total)}</span>
                  </>
                ) : (
                  <>
                    <span>Pay via UPI / Cards</span>
                    <span>⚡</span>
                    <span>• {formatCheckoutPrice(total)}</span>
                  </>
                )}
              </button>

              {/* Trust & Guarantee strip */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2 text-center text-[11px] text-neutral-400">
                <div className="flex items-center justify-center gap-3 text-neutral-300 font-medium">
                  <span>🔒 256-Bit SSL</span>
                  <span>•</span>
                  <span>🛡️ 7-Day Replacement</span>
                  <span>•</span>
                  <span>🚚 Insured Courier</span>
                </div>
                <p className="text-[10px] text-neutral-500">
                  Instant order confirmation & tracking details sent to your email.
                </p>
                <p className="text-[10px] text-neutral-400">
                  By placing your order, you agree to our{' '}
                  <Link href="/terms" className="text-neutral-300 underline hover:text-white">Terms</Link> &{' '}
                  <Link href="/privacy" className="text-neutral-300 underline hover:text-white">Privacy Policy</Link>{' '}
                  (in compliance with India&apos;s DPDP Act, 2023).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
