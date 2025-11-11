// js/meal-insertion-system.js - Sistema de Inserción Automática de Comidas
// Detecta huecos apropiados para comidas y sugiere restaurantes cercanos
// Version: 2.2 - Flexible meal slot detection (before/between/after activities)

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
    // Keywords más específicos - removida "comida" genérica
    const keywords = {
      breakfast: ['desayuno', 'breakfast', 'brunch'],
      lunch: ['almuerzo', 'lunch'],
      dinner: ['cena', 'dinner']
    };

    return day.activities.some(activity => {
      const title = (activity.title || activity.name || '').toLowerCase();
      const category = (activity.category || '').toLowerCase();
      const isMeal = activity.isMeal === true;
      const mealTypeMatch = activity.mealType === mealType;

      // Priority 1: ONLY trust explicit meal markers
      // Si está marcado explícitamente como comida, verificar que coincida el tipo
      if (isMeal === true) {
        return mealTypeMatch;
      }

      // Priority 2: Solo detectar si el título tiene keywords MUY específicos
      // NO usar categoría "Comida" sola porque es muy genérica
      const titleMatchesMeal = keywords[mealType].some(keyword => title.includes(keyword));

      // Solo retornar true si el título contiene keywords específicos
      return titleMatchesMeal;
    });
  },

  /**
   * Encuentra el mejor hueco para insertar una comida
   */
  findMealSlot(activities, mealType, config, day) {
    console.log(`🔍 Buscando hueco para ${mealType} (${config.name})`);

    const minGapMinutes = config.duration + 15; // Tiempo de comida + buffer
    const firstActivity = activities[0];
    const lastActivity = activities[activities.length - 1];

    // 1. ANTES de la primera actividad
    const firstActivityTime = this.parseTime(firstActivity.time);
    const firstActivityHour = Math.floor(firstActivityTime / 60);

    console.log(`   Primera actividad: ${firstActivity.title} a las ${firstActivity.time} (hora: ${firstActivityHour})`);

    // Sugerir comida antes si la primera actividad es DESPUÉS del horario de esa comida
    if (firstActivityHour > config.end) {
      // La primera actividad es después del horario de esta comida
      const suggestedHour = Math.max(config.start, config.end - 1); // Hora ideal para esta comida
      console.log(`   ✅ Sugerencia ANTES: primera actividad (${firstActivityHour}h) es después del horario de ${mealType} (${config.start}-${config.end}h)`);

      return {
        suggestedTime: this.formatTime(suggestedHour * 60),
        duration: config.duration,
        name: config.name,
        beforeActivity: firstActivity.title || firstActivity.name,
        location: firstActivity.zone || firstActivity.city || day.city || 'Tokyo',
        coordinates: firstActivity.coordinates,
        insertAfterIndex: -1 // Insertar al principio
      };
    }

    // 2. ENTRE actividades (buscar huecos)
    for (let i = 0; i < activities.length - 1; i++) {
      const current = activities[i];
      const next = activities[i + 1];

      const currentEnd = this.parseTime(current.time) + (current.duration || 90);
      const nextStart = this.parseTime(next.time);
      const gapMinutes = nextStart - currentEnd;
      const gapStartHour = Math.floor(currentEnd / 60);

      console.log(`   Hueco entre "${current.title}" y "${next.title}": ${gapMinutes} min (empieza a ${gapStartHour}h)`);

      // Verificar si el hueco está en el rango de horario de la comida
      const isInMealTimeRange = gapStartHour >= config.start && gapStartHour <= config.end;

      if (gapMinutes >= minGapMinutes && isInMealTimeRange) {
        console.log(`   ✅ Sugerencia ENTRE actividades: hueco de ${gapMinutes} min a las ${gapStartHour}h`);

        return {
          suggestedTime: this.formatTime(currentEnd),
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

    // 3. DESPUÉS de la última actividad
    const lastActivityTime = this.parseTime(lastActivity.time);
    const lastActivityEnd = lastActivityTime + (lastActivity.duration || 90);
    const lastActivityEndHour = Math.floor(lastActivityEnd / 60);

    console.log(`   Última actividad termina: ${this.formatTime(lastActivityEnd)} (${lastActivityEndHour}h)`);

    // Sugerir comida después si la última actividad termina ANTES del horario de esa comida
    if (lastActivityEndHour < config.end) {
      // La última actividad termina antes del fin del horario de esta comida
      const suggestedTimeMinutes = Math.max(lastActivityEnd, config.start * 60);
      console.log(`   ✅ Sugerencia DESPUÉS: última actividad termina (${lastActivityEndHour}h) antes del fin de ${mealType} (${config.end}h)`);

      return {
        suggestedTime: this.formatTime(suggestedTimeMinutes),
        duration: config.duration,
        name: config.name,
        afterActivity: lastActivity.title || lastActivity.name,
        location: lastActivity.zone || lastActivity.city || day.city || 'Tokyo',
        coordinates: lastActivity.coordinates,
        insertAfterIndex: activities.length - 1 // Insertar al final
      };
    }

    console.log(`   ❌ No se encontró hueco apropiado para ${mealType}`);
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
      const result = await window.GooglePlacesAPI.textSearch({
        query: `${searchQuery} restaurant ${city || 'Tokyo'}`,
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

    console.log('🍽️ Analizando día', dayNumber, 'para comidas');
    console.log('📊 Actividades en el día:', day.activities);

    const mealSuggestions = this.analyzeDayForMeals(day);

    console.log('💡 Sugerencias de comidas encontradas:', mealSuggestions);

    if (mealSuggestions.length === 0) {
      // Verificar por qué no hay sugerencias
      const hasActivities = day.activities && day.activities.length > 0;
      const activitiesWithTime = day.activities?.filter(a => a.time) || [];

      console.log('🔍 Debug - Tiene actividades:', hasActivities);
      console.log('🔍 Debug - Actividades con tiempo:', activitiesWithTime.length);

      // Verificar comidas existentes
      const existingMeals = {
        breakfast: this.hasMeal(day, 'breakfast'),
        lunch: this.hasMeal(day, 'lunch'),
        dinner: this.hasMeal(day, 'dinner')
      };
      console.log('🔍 Debug - Comidas existentes:', existingMeals);

      let message = 'No se encontraron huecos para sugerir comidas';

      if (!hasActivities) {
        message = 'Este día no tiene actividades. Agrega algunas actividades primero para poder sugerir horarios de comida.';
      } else if (activitiesWithTime.length === 0) {
        message = 'Las actividades no tienen horarios definidos. Asigna horarios a las actividades para poder sugerir comidas.';
      } else if (existingMeals.breakfast && existingMeals.lunch && existingMeals.dinner) {
        message = 'Este día ya tiene todas las comidas planificadas';
      }

      if (window.Notifications) {
        window.Notifications.show(message, 'info');
      }
      return;
    }

    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'mealSuggestionsModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';

    // Store suggestion data globally for access by handlers
    window.mealSuggestionsData = window.mealSuggestionsData || {};

    const suggestionsHTML = await Promise.all(
      mealSuggestions.map(async (suggestion, index) => {
        const restaurants = suggestion.coordinates
          ? await this.suggestRestaurants(suggestion.coordinates, suggestion.type, suggestion.location)
          : [];

        // Store data globally to avoid inline JSON in HTML
        window.mealSuggestionsData[`suggestion_${dayNumber}_${index}`] = {
          dayNumber,
          mealType: suggestion.type,
          suggestedTime: suggestion.suggestedTime,
          coordinates: suggestion.coordinates || null,
          location: suggestion.location || 'Tokyo'
        };

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
              <div class="relative">
                <div class="flex gap-2">
                  <input
                    type="text"
                    id="restaurantSearch_${index}"
                    data-suggestion-key="suggestion_${dayNumber}_${index}"
                    placeholder="🔍 Buscar restaurante (ej: Anakuma cafe)..."
                    class="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 dark:bg-gray-600 dark:text-white text-sm"
                    onkeyup="MealInsertionSystem.handleRestaurantSearchByKey(event, '${dayNumber}', ${index})"
                    onkeydown="if(event.key==='Enter'){event.preventDefault();MealInsertionSystem.triggerSearchByKey('${dayNumber}', ${index});}"
                    onfocus="MealInsertionSystem.handleRestaurantSearchByKey(event, '${dayNumber}', ${index})"
                    autocomplete="off"
                  />
                  <button
                    onclick="MealInsertionSystem.triggerSearchByKey('${dayNumber}', ${index})"
                    class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition text-sm whitespace-nowrap"
                  >
                    Buscar
                  </button>
                  <div id="searchSpinner_${index}" class="hidden absolute right-20 top-2.5">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                  </div>
                </div>
                <!-- Autocomplete Dropdown -->
                <div
                  id="autocomplete_${index}"
                  class="hidden absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-orange-300 dark:border-orange-600 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                  style="left: 0; top: 100%;"
                ></div>
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

    // Add global click handler to close autocomplete when clicking outside
    setTimeout(() => {
      document.addEventListener('click', this.handleGlobalClick.bind(this));
    }, 100);
  },

  /**
   * Maneja clics globales para cerrar autocomplete
   */
  handleGlobalClick(event) {
    // Check if click is outside all autocomplete containers
    const autocompleteContainers = document.querySelectorAll('[id^="autocomplete_"]');
    const searchInputs = document.querySelectorAll('[id^="restaurantSearch_"]');

    let clickedInsideAutocomplete = false;
    let clickedInsideInput = false;

    autocompleteContainers.forEach(container => {
      if (container.contains(event.target)) {
        clickedInsideAutocomplete = true;
      }
    });

    searchInputs.forEach(input => {
      if (input.contains(event.target)) {
        clickedInsideInput = true;
      }
    });

    // If clicked outside both, close all autocomplete dropdowns
    if (!clickedInsideAutocomplete && !clickedInsideInput) {
      autocompleteContainers.forEach(container => {
        container.innerHTML = '';
        container.classList.add('hidden');
      });
    }
  },

  /**
   * Wrapper para handleRestaurantSearch usando key (evita problemas de sintaxis en HTML)
   */
  handleRestaurantSearchByKey(event, dayNumber, index) {
    const key = `suggestion_${dayNumber}_${index}`;
    const data = window.mealSuggestionsData[key];
    if (!data) {
      console.error('No data found for key:', key);
      return;
    }
    this.handleRestaurantSearch(event, data.dayNumber, data.mealType, data.suggestedTime, data.coordinates, data.location, index);
  },

  /**
   * Wrapper para triggerSearch usando key
   */
  triggerSearchByKey(dayNumber, index) {
    const key = `suggestion_${dayNumber}_${index}`;
    const data = window.mealSuggestionsData[key];
    if (!data) {
      console.error('No data found for key:', key);
      return;
    }
    this.triggerSearch(data.dayNumber, data.mealType, data.suggestedTime, data.coordinates, data.location, index);
  },

  /**
   * Obtiene sugerencias de autocomplete para restaurantes
   */
  async getRestaurantSuggestions(searchQuery, coordinates, city) {
    if (!window.GooglePlacesAPI) {
      return [];
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }

    try {
      const result = await window.GooglePlacesAPI.textSearch({
        query: `${searchQuery} restaurant ${city || 'Tokyo'}`,
        lat: coordinates?.lat,
        lng: coordinates?.lng,
        radius: 5000,
        maxResults: 5 // Solo 5 sugerencias para autocomplete
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
      console.error('❌ Error obteniendo sugerencias:', error);
      return [];
    }
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

    const autocompleteContainer = document.getElementById(`autocomplete_${index}`);

    // Clear autocomplete if search is empty
    if (searchQuery.length < 2) {
      if (autocompleteContainer) {
        autocompleteContainer.innerHTML = '';
        autocompleteContainer.classList.add('hidden');
      }
      return;
    }

    // Show autocomplete suggestions with debounce
    this.searchTimeout = setTimeout(async () => {
      if (!autocompleteContainer) return;

      // Show loading state
      autocompleteContainer.innerHTML = `
        <div class="p-2 text-sm text-gray-500 dark:text-gray-400 italic">
          Buscando sugerencias...
        </div>
      `;
      autocompleteContainer.classList.remove('hidden');

      const suggestions = await this.getRestaurantSuggestions(searchQuery, coordinates, location);

      if (suggestions.length === 0) {
        autocompleteContainer.innerHTML = `
          <div class="p-2 text-sm text-gray-500 dark:text-gray-400 italic">
            No se encontraron sugerencias
          </div>
        `;
        return;
      }

      // Show suggestions
      autocompleteContainer.innerHTML = suggestions.map((restaurant, suggIdx) => `
        <div
          class="autocomplete-item p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition"
          onclick="MealInsertionSystem.selectAutocompleteItem(${dayNumber}, '${mealType}', '${suggestedTime}', ${index}, ${suggIdx})"
          data-suggestion-index="${suggIdx}"
        >
          <div class="flex items-start gap-2">
            <span class="text-base">🍽️</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">${restaurant.name}</p>
              ${restaurant.rating ? `<p class="text-xs text-yellow-600 dark:text-yellow-400">⭐ ${restaurant.rating}</p>` : ''}
              ${restaurant.address ? `<p class="text-xs text-gray-600 dark:text-gray-300 truncate">${restaurant.address}</p>` : ''}
            </div>
          </div>
        </div>
      `).join('');

      // Store suggestions globally for selection
      if (!window.autocompleteSuggestions) {
        window.autocompleteSuggestions = {};
      }
      window.autocompleteSuggestions[index] = suggestions;

    }, 400); // Faster debounce for autocomplete (400ms)
  },

  /**
   * Selecciona un item del autocomplete
   */
  selectAutocompleteItem(dayNumber, mealType, suggestedTime, index, suggestionIndex) {
    const suggestions = window.autocompleteSuggestions?.[index];
    if (!suggestions || !suggestions[suggestionIndex]) {
      console.error('No se encontró la sugerencia');
      return;
    }

    const restaurant = suggestions[suggestionIndex];

    // Cerrar autocomplete
    const autocompleteContainer = document.getElementById(`autocomplete_${index}`);
    if (autocompleteContainer) {
      autocompleteContainer.innerHTML = '';
      autocompleteContainer.classList.add('hidden');
    }

    // Agregar directamente al itinerario
    this.addMealToItinerary(dayNumber, mealType, suggestedTime, restaurant);
  },

  /**
   * Ejecuta la búsqueda inmediatamente (para botón y Enter)
   */
  triggerSearch(dayNumber, mealType, suggestedTime, coordinates, location, index) {
    // Clear any pending debounced search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Hide autocomplete when doing full search
    const autocompleteContainer = document.getElementById(`autocomplete_${index}`);
    if (autocompleteContainer) {
      autocompleteContainer.innerHTML = '';
      autocompleteContainer.classList.add('hidden');
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
   * Estima el costo de una comida basado en tipo y priceLevel
   * @param {string} mealType - breakfast, lunch, dinner
   * @param {string} priceLevel - PRICE_LEVEL_* del Google Places API
   * @returns {number} Costo estimado en yenes
   */
  estimateMealCost(mealType, priceLevel) {
    // Rangos de precios base por tipo de comida en Japón (en yenes)
    const basePrices = {
      breakfast: { min: 500, avg: 1000, max: 1500 },
      lunch: { min: 800, avg: 1200, max: 2000 },
      dinner: { min: 1500, avg: 2500, max: 4000 }
    };

    const base = basePrices[mealType] || basePrices.lunch;

    // Multiplicadores según price level
    const priceMultipliers = {
      'PRICE_LEVEL_FREE': 0,
      'PRICE_LEVEL_INEXPENSIVE': 0.7,
      'PRICE_LEVEL_MODERATE': 1.0,
      'PRICE_LEVEL_EXPENSIVE': 1.5,
      'PRICE_LEVEL_VERY_EXPENSIVE': 2.5,
      'PRICE_LEVEL_UNSPECIFIED': 1.0
    };

    const multiplier = priceMultipliers[priceLevel] || 1.0;

    // Si es gratis, retornar 0
    if (priceLevel === 'PRICE_LEVEL_FREE') {
      return 0;
    }

    // Calcular precio estimado
    const estimatedPrice = Math.round(base.avg * multiplier);

    return estimatedPrice;
  },

  /**
   * Agrega una comida al itinerario
   */
  async addMealToItinerary(dayNumber, mealType, suggestedTime, restaurant) {
    const itinerary = window.ItineraryHandler?.currentItinerary;
    if (!itinerary) return;

    const day = itinerary.days.find(d => d.day === dayNumber);
    if (!day) return;

    // Estimar costo basado en priceLevel y tipo de comida
    const estimatedCost = this.estimateMealCost(mealType, restaurant?.priceLevel);

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
      cost: estimatedCost,
      desc: restaurant ? `${restaurant.address || ''}${restaurant.rating ? ` • ⭐ ${restaurant.rating}` : ''}` : '',
      isMeal: true,
      mealType: mealType
    };

    day.activities.push(mealActivity);

    // Guardar en Firebase
    if (window.saveCurrentItineraryToFirebase && typeof window.saveCurrentItineraryToFirebase === 'function') {
      await window.saveCurrentItineraryToFirebase();
    }

    // Cerrar modal
    const modal = document.getElementById('mealSuggestionsModal');
    if (modal) modal.remove();

    // Notificar
    if (window.Notifications) {
      window.Notifications.show(`${mealActivity.title} agregado al día ${dayNumber}`, 'success');
    }

    // Re-renderizar
    if (window.renderItinerary && typeof window.renderItinerary === 'function') {
      await window.renderItinerary();
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

console.log('✅ Meal Insertion System cargado - VERSION 2.2 (Flexible Slot Detection)');
