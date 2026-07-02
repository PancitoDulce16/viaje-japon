/**
 * 🔍 BÚSQUEDA INTELIGENTE GLOBAL
 * ==============================
 *
 * Sistema de búsqueda global en toda la app
 * IMPROVED.md Priority #7
 */

class GlobalSearch {
  constructor() {
    this.searchIndex = [];
    this.isOpen = false;
    this.currentResults = [];   // resultados del query actual
    this.selectedIndex = 0;     // navegación con flechas
  }

  /**
   * Inicializar búsqueda
   */
  init() {
    this.createSearchUI();
    this.setupKeyboardShortcut();
    this.buildSearchIndex();
  }

  /**
   * Crear UI de búsqueda
   */
  createSearchUI() {
    const searchContainer = document.createElement('div');
    searchContainer.id = 'global-search-container';
    searchContainer.className = 'fixed inset-0 bg-black/50 z-[100000] hidden backdrop-blur-sm';
    searchContainer.innerHTML = `
      <div class="flex items-start justify-center min-h-screen p-4 pt-20">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
          <!-- Search Input -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
              <input
                type="text"
                id="global-search-input"
                placeholder="Buscar actividades, lugares, comandos... (Ctrl+K)"
                class="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl border-2 border-transparent focus:border-purple-500 focus:outline-none transition-all"
              />
              <button onclick="window.GlobalSearch.close()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="flex gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↑↓</kbd>
              <span>navegar</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd>
              <span>seleccionar</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
              <span>cerrar</span>
            </div>
          </div>

          <!-- Results -->
          <div id="global-search-results" class="max-h-96 overflow-y-auto">
            <div class="p-8 text-center text-gray-400 dark:text-gray-500">
              <span class="text-4xl mb-2 block animate-bounce-slow">🔍</span>
              <p class="font-semibold">Escribe para buscar...</p>
              <p class="text-xs mt-2">Comandos, lugares, comida y más</p>
            </div>
          </div>

          <!-- Quick Commands -->
          <div class="p-4 bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs font-bold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span class="text-sm">⚡</span>
              Comandos rápidos:
            </p>
            <div class="flex flex-wrap gap-2">
              <button onclick="window.GlobalSearch.executeCommand('/optimizar')" class="text-xs px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all shadow-sm hover:shadow border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
                🗺️ /optimizar
              </button>
              <button onclick="window.GlobalSearch.executeCommand('/presupuesto')" class="text-xs px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all shadow-sm hover:shadow border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
                💰 /presupuesto
              </button>
              <button onclick="window.GlobalSearch.executeCommand('/chat')" class="text-xs px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all shadow-sm hover:shadow border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
                🤖 /chat
              </button>
              <button onclick="window.GlobalSearch.executeCommand('/live')" class="text-xs px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all shadow-sm hover:shadow border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
                📍 /live
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(searchContainer);

    // Event listeners
    const input = document.getElementById('global-search-input');
    input.addEventListener('input', (e) => this.handleSearch(e.target.value));
    input.addEventListener('keydown', (e) => this.handleKeyDown(e));

    searchContainer.addEventListener('click', (e) => {
      if (e.target === searchContainer) this.close();
    });
  }

  /**
   * Setup keyboard shortcut (Ctrl+K)
   */
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Construir índice de búsqueda
   */
  buildSearchIndex() {
    this.searchIndex = [];

    // Comandos
    this.searchIndex.push(
      { type: 'command', name: 'Optimizar Ruta', subtitle: 'Reordena el día por cercanía', keywords: 'optimizar ruta geo mapa', icon: '🗺️', action: () => window.GeoOptimizerUI?.runOptimization() },
      { type: 'command', name: 'Bento Budget', subtitle: 'Presupuesto y gastos del viaje', keywords: 'presupuesto dinero gastos budget bento', icon: '🍱', action: () => document.querySelector('.tab-btn[data-tab="budget"]')?.click() },
      { type: 'command', name: 'AI Chat', subtitle: 'Asistente del viaje', keywords: 'chat ai asistente inteligencia', icon: '🤖', action: () => window.AIChatUI?.open() },
      { type: 'command', name: 'Modo Live', subtitle: 'Para usar durante el viaje', keywords: 'live japon en vivo ahora', icon: '📍', action: () => window.LiveModeUI?.activate() },
      { type: 'command', name: 'Guía Cultural', subtitle: 'Etiqueta y tradiciones', keywords: 'cultura etiqueta tradiciones', icon: '⛩️', action: () => window.CulturalKnowledgeUI?.showGuide() },
      { type: 'command', name: 'Mi Perfil', subtitle: 'Tipo de viajero', keywords: 'perfil usuario tipo viajero', icon: '👤', action: () => window.TravelerProfilesUI?.showProfileSelector() },
      { type: 'command', name: 'Health Dashboard', subtitle: 'Salud del itinerario', keywords: 'salud health itinerario', icon: '🏥', action: () => window.HealthDashboard?.toggle() }
    );

    // 🔧 Antes esto era una lista fija de ~14 lugares y 7 comidas hardcodeadas,
    // cuya acción era solo mostrar un toast que decía "buscando..." sin buscar ni
    // navegar a ningún lado - no reflejaba el itinerario real del usuario y no
    // servía para nada útil. Ahora indexa las actividades REALES del itinerario
    // actual (nombre, día, categoría) y el click te lleva directo a ese día.
    const itinerary = window.getCurrentItinerary?.();
    if (itinerary?.days) {
      itinerary.days.forEach(day => {
        (day.activities || []).forEach(activity => {
          const name = activity.title || activity.name;
          if (!name) return;
          const dayCity = day.city || day.cityName || day.location || '';
          this.searchIndex.push({
            type: 'actividad',
            name: name,
            subtitle: `Día ${day.day}${dayCity ? ' · ' + dayCity : ''}${activity.time ? ' · ' + activity.time : ''}`,
            keywords: `${name} ${activity.category || ''} ${dayCity} dia ${day.day}`.toLowerCase(),
            icon: activity.icon || activity.categoryIcon || (activity.isMeal ? '🍜' : '📍'),
            action: () => {
              this.close();
              window.DashboardApp?.switchTab('itinerary');
              window.selectDay?.(day.day);
            }
          });
        });
      });
    }

    console.log(`🔍 Search index built: ${this.searchIndex.length} items (${itinerary?.days ? 'con itinerario real' : 'sin itinerario cargado todavía'})`);
  }

  /**
   * Manejar búsqueda
   */
  handleSearch(query) {
    const resultsContainer = document.getElementById('global-search-results');

    if (!query || query.length < 2) {
      resultsContainer.innerHTML = `
        <div class="p-8 text-center text-gray-400 dark:text-gray-500">
          <span class="text-4xl mb-2 block animate-bounce-slow">🔍</span>
          <p class="font-semibold">Escribe para buscar...</p>
          <p class="text-xs mt-2">Comandos, lugares, comida y más</p>
        </div>
      `;
      return;
    }

    // Filtrar resultados
    const q = query.toLowerCase();
    this.currentResults = this.searchIndex.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    ).slice(0, 10);
    this.selectedIndex = 0;
    this._lastQuery = query;

    if (this.currentResults.length === 0) {
      resultsContainer.innerHTML = `
        <div class="p-8 text-center text-gray-400 dark:text-gray-500">
          <span class="text-4xl mb-2 block">🍙</span>
          <p class="font-semibold">Nada por aquí para "${this.escapeHtml(query)}"</p>
          <p class="text-xs mt-2">Prueba con el nombre de una actividad, un día ("dia 3") o un comando</p>
        </div>
      `;
      return;
    }

    this.renderResults();
  }

  escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /** Resalta la parte del nombre que coincide con el query */
  highlightMatch(name, query) {
    const safe = this.escapeHtml(name);
    if (!query) return safe;
    const idx = name.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return safe;
    const pre = this.escapeHtml(name.slice(0, idx));
    const hit = this.escapeHtml(name.slice(idx, idx + query.length));
    const post = this.escapeHtml(name.slice(idx + query.length));
    return `${pre}<mark class="bg-pink-200 dark:bg-amber-500/40 text-inherit rounded px-0.5">${hit}</mark>${post}`;
  }

  /** Renderiza this.currentResults con el seleccionado resaltado */
  renderResults() {
    const resultsContainer = document.getElementById('global-search-results');
    resultsContainer.innerHTML = this.currentResults.map((item, index) => `
      <div class="search-result-item ${index === this.selectedIndex ? 'bg-pink-50 dark:bg-amber-900/15 border-l-4 border-l-pink-500 dark:border-l-amber-400' : 'border-l-4 border-l-transparent'} px-4 py-3 hover:bg-pink-50/70 dark:hover:bg-amber-900/10 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
           data-result-idx="${index}"
           onclick="window.GlobalSearch.selectResult(${index})"
           onmouseenter="window.GlobalSearch.setSelected(${index})">
        <div class="flex items-center gap-3">
          <span class="text-2xl flex-shrink-0">${item.icon}</span>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-900 dark:text-white truncate">${this.highlightMatch(item.name, this._lastQuery)}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
              ${item.subtitle ? this.escapeHtml(item.subtitle) : `<span class="capitalize">${item.type}</span>`}
            </div>
          </div>
          <span class="text-[10px] uppercase tracking-wide font-bold flex-shrink-0 px-2 py-0.5 rounded-full ${item.type === 'command' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'}">
            ${item.type === 'command' ? '⚡ acción' : '📅 itinerario'}
          </span>
        </div>
      </div>
    `).join('');
  }

  /** Cambia el seleccionado (hover o flechas) sin reconstruir todo */
  setSelected(index) {
    if (index === this.selectedIndex) return;
    this.selectedIndex = index;
    this.renderResults();
  }

  /**
   * Manejar teclas: ↑↓ navegan, Enter abre el seleccionado
   */
  handleKeyDown(e) {
    if (!this.currentResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % this.currentResults.length;
      this.renderResults();
      this.scrollSelectedIntoView();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + this.currentResults.length) % this.currentResults.length;
      this.renderResults();
      this.scrollSelectedIntoView();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.selectResult(this.selectedIndex);
    }
  }

  scrollSelectedIntoView() {
    document.querySelector(`[data-result-idx="${this.selectedIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Seleccionar resultado (índice dentro de currentResults)
   */
  selectResult(index) {
    const item = this.currentResults[index];
    if (item && item.action) {
      item.action();
      this.close();
    }
  }

  /**
   * Ejecutar comando
   */
  executeCommand(command) {
    const commands = {
      '/optimizar': () => window.GeoOptimizerUI?.runOptimization(),
      '/presupuesto': () => document.querySelector('.tab-btn[data-tab="budget"]')?.click(),
      '/chat': () => window.AIChatUI?.open(),
      '/live': () => window.LiveModeUI?.activate()
    };

    if (commands[command]) {
      commands[command]();
      this.close();
    }
  }

  /**
   * Abrir búsqueda
   */
  open() {
    const container = document.getElementById('global-search-container');
    const input = document.getElementById('global-search-input');

    if (container && input) {
      // El índice se construyó una vez al cargar la página, cuando normalmente
      // todavía no hay ningún viaje/itinerario cargado - reconstruirlo acá para
      // que siempre refleje las actividades reales del viaje actual.
      this.buildSearchIndex();
      container.classList.remove('hidden');
      setTimeout(() => input.focus(), 100);
      this.isOpen = true;
    }
  }

  /**
   * Cerrar búsqueda
   */
  close() {
    const container = document.getElementById('global-search-container');
    const input = document.getElementById('global-search-input');

    if (container && input) {
      container.classList.add('hidden');
      input.value = '';
      this.handleSearch('');
      this.isOpen = false;
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.GlobalSearch = new GlobalSearch();

  // Auto-init cuando DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.GlobalSearch.init());
  } else {
    window.GlobalSearch.init();
  }

  console.log('🔍 Global Search loaded! Press Ctrl+K to search');
}
