/**
 * AI Video Montage Creator
 * Creador automático de montajes de video usando AI
 */

class VideoMontageCreator {
  constructor() {
    this.uploadedMedia = [];
    this.selectedMedia = [];
    this.currentMontage = null;
    this.generatedMontages = [];

    // Estilos de montaje
    this.MONTAGE_STYLES = {
      cinematic: {
        name: 'Cinemático',
        icon: '🎬',
        description: 'Transiciones suaves, música épica, slow-motion',
        duration: '3-5 min',
        music: ['Epic', 'Orchestral', 'Emotional'],
        transitions: ['Fade', 'Cross dissolve', 'Zoom'],
        pacing: 'slow',
        color: 'purple'
      },
      vlog: {
        name: 'Vlog Style',
        icon: '📹',
        description: 'Rápido, dinámico, con text overlays',
        duration: '1-2 min',
        music: ['Upbeat', 'Pop', 'Electronic'],
        transitions: ['Cut', 'Whip pan', 'Jump cut'],
        pacing: 'fast',
        color: 'pink'
      },
      timelapse: {
        name: 'Time-lapse',
        icon: '⏱️',
        description: 'Día completo en segundos, hyperlapse',
        duration: '30-60 sec',
        music: ['Ambient', 'Electronic', 'Minimal'],
        transitions: ['Fade', 'Speed ramp'],
        pacing: 'very-fast',
        color: 'blue'
      },
      story: {
        name: 'Story-based',
        icon: '📖',
        description: 'Narrativa cronológica, text captions',
        duration: '2-4 min',
        music: ['Indie', 'Acoustic', 'Chill'],
        transitions: ['Fade', 'Slide', 'Book flip'],
        pacing: 'moderate',
        color: 'green'
      },
      aesthetic: {
        name: 'Aesthetic',
        icon: '✨',
        description: 'Visual artístico, filters, color grading',
        duration: '1-3 min',
        music: ['Lo-fi', 'Indie', 'Dream pop'],
        transitions: ['Glitch', 'Film burn', 'Light leak'],
        pacing: 'slow',
        color: 'orange'
      },
      highlights: {
        name: 'Best Moments',
        icon: '⭐',
        description: 'Solo los mejores momentos, impactante',
        duration: '60-90 sec',
        music: ['Upbeat', 'Happy', 'Inspiring'],
        transitions: ['Cut', 'Beat sync', 'Flash'],
        pacing: 'fast',
        color: 'yellow'
      }
    };

    // Música disponible (categorías)
    this.MUSIC_LIBRARY = {
      epic: ['Journey Begins', 'Mountains Call', 'Dreams Take Flight'],
      upbeat: ['Summer Vibes', 'Good Times', 'Adventure Awaits'],
      chill: ['Lazy Days', 'Coffee Shop', 'Sunset Drive'],
      lofi: ['Tokyo Night', 'Study Beats', 'Rain on Window'],
      ambient: ['Space Between', 'Floating', 'Horizon'],
      emotional: ['Memories', 'Coming Home', 'First Light']
    };

    // Formatos de exportación
    this.EXPORT_FORMATS = {
      instagram_story: { name: 'Instagram Story', ratio: '9:16', resolution: '1080x1920' },
      instagram_feed: { name: 'Instagram Feed', ratio: '1:1', resolution: '1080x1080' },
      instagram_reel: { name: 'Instagram Reel', ratio: '9:16', resolution: '1080x1920' },
      youtube: { name: 'YouTube', ratio: '16:9', resolution: '1920x1080' },
      tiktok: { name: 'TikTok', ratio: '9:16', resolution: '1080x1920' },
      twitter: { name: 'Twitter', ratio: '16:9', resolution: '1280x720' }
    };

    this.initMockData();
  }

  /**
   * Inicializa datos mock
   */
  initMockData() {
    // Media subida (mock)
    this.uploadedMedia = [
      {
        id: 'media1',
        type: 'photo',
        thumbnail: '📸',
        location: 'Shibuya Crossing',
        date: '2025-02-15',
        time: '18:30',
        duration: null,
        aiScore: 95, // Puntuación AI de calidad
        aiTags: ['iconic', 'people', 'urban', 'night'],
        selected: true
      },
      {
        id: 'media2',
        type: 'video',
        thumbnail: '🎥',
        location: 'Fushimi Inari',
        date: '2025-02-16',
        time: '08:00',
        duration: 15,
        aiScore: 98,
        aiTags: ['scenic', 'cultural', 'peaceful', 'temple'],
        selected: true
      },
      {
        id: 'media3',
        type: 'photo',
        thumbnail: '🍜',
        location: 'Ichiran Ramen',
        date: '2025-02-15',
        time: '20:00',
        duration: null,
        aiScore: 87,
        aiTags: ['food', 'ramen', 'indoor'],
        selected: true
      },
      {
        id: 'media4',
        type: 'video',
        thumbnail: '🌸',
        location: 'Shinjuku Gyoen',
        date: '2025-02-17',
        time: '14:00',
        duration: 23,
        aiScore: 92,
        aiTags: ['nature', 'sakura', 'peaceful', 'park'],
        selected: true
      },
      {
        id: 'media5',
        type: 'photo',
        thumbnail: '🏯',
        location: 'Tokyo Tower',
        date: '2025-02-16',
        time: '19:45',
        duration: null,
        aiScore: 90,
        aiTags: ['landmark', 'night', 'iconic', 'city'],
        selected: false
      },
      {
        id: 'media6',
        type: 'video',
        thumbnail: '🎮',
        location: 'Akihabara',
        date: '2025-02-17',
        time: '16:30',
        duration: 18,
        aiScore: 85,
        aiTags: ['gaming', 'urban', 'neon', 'culture'],
        selected: false
      }
    ];

    // Montajes generados previamente
    this.generatedMontages = [
      {
        id: 'montage1',
        title: 'Tokyo Adventures - Day 1',
        style: 'cinematic',
        duration: 180,
        format: 'youtube',
        createdAt: '2025-02-16',
        thumbnail: '🎬',
        views: 0,
        status: 'ready'
      },
      {
        id: 'montage2',
        title: 'Best Food Moments',
        style: 'vlog',
        duration: 90,
        format: 'instagram_reel',
        createdAt: '2025-02-17',
        thumbnail: '🍜',
        views: 0,
        status: 'ready'
      }
    ];
  }

  /**
   * Abre el Video Montage Creator
   */
  open() {
    const modal = document.createElement('div');
    modal.id = 'videoMontageModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-strong flex items-center justify-center z-50 p-4 animate-fadeInUp';

    modal.innerHTML = `
      <div class="glass-card rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col glow-pink hover-lift">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 gradient-animated text-white p-6 relative overflow-hidden">
          <div class="shimmer absolute inset-0"></div>
          <div class="relative z-10">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold mb-2">🎬 AI Video Montage Creator</h2>
              <p class="text-white/90">Crea montajes épicos automáticamente con AI</p>
            </div>
            <button onclick="window.videoMontageCreator?.close()" class="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Stats -->
          <div class="mt-4 grid grid-cols-3 gap-4">
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.uploadedMedia.length}</div>
              <div class="text-sm text-white/80">Media files</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.uploadedMedia.filter(m => m.selected).length}</div>
              <div class="text-sm text-white/80">Seleccionados</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.generatedMontages.length}</div>
              <div class="text-sm text-white/80">Montages creados</div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <div class="flex">
            <button onclick="window.videoMontageCreator?.showTab('create')"
                    id="tab-create"
                    class="px-6 py-3 font-medium border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 tab-button">
              ✨ Crear Montage
            </button>
            <button onclick="window.videoMontageCreator?.showTab('media')"
                    id="tab-media"
                    class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button">
              📁 Mi Media
            </button>
            <button onclick="window.videoMontageCreator?.showTab('generated')"
                    id="tab-generated"
                    class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button">
              🎞️ Mis Montages
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6" id="montageContent">
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
    const selectedCount = this.uploadedMedia.filter(m => m.selected).length;

    return `
      <div class="space-y-6">
        <!-- Step 1: Seleccionar estilo -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">1️⃣ Selecciona el estilo</h3>
          <div class="grid md:grid-cols-3 gap-4">
            ${Object.entries(this.MONTAGE_STYLES).map(([key, style]) => `
              <button onclick="window.videoMontageCreator?.selectStyle('${key}')"
                      id="style-${key}"
                      class="bg-gradient-to-br from-${style.color}-50 to-white dark:from-${style.color}-900/20 dark:to-gray-800 border-2 border-${style.color}-200 dark:border-${style.color}-800 rounded-xl p-6 hover:shadow-lg transition-all text-left style-card">
                <div class="text-4xl mb-3">${style.icon}</div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-2">${style.name}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${style.description}</p>
                <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>⏱️ ${style.duration}</span>
                  <span>•</span>
                  <span>🎵 ${style.music[0]}</span>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Step 2: AI Auto-select o manual -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">2️⃣ Selecciona el contenido</h3>

          <div class="flex gap-4 mb-6">
            <button onclick="window.videoMontageCreator?.aiAutoSelect()"
                    class="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-4 rounded-xl transition-all shadow-lg">
              🤖 AI Auto-Select (Recomendado)
            </button>
            <button onclick="window.videoMontageCreator?.showTab('media')"
                    class="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-4 rounded-xl transition-all">
              ✋ Selección Manual
            </button>
          </div>

          <!-- Selected media preview -->
          ${selectedCount > 0 ? `
            <div class="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-bold text-gray-900 dark:text-white">✓ ${selectedCount} archivos seleccionados</h4>
                <button onclick="window.videoMontageCreator?.clearSelection()"
                        class="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  Limpiar selección
                </button>
              </div>
              <div class="grid grid-cols-6 gap-2">
                ${this.uploadedMedia.filter(m => m.selected).map(media => `
                  <div class="aspect-square bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center text-3xl relative">
                    ${media.thumbnail}
                    ${media.type === 'video' ? '<div class="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">${media.duration}s</div>' : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div class="text-4xl mb-2">📸</div>
              <p class="text-gray-600 dark:text-gray-400">No hay archivos seleccionados</p>
            </div>
          `}
        </div>

        <!-- Step 3: Personalización -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">3️⃣ Personaliza (opcional)</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <!-- Music -->
            <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                🎵 Música
              </label>
              <select class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:bg-gray-700 dark:text-white">
                <option>🤖 AI selecciona la mejor</option>
                ${Object.entries(this.MUSIC_LIBRARY).map(([genre, songs]) => `
                  <optgroup label="${genre}">
                    ${songs.map(song => `<option>${song}</option>`).join('')}
                  </optgroup>
                `).join('')}
              </select>
            </div>

            <!-- Format -->
            <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                📱 Formato de exportación
              </label>
              <select class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:bg-gray-700 dark:text-white">
                ${Object.entries(this.EXPORT_FORMATS).map(([key, format]) => `
                  <option value="${key}">${format.name} (${format.ratio})</option>
                `).join('')}
              </select>
            </div>

            <!-- Title -->
            <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                ✍️ Título del montage
              </label>
              <input type="text"
                     placeholder="Mi viaje a Japón 🇯🇵"
                     class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:bg-gray-700 dark:text-white">
            </div>

            <!-- Text overlays -->
            <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                📝 Text overlays
              </label>
              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input type="checkbox" checked class="rounded">
                  <span class="text-sm text-gray-700 dark:text-gray-300">Mostrar ubicaciones</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" checked class="rounded">
                  <span class="text-sm text-gray-700 dark:text-gray-300">Mostrar fechas</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="rounded">
                  <span class="text-sm text-gray-700 dark:text-gray-300">Añadir intro/outro</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Generate -->
        <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl p-8 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold mb-2">4️⃣ ¡Listo para generar!</h3>
              <p class="text-white/90">La AI creará tu montage en ~2-3 minutos</p>
            </div>
            <button onclick="window.videoMontageCreator?.generateMontage()"
                    ${selectedCount === 0 ? 'disabled' : ''}
                    class="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              🚀 Generar Montage
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza tab de media
   */
  renderMediaTab() {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">📁 Tu Media</h3>
          <button onclick="window.videoMontageCreator?.uploadMedia()"
                  class="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all">
            ➕ Subir archivos
          </button>
        </div>

        <!-- Filters -->
        <div class="flex gap-2">
          <button class="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg font-medium text-sm">
            Todos (${this.uploadedMedia.length})
          </button>
          <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm">
            Fotos (${this.uploadedMedia.filter(m => m.type === 'photo').length})
          </button>
          <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm">
            Videos (${this.uploadedMedia.filter(m => m.type === 'video').length})
          </button>
          <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm">
            Seleccionados (${this.uploadedMedia.filter(m => m.selected).length})
          </button>
        </div>

        <!-- Media grid -->
        <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          ${this.uploadedMedia.map(media => this.renderMediaCard(media)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza una card de media
   */
  renderMediaCard(media) {
    return `
      <div onclick="window.videoMontageCreator?.toggleMediaSelection('${media.id}')"
           class="relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl flex items-center justify-center text-5xl cursor-pointer hover:scale-105 transition-all ${media.selected ? 'ring-4 ring-purple-500' : ''}">
        ${media.thumbnail}

        ${media.type === 'video' ? `
          <div class="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            ${media.duration}s
          </div>
        ` : ''}

        ${media.selected ? `
          <div class="absolute top-2 right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
            ✓
          </div>
        ` : ''}

        <!-- AI Score -->
        <div class="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          🤖 ${media.aiScore}
        </div>

        <!-- Info overlay on hover -->
        <div class="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity rounded-xl p-3 flex flex-col justify-end">
          <div class="text-white text-xs space-y-1">
            <div class="font-bold">${media.location}</div>
            <div>${media.date} ${media.time}</div>
            <div class="flex flex-wrap gap-1">
              ${media.aiTags.slice(0, 2).map(tag => `
                <span class="bg-white/20 px-1 rounded">#${tag}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza tab de montages generados
   */
  renderGeneratedTab() {
    return `
      <div class="space-y-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">🎞️ Mis Montages</h3>

        ${this.generatedMontages.length > 0 ? `
          <div class="grid md:grid-cols-2 gap-6">
            ${this.generatedMontages.map(montage => this.renderMontageCard(montage)).join('')}
          </div>
        ` : `
          <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="text-6xl mb-4">🎬</div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Aún no has creado ningún montage</p>
            <button onclick="window.videoMontageCreator?.showTab('create')"
                    class="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all">
              Crear primer montage
            </button>
          </div>
        `}
      </div>
    `;
  }

  /**
   * Renderiza una card de montage
   */
  renderMontageCard(montage) {
    const style = this.MONTAGE_STYLES[montage.style];
    const format = this.EXPORT_FORMATS[montage.format];

    return `
      <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-xl transition-all">
        <!-- Thumbnail -->
        <div class="relative bg-gradient-to-br from-${style.color}-100 to-${style.color}-200 dark:from-${style.color}-900 dark:to-${style.color}-800 aspect-video flex items-center justify-center">
          <div class="text-7xl">${montage.thumbnail}</div>
          <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            ${Math.floor(montage.duration / 60)}:${(montage.duration % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <h4 class="font-bold text-gray-900 dark:text-white mb-2">${montage.title}</h4>

          <div class="flex items-center gap-2 mb-4">
            <span class="px-3 py-1 bg-${style.color}-100 dark:bg-${style.color}-900 text-${style.color}-700 dark:text-${style.color}-300 rounded-full text-xs font-medium">
              ${style.icon} ${style.name}
            </span>
            <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
              ${format.ratio}
            </span>
          </div>

          <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Creado: ${montage.createdAt}
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-2 gap-2">
            <button onclick="window.videoMontageCreator?.playMontage('${montage.id}')"
                    class="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg font-medium text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-all">
              ▶️ Ver
            </button>
            <button onclick="window.videoMontageCreator?.downloadMontage('${montage.id}')"
                    class="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg font-medium text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-all">
              ⬇️ Descargar
            </button>
            <button onclick="window.videoMontageCreator?.shareMontage('${montage.id}')"
                    class="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg font-medium text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-all">
              📤 Compartir
            </button>
            <button onclick="window.videoMontageCreator?.deleteMontage('${montage.id}')"
                    class="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg font-medium text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-all">
              🗑️ Eliminar
            </button>
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
    const content = document.getElementById('montageContent');
    if (!content) return;

    switch(tabName) {
      case 'create':
        content.innerHTML = this.renderCreateTab();
        break;
      case 'media':
        content.innerHTML = this.renderMediaTab();
        break;
      case 'generated':
        content.innerHTML = this.renderGeneratedTab();
        break;
    }
  }

  /**
   * Selecciona un estilo de montage
   */
  selectStyle(styleKey) {
    // Remove previous selection
    document.querySelectorAll('.style-card').forEach(card => {
      card.classList.remove('ring-4', 'ring-purple-500');
    });

    // Add selection to clicked card
    const card = document.getElementById(`style-${styleKey}`);
    if (card) {
      card.classList.add('ring-4', 'ring-purple-500');
    }

    this.currentMontage = { ...this.currentMontage, style: styleKey };
  }

  /**
   * AI auto-selecciona el mejor contenido
   */
  aiAutoSelect() {
    // Simula AI selection basada en scores
    this.uploadedMedia.forEach(media => {
      media.selected = media.aiScore >= 90;
    });

    this.showTab('create');
    alert('✨ AI seleccionó los mejores momentos basándose en calidad, composición y relevancia!');
  }

  /**
   * Toggle selección de media
   */
  toggleMediaSelection(mediaId) {
    const media = this.uploadedMedia.find(m => m.id === mediaId);
    if (media) {
      media.selected = !media.selected;
      this.showTab('media');
    }
  }

  /**
   * Limpia selección
   */
  clearSelection() {
    this.uploadedMedia.forEach(m => m.selected = false);
    this.showTab('create');
  }

  /**
   * Sube media
   */
  uploadMedia() {
    alert('📁 Upload dialog coming soon!\n\nSoporta: MP4, MOV, JPG, PNG\nMax 100MB por archivo');
  }

  /**
   * Genera el montage
   */
  generateMontage() {
    const selectedMedia = this.uploadedMedia.filter(m => m.selected);

    if (selectedMedia.length === 0) {
      alert('⚠️ Selecciona al menos un archivo para el montage');
      return;
    }

    // Simular proceso de generación
    alert('🎬 Generando montage...\n\n✓ Analizando contenido con AI\n✓ Seleccionando mejores momentos\n✓ Sincronizando con música\n✓ Aplicando transiciones\n✓ Renderizando video\n\nEsto tomará ~2-3 minutos. Te avisaremos cuando esté listo!');

    // TODO: Implementar generación real con API de video processing
    // Agregar a montages generados (mock)
    setTimeout(() => {
      this.generatedMontages.unshift({
        id: `montage${Date.now()}`,
        title: 'New Montage',
        style: this.currentMontage?.style || 'cinematic',
        duration: 120,
        format: 'youtube',
        createdAt: new Date().toISOString().split('T')[0],
        thumbnail: '🎬',
        views: 0,
        status: 'ready'
      });

      alert('✅ ¡Montage listo!');
      this.showTab('generated');
    }, 3000);
  }

  /**
   * Reproduce un montage
   */
  playMontage(montageId) {
    alert('▶️ Video player coming soon!');
  }

  /**
   * Descarga un montage
   */
  downloadMontage(montageId) {
    alert('⬇️ Descargando montage...');
  }

  /**
   * Comparte un montage
   */
  shareMontage(montageId) {
    alert('📤 Share options:\n\n• Instagram\n• TikTok\n• YouTube\n• Twitter\n• Copy link');
  }

  /**
   * Elimina un montage
   */
  deleteMontage(montageId) {
    if (confirm('¿Eliminar este montage?')) {
      this.generatedMontages = this.generatedMontages.filter(m => m.id !== montageId);
      this.showTab('generated');
    }
  }

  /**
   * Cierra el creator
   */
  close() {
    document.getElementById('videoMontageModal')?.remove();
  }
}

// Exportar globalmente
window.VideoMontageCreator = VideoMontageCreator;

console.log('✅ Video Montage Creator loaded');

export default VideoMontageCreator;
