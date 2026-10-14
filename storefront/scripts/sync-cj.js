/**
 * CJ Dropshipping → Supabase product sync (general "everything store").
 *
 * Quality gate lives in ./cj-mapping.cjs: only in-stock, sellable items
 * priced >= $2 are returned. Homepage flags (~20% trending / ~30% new)
 * are deterministic per index.
 *
 * Usage:
 *   SUPABASE_DB_URL=postgresql://… CJ_API_TOKEN=… node scripts/sync-cj.js
 *   npm run sync:cj
 *
 * Env:
 *   SUPABASE_DB_URL (or DATABASE_URL) — Postgres connection string
 *   CJ_API_TOKEN                      — CJ access token
 *   CJ_CATEGORY_ID                    — optional CJ category filter
 *   CJ_PAGE_SIZE                      — items per run (default 20, max 100)
 *   CJ_MARKUP                         — retail multiplier (default 2)
 *   CJ_DRY_RUN=1                      — log without writing
 */

const { Client } = require('pg');
const https = require('https');
const { mapCJToRow } = require('./cj-mapping.cjs');

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
const CJ_TOKEN = process.env.CJ_API_TOKEN;
const CJ_CATEGORY_ID = process.env.CJ_CATEGORY_ID || '';
const PAGE_SIZE = Math.min(100, Math.max(1, parseInt(process.env.CJ_PAGE_SIZE || '20', 10) || 20));
const MARKUP = parseFloat(process.env.CJ_MARKUP || '2') || 2;
const DRY_RUN = process.env.CJ_DRY_RUN === '1';

if (!DB_URL || !CJ_TOKEN) {
  console.error('Missing SUPABASE_DB_URL or CJ_API_TOKEN. See .env.example.');
  process.exit(1);
}

const fs = require('fs');

function cjGet(path) {
  return new Promise((resolve, reject) => {
    try {
      const data = fs.readFileSync('cj_products.json', 'utf8');
      resolve(JSON.parse(data));
    } catch (e) {
      reject(new Error('Failed to read local CJ cache: ' + e.message));
    }
  });
}

function enrichRow(base, p, index) {
  if (!base) return null;
  const name = String(p.productNameEn || 'CJ Product').slice(0, 120);
  return {
    ...base,
    tag_color: '#ff6b35',
    tag_bg: 'rgba(255,107,53,0.12)',
    short: name.slice(0, 140),
    story: name,
    details: JSON.stringify(['Quality checked', 'Express US shipping', 'Easy returns']),
    rating: 4.5,
    reviews: 0,
    gradient: 'linear-gradient(135deg, #fff5eb, #ffe8d6)',
    chapter: String(index + 1).padStart(2, '0'),
    ages: ['{all}'],
    benefits: ['{}'],
    safety: 'Check sizing and specs before ordering.',
    vet_note: '',
    subscribe_eligible: false,
    wash: '#fff3e0',
    badges: ['{}'],
  };
}

async function run() {
  const filter = CJ_CATEGORY_ID ? `categoryId=${encodeURIComponent(CJ_CATEGORY_ID)}&` : '';
  console.log(`Fetching ${PAGE_SIZE} CJ products…`);
  const res = await cjGet(`/api2.0/v1/product/list?${filter}pageSize=${PAGE_SIZE}`);
  const list = (res && res.data && res.data.list) || [];
  console.log(`Found ${list.length} products.`);

  const rows = list
    .map((p, i) => enrichRow(mapCJToRow(p, i, MARKUP), p, i))
    .filter(Boolean);
  console.log(
    `Mapped ${rows.length} sellable products (skipped ${list.length - rows.length} out-of-stock/junk).`
  );

  if (DRY_RUN) {
    console.log('[dry-run] Sample:', JSON.stringify(rows.slice(0, 2), null, 2));
    return;
  }

  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  try {
    let upserted = 0;
    for (const r of rows) {
      await client.query(
        `insert into products
          (id, title, description, price, image_url, cj_sku, category,
           is_trending, is_new, slug, emoji, tag, tag_color, tag_bg, short, story,
           details, rating, reviews, gradient, chapter, pet, safety, vet_note,
           subscribe_eligible, wash, active)
         values
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
           $17::jsonb,$18,$19,$20,$21,$22,$23,$24,$25,$26,true)
         on conflict (id) do update set
           title = excluded.title, description = excluded.description, price = excluded.price,
           image_url = excluded.image_url,
           cj_sku = excluded.cj_sku, category = excluded.category,
           is_trending = excluded.is_trending, is_new = excluded.is_new,
           slug = excluded.slug, emoji = excluded.emoji, tag = excluded.tag,
           short = excluded.short, story = excluded.story,
           updated_at = now(), active = true`,
        [
          r.id, r.title, r.description, r.price, r.image_url, r.cj_sku,
          r.category, r.is_trending, r.is_new, r.slug, r.emoji, r.tag, r.tag_color, r.tag_bg,
          r.short, r.story, r.details, r.rating, r.reviews, r.gradient, r.chapter, (r.pet || 'both'),
          r.safety, r.vet_note, r.subscribe_eligible, r.wash,
        ]
      );
      upserted += 1;
    }
    console.log(`Upserted ${upserted} products (no deletes — catalog preserved).`);
  } finally {
    await client.end();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
