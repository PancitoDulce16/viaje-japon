// js/ui/live-title.js
//
// 🌸 Título de pestaña vivo (idea #187 del brainstorm):
// - Con viaje activo: "🌸 36 días para Japón — Japitin"
// - Al irte a otra pestaña: el gatito te extraña.
// Lee el countdown ya renderizado por hero-moment.js (no recalcula fechas)
// y es 100% defensivo: sin hero, deja el título original en paz.

const BASE_TITLE = document.title;

function currentTitle() {
  const n = document.querySelector('.hero-moment__countdown-num')?.textContent?.trim();
  if (n && /^\d+$/.test(n)) {
    return `🌸 ${n} día${n === '1' ? '' : 's'} para Japón — Japitin`;
  }
  return BASE_TITLE;
}

// El hero llega tras el fetch de viajes; reintento corto y me rindo en silencio.
let tries = 0;
const wait = setInterval(() => {
  tries++;
  const ready = document.querySelector('.hero-moment');
  if (ready || tries > 24) {
    clearInterval(wait);
    document.title = currentTitle();
  }
}, 500);

document.addEventListener('visibilitychange', () => {
  document.title = document.hidden ? '🐱 ¡El gatito te extraña!' : currentTitle();
});
