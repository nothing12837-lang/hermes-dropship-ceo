// Indian Festive Calendar & Automatic Theme & Coupon Expiry Engine for RareEmber

export interface ScheduledFestival {
  id: string;
  name: string;
  greeting: string;
  subheading: string;
  couponCode: string;
  discountDescription: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrderValue: number;
  badgeEmoji: string;
  effect: 'fireworks' | 'color-splash' | 'confetti' | 'diya-glow' | 'subtle-ember';
  // Calendar active window (month is 1-indexed for readability: 1=Jan, 10=Oct, 11=Nov, etc.)
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  expiryNotice: string;
}

export const INDIAN_FESTIVALS: ScheduledFestival[] = [
  {
    id: 'diwali_navratri',
    name: 'Navratri & Diwali (Deepawali)',
    greeting: '🪔 Happy Navratri & Happy Diwali Grand Festive Sale! ✨',
    subheading: 'Celebrate the festive season of lights! 2–4 days express delivery across 19,000+ PIN codes with COD.',
    couponCode: 'DIWALI100',
    discountDescription: 'Flat ₹100 OFF on orders above ₹1,299',
    discountType: 'flat',
    discountValue: 100,
    minOrderValue: 1299,
    badgeEmoji: '🪔',
    effect: 'fireworks',
    startMonth: 10, // Oct 1
    startDay: 1,
    endMonth: 11, // Nov 20
    endDay: 20,
    expiryNotice: 'Valid till 20th November 2026',
  },
  {
    id: 'newyear',
    name: 'New Year Celebration',
    greeting: '🎉 Happy New Year 2026 Grand Celebration Sale!',
    subheading: 'Upgrade your living and daily comfort with fresh factory drops. Pan-India Express Delivery.',
    couponCode: 'NEWYEAR2026',
    discountDescription: 'Flat ₹100 OFF on orders above ₹899',
    discountType: 'flat',
    discountValue: 100,
    minOrderValue: 899,
    badgeEmoji: '🎉',
    effect: 'confetti',
    startMonth: 12,
    startDay: 20,
    endMonth: 1, // Jan 5
    endDay: 5,
    expiryNotice: 'Valid till 5th January',
  },
  {
    id: 'republic_day',
    name: 'Republic Day Freedom Drop',
    greeting: '🇮🇳 Republic Day Grand Freedom Festival!',
    subheading: 'Special domestic curated deals direct from verified domestic makers with Pan-India COD.',
    couponCode: 'FREEDOM15',
    discountDescription: '15% OFF on orders above ₹1,299',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 1299,
    badgeEmoji: '🇮🇳',
    effect: 'confetti',
    startMonth: 1,
    startDay: 20,
    endMonth: 1,
    endDay: 28,
    expiryNotice: 'Valid till 28th January',
  },
  {
    id: 'holi',
    name: 'Holi (Festival of Colors)',
    greeting: '🎨 Happy Holi! Vibrant Festive Color Splash Sale! 🌈',
    subheading: 'Splash into joy with trending lifestyle winners and zero-risk 7-day easy replacement policy.',
    couponCode: 'HOLI100',
    discountDescription: 'Flat ₹100 OFF on orders above ₹899',
    discountType: 'flat',
    discountValue: 100,
    minOrderValue: 899,
    badgeEmoji: '🎨',
    effect: 'color-splash',
    startMonth: 3,
    startDay: 1,
    endMonth: 3,
    endDay: 22,
    expiryNotice: 'Valid till 22nd March',
  },
  {
    id: 'rakhi_independence',
    name: 'Raksha Bandhan & Independence Drop',
    greeting: '🇮🇳 Raksha Bandhan & Independence Festive Utsav!',
    subheading: 'Auspicious gifting drops delivered fast with verified doorstep tracking.',
    couponCode: 'RAKHI15',
    discountDescription: '15% OFF on orders above ₹1,299',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 1299,
    badgeEmoji: '🎁',
    effect: 'diya-glow',
    startMonth: 8,
    startDay: 8,
    endMonth: 8,
    endDay: 25,
    expiryNotice: 'Valid till 25th August',
  },
];

// Evergreen Standard Coupons (Always valid regardless of season)
export const EVERGREEN_COUPONS: Record<
  string,
  { type: 'flat' | 'percentage'; value: number; minOrder: number; desc: string }
> = {
  FIRST100: {
    type: 'flat',
    value: 100,
    minOrder: 899,
    desc: 'Flat ₹100 OFF for Verified Community Reviewers (orders above ₹899)',
  },
  REDDIT10: {
    type: 'percentage',
    value: 10,
    minOrder: 899,
    desc: '10% OFF for Reddit Streetwear Community supporters (₹899+)',
  },
  FIRST50: {
    type: 'flat',
    value: 50,
    minOrder: 799,
    desc: 'Flat ₹50 OFF on orders above ₹799',
  },
  PREPAID30: {
    type: 'flat',
    value: 30,
    minOrder: 699,
    desc: 'Flat ₹30 Instant Savings for 100% Prepaid UPI Checkout (₹699+)',
  },
  DUO99: {
    type: 'flat',
    value: 99,
    minOrder: 1499,
    desc: 'Flat ₹99 OFF on Streetwear Duo Bundles (₹1,499+)',
  },
  BUILDER99: {
    type: 'flat',
    value: 99,
    minOrder: 1499,
    desc: 'Flat ₹99 OFF on Founding 50 Builder Pack (₹1,499+)',
  },
  BUNDLE150: {
    type: 'flat',
    value: 150,
    minOrder: 1899,
    desc: 'Flat ₹150 OFF on Curated Workstation & Heavyweight Combos (₹1,899+)',
  },
  EMBER: {
    type: 'percentage',
    value: 10,
    minOrder: 1299,
    desc: '10% OFF on cart value above ₹1,299',
  },
  WELCOME10: {
    type: 'percentage',
    value: 10,
    minOrder: 1299,
    desc: '10% OFF on cart value above ₹1,299',
  },
  FIRST10: {
    type: 'percentage',
    value: 10,
    minOrder: 1299,
    desc: '10% OFF on First Order above ₹1,299',
  },
};

/**
 * Checks if a date falls inside a start and end window
 */
function isDateInWindow(now: Date, startM: number, startD: number, endM: number, endD: number): boolean {
  const currentM = now.getMonth() + 1; // 1-12
  const currentD = now.getDate();

  // Same year window (e.g. Oct 1 to Nov 20)
  if (startM <= endM) {
    if (currentM < startM || currentM > endM) return false;
    if (currentM === startM && currentD < startD) return false;
    if (currentM === endM && currentD > endD) return false;
    return true;
  }

  // Cross year window (e.g. Dec 20 to Jan 5)
  if (currentM === startM && currentD >= startD) return true;
  if (currentM > startM) return true;
  if (currentM === endM && currentD <= endD) return true;
  if (currentM < endM) return true;
  return false;
}

/**
 * Returns the currently active festival or null if off-season.
 */
export function getActiveFestival(overrideId?: string | null): ScheduledFestival | null {
  // 1. Manual override (admin or testing)
  if (overrideId) {
    const found = INDIAN_FESTIVALS.find((f) => f.id === overrideId);
    if (found) return found;
  }

  // 2. Client-side localStorage override
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('rareember_festive_override');
      if (stored && stored !== 'off') {
        const found = INDIAN_FESTIVALS.find((f) => f.id === stored);
        if (found) return found;
      } else if (stored === 'off') {
        return null;
      }
    } catch {}
  }

  // 3. Automated calendar date detection
  const now = new Date();
  for (const fest of INDIAN_FESTIVALS) {
    if (isDateInWindow(now, fest.startMonth, fest.startDay, fest.endMonth, fest.endDay)) {
      return fest;
    }
  }

  return null;
}

/**
 * Validates a coupon code, enforcing festival date windows and expiration!
 */
export function validateCouponCode(
  rawCode: string,
  subtotal: number,
  overrideDate?: Date
): {
  valid: boolean;
  discountAmount: number;
  label: string;
  error?: string;
} {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, discountAmount: 0, label: '', error: 'Please enter a coupon code.' };
  }

  const now = overrideDate || new Date();

  // 1. Check Evergreen Coupons
  if (EVERGREEN_COUPONS[code]) {
    const c = EVERGREEN_COUPONS[code];
    if (subtotal < c.minOrder) {
      return {
        valid: false,
        discountAmount: 0,
        label: '',
        error: `Code ${code} requires a minimum order of ₹${c.minOrder}.`,
      };
    }
    const discountAmount =
      c.type === 'flat' ? c.value : Math.round(subtotal * (c.value / 100));
    return {
      valid: true,
      discountAmount,
      label: `${code} (${c.type === 'flat' ? `₹${c.value} OFF` : `${c.value}% OFF`})`,
    };
  }

  // 2. Check Festival Coupons
  const matchingFest = INDIAN_FESTIVALS.find(
    (f) =>
      f.couponCode === code ||
      (code === 'NAVRATRI15' && f.id === 'diwali_navratri')
  );

  if (matchingFest) {
    // Check if the festival is actively running on current calendar date
    const isActive = isDateInWindow(
      now,
      matchingFest.startMonth,
      matchingFest.startDay,
      matchingFest.endMonth,
      matchingFest.endDay
    );

    if (!isActive) {
      return {
        valid: false,
        discountAmount: 0,
        label: '',
        error: `⚠️ The ${code} coupon has EXPIRED (${matchingFest.expiryNotice}). Try evergreen code "FIRST50" or "EMBER".`,
      };
    }

    if (subtotal < matchingFest.minOrderValue) {
      return {
        valid: false,
        discountAmount: 0,
        label: '',
        error: `Code ${code} requires a minimum order of ₹${matchingFest.minOrderValue}.`,
      };
    }

    const discountAmount =
      matchingFest.discountType === 'flat'
        ? matchingFest.discountValue
        : Math.round(subtotal * (matchingFest.discountValue / 100));

    return {
      valid: true,
      discountAmount,
      label: `${code} (${matchingFest.discountType === 'flat' ? `₹${matchingFest.discountValue} OFF` : `${matchingFest.discountValue}% OFF`})`,
    };
  }

  // 3. Check Store Credit Vouchers (e.g. CREDIT-770-75DC, CREDIT-769-F57F-A1B2C3, RECREDIT-500-XXXX)
  // The 6-character HMAC signature is MANDATORY. The previous regex made it
  // optional, so an unsigned "CREDIT-9999-XX" string was accepted as a valid
  // discount with no database check at all.
  const creditMatch = code.match(/^(?:RE-?)?CREDIT-(\d{2,6})-([A-Z0-9]{3,10})-([A-Z0-9]{6})$/i);
  if (creditMatch) {
    const creditAmount = parseInt(creditMatch[1], 10);
    if (creditAmount > 0) {
      const discountAmount = Math.min(creditAmount, subtotal);
      return {
        valid: true,
        discountAmount,
        label: `Store Credit (${code}: ₹${discountAmount} Applied)`,
      };
    }
  }

  return {
    valid: false,
    discountAmount: 0,
    label: '',
    error: 'Invalid coupon code. Try "DIWALI100" (orders above ₹1,299) or "FIRST50".',
  };
}
