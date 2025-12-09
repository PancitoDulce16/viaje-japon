/**
 * ⚡ PREDICTOR DE ENERGÍA Y BURNOUT
 * ==================================
 *
 * Sistema que predice niveles de energía día a día durante el viaje
 * y advierte sobre riesgo de burnout (agotamiento).
 *
 * Factores considerados:
 * - Jet lag (primeros 2-3 días)
 * - Acumulación de fatiga
 * - Intensidad de actividades
 * - Distancia caminada
 * - Días de descanso
 * - Calidad de sueño estimada
 * - Número de actividades por día
 *
 * Salidas:
 * - Nivel de energía por día (0-100%)
 * - Predicción de burnout
 * - Sugerencias de días ligeros
 * - Alertas tempranas
 */

class EnergyBurnoutPredictor {
  constructor() {
    // Configuración de parámetros del modelo
    this.config = {
      // Energía inicial (100%)
      initialEnergy: 100,

      // Jet lag: reduce energía primeros días
      jetLagDays: 3,
      jetLagPenalty: 15, // -15% de energía

      // Fatiga acumulada
      fatigueAccumulationRate: 0.85, // Cada día retiene 85% de fatiga anterior
      baseFatiguePerDay: 8, // Fatiga base por día

      // Intensidad de actividades
      intensityWeights: {
        relaxed: 5,   // +5% fatiga
        moderate: 10, // +10% fatiga
        intense: 20,  // +20% fatiga
        extreme: 35   // +35% fatiga
      },

      // Distancia caminada
      walkingFatigue: 1.5, // 1.5% fatiga por km caminado
      maxWalkingWithoutPenalty: 10, // hasta 10km sin penalidad extra

      // Recuperación
      restDayRecovery: 30, // +30% energía en día de descanso
      lowIntensityRecovery: 15, // +15% en día ligero

      // Umbrales
      thresholds: {
        burnoutRisk: 40,     // < 40% = alto riesgo de burnout
        lowEnergy: 60,       // < 60% = energía baja
        needsRest: 50        // < 50% = necesita descanso urgente
      }
    };

    console.log('⚡ Energy Burnout Predictor initialized');
  }

  /**
   * 🎯 Predice energía para todo el itinerario
   * @param {Object} itinerary - Itinerario completo
   * @returns {Object} Predicción con niveles de energía, alertas y sugerencias
   */
  predictEnergyLevels(itinerary) {
    console.log('⚡ Predicting energy levels...');

    const days = itinerary.days || [];
    const predictions = [];
    let cumulativeFatigue = 0;

    // Analizar cada día
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const dayNumber = i + 1;

      // 1. Calcular fatiga del día
      const dayFatigue = this.calculateDayFatigue(day, dayNumber);

      // 2. Acumular fatiga
      cumulativeFatigue = (cumulativeFatigue * this.config.fatigueAccumulationRate) + dayFatigue;

      // 3. Calcular energía resultante
      let energy = this.config.initialEnergy - cumulativeFatigue;

      // 4. Aplicar jet lag en primeros días
      if (dayNumber <= this.config.jetLagDays) {
        const jetLagEffect = this.config.jetLagPenalty * (1 - (dayNumber - 1) / this.config.jetLagDays);
        energy -= jetLagEffect;
      }

      // 5. Aplicar recuperación si es día de descanso
      if (this.isRestDay(day)) {
        energy += this.config.restDayRecovery;
        cumulativeFatigue = Math.max(0, cumulativeFatigue - this.config.restDayRecovery);
      } else if (this.isLowIntensityDay(day)) {
        energy += this.config.lowIntensityRecovery;
      }

      // 6. Limitar energía entre 0-100
      energy = Math.max(0, Math.min(100, energy));

      // 7. Determinar estado
      const state = this.determineEnergyState(energy);

      // 8. Guardar predicción
      predictions.push({
        dayNumber,
        energy: Math.round(energy),
        fatigue: Math.round(cumulativeFatigue),
        dayFatigue: Math.round(dayFatigue),
        state,
        isRestDay: this.isRestDay(day),
        jetLagActive: dayNumber <= this.config.jetLagDays,
        metrics: {
          activities: day.activities?.length || 0,
          walking: this.estimateWalkingDistance(day),
          intensity: day.paceLevel || 'moderate'
        }
      });
    }

    // Analizar patrones y generar alertas
    const analysis = this.analyzeEnergyPattern(predictions);

    return {
      predictions,
      analysis,
      recommendations: this.generateRecommendations(predictions, analysis),
      summary: this.generateSummary(predictions, analysis)
    };
  }

  /**
   * 📊 Calcula fatiga de un día específico
   */
  calculateDayFatigue(day, dayNumber) {
    let fatigue = this.config.baseFatiguePerDay;

    // 1. Fatiga por intensidad
    const paceLevel = day.paceLevel || 'moderate';
    fatigue += this.config.intensityWeights[paceLevel] || this.config.intensityWeights.moderate;

    // 2. Fatiga por número de actividades
    const activityCount = day.activities?.length || 0;
    if (activityCount > 6) {
      fatigue += (activityCount - 6) * 3; // +3% por actividad extra
    }

    // 3. Fatiga por distancia caminada
    const walking = this.estimateWalkingDistance(day);
    if (walking > this.config.maxWalkingWithoutPenalty) {
      const extraWalking = walking - this.config.maxWalkingWithoutPenalty;
      fatigue += extraWalking * this.config.walkingFatigue;
    }

    // 4. Fatiga por duración de actividades
    const totalDuration = this.calculateTotalDuration(day);
    if (totalDuration > 600) { // más de 10 horas
      fatigue += (totalDuration - 600) / 60 * 2; // +2% por hora extra
    }

    return fatigue;
  }

  /**
   * 🚶 Estima distancia caminada en el día
   */
  estimateWalkingDistance(day) {
    if (!day.activities || day.activities.length === 0) return 0;

    let totalDistance = 0;

    for (let i = 0; i < day.activities.length - 1; i++) {
      const current = day.activities[i];
      const next = day.activities[i + 1];

      if (current.location?.coordinates && next.location?.coordinates) {
        const distance = this.haversineDistance(
          current.location.coordinates,
          next.location.coordinates
        );
        totalDistance += distance;
      }
    }

    // Añadir distancia dentro de cada actividad (estimado)
    totalDistance += day.activities.length * 0.5; // 500m por actividad

    return totalDistance;
  }

  /**
   * ⏱️ Calcula duración total de actividades
   */
  calculateTotalDuration(day) {
    if (!day.activities) return 0;

    return day.activities.reduce((total, activity) => {
      return total + (activity.duration || 60);
    }, 0);
  }

  /**
   * 😴 Determina si es día de descanso
   */
  isRestDay(day) {
    const activities = day.activities?.length || 0;
    return activities <= 2 || day.isRestDay === true;
  }

  /**
   * 🌿 Determina si es día de baja intensidad
   */
  isLowIntensityDay(day) {
    const activities = day.activities?.length || 0;
    const paceLevel = day.paceLevel || 'moderate';
    return activities <= 4 && paceLevel === 'relaxed';
  }

  /**
   * 📊 Determina estado de energía
   */
  determineEnergyState(energy) {
    if (energy < this.config.thresholds.burnoutRisk) {
      return {
        level: 'critical',
        label: 'Alto riesgo de burnout',
        emoji: '🔴',
        color: 'red'
      };
    } else if (energy < this.config.thresholds.needsRest) {
      return {
        level: 'warning',
        label: 'Necesita descanso',
        emoji: '🟡',
        color: 'yellow'
      };
    } else if (energy < this.config.thresholds.lowEnergy) {
      return {
        level: 'low',
        label: 'Energía baja',
        emoji: '🟠',
        color: 'orange'
      };
    } else {
      return {
        level: 'good',
        label: 'Energía buena',
        emoji: '🟢',
        color: 'green'
      };
    }
  }

  /**
   * 📈 Analiza patrón de energía
   */
  analyzeEnergyPattern(predictions) {
    const criticalDays = predictions.filter(p => p.state.level === 'critical');
    const warningDays = predictions.filter(p => p.state.level === 'warning');
    const lowDays = predictions.filter(p => p.state.level === 'low');

    // Detectar períodos prolongados de baja energía
    const consecutiveLowEnergyPeriods = this.findConsecutiveLowEnergyPeriods(predictions);

    // Calcular energía promedio
    const avgEnergy = predictions.reduce((sum, p) => sum + p.energy, 0) / predictions.length;

    // Detectar tendencia
    const trend = this.detectEnergyTrend(predictions);

    return {
      criticalDays: criticalDays.map(p => p.dayNumber),
      warningDays: warningDays.map(p => p.dayNumber),
      lowDays: lowDays.map(p => p.dayNumber),
      consecutiveLowEnergyPeriods,
      avgEnergy: Math.round(avgEnergy),
      trend,
      hasBurnoutRisk: criticalDays.length > 0 || consecutiveLowEnergyPeriods.length > 0,
      severity: this.calculateSeverity(criticalDays.length, warningDays.length, consecutiveLowEnergyPeriods.length)
    };
  }

  /**
   * 🔍 Encuentra períodos consecutivos de baja energía
   */
  findConsecutiveLowEnergyPeriods(predictions) {
    const periods = [];
    let currentPeriod = null;

    for (const pred of predictions) {
      if (pred.energy < this.config.thresholds.lowEnergy) {
        if (!currentPeriod) {
          currentPeriod = {
            start: pred.dayNumber,
            end: pred.dayNumber,
            days: [pred.dayNumber],
            minEnergy: pred.energy
          };
        } else {
          currentPeriod.end = pred.dayNumber;
          currentPeriod.days.push(pred.dayNumber);
          currentPeriod.minEnergy = Math.min(currentPeriod.minEnergy, pred.energy);
        }
      } else {
        if (currentPeriod && currentPeriod.days.length >= 3) {
          periods.push(currentPeriod);
        }
        currentPeriod = null;
      }
    }

    // Agregar último período si existe
    if (currentPeriod && currentPeriod.days.length >= 3) {
      periods.push(currentPeriod);
    }

    return periods;
  }

  /**
   * 📉 Detecta tendencia de energía
   */
  detectEnergyTrend(predictions) {
    if (predictions.length < 3) return 'stable';

    const firstThird = predictions.slice(0, Math.floor(predictions.length / 3));
    const lastThird = predictions.slice(-Math.floor(predictions.length / 3));

    const avgFirst = firstThird.reduce((sum, p) => sum + p.energy, 0) / firstThird.length;
    const avgLast = lastThird.reduce((sum, p) => sum + p.energy, 0) / lastThird.length;

    const diff = avgLast - avgFirst;

    if (diff < -10) return 'declining';
    if (diff > 10) return 'improving';
    return 'stable';
  }

  /**
   * 🎯 Calcula severidad del problema
   */
  calculateSeverity(criticalCount, warningCount, periodsCount) {
    const score = (criticalCount * 3) + (warningCount * 2) + (periodsCount * 4);

    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    if (score > 0) return 'low';
    return 'none';
  }

  /**
   * 💡 Genera recomendaciones
   */
  generateRecommendations(predictions, analysis) {
    const recommendations = [];

    // 1. Días críticos
    if (analysis.criticalDays.length > 0) {
      recommendations.push({
        type: 'critical',
        priority: 'high',
        title: 'Riesgo Alto de Burnout',
        message: `Los días ${analysis.criticalDays.join(', ')} tienen niveles críticos de energía. Considera reducir actividades o agregar días de descanso.`,
        affectedDays: analysis.criticalDays,
        action: 'reduce_activities'
      });
    }

    // 2. Períodos prolongados de baja energía
    if (analysis.consecutiveLowEnergyPeriods.length > 0) {
      for (const period of analysis.consecutiveLowEnergyPeriods) {
        recommendations.push({
          type: 'warning',
          priority: 'high',
          title: 'Período Prolongado de Baja Energía',
          message: `Del día ${period.start} al ${period.end} (${period.days.length} días) la energía se mantiene baja. Inserta un día de descanso.`,
          affectedDays: period.days,
          action: 'insert_rest_day',
          suggestedRestDay: Math.floor((period.start + period.end) / 2)
        });
      }
    }

    // 3. Tendencia decreciente
    if (analysis.trend === 'declining') {
      recommendations.push({
        type: 'warning',
        priority: 'medium',
        title: 'Energía en Descenso',
        message: 'La energía disminuye conforme avanza el viaje. Considera redistribuir actividades intensas hacia los primeros días.',
        action: 'redistribute_intensity'
      });
    }

    // 4. Jet lag severo
    const jetLagDays = predictions.filter(p => p.jetLagActive && p.energy < 60);
    if (jetLagDays.length >= 2) {
      recommendations.push({
        type: 'suggestion',
        priority: 'medium',
        title: 'Jet Lag Intenso',
        message: 'Los primeros días estarás adaptándote al horario. Programa actividades ligeras al inicio.',
        affectedDays: jetLagDays.map(p => p.dayNumber),
        action: 'lighten_first_days'
      });
    }

    // 5. Días muy cargados
    const overloadedDays = predictions.filter(p => p.metrics.activities > 7);
    if (overloadedDays.length > 0) {
      recommendations.push({
        type: 'suggestion',
        priority: 'low',
        title: 'Días Sobrecargados',
        message: `Los días ${overloadedDays.map(p => p.dayNumber).join(', ')} tienen muchas actividades (${overloadedDays[0].metrics.activities}+). Considera reducir a 5-6 por día.`,
        affectedDays: overloadedDays.map(p => p.dayNumber),
        action: 'reduce_daily_activities'
      });
    }

    // 6. Falta de días de descanso
    const restDays = predictions.filter(p => p.isRestDay);
    const tripLength = predictions.length;
    if (tripLength > 7 && restDays.length === 0) {
      recommendations.push({
        type: 'suggestion',
        priority: 'high',
        title: 'Sin Días de Descanso',
        message: `Para un viaje de ${tripLength} días, es recomendable tener al menos 1-2 días de descanso para recuperación.`,
        action: 'add_rest_day',
        suggestedRestDay: Math.floor(tripLength / 2)
      });
    }

    return recommendations;
  }

  /**
   * 📋 Genera resumen ejecutivo
   */
  generateSummary(predictions, analysis) {
    const tripLength = predictions.length;
    const restDays = predictions.filter(p => p.isRestDay).length;

    return {
      tripLength,
      restDays,
      averageEnergy: analysis.avgEnergy,
      trend: analysis.trend,
      severity: analysis.severity,
      hasBurnoutRisk: analysis.hasBurnoutRisk,
      healthScore: this.calculateHealthScore(predictions, analysis),
      verdict: this.generateVerdict(analysis)
    };
  }

  /**
   * 🏥 Calcula health score del itinerario (0-100)
   */
  calculateHealthScore(predictions, analysis) {
    let score = 100;

    // Penalizar días críticos
    score -= analysis.criticalDays.length * 15;

    // Penalizar días de advertencia
    score -= analysis.warningDays.length * 8;

    // Penalizar períodos prolongados
    score -= analysis.consecutiveLowEnergyPeriods.length * 12;

    // Penalizar tendencia decreciente
    if (analysis.trend === 'declining') score -= 10;

    // Bonificar energía promedio alta
    if (analysis.avgEnergy > 70) score += 5;
    if (analysis.avgEnergy > 80) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * ✅ Genera veredicto general
   */
  generateVerdict(analysis) {
    if (analysis.severity === 'high') {
      return {
        emoji: '🔴',
        text: 'Alto riesgo de agotamiento',
        description: 'Este itinerario es muy demandante y probablemente cause burnout. Se recomiendan cambios urgentes.'
      };
    } else if (analysis.severity === 'medium') {
      return {
        emoji: '🟡',
        text: 'Riesgo moderado de fatiga',
        description: 'El itinerario es intenso. Considera agregar días de descanso o reducir actividades.'
      };
    } else if (analysis.severity === 'low') {
      return {
        emoji: '🟢',
        text: 'Ritmo sostenible',
        description: 'El itinerario tiene un buen balance, pero observa las recomendaciones menores.'
      };
    } else {
      return {
        emoji: '✨',
        text: 'Ritmo excelente',
        description: 'Este itinerario tiene un balance perfecto entre actividad y descanso.'
      };
    }
  }

  /**
   * 📐 Distancia Haversine (reutilizada)
   */
  haversineDistance(coords1, coords2) {
    const R = 6371; // Radio de la Tierra en km
    const lat1 = coords1.lat * Math.PI / 180;
    const lat2 = coords2.lat * Math.PI / 180;
    const deltaLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const deltaLon = (coords2.lon - coords1.lon) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * 🎨 Renderiza visualización de energía
   * @param {string} canvasId - ID del canvas
   * @param {Object} energyData - Datos de predicción de energía
   */
  renderEnergyChart(canvasId, energyData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas ${canvasId} not found`);
      return;
    }

    const ctx = canvas.getContext('2d');
    const { predictions } = energyData;

    // Preparar datos para Chart.js
    const labels = predictions.map(p => `Día ${p.dayNumber}`);
    const energyValues = predictions.map(p => p.energy);
    const fatigueValues = predictions.map(p => p.fatigue);

    // Colores según estado
    const backgroundColors = predictions.map(p => {
      switch (p.state.level) {
        case 'critical': return 'rgba(239, 68, 68, 0.2)';
        case 'warning': return 'rgba(251, 191, 36, 0.2)';
        case 'low': return 'rgba(249, 115, 22, 0.2)';
        default: return 'rgba(34, 197, 94, 0.2)';
      }
    });

    const borderColors = predictions.map(p => {
      switch (p.state.level) {
        case 'critical': return 'rgb(239, 68, 68)';
        case 'warning': return 'rgb(251, 191, 36)';
        case 'low': return 'rgb(249, 115, 22)';
        default: return 'rgb(34, 197, 94)';
      }
    });

    // Crear gráfico
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Nivel de Energía (%)',
            data: energyValues,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: borderColors,
            pointBorderColor: borderColors,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Fatiga Acumulada',
            data: fatigueValues,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Predicción de Energía Durante el Viaje',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const pred = predictions[context.dataIndex];
                return [
                  `Estado: ${pred.state.label}`,
                  `Actividades: ${pred.metrics.activities}`,
                  `Caminata: ${pred.metrics.walking.toFixed(1)} km`,
                  pred.jetLagActive ? '⚠️ Jet lag activo' : '',
                  pred.isRestDay ? '😴 Día de descanso' : ''
                ].filter(Boolean);
              }
            }
          },
          annotation: {
            annotations: {
              burnoutLine: {
                type: 'line',
                yMin: 40,
                yMax: 40,
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 2,
                borderDash: [10, 5],
                label: {
                  content: 'Riesgo de Burnout',
                  enabled: true,
                  position: 'end'
                }
              },
              lowEnergyLine: {
                type: 'line',
                yMin: 60,
                yMax: 60,
                borderColor: 'rgb(251, 191, 36)',
                borderWidth: 1,
                borderDash: [5, 5],
                label: {
                  content: 'Energía Baja',
                  enabled: true,
                  position: 'start'
                }
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Nivel (%)'
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Día del Viaje'
            }
          }
        }
      }
    });
  }

  /**
   * 🎨 Renderiza reporte de energía
   */
  renderEnergyReport(containerId, energyData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { predictions, analysis, recommendations, summary } = energyData;

    const html = `
      <div class="energy-report space-y-6">
        <!-- Resumen General -->
        <div class="summary-card p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 ${this.getSeverityBorderColor(summary.severity)}">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-2xl font-bold flex items-center gap-2">
                <span>${summary.verdict.emoji}</span>
                <span>${summary.verdict.text}</span>
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mt-1">${summary.verdict.description}</p>
            </div>
            <div class="text-right">
              <div class="text-4xl font-bold ${this.getScoreColor(summary.healthScore)}">${summary.healthScore}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Health Score</div>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div class="stat-box bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div class="text-sm text-gray-600 dark:text-gray-400">Duración</div>
              <div class="text-2xl font-bold">${summary.tripLength} días</div>
            </div>
            <div class="stat-box bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div class="text-sm text-gray-600 dark:text-gray-400">Días de descanso</div>
              <div class="text-2xl font-bold">${summary.restDays}</div>
            </div>
            <div class="stat-box bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div class="text-sm text-gray-600 dark:text-gray-400">Energía promedio</div>
              <div class="text-2xl font-bold">${summary.averageEnergy}%</div>
            </div>
            <div class="stat-box bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div class="text-sm text-gray-600 dark:text-gray-400">Tendencia</div>
              <div class="text-2xl font-bold">${this.getTrendEmoji(summary.trend)}</div>
            </div>
          </div>
        </div>

        <!-- Recomendaciones -->
        ${recommendations.length > 0 ? `
          <div class="recommendations">
            <h4 class="text-xl font-bold mb-3">💡 Recomendaciones</h4>
            <div class="space-y-3">
              ${recommendations.map(rec => `
                <div class="recommendation-card p-4 rounded-lg border-l-4 ${this.getRecommendationStyle(rec.type)}">
                  <div class="flex items-start gap-3">
                    <div class="flex-1">
                      <div class="font-semibold text-lg">${rec.title}</div>
                      <div class="text-sm mt-1">${rec.message}</div>
                      ${rec.affectedDays ? `
                        <div class="text-xs mt-2 opacity-75">
                          Días afectados: ${rec.affectedDays.join(', ')}
                        </div>
                      ` : ''}
                    </div>
                    <div class="px-3 py-1 rounded-full text-xs font-semibold ${this.getPriorityBadge(rec.priority)}">
                      ${rec.priority}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div class="text-4xl mb-2">✨</div>
            <div class="font-semibold">¡Excelente balance de energía!</div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">No hay recomendaciones en este momento</div>
          </div>
        `}

        <!-- Desglose por día -->
        <div class="daily-breakdown">
          <h4 class="text-xl font-bold mb-3">📅 Desglose por Día</h4>
          <div class="space-y-2">
            ${predictions.map(pred => `
              <div class="day-card p-3 rounded-lg bg-white dark:bg-gray-800 border-l-4 ${this.getStateBorderColor(pred.state.level)}">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="text-2xl">${pred.state.emoji}</div>
                    <div>
                      <div class="font-semibold">Día ${pred.dayNumber}</div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">${pred.state.label}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold ${this.getEnergyColor(pred.energy)}">${pred.energy}%</div>
                    <div class="text-xs text-gray-500">energía</div>
                  </div>
                </div>
                <div class="mt-2 flex flex-wrap gap-2 text-xs">
                  <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">${pred.metrics.activities} actividades</span>
                  <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">${pred.metrics.walking.toFixed(1)} km</span>
                  <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">${pred.metrics.intensity}</span>
                  ${pred.jetLagActive ? '<span class="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">⚠️ Jet lag</span>' : ''}
                  ${pred.isRestDay ? '<span class="px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">😴 Descanso</span>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // Helpers de estilo
  getSeverityBorderColor(severity) {
    switch (severity) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-blue-500';
    }
  }

  getScoreColor(score) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getTrendEmoji(trend) {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  }

  getRecommendationStyle(type) {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  }

  getPriorityBadge(priority) {
    switch (priority) {
      case 'high': return 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  }

  getStateBorderColor(level) {
    switch (level) {
      case 'critical': return 'border-red-500';
      case 'warning': return 'border-yellow-500';
      case 'low': return 'border-orange-500';
      default: return 'border-green-500';
    }
  }

  getEnergyColor(energy) {
    if (energy >= 70) return 'text-green-600';
    if (energy >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.EnergyBurnoutPredictor = new EnergyBurnoutPredictor();
}

export default EnergyBurnoutPredictor;
