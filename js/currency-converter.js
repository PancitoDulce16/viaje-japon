/**
 * 💱 CURRENCY CONVERTER
 * =====================
 *
 * Sistema de conversión de monedas usando API real de Exchange Rate
 * Con fallback a tasas hardcoded si la API falla
 * Cache de 1 hora para optimizar requests
 */

class CurrencyConverter {
  constructor() {
    this.API_KEY = 'YOUR_API_KEY_HERE'; // Usuario puede agregar su propia key
    this.API_URL = 'https://api.exchangerate-api.com/v4/latest/JPY';
    this.CACHE_KEY = 'currency_rates_cache';
    this.CACHE_DURATION = 60 * 60 * 1000; // 1 hora

    // Tasas de fallback (actualizadas dic 2024)
    this.fallbackRates = {
      JPY: 1,
      USD: 0.0067,
      EUR: 0.0062,
      MXN: 0.13,
      CRC: 3.40, // Colón costarricense
      CAD: 0.0094,
      GBP: 0.0053,
      AUD: 0.0103,
      BRL: 0.033,
      CLP: 6.30,
      COP: 26.50,
      ARS: 5.50,
      PEN: 0.025,
      UYU: 0.26,
      CNY: 0.048,
      KRW: 8.80,
      INR: 0.56,
      THB: 0.23,
      SGD: 0.0090,
      MYR: 0.030,
      PHP: 0.38,
      VND: 170,
      IDR: 106,
      TWD: 0.21,
      HKD: 0.052,
      CHF: 0.0059,
      NOK: 0.072,
      SEK: 0.071,
      DKK: 0.046,
      PLN: 0.027,
      CZK: 0.15,
      HUF: 2.40,
      RON: 0.031,
      TRY: 0.23,
      ZAR: 0.12,
      EGP: 0.33,
      MAD: 0.066,
      KES: 0.86,
      NGN: 10.50,
      SAR: 0.025,
      AED: 0.025,
      ILS: 0.024,
      RUB: 0.67,
      NZD: 0.011
    };

    this.rates = null;
    this.lastUpdate = null;

    console.log('💱 Currency Converter initialized');
  }

  /**
   * 🔄 Obtiene tasas actualizadas (cache o API)
   */
  async getRates() {
    // Intentar cargar del cache
    const cached = this.loadFromCache();
    if (cached) {
      this.rates = cached.rates;
      this.lastUpdate = cached.timestamp;
      return this.rates;
    }

    // Intentar API
    try {
      const response = await fetch(this.API_URL);
      if (response.ok) {
        const data = await response.json();
        this.rates = data.rates;
        this.lastUpdate = Date.now();

        // Guardar en cache
        this.saveToCache(this.rates, this.lastUpdate);

        console.log('✅ Exchange rates loaded from API');
        return this.rates;
      }
    } catch (error) {
      console.warn('⚠️ API failed, using fallback rates:', error);
    }

    // Fallback
    this.rates = this.fallbackRates;
    this.lastUpdate = Date.now();
    return this.rates;
  }

  /**
   * 💾 Guardar en cache
   */
  saveToCache(rates, timestamp) {
    try {
      const cacheData = {
        rates,
        timestamp,
        version: '1.0'
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Error saving cache:', e);
    }
  }

  /**
   * 📂 Cargar del cache
   */
  loadFromCache() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const age = Date.now() - data.timestamp;

      if (age < this.CACHE_DURATION) {
        console.log('✅ Using cached exchange rates');
        return data;
      }

      console.log('⚠️ Cache expired');
      return null;
    } catch (e) {
      console.warn('Error loading cache:', e);
      return null;
    }
  }

  /**
   * 💱 Convertir de JPY a otra moneda
   */
  async convert(amount, fromCurrency = 'JPY', toCurrency = 'USD') {
    if (fromCurrency === toCurrency) return amount;

    // Asegurar que tenemos las tasas
    if (!this.rates) {
      await this.getRates();
    }

    // Si ambas monedas tienen tasas directas desde JPY
    if (fromCurrency === 'JPY' && this.rates[toCurrency]) {
      return amount * this.rates[toCurrency];
    }

    // Convertir vía JPY (JPY como base)
    if (this.rates[fromCurrency] && this.rates[toCurrency]) {
      const inJPY = amount / this.rates[fromCurrency];
      return inJPY * this.rates[toCurrency];
    }

    console.warn(`No rate found for ${fromCurrency} to ${toCurrency}`);
    return amount;
  }

  /**
   * 💰 Formatear moneda con símbolo
   */
  async formatCurrency(amount, fromCurrency = 'JPY', toCurrency = 'USD', round = true) {
    let converted = await this.convert(amount, fromCurrency, toCurrency);

    if (round) {
      converted = Math.round(converted);
    } else {
      converted = Math.round(converted * 100) / 100;
    }

    // Formatear según locale y moneda
    const locale = this.getCurrencyLocale(toCurrency);

    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: toCurrency,
        minimumFractionDigits: round ? 0 : 2,
        maximumFractionDigits: round ? 0 : 2
      });

      return formatter.format(converted);
    } catch (e) {
      // Fallback si no se puede formatear
      return `${this.getCurrencySymbol(toCurrency)}${converted.toLocaleString()}`;
    }
  }

  /**
   * 🌍 Obtener locale para moneda
   */
  getCurrencyLocale(currency) {
    const locales = {
      USD: 'en-US',
      EUR: 'de-DE',
      MXN: 'es-MX',
      CRC: 'es-CR',
      JPY: 'ja-JP',
      CAD: 'en-CA',
      GBP: 'en-GB',
      AUD: 'en-AU',
      BRL: 'pt-BR',
      CLP: 'es-CL',
      COP: 'es-CO',
      ARS: 'es-AR',
      PEN: 'es-PE',
      UYU: 'es-UY',
      CNY: 'zh-CN',
      KRW: 'ko-KR',
      INR: 'en-IN',
      THB: 'th-TH',
      SGD: 'en-SG',
      PHP: 'en-PH',
      TWD: 'zh-TW',
      HKD: 'zh-HK',
      CHF: 'de-CH',
      NOK: 'nb-NO',
      SEK: 'sv-SE',
      DKK: 'da-DK',
      PLN: 'pl-PL',
      CZK: 'cs-CZ',
      RUB: 'ru-RU',
      NZD: 'en-NZ'
    };

    return locales[currency] || 'en-US';
  }

  /**
   * 💲 Obtener símbolo de moneda
   */
  getCurrencySymbol(currency) {
    const symbols = {
      USD: '$',
      EUR: '€',
      MXN: '$',
      CRC: '₡',
      JPY: '¥',
      CAD: 'C$',
      GBP: '£',
      AUD: 'A$',
      BRL: 'R$',
      CLP: '$',
      COP: '$',
      ARS: '$',
      PEN: 'S/',
      UYU: '$U',
      CNY: '¥',
      KRW: '₩',
      INR: '₹',
      THB: '฿',
      SGD: 'S$',
      PHP: '₱',
      TWD: 'NT$',
      HKD: 'HK$',
      CHF: 'CHF',
      NOK: 'kr',
      SEK: 'kr',
      DKK: 'kr',
      PLN: 'zł',
      CZK: 'Kč',
      RUB: '₽',
      NZD: 'NZ$'
    };

    return symbols[currency] || currency + ' ';
  }

  /**
   * 📊 Obtener info completa de una moneda
   */
  getCurrencyInfo(currency) {
    const info = {
      USD: { name: 'US Dollar', country: 'United States', flag: '🇺🇸' },
      EUR: { name: 'Euro', country: 'European Union', flag: '🇪🇺' },
      MXN: { name: 'Mexican Peso', country: 'Mexico', flag: '🇲🇽' },
      CRC: { name: 'Costa Rican Colón', country: 'Costa Rica', flag: '🇨🇷' },
      JPY: { name: 'Japanese Yen', country: 'Japan', flag: '🇯🇵' },
      CAD: { name: 'Canadian Dollar', country: 'Canada', flag: '🇨🇦' },
      GBP: { name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧' },
      AUD: { name: 'Australian Dollar', country: 'Australia', flag: '🇦🇺' },
      BRL: { name: 'Brazilian Real', country: 'Brazil', flag: '🇧🇷' },
      CLP: { name: 'Chilean Peso', country: 'Chile', flag: '🇨🇱' },
      COP: { name: 'Colombian Peso', country: 'Colombia', flag: '🇨🇴' },
      ARS: { name: 'Argentine Peso', country: 'Argentina', flag: '🇦🇷' },
      PEN: { name: 'Peruvian Sol', country: 'Peru', flag: '🇵🇪' },
      UYU: { name: 'Uruguayan Peso', country: 'Uruguay', flag: '🇺🇾' },
      CNY: { name: 'Chinese Yuan', country: 'China', flag: '🇨🇳' },
      KRW: { name: 'South Korean Won', country: 'South Korea', flag: '🇰🇷' },
      INR: { name: 'Indian Rupee', country: 'India', flag: '🇮🇳' },
      THB: { name: 'Thai Baht', country: 'Thailand', flag: '🇹🇭' },
      SGD: { name: 'Singapore Dollar', country: 'Singapore', flag: '🇸🇬' },
      PHP: { name: 'Philippine Peso', country: 'Philippines', flag: '🇵🇭' },
      TWD: { name: 'Taiwan Dollar', country: 'Taiwan', flag: '🇹🇼' },
      HKD: { name: 'Hong Kong Dollar', country: 'Hong Kong', flag: '🇭🇰' },
      CHF: { name: 'Swiss Franc', country: 'Switzerland', flag: '🇨🇭' },
      NOK: { name: 'Norwegian Krone', country: 'Norway', flag: '🇳🇴' },
      SEK: { name: 'Swedish Krona', country: 'Sweden', flag: '🇸🇪' },
      DKK: { name: 'Danish Krone', country: 'Denmark', flag: '🇩🇰' },
      PLN: { name: 'Polish Złoty', country: 'Poland', flag: '🇵🇱' },
      CZK: { name: 'Czech Koruna', country: 'Czech Republic', flag: '🇨🇿' },
      RUB: { name: 'Russian Ruble', country: 'Russia', flag: '🇷🇺' },
      NZD: { name: 'New Zealand Dollar', country: 'New Zealand', flag: '🇳🇿' }
    };

    return info[currency] || { name: currency, country: 'Unknown', flag: '🌍' };
  }

  /**
   * 🔄 Forzar actualización de tasas
   */
  async forceUpdate() {
    localStorage.removeItem(this.CACHE_KEY);
    this.rates = null;
    return await this.getRates();
  }

  /**
   * 📊 Obtener estadísticas del cache
   */
  getCacheStatus() {
    const cached = this.loadFromCache();
    if (!cached) {
      return {
        isCached: false,
        age: 0,
        source: 'none'
      };
    }

    const age = Date.now() - cached.timestamp;
    const ageMinutes = Math.floor(age / (60 * 1000));

    return {
      isCached: true,
      age: ageMinutes,
      ageFormatted: ageMinutes < 60 ? `${ageMinutes} min` : `${Math.floor(ageMinutes / 60)} h`,
      source: 'cache',
      expiresIn: Math.max(0, 60 - ageMinutes) + ' min'
    };
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.CurrencyConverter = new CurrencyConverter();

  // Precargar tasas al iniciar
  window.addEventListener('DOMContentLoaded', () => {
    window.CurrencyConverter.getRates().catch(e => {
      console.warn('Could not preload rates:', e);
    });
  });
}

export default CurrencyConverter;
