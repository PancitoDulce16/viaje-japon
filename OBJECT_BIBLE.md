# Japitin — Travel Objects

Companion doc to `DESIGN_SYSTEM.md`. That document defined four *card families* as a starting shape. This document replaces "cards" as the unit of thought entirely: Japitin is built from **travel objects** — things that exist because they exist on a real trip through Japan, not because dashboards usually have cards. Every screen in `FEATURE_ROADMAP.md` Phase 4 onward is assembled from the objects below, not invented ad hoc per screen.

**Rule:** if a new UI need doesn't map to one of these 15 objects, the answer is not "make a generic card" — it's "come back here and decide if a 16th object is genuinely warranted, or if it's a variant of an existing one." Most new needs are the second thing.

Each object is specified on the same 10 dimensions. `When NOT to use it` is not optional filler — it's what keeps objects from blurring into each other.

---

## 🎫 Ticket

| | |
|---|---|
| **Purpose** | Represents a scheduled, time-bound experience: an activity block, a train leg, a flight, a museum entry. Anything with a start time belongs here. |
| **Emotional purpose** | Anticipation. The small thrill of "something is about to happen" — the same feeling as finding a real ticket in your pocket. |
| **Story behind it** | Physical tickets survive the trip in a drawer somewhere; people keep them as proof something happened. The UI object should feel worth keeping, not worth discarding after use. |
| **Visual language** | Die-cut circular notches on both edges, dashed divider separating an IBM Plex Mono time block from the description. The signature object of the whole system — see `DESIGN_SYSTEM.md` §2. |
| **States** | `upcoming` (plain) → `active` (Countdown ring attaches, see Countdown) → `completed` (Stamp attaches, see Stamp) → `missed` (desaturated, no stamp, quiet not punitive). |
| **Variants** | Transit ticket (train icon, platform/line info), activity ticket (JR Pass validity badge if applicable), flight ticket (longer format, boarding-pass proportions, gate/seat fields). |
| **Motion** | Slides in from the right on creation, like being handed a ticket. On `completed`, the Stamp animation plays once, then settles. |
| **Accessibility** | Time and title are never color-only differentiators. Notches are decorative (`aria-hidden`). The whole ticket is one focusable region with a single descriptive label ("09:00, Ir a Asakusa, 1 hora"), not four separate focus stops. |
| **Future extensibility** | A Ticket linked to a paid booking can expand into a Reservation on tap. Wallet export (Phase 10) turns a Ticket into a real Apple/Google Wallet pass. |
| **When NOT to use it** | No time attached → Discovery or Travel Card. A confirmed booking spanning multiple days (a hotel stay) → Reservation, not a Ticket sized for a single time slot. |

Existing code this replaces/extends: `js/features/itinerary/itinerary-v3.js` activity blocks, `js/features/japan/jr-pass-calculator.js`.

---

## 📖 Journal

| | |
|---|---|
| **Purpose** | Personal, reflective writing and photos — trip notes, recommendations to your future self, daily memories in the user's own words. |
| **Emotional purpose** | Ownership. "This is *my* story," not the app's summary of the trip. |
| **Story behind it** | A travel journal is handwritten in a cafe at the end of the day, a little tired, a little happy. The digital version should feel penned, not printed. |
| **Visual language** | Washi-textured surface, a torn/deckled top edge instead of a hard rectangle, a photo bleeding off one side like a pasted-in polaroid, generous line-height on body text. |
| **States** | `draft` (private, autosaved) → `published` (visible to trip co-travelers) → `shared` (exported/sent outside the app). |
| **Variants** | Photo entry, text-only entry, voice-note entry (future — Phase 6). |
| **Motion** | Paper-settle on open (slight rotation + drop, not a hard cut); pages "turn" when swiping between entries. |
| **Accessibility** | Alt text is mandatory on every photo since this is user-generated content the author may revisit blind or low-vision months later. Handwritten-feel fonts, if ever used, must still pass body-text contrast and never replace the readable Inter body face for actual content. |
| **Future extensibility** | Co-traveler annotations/comments (Phase 9 Community). Auto-suggested entries from Memory captures (Phase 7). |
| **When NOT to use it** | Time-bound and scheduled → Ticket. Read-only curated content the user didn't write → Discovery. |

Existing code this replaces/extends: `js/features/journal/travel-journal.js`, `photo-gallery.js`, `instagram-timeline.js`.

---

## 🗺 Discovery

| | |
|---|---|
| **Purpose** | Unplanned, suggested, or nearby places the user hasn't committed to yet — the "what if I went here" layer. |
| **Emotional purpose** | Curiosity and serendipity — the opposite feeling of a locked-in itinerary. |
| **Story behind it** | The best trip moment is often the one you didn't plan: a shop you passed, a shrine down a side street. Discovery is the UI's permission to wander. |
| **Visual language** | Image-forward — illustration or photo fills the top ~60%, one confident tag ("5 min a pie", "Poco conocido"), rounded save/heart action in the corner. Built for a horizontal swipe row, not a vertical read. |
| **States** | `unseen` → `saved` → `visited` (moves to Memory once actually done). |
| **Variants** | Nearby-now (distance-sorted), editorial pick (curated by Japitin), hidden gem (explicitly rare/off-path badge). |
| **Motion** | Cards cascade in with a slight stagger on scroll into view; save = a quick heart pulse, not a full re-render. |
| **Accessibility** | The swipe row needs a keyboard-reachable equivalent (arrow-key navigation or a "see all" list view) — swipe-only interaction excludes keyboard and switch-control users. Save action must not depend on hover-reveal. |
| **Future extensibility** | Personalized ranking once Travel Intelligence (Phase 7) exists. |
| **When NOT to use it** | Once scheduled with a time, it becomes a Ticket — Discovery cards don't carry times. |

Existing code this replaces/extends: `js/api/attractions.js`, `google-places.js`, `js/map/hidden-gems-map.js`.

---

## 🧳 Travel Card

| | |
|---|---|
| **Purpose** | The trip-overview instrument: "12 días para irte," the route map (Tokyo → Hakone → Kyoto → Osaka), high-level stats. The single screen a user checks first. |
| **Emotional purpose** | Reassurance and control — "I've got this handled," not excitement. This is the one object explicitly allowed to be calm and administrative. |
| **Story behind it** | The trip-briefing sheet a good travel agent hands you before departure: dates, route, the shape of the whole journey at a glance. |
| **Visual language** | Flatter and more utilitarian than the other objects by deliberate design (see `DESIGN_SYSTEM.md` §0 — efficiency is allowed to win here). Mini Japan map with route dots (active/next/upcoming), big countdown number, stat pairs below. |
| **States** | `active` (current city highlighted) / `upcoming` (trip hasn't started) / `completed` (post-trip, becomes a Memory summary). |
| **Variants** | Full trip overview (home screen), compact strip (persistent header context). |
| **Motion** | Numbers count up once on first view per session; otherwise static. This is the one object that should almost never animate — motion here would undercut the "reliable instrument" feeling. |
| **Accessibility** | The route map needs a text list equivalent (city names + status in reading order), never map-only. |
| **Future extensibility** | Multi-trip support (past trips as collapsed Travel Cards in a list). |
| **When NOT to use it** | Never for anything emotionally significant — a first-time experience belongs to Memory, not a stat row. |

Existing code this replaces/extends: `js/features/trips/trips-manager.js` `updateTripHeader()`.

---

## 🏨 Reservation

| | |
|---|---|
| **Purpose** | A confirmed booking with a provider — hotel, restaurant, tour operator — that has a confirmation code and a promise attached to it. |
| **Emotional purpose** | Relief. "This part is locked in, I don't need to worry about it." |
| **Story behind it** | The folder of printed confirmations every careful traveler keeps, just in case. The digital object should feel like that folder: complete, official, retrievable under stress (at a front desk, at 11pm). |
| **Visual language** | More formal than a Ticket — a confirmation-code field rendered in mono, provider name/logo area, a clear "show this at check-in" affordance. Spans a date range, not a single time slot. |
| **States** | `confirmed` / `needs attention` (payment pending, date conflict) / `checked-in` / `cancelled`. |
| **Variants** | Hotel, restaurant, tour/activity booking, transport booking (long-distance bus, rental car). |
| **Motion** | None decorative — this object prioritizes speed-to-information over delight. Opening it should be instant, no orchestrated entrance. |
| **Accessibility** | Confirmation codes must be selectable/copyable text, never baked into an image. High contrast mandatory — this is the object most likely to be read stressed, at a desk, in bad lighting. |
| **Future extensibility** | On the check-in day, a Reservation can spawn a Ticket for the specific time-bound part of it (e.g., a tour's start time). |
| **When NOT to use it** | A single scheduled activity with no external provider/confirmation code → Ticket, not Reservation. |

Existing code this replaces/extends: `js/features/trips/reservations-manager.js`.

---

## 📸 Memory

| | |
|---|---|
| **Purpose** | The atomic unit of "something happened": a captured moment with a photo and/or note, a timestamp, and a location. The raw material everything in Phase 5/6 is built from. |
| **Emotional purpose** | Preservation. Not proof of productivity — proof of presence. |
| **Story behind it** | The instinctive phone-out moment on a trip: not because a task needs checking off, but because something felt worth keeping. |
| **Visual language** | Simple, photo-first, minimal chrome — the memory itself is the content, the UI should get out of the way. A small location pin and date, nothing louder. |
| **States** | `captured` (private) → `kept` (user confirmed it matters) → `framed` (elevated to an Achievement, see below). |
| **Variants** | Photo memory, text-only memory, auto-suggested memory (location/time-triggered, user must confirm before it's kept — never auto-saved without consent). |
| **Motion** | A soft flash/settle on capture, echoing a camera shutter without literally imitating one. |
| **Accessibility** | Same alt-text requirement as Journal. Auto-suggested memories must be dismissible with one action, not buried in a menu. |
| **Future extensibility** | Feeds the Travel Storytelling phase (Phase 6) — a trip recap is a sequence of Memories, not a generated summary from nowhere. |
| **When NOT to use it** | A planned/scheduled thing that hasn't happened yet → Ticket. A place under consideration, not yet visited → Discovery. |

Existing code this replaces/extends: reframes `js/features/journal/photo-gallery.js` capture flow; feeds the new Achievement object below.

---

## 🎏 Achievement (memories, not gamification)

| | |
|---|---|
| **Purpose** | Recognizes that a specific Memory is a milestone worth marking — "Primer viaje en Shinkansen," "Primer amanecer en Japón," "Caminaste por Gion." Not a point system. |
| **Emotional purpose** | Pride and nostalgia, the same feeling as a well-worn souvenir, never the dopamine-loop feeling of a game score. |
| **Story behind it** | Explicitly answers the brief's "Memories Instead of Productivity" principle. A milestone is meaningful because of what it *was*, not because it unlocked something. |
| **Visual language** | A Memory with a distinct frame/label applied — no XP number, no level, no progress bar toward "the next one." Just the moment, named. |
| **States** | `earned` (the only state — there is no "in progress," milestones aren't tasks). |
| **Variants** | First-time milestones (first ramen, first onsen), place milestones (visited a specific landmark), personal milestones the user names themselves. |
| **Motion** | The Stamp animation (see below), once, quietly. No confetti, no sound effect, no "Achievement Unlocked!" banner language — see `DESIGN_SYSTEM.md` §0 on avoiding anything that could belong unchanged in a banking app. |
| **Accessibility** | Never conveyed by a badge icon alone — always paired with the plain-language name of the milestone. |
| **Future extensibility** | Could surface as a private trip recap ("this trip's milestones") in Phase 6 — never a public leaderboard (see Phase 9 boundaries in `FEATURE_ROADMAP.md`). |
| **When NOT to use it** | Never invent milestones to drive engagement (streaks, daily-login rewards). If it wouldn't be a genuine personal highlight, it isn't an Achievement. |

**Canonical implementation (built 2026-07-14):** `js/features/achievements/achievements.js`, `window.Achievements`. This is the single implementation — `js/features/gamification/gamification-system.js` (points/levels/leaderboard) and the achievement section of `js/features/social/social-features.js` (a second, independent list) were both retired in favor of it. See `DEPRECATION_LOG.md` for the full migration record.

- **Scope decision:** Achievements are **per trip, not per account** — consistent with Passport being one-per-trip above. `trips/{tripId}/achievements/{userId}` is the single Firestore path (same path the old social-features.js already used; the old account-scoped `users/{uid}/gamification/stats` path is retired).
- **Data model:** `{ unlocked: [{id, unlockedAt}], stats: {twelve manually-tracked counters} }`. A second class of condition (meals tried, bingo completed, stamps collected, journal entries) is computed live from existing localStorage/Firestore data via `getLiveStats()` rather than duplicated into `stats` — see the module's header comment for the full reasoning.
- **22 canonical achievements**, down from the 28 across both old lists — 6 were cut for being feature-usage/engagement metrics with no travel content (creating a "hybrid" itinerary, comparing variations, exporting in N formats, 30 days of app usage, unlocking every other badge). Every remaining name was reviewed and stripped of ranking language ("Maestro," "Experto," "Pro," "Novato," "Leyenda") in favor of plain descriptions of what happened.
- **Public API:** `initialize(tripId)`, `trackAction(action, value)`, `getLiveStats()`, `getStateFor(tripId, userId)` (read-only, any user — used by profile views), `renderPanel()`, `renderAllModal()`. One rendering path, one persistence layer, one set of definitions — every screen that shows achievements calls into this module rather than recomputing anything.
- **Known gap, not caused by this implementation:** most of the 12 manually-tracked counters (budget categories used, notes added, photos added, city diversity, etc.) were **already never being written to** in the pre-existing app — nothing called `trackAction()` for them before this change either. Their achievements are real and correctly specified, just currently unreachable until real call sites are wired up (a future slice, not a defect in this one).

---

## 🔖 Stamp

| | |
|---|---|
| **Purpose** | The mark of completion — not an object you navigate to, but a motion/visual verb applied *to* other objects (a Ticket on completion, a page in the Passport). |
| **Emotional purpose** | Satisfaction and closure — the specific, physical-feeling click of a temple goshuin stamp landing on paper. |
| **Story behind it** | Directly inspired by *goshuin* (御朱印), the hand-stamped temple/shrine seals travelers collect in Japan — already a feature in this codebase (`goshuin-book.js`), generalized into a system-wide completion mark rather than a temple-only feature. |
| **Visual language** | A circular/seal-shaped mark in Ai Indigo or Sango (context-dependent), slightly imperfect placement and rotation (never perfectly centered — real stamps aren't). |
| **States** | Binary — present or absent. A Stamp doesn't have its own state machine; it reflects the state of the object it's attached to. |
| **Variants** | Ticket-completion stamp, Passport page stamp, (future) co-traveler "I was here too" stamp. |
| **Motion** | A quick press-down + slight bounce-settle, ~200ms, with a faint sound-equivalent haptic on supported devices. This is the one place a slightly more physical/tactile motion is earned — it's the payoff moment. |
| **Accessibility** | Must never be the *only* indicator of completion — always paired with a text state change ("Completado"). Respects `prefers-reduced-motion` by cutting straight to the settled end-state. |
| **Future extensibility** | Custom/seasonal stamp art per region (Phase 3 Illustration Library) — a Kyoto stamp should look different from a Hokkaido stamp. |
| **When NOT to use it** | Not a standalone screen element — if something needs to live on its own as a destination, it's a different object, not a Stamp. |

Existing code this replaces/extends: `js/features/japan/goshuin-book.js` (generalizes the pattern beyond temples).

---

## 🛂 Passport

| | |
|---|---|
| **Purpose** | The umbrella collection object for a single trip — holds Stamps, tracks cities/days visited, the trip's identity document. |
| **Emotional purpose** | Accumulation and pride of record — flipping through a passport full of stamps at the end of a trip. |
| **Story behind it** | The literal object every traveler already carries and already associates with "proof of where I've been." |
| **Visual language** | Book/booklet metaphor, a cover per trip (city/season art from the Illustration Library), pages that fill with Stamps as the trip progresses. |
| **States** | `fresh` (trip just started, empty pages) → `filling` → `complete` (post-trip, becomes an archival object). |
| **Variants** | One Passport per trip (not per user) — a user with 3 trips has 3 Passports, reinforcing each trip as its own story. |
| **Motion** | Page-flip on navigation between sections, consistent with Journal's paper-settle language — these two objects should feel like they're made of the same material. |
| **Accessibility** | Page-flip navigation needs a non-gestural equivalent (buttons/keyboard), and a flat list view as an alternative to the book metaphor for screen-reader users. |
| **Future extensibility** | Physical print-on-demand export (a real printed passport booklet) is a plausible Phase 10 platform expansion. Its current PDF-export placeholder is the seed of the future "Travel Memories" travel-book experience — see `FEATURE_ROADMAP.md` Phase 5/6. |
| **When NOT to use it** | Not a dumping ground for every object — it holds Stamps specifically, not raw Memories or Tickets (those live in their own spaces and can *contribute* a Stamp here). |

**Canonical implementation rule:** Passport is not just an object entry — it is **the one shared foundation every collectible in Japitin inherits from.** Food Passport, the goshuin/shrine-stamp book, and any future collectible ("onsen passport," "matsuri passport," whatever comes next) are *variants configured on top of the same Passport base*, not independent parallel implementations. This directly enacts `ARCHITECTURE_PRINCIPLES.md`'s "every reusable object has one canonical implementation" rule — the pre-redesign codebase had `goshuin-book.js` and `ramen-passport.js` as near-identical, independently-maintained clones; that pattern does not get repeated going forward.

Existing code this replaces/extends: generalizes `js/features/japan/goshuin-book.js`'s book UI into the canonical base; `js/features/japan/ramen-passport.js` becomes the Food Passport variant of the same base rather than its own file.

---

## 🚆 Train Pass

| | |
|---|---|
| **Purpose** | The literal transit-payment object — JR Pass validity, or a Suica/Pasmo IC card balance. Money and mobility, not itinerary. |
| **Emotional purpose** | Confidence at the gate — the specific relief of knowing you can get through the turnstile. |
| **Story behind it** | Every visitor to Japan has the same small anxiety: will this card work at the gate? This object exists to answer that before the user is standing at it. |
| **Visual language** | Literal transit-card proportions and material feel — a gradient card face, balance in large Plex Mono numerals, a tap/NFC glyph, last-used station. Deliberately closer to a real wallet card than any other object in the system. |
| **States** | `sufficient balance` / `low balance` (Yuzu Orange warning, per `DESIGN_SYSTEM.md` §5 this is exactly the kind of moment Yuzu is reserved for) / `JR Pass expired`. |
| **Variants** | IC card (Suica/Pasmo, running balance), JR Pass (date-range validity, no balance concept). |
| **Motion** | A tap/pulse ripple when balance updates, echoing a real NFC tap. |
| **Accessibility** | Balance and validity dates in real text, never rendered only inside a card-face graphic. |
| **Future extensibility** | Real top-up integration if Japitin ever gets payment capability (explicitly a Phase 8+ question, not now). |
| **When NOT to use it** | Not for tracking discretionary spending — that's Budget. Train Pass is specifically about transit access, not money in general. |

Existing code this replaces/extends: `js/features/japan/jr-pass-calculator.js`; adopts the IC-card visual pattern from the newly added reference boards (`images/illustrations/reference/`).

---

## 🎒 Backpack

| | |
|---|---|
| **Purpose** | The packing list — what to bring, what's packed, what's still missing. |
| **Emotional purpose** | Preparedness turning into excitement — the specific feeling of packing the night before a trip. |
| **Story behind it** | Packing is one of the few pre-trip rituals that's genuinely enjoyable when it's going well — the object should lean into that instead of feeling like a chore checklist. |
| **Visual language** | Items as small illustrated icons (not generic checkboxes) grouped by category, a fill-level visual (the backpack itself getting visually "fuller" as items are checked, if feasible) rather than a bare percentage. |
| **States** | `unpacked` / `packed` / `essential-missing` (flagged distinctly — a missing passport is not the same severity as a missing phone charger). |
| **Variants** | Per-category checklist (clothing/documents/electronics), smart list (weather/season-adjusted suggestions). |
| **Motion** | A satisfying settle/drop when an item is checked off — quick, not showy. |
| **Accessibility** | Category grouping must be navigable by screen reader as actual grouped headings, not just visual proximity. |
| **Future extensibility** | Weather-aware suggestions once Weather + Travel Intelligence (Phase 7) exist together. |
| **When NOT to use it** | Not for anything the user needs to do (tasks) — only for physical items they need to bring. |

Existing code this replaces/extends: `js/features/trips/packing-list.js`.

---

## 🍜 Food Passport

| | |
|---|---|
| **Purpose** | Dishes tried, restaurants visited, a food-specific diary — the culinary parallel to the Passport object. |
| **Emotional purpose** | Delight and a little pride — "I tried real Hokkaido ramen," the specific joy of food-as-travel-souvenir. |
| **Story behind it** | Directly extends the already-built `ramen-passport.js` concept from ramen specifically to the full range of Japanese food a traveler encounters. |
| **Visual language** | Dish illustrations (Illustration Library "Food" category) in a passport-page grid, a Stamp on each dish once tried, a short personal note field per entry. |
| **States** | `to try` (a Discovery-sourced wishlist item) → `tried` (Stamped, becomes a Memory). |
| **Variants** | Regional specialty tracker (ties dishes to the cities in Travel Card's route), personal favorites list. |
| **Motion** | Shares the Stamp motion when a dish is marked tried. |
| **Accessibility** | Dish names in both Japanese and Spanish/romaji where relevant, since correct pronunciation at a restaurant is part of the object's real-world utility. |
| **Future extensibility** | Could surface restaurant Discovery recommendations based on unfilled regional specialties. |
| **When NOT to use it** | General restaurant reservations → Reservation object, not Food Passport (Food Passport is about the dish/experience, not the booking logistics). |

Existing code this replaces/extends: `js/features/japan/ramen-passport.js`, rebuilt as the Food Passport variant of the canonical Passport base defined above — not a standalone file.

---

## ☀️ Weather

| | |
|---|---|
| **Purpose** | Current and forecast conditions for the user's current or upcoming city. |
| **Emotional purpose** | Practical calm — a quick glance, not a moment to dwell on. |
| **Story behind it** | The thing every traveler checks reflexively each morning; it should feel that fast and that unremarkable to use. |
| **Visual language** | Small illustrated weather glyphs (from the Illustration Library "Weather" category) rather than generic sun/cloud icon-font glyphs, paired with Plex Mono temperature. |
| **States** | `today` / `forecast` (next few days) — no other state complexity needed. |
| **Variants** | Compact chip (inline in Travel Card/hero scenes, as already built into the approved Home mockup), detailed forecast (hourly, in a dedicated view). |
| **Motion** | None beyond a gentle fade on data refresh — this is a Travel-Card-family object, efficiency wins. |
| **Accessibility** | Icon-only weather states are never acceptable — always paired with a text description ("Nublado, 16°C"), not just a cloud glyph. |
| **Future extensibility** | Could inform Backpack's smart suggestions and Discovery's outdoor/indoor filtering (Phase 7). |
| **When NOT to use it** | Not a decorative background element — if weather data isn't live/real, don't render the object at all (ties to the empty/loading-state honesty principle in `DESIGN_SYSTEM.md` §6). |

Existing code this replaces/extends: weather widget inside `js/utils/utils-handler.js`.

---

## ⏱ Countdown

| | |
|---|---|
| **Purpose** | Time remaining — until the trip starts, or until the current activity/day ends. The object that carries urgency. |
| **Emotional purpose** | Momentum. The specific feeling of a countdown clicking down during a temple visit you don't want to rush but also don't want to miss the next train for. |
| **Story behind it** | Directly inspired by boarding-gate and departure-board countdowns — the reference image's "11:50:15 Remaining time" ring, already built into the approved Home/Itinerary mockups. |
| **Visual language** | Circular ring, gradient Umi-to-Ai fill, Plex Mono digits, always attached to or overlapping a Ticket or Travel Card rather than floating free. |
| **States** | `far` (days, calm) / `near` (hours, slightly more saturated) / `urgent` (minutes, Sango-adjacent without becoming alarming — this is still a trip, not an emergency). |
| **Variants** | Trip countdown (days), activity countdown (minutes/hours, live-updating). |
| **Motion** | The ring itself is the motion — a slowly depleting arc. No numeric jitter; update once per minute at most, never a jarring per-second re-render. |
| **Accessibility** | The numeric time remaining must be real text, not just an SVG arc — screen readers need the number, not the shape. Respects `prefers-reduced-motion` by updating without any transition animation on the arc. |
| **Future extensibility** | Live Mode (`js/features/planning/live-mode.js`) is the natural home for the activity-level countdown variant. |
| **When NOT to use it** | Not a general-purpose timer/stopwatch utility — it only ever counts down to a specific trip or itinerary moment, never a generic productivity timer. |

Existing code this replaces/extends: new — formalizes the countdown ring already designed into the Home/Itinerary mockups in the visual proposal.

---

## 💰 Budget

| | |
|---|---|
| **Purpose** | Spend tracking against a trip budget — the money instrument, parallel to Backpack for physical items. |
| **Emotional purpose** | Peace of mind, not anxiety. A budget object that makes someone feel judged for spending on their own trip has failed. |
| **Story behind it** | The mental math every traveler does at the end of a day — "am I still okay?" — externalized so it doesn't have to be done in the user's head at a register. |
| **Visual language** | Progress bar (spent/total) plus category breakdown, Plex Mono for all figures, Matcha for on-track and a soft Sango-adjacent warm tone (never full alarm-red) for over-budget — deliberately gentler than a banking app's red. |
| **States** | `on track` / `approaching limit` / `over budget` (informational, never blocking — the user can always keep spending, the object just keeps them informed). |
| **Variants** | Trip-total summary (Travel-Card-family, home screen), category detail (transport/food/lodging/shopping breakdown), per-expense entry. |
| **Motion** | Bar fill animates once on data change, otherwise static — Travel-Card-family restraint applies here too. |
| **Accessibility** | All amounts in real selectable text with currency clearly marked; color is never the sole signal for over-budget status — always paired with the word. |
| **Future extensibility** | Currency-converter integration (already exists, `js/features/budget/currency-converter.js`) surfaces inline for multi-currency trips. |
| **When NOT to use it** | Not for tracking transit fare specifically — that nuance belongs to Train Pass. Budget is the whole-trip financial picture. |

Existing code this replaces/extends: `js/features/budget/bento-budget.js`, `budget-tracker.js`, `budget-intelligence.js`.

---

## Cross-object rules

- **An object never impersonates another.** A Reservation that's due today doesn't quietly become a Ticket without a visible transition — the user should be able to tell what kind of thing they're looking at from its shape alone, even out of context.
- **Stamp and Countdown are not destinations.** Every other object can be the primary content of a screen; these two are always attached to something else.
- **Every object's `When NOT to use it` is binding.** If an implementer reaches for an object outside its listed purpose because it's visually convenient, that's a signal a new variant — or, rarely, a 16th object — is needed, not a shortcut to take.
- **Reusable interaction patterns get documented here before they get reused.** If implementation work produces a pattern used across multiple objects (a confirmation modal, an add/edit form shell), it gets a short entry in this document — purpose, anatomy, which objects use it — before a second object reuses it. This is what keeps "modal" from quietly becoming three slightly-different modals the way `.activity-card` once became three slightly-different cards.
