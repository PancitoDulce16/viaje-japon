import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { packingProgress } from '../js/features/dashboard/dashboard-summary.js';

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const notices = [], writes = [], batches = [];
let operation = deferred();
const button = { disabled: false, focus() {} }, form = { dataset: { tripId: 'A' }, values: { name: 'Camiseta', category: 'Ropa', quantity: '2' }, querySelector: () => button, querySelectorAll: () => [] };
const modal = { dataset: { tripId: 'A' } };
const context = {
  auth: { currentUser: { uid: 'user' } }, db: {}, packingProgress,
  window: { TripsManager: { currentTrip: { id: 'A' } }, Notifications: { error: message => notices.push(message), success: message => notices.push(message) } },
  document: { getElementById: id => id === 'packingListModal' ? modal : id === 'packingFormHost' ? { querySelector: () => form } : null },
  localStorage: { getItem: () => null },
  FormData: class { constructor(form) { this.values = form.values; } get(key) { return this.values[key] || ''; } },
  collection: (_, path) => path, doc: (_, ...parts) => parts.join('/'), serverTimestamp: () => 1,
  addDoc: (path, data) => { writes.push({ path, data }); return operation.promise; },
  updateDoc: async () => { throw new Error('offline'); }, deleteDoc: async () => { throw new Error('offline'); },
  writeBatch: () => { const batch = []; return { update: (path, data) => batch.push({ path, data }), commit: async () => { batches.push(batch); } }; },
  confirm: () => true
};
vm.createContext(context);
const source = fs.readFileSync(new URL('../js/features/trips/packing-list.js', import.meta.url), 'utf8').replace(/^import[\s\S]*?;\r?\n/gm, '').replaceAll('export const ', 'const ');
vm.runInContext(source, context);
const packing = context.window.PackingList;
packing.renderForm = () => {};
packing.editingId = 'new';
const event = { preventDefault() {}, currentTarget: form };
const saving = packing.save(event);
await packing.save(event);
assert.equal(writes.length, 1);
assert.equal(button.disabled, true);
operation.reject(new Error('offline')); await saving;
assert.equal(button.disabled, false);
assert.equal(form.values.name, 'Camiseta');
assert.equal(packing.editingId, 'new');
assert.match(notices.at(-1), /Tus datos siguen/);
operation = deferred();
const retry = packing.save(event); operation.resolve(); await retry;
assert.equal(packing.editingId, null);

form.values.quantity = '1.5'; const before = writes.length;
await packing.save(event); assert.equal(writes.length, before);
form.values.quantity = '2';
context.window.TripsManager.currentTrip = { id: 'B' };
await packing.save(event); assert.equal(writes.length, before);
context.window.TripsManager.currentTrip = { id: 'A' };

packing.items = [
  { id: 'mine', name: 'Camiseta', category: 'Ropa', assignee: 'Ana', packed: false },
  { id: 'someone-else', name: 'Abrigo', category: 'Ropa', assignee: 'Luis', packed: false },
  { id: 'already-done', name: 'Zapatos', category: 'Ropa', assignee: 'Ana', packed: true }
];
packing.filters = { assignee: 'Ana', category: '', status: 'pending' };
await packing.toggleCategory('Ropa', true);
assert.equal(batches[0].length, 1, 'Bulk actions must not change hidden people or packed items');
assert.equal(batches[0][0].path, 'trips/A/packingItems/mine');
const input = { checked: true, disabled: false, dataset: { toggle: 'mine', tripId: 'A' } };
await packing.toggle(input);
assert.equal(input.checked, false);
assert.equal(input.disabled, false);
await packing.remove('mine');
assert.match(notices.at(-1), /No se pudo eliminar/);

// Each Firestore batch stays bounded even for an imported list.
packing.filters = { assignee: '', category: '', status: '' };
packing.items = Array.from({ length: 501 }, (_, index) => ({ id: String(index), category: 'Ropa' }));
await packing.toggleCategory('Ropa', true);
assert.equal(batches.at(-2).length, 500);
assert.equal(batches.at(-1).length, 1);

const migrations = { A: deferred(), B: deferred() }, subscriptions = [];
packing.migrateLegacy = trip => migrations[trip].promise;
context.query = value => value; context.orderBy = () => null;
context.onSnapshot = path => { subscriptions.push(path); return () => {}; };
packing.closeModal = () => {};
const syncA = packing.initSync();
context.window.TripsManager.currentTrip = { id: 'B' };
const syncB = packing.initSync();
migrations.B.resolve(); await syncB; migrations.A.resolve(); await syncA;
assert.deepEqual(subscriptions, ['trips/B/packingItems']);
console.log('packing regressions: scoped saves, retry, integer quantities, visible-only bulk actions, batch limits and stale subscriptions ok');
