import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const notices = [], writes = [];
const submit = { disabled: false };
const form = { dataset: { tripId: 'A' }, values: { title: 'Comprar pase', category: 'Transporte', priority: 'Alta' }, querySelector: () => submit };
let operation = deferred();
const context = {
  window: { TripsManager: { currentTrip: { id: 'A' }, loadDashboardProgressiveContent: async () => {} } },
  document: { getElementById: id => id === 'travelTaskForm' ? form : null },
  auth: { currentUser: { uid: 'user' } }, db: {},
  localStorage: { getItem: () => null },
  FormData: class { constructor(form) { this.values = form.values; } get(key) { return this.values[key] || ''; } },
  serverTimestamp: () => 123, collection: (_, path) => path, doc: (_, path) => path,
  addDoc: (path, data) => { writes.push({ path, data }); return operation.promise; },
  updateDoc: async () => { throw new Error('denied'); },
  deleteDoc: async () => { throw new Error('denied'); },
  confirm: () => true
};
vm.createContext(context);
const source = fs.readFileSync(new URL('../js/features/trips/travel-tasks.js', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?;\r?\n/gm, '').replaceAll('export const ', 'const ');
vm.runInContext(source, context);
const tasks = context.window.TravelTasks;
tasks.notify = (type, text) => notices.push({ type, text });
tasks.editingId = 'new';
let renders = 0;
tasks.renderForm = () => { renders++; };
const event = { preventDefault() {}, currentTarget: form };
const first = tasks.save(event);
await tasks.save(event);
assert.equal(writes.length, 1, 'Double submit must not create duplicate tasks');
assert.equal(submit.disabled, true);
operation.reject(new Error('offline'));
await first;
assert.equal(submit.disabled, false);
assert.equal(tasks.editingId, 'new');
assert.equal(form.values.title, 'Comprar pase');
assert.equal(renders, 0, 'Failed saves preserve the form');
assert.equal(notices.at(-1).type, 'error');

operation = deferred();
const retry = tasks.save(event);
operation.resolve();
await retry;
assert.equal(writes.length, 2);
assert.equal(tasks.editingId, null);
assert.equal(notices.at(-1).type, 'success');

operation = deferred();
const saveBeforeSwitch = tasks.save(event);
context.window.TripsManager.currentTrip = { id: 'B' };
const previousNotices = notices.length, previousRenders = renders;
operation.resolve();
await saveBeforeSwitch;
assert.equal(writes.at(-1).path, 'trips/A/tasks');
assert.equal(notices.length, previousNotices);
assert.equal(renders, previousRenders, 'A completed old save must not reset a new trip form');
await tasks.save(event);
assert.equal(writes.length, 3, 'Stale forms cannot write to the newly selected trip');

context.window.TripsManager.currentTrip = { id: 'A' };
const input = { checked: true, disabled: false, dataset: { toggle: 'task-1', tripId: 'A' } };
await tasks.toggle(input);
assert.equal(input.checked, false);
assert.equal(input.disabled, false);
assert.equal(notices.at(-1).type, 'error');
await tasks.remove('task-1');
assert.equal(notices.at(-1).type, 'error');
console.log('task save regressions: duplicate prevention, preserved form, retry, trip changes and failed checkbox/delete writes ok');
