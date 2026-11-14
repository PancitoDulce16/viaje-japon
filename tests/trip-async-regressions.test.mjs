import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const snapshot = name => ({ exists: () => true, data: () => ({ info: { name } }) });
const events = [], stored = new Map();
let container = { innerHTML: 'initial', isConnected: true, closest: () => ({ classList: { add() {} } }) };
const context = {
  console: { log() {}, warn() {}, error() {} }, db: {}, auth: { currentUser: null },
  window: { addEventListener() {}, dispatchEvent: event => events.push(event) },
  CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
  document: { getElementById: () => container },
  localStorage: { setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) },
  sessionStorage: { setItem() {} },
  doc: (_, ...parts) => parts.join('/'),
  renderProgressiveContent: (trip, data) => `${trip.id}:${data.label}`
};
vm.createContext(context);
const source = fs.readFileSync(new URL('../js/features/trips/trips-manager.js', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?;\r?\n/gm, '').replace('export const TripsManager', 'const TripsManager');
vm.runInContext(source, context);
const manager = context.window.TripsManager;
manager.updateTripHeader = () => {};
manager.updateTripHeaderEmpty = () => {};
manager.closeTripsListModal = () => {};

// An older selection resolving last must never replace the most recent one.
const selections = { A: deferred(), B: deferred() };
context.getDoc = path => selections[path.split('/')[1]].promise;
const firstSelection = manager.selectTrip('A');
const secondSelection = manager.selectTrip('B');
selections.B.resolve(snapshot('B'));
await secondSelection;
selections.A.resolve(snapshot('A'));
await firstSelection;
assert.equal(manager.currentTrip.id, 'B');
assert.equal(stored.get('currentTripId'), 'B');
assert.equal(events.filter(event => event.type === 'tripSelected').length, 1);

// Logout invalidates a selection whose read is still in flight.
const logoutRead = deferred();
context.getDoc = () => logoutRead.promise;
const selectionBeforeLogout = manager.selectTrip('A');
manager.cleanup(true);
logoutRead.resolve(snapshot('A'));
await selectionBeforeLogout;
assert.equal(manager.currentTrip, null);
assert.equal(stored.has('currentTripId'), false);

// Repeated refreshes of the same trip can finish in either order.
manager.currentTrip = { id: 'B' };
context.getDoc = async () => snapshot('itinerary');
const requests = [];
context.fetchDashboardData = (id, _stage, trip) => {
  assert.equal(id, trip.id);
  const request = deferred(); requests.push(request); return request.promise;
};
const older = manager.loadDashboardProgressiveContent();
await new Promise(setImmediate);
const newer = manager.loadDashboardProgressiveContent();
await new Promise(setImmediate);
requests[1].resolve({ label: 'new' });
await newer;
requests[0].resolve({ label: 'old' });
await older;
assert.equal(container.innerHTML, 'B:new');

// A late error must not erase a successful, newer result.
const failing = manager.loadDashboardProgressiveContent();
await new Promise(setImmediate);
const succeeding = manager.loadDashboardProgressiveContent();
await new Promise(setImmediate);
requests[3].resolve({ label: 'newer' });
await succeeding;
requests[2].reject(new Error('old request failed'));
await failing;
assert.equal(container.innerHTML, 'B:newer');

// A trip switch before the first read finishes must not emit old itinerary data.
const slowRead = deferred();
context.getDoc = () => slowRead.promise;
const eventCount = events.length;
const stale = manager.loadDashboardProgressiveContent();
manager.currentTrip = { id: 'C' };
slowRead.resolve(snapshot('old itinerary'));
await stale;
assert.equal(events.length, eventCount);
assert.equal(container.innerHTML, 'B:newer');

// Replaced DOM containers must never receive a late render either.
context.getDoc = async () => snapshot('itinerary');
const detached = manager.loadDashboardProgressiveContent();
await new Promise(setImmediate);
const oldContainer = container;
container = { ...container, innerHTML: 'replacement' };
requests[4].resolve({ label: 'detached' });
await detached;
assert.equal(oldContainer.innerHTML, 'B:newer');
assert.equal(container.innerHTML, 'replacement');
console.log('trip async regressions: latest selection, logout, out-of-order refreshes, stale errors and replaced containers ok');
