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
| Auth | Clerk (magic links) |
| AI | OpenAI GPT-4o (tribute generation), Claude Sonnet (photo captions), Gemini Flash (vision analysis) |
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
users: id, email, clerk_id, created_at
memorials: id, user_id, pet_name, slug, birth_date, death_date, eulogy, decision_support_used, template, is_paid, is_published, auto_approve_memories, created_at, updated_at
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

## Reference Documents

- [PRD.md](PRD.md) — Consolidated product requirements (v3.1)
- [PRD_v3.0.md](PRD_v3.0.md) — Detailed previous version
- [PRD_v3.1.md](PRD_v3.1.md) — Latest version with user research updates
- [USER_RESEARCH.md](USER_RESEARCH.md) — User interview insights
