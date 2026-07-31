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
