import assert from 'node:assert/strict';
import { convertMinorUnits, DEFAULT_BASE_CURRENCY, formatMoneyMinor, isSupportedCurrency, parseMoneyToMinor, rateToScaled, RATE_SCALE, SUPPORTED_CURRENCIES } from '../js/features/budget/money.js';
import { ExchangeRateService } from '../js/features/budget/exchange-rate-service.js';
import { checklistProgress } from '../js/features/trips/checklist-utils.js';

assert.equal(parseMoneyToMinor('5000', 'JPY'), 5000);
assert.equal(parseMoneyToMinor('125.50', 'USD'), 12550);
assert.equal(parseMoneyToMinor('64200', 'CRC'), 64200);
assert.equal(DEFAULT_BASE_CURRENCY, 'CRC');
assert.deepEqual(SUPPORTED_CURRENCIES, ['CRC', 'JPY', 'USD']);
assert.equal(isSupportedCurrency('EUR'), false);
assert.equal(parseMoneyToMinor('12.345', 'USD'), null);
assert.equal(parseMoneyToMinor('100', 'EUR'), null);
assert.equal(convertMinorUnits(5000, 'JPY', 'CRC', rateToScaled(3.4)), 17000);
assert.equal(convertMinorUnits(12550, 'USD', 'CRC', rateToScaled(510)), 64005);
assert.equal(convertMinorUnits(75000, 'CRC', 'CRC', RATE_SCALE), 75000);
assert.equal(convertMinorUnits(1, 'USD', 'CRC', rateToScaled(500)), 5);
assert.throws(() => convertMinorUnits(100, 'EUR', 'CRC', RATE_SCALE), /Moneda no admitida/);
assert.match(formatMoneyMinor(5000, 'JPY'), /5[.,\s]?000/);
assert.match(formatMoneyMinor(12550, 'USD'), /125[,.]50/);

const memory = new Map();
const storage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) };
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => ({ ok: false, status: 503 });
await assert.rejects(() => new ExchangeRateService(storage).getRate('JPY', 'CRC'), /no disponible/);
let fetchCalls = 0;
globalThis.fetch = async () => {
  fetchCalls += 1;
  return { ok: true, json: async () => ({ rates: { CRC: 3.42 } }) };
};
const service = new ExchangeRateService(storage);
const firstQuote = await service.getRate('JPY', 'CRC');
const cachedQuote = await service.getRate('JPY', 'CRC');
assert.equal(firstQuote.rate, 3.42);
assert.equal(firstQuote.rateScaled, rateToScaled(3.42));
assert.equal(cachedQuote.fetchedAt, firstQuote.fetchedAt);
assert.equal(fetchCalls, 1);
globalThis.fetch = originalFetch;

assert.deepEqual(checklistProgress([{ checked:true },{ checked:false }]), { total:2, completed:1, percent:50 });
assert.deepEqual(checklistProgress([{ completed:true },{ completed:true }], 'completed'), { total:2, completed:2, percent:100 });
console.log('✓ multi-currency: precisión, conversión, fallo API y checklists');
