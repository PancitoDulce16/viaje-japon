/**
 * 🎨 GEO OPTIMIZER UI
 * ===================
 *
 * Visual interface for geographic optimizations
 */

class GeoOptimizerUI {
  constructor() {
    this.optimizer = window.GeoOptimizer;
    this.currentOptimization = null;
  }

  /**
   * Show optimization button in itinerary
   */
  addOptimizeButton(container) {
    const button = document.createElement('button');
    button.className = 'btn btn-primary flex items-center gap-2';
    button.innerHTML = `
      <i class="fas fa-route"></i>
      <span>🗺️ Optimizar Ruta</span>
    `;

    button.addEventListener('click', () => this.runOptimization());

    container.appendChild(button);
  }

  /**
   * Run optimization and show results
   */
  async runOptimization() {
    // Get current itinerary
    const itinerary = this.getCurrentItinerary();

    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
      alert('No hay itinerario para optimizar');
      return;
    }

    // Show loading
    this.showLoading();

    // Run optimization
    try {
      const optimized = this.optimizer.optimizeItinerary(itinerary);
      this.currentOptimization = optimized;

      // Show results
      this.showResults(optimized);

      // Track event
      if (window.Analytics) {
        window.Analytics.trackEvent('Geo', 'optimization_run', 'success');
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Error al optimizar: ' + error.message);

      if (window.Analytics) {
        window.Analytics.trackError(error, { context: 'geo_optimization' });
      }
    }
  }

  /**
   * Get current itinerary from app
   */
  getCurrentItinerary() {
    // This would integrate with your existing itinerary manager
    // For now, mock data
    if (window.ItineraryManager && window.ItineraryManager.getCurrentItinerary) {
      return window.ItineraryManager.getCurrentItinerary();
    }

    // Fallback to mock
    return this.getMockItinerary();
  }

  /**
   * Mock itinerary for testing
   */
  getMockItinerary() {
    return {
      days: [
        {
          date: '2024-03-15',
          activities: [
            {
              name: 'Senso-ji Temple',
              category: 'temple',
              location: { lat: 35.7148, lng: 139.7967 }
            },
            {
              name: 'Shibuya Crossing',
              category: 'attraction',
              location: { lat: 35.6595, lng: 139.7004 }
            },
            {
              name: 'Tokyo Skytree',
              category: 'attraction',
              location: { lat: 35.7101, lng: 139.8107 }
            },
            {
              name: 'Meiji Jingu',
              category: 'temple',
              location: { lat: 35.6764, lng: 139.6993 }
            }
          ]
        }
      ]
    };
  }

  /**
   * Show loading state
   */
  showLoading() {
    const modal = this.createModal();
    modal.innerHTML = `
      <div class="text-center py-8">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p class="text-lg">🗺️ Optimizando tu ruta...</p>
        <p class="text-sm text-gray-500 mt-2">Analizando zonas, calculando distancias...</p>
      </div>
    `;
  }

  /**
   * Show optimization results
   */
  showResults(optimization) {
    const modal = this.createModal();

    modal.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">🗺️ Optimización Geográfica</h2>
          <button class="close-modal text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-green-600">${optimization.stats.timeSaved}min</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Tiempo Ahorrado</div>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-blue-600">${optimization.stats.distanceSaved}km</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Distancia Ahorrada</div>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-purple-600">${optimization.improvements.length}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Mejoras Sugeridas</div>
          </div>
        </div>

        <!-- Improvements List -->
        <div class="mb-6">
          <h3 class="text-xl font-bold mb-3">💡 Mejoras Detectadas</h3>
          <div class="space-y-3">
            ${this.renderImprovements(optimization.improvements)}
          </div>
        </div>

        <!-- Day-by-day optimization -->
        <div class="mb-6">
          <h3 class="text-xl font-bold mb-3">📅 Optimización por Día</h3>
          <div class="space-y-4">
            ${optimization.days.map((day, index) => this.renderDayOptimization(day, index)).join('')}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button class="btn btn-primary flex-1" onclick="window.GeoOptimizerUI.applyOptimization()">
            <i class="fas fa-check mr-2"></i>
            Aplicar Optimización
          </button>
          <button class="btn btn-secondary" onclick="window.GeoOptimizerUI.closeModal()">
            Cancelar
          </button>
        </div>
      </div>
    `;

    // Add close handler
    modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
  }

  /**
   * Render improvements list
   */
  renderImprovements(improvements) {
    if (improvements.length === 0) {
      return '<p class="text-gray-500">¡Tu ruta ya está muy bien optimizada! 🎉</p>';
    }

    return improvements.map(imp => {
      const severityColors = {
        high: 'bg-red-50 border-red-200 dark:bg-red-900/20',
        medium: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20',
        low: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20'
      };

      const severityIcons = {
        high: '🔴',
        medium: '🟡',
        low: '🔵'
      };

      const color = severityColors[imp.severity] || severityColors.low;
      const icon = severityIcons[imp.severity] || '💡';

      return `
        <div class="border rounded-lg p-4 ${color}">
          <div class="flex items-start gap-3">
            <div class="text-2xl">${icon}</div>
            <div class="flex-1">
              <p class="font-semibold mb-1">${imp.message}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">${imp.suggestion || imp.reason}</p>
              ${imp.timeSaved ? `<p class="text-sm text-green-600 mt-1">⏱️ Ahorra ~${imp.timeSaved} minutos</p>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render day optimization
   */
  renderDayOptimization(day, index) {
    return `
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-bold">Día ${index + 1}</h4>
          <div class="text-sm text-gray-600">
            <span class="text-green-600">-${day.stats.timeSaved}min</span>
            <span class="mx-2">|</span>
            <span class="text-blue-600">-${day.stats.distanceSaved}km</span>
          </div>
        </div>

        <!-- Clusters -->
        ${Object.keys(day.clusters || {}).length > 0 ? `
          <div class="mb-3">
            <p class="text-sm font-semibold mb-2">📍 Zonas visitadas:</p>
            <div class="flex flex-wrap gap-2">
              ${Object.entries(day.clusters).map(([zone, activities]) => `
                <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm">
                  ${zone.split('-')[1]} (${activities.length})
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Optimized route -->
        ${day.optimizedRoute && day.optimizedRoute.length > 0 ? `
          <div>
            <p class="text-sm font-semibold mb-2">🗺️ Ruta optimizada:</p>
            <ol class="space-y-1 text-sm">
              ${day.optimizedRoute.map((activity, i) => `
                <li class="flex items-center gap-2">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold">
                    ${i + 1}
                  </span>
                  <span>${activity.name}</span>
                </li>
              `).join('')}
            </ol>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Create modal
   */
  createModal() {
    // Remove existing modal
    const existing = document.getElementById('geo-optimizer-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'geo-optimizer-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto';
    modal.innerHTML = '<div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl"></div>';

    document.body.appendChild(modal);

    return modal.firstElementChild;
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById('geo-optimizer-modal');
    if (modal) modal.remove();
  }

  /**
   * Apply optimization to itinerary
   */
  applyOptimization() {
    if (!this.currentOptimization) return;

    // This would integrate with your itinerary manager
    if (window.ItineraryManager && window.ItineraryManager.updateItinerary) {
      window.ItineraryManager.updateItinerary(this.currentOptimization);
    }

    // Show success message
    alert(`✅ Optimización aplicada!\n\n⏱️ Ahorras ${this.currentOptimization.stats.timeSaved} minutos\n📏 Reduces ${this.currentOptimization.stats.distanceSaved}km de distancia`);

    this.closeModal();

    // Track conversion
    if (window.Analytics) {
      window.Analytics.trackConversion('geo_optimization_applied', this.currentOptimization.stats.timeSaved);
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.GeoOptimizerUI = new GeoOptimizerUI();

  // Add button listener (when DOM is ready)
  document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-geo-optimizer');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        window.GeoOptimizerUI.runOptimization();
      });
    }
  });

  console.log('🎨 Geo Optimizer UI loaded!');
}
