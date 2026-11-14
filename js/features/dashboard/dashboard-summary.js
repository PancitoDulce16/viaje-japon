const DAY_MS = 86_400_000;

export function localDate(value) {
  if (!value) return null;
  const date = value instanceof Date
    ? new Date(value.getFullYear(), value.getMonth(), value.getDate())
    : new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function calculateTripCountdown(startValue, endValue, nowValue = new Date()) {
  const start = localDate(startValue);
  const end = localDate(endValue);
  const now = localDate(nowValue);
  if (!start || !end || !now) return { state: 'unknown', days: null };
  if (now < start) return { state: 'upcoming', days: Math.ceil((start - now) / DAY_MS) };
  if (now > end) return { state: 'finished', days: Math.floor((now - end) / DAY_MS) };
  return { state: 'traveling', days: Math.floor((end - now) / DAY_MS) + 1 };
}

export function activityDateTime(day, activity) {
  const date = String(day?.date || '').slice(0, 10);
  if (!date) return null;
  const time = normalizeActivityTime(activity?.time) || '23:59';
  const value = new Date(`${date}T${time}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function normalizeActivityTime(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || '').trim());
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return null;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function summarizeItinerary(days = [], nowValue = new Date()) {
  const now = new Date(nowValue);
  const activities = days.flatMap((day, dayIndex) => (day.activities || []).map((activity) => ({ ...activity, city: activity.city || day.city || '', dayNumber: day.day ?? dayIndex + 1, dayDate: day.date, at: activityDateTime(day, activity) })))
    .filter((activity) => activity.at).sort((a, b) => a.at - b.at);
  const completed = activities.filter((activity) => activity.at < now).length;
  return {
    total: activities.length,
    completed,
    percent: activities.length ? Math.round(completed / activities.length * 100) : 0,
    next: activities.find((activity) => activity.at >= now) || null
  };
}

export function classifyTasks(tasks = [], todayValue = new Date(), upcomingDays = 7) {
  const today = localDate(todayValue);
  const horizon = new Date(today); horizon.setDate(horizon.getDate() + upcomingDays);
  const pending = tasks.filter((task) => !task.completed);
  const overdue = pending.filter((task) => task.dueDate && localDate(task.dueDate) < today);
  const upcoming = pending.filter((task) => { const due = localDate(task.dueDate); return due && due >= today && due <= horizon; });
  return { pending, overdue, upcoming };
}

export function packingProgress(items = []) {
  const total = items.length;
  const packed = items.filter((item) => Boolean(item.packed ?? item.checked)).length;
  return { total, packed, pending: total - packed, percent: total ? Math.round(packed / total * 100) : 0 };
}

export function prioritizeDashboardActions(data = {}, nowValue = new Date(), limit = 5) {
  const now = localDate(nowValue);
  const candidates = [];
  const add = action => candidates.push({ ...action, score: (action.severity === 'critical' ? 400 : 200) + (action.urgency || 0) + (action.financialImpact || 0) + (action.blocking ? 100 : 0) });
  for (const task of data.tasks?.upcoming || []) {
    const due = localDate(task.dueDate);
    if (due && due < now) add({ id: `task:${task.id}`, kind: 'tasks', severity: 'critical', urgency: 100, blocking: Boolean(task.blocking), title: `Tarea vencida: ${task.title}`, actionLabel: 'Resolver tarea' });
  }
  const reservation = data.reservations?.next;
  if (reservation?.startAt) {
    const days = Math.ceil((new Date(reservation.startAt) - now) / DAY_MS);
    if (days >= 0 && days <= 7) add({ id: `reservation:${reservation.id}`, kind: 'reservations', severity: days <= 1 ? 'critical' : 'recommendation', urgency: Math.max(0, 90 - days * 10), blocking: ['Vuelo', 'Transporte'].includes(reservation.type), title: `Próxima reservación: ${reservation.title}`, actionLabel: 'Ver reservación' });
  }
  if (data.reservations?.missingDocuments > 0) add({ id: 'documents:missing', kind: 'documents', severity: 'critical', urgency: 75, blocking: true, title: `${data.reservations.missingDocuments} reservación(es) sin documento`, actionLabel: 'Agregar documento' });
  if (data.budget?.percentUsed >= 80) add({ id: 'budget:limit', kind: 'budget', severity: data.budget.percentUsed >= 100 ? 'critical' : 'recommendation', urgency: Math.min(100, data.budget.percentUsed), financialImpact: 80, title: `Presupuesto al ${data.budget.percentUsed.toFixed(0)}%`, actionLabel: 'Revisar presupuesto' });
  if (data.personalBalance?.toPayMinor > 0) add({ id: 'balance:pending', kind: 'balances', severity: 'recommendation', urgency: 45, financialImpact: 60, title: 'Tienes una liquidación pendiente', actionLabel: 'Registrar pago' });
  if (data.packing?.pending > 0 && data.trip?.countdown?.state === 'upcoming' && data.trip.countdown.days <= 7) add({ id: 'packing:pending', kind: 'packing', severity: data.trip.countdown.days <= 2 ? 'critical' : 'recommendation', urgency: 90 - data.trip.countdown.days * 8, title: `${data.packing.pending} artículo(s) de equipaje pendientes`, actionLabel: 'Completar equipaje' });
  for (const alert of data.importantAlerts || []) add({ id: `alert:${alert.id}`, kind: 'alerts', severity: alert.severity === 'critical' ? 'critical' : 'recommendation', urgency: Number(alert.urgency || 50), blocking: Boolean(alert.blocking), title: alert.title || alert.message, actionLabel: alert.actionLabel || 'Revisar alerta' });
  return candidates.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
}

// One next step with a known destination, derived from real trip data.
export function dashboardFocus(data = {}, nowValue = new Date()) {
  const trip = data.trip || {};
  const countdown = calculateTripCountdown(trip.dateStart, trip.dateEnd, nowValue);
  const state = countdown.state;
  const subtitle = state === 'traveling'
    ? 'Tu siguiente parada y lo necesario para disfrutar el día.'
    : state === 'finished'
      ? 'Guarda tus recuerdos y cierra los detalles de tu aventura.'
      : state === 'upcoming'
        ? 'Prepara tu aventura, un paso a la vez.'
        : 'Elige tus fechas y empieza a imaginar tu aventura.';
  if (state === 'finished') {
    const balance = data.personalBalance;
    if (balance?.toPayMinor > 0 || balance?.toReceiveMinor > 0) {
      return { state, subtitle, kind: 'balances', title: 'Revisa los saldos pendientes de tu viaje.', actionLabel: 'Ver gastos compartidos' };
    }
    return { state, subtitle, kind: 'memories', title: 'Tu aventura merece un lugar en tu diario.', actionLabel: 'Abrir recuerdos' };
  }
  const actionable = new Set(['tasks', 'reservations', 'documents', 'budget', 'balances', 'packing', 'alerts']);
  const action = prioritizeDashboardActions({ ...data, trip: { ...trip, countdown } }, nowValue).find(item => actionable.has(item.kind));
  if (action) return { ...action, state, subtitle };
  if (data.itinerary?.next) return {
    state, subtitle, kind: state === 'traveling' ? 'map' : 'itinerary',
    title: state === 'traveling' ? 'Tu próxima aventura te espera. Consulta la ruta antes de salir.' : 'Dale una mirada a tu próxima parada y prepara sus detalles.',
    actionLabel: state === 'traveling' ? 'Ver mapa' : 'Ver itinerario'
  };
  return { state, subtitle, kind: 'itinerary', title: state === 'traveling' ? 'Elige qué quieres descubrir hoy.' : 'Agrega tu primera actividad y empezamos a explorar.', actionLabel: 'Abrir itinerario' };
}
