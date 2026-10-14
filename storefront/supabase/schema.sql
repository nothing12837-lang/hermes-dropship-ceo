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
    check (status in ('pending','paid','processing','fulfilled','shipped','delivered','cancelled','refunded')),
  cj_order_id text,
  tracking_number text,
  user_id uuid references auth.users(id),
  -- UI extensions (receipt detail for /track + receipts):
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  shipping numeric not null default 0,
  shipping_name text,
  shipping_address jsonb,
  tracking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_email_idx on orders (user_email);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_idx on orders (created_at desc);

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
   gradient, chapter, pet, ages, benefits, safety, vet_note, subscribe_eligible, wash, badges)
values
  ('calmcloud-ortho-bed','CalmCloud Ortho Bed','Chapter 01 — Rest. Raised rim, sinking center, breathable cloud-foam that holds warmth without overheating.',55,99,'','CJ-PET-BED-001','beds',
   'calmcloud-ortho-bed','🦮','Bestseller','#ff6b35','rgba(255,107,53,0.12)','Ultra-soft memory foam donut bed. Proven to reduce pet anxiety.','Chapter 01 — Rest. Dogs circle before they sleep because wild instincts crave safety. CalmCloud recreates that den: raised rim, sinking center, breathable cloud-foam that holds warmth without overheating.','["Orthopedic memory foam","Machine-washable cover","Non-slip base","Sizes S / M / L"]',4.9,2314,
   'linear-gradient(135deg, #fff5eb, #ffe8d6)','01','dog','{puppy,adult,senior}','{Calmer sleep in 3 nights,Joint relief for seniors,Matches modern decor}','CertiPUR-US foam. No AZO dyes. Supervise heavy chewers.','“Raised rims reduce nighttime restlessness in anxious dogs.” — Dr. Sarah Kim, BVetMed',false,'#ffe8d6','{Vet Approved,Washable,Eco Fill}'),
  ('smart-fetch-pod','Smart Fetch Pod','Chapter 02 — Play. Throws 10–30ft on a randomized timer, USB-C rechargeable.',89.99,null,'','CJ-PET-TOY-002','toys',
   'smart-fetch-pod','🎾','New Arrival','#059669','rgba(5,150,105,0.12)','Interactive automated ball launcher for endless park fun.','Chapter 02 — Play. A bored dog is a destructive dog. Fetch Pod throws 10–30ft on a randomized timer, recharges over USB-C, and survives slobber, dirt and full-speed pounces.','["3 distance modes","USB-C rechargeable","Indoor / outdoor","Includes 3 balls"]',4.8,864,
   'linear-gradient(135deg, #f0fdf4, #dcfce7)','02','dog','{puppy,adult}','{40 min solo play,Burns energy,Safe randomized throws}','BPA-free balls. Auto-sleep after 15 min.','“Great enrichment for high-energy breeds.” — Dr. Sarah Kim, BVetMed',false,'#dcfce7','{Enrichment,USB-C,Outdoor Safe}'),
  ('aesthetic-scratch-post','Aesthetic Scratch Post','Chapter 03 — Ritual. Solid ash wood + sisal that lasts.',45,null,'','CJ-PET-DECOR-003','decor',
   'aesthetic-scratch-post','🧶','Pet Fav','#d97706','rgba(217,119,6,0.12)','Minimalist wooden cat scratcher that looks like modern art.','Chapter 03 — Ritual. Cats scratch to mark, stretch and shed. This one is solid ash wood + sisal that actually lasts, designed to sit next to your Eames chair — not hidden in a closet.','["Solid ash wood","Replaceable sisal","No wobble base","Assembles in 2 min"]',4.9,1592,
   'linear-gradient(135deg, #fffbeb, #fef3c7)','03','cat','{all}','{Saves your sofa,Natural sisal,Designer look}','FSC ash wood. Non-toxic glue. 6kg tip-tested base.','“Vertical scratching keeps claws healthy.” — Dr. Maya Rao, DVM',false,'#fef3c7','{Cat Approved,FSC Wood,No Wobble}'),
  ('ember-glow-collar','Ember Glow Collar','Chapter 04 — Night walks. One charge lasts 12 nights.',29.99,49.99,'','CJ-PET-TECH-004','tech',
   'ember-glow-collar','✨','Night Safe','#7c3aed','rgba(124,58,237,0.12)','USB rechargeable LED collar. Seen from 500m at night.','Chapter 04 — Night walks. One charge lasts 12 nights. Three glow modes, rain-proof, feather-light so even cats forget they wear it.','["USB-C fast charge","3 light modes","IPX7 waterproof","XS–XL sizes"]',4.7,3210,
   'linear-gradient(135deg, #f5f3ff, #ddd6fe)','04','both','{all}','{Seen from 500m,12-night battery,Rain-proof walks}','IPX7 waterproof. Breakaway cat clip.','“Night visibility cuts road risk.” — Dr. Sarah Kim, BVetMed',false,'#e9e4ff','{500m Visible,Waterproof,Breakaway}'),
  ('cozy-nest-carrier','Cozy Nest Carrier','Chapter 05 — Roam. Mesh airflow, sherpa bed, seat-belt loop.',69,119,'','CJ-PET-BED-005','beds',
   'cozy-nest-carrier','🎒','Travel Pick','#0284c7','rgba(2,132,199,0.12)','Airline-approved soft carrier that feels like a den.','Chapter 05 — Roam. Mesh on three sides for airflow, sherpa bed inside, seat-belt loop for cars. Fits under every major airline seat.','["Airline approved","Washable sherpa pad","Seat-belt loop","Up to 8kg pets"]',4.8,975,
   'linear-gradient(135deg, #f0f9ff, #e0f2fe)','05','both','{all}','{Fits under airline seats,Calmer travel,Car-safe loop}','Meets IATA size guidance. Max 8kg.','“Den-like carriers lower travel cortisol.” — Dr. Maya Rao, DVM',false,'#d7ecff','{Airline OK,Washable,Car Safe}'),
  ('lickmat-calm-set','LickMat Calm Set','Chapter 06 — Calm. Licking releases endorphins.',24.99,null,'','CJ-PET-TOY-006','toys',
   'lickmat-calm-set','🍯','Anxiety Relief','#059669','rgba(5,150,105,0.12)','Slow-feeder lick mats that turn anxiety into licking zen.','Chapter 06 — Calm. Licking releases endorphins. Spread peanut butter, freeze 20 min, survive fireworks, storms and vet visits.','["3 textures included","Suction base","Dishwasher safe","BPA-free silicone"]',4.9,4418,
   'linear-gradient(135deg, #fefce8, #fef08a)','06','both','{all}','{Calms storms,Slows fast eaters,Freezer friendly}','Food-grade silicone, BPA-free. Supervise power chewers.','“Licking releases calming endorphins.” — Dr. Maya Rao, DVM',true,'#fef08a','{Anxiety Relief,Slow Feed,BPA-Free}'),
  ('warm-paw-heater-pad','WarmPaw Heater Pad','Chapter 07 — Warmth. Mylar core reflects body heat.',39.99,59.99,'','CJ-PET-BED-007','beds',
   'warm-paw-heater-pad','🔥','Winter','#dc2626','rgba(220,38,38,0.1)','Self-warming thermal pad. No plugs, no danger.','Chapter 07 — Warmth. Reflects body heat with a mylar core. Senior dogs with stiff joints fall asleep in minutes. No electricity needed.','["No plug needed","Chew-resistant","Water-resistant","2 sizes"]',4.7,1120,
   'linear-gradient(135deg, #fef2f2, #fecaca)','07','both','{senior,adult}','{Seniors sleep faster,No plugs,Goes anywhere}','No electricity. Never overheats. Spot-clean only.','“Gentle warmth eases senior stiffness.” — Dr. Sarah Kim, BVetMed',false,'#ffcfdb','{Senior Pick,No Plug,Travel Ready}'),
  ('pawtrack-smart-feeder','PawTrack Smart Feeder','Chapter 08 — Ritual fed by tech. Schedule meals, track portions.',129.99,null,'','CJ-PET-TECH-008','tech',
   'pawtrack-smart-feeder','🤖','Smart Home','#321004','rgba(50,16,4,0.08)','App-controlled feeder with portion AI + voice record.','Chapter 08 — Ritual fed by tech. Schedule meals, track portions, record “who’s a good boy?” in your voice. Never miss breakfast again.','["App + WiFi","Portion control","Voice message","Battery backup"]',4.8,642,
   'linear-gradient(135deg, #f8fafc, #e2e8f0)','08','both','{adult,senior}','{Never miss a meal,Portion AI,Your voice every meal}','BPA-free hopper. 48h battery. Dry food only.','“Measured portions are the #1 weight tool.” — Dr. Maya Rao, DVM',true,'#e2e8f0','{App Control,Portion AI,Voice Record}')
on conflict (id) do update set
  title = excluded.title, description = excluded.description, price = excluded.price,
  compare_at_price = excluded.compare_at_price, image_url = excluded.image_url,
  cj_sku = excluded.cj_sku, category = excluded.category,
  slug = excluded.slug, emoji = excluded.emoji, tag = excluded.tag,
  tag_color = excluded.tag_color, tag_bg = excluded.tag_bg, short = excluded.short,
  story = excluded.story, details = excluded.details, rating = excluded.rating,
  reviews = excluded.reviews, gradient = excluded.gradient, chapter = excluded.chapter,
  pet = excluded.pet, ages = excluded.ages, benefits = excluded.benefits,
  safety = excluded.safety, vet_note = excluded.vet_note,
  subscribe_eligible = excluded.subscribe_eligible, wash = excluded.wash,
  badges = excluded.badges, active = true;

-- seed homepage flags (trending / new arrivals)
update products set is_trending = true
  where id in ('calmcloud-ortho-bed','ember-glow-collar','lickmat-calm-set');
update products set is_new = true
  where id in ('smart-fetch-pod','aesthetic-scratch-post','pawtrack-smart-feeder');
