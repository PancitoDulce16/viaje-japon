// js/activity-browser.js - Sistema para Agregar Actividades con APIs

import { db, auth } from './firebase-config.js';
import { Notifications } from './notifications.js';
import { ACTIVITIES_DATABASE, getActivitiesByCity } from '../data/activities-database.js';
import { JAPAN_CITIES, getCityById } from '../data/japan-cities.js';
import { CATEGORIES } from '../data/categories-data.js';
import { API_KEYS, API_ENDPOINTS, apiRequest } from './apis-config.js';
import { doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const ActivityBrowser = {
  currentFilters: {
    city: 'all',
    categories: [],
    timeOfDay: 'all',
    priceRange: 'all',
    sortBy: 'rating' // rating, price, duration
  },
  
  currentDayNumber: null,
  useAPIs: false, // Se activa si las APIs están configuradas

  init() {
    // Verificar si hay APIs configuradas
    this.useAPIs = !API_KEYS.google.places.includes('TU_');
    console.log(this.useAPIs ? '✅ APIs activas' : '⚠️ Usando datos estáticos');
  },

  async showActivityBrowser(dayNumber) {
    this.currentDayNumber = dayNumber;
    
    const tripId = window.TripsManager?.currentTrip?.id;
    if (!tripId) {
      Notifications.error('Selecciona un viaje primero');
      return;
    }

    // Cargar itinerario para obtener ciudades y categorías del usuario
    const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
    const itinerarySnap = await getDoc(itineraryRef);
    
    if (!itinerarySnap.exists()) {
      Notifications.error('Crea un itinerario primero');
      return;
    }

    const itinerary = itinerarySnap.data();
    const userCities = itinerary.cities || [];
    const userCategories = itinerary.categories || [];

    this.renderBrowserModal(dayNumber, userCities, userCategories);
  },

  renderBrowserModal(dayNumber, userCities, userCategories) {
    const modalHtml = `
      <div id="activityBrowserModal" class="modal active" style="z-index: 9999;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 flex-shrink-0">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-3xl font-bold">🎯 Agregar Actividades</h2>
                <p class="text-sm text-white/80 mt-1">Día ${dayNumber} - Descubre y agrega actividades increíbles</p>
              </div>
              <button 
                onclick="ActivityBrowser.closeBrowser()"
                class="text-white hover:bg-white/20 w-10 h-10 rounded-full transition flex items-center justify-center text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Filters -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
              
              <!-- Filtro Ciudad -->
              <div>
                <label class="block text-xs font-semibold mb-1 dark:text-gray-300">📍 Ciudad</label>
                <select 
                  id="filterCity" 
                  onchange="ActivityBrowser.applyFilters()"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">Todas</option>
                  ${userCities.map(cityId => {
                    const city = getCityById(cityId);
                    return `<option value="${cityId}">${city?.name || cityId}</option>`;
                  }).join('')}
                </select>
              </div>

              <!-- Filtro Horario -->
              <div>
                <label class="block text-xs font-semibold mb-1 dark:text-gray-300">⏰ Horario</label>
                <select 
                  id="filterTime"
                  onchange="ActivityBrowser.applyFilters()"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">Todo el día</option>
                  <option value="morning">Mañana</option>
                  <option value="afternoon">Tarde</option>
                  <option value="evening">Noche</option>
                </select>
              </div>

              <!-- Filtro Precio -->
              <div>
                <label class="block text-xs font-semibold mb-1 dark:text-gray-300">💰 Precio</label>
                <select 
                  id="filterPrice"
                  onchange="ActivityBrowser.applyFilters()"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">Cualquiera</option>
                  <option value="free">Gratis</option>
                  <option value="budget">Económico (< ¥2000)</option>
                  <option value="moderate">Moderado (¥2000-5000)</option>
                  <option value="expensive">Premium (> ¥5000)</option>
                </select>
              </div>

              <!-- Ordenar -->
              <div>
                <label class="block text-xs font-semibold mb-1 dark:text-gray-300">🔄 Ordenar por</label>
                <select 
                  id="filterSort"
                  onchange="ActivityBrowser.applyFilters()"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="rating">Rating</option>
                  <option value="price-low">Precio: Menor</option>
                  <option value="price-high">Precio: Mayor</option>
                  <option value="duration">Duración</option>
                </select>
              </div>

              <!-- Búsqueda -->
              <div>
                <label class="block text-xs font-semibold mb-1 dark:text-gray-300">🔍 Buscar</label>
                <input 
                  type="text" 
                  id="searchQuery"
                  placeholder="Buscar..."
                  oninput="ActivityBrowser.applyFilters()"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>

            <!-- Filtros de Categoría -->
            <div>
              <label class="block text-xs font-semibold mb-2 dark:text-gray-300">🎯 Categorías (tus intereses)</label>
              <div class="flex flex-wrap gap-2" id="categoryFilters">
                ${CATEGORIES.filter(cat => userCategories.includes(cat.id)).map(cat => `
                  <button 
                    data-category="${cat.id}"
                    onclick="ActivityBrowser.toggleCategoryFilter('${cat.id}')"
                    class="category-filter-btn px-3 py-1 rounded-full text-xs font-semibold border-2 transition
                           border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                           hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    ${cat.icon} ${cat.name}
                  </button>
                `).join('')}
              </div>
            </div>

            ${!this.useAPIs ? `
              <div class="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p class="text-xs text-yellow-800 dark:text-yellow-300">
                  ⚠️ <strong>Modo Offline:</strong> Usando datos estáticos. Configura las APIs en <code>js/apis-config.js</code> para obtener información actualizada y precios reales.
                </p>
              </div>
            ` : ''}
          </div>

          <!-- Activities Grid -->
          <div class="flex-1 overflow-y-auto p-4">
            <div id="activitiesGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Se llenará dinámicamente -->
            </div>
            <div id="noResults" class="hidden text-center py-12">
              <div class="text-6xl mb-4">🔍</div>
              <p class="text-gray-600 dark:text-gray-400 text-lg">No se encontraron actividades</p>
              <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Prueba con otros filtros</p>
            </div>
            <div id="loadingResults" class="hidden text-center py-12">
              <div class="text-6xl mb-4 animate-pulse">⏳</div>
              <p class="text-gray-600 dark:text-gray-400 text-lg">Buscando actividades...</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0 bg-gray-50 dark:bg-gray-900">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <span id="resultsCount">0</span> actividades disponibles
            </div>
            <button 
              onclick="ActivityBrowser.closeBrowser()"
              class="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';

    // Cargar actividades iniciales
    this.applyFilters();
  },

  toggleCategoryFilter(categoryId) {
    const index = this.currentFilters.categories.indexOf(categoryId);
    
    if (index > -1) {
      this.currentFilters.categories.splice(index, 1);
    } else {
      this.currentFilters.categories.push(categoryId);
    }

    // Actualizar UI del botón
    const btn = document.querySelector(`[data-category="${categoryId}"]`);
    if (btn) {
      if (this.currentFilters.categories.includes(categoryId)) {
        btn.classList.remove('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
        btn.classList.add('border-purple-500', 'bg-purple-500', 'text-white');
      } else {
        btn.classList.add('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
        btn.classList.remove('border-purple-500', 'bg-purple-500', 'text-white');
      }
    }

    this.applyFilters();
  },

  async applyFilters() {
    this.currentFilters.city = document.getElementById('filterCity')?.value || 'all';
    this.currentFilters.timeOfDay = document.getElementById('filterTime')?.value || 'all';
    this.currentFilters.priceRange = document.getElementById('filterPrice')?.value || 'all';
    this.currentFilters.sortBy = document.getElementById('filterSort')?.value || 'rating';
    const searchQuery = document.getElementById('searchQuery')?.value.toLowerCase() || '';

    // Si las APIs están activas y hay ciudad seleccionada, usar APIs
    if (this.useAPIs && this.currentFilters.city !== 'all') {
      await this.fetchActivitiesFromAPI(this.currentFilters.city);
      return;
    }

    // Obtener todas las actividades de la base de datos local
    let activities = [];
    
    if (this.currentFilters.city === 'all') {
      // Todas las ciudades
      Object.keys(ACTIVITIES_DATABASE).forEach(cityId => {
        activities.push(...ACTIVITIES_DATABASE[cityId].activities);
      });
    } else {
      // Ciudad específica
      activities = getActivitiesByCity(this.currentFilters.city);
    }

    // Aplicar filtros
    let filtered = activities;

    // Filtro de categorías
    if (this.currentFilters.categories.length > 0) {
      filtered = filtered.filter(act => 
        this.currentFilters.categories.includes(act.category)
      );
    }

    // Filtro de horario
    if (this.currentFilters.timeOfDay !== 'all') {
      filtered = filtered.filter(act => 
        act.timeOfDay?.includes(this.currentFilters.timeOfDay)
      );
    }

    // Filtro de precio
    if (this.currentFilters.priceRange !== 'all') {
      filtered = filtered.filter(act => {
        const cost = act.cost || 0;
        switch (this.currentFilters.priceRange) {
          case 'free': return cost === 0;
          case 'budget': return cost > 0 && cost < 2000;
          case 'moderate': return cost >= 2000 && cost <= 5000;
          case 'expensive': return cost > 5000;
          default: return true;
        }
      });
    }

    // Filtro de búsqueda
    if (searchQuery) {
      filtered = filtered.filter(act =>
        act.name.toLowerCase().includes(searchQuery) ||
        act.description.toLowerCase().includes(searchQuery)
      );
    }

    // Ordenar
    filtered = this.sortActivities(filtered, this.currentFilters.sortBy);

    this.renderActivities(filtered);
  },

  sortActivities(activities, sortBy) {
    const sorted = [...activities];
    
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'price-low':
        return sorted.sort((a, b) => (a.cost || 0) - (b.cost || 0));
      case 'price-high':
        return sorted.sort((a, b) => (b.cost || 0) - (a.cost || 0));
      case 'duration':
        return sorted.sort((a, b) => (a.duration || 0) - (b.duration || 0));
      default:
        return sorted;
    }
  },

  async fetchActivitiesFromAPI(cityId) {
    const grid = document.getElementById('activitiesGrid');
    const loading = document.getElementById('loadingResults');
    const noResults = document.getElementById('noResults');
    
    if (!grid) return;

    grid.classList.add('hidden');
    noResults.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
      const city = getCityById(cityId);
      if (!city) {
        throw new Error('Ciudad no encontrada');
      }

      // Usar Google Places API para buscar actividades
      const response = await apiRequest(
        API_ENDPOINTS.places.nearby(
          city.coordinates.lat,
          city.coordinates.lng,
          'tourist_attraction',
          10000
        )
      );

      const apiActivities = response.results.map(place => ({
        id: place.place_id,
        name: place.name,
        description: place.vicinity || 'Actividad turística',
        category: 'culture', // Por defecto
        rating: place.rating || 0,
        cost: 0, // Las APIs no siempre tienen precios
        duration: 120,
        location: place.geometry.location,
        photos: place.photos || [],
        isFromAPI: true,
        bookingUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
      }));

      this.renderActivities(apiActivities);
    } catch (error) {
      console.error('❌ Error fetching from API:', error);
      Notifications.warning('No se pudieron cargar actividades de APIs, usando datos locales');
      
      // Fallback a datos locales
      const activities = getActivitiesByCity(cityId);
      this.renderActivities(activities);
    } finally {
      loading.classList.add('hidden');
      grid.classList.remove('hidden');
    }
  },

  renderActivities(activities) {
    const grid = document.getElementById('activitiesGrid');
    const noResults = document.getElementById('noResults');
    const count = document.getElementById('resultsCount');

    if (!grid) return;

    count.textContent = activities.length;

    if (activities.length === 0) {
      grid.classList.add('hidden');
      noResults.classList.remove('hidden');
      return;
    }

    grid.classList.remove('hidden');
    noResults.classList.add('hidden');

    grid.innerHTML = activities.map(activity => {
      const categoryData = CATEGORIES.find(c => c.id === activity.category);
      const costText = activity.cost === 0 ? 'Gratis' : `¥${activity.cost.toLocaleString()}`;
      const duration = activity.duration ? `${activity.duration} min` : '';
      const hasBooking = activity.bookingUrl || activity.isFromAPI;

      return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Header -->
          <div class="p-4 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-2xl flex-shrink-0">${categoryData?.icon || '📍'}</span>
                <div class="min-w-0 flex-1">
                  <h3 class="font-bold text-sm dark:text-white line-clamp-1">${activity.name}</h3>
                  <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${activity.rating ? `<span>⭐ ${activity.rating}</span>` : ''}
                    ${duration ? `<span>⏱️ ${duration}</span>` : ''}
                  </div>
                </div>
              </div>
              <span class="text-xs font-bold px-2 py-1 rounded ${
                activity.cost === 0 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              } flex-shrink-0">
                ${costText}
              </span>
            </div>
          </div>

          <!-- Body -->
          <div class="p-4">
            <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              ${activity.description}
            </p>

            <div class="space-y-2 text-xs text-gray-500 dark:text-gray-500">
              ${activity.station ? `
                <div class="flex items-center gap-1">
                  <span>🚉</span>
                  <span>${activity.station}</span>
                </div>
              ` : ''}
              
              ${activity.requiresReservation ? `
                <div class="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
                  ⚠️ Requiere reserva
                </div>
              ` : ''}

              ${hasBooking ? `
                <div class="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded flex items-center gap-1">
                  <span>✅</span>
                  <span>Reserva disponible</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Footer -->
          <div class="p-3 bg-gray-50 dark:bg-gray-900/50 flex gap-2">
            <button 
              onclick="ActivityBrowser.addActivityToDay(${this.currentDayNumber}, '${activity.id}')"
              class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-xs font-semibold"
            >
              ➕ Agregar
            </button>
            ${hasBooking ? `
              <button 
                onclick="window.open('${activity.bookingUrl || `https://www.google.com/search?q=${encodeURIComponent(activity.name + ' booking')}`}', '_blank')"
                class="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition text-xs font-semibold"
              >
                🔗 Reservar
              </button>
            ` : ''}
            <button 
              onclick="ActivityBrowser.showActivityDetails('${activity.id}')"
              class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-xs font-semibold"
            >
              ℹ️
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async addActivityToDay(dayNumber, activityId) {
    try {
      const tripId = window.TripsManager?.currentTrip?.id;
      if (!tripId) {
        Notifications.error('No hay viaje seleccionado');
        return;
      }

      // Buscar la actividad
      let activity = null;
      for (const cityId in ACTIVITIES_DATABASE) {
        const found = ACTIVITIES_DATABASE[cityId].activities.find(a => a.id === activityId);
        if (found) {
          activity = { ...found };
          break;
        }
      }

      if (!activity) {
        Notifications.error('Actividad no encontrada');
        return;
      }

      // Cargar itinerario
      const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerario');
      const itinerarySnap = await getDoc(itineraryRef);
      
      if (!itinerarySnap.exists()) {
        Notifications.error('No se encontró el itinerario');
        return;
      }

      const itinerary = itinerarySnap.data();
      const day = itinerary.days.find(d => d.day === dayNumber);
      
      if (!day) {
        Notifications.error('No se encontró el día');
        return;
      }

      // Verificar si ya existe
      if (day.activities.find(a => a.id === activityId)) {
        Notifications.warning('Esta actividad ya está en el día');
        return;
      }

      // Formatear actividad
      const newActivity = {
        id: activity.id,
        title: activity.name,
        desc: activity.description,
        time: '09:00',
        duration: activity.duration || 60,
        icon: CATEGORIES.find(c => c.id === activity.category)?.icon || '📍',
        cost: activity.cost || 0,
        station: activity.station || '',
        category: activity.category,
        bookingUrl: activity.bookingUrl || ''
      };

      // Agregar
      day.activities.push(newActivity);

      // Recalcular horarios
      if (window.DragDropManager?.recalculateTimes) {
        window.DragDropManager.recalculateTimes(day.activities);
      }

      // Guardar
      await updateDoc(itineraryRef, { days: itinerary.days });

      Notifications.success(`✨ ${activity.name} agregado al Día ${dayNumber}!`);
      
      // Re-renderizar
      if (window.ItineraryHandler?.reinitialize) {
        await window.ItineraryHandler.reinitialize();
      }

    } catch (error) {
      console.error('❌ Error:', error);
      Notifications.error('Error al agregar actividad');
    }
  },

  showActivityDetails(activityId) {
    let activity = null;
    for (const cityId in ACTIVITIES_DATABASE) {
      const found = ACTIVITIES_DATABASE[cityId].activities.find(a => a.id === activityId);
      if (found) {
        activity = found;
        break;
      }
    }

    if (!activity) return;

    const categoryData = CATEGORIES.find(c => c.id === activity.category);
    const bookingLink = activity.bookingUrl ? 
      `<a href="${activity.bookingUrl}" target="_blank" class="text-blue-600 hover:underline">🔗 Reservar aquí</a>` : 
      '';

    Notifications.info(`
      <div class="text-left max-w-md">
        <div class="text-3xl mb-2">${categoryData?.icon || '📍'}</div>
        <h3 class="font-bold text-lg mb-2">${activity.name}</h3>
        <p class="text-sm mb-3">${activity.description}</p>
        <div class="space-y-1 text-xs">
          ${activity.rating ? `<p>⭐ Rating: ${activity.rating}/5</p>` : ''}
          ${activity.duration ? `<p>⏱️ Duración: ~${activity.duration} min</p>` : ''}
          ${activity.cost ? `<p>💰 Costo: ¥${activity.cost.toLocaleString()}</p>` : '<p>💰 Gratis</p>'}
          ${activity.station ? `<p>🚉 Estación: ${activity.station}</p>` : ''}
          ${bookingLink ? `<p class="mt-2">${bookingLink}</p>` : ''}
        </div>
      </div>
    `, 8000);
  },

  closeBrowser() {
    const modal = document.getElementById('activityBrowserModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
    
    // Reset
    this.currentFilters = {
      city: 'all',
      categories: [],
      timeOfDay: 'all',
      priceRange: 'all',
      sortBy: 'rating'
    };
    this.currentDayNumber = null;
  }
};

// Init
ActivityBrowser.init();
window.ActivityBrowser = ActivityBrowser;
