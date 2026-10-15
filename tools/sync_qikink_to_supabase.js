const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'storefront', '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0 && !line.trim().startsWith('#')) {
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[k] = v;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, 'qikink_scraped_catalog.json'), 'utf8'));

async function sync() {
  console.log(`Starting Supabase sync of ${catalog.length} authentic Qikink products...`);

  // 1. Delete all legacy / random products
  try {
    const delRes = await fetch(`${url}/rest/v1/products?id=neq.placeholder`, {
      method: 'DELETE',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });
    console.log(`Cleared existing products from Supabase (status ${delRes.status})`);
  } catch (err) {
    console.warn('Error clearing old products:', err);
  }

  // 2. Insert the scraped authentic Qikink products
  const rows = catalog.map((p, idx) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.story || p.short,
    short: p.short,
    story: p.story,
    price: p.price,
    price_inr: p.price_inr,
    compare_at_price: p.compare_at_price,
    category: p.category,
    emoji: p.emoji,
    tag: p.tag,
    tag_color: p.tagColor,
    tag_bg: p.tagBg,
    rating: p.rating,
    reviews: p.reviews,
    image_url: p.image_url,
    details: p.details,
    supplier: 'qikink',
    is_trending: idx < 8,
    is_new: idx % 2 === 0,
    active: true,
    chapter: `Drop ${String(idx + 1).padStart(2, '0')}`,
    gradient: 'linear-gradient(135deg, #18181b, #09090b)'
  }));

  try {
    const insRes = await fetch(`${url}/rest/v1/products`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(rows)
    });
    console.log(`Inserted ${rows.length} products to Supabase (status ${insRes.status})`);
    if (!insRes.ok) {
      const errText = await insRes.text();
      console.error('Supabase insert error details:', errText);
    }
  } catch (err) {
    console.error('Insert error:', err);
  }
}

sync();
