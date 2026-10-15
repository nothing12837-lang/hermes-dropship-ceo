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
  const policies = await client.query(`
    SELECT polname, polcmd, polroles::regrole[] 
    FROM pg_policy 
    WHERE polrelid = 'public.orders'::regclass;
  `);
  console.log('POLICIES:', policies.rows);

  // Check if DELETE policy exists for service_role and anon
  const hasDelete = policies.rows.some(p => p.polcmd === 'd' || p.polcmd === '*');
  if (!hasDelete) {
    console.log('Adding DELETE policy for admin/service...');
    await client.query(`
      CREATE POLICY allow_delete_orders ON public.orders
      FOR DELETE
      TO authenticated, anon, service_role
      USING (true);
    `);
    console.log('DELETE policy added successfully');
  } else {
    console.log('DELETE policy already present');
  }

  await client.end();
}

main().catch(console.error);
