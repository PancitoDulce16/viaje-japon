import { shoppingText as safe } from './shopping-state.js';
﻿// js/favorites-manager.js - Sistema de favoritos para atracciones y lugares

import { db, auth } from '../../core/firebase-config.js';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';

export const FavoritesManager = {
  favorites: [],
  unsubscribe: null,
  scope() { const uid=auth.currentUser?.uid || null;return {uid,tripId:uid?this.getCurrentTripId():null}; },
  sameScope(scope) { const current=this.scope();return scope.uid===current.uid&&scope.tripId===current.tripId; },
  cacheKey(scope=this.scope()) {return `japitin_favorites_${scope.uid || 'guest'}_${scope.tripId || 'personal'}`;},
  readCache(scope=this.scope()) {try{const data=JSON.parse(localStorage.getItem(this.cacheKey(scope)) || '[]');return Array.isArray(data)?data.filter(item=>item&&typeof item.name==='string'):[];}catch{return [];}},
  cache(scope,items) {try{localStorage.setItem(this.cacheKey(scope),JSON.stringify(items));}catch{ /* A confirmed cloud save remains valid when local caching is unavailable. */ }},
  async mutateFavorite(change) {
    const scope=this.scope();
    try {
      let items;
      if(scope.uid) {
        const target=scope.tripId?doc(db,`trips/${scope.tripId}/data`,'favorites'):doc(db,`users/${scope.uid}/data`,'favorites');
        items=await runTransaction(db,async transaction=>{
          if(!this.sameScope(scope))throw new Error('El viaje o la cuenta cambió.');
          const snapshot=await transaction.get(target);
          if(!this.sameScope(scope))throw new Error('Context changed');
          const stored=snapshot.exists()?snapshot.data().items:[];
          const next=change(Array.isArray(stored)?stored:[]);
          transaction.set(target,{items:next,lastUpdated:new Date().toISOString(),updatedBy:scope.uid});
          return next;
        });
      } else {
        items=change(this.readCache(scope));
        localStorage.setItem(this.cacheKey(scope),JSON.stringify(items));
      }
      if(!this.sameScope(scope))return false;
      this.favorites=items.filter(item=>item&&typeof item.name==='string');this.cache(scope,items);this.updateFavoritesUI();return true;
    } catch(error) {
      if(this.sameScope(scope))window.Notifications?.error('No se pudo guardar el favorito. Podés volver a intentarlo.');
      return false;
    }
  },

  // Inicializar
  async init() {
    console.log('⭐ Inicializando Favorites Manager...');

    // Cargar desde localStorage
    this.favorites=this.readCache();

    // Sincronizar con Firebase si hay usuario
    if (auth.currentUser) {
      await this.initSync();
    }

    console.log('✅ Favorites Manager listo con', this.favorites.length, 'favoritos');
  },

  // Inicializar sync
  async initSync() {
    const version=this.syncVersion=(this.syncVersion || 0)+1;
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const scope=this.scope();
    this.favorites=this.readCache(scope);this.updateFavoritesUI();
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
      if(version!==this.syncVersion || !this.sameScope(scope))return;
      if (docSnapshot.exists()) {
        const items=docSnapshot.data().items;
        this.favorites = Array.isArray(items)?items.filter(item=>item&&typeof item.name==='string'):[];
      } else {
        this.favorites = [];
      }

      this.cache(scope,this.favorites);

      // Actualizar UI de favoritos
      this.updateFavoritesUI();

      console.log('✅ Favoritos sincronizados:', this.favorites.length);
    }, (error) => {
      if(version!==this.syncVersion || !this.sameScope(scope))return;
      console.error('❌ ERROR en FavoritesManager onSnapshot - Full details:', {
        code: error.code,
        message: error.message,
        userId: userId,
        tripId: tripId || 'none',
        path: tripId ? `trips/${tripId}/data/favorites` : `users/${userId}/data/favorites`
      });
      // Fallback a localStorage
      this.favorites = this.readCache(scope);
      this.updateFavoritesUI();
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
      lat: place.lat ?? null,
      lng: place.lng ?? null,
      addedAt: new Date().toISOString(),
      addedBy: auth.currentUser ? auth.currentUser.email : 'Usuario local'
    };

    const saved=await this.mutateFavorite(items=>items.some(item=>item?.name===favorite.name&&item?.city===favorite.city)?items:[...items,favorite]);
    if(!saved)return;

    if (window.Notifications) {
      window.Notifications.success(`⭐ ${place.name} agregado a favoritos`);
    }

    // Vibración
    if (window.MobileEnhancements) {
      window.MobileEnhancements.vibrate?.([30, 50, 30]);
    }
  },

  // Remover de favoritos
  async removeFavorite(favoriteId) {
    const index = this.favorites.findIndex(fav => fav.id === favoriteId);

    if (index === -1) return;

    const favorite = this.favorites[index];
    if(!await this.mutateFavorite(items=>items.filter(item=>item?.id!==favoriteId)))return;

    if (window.Notifications) {
      window.Notifications.info(`Removido: ${favorite.name}`);
    }
  },

  // Verificar si un lugar es favorito
  isFavorite(placeName, city) {
    return this.favorites.some(fav => fav.name === placeName && fav.city === city);
  },

  // Guardar favoritos


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
    }, Object.create(null));

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
              📍 ${safe(city)}
              <span class="text-sm font-normal text-gray-500 dark:text-gray-400">(${cityFavorites.length})</span>
            </h4>
            <div class="space-y-3">
              ${cityFavorites.map(fav => `
                <div class="flex flex-wrap items-center gap-3 p-3 rounded-lg border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition group">
                  <div class="text-3xl">${safe(fav.icon)}</div>
                  <div class="flex-1 min-w-0 break-words">
                    <h5 class="font-semibold dark:text-white">${safe(fav.name)}</h5>
                    ${fav.description ? `<p class="text-sm text-gray-600 dark:text-gray-400">${safe(fav.description)}</p>` : ''}
                    <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      ${safe(fav.category)} • Agregado ${new Date(fav.addedAt).toLocaleDateString('es')}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2 transition">
                    ${fav.lat!=null && fav.lng!=null && Number.isFinite(Number(fav.lat)) && Number.isFinite(Number(fav.lng)) ? `
                      <button
                        data-favorite-action="map" data-favorite-id="${safe(fav.id)}"
                        class="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                        title="Ver en mapa" aria-label="Ver en mapa"
                      >
                        🗺️
                      </button>
                    ` : ''}
                    <button
                      data-favorite-action="add" data-favorite-id="${safe(fav.id)}"
                      class="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                      title="Agregar al itinerario" aria-label="Agregar al itinerario"
                    >
                      ➕
                    </button>
                    <button
                      data-favorite-action="remove" data-favorite-id="${safe(fav.id)}"
                      class="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                      title="Remover" aria-label="Remover"
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
    container.querySelectorAll('[data-favorite-action]').forEach(button=>button.addEventListener('click',()=>{
      const favorite=this.favorites.find(item=>item.id===button.dataset.favoriteId);if(!favorite)return;
      const action=button.dataset.favoriteAction;
      if(action==='map')this.showOnMap(Number(favorite.lat),Number(favorite.lng));
      if(action==='remove')this.removeFavorite(favorite.id);
      if(action==='add')this.addToItinerary(favorite.id);
    }));
  },

  // Mostrar en mapa
  showOnMap(lat, lng) {
    // Cambiar a tab de mapa
    if(window.DashboardApp)window.DashboardApp.switchTab('map');
    else window.AppCore?.switchTab('map');

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
  async addToItinerary(id,city){
    const favorite=this.favorites.find(item=>item.id===id)||(city?this.favorites.find(item=>item.name===id&&item.city===city):null);
    const scope=this.scope();
    if(!favorite||!scope.uid||!scope.tripId){window.Notifications?.error('Selecciona un viaje con itinerario.');return false;}
    this.pendingInsertions ||= new Set();const key=JSON.stringify([scope.uid,scope.tripId,favorite.id]);if(this.pendingInsertions.has(key))return false;
    this.pendingInsertions.add(key);
    try{
      const handler=window.ItineraryHandler||(await import('../itinerary/itinerary-v3.js')).ItineraryHandler;
      if(!this.sameScope(scope))return false;
      const days=handler.currentItinerary?.days?.filter(day=>day&&Number.isSafeInteger(Number(day.day))&&Number(day.day)>0);
      if(!Array.isArray(days)||!days.length)throw new Error('Abre o crea el itinerario del viaje primero.');
      const selected=await window.Dialogs.prompt({title:'Agregar al itinerario',message:`Elige el n\u00famero de d\u00eda (${days.map(day=>Number(day.day)).join(', ')}).`,placeholder:String(handler.__getCurrentDay?.()||days[0].day),inputType:'number'});
      if(selected==null||String(selected).trim()==='')return false;
      const day=Number(selected);if(!Number.isSafeInteger(day)||!days.some(item=>Number(item.day)===day))throw new Error('Selecciona un d\u00eda existente.');
      if(!this.sameScope(scope))return false;
      const saved=await handler.addFavoriteToItinerary({...favorite},{...scope,day});
      if(!saved||!this.sameScope(scope))return false;
      window.Notifications?.success('Lugar guardado en el itinerario.');
      document.getElementById('modal-favorites')?.classList.remove('active');document.body.style.overflow='';
      window.DashboardApp?.switchTab('itinerary');return true;
    }catch(error){if(this.sameScope(scope))window.Notifications?.error(error.message||'No se pudo guardar el lugar.');return false;}
    finally{this.pendingInsertions.delete(key);}
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
    return this.initSync();
  },

  // Limpiar estado
  cleanup() {
    this.syncVersion=(this.syncVersion || 0)+1;
    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribe = null;
    this.favorites = [];
    this.updateFavoritesUI();
    console.log('[FavoritesManager] 🧹 Estado de favoritos limpiado.');
  }
};

// Exportar globalmente
window.FavoritesManager = FavoritesManager;

// ====================================================================================
// MANEJO DE EVENTOS DE AUTENTICACIÓN
// ====================================================================================
window.addEventListener('auth:initialized', () => FavoritesManager.initSync());
window.addEventListener('auth:loggedOut', () => FavoritesManager.cleanup());
