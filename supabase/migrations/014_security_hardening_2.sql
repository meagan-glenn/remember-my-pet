-- Security hardening: contributor email exposure, invisible hero videos,
-- order-state tampering, and schema drift (hero_photo_crop_y).

-- ── 1. Stop exposing contributor_email through the anon key ─────────────────
-- The "Anyone can view approved memories" RLS policy is row-level, so
-- `GET /rest/v1/memories?select=contributor_email` could harvest every
-- contributor email. Note: a column-level revoke alone is a no-op while the
-- role holds a table-level SELECT grant, so revoke the table grant and
-- re-grant only the safe columns.
revoke select on public.memories from anon;
grant select (
  id,
  memorial_id,
  contributor_name,
  content,
  photo_urls,
  is_approved,
  moderation_status,
  created_at,
  approved_at
) on public.memories to anon;

-- ── 2. Let visitors see completed hero video compilations ───────────────────
-- video_compilations had only an owner-scoped policy, but the public memorial
-- page queries it with the visitor's (anon) client — so hero videos were
-- silently invisible to everyone except the owner.
create policy "Anyone can view compilations for published memorials"
  on video_compilations for select
  using (memorial_id in (select id from public.memorials where is_published));

-- Missing FK indexes from migration 002: cascade deletes and the per-page
-- compilation lookup were sequential scans.
create index if not exists videos_memorial_id_idx on public.videos (memorial_id);
create index if not exists videos_user_id_idx on public.videos (user_id);
create index if not exists video_clips_video_id_idx on public.video_clips (video_id);
create index if not exists video_clips_memorial_id_idx on public.video_clips (memorial_id);
create index if not exists video_compilations_memorial_id_idx on public.video_compilations (memorial_id);

-- ── 3. Stop order-state tampering on product_orders ─────────────────────────
-- The UPDATE policy only checked ownership, so a user could set status,
-- price_cents, or gelato_order_id directly through PostgREST — including
-- resetting status to 'preview' to re-trigger a Gelato order. Users may now
-- only write shipping fields; the order route writes status/gelato_order_id
-- via the service client.
revoke update on public.product_orders from authenticated;
grant update (shipping_name, shipping_address) on public.product_orders to authenticated;

-- 'submitting' is the claim state the order route uses as a concurrency lock
-- (preview -> submitting -> ordered, reverting to preview on Gelato failure).
alter table public.product_orders drop constraint product_orders_status_check;
alter table public.product_orders add constraint product_orders_status_check
  check (status in ('draft', 'preview', 'submitting', 'ordered', 'production', 'shipped', 'delivered', 'cancelled'));

-- ── 4. Schema drift: hero_photo_crop_y was added by hand in the dashboard ───
-- /api/memorial writes this column on every save; any environment rebuilt
-- from migrations alone would 500 without it.
alter table public.memorials
  add column if not exists hero_photo_crop_y integer default 50;
