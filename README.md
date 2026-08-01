# RememberMyPet.ai

A free, AI-assisted place to build a lasting memorial for a pet you've lost —
photos, an AI-written tribute in your voice, a video reel, and a memory wall
where friends and family can add their own stories.

**Live site: [remembermypet.ai](https://remembermypet.ai)**

## What it does

- **Memorial pages** — each pet gets a permanent page at
  `remembermypet.ai/petname-lastname-year`, designed as "a room where they
  still live": an ambient hero (video or Ken Burns photo), a masonry wall of
  photos and memories, and the tribute as editorial prose.
- **AI tribute chat** — a conversation (Claude, Anthropic) that draws out
  specific memories and writes a tribute in the owner's voice. No generic
  grief clichés.
- **Decision support** — for owners weighing or second-guessing end-of-life
  decisions. Asks about the specific fear or regret first; never leads with
  generic reassurance. Client-side crisis detection surfaces the 988 Lifeline
  without logging anything.
- **Memory wall** — visitors contribute photos and stories; the owner
  moderates everything before it appears.
- **Video reel** — upload clips, trim them in the browser, and compile a
  reel server-side with FFmpeg.
- **Light a candle** — a quiet, one-per-person reaction.
- **No account needed to start** — the entire memorial can be built before
  signing in; auth is only required to save and publish.

Everything is free. There are no payments, subscriptions, or upsells anywhere
in the product.

## Design principles

The product is built for people who are grieving, which drives some hard
rules: no countdown timers, pop-ups, or urgency tactics; memorials are
private until the owner deliberately shares them; empty states are
present-tense ("A place is being made for Rusty"), never absence-framed; and
every ambient animation respects `prefers-reduced-motion`. User content is
never used to train AI models.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS, shadcn/ui, Framer Motion |
| Database, storage, auth | Supabase (PostgreSQL + RLS, Storage, Google OAuth + magic links) |
| AI | Claude (Anthropic) for tributes, chat, photo captions, and vision tags |
| Video | FFmpeg (server-side compilation) |
| Email | Resend |
| Hosting | Vercel |

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your own keys
npm run dev                  # http://localhost:3000
```

You'll need a Supabase project (apply the SQL files in `supabase/migrations/`
in order via the SQL editor) and an Anthropic API key. `RESEND_API_KEY` is
optional — email notifications are skipped without it.

```bash
npm run build   # production build
npm run lint    # ESLint
```

## License

The source is public to read, but this is a running product, not an
open-source project — all rights reserved. Please don't redeploy it as your
own service.

---

Built with love by Meagan, for Skylar. 🐾
