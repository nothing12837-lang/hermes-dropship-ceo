// ─── Rare Ember — Authoritative Brand Copy ───
// Voice: Direct, confident, editorial, human streetwear voice.
// Zero AI slogans. Concrete product details, fabric weights, and genuine policies.

export const COPY = {
  brand: 'Rare Ember',
  slogan: 'Heavyweight streetwear and graphic drops. Crafted in India.',
  tagline: '240 GSM combed cotton tees, heavyweight full sleeve drops, and functional lifestyle goods.',
  promise: 'Pan-India express air dispatch • Free prepaid delivery • 7-day easy returns',

  trustBar: [
    { title: 'Express Air Dispatch', sub: 'Fast air shipping via BlueDart & Delhivery' },
    { title: 'Verified Seller Sourcing', sub: 'Bio-washed combed cotton & dense fleece' },
    { title: 'Transparent Pricing', sub: 'All taxes included • 100% Free prepaid delivery' },
    { title: '7-Day Easy Returns', sub: 'Hassle-free 7-day doorstep returns' },
  ],

  announcement: 'Pan-India express air delivery • Free prepaid delivery on all orders • Cash on Delivery available',

  footer: {
    blurb: 'Independent Indian streetwear. Engineered from heavyweight combed cotton and architectural cuts. Dispatched direct from verified makers with zero middleman markup.',
    cols: [
      {
        title: 'Collection',
        links: [
          { label: 'All Catalog', href: '/shop' },
          { label: "Men's Graphic Drops", href: '/shop?cat=mens-printed' },
          { label: 'All Graphic Prints', href: '/shop?cat=printed' },
          { label: "Women's Collection", href: '/shop?cat=womens' },
          { label: 'Essential Blanks', href: '/shop?cat=blanks' },
        ],
      },
      {
        title: 'About Rare Ember',
        links: [
          { label: 'Brand Story', href: '/about' },
          { label: 'Contact Us', href: '/contact' },
          { label: 'All Catalog Drops', href: '/shop' },
        ],
      },
      {
        title: 'Customer Support',
        links: [
          { label: 'Live Order Tracking', href: '/track' },
          { label: '7-Day Returns Portal', href: '/returns' },
          { label: 'Help Desk & Support Ticket', href: '/support' },
          { label: 'Contact Us & Wholesale', href: '/contact' },
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
    signoff: 'Crafted & Dispatched from Verified Domestic Makers in India.',
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
