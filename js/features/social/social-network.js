// js/social-network.js - Sistema de Red Social Interna tipo Instagram

import { db, auth, storage } from '../../core/firebase-config.js';
import {
  collection, doc, addDoc, setDoc, deleteDoc, getDoc, getDocs,
  query, orderBy, limit, onSnapshot, serverTimestamp,
  arrayUnion, arrayRemove, increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { escapeHTML } from '../../utils/helpers.js';

/**
 * Japitin Social - Red Social para viajeros de Japón
 * Features: Feed, Posts, Profiles, Explore, Collections, Stories
 */
export const JapitinSocial = {
  currentUser: null,
  feed: [],
  currentPost: null,
  feedUnsubscribe: null,
  selectedImageFile: null,
  savedPostIds: new Set(),

  LOCATIONS: {
    shibuya: { name: 'Shibuya Crossing', city: 'Tokyo' },
    sensoji: { name: 'Senso-ji Temple', city: 'Tokyo' },
    fushimi: { name: 'Fushimi Inari', city: 'Kyoto' },
    arashiyama: { name: 'Arashiyama Bamboo', city: 'Kyoto' },
    dotonbori: { name: 'Dotonbori', city: 'Osaka' }
  },

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
      const { doc, getDoc } = await import('firebase/firestore');
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
   * Carga el feed de posts en tiempo real desde Firestore
   */
  async loadFeed() {
    try {
      if (this.feedUnsubscribe) this.feedUnsubscribe();

      await this.loadSavedPostIds();

      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30));
      this.feedUnsubscribe = onSnapshot(postsQuery, (snapshot) => {
        this.feed = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            user: { username: data.authorUsername, avatar: data.authorAvatar },
            authorId: data.authorId,
            location: data.location,
            image: data.imageUrl,
            caption: data.caption,
            hashtags: data.hashtags || [],
            likes: data.likes || [],
            commentCount: data.commentCount || 0,
            createdAt: data.createdAt,
            tripDay: data.tripDay || null
          };
        });
        this.renderPosts();
      }, (error) => {
        console.error('❌ Error escuchando el feed:', error);
      });
    } catch (error) {
      console.error('❌ Error cargando feed:', error);
    }
  },

  /**
   * Carga qué posts guardó el usuario actual (para pintar el ícono de guardado)
   */
  async loadSavedPostIds() {
    if (!auth.currentUser) return;
    try {
      const snap = await getDocs(collection(db, 'users', auth.currentUser.uid, 'savedPosts'));
      this.savedPostIds = new Set(snap.docs.map(d => d.id));
    } catch (error) {
      console.error('❌ Error cargando posts guardados:', error);
    }
  },

  /**
   * Texto relativo simple ("hace 2h") a partir de un Firestore Timestamp
   */
  timeAgo(timestamp) {
    if (!timestamp?.toDate) return '';
    const diffMs = Date.now() - timestamp.toDate().getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${Math.floor(hours / 24)}d`;
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
    const liked = auth.currentUser && post.likes.includes(auth.currentUser.uid);
    const saved = this.savedPostIds.has(post.id);
    const canDelete = auth.currentUser && post.authorId === auth.currentUser.uid;

    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

        <!-- Post Header -->
        <div class="p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
              ${escapeHTML(post.user.avatar)}
            </div>
            <div>
              <p class="font-semibold text-sm text-gray-900 dark:text-white">${escapeHTML(post.user.username)}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                ${post.location ? `📍 ${escapeHTML(post.location.name)}, ${escapeHTML(post.location.city)}` : ''}
                ${post.tripDay ? ` • Day ${post.tripDay}` : ''}
              </p>
            </div>
          </div>
          ${canDelete ? `
            <button onclick="window.JapitinSocial.deletePost('${post.id}')" class="text-gray-500 hover:text-red-600 dark:hover:text-red-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          ` : ''}
        </div>

        <!-- Post Image -->
        <div class="aspect-square bg-gray-200 dark:bg-gray-700">
          <img src="${post.image}" alt="${escapeHTML(post.caption)}" class="w-full h-full object-cover">
        </div>

        <!-- Post Actions -->
        <div class="p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-4">
              <button onclick="window.JapitinSocial.likePost('${post.id}')" class="${liked ? 'text-red-500' : ''} hover:text-red-500 transition">
                <svg class="w-6 h-6" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
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
            <button onclick="window.JapitinSocial.savePost('${post.id}')" class="${saved ? 'text-yellow-500' : ''} hover:text-yellow-500 transition">
              <svg class="w-6 h-6" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>
          </div>

          <!-- Likes Count -->
          <p class="font-semibold text-sm text-gray-900 dark:text-white mb-2">
            ${post.likes.length.toLocaleString()} me gusta
          </p>

          <!-- Caption -->
          <p class="text-sm text-gray-900 dark:text-white mb-2">
            <span class="font-semibold">${escapeHTML(post.user.username)}</span>
            ${escapeHTML(post.caption)}
          </p>

          <!-- Hashtags -->
          <div class="flex flex-wrap gap-1 mb-2">
            ${post.hashtags.map(tag => `
              <a href="#" class="text-sm text-purple-600 dark:text-purple-400 hover:underline">${escapeHTML(tag)}</a>
            `).join('')}
          </div>

          <!-- Comments Preview -->
          ${post.commentCount > 0 ? `
            <button onclick="window.JapitinSocial.viewComments('${post.id}')" class="text-sm text-gray-500 dark:text-gray-400 hover:underline mb-2">
              Ver los ${post.commentCount} comentarios
            </button>
          ` : ''}

          <!-- Time -->
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase">
            ${this.timeAgo(post.createdAt)}
          </p>
        </div>

        <!-- Add Comment -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
          <input type="text" id="commentInput-${post.id}"
                 placeholder="Agrega un comentario..."
                 class="flex-1 text-sm bg-transparent focus:outline-none text-gray-900 dark:text-white"
                 onkeypress="if(event.key === 'Enter') window.JapitinSocial.addComment('${post.id}', this.value, this)">
          <button onclick="window.JapitinSocial.addComment('${post.id}', document.getElementById('commentInput-${post.id}').value, document.getElementById('commentInput-${post.id}'))"
                  class="text-sm font-semibold text-purple-600 hover:text-purple-700">
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
                ${Object.entries(this.LOCATIONS).map(([key, loc]) => `
                  <option value="${key}">${loc.name}, ${loc.city}</option>
                `).join('')}
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
            ${this.getCurrentTripDay() ? `
              <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <label class="flex items-center gap-3">
                  <input type="checkbox" id="linkToTrip" class="w-4 h-4" checked>
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    ✈️ Vincular con mi itinerario (Día ${this.getCurrentTripDay()})
                  </span>
                </label>
              </div>
            ` : ''}
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
   * Calcula el día de viaje actual (para "vincular con mi itinerario"), o
   * null si no hay un viaje activo con fechas
   */
  getCurrentTripDay() {
    const trip = window.TripsManager?.currentTrip;
    if (!trip?.info?.dateStart || !window.TimeUtils) return null;
    const today = window.TimeUtils.toISODate(new Date());
    const day = window.TimeUtils.daysBetween(trip.info.dateStart, today) + 1;
    return day >= 1 ? day : null;
  },

  /**
   * Preview de imagen antes de subir
   */
  previewImage(input) {
    if (input.files && input.files[0]) {
      this.selectedImageFile = input.files[0];
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
   * Publica un nuevo post: sube la imagen a Storage y crea el post en Firestore
   */
  async publishPost() {
    const caption = document.getElementById('postCaption')?.value?.trim();
    const locationKey = document.getElementById('postLocation')?.value;
    const hashtagsRaw = document.getElementById('postHashtags')?.value;
    const linkToTrip = document.getElementById('linkToTrip')?.checked;

    if (!caption) {
      window.Notifications?.show('❌ Agrega una descripción', 'error');
      return;
    }
    if (!this.selectedImageFile) {
      window.Notifications?.show('❌ Sube una foto', 'error');
      return;
    }
    if (!auth.currentUser) {
      window.Notifications?.show('❌ Debes iniciar sesión', 'error');
      return;
    }

    window.Notifications?.show('⏳ Publicando post...', 'info');

    try {
      const fileName = `${Date.now()}_${this.selectedImageFile.name}`;
      const storagePath = `social/${auth.currentUser.uid}/${fileName}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, this.selectedImageFile);
      const imageUrl = await getDownloadURL(storageRef);

      const hashtags = (hashtagsRaw || '')
        .split(/\s+/)
        .map(t => t.trim())
        .filter(t => t.startsWith('#'));

      await addDoc(collection(db, 'posts'), {
        authorId: auth.currentUser.uid,
        authorUsername: this.currentUser?.username || auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Viajero',
        authorAvatar: (this.currentUser?.username || auth.currentUser.displayName || 'V').charAt(0).toUpperCase(),
        imageUrl,
        storagePath,
        caption,
        hashtags,
        location: this.LOCATIONS[locationKey] || null,
        tripDay: linkToTrip ? this.getCurrentTripDay() : null,
        likes: [],
        commentCount: 0,
        createdAt: serverTimestamp()
      });

      this.selectedImageFile = null;
      window.Notifications?.show('✅ Post publicado con éxito!', 'success');
      document.getElementById('createPostModal')?.remove();
    } catch (error) {
      console.error('❌ Error publicando post:', error);
      window.Notifications?.show('❌ No se pudo publicar el post', 'error');
    }
  },

  /**
   * Toggle de like en un post
   */
  async likePost(postId) {
    if (!auth.currentUser) return;
    const post = this.feed.find(p => p.id === postId);
    if (!post) return;

    const alreadyLiked = post.likes.includes(auth.currentUser.uid);
    try {
      await setDoc(doc(db, 'posts', postId), {
        likes: alreadyLiked ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid)
      }, { merge: true });
    } catch (error) {
      console.error('❌ Error dando like:', error);
    }
  },

  /**
   * Foco directo al input de comentario del post (acción real del botón 💬)
   */
  commentPost(postId) {
    document.getElementById(`commentInput-${postId}`)?.focus();
  },

  /**
   * Comparte el post (Web Share API o portapapeles, igual que otras
   * features de export de la app)
   */
  async sharePost(postId) {
    const post = this.feed.find(p => p.id === postId);
    if (!post) return;

    const shareText = `${post.caption} - vía Japitin Social`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Japitin Social', text: shareText, url: post.image });
      } catch (error) {
        if (error.name !== 'AbortError') console.error('❌ Error compartiendo:', error);
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${post.image}`);
      window.Notifications?.show('📋 Copiado al portapapeles', 'success');
    }
  },

  /**
   * Toggle de guardado del post (users/{uid}/savedPosts/{postId})
   */
  async savePost(postId) {
    if (!auth.currentUser) return;
    const savedRef = doc(db, 'users', auth.currentUser.uid, 'savedPosts', postId);

    try {
      if (this.savedPostIds.has(postId)) {
        await deleteDoc(savedRef);
        this.savedPostIds.delete(postId);
        window.Notifications?.show('🔖 Quitado de guardados', 'info');
      } else {
        await setDoc(savedRef, { postId, savedAt: serverTimestamp() });
        this.savedPostIds.add(postId);
        window.Notifications?.show('🔖 Guardado', 'success');
      }
      this.renderPosts();
    } catch (error) {
      console.error('❌ Error guardando post:', error);
    }
  },

  /**
   * Elimina un post propio (imagen en Storage se queda huérfana - fuera de
   * alcance de esta pasada, igual que el resto de features de borrado en la app)
   */
  async deletePost(postId) {
    if (!confirm('¿Eliminar esta publicación?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      window.Notifications?.show('🗑️ Post eliminado', 'success');
    } catch (error) {
      console.error('❌ Error eliminando post:', error);
      window.Notifications?.show('❌ No se pudo eliminar', 'error');
    }
  },

  /**
   * Muestra los comentarios reales de un post
   */
  async viewComments(postId) {
    const snap = await getDocs(query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc')));
    const comments = snap.docs.map(d => d.data());

    const html = `
      <div id="commentsModal" class="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 class="font-bold text-gray-900 dark:text-white">Comentarios</h3>
            <button onclick="document.getElementById('commentsModal').remove()" class="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            ${comments.length > 0 ? comments.map(c => `
              <div class="text-sm">
                <span class="font-semibold text-gray-900 dark:text-white">${escapeHTML(c.authorUsername)}</span>
                <span class="text-gray-700 dark:text-gray-300"> ${escapeHTML(c.text)}</span>
              </div>
            `).join('') : '<p class="text-gray-500 text-center py-4">Sé el primero en comentar</p>'}
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  /**
   * Agrega un comentario real a un post
   */
  async addComment(postId, text, inputEl) {
    if (!text?.trim() || !auth.currentUser) return;

    const username = this.currentUser?.username || auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Viajero';

    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        authorId: auth.currentUser.uid,
        authorUsername: username,
        text: text.trim(),
        createdAt: serverTimestamp()
      });
      await setDoc(doc(db, 'posts', postId), { commentCount: increment(1) }, { merge: true });
      if (inputEl) inputEl.value = '';
      window.Notifications?.show('💬 Comentario publicado', 'success');
    } catch (error) {
      console.error('❌ Error agregando comentario:', error);
    }
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
    if (this.feedUnsubscribe) {
      this.feedUnsubscribe();
      this.feedUnsubscribe = null;
    }
    const modal = document.getElementById('socialFeedModal');
    if (modal) modal.remove();
  }
};

// Exportar globalmente
window.JapitinSocial = JapitinSocial;

console.log('✅ Japitin Social Network loaded');

export default JapitinSocial;
