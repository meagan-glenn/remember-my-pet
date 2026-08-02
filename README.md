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
| AI | Claude (Anthropic) for tributes, chat, photo captions, and vision tags |
| Video | FFmpeg (server-side compilation) |
| Email | Resend |
| Hosting | Vercel |

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
