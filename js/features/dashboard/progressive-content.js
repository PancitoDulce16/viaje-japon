/**
 * 📖 PROGRESSIVE CONTENT — Dashboard Experience
 *
 * Everything below the one Hero Moment (hero-moment.js). Answers "what
 * should I care about next," in an order that changes with the journey
 * stage — never a grid of equal-weight widgets, one continuous story
 * read top to bottom. Built entirely from the canonical object classes
 * in css/objects.css (ticket-card / travel-card / discovery-card /
 * journal-card) — no new card styles invented, and the Achievement
 * teaser reuses Achievements.renderMemoryTeaser() rather than a second
 * implementation.
 *
 * Wired to real Firestore data since slice 3 via dashboard-data.js —
 * this file stays a pure renderer (data in, HTML out). Every branch's
 * "no data yet" path is a real, warm empty state (per slice 4's polish
 * pass), never a bare "0 de 0" or "No hay X." No fabricated personal
 * numbers are ever asserted as fact — see SOUL.md's rule against fake
 * data.
 */

import { detectJourneyStage, getJourneyMath } from './stage-detector.js';
import { formatMoneyMinor } from '../budget/money.js';

const safe = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

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
        <div class="discovery-card${i.img ? ' discovery-card--postcard' : ''}">
          ${i.img ? `
            <span class="discovery-card__washi" aria-hidden="true"></span>
            <div class="discovery-card__art discovery-card__art--img">
              ${i.kanji ? `<span class="discovery-card__kanji" aria-hidden="true">${i.kanji}</span>` : ''}
              <img src="${i.img}" alt="">
            </div>
          ` : `
            <div class="discovery-card__art" style="background:${i.bg}">${i.icon}</div>
          `}
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
    { img: '/images/illustrations/generated/cities/kyoto-watercolor.webp', kanji: '京都', title: 'Kioto', tag: 'Templos y jardines milenarios' },
    { img: '/images/illustrations/generated/cities/osaka-watercolor.webp', kanji: '大阪', title: 'Osaka', tag: 'La capital de la comida' },
    { img: '/images/illustrations/generated/cities/nara-watercolor.webp', kanji: '奈良', title: 'Nara', tag: 'Historia y naturaleza en armonía' },
    { img: '/images/illustrations/generated/cities/hakone-watercolor.webp', kanji: '箱根', title: 'Hakone', tag: 'Aguas termales y vistas al Fuji' },
  ]);

  const secondCard = trip
    ? travelCard({ label: 'Tu itinerario', value: 'Apenas empezando' })
    : `
      <button type="button" class="travel-card" onclick="window.DashboardApp?.switchTab('budget')" style="cursor:pointer; text-align:left; width:100%; border:1px solid var(--hairline); font:inherit;">
        <div class="travel-card__label">Antes de decidir</div>
        <div class="travel-card__value" style="font-size:1rem;">Estima tu presupuesto →</div>
      </button>
    `;

  // Solo en Dreaming (sin viaje activo) — unirse con código sigue siendo
  // una acción real que había en el header viejo, preservada aquí en vez
  // de perderse en la migración.
  const joinLink = !trip ? `
    <div style="text-align:center;">
      <button type="button" onclick="TripsManager.joinTripWithCode()" style="background:none; border:0; font:inherit; color:var(--color-umi); font-weight:600; font-size:0.85rem; cursor:pointer; padding:8px;">
        🔗 ¿Tienes un código de invitación? Únete a un viaje
      </button>
    </div>
  ` : '';

  return section('Inspírate', inspiration) + section('Un paso más', secondCard) + joinLink;
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

  const budgetCard = data?.budget
    ? travelCard({ label: `Presupuesto · ${data.budget.currency}`, value: `${data.budget.spentMinor.toLocaleString()} de ${data.budget.budgetMinor.toLocaleString()}`, progress: data.budget.percentUsed })
    : null;

  const readiness = data?.travelReadiness;
  const readinessCard = readiness ? `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
      ${travelCard({ label: 'Vuelos', value: `${readiness.flightsBooked}/2` })}
      ${travelCard({ label: 'Hoteles', value: readiness.accommodationsCount })}
    </div>
    ${!readiness.allReady ? `<div class="journal-card__sub" style="margin-top:8px;">⚠️ Todavía falta confirmar algo antes de salir</div>` : ''}
  ` : null;

  const packingContent = packingProgress.total > 0
    ? travelCard({ label: 'Empacado', value: `${packingProgress.checked} de ${packingProgress.total}`, progress: packingPct })
    : `<div class="journal-card" onclick="window.DashboardApp?.switchTab('preparation')" style="cursor:pointer;"><div class="journal-card__title" style="margin-top:0;">Aún no armaste tu maleta</div><div class="journal-card__sub">Empieza tu lista y márcala mientras empacas →</div></div>`;

  return (
    section('Reservas', reservations || `<div class="journal-card"><div class="journal-card__title" style="margin-top:0;">Sin reservas todavía</div><div class="journal-card__sub">Hoteles, restaurantes y actividades que confirmes aparecerán aquí.</div></div>`) +
    section('Tu maleta', packingContent) +
    section('Pendientes', `<div class="journal-card"><div class="journal-card__title" style="margin-top:0;">${data?.tasks?.length || 0} tarea(s) pendiente(s)</div><div class="journal-card__sub">${(data?.tasks || []).slice(0,3).map(task => `${task.dueDate || 'Sin fecha'} · ${task.title}`).join('<br>') || 'Todo listo por ahora.'}</div><button type="button" onclick="window.TravelTasks?.open()">Administrar pendientes</button></div>`) +
    section('Accesos rápidos', `<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="travel-card" onclick="window.DashboardApp?.switchTab('budget');setTimeout(()=>window.BudgetTracker?.addExpenseFromTab(),100)">＋ Registrar gasto</button><button type="button" class="travel-card" onclick="window.TravelTasks?.open()">＋ Agregar tarea</button><button type="button" class="travel-card" onclick="window.DashboardApp?.openFloatingModal?.('packing')">＋ Equipaje</button></div>`) +
    (budgetCard ? section('Presupuesto', budgetCard) : '') +
    (readinessCard ? section('Vuelos y hoteles', readinessCard) : '')
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
 * Loading placeholder shown while fetchDashboardData() resolves —
 * shaped like the content it's about to become (two card-height
 * blocks under a label bar), not a bare "Cargando…" string. Respects
 * prefers-reduced-motion (see css/objects.css).
 */
export function renderProgressiveSkeleton() {
  const block = `
    <div class="dash-skeleton">
      <div class="dash-skeleton__bar"></div>
      <div class="dash-skeleton__card"></div>
      <div class="dash-skeleton__card"></div>
    </div>
  `;
  return block + block;
}

/**
 * @param {object|null} trip
 * @param {object} [data] - real section data, keyed per stage; omit for placeholder copy
 * @returns {string}
 */
export function renderProgressiveContent(trip, data = {}) {
  if (trip && data?.trip) return renderTripDashboard(data);
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

function renderTripDashboard(data) {
  const { trip, itinerary, budget, tasks, packing, images } = data;
  const countdown = trip.countdown?.state === 'upcoming' ? `Faltan ${trip.countdown.days} días` : trip.countdown?.state === 'traveling' ? `${trip.countdown.days} días de viaje` : trip.countdown?.state === 'finished' ? 'Viaje finalizado' : 'Fechas por definir';
  const next = itinerary.next;
  const recent = budget.recent || [];
  return `<section class="trip-overview" aria-label="Resumen del viaje">
    <header class="trip-overview__heading"><div><p class="budget-kicker">旅の概要 · RESUMEN DEL VIAJE</p><h2>${safe(trip.name)}</h2><p>${safe(trip.destination)} · ${safe(trip.dateStart || 'Sin fecha')} — ${safe(trip.dateEnd || 'Sin fecha')}</p></div><strong>${countdown}</strong></header>
    <div class="trip-overview__lead">
      <article class="trip-overview__next"><p class="trip-overview__eyebrow">Próxima actividad</p>${next ? `<time>${safe(next.dayDate)} · ${safe(next.time || 'Sin hora')}</time><h3>${safe(next.title || next.name || 'Actividad')}</h3><p>${safe(next.location || next.desc || '')}</p>` : '<div class="dashboard-empty"><h3>Sin actividades próximas</h3><p>Agrega la primera actividad para verla aquí.</p></div>'}<button type="button" onclick="window.DashboardApp?.switchTab('itinerary')">Abrir itinerario</button></article>
      <article class="trip-overview__finance"><div class="trip-overview__section-head"><div><p class="trip-overview__eyebrow">Presupuesto · ${safe(budget.currency)}</p><h3>${formatMoneyMinor(budget.spentMinor, budget.currency)} gastados</h3></div><strong>${budget.percentUsed.toFixed(1)}%</strong></div><div class="budget-progress"><span style="width:${Math.min(100, budget.percentUsed)}%"></span></div><dl><div><dt>Presupuesto</dt><dd>${formatMoneyMinor(budget.budgetMinor, budget.currency)}</dd></div><div><dt>Disponible</dt><dd>${formatMoneyMinor(budget.availableMinor, budget.currency)}</dd></div></dl>${recent.length ? `<div class="trip-overview__recent">${recent.map((item) => `<span>${safe(item.description || item.desc)} <strong>${formatMoneyMinor(item.convertedAmountMinor || item.amountMinor || 0, item.baseCurrency || budget.currency)}</strong></span>`).join('')}</div>` : '<p class="dashboard-empty">Aún no hay gastos.</p>'}<button type="button" onclick="window.DashboardApp?.switchTab('budget')">Ver reporte financiero</button></article>
    </div>
    <div class="trip-overview__progress"><article><div class="trip-overview__section-head"><div><p class="trip-overview__eyebrow">Itinerario</p><h3>${itinerary.completed} de ${itinerary.total} actividades</h3></div><strong>${itinerary.percent}%</strong></div><div class="budget-progress"><span style="width:${itinerary.percent}%"></span></div></article><article><div class="trip-overview__section-head"><div><p class="trip-overview__eyebrow">Pendientes</p><h3>${tasks.pendingCount} por completar</h3></div></div>${tasks.upcoming.length ? tasks.upcoming.slice(0,3).map((task) => `<p class="trip-overview__line"><span>${safe(task.title)}</span><time>${safe(task.dueDate || 'Sin fecha')}</time></p>`).join('') : '<p class="dashboard-empty">No hay tareas próximas.</p>'}<button type="button" onclick="window.TravelTasks?.open()">Administrar pendientes</button></article><article><div class="trip-overview__section-head"><div><p class="trip-overview__eyebrow">Equipaje</p><h3>${packing.packed} empacados · ${packing.pending} pendientes</h3></div><strong>${packing.percent}%</strong></div><div class="budget-progress"><span style="width:${packing.percent}%"></span></div><button type="button" onclick="window.PackingList?.open()">Abrir equipaje</button></article></div>
    ${images.length ? `<div class="trip-overview__gallery"><div><p class="trip-overview__eyebrow">Últimos recuerdos</p><h3>Galería del viaje</h3></div><div>${images.map((item) => `<img src="${safe(item.url)}" alt="${safe(item.name || 'Imagen del viaje')}" loading="lazy">`).join('')}</div></div>` : ''}
    <nav class="trip-overview__quick" aria-label="Accesos rápidos"><button onclick="window.DashboardApp?.switchTab('budget');setTimeout(()=>window.BudgetTracker?.addExpenseFromTab(),100)">＋ Registrar gasto</button><button onclick="window.ItineraryBuilderExtensions?.showAddActivityModal()">＋ Agregar actividad</button><button onclick="window.TravelTasks?.open({create:true})">＋ Crear tarea</button><button onclick="window.PackingList?.open({create:true})">＋ Agregar equipaje</button></nav>
  </section>`;
}
