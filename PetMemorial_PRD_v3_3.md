# PetMemorial.ai
## Product Requirements Document v3.3

**Updated:** January 30, 2026

---

## Document History

**v3.0:** Original PRD  
**v3.1:** Updated based on Day 0 (euthanasia day) user research  
**v3.2:** Updated based on Day 2 follow-up interview - Major architectural changes to creation flow  
**v3.3:** Added mobile app + AI grief journaling feature

### Changes in v3.3

This version adds the mobile app as an optional daily grief companion with AI-powered journaling that knows the pet's story.

**Key additions:**
1. **Mobile app positioning** as optional add-on (not required for core memorial)
2. **AI grief journaling** that references specific memorial content
3. **Daily check-in prompts** (morning/evening reminders + "What would you tell them today?")
4. **Pet-aware AI responses** using Claude Sonnet
5. **Corrected AI model allocations** (Claude Haiku for tribute generation, not GPT-4o)
6. **Cost analysis** showing ~$0.50/month per active app user

---

## Executive Summary

PetMemorial.ai addresses the emotional transformation needed during pet loss—helping grieving owners shift from painful final memories to celebrating a lifetime of joy, while also providing a space where their pet's presence continues to exist.

**Core Product:** Web-based memorial creation (photos, tribute, videos, memory wall)  
**Optional Add-on:** Mobile app for daily grief support and AI journaling

**Key Differentiator:** Non-linear creation flow + optional daily grief companion app that knows your pet's story, providing personalized prompts and responses that generic journaling apps can't offer.

**Market:** $3.41B (2024) growing to $7.77B (2033), with digital memorials at 13.83% CAGR.

**Target:** $20k MRR within 6 months, achieving 80%+ gross margin (after app costs).

---

## Problem Statement

### Core Insight from Research

**North Star Quote (Day 0):**
> "Something that tells me I can move on, but not forget. That she's okay. That she was happy in many many moments of life, and that how things ended is not what made up the other 12 years of her life. Something that I can reference back to and see all of those happy memories and experience joy, not hurt and pain."

**Day 2 Evolution:**
> "I wish I could have a sign from her that she is okay. Just being with her however I can."

### NEW: The Generic Journaling Gap

**User is already journaling on Day 2** using Apple Journal, but finds it insufficient:

**The Problem:**
- Entries are disconnected fragments
- App doesn't know who "her" is
- No prompts about the specific pet
- Can't connect entries over time with context
- Generic sentiment tracking, no pet-specific themes

**User Quote:** *"I've been writing my dog things in journal entries. I like Apple's journal and how it asks me my feelings/sentiment and allows me to add videos and photos, but there aren't prompts about her and it doesn't know HER. Which makes it hard to connect each entry."*

**What Users Need:**
An AI that knows Skylar's story so it can:
- Give prompts that reference HER specifically
- Connect entries over time with context
- Recognize patterns in grief journey
- Provide responses personalized to their relationship

### The Emotional Transformation Problem

Pet loss creates a **memory distortion effect**—the trauma of final days or euthanasia can overshadow years of happy memories. Users aren't just preserving memories—they're seeking ongoing connection with their pet.

### Specific Pain Points During Acute Grief

#### Day 0-2 Physical Manifestations
- **Somatic grief:** Head hurts, stomach hurts, "like I'm in physical pain"
- **Random crying:** "Out of nowhere"
- **Routine triggers:** Morning wake-ups, bedtimes—13 years of muscle memory with nowhere to go

**User Quote (Day 2):** *"Unexpectedly hard: going to bed and waking up. Every morning I used to wake up and go straight to her for kisses and rubs and say good morning. Going to bed, every night we had a routine for 13 years."*

#### The Search for Signs
- Reading Reddit threads constantly looking for afterlife stories
- Not religious, building own framework from others' experiences
- Needs permission to believe pet is "frolicking and hunting moles"

**User Quote:** *"I wish I could have a sign from her that she is okay."*

#### Media Consumption as Medicine
- **Day 0-1:** Mostly photos
- **Day 2:** Shifted to mostly videos—"I want to hear her barks and noises"
- **Not memory work, it's presence work:** "Just being with her however I can"
- **Quote:** "It's literally all I do all day"

---

## Market Opportunity

*(Same as v3.2 - no changes)*

---

## Target Users

### Primary Persona: Grieving Pet Owner

**Updated behaviors (Day 2 research):**
- **Already journaling** on Day 2 (active coping mechanism)
- **Seeks daily rituals** to replace lost routines
- **Needs AI that knows their pet** (not generic prompts)
- **Wants ongoing connection** (not just one-time memorial)

### Jobs to be Done (Updated)

1. **Maintain daily connection with pet** (new ritual to replace morning/bedtime routines)
2. **Create space where pet's presence continues** (not just preserve memories)
3. **Process grief with AI that knows the pet's story** (not generic journaling)
4. **Transform from pain to joy when remembering** (over time, not immediate)
5. **Find permission to believe pet is okay** (without religious framework)
6. **Have something active to do with the grief** (productive grieving)

---

## Product Architecture

### Two-Part System

**Part 1: Web Memorial (Core Product)**
- Memorial creation (photos, tribute, videos)
- Memory wall
- Permanent hosting
- One-time purchase: $49-99

**Part 2: Mobile App (Optional Add-On)**
- Daily grief journaling with pet-aware AI
- Morning/evening reminders
- "What would you tell them today?" prompts
- Quick access to memorial
- **FREE with memorial purchase** (included, not separate subscription)

**Positioning:** "Want daily support? Download our app for check-ins with [Pet Name]"

---

## Core Features (MVP) - Web Memorial

*(Same as v3.2 - memorial creation, photos, tribute, videos, memory wall)*

### Updated AI Model Allocations

**Memorial Creation:**
- **Claude Haiku:** Tribute generation (CORRECTED - was GPT-4o in earlier versions)
- **Claude Sonnet:** Decision Support mode (empathy critical)
- **Gemini Flash:** Bulk photo captions (cheap, fast, high volume)

**Why Claude Haiku for Tribute:**
- Cheaper than GPT-4o (~$0.001 vs $0.10 per memorial)
- Quality sufficient for initial draft (user edits anyway)
- Consistent Claude "voice" across product
- Still gets full memorial context

---

## NEW: Mobile App Features (MVP)

### Positioning & Discovery

**When to introduce:**
Post-purchase confirmation email:
> "✓ Your memorial for Skylar is live  
>   
> Want daily support as you grieve?  
> Download our app for:  
> ✓ Daily grief journaling with AI that knows Skylar  
> ✓ Morning & evening reminders  
> ✓ Quick access to her photos and videos  
>   
> [Download iOS] [Download Android]"

**Free with memorial purchase** - included in $49-99, not separate subscription

### Feature 1: Daily Reminders

**Two daily notifications at user-set times:**

**Morning Reminder (replaces lost wake-up routine):**
> "Skylar is with you today ❤️  
> What would you tell her this morning?"  
> [Tap to journal]

**Evening Reminder (replaces lost bedtime routine):**
> "Skylar is happy and at peace."

**Personalization:**
- Uses pet's name
- Can include random photo from their gallery
- User sets notification times
- Easy to snooze/disable

**Progressive Evolution:**
Messaging evolves over time:

*Week 1:* Simple presence affirmations  
*Week 2-4:* Gentle grief processing prompts  
*Month 2+:* Shift to memory celebration  
*Year+:* Anniversary milestones, seasonal prompts

**Examples:**

*Week 1 Morning:*
> "Skylar is with you today ❤️"

*Week 3 Morning:*
> "Good morning. Skylar's love for you hasn't gone anywhere."

*Month 2 Evening:*
> "Remember when Skylar used to [habit from photos]? She was so happy with you."

**User Controls:**
- Turn notifications on/off anytime
- Adjust timing and frequency
- "I'm having a bad day" button → skip today's reminders
- Snooze for X days if too overwhelming

---

### Feature 2: AI Grief Journaling (PRIMARY MOBILE FEATURE)

**Core Concept:** Daily journaling to pet with AI that knows their story, providing personalized prompts and responses that generic apps can't offer.

#### How It's Different from Apple Journal

**Apple Journal (Generic):**
- "How are you feeling today?"
- Entries are disconnected fragments
- Doesn't know who "her" is
- No context between entries
- Generic sentiment analysis

**PetMemorial Journal (Pet-Specific):**
- "You mentioned Skylar always greeted you at the door. How does coming home feel now?"
- AI knows Skylar's story from memorial content
- Connects entries over time with context
- Recognizes grief patterns specific to this loss
- References tribute, photos, videos in responses

#### The AI Knows Skylar

When memorial is created, AI ingests:
- The tribute (personality, habits, relationship)
- Photos (what she looked like, aging over time)
- Videos (barks, movements, favorite spots)
- Memory wall contributions

**So when you journal, the AI has context.**

#### Example Pet-Specific Prompts

**Generic:** "How are you feeling today?"

**Skylar-Specific:**
- "You mentioned Skylar always greeted you at the door. How does coming home feel now?"
- "What would Skylar think about what you're working on today?"
- "You said she loved hunting moles. Did something today remind you of her playfulness?"
- "It's been 3 days. Is the silence at bedtime getting easier or harder?"

#### Entry Connection Over Time

**Entry 1 (Day 2):**
You write: "I miss her barks. The house is too quiet."

**Entry 4 (Day 5):**
Prompt: "Last time you mentioned the silence. Has that shifted at all?"

**Entry 10 (Day 12):**
Prompt: "You've written a lot about missing her sounds. Would it help to watch one of the videos where you can hear her bark?"

**The AI tracks themes in YOUR grief, specific to YOUR relationship.**

#### AI Response Examples (Pet-Aware)

**Entry:** "I keep thinking about whether I made the right choice."

**Generic response:** "It's normal to question difficult decisions."

**Skylar-aware response (Claude Sonnet):**
> "You wrote in her tribute that she loved running and playing fetch. In her last days, she couldn't do those things anymore. You gave her peace when her joy was gone. That was the right choice."

**Entry:** "I saw a dog at Costco and started crying."

**Generic:** "Grief triggers are normal."

**Skylar-aware (Claude Sonnet):**
> "You mentioned Skylar was a golden retriever. Seeing other goldens will be hard for a while. But eventually, you might see them and smile remembering her, not just cry. You're not there yet, and that's okay."

#### Journal Entry Flow

**Daily Prompt:**
- Morning notification triggers journal
- Optional prompt variations based on memorial content
- Default: "What would you tell Skylar today?"

**Entry Creation:**
- Text input OR voice-to-text (easier when crying)
- No character limit
- Optional: Attach photo from today
- Optional: Attach video

**After Submit:**
- AI response (personalized, references memorial)
- Simple acknowledgment: "Skylar heard you ❤️"
- Streak counter: "7 days talking to Skylar"
- Option: "Add to memorial" (makes visible to memory wall)

**Privacy:**
- All entries private by default
- User chooses which (if any) to add to memorial
- Can export as PDF "My Grief Journey with Skylar"
- Can delete anytime

#### Visual Timeline

Instead of disconnected entries:
- Timeline view of all entries
- Auto-tagged by theme: "missing routines," "guilt," "happy memories," "signs she's okay"
- Photos/videos attached inline
- Pattern recognition: "You've mentioned bedtime 7 times. This is a hard moment for you."

#### Integration with Memorial Content

**Link entries to memorial:**
- Write about missing her bark → AI: "Add that video of her barking to your memorial?"
- Write about bedtime routine → AI: "Would you want to add this to your tribute's 'What made her special' section?"
- Processing guilt → AI: "You wrote about this in your Decision Support session. Would it help to re-read what you processed then?"

**The memorial and journal talk to each other.**

---

### Feature 3: Quick Memorial Access

**In-app memorial viewing:**
- View memorial page (mobile-optimized)
- Quick-add photos/videos from phone
- See memory wall contributions
- Approve/manage memories from notifications

**NOT in app (web-only):**
- Full memorial creation flow
- Memory wall setup
- Purchase/checkout
- Detailed analytics

---

## Technical Architecture (Updated for Mobile)

### Tech Stack

**Web (unchanged from v3.2):**
- Frontend: Next.js 14+, TailwindCSS, Shadcn/ui
- Backend: Next.js API routes, Supabase
- AI: Claude Haiku/Sonnet, Gemini Flash
- Video: FFmpeg via serverless
- Payments: Stripe

**Mobile (NEW):**
- **Framework:** React Native (iOS + Android from single codebase)
- **Push Notifications:** Firebase Cloud Messaging (free tier)
- **Local Storage:** AsyncStorage for offline journaling
- **AI API:** Direct calls to Anthropic API (Claude Sonnet/Haiku)
- **Sync:** Real-time sync with Supabase backend

**Why React Native:**
- Single codebase for iOS + Android
- Faster development
- Shared logic with Next.js (both React)
- Good performance for this use case

### AI Model Strategy (CORRECTED & OPTIMIZED)

**Memorial Creation (Web):**
- **Claude Haiku:** Tribute generation (~$0.001 per memorial)
- **Claude Sonnet:** Decision Support mode (~$0.02 per session)
- **Gemini Flash:** Photo captions (~$0.05 for 20 photos)

**Daily Grief Journaling (Mobile):**
- **Claude Sonnet:** Personalized prompts and journal responses
  - Input: ~500 tokens (memorial context + previous entries)
  - Output: ~200 tokens (personalized response)
  - Cost: ~$0.02 per journal entry
- **Claude Haiku:** Theme detection and sentiment analysis
  - Extract themes from entries
  - Cost: ~$0.0002 per entry

**Why Claude over GPT for journaling:**
- More empathetic and nuanced responses
- Better at referencing specific memorial content
- Natural conversational tone (not chatbot-y)
- **Cheaper than GPT-4o** (~$0.02 vs ~$0.05 per response)
- User validation: "Claude is so much more in tune respectfully"

### Cost Analysis (Mobile App)

**Per Active Daily User Per Month:**

| Component | Model | Cost |
|-----------|-------|------|
| Daily prompt generation (30/month) | Claude Sonnet | $0.06 |
| Journal entry analysis (20/month) | Claude Haiku | $0.004 |
| AI responses (20/month) | Claude Sonnet | $0.40 |
| Push notifications | Firebase FCM | $0 |
| **Total per active user** | | **~$0.50/month** |

**Scenario at Scale:**
- 333 paying customers (Month 6 target)
- 50% download app = 165 users
- 50% use daily = 83 active users
- **Monthly AI cost: ~$40**
- **Annual cost per daily user: ~$6**

**Impact on Margins:**
- Memorial revenue: $49 (basic tier)
- Memorial COGS: $2.13 (video included)
- App cost (first year): $6
- **Net profit: $40.87 per memorial (83% margin)**

**Still excellent margins even with free app included.**

### Cost Controls

**Rate Limits (to prevent abuse):**
- 5 journal entries per day maximum
- AI response capped at 300 tokens
- Memorial context cached (doesn't reprocess every time)

**Decision Trigger:**
- If AI costs exceed $200/month (>400 daily active users)
- Consider introducing premium tier for unlimited entries
- But with current pricing, free is sustainable

### Pricing Strategy for App

**Launch Strategy: FREE with memorial purchase**

**Why free:**
1. Margins can absorb it (80%+ even with app costs)
2. Engagement drives growth (daily users = advocates)
3. Data is valuable (learning what works in grief support)
4. Easy to add premium later if needed

**If costs spike, introduce freemium:**

**Free (included):**
- 1 journal entry per day
- Daily morning/evening reminders
- Basic AI responses
- View memorial in app

**Premium ($2.99/month or $24.99/year):**
- Unlimited journal entries
- Advanced AI prompts (deeper memorial integration)
- Voice-to-text journaling
- Export journal as PDF
- Priority support

**For now: Launch free, watch data, adjust if needed.**

### Database Schema (Updated)

**New tables for v3.3:**

```sql
-- Daily grief journal entries
journal_entries
- id, memorial_id, user_id
- entry_date, entry_text
- voice_recording_url (if voice-to-text used)
- attached_photo_urls, attached_video_urls
- ai_detected_themes (array: ["missing_routines", "guilt", "happy_memory"])
- ai_response_text (personalized Claude Sonnet response)
- sentiment_score (from Haiku analysis)
- related_memorial_content_ids (links to tribute sections, photos, videos)
- is_private (default: true)
- added_to_memorial (default: false)
- created_at

-- Grief themes tracked over time
journal_themes
- id, memorial_id
- theme_name ("bedtime_grief", "guilt_spirals", "saw_similar_dogs")
- frequency_count
- first_mentioned, last_mentioned
- ai_suggested_resources (e.g., "Add bedtime ritual to memorial")

-- App notification preferences
notification_settings
- id, user_id, memorial_id
- morning_time (user's timezone)
- evening_time (user's timezone)
- enabled (boolean)
- frequency (daily, every_other_day, weekly)
- last_sent_at

-- App usage analytics
app_sessions
- id, user_id, memorial_id
- session_start, session_end
- features_used (array: ["journal", "view_memorial", "add_photo"])
- journal_entries_created
- created_at

-- Journal entry streaks
journal_streaks
- id, user_id, memorial_id
- current_streak_days
- longest_streak_days
- last_entry_date
```

---

## Roadmap (Updated)

### MVP Build (Weeks 1-6) - Web Only

**Week 1-2: Core Infrastructure**
- Next.js app + Supabase
- Non-linear dashboard
- Memorial page templates

**Week 2-3: Photo Gallery + Tribute**
- Photo upload + AI captions (Gemini Flash)
- Tribute Q&A (Claude Haiku)
- Decision Support (Claude Sonnet)

**Week 3-4: Video Compilation**
- Video upload + clipping UI
- FFmpeg compilation
- Embed in memorial

**Week 4-5: Memory Wall + Monetization**
- Stripe integration
- Private mode default
- Memory submission + moderation

**Week 5-6: Polish & Testing**
- Mobile optimization (web)
- OG tags for sharing
- User testing (5-10 people r/petloss)

### Post-MVP Phase 1 (Months 2-3) - Mobile App Development

**Month 2:**
- React Native app setup
- Firebase push notifications
- Basic memorial viewing in app
- Supabase sync

**Month 3:**
- **AI grief journaling feature** (Claude Sonnet/Haiku)
- Daily prompts with memorial context
- Entry timeline view
- Theme detection
- iOS TestFlight beta (10-20 users)

**Soft launch iOS, begin Android development**

### Post-MVP Phase 2 (Months 4-6) - Mobile Launch + Web Enhancements

**Month 4:**
- Full iOS App Store launch
- Physical products (Gelato integration)
- Anniversary prompts (web + mobile)
- Android development continues

**Month 5:**
- Android Play Store launch
- Digital picture frame integration (prototype)
- Video compilation v2 (music, captions)
- Journal export as PDF

**Month 6:**
- Community stories feature (beta)
- Comfort items partnerships
- AI grief companion enhancements
- Premium tier testing (if needed)

---

## Success Metrics (Updated for Mobile)

### North Star Metric
**Paying memorials created per month with active engagement** (memorial completion + app usage)

### MVP Success Criteria (Month 1-3, Web Only)
- 50 memorials created
- 15 paying customers (30% conversion)
- $900 MRR
- 40% of memorials include video compilation
- 60% of memorials receive 3+ contributed memories

### Mobile App Success Criteria (Month 4-6)

**Adoption:**
- 50% of memorial creators download app
- 50% of downloads create at least 1 journal entry
- 30% become daily active users (journal 5+ days/week)

**Engagement:**
- Average 10 journal entries per user per month
- 70% of journal entries receive AI response
- Average 3-minute session time in app
- 60% of users enable push notifications

**Retention:**
- 60% of app users still active after 30 days
- 40% still active after 90 days
- Average streak: 7+ consecutive days

**Quality Indicators:**
- NPS score 70+ for app specifically
- <5% of users disable notifications within first week
- Theme detection accuracy: 80%+ (validated by manual review)

**Business Impact:**
- App users 2x more likely to recommend PetMemorial
- App users have 30%+ higher memory wall engagement
- App users 40%+ more likely to purchase physical products

---

## Go-to-Market Strategy (Updated)

### Launch Strategy (Month 1) - Web Only
1. Reddit soft launch: r/petloss
2. First 50 users: free permanent memorials
3. Build in public on Twitter/LinkedIn
4. Product Hunt launch Day 10-15

### Mobile App Launch (Month 4)

**Announcement to existing users:**
Email to all memorial creators:
> "Introducing: Daily Support for Your Grief Journey  
>   
> We heard you. Many of you are journaling about your pets, but existing apps don't know their story.  
>   
> We built something better:  
> ✓ Daily grief journaling with AI that knows [Pet Name]  
> ✓ Morning & evening reminders  
> ✓ Quick access to their photos and videos  
>   
> **Free with your memorial.** Download now:  
> [iOS App Store] [Android - Coming Soon]"

**App Store Optimization:**
- Title: "PetMemorial - Grief & Journaling"
- Subtitle: "Daily support that knows your pet's story"
- Keywords: pet loss, grief journal, pet memorial, dog grief, cat memorial
- Screenshots: Show memorial + journal entry + AI response
- Description emphasizes personalization ("Not generic grief support")

**Soft Launch Strategy:**
- TestFlight beta with 20 users from r/petloss
- Collect feedback on prompts, AI responses, notification timing
- Iterate before full launch
- Full launch with PR push: "First grief journaling app that knows your pet"

---

## Risks & Mitigation (Updated)

### NEW: Mobile App Development Risk
**Risk:** Building React Native app delays web launch or divides focus.

**Mitigation:**
- Launch web FIRST (Months 1-3)
- Validate core concept before investing in mobile
- React Native uses shared logic with Next.js
- Can hire React Native contractor if needed

### NEW: AI Cost Risk
**Risk:** Daily journaling at scale could spike AI costs beyond projections.

**Mitigation:**
- Rate limits: 5 entries/day max
- Response length caps: 300 tokens
- Memorial context caching (doesn't reprocess)
- Decision trigger: If costs >$200/month, introduce premium tier
- Current margins (80%+) can absorb projected costs

### NEW: Generic AI Risk
**Risk:** AI responses feel generic despite memorial context.

**Mitigation:**
- Use Claude Sonnet (validated as more empathetic)
- Extensive prompt engineering referencing specific memorial content
- TestFlight beta: validate response quality with real grieving users
- Continuous improvement: collect feedback on AI responses
- Human-in-loop: flag responses that felt generic, retrain

### User Research Sample Size Risk
**Risk:** Product heavily influenced by single user (n=1).

**Mitigation:**
- Conduct 10+ Day 0-2 interviews before mobile launch
- A/B test features with first 100 users
- Track actual behavior vs. research predictions
- Mobile beta surfaces edge cases

---

## Competitive Advantage

**Why PetMemorial beats generic journaling apps:**

| Feature | Apple Journal | PetMemorial |
|---------|---------------|-------------|
| **Knows your pet** | No | Yes - ingests memorial content |
| **Personalized prompts** | Generic | References specific habits, memories |
| **Connects entries** | No context | Tracks themes over time |
| **AI responses** | None | Pet-aware, empathetic (Claude Sonnet) |
| **Photos/videos** | Yes | Yes, linked to memorial |
| **Memorial integration** | N/A | Journal entries can become memorial content |
| **Grief-specific** | No | Built for pet loss specifically |

**User validation:** "There aren't prompts about her and it doesn't know HER. Which makes it hard to connect each entry."

---

## Key Takeaways

1. **Mobile app is optional add-on, not core product.** Web memorial comes first, app enhances for people who need daily support.

2. **AI grief journaling solves real gap.** User already journaling on Day 2 but frustrated with generic apps. Need AI that knows the pet's story.

3. **Claude Sonnet is the right model.** More empathetic than GPT, cheaper, better for grief content. User validated: "Claude is so much more in tune respectfully."

4. **Costs are sustainable with free model.** ~$0.50/user/month for daily journaling, margins still 80%+. Can absorb costs, introduce premium later if needed.

5. **Daily rituals replace lost routines.** Morning/evening notifications fill void of 13 years of wake-up/bedtime habits. "What would you tell them today?" maintains relationship feeling.

6. **The memorial and journal are connected.** Not separate products - they reference each other, creating ongoing grief companion ecosystem.

---

**Document prepared:** January 30, 2026  
**Based on:** Day 0 interview (Jan 28) + Day 2 follow-up + mobile app discussion (Jan 30)  
**Next research:** Day 7 and Day 30 follow-ups, mobile beta testing in Month 3
