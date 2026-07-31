export function escapeMarkup(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

export function buildTripHeaderView({ trip, userTripCount = 0, hasItinerary = false, crowdHTML = '', numbersHTML = '', formatDate = String }) {
  const info = trip?.info || {};
  const date = value => escapeMarkup(value ? formatDate(value) || value : 'Fecha por definir');
  return `<div class="trip-header-banner trip-header-banner--journey text-white p-6 rounded-xl mb-6 shadow-lg">
    <div class="text-center mb-4"><h3 class="font-bold text-3xl mb-2">${escapeMarkup(info.name || 'Mi viaje a Japón')}</h3><p class="text-sm text-white/90">📅 ${date(info.dateStart)} - ${date(info.dateEnd)} • 👥 ${info.tripType === 'individual' ? 'Viaje Individual' : 'Viaje Grupal'}</p><div class="mt-2">${crowdHTML}</div></div>
    <div class="flex gap-2 flex-wrap justify-center">
      ${hasItinerary ? '<button type="button" data-trip-action="today"><i class="fas fa-location-arrow"></i> Modo Hoy</button>' : ''}${userTripCount > 1 ? '<button type="button" data-trip-action="list">📂 Mis Viajes</button>' : ''}<button type="button" data-trip-action="share">🔗 Compartir</button><button type="button" data-trip-action="create">➕ Agregar Viaje</button>${hasItinerary ? '<button type="button" data-trip-action="pdf">📄 Exportar PDF</button><button type="button" data-trip-action="optimize">🚀 Optimizar Todo</button><button type="button" data-trip-action="balance">⚖️ Balancear</button>' : '<button type="button" class="bg-green-500" data-trip-action="regenerate">✨ Crear Itinerario</button>'}
    </div></div>${numbersHTML}`;
}

export function bindTripHeaderActions(container, actions) {
  container.onclick = event => {
    const key = event.target.closest?.('[data-trip-action]')?.dataset.tripAction;
    if (key) actions[key]?.();
  };
}
