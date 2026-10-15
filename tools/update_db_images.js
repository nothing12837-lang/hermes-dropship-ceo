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

const MAPPING = {
  "rareember-oversized-streetwear-tee-obsidian": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
  "rareember-oversized-streetwear-tee-offwhite": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
  "rareember-heavyweight-fleece-hoodie-onyx": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
  "rareember-heavyweight-zip-up-hoodie-bone": "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1000&q=80",
  "rareember-essential-crewneck-sweatshirt-heather": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80",
  "rareember-acid-wash-vintage-oversized-tee": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80",
  "rareember-supima-luxury-minimalist-tee": "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=80",
  "rareember-streetwear-heavyweight-cargo-joggers": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1000&q=80",
  "rareember-premium-matty-polo-tshirt": "https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&w=1000&q=80",
  "rareember-sleeveless-athletic-tank-top": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=80",
  "rareember-womens-cropped-fleece-hoodie": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
  "rareember-womens-boxy-heavyweight-crop-tee": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
  "rareember-matte-black-ceramic-coffee-mug": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
  "rareember-magic-thermochromic-ceramic-mug": "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80",
  "rareember-thermal-insulated-travel-tumbler-straw": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80",
  "rareember-frosted-glass-sipper-bamboo-lid": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=80",
  "rareember-stainless-sports-insulated-flask": "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=1000&q=80",
  "rareember-extended-desk-mat-gaming-mousepad": "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=1000&q=80",
  "rareember-compact-microfiber-desk-mousepad": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80",
  "rareember-shockproof-matte-iphone-case": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1000&q=80",
  "rareember-padded-creator-laptop-sleeve": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1000&q=80",
  "rareember-heavyweight-canvas-tote-bag": "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&w=1000&q=80",
  "rareember-hardbound-minimalist-dot-journal": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
  "rareember-wooden-framed-streetwear-art-poster": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80",
  "rareember-waterproof-vinyl-sticker-pack": "https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=1000&q=80"
};

async function updateDb() {
  for (const [id, imageUrl] of Object.entries(MAPPING)) {
    try {
      const resp = await fetch(`${url}/rest/v1/products?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ image_url: imageUrl })
      });
      console.log(`[Supabase DB Update] ${id}: status ${resp.status}`);
    } catch (err) {
      console.error(`Error updating ${id}:`, err);
    }
  }
}

updateDb();
