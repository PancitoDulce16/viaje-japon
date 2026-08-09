import assert from 'node:assert/strict';
import { convertMinorUnits, formatMoneyMinor, parseMoneyToMinor, rateToScaled, RATE_SCALE } from '../js/features/budget/money.js';
import { ExchangeRateService } from '../js/features/budget/exchange-rate-service.js';
import { checklistProgress } from '../js/features/trips/checklist-utils.js';

assert.equal(parseMoneyToMinor('5000', 'JPY'), 5000);
assert.equal(parseMoneyToMinor('125.50', 'USD'), 12550);
assert.equal(parseMoneyToMinor('64200', 'CRC'), 64200);
assert.equal(convertMinorUnits(5000, 'JPY', 'CRC', rateToScaled(3.4)), 17000);
assert.equal(convertMinorUnits(12550, 'USD', 'CRC', rateToScaled(510)), 64005);
assert.equal(convertMinorUnits(75000, 'CRC', 'CRC', RATE_SCALE), 75000);
assert.match(formatMoneyMinor(5000, 'JPY'), /5[.,\s]?000/);
assert.match(formatMoneyMinor(12550, 'USD'), /125[,.]50/);

const memory = new Map();
const storage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) };
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => ({ ok: false, status: 503 });
await assert.rejects(() => new ExchangeRateService(storage).getRate('JPY', 'CRC'), /no disponible/);
globalThis.fetch = originalFetch;

assert.deepEqual(checklistProgress([{ checked:true },{ checked:false }]), { total:2, completed:1, percent:50 });
assert.deepEqual(checklistProgress([{ completed:true },{ completed:true }], 'completed'), { total:2, completed:2, percent:100 });
console.log('✓ multi-currency: precisión, conversión, fallo API y checklists');
