-- Security hardening round 3 — closes the P3 items that are exploitable by
-- strangers, ahead of making the repo public.
--
-- Safe to run before or after the accompanying code deploy: the app reads
-- public candle counts, writes contributors, and uploads photos exclusively
-- through the service client, which bypasses RLS. Only the anonymous-candle
-- dedup table (section 5) needs the new code to be useful, and the old code
-- ignores it harmlessly.

-- ── 1. candles: stop exposing user_id to the world ────────────────────────
-- The old SELECT policy was `using (true)`, letting anyone enumerate which
-- users lit which memorials. Public counts are served by /api/candles via the
-- service client; the only row-level readers are users checking their own
-- candle and owners counting candles on their memorials (dashboard).
drop policy "Anyone can view candle counts" on public.candles;

create policy "Users see own candles, owners see their memorials' candles"
  on public.candles for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.memorials m
      where m.id = memorial_id and m.user_id = auth.uid()
    )
  );

-- ── 2. contributors: server-only writes ───────────────────────────────────
-- The INSERT policy was `with check (true)`, letting anon attach arbitrary
-- contributor rows to any memorial. The only writer is /api/memories, which
-- uses the service client.
drop policy "Anyone can become a contributor" on public.contributors;

-- ── 3. memories: approved rows readable only while the memorial is published
-- The old policy kept approved memories world-readable after unpublishing,
-- contradicting the private-creation-period promise. Owners keep full access
-- via the separate owners policy.
drop policy "Anyone can view approved memories" on public.memories;

create policy "Anyone can view approved memories on published memorials"
  on public.memories for select
  using (
    is_approved = true
    and exists (
      select 1 from public.memorials m
      where m.id = memorial_id and m.is_published
    )
  );

-- ── 4. storage: scope writes to the uploader's own folder ─────────────────
-- memorial-photos: the old INSERT policy let any signed-in user write into
-- the bucket (and thus any memorial's folder). All photo uploads go through
-- the service client (/api/upload, /api/memories/upload), so no client-side
-- policy is needed at all. The DELETE policy was dead code (paths start with
-- uploads/ or memories/, never a bare user id).
drop policy "Authenticated users can upload photos" on storage.objects;
drop policy "Users can delete own uploads" on storage.objects;

-- memorial-videos: /api/upload-video uploads with the user's own client to
-- uploads/<user id>/<file>, so scope the INSERT policy to that folder.
-- The old DELETE policy was dead code for the same path-index reason.
drop policy "Authenticated users can upload videos" on storage.objects;
drop policy "Users can delete own video uploads" on storage.objects;

create policy "Users can upload videos to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'memorial-videos'
    and (storage.foldername(name))[1] = 'uploads'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- ── 5. durable anonymous-candle dedup ─────────────────────────────────────
-- The in-memory rate limiter is per-Vercel-instance, so one IP could light an
-- anonymous candle once per minute per instance, forever. This table makes
-- the one-candle-per-IP-per-memorial rule durable. IPs are stored as SHA-256
-- hashes, not raw addresses. RLS is enabled with no policies: service-role
-- access only.
create table public.anonymous_candle_lights (
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  ip_hash text not null,
  created_at timestamptz default now() not null,
  primary key (memorial_id, ip_hash)
);

alter table public.anonymous_candle_lights enable row level security;
