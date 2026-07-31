// Modelo geográfico compartido entre el generador y la vista del itinerario.
// No consulta APIs: produce una estimación estable y explicable con las coordenadas disponibles.

const WALK_MAX_KM = 1.2;
const LOCAL_TRANSIT_MAX_KM = 12;
const STEPS_PER_KM = 1300;

function coordinatesOf(item) {
  const source = item?.coordinates || item?.location || item;
  if (source?.lat == null && source?.latitude == null) return null;
  if (source?.lng == null && source?.lon == null && source?.longitude == null) return null;
  const lat = Number(source?.lat ?? source?.latitude);
  const lng = Number(source?.lng ?? source?.lon ?? source?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function distanceKm(from, to) {
  const a = coordinatesOf(from);
  const b = coordinatesOf(to);
  if (!a || !b) return null;
  const radians = degrees => degrees * Math.PI / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const haversine = Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function transportFor(distance) {
  if (distance === null) return { mode: 'unknown', label: 'Traslado por confirmar', icon: '↕', minutes: null, transfers: null };
  if (distance <= WALK_MAX_KM) return { mode: 'walk', label: 'Caminando', icon: '🚶', minutes: Math.max(2, Math.ceil(distance * 12)), transfers: 0 };
  if (distance <= LOCAL_TRANSIT_MAX_KM) return { mode: 'metro', label: 'Metro / tren local', icon: '🚇', minutes: Math.ceil(distance * 3 + 10), transfers: distance > 6 ? 1 : 0 };
  return { mode: 'rail', label: 'Tren interurbano', icon: '🚄', minutes: Math.ceil(distance * 2 + 18), transfers: distance > 35 ? 1 : 0 };
}

function stopFrom(item, type, fallbackName) {
  return {
    id: item?.id || `${type}-${fallbackName}`,
    type,
    name: item?.title || item?.name || fallbackName,
    area: item?.area || item?.neighborhood || item?.station || null,
    city: item?.city || item?.cityName || null,
    coordinates: coordinatesOf(item)
  };
}

function primaryArea(activities) {
  const counts = new Map();
  activities.forEach(activity => {
    const area = activity.area || activity.neighborhood || activity.station;
    if (area) counts.set(area, (counts.get(area) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

export function analyzeDayExertion(activities = [], metrics = {}, travelerCapacity = null) {
  const nonMeals = activities.filter(activity => !activity.isMeal);
  const energyTotal = nonMeals.reduce((sum, activity) => sum + Number(activity.energyCost ?? activity.energy_cost ?? 3), 0);
  const activeMinutes = nonMeals.reduce((sum, activity) => sum + Number(activity.duration || 60), 0);
  const rawScore = (
    Number(metrics.estimatedSteps || 0) / 350 +
    energyTotal * 2.2 +
    activeMinutes / 90
  );
  const score = Math.min(100, Math.round(rawScore * Number(travelerCapacity?.exertionMultiplier || 1)));
  const level = score >= 68 ? 'intense' : score >= 42 ? 'balanced' : 'relaxed';
  const labels = { intense: 'Intenso', balanced: 'Balanceado', relaxed: 'Relax' };
  const reasons = [];
  if (Number(metrics.estimatedSteps || 0) >= 12000) reasons.push(`${Number(metrics.estimatedSteps).toLocaleString()} pasos estimados`);
  if (energyTotal >= 24) reasons.push('varias visitas físicamente exigentes');
  if (activeMinutes >= 420) reasons.push(`${Math.round(activeMinutes / 60)} h de actividades`);
  return {
    score, level, label: labels[level], energyTotal, activeMinutes, reasons,
    travelerLabel: travelerCapacity?.needsAdaptation ? travelerCapacity.label : null,
    travelerNote: travelerCapacity?.needsAdaptation ? travelerCapacity.note : null,
    recommendation: level === 'intense'
      ? 'Deja una pausa larga después del almuerzo y usa transporte para el regreso al hotel.'
      : level === 'balanced'
        ? 'El ritmo combina movimiento y pausas sin dominar toda la jornada.'
        : 'Día ligero, útil para recuperarte o añadir una visita opcional cercana.'
  };
}

export function buildDayRouteFlow(day, hotel = null, options = {}) {
  const activities = (day?.activities || []).filter(Boolean);
  const hotelCoords = coordinatesOf(hotel);
  const includeHotelReturn = options.includeHotelReturn !== false && hotelCoords;
  const stops = [];
  if (hotelCoords) stops.push(stopFrom(hotel, 'hotel-start', hotel.name || 'Hotel'));
  activities.forEach(activity => stops.push(stopFrom(activity, activity.isMeal ? 'meal' : 'activity', 'Parada')));
  if (includeHotelReturn && activities.length) stops.push(stopFrom(hotel, 'hotel-end', hotel.name || 'Hotel'));

  const legs = [];
  for (let index = 0; index < stops.length - 1; index++) {
    const from = stops[index];
    const to = stops[index + 1];
    const distance = distanceKm(from, to);
    legs.push({ from: from.id, to: to.id, distanceKm: distance === null ? null : Math.round(distance * 10) / 10, ...transportFor(distance) });
  }

  const knownLegs = legs.filter(leg => leg.distanceKm !== null);
  const walkingLegs = knownLegs.filter(leg => leg.mode === 'walk');
  const transitLegs = knownLegs.filter(leg => leg.mode !== 'walk');
  const totalDistanceKm = knownLegs.reduce((sum, leg) => sum + leg.distanceKm, 0);
  const walkingKm = walkingLegs.reduce((sum, leg) => sum + leg.distanceKm, 0);
  const walkingMinutes = walkingLegs.reduce((sum, leg) => sum + (leg.minutes || 0), 0);
  const transportMinutes = transitLegs.reduce((sum, leg) => sum + (leg.minutes || 0), 0);
  const warnings = [];
  if (walkingKm > 8) warnings.push({ type: 'walking', severity: 'warning', message: `Caminata estimada alta: ${walkingKm.toFixed(1)} km.` });
  const longLeg = knownLegs.find(leg => leg.distanceKm > 25);
  if (longLeg) warnings.push({ type: 'long-transfer', severity: 'warning', message: `Hay un traslado largo de ${longLeg.distanceKm.toFixed(1)} km.` });
  if (activities.length > 8) warnings.push({ type: 'overload', severity: 'warning', message: `El día contiene ${activities.length} paradas.` });
  const missingCoordinates = stops.filter(stop => !stop.coordinates).length;
  if (missingCoordinates) warnings.push({ type: 'missing-location', severity: 'info', message: `${missingCoordinates} parada(s) necesitan ubicación para afinar la ruta.` });

  const mainArea = primaryArea(activities);
  const modes = [...new Set(knownLegs.map(leg => leg.mode))];
  const metrics = {
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    walkingKm: Math.round(walkingKm * 10) / 10,
    estimatedSteps: Math.round(walkingKm * STEPS_PER_KM / 100) * 100,
    walkingMinutes,
    transportMinutes,
    transfers: transitLegs.reduce((sum, leg) => sum + (leg.transfers || 0), 0),
    modes
  };
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    primaryArea: mainArea,
    stops,
    legs,
    metrics,
    exertion: analyzeDayExertion(activities, metrics, day?.travelerCapacity),
    warnings,
    explanation: mainArea
      ? `Agrupamos el día alrededor de ${mainArea} y ordenamos las paradas para reducir retrocesos${hotelCoords ? ' desde tu hotel' : ''}.`
      : `Ordenamos las paradas por proximidad${hotelCoords ? ' desde tu hotel' : ''}.`
  };
}

export function annotateTripRhythm(days = []) {
  for (let index = 1; index < days.length; index++) {
    const previous = days[index - 1]?.routeFlow?.exertion;
    const current = days[index]?.routeFlow?.exertion;
    if (previous?.level === 'intense' && current?.level === 'intense') {
      const warning = { type: 'consecutive-intense-days', severity: 'warning', message: 'Dos jornadas intensas seguidas: conviene aligerar una de ellas.' };
      days[index - 1].routeFlow.warnings.push(warning);
      days[index].routeFlow.warnings.push(warning);
      previous.consecutiveWarning = true;
      current.consecutiveWarning = true;
    }
  }
  return days;
}

export { coordinatesOf, distanceKm, transportFor };
