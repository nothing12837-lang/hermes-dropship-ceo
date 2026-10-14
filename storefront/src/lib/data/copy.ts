// ─── RareEmber — Single source of truth for copy ───
// Source: PROJECT_CONTEXT.md §C + §E (authoritative — do not invent claims).
// Tone: Warm, minimalist, sophisticated, slightly playful.

export const COPY = {
  brand: 'rareember',
  slogan: 'Everything you need. Delivered fast.',
  tagline: 'Trending electronics, fashion, home and more — one everything store.',
  promise: 'standard shipping (7-14 days) • 24/7 live AI support • Real-time tracking',

  // EXACT trust bar text from PROJECT_CONTEXT.md §E — do not reword.
  trustBar: [
    { icon: '🚚', title: 'standard shipping', sub: '7-14 days' },
    { icon: '💬', title: '24/7 Live AI Support', sub: 'Instant help' },
    { icon: '📍', title: 'Real-Time Tracking', sub: 'Know where your package is' },
    { icon: '↩️', title: 'Easy Replacements', sub: 'Hassle-free process' },
  ],

  announcement: 'standard shipping (7-14 days) • 24/7 live AI support • Real-time tracking',

  chatbotGreeting:
    "Namaste! I'm Radha, RareEmber's CEO & AI Shopping Concierge. How can I help you today? (Track an order, verify COD & PIN code, check product specs, or discounts)",

  footer: {
    blurb: 'Everything you need. Trending electronics, fashion, home essentials and more — delivered fast.',
    cols: [
      {
        title: 'Story',
        links: [
          { label: 'About RareEmber', href: '/about' },
          { label: 'Radha & AI Executive Board', href: '/team' },
          { label: 'How It Works', href: '/about' },
          { label: 'Quality Guarantee', href: '/about' },
        ],
      },
      {
        title: 'Shop',
        links: [
          { label: 'All Catalog', href: '/shop' },
          { label: 'Electronics & Tech', href: '/shop?cat=electronics' },
          { label: 'Curated Fashion', href: '/shop?cat=fashion' },
          { label: 'Home & Living', href: '/shop?cat=home-garden' },
          { label: 'Viral Drops', href: '/shop?cat=general' },
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
    bottom: '© 2026 RareEmber — Handpicked Quality & Express Delivery',
    signoff: 'Pan-India & Worldwide Fulfillment Hubs',
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
