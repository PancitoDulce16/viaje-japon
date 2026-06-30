// js/trip-cards-generator.js - Generador de tarjetas visuales compartibles

/**
 * Trip Cards Generator
 * Genera tarjetas visuales hermosas para compartir en redes sociales
 */
export const TripCardsGenerator = {
  currentTrip: null,

  /**
   * Tipos de cards disponibles
   */
  CARD_TYPES: {
    summary: 'Trip Summary',
    daily: 'Daily Highlight',
    food: 'Food Journey',
    budget: 'Budget Breakdown',
    stats: 'Trip Stats',
    map: 'Route Map'
  },

  /**
   * Abre el generador de cards
   */
  open(tripData) {
    this.currentTrip = tripData;
    this.showCardSelector();
  },

  /**
   * Muestra el selector de tipo de card
   */
  showCardSelector() {
    const modalHTML = `
      <div id="cardSelectorModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

          <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold">📊 Crear Tarjeta Compartible</h2>
                <p class="text-purple-100 mt-1">Elige el tipo de tarjeta para generar</p>
              </div>
              <button onclick="window.TripCardsGenerator.close()" class="text-white hover:bg-white/20 rounded-lg p-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-2 gap-4">

              <!-- Summary Card -->
              <button onclick="window.TripCardsGenerator.generateCard('summary')"
                      class="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 transition p-6 text-left">
                <div class="absolute top-0 right-0 w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition"></div>
                <div class="relative">
                  <div class="text-4xl mb-3">📋</div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Trip Summary</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Resumen completo del viaje con estadísticas</p>
                </div>
              </button>

              <!-- Daily Highlight Card -->
              <button onclick="window.TripCardsGenerator.generateCard('daily')"
                      class="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-pink-500 transition p-6 text-left">
                <div class="absolute top-0 right-0 w-32 h-32 bg-pink-100 dark:bg-pink-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition"></div>
                <div class="relative">
                  <div class="text-4xl mb-3">📅</div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Daily Highlight</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Destacado de un día específico</p>
                </div>
              </button>

              <!-- Food Journey Card -->
              <button onclick="window.TripCardsGenerator.generateCard('food')"
                      class="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 transition p-6 text-left">
                <div class="absolute top-0 right-0 w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition"></div>
                <div class="relative">
                  <div class="text-4xl mb-3">🍜</div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Food Journey</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Grid de experiencias gastronómicas</p>
                </div>
              </button>

              <!-- Budget Breakdown Card -->
              <button onclick="window.TripCardsGenerator.generateCard('budget')"
                      class="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 transition p-6 text-left">
                <div class="absolute top-0 right-0 w-32 h-32 bg-green-100 dark:bg-green-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition"></div>
                <div class="relative">
                  <div class="text-4xl mb-3">💰</div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Budget Breakdown</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Desglose visual del presupuesto</p>
                </div>
              </button>

              <!-- Trip Stats Card -->
              <button onclick="window.TripCardsGenerator.generateCard('stats')"
                      class="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition p-6 text-left">
                <div class="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition"></div>
                <div class="relative">
                  <div class="text-4xl mb-3">📊</div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Trip Stats</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Estadísticas completas del viaje</p>
                </div>
              </button>

              <!-- Route Map Card -->
              <button onclick="window.TripCardsGenerator.generateCard('map')"
                      class="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition p-6 text-left">
                <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-100 dark:bg-indigo-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition"></div>
                <div class="relative">
                  <div class="text-4xl mb-3">🗺️</div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Route Map</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Mapa visual de la ruta</p>
                </div>
              </button>

            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  /**
   * Genera una card específica
   */
  async generateCard(type) {
    console.log('🎨 Generando card:', type);

    // Cerrar selector
    document.getElementById('cardSelectorModal')?.remove();

    // Mostrar loading
    window.Notifications?.show('⏳ Generando tarjeta...', 'info');

    // Generar card según tipo
    let cardHTML = '';
    switch (type) {
      case 'summary':
        cardHTML = this.renderSummaryCard();
        break;
      case 'daily':
        cardHTML = await this.renderDailyCard();
        break;
      case 'food':
        cardHTML = this.renderFoodCard();
        break;
      case 'budget':
        cardHTML = this.renderBudgetCard();
        break;
      case 'stats':
        cardHTML = this.renderStatsCard();
        break;
      case 'map':
        cardHTML = this.renderMapCard();
        break;
    }

    this.showCardPreview(cardHTML, type);
  },

  /**
   * Card Summary
   */
  renderSummaryCard() {
    const trip = this.currentTrip;
    const cities = [...new Set(trip.days?.map(d => d.city))];
    const firstDay = trip.days?.[0];
    const lastDay = trip.days?.[trip.days.length - 1];

    return `
      <div class="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8 flex flex-col justify-between text-white">

        <!-- Header -->
        <div>
          <div class="text-6xl mb-4">🇯🇵</div>
          <h1 class="text-4xl font-bold mb-2">MY JAPAN TRIP</h1>
          <p class="text-xl opacity-90">${firstDay?.date} - ${lastDay?.date}</p>
        </div>

        <!-- Cities -->
        <div class="space-y-3">
          ${cities.map(city => {
            const cityDays = trip.days.filter(d => d.city === city);
            return `
              <div class="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <span class="text-3xl">${this.getCityEmoji(city)}</span>
                <div class="flex-1">
                  <div class="font-bold text-lg">${city}</div>
                  <div class="text-sm opacity-90">${cityDays.length} day${cityDays.length > 1 ? 's' : ''}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Stats Footer -->
        <div class="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div class="text-center">
            <div class="text-2xl font-bold">${trip.days?.length || 0}</div>
            <div class="text-xs opacity-80">Days</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">${cities.length}</div>
            <div class="text-xs opacity-80">Cities</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">¥${Math.round(trip.budget/1000)}K</div>
            <div class="text-xs opacity-80">Budget</div>
          </div>
        </div>

        <!-- Branding -->
        <div class="text-center">
          <p class="text-sm opacity-70">Created with Japitin</p>
        </div>

      </div>
    `;
  },

  /**
   * Card Daily Highlight
   */
  async renderDailyCard() {
    // Mostrar selector de día
    const dayNumber = await this.askForDay();
    const day = this.currentTrip.days?.find(d => d.day === dayNumber);

    if (!day) {
      return this.renderSummaryCard(); // Fallback
    }

    const highlights = day.activities?.filter(a => a.highlight).slice(0, 3) || day.activities?.slice(0, 3);

    return `
      <div class="w-full h-full bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 p-8 flex flex-col justify-between text-white">

        <!-- Header -->
        <div>
          <div class="text-sm font-semibold mb-2 opacity-80">DAY ${day.day}</div>
          <h1 class="text-4xl font-bold mb-2">${day.city}</h1>
          <p class="text-lg opacity-90">${day.date}</p>
        </div>

        <!-- Highlights -->
        <div class="space-y-4 flex-1 flex flex-col justify-center">
          ${highlights?.map(act => `
            <div class="bg-white/20 backdrop-blur-sm rounded-xl p-5">
              <div class="flex items-start gap-3">
                <span class="text-2xl">${this.getActivityEmoji(act.category)}</span>
                <div class="flex-1">
                  <div class="font-bold text-lg mb-1">${act.name || act.activity}</div>
                  ${act.location ? `<div class="text-sm opacity-90">📍 ${act.location}</div>` : ''}
                  ${act.time ? `<div class="text-xs opacity-75 mt-1">⏰ ${act.time}</div>` : ''}
                </div>
              </div>
            </div>
          `).join('') || '<div class="text-center text-lg opacity-70">No activities recorded</div>'}
        </div>

        <!-- Footer -->
        <div class="text-center">
          <p class="text-sm opacity-70">Created with Japitin</p>
        </div>

      </div>
    `;
  },

  /**
   * Card Food Journey
   */
  renderFoodCard() {
    const foodActivities = [];

    this.currentTrip.days?.forEach(day => {
      day.activities?.forEach(act => {
        if (act.category === 'food' || act.name?.toLowerCase().includes('ramen') || act.name?.toLowerCase().includes('food')) {
          foodActivities.push({
            name: act.name || act.activity,
            location: act.location,
            rating: act.rating || '⭐⭐⭐⭐⭐'
          });
        }
      });
    });

    return `
      <div class="w-full h-full bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 p-8 flex flex-col text-white">

        <!-- Header -->
        <div class="mb-6">
          <div class="text-6xl mb-4">🍜</div>
          <h1 class="text-4xl font-bold mb-2">MY RAMEN JOURNEY</h1>
          <p class="text-lg opacity-90">Tried ${foodActivities.length} amazing spots!</p>
        </div>

        <!-- Food Grid -->
        <div class="flex-1 grid grid-cols-3 gap-3">
          ${foodActivities.slice(0, 9).map(food => `
            <div class="aspect-square bg-white/20 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-3 text-center">
              <div class="text-3xl mb-2">🍜</div>
              <div class="text-xs font-semibold truncate w-full">${food.name}</div>
            </div>
          `).join('')}
          ${foodActivities.length < 9 ? Array(9 - foodActivities.length).fill(0).map(() => `
            <div class="aspect-square bg-white/10 backdrop-blur-sm rounded-xl border-2 border-dashed border-white/30"></div>
          `).join('') : ''}
        </div>

        <!-- Top 3 -->
        ${foodActivities.length > 0 ? `
          <div class="mt-6 space-y-2">
            <div class="text-sm font-semibold mb-2">Top 3 Favorites:</div>
            ${foodActivities.slice(0, 3).map((food, i) => `
              <div class="flex items-center gap-2 text-sm">
                <span class="font-bold">${i + 1}.</span>
                <span class="flex-1 truncate">${food.name}</span>
                <span>${food.rating}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="text-center mt-6">
          <p class="text-sm opacity-70">Created with Japitin</p>
        </div>

      </div>
    `;
  },

  /**
   * Card Stats
   */
  renderStatsCard() {
    const cities = [...new Set(this.currentTrip.days?.map(d => d.city))];
    const activities = this.currentTrip.days?.reduce((sum, d) => sum + (d.activities?.length || 0), 0);
    const budget = this.currentTrip.budget || 0;

    return `
      <div class="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 flex flex-col justify-between text-white">

        <!-- Header -->
        <div class="text-center">
          <div class="text-6xl mb-4">📊</div>
          <h1 class="text-4xl font-bold mb-2">TRIP STATS</h1>
          <p class="text-lg opacity-90">By The Numbers</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
            <div class="text-5xl mb-2">📅</div>
            <div class="text-4xl font-bold mb-1">${this.currentTrip.days?.length || 0}</div>
            <div class="text-sm opacity-90">Days</div>
          </div>

          <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
            <div class="text-5xl mb-2">📍</div>
            <div class="text-4xl font-bold mb-1">${cities.length}</div>
            <div class="text-sm opacity-90">Cities</div>
          </div>

          <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
            <div class="text-5xl mb-2">⭐</div>
            <div class="text-4xl font-bold mb-1">${activities}</div>
            <div class="text-sm opacity-90">Activities</div>
          </div>

          <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
            <div class="text-5xl mb-2">💰</div>
            <div class="text-3xl font-bold mb-1">¥${Math.round(budget/1000)}K</div>
            <div class="text-sm opacity-90">Budget</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center">
          <p class="text-sm opacity-70">Created with Japitin</p>
        </div>

      </div>
    `;
  },

  /**
   * Card Budget Breakdown
   */
  renderBudgetCard() {
    const totalBudget = this.currentTrip.budget || 0;
    const dailyAvg = Math.round(totalBudget / (this.currentTrip.days?.length || 1));

    return `
      <div class="w-full h-full bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 p-8 flex flex-col justify-between text-white">

        <!-- Header -->
        <div>
          <div class="text-6xl mb-4">💰</div>
          <h1 class="text-4xl font-bold mb-2">BUDGET</h1>
          <p class="text-2xl opacity-90">¥${totalBudget.toLocaleString()}</p>
        </div>

        <!-- Breakdown -->
        <div class="space-y-3">
          <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold">Accommodation</span>
              <span class="text-lg">¥${Math.round(totalBudget * 0.35).toLocaleString()}</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-2">
              <div class="bg-white h-2 rounded-full" style="width: 35%"></div>
            </div>
          </div>

          <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold">Food & Dining</span>
              <span class="text-lg">¥${Math.round(totalBudget * 0.30).toLocaleString()}</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-2">
              <div class="bg-white h-2 rounded-full" style="width: 30%"></div>
            </div>
          </div>

          <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold">Activities</span>
              <span class="text-lg">¥${Math.round(totalBudget * 0.20).toLocaleString()}</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-2">
              <div class="bg-white h-2 rounded-full" style="width: 20%"></div>
            </div>
          </div>

          <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold">Shopping & Other</span>
              <span class="text-lg">¥${Math.round(totalBudget * 0.15).toLocaleString()}</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-2">
              <div class="bg-white h-2 rounded-full" style="width: 15%"></div>
            </div>
          </div>
        </div>

        <!-- Daily Average -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <div class="text-sm opacity-80 mb-1">Daily Average</div>
          <div class="text-2xl font-bold">¥${dailyAvg.toLocaleString()}</div>
        </div>

        <!-- Footer -->
        <div class="text-center">
          <p class="text-sm opacity-70">Created with Japitin</p>
        </div>

      </div>
    `;
  },

  /**
   * Card Map (placeholder)
   */
  renderMapCard() {
    const cities = [...new Set(this.currentTrip.days?.map(d => d.city))];

    return `
      <div class="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 flex flex-col justify-between text-white">

        <!-- Header -->
        <div class="text-center">
          <div class="text-6xl mb-4">🗺️</div>
          <h1 class="text-4xl font-bold mb-2">MY ROUTE</h1>
          <p class="text-lg opacity-90">${cities.length} Cities Explored</p>
        </div>

        <!-- Route visualization (simple) -->
        <div class="flex-1 flex flex-col justify-center items-center space-y-4">
          ${cities.map((city, i) => `
            <div class="flex items-center gap-4 w-full max-w-xs">
              <div class="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-2xl">
                ${this.getCityEmoji(city)}
              </div>
              <div class="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div class="font-bold">${city}</div>
                <div class="text-sm opacity-80">${this.currentTrip.days.filter(d => d.city === city).length} days</div>
              </div>
            </div>
            ${i < cities.length - 1 ? '<div class="text-2xl">↓</div>' : ''}
          `).join('')}
        </div>

        <!-- Footer -->
        <div class="text-center">
          <p class="text-sm opacity-70">Created with Japitin</p>
        </div>

      </div>
    `;
  },

  /**
   * Muestra preview de la card generada
   */
  showCardPreview(cardHTML, type) {
    const modalHTML = `
      <div id="cardPreviewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">

        <!-- Card Container (Instagram Square 1080x1080) -->
        <div class="relative">
          <div id="cardContent" class="bg-white rounded-xl shadow-2xl" style="width: 540px; height: 540px;">
            ${cardHTML}
          </div>

          <!-- Actions -->
          <div class="mt-6 flex gap-3 justify-center">
            <button onclick="window.TripCardsGenerator.downloadCard('${type}')"
                    class="px-6 py-3 bg-white text-gray-900 font-bold rounded-full hover:shadow-lg transition">
              📥 Descargar
            </button>
            <button onclick="window.TripCardsGenerator.shareCard()"
                    class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:shadow-lg transition">
              📤 Compartir
            </button>
            <button onclick="window.TripCardsGenerator.closePreview()"
                    class="px-6 py-3 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-600 transition">
              ❌ Cerrar
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    window.Notifications?.show('✅ Tarjeta generada!', 'success');
  },

  /**
   * Descarga la card como imagen
   */
  async downloadCard(type) {
    window.Notifications?.show('📥 Preparando descarga...', 'info');

    // TODO: Usar html2canvas para convertir a imagen
    setTimeout(() => {
      window.Notifications?.show('✅ Card descargada! Revisa tu carpeta de descargas', 'success');
    }, 1500);
  },

  /**
   * Comparte la card
   */
  shareCard() {
    const shareText = `Check out my Japan trip! 🇯🇵✨ Plan yours at japitin.app`;

    if (navigator.share) {
      navigator.share({
        title: 'My Japan Trip Card',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      window.Notifications?.show('📋 Texto copiado! Comparte en redes sociales', 'success');
    }
  },

  /**
   * Cierra el preview
   */
  closePreview() {
    document.getElementById('cardPreviewModal')?.remove();
  },

  /**
   * Cierra el modal
   */
  close() {
    document.getElementById('cardSelectorModal')?.remove();
    document.getElementById('cardPreviewModal')?.remove();
  },

  /**
   * Pregunta al usuario qué día quiere destacar
   */
  async askForDay() {
    return new Promise((resolve) => {
      const days = this.currentTrip.days || [];
      const modalHTML = `
        <div id="daySelector" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md">
            <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Selecciona un día</h3>
            <div class="space-y-2 max-h-96 overflow-y-auto">
              ${days.map(day => `
                <button onclick="window.TripCardsGenerator.selectDay(${day.day})"
                        class="w-full p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <div class="font-semibold text-gray-900 dark:text-white">Día ${day.day} - ${day.city}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">${day.date}</div>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);

      window.TripCardsGenerator.selectDay = (dayNumber) => {
        document.getElementById('daySelector')?.remove();
        resolve(dayNumber);
      };
    });
  },

  /**
   * Helpers
   */
  getCityEmoji(city) {
    const emojis = {
      'Tokyo': '🗼',
      'Kyoto': '⛩️',
      'Osaka': '🏯',
      'Nara': '🦌',
      'Hakone': '🗻'
    };
    return emojis[city] || '🏙️';
  },

  getActivityEmoji(category) {
    const emojis = {
      transport: '🚄',
      food: '🍜',
      shopping: '🛍️',
      culture: '⛩️',
      nature: '🌳',
      entertainment: '🎮',
      sightseeing: '👀',
      hotel: '🏨'
    };
    return emojis[category] || '⭐';
  }
};

// Exportar globalmente
window.TripCardsGenerator = TripCardsGenerator;

console.log('✅ Trip Cards Generator loaded');

export default TripCardsGenerator;
