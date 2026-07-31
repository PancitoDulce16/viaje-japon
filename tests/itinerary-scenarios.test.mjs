import assert from 'node:assert/strict';
import { buildTravelerCapacity } from '../js/features/itinerary/traveler-capacity.js';
import { analyzeDayExertion } from '../js/features/itinerary/day-route-flow.js';
import { buildIntercityTransfer, analyzeJourneyTransfers } from '../js/features/itinerary/intercity-transfer.js';
import { adaptDayToWeather, applyLodgingConstraints } from '../js/features/itinerary/day-adaptation.js';
import { filterClosedActivities, scheduleWithinOpeningHours } from '../js/features/itinerary/schedule-availability.js';
import { analyzeRoutePressure } from '../js/features/itinerary/route-pressure.js';

const adult = buildTravelerCapacity([30]);
const senior = buildTravelerCapacity([72]);
const wheelchair = buildTravelerCapacity([35], 'wheelchair');
assert.equal(wheelchair.activityMultiplier, .6);
assert.ok(analyzeDayExertion([{ duration: 180, energyCost: 5 }], { estimatedSteps: 8000 }, senior).score > analyzeDayExertion([{ duration: 180, energyCost: 5 }], { estimatedSteps: 8000 }, adult).score);

const longTransfer = buildIntercityTransfer({ city: 'Tokyo' }, { city: 'Hiroshima' });
assert.equal(longTransfer.isTravelDay, true);
const chain = Array.from({ length: 4 }, (_, index) => ({ day: index + 1, transferPlan: { durationMinutes: 180, warnings: [] } }));
assert.ok(analyzeJourneyTransfers(chain).some(warning => warning.type === 'consecutive-long-transfers'));

const rainy = adaptDayToWeather({ activities: [{ title: 'Parque', category: 'park' }] }, { isRainy: true }, [{ title: 'Museo', category: 'museum' }]);
assert.equal(rainy.changes[0].to, 'Museo');
const ryokan = applyLodgingConstraints({ hotel: { name: 'Gion Ryokan' }, activities: [{ title: 'Bar', time: '18:00' }, { title: 'Cena reservada', time: '19:00', reservation: true }] });
assert.ok(!ryokan.activities.some(activity => activity.title === 'Bar'));
assert.ok(ryokan.activities.some(activity => activity.reservation));

const closed = filterClosedActivities([{ name: 'Museo', closed_days: [2] }, { name: 'Templo', closed_days: [] }], '2026-10-05', 2);
assert.deepEqual(closed.closed.map(item => item.name), ['Museo']);
assert.equal(scheduleWithinOpeningHours([{ name: 'Torre', duration: 120, opening_hours: { start: 10, end: 21 } }], 9).scheduled[0].time, '10:00');

const repeatedCity = analyzeRoutePressure([{ city: 'Tokyo', days: 2 }, { city: 'Kyoto', days: 1 }, { city: 'Tokyo', days: 2 }], 5);
assert.equal(repeatedCity.severity, 'high');
assert.equal(repeatedCity.hotelChanges, 2);
console.log('itinerary scenarios: ok');
