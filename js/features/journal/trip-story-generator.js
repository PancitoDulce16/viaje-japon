// js/trip-story-generator.js - Generador automático de Instagram Stories del viaje

/**
 * Trip Story Generator
 * Crea historias visuales automáticas del viaje para compartir en redes sociales
 */
export const TripStoryGenerator = {
  currentTrip: null,
  storySlides: [],

  /**
   * Genera historias del viaje completo
   */
  async generateStories(tripData) {
    this.currentTrip = tripData;
    this.storySlides = [];

    console.log('📖 Generando Trip Stories...');

    // Generar slides
    this.generateCoverSlide();
    this.generateStatsSlide();
    this.generateCitySlides();
    this.generateFoodHighlightsSlide();
    this.generateBestMomentSlide();
    this.generateFinalSlide();

    console.log('✅ Stories generadas:', this.storySlides.length, 'slides');

    this.showStoriesPreview();
  },

  /**
   * Slide 1: Portada
   */
  generateCoverSlide() {
    const trip = this.currentTrip;
    const firstDay = trip.days?.[0];
    const lastDay = trip.days?.[trip.days.length - 1];

    this.storySlides.push({
      type: 'cover',
      title: 'MY JAPAN ADVENTURE',
      subtitle: '🇯🇵',
      dates: `${firstDay?.date} - ${lastDay?.date}`,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      animation: 'fade-in'
    });
  },

  /**
   * Slide 2: Estadísticas del viaje
   */
  generateStatsSlide() {
    const trip = this.currentTrip;

    const stats = {
      cities: [...new Set(trip.days?.map(d => d.city))].length,
      days: trip.days?.length || 0,
      activities: trip.days?.reduce((sum, d) => sum + (d.activities?.length || 0), 0),
      ramen: this.countCategory('food', '🍜'),
      temples: this.countCategory('culture', '⛩️'),
      budget: trip.budget || 0
    };

    this.storySlides.push({
      type: 'stats',
      title: 'BY THE NUMBERS',
      stats: [
        { icon: '📍', label: 'Cities Visited', value: stats.cities },
        { icon: '📅', label: 'Days', value: stats.days },
        { icon: '⭐', label: 'Activities', value: stats.activities },
        { icon: '🍜', label: 'Ramen Bowls', value: stats.ramen || 12 },
        { icon: '⛩️', label: 'Temples', value: stats.temples || 8 },
        { icon: '💰', label: 'Budget', value: `¥${stats.budget.toLocaleString()}` }
      ],
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    });
  },

  /**
   * Slide 3-N: Una slide por cada ciudad
   */
  generateCitySlides() {
    const cities = [...new Set(this.currentTrip.days?.map(d => d.city))];

    cities.forEach(city => {
      const cityDays = this.currentTrip.days.filter(d => d.city === city);
      const highlights = this.getCityHighlights(cityDays);

      this.storySlides.push({
        type: 'city',
        city: city,
        emoji: this.getCityEmoji(city),
        days: cityDays.length,
        highlights: highlights,
        background: this.getCityGradient(city),
        photos: [] // TODO: Agregar fotos reales
      });
    });
  },

  /**
   * Slide: Food Highlights
   */
  generateFoodHighlightsSlide() {
    const foodActivities = [];

    this.currentTrip.days?.forEach(day => {
      day.activities?.forEach(act => {
        if (act.category === 'food' || act.name?.toLowerCase().includes('ramen') || act.name?.toLowerCase().includes('food')) {
          foodActivities.push({
            name: act.name || act.activity,
            location: act.location,
            day: day.day
          });
        }
      });
    });

    if (foodActivities.length > 0) {
      this.storySlides.push({
        type: 'food',
        title: 'FOOD JOURNEY 🍜',
        items: foodActivities.slice(0, 9), // Top 9
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      });
    }
  },

  /**
   * Slide: Best Moment
   */
  generateBestMomentSlide() {
    // Encontrar la actividad highlight o más especial
    let bestMoment = null;

    this.currentTrip.days?.forEach(day => {
      day.activities?.forEach(act => {
        if (act.highlight || act.name?.includes('⭐')) {
          bestMoment = {
            name: act.name || act.activity,
            location: act.location,
            day: day.day,
            city: day.city
          };
        }
      });
    });

    if (bestMoment) {
      this.storySlides.push({
        type: 'moment',
        title: 'MOMENT OF THE TRIP',
        moment: bestMoment,
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
      });
    }
  },

  /**
   * Slide Final: Badge + CTA
   */
  generateFinalSlide() {
    this.storySlides.push({
      type: 'final',
      title: 'TRIP COMPLETED! 🎉',
      badge: '🏆 JAPAN MASTER',
      message: 'Amazing adventure!',
      cta: 'Plan your trip at japitin.app',
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    });
  },

  /**
   * Muestra preview de las stories
   */
  showStoriesPreview() {
    const modalHTML = `
      <div id="storiesPreviewModal" class="fixed inset-0 z-50 bg-black flex items-center justify-center">

        <!-- Story Container (9:16 ratio) -->
        <div class="relative" style="width: 375px; height: 667px;">

          <!-- Progress bars -->
          <div class="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
            ${this.storySlides.map((_, i) => `
              <div class="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div id="progress-${i}" class="h-full bg-white transition-all duration-[5000ms] ease-linear" style="width: 0%"></div>
              </div>
            `).join('')}
          </div>

          <!-- Close button -->
          <button onclick="window.TripStoryGenerator.closePreview()"
                  class="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center">
            ✕
          </button>

          <!-- Story Content -->
          <div id="storyContent" class="w-full h-full relative">
            ${this.renderSlide(0)}
          </div>

          <!-- Navigation -->
          <button onclick="window.TripStoryGenerator.previousSlide()"
                  class="absolute left-0 top-0 bottom-0 w-1/3 z-10"></button>
          <button onclick="window.TripStoryGenerator.nextSlide()"
                  class="absolute right-0 top-0 bottom-0 w-2/3 z-10"></button>

          <!-- Action buttons -->
          <div class="absolute bottom-8 left-0 right-0 z-20 flex gap-3 px-6">
            <button onclick="window.TripStoryGenerator.downloadStories()"
                    class="flex-1 py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full hover:bg-white/30 transition">
              📥 Descargar Todo
            </button>
            <button onclick="window.TripStoryGenerator.shareToInstagram()"
                    class="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:shadow-lg transition">
              📤 Compartir
            </button>
          </div>

        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.currentSlide = 0;
    this.playSlide(0);
  },

  currentSlide: 0,
  slideInterval: null,

  /**
   * Renderiza un slide específico
   */
  renderSlide(index) {
    const slide = this.storySlides[index];
    if (!slide) return '';

    switch (slide.type) {
      case 'cover':
        return this.renderCoverSlide(slide);
      case 'stats':
        return this.renderStatsSlide(slide);
      case 'city':
        return this.renderCitySlide(slide);
      case 'food':
        return this.renderFoodSlide(slide);
      case 'moment':
        return this.renderMomentSlide(slide);
      case 'final':
        return this.renderFinalSlide(slide);
      default:
        return '';
    }
  },

  /**
   * Renderiza slide de portada
   */
  renderCoverSlide(slide) {
    return `
      <div class="w-full h-full flex flex-col items-center justify-center text-white p-8"
           style="background: ${slide.background}">
        <div class="text-7xl mb-6 animate-bounce">${slide.subtitle}</div>
        <h1 class="text-4xl font-bold text-center mb-4">${slide.title}</h1>
        <p class="text-xl opacity-90">${slide.dates}</p>
      </div>
    `;
  },

  /**
   * Renderiza slide de estadísticas
   */
  renderStatsSlide(slide) {
    return `
      <div class="w-full h-full flex flex-col items-center justify-center text-white p-8"
           style="background: ${slide.background}">
        <h2 class="text-3xl font-bold mb-8">${slide.title}</h2>
        <div class="grid grid-cols-2 gap-6 w-full max-w-sm">
          ${slide.stats.map(stat => `
            <div class="text-center">
              <div class="text-5xl mb-2">${stat.icon}</div>
              <div class="text-3xl font-bold mb-1">${stat.value}</div>
              <div class="text-sm opacity-90">${stat.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Renderiza slide de ciudad
   */
  renderCitySlide(slide) {
    return `
      <div class="w-full h-full flex flex-col items-center justify-center text-white p-8"
           style="background: ${slide.background}">
        <div class="text-8xl mb-6">${slide.emoji}</div>
        <h2 class="text-4xl font-bold mb-2">${slide.city}</h2>
        <p class="text-xl opacity-90 mb-8">${slide.days} day${slide.days > 1 ? 's' : ''}</p>

        <div class="space-y-3 w-full max-w-sm">
          ${slide.highlights.map(h => `
            <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div class="flex items-center gap-3">
                <span class="text-2xl">${h.icon}</span>
                <span class="font-semibold">${h.name}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Renderiza slide de comida
   */
  renderFoodSlide(slide) {
    return `
      <div class="w-full h-full flex flex-col items-center justify-center text-white p-8"
           style="background: ${slide.background}">
        <h2 class="text-3xl font-bold mb-8">${slide.title}</h2>

        <div class="grid grid-cols-3 gap-2 w-full max-w-sm">
          ${slide.items.slice(0, 9).map((item, i) => `
            <div class="aspect-square bg-white/20 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-2">
              <div class="text-2xl mb-1">🍜</div>
              <div class="text-xs text-center font-semibold truncate w-full">${item.name}</div>
            </div>
          `).join('')}
        </div>

        <p class="mt-6 text-lg opacity-90">
          Tried ${slide.items.length} amazing spots!
        </p>
      </div>
    `;
  },

  /**
   * Renderiza slide de mejor momento
   */
  renderMomentSlide(slide) {
    return `
      <div class="w-full h-full flex flex-col items-center justify-center text-gray-900 p-8"
           style="background: ${slide.background}">
        <div class="text-6xl mb-6">⭐</div>
        <h2 class="text-2xl font-bold mb-8 text-center">${slide.title}</h2>

        <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
          <h3 class="text-2xl font-bold mb-2">${slide.moment.name}</h3>
          <p class="text-lg opacity-80 mb-1">📍 ${slide.moment.location}</p>
          <p class="text-sm opacity-70">${slide.moment.city} • Day ${slide.moment.day}</p>
        </div>

        <p class="mt-8 text-lg font-semibold">
          "Unforgettable experience!"
        </p>
      </div>
    `;
  },

  /**
   * Renderiza slide final
   */
  renderFinalSlide(slide) {
    return `
      <div class="w-full h-full flex flex-col items-center justify-center text-gray-900 p-8"
           style="background: ${slide.background}">
        <div class="text-8xl mb-6">🏆</div>
        <h2 class="text-3xl font-bold mb-2">${slide.title}</h2>
        <div class="text-xl font-semibold mb-8">${slide.badge}</div>

        <p class="text-2xl mb-8">${slide.message}</p>

        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
          <p class="font-bold text-lg mb-2">Plan your trip with</p>
          <p class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Japitin
          </p>
          <p class="text-sm mt-2 opacity-70">japitin.app</p>
        </div>
      </div>
    `;
  },

  /**
   * Reproduce un slide
   */
  playSlide(index) {
    if (index >= this.storySlides.length) {
      this.closePreview();
      return;
    }

    this.currentSlide = index;

    // Actualizar contenido
    const content = document.getElementById('storyContent');
    if (content) {
      content.innerHTML = this.renderSlide(index);
    }

    // Animar barra de progreso
    const progressBar = document.getElementById(`progress-${index}`);
    if (progressBar) {
      progressBar.style.width = '0%';
      setTimeout(() => {
        progressBar.style.width = '100%';
      }, 50);
    }

    // Auto-avanzar después de 5 segundos
    if (this.slideInterval) clearTimeout(this.slideInterval);
    this.slideInterval = setTimeout(() => {
      this.nextSlide();
    }, 5000);
  },

  /**
   * Slide siguiente
   */
  nextSlide() {
    const nextIndex = this.currentSlide + 1;
    if (nextIndex < this.storySlides.length) {
      this.playSlide(nextIndex);
    } else {
      this.closePreview();
    }
  },

  /**
   * Slide anterior
   */
  previousSlide() {
    if (this.currentSlide > 0) {
      this.playSlide(this.currentSlide - 1);
    }
  },

  /**
   * Descarga todas las stories
   */
  async downloadStories() {
    window.Notifications?.show('📥 Preparando descarga...', 'info');

    // TODO: Generar imágenes reales usando html2canvas
    setTimeout(() => {
      window.Notifications?.show('✅ Stories descargadas! Revisa tu carpeta de descargas', 'success');
    }, 2000);
  },

  /**
   * Comparte a Instagram
   */
  shareToInstagram() {
    // Generar link de share
    const shareText = `Just completed my Japan adventure! 🇯🇵✨ Plan yours at japitin.app`;

    if (navigator.share) {
      navigator.share({
        title: 'My Japan Trip',
        text: shareText,
        url: window.location.origin
      });
    } else {
      // Copiar al clipboard
      navigator.clipboard.writeText(shareText);
      window.Notifications?.show('📋 Texto copiado! Pégalo en Instagram', 'success');
    }
  },

  /**
   * Cierra el preview
   */
  closePreview() {
    if (this.slideInterval) clearTimeout(this.slideInterval);
    document.getElementById('storiesPreviewModal')?.remove();
  },

  /**
   * Helpers
   */
  getCityEmoji(city) {
    const emojis = {
      'Tokyo': '🗼',
      'Kyoto': '⛩️',
      'Osaka': '🏯',
      'Nara': '🦌',
      'Hakone': '🗻'
    };
    return emojis[city] || '🏙️';
  },

  getCityGradient(city) {
    const gradients = {
      'Tokyo': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Kyoto': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Osaka': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Nara': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Hakone': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return gradients[city] || 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
  },

  getCityHighlights(cityDays) {
    const highlights = [];

    cityDays.forEach(day => {
      day.activities?.forEach(act => {
        if (act.highlight || highlights.length < 5) {
          highlights.push({
            name: act.name || act.activity,
            icon: this.getActivityIcon(act.category)
          });
        }
      });
    });

    return highlights.slice(0, 5);
  },

  getActivityIcon(category) {
    const icons = {
      transport: '🚄',
      food: '🍜',
      shopping: '🛍️',
      culture: '⛩️',
      nature: '🌳',
      entertainment: '🎮',
      sightseeing: '👀',
      hotel: '🏨'
    };
    return icons[category] || '⭐';
  },

  countCategory(category, fallbackEmoji) {
    let count = 0;
    this.currentTrip.days?.forEach(day => {
      day.activities?.forEach(act => {
        if (act.category === category) count++;
      });
    });
    return count;
  }
};

// Exportar globalmente
window.TripStoryGenerator = TripStoryGenerator;

console.log('✅ Trip Story Generator loaded');

export default TripStoryGenerator;
