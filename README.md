# RememberMyPet.ai

A free, AI-assisted place to build a lasting memorial for a pet you've lost —
photos, an AI-written tribute in your voice, a video reel, and a memory wall
where friends and family can add their own stories.

**Live site: [remembermypet.ai](https://remembermypet.ai)**

## Why this exists

Skylar was my dog for 13 years — through cross-country moves, hard seasons,
and everything in between. When bone cancer took her, I went looking for a
place to put the grief and found that nothing out there was built for this:
journaling apps couldn't acknowledge the loss, and pet grief rarely gets the
permission other grief does, even though it's proportional to the love.

So I did what product people do — I interviewed people about pet loss,
starting with myself, and built the thing I needed. The north star is
"move on, but not forget": a place that holds the good memories without
rushing anyone through the sad ones.

I wrote the full story here:
[her name was skylar](https://meaganglenn.beehiiv.com/p/her-name-was-skylar).

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

## Where it could go

RememberMyPet is complete and live. Memorials stay up, the site does its job,
and it doesn't need more features to keep its promise. But if it ever gets a
second season, these are the ideas that made the shortlist:

- **Grief journaling** — a private, pet-aware journal that knows who Skylar
  was, not a generic prompts app
- **A mobile companion app** — daily check-ins and voice-to-text journaling,
  with entries you can choose to add to the memorial
- **Anniversary milestones** — a gentle note on the hard days (30 days, six
  months, their birthday), never a notification streak
- **Community stories** — a moderated space for people to share longer
  pet-loss stories beyond their own memorial

If one of these resonates — or the site helped you — I'd love to hear about
it: [team@remembermypet.ai](mailto:team@remembermypet.ai).

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
