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
import { getDayTripSuggestions } from './day-trip-recommender.js';
import { analyzeRoutePressure } from './route-pressure.js';
import { CITY_ICONS } from '../../../data/city-coordinates.js';

// Postales acuarela de cada interés (Step 2). Sustituyen a los antiguos
// /images/wizard/interest-*.png, que eran ilustraciones vectoriales planas
// con degradado morado (era anterior de la marca) y contradecían la
// dirección de arte oficial de las referencias: acuarela japonesa sobre
// papel washi crema, tinta dibujada a mano, sin texto incrustado.
// Aquí la imagen NO es una miniatura decorativa: es la postal completa, la
// superficie del control. Ver css/wizard-washi.css (.jw-postcard).
const INTEREST_IMAGES = {
  cultural: '/images/wizard/watercolor/cultural.webp',
  food: '/images/wizard/watercolor/food.webp',
  shopping: '/images/wizard/watercolor/shopping.webp',
  nature: '/images/wizard/watercolor/nature.webp',
  art: '/images/wizard/watercolor/art.webp',
  anime: '/images/wizard/watercolor/anime.webp',
  nightlife: '/images/wizard/watercolor/nightlife.webp',
  technology: '/images/wizard/watercolor/technology.webp',
  history: '/images/wizard/watercolor/history.webp',
  photography: '/images/wizard/watercolor/photography.webp',
};

// Kanji del sello hanko de cada postal. Va como TEXTO HTML sobre el anillo
// ilustrado (signature-elements/hanko-ring.png), nunca incrustado en la
// imagen: así el sello se puede reusar, traducir y animar al seleccionar.
const INTEREST_KANJI = {
  cultural: '文', food: '食', shopping: '買', nature: '自', art: '芸',
  anime: 'オ', nightlife: '夜', technology: '技', history: '歴', photography: '写'
};

// Etiquetas cortas para la bandeja "Mi colección de viaje" y las etiquetas
// de equipaje (el label largo no cabe en una etiqueta).
const INTEREST_SHORT = {
  cultural: 'Cultura', food: 'Comida', shopping: 'Compras', nature: 'Naturaleza',
  art: 'Arte', anime: 'Anime', nightlife: 'Noche', technology: 'Tecnología',
  history: 'Historia', photography: 'Fotos'
};

// "Tu viaje tiene una vibra..." — lectura narrativa de lo elegido (ref 3).
// Es interpretación del gato experto, no un dato nuevo del modelo.
const VIBE_LABELS = {
  food: 'Foodie', nature: 'Nature Lover', anime: 'Otaku', cultural: 'Alma Zen',
  art: 'Sensible', shopping: 'Cazadora de tesoros', nightlife: 'Noctámbula',
  technology: 'Futurista', history: 'Viajera del tiempo', photography: 'Ojo de artista'
};

// Viñetas de "¿con quién viajas?" (Step 3). Regeneradas en acuarela por el
// mismo motivo que las postales de interés: las anteriores eran vectores con
// degradado morado. Se representan como OBJETOS (tazas, kokeshi, farolillos)
// y no como personas — coherente con el resto de la papelería y evita las
// caras humanas, que el generador dibuja de forma inconsistente.
const COMPANION_IMAGES = {
  solo: '/images/wizard/watercolor/companion-solo.webp',
  couple: '/images/wizard/watercolor/companion-couple.webp',
  family: '/images/wizard/watercolor/companion-family.webp',
  seniors: '/images/wizard/watercolor/companion-seniors.webp',
  friends: '/images/wizard/watercolor/companion-friends.webp',
};

/**
 * Smart Generator Wizard
 */
export const SmartGeneratorWizard = {

  currentStep: 1,
  isGenerating: false,
  isSavingHybrid: false,
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
    departureTime: null,       // 🛫 Hora del vuelo de regreso
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

  /** Esquema canónico. También sirve para migrar progresos de versiones anteriores. */
  createDefaultData() {
    return {
      cities: [], dayAllocationMode: 'auto', cityStops: [], totalDays: 7,
      dailyBudget: 10000, groupSize: 1, travelerAges: [], tripStartDate: null,
      tripEndDate: null, arrivalTime: null, departureTime: null, arrivalAirport: null,
      departureAirport: null, dietaryRestrictions: [], mobilityNeeds: null,
      interests: [], interestWeights: {}, pace: 'moderate', startTime: 9,
      companionType: null, hotels: {}, mustSee: [], avoid: []
    };
  },

  /** Normaliza datos externos/sesiones sin permitir tipos o valores imposibles. */
  normalizeWizardData(source = {}) {
    const defaults = this.createDefaultData();
    const data = { ...defaults, ...(source && typeof source === 'object' ? source : {}) };
    const strings = value => Array.isArray(value) ? value.filter(x => typeof x === 'string' && x.trim()) : [];
    data.cities = [...new Set(strings(data.cities))];
    data.interests = [...new Set(strings(data.interests))].filter(id => this.ALL_INTERESTS.some(item => item.id === id));
    data.dietaryRestrictions = strings(data.dietaryRestrictions);
    data.avoid = strings(data.avoid);
    data.travelerAges = Array.isArray(data.travelerAges)
      ? data.travelerAges.map(Number).filter(age => Number.isInteger(age) && age >= 0 && age <= 120)
      : [];
    data.totalDays = Math.min(90, Math.max(1, Number.parseInt(data.totalDays, 10) || defaults.totalDays));
    data.dailyBudget = Math.min(1000000, Math.max(3000, Number.parseInt(data.dailyBudget, 10) || defaults.dailyBudget));
    data.groupSize = Math.min(30, Math.max(1, Number.parseInt(data.groupSize, 10) || 1));
    data.startTime = Math.min(23, Math.max(0, Number.parseInt(data.startTime, 10) || 9));
    data.arrivalTime = /^\d{2}:\d{2}$/.test(data.arrivalTime || '') ? data.arrivalTime : null;
    data.departureTime = /^\d{2}:\d{2}$/.test(data.departureTime || '') ? data.departureTime : null;
    data.dayAllocationMode = data.dayAllocationMode === 'manual' ? 'manual' : 'auto';
    data.cityStops = Array.isArray(data.cityStops) ? data.cityStops
      .filter(stop => stop && data.cities.includes(stop.city))
      .map(stop => ({ city: stop.city, days: Math.max(1, Number.parseInt(stop.days, 10) || 1), isDayTrip: !!stop.isDayTrip })) : [];
    data.interestWeights = data.interestWeights && typeof data.interestWeights === 'object' ? data.interestWeights : {};
    data.hotels = data.hotels && typeof data.hotels === 'object' ? data.hotels : {};
    data.mustSee = Array.isArray(data.mustSee) ? data.mustSee.filter(Boolean).map(place => ({ name: String(place.name || ''), city: String(place.city || '') })) : [];
    return data;
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
      this.wizardData = this.normalizeWizardData({ ...this.wizardData, ...prefill });
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
    this.wizardData = this.createDefaultData();
    this.isGenerating = false;
    this.isSavingHybrid = false;
  },

  /**
   * Renderiza el wizard completo
   */
  renderWizard() {
    const modalHTML = `
      <div id="smartGeneratorWizard" class="jw-overlay" role="dialog" aria-modal="true" aria-labelledby="jwTitle">
        <div class="jw-sheet">

          <!-- Cabecera: título + sellos de paso + etiqueta de salida -->
          <div class="jw-head">
            <div>
              <h2 class="jw-head__title" id="jwTitle"><span>JAPITIN</span> Cuaderno de ruta</h2>
              <div class="jw-steps" role="list" aria-label="Progreso del wizard" style="--jw-progress:${(this.currentStep / this.TOTAL_STEPS) * 100}%">
                ${this.renderSteps()}
              </div>
            </div>
            <button type="button" class="jw-exit" onclick="window.SmartGeneratorWizard.close()">
              Salir del wizard
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Contenido del paso -->
          <div class="jw-body">
            ${this.renderStepContent()}
          </div>

          <!-- Pie: boletos de navegación -->
          <div class="jw-foot">
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

    // Oculta los FAB / bottom-nav de la app mientras el wizard está abierto
    // (tienen z-index propio y flotaban por encima del papel en móvil).
    document.body.classList.add('jw-open');

    // Restaurar valores guardados en los inputs
    this.restoreFormValues();

    // 🆕 La barra de días arrastrable necesita listeners de pointer events +
    // SortableJS que no se pueden expresar como atributos inline onclick=""
    // (a diferencia del resto del wizard) - solo hace algo si el DOM de la
    // fase 'days' existe (attachHandlers() retorna temprano si no).
    if (this.currentStep === 1 && this.step1Phase === 'days' && this.wizardData.dayAllocationMode === 'manual') {
      DayAllocationBar.attachHandlers();
    }

    // Accesibilidad del modal: Escape cierra y el foco entra al contenido.
    if (!this._escapeHandler) {
      this._escapeHandler = event => {
        if (event.key === 'Escape' && !this.isGenerating) this.close();
      };
    }
    document.removeEventListener('keydown', this._escapeHandler);
    document.addEventListener('keydown', this._escapeHandler);
    requestAnimationFrame(() => document.querySelector('#smartGeneratorWizard button, #smartGeneratorWizard input')?.focus());
  },

  /**
   * Nombres de los 4 pasos. Antes eran 3 (Básico/Preferencias/Hoteles) con
   * un stepper de círculos tipo Material; las referencias oficiales definen
   * 4 tramos con nombre propio y separadores de puntitos. El re-mapeo es
   * SOLO de presentación: wizardData no cambió de forma y el generador
   * (generateItinerary) sigue recibiendo exactamente el mismo objeto.
   *   1 = a dónde  (fases internas basics/map/days, intactas)
   *   2 = intereses
   *   3 = estilo de viaje (ritmo + compañía + hoteles/imperdibles)
   *   4 = magia Japitin (resumen y disparo de la generación)
   */
  STEP_LABELS: ['¿A dónde quieres ir?', '¿Qué quieres descubrir?', 'Estilo de viaje', '¡Magia Japitin!'],
  TOTAL_STEPS: 4,

  /**
   * Sellos de paso de la cabecera. Los pasos ya completados son navegables
   * hacia atrás (nunca hacia adelante: saltarse una validación rompería el
   * contrato de validateCurrentStep).
   */
  renderSteps() {
    const items = this.STEP_LABELS.map((label, i) => {
      const num = i + 1;
      const isActive = num === this.currentStep;
      const isDone = num < this.currentStep;
      const cls = ['jw-steps__item', isActive ? 'jw-steps__item--active' : '', isDone ? 'jw-steps__item--done' : ''].filter(Boolean).join(' ');
      const dots = num < this.TOTAL_STEPS ? '<span class="jw-steps__dots" aria-hidden="true">•••</span>' : '';
      return `
        <button type="button" class="${cls}" role="listitem"
          ${isDone ? `onclick="window.SmartGeneratorWizard.goToStep(${num})"` : 'aria-disabled="true"'}
          ${isActive ? 'aria-current="step"' : ''}>
          <span class="jw-steps__name">${label}</span>
        </button>
        ${dots}
      `;
    }).join('');

    return `<span class="jw-steps__pill">Paso ${this.currentStep} de ${this.TOTAL_STEPS}</span>${items}`;
  },

  /**
   * Vuelve a un paso YA COMPLETADO (desde los sellos de la cabecera).
   * Guarda antes lo que haya en pantalla para no perder ediciones.
   */
  goToStep(num) {
    if (num >= this.currentStep || num < 1) return;
    this.saveCurrentStepData();
    this.currentStep = num;
    this.saveToSessionStorage();
    this.renderWizard();
  },

  /**
   * Persiste lo que esté montado en el DOM ahora mismo. Cada saveStepNData()
   * ya es tolerante a que su DOM no exista (ver nota en saveStep2Data).
   */
  saveCurrentStepData() {
    if (this.currentStep === 1) this.saveStep1Data();
    else if (this.currentStep === 2) this.saveStep2Data();
    else if (this.currentStep === 3) { this.saveStep2Data(); this.saveStep3Data(); }
  },

  /**
   * Renderiza el contenido del paso actual
   */
  renderStepContent() {
    switch(this.currentStep) {
      case 1: return this.renderStep1();
      case 2: return this.renderStep2();
      case 3: return this.renderStep3();
      case 4: return this.renderStep4();
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
      <div class="space-y-6 animate-fadeInUp jw-screen jw-screen--basics">
        <div class="jw-catnote">
          <img class="jw-catnote__cat" src="/images/illustrations/generated/characters/cat-explorer.webp"
               alt="" aria-hidden="true" loading="eager" width="118">
          <div class="jw-catnote__paper">
            <h3>¡Empecemos tu aventura!</h3>
            <p>Cuéntame cuándo viajas y cuántos días tienes para disfrutar.</p>
          </div>
        </div>

        <!-- 🆕 Load from Template Button -->
        <div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl jw-template-ticket">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-bold text-gray-800 dark:text-white mb-1">¿Prefieres empezar con una plantilla?</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">Carga un itinerario pre-diseñado y personalízalo a tu gusto</p>
            </div>
            <button
              onclick="window.SmartGeneratorWizard.showTemplateSelector()"
              class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              Ver Plantillas
            </button>
          </div>
        </div>

        <!-- Fechas del viaje -->
        ${this.datesPrefilled && !this.showDateEditor ? `
        <div class="flex items-center justify-between gap-3 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg jw-date-ticket">
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
              Fecha de inicio
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
              Fecha de fin
            </label>
            <input
              type="date"
              id="tripEndDate"
              value="${this.wizardData.tripEndDate || ''}"
              min="${this.wizardData.tripStartDate || ''}"
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
              ¿A qué aeropuerto llegas? (Opcional)
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
              ¿Desde cuál sales? (Opcional)
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

        <!-- Horas de llegada y salida -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ¿A qué hora aterrizas en Japón el día 1? (Opcional)
          </label>
          <input
            type="time"
            id="arrivalTime"
            value="${this.wizardData.arrivalTime || ''}"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
          >
          <p class="text-xs text-gray-500 mt-1">Si llegas en la tarde/noche, el día 1 se deja ligero o vacío por el jetlag. Si llegas temprano, se agregan 2-3 actividades suaves.</p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">¿A qué hora sale tu vuelo de regreso? (Opcional)</label>
          <input type="time" id="departureTime" value="${this.wizardData.departureTime || ''}" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition">
          <p class="text-xs text-gray-500 mt-1">Protegemos el margen al aeropuerto y evitamos planes imposibles el último día.</p>
        </div>
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
              ¿Cuántas personas viajan?
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
              Edades (separadas por comas)
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
            Restricciones alimentarias (opcional)
          </label>
          <div class="grid grid-cols-2 gap-2 jw-diet-grid">
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
            Necesidades de accesibilidad (opcional)
          </label>
          <div class="grid grid-cols-3 gap-2 jw-access-grid">
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
      <div class="jw-screen jw-screen--map">
      <div class="jw-catnote">
        <img class="jw-catnote__cat" src="/images/illustrations/generated/characters/cat-explorer.webp"
             alt="" aria-hidden="true" loading="eager" width="118">
        <div class="jw-catnote__paper">
          <h3>¡Empecemos tu aventura!</h3>
          <p>Toca las ciudades en el mapa para armar tu ruta. Puedes repetir una ciudad
             (por ejemplo si vuelves antes del vuelo de salida) desde su etiqueta.</p>
        </div>
      </div>

      <section class="jw-panel jw-panel--taped jw-mappanel">
        <h3 class="jw-panel__title">¿Qué ciudades quieres visitar?</h3>

        ${CityRouteMap.render(this.wizardData)}

        <!-- OJO: 'hidden' es CLASE, no atributo — validateField('cities')
             la alterna con classList (mismo caso que interestsError). -->
        <div id="citiesError" class="jw-warn hidden">
          <span aria-hidden="true">✕</span> Debes seleccionar al menos una ciudad
        </div>
      </section>

      <div class="jw-foot" style="border-top:0; padding-left:0; padding-right:0">
        <button type="button" class="jw-btn-back"
                onclick="window.SmartGeneratorWizard.goToStep1Phase('basics')">
          Volver
        </button>
        <div class="jw-foot__right">
          <button type="button" class="jw-btn-ticket"
                  onclick="window.SmartGeneratorWizard.goToStep1Phase('days')">
            Continuar
          </button>
        </div>
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
    const suggestions = getDayTripSuggestions(this.wizardData.cityStops, this.wizardData.totalDays);
    const routePressure = analyzeRoutePressure(this.wizardData.cityStops, this.wizardData.totalDays);
    return `
      <div class="space-y-4 animate-fadeInUp jw-screen jw-screen--days">
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">¿Cómo repartimos los días?</h3>
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
          ${routePressure ? `
            <aside class="jw-route-pressure jw-route-pressure--${routePressure.severity}" role="status">
              <div class="jw-route-pressure__stamp" aria-hidden="true">
                <strong>${routePressure.hotelChanges}</strong><span>CAMBIOS</span>
              </div>
              <div class="jw-route-pressure__copy">
                <span class="jw-route-pressure__eyebrow">REVISIÓN DE RITMO · EQUIPAJE</span>
                <h4>Tu viaje tendrá muchos cambios de hotel</h4>
                <p>${routePressure.message}</p>
                <div class="jw-route-pressure__facts">
                  <span>🧳 ${routePressure.hotelChanges} mudanzas</span>
                  <span>📍 ${routePressure.daysPerBase} días por base</span>
                  ${routePressure.longest ? `<span>🚄 tramo mayor: ${routePressure.longest.from} → ${routePressure.longest.to} · ${routePressure.longest.label}</span>` : ''}
                </div>
                ${routePressure.oneNightStops.length ? `<p class="jw-route-pressure__note">Solo una noche: ${routePressure.oneNightStops.join(', ')}. Considera quitar una base o convertir una parada cercana en excursión.</p>` : ''}
              </div>
              <button type="button" onclick="window.SmartGeneratorWizard.goToStep1Phase('map')" class="jw-route-pressure__action">
                Revisar la ruta
              </button>
            </aside>
          ` : ''}
          ${suggestions.length ? `
            <section class="jw-daytrip-suggestions" aria-labelledby="jw-daytrip-title">
              <div class="jw-daytrip-suggestions__intro">
                <span class="jw-daytrip-suggestions__eyebrow">IDEAS DESDE TU HOTEL BASE</span>
                <h4 id="jw-daytrip-title">Un día fuera, sin mover maletas</h4>
                <p>${this.wizardData.totalDays} días en ${this.cityLabel(suggestions[0].baseCity)} dan espacio para una excursión. Japitin toma un día de la base, conserva la duración total y no crea otro hotel.</p>
              </div>
              <div class="jw-daytrip-postcards">
                ${suggestions.map((trip, idx) => `
                  <article class="jw-daytrip-postcard ${trip.added ? 'is-added' : ''}">
                    <span class="jw-daytrip-postcard__index">EXCURSIÓN ${String(idx + 1).padStart(2, '0')}</span>
                    <div class="jw-daytrip-postcard__route">
                      <span>${trip.icon}</span>
                      <strong>${this.cityLabel(trip.baseCity)} <i>→</i> ${trip.city}</strong>
                    </div>
                    <p>${trip.note}</p>
                    <div class="jw-daytrip-postcard__meta">
                      <span>🚆 aprox. ${trip.minutes} min</span>
                      <span>🧳 mismo hotel</span>
                    </div>
                    <button type="button"
                      onclick="window.SmartGeneratorWizard.${trip.added ? 'removeSuggestedDayTrip' : 'addSuggestedDayTrip'}('${trip.baseCity.replace(/'/g, "\\'")}','${trip.city.replace(/'/g, "\\'")}')"
                      class="jw-daytrip-postcard__action">
                      ${trip.added ? '✓ Añadida · quitar' : '+ Añadir a mi ruta'}
                    </button>
                  </article>
                `).join('')}
              </div>
            </section>
          ` : ''}
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

  addSuggestedDayTrip(baseCity, destination) {
    let baseIdx = this.wizardData.cityStops.findIndex(stop => !stop.isDayTrip && stop.city === baseCity);
    if (baseIdx < 0) {
      this.wizardData.cityStops = [{ city: baseCity, days: this.wizardData.totalDays, isDayTrip: false }];
      baseIdx = 0;
    }
    const base = this.wizardData.cityStops[baseIdx];
    if (base.days == null) base.days = this.wizardData.totalDays;
    if (base.days <= 1 || this.wizardData.cityStops.some(stop => stop.isDayTrip && stop.city === destination)) return;

    base.days -= 1;
    this.wizardData.cityStops.splice(baseIdx + 1, 0, {
      city: destination, days: 1, isDayTrip: true, baseCity, suggested: true
    });
    if (!this.wizardData.cities.includes(destination)) this.wizardData.cities.push(destination);
    this.wizardData.dayAllocationMode = 'manual';
    this.saveToSessionStorage();
    this.renderWizard();
  },

  removeSuggestedDayTrip(baseCity, destination) {
    const idx = this.wizardData.cityStops.findIndex(stop =>
      stop.isDayTrip && stop.city === destination && (stop.baseCity === baseCity || stop.suggested)
    );
    if (idx < 0) return;
    const removed = this.wizardData.cityStops[idx];
    const base = this.wizardData.cityStops.find(stop => !stop.isDayTrip && stop.city === baseCity);
    if (base) base.days = Number(base.days || 0) + Number(removed.days || 1);
    this.wizardData.cityStops.splice(idx, 1);
    if (!this.wizardData.cityStops.some(stop => stop.city === destination)) {
      this.wizardData.cities = this.wizardData.cities.filter(city => city !== destination);
    }
    this.saveToSessionStorage();
    this.renderWizard();
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
      <label class="jw-diet-tag flex items-center gap-2 p-2 border ${isChecked ? 'is-selected border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-300 dark:border-gray-600'}
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
      <label class="jw-access-pass flex items-center gap-2 p-2 border ${isSelected ? 'is-selected border-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'border-gray-300 dark:border-gray-600'}
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
  /**
   * Lista canónica de intereses. Los ids son contrato con el generador
   * (smart-itinerary-generator los lee de wizardData.interests) - NO tocar.
   */
  ALL_INTERESTS: [
    { id: 'cultural', label: 'Templos & Cultura' },
    { id: 'food', label: 'Comida & Gastronomía' },
    { id: 'nature', label: 'Naturaleza & Flores' },
    { id: 'anime', label: 'Anime & Gaming' },
    { id: 'shopping', label: 'Compras' },
    { id: 'history', label: 'Historia' },
    { id: 'nightlife', label: 'Vida Nocturna' },
    { id: 'art', label: 'Arte & Museos' },
    { id: 'photography', label: 'Lugares Fotogénicos' },
    { id: 'technology', label: 'Tecnología' }
  ],

  /**
   * STEP 2: "¿Qué quieres descubrir?"
   *
   * Rediseñado según la referencia oficial `Itinerary wizard 3 ref`: cada
   * interés es una POSTAL (la ilustración acuarela es la superficie del
   * control, con su sello hanko), no una card con miniatura. La columna
   * derecha es narrativa - el gato experto interpreta lo elegido.
   *
   * Los <input type="checkbox"> reales siguen existiendo bajo la postal
   * (solo ocultos visualmente): saveStep2Data() los lee por
   * `.interest-checkbox:checked` y el teclado/lector de pantalla los usa
   * igual que antes. Sustituirlos por <div>s habría roto ambas cosas.
   *
   * El slider de intensidad y "¿con quién viajas?" se movieron al Step 3
   * ("Estilo de viaje"), que es donde las referencias los colocan.
   */
  renderStep2() {
    return `
      <div class="jw-screen jw-screen--interests">
      <div class="jw-catnote">
        <img class="jw-catnote__cat" src="/images/illustrations/generated/characters/cat-explorer.webp"
             alt="" aria-hidden="true" loading="eager" width="118">
        <div class="jw-catnote__paper">
          <h3>Cuéntame qué cosas hacen que un viaje sea inolvidable para ti.</h3>
          <p>Puedes elegir todos los intereses que quieras.</p>
        </div>
      </div>

      <div class="jw-tray" id="interestTray">
        ${this.renderInterestTray()}
      </div>

      <div class="jw-grid">
        <section class="jw-panel jw-panel--taped">
          <h3 class="jw-panel__title" id="interestsLabel">Elige tus intereses</h3>
          <div class="jw-cards" id="interestsContainer" role="group" aria-labelledby="interestsLabel">
            ${this.ALL_INTERESTS.map(interest => this.renderInterestCheckbox(interest)).join('')}
          </div>
          <!-- OJO: la clase 'hidden' (no el atributo) es lo que
               validateField('interests') alterna con classList. Si esto
               usara el atributo hidden, el aviso no volvería a aparecer
               nunca. -->
          <div id="interestsError" class="jw-warn hidden">
            <span aria-hidden="true">✕</span> Elige al menos un interés para que Japitin pueda armar tu viaje
          </div>
          <p class="jw-tip">
            <b>Tip:</b> selecciona tus favoritos y ajusta su prioridad con los puntitos —
            entre más alta, más peso tienen al elegir actividades.
          </p>
        </section>

        <aside class="jw-aside" id="interestAside">
          ${this.renderInterestAside()}
        </aside>
      </div>
      </div>
    `;
  },

  /**
   * Bandeja "Mi colección de viaje" — cada interés elegido es una etiqueta
   * de equipaje con su ojal, no un chip de Tailwind.
   */
  renderInterestTray() {
    const chosen = this.wizardData.interests;
    const total = this.ALL_INTERESTS.length;

    return `
      <h4 class="jw-tray__title">
        <img src="/images/illustrations/generated/decorations/washi-blue.webp" alt="" width="18" height="18" aria-hidden="true">
        Mi colección de viaje
      </h4>
      <div class="jw-tray__row">
        ${chosen.length === 0
          ? '<p class="jw-tray__empty">Todavía no has elegido nada… ¡empieza por lo que más te emocione!</p>'
          : chosen.map(id => {
              const meta = this.ALL_INTERESTS.find(i => i.id === id);
              if (!meta) return '';
              return `
                <div class="jw-tag">
                  <img src="${INTEREST_IMAGES[id]}" alt="" aria-hidden="true" loading="eager">
                  <span class="jw-tag__name">${INTEREST_SHORT[id] || meta.label}</span>
                  <button type="button" class="jw-tag__off"
                          onclick="window.SmartGeneratorWizard.toggleInterest('${id}')"
                          aria-label="Quitar ${meta.label} de tu colección">✕</button>
                </div>
              `;
            }).join('')}
        <div class="jw-tray__count">
          <b>${chosen.length}/${total}</b>
          <span>seleccionados</span>
        </div>
      </div>
    `;
  },

  /**
   * Columna narrativa: el gato "ve" el viaje que se está formando.
   * Las miniaturas flotantes son las postales ya elegidas (no arte fijo),
   * así el panel reacciona de verdad a lo que hace el usuario.
   */
  renderInterestAside() {
    const chosen = this.wizardData.interests;

    return `
      <div class="jw-dream">
        <div class="jw-dream__bubbles">
          ${chosen.map(id => `<img class="jw-dream__thumb" src="${INTEREST_IMAGES[id]}" alt="" aria-hidden="true" loading="eager">`).join('')}
        </div>
        <p class="jw-dream__note">${chosen.length
          ? '¡Ya veo por dónde va tu aventura!'
          : 'Elige algo y te digo qué imagino…'}</p>
      </div>

      <img class="jw-aside__cat" src="/images/illustrations/generated/characters/cat-wizard.webp"
           alt="" aria-hidden="true" loading="eager" width="128">

      <div class="jw-vibe">
        <p class="jw-vibe__title">Tu viaje tiene una vibra…</p>
        <div class="jw-vibe__row" aria-live="polite">
          ${chosen.length === 0
            ? '<span class="jw-vibe__empty">todavía por descubrir ✿</span>'
            : chosen.slice(0, 4).map(id => `<span class="jw-chip">${VIBE_LABELS[id] || INTEREST_SHORT[id]}</span>`).join('')}
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
      // Sin el emoji: los iconos pequeños del wizard son ilustración o SVG,
      // nunca emoji (regla de la dirección de arte).
      labelElement.textContent = label.label;
    }

    const startTimeInfoElement = document.getElementById('startTimeInfo');
    if (startTimeInfoElement) {
      startTimeInfoElement.innerHTML = this.renderStartTimeInfo();
    }

    // Marca viva de la escala del slider + pasaporte al día
    document.querySelectorAll('.jw-slider__ticks > span').forEach((el, i) => {
      el.classList.toggle('is-on', intensityLevels[i] === this.wizardData.pace);
    });
    this.refreshPassport();

    this.saveToSessionStorage();
  },

  /**
   * 🆕 Actualiza las fechas del viaje y calcula días automáticamente
   */
  updateTripDates() {
    const startInput = document.getElementById('tripStartDate');
    const endInput = document.getElementById('tripEndDate');
    const totalDaysInput = document.getElementById('totalDays');

    // 🆕 El date picker nativo de "fecha de fin" abría siempre en el mes
    // actual, obligando a navegar desde cero aunque ya se hubiera elegido
    // el inicio (ej. inicio 15 feb, el picker de fin seguía mostrando el
    // mes de hoy). Se ata min=inicio (limita fechas inválidas) y, si el
    // usuario aún no eligió fin o quedó antes del nuevo inicio, se sugiere
    // inicio+6 días como valor de partida - editable, no forzado.
    if (startInput && endInput && startInput.value) {
      endInput.min = startInput.value;
      if (!endInput.value || endInput.value < startInput.value) {
        const suggestedEnd = new Date(startInput.value + 'T00:00:00');
        suggestedEnd.setDate(suggestedEnd.getDate() + 6);
        endInput.value = suggestedEnd.toISOString().split('T')[0];
      }
    }

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
    const img = COMPANION_IMAGES[type] || null;
    // Mismo principio que las postales: el <input> real sigue ahí (lo lee
    // saveStep2Data vía .companion-radio:checked y lo usa el teclado), solo
    // que oculto bajo la viñeta.
    return `
      <label class="jw-option">
        <input
          type="radio"
          name="companionType"
          class="companion-radio jw-option__input"
          data-companion="${type}"
          onchange="window.SmartGeneratorWizard.onCompanionChange()"
          ${isSelected ? 'checked' : ''}
        >
        <span class="jw-option__art">
          ${img
            ? `<img src="${img}" alt="" aria-hidden="true" loading="eager">`
            : `<span class="jw-option__none" aria-hidden="true">—</span>`}
        </span>
        <span class="jw-option__label">${label}</span>
        <span class="jw-option__desc">${desc}</span>
        <span class="jw-option__check" aria-hidden="true"></span>
      </label>
    `;
  },

  /**
   * El pasaporte de la derecha refleja ritmo y compañía en vivo: si no se
   * repinta al elegir, el usuario ve un documento que contradice lo que
   * acaba de marcar.
   */
  onCompanionChange() {
    this.saveStep2Data();
    this.refreshPassport();
  },

  refreshPassport() {
    const aside = document.getElementById('passportAside');
    if (aside) aside.innerHTML = this.renderPassport();
  },

  /**
   * Helper para renderizar checkbox de interés + selector de peso (1-5 estrellas)
   * cuando está seleccionado. El peso deja de ser "todo o nada" - un interés en 5
   * estrellas domina el orden de actividades sugeridas mucho más que uno en 1 estrella.
   */
  renderInterestCheckbox(interest) {
    const isChecked = this.wizardData.interests.includes(interest.id);
    const weight = this.wizardData.interestWeights[interest.id] || 3;
    const img = INTEREST_IMAGES[interest.id];
    const kanji = INTEREST_KANJI[interest.id] || '旅';

    return `
      <label class="jw-postcard">
        <input
          type="checkbox"
          class="interest-checkbox jw-postcard__input"
          data-interest="${interest.id}"
          onchange="window.SmartGeneratorWizard.toggleInterest('${interest.id}')"
          ${isChecked ? 'checked' : ''}
        >
        <span class="jw-postcard__check" aria-hidden="true"></span>
        <span class="jw-postcard__art">
          <img src="${img}" alt="" aria-hidden="true" loading="eager" width="660" height="495">
          <span class="jw-postcard__hanko" aria-hidden="true"><i>${kanji}</i></span>
        </span>
        <span class="jw-postcard__label">${interest.label}</span>
        ${isChecked ? `
          <span class="jw-weight" onclick="event.preventDefault(); event.stopPropagation();">
            <span class="jw-weight__hint">prioridad</span>
            ${[1, 2, 3, 4, 5].map(n => `
              <button
                type="button"
                class="jw-weight__dot ${n <= weight ? 'jw-weight__dot--on' : ''}"
                onclick="window.SmartGeneratorWizard.setInterestWeight('${interest.id}', ${n})"
                aria-label="Prioridad ${n} de 5 para ${interest.label}"
                aria-pressed="${n === weight}"
              ></button>
            `).join('')}
          </span>
        ` : ''}
      </label>
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

    // ⚠️ validateField('interests') llama a saveStep2Data(), que RELEE el DOM
    // (.interest-checkbox:checked) y pisa lo que acabamos de calcular. Cuando
    // el usuario clica la postal eso da igual (el input ya cambió solo), pero
    // el "✕" de la etiqueta de equipaje en la bandeja llama a esta función sin
    // tocar ningún input — sin esta sincronización el interés se volvía a
    // añadir de inmediato y la etiqueta parecía no poder quitarse.
    const input = document.querySelector(`.interest-checkbox[data-interest="${interestId}"]`);
    if (input) input.checked = this.wizardData.interests.includes(interestId);

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

    container.innerHTML = this.ALL_INTERESTS.map(interest => this.renderInterestCheckbox(interest)).join('');

    // La bandeja de etiquetas y el panel del gato son parte del mismo
    // estado: si solo se repintaran las postales, la colección y la "vibra"
    // quedarían mostrando la selección anterior.
    const tray = document.getElementById('interestTray');
    if (tray) tray.innerHTML = this.renderInterestTray();

    const aside = document.getElementById('interestAside');
    if (aside) aside.innerHTML = this.renderInterestAside();

    // innerHTML descarta los listeners que restoreFormValues() había puesto
    // sobre los checkboxes anteriores. El onchange inline sigue vivo (viaja
    // en el string), pero re-atamos para conservar el mismo comportamiento
    // que el resto del wizard y no depender de un solo camino.
    container.querySelectorAll('.interest-checkbox').forEach(cb => {
      cb.addEventListener('change', () => this.saveStep2Data());
    });
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
  /**
   * STEP 3: "Estilo de viaje" (ref `Itinerary wizard 4`).
   *
   * Recibe el slider de intensidad y "¿con quién viajas?" que antes vivían
   * en el Step 2, y conserva debajo hoteles/imperdibles/evitar tal cual
   * estaban (mismos ids, mismos handlers, misma validación).
   * El reskin visual de los controles de esta sección es la Fase 2 —
   * aquí solo se reubican dentro de los paneles de papel.
   */
  renderStep3() {
    const selectedCities = this.wizardData.cities;
    const hotelStays = this.getHotelStays();
    const includesTokyo = selectedCities.some(c => c.toLowerCase() === 'tokyo');
    const includesOsaka = selectedCities.some(c => c.toLowerCase() === 'osaka');

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
      <div class="jw-screen jw-screen--style"><div class="jw-catnote">
        <img class="jw-catnote__cat" src="/images/illustrations/generated/characters/cat-explorer.webp"
             alt="" aria-hidden="true" loading="eager" width="118">
        <div class="jw-catnote__paper">
          <h3>¡Ahora cuéntame cómo te gusta viajar!</h3>
          <p>Así puedo planear una aventura que se adapte perfecto a ti.</p>
        </div>
      </div>

      <div class="jw-grid">
       <div>
        <section class="jw-panel jw-panel--taped" style="margin-bottom:18px">

          <!-- FILA DE PREFERENCIA: sello kanji vertical + opciones (ref 4) -->
          <div class="jw-pref">
            <div class="jw-pref__head">
              <span class="jw-pref__kanji" aria-hidden="true"><i>疲</i></span>
              <div>
                <p class="jw-pref__title" id="paceLabel">Ritmo del viaje</p>
                <p class="jw-pref__q">¿Cómo te gusta aprovechar tus días?</p>
              </div>
            </div>
            <div class="jw-pref__body">
              <p class="jw-slider__value">
                <span id="intensityLabel">${intensityLabels[this.wizardData.pace].label}</span>
              </p>
              <input
                type="range"
                id="intensitySlider"
                class="jw-slider"
                min="0" max="4" step="1"
                value="${currentIntensityIndex}"
                aria-labelledby="paceLabel"
                onchange="window.SmartGeneratorWizard.updateIntensity(this.value)"
              >
              <div class="jw-slider__ticks" aria-hidden="true">
                ${intensityLevels.map(level => `
                  <span class="${level === this.wizardData.pace ? 'is-on' : ''}">
                    <b>${intensityLabels[level].label}</b>
                    <i>${intensityLabels[level].desc}</i>
                  </span>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="jw-pref">
            <div class="jw-pref__head">
              <span class="jw-pref__kanji" aria-hidden="true"><i>同</i></span>
              <div>
                <p class="jw-pref__title" id="companionLabel">Compañía</p>
                <p class="jw-pref__q">¿Con quién viajas?</p>
              </div>
            </div>
            <div class="jw-pref__body">
              <div class="jw-options" role="radiogroup" aria-labelledby="companionLabel">
                ${this.renderCompanionOption(null, 'Sin especificar', '👤', 'Genérico')}
                ${this.renderCompanionOption('solo', 'Viajo sola/o', '🧍', 'Flexible')}
                ${this.renderCompanionOption('couple', 'Pareja', '❤️', 'Romántico')}
                ${this.renderCompanionOption('family', 'Familia', '👨‍👩‍👧‍👦', 'Pausado')}
                ${this.renderCompanionOption('seniors', 'Seniors', '👴👵', 'Relajado')}
                ${this.renderCompanionOption('friends', 'Amigos', '🎉', 'Intenso')}
              </div>
            </div>
          </div>

          <!-- 🔧 Indicador honesto: el generador SIEMPRE deriva la hora de
               inicio del ritmo elegido (intensityConfig.startTime), así que
               aquí se muestra, no se pide. Ver nota histórica en el commit
               que eliminó el <select> de "hora de inicio". -->
          <p id="startTimeInfo" class="jw-tip" style="margin-top:6px">
            ${this.renderStartTimeInfo()}
          </p>
        </section>

       </div>
       <aside class="jw-aside" id="passportAside">
         ${this.renderPassport()}
       </aside>
      </div>

        <div class="space-y-6 jw-style-details">
        ${includesTokyo ? YamanoteHelper.render() : ''}
        ${includesOsaka ? OsakaLoopHelper.render() : ''}

        <!-- Hoteles por ciudad -->
        <section class="jw-panel">
          <h3 class="jw-panel__title">Dónde vas a dormir <em class="jw-opt">opcional</em></h3>
          <p class="jw-hint">
            Ordenamos cada día para que empiece y termine cerca de tu alojamiento.
            El <strong>área o barrio</strong> es el dato que más ayuda: si el nombre exacto
            del hotel no se encuentra, el barrio nos sirve igual.
          </p>
          <div class="jw-lodges">
            ${hotelStays.map(stay => this.renderHotelInput(stay)).join('')}
          </div>
        </section>

        <!-- Must-See Places -->
        <section class="jw-panel">
          <h3 class="jw-panel__title">Lo que no te quieres perder <em class="jw-opt">opcional</em></h3>
          <div id="mustSeeList" class="space-y-2 mb-2">
            ${this.wizardData.mustSee.map((place, idx) => this.renderMustSeeItem(place, idx)).join('')}
          </div>
          <button type="button"
            onclick="window.SmartGeneratorWizard.addMustSeePlace()"
            class="jw-add"
          >
            + Agregar lugar imperdible
          </button>
        </section>

        <!-- Avoid Places -->
        <section class="jw-panel">
          <label class="jw-panel__title" for="avoidPlaces">
            Lo que prefieres evitar <em class="jw-opt">opcional</em>
          </label>
          <textarea
            id="avoidPlaces"
            rows="2"
            placeholder="Ej: clubes, museos de guerra, lugares muy turísticos…"
          >${this.wizardData.avoid.join(', ')}</textarea>
        </section>
        </div>
      </div>
    `;
  },

  /**
   * PASAPORTE JAPITIN (ref `Itinerary wizard 4`, columna derecha).
   *
   * Es el espejo del Step 3: refleja lo que el usuario ya decidió, con la
   * ilustración del pasaporte como marco real (images/wizard/passport-
   * spread.webp) y el texto en HTML encima — el asset no lleva texto
   * incrustado precisamente para que estos valores puedan ser dinámicos.
   *
   * Solo muestra campos que EXISTEN en wizardData. Las referencias enseñan
   * también transporte/alojamiento/horario, pero el modelo de datos no los
   * tiene y no se inventan campos muertos solo por parecerse al mockup.
   */
  renderPassport() {
    const d = this.wizardData;
    const paceLabel = { light: 'Tranquilo', moderate: 'Equilibrado', packed: 'Intenso', extreme: 'Extremo', maximum: 'Máximo' }[d.pace] || 'Equilibrado';
    const companionLabel = { solo: 'Sola/o', couple: 'En pareja', family: 'En familia', seniors: 'Seniors', friends: 'Con amigos' }[d.companionType] || 'Por definir';
    // El nombre va en un pasaporte: primer nombre, capitalizado y corto.
    // Sin esto, una cuenta sin displayName mostraba el prefijo crudo del
    // email ("claude.uitest.japitin") desbordando la página del documento.
    const rawName = window.AuthHandler?.currentUser?.displayName
      || window.AuthHandler?.currentUser?.email?.split('@')[0]
      || 'Viajera';
    const firstName = rawName.split(/[\s._-]+/)[0].slice(0, 14);
    const traveler = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const nights = d.totalDays > 0 ? `${d.totalDays} días` : '—';
    const budget = d.dailyBudget ? `¥${Number(d.dailyBudget).toLocaleString('es')} / día` : '—';

    const rows = [
      ['Ritmo', paceLabel],
      ['Compañía', companionLabel],
      ['Duración', nights],
      ['Presupuesto', budget],
      ['Ciudades', d.cities.length ? d.cities.slice(0, 3).join(', ') + (d.cities.length > 3 ? '…' : '') : '—']
    ];

    return `
      <div class="jw-passport">
        <img class="jw-passport__paper" src="/images/wizard/passport-spread.webp"
             alt="" aria-hidden="true" loading="eager">
        <div class="jw-passport__inner">
          <p class="jw-passport__brand">PASAPORTE <b>JAPITIN</b></p>
          <div class="jw-passport__id">
            <img class="jw-passport__photo" src="/images/illustrations/generated/characters/cat-thinking.webp"
                 alt="" aria-hidden="true" loading="eager">
            <div>
              <p class="jw-passport__name">${traveler}</p>
              <p class="jw-passport__role">Explorador${traveler.endsWith('a') ? 'a' : ''} ${paceLabel}</p>
            </div>
          </div>
          <dl class="jw-passport__rows">
            ${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
          </dl>
          <span class="jw-passport__stamp" aria-hidden="true"><i>旅</i></span>
        </div>
      </div>

      <img class="jw-aside__cat" src="/images/illustrations/generated/characters/cat-suitcase.webp"
           alt="" aria-hidden="true" loading="eager" width="150">

      <p class="jw-tip">
        <b>Tip Japitin:</b> podrás ajustar todo esto después si quieres cambiar algo de tu viaje.
      </p>
    `;
  },

  /**
   * STEP 4: "¡Magia Japitin!" (ref `Itinerary wizard 5`).
   *
   * Antesala de la generación: el gato mago recapitula lo que le contaste
   * como una cadena de tarjetas que desemboca en un boleto ("= tu
   * itinerario"). No introduce datos nuevos ni valida nada propio — el
   * botón dispara el mismo generateItinerary() de siempre.
   */
  renderStep4() {
    const d = this.wizardData;
    const cities = d.cities.length ? d.cities : ['—'];
    const citiesLabel = cities.slice(0, 3).join(', ') + (cities.length > 3 ? ` + ${cities.length - 3} más` : '');
    const interestLabels = d.interests
      .map(id => (this.ALL_INTERESTS.find(i => i.id === id) || {}).label)
      .filter(Boolean);
    const interestsLabel = interestLabels.slice(0, 3).join(', ') + (interestLabels.length > 3 ? ` + ${interestLabels.length - 3} más` : '');
    const paceLabel = { light: 'Tranquilo', moderate: 'Equilibrado', packed: 'Intenso', extreme: 'Extremo', maximum: 'Máximo' }[d.pace] || 'Equilibrado';
    const companionLabel = { solo: 'Sola/o', couple: 'En pareja', family: 'En familia', seniors: 'Seniors', friends: 'Con amigos' }[d.companionType] || 'Sin especificar';

    const chain = [
      { n: 1, title: 'TUS DESTINOS', sub: 'Los lugares que elegiste', chips: cities.slice(0, 3), extra: cities.length > 3 ? `+ ${cities.length - 3} más` : '' },
      { n: 2, title: 'TUS INTERESES', sub: 'Lo que te apasiona', chips: interestLabels.slice(0, 2), extra: interestLabels.length > 2 ? `+ ${interestLabels.length - 2} más` : '' },
      { n: 3, title: 'TU ESTILO', sub: 'Cómo te gusta viajar', chips: [paceLabel, companionLabel], extra: '' },
      { n: 4, title: 'JAPITIN ORGANIZA', sub: 'Creando tu aventura ideal', chips: [`${d.totalDays} días`], extra: '' }
    ];

    return `
      <div class="jw-screen jw-screen--summary"><div class="jw-catnote">
        <img class="jw-catnote__cat" src="/images/illustrations/generated/characters/cat-wizard.webp"
             alt="" aria-hidden="true" loading="eager" width="118">
        <div class="jw-catnote__paper">
          <h3>¡Magia Japitin en acción!</h3>
          <p>Voy a crear el itinerario perfecto para ti con todo lo que me contaste.</p>
        </div>
      </div>

      <div class="jw-grid">
        <section class="jw-panel jw-panel--taped">
          <h3 class="jw-panel__title">Esto es lo que me contaste</h3>
          <div class="jw-chain">
            ${chain.map(c => `
              <div class="jw-chain__card">
                <span class="jw-chain__num">${c.n}</span>
                <p class="jw-chain__title">${c.title}</p>
                <p class="jw-chain__sub">${c.sub}</p>
                <div class="jw-chain__chips">
                  ${c.chips.map(ch => `<span class="jw-chip">${ch}</span>`).join('')}
                  ${c.extra ? `<span class="jw-chain__more">${c.extra}</span>` : ''}
                </div>
              </div>
            `).join('')}
            <span class="jw-chain__eq" aria-hidden="true">=</span>
            <div class="jw-chain__ticket">
              <span class="jw-chain__ticket-label">TU ITINERARIO</span>
              <span class="jw-chain__ticket-sub">está listo para nacer</span>
              <span class="jw-chain__ticket-stamp" aria-hidden="true"><i>完成</i></span>
            </div>
          </div>
        </section>

        <aside class="jw-aside">
          <h3 class="jw-panel__title">Resumen de tu aventura</h3>
          <dl class="jw-summary">
            <div><dt>Destino</dt><dd>${citiesLabel}</dd></div>
            <div><dt>Duración</dt><dd>${d.totalDays} días</dd></div>
            <div><dt>Estilo de viaje</dt><dd>${paceLabel} · ${companionLabel}</dd></div>
            <div><dt>Intereses principales</dt><dd>${interestsLabel || '—'}</dd></div>
          </dl>
          <p class="jw-tip">
            Voy a buscar actividades, restaurantes, rutas y experiencias que te van a encantar.
            <b>¡Prepárate para vivir Japón a tu manera!</b>
          </p>
        </aside>
      </div>
      </div>
    `;
  },

  /**
   * Helper para renderizar input de hotel
   */
  getHotelStays() {
    const route = this.wizardData.dayAllocationMode === 'manual' && this.wizardData.cityStops.length
      ? this.wizardData.cityStops.filter(stop => !stop.isDayTrip)
      : this.wizardData.cities.map(city => ({city}));
    const totals = route.reduce((result, stop) => {
      const cityKey = stop.city.toLowerCase(); result[cityKey] = (result[cityKey] || 0) + 1; return result;
    }, {});
    const visits = {};
    return route.map(stop => {
      const cityKey = stop.city.toLowerCase();
      visits[cityKey] = (visits[cityKey] || 0) + 1;
      const repeated = totals[cityKey] > 1;
      return {
        city: stop.city,
        visitIndex: visits[cityKey],
        visitCount: totals[cityKey],
        key: repeated ? `${cityKey}-stay-${visits[cityKey]}` : cityKey,
        label: repeated ? `${stop.city} · estancia ${visits[cityKey]}` : stop.city
      };
    });
  },

  renderHotelInput(stay) {
    const legacyKey = stay.city.toLowerCase();
    const hotel = this.wizardData.hotels[stay.key] || (stay.visitIndex === 1 ? this.wizardData.hotels[legacyKey] : null) || { name: '', area: '' };
    // Ficha de alojamiento: una tarjeta de registro de ryokan, con la ciudad
    // como pestaña. Los data-city y las clases hotel-name-input /
    // hotel-area-input son contrato con saveStep3Data() — no tocar.
    return `
      <div class="jw-lodge">
        <span class="jw-lodge__tab">${stay.label}</span>
        ${stay.visitCount > 1 ? `<span class="jw-lodge__stay">ALOJAMIENTO ${String(stay.visitIndex).padStart(2, '0')}</span>` : ''}
        <div class="jw-lodge__fields">
          <label class="jw-field">
            <span class="jw-field__label">Hotel</span>
            <input
              type="text"
              class="hotel-name-input"
              data-city="${legacyKey}"
              data-hotel-key="${stay.key}"
              placeholder="Nombre del hotel"
              value="${hotel.name}"
            >
          </label>
          <label class="jw-field">
            <span class="jw-field__label">Área o barrio</span>
            <input
              type="text"
              class="hotel-area-input"
              data-city="${legacyKey}"
              data-hotel-key="${stay.key}"
              placeholder="Ej: Shinjuku, Gion…"
              value="${hotel.area}"
            >
          </label>
        </div>
      </div>
    `;
  },

  /**
   * Helper para renderizar item de must-see
   */
  renderMustSeeItem(place, idx) {
    // Cada imperdible es una entrada de lista escrita a mano, con su viñeta
    // de tinta. Las clases mustSee-name-input / mustSee-city-select y
    // data-idx son contrato con saveStep3Data() — no tocar.
    return `
      <div class="jw-wish">
        <span class="jw-wish__bullet" aria-hidden="true"></span>
        <input
          type="text"
          class="mustSee-name-input jw-wish__name"
          data-idx="${idx}"
          placeholder="Nombre del lugar"
          value="${place.name}"
          aria-label="Nombre del lugar imperdible ${idx + 1}"
        >
        <select
          class="mustSee-city-select jw-wish__city"
          data-idx="${idx}"
          aria-label="Ciudad del lugar imperdible ${idx + 1}"
        >
          <option value="">Ciudad…</option>
          ${this.wizardData.cities.map(city => `<option value="${city}" ${place.city === city ? 'selected' : ''}>${city}</option>`).join('')}
        </select>
        <button
          type="button"
          onclick="window.SmartGeneratorWizard.removeMustSeePlace(${idx})"
          class="jw-wish__del"
          aria-label="Quitar este lugar"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;
  },

  /**
   * Renderiza botones del footer
   */
  renderFooterButtons() {
    const isFirstStep = this.currentStep === 1;
    const isLastStep = this.currentStep === this.TOTAL_STEPS;
    // 🆕 Las 3 fases internas del Step 1 (basics/map/days) traen su propio
    // botón de avance inline - basics/map llaman a goToStep1Phase(), y days
    // llama directo a nextStep() (la navegación externa). Mostrar TAMBIÉN el
    // "Siguiente →" del footer externo mientras currentStep===1 duplicaba el
    // botón en pantalla (confirmado visualmente) - se oculta siempre para
    // las 3 fases, no solo basics/map.
    const hideOuterNext = this.currentStep === 1;

    const arrow = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    const arrowBack = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>';

    return `
      <button type="button" class="jw-foot__cancel" onclick="window.SmartGeneratorWizard.close()">
        Cancelar
      </button>
      <div class="jw-foot__right">
        ${!isFirstStep ? `
          <button type="button" class="jw-btn-back" onclick="window.SmartGeneratorWizard.prevStep()">
            ${arrowBack} Volver
          </button>
        ` : ''}
        ${hideOuterNext ? '' : !isLastStep ? `
          <button type="button" class="jw-btn-ticket" onclick="window.SmartGeneratorWizard.nextStep()">
            Continuar ${arrow}
          </button>
        ` : `
          <button type="button" class="jw-btn-ticket jw-btn-ticket--go" onclick="window.SmartGeneratorWizard.generateItinerary()">
            ✨ Ver mi aventura ${arrow}
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
    const departureTimeInput = document.getElementById('departureTime');
    if (departureTimeInput) this.wizardData.departureTime = departureTimeInput.value || null;

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
    // ⚠️ Los intereses (Step 2) y el ritmo/compañía (Step 3) ya NO están en
    // la misma pantalla. Sin este guard, llamar a saveStep2Data() desde el
    // Step 3 encontraría cero `.interest-checkbox` en el DOM y vaciaría
    // wizardData.interests en silencio — exactamente el bug que ya ocurrió
    // con las ciudades cuando pasaron del checkbox al mapa (ver nota en
    // saveStep1Data). Solo se sobrescribe lo que esté realmente montado.
    const interestNodes = document.querySelectorAll('.interest-checkbox');
    if (interestNodes.length > 0) {
      this.wizardData.interests = Array.from(interestNodes)
        .filter(cb => cb.checked)
        .map(cb => cb.dataset.interest);
    }

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
      const hotelKey = input.dataset.hotelKey || city;
      const areaInput = document.querySelector(`.hotel-area-input[data-hotel-key="${hotelKey}"]`);
      if (input.value.trim()) {
        this.wizardData.hotels[hotelKey] = {
          name: input.value.trim(),
          area: areaInput ? areaInput.value.trim() : '',
          city
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
      if (this.wizardData.tripStartDate && this.wizardData.tripEndDate) {
        const start = new Date(`${this.wizardData.tripStartDate}T00:00:00`);
        const end = new Date(`${this.wizardData.tripEndDate}T00:00:00`);
        if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) {
          window.Notifications?.show('❌ La fecha de regreso debe ser posterior a la fecha de salida', 'error');
          return false;
        }
      }
      if (this.wizardData.travelerAges.length > this.wizardData.groupSize) {
        window.Notifications?.show('❌ Hay más edades registradas que personas en el grupo', 'error');
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
      // El ritmo y la compañía viven ahora aquí (venían del Step 2), así que
      // hay que persistir AMBOS bloques antes de avanzar.
      this.saveStep2Data();
      this.saveStep3Data();
      // Hoteles/imperdibles siguen siendo opcionales: sin validación estricta.
    } else if (this.currentStep === 4) {
      // Paso 4 no captura datos propios; solo confirma que lo esencial de
      // los pasos anteriores sigue en pie antes de disparar la generación
      // (generateItinerary() llama a esto).
      if (this.wizardData.cities.length === 0) {
        window.Notifications?.show('❌ Selecciona al menos una ciudad', 'error');
        return false;
      }
      if (this.wizardData.interests.length === 0) {
        window.Notifications?.show('❌ Selecciona al menos un interés', 'error');
        return false;
      }
    }
    return true;
  },

  /**
   * Navega al siguiente paso
   */
  nextStep() {
    if (!this.validateCurrentStep()) return;

    if (this.currentStep < this.TOTAL_STEPS) {
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
      // Persistir lo que haya en pantalla antes de desmontarlo: al volver
      // del Step 3 el ritmo/compañía se perderían si no se guardan aquí
      // (antes daba igual porque volver del 3 no tenía datos que perder).
      this.saveCurrentStepData();
      this.currentStep--;
      this.saveToSessionStorage();
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
    document.body.classList.remove('jw-open');
    if (this._escapeHandler) document.removeEventListener('keydown', this._escapeHandler);
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
        <div id="templateSelectorModal" class="jp-modal-shell jp-template-modal fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Plantillas de itinerarios">
          <div class="jp-modal-paper bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">

            <!-- Header -->
            <div class="jp-modal-head bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-bold">📋 Plantillas de Itinerarios</h2>
                  <p class="text-purple-100 mt-1">Selecciona una plantilla para empezar</p>
                </div>
                <button onclick="document.getElementById('templateSelectorModal').remove()" class="jp-modal-close text-white hover:bg-white/20 rounded-lg p-2 transition" aria-label="Cerrar plantillas">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Template Card -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div class="template-card border-2 border-purple-200 dark:border-purple-800 rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer"
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
      const templateDialog = document.getElementById('templateSelectorModal');
      window.JapitinDialog?.enhance(templateDialog, { onClose: () => templateDialog.remove() });

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
      const toISODate = window.TimeUtils
        ? (d) => window.TimeUtils.toISODate(d)
        : (d) => d.toISOString().split('T')[0];

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
      this.wizardData = this.normalizeWizardData(data.wizardData);

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
    if (this.isGenerating) return;
    if (!this.validateCurrentStep()) return;
    this.isGenerating = true;

    console.log('🚀 Generando itinerarios con:', this.wizardData);

    // 🛬 Warning suave si la ruta no cuadra con los aeropuertos (no bloquea)
    const airportWarnings = this.getAirportRouteWarnings();
    airportWarnings.forEach(w => window.Notifications?.show(w, 'warning', 9000));

    // Mostrar loading con pasos detallados
    const modal = document.getElementById('smartGeneratorWizard');
    if (modal) {
      modal.innerHTML = `
        <div class="jw-making" role="status" aria-live="polite">
          <div class="jw-making__sheet">
            <div class="jw-making__scene" aria-hidden="true">
              <span class="jw-making__sun"></span>
              <span class="jw-making__train">🚃</span>
              <span class="jw-making__route"></span>
            </div>

            <span class="jw-making__eyebrow">旅を作っています · Preparando tu viaje</span>
            <h3>Japitin está trazando tu aventura</h3>
            <p>Combinamos tus gustos, ritmo y ruta en tres propuestas distintas.</p>

            <!-- Pasos de progreso -->
            <div class="jw-making__steps">
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

            <p class="jw-making__time">
              Esto suele tomar <strong>10–20 segundos</strong>. No cierres esta ventana.
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
      for (const [hotelKey, hotelData] of Object.entries(this.wizardData.hotels)) {
        if (hotelData.name && hotelData.area) {
          const city = hotelData.city || hotelKey.replace(/-stay-\d+$/, '');
          // Usar IntelligentGeocoder para buscar coordenadas
          const query = `${hotelData.name}, ${hotelData.area}, ${city}, Japan`;
          console.log(`🔍 Buscando coordenadas para: ${query}`);

          if (window.IntelligentGeocoder) {
            // 🔧 FIX: esto rompía la generación entera y cerraba el wizard.
            // Bugs reales que tenía:
            // 1. Pasaba un string suelto como 2do argumento en vez de
            //    {city}, que es lo que getCoordinates() espera (mismo
            //    patrón que ya usa hotels.js) - degradaba la precisión.
            // 2. Comprobaba `result.success`, un campo que ese método NUNCA
            //    devuelve (sus resultados exitosos son {lat,lng,name,
            //    source,...}), así que esta condición era siempre falsa -
            //    el hotel JAMÁS llegaba a usarse para nada, aunque la
            //    geocodificación funcionara perfecto.
            // 3. Cuando no encontraba nada, getCoordinates() devuelve
            //    `null` (no un objeto con success:false) - leer
            //    `result.success` sobre `null` lanzaba un TypeError que
            //    escapaba hasta el catch de generateItinerary() y cerraba
            //    todo el wizard, aunque fuera un solo hotel el que no se
            //    pudo geocodificar.
            try {
              let result = await window.IntelligentGeocoder.getCoordinates(
                query,
                { city }
              );

              // 🆕 Si el nombre exacto del hotel no matchea en ninguna fuente
              // (muy común - la mayoría de hoteles no están en la base de
              // atracciones ni tienen presencia fuerte en OSM/Nominatim),
              // reintentar solo con el barrio + ciudad. Un barrio real
              // ("Shinjuku, Tokyo, Japan") es mucho más fácil de geocodificar
              // que el nombre de un hotel específico, y sigue siendo un
              // ancla mucho mejor que no tener ninguna.
              if (!result || !result.lat || !result.lng) {
                console.log(`🔍 Hotel no encontrado, reintentando solo con el área: ${hotelData.area}, ${city}, Japan`);
                result = await window.IntelligentGeocoder.getCoordinates(
                  `${hotelData.area}, ${city}, Japan`,
                  { city }
                );
              }

              if (result && result.lat && result.lng) {
                hotelsWithCoords[hotelKey] = {
                  name: hotelData.name,
                  lat: result.lat,
                  lng: result.lng,
                  area: hotelData.area,
                  city
                };
                console.log(`✅ Hotel encontrado para ${hotelKey}:`, hotelsWithCoords[hotelKey]);
              } else {
                console.warn(`⚠️ No se encontraron coordenadas para hotel en ${city}`);
              }
            } catch (geocodeError) {
              // No dejar que un solo hotel sin coordenadas tumbe toda la
              // generación - simplemente se genera sin ese anclaje de hotel.
              console.warn(`⚠️ Error geocodificando hotel en ${city}:`, geocodeError);
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
        departureTime: this.wizardData.departureTime,
        arrivalAirport: this.wizardData.arrivalAirport,
        departureAirport: this.wizardData.departureAirport,
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
      this.isGenerating = false;

    } catch (error) {
      console.error('❌ Error generando itinerario:', error);
      window.Notifications?.show('❌ Error al generar itinerario: ' + error.message, 'error');
      this.isGenerating = false;
      // Mantener todos los datos y volver al resumen para que se pueda reintentar.
      this.currentStep = 4;
      this.saveToSessionStorage();
      this.renderWizard();
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
      <div class="jvv-sheet bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="jvv-head bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <span class="jvv-head__eyebrow">旅程案 · Tres rutas posibles</span>
              <h2 class="text-2xl font-bold mb-2">Tu viaje puede tomar tres caminos</h2>
              <p class="text-purple-100">Hojea las propuestas y elige la que más se parece a ti.</p>
            </div>
            <button
              onclick="window.SmartGeneratorWizard.toggleComparisonMode()"
              class="jvv-compare px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              <span id="comparisonToggleIcon">📊</span>
              <span id="comparisonToggleText">Modo Comparación</span>
            </button>
          </div>
        </div>

        <!-- Content Container -->
        <div id="variationsContent" class="jvv-content flex-1 overflow-y-auto p-6">
          <div class="jvv-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            ${variations.map(variation => this.renderVariationCard(variation)).join('')}
          </div>
        </div>

        <!-- Footer -->
        <div class="jvv-foot border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex justify-between items-center gap-2">
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

      // Nota: el contador 'variationsCompared' se retiró — ver DEPRECATION_LOG.md.
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
    const paceLabels = {
      light: '🐢 Ligero', moderate: '🚶 Moderado', packed: '🏃 Intenso',
      extreme: '⚡ Extremo', maximum: '🔥 Máximo'
    };
    const pace = paceLabels[this.wizardData.pace] || '🚶 Moderado';

    return `
      <div class="jvc-view">
        <section class="jvc-manifest" aria-labelledby="comparison-summary-title">
          <div class="jvc-section-title">
            <div><span>比較表 · MANIFIESTO</span><h3 id="comparison-summary-title">Compara el carácter de cada ruta</h3></div>
            <p>Los mismos días, tres maneras de vivirlos.</p>
          </div>
          <div class="jvc-routes">
            ${variations.map((v, index) => {
              const total = v.itinerary.days.reduce((sum, day) => sum + day.activities.length, 0);
              return `<article class="jvc-route jvc-route--${index + 1}">
                <div class="jvc-route__number">RUTA ${String(index + 1).padStart(2, '0')}</div>
                <div class="jvc-route__identity"><span>${v.icon}</span><h4>${v.name}</h4></div>
                <dl class="jvc-route__facts">
                  <div><dt>Días</dt><dd>${v.itinerary.days.length}</dd></div>
                  <div><dt>Paradas</dt><dd>${total}</dd></div>
                  <div><dt>Presupuesto</dt><dd>¥${(v.itinerary.totalBudget || 0).toLocaleString()}</dd></div>
                  <div><dt>Ritmo</dt><dd>${pace}</dd></div>
                </dl>
                <button onclick="window.SmartGeneratorWizard.selectVariation('${v.id}', ${JSON.stringify(v.itinerary).replace(/"/g, '&quot;')})" class="jvc-choose">Elegir esta ruta <span>→</span></button>
              </article>`;
            }).join('')}
          </div>
        </section>

        <section class="jvc-notebook" aria-labelledby="comparison-days-title">
          <div class="jvc-section-title jvc-section-title--days">
            <div><span>旅の日記 · CUADERNO</span><h3 id="comparison-days-title">Mira cómo cambia cada día</h3></div>
            <button onclick="window.SmartGeneratorWizard.showHybridBuilder()" class="jvc-hybrid">✂️ Mezclar mis días</button>
          </div>
          <div class="jvc-days">
            ${Array.from({length: maxDays}, (_, i) => {
              const dayNumber = i + 1;
              return `
                <article class="jvc-day">
                  <div class="jvc-day__tab"><small>DÍA</small><strong>${String(dayNumber).padStart(2, '0')}</strong></div>
                  <div class="jvc-day__routes">
                    ${variations.map((v, vIndex) => {
                      const day = v.itinerary.days[i];
                      if (!day) {
                        return `<div class="jvc-day__route jvc-day__route--empty">Sin actividades</div>`;
                      }
                      return `
                        <div class="jvc-day__route">
                          <h4>${v.icon} ${v.name}</h4>
                          <ol>
                            ${day.activities.slice(0, 4).map(act => `
                              <li><strong>${act.title || act.name || 'Actividad'}</strong><small>${this.translateCategory(act.category)} · ${Math.floor(act.duration / 60)}h ${act.duration % 60}m</small></li>
                            `).join('')}
                            ${day.activities.length > 4 ? `
                              <li class="jvc-day__more">+${day.activities.length - 4} paradas más</li>
                            ` : ''}
                          </ol>
                          <div class="jvc-day__total"><span>¥${((day.budgetBreakdown?.total ?? day.budget) || 0).toLocaleString()}</span><span>${day.activities.length} paradas</span></div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </section>

        <section class="jvc-tags">
          <div class="jvc-section-title"><div><span>荷札 · ETIQUETAS</span><h3>La personalidad de cada viaje</h3></div></div>
          <div class="jvc-tags__grid">
            ${variations.map(v => `
              <div class="jvc-tag-group">
                <strong>${v.icon} ${v.name}</strong>
                <div>${v.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
              </div>
            `).join('')}
          </div>
        </section>
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
    if (!Array.isArray(this.hybridSelection) || this.hybridSelection.length !== maxDays) {
      this.hybridSelection = Array.from({length: maxDays}, (_, dayIndex) =>
        Math.max(0, this.currentVariations.findIndex(v => v.itinerary.days[dayIndex]))
      );
    }
    this.hybridSelection = this.hybridSelection.map((variationIndex, dayIndex) =>
      this.currentVariations[variationIndex]?.itinerary.days[dayIndex]
        ? variationIndex
        : Math.max(0, this.currentVariations.findIndex(v => v.itinerary.days[dayIndex]))
    );

    const selectedBudget = this.hybridSelection.reduce((sum, variationIndex, dayIndex) => {
      const day = this.currentVariations[variationIndex]?.itinerary.days[dayIndex];
      return sum + (day?.budgetBreakdown?.total ?? day?.budget ?? 0);
    }, 0);

    modal.innerHTML = `
      <div class="jvh-sheet w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <header class="jvh-head">
          <div class="jvh-head__inner">
            <div>
              <span class="jvh-eyebrow">切り貼り · TALLER DE RUTA</span>
              <h2>Arma tu viaje, día por día</h2>
              <p>Recorta tus días favoritos de cada propuesta y únelos en una sola ruta.</p>
            </div>
            <button
              onclick="window.SmartGeneratorWizard.showVariationsSelector(window.SmartGeneratorWizard.currentVariations)"
              class="jvh-back"
            >
              ← Ver las tres rutas
            </button>
          </div>
          <div class="jvh-summary" aria-live="polite">
            <span><strong>${maxDays}</strong> días cosidos</span>
            <span><strong>¥${selectedBudget.toLocaleString()}</strong> estimados</span>
            <span>Una elección por día</span>
          </div>
        </header>

        <div class="jvh-content flex-1 overflow-y-auto">
          <div class="jvh-days">
            ${Array.from({length: maxDays}, (_, i) => {
              const dayNumber = i + 1;
              const selectedVariation = this.currentVariations[this.hybridSelection[i]];
              return `
                <section class="jvh-day" id="hybridDay${i}" aria-labelledby="hybridDayTitle${i}">
                  <div class="jvh-day__head">
                    <div class="jvh-day__number"><small>DÍA</small><strong>${String(dayNumber).padStart(2, '0')}</strong></div>
                    <div>
                      <h3 id="hybridDayTitle${i}">${selectedVariation.icon} ${selectedVariation.name}</h3>
                      <p>Esta página usará la propuesta seleccionada.</p>
                    </div>
                  </div>

                  <div class="jvh-options" role="radiogroup" aria-label="Ruta para el día ${dayNumber}">
                    ${this.currentVariations.map((v, vIndex) => {
                      const day = v.itinerary.days[i];
                      const isSelected = this.hybridSelection[i] === vIndex;

                      if (!day) {
                        return `<div class="jvh-option jvh-option--empty" aria-disabled="true"><span>${v.icon} ${v.name}</span><em>No incluye este día</em></div>`;
                      }

                      return `
                        <button type="button" role="radio" aria-checked="${isSelected}" class="jvh-option ${isSelected ? 'is-selected' : ''}"
                             onclick="window.SmartGeneratorWizard.selectDayVariation(${i}, ${vIndex})">
                          <span class="jvh-option__route"><b>${v.icon}</b>${v.name}</span>
                          <span class="jvh-option__mark">${isSelected ? '選' : ''}</span>
                          <span class="jvh-option__activities">
                            ${day.activities.slice(0, 3).map(act => `
                              <span><strong>${act.title || act.name || 'Actividad'}</strong><small>${this.translateCategory(act.category)} · ${Math.floor(act.duration / 60)}h ${act.duration % 60}m</small></span>
                            `).join('')}
                            ${day.activities.length > 3 ? `
                              <em>+${day.activities.length - 3} paradas más</em>
                            ` : ''}
                          </span>
                          <span class="jvh-option__stats"><span>¥${(day.budgetBreakdown?.total ?? day.budget ?? 0).toLocaleString()}</span><span>${day.activities.length} paradas</span></span>
                          <span class="jvh-option__action">${isSelected ? 'Página elegida' : 'Elegir esta página'} →</span>
                        </button>
                      `;
                    }).join('')}
                  </div>
                </section>
              `;
            }).join('')}
          </div>
        </div>

        <footer class="jvh-foot">
          <button
            onclick="window.SmartGeneratorWizard.showVariationsSelector(window.SmartGeneratorWizard.currentVariations)"
            class="jvh-cancel"
          >
            Cancelar
          </button>
          <button
            onclick="window.SmartGeneratorWizard.saveHybridItinerary()"
            class="jvh-save"
            ${this.isSavingHybrid ? 'disabled aria-busy="true"' : ''}
          >
            ${this.isSavingHybrid ? 'Cosiendo páginas…' : 'Guardar mi ruta combinada →'}
          </button>
        </footer>
      </div>
    `;
  },

  /**
   * Selecciona qué variación usar para un día específico
   */
  selectDayVariation(dayIndex, variationIndex) {
    if (!Array.isArray(this.hybridSelection) ||
        !this.currentVariations?.[variationIndex]?.itinerary.days[dayIndex]) return;
    this.hybridSelection[dayIndex] = variationIndex;
    this.showHybridBuilder();
    requestAnimationFrame(() => {
      const selected = document.querySelector(`#hybridDay${dayIndex} .jvh-option.is-selected`);
      document.getElementById(`hybridDay${dayIndex}`)?.scrollIntoView({block: 'center'});
      selected?.focus({preventScroll: true});
    });
  },

  /**
   * 💾 Guarda el itinerario híbrido creado por el usuario
   */
  async saveHybridItinerary() {
    if (this.isSavingHybrid) return;
    if (!this.currentVariations || !Array.isArray(this.hybridSelection)) {
      window.Notifications?.show('⚠️ No pudimos leer tu combinación. Inténtalo de nuevo.', 'error');
      return;
    }

    const hasInvalidDay = this.hybridSelection.some((variationIndex, dayIndex) =>
      !this.currentVariations[variationIndex]?.itinerary.days[dayIndex]
    );
    if (hasInvalidDay) {
      window.Notifications?.show('⚠️ Elige una propuesta disponible para cada día.', 'error');
      this.showHybridBuilder();
      return;
    }

    this.isSavingHybrid = true;

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
        <div class="jvh-loading">
          <div class="jvh-loading__paper" role="status" aria-live="polite">
            <div class="jvh-loading__stitch"><i></i><i></i><i></i></div>
            <span>製本中 · ENCUADERNANDO</span>
            <h3>Cosiendo tu ruta combinada…</h3>
            <p>Estamos uniendo cada página elegida en un solo cuaderno.</p>
          </div>
        </div>
      `;
    }

    try {
      // Guardar itinerario
      await this.saveGeneratedItinerary(hybridItinerary);

      // Nota: el contador 'hybridsCreated' se retiró — ver DEPRECATION_LOG.md.

      // 🗑️ Limpiar sessionStorage y datos temporales
      this.clearSessionStorage();
      this.isSavingHybrid = false;
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
      this.isSavingHybrid = false;
      this.showHybridBuilder();
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
      <article class="jvv-card border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition cursor-pointer overflow-hidden"
           onclick="window.SmartGeneratorWizard.selectVariation('${variation.id}', ${JSON.stringify(variation.itinerary).replace(/"/g, '&quot;')})">

        <!-- Header -->
        <div class="jvv-card__head bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-6 text-center">
          <span class="jvv-card__number">OPCIÓN ${String((this.currentVariations || []).findIndex(v => v.id === variation.id) + 1).padStart(2, '0')}</span>
          <div class="jvv-card__icon text-5xl mb-3">${variation.icon}</div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${variation.name}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">${variation.description}</p>
        </div>

        <!-- Tags -->
        <div class="jvv-tags px-6 py-4 flex flex-wrap gap-2 justify-center bg-white dark:bg-gray-800">
          ${variation.tags.map(tag => `
            <span class="jvv-tag px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
              ${tag}
            </span>
          `).join('')}
        </div>

        <!-- Actividades emblema: lo que REALMENTE distingue esta opción -->
        ${picks.length > 0 ? `
        <div class="jvv-highlights px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
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
        <div class="jvv-stats px-6 py-4 bg-gray-50 dark:bg-gray-900/50 space-y-2">
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
        <div class="jvv-action p-6 bg-white dark:bg-gray-800">
          <button class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg">
            Elegir este camino →
          </button>
        </div>
      </article>
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
      throw new Error('No hay un viaje activo donde guardar el itinerario.');
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

      // 🎏 Tracking de achievements
      if (window.Achievements) {
        await window.Achievements.trackAction('itinerariesGenerated', 1);
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
