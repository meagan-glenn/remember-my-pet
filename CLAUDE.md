# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PetMemorial.ai — an AI-powered platform for creating digital pet memorials with collaborative memory walls and print-on-demand physical products.

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
| AI | Claude Haiku (tribute generation), Claude Sonnet (photo captions), Gemini Flash (vision analysis) |
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

### Database Schema (Key Tables)

```sql
users: id (references auth.users), email, created_at
memorials: id, user_id, pet_name, slug, birth_date, death_date, tribute, decision_support_used, template, is_paid, is_published, auto_approve_memories, created_at, updated_at
photos: id, memorial_id, url, caption, ai_detected_tags, sort_order, uploaded_by, created_at
memories: id, memorial_id, contributor_name, contributor_email, content, photo_urls, is_approved, moderation_status, created_at, approved_at
contributors: id, memorial_id, email, name, became_creator, created_at
```

## Critical Product Constraints

- **Mobile-first**: 80% of users create on mobile
- **Performance**: Page load under 2 seconds
- **Terminology**: Use "Tribute" not "Eulogy" (users don't know what eulogy means)
- **Decision Support Mode**: Must ask users about their specific regrets/fears FIRST, then respond to those specific concerns. Never lead with generic reassurance.
- **Private creation period**: After purchase, memorials default to private. Sharing with others is a deliberate later step.
- **Moderation**: Memory wall contributions are pre-moderated by default (pending queue with approve/edit/delete)
- **No pressure tactics**: No countdown timers, pop-ups, or urgency messaging

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

### Not Yet Built
- Stripe payment integration (checkout + customer portal)
- Memory wall (contributor submissions, moderation queue)
- Photo captions (Claude Sonnet vision)
- Photo analysis/tagging (Gemini Flash)
- Print-on-demand integration (Gelato/Printful)
- Decision Support Mode in tribute flow
- Email notifications (Resend)
- Analytics (PostHog)
- Cloudflare R2 CDN integration
- Sign-in redirect callback for `/create?step=4` return flow (sign-in page needs to honor `redirect` query param)

## Reference Documents

- [PRD.md](PRD.md) — Consolidated product requirements (v3.1)
- [PRD_v3.0.md](PRD_v3.0.md) — Detailed previous version
- [PRD_v3.1.md](PRD_v3.1.md) — Latest version with user research updates
- [USER_RESEARCH.md](USER_RESEARCH.md) — User interview insights
