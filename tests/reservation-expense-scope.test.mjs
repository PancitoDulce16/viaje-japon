import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { convertMinorUnits, RATE_SCALE } from '../js/features/budget/money.js';

let finishRate, activeTrip = 'A';
const writes = [];
const context = {
  db: {}, auth: { currentUser: { uid: 'original-user' } }, convertMinorUnits,
  doc: (base, ...parts) => parts.length ? parts.join('/') : `${base}/expense-1`, collection: (_, path) => path,
  exchangeRateService: { getRate: () => new Promise(resolve => { finishRate = resolve; }) },
  serverTimestamp: () => 1,
  runTransaction: async (_, work) => work({
    get: async () => ({ exists: () => true, data: () => ({}) }),
    set: (path, data) => writes.push({ path, data }), update() {}
  })
};
vm.createContext(context);
const source = fs.readFileSync(new URL('../js/features/budget/budget-tracker.js', import.meta.url), 'utf8');
const start = source.indexOf('  async createExpenseForReservation('), end = source.indexOf('\n  notify(', start);
vm.runInContext(`globalThis.budget = {${source.slice(start, end)}};`, context);
const budget = context.budget;
budget.baseCurrency = 'CRC';
budget.getCurrentTripId = () => activeTrip;
const saving = budget.createExpenseForReservation({ id: 'r1', tripId: 'A', title: 'Hotel', costMinor: 100, currency: 'JPY', startAt: '2027-02-21T15:00' });
activeTrip = 'B'; budget.baseCurrency = 'USD'; context.auth.currentUser = { uid: 'different-user' };
finishRate({ rateScaled: RATE_SCALE * 3, rate: 3, fetchedAt: '2026-11-13T12:00:00Z', source: 'test' });
await saving;
assert.equal(writes[0].path, 'trips/A/expenses/expense-1');
assert.equal(writes[0].data.baseCurrency, 'CRC');
assert.equal(writes[0].data.createdBy, 'original-user');
assert.equal(writes[0].data.convertedAmountMinor, 300);
await assert.rejects(budget.createExpenseForReservation({ id: 'r1', tripId: 'A', costMinor: 100 }), /viaje activo cambió/);
console.log('reservation expense scope: trip, currency and author remain bound to the original request');
