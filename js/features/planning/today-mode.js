function itinerary(){return window.ItineraryHandler?.currentItinerary||window.currentItinerary}
function parseDate(value){const date=value?.toDate?.()||(value?new Date(`${value}T00:00:00`):null);return date&&!Number.isNaN(date.getTime())?date:null}
function getTodayDay(){const days=itinerary()?.days||[],now=new Date();now.setHours(0,0,0,0);return days.find(day=>{const date=parseDate(day.date);return date&&date.setHours(0,0,0,0)===now.getTime()})||days.find(day=>day.day===window.ItineraryHandler?.currentDay)||days[0]}
function escapeHTML(value=''){const node=document.createElement('span');node.textContent=String(value);return node.innerHTML}
function activityName(activity){return activity.name||activity.title||'Actividad'}
function toMinutes(value){const match=String(value||'').match(/^(\d{1,2}):(\d{2})/);return match?Number(match[1])*60+Number(match[2]):9999}
function stateFor(activity,index,activities){if(activity.completed)return'done';const now=new Date(),current=now.getHours()*60+now.getMinutes(),start=toMinutes(activity.time),end=start+Number(activity.duration||60);if(current>=start&&current<end)return'now';const future=activities.findIndex(item=>!item.completed&&toMinutes(item.time)>=current);return index===future?'next':'later'}
function stateLabel(state){return{done:'COMPLETADO',now:'AHORA',next:'SIGUIENTE',later:'DESPUÉS'}[state]}

export const TodayMode={
 open(){
  document.getElementById('today-mode-sheet')?.remove();const day=getTodayDay();
  if(!day)return window.Notifications?.show?.('Agrega actividades para usar Modo Hoy','info');
  const activities=[...(day.activities||[])].sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));
  const currentIndex=Math.max(0,activities.findIndex((activity,index)=>['now','next'].includes(stateFor(activity,index,activities))));
  const sheet=document.createElement('div');sheet.id='today-mode-sheet';sheet.className='today-mode';
  sheet.innerHTML=`<button class="today-mode__backdrop" data-today-close aria-label="Cerrar"></button><section class="today-mode__sheet" role="dialog" aria-modal="true" aria-labelledby="today-mode-title" tabindex="-1"><div class="today-mode__handle"></div><header><div><span>今日 · MODO HOY</span><h2 id="today-mode-title">Día ${escapeHTML(day.day)} · ${escapeHTML(day.city||day.title||'Japón')}</h2><p>${escapeHTML(day.date||'')} · ${activities.length} momentos</p></div><button data-today-close aria-label="Cerrar">×</button></header>
  <div class="today-mode__progress"><span style="--today-progress:${activities.length?Math.round((activities.filter(a=>a.completed).length/activities.length)*100):0}%"></span><small>${activities.filter(a=>a.completed).length} de ${activities.length} completados</small></div>
  <div class="today-mode__actions"><button data-today-map>🗺️ Ruta</button><button data-today-reservations>🎟️ Reservas</button><button data-today-adjust>☂️ Reajustar</button><button onclick="window.EmergencyAssistant?.init();document.getElementById('emergencyModal')?.classList.add('active')">🩹 SOS</button></div>
  <div class="today-mode__timeline">${activities.length?activities.map((activity,index)=>{const state=stateFor(activity,index,activities);return`<article data-today-activity="${index}" class="is-${state}"><time>${escapeHTML(activity.time||'—')}</time><i></i><div><span class="today-mode__state">${stateLabel(state)}</span><h3>${escapeHTML(activityName(activity))}</h3><p>${escapeHTML(activity.location||activity.address||activity.category||'')}</p><div><button data-today-complete="${index}">✓ ${activity.completed?'Desmarcar':'Marcar hecho'}</button>${activity.location||activity.address?`<a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location||activity.address)}">↗ Cómo llegar</a>`:''}</div></div></article>`}).join(''):'<p class="today-mode__empty">Este día todavía no tiene actividades.</p>'}</div></section>`;
  document.body.appendChild(sheet);requestAnimationFrame(()=>{sheet.classList.add('is-open');sheet.querySelector('.today-mode__sheet')?.focus()});
 },
 close(){const sheet=document.getElementById('today-mode-sheet');sheet?.classList.remove('is-open');setTimeout(()=>sheet?.remove(),220)}
};
document.addEventListener('click',event=>{
 if(event.target.closest('[data-today-close]'))return TodayMode.close();
 if(event.target.closest('[data-today-map]')){const day=getTodayDay();if(day?.day)sessionStorage.setItem('japitin_map_day',String(day.day));TodayMode.close();document.querySelector('.tab-btn[data-tab="map"]')?.click();return}
 if(event.target.closest('[data-today-reservations]')){TodayMode.close();document.querySelector('.tab-btn[data-tab="utils"]')?.click();setTimeout(()=>document.querySelector('[onclick*="reservations"]')?.click(),500);return}
 if(event.target.closest('[data-today-adjust]')){const day=getTodayDay();if(day?.day)window.adaptJapitinDayToWeather?.(day.day);TodayMode.close();return}
 const complete=event.target.closest('[data-today-complete]');if(!complete)return;
 const day=getTodayDay(),activities=[...(day?.activities||[])].sort((a,b)=>toMinutes(a.time)-toMinutes(b.time)),activity=activities[Number(complete.dataset.todayComplete)];
 const card=[...document.querySelectorAll('.activity-card')].find(node=>node.textContent.includes(activityName(activity)));card?.querySelector('.activity-checkbox')?.click();activity.completed=!activity.completed;TodayMode.open();
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')TodayMode.close()});
window.addEventListener('offline',()=>window.WashiToast?.show({message:'Modo offline: tu ruta guardada sigue disponible',type:'info',duration:8000}));
window.addEventListener('online',()=>window.WashiToast?.show({message:'Conexión recuperada · Japitin vuelve a sincronizar',type:'success'}));
window.TodayMode=TodayMode;
