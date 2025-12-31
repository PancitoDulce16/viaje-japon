// js/social-network.js - Sistema de Red Social Interna tipo Instagram

/**
 * Japitin Social - Red Social para viajeros de Japón
 * Features: Feed, Posts, Profiles, Explore, Collections, Stories
 */
export const JapitinSocial = {
  currentUser: null,
  feed: [],
  currentPost: null,

  /**
   * Inicializa el sistema social
   */
  async init(userId) {
    this.currentUser = await this.loadUserProfile(userId);
    console.log('✅ Japitin Social iniciado para:', this.currentUser?.username);
  },

  /**
   * Carga el perfil de un usuario
   */
  async loadUserProfile(userId) {
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const db = window.db;

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return {
          id: userId,
          ...userDoc.data()
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error cargando perfil:', error);
      return null;
    }
  },

  /**
   * Abre el feed social
   */
  open() {
    this.renderSocialFeed();
  },

  /**
   * Renderiza el feed social completo
   */
  renderSocialFeed() {
    const existingModal = document.getElementById('socialFeedModal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div id="socialFeedModal" class="fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900">

        <!-- Top Navigation Bar (Instagram style) -->
        <div class="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div class="max-w-6xl mx-auto px-4 py-3">
            <div class="flex items-center justify-between">
              <!-- Logo -->
              <div class="flex items-center gap-3">
                <button onclick="window.JapitinSocial.close()" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Japitin Social
                </h1>
              </div>

              <!-- Search Bar -->
              <div class="flex-1 max-w-md mx-8">
                <input type="text"
                       placeholder="🔍 Buscar lugares, usuarios, hashtags..."
                       class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-4">
                <button onclick="window.JapitinSocial.showCreatePost()"
                        class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition">
                  ➕ Crear Post
                </button>
                <button onclick="window.JapitinSocial.showNotifications()" class="relative text-gray-600 dark:text-gray-300 hover:text-purple-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </button>
                <button onclick="window.JapitinSocial.showProfile('${this.currentUser?.id || 'me'}')" class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  ${this.currentUser?.username?.[0]?.toUpperCase() || 'U'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-6xl mx-auto py-6">
          <div class="grid grid-cols-12 gap-6">

            <!-- Left Sidebar - Navigation -->
            <div class="col-span-3">
              ${this.renderLeftSidebar()}
            </div>

            <!-- Center - Feed -->
            <div class="col-span-6">
              ${this.renderFeedContent()}
            </div>

            <!-- Right Sidebar - Suggestions -->
            <div class="col-span-3">
              ${this.renderRightSidebar()}
            </div>

          </div>
        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.loadFeed();
  },

  /**
   * Renderiza la barra lateral izquierda (navegación)
   */
  renderLeftSidebar() {
    return `
      <div class="sticky top-20 space-y-2">
        <button onclick="window.JapitinSocial.switchTab('feed')"
                class="w-full px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 font-semibold text-gray-900 dark:text-white">
          <span class="text-xl">🏠</span>
          Feed
        </button>

        <button onclick="window.JapitinSocial.switchTab('explore')"
                class="w-full px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <span class="text-xl">🔍</span>
          Explorar
        </button>

        <button onclick="window.JapitinSocial.switchTab('trips')"
                class="w-full px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <span class="text-xl">✈️</span>
          Viajes
        </button>

        <button onclick="window.JapitinSocial.switchTab('collections')"
                class="w-full px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <span class="text-xl">📌</span>
          Guardados
        </button>

        <button onclick="window.JapitinSocial.switchTab('challenges')"
                class="w-full px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <span class="text-xl">🏆</span>
          Desafíos
        </button>

        <hr class="my-4 border-gray-200 dark:border-gray-700">

        <!-- Trending Hashtags -->
        <div class="px-4 py-3">
          <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Trending</h3>
          <div class="space-y-2 text-sm">
            <a href="#" class="block text-purple-600 dark:text-purple-400 hover:underline">#SakuraSeason2025</a>
            <a href="#" class="block text-purple-600 dark:text-purple-400 hover:underline">#TokyoFood</a>
            <a href="#" class="block text-purple-600 dark:text-purple-400 hover:underline">#GhibliMuseum</a>
            <a href="#" class="block text-purple-600 dark:text-purple-400 hover:underline">#FushimiInari</a>
            <a href="#" class="block text-purple-600 dark:text-purple-400 hover:underline">#RamenLover</a>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Renderiza el contenido del feed
   */
  renderFeedContent() {
    return `
      <!-- Stories (Instagram style) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div class="flex gap-4 overflow-x-auto pb-2">
          ${this.renderStories()}
        </div>
      </div>

      <!-- Feed de Posts -->
      <div id="feedContainer" class="space-y-4">
        ${this.renderLoadingSkeleton()}
      </div>
    `;
  },

  /**
   * Renderiza las stories
   */
  renderStories() {
    const stories = [
      { user: 'Tu historia', avatar: '➕', isYours: true },
      { user: 'maria_tokyo', avatar: 'M', hasNew: true, city: 'Tokyo' },
      { user: 'juan_osaka', avatar: 'J', hasNew: true, city: 'Osaka' },
      { user: 'ana_kyoto', avatar: 'A', hasNew: false, city: 'Kyoto' },
      { user: 'carlos_japan', avatar: 'C', hasNew: true, city: 'Nara' }
    ];

    return stories.map(story => `
      <button onclick="window.JapitinSocial.openStory('${story.user}')" class="flex flex-col items-center gap-2 flex-shrink-0">
        <div class="w-16 h-16 rounded-full ${story.hasNew ? 'bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-400 p-0.5' : 'bg-gray-300 dark:bg-gray-600'} ${story.isYours ? 'bg-gray-300 dark:bg-gray-600' : ''}">
          <div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-xl font-bold">
            ${story.avatar}
          </div>
        </div>
        <span class="text-xs text-gray-700 dark:text-gray-300 max-w-[64px] truncate">${story.user}</span>
      </button>
    `).join('');
  },

  /**
   * Renderiza la barra lateral derecha (sugerencias)
   */
  renderRightSidebar() {
    return `
      <div class="sticky top-20 space-y-6">

        <!-- User Suggestions -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 class="font-bold text-gray-900 dark:text-white mb-4">Viajeros sugeridos</h3>
          <div class="space-y-3">
            ${this.renderUserSuggestion('maria_traveler', 'M', 'Tokyo Feb 16-24', 'Follow')}
            ${this.renderUserSuggestion('juan_foodie', 'J', 'Osaka Ramen Hunter', 'Follow')}
            ${this.renderUserSuggestion('ana_temples', 'A', 'Kyoto Explorer', 'Follow')}
          </div>
        </div>

        <!-- Popular Places -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 class="font-bold text-gray-900 dark:text-white mb-4">Lugares populares</h3>
          <div class="space-y-2 text-sm">
            <a href="#" class="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
              <span class="text-gray-700 dark:text-gray-300">🗼 Shibuya Crossing</span>
              <span class="text-gray-500 text-xs">1.2k posts</span>
            </a>
            <a href="#" class="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
              <span class="text-gray-700 dark:text-gray-300">⛩️ Fushimi Inari</span>
              <span class="text-gray-500 text-xs">856 posts</span>
            </a>
            <a href="#" class="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
              <span class="text-gray-700 dark:text-gray-300">🍜 Ichiran Ramen</span>
              <span class="text-gray-500 text-xs">634 posts</span>
            </a>
          </div>
        </div>

        <!-- Active Challenges -->
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-700">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">🏆</span>
            <h3 class="font-bold text-gray-900 dark:text-white">Desafío Activo</h3>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
            <strong>Ramen Master Challenge</strong><br>
            Prueba 10 tipos de ramen diferentes
          </p>
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-600 dark:text-gray-400">234 participantes</span>
            <button class="px-3 py-1 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700">
              Unirse
            </button>
          </div>
        </div>

      </div>
    `;
  },

  /**
   * Renderiza una sugerencia de usuario
   */
  renderUserSuggestion(username, avatar, subtitle, actionText) {
    return `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
            ${avatar}
          </div>
          <div>
            <p class="font-semibold text-sm text-gray-900 dark:text-white">${username}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">${subtitle}</p>
          </div>
        </div>
        <button class="text-xs font-semibold text-purple-600 hover:text-purple-700">
          ${actionText}
        </button>
      </div>
    `;
  },

  /**
   * Renderiza skeleton de carga
   */
  renderLoadingSkeleton() {
    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
        <div class="p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
            <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          </div>
        </div>
        <div class="aspect-square bg-gray-300 dark:bg-gray-600"></div>
        <div class="p-4">
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    `.repeat(3);
  },

  /**
   * Carga el feed de posts
   */
  async loadFeed() {
    try {
      // Simular posts (después conectar con Firestore)
      const mockPosts = [
        {
          id: 'post1',
          user: { username: 'maria_traveler', avatar: 'M' },
          location: { name: 'Shibuya Crossing', city: 'Tokyo' },
          image: 'https://picsum.photos/600/600?random=1',
          caption: 'First time at the famous Shibuya Crossing! 🚶‍♀️ The energy here is incredible!',
          hashtags: ['#Tokyo', '#Shibuya', '#JapanTravel'],
          likes: 234,
          comments: 12,
          timeAgo: '2 hours ago',
          tripDay: 3
        },
        {
          id: 'post2',
          user: { username: 'juan_foodie', avatar: 'J' },
          location: { name: 'Ichiran Ramen', city: 'Tokyo' },
          image: 'https://picsum.photos/600/600?random=2',
          caption: 'Best ramen I\'ve ever had! 🍜 The customization system is genius',
          hashtags: ['#Ramen', '#TokyoFood', '#Ichiran'],
          likes: 456,
          comments: 28,
          timeAgo: '5 hours ago',
          tripDay: 2
        },
        {
          id: 'post3',
          user: { username: 'ana_temples', avatar: 'A' },
          location: { name: 'Fushimi Inari Taisha', city: 'Kyoto' },
          image: 'https://picsum.photos/600/600?random=3',
          caption: 'Climbed all 10,000 torii gates! ⛩️ My legs are dying but so worth it!',
          hashtags: ['#Kyoto', '#FushimiInari', '#Temples'],
          likes: 789,
          comments: 45,
          timeAgo: '1 day ago',
          tripDay: 6
        }
      ];

      this.feed = mockPosts;
      this.renderPosts();

    } catch (error) {
      console.error('❌ Error cargando feed:', error);
    }
  },

  /**
   * Renderiza los posts en el feed
   */
  renderPosts() {
    const container = document.getElementById('feedContainer');
    if (!container) return;

    container.innerHTML = this.feed.map(post => this.renderPost(post)).join('');
  },

  /**
   * Renderiza un post individual (estilo Instagram)
   */
  renderPost(post) {
    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

        <!-- Post Header -->
        <div class="p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
              ${post.user.avatar}
            </div>
            <div>
              <p class="font-semibold text-sm text-gray-900 dark:text-white">${post.user.username}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                📍 ${post.location.name}, ${post.location.city}
                ${post.tripDay ? ` • Day ${post.tripDay}` : ''}
              </p>
            </div>
          </div>
          <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
            </svg>
          </button>
        </div>

        <!-- Post Image -->
        <div class="aspect-square bg-gray-200 dark:bg-gray-700">
          <img src="${post.image}" alt="${post.caption}" class="w-full h-full object-cover">
        </div>

        <!-- Post Actions -->
        <div class="p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-4">
              <button onclick="window.JapitinSocial.likePost('${post.id}')" class="hover:text-red-500 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
              <button onclick="window.JapitinSocial.commentPost('${post.id}')" class="hover:text-blue-500 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </button>
              <button onclick="window.JapitinSocial.sharePost('${post.id}')" class="hover:text-green-500 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
              </button>
            </div>
            <button onclick="window.JapitinSocial.savePost('${post.id}')" class="hover:text-yellow-500 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>
          </div>

          <!-- Likes Count -->
          <p class="font-semibold text-sm text-gray-900 dark:text-white mb-2">
            ${post.likes.toLocaleString()} me gusta
          </p>

          <!-- Caption -->
          <p class="text-sm text-gray-900 dark:text-white mb-2">
            <span class="font-semibold">${post.user.username}</span>
            ${post.caption}
          </p>

          <!-- Hashtags -->
          <div class="flex flex-wrap gap-1 mb-2">
            ${post.hashtags.map(tag => `
              <a href="#" class="text-sm text-purple-600 dark:text-purple-400 hover:underline">${tag}</a>
            `).join('')}
          </div>

          <!-- Comments Preview -->
          ${post.comments > 0 ? `
            <button onclick="window.JapitinSocial.viewComments('${post.id}')" class="text-sm text-gray-500 dark:text-gray-400 hover:underline mb-2">
              Ver los ${post.comments} comentarios
            </button>
          ` : ''}

          <!-- Time -->
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase">
            ${post.timeAgo}
          </p>
        </div>

        <!-- Add Comment -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
          <input type="text"
                 placeholder="Agrega un comentario..."
                 class="flex-1 text-sm bg-transparent focus:outline-none text-gray-900 dark:text-white"
                 onkeypress="if(event.key === 'Enter') window.JapitinSocial.addComment('${post.id}', this.value)">
          <button class="text-sm font-semibold text-purple-600 hover:text-purple-700">
            Publicar
          </button>
        </div>

      </div>
    `;
  },

  /**
   * Muestra el formulario para crear un nuevo post
   */
  showCreatePost() {
    const modalHTML = `
      <div id="createPostModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

          <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Crear nuevo post</h2>
            <button onclick="document.getElementById('createPostModal').remove()" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- Image Upload -->
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
              <input type="file" id="postImage" accept="image/*" class="hidden" onchange="window.JapitinSocial.previewImage(this)">
              <label for="postImage" class="cursor-pointer">
                <div id="imagePreview" class="hidden">
                  <img id="previewImg" class="max-h-96 mx-auto rounded-lg">
                </div>
                <div id="uploadPlaceholder">
                  <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p class="text-gray-600 dark:text-gray-400">Click para subir foto</p>
                </div>
              </label>
            </div>

            <!-- Caption -->
            <textarea id="postCaption" rows="4"
                      placeholder="Escribe una descripción..."
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"></textarea>

            <!-- Location -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📍 Ubicación
              </label>
              <select id="postLocation" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Seleccionar ubicación...</option>
                <option value="shibuya">Shibuya Crossing, Tokyo</option>
                <option value="sensoji">Senso-ji Temple, Tokyo</option>
                <option value="fushimi">Fushimi Inari, Kyoto</option>
                <option value="arashiyama">Arashiyama Bamboo, Kyoto</option>
                <option value="dotonbori">Dotonbori, Osaka</option>
              </select>
            </div>

            <!-- Hashtags -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                # Hashtags
              </label>
              <input type="text" id="postHashtags"
                     placeholder="#Tokyo #Food #Travel"
                     class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>

            <!-- Link to Trip Day -->
            <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <label class="flex items-center gap-3">
                <input type="checkbox" id="linkToTrip" class="w-4 h-4">
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  ✈️ Vincular con mi itinerario (Día 3 - Tokyo)
                </span>
              </label>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
            <button onclick="window.JapitinSocial.publishPost()"
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition">
              📤 Publicar
            </button>
            <button onclick="document.getElementById('createPostModal').remove()"
                    class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg">
              Cancelar
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  /**
   * Preview de imagen antes de subir
   */
  previewImage(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('imagePreview').classList.remove('hidden');
        document.getElementById('uploadPlaceholder').classList.add('hidden');
      };
      reader.readAsDataURL(input.files[0]);
    }
  },

  /**
   * Publica un nuevo post
   */
  async publishPost() {
    const caption = document.getElementById('postCaption')?.value;
    const location = document.getElementById('postLocation')?.value;
    const hashtags = document.getElementById('postHashtags')?.value;

    if (!caption) {
      window.Notifications?.show('❌ Agrega una descripción', 'error');
      return;
    }

    window.Notifications?.show('⏳ Publicando post...', 'info');

    // TODO: Subir imagen a Firebase Storage
    // TODO: Crear documento en Firestore

    setTimeout(() => {
      window.Notifications?.show('✅ Post publicado con éxito!', 'success');
      document.getElementById('createPostModal')?.remove();
      this.loadFeed(); // Recargar feed
    }, 1500);
  },

  /**
   * Placeholder functions
   */
  likePost(postId) {
    console.log('❤️ Like post:', postId);
  },

  commentPost(postId) {
    console.log('💬 Comment on post:', postId);
  },

  sharePost(postId) {
    console.log('📤 Share post:', postId);
  },

  savePost(postId) {
    console.log('🔖 Save post:', postId);
  },

  viewComments(postId) {
    console.log('👁️ View comments:', postId);
  },

  addComment(postId, text) {
    if (!text.trim()) return;
    console.log('💬 Add comment to', postId, ':', text);
  },

  switchTab(tab) {
    console.log('🔄 Switch to tab:', tab);
  },

  openStory(username) {
    console.log('📖 Open story:', username);
  },

  showNotifications() {
    console.log('🔔 Show notifications');
  },

  showProfile(userId) {
    console.log('👤 Show profile:', userId);
  },

  /**
   * Cierra el feed social
   */
  close() {
    const modal = document.getElementById('socialFeedModal');
    if (modal) modal.remove();
  }
};

// Exportar globalmente
window.JapitinSocial = JapitinSocial;

console.log('✅ Japitin Social Network loaded');

export default JapitinSocial;
