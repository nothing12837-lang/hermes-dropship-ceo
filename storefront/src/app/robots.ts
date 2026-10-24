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
          '/api/admin/',
          '/checkout',
          '/login',
          '/profile',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/admin/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/api/admin/'],
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
          '/invoice',
          '/track',
          '/blog',
          '/custom-drops',
        ],
        disallow: ['/admin/', '/api/', '/checkout', '/login', '/profile'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
