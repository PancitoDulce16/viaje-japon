// js/favorites-manager.js - Sistema de favoritos para atracciones y lugares

import { db, auth } from './firebase-config.js';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const FavoritesManager = {
  favorites: [],
  unsubscribe: null,

  // Inicializar
  async init() {
    console.log('⭐ Inicializando Favorites Manager...');

    // Cargar desde localStorage
    const localData = localStorage.getItem('favorites');
    if (localData) {
      try {
        this.favorites = JSON.parse(localData);
      } catch (e) {
        console.error('Error parsing favorites:', e);
        this.favorites = [];
      }
    }

    // Sincronizar con Firebase si hay usuario
    if (auth.currentUser) {
      await this.initSync();
    }

    console.log('✅ Favorites Manager listo con', this.favorites.length, 'favoritos');
  },

  // Inicializar sync
  async initSync() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    if (!auth.currentUser) return;

    const tripId = this.getCurrentTripId();
    const userId = auth.currentUser.uid;

    let favoritesRef;

    if (tripId) {
      // Modo colaborativo: favoritos compartidos
      favoritesRef = doc(db, `trips/${tripId}/data`, 'favorites');
      console.log('⭐ Favoritos en modo colaborativo');
    } else {
      // Modo individual
      favoritesRef = doc(db, `users/${userId}/data`, 'favorites');
      console.log('⭐ Favoritos en modo individual');
    }

    this.unsubscribe = onSnapshot(favoritesRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        this.favorites = docSnapshot.data().items || [];
      } else {
        this.favorites = [];
      }

      localStorage.setItem('favorites', JSON.stringify(this.favorites));

      // Actualizar UI de favoritos
      this.updateFavoritesUI();

      console.log('✅ Favoritos sincronizados:', this.favorites.length);
    }, (error) => {
      console.error('❌ Error en sync de favoritos:', error);
    });
  },

  // Obtener trip ID
  getCurrentTripId() {
    if (window.TripsManager && window.TripsManager.currentTrip) {
      return window.TripsManager.currentTrip.id;
    }
    return localStorage.getItem('currentTripId');
  },

  // Agregar a favoritos
  async addFavorite(place) {
    // Verificar si ya está en favoritos
    const exists = this.favorites.some(fav => fav.name === place.name && fav.city === place.city);

    if (exists) {
      if (window.Notifications) {
        window.Notifications.warning('Ya está en favoritos');
      }
      return;
    }

    const favorite = {
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: place.name,
      city: place.city || 'Japón',
      category: place.category || 'Atracción',
      icon: place.icon || '📍',
      description: place.description || '',
      lat: place.lat || null,
      lng: place.lng || null,
      addedAt: new Date().toISOString(),
      addedBy: auth.currentUser ? auth.currentUser.email : 'Usuario local'
    };

    this.favorites.push(favorite);

    await this.saveFavorites();

    if (window.Notifications) {
      window.Notifications.success(`⭐ ${place.name} agregado a favoritos`);
    }

    // Vibración
    if (window.MobileEnhancements) {
      window.MobileEnhancements.vibrate([30, 50, 30]);
    }
  },

  // Remover de favoritos
  async removeFavorite(favoriteId) {
    const index = this.favorites.findIndex(fav => fav.id === favoriteId);

    if (index === -1) return;

    const favorite = this.favorites[index];
    this.favorites.splice(index, 1);

    await this.saveFavorites();

    if (window.Notifications) {
      window.Notifications.info(`Removido: ${favorite.name}`);
    }
  },

  // Verificar si un lugar es favorito
  isFavorite(placeName, city) {
    return this.favorites.some(fav => fav.name === placeName && fav.city === city);
  },

  // Guardar favoritos
  async saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));

    this.updateFavoritesUI();

    if (!auth.currentUser) return;

    try {
      const tripId = this.getCurrentTripId();
      const userId = auth.currentUser.uid;

      let favoritesRef;

      if (tripId) {
        favoritesRef = doc(db, `trips/${tripId}/data`, 'favorites');
      } else {
        favoritesRef = doc(db, `users/${userId}/data`, 'favorites');
      }

      await setDoc(favoritesRef, {
        items: this.favorites,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser.email
      });

      console.log('✅ Favoritos guardados');
    } catch (error) {
      console.error('❌ Error guardando favoritos:', error);
    }
  },

  // Actualizar UI de favoritos
  updateFavoritesUI() {
    // Actualizar iconos de favoritos en el mapa y atracciones
    this.updateMapFavoriteIcons();
    this.updateAttractionsFavoriteIcons();

    // Renderizar lista de favoritos si el modal está abierto
    const favoritesModal = document.getElementById('modal-favorites');
    if (favoritesModal && favoritesModal.classList.contains('active')) {
      this.renderFavoritesList();
    }
  },

  // Actualizar iconos en el mapa
  updateMapFavoriteIcons() {
    // Este método se puede expandir para actualizar los markers del mapa
    if (window.MapHandler) {
      // Agregar estrellita a markers favoritos
    }
  },

  // Actualizar iconos en atracciones
  updateAttractionsFavoriteIcons() {
    // Agregar clase o icono a cards de atracciones favoritas
    document.querySelectorAll('[data-attraction-name]').forEach(card => {
      const name = card.dataset.attractionName;
      const city = card.dataset.attractionCity;

      if (this.isFavorite(name, city)) {
        card.classList.add('is-favorite');
      } else {
        card.classList.remove('is-favorite');
      }
    });
  },

  // Renderizar lista de favoritos
  renderFavoritesList() {
    const container = document.getElementById('favoritesListContainer');
    if (!container) return;

    if (this.favorites.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-6xl mb-4">⭐</div>
          <p class="text-gray-600 dark:text-gray-400 text-lg mb-2">
            No tienes favoritos aún
          </p>
          <p class="text-gray-500 dark:text-gray-500 text-sm">
            Agrega lugares desde el mapa o la lista de atracciones
          </p>
        </div>
      `;
      return;
    }

    // Agrupar por ciudad
    const byCity = this.favorites.reduce((acc, fav) => {
      if (!acc[fav.city]) {
        acc[fav.city] = [];
      }
      acc[fav.city].push(fav);
      return acc;
    }, {});

    container.innerHTML = `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 text-center">
          <div class="text-5xl mb-2">⭐</div>
          <h3 class="text-2xl font-bold mb-1">Mis Favoritos</h3>
          <p class="text-white/80">${this.favorites.length} lugar${this.favorites.length !== 1 ? 'es' : ''} guardado${this.favorites.length !== 1 ? 's' : ''}</p>
        </div>

        ${Object.entries(byCity).map(([city, cityFavorites]) => `
          <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <h4 class="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
              📍 ${city}
              <span class="text-sm font-normal text-gray-500 dark:text-gray-400">(${cityFavorites.length})</span>
            </h4>
            <div class="space-y-3">
              ${cityFavorites.map(fav => `
                <div class="flex items-center gap-3 p-3 rounded-lg border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition group">
                  <div class="text-3xl">${fav.icon}</div>
                  <div class="flex-1">
                    <h5 class="font-semibold dark:text-white">${fav.name}</h5>
                    ${fav.description ? `<p class="text-sm text-gray-600 dark:text-gray-400">${fav.description}</p>` : ''}
                    <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      ${fav.category} • Agregado ${new Date(fav.addedAt).toLocaleDateString('es')}
                    </p>
                  </div>
                  <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    ${fav.lat && fav.lng ? `
                      <button
                        onclick="FavoritesManager.showOnMap(${fav.lat}, ${fav.lng})"
                        class="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                        title="Ver en mapa"
                      >
                        🗺️
                      </button>
                    ` : ''}
                    <button
                      onclick="FavoritesManager.addToItinerary('${fav.name.replace(/'/g, "\\'")}', '${fav.city}')"
                      class="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                      title="Agregar al itinerario"
                    >
                      ➕
                    </button>
                    <button
                      onclick="FavoritesManager.removeFavorite('${fav.id}')"
                      class="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                      title="Remover"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}

        <button
          onclick="FavoritesManager.exportFavorites()"
          class="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          📥 Exportar Favoritos (JSON)
        </button>
      </div>
    `;
  },

  // Mostrar en mapa
  showOnMap(lat, lng) {
    // Cambiar a tab de mapa
    if (window.AppCore) {
      window.AppCore.switchTab('map');
    }

    // Centrar mapa
    if (window.MapHandler && window.MapHandler.map) {
      window.MapHandler.map.setView([lat, lng], 15);

      // Cerrar modal de favoritos
      const modal = document.getElementById('modal-favorites');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  },

  // Agregar al itinerario
  async addToItinerary(placeName, city) {
    try {
      const { ItineraryHandler } = await import('./itinerary.js');

      const currentTripId = window.TripsManager?.currentTripId;

      if (!currentTripId) {
        if (window.Notifications) {
          window.Notifications.warning('⚠️ Por favor selecciona un viaje primero');
        }
        return;
      }

      const activity = {
        time: '10:00',
        activity: `Visitar ${placeName}`,
        location: placeName,
        notes: `📍 ${city}`
      };

      if (window.Notifications) {
        window.Notifications.success(`✅ "${placeName}" listo para agregar al itinerario`);
      }

      // Cambiar a tab de itinerario
      if (window.AppCore) {
        window.AppCore.switchTab('itinerary');
      }
    } catch (error) {
      console.error('Error agregando al itinerario:', error);
      if (window.Notifications) {
        window.Notifications.error('❌ Error al agregar al itinerario');
      }
    }
  },

  // Exportar favoritos
  exportFavorites() {
    const dataStr = JSON.stringify(this.favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `favoritos-japon-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);

    if (window.Notifications) {
      window.Notifications.success('📥 Favoritos exportados');
    }
  },

  // Re-inicializar
  reinitialize() {
    this.initSync();
  }
};

// Exportar globalmente
window.FavoritesManager = FavoritesManager;
