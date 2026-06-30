/**
 * 📸 INSTAGRAM-LIKE TIMELINE
 * ==========================
 *
 * Visual timeline inspired by Instagram's interface
 * Shows trip activities as a social media feed
 */

class InstagramTimeline {
  constructor() {
    this.posts = [];
    this.currentItinerary = null;
    this.isOpen = false;
  }

  /**
   * Open the Instagram timeline
   */
  async open() {
    // Intentar cargar el itinerario si existe la función
    if (window.ItineraryV3 && window.ItineraryV3.loadItinerary) {
      try {
        await window.ItineraryV3.loadItinerary();
      } catch (err) {
        console.warn('No se pudo cargar con ItineraryV3.loadItinerary');
      }
    }

    this.currentItinerary = this.getCurrentItinerary();

    if (!this.currentItinerary || !this.currentItinerary.days || this.currentItinerary.days.length === 0) {
      if (window.showToast) {
        window.showToast('⚠️ Crea un itinerario primero para ver tu timeline', 'warning', 3000);
      } else {
        alert('Crea un itinerario primero para ver tu timeline');
      }
      return;
    }

    this.generatePosts();
    this.render();
    this.isOpen = true;
  }

  /**
   * Close the timeline
   */
  close() {
    const modal = document.getElementById('instagram-timeline-modal');
    if (modal) modal.remove();
    this.isOpen = false;
  }

  /**
   * Get current itinerary from app
   */
  getCurrentItinerary() {
    console.log('📸 Instagram Timeline: Trying to get itinerary...');

    // Try multiple sources with detailed logging

    // 1. Try ItineraryV3.currentItinerary (PRIMERO - más actualizado)
    if (window.ItineraryV3 && window.ItineraryV3.currentItinerary) {
      console.log('Found ItineraryV3.currentItinerary:', window.ItineraryV3.currentItinerary);
      if (window.ItineraryV3.currentItinerary.days && window.ItineraryV3.currentItinerary.days.length > 0) {
        console.log('✅ Using ItineraryV3.currentItinerary with', window.ItineraryV3.currentItinerary.days.length, 'days');
        return window.ItineraryV3.currentItinerary;
      }
    }

    // 2. Try window.currentItinerary
    if (window.currentItinerary) {
      console.log('Found window.currentItinerary:', window.currentItinerary);
      if (window.currentItinerary.days && window.currentItinerary.days.length > 0) {
        console.log('✅ Using window.currentItinerary with', window.currentItinerary.days.length, 'days');
        return window.currentItinerary;
      } else {
        console.warn('⚠️ window.currentItinerary exists but has no days');
      }
    }

    // 3. Try TripsManager.currentTrip (pero probablemente no tenga days)
    if (window.TripsManager) {
      console.log('Found window.TripsManager');
      if (window.TripsManager.currentTrip) {
        console.log('Found TripsManager.currentTrip:', window.TripsManager.currentTrip);
        if (window.TripsManager.currentTrip.days && window.TripsManager.currentTrip.days.length > 0) {
          console.log('✅ Using TripsManager.currentTrip with', window.TripsManager.currentTrip.days.length, 'days');
          return window.TripsManager.currentTrip;
        }
      }
    }

    // 4. Try legacy ItineraryManager
    if (window.ItineraryManager && window.ItineraryManager.getCurrentItinerary) {
      const itinerary = window.ItineraryManager.getCurrentItinerary();
      console.log('ItineraryManager returned:', itinerary);
      if (itinerary && itinerary.days && itinerary.days.length > 0) {
        console.log('✅ Using ItineraryManager with', itinerary.days.length, 'days');
        return itinerary;
      }
    }

    console.error('❌ No itinerary found from any source');
    return null;
  }

  /**
   * Generate posts from itinerary
   */
  generatePosts() {
    this.posts = [];

    this.currentItinerary.days.forEach((day, dayIndex) => {
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((activity, activityIndex) => {
          this.posts.push({
            id: `post-${dayIndex}-${activityIndex}`,
            dayNumber: dayIndex + 1,
            date: day.date,
            activity: activity,
            likes: Math.floor(Math.random() * 200) + 50,
            hasLiked: Math.random() > 0.5,
            caption: this.generateCaption(activity, dayIndex + 1),
            image: this.getActivityImage(activity),
            time: this.generateTimeAgo(dayIndex)
          });
        });
      }
    });
  }

  /**
   * Generate caption for activity
   */
  generateCaption(activity, dayNumber) {
    const captions = {
      temple: [
        `Día ${dayNumber} en ${activity.name} ⛩️ La paz y tranquilidad de este lugar es increíble`,
        `Visitando ${activity.name} 🙏 Un lugar lleno de historia y espiritualidad`,
        `${activity.name} ✨ Cada templo en Japón cuenta una historia fascinante`
      ],
      restaurant: [
        `¡Comiendo en ${activity.name}! 🍜 La comida japonesa nunca decepciona`,
        `${activity.name} 😋 Probando los sabores auténticos de Japón`,
        `Deliciosa comida en ${activity.name} 🍱 ¡Todo está tan rico!`
      ],
      attraction: [
        `Explorando ${activity.name} 🗾 ¡Qué lugar tan increíble!`,
        `En ${activity.name} 📸 Las fotos no le hacen justicia`,
        `${activity.name} ✨ Un must-see en Japón`
      ],
      shopping: [
        `De compras en ${activity.name} 🛍️ ¡Hay tantas cosas kawaii!`,
        `${activity.name} 💰 Mi billetera está sufriendo pero vale la pena`,
        `Shopping time en ${activity.name} ✨`
      ]
    };

    const category = activity.category || 'attraction';
    const categoryPhrases = captions[category] || captions.attraction;
    return categoryPhrases[Math.floor(Math.random() * categoryPhrases.length)];
  }

  /**
   * Get activity image
   */
  getActivityImage(activity) {
    // Map of famous locations to actual images
    const imageMap = {
      'senso-ji': '/images/places/sensoji.jpg',
      'fushimi': '/images/places/fushimi.jpg',
      'shibuya': '/images/places/shibuya.jpg',
      'tokyo tower': '/images/places/tokyo-tower.jpg',
      'mount fuji': '/images/places/fuji.jpg'
    };

    const activityKey = (activity.name || '').toLowerCase();

    for (const [key, image] of Object.entries(imageMap)) {
      if (activityKey.includes(key)) {
        return image;
      }
    }

    // Default gradient based on category
    const gradients = {
      temple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      restaurant: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      attraction: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      shopping: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };

    return gradients[activity.category] || gradients.attraction;
  }

  /**
   * Generate "time ago" text
   */
  generateTimeAgo(dayIndex) {
    const phrases = [
      `${dayIndex} días en tu viaje`,
      `Hace ${dayIndex} días`,
      `Día ${dayIndex + 1} del viaje`
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /**
   * Render the Instagram timeline
   */
  render() {
    // Remove existing modal
    const existing = document.getElementById('instagram-timeline-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'instagram-timeline-modal';
    modal.className = 'fixed inset-0 bg-black/90 z-[10000] overflow-hidden';
    modal.innerHTML = `
      <div class="h-full flex flex-col bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 bg-black/30 backdrop-blur-lg border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              J
            </div>
            <div>
              <h1 class="text-white font-bold text-lg">Mi Viaje a Japón 🇯🇵</h1>
              <p class="text-white/70 text-xs">${this.posts.length} momentos</p>
            </div>
          </div>
          <button onclick="window.InstagramTimeline?.close()" class="text-white/80 hover:text-white text-3xl leading-none">
            ×
          </button>
        </div>

        <!-- Stories -->
        <div class="p-4 bg-black/20 backdrop-blur-sm border-b border-white/10 overflow-x-auto scrollbar-thin scrollbar-thumb-white/30">
          <div class="flex gap-4 pb-2">
            ${this.renderStories()}
          </div>
        </div>

        <!-- Feed -->
        <div class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div class="max-w-2xl mx-auto py-4">
            ${this.renderPosts()}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners for like buttons
    this.attachEventListeners();
  }

  /**
   * Render stories at the top
   */
  renderStories() {
    const days = this.currentItinerary.days.map((day, index) => ({
      dayNumber: index + 1,
      date: day.date,
      activities: day.activities?.length || 0
    }));

    return days.map(day => `
      <div class="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer story-item" data-day="${day.dayNumber}">
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
          <div class="w-full h-full rounded-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
            <span class="text-white font-bold text-xl">${day.dayNumber}</span>
          </div>
        </div>
        <span class="text-white/90 text-xs font-medium">Día ${day.dayNumber}</span>
      </div>
    `).join('');
  }

  /**
   * Render posts feed
   */
  renderPosts() {
    return this.posts.map(post => `
      <div class="bg-black/40 backdrop-blur-lg rounded-xl overflow-hidden mb-4 border border-white/10 shadow-2xl post-card">
        <!-- Post Header -->
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              ${post.dayNumber}
            </div>
            <div>
              <p class="text-white font-semibold">Día ${post.dayNumber}</p>
              <p class="text-white/60 text-xs">${post.time}</p>
            </div>
          </div>
          <button class="text-white/80 hover:text-white">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>

        <!-- Post Image/Content -->
        <div class="relative aspect-square bg-cover bg-center" style="background: ${post.image.startsWith('linear-gradient') ? post.image : `url('${post.image}')`}; background-size: cover; background-position: center;">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-6">
            <h3 class="text-white text-2xl font-bold text-center drop-shadow-lg">${post.activity.name}</h3>
          </div>
        </div>

        <!-- Post Actions -->
        <div class="p-4">
          <div class="flex items-center gap-4 mb-3">
            <button class="like-btn text-2xl transition-transform hover:scale-110" data-post-id="${post.id}">
              ${post.hasLiked ? '❤️' : '🤍'}
            </button>
            <button class="text-white/80 hover:text-white text-2xl">
              💬
            </button>
            <button class="text-white/80 hover:text-white text-2xl">
              📤
            </button>
            <button class="ml-auto text-white/80 hover:text-white text-2xl">
              🔖
            </button>
          </div>

          <p class="text-white font-semibold text-sm mb-2">
            <span class="likes-count">${post.likes}</span> Me gusta
          </p>

          <p class="text-white text-sm">
            <span class="font-semibold">tu_viaje_japon</span> ${post.caption}
          </p>

          ${post.date ? `
            <p class="text-white/50 text-xs mt-2">
              ${new Date(post.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const postId = btn.dataset.postId;
        const post = this.posts.find(p => p.id === postId);

        if (post) {
          post.hasLiked = !post.hasLiked;
          post.likes += post.hasLiked ? 1 : -1;

          // Update UI
          btn.textContent = post.hasLiked ? '❤️' : '🤍';
          const likesCount = btn.closest('.p-4').querySelector('.likes-count');
          if (likesCount) {
            likesCount.textContent = post.likes;
          }

          // Animate
          btn.classList.add('animate-ping');
          setTimeout(() => btn.classList.remove('animate-ping'), 300);
        }
      });
    });

    // Story items - scroll to day's posts
    document.querySelectorAll('.story-item').forEach(item => {
      item.addEventListener('click', () => {
        const dayNumber = parseInt(item.dataset.day);
        const firstPostOfDay = this.posts.find(p => p.dayNumber === dayNumber);

        if (firstPostOfDay) {
          const postElement = document.querySelector(`[data-post-id="${firstPostOfDay.id}"]`)?.closest('.post-card');
          if (postElement) {
            postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    });
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.InstagramTimeline = new InstagramTimeline();
  console.log('📸 Instagram Timeline loaded!');
}
