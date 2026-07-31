import assert from 'node:assert/strict';
import { applyManualActivityOrder, moveActivityByOffset, orderActivitiesForDisplay, removeFromManualActivityOrder } from '../js/features/itinerary/activity-order.js';

const parseTime = value => {
  const [hours, minutes] = String(value).split(':').map(Number);
  return hours * 60 + minutes;
};

const day = { activities: [
  { id: 'late', time: '18:00' },
  { id: 'early', time: '09:00' },
  { id: 'mid', time: '13:00' }
] };
assert.deepEqual(orderActivitiesForDisplay(day, parseTime).map(item => item.id), ['early', 'mid', 'late']);
applyManualActivityOrder(day, ['late', 'early', 'mid']);
assert.deepEqual(orderActivitiesForDisplay(day, parseTime).map(item => item.id), ['late', 'early', 'mid']);
removeFromManualActivityOrder(day, 'early');
assert.deepEqual(day.manualActivityOrder, ['late', 'mid']);
day.activities.push({ id: 'new', time: '08:00' });
assert.deepEqual(orderActivitiesForDisplay(day, parseTime).map(item => item.id), ['late', 'mid', 'new', 'early']);
assert.deepEqual(applyManualActivityOrder(day, ['new', 'new', 'missing']), ['new', 'late', 'early', 'mid']);
assert.equal(moveActivityByOffset(day, 'mid', -2), true);
assert.deepEqual(day.manualActivityOrder, ['new', 'mid', 'late', 'early']);
assert.equal(moveActivityByOffset(day, 'new', -1), false);
const chronologicalDay = { activities: [{ id: 'night', time: '20:00' }, { id: 'morning', time: '08:00' }] };
assert.equal(moveActivityByOffset(chronologicalDay, 'morning', 1, parseTime), true);
assert.deepEqual(chronologicalDay.manualActivityOrder, ['night', 'morning']);
console.log('itinerary manual order: ok');
