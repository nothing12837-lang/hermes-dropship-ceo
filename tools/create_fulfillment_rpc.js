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
  
  const sql = `
    CREATE OR REPLACE FUNCTION get_order_for_fulfillment(p_order_id TEXT)
    RETURNS SETOF public.orders
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT * FROM public.orders
      WHERE id::text = p_order_id;
    END;
    $$;

    CREATE OR REPLACE FUNCTION update_order_fulfillment(
      p_order_id TEXT,
      p_qikink_order_id TEXT,
      p_tracking_number TEXT,
      p_tracking_url TEXT,
      p_status TEXT
    )
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      UPDATE public.orders
      SET 
        cj_order_id = p_qikink_order_id,
        tracking_number = p_tracking_number,
        tracking_url = p_tracking_url,
        status = p_status
      WHERE id::text = p_order_id;
    END;
    $$;

    GRANT EXECUTE ON FUNCTION get_order_for_fulfillment(TEXT) TO anon, authenticated, public, service_role;
    GRANT EXECUTE ON FUNCTION update_order_fulfillment(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, public, service_role;
  `;

  await client.query(sql);
  console.log('Fulfillment RPC functions created successfully!');
  await client.end();
}

main().catch(console.error);
