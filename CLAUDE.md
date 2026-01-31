# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PetMemorial.ai — an AI-powered platform for creating digital pet memorials with collaborative memory walls, print-on-demand physical products, and an optional mobile grief companion app with AI journaling.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router), TailwindCSS, Shadcn/ui, Framer Motion |
| Backend | Next.js API routes |
| Database & Storage | Supabase (PostgreSQL + Storage) |
| CDN | Cloudflare R2 |
| Auth | Supabase Auth (magic links) |
| AI | Claude Haiku (tribute generation, theme detection), Claude Sonnet (decision support, journal responses), Gemini Flash (photo captions/vision) |
| Mobile | React Native (iOS + Android), Firebase Cloud Messaging, AsyncStorage |
| Payments | Stripe Checkout + Customer Portal |
| Print-on-Demand | Gelato API (primary), Printful (backup) |
| Hosting | Vercel |
| Email | Resend |
| Analytics | PostHog |

## Architecture

- **Next.js App Router** with API routes serving as the backend
- **Supabase** for PostgreSQL database, file storage, and real-time subscriptions
- **Cloudflare R2** as CDN for photo/media assets
- Memorial pages served at `rainbowbridge.pet/petname-year` slug pattern

### Two-Part Product Architecture

- **Web Memorial (Core Product)**: Memorial creation — photos, tribute, videos, memory wall. One-time purchase $49-99.
- **Mobile App (Optional Add-On)**: Daily grief companion — AI journaling, morning/evening reminders, quick memorial access. Free with memorial purchase.

### Database Schema (Key Tables)

```sql
users: id (references auth.users), email, created_at
memorials: id, user_id, pet_name, slug, birth_date, death_date, tribute, decision_support_used, template, is_paid, is_published, auto_approve_memories, created_at, updated_at
photos: id, memorial_id, url, caption, ai_detected_tags, sort_order, uploaded_by, created_at
memories: id, memorial_id, contributor_name, contributor_email, content, photo_urls, is_approved, moderation_status, created_at, approved_at
contributors: id, memorial_id, email, name, became_creator, created_at

-- Mobile app tables (v3.3)
journal_entries: id, memorial_id, user_id, entry_date, entry_text, voice_recording_url, attached_photo_urls, attached_video_urls, ai_detected_themes[], ai_response_text, sentiment_score, related_memorial_content_ids, is_private (default true), added_to_memorial (default false), created_at
journal_themes: id, memorial_id, theme_name, frequency_count, first_mentioned, last_mentioned, ai_suggested_resources
notification_settings: id, user_id, memorial_id, morning_time, evening_time, enabled, frequency, last_sent_at
journal_streaks: id, user_id, memorial_id, current_streak_days, longest_streak_days, last_entry_date
app_sessions: id, user_id, memorial_id, session_start, session_end, features_used[], journal_entries_created, created_at
```

## Critical Product Constraints

- **Mobile-first**: 80% of users create on mobile
- **Performance**: Page load under 2 seconds
- **Terminology**: Use "Tribute" not "Eulogy" (users don't know what eulogy means)
- **Decision Support Mode**: Must ask users about their specific regrets/fears FIRST, then respond to those specific concerns. Never lead with generic reassurance.
- **Private creation period**: After purchase, memorials default to private. Sharing with others is a deliberate later step.
- **Moderation**: Memory wall contributions are pre-moderated by default (pending queue with approve/edit/delete)
- **No pressure tactics**: No countdown timers, pop-ups, or urgency messaging
- **AI journaling must be pet-aware**: Prompts reference specific memorial content (tribute, photos, videos). Never generic grief prompts.
- **Journal entries private by default**: User explicitly chooses which entries to add to memorial
- **Mobile app is optional**: Web memorial is the core product. App enhances but is never required.

## Implementation Progress

### Completed (Issue #3 — PR #4)
- **Auth UI**: Magic link sign-in/sign-up pages at `/sign-in`, `/sign-up` with Supabase OTP
- **Auth callback**: `/auth/callback` route with open redirect protection
- **Memorial creation wizard**: 4-step flow (pet details → photo upload → tribute chat → preview) at `/create`
- **Tribute API**: `/api/tribute` using Claude Haiku for 250-400 word tribute generation
- **Dashboard**: `/dashboard` with memorial listing, status badges (draft/published), sign out
- **Navigation header**: Auth-aware header with logo, sign in/dashboard/create CTA
- **Providers**: Client wrapper with Sonner toast notifications
- **Middleware**: Protects `/dashboard`, redirects unauthenticated users to `/sign-in`
- **Shadcn/ui**: 13 components installed (button, input, label, card, textarea, dialog, separator, tabs, avatar, sonner, dropdown-menu, badge, progress)

### Homepage Redesign (Hybrid A+C)
- **Warm visual design**: Amber gradient backgrounds, Playfair Display serif for headings, warm OKLCH color palette
- **Conversational entry**: Name input hero → 2-step chat flow (species select, share a memory) → redirect to `/create`
- **Feature cards**: Personal Tribute, Memory Wall, Video Reel with amber icons
- **Trust signals**: Privacy promise, no timers, permanent hosting
- **Header**: Paw print logo icon, serif branding, simplified nav
- **localStorage bridge**: Saves pet name/species/memory as `petmemorial-wizard-seed` for wizard pickup
- **Wizard seed consumption**: Wizard hook reads `petmemorial-wizard-seed` on hydration, pre-fills pet name and species

### Client-Side Photo Previews & Deferred Upload
- **No auth required to create**: Users build the entire memorial (including photos) without signing in
- **Blob URL previews**: Photos use `URL.createObjectURL()` for instant client-side preview (raw `<img>` tags, not Next.js `Image`)
- **IndexedDB persistence**: File objects stored in IndexedDB (`src/lib/photo-store.ts`) to survive auth redirects
- **Deferred upload flow**: On Save → upload files to `/api/upload` → get Supabase URLs → POST to `/api/memorial`
- **Auth redirect**: If unauthenticated at save time, redirects to `/sign-in?redirect=/create?step=4`; wizard state (localStorage) + files (IndexedDB) persist across the redirect
- **URL validation**: `/api/memorial` rejects photo URLs that don't start with `NEXT_PUBLIC_SUPABASE_URL` (always validated, even if env var is unset)

### Memorial Public Page (Issues #6 & #7)
- **Public page** (`/[slug]`): Hero image + pet name/dates overlay, tribute card, responsive photo gallery
- **Data fetching**: Supabase nested select with owner vs. public access control (unpublished drafts visible to owner only)
- **OG/Twitter meta**: Dynamic `generateMetadata()` with title, description, hero image for social sharing previews
- **Share button**: Copy-to-clipboard with `NEXT_PUBLIC_SITE_URL` env-aware URL generation
- **Print CSS**: Clean print layout with hidden interactive elements
- **Hero fallback**: Paw-print placeholder when no photos exist; tribute "Add a tribute" CTA for owners
- **Bug fix**: Corrected `eulogy` → `tribute` column name in memorial API route

### Decision Support Mode (Issue #10)
- **Mode selection screen**: Two-card UI on `/create/tribute` — "Celebrate their life" (amber) or "I'm struggling with guilt or what-ifs" (blue)
- **Support flow**: AI compassionate reframing via `/api/tribute/support` endpoint (Claude Haiku, rate limit 3/min). Asks about specific regrets, responds with 2-4 sentence reframing, then transitions to celebration questions
- **Transition interstitial**: User-initiated "When you're ready, let's celebrate what made [Pet] special" card with Continue button (no auto-advance)
- **Crisis detection**: Client-side keyword scan on submit (`src/lib/crisis-detection.ts`), non-blocking 988 Lifeline banner, no logging/storage
- **Mode switching**: Allowed freely before 2 messages; confirmation dialog after (clears chat)
- **Support-aware tribute generation**: `/api/tribute` accepts `mode` and `supportContext`, adjusts system prompt to weave healing themes
- **State persistence**: `tributeMode`, `hasPassedTransition`, `supportContext` in localStorage via `useMemorialState`
- **Dashboard status**: Workspace shows "In progress" once mode is selected
- **Error recovery**: Support API failure shows "Try again" / "Skip to memories" options
- **Prompts extracted**: `src/lib/tribute-prompts.ts` — `SUPPORT_PROMPTS`, `SUPPORT_CELEBRATE_PROMPTS` (celebrate mode no longer uses hardcoded prompts)

### Conversational AI Tribute Chat (Prompt Rework)
- **AI-driven celebrate flow**: Celebrate mode no longer uses hardcoded `CELEBRATE_PROMPTS` array. After the first question, each response comes from `/api/tribute/chat` — the AI acknowledges what the user shared, decides whether to dig deeper or move to a new topic, and signals when it has enough material via `[READY_FOR_TRIBUTE]` marker.
- **Chat API**: `/api/tribute/chat` — POST, authenticated, rate limit 10/min. Takes `petName`, `species`, `chatHistory`. Returns `{ reply, readyForTribute }`.
- **Prompt design philosophy**: All prompts across chat, tribute generation, and support use a "friend at the kitchen table" framing, not a therapist or interviewer. Key principles:
  - **Emotional register matching**: AI matches the user's energy — light for funny stories, gentle for tender/bittersweet ones. Never jokes when the user is being vulnerable.
  - **Specific reactions**: AI references the actual detail the user shared ("She really had your number, didn't she?"), never reacts generically ("That's beautiful").
  - **Grief-bleed handling**: If a user in celebrate mode expresses sadness/guilt, the AI sits with it briefly before gently guiding back to happy memories. No immediate redirect.
  - **Graceful closing**: The AI's final message feels like a natural ending ("I can really picture Skylar doing all of this...") before the Generate Tribute button appears.
  - **Banned language**: "Thank you for sharing," "What a special bond," "crossed the rainbow bridge," "forever in our hearts," "healing journey," "processing" — all explicitly banned across all prompts.
- **Tribute generation prompts** (`/api/tribute`): Completely reworked for both celebrate and support modes:
  - Uses pet name 4-5 times naturally
  - Quotes/paraphrases the owner's actual words ("she'd stare at me until I caved" not "she was persistent")
  - Opens with a vivid moment from the stories, not "This is a tribute to..."
  - Bans pet loss clichés and generic padding
  - Conversation context passed as `Interviewer:/Owner:` format (preserves emotional nuance from AI acknowledgments)
- **Support prompt** (`/api/tribute/support`): Now stateful — receives `priorContext` array so second reframing can build on the first. Reframed as "kind friend who understands grief" not "grief counselor."
- **Support→celebrate transition**: Still uses hardcoded `SUPPORT_CELEBRATE_PROMPTS` (3 questions). Only the primary celebrate mode is AI-driven.
- **First message**: Changed from cold "What was [name]'s favorite thing to do?" to "I'd love to hear about [name]. What was [name]'s favorite thing to do?"

### Video Compilation Tool (Issues #11, #12, #13)
- **Video upload** (`/create/reel`): Drag-and-drop upload (mp4/mov/webm, 100MB max), client-side blob URL previews, first-frame canvas thumbnails, duration extraction via `<video>` `loadedmetadata`, IndexedDB persistence (`src/lib/video-store.ts`), max 10 videos
- **Upload API**: `/api/upload-video` — Supabase `memorial-videos` bucket, rate limited (5/window)
- **Video clipper** (`/create/reel/clips`): Custom HTML5 `<video>` player, dual-handle range selector (pointer events, 44px+ touch targets), "Set Start"/"Set End" buttons for mobile, tag input, clip preview playback
- **Clip list**: Drag-to-reorder, tag badges, duration display, click-to-edit, total compilation duration
- **FFmpeg compilation** (`/api/compile-video`): Server-side via `fluent-ffmpeg` + `ffmpeg-static`, Node.js runtime, 300s max. Supports cut/fade/dissolve transitions. Downloads sources to `/tmp`, renders, uploads to `memorial-videos/compilations/`
- **Status polling**: `/api/compile-video/status` — GET with compilationId for async progress tracking
- **Compile UI** (`/create/reel/compile`): Transition selector (Cut/Fade/Dissolve), progress spinner, result video player, error + retry
- **Memorial page embed**: Compiled video shown after tribute section on public page (`/[slug]`)
- **State management**: `WizardVideo`, `VideoClip` interfaces + 8 new actions in `useMemorialState`, IndexedDB hydration for video files
- **Database**: `videos`, `video_clips`, `video_compilations` tables with RLS (`supabase/migrations/002_video_tables.sql`)
- **Security**: URL allowlist (SSRF prevention — only Supabase-hosted URLs), runtime numeric validation on clip times (command injection prevention)
- **Dashboard**: Reel feature card shows dynamic status ("Not started" / "X videos uploaded" / "Complete")

### Memory Wall (Epic 5)
- **Contributor submission form**: "Share a Memory" section on published memorial pages (`/[slug]`). Name (required), email (optional), text (500 words max), up to 3 photos. No account required.
- **Anonymous photo upload**: `/api/memories/upload` uses service role client for unauthenticated uploads, validates memorial is published
- **Memory submission API**: `/api/memories` — IP rate-limited (5/min), validates content, creates memory with `moderation_status: 'pending'`
- **Moderation API**: `/api/memories/[memoryId]` — PATCH (approve/reject/edit) and DELETE, owner-only with auth
- **Email notifications**: Resend integration (`src/lib/email.ts`) sends owner an email when a new memory is submitted
- **Moderation queue**: Dashboard tab "Pending Memories" with count badge. Approve, edit (Dialog), or delete pending memories
- **Public display**: Approved memories shown in "Memories & Stories" section on memorial page
- **Pre-moderation by default**: Nothing appears publicly until owner approves

### Not Yet Built (Web)
- Stripe payment integration (checkout + customer portal)
- Photo captions (Claude Sonnet vision)
- Photo analysis/tagging (Gemini Flash)
- Print-on-demand integration (Gelato/Printful)
- Analytics (PostHog)
- Cloudflare R2 CDN integration
- Sign-in redirect callback for `/create/preview` return flow (sign-in page needs to honor `redirect` query param)

### Not Yet Built (Mobile App — v3.3)
- React Native app setup (iOS + Android)
- Firebase push notifications (morning/evening reminders)
- AI grief journaling — pet-aware prompts via Claude Sonnet, theme detection via Claude Haiku
- Daily check-in system ("What would you tell them today?") with progressive prompt evolution
- Journal entry timeline with auto-tagged themes (missing routines, guilt, happy memories, etc.)
- Voice-to-text journaling (for when user is crying)
- Journal ↔ memorial integration (AI suggests adding journal content to memorial)
- Streak tracking and engagement counters
- Quick memorial viewing (mobile-optimized)
- Offline journaling with AsyncStorage sync
- Journal export as PDF

## Reference Documents

- [PRD.md](PRD.md) — Consolidated product requirements (v3.1)
- [PRD_v3.0.md](PRD_v3.0.md) — Detailed previous version
- [PRD_v3.1.md](PRD_v3.1.md) — Latest version with user research updates
- [USER_RESEARCH.md](USER_RESEARCH.md) — User interview insights
- [PetMemorial_PRD_v3_3.md](PetMemorial_PRD_v3_3.md) — v3.3 PRD with mobile app + AI grief journaling
- [PetMemorial_PRD_v3_3_Changes_Summary.md](PetMemorial_PRD_v3_3_Changes_Summary.md) — v3.2 → v3.3 change summary
- [PetMemorial_Day2_Interview_Report.md](PetMemorial_Day2_Interview_Report.md) — Day 2 user research
