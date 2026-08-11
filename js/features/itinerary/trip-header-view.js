export function escapeMarkup(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

export function buildTripHeaderView({ trip, userTripCount = 0, hasItinerary = false, crowdHTML = '', numbersHTML = '', formatDate = String }) {
  const info = { ...(trip || {}), ...(trip?.info || {}) };
  const date = value => escapeMarkup(value ? formatDate(value) || value : 'Fecha por definir');
  return `<div class="trip-header-banner trip-header-banner--journey text-white p-6 rounded-xl mb-6 shadow-lg">
    <img class="jp-trip-postmark" src="/images/illustrations/generated/decorations/postmark.png" alt="">
    <img class="jp-trip-polaroid" src="/images/illustrations/generated/decorations/polaroid-fuji.png" alt="">
    <div class="jp-trip-dogwrap"><img class="jp-trip-dog" src="/images/illustrations/generated/companions/dog-explorer.png" alt="Perrito explorador con cámara"><span class="jp-trip-bubble">Tu ruta está lista para explorar</span></div>
    <div class="trip-header-banner__copy text-center mb-4"><span class="trip-header-banner__eyebrow">TU CUADERNO DE VIAJE</span><h3 class="font-bold text-3xl mb-2">${escapeMarkup(info.name || 'Mi viaje a Japón')}</h3><p class="text-sm text-white/90">📅 ${date(info.dateStart)} – ${date(info.dateEnd)} <span aria-hidden="true">·</span> 👥 ${info.tripType === 'individual' ? 'Viaje individual' : 'Viaje grupal'}</p><div class="mt-2">${crowdHTML}</div></div>
    <div class="flex gap-2 flex-wrap justify-center">
      ${hasItinerary ? '<button type="button" data-trip-action="today"><i class="fas fa-location-arrow"></i> Modo Hoy</button>' : ''}${userTripCount > 1 ? '<button type="button" data-trip-action="list"><i class="far fa-folder-open"></i> Mis Viajes</button>' : ''}<button type="button" data-trip-action="share"><i class="fas fa-link"></i> Compartir</button><button type="button" data-trip-action="create"><i class="fas fa-plus"></i> Agregar viaje</button>${hasItinerary ? '<button type="button" data-trip-action="pdf"><i class="far fa-file-pdf"></i> Exportar PDF</button><button type="button" data-trip-action="optimize"><i class="fas fa-route"></i> Optimizar Todo</button><button type="button" data-trip-action="balance"><i class="fas fa-scale-balanced"></i> Balancear</button>' : '<button type="button" class="bg-green-500" data-trip-action="regenerate"><i class="fas fa-wand-magic-sparkles"></i> Crear Itinerario</button>'}
    </div></div>${numbersHTML}`;
}

export function bindTripHeaderActions(container, actions) {
  container.onclick = event => {
    const key = event.target.closest?.('[data-trip-action]')?.dataset.tripAction;
    if (key) actions[key]?.();
  };
}
