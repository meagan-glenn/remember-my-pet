# Remediation Plan

Findings from the codebase review, written as concrete changes. Ordered by priority.
Every item was verified against the source; nothing here is speculative.

Two things commonly assumed to be broken were checked and are **fine**: the
service-role key is not in the client bundle (the apparent match was the JWT
header that anon and service keys share), and `.env.local` is gitignored and was
never committed.

---

## P0 — Fix before the next deploy

### 1. Anyone can post pre-approved memories, bypassing moderation

**Where:** `supabase/migrations/001_initial_schema.sql:101`

`create policy "Anyone can submit a memory" ... with check (true)` places no
constraint on column values. The anon key is public and PostgREST exposes the
table, so a direct `POST /rest/v1/memories` with `is_approved: true` puts content
straight onto a public wall. All three guards in `/api/memories` (published check,
`allow_memories` check, forced `is_approved: false`) are bypassed. This also means
the "owner disabled memories" toggle is enforced only in app code.

**Change:** new migration `013_tighten_memory_insert.sql`

```sql
drop policy "Anyone can submit a memory" on public.memories;

create policy "Anyone can submit a pending memory" on public.memories
  for insert with check (
    is_approved = false
    and moderation_status = 'pending'
    and exists (
      select 1 from public.memorials m
      where m.id = memorial_id
        and m.is_published
        and coalesce(m.allow_memories, true)
    )
  );
```

`coalesce` is required — `allow_memories` is nullable (migration 008 adds it with
a default but no backfill/not-null).

**Does not break the app:** `/api/memories/route.ts` uses `createServiceClient()`,
which bypasses RLS entirely. This policy only constrains direct PostgREST callers.

---

### 2. Editing a memorial deletes all of its photos

**Where:** `src/app/create/preview/page.tsx:73-104` and `src/app/api/memorial/route.ts:127-138`

The API does delete-all-then-insert on `photos`. The client only includes photos
that have a local `File`, but photos loaded for editing are server URLs with no
local file (`use-memorial-state.ts:513`). Editing one word of the tribute sends
`photos: []` and wipes every photo, hero included.

**Change A — client (the actual fix).** In `handleSave`, include
already-persisted photos:

- Hero: if `heroPhotoFileRef.current` is null but `petDetails.heroPhoto` is a
  stored URL, push `{ url: petDetails.heroPhoto }` first so it keeps `sort_order: 0`.
- Gallery: for items with no entry in `photoFilesRef`, fall back to the existing
  `p.url` instead of dropping them — only skip when there is neither a file nor a URL.

**Change B — server (defense in depth).** Two guards in `/api/memorial`:

- Check the insert result. Currently `await supabase.from("photos").insert(...)`
  discards its error, so a failed re-insert still returns 200 with photos already
  deleted. Return `MEMORIAL_SAVE_FAILED` on error.
- Distinguish "no photos key sent" from "an explicitly empty list." Only run the
  delete/replace when `body.photos !== undefined`, so a partial update can never
  clear the gallery.

---

## P1 — Security and data exposure

### 3. Stored XSS via photo caption in JSON-LD

**Where:** `src/app/[slug]/page.tsx:231-232, 244-245, 287-290`

`pet_name`, species, and tribute are stripped of `<>"`, but `heroAlt` (built from
`heroPhoto.caption`) and `heroPhoto.url` are not, and `JSON.stringify` does not
escape `</script>`. A caption containing a closing script tag breaks out of the
`<script type="application/ld+json">` block and runs for every visitor. Captions
are settable through an authenticated POST to `/api/memorial`, so an attacker
publishes their own memorial and attacks whoever views it.

**Change:** escape at serialization time so every field is covered, including any
added later:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
  }}
/>
```

`<` is valid JSON and parses back to `<`, so structured data still validates.
Keep the existing per-field stripping as a second layer.

---

### 4. Contributor emails exposed to the public

**Where:** `src/app/[slug]/page.tsx:96-101, 382-390`, and `001_initial_schema.sql:97`

Two independent leaks:

- The server component selects `memories` with `select("*")` and passes full rows
  to a client component, serializing `contributor_email` into the RSC payload of
  every public memorial page. Visible in view-source; never rendered.
- The `is_approved = true` SELECT policy covers all columns, so
  `GET /rest/v1/memories?select=contributor_email` harvests every email with the
  public anon key.

**Change A:** replace `select("*")` with the columns the wall actually renders —
`id, contributor_name, content, photo_urls, created_at`. Drop `contributor_email`
from the `MemoryRow` interface at line 31 so the type system enforces it.

**Change B:** RLS is row-level, but PostgREST honours column privileges:

```sql
revoke select (contributor_email) on public.memories from anon;
```

Server-side reads that legitimately need the address (owner notifications) go
through the service client and are unaffected.

---

### 5. SSRF: URL validation uses `startsWith`

**Where:** `src/app/api/compile-video/route.ts:210`, `src/app/api/memorial/route.ts:62`, `src/app/api/memories/route.ts:54`

`NEXT_PUBLIC_SUPABASE_URL` has no trailing slash, so
`https://<proj>.supabase.co.attacker.tld/x.mp4` passes, as does the userinfo form
`https://<proj>.supabase.co@169.254.169.254/...`. In compile-video the URL is then
fetched server-side. In the other two the URL is stored and later forwarded to
Gelato for printing.

**Change:** add `src/lib/url-validation.ts` and use it at all three sites.

```ts
export function isSupabaseStorageUrl(value: unknown): value is string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || typeof value !== "string") return false;
  try {
    return new URL(value).origin === new URL(base).origin;
  } catch {
    return false;
  }
}
```

Origin comparison covers protocol, host, and port, and `new URL()` rejects the
userinfo trick because `origin` excludes credentials.

While in `compile-video`, whitelist the derived file extension
(`/^[a-z0-9]{1,4}$/i`, else default `mp4`). The current
`split(".").pop()` is **not** a path traversal — a `..` segment always contains
dots, so the fragment can never start with `..` and the join stays inside the temp
dir — but it produces malformed filenames that make `writeFile` fail.

---

### 6. Hero videos are invisible to every visitor

**Where:** `supabase/migrations/002_video_tables.sql:54-57`

`video_compilations` has RLS on with only an owner-scoped policy, but
`src/app/[slug]/page.tsx:88` queries it with the visitor's cookie-based client.
Visitors get zero rows, `compilation_url` is null, and the page silently falls
back to a still image. The owner *can* see it, so this never surfaces as a bug
report — the feature is broken precisely for the audience it was built for.

**Change:**

```sql
create policy "Anyone can view compilations for published memorials"
  on video_compilations for select
  using (memorial_id in (select id from public.memorials where is_published));
```

Same gap exists on `videos` and `video_clips` if anything public ever reads them.
While here, add the missing FK indexes (`videos.memorial_id`, `videos.user_id`,
`video_clips.video_id`, `video_clips.memorial_id`, `video_compilations.memorial_id`)
— migration 002 creates none, so cascade deletes and the per-page lookup seq-scan.

---

### 7. Free physical merchandise via order-state tampering

**Where:** `supabase/migrations/003_product_orders.sql:26-32` and `src/app/api/products/order/route.ts:52, 84, 102`

The UPDATE policy checks only `auth.uid() = user_id`, so a user can set `status`,
`price_cents`, and `gelato_order_id` directly through PostgREST. The route guards
replays with `status !== "preview"`, so resetting `status` to `preview` re-triggers
an order. Independently, `orderType: "order"` is submitted to Gelato with no
payment verification at all.

**Change (three parts):**

- **Column privileges.** Users should only write shipping fields:
  ```sql
  revoke update on public.product_orders from authenticated;
  grant update (shipping_name, shipping_address) on public.product_orders to authenticated;
  ```
  **This requires a code change first:** `order/route.ts` currently writes
  `status`/`gelato_order_id` with `createServerSupabase()` (user-scoped). Move
  those writes to `createServiceClient()` or they will start failing.
- **Replace check-then-act with a conditional update** as the lock, so two
  concurrent submits can't both place an order:
  ```ts
  const { data: claimed } = await service
    .from("product_orders")
    .update({ status: "submitting" })
    .eq("id", orderId).eq("status", "preview")
    .select("*").single();
  if (!claimed) return apiError("INVALID_INPUT", 400, "Order has already been submitted.");
  ```
- **Gate on payment** before `orderType: "order"`, or submit as a draft until
  Stripe confirms. CLAUDE.md already lists this as a go-live blocker; the RLS half
  is not listed and should be.

Also guard `photos[0].url` at line 78 — it is dereferenced outside the `try` with
no emptiness check, so an order placed after all photos were removed throws an
unhandled `TypeError`.

---

### 8. Missing migration: `hero_photo_crop_y`

**Where:** written at `src/app/api/memorial/route.ts:80`; absent from all 12 migrations.

The column was added by hand in the dashboard. Any environment rebuilt from
`supabase/migrations/` 500s on every memorial save.

**Change:**

```sql
alter table public.memorials
  add column if not exists hero_photo_crop_y integer default 50;
```

Then diff the live schema against the migration set to catch other drift — this is
unlikely to be the only hand-applied change.

---

## P2 — Correctness

### 9. Stripe webhook reports success on database failure

`src/app/api/webhooks/stripe/route.ts:57-60, 89-92` log the update error and fall
through to `{ received: true }` (line 100). Stripe records delivery as successful
and never retries, so a transient error means the customer is charged and the
memorial never publishes. Return a 5xx from both branches so Stripe redelivers.

### 10. `/api/caption` is unauthenticated, uncapped, and unsanitized

`src/app/api/caption/route.ts` has no auth, no size limit on `imageBase64` (10 MB
body limit applies), and is the only AI route that skips `sanitizeForPrompt` —
`petName` is interpolated raw into the prompt at `src/lib/gemini.ts:32`. Require a
session or bind to a memorial the caller owns, cap the base64 length, validate
`mimeType` against the allowed union, and apply `sanitizeForPrompt(petName)`.
Also stop returning HTTP 200 on genuine API failures (line 28) — real errors are
currently indistinguishable from "no caption available" and never reach monitoring.

### 11. Feed pagination duplicates and strands rows

`src/app/api/feed/route.ts:30-39, 108` applies `.range()` before filtering out
photoless memorials, and computes `hasMore` from the pre-filter count while the
client sends `offset = items.length` (the post-filter count). Page 1 returning 4
of 6 rows makes the client request `offset=4`, re-fetching rows 5 and 6. Filter in
SQL — an inner join on photos (`photos!inner(url, sort_order)`) — so range and
count operate on the same set.

### 12. Structured API errors render as "[object Object]"

Routes return `{ error: { code, message, recoverable } }`, but these six sites do
`throw new Error(data.error || ...)`:

- `src/components/memory-wall/memory-form.tsx:50, 119`
- `src/components/memory-wall/moderation-queue.tsx:92`
- `src/components/wizard/step-tribute-chat.tsx:112, 185`
- `src/components/checkout/pricing-cards.tsx:66`

Use `data.error?.message` as `delete-memorial-button.tsx:36` already does. These
are `duration: Infinity` toasts, so a grieving contributor gets a permanent
"[object Object]" they must dismiss.

### 13. Slug collisions become unexplained 500s

`src/app/api/memorial/route.ts:148-163` probes for duplicate slugs with the
user-scoped client, but RLS hides other users' unpublished memorials while the
unique constraint spans all rows. Two users with the same pet name, last name, and
year: the second gets a permanent, unretryable 500. Do the lookup with the service
client, and catch Postgres `23505` on insert to retry with a suffix (which also
closes the TOCTOU window).

### 14. Reduced-motion violations

CLAUDE.md makes this a hard requirement, and `HeroMedia`/`LightCandle` implement
it correctly — these two are missed ports:

- `src/components/feed/feed-card.tsx:145-160` — lit flame animates with
  `repeat: Infinity` and no `useReducedMotion()` gate.
- `src/app/page.tsx:63-76` — typing indicator, same issue. The `animate-pulse`
  loading states in `step-tribute-chat.tsx:285`, `step-decision-support.tsx:9`,
  and `step-photo-upload.tsx:235` should get `motion-safe:` prefixes.

### 15. Large HEIC uploads fail outright

`src/lib/compress-image.ts:12` skips compression for files ≤ 4 MB, so HEIC only
reaches the browser decode path when large — and browsers can't decode HEIC, so
`img.onerror` rejects with "Image load failed." `memory-form.tsx:41` awaits it, so
an iPhone user picking a >4 MB photo in the default camera format gets a hard
failure, even though the server explicitly allows `image/heic`. Detect HEIC and
pass it through uncompressed, or decode server-side.

### 16. Re-publishing creates a duplicate memorial

`src/app/create/preview/page.tsx:143` keeps the returned `memorialId` only in
local state and never clears wizard localStorage after a successful publish.
Returning to `/create` and saving again POSTs without an id and creates a second
memorial. Write the id into wizard state on success (the `reset()` in
`use-memorial-state.ts:526` already exists but is never called from this flow).

---

## P3 — Worth queueing

- **Anonymous candle counts are inflatable** — `rate-limit.ts` is a 60-second
  window in a per-process Map, so one IP adds a candle per minute forever, and on
  Vercel each instance has its own map. The comment at `candles/route.ts:73`
  claiming "effectively one-time" is wrong. There is also no `is_published` check
  on the anonymous branch, and the GET leaks counts for private memorials.
- **`candles` SELECT is `using (true)`** (`005_candles.sql:14`), exposing
  `user_id` — anyone can enumerate which users lit which memorials. Expose counts
  through a view or RPC instead.
- **Storage policies**: INSERT checks only `bucket_id` + authenticated, so any
  signed-in user can write into another memorial's folder; and the DELETE policies
  test `(storage.foldername(name))[1] = auth.uid()`, but real paths start with
  `uploads/` or `memories/`, so they are dead code.
- **`contributors` INSERT is `with check (true)`** — anon can attach arbitrary
  contributor rows to any memorial.
- **Approved memories stay world-readable after unpublishing** — the SELECT policy
  never checks the parent memorial's `is_published`, which contradicts the
  "private creation period" promise.
- **Middleware cookie plumbing** (`src/middleware.ts:5, 15-20, 36-40`) doesn't
  follow the documented `@supabase/ssr` pattern: the response isn't recreated
  inside `setAll`, and the auth redirect drops refreshed cookies. Symptom is
  intermittent stale sessions.
- **Move `createServiceClient` out of `src/lib/supabase.ts`** into
  `src/lib/supabase-admin.ts` with `import "server-only"`. It is not leaked today
  (verified against the build), but 11 `"use client"` files import from that
  module, so the safety margin is one config change wide.
- **`users` upsert is dead code** — `memorial/route.ts:68` can never succeed
  (`public.users` has no INSERT policy) and its error is discarded. It works only
  because the `on_auth_user_created` trigger fills the row.
- **Memory content has no character cap** — `validateMemoryContent` limits 500
  *words*, so a single multi-megabyte token passes.
- **Welcome-email dedup is check-then-set** (`auth/callback/route.ts:67-90`) —
  make the update conditional on `welcome_email_sent = false` and send only if a
  row was affected.
- **Gelato webhook has no replay protection** — the HMAC is correct, but there is
  no timestamp or nonce, so a captured `canceled` delivery can be replayed
  indefinitely.
- **Crisis detection is client-side only** — posting directly to `/api/tribute*`
  skips the 988 interstitial entirely.

---

## Suggested sequencing

1. **Hotfix branch:** items 1–2. Both are actively harmful right now — one lets
   strangers publish to memorials, the other destroys user data on a routine edit.
2. **Security pass:** items 3–8, all small and self-contained. 4, 6, 7, and 8 ship
   as one migration.
3. **Correctness pass:** items 9–16.
4. **Backlog:** P3, folded into the existing go-live blocker list in CLAUDE.md.

Items 1, 4, 6, 7, and 8 are all database changes — worth applying to a branch
database first and re-running the anon-key probes to confirm the policies actually
close the holes, since the app itself uses the service client on those paths and
will look identical either way.
