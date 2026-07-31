const OUTDOOR = ['nature', 'park', 'garden', 'hiking', 'shrine', 'temple', 'outdoor'];
const INDOOR = ['museum', 'shopping', 'arcade', 'aquarium', 'art', 'market', 'indoor'];
const SHOPPING = ['shopping', 'market', 'souvenir'];

const textOf = activity => `${activity?.category || ''} ${activity?.title || activity?.name || ''} ${(activity?.tags || []).join(' ')}`.toLowerCase();
const hasAny = (activity, words) => words.some(word => textOf(activity).includes(word));
export const isProtectedActivity = activity => Boolean(
  activity?.locked || activity?.isLocked || activity?.isFavorite || activity?.favorite ||
  activity?.reservation || activity?.reservationId || activity?.booking?.required ||
  activity?.bookingDetails?.required || activity?.isMustSee
);

export function adaptDayToWeather(day, weather, candidates = []) {
  const rainy = Boolean(weather?.isRainy || weather?.rainProbability >= 60);
  if (!rainy) return { day: structuredClone(day), changes: [], preserved: [] };
  const copy = structuredClone(day);
  const used = new Set(copy.activities.map(activity => activity.title || activity.name));
  const indoor = candidates.filter(candidate => hasAny(candidate, INDOOR) && !used.has(candidate.title || candidate.name));
  const changes = [], preserved = [];
  copy.activities = copy.activities.map(activity => {
    if (!hasAny(activity, OUTDOOR)) return activity;
    if (isProtectedActivity(activity)) {
      preserved.push(activity.title || activity.name);
      return { ...activity, weatherNote: 'Se mantiene por ser favorito, reserva o actividad bloqueada.' };
    }
    const replacement = indoor.shift();
    if (!replacement) return { ...activity, weatherNote: 'Exterior sin alternativa cercana disponible.' };
    changes.push({ from: activity.title || activity.name, to: replacement.title || replacement.name });
    return { ...replacement, time: activity.time, weatherReplacement: true };
  });
  copy.weatherAdaptation = { type: 'rain', changes, preserved, message: `${changes.length} actividad(es) exterior(es) cambiadas por opciones cubiertas.` };
  return { day: copy, changes, preserved };
}

export function auditMeals(day) {
  const activities = [...(day?.activities || [])].sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
  const meals = activities.filter(activity => activity.isMeal);
  const issues = [];
  if (!meals.length && activities.length >= 3) issues.push('No hay una pausa de comida marcada.');
  for (let index = 1; index < activities.length; index++) {
    const previous = minutesOf(activities[index - 1].time), current = minutesOf(activities[index].time);
    if (previous != null && current != null && current - previous > 300) issues.push('Hay más de cinco horas entre paradas.');
  }
  return { meals: meals.length, issues, featured: meals.at(-1) || null };
}

export function moveShoppingToEnd(day) {
  const copy = structuredClone(day);
  if (copy.isDayTrip) return { day: copy, moved: [] };
  const protectedItems = copy.activities.filter(isProtectedActivity);
  const movable = copy.activities.filter(activity => !isProtectedActivity(activity));
  const regular = movable.filter(activity => !hasAny(activity, SHOPPING));
  const shopping = movable.filter(activity => hasAny(activity, SHOPPING));
  const order = [...regular, ...shopping];
  const timeSlots = movable.map(activity => activity.time);
  order.forEach((activity, index) => { activity.time = timeSlots[index]; });
  copy.activities = [...protectedItems, ...order].sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
  copy.shoppingPlan = shopping.length ? { moved: shopping.map(item => item.title || item.name), message: 'Compras colocadas al final para no cargar bolsas durante las visitas.' } : null;
  return { day: copy, moved: shopping.map(item => item.title || item.name) };
}

export function regenerateScope(day, candidates = [], scope = 'day') {
  const copy = structuredClone(day);
  const protectedItems = copy.activities.filter(isProtectedActivity);
  const shouldReplace = activity => !isProtectedActivity(activity) && (
    scope === 'day' || (scope === 'restaurants' && activity.isMeal) || (scope === 'activity' && activity.regenerateRequested)
  );
  const replaceable = copy.activities.filter(shouldReplace);
  const untouched = copy.activities.filter(activity => !shouldReplace(activity));
  const used = new Set(untouched.map(activity => activity.title || activity.name));
  const pool = candidates.filter(candidate => !used.has(candidate.title || candidate.name));
  const replacements = replaceable.map(original => {
    const index = pool.findIndex(candidate => scope !== 'restaurants' || candidate.isMeal);
    if (index < 0) return original;
    const [next] = pool.splice(index, 1);
    return { ...next, time: original.time, regenerated: true };
  });
  copy.activities = [...untouched, ...replacements].sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
  copy.regenerationLog = { scope, protected: protectedItems.map(item => item.title || item.name), changed: replacements.filter(item => item.regenerated).length };
  return copy;
}

export function analyzeRailPass(days = [], passPrice = 50000) {
  const transfers = days.map(day => day.transferPlan).filter(Boolean);
  const eligibleCost = transfers.reduce((sum, plan) => {
    if (plan.segments?.length) {
      return sum + plan.segments.filter(segment => segment.eligibleForPass).reduce((segmentSum, segment) => segmentSum + Number(segment.cost || 0), 0);
    }
    return sum + (['shinkansen', 'limited-express', 'local-rail'].includes(plan.mode) ? Number(plan.cost || 0) : 0);
  }, 0);
  const savings = eligibleCost - passPrice;
  return {
    eligibleCost, passPrice, savings, worthIt: savings > 2500, transferCount: transfers.length,
    message: savings > 2500 ? `El pase podría ahorrar aproximadamente ¥${savings.toLocaleString()}.` : `Los billetes individuales cuestan aproximadamente ¥${Math.max(0, -savings).toLocaleString()} menos.`
  };
}

export function buildDayNarrative(day, index, totalDays) {
  const isLast = index === totalDays - 1;
  const mood = day.transferPlan?.isTravelDay ? 'En movimiento' :
    day.routeFlow?.exertion?.level === 'intense' ? 'Exploración' :
    isLast ? 'Despedida' : day.isDayTrip ? 'Aventura' : 'A tu ritmo';
  const icons = { 'En movimiento': '🚄', Exploración: '🏃', Despedida: '🎁', Aventura: '📮', 'A tu ritmo': '🍵' };
  return {
    mood, icon: icons[mood], color: day.season?.key || (mood === 'Exploración' ? 'coral' : 'sage'),
    chapter: day.cityChapter || day.city || `Día ${day.day}`,
    memoryPrompt: isLast ? '¿Con qué imagen te despides de Japón?' : '¿Cuál fue el momento que quieres conservar?'
  };
}

export function ensureDayMemory(day) {
  return day.memory || { note: '', photos: [], highlight: '', updatedAt: null };
}

export function analyzeLodgingDay(day) {
  const hotel = day?.hotel || {};
  const text = `${hotel.name || ''} ${hotel.type || ''}`.toLowerCase();
  const isRyokan = text.includes('ryokan') || text.includes('旅館');
  const checkIn = hotel.checkIn || hotel.checkInTime || null;
  const checkOut = hotel.checkOut || hotel.checkOutTime || null;
  return {
    isRyokan, checkIn, checkOut,
    label: isRyokan ? 'Noche de ryokan' : checkIn ? 'Horario del alojamiento' : null,
    note: isRyokan
      ? 'Dejamos margen para onsen, yukata y cena kaiseki; esta noche no necesita más actividades.'
      : checkIn ? `Check-in ${checkIn}${checkOut ? ` · check-out ${checkOut}` : ''}. La ruta reserva margen para el equipaje.` : null
  };
}

export function applyLodgingConstraints(day) {
  const copy = structuredClone(day);
  const lodging = analyzeLodgingDay(copy);
  if (lodging.isRyokan) {
    copy.activities = copy.activities.filter(activity => {
      if (isProtectedActivity(activity)) return true;
      const start = minutesOf(activity.time);
      return start == null || start < 16 * 60;
    });
    copy.lodgingPlan = { type: 'ryokan', protectedEvening: true, message: lodging.note };
  }
  if (copy.lateArrival) {
    copy.activities = copy.activities.filter(isProtectedActivity);
    copy.lodgingPlan = { type: 'late-arrival', protectedEvening: true, message: 'Llegada tardía: dejamos únicamente reservas u obligatorios.' };
  }
  return copy;
}

function minutesOf(value) {
  if (!value || !String(value).includes(':')) return null;
  const [hour, minute] = String(value).split(':').map(Number);
  return Number.isFinite(hour) && Number.isFinite(minute) ? hour * 60 + minute : null;
}
