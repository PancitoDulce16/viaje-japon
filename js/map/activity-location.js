function coordinate(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function activityCoordinates(activity) {
  for (const source of [activity?.coordinates, activity?.location]) {
    const lat = coordinate(Array.isArray(source) ? source[0] : source?.lat ?? source?.latitude);
    const lng = coordinate(Array.isArray(source) ? source[1] : source?.lng ?? source?.longitude);
    if (lat !== null && lng !== null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }
  return null;
}

export function activityDirectionsUrl(activity, fallbackCity = '') {
  const coordinates = activityCoordinates(activity);
  const location = typeof activity?.location === 'string' ? activity.location.trim() : '';
  const title = String(activity?.title || activity?.name || '').trim();
  const city = String(activity?.city || fallbackCity || '').trim();
  const destination = coordinates ? `${coordinates.lat},${coordinates.lng}` : [title, location, city, 'Japan'].filter(Boolean).join(', ');
  if (!coordinates && !title && !location) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export function activityMapFocus(activity, tripId = null) {
  if (!activity) return null;
  return {
    tripId,
    day: activity.dayNumber ?? null,
    activityId: activity.id ?? null,
    title: activity.title || activity.name || 'Actividad',
    coordinates: activityCoordinates(activity),
    location: typeof activity.location === 'string' ? activity.location : null
  };
}
