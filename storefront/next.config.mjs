/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(self "https://api.razorpay.com")',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.razorpay.com https://checkout.razorpay.com https://www.googletagmanager.com https://connect.facebook.net https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://qikink-stores.s3.ap-south-1.amazonaws.com https://*.amazonaws.com https://*.supabase.co https://images.unsplash.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
      "connect-src 'self' https://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com https://api.postalpincode.in https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://graph.facebook.com",
      "frame-src https://api.razorpay.com https://cdn.razorpay.com https://checkout.razorpay.com https://www.googletagmanager.com https://www.facebook.com",
      "media-src 'self' https://videos.pexels.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    unoptimized: true, // Prevents hitting Vercel 5,000 free-tier Image Transformation limits; loads directly from S3 & fast CDNs
    remotePatterns: [
      { protocol: 'https', hostname: 'qikink-stores.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'videos.pexels.com' },
    ],
  },
  experimental: {
    agentUpgrade: 'security',
    optimizePackageImports: ['framer-motion', 'lucide-react', 'date-fns'],
  },
  async rewrites() {
    return [
      {
        source: '/feed.xml',
        destination: '/api/feed/google',
      },
      {
        source: '/feeds/google-shopping.xml',
        destination: '/api/feed/google',
      },
      {
        source: '/feeds/google.xml',
        destination: '/api/feed/google',
      },
      {
        source: '/google-merchant-feed.xml',
        destination: '/api/feed/google',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/custom-drops',
        destination: '/shop',
        permanent: true,
      },

      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<domain>.*\\.vercel\\.app)',
          },
        ],
        destination: 'https://www.rareember.shop/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'rareember.shop',
          },
        ],
        destination: 'https://www.rareember.shop/:path*',
        permanent: true,
      },
      {
        source: '/product/rare-ember-gateway-test-pass',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/product/64953488',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/product/64953664',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/product/fashion-leather-jacket',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/product/home-espresso-maker',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/product/pets-ortho-bed',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/blog/anxious-dog-sleep-guide',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/cat-scratching-sofa-fix',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/slow-feeder-anxiety',
        destination: '/blog',
        permanent: true,
      },
    ];
  },
  async headers() {
    // NOTE: no long-lived Cache-Control on /_next/static — Next.js sets its
    // own hashed-asset caching in production. In dev we force revalidation
    // so browsers never mix stale + fresh hot-reload chunks (blank page).
    const routes = [{ source: '/:path*', headers: securityHeaders }];
    if (process.env.NODE_ENV !== 'production') {
      routes.push({
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      });
    }
    return routes;
  },
};

export default nextConfig;
