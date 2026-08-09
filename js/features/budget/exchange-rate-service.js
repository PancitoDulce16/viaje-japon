import { RATE_SCALE, rateToScaled } from './money.js';

const CACHE_MS = 60 * 60 * 1000;
const API_ROOT = 'https://api.exchangerate-api.com/v4/latest';

export class ExchangeRateService {
  constructor(storage = globalThis.localStorage) { this.storage = storage; }
  cacheKey(from) { return `japitin_exchange_rates_${from}`; }
  readCache(from) {
    try {
      const value = JSON.parse(this.storage?.getItem(this.cacheKey(from)) || 'null');
      return value && Date.now() - value.fetchedAt < CACHE_MS ? value : null;
    } catch { return null; }
  }
  async getRate(from, to, { force = false } = {}) {
    if (from === to) return { rateScaled: RATE_SCALE, rate: 1, fetchedAt: Date.now(), source: 'same-currency', automatic: true };
    let payload = !force && this.readCache(from);
    if (!payload) {
      const response = await fetch(`${API_ROOT}/${encodeURIComponent(from)}`);
      if (!response.ok) throw new Error(`Servicio de cambio no disponible (${response.status})`);
      const data = await response.json();
      payload = { rates: data.rates, fetchedAt: Date.now(), source: 'ExchangeRate-API' };
      this.storage?.setItem(this.cacheKey(from), JSON.stringify(payload));
    }
    const rate = payload.rates?.[to];
    const rateScaled = rateToScaled(rate);
    if (!rateScaled) throw new Error(`No existe conversión de ${from} a ${to}`);
    return { rate, rateScaled, fetchedAt: payload.fetchedAt, source: payload.source, automatic: true };
  }
}

export const exchangeRateService = new ExchangeRateService();
