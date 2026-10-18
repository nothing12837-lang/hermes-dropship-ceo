import Link from 'next/link';
import { blogPosts } from '@/lib/data/content';
import { ChapterHeading } from '@/components/ui/Story';

export const metadata = {
  title: 'Lifestyle, Tech & Home Guides',
  description: 'Curated styling tips, workspace ergonomics, and smart home guides from the RareEmber design studio.',
};

const DISALLOWED_BLOG_TERMS = ['mandir', 'diya', 'diyas', 'pooja', 'puja', 'temple', 'festive-lighting', 'pet', 'dog', 'cat'];

function isAllowedBlog(p: { slug?: string; title?: string; category?: string; excerpt?: string }) {
  const combined = `${p.slug || ''} ${p.title || ''} ${p.category || ''} ${p.excerpt || ''}`.toLowerCase();
  return !DISALLOWED_BLOG_TERMS.some((term) => combined.includes(term));
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
              emoji: '✨',
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

  posts = posts.filter(isAllowedBlog);

  return (
    <main className="page-top" style={{ background: '#fffbf5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '76rem', margin: '0 auto', padding: '2rem' }}>
        <ChapterHeading index="✨" label="Design & Utility Guides" title="Elevate your" accent="everyday living." />
        <p style={{ color: '#52453e', marginTop: '-1.5rem', marginBottom: '2.5rem', maxWidth: '600px' }}>
          Actionable aesthetic blueprints, workspace setups, and smart home recommendations — curated by our design team.
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
