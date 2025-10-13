// js/itinerary-builder.js - Sistema Completo de Construcción de Itinerarios

import { db, auth } from './firebase-config.js';
import { Notifications } from './notifications.js';
import { CATEGORIES, TEMPLATES } from '../data/categories-data.js';
import { ACTIVITIES_DATABASE, getActivitiesByCity, getActivitiesByCategory } from '../data/activities-database.js';
import { AIRLINES, AIRPORTS, getAirlineByCode, getAirportByCode } from '../data/airlines-data.js';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  deleteField
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const ItineraryBuilder = {
  currentItinerary: null,
  selectedCategories: [],
  selectedTemplate: null,
  cities: [],
  flights: [],
  activities: [],
  draggedItem: null,
  optimizationEnabled: false,

  // === INICIALIZACIÓN === //

  init() {
    console.log('🎨 Inicializando Itinerary Builder...');
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Listeners para drag and drop se configuran dinámicamente
    document.addEventListener('click', (e) => {
      // Botón de agregar actividad
      if (e.target.closest('.add-activity-btn')) {
        this.showAddActivityModal();
      }

      // Botón de editar actividad
      if (e.target.closest('.edit-activity-btn')) {
        const activityId = e.target.closest('.edit-activity-btn').dataset.activityId;
        this.editActivity(activityId);
      }

      // Botón de eliminar actividad
      if (e.target.closest('.delete-activity-btn')) {
        const activityId = e.target.closest('.delete-activity-btn').dataset.activityId;
        this.deleteActivity(activityId);
      }

      // Botón de optimizar ruta
      if (e.target.closest('.optimize-route-btn')) {
        this.toggleOptimization();
      }

      // Botón de agregar vuelo
      if (e.target.closest('.add-flight-btn')) {
        this.showAddFlightModal();
      }
    });
  },

  // === CREACIÓN DE ITINERARIO === //

  shouldCreateTrip: false, // Flag to indicate if wizard should create trip

  async showCreateItineraryWizard(createTripFlag = false) {
    this.shouldCreateTrip = createTripFlag;
    console.log('🎨 Opening wizard with createTripFlag:', createTripFlag);

    const modalHtml = `
      <div id="createItineraryWizard" class="modal active" style="z-index: 10001;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-xl z-10">
            <h2 class="text-3xl font-bold flex items-center gap-3">
              ✈️ Crear Nuevo Itinerario
            </h2>
            <p class="text-sm text-white/80 mt-2">Paso a paso para planear tu viaje perfecto</p>
          </div>

          <!-- Steps Container -->
          <div class="p-6">
            <!-- Step Indicator -->
            <div class="flex items-center justify-center mb-8">
              <div class="flex items-center gap-2">
                <div class="wizard-step active" data-step="1">
                  <div class="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">1</div>
                  <span class="text-xs mt-1">Básico</span>
                </div>
                <div class="w-8 h-1 bg-gray-300"></div>
                <div class="wizard-step" data-step="2">
                  <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">2</div>
                  <span class="text-xs mt-1">Ciudades</span>
                </div>
                <div class="w-8 h-1 bg-gray-300"></div>
                <div class="wizard-step" data-step="3">
                  <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">3</div>
                  <span class="text-xs mt-1">Vuelos</span>
                </div>
                <div class="w-8 h-1 bg-gray-300"></div>
                <div class="wizard-step" data-step="4">
                  <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">4</div>
                  <span class="text-xs mt-1">Intereses</span>
                </div>
                <div class="w-8 h-1 bg-gray-300"></div>
                <div class="wizard-step" data-step="5">
                  <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">5</div>
                  <span class="text-xs mt-1">Plantilla</span>
                </div>
              </div>
            </div>

            <!-- Step 1: Información Básica -->
            <div id="wizardStep1" class="wizard-content">
              <h3 class="text-xl font-bold mb-4 dark:text-white">📋 Información Básica</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Comienza con la información fundamental de tu viaje
              </p>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Nombre del Viaje *</label>
                  <input
                    type="text"
                    id="itineraryName"
                    placeholder="ej: Viaje a Japón 2026"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Fecha Inicio *</label>
                    <input
                      type="date"
                      id="itineraryStartDate"
                      class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Fecha Fin *</label>
                    <input
                      type="date"
                      id="itineraryEndDate"
                      class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p class="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>Siguiente paso:</strong> Seleccionarás las ciudades que visitarás y asignarás cuántos días pasarás en cada una
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 2: Itinerario por Fechas -->
            <div id="wizardStep2" class="wizard-content hidden">
              <h3 class="text-xl font-bold mb-4 dark:text-white">📅 Itinerario por Fechas</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Selecciona qué ciudad visitarás cada día de tu viaje. Puedes repetir ciudades cuantas veces quieras.
              </p>

              <div id="cityByDateContainer" class="space-y-2 max-h-[500px] overflow-y-auto">
                <!-- Este contenedor se llenará dinámicamente cuando el usuario avance desde el Paso 1 -->
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Las fechas aparecerán aquí automáticamente...</p>
                </div>
              </div>

              <div class="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p class="text-sm text-blue-800 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Puedes visitar una ciudad múltiples veces. Por ejemplo: Tokyo → Kyoto → Osaka → Tokyo
                </p>
              </div>
            </div>

            <!-- Step 3: Vuelos -->
            <div id="wizardStep3" class="wizard-content hidden">
              <h3 class="text-xl font-bold mb-4 dark:text-white">✈️ Información de Vuelos (Opcional)</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Puedes agregar tus vuelos ahora o hacerlo más tarde desde la sección de vuelos
              </p>
              <div class="space-y-6">
                <!-- Vuelo de Ida -->
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 class="font-bold mb-3 dark:text-white flex items-center gap-2">
                    <span>🛫</span> Vuelo de Ida
                  </h4>
                  <div class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Aerolínea</label>
                        <select id="outboundAirline" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm">
                          <option value="">Seleccionar...</option>
                          ${AIRLINES.map(airline => `
                            <option value="${airline.id}">${airline.logo} ${airline.name}</option>
                          `).join('')}
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Número de Vuelo</label>
                        <input type="text" id="outboundFlightNumber" placeholder="ej: AM58" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
                      </div>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                      <div>
                        <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Origen</label>
                        <input type="text" id="outboundOrigin" placeholder="ej: MEX" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
                      </div>
                      <div>
                        <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Destino</label>
                        <input type="text" id="outboundDestination" placeholder="ej: NRT" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
                      </div>
                      <div>
                        <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Fecha/Hora</label>
                        <input type="datetime-local" id="outboundDateTime" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
                      </div>
                    </div>
                    
                    <!-- Vuelos de Conexión (Ida) -->
                    <div id="outboundConnections" class="space-y-2"></div>
                    <button type="button" onclick="ItineraryBuilder.addConnectionFlight('outbound')" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      + Agregar Conexión
                    </button>
                  </div>
                </div>

                <!-- Vuelo de Regreso -->
                <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 class="font-bold mb-3 dark:text-white flex items-center gap-2">
                    <span>🛬</span> Vuelo de Regreso
                  </h4>
                  <div class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Aerolínea</label>
                        <select id="returnAirline" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm">
                          <option value="">Seleccionar...</option>
                          ${AIRLINES.map(airline => `
                            <option value="${airline.id}">${airline.logo} ${airline.name}</option>
                          `).join('')}
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Número de Vuelo</label>
                        <input type="text" id="returnFlightNumber" placeholder="ej: AM57" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
                      </div>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                      <div>
                        <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Origen</label>
                        <input type="text" id="returnOrigin" placeholder="ej: NRT" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
                      </div>
                      <div>
                        <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Destino</label>
                        <input type="text" id="returnDestination" placeholder="ej: MEX" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
                      </div>
                      <div>
                        <label class="block text-sm font-semibold mb-1 dark:text-gray-300">Fecha/Hora</label>
                        <input type="datetime-local" id="returnDateTime" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
                      </div>
                    </div>
                    
                    <!-- Vuelos de Conexión (Regreso) -->
                    <div id="returnConnections" class="space-y-2"></div>
                    <button type="button" onclick="ItineraryBuilder.addConnectionFlight('return')" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      + Agregar Conexión
                    </button>
                  </div>
                </div>

                <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p class="text-sm text-yellow-800 dark:text-yellow-300">
                    💡 <strong>Tip:</strong> Puedes agregar vuelos de conexión si tu viaje incluye escalas
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 4: Categorías de Interés -->
            <div id="wizardStep4" class="wizard-content hidden">
              <h3 class="text-xl font-bold mb-4 dark:text-white">🎯 ¿Qué te interesa hacer?</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Selecciona tus intereses para recibir sugerencias personalizadas
              </p>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                ${CATEGORIES.map(cat => `
                  <label class="category-card cursor-pointer border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-${cat.color}-500 hover:bg-${cat.color}-50 dark:hover:bg-${cat.color}-900/20 transition">
                    <input type="checkbox" name="categories" value="${cat.id}" class="hidden category-checkbox" />
                    <div class="text-center">
                      <div class="text-4xl mb-2">${cat.icon}</div>
                      <div class="font-bold text-sm dark:text-white">${cat.name}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${cat.description}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Step 5: Plantillas -->
            <div id="wizardStep5" class="wizard-content hidden">
              <h3 class="text-xl font-bold mb-4 dark:text-white">📋 Elige una Plantilla</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                O comienza desde cero y agrega actividades manualmente
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Opción: Desde Cero -->
                <label class="template-card cursor-pointer border-2 border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                  <input type="radio" name="template" value="blank" class="hidden template-radio" />
                  <div class="text-center">
                    <div class="text-5xl mb-3">📝</div>
                    <div class="font-bold text-lg dark:text-white">Desde Cero</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Crea tu itinerario personalizado desde el inicio
                    </div>
                  </div>
                </label>

                <!-- Plantillas Predefinidas -->
                ${TEMPLATES.map(template => `
                  <label class="template-card cursor-pointer border-2 border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-${template.color}-500 hover:bg-${template.color}-50 dark:hover:bg-${template.color}-900/20 transition">
                    <input type="radio" name="template" value="${template.id}" class="hidden template-radio" />
                    <div class="text-center">
                      <div class="text-5xl mb-3">${template.icon}</div>
                      <div class="font-bold text-lg dark:text-white">${template.name}</div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 mt-2">${template.description}</div>
                      <div class="flex flex-wrap gap-1 justify-center mt-3">
                        ${template.categories.map(catId => {
                          const cat = CATEGORIES.find(c => c.id === catId);
                          return `<span class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">${cat?.icon} ${cat?.name}</span>`;
                        }).join('')}
                      </div>
                      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Ritmo: <strong>${template.pace === 'relaxed' ? '🐢 Relajado' : template.pace === 'moderate' ? '🚶 Moderado' : '🏃 Intenso'}</strong>
                      </div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button 
                type="button"
                id="wizardPrevBtn"
                onclick="ItineraryBuilder.previousWizardStep()"
                class="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold hidden"
              >
                ← Anterior
              </button>
              <div class="flex gap-3 ml-auto">
                <button
                  type="button"
                  onclick="ItineraryBuilder.closeCreateItineraryWizard()"
                  class="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id="skipFlightsBtn"
                  onclick="ItineraryBuilder.nextWizardStep()"
                  class="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold hidden"
                >
                  Omitir (agregar después) →
                </button>
                <button
                  type="button"
                  id="wizardNextBtn"
                  onclick="ItineraryBuilder.nextWizardStep()"
                  class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-semibold"
                >
                  Siguiente →
                </button>
                <button
                  type="button"
                  id="wizardFinishBtn"
                  onclick="ItineraryBuilder.finishWizard()"
                  class="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition font-semibold hidden"
                >
                  ✨ Crear Itinerario
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    // Setup category selection visual feedback
    this.setupCategorySelection();
    this.setupTemplateSelection();
  },

  setupCategorySelection() {
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', function() {
        const checkbox = this.querySelector('.category-checkbox');
        checkbox.checked = !checkbox.checked;
        
        if (checkbox.checked) {
          this.classList.add('selected');
          this.style.borderColor = 'rgb(168, 85, 247)'; // purple-500
          this.style.backgroundColor = 'rgb(250, 245, 255)'; // purple-50
        } else {
          this.classList.remove('selected');
          this.style.borderColor = '';
          this.style.backgroundColor = '';
        }
      });
    });
  },

  setupTemplateSelection() {
    document.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', function() {
        // Deselect all
        document.querySelectorAll('.template-card').forEach(c => {
          c.classList.remove('selected');
          c.style.borderColor = '';
          c.style.backgroundColor = '';
        });
        
        // Select this one
        const radio = this.querySelector('.template-radio');
        radio.checked = true;
        this.classList.add('selected');
        this.style.borderColor = 'rgb(59, 130, 246)'; // blue-500
        this.style.backgroundColor = 'rgb(239, 246, 255)'; // blue-50
      });
    });
  },

  addConnectionFlight(type) {
    const container = document.getElementById(`${type}Connections`);
    const connectionId = `${type}-connection-${Date.now()}`;

    const html = `
      <div id="${connectionId}" class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg space-y-2">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold dark:text-white">Conexión</span>
          <button onclick="document.getElementById('${connectionId}').remove()" class="text-red-500 hover:text-red-700 text-xs">
            ✕ Eliminar
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Aerolínea</label>
            <select class="connection-airline w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white text-xs">
              <option value="">Seleccionar...</option>
              ${AIRLINES.map(airline => `
                <option value="${airline.id}">${airline.logo} ${airline.name}</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Número de Vuelo</label>
            <input type="text" class="connection-flight-number w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white text-xs" placeholder="ej: AA123" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Origen</label>
            <input type="text" class="connection-origin w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white text-xs" placeholder="LAX" />
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Destino</label>
            <input type="text" class="connection-destination w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white text-xs" placeholder="NRT" />
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Fecha/Hora</label>
            <input type="datetime-local" class="connection-datetime w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white text-xs" />
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
  },

  // === DATE-CITY ASSIGNMENT (NEW SYSTEM) === //

  generateDateCitySelector() {
    const startDate = document.getElementById('itineraryStartDate').value;
    const endDate = document.getElementById('itineraryEndDate').value;

    if (!startDate || !endDate) {
      console.error('Start or end date missing');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    let current = new Date(start);

    // Generate all dates
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Build city options HTML
    const cityOptions = Object.keys(ACTIVITIES_DATABASE).map(cityId => {
      const cityData = ACTIVITIES_DATABASE[cityId];
      return `<option value="${cityId}">${cityData.city}</option>`;
    }).join('');

    // Generate HTML for each date
    const container = document.getElementById('cityByDateContainer');
    container.innerHTML = dates.map((date, index) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'short' });
      const dayMonth = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      const dayNumber = index + 1;

      return `
        <div class="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 hover:shadow-md transition">
          <div class="flex-shrink-0 text-center w-20">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">${dayOfWeek}</div>
            <div class="text-lg font-bold dark:text-white">Día ${dayNumber}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">${dayMonth}</div>
          </div>
          <div class="flex-1">
            <select
              id="city-date-${dayNumber}"
              data-date="${dateStr}"
              data-day="${dayNumber}"
              class="city-date-selector w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white font-semibold"
            >
              <option value="">-- Selecciona una ciudad --</option>
              ${cityOptions}
            </select>
          </div>
          ${dayNumber > 1 ? `
          <button
            type="button"
            onclick="ItineraryBuilder.copyPreviousDay(${dayNumber})"
            class="flex-shrink-0 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
            title="Copiar ciudad del día anterior"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
            </svg>
          </button>
          ` : ''}
        </div>
      `;
    }).join('');

    console.log(`✅ Generated ${dates.length} date selectors`);
  },

  copyPreviousDay(dayNumber) {
    const previousSelect = document.getElementById(`city-date-${dayNumber - 1}`);
    const currentSelect = document.getElementById(`city-date-${dayNumber}`);

    if (previousSelect && currentSelect && previousSelect.value) {
      currentSelect.value = previousSelect.value;
      // Visual feedback
      currentSelect.classList.add('bg-blue-50', 'dark:bg-blue-900/30');
      setTimeout(() => {
        currentSelect.classList.remove('bg-blue-50', 'dark:bg-blue-900/30');
      }, 500);
    }
  },

  // === CITY/DAY ASSIGNMENT HELPERS (OLD SYSTEM - DEPRECATED) === //

  toggleCityDayAssignment(cityId) {
    const checkbox = document.getElementById(`city-${cityId}`);
    const daysSection = document.getElementById(`days-${cityId}`);

    if (checkbox.checked) {
      daysSection.classList.remove('hidden');
    } else {
      daysSection.classList.add('hidden');
      // Reset inputs when unchecked
      const oneDayCheckbox = daysSection.querySelector('.one-day-checkbox');
      if (oneDayCheckbox) oneDayCheckbox.checked = false;
      daysSection.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
      document.getElementById(`multiday-${cityId}`).classList.remove('hidden');
      document.getElementById(`oneday-${cityId}`).classList.add('hidden');
    }
  },

  toggleOneDayVisit(cityId) {
    const oneDayCheckbox = document.querySelector(`#days-${cityId} .one-day-checkbox`);
    const multiDaySection = document.getElementById(`multiday-${cityId}`);
    const oneDaySection = document.getElementById(`oneday-${cityId}`);

    if (oneDayCheckbox.checked) {
      // Show single day, hide multi-day
      multiDaySection.classList.add('hidden');
      oneDaySection.classList.remove('hidden');
      // Clear multi-day inputs
      multiDaySection.querySelectorAll('input').forEach(input => input.value = '');
    } else {
      // Show multi-day, hide single day
      multiDaySection.classList.remove('hidden');
      oneDaySection.classList.add('hidden');
      // Clear single day input
      oneDaySection.querySelector('input').value = '';
    }
  },

  updateDayRange(cityId) {
    const daysCount = document.querySelector(`#multiday-${cityId} .city-days-count`).value;
    const dayStart = document.querySelector(`#multiday-${cityId} .city-day-start`);

    if (daysCount && dayStart.value) {
      const start = parseInt(dayStart.value);
      const count = parseInt(daysCount);
      const end = start + count - 1;

      const dayEnd = document.querySelector(`#multiday-${cityId} .city-day-end`);
      dayEnd.value = end;
    }
  },

  validateDayAssignment(cityId) {
    // Basic validation for day assignments
    // Can be extended with more complex logic
    console.log(`Validating day assignment for ${cityId}`);
  },

  // Navegación del Wizard
  currentStep: 1,

  nextWizardStep() {
    // Validación del paso actual
    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.currentStep < 5) {
      this.currentStep++;

      // 🔥 NUEVO: Si avanzamos al Paso 2, generar el selector de fechas
      if (this.currentStep === 2) {
        this.generateDateCitySelector();
      }

      this.updateWizardView();
    }
  },

  previousWizardStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateWizardView();
    }
  },

  validateCurrentStep() {
    if (this.currentStep === 1) {
      const name = document.getElementById('itineraryName').value;
      const startDate = document.getElementById('itineraryStartDate').value;
      const endDate = document.getElementById('itineraryEndDate').value;

      if (!name || !startDate || !endDate) {
        Notifications.warning('Por favor completa todos los campos obligatorios');
        return false;
      }

      if (new Date(endDate) <= new Date(startDate)) {
        Notifications.warning('La fecha de fin debe ser posterior a la fecha de inicio');
        return false;
      }
    }

    if (this.currentStep === 2) {
      // 🔥 NUEVO: Validar que todas las fechas tengan ciudad asignada
      const dateSelectors = document.querySelectorAll('.city-date-selector');
      const unassignedDates = [];

      dateSelectors.forEach(selector => {
        if (!selector.value || selector.value === '') {
          unassignedDates.push(selector.dataset.day);
        }
      });

      if (unassignedDates.length > 0) {
        Notifications.warning(`Por favor selecciona una ciudad para todos los días. Días sin asignar: ${unassignedDates.join(', ')}`);
        return false;
      }
    }

    // Step 3 (flights) is optional, no validation required

    return true;
  },

  updateWizardView() {
    // Ocultar todos los pasos
    document.querySelectorAll('.wizard-content').forEach(content => {
      content.classList.add('hidden');
    });
    
    // Mostrar paso actual
    document.getElementById(`wizardStep${this.currentStep}`).classList.remove('hidden');
    
    // Actualizar indicadores de paso
    document.querySelectorAll('.wizard-step').forEach((step, index) => {
      const stepNumber = index + 1;
      const circle = step.querySelector('div');
      
      if (stepNumber < this.currentStep) {
        circle.classList.remove('bg-gray-300', 'bg-purple-500');
        circle.classList.add('bg-green-500');
        circle.innerHTML = '✓';
      } else if (stepNumber === this.currentStep) {
        circle.classList.remove('bg-gray-300', 'bg-green-500');
        circle.classList.add('bg-purple-500');
        circle.innerHTML = stepNumber;
      } else {
        circle.classList.remove('bg-purple-500', 'bg-green-500');
        circle.classList.add('bg-gray-300');
        circle.innerHTML = stepNumber;
      }
    });
    
    // Mostrar/ocultar botones
    const prevBtn = document.getElementById('wizardPrevBtn');
    const nextBtn = document.getElementById('wizardNextBtn');
    const finishBtn = document.getElementById('wizardFinishBtn');
    
    if (this.currentStep === 1) {
      prevBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
    }

    if (this.currentStep === 5) {
      nextBtn.classList.add('hidden');
      finishBtn.classList.remove('hidden');
    } else {
      nextBtn.classList.remove('hidden');
      finishBtn.classList.add('hidden');
    }

    // Special handling for Step 3 (flights) - show skip button
    const skipFlightsBtn = document.getElementById('skipFlightsBtn');
    if (skipFlightsBtn) {
      if (this.currentStep === 3) {
        skipFlightsBtn.classList.remove('hidden');
      } else {
        skipFlightsBtn.classList.add('hidden');
      }
    }
  },

  async finishWizard() {
    // Recopilar todos los datos
    const data = {
      name: document.getElementById('itineraryName').value,
      startDate: document.getElementById('itineraryStartDate').value,
      endDate: document.getElementById('itineraryEndDate').value,

      // Collect cities with day assignments
      cityDayAssignments: this.getCityDayAssignments(),

      categories: Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(cb => cb.value),
      template: document.querySelector('input[name="template"]:checked')?.value || 'blank',

      // Vuelo de Ida
      outboundFlight: {
        airline: document.getElementById('outboundAirline')?.value || '',
        flightNumber: document.getElementById('outboundFlightNumber')?.value || '',
        origin: document.getElementById('outboundOrigin')?.value || '',
        destination: document.getElementById('outboundDestination')?.value || '',
        datetime: document.getElementById('outboundDateTime')?.value || '',
        connections: this.getConnectionFlights('outbound')
      },

      // Vuelo de Regreso
      returnFlight: {
        airline: document.getElementById('returnAirline')?.value || '',
        flightNumber: document.getElementById('returnFlightNumber')?.value || '',
        origin: document.getElementById('returnOrigin')?.value || '',
        destination: document.getElementById('returnDestination')?.value || '',
        datetime: document.getElementById('returnDateTime')?.value || '',
        connections: this.getConnectionFlights('return')
      }
    };

    console.log('📋 Datos del Itinerario:', data);

    // 🔥 NUEVO: Si shouldCreateTrip es true, crear el trip PRIMERO
    if (this.shouldCreateTrip) {
      console.log('🎯 Creating trip first...');

      if (!window.TripsManager) {
        Notifications.error('Error: TripsManager no está disponible');
        return;
      }

      try {
        // Create trip with basic data
        const tripData = {
          name: data.name,
          destination: 'Japón',
          dateStart: data.startDate,
          dateEnd: data.endDate, // ✅ Fixed: usando data.endDate
          useTemplate: true
        };

        console.log('🔍 Trip data being sent:', tripData);

        const tripId = await window.TripsManager.createTrip(tripData);

        if (tripId) {
          console.log('✅ Trip created successfully:', tripId);
          // Wait a moment for Firebase to propagate
          await new Promise(resolve => setTimeout(resolve, 800));
        } else {
          throw new Error('Trip creation did not return tripId');
        }
      } catch (error) {
        console.error('❌ Error creating trip:', error);
        Notifications.error('Error al crear el viaje. Inténtalo de nuevo.');
        return;
      }
    }

    // Crear itinerario
    await this.createItinerary(data);

    this.closeCreateItineraryWizard();
  },

  getCityDayAssignments() {
    // 🔥 NUEVO SISTEMA: Leer de los dropdowns por fecha
    const dateSelectors = document.querySelectorAll('.city-date-selector');
    const dayByDayAssignments = [];

    // Collect day-by-day assignments
    dateSelectors.forEach(selector => {
      const cityId = selector.value;
      const day = parseInt(selector.dataset.day);
      const date = selector.dataset.date;

      if (cityId) {
        dayByDayAssignments.push({
          day: day,
          date: date,
          cityId: cityId,
          cityName: ACTIVITIES_DATABASE[cityId].city
        });
      }
    });

    // Group consecutive days in the same city
    const assignments = [];
    let currentGroup = null;

    dayByDayAssignments.forEach(assignment => {
      if (!currentGroup || currentGroup.cityId !== assignment.cityId) {
        // Start new group
        if (currentGroup) {
          assignments.push(currentGroup);
        }
        currentGroup = {
          cityId: assignment.cityId,
          cityName: assignment.cityName,
          dayStart: assignment.day,
          dayEnd: assignment.day,
          daysCount: 1,
          type: 'multi-day'
        };
      } else {
        // Extend current group
        currentGroup.dayEnd = assignment.day;
        currentGroup.daysCount++;
      }
    });

    // Push last group
    if (currentGroup) {
      // Mark single-day visits
      if (currentGroup.daysCount === 1) {
        currentGroup.type = 'single-day';
        currentGroup.day = currentGroup.dayStart;
      }
      assignments.push(currentGroup);
    }

    console.log('📋 City day assignments:', assignments);
    return assignments;
  },

  getConnectionFlights(type) {
    const container = document.getElementById(`${type}Connections`);
    const connections = [];
    
    container.querySelectorAll('.bg-gray-100').forEach(connDiv => {
      connections.push({
        airline: connDiv.querySelector('.connection-airline').value,
        flightNumber: connDiv.querySelector('.connection-flight-number').value,
        origin: connDiv.querySelector('.connection-origin').value,
        destination: connDiv.querySelector('.connection-destination').value,
        datetime: connDiv.querySelector('.connection-datetime').value
      });
    });
    
    return connections;
  },

  closeCreateItineraryWizard() {
    const modal = document.getElementById('createItineraryWizard');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
    this.currentStep = 1;
  },

  // === CREAR ITINERARIO === //

  async createItinerary(data) {
    if (!auth.currentUser) {
      Notifications.warning('Debes iniciar sesión para crear un itinerario');
      return;
    }

    if (!window.TripsManager || !window.TripsManager.currentTrip) {
      Notifications.warning('Primero debes crear o seleccionar un viaje');
      return;
    }

    try {
      const tripId = window.TripsManager.currentTrip.id;

      // Generar días basados en fechas
      const days = this.generateDays(data.startDate, data.endDate);

      // Si eligió una plantilla, generar actividades sugeridas inteligentemente
      let activities = [];
      if (data.template !== 'blank' && data.cityDayAssignments && data.cityDayAssignments.length > 0) {
        activities = await this.generateActivitiesFromTemplate(
          data.template,
          data.cityDayAssignments,
          data.categories,
          days.length
        );
      }

      // Integrate generated activities into days structure
      const daysWithActivities = days.map(day => {
        const dayActivities = activities.filter(act => act.day === day.day);
        return {
          ...day,
          activities: dayActivities
        };
      });

      // Extract city list from assignments
      const cityList = data.cityDayAssignments.map(a => a.cityId);

      // Guardar en Firebase
      const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
      await setDoc(itineraryRef, {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        cities: cityList,
        cityDayAssignments: data.cityDayAssignments,
        categories: data.categories,
        template: data.template,
        days: daysWithActivities,
        flights: {
          outbound: data.outboundFlight,
          return: data.returnFlight
        },
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.email
      });

      Notifications.success(`✨ Itinerario "${data.name}" creado exitosamente con ${activities.length} actividades!`);

      // Recargar vista
      if (window.ItineraryHandler && window.ItineraryHandler.reinitialize) {
        window.ItineraryHandler.reinitialize();
      }

      console.log('✅ Itinerario creado:', tripId, `con ${activities.length} actividades`);
    } catch (error) {
      console.error('❌ Error creando itinerario:', error);
      Notifications.error('Error al crear itinerario. Inténtalo de nuevo.');
    }
  },

  generateDays(startDate, endDate) {
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let current = new Date(start);
    let dayNumber = 1;
    
    while (current <= end) {
      days.push({
        day: dayNumber,
        date: current.toISOString().split('T')[0],
        activities: []
      });
      
      current.setDate(current.getDate() + 1);
      dayNumber++;
    }
    
    return days;
  },

  async generateActivitiesFromTemplate(templateId, cityDayAssignments, selectedCategories, totalDays) {
    console.log('🎯 Generating smart itinerary:', { templateId, cityDayAssignments, selectedCategories, totalDays });

    // Get template configuration
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      console.warn('Template not found, returning empty activities');
      return [];
    }

    // Determine activities per day based on pace
    const activitiesPerDay = {
      relaxed: { min: 2, max: 3 },
      moderate: { min: 3, max: 4 },
      intense: { min: 4, max: 6 }
    }[template.pace] || { min: 3, max: 4 };

    // Merge template categories with user-selected categories
    const allCategories = [...new Set([...template.categories, ...selectedCategories])];

    const generatedActivities = [];
    let activityIdCounter = 1;

    // For each city assignment
    cityDayAssignments.forEach(assignment => {
      const cityId = assignment.cityId;
      const cityData = ACTIVITIES_DATABASE[cityId];

      if (!cityData || !cityData.activities) {
        console.warn(`No activities found for city: ${cityId}`);
        return;
      }

      // Filter activities by selected categories
      let availableActivities = cityData.activities.filter(activity =>
        allCategories.includes(activity.category)
      );

      // If no activities match categories, use all activities from the city
      if (availableActivities.length === 0) {
        availableActivities = cityData.activities;
      }

      // Shuffle activities for variety
      availableActivities = this.shuffleArray([...availableActivities]);

      if (assignment.type === 'single-day') {
        // Single day visit: assign 2-4 activities
        const activityCount = Math.min(
          Math.floor((activitiesPerDay.min + activitiesPerDay.max) / 2),
          availableActivities.length
        );

        for (let i = 0; i < activityCount; i++) {
          if (i < availableActivities.length) {
            const activity = availableActivities[i];
            generatedActivities.push({
              id: `activity-${activityIdCounter++}`,
              day: assignment.day,
              city: cityId,
              cityName: assignment.cityName,
              ...activity,
              order: i + 1,
              isGenerated: true
            });
          }
        }
      } else {
        // Multi-day stay: distribute activities across days
        const daysInCity = assignment.daysCount;
        let activityIndex = 0;

        for (let dayOffset = 0; dayOffset < daysInCity; dayOffset++) {
          const currentDay = assignment.dayStart + dayOffset;
          const dailyActivityCount = Math.min(
            activitiesPerDay.min + Math.floor(Math.random() * (activitiesPerDay.max - activitiesPerDay.min + 1)),
            availableActivities.length - activityIndex
          );

          for (let i = 0; i < dailyActivityCount && activityIndex < availableActivities.length; i++) {
            const activity = availableActivities[activityIndex++];
            generatedActivities.push({
              id: `activity-${activityIdCounter++}`,
              day: currentDay,
              city: cityId,
              cityName: assignment.cityName,
              ...activity,
              order: i + 1,
              isGenerated: true
            });
          }
        }
      }
    });

    // Sort by day and order
    generatedActivities.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.order - b.order;
    });

    console.log(`✅ Generated ${generatedActivities.length} activities`);
    return generatedActivities;
  },

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // === MÁS FUNCIONES CONTINÚAN... ===
  // (El resto de las funciones como drag & drop, optimización, etc.)
};

// Exportar para uso global
window.ItineraryBuilder = ItineraryBuilder;
