import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rareember.shop';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/checkout',
          '/login',
          '/reset-password',
          '/profile',
          '/invoice',
          '/track',
          '/success',
          '/product/*gateway*',
          '/product/*test*',
          '/product/*sandbox*',
          '/product/*verification*',
        ],
      },
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Storebot-Google'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/login', '/reset-password', '/profile', '/invoice', '/track', '/success', '/product/*gateway*', '/product/*test*', '/product/*sandbox*', '/product/*verification*'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/login', '/reset-password', '/profile', '/invoice', '/track', '/success', '/product/*gateway*', '/product/*test*', '/product/*sandbox*', '/product/*verification*'],
      },
      // AI Crawlers & LLM Search Agents (ChatGPT, Perplexity, Claude, Gemini, Apple Intelligence)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
          'Amazonbot',
          'Bytespider',
        ],
        allow: [
          '/',
          '/llms.txt',
          '/llms-full.txt',
          '/shop',
          '/product/',
          '/about',
          '/contact',
          '/returns',
          '/blog',
        ],
        disallow: ['/admin/', '/api/', '/checkout', '/login', '/reset-password', '/profile', '/invoice', '/track', '/success', '/product/*gateway*', '/product/*test*', '/product/*sandbox*', '/product/*verification*'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
