export function toMinorUnits(value, minorUnit = 1) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round((number + Number.EPSILON) * minorUnit);
}

export function expenseAmount(expense) {
  const value = expense?.amountMinor ?? expense?.amount ?? 0;
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0;
}

export function summarizeBudget(expenses, budgetMinor = 0) {
  const spentMinor = expenses.reduce((total, expense) => total + Number(expense.convertedAmountMinor ?? expenseAmount(expense)), 0);
  const availableMinor = budgetMinor - spentMinor;
  const percentUsed = budgetMinor > 0 ? (spentMinor / budgetMinor) * 100 : 0;
  return { budgetMinor, spentMinor, availableMinor, percentUsed };
}

export function filterExpenses(expenses, filters = {}) {
  return expenses.filter((expense) => {
    const date = String(expense.date || '').slice(0, 10);
    return (!filters.from || date >= filters.from) && (!filters.to || date <= filters.to) &&
      (!filters.category || expense.category === filters.category) &&
      (!filters.currency || (expense.originalCurrency || expense.currency) === filters.currency);
  });
}

function csvCell(value) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }

export function expensesToCsv(expenses, currency = 'JPY') {
  const rows = [['Fecha', 'Concepto', 'Categoría', 'Comercio/Proveedor', 'Monto original (minor)', 'Moneda original',
    'Tipo de cambio', 'Monto convertido (minor)', 'Moneda base', 'Fecha conversión', 'Fuente', 'Manual', 'Notas', 'Creado por']];
  expenses.forEach((item) => rows.push([item.date, item.description || item.desc, item.category, item.vendor,
    expenseAmount(item), item.originalCurrency || item.currency || currency, item.exchangeRate,
    item.convertedAmountMinor ?? expenseAmount(item), item.baseCurrency || currency, item.exchangeRateFetchedAt,
    item.exchangeRateSource, item.conversionManual ? 'Sí' : 'No', item.notes, item.createdByEmail || item.addedBy]));
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}
