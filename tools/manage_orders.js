require('dotenv').config();

const { Client } = require('../storefront/node_modules/pg');

/**
 * Inspects the RLS policies on `orders` and REPAIRS them.
 *
 * History: this script used to CREATE
 *   CREATE POLICY allow_delete_orders ON public.orders FOR DELETE
 *     TO authenticated, anon, service_role USING (true);
 * which granted the PUBLIC ANON KEY the right to delete every order in the
 * database. It also carried the database superuser password in plaintext.
 *
 * Both are fixed here: credentials come from the environment only, and the
 * script now REMOVES permissive policies instead of creating one.
 */
const client = new Client({
  host: process.env.SUPABASE_DB_HOST,
  user: process.env.SUPABASE_DB_USER || 'postgres',
  password: process.env.SUPABASE_DB_PASS,
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  if (!process.env.SUPABASE_DB_PASS) {
    console.error('SUPABASE_DB_PASS is not set. Refusing to connect.');
    process.exit(1);
  }
  await client.connect();

  const policies = await client.query(
    'SELECT polname, polcmd, polroles::regrole[] FROM pg_policy WHERE polrelid = 'public.orders'::regclass;'
  );
  console.log('POLICIES BEFORE:', policies.rows);

  const dangerous = policies.rows.filter(
    (p) =>
      p.polcmd === 'd' ||
      p.polcmd === '*' ||
      (p.polroles || []).some((r) => ['anon', 'public'].includes(String(r)))
  );
  for (const p of dangerous) {
    console.log('Dropping permissive policy:', p.polname);
    await client.query('DROP POLICY IF EXISTS "' + p.polname + '" ON public.orders;');
  }

  await client.query(`
    REVOKE DELETE, UPDATE, INSERT, SELECT ON public.orders FROM anon;
    REVOKE DELETE, UPDATE, INSERT, SELECT ON public.orders FROM authenticated;
  `);
  await client.query(`
    CREATE POLICY service_role_orders_all ON public.orders
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  `);

  const after = await client.query(
    'SELECT polname, polcmd, polroles::regrole[] FROM pg_policy WHERE polrelid = 'public.orders'::regclass;'
  );
  console.log('POLICIES AFTER:', after.rows);

  const stillBad = after.rows.filter((p) =>
    (p.polroles || []).some((r) => ['anon', 'public'].includes(String(r)))
  );
  if (stillBad.length) {
    console.error('FAILED: permissive policies still present:', stillBad);
    await client.end();
    process.exit(1);
  }

  await client.end();
  console.log('orders RLS repaired: anon/authenticated revoked, service_role policy in place.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
