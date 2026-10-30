import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rareember.shop';
  
  const publicAllowedRoutes = [
    '/',
    '/shop',
    '/gsm',
    '/product/',
    '/journal',
    '/blog/',
    '/quiz',
    '/about',
    '/contact',
    '/returns',
    '/terms',
    '/privacy',
    '/llms.txt',
    '/api/feed/google.xml',
    '/api/feed/google',
  ];

  const privateDisallowedRoutes = [
    '/custom-drops',
    '/bulk-orders',
    '/checkout',
    '/admin',
    '/admin/',
    '/profile',
    '/track',
    '/invoice',
    '/success',
    '/login',
    '/reset-password',
    '/product/*gateway*',
    '/product/*test*',
    '/product/*sandbox*',
    '/product/*verification*',
    '/product/*10rs*',
    '/product/*5rs*',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: publicAllowedRoutes,
        disallow: privateDisallowedRoutes,
      },
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Storebot-Google'],
        allow: publicAllowedRoutes,
        disallow: privateDisallowedRoutes,
      },
      {
        userAgent: 'Bingbot',
        allow: publicAllowedRoutes,
        disallow: privateDisallowedRoutes,
      },
      // AI Crawlers & LLM Search Agents (ChatGPT, Perplexity, Claude, Gemini, Apple Intelligence)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
          'Amazonbot',
          'Bytespider',
        ],
        allow: publicAllowedRoutes,
        disallow: privateDisallowedRoutes,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
