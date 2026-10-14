import Link from 'next/link';
import { blogPosts } from '@/lib/data/content';
import { ChapterHeading } from '@/components/ui/Story';

export const metadata = {
  title: 'Lifestyle, Tech & Home Guides',
  description: 'Curated styling tips, workspace ergonomics, and smart home guides from the RareEmber design studio.',
};

export default function BlogPage() {
  return (
    <main className="page-top" style={{ background: '#fffbf5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '76rem', margin: '0 auto', padding: '2rem' }}>
        <ChapterHeading index="✨" label="Design & Utility Guides" title="Elevate your" accent="everyday living." />
        <p style={{ color: '#52453e', marginTop: '-1.5rem', marginBottom: '2.5rem', maxWidth: '600px' }}>
          Actionable aesthetic blueprints, workspace setups, and smart home recommendations — curated by our design team.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.4rem' }}>
          {blogPosts.map((b) => (
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
