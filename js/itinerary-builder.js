
// js/itinerary-builder.js — Calendario + ✨ AI Planner (v2)
// Novedades v2:
//  • Heurística multi‑ciudad por día: reparte actividades AI según categoría/estación
//  • Modal de “AI Travel Insights” post‑creación (summary/tips/transporte/presupuesto)
//  • Guarda aiInsights en Firestore junto al itinerario

import { db, auth } from './firebase-config.js';
import { Notifications } from './notifications.js';
import { CATEGORIES, TEMPLATES } from '../data/categories-data.js';
import { ACTIVITIES_DATABASE } from '../data/activities-database.js';
import { AIRLINES } from '../data/airlines-data.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const ItineraryBuilder = {
  // ===== Estado =====
  currentItinerary: null,
  shouldCreateTrip: false,
  currentStep: 1,

  // Planner por calendario
  cityAssignments: {},    // { [cityId]: Set('YYYY-MM-DD') }
  activeCity: null,

  // ✨ AI Planner
  aiPlan: null,           // { summary, tips, days, transportationTips, budgetSummary }
  aiApplyMode: {},        // { [dayNumber]: 'replace' | 'merge' }
  aiApplied: false,       // marcado cuando se presiona “Aplicar”
  multiCityHeuristic: true,

  init() {
    console.log('🎨 Itinerary Builder v2 listo');
    this.setupEventListeners();
  },

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      const btnConn = e.target.closest('[data-add-connection]');
      if (btnConn) this.addConnectionFlight(btnConn.getAttribute('data-add-connection'));

      if (e.target.id === 'wizardPrevBtn') this.previousWizardStep();
      if (e.target.id === 'wizardNextBtn') this.nextWizardStep();
      if (e.target.id === 'wizardFinishBtn') this.finishWizard();
      if (e.target.id === 'skipFlightsBtn') this.nextWizardStep();

      if (e.target.id === 'aiPlannerBtn') this.openAIPlannerModal();
      if (e.target.id === 'aiPlannerCloseBtn') this.closeAIPlannerModal();
      if (e.target.id === 'aiStartBtn') this.startAIGeneration();
      if (e.target.dataset?.aiApplyDay) this.toggleDayApplyMode(parseInt(e.target.dataset.aiApplyDay), e.target.dataset.mode);
      if (e.target.id === 'aiApplyAllMerge') this.applyAllMode('merge');
      if (e.target.id === 'aiApplyAllReplace') this.applyAllMode('replace');
      if (e.target.id === 'aiApplyBtn') this.applyAISelection();

      if (e.target.id === 'aiInsightsCloseBtn') this.closeAIInsightsModal();
    });
  },

  // ===== Wizard =====
  async showCreateItineraryWizard(createTripFlag = false) {
    this.shouldCreateTrip = createTripFlag;
    this.currentStep = 1;

    const airlinesOptions = AIRLINES.map(a => `<option value="${a.code || a.id || a.name}">${a.logo || ''} ${a.name}</option>`).join('');
    const categoriesCards = CATEGORIES.map(cat => `
      <label class="category-card block border rounded-lg p-3 cursor-pointer hover:shadow-sm transition">
        <input type="checkbox" class="category-checkbox hidden" name="categories" value="${cat.id}">
        <div class="flex items-start gap-3">
          <span class="text-xl">${cat.icon}</span>
          <div>
            <div class="font-semibold">${cat.name}</div>
            <div class="text-xs text-gray-500">${cat.description || ''}</div>
          </div>
        </div>
      </label>
    `).join('');

    const templateCards = `
      <label class="template-card block border rounded-lg p-3 cursor-pointer hover:shadow-sm transition">
        <input type="radio" class="template-radio hidden" name="template" value="blank" checked>
        <div class="flex items-start gap-3">
          <span class="text-xl">📝</span>
          <div>
            <div class="font-semibold">Desde Cero</div>
            <div class="text-xs text-gray-500">Crea tu itinerario personalizado desde el inicio</div>
          </div>
        </div>
      </label>
      ${TEMPLATES.map(t => `
        <label class="template-card block border rounded-lg p-3 cursor-pointer hover:shadow-sm transition">
          <input type="radio" class="template-radio hidden" name="template" value="${t.id}">
          <div class="flex items-start gap-3">
            <span class="text-xl">${t.icon}</span>
            <div>
              <div class="font-semibold">${t.name}</div>
              <div class="text-xs text-gray-500 mb-1">${t.description || ''}</div>
              <div class="text-[11px] opacity-75">Ritmo: ${t.pace === 'relaxed' ? '🐢 Relajado' : t.pace === 'moderate' ? '🚶 Moderado' : '🏃 Intenso'}</div>
            </div>
          </div>
        </label>
      `).join('')}
    `;

    const modalHtml = `
      <div id="createItineraryWizard" class="modal active" style="z-index:9999;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full p-0 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-600 to-pink-500 text-white">
            <h3 class="text-xl font-bold">✈️ Crear Nuevo Itinerario</h3>
            <button id="closeCreateItineraryWizard" class="modal-close text-white" onclick="document.getElementById('createItineraryWizard')?.remove(); document.body.style.overflow='';">×</button>
          </div>

          <!-- Steps -->
          <div class="px-6 pt-4">
            <ol class="grid grid-cols-5 gap-2 text-xs">
              ${[1,2,3,4,5].map(n => `
                <li class="wizard-step flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center bg-gray-300 text-gray-800 font-bold">${n}</div>
                  <span class="hidden sm:inline">${['Básico','Ciudades','Vuelos','Intereses','Plantilla'][n-1]}</span>
                </li>
              `).join('')}
            </ol>
          </div>

          <div class="p-6 space-y-6">
            <!-- Paso 1 -->
            <section id="wizardStep1" class="wizard-content">
              <h4 class="text-lg font-semibold mb-3">📋 Información Básica</h4>
              <div class="grid md:grid-cols-3 gap-4">
                <div>
                  <label class="text-sm block mb-1">Nombre del Viaje *</label>
                  <input id="itineraryName" type="text" class="w-full rounded-md p-2 border" placeholder="Ej. Japón Otoño 2025" />
                </div>
                <div>
                  <label class="text-sm block mb-1">Fecha Inicio *</label>
                  <input id="itineraryStartDate" type="date" class="w-full rounded-md p-2 border" />
                </div>
                <div>
                  <label class="text-sm block mb-1">Fecha Fin *</label>
                  <input id="itineraryEndDate" type="date" class="w-full rounded-md p-2 border" />
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">💡 Siguiente paso: Seleccionarás ciudades y marcarás días (sin horas).</p>
            </section>

            <!-- Paso 2: Calendario -->
            <section id="wizardStep2" class="wizard-content hidden">
              <h4 class="text-lg font-semibold mb-2">🗺️ Itinerario por calendario</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Elige ciudades y márcalas en el calendario. Puedes asignar varias el mismo día.</p>
              <div id="citySelectChips" class="mb-4"></div>
              <div id="cityCalendarGrid"></div>
            </section>

            <!-- Paso 3: Vuelos (opcional) -->
            <section id="wizardStep3" class="wizard-content hidden">
              <h4 class="text-lg font-semibold mb-3">🛫 Información de Vuelos (opcional)</h4>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 class="font-semibold mb-2">Vuelo de Ida</h5>
                  <div class="space-y-2">
                    <select id="outboundAirline" class="w-full rounded-md p-2 border">
                      <option value="">Aerolínea</option>${airlinesOptions}
                    </select>
                    <input id="outboundFlightNumber" class="w-full rounded-md p-2 border" placeholder="Número de vuelo" />
                    <input id="outboundOrigin" class="w-full rounded-md p-2 border" placeholder="Origen" />
                    <input id="outboundDestination" class="w-full rounded-md p-2 border" placeholder="Destino" />
                    <input id="outboundDateTime" type="datetime-local" class="w-full rounded-md p-2 border" />
                    <div id="outboundConnections" class="space-y-2"></div>
                    <button type="button" data-add-connection="outbound" class="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm">+ Agregar Conexión</button>
                  </div>
                </div>
                <div>
                  <h5 class="font-semibold mb-2">Vuelo de Regreso</h5>
                  <div class="space-y-2">
                    <select id="returnAirline" class="w-full rounded-md p-2 border">
                      <option value="">Aerolínea</option>${airlinesOptions}
                    </select>
                    <input id="returnFlightNumber" class="w-full rounded-md p-2 border" placeholder="Número de vuelo" />
                    <input id="returnOrigin" class="w-full rounded-md p-2 border" placeholder="Origen" />
                    <input id="returnDestination" class="w-full rounded-md p-2 border" placeholder="Destino" />
                    <input id="returnDateTime" type="datetime-local" class="w-full rounded-md p-2 border" />
                    <div id="returnConnections" class="space-y-2"></div>
                    <button type="button" data-add-connection="return" class="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm">+ Agregar Conexión</button>
                  </div>
                </div>
              </div>
            </section>

            <!-- Paso 4: Intereses -->
            <section id="wizardStep4" class="wizard-content hidden">
              <h4 class="text-lg font-semibold mb-3">🎯 ¿Qué te interesa hacer?</h4>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">${categoriesCards}</div>
            </section>

            <!-- Paso 5: Plantilla + AI -->
            <section id="wizardStep5" class="wizard-content hidden">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-lg font-semibold">📎 Elige una Plantilla (opcional)</h4>
                <button id="aiPlannerBtn" class="px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm flex items-center gap-2" title="Generar con AI">✨ Planificar con AI</button>
              </div>
              <div class="grid md:grid-cols-2 gap-3">${templateCards}</div>
              <div class="mt-3 text-xs text-gray-500 flex items-center gap-2">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input id="toggleMultiCityHeuristic" type="checkbox" checked>
                  Repartir actividades AI según ciudad del día (heurística multi‑ciudad)
                </label>
              </div>
            </section>
          </div>

          <div class="px-6 pb-6 flex items-center justify-between gap-2">
            <button id="wizardPrevBtn" class="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded">← Anterior</button>
            <div class="flex items-center gap-2">
              <button id="skipFlightsBtn" class="hidden bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded">Omitir vuelos</button>
              <button id="wizardNextBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Siguiente →</button>
              <button id="wizardFinishBtn" class="hidden bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">✨ Crear Itinerario</button>
            </div>
          </div>
        </div>
      </div>`;

    const existing = document.getElementById('createItineraryWizard');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';

    this.setupCategorySelection();
    this.setupTemplateSelection();
    this.updateWizardView();

    // toggle heuristic
    const chk = document.getElementById('toggleMultiCityHeuristic');
    if (chk) chk.addEventListener('change', (e) => { this.multiCityHeuristic = !!e.target.checked; });
  },

  setupCategorySelection() {
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', function() {
        const checkbox = this.querySelector('.category-checkbox');
        checkbox.checked = !checkbox.checked;
        this.classList.toggle('ring-2');
        this.classList.toggle('ring-purple-500');
        this.classList.toggle('bg-purple-50');
      });
    });
  },

  setupTemplateSelection() {
    document.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', function() {
        document.querySelectorAll('.template-card').forEach(c => {
          c.classList.remove('ring-2','ring-blue-500','bg-blue-50');
          const r = c.querySelector('.template-radio');
          if (r) r.checked = false;
        });
        const radio = this.querySelector('.template-radio');
        if (radio) radio.checked = true;
        this.classList.add('ring-2','ring-blue-500','bg-blue-50');
      });
    });
  },

  addConnectionFlight(type) {
    const container = document.getElementById(`${type}Connections`);
    const id = `${type}-connection-${Date.now()}`;
    const options = AIRLINES.map(a => `<option value="${a.code || a.id || a.name}">${a.name}</option>`).join('');
    const html = `
      <div class="bg-gray-100 dark:bg-gray-700 rounded p-2" id="${id}">
        <div class="flex items-center justify-between mb-2 text-sm font-semibold">Conexión
          <button type="button" class="px-2 py-1 text-red-600" onclick="document.getElementById('${id}').remove()">× Eliminar</button>
        </div>
        <div class="grid md:grid-cols-5 gap-2">
          <select class="connection-airline rounded p-2 border">
            <option value="">Aerolínea</option>${options}
          </select>
          <input class="connection-flight-number rounded p-2 border" placeholder="Nº Vuelo" />
          <input class="connection-origin rounded p-2 border" placeholder="Origen" />
          <input class="connection-destination rounded p-2 border" placeholder="Destino" />
          <input type="datetime-local" class="connection-datetime rounded p-2 border" />
        </div>
      </div>`;
    container.insertAdjacentHTML('beforeend', html);
  },

  // ===== Calendario =====
  dateToISO(d) { return new Date(d).toISOString().split('T')[0]; },

  renderCitySelectionUI() {
    const container = document.getElementById('citySelectChips');
    if (!container) return;

    const allCities = Object.keys(ACTIVITIES_DATABASE).map(id => ({ id, name: ACTIVITIES_DATABASE[id].city }));

    container.innerHTML = `
      <div class="mb-2 text-sm text-gray-600 dark:text-gray-400">Selecciona una ciudad y luego márcala en el calendario ↓</div>
      <div class="flex flex-wrap gap-2" id="cityChips">
        ${allCities.map(c => `
          <button type="button" class="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm" data-city-id="${c.id}">${c.name}</button>
        `).join('')}
      </div>`;

    this.cityAssignments ||= {};

    container.querySelectorAll('#cityChips button').forEach(btn => {
      btn.addEventListener('click', () => {
        const cityId = btn.dataset.cityId;
        container.querySelectorAll('#cityChips button').forEach(b => b.classList.remove('ring-2','ring-blue-500'));
        btn.classList.add('ring-2','ring-blue-500');
        this.activeCity = cityId;
        if (!this.cityAssignments[cityId]) this.cityAssignments[cityId] = new Set();
        const hint = document.getElementById('calendarHint');
        if (hint) hint.textContent = `Ciudad activa: ${ACTIVITIES_DATABASE[cityId].city} — haz clic en días`;
      });
    });
  },

  renderCityCalendarUI() {
    const start = document.getElementById('itineraryStartDate')?.value;
    const end   = document.getElementById('itineraryEndDate')?.value;
    const grid  = document.getElementById('cityCalendarGrid');
    if (!start || !end || !grid) return;

    const days = [];
    let cur = new Date(start);
    const endDate = new Date(end);
    while (cur <= endDate) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }

    grid.innerHTML = `
      <div id="calendarHint" class="mb-2 text-xs text-gray-500 dark:text-gray-400">Selecciona una ciudad y marca los días</div>
      <div class="calendar-grid">
        ${days.map(d => {
          const iso = this.dateToISO(d);
          const dow = d.toLocaleDateString('es-ES', { weekday:'short' });
          const dm  = d.toLocaleDateString('es-ES', { day:'numeric', month:'short' });
          return `
            <button type="button" class="day-cell bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-left p-2" data-date="${iso}">
              <div class="text-[10px] uppercase text-gray-500 dark:text-gray-400">${dow}</div>
              <div class="text-sm font-semibold">${dm}</div>
              <div class="mt-1 flex flex-wrap gap-1 assignments" aria-live="polite"></div>
            </button>`;
        }).join('')}
      </div>`;

    grid.querySelectorAll('.day-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        if (!this.activeCity) { Notifications.info('Selecciona primero una ciudad'); return; }
        const dateStr = cell.dataset.date;
        const set = (this.cityAssignments[this.activeCity] ||= new Set());
        if (set.has(dateStr)) set.delete(dateStr); else set.add(dateStr);
        this.refreshCalendarBadges();
      });
    });

    this.refreshCalendarBadges();
  },

  refreshCalendarBadges() {
    const grid = document.getElementById('cityCalendarGrid');
    if (!grid) return;
    grid.querySelectorAll('.day-cell .assignments').forEach(a => a.innerHTML = '');
    Object.entries(this.cityAssignments || {}).forEach(([cityId, set]) => {
      const cityName = ACTIVITIES_DATABASE[cityId]?.city || cityId;
      const initials = cityName.split(/\s+/).map(s => s[0]).join('').slice(0,3).toUpperCase();
      set.forEach(dateStr => {
        const cell = grid.querySelector(`.day-cell[data-date="${dateStr}"] .assignments`);
        if (!cell) return;
        cell.insertAdjacentHTML('beforeend', `<span class="city-badge" title="${cityName}">${initials}</span>`);
      });
    });
  },

  initCityCalendarPlanner() { this.renderCitySelectionUI(); this.renderCityCalendarUI(); },

  // ===== Navegación =====
  nextWizardStep() {
    if (!this.validateCurrentStep()) return;
    if (this.currentStep < 5) {
      this.currentStep++;
      if (this.currentStep === 2) this.initCityCalendarPlanner();
      this.updateWizardView();
    }
  },
  previousWizardStep() { if (this.currentStep > 1) { this.currentStep--; this.updateWizardView(); } },

  validateCurrentStep() {
    if (this.currentStep === 1) {
      const name = document.getElementById('itineraryName').value;
      const start = document.getElementById('itineraryStartDate').value;
      const end = document.getElementById('itineraryEndDate').value;
      if (!name || !start || !end) { Notifications.warning('Completa nombre y fechas'); return false; }
      if (new Date(end) <= new Date(start)) { Notifications.warning('La fecha fin debe ser posterior a inicio'); return false; }
    }
    if (this.currentStep === 2) {
      const start = document.getElementById('itineraryStartDate').value;
      const end = document.getElementById('itineraryEndDate').value;
      const s = new Date(start), e = new Date(end);
      const totalDays = Math.ceil((e - s) / (1000*60*60*24)) + 1;
      const unassigned = [];
      for (let i = 0; i < totalDays; i++) {
        const dateStr = this.dateToISO(new Date(s.getTime() + i*86400000));
        const hasCity = Object.values(this.cityAssignments || {}).some(set => set && set.has(dateStr));
        if (!hasCity) unassigned.push(i+1);
      }
      if (unassigned.length > 0) { Notifications.warning(`Agrega al menos una ciudad para los días: ${unassigned.join(', ')}`); return false; }
    }
    return true;
  },

  updateWizardView() {
    document.querySelectorAll('.wizard-content').forEach(c => c.classList.add('hidden'));
    const sec = document.getElementById(`wizardStep${this.currentStep}`);
    if (sec) sec.classList.remove('hidden');

    document.querySelectorAll('.wizard-step').forEach((el, idx) => {
      const num = idx + 1; const circle = el.querySelector('div');
      if (num < this.currentStep) { circle.className = 'w-6 h-6 rounded-full flex items-center justify-center bg-green-500 text-white font-bold'; circle.textContent = '✓'; }
      else if (num === this.currentStep) { circle.className = 'w-6 h-6 rounded-full flex items-center justify-center bg-purple-500 text-white font-bold'; circle.textContent = num; }
      else { circle.className = 'w-6 h-6 rounded-full flex items-center justify-center bg-gray-300 text-gray-800 font-bold'; circle.textContent = num; }
    });

    const prevBtn = document.getElementById('wizardPrevBtn');
    const nextBtn = document.getElementById('wizardNextBtn');
    const finishBtn = document.getElementById('wizardFinishBtn');
    const skipFlightsBtn = document.getElementById('skipFlightsBtn');

    if (this.currentStep === 1) prevBtn.classList.add('hidden'); else prevBtn.classList.remove('hidden');
    if (this.currentStep === 5) { nextBtn.classList.add('hidden'); finishBtn.classList.remove('hidden'); } else { nextBtn.classList.remove('hidden'); finishBtn.classList.add('hidden'); }
    if (skipFlightsBtn) (this.currentStep === 3 ? skipFlightsBtn.classList.remove('hidden') : skipFlightsBtn.classList.add('hidden'));
  },

  // ===== Finalizar =====
  async finishWizard() {
    const data = {
      name: document.getElementById('itineraryName').value,
      startDate: document.getElementById('itineraryStartDate').value,
      endDate: document.getElementById('itineraryEndDate').value,
      cityDayAssignments: this.getCityDayAssignments(),
      categories: Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(cb => cb.value),
      template: document.querySelector('input[name="template"]:checked')?.value || 'blank',
      outboundFlight: {
        airline: document.getElementById('outboundAirline')?.value || '',
        flightNumber: document.getElementById('outboundFlightNumber')?.value || '',
        origin: document.getElementById('outboundOrigin')?.value || '',
        destination: document.getElementById('outboundDestination')?.value || '',
        datetime: document.getElementById('outboundDateTime')?.value || '',
        connections: this.getConnectionFlights('outbound')
      },
      returnFlight: {
        airline: document.getElementById('returnAirline')?.value || '',
        flightNumber: document.getElementById('returnFlightNumber')?.value || '',
        origin: document.getElementById('returnOrigin')?.value || '',
        destination: document.getElementById('returnDestination')?.value || '',
        datetime: document.getElementById('returnDateTime')?.value || '',
        connections: this.getConnectionFlights('return')
      }
    };

    if (this.shouldCreateTrip) {
      if (!window.TripsManager) { Notifications.error('TripsManager no está disponible'); return; }
      try {
        const tripData = { name: data.name, destination: 'Japón', dateStart: data.startDate, dateEnd: data.endDate, useTemplate: true };
        const tripId = await window.TripsManager.createTrip(tripData);
        if (!tripId) throw new Error('createTrip no devolvió tripId');
        await new Promise(r => setTimeout(r, 800));
      } catch (err) {
        console.error('Error creando trip desde wizard:', err);
        Notifications.error('Error al crear el viaje. Inténtalo de nuevo.');
        return;
      }
    }

    // Actividades por AI si corresponde
    let activities = [];
    if (this.aiApplied && this.aiPlan?.days?.length > 0) {
      activities = this.convertAIRecommendationsToActivities(this.aiPlan, data.cityDayAssignments);
      data.template = 'ai';
    }

    await this.createItinerary({ ...data, __aiActivities: activities });
    this.closeCreateItineraryWizard();

    // Mostrar insights si hubo AI
    if (this.aiApplied && this.aiPlan) this.showAIInsightsModal(this.aiPlan);
  },

  getCityDayAssignments() {
    const startDate = document.getElementById('itineraryStartDate').value;
    const endDate   = document.getElementById('itineraryEndDate').value;
    const start = new Date(startDate); const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000*60*60*24)) + 1;

    const hasCalendarData = this.cityAssignments && Object.values(this.cityAssignments).some(s => s && s.size > 0);
    if (hasCalendarData) {
      const result = [];
      for (let d = 0; d < totalDays; d++) {
        const dateStr = this.dateToISO(new Date(start.getTime() + d*86400000));
        const citiesForDay = [];
        Object.keys(this.cityAssignments).forEach(cityId => {
          if (this.cityAssignments[cityId].has(dateStr)) {
            const cityName = ACTIVITIES_DATABASE[cityId]?.city || cityId;
            citiesForDay.push({ cityId, cityName, timeStart: null, timeEnd: null, order: citiesForDay.length + 1, isFullDay: true });
          }
        });
        if (citiesForDay.length > 0) {
          result.push({ day: d + 1, date: dateStr, cities: citiesForDay, cityCount: citiesForDay.length, isMultiCity: citiesForDay.length > 1 });
        }
      }
      return result;
    }
    return [];
  },

  getConnectionFlights(type) {
    const container = document.getElementById(`${type}Connections`); const connections = [];
    if (!container) return connections;
    container.querySelectorAll('.bg-gray-100, .dark:bg-gray-700').forEach(connDiv => {
      connections.push({
        airline: connDiv.querySelector('.connection-airline')?.value || '',
        flightNumber: connDiv.querySelector('.connection-flight-number')?.value || '',
        origin: connDiv.querySelector('.connection-origin')?.value || '',
        destination: connDiv.querySelector('.connection-destination')?.value || '',
        datetime: connDiv.querySelector('.connection-datetime')?.value || ''
      });
    });
    return connections;
  },

  // ===== Persistencia =====
  async createItinerary(data) {
    if (!auth.currentUser) { Notifications.warning('Debes iniciar sesión'); return; }
    if (!window.TripsManager || !window.TripsManager.currentTrip) { Notifications.warning('Primero crea o selecciona un viaje'); return; }

    try {
      const tripId = window.TripsManager.currentTrip.id;
      const days = this.generateDays(data.startDate, data.endDate);

      // Actividades (AI o plantilla)
      let activities = Array.isArray(data.__aiActivities) ? data.__aiActivities : [];
      if ((!activities || activities.length === 0) && data.template !== 'blank') {
        activities = await this.generateActivitiesFromTemplate(data.template, data.cityDayAssignments, data.categories, days.length);
      }

      // Integrar actividades por día
      const daysWithActivities = days.map(day => {
        const dayActivities = activities.filter(a => a.day === day.day);
        const dayAssignment = data.cityDayAssignments.find(a => a.day === day.day);
        let dayTitle = 'Día libre', dayLocation = '';
        if (dayAssignment && dayAssignment.cities) {
          if (dayAssignment.isMultiCity) { dayTitle = `Visitando ${dayAssignment.cities.map(c => c.cityName).join(' y ')}`; dayLocation = dayAssignment.cities.map(c => c.cityName).join(' → '); }
          else { const city = dayAssignment.cities[0]; dayTitle = `Explorando ${city.cityName}`; dayLocation = city.cityName; }
        }
        return { ...day, title: dayTitle, location: dayLocation, cities: dayAssignment?.cities || [], isMultiCity: dayAssignment?.isMultiCity || false, activities: dayActivities };
      });

      const citySet = new Set();
      data.cityDayAssignments.forEach(d => d.cities.forEach(c => citySet.add(c.cityId)));
      const cityList = Array.from(citySet);

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
        flights: { outbound: data.outboundFlight, return: data.returnFlight },
        aiInsights: this.aiApplied && this.aiPlan ? {
          summary: this.aiPlan.summary || '',
          tips: this.aiPlan.tips || [],
          transportationTips: this.aiPlan.transportationTips || '',
          budgetSummary: this.aiPlan.budgetSummary || '',
          generatedAt: new Date().toISOString()
        } : null,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.email
      });

      Notifications.success(`✨ Itinerario "${data.name}" creado exitosamente`);
      if (window.ItineraryHandler && window.ItineraryHandler.reinitialize) window.ItineraryHandler.reinitialize();
    } catch (error) {
      console.error('❌ Error creando itinerario:', error);
      Notifications.error('Error al crear itinerario. Inténtalo de nuevo.');
    }
  },

  generateDays(startDate, endDate) {
    const days = []; const start = new Date(startDate); const end = new Date(endDate);
    let cur = new Date(start); let num = 1;
    while (cur <= end) { days.push({ day: num, date: cur.toISOString().split('T')[0], activities: [] }); cur.setDate(cur.getDate() + 1); num++; }
    return days;
  },

  // === Fallback por plantilla ===
  async generateActivitiesFromTemplate(templateId, cityDayAssignments, selectedCategories, totalDays) {
    const template = TEMPLATES.find(t => t.id === templateId); if (!template) return [];
    const paceMap = { relaxed: { min:2, max:3 }, moderate: { min:3, max:4 }, intense: { min:4, max:6 } };
    const apd = paceMap[template.pace] || paceMap.moderate;
    const allCats = [...new Set([...(template.categories||[]), ...selectedCategories])];

    const out = []; let idc = 1;
    cityDayAssignments.forEach(assign => {
      const dayNum = assign.day; const cities = assign.cities; const citiesCount = cities.length;
      let activitiesPerCity;
      if (citiesCount === 1 && cities[0].isFullDay) activitiesPerCity = apd.min + Math.floor(Math.random()*(apd.max-apd.min+1));
      else if (citiesCount === 1) activitiesPerCity = Math.max(1, Math.floor(apd.min/1.5));
      else { const total = apd.min + Math.floor(Math.random()*(apd.max-apd.min+1)); activitiesPerCity = Math.max(1, Math.floor(total / citiesCount)); }

      cities.forEach((visit, cIdx) => {
        const cityData = ACTIVITIES_DATABASE[visit.cityId]; if (!cityData || !cityData.activities) return;
        let pool = cityData.activities.filter(a => allCats.includes(a.category)); if (pool.length === 0) pool = cityData.activities;
        pool = [...pool].sort(() => Math.random() - 0.5);
        const count = Math.min(activitiesPerCity, pool.length);
        for (let i=0; i<count; i++) {
          const base = pool[i];
          out.push({ id: `activity-${idc++}`, day: dayNum, city: visit.cityId, cityName: visit.cityName, title: base.title || base.name || 'Actividad', name: base.name || base.title || 'Actividad', desc: base.description || base.desc || '', description: base.description || base.desc || '', time: visit.isFullDay ? `${9 + i*2}:00` : (base.time || `${9 + i*2}:00`), duration: base.duration || '1-2 hours', cost: base.cost || 0, category: base.category, order: (cIdx*10)+i+1, isGenerated: true });
        }
      });
    });

    out.sort((a,b) => a.day !== b.day ? a.day - b.day : a.order - b.order);
    return out;
  },

  // ===== ✨ AI Planner =====
  openAIPlannerModal() {
    const existing = document.getElementById('aiPlannerModal'); if (existing) existing.remove();
    const selectedCats = Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(cb => cb.value);

    const modal = `
      <div id="aiPlannerModal" class="modal active" style="z-index:10001;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold dark:text-white">✨ AI Planner</h3>
            <button id="aiPlannerCloseBtn" class="modal-close">×</button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-1 dark:text-gray-100">Ritmo</label>
              <div class="flex gap-3 text-sm">
                <label class="flex items-center gap-2"><input type="radio" name="aiPace" value="relaxed"> 🐢 Relajado</label>
                <label class="flex items-center gap-2"><input type="radio" name="aiPace" value="moderate" checked> 🚶 Moderado</label>
                <label class="flex items-center gap-2"><input type="radio" name="aiPace" value="intense"> 🏃 Intenso</label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1 dark:text-gray-100">Intereses</label>
              <div class="grid grid-cols-2 gap-2 max-h-44 overflow-auto">
                ${CATEGORIES.map(cat => `
                  <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="aiInterests" value="${cat.id}" ${selectedCats.includes(cat.id)?'checked':''}>
                    <span>${cat.icon} ${cat.name}</span>
                  </label>`).join('')}
              </div>
            </div>

            <details class="bg-gray-50 dark:bg-gray-700/40 rounded p-3">
              <summary class="cursor-pointer text-sm font-semibold dark:text-gray-100">⚙️ Ajustes de AI</summary>
              <div class="mt-2 grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <label class="block mb-1">OpenAI API Key</label>
                  <input id="aiApiKeyInput" type="password" class="w-full rounded-md p-2 border" placeholder="sk-..." value="${localStorage.getItem('openai_api_key')||''}" />
                  <p class="text-xs text-gray-500 mt-1">Se guarda localmente en este navegador.</p>
                </div>
                <div>
                  <label class="block mb-1">Preferencias</label>
                  <label class="flex items-center gap-2 mb-1"><input id="aiIncludeHiddenGems" type="checkbox" checked> Incluir joyas ocultas</label>
                  <label class="flex items-center gap-2 mb-1"><input id="aiIncludeFood" type="checkbox" checked> Sugerir comida</label>
                  <label class="flex items-center gap-2"><input id="aiOptimizeTransit" type="checkbox" checked> Optimizar desplazamientos</label>
                </div>
              </div>
            </details>

            <div id="aiPlannerStatus" class="hidden text-sm"></div>
            <div id="aiPlannerPreview" class="hidden"></div>
          </div>

          <div class="mt-6 flex items-center justify-between">
            <button id="aiStartBtn" class="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white">Generar con AI</button>
            <div class="flex items-center gap-2">
              <button id="aiApplyAllMerge" class="hidden px-3 py-2 rounded bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300 text-sm">Añadir a todos</button>
              <button id="aiApplyAllReplace" class="hidden px-3 py-2 rounded bg-red-50 dark:bg-gray-700 text-red-700 dark:text-red-300 text-sm">Reemplazar todos</button>
              <button id="aiApplyBtn" class="hidden px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white">Aplicar</button>
            </div>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', modal);
    document.body.style.overflow = 'hidden';
  },

  closeAIPlannerModal() { const m = document.getElementById('aiPlannerModal'); if (m) { m.remove(); document.body.style.overflow=''; } },

  async startAIGeneration() {
    const keyInput = document.getElementById('aiApiKeyInput'); const apiKey = keyInput?.value?.trim(); if (apiKey) localStorage.setItem('openai_api_key', apiKey);
    const savedKey = localStorage.getItem('openai_api_key'); if (!savedKey) { Notifications.warning('Ingresa tu OpenAI API Key'); return; }

    const pace = (document.querySelector('input[name="aiPace"]:checked')?.value) || 'moderate';
    const interests = Array.from(document.querySelectorAll('input[name="aiInterests"]:checked')).map(i => i.value);

    const assignments = this.getCityDayAssignments(); if (!assignments || assignments.length === 0) { Notifications.warning('Asigna ciudades en el Paso 2'); return; }
    const uniqueCities = [...new Set(assignments.flatMap(d => d.cities.map(c => c.cityId)))];
    const totalDays = assignments.length;

    const status = document.getElementById('aiPlannerStatus'); status.classList.remove('hidden'); status.innerHTML = `<div class="text-sm text-gray-600 dark:text-gray-300">🧠 Preparando prompt…</div>`;

    try {
      if (!window.AIIntegration || !window.AIIntegration.generateItineraryRecommendations) { Notifications.error('AIIntegration no está disponible'); return; }
      status.innerHTML = `<div class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-300">⏳ Generando recomendaciones…</div>`;

      const userPreferences = {
        budgetLevel: 'moderate',
        includeHiddenGems: document.getElementById('aiIncludeHiddenGems')?.checked || false,
        includeFood: document.getElementById('aiIncludeFood')?.checked || false,
        optimizeTransit: document.getElementById('aiOptimizeTransit')?.checked || false
      };

      const result = await window.AIIntegration.generateItineraryRecommendations({ cities: uniqueCities, interests, days: totalDays, travelStyle: pace, existingActivities: [], userPreferences });
      if (!result.success || !result.recommendations) { Notifications.error('No se pudieron generar recomendaciones AI.'); status.innerHTML = `<div class="text-sm text-red-600">❌ Error generando recomendaciones.</div>`; return; }

      this.aiPlan = result.recommendations;
      this.renderAIPreview(assignments);
    } catch (err) {
      console.error('AI Planner error:', err);
      Notifications.error('Error con el AI Planner. Revisa tu API key.');
      const st = document.getElementById('aiPlannerStatus'); st.innerHTML = `<div class="text-sm text-red-600">❌ ${String(err?.message||err)}</div>`;
    }
  },

  renderAIPreview(assignments) {
    const preview = document.getElementById('aiPlannerPreview'); const status = document.getElementById('aiPlannerStatus'); if (!preview) return;
    status.innerHTML = `<div class="text-sm text-green-600 dark:text-green-400">✅ Recomendaciones listas. Revisa y elige cómo aplicarlas.</div>`;

    const daysHtml = (this.aiPlan?.days||[]).map((d, idx) => {
      const dayNum = idx + 1; const assign = assignments.find(a => a.day === dayNum); const cities = assign?.cities?.map(c => c.cityName).join(' → ') || '';
      const acts = (d.activities||[]).map(a => `
        <li class="text-sm p-2 rounded border dark:border-gray-700">
          <div class="font-semibold">${a.time||''} ${a.title||'Actividad'}</div>
          <div class="text-xs opacity-70">${a.desc||''}</div>
          <div class="text-[11px] opacity-60">${a.location||''} ${a.station? '· 🚉 '+a.station:''} ${a.cost? '· ¥'+a.cost:''}</div>
        </li>`).join('');
      const mode = this.aiApplyMode[dayNum] || 'merge';
      return `
        <div class="rounded-lg border p-3 mb-3 dark:border-gray-700">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm font-semibold">Día ${dayNum} ${cities?`· <span class='opacity-70'>${cities}</span>`:''}</div>
            <div class="flex items-center gap-2 text-xs">
              <button data-ai-apply-day="${dayNum}" data-mode="merge" class="px-2 py-1 rounded ${mode==='merge'?'bg-blue-600 text-white':'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-blue-300'}">Añadir</button>
              <button data-ai-apply-day="${dayNum}" data-mode="replace" class="px-2 py-1 rounded ${mode==='replace'?'bg-red-600 text-white':'bg-red-50 text-red-700 dark:bg-gray-700 dark:text-red-300'}">Reemplazar</button>
            </div>
          </div>
          <ul class="space-y-2">${acts}</ul>
        </div>`;
    }).join('');

    const tips = (this.aiPlan?.tips||[]).map(t => `<li>• ${t}</li>`).join('');
    preview.classList.remove('hidden');
    preview.innerHTML = `
      <div class="mb-3 p-3 rounded bg-purple-50 dark:bg-purple-900/20 text-sm">
        <div class="font-semibold mb-1">Resumen</div>
        <div>${this.aiPlan?.summary || 'Itinerario generado por AI'}</div>
        ${tips?`<ul class="mt-2">${tips}</ul>`:''}
      </div>
      ${daysHtml}`;

    document.getElementById('aiApplyAllMerge')?.classList.remove('hidden');
    document.getElementById('aiApplyAllReplace')?.classList.remove('hidden');
    document.getElementById('aiApplyBtn')?.classList.remove('hidden');
  },

  toggleDayApplyMode(dayNumber, mode) { this.aiApplyMode[dayNumber] = mode === 'replace' ? 'replace' : 'merge'; const assignments = this.getCityDayAssignments(); this.renderAIPreview(assignments); },
  applyAllMode(mode) { const assignments = this.getCityDayAssignments(); const totalDays = assignments.length; for (let d=1; d<=totalDays; d++) this.aiApplyMode[d] = mode; this.renderAIPreview(assignments); },
  applyAISelection() { this.aiApplied = true; Notifications.success('Se aplicará el plan de AI al crear el itinerario.'); this.closeAIPlannerModal(); },

  // ===== Heurística multi‑ciudad =====
  pickCityForActivity(dayCities, activity) {
    // dayCities: [{cityId, cityName,...}]
    if (!dayCities || dayCities.length === 0) return null;
    if (!this.multiCityHeuristic || dayCities.length === 1) return dayCities[0].cityId;

    const cat = (activity.category||'').toLowerCase();
    const station = (activity.station||'').toLowerCase();
    const location = (activity.location||'').toLowerCase();

    const nameIncludes = (cityName, ...keys) => keys.some(k => cityName.toLowerCase().includes(k));
    const anyTextHas = (...keys) => keys.some(k => station.includes(k) || location.includes(k) || (activity.title||'').toLowerCase().includes(k) || (activity.desc||'').toLowerCase().includes(k));

    // Preferencias por categoría
    const preferKyoto = /temple|shrine|zen|garden|bamboo|culture|history|heritage|nature/.test(cat);
    const preferOsaka = /food|nightlife|street|dotonbori|aquarium|entertainment/.test(cat);
    const preferTokyo = /shopping|tech|electronics|anime|view|skytree|observatory|museum|city/.test(cat);

    // Intento por estación/lugar
    const stationToCity = [
      { keys:['shinjuku','shibuya','ueno','asakusa','akihabara','ginza','harajuku','odaiba','tokyo','skytree'], city:'tokyo' },
      { keys:['gion','fushimi','arashiyama','kiyomizu','nijo','kinkaku','kyoto'], city:'kyoto' },
      { keys:['namba','dotonbori','umeda','shin-osaka','osaka'], city:'osaka' },
      { keys:['nara','todaiji','kasuga'], city:'nara' },
      { keys:['hiroshima','miyajima'], city:'hiroshima' }
    ];

    const cityIdByName = (needle) => {
      const found = dayCities.find(c => c.cityName && c.cityName.toLowerCase().includes(needle));
      return found?.cityId || null;
    };

    for (const map of stationToCity) {
      if (anyTextHas(...map.keys)) { const cid = cityIdByName(map.city); if (cid) return cid; }
    }

    if (preferKyoto) { const cid = cityIdByName('kyoto') || cityIdByName('nara') || cityIdByName('arashiyama'); if (cid) return cid; }
    if (preferOsaka) { const cid = cityIdByName('osaka') || cityIdByName('namba') || cityIdByName('dotonbori'); if (cid) return cid; }
    if (preferTokyo) { const cid = cityIdByName('tokyo') || cityIdByName('asakusa') || cityIdByName('shinjuku') || cityIdByName('shibuya'); if (cid) return cid; }

    // Fallback: primera ciudad del día
    return dayCities[0].cityId;
  },

  convertAIRecommendationsToActivities(aiPlan, cityDayAssignments) {
    const acts = []; let seq = 1;

    (aiPlan?.days||[]).forEach((d, idx) => {
      const day = idx + 1;
      const dayCities = cityDayAssignments.find(x => x.day === day)?.cities || [];
      const mode = this.aiApplyMode[day] || 'merge';

      (d.activities||[]).forEach((a, i) => {
        const chosenCityId = this.pickCityForActivity(dayCities, a) || dayCities[0]?.cityId;
        const cityName = chosenCityId ? (ACTIVITIES_DATABASE[chosenCityId]?.city || (dayCities.find(c=>c.cityId===chosenCityId)?.cityName) || chosenCityId) : '';
        acts.push({
          id: `ai-activity-${seq++}`,
          day,
          city: chosenCityId,
          cityName,
          title: a.title || 'Actividad',
          name: a.title || 'Actividad',
          desc: a.desc || a.description || '',
          description: a.desc || a.description || '',
          time: a.time || `${9 + i*2}:00`,
          duration: a.duration || '1-2 hours',
          cost: a.cost || 0,
          category: a.category || 'general',
          station: a.station || '',
          location: a.location || '',
          order: i + 1,
          aiGenerated: true,
          __applyMode: mode
        });
      });
    });

    return acts;
  },

  // ===== Insights Modal =====
  showAIInsightsModal(ai) {
    const existing = document.getElementById('aiInsightsModal'); if (existing) existing.remove();
    const tips = (ai?.tips||[]).map(t => `<li class="mb-1">• ${t}</li>`).join('');
    const modal = `
      <div id="aiInsightsModal" class="modal active" style="z-index:10002;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold dark:text-white">✨ AI Travel Insights</h3>
            <button id="aiInsightsCloseBtn" class="modal-close">×</button>
          </div>
          <div class="space-y-4 text-sm">
            ${ai?.summary ? `<div><div class="font-semibold mb-1">Resumen</div><p class="opacity-90">${ai.summary}</p></div>`:''}
            ${tips ? `<div><div class="font-semibold mb-1">Tips</div><ul>${tips}</ul></div>`:''}
            ${ai?.transportationTips ? `<div><div class="font-semibold mb-1">Consejos de transporte</div><p class="opacity-90">${ai.transportationTips}</p></div>`:''}
            ${ai?.budgetSummary ? `<div><div class="font-semibold mb-1">Presupuesto</div><p class="opacity-90">${ai.budgetSummary}</p></div>`:''}
          </div>
          <div class="text-right mt-6">
            <button id="aiInsightsCloseBtn" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Cerrar</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', modal);
    document.body.style.overflow = 'hidden';
  },
  closeAIInsightsModal() { const m = document.getElementById('aiInsightsModal'); if (m) { m.remove(); document.body.style.overflow=''; } },

  // ===== Utilidades =====
  generateDays(startDate, endDate) { const out=[]; let d=new Date(startDate), e=new Date(endDate), n=1; while (d<=e){ out.push({day:n, date:d.toISOString().split('T')[0], activities:[]}); d.setDate(d.getDate()+1); n++; } return out; },
  calculateActivityTime(startTime, idx) { const [h,m]=(startTime||'09:00').split(':').map(Number); const t=h*60+(m||0)+idx*90; const nh=String(Math.floor(t/60)%24).padStart(2,'0'); const nm=String(t%60).padStart(2,'0'); return `${nh}:${nm}`; },
  shuffleArray(a){const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]];} return b;}
};

window.ItineraryBuilder = ItineraryBuilder;
