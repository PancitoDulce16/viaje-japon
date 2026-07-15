# Japitin — Design System

Companion doc to `CLAUDE.md` (engineering rules) and the approved visual proposal (artifact `japitin-redesign.html`, published 2026-07-14). This file is the source of truth for *why* the UI looks the way it does. `CLAUDE.md`'s "Theming / brand" section (`#7c3aed`, Inter-only) is superseded by this document as of Phase 1.

---

## 0. Core philosophy

Full canonical statement now lives in `SOUL.md` — this section is a working summary, not the source of truth. If the two ever drift, `SOUL.md` wins.

**Japitin is not a travel planner. It is an illustrated travel companion.**

Every screen should make the user feel like they're preparing for, living, or remembering an adventure in Japan — not filling out a form. When efficiency and delight are in tension, **prefer delight**, as long as it doesn't cost usability (a user stuck at an ATM or a train platform still needs the fast, boring path — see §7).

Before shipping any screen, ask: **"Would this make me excited to open the app during my trip?"** If the answer is no, redesign it.

---

## 1. Foundations

Full rationale for these lives in the visual proposal artifact. Token names below are what `css/tokens.css` implements in Phase 1.

### Color

| Token | Name | Hex | Role |
|---|---|---|---|
| `--color-sora` | Sora Blue | `#CDEEF7` | Scene backgrounds, sky washes |
| `--color-umi` | Umi Teal | `#4FA9C4` | Illustration depth, secondary accents |
| `--color-kasumi` | Kasumi Pink | `#FF8FBB` | Primary accent — active states, brand energy |
| `--color-yuzu` | Yuzu Orange | `#F6923B` | **Reserved** — see §5, do not use as a default accent |
| `--color-ai` | Ai Indigo | `#2B3868` | Ink — all type, icon strokes, illustration linework |
| `--color-washi` | Washi Cream | `#FBF7F1` | Card/content surfaces |
| `--color-matcha` | Matcha Green | `#5FB489` | Semantic: progress, confirmation, success |
| `--color-sango` | Sango Coral | `#E8615C` | Semantic: SOS/errors only, never decorative |

A second batch of references arrived after the proposal was approved (`images/illustrations/reference/`, see §3) using a softer pastel/charcoal palette (no orange, near-black text). **Decision: keep the approved token palette above** — you signed off on it and it's already built into the artifact and the two resolved screens. The new boards are folded in as *composition and illustration-fidelity* references (sakura-branch framing, card anatomy, illustration detail level), not a palette change. Flag it if that reading is wrong — it's a one-line revert in `tokens.css`.

### Type
- **Display** — Bricolage Grotesque, 800 only. Screen headlines, hero numbers, section titles. Never body copy.
- **Body/UI** — Inter, 400/600. Everything else.
- **Data** — IBM Plex Mono, 500/600. Times, prices, countdowns, IC-card balances — anywhere a number needs to look like it belongs on a ticket or a departure board.

### Spacing, radius, shadow, motion
- Spacing scale: 4/8/12/16/20/24/32/48px (`--space-1` … `--space-8`).
- Radius: 14px small controls, 20px cards, 24px hero-scale, 999px pills (`--jp-radius-sm/md/lg/pill`).
- Shadows are **indigo-tinted, never neutral grey**: `rgba(43,56,104, α)`, not `rgba(0,0,0,α)` — this alone is most of why the reference feels warm instead of corporate. (`--jp-shadow-sm/md/lg`.)
- Motion durations: 120ms micro-interactions, 240ms transitions, 480ms orchestrated moments (see §4).
- **Naming note:** `--jp-radius-*`, `--jp-shadow-*`, and `--jp-font-display` carry a `jp-` prefix — `--font-body`/`--font-mono`/`--space-*`/`--color-*` don't need it. Found in production (2026-07-15): the legacy 46-file cascade already defined its own unrelated `--radius-*`/`--shadow-*`/`--font-display` on `:root` (`visual-redesign.css`, `japan-theme.css`, `theme-kawaii.css`, `theme-ninja.css`) — plain names silently collided and the legacy value won the cascade (a Georgia-serif `--font-display` from `visual-redesign.css` was overriding Bricolage Grotesque app-wide). Before adding any *new* token name here, grep the existing `css/` tree for it first — see `DEPRECATION_LOG.md` for the full incident.

---

## 2. Signature components

Not every card is a ticket. Japitin has **four component families**, each with its own job and its own personality. Mixing them intentionally — not defaulting everything to one generic `.card` — is what makes screens feel designed rather than generated.

### 🎫 Ticket Card — `.card--ticket`
**For:** activities, train rides, flights, reservations, museum passes — anything with a time attached.
**Anatomy:** die-cut circular notches on both edges, dashed divider separating a mono-numeral time block from the description, Plex Mono for the time. This is the signature element from the proposal — spend the boldness here.

### 📖 Journal Card — `.card--journal`
**For:** trip notes, recommendations, daily memories.
**Anatomy:** warm washi texture, a handwritten-feel accent rule (not a full border), photo bleeding to one edge like a pasted-in polaroid, body copy in a slightly larger line-height than UI text — reads like a page, not a widget.

### 🧳 Travel Card — `.card--travel`
**For:** trip overview, packing, budget, weather.
**Anatomy:** the "instrument panel" family — progress bars, stat pairs, small inline icons. Flatter and more utilitarian than the other three by design (this is where efficiency is allowed to win over delight, per §0 — you're glancing at packing % while running for a train).

### 🗺 Discovery Card — `.card--discovery`
**For:** nearby attractions, suggested places, hidden gems.
**Anatomy:** image-forward (illustration or photo fills the top 60%), a single confident tag ("5 min walk", "Local favorite"), rounded-full save/heart action in the corner — built to be scanned in a horizontal swipe row, not read top-to-bottom.

---

## 3. Illustration system

**Illustrations are interface, not decoration.** Every illustration must communicate one of: *where the user is*, *what they're about to experience*, or *the current state of their journey*. No generic travel stock-art energy — every hero is destination-specific (Senso-ji is Senso-ji, not "a temple").

### Style guide (derived from `images/illustrations/reference/`)
- **Framing device:** sakura branches enter from one or two corners, never centered, never covering content.
- **Lighting:** warm, painterly-flat gradients — skies shift dusk-to-day per scene, buildings get soft directional shading, not flat solid fills.
- **Detail level:** semi-realistic architecture (real roof tiers, real proportions on Senso-ji/Kiyomizu-dera) — more detailed than the simplified SVG scenes in the first proposal draft, which were placeholders, not the final bar.
- **Characters:** simple, friendly, geometric-but-warm — never verging into a mascot/cartoon register.

### The library
```
images/illustrations/
  reference/    seed boards — external inspiration, never shipped as-is
  generated/    canonical Nano Banana output — this IS the shipped art direction
```

### Nano Banana pipeline
Generate via the Gemini `gemini-2.5-flash-image` API (key at `C:\Users\Noelia\Desktop\mod.json`, ~$0.039/image at 1024px — same pipeline already used for the kawaii illustrations). Generate **only when a real screen needs it** — no speculative asset dumps. Typical triggers: destination heroes, onboarding artwork, empty states, loading screens, seasonal graphics, transport illustrations, small decorative travel moments. **Never placeholder artwork** — if a screen isn't ready for its real illustration, it isn't ready to ship.

### Continuous evolution rule
Before generating anything new: look at what's already in `reference/` **and** `generated/`, and match composition, stroke weight, color palette, lighting, perspective, and character style to what's already canon. `generated/` grows as the single source of truth over time — later illustrations are matched against *earlier generated ones*, not just the original references. The goal is that every screen looks like one illustrator worked on it over months, not that every image independently reinterprets the brief.

---

## 4. Motion

Motion reinforces travel, never flashy: **ticket sliding into place** (a booked activity), **passport-stamp effect** (confirming a reservation or completing a day), **train progress animation** (a thin line filling like a route on a map, for loading/countdown states), **subtle paper movement** (journal cards on open/close), **gentle page transitions** (cross-fade + slight rise, never a hard cut or a bouncy overshoot).

Calm and premium over playful-for-its-own-sake. Respect `prefers-reduced-motion` everywhere — swap the orchestrated moment for a plain fade.

---

## 5. Color usage rule

**Yuzu Orange is reserved for moments of delight, confirmations, and primary actions.** It is not a generic accent — if you reach for orange because "the section needs a pop of color," reach for Kasumi Pink or Umi Teal instead. The softer colors carry the day-to-day atmosphere; Yuzu shows up when something good just happened (a plan was created, a booking confirmed) or to point at the one primary action on a screen.

---

## 6. Empty states

No empty state ever feels empty. Every one ships with all three: a unique destination/context-relevant illustration (not a generic "nothing here" graphic), a warm travel-voiced message, and a small action that invites exploration. Baseline: `js/ui/empty-states.js` already has the right shape (icon/title/message/CTA) — Phase 2 reskins it to this system and, per §0, gives it a real illustration instead of an icon glyph.

---

## 7. Navigation

Navigation should feel like moving through an illustrated travel guide, not an admin dashboard. Concretely: the current app's 11 flat top-level tabs (`#tabSelector`) get consolidated into a **5-item bottom nav** for mobile — Inicio, Itinerario, Explorar, Reservas, Perfil — with Presupuesto/Transporte/Atracciones/Esenciales living as contextual sections inside Itinerario/Explorar rather than competing as equal-weight top-level tabs. Desktop keeps a top bar for the same 5 destinations; no separate desktop-only IA. Every transition between them should reinforce forward motion through the trip, not a context switch between unrelated tools.

---

## Roadmap

Unchanged from the approved proposal — four phases, foundation → components → screens → cleanup. This document is what Phases 2–4 get built against; Phase 1 (tokens, fonts, dead-code removal) starts now.
