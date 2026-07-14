/**
 * 📖 PROGRESSIVE CONTENT — Dashboard Experience, slice 2
 *
 * Everything below the one Hero Moment (hero-moment.js). Answers "what
 * should I care about next," in an order that changes with the journey
 * stage — never a grid of equal-weight widgets, one continuous story
 * read top to bottom. Built entirely from the canonical object classes
 * in css/objects.css (ticket-card / travel-card / discovery-card /
 * journal-card) — no new card styles invented for this slice, and the
 * Achievement teaser reuses Achievements.renderMemoryTeaser() rather
 * than a second implementation.
 *
 * Data note: the section-builder functions below take plain data
 * (arrays of activities/reservations/etc.) so they're ready to wire to
 * real trip data later — this slice itself is demonstrated with
 * clearly-labeled representative content in dashboard-hero-preview.html,
 * the same isolated-preview pattern slice 1 used, not real user data.
 * No fabricated personal numbers (budgets, distances) are asserted as
 * fact anywhere here — see SOUL.md's rule against fake data.
 */

import { detectJourneyStage, getJourneyMath } from './stage-detector.js';

function section(label, innerHtml) {
  if (!innerHtml) return '';
  return `
    <div class="dash-section">
      <div class="dash-section__label">${label}</div>
      ${innerHtml}
    </div>
  `;
}

function ticketCard({ time, duration, title, sub, tag }) {
  return `
    <div class="ticket-card">
      <div class="ticket-card__time">
        <div class="ticket-card__t">${time}</div>
        <div class="ticket-card__d">${duration}</div>
      </div>
      <div class="ticket-card__body">
        <div class="ticket-card__title">${title}</div>
        ${sub ? `<div class="ticket-card__sub">${sub}</div>` : ''}
        ${tag ? `<div class="ticket-card__tag">${tag}</div>` : ''}
      </div>
    </div>
  `;
}

function travelCard({ label, value, progress }) {
  return `
    <div class="travel-card">
      <div class="travel-card__label">${label}</div>
      <div class="travel-card__value">${value}</div>
      ${progress != null ? `
        <div class="travel-card__bar"><div class="travel-card__bar-fill" style="width:${Math.round(progress)}%"></div></div>
      ` : ''}
    </div>
  `;
}

function discoveryRow(items) {
  if (!items?.length) return '';
  return `
    <div class="dash-section__scroller">
      ${items.map(i => `
        <div class="discovery-card">
          <div class="discovery-card__art" style="background:${i.bg}">${i.icon}</div>
          <div class="discovery-card__body">
            <div class="discovery-card__title">${i.title}</div>
            <div class="discovery-card__tag">${i.tag}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ---------------------------------------------------------------------
// Dreaming / Planning — low-stakes, inspiration-led. Planning (a trip
// already exists, just far out) swaps the generic inspiration prompt
// for a quiet "how it's shaping up" nudge instead of repeating "start
// planning," which the hero's own CTA already covers for Dreaming.
// ---------------------------------------------------------------------
function renderDreamingContent(trip) {
  const inspiration = discoveryRow([
    { icon: '⛩️', bg: 'var(--color-sora)', title: 'Kioto', tag: 'Templos y jardines' },
    { icon: '🍜', bg: '#FFE1EC', title: 'Osaka', tag: 'La capital de la comida' },
    { icon: '🗻', bg: '#DCEFF6', title: 'Hakone', tag: 'Monte Fuji y aguas termales' },
  ]);

  const secondCard = trip
    ? travelCard({ label: 'Tu itinerario', value: 'Apenas empezando' })
    : `
      <button type="button" class="travel-card" onclick="window.DashboardApp?.switchTab('budget')" style="cursor:pointer; text-align:left; width:100%; border:1px solid var(--hairline); font:inherit;">
        <div class="travel-card__label">Antes de decidir</div>
        <div class="travel-card__value" style="font-size:1rem;">Estima tu presupuesto →</div>
      </button>
    `;

  return section('Inspírate', inspiration) + section('Un paso más', secondCard);
}

// ---------------------------------------------------------------------
// Preparing — countdown detail, reservations, packing, documents
// ---------------------------------------------------------------------
function renderPreparingContent(trip, math, data) {
  const reservations = (data?.reservations ?? []).map(r =>
    ticketCard({ time: r.time || '—', duration: r.type, title: r.name, sub: r.location, tag: r.confirmationNumber ? `Confirmado · ${r.confirmationNumber}` : null })
  ).join('');

  const packingProgress = data?.packing ?? { checked: 0, total: 0 };
  const packingPct = packingProgress.total ? (packingProgress.checked / packingProgress.total) * 100 : 0;

  return (
    section('Reservas', reservations || `<div class="journal-card"><div class="journal-card__sub" style="margin-top:0;">Aún no tienes reservas guardadas.</div></div>`) +
    section('Tu maleta', travelCard({ label: 'Empacado', value: `${packingProgress.checked} de ${packingProgress.total}`, progress: packingPct })) +
    section('Documentos', travelCard({ label: 'Antes de salir', value: 'Pasaporte, seguro, IC card' }))
  );
}

// ---------------------------------------------------------------------
// Traveling — today's itinerary leads, everything else supports it
// ---------------------------------------------------------------------
function renderTravelingContent(trip, math, data) {
  const today = (data?.todayActivities ?? []).map(a =>
    ticketCard({ time: a.time, duration: a.duration, title: a.title, sub: a.sub, tag: a.tag })
  ).join('');

  const nearby = discoveryRow(data?.nearby ?? [
    { icon: '🍙', bg: '#FFE1EC', title: 'Onigiri cerca', tag: '4 min caminando' },
    { icon: '🛍️', bg: '#DDF3EC', title: 'Mercado local', tag: '8 min caminando' },
  ]);

  return (
    section('Hoy', today || `<div class="journal-card"><div class="journal-card__sub" style="margin-top:0;">Sin actividades planeadas para hoy todavía.</div></div>`) +
    section('Tu pase de transporte', travelCard({ label: data?.icCard?.label || 'Suica', value: data?.icCard?.balance || '—' })) +
    section('Cerca de ti', nearby)
  );
}

// ---------------------------------------------------------------------
// Remembering / Looking back — reflective, archival. Looking back drops
// nothing forward-looking; both share the same section set on purpose,
// per EXPERIENCE_GUIDELINES.md the difference is tone/motion, not structure.
// ---------------------------------------------------------------------
function renderRememberingContent(trip, data) {
  const memoryTeaser = window.Achievements?.renderMemoryTeaser?.() || '';
  const stats = data?.stats ?? {};

  return (
    section('Recuerdos', memoryTeaser || `<div class="journal-card"><div class="journal-card__sub" style="margin-top:0;">Tus recuerdos de este viaje aparecerán aquí.</div></div>`) +
    section('Estadísticas del viaje', `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        ${travelCard({ label: 'Días explorados', value: stats.daysExplored ?? '—' })}
        ${travelCard({ label: 'Ciudades visitadas', value: stats.citiesVisited ?? '—' })}
      </div>
    `) +
    section('Tu libro de viaje', `
      <div class="journal-card">
        <div class="journal-card__title" style="margin-top:0;">Próximamente: tu viaje, en un libro</div>
        <div class="journal-card__sub">Estamos construyendo una forma más bonita de revivir esto — ver FEATURE_ROADMAP.md, Travel Memories.</div>
      </div>
    `)
  );
}

/**
 * @param {object|null} trip
 * @param {object} [data] - real section data, keyed per stage; omit for placeholder copy
 * @returns {string}
 */
export function renderProgressiveContent(trip, data = {}) {
  const stage = detectJourneyStage(trip);
  const math = getJourneyMath(trip);

  switch (stage) {
    case 'dreaming':
    case 'planning':
      return renderDreamingContent(trip);
    case 'preparing':
      return renderPreparingContent(trip, math, data);
    case 'traveling':
      return renderTravelingContent(trip, math, data);
    case 'remembering':
    case 'lookingBack':
      return renderRememberingContent(trip, data);
    default:
      return '';
  }
}
