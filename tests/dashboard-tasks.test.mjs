import assert from 'node:assert/strict';
import { renderDashboardTasks, taskDueLabel, toggleDashboardTask } from '../js/features/dashboard/dashboard-tasks.js';

const today = new Date(2026, 10, 13, 12);
assert.equal(taskDueLabel('2026-11-12', today).state, 'overdue');
assert.equal(taskDueLabel('2026-11-13', today).text, 'Hoy');
assert.equal(taskDueLabel('2026-11-14', today).state, 'upcoming');
assert.equal(taskDueLabel('2026-02-30', today).text, 'Sin fecha');
assert.equal(taskDueLabel(null, today).text, 'Sin fecha');
const markup = renderDashboardTasks([
  { id: 'undated', title: 'Sin fecha' },
  { id: 'done', title: 'Already completed', completed: true },
  { id: 'late', title: '<img src=x>', dueDate: '2026-11-12' }
], 'trip-1', today);
assert.ok(markup.indexOf('data-task-id="late"') < markup.indexOf('data-task-id="undated"'));
assert.ok(markup.includes('&lt;img'));
assert.ok(!markup.includes('Already completed'));
assert.ok(markup.includes('Vencida'));
assert.ok(renderDashboardTasks([{ id: 't', title: 'T' }]).includes('disabled'));

const status = { hidden: true, textContent: '' };
let completed;
const row = { querySelector: () => status, classList: { toggle: (_, value) => { completed = value; } } };
const input = { disabled: false, checked: true, dataset: { taskId: 't1', tripId: 'trip-1' }, closest: () => row };
let finish;
let calls = 0;
globalThis.window = { TravelTasks: { setCompleted: async (id, checked, tripId) => {
  calls++;
  assert.equal(id, 't1'); assert.equal(checked, true); assert.equal(tripId, 'trip-1');
  await new Promise(resolve => { finish = resolve; });
} } };
const save = toggleDashboardTask(input);
assert.equal(input.disabled, true);
assert.equal(status.textContent, 'Guardando…');
await toggleDashboardTask(input);
assert.equal(calls, 1, 'Duplicate changes are ignored while saving');
finish();
await save;
assert.equal(completed, true);
assert.equal(status.textContent, 'Tarea completada.');
assert.equal(input.disabled, false);
window.TravelTasks.setCompleted = async () => { throw new Error('denied'); };
await toggleDashboardTask(input);
assert.equal(input.checked, false);
assert.match(status.textContent, /No se pudo guardar/);
input.checked = true;
window.TravelTasks.setCompleted = async () => {};
window.TripsManager = { loadDashboardProgressiveContent: async () => { throw new Error('refresh failed'); } };
await toggleDashboardTask(input);
assert.equal(input.checked, true, 'Refresh failure must not roll back confirmed completion');
assert.match(status.textContent, /Tarea guardada/);
delete globalThis.window;
console.log('dashboard tasks: due dates, confirmation, failure recovery and duplicate protection ok');
