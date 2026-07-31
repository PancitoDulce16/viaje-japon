// Inteligencia de viaje explicable y sin dependencias de UI.
import { isProtectedActivity } from './day-adaptation.js';

const minutes = value => {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};
const duration = activity => Number(activity.durationMinutes || activity.duration || 60);
const price = activity => Number(activity.cost || activity.price || 0);
const name = activity => activity.title || activity.name || 'Actividad';

export function analyzeDayFeasibility(day) {
  const activities = [...(day.activities || [])].sort((a, b) => (minutes(a.time) ?? 9999) - (minutes(b.time) ?? 9999));
  const issues = [];
  let scheduled = 0;
  activities.forEach((activity, index) => {
    const start = minutes(activity.time);
    if (start !== null) scheduled += duration(activity);
    const next = activities[index + 1];
    const nextStart = minutes(next?.time);
    if (start !== null && nextStart !== null && start + duration(activity) > nextStart) {
      issues.push({ severity: 'high', type: 'overlap', message: `${name(activity)} se cruza con ${name(next)}.` });
    }
    if (activity.closed || activity.isClosed) issues.push({ severity: 'high', type: 'closed', message: `${name(activity)} figura cerrado.` });
    if (activity.lastEntry && start !== null && start > minutes(activity.lastEntry)) {
      issues.push({ severity: 'high', type: 'last-entry', message: `${name(activity)} queda después de la última entrada.` });
    }
  });
  if (activities.length > 6 || scheduled > 600) issues.push({ severity: 'medium', type: 'density', message: 'El día tiene poco espacio para pausas e imprevistos.' });
  if ((day.routeFlow?.totalTravelMinutes || day.travelMinutes || 0) > 180) issues.push({ severity: 'medium', type: 'travel', message: 'Hay más de tres horas de desplazamientos.' });
  const lastFinish = activities.reduce((latest, activity) => Math.max(latest, (minutes(activity.time) ?? 0) + duration(activity)), 0);
  const lastTrain = minutes(day.lastTrainTime || day.transportPlan?.lastTrain);
  if (lastTrain !== null && lastFinish > lastTrain - 20) issues.push({ severity: 'high', type: 'last-train', message: 'El cierre del día no deja margen suficiente para el último tren.' });
  if (day.hasLuggage && (day.transferCount || day.transportPlan?.transfers || 0) > 2) issues.push({ severity: 'medium', type: 'luggage', message: 'Demasiados transbordos para viajar con equipaje.' });
  const score = Math.max(0, 100 - issues.reduce((sum, issue) => sum + (issue.severity === 'high' ? 25 : 12), 0));
  return { score, status: score >= 85 ? 'comfortable' : score >= 60 ? 'tight' : 'impossible', issues };
}

export function explainDayOptimization(day) {
  const flow = day.routeFlow || {};
  const saved = Number(flow.savedMinutes || day.optimization?.savedMinutes || 0);
  const areas = [...new Set((day.activities || []).map(a => a.area || a.neighborhood).filter(Boolean))];
  if (saved) return { savedMinutes: saved, message: `Este orden evita retrocesos y ahorra aproximadamente ${saved} minutos.` };
  if (areas.length === 1) return { savedMinutes: 0, message: `El día se mantiene alrededor de ${areas[0]} para caminar menos.` };
  if (areas.length > 1) return { savedMinutes: 0, message: `La ruta conecta ${areas.slice(0, 3).join(' → ')} sin volver innecesariamente sobre tus pasos.` };
  return { savedMinutes: 0, message: 'El orden prioriza horarios, reservas y un ritmo respirable.' };
}

export function buildPlanB(day) {
  const replacements = [];
  const activities = (day.activities || []).map(activity => {
    if (isProtectedActivity(activity) || activity.isIndoor || activity.indoor) return { ...activity };
    const alternative = (activity.alternatives || []).find(item => item.indoor || item.isIndoor);
    if (!alternative) return { ...activity };
    replacements.push({ from: name(activity), to: alternative.name || alternative.title });
    const replacementName = alternative.title || alternative.name || name(activity);
    return { ...activity, ...alternative, title: replacementName, name: replacementName, id: `${activity.id || 'activity'}-plan-b`, originalActivity: { ...activity }, planBReplacement: true };
  });
  return { ...day, activities, planB: { createdAt: new Date().toISOString(), replacements, reason: 'lluvia-cansancio-cierre' } };
}

export function restorePlanA(day) {
  return {
    ...day,
    activities: (day.activities || []).map(activity => activity.planBReplacement && activity.originalActivity ? activity.originalActivity : activity),
    planB: null
  };
}

export function applyPace(day, pace = 'balanced') {
  const limits = { relaxed: 4, balanced: 6, intense: 8 };
  const source = [...(day.activities || []), ...(day.paceArchive || [])]
    .filter((activity, index, all) => all.findIndex(item => item.id === activity.id) === index);
  const protectedItems = source.filter(isProtectedActivity);
  const movable = source.filter(activity => !isProtectedActivity(activity));
  const keep = Math.max(0, limits[pace] - protectedItems.length);
  const selected = [...protectedItems, ...movable.slice(0, keep)]
    .sort((a, b) => (minutes(a.time) ?? 9999) - (minutes(b.time) ?? 9999));
  return { ...day, activities: selected, pace, paceArchive: movable.slice(keep) };
}

export function analyzeDayBudget(day) {
  const categories = { transport: 0, meals: 0, tickets: 0, shopping: 0 };
  (day.activities || []).forEach(activity => {
    const category = String(activity.category || '').toLowerCase();
    const key = /food|meal|restaurant|comida/.test(category) ? 'meals'
      : /shop|shopping|compras/.test(category) ? 'shopping'
      : /train|transport|bus|ferry|taxi/.test(category) ? 'transport' : 'tickets';
    categories[key] += price(activity);
  });
  categories.transport += Number(day.transferPlan?.cost || day.transportCost || 0);
  const total = Object.values(categories).reduce((sum, value) => sum + value, 0);
  return { categories, total, isHeavy: total > Number(day.budgetLimit || 25000) };
}

const CULTURE = [
  { match: /temple|shrine|templo|santuario/, icon: '⛩️', text: 'Habla bajo, respeta las zonas sin fotografía y sigue el sentido de la visita.' },
  { match: /onsen|ryokan/, icon: '♨️', text: 'Lávate antes de entrar al baño; normalmente la toalla pequeña no entra al agua.' },
  { match: /restaurant|ramen|sushi|food|comida/, icon: '🍜', text: 'Evita perfumes intensos y confirma si el local acepta tarjeta antes de pedir.' },
  { match: /home|house|ryokan|temple/, icon: '👟', text: 'Observa el genkan: si hay desnivel o zapatillas, deja allí los zapatos.' }
];
export function culturalNotesForDay(day) {
  const haystack = (day.activities || []).map(a => `${name(a)} ${a.category || ''}`).join(' ').toLowerCase();
  return CULTURE.filter(note => note.match.test(haystack)).slice(0, 2);
}

export function reservationDocumentsForDay(day, reservations = []) {
  const date = String(day.date || '');
  return reservations.filter(item => !date || String(item.date || '').slice(0, 10) === date.slice(0, 10)).map(item => ({
    id: item.id, name: item.name, time: item.time, confirmation: item.confirmationNumber,
    seat: item.seat, address: item.location || item.address, cancellation: item.cancellationPolicy,
    url: item.url, qr: item.qr || item.qrCode
  }));
}

export function voteOnActivity(day, activityId, voterId, value = 1) {
  return {
    ...day,
    activities: (day.activities || []).map(activity => activity.id !== activityId ? activity : {
      ...activity,
      collaboration: {
        ...(activity.collaboration || {}),
        votes: { ...(activity.collaboration?.votes || {}), [voterId || 'guest']: value }
      }
    })
  };
}

export function buildOfflineSummary(itinerary) {
  return (itinerary.days || []).map(day => ({
    day: day.day, date: day.date, city: day.city,
    activities: (day.activities || []).map(activity => ({
      time: activity.time, name: name(activity),
      address: activity.address || activity.location || '',
      japaneseAddress: activity.japaneseAddress || activity.addressJa || ''
    }))
  }));
}

export function addDayComment(day, author, text) {
  const clean = String(text || '').trim().slice(0, 500);
  if (!clean) return day;
  return { ...day, collaboration: { ...(day.collaboration || {}), comments: [
    ...(day.collaboration?.comments || []),
    { id: `comment-${Date.now()}`, author: author || 'Viajero', text: clean, createdAt: new Date().toISOString() }
  ] } };
}
