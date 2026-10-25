'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart';
import { formatPrice, products, cleanBrandTitle } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/data/fallback-images';
import { CURATED_PRODUCT_GALLERIES } from '@/lib/data/product-gallery';
import { supabase } from '@/lib/supabase-client';
import { useGeo } from '@/context/GeoContext';
import { validateCouponCode } from '@/lib/festivals';
import { scoreRtoRisk } from '@/lib/rto';
import { trackBeginCheckout, trackAddShippingInfo } from '@/lib/telemetry/dataLayer';
import { trackCheckout } from '@/lib/telemetry/beacon';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export function normalizeIndianState(raw: string): string {
  if (!raw) return '';
  const clean = raw.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  if (/delhi|nct/i.test(clean)) return 'Delhi';
  if (/jammu|kashmir/i.test(clean)) return 'Jammu and Kashmir';
  if (/odisha|orissa/i.test(clean)) return 'Odisha';
  if (/puducherry|pondicherry/i.test(clean)) return 'Puducherry';
  if (/uttarakhand|uttaranchal/i.test(clean)) return 'Uttarakhand';
  if (/andaman|nicobar/i.test(clean)) return 'Andaman and Nicobar Islands';
  if (/dadra|nagar|daman|diu/i.test(clean)) return 'Dadra and Nagar Haveli and Daman and Diu';
  if (/chattisgarh|chhattisgarh/i.test(clean)) return 'Chhattisgarh';
  if (/tamilnadu|tamil/i.test(clean)) return 'Tamil Nadu';
  if (/telangana/i.test(clean)) return 'Telangana';
  if (/karnataka/i.test(clean)) return 'Karnataka';
  if (/maharashtra/i.test(clean)) return 'Maharashtra';
  if (/westbengal|bengal/i.test(clean)) return 'West Bengal';
  if (/uttarpradesh/i.test(clean)) return 'Uttar Pradesh';
  if (/madhyapradesh/i.test(clean)) return 'Madhya Pradesh';
  if (/andhra/i.test(clean)) return 'Andhra Pradesh';
  if (/arunachal/i.test(clean)) return 'Arunachal Pradesh';
  if (/himachal/i.test(clean)) return 'Himachal Pradesh';
  if (/rajasthan/i.test(clean)) return 'Rajasthan';
  if (/punjab/i.test(clean)) return 'Punjab';
  if (/haryana/i.test(clean)) return 'Haryana';
  if (/gujarat/i.test(clean)) return 'Gujarat';
  if (/bihar/i.test(clean)) return 'Bihar';
  if (/jharkhand/i.test(clean)) return 'Jharkhand';
  if (/kerala/i.test(clean)) return 'Kerala';
  if (/assam/i.test(clean)) return 'Assam';
  if (/goa/i.test(clean)) return 'Goa';
  if (/sikkim/i.test(clean)) return 'Sikkim';
  if (/tripura/i.test(clean)) return 'Tripura';
  if (/manipur/i.test(clean)) return 'Manipur';
  if (/meghalaya/i.test(clean)) return 'Meghalaya';
  if (/mizoram/i.test(clean)) return 'Mizoram';
  if (/nagaland/i.test(clean)) return 'Nagaland';
  if (/chandigarh/i.test(clean)) return 'Chandigarh';
  if (/ladakh/i.test(clean)) return 'Ladakh';
  if (/lakshadweep/i.test(clean)) return 'Lakshadweep';

  const exact = INDIAN_STATES.find(s => s.toLowerCase().replace(/[^a-z0-9]/g, '') === clean);
  return exact || raw.trim();
}

const SIZE_CHEST_MAP: Record<string, string> = {
  XS: '36" Chest',
  S: '38" Chest',
  M: '40" Chest',
  L: '42" Chest',
  XL: '44" Chest',
  '2XL': '46" Chest',
  XXL: '46" Chest',
  '3XL': '48" Chest',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { market } = useGeo();
  const { items, setQty, remove, clear } = useCart();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [flatHouse, setFlatHouse] = useState('');
  const [areaStreet, setAreaStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [addressType, setAddressType] = useState<'home' | 'office' | 'other'>('home');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeInfo, setPincodeInfo] = useState<{ city: string; state: string; valid: boolean; error?: string } | null>(null);
  const pincodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  // COD is the advertised option for an India D2C store and the server
  // already caps it at Rs.3,000 for RTO protection. Defaulting to 'online'
  // silently withdrew the advertised COD.
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('cod');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [appliedCouponLabel, setAppliedCouponLabel] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [hpCompany, setHpCompany] = useState('');
  const [showCodConfirmModal, setShowCodConfirmModal] = useState(false);

  // 100% Free COD OTP Verification State
  const [codOtpSent, setCodOtpSent] = useState(false);
  const [codOtpCode, setCodOtpCode] = useState('');
  const [codOtpSending, setCodOtpSending] = useState(false);
  const [codOtpVerifying, setCodOtpVerifying] = useState(false);
  const [isCodOtpVerified, setIsCodOtpVerified] = useState(false);
  const [codVerificationHash, setCodVerificationHash] = useState('');
  const [codExpiresAt, setCodExpiresAt] = useState<number | null>(null);
  const [codVerifiedToken, setCodVerifiedToken] = useState('');
  const [codOtpResendSeconds, setCodOtpResendSeconds] = useState(0);
  const [codOtpError, setCodOtpError] = useState('');

  // 30-second resend countdown timer for COD OTP
  useEffect(() => {
    if (codOtpResendSeconds <= 0) return;
    const interval = setInterval(() => {
      setCodOtpResendSeconds((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [codOtpResendSeconds]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      const session = data?.session;
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        // Functional update: `email` in this closure was the value from the
        // FIRST render, so `!email` was always true and the session address
        // overwrote whatever the customer had typed.
        if (session.user.email) {
          setEmail((current) => (current && current.trim() !== '' ? current : session.user!.email!));
        }
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
      const savedAddressRaw = localStorage.getItem('rareember_saved_address');
      if (savedAddressRaw) {
        const s = JSON.parse(savedAddressRaw);
        if (s.name) setName(s.name);
        if (s.email) setEmail(s.email);
        if (s.phone) setPhone(s.phone);
        if (s.flatHouse) setFlatHouse(s.flatHouse);
        if (s.areaStreet) setAreaStreet(s.areaStreet);
        if (s.landmark) setLandmark(s.landmark);
        if (s.city) setCity(s.city);
        if (s.state) setState(s.state);
        if (s.zip) setZip(s.zip);
        if (s.addressType) setAddressType(s.addressType);
        if (s.flatHouse || s.areaStreet || s.line1) {
          setHasSavedAddress(true);
          if (s.zip && s.zip.length === 6) {
            setPincodeInfo({ city: s.city || '', state: s.state || '', valid: true });
          }
        }
      } else {
        const savedPin = localStorage.getItem('rareember_pincode');
        const savedPinData = localStorage.getItem('rareember_pincode_data');
        if (savedPin) setZip(savedPin);
        if (savedPinData) {
          const parsed = JSON.parse(savedPinData);
          if (parsed.city) setCity(parsed.city);
          if (parsed.state) setState(parsed.state);
          if (savedPin && parsed.city) {
            setPincodeInfo({ city: parsed.city, state: parsed.state || '', valid: true });
          }
        }
      }
    } catch {}

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const lookupPincode = async (cleanPin: string) => {
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setPincodeInfo({ city: '', state: '', valid: false, error: 'Indian PIN codes must start with digits 1-9 and be 6 digits.' });
      return;
    }
    setPincodeLoading(true);
    try {
      // 1. Try fast edge-cached internal route first (bypasses CSP & third-party limits)
      let res = await fetch(`/api/pincode/${cleanPin}`);
      if (!res.ok) {
        // 2. Direct external fallback
        res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      }
      const data = await res.json();
      if (data && data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const detectedCity = po.District || po.Name || '';
        const detectedState = normalizeIndianState(po.State || '');
        if (detectedCity) setCity(detectedCity);
        if (detectedState) setState(detectedState);
        setPincodeInfo({
          city: detectedCity,
          state: detectedState,
          valid: true,
        });
        localStorage.setItem('rareember_pincode', cleanPin);
        localStorage.setItem('rareember_pincode_data', JSON.stringify({
          pincode: cleanPin,
          city: detectedCity,
          state: detectedState,
          serviceable: true,
          codAvailable: true,
          deliveryDate: '2-4 Days (Express Air)',
          stockStatus: 'Ready to Dispatch (Tirupur Hub)',
        }));
      } else {
        setPincodeInfo({
          city: '',
          state: '',
          valid: false,
          error: `Postal PIN ${cleanPin} is not recognized. Please check your 6-digit PIN code.`
        });
      }
    } catch {
      // Offline fallback: don't block shopper
    } finally {
      setPincodeLoading(false);
    }
  };

  const detailed = useMemo(
    () =>
      items
        .map((i) => {
          const found = products.find((p) => p.id === i.id || p.id === i.id.split('__')[0]);
          const resolvedColorImage = (() => {
            const itemColor = (i as any).color;
            if (found && itemColor && found.colors) {
              const colorIdx = found.colors.findIndex(
                (c) => c.toLowerCase() === itemColor.toLowerCase()
              );
              if (colorIdx >= 0) {
                if (Array.isArray(found.images) && found.images[colorIdx]) {
                  return found.images[colorIdx];
                }
                if (CURATED_PRODUCT_GALLERIES[found.id]?.[colorIdx]) {
                  return CURATED_PRODUCT_GALLERIES[found.id][colorIdx];
                }
              }
            }
            if (i.imageUrl) return i.imageUrl;
            return found ? resolveProductImage(found.id, found.image_url) : resolveProductImage(i.id, i.imageUrl);
          })();

          if (found) {
            return {
              ...i,
              imageUrl: resolvedColorImage || i.imageUrl,
              product: {
                ...found,
                price_inr: found.price_inr ?? found.price,
                image_url: resolvedColorImage || resolveProductImage(found.id, found.image_url),
              },
            };
          }
          const isUsdFloat = (p: number) => p > 0 && p < 60 && !Number.isInteger(p);
          const inferredInr = i.price_inr != null 
            ? Number(i.price_inr) 
            : (i.price ? (isUsdFloat(Number(i.price)) ? Math.round(Number(i.price) * 85) : Math.round(Number(i.price))) : 449);
          return {
            ...i,
            imageUrl: resolvedColorImage || i.imageUrl,
            product: {
              id: i.id,
              slug: i.id,
              title: i.title || 'Curated Lifestyle Drop',
              price: Number(i.price ?? inferredInr),
              price_inr: inferredInr,
              emoji: i.emoji || '',
              image_url: resolvedColorImage || resolveProductImage(i.id, i.imageUrl),
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
      const isUsdFloat = p.price > 0 && p.price < 60 && !Number.isInteger(p.price);
      return isUsdFloat ? Math.round(p.price * 85) : Math.round(p.price);
    }
    return p.price >= 80 ? p.price / 85 : p.price;
  };
  const subtotal = detailed.reduce((a, b) => a + getProductItemPrice(b.product) * b.qty, 0);
  // The server caps COD on the POST-DISCOUNT total (`finalTotal`), so the
  // client must use the same number -- otherwise COD is hidden for orders the
  // server would happily accept.
  const postDiscountSubtotal = Math.max(0, subtotal - discount);
  const isAboveCodThreshold = isIndia && postDiscountSubtotal >= 3000;

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
      trackCheckout(detailed[0]?.product.id);
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
    if (market === 'GLOBAL') {
      const usdVal = val >= 80 ? val / 85 : val;
      return `$${Number(usdVal).toFixed(2)}`;
    }
    const isUsdFloat = val > 0 && val < 60 && !Number.isInteger(val);
    const inrVal = isUsdFloat ? Math.round(val * 85) : Math.round(val);
    return `₹${inrVal.toLocaleString('en-IN')}`;
  };

  const applyCoupon = () => {
    const hasBundle = detailed.some((d) => d.id.startsWith('bundle-') || (d.product && d.product.id.startsWith('bundle-')));
    if (hasBundle) {
      setError('Promotional discount codes cannot be stacked on pre-discounted combo bundles. Add individual drops to use this coupon!');
      setCouponApplied(false);
      setDiscount(0);
      setAppliedCouponCode('');
      setAppliedCouponLabel('');
      return;
    }

    const res = validateCouponCode(coupon, subtotal);
    if (!res.valid) {
      setError(res.error || 'Invalid coupon code.');
      setCouponApplied(false);
      setDiscount(0);
      setAppliedCouponCode('');
      setAppliedCouponLabel('');
      return;
    }

    setDiscount(res.discountAmount);
    // The server validates the raw CODE. Sending res.label ("FIRST50 (Rs 50 OFF)")
    // made every promotion silently fail server-side: the shopper was quoted a
    // discount and then charged full price.
    setAppliedCouponCode(coupon.trim().toUpperCase());
    setAppliedCouponLabel(res.label);
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

  const sendCodOtp = async () => {
    setCodOtpError('');
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter your email address to receive the 6-digit COD verification code.');
      return;
    }
    const cleanDigits = phone.replace(/\D/g, '');
    const normalizedPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    if (!normalizedPhone || normalizedPhone.length !== 10) {
      setError('Please enter your 10-digit mobile number for order verification.');
      return;
    }

    setCodOtpSending(true);
    try {
      const res = await fetch('/api/cod-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          phone: normalizedPhone,
          name: name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCodOtpError(data.error || 'Failed to dispatch verification code. Please retry.');
        return;
      }
      setCodOtpSent(true);
      setCodVerificationHash(data.verificationHash);
      setCodExpiresAt(data.expiresAt);
      setCodOtpResendSeconds(30);
    } catch {
      setCodOtpError('Network error while requesting verification code.');
    } finally {
      setCodOtpSending(false);
    }
  };

  const verifyCodOtp = async (codeToVerify?: string) => {
    setCodOtpError('');
    const code = (codeToVerify || codOtpCode).trim();
    if (!code || code.length !== 6) {
      setCodOtpError('Please enter the full 6-digit code sent to your email.');
      return;
    }
    if (!codVerificationHash || !codExpiresAt) {
      setCodOtpError('Please request a verification code first.');
      return;
    }

    setCodOtpVerifying(true);
    try {
      const cleanDigits = phone.replace(/\D/g, '');
      const normalizedPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

      const res = await fetch('/api/cod-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          phone: normalizedPhone,
          otp: code,
          verificationHash: codVerificationHash,
          expiresAt: codExpiresAt,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCodOtpError(data.error || 'Invalid or expired code. Please re-enter.');
        return;
      }
      setIsCodOtpVerified(true);
      setCodVerifiedToken(data.codVerifiedToken);
      setCodOtpError('');
      setError('');
    } catch {
      setCodOtpError('Network error while verifying code.');
    } finally {
      setCodOtpVerifying(false);
    }
  };

  const pay = async () => {
    setError('');
    if (hpCompany) return setError('Automated submission rejected.');

    // COMPULSORY FIELD 1: Full Name
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      return setError('Full Name is compulsory for courier delivery. Please enter your name.');
    }

    // COMPULSORY FIELD 2: 10-Digit Mobile Phone (Sanitize +91, spaces, dashes)
    const digitsOnly = phone.replace(/\D/g, '');
    const normalizedPhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
    if (!normalizedPhone || normalizedPhone.length !== 10) {
      return setError('Mobile Number is compulsory. Please enter your 10-digit mobile number.');
    }

    // COMPULSORY FIELD 3: Email Address
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return setError('Email Address is compulsory for order confirmation, tracking updates, and GST invoice.');
    }

    // COMPULSORY FIELD 4: 6-Digit Indian Postal PIN Code (Strictly ^[1-9][0-9]{5}$)
    const resolvedZip = zip.trim();
    if (!resolvedZip || (isIndia && !/^[1-9][0-9]{5}$/.test(resolvedZip))) {
      return setError('Valid 6-digit Indian PIN code is compulsory for courier routing (must start with 1-9).');
    }

    // COMPULSORY FIELD 5: Flat / House No. & Building
    const resolvedFlat = flatHouse.trim();
    if (!resolvedFlat || resolvedFlat.length < 2) {
      return setError('Flat / House No. and Building / Society Name is compulsory.');
    }

    // COMPULSORY FIELD 6: Street / Colony / Locality
    const resolvedStreet = areaStreet.trim();
    if (!resolvedStreet || resolvedStreet.length < 3) {
      return setError('Street, Colony, Locality, or Area is compulsory for delivery rider navigation.');
    }

    // COMPULSORY FIELD 7: City / District
    const resolvedCity = city.trim();
    if (!resolvedCity || resolvedCity.length < 2) {
      return setError('City / District is compulsory.');
    }

    // COMPULSORY FIELD 8: State / Union Territory
    const resolvedState = state.trim();
    if (!resolvedState) {
      return setError('State / Union Territory is compulsory. Please select your state.');
    }

    // STATE & PIN CODE MATCHING (Resilient alias normalization)
    if (pincodeInfo && pincodeInfo.state) {
      const pinStateNorm = normalizeIndianState(pincodeInfo.state);
      const userStateNorm = normalizeIndianState(resolvedState);
      if (pinStateNorm && userStateNorm && pinStateNorm.toLowerCase() !== userStateNorm.toLowerCase()) {
        return setError(`PIN Code & State Mismatch: PIN code ${resolvedZip} is located in ${pinStateNorm}, but you selected "${resolvedState}". Please select "${pinStateNorm}" to avoid courier delivery failure.`);
      }
    }

    // Landmark (Optional for extra delivery precision)
    const resolvedLandmark = landmark.trim();

    const fullStreetLine = [resolvedFlat, resolvedStreet].filter(Boolean).join(', ') || address.trim();

    const finalFullAddress = resolvedLandmark
      ? `${fullStreetLine} (Landmark: ${resolvedLandmark})`
      : fullStreetLine;

    const shippingAddressPayload = {
      line1: finalFullAddress,
      line2: resolvedLandmark ? `Landmark: ${resolvedLandmark}` : (resolvedStreet || ''),
      flat: resolvedFlat,
      street: resolvedStreet,
      landmark: resolvedLandmark,
      city: resolvedCity,
      state: resolvedState,
      zip: resolvedZip,
      phone: normalizedPhone,
      address_type: addressType,
    };

    if (detailed.length === 0) return setError('Your cart is empty. Add a product first.');
    if (loading || processing) return;
    if (paymentMethod === 'cod') {
      if (isAboveCodThreshold) {
        return setError('Cash on Delivery is limited to orders up to ₹2,999. Please select Instant Online Payment (UPI / Cards) for priority doorstep dispatch.');
      }
      const rto = scoreRtoRisk({ phone, pincode: resolvedZip, totalInr: 0 });
      if (rto.recommendation === 'PREPAID_ONLY') {
        return setError(`Cash on Delivery is currently unavailable for PIN code ${resolvedZip}. Please select Instant Online Payment (UPI / Cards) for priority doorstep delivery.`);
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
    try {
      localStorage.setItem('rareember_saved_address', JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: normalizedPhone,
        flatHouse: resolvedFlat,
        areaStreet: resolvedStreet,
        landmark: resolvedLandmark,
        city: resolvedCity,
        state: resolvedState,
        zip: resolvedZip,
        addressType,
      }));
    } catch {}

    // If COD selected, require 6-digit OTP verification first
    if (paymentMethod === 'cod') {
      if (!isCodOtpVerified || !codVerifiedToken) {
        if (!codOtpSent) {
          sendCodOtp();
        }
        setError('Please enter the 6-digit verification code sent to your email to confirm Cash on Delivery.');
        return;
      }
      setShowCodConfirmModal(true);
      return;
    }

    setLoading(true);
    setProcessing(true);

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
          address: shippingAddressPayload,
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

  const executeCodOrder = async () => {
    setLoading(true);
    setProcessing(true);
    setError('');

    const resolvedZip = zip.trim().replace(/\D/g, '');
    const cleanDigits = phone.replace(/\D/g, '');
    const normalizedPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    const resolvedFlat = flatHouse.trim();
    const resolvedStreet = areaStreet.trim();
    const resolvedLandmark = landmark.trim();
    const fullStreetLine = [resolvedFlat, resolvedStreet].filter(Boolean).join(', ') || address.trim();
    const finalFullAddress = resolvedLandmark ? `${fullStreetLine} (Landmark: ${resolvedLandmark})` : fullStreetLine;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          phone: normalizedPhone,
          address: {
            line1: finalFullAddress,
            line2: resolvedLandmark ? `Landmark: ${resolvedLandmark}` : (resolvedStreet || ''),
            flat: resolvedFlat,
            street: resolvedStreet,
            landmark: resolvedLandmark,
            city: city.trim(),
            state: state.trim(),
            zip: resolvedZip,
            phone: normalizedPhone,
            address_type: addressType,
          },
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
          cod_verified_token: codVerifiedToken,
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
        setShowCodConfirmModal(false);
        return;
      }
      setShowCodConfirmModal(false);
      clear();
      window.location.href = `/success?cod=1&email=${encodeURIComponent(email)}&total=${total.toFixed(2)}&order_id=${data.order_id || ''}`;
    } catch {
      setError('Failed to place COD order. Please retry.');
      setLoading(false);
      setProcessing(false);
      setShowCodConfirmModal(false);
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
          <div className="mb-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-900 flex items-center justify-center font-mono text-xs font-bold">
                00
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-950">Your shopping bag is currently empty</h2>
                <p className="text-xs text-amber-800 mt-0.5">Click &ldquo;ORDER NOW&rdquo; on any product in our shop to checkout immediately.</p>
              </div>
            </div>
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-lg bg-[#12100E] hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0 text-center no-underline"
            >
              Explore Collection →
            </Link>
          </div>
        )}

        {/* Guest Checkout Active Notice */}
        {!userId && !authChecking && (
          <div className="mb-8 p-4 md:p-5 rounded-xl bg-neutral-100 border border-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Direct Express Checkout</h3>
                <p className="text-xs text-neutral-600 mt-0.5">
                  No password required. Enter your delivery address below to complete order with Cash on Delivery (COD) or UPI.
                </p>
              </div>
            </div>
            <Link
              href="/login?redirect=/checkout"
              className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-50 text-[#12100E] border border-black/10 text-xs font-bold transition-all shrink-0 text-center no-underline whitespace-nowrap"
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
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#161311] text-white text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                    Delivery Destination & Contact
                  </h2>
                </div>
                {zip.trim().length === 6 && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {city ? `${city}${state ? `, ${state}` : ''}` : 'PIN Verified'}
                  </span>
                )}
              </div>

              {hasSavedAddress && (
                <div className="mb-5 p-3.5 rounded-xl bg-neutral-50 border border-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div>
                      <span className="font-bold text-neutral-900">Saved address auto-filled:</span>{' '}
                      <span className="text-neutral-700">
                        {flatHouse ? `${flatHouse}, ${areaStreet}` : address} — {city}, {state} ({zip})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFlatHouse('');
                      setAreaStreet('');
                      setLandmark('');
                      setAddress('');
                      setCity('');
                      setState('');
                      setZip('');
                      setPincodeInfo(null);
                      setHasSavedAddress(false);
                    }}
                    className="text-[#FF4D24] hover:underline font-bold text-xs whitespace-nowrap self-end sm:self-auto cursor-pointer"
                  >
                    + Use Different Address
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Email Address (For Courier Tracking Updates & GST Invoice) <span className="text-rose-500 font-bold">* (Compulsory)</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all placeholder:text-neutral-400"
                  />
                </div>

                {/* Contact Row: Full Name & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-rose-500 font-bold">* (Compulsory)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="First & Last name (for courier delivery)"
                      className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all placeholder:text-neutral-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                        Mobile Number (10-Digit) <span className="text-rose-500 font-bold">* (Compulsory)</span>
                      </label>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 font-mono">
                        WhatsApp Tracking
                      </span>
                    </div>
                    <div className="flex rounded-xl border border-black/10 bg-neutral-50/50 overflow-hidden focus-within:border-[#FF4D24] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF4D24]/10 transition-all">
                      <span className="inline-flex items-center gap-1.5 px-3 bg-neutral-100 text-neutral-700 text-xs font-mono font-bold border-r border-black/10 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '');
                          setPhone(digits.length > 10 ? digits.slice(-10) : digits);
                        }}
                        placeholder="98765 43210"
                        maxLength={16}
                        className="w-full px-3 py-3 text-sm bg-transparent text-neutral-900 outline-none placeholder:text-neutral-400"
                      />
                    </div>
                  </div>
                </div>

                {/* PIN Code Lookup Row (Positioned early so city & state auto-fill!) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                        {market === 'IN' ? '6-Digit PIN Code' : 'Postal / ZIP Code'} <span className="text-rose-500 font-bold">* (Compulsory)</span>
                      </label>
                      {pincodeLoading && (
                        <span className="text-[10px] text-[#FF4D24] font-medium animate-pulse flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#FF4D24] animate-ping" />
                          Checking Postal Hub...
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={zip}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setZip(val);
                          if (pincodeTimerRef.current) clearTimeout(pincodeTimerRef.current);
                          if (val.length === 6) {
                            if (!/^[1-9][0-9]{5}$/.test(val)) {
                              setPincodeInfo({ city: '', state: '', valid: false, error: 'Indian PIN codes must start with digits 1-9' });
                            } else {
                              pincodeTimerRef.current = setTimeout(() => {
                                lookupPincode(val);
                              }, 300);
                            }
                          } else {
                            setPincodeInfo(null);
                          }
                        }}
                        placeholder={market === 'IN' ? 'e.g. 560001, 110001' : 'e.g. 10001'}
                        maxLength={6}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 font-mono tracking-wider outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all placeholder:text-neutral-400"
                      />
                      {zip.length === 6 && !pincodeLoading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    {pincodeLoading ? (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="text-[11px] font-semibold">Verifying Postal Hub via Delhivery Network…</span>
                      </div>
                    ) : pincodeInfo?.valid && pincodeInfo.city ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-500/30 text-emerald-900 text-xs shadow-xs">
                        <p className="font-bold flex items-center gap-1.5">
                          <span>🟢</span> Express Air Serviceable to {pincodeInfo.city}, {pincodeInfo.state} (Est. 2–4 Days via Delhivery Air)
                        </p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Postal Hub: <strong>{pincodeInfo.city}</strong> • Priority Domestic Flight Manifested
                        </p>
                      </div>
                    ) : pincodeInfo && !pincodeInfo.valid ? (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs shadow-xs">
                        <p className="font-bold flex items-center gap-1.5">
                          <span>⚠️</span> {pincodeInfo.error || 'Postal PIN not recognized. Please check your 6-digit PIN code.'}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-neutral-100/70 border border-black/5 text-neutral-500 text-[11px]">
                        <p className="font-semibold text-neutral-700">Pan-India Delivery Network</p>
                        <p className="text-[10px] mt-0.5">Enter 6-digit PIN to auto-detect City & State</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Structured Address: Flat / House No. & Building */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Flat / House No., Floor, Building / Society Name <span className="text-rose-500 font-bold">* (Compulsory)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={flatHouse}
                    onChange={(e) => setFlatHouse(e.target.value)}
                    placeholder="e.g. Flat 402, Sunshine Heights, 4th Floor"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all placeholder:text-neutral-400"
                  />
                </div>

                {/* Structured Address: Street / Area / Sector */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Street, Colony, Sector, Locality / Area <span className="text-rose-500 font-bold">* (Compulsory)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={areaStreet}
                    onChange={(e) => setAreaStreet(e.target.value)}
                    placeholder="e.g. 12th Main Road, HAL 2nd Stage, Indiranagar"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all placeholder:text-neutral-400"
                  />
                </div>

                {/* Landmark (Indian Delivery Courier Essential!) */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Famous Landmark <span className="text-neutral-400 font-normal">(Optional — Helps Delivery Rider Find Your Door)</span>
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Station / Opp. SBI Bank / Behind Community Park"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all placeholder:text-neutral-400"
                  />
                </div>

                {/* City & State (Auto-filled from PIN with matching validation) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      City / District <span className="text-rose-500 font-bold">* (Compulsory)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru, Varanasi, Delhi"
                      className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all placeholder:text-neutral-400"
                    />
                    {pincodeInfo?.city && city && (
                      <p className="mt-1 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <span>✓</span> Verified Postal District: {pincodeInfo.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      State / Union Territory <span className="text-rose-500 font-bold">* (Compulsory)</span>
                    </label>
                    <select
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-black/10 bg-neutral-50/50 text-neutral-900 outline-none focus:border-[#FF4D24] focus:bg-white focus:ring-2 focus:ring-[#FF4D24]/10 transition-all cursor-pointer"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    {/* Live State & PIN Code Match Indicator / Warning */}
                    {pincodeInfo?.state && state && normalizeIndianState(state).toLowerCase() !== normalizeIndianState(pincodeInfo.state).toLowerCase() && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <span>⚠️</span>
                          <span>PIN <strong>{zip}</strong> is in <strong>{normalizeIndianState(pincodeInfo.state)}</strong>.</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setState(normalizeIndianState(pincodeInfo.state))}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700 shrink-0 cursor-pointer"
                        >
                          Align to {normalizeIndianState(pincodeInfo.state)}
                        </button>
                      </div>
                    )}
                    {pincodeInfo?.state && state && normalizeIndianState(state).toLowerCase() === normalizeIndianState(pincodeInfo.state).toLowerCase() && (
                      <p className="mt-1 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <span>✓</span> Matches PIN Postal State ({normalizeIndianState(pincodeInfo.state)})
                      </p>
                    )}
                  </div>
                </div>

                {/* Address Type Tagging */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-2">
                    Address Type (Delivery Instructions)
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'home', label: 'Home', sub: '9 AM - 9 PM, All Days' },
                      { id: 'office', label: 'Work / Office', sub: '10 AM - 6 PM, Mon-Sat' },
                      { id: 'other', label: 'Other', sub: 'Anytime' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setAddressType(t.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          addressType === t.id
                            ? 'border-[#FF4D24] bg-[#FF4D24]/[0.06] text-neutral-950 font-bold shadow-xs'
                            : 'border-black/10 bg-neutral-50/40 text-neutral-700 hover:border-black/20'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">{t.label}</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5 leading-tight">{t.sub}</div>
                      </button>
                    ))}
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

            {/* Express Doorstep Delivery & Tracking Guarantee */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/[0.08] via-emerald-500/[0.04] to-transparent border border-emerald-500/25 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-800 flex items-center justify-center text-xl shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Doorstep Delivery ETA
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Delhivery Air Express
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-neutral-900 mt-0.5">
                    {(() => {
                      const start = new Date();
                      start.setDate(start.getDate() + 3);
                      const end = new Date();
                      end.setDate(end.getDate() + 5);
                      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                    })()}{' '}
                    <span className="text-xs font-medium text-neutral-500">(3–5 Business Days)</span>
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-mono font-bold text-neutral-600 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded border border-black/5">
                <span>SMS &amp; WhatsApp Tracking Alerts</span>
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
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-sm text-neutral-900">
                        Online Payment (UPI, Cards, NetBanking)
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                        Save ₹49 • Recommended
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Instant 1-click payment via Google Pay, PhonePe, Paytm, Cards &amp; NetBanking.
                    </p>
                    <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 inline-flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>Save ₹49 instantly by paying via UPI (Free Express Air Delivery • ₹0 COD Fee)</span>
                    </div>
                  </div>
                </label>

                {/* Option 2: Cash on Delivery */}
                {isAboveCodThreshold ? (
                  <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-500/[0.04]">
                    <div className="flex items-start gap-3">
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
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">+₹49 COD fee</span>
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
                <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                  {paymentMethod === 'online' && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('cod');
                        setError('');
                      }}
                      className="mt-2.5 w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs border-none"
                    >
                      <span>📦</span> Switch to Cash on Delivery (COD) &amp; Complete Order
                    </button>
                  )}
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
                      {(d.imageUrl || d.product.image_url) ? (
                        <Image
                          src={(d.imageUrl || d.product.image_url)!}
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
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-neutral-200 border border-white/15 font-semibold">
                              <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: (d as any).color.toLowerCase() === 'white' ? '#FFFFFF' : (d as any).color.toLowerCase() === 'black' ? '#111111' : (d as any).color.toLowerCase().includes('navy') ? '#1E293B' : (d as any).color.toLowerCase().includes('grey') ? '#9CA3AF' : (d as any).color.toLowerCase().includes('red') ? '#DC2626' : (d as any).color.toLowerCase().includes('blue') ? '#2563EB' : (d as any).color.toLowerCase().includes('green') ? '#15803D' : '#888888' }} />
                              Color: {(d as any).color}
                            </span>
                          )}
                          {d.size && (
                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-200 border border-white/15 font-semibold">
                              Size: {d.size}{SIZE_CHEST_MAP[d.size] ? ` (${SIZE_CHEST_MAP[d.size]})` : ''}
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
                              Artwork: {(d as any).customImageName || 'Attached'} {d.customPlacement ? `(${d.customPlacement})` : ''}
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
                      Save ₹49 + Extra ₹30 OFF • Free Air
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
                    <div className="flex items-center gap-1.5 font-bold text-xs">
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
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                  {paymentMethod === 'online' && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('cod');
                        setError('');
                      }}
                      className="mt-2.5 w-full py-2 px-3 rounded-xl bg-white text-rose-950 text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm border-none"
                    >
                      <span>📦</span> Switch to Cash on Delivery (COD) &amp; Place Order
                    </button>
                  )}
                </div>
              )}

              {/* Why Zero Customers Regret Their Fit Reassurance Strip */}
              <div className="mb-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Why Zero Customers Regret Their Fit
                </p>
                <div className="text-xs text-neutral-200 flex items-center justify-between gap-1 font-medium">
                  <span>📏 Exact Chest Size Verified</span>
                  <span className="text-neutral-600">•</span>
                  <span>🧶 Heavyweight Bio-Washed Cotton</span>
                  <span className="text-neutral-600">•</span>
                  <span>🔄 Free 7-Day Size Swap</span>
                </div>
              </div>

              {/* 100% Free COD Email OTP Verification Card */}
              {paymentMethod === 'cod' && (
                <div className="mb-4 p-4 rounded-2xl bg-white/[0.06] border border-white/15 text-left transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📧</span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Free COD Delivery Verification
                      </span>
                    </div>
                    {isCodOtpVerified ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400">
                        Required for COD
                      </span>
                    )}
                  </div>

                  {isCodOtpVerified ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                      <span>🛡️</span>
                      <span>Identity &amp; Address Verified for {email} (+91 {phone.replace(/\D/g, '').slice(-10)}). Zero advance required!</span>
                    </div>
                  ) : !codOtpSent ? (
                    <div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed mb-3">
                        To protect against automated bookings and guarantee doorstep delivery, please verify your order via a free 6-digit code sent to <b className="text-white">{email || 'your email'}</b>.
                      </p>
                      <button
                        type="button"
                        disabled={codOtpSending}
                        onClick={sendCodOtp}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/20 cursor-pointer"
                      >
                        {codOtpSending ? (
                          <>
                            <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            <span>Sending Code to {email || 'Email'}...</span>
                          </>
                        ) : (
                          <>
                            <span>✉️</span>
                            <span>Send 6-Digit OTP to Email</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[11px] text-neutral-300">
                        Enter the 6-digit verification code sent to <b className="text-white">{email}</b>:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={codOtpCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setCodOtpCode(val);
                            if (val.length === 6) {
                              verifyCodOtp(val);
                            }
                          }}
                          placeholder="• • • • • •"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-center font-mono font-black text-lg tracking-[0.3em] outline-none focus:border-[#FF4D24] focus:ring-1 focus:ring-[#FF4D24]"
                        />
                        <button
                          type="button"
                          disabled={codOtpVerifying || codOtpCode.length !== 6}
                          onClick={() => verifyCodOtp()}
                          className="px-4 py-2.5 rounded-xl bg-[#FF4D24] hover:bg-[#FF6B35] text-white text-xs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                        >
                          {codOtpVerifying ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Check inbox or spam folder</span>
                        {codOtpResendSeconds > 0 ? (
                          <span className="text-neutral-500 font-mono">Resend in {codOtpResendSeconds}s</span>
                        ) : (
                          <button
                            type="button"
                            disabled={codOtpSending}
                            onClick={sendCodOtp}
                            className="text-[#FF4D24] hover:underline font-bold bg-transparent border-none p-0 cursor-pointer"
                          >
                            Resend Code Now
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {codOtpError && (
                    <div className="mt-2 text-[11px] text-rose-400 font-medium">
                      ⚠️ {codOtpError}
                    </div>
                  )}
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
                  <span>Bag is Empty</span>
                ) : paymentMethod === 'cod' ? (
                  isCodOtpVerified ? (
                    <>
                      <span>Place Verified COD Order</span>
                      <span>• {formatCheckoutPrice(total)}</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code to Place Order</span>
                      <span>• {formatCheckoutPrice(total)}</span>
                    </>
                  )
                ) : (
                  <>
                    <span>Pay with UPI / Cards</span>
                    <span>• {formatCheckoutPrice(total)}</span>
                  </>
                )}
              </button>

              {/* Trust & Guarantee strip */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2 text-center text-[11px] text-neutral-400">
                <div className="flex items-center justify-center gap-3 text-neutral-300 font-medium">
                  <span>256-Bit SSL Encrypted</span>
                  <span>•</span>
                  <span>7-Day Replacement</span>
                  <span>•</span>
                  <span>Insured Express Air</span>
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

      {/* Explicit COD Order Double Confirmation Modal */}
      {showCodConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 p-6 md:p-7 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-mono font-bold">
                  COD
                </span>
                <h3 className="text-base font-bold text-neutral-900">
                  Confirm Cash on Delivery?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCodConfirmModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border-none flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-100 border border-black/[0.08] text-neutral-800 leading-relaxed">
                <p className="font-bold text-neutral-950 mb-1">
                  ₹{Math.max(0, total).toFixed(2)} to be collected at doorstep
                </p>
                <p className="text-[11px] text-amber-800">
                  Please confirm that you or a family member will be available to accept the parcel and pay via Cash or UPI QR upon delivery.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500 font-medium">Customer:</span>
                  <span className="font-bold text-neutral-900">{name.trim()}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500 font-medium">Phone:</span>
                  <span className="font-mono font-bold text-neutral-900">+91 {phone.replace(/\D/g, '').slice(-10)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500 font-medium">Destination:</span>
                  <span className="font-bold text-neutral-900">{city}, {state} ({zip})</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-black/5">
                  <span className="text-neutral-500 font-medium">Items ({detailed.length}):</span>
                  <span className="font-extrabold text-[#FF4D24]">₹{Math.max(0, total).toFixed(2)} Total</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                disabled={loading || processing}
                onClick={() => setShowCodConfirmModal(false)}
                className="w-full sm:w-1/2 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold border-none cursor-pointer transition-all text-center"
              >
                ← Edit Details
              </button>
              <button
                type="button"
                disabled={loading || processing}
                onClick={executeCodOrder}
                className="w-full sm:w-1/2 py-3 rounded-lg btn-ember text-white text-xs font-bold uppercase tracking-wider border-none shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                {loading || processing ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Placing Order…</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
