function itinerary() { return window.ItineraryHandler?.currentItinerary || window.currentItinerary; }
function parseDate(value) { const date = value?.toDate?.() || (value ? new Date(`${value}T00:00:00`) : null); return date && !Number.isNaN(date.getTime()) ? date : null; }
function getTodayDay() {
  const days = itinerary()?.days || []; const now = new Date(); now.setHours(0, 0, 0, 0);
  return days.find(day => { const date = parseDate(day.date); return date && date.setHours(0, 0, 0, 0) === now.getTime(); }) || days.find(day => day.day === window.ItineraryHandler?.currentDay) || days[0];
}
function escapeHTML(value = '') { const node = document.createElement('span'); node.textContent = String(value); return node.innerHTML; }
function activityName(activity) { return activity.name || activity.title || 'Actividad'; }

export const TodayMode = {
  open() {
    document.getElementById('today-mode-sheet')?.remove();
    const day = getTodayDay();
    if (!day) return window.Notifications?.show?.('Agrega actividades para usar Modo Hoy', 'info');
    const activities = [...(day.activities || [])].sort((a, b) => String(a.time || '99:99').localeCompare(String(b.time || '99:99')));
    const sheet = document.createElement('div'); sheet.id = 'today-mode-sheet'; sheet.className = 'today-mode';
    sheet.innerHTML = `<button class="today-mode__backdrop" data-today-close aria-label="Cerrar"></button><section class="today-mode__sheet" role="dialog" aria-modal="true" aria-labelledby="today-mode-title"><div class="today-mode__handle"></div><header><div><span>今日 · MODO HOY</span><h2 id="today-mode-title">Día ${escapeHTML(day.day)} · ${escapeHTML(day.city || day.title || 'Japón')}</h2><p>${escapeHTML(day.date || '')} · ${activities.length} momentos</p></div><button data-today-close aria-label="Cerrar"><i class="fas fa-xmark"></i></button></header><div class="today-mode__actions"><button data-today-map><i class="fas fa-route"></i> Ruta</button><button data-today-reservations><i class="fas fa-ticket"></i> Reservas</button><button onclick="window.EmergencyAssistant?.init();document.getElementById('emergencyModal')?.classList.add('active')"><i class="fas fa-kit-medical"></i> SOS</button></div><div class="today-mode__timeline">${activities.length ? activities.map((activity, index) => `<article data-today-activity="${index}" class="${activity.completed ? 'is-done' : ''}"><time>${escapeHTML(activity.time || '—')}</time><i></i><div><h3>${escapeHTML(activityName(activity))}</h3><p>${escapeHTML(activity.location || activity.address || activity.category || '')}</p><div><button data-today-complete="${index}"><i class="fas fa-check"></i> ${activity.completed ? 'Completado' : 'Marcar hecho'}</button>${activity.location || activity.address ? `<a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location || activity.address)}"><i class="fas fa-location-arrow"></i> Cómo llegar</a>` : ''}</div></div></article>`).join('') : '<p class="today-mode__empty">Este día todavía no tiene actividades.</p>'}</div></section>`;
    document.body.appendChild(sheet); requestAnimationFrame(() => sheet.classList.add('is-open')); sheet.querySelector('.today-mode__sheet').focus?.();
  },
  close() { const sheet = document.getElementById('today-mode-sheet'); sheet?.classList.remove('is-open'); setTimeout(() => sheet?.remove(), 220); }
};

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-today-close]')) return TodayMode.close();
  if (event.target.closest('[data-today-map]')) { const day = getTodayDay(); if (day?.day) sessionStorage.setItem('japitin_map_day', String(day.day)); TodayMode.close(); document.querySelector('.tab-btn[data-tab="map"]')?.click(); return; }
  if (event.target.closest('[data-today-reservations]')) { TodayMode.close(); document.querySelector('.tab-btn[data-tab="utils"]')?.click(); setTimeout(() => document.querySelector('[onclick*="reservations"]')?.click(), 500); return; }
  const complete = event.target.closest('[data-today-complete]');
  if (complete) {
    const day = getTodayDay(); const activities = [...(day?.activities || [])].sort((a,b) => String(a.time || '99:99').localeCompare(String(b.time || '99:99'))); const activity = activities[Number(complete.dataset.todayComplete)];
    const title = activityName(activity); const card = [...document.querySelectorAll('.activity-card')].find(node => node.textContent.includes(title)); card?.querySelector('.activity-checkbox')?.click(); activity.completed = !activity.completed; TodayMode.open();
  }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') TodayMode.close(); });
window.TodayMode = TodayMode;
