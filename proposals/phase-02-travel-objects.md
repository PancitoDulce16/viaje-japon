# Proposal — Phase 2: Travel Objects

Status: **approved, with adjustments (see "Decisions" below). Step 4 implementation in progress, one slice at a time.**

Per the Step 1–5 workflow (see `FEATURE_ROADMAP.md`), this is Steps 1–3 for Phase 2: analyze what exists, compare it against `SOUL.md` / `EXPERIENCE_GUIDELINES.md` / `DESIGN_SYSTEM.md` / `OBJECT_BIBLE.md` / `ILLUSTRATION_LIBRARY.md` / `FEATURE_ROADMAP.md`, and propose what changes. Ground truth for the "reuse/discard" calls below came from a direct code audit of every file named (classes, data models, storage, exact line numbers), not assumption.

---

## The one decision that matters most: gamification is not one system, it's four

This is the largest, most consequential change in this phase, and it needs approval before anything else here proceeds.

**Current state:** Points/levels/streaks/badges exist in **four independent, non-integrated systems**, each with its own storage and its own definition of "achievement":

1. `js/features/gamification/gamification-system.js` — Firestore-backed XP/level/20-badge system (`users/{userId}/gamification/stats`).
2. `js/features/gamification/location-game.js` — a photo-guessing mini-game with its own in-memory-only score and a **hardcoded fake leaderboard** (`top3 = [{username:'japan_master', score:1250}, ...]` — not real data).
3. `js/features/social/social-features.js` — a *third* achievement list (12 items) plus a daily-challenge mechanic, reading from localStorage keys that don't match the other systems' keys.
4. `js/utils/japan-utils.js` — a *fourth* streak counter (localStorage key `'streaks'`), unrelated to `gamification-system.js`'s own `loginStreak` field.

None of these four share a data model. Two additional pieces of dead weight sit on top: `export-import-system.js` reads/writes properties (`.points`, `.level`, `.achievements`, `.save()`) that don't exist on the real `GamificationSystem` class — a silently broken no-op path — and `module-loader.js` has a lazy-route entry for `achievement-tracker.js`, a file that doesn't exist. (`CLAUDE.md`'s mention of `challenge-system.js` is also stale — that file doesn't exist either; it was never built or was removed without updating the doc.)

**Why it should change:** `SOUL.md` states plainly — "No XP, no points, no levels, no leaderboards, no streaks." `OBJECT_BIBLE.md`'s Achievement object goes further: it names `gamification-system.js`/`challenge-system.js` as the pattern it *supersedes*, not restyles, and its `When NOT to use it` line is explicit: "never invent milestones to drive engagement." A fake leaderboard showing invented usernames is the single clearest violation of `SOUL.md` found anywhere in the codebase.

**Proposal:**
- **Delete outright:** the points/XP/level machinery in `gamification-system.js` (badge point values, `userStats.xp`, the 6-level table, `getCurrentLevel()`/`getProgressToNextLevel()`), all of `location-game.js`'s scoring and its fake leaderboard, `social-features.js`'s daily-challenge mechanic (`renderDailyChallenges`/`loadDailyChallenge`/`completeChallenge` and the `trips/{tripId}/challenges/{date}` collection), the dead `export-import-system.js` gamification properties, and the dangling `module-loader.js` route entry.
- **Reuse and reshape into the new Achievement object:** `gamification-system.js`'s 20 badge *definitions* are mostly good raw material — many already read as genuine milestones once stripped of point values ("first trip created," "5 cities explored"). `social-features.js`'s 12-item achievement list and its unlock-condition-checking pattern (`checkAndUpdateAchievements`) is the closer architectural match to what Achievement needs (boolean unlock, no score) and is the better base to build from; `gamification-system.js`'s badge *content* gets merged into it, not the reverse.
- **Reuse as-is, reframe only:** `japan-utils.js`'s day-gap streak logic (`diffDays > 1` resets) is the one piece of "streak" code that isn't a dead counter — but per `SOUL.md` it can't survive as a user-facing streak. Its 3 tracked activities (food/photo/learn) are actually decent Memory-capture triggers; propose repurposing the day-gap detection internally as a "you haven't logged a memory in a while" gentle nudge (Discovering/Remembering stage tone per `EXPERIENCE_GUIDELINES.md` — an invitation, never a guilt mechanic), not as a displayed streak number.
- **Keep unrelated to gamification, do nothing:** `location-game.js`'s actual guessing-game mechanic (photo → guess the place) is a fine Discovery-adjacent mini-feature on its own — only its scoring/leaderboard layer is in scope for removal here, not the game itself. Flagging as out-of-scope for Phase 2 rather than silently deciding its fate.

This consolidation touches four files plus two dangling references — bigger than a typical single-object change, which is why it's called out before the per-object list below rather than buried inside "Achievement."

---

## Per-object analysis

For each object: current code, target state, what's reused, what disappears, which document justifies it. Objects with no meaningful existing implementation (Ticket, Discovery, Countdown) are marked build-new.

### 🎫 Ticket
- **Current:** activity blocks inside `itinerary-v3.js`, styled with raw Tailwind utilities stacked on 3 separate `.activity-card` CSS definitions (`main.css`, `theme-kawaii.css`, `ui-improvements.css`).
- **Target:** `.card--ticket` per `OBJECT_BIBLE.md` — die-cut notches, dashed divider, Plex Mono time.
- **Reuse:** the underlying activity data model in `itinerary-v3.js` is untouched — only the rendering/markup changes.
- **Disappears:** the 3 competing `.activity-card` CSS definitions once the migration lands (not yet — Phase 2 builds the object in isolation per `FEATURE_ROADMAP.md`'s explicit boundary; deletion of the old CSS happens when Phase 4 actually migrates the itinerary screen, not now).
- **Docs:** `DESIGN_SYSTEM.md` §2 (signature object), `OBJECT_BIBLE.md`.

### 📖 Journal
- **Current:** `travel-journal.js` — solid data model (title/date/content/mood/tags), Firestore + localStorage fallback, mood-emoji cards. No visual relationship to the approved palette/type yet.
- **Target:** `.card--journal` — washi texture, torn-edge accent, photo bleed.
- **Reuse:** the entire data model and Firestore/localStorage sync logic — this file's problem is purely visual, not structural.
- **Disappears:** nothing structural; only Tailwind-utility styling in the render functions gets replaced.
- **Docs:** `OBJECT_BIBLE.md`, `EXPERIENCE_GUIDELINES.md` §Remembering (paper-settle motion, personal first-person copy).

### 🗺 Discovery
- **Current:** no dedicated object — `attractions.js`/`google-places.js`/`hidden-gems-map.js` fetch data but render into generic cards.
- **Target:** `.card--discovery` — image-forward, single tag, swipe row.
- **Reuse:** the data-fetching layer entirely.
- **Disappears:** whatever ad hoc card markup currently wraps attraction results (not separately audited — low risk, no shared class name found in the original CSS audit for attraction cards specifically).
- **Docs:** `OBJECT_BIBLE.md`, `EXPERIENCE_GUIDELINES.md` §Exploring (fast one-tap actions).

### 🧳 Travel Card
- **Current:** `trips-manager.js`'s `updateTripHeader()` — the countdown/stats/action-buttons block already fixed once during the mobile pass (moved outside the sticky header, per project history).
- **Target:** `.card--travel` family — deliberately flat/utilitarian, route map + stats.
- **Reuse:** `updateTripHeader()`'s data assembly logic.
- **Disappears:** its current Tailwind-only visual treatment.
- **Docs:** `OBJECT_BIBLE.md`, `DESIGN_SYSTEM.md` §0 (efficiency allowed to win here).

### 🏨 Reservation
- **Current:** `reservations-manager.js` — genuinely well-built: real modal forms (not `prompt()`), PDF/CSV export, a real Firestore-only data model (`type/name/date/time/location/confirmationNumber/url/notes`), a "próximamente" 7-day-warning chip already implemented.
- **Target:** `.card--reservation` (an `OBJECT_BIBLE.md` variant of the Reservation object) — confirmation-code-forward, formal, high-contrast.
- **Reuse:** essentially all of it — data model, modal, export, the 7-day warning logic map directly onto the object spec with no structural change needed.
- **Disappears:** nothing functional, only `renderReservationCard()`'s visual template.
- **Docs:** `OBJECT_BIBLE.md` (notes this is the one object prioritizing speed-to-information over delight — already true of this file's current UX).

### 📸 Memory + 🎏 Achievement
- **Current:** no dedicated "Memory" concept exists yet; closest analog is `photo-gallery.js`'s upload flow (no "kept/framed" state) and the achievement systems addressed above.
- **Target:** Memory as a new lightweight capture object (photo/text + timestamp + location, `captured → kept → framed` states); Achievement as the milestone-recognition frame described above.
- **Reuse:** `photo-gallery.js`'s Storage-upload plumbing (path convention, `uploadBytes`/`getDownloadURL`) is the right foundation for Memory's photo variant — no need to build new upload code. `social-features.js`'s achievement condition-checking pattern reused for Achievement (post-gamification-strip).
- **Disappears:** see the gamification section above.
- **Docs:** `SOUL.md` (Memories not productivity), `OBJECT_BIBLE.md`, `EXPERIENCE_GUIDELINES.md` §Discovering/§Remembering.

### 🔖 Stamp + 🛂 Passport
- **Current:** `goshuin-book.js` (106 lines) — temple-specific but structurally generic already (`{id, fecha, notas, foto}` core, localStorage-only, no sync). Near-identical in architecture to `ramen-passport.js`.
- **Target:** Stamp as a motion/mark applied to other objects; Passport as the umbrella collection book, generalized beyond temples.
- **Reuse:** `goshuin-book.js`'s CRUD methods and stats aggregation (`obtenerEstadisticas`) generalize cleanly — propose extracting a shared base "collectible tracker" pattern that both Passport and Food Passport (below) implement, rather than three near-duplicate files going forward.
- **Disappears:** the temple-only framing and hardcoded `TEMPLOS_FAMOSOS` seed list moves to being one data set among several, not the whole feature's identity. `exportarPDF()` is currently an unimplemented stub — either finish it or drop the button in Phase 2 (flagged as an open question below).
- **Docs:** `OBJECT_BIBLE.md` (explicitly names `goshuin-book.js` as what Stamp/Passport generalize).

### 🚆 Train Pass
- **Current:** `jr-pass-calculator.js` — solid, stateless cost-comparison math (`calcularValorJRPass`, route database, itinerary-derived trip legs). **No IC-card/balance feature exists at all** — only one line of static advice text mentioning Suica/Pasmo.
- **Target:** the JR Pass calculator becomes one variant of Train Pass; a real IC-card balance/validity widget is new build, not a reuse.
- **Reuse:** all of the JR Pass math and the itinerary-derived trip-leg detection (`derivarViajesDeItinerario`) — genuinely good logic, purely a visual-object wrapper needed.
- **Disappears:** nothing existing; the IC-card variant is additive.
- **Docs:** `OBJECT_BIBLE.md` flags the IC-card visual pattern as sourced from `images/illustrations/reference/` (the new reference boards) — confirms this was already anticipated as new build, not reuse.

### 🎒 Backpack
- **Current:** `packing-list.js` — well-built (dual Firestore/localStorage sync, 44 seeded items across 6 categories, per-category progress). Two rough edges: custom-item add uses a browser `prompt()`, and reset uses `confirm()` — both bypass the app's own modal system.
- **Target:** `.card--travel` family object with illustrated items instead of generic checkboxes, per `OBJECT_BIBLE.md`.
- **Reuse:** the entire data model and sync logic unchanged.
- **Disappears:** the `prompt()`/`confirm()` calls get replaced with real modals as part of this pass (small scope, but worth doing while the file's open — flagged as in-scope, not scope creep, since it directly blocks the object's accessibility requirement around focus management that `prompt()`/`confirm()` can't satisfy consistently).
- **Docs:** `OBJECT_BIBLE.md`.

### 🍜 Food Passport
- **Current:** `ramen-passport.js` — near-clone of `goshuin-book.js` (see above), ramen-only.
- **Target:** generalized Food Passport per `OBJECT_BIBLE.md`, sharing the proposed base collectible-tracker with Passport.
- **Reuse:** all CRUD/stats logic; `obtenerTopRamen()`'s rating-sort pattern generalizes to any dish.
- **Disappears:** the ramen-only framing (becomes one food category among several).
- **Docs:** `OBJECT_BIBLE.md` (names `ramen-passport.js` directly as what this generalizes).

### ☀️ Weather
- **Current:** a widget inside `utils-handler.js`'s accordion (not deeply audited this pass — out of the 9 files researched — treated as a known small widget per the original architecture audit).
- **Target:** small illustrated glyphs per `ILLUSTRATION_LIBRARY.md`'s Weather category, chip + detailed variants.
- **Reuse:** the weather API integration.
- **Disappears:** whatever icon-font weather glyphs are currently used, in favor of the new illustration set once Phase 3 produces it (Weather glyphs are a Phase 3 dependency — Phase 2 can build the object shell but the final art isn't ready until Illustration Library work starts).
- **Docs:** `OBJECT_BIBLE.md`, `ILLUSTRATION_LIBRARY.md`.

### ⏱ Countdown
- **Current:** no dedicated implementation — the countdown ring exists only in the approved visual-proposal artifact mockup, not in real code yet.
- **Target:** build new, exactly as specified in `OBJECT_BIBLE.md` and demonstrated in the artifact.
- **Reuse:** n/a — new build.
- **Disappears:** n/a.
- **Docs:** `OBJECT_BIBLE.md`, `DESIGN_SYSTEM.md` (signature-adjacent element from the approved proposal).

### 💰 Budget
- **Current:** `budget-tracker.js` (expense source of truth, Chart.js pie chart) + `bento-budget.js` (a second renderer over the same expense array, plus its own category-budget-splitting feature and SVG bento-box visualization). Two files, one data store — not two competing systems, confirmed via direct audit.
- **Target:** `.card--travel` Budget object per `OBJECT_BIBLE.md` — gentler over-budget tone (no alarm-red), Plex Mono figures.
- **Reuse:** the entire shared expense data model, both files' Firestore/localStorage sync, and `bento-budget.js`'s category-budget concept (genuinely good, keep the bento-box idea as a variant — it's playful in exactly the way `OBJECT_BIBLE.md`'s "Budget" entry allows for the trip-total summary variant, even though Budget is otherwise Travel-Card-family-restrained).
- **Disappears:** the two dead `GamificationSystem` badge conditions (`budgetMaster`/`frugalTraveler`) that reference counters neither budget file ever increments — cleanup falls out of the gamification decision above, not a separate change here.
- **Docs:** `OBJECT_BIBLE.md`, `DESIGN_SYSTEM.md` §5 (color usage — over-budget state must not use full alarm red).

---

## Shared infrastructure

**`EmptyStates`/`LoadingStates`:** confirmed reskinnable without rewrite — both expose stable method signatures (`EmptyStates.itinerary()`, `LoadingStates.createSkeleton()`, etc.) that return either a plain `HTMLElement` or, in one case (`createProgressBar`), a small controller object. Reskinning means editing the Tailwind-utility template strings inside these two files to the new tokens — not a rewrite, not a new architecture. One inconsistency worth fixing while in there: `EmptyStates` uses static class methods, `LoadingStates` uses instance methods — propose leaving that structural difference alone (not in scope for a visual reskin) unless it actively blocks something.

**New build artifacts for Phase 2:**
- `css/objects.css` (or `css/objects/` split by object if it grows large) — one stylesheet implementing all 15 `.card--*` classes from `OBJECT_BIBLE.md`, imported into `app.css` after `tokens.css`.
- A kitchen-sink/style-guide page (`objects-preview.html`, dev-only, excluded from Firebase deploy like the existing dev pages) demonstrating every object in every state, per `FEATURE_ROADMAP.md` Phase 2's explicit instruction to prove objects correct in isolation before any screen uses them.

---

## What Phase 2 does NOT touch

Per `FEATURE_ROADMAP.md`'s own boundary for this phase: no screen layouts, no navigation changes, no real data wiring into the objects beyond what's needed to demonstrate them in the kitchen-sink page. `itinerary-v3.js`, `reservations-manager.js`, etc. keep rendering exactly as they do today in the live app — only new, additional object CSS/markup gets built and demonstrated standalone. The actual swap-over happens screen-by-screen in Phase 4.

---

## Decisions (resolved)

1. **Gamification consolidation scope — full strip, confirmed.** Not just the fake leaderboard: no XP, no levels, no streaks, no leaderboards, anywhere, in any of the four systems. Replace with a single Achievement system where an achievement *is* a memory, not a reward — framed explicitly as "adding another page to a travel journal," never as unlocking a level. `location-game.js` is **not deleted** — its exploration/guessing mechanic stays, only its scoring and fake leaderboard are removed (see decision 6).
2. **`goshuin-book.js`'s `exportarPDF()` stub — kept, not dropped.** Leave a clean, honestly-labeled placeholder (visible button, "coming soon," never silently broken). Documented in `FEATURE_ROADMAP.md` Phase 5/6 as the seed of a future "Travel Memories" experience — eventually a real illustrated travel book, not a plain PDF export.
3. **`packing-list.js`'s `prompt()`/`confirm()` → real modals — approved, explicitly not scope creep.** If this produces a reusable modal pattern, it gets documented in `OBJECT_BIBLE.md`'s cross-object rules before any other object reuses it, per `ARCHITECTURE_PRINCIPLES.md`'s "every reusable visual pattern has one owner."
4. **`location-game.js`'s guessing mechanic — kept.** Only the competitive layer (score, fake leaderboard) is removed; the goal becomes discovering Japan, not earning points.

## Additional decisions from the approval that expand this proposal's scope

- **Passport is now a canonical shared foundation, not just a proposed refactor.** Food Passport, the goshuin/shrine book, and any future collectible inherit from one Passport implementation — this is binding per `OBJECT_BIBLE.md`'s updated Passport entry and `ARCHITECTURE_PRINCIPLES.md`, not a nice-to-have.
- **Data preservation is mandatory, not best-effort.** Every removal in the gamification consolidation must account for what happens to real unlocked badges/achievement data already in Firestore/localStorage for any real user (currently just the test account, per project memory — but the rule applies regardless of how much data exists today). See migration notes in each `DEPRECATION_LOG.md` entry as removals happen.
- **Every removal gets logged in `DEPRECATION_LOG.md`** as it happens — what was removed, what replaced it, why, migration notes.

Step 4 (implementation) is now underway, one small reviewable slice at a time per the workflow in `FEATURE_ROADMAP.md`. First slice: the gamification consolidation.
