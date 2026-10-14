const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASS || ''}@db.qdkkxpfhwrwyoardlceo.supabase.co:5432/postgres`;

async function main() {
  if (process.env.CONFIRM_SYNC !== 'YES') {
    console.warn('⚠️ Safety Notice: Script locked. Set CONFIRM_SYNC=YES to execute catalog upsert.');
    return;
  }

  if (!process.env.SUPABASE_DB_PASS && !process.env.DATABASE_URL) {
    console.error('Error: SUPABASE_DB_PASS or DATABASE_URL must be set in environment.');
    return;
  }

  console.log('🔄 Connecting to PostgreSQL on Supabase...');
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('✅ Connected to database.');

  // Safe UPSERT sample item without wiping products table
  const sample = {
    id: 'meesho-nordic-insulated-coffee-tumbler-straw-500ml',
    title: 'Nordic Insulated Stainless Steel Coffee Tumbler with Straw (500ml)',
    description: 'Double-wall vacuum insulated stainless steel tumbler keeping iced drinks cold for 12 hours.',
    price_inr: 499,
    compare_at_price: 999,
    category: 'home-garden',
    image_url: 'https://images.meesho.com/images/products/678942110/tuqoi_512.jpg',
    rating: 4.8,
    reviews: 790,
  };

  const query = `
    INSERT INTO products (id, slug, title, description, price_inr, compare_at_price, category, image_url, rating, reviews, active, supplier, market)
    VALUES ($1, $1, $2, $3, $4, $5, $6, $7, $8, $9, true, 'Meesho', 'INDIA')
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      price_inr = EXCLUDED.price_inr,
      compare_at_price = EXCLUDED.compare_at_price,
      active = true,
      supplier = 'Meesho';
  `;

  await client.query(query, [
    sample.id,
    sample.title,
    sample.description,
    sample.price_inr,
    sample.compare_at_price,
    sample.category,
    sample.image_url,
    sample.rating,
    sample.reviews,
  ]);

  console.log('✅ Successfully upserted flagship product safely without deleting table.');
  await client.end();
}

main().catch(err => {
  console.error('Error during catalog sync:', err);
});
