const { Client } = require('../storefront/node_modules/pg');

const client = new Client({
  host: 'db.qdkkxpfhwrwyoardlceo.supabase.co',
  user: 'postgres',
  password: 'RareEmber2026SecureDb123!',
  database: 'postgres',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  
  await client.query(`
    DROP POLICY IF EXISTS allow_service_and_anon_select_orders ON public.orders;
    DROP POLICY IF EXISTS allow_service_and_anon_update_orders ON public.orders;
    
    CREATE POLICY allow_service_and_anon_select_orders ON public.orders FOR SELECT TO anon, authenticated, public, service_role USING (true);
    CREATE POLICY allow_service_and_anon_update_orders ON public.orders FOR UPDATE TO anon, authenticated, public, service_role USING (true) WITH CHECK (true);
  `);
  
  console.log('Successfully enabled SELECT & UPDATE policies on orders table!');
  await client.end();
}

main().catch(console.error);
