# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RememberMyPet.ai — an AI-powered platform for creating digital pet memorials with collaborative memory walls, print-on-demand physical products, and an optional mobile grief companion app with AI journaling.

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
| CDN | Cloudflare R2 (not yet integrated) |
| Auth | Supabase Auth (Google OAuth + magic links) |
| AI | Claude Haiku (tribute generation, theme detection), Claude Sonnet (decision support, journal responses), Gemini Flash (photo captions/vision) |
| Payments | Stripe Checkout + Customer Portal |
| Print-on-Demand | Gelato API (primary), Printful (backup) |
| Hosting | Vercel |
| Email | Resend |
| Analytics | PostHog (not yet integrated) |

## Architecture

- **Next.js App Router** with API routes serving as the backend
- **Supabase** for PostgreSQL database, file storage, and real-time subscriptions
- Memorial pages served at `remembermypet.ai/petname-lastname-year` slug pattern
- **Two-part product**: Web memorial (core, $49-99 one-time) + optional mobile grief companion app (free with purchase)

### Key Patterns

- **No auth required to create**: Users build the entire memorial (photos, tribute, video) without signing in. Auth only required at save time. An early auth banner encourages (but doesn't require) sign-in during creation.
- **Client-side previews**: Photos/videos use blob URLs (`URL.createObjectURL`), stored in IndexedDB (`src/lib/photo-store.ts`, `src/lib/video-store.ts`) to survive auth redirects.
- **Deferred upload**: On save → upload files to `/api/upload` → get Supabase URLs → POST to `/api/memorial`. URL validation rejects non-Supabase URLs.
- **Pre-moderation**: Memory wall contributions default to pending. Owner approves/edits/deletes from dashboard.
- **AI prompt philosophy**: "Friend at the kitchen table" framing. Emotional register matching, specific reactions (not generic), grief-bleed handling. Banned phrases: "Thank you for sharing," "What a special bond," "crossed the rainbow bridge," "forever in our hearts," "healing journey," "processing." See `src/lib/tribute-prompts.ts`.
- **Pronoun system**: Gender-aware pronouns throughout UI via `src/lib/pronouns.ts`. Pets have a `gender` field (male/female/neutral) that drives he/she/they pronouns in tributes, captions, and memorial pages.
- **State management**: `useMemorialState` hook with localStorage persistence. Wizard seed from homepage stored as `petmemorial-wizard-seed`.
- **Error handling**: Centralized error messages in `src/lib/error-messages.ts`. API routes return structured `{ error: { code, message, recoverable } }` via `apiError()` helper. Client-side errors use specific copy from `ERROR_MESSAGES` — error toasts use `duration: Infinity` (user must dismiss), non-critical toasts (candle) use `duration: 4000`. Offline detection via `src/components/offline-banner.tsx`. Top-level error boundary in `src/app/error.tsx`.

### Database Schema (Key Tables)

```sql
users: id (references auth.users), email, created_at
memorials: id, user_id, pet_name, gender, species, custom_species, slug, birth_date, death_date, tribute, decision_support_used, template, is_paid, is_published, auto_approve_memories, created_at, updated_at
photos: id, memorial_id, url, caption, ai_detected_tags, sort_order, uploaded_by, created_at
memories: id, memorial_id, contributor_name, contributor_email, content, photo_urls, is_approved, moderation_status, created_at, approved_at
contributors: id, memorial_id, email, name, became_creator, created_at
candles: id, memorial_id, user_id, created_at, unique(memorial_id, user_id) — "Light a Candle" reactions
videos, video_clips, video_compilations — see supabase/migrations/002_video_tables.sql
product_orders — see Gelato migration
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/tribute` | POST | Generate tribute (Claude Haiku), accepts `mode` + `supportContext` |
| `/api/tribute/chat` | POST | Conversational AI chat, returns `{ reply, readyForTribute }` |
| `/api/tribute/support` | POST | Decision support reframing (rate limit 3/min) |
| `/api/memorial` | POST | Create or update memorial (upsert by `id`) |
| `/api/upload` | POST | Upload photos to Supabase storage |
| `/api/upload-video` | POST | Upload videos (rate limit 5/window) |
| `/api/compile-video` | POST | FFmpeg server-side compilation (300s max) |
| `/api/compile-video/status` | GET | Async compilation progress |
| `/api/memories` | POST | Submit memory (IP rate-limited 5/min) |
| `/api/memories/[memoryId]` | PATCH/DELETE | Moderate memories (owner-only) |
| `/api/memories/upload` | POST | Anonymous photo upload for memories |
| `/api/checkout` | POST | Stripe Checkout session |
| `/api/webhooks/stripe` | POST | Stripe webhook (signature verified) |
| `/api/caption` | POST | AI photo caption via Gemini 2.5 Flash Lite (rate limit 20/min) |
| `/api/homepage/chat` | POST | AI-driven homepage mini-conversation |
| `/api/candles` | GET | Get candle count + whether current user has lit |
| `/api/candles` | POST | Toggle candle (light/unlight), auth required |
| `/api/gelato/*` | Various | Print-on-demand preview/order/status/webhook |

## Critical Product Constraints

- **Mobile-first**: 80% of users create on mobile
- **Performance**: Page load under 2 seconds
- **Terminology**: Use "Tribute" not "Eulogy"
- **Decision Support Mode**: Ask about specific regrets/fears FIRST, then respond. Never lead with generic reassurance.
- **Private creation period**: Memorials default to private after purchase. Sharing is a deliberate later step.
- **No pressure tactics**: No countdown timers, pop-ups, or urgency messaging
- **AI journaling must be pet-aware**: Reference specific memorial content. Never generic grief prompts.
- **Journal entries private by default**: User explicitly chooses which to add to memorial
- **Crisis detection**: Client-side keyword scan (`src/lib/crisis-detection.ts`), non-blocking 988 Lifeline banner, no logging/storage

## What's Built

- Auth (Google OAuth + magic link sign-in/sign-up, middleware, callback with redirect protection, auth error page)
- Memorial creation wizard (4 steps: pet details → photos → tribute chat → preview) with auto-save indicator and early auth banner
- Homepage with AI-driven conversational entry flow (name → species → memory → redirect to `/create`)
- AI tribute chat — unified single conversation flow (no mode selection), with tribute refinement based on user feedback
- Decision support integrated into chat flow, crisis detection, support→celebrate transition
- Public memorial page (`/[slug]`) with hero, tribute, photo gallery, video embed, Kudoboard-inspired memory wall (interleaved photos/videos/text via `src/lib/interleave-wall-content.ts`), OG meta, print CSS
- Memorial edit mode — load existing memorial from API, edit all fields, and update (PUT to `/api/memorial`)
- Dashboard with memorial listing, moderation queue, status badges
- Video upload, clipper, FFmpeg compilation, status polling
- Memory wall (submission, moderation, email notifications via Resend)
- Photo captions (user-editable, 200 char max; AI auto-generated via Gemini 2.5 Flash Lite on upload) with AI vision tags (`ai_detected_tags`) for life stage, habits, connection moments, and settings
- "Light a Candle" reactions on memorial pages (toggle, one per user, optimistic UI, auth required to light)
- Gelato print-on-demand (shop page at `/[slug]/shop`, webhook with HMAC verification)
- Stripe checkout (Basic $49 / Premium $99, webhook for payment/refund)
- Image crop modal for photo editing
- Demo memorial page (`/demo`)
- Legal pages (`/privacy`, `/terms`) and site footer
- Centralized error UX — user-friendly recovery messages, offline banner, error boundary, structured API errors
- Shadcn/ui components: button, input, label, card, textarea, dialog, separator, tabs, avatar, sonner, dropdown-menu, badge, progress

## Not Yet Built

### Web
- PostHog analytics (#20)
- Broader email notification system (#19)
- Cloudflare R2 CDN integration
### Go-Live Blockers

**Gemini Flash API:**
- `GOOGLE_AI_API_KEY` needed for photo auto-captioning and vision tags
- Currently optional — must be configured for production

**Stripe (currently test mode):**
- Switch to live Stripe keys (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- Create live price IDs for Basic ($49) and Premium ($99) plans
- Update `STRIPE_WEBHOOK_SECRET` for live endpoint

**Gelato Print-on-Demand (significant work remaining):**
- `GELATO_API_KEY` configuration (live key, not test)
- Replace placeholder product UIDs with real Gelato product UIDs from dashboard
- Print-ready PDF generation for memory book (currently sends raw photo URLs — Gelato requires print-spec PDFs)
- QR code plaque product (not yet implemented)
- Stripe payment must complete before placing Gelato order (currently orders directly without payment gate)
- Follow Gelato integration best practices: https://support.gelato.com/en/articles/8996572-getting-started-with-api-integration
  - Map products to Gelato UIDs via their dashboard
  - Ensure submitted files meet Gelato's design/print-quality specifications
  - Use test API key for sandbox orders first (auto-canceled, not shipped)
  - Shipping costs are dynamic per-country — must be fetched via API, not hardcoded
  - Switch to live key only after sandbox validation

### Mobile App (v3.3 — not started)
- React Native app (iOS + Android), Firebase push notifications
- AI grief journaling, daily check-ins, voice-to-text, theme detection
- Journal ↔ memorial integration, streak tracking, offline sync, PDF export
- See [PetMemorial_PRD_v3_3.md](PetMemorial_PRD_v3_3.md) for full spec

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` (Claude Haiku/Sonnet)
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_PREMIUM`
- `NEXT_PUBLIC_SITE_URL`

### Optional
- `RESEND_API_KEY` (email notifications)
- `GELATO_API_KEY` (print-on-demand)
- `GOOGLE_AI_API_KEY` (Gemini 2.5 Flash Lite — photo auto-captioning)

## Reference Documents

- [USER_RESEARCH.md](USER_RESEARCH.md) — User interview insights
- [PetMemorial_PRD_v3_3.md](PetMemorial_PRD_v3_3.md) — v3.3 PRD with mobile app + AI grief journaling
- [PetMemorial_PRD_v3_3_Changes_Summary.md](PetMemorial_PRD_v3_3_Changes_Summary.md) — v3.2 → v3.3 change summary
- [PetMemorial_Day2_Interview_Report.md](PetMemorial_Day2_Interview_Report.md) — Day 2 user research
