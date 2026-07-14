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
