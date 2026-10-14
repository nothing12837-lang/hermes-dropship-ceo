const { Client } = require('pg');
const { products } = require('./src/lib/data/products.ts');
const { CURATED_PRODUCT_GALLERIES } = require('./src/lib/data/product-gallery.ts');

const DB_URL = 'postgresql://postgres:(process.env.SUPABASE_DB_PASS || "")@db.qdkkxpfhwrwyoardlceo.supabase.co:5432/postgres';

async function main() {
  console.log('🔄 Connecting directly to PostgreSQL on Supabase...');
  const client = new Client(DB_URL);
  await client.connect();
  console.log('✅ Connected to database.');

  // 1. Purge all legacy / Unsplash products
  console.log('🗑️ Deleting all legacy DeoDap & Unsplash products...');
  const del = await client.query('DELETE FROM products');
  console.log(`✅ Deleted ${del.rowCount} old rows from products table.`);

  // 2. Prepare items list
  const allProds = [...products];
  allProds.push({
    id: 'meesho-nordic-insulated-coffee-tumbler-straw-500ml',
    slug: 'meesho-nordic-insulated-coffee-tumbler-straw-500ml',
    title: 'Nordic Insulated Stainless Steel Coffee Tumbler with Straw (500ml)',
    short: 'Double-wall vacuum insulated stainless steel tumbler keeping iced drinks cold for 12 hours.',
    story: 'Premium matte finish Nordic tumbler with leakproof lid and reusable stainless straw.',
    details: ['Double-wall vacuum insulation', '304 food-grade stainless steel', 'Reusable straw with silicone tip', '500ml capacity fits car cup holders'],
    price: 499,
    price_inr: 499,
    compareAtPrice: 999,
    rating: 4.8,
    reviews: 790,
    category: 'home-garden',
    image_url: 'https://images.meesho.com/images/products/678942110/tuqoi_512.jpg',
    emoji: '☕',
    tag: 'Daily Essential',
    tagColor: '#ea580c',
    tagBg: 'rgba(234,88,12,0.1)',
    gradient: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    benefits: ['Keeps cold for 12 hours', 'Car cup holder friendly'],
    safety: 'BPA-free & food grade',
    badges: ['Top Pick', 'COD Available'],
    is_trending: true,
    is_new: true,
  });

  console.log(`📥 Inserting ${allProds.length} authentic Meesho products with Meesho CDN image URLs...`);

  for (const p of allProds) {
    const gallery = CURATED_PRODUCT_GALLERIES[p.id] || (p.image_url ? [p.image_url] : []);
    const primaryImg = p.image_url || gallery[0];

    await client.query(
      `INSERT INTO products (
        id, slug, title, short, story, description, details,
        price, price_inr, compare_at_price, rating, reviews,
        category, image_url, emoji, tag, tag_color, tag_bg,
        gradient, benefits, safety, badges, is_trending, is_new,
        active, supplier, market
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24,
        $25, $26, $27
      )`,
      [
        p.id,
        p.slug,
        p.title,
        p.short,
        p.story,
        p.story,
        JSON.stringify(p.details || []),
        p.price,
        p.price_inr || p.price,
        p.compareAtPrice || 899,
        p.rating,
        p.reviews,
        p.category || 'home-garden',
        primaryImg,
        p.emoji || '✨',
        p.tag || '',
        p.tagColor || '#ff6b35',
        p.tagBg || 'rgba(255,107,53,0.1)',
        p.gradient || 'linear-gradient(135deg, #fff7ed, #ffedd5)',
        p.benefits || [],
        p.safety || '',
        p.badges || [],
        Boolean(p.is_trending),
        Boolean(p.is_new),
        true,
        'Meesho',
        'INDIA'
      ]
    );
  }

  console.log(`✅ Successfully inserted all ${allProds.length} authentic Meesho products!`);

  // Verify
  const res = await client.query('SELECT count(*) as total, count(CASE WHEN image_url LIKE \'%unsplash%\' THEN 1 END) as unsplash_count FROM products');
  console.log('\n📊 Database Status:');
  console.log(`   Total Products: ${res.rows[0].total}`);
  console.log(`   Unsplash Products Remaining: ${res.rows[0].unsplash_count}`);

  const sample = await client.query('SELECT id, title, image_url FROM products LIMIT 5');
  console.log('\n📸 Sample of Live Database Products:');
  sample.rows.forEach((r, idx) => {
    console.log(`   ${idx + 1}. [${r.id}] ${r.title.slice(0, 35)}... -> ${r.image_url}`);
  });

  await client.end();
}

main().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
