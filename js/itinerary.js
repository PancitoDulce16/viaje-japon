
// js/itinerary.js — VERSIÓN MEJORADA con Creación Dinámica + AI Insights Button
import { db, auth } from './firebase-config.js';
import { Notifications } from './notifications.js';
import { doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
// Local cities fallback provider
import { searchCities } from '../data/japan-cities.js';
import { APP_CONFIG } from './config.js';

let checkedActivities = {};
let currentDay = 1;
let unsubscribe = null;
let currentItinerary = null;
let sortableInstance = null; // 🔥 Para drag & drop
let isListenerAttached = false;
let saveDebounceTimer = null;

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
  const tripId = getCurrentTripId();
  if (!tripId || !currentItinerary) throw new Error('No trip or itinerary');
  const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
  await setDoc(itineraryRef, currentItinerary);
  return true;
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
  const tripId=getCurrentTripId();
  if(!tripId){ console.log('⚠️ No hay trip seleccionado, cargando plantilla por defecto.'); try{ const r=await fetch('/data/attractions.json'); const data=await r.json(); currentItinerary={ days: data.suggestedItinerary }; return currentItinerary; }catch(e){ console.error('❌ Error fallback:',e); return null; } }

  // Check if user is authenticated before accessing Firestore
  if(!auth.currentUser){
    console.log('⚠️ Usuario no autenticado, cargando plantilla por defecto.');
    try{ const r=await fetch('/data/attractions.json'); const data=await r.json(); currentItinerary={ days: data.suggestedItinerary }; return currentItinerary; }
    catch(e){ console.error('❌ Error fallback:',e); return null; }
  }

  try{
    const itineraryRef=doc(db, `trips/${tripId}/data`, 'itinerary');
    const snap=await getDoc(itineraryRef);
    if(snap.exists()) { currentItinerary=snap.data(); console.log('✅ Itinerario cargado desde Firebase'); return currentItinerary; }
    else { console.log('⚠️ No existe itinerario, fallback.'); const r=await fetch('/data/attractions.json'); const data=await r.json(); currentItinerary={ days: data.suggestedItinerary }; return currentItinerary; }
  }catch(error){ console.error('❌ Error cargando itinerario:',error); try{ const r=await fetch('/data/attractions.json'); const data=await r.json(); currentItinerary={ days: data.suggestedItinerary }; return currentItinerary; }catch(e){ console.error('❌ Error fallback:', e); return null; } }
}

async function initRealtimeSync(){
  if(unsubscribe){ unsubscribe(); }
  if(!auth.currentUser){ checkedActivities = JSON.parse(localStorage.getItem('checkedActivities')||'{}'); render(); return; }
  const tripId=getCurrentTripId(); if(!tripId){ console.log('⚠️ No hay trip seleccionado'); renderEmptyState(); return; }
  console.log('🤝 Modo colaborativo activado para trip:', tripId);
  const checklistRef=doc(db, `trips/${tripId}/activities`, 'checklist');
  unsubscribe=onSnapshot(checklistRef, (docSnap)=>{
    if(docSnap.exists()) checkedActivities=docSnap.data().checked||{}; else checkedActivities={};
    localStorage.setItem('checkedActivities', JSON.stringify(checkedActivities));
    render(); console.log('✅ Checklist sincronizado:', Object.keys(checkedActivities).length, 'actividades');
  }, (error)=>{ console.error('❌ Error en sync:',error); checkedActivities=JSON.parse(localStorage.getItem('checkedActivities')||'{}'); render(); });
}

function selectDay(dayNumber){ currentDay=dayNumber; render(); }
async function toggleActivity(activityId){
  checkedActivities[activityId] = !checkedActivities[activityId];
  try{
    if(!auth.currentUser){ localStorage.setItem('checkedActivities', JSON.stringify(checkedActivities)); render(); return; }
    const tripId=getCurrentTripId(); if(!tripId){ alert('⚠️ Debes seleccionar un viaje primero'); return; }
    const checklistRef=doc(db, `trips/${tripId}/activities`, 'checklist');
    await setDoc(checklistRef,{ checked: checkedActivities, lastUpdated: new Date().toISOString(), updatedBy: auth.currentUser.email });
    console.log('✅ Actividad sincronizada por:', auth.currentUser.email);
  }catch(error){ console.error('❌ Error guardando actividad:', error); checkedActivities[activityId] = !checkedActivities[activityId]; render(); alert('Error al sincronizar. Intenta de nuevo.'); }
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
  try{
    if (currentItinerary?.aiInsights && window.ItineraryBuilder?.showAIInsightsModal){
      const actions = container.querySelector('.flex.gap-2');
      if(actions){
        const btn=document.createElement('button');
        btn.textContent='✨ Ver Insights AI';
        btn.className='bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition text-sm font-semibold backdrop-blur-sm';
        btn.addEventListener('click', ()=> window.ItineraryBuilder.showAIInsightsModal(currentItinerary.aiInsights));
        actions.appendChild(btn);
      }
    }
  }catch(e){ console.warn('No se pudo inyectar el botón de AI Insights:', e); }
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
  container.innerHTML = `
    <div class="flex items-center gap-2 mb-4">
      <span class="text-2xl">📅</span>
      <h2 class="text-2xl font-bold dark:text-white">Día ${day.day}</h2>
    </div>
    <div class="mb-4">
      <div class="flex justify-between text-sm mb-1 dark:text-gray-300"><span>Progreso</span><span>${completed}/${day.activities.length}</span></div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-red-600 h-2 rounded-full transition-all duration-500" style="width:${progress}%"></div></div>
      <div class="mt-2 text-right">${syncStatus}</div>
    </div>
    <div class="space-y-3 text-sm">
      <p class="font-semibold text-base dark:text-gray-300">${day.date}</p>
      <p class="font-bold text-lg text-red-600 dark:text-red-400">${day.title||''}</p>
      ${day.hotel ? `<p class="dark:text-gray-300">🏨 ${day.hotel}</p>`:''}
      ${day.location ? `<p class="text-xs text-gray-500 dark:text-gray-400">📍 ${day.location}</p>`:''}
    </div>
    <div class="mt-6">
      <button type="button" id="addActivityBtn_${day.day}" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition">+ Añadir Actividad</button>
    </div>`;
}

function renderActivities(day){
  const container=document.getElementById('activitiesTimeline'); if(!container) return;
  if (sortableInstance){ try{ sortableInstance.destroy(); }catch(_){} sortableInstance=null; }
  container.innerHTML = (day.activities||[]).map((act,i)=> `
    <div class="activity-card bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 border-red-500 fade-in transition-all hover:shadow-lg ${checkedActivities[act.id]?'opacity-60':''}" style="animation-delay:${i*0.05}s">
      <div class="p-5 flex items-start gap-4">
        <input type="checkbox" data-id="${act.id}" ${checkedActivities[act.id]?'checked':''} class="activity-checkbox mt-1 w-5 h-5 cursor-pointer accent-red-600 flex-shrink-0" />
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
              <button type="button" data-action="edit" data-activity-id="${act.id}" data-day="${day.day}" class="activity-edit-btn p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">✏️</button>
              <button type="button" data-action="delete" data-activity-id="${act.id}" data-day="${day.day}" class="activity-delete-btn p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">🗑️</button>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">${act.desc||''}</p>
          ${act.station?`<p class="text-xs text-gray-500 dark:text-gray-500 mt-2">🚉 ${act.station}</p>`:''}
          ${act.train?`
            <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-2 border-blue-500">
              <p class="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">🚄 ${act.train.line}</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">${act.train.from} → ${act.train.to}</p>
              <p class="text-xs text-gray-500 dark:text-gray-500">⏱️ ${act.train.duration}</p>
            </div>`:''}
        </div>
      </div>
    </div>`).join('');
}

// --- Drag & Drop (igual que tu versión; aquí simplificado) ---
function initializeDragAndDrop(container){ /* noop placeholder (tu proyecto puede incluir SortableJS) */ }

// --- API público del handler ---
export const ItineraryHandler = {
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
        const dayBtn=e.target.closest('.day-btn');
        if(addBtn){ const day=parseInt(addBtn.id.split('_')[1]); ItineraryHandler.showActivityModal(null, day); }
        else if(editBtn){ const activityId=editBtn.dataset.activityId; const dayNum=parseInt(editBtn.dataset.day); ItineraryHandler.showActivityModal(activityId, dayNum); }
        else if(deleteBtn){ const activityId=deleteBtn.dataset.activityId; const dayNum=parseInt(deleteBtn.dataset.day); ItineraryHandler.deleteActivity(activityId, dayNum); }
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

  // Los siguientes métodos (showActivityModal, closeActivityModal, saveActivity, deleteActivity)
  // se mantienen como en tu proyecto original. Puedes conservarlos tal cual si ya funcionan.
  showActivityModal(activityId, day){ /* usa tu implementación existente */ },
  closeActivityModal(){ /* usa tu implementación existente */ },
  async deleteActivity(activityId, day){ /* usa tu implementación existente */ },
  async saveActivity(){ /* usa tu implementación existente */ }
};

// Auth listener (igual que tu proyecto)
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
try{
  if (typeof auth !== 'undefined' && auth){ onAuthStateChanged(auth, (user)=>{ initRealtimeSync(); }); }
  else {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>{ try{ initRealtimeSync(); }catch(e){ console.warn('initRealtimeSync deferred failed:', e); } });
    else { try{ initRealtimeSync(); }catch(e){ console.warn('initRealtimeSync immediate failed:', e); } }
  }
}catch(e){
  console.warn('Error setting up auth listener for itinerary:', e);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>{ try{ initRealtimeSync(); }catch(err){ console.warn('initRealtimeSync fallback failed:', err); } });
  else { try{ initRealtimeSync(); }catch(err){ console.warn('initRealtimeSync fallback immediate failed:', err); } }
}

window.ItineraryHandler = ItineraryHandler;
