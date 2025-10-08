// js/utils.js - Con APIs reales

export const AppUtils = {
    EXCHANGE_RATE_API_KEY: 'a9b02159c01b0c7c132f1a65',
    OPENWEATHER_API_KEY: '8afa1bdee4ba3fb17c86c1edc3345148',
    exchangeRate: 143, // Fallback
    clockInterval: null,
    weatherCache: {},
    rateCache: null,
    rateCacheTime: null,

    async fetchExchangeRate() {
        // Cachear por 1 hora
        if (this.rateCache && this.rateCacheTime && (Date.now() - this.rateCacheTime < 3600000)) {
            return this.rateCache;
        }

        try {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${this.EXCHANGE_RATE_API_KEY}/latest/USD`);
            const data = await response.json();
            
            if (data.result === 'success') {
                this.exchangeRate = data.conversion_rates.JPY;
                this.rateCache = this.exchangeRate;
                this.rateCacheTime = Date.now();
                
                // Actualizar el texto del rate
                const rateText = document.querySelector('.exchange-rate-text');
                if (rateText) {
                    rateText.textContent = `1 USD = ${this.exchangeRate.toFixed(2)} JPY (actualizado)`;
                    rateText.classList.add('text-green-600', 'dark:text-green-400');
                }
                
                return this.exchangeRate;
            }
        } catch (error) {
            console.warn('Error fetching exchange rate, using fallback:', error);
        }
        
        return this.exchangeRate;
    },

    async fetchWeather(city) {
        // Cachear por 30 minutos
        const cacheKey = city.toLowerCase();
        const now = Date.now();
        
        if (this.weatherCache[cacheKey] && (now - this.weatherCache[cacheKey].timestamp < 1800000)) {
            return this.weatherCache[cacheKey].data;
        }

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city},JP&appid=${this.OPENWEATHER_API_KEY}&units=metric&lang=es`
            );
            const data = await response.json();
            
            if (data.cod === 200) {
                const weatherData = {
                    temp: Math.round(data.main.temp),
                    feels_like: Math.round(data.main.feels_like),
                    description: data.weather[0].description,
                    icon: data.weather[0].icon,
                    humidity: data.main.humidity,
                    wind: data.wind.speed
                };
                
                this.weatherCache[cacheKey] = {
                    data: weatherData,
                    timestamp: now
                };
                
                return weatherData;
            }
        } catch (error) {
            console.warn(`Error fetching weather for ${city}:`, error);
        }
        
        return null;
    },

    getWeatherEmoji(icon) {
        const iconMap = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '🌨️', '13n': '🌨️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return iconMap[icon] || '🌤️';
    },

    setupCurrencyConverter() {
        const usdInput = document.getElementById('usdInput');
        const jpyInput = document.getElementById('jpyInput');
        
        if (!usdInput || !jpyInput) return;

        // Fetch rate al cargar
        this.fetchExchangeRate().then(rate => {
            this.exchangeRate = rate;
        });

        let timeout;
        
        usdInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const usd = parseFloat(e.target.value) || 0;
                jpyInput.value = Math.round(usd * this.exchangeRate);
            }, 300);
        });

        jpyInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const jpy = parseFloat(e.target.value) || 0;
                usdInput.value = (jpy / this.exchangeRate).toFixed(2);
            }, 300);
        });

        document.querySelectorAll('.quick-convert').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseFloat(e.currentTarget.dataset.amount);
                usdInput.value = amount;
                jpyInput.value = Math.round(amount * this.exchangeRate);
            });
        });
    },

    async loadWeatherData() {
        const cities = ['Tokyo', 'Kyoto', 'Osaka'];
        const weatherContainers = {
            'Tokyo': document.getElementById('weather-tokyo'),
            'Kyoto': document.getElementById('weather-kyoto'),
            'Osaka': document.getElementById('weather-osaka')
        };

        for (const city of cities) {
            const container = weatherContainers[city];
            if (!container) continue;

            // Mostrar loading
            container.innerHTML = `
                <div class="animate-pulse">
                    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
                    <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                </div>
            `;

            const weather = await this.fetchWeather(city);
            
            if (weather) {
                const emoji = this.getWeatherEmoji(weather.icon);
                container.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold dark:text-white">${city}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                ${weather.temp}°C (sensación: ${weather.feels_like}°C)
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-500 capitalize">
                                ${weather.description}
                            </p>
                        </div>
                        <span class="text-3xl">${emoji}</span>
                    </div>
                    <div class="mt-2 flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>💧 ${weather.humidity}%</span>
                        <span>💨 ${weather.wind.toFixed(1)} m/s</span>
                    </div>
                `;
            } else {
                // Fallback con datos estimados
                const temps = { 'Tokyo': '5-12°C', 'Kyoto': '4-10°C', 'Osaka': '5-11°C' };
                const emojis = { 'Tokyo': '🌤️', 'Kyoto': '⛅', 'Osaka': '🌥️' };
                container.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold dark:text-white">${city}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${temps[city]} (Febrero promedio)</p>
                        </div>
                        <span class="text-3xl">${emojis[city]}</span>
                    </div>
                `;
            }
        }
    },

    startClocks() {
        this.updateClocks();
        
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        this.clockInterval = setInterval(() => this.updateClocks(), 1000);
    },

    updateClocks() {
        const now = new Date();
        
        const crTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
        const crTimeStr = crTime.toLocaleTimeString('es-CR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
        
        const jpTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
        const jpTimeStr = jpTime.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
        
        const crElem = document.getElementById('crTime');
        const jpElem = document.getElementById('jpTime');
        
        if (crElem) crElem.textContent = crTimeStr;
        if (jpElem) jpElem.textContent = jpTimeStr;
    }
};
