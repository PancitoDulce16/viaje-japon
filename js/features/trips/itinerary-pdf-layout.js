// HTML is rendered in an isolated light-theme document before PDF capture.
// Browser fonts preserve Spanish and Japanese; content is measured before paging.
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = value => typeof value === 'string' ? value : '';
const categories = { transport:'Traslado', food:'Comida', shopping:'Compras', culture:'Cultura', nature:'Naturaleza', entertainment:'Experiencia', sightseeing:'Paseo', hotel:'Hotel', nightlife:'Vida nocturna' };

export function printDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return value || 'Fecha por definir';
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es', { timeZone:'UTC', weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(date);
}

export function mapsURL(activity, city = '') {
  const lat = activity.coordinates?.lat;
  const lng = activity.coordinates?.lng;
  const valid = lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180;
  const query = valid ? `${Number(lat)},${Number(lng)}` : [text(activity.location) || text(activity.address) || text(activity.title) || text(activity.name), city, 'Japan'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function dayMapActivity(day) {
  return day.activities?.find(a => a.category !== 'transport' && (a.coordinates || a.location || a.address))
    || day.activities?.find(a => a.category !== 'transport') || day.activities?.[0];
}

// Keep all content, including very long unbroken strings. Small fragments allow
// pagination within an exceptional activity instead of clipping the whole day.
function fragments(value, size = 360) {
  const chars = Array.from(text(value));
  const result = [];
  while (chars.length) {
    let count = Math.min(size, chars.length);
    if (count < chars.length) {
      const boundary = chars.slice(0, count).join('').lastIndexOf(' ');
      if (boundary > count / 2) count = boundary + 1;
    }
    result.push(chars.splice(0, count).join(''));
  }
  return result;
}

export async function buildItineraryPages(frameDocument, itinerary, trip = {}, { qrCode } = {}) {
  const d = frameDocument;
  await Promise.all([d.fonts.load('400 13px Inter'), d.fonts.load('800 32px Bricolage')]);
  const days = itinerary.days || [];
  const pages = [];
  let page, content, day, dayIndex, continued = false;
  const make = (tag, className, html) => {
    const node = d.createElement(tag); node.className = className; node.innerHTML = html; return node;
  };
  const heading = () => {
    const title = text(day.title) || text(day.city) || 'Japón';
    const node = make('header', 'pdf-heading', `<div class="pdf-kicker">Día ${escape(day.day || dayIndex + 1)}${continued ? ' · Continuación' : ''}</div><h1>${escape(title)}</h1><p>${escape(printDate(day.date))}</p>${!continued ? '<img class="pdf-art" src="/images/illustrations/generated/panorama/japan-fuji-panorama-day.webp" alt=""><img class="pdf-companion" src="/images/illustrations/generated/companions/dog-explorer.png" alt="">' : ''}`);
    if (continued) node.style.minHeight = '0';
    return node;
  };
  const newPage = () => {
    page = make('section', 'pdf-page', '');
    page.append(make('div','pdf-brand',`<strong><span>✿</span> Japitin</strong><span>${escape(trip.info?.name || 'Tu aventura a Japón')}</span>`));
    page.append(heading());
    page.append(make('div','pdf-meta',`${escape(day.city || 'Japón')} · ${escape(String(day.activities?.length || 0))} actividades${continued ? ' · El día continúa' : ''}`));
    content = make('main','pdf-content',''); page.append(content);
    d.body.append(page); pages.push(page);
  };
  const fits = () => content.getBoundingClientRect().bottom <= page.getBoundingClientRect().top + 1050;
  const append = node => {
    content.append(node);
    if (!fits()) {
      node.remove(); continued = true; newPage(); content.append(node);
    }
  };
  for (const [index, current] of days.entries()) {
    day = current; dayIndex = index; continued = false; newPage();
    if (day.notes) for (const part of fragments(day.notes)) append(make('aside','pdf-note',escape(part)));
    if (!day.activities?.length) append(make('p','pdf-empty','Un día para descubrir a tu ritmo. Sin actividades programadas.'));
    for (const activity of day.activities || []) {
      const url = mapsURL(activity, day.city);
      const confirmed = ['confirmed','confirmada','confirmado','reserved','reservado','reservada','booked'].includes(String(activity.reservationStatus || '').toLowerCase());
      const titleParts = fragments(text(activity.title) || text(activity.activity) || text(activity.name) || 'Actividad', 120);
      const details = [
        ...titleParts.slice(1).map(part => `<p>${escape(part)}</p>`),
        ...fragments(text(activity.location) || text(activity.address) || text(activity.area)).map(part => `<p class="pdf-location">${escape(part)}</p>`),
        ...fragments(text(activity.description)).map(part => `<p>${escape(part)}</p>`),
        ...fragments(activity.notes === activity.description ? '' : text(activity.notes)).map(part => `<p>${escape(part)}</p>`),
        ...(!confirmed && (activity.reservationRequired || activity.reservationStatus === 'pending') ? ['<p><strong>Reserva por confirmar</strong> · Verifica la entrada antes de cerrar el día.</p>'] : [])
      ];
      const shell = (continuation = false) => make('article','pdf-activity',`<div class="pdf-time">${escape(activity.time || '—')}</div><div class="pdf-activity-body"><div class="pdf-category">${escape(categories[activity.category] || 'Actividad')}${continuation ? ' · Continúa' : ''}</div><h2>${escape(continuation ? 'Continuación' : titleParts[0])}</h2></div>`);
      let block = shell();
      for (const detail of details) block.lastElementChild.insertAdjacentHTML('beforeend',detail);
      block.lastElementChild.insertAdjacentHTML('beforeend',`<p class="pdf-location"><a href="${escape(url)}">Ver lugar en Google Maps</a></p>`);
      content.append(block);
      if (!fits()) {
        block.remove();
        // Prefer keeping an activity together when it fits on a fresh page.
        if (content.children.length) { continued = true; newPage(); }
        content.append(block);
        if (!fits()) {
          block.remove(); block = shell(); content.append(block);
          for (const detail of [...details, `<p class="pdf-location"><a href="${escape(url)}">Ver lugar en Google Maps</a></p>`]) {
            const holder = make('div','',detail); block.lastElementChild.append(holder);
            if (!fits()) {
              holder.remove(); continued = true; newPage(); block = shell(true); content.append(block); block.lastElementChild.append(holder);
            }
          }
        }
      }
    }
    const firstPlace = dayMapActivity(day);
    if (firstPlace) {
      const url = mapsURL(firstPlace, day.city);
      const qr = qrCode ? await qrCode(url) : null;
      const section = make('aside','pdf-map',`${qr ? `<img src="${escape(qr)}" alt="QR del lugar de referencia">` : ''}<div><strong>Para tener a mano</strong><p>Lugar de referencia: ${escape(firstPlace.title || firstPlace.name || firstPlace.activity || day.city)}.</p><p><a href="${escape(url)}">Abrir lugar en Google Maps</a>${qr ? ' · También puedes escanear el QR.' : ''}</p><p>Revisa horarios, reservas y traslados antes de salir.</p></div>`);
      // A QR is an optional shortcut, never a reason for an almost empty page.
      // Each activity already has its own Maps link.
      content.append(section);
      if (!fits()) section.querySelector('img')?.remove();
      if (!fits()) section.remove();
    }
  }
  await d.fonts.ready;
  await Promise.all([...d.images].map(image => image.decode().catch(() => {})));
  pages.forEach((node, index) => node.append(make('footer','pdf-footer',`<span>Japitin · Tu aventura a Japón</span><span>${index + 1} / ${pages.length}</span>`)));
  return pages;
}

export async function createPrintFrame() {
  const frame = document.createElement('iframe');
  frame.title = 'Preparando tu itinerario PDF';
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;';
  document.body.append(frame);
  const d = frame.contentDocument;
  d.open(); d.write('<!doctype html><html lang="es"><head><meta charset="UTF-8"><title>Itinerario Japitin</title></head><body></body></html>'); d.close();
  await Promise.all(['/css/tokens.css','/css/itinerary-print.css'].map(href => new Promise((resolve,reject) => {
    const link = d.createElement('link'); link.rel='stylesheet'; link.href=href; link.onload=resolve; link.onerror=reject; d.head.append(link);
  }))).catch(error => { frame.remove(); throw error; });
  return frame;
}
