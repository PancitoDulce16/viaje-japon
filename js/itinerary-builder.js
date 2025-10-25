// js/itinerary-builder.js - Sistema Completo de Construcción de Itinerarios

import { db, auth } from '/js/firebase-config.js';
import { Notifications } from './notifications.js';
import { CATEGORIES, TEMPLATES } from '/data/categories-data.js';
import { ACTIVITIES_DATABASE, getActivitiesByCity, getActivitiesByCategory } from '/data/activities-database.js';
import { AIRLINES, AIRPORTS, getAirlineByCode, getAirportByCode } from '/data/airlines-data.js';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion
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

            <!-- Step 2: Itinerario por Fechas (DATE PICKER) -->
            <div id="wizardStep2" class="wizard-content hidden">
              <h3 class="text-xl font-bold mb-4 dark:text-white">📅 Asigna Ciudades por Fechas</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Selecciona visualmente las fechas en el calendario para cada ciudad. ¡Mucho más fácil!
              </p>

              <!-- City Selection with Date Picker -->
              <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-5 rounded-lg border-2 border-blue-200 dark:border-blue-800 mb-6">
                <h4 class="font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                  <span>📍</span> Selecciona Ciudad
                </h4>

                <div class="mb-4">
                  <label class="block text-xs font-semibold mb-2 dark:text-gray-300">¿A qué ciudad vas? *</label>
                  <select
                    id="datePickerCitySelect"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-base font-semibold"
                    onchange="ItineraryBuilder.onCitySelectForDatePicker()"
                  >
                    <option value="">Seleccionar ciudad...</option>
                  </select>
                </div>

                <!-- Calendar Date Picker -->
                <div id="datePickerCalendar" class="hidden">
                  <h4 class="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <span>📅</span> Selecciona las fechas en el calendario
                  </h4>

                  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                    <!-- Calendar Header -->
                    <div class="flex items-center justify-between mb-4">
                      <button type="button" onclick="ItineraryBuilder.changeCalendarMonth(-1)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                      </button>
                      <h5 id="calendarMonthYear" class="text-lg font-bold dark:text-white"></h5>
                      <button type="button" onclick="ItineraryBuilder.changeCalendarMonth(1)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </button>
                    </div>

                    <!-- Calendar Grid -->
                    <div class="grid grid-cols-7 gap-1">
                      <!-- Days of week header -->
                      <div class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">Dom</div>
                      <div class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">Lun</div>
                      <div class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">Mar</div>
                      <div class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">Mié</div>
                      <div class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">Jue</div>
                      <div class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">Vie</div>
                      <div class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">Sáb</div>

                      <!-- Calendar days will be rendered here -->
                      <div id="calendarDaysGrid" class="col-span-7 grid grid-cols-7 gap-1"></div>
                    </div>

                    <!-- Selected Range Info -->
                    <div id="selectedRangeInfo" class="mt-4 hidden">
                      <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p class="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                          Rango seleccionado:
                        </p>
                        <p id="selectedRangeText" class="text-base font-bold text-purple-700 dark:text-purple-400"></p>
                        <button
                          type="button"
                          onclick="ItineraryBuilder.confirmDateRange()"
                          class="mt-3 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2.5 rounded-lg hover:from-purple-600 hover:to-blue-600 transition font-semibold flex items-center justify-center gap-2"
                        >
                          <span>✨</span> Confirmar Fechas para <span id="selectedCityName"></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 text-xs text-blue-800 dark:text-blue-300">
                    <strong>💡 Tip:</strong> Haz click en la fecha de inicio y luego en la fecha final para seleccionar un rango.
                  </div>
                </div>
              </div>

              <!-- Visual Calendar Timeline -->
              <div class="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-300 dark:border-gray-600 mb-4">
                <h4 class="font-bold mb-3 dark:text-white flex items-center gap-2">
                  <span>📊</span> Vista del Itinerario
                </h4>
                <div id="cityTimelineView" class="space-y-2">
                  <div class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                    <i class="fas fa-calendar-alt text-3xl mb-2"></i>
                    <p>La distribución de ciudades aparecerá aquí</p>
                  </div>
                </div>
              </div>

              <!-- Detailed Day-by-Day View (Collapsible) -->
              <div class="border-t border-gray-300 dark:border-gray-600 pt-4">
                <button
                  type="button"
                  onclick="document.getElementById('detailedDayView').classList.toggle('hidden')"
                  class="w-full text-left font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <span>📋 Vista Detallada Día por Día (opcional)</span>
                  <span class="text-sm">▼</span>
                </button>

                <div id="detailedDayView" class="hidden">
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Aquí puedes ajustar cada día individualmente si necesitas más control.
                  </p>
                  <div id="cityByDateContainer" class="space-y-3 max-h-[400px] overflow-y-auto">
                    <!-- Este contenedor se llenará dinámicamente -->
                  </div>
                </div>
              </div>

              <div class="mt-4 space-y-2">
                <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p class="text-sm text-green-800 dark:text-green-300">
                    ✨ <strong>Nuevo:</strong> Asigna ciudades por rangos de días - ¡mucho más rápido!
                  </p>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p class="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>Tip:</strong> Para visitas cortas a varias ciudades en un día, usa la vista detallada.
                  </p>
                </div>
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

  // === DATE PICKER SYSTEM === //

  // Date picker state
  datePickerState: {
    currentMonth: new Date(),
    selectedCity: null,
    selectedStartDate: null,
    selectedEndDate: null,
    tripStartDate: null,
    tripEndDate: null
  },

  // Initialize city select for date picker
  onCitySelectForDatePicker() {
    const citySelect = document.getElementById('datePickerCitySelect');
    const calendarDiv = document.getElementById('datePickerCalendar');

    if (citySelect.value) {
      this.datePickerState.selectedCity = citySelect.value;
      calendarDiv.classList.remove('hidden');

      // Initialize calendar with trip dates
      const startDate = document.getElementById('itineraryStartDate').value;
      const endDate = document.getElementById('itineraryEndDate').value;

      if (startDate && endDate) {
        // Normalize dates to midnight local time to avoid timezone issues
        const startParts = startDate.split('-');
        const endParts = endDate.split('-');
        this.datePickerState.tripStartDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
        this.datePickerState.tripEndDate = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
        this.datePickerState.currentMonth = new Date(this.datePickerState.tripStartDate);
        this.renderCalendar();
      }
    } else {
      calendarDiv.classList.add('hidden');
      this.datePickerState.selectedCity = null;
    }
  },

  // Change calendar month
  changeCalendarMonth(delta) {
    this.datePickerState.currentMonth.setMonth(this.datePickerState.currentMonth.getMonth() + delta);
    this.renderCalendar();
  },

  // Render calendar
  renderCalendar() {
    const state = this.datePickerState;
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Update month/year header
    const monthYearEl = document.getElementById('calendarMonthYear');
    monthYearEl.textContent = `${monthNames[state.currentMonth.getMonth()]} ${state.currentMonth.getFullYear()}`;

    // Render calendar days
    const firstDay = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth(), 1);
    const lastDay = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    const daysGrid = document.getElementById('calendarDaysGrid');
    daysGrid.innerHTML = '';

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'h-10';
      daysGrid.appendChild(emptyCell);
    }

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];

      const dayCell = document.createElement('button');
      dayCell.type = 'button';
      dayCell.className = 'h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all';
      dayCell.textContent = day;

      // Normalize date to midnight for comparison
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const normalizedTripStart = state.tripStartDate ? new Date(state.tripStartDate.getFullYear(), state.tripStartDate.getMonth(), state.tripStartDate.getDate()) : null;
      const normalizedTripEnd = state.tripEndDate ? new Date(state.tripEndDate.getFullYear(), state.tripEndDate.getMonth(), state.tripEndDate.getDate()) : null;

      // Check if date is within trip range
      const isInTripRange = normalizedTripStart && normalizedTripEnd &&
                            normalizedDate >= normalizedTripStart && normalizedDate <= normalizedTripEnd;

      // Check if date is selected
      const isStartDate = state.selectedStartDate && dateStr === state.selectedStartDate.toISOString().split('T')[0];
      const isEndDate = state.selectedEndDate && dateStr === state.selectedEndDate.toISOString().split('T')[0];
      const isInSelectedRange = state.selectedStartDate && state.selectedEndDate &&
                                date >= state.selectedStartDate && date <= state.selectedEndDate;

      if (!isInTripRange) {
        // Outside trip range - disabled
        dayCell.className += ' text-gray-300 dark:text-gray-600 cursor-not-allowed';
        dayCell.disabled = true;
      } else if (isStartDate || isEndDate) {
        // Start or end date - purple circle
        dayCell.className += ' bg-purple-600 text-white font-bold hover:bg-purple-700';
      } else if (isInSelectedRange) {
        // In selected range - light purple
        dayCell.className += ' bg-purple-200 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200';
      } else {
        // Available date
        dayCell.className += ' hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300';
      }

      dayCell.onclick = () => this.onDateClick(date);
      daysGrid.appendChild(dayCell);
    }
  },

  // Handle date click
  onDateClick(date) {
    const state = this.datePickerState;

    if (!state.selectedStartDate || (state.selectedStartDate && state.selectedEndDate)) {
      // Start new selection
      state.selectedStartDate = date;
      state.selectedEndDate = null;
    } else {
      // Complete selection
      if (date < state.selectedStartDate) {
        // User clicked earlier date - swap
        state.selectedEndDate = state.selectedStartDate;
        state.selectedStartDate = date;
      } else {
        state.selectedEndDate = date;
      }
    }

    this.renderCalendar();
    this.updateSelectedRangeInfo();
  },

  // Update selected range info
  updateSelectedRangeInfo() {
    const state = this.datePickerState;
    const infoDiv = document.getElementById('selectedRangeInfo');
    const rangeText = document.getElementById('selectedRangeText');
    const cityNameSpan = document.getElementById('selectedCityName');

    if (state.selectedStartDate && state.selectedEndDate) {
      const startStr = state.selectedStartDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      const endStr = state.selectedEndDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
      const days = Math.ceil((state.selectedEndDate - state.selectedStartDate) / (1000 * 60 * 60 * 24)) + 1;

      rangeText.textContent = `${startStr} - ${endStr} (${days} ${days === 1 ? 'día' : 'días'})`;

      const cityData = ACTIVITIES_DATABASE[state.selectedCity];
      cityNameSpan.textContent = cityData.city;

      infoDiv.classList.remove('hidden');
    } else {
      infoDiv.classList.add('hidden');
    }
  },

  // Confirm date range selection
  confirmDateRange() {
    const state = this.datePickerState;

    if (!state.selectedCity || !state.selectedStartDate || !state.selectedEndDate) {
      Notifications.warning('Por favor selecciona una ciudad y un rango de fechas');
      return;
    }

    const cityData = ACTIVITIES_DATABASE[state.selectedCity];
    const tripStart = state.tripStartDate;

    // Calculate day numbers
    const startDayNum = Math.ceil((state.selectedStartDate - tripStart) / (1000 * 60 * 60 * 24)) + 1;
    const endDayNum = Math.ceil((state.selectedEndDate - tripStart) / (1000 * 60 * 60 * 24)) + 1;

    // Assign city to all days in range
    for (let day = startDayNum; day <= endDayNum; day++) {
      const container = document.getElementById(`city-blocks-day-${day}`);
      if (container) {
        const existingBlocks = container.querySelectorAll('.city-block');
        let alreadyHasCity = false;

        existingBlocks.forEach(block => {
          const select = block.querySelector('.city-block-city');
          if (select && select.value === state.selectedCity) {
            alreadyHasCity = true;
          }
        });

        if (!alreadyHasCity) {
          const dateStr = new Date(tripStart.getTime() + (day - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          this.addCityBlock(day, dateStr);

          // Auto-select the city in the newly created block
          setTimeout(() => {
            const newBlocks = container.querySelectorAll('.city-block');
            const lastBlock = newBlocks[newBlocks.length - 1];
            if (lastBlock) {
              const select = lastBlock.querySelector('.city-block-city');
              if (select) {
                select.value = state.selectedCity;
              }
            }
          }, 50);
        }
      }
    }

    // Update timeline visualization
    this.renderCityTimeline();

    Notifications.success(`✅ ${cityData.city} asignada a días ${startDayNum}-${endDayNum}`);

    // Reset selection
    state.selectedStartDate = null;
    state.selectedEndDate = null;
    this.renderCalendar();
    document.getElementById('selectedRangeInfo').classList.add('hidden');
  },

  // 🔥 NEW: Render visual timeline of city assignments
  renderCityTimeline() {
    const container = document.getElementById('cityTimelineView');
    if (!container) return;

    const startDate = document.getElementById('itineraryStartDate').value;
    const endDate = document.getElementById('itineraryEndDate').value;

    // Parse dates correctly to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const timeline = [];

    for (let day = 1; day <= totalDays; day++) {
      const dayContainer = document.getElementById(`city-blocks-day-${day}`);
      if (dayContainer) {
        const blocks = dayContainer.querySelectorAll('.city-block');
        const cities = [];

        blocks.forEach(block => {
          const citySelect = block.querySelector('.city-block-city');
          if (citySelect && citySelect.value) {
            const cityId = citySelect.value;
            const cityData = ACTIVITIES_DATABASE[cityId];
            if (cityData) {
              cities.push(cityData.city);
            }
          }
        });

        if (cities.length > 0) {
          timeline.push({
            day,
            cities,
            date: new Date(start.getTime() + (day - 1) * 24 * 60 * 60 * 1000)
          });
        }
      }
    }

    if (timeline.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          <i class="fas fa-calendar-alt text-3xl mb-2"></i>
          <p>Agrega ciudades para ver la distribución aquí</p>
        </div>
      `;
      return;
    }

    // Group consecutive days with same city
    const groups = [];
    let currentGroup = null;

    timeline.forEach((item, index) => {
      const cityStr = item.cities.join(', ');

      if (currentGroup && currentGroup.cityStr === cityStr) {
        currentGroup.dayTo = item.day;
      } else {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = {
          cityStr,
          cities: item.cities,
          dayFrom: item.day,
          dayTo: item.day,
          dateFrom: item.date
        };
      }

      if (index === timeline.length - 1) {
        groups.push(currentGroup);
      }
    });

    // Render timeline
    const colors = ['blue', 'green', 'purple', 'pink', 'indigo', 'yellow', 'red', 'orange'];

    container.innerHTML = groups.map((group, index) => {
      const color = colors[index % colors.length];
      const dayCount = group.dayTo - group.dayFrom + 1;
      const dateStr = group.dateFrom.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

      return `
        <div class="flex items-center gap-3 p-3 bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800 rounded-lg">
          <div class="flex-shrink-0 w-16 text-center">
            <div class="text-xs font-semibold text-${color}-900 dark:text-${color}-300">
              ${group.dayFrom === group.dayTo ? `Día ${group.dayFrom}` : `Días ${group.dayFrom}-${group.dayTo}`}
            </div>
            <div class="text-xs text-${color}-600 dark:text-${color}-400">${dateStr}</div>
          </div>
          <div class="flex-1">
            <div class="font-bold text-${color}-900 dark:text-${color}-300">${group.cityStr}</div>
            <div class="text-xs text-${color}-700 dark:text-${color}-400">
              ${dayCount} ${dayCount === 1 ? 'día' : 'días'} • ${group.cities.length > 1 ? 'Múltiples ciudades' : 'Estancia completa'}
            </div>
          </div>
          <button
            onclick="ItineraryBuilder.removeCityRange(${group.dayFrom}, ${group.dayTo})"
            class="flex-shrink-0 p-2 text-${color}-600 dark:text-${color}-400 hover:bg-${color}-100 dark:hover:bg-${color}-800 rounded transition"
            title="Eliminar"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    }).join('');
  },

  // 🔥 NEW: Remove city assignment from a range of days
  removeCityRange(dayFrom, dayTo) {
    if (!confirm(`¿Eliminar asignaciones de ciudades para los días ${dayFrom}-${dayTo}?`)) {
      return;
    }

    for (let day = dayFrom; day <= dayTo; day++) {
      const container = document.getElementById(`city-blocks-day-${day}`);
      if (container) {
        const blocks = container.querySelectorAll('.city-block');
        blocks.forEach(block => {
          block.remove();
        });

        // Show empty state
        container.innerHTML = `
          <div class="text-center py-6 text-gray-400 dark:text-gray-500 text-sm" id="empty-state-day-${day}">
            <i class="fas fa-map-marked-alt text-2xl mb-2"></i>
            <p>Haz clic en "Agregar Ciudad" para empezar</p>
          </div>
        `;

        this.updateCityCount(day);
      }
    }

    this.renderCityTimeline();
    Notifications.success('✅ Ciudades eliminadas');
  },

  // 🔥 NEW: Populate quick city selector with available cities
  populateQuickCitySelector() {
    // Populate date picker city select
    const datePickerSelect = document.getElementById('datePickerCitySelect');
    if (datePickerSelect) {
      const cityOptions = Object.keys(ACTIVITIES_DATABASE).map(cityId => {
        const cityData = ACTIVITIES_DATABASE[cityId];
        return `<option value="${cityId}">${cityData.city}</option>`;
      }).join('');

      datePickerSelect.innerHTML = '<option value="">Seleccionar ciudad...</option>' + cityOptions;
    }
  },

  generateDateCitySelector() {
    const startDate = document.getElementById('itineraryStartDate').value;
    const endDate = document.getElementById('itineraryEndDate').value;

    if (!startDate || !endDate) {
      console.error('Start or end date missing');
      return;
    }

    // Parse dates correctly to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    const dates = [];
    let current = new Date(start);

    // Generate all dates
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Populate quick city selector
    this.populateQuickCitySelector();

    // Build city options HTML
    const cityOptions = Object.keys(ACTIVITIES_DATABASE).map(cityId => {
      const cityData = ACTIVITIES_DATABASE[cityId];
      return `<option value="${cityId}">${cityData.city}</option>`;
    }).join('');

    // Generate HTML for each date with multiple city blocks support
    const container = document.getElementById('cityByDateContainer');
    container.innerHTML = dates.map((date, index) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'short' });
      const dayMonth = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      const dayNumber = index + 1;

      return `
        <div class="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 p-4 hover:shadow-md transition">
          <!-- Day Header -->
          <div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
            <div class="flex items-center gap-3">
              <div class="text-center">
                <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">${dayOfWeek}</div>
                <div class="text-lg font-bold dark:text-white">Día ${dayNumber}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">${dayMonth}</div>
              </div>
              <div class="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <div class="text-sm font-semibold dark:text-white">Ciudades a visitar</div>
                <div class="text-xs text-gray-500 dark:text-gray-400" id="city-count-day-${dayNumber}">Sin ciudades</div>
              </div>
            </div>
            <button
              type="button"
              onclick="ItineraryBuilder.addCityBlock(${dayNumber}, '${dateStr}')"
              class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm font-semibold flex items-center gap-2"
            >
              <i class="fas fa-plus"></i> Agregar Ciudad
            </button>
          </div>
          
          <!-- City Blocks Container -->
          <div id="city-blocks-day-${dayNumber}" class="space-y-2" data-date="${dateStr}" data-day="${dayNumber}">
            <!-- City blocks will be added dynamically -->
            <div class="text-center py-6 text-gray-400 dark:text-gray-500 text-sm" id="empty-state-day-${dayNumber}">
              <i class="fas fa-map-marked-alt text-2xl mb-2"></i>
              <p>Haz clic en "Agregar Ciudad" para empezar</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    console.log(`✅ Generated ${dates.length} flexible date containers`);
  },

  // Add a city block to a specific day
  addCityBlock(dayNumber, dateStr) {
    const container = document.getElementById(`city-blocks-day-${dayNumber}`);
    const emptyState = document.getElementById(`empty-state-day-${dayNumber}`);
    
    if (emptyState) {
      emptyState.remove();
    }

    const blockId = `city-block-${dayNumber}-${Date.now()}`;
    
    // Build city options HTML
    const cityOptions = Object.keys(ACTIVITIES_DATABASE).map(cityId => {
      const cityData = ACTIVITIES_DATABASE[cityId];
      return `<option value="${cityId}">${cityData.city}</option>`;
    }).join('');

    const blockHtml = `
      <div id="${blockId}" class="city-block bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600" data-day="${dayNumber}">
        <div class="flex items-start gap-2">
          <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- City Selection -->
            <div>
              <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Ciudad *</label>
              <select
                class="city-block-city w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                required
              >
                <option value="">Seleccionar...</option>
                ${cityOptions}
              </select>
            </div>
            
            <!-- Time Start (Optional) -->
            <div>
              <label class="block text-xs font-semibold mb-1 dark:text-gray-300">
                Hora inicio <span class="text-gray-400">(opcional)</span>
              </label>
              <input
                type="time"
                class="city-block-time-start w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                placeholder="09:00"
              />
            </div>
            
            <!-- Time End (Optional) -->
            <div>
              <label class="block text-xs font-semibold mb-1 dark:text-gray-300">
                Hora fin <span class="text-gray-400">(opcional)</span>
              </label>
              <input
                type="time"
                class="city-block-time-end w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                placeholder="18:00"
              />
            </div>
          </div>
          
          <!-- Remove Button -->
          <button
            type="button"
            onclick="ItineraryBuilder.removeCityBlock('${blockId}', ${dayNumber})"
            class="flex-shrink-0 mt-6 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            title="Eliminar"
          >
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
        
        <!-- Duration Indicator -->
        <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
          💡 Deja los horarios vacíos para indicar que pasarás todo el día en esta ciudad
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', blockHtml);
    this.updateCityCount(dayNumber);

    // Add change listener to update timeline when city is selected
    const newBlock = document.getElementById(blockId);
    if (newBlock) {
      const citySelect = newBlock.querySelector('.city-block-city');
      if (citySelect) {
        citySelect.addEventListener('change', () => {
          this.renderCityTimeline();
        });
      }
    }
  },

  // Remove a city block
  removeCityBlock(blockId, dayNumber) {
    const block = document.getElementById(blockId);
    if (block) {
      block.remove();
      this.updateCityCount(dayNumber);

      // Show empty state if no blocks remain
      const container = document.getElementById(`city-blocks-day-${dayNumber}`);
      if (container && container.querySelectorAll('.city-block').length === 0) {
        container.innerHTML = `
          <div class="text-center py-6 text-gray-400 dark:text-gray-500 text-sm" id="empty-state-day-${dayNumber}">
            <i class="fas fa-map-marked-alt text-2xl mb-2"></i>
            <p>Haz clic en "Agregar Ciudad" para empezar</p>
          </div>
        `;
      }

      // Update timeline
      this.renderCityTimeline();
    }
  },

  // Update city count display
  updateCityCount(dayNumber) {
    const container = document.getElementById(`city-blocks-day-${dayNumber}`);
    const countDisplay = document.getElementById(`city-count-day-${dayNumber}`);
    
    if (container && countDisplay) {
      const blocks = container.querySelectorAll('.city-block');
      const count = blocks.length;
      
      if (count === 0) {
        countDisplay.textContent = 'Sin ciudades';
      } else if (count === 1) {
        countDisplay.textContent = '1 ciudad';
      } else {
        countDisplay.textContent = `${count} ciudades`;
      }
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

      if (this.currentStep === 2) {
        this.generateDateCitySelector();
      }

      if (this.renderQuickCityBlocksUI) {
        this.renderQuickCityBlocksUI();
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
      // 🔥 NUEVO: Validar que todos los días tengan al menos una ciudad asignada
      const startDate = document.getElementById('itineraryStartDate').value;
      const endDate = document.getElementById('itineraryEndDate').value;

      // Parse dates correctly to avoid timezone issues
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      const start = new Date(startYear, startMonth - 1, startDay);
      const end = new Date(endYear, endMonth - 1, endDay);

      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      const unassignedDays = [];
      
      for (let dayNumber = 1; dayNumber <= totalDays; dayNumber++) {
        const container = document.getElementById(`city-blocks-day-${dayNumber}`);
        if (container) {
          const blocks = container.querySelectorAll('.city-block');
          
          if (blocks.length === 0) {
            unassignedDays.push(dayNumber);
            continue;
          }
          
          // Validate that each block has a city selected
          let hasInvalidBlock = false;
          blocks.forEach(block => {
            const citySelect = block.querySelector('.city-block-city');
            if (!citySelect || !citySelect.value) {
              hasInvalidBlock = true;
            }
          });
          
          if (hasInvalidBlock) {
            unassignedDays.push(dayNumber);
          }
        }
      }

      if (unassignedDays.length > 0) {
        Notifications.warning(`Por favor agrega al menos una ciudad para los siguientes días: ${unassignedDays.join(', ')}`);
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
    // 🔥 NEW IMPROVED SYSTEM: Collect city blocks for each day
    const startDate = document.getElementById('itineraryStartDate').value;
    const endDate = document.getElementById('itineraryEndDate').value;

    // Parse dates correctly to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    const allAssignments = [];
    
    for (let dayNumber = 1; dayNumber <= totalDays; dayNumber++) {
      const container = document.getElementById(`city-blocks-day-${dayNumber}`);
      if (!container) continue;
      
      const blocks = container.querySelectorAll('.city-block');
      const dayAssignments = [];
      
      blocks.forEach((block, index) => {
        const citySelect = block.querySelector('.city-block-city');
        const timeStart = block.querySelector('.city-block-time-start');
        const timeEnd = block.querySelector('.city-block-time-end');
        
        if (citySelect && citySelect.value) {
          const cityId = citySelect.value;
          const cityData = ACTIVITIES_DATABASE[cityId];
          
          dayAssignments.push({
            cityId: cityId,
            cityName: cityData.city,
            timeStart: timeStart.value || null,
            timeEnd: timeEnd.value || null,
            order: index + 1,
            isFullDay: !timeStart.value && !timeEnd.value
          });
        }
      });
      
      if (dayAssignments.length > 0) {
        allAssignments.push({
          day: dayNumber,
          date: new Date(start.getTime() + (dayNumber - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          cities: dayAssignments,
          cityCount: dayAssignments.length,
          isMultiCity: dayAssignments.length > 1
        });
      }
    }
    
    console.log('📋 New flexible city day assignments:', allAssignments);
    return allAssignments;
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
        
        // Find city assignment for this day
        const dayAssignment = data.cityDayAssignments.find(a => a.day === day.day);
        
        // Build day title and location from cities
        let dayTitle = 'Día libre';
        let dayLocation = '';
        
        if (dayAssignment && dayAssignment.cities) {
          if (dayAssignment.isMultiCity) {
            dayTitle = `Visitando ${dayAssignment.cities.map(c => c.cityName).join(' y ')}`;
            dayLocation = dayAssignment.cities.map(c => {
              if (c.timeStart && c.timeEnd) {
                return `${c.cityName} (${c.timeStart}-${c.timeEnd})`;
              }
              return c.cityName;
            }).join(' → ');
          } else {
            const city = dayAssignment.cities[0];
            dayTitle = `Explorando ${city.cityName}`;
            dayLocation = city.cityName;
            if (city.timeStart && city.timeEnd) {
              dayTitle += ` (${city.timeStart}-${city.timeEnd})`;
            }
          }
        }
        
        return {
          ...day,
          title: dayTitle,
          location: dayLocation,
          cities: dayAssignment?.cities || [],
          isMultiCity: dayAssignment?.isMultiCity || false,
          activities: dayActivities
        };
      });

      // Extract unique city list from all assignments
      const citySet = new Set();
      data.cityDayAssignments.forEach(dayAssignment => {
        dayAssignment.cities.forEach(city => {
          citySet.add(city.cityId);
        });
      });
      const cityList = Array.from(citySet);

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

    // Parse dates correctly to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

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
    console.log('🎯 Generating SMART itinerary with AI recommendations:', { templateId, cityDayAssignments, selectedCategories, totalDays });

    // Get template info
    const template = TEMPLATES.find(t => t.id === templateId) || { pace: 'moderate' };

    // Determine activities per day based on pace
    const activitiesPerDay = {
      relaxed: { min: 2, max: 3 },
      moderate: { min: 3, max: 4 },
      intense: { min: 4, max: 6 }
    }[template.pace] || { min: 3, max: 4 };

    // Merge template categories with user-selected categories
    const allCategories = [...new Set([...template.categories, ...selectedCategories])];

    // ✨ NEW: Use RecommendationEngine for smart activity selection
    const useSmartRecommendations = window.RecommendationEngine && allCategories.length > 0;
    console.log(useSmartRecommendations ? '🧠 Using AI-powered recommendations' : '📋 Using template-based generation');

    const generatedActivities = [];
    let activityIdCounter = 1;

    // For each day assignment (supports multiple cities per day)
    cityDayAssignments.forEach(dayAssignment => {
      const dayNumber = dayAssignment.day;
      const cities = dayAssignment.cities;

      // Calculate how many activities per city based on number of cities in the day
      const citiesCount = cities.length;
      let activitiesPerCity;

      if (citiesCount === 1 && cities[0].isFullDay) {
        // Full day in one city: normal activity count
        activitiesPerCity = activitiesPerDay.min + Math.floor(Math.random() * (activitiesPerDay.max - activitiesPerDay.min + 1));
      } else if (citiesCount === 1) {
        // Partial day in one city: fewer activities
        activitiesPerCity = Math.max(1, Math.floor(activitiesPerDay.min / 1.5));
      } else {
        // Multiple cities: distribute activities
        const totalActivities = activitiesPerDay.min + Math.floor(Math.random() * (activitiesPerDay.max - activitiesPerDay.min + 1));
        activitiesPerCity = Math.max(1, Math.floor(totalActivities / citiesCount));
      }

      // Generate activities for each city in this day
      cities.forEach((cityVisit, cityIndex) => {
        const cityId = cityVisit.cityId;
        const cityName = cityVisit.cityName;
        let selectedActivities = [];

        // ✨ TRY SMART RECOMMENDATIONS FIRST
        if (useSmartRecommendations) {
          try {
            // Get personalized recommendations for this city and day
            const recommendations = window.RecommendationEngine.getDailyRecommendations(
              allCategories,  // User preferences
              cityName,       // City name
              dayNumber,      // Day number for variety
              activitiesPerCity // How many activities needed
            );

            if (recommendations && recommendations.length > 0) {
              selectedActivities = recommendations.slice(0, activitiesPerCity);
              console.log(`✨ Day ${dayNumber} in ${cityName}: ${selectedActivities.length} smart recommendations selected`);
            }
          } catch (error) {
            console.warn('Smart recommendations failed, falling back to template:', error);
          }
        }

        // FALLBACK: Template-based random selection
        if (selectedActivities.length === 0) {
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

          // Select activities
          const activityCount = Math.min(activitiesPerCity, availableActivities.length);
          selectedActivities = availableActivities.slice(0, activityCount);

          console.log(`📋 Day ${dayNumber} in ${cityName}: ${selectedActivities.length} template activities selected`);
        }

        // Generate start time for activities if time range is specified
        let currentTime = cityVisit.timeStart || '09:00';

        // Add selected activities to the itinerary
        selectedActivities.forEach((activity, i) => {
          generatedActivities.push({
            id: `activity-${activityIdCounter++}`,
            day: dayNumber,
            city: cityId,
            cityName: cityVisit.cityName,
            ...activity,
            time: cityVisit.timeStart ? this.calculateActivityTime(currentTime, i) : activity.time || `${9 + i * 2}:00`,
            cityVisitInfo: {
              timeStart: cityVisit.timeStart,
              timeEnd: cityVisit.timeEnd,
              isFullDay: cityVisit.isFullDay,
              order: cityVisit.order
            },
            order: (cityIndex * 10) + i + 1,
            isGenerated: true,
            // ✨ Include recommendation metadata if available
            ...(activity.matchedPreferences && {
              recommendationScore: activity.recommendationScore,
              matchedPreferences: activity.matchedPreferences,
              matchReason: activity.matchReason
            })
          });
        });
      });
    });

    // Sort by day and order
    generatedActivities.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.order - b.order;
    });

    const smartCount = generatedActivities.filter(a => a.matchedPreferences).length;
    console.log(`✅ Generated ${generatedActivities.length} activities (${smartCount} smart, ${generatedActivities.length - smartCount} template) across ${cityDayAssignments.length} days`);

    return generatedActivities;
  },
  
  // === GET AI RECOMMENDATIONS FOR EXISTING ITINERARY === //

  async showAIRecommendationsForCurrent() {
    if (!window.AIIntegration) {
      Notifications.error('AI Integration no está disponible');
      return;
    }

    if (!window.ItineraryHandler || !window.ItineraryHandler.currentItinerary) {
      Notifications.warning('No hay itinerario para analizar');
      return;
    }

    Notifications.info('🤖 Analizando tu itinerario con AI...');

    try {
      const currentItinerary = window.ItineraryHandler.currentItinerary;
      const userTrip = window.TripsManager?.currentTrip;
      
      // Get user interests from categories if available
      const userInterests = userTrip?.categories || [];

      const result = await window.AIIntegration.getPersonalizedSuggestions(
        currentItinerary,
        userInterests
      );

      if (result.success && result.analysis) {
        this.displayAIAnalysis(result.analysis);
      } else {
        Notifications.error('No se pudo generar análisis AI');
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      Notifications.error('Error al obtener recomendaciones AI');
    }
  },

  displayAIAnalysis(analysis) {
    const modalHtml = `
      <div id="aiAnalysisModal" class="modal active" style="z-index: 10002;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6 rounded-t-xl z-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="text-4xl">🔍</div>
                <div>
                  <h2 class="text-2xl font-bold">Análisis AI de tu Itinerario</h2>
                  <p class="text-sm text-white/80 mt-1">Mejora tu viaje con sugerencias personalizadas</p>
                </div>
              </div>
              <button 
                onclick="ItineraryBuilder.closeAIAnalysisModal()"
                class="text-white/80 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <!-- Overall Analysis -->
            ${analysis.overallAnalysis ? `
              <div class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h3 class="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                  <span>📊</span> Análisis General
                </h3>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">${analysis.overallAnalysis}</p>
              </div>
            ` : ''}

            <!-- Strengths -->
            ${analysis.strengths && analysis.strengths.length > 0 ? `
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-lg border border-green-200 dark:border-green-800">
                <h3 class="text-lg font-bold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                  <span>✅</span> Puntos Fuertes
                </h3>
                <ul class="space-y-2">
                  ${analysis.strengths.map(strength => `
                    <li class="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span class="text-green-500 mt-0.5">✓</span>
                      <span>${strength}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            <!-- Improvements -->
            ${analysis.improvements && analysis.improvements.length > 0 ? `
              <div class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-5 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 class="text-lg font-bold text-yellow-900 dark:text-yellow-300 mb-3 flex items-center gap-2">
                  <span>💡</span> Sugerencias de Mejora
                </h3>
                <div class="space-y-4">
                  ${analysis.improvements.map(improvement => `
                    <div class="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <div class="font-semibold text-gray-900 dark:text-white mb-1">
                        Día ${improvement.day}
                      </div>
                      <div class="text-gray-700 dark:text-gray-300 text-sm mb-1">
                        ${improvement.suggestion}
                      </div>
                      <div class="text-xs text-gray-600 dark:text-gray-400 italic">
                        ${improvement.reasoning}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Hidden Gems -->
            ${analysis.hiddenGems && analysis.hiddenGems.length > 0 ? `
              <div class="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-5 rounded-lg border border-pink-200 dark:border-pink-800">
                <h3 class="text-lg font-bold text-pink-900 dark:text-pink-300 mb-3 flex items-center gap-2">
                  <span>💎</span> Joyas Escondidas
                </h3>
                <div class="space-y-3">
                  ${analysis.hiddenGems.map(gem => `
                    <div class="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <div class="font-bold text-gray-900 dark:text-white mb-1">
                        ${gem.title}
                      </div>
                      <div class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        ${gem.description}
                      </div>
                      <div class="text-xs text-pink-600 dark:text-pink-400 italic">
                        ✨ ${gem.whySpecial}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Optimization Tips -->
            ${analysis.optimizationTips && analysis.optimizationTips.length > 0 ? `
              <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 class="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <span>🎯</span> Consejos de Optimización
                </h3>
                <ul class="space-y-2">
                  ${analysis.optimizationTips.map(tip => `
                    <li class="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span class="text-blue-500 mt-0.5">→</span>
                      <span>${tip}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
            <button 
              onclick="ItineraryBuilder.closeAIAnalysisModal()"
              class="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
  },

  closeAIAnalysisModal() {
    const modal = document.getElementById('aiAnalysisModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  },

  // === MÁS FUNCIONES CONTINÚAN... ===
  // (El resto de las funciones como drag & drop, optimización, etc.)
};

// Exportar para uso global
window.ItineraryBuilder = ItineraryBuilder;
