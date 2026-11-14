// Reservations are stored as datetime-local values, without a UTC conversion.
export function localReservationMinute(value = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function reservationStart(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(value || ''));
  if (!match) return null;
  const [, year, month, day, hour, minute, second = '00'] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  if (localReservationMinute(date) !== String(value).slice(0, 16) || Number(second) > 59) return null;
  return {
    date,
    datetime: String(value),
    label: `${new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)} · ${hour}:${minute}`
  };
}

export function nextActiveReservation(items = [], nowValue = new Date()) {
  const now = new Date(nowValue);
  return items.filter(item => ['Pendiente', 'Confirmada'].includes(item.status))
    .map(item => ({ item, start: reservationStart(item.startAt)?.date }))
    .filter(({ start }) => start && start >= now)
    .sort((a, b) => a.start - b.start)[0]?.item || null;
}
