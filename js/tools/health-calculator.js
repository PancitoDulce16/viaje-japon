/* ========================================
   HEALTH CALCULATOR - Algoritmos de Validación
   Analiza el itinerario y detecta problemas
   ======================================== */

export class HealthCalculator {
  constructor(itinerary) {
    this.itinerary = itinerary;
    this.issues = {
      critical: [],
      warnings: [],
      suggestions: []
    };
    this.metrics = {};
  }

  /**
   * Calcular score general de salud (0-100)
   */
  calculateHealthScore() {
    let score = 100;

    // Penalización por problemas críticos (-10 cada uno)
    score -= this.issues.critical.length * 10;

    // Penalización por warnings (-3 cada uno)
    score -= this.issues.warnings.length * 3;

    // Penalización por sugerencias (-1 cada una)
    score -= this.issues.suggestions.length * 1;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Análisis completo del itinerario
   */
  analyze() {
    console.log('🏥 Analizando salud del itinerario...');

    // Limpiar issues previos
    this.issues = { critical: [], warnings: [], suggestions: [] };

    // Calcular métricas
    this.calculateMetrics();

    // Ejecutar todas las validaciones
    this.checkMissingData();
    this.checkScheduleConflicts();
    this.checkImpossibleTransports();
    this.checkOverloadedDays();
    this.checkGaps();
    this.checkBudget();
    this.checkVariety();
    this.checkUnrealisticSchedules();
    this.checkMissingMeals();

    // Calcular score final
    const score = this.calculateHealthScore();

    console.log(`✅ Análisis completo. Score: ${score}/100`);
    console.log(`🔴 Críticos: ${this.issues.critical.length}`);
    console.log(`🟡 Warnings: ${this.issues.warnings.length}`);
    console.log(`🔵 Sugerencias: ${this.issues.suggestions.length}`);

    return {
      score,
      issues: this.issues,
      metrics: this.metrics
    };
  }

  /**
   * Calcular métricas del itinerario
   */
  calculateMetrics() {
    if (!this.itinerary || !this.itinerary.days) {
      this.metrics = {
        totalDays: 0,
        totalActivities: 0,
        averageActivitiesPerDay: 0,
        totalEstimatedCost: 0,
        activitiesByCategory: {},
        overloadedDays: []
      };
      return;
    }

    const days = this.itinerary.days;

    let totalActivities = 0;
    let totalCost = 0;
    const categoryCounts = {};
    const overloadedDays = [];

    days.forEach(day => {
      const activities = day.activities || [];
      const dayActivityCount = activities.length;

      totalActivities += dayActivityCount;

      // Días sobrecargados (>6 actividades)
      if (dayActivityCount > 6) {
        overloadedDays.push({
          day: day.day,
          count: dayActivityCount,
          date: day.date
        });
      }

      // Costos
      activities.forEach(act => {
        totalCost += (act.estimatedCost || act.price || 0);

        // Categorías
        if (act.category) {
          categoryCounts[act.category] = (categoryCounts[act.category] || 0) + 1;
        }
      });
    });

    this.metrics = {
      totalDays: days.length,
      totalActivities,
      averageActivitiesPerDay: totalActivities / days.length,
      totalEstimatedCost: totalCost,
      activitiesByCategory: categoryCounts,
      overloadedDays
    };
  }

  /**
   * CHECK 1: Datos faltantes
   */
  checkMissingData() {
    if (!this.itinerary || !this.itinerary.days) {
      this.issues.critical.push({
        id: 'no-itinerary',
        type: 'critical',
        title: 'No hay itinerario',
        description: 'No se ha creado ningún itinerario aún',
        icon: '❌'
      });
      return;
    }

    const days = this.itinerary.days;

    days.forEach(day => {
      const activities = day.activities || [];

      // Día sin actividades
      if (activities.length === 0) {
        this.issues.warnings.push({
          id: `empty-day-${day.day}`,
          type: 'warning',
          title: `Día ${day.day} vacío`,
          description: 'Este día no tiene actividades planeadas',
          day: day.day,
          icon: '📭',
          fixable: true,
          fixAction: 'fillDay'
        });
      }

      // Actividades sin coordenadas
      activities.forEach((act, index) => {
        if (!act.lat || !act.lng) {
          this.issues.warnings.push({
            id: `no-coords-${day.day}-${index}`,
            type: 'warning',
            title: 'Actividad sin ubicación',
            description: `"${act.name || act.title}" no tiene coordenadas GPS`,
            day: day.day,
            activityIndex: index,
            icon: '📍'
          });
        }
      });
    });
  }

  /**
   * CHECK 2: Conflictos de horarios
   */
  checkScheduleConflicts() {
    if (!this.itinerary?.days) return;

    this.itinerary.days.forEach(day => {
      const activities = day.activities || [];

      for (let i = 0; i < activities.length - 1; i++) {
        const current = activities[i];
        const next = activities[i + 1];

        if (!current.timeStart || !current.timeEnd || !next.timeStart) continue;

        const currentEnd = this.parseTime(current.timeEnd);
        const nextStart = this.parseTime(next.timeStart);

        // Solapamiento
        if (currentEnd > nextStart) {
          this.issues.critical.push({
            id: `overlap-${day.day}-${i}`,
            type: 'critical',
            title: 'Conflicto de horarios',
            description: `"${current.name}" (${current.timeStart}-${current.timeEnd}) se solapa con "${next.name}" (${next.timeStart})`,
            day: day.day,
            activities: [i, i + 1],
            icon: '⏰',
            fixable: true,
            fixAction: 'resolveOverlap'
          });
        }
      }
    });
  }

  /**
   * CHECK 3: Transportes imposibles
   */
  checkImpossibleTransports() {
    if (!this.itinerary?.days) return;

    this.itinerary.days.forEach(day => {
      const activities = day.activities || [];

      for (let i = 0; i < activities.length - 1; i++) {
        const current = activities[i];
        const next = activities[i + 1];

        if (!current.lat || !current.lng || !next.lat || !next.lng) continue;
        if (!current.timeEnd || !next.timeStart) continue;

        // Calcular distancia
        const distance = this.calculateDistance(
          current.lat, current.lng,
          next.lat, next.lng
        );

        // Calcular tiempo disponible
        const availableTime = this.getTimeDifference(current.timeEnd, next.timeStart);

        // Estimar tiempo de transporte (asumiendo 30 km/h promedio en transporte público)
        const estimatedTransportTime = (distance / 30) * 60; // minutos

        // Si el transporte toma más del 80% del tiempo disponible, es problemático
        if (estimatedTransportTime > availableTime * 0.8 && distance > 5) {
          this.issues.critical.push({
            id: `impossible-transport-${day.day}-${i}`,
            type: 'critical',
            title: 'Transporte imposible',
            description: `De "${current.name}" a "${next.name}": ${distance.toFixed(1)}km requiere ~${Math.ceil(estimatedTransportTime)}min, solo hay ${availableTime}min disponibles`,
            day: day.day,
            activities: [i, i + 1],
            icon: '🚆',
            fixable: true,
            fixAction: 'adjustTransportTime'
          });
        }
      }
    });
  }

  /**
   * CHECK 4: Días sobrecargados
   */
  checkOverloadedDays() {
    this.metrics.overloadedDays.forEach(overload => {
      this.issues.warnings.push({
        id: `overloaded-${overload.day}`,
        type: 'warning',
        title: `Día ${overload.day} sobrecargado`,
        description: `${overload.count} actividades en un día puede ser agotador`,
        day: overload.day,
        icon: '😵',
        fixable: true,
        fixAction: 'balanceDay'
      });
    });
  }

  /**
   * CHECK 5: Gaps largos
   */
  checkGaps() {
    if (!this.itinerary?.days) return;

    this.itinerary.days.forEach(day => {
      const activities = day.activities || [];

      for (let i = 0; i < activities.length - 1; i++) {
        const current = activities[i];
        const next = activities[i + 1];

        if (!current.timeEnd || !next.timeStart) continue;

        const gapMinutes = this.getTimeDifference(current.timeEnd, next.timeStart);

        // Gap mayor a 3 horas
        if (gapMinutes > 180) {
          this.issues.suggestions.push({
            id: `gap-${day.day}-${i}`,
            type: 'suggestion',
            title: `Gap largo en Día ${day.day}`,
            description: `${(gapMinutes / 60).toFixed(1)}h libres entre "${current.name}" y "${next.name}"`,
            day: day.day,
            gapStart: i,
            icon: '⏱️',
            fixable: true,
            fixAction: 'fillGap'
          });
        }
      }
    });
  }

  /**
   * CHECK 6: Presupuesto
   */
  checkBudget() {
    if (!this.itinerary?.budget?.total) return;

    const totalBudget = this.itinerary.budget.total;
    const spent = this.metrics.totalEstimatedCost;

    if (spent > totalBudget) {
      const overAmount = spent - totalBudget;
      this.issues.critical.push({
        id: 'budget-exceeded',
        type: 'critical',
        title: 'Presupuesto excedido',
        description: `Gastos estimados (¥${spent.toLocaleString()}) superan el presupuesto (¥${totalBudget.toLocaleString()}) por ¥${overAmount.toLocaleString()}`,
        icon: '💸',
        fixable: true,
        fixAction: 'reduceBudget'
      });
    } else if (spent > totalBudget * 0.95) {
      this.issues.warnings.push({
        id: 'budget-tight',
        type: 'warning',
        title: 'Presupuesto ajustado',
        description: `Gastos estimados (¥${spent.toLocaleString()}) están muy cerca del presupuesto (¥${totalBudget.toLocaleString()})`,
        icon: '💰'
      });
    }
  }

  /**
   * CHECK 7: Falta de variedad
   */
  checkVariety() {
    if (!this.itinerary?.days) return;

    this.itinerary.days.forEach(day => {
      const activities = day.activities || [];
      const categoryCounts = {};

      activities.forEach(act => {
        if (act.category) {
          categoryCounts[act.category] = (categoryCounts[act.category] || 0) + 1;
        }
      });

      // Si más del 60% de actividades son de la misma categoría
      Object.entries(categoryCounts).forEach(([category, count]) => {
        if (count >= 4 && count / activities.length > 0.6) {
          this.issues.suggestions.push({
            id: `no-variety-${day.day}-${category}`,
            type: 'suggestion',
            title: `Día ${day.day} muy monotemático`,
            description: `${count} actividades de "${category}" - considera más variedad`,
            day: day.day,
            icon: '🔄'
          });
        }
      });
    });
  }

  /**
   * CHECK 8: Horarios poco realistas
   */
  checkUnrealisticSchedules() {
    if (!this.itinerary?.days) return;

    this.itinerary.days.forEach(day => {
      const activities = day.activities || [];

      activities.forEach((act, index) => {
        if (!act.timeStart) return;

        const hour = parseInt(act.timeStart.split(':')[0]);

        // Actividades muy temprano (antes de 7 AM)
        if (hour < 7 && !act.name?.toLowerCase().includes('mercado')) {
          this.issues.suggestions.push({
            id: `too-early-${day.day}-${index}`,
            type: 'suggestion',
            title: 'Actividad muy temprano',
            description: `"${act.name}" a las ${act.timeStart} puede ser difícil`,
            day: day.day,
            activityIndex: index,
            icon: '🌅'
          });
        }

        // Actividades muy tarde (después de 10 PM) que no sean vida nocturna
        if (hour >= 22 && !act.category?.includes('Nightlife')) {
          this.issues.suggestions.push({
            id: `too-late-${day.day}-${index}`,
            type: 'suggestion',
            title: 'Actividad muy tarde',
            description: `"${act.name}" a las ${act.timeStart} - puede estar cerrado`,
            day: day.day,
            activityIndex: index,
            icon: '🌙'
          });
        }
      });
    });
  }

  /**
   * CHECK 9: Comidas faltantes
   */
  checkMissingMeals() {
    if (!this.itinerary?.days) return;

    this.itinerary.days.forEach(day => {
      const activities = day.activities || [];

      const hasBreakfast = activities.some(a => a.category?.includes('Food') && this.isMorning(a.timeStart));
      const hasLunch = activities.some(a => a.category?.includes('Food') && this.isAfternoon(a.timeStart));
      const hasDinner = activities.some(a => a.category?.includes('Food') && this.isEvening(a.timeStart));

      if (!hasBreakfast) {
        this.issues.suggestions.push({
          id: `no-breakfast-${day.day}`,
          type: 'suggestion',
          title: `Falta desayuno - Día ${day.day}`,
          description: 'No hay desayuno planeado',
          day: day.day,
          icon: '🍳',
          fixable: true,
          fixAction: 'addMeal',
          mealType: 'breakfast'
        });
      }

      if (!hasLunch) {
        this.issues.suggestions.push({
          id: `no-lunch-${day.day}`,
          type: 'suggestion',
          title: `Falta almuerzo - Día ${day.day}`,
          description: 'No hay almuerzo planeado',
          day: day.day,
          icon: '🍜',
          fixable: true,
          fixAction: 'addMeal',
          mealType: 'lunch'
        });
      }

      if (!hasDinner) {
        this.issues.suggestions.push({
          id: `no-dinner-${day.day}`,
          type: 'suggestion',
          title: `Falta cena - Día ${day.day}`,
          description: 'No hay cena planeada',
          day: day.day,
          icon: '🍱',
          fixable: true,
          fixAction: 'addMeal',
          mealType: 'dinner'
        });
      }
    });
  }

  /**
   * UTILIDADES
   */

  parseTime(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getTimeDifference(startTime, endTime) {
    return this.parseTime(endTime) - this.parseTime(startTime);
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  isMorning(timeStr) {
    if (!timeStr) return false;
    const hour = parseInt(timeStr.split(':')[0]);
    return hour >= 6 && hour < 12;
  }

  isAfternoon(timeStr) {
    if (!timeStr) return false;
    const hour = parseInt(timeStr.split(':')[0]);
    return hour >= 12 && hour < 18;
  }

  isEvening(timeStr) {
    if (!timeStr) return false;
    const hour = parseInt(timeStr.split(':')[0]);
    return hour >= 18 && hour < 23;
  }
}

export default HealthCalculator;
