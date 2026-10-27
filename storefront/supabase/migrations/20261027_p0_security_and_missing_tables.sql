-- Migration: 20261027_p0_security_and_missing_tables.sql
-- Description: Consolidate missing production tables, columns, atomic RPC, and service-role RLS hardening.

-- 1. Create return_claims table
CREATE TABLE IF NOT EXISTS public.return_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  contact TEXT NOT NULL,
  reason TEXT NOT NULL,
  preference TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  order_total_inr NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'cod',
  voucher_code TEXT,
  credit_amount NUMERIC DEFAULT 0,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_return_claims_order_id ON public.return_claims(order_id);
CREATE INDEX IF NOT EXISTS idx_return_claims_voucher_code ON public.return_claims(voucher_code);
CREATE INDEX IF NOT EXISTS idx_return_claims_is_redeemed ON public.return_claims(is_redeemed);

-- 2. Create returns table
CREATE TABLE IF NOT EXISTS public.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  contact TEXT,
  reason TEXT,
  preference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending_pickup',
  voucher_code TEXT,
  credit_amount NUMERIC DEFAULT 0,
  order_total_inr NUMERIC DEFAULT 0,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_order_id TEXT,
  payment_method TEXT DEFAULT 'cod',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_returns_voucher_code ON public.returns(voucher_code);
CREATE INDEX IF NOT EXISTS idx_returns_is_redeemed ON public.returns(is_redeemed);

-- 3. Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  order_id TEXT,
  category TEXT DEFAULT 'general',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at);

-- 4. Create custom_leads table
CREATE TABLE IF NOT EXISTS public.custom_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id TEXT UNIQUE NOT NULL,
  org_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  product_type TEXT,
  event_date TEXT,
  estimated_budget TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_custom_leads_lead_id ON public.custom_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_custom_leads_status ON public.custom_leads(status);

-- 5. Add price_inr and supplier to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_inr NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supplier TEXT DEFAULT 'qikink';
UPDATE public.products SET price_inr = price WHERE price_inr IS NULL;

-- 6. Atomic Store Credit Redemption Function
CREATE OR REPLACE FUNCTION public.redeem_store_credit_atomic(p_voucher_code text, p_order_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated integer := 0;
  v_norm_code text := UPPER(TRIM(p_voucher_code));
BEGIN
  -- 1. Try updating return_claims
  UPDATE public.return_claims
  SET is_redeemed = TRUE,
      redeemed_order_id = p_order_id,
      updated_at = NOW()
  WHERE UPPER(TRIM(voucher_code)) = v_norm_code
    AND (is_redeemed IS FALSE OR is_redeemed IS NULL);
  GET DIAGNOSTICS v_updated = ROW_COUNT;

  -- 2. If not matched, try returns table
  IF v_updated = 0 THEN
    UPDATE public.returns
    SET is_redeemed = TRUE,
        redeemed_order_id = p_order_id,
        updated_at = NOW()
    WHERE UPPER(TRIM(voucher_code)) = v_norm_code
      AND (is_redeemed IS FALSE OR is_redeemed IS NULL);
    GET DIAGNOSTICS v_updated = ROW_COUNT;
  END IF;

  RETURN (v_updated > 0);
END;
$$;

-- 7. Enable and Force RLS with Service-Role only access
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns FORCE ROW LEVEL SECURITY;
ALTER TABLE public.return_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_claims FORCE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.custom_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_leads FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.orders FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.returns FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.return_claims FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.support_tickets FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.custom_leads FROM anon, authenticated, PUBLIC;

GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.returns TO service_role;
GRANT ALL ON public.return_claims TO service_role;
GRANT ALL ON public.support_tickets TO service_role;
GRANT ALL ON public.custom_leads TO service_role;

DROP POLICY IF EXISTS "allow_delete_orders" ON public.orders;
DROP POLICY IF EXISTS "allow_read_orders" ON public.orders;
DROP POLICY IF EXISTS "allow_update_orders" ON public.orders;
DROP POLICY IF EXISTS "allow_public_order_insert" ON public.orders;
DROP POLICY IF EXISTS "authenticated_view_own_orders" ON public.orders;
DROP POLICY IF EXISTS "allow_all_orders_sr" ON public.orders;
DROP POLICY IF EXISTS "service_role_orders_all" ON public.orders;
CREATE POLICY "service_role_orders_all" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access to returns" ON public.returns;
DROP POLICY IF EXISTS "service_role_returns_all" ON public.returns;
CREATE POLICY "service_role_returns_all" ON public.returns FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access to return_claims" ON public.return_claims;
DROP POLICY IF EXISTS "service_role_return_claims_all" ON public.return_claims;
CREATE POLICY "service_role_return_claims_all" ON public.return_claims FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_support_tickets_all" ON public.support_tickets;
CREATE POLICY "service_role_support_tickets_all" ON public.support_tickets FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_custom_leads_all" ON public.custom_leads;
CREATE POLICY "service_role_custom_leads_all" ON public.custom_leads FOR ALL TO service_role USING (true) WITH CHECK (true);
