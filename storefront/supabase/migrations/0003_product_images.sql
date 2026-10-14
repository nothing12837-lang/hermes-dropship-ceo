-- ══════════════════════════════════════════════════════════════
-- RareEmber — migration 0003: backfill missing product images
-- Run once in Supabase Dashboard > SQL Editor. Safe to re-run
-- (every statement only touches rows where image_url is empty).
--
-- Why: the 8 original seed products never got image_url values, so
-- the homepage hero products render as emoji tiles. The storefront
-- also carries the same URLs as a code-level fallback (see
-- src/lib/data/fallback-images.ts), so the site looks right before
-- AND after this runs.
-- ══════════════════════════════════════════════════════════════

update products set image_url = 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800'
  where id = 'calmcloud-ortho-bed' and (image_url is null or image_url = '');
update products set image_url = 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=800'
  where id = 'cozy-nest-carrier' and (image_url is null or image_url = '');
update products set image_url = 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800'
  where id = 'warm-paw-heater-pad' and (image_url is null or image_url = '');
update products set image_url = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800'
  where id = 'smart-fetch-pod' and (image_url is null or image_url = '');
update products set image_url = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'
  where id = 'pawtrack-smart-feeder' and (image_url is null or image_url = '');
update products set image_url = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800'
  where id = 'aesthetic-scratch-post' and (image_url is null or image_url = '');
update products set image_url = 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=800'
  where id = 'lickmat-calm-set' and (image_url is null or image_url = '');
update products set image_url = 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&q=80&w=800'
  where id = 'ember-glow-collar' and (image_url is null or image_url = '');
