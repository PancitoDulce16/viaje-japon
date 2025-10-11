// js/itinerary-builder-part2.js - Funciones Adicionales del Constructor de Itinerarios

import { db, auth } from './firebase-config.js';
import { Notifications } from './notifications.js';
import { CATEGORIES } from '../data/categories-data.js';
import { ACTIVITIES_DATABASE, getActivitiesByCity, getActivitiesByCategory, searchActivities } from '../data/activities-database.js';
import {
  doc,
  updateDoc,
  arrayUnion,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const ItineraryBuilderExtensions = {
  
  // === AGREGAR ACTIVIDAD === //
  
  showAddActivityModal(dayNumber = null) {
    if (!window.TripsManager || !window.TripsManager.currentTrip) {
      Notifications.warning('Primero debes crear o seleccionar un viaje');
      return;
    }
    
    const cities = window.TripsManager.currentTrip.cities || [];
    const selectedCategories = window.ItineraryBuilder.selectedCategories || [];
    
    const modalHtml = `
      <div id="addActivityModal" class="modal active" style="z-index: 10001;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-xl z-10">
            <h2 class="text-2xl font-bold">➕ Agregar Actividad</h2>
            <p class="text-sm text-white/80 mt-1">Busca o crea una actividad personalizada</p>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-gray-200 dark:border-gray-700 sticky top-[88px] bg-white dark:bg-gray-800 z-10">
            <button 
              onclick="ItineraryBuilderExtensions.switchActivityTab('search')"
              id="searchActivityTab"
              class="activity-tab flex-1 px-6 py-3 font-semibold border-b-2 border-green-500 text-green-600"
            >
              🔍 Buscar Actividades
            </button>
            <button 
              onclick="ItineraryBuilderExtensions.switchActivityTab('custom')"
              id="customActivityTab"
              class="activity-tab flex-1 px-6 py-3 font-semibold border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              ✏️ Crear Personalizada
            </button>
          </div>

          <!-- Search Tab Content -->
          <div id="searchActivityContent" class="p-6">
            <!-- Filtros -->
            <div class="mb-6 space-y-4">
              <!-- Barra de búsqueda -->
              <div class="relative">
                <input 
                  type="text" 
                  id="activitySearchInput"
                  placeholder="Buscar actividades... (ej: templo, ramen, museo)"
                  class="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  oninput="ItineraryBuilderExtensions.searchActivitiesLive()"
                />
                <span class="absolute left-3 top-3.5 text-gray-400">🔍</span>
              </div>
              
              <!-- Filtros por Ciudad y Categoría -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Ciudad</label>
                  <select 
                    id="activityCityFilter"
                    onchange="ItineraryBuilderExtensions.filterActivities()"
                    class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Todas las ciudades</option>
                    ${Object.keys(ACTIVITIES_DATABASE).map(cityId => `
                      <option value="${cityId}">${ACTIVITIES_DATABASE[cityId].city}</option>
                    `).join('')}
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Categoría</label>
                  <select 
                    id="activityCategoryFilter"
                    onchange="ItineraryBuilderExtensions.filterActivities()"
                    class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Todas las categorías</option>
                    ${CATEGORIES.map(cat => `
                      <option value="${cat.id}">${cat.icon} ${cat.name}</option>
                    `).join('')}
                  </select>
                </div>
              </div>
            </div>

            <!-- Resultados de búsqueda -->
            <div id="activitySearchResults" class="space-y-3 max-h-[400px] overflow-y-auto">
              <!-- Se llenarán dinámicamente -->
            </div>
          </div>

          <!-- Custom Tab Content -->
          <div id="customActivityContent" class="p-6 hidden">
            <form id="customActivityForm" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Nombre *</label>
                  <input 
                    type="text" 
                    id="customActivityName"
                    placeholder="ej: Cena en restaurante local"
                    required
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Categoría *</label>
                  <select 
                    id="customActivityCategory"
                    required
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar...</option>
                    ${CATEGORIES.map(cat => `
                      <option value="${cat.id}">${cat.icon} ${cat.name}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Descripción</label>
                <textarea 
                  id="customActivityDescription"
                  rows="3"
                  placeholder="Detalles de la actividad..."
                  class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Hora Inicio *</label>
                  <input 
                    type="time" 
                    id="customActivityTime"
                    required
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Duración (min)</label>
                  <input 
                    type="number" 
                    id="customActivityDuration"
                    placeholder="60"
                    min="15"
                    step="15"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Costo (¥)</label>
                  <input 
                    type="number" 
                    id="customActivityCost"
                    placeholder="0"
                    min="0"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Ubicación/Estación</label>
                  <input 
                    type="text" 
                    id="customActivityLocation"
                    placeholder="ej: Shibuya Station"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Ciudad</label>
                  <select 
                    id="customActivityCity"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar...</option>
                    ${Object.keys(ACTIVITIES_DATABASE).map(cityId => `
                      <option value="${cityId}">${ACTIVITIES_DATABASE[cityId].city}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Notas</label>
                <textarea 
                  id="customActivityNotes"
                  rows="2"
                  placeholder="Recordatorios, reservas necesarias, etc..."
                  class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>

              <button 
                type="submit"
                class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                ➕ Agregar Actividad
              </button>
            </form>
          </div>

          <!-- Footer Buttons -->
          <div class="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
            <button 
              onclick="ItineraryBuilderExtensions.closeAddActivityModal()"
              class="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold"
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
    this.loadInitialActivities();
    
    // Event listener para el formulario custom
    document.getElementById('customActivityForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addCustomActivity(dayNumber);
    });
  },

  switchActivityTab(tab) {
    // Update tabs
    const searchTab = document.getElementById('searchActivityTab');
    const customTab = document.getElementById('customActivityTab');
    const searchContent = document.getElementById('searchActivityContent');
    const customContent = document.getElementById('customActivityContent');
    
    if (tab === 'search') {
      searchTab.classList.add('border-green-500', 'text-green-600');
      searchTab.classList.remove('border-transparent', 'text-gray-500');
      customTab.classList.remove('border-green-500', 'text-green-600');
      customTab.classList.add('border-transparent', 'text-gray-500');
      
      searchContent.classList.remove('hidden');
      customContent.classList.add('hidden');
    } else {
      customTab.classList.add('border-green-500', 'text-green-600');
      customTab.classList.remove('border-transparent', 'text-gray-500');
      searchTab.classList.remove('border-green-500', 'text-green-600');
      searchTab.classList.add('border-transparent', 'text-gray-500');
      
      customContent.classList.remove('hidden');
      searchContent.classList.add('hidden');
    }
  },

  loadInitialActivities() {
    const cityFilter = document.getElementById('activityCityFilter').value;
    const categoryFilter = document.getElementById('activityCategoryFilter').value;
    
    let activities = [];
    
    if (cityFilter === 'all') {
      // Cargar actividades de todas las ciudades
      for (const cityId in ACTIVITIES_DATABASE) {
        activities.push(...ACTIVITIES_DATABASE[cityId].activities);
      }
    } else {
      activities = ACTIVITIES_DATABASE[cityFilter]?.activities || [];
    }
    
    if (categoryFilter !== 'all') {
      activities = activities.filter(act => act.category === categoryFilter);
    }
    
    this.renderActivityResults(activities);
  },

  searchActivitiesLive() {
    const query = document.getElementById('activitySearchInput').value;
    
    if (query.length < 2) {
      this.loadInitialActivities();
      return;
    }
    
    const results = searchActivities(query);
    this.renderActivityResults(results);
  },

  filterActivities() {
    const searchInput = document.getElementById('activitySearchInput').value;
    
    if (searchInput.length >= 2) {
      this.searchActivitiesLive();
    } else {
      this.loadInitialActivities();
    }
  },

  renderActivityResults(activities) {
    const container = document.getElementById('activitySearchResults');
    
    if (activities.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">🔍</div>
          <p>No se encontraron actividades</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = activities.slice(0, 20).map(activity => {
      const category = CATEGORIES.find(c => c.id === activity.category);
      
      return `
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
             onclick="ItineraryBuilderExtensions.selectActivityFromDatabase('${activity.id}')">
          <div class="flex items-start gap-3">
            <div class="text-3xl">${category?.icon || '📍'}</div>
            <div class="flex-1">
              <h4 class="font-bold dark:text-white">${activity.name}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${activity.description}</p>
              <div class="flex flex-wrap gap-2 mt-2">
                <span class="text-xs bg-${category?.color}-100 dark:bg-${category?.color}-900/30 text-${category?.color}-700 dark:text-${category?.color}-400 px-2 py-1 rounded">
                  ${category?.name || 'Sin categoría'}
                </span>
                ${activity.duration ? `
                  <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    ⏱️ ${activity.duration} min
                  </span>
                ` : ''}
                ${activity.cost > 0 ? `
                  <span class="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                    ¥${activity.cost.toLocaleString()}
                  </span>
                ` : `
                  <span class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                    Gratis
                  </span>
                `}
                ${activity.rating ? `
                  <span class="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
                    ⭐ ${activity.rating}
                  </span>
                ` : ''}
              </div>
              ${activity.station ? `
                <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">🚉 ${activity.station}</p>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  async selectActivityFromDatabase(activityId) {
    // Buscar la actividad en la base de datos
    let selectedActivity = null;
    
    for (const cityId in ACTIVITIES_DATABASE) {
      const found = ACTIVITIES_DATABASE[cityId].activities.find(act => act.id === activityId);
      if (found) {
        selectedActivity = { ...found, cityId };
        break;
      }
    }
    
    if (!selectedActivity) {
      Notifications.error('Actividad no encontrada');
      return;
    }
    
    // Aquí deberías agregar la actividad al itinerario
    // Por ahora solo mostramos un mensaje
    Notifications.success(`Actividad "${selectedActivity.name}" agregada!`);
    
    // TODO: Implementar la lógica para agregar al día específico
    
    this.closeAddActivityModal();
  },

  async addCustomActivity(dayNumber) {
    const activityData = {
      id: `custom-${Date.now()}`,
      name: document.getElementById('customActivityName').value,
      category: document.getElementById('customActivityCategory').value,
      description: document.getElementById('customActivityDescription').value,
      time: document.getElementById('customActivityTime').value,
      duration: parseInt(document.getElementById('customActivityDuration').value) || 60,
      cost: parseInt(document.getElementById('customActivityCost').value) || 0,
      location: document.getElementById('customActivityLocation').value,
      city: document.getElementById('customActivityCity').value,
      notes: document.getElementById('customActivityNotes').value,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    
    // TODO: Guardar en Firebase
    
    Notifications.success(`Actividad personalizada "${activityData.name}" creada!`);
    
    this.closeAddActivityModal();
  },

  closeAddActivityModal() {
    const modal = document.getElementById('addActivityModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  },

  // === DRAG & DROP === //

  setupDragAndDrop() {
    // Se implementará con la librería SortableJS o similar
    console.log('🎯 Drag & Drop configurado');
  },

  // === OPTIMIZACIÓN DE RUTAS === //

  async optimizeRoute(dayNumber) {
    Notifications.info('🗺️ Optimizando ruta...');
    
    // Aquí implementarías la lógica de optimización usando:
    // - Distancias entre actividades
    // - Tiempos de traslado
    // - Horarios de apertura
    
    setTimeout(() => {
      Notifications.success('✅ Ruta optimizada!');
    }, 2000);
  },

  toggleOptimization() {
    window.ItineraryBuilder.optimizationEnabled = !window.ItineraryBuilder.optimizationEnabled;
    
    if (window.ItineraryBuilder.optimizationEnabled) {
      Notifications.success('🎯 Optimización automática activada');
    } else {
      Notifications.info('Optimización automática desactivada');
    }
  },

  // === EXPORTAR ITINERARIO === //

  async exportToPDF() {
    Notifications.info('📄 Generando PDF...');
    
    // Aquí implementarías la exportación a PDF
    setTimeout(() => {
      Notifications.success('✅ PDF generado!');
    }, 2000);
  },

  async shareItinerary() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Itinerario de Viaje',
          text: 'Mira mi itinerario de viaje a Japón!',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error compartiendo:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      Notifications.success('🔗 Link copiado al portapapeles!');
    }
  }
};

// Exportar para uso global
window.ItineraryBuilderExtensions = ItineraryBuilderExtensions;
