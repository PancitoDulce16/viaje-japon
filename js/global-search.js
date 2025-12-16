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
            <div class="p-8 text-center text-gray-400">
              <span class="text-4xl mb-2 block">🔍</span>
              <p>Escribe para buscar...</p>
            </div>
          </div>

          <!-- Quick Commands -->
          <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Comandos rápidos:</p>
            <div class="flex flex-wrap gap-2">
              <button onclick="window.GlobalSearch.executeCommand('/optimizar')" class="text-xs px-3 py-1 bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                /optimizar
              </button>
              <button onclick="window.GlobalSearch.executeCommand('/presupuesto')" class="text-xs px-3 py-1 bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                /presupuesto
              </button>
              <button onclick="window.GlobalSearch.executeCommand('/chat')" class="text-xs px-3 py-1 bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                /chat
              </button>
              <button onclick="window.GlobalSearch.executeCommand('/live')" class="text-xs px-3 py-1 bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                /live
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
      { type: 'command', name: 'Optimizar Ruta', keywords: 'optimizar ruta geo mapa', icon: '🗺️', action: () => window.GeoOptimizerUI?.runOptimization() },
      { type: 'command', name: 'Presupuesto Inteligente', keywords: 'presupuesto dinero gastos budget', icon: '💰', action: () => window.BudgetIntelligenceUI?.showDashboard() },
      { type: 'command', name: 'AI Chat', keywords: 'chat ai asistente inteligencia', icon: '🤖', action: () => window.AIChatUI?.open() },
      { type: 'command', name: 'Modo Live', keywords: 'live japon en vivo ahora', icon: '📍', action: () => window.LiveModeUI?.activate() },
      { type: 'command', name: 'Guía Cultural', keywords: 'cultura etiqueta tradiciones', icon: '⛩️', action: () => window.CulturalKnowledgeUI?.showGuide() },
      { type: 'command', name: 'Mi Perfil', keywords: 'perfil usuario tipo viajero', icon: '👤', action: () => window.TravelerProfilesUI?.showProfileSelector() },
      { type: 'command', name: 'Health Dashboard', keywords: 'salud health itinerario', icon: '🏥', action: () => window.HealthDashboard?.toggle() }
    );

    // Lugares comunes de Japón
    const places = [
      'Senso-ji Temple', 'Shibuya Crossing', 'Tokyo Skytree', 'Meiji Jingu',
      'Fushimi Inari', 'Kinkakuji', 'Osaka Castle', 'Dotonbori',
      'Nara Park', 'Mount Fuji', 'Kyoto', 'Tokyo', 'Osaka', 'Hokkaido'
    ];

    places.forEach(place => {
      this.searchIndex.push({
        type: 'place',
        name: place,
        keywords: place.toLowerCase(),
        icon: '📍',
        action: () => {
          this.close();
          if (window.showToast) {
            window.showToast(`Buscando "${place}" en tu itinerario...`, 'info');
          }
        }
      });
    });

    // Tipos de comida
    const foods = ['Ramen', 'Sushi', 'Tempura', 'Takoyaki', 'Okonomiyaki', 'Udon', 'Tonkatsu'];
    foods.forEach(food => {
      this.searchIndex.push({
        type: 'food',
        name: food,
        keywords: food.toLowerCase() + ' comida restaurante',
        icon: '🍜',
        action: () => {
          this.close();
          if (window.showToast) {
            window.showToast(`Buscando restaurantes de ${food}...`, 'info');
          }
        }
      });
    });

    console.log(`🔍 Search index built: ${this.searchIndex.length} items`);
  }

  /**
   * Manejar búsqueda
   */
  handleSearch(query) {
    const resultsContainer = document.getElementById('global-search-results');

    if (!query || query.length < 2) {
      resultsContainer.innerHTML = `
        <div class="p-8 text-center text-gray-400">
          <span class="text-4xl mb-2 block">🔍</span>
          <p>Escribe para buscar...</p>
        </div>
      `;
      return;
    }

    // Filtrar resultados
    const results = this.searchIndex.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.keywords.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="p-8 text-center text-gray-400">
          <span class="text-4xl mb-2 block">🤷</span>
          <p>No se encontraron resultados para "${query}"</p>
        </div>
      `;
      return;
    }

    // Renderizar resultados
    resultsContainer.innerHTML = results.map((item, index) => `
      <div class="search-result-item ${index === 0 ? 'bg-purple-50 dark:bg-purple-900/20' : ''} p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition border-b border-gray-100 dark:border-gray-700 last:border-0" onclick="window.GlobalSearch.selectResult(${this.searchIndex.indexOf(item)})">
        <div class="flex items-center gap-3">
          <span class="text-3xl">${item.icon}</span>
          <div class="flex-1">
            <div class="font-semibold text-gray-900 dark:text-white">${item.name}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 capitalize">${item.type}</div>
          </div>
          <kbd class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">Enter</kbd>
        </div>
      </div>
    `).join('');
  }

  /**
   * Manejar teclas
   */
  handleKeyDown(e) {
    // TODO: Implementar navegación con flechas
    if (e.key === 'Enter') {
      const firstResult = document.querySelector('.search-result-item');
      if (firstResult) firstResult.click();
    }
  }

  /**
   * Seleccionar resultado
   */
  selectResult(index) {
    const item = this.searchIndex[index];
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
      '/presupuesto': () => window.BudgetIntelligenceUI?.showDashboard(),
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
