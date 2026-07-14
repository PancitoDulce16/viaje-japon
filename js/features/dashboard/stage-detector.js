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
 * Always goes through window.TimeUtils for date math — never raw
 * `new Date(dateString)` arithmetic (see CLAUDE.md's import-rules /
 * known-landmines notes on 'YYYY-MM-DD' off-by-one bugs).
 */

const PREPARING_WINDOW_DAYS = 14;
const REMEMBERING_WINDOW_DAYS = 30;

/**
 * @param {object|null} trip - the active trip (TripsManager.currentTrip shape)
 * @returns {'dreaming'|'planning'|'preparing'|'traveling'|'remembering'|'lookingBack'}
 */
export function detectJourneyStage(trip) {
  if (!trip?.info?.dateStart || !trip?.info?.dateEnd) {
    return 'dreaming'; // no trip yet, or a trip with no dates committed
  }

  const today = new Date();
  const daysUntilStart = window.TimeUtils.daysBetween(today, trip.info.dateStart);
  const daysSinceEnd = window.TimeUtils.daysBetween(trip.info.dateEnd, today);

  if (daysUntilStart > PREPARING_WINDOW_DAYS) return 'planning';
  if (daysUntilStart > 0) return 'preparing';
  if (daysSinceEnd <= 0) return 'traveling'; // today falls within [dateStart, dateEnd]
  if (daysSinceEnd <= REMEMBERING_WINDOW_DAYS) return 'remembering';
  return 'lookingBack';
}

/**
 * Helper the hero-moment renderer needs alongside the stage itself.
 */
export function getJourneyMath(trip) {
  if (!trip?.info?.dateStart || !trip?.info?.dateEnd) return null;

  const today = new Date();
  return {
    daysUntilStart: window.TimeUtils.daysBetween(today, trip.info.dateStart),
    daysSinceEnd: window.TimeUtils.daysBetween(trip.info.dateEnd, today),
    dayOfTrip: window.TimeUtils.daysBetween(trip.info.dateStart, today) + 1,
    totalDays: window.TimeUtils.daysBetween(trip.info.dateStart, trip.info.dateEnd) + 1
  };
}
