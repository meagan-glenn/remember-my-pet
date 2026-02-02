# PetMemorial.ai
## Product Requirements Document v3.2

**Updated:** January 30, 2026

---

## Document History

**v3.0:** Original PRD  
**v3.1:** Updated based on Day 0 (euthanasia day) user research  
**v3.2:** Updated based on Day 2 follow-up interview - **Major architectural changes to creation flow**

### Changes in v3.2

This version incorporates Day 2 follow-up research revealing that grief needs shift rapidly in the first 72 hours. Key changes:

1. **Non-linear memorial creation flow** (users choose photos/tribute/videos based on current emotional state)
2. **Video compilation moved to MVP** (validated as acute grief survival tool, not reflection feature)
3. **Digital picture frame integration** roadmapped (solves "just digital" fear)
4. **Updated understanding of ongoing memorial relationship** (memorial as presence, not just memory)
5. **Community stories feature exploration** (validated by Reddit consumption behavior)

---

## Executive Summary

PetMemorial.ai addresses the emotional transformation needed during pet loss—helping grieving owners shift from painful final memories to celebrating a lifetime of joy, while also providing a space where their pet's presence continues to exist.

We create permanent, shareable memorial pages that function as **grief companions**—not one-time creations, but living workspaces that users return to over days, weeks, and years as their needs evolve.

**Key Differentiator:** Non-linear creation flow that meets users where they are emotionally. Day 0 users need photos. Day 2 users need videos. Week 2 users add tributes. The memorial adapts to grief stages instead of forcing a predetermined path.

**Market:** $3.41B (2024) growing to $7.77B (2033), with digital memorials at 13.83% CAGR.

**Target:** $20k MRR within 6 months, achieving 96% gross margin on digital products.

---

## Problem Statement

### Core Insight from Research

**North Star Quote (Day 0):**
> "Something that tells me I can move on, but not forget. That she's okay. That she was happy in many many moments of life, and that how things ended is not what made up the other 12 years of her life. Something that I can reference back to and see all of those happy memories and experience joy, not hurt and pain."

**Day 2 Evolution:**
> "I wish I could have a sign from her that she is okay. Just being with her however I can."

### The Emotional Transformation Problem

Pet loss creates a **memory distortion effect**—the trauma of final days or euthanasia can overshadow years of happy memories. Owners describe the ending becoming the dominant memory rather than thousands of joyful moments.

**Critical Day 2 Finding:** The need shifts from "transforming pain to joy" to "creating a space where presence continues." Users aren't just preserving memories—they're seeking connection with their pet in the only way still available.

### Specific Pain Points During Acute Grief

#### Day 0-2 Physical Manifestations
- **Somatic grief:** Head hurts, stomach hurts, "like I'm in physical pain"
- **Random crying:** "Out of nowhere"
- **Routine triggers:** Morning wake-ups, bedtimes—13 years of muscle memory with nowhere to go

#### Emotional Overwhelm & Fear Evolution
- **Day 0:** Fear of forgetting quirks, personality details
- **Day 2:** Fear that "I'll never find another dog like her. This was a once in a lifetime relationship. This pain will never go away."

#### The Search for Signs
- Reading Reddit threads constantly looking for afterlife stories
- Not religious, building own framework from others' experiences
- Needs permission to believe pet is "frolicking and hunting moles"

#### Media Consumption as Medicine
- **Day 0-1:** Mostly photos (visual processing, less demanding)
- **Day 2:** Shifted to mostly videos—"I want to hear her barks and noises"
- **Not memory work, it's presence work:** "Just being with her however I can"
- **Quote:** "It's literally all I do all day"

#### Social Sharing Barriers
- Day 2: Privacy needs **intensify**, not reduce
- Can barely tell 2 people in DMs (makes them cry)
- Would create memorial "alone or with my husband"

#### Physical vs Digital Memorial Tension
- Wants tangible presence but not shrine
- Plans to scatter ashes, finds urns "weird"
- Risk of becoming "just a digital memory"
- Needs physical anchors without dedicated memorial space

---

## Market Opportunity

### Total Addressable Market
- **Global Pet End-of-Life Market:** $3.41B (2024) → $7.77B (2033) at 9.57% CAGR
- **US Market:** 5.6-6.7M pets pass away annually
- **Digital memorials:** Fastest sub-sector at 13.83% CAGR

### Price Insensitivity Validated (Day 2 Research)
**User Quote:** *"Honestly $99 feels like nothing. Cremation was $300. The euthanasia was $500. The x-rays yesterday were $800. What's $99 to do something nice for me?"*

**Implication:** $99 premium tier may be underpriced. Consider testing higher price points for physical products.

---

## Target Users

### Primary Persona: Grieving Pet Owner
- **Demographics:** 30-65 years old, 70% female, $60k+ household income
- **Psychographics:** Views pet as family member, childfree or pet-as-child mindset
- **Grief Response:** Oscillates between staying busy and "rotting on the couch"
- **Coping Mechanism:** Watching videos/photos constantly, seeking active projects
- **Privacy Needs:** High in acute phase, would create alone or with partner only

### Updated Jobs to be Done
1. **Create space where pet's presence continues** (not just preserve memories)
2. **Transform from pain to joy when remembering** (over time, not immediate)
3. **Find permission to believe pet is okay** (without religious framework)
4. **Have something active to do with the grief** (productive grieving)
5. **Be with pet in sensory way** (see, hear, feel their presence)

---

## Core Features (MVP)

### CRITICAL ARCHITECTURAL CHANGE: Non-Linear Creation Flow

**Previous assumption (v3.0-3.1):** Users follow linear path: pet info → photos → tribute → checkout

**Research finding:** Users need different features at different grief stages:
- Day 0: Photos (less demanding, muscle memory)
- Day 0-1: Tribute Q&A (ready to process through writing)
- Day 2: Videos (need to hear pet, be with them, stay busy)

**New architecture:** Memorial is **workspace**, not wizard.

#### Implementation
```
Landing → Dashboard with 3 entry points:
├── Upload Photos (anytime)
├── Create Tribute (anytime)
└── Build Video Reel (anytime)

Progress saved across all features
No forced completion order
User chooses based on emotional state
```

**Dashboard messaging:**
- "What do you need to do right now?"
- Show completion status for each: Photos (12 uploaded), Tribute (in progress), Videos (not started)
- Gentle prompts: "When you're ready, you can [add photos/write tribute/create video]"

---

### 1. Memorial Creation Flow

#### User Journey (Non-Linear)
1. Land on homepage: "Create a Tribute to [Pet Name]"
2. **Choose your starting point:**
   - "Upload Photos" → Photo gallery builder
   - "Write Tribute" → AI-guided Q&A
   - "Create Video Reel" → Video compilation tool
3. Work on any feature in any order
4. Preview memorial page
5. **Private Creation Period:** Purchase unlocks permanent memorial (still private by default)
6. **Deliberate Sharing Moment:** "Ready to open your memorial to friends and family?" (conscious choice, not automatic)

---

### 2. Photo Gallery (Day 0 Feature)

**Why Day 0:** Less emotionally demanding, muscle memory (already scrolling), visual processing easier than writing.

#### Features
- Upload 5-50+ photos
- Smart chronological ordering (EXIF data)
- AI vision analysis (Gemini Flash):
  - Physical changes over time
  - Habits and patterns ("favorite sunny spot")
  - Connection moments (eye contact, lap time)
- Auto-generates captions: "Your morning sun-bather"
- Drag-to-reorder
- Mobile-optimized (80% will use phone)

---

### 3. Tribute Creator (Day 0-1 Feature)

**Renamed from "Eulogy Assistant" based on v3.1 research**

#### Two Modes

**Narrative Mode:**
- 5-7 conversational prompts
- Feel therapeutic, not transactional
- Examples: "What was their favorite thing to do?" "What quirk made you laugh?"
- Generates 3-4 paragraph tribute (250-400 words)

**Decision Support Mode (UPDATED v3.1):**
- **CRITICAL:** Must listen before reframing
- First prompt: "What specific 'what ifs' are you thinking about?" or "What do you wish you had done differently?"
- User expresses specific regrets (e.g., "What if I did chemo a week earlier?")
- **THEN** AI responds to THOSE concerns with compassionate reframing
- Never lead with generic reassurance—hollow without hearing them first

---

### 4. Video Compilation Tool (NEW - MOVED TO MVP)

**CRITICAL FINDING:** This is not a post-MVP reflection feature. This is an **acute grief survival tool** for Day 2-3.

**User Quote:** *"It feels like a right now thing. To keep me busy."*

#### Why MVP Priority
- User already watching videos "literally all day"
- Needs something active to do WITH the grief
- Productive grieving: creating, deciding, curating
- Keeps hands and brain busy while maintaining connection
- For users who cope by staying busy, this is THE engagement hook

#### Feature Flow

**Upload & Organize:**
- Upload unlimited videos to memorial
- Videos stored in library, sorted by date

**Curation (User-Controlled):**
- Scrub through each video
- Mark/clip moments by dragging to select timeframe
- Tag clips: "her bark," "favorite spot," "greeting me"
- Drag clips into order for final compilation

**AI Assembly:**
- Smooth transitions between clips
- Audio leveling (no jarring volume jumps)
- Suggests 2-3 tasteful transition styles (cut, fade, dissolve)
- Renders into single clean file

**Parameters:**
- Length: Up to 10 minutes
- Music: Optional, can add later (not required initially)
- Captions/overlays: Optional, can add later
- **Philosophy:** Start simple when user has no bandwidth. Layer complexity weeks/months later.

**Export Options:**
- Embedded in memorial page
- Download for personal use
- Share link to video only

---

### 5. Memorial Page

#### Components
- Hero section: pet's name, dates, primary photo
- AI-generated tribute (editable by creator)
- Photo gallery with timeline view
- **Video reel (if created)**
- Collaborative Memory Wall
- Shareable link (rainbowbridge.pet/petname-year)
- Virtual candle lighting

#### Technical Requirements
- Fast load times (<2 seconds)
- Beautiful OG tags for social sharing
- Print-friendly CSS
- Permanent hosting (99.9% uptime SLA)
- SEO optimized

---

### 6. Collaborative Memory Wall

**Status:** Remains core feature, but with updated understanding of **when** users activate it.

**Key v3.1 Finding:** Users want private creation period first, then deliberate sharing.

**Day 2 Finding:** Privacy needs intensify on Day 2, not reduce. User can barely tell 2 people privately.

#### Updated Flow
1. Memorial created in **private mode by default**
2. Creator works on it alone (or with partner) for days/weeks
3. **When ready,** creator clicks "Open Memory Wall to Others"
4. Get shareable link + pre-written invite message
5. Contributors add memories (with moderation)

#### Core Functionality
- Open contribution with link
- Guided prompts: "Share a favorite memory"
- Rich media: text (500 words), photos (10 per contribution), videos (2 min)
- Pre-moderation default: creator approves before public
- Email notifications: "Sarah shared a memory. Review?"

---

## Post-MVP Features (Month 3-6)

### 1. Digital Picture Frame Integration (HIGH PRIORITY)

**Validated Day 2:** Solves "just digital" fear without forcing shrine aesthetic.

**User Quote:** *"I think the photo book is a good balance, or even a digital picture frame. Someone could also put the frame in a memorial if they wanted."*

#### How It Works
- Memorial page syncs to digital picture frame
- Frame rotates through photos/videos
- Auto-updates when user adds new content to memorial
- Lives in physical space (bookshelf, bedroom, etc.)
- User controls placement and meaning

#### User Choice
- **Integrated into daily life:** Frame on bookshelf, part of normal environment
- **Dedicated memorial space:** Frame with collar, candles, intentional shrine
- Same product, different relationship based on grief style

**Best of both worlds:**
- Digital memorial = permanent, backed up, can't crash
- Physical frame = tangible presence in daily life

---

### 2. Ongoing Memorial Relationship Features

**Day 2 Finding:** Memorial should be "place where her presence still exists," not just static tribute.

**User Quote:** *"Maybe someone to talk to about her whenever it comes up. Somewhere to share photos and videos. Something that I can reference back to."*

#### Features
- **Add memories over time:** Upload new photos/videos months or years later
- **Anniversary prompts:** Gentle reminders (1 month, 6 months, 1 year): "Share how you're feeling today" or "Add a new memory"
- **Return visit incentives:**
  - View stats: "152 people have lit a candle for Max"
  - Milestone celebrations: "Your memorial has been visited 500 times"
  - Seasonal prompts: "Share a favorite summer memory"
- **AI grief companion:** Conversational AI that knows pet's story, can discuss memories, process emotions over time

---

### 3. Community Stories Feature (NEW - EXPLORATION)

**Validated Day 2:** User "constantly reading Reddit threads trying to find a story I connect with about afterlife because I'm not religious."

#### Concept
- Curated collection of afterlife/sign stories from other users
- Not religious framing—experiential, permission-giving
- Users can share their own "I felt her presence" moments
- Searchable by pet type, loss context, spiritual beliefs
- Helps users build their own framework for believing pet is okay

**Philosophy:** Provide what Reddit provides, but in memorial context.

---

### 4. Physical Products - Expanded Roadmap

#### Current Offerings (MVP)
- Memory book ($79/$99)
- Canvas print ($49)
- QR code plaque ($29)

#### Roadmap (Q2-Q3 2026)
**Based on v3.1 research: "I want as many tangible things as I can that aren't urns"**

- **Comfort items:** Custom blankets, stuffed animals resembling pet (partner with Cuddle Clones)
- **Ash ceremony kits:** Guides for meaningful scattering ceremonies ("unique way to spread her ashes in the mountains")
- **Non-morbid keepsakes:** Items that feel personal, not funeral-adjacent
- **Digital picture frame:** Pre-loaded with memorial content, gift-ready packaging

---

## Technical Architecture

### Tech Stack (Updated for Video)
- **Frontend:** Next.js 14+, TailwindCSS, Shadcn/ui, Framer Motion
- **Backend:** Next.js API routes, Supabase (PostgreSQL + Storage)
- **Auth:** Supabase Auth (magic links)
- **AI:** 
  - Claude Haiku (tribute generation)
  - Claude Sonnet (image captions, decision support)
  - Gemini Flash (high-volume vision tasks)
- **Video Processing (NEW):** FFmpeg via serverless (Cloudflare Workers or AWS Lambda)
- **Payments:** Stripe Checkout + Customer Portal
- **Print-on-Demand:** Gelato API (primary), Printful (backup)
- **Hosting:** Vercel (frontend), Supabase (backend/DB), Cloudflare R2 (image/video CDN)
- **Email:** Resend
- **Analytics:** PostHog

### Database Schema (Updated)

**New tables for v3.2:**

```sql
videos (NEW)
- id, memorial_id, url, thumbnail_url
- duration, file_size, mime_type
- uploaded_by, uploaded_at
- ai_detected_content (barks, locations, moods)

video_clips (NEW)
- id, video_id, memorial_id
- start_time, end_time
- user_tag (e.g., "her bark", "favorite spot")
- sort_order (for compilation)

video_compilations (NEW)
- id, memorial_id
- compilation_url, duration
- music_track_id (nullable)
- created_at, last_updated

picture_frame_syncs (NEW - Post-MVP)
- id, memorial_id, user_id
- frame_device_id, last_sync_at
- sync_frequency (hourly, daily, weekly)
```

**Existing tables remain from v3.0/3.1**

---

## Unit Economics

### Variable Cost per Memorial (Updated for Video)

**Original costs (v3.0):**
- Claude Haiku: $0.05
- Claude Sonnet: $0.05
- Supabase storage (photos): $0.02
- Vercel hosting: $0.01
- Stripe fees (3.5% on $49): $1.72
- **Subtotal:** $1.85

**Added for video:**
- FFmpeg processing (serverless): $0.15 per 10 min compilation
- Video storage (Cloudflare R2): $0.03 per GB (~$0.06 for typical user)
- CDN delivery: $0.02

**New total COGS:** $2.08 per memorial (with video)

**Gross Margin (Updated):**
- Basic ($49): $46.92 profit (95.8% margin)
- Premium with Book ($99): $66.92 profit after $30 Gelato COGS (67.6% margin)

---

## Roadmap

### MVP Build (Weeks 1-6) - UPDATED

**Week 1-2: Core Infrastructure & Non-Linear Flow**
- Next.js app setup with Supabase
- Dashboard with 3 entry points (photos/tribute/videos)
- Progress saving across features
- Memorial page template (dignity-first design)

**Week 2-3: Photo Gallery + Tribute Creator**
- Photo upload with smart ordering
- AI vision analysis (Gemini Flash)
- Tribute Q&A with two modes (Narrative + Decision Support)
- Edit/preview functionality

**Week 3-4: Video Compilation Tool (NEW - MVP PRIORITY)**
- Video upload to Supabase storage
- Video player with scrubbing/clipping UI
- Clip tagging and ordering
- FFmpeg compilation pipeline
- Embed compiled video in memorial page

**Week 4-5: Monetization & Memory Wall**
- Stripe integration
- Private mode by default
- "Open Memory Wall" feature
- Memory submission + moderation

**Week 5-6: Polish & Testing**
- Mobile optimization
- Social sharing (OG tags)
- Performance optimization
- User testing with 5-10 people in r/petloss

---

### Post-MVP (Months 3-6)

**Month 3:**
- Physical products (Gelato integration)
- Anniversary prompts
- "Add memories over time" feature
- A/B test value proposition messaging

**Month 4:**
- Digital picture frame integration (prototype)
- Community stories feature (beta)
- Video compilation v2 (music, captions)
- Return visit incentive features

**Month 5-6:**
- Comfort items partnerships (Cuddle Clones, blankets)
- Ash ceremony kits
- AI grief companion (conversational memory assistant)
- B2B workplace integration (Slack/Teams)

---

## Go-to-Market Strategy

### Launch Strategy (Month 1)
1. **Reddit soft launch:** r/petloss (7M members) - "I built this while grieving my dog"
2. **Offer:** First 50 users get permanent memorial free (validate product-market fit)
3. **Ask:** Feedback, testimonials, permission to share their stories
4. **Build in public:** Share development journey on Twitter/LinkedIn

### SEO Strategy (Months 2-4)
**Target keywords:**
- "pet memorial website" (1.3k/mo)
- "online pet memorial" (880/mo)
- "pet tribute creator" (updated from "eulogy")
- "pet memorial videos" (new)

---

## Success Metrics

### North Star Metric
**Paying memorials created per month with active engagement** (photos uploaded, tribute written, OR video created—any one validates engagement)

### MVP Success Criteria (Month 1-3)
- 50 memorials created (any completion state)
- 15 paying customers (30% conversion from preview)
- $900 MRR
- **NEW:** 40% of memorials include video compilation (validates feature)
- 60% of memorials receive 3+ contributed memories

### Growth Goals (Month 4-6)
- 333 paying customers/month
- $20k MRR
- **NEW:** 60% of memorials include video (increases to primary feature)
- Average 8 contributors per memory wall
- 15% of contributors become creators within 90 days

### Feature-Specific Metrics
**Video Compilation:**
- % of users who start video upload
- % who complete full compilation
- Average clips per compilation
- Time spent in video tool (engagement proxy)
- Correlation: video creation → higher purchase intent?

**Non-Linear Flow:**
- Entry point distribution (photos vs tribute vs videos)
- Feature completion order (validates non-linear hypothesis)
- Days between feature engagements (validates ongoing workspace model)

---

## Risks & Mitigation

### User Research Sample Size Risk
**Risk:** v3.1 and v3.2 insights based on single user (n=1). Findings may not generalize.

**Mitigation:**
- Conduct 5-10 additional Day 0-2 interviews before launch
- A/B test non-linear flow vs linear flow with first 100 users
- Track feature entry point distribution to validate hypothesis
- Build analytics to understand actual user behavior vs. research predictions

### Video Feature Complexity Risk
**Risk:** Video processing is technically complex, could delay MVP if issues arise.

**Mitigation:**
- Use proven libraries (FFmpeg)
- Serverless approach (scales automatically, no infrastructure)
- Build MVP version first (just trimming + stitching, no fancy effects)
- Add complexity (transitions, music) in v2 after validation

### "Just Digital" Fear Not Fully Solved
**Risk:** Digital picture frame may not fully address physical presence need.

**Mitigation:**
- Offer multiple physical products (book, canvas, frame)
- Don't force any one solution—let users choose what resonates
- Test physical product uptake rates
- If <20% buy physical, investigate why

---

## Updated Comparison: v3.0 → v3.1 → v3.2

| Dimension | v3.0 | v3.1 | v3.2 |
|-----------|------|------|------|
| **Core Problem** | Validation void | Transformation pain→joy | Ongoing presence space |
| **Feature Name** | AI Eulogy Assistant | Tribute Creator | Tribute Creator |
| **Creation Flow** | Linear wizard | Private then share | Non-linear workspace |
| **Video Feature** | Post-MVP reflection | Not addressed | MVP survival tool |
| **Physical Integration** | Print products only | Add blankets, stuffed animals | Digital picture frame |
| **Memorial Vision** | One-time creation | Place to return to | Ongoing grief companion |

---

## Key Takeaways

1. **Grief is non-linear, so the product cannot be linear.** Users need different tools at different moments. Forcing a predetermined flow fails to meet them where they are.

2. **Video compilation is not a "nice to have later."** For users who cope by staying busy, it's the feature that transforms the memorial from static tribute to active grief companion.

3. **Privacy needs intensify in acute phase.** Don't assume users want to share publicly. Design for private creation first, deliberate sharing later.

4. **The memorial is a presence, not just a memory.** Language, features, and design should support the feeling that the pet's existence continues in this space.

5. **Physical + digital integration solves "just digital" fear** without forcing shrine aesthetic. Give users choice in how they manifest tangible presence.

---

**Document prepared:** January 30, 2026  
**Based on:** Day 0 interview (Jan 28) + Day 2 follow-up (Jan 30)  
**Next research:** Day 7 and Day 30 follow-ups recommended
