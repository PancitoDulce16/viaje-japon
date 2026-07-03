// js/smart-generator-wizard.js - UI Wizard para generador inteligente de itinerarios
// Wizard de 3 pasos que guía al usuario a crear un itinerario completo

import { db } from '../../core/firebase-config.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sanitizeForFirestore } from './itinerary-v3.js';
import { ACTIVITIES_DATABASE } from '../../../data/activities-database.js';
import { getAirportByCode, getAirportSelectOptions } from '../../../data/japan-airports.js';
import { YamanoteHelper } from './yamanote-helper.js';
import { OsakaLoopHelper } from './osaka-loop-helper.js';
import { CityRouteMap } from './city-route-map.js';
import { DayAllocationBar } from './day-allocation-bar.js';
import { CITY_ICONS } from '../../../data/city-coordinates.js';

/**
 * Smart Generator Wizard
 */
export const SmartGeneratorWizard = {

  currentStep: 1,
  // 🆕 Mini-flow interno del Step 1: 'basics' (fechas/presupuesto/etc, todo
  // lo que ya vivía en renderStep1()) -> 'map' (mapa de ciudades) -> 'days'
  // (reparto de días, solo si aplica). Vive fuera de wizardData a propósito:
  // es navegación transitoria de la UI, no un dato de negocio que le importe
  // a generateItinerary().
  step1Phase: 'basics',
  wizardData: {
    // Step 1 - Información básica del viaje
    cities: [],
    dayAllocationMode: 'auto', // 'auto' (el generador decide) | 'manual' (el usuario elige días por parada)
    cityStops: [], // 🆕 [{city, days}] - ruta ordenada, permite repetir ciudad (ej. Tokyo -> Kyoto -> Tokyo)
    totalDays: 7,
    dailyBudget: 10000,
    groupSize: 1,              // 🆕 Número de personas
    travelerAges: [],          // 🆕 Edades de los viajeros [25, 30, 5]
    tripStartDate: null,       // 🆕 Fecha de inicio (para eventos estacionales)
    tripEndDate: null,         // 🆕 Fecha de fin
    arrivalTime: null,         // 🆕 'HH:MM' - hora de aterrizaje día 1 (jetlag-aware)
    arrivalAirport: null,      // 🆕 IATA (NRT, HND, KIX...) - sugiere primera ciudad de la ruta
    departureAirport: null,    // 🆕 IATA - sugiere última ciudad de la ruta
    dietaryRestrictions: [],   // 🆕 ['vegetarian', 'halal', 'gluten-free']
    mobilityNeeds: null,       // 🆕 'wheelchair', 'limited', null

    // Step 2
    interests: [],
    interestWeights: {}, // 🆕 {interestId: 1-5} - qué tanto pesa cada interés seleccionado
    pace: 'moderate',
    startTime: 9,

    // Step 3
    hotels: {},
    mustSee: [],
    avoid: []
  },

  /**
   * Abre el wizard
   * @param {Object|null} prefill - Si se pasa, ignora el progreso guardado en
   *   sessionStorage y arranca con datos frescos (defaults completos +
   *   overrides de prefill). Usado por "Regenerar Itinerario" para inyectar
   *   cities/totalDays del viaje actual sin arrastrar campos faltantes de un
   *   wizardData parcial.
   */
  open(prefill = null) {
    this.currentStep = 1;
    this.step1Phase = 'basics';
    // 🆕 Si el viaje ya se creó con fechas reales (entry point "trip creado
    // sin plantilla, abrimos el wizard para armar el itinerario"), mostrar
    // otra vez un formulario de fecha editable completo se siente como
    // "me lo vuelven a preguntar" para el usuario, aunque técnicamente ya
    // esté prellenado - se reemplaza por un resumen compacto con opción de
    // cambiarlas si hace falta.
    this.datesPrefilled = !!(prefill?.tripStartDate && prefill?.tripEndDate);
    this.showDateEditor = false;

    if (prefill) {
      this.resetWizardData();
      Object.assign(this.wizardData, prefill);
    } else {
      // Intentar cargar datos guardados
      const hasStoredData = this.loadFromSessionStorage();

      if (!hasStoredData) {
        this.resetWizardData();
      } else {
        // Mostrar notificación de que se recuperó progreso
        window.Notifications?.show('✅ Se recuperó tu progreso anterior', 'success');
      }
    }

    this.renderWizard();
  },

  /**
   * Resetea los datos del wizard
   */
  resetWizardData() {
    this.wizardData = {
      cities: [],
      dayAllocationMode: 'auto',
      cityStops: [],
      totalDays: 7,
      dailyBudget: 10000,
      groupSize: 1,
      travelerAges: [],
      tripStartDate: null,
      tripEndDate: null,
      arrivalTime: null,
      arrivalAirport: null,
      departureAirport: null,
      dietaryRestrictions: [],
      mobilityNeeds: null,
      interests: [],
      interestWeights: {}, // 🆕 {interestId: 1-5}
      pace: 'moderate', // light, moderate, packed, extreme, maximum
      startTime: 9,
      companionType: null, // solo, couple, family, seniors, friends
      hotels: {},
      mustSee: [],
      avoid: []
    };
  },

  /**
   * Renderiza el wizard completo
   */
  renderWizard() {
    const modalHTML = `
      <div id="smartGeneratorWizard" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

          <!-- Header -->
          <div class="wizard-hero-banner p-4 sm:p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg sm:text-2xl font-bold">🧠 Generador Inteligente de Itinerarios</h2>
                <p class="text-blue-100 mt-1 hidden sm:block">Crea un itinerario completo basado en tus preferencias</p>
              </div>
              <button onclick="window.SmartGeneratorWizard.close()" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Progress Bar -->
            <div class="mt-3 sm:mt-6 flex items-center gap-2">
              ${this.renderProgressBar()}
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6">
            ${this.renderStepContent()}
          </div>

          <!-- Footer Navigation -->
          <div class="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-6 flex justify-between gap-2">
            ${this.renderFooterButtons()}
          </div>

        </div>
      </div>
    `;

    // Insertar en el DOM
    const existingModal = document.getElementById('smartGeneratorWizard');
    if (existingModal) {
      existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Restaurar valores guardados en los inputs
    this.restoreFormValues();

    // 🆕 La barra de días arrastrable necesita listeners de pointer events +
    // SortableJS que no se pueden expresar como atributos inline onclick=""
    // (a diferencia del resto del wizard) - solo hace algo si el DOM de la
    // fase 'days' existe (attachHandlers() retorna temprano si no).
    if (this.currentStep === 1 && this.step1Phase === 'days' && this.wizardData.dayAllocationMode === 'manual') {
      DayAllocationBar.attachHandlers();
    }
  },

  /**
   * Renderiza la barra de progreso
   */
  renderProgressBar() {
    const steps = [
      { num: 1, label: 'Básico', icon: '🌏' },
      { num: 2, label: 'Preferencias', icon: '❤️' },
      { num: 3, label: 'Hoteles', icon: '🏨' }
    ];

    return steps.map(step => {
      const isActive = step.num === this.currentStep;
      const isCompleted = step.num < this.currentStep;

      return `
        <div class="flex-1 flex items-center gap-2">
          <div class="${isActive ? 'bg-white text-blue-600' : isCompleted ? 'bg-green-500 text-white' : 'bg-white/30 text-white'}
                      w-10 h-10 rounded-full flex items-center justify-center font-bold transition">
            ${isCompleted ? '✓' : step.icon}
          </div>
          <span class="${isActive ? 'text-white font-semibold' : 'text-blue-100'} text-sm">${step.label}</span>
          ${step.num < 3 ? '<div class="flex-1 h-1 bg-white/30 rounded mx-2"></div>' : ''}
        </div>
      `;
    }).join('');
  },

  /**
   * Renderiza el contenido del paso actual
   */
  renderStepContent() {
    switch(this.currentStep) {
      case 1: return this.renderStep1();
      case 2: return this.renderStep2();
      case 3: return this.renderStep3();
      default: return '';
    }
  },

  /**
   * STEP 1: mini-flow interno (basics -> map -> days). Firma sin cambios -
   * sigue siendo lo único que renderStepContent() llama para el caso 1, así
   * que la barra de progreso externa y el resto del wizard no se enteran de
   * este split.
   */
  renderStep1() {
    switch (this.step1Phase) {
      case 'map': return this.renderStep1Map();
      case 'days': return this.renderStep1Days();
      case 'basics':
      default: return this.renderStep1Basics();
    }
  },

  /**
   * 🆕 Decide a qué fase interna del Step 1 avanzar/retroceder, validando lo
   * mínimo necesario en cada transición y sembrando el reparto de días antes
   * de mostrar la fase 'days' (para que la suma nunca empiece desbalanceada).
   */
  goToStep1Phase(phase) {
    if (phase === 'map' && this.step1Phase === 'basics') {
      this.saveStep1Data();
      if (!this.validateField('totalDays')) return;
      if (!this.validateField('dailyBudget')) return;
    }
    if (phase === 'days' && this.step1Phase === 'map') {
      if (this.wizardData.cities.length === 0) {
        window.Notifications?.show('❌ Selecciona al menos una ciudad', 'error');
        return;
      }
      if (this.wizardData.totalDays < this.wizardData.cities.length) {
        window.Notifications?.show(`❌ Necesitas al menos ${this.wizardData.cities.length} días para ${this.wizardData.cities.length} ciudades (1 día mínimo por ciudad)`, 'error');
        return;
      }
      // Ciudad única + modo auto: el reparto de días no aplica, saltar directo al Step 2
      if (this.wizardData.cityStops.length <= 1 && this.wizardData.dayAllocationMode === 'auto') {
        this.step1Phase = 'days'; // por si el usuario vuelve atrás desde Step 2
        this.saveToSessionStorage();
        this.currentStep = 2;
        this.renderWizard();
        return;
      }
      // Solo sembrar si falta info (días nulos o la suma no cuadra) - si el
      // usuario ya ajustó el reparto y vuelve a entrar a esta fase, NO
      // queremos pisar sus cambios con un reseeding determinístico.
      if (this.wizardData.dayAllocationMode === 'manual') {
        const stops = this.wizardData.cityStops;
        const hasNulls = stops.some(s => !s.days || s.days < 1);
        const sum = stops.reduce((s, x) => s + (x.days || 0), 0);
        if (hasNulls || sum !== this.wizardData.totalDays) {
          this.seedEvenDayAllocation();
        }
      }
    }
    this.step1Phase = phase;
    this.saveToSessionStorage();
    this.renderWizard();
  },

  /**
   * 🆕 Ciudad tocada en el mapa: toggle real (agrega si no estaba, quita si
   * ya estaba - incluye todas sus paradas repetidas, ya que "deseleccionar
   * una ciudad" es un concepto binario para el usuario). La primera versión
   * solo agregaba por tap (nunca quitaba, solo vía el "×" del chip) para
   * evitar ambigüedad - probado con usuarios reales, resultó poco intuitivo:
   * tocar una ciudad ya elegida y que no pase nada se siente roto. Repetir
   * una ciudad sigue siendo exclusivamente vía el "+" del chip (eso sí
   * necesita ser una acción explícita, separada de un tap normal).
   */
  toggleCityFromMap(cityKey) {
    const displayName = this.cityLabel(cityKey);
    const idx = this.wizardData.cities.indexOf(displayName);
    if (idx === -1) {
      this.wizardData.cities.push(displayName);
    } else {
      this.wizardData.cities.splice(idx, 1);
    }
    this.syncCityStopsWithCities();
    this.applyAirportOrderingToStops();
    this.saveToSessionStorage();
    CityRouteMap.refresh();
  },

  /**
   * FASE 1a: todo lo que antes vivía en un único Step 1 gigante, MENOS
   * ciudades y reparto de días (ahora son sus propias fases). Sin cambios de
   * contenido/validación respecto al Step 1 original.
   */
  renderStep1Basics() {
    return `
      <div class="space-y-6 animate-fadeInUp">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">📍 Configuración Básica</h3>

        <!-- 🆕 Load from Template Button -->
        <div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-bold text-gray-800 dark:text-white mb-1">🚀 ¿Prefieres empezar con una plantilla?</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">Carga un itinerario pre-diseñado y personalízalo a tu gusto</p>
            </div>
            <button
              onclick="window.SmartGeneratorWizard.showTemplateSelector()"
              class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              📋 Ver Plantillas
            </button>
          </div>
        </div>

        <!-- Fechas del viaje -->
        ${this.datesPrefilled && !this.showDateEditor ? `
        <div class="flex items-center justify-between gap-3 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📅</span>
            <div>
              <p class="font-semibold text-gray-800 dark:text-white">
                ${this.formatDateRangeEs(this.wizardData.tripStartDate, this.wizardData.tripEndDate)}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Ya tenemos las fechas de tu viaje (${this.wizardData.totalDays} días)</p>
            </div>
          </div>
          <button type="button" onclick="window.SmartGeneratorWizard.toggleDateEditor()"
                  class="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
            Cambiar
          </button>
        </div>
        ` : `
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              📅 Fecha de inicio
            </label>
            <input
              type="date"
              id="tripStartDate"
              value="${this.wizardData.tripStartDate || ''}"
              onchange="window.SmartGeneratorWizard.updateTripDates()"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            >
            <p class="text-xs text-gray-500 mt-1">Para detectar eventos estacionales</p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              📅 Fecha de fin
            </label>
            <input
              type="date"
              id="tripEndDate"
              value="${this.wizardData.tripEndDate || ''}"
              onchange="window.SmartGeneratorWizard.updateTripDates()"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            >
          </div>
        </div>
        `}

        <!-- Aeropuertos de llegada/salida -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              🛬 ¿A qué aeropuerto llegas? (Opcional)
            </label>
            <select
              id="arrivalAirport"
              onchange="window.SmartGeneratorWizard.updateAirports()"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            >
              ${this.renderAirportOptions(this.wizardData.arrivalAirport)}
            </select>
            <p id="arrivalAirportNote" class="text-xs text-gray-500 mt-1">${this.getAirportNote(this.wizardData.arrivalAirport) || 'Usamos esto para que tu ruta empiece donde aterrizas'}</p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              🛫 ¿Desde cuál sales? (Opcional)
            </label>
            <select
              id="departureAirport"
              onchange="window.SmartGeneratorWizard.updateAirports()"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            >
              ${this.renderAirportOptions(this.wizardData.departureAirport)}
            </select>
            <p id="departureAirportNote" class="text-xs text-gray-500 mt-1">${this.getAirportNote(this.wizardData.departureAirport) || 'Para que el último día termines cerca de tu vuelo'}</p>
          </div>
        </div>

        <!-- Hora de llegada (jetlag-aware día 1) -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🛬 ¿A qué hora aterrizas en Japón el día 1? (Opcional)
          </label>
          <input
            type="time"
            id="arrivalTime"
            value="${this.wizardData.arrivalTime || ''}"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
          >
          <p class="text-xs text-gray-500 mt-1">Si llegas en la tarde/noche, el día 1 se deja ligero o vacío por el jetlag. Si llegas temprano, se agregan 2-3 actividades suaves.</p>
        </div>

        <!-- Días totales -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ¿Cuántos días durará tu viaje? <span class="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="totalDays"
            min="1"
            max="30"
            value="${this.wizardData.totalDays}"
            onchange="window.SmartGeneratorWizard.validateField('totalDays')"
            oninput="window.SmartGeneratorWizard.validateField('totalDays')"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            placeholder="Ej: 7"
          >
          <p class="text-xs text-gray-500 mt-1">Se calcula automático con las fechas o configura manual</p>
          <div id="totalDaysError" class="hidden mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">⚠️ El viaje debe durar al menos 1 día</p>
          </div>
        </div>

        <!-- Grupo de viajeros -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              👥 ¿Cuántas personas viajan?
            </label>
            <input
              type="number"
              id="groupSize"
              min="1"
              max="20"
              value="${this.wizardData.groupSize}"
              onchange="window.SmartGeneratorWizard.updateGroupSize()"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
              placeholder="Ej: 2"
            >
            <p class="text-xs text-gray-500 mt-1">Afecta recomendaciones de restaurantes</p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              🎂 Edades (separadas por comas)
            </label>
            <input
              type="text"
              id="travelerAges"
              value="${this.wizardData.travelerAges.join(', ')}"
              placeholder="Ej: 30, 28, 5"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            >
            <p class="text-xs text-gray-500 mt-1">Para actividades familiares o seniors</p>
          </div>
        </div>

        <!-- Presupuesto diario -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ¿Cuál es tu presupuesto diario? (JPY) <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
            <input
              type="number"
              id="dailyBudget"
              min="3000"
              max="100000"
              step="1000"
              value="${this.wizardData.dailyBudget}"
              onchange="window.SmartGeneratorWizard.validateField('dailyBudget')"
              oninput="window.SmartGeneratorWizard.validateField('dailyBudget')"
              class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
              placeholder="Ej: 10000"
            >
          </div>
          <div class="flex gap-2 mt-2">
            <button onclick="document.getElementById('dailyBudget').value = 5000; window.SmartGeneratorWizard.validateField('dailyBudget');" class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
              ¥5,000 (Económico)
            </button>
            <button onclick="document.getElementById('dailyBudget').value = 10000; window.SmartGeneratorWizard.validateField('dailyBudget');" class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
              ¥10,000 (Moderado)
            </button>
            <button onclick="document.getElementById('dailyBudget').value = 20000; window.SmartGeneratorWizard.validateField('dailyBudget');" class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
              ¥20,000 (Premium)
            </button>
          </div>
          <div id="dailyBudgetError" class="hidden mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">⚠️ El presupuesto debe ser al menos ¥3,000</p>
          </div>

          <!-- 🆕 Preview de Presupuesto Real-Time -->
          <div id="budgetPreview" class="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-bold text-gray-800 dark:text-white text-sm">💰 Estimación de Presupuesto Total</h4>
              <span class="text-2xl font-bold text-blue-600 dark:text-blue-400" id="totalBudgetPreview">¥70,000</span>
            </div>

            <div class="grid grid-cols-2 gap-2 mb-3">
              <div class="bg-white/60 dark:bg-gray-800/60 p-2 rounded">
                <div class="text-xs text-gray-500 dark:text-gray-400">Actividades (40%)</div>
                <div class="font-semibold text-sm text-gray-700 dark:text-gray-300" id="activitiesBudgetPreview">¥28,000</div>
              </div>
              <div class="bg-white/60 dark:bg-gray-800/60 p-2 rounded">
                <div class="text-xs text-gray-500 dark:text-gray-400">Comidas (35%)</div>
                <div class="font-semibold text-sm text-gray-700 dark:text-gray-300" id="mealsBudgetPreview">¥24,500</div>
              </div>
              <div class="bg-white/60 dark:bg-gray-800/60 p-2 rounded">
                <div class="text-xs text-gray-500 dark:text-gray-400">Transporte (25%)</div>
                <div class="font-semibold text-sm text-gray-700 dark:text-gray-300" id="transportBudgetPreview">¥17,500</div>
              </div>
              <div class="bg-white/60 dark:bg-gray-800/60 p-2 rounded">
                <div class="text-xs text-gray-500 dark:text-gray-400">Hotel estimado</div>
                <div class="font-semibold text-sm text-gray-700 dark:text-gray-300" id="hotelBudgetPreview">¥420,000</div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
              <span class="text-xs text-gray-600 dark:text-gray-400">Presupuesto Total Estimado</span>
              <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400" id="grandTotalPreview">¥490,000</span>
            </div>

            <div class="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
              <p class="text-xs text-yellow-800 dark:text-yellow-300" id="budgetComparison">
                📊 Promedio para viajeros similares: ¥450,000 - <span class="font-semibold">Tu presupuesto es 9% mayor</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Restricciones dietarias -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🍽️ Restricciones alimentarias (opcional)
          </label>
          <div class="grid grid-cols-2 gap-2">
            ${this.renderDietaryCheckbox('vegetarian', '🥗 Vegetariano')}
            ${this.renderDietaryCheckbox('vegan', '🌱 Vegano')}
            ${this.renderDietaryCheckbox('halal', '☪️ Halal')}
            ${this.renderDietaryCheckbox('kosher', '✡️ Kosher')}
            ${this.renderDietaryCheckbox('gluten-free', '🌾 Sin gluten')}
            ${this.renderDietaryCheckbox('no-seafood', '🚫🐟 Sin mariscos')}
          </div>
        </div>

        <!-- Necesidades de movilidad -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ♿ Necesidades de accesibilidad (opcional)
          </label>
          <div class="grid grid-cols-3 gap-2">
            ${this.renderMobilityOption('none', '✅ Sin limitaciones')}
            ${this.renderMobilityOption('limited', '🚶 Movilidad limitada')}
            ${this.renderMobilityOption('wheelchair', '♿ Silla de ruedas')}
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            onclick="window.SmartGeneratorWizard.goToStep1Phase('map')"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Elegir ciudades →
          </button>
        </div>
      </div>
    `;
  },

  /**
   * FASE 1b: mapa clicable de ciudades (reemplaza el grid de checkboxes de
   * texto). CityRouteMap.render() maneja el SVG + los chips de la ruta.
   */
  renderStep1Map() {
    return `
      <div class="space-y-4 animate-fadeInUp">
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">🗺️ ¿Qué ciudades quieres visitar?</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Toca las ciudades en el mapa para armar tu ruta. Puedes repetir una ciudad (ej. si vuelves antes del vuelo de salida) desde su chip.</p>
        </div>

        ${CityRouteMap.render(this.wizardData)}

        <div id="citiesError" class="hidden mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-sm text-red-600 dark:text-red-400">⚠️ Debes seleccionar al menos una ciudad</p>
        </div>

        <div class="flex justify-between pt-2">
          <button
            onclick="window.SmartGeneratorWizard.goToStep1Phase('basics')"
            class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            ← Atrás
          </button>
          <button
            onclick="window.SmartGeneratorWizard.goToStep1Phase('days')"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Siguiente →
          </button>
        </div>
      </div>
    `;
  },

  /**
   * FASE 1c: reparto de días entre las paradas elegidas, vía la barra
   * segmentada arrastrable (DayAllocationBar) - el reparto siempre suma
   * exacto a totalDays por construcción (seedEvenDayAllocation + clamp en
   * cada drag), así que no hace falta la validación "asignados X/Y" que
   * tenía el builder numérico anterior.
   */
  renderStep1Days() {
    return `
      <div class="space-y-4 animate-fadeInUp">
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">📅 ¿Cómo repartimos los días?</h3>
          <div class="flex gap-2 mt-3 mb-3">
            <button
              type="button"
              onclick="window.SmartGeneratorWizard.setDayAllocationMode('auto')"
              class="flex-1 py-2 px-3 rounded-lg border-2 font-medium text-sm transition ${this.wizardData.dayAllocationMode === 'auto' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}"
            >🎲 Automático (recomendado)</button>
            <button
              type="button"
              onclick="window.SmartGeneratorWizard.setDayAllocationMode('manual')"
              class="flex-1 py-2 px-3 rounded-lg border-2 font-medium text-sm transition ${this.wizardData.dayAllocationMode === 'manual' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}"
            >✋ Yo elijo la ruta y los días</button>
          </div>
          <div id="dayAllocationBarWrap">
            ${this.wizardData.dayAllocationMode === 'manual' ? DayAllocationBar.render(this.wizardData.cityStops, this.wizardData.totalDays) : `
              <p class="text-xs text-gray-500">El generador reparte los días según tus intereses y cuánto contenido real tiene cada ciudad.</p>
            `}
          </div>
        </div>

        <div class="flex justify-between pt-2">
          <button
            onclick="window.SmartGeneratorWizard.goToStep1Phase('map')"
            class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            ← Atrás
          </button>
          <button
            onclick="window.SmartGeneratorWizard.nextStep()"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Siguiente →
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Nombre de ciudad para mostrar (fallback: capitaliza la clave)
   */
  cityLabel(cityKey) {
    return ACTIVITIES_DATABASE[cityKey]?.city || (cityKey.charAt(0).toUpperCase() + cityKey.slice(1));
  },

  /**
   * 🆕 Quita de cityStops las ciudades que ya no están marcadas, y agrega un
   * stop (días automáticos) por cada ciudad marcada que todavía no tenga uno.
   * No toca el orden ni los días de los stops que siguen siendo válidos.
   */
  syncCityStopsWithCities() {
    const cities = this.wizardData.cities;
    this.wizardData.cityStops = this.wizardData.cityStops.filter(stop => cities.includes(stop.city));
    cities.forEach(city => {
      if (!this.wizardData.cityStops.some(stop => stop.city === city)) {
        this.wizardData.cityStops.push({ city, days: null, isDayTrip: false });
      }
    });
  },

  /**
   * 🆕 Cambia entre reparto automático de días y ruta manual (con soporte
   * para repetir ciudad, ej. Tokyo -> Kyoto -> Osaka -> Tokyo).
   */
  setDayAllocationMode(mode) {
    this.wizardData.dayAllocationMode = mode;
    if (mode === 'manual') {
      if (this.wizardData.cityStops.length === 0) this.syncCityStopsWithCities();
      this.seedEvenDayAllocation();
    }
    this.saveToSessionStorage();
    this.renderWizard();
  },

  /**
   * 🆕 Reparte totalDays entre cityStops lo más parejo posible (piso +1 a las
   * primeras paradas si no divide exacto), garantizando que la suma sea
   * correcta ANTES de que el usuario toque nada - la barra de días arrastrable
   * solo transfiere días entre pares adyacentes, así que si arranca correcta
   * se mantiene correcta en cualquier secuencia de arrastres.
   */
  seedEvenDayAllocation() {
    const stops = this.wizardData.cityStops;
    const n = stops.length;
    if (n === 0) return;
    const base = Math.floor(this.wizardData.totalDays / n);
    const remainder = this.wizardData.totalDays % n;
    stops.forEach((stop, idx) => {
      stop.days = base + (idx < remainder ? 1 : 0);
    });
  },

  /**
   * 🆕 Agrega otra parada de la misma ciudad al final de la ruta (soporta
   * volver a una ciudad ya visitada, ej. Tokyo -> Kyoto -> Tokyo). Llamado
   * desde los chips del mapa (fase 'map'), así que refresca CityRouteMap.
   */
  addCityStop(city) {
    this.wizardData.cityStops.push({ city, days: null, isDayTrip: false });
    this.saveToSessionStorage();
    CityRouteMap.refresh();
  },

  /**
   * 🆕 Marca/desmarca una parada como day trip (excursión de un día sin cambiar
   * de hotel - usa el hotel de la parada anterior en vez de pedir uno propio).
   * Llamado desde el toggle 🚃 de la barra de días (fase 'days').
   */
  setCityStopDayTrip(idx, isDayTrip) {
    this.wizardData.cityStops[idx].isDayTrip = isDayTrip;
    this.saveToSessionStorage();
    DayAllocationBar.refresh();
  },

  /**
   * Quita una parada de la ruta. Llamado desde los chips del mapa (fase
   * 'map'), así que refresca CityRouteMap.
   */
  removeCityStop(idx) {
    this.wizardData.cityStops.splice(idx, 1);
    this.saveToSessionStorage();
    CityRouteMap.refresh();
  },

  // ===========================================================================
  // 🛬 AEROPUERTOS (llegada/salida): sugieren primera/última parada de la ruta
  // ===========================================================================

  /**
   * 🆕 Opciones del <select> de aeropuerto, internacionales primero
   */
  renderAirportOptions(selectedCode) {
    const { international, domestic } = getAirportSelectOptions();
    const opt = (a) => `<option value="${a.code}" ${selectedCode === a.code ? 'selected' : ''}>${a.label}</option>`;
    return `
      <option value="">No sé todavía / no aplica</option>
      <optgroup label="✈️ Internacionales (llegadas del extranjero)">
        ${international.map(opt).join('')}
      </optgroup>
      <optgroup label="🇯🇵 Domésticos">
        ${domestic.map(opt).join('')}
      </optgroup>
    `;
  },

  /**
   * 🆕 Nota descriptiva del aeropuerto seleccionado
   */
  getAirportNote(code) {
    const airport = getAirportByCode(code);
    return airport ? `💡 ${airport.note}` : '';
  },

  /**
   * Traduce las categorías internas (en inglés) a etiquetas para el usuario.
   * Se mostraban crudas ("meal", "nature") en la comparación de variaciones.
   */
  translateCategory(cat) {
    const map = {
      meal: '🍽️ Comida', food: '🍜 Gastronomía', nature: '🌿 Naturaleza',
      cultural: '⛩️ Cultura', culture: '⛩️ Cultura', history: '📜 Historia',
      shopping: '🛍️ Compras', anime: '🎮 Anime', technology: '🤖 Tecnología',
      nightlife: '🌃 Vida nocturna', photography: '📸 Fotografía',
      relax: '🧘 Relax', adventure: '🏔️ Aventura', art: '🎨 Arte',
      market: '🏮 Mercado', entertainment: '🎡 Entretenimiento', other: '📍 Otro'
    };
    return map[String(cat || '').toLowerCase()] || (cat || 'Actividad');
  },

  /**
   * 🆕 Guarda los aeropuertos elegidos y reordena la ruta manual para que
   * empiece en la ciudad de llegada y termine en la de salida (solo mueve
   * paradas existentes, nunca borra ni agrega días).
   */
  updateAirports() {
    const arrivalSelect = document.getElementById('arrivalAirport');
    const departureSelect = document.getElementById('departureAirport');
    if (arrivalSelect) this.wizardData.arrivalAirport = arrivalSelect.value || null;
    if (departureSelect) this.wizardData.departureAirport = departureSelect.value || null;

    // Actualizar notas descriptivas
    const arrivalNote = document.getElementById('arrivalAirportNote');
    if (arrivalNote) arrivalNote.textContent = this.getAirportNote(this.wizardData.arrivalAirport) || 'Usamos esto para que tu ruta empiece donde aterrizas';
    const departureNote = document.getElementById('departureAirportNote');
    if (departureNote) departureNote.textContent = this.getAirportNote(this.wizardData.departureAirport) || 'Para que el último día termines cerca de tu vuelo';

    this.applyAirportOrderingToStops();
    this.saveToSessionStorage();
    // Nota: esto corre en la fase 'basics' (los selects de aeropuerto viven
    // ahí), donde el DOM de la barra de días todavía no existe - se
    // reconstruye solo cuando el usuario llega a la fase 'days'.
  },

  /**
   * 🆕 Si hay ruta manual, mueve la parada de la ciudad del aeropuerto de
   * llegada al inicio y la del de salida al final (si esas ciudades están
   * en la ruta). No fuerza nada si el usuario eligió otras ciudades.
   */
  applyAirportOrderingToStops() {
    const stops = this.wizardData.cityStops;
    if (!stops || stops.length < 2) return;

    const arrivalCity = getAirportByCode(this.wizardData.arrivalAirport)?.cityKey;
    const departureCity = getAirportByCode(this.wizardData.departureAirport)?.cityKey;

    if (arrivalCity && stops[0].city.toLowerCase() !== arrivalCity) {
      const idx = stops.findIndex(s => s.city.toLowerCase() === arrivalCity);
      if (idx > 0) {
        const [stop] = stops.splice(idx, 1);
        stops.unshift(stop);
      }
    }

    if (departureCity && stops[stops.length - 1].city.toLowerCase() !== departureCity) {
      // Buscar desde el final (por si la ciudad se repite, mover la última instancia)
      let idx = -1;
      for (let i = stops.length - 1; i >= 0; i--) {
        if (stops[i].city.toLowerCase() === departureCity) { idx = i; break; }
      }
      // No mover la parada que ya es la primera (llegada) salvo que haya más de una
      if (idx >= 0 && idx < stops.length - 1 && !(idx === 0 && arrivalCity === departureCity && stops.length > 1 && !stops.slice(1).some(s => s.city.toLowerCase() === departureCity))) {
        if (idx > 0 || stops.filter(s => s.city.toLowerCase() === departureCity).length > 1) {
          const [stop] = stops.splice(idx, 1);
          stops.push(stop);
        }
      }
    }
  },

  /**
   * 🆕 Warning suave (no bloquea) si la ruta no empieza/termina cerca de los
   * aeropuertos elegidos. Devuelve lista de mensajes para mostrar.
   */
  getAirportRouteWarnings() {
    const warnings = [];
    const arrival = getAirportByCode(this.wizardData.arrivalAirport);
    const departure = getAirportByCode(this.wizardData.departureAirport);

    // Determinar primera/última ciudad efectiva de la ruta
    let firstCity = null, lastCity = null;
    if (this.wizardData.dayAllocationMode === 'manual' && this.wizardData.cityStops.length > 0) {
      firstCity = this.wizardData.cityStops[0].city.toLowerCase();
      lastCity = this.wizardData.cityStops[this.wizardData.cityStops.length - 1].city.toLowerCase();
    } else if (this.wizardData.cities.length > 0) {
      // En modo auto el generador ya ordena por aeropuerto, solo avisar si la
      // ciudad del aeropuerto NI SIQUIERA está entre las elegidas
      firstCity = lastCity = null;
      if (arrival?.cityKey && !this.wizardData.cities.some(c => arrival.nearbyCities.includes(c.toLowerCase()))) {
        warnings.push(`🛬 Llegas a ${arrival.label} pero ninguna ciudad de tu viaje está cerca de ese aeropuerto. Considera agregar ${arrival.cityKey.charAt(0).toUpperCase() + arrival.cityKey.slice(1)} o revisar tu aeropuerto.`);
      }
      if (departure?.cityKey && !this.wizardData.cities.some(c => departure.nearbyCities.includes(c.toLowerCase()))) {
        warnings.push(`🛫 Sales desde ${departure.label} pero ninguna ciudad de tu viaje está cerca. El último día podrías necesitar un traslado largo.`);
      }
      return warnings;
    }

    const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    if (arrival?.cityKey && firstCity && !arrival.nearbyCities.includes(firstCity)) {
      warnings.push(`🛬 Tu ruta empieza en ${cap(firstCity)} pero aterrizas en ${arrival.label}. El día 1 tendrás un traslado largo con el jetlag encima — considera empezar en ${cap(arrival.cityKey)}.`);
    }
    if (departure?.cityKey && lastCity && !departure.nearbyCities.includes(lastCity)) {
      warnings.push(`🛫 Tu ruta termina en ${cap(lastCity)} pero tu vuelo sale de ${departure.label}. Deja margen para el traslado el último día.`);
    }
    return warnings;
  },

  /**
   * Helper para renderizar checkbox de restricción dietaria
   */
  renderDietaryCheckbox(restriction, label) {
    const isChecked = this.wizardData.dietaryRestrictions.includes(restriction);
    return `
      <label class="flex items-center gap-2 p-2 border ${isChecked ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-300 dark:border-gray-600'}
                     rounded-lg cursor-pointer hover:border-green-400 transition">
        <input
          type="checkbox"
          class="dietary-checkbox w-4 h-4"
          data-restriction="${restriction}"
          ${isChecked ? 'checked' : ''}
        >
        <span class="text-sm text-gray-700 dark:text-gray-200">${label}</span>
      </label>
    `;
  },

  /**
   * Helper para renderizar opción de movilidad
   */
  renderMobilityOption(type, label) {
    const isSelected = (type === 'none' && !this.wizardData.mobilityNeeds) || this.wizardData.mobilityNeeds === type;
    return `
      <label class="flex items-center gap-2 p-2 border ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'border-gray-300 dark:border-gray-600'}
                     rounded-lg cursor-pointer hover:border-purple-400 transition">
        <input
          type="radio"
          name="mobilityNeeds"
          class="mobility-radio w-4 h-4"
          data-mobility="${type}"
          ${isSelected ? 'checked' : ''}
        >
        <span class="text-sm text-gray-700 dark:text-gray-200">${label}</span>
      </label>
    `;
  },

  /**
   * ✅ Inline validation for individual fields
   */
  validateField(fieldName) {
    let isValid = true;
    let errorElement, inputElement, containerElement;

    switch(fieldName) {
      case 'cities':
        // Save data first
        this.saveStep1Data();
        errorElement = document.getElementById('citiesError');
        containerElement = document.getElementById('citiesContainer');

        if (this.wizardData.cities.length === 0) {
          isValid = false;
          if (errorElement) errorElement.classList.remove('hidden');
          if (containerElement) containerElement.classList.add('ring-2', 'ring-red-500', 'rounded-lg');
        } else {
          if (errorElement) errorElement.classList.add('hidden');
          if (containerElement) containerElement.classList.remove('ring-2', 'ring-red-500');
        }
        break;

      case 'totalDays':
        inputElement = document.getElementById('totalDays');
        errorElement = document.getElementById('totalDaysError');
        const days = parseInt(inputElement?.value) || 0;
        const cityCount = this.wizardData.cities.length;
        const errorText = errorElement?.querySelector('p');

        if (days < 1 || (cityCount > 0 && days < cityCount)) {
          isValid = false;
          if (errorText) {
            errorText.textContent = days < 1
              ? '⚠️ El viaje debe durar al menos 1 día'
              : `⚠️ Necesitas al menos ${cityCount} días para ${cityCount} ciudades (1 día mínimo por ciudad)`;
          }
          if (errorElement) errorElement.classList.remove('hidden');
          if (inputElement) {
            inputElement.classList.remove('border-gray-300', 'dark:border-gray-600');
            inputElement.classList.add('border-red-500', 'dark:border-red-500');
          }
        } else {
          if (errorElement) errorElement.classList.add('hidden');
          if (inputElement) {
            inputElement.classList.remove('border-red-500', 'dark:border-red-500');
            inputElement.classList.add('border-gray-300', 'dark:border-gray-600');
          }
        }
        // 🆕 Actualizar preview de presupuesto
        this.updateBudgetPreview();
        this.wizardData.totalDays = days;
        // Nota: esto corre en la fase 'basics' - la barra de días (fase
        // 'days') se reconstruye desde wizardData cuando el usuario llega
        // ahí, así que no hace falta refrescarla mientras no es visible.
        break;

      case 'dailyBudget':
        inputElement = document.getElementById('dailyBudget');
        errorElement = document.getElementById('dailyBudgetError');
        const budget = parseInt(inputElement?.value) || 0;

        if (budget < 3000) {
          isValid = false;
          if (errorElement) errorElement.classList.remove('hidden');
          if (inputElement) {
            inputElement.classList.remove('border-gray-300', 'dark:border-gray-600');
            inputElement.classList.add('border-red-500', 'dark:border-red-500');
          }
        } else {
          if (errorElement) errorElement.classList.add('hidden');
          if (inputElement) {
            inputElement.classList.remove('border-red-500', 'dark:border-red-500');
            inputElement.classList.add('border-gray-300', 'dark:border-gray-600');
          }
        }
        // 🆕 Actualizar preview de presupuesto
        this.updateBudgetPreview();
        break;

      case 'interests':
        // Save data first
        this.saveStep2Data();
        errorElement = document.getElementById('interestsError');
        containerElement = document.getElementById('interestsContainer');

        if (this.wizardData.interests.length === 0) {
          isValid = false;
          if (errorElement) errorElement.classList.remove('hidden');
          if (containerElement) containerElement.classList.add('ring-2', 'ring-red-500', 'rounded-lg', 'p-2');
        } else {
          if (errorElement) errorElement.classList.add('hidden');
          if (containerElement) containerElement.classList.remove('ring-2', 'ring-red-500', 'p-2');
        }
        break;
    }

    return isValid;
  },

  /**
   * STEP 2: Preferencias (Intereses, Intensity, Companion, Hora inicio)
   * NUEVO: Con Intensity Levels slider y Companion Type selector
   */
  renderStep2() {
    const allInterests = [
      { id: 'cultural', label: 'Cultura & Templos', icon: '⛩️' },
      { id: 'food', label: 'Gastronomía', icon: '🍜' },
      { id: 'shopping', label: 'Compras', icon: '🛍️' },
      { id: 'nature', label: 'Naturaleza', icon: '🌸' },
      { id: 'art', label: 'Arte & Museos', icon: '🎨' },
      { id: 'anime', label: 'Anime & Manga', icon: '🎌' },
      { id: 'nightlife', label: 'Vida Nocturna', icon: '🌃' },
      { id: 'technology', label: 'Tecnología', icon: '🤖' },
      { id: 'history', label: 'Historia', icon: '📜' },
      { id: 'photography', label: 'Fotografía', icon: '📸' }
    ];

    // Intensity levels data
    const intensityLevels = ['light', 'moderate', 'packed', 'extreme', 'maximum'];
    const intensityLabels = {
      light: { icon: '🐢', label: 'Tranquilo', desc: '2-3/día' },
      moderate: { icon: '🚶', label: 'Moderado', desc: '4-5/día' },
      packed: { icon: '🏃', label: 'Intenso', desc: '6-8/día' },
      extreme: { icon: '⚡', label: 'Extremo', desc: '9-11/día' },
      maximum: { icon: '🌪️', label: 'Máximo', desc: '12-15/día' }
    };
    const currentIntensityIndex = intensityLevels.indexOf(this.wizardData.pace);

    return `
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">❤️ Tus Preferencias</h3>

        <!-- Intereses -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ¿Qué te interesa? (Selecciona varios) <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="interestsContainer">
            ${allInterests.map(interest => this.renderInterestCheckbox(interest)).join('')}
          </div>
          <p class="text-xs text-gray-500 mt-2">Selecciona al menos un interés para personalizar tu itinerario</p>
          <div id="interestsError" class="hidden mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">⚠️ Debes seleccionar al menos un interés</p>
          </div>
        </div>

        <!-- ⚡ INTENSITY LEVELS SLIDER -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ⚡ Intensidad del Viaje: <span class="text-blue-600 dark:text-blue-400 font-bold" id="intensityLabel">${intensityLabels[this.wizardData.pace].icon} ${intensityLabels[this.wizardData.pace].label}</span>
          </label>
          <div class="px-2">
            <input
              type="range"
              id="intensitySlider"
              min="0"
              max="4"
              step="1"
              value="${currentIntensityIndex}"
              class="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 dark:from-green-800 dark:via-yellow-800 dark:to-red-800 rounded-lg appearance-none cursor-pointer"
              style="accent-color: #3b82f6;"
              onchange="window.SmartGeneratorWizard.updateIntensity(this.value)"
            >
            <div class="flex justify-between text-xs text-gray-500 mt-2 px-1">
              ${intensityLevels.map((level, idx) => `
                <div class="text-center flex-1">
                  <div class="text-lg">${intensityLabels[level].icon}</div>
                  <div class="font-medium">${intensityLabels[level].label}</div>
                  <div class="text-gray-400">${intensityLabels[level].desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">💡 Días más llenos = más actividades y experiencias</p>
        </div>

        <!-- 👥 COMPANION TYPE SELECTOR -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            👥 ¿Con quién viajas?
          </label>
          <div class="grid grid-cols-2 gap-3">
            ${this.renderCompanionOption(null, 'Sin especificar', '👤', 'Genérico')}
            ${this.renderCompanionOption('solo', 'Viajo sola/o', '🧍', 'Flexible')}
            ${this.renderCompanionOption('couple', 'Pareja', '❤️', 'Romántico')}
            ${this.renderCompanionOption('family', 'Familia', '👨‍👩‍👧‍👦', 'Pausado')}
            ${this.renderCompanionOption('seniors', 'Seniors', '👴👵', 'Relajado')}
            ${this.renderCompanionOption('friends', 'Amigos', '🎉', 'Intenso')}
          </div>
        </div>

        <!-- 🔧 Antes había un <select> "¿A qué hora prefieres empezar tus días?"
             que el usuario podía cambiar libremente, pero smart-itinerary-
             generator.js (generateSingleDay(), línea ~1466) SIEMPRE usa
             intensityConfig.startTime (derivado del ritmo/intensidad de
             arriba) para armar el día - la selección del usuario nunca
             llegaba a afectar nada. Mostrar un control editable que en
             realidad no hace nada rompe la confianza en el resto de los
             controles que sí funcionan. En vez de arreglar esto tocando la
             lógica central de generación (mayor riesgo, sin poder probarlo
             contigo ahora), se reemplaza por un indicador honesto: la hora
             real que va a usar, derivada del ritmo elegido, actualizada en
             vivo si cambias el slider de arriba. -->
        <div id="startTimeInfo" class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          ${this.renderStartTimeInfo()}
        </div>
      </div>
    `;
  },

  /**
   * 🆕 Hora real de inicio del día, derivada del ritmo elegido (la única
   * que el generador realmente usa) - ver comentario arriba.
   */
  renderStartTimeInfo() {
    const hour = window.INTENSITY_LEVELS?.[this.wizardData.pace]?.startTime ?? 9;
    const hourLabel = hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
    return `⏰ Con el ritmo que elegiste, tus días suelen empezar cerca de las <strong>${hourLabel}</strong>.`;
  },

  /**
   * Actualiza la intensidad del viaje
   */
  updateIntensity(value) {
    const intensityLevels = ['light', 'moderate', 'packed', 'extreme', 'maximum'];
    const intensityLabels = {
      light: { icon: '🐢', label: 'Tranquilo' },
      moderate: { icon: '🚶', label: 'Moderado' },
      packed: { icon: '🏃', label: 'Intenso (¡días llenos!)' },
      extreme: { icon: '⚡', label: 'Extremo' },
      maximum: { icon: '🌪️', label: 'Máximo' }
    };

    this.wizardData.pace = intensityLevels[parseInt(value)];
    const label = intensityLabels[this.wizardData.pace];

    const labelElement = document.getElementById('intensityLabel');
    if (labelElement) {
      labelElement.textContent = `${label.icon} ${label.label}`;
    }

    const startTimeInfoElement = document.getElementById('startTimeInfo');
    if (startTimeInfoElement) {
      startTimeInfoElement.innerHTML = this.renderStartTimeInfo();
    }

    this.saveToSessionStorage();
  },

  /**
   * 🆕 Actualiza las fechas del viaje y calcula días automáticamente
   */
  updateTripDates() {
    const startInput = document.getElementById('tripStartDate');
    const endInput = document.getElementById('tripEndDate');
    const totalDaysInput = document.getElementById('totalDays');

    if (startInput && endInput && startInput.value && endInput.value) {
      const startDate = new Date(startInput.value);
      const endDate = new Date(endInput.value);

      // Calcular días entre fechas
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días

      if (totalDaysInput && diffDays > 0) {
        totalDaysInput.value = diffDays;
        this.wizardData.totalDays = diffDays;
        this.validateField('totalDays');
      }
    }

    if (startInput) this.wizardData.tripStartDate = startInput.value || null;
    if (endInput) this.wizardData.tripEndDate = endInput.value || null;

    this.saveToSessionStorage();
  },

  /**
   * 🆕 Muestra los inputs de fecha editables en vez del resumen compacto
   * (solo relevante cuando datesPrefilled=true, ver open()).
   */
  toggleDateEditor() {
    this.showDateEditor = true;
    this.renderWizard();
  },

  /**
   * 🆕 Formatea un rango de fechas 'YYYY-MM-DD' en español legible
   * (ej. "1 - 10 dic 2026"), para el resumen compacto de fechas ya conocidas.
   */
  formatDateRangeEs(startStr, endStr) {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const start = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T00:00:00');
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    if (sameMonth) {
      return `${start.getDate()} - ${end.getDate()} ${meses[end.getMonth()]} ${end.getFullYear()}`;
    }
    return `${start.getDate()} ${meses[start.getMonth()]} - ${end.getDate()} ${meses[end.getMonth()]} ${end.getFullYear()}`;
  },

  /**
   * 🆕 Actualiza el tamaño del grupo
   */
  updateGroupSize() {
    const groupSizeInput = document.getElementById('groupSize');
    if (groupSizeInput) {
      this.wizardData.groupSize = parseInt(groupSizeInput.value) || 1;
      this.saveToSessionStorage();
      // 🆕 Actualizar preview de presupuesto
      this.updateBudgetPreview();
    }
  },

  /**
   * Renderiza opción de companion type
   */
  renderCompanionOption(type, label, icon, desc) {
    const isSelected = this.wizardData.companionType === type;
    return `
      <label class="flex items-center gap-2 p-3 border-2 ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'border-gray-300 dark:border-gray-600'}
                     rounded-lg cursor-pointer hover:border-purple-400 transition">
        <input
          type="radio"
          name="companionType"
          class="companion-radio"
          data-companion="${type}"
          ${isSelected ? 'checked' : ''}
        >
        <span class="text-2xl">${icon}</span>
        <div class="flex-1">
          <div class="font-semibold text-sm text-gray-700 dark:text-gray-200">${label}</div>
          <div class="text-xs text-gray-500">${desc}</div>
        </div>
      </label>
    `;
  },

  /**
   * Helper para renderizar checkbox de interés + selector de peso (1-5 estrellas)
   * cuando está seleccionado. El peso deja de ser "todo o nada" - un interés en 5
   * estrellas domina el orden de actividades sugeridas mucho más que uno en 1 estrella.
   */
  renderInterestCheckbox(interest) {
    const isChecked = this.wizardData.interests.includes(interest.id);
    const weight = this.wizardData.interestWeights[interest.id] || 3;
    return `
      <div class="border-2 ${isChecked ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}
                   rounded-lg hover:border-blue-400 transition">
        <label class="flex items-center gap-3 p-3 cursor-pointer">
          <input
            type="checkbox"
            class="interest-checkbox w-5 h-5"
            data-interest="${interest.id}"
            onchange="window.SmartGeneratorWizard.toggleInterest('${interest.id}')"
            ${isChecked ? 'checked' : ''}
          >
          <span class="text-xl">${interest.icon}</span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200">${interest.label}</span>
        </label>
        ${isChecked ? `
          <div class="flex flex-wrap items-center gap-1 px-3 pb-3 -mt-1" onclick="event.stopPropagation()">
            <span class="text-xs text-gray-500 dark:text-gray-400 mr-1 whitespace-nowrap">Prioridad:</span>
            ${[1, 2, 3, 4, 5].map(n => `
              <button
                type="button"
                onclick="window.SmartGeneratorWizard.setInterestWeight('${interest.id}', ${n})"
                class="text-lg leading-none transition shrink-0"
                style="color: ${n <= weight ? '#facc15' : '#d1d5db'}"
                title="Prioridad ${n}/5"
              >★</button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Selecciona/deselecciona un interés y sincroniza su peso por defecto (3/5)
   */
  toggleInterest(interestId) {
    const idx = this.wizardData.interests.indexOf(interestId);
    if (idx === -1) {
      this.wizardData.interests.push(interestId);
      if (!this.wizardData.interestWeights[interestId]) {
        this.wizardData.interestWeights[interestId] = 3; // peso neutral por defecto
      }
    } else {
      this.wizardData.interests.splice(idx, 1);
      delete this.wizardData.interestWeights[interestId];
    }
    this.validateField('interests');
    this.saveToSessionStorage();
    this.refreshInterestsContainer();
  },

  /**
   * Cambia la prioridad (1-5) de un interés ya seleccionado
   */
  setInterestWeight(interestId, weight) {
    this.wizardData.interestWeights[interestId] = weight;
    this.saveToSessionStorage();
    this.refreshInterestsContainer();
  },

  /**
   * Re-renderiza solo la grilla de intereses (sin reconstruir todo el wizard)
   */
  refreshInterestsContainer() {
    const container = document.getElementById('interestsContainer');
    if (!container) return;
    const allInterests = [
      { id: 'cultural', label: 'Cultura & Templos', icon: '⛩️' },
      { id: 'food', label: 'Gastronomía', icon: '🍜' },
      { id: 'shopping', label: 'Compras', icon: '🛍️' },
      { id: 'nature', label: 'Naturaleza', icon: '🌸' },
      { id: 'art', label: 'Arte & Museos', icon: '🎨' },
      { id: 'anime', label: 'Anime & Manga', icon: '🎌' },
      { id: 'nightlife', label: 'Vida Nocturna', icon: '🌃' },
      { id: 'technology', label: 'Tecnología', icon: '🤖' },
      { id: 'history', label: 'Historia', icon: '📜' },
      { id: 'photography', label: 'Fotografía', icon: '📸' }
    ];
    container.innerHTML = allInterests.map(interest => this.renderInterestCheckbox(interest)).join('');
  },

  /**
   * Helper para renderizar opción de ritmo
   */
  renderPaceOption(pace, label, icon, desc) {
    const isSelected = this.wizardData.pace === pace;
    return `
      <label class="flex flex-col items-center gap-2 p-4 border-2 ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}
                     rounded-lg cursor-pointer hover:border-blue-400 transition">
        <input
          type="radio"
          name="pace"
          class="pace-radio"
          data-pace="${pace}"
          ${isSelected ? 'checked' : ''}
        >
        <span class="text-3xl">${icon}</span>
        <span class="font-semibold text-gray-700 dark:text-gray-200">${label}</span>
        <span class="text-xs text-gray-500 text-center">${desc}</span>
      </label>
    `;
  },

  /**
   * STEP 3: Hoteles & Must-See
   */
  renderStep3() {
    const selectedCities = this.wizardData.cities;
    const includesTokyo = selectedCities.some(c => c.toLowerCase() === 'tokyo');
    const includesOsaka = selectedCities.some(c => c.toLowerCase() === 'osaka');

    return `
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">🏨 Hoteles & Lugares Imperdibles</h3>

        ${includesTokyo ? YamanoteHelper.render() : ''}
        ${includesOsaka ? OsakaLoopHelper.render() : ''}

        <!-- Hoteles por ciudad -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ¿En qué hoteles te quedarás? (Opcional pero recomendado)
          </label>
          <p class="text-sm text-gray-500 mb-4">
            Esto permite que el itinerario empiece cerca de tu hotel cada día 🎯
          </p>
          <div class="space-y-3">
            ${selectedCities.map(city => this.renderHotelInput(city)).join('')}
          </div>
        </div>

        <!-- Must-See Places -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Lugares que NO te quieres perder (Opcional)
          </label>
          <div id="mustSeeList" class="space-y-2 mb-2">
            ${this.wizardData.mustSee.map((place, idx) => this.renderMustSeeItem(place, idx)).join('')}
          </div>
          <button
            onclick="window.SmartGeneratorWizard.addMustSeePlace()"
            class="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition"
          >
            + Agregar lugar imperdible
          </button>
        </div>

        <!-- Avoid Places -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Lugares o actividades que prefieres evitar (Opcional)
          </label>
          <textarea
            id="avoidPlaces"
            rows="2"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Ej: clubes, museos de guerra, lugares muy turísticos..."
          >${this.wizardData.avoid.join(', ')}</textarea>
        </div>
      </div>
    `;
  },

  /**
   * Helper para renderizar input de hotel
   */
  renderHotelInput(city) {
    const hotel = this.wizardData.hotels[city.toLowerCase()] || { name: '', area: '' };
    return `
      <div class="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">${CITY_ICONS[city.toLowerCase()] || '📍'}</span>
          <span class="font-semibold text-gray-700 dark:text-gray-200">${city}</span>
        </div>
        <div class="space-y-2">
          <input
            type="text"
            class="hotel-name-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            data-city="${city.toLowerCase()}"
            placeholder="Nombre del hotel"
            value="${hotel.name}"
          >
          <input
            type="text"
            class="hotel-area-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            data-city="${city.toLowerCase()}"
            placeholder="Área (Ej: Shinjuku, Shibuya, Gion...)"
            value="${hotel.area}"
          >
        </div>
      </div>
    `;
  },

  /**
   * Helper para renderizar item de must-see
   */
  renderMustSeeItem(place, idx) {
    return `
      <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <input
          type="text"
          class="mustSee-name-input flex-1 px-3 py-2 border-0 bg-transparent dark:text-white"
          data-idx="${idx}"
          placeholder="Nombre del lugar"
          value="${place.name}"
        >
        <select
          class="mustSee-city-select px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
          data-idx="${idx}"
        >
          <option value="">Ciudad...</option>
          ${this.wizardData.cities.map(city => `<option value="${city}" ${place.city === city ? 'selected' : ''}>${city}</option>`).join('')}
        </select>
        <button
          onclick="window.SmartGeneratorWizard.removeMustSeePlace(${idx})"
          class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
        >
          ✕
        </button>
      </div>
    `;
  },

  /**
   * Renderiza botones del footer
   */
  renderFooterButtons() {
    const isFirstStep = this.currentStep === 1;
    const isLastStep = this.currentStep === 3;
    // 🆕 Las 3 fases internas del Step 1 (basics/map/days) traen su propio
    // botón de avance inline - basics/map llaman a goToStep1Phase(), y days
    // llama directo a nextStep() (la navegación externa). Mostrar TAMBIÉN el
    // "Siguiente →" del footer externo mientras currentStep===1 duplicaba el
    // botón en pantalla (confirmado visualmente) - se oculta siempre para
    // las 3 fases, no solo basics/map.
    const hideOuterNext = this.currentStep === 1;

    return `
      <button
        onclick="window.SmartGeneratorWizard.close()"
        class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
      >
        Cancelar
      </button>
      <div class="flex gap-3">
        ${!isFirstStep ? `
          <button
            onclick="window.SmartGeneratorWizard.prevStep()"
            class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            ← Anterior
          </button>
        ` : ''}
        ${hideOuterNext ? '' : !isLastStep ? `
          <button
            onclick="window.SmartGeneratorWizard.nextStep()"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Siguiente →
          </button>
        ` : `
          <button
            onclick="window.SmartGeneratorWizard.generateItinerary()"
            class="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-semibold shadow-lg"
          >
            🚀 ¡Generar Itinerario!
          </button>
        `}
      </div>
    `;
  },

  /**
   * Restaura valores del form desde wizardData
   */
  restoreFormValues() {
    // Step 1: ciudades ahora se manejan vía el mapa (toggleCityFromMap),
    // no hay .city-checkbox que escuchar.

    // 🆕 Event listeners para nuevos campos
    document.querySelectorAll('.dietary-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.saveStep1Data());
    });

    document.querySelectorAll('.mobility-radio').forEach(radio => {
      radio.addEventListener('change', () => this.saveStep1Data());
    });

    // Step 2
    document.querySelectorAll('.interest-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.saveStep2Data());
    });

    document.querySelectorAll('.pace-radio').forEach(radio => {
      radio.addEventListener('change', () => this.saveStep2Data());
    });

    document.querySelectorAll('.companion-radio').forEach(radio => {
      radio.addEventListener('change', () => this.saveStep2Data());
    });

    // Step 3
    document.querySelectorAll('.hotel-name-input, .hotel-area-input').forEach(input => {
      input.addEventListener('input', () => this.saveStep3Data());
    });
  },

  /**
   * Guarda datos del Step 1 (fase 'basics'). wizardData.cities/cityStops ya
   * NO se leen del DOM aquí - se mutan directamente vía toggleCityFromMap()
   * y los handlers de chips del mapa. Leerlos de checkboxes que ya no
   * existen los habría vaciado silenciosamente en cada llamada (bug real
   * del código anterior).
   */
  saveStep1Data() {
    const totalDaysInput = document.getElementById('totalDays');
    if (totalDaysInput) {
      this.wizardData.totalDays = parseInt(totalDaysInput.value) || 7;
    }

    const dailyBudgetInput = document.getElementById('dailyBudget');
    if (dailyBudgetInput) {
      this.wizardData.dailyBudget = parseInt(dailyBudgetInput.value) || 10000;
    }

    // 🆕 Guardar nuevos campos de contexto
    const groupSizeInput = document.getElementById('groupSize');
    if (groupSizeInput) {
      this.wizardData.groupSize = parseInt(groupSizeInput.value) || 1;
    }

    const travelerAgesInput = document.getElementById('travelerAges');
    if (travelerAgesInput && travelerAgesInput.value.trim()) {
      this.wizardData.travelerAges = travelerAgesInput.value.split(',')
        .map(age => parseInt(age.trim()))
        .filter(age => !isNaN(age) && age > 0);
    } else {
      this.wizardData.travelerAges = [];
    }

    const tripStartDateInput = document.getElementById('tripStartDate');
    if (tripStartDateInput) {
      this.wizardData.tripStartDate = tripStartDateInput.value || null;
    }

    const tripEndDateInput = document.getElementById('tripEndDate');
    if (tripEndDateInput) {
      this.wizardData.tripEndDate = tripEndDateInput.value || null;
    }

    const arrivalTimeInput = document.getElementById('arrivalTime');
    if (arrivalTimeInput) {
      this.wizardData.arrivalTime = arrivalTimeInput.value || null;
    }

    // 🛬🛫 Aeropuertos de llegada/salida
    const arrivalAirportSelect = document.getElementById('arrivalAirport');
    if (arrivalAirportSelect) {
      this.wizardData.arrivalAirport = arrivalAirportSelect.value || null;
    }
    const departureAirportSelect = document.getElementById('departureAirport');
    if (departureAirportSelect) {
      this.wizardData.departureAirport = departureAirportSelect.value || null;
    }

    // Dietary restrictions
    this.wizardData.dietaryRestrictions = Array.from(document.querySelectorAll('.dietary-checkbox:checked'))
      .map(cb => cb.dataset.restriction);

    // Mobility needs
    const mobilityRadio = document.querySelector('.mobility-radio:checked');
    if (mobilityRadio) {
      const mobilityValue = mobilityRadio.dataset.mobility;
      this.wizardData.mobilityNeeds = mobilityValue === 'none' ? null : mobilityValue;
    }

    this.saveToSessionStorage(); // 💾 Guardar progreso
  },

  /**
   * Guarda datos del Step 2
   */
  saveStep2Data() {
    this.wizardData.interests = Array.from(document.querySelectorAll('.interest-checkbox:checked'))
      .map(cb => cb.dataset.interest);

    const paceRadio = document.querySelector('.pace-radio:checked');
    if (paceRadio) {
      this.wizardData.pace = paceRadio.dataset.pace;
    }

    // 👥 Guardar companion type
    const companionRadio = document.querySelector('.companion-radio:checked');
    if (companionRadio) {
      const companionValue = companionRadio.dataset.companion;
      this.wizardData.companionType = companionValue === 'null' ? null : companionValue;
    }

    const startTimeSelect = document.getElementById('startTime');
    if (startTimeSelect) {
      this.wizardData.startTime = parseInt(startTimeSelect.value) || 9;
    }

    this.saveToSessionStorage(); // 💾 Guardar progreso
  },

  /**
   * Guarda datos del Step 3
   */
  saveStep3Data() {
    // Hoteles
    this.wizardData.hotels = {};
    document.querySelectorAll('.hotel-name-input').forEach(input => {
      const city = input.dataset.city;
      const areaInput = document.querySelector(`.hotel-area-input[data-city="${city}"]`);
      if (input.value.trim()) {
        this.wizardData.hotels[city] = {
          name: input.value.trim(),
          area: areaInput ? areaInput.value.trim() : ''
        };
      }
    });

    // Must-See places
    this.wizardData.mustSee = [];
    document.querySelectorAll('.mustSee-name-input').forEach(input => {
      const idx = input.dataset.idx;
      const citySelect = document.querySelector(`.mustSee-city-select[data-idx="${idx}"]`);
      if (input.value.trim() && citySelect && citySelect.value) {
        this.wizardData.mustSee.push({
          name: input.value.trim(),
          city: citySelect.value
        });
      }
    });

    // Avoid places
    const avoidInput = document.getElementById('avoidPlaces');
    if (avoidInput && avoidInput.value.trim()) {
      this.wizardData.avoid = avoidInput.value.split(',').map(s => s.trim()).filter(s => s);
    } else {
      this.wizardData.avoid = [];
    }

    this.saveToSessionStorage(); // 💾 Guardar progreso
  },

  /**
   * Valida el paso actual
   */
  validateCurrentStep() {
    if (this.currentStep === 1) {
      this.saveStep1Data();
      if (this.wizardData.cities.length === 0) {
        window.Notifications?.show('❌ Selecciona al menos una ciudad', 'error');
        return false;
      }
      if (this.wizardData.totalDays < 1) {
        window.Notifications?.show('❌ El viaje debe durar al menos 1 día', 'error');
        return false;
      }
      if (this.wizardData.totalDays < this.wizardData.cities.length) {
        window.Notifications?.show(`❌ Necesitas al menos ${this.wizardData.cities.length} días para ${this.wizardData.cities.length} ciudades (1 día mínimo por ciudad)`, 'error');
        return false;
      }
      // 🆕 La validación "los días deben sumar exacto" ya no aplica: la barra
      // de días arrastrable (seedEvenDayAllocation + clamp en cada drag)
      // garantiza que cityStops siempre sume exactamente totalDays por
      // construcción - no hay forma de dejarla desbalanceada desde la UI.
    } else if (this.currentStep === 2) {
      this.saveStep2Data();
      if (this.wizardData.interests.length === 0) {
        window.Notifications?.show('❌ Selecciona al menos un interés', 'error');
        return false;
      }
    } else if (this.currentStep === 3) {
      this.saveStep3Data();
      // Step 3 es opcional, no requiere validación estricta
    }
    return true;
  },

  /**
   * Navega al siguiente paso
   */
  nextStep() {
    if (!this.validateCurrentStep()) return;

    if (this.currentStep < 3) {
      this.currentStep++;
      this.saveToSessionStorage(); // 💾 Guardar progreso
      this.renderWizard();
    }
  },

  /**
   * Navega al paso anterior
   */
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderWizard();
    }
  },

  /**
   * Cierra el wizard
   */
  close() {
    const modal = document.getElementById('smartGeneratorWizard');
    if (modal) {
      modal.remove();
    }
    // No borramos el sessionStorage aquí, solo cuando se completa o el usuario lo cancela explícitamente
  },

  /**
   * 🆕 Muestra el selector de plantillas
   */
  async showTemplateSelector() {
    try {
      // Cargar templates desde attractions.json
      const response = await fetch(`/data/attractions.json?v=${Date.now()}`);
      const data = await response.json();

      if (!data.templateInfo) {
        window.Notifications?.show('❌ No se encontraron plantillas disponibles', 'error');
        return;
      }

      const template = data.templateInfo;

      // Crear modal de selección de templates
      const modalHTML = `
        <div id="templateSelectorModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">

            <!-- Header -->
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-bold">📋 Plantillas de Itinerarios</h2>
                  <p class="text-purple-100 mt-1">Selecciona una plantilla para empezar</p>
                </div>
                <button onclick="document.getElementById('templateSelectorModal').remove()" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Template Card -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div class="border-2 border-purple-200 dark:border-purple-800 rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer"
                   onclick="window.SmartGeneratorWizard.loadTemplate('${template.id}')">

                <!-- Template Header -->
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-6 border-b-2 border-purple-200 dark:border-purple-800">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${template.name}</h3>
                      <p class="text-gray-700 dark:text-gray-300 mb-4">${template.description}</p>

                      <div class="flex flex-wrap gap-2 mb-4">
                        <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-sm font-semibold">
                          📅 ${template.duration} días
                        </span>
                        <span class="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold">
                          💰 ¥${template.totalBudget.toLocaleString()}
                        </span>
                        <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full text-sm font-semibold">
                          🏙️ ${template.cities.length} ciudades
                        </span>
                      </div>

                      <div class="flex flex-wrap gap-2">
                        ${template.cities.map(city => `
                          <span class="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs">
                            ${city}
                          </span>
                        `).join('')}
                      </div>
                    </div>

                    <div class="ml-4">
                      <div class="text-5xl">🇯🇵</div>
                    </div>
                  </div>
                </div>

                <!-- Highlights -->
                <div class="p-6 bg-white dark:bg-gray-800">
                  <h4 class="font-bold text-gray-900 dark:text-white mb-3">✨ Experiencias Destacadas:</h4>
                  <div class="grid grid-cols-2 gap-3">
                    ${template.highlights.slice(0, 8).map(highlight => `
                      <div class="flex items-start gap-2">
                        <span class="text-lg">⭐</span>
                        <span class="text-sm text-gray-700 dark:text-gray-300">${highlight}</span>
                      </div>
                    `).join('')}
                  </div>

                  <div class="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p class="text-center text-gray-800 dark:text-gray-200 font-semibold">
                      👆 Haz clic en esta tarjeta para cargar esta plantilla
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <button onclick="document.getElementById('templateSelectorModal').remove()"
                      class="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-lg transition">
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      `;

      // Agregar modal al DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);

    } catch (error) {
      console.error('❌ Error cargando templates:', error);
      window.Notifications?.show('❌ Error cargando plantillas', 'error');
    }
  },

  /**
   * 🆕 Carga una plantilla específica
   */
  async loadTemplate(templateId) {
    try {
      console.log(`🔥 Cargando template: ${templateId}`);

      // Cerrar modal de selección
      const selectorModal = document.getElementById('templateSelectorModal');
      if (selectorModal) selectorModal.remove();

      // Mostrar loading
      window.Notifications?.show('⏳ Cargando plantilla...', 'info');

      // Cargar template desde attractions.json
      const response = await fetch(`/data/attractions.json?v=${Date.now()}`);
      const data = await response.json();

      if (!data.suggestedItinerary || !data.templateInfo) {
        window.Notifications?.show('❌ Template no válido', 'error');
        return;
      }

      // 🔧 TripsManager.createTrip() escribe tripData.dateStart/dateEnd
      // directo a Firestore (info.dateStart: tripData.dateStart, sin
      // default) - esta plantilla nunca las incluía, así que setDoc()
      // rechazaba el documento entero con "Unsupported field value:
      // undefined". Como el template no trae fechas reales, se usa hoy
      // como inicio y se calcula el fin según la duración del template.
      const duration = data.templateInfo.duration || 7;
      const dateStart = new Date();
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + duration - 1);
      const toISODate = (d) => d.toISOString().split('T')[0];

      // Crear un nuevo trip con el template
      const tripData = {
        name: data.templateInfo.name,
        cities: data.templateInfo.cities,
        dateStart: toISODate(dateStart),
        dateEnd: toISODate(dateEnd),
        totalDays: duration,
        budget: data.templateInfo.totalBudget,
        status: 'draft',
        templateId: templateId,
        createdAt: new Date().toISOString()
      };

      // Crear el trip usando TripsManager
      const newTripId = await window.TripsManager.createTrip(tripData);

      if (newTripId) {
        // El template ya se cargó automáticamente en createTrip (línea 180)
        window.Notifications?.show(`✅ Plantilla "${data.templateInfo.name}" cargada con éxito`, 'success');

        // Cerrar wizard
        this.close();

        // Opcional: Redirigir al nuevo trip o recargar la vista
        setTimeout(() => {
          window.location.reload(); // O navegar al trip específico
        }, 1000);
      } else {
        window.Notifications?.show('❌ Error creando el viaje', 'error');
      }

    } catch (error) {
      console.error('❌ Error cargando template:', error);
      window.Notifications?.show('❌ Error cargando la plantilla', 'error');
    }
  },

  /**
   * 💾 Guarda el progreso en sessionStorage
   */
  saveToSessionStorage() {
    try {
      const dataToSave = {
        currentStep: this.currentStep,
        step1Phase: this.step1Phase,
        wizardData: this.wizardData,
        timestamp: Date.now()
      };
      sessionStorage.setItem('smartGeneratorWizard_progress', JSON.stringify(dataToSave));
      console.log('💾 Progreso guardado en sessionStorage');
    } catch (error) {
      console.error('❌ Error guardando progreso:', error);
    }
  },

  /**
   * 📂 Carga el progreso desde sessionStorage
   * @returns {boolean} true si se cargaron datos, false si no había datos guardados
   */
  loadFromSessionStorage() {
    try {
      const saved = sessionStorage.getItem('smartGeneratorWizard_progress');
      if (!saved) return false;

      const data = JSON.parse(saved);

      // Verificar que los datos no sean muy antiguos (más de 24 horas)
      const hoursSinceLastSave = (Date.now() - data.timestamp) / (1000 * 60 * 60);
      if (hoursSinceLastSave > 24) {
        console.log('⚠️ Progreso guardado muy antiguo, descartando...');
        this.clearSessionStorage();
        return false;
      }

      // Restaurar datos
      this.currentStep = data.currentStep || 1;
      // default 'basics' para compatibilidad con sesiones guardadas antes
      // de que existiera step1Phase
      this.step1Phase = data.step1Phase || 'basics';
      this.wizardData = data.wizardData || this.wizardData;

      console.log('📂 Progreso cargado desde sessionStorage:', data);
      return true;
    } catch (error) {
      console.error('❌ Error cargando progreso:', error);
      return false;
    }
  },

  /**
   * 🗑️ Limpia el progreso guardado
   */
  clearSessionStorage() {
    try {
      sessionStorage.removeItem('smartGeneratorWizard_progress');
      console.log('🗑️ Progreso eliminado de sessionStorage');
    } catch (error) {
      console.error('❌ Error limpiando progreso:', error);
    }
  },

  /**
   * Agrega un lugar must-see
   */
  addMustSeePlace() {
    this.saveStep3Data();
    this.wizardData.mustSee.push({ name: '', city: '' });
    this.renderWizard();
  },

  /**
   * Elimina un lugar must-see
   */
  removeMustSeePlace(idx) {
    this.wizardData.mustSee.splice(idx, 1);
    this.renderWizard();
  },

  /**
   * Genera MÚLTIPLES VARIACIONES de itinerarios
   */
  async generateItinerary() {
    if (!this.validateCurrentStep()) return;

    console.log('🚀 Generando itinerarios con:', this.wizardData);

    // 🛬 Warning suave si la ruta no cuadra con los aeropuertos (no bloquea)
    const airportWarnings = this.getAirportRouteWarnings();
    airportWarnings.forEach(w => window.Notifications?.show(w, 'warning', 9000));

    // Mostrar loading con pasos detallados
    const modal = document.getElementById('smartGeneratorWizard');
    if (modal) {
      modal.innerHTML = `
        <div class="flex items-center justify-center h-full p-12">
          <div class="text-center max-w-2xl">
            <div class="relative mb-8">
              <div class="animate-spin rounded-full h-24 w-24 border-b-4 border-t-4 border-purple-600 mx-auto"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-4xl">🎨</span>
              </div>
            </div>

            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Generando 3 Variaciones</h3>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6">Creando itinerarios personalizados para ti</p>

            <!-- Pasos de progreso -->
            <div class="space-y-3 text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-4">
              <div class="flex items-center gap-3 text-blue-600 dark:text-blue-400" id="step1">
                <div class="animate-pulse">⏳</div>
                <span class="font-medium">Analizando tus preferencias...</span>
              </div>
              <div class="flex items-center gap-3 text-gray-400" id="step2">
                <div>⏳</div>
                <span>Buscando coordenadas de hoteles...</span>
              </div>
              <div class="flex items-center gap-3 text-gray-400" id="step3">
                <div>⏳</div>
                <span>Optimizando rutas y tiempos...</span>
              </div>
              <div class="flex items-center gap-3 text-gray-400" id="step4">
                <div>⏳</div>
                <span>Generando 3 itinerarios únicos...</span>
              </div>
            </div>

            <p class="text-sm text-gray-500">
              ⏱️ Tiempo estimado: <span class="font-bold">10-20 segundos</span>
            </p>
          </div>
        </div>
      `;

      // 🔧 Antes esto era 3 setTimeout fijos (2s/5s/10s) totalmente
      // desconectados del trabajo real - podía mostrar "optimizando rutas"
      // cuando la generación ya había terminado hace rato, o seguir en
      // "analizando preferencias" con el trabajo real recién a la mitad,
      // según cuánto tardara la red/el generador ese día. markStepDone()/
      // markStepActive() ahora se llaman en los puntos reales del código
      // donde cada fase efectivamente empieza/termina.
      this.markStepDone('step1', 'Preferencias analizadas');
    }

    try {
      this.markStepActive('step2');
      // Convertir hoteles a formato con coordenadas
      const hotelsWithCoords = {};
      for (const [city, hotelData] of Object.entries(this.wizardData.hotels)) {
        if (hotelData.name && hotelData.area) {
          // Usar IntelligentGeocoder para buscar coordenadas
          const query = `${hotelData.name}, ${hotelData.area}, ${city}, Japan`;
          console.log(`🔍 Buscando coordenadas para: ${query}`);

          if (window.IntelligentGeocoder) {
            const result = await window.IntelligentGeocoder.getCoordinates(
              hotelData.name,
              `${hotelData.area}, ${city}, Japan`
            );

            if (result.success && result.lat && result.lng) {
              hotelsWithCoords[city] = {
                name: hotelData.name,
                lat: result.lat,
                lng: result.lng,
                area: hotelData.area
              };
              console.log(`✅ Hotel encontrado en ${city}:`, hotelsWithCoords[city]);
            } else {
              console.warn(`⚠️ No se encontraron coordenadas para hotel en ${city}`);
            }
          }
        }
      }
      this.markStepDone('step2', Object.keys(hotelsWithCoords).length > 0 ? 'Coordenadas encontradas' : 'Sin hoteles que geocodificar');
      this.markStepActive('step3');

      // Preparar perfil para el generador
      const profile = {
        cities: this.wizardData.cities,
        // 🆕 Ruta manual ordenada (permite repetir ciudad) - null si el usuario dejó
        // que el generador decida los días automáticamente
        cityStops: this.wizardData.dayAllocationMode === 'manual' ? this.wizardData.cityStops : null,
        totalDays: this.wizardData.totalDays,
        dailyBudget: this.wizardData.dailyBudget,
        interests: this.wizardData.interests,
        interestWeights: this.wizardData.interestWeights, // 🆕 {interestId: 1-5}
        pace: this.wizardData.pace,
        startTime: this.wizardData.startTime,
        companionType: this.wizardData.companionType, // 👥 Companion-aware generation
        hotels: hotelsWithCoords,
        mustSee: this.wizardData.mustSee,
        avoid: this.wizardData.avoid,
        // 🆕 Nuevos parámetros de contexto
        groupSize: this.wizardData.groupSize,
        travelerAges: this.wizardData.travelerAges,
        tripStartDate: this.wizardData.tripStartDate,
        tripEndDate: this.wizardData.tripEndDate,
        arrivalTime: this.wizardData.arrivalTime,
        // 🛬🛫 Ciudades de los aeropuertos: en modo auto el generador ordena la
        // ruta para empezar/terminar ahí (día 1 con jetlag = ciudad de llegada)
        arrivalCityKey: getAirportByCode(this.wizardData.arrivalAirport)?.cityKey || null,
        departureCityKey: getAirportByCode(this.wizardData.departureAirport)?.cityKey || null,
        dietaryRestrictions: this.wizardData.dietaryRestrictions,
        mobilityNeeds: this.wizardData.mobilityNeeds
      };

      console.log('📋 Perfil final:', profile);

      this.markStepDone('step3', 'Ruta y perfil listos');
      this.markStepActive('step4');

      // Generar MÚLTIPLES VARIACIONES
      const variations = await window.SmartItineraryGenerator.generateMultipleVariations(profile);

      console.log('✅ 3 variaciones generadas:', variations);
      this.markStepDone('step4', '3 itinerarios generados');

      // Mostrar selector de variaciones
      this.showVariationsSelector(variations);

    } catch (error) {
      console.error('❌ Error generando itinerario:', error);
      window.Notifications?.show('❌ Error al generar itinerario: ' + error.message, 'error');
      this.close();
    }
  },

  /**
   * 🆕 Marca un paso del checklist de generación como "en progreso" (spinner
   * animado). Usado en los puntos REALES del código donde cada fase
   * efectivamente arranca, no en un setTimeout con un tiempo inventado.
   */
  markStepActive(stepId) {
    const el = document.getElementById(stepId);
    if (!el) return;
    el.classList.remove('text-gray-400');
    el.classList.add('text-blue-600', 'dark:text-blue-400');
    el.querySelector('div')?.classList.add('animate-pulse');
  },

  /**
   * 🆕 Marca un paso del checklist de generación como completado (✅), con
   * el texto final que refleja lo que realmente pasó (ej. "sin hoteles que
   * geocodificar" si el usuario no cargó ninguno, en vez de un texto fijo
   * que asume que sí).
   */
  markStepDone(stepId, text) {
    const el = document.getElementById(stepId);
    if (!el) return;
    el.innerHTML = `<div>✅</div><span class="text-gray-600 dark:text-gray-300">${text}</span>`;
    el.classList.remove('text-blue-600', 'dark:text-blue-400');
    el.classList.add('text-gray-600', 'dark:text-gray-300');
  },

  /**
   * 🎨 Muestra selector para elegir entre las 3 variaciones
   */
  showVariationsSelector(variations) {
    const modal = document.getElementById('smartGeneratorWizard');
    if (!modal) return;

    // Guardar variaciones en el objeto para acceso global
    this.currentVariations = variations;
    this.comparisonMode = false; // Por defecto vista grid

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold mb-2">🎨 ¡3 Itinerarios Creados!</h2>
              <p class="text-purple-100">Elige el que más te guste o crea uno personalizado</p>
            </div>
            <button
              onclick="window.SmartGeneratorWizard.toggleComparisonMode()"
              class="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              <span id="comparisonToggleIcon">📊</span>
              <span id="comparisonToggleText">Modo Comparación</span>
            </button>
          </div>
        </div>

        <!-- Content Container -->
        <div id="variationsContent" class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${variations.map(variation => this.renderVariationCard(variation)).join('')}
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex justify-between items-center gap-2">
          <button
            onclick="window.SmartGeneratorWizard.cancelFromVariations()"
            class="px-4 sm:px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-sm"
          >
            Descartar
          </button>
          <button
            onclick="window.SmartGeneratorWizard.backToWizardFromVariations()"
            class="px-4 sm:px-6 py-3 rounded-lg border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 font-semibold transition text-sm"
            title="Vuelve al asistente con todo lo que elegiste intacto"
          >
            ← Ajustar preferencias
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Cancelar desde el selector de variaciones: los 3 itinerarios generados
   * se pierden — antes se cerraba en seco sin avisar.
   */
  async cancelFromVariations() {
    const confirmed = window.Dialogs?.confirm
      ? await window.Dialogs.confirm({
          title: '¿Descartar los itinerarios?',
          message: 'Se perderán las 3 opciones generadas. Si solo quieres cambiar algo, usa "Ajustar preferencias" y conserva todo lo que ya elegiste.',
          okText: 'Sí, descartar',
          isDestructive: true
        })
      : confirm('¿Descartar los itinerarios generados?');
    if (confirmed) this.close();
  },

  /**
   * Volver al asistente (paso 3) con wizardData intacto, sin perder la
   * configuración — antes la única salida era el Cancelar destructivo.
   */
  backToWizardFromVariations() {
    this.currentVariations = null;
    this.currentStep = 3;
    this.renderWizard();
  },

  /**
   * 🔄 Alterna entre vista grid y vista comparación
   */
  toggleComparisonMode() {
    this.comparisonMode = !this.comparisonMode;
    const contentContainer = document.getElementById('variationsContent');
    const toggleIcon = document.getElementById('comparisonToggleIcon');
    const toggleText = document.getElementById('comparisonToggleText');

    if (this.comparisonMode) {
      // Mostrar vista comparación detallada
      toggleIcon.textContent = '🃏';
      toggleText.textContent = 'Vista Tarjetas';
      contentContainer.innerHTML = this.renderComparisonView(this.currentVariations);

      // 🏆 Tracking de gamificación - comparaciones
      if (window.GamificationSystem) {
        window.GamificationSystem.trackAction('variationsCompared', 1);
      }
    } else {
      // Volver a vista grid
      toggleIcon.textContent = '📊';
      toggleText.textContent = 'Modo Comparación';
      contentContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${this.currentVariations.map(variation => this.renderVariationCard(variation)).join('')}
        </div>
      `;
    }
  },

  /**
   * 📊 Renderiza vista de comparación detallada
   */
  renderComparisonView(variations) {
    const maxDays = Math.max(...variations.map(v => v.itinerary.days.length));

    return `
      <div class="space-y-6">
        <!-- Summary Table -->
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6">
          <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">📋 Resumen Comparativo</h3>
          <div class="grid grid-cols-4 gap-4">
            <div class="font-semibold text-gray-700 dark:text-gray-300">Criterio</div>
            ${variations.map(v => `
              <div class="text-center">
                <div class="text-3xl mb-2">${v.icon}</div>
                <div class="font-bold text-gray-900 dark:text-white">${v.name}</div>
              </div>
            `).join('')}

            <div class="text-gray-600 dark:text-gray-400">📅 Días</div>
            ${variations.map(v => `
              <div class="text-center font-semibold text-gray-900 dark:text-white">${v.itinerary.days.length}</div>
            `).join('')}

            <div class="text-gray-600 dark:text-gray-400">🎯 Actividades</div>
            ${variations.map(v => {
              const total = v.itinerary.days.reduce((sum, day) => sum + day.activities.length, 0);
              return `<div class="text-center font-semibold text-gray-900 dark:text-white">${total}</div>`;
            }).join('')}

            <div class="text-gray-600 dark:text-gray-400">💰 Presupuesto</div>
            ${variations.map(v => `
              <div class="text-center font-semibold text-gray-900 dark:text-white">¥${(v.itinerary.totalBudget || 0).toLocaleString()}</div>
            `).join('')}

            <div class="text-gray-600 dark:text-gray-400">⚡ Ritmo</div>
            ${variations.map(() => {
              // 🔧 v.name.includes('Relajado'/'Equilibrado') (versión anterior) no
              // coincidía con NINGÚN nombre real de las 9 plantillas de arquetipo
              // (Cultural Explorer, Ultimate Foodie, etc.) - siempre caía en
              // "🏃 Intenso" sin importar el ritmo real, para las 3 columnas.
              // Además el ritmo NO varía entre variaciones (viene de una sola
              // config del wizard, no del arquetipo) - se muestra el valor real
              // (this.wizardData.pace), igual en las 3 columnas porque
              // genuinamente es el mismo, en vez de fingir que difiere.
              const paceLabels = {
                light: '🐢 Ligero', moderate: '🚶 Moderado', packed: '🏃 Intenso',
                extreme: '⚡ Extremo', maximum: '🔥 Máximo'
              };
              const pace = paceLabels[this.wizardData.pace] || '🚶 Moderado';
              return `<div class="text-center font-semibold text-gray-900 dark:text-white">${pace}</div>`;
            }).join('')}
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-3 gap-4 mt-6">
            ${variations.map(v => `
              <button
                onclick="window.SmartGeneratorWizard.selectVariation('${v.id}', ${JSON.stringify(v.itinerary).replace(/"/g, '&quot;')})"
                class="py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg"
              >
                ✅ Elegir ${v.name}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Day-by-Day Comparison -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">📅 Comparación Día por Día</h3>
            <button
              onclick="window.SmartGeneratorWizard.showHybridBuilder()"
              class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              🎨 Crear Híbrido
            </button>
          </div>

          <div class="space-y-6">
            ${Array.from({length: maxDays}, (_, i) => {
              const dayNumber = i + 1;
              return `
                <div class="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div class="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 font-bold">
                    📅 Día ${dayNumber}
                  </div>
                  <div class="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
                    ${variations.map((v, vIndex) => {
                      const day = v.itinerary.days[i];
                      if (!day) {
                        return `<div class="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-gray-400">Sin actividades</div>`;
                      }
                      return `
                        <div class="p-4 bg-white dark:bg-gray-800">
                          <div class="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
                            ${v.icon} ${v.name}
                          </div>
                          <div class="space-y-2">
                            ${day.activities.slice(0, 4).map(act => `
                              <div class="text-sm">
                                <div class="font-semibold text-gray-900 dark:text-white">${act.title || act.name || 'Actividad'}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                  ${this.translateCategory(act.category)} • ${Math.floor(act.duration / 60)}h ${act.duration % 60}m
                                </div>
                              </div>
                            `).join('')}
                            ${day.activities.length > 4 ? `
                              <div class="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                                +${day.activities.length - 4} actividades más
                              </div>
                            ` : ''}
                          </div>
                          <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs">
                            <span class="text-gray-600 dark:text-gray-400">💰 ¥${((day.budgetBreakdown?.total ?? day.budget) || 0).toLocaleString()}</span>
                            <span class="text-gray-600 dark:text-gray-400">${day.activities.length} act.</span>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Tags Comparison -->
        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-6">
          <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">🏷️ Categorías de Interés</h3>
          <div class="grid grid-cols-3 gap-4">
            ${variations.map(v => `
              <div class="space-y-2">
                <div class="font-semibold text-center text-gray-900 dark:text-white">
                  ${v.icon} ${v.name}
                </div>
                <div class="flex flex-wrap gap-2 justify-center">
                  ${v.tags.map(tag => `
                    <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                      ${tag}
                    </span>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 🎨 Muestra el constructor de itinerario híbrido
   */
  showHybridBuilder() {
    const modal = document.getElementById('smartGeneratorWizard');
    if (!modal || !this.currentVariations) return;

    const maxDays = Math.max(...this.currentVariations.map(v => v.itinerary.days.length));

    // Inicializar selección híbrida (por defecto variación 0 para todos los días)
    if (!this.hybridSelection) {
      this.hybridSelection = Array(maxDays).fill(0);
    }

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold mb-2">🎨 Constructor de Itinerario Híbrido</h2>
              <p class="text-blue-100">Selecciona qué variación usar para cada día</p>
            </div>
            <button
              onclick="window.SmartGeneratorWizard.showVariationsSelector(window.SmartGeneratorWizard.currentVariations)"
              class="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition"
            >
              ← Volver
            </button>
          </div>
        </div>

        <!-- Hybrid Builder Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-4">
            ${Array.from({length: maxDays}, (_, i) => {
              const dayNumber = i + 1;
              return `
                <div class="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div class="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 px-6 py-3">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-bold text-gray-900 dark:text-white">📅 Día ${dayNumber}</h3>
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        Seleccionado: <span class="font-bold text-purple-600 dark:text-purple-400" id="selectedVar${i}">
                          ${this.currentVariations[this.hybridSelection[i]].name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
                    ${this.currentVariations.map((v, vIndex) => {
                      const day = v.itinerary.days[i];
                      const isSelected = this.hybridSelection[i] === vIndex;

                      if (!day) {
                        return `<div class="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-gray-400">Sin actividades</div>`;
                      }

                      return `
                        <div class="p-4 ${isSelected ? 'bg-purple-50 dark:bg-purple-900/30 border-4 border-purple-500' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'} cursor-pointer transition"
                             onclick="window.SmartGeneratorWizard.selectDayVariation(${i}, ${vIndex})">

                          <!-- Header -->
                          <div class="flex items-center justify-between mb-3">
                            <div class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              ${isSelected ? '✅' : ''} ${v.icon} ${v.name}
                            </div>
                          </div>

                          <!-- Activities -->
                          <div class="space-y-2">
                            ${day.activities.slice(0, 3).map(act => `
                              <div class="text-sm bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                                <div class="font-semibold text-gray-900 dark:text-white truncate">${act.name}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                  ${act.category} • ${Math.floor(act.duration / 60)}h ${act.duration % 60}m
                                </div>
                              </div>
                            `).join('')}
                            ${day.activities.length > 3 ? `
                              <div class="text-xs text-center text-purple-600 dark:text-purple-400 font-semibold">
                                +${day.activities.length - 3} más
                              </div>
                            ` : ''}
                          </div>

                          <!-- Stats -->
                          <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs">
                            <span class="text-gray-600 dark:text-gray-400">💰 ¥${(day.budgetBreakdown?.total ?? day.budget)?.toLocaleString() || '0'}</span>
                            <span class="text-gray-600 dark:text-gray-400">${day.activities.length} actividades</span>
                          </div>

                          <!-- Select Button -->
                          <button class="w-full mt-3 py-2 ${isSelected ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-lg font-semibold transition">
                            ${isSelected ? '✅ Seleccionado' : 'Usar Esta Variación'}
                          </button>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Footer with Save -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <button
            onclick="window.SmartGeneratorWizard.showVariationsSelector(window.SmartGeneratorWizard.currentVariations)"
            class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onclick="window.SmartGeneratorWizard.saveHybridItinerary()"
            class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold transition shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            💾 Guardar Itinerario Híbrido
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Selecciona qué variación usar para un día específico
   */
  selectDayVariation(dayIndex, variationIndex) {
    this.hybridSelection[dayIndex] = variationIndex;
    // Actualizar la vista
    this.showHybridBuilder();
  },

  /**
   * 💾 Guarda el itinerario híbrido creado por el usuario
   */
  async saveHybridItinerary() {
    if (!this.currentVariations || !this.hybridSelection) {
      window.Notifications?.show('⚠️ Error creando híbrido', 'error');
      return;
    }

    console.log('🎨 Creando itinerario híbrido con selección:', this.hybridSelection);

    // Construir el itinerario híbrido
    const baseVariation = this.currentVariations[0];
    const hybridItinerary = {
      ...baseVariation.itinerary,
      days: []
    };

    let totalBudget = 0;

    // Construir días del híbrido
    this.hybridSelection.forEach((varIndex, dayIndex) => {
      const selectedVariation = this.currentVariations[varIndex];
      const day = selectedVariation.itinerary.days[dayIndex];

      if (day) {
        hybridItinerary.days.push({...day});
        totalBudget += (day.budgetBreakdown?.total ?? day.budget ?? 0);
      }
    });

    hybridItinerary.totalBudget = totalBudget;

    console.log('✅ Itinerario híbrido creado:', hybridItinerary);

    // Mostrar loading
    const modal = document.getElementById('smartGeneratorWizard');
    if (modal) {
      modal.innerHTML = `
        <div class="flex items-center justify-center h-full p-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">💾 Guardando itinerario híbrido...</h3>
            <p class="text-gray-600 dark:text-gray-400">🎨 Combinando lo mejor de cada variación</p>
          </div>
        </div>
      `;
    }

    try {
      // Guardar itinerario
      await this.saveGeneratedItinerary(hybridItinerary);

      // 🏆 Tracking de gamificación - híbridos
      if (window.GamificationSystem) {
        await window.GamificationSystem.trackAction('hybridsCreated', 1);
      }

      // 🗑️ Limpiar sessionStorage y datos temporales
      this.clearSessionStorage();
      this.hybridSelection = null;
      this.currentVariations = null;

      // Cerrar modal
      this.close();

      // Mostrar éxito
      window.Notifications?.show('✅ ¡Itinerario híbrido guardado exitosamente!', 'success');

      // Recargar la página
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Error guardando itinerario híbrido:', error);
      window.Notifications?.show('❌ Error al guardar: ' + error.message, 'error');
      this.close();
    }
  },

  /**
   * Renderiza una tarjeta de variación
   */
  /**
   * Actividades "emblema" de una variación: prioriza las que SOLO están en
   * esta opción (vs. las otras dos), ordenadas por rating. Sin esto, las 3
   * tarjetas mostraban stats casi idénticos y elegir era una lotería.
   */
  getSignatureActivities(variation, count = 3) {
    const others = new Set();
    (this.currentVariations || []).forEach(v => {
      if (v.id === variation.id) return;
      v.itinerary.days.forEach(d => (d.activities || []).forEach(a => others.add(a.title || a.name)));
    });

    const all = [];
    variation.itinerary.days.forEach(d => (d.activities || []).forEach(a => {
      if (!a.isMeal) all.push(a);
    }));

    const uniques = all.filter(a => !others.has(a.title || a.name));
    const pool = uniques.length >= count ? uniques : all;
    const picks = [...pool].sort((x, y) => (y.rating || 0) - (x.rating || 0)).slice(0, count);
    return { picks, uniqueCount: uniques.length };
  },

  renderVariationCard(variation) {
    const itinerary = variation.itinerary;
    const totalActivities = itinerary.days.reduce((sum, day) => sum + day.activities.length, 0);
    const totalBudget = itinerary.totalBudget || 0;
    const { picks, uniqueCount } = this.getSignatureActivities(variation);

    return `
      <div class="border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition cursor-pointer overflow-hidden"
           onclick="window.SmartGeneratorWizard.selectVariation('${variation.id}', ${JSON.stringify(variation.itinerary).replace(/"/g, '&quot;')})">

        <!-- Header -->
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-6 text-center">
          <div class="text-5xl mb-3">${variation.icon}</div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${variation.name}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">${variation.description}</p>
        </div>

        <!-- Tags -->
        <div class="px-6 py-4 flex flex-wrap gap-2 justify-center bg-white dark:bg-gray-800">
          ${variation.tags.map(tag => `
            <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
              ${tag}
            </span>
          `).join('')}
        </div>

        <!-- Actividades emblema: lo que REALMENTE distingue esta opción -->
        ${picks.length > 0 ? `
        <div class="px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <div class="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
            ${uniqueCount > 0 ? `⭐ Solo en esta opción (${uniqueCount})` : '⭐ Destacados'}
          </div>
          <div class="space-y-1.5">
            ${picks.map(a => `
              <div class="flex items-center gap-2 text-sm min-w-0">
                <span class="flex-shrink-0">${a.rating ? '★' : '·'}</span>
                <span class="truncate text-gray-800 dark:text-gray-200 font-medium" title="${String(a.title || a.name || '').replace(/"/g, '&quot;')}">${a.title || a.name}</span>
                ${a.rating ? `<span class="ml-auto flex-shrink-0 text-xs text-amber-600 dark:text-amber-400 font-semibold">${a.rating}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Stats -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">📅 Días</span>
            <span class="font-semibold text-gray-900 dark:text-white">${itinerary.days.length}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">🎯 Actividades</span>
            <span class="font-semibold text-gray-900 dark:text-white">${totalActivities}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">💰 Presupuesto</span>
            <span class="font-semibold text-gray-900 dark:text-white">¥${totalBudget.toLocaleString()}</span>
          </div>
        </div>

        ${this.renderMLEnhancements(itinerary)}

        <!-- Action Button -->
        <div class="p-6 bg-white dark:bg-gray-800">
          <button class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg">
            ✅ Elegir Este Itinerario
          </button>
        </div>
      </div>
    `;
  },

  /**
   * 🧠 Renderiza los insights de ML si existen
   */
  renderMLEnhancements(itinerary) {
    if (!itinerary._mlEnhancement) {
      return ''; // No ML enhancements
    }

    const ml = itinerary._mlEnhancement;
    const hasOptimizations = ml.optimizations && ml.optimizations.length > 0;
    const hasInsights = ml.insights && ml.insights.length > 0;
    const hasWarnings = ml.warnings && ml.warnings.length > 0;

    if (!hasOptimizations && !hasInsights && !hasWarnings) {
      return ''; // Nothing to show
    }

    return `
      <!-- ML Brain Enhancements -->
      <div class="px-6 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-b border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">🧠</span>
          <h4 class="font-bold text-gray-900 dark:text-white text-sm">ML Brain Optimizations</h4>
          <span class="ml-auto text-xs font-semibold px-2 py-1 rounded-full ${ml.confidence >= 0.7 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'}">
            ${(ml.confidence * 100).toFixed(0)}% confianza
          </span>
        </div>

        <div class="space-y-2 text-xs">
          ${hasOptimizations ? `
            ${ml.optimizations.slice(0, 2).map(opt => `
              <div class="flex items-start gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                <span class="text-base flex-shrink-0">${opt.icon}</span>
                <div class="flex-1">
                  <div class="font-semibold text-gray-900 dark:text-white">${opt.title}</div>
                  <div class="text-gray-600 dark:text-gray-400">${opt.message}</div>
                  ${opt.savings || opt.improvement ? `
                    <div class="text-green-600 dark:text-green-400 font-semibold mt-1">
                      💚 ${opt.savings || opt.improvement}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          ` : ''}

          ${hasWarnings && ml.warnings.length > 0 ? `
            <div class="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
              <span class="text-base flex-shrink-0">${ml.warnings[0].icon || '⚠️'}</span>
              <div class="flex-1">
                <div class="font-semibold text-yellow-900 dark:text-yellow-300">${ml.warnings[0].title}</div>
                <div class="text-yellow-700 dark:text-yellow-400 text-xs">${ml.warnings[0].message}</div>
              </div>
            </div>
          ` : ''}

          ${hasInsights && ml.insights.length > 0 ? `
            <div class="text-gray-600 dark:text-gray-400">
              ${ml.insights[0].icon} ${ml.insights[0].message}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  /**
   * Selecciona una variación y la guarda
   */
  async selectVariation(variationId, itinerary) {
    console.log(`✅ Variación seleccionada: ${variationId}`);

    // Mostrar loading
    const modal = document.getElementById('smartGeneratorWizard');
    if (modal) {
      modal.innerHTML = `
        <div class="flex items-center justify-center h-full p-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">💾 Guardando itinerario...</h3>
          </div>
        </div>
      `;
    }

    try {
      // Guardar itinerario
      await this.saveGeneratedItinerary(itinerary);

      // 🗑️ Limpiar sessionStorage ya que completamos exitosamente
      this.clearSessionStorage();

      // Cerrar modal
      this.close();

      // Mostrar éxito
      window.Notifications?.show('✅ ¡Itinerario guardado exitosamente!', 'success');

      // Recargar la página
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Error guardando itinerario:', error);
      window.Notifications?.show('❌ Error al guardar: ' + error.message, 'error');
      this.close();
    }
  },

  /**
   * Guarda el itinerario generado en Firebase
   */
  async saveGeneratedItinerary(itinerary) {
    const tripId = window.TripsManager?.currentTrip?.id;
    if (!tripId) {
      console.warn('⚠️ No hay trip activo, no se puede guardar');
      return;
    }

    // Guardar en Firebase - mismo documento que lee/escribe ItineraryHandler
    // (trips/{tripId}/data/itinerary), no el documento principal del trip.
    try {
      const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');

      // Firestore rechaza cualquier valor undefined en el documento (ej:
      // day.hotel cuando todavía no hay un hotel configurado para esa
      // ciudad) - sanitizar antes de escribir, igual que saveCurrentItineraryToFirebase.
      await setDoc(itineraryRef, {
        days: sanitizeForFirestore(itinerary.days),
        generatedBy: 'SmartGenerator',
        generatedAt: serverTimestamp(),
        generatorProfile: sanitizeForFirestore(itinerary.profile)
      });

      console.log('✅ Itinerario guardado en Firebase');

      // 🏆 Tracking de gamificación
      if (window.GamificationSystem) {
        await window.GamificationSystem.trackAction('itinerariesGenerated', 1);
      }
    } catch (error) {
      console.error('❌ Error guardando itinerario:', error);
      throw error;
    }
  },

  /**
   * 🆕 ACTUALIZAR PREVIEW DE PRESUPUESTO EN TIEMPO REAL
   * Calcula y muestra estimación de presupuesto total
   */
  updateBudgetPreview() {
    const totalDaysInput = document.getElementById('totalDays');
    const dailyBudgetInput = document.getElementById('dailyBudget');
    const groupSizeInput = document.getElementById('groupSize');

    const totalDays = parseInt(totalDaysInput?.value) || 7;
    const dailyBudget = parseInt(dailyBudgetInput?.value) || 10000;
    const groupSize = parseInt(groupSizeInput?.value) || 1;

    // Calcular presupuesto de actividades (40% del daily budget)
    const activitiesDaily = dailyBudget * 0.40;
    const activitiesTotal = activitiesDaily * totalDays;

    // Calcular presupuesto de comidas (35% del daily budget)
    const mealsDaily = dailyBudget * 0.35;
    const mealsTotal = mealsDaily * totalDays;

    // Calcular presupuesto de transporte (25% del daily budget)
    const transportDaily = dailyBudget * 0.25;
    const transportTotal = transportDaily * totalDays;

    // Presupuesto total de actividades
    const dailyTotal = activitiesTotal + mealsTotal + transportTotal;

    // Estimar hotel (promedio ¥10,000 por noche por persona)
    const hotelPerNight = 10000 * groupSize;
    const hotelTotal = hotelPerNight * totalDays;

    // Gran total
    const grandTotal = dailyTotal + hotelTotal;

    // Actualizar DOM
    const totalBudgetPreview = document.getElementById('totalBudgetPreview');
    const activitiesBudgetPreview = document.getElementById('activitiesBudgetPreview');
    const mealsBudgetPreview = document.getElementById('mealsBudgetPreview');
    const transportBudgetPreview = document.getElementById('transportBudgetPreview');
    const hotelBudgetPreview = document.getElementById('hotelBudgetPreview');
    const grandTotalPreview = document.getElementById('grandTotalPreview');
    const budgetComparison = document.getElementById('budgetComparison');

    if (totalBudgetPreview) totalBudgetPreview.textContent = `¥${dailyTotal.toLocaleString()}`;
    if (activitiesBudgetPreview) activitiesBudgetPreview.textContent = `¥${Math.round(activitiesTotal).toLocaleString()}`;
    if (mealsBudgetPreview) mealsBudgetPreview.textContent = `¥${Math.round(mealsTotal).toLocaleString()}`;
    if (transportBudgetPreview) transportBudgetPreview.textContent = `¥${Math.round(transportTotal).toLocaleString()}`;
    if (hotelBudgetPreview) hotelBudgetPreview.textContent = `¥${hotelTotal.toLocaleString()}`;
    if (grandTotalPreview) grandTotalPreview.textContent = `¥${grandTotal.toLocaleString()}`;

    // Calcular comparación con promedio
    // Promedio estimado: ¥12,000/día para moderate travelers
    const averageDailyBudget = 12000;
    const averageTotal = (averageDailyBudget * totalDays) + hotelTotal;
    const difference = grandTotal - averageTotal;
    const percentDiff = Math.abs(Math.round((difference / averageTotal) * 100));

    if (budgetComparison) {
      let comparisonText = '';
      let comparisonClass = '';

      if (Math.abs(difference) < averageTotal * 0.05) {
        // Within 5% is similar
        comparisonText = `📊 Promedio para viajeros similares: ¥${averageTotal.toLocaleString()} - <span class="font-semibold">Tu presupuesto es similar</span>`;
        comparisonClass = 'text-green-800 dark:text-green-300';
      } else if (difference > 0) {
        comparisonText = `📊 Promedio para viajeros similares: ¥${averageTotal.toLocaleString()} - <span class="font-semibold">Tu presupuesto es ${percentDiff}% mayor</span>`;
        comparisonClass = 'text-yellow-800 dark:text-yellow-300';
      } else {
        comparisonText = `📊 Promedio para viajeros similares: ¥${averageTotal.toLocaleString()} - <span class="font-semibold">Tu presupuesto es ${percentDiff}% menor (¡Ahorro!)</span>`;
        comparisonClass = 'text-blue-800 dark:text-blue-300';
      }

      budgetComparison.innerHTML = comparisonText;
      budgetComparison.className = `text-xs ${comparisonClass}`;
    }

    console.log('📊 Preview actualizado:', { dailyTotal, hotelTotal, grandTotal });
  }
};

// Exportar globalmente
window.SmartGeneratorWizard = SmartGeneratorWizard;

console.log('✅ Smart Generator Wizard cargado');

export default SmartGeneratorWizard;
