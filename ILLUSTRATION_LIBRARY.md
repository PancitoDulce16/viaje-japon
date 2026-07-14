# Japitin — Illustration Library

Companion doc to `DESIGN_SYSTEM.md` §3 and `OBJECT_BIBLE.md`. Every illustration Japitin will ever ship belongs to exactly one category below. This document exists so illustrations get generated *into* a structure, instead of accumulating as one-off assets nobody can find or match a style against later.

```
images/illustrations/
  reference/    seed boards — external inspiration, never shipped as-is (already seeded)
  generated/    canonical Nano Banana output — organized by the categories below
```

Suggested `generated/` subfolder layout, mirroring this doc 1:1: `generated/cities/`, `generated/landmarks/`, `generated/transportation/`, `generated/food/`, `generated/nature/`, `generated/seasonal/`, `generated/characters/`, `generated/weather/`, `generated/empty-states/`, `generated/loading/`, `generated/maps/`, `generated/airport/`, `generated/shopping/`, `generated/shrines/`, `generated/emotional-moments/`.

## House style lock

Every Nano Banana prompt in this document ends with the same style-lock clause, so the model is anchored to one visual universe instead of reinterpreting the brief each time. Update this clause (and this clause only) as the library matures per the continuous-evolution rule — every category's prompts inherit the update automatically.

> **Style lock:** *"Flat-vector illustration with soft painterly gradients for depth, warm directional lighting, semi-realistic architectural proportions (not chibi, not photorealistic), skies shifting dusk-to-day per scene. Ink-indigo (#2B3868) linework. Palette limited to sky blue, teal, sakura pink, warm orange used sparingly, and warm cream — no neon, no flat solid fills, no dark/moody lighting. Sakura branches may frame one or two corners but never cover the subject. No text, no UI chrome baked into the image."*

Before generating anything new: open `generated/<category>/` and `reference/`, and check composition, stroke weight, palette, lighting, perspective, and character style against what's already there — per `DESIGN_SYSTEM.md` §3, later generations are matched against earlier *generated* ones, not just the original references.

---

## Cities

| | |
|---|---|
| **Purpose** | Establishes "where the user is" at the broadest level — the backdrop for Travel Card's route map and city-level headers. |
| **Visual style** | A skyline silhouette distilled to 2–3 instantly-recognizable landmarks per city, not a literal panorama — Tokyo Tower + Skytree reads as Tokyo faster than an accurate skyline would. |
| **Reusability** | High — one hero illustration per city is reused across Travel Card, Discovery headers, and Passport covers for that city. |
| **Variants** | Day / dusk / sakura-season / winter, per city — four variants of the same composition, not four different compositions. |
| **Nano Banana prompt guidance** | `"Tokyo skyline at [day/dusk], Tokyo Tower and Skytree as the two dominant landmarks, low-rise traditional rooftops in the foreground, [sakura branches in bloom / bare winter branches] framing the left corner." + style lock` |

---

## Landmarks

| | |
|---|---|
| **Purpose** | A single named place rendered in enough detail to be the hero of its own screen — Senso-ji, Kiyomizu-dera, Fushimi Inari's torii gates. This is where Discovery and Ticket detail views earn their "destination-specific, not generic" requirement. |
| **Visual style** | Semi-realistic architectural detail (real roof tiers, real gate proportions) — noticeably more detailed than the Cities category's simplified silhouettes, since these are looked at up close, not glanced at. |
| **Reusability** | Medium — one strong illustration per landmark, reused between its Discovery card and its Ticket/Reservation detail view. |
| **Variants** | Time-of-day (matches when the user is likely visiting), crowd-level mood (quiet dawn vs. lively afternoon) only where it changes the story, not by default. |
| **Nano Banana prompt guidance** | `"Senso-ji Temple's Kaminarimon gate with the large red lantern, worshippers small in scale in the foreground for scale, morning light, cherry blossoms framing the upper-left corner." + style lock` |

---

## Transportation

| | |
|---|---|
| **Purpose** | Shinkansen, local trains, buses, ferries — supports the Ticket and Train Pass objects, which are transit-heavy by nature. |
| **Visual style** | Trains rendered with correct silhouette/nose-shape per line where recognizable (Hikari/Nozomi vs. a local line), always in motion (slight speed-line or blur cue), never static parked-train renders — motion is part of the subject. |
| **Reusability** | High — a small set of vehicle illustrations (Shinkansen, subway car, bus, ferry) reused across every Ticket of that transit type nationwide, not regenerated per city. |
| **Variants** | Exterior (for Ticket headers), interior (for onboarding/"what to expect" moments). |
| **Nano Banana prompt guidance** | `"Shinkansen bullet train speeding left to right past a rural landscape with Mt. Fuji visible in the background, slight motion blur on the train, cherry blossoms along the tracks." + style lock` |

---

## Food

| | |
|---|---|
| **Purpose** | Individual dishes for the Food Passport object — ramen, sushi, matcha, konbini snacks. |
| **Visual style** | Close, appetizing, slightly-above angle (the classic "food photography" framing translated to flat illustration), the dish fills most of the frame — this category is the one exception to "characters/scenes," it's closer to a still-life. |
| **Reusability** | Very high — one illustration per dish type, reused across every Food Passport entry, every Discovery restaurant card, everywhere that dish appears regardless of which restaurant. |
| **Variants** | Regional variants only where visually distinct (Hokkaido miso ramen vs. Hakata tonkotsu look genuinely different — Tokyo vs. Osaka ramen mostly don't, don't over-fragment this). |
| **Nano Banana prompt guidance** | `"A bowl of tonkotsu ramen viewed from a slight top-down angle, rich cloudy broth, chashu pork and nori visible, steam rendered as soft translucent curls, chopsticks resting on the bowl edge." + style lock` |

---

## Nature

| | |
|---|---|
| **Purpose** | Landscapes without a landmark as the subject — Arashiyama's bamboo grove, Hakone's lake, mountain trails. Supports Discovery's "hidden gem" and Nature-adjacent itinerary stops. |
| **Visual style** | More atmospheric and less architectural than Landmarks — soft depth-of-field-equivalent through layered gradient planes (near/mid/far), quieter compositions. |
| **Reusability** | Medium — tied to specific named natural sites, reused wherever that site is referenced. |
| **Variants** | Seasonal (this category overlaps Seasonal below more than any other — a bamboo grove in autumn is a genuinely different illustration, generate deliberately, not as a recolor). |
| **Nano Banana prompt guidance** | `"Arashiyama bamboo grove path, tall bamboo stalks creating a natural corridor, dappled soft light filtering through, a narrow stone path leading into the depth of the scene, no people." + style lock` |

---

## Seasonal

| | |
|---|---|
| **Purpose** | Sakura, autumn foliage, winter snow, summer festivals — the layer that makes the app feel alive to the actual calendar of a real trip, not evergreen stock art. |
| **Visual style** | Not a separate style — a *modifier* applied consistently across other categories (a City, a Landmark, a Nature scene can all take a seasonal pass). This category's own dedicated assets are the seasonal motifs themselves: falling sakura petals, autumn leaves, snowfall, festival lanterns — used as overlay/foreground decoration. |
| **Reusability** | Very high — a small set of seasonal overlay elements (petals, leaves, snow, lanterns) reused as decorative layers across dozens of base illustrations. |
| **Variants** | Sakura (spring), momiji (autumn), snow (winter), matsuri lanterns (summer). |
| **Nano Banana prompt guidance** | `"A scattered arrangement of falling sakura petals and small blossom clusters, isolated on transparent background, varied petal rotation and size for natural scatter, suitable as a decorative overlay layer." + style lock` |

---

## Characters

| | |
|---|---|
| **Purpose** | The traveler figures that appear in hero scenes (walking with a suitcase, standing at a platform) — supports Home/Travel Card hero illustrations and onboarding. |
| **Visual style** | Simple, geometric-but-warm, friendly — explicitly *not* mascot/cartoon register (per `DESIGN_SYSTEM.md` §3). Faces are minimal/suggested, not detailed — the character is a mood, not a protagonist with a personality of their own. |
| **Reusability** | Medium — a small cast of interchangeable traveler poses (walking, sitting, pointing, photographing) reused across many scenes rather than one bespoke character per screen. |
| **Variants** | Solo traveler, pair, family, generic silhouette (for empty/placeholder-adjacent moments where a specific figure would be presumptuous). |
| **Nano Banana prompt guidance** | `"A simple, friendly, geometric traveler character walking with a rolling suitcase, three-quarter view, minimal facial detail, warm orange suitcase as a color accent, mid-stride pose suggesting motion." + style lock` |

---

## Weather

| | |
|---|---|
| **Purpose** | Small glyphs for the Weather object — sunny, cloudy, rain, snow, and Japan-specific conditions (humid summer haze, plum-rain season). |
| **Visual style** | The smallest/simplest illustrations in the library — these render at chip-size, so detail collapses at scale; test every weather glyph at ~24px before approving it into `generated/weather/`. |
| **Reusability** | Very high — a fixed small set, reused everywhere weather appears, never regenerated per city. |
| **Variants** | Day and night version of each condition (a sunny-day glyph and a clear-night glyph are different illustrations, not a recolor). |
| **Nano Banana prompt guidance** | `"A simple, small-scale friendly cloud-and-sun weather icon illustration, bold simplified shapes that stay legible at 24px, soft gradient shading, no fine linework that would disappear at small size." + style lock` |

---

## Empty States

| | |
|---|---|
| **Purpose** | Every empty state gets a unique, context-relevant illustration per `DESIGN_SYSTEM.md` §6 — "no empty state ever feels empty." This category exists so that requirement has real supply behind it. |
| **Visual style** | Warmer and more narrative than a typical UI illustration — a bench under a sakura tree ("your next adventure is waiting"), an empty suitcase with a hopeful glow, a blank journal page with a pen resting on it — each one should specifically evoke *anticipation*, not absence. |
| **Reusability** | Low by design — genuinely one illustration per empty-state context (empty itinerary ≠ empty Food Passport ≠ empty Journal), because a generic "nothing here" graphic reused everywhere is exactly the failure mode this category prevents. |
| **Variants** | One per object/screen that can be empty — audit `js/ui/empty-states.js`'s existing preset list as the starting inventory (favorites, notes, itinerary, expenses, search-no-results, packing, chat) and extend per new object as Phase 2/4 build out. |
| **Nano Banana prompt guidance** | `"A small illustrated wooden bench beneath a blooming sakura tree, petals gently falling, warm inviting empty path leading into the scene suggesting a journey about to begin, no text." + style lock` |

---

## Loading

| | |
|---|---|
| **Purpose** | What the user sees while something is fetching — an opportunity for a small moment of delight instead of a bare spinner, without stalling perceived performance. |
| **Visual style** | Simple looping motifs that read instantly and don't demand attention — a small train icon moving along a dotted line, a paper airplane, a subtle bouncing luggage tag. Must be lightweight (short, seamless loop) since it's shown often and briefly. |
| **Reusability** | Very high — 2–3 loop illustrations cover the whole app; this is not a place for variety. |
| **Variants** | A generic loader and one transit-themed variant (train-on-a-line) for anywhere transit/route data is being fetched specifically. |
| **Nano Banana prompt guidance** | `"A small simplified train icon on a dotted horizontal line suggesting a route, designed as a clean flat illustration suitable for a seamless looping animation, minimal detail." + style lock` |

---

## Maps

| | |
|---|---|
| **Purpose** | Stylized route/location illustrations — the mini Japan map in Travel Card, city-district maps for Discovery context. Distinct from the functional Leaflet map already in the app (`js/map/map.js`) — this category is illustrative, not interactive/geodata-accurate. |
| **Visual style** | Simplified, slightly abstracted Japan silhouette (matcha-green landmass on Sora-blue water), route lines as soft dashed or solid curves between city dots, never a literal accurate cartographic rendering. |
| **Reusability** | High — one Japan-silhouette base map, reused with different route overlays per trip. |
| **Variants** | Whole-Japan overview (Travel Card), single-city district zoom (Discovery context). |
| **Nano Banana prompt guidance** | `"A simplified, softly rounded illustrated silhouette of the Japan archipelago in muted matcha green on a sky-blue water background, minimal coastline detail, suitable as a base map for route overlays." + style lock` |

---

## Airport

| | |
|---|---|
| **Purpose** | Arrival/departure moments specifically — Narita/Haneda/Kansai terminal scenes for the "you're in transit" Home hero state already built into the approved mockup. |
| **Visual style** | Interior-leaning (gate signage, glass walls, a glimpse of a plane through a window) rather than exterior terminal-building shots — this is about the feeling of transit, not architecture. |
| **Reusability** | Medium — a handful of generic-enough airport interior scenes reused across arrival/departure/layover moments, not one per specific airport unless a specific terminal becomes narratively important. |
| **Variants** | Arrival (character walking toward the viewer, luggage in tow), departure/waiting (character seated, looking at a departure board). |
| **Nano Banana prompt guidance** | `"Airport terminal interior with large glass windows showing a parked airplane outside, a simple friendly traveler character walking with a rolling suitcase toward the viewer, soft morning light." + style lock` |

---

## Shopping

| | |
|---|---|
| **Purpose** | Souvenir shops, konbini, department stores, market streets like Nakamise-dori — supports Discovery and Journal moments centered on buying/browsing. |
| **Visual style** | Busy-but-warm — more visual density than other categories is appropriate here (shelves, hanging signage, product clusters) since browsing-density is the actual subject, but keep the ink-indigo linework disciplined so it doesn't tip into visual noise. |
| **Reusability** | Medium — a market-street scene and a konbini-interior scene cover most needs; specific named shops only when narratively relevant. |
| **Variants** | Traditional market street (Nakamise-dori style), modern konbini/department store. |
| **Nano Banana prompt guidance** | `"Nakamise-dori shopping street with traditional wooden stalls on both sides selling souvenirs and snacks, red lanterns hanging overhead, a sense of gentle bustle without literal crowds of people, daytime." + style lock` |

---

## Shrines

| | |
|---|---|
| **Purpose** | Torii gates, shrine grounds, purification fountains — split out from Landmarks specifically because shrines/temples recur so often (Stamp/Passport goshuin content, Discovery religious-site results) that they warrant their own consistent sub-language rather than being one-off Landmark treatments. |
| **Visual style** | Respectful and calm — avoid turning sacred sites into generic "cute Japan" decoration (a direct instance of the brief's "without becoming stereotypical" requirement). Real proportions, real torii vermillion, quiet compositions, rarely more than one or two small figures if any. |
| **Reusability** | Medium — generic shrine-gate and shrine-grounds compositions reused broadly, named-shrine detail (Fushimi Inari's thousand gates specifically) reserved for that shrine's own Landmark entry. |
| **Variants** | Torii gate alone (works as a small motif/Stamp backdrop), full shrine grounds (works as a scene-level hero). |
| **Nano Banana prompt guidance** | `"A single traditional vermillion torii gate standing quietly against a soft sky, simple stone steps leading up to it, calm and respectful composition, minimal surrounding detail so the gate itself remains the clear subject." + style lock` |

---

## Emotional Moments

| | |
|---|---|
| **Purpose** | The category `OBJECT_BIBLE.md`'s Memory and Achievement objects actually draw from — illustrated versions of specific milestone moments ("Primer viaje en Shinkansen," "Primer amanecer en Japón") rather than a generic celebration graphic. |
| **Visual style** | The most personal/specific category in the library — close-in framing on the moment itself (a hand pressed to a train window watching Fuji pass, a first sunrise over a skyline from a hotel window), warmer and quieter than the more "establishing shot" categories above. |
| **Reusability** | Low — closer to Empty States than to Cities in reusability; a milestone illustration should feel earned and specific, not recognizably reused across unrelated users' different milestones. Where full custom-per-user generation isn't feasible, favor a modest library of ~10-15 common milestone scenes (first Shinkansen, first onsen, first torii walk, first ramen, first sunrise) over one generic "celebration" graphic stretched across all of them. |
| **Variants** | One per common milestone type; user-named custom milestones can fall back to a warm generic "moment" composition rather than forcing a mismatched specific scene. |
| **Nano Banana prompt guidance** | `"Close view from inside a Shinkansen window, a traveler's hand resting on the glass, Mt. Fuji passing by in the soft-focus background, warm quiet late-afternoon light, a sense of a personal quiet moment rather than a scenic postcard." + style lock` |

---

## Governance

- **Generate on demand only** (per `DESIGN_SYSTEM.md` §3) — this document defines the shape of the library, not a backlog to batch-produce.
- **Every approved image lands in its category's `generated/` subfolder** with a descriptive filename (`senso-ji-kaminarimon-morning-sakura.png`, not `illustration_final_v2.png`) so the library stays legible as it grows.
- **When a category's own examples start disagreeing with each other**, that's the signal to revisit the house style lock — not to let the drift continue.
- **Compress before landing in `generated/`.** Nano Banana's raw PNG output runs ~2MB per image. Re-encoded as JPEG (quality ~82) it drops to roughly a tenth of that with no visible quality loss for this illustration style — verified on the first real asset (`cities/tokyo-skyline-day-sakura.jpg`, 1.9MB → 205KB). Use `.jpg` for photographic/painterly scenes; keep `.png` only for anything that genuinely needs transparency (icon-style assets, seasonal overlays meant to composite over other art).
