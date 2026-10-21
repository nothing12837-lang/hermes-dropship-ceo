// ─── RareEmber — Single source of truth for copy ───
// Source: PROJECT_CONTEXT.md §C + §E (authoritative — do not invent claims).
// Tone: Warm, minimalist, sophisticated, slightly playful.

export const COPY = {
  brand: 'Rare Ember',
  slogan: 'Curated Streetwear & Creator Lifestyle. Delivered fast.',
  tagline: 'Heavyweight streetwear, artisan drinkware & aesthetic desk essentials.',
  promise: '2–4 days express shipping • 12-hour support guarantee • Real-time tracking',

  // EXACT trust bar text — clean and professional.
  trustBar: [
    { icon: '🚚', title: 'Express Dispatch', sub: '2–4 days via BlueDart' },
    { icon: '⏱️', title: '12-Hour Support', sub: 'Guaranteed founder resolution' },
    { icon: '📍', title: 'Real-Time Tracking', sub: 'Instant SMS & email ETA' },
    { icon: '↩️', title: '7-Day Replacement', sub: 'Free doorstep guarantee' },
  ],

  announcement: 'Pan-India 2–4 Days Express Delivery • Cash on Delivery (COD) Available • 7-Day Easy Replacement',

  footer: {
    blurb: 'Curated heavyweight streetwear, artisan drinkware, and aesthetic creator desk gear — delivered fast across India with full white-label packaging.',
    cols: [
      {
        title: 'Story & Merch',
        links: [
          { label: 'About Rare Ember', href: '/about' },
          { label: 'Bulk Orders (B2B)', href: '/bulk-orders' },
          { label: 'Custom Design Studio', href: '/custom-drops' },
          { label: 'Pack of 2 & 3 Bundles', href: '/#value-bundles' },
        ],
      },
      {
        title: 'Shop Drops',
        links: [
          { label: 'All Catalog', href: '/shop' },
          { label: "Men's Graphic Prints", href: '/shop?cat=mens-printed' },
          { label: "Women's Drops", href: '/shop?cat=womens' },
          { label: 'Kids Streetwear', href: '/shop?cat=kids' },
          { label: 'Essential Blanks', href: '/shop?cat=blanks' },
        ],
      },
      {
        title: 'Priority Help & Support',
        links: [
          { label: 'Raise Ticket (12h Reply)', href: '/support' },
          { label: 'Request Founder Callback', href: '/support' },
          { label: 'Instagram @rareember', href: 'https://instagram.com/rareember' },
          { label: 'Live Order Tracking', href: '/track' },
          { label: '7-Day Replacements', href: '/returns' },
          { label: 'rareemberagency@gmail.com', href: 'mailto:rareemberagency@gmail.com' },
        ],
      },
      {
        title: 'Legal & Policies',
        links: [
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Refund & Return Policy', href: '/returns' },
          { label: '256-Bit SSL Secured', href: '/checkout' },
        ],
      },
    ],
    bottom: '© 2026 Rare Ember — Curated Streetwear & Creator Lifestyle',
    signoff: 'White-Label Domestic Fulfillment Hub (Tirupur / Coimbatore, Tamil Nadu)',
  },

  quiz: {
    title: 'Find the perfect match.',
    subtitle: '3 questions. 60 seconds. Curated for your aesthetic & lifestyle.',
  },

  emptyCart: {
    title: 'Your cart is empty.',
    sub: 'Discover trending drops in our catalog.',
  },
} as const;
