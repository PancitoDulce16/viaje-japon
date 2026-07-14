# Japitin — Deprecation Log

Every system that gets removed or fundamentally replaced is recorded here, per `ARCHITECTURE_PRINCIPLES.md`'s "deprecate before deleting" rule. This is a record for future contributors (including future sessions working on this codebase) to understand *why* something that used to exist doesn't anymore, so a removed pattern doesn't get quietly reintroduced by someone who didn't know it was tried and rejected.

## Entry format

Each entry answers four questions, in this order:

- **What was removed** — the specific file(s)/system/mechanic, named precisely.
- **What replaced it** — the new canonical implementation, or "nothing — removed outright" if there's no replacement.
- **Why** — which foundational document(s) justified the removal.
- **Migration notes** — what happened to any real user data the old system held. If no user data existed, say so explicitly rather than omitting the line.

Newest entries at the top.

---

## 2026-07-14 — Dashboard Experience slice 3: live integration migration summary

**What legacy code was removed:**
- `trips-manager.js`'s old `updateTripHeader()` body — the centered JAPITIN banner (desktop-only), and the entire 4-card stat grid (`#tripStatsDashboard`: "Progreso del Viaje," "Actividades," "Presupuesto," "Reservas").
- `loadTripStatistics()` — the async function that computed and rendered those 4 cards — **deleted outright**, not left dormant.
- The old `updateTripHeaderEmpty()` "👋 ¡Bienvenido!" strip markup.

**What was preserved (same functionality, verified working):**
- All 4 action buttons (Agregar Viaje, Regenerar, Vaciar, Exportar + its dropdown with PDF/Calendar/Maps/Checklist) — kept with identical `onclick` handlers, unchanged.
- "Unirse con código" (`joinTripWithCode()`) — moved from the old empty-state strip into the new Dreaming-stage progressive content, same function call.
- The `itineraryLoaded` custom event dispatch — **this one needed care**: three real, unrelated consumers depend on it (`ai-control-panel.js`, `kawaii-animations.js`, `analytics-integration.js`). The old code fired it unconditionally inside `loadTripStatistics()`; the new code fires it unconditionally inside `loadDashboardProgressiveContent()` regardless of which stage-specific data is also being fetched, specifically so removing the old stats logic didn't silently break those three files.
- Flight/accommodation booking counts (`trip.flights`, `trip.accommodations`) — previously in stat-card 4 ("Reservas: N/2 vuelos, N hoteles"), now shown for real in the Preparing stage's "Vuelos y hoteles" section (`dashboard-data.js`'s `travelReadiness()`).
- The budget estimate formula (¥15,000/día/persona) — reused verbatim in `dashboard-data.js`'s `budgetSummary()`, not recalculated independently.

**What became canonical:**
- `js/features/dashboard/dashboard-data.js` — the one place that fetches real Firestore data (reservations, packing, itinerary, budget) for the Dashboard, keeping `progressive-content.js` a pure renderer.
- `TripsManager.updateTripHeader()`/`updateTripHeaderEmpty()` now call directly into `stage-detector.js` + `hero-moment.js` + `progressive-content.js` — no more parallel rendering logic.

**Not preserved — a deliberate simplification, not an oversight:** the old "Actividades" stat card (total itinerary activities + "completed" count) has no direct replacement. Investigation during this migration found `activity.completed` was never actually a real field set anywhere in the codebase — that sub-stat always silently showed its fallback ("Planificadas"). The raw total-activity-count is superseded by the Traveling stage's real today's-activity Ticket rail, which is more useful than a whole-trip count; it is simply gone for the other stages, not replaced 1:1.

**Migration notes:** No Firestore schema changed. No user data was deleted or migrated — this slice only changed rendering, not storage.

**Remaining technical debt (found during this migration, not fixed — flagged for a decision, not hidden):**
- **`js/features/itinerary/itinerary-v3.js` renders its own, separate trip-summary header** (trip name/dates/status badge + a *different* set of action buttons: Mis Viajes/Compartir/Agregar Viaje/Exportar PDF/Optimizar Todo/Balancear) directly inside `#content-itinerary`. This predates this migration entirely and was never touched by it — but because Itinerario is the default landing tab, it now renders immediately below the new Dashboard hero, and the two headers read as visibly redundant in a way the old, more utilitarian dashboard header didn't make as obvious. This is real, pre-existing architectural duplication (two independent "trip header" implementations) that `ARCHITECTURE_PRINCIPLES.md` argues against — but fixing it means touching `itinerary-v3.js`'s own rendering, which is Itinerary Experience territory, not Dashboard Experience. Left alone pending an explicit decision.
- Most manually-tracked Achievement counters still have no real call site (documented previously, unchanged by this slice).

## 2026-07-14 — Unified Achievement system (single canonical implementation)

**What was removed:**
- `js/features/gamification/gamification-system.js` — deleted outright (previous slice had already stripped its XP/levels; this slice retires the whole file, including its 18 achievement definitions and all rendering).
- The achievement section of `js/features/social/social-features.js` (`checkAndUpdateAchievements`, `getUserStats`, `renderAchievements`, `loadAchievements`) — a second, independent implementation of the same concept, with its own 10-item list.
- `js/ui/user-profile.js`'s independent stats computation for meals/bingo/stamps (duplicated `getLiveStats()`'s logic) and its broken achievement preview (it read `achievement.icon`/`achievement.name` from data that only ever contained `{id, unlockedAt}` — a pre-existing display bug, not introduced by this change, now fixed as a side effect of routing through the canonical module).

**What replaced it:**
`js/features/achievements/achievements.js` (`window.Achievements`) — the single canonical implementation of the Achievement object per `OBJECT_BIBLE.md`. One data model, one persistence layer (`trips/{tripId}/achievements/{userId}`), one rendering path (`renderPanel()`/`renderAllModal()`), one public API. Every other file that touches achievements now calls into this module rather than recomputing anything — see `OBJECT_BIBLE.md`'s Achievement entry for the full API surface.

**Content review (per explicit request — "if one feels like a game mechanic instead of a travel memory, redesign it"):** went through all 28 achievements from both old lists individually. Cut 6 for being feature-usage/engagement metrics with no travel content: `hybridCreator` (used the hybrid-itinerary feature), `customizer` (edited 5 days — a UI-interaction count), `variations` (compared itinerary variations 5 times), `exporter` (exported in 3 formats), `dedicated` (opened the app on 30 different days — pure retention metric), `legend` (unlocked every other badge — a "collect them all" meta-mechanic). Kept 22, and renamed every one that used ranking/gamer language ("Maestro," "Experto," "Pro," "Novato," "Leyenda," "Guerrero") to plain descriptions of what actually happened.

**Architecture decision — scope change from account-level to trip-level:** the old `gamification-system.js` stored everything at `users/{uid}/gamification/stats` (one record per account, shared across every trip). The new canonical system stores at `trips/{tripId}/achievements/{userId}` (one record per trip) — matching Passport's "one per trip, not per user" scoping already established in `OBJECT_BIBLE.md`, since an achievement is a memory of a specific journey, not a lifetime stat. This is the reason the migration logic below exists.

**Why:** `ARCHITECTURE_PRINCIPLES.md` — "every reusable object has one canonical implementation," "never duplicate domain logic." `SOUL.md` — the content review above. `OBJECT_BIBLE.md`'s Passport entry — the trip-scoping precedent.

**Migration notes:**
- Trip-scoped legacy data (the old `social-features.js` doc shape, `{achievements: [{id, unlockedAt}]}`, already living at the same Firestore path): migrated automatically and unambiguously on first `initialize()` for that trip — old ids mapped to new canonical ids (e.g. `bingo_10` → `deepExplorer`), unmapped ids (the two streak achievements already removed in the prior slice) are dropped since they have no current equivalent.
- Account-scoped legacy data (the old `gamification-system.js` doc at `users/{uid}/gamification/stats`, `unlockedBadges: [ids]` plus the 12 counters): migrated once, adopted into the **first trip the user opens** after this change, since the old system never recorded which trip a badge belonged to. This is an imperfect but data-preserving choice for users with achievements spanning multiple trips — documented here rather than left as an unexplained surprise. Badge ids with no new equivalent (`hybridCreator`, `customizer`, `variations`, `exporter`, `dedicated`, `legend`, plus the already-retired `sensei`/`consistent`) are not migrated — there's no current achievement for them to become.
- Verified against the real test account: had a legacy `users/{uid}/gamification/stats` doc with `tripsCreated: 1` from prior testing. First `initialize()` for its trip correctly migrated this into the new trip doc and unlocked `firstTrip` + `firstItinerary` for real, confirmed via screenshot (profile stat tile and achievement gallery both show "2" consistently).

**Bug found and fixed as part of this migration, unrelated to the achievement redesign itself:** `firestore.rules` had **no rule at all** for the `trips/{tripId}/achievements/{userId}` subcollection — every read/write to this path silently failed with "Missing or insufficient permissions," for both the old `social-features.js` system and the new one, before this fix. Added the rule (trip members can read any member's achievements, only the owner can write their own doc) and deployed it. This means the achievement system was **never actually functional in production before this change** — worth knowing if anything elsewhere assumed it was working.

---

## 2026-07-14 — Gamification scoring/leaderboard/streak removal

**What was removed:**
- `js/features/gamification/gamification-system.js`: the entire XP/points system (`points` field on every badge, `userStats.xp`), the 6-level "traveler level" table (`this.levels`, `getCurrentLevel()`, `getProgressToNextLevel()`, `checkLevelUp()`), the `sensei` badge (its condition was `stats.level >= 6`, meaningless without levels) and the `consistent` badge (an explicit day-streak badge).
- `js/features/gamification/location-game.js`: the fake hardcoded leaderboard (`renderLeaderboardPreview()` — invented usernames `japan_master`/`location_pro`/`tokyo_explorer` with invented scores, and a hardcoded `#15` "Ranking Global"), `showLeaderboard()`'s fake-data path, and the entire point-scoring formula in `submitAnswer()` (base points + time-bonus).
- `js/features/social/social-features.js`: the entire daily-challenge mechanic (`renderDailyChallenges`, `loadDailyChallenge`, `renderChallengeCard`, `completeChallenge`, and the `trips/{tripId}/challenges/{date}` Firestore usage), plus two explicit streak-based achievements (`streak_3`, `streak_7`) and the `maxStreak` stat that fed them.
- `js/utils/japan-utils.js`: the day-gap streak-break logic in `loadStreaks()`/`logActivity()` ("racha rota" reset after >1 day) and its "días seguidos" framing.
- `js/ui/user-profile.js`: its own independent copy of the streak stat (`maxStreak` tile, "🔥 Racha") and the `japanActivityStreaks` localStorage read that fed it — this was a second, duplicate implementation of the same stat social-features.js computed, never reconciled with it.
- Dangling/dead code cleanup: `js/features/trips/export-import-system.js`'s `exportGamification()`/`importGamification()` referenced `.points`/`.level`/`.achievements`/`.save()`, none of which ever existed on the real class — this was silently broken before this change, never functional. `js/core/module-loader.js`'s lazy-load route listed `/js/achievement-tracker.js`, a file that has never existed in this repo.

**What replaced it:**
- `gamification-system.js`'s 18 remaining badges are now framed as Achievements per `OBJECT_BIBLE.md` and `SOUL.md` — boolean unlocks only, no points attached, notification copy changed from "¡Badge Desbloqueado! +N XP" to "Nuevo recuerdo." `renderGamificationPanel()`/`showAllBadges()` no longer show level/XP UI, only which memories have been unlocked.
- `location-game.js` keeps its guessing-game mechanic unchanged; its stats are now `roundsPlayed`/`roundsCorrect` (personal counts, never compared to other players).
- `japan-utils.js`'s activity tracker is reframed as "Momentos Registrados" — a simple cumulative count per activity, never reset, no day-gap penalty.
- `export-import-system.js`'s gamification export/import now actually works, reading/writing the real `userStats` object (previously dead code that touched nonexistent properties).

**Why:** `SOUL.md` — "No XP, no points, no levels, no leaderboards, no streaks, no FOMO... fake or invented data... must never exist anywhere in the product, in any form, even temporarily." `ARCHITECTURE_PRINCIPLES.md`'s "never duplicate domain logic" also applies directly to the `user-profile.js`/`social-features.js` duplicate streak-stat finding.

**Migration notes:** No destructive Firestore or localStorage changes were made. Existing user documents at `users/{userId}/gamification/stats` that already contain `xp`/`level`/`loginStreak` fields are left untouched in Firestore — those fields are simply no longer read or written going forward (harmless unused fields, not deleted). `unlockedBadges` — the actually meaningful record of what a user unlocked — is fully preserved and is what the new memory-framed panel renders from; two of its historical entries (`sensei`, `consistent`) reference badge ids that no longer exist and are now silently skipped by `renderGamificationPanel()`'s filter rather than erroring. `location-game.js`'s score was in-memory-only before this change (confirmed via code audit — no persistence existed), so there was nothing to migrate there. The `streaks` localStorage key used by `japan-utils.js` is unchanged and its existing counts carry forward as the new cumulative total.

**Not done in this slice (flagged for the next one):** `social-features.js`'s own 10-item achievement list still exists separately from `gamification-system.js`'s 18-item list — two lists, not yet the "one canonical implementation" `OBJECT_BIBLE.md`/`ARCHITECTURE_PRINCIPLES.md` call for. Merging them was scoped out to keep this commit reviewable; tracked as the next Phase 2 slice. Also unfixed: `user-profile.js`'s "Últimos Logros" preview reads `achievement.icon`/`achievement.name` from data that `social-features.js` only ever saves as `{id, unlockedAt}` — a pre-existing display bug (predates this change) that the achievement-list merge will resolve as a side effect.
