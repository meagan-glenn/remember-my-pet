# PetMemorial.ai - Product Requirements Document

**Version:** 3.1 (Consolidated)
**Updated:** January 29, 2026

---

## Executive Summary

PetMemorial.ai addresses the emotional transformation needed during pet loss—helping grieving owners shift from painful final memories to celebrating a lifetime of joy. We create permanent, shareable memorial pages that function as both therapeutic tool and social proof.

**Key Differentiator:** The Collaborative Memory Wall creates an ongoing place to return to, not just a one-time memorial. Each memorial is shared with 20-30 people who can contribute stories and photos over time, creating a built-in referral cycle where guests become creators for their own pets.

**Market:** Global pet end-of-life services market valued at $3.41B (2024), projected to reach $7.77B by 2033. Digital memorials growing at 13.83% CAGR.

**Target:** $20k MRR within 6 months, 96% gross margin on digital products.

---

## Problem Statement

### Core Insight (from User Research)

> "Something that tells me I can move on, but not forget. That she's okay. That she was happy in many many moments of life, and that how things ended is not what made up the other 12 years of her life. Something that I can reference back to and see all of those happy memories and experience joy, not hurt and pain."

**Primary job-to-be-done:** Transform how people remember their pet—from painful final moments to a lifetime of joy.

### The Emotional Transformation Problem

Pet loss creates a **memory distortion effect**—the trauma of the final days or euthanasia decision can overshadow years of happy memories. Owners describe "how things ended" becoming the dominant memory, rather than the thousands of joyful moments that defined their pet's life.

### Specific Pain Points During Acute Grief

| Pain Point | Description |
|------------|-------------|
| **Emotional Overwhelm** | Writing a tribute feels impossible when grieving; organizing photos takes energy they don't have |
| **Euthanasia Guilt** | Spiraling "what ifs"—need someone to listen to their specific regrets first, then help them process |
| **Memory Distortion** | The painful ending dominates their memory; they want to remember "the other 12 years" |
| **Need for Tangible Keepsakes** | Looking for "as many tangible things as I can to remember her that aren't urns" |
| **Desire for Ongoing Connection** | Want "somewhere to share photos and videos" over time, not just a one-time memorial |
| **Social Media Inadequacy** | A single Facebook post disappears in feeds and fails to capture their pet's life story |

---

## Target Users

### Primary Persona: Grieving Pet Owner

- **Demographics:** 30-65 years old, 70% female, $60k+ household income
- **Psychographics:** Views pet as family member, emotionally devastated by loss, wants to honor pet's memory
- **Tech Savviness:** Comfortable with basic web apps, uploads photos to social media

### Secondary Persona: Memory Contributor

- Friend or family member who received memorial link
- Wants to support grieving loved one but doesn't know what to say
- **Critical Insight:** This persona becomes a future creator when their own pet passes (viral loop)

### Tertiary Persona: HR/Benefits Manager

- Companies offering pet loss leave or grief support benefits
- Budget authority for employee wellness software ($500-5000/year)

---

## Core Features (MVP)

### 1. Memorial Creation Flow

**User Journey:**
1. Land on homepage → CTA: "Create a Tribute"
2. Enter pet's name, species, birth/death dates (optional)
3. Upload 5-20 photos (with smart cropping suggestions)
4. Answer 5-7 AI-guided prompts to generate tribute content
5. Preview generated memorial page (**Private Creation Period**)
6. Edit tribute and photo arrangement if desired
7. Purchase to unlock permanent memorial
8. **THEN** choose when to open Memory Wall to others (deliberate sharing moment)

### 2. Tribute Creator (formerly "AI Eulogy Assistant")

> **Note:** Research shows "eulogy" is not universally understood. User quote: "I actually don't know what a eulogy is."

**Two Modes:**

#### Narrative Mode
- Conversational prompts that feel therapeutic
- Examples: "What was their favorite thing to do?" "What quirk made you laugh?"
- Generates 3-4 paragraph tribute (250-400 words)

#### Decision Support Mode (CRITICAL)
- **Must invite user to express specific regrets and fears FIRST**
- Then respond to THOSE specific concerns
- Generic reframing feels hollow—the difference between helpful and hollow is whether it heard them first

**Implementation:**
```
First ask: "What specific 'what ifs' are you thinking about?"
         or "What do you wish you had done differently?"
THEN analyze their specific concerns with compassionate reframing.
Never lead with generic reassurance.
```

### 3. Private Creation Period Before Sharing

> User quote: "I would love to spend the next few days creating something privately, then sharing it with family and telling them they can add their memories too."

- After purchase, memorial enters **private mode by default**
- Creator can refine, add photos, edit tribute over several days
- "Invite others" is a conscious choice, not automatic
- Clear CTA: "Ready to open your memorial to friends and family?"

### 4. Memorial Page Components

- Hero section with pet's name, dates, and primary photo
- AI-generated tribute (editable by creator)
- Photo gallery with timeline view
- Collaborative Memory Wall
- Shareable link (rainbowbridge.pet/petname-year)
- Virtual candle lighting (visitors can light candle, see total count)

**Technical Requirements:**
- Fast load times (<2 seconds)
- Beautiful OG tags for social sharing
- Print-friendly CSS
- Permanent hosting (99.9% uptime SLA)
- Mobile-first (80% of users create on mobile)

### 5. Collaborative Memory Wall (PRIMARY DIFFERENTIATOR)

**Core Functionality:**
- Open contribution: Anyone with link can add memories (with creator moderation)
- Guided prompts: "Share a favorite memory" or "What made [Pet Name] special?"
- Rich media: Text (500 words), photos (up to 10), videos (up to 2 min)
- Contributor attribution: Name and date shown
- Group gift functionality: Contributors can collectively purchase physical products

**Moderation Workflows:**
- Pre-moderation default: All contributions go to pending queue
- Email notifications: "Sarah shared a memory of Max. Review and approve?"
- Quick actions: Approve, edit, request revision, or delete
- Auto-approve option for trusted contributors
- 24hr grace period even for auto-approved memories

**Viral Mechanics:**
- After contributing, user sees: "When you lose a pet, PetMemorial.ai is here for you too."
- Average memorial shared with 20-30 people
- Target: 15% of contributors become creators within 90 days
- Goal: Viral coefficient >1.0

### 6. Smart Photo Timeline

AI analyzes photos to identify:
- Physical changes over time ("white hair around her mouth")
- Habits and patterns ("favorite sunny spot", "making biscuits on blanket")
- Connection moments (eye contact, lap time, play)

Auto-generates captions like "Your morning sun-bather" that witness the pet's unique personality.

### 7. Physical Products (Print-on-Demand)

**Current Offerings:**
| Product | Price | Description |
|---------|-------|-------------|
| Memory Book | $79 (checkout) / $99 (later) | 20-page printed book with tribute, photos, top 10 memories |
| Canvas Print | $49 | 16x20 featured photo with tribute text |
| QR Code Plaque | $29 | Engraved plaque linking to memorial page |

**Roadmap Expansion (from user research):**

> "I want both [digital and physical]. I'm trying to find as many tangible things as I can to remember her that aren't urns."

- **Q2 2026 - Comfort Items:** Custom blankets with pet photos, custom stuffed animals resembling the pet
- **Q3 2026 - Ash Ceremony Kits:** Guides/kits for meaningful ash-spreading ceremonies

---

## Post-MVP Features (Month 3-6)

### Ongoing Memorial Relationship (NEW PRIORITY)

> "Maybe someone to talk to about her whenever it comes up. Somewhere to share photos and videos."

**Planned Features:**
- **Add Memories Over Time:** Upload new photos/stories months or years later
- **Anniversary Prompts:** Gentle reminders (1 month, 6 months, 1 year) inviting new memories
- **AI Companion for Grief Processing:** Conversational AI that knows the pet's story
- **Return Visit Incentives:** Stats ("152 people have lit a candle for Max"), milestone celebrations

### Additional Features
- Video support (max 2 min clips)
- AI voice eulogy (ElevenLabs, $15 add-on)
- Slideshow mode for funeral displays
- Slack/Teams integration
- Memorial analytics
- Gift memorial option

---

## Technical Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router), TailwindCSS, Shadcn/ui, Framer Motion |
| Backend | Next.js API routes, Supabase (PostgreSQL + Storage) |
| Auth | Clerk (magic links) |
| AI | OpenAI GPT-4o (eulogy), Claude Sonnet (captions), Gemini Flash (vision) |
| Payments | Stripe Checkout + Customer Portal |
| Print-on-Demand | Gelato API (primary), Printful (backup) |
| Hosting | Vercel (frontend), Supabase (backend), Cloudflare R2 (CDN) |
| Email | Resend |
| Analytics | PostHog |

### Database Schema (Key Tables)

```sql
users: id, email, clerk_id, created_at

memorials: id, user_id, pet_name, slug, birth_date, death_date,
           eulogy, decision_support_used, template, is_paid,
           is_published, auto_approve_memories, created_at, updated_at

photos: id, memorial_id, url, caption, ai_detected_tags,
        sort_order, uploaded_by, created_at

memories: id, memorial_id, contributor_name, contributor_email,
          content, photo_urls, is_approved, moderation_status,
          created_at, approved_at

contributors: id, memorial_id, email, name, became_creator, created_at
```

---

## Pricing Model

| Tier | Price | Features |
|------|-------|----------|
| Free Preview | $0 | 7-day trial, watermarked, no memory wall |
| Basic | $49 | Permanent memorial, memory wall, sharing |
| Premium | $99 | Basic + printed memory book |
| Annual Renewal | $29/year | Continued hosting after Year 1 |

**Unit Economics:**
- COGS per memorial: ~$1.90
- Basic tier margin: 96%
- Premium tier margin: 69% (after $30 Gelato COGS)

**Price Insensitivity Validated:**
> "Honestly $99 feels like nothing. Cremation was $300. The euthanasia was $500. The x-rays yesterday were $800. What's $99 to do something nice for me?"

---

## Success Metrics

### North Star Metric
Paying memorials created per month with active memory contributors

### Launch Goals (Month 1-3)
- 50 free preview memorials created
- 15 paying customers (30% conversion)
- $900 MRR
- 60% of memorials receive 3+ contributed memories

### Growth Goals (Month 4-6)
- 333 paying customers per month
- $20k MRR
- Viral coefficient of 1.2+
- 15% of contributors become creators within 90 days

---

## Go-to-Market Strategy

### Launch (Month 1)
1. Reddit soft launch in r/petloss (7M members)
2. Pet grief Facebook groups
3. Build in public (Twitter/LinkedIn)
4. Product Hunt launch (Day 10-15)

### SEO Strategy (Month 2-4)
- Target keywords: "pet memorial website", "online pet memorial", "pet eulogy generator"
- Content: "Coping with Pet Loss Guide", "How to Write a Pet Eulogy"
- Public memorial gallery (opt-in) for UGC/SEO

### B2B Partnerships (Month 3-6)
- Veterinary clinics (printed cards with QR codes)
- Pet cremation services (white-label option)
- HR/benefits platforms

---

## Risks & Mitigation

### Messaging Risk
**Risk:** "Disenfranchised grief" messaging may not resonate with millennials who have pets-as-family norms.

**Mitigation:** A/B test two value propositions:
- A: "Your grief is valid" (validation-focused)
- B: "Remember the joy, not just how it ended" (transformation-focused)

### Brand Risk
**Risk:** Being perceived as "predatory" or exploiting grief.

**Mitigation:**
- Transparency-first pricing
- Free preview (7-day trial)
- No pressure tactics (no countdown timers, pop-ups)
- Authentic founder story

### Technical Risk
**Risk:** AI-generated eulogies feel generic or obviously AI-written.

**Mitigation:**
- Position AI as collaborator, not replacement
- Require specific details in prompts
- Always allow editing before publish
- A/B test different models for emotional resonance

---

## Roadmap Summary

### MVP (Weeks 1-5)
- Week 1-2: Core memorial creation, AI eulogy
- Week 2-3: Payments, published pages, templates
- Week 3-4: Memory wall, moderation, notifications
- Week 4-5: Physical products, mobile optimization

### Post-MVP (Month 3-6)
- Anniversary reminders
- Video support
- AI voice eulogy
- Workplace integrations
- Memorial analytics

### Future (Year 2+)
- PIMS integration (vet software)
- Human memorials expansion
- White-label SaaS
- Enterprise HR platform

---

## Key Insights from User Research (v3.1 Changes)

1. **Renamed "Eulogy" to "Tribute"** - users don't know what a eulogy is
2. **Added private creation period** - sharing is a deliberate later step
3. **Decision Support must listen first** - ask about their specific regrets before offering reframing
4. **Physical products roadmap expanded** - blankets, stuffed animals, ash ceremony kits
5. **Ongoing memorial relationship** - not just a one-time creation, but a place to return to
6. **Price insensitivity confirmed** - $99 feels like nothing compared to vet costs
