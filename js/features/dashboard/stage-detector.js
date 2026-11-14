/**
 * 🗾 STAGE DETECTOR — Dashboard Experience, slice 1
 *
 * Coarse, trip-level journey stage used ONLY to decide what the
 * Dashboard's one hero moment says. This is deliberately simpler than
 * EXPERIENCE_GUIDELINES.md's full 8-stage lifecycle — "Exploring" and
 * "Discovering" are moment-level distinctions that belong to the
 * Itinerary/Discovery experiences, not something derivable from trip
 * dates alone. The Dashboard only needs to tell Dreaming, Planning,
 * Preparing, Traveling, Remembering, and Looking-back apart.
 *
 * Uses local calendar dates without depending on a global script having
 * finished loading. Date-only strings must never shift through UTC parsing.
 */

import { localDate } from './dashboard-summary.js';

const PREPARING_WINDOW_DAYS = 14;
const REMEMBERING_WINDOW_DAYS = 30;

function tripDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const date = localDate(value);
  return date && date.getFullYear() === Number(value.slice(0, 4)) && date.getMonth() + 1 === Number(value.slice(5, 7)) && date.getDate() === Number(value.slice(8, 10)) ? date : null;
}

const daysBetween = (start, end) => Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000);

/**
 * @param {object|null} trip - the active trip (TripsManager.currentTrip shape)
 * @returns {'dreaming'|'planning'|'preparing'|'traveling'|'remembering'|'lookingBack'}
 */
export function detectJourneyStage(trip, nowValue = new Date()) {
  const math = getJourneyMath(trip, nowValue);
  if (!math) {
    return 'dreaming'; // no trip yet, or a trip with no dates committed
  }

  const { daysUntilStart, daysSinceEnd } = math;

  if (daysUntilStart > PREPARING_WINDOW_DAYS) return 'planning';
  if (daysUntilStart > 0) return 'preparing';
  if (daysSinceEnd <= 0) return 'traveling'; // today falls within [dateStart, dateEnd]
  if (daysSinceEnd <= REMEMBERING_WINDOW_DAYS) return 'remembering';
  return 'lookingBack';
}

/**
 * Helper the hero-moment renderer needs alongside the stage itself.
 */
export function getJourneyMath(trip, nowValue = new Date()) {
  const start = tripDate(trip?.info?.dateStart), end = tripDate(trip?.info?.dateEnd);
  const today = localDate(nowValue);
  if (!start || !end || !today || end < start) return null;
  return {
    daysUntilStart: daysBetween(today, start),
    daysSinceEnd: daysBetween(end, today),
    dayOfTrip: daysBetween(start, today) + 1,
    totalDays: daysBetween(start, end) + 1
  };
}
