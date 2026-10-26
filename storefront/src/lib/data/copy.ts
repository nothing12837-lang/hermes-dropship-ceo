// ─── Rare Ember — Authoritative Brand Copy ───
// Voice: Direct, confident, editorial, human streetwear voice.
// Zero AI slogans. Concrete product details, fabric weights, and genuine policies.

export const COPY = {
  brand: 'Rare Ember',
  slogan: 'Heavyweight streetwear and graphic drops. Crafted in India.',
  tagline: '240 GSM combed cotton tees, heavyweight full sleeve drops, and functional lifestyle goods.',
  promise: '2–4 business days express air dispatch • Standard delivery included • 7-day returns',

  trustBar: [
    { title: 'Express Air Dispatch', sub: '2–4 business days via BlueDart & Delhivery' },
    { title: 'Tirupur Hub Production', sub: 'Bio-washed combed cotton & dense fleece' },
    { title: 'Transparent Pricing', sub: 'All taxes & air shipping included in price' },
    { title: '7-Day Easy Returns', sub: 'Hassle-free 7-day doorstep returns' },
  ],

  announcement: 'Pan-India 2–4 business days express air delivery • Shipping included in all prices • Cash on Delivery available',

  footer: {
    blurb: 'Independent Indian streetwear. Engineered from heavyweight combed cotton and architectural cuts. Dispatched direct from Tirupur with zero middleman markup.',
    cols: [
      {
        title: 'Collection',
        links: [
          { label: 'All Catalog', href: '/shop' },
          { label: "Men's Graphic Drops", href: '/shop?cat=mens-printed' },
          { label: "Women's Collection", href: '/shop?cat=womens' },
          { label: 'Kids Streetwear', href: '/shop?cat=kids' },
          { label: 'Essential Blanks', href: '/shop?cat=blanks' },
        ],
      },
      {
        title: 'Studio & Services',
        links: [
          { label: 'Custom Merch Studio', href: '/custom-drops' },
          { label: 'About Rare Ember', href: '/about' },
        ],
      },
      {
        title: 'Customer Support',
        links: [
          { label: 'Live Order Tracking', href: '/track' },
          { label: '7-Day Returns Portal', href: '/returns' },
          { label: 'Help Desk & Support Ticket', href: '/support' },
          { label: 'support@rareember.shop', href: 'mailto:support@rareember.shop' },
        ],
      },
      {
        title: 'Policies',
        links: [
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Cancellation & Refunds', href: '/returns' },
          { label: 'Shipping & Delivery Policy', href: '/terms#shipping' },
        ],
      },
    ],
    bottom: '© 2026 Rare Ember. All rights reserved.',
    signoff: 'Crafted & Dispatched from Tirupur Hub, Tamil Nadu, India.',
  },

  quiz: {
    title: 'Find your silhouette.',
    subtitle: 'Answer 3 quick fit questions to find your size and cut.',
  },

  emptyCart: {
    title: 'Your shopping bag is empty.',
    sub: 'Explore our latest heavyweight graphic drops and blank silhouettes.',
  },
} as const;
