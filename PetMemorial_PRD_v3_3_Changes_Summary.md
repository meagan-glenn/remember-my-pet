# PetMemorial.ai PRD v3.2 → v3.3
## Summary of Changes: Mobile App + AI Grief Journaling

**Updated:** January 30, 2026

---

## Overview

v3.3 adds the mobile app as an optional daily grief companion, featuring AI-powered journaling that knows the pet's story. This addresses a gap discovered through Day 2 research: users are already journaling but frustrated with generic apps that don't know their pet.

---

## Major Additions in v3.3

### 1. Mobile App Positioning

**Architecture:**
- **Web memorial** = Core product (photos, tribute, videos, memory wall)
- **Mobile app** = Optional add-on for daily support
- **NOT required** for memorial creation

**Messaging:**
> "Want daily support? Download our app for:  
> ✓ Daily grief journaling with AI that knows [Pet Name]  
> ✓ Morning & evening reminders  
> ✓ Quick access to their photos and videos"

**Pricing:** FREE with memorial purchase (included in $49-99)

**Why this matters:**
- Not everyone needs daily prompts
- Graceful degradation (memorial works without app)
- Natural upsell moment after memorial creation
- Keeps people in ecosystem without forced adoption

---

### 2. AI Grief Journaling Feature

#### The Problem (Validated by User on Day 2)

**User Quote:**
> "I've been writing my dog things in journal entries. I like Apple's journal and how it asks me my feelings/sentiment and allows me to add videos and photos, but there aren't prompts about her and it doesn't know HER. Which makes it hard to connect each entry."

**What's broken with generic journaling apps:**
- Entries are disconnected fragments
- App doesn't know who "her" is
- No prompts about the specific pet
- Can't connect entries over time with context
- Generic sentiment tracking, no pet-specific themes

#### The Solution: Pet-Aware AI Journaling

**The AI knows the pet's story:**
When memorial is created, AI ingests:
- Tribute (personality, habits, relationship)
- Photos (what they looked like, aging over time)
- Videos (barks, movements, favorite spots)
- Memory wall contributions

**Prompts are personalized:**

Generic (Apple Journal):
> "How are you feeling today?"

Pet-specific (PetMemorial):
> "You mentioned Skylar always greeted you at the door. How does coming home feel now?"

> "You said she loved hunting moles. Did something today remind you of her playfulness?"

**Entries are connected:**
- AI tracks themes over time ("missing routines," "guilt," "happy memories")
- References previous entries in new prompts
- Recognizes patterns in grief journey
- Suggests memorial content based on journal entries

**Example flow:**

*Day 2:* "I miss her barks. The house is too quiet."

*Day 5 prompt:* "Last time you mentioned the silence. Has that shifted at all?"

*Day 12 prompt:* "You've written a lot about missing her sounds. Would it help to watch one of the videos where you can hear her bark?"

---

### 3. Daily Check-In System

**Two daily notifications (user-set times):**

**Morning (replaces lost wake-up routine):**
> "Skylar is with you today ❤️  
> What would you tell her this morning?"  
> [Tap to journal]

**Evening (replaces lost bedtime routine):**
> "Skylar is happy and at peace."

**Why this matters:**
User pain point (Day 2): *"Unexpectedly hard: going to bed and waking up. Every morning I used to wake up and go straight to her for kisses and rubs. Going to bed, every night we had a routine for 13 years."*

The notifications fill the void of 13 years of muscle memory.

**Progressive evolution:**
- Week 1: Simple presence affirmations
- Week 2-4: Gentle grief processing prompts
- Month 2+: Shift to memory celebration
- Year+: Anniversary milestones

**User controls:**
- Easy to snooze/disable
- "I'm having a bad day" → skip today's reminders
- Adjust timing and frequency

---

### 4. "What Would You Tell Them Today?" Feature

**Core concept:** Daily prompt to write/speak to pet, maintaining relationship feeling.

**User flow:**
1. Morning notification triggers prompt
2. Text OR voice-to-text entry (easier when crying)
3. Optional: Attach photo from today
4. AI response (personalized, references memorial)
5. Acknowledgment: "Skylar heard you ❤️"
6. Streak counter: "7 days talking to Skylar"
7. Option: "Add to memorial" (make visible to others)

**All entries private by default**

**Why this works:**
- Maintains relationship (talking TO pet, not just ABOUT pet)
- Daily ritual replaces morning greeting habit
- Active grief processing (not passive consumption)
- Can become memorial content over time
- Low-pressure (can skip days, no judgment)

---

### 5. Corrected AI Model Allocations

**IMPORTANT CORRECTION:**

**v3.2 incorrectly listed:**
- GPT-4o for tribute generation

**v3.3 corrects to:**
- **Claude Haiku** for tribute generation (actually implemented)

**Full AI strategy:**

**Memorial Creation (Web):**
- Claude Haiku: Tribute generation (~$0.001 per memorial)
- Claude Sonnet: Decision Support mode (~$0.02 per session)
- Gemini Flash: Photo captions (~$0.05 for 20 photos)

**Daily Grief Journaling (Mobile):**
- Claude Sonnet: Personalized prompts and responses (~$0.02 per entry)
- Claude Haiku: Theme detection and sentiment (~$0.0002 per entry)

**Why Claude over GPT for journaling:**
- More empathetic and nuanced
- Better at referencing specific memorial content
- Natural conversational tone
- **Cheaper** (~$0.02 vs ~$0.05 per response)
- **User validated:** "Claude is so much more in tune respectfully"

---

## Cost Analysis

### Mobile App Economics

**Per active daily user per month:**
- Daily prompt generation (Claude Sonnet): $0.06
- Journal entry analysis (Claude Haiku): $0.004
- AI responses (Claude Sonnet): $0.40
- Push notifications (Firebase): $0
- **Total: ~$0.50/month per active user**

**At scale (Month 6 target):**
- 333 paying customers
- 50% download app = 165 users
- 50% use daily = 83 active users
- **Monthly AI cost: ~$40**
- **Annual cost per daily user: ~$6**

**Impact on margins:**
- Memorial revenue: $49
- Memorial COGS: $2.13
- App cost (first year): $6
- **Net profit: $40.87 (83% margin)**

**Still excellent margins even with free app.**

### Pricing Strategy

**Launch FREE with memorial purchase**

**Why:**
1. Margins can absorb it (80%+ even with app)
2. Engagement drives growth (daily users = advocates)
3. Data is valuable (what works in grief support)
4. Easy to add premium later if needed

**Cost controls:**
- Rate limit: 5 entries/day max
- Response cap: 300 tokens
- Memorial context cached
- Decision trigger: If costs >$200/month, introduce premium tier

**Potential premium tier (if needed):**
- Free: 1 entry/day, basic AI responses
- Premium ($2.99/mo): Unlimited entries, advanced prompts, voice-to-text, PDF export

---

## Technical Implementation

### Mobile Stack

- **Framework:** React Native (iOS + Android from single codebase)
- **Push Notifications:** Firebase Cloud Messaging (free tier)
- **AI:** Direct calls to Anthropic API (Claude Sonnet/Haiku)
- **Sync:** Real-time with Supabase backend
- **Local Storage:** AsyncStorage for offline journaling

### New Database Tables

```sql
journal_entries
- id, memorial_id, user_id
- entry_date, entry_text, voice_recording_url
- attached_photo_urls, attached_video_urls
- ai_detected_themes (array)
- ai_response_text
- sentiment_score
- related_memorial_content_ids
- is_private (default: true)
- added_to_memorial (default: false)

journal_themes
- id, memorial_id
- theme_name, frequency_count
- first_mentioned, last_mentioned
- ai_suggested_resources

notification_settings
- id, user_id, memorial_id
- morning_time, evening_time
- enabled, frequency

journal_streaks
- id, user_id, memorial_id
- current_streak_days
- longest_streak_days
```

---

## Updated Roadmap

### Months 1-3: Web Only (No Change from v3.2)
Launch web memorial, validate core concept

### Months 2-3: Mobile App Development (NEW)
- React Native setup
- Firebase push notifications
- AI grief journaling feature
- iOS TestFlight beta

### Months 4-6: Mobile Launch (NEW)
- **Month 4:** Full iOS launch + physical products
- **Month 5:** Android launch + digital frame integration
- **Month 6:** Community stories + premium tier testing

---

## Success Metrics (Mobile-Specific)

### Adoption
- 50% of memorial creators download app
- 50% of downloads create ≥1 journal entry
- 30% become daily active users (5+ days/week)

### Engagement
- Average 10 journal entries per user per month
- 70% of entries receive AI response
- Average 3-minute session time
- 60% enable push notifications

### Retention
- 60% of app users still active after 30 days
- 40% still active after 90 days
- Average streak: 7+ consecutive days

### Quality Indicators
- NPS score 70+ for app
- <5% disable notifications within first week
- Theme detection accuracy: 80%+

### Business Impact
- App users 2x more likely to recommend PetMemorial
- App users 30%+ higher memory wall engagement
- App users 40%+ more likely to purchase physical products

---

## Competitive Advantage

### Why PetMemorial Beats Generic Journaling Apps

| Feature | Apple Journal | PetMemorial |
|---------|---------------|-------------|
| Knows your pet | ✗ | ✓ Ingests memorial content |
| Personalized prompts | ✗ Generic | ✓ References habits, memories |
| Connects entries | ✗ No context | ✓ Tracks themes over time |
| AI responses | ✗ None | ✓ Pet-aware (Claude Sonnet) |
| Memorial integration | N/A | ✓ Journal → memorial content |
| Grief-specific | ✗ No | ✓ Built for pet loss |

**User validation:** "There aren't prompts about her and it doesn't know HER."

---

## Risks & Mitigation (New for v3.3)

### Mobile App Development Risk
**Risk:** Building app delays web launch or divides focus

**Mitigation:**
- Launch web FIRST (validate core concept)
- React Native shares logic with Next.js
- Can hire contractor if needed

### AI Cost Risk
**Risk:** Daily journaling could spike costs beyond projections

**Mitigation:**
- Rate limits (5 entries/day)
- Response caps (300 tokens)
- Context caching
- Current margins (80%+) absorb projected costs
- Premium tier if costs >$200/month

### Generic AI Risk
**Risk:** AI responses feel hollow despite memorial context

**Mitigation:**
- Use Claude Sonnet (validated as more empathetic)
- Extensive prompt engineering
- TestFlight beta validates quality with real users
- Continuous improvement from feedback
- Flag generic responses, retrain

---

## Key Differences: v3.2 vs v3.3

| Aspect | v3.2 | v3.3 |
|--------|------|------|
| **Product Scope** | Web memorial only | Web + mobile app |
| **Journaling** | Not addressed | Core mobile feature |
| **Daily Engagement** | Anniversary prompts only | Daily check-ins + journaling |
| **AI Models** | GPT-4o for tribute (incorrect) | Claude Haiku for tribute (corrected) |
| **Ongoing Support** | "Place to return to" concept | Active daily grief companion |
| **Margins** | 95%+ (web only) | 83%+ (including app costs) |
| **Positioning** | Memorial as destination | Memorial + daily companion |

---

## Why This Matters

The mobile app addresses an **acute grief need discovered on Day 2:**

Users are already journaling, but generic apps fail because:
1. They don't know the pet's story
2. Prompts are generic
3. Entries are disconnected
4. No AI responses
5. Can't integrate with memorial

**PetMemorial solves all of this** by connecting the memorial (permanent destination) with daily journaling (ongoing companion).

The memorial knows Skylar. The journal references Skylar. The AI talks about Skylar specifically. It's not generic grief support—it's personalized to THIS loss, THIS relationship, THIS pet.

**User validation:** Already using Apple Journal on Day 2, but frustrated with limitations. This is a real, immediate need.

---

## Next Steps

1. **Immediate:** Finalize web MVP (on track for Weeks 1-6)
2. **Month 2:** Begin React Native setup
3. **Month 3:** Build AI journaling feature, TestFlight beta
4. **Month 4:** iOS launch with 10+ real user interviews
5. **Month 5:** Android development + feature refinement
6. **Month 6:** Full launch both platforms

---

**Document prepared:** January 30, 2026  
**Changes based on:** Day 2 user research + mobile app discussion  
**User validation:** "This would be amazing"
