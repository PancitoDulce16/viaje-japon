// City selection: geographic coastline with separated, connected city labels.

import { JAPAN_OUTLINE } from '../../../data/japan-outline.js';
import { CITY_COORDINATES, CITY_ICONS } from '../../../data/city-coordinates.js';

const SVG_WIDTH = 720;
const SVG_HEIGHT = 720;
// Coastline and anchors share one projection; displaced labels have leader lines.
function projectCoordinate(lat, lng) {
  return { x: 60 + (lng - 128) * 34, y: 660 - (lat - 30) * 40 };
}
const ANCHORS = Object.fromEntries(Object.entries(CITY_COORDINATES).map(
  ([key, [lat, lng]]) => [key, projectCoordinate(lat, lng)]
));
const PROJECTED = structuredClone(ANCHORS);
for (let iteration = 0; iteration < 100; iteration++) {
  const points = Object.values(PROJECTED);
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
    const a = points[i], b = points[j];
    const dx = b.x - a.x, dy = b.y - a.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < 66) {
      const push = (66 - distance) / 2;
      a.x -= dx / distance * push; a.y -= dy / distance * push;
      b.x += dx / distance * push; b.y += dy / distance * push;
    }
  }
}
function project(cityKey) { return PROJECTED[cityKey] || { x: 360, y: 360 }; }
const COASTLINE = JAPAN_OUTLINE.map(polygon => polygon.map(ring =>
  ring.map(([lng, lat], index) => {
    const { x, y } = projectCoordinate(lat, lng);
    return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ') + ' Z'
).join(' ')).join(' ');

export const CityRouteMap = {

  /**
   * Panel completo para insertar en la fase "map" del Step 1 del wizard.
   */
  render(wizardData) {
    const cities = wizardData.cities || [];
    const cityStops = wizardData.cityStops || [];

    return `
      <div class="city-route-map-wrap">
        <div class="city-route-map-canvas">
          <img src="/images/wizard/map-backdrop-day.webp" alt=""
               class="city-route-map-bg city-route-map-bg--day" loading="eager"
               onerror="this.style.display='none'" />
          <img src="/images/wizard/map-backdrop-night.webp" alt=""
               class="city-route-map-bg city-route-map-bg--night" loading="eager"
               onerror="this.style.display='none'" />
          ${this.renderDiagram(cities, cityStops)}
        </div>
        <div id="cityRouteChips" class="city-route-chips">
          ${this.renderChips(cityStops)}
        </div>
        <details class="city-route-list"><summary>Elegir ciudades por nombre</summary><div class="city-route-city-list">
          ${this.renderCityList(cities)}
        </div></details>
      </div>
    `;
  },

  /**
   * Reemplazo dirigido (no re-render completo del modal) - misma convención
   * que DayAllocationBar.refresh().
   */
  refresh() {
    const wizardData = window.SmartGeneratorWizard?.wizardData;
    if (!wizardData) return;
    const activeCity = document.activeElement?.dataset.cityHotspot;
    const activeChoice = document.activeElement?.dataset.cityChoice;
    const canvas = document.querySelector('.city-route-map-canvas svg');
    if (canvas) canvas.outerHTML = this.renderDiagram(wizardData.cities, wizardData.cityStops);
    const chips = document.getElementById('cityRouteChips');
    if (chips) chips.innerHTML = this.renderChips(wizardData.cityStops);
    const list = document.querySelector('.city-route-city-list');
    if (list) list.innerHTML = this.renderCityList(wizardData.cities);
    const focusTarget = activeCity ? document.querySelector(`[data-city-hotspot="${activeCity}"]`) : activeChoice ? list?.querySelector(`[data-city-choice="${activeChoice}"]`) : null;
    focusTarget?.focus();
  },

  renderCityList(cities = []) {
    return Object.keys(CITY_COORDINATES).map(key => {
      const name = window.SmartGeneratorWizard?.cityLabel?.(key) || key;
      return `<button type="button" data-city-choice="${key}" aria-pressed="${cities.includes(name)}" onclick="window.CityRouteMap.handleClick('${key}')">${CITY_ICONS[key]} ${name}</button>`;
    }).join('');
  },

  renderDiagram(cities, cityStops) {
    const stopCounts = {};
    (cityStops || []).forEach(s => {
      const key = s.city.toLowerCase();
      stopCounts[key] = (stopCounts[key] || 0) + 1;
    });

    const hotspots = Object.keys(CITY_COORDINATES).map(cityKey => {
      const displayName = window.SmartGeneratorWizard?.cityLabel?.(cityKey) || cityKey;
      const isSelected = cities.includes(displayName);
      return this.renderHotspot(cityKey, displayName, isSelected, stopCounts[cityKey] || 0);
    }).join('');

    return `
      <svg viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" class="w-full h-auto select-none" id="cityRouteSvg">
        <path class="city-route-land" d="${COASTLINE}" aria-hidden="true" />
        ${Object.keys(CITY_COORDINATES).map(key => {
          const a = ANCHORS[key], p = project(key);
          return `<path class="city-route-anchor" d="M${a.x},${a.y} L${p.x},${p.y}" /><circle class="city-route-location" cx="${a.x}" cy="${a.y}" r="3" />`;
        }).join('')}
        ${hotspots}
      </svg>
    `;
  },

  renderHotspot(cityKey, displayName, isSelected, stopCount) {
    const { x, y } = project(cityKey);
    const icon = CITY_ICONS[cityKey] || '📍';
    const r = isSelected ? 16 : 11;

    // 🔧 Antes el nombre de la ciudad SOLO se mostraba si ya estaba
    // seleccionada (para evitar que el diagrama se sintiera apretado con 19
    // labels) - un usuario real lo señaló como el problema #1 del mapa: "hay
    // emojis, no hay nombres, que pasa si no sé dónde queda cada ciudad y
    // tengo que dar click en cada una a ver cuál es cuál". El propósito de
    // un mapa de SELECCIÓN es justamente dejar identificar antes de elegir -
    // ocultar el nombre hasta seleccionar rompía ese propósito. Ahora
    // siempre se muestra (MIN_DIST ya deja espacio de sobra desde el fix del
    // cluster de Kanto), con menor peso visual para las no seleccionadas.
    const labelY = y + r + 12;
    const textWidthEstimate = displayName.length * 6 + 6;
    const hitLeft = x - Math.max(r + 6, textWidthEstimate / 2);
    const hitRight = x + Math.max(r + 6, textWidthEstimate / 2);
    const hitTop = y - r - 6;
    const hitBottom = labelY + 4;

    return `
      <g class="city-hotspot ${isSelected ? 'is-selected' : ''}" data-city-hotspot="${cityKey}" role="button" tabindex="0" aria-label="${displayName}" aria-pressed="${isSelected}"
         onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.CityRouteMap.handleClick('${cityKey}'); }"
         onclick="window.CityRouteMap.handleClick('${cityKey}')">
        <rect x="${hitLeft.toFixed(1)}" y="${hitTop.toFixed(1)}"
              width="${(hitRight - hitLeft).toFixed(1)}" height="${(hitBottom - hitTop).toFixed(1)}"
              fill="transparent"/>
        <circle class="city-hotspot-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"
                stroke-width="2.5"/>
        <text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle"
              font-size="${isSelected ? 15 : 12}">${icon}</text>
        ${stopCount > 1 ? `
          <circle cx="${(x + r - 2).toFixed(1)}" cy="${(y - r + 2).toFixed(1)}" r="8" class="city-route-repeat"/>
          <text x="${(x + r - 2).toFixed(1)}" y="${(y - r + 6).toFixed(1)}" text-anchor="middle"
                font-size="9" font-weight="800" class="city-route-repeat-label">×${stopCount}</text>
        ` : ''}
        <text x="${x.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle"
              font-size="${isSelected ? 14 : 13}" font-weight="${isSelected ? 700 : 600}"
              fill="currentColor" opacity="${isSelected ? 1 : 0.75}"
              class="city-hotspot-label">${displayName}</text>
      </g>
    `;
  },

  renderChips(cityStops) {
    if (!cityStops || cityStops.length === 0) {
      return `<p class="text-sm text-gray-400 dark:text-gray-500 text-center py-3">👆 Toca las ciudades en el mapa para armar tu ruta</p>`;
    }
    return `
      <div class="flex flex-wrap gap-2 justify-center">
        ${cityStops.map((stop, idx) => {
          const cityKey = stop.city.toLowerCase();
          const icon = CITY_ICONS[cityKey] || '📍';
          return `
            <div class="city-route-chip">
              <span>${icon} ${stop.city}${stop.isDayTrip ? ' <span class="text-xs opacity-70">(excursión)</span>' : ''}</span>
              <button type="button" onclick="window.CityRouteMap.handleChipRepeat('${cityKey}')"
                      class="city-route-chip-btn" title="Repetir ${stop.city}">+</button>
              <button type="button" onclick="window.CityRouteMap.handleChipRemove(${idx})"
                      class="city-route-chip-btn city-route-chip-btn-remove" title="Quitar parada">×</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  handleClick(cityKey) {
    window.SmartGeneratorWizard?.toggleCityFromMap(cityKey);
  },

  handleChipRepeat(cityKey) {
    const displayName = window.SmartGeneratorWizard?.cityLabel?.(cityKey) || cityKey;
    window.SmartGeneratorWizard?.addCityStop(displayName);
  },

  handleChipRemove(idx) {
    window.SmartGeneratorWizard?.removeCityStop(idx);
  }
};

if (typeof window !== 'undefined') {
  window.CityRouteMap = CityRouteMap;
}
