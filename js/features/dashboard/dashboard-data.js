import { db } from '../../core/firebase-config.js';
import {
  collection, doc, getAggregateFromServer, getCountFromServer, getDoc, getDocs,
  limit, orderBy, query, sum, where
} from 'firebase/firestore';
import { calculateTripCountdown, summarizeItinerary } from './dashboard-summary.js';

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

  const [spentAggregate, recentExpenses, pendingCount, upcomingTasks, packingTotal, packingPacked, recentImages, legacyPacking] = await Promise.all([
    optional(() => getAggregateFromServer(query(expensesRef, where('baseCurrency', '==', baseCurrency)), { spent: sum('convertedAmountMinor') }), null, 'total gastado'),
    optional(() => getDocs(query(expensesRef, orderBy('date', 'desc'), limit(3))).then(rows), [], 'gastos recientes'),
    optional(() => getCountFromServer(query(tasksRef, where('completed', '==', false))).then((snap) => snap.data().count), 0, 'conteo de pendientes'),
    optional(() => getDocs(query(tasksRef, where('completed', '==', false), orderBy('dueDate', 'asc'), limit(5))).then(rows), [], 'tareas próximas'),
    optional(() => getCountFromServer(packingRef).then((snap) => snap.data().count), 0, 'conteo de equipaje'),
    optional(() => getCountFromServer(query(packingRef, where('packed', '==', true))).then((snap) => snap.data().count), 0, 'equipaje empacado'),
    optional(() => getDocs(query(collection(db, `trips/${tripId}/images`), orderBy('createdAt', 'desc'), limit(4))).then(rows), [], 'galería'),
    optional(async () => { const snap = await getDoc(doc(db, `trips/${tripId}/data/packing`)); return snap.exists() ? snap.data()?.items || [] : []; }, [], 'equipaje anterior')
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
    images: recentImages
  };
}
