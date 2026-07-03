// js/features/itinerary/city-route-map.js
//
// Mapa de selección de ciudades para el Step 1 del wizard: reemplaza el grid
// de checkboxes de texto plano por un diagrama clicable con posiciones reales
// (lat/lng reales, proyectadas), siguiendo el mismo patrón de hit-target ya
// probado en yamanote-helper.js (grupo + rect invisible que cubre punto+label
// + onclick + panel de info pareado vía window.CityRouteMap).
//
// No es una silueta literal de Japón (los modelos de imagen no son confiables
// reproduciendo fronteras geográficas precisas) - es un diagrama de ruta no
// literal sobre un fondo decorativo, con posiciones relativas basadas en
// lat/lng reales pero con una proyección "fisheye" (ver más abajo) que
// prioriza legibilidad sobre precisión geográfica exacta.

import { CITY_COORDINATES, CITY_ICONS } from '../../../data/city-coordinates.js';

// 🔧 Una proyección equirectangular lineal 1:1 deja el diagrama casi
// inutilizable: 14 de las 19 ciudades (el "golden route" Tokio-Kioto-Osaka-
// Nara-Hakone-Kamakura) caben en una porción chica del mapa, mientras Sapporo
// (norte) y Fukuoka (suroeste) están cientos de km más lejos y estiran el
// canvas - confirmado visualmente con Playwright: el cluster de Kanto
// (Tokio/Kamakura/Hakone/Yokohama) quedaba con hit-rects superpuestos en
// >1000px² cada uno, imposible de tocar de forma confiable.
// Fix: proyección tipo "mapa de metro" (igual criterio que usan mapas de
// transporte reales, no geográficamente exactos pero topológicamente
// correctos) - expande radialmente las ciudades cercanas al centro y
// comprime las lejanas, aplicando r' = r^0.55 sobre la distancia al
// centroide. Coherente con la decisión ya tomada de que este es un diagrama
// de ruta no-literal, no un mapa preciso.
const FISHEYE_POWER = 0.55;
const CANVAS_SIZE = 620;
const PADDING = 70;

function equirectRaw(lat, lng) {
  // Corrección de longitud por coseno de latitud media, para no estirar el
  // eje horizontal (1° de longitud vale menos km cuanto más al norte).
  const latMid = 38;
  return { x: lng * Math.cos(latMid * Math.PI / 180), y: -lat };
}

const RAW_POINTS = Object.fromEntries(
  Object.entries(CITY_COORDINATES).map(([key, [lat, lng]]) => [key, equirectRaw(lat, lng)])
);

const CENTROID = (() => {
  const pts = Object.values(RAW_POINTS);
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  };
})();

const FISHEYE_POINTS_RAW = Object.fromEntries(
  Object.entries(RAW_POINTS).map(([key, p]) => {
    const dx = p.x - CENTROID.x, dy = p.y - CENTROID.y;
    const r = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    const theta = Math.atan2(dy, dx);
    const rPrime = Math.pow(r, FISHEYE_POWER);
    return [key, { x: rPrime * Math.cos(theta), y: rPrime * Math.sin(theta) }];
  })
);

// 🔧 El fisheye radial (arriba) separa bien CLUSTERS enteros de los outliers
// (Sapporo/Fukuoka), pero ciudades DENTRO del mismo cluster (ej. Tokio/
// Kamakura/Hakone/Yokohama, todas a distancia y ángulo similar del centroide)
// quedan casi igual de apiñadas que antes - confirmado visualmente, seguían
// superpuestas. Fix: pasada de relajación por colisión - empuja pares de
// puntos más cerca que MIN_DIST a lo largo de la línea que los une, iterado
// varias veces. Esto SÍ garantiza separación mínima local sin importar la
// geometría real, que es la propiedad que realmente necesito (hit-rects sin
// superponerse), no solo un ajuste estético del fisheye.
function relaxCollisions(points, minDist, iterations = 40) {
  const keys = Object.keys(points);
  const pts = Object.fromEntries(keys.map(k => [k, { ...points[k] }]));
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const a = pts[keys[i]], b = pts[keys[j]];
        let dx = b.x - a.x, dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          if (dist < 0.001) { dx = 1; dy = 0; dist = 1; } // puntos coincidentes: separar en una dirección arbitraria
          const push = (minDist - dist) / 2;
          const ux = dx / dist, uy = dy / dist;
          a.x -= ux * push; a.y -= uy * push;
          b.x += ux * push; b.y += uy * push;
        }
      }
    }
  }
  return pts;
}

const FISHEYE_RAW_BOUNDS = (() => {
  const pts = Object.values(FISHEYE_POINTS_RAW);
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
})();
const MIN_DIST = Math.max(FISHEYE_RAW_BOUNDS.w, FISHEYE_RAW_BOUNDS.h) * 0.11;

const FISHEYE_POINTS = relaxCollisions(FISHEYE_POINTS_RAW, MIN_DIST);

// Reescalar los puntos ya relajados para llenar el canvas con padding fijo.
const FISHEYE_BOUNDS = (() => {
  const pts = Object.values(FISHEYE_POINTS);
  return {
    minX: Math.min(...pts.map(p => p.x)), maxX: Math.max(...pts.map(p => p.x)),
    minY: Math.min(...pts.map(p => p.y)), maxY: Math.max(...pts.map(p => p.y)),
  };
})();

const SVG_WIDTH = CANVAS_SIZE;
const SVG_HEIGHT = CANVAS_SIZE;

const PROJECTED = (() => {
  const { minX, maxX, minY, maxY } = FISHEYE_BOUNDS;
  const spanX = maxX - minX || 1, spanY = maxY - minY || 1;
  const usableW = SVG_WIDTH - PADDING * 2, usableH = SVG_HEIGHT - PADDING * 2;
  const scale = Math.min(usableW / spanX, usableH / spanY);
  const offsetX = PADDING + (usableW - spanX * scale) / 2;
  const offsetY = PADDING + (usableH - spanY * scale) / 2;
  return Object.fromEntries(
    Object.entries(FISHEYE_POINTS).map(([key, p]) => [
      key,
      { x: offsetX + (p.x - minX) * scale, y: offsetY + (p.y - minY) * scale }
    ])
  );
})();

function project(cityKey) {
  return PROJECTED[cityKey] || { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
}

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
          <img src="/images/wizard/route-map-bg.png" alt=""
               class="city-route-map-bg" onerror="this.style.display='none'" />
          ${this.renderDiagram(cities, cityStops)}
        </div>
        <div id="cityRouteChips" class="city-route-chips">
          ${this.renderChips(cityStops)}
        </div>
      </div>
    `;
  },

  /**
   * Reemplazo dirigido (no re-render completo del modal) - misma convención
   * que refreshCityStopsBuilder() en el wizard.
   */
  refresh() {
    const wizardData = window.SmartGeneratorWizard?.wizardData;
    if (!wizardData) return;
    const canvas = document.querySelector('.city-route-map-canvas svg');
    if (canvas) canvas.outerHTML = this.renderDiagram(wizardData.cities, wizardData.cityStops);
    const chips = document.getElementById('cityRouteChips');
    if (chips) chips.innerHTML = this.renderChips(wizardData.cityStops);
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
        <defs>
          <radialGradient id="cityDotSelected" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stop-color="#c4b5fd"/>
            <stop offset="100%" stop-color="#7c3aed"/>
          </radialGradient>
        </defs>
        ${hotspots}
      </svg>
    `;
  },

  renderHotspot(cityKey, displayName, isSelected, stopCount) {
    const { x, y } = project(cityKey);
    const icon = CITY_ICONS[cityKey] || '📍';
    const r = isSelected ? 16 : 11;

    // 🎯 Mismo criterio que yamanote-helper.js: el hit-target real es un rect
    // invisible que cubre punto + label (cuando el label está visible, solo
    // para ciudades seleccionadas - ver comentario abajo sobre por qué no se
    // muestra texto permanente para TODAS las ciudades), no solo un círculo
    // chico centrado en el punto.
    const showLabel = isSelected;
    const labelY = y + r + 12;
    const textWidthEstimate = showLabel ? displayName.length * 6.5 + 6 : 0;
    const hitLeft = x - Math.max(r + 6, textWidthEstimate / 2);
    const hitRight = x + Math.max(r + 6, textWidthEstimate / 2);
    const hitTop = y - r - 6;
    const hitBottom = showLabel ? labelY + 4 : y + r + 6;

    return `
      <g class="city-hotspot ${isSelected ? 'is-selected' : ''}" data-city-hotspot="${cityKey}"
         onclick="window.CityRouteMap.handleClick('${cityKey}')">
        <rect x="${hitLeft.toFixed(1)}" y="${hitTop.toFixed(1)}"
              width="${(hitRight - hitLeft).toFixed(1)}" height="${(hitBottom - hitTop).toFixed(1)}"
              fill="transparent"/>
        <circle class="city-hotspot-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"
                fill="${isSelected ? 'url(#cityDotSelected)' : '#ffffff'}"
                stroke="${isSelected ? '#7c3aed' : '#c4b5fd'}" stroke-width="2.5"/>
        <text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle"
              font-size="${isSelected ? 15 : 12}">${icon}</text>
        ${stopCount > 1 ? `
          <circle cx="${(x + r - 2).toFixed(1)}" cy="${(y - r + 2).toFixed(1)}" r="8" fill="#ec4899"/>
          <text x="${(x + r - 2).toFixed(1)}" y="${(y - r + 6).toFixed(1)}" text-anchor="middle"
                font-size="9" font-weight="800" fill="white">×${stopCount}</text>
        ` : ''}
        ${showLabel ? `
          <text x="${x.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle"
                font-size="12" font-weight="700" fill="currentColor">${displayName}</text>
        ` : ''}
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
