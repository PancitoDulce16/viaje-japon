// js/itinerary.js — VERSIÓN MEJORADA con Creación Dinámica + AI Insights Button
console.log('%c🔥🔥🔥 ITINERARY-V3.JS LOADED - VERSION: v1763241633 🔥🔥🔥', 'background: #ff0000; color: #fff; font-size: 20px; padding: 10px;');
console.log('%cSi ves este mensaje, la NUEVA versión se cargó correctamente', 'background: #00ff00; color: #000; font-size: 16px; padding: 5px;');

import { db, auth } from '/js/firebase-config.js';
import { Notifications } from './notifications.js';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
// Local cities fallback provider
import { searchCities } from '/data/japan-cities.js';
import { APP_CONFIG } from '/js/config.js';
import { ActivityAutocomplete } from './activity-autocomplete.js';
import { LocationAutocomplete } from './location-autocomplete.js'; // 📍 Autocompletado de ubicaciones
import { RouteOptimizer } from './route-optimizer-v2.js'; // 🗺️ Optimizador de rutas
import { DayBalancer } from './day-balancer-v3.js'; // ⚖️ Balanceador inteligente de días
import { DayExperiencePredictor } from './day-experience-predictor.js'; // 🔮 Predictor de experiencia

// 🛡️ Safe wrapper para TimeUtils con fallback
const SafeTimeUtils = {
  parseTime: (timeStr) => {
    if (window.TimeUtils) {
      return window.TimeUtils.parseTime(timeStr);
    }
    // Fallback básico
    if (!timeStr) return 0;
    const parts = String(timeStr).split(':');
    if (parts.length !== 2) return 0;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  }
};

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
      // 🔥 Cache buster para forzar actualización
      const cacheBuster = `?v=${Date.now()}`;
      const r = await fetch(`/data/attractions.json${cacheBuster}`);
      const data = await r.json();
      currentItinerary = { days: data.suggestedItinerary };
      console.log('✅ Template loaded with', currentItinerary.days?.length, 'days');
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

      // 🧹 Limpiar datos corruptos (NaN:NaN en tiempos)
      if (currentItinerary && currentItinerary.days) {
        currentItinerary.days.forEach(day => {
          if (day.activities) {
            day.activities.forEach(activity => {
              // Limpiar tiempos con NaN
              if (activity.time && (activity.time === 'NaN:NaN' || activity.time.includes('NaN'))) {
                console.warn(`🧹 Limpiando tiempo corrupto en actividad: ${activity.title || activity.name}, time was: ${activity.time}`);
                activity.time = '09:00'; // Default time
              }
            });
          }
        });
      }

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

    // Specific error handling for permission-denied (expected when user has no trips)
    if (error.code === 'permission-denied') {
      console.log('ℹ️ No hay viajes accesibles - mostrando pantalla de creación');

      // 🚨 SECURITY FIX: Limpiar tripId inválido del localStorage
      localStorage.removeItem('currentTripId');

      // NO mostrar error - es un caso esperado cuando el usuario no tiene viajes
      // En su lugar, el renderEmptyState() mostrará la opción de crear viaje
      return await loadFallbackTemplate();
    }

    // Log unexpected errors (not offline, not permission-denied)
    console.error('❌ Error inesperado loading itinerary from Firebase:', error);

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

          // 🧠 AUTO-CORRECCIÓN: Corregir actividades sin coordenadas
          if (window.IntelligentGeocoder && currentItinerary?.days) {
            // Ejecutar en background sin bloquear el render
            window.IntelligentGeocoder.fixItinerary(currentItinerary, { rateLimit: true })
              .then(result => {
                if (result.fixed > 0) {
                  console.log(`✅ Auto-corrección completada: ${result.fixed} actividades con coordenadas agregadas`);
                  // Guardar automáticamente si se corrigió algo
                  saveCurrentItineraryToFirebase().catch(err =>
                    console.error('❌ Error saving auto-corrected itinerary:', err)
                  );
                  // Re-renderizar para mostrar los cambios
                  render();
                }
              })
              .catch(err => console.error('❌ Error en auto-corrección:', err));
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
          console.warn('⚠️ Permission denied en sync - tripId inválido');
          console.warn('🧹 Limpiando tripId inválido del localStorage');
          localStorage.removeItem('currentTripId');

          // NO mostrar notificación de error - mostrar el empty state
          renderEmptyState();
          return;
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
    // 🎯 USAR BALANCE INTELIGENTE en vez de solo análisis
    // Esto hace asignación por proximidad + auto-completado + análisis
    const result = await DayBalancer.smartBalanceItinerary(currentItinerary);

    // ✅ VALIDAR RESULTADO
    if (!result || !result.analysis) {
      console.error('❌ smartBalanceItinerary no devolvió un resultado válido:', result);
      Notifications.error('❌ Error al analizar el itinerario');
      return;
    }

    // Actualizar itinerario con los cambios
    currentItinerary = result.itinerary;
    await saveCurrentItineraryToFirebase();

    const analysis = result.analysis;
    console.log('📊 Smart balance result:', result);

    // ✅ VALIDAR QUE ANALYSIS TIENE SUGGESTIONS
    if (!analysis.suggestions || !Array.isArray(analysis.suggestions)) {
      console.warn('⚠️ analysis no tiene suggestions válidas, inicializando array vacío');
      analysis.suggestions = [];
    }

    // 🚨 AUTO-APLICAR SUGERENCIAS CRÍTICAS INMEDIATAMENTE (sin preguntar)
    const criticalSuggestions = analysis.suggestions.filter(s => s.priority === 'critical');
    if (criticalSuggestions.length > 0) {
      console.log(`🚨 AUTO-APLICANDO ${criticalSuggestions.length} sugerencias CRÍTICAS...`);

      const criticalResult = DayBalancer.applyAllSuggestions(
        currentItinerary.days,
        criticalSuggestions,
        {
          recalculateTimings: true,
          optimizationMode: 'balanced'
        }
      );

      if (criticalResult.applied > 0) {
        currentItinerary.days = criticalResult.days;
        await saveCurrentItineraryToFirebase();

        Notifications.show(
          `🚨 ${criticalResult.applied} actividades críticas redistribuidas automáticamente (no cabían en sus días)`,
          'warning',
          5000
        );

        // Re-analizar después de aplicar críticos
        const reanalysis = DayBalancer.analyzeItineraryBalance(currentItinerary.days, currentItinerary);
        analysis.suggestions = reanalysis.suggestions;
        analysis.overallScore = reanalysis.overallScore;
      }
    }

    // Construir mensaje del modal
    let message = `<div class="space-y-4">`;

    // Resumen general
    message += `
      <div class="bg-blue-100 dark:bg-blue-800 p-4 rounded-lg border-2 border-blue-400 dark:border-blue-500">
        <h3 class="font-bold text-lg mb-2 text-blue-900 dark:text-white">📊 Resumen General</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-gray-700 dark:text-gray-100">Score Promedio:</span>
            <span class="font-bold text-gray-900 dark:text-white ml-2">${analysis.overallScore}/100</span>
          </div>
          <div>
            <span class="text-gray-700 dark:text-gray-100">Desviación Estándar:</span>
            <span class="font-bold text-gray-900 dark:text-white ml-2">${analysis.standardDeviation}</span>
          </div>
          <div class="col-span-2">
            <span class="text-gray-700 dark:text-gray-100">Estado:</span>
            <span class="font-bold ${analysis.balanced ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'} ml-2">
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
        empty: {
          icon: '⚪',
          bgClass: 'bg-gray-200 dark:bg-gray-700',
          borderClass: 'border-gray-400 dark:border-gray-500',
          textClass: 'text-gray-900 dark:text-white',
          subtextClass: 'text-gray-800 dark:text-gray-200'
        },
        low: {
          icon: '🔵',
          bgClass: 'bg-blue-100 dark:bg-blue-800',
          borderClass: 'border-blue-400 dark:border-blue-500',
          textClass: 'text-blue-900 dark:text-white',
          subtextClass: 'text-blue-800 dark:text-blue-100'
        },
        light: {
          icon: '🟢',
          bgClass: 'bg-green-100 dark:bg-green-800',
          borderClass: 'border-green-400 dark:border-green-500',
          textClass: 'text-green-900 dark:text-white',
          subtextClass: 'text-green-800 dark:text-green-100'
        },
        balanced: {
          icon: '✅',
          bgClass: 'bg-emerald-100 dark:bg-emerald-800',
          borderClass: 'border-emerald-400 dark:border-emerald-500',
          textClass: 'text-emerald-900 dark:text-white',
          subtextClass: 'text-emerald-800 dark:text-emerald-100'
        },
        heavy: {
          icon: '🟠',
          bgClass: 'bg-orange-100 dark:bg-orange-800',
          borderClass: 'border-orange-400 dark:border-orange-500',
          textClass: 'text-orange-900 dark:text-white',
          subtextClass: 'text-orange-800 dark:text-orange-100'
        },
        overloaded: {
          icon: '🔴',
          bgClass: 'bg-red-100 dark:bg-red-800',
          borderClass: 'border-red-400 dark:border-red-500',
          textClass: 'text-red-900 dark:text-white',
          subtextClass: 'text-red-800 dark:text-red-100'
        }
      };

      const config = loadConfig[dayAnalysis.analysis.load] || loadConfig.balanced;

      message += `
        <div class="${config.bgClass} p-3 rounded border ${config.borderClass}">
          <div class="flex justify-between items-center">
            <span class="font-semibold ${config.textClass}">
              ${config.icon} Día ${dayAnalysis.day}
            </span>
            <span class="text-xs font-mono ${config.subtextClass}">
              ${dayAnalysis.analysis.score}/100
            </span>
          </div>
          <div class="text-xs ${config.subtextClass} mt-1">
            ${dayAnalysis.activities.length} actividades •
            ${dayAnalysis.analysis.factors.totalDuration ? Math.round(dayAnalysis.analysis.factors.totalDuration / 60) + 'h' : '0h'} •
            ¥${dayAnalysis.analysis.factors.totalCost ? dayAnalysis.analysis.factors.totalCost.toLocaleString() : '0'}
          </div>
        </div>
      `;
    });

    message += `</div>`;

    // Sugerencias
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      // Contar por prioridad
      const highPriority = analysis.suggestions.filter(s => s.priority === 'high').length;
      const mediumPriority = analysis.suggestions.filter(s => s.priority === 'medium').length;
      const lowPriority = analysis.suggestions.filter(s => s.priority === 'low').length;

      message += `
        <div class="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-800 dark:to-orange-800 p-4 rounded-lg border-2 border-yellow-400 dark:border-yellow-500">
          <h3 class="font-bold text-yellow-900 dark:text-white mb-3 text-lg">💡 ${analysis.suggestions.length} Sugerencias de Mejora</h3>

          <div class="flex gap-3 mb-3 text-xs">
            ${highPriority > 0 ? `<span class="bg-red-500 text-white px-2 py-1 rounded">🔴 ${highPriority} Alta</span>` : ''}
            ${mediumPriority > 0 ? `<span class="bg-yellow-500 text-white px-2 py-1 rounded">🟡 ${mediumPriority} Media</span>` : ''}
            ${lowPriority > 0 ? `<span class="bg-green-500 text-white px-2 py-1 rounded">🟢 ${lowPriority} Baja</span>` : ''}
          </div>

          <ul class="space-y-2 text-sm text-yellow-900 dark:text-yellow-100">
      `;

      analysis.suggestions.slice(0, 8).forEach((suggestion, index) => {
        const priorityBadge = suggestion.priority === 'high' ? '🔴' :
                             suggestion.priority === 'medium' ? '🟡' : '🟢';

        const typeBadge = suggestion.type === 'remove-duplicate' ? '🗑️' :
                         suggestion.type === 'move' ? '↔️' :
                         suggestion.type === 'reorder' ? '🔄' : '💡';

        message += `
          <li class="flex items-start gap-2 bg-white/50 dark:bg-gray-900/30 p-2 rounded">
            <span class="flex-shrink-0">${priorityBadge}${typeBadge}</span>
            <div class="flex-1">
              <div class="font-semibold">${suggestion.description}</div>
              <div class="text-xs opacity-80 mt-1">${suggestion.reason}</div>
            </div>
          </li>
        `;
      });

      if (analysis.suggestions.length > 8) {
        message += `
          <li class="text-xs italic opacity-70 text-center">
            ... y ${analysis.suggestions.length - 8} sugerencias más
          </li>
        `;
      }

      message += `
          </ul>
          <div class="mt-3 p-3 bg-blue-100 dark:bg-blue-900 rounded text-xs text-blue-900 dark:text-blue-100">
            <strong>ℹ️ Al hacer clic en "Aplicar Todo":</strong>
            <ul class="list-disc list-inside mt-1 space-y-1">
              <li>Se aplicarán TODAS las sugerencias automáticamente</li>
              <li>Se eliminarán actividades duplicadas</li>
              <li>Se moverán actividades entre días para balancear</li>
              <li>Se optimizarán rutas donde sea necesario</li>
              <li>Se recalcularán horarios automáticamente</li>
            </ul>
          </div>
        </div>
      `;
    }

    message += `</div>`;

    // Mostrar modal con Dialogs
    const confirmed = await window.Dialogs.confirm({
      title: '⚖️ Análisis de Balance del Itinerario',
      message: message,
      confirmText: analysis.suggestions.length > 0 ? '✨ Aplicar Todo Automáticamente' : 'Cerrar',
      cancelText: 'Solo Ver Análisis',
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
 * 🚀 OPTIMIZACIÓN MAESTRA DEL VIAJE COMPLETO
 * Usa el MasterItineraryOptimizer para reestructurar todo el itinerario de forma inteligente
 */
async function runMasterOptimization() {
  console.log('🚀 Starting master optimization...');

  if (!currentItinerary || !currentItinerary.days || currentItinerary.days.length === 0) {
    Notifications.show('No hay días en el itinerario para optimizar', 'info');
    return;
  }

  // Verificar que MasterItineraryOptimizer esté disponible
  if (!window.MasterItineraryOptimizer) {
    Notifications.show('❌ Sistema de optimización no disponible', 'error');
    console.error('MasterItineraryOptimizer no está cargado');
    return;
  }

  try {
    // Mostrar notificación de inicio
    Notifications.info('🚀 Iniciando optimización inteligente del viaje...');

    // Ejecutar optimización maestra
    const result = await MasterItineraryOptimizer.optimizeCompleteItinerary(currentItinerary);

    if (!result.success) {
      Notifications.error('❌ Error en la optimización: ' + (result.error || 'Desconocido'));
      return;
    }

    // Actualizar itinerario con el resultado optimizado
    currentItinerary = result.itinerary;

    // Construir mensaje del modal con resultados
    let message = `<div class="space-y-4">`;

    // Resumen general
    message += `
      <div class="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-4 rounded-lg border-2 border-purple-400 dark:border-purple-500">
        <h3 class="font-bold text-lg mb-3 text-purple-900 dark:text-white">🎯 Optimización Completada</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-gray-700 dark:text-gray-100">Tiempo:</span>
            <span class="font-bold text-gray-900 dark:text-white ml-2">${result.duration}s</span>
          </div>
          <div>
            <span class="text-gray-700 dark:text-gray-100">Total Actividades:</span>
            <span class="font-bold text-gray-900 dark:text-white ml-2">${result.metrics.totalActivities}</span>
          </div>
          <div>
            <span class="text-gray-700 dark:text-gray-100">Promedio por Día:</span>
            <span class="font-bold text-gray-900 dark:text-white ml-2">${result.metrics.averageActivitiesPerDay}</span>
          </div>
          <div>
            <span class="text-gray-700 dark:text-gray-100">Distancia Total:</span>
            <span class="font-bold text-gray-900 dark:text-white ml-2">${result.metrics.totalDistance}km</span>
          </div>
          <div>
            <span class="text-gray-700 dark:text-gray-100">Ciudades:</span>
            <span class="font-bold text-gray-900 dark:text-white ml-2">${result.metrics.cities}</span>
          </div>
          <div>
            <span class="text-gray-700 dark:text-gray-100">Transiciones:</span>
            <span class="font-bold text-gray-900 dark:text-white ml-2">${result.metrics.transitions}</span>
          </div>
        </div>
      </div>
    `;

    // Validación
    if (result.validation) {
      const validationColor = result.validation.valid ? 'green' : 'red';
      message += `
        <div class="bg-${validationColor}-100 dark:bg-${validationColor}-900 p-4 rounded-lg border-2 border-${validationColor}-400 dark:border-${validationColor}-500">
          <h3 class="font-bold text-lg mb-2 text-${validationColor}-900 dark:text-white">
            ${result.validation.valid ? '✅ Validación Exitosa' : '⚠️ Validación con Advertencias'}
          </h3>
          <div class="text-sm space-y-1">
            <div>
              <span class="text-gray-700 dark:text-gray-100">Errores:</span>
              <span class="font-bold text-${validationColor}-900 dark:text-white ml-2">${result.errors || 0}</span>
            </div>
            <div>
              <span class="text-gray-700 dark:text-gray-100">Advertencias:</span>
              <span class="font-bold text-${validationColor}-900 dark:text-white ml-2">${result.warnings || 0}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Contexto del viaje
    if (result.context) {
      message += `
        <div class="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg border-2 border-blue-400 dark:border-blue-500">
          <h3 class="font-bold text-lg mb-2 text-blue-900 dark:text-white">📖 Narrativa del Viaje</h3>
          <div class="text-sm space-y-2">
            ${result.context.phases.map(phase => `
              <div class="flex items-start gap-2">
                <span class="font-semibold text-blue-900 dark:text-blue-100">${phase.label}:</span>
                <span class="text-gray-700 dark:text-gray-300">Días ${phase.days.join(', ')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Balance de energía
    if (result.energyReport) {
      message += `
        <div class="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg border-2 border-yellow-400 dark:border-yellow-500">
          <h3 class="font-bold text-lg mb-2 text-yellow-900 dark:text-white">💪 Balance de Energía</h3>
          <div class="text-sm">
            <div class="flex items-center gap-2 mb-2">
              ${result.energyReport.pattern.map(level => '⚫'.repeat(level)).join(' ')}
            </div>
            <span class="${result.energyReport.balanced ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}">
              ${result.energyReport.balanced ? '✅ Balance óptimo' : '⚠️ Considera ajustar intensidad'}
            </span>
          </div>
        </div>
      `;
    }

    // Mejoras aplicadas
    message += `
      <div class="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg border border-indigo-400 dark:border-indigo-500">
        <h4 class="font-bold text-sm mb-2 text-indigo-900 dark:text-white">✨ Mejoras Aplicadas:</h4>
        <ul class="text-xs text-indigo-800 dark:text-indigo-100 space-y-1 list-disc list-inside">
          <li>🛬 Día 1 optimizado para jetlag (actividades cercanas al hotel)</li>
          <li>✈️ Último día vacío (reservado para aeropuerto)</li>
          <li>📍 Actividades agrupadas por zonas geográficas</li>
          <li>🗺️ Rutas optimizadas desde el hotel cada día</li>
          <li>🔄 Transiciones entre ciudades planificadas</li>
          <li>💪 Balance de intensidad calculado por fase</li>
          <li>✅ Validación de distancias y coherencia</li>
        </ul>
      </div>
    `;

    message += `</div>`;

    // Mostrar modal
    const confirmed = await window.Dialogs.confirm({
      title: '🚀 Optimización Inteligente Completada',
      message: message,
      confirmText: '💾 Guardar Cambios',
      cancelText: 'Descartar',
      type: 'success'
    });

    if (confirmed) {
      // Guardar en Firebase
      await saveCurrentItineraryToFirebase();

      // Renderizar itinerario actualizado
      renderItinerary();

      Notifications.success('✅ Itinerario optimizado y guardado');
    } else {
      Notifications.info('Cambios descartados');
      // Recargar itinerario original
      await loadItinerary();
    }

  } catch (error) {
    console.error('❌ Error in master optimization:', error);
    Notifications.error('❌ Error en la optimización: ' + error.message);
  }
}

/**
 * Aplica las sugerencias de balance automáticamente
 */
async function applyBalanceSuggestions(suggestions) {
  console.log('🔧 Applying balance suggestions...', suggestions);

  try {
    // Usar el nuevo sistema applyAllSuggestions para aplicar TODO
    const result = DayBalancer.applyAllSuggestions(
      currentItinerary.days,
      suggestions,
      {
        recalculateTimings: true,
        optimizationMode: 'balanced'
      }
    );

    console.log('📊 Resultado del rebalanceo:', result);

    // Actualizar el itinerario con los días modificados
    currentItinerary.days = result.days;

    if (result.applied > 0) {
      await saveCurrentItineraryToFirebase();

      Notifications.show(
        `✅ ¡Rebalanceo completo! Aplicadas ${result.applied} de ${result.total} sugerencias` +
        (result.skipped > 0 ? ` (${result.skipped} omitidas)` : ''),
        'success'
      );

      render();
    } else {
      Notifications.show(
        `ℹ️ No se aplicaron cambios - El itinerario ya está optimizado`,
        'info'
      );
    }

  } catch (error) {
    console.error('❌ Error applying suggestions:', error);
    Notifications.show('Error al aplicar sugerencias', 'error');
  }
}

async function optimizeDayRoute(dayNumber) {
  console.log('═════════════════════════════════════════════════');
  console.log('🗺️ SMART OPTIMIZE ROUTE CLICKED - Día', dayNumber);
  console.log('═════════════════════════════════════════════════');

  if (!currentItinerary || !currentItinerary.days) {
    Notifications.show('No hay itinerario para optimizar', 'error');
    return;
  }

  const dayData = currentItinerary.days.find(d => d.day === dayNumber);
  if (!dayData || !dayData.activities || dayData.activities.length === 0) {
    Notifications.show('No hay actividades en este día para optimizar', 'info');
    return;
  }

  // --- Requisitos Previos ---
  // 1. Verificar hotel
  const city = window.HotelBaseSystem ? window.HotelBaseSystem.detectCityForDay(dayData) : dayData.city;
  const hotel = window.HotelBaseSystem ? window.HotelBaseSystem.getHotelForCity(currentItinerary, city, dayNumber) : null;
  if (!hotel || !hotel.coordinates) {
    Notifications.show(`Registra tu hotel en ${city} para una optimización inteligente basada en ubicación.`, 'warning', 6000);
    // Continuar con la optimización simple si no hay hotel
  }

  // 2. Verificar coordenadas en actividades
  const activitiesWithCoords = dayData.activities.filter(act => act.coordinates && act.coordinates.lat && act.coordinates.lng);
  if (activitiesWithCoords.length < dayData.activities.length) {
    Notifications.show(`Algunas actividades no tienen ubicación. La optimización puede no ser precisa.`, 'info', 5000);
  }

  Notifications.show('🧠 Analizando optimizaciones inteligentes...', 'info');
  await new Promise(resolve => setTimeout(resolve, 100)); // Dar tiempo a la UI para actualizar

  try {
    // --- Lógica de Optimización Inteligente ---
    const analysis = DayBalancer.analyzeItineraryBalance(currentItinerary.days, currentItinerary);
    const allSuggestions = analysis.suggestions;

    // Filtrar sugerencias geográficas de ALTA prioridad para el día actual
    const relevantSuggestions = allSuggestions.filter(s => {
      const isHighPriority = s.priority === 'high' || s.priority === 'critical';
      const isGeographic = s.reason && (s.reason.includes('km de tu hotel') || s.reason.includes('traslado(s) largo(s)'));

      // Sugerencia de reordenar para este día
      if (s.type === 'reorder' && s.day === dayNumber) {
        return true;
      }
      // Sugerencia de mover una actividad A este día por cercanía
      if (s.type === 'move' && s.to.day === dayNumber && isHighPriority && isGeographic) {
        return true;
      }
      // Sugerencia de mover una actividad DESDE este día por ser un outlier geográfico
      if (s.type === 'move' && s.from.day === dayNumber && isHighPriority && isGeographic) {
        return true;
      }
      return false;
    });

    if (relevantSuggestions.length > 0) {
      // --- APLICAR OPTIMIZACIÓN INTELIGENTE ---
      console.log(`🧠 Encontradas ${relevantSuggestions.length} optimizaciones inteligentes para el Día ${dayNumber}. Aplicando...`);

      const result = DayBalancer.applyAllSuggestions(currentItinerary.days, relevantSuggestions);

      if (result.applied > 0) {
        currentItinerary.days = result.days;
        await saveCurrentItineraryToFirebase();
        Notifications.show(`✅ ¡Día ${dayNumber} optimizado inteligentemente! Se aplicaron ${result.applied} mejoras.`, 'success', 5000);
        render(); // Re-render para mostrar los cambios
      } else {
        Notifications.show(`No se aplicaron cambios inteligentes. El día ya parece estar bien organizado.`, 'info');
      }
      return;
    }

    // --- FALLBACK: Optimización Simple (si no hay sugerencias inteligentes) ---
    console.log(`No se encontraron optimizaciones inteligentes. Usando optimizador de ruta simple.`);
    Notifications.show('No se encontraron movimientos inteligentes. Optimizando ruta del día...', 'info');

    const simpleResult = RouteOptimizer.optimizeRoute(dayData.activities, {
      considerOpeningHours: true,
      startPoint: hotel ? hotel.coordinates : null
    });

    if (!simpleResult.wasOptimized) {
      Notifications.show('La ruta de este día ya está optimizada.', 'info');
      return;
    }

    const savingsText = RouteOptimizer.generateOptimizationSuggestion(dayData.activities, simpleResult);
    const confirmed = await window.Dialogs.confirm({
      title: '🗺️ Optimización de Ruta Simple',
      message: savingsText,
      confirmText: 'Aplicar Optimización',
      cancelText: 'Cancelar',
      type: 'info'
    });

    if (confirmed) {
      dayData.activities = simpleResult.optimizedActivities;
      await saveCurrentItineraryToFirebase();
      Notifications.show(`¡Ruta del día optimizada! Ahorro: ${simpleResult.savings.time} min, ¥${simpleResult.savings.cost}`, 'success');
      render();
    }

  } catch (error) {
    console.error('❌ Error en la optimización inteligente de ruta:', error);
    Notifications.show('Ocurrió un error durante la optimización.', 'error');
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
        <div class="flex gap-2 flex-wrap">
          <!-- ❌ ELIMINADO: Análisis del Viaje (feature semi-roto) -->
          <!-- ❌ ELIMINADO: Generador Inteligente (frustrante, no funciona bien) -->
          ${userTrips.length>1 ? `<button onclick="TripsManager.showTripsListModal()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition text-sm font-semibold backdrop-blur-sm">🔄 Cambiar Viaje</button>`:''}
          <button onclick="TripsManager.showShareCode()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition text-sm font-semibold backdrop-blur-sm">🔗 Compartir</button>
          ${currentItinerary ? `<button onclick="window.PDFExporter?.exportToPDF()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition text-sm font-semibold backdrop-blur-sm">📄 Exportar PDF</button>`:''}
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

/**
 * 📊 Renderiza estadísticas rápidas del día en una línea compacta
 */
function renderQuickStats(day) {
  if (!day || !day.activities || day.activities.length === 0) {
    return '';
  }

  const activitiesCount = day.activities.length;

  // Calcular duración total del día
  const activitiesWithTime = day.activities.filter(a => a.time);
  let totalHours = 0;
  if (activitiesWithTime.length > 0) {
    const sorted = [...activitiesWithTime].sort((a, b) => {
      const timeA = a.time || '09:00';
      const timeB = b.time || '09:00';
      return timeA.localeCompare(timeB);
    });

    const firstTime = sorted[0].time || '09:00';
    const lastActivity = sorted[sorted.length - 1];
    const lastTime = lastActivity.time || '18:00';
    const lastDuration = lastActivity.duration || 90;

    const [firstH, firstM] = firstTime.split(':').map(Number);
    const [lastH, lastM] = lastTime.split(':').map(Number);
    const firstMinutes = firstH * 60 + firstM;
    const lastMinutes = lastH * 60 + lastM + lastDuration;

    totalHours = ((lastMinutes - firstMinutes) / 60).toFixed(1);
  }

  // Calcular costo total
  const totalCost = calculateDayTotalCost(day);

  // Detectar alertas
  let alertsCount = 0;
  let highestSeverity = 'none';
  if (window.ItineraryIntelligence && activitiesWithTime.length >= 2) {
    const conflicts = window.ItineraryIntelligence.detectConflicts(day);
    alertsCount = conflicts.length;

    if (conflicts.some(c => c.severity === 'high')) {
      highestSeverity = 'high';
    } else if (conflicts.some(c => c.severity === 'medium')) {
      highestSeverity = 'medium';
    } else if (conflicts.length > 0) {
      highestSeverity = 'low';
    }
  }

  const alertColor =
    highestSeverity === 'high' ? 'text-red-600 dark:text-red-400' :
    highestSeverity === 'medium' ? 'text-orange-600 dark:text-orange-400' :
    highestSeverity === 'low' ? 'text-yellow-600 dark:text-yellow-400' :
    'text-green-600 dark:text-green-400';

  return `
    <div class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3 mb-4 border border-purple-200 dark:border-purple-700">
      <div class="grid grid-cols-4 gap-2 text-center">
        <div class="flex flex-col items-center">
          <span class="text-purple-600 dark:text-purple-400 text-xl mb-1">📍</span>
          <span class="text-xs text-gray-600 dark:text-gray-400">Actividades</span>
          <span class="font-bold text-gray-900 dark:text-white">${activitiesCount}</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-blue-600 dark:text-blue-400 text-xl mb-1">⏱️</span>
          <span class="text-xs text-gray-600 dark:text-gray-400">Duración</span>
          <span class="font-bold text-gray-900 dark:text-white">${totalHours}h</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-green-600 dark:text-green-400 text-xl mb-1">💰</span>
          <span class="text-xs text-gray-600 dark:text-gray-400">Costo</span>
          <span class="font-bold text-gray-900 dark:text-white">¥${(totalCost / 1000).toFixed(1)}k</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="${alertColor} text-xl mb-1">${alertsCount > 0 ? '🚨' : '✅'}</span>
          <span class="text-xs text-gray-600 dark:text-gray-400">Alertas</span>
          <span class="font-bold ${alertColor}">${alertsCount}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * 📅 Renderiza un mini timeline visual del día
 */
function renderMiniTimeline(day) {
  if (!day || !day.activities || day.activities.length === 0) {
    return '';
  }

  const activitiesWithTime = day.activities.filter(a => a.time);

  if (activitiesWithTime.length === 0) {
    return '';
  }

  // Ordenar por tiempo
  const sorted = [...activitiesWithTime].sort((a, b) => {
    const timeA = a.time || '09:00';
    const timeB = b.time || '09:00';
    return timeA.localeCompare(timeB);
  });

  // Encontrar rango de horas (06:00 - 23:00 típicamente)
  const startHour = 6;
  const endHour = 23;
  const totalMinutes = (endHour - startHour) * 60;

  // Construir bloques de actividades
  const blocks = sorted.map(act => {
    const [h, m] = (act.time || '09:00').split(':').map(Number);
    const actMinutes = h * 60 + m;
    const offsetMinutes = actMinutes - (startHour * 60);
    const leftPercent = Math.max(0, (offsetMinutes / totalMinutes) * 100);
    const widthPercent = Math.min(5, ((act.duration || 90) / totalMinutes) * 100);

    // Color según tipo de actividad
    let color = 'bg-purple-500';
    if (act.isMeal) color = 'bg-orange-500';
    else if (act.category === 'cultural') color = 'bg-blue-500';
    else if (act.category === 'shopping') color = 'bg-pink-500';

    return { leftPercent, widthPercent, color, time: act.time, title: act.title };
  });

  return `
    <div class="bg-white dark:bg-gray-700 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-600">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">Timeline del Día</span>
        <div class="flex gap-2 text-xs">
          <span class="text-gray-500 dark:text-gray-400">${sorted[0].time}</span>
          <span class="text-gray-400 dark:text-gray-500">→</span>
          <span class="text-gray-500 dark:text-gray-400">${sorted[sorted.length - 1].time}</span>
        </div>
      </div>

      <!-- Timeline bar -->
      <div class="relative h-8 bg-gray-100 dark:bg-gray-600 rounded-full overflow-visible">
        <!-- Hour markers -->
        <div class="absolute inset-0 flex justify-between px-1 text-[8px] text-gray-400 dark:text-gray-500 items-center pointer-events-none">
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>

        <!-- Activity blocks -->
        ${blocks.map((block, i) => `
          <div
            class="${block.color} absolute top-1 h-6 rounded transition-all hover:scale-110 hover:z-10 group cursor-pointer"
            style="left: ${block.leftPercent}%; width: ${Math.max(block.widthPercent, 2)}%"
            title="${block.time} - ${block.title}"
          >
            <!-- Tooltip on hover -->
            <div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
              ${block.time} - ${block.title}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Legend -->
      <div class="flex gap-3 mt-2 text-[10px] text-gray-600 dark:text-gray-400 justify-center flex-wrap">
        <span class="flex items-center gap-1"><span class="w-2 h-2 bg-purple-500 rounded-full"></span>Actividad</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 bg-orange-500 rounded-full"></span>Comida</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 bg-blue-500 rounded-full"></span>Cultural</span>
      </div>
    </div>
  `;
}

/**
 * 🎯 Renderiza botones de acción rápida compactos (hover para mostrar)
 */
function renderQuickActionButtons(day) {
  return `
    <div>
      <!-- Simple add button (always visible) -->
      <div class="mb-3">
        <button
          type="button"
          id="addActivityBtn_${day.day}"
          class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
          title="Añadir Actividad"
        >
          + Agregar Actividad
        </button>
      </div>

      <!-- ❌ FEATURES DESACTIVADOS - Botones eliminados (2025-11-15)

           Botones eliminados porque NO funcionan al 100%:
           - ⚡ Acciones (panel vacío sin contenido útil)
           - 🗺️ Optimizar Ruta (reorganiza sin permiso)
           - 🍽️ Auto-Insertar Comidas (semi-roto)
           - 🕳️ Llenar Huecos (no implementado correctamente)
           - 💡 Ver Sugerencias (sugerencias genéricas poco útiles)
           - ⚖️ Analizar Balance (solo genera ruido)
           - 🚀 Optimización Inteligente de Viaje (promete pero no cumple)

           FILOSOFÍA: Menos features, todos funcionando 100%

           Funcionalidad core que SÍ funciona:
           - ✅ Agregar actividad (+)
           - ✅ Drag & drop para organizar
           - ✅ Editar/eliminar actividades
           - ✅ Ver en mapa
      -->
    </div>
  `;
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

  // 🏨 Detectar ciudad y hotel para este día
  let cityForDay = day.city || day.location || null;
  if (!cityForDay && window.HotelBaseSystem) {
    cityForDay = window.HotelBaseSystem.detectCityForDay(day);
  }

  // Obtener hotel de la ciudad si existe
  let hotelForCity = null;
  if (cityForDay && currentItinerary && window.HotelBaseSystem) {
    hotelForCity = window.HotelBaseSystem.getHotelForCity(currentItinerary, cityForDay, day.day);
  }

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
      // City cards locales kawaii
      const cityImages = {
        tokyo: '/images/iconos/City cards/tokyo1.png',
        kyoto: '/images/iconos/City cards/Kyoto1.png',
        osaka: '/images/iconos/City cards/Osaka.png',
        nara: '/images/iconos/City cards/Nara1.png',
        hiroshima: '/images/iconos/City cards/Hiroshima.png',
        fukuoka: '/images/iconos/City cards/Fukuoka.png',
        hakone: '/images/iconos/City cards/hakone1.png',
        kamakura: '/images/iconos/City cards/Kamakura.png',
        nikko: '/images/iconos/City cards/tokyo1.png' // Fallback a Tokyo
      };
      cityImage = cityImages[cityName] || cityImages.tokyo;
      console.log('🖼️ Image from fallback:', cityImage);
    }
  }

  console.log('✅ Final cityImage:', cityImage);

  container.innerHTML = `
    ${cityImage ? `
      <div class="relative w-full rounded-t-xl -mx-6 -mt-6 mb-4">
        <img src="${cityImage}" alt="${day.city || day.location || 'Japan'}" class="w-full h-auto" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
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

      <!-- Weather Widget -->
      <div id="weather-day-${day.day}" class="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 p-3 rounded-lg border-l-4 border-sky-500 dark:border-sky-400">
        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span class="animate-pulse">⏳</span>
          <span>Cargando clima...</span>
        </div>
      </div>

      <p class="font-bold text-lg text-red-600 dark:text-red-400">${day.title||''}</p>
      ${day.season ? `
        <div class="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 p-3 rounded-lg border-l-4 border-pink-500 dark:border-pink-400">
          <div class="flex items-start gap-2">
            <span class="text-2xl">${day.season.icon}</span>
            <div class="flex-1">
              <p class="font-bold text-pink-700 dark:text-pink-300 text-sm">${day.season.name} ${day.season.inPeak ? '- PEAK TIME! 🌟' : ''}</p>
              ${day.season.tips ? `<p class="text-xs text-gray-600 dark:text-gray-300 mt-1">💡 ${day.season.tips}</p>` : ''}
            </div>
          </div>
        </div>
      ` : ''}
      ${day.energyLevel ? `
        <div class="flex items-center gap-2 text-xs">
          <span class="font-semibold dark:text-gray-200">⚡ Energy Level:</span>
          <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div class="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all" style="width:${day.energyLevel}%"></div>
          </div>
          <span class="font-bold text-orange-600 dark:text-orange-400">${day.energyLevel}%</span>
        </div>
      ` : ''}
      ${hotelForCity ? `
        <div class="bg-blue-50 dark:bg-blue-800 p-3 rounded-lg border-l-2 border-blue-500 dark:border-blue-400">
          <div class="flex justify-between items-start mb-1">
            <p class="text-xs font-semibold text-blue-700 dark:text-blue-100">🏨 Hotel Base - ${cityForDay}</p>
            <button
              type="button"
              onclick="ItineraryHandler.showHotelManagementModal('${cityForDay}')"
              class="text-xs text-blue-600 dark:text-blue-200 hover:underline"
            >Cambiar</button>
          </div>
          <p class="text-sm font-bold text-gray-900 dark:text-white">${hotelForCity.name}</p>
          ${hotelForCity.address ? `<p class="text-xs text-gray-600 dark:text-gray-300 mt-1">${hotelForCity.address}</p>` : ''}
          ${hotelForCity.rating ? `<p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">⭐ ${hotelForCity.rating}</p>` : ''}
        </div>
      ` : cityForDay ? `
        <button
          type="button"
          onclick="ItineraryHandler.showHotelManagementModal('${cityForDay}')"
          class="w-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 p-3 rounded-lg border-2 border-dashed border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-200 text-sm font-semibold transition"
        >
          + Agregar Hotel en ${cityForDay}
        </button>
      ` : ''}
      ${day.location ? `<p class="text-xs text-gray-500 dark:text-gray-200">📍 ${day.location}</p>`:''}
    </div>

    <!-- 📊 Quick Stats del Día -->
    ${renderQuickStats(day)}

    <!-- 📅 Mini Timeline Visual -->
    ${renderMiniTimeline(day)}

    <!-- 🎯 Botones de Acción Rápida -->
    ${renderQuickActionButtons(day)}

    <!-- 💰 Widget de Presupuesto del Día (Colapsable) -->
    ${renderDayBudgetCollapsible(day)}

    <!-- 🧠 Análisis Inteligente del Día (Colapsable) -->
    ${renderDayIntelligenceCollapsible(day)}

    <!-- ⚖️ Indicador de Carga del Día (Colapsable) -->
    ${renderDayLoadIndicatorCollapsible(day)}

    <!-- 🔮 Predicción de Experiencia (Colapsable) -->
    ${renderDayExperiencePredictionCollapsible(day)}
    `;

  // 🌤️ Cargar clima asíncronamente
  loadWeatherForDay(day);
}

/**
 * 🌤️ Carga el clima para el día actual usando la API de OpenWeather
 */
async function loadWeatherForDay(day) {
  const weatherContainer = document.getElementById(`weather-day-${day.day}`);
  if (!weatherContainer) return;

  // Obtener ciudad del día
  const city = day.city || day.location || 'Tokyo';

  // Verificar que AppUtils esté disponible
  if (!window.AppUtils || !window.AppUtils.fetchWeather) {
    console.warn('🌤️ AppUtils.fetchWeather not available');
    weatherContainer.innerHTML = `
      <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span>🌤️</span>
        <span>Clima no disponible</span>
      </div>
    `;
    return;
  }

  try {
    const weather = await window.AppUtils.fetchWeather(city);

    if (weather) {
      const emoji = window.AppUtils.getWeatherEmoji(weather.icon);

      // Determinar sugerencias según el clima
      let suggestion = '';
      if (weather.description.includes('lluvia') || weather.description.includes('rain')) {
        suggestion = '<p class="text-xs text-blue-700 dark:text-blue-300 mt-1">☂️ Lleva paraguas</p>';
      } else if (weather.temp > 25) {
        suggestion = '<p class="text-xs text-orange-700 dark:text-orange-300 mt-1">🧴 Usa protector solar</p>';
      } else if (weather.temp < 10) {
        suggestion = '<p class="text-xs text-blue-700 dark:text-blue-300 mt-1">🧥 Lleva abrigo</p>';
      }

      weatherContainer.innerHTML = `
        <div class="flex items-start gap-2">
          <span class="text-2xl">${emoji}</span>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <p class="font-bold text-sky-700 dark:text-sky-300 text-sm">${weather.temp}°C</p>
              <p class="text-xs text-gray-600 dark:text-gray-400 capitalize">${weather.description}</p>
            </div>
            <div class="flex gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>💧 ${weather.humidity}%</span>
              <span>💨 ${weather.wind.toFixed(1)} m/s</span>
              <span>🌡️ Sensación: ${weather.feels_like}°C</span>
            </div>
            ${suggestion}
          </div>
        </div>
      `;
    } else {
      // Fallback si no hay datos
      weatherContainer.innerHTML = `
        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>🌤️</span>
          <span>${city} - Clima no disponible</span>
        </div>
      `;
    }
  } catch (error) {
    console.error('🌤️ Error loading weather:', error);
    weatherContainer.innerHTML = `
      <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span>🌤️</span>
        <span>Error al cargar clima</span>
      </div>
    `;
  }
}

/**
 * 💰 Renderiza widget de presupuesto COLAPSABLE
 */
function renderDayBudgetCollapsible(day) {
  const totalCost = calculateDayTotalCost(day);
  const budget = day.budget || 0;

  // Si no hay presupuesto ni gastos, mostrar CTA para establecer presupuesto
  if (budget === 0 && totalCost === 0) {
    return `
      <div class="mt-4">
        <button
          type="button"
          onclick="editDayBudget(${day.day}, 0)"
          class="w-full bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-2 border-dashed border-green-400 dark:border-green-600 rounded-lg p-3 transition flex items-center justify-center gap-2 text-green-700 dark:text-green-300 font-semibold text-sm"
        >
          <span>💰</span>
          <span>Establecer Presupuesto del Día</span>
        </button>
      </div>
    `;
  }

  const remaining = budget - totalCost;
  const percentUsed = budget > 0 ? Math.min((totalCost / budget) * 100, 100) : 0;

  // Determinar estilo y badge según porcentaje
  let badgeClass, budgetIcon, barClass;

  if (percentUsed >= 100) {
    badgeClass = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-600';
    budgetIcon = '🚨';
    barClass = 'bg-red-600 dark:bg-red-500';
  } else if (percentUsed >= 80) {
    badgeClass = 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-600';
    budgetIcon = '⚠️';
    barClass = 'bg-orange-600 dark:bg-orange-500';
  } else if (percentUsed >= 60) {
    badgeClass = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600';
    budgetIcon = '💡';
    barClass = 'bg-yellow-600 dark:bg-yellow-500';
  } else {
    badgeClass = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600';
    budgetIcon = '💰';
    barClass = 'bg-green-600 dark:bg-green-500';
  }

  return `
    <div class="mt-4">
      <!-- Header colapsable -->
      <button
        type="button"
        onclick="document.getElementById('budgetDetails_${day.day}').classList.toggle('hidden')"
        class="w-full ${badgeClass} border rounded-lg p-3 flex items-center justify-between transition hover:opacity-80"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg">${budgetIcon}</span>
          <span class="font-semibold text-sm">Presupuesto</span>
          <span class="text-xs font-bold">¥${totalCost.toLocaleString()}</span>
        </div>
        <div class="flex items-center gap-2">
          ${budget > 0 ? `<span class="text-xs">${Math.round(percentUsed)}%</span>` : ''}
          <span class="text-xs">▼</span>
        </div>
      </button>

      <!-- Contenido expandido -->
      <div id="budgetDetails_${day.day}" class="hidden mt-2 bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
        ${budget > 0 ? `
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-300">Gastado:</span>
              <span class="font-bold text-gray-900 dark:text-white">¥${totalCost.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-300">Presupuesto:</span>
              <span class="font-bold text-gray-900 dark:text-white">¥${budget.toLocaleString()}</span>
            </div>
            <div class="flex justify-between font-bold">
              <span class="text-gray-600 dark:text-gray-300">Restante:</span>
              <span class="${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                ${remaining >= 0 ? '+' : ''}¥${remaining.toLocaleString()}
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
              <div class="${barClass} h-2 rounded-full transition-all" style="width:${percentUsed}%"></div>
            </div>
          </div>
        ` : `
          <p class="text-sm text-gray-600 dark:text-gray-300">Solo hay gastos registrados. ¿Quieres establecer un presupuesto?</p>
        `}
        <button
          type="button"
          onclick="editDayBudget(${day.day}, ${budget})"
          class="mt-3 w-full text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          ${budget > 0 ? 'Editar Presupuesto' : '+ Establecer Presupuesto'}
        </button>
      </div>
    </div>
  `;
}

/**
 * 🧠 Renderiza análisis inteligente COLAPSABLE
 */
function renderDayIntelligenceCollapsible(day) {
  if (!window.ItineraryIntelligence || !day || !day.activities || day.activities.length < 2) {
    return '';
  }

  const conflicts = window.ItineraryIntelligence.detectConflicts(day);

  if (conflicts.length === 0) {
    return `
      <div class="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-600 rounded-lg p-3 flex items-center gap-2">
        <span class="text-2xl">✅</span>
        <span class="text-sm font-semibold text-green-700 dark:text-green-300">Sin conflictos detectados</span>
      </div>
    `;
  }

  const highSeverity = conflicts.filter(c => c.severity === 'high');
  const mediumSeverity = conflicts.filter(c => c.severity === 'medium');
  const lowSeverity = conflicts.filter(c => c.severity === 'low');

  const badgeClass = highSeverity.length > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300' :
                     mediumSeverity.length > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300' :
                     'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300';

  return `
    <div class="mt-4">
      <!-- Header colapsable -->
      <button
        type="button"
        onclick="document.getElementById('intelligenceDetails_${day.day}').classList.toggle('hidden')"
        class="w-full ${badgeClass} border rounded-lg p-3 flex items-center justify-between transition hover:opacity-80"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg">🧠</span>
          <span class="font-semibold text-sm">Análisis Inteligente</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold">${conflicts.length} alerta${conflicts.length > 1 ? 's' : ''}</span>
          <span class="text-xs">▼</span>
        </div>
      </button>

      <!-- Contenido expandido -->
      <div id="intelligenceDetails_${day.day}" class="hidden mt-2 space-y-2">
        ${highSeverity.map(c => `
          <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-2 rounded">
            <div class="flex items-start gap-2">
              <span class="text-sm">${c.icon}</span>
              <div class="flex-1">
                <p class="text-xs font-bold text-red-900 dark:text-red-100">${c.title}</p>
                <p class="text-xs text-red-700 dark:text-red-200 mt-1">${c.message}</p>
              </div>
            </div>
          </div>
        `).join('')}

        ${mediumSeverity.map(c => `
          <div class="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-2 rounded">
            <div class="flex items-start gap-2">
              <span class="text-sm">${c.icon}</span>
              <div class="flex-1">
                <p class="text-xs font-bold text-orange-900 dark:text-orange-100">${c.title}</p>
                <p class="text-xs text-orange-700 dark:text-orange-200 mt-1">${c.message}</p>
              </div>
            </div>
          </div>
        `).join('')}

        ${lowSeverity.slice(0, 2).map(c => `
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-2 rounded">
            <div class="flex items-start gap-2">
              <span class="text-sm">${c.icon}</span>
              <div class="flex-1">
                <p class="text-xs font-bold text-yellow-900 dark:text-yellow-100">${c.title}</p>
                <p class="text-xs text-yellow-700 dark:text-yellow-200">${c.message}</p>
              </div>
            </div>
          </div>
        `).join('')}

        ${lowSeverity.length > 2 ? `
          <p class="text-xs text-gray-500 dark:text-gray-400 italic text-center">
            +${lowSeverity.length - 2} sugerencia(s) más
          </p>
        ` : ''}

        <!-- 🤖 Botón Auto-Resolver -->
        ${(highSeverity.length > 0 || mediumSeverity.length > 0) ? `
          <button
            type="button"
            onclick="autoResolveConflicts(${day.day})"
            class="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <span>🤖</span>
            <span>Arreglar Automáticamente</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * ⚖️ Renderiza indicador de carga COLAPSABLE
 */
function renderDayLoadIndicatorCollapsible(day) {
  // Esta función ya existe, voy a crear una versión colapsable
  return ''; // Placeholder por ahora
}

/**
 * 🔮 Renderiza predicción de experiencia COLAPSABLE
 */
function renderDayExperiencePredictionCollapsible(day) {
  // Esta función ya existe, voy a crear una versión colapsable
  return ''; // Placeholder por ahora
}

/**
 * Renderiza conflictos y alertas del día usando ItineraryIntelligence
 */
function renderDayIntelligence(day) {
  if (!window.ItineraryIntelligence || !day || !day.activities || day.activities.length < 2) {
    return '';
  }

  // Detectar conflictos
  const conflicts = window.ItineraryIntelligence.detectConflicts(day);

  if (conflicts.length === 0) {
    return '';
  }

  // Agrupar por severidad
  const highSeverity = conflicts.filter(c => c.severity === 'high');
  const mediumSeverity = conflicts.filter(c => c.severity === 'medium');
  const lowSeverity = conflicts.filter(c => c.severity === 'low');

  return `
    <div class="mt-4 space-y-2">
      <h3 class="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <span>🧠</span>
        <span>Análisis Inteligente</span>
      </h3>

      ${highSeverity.map(c => `
        <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
          <div class="flex items-start gap-2">
            <span class="text-lg">${c.icon}</span>
            <div class="flex-1">
              <p class="text-sm font-bold text-red-900 dark:text-red-100">${c.title}</p>
              <p class="text-xs text-red-700 dark:text-red-200 mt-1">${c.message}</p>
              <p class="text-xs text-red-600 dark:text-red-300 mt-1 italic">${c.suggestion}</p>
            </div>
          </div>
        </div>
      `).join('')}

      ${mediumSeverity.map(c => `
        <div class="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 rounded">
          <div class="flex items-start gap-2">
            <span class="text-lg">${c.icon}</span>
            <div class="flex-1">
              <p class="text-sm font-bold text-orange-900 dark:text-orange-100">${c.title}</p>
              <p class="text-xs text-orange-700 dark:text-orange-200 mt-1">${c.message}</p>
              <p class="text-xs text-orange-600 dark:text-orange-300 mt-1 italic">${c.suggestion}</p>
            </div>
          </div>
        </div>
      `).join('')}

      ${lowSeverity.slice(0, 2).map(c => `
        <div class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-2 rounded">
          <div class="flex items-start gap-2">
            <span>${c.icon}</span>
            <div class="flex-1">
              <p class="text-xs font-bold text-blue-900 dark:text-blue-100">${c.title}</p>
              <p class="text-xs text-blue-700 dark:text-blue-200">${c.message}</p>
            </div>
          </div>
        </div>
      `).join('')}

      ${lowSeverity.length > 2 ? `
        <p class="text-xs text-gray-500 dark:text-gray-400 italic text-center">
          +${lowSeverity.length - 2} sugerencia(s) más de optimización
        </p>
      ` : ''}
    </div>
  `;
}

/**
 * Calcula el costo total de las actividades del día
 */
function calculateDayTotalCost(day) {
  if (!day || !day.activities) return 0;
  return day.activities.reduce((total, activity) => {
    const cost = parseFloat(activity.cost) || 0;
    return total + cost;
  }, 0);
}

/**
 * Renderiza el widget de presupuesto del día
 */
function renderDayBudget(day) {
  const totalCost = calculateDayTotalCost(day);
  const budget = day.budget || 0;

  // Si no hay presupuesto ni gastos, no mostrar el widget
  if (budget === 0 && totalCost === 0) {
    return '';
  }

  const remaining = budget - totalCost;
  const percentUsed = budget > 0 ? Math.min((totalCost / budget) * 100, 100) : 0;

  // Determinar el estilo según el porcentaje usado
  let containerClass, titleClass, buttonClass, valueClass, barClass, messageClass;
  let budgetIcon = '💰';
  let budgetMessage = 'Dentro del presupuesto';

  if (percentUsed >= 100) {
    containerClass = 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-600';
    titleClass = 'text-red-900 dark:text-red-100';
    buttonClass = 'text-red-600 dark:text-red-300';
    valueClass = 'text-red-700 dark:text-red-200';
    barClass = 'bg-red-600 dark:bg-red-500';
    messageClass = 'text-red-700 dark:text-red-200';
    budgetIcon = '🚨';
    budgetMessage = '¡Presupuesto excedido!';
  } else if (percentUsed >= 80) {
    containerClass = 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-600';
    titleClass = 'text-orange-900 dark:text-orange-100';
    buttonClass = 'text-orange-600 dark:text-orange-300';
    valueClass = 'text-orange-700 dark:text-orange-200';
    barClass = 'bg-orange-600 dark:bg-orange-500';
    messageClass = 'text-orange-700 dark:text-orange-200';
    budgetIcon = '⚠️';
    budgetMessage = 'Cerca del límite';
  } else if (percentUsed >= 60) {
    containerClass = 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-600';
    titleClass = 'text-yellow-900 dark:text-yellow-100';
    buttonClass = 'text-yellow-600 dark:text-yellow-300';
    valueClass = 'text-yellow-700 dark:text-yellow-200';
    barClass = 'bg-yellow-600 dark:bg-yellow-500';
    messageClass = 'text-yellow-700 dark:text-yellow-200';
    budgetIcon = '💡';
    budgetMessage = 'Uso moderado';
  } else {
    containerClass = 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600';
    titleClass = 'text-green-900 dark:text-green-100';
    buttonClass = 'text-green-600 dark:text-green-300';
    valueClass = 'text-green-700 dark:text-green-200';
    barClass = 'bg-green-600 dark:bg-green-500';
    messageClass = 'text-green-700 dark:text-green-200';
  }

  const remainingClass = remaining >= 0
    ? 'text-green-700 dark:text-green-200'
    : 'text-red-700 dark:text-red-200';

  return `
    <div class="mt-4 ${containerClass} rounded-lg p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-bold ${titleClass} flex items-center gap-2">
          <span>${budgetIcon}</span>
          <span>Presupuesto del Día</span>
        </h3>
        <button
          type="button"
          onclick="editDayBudget(${day.day}, ${budget})"
          class="text-xs ${buttonClass} hover:underline font-semibold"
        >
          ${budget > 0 ? 'Editar' : '+ Establecer'}
        </button>
      </div>

      ${budget > 0 ? `
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-700 dark:text-gray-200">Gastado:</span>
            <span class="font-bold ${valueClass}">¥${totalCost.toLocaleString()}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-700 dark:text-gray-200">Presupuesto:</span>
            <span class="font-bold text-gray-900 dark:text-white">¥${budget.toLocaleString()}</span>
          </div>
          <div class="flex justify-between text-sm font-bold">
            <span class="text-gray-700 dark:text-gray-200">Restante:</span>
            <span class="${remainingClass}">
              ${remaining >= 0 ? '+' : ''}¥${remaining.toLocaleString()}
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
            <div class="${barClass} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-1"
                 style="width:${percentUsed}%">
              <span class="text-white text-[10px] font-bold">${Math.round(percentUsed)}%</span>
            </div>
          </div>
          <p class="text-xs ${messageClass} text-center mt-1">
            ${budgetMessage}
          </p>
        </div>
      ` : `
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Gasto actual: <strong>¥${totalCost.toLocaleString()}</strong>
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
          Establece un presupuesto para hacer seguimiento
        </p>
      `}
    </div>
  `;
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
    low: {
      icon: '😌', label: 'Ligero',
      borderClass: 'border-green-400 dark:border-green-500',
      textClass: 'text-green-900 dark:text-green-100'
    },
    medium: {
      icon: '👍', label: 'Moderado',
      borderClass: 'border-blue-400 dark:border-blue-500',
      textClass: 'text-blue-900 dark:text-blue-100'
    },
    high: {
      icon: '💪', label: 'Intenso',
      borderClass: 'border-orange-400 dark:border-orange-500',
      textClass: 'text-orange-900 dark:text-orange-100'
    },
    extreme: {
      icon: '🔥', label: 'Extremo',
      borderClass: 'border-red-400 dark:border-red-500',
      textClass: 'text-red-900 dark:text-red-100'
    }
  };

  const crowdConfig = {
    quiet: {
      icon: '🌿', label: 'Tranquilo',
      borderClass: 'border-green-400 dark:border-green-500',
      textClass: 'text-green-900 dark:text-green-100'
    },
    moderate: {
      icon: '👥', label: 'Moderado',
      borderClass: 'border-blue-400 dark:border-blue-500',
      textClass: 'text-blue-900 dark:text-blue-100'
    },
    crowded: {
      icon: '🏙️', label: 'Concurrido',
      borderClass: 'border-orange-400 dark:border-orange-500',
      textClass: 'text-orange-900 dark:text-orange-100'
    },
    very_crowded: {
      icon: '🚨', label: 'Muy Concurrido',
      borderClass: 'border-red-400 dark:border-red-500',
      textClass: 'text-red-900 dark:text-red-100'
    }
  };

  const paceConfig = {
    relaxed: {
      icon: '🧘', label: 'Relajado',
      borderClass: 'border-green-400 dark:border-green-500',
      textClass: 'text-green-900 dark:text-green-100'
    },
    comfortable: {
      icon: '😊', label: 'Cómodo',
      borderClass: 'border-blue-400 dark:border-blue-500',
      textClass: 'text-blue-900 dark:text-blue-100'
    },
    moderate: {
      icon: '⏰', label: 'Moderado',
      borderClass: 'border-yellow-400 dark:border-yellow-500',
      textClass: 'text-yellow-900 dark:text-yellow-100'
    },
    intense: {
      icon: '🏃', label: 'Intenso',
      borderClass: 'border-orange-400 dark:border-orange-500',
      textClass: 'text-orange-900 dark:text-orange-100'
    },
    aggressive: {
      icon: '🚀', label: 'Agresivo',
      borderClass: 'border-red-400 dark:border-red-500',
      textClass: 'text-red-900 dark:text-red-100'
    }
  };

  const budgetConfig = {
    free: {
      icon: '🆓', label: 'Gratis',
      borderClass: 'border-green-400 dark:border-green-500',
      textClass: 'text-green-900 dark:text-green-100'
    },
    budget: {
      icon: '💵', label: 'Económico',
      borderClass: 'border-green-400 dark:border-green-500',
      textClass: 'text-green-900 dark:text-green-100'
    },
    moderate: {
      icon: '💰', label: 'Moderado',
      borderClass: 'border-blue-400 dark:border-blue-500',
      textClass: 'text-blue-900 dark:text-blue-100'
    },
    high: {
      icon: '💳', label: 'Alto',
      borderClass: 'border-orange-400 dark:border-orange-500',
      textClass: 'text-orange-900 dark:text-orange-100'
    },
    premium: {
      icon: '💎', label: 'Premium',
      borderClass: 'border-purple-400 dark:border-purple-500',
      textClass: 'text-purple-900 dark:text-purple-100'
    }
  };

  const energy = energyConfig[prediction.energy.level] || energyConfig.medium;
  const crowds = crowdConfig[prediction.crowds.level] || crowdConfig.moderate;
  const pace = paceConfig[prediction.pace.pace] || paceConfig.moderate;
  const budget = budgetConfig[prediction.budget.category] || budgetConfig.moderate;

  return `
    <div class="mt-4 bg-indigo-50 dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-500 rounded-lg p-4">
      <h3 class="font-bold text-indigo-900 dark:text-white mb-3 flex items-center gap-2">
        <span>🔮</span>
        <span>Predicción de Experiencia</span>
      </h3>

      <div class="grid grid-cols-2 gap-2 mb-3">
        <div class="bg-white dark:bg-gray-700 rounded p-2 border-2 ${energy.borderClass}">
          <div class="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Energía</div>
          <div class="flex items-center gap-1">
            <span class="text-lg">${energy.icon}</span>
            <span class="text-sm font-bold ${energy.textClass}">${energy.label}</span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-700 rounded p-2 border-2 ${crowds.borderClass}">
          <div class="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Multitudes</div>
          <div class="flex items-center gap-1">
            <span class="text-lg">${crowds.icon}</span>
            <span class="text-sm font-bold ${crowds.textClass}">${crowds.label}</span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-700 rounded p-2 border-2 ${pace.borderClass}">
          <div class="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Ritmo</div>
          <div class="flex items-center gap-1">
            <span class="text-lg">${pace.icon}</span>
            <span class="text-sm font-bold ${pace.textClass}">${pace.label}</span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-700 rounded p-2 border-2 ${budget.borderClass}">
          <div class="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Presupuesto</div>
          <div class="flex items-center gap-1">
            <span class="text-lg">${budget.icon}</span>
            <span class="text-sm font-bold ${budget.textClass}">¥${prediction.budget.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-700 rounded p-3 border-2 border-indigo-300 dark:border-indigo-500">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-2xl">${prediction.recommendation.icon}</span>
          <span class="font-bold text-indigo-900 dark:text-indigo-100">${prediction.recommendation.rating.toUpperCase()}</span>
        </div>
        <p class="text-xs text-gray-700 dark:text-gray-100">${prediction.recommendation.message}</p>
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
      bgClass: 'bg-gray-200 dark:bg-gray-700',
      textClass: 'text-gray-900 dark:text-white',
      borderClass: 'border-gray-400 dark:border-gray-500'
    },
    low: {
      color: 'blue',
      icon: '🔵',
      label: 'Ligero',
      bgClass: 'bg-blue-100 dark:bg-blue-800',
      textClass: 'text-blue-900 dark:text-white',
      borderClass: 'border-blue-400 dark:border-blue-500'
    },
    light: {
      color: 'green',
      icon: '🟢',
      label: 'Moderado',
      bgClass: 'bg-green-100 dark:bg-green-800',
      textClass: 'text-green-900 dark:text-white',
      borderClass: 'border-green-400 dark:border-green-500'
    },
    balanced: {
      color: 'emerald',
      icon: '✅',
      label: 'Balanceado',
      bgClass: 'bg-emerald-100 dark:bg-emerald-800',
      textClass: 'text-emerald-900 dark:text-white',
      borderClass: 'border-emerald-400 dark:border-emerald-500'
    },
    heavy: {
      color: 'orange',
      icon: '🟠',
      label: 'Cargado',
      bgClass: 'bg-orange-100 dark:bg-orange-800',
      textClass: 'text-orange-900 dark:text-white',
      borderClass: 'border-orange-400 dark:border-orange-500'
    },
    overloaded: {
      color: 'red',
      icon: '🔴',
      label: 'Sobrecargado',
      bgClass: 'bg-red-100 dark:bg-red-800',
      textClass: 'text-red-900 dark:text-white',
      borderClass: 'border-red-400 dark:border-red-500'
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

// ⏰ Time utilities moved to time-utils.js for consistency across the app

function renderActivities(day){
  const container=document.getElementById('activitiesTimeline'); if(!container) return;
  const currentUserId = auth.currentUser?.uid;

  if (sortableInstance){ try{ sortableInstance.destroy(); }catch(_){} sortableInstance=null; }

  // Ordenar actividades por hora antes de renderizar
  const sortedActivities = (day.activities||[]).slice().sort((a, b) => {
    return SafeTimeUtils.parseTime(a.time) - SafeTimeUtils.parseTime(b.time);
  });

  // DEBUG: Log activities data
  console.log('🔍 Rendering activities for day', day.day, ':', sortedActivities.map(a => ({ id: a.id, title: a.title, name: a.name })));

  // Generar HTML de actividades con tiempos de traslado entre ellas
  const activitiesHTML = [];

  sortedActivities.forEach((act,i)=> {
    const votes = act.votes || {};
    const voteCount = Object.keys(votes).length;
    const userHasVoted = currentUserId && votes[currentUserId];

    // DEBUG: Log each activity title
    // 🛡️ Data normalization: Filter out "undefined" string and falsy values
    const normalizedTitle = (act.title && act.title !== 'undefined' && act.title !== 'null') ? act.title : null;
    const normalizedName = (act.name && act.name !== 'undefined' && act.name !== 'null') ? act.name : null;
    const activityTitle = normalizedTitle || normalizedName || 'Sin título';
    console.log(`📝 Activity ${act.id}: title="${act.title}", name="${act.name}", normalized="${normalizedTitle}", final="${activityTitle}"`);

    // Agregar la actividad
    activitiesHTML.push(`
    <div class="activity-card bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden fade-in transition-all hover:shadow-xl border-l-4 border-red-500 dark:border-red-400 ${checkedActivities[act.id]?'opacity-60':''}" style="animation-delay:${i*0.05}s">
      <div class="p-5 flex items-start gap-4">
        <div class="flex flex-col gap-2 items-center">
          <div class="drag-handle text-gray-400 dark:text-gray-400 text-xs cursor-grab active:cursor-grabbing" title="Arrastra para reordenar">⋮⋮</div>
          <input type="checkbox" data-id="${act.id}" ${checkedActivities[act.id]?'checked':''} class="activity-checkbox w-5 h-5 cursor-pointer accent-red-600 flex-shrink-0" />
        </div>
        <div class="bg-red-100 dark:bg-red-800 text-red-600 dark:text-white p-3 rounded-lg text-2xl flex-shrink-0">${act.icon||'📍'}</div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-200">${act.time && act.time !== 'NaN:NaN' && !act.time.includes('NaN') ? act.time : '09:00'}</span>
                ${act.cost>0?`<span class="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-white px-2 py-1 rounded font-semibold">¥${Number(act.cost).toLocaleString()}</span>`:''}
              </div>
              <h3 class="text-lg font-bold dark:text-white mb-1">${activityTitle}</h3>
              ${act.photographyInfo ? `
                <div class="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full text-xs font-semibold text-purple-700 dark:text-purple-300">
                  <span>📸</span>
                  <span>${act.photographyInfo.name}</span>
                </div>
              ` : ''}
            </div>
            <div class="flex gap-2 flex-shrink-0">
              ${act.alternatives && act.alternatives.length > 0 ? `
                <button
                  type="button"
                  onclick="ItineraryHandler.showAlternativesModal('${act.id}', '${day.day}')"
                  class="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800 transition text-purple-600 dark:text-purple-300"
                  title="Ver ${act.alternatives.length} alternativas"
                >
                  <span class="text-sm">🔄</span>
                  <span class="text-xs font-bold">${act.alternatives.length}</span>
                </button>
              ` : ''}
              <button
                type="button"
                data-action="vote"
                data-activity-id="${act.id}"
                data-day="${day.day}"
                class="activity-vote-btn p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition flex items-center gap-1 ${userHasVoted ? 'text-red-500' : 'text-gray-400 dark:text-gray-200'}"
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
          ${act.photographyInfo ? `
            <div class="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-2 border-purple-400 dark:border-purple-500">
              <p class="text-xs text-purple-700 dark:text-purple-300">📸 ${act.photographyInfo.description}</p>
            </div>
          ` : ''}
          ${act.station?`<p class="text-xs text-gray-500 dark:text-gray-200 mt-2">🚉 ${act.station}</p>`:''}
          ${act.train?`
            <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-800 rounded-lg border-l-2 border-blue-500 dark:border-blue-400">
              <p class="text-xs font-semibold text-blue-700 dark:text-blue-100 mb-1">🚄 ${act.train.line}</p>
              <p class="text-xs text-gray-600 dark:text-gray-100">${act.train.from} → ${act.train.to}</p>
              <p class="text-xs text-gray-500 dark:text-gray-200">⏱️ ${act.train.duration}</p>
            </div>`:''}
        </div>
      </div>
    </div>`);

    // Agregar tiempo de traslado a la siguiente actividad (si existe y tiene coordenadas)
    if (i < sortedActivities.length - 1 && window.ItineraryIntelligence) {
      const nextAct = sortedActivities[i + 1];
      const travelInfo = window.ItineraryIntelligence.estimateTravelTime(act, nextAct);

      if (travelInfo) {
        const warningClass = travelInfo.warning ? 'border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800';
        activitiesHTML.push(`
          <div class="travel-time-indicator mx-4 my-2 p-3 border-l-4 ${warningClass} rounded flex items-center justify-between text-sm">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${travelInfo.transportMode.split(' ')[0]}</span>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">${travelInfo.transportMode}</p>
                <p class="text-xs text-gray-600 dark:text-gray-300">${travelInfo.distance} km • ${travelInfo.travelMinutes} min • ¥${travelInfo.estimatedCost}</p>
                ${travelInfo.warning ? `<p class="text-xs text-orange-600 dark:text-orange-300 mt-1">⚠️ ${travelInfo.warning}</p>` : ''}
              </div>
            </div>
          </div>
        `);
      }
    }
  });

  container.innerHTML = activitiesHTML.join('');

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
        const mealSuggestionsBtn=e.target.closest('[id^="mealSuggestionsBtn_"]');
        const suggestionsBtn=e.target.closest('[id^="suggestionsBtn_"]');
        // ❌ BOTONES ELIMINADOS - Event handlers desactivados (2025-11-15)
        // const analyzeBalanceBtn=e.target.closest('#analyzeBalanceBtn');  // ELIMINADO
        // const masterOptimizeBtn=e.target.closest('#masterOptimizeBtn');  // ELIMINADO
        // const optimizeBtn=e.target.closest('#optimizeRouteBtn');          // ELIMINADO

        const editBtn=e.target.closest('.activity-edit-btn');
        const deleteBtn=e.target.closest('.activity-delete-btn');
        const voteBtn = e.target.closest('.activity-vote-btn');
        const dayBtn=e.target.closest('.day-btn');

        // ❌ Event handlers desactivados - botones eliminados
        // if(analyzeBalanceBtn){ showBalanceAnalysis(); }
        // else if(masterOptimizeBtn){ runMasterOptimization(); }
        // else if(optimizeBtn){ optimizeDayRoute(parseInt(optimizeBtn.id.split('_')[1])); }

        if(mealSuggestionsBtn){
          console.log('🍽️ Meal suggestions button clicked');
          const day=parseInt(mealSuggestionsBtn.id.split('_')[1]);
          if(window.MealInsertionSystem && window.MealInsertionSystem.showMealSuggestionsModal){
            window.MealInsertionSystem.showMealSuggestionsModal(day, currentItinerary);
          } else {
            console.error('❌ MealInsertionSystem no disponible');
            alert('El sistema de sugerencias de comidas no está disponible');
          }
        }
        else if(suggestionsBtn){
          console.log('💡 Suggestions button clicked');
          const day=parseInt(suggestionsBtn.id.split('_')[1]);
          if(window.SuggestionsEngine && window.SuggestionsEngine.showSuggestionsForDay){
            window.SuggestionsEngine.showSuggestionsForDay(day);
          } else {
            console.error('⚠️ SuggestionsEngine not loaded');
            if(window.Notifications){
              Notifications.error('Error: Motor de sugerencias no disponible', 3000);
            }
          }
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
        // 📍 Las coordenadas ahora se detectan automáticamente via IntelligentGeocoder
      }
    } else {
      title.textContent = 'Añadir Actividad';
    }

    // Mostrar modal
    console.log('🎭 Opening modal...');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    console.log('✅ Modal classes updated:', modal.classList.toString());

    // Inicializar autocomplete de actividades y ubicaciones
    setTimeout(() => {
      if (window.ActivityAutocomplete && window.ActivityAutocomplete.init) {
        window.ActivityAutocomplete.init();
      }
      if (window.LocationAutocomplete && window.LocationAutocomplete.init) {
        window.LocationAutocomplete.init();
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

    // Setup help button for coordinates (only once)
    const helpBtn = document.getElementById('helpLocationBtn');
    if (helpBtn && !helpBtn.dataset.handlerAttached) {
      helpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`📍 Tres formas de agregar ubicación:

✨ FORMA 1 - AUTOCOMPLETADO (Más Fácil):
1. Escribe el nombre del lugar en el campo "Título"
2. Aparecerán sugerencias de lugares populares
3. Haz clic en una sugerencia
4. ¡Las coordenadas se agregan automáticamente!

Ejemplos: Tokyo Tower, Fushimi Inari, Shibuya Crossing, etc.

📋 FORMA 2 - Google Maps (Manual):
1. Abre Google Maps (maps.google.com)
2. Busca el lugar
3. Haz clic derecho en el marcador
4. Copia las coordenadas que aparecen
5. Pégalas en los campos Latitud y Longitud

🔢 FORMA 3 - Coordenadas Directas:
Si ya tienes las coordenadas, simplemente pégalas:
• Latitud: 35.681236
• Longitud: 139.767125`);
      });
      helpBtn.dataset.handlerAttached = 'true';
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

    // 📍 Las coordenadas ahora se detectan SIEMPRE automáticamente
    let lat = NaN;
    let lng = NaN;

    // 🔍 AUTO-BÚSQUEDA: Intentar buscar coordenadas automáticamente
    if (true) { // Siempre buscar automáticamente
      // Primero intentar con IntelligentGeocoder (más potente)
      if (window.IntelligentGeocoder) {
        try {
          const dayData = currentItinerary?.days?.find(d => d.day === newDay);
          const context = {
            city: dayData?.cities?.[0]?.cityId || dayData?.city
          };

          const result = await window.IntelligentGeocoder.getCoordinates(title, context);
          if (result) {
            lat = result.lat;
            lng = result.lng;
            console.log(`✅ IntelligentGeocoder: "${title}" -> (${lat}, ${lng}) [${result.source}]`);
            Notifications.show(`📍 Ubicación detectada: ${result.name} (${result.source})`, 'success', 3000);
          }
        } catch (error) {
          console.error('❌ Error en IntelligentGeocoder:', error);
        }
      }

      // Fallback: LocationAutocomplete (búsqueda local)
      if ((isNaN(lat) || isNaN(lng)) && window.LocationAutocomplete) {
        const results = window.LocationAutocomplete.search(title);
        if (results && results.length > 0) {
          lat = results[0].lat;
          lng = results[0].lng;
          console.log(`✅ LocationAutocomplete: "${title}" -> (${lat}, ${lng})`);
          Notifications.show(`📍 Ubicación detectada: ${results[0].name}`, 'success', 3000);
        }
      }
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

    // 📍 Add coordinates if valid
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      activity.coordinates = { lat, lng };
    }

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
  },

  // 🏨 NUEVO: Sistema de Hotel Base
  async showHotelManagementModal(city) {
    console.log('🏨 Opening hotel management modal for:', city);

    if (!currentItinerary) {
      Notifications.show('No hay itinerario activo', 'error');
      return;
    }

    // Get current hotel for this city
    const currentHotel = window.HotelBaseSystem?.getHotelForCity(currentItinerary, city);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'hotelManagementModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">🏨 Hotel Base - ${city}</h2>
            <button onclick="this.closest('#hotelManagementModal').remove()" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
          </div>
          <p class="text-sm text-white/80 mt-2">El hotel base optimiza las sugerencias de actividades cercanas</p>
        </div>

        <!-- Current Hotel -->
        <div class="p-6 border-b dark:border-gray-700">
          ${currentHotel ? `
            <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                  <p class="text-sm font-semibold text-blue-700 dark:text-blue-200">Hotel Actual</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white mt-1">${currentHotel.name}</p>
                  ${currentHotel.address ? `<p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${currentHotel.address}</p>` : ''}
                  ${currentHotel.rating ? `<p class="text-sm text-yellow-600 dark:text-yellow-400 mt-2">⭐ ${currentHotel.rating}</p>` : ''}
                </div>
                <button
                  onclick="ItineraryHandler.removeHotelFromCity('${city}')"
                  class="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                >Eliminar</button>
              </div>
            </div>
          ` : `
            <p class="text-gray-500 dark:text-gray-400 text-center py-2">No hay hotel configurado para ${city}</p>
          `}
        </div>

        <!-- Search -->
        <div class="p-6 border-b dark:border-gray-700">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Buscar Hotel en ${city}
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              id="hotelSearchInput"
              placeholder="Ej: Hotel Shinjuku, APA Hotel Tokyo"
              class="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <button
              onclick="ItineraryHandler.searchHotelsForCity('${city}')"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >Buscar</button>
          </div>
        </div>

        <!-- Results -->
        <div class="flex-1 overflow-y-auto p-6">
          <div id="hotelSearchResults" class="space-y-3">
            <p class="text-gray-400 dark:text-gray-500 text-center py-8">Busca un hotel para ver resultados</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Auto-search on open if no hotel
    if (!currentHotel) {
      setTimeout(() => {
        this.searchHotelsForCity(city);
      }, 300);
    }
  },

  async searchHotelsForCity(city) {
    console.log('🔍 Searching hotels for:', city);

    if (!window.HotelBaseSystem) {
      Notifications.show('Sistema de hoteles no disponible', 'error');
      return;
    }

    const resultsContainer = document.getElementById('hotelSearchResults');
    if (!resultsContainer) return;

    // Show loading
    resultsContainer.innerHTML = `
      <div class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Buscando hoteles en ${city}...</p>
      </div>
    `;

    try {
      // Get search query
      const searchInput = document.getElementById('hotelSearchInput');
      const query = searchInput?.value || `hotel ${city}`;

      // Get city coordinates for proximity search
      const cityCoordinates = {
        'Tokyo': { lat: 35.6762, lng: 139.6503 },
        'Kyoto': { lat: 35.0116, lng: 135.7681 },
        'Osaka': { lat: 34.6937, lng: 135.5023 },
        'Nara': { lat: 34.6851, lng: 135.8048 },
        'Hiroshima': { lat: 34.3853, lng: 132.4553 },
        'Nikko': { lat: 36.7199, lng: 139.6982 }
      };

      const coordinates = cityCoordinates[city] || cityCoordinates['Tokyo'];

      // Search hotels
      const hotels = await window.HotelBaseSystem.searchHotels(query, coordinates);

      if (hotels.length === 0) {
        resultsContainer.innerHTML = `
          <div class="text-center py-8">
            <p class="text-gray-600 dark:text-gray-400">No se encontraron hoteles</p>
            <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Intenta con otro término de búsqueda</p>
          </div>
        `;
        return;
      }

      // Guardar hotels en una variable temporal para acceso seguro
      window._tempHotels = hotels;
      window._tempHotelCity = city;

      // Render results
      resultsContainer.innerHTML = hotels.map((hotel, index) => `
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600 hover:shadow-md transition cursor-pointer hotel-result-item" data-hotel-index="${index}">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="font-bold text-gray-900 dark:text-white">${hotel.displayName || hotel.name || 'Hotel sin nombre'}</p>
              ${hotel.formattedAddress ? `<p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${hotel.formattedAddress}</p>` : ''}
              <div class="flex items-center gap-4 mt-2">
                ${hotel.rating ? `<span class="text-sm text-yellow-600 dark:text-yellow-400">⭐ ${hotel.rating}</span>` : ''}
                ${hotel.userRatingCount ? `<span class="text-xs text-gray-500 dark:text-gray-400">(${hotel.userRatingCount} reseñas)</span>` : ''}
              </div>
            </div>
            <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
              Seleccionar
            </button>
          </div>
        </div>
      `).join('');

      // Agregar event listeners a los resultados
      resultsContainer.querySelectorAll('.hotel-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const index = parseInt(item.dataset.hotelIndex);
          const selectedHotel = window._tempHotels[index];
          const selectedCity = window._tempHotelCity;
          ItineraryHandler.selectHotelForCity(selectedHotel, selectedCity);
        });
      });

      console.log(`✅ Showing ${hotels.length} hotels`);

    } catch (error) {
      console.error('❌ Error searching hotels:', error);
      resultsContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-600 dark:text-red-400">Error al buscar hoteles</p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">${error.message}</p>
        </div>
      `;
    }
  },

  async selectHotelForCity(hotel, city) {
    console.log('🏨 Selecting hotel:', hotel.displayName || hotel.name, 'for', city);

    if (!currentItinerary) {
      console.error('❌ No hay itinerario activo');
      if (window.Notifications) {
        window.Notifications.show('No hay itinerario activo', 'error');
      }
      return;
    }

    if (!window.HotelBaseSystem) {
      console.error('❌ HotelBaseSystem no disponible');
      if (window.Notifications) {
        window.Notifications.show('Sistema de hoteles no disponible', 'error');
      }
      return;
    }

    try {
      console.log('📝 Agregando hotel al itinerario...');

      // Add hotel to itinerary (use currentDay for segment detection)
      window.HotelBaseSystem.addHotelToItinerary(currentItinerary, {
        id: hotel.id,
        name: hotel.displayName || hotel.name,
        address: hotel.formattedAddress || hotel.address,
        coordinates: hotel.location,
        rating: hotel.rating
      }, city, currentDay);

      console.log('💾 Guardando en Firebase...');

      // Save to Firebase
      await saveCurrentItineraryToFirebase();

      console.log('✅ Hotel guardado exitosamente');

      if (window.Notifications) {
        window.Notifications.show(`Hotel agregado en ${city}`, 'success');
      }

      // Close modal
      const modal = document.getElementById('hotelManagementModal');
      if (modal) modal.remove();

      // Re-render to show the new hotel
      render();

    } catch (error) {
      console.error('❌ Error selecting hotel:', error);
      console.error('Stack trace:', error.stack);

      if (window.Notifications) {
        window.Notifications.show(`Error: ${error.message}`, 'error');
      } else {
        alert(`Error al guardar hotel: ${error.message}`);
      }
    }
  },

  async removeHotelFromCity(city) {
    console.log('🗑️ Removing hotel from:', city);

    if (!currentItinerary) {
      Notifications.show('No hay itinerario activo', 'error');
      return;
    }

    const confirmed = await window.Dialogs.confirm({
      title: '🗑️ Eliminar Hotel',
      message: `¿Eliminar el hotel base de ${city}?`,
      okText: 'Sí, eliminar',
      isDestructive: true
    });

    if (!confirmed) return;

    try {
      // Remove hotel from itinerary
      if (currentItinerary.hotels && currentItinerary.hotels[city]) {
        delete currentItinerary.hotels[city];
      }

      // Save to Firebase
      await saveCurrentItineraryToFirebase();

      Notifications.show(`Hotel eliminado de ${city}`, 'success');

      // Close modal
      const modal = document.getElementById('hotelManagementModal');
      if (modal) modal.remove();

      // Re-render
      render();

    } catch (error) {
      console.error('❌ Error removing hotel:', error);
      Notifications.show('Error al eliminar hotel', 'error');
    }
  },

  // 🔄 NUEVO: Mostrar alternativas para una actividad
  showAlternativesModal(activityId, dayNumber) {
    console.log('🔄 Opening alternatives modal for activity:', activityId, 'on day:', dayNumber);

    if (!currentItinerary) {
      Notifications.show('No hay itinerario activo', 'error');
      return;
    }

    const day = currentItinerary.days.find(d => d.day === parseInt(dayNumber));
    if (!day) {
      Notifications.show('Día no encontrado', 'error');
      return;
    }

    const activity = day.activities.find(a => a.id === activityId);
    if (!activity || !activity.alternatives || activity.alternatives.length === 0) {
      Notifications.show('No hay alternativas disponibles', 'info');
      return;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'alternativesModal';
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">🔄 Smart Alternatives</h2>
              <p class="text-sm text-white/80 mt-1">Alternativas inteligentes para: ${activity.title}</p>
            </div>
            <button onclick="this.closest('#alternativesModal').remove()" class="text-white/80 hover:text-white text-3xl leading-none transition">&times;</button>
          </div>
        </div>

        <!-- Current Activity -->
        <div class="p-6 border-b dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20">
          <p class="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">ACTIVIDAD ACTUAL</p>
          <div class="flex items-center gap-3">
            <span class="text-3xl">${activity.icon || '📍'}</span>
            <div class="flex-1">
              <h3 class="font-bold text-lg dark:text-white">${activity.title}</h3>
              <div class="flex gap-2 mt-1 flex-wrap">
                ${activity.time ? `<span class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">${activity.time}</span>` : ''}
                ${activity.cost > 0 ? `<span class="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded">¥${activity.cost.toLocaleString()}</span>` : ''}
                ${activity.category ? `<span class="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">${activity.category}</span>` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Alternatives List -->
        <div class="flex-1 overflow-y-auto p-6">
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">${activity.alternatives.length} ALTERNATIVAS DISPONIBLES</p>
          <div class="space-y-3">
            ${activity.alternatives.map((alt, idx) => `
              <div class="border-2 dark:border-gray-600 rounded-xl p-4 hover:border-purple-400 dark:hover:border-purple-500 transition cursor-pointer group"
                   onclick="ItineraryHandler.swapActivityWithAlternative('${activityId}', ${dayNumber}, ${idx})">
                <div class="flex items-start gap-3">
                  <div class="text-3xl group-hover:scale-110 transition">📍</div>
                  <div class="flex-1">
                    <h4 class="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">${alt.name}</h4>
                    <p class="text-xs text-purple-600 dark:text-purple-400 mt-1">${alt.reason}</p>
                    <div class="flex gap-2 mt-2 flex-wrap">
                      ${alt.category ? `<span class="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-1 rounded">${alt.category}</span>` : ''}
                      ${alt.cost ? `<span class="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 px-2 py-1 rounded">¥${alt.cost.toLocaleString()}</span>` : ''}
                    </div>
                  </div>
                  <button class="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-lg font-semibold text-sm group-hover:bg-purple-500 group-hover:text-white dark:group-hover:bg-purple-600 transition">
                    Cambiar →
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 Las alternativas se generan basándose en categoría, ubicación e intereses similares
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  // 🔄 NUEVO: Swap activity with alternative
  async swapActivityWithAlternative(activityId, dayNumber, alternativeIndex) {
    console.log('🔄 Swapping activity:', activityId, 'with alternative:', alternativeIndex);

    if (!currentItinerary) return;

    const day = currentItinerary.days.find(d => d.day === parseInt(dayNumber));
    if (!day) return;

    const activityIndex = day.activities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) return;

    const activity = day.activities[activityIndex];
    const alternative = activity.alternatives[alternativeIndex];

    if (!alternative) return;

    try {
      // Track learning: user swapped this activity
      if (window.SmartItineraryGenerator) {
        window.SmartItineraryGenerator.saveUserEdit('removed', activity);
        window.SmartItineraryGenerator.saveUserEdit('added', alternative);
      }

      // Create new activity object from alternative
      const newActivity = {
        ...activity,
        title: alternative.name,
        category: alternative.category || activity.category,
        cost: alternative.cost || activity.cost,
        coordinates: alternative.coordinates || activity.coordinates,
        desc: `Alternativa sugerida: ${alternative.reason}`,
        source: 'smart-alternative'
      };

      // Replace activity
      day.activities[activityIndex] = newActivity;

      // Save to Firebase
      await saveCurrentItineraryToFirebase();

      Notifications.show('✅ Actividad cambiada exitosamente', 'success');

      // Close modal
      const modal = document.getElementById('alternativesModal');
      if (modal) modal.remove();

      // Re-render
      render();

    } catch (error) {
      console.error('❌ Error swapping activity:', error);
      Notifications.show('Error al cambiar actividad', 'error');
    }
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

// ====================================================================================
// FUNCIÓN PARA EDITAR PRESUPUESTO DEL DÍA
// ====================================================================================

async function editDayBudget(dayNumber, currentBudget) {
  if (!currentItinerary) return;

  const day = currentItinerary.days.find(d => d.day === dayNumber);
  if (!day) return;

  // Mostrar prompt para ingresar el nuevo presupuesto
  const newBudgetStr = prompt(
    `Presupuesto para el Día ${dayNumber}:\n\nIngresa el presupuesto en yenes (¥)`,
    currentBudget > 0 ? currentBudget : ''
  );

  // Si el usuario cancela, no hacer nada
  if (newBudgetStr === null) return;

  // Parsear el nuevo presupuesto
  const newBudget = parseFloat(newBudgetStr.replace(/[^\d.]/g, '')) || 0;

  // Actualizar el presupuesto del día
  day.budget = newBudget;

  // Guardar en Firebase
  await saveCurrentItineraryToFirebase();

  // Notificar al usuario
  if (window.Notifications) {
    if (newBudget > 0) {
      window.Notifications.show(`Presupuesto del día ${dayNumber} actualizado a ¥${newBudget.toLocaleString()}`, 'success');
    } else {
      window.Notifications.show(`Presupuesto del día ${dayNumber} eliminado`, 'info');
    }
  }

  // Re-renderizar
  render();
}

/**
 * 🧠 Mostrar Modal de Análisis Inteligente del Viaje Completo
 */
function showTripIntelligenceModal() {
  if (!currentItinerary || !window.ItineraryIntelligence) {
    window.Notifications?.show('No hay itinerario cargado', 'error');
    return;
  }

  // Analizar presupuesto total del viaje
  const budgetAnalysis = window.ItineraryIntelligence.analyzeTripBudget(currentItinerary);

  // Analizar días sobrecargados
  const overloadedDays = window.ItineraryIntelligence.analyzeOverloadedDays(currentItinerary);

  // Construir contenido del modal
  let modalContent = `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 text-white p-6 rounded-t-xl z-10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-4xl">🧠</span>
            <div>
              <h2 class="text-2xl font-bold">Análisis Inteligente del Viaje</h2>
              <p class="text-purple-100 text-sm mt-1">Insights automáticos sobre tu itinerario</p>
            </div>
          </div>
          <button onclick="closeIntelligenceModal()" class="text-white hover:text-purple-200 transition text-3xl leading-none">
            ×
          </button>
        </div>
      </div>

      <div class="p-6 space-y-6">
  `;

  // ============================================================================
  // SECCIÓN 1: ANÁLISIS DE PRESUPUESTO
  // ============================================================================
  if (budgetAnalysis && budgetAnalysis.totalBudget > 0) {
    const percentUsed = (budgetAnalysis.totalSpent / budgetAnalysis.totalBudget) * 100;
    const isOverBudget = budgetAnalysis.totalSpent > budgetAnalysis.totalBudget;

    modalContent += `
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-5 border border-green-200 dark:border-green-700">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
          <span>💰</span>
          <span>Análisis de Presupuesto</span>
        </h3>

        <!-- Resumen General -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Presupuesto Total</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">¥${budgetAnalysis.totalBudget.toLocaleString()}</p>
          </div>
          <div class="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Gastado</p>
            <p class="text-2xl font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} mt-1">
              ¥${budgetAnalysis.totalSpent.toLocaleString()}
            </p>
          </div>
          <div class="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Restante</p>
            <p class="text-2xl font-bold ${budgetAnalysis.totalRemaining >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'} mt-1">
              ¥${budgetAnalysis.totalRemaining.toLocaleString()}
            </p>
          </div>
        </div>

        <!-- Barra de progreso -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Uso del presupuesto</span>
            <span class="text-sm font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">
              ${percentUsed.toFixed(1)}%
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden">
            <div class="${isOverBudget ? 'bg-red-500' : percentUsed > 80 ? 'bg-orange-500' : 'bg-green-500'} h-full rounded-full transition-all duration-500"
                 style="width: ${Math.min(percentUsed, 100)}%"></div>
          </div>
        </div>

        <!-- Estadísticas adicionales -->
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <p class="text-gray-600 dark:text-gray-300">Promedio por día</p>
            <p class="font-bold text-gray-800 dark:text-white">¥${budgetAnalysis.avgCostPerDay.toLocaleString()}</p>
          </div>
          ${budgetAnalysis.daysOverBudget > 0 ? `
            <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded">
              <p class="text-gray-600 dark:text-gray-300">Días sobre presupuesto</p>
              <p class="font-bold text-red-600 dark:text-red-400">${budgetAnalysis.daysOverBudget} día(s)</p>
            </div>
          ` : `
            <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <p class="text-gray-600 dark:text-gray-300">Días sobre presupuesto</p>
              <p class="font-bold text-green-600 dark:text-green-400">0 días ✓</p>
            </div>
          `}
        </div>

        <!-- Warnings -->
        ${budgetAnalysis.warnings && budgetAnalysis.warnings.length > 0 ? `
          <div class="mt-4 space-y-2">
            ${budgetAnalysis.warnings.map(w => `
              <div class="bg-${w.severity === 'high' ? 'red' : w.severity === 'medium' ? 'orange' : 'yellow'}-100 dark:bg-${w.severity === 'high' ? 'red' : w.severity === 'medium' ? 'orange' : 'yellow'}-900/20 border-l-4 border-${w.severity === 'high' ? 'red' : w.severity === 'medium' ? 'orange' : 'yellow'}-500 p-3 rounded">
                <div class="flex items-start gap-2">
                  <span>${w.icon}</span>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-gray-800 dark:text-white">${w.message}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">${w.suggestion}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Día más caro / más barato -->
        ${budgetAnalysis.mostExpensiveDay ? `
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-200 dark:border-purple-700">
              <p class="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <span>💸</span>
                <span>Día más caro</span>
              </p>
              <p class="font-bold text-gray-800 dark:text-white">Día ${budgetAnalysis.mostExpensiveDay.day}</p>
              <p class="text-xs text-purple-600 dark:text-purple-400">¥${budgetAnalysis.mostExpensiveDay.totalCost.toLocaleString()}</p>
            </div>
            ${budgetAnalysis.cheapestDay && budgetAnalysis.cheapestDay.totalCost > 0 ? `
              <div class="bg-teal-50 dark:bg-teal-900/20 p-3 rounded border border-teal-200 dark:border-teal-700">
                <p class="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <span>💵</span>
                  <span>Día más económico</span>
                </p>
                <p class="font-bold text-gray-800 dark:text-white">Día ${budgetAnalysis.cheapestDay.day}</p>
                <p class="text-xs text-teal-600 dark:text-teal-400">¥${budgetAnalysis.cheapestDay.totalCost.toLocaleString()}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  // ============================================================================
  // SECCIÓN 2: DÍAS SOBRECARGADOS
  // ============================================================================
  if (overloadedDays && overloadedDays.length > 0) {
    modalContent += `
      <div class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-5 border border-orange-200 dark:border-orange-700">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
          <span>😓</span>
          <span>Días Sobrecargados Detectados</span>
        </h3>

        <div class="space-y-3">
          ${overloadedDays.map(day => `
            <div class="bg-white dark:bg-gray-700 rounded-lg p-4 border-l-4 ${
              day.severity === 'high' ? 'border-red-500' :
              day.severity === 'medium' ? 'border-orange-500' :
              'border-yellow-500'
            }">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-2">
                  <span class="text-2xl">${day.icon}</span>
                  <div class="flex-1">
                    <p class="font-bold text-gray-800 dark:text-white">Día ${day.day}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${day.message}</p>
                    <div class="mt-2 flex gap-3 text-xs">
                      <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        ${day.activityCount} actividades
                      </span>
                      <span class="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                        ${day.totalHours}h total
                      </span>
                      <span class="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                        ${day.fatiguePoints} pts fatiga
                      </span>
                    </div>
                    ${day.suggestions && day.suggestions.length > 0 ? `
                      <div class="mt-3 space-y-1">
                        <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">💡 Sugerencias:</p>
                        ${day.suggestions.map(s => `
                          <p class="text-xs text-gray-600 dark:text-gray-400 ml-4">• ${s}</p>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    modalContent += `
      <div class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-5 border border-green-200 dark:border-green-700">
        <div class="flex items-center gap-3">
          <span class="text-4xl">✅</span>
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Balance Excelente</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">Todos tus días tienen una carga de actividades balanceada</p>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // SECCIÓN 3: RESUMEN GENERAL
  // ============================================================================
  const totalActivities = currentItinerary.days.reduce((sum, d) => sum + (d.activities?.length || 0), 0);
  const avgActivitiesPerDay = (totalActivities / currentItinerary.days.length).toFixed(1);

  modalContent += `
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-700">
      <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
        <span>📊</span>
        <span>Estadísticas del Viaje</span>
      </h3>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div class="bg-white dark:bg-gray-700 rounded-lg p-3">
          <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">${currentItinerary.days.length}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">Días totales</p>
        </div>
        <div class="bg-white dark:bg-gray-700 rounded-lg p-3">
          <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">${totalActivities}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">Actividades</p>
        </div>
        <div class="bg-white dark:bg-gray-700 rounded-lg p-3">
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">${avgActivitiesPerDay}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">Promedio/día</p>
        </div>
        <div class="bg-white dark:bg-gray-700 rounded-lg p-3">
          <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">${overloadedDays.length}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">Días intensos</p>
        </div>
      </div>
    </div>
  `;

  // Cerrar modal
  modalContent += `
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-gray-50 dark:bg-gray-700 p-4 rounded-b-xl border-t border-gray-200 dark:border-gray-600 flex justify-end">
        <button onclick="closeIntelligenceModal()" class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold">
          Cerrar
        </button>
      </div>
    </div>
  `;

  // Crear y mostrar el modal
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'intelligence-modal';
  modalOverlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modalOverlay.innerHTML = modalContent;

  // Cerrar al hacer click en el overlay
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeIntelligenceModal();
    }
  });

  document.body.appendChild(modalOverlay);

  console.log('🧠 Modal de Análisis Inteligente abierto');
}

/**
 * Cerrar modal de inteligencia
 */
function closeIntelligenceModal() {
  const modal = document.getElementById('intelligence-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * 🤖 Auto-Resolver de Conflictos
 */
async function autoResolveConflicts(dayNumber) {
  if (!currentItinerary || !window.ItineraryIntelligenceTier2) {
    window.Notifications?.show('Sistema no disponible', 'error');
    return;
  }

  const day = currentItinerary.days.find(d => d.day === dayNumber);
  if (!day) {
    window.Notifications?.show('Día no encontrado', 'error');
    return;
  }

  // Mostrar loading
  window.Notifications?.show('🤖 Analizando y resolviendo conflictos...', 'info');

  try {
    const result = await window.ItineraryIntelligenceTier2.autoResolveConflicts(
      day,
      saveCurrentItineraryToFirebase
    );

    if (result.success) {
      window.Notifications?.show(result.message, 'success');

      if (result.warnings && result.warnings.length > 0) {
        setTimeout(() => {
          window.Notifications?.show(`⚠️ ${result.warnings.join(', ')}`, 'warning');
        }, 2000);
      }

      // Re-renderizar para mostrar cambios
      render();
    } else {
      window.Notifications?.show(result.message, 'info');
    }
  } catch (error) {
    console.error('Error auto-resolviendo conflictos:', error);
    window.Notifications?.show('Error al resolver conflictos', 'error');
  }
}

/**
 * 🍽️ Mostrar sugerencias de comidas automáticas
 */
async function showAutoMealSuggestions(dayNumber) {
  if (!currentItinerary || !window.ItineraryIntelligenceTier2) {
    window.Notifications?.show('Sistema no disponible', 'error');
    return;
  }

  const day = currentItinerary.days.find(d => d.day === dayNumber);
  if (!day) {
    window.Notifications?.show('Día no encontrado', 'error');
    return;
  }

  // Mostrar loading
  window.Notifications?.show('🍽️ Buscando mejores slots para comidas...', 'info');

  try {
    const result = await window.ItineraryIntelligenceTier2.autoInsertMeals(
      day,
      window.GooglePlacesAPI
    );

    if (!result.success || result.suggestions.length === 0) {
      window.Notifications?.show(result.message, 'info');
      return;
    }

    // Crear modal con sugerencias
    showMealSuggestionsModal(day, result.suggestions);

  } catch (error) {
    console.error('Error obteniendo sugerencias de comidas:', error);
    window.Notifications?.show('Error al buscar comidas', 'error');
  }
}

/**
 * 🕳️ Mostrar sugerencias para llenar huecos
 */
async function showGapFillerSuggestions(dayNumber) {
  if (!currentItinerary || !window.ItineraryIntelligenceTier2) {
    window.Notifications?.show('Sistema no disponible', 'error');
    return;
  }

  const day = currentItinerary.days.find(d => d.day === dayNumber);
  if (!day) {
    window.Notifications?.show('Día no encontrado', 'error');
    return;
  }

  // Mostrar loading
  window.Notifications?.show('🕳️ Analizando huecos en el día...', 'info');

  try {
    const result = await window.ItineraryIntelligenceTier2.findSmartGapFillers(
      day,
      window.GooglePlacesAPI,
      { minGapMinutes: 60, maxGapMinutes: 360, includeMeals: true }
    );

    if (!result.success || result.gaps.length === 0) {
      window.Notifications?.show(result.message, 'info');
      return;
    }

    // Crear modal con gap fillers
    showGapFillerModal(day, result.gaps);

  } catch (error) {
    console.error('Error analizando huecos:', error);
    window.Notifications?.show('Error al analizar huecos', 'error');
  }
}

/**
 * Modal para mostrar sugerencias de comidas
 */
function showMealSuggestionsModal(day, suggestions) {
  const modalContent = `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-xl z-10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-4xl">🍽️</span>
            <div>
              <h2 class="text-2xl font-bold">Sugerencias de Comidas</h2>
              <p class="text-orange-100 text-sm mt-1">Día ${day.day} - ${suggestions.length} sugerencia(s)</p>
            </div>
          </div>
          <button onclick="closeMealSuggestionsModal()" class="text-white hover:text-orange-200 transition text-3xl leading-none">×</button>
        </div>
      </div>

      <div class="p-6 space-y-4">
        ${suggestions.map((sug, idx) => `
          <div class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-bold text-lg text-gray-800 dark:text-white">${sug.label}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">Hora sugerida: ${sug.suggestedTime}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${sug.reason}</p>
              </div>
            </div>

            ${sug.nearbyPlace ? `
              <div class="bg-white dark:bg-gray-700 rounded-lg p-3 mt-3 border border-orange-300 dark:border-orange-600">
                <p class="text-sm font-bold text-gray-800 dark:text-white">${sug.nearbyPlace.name}</p>
                <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">${sug.nearbyPlace.address || ''}</p>
                ${sug.nearbyPlace.rating ? `<p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">⭐ ${sug.nearbyPlace.rating} (${sug.nearbyPlace.userRatingsTotal || 0} reseñas)</p>` : ''}
              </div>
            ` : ''}

            <button
              onclick="insertMealSuggestion(${day.day}, ${idx}, ${JSON.stringify(sug).replace(/"/g, '&quot;')})"
              class="w-full mt-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              ✅ Insertar ${sug.label}
            </button>
          </div>
        `).join('')}
      </div>

      <div class="sticky bottom-0 bg-gray-50 dark:bg-gray-700 p-4 rounded-b-xl border-t border-gray-200 dark:border-gray-600 flex justify-end">
        <button onclick="closeMealSuggestionsModal()" class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition font-semibold">
          Cerrar
        </button>
      </div>
    </div>
  `;

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'meal-suggestions-modal';
  modalOverlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modalOverlay.innerHTML = modalContent;

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeMealSuggestionsModal();
  });

  document.body.appendChild(modalOverlay);
}

function closeMealSuggestionsModal() {
  const modal = document.getElementById('meal-suggestions-modal');
  if (modal) modal.remove();
}

/**
 * Insertar una sugerencia de comida seleccionada
 */
async function insertMealSuggestion(dayNumber, suggestionIndex, suggestion) {
  if (!currentItinerary) return;

  const day = currentItinerary.days.find(d => d.day === dayNumber);
  if (!day) return;

  // Crear actividad de comida
  const mealActivity = {
    id: `meal-${Date.now()}`,
    title: suggestion.nearbyPlace ? suggestion.nearbyPlace.name : `${suggestion.label} (a definir)`,
    time: suggestion.suggestedTime,
    duration: suggestion.mealType === 'breakfast' ? 45 : suggestion.mealType === 'lunch' ? 60 : 90,
    category: 'meal',
    isMeal: true,
    desc: suggestion.nearbyPlace ? suggestion.nearbyPlace.address || '' : '',
    cost: suggestion.nearbyPlace ? estimateMealCostFromPlace(suggestion.mealType, suggestion.nearbyPlace.priceLevel) : 0,
    coordinates: suggestion.nearbyPlace?.coordinates || null
  };

  day.activities.push(mealActivity);

  await saveCurrentItineraryToFirebase();
  window.Notifications?.show(`✅ ${suggestion.label} agregado al día`, 'success');

  closeMealSuggestionsModal();
  render();
}

function estimateMealCostFromPlace(mealType, priceLevel) {
  const basePrices = {
    breakfast: 1000,
    lunch: 1200,
    dinner: 2500
  };
  const multipliers = {
    'PRICE_LEVEL_INEXPENSIVE': 0.7,
    'PRICE_LEVEL_MODERATE': 1.0,
    'PRICE_LEVEL_EXPENSIVE': 1.5,
    'PRICE_LEVEL_VERY_EXPENSIVE': 2.5
  };
  return Math.round((basePrices[mealType] || 1000) * (multipliers[priceLevel] || 1.0));
}

/**
 * Modal para mostrar gap fillers
 */
function showGapFillerModal(day, gaps) {
  const modalContent = `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6 rounded-t-xl z-10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-4xl">🕳️</span>
            <div>
              <h2 class="text-2xl font-bold">Huecos Detectados</h2>
              <p class="text-cyan-100 text-sm mt-1">Día ${day.day} - ${gaps.length} hueco(s) para aprovechar</p>
            </div>
          </div>
          <button onclick="closeGapFillerModal()" class="text-white hover:text-cyan-200 transition text-3xl leading-none">×</button>
        </div>
      </div>

      <div class="p-6 space-y-4">
        ${gaps.map((gap, gapIdx) => `
          <div class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-700">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-bold text-lg text-gray-800 dark:text-white">
                  ${gap.type === 'short' ? '⏱️ Hueco Corto' : '🕐 Hueco Largo'} (${Math.round(gap.durationMinutes / 60 * 10) / 10}h)
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">${gap.startTime} - ${gap.endTime}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Entre "${gap.afterActivity}" y "${gap.beforeActivity}"
                </p>
              </div>
            </div>

            ${gap.suggestions && gap.suggestions.length > 0 ? `
              <div class="space-y-2 mt-3">
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">💡 Sugerencias:</p>
                ${gap.suggestions.map((sug, sugIdx) => `
                  <div class="bg-white dark:bg-gray-700 rounded-lg p-3 border border-cyan-300 dark:border-cyan-600">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-sm font-bold text-gray-800 dark:text-white">${sug.name}</p>
                        <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">${sug.category}</p>
                        ${sug.rating ? `<p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">⭐ ${sug.rating}</p>` : ''}
                      </div>
                      <button
                        onclick="insertGapFiller(${day.day}, ${gapIdx}, ${sugIdx}, ${JSON.stringify(sug).replace(/"/g, '&quot;')}, '${gap.startTime}', ${gap.durationMinutes})"
                        class="ml-2 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded text-xs font-semibold"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <p class="text-sm text-gray-600 dark:text-gray-400 italic mt-3">
                No encontré sugerencias cercanas para este hueco
              </p>
            `}
          </div>
        `).join('')}
      </div>

      <div class="sticky bottom-0 bg-gray-50 dark:bg-gray-700 p-4 rounded-b-xl border-t border-gray-200 dark:border-gray-600 flex justify-end">
        <button onclick="closeGapFillerModal()" class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition font-semibold">
          Cerrar
        </button>
      </div>
    </div>
  `;

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'gap-filler-modal';
  modalOverlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modalOverlay.innerHTML = modalContent;

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeGapFillerModal();
  });

  document.body.appendChild(modalOverlay);
}

function closeGapFillerModal() {
  const modal = document.getElementById('gap-filler-modal');
  if (modal) modal.remove();
}

/**
 * Insertar una actividad gap filler seleccionada
 */
async function insertGapFiller(dayNumber, gapIndex, suggestionIndex, suggestion, startTime, durationMinutes) {
  if (!currentItinerary) return;

  const day = currentItinerary.days.find(d => d.day === dayNumber);
  if (!day) return;

  // Crear actividad
  const activity = {
    id: `gap-${Date.now()}`,
    title: suggestion.name,
    time: startTime,
    duration: suggestion.estimatedDuration || Math.min(durationMinutes - 30, 120),
    category: suggestion.category || 'other',
    desc: suggestion.address || '',
    cost: 0,
    coordinates: suggestion.coordinates || null
  };

  day.activities.push(activity);

  await saveCurrentItineraryToFirebase();
  window.Notifications?.show(`✅ "${suggestion.name}" agregado al día`, 'success');

  closeGapFillerModal();
  render();
}

window.ItineraryHandler = ItineraryHandler;

// Exponer funciones de guardado y render
window.saveCurrentItineraryToFirebase = saveCurrentItineraryToFirebase;
window.renderItinerary = render;
window.showBalanceAnalysis = showBalanceAnalysis;
window.editDayBudget = editDayBudget;
window.showTripIntelligenceModal = showTripIntelligenceModal;
window.closeIntelligenceModal = closeIntelligenceModal;

// TIER 2 Functions
window.autoResolveConflicts = autoResolveConflicts;
window.showAutoMealSuggestions = showAutoMealSuggestions;
window.showGapFillerSuggestions = showGapFillerSuggestions;
window.closeMealSuggestionsModal = closeMealSuggestionsModal;
window.insertMealSuggestion = insertMealSuggestion;
window.closeGapFillerModal = closeGapFillerModal;
window.insertGapFiller = insertGapFiller;

// Exponer currentItinerary a través de ItineraryHandler para evitar conflictos
Object.defineProperty(ItineraryHandler, 'currentItinerary', {
  get: () => currentItinerary,
  enumerable: true
});

