// js/features/itinerary/osaka-loop-helper.js
//
// Ayudante "¿Dónde me hospedo en Osaka?" — mismo patrón que YamanoteHelper:
// diagrama SVG interactivo de la JR Osaka Loop Line (Kanjō-sen) con las 19
// estaciones reales; las recomendadas muestran la vibra del barrio y rellenan
// el campo "área" del hotel de Osaka en el Step 3 del wizard.

import { OSAKA_LOOP_STATIONS, getOsakaStationById } from '../../../data/osaka-loop-line.js';

const LINE_COLOR = '#dc2626'; // rojo oficial de la Kanjō-sen

export const OsakaLoopHelper = {

  selectedStationId: null,

  render() {
    return `
      <div class="mb-4 border-2 border-red-200 dark:border-red-900/60 rounded-xl overflow-hidden">
        <button
          type="button"
          onclick="window.OsakaLoopHelper.toggle()"
          class="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/30 transition text-left"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">🏯</span>
            <div>
              <div class="font-bold text-gray-800 dark:text-white">¿Y en Osaka dónde me quedo?</div>
              <div class="text-xs text-gray-600 dark:text-gray-300">La Osaka Loop Line es el anillo de la ciudad — toca una estación para conocer el barrio</div>
            </div>
          </div>
          <i class="fas fa-chevron-down text-red-500 dark:text-red-400 transition-transform" id="osakaLoopChevron"></i>
        </button>

        <div id="osakaLoopPanel" class="hidden p-4 bg-white dark:bg-gray-800">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            La <strong class="text-red-600 dark:text-red-400">JR Osaka Loop</strong> rodea la ciudad (incluida en el JR Pass).
            Ojo: <strong>Namba y Dotonbori no están sobre el loop</strong> — quedan dentro, a una estación por la línea Midosuji;
            si quieres neones al salir del hotel, busca por esa zona en el campo de área. Para todo lo demás, el loop manda 👇
          </p>

          <div class="flex flex-col lg:flex-row gap-4 items-start">
            <div class="flex-1 w-full max-w-md mx-auto">
              ${this.renderDiagram()}
            </div>
            <div id="osakaLoopInfoPanel" class="flex-1 w-full lg:sticky lg:top-2">
              ${this.renderInfoPanel(null)}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  toggle() {
    const panel = document.getElementById('osakaLoopPanel');
    const chevron = document.getElementById('osakaLoopChevron');
    if (!panel) return;
    panel.classList.toggle('hidden');
    if (chevron) chevron.style.transform = panel.classList.contains('hidden') ? '' : 'rotate(180deg)';
  },

  /**
   * Loop orientado como el mapa: Osaka/Umeda arriba (norte), Nishikujō al
   * oeste, Tennōji abajo, Kyōbashi al este. El orden del array avanza
   * antihorario partiendo de arriba.
   */
  renderDiagram() {
    const size = 560;
    const cx = size / 2, cy = size / 2;
    const rx = 180, ry = 190;
    const n = OSAKA_LOOP_STATIONS.length;

    const pos = (i) => {
      const theta = (Math.PI / 2) + (i / n) * 2 * Math.PI; // arranca arriba, antihorario
      return {
        x: cx + rx * Math.cos(theta),
        y: cy - ry * Math.sin(theta),
        cos: Math.cos(theta),
        sin: Math.sin(theta)
      };
    };

    const stationsMarkup = OSAKA_LOOP_STATIONS.map((st, i) => {
      const p = pos(i);
      const labelR = st.recommended ? 20 : 13;
      const lx = cx + (rx + labelR) * p.cos;
      const ly = cy - (ry + labelR) * p.sin;
      const anchor = p.cos > 0.3 ? 'start' : (p.cos < -0.3 ? 'end' : 'middle');
      const dy = p.sin > 0.3 ? -2 : (p.sin < -0.3 ? 9 : 4);

      if (st.recommended) {
        // Hit-target rectangular que cubre punto + etiqueta (mismo patrón que
        // el diagrama Yamanote: un círculo chico deja hueco muerto entre el
        // punto y su nombre y la mitad de los taps se pierden)
        const textWidthEstimate = st.name.length * 7 + 4;
        let textLeft, textRight;
        if (anchor === 'start') { textLeft = lx; textRight = lx + textWidthEstimate; }
        else if (anchor === 'end') { textLeft = lx - textWidthEstimate; textRight = lx; }
        else { textLeft = lx - textWidthEstimate / 2; textRight = lx + textWidthEstimate / 2; }
        const textTop = ly + dy - 11;
        const textBottom = ly + dy + 4;

        const hitLeft = Math.min(p.x - 14, textLeft - 4);
        const hitRight = Math.max(p.x + 14, textRight + 4);
        const hitTop = Math.min(p.y - 14, textTop);
        const hitBottom = Math.max(p.y + 14, textBottom);

        return `
          <g class="osaka-station cursor-pointer" data-station="${st.id}"
             onclick="window.OsakaLoopHelper.selectStation('${st.id}')">
            <rect x="${hitLeft.toFixed(1)}" y="${hitTop.toFixed(1)}"
                  width="${(hitRight - hitLeft).toFixed(1)}" height="${(hitBottom - hitTop).toFixed(1)}"
                  fill="transparent"/>
            <circle class="station-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="7"
                    fill="white" stroke="${LINE_COLOR}" stroke-width="3.5"/>
            <text x="${lx.toFixed(1)}" y="${(ly + dy).toFixed(1)}" text-anchor="${anchor}"
                  fill="currentColor" font-size="12" font-weight="700">${st.name}</text>
          </g>
        `;
      }
      return `
        <g>
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${LINE_COLOR}" opacity="0.55"/>
          <text x="${lx.toFixed(1)}" y="${(ly + dy).toFixed(1)}" text-anchor="${anchor}"
                fill="currentColor" opacity="0.45" font-size="8.5">${st.name}</text>
        </g>
      `;
    }).join('');

    return `
      <svg viewBox="0 0 ${size} ${size}" class="w-full h-auto text-gray-700 dark:text-gray-200 select-none" id="osakaLoopSvg">
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
                 fill="none" stroke="${LINE_COLOR}" stroke-width="7" opacity="0.85"/>
        <text x="${cx}" y="${cy - 16}" text-anchor="middle" fill="${LINE_COLOR}" font-size="17" font-weight="800">OSAKA LOOP</text>
        <text x="${cx}" y="${cy + 6}" text-anchor="middle" fill="currentColor" opacity="0.6" font-size="11">19 estaciones · loop completo ~40 min</text>
        <text x="${cx}" y="${cy + 26}" text-anchor="middle" fill="currentColor" opacity="0.6" font-size="11">incluida en JR Pass · Namba queda dentro del anillo</text>
        ${stationsMarkup}
      </svg>
    `;
  },

  renderInfoPanel(stationId) {
    const st = stationId ? getOsakaStationById(stationId) : null;

    if (!st || !st.recommended) {
      return `
        <div class="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-dashed border-gray-300 dark:border-gray-600 text-center">
          <div class="text-4xl mb-2">👆</div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Toca cualquier estación <strong class="text-red-600 dark:text-red-400">roja grande</strong> del diagrama para ver cómo es el barrio y si te conviene para dormir.</p>
        </div>
      `;
    }

    return `
      <div class="p-5 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/60">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-lg font-bold text-gray-900 dark:text-white">🚉 ${st.name}</h4>
          <span class="text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded whitespace-nowrap">${st.priceLevel || ''}</span>
        </div>
        <p class="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">${st.vibe}</p>
        <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">${st.description}</p>
        <div class="flex flex-wrap gap-1.5 mb-4">
          ${(st.goodFor || []).map(tag => `<span class="text-xs bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-full">${tag}</span>`).join('')}
        </div>
        <button
          type="button"
          onclick="window.OsakaLoopHelper.useAsHotelArea('${st.name.replace(/'/g, "\\'")}')"
          class="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition text-sm"
        >
          ✅ Usar ${st.name} como área de mi hotel
        </button>
      </div>
    `;
  },

  selectStation(stationId) {
    this.selectedStationId = stationId;

    const infoPanel = document.getElementById('osakaLoopInfoPanel');
    if (infoPanel) infoPanel.innerHTML = this.renderInfoPanel(stationId);

    document.querySelectorAll('#osakaLoopSvg .station-dot').forEach(dot => {
      dot.setAttribute('fill', 'white');
      dot.setAttribute('r', '7');
    });
    const active = document.querySelector(`#osakaLoopSvg [data-station="${stationId}"] .station-dot`);
    if (active) {
      active.setAttribute('fill', LINE_COLOR);
      active.setAttribute('r', '9');
    }
  },

  useAsHotelArea(areaName) {
    const areaInput = document.querySelector('.hotel-area-input[data-city="osaka"]');
    if (areaInput) {
      areaInput.value = areaName;
      areaInput.dispatchEvent(new Event('input', { bubbles: true }));
      areaInput.classList.add('ring-2', 'ring-red-500');
      setTimeout(() => areaInput.classList.remove('ring-2', 'ring-red-500'), 2000);
      window.Notifications?.show(`🏨 Área de hotel en Osaka: ${areaName}`, 'success');
      areaInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.Notifications?.show('Agrega Osaka a tus ciudades para usar esta sugerencia', 'warning');
    }
  }
};

if (typeof window !== 'undefined') {
  window.OsakaLoopHelper = OsakaLoopHelper;
}
