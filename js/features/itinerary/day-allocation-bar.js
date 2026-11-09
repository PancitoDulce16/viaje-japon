// js/features/itinerary/day-allocation-bar.js
//
// Reparto de dias: botones independientes; divisores transfieren entre vecinos.

import { CITY_ICONS } from '../../../data/city-coordinates.js';

const SEGMENT_COLORS = ['var(--decorative-lavender)', 'var(--decorative-sakura)', 'var(--decorative-sora)', 'var(--decorative-matcha)', 'var(--decorative-gold)', 'var(--decorative-plum)'];

export const DayAllocationBar = {

  dragState: null,

  render(cityStops, totalDays) {
    const assigned = cityStops.reduce((sum, stop) => sum + Number(stop.days || 0), 0);
    return `
      <div class="day-allocation-total" role="status">
        <span>Asignados ${assigned}/${totalDays} · Repartiendo ${totalDays} día${totalDays === 1 ? '' : 's'} entre ${cityStops.length} parada${cityStops.length === 1 ? '' : 's'}</span>
        <span>Arrastra un bloque por el ícono ⋮⋮ para reordenar</span>
      </div>
      <div class="day-allocation-bar" id="dayAllocationBar" data-total-days="${totalDays}">
        ${cityStops.map((stop, idx) => this.renderSegmentAndDivider(stop, idx, cityStops.length)).join('')}
      </div>
      <p class="day-allocation-help">Cada botón cambia solo esta ciudad. ${assigned === totalDays ? 'Marcar una excursión conserva los días de todas las ciudades.' : assigned < totalDays ? `Te faltan ${totalDays - assigned} días por asignar.` : `Quita ${assigned - totalDays} días donde prefieras antes de continuar.`}</p>
      ${this.renderStopControls(cityStops)}
    `;
  },

  /**
   * 🔧 Un usuario real probó la barra y no entendió cómo cambiar los días
   * ("puedo elegir qué hacer primero pero no elegir cuántos días voy a estar
   * en esa ciudad... es muy poco intuitivo") - arrastrar la línea divisora
   * entre dos bloques de color no es un gesto obvio/descubrible por sí solo.
   * Esta lista es el fallback explícito y garantizado de entender: un
   * stepper −/+ con el número visible, uno por parada. La barra de arriba
   * sigue sirviendo para power users que sí descubran el drag, pero ya no es
   * la ÚNICA forma de cambiar los días.
   */
  renderStopControls(cityStops) {
    return `
      <div class="day-stop-controls">
        ${cityStops.map((stop, idx) => {
          const cityKey = stop.city.toLowerCase();
          const icon = CITY_ICONS[cityKey] || '📍';
          const canBeDayTrip = idx > 0 || stop.isDayTrip;
          const canDecrease = stop.days > 1;
          return `
            <div class="day-stop-control-row">
              <span class="day-stop-control-city">${icon} ${stop.city}</span>
              <div class="day-stop-stepper">
                <button type="button" class="day-stop-stepper-btn" data-allocation-action="decrease-${idx}" ${!canDecrease ? 'disabled' : ''}
                        onclick="window.DayAllocationBar.nudgeSegmentDays(${idx}, -1)" aria-label="Quitar un día">−</button>
                <span class="day-stop-stepper-value">${stop.days} día${stop.days === 1 ? '' : 's'}</span>
                <button type="button" class="day-stop-stepper-btn" data-allocation-action="increase-${idx}"
                        onclick="window.DayAllocationBar.nudgeSegmentDays(${idx}, 1)" aria-label="Agregar un día">+</button>
              </div>
              ${canBeDayTrip ? `
                <button type="button" data-allocation-action="trip-${idx}" class="day-trip-toggle-chip ${stop.isDayTrip ? 'is-active' : ''}" aria-pressed="${!!stop.isDayTrip}"
                        onclick="window.SmartGeneratorWizard.setCityStopDayTrip(${idx}, ${!stop.isDayTrip})">
                  🚃 ${stop.isDayTrip ? 'Es excursión ✓' : 'Marcar excursión'}
                </button>
              ` : '<span></span>'}
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // Los botones modifican exclusivamente la parada elegida.
  nudgeSegmentDays(idx, direction) {
    const stops = window.SmartGeneratorWizard.wizardData.cityStops;
    if (!stops[idx] || ![-1, 1].includes(direction)) return;
    if (stops[idx].days + direction < 1) return;
    stops[idx].days += direction;
    window.SmartGeneratorWizard.saveToSessionStorage();
    this.refresh();
  },

  renderSegmentAndDivider(stop, idx, count) {
    const segment = this.renderSegment(stop, idx);
    const divider = idx < count - 1
      ? `<div class="day-divider" data-divider-idx="${idx}"></div>`
      : '';
    return segment + divider;
  },

  renderSegment(stop, idx) {
    const cityKey = stop.city.toLowerCase();
    const icon = CITY_ICONS[cityKey] || '📍';
    const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
    return `
      <div class="day-segment ${stop.isDayTrip ? 'is-day-trip' : ''}" data-segment-idx="${idx}"
           style="flex: ${stop.days} 1 0%; background: color-mix(in srgb, ${color} 25%, var(--surface)); border-bottom: 4px solid ${color};">
        <span class="day-segment-drag-handle" data-drag-handle-idx="${idx}">⋮⋮</span>
        <span class="day-segment-label">${icon} ${stop.city} · ${stop.days}d${stop.isDayTrip ? ' 🚃' : ''}</span>
      </div>
    `;
  },

  /**
   * Reemplazo dirigido de #dayAllocationBar (misma convención que
   * CityRouteMap.refresh() - no re-render completo del modal en cada cambio).
   */
  refresh() {
    const wizardData = window.SmartGeneratorWizard?.wizardData;
    if (!wizardData) return;
    const container = document.getElementById('dayAllocationBar')?.parentElement;
    if (container) {
      const focusAction = document.activeElement?.dataset.allocationAction;
      container.innerHTML = this.render(wizardData.cityStops, wizardData.totalDays);
      this.attachHandlers();
      const focusTarget = focusAction && container.querySelector(`[data-allocation-action="${focusAction}"]`);
      if (focusTarget && !focusTarget.disabled) focusTarget.focus();
    }
  },

  /**
   * Actualización visual en vivo durante el drag, sin tocar innerHTML
   * (evita perder el pointer capture activo). Solo re-lee flex-grow y el
   * texto "Xd" de los dos segmentos afectados.
   */
  patchSegmentWidths(leftIdx, rightIdx) {
    const wizardData = window.SmartGeneratorWizard.wizardData;
    [leftIdx, rightIdx].forEach(idx => {
      const el = document.querySelector(`.day-segment[data-segment-idx="${idx}"]`);
      if (!el) return;
      const stop = wizardData.cityStops[idx];
      el.style.flex = `${stop.days} 1 0%`;
      const label = el.querySelector('.day-segment-label');
      if (label) {
        const cityKey = stop.city.toLowerCase();
        const icon = CITY_ICONS[cityKey] || '📍';
        label.textContent = `${icon} ${stop.city} · ${stop.days}d${stop.isDayTrip ? ' 🚃' : ''}`;
      }
    });
  },

  attachHandlers() {
    const bar = document.getElementById('dayAllocationBar');
    if (!bar) return;

    bar.querySelectorAll('.day-divider').forEach(divider => {
      divider.addEventListener('pointerdown', (e) => this.onDividerPointerDown(e, divider));
    });

    // Reordenamiento vía SortableJS, con handle explícito (mismo patrón que
    // itinerary-v3.js) - el pointerdown del divisor hace stopPropagation()
    // como defensa secundaria para segmentos angostos donde ambas zonas de
    // hit quedan cerca.
    if (window.Sortable && !bar._sortableInstance) {
      bar._sortableInstance = new window.Sortable(bar, {
        draggable: '.day-segment',
        handle: '.day-segment-drag-handle',
        animation: 200,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: (evt) => {
          const from = evt.oldDraggableIndex ?? evt.oldIndex;
          const to = evt.newDraggableIndex ?? evt.newIndex;
          if (from !== to) window.SmartGeneratorWizard.reorderCityStops(from, to);
          // 🆕 SortableJS solo mueve los .day-segment que arrastra - los
          // .day-divider intercalados (fuera del selector `draggable`) se
          // quedan en su posición de DOM original, quedando desalineados de
          // sus segmentos vecinos tras cualquier reorder (confirmado
          // visualmente con Playwright). Forzar un refresh completo desde
          // wizardData reconstruye segmentos+divisores ya consistentes, en
          // vez de confiar en el DOM parcialmente movido por Sortable.
          this.refresh();
        }
      });
    }
  },

  onDividerPointerDown(e, dividerEl) {
    e.stopPropagation();
    e.preventDefault();
    dividerEl.setPointerCapture(e.pointerId);
    dividerEl.classList.add('is-dragging');

    const d = parseInt(dividerEl.dataset.dividerIdx, 10);
    const wizardData = window.SmartGeneratorWizard.wizardData;
    const stops = wizardData.cityStops;
    const bar = document.getElementById('dayAllocationBar');
    const dividerCount = stops.length - 1;
    const usablePx = bar.getBoundingClientRect().width - dividerCount * 10; // 10px = ancho fijo del divisor en CSS
    const pxPerDay = usablePx / stops.reduce((sum, stop) => sum + stop.days, 0);

    this.dragState = {
      d, startX: e.clientX,
      leftStart: stops[d].days, rightStart: stops[d + 1].days,
      pxPerDay: pxPerDay || 1
    };

    const onMove = (ev) => this.onDividerPointerMove(ev);
    const onUp = (ev) => {
      this.onDividerPointerUp(ev, dividerEl);
      dividerEl.removeEventListener('pointermove', onMove);
      dividerEl.removeEventListener('pointerup', onUp);
      dividerEl.removeEventListener('pointercancel', onUp);
    };
    dividerEl.addEventListener('pointermove', onMove);
    dividerEl.addEventListener('pointerup', onUp);
    dividerEl.addEventListener('pointercancel', onUp);
  },

  onDividerPointerMove(e) {
    if (!this.dragState) return;
    const { d, startX, leftStart, rightStart, pxPerDay } = this.dragState;
    let deltaDays = Math.round((e.clientX - startX) / pxPerDay);
    // clamp: ningún segmento puede quedar en menos de 1 día.
    // left' = leftStart + deltaDays >= 1  =>  deltaDays >= -(leftStart - 1)
    // right' = rightStart - deltaDays >= 1  =>  deltaDays <= rightStart - 1
    deltaDays = Math.max(-(leftStart - 1), Math.min(rightStart - 1, deltaDays));

    const stops = window.SmartGeneratorWizard.wizardData.cityStops;
    stops[d].days = leftStart + deltaDays;
    stops[d + 1].days = rightStart - deltaDays;
    this.patchSegmentWidths(d, d + 1);
  },

  onDividerPointerUp(e, dividerEl) {
    if (dividerEl.hasPointerCapture(e.pointerId)) dividerEl.releasePointerCapture(e.pointerId);
    dividerEl.classList.remove('is-dragging');
    this.dragState = null;
    window.SmartGeneratorWizard.saveToSessionStorage();
  }
};

if (typeof window !== 'undefined') {
  window.DayAllocationBar = DayAllocationBar;
}
