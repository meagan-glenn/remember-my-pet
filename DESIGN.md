# RememberMyPet.ai — Design System

## Emotional Intent

Every design decision serves one goal: make a grieving person feel safe enough to stay. The UI should feel warm, unhurried, and trustworthy — never clinical, never salesy, never generic.

### Mapping SOUL.md to Design

| Soul principle | Design expression |
|----------------|-------------------|
| "Sit with you, listen first" | Narrow containers (`max-w-lg`), generous whitespace, no visual clutter in support/chat flows |
| "Not rush to fix what can't be fixed" | No countdown timers, no urgency copy, optional auth, "Take your time" language |
| "Permission to grieve" | Warm amber palette (candlelight, not corporate blue), soft rounded corners, serif headings that feel personal |
| "Kindness over honesty" | Crisis banner in calming blue (not alarming red), gentle error copy ("Don't worry — your work is saved") |
| "Ten years from now... feel the good times" | Memorial pages are celebratory and expansive (`max-w-6xl`), while creation flows are intimate and quiet |
| "Not punished for still being sad" | No progress bars that imply you're behind, no "complete your memorial" nudges, no gamification |

### Resolved (from SOUL.md review)

**User chat bubbles softened.** In grief-context flows (support, tribute chat), user bubbles changed from saturated `amber-600 text-white` to gentle `amber-100 text-amber-900`. The user's vulnerable words should feel *received*, not highlighted. The homepage chat keeps bolder bubbles since it's a product demo context.

**Button energy now matches emotional register.** In grief-context pages (support, tribute chat), primary action buttons changed from solid `amber-600` to outline style (`border-amber-300 text-amber-700`). The "Generate Tribute" button uses softened `amber-500` since it's a milestone moment. Homepage and memorial pages keep bold `amber-600` buttons where the energy is celebratory.

**Dark mode activated as default.** `next-themes` wired up with `defaultTheme="dark"`. Dark mode CSS variables rethemed from cold Shadcn neutrals to warm amber-tinted darks (OKLCH hue 60-80) — like a dimly lit room, not a code editor. Light mode available via sun/moon toggle in header. All core surfaces (page, header, footer, cards, chat bubbles, inputs, buttons) have `dark:` variants.

---

## Color

### Primary Palette: Amber

Amber was chosen over blue (clinical), green (growth/forward), or purple (spiritual) because it reads as warmth, candlelight, comfort. It's the color of golden hour — the good memories.

| Token | Tailwind | Usage |
|-------|----------|-------|
| Primary | `amber-600` | Buttons, CTAs, active states, offline banner |
| Primary hover | `amber-700` | Button hover, link hover |
| Primary light | `amber-50` | AI message bubbles, card highlights, drop zone active |
| Primary subtle | `amber-100` | Card borders, icon backgrounds, header border |
| Primary border | `amber-200` | Input borders (hero), outline button borders, auth banner |
| Primary text | `amber-700` | Outline button text, link text |

### Neutral Scale

| Token | Tailwind | Usage |
|-------|----------|-------|
| Heading | `gray-900` | Page titles, card titles |
| Body | `gray-700` | Body text, AI messages in tribute chat |
| Secondary | `gray-600` | Nav links, labels |
| Muted | `gray-500` | Descriptions, subtitles |
| Placeholder | `gray-400` | Placeholder text, trust signal icons, timestamps |
| Faint | `gray-200` | Default input borders, dividers |
| Surface | `gray-100` | AI messages (tribute chat), photo upload bg |
| Light | `gray-50` | Drop zone resting state |

### Semantic Colors

| Token | Tailwind | Usage |
|-------|----------|-------|
| Crisis | `blue-50` / `blue-200` / `blue-800` | 988 Lifeline banner (calming, not alarming) |
| Error | `red-500` | Error messages |
| Error small | `red-600` | Auth error text at xs size |
| Success | `green-600` | Save confirmation checkmark |

### Backgrounds

| Surface | Light | Dark |
|---------|-------|------|
| Page gradient | `from-amber-50/60 via-orange-50/30 to-white` | `from-gray-950 via-gray-950 to-gray-950` |
| Header | `bg-white/70 backdrop-blur-sm` | `bg-gray-950/70 backdrop-blur-sm` |
| Footer | `bg-white/70` | `bg-gray-950/70` |
| Tinted section | `bg-amber-50/40` | `bg-gray-900/50` |
| Cards | `bg-white/60` | `bg-gray-900/40` |
| Chat bubbles (AI) | `bg-amber-50/80` | `bg-amber-950/30` |
| Chat bubbles (user, grief) | `bg-amber-100` | `bg-amber-500/15` |
| Inputs | `bg-white border-gray-200` | `bg-gray-900 border-amber-800/30` |

---

## Dark Mode

Dark is the default theme. Users on mobile at 2am, grieving, should never hit a bright white screen. A light mode toggle (sun icon) is available in the header.

### Implementation

- **Library**: `next-themes` with `attribute="class"` and `defaultTheme="dark"`
- **CSS**: `@custom-variant dark (&:is(.dark *))` in Tailwind v4 CSS-first config
- **Toggle**: Sun/Moon icon button in header, client component (`ThemeToggle`)
- **Hydration**: `suppressHydrationWarning` on `<html>` element

### Dark Palette Philosophy

The dark theme uses warm, amber-tinted OKLCH values — not cold neutrals. The hue shifts toward 60-80 (warm brown/amber) rather than 0 (pure gray). This preserves the "candlelight" feeling described in SOUL.md even in dark mode.

| Token | OKLCH Value | Feel |
|-------|-------------|------|
| Background | `oklch(0.16 0.01 60)` | Warm charcoal, not black |
| Foreground | `oklch(0.93 0.01 80)` | Cream, not stark white |
| Card | `oklch(0.20 0.012 60)` | Slightly lifted from background |
| Muted foreground | `oklch(0.65 0.02 70)` | Readable secondary text |
| Border | `oklch(0.90 0.02 70 / 12%)` | Barely visible warm edge |

### Dark Variant Pattern

All dark overrides use Tailwind `dark:` prefix. Common patterns:

| Light | Dark |
|-------|------|
| `text-gray-900` | `dark:text-amber-50` |
| `text-gray-500` | `dark:text-gray-400` |
| `bg-amber-600` (buttons) | `dark:bg-amber-500 dark:text-gray-900` |
| `border-amber-100` | `dark:border-amber-900/30` |
| `hover:bg-amber-50` | `dark:hover:bg-amber-900/20` |

---

## Typography

### Fonts

| Role | Font | CSS Variable | Usage |
|------|------|-------------|-------|
| Display | Playfair Display | `--font-playfair` | Headings, logo, blockquotes, pet names on memorials |
| Body | Geist | `--font-geist-sans` | Everything else — UI text, labels, descriptions, chat |
| Mono | Geist Mono | `--font-geist-mono` | Not actively used in UI |

### Scale

| Level | Classes | Example |
|-------|---------|---------|
| Hero (marketing) | `font-serif text-4xl font-medium tracking-tight md:text-5xl` | Homepage, wizard preview — "Remember the joy, not just how it ended." |
| Hero (memorial commemorative) | `font-serif text-5xl font-normal leading-[1.05] tracking-tight sm:text-6xl md:text-7xl` | Public memorial page pet name. Playfair at 400 is warmer than 500 at display sizes; tight leading makes it feel chosen, not templated. |
| Memorial dates | `font-serif text-base font-light tracking-[0.15em] sm:text-lg` | Year range under the memorial h1 — "2012 — 2024" / "Born 2012" |
| Page heading | `font-serif text-3xl font-medium md:text-4xl` | "Everything you need to honor their memory" |
| Section heading | `font-serif text-2xl font-medium` | "You don't have to be ready yet" |
| Card title | `font-serif text-xl font-medium` or `text-lg font-medium` | "Tell me about {petName}" |
| Tribute prose (memorial) | `font-serif text-[18px] leading-[1.75] sm:text-[19px]` | Public memorial tribute, paragraphs split on `\n\n+` with `whitespace-pre-line`. Editorial letter, not a card. |
| Body | `text-base leading-relaxed` | Descriptions, non-memorial body text |
| UI text | `text-sm` | Chat messages, form labels, buttons |
| Caption | `text-xs` | Timestamps, badges, helper text |

### Weight Rules

- `font-medium` (500) — All serif headings. Playfair Display is already ornate; semibold makes it heavy.
- `font-semibold` (600) — Sans-serif headings in wizard steps (e.g., "Photos of {petName}"). Also footer section headers, logo.
- `font-normal` (400) — Body text, descriptions.

---

## Spacing

### Page Layout

| Element | Value | Notes |
|---------|-------|-------|
| Page horizontal padding | `px-4` | Mobile-first, consistent everywhere |
| Content max-width | `max-w-lg` (wizard), `max-w-2xl` (dashboard), `max-w-4xl` (feed/features), `max-w-5xl` (header/footer) | Narrower = more intimate |
| Section vertical padding | `py-8 sm:py-12` | Standard for below-fold sections |
| Hero top padding | `pt-10 md:pt-14` | Breathing room above fold |

### Vertical Rhythm

| Gap | Tailwind | Usage |
|-----|----------|-------|
| 1.5rem | `space-y-6` | Between major sections (header → chat → buttons) |
| 1rem | `space-y-4` | Between subsections, form field groups |
| 0.75rem | `space-y-3` | Between related items (memorial cards, form fields) |
| 0.5rem | `space-y-2` | Between tight pairs (title + subtitle) |

---

## Components

### Buttons

All buttons use the Shadcn `Button` component with CVA variants. Custom amber styling is applied via className overrides.

| Type | Classes | Height | Context |
|------|---------|--------|---------|
| Primary CTA | `bg-amber-600 hover:bg-amber-700 rounded-full` | `h-12` | Hero submit, save memorial, memorial pages |
| Grief-context CTA | `border border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent` | `h-11` | "Share" in support, "Send" in tribute chat |
| Milestone CTA | `bg-amber-500 hover:bg-amber-600` | `h-12` | "Write My Tribute" — softer than primary, still a clear action |
| Outline | `border-amber-300 text-amber-700 hover:bg-amber-50` | `h-11` | "I'm ready to continue", "Revise tribute" |
| Ghost | `variant="ghost" text-gray-600` | `h-8` (sm) | Nav links, dismiss, "Maybe later" |
| Nav CTA | `bg-amber-600 hover:bg-amber-700 rounded-full` | `h-8` (sm) | "Create a Tribute" in header |
| Inline link | `text-amber-600 hover:text-amber-700 underline underline-offset-2` | — | "Talk it through first", footer tip |

### Inputs

| Context | Border | Radius | Height | Focus |
|---------|--------|--------|--------|-------|
| Hero (name) | `border-amber-200` | `rounded-full` | `h-12` | `focus:border-amber-400 focus:ring-1 focus:ring-amber-400` |
| Forms (wizard) | default `border-input` | `rounded-md` | `h-12` | Shadcn default ring |
| Chat input (homepage) | `border-amber-200` | `rounded-2xl` | auto (rows=1) | `focus:border-amber-400 focus:ring-1 focus:ring-amber-400` |
| Support textarea | `border-gray-200` | `rounded-xl` | auto (rows=3-4) | `focus:border-amber-400 focus:ring-1 focus:ring-amber-400` |
| Tribute chat | `border-gray-200` | `rounded-xl` | auto (rows=1) | `focus:border-amber-400 focus:ring-1 focus:ring-amber-400` |
| Tribute refinement | `border-gray-200` | `rounded-xl` | auto (rows=3) | `focus:border-amber-400 focus:ring-1 focus:ring-amber-400` |

### Chat Bubbles

| Sender | Context | Background | Text | Alignment |
|--------|---------|-----------|------|-----------|
| User | Homepage (demo) | `bg-amber-600` | `text-white` | Right (`justify-end`) |
| User | Support/tribute (grief) | `bg-amber-100` | `text-amber-900` | Right (`justify-end`) |
| AI | All contexts | `bg-amber-50/80` | `text-gray-700` | Left (`justify-start`) |

All bubbles: `rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed`

### Cards

| Type | Classes |
|------|---------|
| Feature card | `rounded-2xl border border-amber-100 bg-white/60 p-6` |
| Conversation card | `rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm` |
| Tribute display (wizard preview only) | `rounded-2xl border-l-4 border-l-amber-700 border border-amber-100 bg-amber-50/50 p-6 shadow-sm` — **only used in `step-preview.tsx`**. The live memorial page renders tribute as editorial prose with no card chrome (see Memorial Page section). |
| Memory card (memorial wall) | `rounded-2xl border border-amber-200/50 bg-amber-50/60 p-5 shadow-sm backdrop-blur-sm` with a 32px `bg-amber-200/70` avatar containing the contributor's first initial, and content in `font-serif text-[17px] leading-[1.7]`. Warmer than the neutral quote card pattern. |
| Auth banner | `rounded-xl border border-amber-200 bg-amber-50 p-4` |
| Pet details editor | `rounded-2xl border border-gray-200 bg-white p-5` |
| CTA card (demo) | `rounded-2xl border border-amber-200 bg-amber-50/50 p-8` |
| Keepsake card | `rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm` |
| Shadcn Card | `rounded-xl border shadow-sm py-6 bg-card` |

### Icon Badges

| Size | Classes | Context |
|------|---------|---------|
| Large | `h-16 w-16 rounded-full bg-amber-100` with icon `h-8 w-8` | Hero PawPrint |
| Medium | `h-14 w-14 rounded-full bg-amber-100` with icon `h-7 w-7` | Support page PawPrint |
| Standard | `h-10 w-10 rounded-full bg-amber-50` with icon `h-5 w-5` | Feature cards |
| Small | `h-5 w-5` | Header logo, footer logo |

---

## Animation

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Hero entrance | `opacity 0→1, y 20→0` | 0.6s | easeOut |
| Icon scale-in | `scale 0.8→1, opacity 0→1` | 0.5s | default, 0.1s delay |
| Chat messages | `opacity 0→1, y 8→0` | 0.4s | default |
| Feed cards | `opacity 0→1, y 12→0` | 0.4s | stagger i*0.05s |
| Wall cards (memorial) | `opacity 0→1` (**no y-translate** — CSS columns + transform bug) | 0.35s | stagger `min(i * 0.04, 0.6)`, motion-safe only |
| Memorial hero Ken Burns | `ken-burns` keyframe (6% scale + ±0.5% translate on wrapper div) | 24s loop | ease-in-out, motion-safe only |
| Memorial hero candle flicker | `candle-flicker` keyframe (2–8% opacity/scale deltas, subtle translateY) | 2.4s loop | ease-in-out, motion-safe only |
| Memorial hero candle glow | `candle-glow` keyframe (opacity 0.85→1, scale 1→1.05) | 3s loop | ease-in-out, motion-safe only |
| Typing dots | `opacity 0.3→1→0.3` | 1s loop | stagger 0.2s |
| AI caption | `animate-pulse bg-amber-50` | — | while generating |
| Spinner | `animate-spin` + `border-2 border-amber-500 border-t-transparent` | — | loading states |

Memorial-page keyframes live in `src/app/globals.css`. All three (`ken-burns`, `candle-flicker`, `candle-glow`) are designed for **ambient noticing, not attention-grabbing** — deltas are deliberately tiny (2–8%). If any of them start to feel strobing or jittery during QA, pull the deltas down further before expanding them.

---

## Responsive Strategy

Mobile-first. 80% of users create on mobile.

| Breakpoint | Prefix | Key changes |
|------------|--------|-------------|
| < 640px | (default) | Single column, `px-4`, full-width buttons, `text-4xl` hero |
| 640px+ | `sm:` | 2-column grids, `sm:px-6`, `sm:py-12` |
| 768px+ | `md:` | Larger hero text `md:text-5xl`, input text scales `md:text-sm` |
| 1024px+ | `lg:` | 3-column feed grid |

### Container Widths

| Context | Width | Rationale |
|---------|-------|-----------|
| Wizard/support | `max-w-lg` (512px) | Intimate, conversational — one thing at a time |
| Dashboard | `max-w-2xl` (672px) | List view, needs more room |
| Memorial tribute prose | `max-w-2xl` (672px, centered) | Editorial letter — narrow measure keeps grief reading intimate, not wall-of-text |
| Memorial wall (masonry) | `max-w-7xl` (1280px) | Photo wall needs breathing room for 3 columns on desktop; wider than tribute on purpose |
| Memorial empty state | `max-w-xl` (576px, centered) | Present-tense copy block for bare visitor view |
| Feed/features | `max-w-4xl` (896px) | Grid content |
| Header/footer | `max-w-5xl` (1024px) | Navigation frame |

---

## Memorial Page

The public memorial at `/[slug]` is its own design register — more ambient and inhabited than the rest of the app. The goal is "a room where the pet still lives," not a tribute document. Decisions here are research-backed against Day 0–4 grief interviews (`USER_RESEARCH.md`, `PetMemorial_Day2_Interview_Report.md`) and locked in during the phases 1–9 redesign.

### Order of operations

Sensory content comes first; narrative comes second.

1. **Hero** (65-70vh, ambient): video compilation if present, otherwise still image with Ken Burns
2. **Masonry wall**: photos interleaved with memory cards in a single unified grid
3. **Tribute**: editorial prose, narrow measure, no card chrome
4. **Candle section** + memory form + quiet footer

The creator's narrative (tribute) must not come before the visitor's sensory experience (wall). Day 0 research: *"Something I can reference back to and see all those happy memories."*

### Hero media (`src/components/memorial/hero-media.tsx`)

| Mode | Behavior |
|------|----------|
| Normal + video | `<video autoPlay muted loop playsInline preload="metadata">` with poster fallback `<Image>` until `onCanPlay`, unmute button bottom-left, pause on `visibilitychange` |
| Normal + no video | Still image with subtle Ken Burns (6% scale zoom, 24s cycle) on a **wrapper div**, not on the `next/image fill` directly |
| Reduced motion + video | Poster image with a "tap to play" button overlay — no autoplay |
| Reduced motion + no video | Still image, no motion |

Hero dimensions: `h-[65vh] min-h-[500px] max-h-[720px] sm:h-[70vh] sm:min-h-[560px] sm:max-h-[800px]`. Gradient overlay: `from-black/70 via-black/25 to-transparent` for legibility over variable hero content.

Safe-area insets: all three corner controls (unmute bottom-left, candle bottom-right, owner pill top-right) use `max(1rem, env(safe-area-inset-*))` to stay clear of iPhone 14/15 notches and home indicators. Top-left corner is deliberately empty.

### Hero candle (`variant="hero"` in `light-candle.tsx`)

Flame + ambient glow halo, **not** a pill button. Structure: 40×40 icon box containing an absolute-positioned `bg-amber-400/50 blur-xl` halo behind a 28px `Flame` icon, with a `text-[11px] font-light` count label underneath.

- Lit flame: `fill-amber-300 text-amber-400 motion-safe:animate-[candle-flicker_2.4s_ease-in-out_infinite]`
- Lit halo: `opacity-90 motion-safe:animate-[candle-glow_3s_ease-in-out_infinite]`
- Unlit flame: `fill-transparent text-white/50`, halo hidden

Candle only renders for non-owners — owners can't light their own pet's candle. The hero candle is motion-safe-only; reduced-motion users see a steady lit flame with a steady halo.

### Masonry wall (`src/components/memorial-wall/masonry-wall.tsx`)

- Single unified grid: photos, memories, and video cards interleaved via `interleaveWallContent` (no separate "Memories & Stories" section)
- Column count: `columns-1 sm:columns-2 md:columns-3 print:columns-1 print:block`
- **Fade-in is opacity-only, not y-translate.** CSS columns + transform on a `break-inside-avoid` direct child is a known Chrome repaint bug that causes aspect-ratio images to ghost. Opacity-only fade-in sidesteps it.
- Fade-in gated behind `useReducedMotion()`; stagger capped at `Math.min(index * 0.04, 0.6)`
- Memory avatars use a single uppercased first non-whitespace character (`Array.from(name.trim())[0]`, fallback `"?"`). No two-letter initials — avoids bad abbreviations on multi-word or unusual names.

### Empty states — always present-tense

Absence-framing ("No tribute yet", "Be the first to share") is banned on memorial pages. It reinforces the void. Use:

- **Owner, no tribute**: `"{petName}'s tribute is still being written."` (implies an ongoing act, not a void)
- **Visitor, no content**: `"A place is being made for {petName}." / "If you loved {objectPronoun}, share a memory below."`

`objectPronoun` threads through from `memorial.gender` via `getPronouns()` in `src/lib/pronouns.ts` — `him` / `her` / `them`.

### Footer — end of visit, not conversion

No "Create your own memorial" CTA on a live memorial. The footer reads `Created by {name}` + a quiet `Made with love at RememberMyPet.ai`. The acquisition CTA belongs on the directory or visitor-empty state, never on a page someone is visiting to grieve.

### Owner actions

Ellipsis pill top-right of hero (`OwnerActionsMenu`), opens a shadcn `DropdownMenu` with "Edit memorial" and "Invite others". Uses `bg-black/30` over a hero photo, `bg-white/80` over the empty paw-print hero. Never a breadcrumb bar — that's SEO thinking bleeding into emotional UX.

`DropdownMenuItem` → dialog focus handoff requires `e.preventDefault()` + `requestAnimationFrame(() => setOpen(true))` to avoid Radix focus-trap collision. See the comment at `owner-actions-menu.tsx:57`.

### Reduced motion — hard requirement

Every ambient/infinite animation on the memorial page MUST be gated:

| Animation | Gate mechanism |
|-----------|----------------|
| Video autoplay | `useReducedMotion()` → render poster + tap-to-play overlay |
| Ken Burns | `motion-safe:animate-[ken-burns_...]` on wrapper div |
| Candle flicker + glow | `motion-safe:animate-[candle-flicker_...]` / `motion-safe:animate-[candle-glow_...]` |
| `FlameIcon` pulse (section + inline candles) | `useReducedMotion()` inside `FlameIcon`, omits inner infinite motion wrapper |
| Wall card fade-in | `useReducedMotion()` in `WallCardRenderer`, returns early before motion props |

State-change animations (lit/unlit fades, dropdown opens, lightbox transitions) are fine — those are discrete, not ambient.

---

## Accessibility

- **Focus states**: All interactive elements use `focus-visible:ring-ring/50 focus-visible:ring-[3px]` or amber-specific `focus:border-amber-400 focus:ring-1 focus:ring-amber-400`
- **Disabled states**: `disabled:opacity-50 disabled:pointer-events-none`
- **Error states**: `aria-invalid` styling on inputs, red error text below fields
- **Crisis banner**: Non-blocking, dismissible, blue (calming), no data logged
- **Print styles**: Memorial pages have `print:hidden` for UI chrome, `print:block` for footer credit
- **Keyboard**: Enter to submit in chat/support, Shift+Enter for newlines

---

## Known Inconsistencies

### Fixed

These were identified and resolved:

- AI message bubble color — standardized to `bg-amber-50/80 text-gray-700` across both support and tribute chat
- Typing indicator — standardized to `animate-pulse` with amber dots across both components
- Input focus styles — standardized to `focus:border-amber-400 focus:ring-1 focus:ring-amber-400` everywhere
- Heading weights — `font-medium` for all `font-serif` headings, `font-semibold` for `font-sans` headings
- Error boundary button — changed from `stone-800` to `amber-600` to match brand
- User chat bubbles — softened from `amber-600 text-white` to `amber-100 text-amber-900` in grief contexts
- Button energy — grief-context buttons switched to outline style; milestone buttons use `amber-500`
- Dark mode — activated as default with warm amber-tinted OKLCH palette, sun/moon toggle in header

### Acceptable Variance

| Issue | Rationale |
|-------|-----------|
| Hero input `rounded-full` vs form inputs `rounded-md` | Hero is a landing page moment — the pill shape feels inviting. Forms are functional. |
| Chat input `rounded-2xl` vs support textarea `rounded-xl` | Minor visual difference, both feel soft and conversational. |
| Feature cards have no shadow, conversation card has `shadow-sm` | Conversation card needs depth because it has interactive content inside. Feature cards are static. |
| `max-w` varies per section | Intentional — narrower containers feel more intimate for emotional content. |

---

## Design Principles

1. **Warmth over polish** — Amber tones, serif headings, and generous whitespace create comfort. We're not building a SaaS dashboard.
2. **Less is more** — Short copy, 1-2 sentence AI responses, minimal UI chrome. Grief is exhausting; don't make people think.
3. **No pressure** — No countdown timers, no urgency messaging, no pop-ups. Auth is optional. Saving is optional. Everything is at the user's pace.
4. **Mobile-first, always** — 80% of users are on their phone, probably in bed, probably crying. Every tap target is 44px+, every form is single-column.
5. **Emotional register matching** — The UI tone shifts with context. Homepage is warm and inviting. Support is quiet and spare. Memorial pages are celebratory.
6. **Presence over document** — On memorial pages especially, the page is a space to inhabit, not a document to read. Sensory content (hero video, photo wall) precedes narrative (tribute prose). Empty states are present-tense ("A place is being made for X"), never absence-framed ("No X yet"). Ambient motion — Ken Burns, candle flicker, glow — is allowed but always gated behind `prefers-reduced-motion`. The question to ask is: *would a grieving owner think "nice webpage," or "they're here"?*
