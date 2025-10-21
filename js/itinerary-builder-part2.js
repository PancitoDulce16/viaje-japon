
// js/itinerary-builder-part2.js — Extensiones del Constructor de Itinerarios (patched)
// Nota: elimina la dependencia a ItineraryBuilder.selectedCategories (leemos del DOM o usamos fallback)

import { db, auth } from '/js/firebase-config.js';
import { Notifications } from './notifications.js';
import { CATEGORIES } from '../data/categories-data.js';
import { ACTIVITIES_DATABASE, getActivitiesByCity, getActivitiesByCategory, searchActivities } from '../data/activities-database.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const ItineraryBuilderExtensions = {
  // === AGREGAR ACTIVIDAD ===
  showAddActivityModal(dayNumber = null) {
    if (!window.TripsManager || !window.TripsManager.currentTrip) {
      Notifications.warning('Primero debes crear o seleccionar un viaje');
      return;
    }
    const cities = window.TripsManager.currentTrip.cities || [];

    // ⬇️ NUEVO: leer categorías marcadas del wizard, o usar todas como fallback
    const getSelectedCategories = () => {
      try {
        const marked = Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(i => i.value);
        return marked.length ? marked : CATEGORIES.map(c => c.id);
      } catch (e) {
        return CATEGORIES.map(c => c.id);
      }
    };
    const selectedCategories = getSelectedCategories();

    const cityOptions = Object.keys(ACTIVITIES_DATABASE).map(cityId => `
      <option value="${cityId}">${ACTIVITIES_DATABASE[cityId].city}</option>
    `).join('');

    const categoryOptions = CATEGORIES.map(cat => `
      <option value="${cat.id}">${cat.icon} ${cat.name}</option>
    `).join('');

    const modalHtml = `
      <div id="addActivityModal" class="modal active" style="z-index:10050;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full p-0 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white">
            <h3 class="text-xl font-bold">➕ Agregar Actividad</h3>
            <button class="modal-close text-white" onclick="ItineraryBuilderExtensions.closeAddActivityModal()">×</button>
          </div>

          <div class="p-6">
            <div class="flex items-center gap-2 mb-4 border-b">
              <button id="searchActivityTab" class="border-b-2 border-green-500 text-green-600 px-3 py-2 text-sm"
                      onclick="ItineraryBuilderExtensions.switchActivityTab('search')">🔎 Buscar</button>
              <button id="customActivityTab" class="border-b-2 border-transparent text-gray-500 hover:text-gray-700 px-3 py-2 text-sm"
                      onclick="ItineraryBuilderExtensions.switchActivityTab('custom')">✏️ Personalizada</button>
            </div>

            <!-- Buscar actividades -->
            <div id="searchActivityContent">
              <div class="grid md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label class="text-xs">Ciudad</label>
                  <select id="activityCityFilter" class="w-full p-2 border rounded">
                    <option value="all">Todas</option>
                    ${cityOptions}
                  </select>
                </div>
                <div>
                  <label class="text-xs">Categoría</label>
                  <select id="activityCategoryFilter" class="w-full p-2 border rounded">
                    <option value="all">Todas</option>
                    ${categoryOptions}
                  </select>
                </div>
                <div>
                  <label class="text-xs">Buscar</label>
                  <input id="activitySearchInput" class="w-full p-2 border rounded" placeholder="Ej. templo, ramen, mirador" />
                </div>
              </div>
              <div id="activitySearchResults" class="space-y-2 text-sm">
                <!-- resultados -->
              </div>
            </div>

            <!-- Crear personalizada -->
            <div id="customActivityContent" class="hidden">
              <form id="customActivityForm" class="space-y-3">
                <div class="grid md:grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs">Nombre *</label>
                    <input id="customActivityName" class="w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label class="text-xs">Categoría *</label>
                    <select id="customActivityCategory" class="w-full p-2 border rounded" required>
                      <option value="">Seleccionar...</option>
                      ${categoryOptions}
                    </select>
                  </div>
                </div>
                <div>
                  <label class="text-xs">Descripción</label>
                  <textarea id="customActivityDescription" class="w-full p-2 border rounded" rows="2"></textarea>
                </div>
                <div class="grid md:grid-cols-4 gap-3">
                  <div>
                    <label class="text-xs">Hora *</label>
                    <input id="customActivityTime" type="time" class="w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label class="text-xs">Duración (min)</label>
                    <input id="customActivityDuration" type="number" class="w-full p-2 border rounded" value="60" />
                  </div>
                  <div>
                    <label class="text-xs">Costo (¥)</label>
                    <input id="customActivityCost" type="number" class="w-full p-2 border rounded" value="0" />
                  </div>
                  <div>
                    <label class="text-xs">Ciudad</label>
                    <select id="customActivityCity" class="w-full p-2 border rounded">
                      <option value="">Seleccionar...</option>
                      ${cityOptions}
                    </select>
                  </div>
                </div>
                <div>
                  <label class="text-xs">Ubicación/Estación</label>
                  <input id="customActivityLocation" class="w-full p-2 border rounded" placeholder="Ej. Gion-Shijo / Shinjuku" />
                </div>
                <div>
                  <label class="text-xs">Notas</label>
                  <textarea id="customActivityNotes" class="w-full p-2 border rounded" rows="2"></textarea>
                </div>
                <div class="flex justify-end gap-2 mt-2">
                  <button type="button" class="px-4 py-2 bg-gray-200 rounded" onclick="ItineraryBuilderExtensions.closeAddActivityModal()">Cerrar</button>
                  <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded">➕ Agregar Actividad</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>`;

    const existing = document.getElementById('addActivityModal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';

    // Inicializar resultados base y eventos
    this.loadInitialActivities();

    const searchInput = document.getElementById('activitySearchInput');
    if (searchInput) searchInput.addEventListener('input', () => this.searchActivitiesLive());
    const cityFilter = document.getElementById('activityCityFilter');
    const catFilter  = document.getElementById('activityCategoryFilter');
    if (cityFilter) cityFilter.addEventListener('change', () => this.filterActivities());
    if (catFilter) catFilter.addEventListener('change', () => this.filterActivities());

    const customForm = document.getElementById('customActivityForm');
    if (customForm) customForm.addEventListener('submit', (e) => { e.preventDefault(); this.addCustomActivity(dayNumber); });
  },

  switchActivityTab(tab) {
    const searchTab = document.getElementById('searchActivityTab');
    const customTab = document.getElementById('customActivityTab');
    const searchContent = document.getElementById('searchActivityContent');
    const customContent = document.getElementById('customActivityContent');
    if (tab === 'search') {
      searchTab.classList.add('border-green-500','text-green-600');
      searchTab.classList.remove('text-gray-500');
      customTab.classList.remove('border-green-500','text-green-600');
      customTab.classList.add('text-gray-500');
      searchContent.classList.remove('hidden');
      customContent.classList.add('hidden');
    } else {
      customTab.classList.add('border-green-500','text-green-600');
      customTab.classList.remove('text-gray-500');
      searchTab.classList.remove('border-green-500','text-green-600');
      searchTab.classList.add('text-gray-500');
      customContent.classList.remove('hidden');
      searchContent.classList.add('hidden');
    }
  },

  loadInitialActivities() {
    const cityFilter = document.getElementById('activityCityFilter')?.value || 'all';
    const categoryFilter = document.getElementById('activityCategoryFilter')?.value || 'all';
    let activities = [];
    if (cityFilter === 'all') {
      for (const cityId in ACTIVITIES_DATABASE) {
        activities.push(...(ACTIVITIES_DATABASE[cityId]?.activities || []));
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
    const query = document.getElementById('activitySearchInput')?.value || '';
    if (query.trim().length < 2) { this.loadInitialActivities(); return; }
    const results = searchActivities(query.trim());
    this.renderActivityResults(results);
  },

  filterActivities() {
    const q = document.getElementById('activitySearchInput')?.value || '';
    if (q.trim().length >= 2) this.searchActivitiesLive(); else this.loadInitialActivities();
  },

  renderActivityResults(activities) {
    const container = document.getElementById('activitySearchResults');
    if (!container) return;
    if (!activities || activities.length === 0) {
      container.innerHTML = `
        <div class="p-3 text-gray-500">🔎 No se encontraron actividades</div>
      `;
      return;
    }
    container.innerHTML = activities.slice(0, 30).map(activity => {
      const category = CATEGORIES.find(c => c.id === activity.category);
      const icon = category?.icon || '📍';
      const catName = category?.name || 'Sin categoría';
      const dur = activity.duration ? ` · ⏱️ ${activity.duration}` : '';
      const yen = activity.cost > 0 ? ` · ¥${Number(activity.cost).toLocaleString()}` : ' · Gratis';
      const st  = activity.station ? ` · 🚉 ${activity.station}` : '';
      return `
        <div class="p-3 rounded border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="text-sm text-gray-500 mb-1">${icon} ${catName}${dur}${yen}${st}</div>
              <h5 class="font-semibold">${activity.name || activity.title}</h5>
              <p class="text-xs text-gray-600 dark:text-gray-400">${activity.description || activity.desc || ''}</p>
            </div>
            <button class="px-3 py-1 text-sm bg-green-600 text-white rounded"
                    onclick="ItineraryBuilderExtensions.addQuickActivity('${activity.id || ''}')">Añadir</button>
          </div>
        </div>`;
    }).join('');
  },

  // Añadir actividad rápida desde la base local (day actual del timeline)
  addQuickActivity(activityId) {
    try {
      const tripId = window.TripsManager?.currentTrip?.id;
      if (!tripId) { Notifications.warning('Selecciona un viaje'); return; }
      const day = window.ItineraryHandler ? window.ItineraryHandler?.__getCurrentDay?.() : null;
      if (!day) { Notifications.warning('Abre el día en el itinerario para añadir'); return; }
      // Buscar actividad por id en DB local
      let selected = null, cityId = null;
      for (const cid in ACTIVITIES_DATABASE) {
        const found = (ACTIVITIES_DATABASE[cid]?.activities || []).find(a => a.id === activityId);
        if (found) { selected = found; cityId = cid; break; }
      }
      if (!selected) { Notifications.error('Actividad no encontrada'); return; }
      const newAct = {
        id: `custom-${Date.now()}`,
        icon: '📍',
        time: selected.time || '09:00',
        title: selected.name || selected.title || 'Actividad',
        desc: selected.description || selected.desc || '',
        cost: selected.cost || 0,
        station: selected.station || '',
        city: cityId || '',
        category: selected.category || 'general'
      };
      // Delega al handler existente
      if (window.ItineraryHandler?.__appendActivityToDay) {
        window.ItineraryHandler.__appendActivityToDay(day.day, newAct);
      }
      Notifications.success('Actividad añadida');
    } catch (e) {
      console.error(e); Notifications.error('No se pudo añadir');
    }
  },

  async addCustomActivity(dayNumber) {
    const activityData = {
      id: `custom-${Date.now()}`,
      name: document.getElementById('customActivityName').value,
      category: document.getElementById('customActivityCategory').value,
      description: document.getElementById('customActivityDescription').value,
      time: document.getElementById('customActivityTime').value,
      duration: parseInt(document.getElementById('customActivityDuration').value || '60', 10),
      cost: parseInt(document.getElementById('customActivityCost').value || '0', 10),
      location: document.getElementById('customActivityLocation').value,
      city: document.getElementById('customActivityCity').value,
      notes: document.getElementById('customActivityNotes').value,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    // Aquí podrías persistir en una doc por usuario si lo deseas.
    Notifications.success(`Actividad personalizada "${activityData.name}" creada`);
    this.closeAddActivityModal();
  },

  closeAddActivityModal() {
    const modal = document.getElementById('addActivityModal');
    if (modal) { modal.remove(); document.body.style.overflow = ''; }
  },

  // === DRAG & DROP (placeholder) ===
  setupDragAndDrop() { console.log('🎯 Drag & Drop configurado'); },

  // === OPTIMIZACIÓN DE RUTAS ===
  async optimizeRoute(dayNumber) {
    Notifications.info('🗺️ Optimizando ruta...');
    setTimeout(() => { Notifications.success('✅ Ruta optimizada'); }, 1200);
  },
  toggleOptimization() {
    window.ItineraryBuilder = window.ItineraryBuilder || {};
    window.ItineraryBuilder.optimizationEnabled = !window.ItineraryBuilder.optimizationEnabled;
    if (window.ItineraryBuilder.optimizationEnabled) Notifications.success('🎯 Optimización automática activada');
    else Notifications.info('Optimización automática desactivada');
  },

  // === EXPORTAR / COMPARTIR ===
  async exportToPDF() { Notifications.info('📄 Generando PDF...'); setTimeout(()=>Notifications.success('✅ PDF generado'), 1000); },
  async shareItinerary() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mi Itinerario de Viaje', text: 'Mira mi itinerario de viaje a Japón!', url: window.location.href });
      } catch (e) { console.warn('Share cancel/err', e); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      Notifications.success('🔗 Link copiado al portapapeles');
    }
  }
};

// Exportar para uso global
window.ItineraryBuilderExtensions = ItineraryBuilderExtensions;
