-- RareEmber fulfillment bookkeeping (safe to re-run).
-- Run in Supabase Dashboard > SQL Editor after supabase/schema.sql.
alter table orders
  add column if not exists fulfillment_attempts integer not null default 0,
  add column if not exists fulfillment_error text,
  add column if not exists fulfilled_at timestamptz;

create index if not exists orders_fulfillment_idx
  on orders (status, cj_order_id)
  where cj_order_id is null;
