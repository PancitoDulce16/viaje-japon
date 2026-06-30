/* ========================================
   SMART RECOMMENDER - Motor de Recomendación Inteligente
   ======================================== */

import { ACTIVITIES_DATABASE } from '../../data/activities-database.js';

/**
 * Motor que recomienda actividades basadas en el perfil del viajero
 */
export class SmartRecommender {
  constructor(travelerProfile) {
    this.profile = travelerProfile;
  }

  /**
   * Generar actividades recomendadas para un día específico
   */
  generateActivitiesForDay(params) {
    const {
      dayNumber,
      city,
      date,
      totalDays,
      remainingBudget
    } = params;

    const activities = [];
    const cityData = ACTIVITIES_DATABASE[city];

    if (!cityData) {
      console.warn(`No data for city: ${city}`);
      return activities;
    }

    // Determinar cuántas actividades según pace
    const activityCount = this.getActivityCountForDay();

    // Obtener pool de actividades candidatas
    const candidates = this.getCandidateActivities(cityData);

    // Calcular score de cada actividad
    const scoredActivities = candidates.map(activity => ({
      ...activity,
      matchScore: this.calculateMatchScore(activity, dayNumber, totalDays)
    }));

    // Ordenar por score
    scoredActivities.sort((a, b) => b.matchScore - a.matchScore);

    // Seleccionar actividades balanceadas
    const selected = this.selectBalancedActivities(
      scoredActivities,
      activityCount,
      remainingBudget
    );

    // Asignar horarios
    const scheduled = this.assignSchedules(selected, dayNumber, date);

    return scheduled;
  }

  /**
   * Determinar número de actividades por día según ritmo
   */
  getActivityCountForDay() {
    const paceConfig = {
      relaxed: { min: 3, max: 4 },
      moderate: { min: 4, max: 6 },
      intense: { min: 6, max: 8 }
    };

    const config = paceConfig[this.profile.pace] || paceConfig.moderate;
    return Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
  }

  /**
   * Obtener actividades candidatas de la ciudad
   */
  getCandidateActivities(cityData) {
    const activities = [];

    // Agregar actividades de todas las categorías
    Object.values(cityData.categories || {}).forEach(category => {
      if (Array.isArray(category.activities)) {
        activities.push(...category.activities);
      }
    });

    return activities;
  }

  /**
   * Calcular score de match entre actividad y perfil
   */
  calculateMatchScore(activity, dayNumber, totalDays) {
    let score = 0;

    // Base score por categoría de interés (0-10 points)
    const categoryInterests = {
      'Cultural': this.profile.interests.culture,
      'Food': this.profile.interests.food,
      'Nature': this.profile.interests.nature,
      'Pop Culture': this.profile.interests.popCulture,
      'Shopping': this.profile.interests.shopping,
      'Nightlife': this.profile.interests.nightlife,
      'Art': this.profile.interests.art,
      'Adventure': this.profile.interests.adventure,
      'Photography': this.profile.interests.photography,
      'Relax': this.profile.interests.relaxation
    };

    // Match con categorías de la actividad
    if (activity.categories) {
      activity.categories.forEach(cat => {
        score += (categoryInterests[cat] || 0);
      });
    }

    // Bonus si es actividad fotogénica y al usuario le gusta fotografía
    if (activity.isPhotogenic && this.profile.interests.photography > 7) {
      score += 3;
    }

    // Bonus para primera vez en Japón (actividades icónicas)
    if (this.profile.preferences.firstTimeJapan && activity.iconic) {
      score += 5;
    }

    // Penalización si requiere mucha movilidad y el usuario tiene limitaciones
    if (this.profile.preferences.mobility === 'limited' && activity.physicalDemand === 'high') {
      score -= 5;
    }

    // Ajustar por presupuesto
    const budgetMultipliers = {
      'ultra-low': 0.5,
      'backpacker': 0.7,
      'medium': 1.0,
      'comfort': 1.3,
      'luxury': 2.0,
      'unlimited': 3.0
    };

    const budgetMultiplier = budgetMultipliers[this.profile.budget.category] || 1.0;

    // Si la actividad es cara y el presupuesto es bajo, penalizar
    const activityCost = activity.estimatedCost || 0;
    if (activityCost > 5000 && this.profile.budget.category === 'backpacker') {
      score -= 3;
    }

    // Bonus para actividades familiares si es familia
    if (this.profile.groupType === 'family' && activity.familyFriendly) {
      score += 4;
    }

    // Bonus para vida nocturna si es pareja o amigos
    if (['couple', 'friends'].includes(this.profile.groupType) &&
        activity.categories?.includes('Nightlife')) {
      score += 2;
    }

    // Ajustar por evitar multitudes
    if (this.profile.preferences.avoidCrowds && activity.crowdLevel === 'high') {
      score -= 4;
    }

    // Bonus para días finales (experiencias memorables)
    if (dayNumber > totalDays * 0.8 && activity.memorable) {
      score += 3;
    }

    return Math.max(score, 0);
  }

  /**
   * Seleccionar actividades balanceadas
   */
  selectBalancedActivities(scoredActivities, count, budget) {
    const selected = [];
    const categoriesUsed = {};
    let totalCost = 0;

    // Reglas de balanceo
    const maxPerCategory = Math.ceil(count / 2); // Máximo 50% de una categoría

    for (const activity of scoredActivities) {
      if (selected.length >= count) break;

      // Verificar presupuesto
      const cost = activity.estimatedCost || 0;
      if (budget && (totalCost + cost > budget)) {
        continue;
      }

      // Verificar balance de categorías
      const mainCategory = activity.categories?.[0];
      const categoryCount = categoriesUsed[mainCategory] || 0;

      if (categoryCount >= maxPerCategory) {
        continue; // Ya tenemos suficientes de esta categoría
      }

      // Agregar actividad
      selected.push(activity);
      totalCost += cost;

      if (mainCategory) {
        categoriesUsed[mainCategory] = categoryCount + 1;
      }
    }

    // Si no llegamos al count, agregar más sin restricciones
    if (selected.length < count) {
      for (const activity of scoredActivities) {
        if (selected.length >= count) break;
        if (selected.includes(activity)) continue;

        const cost = activity.estimatedCost || 0;
        if (!budget || (totalCost + cost <= budget)) {
          selected.push(activity);
          totalCost += cost;
        }
      }
    }

    return selected;
  }

  /**
   * Asignar horarios a las actividades
   */
  assignSchedules(activities, dayNumber, date) {
    const scheduled = [];

    // Configurar horarios base según preferencia
    const timePreference = this.profile.preferences.timeOfDay;

    let currentTime = this.getStartTime(timePreference);

    activities.forEach((activity, index) => {
      const duration = activity.duration || 2; // Default 2 horas
      const endTime = this.addHours(currentTime, duration);

      scheduled.push({
        ...activity,
        timeStart: currentTime,
        timeEnd: endTime,
        day: dayNumber,
        date: date
      });

      // Siguiente actividad: tiempo actual + duración + buffer (30 min)
      currentTime = this.addHours(endTime, 0.5);
    });

    return scheduled;
  }

  /**
   * Obtener hora de inicio según preferencia
   */
  getStartTime(preference) {
    const startTimes = {
      morning: '08:00',
      balanced: '09:00',
      evening: '10:00'
    };
    return startTimes[preference] || '09:00';
  }

  /**
   * Agregar horas a un time string
   */
  addHours(timeStr, hours) {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = h * 60 + m + (hours * 60);
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  }

  /**
   * Sugerir ciudades y días según perfil
   */
  suggestCitiesAndDays(totalTripDays) {
    const suggestions = [];

    // Siempre incluir Tokyo (es el hub principal)
    const tokyoDays = this.calculateTokyoDays(totalTripDays);
    suggestions.push({
      city: 'tokyo',
      days: tokyoDays,
      priority: 10,
      reason: 'Ciudad principal, epicentro de experiencias'
    });

    const remainingDays = totalTripDays - tokyoDays;

    // Kyoto si hay interés cultural alto
    if (this.profile.interests.culture > 6 && remainingDays >= 3) {
      const kyotoDays = Math.min(Math.ceil(remainingDays * 0.4), 4);
      suggestions.push({
        city: 'kyoto',
        days: kyotoDays,
        priority: 9,
        reason: 'Templos históricos y cultura tradicional'
      });
    }

    // Osaka si hay interés gastronómico alto
    if (this.profile.interests.food > 7 && remainingDays >= 2) {
      const osakaDays = Math.min(Math.ceil(remainingDays * 0.3), 3);
      suggestions.push({
        city: 'osaka',
        days: osakaDays,
        priority: 8,
        reason: 'Paraíso gastronómico'
      });
    }

    // Hakone/naturaleza si hay interés en naturaleza/relax
    if ((this.profile.interests.nature > 7 || this.profile.interests.relaxation > 7) &&
        remainingDays >= 2) {
      suggestions.push({
        city: 'hakone',
        days: 2,
        priority: 7,
        reason: 'Onsen, Monte Fuji y naturaleza'
      });
    }

    // Nara (día trip desde Kyoto o Osaka)
    if (this.profile.interests.nature > 5 && this.profile.interests.culture > 5) {
      suggestions.push({
        city: 'nara',
        days: 1,
        priority: 6,
        reason: 'Ciervos sagrados y templos antiguos'
      });
    }

    // Ordenar por prioridad
    suggestions.sort((a, b) => b.priority - a.priority);

    // Ajustar días para que no excedan el total
    let totalDaysAllocated = suggestions.reduce((sum, s) => sum + s.days, 0);

    if (totalDaysAllocated > totalTripDays) {
      // Reducir proporcionalmente
      const ratio = totalTripDays / totalDaysAllocated;
      suggestions.forEach(s => {
        s.days = Math.max(1, Math.round(s.days * ratio));
      });
    }

    return suggestions;
  }

  /**
   * Calcular días en Tokyo según total de días del viaje
   */
  calculateTokyoDays(totalDays) {
    if (totalDays <= 5) return Math.ceil(totalDays * 0.6); // 60% en Tokyo
    if (totalDays <= 10) return Math.min(5, Math.ceil(totalDays * 0.5)); // 50% o max 5 días
    return Math.min(6, Math.ceil(totalDays * 0.4)); // 40% o max 6 días
  }

  /**
   * Generar itinerario completo automáticamente
   */
  async generateCompleteItinerary(tripData) {
    const { startDate, endDate, days } = tripData;

    console.log('🎯 Generating smart itinerary for profile:', this.profile.travelStyle);

    // 1. Sugerir ciudades y distribución de días
    const cityDistribution = this.suggestCitiesAndDays(days);

    console.log('🏙️ City distribution:', cityDistribution);

    // 2. Generar actividades día por día
    const itinerary = [];
    let dayCounter = 1;
    let remainingBudget = this.profile.budget.total;

    for (const cityAllocation of cityDistribution) {
      const { city, days: cityDays } = cityAllocation;

      for (let i = 0; i < cityDays; i++) {
        const dayActivities = this.generateActivitiesForDay({
          dayNumber: dayCounter,
          city,
          date: this.addDaysToDate(startDate, dayCounter - 1),
          totalDays: days,
          remainingBudget
        });

        // Calcular costo del día
        const dayCost = dayActivities.reduce((sum, act) => sum + (act.estimatedCost || 0), 0);
        remainingBudget -= dayCost;

        itinerary.push({
          day: dayCounter,
          city,
          date: this.addDaysToDate(startDate, dayCounter - 1),
          activities: dayActivities,
          estimatedCost: dayCost
        });

        dayCounter++;

        if (dayCounter > days) break;
      }

      if (dayCounter > days) break;
    }

    console.log('✅ Complete itinerary generated:', itinerary.length, 'days');

    return {
      itinerary,
      cityDistribution,
      totalEstimatedCost: this.profile.budget.total - remainingBudget,
      budgetStatus: remainingBudget >= 0 ? 'on-track' : 'over'
    };
  }

  /**
   * Agregar días a una fecha
   */
  addDaysToDate(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
}

export default SmartRecommender;
