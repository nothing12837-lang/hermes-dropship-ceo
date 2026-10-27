import type { MetadataRoute } from 'next';
import { products as fallbackProducts } from '@/lib/data/products';
import { blogPosts } from '@/lib/data/content';
import { isDisallowedProduct } from '@/lib/products-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rareember.shop';
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
        { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${base}/wishlist`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/llms.txt`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  

  // Dynamic Product Pages fetched from Supabase
  let liveProducts: Array<{ id: string; slug?: string; title?: string; category?: string; updated_at?: string }> = [];
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/products?select=id,slug,title,category,updated_at&active=eq.true&limit=250`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        },
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          liveProducts = data.filter((p) => !isDisallowedProduct(p));
        }
      }
    }
  } catch (err) {
    console.error('Sitemap fetch live products error:', err);
  }

  // Products indexed for Google (combines static catalog + any dynamic Supabase products)
  const productMap = new Map<string, { slug: string; updated_at?: string }>();
  fallbackProducts
    .filter((p) => !isDisallowedProduct(p))
    .forEach((p) => productMap.set(p.slug || p.id, { slug: p.slug || p.id }));
  liveProducts.forEach((p) => {
    const slug = p.slug || p.id;
    if (slug) productMap.set(slug, { slug, updated_at: p.updated_at });
  });

  const activeProducts: MetadataRoute.Sitemap = Array.from(productMap.values()).map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // Blog Article Pages from Supabase (Aarav's Content Engine)
  let liveBlogs: Array<{ slug: string; updated_at?: string }> = [];
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const bRes = await fetch(`${supabaseUrl}/rest/v1/blog_posts?select=slug,updated_at&published=eq.true&limit=100`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        next: { revalidate: 3600 }
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        if (Array.isArray(bData)) liveBlogs = bData;
      }
    }
  } catch {}

  const blogRoutes: MetadataRoute.Sitemap = liveBlogs.length > 0
    ? liveBlogs.map(b => ({
        url: `${base}/blog/${b.slug}`,
        lastModified: b.updated_at ? new Date(b.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }))
    : blogPosts.map((b) => ({
        url: `${base}/blog/${b.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.65,
      }));

  return [...staticRoutes, ...activeProducts, ...blogRoutes];
}
