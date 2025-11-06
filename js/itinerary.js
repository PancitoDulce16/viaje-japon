// js/itinerary.js — VERSIÓN MEJORADA con Creación Dinámica + AI Insights Button
import { db, auth } from '/js/firebase-config.js';
import { Notifications } from './notifications.js';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
// Local cities fallback provider
import { searchCities } from '/data/japan-cities.js';
import { APP_CONFIG } from '/js/config.js';
import { ActivityAutocomplete } from './activity-autocomplete.js';
import { RouteOptimizer } from './route-optimizer.js'; // 🗺️ Optimizador de rutas
import { DayBalancer } from './day-balancer.js'; // ⚖️ Balanceador inteligente de días
import { DayExperiencePredictor } from './day-experience-predictor.js'; // 🔮 Predictor de experiencia

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&callback=${callbackName}&loading=async`;
    script.async = true; script.defer = true; script.onerror = (e) => reject(e);
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
    console.warn('⚠️ No trip or itinerary to save - skipping save');
    return false; // Retornar false en lugar de lanzar error
  }

  try {
    const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
    await setDoc(itineraryRef, currentItinerary);
    console.log('✅ Itinerary saved to Firebase');
    return true;
  } catch (error) {
    console.error('❌ Error saving itinerary to Firebase:', {
      code: error.code,
      message: error.message,
      tripId: tripId
    });

    if (error.code === 'permission-denied') {
      console.error('⚠️ Permission denied - usuario no es miembro del trip?');
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

          // 🛡️ Data cleanup: Fix corrupted "undefined" titles
          let needsCleanup = false;
          if (currentItinerary?.days) {
            currentItinerary.days.forEach(day => {
              if (day.activities) {
                day.activities.forEach(act => {
                  if (act.title === 'undefined' || act.title === 'null' || !act.title) {
                    if (act.name && act.name !== 'undefined' && act.name !== 'null') {
                      act.title = act.name;
                      needsCleanup = true;
                      console.log(`🧹 Cleaned up activity "${act.id}": title "${act.title}" ← name "${act.name}"`);
                    }
                  }
                });
              }
            });
          }

          // Save cleaned data back to Firebase
          if (needsCleanup) {
            console.log('💾 Saving cleaned itinerary to Firebase...');
            saveCurrentItineraryToFirebase().catch(err =>
              console.error('❌ Error saving cleaned itinerary:', err)
            );
          }

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
    <div class="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-12 border dark:border-gray-600">
      <div class="text-6xl mb-6">✈️</div>
      <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">¡Crea tu Itinerario!</h2>
      <p class="text-gray-600 dark:text-gray-200 mb-8 text-lg">Planifica tu viaje perfecto. Elige entre plantillas o crea uno desde cero.</p>
      <button onclick="ItineraryBuilder.showCreateItineraryWizard()" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-bold text-lg shadow-lg">✨ Crear Itinerario</button>
    </div>
  </div>`;
}

function renderEmptyState(){
  const container=document.getElementById('content-itinerary'); if(!container) return;
  container.innerHTML = `
    <div class="max-w-4xl mx-auto p-8 text-center">
      <div class="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-12 border dark:border-gray-600">
        <div class="text-6xl mb-4">🗺️</div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">No hay viaje seleccionado</h2>
        <p class="text-gray-600 dark:text-gray-200 mb-6">Para crear un itinerario, primero debes crear o seleccionar un viaje.</p>
        <div class="flex gap-3 justify-center flex-wrap">
          <button onclick="TripsManager.showCreateTripModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">➕ Crear Viaje</button>
          <button onclick="TripsManager.showTripsListModal()" class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold">📂 Ver Mis Viajes</button>
        </div>
      </div>
    </div>`;
}

// 🗺️ Optimizar ruta del día
/**
 * Muestra análisis de balance de todo el itinerario
 */
async function showBalanceAnalysis() {
  console.log('⚖️ Analyzing itinerary balance...');

  if (!currentItinerary || !currentItinerary.days || currentItinerary.days.length === 0) {
    Notifications.show('No hay días en el itinerario para analizar', 'info');
    return;
  }

  try {
    // Analizar balance
    const analysis = DayBalancer.analyzeItineraryBalance(currentItinerary.days);

    console.log('📊 Balance analysis:', analysis);

    // Construir mensaje del modal
    let message = `<div class="space-y-4">`;

    // Resumen general
    message += `
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
        <h3 class="font-bold text-lg mb-2 text-blue-900 dark:text-blue-100">📊 Resumen General</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-gray-600 dark:text-gray-300">Score Promedio:</span>
            <span class="font-bold text-gray-900 dark:text-white ml-2">${analysis.overallScore}/100</span>
          </div>
          <div>
            <span class="text-gray-600 dark:text-gray-300">Desviación Estándar:</span>
            <span class="font-bold text-gray-900 dark:text-white ml-2">${analysis.standardDeviation}</span>
          </div>
          <div class="col-span-2">
            <span class="text-gray-600 dark:text-gray-300">Estado:</span>
            <span class="font-bold ${analysis.balanced ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'} ml-2">
              ${analysis.balanced ? '✅ Balanceado' : '⚠️ Necesita ajustes'}
            </span>
          </div>
        </div>
      </div>
    `;

    // Análisis por día
    message += `<div class="space-y-2"><h3 class="font-bold text-gray-900 dark:text-white">📅 Análisis por Día:</h3>`;

    analysis.daysAnalysis.forEach(dayAnalysis => {
      const loadConfig = {
        empty: { icon: '⚪', color: 'gray' },
        low: { icon: '🔵', color: 'blue' },
        light: { icon: '🟢', color: 'green' },
        balanced: { icon: '✅', color: 'emerald' },
        heavy: { icon: '🟠', color: 'orange' },
        overloaded: { icon: '🔴', color: 'red' }
      };

      const config = loadConfig[dayAnalysis.analysis.load] || loadConfig.balanced;

      message += `
        <div class="bg-${config.color}-50 dark:bg-${config.color}-900/20 p-3 rounded border border-${config.color}-200 dark:border-${config.color}-700">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-${config.color}-900 dark:text-${config.color}-100">
              ${config.icon} Día ${dayAnalysis.day}
            </span>
            <span class="text-xs font-mono text-${config.color}-700 dark:text-${config.color}-300">
              ${dayAnalysis.analysis.score}/100
            </span>
          </div>
          <div class="text-xs text-${config.color}-700 dark:text-${config.color}-300 mt-1">
            ${dayAnalysis.activities.length} actividades •
            ${dayAnalysis.analysis.factors.totalDuration ? Math.round(dayAnalysis.analysis.factors.totalDuration / 60) + 'h' : '0h'}
          </div>
        </div>
      `;
    });

    message += `</div>`;

    // Sugerencias
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      message += `
        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <h3 class="font-bold text-yellow-900 dark:text-yellow-100 mb-2">💡 Sugerencias de Mejora:</h3>
          <ul class="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
      `;

      analysis.suggestions.slice(0, 5).forEach((suggestion, index) => {
        const priorityBadge = suggestion.priority === 'high' ? '🔴' :
                             suggestion.priority === 'medium' ? '🟡' : '🟢';

        message += `
          <li class="flex items-start gap-2">
            <span class="flex-shrink-0">${priorityBadge}</span>
            <div>
              <div class="font-semibold">${suggestion.description}</div>
              <div class="text-xs opacity-80">${suggestion.reason}</div>
            </div>
          </li>
        `;
      });

      message += `</ul></div>`;
    }

    message += `</div>`;

    // Mostrar modal con Dialogs
    const confirmed = await window.Dialogs.confirm({
      title: '⚖️ Análisis de Balance del Itinerario',
      message: message,
      confirmText: analysis.suggestions.length > 0 ? 'Aplicar Sugerencias Automáticamente' : 'Cerrar',
      cancelText: 'Cerrar',
      type: 'info'
    });

    // Si el usuario confirma y hay sugerencias, aplicarlas
    if (confirmed && analysis.suggestions.length > 0) {
      await applyBalanceSuggestions(analysis.suggestions);
    }

  } catch (error) {
    console.error('❌ Error analyzing balance:', error);
    Notifications.show('Error al analizar balance', 'error');
  }
}

/**
 * Aplica las sugerencias de balance automáticamente
 */
async function applyBalanceSuggestions(suggestions) {
  console.log('🔧 Applying balance suggestions...', suggestions);

  try {
    let modified = false;

    for (const suggestion of suggestions) {
      if (suggestion.type === 'move' && suggestion.priority === 'high') {
        // Mover actividad
        const newDays = DayBalancer.applySuggestion(currentItinerary.days, suggestion);
        currentItinerary.days = newDays;
        modified = true;
      }
    }

    if (modified) {
      await saveCurrentItineraryToFirebase();
      Notifications.show(
        `✅ Balance aplicado! Se movieron actividades para mejorar la distribución`,
        'success'
      );
      render();
    } else {
      Notifications.show('No se aplicaron cambios', 'info');
    }

  } catch (error) {
    console.error('❌ Error applying suggestions:', error);
    Notifications.show('Error al aplicar sugerencias', 'error');
  }
}

async function optimizeDayRoute(dayNumber) {
  console.log('🗺️ Optimizing route for day', dayNumber);

  if (!currentItinerary || !currentItinerary.days) {
    Notifications.show('No hay itinerario para optimizar', 'error');
    return;
  }

  const dayData = currentItinerary.days.find(d => d.day === dayNumber);
  if (!dayData || !dayData.activities || dayData.activities.length < 2) {
    Notifications.show('Necesitas al menos 2 actividades para optimizar la ruta', 'info');
    return;
  }

  try {
    // 🛡️ IMPORTANTE: Verificar que las actividades tienen coordenadas
    const activitiesWithCoords = dayData.activities.filter(act =>
      act.coordinates && act.coordinates.lat && act.coordinates.lng
    );

    if (activitiesWithCoords.length < 2) {
      Notifications.show(
        `⚠️ Necesitas agregar ubicaciones (coordenadas) a las actividades primero.\n` +
        `Solo ${activitiesWithCoords.length} de ${dayData.activities.length} tienen ubicación.`,
        'warning'
      );
      return;
    }

    // Mostrar loading
    Notifications.show('Optimizando ruta...', 'info');

    // Optimizar usando el RouteOptimizer
    const result = RouteOptimizer.optimizeRoute(dayData.activities, {
      considerOpeningHours: true
    });

    if (!result.wasOptimized) {
      Notifications.show('No se pudo optimizar. Error interno.', 'error');
      return;
    }

    // Mostrar resultados en un diálogo
    const savingsText = RouteOptimizer.generateOptimizationSuggestion(
      dayData.activities,
      result
    );

    const confirmed = await window.Dialogs.confirm({
      title: '🗺️ Optimización de Ruta',
      message: savingsText,
      confirmText: 'Aplicar Optimización',
      cancelText: 'Cancelar',
      type: 'info'
    });

    if (confirmed) {
      // Actualizar el itinerario con la ruta optimizada
      dayData.activities = result.optimizedActivities;

      // Guardar en Firebase
      await saveCurrentItineraryToFirebase();

      Notifications.show(
        `¡Ruta optimizada! Ahorro: ${result.savings.time} min, ¥${result.savings.cost}`,
        'success'
      );

      // Re-render
      render();
    }
  } catch (error) {
    console.error('❌ Error optimizing route:', error);
    Notifications.show('Error al optimizar ruta', 'error');
  }
}

// --- UI render principal ---
async function render(){
  const itinerary=currentItinerary; if(!itinerary || !itinerary.days){ renderNoItinerary(); return; }
  const dayData=itinerary.days.find(d=> d.day===currentDay); if(!dayData) return;
  renderTripSelector();
  renderDaySelector();
  renderDayOverview(dayData);
  renderActivities(dayData);
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

  // Agregar clases para scroll horizontal
  container.className = 'flex gap-3 overflow-x-auto pb-2 px-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent';

  container.innerHTML = days.map(day => `
    <button data-day="${day.day}" class="day-btn px-5 py-2.5 rounded-xl whitespace-nowrap font-semibold transition-all hover:scale-105 flex-shrink-0 ${ currentDay===day.day ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-500 shadow-md' }">Día ${day.day}</button>
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
      <div class="flex justify-between text-sm mb-1 dark:text-gray-100"><span>Progreso</span><span>${completed}/${day.activities.length}</span></div>
      <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2"><div class="bg-red-600 dark:bg-red-500 h-2 rounded-full transition-all duration-500" style="width:${progress}%"></div></div>
      <div class="mt-2 text-right">${syncStatus}</div>
    </div>
    <div class="space-y-3 text-sm">
      <p class="font-semibold text-base dark:text-gray-100">${day.date}</p>
      <p class="font-bold text-lg text-red-600 dark:text-red-400">${day.title||''}</p>
      ${day.hotel ? `
        <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border-l-2 border-blue-500 dark:border-blue-400">
          <p class="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">🏨 Hotel Recomendado</p>
          <p class="text-sm text-gray-700 dark:text-gray-100">${day.hotel}</p>
        </div>
      `:''}
      ${day.location ? `<p class="text-xs text-gray-500 dark:text-gray-300">📍 ${day.location}</p>`:''}
    </div>
    <!-- ⚖️ Indicador de Carga del Día -->
    ${renderDayLoadIndicator(day)}

    <!-- 🔮 Predicción de Experiencia -->
    ${renderDayExperiencePrediction(day)}

    <div class="mt-6 space-y-2">
      <button type="button" id="analyzeBalanceBtn" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center justify-center gap-2">
        <span>⚖️</span>
        <span>Analizar Balance</span>
      </button>
      <button type="button" id="optimizeRouteBtn_${day.day}" class="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center justify-center gap-2">
        <span>🗺️</span>
        <span>Optimizar Ruta</span>
      </button>
      <button type="button" id="addActivityBtn_${day.day}" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition">+ Añadir Actividad</button>
    </div>`;
}

/**
 * Renderiza la predicción de experiencia del día
 */
function renderDayExperiencePrediction(day) {
  if (!day || !day.activities || day.activities.length === 0) {
    return ''; // No mostrar nada si no hay actividades
  }

  const prediction = DayExperiencePredictor.predictDayExperience(day);

  const energyConfig = {
    low: { icon: '😌', label: 'Ligero', color: 'green' },
    medium: { icon: '👍', label: 'Moderado', color: 'blue' },
    high: { icon: '💪', label: 'Intenso', color: 'orange' },
    extreme: { icon: '🔥', label: 'Extremo', color: 'red' }
  };

  const crowdConfig = {
    quiet: { icon: '🌿', label: 'Tranquilo', color: 'green' },
    moderate: { icon: '👥', label: 'Moderado', color: 'blue' },
    crowded: { icon: '🏙️', label: 'Concurrido', color: 'orange' },
    very_crowded: { icon: '🚨', label: 'Muy Concurrido', color: 'red' }
  };

  const paceConfig = {
    relaxed: { icon: '🧘', label: 'Relajado', color: 'green' },
    comfortable: { icon: '😊', label: 'Cómodo', color: 'blue' },
    moderate: { icon: '⏰', label: 'Moderado', color: 'yellow' },
    intense: { icon: '🏃', label: 'Intenso', color: 'orange' },
    aggressive: { icon: '🚀', label: 'Agresivo', color: 'red' }
  };

  const budgetConfig = {
    free: { icon: '🆓', label: 'Gratis', color: 'green' },
    budget: { icon: '💵', label: 'Económico', color: 'green' },
    moderate: { icon: '💰', label: 'Moderado', color: 'blue' },
    high: { icon: '💳', label: 'Alto', color: 'orange' },
    premium: { icon: '💎', label: 'Premium', color: 'purple' }
  };

  const energy = energyConfig[prediction.energy.level] || energyConfig.medium;
  const crowds = crowdConfig[prediction.crowds.level] || crowdConfig.moderate;
  const pace = paceConfig[prediction.pace.pace] || paceConfig.moderate;
  const budget = budgetConfig[prediction.budget.category] || budgetConfig.moderate;

  return `
    <div class="mt-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
      <h3 class="font-bold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
        <span>🔮</span>
        <span>Predicción de Experiencia</span>
      </h3>

      <div class="grid grid-cols-2 gap-2 mb-3">
        <div class="bg-white dark:bg-gray-800 rounded p-2 border border-${energy.color}-200 dark:border-${energy.color}-700">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Energía</div>
          <div class="flex items-center gap-1">
            <span class="text-lg">${energy.icon}</span>
            <span class="text-sm font-semibold text-${energy.color}-700 dark:text-${energy.color}-300">${energy.label}</span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded p-2 border border-${crowds.color}-200 dark:border-${crowds.color}-700">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Multitudes</div>
          <div class="flex items-center gap-1">
            <span class="text-lg">${crowds.icon}</span>
            <span class="text-sm font-semibold text-${crowds.color}-700 dark:text-${crowds.color}-300">${crowds.label}</span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded p-2 border border-${pace.color}-200 dark:border-${pace.color}-700">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Ritmo</div>
          <div class="flex items-center gap-1">
            <span class="text-lg">${pace.icon}</span>
            <span class="text-sm font-semibold text-${pace.color}-700 dark:text-${pace.color}-300">${pace.label}</span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded p-2 border border-${budget.color}-200 dark:border-${budget.color}-700">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Presupuesto</div>
          <div class="flex items-center gap-1">
            <span class="text-lg">${budget.icon}</span>
            <span class="text-sm font-semibold text-${budget.color}-700 dark:text-${budget.color}-300">¥${prediction.budget.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded p-3 border border-indigo-200 dark:border-indigo-700">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-2xl">${prediction.recommendation.icon}</span>
          <span class="font-bold text-indigo-900 dark:text-indigo-100">${prediction.recommendation.rating.toUpperCase()}</span>
        </div>
        <p class="text-xs text-gray-700 dark:text-gray-300">${prediction.recommendation.message}</p>
      </div>
    </div>
  `;
}

/**
 * Renderiza el indicador visual de carga del día
 */
function renderDayLoadIndicator(day) {
  const analysis = DayBalancer.analyzeDayLoad(day);

  const loadConfig = {
    empty: {
      color: 'gray',
      icon: '⚪',
      label: 'Vacío',
      bgClass: 'bg-gray-100 dark:bg-gray-700',
      textClass: 'text-gray-700 dark:text-gray-300',
      borderClass: 'border-gray-300 dark:border-gray-600'
    },
    low: {
      color: 'blue',
      icon: '🔵',
      label: 'Ligero',
      bgClass: 'bg-blue-50 dark:bg-blue-900/30',
      textClass: 'text-blue-700 dark:text-blue-300',
      borderClass: 'border-blue-300 dark:border-blue-600'
    },
    light: {
      color: 'green',
      icon: '🟢',
      label: 'Moderado',
      bgClass: 'bg-green-50 dark:bg-green-900/30',
      textClass: 'text-green-700 dark:text-green-300',
      borderClass: 'border-green-300 dark:border-green-600'
    },
    balanced: {
      color: 'emerald',
      icon: '✅',
      label: 'Balanceado',
      bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
      textClass: 'text-emerald-700 dark:text-emerald-300',
      borderClass: 'border-emerald-300 dark:border-emerald-600'
    },
    heavy: {
      color: 'orange',
      icon: '🟠',
      label: 'Cargado',
      bgClass: 'bg-orange-50 dark:bg-orange-900/30',
      textClass: 'text-orange-700 dark:text-orange-300',
      borderClass: 'border-orange-300 dark:border-orange-600'
    },
    overloaded: {
      color: 'red',
      icon: '🔴',
      label: 'Sobrecargado',
      bgClass: 'bg-red-50 dark:bg-red-900/30',
      textClass: 'text-red-700 dark:text-red-300',
      borderClass: 'border-red-300 dark:border-red-600'
    }
  };

  const config = loadConfig[analysis.load] || loadConfig.balanced;

  return `
    <div class="mt-4 ${config.bgClass} ${config.borderClass} border rounded-lg p-3">
      <div class="flex items-center justify-between mb-2">
        <span class="${config.textClass} text-sm font-semibold">
          ${config.icon} ${config.label}
        </span>
        <span class="${config.textClass} text-xs font-mono">
          Score: ${analysis.score}/100
        </span>
      </div>
      <div class="space-y-1 text-xs ${config.textClass}">
        ${analysis.issues.slice(0, 2).map(issue => `
          <div class="flex items-start gap-1">
            <span class="text-[10px]">•</span>
            <span>${issue}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Función auxiliar para convertir hora en formato comparable
function parseTime(timeStr) {
  if (!timeStr) return 0;

  // Limpiar el string de hora
  const cleaned = timeStr.trim().toLowerCase();

  // Extraer horas y minutos
  const match = cleaned.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2] || 0);
  const period = match[3];

  // Convertir a formato 24h si es PM/AM
  if (period === 'pm' && hours < 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function renderActivities(day){
  const container=document.getElementById('activitiesTimeline'); if(!container) return;
  const currentUserId = auth.currentUser?.uid;

  if (sortableInstance){ try{ sortableInstance.destroy(); }catch(_){} sortableInstance=null; }

  // Ordenar actividades por hora antes de renderizar
  const sortedActivities = (day.activities||[]).slice().sort((a, b) => {
    return parseTime(a.time) - parseTime(b.time);
  });

  // DEBUG: Log activities data
  console.log('🔍 Rendering activities for day', day.day, ':', sortedActivities.map(a => ({ id: a.id, title: a.title, name: a.name })));

  container.innerHTML = sortedActivities.map((act,i)=> {
    const votes = act.votes || {};
    const voteCount = Object.keys(votes).length;
    const userHasVoted = currentUserId && votes[currentUserId];

    // DEBUG: Log each activity title
    // 🛡️ Data normalization: Filter out "undefined" string and falsy values
    const normalizedTitle = (act.title && act.title !== 'undefined' && act.title !== 'null') ? act.title : null;
    const normalizedName = (act.name && act.name !== 'undefined' && act.name !== 'null') ? act.name : null;
    const activityTitle = normalizedTitle || normalizedName || 'Sin título';
    console.log(`📝 Activity ${act.id}: title="${act.title}", name="${act.name}", normalized="${normalizedTitle}", final="${activityTitle}"`);

    return `
    <div class="activity-card bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden fade-in transition-all hover:shadow-xl border-l-4 border-red-500 dark:border-red-400 ${checkedActivities[act.id]?'opacity-60':''}" style="animation-delay:${i*0.05}s">
      <div class="p-5 flex items-start gap-4">
        <div class="flex flex-col gap-2 items-center">
          <div class="drag-handle text-gray-400 dark:text-gray-400 text-xs cursor-grab active:cursor-grabbing" title="Arrastra para reordenar">⋮⋮</div>
          <input type="checkbox" data-id="${act.id}" ${checkedActivities[act.id]?'checked':''} class="activity-checkbox w-5 h-5 cursor-pointer accent-red-600 flex-shrink-0" />
        </div>
        <div class="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 p-3 rounded-lg text-2xl flex-shrink-0">${act.icon||'📍'}</div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-300">${act.time||''}</span>
                ${act.cost>0?`<span class="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded font-semibold">¥${Number(act.cost).toLocaleString()}</span>`:''}
              </div>
              <h3 class="text-lg font-bold dark:text-white mb-1">${activityTitle}</h3>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button
                type="button"
                data-action="vote"
                data-activity-id="${act.id}"
                data-day="${day.day}"
                class="activity-vote-btn p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center gap-1 ${userHasVoted ? 'text-red-500' : 'text-gray-400 dark:text-gray-300'}"
                title="Votar por esta actividad"
              >
                <i class="fas fa-heart"></i>
                <span class="text-xs font-bold">${voteCount > 0 ? voteCount : ''}</span>
              </button>
              <button type="button" data-action="edit" data-activity-id="${act.id}" data-day="${day.day}" class="activity-edit-btn p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">✏️</button>
              <button type="button" data-action="delete" data-activity-id="${act.id}" data-day="${day.day}" class="activity-delete-btn p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">🗑️</button>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-200 mt-2">${act.desc||''}</p>
          ${act.station?`<p class="text-xs text-gray-500 dark:text-gray-300 mt-2">🚉 ${act.station}</p>`:''}
          ${act.train?`
            <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-2 border-blue-500 dark:border-blue-400">
              <p class="text-xs font-semibold text-blue-700 dark:text-blue-200 mb-1">🚄 ${act.train.line}</p>
              <p class="text-xs text-gray-600 dark:text-gray-200">${act.train.from} → ${act.train.to}</p>
              <p class="text-xs text-gray-500 dark:text-gray-300">⏱️ ${act.train.duration}</p>
            </div>`:''}
        </div>
      </div>
    </div>`;
  }).join('');

  // Initialize drag and drop AFTER rendering activities
  console.log('⏰ Initializing drag & drop...');
  initializeDragAndDrop(container);
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
      <div class="max-w-6xl mx-auto px-4 pt-6"><div id="tripSelectorHeader"></div></div>
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 sticky top-[72px] z-30 shadow-sm">
        <div class="max-w-6xl mx-auto px-6 py-5"><div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" id="daySelector"></div></div>
      </div>
      <div class="max-w-6xl mx-auto p-6 md:p-8">
        <div class="grid md:grid-cols-3 gap-6">
          <div class="md:col-span-1"><div class="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 sticky top-36 fade-in border dark:border-gray-600" id="dayOverview"></div></div>
          <div class="md:col-span-2"><div class="space-y-4" id="activitiesTimeline"></div></div>
        </div>
      </div>`;

    if(!isListenerAttached){
      console.log('🎯 Attaching event listeners to itinerary container');
      container.addEventListener('click', (e)=>{
        console.log('🖱️ Click detected on:', e.target);
        const addBtn=e.target.closest('[id^="addActivityBtn_"]');
        const optimizeBtn=e.target.closest('[id^="optimizeRouteBtn_"]');
        const analyzeBalanceBtn=e.target.closest('#analyzeBalanceBtn');
        const editBtn=e.target.closest('.activity-edit-btn');
        const deleteBtn=e.target.closest('.activity-delete-btn');
        const voteBtn = e.target.closest('.activity-vote-btn');
        const dayBtn=e.target.closest('.day-btn');

        if(analyzeBalanceBtn){
          console.log('⚖️ Analyze balance button clicked');
          showBalanceAnalysis();
        }
        else if(optimizeBtn){
          console.log('🗺️ Optimize route button clicked');
          const day=parseInt(optimizeBtn.id.split('_')[1]);
          optimizeDayRoute(day);
        }
        else if(addBtn){
          console.log('➕ Add button clicked');
          const day=parseInt(addBtn.id.split('_')[1]);
          console.log('📅 Opening modal for day:', day);
          ItineraryHandler.showActivityModal(null, day);
        }
        else if(editBtn){
          console.log('✏️ Edit button clicked');
          const activityId=editBtn.dataset.activityId;
          const dayNum=parseInt(editBtn.dataset.day);
          ItineraryHandler.showActivityModal(activityId, dayNum);
        }
        else if(deleteBtn){
          console.log('🗑️ Delete button clicked');
          const activityId=deleteBtn.dataset.activityId;
          const dayNum=parseInt(deleteBtn.dataset.day);
          ItineraryHandler.deleteActivity(activityId, dayNum);
        }
        else if(voteBtn){
          console.log('❤️ Vote button clicked');
          const activityId=voteBtn.dataset.activityId;
          const dayNum=parseInt(voteBtn.dataset.day);
          ItineraryHandler.toggleVote(dayNum, activityId);
        }
        else if(dayBtn){
          console.log('📅 Day button clicked');
          selectDay(parseInt(dayBtn.dataset.day));
        }
      });
      container.addEventListener('change', (e)=>{ const checkbox=e.target.closest('.activity-checkbox'); if(checkbox){ toggleActivity(checkbox.dataset.id); } });
      isListenerAttached=true;
    }

    // Now that the DOM is ready, initialize the realtime sync which will call render()
    await initRealtimeSync();
  },

  async reinitialize(){
    // The init function handles all the necessary setup, including loading data
    // and setting up the realtime sync. Just call it.
    await this.init();
  },

  // Mostrar modal de actividad (añadir o editar)
  showActivityModal(activityId, day) {
    console.log('🔍 showActivityModal called with:', { activityId, day });
    const modal = document.getElementById('activityModal');
    const form = document.getElementById('activityForm');
    const title = document.getElementById('activityModalTitle');

    console.log('🔍 Modal elements:', { modal: !!modal, form: !!form, title: !!title });

    if (!modal || !form) {
      console.error('❌ Modal or form not found!', { modal: !!modal, form: !!form });
      return;
    }

    // Reset form
    form.reset();
    document.getElementById('activityId').value = activityId || '';

    // Guardar el día original para detectar cambios
    form.dataset.originalDay = day;

    // Llenar selector de días dinámicamente
    const daySelect = document.getElementById('activityDay');
    if (daySelect && currentItinerary && currentItinerary.days) {
      daySelect.innerHTML = currentItinerary.days.map(d =>
        `<option value="${d.day}" ${d.day === day ? 'selected' : ''}>Día ${d.day}</option>`
      ).join('');
    }

    // Si estamos editando, cargar datos de la actividad
    if (activityId) {
      title.textContent = 'Editar Actividad';
      const dayData = currentItinerary.days.find(d => d.day === day);
      const activity = dayData?.activities.find(a => a.id === activityId);

      if (activity) {
        document.getElementById('activityIcon').value = activity.icon || '';
        document.getElementById('activityTime').value = activity.time || '';
        // 🛡️ Data normalization: Filter out "undefined" string
      const cleanTitle = (activity.title && activity.title !== 'undefined' && activity.title !== 'null') ? activity.title : activity.name;
      document.getElementById('activityTitle').value = cleanTitle || '';
        document.getElementById('activityDesc').value = activity.desc || '';
        document.getElementById('activityCost').value = activity.cost || '';
        document.getElementById('activityStation').value = activity.station || '';
      }
    } else {
      title.textContent = 'Añadir Actividad';
    }

    // Mostrar modal
    console.log('🎭 Opening modal...');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    console.log('✅ Modal classes updated:', modal.classList.toString());

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
    const newDay = parseInt(document.getElementById('activityDay').value);
    const form = document.getElementById('activityForm');
    const originalDay = parseInt(form.dataset.originalDay);
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

    const activity = {
      id: activityId || `activity_${Date.now()}`,
      icon,
      time,
      title,
      desc,
      cost,
      station
    };

    // Si estamos editando Y el día cambió, mover la actividad
    if (activityId && originalDay !== newDay) {
      // Eliminar del día original
      const originalDayData = currentItinerary.days.find(d => d.day === originalDay);
      if (originalDayData) {
        originalDayData.activities = originalDayData.activities.filter(a => a.id !== activityId);
      }

      // Agregar al nuevo día
      const newDayData = currentItinerary.days.find(d => d.day === newDay);
      if (!newDayData) {
        alert('⚠️ No se encontró el día destino');
        return;
      }
      newDayData.activities.push(activity);

      Notifications.show(`Actividad movida al Día ${newDay}`, 'success');
    } else {
      // Añadir o actualizar en el mismo día
      const dayData = currentItinerary.days.find(d => d.day === newDay);
      if (!dayData) {
        alert('⚠️ No se encontró el día');
        return;
      }

      if (activityId) {
        const index = dayData.activities.findIndex(a => a.id === activityId);
        if (index >= 0) {
          dayData.activities[index] = activity;
        }
      } else {
        dayData.activities.push(activity);
      }
    }

    try {
      await saveCurrentItineraryToFirebase();
      this.closeActivityModal();
      // render() se llama automáticamente desde el listener onSnapshot del itinerario
      if (!activityId) {
        Notifications.show('Actividad añadida', 'success');
      } else if (originalDay === newDay) {
        Notifications.show('Actividad actualizada', 'success');
      }
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

