import type { MetadataRoute } from 'next';
import { products as fallbackProducts } from '@/lib/data/products';
import { blogPosts } from '@/lib/data/content';
import { isDisallowedProduct } from '@/lib/products-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://rareember-store.vercel.app';
  const now = new Date();

  // Core Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/returns`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/track`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${base}/wishlist`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Category Landing Pages (High SEO Value)
  const categoryRoutes: MetadataRoute.Sitemap = [
    'electronics',
    'fashion',
    'home-living',
    'home-garden',
    'general'
  ].map((cat) => ({
    url: `${base}/shop?cat=${cat}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Dynamic Product Pages fetched from Supabase
  let liveProducts: Array<{ id: string; updated_at?: string }> = [];
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdkkxpfhwrwyoardlceo.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFka2t4cGZod3J3eW9hcmRsY2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Njc2OTcsImV4cCI6MjEwNjQ0MzY5N30.qFvuYQ1G9NvYGYXWVtR6b9dPScOuUIfeVQ8yX3y1DJo';
    const res = await fetch(`${supabaseUrl}/rest/v1/products?select=id,updated_at&market=eq.INDIA&limit=250`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      },
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      liveProducts = await res.json();
    }
  } catch (err) {
    console.error('Sitemap fetch live products error:', err);
  }

  const activeProducts = liveProducts.length > 0
    ? liveProducts.map(p => ({
        url: `${base}/product/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.85
      }))
    : fallbackProducts.filter(p => !isDisallowedProduct(p)).map(p => ({
        url: `${base}/product/${p.id}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.85
      }));

  // Blog Article Pages
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((b) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  return [...staticRoutes, ...categoryRoutes, ...activeProducts, ...blogRoutes];
}
