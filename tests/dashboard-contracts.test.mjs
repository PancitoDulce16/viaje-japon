import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, suggestions, wizard, dialog, journal, itinerary, map, budgetTracker] = await Promise.all([
  readFile(new URL('../dashboard.html', import.meta.url), 'utf8'),
  readFile(new URL('../js/ai/smart-suggestions-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../js/features/itinerary/smart-generator-wizard.js', import.meta.url), 'utf8'),
  readFile(new URL('../js/ui/dialog-a11y.js', import.meta.url), 'utf8'),
  readFile(new URL('../js/features/journal/travel-journal.js', import.meta.url), 'utf8'),
  readFile(new URL('../js/features/itinerary/itinerary-v3.js', import.meta.url), 'utf8'),
  readFile(new URL('../js/map/map.js', import.meta.url), 'utf8'),
  readFile(new URL('../js/features/budget/budget-tracker.js', import.meta.url), 'utf8')
]);
for (const eager of ['/js/features/trips/pdf-exporter.js', '/js/features/trips/export-manager.js', '/js/features/budget/expense-charts.js']) assert.ok(!html.includes(`src="${eager}"`));
assert.match(html, /jp-modal-shell/);
assert.match(suggestions, /aria-labelledby/);
assert.match(suggestions, /data-suggestion-payload/);
assert.doesNotMatch(suggestions, /onclick='SuggestionsEngine\.addSuggestionToItinerary/);
assert.match(journal, /if \(!this\.initialized\) await this\.initialize\(\)/);
assert.match(journal, /escapeMarkup/);
assert.match(itinerary, /day-route-progress/);
assert.match(itinerary, /<details class="day-index-timeline/);
assert.match(map, /jp-map-day-select/);
assert.match(map, /jp-map-search/);
assert.match(budgetTracker, /jp-ledger-form/);
assert.match(budgetTracker, /jp-ledger-receipt/);
assert.match(wizard, /aria-modal="true"/);
assert.match(dialog, /event\.key === 'Escape'/);
assert.match(dialog, /event\.key !== 'Tab'/);
assert.match(dialog, /previousFocus\.focus/);
console.log('dashboard contracts: ok');
