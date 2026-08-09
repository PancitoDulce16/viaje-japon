export const CURRENCY_DIGITS = { JPY: 0, CRC: 0, USD: 2, EUR: 2, GBP: 2, CAD: 2, AUD: 2 };
export const DEFAULT_BASE_CURRENCY = 'CRC';
export const RATE_SCALE = 100000000;

export function currencyScale(currency) { return 10 ** (CURRENCY_DIGITS[currency] ?? 2); }

export function parseMoneyToMinor(value, currency) {
  const text = String(value ?? '').trim().replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(text)) return null;
  const digits = CURRENCY_DIGITS[currency] ?? 2;
  const [whole, fraction = ''] = text.split('.');
  if (fraction.length > digits) return null;
  const minor = BigInt(whole) * BigInt(10 ** digits) + BigInt((fraction + '0'.repeat(digits)).slice(0, digits) || '0');
  return minor > 0n && minor <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(minor) : null;
}

export function rateToScaled(rate) {
  const value = Number(rate);
  return Number.isFinite(value) && value > 0 ? Math.round(value * RATE_SCALE) : null;
}

export function convertMinorUnits(originalMinor, fromCurrency, toCurrency, rateScaled) {
  if (fromCurrency === toCurrency) return originalMinor;
  const numerator = BigInt(originalMinor) * BigInt(rateScaled) * BigInt(currencyScale(toCurrency));
  const denominator = BigInt(RATE_SCALE) * BigInt(currencyScale(fromCurrency));
  return Number((numerator + denominator / 2n) / denominator);
}

export function formatMoneyMinor(amountMinor, currency, locale = 'es-CR') {
  const digits = CURRENCY_DIGITS[currency] ?? 2;
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: digits, maximumFractionDigits: digits })
    .format(Number(amountMinor || 0) / currencyScale(currency));
}

export function sumBaseMinor(expenses, baseCurrency = DEFAULT_BASE_CURRENCY) {
  return expenses.reduce((sum, item) => sum + (item.baseCurrency === baseCurrency ? Number(item.convertedAmountMinor || 0) : 0), 0);
}
