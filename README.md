# RememberMyPet.ai

I lost my dog of 13 years, and then I built this.

RememberMyPet.ai is a free place to make a memorial for a pet you've lost.
You can gather up the photos, find the words that wouldn't come at first,
and open a memory wall where everyone who loved them can leave their own
stories.

**Live at [remembermypet.ai](https://remembermypet.ai)**

## Why

Skylar was a husky, and she was my best friend for 13 and a half years.
Losing her stopped my whole world. When I went looking for somewhere to put
that grief, nothing really fit. Journaling apps couldn't acknowledge what had
happened, and the world doesn't always give you permission to grieve a pet
the way you'd grieve a person, even though the grief is proportional to the
love.

I process things by trying to understand them, so I started interviewing
people about pet loss, beginning with myself, and then built the thing I
needed: a place that says this mattered, she mattered.

I wrote the whole story here:
[her name was skylar](https://meaganglenn.beehiiv.com/p/her-name-was-skylar).

## What it does

- Every pet gets a memorial page at a permanent URL like
  `remembermypet.ai/skylar-glenn-2026`, with photos, a tribute, a video
  reel, and candles. It stays up for good.
- An AI helper (Claude) finds the words with you through conversation, more
  like a friend at the kitchen table than a form to fill out, and without
  the usual grief cliches.
- Decision support is there for anyone second-guessing an end-of-life
  decision. It asks what's actually weighing on you before it says anything,
  and if someone is in crisis it points to the 988 Lifeline without logging
  a thing.
- The memory wall lets friends and family add their own photos and stories,
  and you approve everything before it appears.
- Visitors can light a candle, one per person, as a quiet way of saying they
  were here.
- You can build the whole memorial before ever signing in. An account only
  comes up when you're ready to save and publish.

Everything is free. There are no subscriptions, no upsells, and no premium
tier, because grief shouldn't be a sales funnel.

## How it's built

This is a product for people on their worst days, so a few rules are
non-negotiable: no countdown timers, no urgency tactics, and no pop-ups.
Memorials stay private until you decide otherwise. Empty states are written
in the present tense ("A place is being made for Rusty") instead of pointing
out what's missing. Every ambient animation respects
`prefers-reduced-motion`, and nothing you write is ever used to train AI
models.

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS, shadcn/ui, Framer Motion |
| Database, storage, auth | Supabase (PostgreSQL + RLS, Storage, Google OAuth + magic links) |
| AI | Claude (Anthropic): Sonnet 5 and Haiku 4.5, split by job (see below) |
| Video | FFmpeg (server-side compilation) |
| Email | Resend |
| Hosting | Vercel |

## How the AI works

There are five places the product calls a model, and they don't all use the
same one. The split is deliberate: the two calls where the *writing* is the
product get the stronger model, and the three high-frequency, short-reply
calls get the fast one.

| Where | Model | Why this one |
|-------|-------|--------------|
| Tribute generation (`/api/tribute`) | Claude Sonnet 5 | One call per memorial, 250 to 400 words, and it's the thing people read on the page for years. Emotional register matters more than latency here. |
| Decision support (`/api/tribute/support`) | Claude Sonnet 5 | Low volume, capped at 3 requests a minute, and the person on the other end is often at their lowest. Worth the better model. |
| Tribute chat (`/api/tribute/chat`) | Claude Haiku 4.5 | The back-and-forth interview. Replies are 1 to 2 sentences plus one question, up to 20 turns, and it has to feel like a conversation, so speed wins. |
| Homepage chat (`/api/homepage/chat`) | Claude Haiku 4.5 | A 2 to 3 exchange teaser on the landing page, 150 tokens max. Cheap and fast on purpose. |
| Photo captions + tags (`/api/caption`) | Claude Haiku 4.5 (vision) | Runs on every upload, returns a short caption plus structured tags as JSON. Haiku handles images and this volume without making the upload step feel slow. |

**How it got here.** The first tribute prompt ran on GPT-4o for about a day in
January 2026 before moving to Claude Haiku. Photo captions launched on Gemini
2.5 Flash Lite and moved to Haiku in February so everything sat behind one
API key and one prompt style. Everything stayed on Haiku until August 2026,
when I moved the tribute and decision support calls up to Sonnet 5, because
those are the two places where a slightly better sentence is worth a slightly
slower response. Chat, homepage, and captions stayed on Haiku.

**Two small Sonnet 5 details.** Sonnet 5 uses extended thinking by default,
and `max_tokens` covers thinking and text together, so both Sonnet routes set
`thinking: { type: "disabled" }`. That keeps the whole budget on the words the
person actually sees and keeps replies from coming back truncated. The tribute
cap also went from 600 to 1024 tokens for the newer tokenizer.

**The prompts do most of the work.** The model choice matters less than what
it's told. A few rules show up in every prompt:

- *Friend at the kitchen table, not a form.* React to the specific thing the
  person just said, match their emotional register (light if they're light,
  gentle if they're tender), then ask one question. Never two.
- *A banned-phrase list.* No "thank you for sharing," "what a special bond,"
  "crossed the rainbow bridge," "forever in our hearts," "healing journey,"
  "processing," "holding space." If a grief counselor or a sympathy card would
  say it, the model can't.
- *Never invent details.* No eye color, coat color, which door, which room,
  or names of people unless the owner said them. Getting a detail wrong on a
  memorial breaks trust in a way that's hard to get back.
- *Quote the owner.* The tribute is built from their words and phrases where
  possible. "She'd stare at me until I caved" beats "she was persistent."
- *Pronoun-aware.* Every prompt gets he/she/they from the pet's gender field,
  so a memorial never misgenders someone's dog.
- *Guilt gets leaned into, not redirected.* If someone brings up a what-if
  about timing or treatment mid-chat, the model names it, asks one follow-up,
  offers a short reframing, and then guides back to a happy memory. That
  exchange is summarized in a hidden `[SUPPORT_CONTEXT]` marker that flows
  into tribute generation, so the final tribute can quietly honor the hard
  part without dwelling on it.
- *The standalone support page is different on purpose.* That prompt is told
  *not* to reframe, find silver linings, or name emotions. Just reflect back
  what happened in plain language, one or two sentences. Some people need to
  say the thing out loud before anyone responds to it.
- *The chat knows when to stop.* It emits `[READY_FOR_TRIBUTE]` only after it
  has 4 or so substantive stories across *different* topics, and it's told to
  move on after one follow-up so it doesn't ask three questions about walks.

**Guardrails.** Crisis language is detected client-side with a small regex
list, and it shows a non-blocking 988 Lifeline banner. Nothing is logged or
sent anywhere. Every user string that lands in a prompt goes through a
sanitizer that strips control characters, code fences, and HTML-ish tags, and
every prompt ends with an instruction to ignore embedded overrides. Each AI
route is rate-limited per user or IP (tribute 5/min, chat 10/min, support
3/min, homepage 6/min, captions 20/min). Nothing anyone writes is used to
train models.

**What it deliberately isn't.** No fine-tuning, no retrieval, no agent loops,
and no memory beyond the conversation in front of it (the homepage chat is
handed to the tribute chat so nobody has to repeat themselves, but that's the
extent of it). Five call sites and two models is the whole AI layer, and
that's about right for a product that mostly needs to listen well.

## Where it could go

The site is done, and it does what it promises. But if it ever gets a second
life, these are the ideas I'd reach for first:

- **Grief journaling**: a private journal that knows who your pet was,
  instead of serving generic prompts
- **A mobile companion**: daily check-ins, voice-to-text journaling, and
  entries you can choose to add to the memorial
- **Anniversary milestones**: a gentle note on the hard days, never a
  notification streak
- **Community stories**: a moderated space for the longer stories that
  don't fit on a memorial page

If one of these matters to you, or if the site helped you, I'd love to hear
about it: [meag.glenn@gmail.com](mailto:meag.glenn@gmail.com).

## Running it locally

```bash
npm install
cp .env.example .env.local   # fill in your own keys
npm run dev                  # http://localhost:3000
```

You'll need a Supabase project (apply the SQL files in `supabase/migrations/`
in order via the SQL editor) and an Anthropic API key. `RESEND_API_KEY` is
optional, and email notifications are simply skipped without it.

## License

The source is public so you can read it, but this is a running product
rather than an open-source project, so all rights are reserved. If you want
to build something like this, I'd love for you to build your own version.
Just make it kind.

---

Skylar would have been extremely unimpressed by all of this and would have
just wanted her belly rubbed. 🐾
