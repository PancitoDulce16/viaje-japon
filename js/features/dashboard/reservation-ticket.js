import { reservationStart } from '../reservations/reservation-summary.js';

const safe = (value = '') => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

export function renderReservationTicket(reservation) {
  const start = reservationStart(reservation?.startAt);
  const documents = Math.max(0, Math.floor(Number(reservation?.documentCount) || 0));
  const hasId = Boolean(reservation?.id);
  const missing = reservation?.requiresDocument && !documents;
  return `<article class="reservation-ticket">
    <div><p class="journey-home__eyebrow">Próxima reservación</p>
      <h2>${reservation ? safe(reservation.title || reservation.name || 'Reservación') : 'Sin reservaciones próximas'}</h2>
      ${reservation ? `<p>${safe(reservation.location || reservation.type || '')}</p>${start ? `<p><time datetime="${safe(start.datetime)}">${safe(start.label)}</time></p>` : '<p>Fecha por confirmar</p>'}<span>${safe(reservation.status || 'Estado por confirmar')}</span>${missing ? '<p class="reservation-ticket__attention">Falta adjuntar el documento requerido.</p>' : ''}` : '<p>Cuando agregues una reserva próxima, aparecerá aquí.</p>'}
    </div>
    <div class="reservation-ticket__actions">
      <button type="button" ${hasId ? `data-reservation-id="${safe(reservation.id)}" onclick="window.ReservationsManager?.openReservation(this.dataset.reservationId)"` : 'onclick="window.DashboardApp?.openFloatingModal(\'reservations\')"'}>${hasId ? 'Ver reserva' : 'Abrir reservas'}</button>
      ${hasId ? `<button type="button" data-reservation-id="${safe(reservation.id)}" onclick="window.TripDocuments?.open({reservationId:this.dataset.reservationId})">${missing ? 'Adjuntar documento' : `Documentos (${documents})`}</button>` : ''}
    </div>
  </article>`;
}
