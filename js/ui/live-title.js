// js/ui/live-title.js
//
// 🌸 Título de pestaña vivo (idea #187) + favicon con countdown (idea #12):
// - Título: "🌸 36 días para Japón" / al ocultar, el gatito te extraña.
// - Favicon: dibuja los días restantes en un círculo kasumi (canvas → dataURL).
// Lee el countdown ya renderizado por hero-moment.js (no recalcula fechas)
// y es 100% defensivo: sin hero, deja título y favicon originales en paz.

const BASE_TITLE = document.title;

function countdownNum() {
  const n = document.querySelector('.hero-moment__countdown-num')?.textContent?.trim();
  return (n && /^\d+$/.test(n)) ? n : null;
}

function currentTitle() {
  const n = countdownNum();
  return n ? `🌸 ${n} día${n === '1' ? '' : 's'} para Japón — Japitin` : BASE_TITLE;
}

// Dibuja el número de días sobre un círculo rosa como favicon.
function paintFavicon(n) {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d');
    x.fillStyle = '#F16FA3';
    x.beginPath(); x.arc(32, 32, 30, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.font = `bold ${n.length > 2 ? 24 : 34}px -apple-system, "Segoe UI", sans-serif`;
    x.fillText(n, 32, 35);
    let link = document.querySelector('link[rel~="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.type = 'image/png';
    link.href = c.toDataURL('image/png');
  } catch (e) { /* favicon es cosmético; nunca romper por esto */ }
}

function refresh() {
  document.title = currentTitle();
  const n = countdownNum();
  if (n) paintFavicon(n);
}

// El hero llega tras el fetch de viajes; reintento corto y me rindo en silencio.
let tries = 0;
const wait = setInterval(() => {
  tries++;
  if (document.querySelector('.hero-moment') || tries > 24) {
    clearInterval(wait);
    refresh();
  }
}, 500);

document.addEventListener('visibilitychange', () => {
  document.title = document.hidden ? '🐱 ¡El gatito te extraña!' : currentTitle();
});
