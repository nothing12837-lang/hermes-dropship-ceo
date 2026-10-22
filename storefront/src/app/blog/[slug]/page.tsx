import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/data/content';

const DISALLOWED_BLOG_TERMS = ['mandir', 'diya', 'diyas', 'pooja', 'puja', 'temple', 'festive-lighting', 'pet', 'dog', 'cat'];

function isAllowedBlog(p: { slug?: string; title?: string; category?: string; excerpt?: string }) {
  const combined = `${p.slug || ''} ${p.title || ''} ${p.category || ''} ${p.excerpt || ''}`.toLowerCase();
  return !DISALLOWED_BLOG_TERMS.some((term) => combined.includes(term));
}

export function generateStaticParams() {
  return blogPosts.filter(isAllowedBlog).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((b) => b.slug === slug);
  if (!post) {
    return {
      title: 'Journal & Stories | Rare Ember',
    };
  }
  return {
    title: `${post.title} | Rare Ember Journal`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug || DISALLOWED_BLOG_TERMS.some((term) => slug.toLowerCase().includes(term))) {
    return notFound();
  }

  let post = blogPosts.find((b) => b.slug === slug);
  if (!post) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const res = await fetch(`${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=*`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
          next: { revalidate: 3600 }
        });
        if (res.ok) {
          const rows = await res.json();
          if (rows && rows.length > 0) {
            const r = rows[0];
            post = {
              slug: r.slug,
              title: r.title,
              excerpt: r.excerpt || '',
              category: r.category || 'Lifestyle',
              readTime: '4 min',
              emoji: '✨',
              wash: '#fff3e0',
              body: r.content ? r.content.split('\n\n').filter(Boolean) : [r.excerpt || '']
            };
          }
        }
      }
    } catch {}
  }
  if (!post || !isAllowedBlog(post)) return notFound();

  return (
    <main className="page-top" style={{ background: '#fffbf5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>
        <Link href="/blog" style={{ color: '#8a7b6b', fontWeight: 700, textDecoration: 'none' }}>← All lifestyle guides</Link>
        <div style={{ background: post.wash, borderRadius: '1.6rem', padding: '2.5rem', marginTop: '1.5rem' }}>
          <div style={{ fontSize: '3rem' }}>{post.emoji}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '1rem', opacity: 0.6 }}>
            {post.category} • {post.readTime} read • RareEmber Studio
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: '0.8rem' }}>
            {post.title}
          </h1>
        </div>
        <div style={{ display: 'grid', gap: '1.2rem', marginTop: '2rem', fontSize: '1.05rem', lineHeight: 1.8, color: '#321004' }}>
          {post.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div style={{ marginTop: '2.5rem', background: '#161311', color: 'white', borderRadius: '1.4rem', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: '1.3rem' }}>Upgrade Your Space With Direct Factory Pricing →</div>
          <div style={{ opacity: 0.65, marginTop: '0.5rem' }}>Curated lifestyle & tech drops with Free Pan-India Delivery + COD</div>
          <Link href="/shop" style={{ display: 'inline-block', marginTop: '1.2rem', background: '#ff4d24', color: 'white', padding: '0.9rem 2rem', borderRadius: '9999px', fontWeight: 800, textDecoration: 'none' }}>
            Explore The Catalog →
          </Link>
        </div>
      </div>
    </main>
  );
}
