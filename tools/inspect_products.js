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

async function check() {
  try {
    const res = await fetch(`${url}/rest/v1/products?select=id,title,image_url,category&limit=100`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });
    const products = await res.json();
    console.log('Total products from Supabase DB:', products.length);
    products.forEach((p, i) => {
      console.log(`${i+1}. [${p.id}] ${p.title} -> ${p.image_url ? p.image_url.slice(0, 70) : 'NO_IMAGE'}`);
    });
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

check();
