# Japitin — Soul

This is the root document. Every other foundational document — `DESIGN_SYSTEM.md`, `OBJECT_BIBLE.md`, `ILLUSTRATION_LIBRARY.md`, `FEATURE_ROADMAP.md`, `EXPERIENCE_GUIDELINES.md`, `ARCHITECTURE_PRINCIPLES.md`, `DEPRECATION_LOG.md` — is downstream of what's written here. When two documents seem to disagree, this one wins. When a decision doesn't fit cleanly into any of the others, it gets checked against this one directly.

---

## What Japitin is

**Japitin is not a travel planner. It is an illustrated travel companion.**

A planner organizes tasks. A companion is present for an experience. Every screen, feature, illustration, and interaction should make the user feel like they're dreaming about, preparing for, living, or remembering an adventure in Japan — never like they're filling out a form or running a project.

## The one principle behind every feature decision

Every feature should help a user do one of exactly three things:

- **Prepare for Japan.**
- **Enjoy Japan.**
- **Remember Japan.**

If a feature doesn't clearly support one of these three, it probably doesn't belong in Japitin — regardless of how well-built or how technically reasonable it seems in isolation.

## The tests

Before shipping anything — a screen, a feature, a single piece of copy — run it through these, in order:

1. **"Would this make me excited to open the app during my trip?"** If the answer is no, redesign it.
2. **"Could this feature belong unchanged inside Notion, Trello, or a banking app?"** If yes, it's generic, and generic is the one failure mode every other document exists to prevent.
3. **"If someone removed the word 'Japan' from this screen, would it still look like a generic travel app?"** If yes, redesign it. Japitin should be unmistakably Japitin — not a travel app skin that happens to mention Japan, but a product whose specific details (the objects, the illustrations, the copy) couldn't be relabeled for another destination without falling apart.

## Memories, not productivity

Users collect memories, not achievements-as-rewards. **Achievements are memories, not rewards** — an Achievement should feel like adding another page to a travel journal, never like unlocking a level. No XP, no points, no levels, no leaderboards, no streaks, no FOMO. The application's job is to help someone **preserve what actually happened to them** — a first Shinkansen ride, a first sunrise in Japan, the walk through Gion — not to reward them for using the app, and never to make them feel like they're falling behind if they don't. Japitin celebrates exploration, not competition; if Japitin ever becomes social, it celebrates journeys, not comparisons between travelers. This single principle is why `OBJECT_BIBLE.md`'s Achievement object explicitly replaces the codebase's existing points-and-levels gamification system rather than restyling it — and why fake or invented data (a placeholder leaderboard, a fabricated "127 travelers online now") must never exist anywhere in the product, in any form, even temporarily.

## Voice

Warm, plain-spoken, in Spanish, first. Never corporate, never a chatbot's cheerfulness, never a SaaS onboarding tone. Japitin talks the way a well-traveled friend would — specific, a little informal, never trying to sell you something you already own. `EXPERIENCE_GUIDELINES.md` details exactly how that voice shifts across a trip's emotional stages; the constant underneath every stage is that it never sounds like software.

## What must never be sacrificed for efficiency

Delight, when it's in tension with pure efficiency, wins — **except** when usability is genuinely at stake (a user stressed at a train platform needs the fast, boring path, not a charming one). `EXPERIENCE_GUIDELINES.md` names this precisely: the closer the app is to being needed for something to go right, the less personality it's allowed to assert. That's not an exception to the soul of the product — reading the room correctly *is* the soul of the product.

## How this document is used

Every proposal written under the Step 1–5 workflow (see `FEATURE_ROADMAP.md`) must be checked against this document first, the other five second. A change that technically satisfies `DESIGN_SYSTEM.md`, `OBJECT_BIBLE.md`, and `FEATURE_ROADMAP.md` but drifts from what's written here is still the wrong change.
