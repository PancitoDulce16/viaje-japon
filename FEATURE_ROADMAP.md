# Japitin — Feature Roadmap

Companion doc to `SOUL.md`, `DESIGN_SYSTEM.md`, and `OBJECT_BIBLE.md`. This is the order Japitin gets built in, and — just as importantly — the order it does *not* get built in. Japitin already has a large surface area (11 top-level tabs, dozens of features, per the codebase audit); the risk this document guards against is not "too little built," it's **building the wrong thing next** and drifting back into "a collection of components and screens" instead of a cohesive product.

Each phase states why it exists, what it depends on, what gets built, and — deliberately — what does **not** get built yet, even if it would be easy to sneak in while the code is already open.

---

## Phase 0 — Soul

**Why it exists:** Every other phase is downstream of this one. Skipping it is how you end up with a features list that could belong to any travel app.
**Depends on:** Nothing — this is the root.
**Build:** Product philosophy ("an illustrated travel companion, not a travel planner"), the Memories-not-productivity principle, the brand voice (warm, plain-spoken Spanish, never corporate). Canonical source: `SOUL.md`.
**Do NOT build yet:** Any UI. Phase 0 produces documents, not screens. If you're writing CSS, you've skipped ahead.

---

## Phase 1 — Foundation

**Why it exists:** A design system nobody's screens actually use is decoration, not foundation. This phase makes the tokens real and load-bearing before anything is styled with them.
**Depends on:** Phase 0 (the palette/type choices in `DESIGN_SYSTEM.md` are Soul made concrete).
**Build:** `css/tokens.css` (done), consistent font loading across all entry points (done), dead-code removal that was blocking a clean base — Lucide script, `showMainMenu`, `_OLD` methods (partially done — see `DESIGN_SYSTEM.md` roadmap Phase 4/"cleanup" for the remainder).
**Do NOT build yet:** Any component (`.card--ticket` etc.) or screen migration. Phase 1 is intentionally boring and low-risk — see the "nothing consumes it yet" note already in `DESIGN_SYSTEM.md`.

**Status: in progress, foundation largely complete.**

---

## Phase 2 — Travel Objects

**Why it exists:** `OBJECT_BIBLE.md` defines 15 objects on paper. This phase is where they become real, reusable code — the component library, built once, correctly, instead of once per screen.
**Depends on:** Phase 1 (tokens must exist before objects can be styled from them).
**Build:** One implementation per object in `OBJECT_BIBLE.md` — markup structure, CSS class, states, motion, accessibility behavior — built and demonstrated in isolation (a style-guide/kitchen-sink page is reasonable here), *not yet wired into real screens*. `EmptyStates`/`LoadingStates` get reskinned to the new tokens here too, since they're shared infrastructure every object-bearing screen will need.
**Do NOT build yet:** Screen layouts, navigation, or real data wiring. An object should be provably correct on its own — right states, right motion, right accessibility — before it's asked to hold real itinerary data. Building objects and screens simultaneously is exactly how you get objects secretly shaped by one screen's needs instead of their own purpose.

---

## Phase 3 — Illustration Library

**Why it exists:** Objects need real destination-specific art, not placeholder icons, before screens are built around them — otherwise screens get built around a placeholder and the real illustration has to be retrofitted, usually badly. See `ILLUSTRATION_LIBRARY.md` for the full structure.
**Depends on:** Phase 0 (visual style guide) for direction; loosely parallel to Phase 2, not strictly after it — illustration generation can start as soon as an object's visual needs are known.
**Build:** The `images/illustrations/generated/` canon, starting with the highest-reuse categories (Cities, Landmarks, Empty States — anything Phase 4's first screens will need immediately). Each new generation checked against the continuous-evolution rule in `DESIGN_SYSTEM.md` §3.
**Do NOT build yet:** Speculative art for screens that are 3+ phases away (Community avatars, Phase 9). Generate on demand per `ILLUSTRATION_LIBRARY.md`'s own rule — never a speculative asset dump.

---

## Phase 4 — Core Screens

**Why it exists:** This is where the app actually starts looking like the redesign — the highest-traffic screens rebuilt from real objects and real illustrations instead of the current 46-file CSS cascade.
**Depends on:** Phases 1–3. A screen built before its objects exist just reinvents them locally — the exact failure mode this whole restructuring is meant to end.
**Build:** In the order already set in `DESIGN_SYSTEM.md`'s roadmap — Inicio/Trip overview → Itinerario/Day planner → Actividades → Transporte → Presupuesto → Preparación → Reservas → remaining tabs (Atracciones, Esenciales, Utilidades, Analytics) → modals. Bottom nav (5 destinations, per `DESIGN_SYSTEM.md` §7) replaces the current 11-tab horizontal scroller here.
**Do NOT build yet:** Journal/Storytelling features (Phase 5/6) beyond what's needed to display existing photo-gallery data in the new visual language. Don't let "core screens" quietly grow into "also redesign the journal while we're in here" — that's Phase 5's job with its own dedicated attention.

---

## Phase 5 — Travel Journal Experience

**Why it exists:** Once the operational core (itinerary, budget, transport) feels right, the emotional core — the Journal, Memory, Passport, Stamp, Food Passport objects — gets its own dedicated pass. These objects carry the most emotional weight in `OBJECT_BIBLE.md` and deserve to not be an afterthought bolted onto Phase 4's momentum.
**Depends on:** Phase 4 (the app needs to already feel trustworthy operationally before asking users to invest emotionally in journaling inside it).
**Build:** Real Journal entry creation/editing, the Passport book UI, Stamp interactions wired to real completion events, Food Passport, Memory capture (manual first — auto-suggested capture is a Phase 7 dependency, flagged below).
**Do NOT build yet:** Auto-suggested Memories (needs location/time intelligence — Phase 7) or any sharing/collaborative annotation (needs Phase 9 Community's trust/permissions model first). Manual, single-user journaling only in this phase.

**Travel Memories note:** Passport's PDF export (currently a placeholder — `goshuin-book.js`'s `exportarPDF()` is unimplemented) is deliberately not being finished as a plain PDF in Phase 2. It's the seed of a future **"Travel Memories" experience**: not a document export, a beautiful travel book — assembled from real Stamps, Memories, and Journal entries, in the same visual language as the rest of the app. Phase 5 is where this gets designed properly (once real Passport/Journal/Memory content exists to assemble it from); Phase 6 (Travel Storytelling) is where the output format itself — book, shareable recap, or both — gets decided. Until then the export button stays visible but honestly labeled as coming soon, never silently broken.

---

## Phase 6 — Travel Storytelling

**Why it exists:** A trip's worth of Memories and Journal entries deserves a shareable, beautiful recap — the payoff moment for everything captured in Phase 5.
**Depends on:** Phase 5 (needs a real body of Memories/Journal entries to draw from — building a recap generator with no real content to recap is building in a vacuum).
**Build:** Auto-assembled trip recaps (a sequence of real Memories, not a generated summary from nowhere — see `OBJECT_BIBLE.md`'s Memory object), exportable/shareable trip stories, the Achievement recap view (private, per `OBJECT_BIBLE.md` — "never a public leaderboard").
**Do NOT build yet:** Public/social distribution of stories — that's a Phase 9 concern (who can see this, and under what trust model) layered on top of storytelling mechanics built here.

---

## Phase 7 — Travel Intelligence (AI)

**Why it exists:** Real trip data (Phase 4) plus real personal content (Phase 5/6) is what makes intelligence useful instead of decorative — suggesting a restaurant based on dishes not yet in someone's Food Passport is a genuinely good feature; a chatbot bolted onto an empty itinerary is not.
**Depends on:** Phases 4–6 (there must be real data to be intelligent *about*).
**Build:** Weather-aware Backpack suggestions, Discovery ranking informed by actual Food Passport/Journal history, smart itinerary rebalancing — extending the rule-based engines that already exist (`js/ai/smart-suggestions-engine.js`, `recommendation-engine.js`) rather than assuming a rebuild.
**Do NOT build yet — and this is a hard boundary, not a scheduling note:** anything that's AI *because it looks impressive* rather than because it solves a real moment. This project already removed a fake NLP command box and auto-generated descriptions for exactly this reason (`ai-control-panel.js`, deleted 2026-07-11 per project history) — Phase 7 exists to do intelligence for real, not to reintroduce the thing that was deliberately cut. If a Phase 7 feature can't point to the specific real data it's using and the specific real decision it's helping with, it doesn't ship.

---

## Phase 8 — Monetization

**Why it exists:** Sequenced deliberately late — monetizing before Phases 0–7 establish real value risks optimizing a product that doesn't yet deserve the attention.
**Depends on:** A working, emotionally resonant product (Phase 6) and, ideally, evidence of real usage.
**Build:** Nothing is prescribed here yet — this phase's first deliverable is honestly a *decision*, not code: what's worth paying for (candidates that fit the Soul: physical Passport printing per `OBJECT_BIBLE.md`, premium illustration packs, nothing that gates core trip-planning).
**Do NOT build yet:** Any paywall, ad, or "premium" lock on anything already shipped in Phases 1–7. Retrofitting a paywall onto a feature users already trusted as free is a trust break worth avoiding by simply not doing it until this phase deliberately decides otherwise.

---

## Phase 9 — Community

**Why it exists:** Japitin already has social infrastructure partially built (`social-network.js`, `group-chat.js`, `travel-twins-matcher.js`, opt-in `travelTwinsPool`/`travelTwinsThreads` Firestore collections) — this phase is where it gets a coherent identity instead of being several independently-built social features.
**Depends on:** Phase 6 (Storytelling needs to exist before there's anything worth sharing into a community) and a deliberate trust/privacy model, since this is the first phase where content crosses between users by default.
**Build:** A coherent social layer built around sharing real Storytelling output and real Discovery finds — not a generic feed. Co-traveler Journal annotations (flagged as a Phase 5 future-extensibility item). Group trip planning refinements.
**Do NOT build yet:** Public leaderboards, follower counts, or any engagement mechanic that turns Achievement (memories, not gamification — see `OBJECT_BIBLE.md`) back into a scored system. This is the phase most likely to accidentally reintroduce gamification through the back door of "engagement features" — resist it explicitly.

---

## Phase 10 — Platform Expansion

**Why it exists:** Once the product is proven on the web, the same objects and illustration library extend outward — new surfaces, not a new product.
**Depends on:** Everything before it. This phase reuses, it doesn't reinvent.
**Build:** Apple/Google Wallet export for Ticket and Train Pass objects (a natural extension already implied by their visual language), a native app shell if usage justifies it, physical Passport print-on-demand (ties to `OBJECT_BIBLE.md`'s Passport future-extensibility note).
**Do NOT build yet — and this needs a real decision, not a default:** expansion beyond Japan as a destination. "Japitin" is a Japan-specific brand identity down to the name; generalizing to other countries is a brand question that deserves its own explicit conversation, not a quiet scope-creep inside a platform-expansion phase. Flagged here so it doesn't happen by accident.

---

## How to use this document

Work happens roughly in phase order, but phases aren't rigidly sequential gates — Phase 3 (Illustration Library) explicitly overlaps Phase 2, for instance. What's non-negotiable is the **dependency direction**: nothing in a later phase gets built as a shortcut before its stated dependencies are real. When in doubt about whether something belongs in the current phase, check its "Do NOT build yet" list first — more feature ideas get correctly deferred by that check than approved by it, and that's the point.

---

## The workflow within a phase

Each product experience inside a phase is built one at a time, in this order, and no step is skipped:

1. **Analyze** the current implementation — what actually exists in code today, not what's assumed to exist.
2. **Compare** it against every foundational document (`SOUL.md` first, then `EXPERIENCE_GUIDELINES.md`, `DESIGN_SYSTEM.md`, `OBJECT_BIBLE.md`, `ILLUSTRATION_LIBRARY.md`, this document, `ARCHITECTURE_PRINCIPLES.md`).
3. **Propose** — what changes, why, which documents justify it, what code gets reused, what disappears. No implementation yet. Wait for approval. (See `proposals/` for the per-phase record of these.)
4. Once approved, **update documentation before implementing**: if a reusable object changes shape, `OBJECT_BIBLE.md` is updated first — the code follows the document, not the other way around.
5. **Implement** — in small, reviewable commits. Not optimized for speed; optimized for clarity, maintainability, and fit with the rest of this system.
6. **Test** the implementation actually works.
7. **Self-review**: list every inconsistency that still exists against the foundational documents, and fix them before considering the experience complete.
8. **Document deprecations** in `DEPRECATION_LOG.md` — anything removed, what replaced it, why, and migration notes for any user data affected.

Only after an experience clears all eight steps does work move to the next one. Data belonging to a real user is never deleted as a side effect of any of these steps — see `ARCHITECTURE_PRINCIPLES.md`'s data-preservation rule.
