import assert from 'node:assert/strict';
import { detectJourneyStage, getJourneyMath } from '../js/features/dashboard/stage-detector.js';

// No window.TimeUtils: stage calculation must not depend on script load order.
const trip = { info: { dateStart: '2027-02-15', dateEnd: '2027-03-06' } };
assert.equal(detectJourneyStage(trip, new Date(2027, 0, 1, 23, 59)), 'planning');
assert.equal(detectJourneyStage(trip, new Date(2027, 1, 1)), 'preparing');
assert.equal(detectJourneyStage(trip, new Date(2027, 1, 15)), 'traveling');
assert.equal(detectJourneyStage(trip, new Date(2027, 2, 6, 23, 59)), 'traveling');
assert.equal(detectJourneyStage(trip, new Date(2027, 2, 7)), 'remembering');
assert.equal(detectJourneyStage(trip, new Date(2027, 3, 6)), 'lookingBack');
assert.equal(getJourneyMath(trip, new Date(2027, 1, 15)).totalDays, 20);
assert.equal(getJourneyMath(trip, new Date(2027, 1, 15)).dayOfTrip, 1);
assert.equal(getJourneyMath({ info: { dateStart: '2027-02-30', dateEnd: '2027-03-06' } }), null);
assert.equal(getJourneyMath({ info: { dateStart: '2027-03-10', dateEnd: '2027-03-06' } }), null);
assert.equal(detectJourneyStage(null), 'dreaming');
console.log('dashboard stage regressions: load-order independence, calendar boundaries and invalid dates ok');
