// js/smart-suggestions-ui.js - UI y Renderizado del Motor de Sugerencias

import { SuggestionsEngine } from './smart-suggestions-engine.js';

const escapeMarkup = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const encodePayload = value => encodeURIComponent(JSON.stringify(value ?? null));
const decodePayload = value => JSON.parse(decodeURIComponent(value));

/**
 * Extensión de SuggestionsEngine con funciones de UI
 */
Object.assign(SuggestionsEngine, {

  // ═══════════════════════════════════════════════════════════════
  // RENDERIZADO DEL MODAL PRINCIPAL
  // ═══════════════════════════════════════════════════════════════

  renderSuggestionsModal(dayNumber, suggestions) {
    // Remover modal anterior si existe
    const existing = document.getElementById('suggestionsModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'suggestionsModal';
    modal.className = 'modal active jp-modal-shell jp-suggestions-modal';
    modal.setAttribute('aria-labelledby', 'suggestionsModalTitle');

    const totalSuggestions =
      suggestions.gaps.reduce((sum, g) => sum + g.suggestions.length, 0) +
      suggestions.nearby.reduce((sum, n) => sum + n.suggestions.length, 0);

    modal.innerHTML = `
      <div class="modal-content jp-modal-paper bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="modal-header jp-modal-head sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 text-white p-6 flex justify-between items-center z-10">
          <div>
            <h2 id="suggestionsModalTitle" class="text-3xl font-bold flex items-center gap-3">
              💡 Sugerencias para el Día ${dayNumber}
            </h2>
            <p class="text-purple-100 mt-1">${totalSuggestions} sugerencias encontradas</p>
          </div>
          <div class="flex gap-3">
            <button
              onclick="SuggestionsEngine.refreshSuggestions(${dayNumber})"
              class="jp-modal-action px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition flex items-center gap-2"
            >
              🔄 Actualizar
            </button>
            <button
              class="modal-close jp-modal-close text-white hover:bg-white/20 w-10 h-10 rounded-lg transition font-bold text-2xl"
              onclick="document.getElementById('suggestionsModal').remove()"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="modal-body flex-1 overflow-y-auto p-6 space-y-6">
          ${this.renderGapsSection(suggestions.gaps, dayNumber)}
          ${this.renderNearbySection(suggestions.nearby, dayNumber)}
          ${this.renderAlertsSection(suggestions.alerts)}
          ${this.renderFatigueSection(suggestions.fatigue)}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    window.JapitinDialog?.enhance(modal, { onClose: () => modal.remove() });

    modal.addEventListener('click', event => {
      const addButton = event.target.closest('[data-suggestion-payload]');
      if (!addButton) return;
      addButton.disabled = true;
      addButton.classList.add('is-loading');
      this.addSuggestionToItinerary(
        decodePayload(addButton.dataset.suggestionPayload),
        addButton.dataset.suggestionType,
        Number(addButton.dataset.dayNumber),
        decodePayload(addButton.dataset.suggestionContext),
        addButton.dataset.gapIndex === '' ? null : Number(addButton.dataset.gapIndex)
      ).catch(error => {
        console.error('Error agregando sugerencia:', error);
        addButton.disabled = false;
        addButton.classList.remove('is-loading');
      });
    });

    // Cerrar al hacer click fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN: HUECOS DE TIEMPO
  // ═══════════════════════════════════════════════════════════════

  renderGapsSection(gaps, dayNumber) {
    if (!gaps || gaps.length === 0) {
      return `
        <div class="jp-sug-alert bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600">
          <h3 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">🕐 Huecos de Tiempo</h3>
          <p class="text-gray-600 dark:text-gray-400">✅ No hay huecos significativos en tu día. Tu itinerario está bien distribuido.</p>
        </div>
      `;
    }

    const gapCards = gaps.map((gap, index) => {
      const suggestionsHtml = gap.suggestions.map(sug =>
        this.renderSuggestionCard(sug, 'gap', dayNumber, gap, index)
      ).join('');

      return `
        <div class="jp-sug-pocket bg-blue-50 dark:bg-blue-900 p-5 rounded-xl border-2 border-blue-300 dark:border-blue-600">
          <div class="mb-4">
            <h4 class="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              🕐 Hueco de ${Math.round(gap.duration / 60 * 10) / 10} horas (${gap.startTime} - ${gap.endTime})
            </h4>
            <p class="text-sm text-blue-700 dark:text-blue-200 mt-1">
              Después de: <strong>${gap.afterActivity.title}</strong>
            </p>
          </div>

          ${gap.suggestions.length > 0 ? `
            <div class="space-y-3">
              <p class="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Sugerencias cercanas:
              </p>
              ${suggestionsHtml}
            </div>
          ` : `
            <p class="text-blue-700 dark:text-blue-300 text-sm">
              No hay atracciones cercanas que encajen en este tiempo.
            </p>
          `}
        </div>
      `;
    }).join('');

    return `
      <div class="jp-sug-section space-y-4">
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          🕐 Huecos de Tiempo (${gaps.length})
        </h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Momentos libres donde puedes agregar actividades
        </p>
        ${gapCards}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN: SUGERENCIAS CERCANAS
  // ═══════════════════════════════════════════════════════════════

  renderNearbySection(nearby, dayNumber) {
    if (!nearby || nearby.length === 0) {
      return `
        <div class="jp-sug-alert bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600">
          <h3 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">📍 Cerca de tus Actividades</h3>
          <p class="text-gray-600 dark:text-gray-400">No hay actividades adicionales cerca de tus paradas actuales.</p>
        </div>
      `;
    }

    const nearbyCards = nearby.map(opp => {
      const suggestionsHtml = opp.suggestions.map(sug =>
        this.renderSuggestionCard(sug, 'nearby', dayNumber, opp)
      ).join('');

      return `
        <div class="jp-sug-pocket bg-green-50 dark:bg-green-900 p-5 rounded-xl border-2 border-green-300 dark:border-green-600">
          <h4 class="text-lg font-bold text-green-900 dark:text-green-100 mb-3">
            Ya que estarás en <strong>${opp.nearActivity.title}</strong>...
          </h4>
          <div class="space-y-3">
            ${suggestionsHtml}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="jp-sug-section space-y-4">
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          📍 Cerca de tus Actividades (${nearby.length})
        </h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Lugares interesantes a menos de 500m de tus actividades
        </p>
        ${nearbyCards}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════
  // CARD DE SUGERENCIA INDIVIDUAL
  // ═══════════════════════════════════════════════════════════════

  renderSuggestionCard(suggestion, type, dayNumber, context, gapIndex) {
    const icon = suggestion.icon || '📍';
    const name = escapeMarkup(suggestion.name || suggestion.title);
    const safeIcon = escapeMarkup(icon);
    const rating = suggestion.rating ? '⭐'.repeat(Math.round(suggestion.rating)) : '';
    const cost = suggestion.cost !== undefined ? `💴 ¥${suggestion.cost.toLocaleString()}` : '';

    let timeInfo = '';
    if (type === 'gap') {
      timeInfo = `🕐 ${suggestion.suggestedTime || ''} • ⏱️ ${suggestion.totalTime} min`;
    } else {
      timeInfo = `⏱️ ${suggestion.duration || 60} min`;
    }

    const distanceInfo = suggestion.distanceMeters
      ? `${suggestion.distanceMeters}m`
      : suggestion.distanceKm
        ? `${suggestion.distanceKm}km`
        : '';

    const walkInfo = suggestion.walkingTime
      ? `🚶 ${suggestion.walkingTime} min`
      : suggestion.transportMode
        ? suggestion.transportMode
        : '';

    return `
      <div class="jp-sug-ticket bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition">
        <div class="flex justify-between items-start gap-4">
          <div class="flex-1">
            <h5 class="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
              ${safeIcon} ${name}
            </h5>

            ${suggestion.description ? `
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${escapeMarkup(suggestion.description)}</p>
            ` : ''}

            <div class="flex flex-wrap gap-3 mt-2 text-xs text-gray-600 dark:text-gray-300">
              ${rating ? `<span>${rating}</span>` : ''}
              ${cost ? `<span>${cost}</span>` : ''}
              <span>${timeInfo}</span>
              ${distanceInfo ? `<span>📏 ${distanceInfo}</span>` : ''}
              ${walkInfo ? `<span>${walkInfo}</span>` : ''}
            </div>
          </div>

          <button
            data-suggestion-payload="${escapeMarkup(encodePayload(suggestion))}"
            data-suggestion-context="${escapeMarkup(encodePayload(context))}"
            data-suggestion-type="${escapeMarkup(type)}"
            data-day-number="${Number(dayNumber)}"
            data-gap-index="${gapIndex ?? ''}"
            class="jp-sug-add px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white rounded-lg font-semibold transition whitespace-nowrap"
          >
            ✅ Agregar
          </button>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN: ALERTAS
  // ═══════════════════════════════════════════════════════════════

  renderAlertsSection(alerts) {
    if (!alerts || alerts.length === 0) {
      return '';
    }

    const alertCards = alerts.map(alert => {
      const bgColor = alert.severity === 'warning'
        ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600'
        : 'bg-blue-50 dark:bg-blue-900 border-blue-400 dark:border-blue-600';

      const textColor = alert.severity === 'warning'
        ? 'text-yellow-900 dark:text-yellow-100'
        : 'text-blue-900 dark:text-blue-100';

      return `
        <div class="jp-sug-alert ${bgColor} p-5 rounded-xl border-2">
          <h4 class="${textColor} font-bold text-lg flex items-center gap-2 mb-2">
            ${alert.icon} ${alert.title}
          </h4>
          <p class="${textColor} mb-3">${alert.message}</p>

          ${alert.suggestions && alert.suggestions.length > 0 ? `
            <div class="mt-3">
              <p class="${textColor} font-semibold text-sm mb-2">Sugerencias:</p>
              <ul class="${textColor} text-sm space-y-1 ml-4">
                ${alert.suggestions.map(s => `<li>• ${s}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${alert.activities && alert.activities.length > 0 ? `
            <div class="mt-3">
              <p class="${textColor} font-semibold text-sm mb-1">Actividades afectadas:</p>
              <ul class="${textColor} text-sm ml-4">
                ${alert.activities.map(a => `<li>• ${a}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="jp-sug-section space-y-4">
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          ⚠️ Alertas (${alerts.length})
        </h3>
        ${alertCards}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN: FATIGA
  // ═══════════════════════════════════════════════════════════════

  renderFatigueSection(fatigue) {
    if (!fatigue.hasIssue) {
      return `
        <div class="jp-sug-alert bg-green-50 dark:bg-green-900 p-6 rounded-xl border-2 border-green-300 dark:border-green-600">
          <h3 class="text-xl font-bold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
            ✅ Sin señales de fatiga
          </h3>
          <p class="text-green-700 dark:text-green-200">${fatigue.message}</p>
        </div>
      `;
    }

    return `
      <div class="jp-sug-alert bg-orange-50 dark:bg-orange-900 p-6 rounded-xl border-2 border-orange-300 dark:border-orange-600">
        <h3 class="text-xl font-bold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
          ${fatigue.icon} ${fatigue.title}
        </h3>
        <p class="text-orange-700 dark:text-orange-200 mb-3">${fatigue.message}</p>
        <p class="text-orange-800 dark:text-orange-100 font-semibold text-sm">
          💡 ${fatigue.suggestion}
        </p>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════
  // FUNCIÓN: ACTUALIZAR SUGERENCIAS
  // ═══════════════════════════════════════════════════════════════

  refreshSuggestions(dayNumber) {
    console.log('🔄 Actualizando sugerencias...');

    // Cerrar modal actual
    const modal = document.getElementById('suggestionsModal');
    if (modal) modal.remove();

    // Regenerar
    this.showSuggestionsForDay(dayNumber);

    if (window.Notifications) {
      window.Notifications.success('Sugerencias actualizadas', 2000);
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // FUNCIÓN: AGREGAR SUGERENCIA AL ITINERARIO
  // ═══════════════════════════════════════════════════════════════

  async addSuggestionToItinerary(suggestion, type, dayNumber, context, gapIndex) {
    console.log('➕ Agregando sugerencia al itinerario:', suggestion);

    // Validar que tenemos el itinerario
    const itinerary = window.ItineraryHandler?.currentItinerary;
    if (!itinerary || !itinerary.days) {
      console.error('⚠️ No hay itinerario cargado');
      if (window.Notifications) {
        window.Notifications.error('Error: No se pudo cargar el itinerario', 3000);
      }
      return;
    }

    // Obtener el día
    const day = itinerary.days.find(d => d.day === dayNumber);
    if (!day) {
      console.error(`⚠️ No se encontró el día ${dayNumber}`);
      return;
    }

    // Crear nueva actividad basada en la sugerencia
    const newActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: suggestion.name || suggestion.title,
      time: suggestion.suggestedTime || '12:00',
      duration: suggestion.duration || 60,
      category: suggestion.category || 'Atracción',
      cost: suggestion.cost || 0,
      coordinates: suggestion.coordinates,
      station: suggestion.station || '',
      icon: suggestion.icon || '📍',
      description: suggestion.description || '',
      rating: suggestion.rating || 0
    };

    // Determinar dónde insertar
    let insertIndex = -1;

    if (type === 'gap' && gapIndex !== null && gapIndex !== undefined) {
      // Insertar después del índice del gap
      insertIndex = gapIndex + 1;
    } else if (type === 'nearby' && context && context.nearActivity) {
      // Insertar después de la actividad cercana
      insertIndex = day.activities.findIndex(a =>
        a.id === context.nearActivity.id ||
        a.title === context.nearActivity.title
      );
      if (insertIndex !== -1) {
        insertIndex += 1;
      }
    }

    // Insertar en la posición correcta
    if (insertIndex !== -1 && insertIndex <= day.activities.length) {
      day.activities.splice(insertIndex, 0, newActivity);
      console.log(`✅ Actividad insertada en posición ${insertIndex}`);
    } else {
      // Si no se puede determinar, agregar al final
      day.activities.push(newActivity);
      console.log('✅ Actividad agregada al final del día');
    }

    // Guardar cambios en Firebase
    if (window.saveCurrentItineraryToFirebase) {
      try {
        await window.saveCurrentItineraryToFirebase();
        console.log('✅ Itinerario guardado en Firebase');
      } catch (error) {
        console.error('❌ Error guardando itinerario:', error);
        if (window.Notifications) {
          window.Notifications.error('Error al guardar en Firebase', 2000);
        }
      }
    }

    // El render se llama automáticamente desde onSnapshot, pero por si acaso:
    if (window.renderItinerary) {
      window.renderItinerary();
    }

    // Cerrar modal de sugerencias
    const modal = document.getElementById('suggestionsModal');
    if (modal) {
      modal.remove();
    }

    // Notificar éxito
    if (window.Notifications) {
      window.Notifications.success(
        `✅ "${newActivity.title}" agregado al Día ${dayNumber}`,
        3000
      );
    }

    console.log('✅ Itinerario actualizado con nueva actividad');
  }
});

console.log('✅ Smart Suggestions UI cargado');
