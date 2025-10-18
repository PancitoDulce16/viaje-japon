// js/weather-widget.js - Widget de clima para ciudades de Japón

export const WeatherWidget = {
  // API Key de OpenWeatherMap (deberías usar una env variable en producción)
  // Esta es una demo key, reemplazar con una real
  API_KEY: '4c26cf1f0e104eea8e44fb84e35c92f2', // Demo key
  API_BASE: 'https://api.openweathermap.org/data/2.5',

  // Ciudades principales de Japón con coordenadas
  japanCities: {
    'Tokio': { lat: 35.6762, lon: 139.6503, name_en: 'Tokyo' },
    'Tokyo': { lat: 35.6762, lon: 139.6503, name_en: 'Tokyo' },
    'Kyoto': { lat: 35.0116, lon: 135.7681, name_en: 'Kyoto' },
    'Kioto': { lat: 35.0116, lon: 135.7681, name_en: 'Kyoto' },
    'Osaka': { lat: 34.6937, lon: 135.5023, name_en: 'Osaka' },
    'Nara': { lat: 34.6851, lon: 135.8048, name_en: 'Nara' },
    'Hiroshima': { lat: 34.3853, lon: 132.4553, name_en: 'Hiroshima' },
    'Hakone': { lat: 35.1950, lon: 139.0302, name_en: 'Hakone' },
    'Nikko': { lat: 36.7199, lon: 139.6982, name_en: 'Nikko' },
    'Kamakura': { lat: 35.3193, lon: 139.5467, name_en: 'Kamakura' },
    'Takayama': { lat: 36.1457, lon: 137.2525, name_en: 'Takayama' },
    'Kanazawa': { lat: 36.5613, lon: 136.6562, name_en: 'Kanazawa' },
    'Nagoya': { lat: 35.1815, lon: 136.9066, name_en: 'Nagoya' },
    'Sapporo': { lat: 43.0642, lon: 141.3469, name_en: 'Sapporo' },
    'Fukuoka': { lat: 33.5904, lon: 130.4017, name_en: 'Fukuoka' }
  },

  weatherCache: {},
  cacheExpiry: 30 * 60 * 1000, // 30 minutos

  // Obtener clima actual
  async getCurrentWeather(city) {
    // Verificar cache
    const cached = this.weatherCache[city];
    if (cached && (Date.now() - cached.timestamp < this.cacheExpiry)) {
      console.log('☀️ Using cached weather for', city);
      return cached.data;
    }

    const cityData = this.japanCities[city];
    if (!cityData) {
      console.warn('City not found:', city);
      return null;
    }

    try {
      const url = `${this.API_BASE}/weather?lat=${cityData.lat}&lon=${cityData.lon}&appid=${this.API_KEY}&units=metric&lang=es`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Guardar en cache
      this.weatherCache[city] = {
        data,
        timestamp: Date.now()
      };

      console.log('✅ Weather data fetched for', city);
      return data;
    } catch (error) {
      console.error('❌ Error fetching weather:', error);
      return null;
    }
  },

  // Obtener pronóstico de 5 días
  async getForecast(city) {
    const cityData = this.japanCities[city];
    if (!cityData) return null;

    try {
      const url = `${this.API_BASE}/forecast?lat=${cityData.lat}&lon=${cityData.lon}&appid=${this.API_KEY}&units=metric&lang=es`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();

      console.log('✅ Forecast data fetched for', city);
      return data;
    } catch (error) {
      console.error('❌ Error fetching forecast:', error);
      return null;
    }
  },

  // Renderizar widget de clima
  async renderWeatherWidget(cities = ['Tokyo', 'Kyoto', 'Osaka']) {
    const container = document.getElementById('weatherWidgetContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-spinner animate-spin text-3xl text-purple-500"></i>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Cargando clima...</p>
      </div>
    `;

    try {
      const weatherPromises = cities.map(city => this.getCurrentWeather(city));
      const weatherData = await Promise.all(weatherPromises);

      container.innerHTML = `
        <div class="space-y-4">
          <div class="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-6 text-center">
            <div class="text-4xl mb-2">🌤️</div>
            <h3 class="text-2xl font-bold">Clima en Japón</h3>
            <p class="text-white/80 text-sm">Actualizado hace unos momentos</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${weatherData.map((data, index) => {
              if (!data) return '';

              const city = cities[index];
              const temp = Math.round(data.main.temp);
              const feelsLike = Math.round(data.main.feels_like);
              const description = data.weather[0].description;
              const icon = data.weather[0].icon;
              const humidity = data.main.humidity;
              const windSpeed = data.wind.speed;

              return `
                <div class="weather-card bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg hover-lift">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-xl font-bold dark:text-white">${city}</h4>
                    <img
                      src="https://openweathermap.org/img/wn/${icon}@2x.png"
                      alt="${description}"
                      class="w-16 h-16"
                    />
                  </div>

                  <div class="text-center mb-4">
                    <div class="text-5xl font-bold text-blue-600 dark:text-blue-400">${temp}°C</div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Sensación: ${feelsLike}°C</p>
                    <p class="text-gray-700 dark:text-gray-300 mt-2 capitalize">${description}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center">
                      <div class="text-gray-600 dark:text-gray-400">💧 Humedad</div>
                      <div class="font-bold dark:text-white">${humidity}%</div>
                    </div>
                    <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center">
                      <div class="text-gray-600 dark:text-gray-400">💨 Viento</div>
                      <div class="font-bold dark:text-white">${windSpeed} m/s</div>
                    </div>
                  </div>

                  <button
                    onclick="WeatherWidget.showForecast('${city}')"
                    class="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Ver Pronóstico 5 Días →
                  </button>
                </div>
              `;
            }).join('')}
          </div>

          <button
            onclick="WeatherWidget.refreshWeather()"
            class="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            🔄 Actualizar Clima
          </button>
        </div>
      `;
    } catch (error) {
      console.error('Error rendering weather widget:', error);
      container.innerHTML = `
        <div class="text-center py-8">
          <div class="text-5xl mb-4">😕</div>
          <p class="text-gray-600 dark:text-gray-400">
            No se pudo cargar el clima. Intenta de nuevo.
          </p>
          <button
            onclick="WeatherWidget.refreshWeather()"
            class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            🔄 Reintentar
          </button>
        </div>
      `;
    }
  },

  // Mostrar pronóstico de 5 días
  async showForecast(city) {
    const forecastData = await this.getForecast(city);

    if (!forecastData) {
      if (window.Notifications) {
        window.Notifications.error('No se pudo cargar el pronóstico');
      }
      return;
    }

    // Agrupar por día (tomar 1 lectura por día, al mediodía)
    const dailyForecasts = [];
    const seenDates = new Set();

    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toLocaleDateString('es');

      // Tomar solo la lectura del mediodía (12:00)
      if (item.dt_txt.includes('12:00:00') && !seenDates.has(dateStr)) {
        dailyForecasts.push({
          date: dateStr,
          dateObj: date,
          temp: Math.round(item.main.temp),
          temp_min: Math.round(item.main.temp_min),
          temp_max: Math.round(item.main.temp_max),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed
        });
        seenDates.add(dateStr);
      }
    });

    // Crear modal de pronóstico
    const modalHtml = `
      <div id="forecastModal" class="modal active" style="z-index: 10000;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold dark:text-white">Pronóstico - ${city}</h2>
            <button
              onclick="WeatherWidget.closeForecastModal()"
              class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl"
            >
              ×
            </button>
          </div>

          <div class="space-y-4">
            ${dailyForecasts.map(day => `
              <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 flex items-center gap-4">
                <div class="text-center min-w-[100px]">
                  <div class="font-bold dark:text-white">${day.dateObj.toLocaleDateString('es', { weekday: 'short' })}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">${day.dateObj.toLocaleDateString('es', { day: 'numeric', month: 'short' })}</div>
                </div>

                <img
                  src="https://openweathermap.org/img/wn/${day.icon}@2x.png"
                  alt="${day.description}"
                  class="w-16 h-16"
                />

                <div class="flex-1">
                  <div class="font-bold text-2xl text-blue-600 dark:text-blue-400">${day.temp}°C</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Min: ${day.temp_min}°C • Max: ${day.temp_max}°C
                  </div>
                  <div class="text-sm capitalize text-gray-700 dark:text-gray-300 mt-1">${day.description}</div>
                </div>

                <div class="text-right text-sm text-gray-600 dark:text-gray-400">
                  <div>💧 ${day.humidity}%</div>
                  <div>💨 ${day.windSpeed} m/s</div>
                </div>
              </div>
            `).join('')}
          </div>

          <button
            onclick="WeatherWidget.closeForecastModal()"
            class="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    `;

    // Remover modal anterior si existe
    const existingModal = document.getElementById('forecastModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
  },

  // Cerrar modal de pronóstico
  closeForecastModal() {
    const modal = document.getElementById('forecastModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  },

  // Refrescar clima
  refreshWeather() {
    // Limpiar cache
    this.weatherCache = {};

    // Obtener ciudades del itinerario o usar defaults
    const cities = this.getCitiesFromItinerary() || ['Tokyo', 'Kyoto', 'Osaka'];

    this.renderWeatherWidget(cities);

    if (window.Notifications) {
      window.Notifications.success('🔄 Clima actualizado');
    }
  },

  // Obtener ciudades desde el itinerario
  getCitiesFromItinerary() {
    // Intentar extraer ciudades del trip actual
    if (window.TripsManager && window.TripsManager.currentTrip) {
      const trip = window.TripsManager.currentTrip;
      if (trip.cities && trip.cities.length > 0) {
        return trip.cities.slice(0, 6); // Máximo 6 ciudades
      }
    }

    return null;
  },

  // Widget compacto para dashboard
  async renderCompactWidget(city = 'Tokyo') {
    const weather = await this.getCurrentWeather(city);

    if (!weather) {
      return '<div class="text-gray-500">Clima no disponible</div>';
    }

    const temp = Math.round(weather.main.temp);
    const description = weather.weather[0].description;
    const icon = weather.weather[0].icon;

    return `
      <div class="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <img
          src="https://openweathermap.org/img/wn/${icon}.png"
          alt="${description}"
          class="w-12 h-12"
        />
        <div>
          <div class="font-bold text-blue-600 dark:text-blue-400 text-xl">${temp}°C</div>
          <div class="text-xs text-gray-600 dark:text-gray-400 capitalize">${description}</div>
        </div>
      </div>
    `;
  }
};

// Exportar globalmente
window.WeatherWidget = WeatherWidget;
