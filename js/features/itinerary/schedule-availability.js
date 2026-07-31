const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function parseLocalISO(value) {
  const [year, month, day] = String(value || '').split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}
export function weekdayForTripDay(tripStartDate, dayNumber) {
  const date = parseLocalISO(tripStartDate);
  if (!date) return null;
  date.setDate(date.getDate() + Math.max(0, Number(dayNumber || 1) - 1));
  return { index: date.getDay(), label: WEEKDAYS[date.getDay()], date };
}

export function filterClosedActivities(activities = [], tripStartDate, dayNumber) {
  const weekday = weekdayForTripDay(tripStartDate, dayNumber);
  if (!weekday) return { available: activities, closed: [], weekday: null };
  const closed = [];
  const available = activities.filter(activity => {
    const isClosed = activity.closed_days?.includes(weekday.index);
    if (isClosed) closed.push(activity);
    return !isClosed;
  });
  return { available, closed, weekday };
}

/**
 * Asigna horas sin colocar visitas antes de abrir ni después de cerrar.
 * Esperar a que abra es preferible a inventar una hora imposible.
 */
export function scheduleWithinOpeningHours(activities = [], startHour = 9) {
  let cursor = Number(startHour) * 60;
  const scheduled = [];
  const rejected = [];

  activities.forEach((activity, index) => {
    const duration = Number(activity.duration || 60);
    const opens = Number(activity.opening_hours?.start ?? 0) * 60;
    const closes = Number(activity.opening_hours?.end ?? 24) * 60;
    const proposed = Math.max(cursor, opens);
    if (proposed + duration > closes) {
      rejected.push({ ...activity, rejectionReason: 'outside-opening-hours', proposedMinutes: proposed });
      return;
    }
    scheduled.push({ ...activity, time: `${String(Math.floor(proposed / 60)).padStart(2, '0')}:${String(proposed % 60).padStart(2, '0')}` });
    cursor = proposed + duration + (index < activities.length - 1 ? 30 : 0);
  });
  return { scheduled, rejected };
}
