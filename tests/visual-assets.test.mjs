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
assert.match(todayCss, /japitin-route-scrapbook-v2\.webp/);
assert.match(headerView, /trip-header-banner--journey/);
assert.doesNotMatch(itinerary, /class="jp-trip-(?:postmark|polaroid|dogwrap)"/);
console.log('visual asset contract: ok');
