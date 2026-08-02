# RememberMyPet.ai

I lost my dog of 13 years. Then I built this.

RememberMyPet.ai is a free place to make a memorial for a pet you've lost.
The photos. The words you couldn't find at first. A tribute written with you,
not for you. And a wall where everyone who loved them can leave their own
memories.

**Live: [remembermypet.ai](https://remembermypet.ai)**

## Why

Skylar was a husky. She was my best friend for 13 and a half years. Losing
her stopped my whole world — and when I went looking for somewhere to put
that grief, nothing fit. Journaling apps couldn't acknowledge what happened.
The world doesn't always give you permission to grieve a pet the way you'd
grieve a person, even though the grief is proportional to the love.

I process things by trying to understand them. So I interviewed people about
pet loss — starting with myself — and built the thing I needed. A place that
says: this mattered. She mattered.

I wrote the whole story here:
[her name was skylar](https://meaganglenn.beehiiv.com/p/her-name-was-skylar).

## What it does

- A memorial page for each pet, at a permanent URL like
  `remembermypet.ai/skylar-glenn-2026`. Photos, a tribute, a video reel,
  candles. It stays up.
- An AI (Claude) that helps you find the words through conversation — like a
  friend at the kitchen table, not a form to fill out. No grief clichés.
- Decision support, for the people second-guessing an end-of-life decision.
  It asks what's actually weighing on you before it says anything. If someone
  is in crisis, it points to the 988 Lifeline and doesn't log a thing.
- A memory wall where friends and family add their own photos and stories.
  You approve everything before it appears.
- Light a candle. One per person. That's it.
- You can build the entire memorial before signing in. Auth only shows up
  when you're ready to save.

Everything is free. No subscriptions, no upsells, no "premium" tier. Grief
is not a funnel.

## How it's built

This is a product for people on their worst days, so some rules are
non-negotiable: no countdown timers, no urgency tactics, no pop-ups.
Memorials are private until you decide otherwise. Empty states are
present-tense ("A place is being made for Rusty") — never "No tribute yet."
Every ambient animation respects `prefers-reduced-motion`. And nothing you
write is ever used to train AI models.

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

The site is done. It does what it promises, and memorials stay up. But if it
ever gets a second life, these are the ideas I'd reach for first:

- **Grief journaling** — a private journal that knows who your pet was, not
  a generic prompts app
- **A mobile companion** — daily check-ins, voice-to-text, entries you can
  choose to add to the memorial
- **Anniversary milestones** — a gentle note on the hard days. Never a
  streak, never a badge.
- **Community stories** — a moderated space for the longer stories that
  don't fit on a memorial page

If one of these matters to you — or the site helped you — tell me:
[meag.glenn@gmail.com](mailto:meag.glenn@gmail.com).

## Running it locally

```bash
npm install
cp .env.example .env.local   # fill in your own keys
npm run dev                  # http://localhost:3000
```

You'll need a Supabase project (apply the SQL files in `supabase/migrations/`
in order via the SQL editor) and an Anthropic API key. `RESEND_API_KEY` is
optional — email notifications are skipped without it.

## License

The code is public so you can read it, not so you can redeploy it. All
rights reserved. If you want to build something like this, build your own —
and build it kind.

---

Skylar would have been extremely unimpressed by all of this, and would have
just wanted her belly rubbed. 🐾
