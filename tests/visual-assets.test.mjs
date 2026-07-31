import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const assetPath = 'images/illustrations/generated/panorama/japitin-route-scrapbook-v2.webp';
const [asset, css, itinerary] = await Promise.all([
  stat(assetPath),
  readFile('css/itinerary-polish.css', 'utf8'),
  readFile('js/features/itinerary/itinerary-v3.js', 'utf8')
]);

assert.ok(asset.size > 20_000, 'the panorama must not be an empty placeholder');
assert.ok(asset.size < 300_000, 'the panorama must stay within its web performance budget');
assert.match(css, /japitin-route-scrapbook-v2\.webp/);
assert.match(css, /prefers-reduced-data:reduce/);
assert.match(itinerary, /trip-header-banner--journey/);
assert.doesNotMatch(itinerary, /class="jp-trip-(?:postmark|polaroid|dogwrap)"/);
console.log('visual asset contract: ok');
