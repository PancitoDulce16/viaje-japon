/**
 * 🤖 INTEGRACIÓN ML - Conecta todas las features ML con el generador
 * ====================================================================
 *
 * Este módulo integra:
 * - PreferencePredictor (ML)
 * - ExpertDecisionEngine (Sistema Experto)
 * - GeneticRouteOptimizer (Algoritmo Genético)
 * - DayRegenerator (Regeneración de días)
 *
 * Con el SmartItineraryGenerator existente
 */

class MLIntegration {
  constructor() {
    // Inicializar sistemas ML
    this.preferencePredictor = new window.PreferencePredictor();
    this.expertEngine = new window.ExpertDecisionEngine();
    this.geneticOptimizer = null; // Se inicializa cuando se necesita
    this.dayRegenerator = new window.DayRegenerator();

    console.log('🤖 ML Integration initialized');
  }

  /**
   * 🎯 Hook principal - Se ejecuta ANTES de generar un itinerario
   * Ajusta preferencias basándose en el ML
   */
  enhanceGenerationContext(context) {
    console.log('🎯 Enhancing generation context with ML...');

    // 1️⃣ Obtener insights del Predictor de Preferencias
    const userInsights = this.preferencePredictor.generateInsights();
    console.log('📊 User insights:', userInsights);

    // 2️⃣ Aplicar decisiones del Sistema Experto
    const expertDecisions = this.expertEngine.evaluate(context);
    console.log('🎓 Expert decisions:', expertDecisions);

    // 3️⃣ Combinar todo en un contexto mejorado
    const enhancedContext = {
      ...context,

      // Ajustes del ML
      mlInsights: userInsights,

      // Ajustes del Sistema Experto
      expertAdjustments: expertDecisions.decisions.adjustments,

      // Actividades a priorizar
      prioritizeCategories: [
        ...new Set([
          ...(context.prioritizeCategories || []),
          ...expertDecisions.decisions.prioritize
        ])
      ],

      // Actividades a evitar
      avoidCategories: [
        ...new Set([
          ...(context.avoidCategories || []),
          ...expertDecisions.decisions.avoid
        ])
      ],

      // Must-include (lugares imperdibles)
      mustInclude: [
        ...(context.mustInclude || []),
        ...expertDecisions.decisions.mustInclude
      ],

      // Tips para el usuario
      generationTips: expertDecisions.decisions.tips,

      // Mensajes de las reglas aplicadas
      expertMessages: expertDecisions.decisions.messages
    };

    return enhancedContext;
  }

  /**
   * 🎯 Filtra y puntúa actividades usando ML
   * @param {Array} activities - Actividades disponibles
   * @param {Object} context - Contexto de generación
   * @returns {Array} Actividades ordenadas por score ML
   */
  scoreActivities(activities, context) {
    console.log(`🎯 Scoring ${activities.length} activities with ML...`);

    // Usar el Predictor de Preferencias para puntuar
    const scoredActivities = this.preferencePredictor.scoreActivities(activities);

    // Aplicar boost/penalty según Sistema Experto
    const finalScored = scoredActivities.map(activity => {
      let finalScore = activity.mlScore;

      // Boost si está en prioritize
      if (context.prioritizeCategories?.includes(activity.category)) {
        finalScore *= 1.5;
      }

      // Penalty si está en avoid
      if (context.avoidCategories?.includes(activity.category)) {
        finalScore *= 0.5;
      }

      return {
        ...activity,
        finalScore,
        mlScore: activity.mlScore,
        mlRecommendation: activity.mlRecommendation,
        mlReasons: activity.mlReasons
      };
    });

    // Ordenar por score final
    return finalScored.sort((a, b) => b.finalScore - a.finalScore);
  }

  /**
   * 🧬 Optimiza rutas del día usando Algoritmo Genético
   * @param {Object} day - Día del itinerario
   * @param {Object} options - Opciones de optimización
   * @returns {Promise<Object>} Día optimizado
   */
  async optimizeRoutes(day, options = {}) {
    console.log(`🧬 Optimizing routes for day ${day.dayNumber}...`);

    // Inicializar optimizador si no existe
    if (!this.geneticOptimizer) {
      this.geneticOptimizer = new window.GeneticRouteOptimizer({
        populationSize: 50, // Población más pequeña para rapidez
        generations: 30,     // Menos generaciones para rapidez
        mutationRate: 0.15
      });
    }

    const activities = day.activities || [];

    if (activities.length < 3) {
      console.log('⚠️ Not enough activities to optimize');
      return day;
    }

    try {
      // Optimizar usando algoritmo genético
      const result = this.geneticOptimizer.optimize(activities, {
        fixedStart: options.fixedStart,
        fixedEnd: options.fixedEnd,
        hotel: options.hotel
      });

      // Crear día optimizado
      const optimizedDay = {
        ...day,
        activities: result.route,
        optimization: {
          applied: true,
          totalDistance: result.totalDistance,
          totalTime: result.totalTime,
          improvement: result.improvement,
          method: 'genetic_algorithm'
        }
      };

      console.log(`✅ Route optimized - Distance: ${result.totalDistance.toFixed(2)}km, Improvement: ${result.improvement.toFixed(1)}%`);

      return optimizedDay;
    } catch (error) {
      console.error('❌ Error optimizing routes:', error);
      return day;
    }
  }

  /**
   * 🔄 Regenera un día específico
   * @param {Object} trip - Viaje completo
   * @param {number} dayIndex - Índice del día a regenerar
   * @param {string} optionId - ID de la opción de regeneración
   * @param {Object} generator - Instancia del generador
   * @returns {Promise<Object>} Día regenerado
   */
  async regenerateDay(trip, dayIndex, optionId, generator) {
    console.log(`🔄 Regenerating day ${dayIndex + 1} with option: ${optionId}`);

    const newDay = await this.dayRegenerator.regenerateDay(
      trip,
      dayIndex,
      optionId,
      generator
    );

    // Optimizar ruta del nuevo día
    const optimizedDay = await this.optimizeRoutes(newDay, {
      hotel: trip.hotel
    });

    // Trackear en ML para aprender
    this.trackRegeneration(trip, dayIndex, optionId);

    return optimizedDay;
  }

  /**
   * 📊 Trackea acción del usuario para ML
   * @param {string} action - Tipo de acción
   * @param {Object} data - Datos de la acción
   */
  trackAction(action, data) {
    switch (action) {
      case 'activity_completed':
        this.preferencePredictor.train('completed', data.activity, data.metadata);
        break;

      case 'activity_skipped':
        this.preferencePredictor.train('skipped', data.activity);
        break;

      case 'activity_added':
        this.preferencePredictor.train('added', data.activity);
        break;

      case 'activity_removed':
        this.preferencePredictor.train('removed', data.activity);
        break;

      case 'activity_rated':
        this.preferencePredictor.train('rated', data.activity, {
          rating: data.rating
        });
        break;
    }
  }

  /**
   * 📊 Trackea regeneración de día
   */
  trackRegeneration(trip, dayIndex, optionId) {
    // Guardar historial
    this.dayRegenerator.saveRegenerationHistory(
      trip.id || 'temp',
      dayIndex,
      optionId,
      {}
    );
  }

  /**
   * 🎨 Renderiza panel ML en el dashboard
   * @param {string} containerId - ID del contenedor
   */
  renderMLInsights(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const insights = this.preferencePredictor.generateInsights();
    const topCategories = this.preferencePredictor.getTopCategories(3);
    const topInterests = this.preferencePredictor.getTopInterests(5);

    let html = `
      <div class="ml-insights p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-700">
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🧠</span>
          <span>Tu Perfil de Viajero</span>
        </h3>

        ${insights.canPredict ? `
          <!-- Top Categories -->
          ${topCategories.length > 0 ? `
            <div class="mb-4">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ❤️ Tus Categorías Favoritas
              </h4>
              <div class="flex flex-wrap gap-2">
                ${topCategories.map(cat => `
                  <div class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-600">
                    <div class="text-sm font-semibold">${cat.category}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">${Math.round(cat.confidence * 100)}% confianza</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Top Interests -->
          ${topInterests.length > 0 ? `
            <div class="mb-4">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                🎯 Tus Intereses
              </h4>
              <div class="flex flex-wrap gap-2">
                ${topInterests.map(int => `
                  <span class="px-3 py-1 rounded-full text-xs bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100">
                    ${int.interest}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Suggestions -->
          ${insights.suggestions.length > 0 ? `
            <div class="mt-4 space-y-2">
              ${insights.suggestions.map(suggestion => `
                <div class="text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                  ${suggestion}
                </div>
              `).join('')}
            </div>
          ` : ''}
        ` : `
          <div class="text-center text-gray-600 dark:text-gray-400 py-4">
            <p class="mb-2">🌱 Aún estamos aprendiendo sobre ti</p>
            <p class="text-sm">Completa más actividades para ver recomendaciones personalizadas</p>
          </div>
        `}
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * 🎨 Renderiza botón "Regenerar Día" en el itinerario
   * @param {string} containerId - ID del contenedor
   * @param {number} dayIndex - Índice del día
   * @param {Function} onRegenerate - Callback cuando se regenera
   */
  renderRegenerateDayButton(containerId, dayIndex, onRegenerate) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const buttonHtml = `
      <button
        id="regenerate-day-btn-${dayIndex}"
        class="regenerate-day-btn px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2 transition-colors"
      >
        <span>🔄</span>
        <span>Regenerar Este Día</span>
      </button>
    `;

    container.innerHTML = buttonHtml;

    // Agregar event listener
    const button = document.getElementById(`regenerate-day-btn-${dayIndex}`);
    if (button) {
      button.addEventListener('click', () => {
        this.showRegenerateModal(dayIndex, onRegenerate);
      });
    }
  }

  /**
   * 🎨 Muestra modal de opciones de regeneración
   */
  showRegenerateModal(dayIndex, onRegenerate) {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6';
    modalContent.onclick = (e) => e.stopPropagation();

    modal.appendChild(modalContent);

    // Renderizar opciones de regeneración
    this.dayRegenerator.renderRegenerationOptions('regen-options', (optionId) => {
      modal.remove();
      if (onRegenerate) {
        onRegenerate(optionId);
      }
    });

    // Agregar modal al DOM primero
    document.body.appendChild(modal);

    // Ahora sí, renderizar el contenido dentro del modal
    const optionsContainer = document.createElement('div');
    optionsContainer.id = 'regen-options';
    modalContent.appendChild(optionsContainer);

    this.dayRegenerator.renderRegenerationOptions('regen-options', (optionId) => {
      modal.remove();
      if (onRegenerate) {
        onRegenerate(optionId);
      }
    });
  }

  /**
   * 📊 Obtiene estadísticas ML para el usuario
   */
  getMLStats() {
    return {
      predictor: this.preferencePredictor.generateInsights(),
      topCategories: this.preferencePredictor.getTopCategories(5),
      topInterests: this.preferencePredictor.getTopInterests(10),
      totalActions: this.preferencePredictor.model.totalActions
    };
  }
}

// 🌐 Exportar instancia global
if (typeof window !== 'undefined') {
  window.MLIntegration = new MLIntegration();
}
