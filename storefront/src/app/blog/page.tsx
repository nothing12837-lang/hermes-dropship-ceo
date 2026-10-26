import Link from 'next/link';
import { blogPosts } from '@/lib/data/content';
import { ChapterHeading } from '@/components/ui/Story';

export const metadata = {
  title: 'Atelier Journal • Streetwear & Tech Culture',
  description: 'Fabric engineering, 240/380 GSM craftsmanship, hackathon custom merch guides, and minimalist creator workstation blueprints.',
};

export const DISALLOWED_BLOG_TERMS = [
  'mandir', 'diya', 'diyas', 'pooja', 'puja', 'temple', 'festive-lighting', 'pet', 'dog', 'cat',
  'kitchen', 'organizer', 'organizers', 'diffuser', 'diffusers', 'sleep-wellness', 'lighting',
  'dining-decor', 'under-500', '500-rupees', '500 rupees', 'ambient-living', 'home-lighting',
  'smart-kitchen', 'save-2-hours', 'bedroom-desk', 'cozy-bedroom', 'transform-sleep', 'wabi-sabi',
];

export function isAllowedBlog(p: { slug?: string; title?: string; category?: string; excerpt?: string }) {
  const combined = `${p.slug || ''} ${p.title || ''} ${p.category || ''} ${p.excerpt || ''}`.toLowerCase();
  return !DISALLOWED_BLOG_TERMS.some((term) => combined.includes(term));
}

export function deduplicatePosts<T extends { title?: string; slug?: string }>(items: T[]): T[] {
  const seenTitles = new Set<string>();
  const seenSlugs = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    // Normalize slug by removing trailing numeric timestamp suffixes (e.g. -202610151640)
    const baseSlug = (item.slug || '').toLowerCase().replace(/-\d{10,}$/, '');
    const normTitle = (item.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    if (seenTitles.has(normTitle) || seenSlugs.has(baseSlug)) {
      continue;
    }
    seenTitles.add(normTitle);
    seenSlugs.add(baseSlug);
    result.push(item);
  }
  return result;
}

export default async function BlogPage() {
  let posts = blogPosts.filter(isAllowedBlog);
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/blog_posts?published=eq.true&select=*&order=created_at.desc&limit=50`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const dbPosts = rows
            .filter((r: any) => isAllowedBlog(r))
            .map((r: any) => ({
              slug: r.slug,
              title: r.title,
              category: r.category || 'Streetwear & Desk',
              readTime: '4 min',
              emoji: '⚡',
              wash: '#fff3e0',
              excerpt: r.excerpt || (r.content ? r.content.slice(0, 120) + '...' : ''),
              body: []
            }));
          const existingSlugs = new Set(posts.map(p => p.slug));
          for (const dp of dbPosts) {
            if (!existingSlugs.has(dp.slug)) {
              posts.unshift(dp);
            }
          }
        }
      }
    }
  } catch {}

  posts = deduplicatePosts(posts.filter(isAllowedBlog));

  return (
    <main className="page-top" style={{ background: '#fffbf5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '76rem', margin: '0 auto', padding: '2rem' }}>
        <ChapterHeading index="⚡" label="Atelier Journal" title="Streetwear, Craft &" accent="Creator Culture." />
        <p style={{ color: '#52453e', marginTop: '-1.5rem', marginBottom: '2.5rem', maxWidth: '600px' }}>
          Actionable guides on 240/380 GSM garment engineering, domestic maker craftsmanship, campus merch, and minimalist creator workspaces.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.4rem' }}>
          {posts.map((b) => (
            <Link key={b.slug} href={`/blog/${b.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: b.wash, borderRadius: '1.6rem', padding: '2.2rem', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '2.6rem' }}>{b.emoji}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '1.2rem', opacity: 0.6 }}>
                  {b.category} • {b.readTime}
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.35rem', lineHeight: 1.3, marginTop: '0.6rem' }}>{b.title}</div>
                <div style={{ color: '#52453e', marginTop: '0.8rem', lineHeight: 1.6 }}>{b.excerpt}</div>
                <div style={{ marginTop: 'auto', paddingTop: '1.2rem', fontWeight: 800, color: '#ff4d24' }}>Read guide →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
