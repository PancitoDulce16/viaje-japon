// js/hidden-gems-map.js - Mapa colaborativo de lugares secretos en Japón

/**
 * Hidden Gems Map
 * Mapa colaborativo donde usuarios comparten lugares secretos y poco conocidos
 */
export const HiddenGemsMap = {
  gems: [],
  userGems: [],
  currentFilter: 'all',

  CATEGORIES: {
    ramen: { name: 'Secret Ramen Shops', icon: '🍜', color: 'orange' },
    temples: { name: 'Unknown Temples', icon: '⛩️', color: 'purple' },
    sakura: { name: 'Hidden Sakura Spots', icon: '🌸', color: 'pink' },
    games: { name: 'Retro Game Shops', icon: '🎮', color: 'blue' },
    manga: { name: 'Manga Cafes', icon: '📚', color: 'red' },
    onsen: { name: 'Local Onsen', icon: '♨️', color: 'teal' },
    cafes: { name: 'Hidden Cafes', icon: '☕', color: 'brown' },
    views: { name: 'Secret Viewpoints', icon: '🌅', color: 'indigo' }
  },

  /**
   * Abre el mapa de Hidden Gems
   */
  async open() {
    await this.loadGems();
    this.showMap();
  },

  /**
   * Carga los gems desde Firestore
   */
  async loadGems() {
    // Mock data
    this.gems = this.generateMockGems();
    console.log('💎 Loaded', this.gems.length, 'hidden gems');
  },

  /**
   * Genera gems de prueba
   */
  generateMockGems() {
    return [
      {
        id: 'gem1',
        name: 'Ramen Alley (Local)',
        category: 'ramen',
        city: 'Tokyo',
        area: 'Ebisu',
        description: 'Callejón escondido con 5 ramen shops increíbles. Solo locals.',
        coordinates: { lat: 35.6467, lng: 139.7133 },
        submittedBy: 'maria_traveler',
        upvotes: 234,
        difficulty: 'hard', // easy, medium, hard
        tags: ['authentic', 'locals-only', 'cheap'],
        tips: [
          'Ir después de las 10pm',
          'Cash only',
          'No hablan inglés'
        ],
        photos: [],
        createdAt: '2025-01-15'
      },
      {
        id: 'gem2',
        name: 'Templo Secreto de las Ranas',
        category: 'temples',
        city: 'Kyoto',
        area: 'Arashiyama',
        description: 'Pequeño templo sin turistas. Tiene 100+ estatuas de ranas.',
        coordinates: { lat: 35.0170, lng: 135.6730 },
        submittedBy: 'juan_temples',
        upvotes: 189,
        difficulty: 'medium',
        tags: ['peaceful', 'unique', 'free'],
        tips: [
          'A 15 min caminando del Bamboo Forest',
          'Abre 8am-5pm',
          'Gratis'
        ],
        photos: [],
        createdAt: '2025-01-20'
      },
      {
        id: 'gem3',
        name: 'Game Center Underground',
        category: 'games',
        city: 'Osaka',
        area: 'Namba',
        description: 'Arcade subterráneo con máquinas de los 80s-90s. Paradise retro.',
        coordinates: { lat: 34.6687, lng: 135.5013 },
        submittedBy: 'carlos_gamer',
        upvotes: 156,
        difficulty: 'medium',
        tags: ['retro', 'cheap', 'nostalgia'],
        tips: [
          'Bajar las escaleras al lado de Don Quijote',
          '¥100 por juego',
          'Cierra a medianoche'
        ],
        photos: [],
        createdAt: '2025-02-01'
      },
      {
        id: 'gem4',
        name: 'Sakura Secret Garden',
        category: 'sakura',
        city: 'Tokyo',
        area: 'Meguro',
        description: 'Jardín privado que abre 1 semana al año. Cero turistas, puro sakura.',
        coordinates: { lat: 35.6339, lng: 139.7156 },
        submittedBy: 'ana_nature',
        upvotes: 298,
        difficulty: 'hard',
        tags: ['seasonal', 'exclusive', 'photography'],
        tips: [
          'Solo abre última semana de marzo',
          'Requiere reserva online',
          'Máximo 2 horas de visita'
        ],
        photos: [],
        createdAt: '2024-12-10'
      },
      {
        id: 'gem5',
        name: 'Manga Cafe con Onsen',
        category: 'manga',
        city: 'Tokyo',
        area: 'Ikebukuro',
        description: 'Manga cafe que tiene onsen privado. Mind = blown.',
        coordinates: { lat: 35.7295, lng: 139.7110 },
        submittedBy: 'otaku_master',
        upvotes: 445,
        difficulty: 'easy',
        tags: ['unique', 'relaxing', 'overnight'],
        tips: [
          '¥3000 por 12 horas con onsen',
          'Reservar online',
          'Puedes quedarte a dormir'
        ],
        photos: [],
        createdAt: '2025-01-25'
      }
    ];
  },

  /**
   * Muestra el mapa
   */
  showMap() {
    const modalHTML = `
      <div id="hiddenGemsModal" class="fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900 flex flex-col">

        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-lg">
          <div class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h1 class="text-3xl font-bold mb-2">💎 Hidden Gems Map</h1>
                <p class="text-purple-100">Lugares secretos compartidos por la comunidad</p>
              </div>
              <button onclick="window.HiddenGemsMap.close()" class="text-white hover:bg-white/20 rounded-lg p-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Stats -->
            <div class="flex gap-6 text-sm">
              <div class="flex items-center gap-2">
                <span class="font-bold text-2xl">${this.gems.length}</span>
                <span class="opacity-90">Hidden Gems</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-2xl">${this.userGems.length}</span>
                <span class="opacity-90">Tus contribuciones</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters & Search -->
        <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div class="max-w-7xl mx-auto">
            <div class="flex gap-4 items-center">

              <!-- Search -->
              <div class="flex-1">
                <input type="text"
                       placeholder="🔍 Buscar gems por nombre, ciudad..."
                       class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              </div>

              <!-- Add Gem Button -->
              <button onclick="window.HiddenGemsMap.showAddGemForm()"
                      class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition">
                ➕ Agregar Gem
              </button>

            </div>

            <!-- Category Filters -->
            <div class="flex gap-2 mt-4 overflow-x-auto pb-2">
              <button onclick="window.HiddenGemsMap.filterBy('all')"
                      class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full text-sm font-semibold whitespace-nowrap transition ${this.currentFilter === 'all' ? 'ring-2 ring-purple-500' : ''}">
                🌟 Todos
              </button>
              ${Object.entries(this.CATEGORIES).map(([key, cat]) => `
                <button onclick="window.HiddenGemsMap.filterBy('${key}')"
                        class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full text-sm font-semibold whitespace-nowrap transition ${this.currentFilter === key ? 'ring-2 ring-purple-500' : ''}">
                  ${cat.icon} ${cat.name}
                </button>
              `).join('')}
            </div>

          </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-hidden">
          <div class="max-w-7xl mx-auto h-full grid grid-cols-2 gap-6 p-6">

            <!-- Gems List -->
            <div class="overflow-y-auto space-y-4" id="gemsList">
              ${this.renderGemsList()}
            </div>

            <!-- Map Placeholder -->
            <div class="bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <div class="text-center p-8">
                <div class="text-6xl mb-4">🗺️</div>
                <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Mapa Interactivo
                </h3>
                <p class="text-gray-500 dark:text-gray-400">
                  Próximamente: Integración con Leaflet/MapBox
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  /**
   * Renderiza la lista de gems
   */
  renderGemsList() {
    const filteredGems = this.currentFilter === 'all'
      ? this.gems
      : this.gems.filter(g => g.category === this.currentFilter);

    if (filteredGems.length === 0) {
      return `
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🔍</div>
          <p class="text-gray-500 dark:text-gray-400">
            No hay gems en esta categoría. ¡Sé el primero en agregar uno!
          </p>
        </div>
      `;
    }

    return filteredGems.map(gem => this.renderGemCard(gem)).join('');
  },

  /**
   * Renderiza una card de gem
   */
  renderGemCard(gem) {
    const category = this.CATEGORIES[gem.category];
    const difficultyColors = {
      easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };

    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition overflow-hidden group">

        <!-- Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">${category.icon}</span>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">${gem.name}</h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                📍 ${gem.area}, ${gem.city}
              </p>
            </div>

            <!-- Upvote Button -->
            <button onclick="window.HiddenGemsMap.upvoteGem('${gem.id}')"
                    class="flex flex-col items-center gap-1 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg transition">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
              </svg>
              <span class="text-xs font-bold text-purple-600 dark:text-purple-400">${gem.upvotes}</span>
            </button>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mb-2">
            <span class="px-2 py-1 ${difficultyColors[gem.difficulty]} rounded-full text-xs font-semibold">
              ${gem.difficulty === 'easy' ? '😊 Fácil' : gem.difficulty === 'medium' ? '🤔 Medio' : '😰 Difícil'}
            </span>
            ${gem.tags.slice(0, 3).map(tag => `
              <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                #${tag}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Description -->
        <div class="p-4">
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            ${gem.description}
          </p>

          <!-- Tips -->
          ${gem.tips.length > 0 ? `
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3 rounded">
              <p class="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-2">💡 Tips:</p>
              <ul class="space-y-1 text-xs text-yellow-700 dark:text-yellow-200">
                ${gem.tips.map(tip => `<li>• ${tip}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Por @${gem.submittedBy}</span>
          <span>${gem.createdAt}</span>
        </div>

      </div>
    `;
  },

  /**
   * Filtra por categoría
   */
  filterBy(category) {
    this.currentFilter = category;

    const container = document.getElementById('gemsList');
    if (container) {
      container.innerHTML = this.renderGemsList();
    }
  },

  /**
   * Upvote a un gem
   */
  upvoteGem(gemId) {
    const gem = this.gems.find(g => g.id === gemId);
    if (gem) {
      gem.upvotes++;
      window.Notifications?.show('👍 Upvote registrado!', 'success');

      // Rerender
      this.filterBy(this.currentFilter);
    }
  },

  /**
   * Muestra formulario para agregar gem
   */
  showAddGemForm() {
    const formHTML = `
      <div id="addGemForm" class="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

          <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <h2 class="text-2xl font-bold">💎 Agregar Hidden Gem</h2>
            <p class="text-purple-100 mt-1">Comparte un lugar secreto con la comunidad</p>
          </div>

          <div class="p-6 space-y-4">

            <!-- Nombre -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nombre del lugar <span class="text-red-500">*</span>
              </label>
              <input type="text" id="gemName"
                     placeholder="Ej: Ramen Secreto de Ojiichan"
                     class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>

            <!-- Categoría -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Categoría <span class="text-red-500">*</span>
              </label>
              <select id="gemCategory" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                ${Object.entries(this.CATEGORIES).map(([key, cat]) => `
                  <option value="${key}">${cat.icon} ${cat.name}</option>
                `).join('')}
              </select>
            </div>

            <!-- Ciudad y Área -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ciudad <span class="text-red-500">*</span>
                </label>
                <select id="gemCity" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                  <option value="Tokyo">Tokyo</option>
                  <option value="Kyoto">Kyoto</option>
                  <option value="Osaka">Osaka</option>
                  <option value="Nara">Nara</option>
                  <option value="Hakone">Hakone</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Área/Barrio
                </label>
                <input type="text" id="gemArea"
                       placeholder="Ej: Shibuya"
                       class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              </div>
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descripción <span class="text-red-500">*</span>
              </label>
              <textarea id="gemDescription" rows="3"
                        placeholder="Describe qué hace especial este lugar..."
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"></textarea>
            </div>

            <!-- Dificultad -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Dificultad para encontrar
              </label>
              <select id="gemDifficulty" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="easy">😊 Fácil de encontrar</option>
                <option value="medium" selected>🤔 Requiere buscar un poco</option>
                <option value="hard">😰 Muy difícil (locals-only)</option>
              </select>
            </div>

            <!-- Tips -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tips (separados por Enter)
              </label>
              <textarea id="gemTips" rows="3"
                        placeholder="Ejemplo:&#10;Cash only&#10;Ir temprano en la mañana&#10;No hablan inglés"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"></textarea>
            </div>

          </div>

          <div class="p-6 bg-gray-50 dark:bg-gray-900 border-t flex gap-3">
            <button onclick="window.HiddenGemsMap.submitGem()"
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg">
              ✨ Publicar Gem
            </button>
            <button onclick="document.getElementById('addGemForm').remove()"
                    class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg">
              Cancelar
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);
  },

  /**
   * Envía un nuevo gem
   */
  submitGem() {
    const name = document.getElementById('gemName')?.value;
    const category = document.getElementById('gemCategory')?.value;
    const city = document.getElementById('gemCity')?.value;
    const area = document.getElementById('gemArea')?.value;
    const description = document.getElementById('gemDescription')?.value;
    const difficulty = document.getElementById('gemDifficulty')?.value;
    const tipsRaw = document.getElementById('gemTips')?.value;

    if (!name || !description) {
      window.Notifications?.show('❌ Completa los campos obligatorios', 'error');
      return;
    }

    const tips = tipsRaw?.split('\n').filter(t => t.trim()).map(t => t.trim()) || [];

    const newGem = {
      id: `gem_${Date.now()}`,
      name,
      category,
      city,
      area: area || city,
      description,
      difficulty,
      tips,
      coordinates: { lat: 35.6762, lng: 139.6503 }, // TODO: Get real coords
      submittedBy: 'current_user',
      upvotes: 0,
      tags: ['new'],
      photos: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.gems.unshift(newGem);
    this.userGems.push(newGem);

    window.Notifications?.show('✨ Hidden Gem publicado!', 'success');
    document.getElementById('addGemForm')?.remove();

    // Rerender
    this.filterBy('all');
  },

  /**
   * Cierra el modal
   */
  close() {
    document.getElementById('hiddenGemsModal')?.remove();
  }
};

// Exportar globalmente
window.HiddenGemsMap = HiddenGemsMap;

console.log('✅ Hidden Gems Map loaded');

export default HiddenGemsMap;
