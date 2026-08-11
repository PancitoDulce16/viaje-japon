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
  const time = /^\d{1,2}:\d{2}$/.test(activity?.time || '') ? activity.time : '23:59';
  const value = new Date(`${date}T${time}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function summarizeItinerary(days = [], nowValue = new Date()) {
  const now = new Date(nowValue);
  const activities = days.flatMap((day) => (day.activities || []).map((activity) => ({ ...activity, dayDate: day.date, at: activityDateTime(day, activity) })))
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
    if (days <= 7) add({ id: `reservation:${reservation.id}`, kind: 'reservations', severity: days <= 1 ? 'critical' : 'recommendation', urgency: Math.max(0, 90 - days * 10), blocking: ['Vuelo', 'Transporte'].includes(reservation.type), title: `Próxima reservación: ${reservation.title}`, actionLabel: 'Confirmar reservación' });
  }
  if (data.reservations?.missingDocuments > 0) add({ id: 'documents:missing', kind: 'documents', severity: 'critical', urgency: 75, blocking: true, title: `${data.reservations.missingDocuments} reservación(es) sin documento`, actionLabel: 'Agregar documento' });
  if (data.budget?.percentUsed >= 80) add({ id: 'budget:limit', kind: 'budget', severity: data.budget.percentUsed >= 100 ? 'critical' : 'recommendation', urgency: Math.min(100, data.budget.percentUsed), financialImpact: 80, title: `Presupuesto al ${data.budget.percentUsed.toFixed(0)}%`, actionLabel: 'Revisar presupuesto' });
  if (data.personalBalance?.toPayMinor > 0) add({ id: 'balance:pending', kind: 'balances', severity: 'recommendation', urgency: 45, financialImpact: 60, title: 'Tienes una liquidación pendiente', actionLabel: 'Registrar pago' });
  if (data.packing?.pending > 0 && data.trip?.countdown?.state === 'upcoming' && data.trip.countdown.days <= 7) add({ id: 'packing:pending', kind: 'packing', severity: data.trip.countdown.days <= 2 ? 'critical' : 'recommendation', urgency: 90 - data.trip.countdown.days * 8, title: `${data.packing.pending} artículo(s) de equipaje pendientes`, actionLabel: 'Completar equipaje' });
  for (const alert of data.importantAlerts || []) add({ id: `alert:${alert.id}`, kind: 'alerts', severity: alert.severity === 'critical' ? 'critical' : 'recommendation', urgency: Number(alert.urgency || 50), blocking: Boolean(alert.blocking), title: alert.title || alert.message, actionLabel: alert.actionLabel || 'Revisar alerta' });
  return candidates.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
}
