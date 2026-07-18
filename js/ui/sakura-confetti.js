// js/ui/sakura-confetti.js
//
// 🌸 SAKURA CONFETTI — celebración de hitos (idea #155 del brainstorm).
// Un solo sistema para todos los momentos de alegría: pétalos rosas +
// estrellitas doradas que estallan y caen con física CSS.
//
// Uso: window.SakuraConfetti.burst()            → desde el centro-arriba
//      window.SakuraConfetti.burst(element)     → desde ese elemento
//
// Respeta prefers-reduced-motion (no hace nada). Se autolimpia del DOM.

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const SakuraConfetti = {
  burst(fromEl = null, count = 26) {
    if (reduced()) return;

    const rect = fromEl?.getBoundingClientRect?.();
    const ox = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const oy = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.28;

    const layer = document.createElement('div');
    layer.className = 'sakura-confetti';
    layer.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      const gold = i % 4 === 0; // 1 de cada 4 es estrellita dorada
      p.className = 'sakura-confetti__p' + (gold ? ' is-gold' : '');
      const size = gold ? 5 + Math.random() * 4 : 8 + Math.random() * 7;
      const dx = (Math.random() - 0.5) * 340;         // dispersión horizontal
      const dy = 180 + Math.random() * 320;            // caída
      const rot = (Math.random() - 0.5) * 720;
      p.style.cssText = `
        left:${ox}px; top:${oy}px; width:${size}px; height:${size}px;
        --dx:${dx.toFixed(0)}px; --dy:${dy.toFixed(0)}px; --rot:${rot.toFixed(0)}deg;
        animation-duration:${(1.4 + Math.random() * 1.1).toFixed(2)}s;
        animation-delay:${(Math.random() * 0.15).toFixed(2)}s;
      `;
      layer.appendChild(p);
    }

    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 3200);
  }
};

window.SakuraConfetti = SakuraConfetti;
