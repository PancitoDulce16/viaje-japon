// js/photo-gallery.js - Galería de fotos con integración de Unsplash

import { db, auth } from './firebase-config.js';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const PhotoGallery = {
  photos: [],
  photosUnsubscribe: null,
  unsplashApiKey: 'YOUR_UNSPLASH_ACCESS_KEY', // Replace with real key
  unsplashApiBase: 'https://api.unsplash.com',

  // Categorías de fotos
  categories: [
    { id: 'temples', name: 'Templos', icon: '⛩️', query: 'japan temple' },
    { id: 'food', name: 'Comida', icon: '🍱', query: 'japanese food' },
    { id: 'cities', name: 'Ciudades', icon: '🏙️', query: 'tokyo osaka kyoto' },
    { id: 'nature', name: 'Naturaleza', icon: '🌸', query: 'japan nature cherry blossom' },
    { id: 'culture', name: 'Cultura', icon: '🎎', query: 'japanese culture' },
    { id: 'street', name: 'Calles', icon: '🚶', query: 'japan street' },
    { id: 'mt-fuji', name: 'Monte Fuji', icon: '🗻', query: 'mount fuji' },
    { id: 'user', name: 'Mis Fotos', icon: '📸', query: null }
  ],

  currentCategory: 'temples',
  currentPage: 1,
  perPage: 12,

  async init() {
    console.log('📸 Inicializando Photo Gallery...');

    // Inicializar listener de fotos de Firebase
    await this.initPhotosSync();

    // Verificar si hay access key de Unsplash en localStorage
    const storedKey = localStorage.getItem('unsplash_access_key');
    if (storedKey) {
      this.unsplashApiKey = storedKey;
    }
  },

  // Obtener el tripId actual
  getCurrentTripId() {
    if (window.TripsManager && window.TripsManager.currentTrip) {
      return window.TripsManager.currentTrip.id;
    }
    return localStorage.getItem('currentTripId');
  },

  // 🔥 Inicializar listener de fotos en tiempo real
  async initPhotosSync() {
    // Si ya hay un listener, limpiarlo
    if (this.photosUnsubscribe) {
      this.photosUnsubscribe();
    }

    // Si no hay usuario, cargar de localStorage
    if (!auth.currentUser) {
      const stored = localStorage.getItem('userPhotos');
      this.photos = stored ? JSON.parse(stored) : [];
      return;
    }

    const tripId = this.getCurrentTripId();
    const userId = auth.currentUser.uid;

    // Si NO hay trip, usar el sistema antiguo (por usuario)
    if (!tripId) {
      console.log('⚠️ Photos: No hay trip seleccionado, usando modo individual');
      const photosRef = collection(db, `users/${userId}/photos`);

      this.photosUnsubscribe = onSnapshot(photosRef, (snapshot) => {
        this.photos = [];
        snapshot.forEach(doc => {
          this.photos.push({ id: doc.id, ...doc.data() });
        });

        localStorage.setItem('userPhotos', JSON.stringify(this.photos));
        console.log('✅ Fotos (individual) sincronizadas:', this.photos.length);
      }, (error) => {
        console.error('❌ Error en sync de fotos:', error);
        const stored = localStorage.getItem('userPhotos');
        this.photos = stored ? JSON.parse(stored) : [];
      });

      return;
    }

    // 🔥 MODO COLABORATIVO: Usar el trip compartido
    console.log('🤝 Photos: Modo colaborativo activado para trip:', tripId);
    const photosRef = collection(db, `trips/${tripId}/photos`);

    this.photosUnsubscribe = onSnapshot(photosRef, (snapshot) => {
      this.photos = [];
      snapshot.forEach(doc => {
        this.photos.push({ id: doc.id, ...doc.data() });
      });

      localStorage.setItem('userPhotos', JSON.stringify(this.photos));
      console.log('✅ Fotos COMPARTIDAS sincronizadas:', this.photos.length);
    }, (error) => {
      console.error('❌ Error en sync de fotos compartidas:', error);
      const stored = localStorage.getItem('userPhotos');
      this.photos = stored ? JSON.parse(stored) : [];
    });
  },

  // 🎨 Buscar fotos en Unsplash
  async searchUnsplash(query, page = 1, perPage = 12) {
    if (!this.unsplashApiKey || this.unsplashApiKey === 'YOUR_UNSPLASH_ACCESS_KEY') {
      console.warn('⚠️ Unsplash API key not configured');
      return this.getMockPhotos(query, perPage);
    }

    try {
      const url = `${this.unsplashApiBase}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${this.unsplashApiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        results: data.results.map(photo => ({
          id: photo.id,
          url: photo.urls.regular,
          thumb: photo.urls.small,
          description: photo.description || photo.alt_description,
          author: photo.user.name,
          authorUrl: photo.user.links.html,
          downloadUrl: photo.links.download_location,
          source: 'unsplash'
        })),
        total: data.total,
        totalPages: data.total_pages
      };
    } catch (error) {
      console.error('❌ Error fetching from Unsplash:', error);
      return this.getMockPhotos(query, perPage);
    }
  },

  // 🎭 Mock photos para cuando Unsplash no está disponible
  getMockPhotos(query, perPage = 12) {
    const mockPhotos = Array.from({ length: perPage }, (_, i) => ({
      id: `mock-${query}-${i}`,
      url: `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}&sig=${i}`,
      thumb: `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}&sig=${i}`,
      description: `${query} - Foto ${i + 1}`,
      author: 'Unsplash',
      authorUrl: 'https://unsplash.com',
      source: 'mock'
    }));

    return {
      results: mockPhotos,
      total: perPage * 10,
      totalPages: 10
    };
  },

  // 📸 Renderizar galería principal
  async renderGallery() {
    const container = document.getElementById('photoGalleryContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl p-6 text-center">
          <div class="text-4xl mb-2">📸</div>
          <h3 class="text-2xl font-bold">Galería de Fotos</h3>
          <p class="text-white/80 text-sm mt-2">Explora y guarda inspiración para tu viaje</p>
        </div>

        <!-- Categorías -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4">
          <h4 class="font-bold dark:text-white mb-3">Explorar por categoría:</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            ${this.categories.map(cat => `
              <button
                onclick="PhotoGallery.selectCategory('${cat.id}')"
                class="category-btn ${this.currentCategory === cat.id ? 'active' : ''} bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900 text-gray-800 dark:text-white rounded-lg p-3 transition text-center"
                data-category="${cat.id}"
              >
                <div class="text-2xl mb-1">${cat.icon}</div>
                <div class="text-xs font-semibold">${cat.name}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Fotos del usuario guardadas -->
        ${this.photos.length > 0 ? `
          <div class="bg-white dark:bg-gray-800 rounded-xl p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-bold dark:text-white">📌 Mis Fotos Guardadas (${this.photos.length})</h4>
              <button
                onclick="PhotoGallery.selectCategory('user')"
                class="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Ver todas →
              </button>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              ${this.photos.slice(0, 4).map(photo => `
                <div class="relative group overflow-hidden rounded-lg aspect-square">
                  <img
                    src="${photo.thumb || photo.url}"
                    alt="${photo.description || 'Foto guardada'}"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      onclick="PhotoGallery.viewPhoto('${photo.id}')"
                      class="bg-white text-purple-600 rounded-full p-2 hover:scale-110 transition"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Grid de fotos de Unsplash -->
        <div id="photosGrid" class="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div class="text-center py-8">
            <i class="fas fa-spinner animate-spin text-3xl text-purple-500"></i>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Cargando fotos...</p>
          </div>
        </div>

        <!-- Paginación -->
        <div id="paginationControls" class="flex justify-center gap-2"></div>
      </div>
    `;

    // Cargar fotos según la categoría
    await this.loadPhotos();
  },

  // 🔄 Cargar fotos según categoría
  async loadPhotos() {
    const photosGrid = document.getElementById('photosGrid');
    if (!photosGrid) return;

    photosGrid.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-spinner animate-spin text-3xl text-purple-500"></i>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Cargando fotos...</p>
      </div>
    `;

    // Si es categoría "user", mostrar fotos guardadas
    if (this.currentCategory === 'user') {
      this.renderUserPhotos();
      return;
    }

    // Buscar en Unsplash
    const category = this.categories.find(c => c.id === this.currentCategory);
    if (!category || !category.query) return;

    const data = await this.searchUnsplash(category.query, this.currentPage, this.perPage);

    if (!data || !data.results || data.results.length === 0) {
      photosGrid.innerHTML = `
        <div class="text-center py-8">
          <div class="text-5xl mb-4">📷</div>
          <p class="text-gray-600 dark:text-gray-400">No se encontraron fotos</p>
        </div>
      `;
      return;
    }

    photosGrid.innerHTML = `
      <h4 class="font-bold dark:text-white mb-4">${category.icon} ${category.name}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${data.results.map(photo => `
          <div class="photo-card relative group overflow-hidden rounded-xl aspect-[4/3] bg-gray-200 dark:bg-gray-700">
            <img
              src="${photo.thumb}"
              alt="${photo.description || 'Foto de Japón'}"
              class="w-full h-full object-cover transition group-hover:scale-110"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
              <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p class="text-sm line-clamp-2 mb-2">${photo.description || 'Inspiración para tu viaje'}</p>
                <div class="flex gap-2">
                  <button
                    onclick="PhotoGallery.viewPhoto('${photo.id}', ${JSON.stringify(photo).replace(/"/g, '&quot;')})"
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-3 rounded-lg transition"
                  >
                    <i class="fas fa-eye mr-1"></i> Ver
                  </button>
                  <button
                    onclick="PhotoGallery.savePhoto(${JSON.stringify(photo).replace(/"/g, '&quot;')})"
                    class="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-sm py-2 px-3 rounded-lg transition"
                  >
                    <i class="fas fa-heart mr-1"></i> Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Renderizar paginación
    this.renderPagination(data.totalPages);
  },

  // 📄 Renderizar controles de paginación
  renderPagination(totalPages) {
    const paginationControls = document.getElementById('paginationControls');
    if (!paginationControls || totalPages <= 1) {
      paginationControls.innerHTML = '';
      return;
    }

    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    let html = '';

    // Botón anterior
    if (this.currentPage > 1) {
      html += `<button onclick="PhotoGallery.goToPage(${this.currentPage - 1})" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900 transition">←</button>`;
    }

    // Números de página
    for (let i = startPage; i <= endPage; i++) {
      const active = i === this.currentPage ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700';
      html += `<button onclick="PhotoGallery.goToPage(${i})" class="${active} px-4 py-2 rounded-lg hover:bg-purple-300 dark:hover:bg-purple-800 transition">${i}</button>`;
    }

    // Botón siguiente
    if (this.currentPage < totalPages) {
      html += `<button onclick="PhotoGallery.goToPage(${this.currentPage + 1})" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900 transition">→</button>`;
    }

    paginationControls.innerHTML = html;
  },

  // 🔀 Cambiar de página
  goToPage(page) {
    this.currentPage = page;
    this.loadPhotos();
  },

  // 📂 Seleccionar categoría
  selectCategory(categoryId) {
    this.currentCategory = categoryId;
    this.currentPage = 1;

    // Actualizar botones activos
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === categoryId);
    });

    this.loadPhotos();
  },

  // 👁️ Ver foto en modal
  viewPhoto(photoId, photoData = null) {
    let photo = photoData;

    // Si no se pasó photoData, buscar en fotos guardadas
    if (!photo) {
      photo = this.photos.find(p => p.id === photoId);
    }

    if (!photo) return;

    const modalHtml = `
      <div id="photoViewModal" class="modal active" style="z-index: 10000;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="relative">
            <img
              src="${photo.url}"
              alt="${photo.description || 'Foto'}"
              class="w-full rounded-t-xl"
            />
            <button
              onclick="PhotoGallery.closePhotoModal()"
              class="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition"
            >
              ×
            </button>
          </div>
          <div class="p-6">
            <p class="text-gray-800 dark:text-white text-lg mb-2">${photo.description || 'Inspiración para tu viaje a Japón'}</p>
            ${photo.author ? `
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Por <a href="${photo.authorUrl}" target="_blank" class="text-purple-600 hover:underline">${photo.author}</a>
              </p>
            ` : ''}
            <div class="flex gap-3">
              ${photo.source === 'unsplash' || photo.source === 'mock' ? `
                <button
                  onclick="PhotoGallery.savePhoto(${JSON.stringify(photo).replace(/"/g, '&quot;')})"
                  class="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition"
                >
                  <i class="fas fa-heart mr-2"></i> Guardar a Mis Fotos
                </button>
              ` : `
                <button
                  onclick="PhotoGallery.removePhoto('${photo.id}')"
                  class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition"
                >
                  <i class="fas fa-trash mr-2"></i> Eliminar
                </button>
              `}
              <button
                onclick="PhotoGallery.closePhotoModal()"
                class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal anterior si existe
    const existingModal = document.getElementById('photoViewModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
  },

  // ❌ Cerrar modal de foto
  closePhotoModal() {
    const modal = document.getElementById('photoViewModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  },

  // 💾 Guardar foto a Firebase
  async savePhoto(photo) {
    try {
      if (!auth.currentUser) {
        // Sin usuario, guardar localmente
        const exists = this.photos.some(p => p.url === photo.url);
        if (exists) {
          if (window.Notifications) {
            window.Notifications.warning('Ya tienes esta foto guardada');
          }
          return;
        }

        this.photos.push({
          ...photo,
          id: `local_${Date.now()}`,
          savedAt: new Date().toISOString()
        });

        localStorage.setItem('userPhotos', JSON.stringify(this.photos));

        if (window.Notifications) {
          window.Notifications.success('✅ Foto guardada localmente');
        }

        this.closePhotoModal();
        return;
      }

      const tripId = this.getCurrentTripId();

      // Verificar si ya existe
      const exists = this.photos.some(p => p.url === photo.url);
      if (exists) {
        if (window.Notifications) {
          window.Notifications.warning('Ya tienes esta foto guardada');
        }
        return;
      }

      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const photoData = {
        ...photo,
        savedAt: new Date().toISOString(),
        savedBy: auth.currentUser.email
      };

      if (!tripId) {
        // Modo individual
        const userId = auth.currentUser.uid;
        const photoRef = doc(db, `users/${userId}/photos`, photoId);
        await setDoc(photoRef, photoData);
        console.log('✅ Foto guardada (individual)');
      } else {
        // Modo colaborativo
        const photoRef = doc(db, `trips/${tripId}/photos`, photoId);
        await setDoc(photoRef, photoData);
        console.log('✅ Foto guardada (COMPARTIDA)');
      }

      if (window.Notifications) {
        window.Notifications.success('💗 Foto guardada exitosamente');
      }

      this.closePhotoModal();
    } catch (error) {
      console.error('❌ Error guardando foto:', error);
      if (window.Notifications) {
        window.Notifications.error('Error al guardar la foto');
      }
    }
  },

  // 🗑️ Eliminar foto
  async removePhoto(photoId) {
    if (!confirm('¿Eliminar esta foto de tus guardados?')) return;

    try {
      if (!auth.currentUser) {
        // Sin usuario, eliminar localmente
        this.photos = this.photos.filter(p => p.id !== photoId);
        localStorage.setItem('userPhotos', JSON.stringify(this.photos));

        if (window.Notifications) {
          window.Notifications.success('Foto eliminada');
        }

        this.closePhotoModal();
        this.loadPhotos();
        return;
      }

      const tripId = this.getCurrentTripId();

      if (!tripId) {
        // Modo individual
        const userId = auth.currentUser.uid;
        const photoRef = doc(db, `users/${userId}/photos`, photoId);
        await deleteDoc(photoRef);
      } else {
        // Modo colaborativo
        const photoRef = doc(db, `trips/${tripId}/photos`, photoId);
        await deleteDoc(photoRef);
      }

      if (window.Notifications) {
        window.Notifications.success('Foto eliminada');
      }

      this.closePhotoModal();
      this.loadPhotos();
    } catch (error) {
      console.error('❌ Error eliminando foto:', error);
      if (window.Notifications) {
        window.Notifications.error('Error al eliminar');
      }
    }
  },

  // 📸 Renderizar fotos del usuario
  renderUserPhotos() {
    const photosGrid = document.getElementById('photosGrid');
    if (!photosGrid) return;

    if (this.photos.length === 0) {
      photosGrid.innerHTML = `
        <div class="text-center py-12">
          <div class="text-6xl mb-4">📸</div>
          <h4 class="text-xl font-bold dark:text-white mb-2">No tienes fotos guardadas</h4>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Explora las categorías y guarda las fotos que te inspiren
          </p>
          <button
            onclick="PhotoGallery.selectCategory('temples')"
            class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Explorar Categorías
          </button>
        </div>
      `;
      return;
    }

    photosGrid.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h4 class="font-bold dark:text-white">📌 Mis Fotos Guardadas (${this.photos.length})</h4>
        <button
          onclick="PhotoGallery.exportPhotos()"
          class="text-sm bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition"
        >
          <i class="fas fa-download mr-1"></i> Exportar
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${this.photos.map(photo => `
          <div class="photo-card relative group overflow-hidden rounded-xl aspect-[4/3] bg-gray-200 dark:bg-gray-700">
            <img
              src="${photo.thumb || photo.url}"
              alt="${photo.description || 'Foto guardada'}"
              class="w-full h-full object-cover transition group-hover:scale-110"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
              <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p class="text-sm line-clamp-2 mb-2">${photo.description || 'Mi foto guardada'}</p>
                <div class="flex gap-2">
                  <button
                    onclick="PhotoGallery.viewPhoto('${photo.id}')"
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-3 rounded-lg transition"
                  >
                    <i class="fas fa-eye mr-1"></i> Ver
                  </button>
                  <button
                    onclick="PhotoGallery.removePhoto('${photo.id}')"
                    class="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg transition"
                  >
                    <i class="fas fa-trash mr-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // 📥 Exportar fotos como JSON
  exportPhotos() {
    const dataStr = JSON.stringify(this.photos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mis-fotos-japon-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    if (window.Notifications) {
      window.Notifications.success('📥 Fotos exportadas');
    }
  },

  // Re-inicializar cuando cambie el trip
  reinitialize() {
    this.initPhotosSync();
  }
};

// Exportar globalmente
window.PhotoGallery = PhotoGallery;
