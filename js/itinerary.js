// js/itinerary.js - VERSIÓN MEJORADA con Creación Dinámica

import { ITINERARY_DATA } from './itinerary-data.js';
import { db, auth } from './firebase-config.js';
import { Notifications } from './notifications.js';
import { 
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let checkedActivities = {};
let currentDay = 1;
let unsubscribe = null;
let currentItinerary = null;

function getCurrentTripId() {
  if (window.TripsManager && window.TripsManager.currentTrip) {
    return window.TripsManager.currentTrip.id;
  }
  return localStorage.getItem('currentTripId');
}

async function loadItinerary() {
  const tripId = getCurrentTripId();
  
  if (!tripId) {
    console.log('⚠️ No hay trip seleccionado');
    return null;
  }
  
  try {
    const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
    const itinerarySnap = await getDoc(itineraryRef);
    
    if (itinerarySnap.exists()) {
      currentItinerary = itinerarySnap.data();
      console.log('✅ Itinerario cargado desde Firebase');
      return currentItinerary;
    } else {
      console.log('⚠️ No existe itinerario para este viaje');
      return null;
    }
  } catch (error) {
    console.error('❌ Error cargando itinerario:', error);
    return null;
  }
}

async function initRealtimeSync() {
  if (unsubscribe) {
    unsubscribe();
  }

  if (!auth.currentUser) {
    checkedActivities = JSON.parse(localStorage.getItem('checkedActivities') || '{}');
    render();
    return;
  }

  const tripId = getCurrentTripId();

  if (!tripId) {
    console.log('⚠️ No hay trip seleccionado');
    renderEmptyState();
    return;
  }

  console.log('🤝 Modo colaborativo activado para trip:', tripId);
  const checklistRef = doc(db, `trips/${tripId}/activities`, 'checklist');

  unsubscribe = onSnapshot(checklistRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      checkedActivities = docSnapshot.data().checked || {};
    } else {
      checkedActivities = {};
    }
    
    localStorage.setItem('checkedActivities', JSON.stringify(checkedActivities));
    render();
    
    console.log('✅ Checklist sincronizado:', Object.keys(checkedActivities).length, 'actividades');
  }, (error) => {
    console.error('❌ Error en sync:', error);
    checkedActivities = JSON.parse(localStorage.getItem('checkedActivities') || '{}');
    render();
  });
}

function selectDay(dayNumber) {
    currentDay = dayNumber;
    render();
}

async function toggleActivity(activityId) {
    checkedActivities[activityId] = !checkedActivities[activityId];
    
    try {
      if (!auth.currentUser) {
        localStorage.setItem('checkedActivities', JSON.stringify(checkedActivities));
        render();
        return;
      }

      const tripId = getCurrentTripId();

      if (!tripId) {
        alert('⚠️ Debes seleccionar un viaje primero');
        return;
      }

      const checklistRef = doc(db, `trips/${tripId}/activities`, 'checklist');
      
      await setDoc(checklistRef, {
        checked: checkedActivities,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser.email
      });
      
      console.log('✅ Actividad sincronizada por:', auth.currentUser.email);
    } catch (error) {
      console.error('❌ Error guardando actividad:', error);
      checkedActivities[activityId] = !checkedActivities[activityId];
      render();
      alert('Error al sincronizar. Intenta de nuevo.');
    }
}

// 🔥 NUEVO: Renderizar cuando no hay itinerario creado
function renderNoItinerary() {
  const container = document.getElementById('content-itinerary');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-4xl mx-auto p-8 text-center">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
        <div class="text-6xl mb-6">✈️</div>
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          ¡Crea tu Itinerario!
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Planifica tu viaje perfecto con nuestro sistema intuitivo.<br>
          Elige entre plantillas o crea uno desde cero.
        </p>
        
        <div class="grid md:grid-cols-3 gap-4 mb-8">
          <div class="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <div class="text-4xl mb-3">🎯</div>
            <h3 class="font-bold mb-2 dark:text-white">Personalizado</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Selecciona tus intereses y recibe sugerencias</p>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <div class="text-4xl mb-3">📋</div>
            <h3 class="font-bold mb-2 dark:text-white">Plantillas</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Elige entre varios estilos de viaje</p>
          </div>
          <div class="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <div class="text-4xl mb-3">🚀</div>
            <h3 class="font-bold mb-2 dark:text-white">Drag & Drop</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Reorganiza tu itinerario fácilmente</p>
          </div>
        </div>
        
        <button 
          onclick="ItineraryBuilder.showCreateItineraryWizard()"
          class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-bold text-lg shadow-lg"
        >
          ✨ Crear Itinerario
        </button>
      </div>
    </div>
  `;
}

// 🔥 NUEVO: Renderizar estado vacío cuando no hay trip
function renderEmptyState() {
  const container = document.getElementById('content-itinerary');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-4xl mx-auto p-8 text-center">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
        <div class="text-6xl mb-4">🗺️</div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          No hay viaje seleccionado
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Para crear un itinerario, primero debes crear o seleccionar un viaje.
        </p>
        <div class="flex gap-3 justify-center flex-wrap">
          <button 
            onclick="TripsManager.showCreateTripModal()"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            ➕ Crear Viaje
          </button>
          <button 
            onclick="TripsManager.showTripsListModal()"
            class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            📂 Ver Mis Viajes
          </button>
        </div>
      </div>
    </div>
  `;
}

async function render() {
    // Si no hay itinerario personalizado, usar el hardcodeado como backup
    const itinerary = currentItinerary || { days: ITINERARY_DATA };
    const dayData = itinerary.days ? itinerary.days.find(d => d.day === currentDay) : null;
    
    if (!dayData) return;
    
    renderTripSelector();
    renderDaySelector();
    renderDayOverview(dayData);
    renderActivities(dayData);
}

// 🔥 NUEVO: Renderizar selector de viaje en la parte superior
function renderTripSelector() {
    const container = document.getElementById('tripSelectorHeader');
    if (!container) return;

    const currentTrip = window.TripsManager?.currentTrip;
    
    if (!currentTrip) {
      container.innerHTML = '';
      return;
    }

    const userTrips = window.TripsManager?.userTrips || [];
    
    container.innerHTML = `
      <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg mb-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3 flex-1">
            <div class="text-2xl">🗺️</div>
            <div>
              <h3 class="font-bold text-lg">${currentTrip.info.name}</h3>
              <p class="text-xs text-white/80">
                ${new Date(currentTrip.info.dateStart).toLocaleDateString('es')} - 
                ${new Date(currentTrip.info.dateEnd).toLocaleDateString('es')}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            ${userTrips.length > 1 ? `
              <button 
                onclick="TripsManager.showTripsListModal()"
                class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition text-sm font-semibold backdrop-blur-sm"
              >
                🔄 Cambiar Viaje
              </button>
            ` : ''}
            <button 
              onclick="TripsManager.showShareCode()"
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition text-sm font-semibold backdrop-blur-sm"
            >
              🔗 Compartir
            </button>
            ${!currentItinerary ? `
              <button 
                onclick="ItineraryBuilder.showCreateItineraryWizard()"
                class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition text-sm font-semibold shadow-md"
              >
                ✨ Crear Itinerario
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
}

function renderDaySelector() {
    const container = document.getElementById('daySelector');
    if (!container) return;
    
    const itinerary = currentItinerary || { days: ITINERARY_DATA };
    const days = itinerary.days || [];
    
    container.innerHTML = days.map(day => `
        <button data-day="${day.day}" class="day-btn px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
            currentDay === day.day 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }">
            Día ${day.day}
        </button>
    `).join('');
}

function renderDayOverview(day) {
    const container = document.getElementById('dayOverview');
    if (!container) return;
    
    const completed = day.activities.filter(a => checkedActivities[a.id]).length;
    const progress = day.activities.length > 0 ? (completed / day.activities.length) * 100 : 0;
    
    const tripId = getCurrentTripId();
    let syncStatus;
    
    if (!auth.currentUser) {
      syncStatus = '<span class="text-xs text-yellow-600 dark:text-yellow-400">📱 Solo local</span>';
    } else if (tripId) {
      syncStatus = '<span class="text-xs text-green-600 dark:text-green-400">🤝 Modo Colaborativo</span>';
    } else {
      syncStatus = '<span class="text-xs text-blue-600 dark:text-blue-400">☁️ Sincronizado</span>';
    }
    
    container.innerHTML = `
        <div class="flex items-center gap-2 mb-4">
            <span class="text-2xl">📅</span>
            <h2 class="text-2xl font-bold dark:text-white">Día ${day.day}</h2>
        </div>
        <div class="mb-4">
            <div class="flex justify-between text-sm mb-1 dark:text-gray-300">
                <span>Progreso</span>
                <span>${completed}/${day.activities.length}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-red-600 h-2 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
            </div>
            <div class="mt-2 text-right">
                ${syncStatus}
            </div>
        </div>
        <div class="space-y-3 text-sm">
            <p class="font-semibold text-base dark:text-gray-300">${day.date}</p>
            <p class="font-bold text-lg text-red-600 dark:text-red-400">${day.title}</p>
            ${day.hotel ? `<p class="dark:text-gray-300">🏨 ${day.hotel}</p>` : ''}
            ${day.location ? `<p class="text-xs text-gray-500 dark:text-gray-400">📍 ${day.location}</p>` : ''}
        </div>
    `;
}

function renderActivities(day) {
    const container = document.getElementById('activitiesTimeline');
    if (!container) return;
    
    container.innerHTML = day.activities.map((act, i) => `
        <div class="activity-card bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 border-red-500 fade-in transition-all hover:shadow-lg ${
            checkedActivities[act.id] ? 'opacity-60' : ''
        }" style="animation-delay: ${i * 0.05}s">
            <div class="p-5 flex items-start gap-4">
                <input 
                    type="checkbox" 
                    data-id="${act.id}" 
                    ${checkedActivities[act.id] ? 'checked' : ''} 
                    class="activity-checkbox mt-1 w-5 h-5 cursor-pointer accent-red-600 flex-shrink-0"
                >
                <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-2xl flex-shrink-0">
                    ${act.icon}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">${act.time}</span>
                        ${act.cost > 0 ? `<span class="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">¥${act.cost.toLocaleString()}</span>` : ''}
                    </div>
                    <h3 class="text-lg font-bold dark:text-white mb-1">${act.title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${act.desc}</p>
                    ${act.station ? `<p class="text-xs text-gray-500 dark:text-gray-500 mt-2">🚉 ${act.station}</p>` : ''}
                    ${act.train ? `
                        <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-2 border-blue-500">
                            <p class="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">🚄 ${act.train.line}</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400">${act.train.from} → ${act.train.to}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-500">⏱️ ${act.train.duration}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

export const ItineraryHandler = {
    async init() {
        const container = document.getElementById('content-itinerary');
        if (!container) return;
        
        // Verificar si hay trip seleccionado
        const tripId = getCurrentTripId();
        
        if (!tripId) {
          renderEmptyState();
          return;
        }
        
        // Cargar itinerario
        await loadItinerary();
        
        // Si no hay itinerario creado, mostrar pantalla de creación
        if (!currentItinerary) {
          renderNoItinerary();
          return;
        }

        container.innerHTML = `
            <!-- Selector de Viaje -->
            <div class="max-w-6xl mx-auto px-4 pt-4">
                <div id="tripSelectorHeader"></div>
            </div>

            <!-- Selector de Días -->
            <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[72px] z-30 shadow-sm">
                <div class="max-w-6xl mx-auto p-4">
                    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" id="daySelector"></div>
                </div>
            </div>

            <!-- Contenido del Itinerario -->
            <div class="max-w-6xl mx-auto p-4 md:p-6">
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="md:col-span-1">
                        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-36 fade-in" id="dayOverview"></div>
                    </div>
                    <div class="md:col-span-2">
                        <div class="space-y-4" id="activitiesTimeline"></div>
                    </div>
                </div>
            </div>
        `;

        // Inicializar sync en tiempo real
        await initRealtimeSync();

        const daySelector = document.getElementById('daySelector');
        if (daySelector) {
            daySelector.addEventListener('click', (e) => {
                const btn = e.target.closest('.day-btn');
                if (btn) selectDay(parseInt(btn.dataset.day));
            });
        }

        const timeline = document.getElementById('activitiesTimeline');
        if (timeline) {
            timeline.addEventListener('change', (e) => {
                const checkbox = e.target.closest('.activity-checkbox');
                if (checkbox) toggleActivity(checkbox.dataset.id);
            });
        }
    },
    
    // Re-inicializar cuando cambie el trip
    async reinitialize() {
      const tripId = getCurrentTripId();
      
      if (!tripId) {
        renderEmptyState();
        return;
      }
      
      // Recargar itinerario
      await loadItinerary();
      
      if (!currentItinerary) {
        renderNoItinerary();
        return;
      }
      
      await initRealtimeSync();
      
      // Re-render completo
      await this.init();
    }
};

// Inicializar cuando cambia el estado de autenticación
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
  initRealtimeSync();
});

window.ItineraryHandler = ItineraryHandler;
