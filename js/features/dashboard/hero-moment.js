/**
 * 🌸 HERO MOMENT — Dashboard Experience, slice 1
 *
 * The ONE primary visual focal point of the Dashboard (DESIGN principle
 * added at approval: "one primary moment, not competing cards"). Renders
 * a single illustrated card whose headline is the one thing the Dashboard
 * says before anything else, changing with the journey stage.
 *
 * Illustration note: this slice ships with ONE real Nano Banana
 * illustration (images/illustrations/generated/cities/tokyo-skyline-day-sakura.jpg),
 * reused across stages with CSS-level mood shifts (brighter for
 * Preparing, desaturated + slower for Remembering) rather than a
 * dedicated generation per stage/city. That's an intentional slice-1
 * scope decision, not a finished art set — see experiences/dashboard.md.
 *
 * File format note (polish pass): shipped as .jpg, not the original
 * Nano Banana .png — re-encoded via .NET's built-in JPEG encoder
 * (no new dependency), 1.9MB → 205KB (89% smaller) with no visible
 * quality loss for a photographic-style illustration like this one.
 * Future generated illustrations should get the same treatment before
 * landing in images/illustrations/generated/.
 */

import { detectJourneyStage, getJourneyMath } from './stage-detector.js';

// 🌸 Saludo según hora + nombre (idea #25). Japonés + español, sin emoji.
// Defensivo: si no hay usuario, el saludo funciona igual sin nombre.
function greetingLine() {
  const h = new Date().getHours();
  const morning = h >= 5 && h < 11;
  const afternoon = h >= 11 && h < 18;
  const jp = morning ? 'おはよう' : afternoon ? 'こんにちは' : 'こんばんは';
  const es = morning ? 'Buenos días' : afternoon ? 'Buenas tardes' : 'Buenas noches';
  const u = window.AuthHandler?.currentUser;
  let name = '';
  if (u) {
    if (u.displayName) {
      name = u.displayName.trim().split(/\s+/)[0]; // primer nombre
    } else if (u.email) {
      name = u.email.split('@')[0].split(/[._+]/)[0]; // prefijo limpio del correo
    }
    if (name) name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  return `${jp} · ${es}${name ? ', ' + name : ''}`;
}

/* Panorama pair (Nano Banana, 2026-07-16): the night version was generated
   FROM the day image ("same composition, make it night"), so both line up
   pixel-perfect and the Kawaii↔Ninja theme toggle crossfades between them
   as if the same scene falls into night. WebP, 57KB + 97KB. */
const HERO_ART_DAY = '/images/illustrations/generated/panorama/japan-fuji-panorama-day.webp';
const HERO_ART_NIGHT = '/images/illustrations/generated/panorama/japan-fuji-panorama-night.webp';

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
        eyebrow: 'Tu aventura a',
        headline: destination,
        subtext: `${tripName} todavía se está tomando forma.`,
        countdown: math.daysUntilStart,
        cta: { label: 'Seguir planeando →', action: "window.DashboardApp?.switchTab('itinerary')" }
      };
    case 'preparing':
      return {
        eyebrow: 'Ya casi es hora…',
        headline: destination,
        subtext: 'Revisemos qué falta antes de salir.',
        countdown: math.daysUntilStart,
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
  const { eyebrow, headline, subtext, cta, countdown } = buildContent(trip, stage, math);

  const hasArt = stage !== 'dreaming'; // empty state gets its own calm treatment, no city art for a trip that doesn't exist yet
  const hasCountdown = Number.isFinite(countdown) && countdown > 0;

  // Sakura petals drifting over the art (mockup parity). Pure CSS animation;
  // hidden entirely under prefers-reduced-motion (see dashboard-hero.css).
  const petals = hasArt ? `
    <div class="hero-moment__petals" aria-hidden="true">
      ${Array.from({ length: 12 }, () => {
        const size = (7 + Math.random() * 7).toFixed(1);
        return `<span class="hero-moment__petal" style="left:${(Math.random() * 100).toFixed(1)}%; width:${size}px; height:${size}px; animation-duration:${(8 + Math.random() * 8).toFixed(1)}s; animation-delay:-${(Math.random() * 16).toFixed(1)}s; opacity:${(0.45 + Math.random() * 0.45).toFixed(2)};"></span>`;
      }).join('')}
    </div>
  ` : '';

  const ctaHtml = cta ? `<button class="hero-moment__cta" onclick="${cta.action}">${cta.label}</button>` : '';

  return `
    <section class="hero-moment hero-moment--${stage}" aria-label="Estado de tu viaje">
      ${hasArt ? `
        <img class="hero-moment__art hero-moment__art--day" src="${HERO_ART_DAY}" alt="" aria-hidden="true">
        <img class="hero-moment__art hero-moment__art--night" src="${HERO_ART_NIGHT}" alt="" aria-hidden="true" loading="lazy">
        <div class="hero-moment__scrim" aria-hidden="true"></div>
      ` : `
        <div class="hero-moment__empty-art" aria-hidden="true"></div>
      `}
      ${petals}
      <div class="hero-moment__content">
        <span class="hero-moment__greeting">${greetingLine()}</span>
        ${eyebrow ? `<span class="hero-moment__eyebrow" aria-hidden="true">${eyebrow}</span>` : ''}
        <h2 class="hero-moment__headline">${headline}</h2>
        ${hasCountdown ? `
          <div class="hero-moment__jp" aria-hidden="true">日本への冒険</div>
          <div class="hero-moment__countdown" role="text" aria-label="Faltan ${countdown} día${countdown === 1 ? '' : 's'}">
            <span class="hero-moment__countdown-tag" aria-hidden="true">出発まで</span>
            <span class="hero-moment__countdown-label">Faltan</span>
            <span class="hero-moment__countdown-num">${countdown}</span>
            <span class="hero-moment__countdown-days">día${countdown === 1 ? '' : 's'}</span>
            <span class="hero-moment__countdown-stamp" aria-hidden="true">日本</span>
            ${ctaHtml}
          </div>
          <p class="hero-moment__subtext">${subtext}</p>
        ` : `
          <p class="hero-moment__subtext">${subtext}</p>
          ${ctaHtml}
        `}
      </div>
      ${hasArt && hasCountdown ? `<div class="hero-moment__quote" aria-hidden="true">✦ “Cada día nos acerca más a Japón” <span>♥</span></div>` : ''}
    </section>
  `;
}
