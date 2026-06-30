/**
 * ⛅ INTEGRACIÓN DE CLIMA EN TIEMPO REAL (#6)
 * ============================================
 *
 * Integración con OpenWeatherMap API para mostrar clima
 * y ajustar automáticamente el itinerario según condiciones.
 *
 * Características:
 * - Pronóstico de clima para fechas del viaje
 * - Alertas automáticas de lluvia/calor
 * - Auto-ajuste de actividades según clima
 * - Recomendaciones de vestimenta
 * - Usa API gratuita de OpenWeatherMap
 *
 * API Key: Configurar en apis-config.js
 */

class WeatherIntegration {
  constructor(apiKey = null) {
    // Intentar cargar API key desde config
    this.apiKey = apiKey || window.OPENWEATHER_API_KEY || null;
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.cache = new Map();
    this.cacheDuration = 30 * 60 * 1000; // 30 minutos

    // Ciudades principales de Japón
    this.cities = {
      'tokyo': { lat: 35.6762, lon: 139.6503 },
      'kyoto': { lat: 35.0116, lon: 135.7681 },
      'osaka': { lat: 34.6937, lon: 135.5023 },
      'hiroshima': { lat: 34.3853, lon: 132.4553 },
      'fukuoka': { lat: 33.5904, lon: 130.4017 },
      'sapporo': { lat: 43.0642, lon: 141.3469 },
      'nara': { lat: 34.6851, lon: 135.8050 },
      'nagoya': { lat: 35.1815, lon: 136.9066 },
      'yokohama': { lat: 35.4437, lon: 139.6380 }
    };
  }

  /**
   * 🌤️ Obtiene pronóstico de clima para una ciudad
   * @param {string} city - Nombre de la ciudad
   * @param {string} date - Fecha en formato ISO (opcional)
   * @returns {Promise<Object>} Datos del clima
   */
  async getWeatherForecast(city, date = null) {
    if (!this.apiKey) {
      console.warn('⚠️ API Key de OpenWeatherMap no configurada');
      return this.getMockWeather(city, date);
    }

    const cityName = city.toLowerCase();
    const cacheKey = `${cityName}-${date || 'current'}`;

    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        console.log('☁️ Usando clima desde cache');
        return cached.data;
      }
    }

    try {
      let url;

      if (this.cities[cityName]) {
        const { lat, lon } = this.cities[cityName];

        if (date) {
          // Pronóstico a 5 días
          url = `${this.baseURL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`;
        } else {
          // Clima actual
          url = `${this.baseURL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`;
        }
      } else {
        // Buscar por nombre de ciudad
        if (date) {
          url = `${this.baseURL}/forecast?q=${city},JP&appid=${this.apiKey}&units=metric&lang=es`;
        } else {
          url = `${this.baseURL}/weather?q=${city},JP&appid=${this.apiKey}&units=metric&lang=es`;
        }
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      const weatherData = this.parseWeatherData(data, date);

      // Guardar en cache
      this.cache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (error) {
      console.error('Error obteniendo clima:', error);
      return this.getMockWeather(city, date);
    }
  }

  /**
   * 📊 Parsea datos de la API
   */
  parseWeatherData(data, targetDate = null) {
    if (data.list) {
      // Es un forecast (múltiples días)
      if (targetDate) {
        // Buscar pronóstico específico para la fecha
        const target = new Date(targetDate);
        const forecast = data.list.find(item => {
          const itemDate = new Date(item.dt * 1000);
          return itemDate.toDateString() === target.toDateString();
        });

        if (forecast) {
          return this.formatWeatherItem(forecast);
        }
      }

      // Retornar primeros días del forecast
      return {
        city: data.city?.name || 'Unknown',
        forecast: data.list.slice(0, 8).map(item => this.formatWeatherItem(item))
      };
    } else {
      // Es clima actual
      return this.formatWeatherItem(data);
    }
  }

  /**
   * 🌡️ Formatea un item de clima
   */
  formatWeatherItem(item) {
    const weather = item.weather?.[0] || {};
    const main = item.main || {};

    return {
      temp: Math.round(main.temp),
      feelsLike: Math.round(main.feels_like),
      tempMin: Math.round(main.temp_min),
      tempMax: Math.round(main.temp_max),
      humidity: main.humidity,
      description: weather.description || 'Unknown',
      main: weather.main || 'Unknown',
      icon: weather.icon || '01d',
      rain: item.rain?.['3h'] || 0,
      rainProbability: (item.pop || 0) * 100, // Probability of precipitation
      wind: item.wind?.speed || 0,
      clouds: item.clouds?.all || 0,
      date: item.dt ? new Date(item.dt * 1000).toISOString() : new Date().toISOString(),
      isRainy: (item.pop || 0) > 0.6 || (item.rain?.['3h'] || 0) > 0,
      isHot: (main.temp || 0) > 30,
      isCold: (main.temp || 0) < 10
    };
  }

  /**
   * 🎭 Genera clima mock para testing (cuando no hay API key)
   */
  getMockWeather(city, date = null) {
    const baseTemp = 20 + Math.random() * 10;
    const isRainy = Math.random() > 0.7;

    return {
      temp: Math.round(baseTemp),
      feelsLike: Math.round(baseTemp - 2),
      tempMin: Math.round(baseTemp - 3),
      tempMax: Math.round(baseTemp + 3),
      humidity: 60 + Math.random() * 30,
      description: isRainy ? 'lluvia ligera' : 'parcialmente nublado',
      main: isRainy ? 'Rain' : 'Clouds',
      icon: isRainy ? '10d' : '02d',
      rain: isRainy ? 2.5 : 0,
      rainProbability: isRainy ? 80 : 20,
      wind: 3 + Math.random() * 5,
      clouds: 40 + Math.random() * 40,
      date: date || new Date().toISOString(),
      isRainy,
      isHot: baseTemp > 30,
      isCold: baseTemp < 10,
      isMock: true
    };
  }

  /**
   * 🔔 Genera alertas basadas en el clima
   * @param {Object} weather - Datos del clima
   * @returns {Array} Lista de alertas
   */
  generateAlerts(weather) {
    const alerts = [];

    if (weather.isRainy) {
      alerts.push({
        type: 'warning',
        icon: '🌧️',
        title: 'Lluvia pronosticada',
        message: `${Math.round(weather.rainProbability)}% probabilidad de lluvia`,
        recommendation: 'Lleva paraguas y considera actividades bajo techo'
      });
    }

    if (weather.isHot) {
      alerts.push({
        type: 'warning',
        icon: '🌡️',
        title: 'Día caluroso',
        message: `Temperatura máxima: ${weather.tempMax}°C`,
        recommendation: 'Mantente hidratado, usa protector solar y busca lugares con aire acondicionado'
      });
    }

    if (weather.isCold) {
      alerts.push({
        type: 'info',
        icon: '🥶',
        title: 'Día frío',
        message: `Temperatura mínima: ${weather.tempMin}°C`,
        recommendation: 'Lleva abrigo y ropa térmica'
      });
    }

    if (weather.wind > 10) {
      alerts.push({
        type: 'info',
        icon: '💨',
        title: 'Viento fuerte',
        message: `Velocidad del viento: ${Math.round(weather.wind)} km/h`,
        recommendation: 'Ten cuidado con paraguas, pueden volarse'
      });
    }

    return alerts;
  }

  /**
   * 🔧 Sugiere ajustes al itinerario según clima
   * @param {Object} day - Día del itinerario
   * @param {Object} weather - Clima del día
   * @returns {Object} Sugerencias de ajuste
   */
  suggestItineraryAdjustments(day, weather) {
    const adjustments = {
      prioritize: [],
      avoid: [],
      modifications: [],
      tips: []
    };

    if (weather.isRainy) {
      adjustments.prioritize = [
        'museum',
        'shopping',
        'arcade',
        'aquarium',
        'indoor-entertainment',
        'covered-market'
      ];

      adjustments.avoid = [
        'park',
        'garden',
        'outdoor-market',
        'hiking',
        'beach',
        'open-air-shrine'
      ];

      adjustments.tips.push('🌂 Lleva paraguas');
      adjustments.tips.push('🚇 Usa más transporte cubierto');

      // Sugerir modificaciones específicas
      day.activities?.forEach(activity => {
        if (adjustments.avoid.includes(activity.category)) {
          adjustments.modifications.push({
            original: activity.name,
            suggestion: `Considera reemplazar "${activity.name}" por una actividad bajo techo`
          });
        }
      });
    }

    if (weather.isHot) {
      adjustments.prioritize = [
        'aquarium',
        'museum',
        'shopping',
        'indoor-activities'
      ];

      adjustments.avoid = [
        'hiking',
        'long-outdoor-walks'
      ];

      adjustments.tips.push('💧 Lleva botella de agua');
      adjustments.tips.push('🧴 Usa protector solar');
      adjustments.tips.push('☕ Toma descansos frecuentes en cafés con AC');
    }

    if (weather.isCold) {
      adjustments.tips.push('🧥 Lleva abrigo');
      adjustments.tips.push('☕ Considera más paradas en cafés para calentarte');
    }

    return adjustments;
  }

  /**
   * 👔 Recomienda vestimenta según clima
   * @param {Object} weather - Datos del clima
   * @returns {Array} Lista de recomendaciones
   */
  recommendClothing(weather) {
    const recommendations = [];

    // Temperatura
    if (weather.temp > 28) {
      recommendations.push('👕 Ropa ligera y transpirable');
      recommendations.push('🧢 Gorra o sombrero');
      recommendations.push('🕶️ Lentes de sol');
    } else if (weather.temp > 20) {
      recommendations.push('👕 Ropa casual y cómoda');
      recommendations.push('🧥 Chaqueta ligera para la noche');
    } else if (weather.temp > 15) {
      recommendations.push('🧥 Suéter o chaqueta');
      recommendations.push('👖 Pantalones largos');
    } else {
      recommendations.push('🧥 Abrigo o chamarra');
      recommendations.push('🧣 Bufanda');
      recommendations.push('🧤 Guantes (opcional)');
    }

    // Lluvia
    if (weather.isRainy) {
      recommendations.push('🌂 Paraguas resistente');
      recommendations.push('👞 Zapatos impermeables');
    }

    // Siempre
    recommendations.push('👟 Zapatos cómodos para caminar');

    return recommendations;
  }

  /**
   * 🎨 Obtiene emoji según condición climática
   */
  getWeatherEmoji(weather) {
    if (weather.isRainy) return '🌧️';
    if (weather.main === 'Clear') return '☀️';
    if (weather.main === 'Clouds') return '☁️';
    if (weather.main === 'Snow') return '❄️';
    if (weather.main === 'Thunderstorm') return '⛈️';
    if (weather.main === 'Drizzle') return '🌦️';
    if (weather.main === 'Mist' || weather.main === 'Fog') return '🌫️';
    return '🌤️';
  }

  /**
   * 📱 Renderiza widget de clima en HTML
   * @param {string} containerId - ID del contenedor
   * @param {Object} weather - Datos del clima
   * @param {string} city - Nombre de la ciudad
   */
  renderWeatherWidget(containerId, weather, city) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const emoji = this.getWeatherEmoji(weather);
    const alerts = this.generateAlerts(weather);
    const clothing = this.recommendClothing(weather);

    let html = `
      <div class="weather-widget p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-2xl font-bold">${city}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">${weather.description}</p>
          </div>
          <div class="text-6xl">${emoji}</div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center">
            <div class="text-4xl font-bold">${weather.temp}°C</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Temperatura</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold">${weather.tempMin}° / ${weather.tempMax}°</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Min / Max</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 mb-4 text-sm">
          <div>💧 ${weather.humidity}%</div>
          <div>💨 ${Math.round(weather.wind)} km/h</div>
          <div>☁️ ${weather.clouds}%</div>
        </div>
    `;

    // Alertas
    if (alerts.length > 0) {
      html += '<div class="alerts mt-4 space-y-2">';
      alerts.forEach(alert => {
        html += `
          <div class="alert p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500">
            <div class="flex items-start">
              <span class="text-2xl mr-2">${alert.icon}</span>
              <div>
                <div class="font-semibold">${alert.title}</div>
                <div class="text-sm">${alert.message}</div>
                <div class="text-xs mt-1 text-gray-600 dark:text-gray-300">${alert.recommendation}</div>
              </div>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    // Recomendaciones de vestimenta
    html += `
        <div class="clothing-recommendations mt-4">
          <h4 class="font-semibold mb-2">Qué llevar:</h4>
          <ul class="text-sm space-y-1">
            ${clothing.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}

// 🌐 Exportar para uso global
if (typeof window !== 'undefined') {
  window.WeatherIntegration = WeatherIntegration;
}
