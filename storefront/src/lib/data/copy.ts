// ─── RareEmber — Single source of truth for copy ───
// Source: PROJECT_CONTEXT.md §C + §E (authoritative — do not invent claims).
// Tone: Warm, minimalist, sophisticated, slightly playful.

export const COPY = {
  brand: 'Rare Ember',
  slogan: 'Curated Streetwear & Creator Lifestyle. Delivered fast.',
  tagline: 'Heavyweight streetwear, artisan drinkware & aesthetic desk essentials.',
  promise: '2–4 days express shipping • 24/7 live AI support • Real-time tracking',

  // EXACT trust bar text — clean and professional.
  trustBar: [
    { icon: '🚚', title: 'Express Dispatch', sub: '2–4 days via BlueDart' },
    { icon: '💬', title: '24/7 AI Concierge', sub: 'Radha live assistance' },
    { icon: '📍', title: 'Real-Time Tracking', sub: 'Instant SMS & email ETA' },
    { icon: '↩️', title: '7-Day Replacement', sub: 'Zero-risk guarantee' },
  ],

  announcement: 'Pan-India 2–4 Days Express Delivery • Cash on Delivery (COD) Available • 7-Day Easy Replacement',

  chatbotGreeting:
    "Namaste! I'm Radha, Rare Ember's CEO & AI Shopping Concierge. How can I help you today? (Track an order, verify COD & PIN code, check streetwear sizes, or festive discounts)",

  footer: {
    blurb: 'Curated heavyweight streetwear, artisan drinkware, and aesthetic creator desk gear — delivered fast across India with full white-label packaging.',
    cols: [
      {
        title: 'Story',
        links: [
          { label: 'About Rare Ember', href: '/about' },
          { label: 'How It Works', href: '/about' },
          { label: 'Quality Guarantee', href: '/about' },
        ],
      },
      {
        title: 'Shop',
        links: [
          { label: 'All Catalog', href: '/shop' },
          { label: 'Streetwear Apparel', href: '/shop?cat=fashion' },
          { label: 'Artisan Drinkware', href: '/shop?cat=home-garden' },
          { label: 'Desk & Creator Gear', href: '/shop?cat=electronics' },
          { label: 'Lifestyle Essentials', href: '/shop?cat=general' },
        ],
      },
      {
        title: 'Customer Care',
        links: [
          { label: 'Live Order Tracking', href: '/track' },
          { label: '7-Day Easy Replacements', href: '/returns' },
          { label: 'Contact Us', href: '/contact' },
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
