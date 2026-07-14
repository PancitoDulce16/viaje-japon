/**
 * 📡 DASHBOARD DATA — Dashboard Experience, slice 3
 *
 * The one place that knows which real Firestore documents feed the
 * Dashboard's progressive content. progressive-content.js stays a pure
 * renderer (data in, HTML out); this module is the only thing that
 * talks to Firestore for dashboard purposes. Fetches only what the
 * current stage actually needs — no speculative reads.
 *
 * No mock data, ever. If a real document doesn't exist yet, the
 * relevant field is simply omitted — progressive-content.js's own
 * empty-state fallbacks (already built in slice 2) handle the rest.
 */

import { db } from '../../core/firebase-config.js';
import { doc, getDoc } from 'firebase/firestore';

async function safeGetDoc(path, docId) {
  try {
    const snap = await getDoc(doc(db, path, docId));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error(`❌ Dashboard data: error reading ${path}/${docId}`, error);
    return null;
  }
}

/**
 * @param {string} tripId
 * @param {'dreaming'|'planning'|'preparing'|'traveling'|'remembering'|'lookingBack'} stage
 * @param {object} trip - TripsManager.currentTrip, for the budget estimate calc
 * @param {object|null} [itineraryDoc] - already-fetched itinerary doc, if the
 *   caller fetched it for another reason (see trips-manager.js's
 *   itineraryLoaded dispatch) — avoids a redundant second read.
 * @returns {Promise<object>} data shaped for progressive-content.js
 */
export async function fetchDashboardData(tripId, stage, trip, itineraryDoc = undefined) {
  if (!tripId) return {};

  if (stage === 'preparing') {
    const [reservationsDoc, packingDoc] = await Promise.all([
      safeGetDoc(`trips/${tripId}/data`, 'reservations'),
      safeGetDoc(`trips/${tripId}/data`, 'packing'),
    ]);

    const items = packingDoc?.items ?? [];

    return {
      reservations: (reservationsDoc?.reservations ?? []).slice(0, 3),
      packing: { checked: items.filter(i => i.checked).length, total: items.length },
      budget: budgetSummary(trip),
      travelReadiness: travelReadiness(trip),
    };
  }

  if (stage === 'traveling') {
    const itinDoc = itineraryDoc !== undefined ? itineraryDoc : await safeGetDoc(`trips/${tripId}/data`, 'itinerary');
    const days = itinDoc?.days ?? [];
    const todayISO = window.TimeUtils.toISODate(new Date());
    const todayDay = days.find(d => d.date === todayISO);

    const todayActivities = (todayDay?.activities ?? []).map(a => ({
      time: a.time || '—',
      duration: a.duration || '',
      title: a.title || a.name || 'Actividad',
      sub: a.desc || a.location || a.station || '',
    }));

    return { todayActivities };
    // No IC-card/Suica balance data exists anywhere in the app yet (confirmed
    // during the Train Pass object audit) — deliberately not populated here
    // rather than inventing a number. progressive-content.js's own default
    // ('—') already handles this honestly.
  }

  if (stage === 'remembering' || stage === 'lookingBack') {
    const itinDoc = itineraryDoc !== undefined ? itineraryDoc : await safeGetDoc(`trips/${tripId}/data`, 'itinerary');
    const days = itinDoc?.days ?? [];
    const citiesVisited = new Set(days.map(d => d.location || d.city).filter(Boolean)).size;

    return {
      stats: {
        daysExplored: days.length ? `${days.length} de ${days.length}` : '—',
        citiesVisited: citiesVisited || '—',
      }
    };
  }

  return {};
}

/**
 * Reuses the exact same estimate formula trips-manager.js's retired
 * loadTripStatistics() used (¥15,000/día/persona) — extension, not a
 * second independent guess at the number.
 */
function budgetSummary(trip) {
  if (!trip?.info?.dateStart || !trip?.info?.dateEnd) return null;

  const tripDays = window.TimeUtils.daysBetween(trip.info.dateStart, trip.info.dateEnd) + 1;
  const members = trip.members?.length || 1;
  const estimatedBudget = tripDays * 15000 * members;
  const spent = (trip.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);

  return {
    spent,
    estimated: estimatedBudget,
    progress: estimatedBudget > 0 ? Math.min(100, (spent / estimatedBudget) * 100) : 0,
  };
}

/**
 * Flight/accommodation booking status — this was previously shown in the
 * old stat-card grid ("Reservas: N/2 vuelos, N hoteles") and is preserved
 * here rather than dropped, reusing the exact same trip.flights/
 * trip.accommodations fields.
 */
function travelReadiness(trip) {
  if (!trip) return null;

  const flightsBooked =
    (trip.flights?.outbound?.flightNumber ? 1 : 0) +
    (trip.flights?.return?.flightNumber ? 1 : 0);
  const accommodationsCount = trip.accommodations?.length || 0;

  return { flightsBooked, accommodationsCount, allReady: flightsBooked === 2 && accommodationsCount > 0 };
}
