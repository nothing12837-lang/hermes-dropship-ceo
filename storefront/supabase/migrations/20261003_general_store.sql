-- RareEmber general "everything store" migration (safe to re-run).
-- Run in Supabase Dashboard > SQL Editor after supabase/schema.sql.
alter table products alter column category set default 'general';
alter table products drop constraint if exists products_pet_check;
alter table products add column if not exists is_trending boolean not null default false;
alter table products add column if not exists is_new boolean not null default false;

create index if not exists products_trending_idx on products (is_trending) where is_trending = true;
create index if not exists products_new_idx on products (is_new) where is_new = true;
