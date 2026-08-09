import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { calculateTripCountdown, classifyTasks, packingProgress, summarizeItinerary } from '../js/features/dashboard/dashboard-summary.js';

const today = new Date('2026-08-09T12:00:00');
assert.deepEqual(calculateTripCountdown('2026-08-19', '2026-08-29', today), { state:'upcoming', days:10 });
assert.deepEqual(calculateTripCountdown('2026-08-01', '2026-08-12', today), { state:'traveling', days:4 });
assert.deepEqual(calculateTripCountdown('', '', today), { state:'unknown', days:null });

const taskSummary = classifyTasks([
  { id:'late', dueDate:'2026-08-08', completed:false },
  { id:'soon', dueDate:'2026-08-12', completed:false },
  { id:'later', dueDate:'2026-09-01', completed:false },
  { id:'done', dueDate:'2026-08-08', completed:true }
], today);
assert.deepEqual(taskSummary.overdue.map(item=>item.id), ['late']);
assert.deepEqual(taskSummary.upcoming.map(item=>item.id), ['soon']);
assert.equal(taskSummary.pending.length, 3);

assert.deepEqual(packingProgress([]), { total:0, packed:0, pending:0, percent:0 });
assert.deepEqual(packingProgress([{packed:true},{packed:false},{checked:true}]), { total:3, packed:2, pending:1, percent:67 });
assert.deepEqual(summarizeItinerary([], today), { total:0, completed:0, percent:0, next:null });
const itinerary = summarizeItinerary([{ date:'2026-08-09', activities:[{title:'Templo',time:'08:00'},{title:'Cena',time:'18:00'}] }], today);
assert.equal(itinerary.completed, 1); assert.equal(itinerary.next.title, 'Cena'); assert.equal(itinerary.percent, 50);

const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
assert.match(rules, /match \/tasks\/\{taskId\}/);
assert.match(rules, /match \/packingItems\/\{itemId\}/);
assert.match(rules, /isTripMember\(tripId\)/);
assert.doesNotMatch(rules, /match \/packingItems[\s\S]*allow (read|write): if true/);
console.log('✓ trip-dashboard: fechas, tareas, itinerario, equipaje y reglas');
