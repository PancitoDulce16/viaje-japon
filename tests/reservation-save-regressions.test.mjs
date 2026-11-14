import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { currencyScale, parseMoneyToMinor, SUPPORTED_CURRENCIES } from '../js/features/budget/money.js';
import { groupReservations, maskConfirmation, RESERVATION_STATES, RESERVATION_TYPES, validateReservation } from '../js/features/reservations/reservation-utils.js';

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const notices = [], writes = [], records = new Map();
let modal = { removed: false, remove() { this.removed = true; } };
const errorHost = { hidden: true, textContent: '' }, submit = { disabled: false, focus() {} };
const form = { dataset: { tripId: 'A' }, values: { title: 'Ryokan', type: 'Hospedaje', status: 'Confirmada', currency: 'JPY', cost: '1000', startAt: '2027-02-21T15:00', createExpense: 'on' }, querySelector: selector => selector === '[data-error]' ? errorHost : submit, querySelectorAll: () => [], closest: () => modal };
let addOperation = deferred();
const context = {
  console: { error() {} }, db: {}, auth: { currentUser: { uid: 'user' } },
  window: { addEventListener() {}, dispatchEvent() {}, TripsManager: { currentTrip: { id: 'A' } }, Notifications: { success: text => notices.push({ type: 'success', text }), error: text => notices.push({ type: 'error', text }) }, BudgetTracker: { createExpenseForReservation: async () => { throw new Error('rate service unavailable'); } } },
  document: { getElementById: id => id === 'reservationModal' ? modal : null },
  localStorage: { getItem: () => null },
  FormData: class { constructor(form) { this.values = form.values; } get(key) { return this.values[key] ?? ''; } has(key) { return key in this.values; } },
  currencyScale, parseMoneyToMinor, SUPPORTED_CURRENCIES, groupReservations, maskConfirmation, RESERVATION_STATES, RESERVATION_TYPES, validateReservation,
  doc: (_, path) => path, collection: (_, path) => path, serverTimestamp: () => 1,
  addDoc: async (path, data) => { writes.push({ path, data, add: true }); const result = await addOperation.promise; records.set(`${path}/${result.id}`, data); return result; },
  updateDoc: async (path, data) => { writes.push({ path, data }); records.set(path, { ...records.get(path), ...data }); },
  getDoc: async path => ({ exists: () => records.has(path), data: () => records.get(path) }),
  confirm: () => true, alert() {}
};
vm.createContext(context);
const source = fs.readFileSync(new URL('../js/features/trips/reservations-manager.js', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?;\r?\n/gm, '').replace('export const ReservationsManager', 'const ReservationsManager');
vm.runInContext(source, context);
const manager = context.window.ReservationsManager;
manager.currentTrip = 'A';
const event = { preventDefault() {}, currentTarget: form };

const first = manager.save(event);
await manager.save(event);
assert.equal(writes.length, 1);
assert.equal(submit.disabled, true);
addOperation.reject(new Error('offline')); await first;
assert.equal(submit.disabled, false);
assert.equal(modal.removed, false);
assert.match(errorHost.textContent, /Tus datos siguen/);

addOperation = deferred();
const partial = manager.save(event);
addOperation.resolve({ id: 'r1' }); await partial;
assert.equal(form.dataset.reservationId, 'r1');
assert.equal(modal.removed, false);
assert.match(errorHost.textContent, /reserva se guardó/);
// Another window adds documents and links an expense while this form is open.
const path = 'trips/A/reservations/r1';
records.set(path, { ...records.get(path), documentCount: 3, expenseId: 'linked-elsewhere' });
let expenseCalls = 0;
context.window.BudgetTracker.createExpenseForReservation = async () => { expenseCalls++; };
await manager.save(event);
assert.equal(writes.filter(write => write.add).length, 2, 'Retry must update the saved reservation');
assert.equal(records.get(path).documentCount, 3);
assert.equal(records.get(path).expenseId, 'linked-elsewhere');
assert.equal(expenseCalls, 0, 'An existing expense must not be created twice');
assert.equal(modal.removed, true);

modal = { removed: false, remove() { this.removed = true; } };
context.window.TripsManager.currentTrip = { id: 'B' }; manager.currentTrip = 'B';
const before = writes.length;
await manager.save(event);
assert.equal(writes.length, before, 'A stale form must never write into a different trip');
assert.match(errorHost.textContent, /viaje actual/);

context.window.TripsManager.currentTrip = { id: 'A' }; manager.currentTrip = 'A';
form.values.cost = 'bad-cost';
await manager.save(event);
assert.equal(writes.length, before, 'Invalid monetary input is handled before writing');
assert.equal(submit.disabled, false);
form.values.cost = '1000';

const removal = deferred(); let deleteCalls = 0;
context.deleteDoc = () => { deleteCalls++; return removal.promise; };
manager.reservations = [{ id: 'r1', title: 'Ryokan', documentCount: 0 }];
const deleting = manager.remove('r1'); await manager.remove('r1');
assert.equal(deleteCalls, 1);
removal.reject(new Error('denied')); await deleting;
assert.equal(notices.at(-1).type, 'error');
assert.equal(manager.reservations.length, 1);

// A late details read must not open an old trip's editor.
const lateRead = deferred(); context.getDoc = () => lateRead.promise;
let opened = 0; manager.showReservationModal = () => { opened++; };
const opening = manager.openReservation('r1');
context.window.TripsManager.currentTrip = { id: 'B' }; manager.currentTrip = 'B';
lateRead.resolve({ exists: () => true, id: 'r1', data: () => ({ title: 'Old trip' }) }); await opening;
assert.equal(opened, 0);
assert.equal(manager.currentTrip, 'B');

// Initialization must not leave listeners from a previous trip behind.
const migrations = { A: deferred(), B: deferred() }, subscriptions = [];
manager.migrateLegacy = trip => migrations[trip].promise;
manager.loadItinerary = async () => [];
context.query = value => value; context.orderBy = () => {};
context.onSnapshot = path => { subscriptions.push(path); return () => {}; };
const initA = manager.init('A'), initB = manager.init('B');
migrations.B.resolve(); await initB;
migrations.A.resolve(); await initA;
assert.deepEqual(subscriptions, ['trips/B/reservations']);
assert.equal(manager.currentTrip, 'B');

const valid = { title: 'Test', type: 'Actividad', status: 'Pendiente', startAt: '2027-02-21T10:00' };
assert.ok(validateReservation({ ...valid, startAt: '2027-02-30T10:00' }).length);
assert.ok(validateReservation({ ...valid, endAt: 'not-a-date' }).length);
assert.ok(validateReservation({ ...valid, type: 'Restaurante', details: { partySize: 1.5 } }).length);
console.log('reservation regressions: duplicate submits, retryable expense linking, managed fields, stale forms/loads, failed deletes and invalid dates ok');
