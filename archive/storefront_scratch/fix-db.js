const { Client } = require('pg');
const client = new Client('postgresql://postgres:(process.env.SUPABASE_DB_PASS || "")@db.qdkkxpfhwrwyoardlceo.supabase.co:5432/postgres');
client.connect().then(async () => {
  const cols = [
    'compare_at_price numeric', 'cj_sku text', 'is_trending boolean not null default false',
    'is_new boolean not null default false', 'slug text', 'tag_color text not null default \'#ff6b35\'',
    'tag_bg text not null default \'rgba(255,107,53,0.12)\'', 'short text not null default \'\'',
    'story text not null default \'\'', 'details jsonb not null default \'[]\'',
    'rating numeric not null default 0', 'reviews integer not null default 0',
    'gradient text not null default \'\'', 'chapter text not null default \'\'',
    'pet text not null default \'both\'', 'ages text[] not null default \'{all}\'',
    'benefits text[] not null default \'{}\'', 'safety text not null default \'\'',
    'vet_note text not null default \'\'', 'subscribe_eligible boolean not null default false',
    'wash text not null default \'#fff3e0\'', 'badges text[] not null default \'{}\'',
    'active boolean not null default true', 'updated_at timestamptz not null default now()'
  ];
  for (const c of cols) {
    const colName = c.split(' ')[0];
    try {
      await client.query(`alter table products add column if not exists ${colName} ${c.substring(colName.length)}`);
      console.log('Added', colName);
    } catch(e) { console.error('Error adding', colName, e.message); }
  }
  
  try {
    await client.query(`alter table orders add column if not exists user_id uuid references auth.users(id)`);
    console.log('Added user_id to orders');
  } catch(e) { console.error('Error adding user_id', e.message); }

  const fs = require('fs');
  const sql = fs.readFileSync('supabase/schema.sql', 'utf8');
  await client.query(sql);
  console.log('Schema fully applied!');
}).then(() => client.end()).catch(e => { console.error(e); client.end(); });
