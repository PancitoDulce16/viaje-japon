// js/itinerary-intelligence.js - Sistema de Inteligencia del Itinerario
// Detecta conflictos, analiza presupuestos, estima traslados, y sugiere optimizaciones

/**
 * Sistema de Inteligencia del Itinerario
 * Analiza el itinerario completo y genera insights inteligentes
 */
export const ItineraryIntelligence = {

  /**
   * 1. DETECCIÓN DE CONFLICTOS DE HORARIOS
   * Analiza un día y detecta problemas de scheduling
   */
  detectConflicts(day) {
    const conflicts = [];

    if (!day.activities || day.activities.length === 0) {
      return conflicts;
    }

    // Ordenar actividades por tiempo
    const sortedActivities = [...day.activities]
      .filter(a => a.time)
      .sort((a, b) => this.parseTime(a.time) - this.parseTime(b.time));

    for (let i = 0; i < sortedActivities.length - 1; i++) {
      const current = sortedActivities[i];
      const next = sortedActivities[i + 1];

      const currentStart = this.parseTime(current.time);
      const currentEnd = currentStart + (current.duration || 90);
      const nextStart = this.parseTime(next.time);

      // CONFLICTO 1: Actividades solapadas
      if (currentEnd > nextStart) {
        const overlapMinutes = currentEnd - nextStart;
        conflicts.push({
          type: 'overlap',
          severity: 'high',
          icon: '⚠️',
          title: 'Horarios solapados',
          message: `"${current.title}" termina ${this.formatTime(currentEnd)} pero "${next.title}" empieza ${next.time}`,
          detail: `Solapamiento de ${overlapMinutes} minutos`,
          activities: [current.id, next.id],
          suggestion: 'Ajusta los horarios o duraciones para evitar conflictos'
        });
      }

      // CONFLICTO 2: Tiempo insuficiente entre actividades (< 15 min para traslado)
      const gapMinutes = nextStart - currentEnd;
      if (gapMinutes > 0 && gapMinutes < 15) {
        conflicts.push({
          type: 'tight_schedule',
          severity: 'medium',
          icon: '⏰',
          title: 'Tiempo muy ajustado',
          message: `Solo ${gapMinutes} min entre "${current.title}" y "${next.title}"`,
          detail: 'Puede no ser suficiente para el traslado',
          activities: [current.id, next.id],
          suggestion: 'Considera agregar 15-30 min de buffer para traslado'
        });
      }

      // CONFLICTO 3: Backtracking (volver al mismo lugar)
      if (current.coordinates && next.coordinates && sortedActivities[i + 2]?.coordinates) {
        const nextNext = sortedActivities[i + 2];
        const dist1to2 = this.calculateDistance(current.coordinates, next.coordinates);
        const dist2to3 = this.calculateDistance(next.coordinates, nextNext.coordinates);
        const dist1to3 = this.calculateDistance(current.coordinates, nextNext.coordinates);

        // Si la distancia 1->3 es menor que 1->2 + 2->3, hay backtracking
        if (dist1to3 < (dist1to2 + dist2to3) * 0.7) {
          conflicts.push({
            type: 'backtracking',
            severity: 'low',
            icon: '🔄',
            title: 'Ruta ineficiente detectada',
            message: `Ir de "${current.title}" → "${next.title}" → "${nextNext.title}" implica volver atrás`,
            detail: `Considera reordenar: "${current.title}" → "${nextNext.title}" → "${next.title}"`,
            activities: [current.id, next.id, nextNext.id],
            suggestion: 'Usa el optimizador de ruta para mejorar el orden'
          });
        }
      }
    }

    // CONFLICTO 4: Día muy largo (> 14 horas de actividades)
    if (sortedActivities.length > 0) {
      const firstStart = this.parseTime(sortedActivities[0].time);
      const lastStart = this.parseTime(sortedActivities[sortedActivities.length - 1].time);
      const lastDuration = sortedActivities[sortedActivities.length - 1].duration || 90;
      const lastEnd = lastStart + lastDuration;
      const totalHours = (lastEnd - firstStart) / 60;

      if (totalHours > 14) {
        conflicts.push({
          type: 'too_long',
          severity: 'medium',
          icon: '😓',
          title: 'Día muy extenso',
          message: `Este día dura ${totalHours.toFixed(1)} horas`,
          detail: 'Puede ser agotador',
          activities: [],
          suggestion: 'Considera mover algunas actividades a otro día o eliminar las menos importantes'
        });
      }
    }

    return conflicts;
  },

  /**
   * 2. ESTIMACIÓN DE TIEMPOS DE TRASLADO
   * Calcula tiempo y costo estimado entre actividades
   */
  estimateTravelTime(from, to) {
    if (!from.coordinates || !to.coordinates) {
      return null;
    }

    const distance = this.calculateDistance(from.coordinates, to.coordinates);

    // Estimaciones basadas en distancia (Japón tiene excelente transporte público)
    let travelMinutes, transportMode, estimatedCost;

    if (distance < 0.5) {
      // Menos de 500m - caminar
      travelMinutes = Math.ceil(distance * 15); // 15 min por km
      transportMode = '🚶 Caminar';
      estimatedCost = 0;
    } else if (distance < 2) {
      // 0.5-2 km - caminar o metro corto
      travelMinutes = Math.ceil(distance * 12);
      transportMode = '🚇 Metro';
      estimatedCost = 170; // Tarifa base metro Tokyo
    } else if (distance < 5) {
      // 2-5 km - metro
      travelMinutes = Math.ceil(distance * 8);
      transportMode = '🚇 Metro';
      estimatedCost = 200;
    } else if (distance < 15) {
      // 5-15 km - metro/tren
      travelMinutes = Math.ceil(distance * 6);
      transportMode = '🚆 Tren';
      estimatedCost = 300;
    } else if (distance < 50) {
      // 15-50 km - tren
      travelMinutes = Math.ceil(distance * 4);
      transportMode = '🚄 Tren';
      estimatedCost = 800;
    } else {
      // > 50 km - shinkansen o tren largo
      travelMinutes = Math.ceil(distance * 2.5);
      transportMode = '🚅 Shinkansen';
      estimatedCost = Math.ceil(distance * 20); // ~20¥/km
    }

    return {
      distance: distance.toFixed(1),
      travelMinutes,
      transportMode,
      estimatedCost,
      warning: travelMinutes > 60 ? 'Traslado largo, considera optimizar ruta' : null
    };
  },

  /**
   * 3. ANÁLISIS DE PRESUPUESTO TOTAL
   * Analiza gastos de todo el viaje
   */
  analyzeTripBudget(itinerary) {
    if (!itinerary || !itinerary.days) {
      return null;
    }

    const dayBudgets = itinerary.days.map(day => {
      const totalCost = this.calculateDayTotalCost(day);
      const budget = day.budget || 0;

      return {
        day: day.day,
        totalCost,
        budget,
        remaining: budget - totalCost,
        percentUsed: budget > 0 ? (totalCost / budget) * 100 : 0,
        overBudget: totalCost > budget && budget > 0
      };
    });

    const totalSpent = dayBudgets.reduce((sum, d) => sum + d.totalCost, 0);
    const totalBudget = dayBudgets.reduce((sum, d) => sum + d.budget, 0);
    const daysOverBudget = dayBudgets.filter(d => d.overBudget).length;
    const avgCostPerDay = totalSpent / itinerary.days.length;

    // Encontrar día más caro y más barato
    const mostExpensiveDay = dayBudgets.reduce((max, d) => d.totalCost > max.totalCost ? d : max, dayBudgets[0]);
    const cheapestDay = dayBudgets.filter(d => d.totalCost > 0).reduce((min, d) => d.totalCost < min.totalCost ? d : min, dayBudgets[0]);

    // Análisis de desviación
    const costDeviation = dayBudgets.map(d => {
      const deviation = ((d.totalCost - avgCostPerDay) / avgCostPerDay) * 100;
      return { day: d.day, deviation };
    }).filter(d => Math.abs(d.deviation) > 30); // Días con +/- 30% de desviación

    return {
      totalSpent,
      totalBudget,
      totalRemaining: totalBudget - totalSpent,
      avgCostPerDay: Math.round(avgCostPerDay),
      daysOverBudget,
      mostExpensiveDay,
      cheapestDay,
      costDeviation,
      dayBudgets,
      warnings: this.generateBudgetWarnings(dayBudgets, totalSpent, totalBudget)
    };
  },

  /**
   * 4. DETECCIÓN DE DÍAS SOBRECARGADOS
   * Analiza si un día tiene demasiadas actividades
   */
  analyzeOverloadedDays(itinerary) {
    if (!itinerary || !itinerary.days) {
      return [];
    }

    const overloadedDays = [];

    itinerary.days.forEach(day => {
      if (!day.activities || day.activities.length === 0) {
        return;
      }

      const activitiesWithTime = day.activities.filter(a => a.time);
      const activityCount = activitiesWithTime.length;

      // Calcular duración total del día
      const sortedActivities = [...activitiesWithTime].sort((a, b) =>
        this.parseTime(a.time) - this.parseTime(b.time)
      );

      if (sortedActivities.length === 0) return;

      const firstStart = this.parseTime(sortedActivities[0].time);
      const lastActivity = sortedActivities[sortedActivities.length - 1];
      const lastEnd = this.parseTime(lastActivity.time) + (lastActivity.duration || 90);
      const totalMinutes = lastEnd - firstStart;
      const totalHours = totalMinutes / 60;

      // Calcular "puntos de fatiga"
      let fatiguePoints = 0;

      // +1 punto por cada actividad después de 5
      if (activityCount > 5) {
        fatiguePoints += (activityCount - 5) * 1;
      }

      // +2 puntos si el día es > 12 horas
      if (totalHours > 12) {
        fatiguePoints += 2;
      }

      // +1 punto por cada hora después de 10 horas
      if (totalHours > 10) {
        fatiguePoints += Math.floor(totalHours - 10);
      }

      // +1 punto si hay poco tiempo entre actividades
      for (let i = 0; i < sortedActivities.length - 1; i++) {
        const current = sortedActivities[i];
        const next = sortedActivities[i + 1];
        const gap = this.parseTime(next.time) - (this.parseTime(current.time) + (current.duration || 90));
        if (gap < 15) {
          fatiguePoints += 1;
        }
      }

      // Determinar nivel de sobrecarga
      let overloadLevel = 'normal';
      let severity = 'low';
      let message = '';
      let suggestions = [];

      if (fatiguePoints >= 8) {
        overloadLevel = 'extreme';
        severity = 'high';
        message = `Día EXTREMADAMENTE intenso (${activityCount} actividades, ${totalHours.toFixed(1)}h)`;
        suggestions = [
          'Considera eliminar 3-4 actividades',
          'Divide este día en 2 días diferentes',
          'Agrega al menos 1 hora de descanso entre bloques'
        ];
      } else if (fatiguePoints >= 5) {
        overloadLevel = 'high';
        severity = 'medium';
        message = `Día muy intenso (${activityCount} actividades, ${totalHours.toFixed(1)}h)`;
        suggestions = [
          'Considera mover 1-2 actividades a otro día',
          'Agrega tiempo de descanso entre actividades',
          'Verifica que haya tiempo para comidas'
        ];
      } else if (fatiguePoints >= 3) {
        overloadLevel = 'moderate';
        severity = 'low';
        message = `Día moderadamente ocupado (${activityCount} actividades, ${totalHours.toFixed(1)}h)`;
        suggestions = [
          'Día balanceado, pero no agregues más actividades',
          'Asegúrate de tener tiempo para traslados'
        ];
      }

      if (overloadLevel !== 'normal') {
        overloadedDays.push({
          day: day.day,
          overloadLevel,
          severity,
          fatiguePoints,
          activityCount,
          totalHours: totalHours.toFixed(1),
          message,
          suggestions,
          icon: overloadLevel === 'extreme' ? '🚨' : overloadLevel === 'high' ? '😓' : '😅'
        });
      }
    });

    return overloadedDays;
  },

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  parseTime(timeStr) {
    if (!timeStr) return 540; // Default 09:00
    const parts = String(timeStr).split(':');
    if (parts.length !== 2) return 540;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return 540;
    return hours * 60 + minutes;
  },

  formatTime(minutes) {
    if (!isFinite(minutes) || isNaN(minutes)) minutes = 540;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },

  calculateDayTotalCost(day) {
    if (!day || !day.activities) return 0;
    return day.activities.reduce((total, activity) => {
      const cost = parseFloat(activity.cost) || 0;
      return total + cost;
    }, 0);
  },

  calculateDistance(coord1, coord2) {
    // Fórmula de Haversine para calcular distancia entre coordenadas
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLon = this.deg2rad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance; // Distancia en km
  },

  deg2rad(deg) {
    return deg * (Math.PI/180);
  },

  generateBudgetWarnings(dayBudgets, totalSpent, totalBudget) {
    const warnings = [];

    // Warning 1: Presupuesto total excedido
    if (totalBudget > 0 && totalSpent > totalBudget) {
      const excess = totalSpent - totalBudget;
      warnings.push({
        type: 'over_total_budget',
        severity: 'high',
        icon: '🚨',
        message: `Presupuesto total excedido por ¥${excess.toLocaleString()}`,
        suggestion: 'Revisa los días más caros y busca alternativas económicas'
      });
    }

    // Warning 2: Días individuales sobre presupuesto
    const overBudgetDays = dayBudgets.filter(d => d.overBudget);
    if (overBudgetDays.length > 0) {
      warnings.push({
        type: 'days_over_budget',
        severity: 'medium',
        icon: '⚠️',
        message: `${overBudgetDays.length} día(s) sobre presupuesto`,
        suggestion: 'Ajusta actividades en estos días para reducir costos',
        days: overBudgetDays.map(d => d.day)
      });
    }

    // Warning 3: Gran desviación entre días
    const costs = dayBudgets.map(d => d.totalCost).filter(c => c > 0);
    if (costs.length > 0) {
      const max = Math.max(...costs);
      const min = Math.min(...costs);
      const ratio = max / min;

      if (ratio > 3) {
        warnings.push({
          type: 'unbalanced_costs',
          severity: 'low',
          icon: '📊',
          message: 'Costos muy desbalanceados entre días',
          suggestion: 'Considera redistribuir actividades para balancear gastos'
        });
      }
    }

    return warnings;
  }
};

// Exportar a window
window.ItineraryIntelligence = ItineraryIntelligence;

console.log('✅ Itinerary Intelligence System cargado - TIER 1 Features');
