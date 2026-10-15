-- ══════════════════════════════════════════════════════════════
-- RareEmber — Supabase schema (EXACT blueprint: PROJECT_CONTEXT.md §5)
-- Run in Supabase Dashboard > SQL Editor. Safe to re-run.
-- Core columns match the blueprint 1:1; clearly-marked UI extensions
-- power the storefront (quiz, reviews, washes) without touching the
-- backend contract.
-- ══════════════════════════════════════════════════════════════

-- ── products (blueprint: id, title, description, price,
--      compare_at_price, image_url, cj_sku, category) ──
create table if not exists products (
  id text primary key,
  title text not null,
  description text not null default '',
  price numeric not null check (price >= 0),
  compare_at_price numeric,
  image_url text not null default '',
  cj_sku text,
  category text not null default 'general',
  is_trending boolean not null default false,
  is_new boolean not null default false,
  -- UI extensions (storefront only — backend ignores these):
  slug text,
  emoji text not null default '🐾',
  tag text not null default '',
  tag_color text not null default '#ff6b35',
  tag_bg text not null default 'rgba(255,107,53,0.12)',
  short text not null default '',
  story text not null default '',
  details jsonb not null default '[]',
  rating numeric not null default 0 check (rating >= 0 and rating <= 5),
  reviews integer not null default 0,
  gradient text not null default '',
  chapter text not null default '',
  pet text not null default 'both',
  ages text[] not null default '{all}',
  benefits text[] not null default '{}',
  safety text not null default '',
  vet_note text not null default '',
  subscribe_eligible boolean not null default false,
  wash text not null default '#fff3e0',
  badges text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on products (category);
create index if not exists products_pet_idx on products (pet);
create index if not exists products_cj_sku_idx on products (cj_sku);
create index if not exists products_trending_idx on products (is_trending) where is_trending = true;
create index if not exists products_new_idx on products (is_new) where is_new = true;

-- ── general-store migration for LIVE databases (safe to re-run) ──
-- Drops the legacy pet check so any pet value is accepted.
alter table products drop constraint if exists products_pet_check;
alter table products alter column category set default 'general';
alter table products add column if not exists is_trending boolean not null default false;
alter table products add column if not exists is_new boolean not null default false;

-- ── orders (blueprint: id, user_email, stripe_session_id,
--      total_amount, status, cj_order_id, tracking_number) ──
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  stripe_session_id text unique,
  total_amount numeric not null default 0,
  status text not null default 'pending'
    check (status in ('pending','pending_cod','paid','processing','fulfilled','shipped','delivered','cancelled','refunded')),
  cj_order_id text,
  tracking_number text,
  user_id uuid references auth.users(id),
  -- UI extensions (receipt detail for /track + receipts):
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  shipping numeric not null default 0,
  shipping_name text,
  shipping_address jsonb,
  payment_method text not null default 'online',
  tracking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_email_idx on orders (user_email);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_idx on orders (created_at desc);

-- ── reviews (customer feedback & verified purchase badges) ──
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

create index if not exists reviews_product_idx on reviews (product_id);
create index if not exists reviews_created_idx on reviews (created_at desc);

-- ── restock_alerts (out-of-stock back-in-stock notification queue) ──
create table if not exists restock_alerts (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  contact text not null,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists restock_alerts_prod_idx on restock_alerts (product_id);

-- keep updated_at fresh
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_touch on products;
create trigger products_touch before update on products
for each row execute function touch_updated_at();

drop trigger if exists orders_touch on orders;
create trigger orders_touch before update on orders
for each row execute function touch_updated_at();

-- ── RLS ──
alter table products enable row level security;
alter table orders enable row level security;

-- products: public read (active only), no public write
drop policy if exists "public read active products" on products;
create policy "public read active products"
  on products for select using (active = true);

-- orders: guest-friendly pending inserts (checkout works without login);
-- reads happen server-side with the service key.
drop policy if exists "guest insert pending orders" on orders;
create policy "guest insert pending orders"
  on orders for insert with check (status = 'pending');

-- ── seed (upsert — keeps DB in sync with src/lib/data/products.ts) ──
insert into products
  (id, title, description, price, compare_at_price, image_url, cj_sku, category,
   slug, emoji, tag, tag_color, tag_bg, short, story, details, rating, reviews,
   gradient, chapter, pet, ages, benefits, safety, vet_note, subscribe_eligible, wash, badges, active)
values
  ('meesho-water-sensor-led-diyas-pack-of-12','Water Sensor LED Diyas (Pack of 12)','Flameless, smokeless, water-activated floating LED diyas for safe and radiant festive illumination.',349,699,'https://images.meesho.com/images/products/431985757/t7ur4_512.jpg','MEESHO-DIYA-12PK','home-garden',
   'meesho-water-sensor-led-diyas-pack-of-12','🪔','Festive Hit','#FF4D24','rgba(255,77,36,0.12)','Flameless water-sensor LED diyas. Pours light the instant water touches the base.','Celebrate safely without smoke, hot oil, or fire hazards. Simply pour water to activate the warm golden LED glow. Reusable and long-lasting battery life.','["Water activated sensor","Flameless & smokeless","Reusable coin cell battery included","Pack of 12 diyas"]',4.9,3420,
   'linear-gradient(135deg, #fff3e0, #ffe0b2)','01','both','{all}','{Zero fire risk,Water activated,100% reusable}','Child and pet safe. Non-toxic plastic.','“Perfect flame-free festive decor for modern Indian apartments.”',false,'#ffe0b2','{Water Sensor,Eco Safe,Festival Pick}',true),
  ('meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base','3D Crystal Ball Galaxy Night Lamp with Wooden Base','Laser-engraved K9 optic crystal ball featuring a celestial galaxy, resting on a solid warm LED beech wood base.',399,999,'https://images.meesho.com/images/products/1038078401/hha6k_512.jpg','MEESHO-CRYSTAL-GALAXY','electronics',
   'meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base','🌌','Bestseller','#0284c7','rgba(2,132,199,0.12)','Laser-etched K9 crystal sphere with solid wooden warm night lamp base.','A miniature solar system glowing peacefully on your desk. Crafted from optical-grade K9 crystal with precision sub-surface laser engraving. USB plug-and-play.','["Optical K9 crystal sphere","Solid natural wood base","Warm ambient USB LED","Anti-scratch velvet pad"]',4.8,2840,
   'linear-gradient(135deg, #f0f9ff, #e0f2fe)','02','both','{all}','{Calming desk ambient,K9 crystal grade,USB powered}','Low voltage 5V USB. Safe for bedside use.','“Subtle celestial glow that transforms desk aesthetics.”',false,'#e0f2fe','{K9 Crystal,Solid Wood,USB Powered}',true),
  ('meesho-crystal-diamond-touch-led-table-lamp','Crystal Diamond Touch LED Table Lamp (16 Colors RGB)','Touch-controlled acrylic diamond refraction table lamp with 16 RGB color modes and wireless remote.',499,1199,'https://images.meesho.com/images/products/1023667594/w5bxr_512.jpg','MEESHO-DIAMOND-LAMP','electronics',
   'meesho-crystal-diamond-touch-led-table-lamp','💎','Trending','#7c3aed','rgba(124,58,237,0.12)','Touch top crystal lamp projecting geometric diamond prism shadows in 16 colors.','Tap the top to cycle through vivid RGB hues or relaxing warm amber. Projects a stunning 3D shadow rose light pattern across any tabletop. Built-in rechargeable battery.','["16 RGB Colors + Remote","Touch sensor control","USB rechargeable battery (8h)","Prism diamond reflection"]',4.7,2150,
   'linear-gradient(135deg, #f5f3ff, #ede9fe)','03','both','{all}','{16 vibrant hues,Cordless rechargeable,Touch reactive}','Shatter-resistant optical acrylic. CE certified.','“Transforms bedrooms and dinners with luxury hotel ambient lighting.”',false,'#ede9fe','{16 Colors,Touch Sensor,Rechargeable}',true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description, price = excluded.price,
  compare_at_price = excluded.compare_at_price, image_url = excluded.image_url,
  cj_sku = excluded.cj_sku, category = excluded.category,
  slug = excluded.slug, emoji = excluded.emoji, tag = excluded.tag,
  tag_color = excluded.tag_color, tag_bg = excluded.tag_bg, short = excluded.short,
  story = excluded.story, details = excluded.details, rating = excluded.rating,
  reviews = excluded.reviews, gradient = excluded.gradient, chapter = excluded.chapter,
  active = true;

-- seed homepage flags (trending / new arrivals)
update products set is_trending = true
  where id in ('meesho-water-sensor-led-diyas-pack-of-12','meesho-crystal-ball-3d-galaxy-led-lamp-wooden-base');
update products set is_new = true
  where id in ('meesho-crystal-diamond-touch-led-table-lamp');
