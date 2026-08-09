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
