export function orderActivitiesForDisplay(day, parseTime = value => Number(value) || 0) {
  const activities = (day?.activities || []).filter(Boolean);
  const manualOrder = Array.isArray(day?.manualActivityOrder) ? day.manualActivityOrder : [];
  if (!manualOrder.length) return activities.slice().sort((a, b) => parseTime(a.time) - parseTime(b.time));

  const positions = new Map(manualOrder.map((id, index) => [String(id), index]));
  return activities.slice().sort((a, b) => {
    const aPosition = positions.get(String(a.id));
    const bPosition = positions.get(String(b.id));
    if (aPosition != null && bPosition != null) return aPosition - bPosition;
    if (aPosition != null) return -1;
    if (bPosition != null) return 1;
    return parseTime(a.time) - parseTime(b.time);
  });
}

export function applyManualActivityOrder(day, orderedIds = []) {
  if (!day) return [];
  const available = new Set((day.activities || []).map(activity => String(activity.id)));
  const normalized = [...new Set(orderedIds.map(String))].filter(id => available.has(id));
  (day.activities || []).forEach(activity => {
    const id = String(activity.id);
    if (!normalized.includes(id)) normalized.push(id);
  });
  day.manualActivityOrder = normalized;
  return normalized;
}

export function removeFromManualActivityOrder(day, activityId) {
  if (!Array.isArray(day?.manualActivityOrder)) return;
  const target = String(activityId);
  day.manualActivityOrder = day.manualActivityOrder.filter(id => String(id) !== target);
}

export function moveActivityByOffset(day, activityId, offset, parseTime) {
  const ordered = orderActivitiesForDisplay(day, parseTime);
  const index = ordered.findIndex(activity => String(activity.id) === String(activityId));
  const target = Math.max(0, Math.min(ordered.length - 1, index + Number(offset)));
  if (index < 0 || target === index) return false;
  const [activity] = ordered.splice(index, 1);
  ordered.splice(target, 0, activity);
  day.activities = ordered;
  applyManualActivityOrder(day, ordered.map(item => item.id));
  return true;
}

const clockMinutes = value => {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

export function duplicateActivity(activity, id = `activity_${Date.now()}`) {
  return { ...structuredClone(activity), id, title: `${activity.title || activity.name || 'Actividad'} (copia)`, completed: false };
}

export function moveActivityBetweenDays(sourceDay, targetDay, activityId, targetIndex = null) {
  const index = (sourceDay?.activities || []).findIndex(item => String(item.id) === String(activityId));
  if (index < 0 || !targetDay || sourceDay === targetDay) return null;
  const [activity] = sourceDay.activities.splice(index, 1);
  removeFromManualActivityOrder(sourceDay, activityId);
  const insertAt = targetIndex == null ? targetDay.activities.length : Math.max(0, Math.min(targetDay.activities.length, targetIndex));
  targetDay.activities.splice(insertAt, 0, activity);
  applyManualActivityOrder(sourceDay, sourceDay.activities.map(item => item.id));
  applyManualActivityOrder(targetDay, targetDay.activities.map(item => item.id));
  return { activity, sourceIndex: index, targetIndex: insertAt };
}

export function analyzeDaySchedule(day, reservations = [], options = {}) {
  const dayStart = clockMinutes(options.dayStart || day?.dayStart || '07:00');
  const dayEnd = clockMinutes(options.dayEnd || day?.dayEnd || '23:00');
  const activities = orderActivitiesForDisplay(day, clockMinutes);
  const conflicts = [];
  const scheduled = [];
  activities.forEach((activity, index) => {
    const title = activity.title || activity.name || 'Actividad';
    const start = clockMinutes(activity.time);
    const duration = Math.max(1, Number(activity.duration || 60));
    const preparation = Math.max(0, Number(activity.preparationMinutes || activity.bufferMinutes || 0));
    if (start != null) scheduled.push({ activity, start, end: start + duration + preparation });
    if (start == null) conflicts.push({ type: 'missing-time', severity: 'recommendation', activityId: activity.id, message: `“${title}” no tiene hora.`, action: 'move-next-slot' });
    if (!activity.location && !activity.station && !activity.coordinates) conflicts.push({ type: 'missing-location', severity: 'recommendation', activityId: activity.id, message: `“${title}” no tiene ubicación.`, action: 'edit' });
    if (start != null && (start < dayStart || start + duration > dayEnd)) conflicts.push({ type: 'outside-day', severity: 'warning', activityId: activity.id, message: `“${title}” queda fuera del horario ${options.dayStart || day?.dayStart || '07:00'}–${options.dayEnd || day?.dayEnd || '23:00'}.`, action: 'move-next-slot' });
    if (!index || start == null) return;
    const previous = activities[index - 1];
    const previousStart = clockMinutes(previous.time);
    if (previousStart == null) return;
    const previousEnd = previousStart + Math.max(1, Number(previous.duration || 60)) + Math.max(0, Number(previous.preparationMinutes || previous.bufferMinutes || 0));
    const available = start - previousEnd;
    const travel = Math.max(0, Number(activity.travelTimeMinutes || activity.transferMinutes || 0));
    if (available < 0) conflicts.push({ type: 'overlap', severity: 'critical', activityId: activity.id, relatedActivityId: previous.id, minutes: -available, message: `Esta actividad se superpone ${-available} minutos con la anterior.`, action: 'move-next-slot' });
    else if (travel > available) conflicts.push({ type: 'transfer', severity: 'critical', activityId: activity.id, relatedActivityId: previous.id, minutes: travel - available, message: `Tienes ${available} minutos para un traslado estimado de ${travel} minutos.`, action: 'increase-transfer' });
  });
  const activeMinutes = activities.reduce((sum, item) => sum + Number(item.duration || 60) + Number(item.travelTimeMinutes || 0) + Number(item.preparationMinutes || 0), 0);
  if (activeMinutes > 600) conflicts.push({ type: 'overloaded', severity: 'warning', minutes: activeMinutes, message: `El día acumula ${Math.round(activeMinutes / 60 * 10) / 10} horas planificadas.`, action: 'move-other-day' });
  for (const reservation of reservations.filter(item => !day?.date || String(item.startAt || '').slice(0, 10) === day.date)) {
    const reservationStart = clockMinutes(String(reservation.startAt || '').slice(11, 16));
    const reservationEnd = clockMinutes(String(reservation.endAt || '').slice(11, 16));
    if (reservationStart == null) continue;
    const previous = [...activities].filter(item => clockMinutes(item.time) != null && clockMinutes(item.time) <= reservationStart).at(-1);
    if (!previous) continue;
    const end = clockMinutes(previous.time) + Number(previous.duration || 60) + Number(previous.preparationMinutes || 0);
    if (end > reservationStart && String(previous.id) !== String(reservation.activityId || '')) conflicts.push({ type: 'reservation', severity: 'critical', activityId: previous.id, reservationId: reservation.id, minutes: end - reservationStart, message: `La reservación “${reservation.title}” comienza antes de que termine la actividad anterior.`, action: 'reduce-duration' });
    if (reservationEnd != null && ['Vuelo', 'Transporte'].includes(reservation.type)) {
      for (const slot of scheduled.filter(item => item.start >= reservationStart && item.start < reservationEnd)) {
        if (String(slot.activity.id) === String(reservation.activityId || '')) continue;
        conflicts.push({ type: 'blocking-transfer', severity: 'critical', activityId: slot.activity.id, reservationId: reservation.id, minutes: reservationEnd - slot.start, message: `“${slot.activity.title || slot.activity.name || 'Actividad'}” ocurre durante ${reservation.type.toLowerCase()} “${reservation.title}”, que termina a ${String(reservation.endAt).slice(11, 16)}.`, action: 'move-other-day' });
      }
    }
  }
  const occupied = scheduled.slice().sort((a, b) => a.start - b.start);
  const freeSlots = [];
  let cursor = dayStart;
  for (const slot of occupied) {
    const travel = Math.max(0, Number(slot.activity.travelTimeMinutes || slot.activity.transferMinutes || 0));
    const availableEnd = Math.max(dayStart, slot.start - travel);
    if (availableEnd > cursor) freeSlots.push({ start: cursor, end: availableEnd, minutes: availableEnd - cursor });
    cursor = Math.max(cursor, slot.end);
  }
  if (cursor < dayEnd) freeSlots.push({ start: cursor, end: dayEnd, minutes: dayEnd - cursor });
  const totalCost = activities.reduce((sum, item) => sum + Math.max(0, Number(item.cost || 0)), 0);
  return { conflicts, activeMinutes, totalCost, freeSlots, load: activeMinutes >= 600 ? 'high' : activeMinutes >= 420 ? 'medium' : 'light' };
}
