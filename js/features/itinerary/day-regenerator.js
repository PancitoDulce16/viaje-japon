/**
 * 🔄 REGENERAR SOLO UN DÍA (#9)
 * ==============================
 *
 * Permite regenerar un día específico del itinerario sin perder el resto.
 * El usuario puede elegir diferentes estilos de regeneración.
 *
 * Características:
 * - Regenera solo un día seleccionado
 * - Opciones: Más cultural, Más económico, Menos caminata, etc.
 * - Mantiene el contexto del viaje
 * - Preserva otros días intactos
 */

export class DayRegenerator {
  constructor() {
    this.regenerationOptions = [
      {
        id: 'more_cultural',
        name: '🎌 Más Cultural',
        description: 'Más templos, santuarios y experiencias tradicionales',
        adjustments: {
          categoryWeights: { 'temple': 2.0, 'shrine': 2.0, 'museum': 1.5, 'tea-ceremony': 2.0 },
          interests: ['culture', 'history', 'traditional']
        }
      },
      {
        id: 'more_economical',
        name: '💰 Más Económico',
        description: 'Actividades gratuitas o de bajo costo',
        adjustments: {
          maxActivityCost: 1000,
          categoryWeights: { 'park': 2.0, 'free-temple': 2.0, 'shrine': 1.8, 'walking-tour': 1.5 },
          preferences: { budget: 'low' }
        }
      },
      {
        id: 'less_walking',
        name: '🚇 Menos Caminata',
        description: 'Actividades más cercanas con menos desplazamiento',
        adjustments: {
          maxWalkingDistance: 5,
          prioritizeNearbyActivities: true,
          categoryWeights: { 'museum': 1.5, 'shopping': 1.3 }
        }
      },
      {
        id: 'more_food',
        name: '🍜 Más Comida',
        description: 'Enfoque en experiencias gastronómicas',
        adjustments: {
          categoryWeights: { 'restaurant': 2.0, 'market': 2.0, 'street-food': 1.8, 'food-tour': 2.0 },
          interests: ['food', 'culinary'],
          mealRatio: 0.5
        }
      },
      {
        id: 'more_nature',
        name: '🌳 Más Naturaleza',
        description: 'Parques, jardines y actividades al aire libre',
        adjustments: {
          categoryWeights: { 'park': 2.0, 'garden': 2.0, 'hiking': 1.8, 'nature': 2.0 },
          interests: ['nature', 'outdoor']
        }
      },
      {
        id: 'more_modern',
        name: '🏙️ Más Moderno',
        description: 'Tecnología, compras y vida urbana',
        adjustments: {
          categoryWeights: { 'shopping': 2.0, 'arcade': 1.8, 'observation-deck': 1.5, 'modern-architecture': 1.8 },
          interests: ['technology', 'modern', 'shopping']
        }
      },
      {
        id: 'more_relaxed',
        name: '😌 Más Relajado',
        description: 'Ritmo tranquilo con más descansos',
        adjustments: {
          activitiesPerDay: 4,
          categoryWeights: { 'onsen': 2.0, 'tea-ceremony': 1.8, 'zen-garden': 2.0, 'cafe': 1.5 },
          restTimeMultiplier: 1.5
        }
      },
      {
        id: 'more_active',
        name: '🏃 Más Activo',
        description: 'Más actividades y ritmo intenso',
        adjustments: {
          activitiesPerDay: 8,
          categoryWeights: { 'hiking': 2.0, 'walking-tour': 1.8, 'cycling': 1.8 },
          restTimeMultiplier: 0.7
        }
      }
    ];
  }

  /**
   * 🔄 Regenera un día específico del itinerario
   * @param {Object} trip - Viaje completo
   * @param {number} dayIndex - Índice del día a regenerar (0-based)
   * @param {string} optionId - ID de la opción de regeneración
   * @param {Object} generator - Instancia del generador de itinerarios
   * @returns {Promise<Object>} Día regenerado
   */
  async regenerateDay(trip, dayIndex, optionId, generator) {
    console.log(`🔄 Regenerando día ${dayIndex + 1} con opción: ${optionId}`);

    // Obtener opción de regeneración
    const option = this.regenerationOptions.find(opt => opt.id === optionId);
    if (!option) {
      throw new Error(`Opción de regeneración no encontrada: ${optionId}`);
    }

    // Obtener el día original
    const originalDay = trip.itinerary.days[dayIndex];
    if (!originalDay) {
      throw new Error(`Día ${dayIndex + 1} no encontrado en el itinerario`);
    }

    // Crear contexto de regeneración
    const context = this.buildRegenerationContext(trip, originalDay, option);

    // Regenerar actividades del día
    const newActivities = await this.generateNewActivities(context, generator);

    // Construir nuevo día
    const newDay = {
      ...originalDay,
      activities: newActivities,
      regenerated: true,
      regeneratedWith: optionId,
      regeneratedAt: new Date().toISOString(),
      originalActivities: originalDay.activities // Backup
    };

    // Calcular métricas del nuevo día
    newDay.metrics = this.calculateDayMetrics(newDay);

    console.log(`✅ Día ${dayIndex + 1} regenerado con ${newActivities.length} actividades`);

    return newDay;
  }

  /**
   * 🏗️ Construye contexto para regeneración
   */
  buildRegenerationContext(trip, originalDay, option) {
    // Contexto base del viaje
    const baseContext = {
      city: originalDay.city,
      date: originalDay.date,
      dayNumber: originalDay.dayNumber,
      tripDuration: trip.duration,
      interests: trip.preferences?.interests || [],
      budget: trip.preferences?.budget || 'moderate',
      travelStyle: trip.preferences?.travelStyle || 'balanced'
    };

    // Aplicar ajustes de la opción
    const context = {
      ...baseContext,
      ...option.adjustments
    };

    // Si hay intereses en la opción, combinar con los del viaje
    if (option.adjustments.interests) {
      context.interests = [
        ...new Set([...context.interests, ...option.adjustments.interests])
      ];
    }

    // Mantener hotel/alojamiento si existe
    if (trip.hotel) {
      context.hotel = trip.hotel;
    }

    return context;
  }

  /**
   * 🎯 Genera nuevas actividades para el día
   */
  async generateNewActivities(context, generator) {
    // Si hay un generador custom, usarlo
    if (generator && typeof generator.generateActivitiesForDay === 'function') {
      return await generator.generateActivitiesForDay(context);
    }

    // Fallback: generar actividades básicas
    return this.generateBasicActivities(context);
  }

  /**
   * 🎲 Genera actividades básicas (fallback si no hay generador)
   */
  generateBasicActivities(context) {
    const activities = [];
    const numActivities = context.activitiesPerDay || 5;

    // Esta es una implementación simplificada
    // En producción, debería integrarse con el sistema de generación real
    console.warn('⚠️ Usando generador básico - considera integrar con SmartItineraryGenerator');

    for (let i = 0; i < numActivities; i++) {
      activities.push({
        id: `regen_${Date.now()}_${i}`,
        name: `Actividad ${i + 1}`,
        category: 'general',
        duration: 90,
        cost: 1500,
        description: 'Actividad regenerada - requiere integración con generador real',
        city: context.city,
        regenerated: true
      });
    }

    return activities;
  }

  /**
   * 📊 Calcula métricas del día
   */
  calculateDayMetrics(day) {
    const activities = day.activities || [];

    return {
      totalActivities: activities.length,
      totalDuration: activities.reduce((sum, act) => sum + (act.duration || 60), 0),
      totalCost: activities.reduce((sum, act) => sum + (act.cost || 0), 0),
      categories: this.countCategories(activities),
      estimatedWalking: activities.length * 2, // ~2km por actividad
      startTime: day.startTime || '09:00',
      endTime: this.calculateEndTime(day.startTime || '09:00', activities)
    };
  }

  /**
   * 📊 Cuenta categorías de actividades
   */
  countCategories(activities) {
    const counts = {};

    activities.forEach(activity => {
      const category = activity.category || 'general';
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }

  /**
   * ⏰ Calcula hora de fin del día
   */
  calculateEndTime(startTime, activities) {
    const [hours, minutes] = startTime.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;

    activities.forEach(activity => {
      totalMinutes += activity.duration || 60;
      totalMinutes += 15; // Tiempo de tránsito entre actividades
    });

    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * 📋 Compara día original vs regenerado
   * @param {Object} originalDay
   * @param {Object} newDay
   * @returns {Object} Comparación
   */
  compareDay(originalDay, newDay) {
    const original = this.calculateDayMetrics(originalDay);
    const regenerated = this.calculateDayMetrics(newDay);

    return {
      activities: {
        before: original.totalActivities,
        after: regenerated.totalActivities,
        change: regenerated.totalActivities - original.totalActivities
      },
      cost: {
        before: original.totalCost,
        after: regenerated.totalCost,
        change: regenerated.totalCost - original.totalCost,
        percentChange: ((regenerated.totalCost - original.totalCost) / original.totalCost * 100).toFixed(1)
      },
      duration: {
        before: original.totalDuration,
        after: regenerated.totalDuration,
        change: regenerated.totalDuration - original.totalDuration
      },
      categories: {
        before: original.categories,
        after: regenerated.categories
      }
    };
  }

  /**
   * 🎨 Renderiza UI de opciones de regeneración
   * @param {string} containerId - ID del contenedor
   * @param {Function} onSelect - Callback cuando se selecciona una opción
   */
  renderRegenerationOptions(containerId, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `
      <div class="regeneration-options">
        <h3 class="text-xl font-bold mb-4">🔄 ¿Cómo quieres regenerar este día?</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    `;

    this.regenerationOptions.forEach(option => {
      html += `
        <button
          class="regen-option-btn p-4 rounded-lg border-2 border-purple-300 hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 transition-all cursor-pointer text-left"
          data-option-id="${option.id}"
        >
          <div class="text-2xl mb-2">${option.name}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">${option.description}</div>
        </button>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Agregar event listeners
    container.querySelectorAll('.regen-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const optionId = btn.getAttribute('data-option-id');
        if (onSelect) {
          onSelect(optionId);
        }
      });
    });
  }

  /**
   * 💾 Guarda historial de regeneraciones
   */
  saveRegenerationHistory(tripId, dayIndex, optionId, comparison) {
    try {
      const key = `regen_history_${tripId}`;
      let history = JSON.parse(localStorage.getItem(key) || '[]');

      history.push({
        timestamp: new Date().toISOString(),
        dayIndex,
        optionId,
        comparison
      });

      // Mantener solo últimas 50 regeneraciones
      if (history.length > 50) {
        history = history.slice(-50);
      }

      localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {
      console.warn('Error guardando historial de regeneración:', e);
    }
  }

  /**
   * 📊 Obtiene estadísticas de regeneraciones
   */
  getRegenerationStats(tripId) {
    try {
      const key = `regen_history_${tripId}`;
      const history = JSON.parse(localStorage.getItem(key) || '[]');

      if (history.length === 0) {
        return { totalRegenerations: 0, favoriteOption: null };
      }

      // Contar opciones más usadas
      const optionCounts = {};
      history.forEach(entry => {
        optionCounts[entry.optionId] = (optionCounts[entry.optionId] || 0) + 1;
      });

      const favoriteOption = Object.entries(optionCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      return {
        totalRegenerations: history.length,
        favoriteOption,
        optionCounts,
        lastRegeneration: history[history.length - 1]
      };
    } catch (e) {
      return { totalRegenerations: 0, favoriteOption: null };
    }
  }
}

// 🌐 Exportar para uso global
if (typeof window !== 'undefined') {
  window.DayRegenerator = DayRegenerator;
}
