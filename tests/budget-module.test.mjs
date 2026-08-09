import assert from 'node:assert/strict';
import { expenseAmount, expensesToCsv, filterExpenses, historicalConversionForEdit, summarizeBudget, toMinorUnits } from '../js/features/budget/budget-utils.js';

assert.equal(toMinorUnits('12.34', 100), 1234, 'convierte moneda a unidad mínima');
assert.equal(toMinorUnits('-1', 100), null, 'rechaza montos negativos');
assert.equal(expenseAmount({ amountMinor: 450 }), 450, 'prioriza amountMinor');
assert.equal(expenseAmount({ amount: 300 }), 300, 'mantiene compatibilidad histórica');

const expenses = [
  { amountMinor: 500, convertedAmountMinor: 1700, originalCurrency: 'JPY', baseCurrency: 'CRC', date: '2026-08-01', category: 'Transporte', description: 'Tren' },
  { amountMinor: 750, convertedAmountMinor: 750, originalCurrency: 'CRC', baseCurrency: 'CRC', date: '2026-08-03', category: 'Alimentación', description: 'Ramen' }
];

assert.deepEqual(summarizeBudget(expenses, 3000), {
  budgetMinor: 3000,
  spentMinor: 2450,
  availableMinor: 550,
  percentUsed: 2450 / 30
});
assert.equal(filterExpenses(expenses, { from: '2026-08-02', category: 'Alimentación' }).length, 1);
assert.equal(filterExpenses(expenses, { currency: 'JPY' }).length, 1);
assert.match(expensesToCsv(expenses), /"Ramen"/);
assert.match(expensesToCsv(expenses), /"1700","CRC"/, 'exporta monto convertido y moneda base');
assert.match(expensesToCsv([{ description: 'Comida "especial"' }]), /"Comida ""especial"""/);

const historical = { amountMinor: 500, convertedAmountMinor: 1710, originalCurrency: 'JPY', baseCurrency: 'CRC', exchangeRate: 3.42, exchangeRateScaled: 342000000, exchangeRateFetchedAt: '2026-08-01T12:00:00.000Z', exchangeRateSource: 'ExchangeRate-API', conversionManual: false };
assert.equal(historicalConversionForEdit(historical, { amountMinor: 500, originalCurrency: 'JPY', baseCurrency: 'CRC' }).convertedAmountMinor, 1710);
assert.equal(historicalConversionForEdit(historical, { amountMinor: 600, originalCurrency: 'JPY', baseCurrency: 'CRC' }), null);
assert.equal(historicalConversionForEdit(historical, { amountMinor: 500, originalCurrency: 'JPY', baseCurrency: 'CRC', manualRate: '3.50' }), null);

console.log('✓ budget-module: conversiones, totales, filtros y CSV');
