import assert from 'node:assert/strict';
import { expenseAmount, expensesToCsv, filterExpenses, summarizeBudget, toMinorUnits } from '../js/features/budget/budget-utils.js';

assert.equal(toMinorUnits('12.34', 100), 1234, 'convierte moneda a unidad mínima');
assert.equal(toMinorUnits('-1', 100), null, 'rechaza montos negativos');
assert.equal(expenseAmount({ amountMinor: 450 }), 450, 'prioriza amountMinor');
assert.equal(expenseAmount({ amount: 300 }), 300, 'mantiene compatibilidad histórica');

const expenses = [
  { amountMinor: 500, date: '2026-08-01', category: 'Transporte', description: 'Tren' },
  { amountMinor: 750, date: '2026-08-03', category: 'Alimentación', description: 'Ramen' }
];
assert.deepEqual(summarizeBudget(expenses, 2000), { budgetMinor: 2000, spentMinor: 1250, availableMinor: 750, percentUsed: 62.5 });
assert.equal(filterExpenses(expenses, { from: '2026-08-02', category: 'Alimentación' }).length, 1);
assert.match(expensesToCsv(expenses), /"Ramen"/);
assert.match(expensesToCsv([{ description: 'Comida "especial"' }]), /"Comida ""especial"""/);

console.log('✓ budget-module: conversiones, totales, filtros y CSV');
