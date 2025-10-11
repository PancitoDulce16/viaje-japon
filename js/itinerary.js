// js/itinerary.js - VERSIÓN MEJORADA con Creación Dinámica

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
let sortableInstance = null; // 🔥 Para drag & drop
let isListenerAttached = false;
let isFormListenerAttached = false; // 🔥 Para evitar listeners duplicados en el formulario

function getCurrentTripId() {
  if (window.TripsManager && window.TripsManager.currentTrip) {
    return window.TripsManager.currentTrip.id;
  }
  return localStorage.getItem('currentTripId');
}

async function loadItinerary() {
  const tripId = getCurrentTripId();
  
  if (!tripId) {
    console.log('⚠️ No hay trip seleccionado, cargando plantilla por defecto.');
    try {
        const response = await fetch('/data/attractions.json');
        const data = await response.json();
        currentItinerary = { days: data.suggestedItinerary };
        return currentItinerary;
    } catch (e) {
        console.error('❌ Error cargando el itinerario por defecto:', e);
        return null;
    }
  }
  
  try {
    const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
    const itinerarySnap = await getDoc(itineraryRef);
    
    if (itinerarySnap.exists()) {
      currentItinerary = itinerarySnap.data();
      console.log('✅ Itinerario cargado desde Firebase');
      return currentItinerary;
    } else {
      console.log('⚠️ No existe itinerario para este viaje, cargando plantilla por defecto.');
      try {
        const response = await fetch('/data/attractions.json');
        const data = await response.json();
        currentItinerary = { days: data.suggestedItinerary };
        return currentItinerary;
      } catch (e) {
        console.error('❌ Error cargando el itinerario por defecto:', e);
        return null;
      }
    }
  } catch (error) {
    console.error('❌ Error cargando itinerario:', error);
    try {
        const response = await fetch('/data/attractions.json');
        const data = await response.json();
        currentItinerary = { days: data.suggestedItinerary };
        return currentItinerary;
    } catch (e) {
        console.error('❌ Error cargando el itinerario por defecto:', e);
        return null;
    }
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
    const itinerary = currentItinerary;
    if (!itinerary || !itinerary.days) {
        renderNoItinerary();
        return;
    }
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
    
    const itinerary = currentItinerary;
    if (!itinerary || !itinerary.days) {
        container.innerHTML = '';
        return;
    }
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

// ⏱️ Calcular tiempo total del día
function calculateDayTime(activities) {
    let totalMinutes = 0;
    activities.forEach(act => {
        if (act.duration) {
            const match = act.duration.match(/(\d+)\s*(h|hora|horas|min|minuto|minutos)/gi);
            if (match) {
                match.forEach(m => {
                    const num = parseInt(m);
                    if (m.toLowerCase().includes('h') || m.toLowerCase().includes('hora')) {
                        totalMinutes += num * 60;
                    } else {
                        totalMinutes += num;
                    }
                });
            }
        }
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return 'No definido';
}

// 💰 Calcular costo total del día
function calculateDayBudget(activities) {
    return activities.reduce((total, act) => total + (act.cost || 0), 0);
}

function renderDayOverview(day) {
    const container = document.getElementById('dayOverview');
    if (!container) return;

    const completed = day.activities.filter(a => checkedActivities[a.id]).length;
    const progress = day.activities.length > 0 ? (completed / day.activities.length) * 100 : 0;
    const totalTime = calculateDayTime(day.activities);
    const totalBudget = calculateDayBudget(day.activities);

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

        <!-- ⏱️ Estadísticas del día -->
        <div class="mb-4 space-y-2">
            <div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="flex items-center gap-2">
                    <span class="text-lg">⏱️</span>
                    <span class="text-sm font-semibold dark:text-white">Tiempo total</span>
                </div>
                <span class="text-sm font-bold text-blue-600 dark:text-blue-400">${totalTime}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div class="flex items-center gap-2">
                    <span class="text-lg">💰</span>
                    <span class="text-sm font-semibold dark:text-white">Presupuesto</span>
                </div>
                <span class="text-sm font-bold text-green-600 dark:text-green-400">¥${totalBudget.toLocaleString()}</span>
            </div>
        </div>

        <div class="space-y-3 text-sm">
            <p class="font-semibold text-base dark:text-gray-300">${day.date}</p>
            <p class="font-bold text-lg text-red-600 dark:text-red-400">${day.title}</p>
            ${day.hotel ? `<p class="dark:text-gray-300">🏨 ${day.hotel}</p>` : ''}
            ${day.location ? `<p class="text-xs text-gray-500 dark:text-gray-400">📍 ${day.location}</p>` : ''}
        </div>
        <div class="mt-6">
            <button
                type="button"
                id="addActivityBtn_${day.day}"
                class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
                + Añadir Actividad
            </button>
        </div>
    `;
     
}

function renderActivities(day) {
    const container = document.getElementById('activitiesTimeline');
    if (!container) return;
    
    // 🔥 Limpiar Sortable anterior si existe
    if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
    }
    
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
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">${act.time}</span>
                                ${act.cost > 0 ? `<span class="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">¥${act.cost.toLocaleString()}</span>` : ''}
                            </div>
                            <h3 class="text-lg font-bold dark:text-white mb-1">${act.title}</h3>
                        </div>
                        <div class="flex gap-2 flex-shrink-0">
                            <button type="button" data-action="edit" data-activity-id="${act.id}" data-day="${day.day}" class="activity-edit-btn p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12V7a2 2 0 012-2h4l-2 2H7v5l-2 2z"></path></svg>
                            </button>
                            <button type="button" data-action="delete" data-activity-id="${act.id}" data-day="${day.day}" class="activity-delete-btn p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"></path></svg>
                            </button>
                        </div>
                    </div>
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

// 🔥 NUEVO: Inicializar drag & drop con SortableJS
function initializeDragAndDrop(container) {
    if (!container || typeof Sortable === 'undefined') {
        console.warn('Sortable no está disponible');
        return;
    }

    sortableInstance = new Sortable(container, {
        animation: 200,
        handle: '.activity-card', // Toda la card es draggable
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        
        onStart: function(evt) {
            evt.item.style.opacity = '0.5';
        },
        
        onEnd: function(evt) {
            evt.item.style.opacity = '1';
            
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            
            if (oldIndex === newIndex) return;
            
            // Actualizar el orden en el itinerario
            const dayData = currentItinerary.days.find(d => d.day === currentDay);
            if (!dayData) return;
            
            // Reorganizar array
            const [movedItem] = dayData.activities.splice(oldIndex, 1);
            dayData.activities.splice(newIndex, 0, movedItem);
            
            // 🔥 Guardar cambios en Firebase automáticamente
            saveReorderedActivities();
        }
    });
}

// 🔥 NUEVO: Guardar actividades reordenadas en Firebase
async function saveReorderedActivities() {
    const tripId = getCurrentTripId();
    if (!tripId || !currentItinerary) return;
    
    try {
        const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
        await setDoc(itineraryRef, currentItinerary);
        
        // Mostrar notificación de éxito
        if (window.Notifications) {
            window.Notifications.success('✅ Orden actualizado');
        }
        
        console.log('✅ Actividades reordenadas guardadas');
    } catch (error) {
        console.error('❌ Error guardando orden:', error);
        if (window.Notifications) {
            window.Notifications.error('❌ Error al guardar orden');
        }
    }
}

export const ItineraryHandler = {
    // 🔥 Exponer currentItinerary para que otros módulos puedan accederlo
    get currentItinerary() {
        return currentItinerary;
    },

    // 🔥 Asegurar que el itinerario esté cargado (útil para otros módulos)
    async ensureLoaded() {
        if (!currentItinerary) {
            await loadItinerary();
        }
        return currentItinerary;
    },

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
            <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[72px] z-10 shadow-sm">
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

        if (!isListenerAttached) {
            container.addEventListener('click', (e) => {
                const addBtn = e.target.closest('[id^="addActivityBtn_"]');
                const editBtn = e.target.closest('.activity-edit-btn');
                const deleteBtn = e.target.closest('.activity-delete-btn');
                const dayBtn = e.target.closest('.day-btn');

                if (addBtn) {
                    console.log('✅ Botón "Añadir Actividad" clickeado:', addBtn.id);
                    const day = parseInt(addBtn.id.split('_')[1]);
                    console.log('📅 Día extraído:', day);
                    ItineraryHandler.showActivityModal(null, day);
                } else if (editBtn) {
                    const activityId = editBtn.dataset.activityId;
                    const dayNum = parseInt(editBtn.dataset.day);
                    ItineraryHandler.showActivityModal(activityId, dayNum);
                } else if (deleteBtn) {
                    const activityId = deleteBtn.dataset.activityId;
                    const dayNum = parseInt(deleteBtn.dataset.day);
                    ItineraryHandler.deleteActivity(activityId, dayNum);
                } else if (dayBtn) {
                    selectDay(parseInt(dayBtn.dataset.day));
                }
            });

            container.addEventListener('change', (e) => {
                const checkbox = e.target.closest('.activity-checkbox');
                if (checkbox) {
                    toggleActivity(checkbox.dataset.id);
                }
            });
            isListenerAttached = true;
        }

        const timeline = document.getElementById('activitiesTimeline');
        if (timeline) {
            initializeDragAndDrop(timeline);
        }

        // 🔥 Solo agregar listener al formulario una vez
        if (!isFormListenerAttached) {
            const activityForm = document.getElementById('activityForm');
            if (activityForm) {
                activityForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    ItineraryHandler.saveActivity();
                });
                isFormListenerAttached = true;
                console.log('✅ Form listener attached');
            }
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
    },

    showActivityModal(activityId, day) {
        try {
            console.log('🔔 showActivityModal llamado con:', { activityId, day });

            // Esperar a que el DOM esté completamente cargado
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.showActivityModal(activityId, day);
                });
                return;
            }

            const modal = document.getElementById('activityModal');
            if (!modal) {
                console.error('❌ Modal de actividad no encontrado en el DOM');
                console.log('📋 Elementos en el body:', document.body.children.length);
                console.log('📋 modalsContainer existe:', !!document.getElementById('modalsContainer'));
                return;
            }
            console.log('✅ Modal encontrado:', modal);

            const form = document.getElementById('activityForm');
            const modalTitle = document.getElementById('activityModalTitle');

            if (form) form.reset();

            const dayInput = document.getElementById('activityDay');
            if (dayInput) {
                dayInput.value = day;
            } else {
                console.error('❌ Input activityDay no encontrado');
            }

            if (activityId) {
                // Modo Editar
                if (modalTitle) modalTitle.textContent = 'Editar Actividad';
                const dayData = currentItinerary.days.find(d => d.day === day);
                const activity = dayData?.activities.find(a => a.id === activityId);

                if (activity) {
                    document.getElementById('activityId').value = activity.id;
                    document.getElementById('activityIcon').value = activity.icon || '';
                    document.getElementById('activityTime').value = activity.time || '';
                    document.getElementById('activityTitle').value = activity.title || '';
                    document.getElementById('activityDesc').value = activity.desc || '';
                    document.getElementById('activityCost').value = activity.cost || 0;
                    document.getElementById('activityStation').value = activity.station || '';
                }
            } else {
                // Modo Crear
                if (modalTitle) modalTitle.textContent = 'Añadir Actividad';
                const activityIdInput = document.getElementById('activityId');
                if (activityIdInput) activityIdInput.value = '';
            }

            // 🔥 Usar clases de Tailwind en lugar de estilos inline
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';

            console.log('✅ Modal de actividad abierto', { activityId, day });
        } catch (error) {
            console.error('❌ Error en showActivityModal:', error);
            alert('Error al abrir el modal. Por favor, revisa la consola.');
        }
    },

    closeActivityModal() {
        try {
            const modal = document.getElementById('activityModal');
            if (modal) {
                // 🔥 Usar clases de Tailwind en lugar de estilos inline
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                document.body.style.overflow = '';
            }

            // Limpiar formulario
            const form = document.getElementById('activityForm');
            if (form) form.reset();

            console.log('✅ Modal de actividad cerrado');
        } catch (error) {
            console.error('❌ Error en closeActivityModal:', error);
        }
    },

    async deleteActivity(activityId, day) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
            return;
        }

        const tripId = getCurrentTripId();
        if (!tripId) {
            Notifications.show('No hay un viaje seleccionado.', 'error');
            return;
        }

        const dayData = currentItinerary.days.find(d => d.day === day);
        if (!dayData) {
            Notifications.show('El día del itinerario no es válido.', 'error');
            return;
        }

        const activityIndex = dayData.activities.findIndex(a => a.id === activityId);
        if (activityIndex > -1) {
            dayData.activities.splice(activityIndex, 1);

            try {
                const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
                await setDoc(itineraryRef, currentItinerary);
                Notifications.show('Actividad eliminada con éxito.', 'success');

                // 🔥 Recargar y renderizar el itinerario para actualizar la vista
                await loadItinerary();
                render();
            } catch (error) {
                console.error("Error al eliminar la actividad:", error);
                Notifications.show('Error al eliminar la actividad.', 'error');
                // Revertir el cambio en caso de error
                dayData.activities.splice(activityIndex, 0, currentItinerary.days.find(d => d.day === day).activities[activityIndex]);
            }
        }
    },

    async saveActivity() {
        const tripId = getCurrentTripId();
        if (!tripId) {
            Notifications.show('No hay un viaje seleccionado.', 'error');
            return;
        }

        const activityId = document.getElementById('activityId').value;
        const day = parseInt(document.getElementById('activityDay').value);

        const newActivityData = {
            id: activityId || `${Date.now()}`,
            icon: document.getElementById('activityIcon').value || '📍',
            time: document.getElementById('activityTime').value || 'Sin hora',
            title: document.getElementById('activityTitle').value,
            desc: document.getElementById('activityDesc').value,
            cost: parseInt(document.getElementById('activityCost').value) || 0,
            station: document.getElementById('activityStation').value
        };

        if (!newActivityData.title) {
            Notifications.show('El título es obligatorio.', 'error');
            return;
        }

        const dayData = currentItinerary.days.find(d => d.day === day);
        if (!dayData) {
            Notifications.show('El día del itinerario no es válido.', 'error');
            return;
        }

        if (activityId) {
            // Editar
            const activityIndex = dayData.activities.findIndex(a => a.id === activityId);
            if (activityIndex > -1) {
                dayData.activities[activityIndex] = { ...dayData.activities[activityIndex], ...newActivityData };
            }
        } else {
            // Crear
            dayData.activities.push(newActivityData);
        }

        try {
            const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
            await setDoc(itineraryRef, currentItinerary);
            Notifications.show('Actividad guardada con éxito.', 'success');
            this.closeActivityModal();

            // 🔥 Recargar y renderizar el itinerario para actualizar la vista
            await loadItinerary();
            render();
        } catch (error) {
            console.error("Error al guardar la actividad:", error);
            Notifications.show('Error al guardar la actividad.', 'error');
        }
    }
};

// Inicializar cuando cambia el estado de autenticación
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
  initRealtimeSync();
});

window.ItineraryHandler = ItineraryHandler;
