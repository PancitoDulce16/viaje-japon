import assert from 'node:assert/strict';
import { templateCatalog, getTemplate, instantiateTemplate, shiftCalendarDate, persistTemplateTrip } from '../js/features/itinerary/template-library.js';
import { renderTemplatePlanning } from '../js/features/itinerary/template-planning.js';
import { loadOptionalLocalConfig } from '../js/core/local-config.js';
import { analyzeDayFeasibility } from '../js/features/itinerary/trip-companion.js';

const id = 'japan-february-2027';
const prepared = instantiateTemplate(id);
assert.equal(prepared.tripData.dateStart, '2027-02-15');
assert.equal(prepared.tripData.dateEnd, '2027-03-06');
assert.equal(prepared.itineraryData.days.length, 20);
assert.deepEqual(prepared.tripData.accommodations.map(h => h.nights), [4, 5, 4, 6]);
assert.equal(prepared.tripData.accommodations.reduce((sum, h) => sum + h.nights, 0), 19);
for (const [index, day] of prepared.itineraryData.days.entries()) {
  assert.equal(day.day, index + 1);
  assert.equal(day.date, shiftCalendarDate('2027-02-15', index));
  assert.ok(day.hotel, `missing hotel for day ${day.day}`);
  assert.ok(day.activities.length);
  for (const activity of day.activities) {
    assert.ok(activity.id && activity.description !== undefined);
    assert.equal(activity.cost, null);
    if (activity.reservationRequired) assert.equal(activity.reservationStatus, 'pending');
  }
}
assert.equal(prepared.itineraryData.days[11].hotel.city, 'Osaka', 'Hiroshima excursion retains the Osaka hotel');
const longExcursion = analyzeDayFeasibility(prepared.itineraryData.days[11]);
assert.equal(longExcursion.status, 'tight', 'a fourteen-hour excursion must not be described as comfortable');
assert.ok(longExcursion.issues.some(issue => issue.type === 'travel'));
assert.equal(prepared.itineraryData.days[14].hotel.city, 'Tokyo', 'Hakone excursion retains the Tokyo hotel');
const ids = prepared.itineraryData.days.flatMap(day => day.activities.map(a => a.id));
assert.equal(new Set(ids).size, ids.length);
assert.equal(new Set(templateCatalog.map(t => t.id)).size, templateCatalog.length);
assert.equal(prepared.itineraryData.templatePlanning.pendingDecisions.find(d => d.id === 'cherm-side').original, 'Cherm Side');
const shifted = instantiateTemplate(id, { dateStart: '2028-02-15' });
assert.equal(shifted.tripData.dateEnd, '2028-03-05');
assert.equal(shifted.tripData.accommodations[3].checkIn, '2028-02-28');
assert.equal(shifted.itineraryData.templatePlanning.datesChanged, true);
assert.equal(shifted.itineraryData.templatePlanning.bookingChecklist[0].dueDate, '2026-11-30', 'booking deadlines are real dates, never blindly shifted');
prepared.itineraryData.days[0].activities[0].title = 'edited';
assert.notEqual(instantiateTemplate(id).itineraryData.days[0].activities[0].title, 'edited');
assert.throws(() => instantiateTemplate(id, { dateStart: '2027-02-30' }), /fecha/);
assert.throws(() => instantiateTemplate(id, { dateStart: '2027-02-15', dateEnd: '2027-02-20' }), /20/);
assert.throws(() => getTemplate('nonexistent'), /plantilla/);
assert.equal(getTemplate('otaku-paradise').id, 'japan-15-days-complete');
assert.ok(instantiateTemplate('japan-15-days-complete', { dateStart: '2030-06-01' }).itineraryData.days.every(d => d.date.startsWith('2030-06-')));

const calls = [];
const store = {
  saveTrip: async () => { calls.push('trip'); },
  saveItinerary: async () => { calls.push('itinerary'); },
  removeNewTrip: async () => { calls.push('rollback'); }
};
await persistTemplateTrip(store, {}, prepared.itineraryData);
assert.deepEqual(calls, ['trip', 'itinerary']);
calls.length = 0;
await assert.rejects(persistTemplateTrip({ ...store, saveItinerary: async () => { throw new Error('offline'); } }, {}, {}), /No se cre/);
assert.deepEqual(calls, ['trip', 'rollback']);
await assert.rejects(persistTemplateTrip({ ...store, saveItinerary: async () => { throw new Error('offline'); }, removeNewTrip: async () => { throw new Error('offline'); } }, {}, {}), /Mis viajes/);
calls.length = 0;
await persistTemplateTrip(store, {}, null);
assert.deepEqual(calls, ['trip']);
const unsafe = renderTemplatePlanning({ bookingChecklist: [{ title: '<img src=x onerror=alert(1)>', url: 'javascript:alert(1)' }], pendingDecisions: [], notes: ['<script>test</script>'], sources: [] });
assert.doesNotMatch(unsafe, /<script>|<img|href="javascript:/);
assert.match(unsafe, /&lt;script&gt;/);
assert.deepEqual(await loadOptionalLocalConfig(), {});
console.log('template library: dates, hotels, immutability, save failures and safe planning notes ok');
