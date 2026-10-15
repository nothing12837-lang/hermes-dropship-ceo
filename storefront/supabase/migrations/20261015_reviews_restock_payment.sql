-- RareEmber — migration 20261015: reviews + restock_alerts + payment_method
-- Run once in Supabase Dashboard > SQL Editor. Safe to re-run
-- (every statement is IF NOT EXISTS / guarded).
--
-- Why: /api/reviews inserts into `reviews`, /api/restock inserts into
-- `restock_alerts`, and /api/orders selects `payment_method`.
-- None of these exist in schema.sql, so live DBs hit
-- "relation does not exist" / "column does not exist" at runtime.

-- 1. payment_method on orders (cod | online), default cod-safe
alter table orders add column if not exists payment_method text not null default 'cod';

-- 2. reviews table (matches src/app/api/reviews/route.ts insert shape)
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  image_url text,
  verified_buyer boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_idx on reviews (product_id, created_at desc);

alter table reviews enable row level security;

-- public read, no public write except via service-role API (server validates)
drop policy if exists "public read reviews" on reviews;
create policy "public read reviews"
  on reviews for select using (true);

-- 3. restock_alerts table (matches src/app/api/restock/route.ts insert shape)
create table if not exists restock_alerts (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  contact text not null,
  created_at timestamptz not null default now()
);

create index if not exists restock_product_idx on restock_alerts (product_id, created_at desc);

alter table restock_alerts enable row level security;

-- no public read; inserts happen server-side with service key
-- (kept RLS enabled with zero public policies = anon blocked, service_role bypasses)
