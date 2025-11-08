// js/meal-insertion-system.js - Sistema de Inserción Automática de Comidas
// Detecta huecos apropiados para comidas y sugiere restaurantes cercanos

/**
 * Sistema de Inserción Automática de Comidas
 * Analiza el itinerario y sugiere dónde insertar comidas
 */
export const MealInsertionSystem = {

  // Configuración de horarios típicos de comidas en Japón
  mealTimes: {
    breakfast: { start: 7, end: 10, duration: 45, name: 'Desayuno' },
    lunch: { start: 11, end: 14, duration: 60, name: 'Almuerzo' },
    dinner: { start: 18, end: 21, duration: 75, name: 'Cena' }
  },

  /**
   * Analiza un día y detecta dónde faltan comidas
   * @param {Object} day - Día del itinerario
   * @returns {Array} Sugerencias de comidas
   */
  analyzeDayForMeals(day) {
    const suggestions = [];

    if (!day.activities || day.activities.length === 0) {
      return suggestions;
    }

    // Ordenar actividades por horario
    const activitiesWithTime = day.activities
      .filter(a => a.time)
      .sort((a, b) => this.parseTime(a.time) - this.parseTime(b.time));

    if (activitiesWithTime.length === 0) {
      return suggestions;
    }

    // Verificar si ya hay comidas en el día
    const existingMeals = {
      breakfast: this.hasMeal(day, 'breakfast'),
      lunch: this.hasMeal(day, 'lunch'),
      dinner: this.hasMeal(day, 'dinner')
    };

    // Analizar cada tipo de comida
    Object.entries(this.mealTimes).forEach(([type, config]) => {
      if (existingMeals[type]) return; // Ya existe esta comida

      const mealSuggestion = this.findMealSlot(activitiesWithTime, type, config, day);
      if (mealSuggestion) {
        suggestions.push({
          type,
          ...mealSuggestion
        });
      }
    });

    return suggestions;
  },

  /**
   * Verifica si el día ya tiene una comida específica
   */
  hasMeal(day, mealType) {
    const keywords = {
      breakfast: ['desayuno', 'breakfast', 'brunch'],
      lunch: ['almuerzo', 'lunch', 'comida'],
      dinner: ['cena', 'dinner']
    };

    return day.activities.some(activity => {
      const title = (activity.title || activity.name || '').toLowerCase();
      const category = (activity.category || '').toLowerCase();
      const isMeal = activity.isMeal === true;
      const mealTypeMatch = activity.mealType === mealType;

      // Priority 1: Check if it's explicitly marked as this meal type
      if (isMeal && mealTypeMatch) return true;

      // Priority 2: Check if category is "Comida" (food) AND title matches meal keywords
      const isFoodCategory = category === 'comida' || category.includes('restaurante');
      const titleMatchesMeal = keywords[mealType].some(keyword => title.includes(keyword));

      return isFoodCategory && titleMatchesMeal;
    });
  },

  /**
   * Encuentra el mejor hueco para insertar una comida
   */
  findMealSlot(activities, mealType, config, day) {
    const minGapMinutes = config.duration + 15; // Tiempo de comida + buffer

    // Buscar huecos entre actividades
    for (let i = 0; i < activities.length - 1; i++) {
      const current = activities[i];
      const next = activities[i + 1];

      const currentEnd = this.parseTime(current.time) + (current.duration || 90);
      const nextStart = this.parseTime(next.time);
      const gapMinutes = nextStart - currentEnd;

      // Verificar si el hueco está en el rango de horario de la comida
      const gapStartHour = Math.floor(currentEnd / 60);
      const gapEndHour = Math.floor(nextStart / 60);

      const isInMealTimeRange =
        (gapStartHour >= config.start && gapStartHour <= config.end) ||
        (gapEndHour >= config.start && gapEndHour <= config.end);

      if (gapMinutes >= minGapMinutes && isInMealTimeRange) {
        // Encontramos un buen hueco para esta comida
        const suggestedTime = this.formatTime(currentEnd);

        return {
          suggestedTime,
          duration: config.duration,
          name: config.name,
          afterActivity: current.title || current.name,
          beforeActivity: next.title || next.name,
          location: current.zone || current.city || day.city || 'Tokyo',
          coordinates: current.coordinates,
          insertAfterIndex: i
        };
      }
    }

    // Si no encontramos hueco entre actividades, verificar antes/después
    const firstActivity = activities[0];
    const firstActivityTime = this.parseTime(firstActivity.time);
    const firstActivityHour = Math.floor(firstActivityTime / 60);

    // Sugerir antes de la primera actividad si hay tiempo
    if (mealType === 'breakfast' && firstActivityHour >= config.end) {
      return {
        suggestedTime: this.formatTime(config.start * 60),
        duration: config.duration,
        name: config.name,
        beforeActivity: firstActivity.title || firstActivity.name,
        location: firstActivity.zone || firstActivity.city || day.city || 'Tokyo',
        coordinates: firstActivity.coordinates,
        insertAfterIndex: -1 // Insertar al principio
      };
    }

    return null;
  },

  /**
   * Genera sugerencias de restaurantes cerca de una ubicación
   */
  async suggestRestaurants(coordinates, mealType, city) {
    if (!window.GooglePlacesAPI) {
      console.warn('⚠️ Google Places API no disponible');
      return [];
    }

    try {
      // Tipos de restaurantes según la comida (incluyendo konbinis 🏪)
      const restaurantTypes = {
        breakfast: ['cafe', 'bakery', 'breakfast_restaurant', 'convenience_store'],
        lunch: ['restaurant', 'ramen_restaurant', 'sushi_restaurant', 'japanese_restaurant', 'convenience_store'],
        dinner: ['restaurant', 'japanese_restaurant', 'fine_dining_restaurant', 'izakaya', 'convenience_store']
      };

      const types = restaurantTypes[mealType] || ['restaurant'];

      const result = await window.GooglePlacesAPI.searchNearbyNew({
        lat: coordinates.lat,
        lng: coordinates.lng,
        radius: 1000, // 1km
        includedTypes: types,
        maxResults: 10
      });

      if (result.success && result.places) {
        return result.places.map(place => ({
          id: place.id,
          name: place.displayName || place.name,
          address: place.formattedAddress || place.address,
          rating: place.rating,
          coordinates: place.location,
          priceLevel: place.priceLevel,
          types: place.types
        }));
      }

      return [];
    } catch (error) {
      console.error('❌ Error buscando restaurantes:', error);
      return [];
    }
  },

  /**
   * Busca restaurantes por nombre usando Google Places Text Search
   */
  async searchRestaurantByName(searchQuery, coordinates, city) {
    if (!window.GooglePlacesAPI) {
      console.warn('⚠️ Google Places API no disponible');
      return [];
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }

    try {
      const result = await window.GooglePlacesAPI.searchTextNew({
        textQuery: `${searchQuery} restaurant ${city || 'Tokyo'}`,
        lat: coordinates?.lat,
        lng: coordinates?.lng,
        radius: 5000, // 5km para búsqueda por nombre
        maxResults: 10
      });

      if (result.success && result.places) {
        return result.places.map(place => ({
          id: place.id,
          name: place.displayName || place.name,
          address: place.formattedAddress || place.address,
          rating: place.rating,
          coordinates: place.location,
          priceLevel: place.priceLevel,
          types: place.types
        }));
      }

      return [];
    } catch (error) {
      console.error('❌ Error buscando restaurante por nombre:', error);
      return [];
    }
  },

  /**
   * Muestra modal con sugerencias de comidas para un día
   */
  async showMealSuggestionsModal(dayNumber, itinerary) {
    const day = itinerary.days.find(d => d.day === dayNumber);
    if (!day) return;

    const mealSuggestions = this.analyzeDayForMeals(day);

    if (mealSuggestions.length === 0) {
      if (window.Notifications) {
        window.Notifications.show('Este día ya tiene todas las comidas planificadas', 'success');
      }
      return;
    }

    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'mealSuggestionsModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';

    const suggestionsHTML = await Promise.all(
      mealSuggestions.map(async (suggestion, index) => {
        const restaurants = suggestion.coordinates
          ? await this.suggestRestaurants(suggestion.coordinates, suggestion.type, suggestion.location)
          : [];

        const coords = JSON.stringify(suggestion.coordinates || {});
        const location = suggestion.location || 'Tokyo';

        return `
          <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-700">
            <h3 class="text-lg font-bold text-orange-600 dark:text-orange-400 mb-2">
              🍽️ ${suggestion.name}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <strong>Horario sugerido:</strong> ${suggestion.suggestedTime}
            </p>
            ${suggestion.afterActivity ? `<p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Después de: ${suggestion.afterActivity}</p>` : ''}
            ${suggestion.beforeActivity ? `<p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Antes de: ${suggestion.beforeActivity}</p>` : ''}

            <!-- Search Bar -->
            <div class="mt-3 mb-3">
              <div class="relative flex gap-2">
                <input
                  type="text"
                  id="restaurantSearch_${index}"
                  placeholder="🔍 Buscar restaurante (ej: Anakuma cafe)..."
                  class="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 dark:bg-gray-600 dark:text-white text-sm"
                  onkeyup="MealInsertionSystem.handleRestaurantSearch(event, ${dayNumber}, '${suggestion.type}', '${suggestion.suggestedTime}', ${coords}, '${location}', ${index})"
                  onkeydown="if(event.key==='Enter'){event.preventDefault();MealInsertionSystem.triggerSearch(${dayNumber}, '${suggestion.type}', '${suggestion.suggestedTime}', ${coords}, '${location}', ${index});}"
                  autocomplete="off"
                />
                <button
                  onclick="MealInsertionSystem.triggerSearch(${dayNumber}, '${suggestion.type}', '${suggestion.suggestedTime}', ${coords}, '${location}', ${index})"
                  class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition text-sm whitespace-nowrap"
                >
                  Buscar
                </button>
                <div id="searchSpinner_${index}" class="hidden absolute right-20 top-2.5">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                </div>
              </div>
              <div id="searchResults_${index}" class="mt-2 space-y-2 max-h-48 overflow-y-auto"></div>
            </div>

            ${restaurants.length > 0 ? `
              <div class="mt-3">
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Restaurantes cercanos:</p>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                  ${restaurants.slice(0, 5).map(restaurant => `
                    <div class="bg-gray-50 dark:bg-gray-600 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500 transition"
                         onclick="MealInsertionSystem.addMealToItinerary(${dayNumber}, '${suggestion.type}', '${suggestion.suggestedTime}', ${JSON.stringify(restaurant).replace(/"/g, '&quot;')})">
                      <p class="text-sm font-semibold text-gray-900 dark:text-white">${restaurant.name}</p>
                      ${restaurant.rating ? `<p class="text-xs text-yellow-600 dark:text-yellow-400">⭐ ${restaurant.rating}</p>` : ''}
                      ${restaurant.address ? `<p class="text-xs text-gray-600 dark:text-gray-300 mt-1">${restaurant.address}</p>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : `
              <button
                onclick="MealInsertionSystem.addMealToItinerary(${dayNumber}, '${suggestion.type}', '${suggestion.suggestedTime}', null)"
                class="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition mt-3"
              >
                Agregar ${suggestion.name} (sin restaurante específico)
              </button>
            `}
          </div>
        `;
      })
    );

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">🍽️ Sugerencias de Comidas - Día ${dayNumber}</h2>
              <p class="text-sm text-white/80 mt-1">Detectamos ${mealSuggestions.length} comida(s) faltante(s)</p>
            </div>
            <button onclick="this.closest('#mealSuggestionsModal').remove()" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          ${suggestionsHTML.join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  /**
   * Maneja la búsqueda de restaurantes con debounce (para typing)
   */
  handleRestaurantSearch(event, dayNumber, mealType, suggestedTime, coordinates, location, index) {
    const searchQuery = event.target.value.trim();

    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const resultsContainer = document.getElementById(`searchResults_${index}`);

    // Clear results if search is empty
    if (searchQuery.length < 2) {
      resultsContainer.innerHTML = '';
      return;
    }

    // Debounce search by 800ms while typing
    this.searchTimeout = setTimeout(() => {
      this.performSearch(dayNumber, mealType, suggestedTime, coordinates, location, index);
    }, 800);
  },

  /**
   * Ejecuta la búsqueda inmediatamente (para botón y Enter)
   */
  triggerSearch(dayNumber, mealType, suggestedTime, coordinates, location, index) {
    // Clear any pending debounced search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.performSearch(dayNumber, mealType, suggestedTime, coordinates, location, index);
  },

  /**
   * Realiza la búsqueda de restaurantes
   */
  async performSearch(dayNumber, mealType, suggestedTime, coordinates, location, index) {
    const searchInput = document.getElementById(`restaurantSearch_${index}`);
    const searchQuery = searchInput?.value.trim();
    const resultsContainer = document.getElementById(`searchResults_${index}`);
    const spinner = document.getElementById(`searchSpinner_${index}`);

    if (!searchQuery || searchQuery.length < 2) {
      resultsContainer.innerHTML = `
        <p class="text-sm text-gray-500 dark:text-gray-400 italic">
          Escribe al menos 2 caracteres para buscar
        </p>
      `;
      return;
    }

    // Show spinner
    spinner.classList.remove('hidden');
    resultsContainer.innerHTML = `
      <p class="text-sm text-gray-500 dark:text-gray-400 italic">
        Buscando "${searchQuery}"...
      </p>
    `;

    try {
      const restaurants = await this.searchRestaurantByName(searchQuery, coordinates, location);

      spinner.classList.add('hidden');

      if (restaurants.length === 0) {
        resultsContainer.innerHTML = `
          <p class="text-sm text-gray-500 dark:text-gray-400 italic">
            ❌ No se encontraron restaurantes con "${searchQuery}"
          </p>
        `;
        return;
      }

      resultsContainer.innerHTML = `
        <p class="text-xs text-gray-600 dark:text-gray-300 mb-2">
          ✨ ${restaurants.length} resultado(s) encontrado(s):
        </p>
      ` + restaurants.map(restaurant => `
        <div class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition border-2 border-blue-200 dark:border-blue-700"
             onclick="MealInsertionSystem.addMealToItinerary(${dayNumber}, '${mealType}', '${suggestedTime}', ${JSON.stringify(restaurant).replace(/"/g, '&quot;')})">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">🔍 ${restaurant.name}</p>
          ${restaurant.rating ? `<p class="text-xs text-yellow-600 dark:text-yellow-400">⭐ ${restaurant.rating}</p>` : ''}
          ${restaurant.address ? `<p class="text-xs text-gray-600 dark:text-gray-300 mt-1">${restaurant.address}</p>` : ''}
        </div>
      `).join('');
    } catch (error) {
      spinner.classList.add('hidden');
      resultsContainer.innerHTML = `
        <p class="text-sm text-red-500 dark:text-red-400">
          ❌ Error al buscar: ${error.message}
        </p>
      `;
    }
  },

  /**
   * Agrega una comida al itinerario
   */
  async addMealToItinerary(dayNumber, mealType, suggestedTime, restaurant) {
    const itinerary = window.ItineraryHandler?.currentItinerary;
    if (!itinerary) return;

    const day = itinerary.days.find(d => d.day === dayNumber);
    if (!day) return;

    const mealActivity = {
      id: `meal-${Date.now()}`,
      time: suggestedTime,
      title: restaurant ? restaurant.name : this.mealTimes[mealType].name,
      duration: this.mealTimes[mealType].duration,
      category: 'Comida',
      icon: mealType === 'breakfast' ? '🥐' : mealType === 'lunch' ? '🍜' : '🍱',
      coordinates: restaurant?.coordinates || null,
      address: restaurant?.address || '',
      rating: restaurant?.rating || null,
      isMeal: true,
      mealType: mealType
    };

    day.activities.push(mealActivity);

    // Guardar en Firebase
    if (window.ItineraryHandler && typeof window.ItineraryHandler.saveCurrentItineraryToFirebase === 'function') {
      await window.ItineraryHandler.saveCurrentItineraryToFirebase();
    }

    // Cerrar modal
    const modal = document.getElementById('mealSuggestionsModal');
    if (modal) modal.remove();

    // Notificar
    if (window.Notifications) {
      window.Notifications.show(`${mealActivity.title} agregado al día ${dayNumber}`, 'success');
    }

    // Re-renderizar
    if (window.ItineraryHandler && typeof window.ItineraryHandler.render === 'function') {
      window.ItineraryHandler.render();
    }
  },

  // Helper: Parsear tiempo en formato "HH:MM" a minutos
  parseTime(timeStr) {
    if (!timeStr) return 540; // Default 09:00

    const parts = String(timeStr).split(':');
    if (parts.length !== 2) return 540;

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    // Validate that they're actually numbers
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn(`⚠️ Invalid time format in meal-insertion: "${timeStr}", using default 09:00`);
      return 540;
    }

    return hours * 60 + minutes;
  },

  // Helper: Formatear minutos a "HH:MM"
  formatTime(minutes) {
    // Validate that minutes is a valid number
    if (!isFinite(minutes) || isNaN(minutes)) {
      console.warn(`⚠️ Invalid minutes value in meal-insertion: ${minutes}, using default 09:00`);
      minutes = 540;
    }

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
};

// Exportar a window para acceso global
window.MealInsertionSystem = MealInsertionSystem;

console.log('✅ Meal Insertion System cargado');
