import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { instantiateTemplate, persistTemplateTrip, templateCatalog, shiftCalendarDate, parseCalendarDate, templateStartDate } from '../js/features/itinerary/template-library.js';

const writes = [];
const errors = [];
const context = {
  console: { log() {}, warn() {}, error() {} }, window: { addEventListener() {} },
  auth: { currentUser: null }, db: {}, crypto: webcrypto,
  instantiateTemplate, persistTemplateTrip, templateCatalog, shiftCalendarDate, parseCalendarDate, templateStartDate,
  Notifications: { success() {}, error: message => errors.push(message) },
  doc: (_db, ...parts) => parts.join('/'),
  setDoc: async (path, data) => { writes.push({ path, data }); },
  deleteDoc: async path => { writes.push({ path, deleted: true }); }
};
vm.createContext(context);
const source = fs.readFileSync(new URL('../js/features/trips/trips-manager.js', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?;\r?\n/gm, '').replace('export const TripsManager', 'const TripsManager');
vm.runInContext(source, context);
const manager = context.window.TripsManager;
manager.selectTrip = async () => {};
context.auth.currentUser = { uid: 'test-user', email: null };
const tripId = await manager.createTrip(instantiateTemplate('japan-february-2027').tripData);
assert.equal(writes.length, 2);
assert.equal(writes[0].path, `trips/${tripId}`);
assert.equal(writes[1].path, `trips/${tripId}/data/itinerary`);
assert.equal(writes[0].data.info.dateStart, '2027-02-15');
assert.equal(writes[0].data.info.dateEnd, '2027-03-06');
assert.equal(writes[0].data.accommodations.length, 4);
assert.equal(writes[1].data.days.length, 20);
assert.equal(writes[1].data.hotels['Tokyo_14-20'].name, 'APA Hotel Yamanote Otsuka Ekimae Tower');
assert.equal(writes[0].data.memberEmails.length, 0);
assert.match(manager.generateTripCode(), /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
writes.length = 0;
await assert.rejects(manager.createTrip({ name: 'Invalid', dateStart: '2027-02-30' }), /fecha/);
assert.equal(writes.length, 0, 'invalid dates must never be persisted');
await manager.createTrip({ name: 'A day trip', dateStart: '2027-02-20', dateEnd: '2027-02-20' });
assert.equal(writes.length, 1, 'single-day trips are valid without a template');
writes.length = 0;
context.setDoc = async (path, data) => {
  if (path.endsWith('/data/itinerary')) throw new Error('save failed');
  writes.push({ path, data });
};
await assert.rejects(manager.createTrip(instantiateTemplate('japan-february-2027').tripData), /No se cre/);
assert.equal(writes.length, 2);
assert.equal(writes[1].deleted, true, 'only the newly created trip is rolled back');
assert.ok(errors.length >= 2);
console.log('trip creation: template and accommodations persist together, dates validated, failures roll back');
