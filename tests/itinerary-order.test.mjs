import assert from 'node:assert/strict';
import { analyzeDaySchedule, applyManualActivityOrder, duplicateActivity, moveActivityBetweenDays, moveActivityByOffset, orderActivitiesForDisplay, removeFromManualActivityOrder } from '../js/features/itinerary/activity-order.js';

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

const source = { activities: [{ id: 'move-me', title: 'Templo', time: '09:00' }] };
const target = { activities: [{ id: 'existing', time: '10:00' }] };
const moved = moveActivityBetweenDays(source, target, 'move-me', 0);
assert.equal(moved.sourceIndex, 0);
assert.deepEqual(target.activities.map(item => item.id), ['move-me', 'existing']);
assert.equal(source.activities.length, 0);

const copy = duplicateActivity(target.activities[0], 'copy-id');
assert.equal(copy.id, 'copy-id');
assert.equal(copy.title, 'Templo (copia)');
assert.notEqual(copy, target.activities[0]);

const analysis = analyzeDaySchedule({ date: '2026-08-12', dayStart: '08:00', dayEnd: '20:00', activities: [
  { id: 'a', title: 'Museo', time: '09:00', duration: 90, location: 'Ueno', cost: 500 },
  { id: 'b', title: 'Mercado', time: '10:00', duration: 60, travelTimeMinutes: 40, location: 'Toyosu' },
  { id: 'c', title: 'Cena', time: '18:00', duration: 60 }
] }, [{ id: 'flight', title: 'Vuelo a Osaka', type: 'Vuelo', startAt: '2026-08-12T17:00', endAt: '2026-08-12T19:30' }]);
assert.ok(analysis.conflicts.some(item => item.type === 'overlap' && item.minutes === 30));
assert.ok(analysis.conflicts.some(item => item.type === 'blocking-transfer' && item.activityId === 'c'));
assert.ok(analysis.conflicts.some(item => item.type === 'missing-location' && item.activityId === 'c'));
assert.equal(analysis.totalCost, 500);
assert.ok(analysis.freeSlots.some(slot => slot.minutes > 0));
console.log('itinerary manual order: ok');
