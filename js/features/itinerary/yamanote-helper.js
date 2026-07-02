// js/features/itinerary/yamanote-helper.js
//
// Ayudante "¿Dónde me hospedo en Tokio?" para primerizos: diagrama SVG
// interactivo de la línea JR Yamanote con las 30 estaciones reales. Las
// recomendadas son clickeables y muestran la vibra del barrio + un botón
// que rellena el campo "área" del hotel de Tokio en el wizard.

import { YAMANOTE_STATIONS, getStationById } from '../../../data/yamanote-line.js';

export const YamanoteHelper = {

  selectedStationId: null,

  /**
   * Panel completo (colapsado por defecto) para insertar en el Step 3 del wizard
   */
  render() {
    return `
      <div class="mb-4 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden">
        <button
          type="button"
          onclick="window.YamanoteHelper.toggle()"
          class="w-full flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition text-left"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">🚃</span>
            <div>
              <div class="font-bold text-gray-800 dark:text-white">¿Primera vez en Tokio? ¿No sabes dónde quedarte?</div>
              <div class="text-xs text-gray-600 dark:text-gray-300">Regla de oro: hospédate sobre la línea Yamanote — toca una estación para conocer el barrio</div>
            </div>
          </div>
          <i class="fas fa-chevron-down text-emerald-600 dark:text-emerald-400 transition-transform" id="yamanoteChevron"></i>
        </button>

        <div id="yamanotePanel" class="hidden p-4 bg-white dark:bg-gray-800">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            La <strong class="text-emerald-600 dark:text-emerald-400">JR Yamanote</strong> es el anillo que conecta todos los
            barrios importantes (un tren cada 2-4 min, incluida en el JR Pass). Si tu hotel está sobre este loop,
            nunca estarás "lejos de todo". <strong>Toca una estación verde</strong> 👇
          </p>

          <div class="flex flex-col lg:flex-row gap-4 items-start">
            <div class="flex-1 w-full max-w-md mx-auto">
              ${this.renderDiagram()}
            </div>
            <div id="yamanoteInfoPanel" class="flex-1 w-full lg:sticky lg:top-2">
              ${this.renderInfoPanel(null)}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  toggle() {
    const panel = document.getElementById('yamanotePanel');
    const chevron = document.getElementById('yamanoteChevron');
    if (!panel) return;
    panel.classList.toggle('hidden');
    if (chevron) chevron.style.transform = panel.classList.contains('hidden') ? '' : 'rotate(180deg)';
  },

  /**
   * Diagrama SVG del loop: 30 estaciones en orden real, orientado como el
   * mapa (Tokyo al este/derecha, Shinjuku al oeste/izquierda, Tabata arriba,
   * Shinagawa abajo).
   */
  renderDiagram() {
    const size = 560;
    const cx = size / 2, cy = size / 2;
    const rx = 175, ry = 195;
    const n = YAMANOTE_STATIONS.length;

    const pos = (i) => {
      // Índice 0 (Tokyo) en el este (0°), avanzando antihorario en el mapa
      const theta = (i / n) * 2 * Math.PI;
      return {
        x: cx + rx * Math.cos(theta),
        y: cy - ry * Math.sin(theta),
        cos: Math.cos(theta),
        sin: Math.sin(theta)
      };
    };

    const stationsMarkup = YAMANOTE_STATIONS.map((st, i) => {
      const p = pos(i);
      const labelR = st.recommended ? 20 : 13;
      const lx = cx + (rx + labelR) * p.cos;
      const ly = cy - (ry + labelR) * p.sin;
      const anchor = p.cos > 0.3 ? 'start' : (p.cos < -0.3 ? 'end' : 'middle');
      const dy = p.sin > 0.3 ? -2 : (p.sin < -0.3 ? 9 : 4);

      if (st.recommended) {
        return `
          <g class="yamanote-station cursor-pointer" data-station="${st.id}"
             onclick="window.YamanoteHelper.selectStation('${st.id}')">
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="12" fill="transparent"/>
            <circle class="station-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="7"
                    fill="white" stroke="#059669" stroke-width="3.5"/>
            <text x="${lx.toFixed(1)}" y="${(ly + dy).toFixed(1)}" text-anchor="${anchor}"
                  fill="currentColor" font-size="12" font-weight="700">${st.name}</text>
          </g>
        `;
      }
      return `
        <g>
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="#059669" opacity="0.55"/>
          <text x="${lx.toFixed(1)}" y="${(ly + dy).toFixed(1)}" text-anchor="${anchor}"
                fill="currentColor" opacity="0.45" font-size="8.5">${st.name}</text>
        </g>
      `;
    }).join('');

    return `
      <svg viewBox="0 0 ${size} ${size}" class="w-full h-auto text-gray-700 dark:text-gray-200 select-none" id="yamanoteSvg">
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
                 fill="none" stroke="#059669" stroke-width="7" opacity="0.85"/>
        <text x="${cx}" y="${cy - 16}" text-anchor="middle" fill="#059669" font-size="17" font-weight="800">JR YAMANOTE</text>
        <text x="${cx}" y="${cy + 6}" text-anchor="middle" fill="currentColor" opacity="0.6" font-size="11">30 estaciones · loop completo ~60 min</text>
        <text x="${cx}" y="${cy + 26}" text-anchor="middle" fill="currentColor" opacity="0.6" font-size="11">tren cada 2-4 min · incluida en JR Pass</text>
        ${stationsMarkup}
      </svg>
    `;
  },

  /**
   * Panel de información del barrio seleccionado
   */
  renderInfoPanel(stationId) {
    const st = stationId ? getStationById(stationId) : null;

    if (!st || !st.recommended) {
      return `
        <div class="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-dashed border-gray-300 dark:border-gray-600 text-center">
          <div class="text-4xl mb-2">👆</div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Toca cualquier estación <strong class="text-emerald-600 dark:text-emerald-400">verde grande</strong> del diagrama para ver cómo es el barrio y si te conviene para dormir.</p>
        </div>
      `;
    }

    return `
      <div class="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-lg font-bold text-gray-900 dark:text-white">🚉 ${st.name}</h4>
          <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800/60 px-2 py-1 rounded whitespace-nowrap">${st.priceLevel || ''}</span>
        </div>
        <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">${st.vibe}</p>
        <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">${st.description}</p>
        <div class="flex flex-wrap gap-1.5 mb-4">
          ${(st.goodFor || []).map(tag => `<span class="text-xs bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-full">${tag}</span>`).join('')}
        </div>
        <button
          type="button"
          onclick="window.YamanoteHelper.useAsHotelArea('${st.name}')"
          class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-sm"
        >
          ✅ Usar ${st.name} como área de mi hotel
        </button>
      </div>
    `;
  },

  selectStation(stationId) {
    this.selectedStationId = stationId;

    const infoPanel = document.getElementById('yamanoteInfoPanel');
    if (infoPanel) infoPanel.innerHTML = this.renderInfoPanel(stationId);

    // Resaltar la estación activa en el SVG
    document.querySelectorAll('#yamanoteSvg .station-dot').forEach(dot => {
      dot.setAttribute('fill', 'white');
      dot.setAttribute('r', '7');
    });
    const active = document.querySelector(`#yamanoteSvg [data-station="${stationId}"] .station-dot`);
    if (active) {
      active.setAttribute('fill', '#059669');
      active.setAttribute('r', '9');
    }
  },

  /**
   * Rellena el campo "área" del hotel de Tokio en el Step 3 del wizard
   */
  useAsHotelArea(areaName) {
    const areaInput = document.querySelector('.hotel-area-input[data-city="tokyo"]');
    if (areaInput) {
      areaInput.value = areaName;
      areaInput.dispatchEvent(new Event('input', { bubbles: true }));
      areaInput.classList.add('ring-2', 'ring-emerald-500');
      setTimeout(() => areaInput.classList.remove('ring-2', 'ring-emerald-500'), 2000);
      window.Notifications?.show(`🏨 Área de hotel en Tokio: ${areaName}`, 'success');
      areaInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.Notifications?.show('Agrega Tokio a tus ciudades para usar esta sugerencia', 'warning');
    }
  }
};

if (typeof window !== 'undefined') {
  window.YamanoteHelper = YamanoteHelper;
}
