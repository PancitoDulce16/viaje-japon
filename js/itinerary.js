// js/itinerary.js - VERSIÓN MEJORADA con Creación Dinámica

import { db, auth } from './firebase-config.js';
import { Notifications } from './notifications.js';
import { 
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Local cities fallback provider
import { searchCities } from '../data/japan-cities.js';
import { APP_CONFIG } from './config.js';

let checkedActivities = {};
let currentDay = 1;
let unsubscribe = null;
let currentItinerary = null;
let sortableInstance = null; // 🔥 Para drag & drop
let isListenerAttached = false;

// Debounced local save timer
let saveDebounceTimer = null;

// --- Google Places integration (uses provided API key if available) ---
const GOOGLE_PLACES_API_KEY = APP_CONFIG?.GOOGLE_PLACES_API_KEY || '';
let googlePlacesReady = false;
let googlePlacesPromise = null;
let googleAutocompleteService = null;

function loadGooglePlaces() {
  if (!GOOGLE_PLACES_API_KEY) return Promise.reject(new Error('No API key'));
  if (googlePlacesPromise) return googlePlacesPromise;

  googlePlacesPromise = new Promise((resolve, reject) => {
    // If already available
    if (window.google && window.google.maps && window.google.maps.places) {
      googleAutocompleteService = new google.maps.places.AutocompleteService();
      googlePlacesReady = true;
      return resolve(true);
    }

    // Create callback
    const callbackName = '__initGooglePlaces_' + Date.now();
    window[callbackName] = () => {
      try {
        googleAutocompleteService = new google.maps.places.AutocompleteService();
        googlePlacesReady = true;
        resolve(true);
      } catch (e) {
        reject(e);
      } finally {
        try { delete window[callbackName]; } catch (e) {}
      }
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });

  return googlePlacesPromise;
}

function getGooglePlacePredictions(input) {
  return new Promise((resolve) => {
    if (!googlePlacesReady || !googleAutocompleteService) return resolve([]);
    googleAutocompleteService.getPlacePredictions({ input, types: ['(cities)'] }, (predictions, status) => {
      if (!predictions || !predictions.length) return resolve([]);
      const results = predictions.map(p => ({ id: p.place_id, name: p.structured_formatting ? p.structured_formatting.main_text : p.description }));
      resolve(results);
    });
  });
}

function getCurrentTripId() {
  if (window.TripsManager && window.TripsManager.currentTrip) {
    return window.TripsManager.currentTrip.id;
  }
  return localStorage.getItem('currentTripId');
}

async function saveCurrentItineraryToFirebase() {
  const tripId = getCurrentTripId();
  if (!tripId || !currentItinerary) throw new Error('No trip or itinerary');

  try {
    const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
    await setDoc(itineraryRef, currentItinerary);
    return true;
  } catch (e) {
    console.error('Error saving itinerary to Firebase', e);
    throw e;
  }
}

async function importLocalIntoTrip() {
  if (!currentItinerary) {
    throw new Error('No currentItinerary to import into');
  }
  const local = window.localItinerary || [];
  if (!local.length) return;

  // Build map by date for existing days
  const existingByDate = new Map();
  (currentItinerary.days || []).forEach(d => {
    if (d.date) existingByDate.set(d.date, d);
  });

  // Determine starting day number
  const maxDay = (currentItinerary.days || []).reduce((m, d) => Math.max(m, d.day || 0), 0);
  let nextDay = maxDay + 1;

  // Merge: for each local entry, if date exists, update its title/location; else create new day object
  for (const entry of local) {
    const existing = existingByDate.get(entry.date);
    if (existing) {
      // last added wins for city, preserve notes: store in day.notes
      existing.title = entry.city;
      existing.date = entry.date;
      existing.notes = existing.notes || entry.notes || '';
    } else {
      const newDay = {
        day: nextDay++,
        date: entry.date,
        title: entry.city,
        activities: [],
        notes: entry.notes || ''
      };
      currentItinerary.days.push(newDay);
    }
  }

  // Remove duplicate dates and sort chronologically by date, then reassign day numbers sequentially starting at 1
  const uniqueByDate = new Map();
  currentItinerary.days.sort((a,b) => new Date(a.date) - new Date(b.date));
  currentItinerary.days.forEach(d => {
    if (!uniqueByDate.has(d.date)) {
      uniqueByDate.set(d.date, d);
    } else {
      // merge: keep the later one (already in place), or prefer non-empty activities
      const prev = uniqueByDate.get(d.date);
      if ((d.activities || []).length > (prev.activities || []).length) {
        uniqueByDate.set(d.date, d);
      }
    }
  });

  const mergedDays = Array.from(uniqueByDate.values()).sort((a,b) => new Date(a.date) - new Date(b.date));
  mergedDays.forEach((d, idx) => d.day = idx + 1);
  currentItinerary.days = mergedDays;

  // Save to Firebase
  await saveCurrentItineraryToFirebase();
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

function renderDayOverview(day) {
    const container = document.getElementById('dayOverview');
    if (!container) return;
    
    // 🔥 Limpiar listener anterior si existe
    const oldBtn = document.getElementById(`addActivityBtn_${day.day}`);
    if (oldBtn) {
        oldBtn.replaceWith(oldBtn.cloneNode(true));
    }
    
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

// ------- New helpers: date generation, local itinerary merging & persistence -------

function formatISO(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatLocalized(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString();
  } catch (e) {
    return dateStr;
  }
}

function* iterateDates(startISO, endISO) {
  const start = new Date(startISO + 'T00:00:00');
  const end = new Date(endISO + 'T00:00:00');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    yield formatISO(d);
  }
}

function generateEntriesForRange(cityName, cityId, startISO, endISO) {
  const arr = [];
  for (const date of iterateDates(startISO, endISO)) {
    arr.push({
      id: `day_${date}`,
      date: date,
      city: cityName,
      cityId: cityId || null,
      notes: ''
    });
  }
  return arr;
}

function mergeLocalItinerary(newEntries) {
  // Use a map by date to ensure uniqueness; last added wins for city but preserve notes when possible
  const map = new Map();

  // Start with existing entries
  (window.localItinerary || []).forEach(e => map.set(e.date, { ...e }));

  // Apply new entries in order (so last added overrides)
  newEntries.forEach(e => {
    const existing = map.get(e.date);
    if (existing) {
      // Preserve notes if present
      map.set(e.date, { ...existing, city: e.city, cityId: e.cityId, notes: existing.notes || '' });
    } else {
      map.set(e.date, { ...e });
    }
  });

  // Convert back to sorted array
  const merged = Array.from(map.values()).sort((a,b) => new Date(a.date) - new Date(b.date));
  window.localItinerary = merged;
}

function scheduleLocalSave() {
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    try {
      localStorage.setItem('localItinerary_v1', JSON.stringify(window.localItinerary || []));
      Notifications.show('Itinerario guardado localmente', 'success');
    } catch (e) {
      console.error('Error guardando localItinerary', e);
    }
  }, 600);
}

function renderLocalItinerary() {
  const container = document.getElementById('itineraryByDate');
  if (!container) return;

  const items = window.localItinerary || [];
  if (!items.length) {
    container.innerHTML = `<div class="p-6 text-center text-sm text-gray-600 dark:text-gray-400">Aún no hay días generados. Usa el formulario superior para añadir un rango por ciudad.</div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex justify-between items-start">
      <div>
        <div class="text-sm text-gray-500">${formatLocalized(item.date)}</div>
        <div class="font-semibold text-lg text-red-600">${item.city}</div>
        <div class="text-xs text-gray-500 mt-1">${item.notes || ''}</div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <button data-action="editNote" data-date="${item.date}" class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Editar notas</button>
        <button data-action="deleteDay" data-date="${item.date}" class="px-2 py-1 text-xs bg-red-600 text-white rounded">Eliminar</button>
      </div>
    </div>
  `).join('');

  // Wire simple delegated listeners
  container.querySelectorAll('[data-action="editNote"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const date = btn.dataset.date;
      const entry = (window.localItinerary || []).find(e => e.date === date);
      if (!entry) return;
      const newNotes = prompt(`Notas para ${formatLocalized(date)} (${entry.city})`, entry.notes || '');
      if (newNotes !== null) {
        entry.notes = newNotes;
        scheduleLocalSave();
        renderLocalItinerary();
      }
    });
  });

  container.querySelectorAll('[data-action="deleteDay"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const date = btn.dataset.date;
      if (!confirm('Eliminar este día del itinerario?')) return;
      window.localItinerary = (window.localItinerary || []).filter(e => e.date !== date);
      scheduleLocalSave();
      renderLocalItinerary();
    });
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
            <div class="space-y-4">
              <!-- New: Range planner -->
              <div id="rangePlanner" class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4">
                <h3 class="font-bold mb-2">Agregar rango por ciudad</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label for="cityInput" class="text-xs text-gray-600 dark:text-gray-400">Ciudad</label>
                    <input id="cityInput" aria-autocomplete="list" aria-haspopup="true" aria-expanded="false" type="text" placeholder="Escribe una ciudad (ej. Tokyo)" class="w-full mt-1 px-3 py-2 border rounded-lg" />
                    <div id="citySuggestions" class="bg-white dark:bg-gray-900 border rounded mt-1 max-h-48 overflow-auto hidden" role="listbox"></div>
                  </div>
                  <div>
                    <label for="dateStart" class="text-xs text-gray-600 dark:text-gray-400">Inicio</label>
                    <input id="dateStart" type="date" class="w-full mt-1 px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label for="dateEnd" class="text-xs text-gray-600 dark:text-gray-400">Fin</label>
                    <input id="dateEnd" type="date" class="w-full mt-1 px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div class="mt-3 flex gap-2">
                  <button id="addRangeBtn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">+ Añadir al Itinerario</button>
                  <button id="clearPlannerBtn" class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg">Limpiar</button>
                </div>
              </div>

              <div id="itineraryByDate" class="space-y-2"></div>
              <div id="activitiesTimeline" class="space-y-4"></div>
            </div>
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
                    const day = parseInt(addBtn.id.split('_')[1]);
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

        const activityForm = document.getElementById('activityForm');
        if (activityForm) {
            activityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                ItineraryHandler.saveActivity();
            });
        }

    // Restore local per-day itinerary if present (localStorage fallback)
    const saved = localStorage.getItem('localItinerary_v1');
    if (saved) {
      try {
        window.localItinerary = JSON.parse(saved);
      } catch (e) {
        window.localItinerary = [];
      }
    } else {
      window.localItinerary = [];
    }

    // Wire planner controls
    const cityInput = document.getElementById('cityInput');
    const suggestions = document.getElementById('citySuggestions');
    const dateStart = document.getElementById('dateStart');
    const dateEnd = document.getElementById('dateEnd');
    const addRangeBtn = document.getElementById('addRangeBtn');
    const clearPlannerBtn = document.getElementById('clearPlannerBtn');
    const itineraryByDate = document.getElementById('itineraryByDate');

    if (cityInput) {
      let activeIndex = -1;
      // Try loading Google Places in background (but don't block typing)
      loadGooglePlaces().catch(() => {
        // silently ignore if cannot load
      });

      cityInput.addEventListener('input', async (e) => {
        const q = e.target.value.trim();
        if (q.length < 2) {
          suggestions.classList.add('hidden');
          cityInput.setAttribute('aria-expanded', 'false');
          return;
        }

        let results = [];

        // If Google Places is ready, try it first
        if (googlePlacesReady) {
          try {
            results = await getGooglePlacePredictions(q);
          } catch (err) {
            results = [];
          }
        }

        // If no results from Google or not ready, fallback to local search
        if (!results.length) {
          const local = (window.searchCities ? window.searchCities(q) : searchCities(q)).slice(0,8);
          results = local.map(c => ({ id: c.id, name: c.name, meta: c.prefecture || '' }));
        }

        if (!results.length) {
          suggestions.innerHTML = '<div class="px-3 py-2 text-sm text-gray-500">No hay sugerencias</div>';
          suggestions.classList.remove('hidden');
          cityInput.setAttribute('aria-expanded', 'true');
          activeIndex = -1;
          return;
        }

        suggestions.innerHTML = results.map((c, idx) => `
          <div role="option" data-idx="${idx}" data-id="${c.id}" data-name="${c.name}" class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">${c.name} <span class="text-xs text-gray-400">${c.meta || ''}</span></div>
        `).join('');
        suggestions.classList.remove('hidden');
        cityInput.setAttribute('aria-expanded', 'true');

        // keyboard nav
        activeIndex = -1;
      });

      cityInput.addEventListener('keydown', (e) => {
        const items = suggestions.querySelectorAll('[role="option"]');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeIndex = Math.min(activeIndex + 1, items.length - 1);
          items.forEach((it,i) => {
            it.classList.toggle('focused', i === activeIndex);
            it.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
          });
          const sel = items[activeIndex];
          if (sel) sel.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeIndex = Math.max(activeIndex - 1, 0);
          items.forEach((it,i) => {
            it.classList.toggle('focused', i === activeIndex);
            it.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
          });
          const sel = items[activeIndex];
          if (sel) sel.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (activeIndex >= 0) {
            const sel = items[activeIndex];
            selectCitySuggestion(sel.dataset.name, sel.dataset.id);
          }
        } else if (e.key === 'Escape') {
          suggestions.classList.add('hidden');
          cityInput.setAttribute('aria-expanded', 'false');
        }
      });

      suggestions.addEventListener('click', (ev) => {
        const opt = ev.target.closest('[role="option"]');
        if (!opt) return;
        selectCitySuggestion(opt.dataset.name, opt.dataset.id);
      });

      function selectCitySuggestion(name, id) {
        cityInput.value = name;
        cityInput.dataset.cityId = id || '';
        suggestions.classList.add('hidden');
        cityInput.setAttribute('aria-expanded', 'false');
        cityInput.focus();
      }
    }

    // Add range handler
    if (addRangeBtn) {
      addRangeBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        const cityId = cityInput.dataset.cityId || null;
        const start = dateStart.value;
        const end = dateEnd.value;

        if (!city || !start || !end) {
          Notifications.show('Completa ciudad, inicio y fin.', 'error');
          return;
        }

        if (new Date(end) < new Date(start)) {
          Notifications.show('La fecha de fin no puede ser anterior a la de inicio.', 'error');
          return;
        }

        // generate per-day entries
        const entries = generateEntriesForRange(city, cityId, start, end);

        // merge with existing localItinerary (last added wins for city on overlaps)
        mergeLocalItinerary(entries);

        // persist debounced
        scheduleLocalSave();

        // re-render
        renderLocalItinerary();

        // clear inputs except keep city for convenience
        dateStart.value = '';
        dateEnd.value = '';
      });
    }

    if (clearPlannerBtn) {
      clearPlannerBtn.addEventListener('click', () => {
        cityInput.value = '';
        dateStart.value = '';
        dateEnd.value = '';
        cityInput.dataset.cityId = '';
        document.getElementById('citySuggestions').classList.add('hidden');
      });
    }

    // Render local itinerary if any
    renderLocalItinerary();

    // Add import button for users who want to push local days into their trip stored itinerary
    const importBtn = document.createElement('button');
    importBtn.textContent = 'Importar días locales al viaje';
    importBtn.className = 'mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg';
    importBtn.addEventListener('click', async () => {
      if (!confirm('Esto añadirá/mezclará los días locales con el itinerario del viaje en Firebase. Continuar?')) return;
      try {
        await importLocalIntoTrip();
        Notifications.show('Días importados al viaje', 'success');
        // reload itinerary from Firebase
        await loadItinerary();
        await this.init();
      } catch (e) {
        console.error('Error importando días:', e);
        Notifications.show('Error importando días', 'error');
      }
    });
    const planner = document.getElementById('rangePlanner');
    if (planner) planner.appendChild(importBtn);
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
        const modal = document.getElementById('activityModal');
        if (!modal) {
            console.error('❌ Modal de actividad no encontrado');
            return;
        }
        
        const form = document.getElementById('activityForm');
        const modalTitle = document.getElementById('activityModalTitle');

        if (form) form.reset();
        
        const dayInput = document.getElementById('activityDay');
        if (dayInput) dayInput.value = day;

        if (activityId) {
            // Modo Editar
            modalTitle.textContent = 'Editar Actividad';
            const dayData = currentItinerary.days.find(d => d.day === day);
            const activity = dayData.activities.find(a => a.id === activityId);

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
            modalTitle.textContent = 'Añadir Actividad';
            document.getElementById('activityId').value = '';
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Modal de actividad abierto', { activityId, day });
    },

    closeActivityModal() {
        const modal = document.getElementById('activityModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        
        // Limpiar formulario
        const form = document.getElementById('activityForm');
        if (form) form.reset();
        
        console.log('✅ Modal de actividad cerrado');
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
        } catch (error) {
            console.error("Error al guardar la actividad:", error);
            Notifications.show('Error al guardar la actividad.', 'error');
        }
    }
};

// Inicializar cuando cambia el estado de autenticación
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Guardar: only register onAuthStateChanged if auth is initialized; otherwise call initRealtimeSync after DOM ready
try {
  if (typeof auth !== 'undefined' && auth) {
    onAuthStateChanged(auth, (user) => {
      initRealtimeSync();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        try { initRealtimeSync(); } catch (e) { console.warn('initRealtimeSync deferred failed:', e); }
      });
    } else {
      try { initRealtimeSync(); } catch (e) { console.warn('initRealtimeSync immediate failed:', e); }
    }
  }
} catch (e) {
  console.warn('Error setting up auth listener for itinerary:', e);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try { initRealtimeSync(); } catch (err) { console.warn('initRealtimeSync fallback failed:', err); }
    });
  } else {
    try { initRealtimeSync(); } catch (err) { console.warn('initRealtimeSync fallback immediate failed:', err); }
  }
}

window.ItineraryHandler = ItineraryHandler;
