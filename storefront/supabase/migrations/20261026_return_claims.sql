-- Migration: 20261026_return_claims.sql
-- Description: Create dedicated return_claims table for 7-day returns, replacements, and reverse logistics.

CREATE TABLE IF NOT EXISTS public.return_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  contact TEXT NOT NULL,
  reason TEXT NOT NULL,
  preference TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  order_total_inr NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'cod',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy order lookups & deduping
CREATE INDEX IF NOT EXISTS idx_return_claims_order_id ON public.return_claims(order_id);
CREATE INDEX IF NOT EXISTS idx_return_claims_status ON public.return_claims(status);

-- Enable RLS
ALTER TABLE public.return_claims ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Allow service role full access to return_claims" ON public.return_claims FOR ALL USING (true);
