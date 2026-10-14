const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:(process.env.SUPABASE_DB_PASS || "")@db.qdkkxpfhwrwyoardlceo.supabase.co:5432/postgres';

async function run() {
  const client = new Client(DB_URL);
  await client.connect();

  // Merge 'pet' into 'pets'
  await client.query("UPDATE products SET category = 'pets' WHERE category = 'pet'");

  // Reclassify viral lifestyle items into 'general'
  await client.query(`
    UPDATE products 
    SET category = 'general' 
    WHERE title ILIKE '%bottle%' 
       OR title ILIKE '%stand%' 
       OR title ILIKE '%cutter%' 
       OR title ILIKE '%hook%' 
       OR title ILIKE '%cable%' 
       OR title ILIKE '%solar%' 
       OR title ILIKE '%ear muffs%'
       OR title ILIKE '%freshener%'
  `);

  const counts = await client.query(`
    SELECT category, count(*) 
    FROM products 
    WHERE market = 'INDIA' 
    GROUP BY category 
    ORDER BY count DESC
  `);

  console.log('\n📊 Updated Category Counts:');
  console.table(counts.rows);

  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
