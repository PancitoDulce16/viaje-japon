/**
 * 🔍 DETECTOR DE ANOMALÍAS EN ITINERARIOS
 * =========================================
 *
 * Detecta problemas y situaciones raras en itinerarios:
 * - Demasiada caminata
 * - Presupuesto excedido
 * - Mal timing (llegar después de cierre)
 * - Tránsito imposible
 * - Días sobrecargados
 * - Backtracking excesivo
 *
 * Auto-detecta y auto-corrige problemas
 */

class ItineraryAnomalyDetector {
  constructor() {
    this.thresholds = {
      maxWalkingPerDay: 20, // km
      maxTransitTime: 120, // minutos
      maxDailyBudget: 30000, // yen
      maxActivitiesPerDay: 10,
      minRestTime: 60, // minutos
      maxConsecutiveIntenseActivities: 3
    };
  }

  /**
   * 🔍 Analiza un itinerario completo en busca de anomalías
   * @param {Object} itinerary - Itinerario a analizar
   * @returns {Object} Reporte de anomalías
   */
  analyzeItinerary(itinerary) {
    const anomalies = {
      critical: [], // Problemas graves que deben corregirse
      warnings: [],  // Advertencias que pueden ignorarse
      suggestions: [], // Sugerencias de mejora
      score: 100 // Score de 0-100 (100 = perfecto)
    };

    // Analizar cada día
    itinerary.days?.forEach((day, index) => {
      const dayAnomalies = this.analyzeDay(day, index, itinerary);

      anomalies.critical.push(...dayAnomalies.critical);
      anomalies.warnings.push(...dayAnomalies.warnings);
      anomalies.suggestions.push(...dayAnomalies.suggestions);
    });

    // Analizar itinerario completo
    const globalAnomalies = this.analyzeGlobalIssues(itinerary);
    anomalies.critical.push(...globalAnomalies.critical);
    anomalies.warnings.push(...globalAnomalies.warnings);
    anomalies.suggestions.push(...globalAnomalies.suggestions);

    // Calcular score
    anomalies.score = this.calculateHealthScore(anomalies);

    return anomalies;
  }

  /**
   * 📊 Analiza un día específico
   */
  analyzeDay(day, dayIndex, itinerary) {
    const anomalies = {
      critical: [],
      warnings: [],
      suggestions: []
    };

    const activities = day.activities || [];

    // 1️⃣ Revisar caminata total
    const walkingIssue = this.checkWalkingDistance(activities, dayIndex);
    if (walkingIssue) {
      if (walkingIssue.severity === 'critical') {
        anomalies.critical.push(walkingIssue);
      } else {
        anomalies.warnings.push(walkingIssue);
      }
    }

    // 2️⃣ Revisar presupuesto
    const budgetIssue = this.checkBudget(day, dayIndex, itinerary);
    if (budgetIssue) {
      anomalies.warnings.push(budgetIssue);
    }

    // 3️⃣ Revisar horarios y cierres
    const timingIssues = this.checkTimings(activities, dayIndex);
    anomalies.critical.push(...timingIssues.critical);
    anomalies.warnings.push(...timingIssues.warnings);

    // 4️⃣ Revisar tiempo de tránsito
    const transitIssues = this.checkTransitTimes(activities, dayIndex);
    anomalies.warnings.push(...transitIssues);

    // 5️⃣ Revisar sobrecarga de actividades
    const overloadIssue = this.checkActivityOverload(activities, dayIndex);
    if (overloadIssue) {
      anomalies.warnings.push(overloadIssue);
    }

    // 6️⃣ Revisar falta de descansos
    const restIssue = this.checkRestTime(day, dayIndex);
    if (restIssue) {
      anomalies.suggestions.push(restIssue);
    }

    // 7️⃣ Revisar actividades consecutivas intensas
    const intensityIssue = this.checkIntensityPattern(activities, dayIndex);
    if (intensityIssue) {
      anomalies.suggestions.push(intensityIssue);
    }

    return anomalies;
  }

  /**
   * 🚶 Verifica distancia de caminata
   */
  checkWalkingDistance(activities, dayIndex) {
    let totalWalking = 0;

    for (let i = 0; i < activities.length - 1; i++) {
      const distance = this.calculateDistance(
        activities[i].coordinates,
        activities[i + 1].coordinates
      );
      totalWalking += distance;
    }

    if (totalWalking > this.thresholds.maxWalkingPerDay) {
      return {
        type: 'excessive_walking',
        severity: 'critical',
        day: dayIndex + 1,
        message: `Día ${dayIndex + 1}: ${totalWalking.toFixed(1)}km de caminata (límite recomendado: ${this.thresholds.maxWalkingPerDay}km)`,
        icon: '🚶',
        fix: {
          action: 'reduce_walking',
          suggestion: 'Considera usar más transporte público o eliminar actividades distantes'
        }
      };
    } else if (totalWalking > this.thresholds.maxWalkingPerDay * 0.8) {
      return {
        type: 'high_walking',
        severity: 'warning',
        day: dayIndex + 1,
        message: `Día ${dayIndex + 1}: ${totalWalking.toFixed(1)}km de caminata - Día intenso`,
        icon: '⚠️',
        fix: {
          action: 'monitor',
          suggestion: 'Lleva zapatos cómodos y planifica descansos'
        }
      };
    }

    return null;
  }

  /**
   * 💰 Verifica presupuesto
   */
  checkBudget(day, dayIndex, itinerary) {
    const dailyCost = day.activities?.reduce((sum, act) => sum + (act.cost || 0), 0) || 0;
    const userBudget = itinerary.preferences?.dailyBudget || this.thresholds.maxDailyBudget;

    if (dailyCost > userBudget * 1.5) {
      return {
        type: 'budget_exceeded',
        severity: 'warning',
        day: dayIndex + 1,
        message: `Día ${dayIndex + 1}: ¥${dailyCost.toLocaleString()} (150% sobre presupuesto de ¥${userBudget.toLocaleString()})`,
        icon: '💰',
        fix: {
          action: 'reduce_cost',
          suggestion: 'Reemplaza actividades costosas por alternativas más económicas'
        }
      };
    }

    return null;
  }

  /**
   * ⏰ Verifica horarios y cierres
   */
  checkTimings(activities, dayIndex) {
    const issues = {
      critical: [],
      warnings: []
    };

    let currentTime = 9 * 60; // 9:00 AM en minutos

    activities.forEach((activity, index) => {
      const duration = activity.duration || 60;

      // Verificar si llega después del cierre
      if (activity.opening_hours) {
        const closing = this.parseTime(activity.opening_hours.close);
        const arrivalTime = currentTime;

        if (arrivalTime > closing - 30) {
          issues.critical.push({
            type: 'arrives_after_closing',
            severity: 'critical',
            day: dayIndex + 1,
            activity: activity.name,
            message: `Día ${dayIndex + 1}: "${activity.name}" - Llegas cerca del cierre (${this.formatTime(arrivalTime)} vs cierra ${activity.opening_hours.close})`,
            icon: '🚫',
            fix: {
              action: 'reorder_activities',
              suggestion: 'Mover esta actividad más temprano en el día'
            }
          });
        }
      }

      // Verificar rush hour
      const rushHourStart = 17 * 60; // 5 PM
      const rushHourEnd = 19 * 60; // 7 PM

      if (currentTime >= rushHourStart && currentTime <= rushHourEnd) {
        issues.warnings.push({
          type: 'rush_hour',
          severity: 'warning',
          day: dayIndex + 1,
          activity: activity.name,
          message: `Día ${dayIndex + 1}: Tránsito durante rush hour (${this.formatTime(currentTime)})`,
          icon: '🚇',
          fix: {
            action: 'adjust_timing',
            suggestion: 'Considera actividades cercanas o espera hasta después de las 7 PM'
          }
        });
      }

      currentTime += duration + 15; // Duración + tránsito
    });

    return issues;
  }

  /**
   * 🚇 Verifica tiempos de tránsito
   */
  checkTransitTimes(activities, dayIndex) {
    const issues = [];

    for (let i = 0; i < activities.length - 1; i++) {
      const distance = this.calculateDistance(
        activities[i].coordinates,
        activities[i + 1].coordinates
      );

      const transitTime = distance * 10; // ~10 min por km

      if (transitTime > this.thresholds.maxTransitTime) {
        issues.push({
          type: 'impossible_transit',
          severity: 'warning',
          day: dayIndex + 1,
          from: activities[i].name,
          to: activities[i + 1].name,
          message: `Día ${dayIndex + 1}: Tránsito de "${activities[i].name}" a "${activities[i + 1].name}" toma ~${Math.round(transitTime)} minutos`,
          icon: '⏱️',
          fix: {
            action: 'add_transit_time',
            suggestion: 'Considera actividades intermedias o más tiempo de tránsito'
          }
        });
      }
    }

    return issues;
  }

  /**
   * 📊 Verifica sobrecarga de actividades
   */
  checkActivityOverload(activities, dayIndex) {
    if (activities.length > this.thresholds.maxActivitiesPerDay) {
      return {
        type: 'over_packed',
        severity: 'warning',
        day: dayIndex + 1,
        message: `Día ${dayIndex + 1}: ${activities.length} actividades (máximo recomendado: ${this.thresholds.maxActivitiesPerDay})`,
        icon: '📅',
        fix: {
          action: 'reduce_activities',
          suggestion: 'Divide actividades en dos días o elimina las menos importantes'
        }
      };
    }

    return null;
  }

  /**
   * 😴 Verifica tiempo de descanso
   */
  checkRestTime(day, dayIndex) {
    const totalDuration = day.activities?.reduce((sum, act) => sum + (act.duration || 60), 0) || 0;
    const totalTime = 12 * 60; // Asumiendo 12 horas de día
    const restTime = totalTime - totalDuration;

    if (restTime < this.thresholds.minRestTime) {
      return {
        type: 'insufficient_rest',
        severity: 'suggestion',
        day: dayIndex + 1,
        message: `Día ${dayIndex + 1}: Solo ${restTime} minutos de descanso`,
        icon: '☕',
        fix: {
          action: 'add_rest',
          suggestion: 'Agrega tiempo de descanso entre actividades'
        }
      };
    }

    return null;
  }

  /**
   * ⚡ Verifica patrón de intensidad
   */
  checkIntensityPattern(activities, dayIndex) {
    let consecutiveIntense = 0;

    const intenseCategories = ['hiking', 'walking-tour', 'shopping', 'nightlife'];

    for (const activity of activities) {
      if (intenseCategories.includes(activity.category)) {
        consecutiveIntense++;
      } else {
        consecutiveIntense = 0;
      }

      if (consecutiveIntense >= this.thresholds.maxConsecutiveIntenseActivities) {
        return {
          type: 'consecutive_intense',
          severity: 'suggestion',
          day: dayIndex + 1,
          message: `Día ${dayIndex + 1}: ${consecutiveIntense} actividades intensas consecutivas`,
          icon: '💪',
          fix: {
            action: 'balance_intensity',
            suggestion: 'Alterna actividades intensas con relajadas (museo, café, onsen)'
          }
        };
      }
    }

    return null;
  }

  /**
   * 🌍 Analiza problemas globales del itinerario
   */
  analyzeGlobalIssues(itinerary) {
    const issues = {
      critical: [],
      warnings: [],
      suggestions: []
    };

    const days = itinerary.days || [];

    // 1️⃣ Verificar falta de variedad
    const varietyIssue = this.checkVariety(days);
    if (varietyIssue) {
      issues.suggestions.push(varietyIssue);
    }

    // 2️⃣ Verificar distribución de presupuesto
    const budgetDistribution = this.checkBudgetDistribution(days);
    if (budgetDistribution) {
      issues.warnings.push(budgetDistribution);
    }

    // 3️⃣ Verificar días consecutivos muy intensos
    const intenseDaysIssue = this.checkConsecutiveIntenseDays(days);
    if (intenseDaysIssue) {
      issues.warnings.push(intenseDaysIssue);
    }

    return issues;
  }

  /**
   * 🎨 Verifica variedad de actividades
   */
  checkVariety(days) {
    const categories = new Set();

    days.forEach(day => {
      day.activities?.forEach(act => {
        categories.add(act.category);
      });
    });

    if (categories.size < 3) {
      return {
        type: 'low_variety',
        severity: 'suggestion',
        message: `Solo ${categories.size} tipos de actividades - Considera más variedad`,
        icon: '🎭',
        fix: {
          action: 'add_variety',
          suggestion: 'Mezcla diferentes tipos: cultura, comida, naturaleza, compras'
        }
      };
    }

    return null;
  }

  /**
   * 💰 Verifica distribución de presupuesto
   */
  checkBudgetDistribution(days) {
    const dailyCosts = days.map(day =>
      day.activities?.reduce((sum, act) => sum + (act.cost || 0), 0) || 0
    );

    const max = Math.max(...dailyCosts);
    const min = Math.min(...dailyCosts);
    const variance = max - min;

    if (variance > 15000) {
      return {
        type: 'uneven_budget',
        severity: 'warning',
        message: `Gran variación en gastos diarios (¥${min.toLocaleString()} - ¥${max.toLocaleString()})`,
        icon: '💸',
        fix: {
          action: 'balance_budget',
          suggestion: 'Distribuye gastos más uniformemente entre días'
        }
      };
    }

    return null;
  }

  /**
   * 😰 Verifica días intensos consecutivos
   */
  checkConsecutiveIntenseDays(days) {
    let consecutiveIntense = 0;

    for (let index = 0; index < days.length; index++) {
      const activityCount = days[index].activities?.length || 0;

      if (activityCount >= 7) {
        consecutiveIntense++;
      } else {
        consecutiveIntense = 0;
      }

      if (consecutiveIntense >= 3) {
        return {
          type: 'burnout_risk',
          severity: 'warning',
          message: `Días ${index - 1}, ${index}, ${index + 1}: Riesgo de fatiga - 3+ días intensos consecutivos`,
          icon: '😰',
          fix: {
            action: 'add_rest_day',
            suggestion: 'Agrega un día más relajado o reduce actividades'
          }
        };
      }
    }

    return null;
  }

  /**
   * 🔧 Auto-corrige anomalías detectadas
   * @param {Object} itinerary - Itinerario con problemas
   * @param {Object} anomalies - Anomalías detectadas
   * @returns {Object} Itinerario corregido
   */
  autoFix(itinerary, anomalies) {
    let fixed = JSON.parse(JSON.stringify(itinerary)); // Deep clone

    // Aplicar fixes para anomalías críticas
    anomalies.critical.forEach(anomaly => {
      switch (anomaly.fix?.action) {
        case 'reduce_walking':
          fixed = this.fixExcessiveWalking(fixed, anomaly.day - 1);
          break;

        case 'reorder_activities':
          fixed = this.fixBadTiming(fixed, anomaly.day - 1, anomaly.activity);
          break;

        default:
          console.log('No auto-fix disponible para:', anomaly.type);
      }
    });

    return fixed;
  }

  /**
   * 🚶 Corrige caminata excesiva
   */
  fixExcessiveWalking(itinerary, dayIndex) {
    // Eliminar actividades más distantes
    const day = itinerary.days[dayIndex];
    const activities = day.activities || [];

    // Encontrar actividad más distante
    let maxDistance = 0;
    let maxIndex = 0;

    for (let i = 0; i < activities.length - 1; i++) {
      const dist = this.calculateDistance(activities[i].coordinates, activities[i + 1].coordinates);
      if (dist > maxDistance) {
        maxDistance = dist;
        maxIndex = i + 1;
      }
    }

    // Remover actividad distante
    if (maxDistance > 5) {
      activities.splice(maxIndex, 1);
    }

    itinerary.days[dayIndex].activities = activities;
    return itinerary;
  }

  /**
   * ⏰ Corrige mal timing
   */
  fixBadTiming(itinerary, dayIndex, activityName) {
    const day = itinerary.days[dayIndex];
    const activities = day.activities || [];

    const problemIndex = activities.findIndex(a => a.name === activityName);

    if (problemIndex > 2) {
      // Mover actividad más temprano
      const activity = activities.splice(problemIndex, 1)[0];
      activities.splice(1, 0, activity);
    }

    itinerary.days[dayIndex].activities = activities;
    return itinerary;
  }

  /**
   * 📊 Calcula score de salud del itinerario
   */
  calculateHealthScore(anomalies) {
    let score = 100;

    // Penalizar por anomalías
    score -= anomalies.critical.length * 15;
    score -= anomalies.warnings.length * 5;
    score -= anomalies.suggestions.length * 2;

    return Math.max(0, score);
  }

  // ==========================================
  // HELPERS
  // ==========================================

  calculateDistance(coords1, coords2) {
    if (!coords1 || !coords2) return 5;

    // Validar que sean arrays o convertir de objeto
    // (las coordenadas en esta app se guardan como { lat, lng })
    if (!Array.isArray(coords1)) {
      const lon1 = coords1.lon ?? coords1.lng;
      if (coords1.lat !== undefined && lon1 !== undefined) {
        coords1 = [coords1.lat, lon1];
      } else {
        return 5; // Default distance
      }
    }

    if (!Array.isArray(coords2)) {
      const lon2 = coords2.lon ?? coords2.lng;
      if (coords2.lat !== undefined && lon2 !== undefined) {
        coords2 = [coords2.lat, lon2];
      } else {
        return 5; // Default distance
      }
    }

    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;

    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  parseTime(timeString) {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * 🎨 Renderiza reporte de anomalías
   */
  renderReport(containerId, anomalies) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const healthColor = anomalies.score >= 80 ? 'green' : anomalies.score >= 60 ? 'yellow' : 'red';

    let html = `
      <div class="anomaly-report p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <!-- Health Score -->
        <div class="mb-6 text-center">
          <div class="text-6xl font-bold mb-2 text-${healthColor}-600">${anomalies.score}</div>
          <div class="text-lg font-semibold">Health Score</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            ${anomalies.score >= 80 ? '✅ Itinerario saludable' : anomalies.score >= 60 ? '⚠️ Necesita ajustes' : '🚨 Requiere correcciones'}
          </div>
        </div>

        <!-- Críticos -->
        ${anomalies.critical.length > 0 ? `
          <div class="mb-6">
            <h3 class="text-xl font-bold mb-3 text-red-600 dark:text-red-400">🚨 Problemas Críticos</h3>
            <div class="space-y-2">
              ${anomalies.critical.map(issue => `
                <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-600">
                  <div class="flex items-start">
                    <span class="text-2xl mr-3">${issue.icon}</span>
                    <div class="flex-1">
                      <div class="font-semibold">${issue.message}</div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        💡 ${issue.fix?.suggestion}
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Advertencias -->
        ${anomalies.warnings.length > 0 ? `
          <div class="mb-6">
            <h3 class="text-xl font-bold mb-3 text-yellow-600 dark:text-yellow-400">⚠️ Advertencias</h3>
            <div class="space-y-2">
              ${anomalies.warnings.map(issue => `
                <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-600">
                  <div class="flex items-start">
                    <span class="text-2xl mr-3">${issue.icon}</span>
                    <div class="flex-1">
                      <div class="font-semibold">${issue.message}</div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        💡 ${issue.fix?.suggestion}
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Sugerencias -->
        ${anomalies.suggestions.length > 0 ? `
          <div>
            <h3 class="text-xl font-bold mb-3 text-blue-600 dark:text-blue-400">💡 Sugerencias</h3>
            <div class="space-y-2">
              ${anomalies.suggestions.map(issue => `
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600">
                  <div class="flex items-start">
                    <span class="text-2xl mr-3">${issue.icon}</span>
                    <div class="flex-1">
                      <div class="font-semibold">${issue.message}</div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        💡 ${issue.fix?.suggestion}
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${anomalies.critical.length === 0 && anomalies.warnings.length === 0 && anomalies.suggestions.length === 0 ? `
          <div class="text-center py-8">
            <div class="text-6xl mb-4">✨</div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              ¡Itinerario Perfecto!
            </div>
            <div class="text-gray-600 dark:text-gray-400 mt-2">
              No se detectaron problemas
            </div>
          </div>
        ` : ''}
      </div>
    `;

    container.innerHTML = html;
  }
}

// 🌐 Exportar para uso global
if (typeof window !== 'undefined') {
  window.ItineraryAnomalyDetector = new ItineraryAnomalyDetector();
}
