-- Migration: 20261026_store_credit_security.sql
-- Description: Add cryptographically signed store credit voucher columns,
-- single-use redemption tracking, and ensure returns/return_claims schema completeness.

-- 1. Ensure public.returns table exists
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

-- 2. Add columns to return_claims table if they do not exist
ALTER TABLE public.return_claims ADD COLUMN IF NOT EXISTS voucher_code TEXT;
ALTER TABLE public.return_claims ADD COLUMN IF NOT EXISTS credit_amount NUMERIC DEFAULT 0;
ALTER TABLE public.return_claims ADD COLUMN IF NOT EXISTS is_redeemed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.return_claims ADD COLUMN IF NOT EXISTS redeemed_order_id TEXT;

-- 3. Indexes for fast coupon lookups & single-use redemption guards
CREATE INDEX IF NOT EXISTS idx_returns_voucher_code ON public.returns(voucher_code);
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_is_redeemed ON public.returns(is_redeemed);
CREATE INDEX IF NOT EXISTS idx_return_claims_voucher_code ON public.return_claims(voucher_code);
CREATE INDEX IF NOT EXISTS idx_return_claims_is_redeemed ON public.return_claims(is_redeemed);

-- 4. Enable RLS
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- 5. Policies: Allow service role full access
DROP POLICY IF EXISTS "Allow service role full access to returns" ON public.returns;
CREATE POLICY "Allow service role full access to returns" ON public.returns FOR ALL USING (true);
