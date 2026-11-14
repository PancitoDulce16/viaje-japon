import assert from 'node:assert/strict';
import { localReservationMinute, nextActiveReservation, reservationStart } from '../js/features/reservations/reservation-summary.js';
import { renderReservationTicket } from '../js/features/dashboard/reservation-ticket.js';

const now = new Date(2026, 10, 13, 8, 30, 0);
assert.equal(localReservationMinute(now), '2026-11-13T08:30');
assert.equal(reservationStart('2026-11-14T15:05').date.getHours(), 15);
assert.match(reservationStart('2026-11-14T15:05').label, /15:05$/);
for (const value of ['', null, '21 ago · 15:00', '2026-02-30T15:00', '2026-11-14T24:00', '2026-11-14T15:99', '2026-11-14T15:05:99']) assert.equal(reservationStart(value), null);
const reservations = [
  { id: 'later', status: 'Confirmada', startAt: '2026-11-15T10:00' },
  { id: 'cancelled', status: 'Cancelada', startAt: '2026-11-13T09:00' },
  { id: 'completed', status: 'Completada', startAt: '2026-11-13T10:00' },
  { id: 'earlier', status: 'Pendiente', startAt: '2026-11-14T10:00' },
  { id: 'past', status: 'Confirmada', startAt: '2026-11-12T10:00' },
  { id: 'invalid', status: 'Confirmada', startAt: 'not-a-date' }
];
assert.equal(nextActiveReservation(reservations, now).id, 'earlier');
assert.equal(reservations[0].id, 'later', 'Selection must not mutate its input');
assert.equal(nextActiveReservation(reservations, new Date(2027, 0, 1)), null);
assert.equal(nextActiveReservation([], now), null);
const card = renderReservationTicket({ id: 'r1', title: '<img src=x onerror=alert(1)>', status: 'Pendiente', startAt: '2026-11-14T15:05', requiresDocument: true, documentCount: 0 });
assert.ok(card.includes('&lt;img'));
assert.ok(!card.includes('<img'));
assert.ok(card.includes('Adjuntar documento'));
assert.ok(card.includes('Falta adjuntar'));
assert.ok(card.includes('data-reservation-id="r1"'));
assert.ok(card.includes('datetime="2026-11-14T15:05"'));
assert.ok(renderReservationTicket({ id: 'r1', documentCount: 2 }).includes('Documentos (2)'));
assert.ok(renderReservationTicket({ id: 'r1', startAt: 'not-a-date' }).includes('Fecha por confirmar'));
assert.ok(!renderReservationTicket(null).includes('data-reservation-id'));
console.log('dashboard reservations: local dates, active selection, documents and escaped content ok');
