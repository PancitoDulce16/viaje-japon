# Dashboard Experience

**Status: PRODUCTION READY.** All four slices complete. See "Final Dashboard Review" at the end of this document for the production-readiness assessment. This experience is now the reference implementation every future experience is measured against.

### Implementation progress

- **Slice 1 — Stage detection + the one Hero Moment (done).** `js/features/dashboard/stage-detector.js`, `js/features/dashboard/hero-moment.js`, `css/dashboard-hero.css`. Demonstrated in isolation at `dashboard-hero-preview.html` (dev-only, not deployed) across all 6 detectable stages.
- **Slice 2 — Progressive content below the hero (done).** `js/features/dashboard/progressive-content.js`, `css/objects.css` (the first real implementation of the Ticket/Travel/Discovery/Journal card families from `OBJECT_BIBLE.md` — previously spec-only). `Achievements.renderMemoryTeaser()` added as a quiet, single-recuerdo teaser distinct from the fuller `renderPanel()`. Stage-ordered sections: Dreaming/Planning lead with inspiration, Preparing with reservations/packing/documents, Traveling with today's Ticket rail, Remembering with the memory teaser + stats + a "Travel Memories" teaser. Demonstrated in the same isolated preview, still not wired into live `dashboard.html`.
- **Slice 3 — Live integration (done).** `hero-moment.js` + `progressive-content.js` now render for real inside `TripsManager.updateTripHeader()`/`updateTripHeaderEmpty()`, fed by real Firestore data via the new `js/features/dashboard/dashboard-data.js`. The old banner + 4-card stat grid + `loadTripStatistics()` are deleted, not hidden. Full migration summary in `DEPRECATION_LOG.md`. Verified against the real test account (existing trip, real stage/data), a brand-new account (no-trip state), mobile + desktop, keyboard navigation, and console — all clean.
  - **Found during this slice, not fixed, flagged for a decision:** `itinerary-v3.js` renders its own separate trip-summary header inside the Itinerario tab, now visibly duplicating the new Dashboard hero directly above it. Pre-existing, not introduced by this migration — see `DEPRECATION_LOG.md`'s "remaining technical debt" for this entry.
- **Slice 4 — Polish (done).** Empty/error/loading states, accessibility fixes (two real contrast failures found and fixed — see review below), analytics event contracts verified against real consumers, responsive check at tablet width, illustration compressed 89% (1.9MB → 205KB, no new dependency). The duplicate-header finding from slice 3 remains deliberately unresolved — it belongs to the future Itinerary Experience, not this one.
- Full Definition of Done (bottom of this doc) applies to the *experience as a whole*, not to each individual slice — slice 1's own scope is intentionally narrower; see its self-review in the commit history.

This is the first document written against the Experience Documentation template. It doubles as the Dashboard Experience Proposal requested directly — the template sections are the blueprint, the "Existing elements," "Wireframes," "User flow," and "Migration strategy" sections at the end are the proposal-specific analysis that justifies it.

---

## Guiding principles (added at approval)

- **Not a control panel.** The Dashboard is the traveler's companion, not an admin screen or a list of widgets. Every open of the app answers one question: *"What's the most helpful thing for me right now?"* — and the answer changes naturally with the journey stage.
- **One primary moment, not competing cards.** Every stage gets exactly one clear visual focal point — "Tu aventura a Japón empieza en 42 días," "Hoy en Kyoto," "Tu viaje por Japón" — never five equally-weighted sections fighting for attention. Everything else *supports* that one moment; nothing sits beside it as a peer.
- **Progressive disclosure.** The first screen is calm. Secondary information (today/next, Discovery, the achievement teaser) reveals itself as the traveler scrolls, not all at once above the fold. Reduce noise, increase focus — this reshapes the wireframe below from "hero + three peer blocks" to "hero, then a calm reveal."
- **Travel objects, not software modules.** Ticket, Passport, Journal, Discovery, Reservations, Budget, Memory should feel like things pulled out of a travel bag — introduced naturally, in context, never labeled or framed like app features.
- **Illustration reinforces emotion, never decorates.** Every illustration communicates the current stage — Preparing feels optimistic, Traveling feels alive, Remembering feels nostalgic. If an illustration doesn't add emotion, it doesn't belong. New art comes from Nano Banana, matched against the house style lock in `ILLUSTRATION_LIBRARY.md`.
- **Motion communicates continuity, not spectacle.** Transitions should make the journey feel like it's progressing, never animate just because it looks impressive.
- **Empty states inspire action.** Never "No itinerary." Always an explanation of what comes next and a gentle invitation to keep planning.
- **The screenshot test.** If someone screenshotted the Dashboard with the logo cropped out, it should still be unmistakably Japitin — impossible to confuse with a generic travel app.
- **Implementation discipline.** Small reviewable slices only: implement → test → review → commit → continue. Never a single big-bang replacement of the existing dashboard.

---

## Purpose

The Dashboard is the front door of Japitin — the first thing a traveler sees every single time they open the app, whether that's three months before departure or on day 4 of the trip itself. Its job is to answer, at a glance and with feeling, one question: **"Where am I in this journey, and what's next?"**

## Traveler problem being solved

Today, opening the app hands a traveler an information console: a stat-strip trip header and eleven equally-weighted tabs (`itinerary`, `budget`, `preparation`, `flights`, `hotels`, `transport`, `map`, `attractions`, `essentials`, `utils`, `analytics`), and leaves it to them to figure out what matters *right now*. The real problem isn't that the information is wrong — it's that the screen doesn't know (or show) that "right now" means something completely different three months out than it does mid-transit at Narita.

## Journey stage

**All of them — uniquely among experiences, Dashboard doesn't belong to one stage.** It's the single screen a traveler returns to at every stage of `EXPERIENCE_GUIDELINES.md`'s lifecycle, from Dreaming through Looking back years later. Its job is to visibly change costume as the stage changes, rather than presenting the same console regardless of whether the trip is a distant idea or happening right now. See "Stage-adaptive behavior" below.

## Primary emotion

Recognition and orientation before task-orientation — "oh right, here's my trip" — per `SOUL.md`'s "the first two seconds matter more than any other two seconds in the app." Not "productive." Not "in control of a console."

## User mindset

Cannot be reduced to one line — it's the whole point of this experience that the mindset changes by stage:

| Stage | Mindset on opening the app |
|---|---|
| Dreaming / Planning | Casual, browsing, low-stakes — checking in on a trip that's still an idea |
| Preparing | A little anxious, checklist-oriented, but with rising excitement |
| Traveling | Urgent, needs one fact fast, possibly stressed, possibly one-handed |
| Exploring | Open, energized, wants a next suggestion |
| Remembering / Looking back | Reflective or nostalgic, not task-driven at all |

## Success criteria

- A traveler can tell which trip is active and where they are in it (days out / days in) within one second, without reading a paragraph.
- A traveler can reach their single most relevant next action in one tap, from anywhere in the stage they're currently in.
- Nothing about the screen requires the word "Dashboard" to make sense — it should read as **"your trip,"** not as a control panel. (Direct application of `SOUL.md`'s "remove the word Japan" test, adapted: if you removed the word "Dashboard," would this still make sense as *a trip*, not *software*?)

## UX goals

- Replace flat information parity (eleven equal tabs, one stat strip) with real information hierarchy: one hero, one primary next-action, everything else reachable but not competing for attention.
- Let visual tone and content genuinely shift with trip proximity, per the stage table above — this is the single biggest UX change this experience makes.
- Resolve the broken FAB. `#main-fab-button` currently calls `window.showMainMenu()`, which is not defined anywhere in the codebase — the floating button on the highest-traffic screen in the entire app currently does nothing when pressed. This is the single worst first impression the app can currently make and gets fixed as part of this experience, not deferred.

## Information hierarchy

1. **Travel Card hero** — which trip, current stage, the one headline stat that matters for that stage (days to go / today's date in-trip / "welcome back").
2. **Today / next** — stage-dependent: a Ticket rail of today's activities (Traveling/Exploring), a Countdown + top unfinished prep task (Preparing), a Discovery/inspiration strip (Dreaming/Planning), a quiet Journal/Passport prompt (Remembering).
3. **The five consolidated nav destinations** (Inicio, Itinerario, Explorar, Reservas, Perfil — per `DESIGN_SYSTEM.md` §7), reachable, not restated as content on the home screen itself.
4. **Achievement teaser** — two or three recent recuerdos and a count, not a full panel.
5. Everything else is one tap away through the nav. The home screen's job is triage, not an index of every feature.

## Objects used

- **Travel Card** — the hero, replacing `#currentTripHeader`'s current stat-strip treatment.
- **Countdown** — pre-trip proximity and, once traveling, the current activity's remaining time.
- **Ticket** — today's activity rail, once the trip is underway.
- **Discovery** — the inspiration/nearby-now strip pre-trip and mid-trip respectively.
- **Achievement** — teaser only; see "Achievement integration" below for why full integration is explicitly out of scope here.

## Illustrations required

Per `ILLUSTRATION_LIBRARY.md`: **Cities** (hero backdrop matching the trip's current or first city — already demonstrated in the approved visual proposal's Home mockup), a **Seasonal** overlay matched to the trip's real dates, **Empty States** art for "no active trip yet," and a small **Weather** glyph inside the Travel Card.

## Motion concepts

Per `EXPERIENCE_GUIDELINES.md`'s per-stage motion table: slow drift on the hero when Dreaming/Planning, the Countdown ring visibly quickening as Preparing gets close, near-static and information-only once Traveling (delight loses to speed here, deliberately), a calm settle for the Remembering-stage variant. No stage of this screen should feel "busy" — Dashboard is a place you land, not a place you perform in.

## Accessibility considerations

- Countdown's numeric value is always real text, never conveyed by the ring shape alone.
- Trip stage/status is never color-only.
- The FAB, once fixed, needs a real accessible label (`aria-label`), not just an icon glyph.
- The hero illustration is decorative (`alt=""`/`aria-hidden`) — the trip name and dates that matter are real text, not baked into the image.

## Responsive behavior

Bottom nav (5 items) on mobile, an equivalent top bar on desktop — one IA, not two, per `DESIGN_SYSTEM.md` §7. The hero scene scales without cropping the trip name/countdown; the Today/Next rail goes from a horizontal scroll (mobile) to a grid (desktop, more room).

## Empty states

No active trip yet: a unique illustration (per `ILLUSTRATION_LIBRARY.md`'s Empty States category) + warm copy + exactly one action ("start planning"), never a bare "no trips found." This is the very first thing a brand-new user ever sees in the product — it deserves the same craft as any other screen, not a placeholder.

## Error states

Trip failed to load, or offline: plain and calm, not personality-forward. Per `EXPERIENCE_GUIDELINES.md`'s "when should the UI become invisible" — an error is a competence moment, not a charm moment. Clear explanation of what happened, one retry action, no jokes.

## Achievement integration

**A teaser only** — two or three recent recuerdos and a count, reading from `Achievements.renderPanel()`'s existing data, linking to the full gallery. Per this session's explicit instruction: **the actual trigger logic for new achievements stays with whichever experience owns the underlying action** (Budget Experience wires `trackAction('expenseCategories', …)`, Journal Experience wires journal-entry achievements, etc.). Dashboard Experience does not introduce any new `trackAction()` call sites — it only displays what's already unlocked. This directly replaces the old dead `#gamification-panel` hook (confirmed to not exist anywhere in `dashboard.html`) rather than resurrecting it.

## Analytics considerations

Worth measuring once this ships: which of the five nav destinations gets tapped first per session (validates or invalidates this hierarchy), whether the fixed FAB actually gets used, time-to-first-tap for returning users. Not blocking for this proposal — flagged so it's designed in from the start rather than bolted on.

## Future extensibility

Stage-adaptive hero art could eventually be generated per-trip via Nano Banana (a specific temple/city the traveler is actually about to visit) rather than a generic city illustration — natural fit once `FEATURE_ROADMAP.md` Phase 3/7 work exists, not this pass.

## Definition of Done

Per the standard established this session — all of these, not a subset:

`Documentation updated` · `OBJECT_BIBLE.md updated if needed` · `Illustration Library updated if needed` · `Responsive verified` (real device widths, not just resize) · `Accessibility verified` · `Motion reviewed against reduced-motion` · `Empty states implemented` · `Error states implemented` · `Achievement teaser wired to existing data (no new trigger logic)` · `Analytics considered` · `Build passes` · `No console errors` · `Manual testing completed (existing account + fresh account, mobile + desktop)` · `Self-review written` · `Production quality — not a placeholder pass`

---

## Which existing elements survive

- `TripsManager.updateTripHeader()`'s **data assembly logic** — what it computes is right, only its visual wrapper becomes the Travel Card object.
- The tab **content renderers themselves** (`itinerary-v3.js`, `bento-budget.js`, etc.) — this experience touches the shell and navigation, not the screens the nav leads to. Those are their own future experiences.
- The onboarding tour's element targeting (already retargeted to real elements in a prior session pass) — reused, not rebuilt.
- The merged mobile menu's account/settings section (profile, dark mode, logout — already consolidated in a prior pass) — kept as-is.

## Which existing elements disappear completely

- **The eleven-tab horizontal scroller** (`#tabSelector`) — replaced by the five-destination nav already specified in `DESIGN_SYSTEM.md` §7. The other six tabs (Vuelos, Hoteles, Transporte, Atracciones, Esenciales, Analytics) don't lose their screens — they move to being reached *through* Itinerario/Explorar/Perfil rather than sitting as equal-weight top-level tabs, per the roadmap's own stated plan.
- **The broken FAB behavior** — either given a real, working action or removed; a non-functional floating button is worse than no button.
- **The purple/pink Tailwind gradient chrome** (`bg-gradient-to-r from-purple-*`) on the header and stat cards — replaced by the approved token palette.
- **The separate desktop-chip-cluster vs. mobile-cluster split** in the header — one IA, not two, per `DESIGN_SYSTEM.md` §7.
- **The dead `#gamification-panel` DOM hook** — not resurrected; superseded by the new Achievement teaser described above.

---

## Wireframes (low-fidelity, mobile-first)

Revised for progressive disclosure: **one hero above the fold, everything else revealed on scroll.** Two stage variants shown, same skeleton:

```
PREPARING (trip is ~2 weeks out)              TRAVELING (mid-trip, day 4)
┌─────────────────────────┐                   ┌─────────────────────────┐
│                         │                   │                         │
│   [sakura-framed hero   │                   │   [quieter hero art,    │
│    illustration, full   │                   │    same full width]     │
│    width]               │                   │                         │
│                         │                   │                         │
│  Tu aventura a Japón    │  ← ONE moment     │      Hoy en Kyoto       │  ← ONE moment
│  empieza en 14 días     │                   │                         │
│                         │                   │                         │
│  ╌╌╌╌╌ scroll ╌╌╌╌╌     │                   │  ╌╌╌╌╌ scroll ╌╌╌╌╌     │
│  Falta: Suica, Backpack │                   │  Ahora: Fushimi Inari   │
│  [Ver preparación →]    │                   │  [Ver itinerario →]     │
│                         │                   │                         │
│  ── Descubre ──         │                   │  ── Cerca de ti ──      │
│  [Discovery] [Discovery]│                   │  [Discovery] [Discovery]│
│                         │                   │                         │
│  🎏 2 recuerdos  Ver →  │                   │  🎏 6 recuerdos  Ver →  │
├─────────────────────────┤                   ├─────────────────────────┤
│ 🏠  🗺️  🧭  🎫  👤       │                   │ 🏠  🗺️  🧭  🎫  👤       │
└─────────────────────────┘                   └─────────────────────────┘
```

The hero is the only thing guaranteed visible without scrolling. Everything below it — the today/next nudge, Discovery, the achievement teaser — is secondary content the traveler reaches by choice, not noise competing with the primary moment. Preparing's hero leans on the Countdown; Traveling's hero shrinks and quiets per the motion/emotion table (delight recedes, information leads once actually traveling).

## User flow

1. App opens → auth resolves → active trip resolves (existing `getCurrentTripId()` pattern).
2. Dashboard determines the current stage from trip dates (days-until vs. today vs. days-since-end) — new, small piece of logic, not a new object.
3. Hero + Today/Next content render per that stage.
4. Achievement teaser and Discovery/Ticket rail populate from existing data (`Achievements`, `TripsManager`, itinerary data) — no new backend calls invented for this experience.
5. Nav (5 destinations) is always present, unaffected by stage.

## Migration strategy

1. Build the new shell (hero + Travel Card + stage logic + 5-item nav) alongside the current one, gated behind a manual toggle, so the existing 11-tab dashboard keeps working for real users while this is being built and reviewed.
2. Confirm all six "absorbed" tabs (Vuelos, Hoteles, Transporte, Atracciones, Esenciales, Analytics) are genuinely reachable through the new IA before removing their top-level tab buttons — no feature loses its only door.
3. Swap the default shell once verified; keep the old tab bar's CSS in place for one more pass (per `ARCHITECTURE_PRINCIPLES.md`'s "deprecate before deleting") rather than deleting it in the same commit that ships the new shell.
4. Log the tab-bar removal in `DEPRECATION_LOG.md` once it actually happens, with a note on where each absorbed tab now lives.

---

# Final Dashboard Review — production readiness

This is not a design document. It's an assessment of what actually shipped, written after all four slices, for anyone deciding whether this is safe to consider done.

## What was removed

- The centered JAPITIN banner (desktop-only) and the 4-card stat grid (`#tripStatsDashboard`: Progreso del Viaje, Actividades, Presupuesto, Reservas).
- `TripsManager.loadTripStatistics()` — deleted outright, not left dormant.
- The old "👋 ¡Bienvenido!" empty-state strip.
- Four independent gamification/scoring systems and their fake leaderboard, in the earlier Phase 2 work this experience builds on (`gamification-system.js`, the achievement section of `social-features.js`, two separate streak trackers) — replaced by the single canonical `Achievements` module this experience's memory teaser reads from.

## What was simplified

- One trip-summary rendering path instead of two parallel ones (`updateTripHeader()`/`updateTripHeaderEmpty()` now call directly into `stage-detector.js` → `hero-moment.js` → `progressive-content.js`, no independent stat-computation logic living alongside it).
- The whole-trip "total activities" stat is gone with no direct replacement — it was superseded by the Traveling stage's real today's-activities Ticket rail, which answers a more useful question. A deliberate simplification, not an oversight (see `DEPRECATION_LOG.md`).
- Card markup collapsed from ad hoc Tailwind strings scattered per feature into four canonical, reusable classes (`ticket-card`, `travel-card`, `discovery-card`, `journal-card`) — the first real implementation of `OBJECT_BIBLE.md`'s card families, not just documentation anymore.

## What became canonical

- `js/features/dashboard/stage-detector.js` — the one place trip dates become a journey stage.
- `js/features/dashboard/hero-moment.js` — the one hero moment, never competing cards.
- `js/features/dashboard/progressive-content.js` — the one place "what matters next" gets ordered by stage.
- `js/features/dashboard/dashboard-data.js` — the one place the Dashboard reads Firestore, keeping the renderer pure.
- `css/objects.css` — the first four real Travel Objects, ready for reuse by every future experience (Budget, Journal, Itinerary, etc. should consume these, not invent their own card styles).
- `Achievements.renderMemoryTeaser()` — the quiet-memory rendering path every future "show a recent achievement" surface should call, not reimplement.

## Remaining technical debt

- **The duplicate Itinerary header** (found in slice 3, deliberately left alone — see `DEPRECATION_LOG.md`). This is the most visible remaining rough edge and the natural first item for the future Itinerary Experience.
- **Most manually-tracked Achievement counters have no real call site** (documented since the Achievement unification work) — unchanged by this experience, not this experience's problem to fix, but still true.
- **The Traveling stage's "Tu pase de transporte" card has no real data source** — no IC-card/Suica balance tracking exists anywhere in the app. It renders an honest `—` rather than a fake number, which is correct, but it's a visibly incomplete card until Train Pass (the `OBJECT_BIBLE.md` object) gets built for real.
- **Only one real illustration exists** (`tokyo-skyline-day-sakura.jpg`), reused across every stage via CSS mood shifts. Deliberate slice-1 scope, still true — Preparing/Traveling/Remembering all show the same photo. This is the single biggest visual-polish gap left.
- **Discovery cards are icon-based, not photo-based** — consistent with "keep using the existing illustration, don't spend time on new art" for this experience, but means the Discovery object isn't demonstrating its own `OBJECT_BIBLE.md` ideal ("image-forward") yet.

## Performance observations

- Net bundle impact across all four slices: the main `dashboard.js` chunk moved from ~2850KB to ~2855KB pre-gzip (~698KB → ~702KB gzipped) — roughly +5KB despite adding stage detection, hero rendering, four stage-specific content renderers, real Firestore data-fetching, and a full illustration. Deleting the old stat-grid code offset most of what was added.
- The hero illustration was shipped as an uncompressed 1.9MB PNG straight from Nano Banana output — caught during this review's performance pass, not before. Re-encoded to JPEG (quality 82, .NET's built-in encoder, no new dependency) at 205KB, a 89% reduction with no visible quality loss. Documented as a required step for every future illustration in `ILLUSTRATION_LIBRARY.md`'s governance section — this was a real gap in the pipeline, now closed for future assets, not just this one.
- Dev-server timing showed the hero visible ~6.4s and progressive content ~7.2s after the login click — this number is dominated by Firebase Auth + unbundled ES module dev-server overhead and is **not representative of production performance** (no minification, no CDN, no build-time bundling active in dev mode). Flagged as a number to re-measure against the deployed build, not a verified production figure.
- `dashboard-data.js` fetches only what the current stage needs (no speculative reads), and reuses the itinerary document already fetched for the `itineraryLoaded` event rather than double-reading it for Traveling/Remembering stages.

## Accessibility observations

- **Two real WCAG AA contrast failures were found by measurement, not assumed away, and fixed:**
  1. The Dreaming-stage empty-state subtext (`--ink-soft` on the gradient's darker stop) measured 3.63:1 — fixed by switching to `--color-ai` (7.3–9.2:1).
  2. The Ticket Card's confirmation tag (`--color-umi` text on its own pale pill) measured 2.28:1 — fixed by switching the text to `--color-ai` (9.53:1) while keeping the tinted background as the color cue.
- The hero's photographic scrim was strengthened from 0.72 to 0.85 alpha at its darkest stop after measuring the headline at 5.58:1 and the subtext at only 4.76:1 against the shipped photo's lightest region — a technically-passing but fragile margin that would likely fail against a brighter future illustration. Now 7.52:1 / 6.27:1, with real headroom.
- Keyboard navigation verified directly (not assumed): Tab order reaches the hero's CTA button within 6 tab-stops on the real page, `:focus-visible` rings are defined for every new interactive element (hero CTA, discovery/travel/ticket/journal cards used as buttons, the new error-retry button).
- Two `onclick`-bearing `<div>`s from slice 2 (memory teaser, Dreaming budget nudge) were already converted to real `<button>` elements before this review — confirmed still correct.
- Not yet audited: screen-reader announcement quality for the stage transition itself (does a screen-reader user get told the hero's content just changed after a re-render?) — flagged as a future opportunity below, not fixed here.

## Future opportunities (not implemented)

- Per-stage, per-city illustration generation (Preparing/Traveling/Remembering each getting their own mood-appropriate art) once more Nano Banana budget/time is allocated.
- Live `aria-live` region on the hero so stage changes announce themselves to screen readers.
- Photo-based Discovery cards once city-specific illustrations exist for more than Tokyo.
- Real Train Pass / IC-card balance integration, once that data source exists anywhere in the app.
- Re-measuring the performance numbers above against the actual deployed production build, not dev-server timing.

## Original Dashboard vs. this one

**Why it's better:** The original dashboard treated every visit the same — a stat-strip and eleven equal-weight tabs, regardless of whether the trip was three months away or happening today. This one changes what it leads with based on where the traveler actually is in their journey, which is the entire premise `EXPERIENCE_GUIDELINES.md` was written to argue for. It also fixed a genuinely broken FAB, a permissions gap that made the Achievement system non-functional in production, and two real accessibility failures — none of which the original dashboard's existence had surfaced, because nobody had measured it.

**Which product principles it now satisfies:** The three SOUL.md tests apply cleanly for the first time on this screen — a user opening the app sees a feeling before a number; the hero+progressive-content structure could not be mistaken for a generic SaaS dashboard; and removing "Japan" from the hero's copy would leave it making no sense at all (city art, real trip dates, JR-Pass-adjacent language). Every object on screen is one of the 15 canonical Travel Objects, never an invented one-off.

**Which principles still need future work:** "Every illustration should communicate the current travel stage" is only partially true — one photo standing in for four stages via CSS filters is a placeholder for real per-stage art, not the finished version of that principle. The Achievement teaser is quiet, per the brief, but the underlying Achievement counters mostly can't fire yet, so "memories quietly collected along the journey" is more aspirational than real until other experiences wire their own `trackAction()` calls. And the duplicate Itinerary header means the very first thing a user scrolls past after this polished hero is a visibly older, unrelated design language — the Dashboard Experience is finished, but the *page* it lives on isn't yet, and that seam will stay visible until the Itinerary Experience happens.
