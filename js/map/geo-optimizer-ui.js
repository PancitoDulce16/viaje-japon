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

    // Show day selector first
    const selectedDays = await this.showDaySelector(itinerary);

    if (!selectedDays || selectedDays.length === 0) {
      console.log('No days selected for optimization');
      return;
    }

    // Show loading
    this.showLoading();

    // Run optimization only on selected days
    try {
      // Create filtered itinerary with only selected days
      const filteredItinerary = {
        ...itinerary,
        days: itinerary.days.filter((_, index) => selectedDays.includes(index))
      };

      const optimized = this.optimizer.optimizeItinerary(filteredItinerary);

      // Map back to original day indices
      optimized.days = optimized.days.map((day, i) => ({
        ...day,
        originalIndex: selectedDays[i]
      }));

      this.currentOptimization = optimized;
      this.selectedDayIndices = selectedDays;

      // Show results
      this.showResults(optimized);

      // Track event
      if (window.Analytics) {
        window.Analytics.trackEvent('Geo', 'optimization_run', 'success', selectedDays.length);
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
   * Show day selector modal
   */
  async showDaySelector(itinerary) {
    return new Promise((resolve) => {
      const modal = this.createModal();

      modal.innerHTML = `
        <div class="max-w-2xl mx-auto">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">📅 Seleccionar Días a Optimizar</h2>
            <button class="close-modal text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <!-- Info -->
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Selecciona qué días de tu itinerario quieres optimizar. Puedes elegir uno o varios días.
          </p>

          <!-- Day checkboxes -->
          <div class="space-y-3 mb-6 max-h-96 overflow-y-auto">
            ${itinerary.days.map((day, index) => `
              <label class="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  class="day-checkbox w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  value="${index}"
                  checked
                />
                <div class="flex-1">
                  <div class="font-semibold">
                    Día ${index + 1}${day.date ? ` - ${new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}` : ''}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    ${day.activities ? day.activities.length : 0} actividades
                  </div>
                </div>
              </label>
            `).join('')}
          </div>

          <!-- Quick selection buttons -->
          <div class="flex gap-2 mb-6">
            <button class="btn-select-all px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50">
              Seleccionar Todos
            </button>
            <button class="btn-select-none px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
              Deseleccionar Todos
            </button>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button class="btn-confirm btn btn-primary flex-1">
              <i class="fas fa-check mr-2"></i>
              Optimizar Seleccionados
            </button>
            <button class="btn-cancel btn btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      `;

      // Get elements
      const checkboxes = modal.querySelectorAll('.day-checkbox');
      const selectAllBtn = modal.querySelector('.btn-select-all');
      const selectNoneBtn = modal.querySelector('.btn-select-none');
      const confirmBtn = modal.querySelector('.btn-confirm');
      const cancelBtn = modal.querySelector('.btn-cancel');
      const closeBtn = modal.querySelector('.close-modal');

      // Select all handler
      selectAllBtn.addEventListener('click', () => {
        checkboxes.forEach(cb => cb.checked = true);
      });

      // Select none handler
      selectNoneBtn.addEventListener('click', () => {
        checkboxes.forEach(cb => cb.checked = false);
      });

      // Confirm handler
      confirmBtn.addEventListener('click', () => {
        const selected = Array.from(checkboxes)
          .filter(cb => cb.checked)
          .map(cb => parseInt(cb.value));

        this.closeModal();
        resolve(selected);
      });

      // Cancel handlers
      const cancelHandler = () => {
        this.closeModal();
        resolve(null);
      };

      cancelBtn.addEventListener('click', cancelHandler);
      closeBtn.addEventListener('click', cancelHandler);
    });
  }

  /**
   * Get current itinerary from app
   */
  getCurrentItinerary() {
    // Try multiple sources for itinerary

    // 1. Global currentItinerary (from itinerary-v3.js)
    if (window.currentItinerary && window.currentItinerary.days && window.currentItinerary.days.length > 0) {
      console.log('✅ Using window.currentItinerary');
      return window.currentItinerary;
    }

    // 2. ItineraryManager
    if (window.ItineraryManager && window.ItineraryManager.getCurrentItinerary) {
      const itinerary = window.ItineraryManager.getCurrentItinerary();
      if (itinerary && itinerary.days) {
        console.log('✅ Using ItineraryManager');
        return itinerary;
      }
    }

    // 3. Fallback to mock for demo
    console.warn('⚠️ No real itinerary found, using mock data for demo');
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
    // Usar el nuevo sistema de loading states si está disponible
    if (window.LoadingStates) {
      this.loaderId = window.LoadingStates.show('Optimizando tu ruta... 🗺️', '🧭');
    } else {
      // Fallback al método original
      const modal = this.createModal();
      modal.innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p class="text-lg">🗺️ Optimizando tu ruta...</p>
          <p class="text-sm text-gray-500 mt-2">Analizando zonas, calculando distancias...</p>
        </div>
      `;
    }
  }

  /**
   * Show optimization results
   */
  showResults(optimization) {
    // Ocultar loading si está activo
    if (this.loaderId && window.LoadingStates) {
      window.LoadingStates.hide(this.loaderId);
      this.loaderId = null;
    }

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
    const dayNumber = day.originalIndex !== undefined ? day.originalIndex + 1 : index + 1;

    return `
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-bold">Día ${dayNumber}</h4>
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
  async applyOptimization() {
    if (!this.currentOptimization) return;

    try {
      console.log('🔍 Attempting to apply optimization...');
      console.log('currentOptimization exists:', !!this.currentOptimization);
      console.log('window.currentItinerary exists:', !!window.currentItinerary);

      // Try to get itinerary from multiple sources
      let targetItinerary = window.currentItinerary;

      if (!targetItinerary && window.TripsManager && window.TripsManager.currentTrip) {
        console.log('📝 Using TripsManager.currentTrip');
        targetItinerary = window.TripsManager.currentTrip;
      }

      if (!targetItinerary && window.ItineraryManager && window.ItineraryManager.getCurrentItinerary) {
        console.log('📝 Using ItineraryManager');
        targetItinerary = window.ItineraryManager.getCurrentItinerary();
      }

      if (targetItinerary && this.currentOptimization.days) {
        // Update only the selected days with optimized routes
        if (this.selectedDayIndices && this.selectedDayIndices.length > 0) {
          console.log('📝 Updating selected days:', this.selectedDayIndices);

          this.currentOptimization.days.forEach((optimizedDay, i) => {
            const originalIndex = this.selectedDayIndices[i];
            if (originalIndex !== undefined && targetItinerary.days[originalIndex]) {
              // Preserve the original day structure but update activities with optimized route
              if (optimizedDay.optimizedRoute && optimizedDay.optimizedRoute.length > 0) {
                targetItinerary.days[originalIndex].activities = optimizedDay.optimizedRoute;
              }
            }
          });

          // Also update window.currentItinerary if it exists
          if (window.currentItinerary && window.currentItinerary.days) {
            this.currentOptimization.days.forEach((optimizedDay, i) => {
              const originalIndex = this.selectedDayIndices[i];
              if (originalIndex !== undefined && window.currentItinerary.days[originalIndex]) {
                if (optimizedDay.optimizedRoute && optimizedDay.optimizedRoute.length > 0) {
                  window.currentItinerary.days[originalIndex].activities = optimizedDay.optimizedRoute;
                }
              }
            });
          }
        } else {
          // Legacy: Update all days if no specific selection
          targetItinerary.days = this.currentOptimization.days;

          if (window.currentItinerary) {
            window.currentItinerary.days = this.currentOptimization.days;
          }
        }

        console.log('📝 Updating itinerary with optimized route...');

        // Save to Firebase
        if (typeof saveCurrentItineraryToFirebase === 'function') {
          await saveCurrentItineraryToFirebase();
          console.log('✅ Optimized itinerary saved to Firebase');
        } else if (window.TripsManager && window.TripsManager.saveCurrentTrip) {
          await window.TripsManager.saveCurrentTrip();
          console.log('✅ Optimized itinerary saved via TripsManager');
        }

        // Reload the view to show changes
        if (typeof render === 'function') {
          await render();
          console.log('✅ Itinerary view refreshed');
        } else if (window.TripsManager && window.TripsManager.displayCurrentTrip) {
          window.TripsManager.displayCurrentTrip();
          console.log('✅ Itinerary displayed via TripsManager');
        }

        // Show success message with toast
        if (window.showToast) {
          window.showToast(
            `✅ Ruta optimizada! Ahorras ${this.currentOptimization.stats.timeSaved} minutos y ${this.currentOptimization.stats.distanceSaved.toFixed(2)}km`,
            'success',
            5000
          );
        } else {
          alert(`✅ Optimización aplicada!\n\n⏱️ Ahorras ${this.currentOptimization.stats.timeSaved} minutos\n📏 Reduces ${this.currentOptimization.stats.distanceSaved.toFixed(2)}km de distancia`);
        }
      } else {
        console.error('❌ No itinerary found. targetItinerary:', !!targetItinerary, 'optimization.days:', !!this.currentOptimization?.days);

        if (window.showToast) {
          window.showToast('❌ No se pudo aplicar la optimización. Por favor, asegúrate de tener un itinerario creado.', 'error', 5000);
        } else {
          alert('No se pudo aplicar la optimización.\n\nAsegúrate de tener un itinerario creado primero.');
        }
      }
    } catch (error) {
      console.error('❌ Error applying optimization:', error);

      if (window.showToast) {
        window.showToast(`❌ Error: ${error.message}`, 'error', 5000);
      } else {
        alert('Error al aplicar optimización: ' + error.message);
      }
    }

    this.closeModal();

    // Track conversion
    if (window.Analytics) {
      window.Analytics.trackConversion('geo_optimization_applied', this.currentOptimization?.stats?.timeSaved || 0);
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
