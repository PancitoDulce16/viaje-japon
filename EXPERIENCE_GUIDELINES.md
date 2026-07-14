# Japitin — Experience Guidelines

This is not a design system. `DESIGN_SYSTEM.md` answers *how things look*. `OBJECT_BIBLE.md` answers *what things are*. `FEATURE_ROADMAP.md` answers *when things get built*. This document answers something none of those can: **what someone should feel, at each moment of a real trip, and why the interface is allowed to change its own personality to meet them there.**

Every future feature gets checked against this document before it gets checked against any other. A feature can be technically correct, visually on-brand, and built from the right objects, and still be wrong — because it makes someone feel managed instead of accompanied. That failure mode is this document's whole job to prevent.

---

## The core questions

**What should users feel when opening the app?**
Not "productive." Not "efficient." The first two seconds should feel closer to opening a gift, or glancing at a photo on the wall — a small lift, a flicker of recognition ("oh — my trip"), warmth before information. If the first thing a user processes on open is a number (days left, tasks pending, budget spent), the emotional entry point has already been lost to the operational one. Feeling comes first; the instrument panel is one tap away, never the cover.

**How should different moments of the journey feel?**
They shouldn't feel the same. A single, evenly-applied "delightful" tone everywhere is itself a failure of this document — dreaming about Japan on a Tuesday night feels nothing like standing on a Shinjuku platform at 11pm trying to find the right line. The interface's emotional temperature should track the user's real one at each stage. The full stage-by-stage detail is below; the throughline is that Japitin is allowed — expected — to feel like a different companion at 2am in an airport than it does on a couch three months before departure.

**How does anticipation differ from nostalgia?**
Anticipation leans forward. It's active, a little urgent, faster. Kasumi Pink and Yuzu Orange get more room; motion arrives and builds (a Countdown ring closing, a route line drawing itself in); the emotional register is *not yet, but soon*. Nostalgia leans back. It's passive, slower, warmer. Ai Indigo and Washi Cream dominate; motion settles and holds rather than progressing (a page resting open, a Stamp already landed); the register is *it happened, and it's mine now*. The tell for which one a screen should serve: does it point at a clock, or away from one? A Countdown belongs to anticipation and must never appear in a nostalgic context — see "what should never happen" below.

**When should the UI be playful? When should it become almost invisible?**
Playful when the user has attention to spare: dreaming, planning, preparing, and reliving afterward. Also in small, earned bursts — a confirmation, a Stamp landing, a milestone named. Invisible when the user doesn't have attention to spare: mid-transit, at a gate, juggling luggage, possibly stressed, possibly on bad signal. The general rule — **the closer the app is to being genuinely needed for something to go right, the less personality it's allowed to assert.** Delight is a thing you have time for. Invisibility is a thing you need when you don't. This is the emotional reasoning underneath `OBJECT_BIBLE.md`'s decision to make Travel Card, Reservation, and Train Pass deliberately flat and efficient — it isn't a stylistic exception to the brand, it's the brand correctly reading the room.

**What should never happen?**
- Never manufacture urgency that isn't real — no fake scarcity, no streaks, no "you're missing out" messaging. A trip has enough real anticipation in it; the app doesn't need to invent more.
- Never interrupt a live, time-pressured moment with an animation that costs the user time they don't have. If someone is mid-transit, a delight moment that makes them wait half a second too long is a failure, not a charming detail.
- Never make a user feel behind, judged, or scolded — a half-packed Backpack or an over-budget trip is information, never shame. This is why Budget's states are informational and non-blocking (`OBJECT_BIBLE.md`).
- Never fabricate or auto-post a memory on the user's behalf without explicit, in-the-moment confirmation. A Memory that wasn't consciously kept isn't a memory, it's surveillance.
- Never put a countdown, a "plan your next trip" prompt, or any forward-looking nudge on the same screen as a nostalgic, backward-looking one. Let remembering be complete in itself before the app pitches anything next.
- Never bring playfulness into a genuine problem state. The Emergency/SOS assistant and any "something went wrong" moment (a lost reservation, a payment failure) is the one place the companion personality steps back completely and becomes plainly, calmly, competently useful — funny or twee copy in a crisis moment is actively harmful, not off-brand.

**Which emotions should increase as the trip goes on?**
Confidence — the growing sense that the logistics are handled and won't ambush the user. Wonder — Discovery should make the world feel like it's offering more, not less, as familiarity with Japan grows. And a specific feeling of *accumulation* — the Passport filling with Stamps, the Food Passport filling with dishes tried, should make the trip feel like it's visibly, tangibly growing into something, not just being logged.

**Which emotions should remain after the trip is over?**
Warmth. Pride. A gentle, unhurried longing — never urgency, never a nag. The Passport and Journal and Storytelling recap should be things a user is quietly glad exist a year later, encountered by choice, not things that push a notification badge to pull someone back in. If revisiting Japitin after the trip ever feels like being marketed to, this document has failed.

---

## The emotional lifecycle of a trip

Eight stages. Each one names a real, distinct moment in a traveler's real relationship with a trip to Japan — not a screen, not a feature, a *feeling*. Multiple screens and objects can belong to the same stage; the stage is what should stay consistent as the user moves between them.

### 1. Dreaming
**Mindset:** Imaginative, low-commitment, maybe not even fully decided on going yet. Browsing "what if I went."
**UI personality:** Expansive and inspiring. No forms, no pressure, nothing that asks for a decision yet.
**Illustration style:** Big, atmospheric hero scenes — Cities and Landmarks and Seasonal at their most painterly and aspirational.
**Motion:** Slow drift and parallax. Nothing snappy — dreaming doesn't hurry.
**Copywriting:** Second-person and imaginative ("Imagina caminar bajo los cerezos en Kyoto"). Invitations, never imperatives.
**Interaction principles:** Zero required fields. No login wall between a curious visitor and the ability to look around. Exploration must be frictionless because commitment hasn't happened yet and shouldn't be assumed.

### 2. Planning
**Mindset:** Decided, or deciding — building the skeleton of the trip. A little overwhelmed by how many good options exist.
**UI personality:** Helpful and organizing, but still warm — structure is entering, not taking over.
**Illustration style:** Maps, and city heroes placed side by side for comparison.
**Motion:** Things settling into place — a route line drawing itself between cities, moderate pace.
**Copywriting:** Collaborative ("Armemos tu ruta"), plain, guiding without overwhelming with every option at once.
**Interaction principles:** Progressive disclosure — never all 17 cities' worth of depth at once. Easy to compare, easy to change your mind.

### 3. Preparing
**Mindset:** Logistics turning real — Backpack, Train Pass, Reservations, Budget all getting locked in. Practical checklist energy shot through with rising excitement.
**UI personality:** More Travel-Card-family objects appear, but the Countdown is what carries the emotional charge of this stage.
**Illustration style:** Airport scenes start to appear, anticipatory rather than literal. A visibly filling Backpack.
**Motion:** Quickening. The Countdown ring is visibly active; checked-off preparation items get a small, satisfying settle.
**Copywriting:** Encouraging and practical, acknowledging nerves without being twee ("Ya casi es hora — ¿qué falta?").
**Interaction principles:** Checklist-driven, but each completed item should register as progress toward the trip itself, not as admin cleared.

### 4. Traveling
**Mindset:** In transit — flights, transfers, the liminal moving-between-places time. Alert, sometimes tired, sensory-loaded, hungry for one piece of information: what's next.
**UI personality:** The most invisible stage in the whole lifecycle. Reservation, Train Pass, and Travel Card dominate; ornament recedes almost entirely.
**Illustration style:** Minimal and in service of context only — Airport/Transportation art used sparingly, never competing for attention with the information itself.
**Motion:** Near none. Anything that moves must carry information (a live Countdown, a progress line) — motion here is never for delight's own sake.
**Copywriting:** Short, plain, high-contrast, imperative when it needs to be ("Andén 3, sale en 12 min").
**Interaction principles:** The largest touch targets in the app. Must tolerate bad signal. Must be usable one-handed, because the other hand has a suitcase in it.

### 5. Exploring
**Mindset:** Out in a city with unstructured time, walking, deciding what's next on the fly. Open, curious, energized.
**UI personality:** Discovery returns to the foreground — personality comes back after Traveling's quiet stretch.
**Illustration style:** Landmarks, Shopping, Nature, and Shrines, live and locally relevant.
**Motion:** Playful again, but fast to act on — nobody exploring a street wants to wait out an animation before tapping through.
**Copywriting:** Present-tense and in-the-moment ("A 5 min caminando"), enthusiastic without being breathless.
**Interaction principles:** One-tap actions (save, get directions) — attention is split between the phone and the actual street, so friction here is costlier than anywhere else.

### 6. Discovering
**Mindset:** The peak moment — physically present at a landmark or experience. Awe. "I'm actually here."
**UI personality:** Steps back almost entirely. This is the moment to put the phone down; the interface's job is to get out of the way fast.
**Illustration style:** None needed live — if anything, seeing the Landmark hero art that was shown back in Dreaming/Planning is itself the payoff ("it really does look like this").
**Motion:** One small, warm capture-confirmation motion (echoing Stamp) and nothing else asking for attention.
**Copywriting:** Nearly silent. A single line, if anything ("Guardado ✿") — never a paragraph.
**Interaction principles:** The fastest possible path to "capture this moment and put the phone away." One tap. Never a form.

### 7. Remembering
**Mindset:** Evenings during the trip, or shortly after — reviewing the day. Reflective, pleasantly tired, wants to relive it, not just log it.
**UI personality:** Journal, Passport, and Stamp take over. Warm, slower-paced, paper-like.
**Illustration style:** Emotional Moments is the central category here.
**Motion:** The calmest, most tactile motion in the app — paper settling, pages turning.
**Copywriting:** Personal, first-person prompts ("¿Qué fue lo mejor de hoy?"), never obligatory-sounding.
**Interaction principles:** No pressure to fill every field. A half-finished journal entry is exactly as valid as a complete one.

### 8. Looking back, years later
**Mindset:** The trip is long over. The user opens the Passport or Journal unprompted, out of fondness, not planning. Nostalgic, a little wistful, not shopping for a next trip.
**UI personality:** Fully archival and gentle. No Countdown (it would be actively wrong here — see "what should never happen"). No "plan your next trip" competing for the same screen as the memory.
**Illustration style:** The *same* Passport cover and Memory images from the trip itself, completely unchanged. Consistency over time is the emotional device — seeing the exact same art years later is the point, not a refreshed redesign of it.
**Motion:** Essentially still, like turning the pages of a physical photo album. Deliberately the least animated stage in the entire lifecycle.
**Copywriting:** Quiet, past-tense, no forced call to action on the same screen ("Fushimi Inari, abril 2026" — a caption, not a pitch).
**Interaction principles:** Purely browsing. Export/sharing is available, never prompted unsolicited. If a "plan your next trip" nudge exists anywhere, it's a deliberate scroll or tap away — never sharing a screen with the memory itself.

---

## How to use this document

Before a feature ships, ask which of the eight stages it actually belongs to — not which screen or tab it lives in, which *emotional moment* it serves. Then check its personality, motion, and copy against that stage's entry above, and check the whole feature against "what should never happen." A feature that can't name its stage honestly is usually a feature that's drifted toward generic productivity software — which is the one thing, per `DESIGN_SYSTEM.md` §0, Japitin is not allowed to become.
