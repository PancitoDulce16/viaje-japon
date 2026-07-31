# Japitin — Signature Elements

Companion doc to `DESIGN_SYSTEM.md` §0.1 and `OBJECT_BIBLE.md`. Where `OBJECT_BIBLE.md` defines *what a screen contains* (a Ticket, a Passport, an Achievement), this document defines *the recurring visual devices that make any of them recognizable as Japitin* — the equivalent of Apple's Dynamic Island, Discord's Wumpus, or Duolingo's Duo. Not a mascot. A set of motifs specific enough that a cropped screenshot with the logo removed still reads as Japitin.

**Rule:** every one of the ten motifs below must appear in at least two unrelated screens before it's considered "signature" rather than a one-off decoration. A motif used exactly once is still just decoration — see `DESIGN_SYSTEM.md` §0.1's "hide the logo" test.

---

## 1. The Hanko Ring

**What it is:** A circular ink-stamp border in vermillion (Sango-adjacent), hand-illustrated with a slightly imperfect edge and a few degrees of rotation — never a perfect, centered circle. The ring is the reusable asset; the text or glyph inside it is rendered dynamically (CSS/HTML), not baked into the illustration, so one asset serves every use.

**Where it recurs:** A booking confirmed, an achievement earned, a trip completed, an itinerary day finished — anywhere the app currently would use a checkmark, a green badge, or a toast notification.

**Why it's uniquely Japitin:** Directly descends from *goshuin* (shrine/temple stamps) — already a real feature (`goshuin-book.js`) generalized system-wide, per `OBJECT_BIBLE.md`'s Stamp object.

**Asset type:** Nano Banana illustration, transparent PNG, one reusable ring (text overlaid live).

---

## 2. The Spiral Page

**What it is:** The base "surface" itself — warm kraft/washi paper, a visible spiral binding running down one edge (small rings, slightly uneven spacing), a soft indigo-tinted physical shadow as if the page is sitting slightly above the desk. This replaces the generic `.card` as Japitin's default content container for anything primary (the hero, a day's itinerary, a reservation detail).

**Where it recurs:** Dashboard hero, itinerary day view, reservation detail, journal entries — any screen whose job is "this is a page in your trip's notebook."

**Why it's uniquely Japitin:** No competitor's trip planner uses a physical notebook as its literal container metaphor — most use flat elevation/shadow cards indistinguishable from any SaaS product.

**Asset type:** CSS-crafted (border, shadow, small SVG/illustrated ring repeats) — no illustration needed, this one is structural.

---

## 3. Washi Tape

**What it is:** Semi-translucent, softly patterned paper tape strips at a slight rotation (never perfectly horizontal), used to visually "pin" one element onto another — a postcard onto a page, a photo into a journal entry, a ticket stub into an itinerary day.

**Where it recurs:** Postcard corners (Inspírate), Memory/photo attachments, any place a Ticket or Reservation visually "belongs" to a specific day rather than floating in a list.

**Why it's uniquely Japitin:** It's the visual verb for attachment/belonging — nothing in the app should just "be positioned near" something else when it could be *taped to* it.

**Asset type:** Nano Banana illustration, transparent PNG, 3–4 color/pattern variants (pink, blue, kraft, sakura-print).

---

## 4. The Torii Divider

**What it is:** A small, simplified torii-gate silhouette used wherever the interface would otherwise reach for a plain `<hr>` or a blank gap between sections.

**Where it recurs:** Between Dashboard sections, between itinerary days, anywhere content needs a breath without a generic rule line.

**Why it's uniquely Japitin:** A horizontal rule is invisible brand-wise; a torii silhouette is legible as Japitin even cropped to a 40px-tall strip.

**Asset type:** CSS/SVG (simple enough not to need raster illustration) — small enough that Nano Banana's illustrated linework would be wasted detail at this size.

---

## 5. The Ticket Notch

**What it is:** The die-cut circular notch + dashed perforation edge already built for the Ticket Card object — extended here as the *universal* shape for any control that represents a real transaction or commitment (booking, confirming, exporting), not just literal transit/activity tickets.

**Where it recurs:** Primary CTAs that commit to something real (not every button — see `OBJECT_BIBLE.md`'s "when not to use it" discipline; a `Cancelar` or `Cerrar` action stays a plain control, not a ticket).

**Why it's uniquely Japitin:** Already partially built and proven (`.card--ticket` in `css/objects.css`) — this motif's job now is consistency, not invention: stop letting some primary actions default back to generic pill buttons.

**Asset type:** CSS-crafted (existing implementation), no new illustration.

---

## 6. The Hanging Kanji Tag

**What it is:** A small paper tag on a string or ribbon, a single kanji character printed on it, used to label a destination, a filter, or a category — literally a luggage tag.

**Where it recurs:** Destination postcards (already prototyped — 京都/大阪/奈良/箱根), itinerary category filters, packing-list categories.

**Why it's uniquely Japitin:** Real Japanese luggage tags and *nifuda* (荷札) are a specific, recognizable object — using them as the filter/label metaphor is a detail no generic travel app would reach for.

**Asset type:** Nano Banana illustration, transparent PNG, one blank template per tag color; kanji rendered live as text (so any city/category can reuse the same tag shape).

---

## 7. The Passport Stamp Set

**What it is:** Circular, hand-illustrated stamps, one visually distinct design per city/milestone (Tokyo's stamp looks nothing like Kyoto's), collected on Passport pages. This is the visual language for progress and achievement — replacing progress bars and percentage badges wherever the underlying thing being tracked is really "places visited" or "milestones reached."

**Where it recurs:** Passport object, Achievement teaser, trip-completion recap.

**Why it's uniquely Japitin:** Directly answers `OBJECT_BIBLE.md`'s "memories, not rewards" principle in visual form — a stamp commemorates a place; a progress bar just measures completion.

**Asset type:** Nano Banana illustration, one stamp per city, generated on demand as each city is actually needed (per `ILLUSTRATION_LIBRARY.md`'s governance — not batch-produced upfront).

---

## 8. The Ink Brush Accent

**What it is:** A single hand-brushed swash stroke in Ai Indigo, used as an underline or flourish beneath a section heading or a milestone headline — never a full decorative border, just one confident stroke.

**Where it recurs:** Section headings ("Inspírate," "Tu itinerario"), milestone/achievement headlines.

**Why it's uniquely Japitin:** Signals "handwritten," which is the entire point of the notebook metaphor — a straight CSS underline or a colored bar reads as software no matter how well the rest of the screen is dressed.

**Asset type:** Nano Banana illustration or hand-authored SVG path, transparent PNG/SVG, 2–3 stroke variants to avoid obvious repetition.

---

## 9. Sakura Drift

**What it is:** A small number of individually-rendered falling/scattered petals, used as Japitin's answer to a confetti burst — but earned, not decorative. Triggered only by real milestones (a booking confirmed, a trip completed, a Stamp earned), never as ambient looping animation.

**Where it recurs:** The one moment right after a genuine milestone — paired directly with the Hanko Ring's stamp motion (`OBJECT_BIBLE.md`'s Stamp object), not a separate celebration system.

**Why it's uniquely Japitin:** Generic apps use confetti; Japitin's "confetti" is specific to its own iconography, and specifically restrained — the restraint itself (rare, motion-respecting, never idle) is as much the signature as the petals.

**Asset type:** Nano Banana illustration (petal cluster, transparent PNG, already spec'd in `ILLUSTRATION_LIBRARY.md`'s Seasonal category) animated via CSS.

---

## 10. The Folded Corner & Paper Clip

**What it is:** Two small variants of the same idea — a dog-eared folded page corner, or a tiny illustrated paper clip — used to show that one piece of content is physically attached to another (a receipt clipped to a reservation, a note folded into a journal entry).

**Where it recurs:** Reservation detail (clipped confirmation), Journal entries with an attached photo or note, Budget entries with an attached receipt.

**Why it's uniquely Japitin:** Distinguishes "this belongs to that" from "this is near that" — the same instinct as Washi Tape (#3), applied to smaller, more incidental attachments rather than full postcards/photos.

**Asset type:** Nano Banana illustration, transparent PNG, one paper clip (silver or gold) + folded-corner treated as a CSS clip-path/gradient trick (cheap enough not to need raster art).

---

## Governance

- **Two-screen rule** (stated above) is the actual test for whether something belongs on this list — don't add an eleventh entry for a one-off flourish.
- **Nano Banana is the illustrator, CSS is the layout engine.** If a motif's *identity* comes from its illustrated detail (a stamp's ink texture, a tape's paper grain), it's a Nano Banana asset. If a motif's identity comes from its *shape and behavior* (the notch, the divider, the fold), CSS/SVG is enough and a raster asset would be wasted weight. Each entry above states which.
- **Every generated asset lands in `images/illustrations/generated/`** per `ILLUSTRATION_LIBRARY.md`'s existing structure and compression rule — signature-element assets aren't a separate pipeline.
- **Imperfection is deliberate, not sloppiness.** Every physical motif (tape rotation, stamp placement, fold angle) should vary slightly per instance — a repeated, pixel-identical "imperfection" reads as a texture, which is the opposite of the intended effect. Where feasible, randomize rotation/offset within a small range rather than hand-picking one "imperfect" position and reusing it everywhere.
