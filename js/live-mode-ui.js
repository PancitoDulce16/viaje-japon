/**
 * 📍 LIVE MODE UI
 * ================
 *
 * Interactive interface for live mode
 */

class LiveModeUI {
  constructor() {
    this.liveMode = window.LiveMode;
    this.isActive = false;
  }

  /**
   * Activate live mode
   */
  async activate() {
    // Request location permission
    try {
      await this.liveMode.init();
      this.isActive = true;
      this.showLiveDashboard();
    } catch (error) {
      this.showLocationError(error);
    }
  }

  /**
   * Show live dashboard
   */
  showLiveDashboard() {
    const modal = this.createModal();

    const recommendations = this.liveMode.getNearbyRecommendations();
    const emergencyContacts = this.liveMode.getEmergencyContacts();
    const quickPhrases = this.liveMode.getQuickPhrases();
    const businessHours = this.liveMode.isDuringBusinessHours();

    modal.innerHTML = `
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold">📍 Estás en Japón - Modo Live</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              ${this.liveMode.isInJapan ? '🇯🇵 Ubicación detectada en Japón' : '🌍 Simulando ubicación en Japón'}
            </p>
          </div>
          <button class="close-modal text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Location Info -->
        ${this.renderLocationInfo(recommendations.area)}

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button class="quick-action-btn bg-red-50 dark:bg-red-900/20 border-2 border-red-200" onclick="window.LiveModeUI.showEmergency()">
            <i class="fas fa-phone-alt text-2xl text-red-600 mb-2"></i>
            <span class="font-semibold">Emergencia</span>
          </button>
          <button class="quick-action-btn bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200" onclick="window.LiveModeUI.showNearbyServices()">
            <i class="fas fa-map-marker-alt text-2xl text-blue-600 mb-2"></i>
            <span class="font-semibold">Cerca de Mí</span>
          </button>
          <button class="quick-action-btn bg-green-50 dark:bg-green-900/20 border-2 border-green-200" onclick="window.LiveModeUI.showQuickPhrases()">
            <i class="fas fa-language text-2xl text-green-600 mb-2"></i>
            <span class="font-semibold">Frases Útiles</span>
          </button>
          <button class="quick-action-btn bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200" onclick="window.LiveModeUI.showTransport()">
            <i class="fas fa-train text-2xl text-purple-600 mb-2"></i>
            <span class="font-semibold">Transporte</span>
          </button>
        </div>

        <!-- Nearby Restaurants -->
        ${this.renderNearbyRestaurants(recommendations.restaurants)}

        <!-- Nearby Attractions -->
        ${this.renderNearbyAttractions(recommendations.attractions)}

        <!-- Local Tips -->
        ${this.renderLocalTips(recommendations.tips)}

        <!-- Business Hours Status -->
        ${this.renderBusinessHours(businessHours)}
      </div>

      <style>
        .quick-action-btn {
          padding: 1.5rem 1rem;
          border-radius: 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quick-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      </style>
    `;

    // Add close handler
    modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
  }

  /**
   * Render location info
   */
  renderLocationInfo(area) {
    return `
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-bold mb-2">📍 ${area}</h3>
            <p class="text-gray-600 dark:text-gray-400">
              ${this.liveMode.currentLocation ?
                `Lat: ${this.liveMode.currentLocation.lat.toFixed(4)}, Lng: ${this.liveMode.currentLocation.lng.toFixed(4)}` :
                'Obteniendo ubicación...'}
            </p>
          </div>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onclick="window.LiveMode.getCurrentPosition()">
            <i class="fas fa-sync mr-2"></i>
            Actualizar
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render nearby restaurants
   */
  renderNearbyRestaurants(restaurants) {
    if (!restaurants || restaurants.length === 0) {
      return '';
    }

    return `
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-4">🍜 Restaurantes Cerca</h3>
        <div class="grid md:grid-cols-3 gap-4">
          ${restaurants.map(restaurant => `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-bold">${restaurant.name}</h4>
                <span class="text-yellow-500">★ ${restaurant.rating}</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${restaurant.type}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm text-blue-600">📍 ${restaurant.distance}</span>
                <button class="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200" onclick="alert('Opening maps...')">
                  Cómo llegar
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render nearby attractions
   */
  renderNearbyAttractions(attractions) {
    if (!attractions || attractions.length === 0) {
      return '';
    }

    return `
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-4">🎯 Atracciones Cerca</h3>
        <div class="grid md:grid-cols-3 gap-4">
          ${attractions.map(attraction => `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 class="font-bold mb-2">${attraction.name}</h4>
              <div class="flex items-center justify-between">
                <span class="text-sm text-purple-600">${attraction.type}</span>
                <span class="text-sm text-gray-600">📍 ${attraction.distance}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render local tips
   */
  renderLocalTips(tips) {
    if (!tips || tips.length === 0) {
      return '';
    }

    return `
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-4">💡 Tips Locales</h3>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-2 border-yellow-200">
          <ul class="space-y-2">
            ${tips.map(tip => `
              <li class="flex items-start gap-2">
                <span class="text-yellow-600 mt-1">💡</span>
                <span>${tip}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Render business hours status
   */
  renderBusinessHours(hours) {
    return `
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-4">⏰ Horarios Actuales</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="text-center p-3 rounded-lg ${hours.restaurants ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}">
            <div class="text-2xl mb-1">🍽️</div>
            <div class="text-sm font-semibold">Restaurantes</div>
            <div class="text-xs ${hours.restaurants ? 'text-green-600' : 'text-red-600'}">
              ${hours.restaurants ? 'Abierto' : 'Cerrado'}
            </div>
          </div>
          <div class="text-center p-3 rounded-lg ${hours.shops ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}">
            <div class="text-2xl mb-1">🛍️</div>
            <div class="text-sm font-semibold">Tiendas</div>
            <div class="text-xs ${hours.shops ? 'text-green-600' : 'text-red-600'}">
              ${hours.shops ? 'Abierto' : 'Cerrado'}
            </div>
          </div>
          <div class="text-center p-3 rounded-lg ${hours.temples ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}">
            <div class="text-2xl mb-1">⛩️</div>
            <div class="text-sm font-semibold">Templos</div>
            <div class="text-xs ${hours.temples ? 'text-green-600' : 'text-red-600'}">
              ${hours.temples ? 'Abierto' : 'Cerrado'}
            </div>
          </div>
          <div class="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div class="text-2xl mb-1">🏪</div>
            <div class="text-sm font-semibold">Konbini</div>
            <div class="text-xs text-green-600">24/7</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Show emergency contacts
   */
  showEmergency() {
    const contacts = this.liveMode.getEmergencyContacts();

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-2xl font-bold mb-4 text-red-600">🚨 Contactos de Emergencia</h3>
        <div class="space-y-4">
          ${Object.entries(contacts).map(([key, contact]) => `
            <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-bold text-lg">${contact.number}</h4>
                <a href="tel:${contact.number}" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <i class="fas fa-phone mr-2"></i>
                  Llamar
                </a>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">${contact.description}</p>
            </div>
          `).join('')}
        </div>
        <button class="w-full mt-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold" onclick="this.closest('.fixed').remove()">
          Cerrar
        </button>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Show nearby services
   */
  showNearbyServices() {
    const services = this.liveMode.getNearbyServices();

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <h3 class="text-2xl font-bold mb-4">🗺️ Servicios Cerca de Ti</h3>
        <div class="space-y-3">
          ${services.map(service => `
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="text-2xl">${this.getServiceIcon(service.type)}</div>
                <div>
                  <h4 class="font-bold">${service.name}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">${service.type}</p>
                  ${service.open24h ? '<span class="text-xs text-green-600">24 horas</span>' : ''}
                  ${service.foreignCards ? '<span class="text-xs text-blue-600">Acepta tarjetas extranjeras</span>' : ''}
                </div>
              </div>
              <span class="text-sm text-blue-600">📍 ${service.distance}</span>
            </div>
          `).join('')}
        </div>
        <button class="w-full mt-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold" onclick="this.closest('.fixed').remove()">
          Cerrar
        </button>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Show quick phrases
   */
  showQuickPhrases() {
    const phrases = this.liveMode.getQuickPhrases();

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h3 class="text-2xl font-bold mb-4">🗣️ Frases Útiles</h3>
        <div class="space-y-3">
          ${phrases.map(phrase => `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="text-2xl font-bold mb-2">${phrase.japanese}</div>
              <div class="text-lg text-purple-600 mb-1">${phrase.romaji}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">${phrase.english}</div>
              <button class="mt-2 text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full" onclick="alert('🔊 Pronunciando...')">
                <i class="fas fa-volume-up mr-1"></i>
                Escuchar
              </button>
            </div>
          `).join('')}
        </div>
        <button class="w-full mt-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold" onclick="this.closest('.fixed').remove()">
          Cerrar
        </button>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Show transport info
   */
  showTransport() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-2xl font-bold mb-4">🚄 Transporte</h3>
        <div class="space-y-3">
          <button class="w-full p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left hover:bg-blue-100" onclick="alert('Abriendo Google Maps...')">
            <i class="fas fa-train text-blue-600 mr-3"></i>
            <span class="font-semibold">Estación más cercana</span>
          </button>
          <button class="w-full p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-left hover:bg-green-100" onclick="alert('Abriendo app de taxis...')">
            <i class="fas fa-taxi text-green-600 mr-3"></i>
            <span class="font-semibold">Llamar taxi</span>
          </button>
          <button class="w-full p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-left hover:bg-purple-100" onclick="alert('Mostrando rutas...')">
            <i class="fas fa-bus text-purple-600 mr-3"></i>
            <span class="font-semibold">Rutas de bus</span>
          </button>
          <button class="w-full p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-left hover:bg-orange-100" onclick="alert('Abriendo Hyperdia...')">
            <i class="fas fa-route text-orange-600 mr-3"></i>
            <span class="font-semibold">Planificador de rutas</span>
          </button>
        </div>
        <button class="w-full mt-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold" onclick="this.closest('.fixed').remove()">
          Cerrar
        </button>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Show location error
   */
  showLocationError(error) {
    alert(`No se pudo obtener tu ubicación:\n${error.message}\n\nPor favor, activa el GPS y permite el acceso a la ubicación.`);
  }

  /**
   * Get service icon
   */
  getServiceIcon(type) {
    const icons = {
      'Konbini': '🏪',
      'ATM': '🏧',
      'Pharmacy': '💊',
      'Police': '👮',
      'Hospital': '🏥'
    };
    return icons[type] || '📍';
  }

  /**
   * Create modal
   */
  createModal() {
    const existing = document.getElementById('live-mode-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'live-mode-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto';
    modal.innerHTML = '<div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl my-8"></div>';

    document.body.appendChild(modal);
    return modal.firstElementChild;
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById('live-mode-modal');
    if (modal) modal.remove();
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.LiveModeUI = new LiveModeUI();

  // Add button listener
  document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-live-mode');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        window.LiveModeUI.activate();
      });
    }
  });

  console.log('📍 Live Mode UI loaded!');
}
