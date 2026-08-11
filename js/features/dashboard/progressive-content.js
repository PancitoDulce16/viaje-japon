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
import { prioritizeDashboardActions } from './dashboard-summary.js';

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

function firstName() {
  const user = window.AuthHandler?.currentUser || window.auth?.currentUser;
  const source = user?.displayName || user?.email?.split('@')[0] || '';
  const value = source.trim().split(/[\s._+]+/)[0];
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'viajera';
}

function dashboardDate(value) {
  if (!value) return 'Fecha por definir';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return safe(value);
  return new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function dashboardCountdown(trip) {
  if (trip.countdown?.state === 'upcoming') return `<span>Faltan</span><strong>${trip.countdown.days}</strong><small>días</small>`;
  if (trip.countdown?.state === 'traveling') return `<span>Viajando</span><strong>${trip.countdown.days}</strong><small>días restantes</small>`;
  if (trip.countdown?.state === 'finished') return '<span>Viaje</span><strong>✓</strong><small>completado</small>';
  return '<span>Fechas</span><strong>—</strong><small>por definir</small>';
}

export function renderTripDashboard(data) {
  const { trip, itinerary, budget, tasks, packing, images = [], reservations = {}, weather = null } = data;
  const next = itinerary.next;
  const nextTitle = next?.title || next?.name || 'Tu primera aventura';
  const nextPlace = next?.location || next?.city || trip.destination;
  const mapAsset = /kyoto|kioto|gion|fushimi/i.test(`${nextPlace} ${nextTitle}`)
    ? '/images/illustrations/generated/maps/kyoto-district.webp'
    : '/images/illustrations/generated/maps/japan-overview.webp';
  const nextActions = prioritizeDashboardActions(data);
  const recommendation = nextActions[0]?.title || (next ? `Prepara lo necesario para ${nextTitle}.` : 'Agrega una actividad y empezamos a explorar.');
  const budgetPercent = Math.max(0, Math.min(100, Number(budget.percentUsed) || 0));
  const itineraryPercent = Math.max(0, Math.min(100, Number(itinerary.percent) || 0));
  const reservation = reservations.next;
  const taskRows = tasks.upcoming?.slice(0, 4) || [];
  const memories = images.slice(0, 3);

  return `<section class="journey-home" aria-label="Portada de tu viaje">
    <header class="journey-home__intro">
      <div><p class="journey-home__kicker">Tu aventura empieza aquí</p><h1>¡Hola, ${safe(firstName())}! <span aria-hidden="true">🌸</span></h1><p>Planifica, descubre y vive Japón a tu manera.</p></div>
      <button type="button" class="journey-home__help" onclick="window.NotificationCenter?.open()"><i class="far fa-question-circle" aria-hidden="true"></i><span>¿Qué sigue?</span></button>
    </header>

    <div class="journey-home__top">
      <article class="journey-ticket" aria-labelledby="currentTripTitle">
        <div class="journey-ticket__copy"><p class="journey-home__eyebrow">Tu viaje actual</p><h2 id="currentTripTitle">${safe(trip.name)}</h2><p><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${safe(trip.destination)} · ${dashboardDate(trip.dateStart)} — ${dashboardDate(trip.dateEnd)}</p><button type="button" onclick="window.DashboardApp?.switchTab('itinerary')">Ver itinerario <span aria-hidden="true">→</span></button></div>
        <div class="journey-ticket__countdown" aria-label="Cuenta regresiva">${dashboardCountdown(trip)}</div>
        <div class="journey-ticket__guide"><img src="/images/illustrations/generated/companions/cat-guide.png" alt="Gatito guía leyendo el mapa"><p><strong>Consejo Japitin</strong>${safe(recommendation)}</p></div>
        <span class="journey-ticket__stamp" aria-hidden="true">日本<br><small>JAPITIN</small></span>
      </article>

      <section class="journey-route" aria-labelledby="journeyRouteTitle"><div class="journey-home__section-head"><div><p class="journey-home__eyebrow">Tu viaje en progreso</p><h2 id="journeyRouteTitle">${itinerary.completed} de ${itinerary.total} aventuras vividas</h2></div><strong>${itineraryPercent}%</strong></div><div class="journey-route__track"><span style="width:${itineraryPercent}%"></span><i style="left:${itineraryPercent}%" aria-hidden="true">🌸</i></div><div class="journey-route__labels"><span>Comenzamos</span><span>Ahora</span><span>¡A disfrutar!</span></div></section>
    </div>

    <article class="next-stop" aria-labelledby="nextStopTitle">
      <div class="next-stop__copy"><p class="journey-home__eyebrow">Próxima parada</p><h2 id="nextStopTitle">${safe(nextTitle)}</h2>${next ? `<time datetime="${safe(next.dayDate)}T${safe(next.time || '')}"><i class="far fa-calendar" aria-hidden="true"></i> ${dashboardDate(next.dayDate)} · ${safe(next.time || 'Hora por definir')}</time><p><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${safe(nextPlace)}</p>` : '<p>Tu itinerario todavía tiene espacio para una sorpresa.</p>'}<div class="next-stop__weather">${weather ? `<span>${safe(window.AppUtils?.getWeatherEmoji?.(weather.icon) || '⛅')}</span><strong>${safe(weather.temp)}°</strong><small>${safe(weather.description)}</small>` : '<span>🌤️</span><strong>—</strong><small>Clima disponible al acercarse</small>'}</div><button type="button" onclick="window.DashboardApp?.switchTab('map')">Ver ruta <span aria-hidden="true">→</span></button></div>
      <div class="next-stop__map"><img src="${mapAsset}" alt="Mapa ilustrado de la próxima parada"><span class="next-stop__pin" aria-hidden="true"><i class="fas fa-map-pin"></i></span><figure class="next-stop__dog"><img src="/images/illustrations/generated/companions/dog-explorer.png" alt="Perrito explorador con mochila y cámara"><figcaption>Ruta encontrada</figcaption></figure></div>
    </article>

    <div class="journey-home__support">
      <article class="journey-note journey-note--tasks"><div class="journey-home__section-head"><div><p class="journey-home__eyebrow">Antes de salir</p><h2>Tareas importantes</h2></div><button type="button" onclick="window.TravelTasks?.open()">Ver ${tasks.pendingCount || 0}</button></div>${taskRows.length ? `<ul>${taskRows.map(task => `<li><i class="far fa-square" aria-hidden="true"></i><span>${safe(task.title)}</span><time>${safe(task.dueDate || '')}</time></li>`).join('')}</ul>` : '<p class="journey-home__empty">Todo listo por ahora. ¡Qué bonito se siente!</p>'}</article>
      <article class="luggage-tag"><p class="journey-home__eyebrow">Equipaje</p><h2>${packing.packed}/${packing.total}</h2><p>${packing.pending} pendiente${packing.pending === 1 ? '' : 's'}</p><div class="journey-meter"><span style="width:${packing.percent}%"></span></div><button type="button" onclick="window.PackingList?.open()">Abrir lista</button></article>
      <article class="budget-receipt"><p class="journey-home__eyebrow">Presupuesto resumido</p><h2>${formatMoneyMinor(budget.availableMinor, budget.currency)}</h2><p>disponibles de ${formatMoneyMinor(budget.budgetMinor, budget.currency)}</p><div class="journey-meter"><span style="width:${budgetPercent}%"></span></div><small>${budgetPercent.toFixed(0)}% utilizado</small><button type="button" onclick="window.DashboardApp?.switchTab('budget')">Ver presupuesto</button></article>
    </div>

    <div class="journey-home__lower">
      <article class="reservation-ticket"><div><p class="journey-home__eyebrow">Próxima reservación</p><h2>${reservation ? safe(reservation.title || reservation.name || 'Reservación') : 'Sin reservaciones próximas'}</h2><p>${reservation ? `${safe(reservation.location || reservation.type || '')}${reservation.startAt ? ` · ${safe(reservation.startAt)}` : ''}` : 'Cuando confirmes una, aparecerá aquí.'}</p>${reservation ? `<span>${safe(reservation.status || 'Próxima')}</span>` : ''}</div><button type="button" onclick="window.DashboardApp?.openFloatingModal('reservations')">Abrir reservas</button></article>

      <nav class="journey-actions" aria-label="Acciones rápidas"><div class="journey-home__section-head"><div><p class="journey-home__eyebrow">A tu manera</p><h2>Acciones rápidas</h2></div></div><div><button type="button" onclick="window.ItineraryBuilderExtensions?.showAddActivityModal()"><i class="fas fa-torii-gate" aria-hidden="true"></i><span>Actividad</span></button><button type="button" onclick="window.DashboardApp?.openFloatingModal('reservations')"><i class="far fa-calendar-plus" aria-hidden="true"></i><span>Reserva</span></button><button type="button" onclick="window.DashboardApp?.switchTab('map')"><i class="far fa-map" aria-hidden="true"></i><span>Mapa</span></button><button type="button" onclick="window.DashboardApp?.switchTab('budget');setTimeout(()=>window.BudgetTracker?.addExpenseFromTab(),100)"><i class="fas fa-yen-sign" aria-hidden="true"></i><span>Gasto</span></button><button type="button" onclick="TripsManager.showCreateTripModal()"><i class="fas fa-plus" aria-hidden="true"></i><span>Viaje</span></button></div></nav>

      <section class="memory-strip" aria-labelledby="memoriesTitle"><div class="journey-home__section-head"><div><p class="journey-home__eyebrow">Tu historia</p><h2 id="memoriesTitle">Recuerdos recientes</h2></div><button type="button" onclick="window.DashboardApp?.switchTab('utils')">Galería</button></div>${memories.length ? `<div>${memories.map((item, index) => `<figure style="--tilt:${index % 2 ? '2deg' : '-2deg'}"><img src="${safe(item.url)}" alt="${safe(item.name || 'Recuerdo del viaje')}" loading="lazy"><figcaption>${safe(item.name || 'Un momento del viaje')}</figcaption></figure>`).join('')}</div>` : '<div class="memory-strip__empty"><span aria-hidden="true">📷</span><p>Tus primeros recuerdos aparecerán aquí.</p></div>'}</section>
    </div>
  </section>`;
}
