# Japitin — Architecture Principles

Companion doc to `SOUL.md`. Where the other foundational documents govern what Japitin *feels* and *looks* like, this one governs how it's *built* — specifically, how it avoids quietly re-accumulating the problem this whole redesign started by fixing: the original codebase audit found 46 CSS files with at least 7 competing color-token systems, 3–4 independent implementations of "activity card," and — discovered later — 4 independent, non-integrated gamification systems, one of them showing a fake hardcoded leaderboard. None of that happened on purpose. It happened one reasonable-seeming shortcut at a time. These principles are how it doesn't happen again.

---

## One source of truth

Every piece of data, every design token, every domain concept has exactly one place it's defined. Not a primary copy and a cache that's supposed to stay in sync — one place.

**Why:** `css/tokens.css` exists because the pre-redesign codebase had brand color defined five different ways (`#7c3aed`, `#9333ea`, `#E91E63`, `#C41E3A`, `#FF6B9D`) across five files, none of them aware of the others. The fix wasn't picking a winner — it was making sure there was only ever one place to look.

**How to apply:** Before adding a new constant, config value, or piece of state, search for whether it already exists somewhere else first. If two systems need the same fact (e.g., a trip's expense total), one of them owns it and the other reads from it — they don't each keep their own copy.

---

## One responsibility per system

A file or module does one job. When a second, unrelated job creeps into it "since the file's already open," that's a new file, not an addition to the old one.

**Why:** `bento-budget.js` is a good example of this working correctly — it doesn't maintain its own expense list, it renders `BudgetTracker.expenses` and adds exactly one new responsibility (category-budget splitting) on top. Contrast `social-features.js`, which mixes achievement-tracking, daily challenges, and (elsewhere in the same file) group chat concerns — three responsibilities that now have to be untangled from each other during the gamification cleanup specifically because they were never separated.

**How to apply:** If describing what a file does requires the word "and" more than once, it's a candidate to split.

---

## Never duplicate domain logic

The rules for what a "trip," a "memory," a "reservation" *is* — validation, state transitions, derived values — exist in one implementation, referenced everywhere, never re-derived independently in a second place.

**Why:** `goshuin-book.js` and `ramen-passport.js` were found to be near-identical, independently-written implementations of the same underlying concept (a timestamped, localStorage-backed collectible with notes and a photo). Neither was wrong on its own; the problem was that a bug fix or a feature improvement to one would silently not apply to the other, because nothing connected them. This is exactly the failure `OBJECT_BIBLE.md`'s canonical shared Passport foundation is designed to end.

**How to apply:** Before writing a new CRUD/state-management module, check `OBJECT_BIBLE.md` for whether an existing object's implementation already covers the shape of what's needed. If it's close but not identical, that's a variant of the existing implementation, not a new one.

---

## Prefer extension over parallel implementations

When existing code almost does what's needed, the default move is to extend it — add a parameter, add a variant, add a configuration — not to copy it and modify the copy.

**Why:** This is the direct antidote to the goshuin/ramen problem above, and to the four-gamification-systems problem: `gamification-system.js`, `location-game.js`, `social-features.js`, and `japan-utils.js` each independently reinvented "track user progress toward something" rather than one of them being extended by the others.

**How to apply:** A parallel implementation is sometimes still the right call (genuinely different domains deserve genuinely different code) — but it should be a deliberate decision made once, documented in the relevant foundational doc, not a default reached for because reading the existing code took longer than rewriting it.

---

## Deprecate before deleting

Nothing meaningful — especially not user data — disappears in the same step that removes the code that used it. A deprecation is announced, a migration path exists (or is explicitly declared unnecessary and why), and only then does removal happen.

**Why:** This is a direct product commitment, not just a coding-hygiene rule: `SOUL.md`'s memories-not-productivity principle means a user's actual travel history — a goshuin stamp collected, a ramen visit logged, a badge earned — represents something that happened to them in Japan. Replacing the system that stored it must never mean the memory itself vanishes.

**How to apply:** Every removal gets an entry in `DEPRECATION_LOG.md` *before or at the same time as* the removal, including a migration note for any real user data the old system held. If a migration genuinely isn't technically possible, that's stated explicitly, not left silent.

---

## Every reusable object has one canonical implementation

`OBJECT_BIBLE.md`'s 15 objects are not suggestions with several acceptable implementations scattered around the codebase — each has exactly one real implementation that every screen using that object references.

**Why:** This is what makes `OBJECT_BIBLE.md` binding rather than aspirational. An object with three implementations is not one object, no matter what the documentation calls it.

**How to apply:** If a screen needs a Ticket, it uses the Ticket implementation — it doesn't build a similar-looking card locally because the real one doesn't quite fit yet. If it doesn't quite fit, the real implementation gets extended (see above), and every other screen using Ticket benefits from that fix too.

---

## Every reusable visual pattern has one owner

A modal, a form shell, a confirmation dialog, a progress indicator — any interaction pattern used by more than one object — has one implementation and one place it's documented (`OBJECT_BIBLE.md`'s cross-object rules section), not a slightly different version per object that happened to need one.

**Why:** `packing-list.js` currently uses the browser's native `prompt()`/`confirm()` instead of the app's own modal system — a small-scale version of exactly this problem: a screen quietly building its own interaction pattern instead of using (or fixing) the shared one.

**How to apply:** Before building a new modal/dialog/form pattern, check whether one already exists. If the implementation work produces a new reusable pattern, it gets documented in `OBJECT_BIBLE.md` before a second object reuses it.

---

## Data preservation is not optional

Whenever a system is replaced, real user data connected to it is preserved wherever technically possible. "We rebuilt the achievement system" must never quietly mean "and everyone's unlocked badges are gone."

**Why:** Ties directly to `SOUL.md` — a memory is something that happened to a real person on a real trip. Losing it in a migration is not an acceptable engineering tradeoff, it's a broken promise to the user.

**How to apply:** Before a migration removes or restructures a data model, identify what real data exists under the old shape (check Firestore/localStorage in whatever environment is available) and write the migration path — even a manual one-time script — before or alongside the removal. If preservation genuinely isn't possible for some field, say so explicitly in `DEPRECATION_LOG.md` rather than letting it go unmentioned.

---

## Data locality: what's local, cloud, or hybrid today

Requested explicitly so synchronization can be designed on purpose later, instead of discovered by accident. Audited 2026-07-14 across every storage-touching feature file found this far into the project. **Cloud-backed** = Firestore/Storage is the source of truth. **Hybrid** = Firestore is primary but a localStorage fallback/cache exists. **Local-only** = never leaves the browser; a cleared cache or a second device loses it entirely.

### Cloud-backed (no local fallback)
- Trip metadata — `trips/{tripId}` (`trips-manager.js`)
- Photos — `trips/{tripId}/photos` + Firebase Storage (`photo-gallery.js`) — confirmed no offline mode
- Reservations — `trips/{tripId}/data/reservations` (`reservations-manager.js`) — confirmed no offline mode; `init()` no-ops without a `tripId`
- Group chat, activity timeline, polls — `trips/{tripId}/chat`, `/timeline`, `/polls`, real-time via `onSnapshot`
- **Achievements** — `trips/{tripId}/achievements/{userId}` (`achievements.js`) — state lives in memory + Firestore only, no localStorage
- User profile — `users/{userId}`
- Social feed / Travel Twins — `posts`, `travelTwinsPool`, `travelTwinsThreads`

### Hybrid (Firestore primary, localStorage fallback or cache)
- Packing list — `packing-list.js`: Firestore (`trips/{id}/data/packing` or `users/{id}/data/packing`) with `onSnapshot`, **and** always dual-writes to `localStorage['packingList']`
- Budget/expenses — `budget-tracker.js`: Firestore `trips/{id}/expenses` when a trip+user exist, falls back fully to `localStorage['expenses']` otherwise
- Budget category splits — `bento-budget.js`: `trip.info.categoryBudgets` (Firestore) or `localStorage['bento_category_budgets']`/`['bento_total_budget']` fallback
- Journal entries — `travel-journal.js`: Firestore `trips/{id}/journal` with `onSnapshot`, **and** write-through cached to `localStorage['journal_entries']`, which also serves as the offline/no-trip fallback

### Local-only (never synced — the most consequential finding here)
- **Goshuin book — `localStorage['goshuin_book']`.** No Firestore at all.
- **Ramen Passport — `localStorage['ramen_passport']`.** No Firestore at all.
- Achievement-condition trackers read by `Achievements.getLiveStats()` — `localStorage['japanFoodTracker']`, `['japanTravelBingo']`, `['japanStampCollection']`
- "Momentos Registrados" (formerly the streak tracker) — `localStorage['streaks']`
- Location-guessing game score — in-memory only, not even localStorage; resets on reload
- `currentTripId` — localStorage device/session pointer (correct as local-only by design, this one shouldn't sync)

**Why this matters:** Goshuin and Ramen Passport are exactly the objects `OBJECT_BIBLE.md` and `SOUL.md` treat as the most emotionally important — real collected memories of a real trip — and they're the ones with zero durability. A cleared browser cache or a new device silently erases them, with no warning anywhere in the product that this could happen. Any future sync-strategy work should treat migrating these two onto the same Firestore pattern already proven by Reservations/Photos as the highest-priority item, not an equal-weight backlog entry.

---

## How these principles get used

Every proposal written under `FEATURE_ROADMAP.md`'s Step 1–5 workflow gets checked against this document during Step 2 (compare against every foundational document), alongside `SOUL.md`, `EXPERIENCE_GUIDELINES.md`, `DESIGN_SYSTEM.md`, `OBJECT_BIBLE.md`, and `ILLUSTRATION_LIBRARY.md`. Where `SOUL.md` and `EXPERIENCE_GUIDELINES.md` ask "does this feel right," this document asks "will this still be one clean system a year from now, or the beginning of a fifth gamification implementation."
