import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const assetPath = 'images/illustrations/generated/panorama/japitin-route-scrapbook-v2.webp';
const [asset, journalAsset, suggestionsAsset, css, scrapbookCss, itinerary, headerView] = await Promise.all([
  stat(assetPath),
  stat('images/illustrations/generated/panorama/japitin-journal-desk-v1.webp'),
  stat('images/illustrations/generated/panorama/japitin-suggestions-desk-v1.webp'),
  readFile('css/itinerary-polish.css', 'utf8'),
  readFile('css/journal-suggestions-scrapbook.css', 'utf8'),
  readFile('js/features/itinerary/itinerary-v3.js', 'utf8'),
  readFile('js/features/itinerary/trip-header-view.js', 'utf8')
]);

assert.ok(asset.size > 20_000, 'the panorama must not be an empty placeholder');
assert.ok(asset.size < 300_000, 'the panorama must stay within its web performance budget');
assert.ok(journalAsset.size > 20_000 && journalAsset.size < 250_000, 'journal art must be real and web-sized');
assert.ok(suggestionsAsset.size > 20_000 && suggestionsAsset.size < 250_000, 'suggestions art must be real and web-sized');
assert.match(scrapbookCss, /japitin-journal-desk-v1\.webp/);
assert.match(scrapbookCss, /japitin-suggestions-desk-v1\.webp/);
assert.match(scrapbookCss, /prefers-reduced-motion:reduce/);
assert.match(css, /japitin-route-scrapbook-v2\.webp/);
assert.match(css, /prefers-reduced-data:reduce/);
const todayCss = await readFile('css/today-mode.css', 'utf8');
const kawaiiCss = await readFile('css/itinerary-kawaii-accent.css', 'utf8');
const referenceCss = await readFile('css/reference-final-pass.css', 'utf8');
assert.match(kawaiiCss, /--color-kasumi/);
assert.match(kawaiiCss, /activity-checkbox:checked/);
assert.match(kawaiiCss, /prefers-reduced-motion:reduce/);
assert.match(referenceCss, /jp-map-search/);
assert.match(referenceCss, /jp-ledger-receipt/);
assert.match(referenceCss, /hero-moment__content/);
assert.match(todayCss, /japitin-route-scrapbook-v2\.webp/);
assert.match(headerView, /trip-header-banner--journey/);
assert.doesNotMatch(itinerary, /class="jp-trip-(?:postmark|polaroid|dogwrap)"/);

const [designSystem, tokens, lab, agents, inventory, references, catSticker, dogSticker] = await Promise.all([
  readFile('docs/design/JAPITIN_DESIGN_SYSTEM.md', 'utf8'),
  readFile('css/tokens.css', 'utf8'),
  readFile('design-system.html', 'utf8'),
  readFile('AGENTS.md', 'utf8'),
  readFile('docs/design/JAPITIN_ASSET_INVENTORY.md', 'utf8'),
  readFile('docs/design/references/README.md', 'utf8'),
  readFile('images/illustrations/generated/companions/cat-guide.png'),
  readFile('images/illustrations/generated/companions/dog-explorer.png')
]);

assert.match(designSystem, /Japitin es una aplicación de viajes completamente kawaii/);
assert.match(designSystem, /Noche en Japón/);
assert.match(designSystem, /retiros de cajero/);
assert.match(agents, /Las ocho capturas originales del producto/);
assert.match(agents, /gatito guía/i);
assert.match(agents, /perrito explorador/i);
assert.match(tokens, /--surface-ticket:/);
assert.match(tokens, /--surface-map:/);
assert.match(tokens, /--surface-page: #08172D/);
assert.doesNotMatch(tokens, /--surface-page:\s*#000(?:000)?\b/i);
assert.match(lab, /id="referencias"/);
assert.match(lab, /Compañeros oficiales/);
assert.match(lab, /Budget Tracking intuitivo/);
assert.match(inventory, /variantes opacas/i);
assert.match(inventory, /RGBA real/i);
assert.match(references, /descartada como fuente de diseño/);

const pngColorType = buffer => buffer[25];
const pngWidth = buffer => buffer.readUInt32BE(16);
const pngHeight = buffer => buffer.readUInt32BE(20);
assert.ok([4, 6].includes(pngColorType(catSticker)), 'cat sticker PNG must contain an alpha channel');
assert.ok([4, 6].includes(pngColorType(dogSticker)), 'dog sticker PNG must contain an alpha channel');
assert.ok(pngWidth(catSticker) > 0 && pngHeight(catSticker) > 0, 'cat sticker must have valid dimensions');
assert.ok(pngWidth(dogSticker) > 0 && pngHeight(dogSticker) > 0, 'dog sticker must have valid dimensions');
assert.doesNotMatch(lab, /note-sticker-(?:cat-cutout|dog-v2)|tk-(?:cat|dog)head-final/);
console.log('visual asset contract: ok');
