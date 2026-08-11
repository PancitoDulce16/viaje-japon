import { auth, db } from '../../core/firebase-config.js';
import {
  collection, doc, getAggregateFromServer, getCountFromServer, getDoc, getDocs,
  limit, orderBy, query, sum, where
} from 'firebase/firestore';
import { calculateTripCountdown, summarizeItinerary } from './dashboard-summary.js';
import { calculateBalances } from '../budget/expense-split-engine.js';

async function optional(work, fallback, label) {
  try { return await work(); }
  catch (error) { console.warn(`Dashboard: no se pudo cargar ${label}`, error); return fallback; }
}

const rows = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

export async function fetchDashboardData(tripId, _stage, trip, itineraryDoc = undefined) {
  if (!tripId) return {};
  const itineraryPromise = itineraryDoc !== undefined
    ? Promise.resolve(itineraryDoc)
    : optional(async () => { const snap = await getDoc(doc(db, `trips/${tripId}/data/itinerary`)); return snap.exists() ? snap.data() : null; }, null, 'itinerario');
  const budgetPromise = optional(async () => { const snap = await getDoc(doc(db, `trips/${tripId}/budget/general`)); return snap.exists() ? snap.data() : null; }, null, 'presupuesto');

  const [itinerary, budget] = await Promise.all([itineraryPromise, budgetPromise]);
  const baseCurrency = budget?.currency || 'CRC';
  const expensesRef = collection(db, `trips/${tripId}/expenses`);
  const tasksRef = collection(db, `trips/${tripId}/tasks`);
  const packingRef = collection(db, `trips/${tripId}/packingItems`);
  const reservationsRef = collection(db, `trips/${tripId}/reservations`);

  const [spentAggregate, recentExpenses, pendingCount, upcomingTasks, packingTotal, packingPacked, recentImages, legacyPacking, nextReservations, pendingReservations, missingDocuments,splitExpenses,settlements,importantAlerts] = await Promise.all([
    optional(() => getAggregateFromServer(query(expensesRef, where('baseCurrency', '==', baseCurrency)), { spent: sum('convertedAmountMinor') }), null, 'total gastado'),
    optional(() => getDocs(query(expensesRef, orderBy('date', 'desc'), limit(3))).then(rows), [], 'gastos recientes'),
    optional(() => getCountFromServer(query(tasksRef, where('completed', '==', false))).then((snap) => snap.data().count), 0, 'conteo de pendientes'),
    optional(() => getDocs(query(tasksRef, where('completed', '==', false), orderBy('dueDate', 'asc'), limit(5))).then(rows), [], 'tareas próximas'),
    optional(() => getCountFromServer(packingRef).then((snap) => snap.data().count), 0, 'conteo de equipaje'),
    optional(() => getCountFromServer(query(packingRef, where('packed', '==', true))).then((snap) => snap.data().count), 0, 'equipaje empacado'),
    optional(() => getDocs(query(collection(db, `trips/${tripId}/images`), orderBy('createdAt', 'desc'), limit(4))).then(rows), [], 'galería'),
    optional(async () => { const snap = await getDoc(doc(db, `trips/${tripId}/data/packing`)); return snap.exists() ? snap.data()?.items || [] : []; }, [], 'equipaje anterior'),
    optional(() => getDocs(query(reservationsRef, where('startAt', '>=', new Date().toISOString().slice(0, 16)), orderBy('startAt', 'asc'), limit(1))).then(rows), [], 'próxima reservación'),
    optional(() => getCountFromServer(query(reservationsRef, where('status', '==', 'Pendiente'))).then((snap) => snap.data().count), 0, 'reservaciones pendientes'),
    optional(() => getCountFromServer(query(reservationsRef, where('requiresDocument', '==', true), where('documentCount', '==', 0))).then((snap) => snap.data().count), 0, 'documentos faltantes'),
    optional(() => getDocs(query(expensesRef,where('split.enabled','==',true))).then(rows), [], 'gastos divididos'),
    optional(() => getDocs(query(collection(db,`trips/${tripId}/settlements`),where('status','==','confirmed'))).then(rows), [], 'liquidaciones'),
    optional(() => getDocs(query(collection(db,`users/${auth.currentUser.uid}/notifications`),where('read','==',false),orderBy('createdAt','desc'),limit(2))).then(rows), [], 'alertas importantes')
  ]);

  const legacyItems = Array.isArray(legacyPacking) ? legacyPacking : Object.values(legacyPacking || {}).flat();
  const packing = packingTotal
    ? { total: packingTotal, packed: packingPacked }
    : { total: legacyItems.length, packed: legacyItems.filter((item) => item.checked).length, legacy: legacyItems.length > 0 };
  packing.pending = packing.total - packing.packed;
  packing.percent = packing.total ? Math.round(packing.packed / packing.total * 100) : 0;
  const spentMinor = spentAggregate?.data()?.spent || 0;
  const budgetMinor = budget?.amountMinor || 0;
  const itinerarySummary = summarizeItinerary(itinerary?.days || []);
  const personalBalance=calculateBalances(splitExpenses,settlements).balances[auth.currentUser?.uid]||0;
  const nextCity = itinerarySummary.next?.city
    || String(itinerarySummary.next?.location || trip?.info?.destination || 'Tokio').split(/[·,]/)[0].trim();
  const weather = itinerarySummary.next?.weather || await optional(async () => {
    if (typeof window === 'undefined' || !window.AppUtils?.fetchWeather || !nextCity) return null;
    return window.AppUtils.fetchWeather(nextCity);
  }, null, 'clima de la próxima parada');

  return {
    trip: {
      name: trip?.info?.name || 'Viaje sin nombre', destination: trip?.info?.destination || 'Japón',
      dateStart: trip?.info?.dateStart || '', dateEnd: trip?.info?.dateEnd || '',
      countdown: calculateTripCountdown(trip?.info?.dateStart, trip?.info?.dateEnd)
    },
    itinerary: itinerarySummary,
    budget: {
      currency: baseCurrency, budgetMinor, spentMinor, availableMinor: budgetMinor - spentMinor,
      percentUsed: budgetMinor ? spentMinor / budgetMinor * 100 : 0, recent: recentExpenses
    },
    tasks: { pendingCount, upcoming: upcomingTasks },
    packing,
    images: recentImages,
    reservations: { next: nextReservations[0] || null, pendingCount: pendingReservations, missingDocuments },
    personalBalance: { netMinor:personalBalance,toPayMinor:Math.max(0,-personalBalance),toReceiveMinor:Math.max(0,personalBalance),currency:baseCurrency },
    importantAlerts,
    weather
  };
}
