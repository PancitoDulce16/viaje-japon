// js/itinerary.js — VERSIÓN MEJORADA con Creación Dinámica + AI Insights Button
import { db, auth } from '/js/firebase-config.js';
import { Notifications } from './notifications.js';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
// Local cities fallback provider
import { searchCities } from '/data/japan-cities.js';
import { APP_CONFIG } from '/js/config.js';
import { ActivityAutocomplete } from './activity-autocomplete.js';

let checkedActivities = {};
let currentDay = 1;
let unsubscribe = null;
let currentItinerary = null;
let sortableInstance = null; // 🔥 Para drag & drop
let isListenerAttached = false;
let saveDebounceTimer = null;

// ---- Auth & Firestore validation helper ----
function validateFirestoreAccess(operationName = 'Firestore operation') {
  if (!db) {
    const error = new Error(`❌ ${operationName} failed: Firestore (db) is not initialized`);
    console.error(error.message);
    throw error;
  }

  if (!auth || !auth.currentUser) {
    const error = new Error(`❌ ${operationName} failed: User is not authenticated`);
    console.error(error.message);
    throw error;
  }

  return true;
}

// ---- Retry logic with exponential backoff for onSnapshot ----
function createResilientSnapshot(docRef, onSuccess, onError, maxRetries = 3) {
  let retryCount = 0;
  let retryTimeout = null;
  let currentUnsubscribe = null;

  const attemptSubscription = () => {
    console.log(`🔄 Attempting onSnapshot subscription (attempt ${retryCount + 1}/${maxRetries + 1})`);

    currentUnsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        // Success - reset retry count
        retryCount = 0;
        if (retryTimeout) {
          clearTimeout(retryTimeout);
          retryTimeout = null;
        }
        onSuccess(docSnap);
      },
      (error) => {
        console.error(`❌ onSnapshot error (attempt ${retryCount + 1}):`, error);

        // Handle specific error codes
        if (error.code === 'permission-denied') {
          // Don't retry on permission errors
          console.error('❌ Permission denied - not retrying');
          onError(error);
          return;
        }

        // Retry on network errors (unavailable, deadline-exceeded, etc.)
        if (
          error.code === 'unavailable' ||
          error.code === 'deadline-exceeded' ||
          error.code === 'internal' ||
          error.code === 'unknown'
        ) {
          if (retryCount < maxRetries) {
            // Exponential backoff: 1s, 2s, 4s, 8s...
            const delay = Math.pow(2, retryCount) * 1000;
            retryCount++;

            console.warn(`⏳ Retrying onSnapshot in ${delay}ms (attempt ${retryCount}/${maxRetries})`);

            retryTimeout = setTimeout(() => {
              attemptSubscription();
            }, delay);
          } else {
            console.error('❌ Max retries reached for onSnapshot');
            onError(error);
          }
        } else {
          // Unknown error - don't retry
          console.error('❌ Unknown error - not retrying');
          onError(error);
        }
      }
    );
  };

  // Start first attempt
  attemptSubscription();

  // Return cleanup function
  return () => {
    if (currentUnsubscribe) {
      currentUnsubscribe();
      currentUnsubscribe = null;
    }
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
  };
}

// --- Google Places integration (optional) ---
const GOOGLE_PLACES_API_KEY = APP_CONFIG?.GOOGLE_PLACES_API_KEY || '';
let googlePlacesReady = false;
let googlePlacesPromise = null;
let googleAutocompleteService = null;

function loadGooglePlaces() {
  if (!GOOGLE_PLACES_API_KEY) return Promise.reject(new Error('No API key'));
  if (googlePlacesPromise) return googlePlacesPromise;
  googlePlacesPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      googleAutocompleteService = new google.maps.places.AutocompleteService();
      googlePlacesReady = true; return resolve(true);
    }
    const callbackName = '__initGooglePlaces_' + Date.now();
    window[callbackName] = () => {
      try { googleAutocompleteService = new google.maps.places.AutocompleteService(); googlePlacesReady = true; resolve(true); }
      catch (e) { reject(e); }
      finally { try { delete window[callbackName]; } catch(e){} }
    };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&callback=${callbackName}`;
    script.async = true; script.defer = true; script.onerror = (e)=>reject(e);
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
  if (window.TripsManager && window.TripsManager.currentTrip) return window.TripsManager.currentTrip.id;
  return localStorage.getItem('currentTripId');
}

async function saveCurrentItineraryToFirebase() {
  validateFirestoreAccess('Save itinerary');

  const tripId = getCurrentTripId();
  if (!tripId || !currentItinerary) {
    throw new Error('❌ No trip or itinerary to save');
  }

  try {
    const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
    await setDoc(itineraryRef, currentItinerary);
    console.log('✅ Itinerary saved to Firebase');
    return true;
  } catch (error) {
    if (error.code === 'permission-denied') {
      throw new Error('❌ Permission denied: You do not have access to save this itinerary');
    } else if (error.code === 'unavailable') {
      throw new Error('❌ Firestore unavailable: Check your internet connection');
    }
    throw error;
  }
}

// ---- Fallback/local itinerary helpers (sin cambios sustanciales) ----
function formatISO(date){ const d=new Date(date),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
function formatLocalized(dateStr){ try{ const d=new Date(dateStr+'T00:00:00'); return d.toLocaleDateString(); }catch(e){ return dateStr; } }
function* iterateDates(startISO,endISO){ const s=new Date(startISO+'T00:00:00'); const e=new Date(endISO+'T00:00:00'); for(let d=new Date(s); d<=e; d.setDate(d.getDate()+1)) yield formatISO(d); }
function generateEntriesForRange(cityName, cityId, startISO, endISO){ const arr=[]; for(const date of iterateDates(startISO,endISO)){ arr.push({ id:`day_${date}`, date, city: cityName, cityId: cityId||null, notes:'' }); } return arr; }
function mergeLocalItinerary(newEntries){ const map=new Map(); (window.localItinerary||[]).forEach(e=>map.set(e.date,{...e})); newEntries.forEach(e=>{ const ex=map.get(e.date); if(ex){ map.set(e.date,{...ex,city:e.city,cityId:e.cityId,notes:ex.notes||''}); } else { map.set(e.date,{...e}); } }); const merged=Array.from(map.values()).sort((a,b)=> new Date(a.date)-new Date(b.date)); window.localItinerary=merged; }
function scheduleLocalSave(){ if(saveDebounceTimer) clearTimeout(saveDebounceTimer); saveDebounceTimer=setTimeout(()=>{ try{ localStorage.setItem('localItinerary_v1', JSON.stringify(window.localItinerary||[])); Notifications.show('Itinerario guardado localmente','success'); }catch(e){ console.error('local save error',e); } },600); }

// ---- Firebase load/sync (resumen del original) ----
async function loadItinerary(){
  const tripId = getCurrentTripId();

  // Helper function to load fallback template
  const loadFallbackTemplate = async () => {
    try {
      const r = await fetch('/data/attractions.json');
      const data = await r.json();
      currentItinerary = { days: data.suggestedItinerary };
      return currentItinerary;
    } catch (e) {
      console.error('❌ Error loading fallback template:', e);
      return null;
    }
  };

  if (!tripId) {
    console.log('⚠️ No trip selected, loading default template');
    return await loadFallbackTemplate();
  }

  // Check if user is authenticated before accessing Firestore
  if (!db || !auth || !auth.currentUser) {
    console.log('⚠️ User not authenticated or Firestore not initialized, loading default template');
    return await loadFallbackTemplate();
  }

  try {
    const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
    const snap = await getDoc(itineraryRef);

    if (snap.exists()) {
      currentItinerary = snap.data();
      console.log('✅ Itinerary loaded from Firebase');
      return currentItinerary;
    } else {
      console.log('⚠️ No itinerary exists in Firebase, loading fallback');
      return await loadFallbackTemplate();
    }
  } catch (error) {
    // Silently handle offline errors (expected behavior)
    if (error.code === 'unavailable' || error.message?.includes('client is offline')) {
      console.log('⚠️ Firestore offline, loading fallback template');
      return await loadFallbackTemplate();
    }

    // Log other errors
    console.error('❌ Error loading itinerary from Firebase:', error);

    // Specific error handling for non-offline errors
    if (error.code === 'permission-denied') {
      console.error('❌ Permission denied: You do not have access to this itinerary');
      Notifications?.show?.('No tienes permiso para acceder a este itinerario', 'error');
    }

    return await loadFallbackTemplate();
  }
}

async function initRealtimeSync(){
  // Clean up existing listener
  if (unsubscribe) {
    unsubscribe();
    console.log('[Itinerary] 🛑 Antiguo listener de itinerario detenido.');
    unsubscribe = null;
  }

  // Fallback to local storage if not authenticated
  if (!db || !auth || !auth.currentUser) {
    console.log('⚠️ Not authenticated, using local storage only');
    checkedActivities = JSON.parse(localStorage.getItem('checkedActivities') || '{}');
    render();
    return;
  }

  const tripId = getCurrentTripId();
  if (!tripId) {
    console.log('⚠️ No trip selected');
    renderEmptyState();
    return;
  }

  console.log('🤝 Collaborative mode activated for trip:', tripId);

  // 🔥 NUEVO: Listener unificado para itinerario y checklist
  try {
    const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');

    // Use resilient snapshot with automatic retry
    unsubscribe = createResilientSnapshot(
      itineraryRef,
      (docSnap) => {
        // Success callback
        if (docSnap.exists()) {
          currentItinerary = docSnap.data();
          // Extraer el checklist del itinerario si existe, o usar uno vacío
          checkedActivities = currentItinerary.checklist || {};
          console.log('✅ Itinerario y checklist sincronizados en tiempo real.');
        } else {
          // Si no hay itinerario, reseteamos todo
          currentItinerary = null;
          checkedActivities = {};
          console.log('⚠️ No hay itinerario en Firebase para este viaje.');
        }
        localStorage.setItem('checkedActivities', JSON.stringify(checkedActivities));
        render();
      },
      (error) => {
        // Error callback (after all retries exhausted)
        console.error('❌ Error in realtime sync (all retries failed):', error);

        if (error.code === 'permission-denied') {
          Notifications?.show?.('No tienes permiso para acceder a este itinerario', 'error');
        }

        // Fallback a datos locales si la sincronización falla
        checkedActivities = JSON.parse(localStorage.getItem('checkedActivities') || '{}');
        render();
      }
    );
  } catch (error) {
    console.error('❌ Error setting up realtime sync:', error);
    // Fallback to local storage
    checkedActivities = JSON.parse(localStorage.getItem('checkedActivities') || '{}');
    render();
  }
}

function selectDay(dayNumber){ currentDay = dayNumber; render(); }

async function toggleActivity(activityId) {
  const previousState = checkedActivities[activityId];
  checkedActivities[activityId] = !previousState;

  try {
    // If not authenticated, save locally only
    if (!db || !auth || !auth.currentUser) {
      localStorage.setItem('checkedActivities', JSON.stringify(checkedActivities));
      render();
      return;
    }

    const tripId = getCurrentTripId();
    if (!tripId) {
      alert('⚠️ Debes seleccionar un viaje primero');
      checkedActivities[activityId] = previousState; // Revert
      render();
      return;
    }

    // Save to Firestore
    const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
    await updateDoc(itineraryRef, {
      'checklist.checked': checkedActivities,
      lastUpdated: new Date().toISOString(),
      updatedBy: auth.currentUser.email
    });

    console.log('✅ Activity synced by:', auth.currentUser.email);
  } catch (error) {
    console.error('❌ Error saving activity:', error);

    // Specific error handling
    if (error.code === 'permission-denied') {
      alert('⚠️ No tienes permiso para modificar este checklist');
    } else if (error.code === 'unavailable') {
      alert('⚠️ No se pudo conectar. Verifica tu conexión a internet.');
    } else {
      alert('⚠️ Error al sincronizar. Intenta de nuevo.');
    }

    // Revert the change
    checkedActivities[activityId] = previousState;
    render();
  }
}

// --- Vacíos/No trip ---
function renderNoItinerary(){
  const container=document.getElementById('content-itinerary'); if(!container) return;
  container.innerHTML = `
  <div class="max-w-4xl mx-auto p-8 text-center">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
      <div class="text-6xl mb-6">✈️</div>
      <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">¡Crea tu Itinerario!</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg">Planifica tu viaje perfecto. Elige entre plantillas o crea uno desde cero.</p>
      <button onclick="ItineraryBuilder.showCreateItineraryWizard()" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-bold text-lg shadow-lg">✨ Crear Itinerario</button>
    </div>
  </div>`;
}

function renderEmptyState(){
  const container=document.getElementById('content-itinerary'); if(!container) return;
  container.innerHTML = `
    <div class="max-w-4xl mx-auto p-8 text-center">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
        <div class="text-6xl mb-4">🗺️</div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">No hay viaje seleccionado</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Para crear un itinerario, primero debes crear o seleccionar un viaje.</p>
        <div class="flex gap-3 justify-center flex-wrap">
          <button onclick="TripsManager.showCreateTripModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">➕ Crear Viaje</button>
          <button onclick="TripsManager.showTripsListModal()" class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold">📂 Ver Mis Viajes</button>
        </div>
      </div>
    </div>`;
}

// --- UI render principal ---
async function render(){
  const itinerary=currentItinerary; if(!itinerary || !itinerary.days){ renderNoItinerary(); return; }
  const dayData=itinerary.days.find(d=> d.day===currentDay); if(!dayData) return;
  renderTripSelector();
  renderDaySelector();
  renderDayOverview(dayData);
  renderActivities(dayData);

  // Initialize drag and drop AFTER rendering activities
  console.log('⏰ Attempting to initialize drag & drop after render...');
  const timeline = document.getElementById('activitiesTimeline');
  console.log('📍 Timeline element:', timeline);
  if (timeline) {
    initializeDragAndDrop(timeline);
  } else {
    console.error('❌ Timeline element not found!');
  }
}

// ⬇️⬇️⬇️  NUEVO: renderTripSelector con botón “Ver Insights AI”  ⬇️⬇️⬇️
function renderTripSelector(){
  const container=document.getElementById('tripSelectorHeader'); if(!container) return;
  const currentTrip=window.TripsManager?.currentTrip; if(!currentTrip){ container.innerHTML=''; return; }
  const userTrips=window.TripsManager?.userTrips||[];
  container.innerHTML = `
    <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg mb-4">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-3 flex-1">
          <div class="text-2xl">🗺️</div>
          <div>
            <h3 class="font-bold text-lg">${currentTrip.info.name}</h3>
            <p class="text-xs text-white/80">${new Date(currentTrip.info.dateStart).toLocaleDateString('es')} - ${new Date(currentTrip.info.dateEnd).toLocaleDateString('es')}</p>
          </div>
        </div>
        <div class="flex gap-2">
          ${userTrips.length>1 ? `<button onclick="TripsManager.showTripsListModal()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition text-sm font-semibold backdrop-blur-sm">🔄 Cambiar Viaje</button>`:''}
          <button onclick="TripsManager.showShareCode()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition text-sm font-semibold backdrop-blur-sm">🔗 Compartir</button>
          ${!currentItinerary ? `<button onclick="ItineraryBuilder.showCreateItineraryWizard()" class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition text-sm font-bold shadow-md">✨ Crear Itinerario</button>`:''}
        </div>
      </div>
    </div>`;
}

function renderDaySelector(){
  const container=document.getElementById('daySelector'); if(!container) return;
  const itinerary=currentItinerary; if(!itinerary||!itinerary.days){ container.innerHTML=''; return; }
  const days=itinerary.days||[];
  container.innerHTML = days.map(day => `
    <button data-day="${day.day}" class="day-btn px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${ currentDay===day.day ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' }">Día ${day.day}</button>
  `).join('');
}

function renderDayOverview(day){
  const container=document.getElementById('dayOverview'); if(!container) return;
  const completed = day.activities.filter(a => checkedActivities[a.id]).length;
  const progress = day.activities.length>0 ? (completed/day.activities.length)*100 : 0;
  const tripId = getCurrentTripId();
  let syncStatus;
  if(!auth.currentUser){ syncStatus='<span class="text-xs text-yellow-600 dark:text-yellow-400">📱 Solo local</span>'; }
  else if (tripId){ syncStatus='<span class="text-xs text-green-600 dark:text-green-400">🤝 Modo Colaborativo</span>'; }
  else { syncStatus='<span class="text-xs text-blue-600 dark:text-blue-400">☁️ Sincronizado</span>'; }

  // Debug: Log day data to see what fields are available
  console.log('📊 Day data for day', day.day, ':', {
    city: day.city,
    location: day.location,
    title: day.title,
    date: day.date
  });

  // Get city image based on day's city/location or title
  let cityImage = '';
  const citySource = day.city || day.location || day.title || '';
  console.log('🔍 City source:', citySource);

  if (citySource) {
    const cityRaw = citySource.toLowerCase().trim();
    console.log('🔍 City raw:', cityRaw);

    // Match city names - handle variations
    const cityName = cityRaw.includes('tokyo') ? 'tokyo' :
                     cityRaw.includes('kyoto') ? 'kyoto' :
                     cityRaw.includes('osaka') ? 'osaka' :
                     cityRaw.includes('nara') ? 'nara' :
                     cityRaw.includes('hiroshima') ? 'hiroshima' :
                     cityRaw.includes('nikko') ? 'nikko' :
                     cityRaw; // Use as-is if no match

    console.log('🏙️ Detected city:', cityName);

    if (window.ImageService && window.ImageService.getCityImage) {
      cityImage = window.ImageService.getCityImage(cityName);
      console.log('🖼️ Image from ImageService:', cityImage);
    } else {
      // Fallback images for each city
      const cityImages = {
        tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
        kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        osaka: 'https://unsplash.com/photos/OwbvX2iahvw/download?force=true&w=800', // Dotonbori
        nara: 'https://unsplash.com/photos/OugwfKxatME/download?force=true&w=800', // Nara deer
        hiroshima: 'https://images.unsplash.com/photo-1617878223826-5a93d60fe046?auto=format&fit=crop&w=800&q=80',
        nikko: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=800&q=80'
      };
      cityImage = cityImages[cityName] || cityImages.tokyo;
      console.log('🖼️ Image from fallback:', cityImage);
    }
  }

  console.log('✅ Final cityImage:', cityImage);

  container.innerHTML = `
    ${cityImage ? `
      <div class="relative h-48 w-full overflow-hidden rounded-t-xl -mx-6 -mt-6 mb-4">
        <img src="${cityImage}" alt="${day.city || day.location || 'Japan'}" class="w-full h-full object-cover" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-4">
          <div class="flex items-center gap-2 text-white">
            <span class="text-3xl">📅</span>
            <div>
              <h2 class="text-2xl font-bold text-white drop-shadow-lg">Día ${day.day}</h2>
              <p class="text-sm text-white/90">${day.city || day.location || ''}</p>
            </div>
          </div>
        </div>
      </div>
    ` : `
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl">📅</span>
        <h2 class="text-2xl font-bold dark:text-white">Día ${day.day}</h2>
      </div>
    `}
    <div class="mb-4">
      <div class="flex justify-between text-sm mb-1 dark:text-gray-300"><span>Progreso</span><span>${completed}/${day.activities.length}</span></div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-red-600 h-2 rounded-full transition-all duration-500" style="width:${progress}%"></div></div>
      <div class="mt-2 text-right">${syncStatus}</div>
    </div>
    <div class="space-y-3 text-sm">
      <p class="font-semibold text-base dark:text-gray-300">${day.date}</p>
      <p class="font-bold text-lg text-red-600 dark:text-red-400">${day.title||''}</p>
      ${day.hotel ? `
        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-2 border-blue-500">
          <p class="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">🏨 Hotel Recomendado</p>
          <p class="text-sm text-gray-700 dark:text-gray-300">${day.hotel}</p>
        </div>
      `:''}
      ${day.location ? `<p class="text-xs text-gray-500 dark:text-gray-400">📍 ${day.location}</p>`:''}
    </div>
    <div class="mt-6">
      <button type="button" id="addActivityBtn_${day.day}" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition">+ Añadir Actividad</button>
    </div>`;
}

function renderActivities(day){
  const container=document.getElementById('activitiesTimeline'); if(!container) return;
  const currentUserId = auth.currentUser?.uid;

  if (sortableInstance){ try{ sortableInstance.destroy(); }catch(_){} sortableInstance=null; }
  container.innerHTML = (day.activities||[]).map((act,i)=> {
    const votes = act.votes || {};
    const voteCount = Object.keys(votes).length;
    const userHasVoted = currentUserId && votes[currentUserId];

    return `
    <div class="activity-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden fade-in transition-all hover:shadow-xl border-l-4 border-red-500 ${checkedActivities[act.id]?'opacity-60':''}" style="animation-delay:${i*0.05}s">
      <div class="p-5 flex items-start gap-4">
        <div class="flex flex-col gap-2 items-center">
          <div class="drag-handle text-gray-400 dark:text-gray-600 text-xs cursor-grab active:cursor-grabbing" title="Arrastra para reordenar">⋮⋮</div>
          <input type="checkbox" data-id="${act.id}" ${checkedActivities[act.id]?'checked':''} class="activity-checkbox w-5 h-5 cursor-pointer accent-red-600 flex-shrink-0" />
        </div>
        <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-2xl flex-shrink-0">${act.icon||'📍'}</div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">${act.time||''}</span>
                ${act.cost>0?`<span class="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">¥${Number(act.cost).toLocaleString()}</span>`:''}
              </div>
              <h3 class="text-lg font-bold dark:text-white mb-1">${act.title}</h3>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button 
                type="button" 
                data-action="vote" 
                data-activity-id="${act.id}" 
                data-day="${day.day}" 
                class="activity-vote-btn p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center gap-1 ${userHasVoted ? 'text-red-500' : 'text-gray-400'}"
                title="Votar por esta actividad"
              >
                <i class="fas fa-heart"></i>
                <span class="text-xs font-bold">${voteCount > 0 ? voteCount : ''}</span>
              </button>
              <button type="button" data-action="edit" data-activity-id="${act.id}" data-day="${day.day}" class="activity-edit-btn p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">✏️</button>
              <button type="button" data-action="delete" data-activity-id="${act.id}" data-day="${day.day}" class="activity-delete-btn p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">🗑️</button>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${act.desc||''}</p>
          ${act.station?`<p class="text-xs text-gray-500 dark:text-gray-500 mt-2">🚉 ${act.station}</p>`:''}
          ${act.train?`
            <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-2 border-blue-500">
              <p class="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">🚄 ${act.train.line}</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">${act.train.from} → ${act.train.to}</p>
              <p class="text-xs text-gray-500 dark:text-gray-500">⏱️ ${act.train.duration}</p>
            </div>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}

// --- Drag & Drop with SortableJS ---
function initializeDragAndDrop(container) {
  if (!container) {
    console.error('❌ Drag & Drop: container is null or undefined');
    return;
  }

  if (!window.Sortable) {
    console.error('❌ Drag & Drop: Sortable library not loaded');
    return;
  }

  console.log('🎯 Initializing drag & drop on container:', container);
  console.log('📦 Activity cards found:', container.querySelectorAll('.activity-card').length);
  console.log('👆 Drag handles found:', container.querySelectorAll('.drag-handle').length);

  try {
    sortableInstance = new Sortable(container, {
      animation: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      draggable: '.activity-card',
      handle: '.drag-handle', // Only drag from the ⋮⋮ icon
      onStart: function(evt) {
        console.log('🚀 Drag started:', evt.oldIndex);
      },
      onMove: function(evt) {
        console.log('🔄 Moving from', evt.dragged, 'to', evt.related);
      },
      onEnd: async function(evt) {
        console.log('✅ Drag ended. Old index:', evt.oldIndex, 'New index:', evt.newIndex);
        // Get the new order of activities
        const activityCards = Array.from(container.querySelectorAll('.activity-card'));
        const dayData = currentItinerary.days.find(d => d.day === currentDay);

        if (!dayData) return;

        // Reorder activities based on new positions
        const reorderedActivities = activityCards.map(card => {
          const checkbox = card.querySelector('.activity-checkbox');
          const activityId = checkbox?.dataset?.id;
          return dayData.activities.find(act => act.id === activityId);
        }).filter(Boolean);

        // Update the current itinerary
        dayData.activities = reorderedActivities;

        // Save to Firebase
        try {
          await saveCurrentItineraryToFirebase();
          console.log('✅ Activity order saved');
          if (window.Notifications) {
            window.Notifications.show('Orden actualizado', 'success');
          }
        } catch (error) {
          console.error('❌ Error saving activity order:', error);
          if (window.Notifications) {
            window.Notifications.show('Error al guardar el orden', 'error');
          }
          // Revert the UI on error
          render();
        }
      }
    });

    console.log('✅ Drag & Drop initialized');
  } catch (error) {
    console.error('❌ Error initializing drag & drop:', error);
  }
}

// --- API público del handler ---
export const ItineraryHandler = {
  // Exponer currentItinerary y loadItinerary para que AttractionsHandler pueda acceder
  get currentItinerary() {
    return currentItinerary;
  },
  async loadItinerary(tripId) {
    // Llamar a la función standalone loadItinerary
    await loadItinerary();
    return currentItinerary;
  },

  async init(){
    const container=document.getElementById('content-itinerary'); if(!container) return;
    const tripId=getCurrentTripId(); if(!tripId){ renderEmptyState(); return; }
    await loadItinerary();
    if(!currentItinerary){ renderNoItinerary(); return; }
    container.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 pt-4"><div id="tripSelectorHeader"></div></div>
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[72px] z-30 shadow-sm">
        <div class="max-w-6xl mx-auto p-4"><div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" id="daySelector"></div></div>
      </div>
      <div class="max-w-6xl mx-auto p-4 md:p-6">
        <div class="grid md:grid-cols-3 gap-6">
          <div class="md:col-span-1"><div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-36 fade-in" id="dayOverview"></div></div>
          <div class="md:col-span-2"><div class="space-y-4" id="activitiesTimeline"></div></div>
        </div>
      </div>`;

    await initRealtimeSync();

    if(!isListenerAttached){
      container.addEventListener('click', (e)=>{
        const addBtn=e.target.closest('[id^="addActivityBtn_"]');
        const editBtn=e.target.closest('.activity-edit-btn');
        const deleteBtn=e.target.closest('.activity-delete-btn');
        const voteBtn = e.target.closest('.activity-vote-btn');
        const dayBtn=e.target.closest('.day-btn');
        if(addBtn){ const day=parseInt(addBtn.id.split('_')[1]); ItineraryHandler.showActivityModal(null, day); }
        else if(editBtn){ const activityId=editBtn.dataset.activityId; const dayNum=parseInt(editBtn.dataset.day); ItineraryHandler.showActivityModal(activityId, dayNum); }
        else if(deleteBtn){ const activityId=deleteBtn.dataset.activityId; const dayNum=parseInt(deleteBtn.dataset.day); ItineraryHandler.deleteActivity(activityId, dayNum); }
        else if(voteBtn){ const activityId=voteBtn.dataset.activityId; const dayNum=parseInt(voteBtn.dataset.day); ItineraryHandler.toggleVote(dayNum, activityId); }
        else if(dayBtn){ selectDay(parseInt(dayBtn.dataset.day)); }
      });
      container.addEventListener('change', (e)=>{ const checkbox=e.target.closest('.activity-checkbox'); if(checkbox){ toggleActivity(checkbox.dataset.id); } });
      isListenerAttached=true;
    }

    const timeline=document.getElementById('activitiesTimeline'); if(timeline) initializeDragAndDrop(timeline);
  },

  async reinitialize(){
    const tripId=getCurrentTripId(); if(!tripId){ renderEmptyState(); return; }
    await loadItinerary(); if(!currentItinerary){ renderNoItinerary(); return; }
    await initRealtimeSync(); await this.init();
  },

  // Mostrar modal de actividad (añadir o editar)
  showActivityModal(activityId, day) {
    const modal = document.getElementById('activityModal');
    const form = document.getElementById('activityForm');
    const title = document.getElementById('activityModalTitle');

    if (!modal || !form) return;

    // Reset form
    form.reset();
    document.getElementById('activityId').value = activityId || '';
    document.getElementById('activityDay').value = day;

    // Si estamos editando, cargar datos de la actividad
    if (activityId) {
      title.textContent = 'Editar Actividad';
      const dayData = currentItinerary.days.find(d => d.day === day);
      const activity = dayData?.activities.find(a => a.id === activityId);

      if (activity) {
        document.getElementById('activityIcon').value = activity.icon || '';
        document.getElementById('activityTime').value = activity.time || '';
        document.getElementById('activityTitle').value = activity.title || '';
        document.getElementById('activityDesc').value = activity.desc || '';
        document.getElementById('activityCost').value = activity.cost || '';
        document.getElementById('activityStation').value = activity.station || '';
      }
    } else {
      title.textContent = 'Añadir Actividad';
    }

    // Mostrar modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Inicializar autocomplete
    setTimeout(() => {
      if (window.ActivityAutocomplete && window.ActivityAutocomplete.init) {
        window.ActivityAutocomplete.init();
      }
    }, 100);

    // Setup form submit handler (only once)
    if (!form.dataset.handlerAttached) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveActivity();
      });
      form.dataset.handlerAttached = 'true';
    }
  },

  closeActivityModal() {
    const modal = document.getElementById('activityModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');

      // Limpiar autocomplete dropdown
      if (window.ActivityAutocomplete && window.ActivityAutocomplete.hideDropdown) {
        window.ActivityAutocomplete.hideDropdown();
      }
    }
  },

  async saveActivity() {
    const activityId = document.getElementById('activityId').value;
    const day = parseInt(document.getElementById('activityDay').value);
    const icon = document.getElementById('activityIcon').value || '📍';
    const time = document.getElementById('activityTime').value;
    const title = document.getElementById('activityTitle').value;
    const desc = document.getElementById('activityDesc').value;
    const cost = parseFloat(document.getElementById('activityCost').value) || 0;
    const station = document.getElementById('activityStation').value;

    if (!title) {
      alert('⚠️ El título es obligatorio');
      return;
    }

    const dayData = currentItinerary.days.find(d => d.day === day);
    if (!dayData) {
      alert('⚠️ No se encontró el día');
      return;
    }

    const activity = {
      id: activityId || `activity_${Date.now()}`,
      icon,
      time,
      title,
      desc,
      cost,
      station
    };

    // Añadir o actualizar actividad
    if (activityId) {
      const index = dayData.activities.findIndex(a => a.id === activityId);
      if (index >= 0) {
        dayData.activities[index] = activity;
      }
    } else {
      dayData.activities.push(activity);
    }

    try {
      await saveCurrentItineraryToFirebase();
      this.closeActivityModal();
      // render() se llama automáticamente desde el listener onSnapshot del itinerario
      Notifications.show(activityId ? 'Actividad actualizada' : 'Actividad añadida', 'success');
    } catch (error) {
      console.error('❌ Error guardando actividad:', error);
      alert('⚠️ Error al guardar la actividad');
    }
  },

  async deleteActivity(activityId, day) {
    const confirmed = await window.Dialogs.confirm({
        title: '🗑️ ¿Eliminar Actividad?',
        message: '¿Estás seguro de que deseas eliminar esta actividad del itinerario?',
        okText: 'Sí, eliminar',
        isDestructive: true
    });
    if (!confirmed) return;

    const dayData = currentItinerary.days.find(d => d.day === day);
    if (!dayData) return;

    dayData.activities = dayData.activities.filter(a => a.id !== activityId);
    try {
      await saveCurrentItineraryToFirebase();
      // render() se llama automáticamente desde el listener onSnapshot del itinerario
      Notifications.show('Actividad eliminada', 'success');
    } catch (error) {
      console.error('❌ Error eliminando actividad:', error);
      alert('⚠️ Error al eliminar la actividad');
    }
  },

  // 🔥 NUEVO: Votar por una actividad
  async toggleVote(dayNumber, activityId) {
    if (!auth.currentUser) {
      Notifications.warning('Debes iniciar sesión para votar');
      return;
    }

    const dayData = currentItinerary.days.find(d => d.day === dayNumber);
    if (!dayData) return;

    const activity = dayData.activities.find(a => a.id === activityId);
    if (!activity) return;

    const userId = auth.currentUser.uid;

    // Inicializar mapa de votos si no existe
    if (!activity.votes) {
      activity.votes = {};
    }

    // Añadir o quitar voto
    if (activity.votes[userId]) {
      delete activity.votes[userId]; // Quitar voto
    } else {
      activity.votes[userId] = true; // Añadir voto
    }

    await saveCurrentItineraryToFirebase();
  }
};

// ====================================================================================
// MANEJO DE EVENTOS DE AUTENTICACIÓN
// ====================================================================================
window.addEventListener('auth:initialized', (event) => {
  console.log('[ItineraryHandler] ✨ Evento auth:initialized recibido. Inicializando sync...');
  // Re-inicializamos para asegurarnos de que todo se cargue con el nuevo estado de auth.
  ItineraryHandler.reinitialize();
});

window.addEventListener('auth:loggedOut', () => {
  console.log('[ItineraryHandler] 🚫 Evento auth:loggedOut recibido. Limpiando...');
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  currentItinerary = null;
  renderEmptyState(); // Muestra el estado "No hay viaje seleccionado"
});

window.ItineraryHandler = ItineraryHandler;
