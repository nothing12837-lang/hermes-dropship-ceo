-- ══════════════════════════════════════════════════════════════
-- RareEmber — migration 0002: backfill orders UI-extension columns
-- Run once in Supabase Dashboard > SQL Editor. Safe to re-run
-- (every statement is IF NOT EXISTS / guarded).
--
-- Why: live databases created from the blueprint-only orders table
-- are missing the extension columns the storefront expects
-- (payment refs, receipt detail, fulfillment state). Without them:
--   /api/orders (track page) errors, checkout inserts fail,
--   Razorpay/CJ webhooks can't match orders, fulfillment stalls.
-- ══════════════════════════════════════════════════════════════

alter table orders add column if not exists stripe_session_id text unique;
alter table orders add column if not exists tracking_url text;
alter table orders add column if not exists items jsonb not null default '[]';
alter table orders add column if not exists subtotal numeric not null default 0;
alter table orders add column if not exists shipping numeric not null default 0;
alter table orders add column if not exists shipping_name text;
alter table orders add column if not exists fulfillment_attempts integer not null default 0;
alter table orders add column if not exists fulfillment_error text;
alter table orders add column if not exists fulfilled_at timestamptz;

-- shipping_address already exists on live DBs; keep the guard for fresh ones.
alter table orders add column if not exists shipping_address jsonb;
