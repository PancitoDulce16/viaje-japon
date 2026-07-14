/**
 * 🌸 HERO MOMENT — Dashboard Experience, slice 1
 *
 * The ONE primary visual focal point of the Dashboard (DESIGN principle
 * added at approval: "one primary moment, not competing cards"). Renders
 * a single illustrated card whose headline is the one thing the Dashboard
 * says before anything else, changing with the journey stage.
 *
 * Illustration note: this slice ships with ONE real Nano Banana
 * illustration (images/illustrations/generated/cities/tokyo-skyline-day-sakura.png),
 * reused across stages with CSS-level mood shifts (brighter for
 * Preparing, desaturated + slower for Remembering) rather than a
 * dedicated generation per stage/city. That's an intentional slice-1
 * scope decision, not a finished art set — see experiences/dashboard.md.
 */

import { detectJourneyStage, getJourneyMath } from './stage-detector.js';

const HERO_IMAGE = '/images/illustrations/generated/cities/tokyo-skyline-day-sakura.png';

function buildContent(trip, stage, math) {
  const destination = trip?.info?.destination || 'Japón';
  const tripName = trip?.info?.name || 'tu viaje';

  switch (stage) {
    case 'dreaming':
      return {
        headline: 'Tu próxima aventura a Japón empieza aquí',
        subtext: 'Todavía no tienes un viaje activo — cuando quieras, lo armamos juntos.',
        cta: { label: '+ Crear tu primer viaje', action: 'TripsManager.showCreateTripModal()' }
      };
    case 'planning':
      return {
        headline: `${destination}: faltan ${math.daysUntilStart} días`,
        subtext: `${tripName} todavía se está tomando forma.`,
        cta: { label: 'Seguir planeando →', action: "window.DashboardApp?.switchTab('itinerary')" }
      };
    case 'preparing':
      return {
        headline: `Tu aventura a Japón empieza en ${math.daysUntilStart} día${math.daysUntilStart === 1 ? '' : 's'}`,
        subtext: 'Ya casi es hora — revisemos qué falta.',
        cta: { label: 'Ver preparación →', action: "window.DashboardApp?.switchTab('preparation')" }
      };
    case 'traveling':
      return {
        headline: `Día ${math.dayOfTrip} en ${destination}`,
        subtext: `${math.dayOfTrip} de ${math.totalDays} — así va tu viaje.`,
        cta: { label: 'Ver itinerario de hoy →', action: "window.DashboardApp?.switchTab('itinerary')" }
      };
    case 'remembering':
      return {
        headline: `Tu viaje por ${destination}`,
        subtext: `Volviste hace ${math.daysSinceEnd} día${math.daysSinceEnd === 1 ? '' : 's'} — todavía fresco.`,
        cta: { label: 'Revivir el viaje →', action: "window.DashboardApp?.switchTab('journal')" }
      };
    case 'lookingBack':
    default:
      return {
        headline: `Tu viaje por ${destination}`,
        subtext: `${window.TimeUtils?.formatDate(trip.info.dateStart) || ''} — ${window.TimeUtils?.formatDate(trip.info.dateEnd) || ''}`,
        cta: { label: 'Ver recuerdos →', action: "window.DashboardApp?.switchTab('journal')" }
      };
  }
}

/**
 * @param {object|null} trip - TripsManager.currentTrip, or null/undefined for the empty state
 * @returns {string} HTML for the hero-moment card
 */
export function renderHeroMoment(trip) {
  const stage = detectJourneyStage(trip);
  const math = getJourneyMath(trip);
  const { headline, subtext, cta } = buildContent(trip, stage, math);

  const hasArt = stage !== 'dreaming'; // empty state gets its own calm treatment, no city art for a trip that doesn't exist yet

  return `
    <section class="hero-moment hero-moment--${stage}" aria-label="Estado de tu viaje">
      ${hasArt ? `
        <img class="hero-moment__art" src="${HERO_IMAGE}" alt="" aria-hidden="true">
        <div class="hero-moment__scrim" aria-hidden="true"></div>
      ` : `
        <div class="hero-moment__empty-art" aria-hidden="true"></div>
      `}
      <div class="hero-moment__content">
        <h2 class="hero-moment__headline">${headline}</h2>
        <p class="hero-moment__subtext">${subtext}</p>
        ${cta ? `<button class="hero-moment__cta" onclick="${cta.action}">${cta.label}</button>` : ''}
      </div>
    </section>
  `;
}
