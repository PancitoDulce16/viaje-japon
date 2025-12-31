/**
 * Public Trip Landing Page Generator
 * Generador de landing pages públicas para compartir viajes
 */

class LandingPageGenerator {
  constructor() {
    this.currentPage = null;
    this.publishedPages = [];
    this.templates = [];
    this.tripData = null;

    // Templates disponibles
    this.TEMPLATES = {
      minimal: {
        name: 'Minimal',
        icon: '✨',
        description: 'Clean y minimalista, enfocado en fotos',
        preview: 'minimal',
        color: 'gray',
        features: ['Hero image', 'Photo grid', 'Simple stats', 'Contact']
      },
      storyteller: {
        name: 'Storyteller',
        icon: '📖',
        description: 'Narrativa cronológica con diario',
        preview: 'story',
        color: 'blue',
        features: ['Timeline', 'Diary entries', 'Photo stories', 'Map']
      },
      aesthetic: {
        name: 'Aesthetic',
        icon: '🌸',
        description: 'Visualmente impactante, Instagram-style',
        preview: 'aesthetic',
        color: 'pink',
        features: ['Large images', 'Parallax', 'Animations', 'Filters']
      },
      adventure: {
        name: 'Adventure',
        icon: '⛰️',
        description: 'Para viajes de aventura y exploración',
        preview: 'adventure',
        color: 'green',
        features: ['Interactive map', 'Activity tracker', 'Stats', 'Route']
      },
      foodie: {
        name: 'Foodie',
        icon: '🍜',
        description: 'Enfocado en experiencias culinarias',
        preview: 'foodie',
        color: 'orange',
        features: ['Restaurant cards', 'Food photos', 'Ratings', 'Map']
      },
      portfolio: {
        name: 'Portfolio',
        icon: '📸',
        description: 'Para fotógrafos, galería profesional',
        preview: 'portfolio',
        color: 'purple',
        features: ['Full-screen gallery', 'Lightbox', 'EXIF data', 'Contact']
      }
    };

    // Secciones disponibles
    this.SECTIONS = {
      hero: { name: 'Hero Banner', icon: '🎯', default: true, editable: true },
      about: { name: 'Sobre el viaje', icon: '📝', default: true, editable: true },
      stats: { name: 'Estadísticas', icon: '📊', default: true, editable: false },
      gallery: { name: 'Galería de fotos', icon: '🖼️', default: true, editable: false },
      timeline: { name: 'Timeline', icon: '📅', default: true, editable: false },
      map: { name: 'Mapa interactivo', icon: '🗺️', default: true, editable: false },
      highlights: { name: 'Highlights', icon: '⭐', default: true, editable: true },
      diary: { name: 'Diario de viaje', icon: '📔', default: false, editable: true },
      food: { name: 'Food recommendations', icon: '🍜', default: false, editable: false },
      tips: { name: 'Tips y consejos', icon: '💡', default: false, editable: true },
      guestbook: { name: 'Libro de visitas', icon: '✍️', default: false, editable: false },
      contact: { name: 'Contacto', icon: '📧', default: true, editable: true }
    };

    this.initMockData();
  }

  /**
   * Inicializa datos mock
   */
  initMockData() {
    // Datos del viaje actual
    this.tripData = {
      title: 'Mi viaje a Japón 🇯🇵',
      subtitle: 'Aventura de 10 días por Tokyo, Kyoto y Osaka',
      author: 'Noelia',
      dates: {
        start: '2025-02-15',
        end: '2025-02-24'
      },
      cities: ['Tokyo', 'Kyoto', 'Osaka'],
      stats: {
        days: 10,
        cities: 3,
        photos: 847,
        ramenShops: 23,
        temples: 12,
        kmTraveled: 1240
      },
      heroImage: '🏯',
      description: 'Un viaje increíble descubriendo la cultura, comida y belleza de Japón. Desde los neones de Tokyo hasta los templos de Kyoto.',
      highlights: [
        { title: 'Fushimi Inari al amanecer', emoji: '⛩️', description: 'Toriis sin turistas' },
        { title: 'Ramen crawl en Shibuya', emoji: '🍜', description: '7 ramen shops en un día' },
        { title: 'Cherry blossoms', emoji: '🌸', description: 'Tuve suerte de verlos!' }
      ]
    };

    // Páginas publicadas
    this.publishedPages = [
      {
        id: 'page1',
        title: 'Mi viaje a Japón 🇯🇵',
        template: 'aesthetic',
        url: 'japan-trip-2025',
        status: 'published',
        publishedAt: '2025-02-20',
        views: 342,
        likes: 89,
        comments: 23
      },
      {
        id: 'page2',
        title: 'Food Tour Tokyo',
        template: 'foodie',
        url: 'tokyo-food-adventure',
        status: 'draft',
        publishedAt: null,
        views: 0,
        likes: 0,
        comments: 0
      }
    ];
  }

  /**
   * Abre el generador
   */
  open() {
    const modal = document.createElement('div');
    modal.id = 'landingPageModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-strong flex items-center justify-center z-50 p-4 animate-fadeInUp';

    modal.innerHTML = `
      <div class="glass-card rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col glow-purple hover-lift">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 gradient-animated text-white p-6 relative overflow-hidden">
          <div class="shimmer absolute inset-0"></div>
          <div class="relative z-10">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold mb-2">🌐 Landing Page Generator</h2>
              <p class="text-white/90">Crea una página pública hermosa para tu viaje</p>
            </div>
            <button onclick="window.landingPageGenerator?.close()" class="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Stats -->
          <div class="mt-4 grid grid-cols-3 gap-4">
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.publishedPages.filter(p => p.status === 'published').length}</div>
              <div class="text-sm text-white/80">Publicadas</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.publishedPages.reduce((sum, p) => sum + p.views, 0)}</div>
              <div class="text-sm text-white/80">Total views</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.publishedPages.reduce((sum, p) => sum + p.likes, 0)}</div>
              <div class="text-sm text-white/80">Total likes</div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <div class="flex">
            <button onclick="window.landingPageGenerator?.showTab('create')"
                    id="tab-create"
                    class="px-6 py-3 font-medium border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 tab-button">
              ✨ Crear Nueva
            </button>
            <button onclick="window.landingPageGenerator?.showTab('pages')"
                    id="tab-pages"
                    class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button">
              📄 Mis Páginas
            </button>
            <button onclick="window.landingPageGenerator?.showTab('analytics')"
                    id="tab-analytics"
                    class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button">
              📊 Analytics
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6" id="landingContent">
          ${this.renderCreateTab()}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Renderiza tab de creación
   */
  renderCreateTab() {
    return `
      <div class="space-y-6">
        <!-- Step 1: Seleccionar template -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">1️⃣ Elige un template</h3>
          <div class="grid md:grid-cols-3 gap-4">
            ${Object.entries(this.TEMPLATES).map(([key, template]) => `
              <button onclick="window.landingPageGenerator?.selectTemplate('${key}')"
                      id="template-${key}"
                      class="bg-gradient-to-br from-${template.color}-50 to-white dark:from-${template.color}-900/20 dark:to-gray-800 border-2 border-${template.color}-200 dark:border-${template.color}-800 rounded-xl p-6 hover:shadow-lg transition-all text-left template-card">
                <div class="text-4xl mb-3">${template.icon}</div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-2">${template.name}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${template.description}</p>
                <div class="flex flex-wrap gap-1">
                  ${template.features.slice(0, 3).map(feature => `
                    <span class="text-xs bg-${template.color}-100 dark:bg-${template.color}-900 text-${template.color}-700 dark:text-${template.color}-300 px-2 py-1 rounded">
                      ${feature}
                    </span>
                  `).join('')}
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Step 2: Información básica -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">2️⃣ Información básica</h3>
          <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título de la página *
              </label>
              <input type="text"
                     value="${this.tripData.title}"
                     placeholder="Mi viaje a..."
                     class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:bg-gray-700 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtítulo
              </label>
              <input type="text"
                     value="${this.tripData.subtitle}"
                     placeholder="Breve descripción..."
                     class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:bg-gray-700 dark:text-white">
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha inicio
                </label>
                <input type="date"
                       value="${this.tripData.dates.start}"
                       class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:bg-gray-700 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha fin
                </label>
                <input type="date"
                       value="${this.tripData.dates.end}"
                       class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:bg-gray-700 dark:text-white">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea rows="3"
                        placeholder="Cuenta sobre tu viaje..."
                        class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:bg-gray-700 dark:text-white">${this.tripData.description}</textarea>
            </div>
          </div>
        </div>

        <!-- Step 3: Seleccionar secciones -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">3️⃣ Secciones a incluir</h3>
          <div class="grid md:grid-cols-2 gap-3">
            ${Object.entries(this.SECTIONS).map(([key, section]) => `
              <label class="flex items-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-all">
                <input type="checkbox"
                       ${section.default ? 'checked' : ''}
                       class="rounded w-5 h-5 text-purple-600">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">${section.icon}</span>
                    <span class="font-medium text-gray-900 dark:text-white">${section.name}</span>
                  </div>
                </div>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Step 4: URL personalizada -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">4️⃣ URL personalizada</h3>
          <div class="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tu página estará disponible en:
            </label>
            <div class="flex items-center gap-2">
              <span class="text-gray-600 dark:text-gray-400">japantrip.app/</span>
              <input type="text"
                     placeholder="tu-viaje-japon"
                     value="japan-trip-2025"
                     class="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:bg-gray-700 dark:text-white">
            </div>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Solo letras, números y guiones. Debe ser único.
            </div>
          </div>
        </div>

        <!-- Step 5: Configuración de privacidad -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">5️⃣ Privacidad</h3>
          <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-3">
            <label class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Página pública</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Cualquiera con el link puede verla</div>
              </div>
              <input type="checkbox" checked class="rounded toggle">
            </label>

            <label class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Permitir comentarios</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Visitantes pueden dejar mensajes</div>
              </div>
              <input type="checkbox" checked class="rounded toggle">
            </label>

            <label class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Mostrar estadísticas</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Contador de visitas visible</div>
              </div>
              <input type="checkbox" class="rounded toggle">
            </label>

            <label class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Indexar en buscadores (SEO)</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Aparecer en Google</div>
              </div>
              <input type="checkbox" checked class="rounded toggle">
            </label>
          </div>
        </div>

        <!-- Step 6: Preview y Publicar -->
        <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-xl p-8 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold mb-2">6️⃣ ¡Todo listo!</h3>
              <p class="text-white/90">Previsualiza tu página antes de publicar</p>
            </div>
            <div class="flex gap-3">
              <button onclick="window.landingPageGenerator?.previewPage()"
                      class="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-lg transition-all">
                👁️ Preview
              </button>
              <button onclick="window.landingPageGenerator?.publishPage()"
                      class="px-8 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg">
                🚀 Publicar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza tab de páginas
   */
  renderPagesTab() {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">📄 Mis Páginas</h3>
          <button onclick="window.landingPageGenerator?.showTab('create')"
                  class="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all">
            ➕ Nueva página
          </button>
        </div>

        ${this.publishedPages.length > 0 ? `
          <div class="grid md:grid-cols-2 gap-6">
            ${this.publishedPages.map(page => this.renderPageCard(page)).join('')}
          </div>
        ` : `
          <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="text-6xl mb-4">🌐</div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Aún no has creado ninguna página</p>
            <button onclick="window.landingPageGenerator?.showTab('create')"
                    class="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all">
              Crear primera página
            </button>
          </div>
        `}
      </div>
    `;
  }

  /**
   * Renderiza una card de página
   */
  renderPageCard(page) {
    const template = this.TEMPLATES[page.template];

    return `
      <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-xl transition-all">
        <!-- Preview -->
        <div class="relative bg-gradient-to-br from-${template.color}-100 to-${template.color}-200 dark:from-${template.color}-900 dark:to-${template.color}-800 aspect-video flex items-center justify-center">
          <div class="text-6xl">${template.icon}</div>
          <div class="absolute top-2 right-2">
            <span class="px-3 py-1 ${page.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'} text-white rounded-full text-xs font-medium">
              ${page.status === 'published' ? '✓ Publicada' : '📝 Borrador'}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <h4 class="font-bold text-gray-900 dark:text-white mb-2">${page.title}</h4>

          <div class="flex items-center gap-2 mb-4">
            <span class="px-3 py-1 bg-${template.color}-100 dark:bg-${template.color}-900 text-${template.color}-700 dark:text-${template.color}-300 rounded-full text-xs font-medium">
              ${template.name}
            </span>
          </div>

          ${page.status === 'published' ? `
            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="text-center">
                <div class="font-bold text-lg text-gray-900 dark:text-white">${page.views}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Visitas</div>
              </div>
              <div class="text-center">
                <div class="font-bold text-lg text-gray-900 dark:text-white">${page.likes}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Likes</div>
              </div>
              <div class="text-center">
                <div class="font-bold text-lg text-gray-900 dark:text-white">${page.comments}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Comentarios</div>
              </div>
            </div>

            <!-- URL -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">URL:</div>
              <div class="flex items-center gap-2">
                <code class="text-sm text-purple-600 dark:text-purple-400 flex-1">japantrip.app/${page.url}</code>
                <button onclick="window.landingPageGenerator?.copyURL('${page.url}')"
                        class="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                  📋
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Actions -->
          <div class="grid grid-cols-2 gap-2">
            ${page.status === 'published' ? `
              <button onclick="window.landingPageGenerator?.viewPage('${page.id}')"
                      class="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg font-medium text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-all">
                👁️ Ver página
              </button>
            ` : `
              <button onclick="window.landingPageGenerator?.publishPageById('${page.id}')"
                      class="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg font-medium text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-all">
                🚀 Publicar
              </button>
            `}
            <button onclick="window.landingPageGenerator?.editPage('${page.id}')"
                    class="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg font-medium text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-all">
              ✏️ Editar
            </button>
            <button onclick="window.landingPageGenerator?.sharePage('${page.id}')"
                    class="px-4 py-2 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded-lg font-medium text-sm hover:bg-pink-200 dark:hover:bg-pink-800 transition-all">
              📤 Compartir
            </button>
            <button onclick="window.landingPageGenerator?.deletePage('${page.id}')"
                    class="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg font-medium text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-all">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza tab de analytics
   */
  renderAnalyticsTab() {
    const totalViews = this.publishedPages.reduce((sum, p) => sum + p.views, 0);
    const totalLikes = this.publishedPages.reduce((sum, p) => sum + p.likes, 0);
    const totalComments = this.publishedPages.reduce((sum, p) => sum + p.comments, 0);

    return `
      <div class="space-y-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">📊 Analytics</h3>

        <!-- Overview -->
        <div class="grid md:grid-cols-4 gap-4">
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div class="text-purple-600 dark:text-purple-400 text-sm font-medium mb-2">Total Visitas</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">${totalViews}</div>
          </div>

          <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-2 border-pink-200 dark:border-pink-800 rounded-xl p-6">
            <div class="text-pink-600 dark:text-pink-400 text-sm font-medium mb-2">Total Likes</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">${totalLikes}</div>
          </div>

          <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div class="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">Comentarios</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">${totalComments}</div>
          </div>

          <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
            <div class="text-green-600 dark:text-green-400 text-sm font-medium mb-2">Engagement</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">${totalViews > 0 ? Math.round(((totalLikes + totalComments) / totalViews) * 100) : 0}%</div>
          </div>
        </div>

        <!-- Top pages -->
        <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h4 class="font-bold text-gray-900 dark:text-white mb-4">🏆 Páginas más visitadas</h4>
          <div class="space-y-3">
            ${this.publishedPages
              .filter(p => p.status === 'published')
              .sort((a, b) => b.views - a.views)
              .map((page, index) => `
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400">
                      ${index + 1}
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">${page.title}</div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">${page.url}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-gray-900 dark:text-white">${page.views}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">visitas</div>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>

        <!-- Traffic sources (mock) -->
        <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h4 class="font-bold text-gray-900 dark:text-white mb-4">🌐 Fuentes de tráfico</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-700 dark:text-gray-300">📱 Redes sociales</span>
              <span class="font-bold text-gray-900 dark:text-white">45%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-700 dark:text-gray-300">🔗 Link directo</span>
              <span class="font-bold text-gray-900 dark:text-white">30%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-700 dark:text-gray-300">🔍 Búsqueda Google</span>
              <span class="font-bold text-gray-900 dark:text-white">15%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-700 dark:text-gray-300">📧 Email</span>
              <span class="font-bold text-gray-900 dark:text-white">10%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Cambia de tab
   */
  showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.className = 'px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button';
    });

    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
      activeTab.className = 'px-6 py-3 font-medium border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 tab-button';
    }

    // Update content
    const content = document.getElementById('landingContent');
    if (!content) return;

    switch(tabName) {
      case 'create':
        content.innerHTML = this.renderCreateTab();
        break;
      case 'pages':
        content.innerHTML = this.renderPagesTab();
        break;
      case 'analytics':
        content.innerHTML = this.renderAnalyticsTab();
        break;
    }
  }

  /**
   * Selecciona un template
   */
  selectTemplate(templateKey) {
    // Remove previous selection
    document.querySelectorAll('.template-card').forEach(card => {
      card.classList.remove('ring-4', 'ring-purple-500');
    });

    // Add selection to clicked card
    const card = document.getElementById(`template-${templateKey}`);
    if (card) {
      card.classList.add('ring-4', 'ring-purple-500');
    }

    this.currentPage = { ...this.currentPage, template: templateKey };
  }

  /**
   * Preview de la página
   */
  previewPage() {
    alert('👁️ Preview:\n\nAbrirá una preview interactiva de tu landing page en una nueva ventana.\n\nPodrás navegar por todas las secciones y ver cómo se verá antes de publicar.');
  }

  /**
   * Publica la página
   */
  publishPage() {
    // TODO: Implementar publicación real
    alert('🚀 Página publicada!\n\nTu landing page ya está disponible en:\njapantrip.app/japan-trip-2025\n\n¡Compártela con tus amigos!');

    // Mock: Agregar a páginas publicadas
    this.showTab('pages');
  }

  /**
   * Publica página por ID
   */
  publishPageById(pageId) {
    const page = this.publishedPages.find(p => p.id === pageId);
    if (page) {
      page.status = 'published';
      page.publishedAt = new Date().toISOString().split('T')[0];
      this.showTab('pages');
      alert('✓ Página publicada!');
    }
  }

  /**
   * Copia URL al portapapeles
   */
  copyURL(url) {
    navigator.clipboard.writeText(`japantrip.app/${url}`);
    alert('✓ URL copiada al portapapeles!');
  }

  /**
   * Ve una página publicada
   */
  viewPage(pageId) {
    const page = this.publishedPages.find(p => p.id === pageId);
    if (page) {
      alert(`🌐 Abriendo página:\njapantrip.app/${page.url}`);
    }
  }

  /**
   * Edita una página
   */
  editPage(pageId) {
    // TODO: Cargar datos de la página para editar
    this.showTab('create');
  }

  /**
   * Comparte una página
   */
  sharePage(pageId) {
    const page = this.publishedPages.find(p => p.id === pageId);
    if (!page) return;

    const url = `japantrip.app/${page.url}`;

    if (navigator.share) {
      navigator.share({
        title: page.title,
        text: `Check out my trip: ${page.title}`,
        url: url
      }).catch(err => console.log('Share cancelled'));
    } else {
      alert(`📤 Compartir página:\n\n• WhatsApp\n• Instagram\n• Twitter\n• Facebook\n• Copy link\n\n${url}`);
    }
  }

  /**
   * Elimina una página
   */
  deletePage(pageId) {
    if (confirm('¿Eliminar esta página?\n\nEsta acción no se puede deshacer.')) {
      this.publishedPages = this.publishedPages.filter(p => p.id !== pageId);
      this.showTab('pages');
    }
  }

  /**
   * Cierra el generador
   */
  close() {
    document.getElementById('landingPageModal')?.remove();
  }
}

// Exportar globalmente
window.LandingPageGenerator = LandingPageGenerator;

console.log('✅ Landing Page Generator loaded');

export default LandingPageGenerator;
