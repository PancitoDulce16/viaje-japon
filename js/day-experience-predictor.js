// js/day-experience-predictor.js - Sistema de Predicción de Experiencia del Día
// Predice cómo será la experiencia de cada día basándose en múltiples factores

import { RouteOptimizer } from './route-optimizer.js?v=2025-11-07-ROUTE-FIX-2';

/**
 * Predice el nivel de energía requerido para un día
 * @param {Object} day - Día a analizar
 * @returns {Object} { level, score, factors, advice }
 */
function predictEnergyLevel(day) {
    if (!day || !day.activities || day.activities.length === 0) {
        return {
            level: 'none',
            score: 0,
            factors: {},
            advice: 'Día libre - perfecto para descansar'
        };
    }

    const activities = day.activities;
    const factors = {
        activityCount: activities.length,
        totalDuration: 0,
        walkingDistance: 0,
        transportTime: 0,
        earlyStart: false,
        lateEnd: false,
        continuousHours: 0
    };

    // Calcular duración total
    factors.totalDuration = activities.reduce((sum, act) =>
        sum + (act.duration || 60), 0);

    // Calcular distancia caminando y tiempo de transporte
    const activitiesWithCoords = activities.filter(act =>
        act?.coordinates?.lat && act?.coordinates?.lng
    );

    if (activitiesWithCoords.length > 1) {
        try {
            const routeStats = RouteOptimizer.calculateRouteStats(activitiesWithCoords);
            factors.walkingDistance = routeStats.totalDistance || 0;
            factors.transportTime = routeStats.totalTime || 0;
        } catch (err) {
            console.warn('⚠️ Error calculating route for energy prediction:', err);
        }
    }

    // Detectar horarios extremos
    activities.forEach(act => {
        if (act.startTime) {
            const hour = parseInt(act.startTime.split(':')[0]);
            if (hour <= 7) factors.earlyStart = true;
            if (hour >= 21) factors.lateEnd = true;
        }
    });

    // Calcular horas continuas de actividad
    const sortedActivities = [...activities].sort((a, b) => {
        const timeA = a.startTime || '12:00';
        const timeB = b.startTime || '12:00';
        return timeA.localeCompare(timeB);
    });

    if (sortedActivities.length > 0 && sortedActivities[0].startTime) {
        const firstHour = parseInt(sortedActivities[0].startTime.split(':')[0]);
        const lastActivity = sortedActivities[sortedActivities.length - 1];
        const lastHour = lastActivity.startTime ?
            parseInt(lastActivity.startTime.split(':')[0]) +
            Math.ceil((lastActivity.duration || 60) / 60) : firstHour;
        factors.continuousHours = lastHour - firstHour;
    }

    // SCORING: Calcular nivel de energía (0-100)
    let score = 0;

    // Factor 1: Cantidad de actividades (peso: 25%)
    if (factors.activityCount <= 2) score += 5;
    else if (factors.activityCount <= 4) score += 15;
    else if (factors.activityCount <= 6) score += 20;
    else if (factors.activityCount <= 8) score += 23;
    else score += 25;

    // Factor 2: Duración total (peso: 25%)
    const totalHours = factors.totalDuration / 60;
    if (totalHours <= 4) score += 8;
    else if (totalHours <= 6) score += 15;
    else if (totalHours <= 8) score += 20;
    else if (totalHours <= 10) score += 23;
    else score += 25;

    // Factor 3: Distancia caminando (peso: 20%)
    if (factors.walkingDistance <= 2) score += 5;
    else if (factors.walkingDistance <= 5) score += 10;
    else if (factors.walkingDistance <= 8) score += 15;
    else if (factors.walkingDistance <= 12) score += 18;
    else score += 20;

    // Factor 4: Horas continuas (peso: 15%)
    if (factors.continuousHours <= 4) score += 5;
    else if (factors.continuousHours <= 6) score += 8;
    else if (factors.continuousHours <= 8) score += 12;
    else if (factors.continuousHours <= 10) score += 14;
    else score += 15;

    // Factor 5: Horarios extremos (peso: 10%)
    if (!factors.earlyStart && !factors.lateEnd) score += 5;
    else if (factors.earlyStart && !factors.lateEnd) score += 7;
    else if (!factors.earlyStart && factors.lateEnd) score += 8;
    else score += 10;

    // Factor 6: Tiempo de transporte (peso: 5%)
    if (factors.transportTime <= 30) score += 2;
    else if (factors.transportTime <= 60) score += 3;
    else if (factors.transportTime <= 90) score += 4;
    else score += 5;

    // Determinar nivel
    let level, advice;
    if (score < 30) {
        level = 'low';
        advice = '😌 Día relajado - perfecto para descansar entre días intensos';
    } else if (score < 50) {
        level = 'medium';
        advice = '👍 Día equilibrado - buen ritmo sin agotarse';
    } else if (score < 75) {
        level = 'high';
        advice = '💪 Día intenso - prepárate con buen desayuno y zapatos cómodos';
    } else {
        level = 'extreme';
        advice = '🔥 Día extremo - considera reducir actividades o agregar descansos';
    }

    return { level, score, factors, advice };
}

/**
 * Predice el nivel de multitudes basándose en fecha y actividades
 * @param {Object} day - Día a analizar
 * @returns {Object} { level, score, factors, advice }
 */
function predictCrowdLevel(day) {
    if (!day || !day.activities || day.activities.length === 0) {
        return {
            level: 'none',
            score: 0,
            factors: {},
            advice: 'Sin actividades planificadas'
        };
    }

    const factors = {
        dayOfWeek: null,
        isWeekend: false,
        popularAttractions: 0,
        totalAttractions: day.activities.length,
        season: null
    };

    // Determinar día de la semana
    if (day.date) {
        try {
            const date = new Date(day.date);
            factors.dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
            factors.isWeekend = factors.dayOfWeek === 0 || factors.dayOfWeek === 6;

            // Determinar temporada
            const month = date.getMonth(); // 0-11
            if (month >= 2 && month <= 4) factors.season = 'spring'; // Marzo-Mayo (sakura)
            else if (month >= 5 && month <= 7) factors.season = 'summer';
            else if (month >= 8 && month <= 10) factors.season = 'autumn'; // Sep-Nov (koyo)
            else factors.season = 'winter';
        } catch (err) {
            console.warn('⚠️ Error parsing date for crowd prediction:', err);
        }
    }

    // Contar atracciones populares
    const popularKeywords = [
        'shibuya', 'shinjuku', 'sensoji', 'fushimi', 'arashiyama',
        'dotonbori', 'nara', 'miyajima', 'fuji', 'disney',
        'universal', 'teamlab', 'skytree', 'tower', 'castle'
    ];

    factors.popularAttractions = day.activities.filter(act => {
        const title = (act.title || act.name || '').toLowerCase();
        return popularKeywords.some(keyword => title.includes(keyword));
    }).length;

    // SCORING: Calcular nivel de multitudes (0-100)
    let score = 0;

    // Factor 1: Día de la semana (peso: 35%)
    if (factors.isWeekend) score += 35;
    else if (factors.dayOfWeek === 5) score += 25; // Viernes
    else score += 15;

    // Factor 2: Temporada (peso: 30%)
    if (factors.season === 'spring') score += 30; // Cherry blossoms
    else if (factors.season === 'autumn') score += 25; // Fall colors
    else if (factors.season === 'summer') score += 20; // Vacaciones
    else score += 15; // Invierno menos turistas

    // Factor 3: Atracciones populares (peso: 35%)
    const popularRatio = factors.popularAttractions / factors.totalAttractions;
    if (popularRatio >= 0.75) score += 35;
    else if (popularRatio >= 0.5) score += 28;
    else if (popularRatio >= 0.25) score += 20;
    else score += 10;

    // Determinar nivel
    let level, advice;
    if (score < 35) {
        level = 'quiet';
        advice = '🌿 Día tranquilo - perfecto para disfrutar sin aglomeraciones';
    } else if (score < 60) {
        level = 'moderate';
        advice = '👥 Multitudes moderadas - llega temprano a atracciones populares';
    } else if (score < 80) {
        level = 'crowded';
        advice = '🏙️ Día concurrido - reserva con anticipación y ten paciencia';
    } else {
        level = 'very_crowded';
        advice = '🚨 Muy concurrido - considera cambiar de día o visitar temprano/tarde';
    }

    return { level, score, factors, advice };
}

/**
 * Analiza el presupuesto del día
 * @param {Object} day - Día a analizar
 * @returns {Object} { category, total, breakdown, advice }
 */
function analyzeBudget(day) {
    if (!day || !day.activities || day.activities.length === 0) {
        return {
            category: 'none',
            total: 0,
            breakdown: {},
            advice: 'Sin gastos planificados'
        };
    }

    const breakdown = {
        activities: 0,
        transport: 0,
        food: 0,
        other: 0
    };

    // Calcular costos de actividades
    day.activities.forEach(act => {
        const cost = act.cost || 0;

        if (act.category === 'food' || act.subCategory === 'restaurant') {
            breakdown.food += cost;
        } else {
            breakdown.activities += cost;
        }
    });

    // Estimar transporte (si hay RouteOptimizer data)
    const activitiesWithCoords = day.activities.filter(act =>
        act?.coordinates?.lat && act?.coordinates?.lng
    );

    if (activitiesWithCoords.length > 1) {
        try {
            const routeStats = RouteOptimizer.calculateRouteStats(activitiesWithCoords);
            breakdown.transport = routeStats.totalCost || 0;
        } catch (err) {
            console.warn('⚠️ Error calculating transport cost:', err);
        }
    }

    const total = breakdown.activities + breakdown.transport + breakdown.food + breakdown.other;

    // Determinar categoría
    let category, advice;
    if (total === 0) {
        category = 'free';
        advice = '🆓 Día gratuito - perfecto para explorar sin gastar';
    } else if (total <= 3000) {
        category = 'budget';
        advice = '💵 Día económico - buen balance entre ahorro y diversión';
    } else if (total <= 8000) {
        category = 'moderate';
        advice = '💰 Presupuesto moderado - disfruta sin excesos';
    } else if (total <= 15000) {
        category = 'high';
        advice = '💳 Día costoso - asegúrate de tener suficiente efectivo';
    } else {
        category = 'premium';
        advice = '💎 Día premium - experiencias especiales tienen su precio';
    }

    return { category, total, breakdown, advice };
}

/**
 * Analiza el "ritmo" del día
 * @param {Object} day - Día a analizar
 * @returns {Object} { pace, score, factors, advice }
 */
function analyzePace(day) {
    if (!day || !day.activities || day.activities.length === 0) {
        return {
            pace: 'none',
            score: 0,
            factors: {},
            advice: 'Día libre sin actividades'
        };
    }

    const activities = day.activities;
    const factors = {
        activityCount: activities.length,
        avgDuration: 0,
        avgTimeBetween: 0,
        hasBuffer: false
    };

    // Calcular duración promedio
    const totalDuration = activities.reduce((sum, act) => sum + (act.duration || 60), 0);
    factors.avgDuration = totalDuration / activities.length;

    // Calcular tiempo promedio entre actividades
    const sortedActivities = [...activities]
        .filter(act => act.startTime)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (sortedActivities.length > 1) {
        let totalGaps = 0;
        let gapCount = 0;

        for (let i = 0; i < sortedActivities.length - 1; i++) {
            const current = sortedActivities[i];
            const next = sortedActivities[i + 1];

            if (current.startTime && next.startTime) {
                const currentEndHour = parseInt(current.startTime.split(':')[0]) +
                    Math.ceil((current.duration || 60) / 60);
                const nextStartHour = parseInt(next.startTime.split(':')[0]);
                const gap = nextStartHour - currentEndHour;

                totalGaps += Math.max(0, gap);
                gapCount++;
            }
        }

        factors.avgTimeBetween = gapCount > 0 ? totalGaps / gapCount : 0;
        factors.hasBuffer = factors.avgTimeBetween >= 1;
    }

    // SCORING: Determinar ritmo
    let pace, advice, score;

    if (factors.activityCount <= 2) {
        pace = 'relaxed';
        score = 25;
        advice = '🧘 Ritmo relajado - perfecto para disfrutar sin prisa';
    } else if (factors.activityCount <= 4 && factors.avgTimeBetween >= 1) {
        pace = 'comfortable';
        score = 50;
        advice = '😊 Ritmo cómodo - buen balance entre actividades y descansos';
    } else if (factors.activityCount <= 6 || factors.avgTimeBetween >= 0.5) {
        pace = 'moderate';
        score = 65;
        advice = '⏰ Ritmo moderado - mantén el cronograma pero sin estrés';
    } else if (factors.activityCount <= 8) {
        pace = 'intense';
        score = 80;
        advice = '🏃 Ritmo intenso - planifica bien los tiempos de traslado';
    } else {
        pace = 'aggressive';
        score = 95;
        advice = '🚀 Ritmo agresivo - difícil de mantener, considera reducir actividades';
    }

    return { pace, score, factors, advice };
}

/**
 * Genera una predicción completa de la experiencia del día
 * @param {Object} day - Día a analizar
 * @returns {Object} Predicción completa
 */
function predictDayExperience(day) {
    const energy = predictEnergyLevel(day);
    const crowds = predictCrowdLevel(day);
    const budget = analyzeBudget(day);
    const pace = analyzePace(day);

    // Calcular score general (promedio ponderado)
    const overallScore = Math.round(
        (energy.score * 0.35) +
        (crowds.score * 0.25) +
        (pace.score * 0.25) +
        (budget.total > 0 ? Math.min(budget.total / 150, 100) * 0.15 : 0)
    );

    // Generar recomendación general
    let recommendation;
    if (overallScore < 40) {
        recommendation = {
            rating: 'excellent',
            icon: '⭐⭐⭐⭐⭐',
            message: 'Día excelente - bien planificado y balanceado'
        };
    } else if (overallScore < 60) {
        recommendation = {
            rating: 'good',
            icon: '⭐⭐⭐⭐',
            message: 'Buen día - algunas áreas podrían mejorar'
        };
    } else if (overallScore < 75) {
        recommendation = {
            rating: 'fair',
            icon: '⭐⭐⭐',
            message: 'Día desafiante - considera ajustes para mejor experiencia'
        };
    } else {
        recommendation = {
            rating: 'challenging',
            icon: '⭐⭐',
            message: 'Día muy desafiante - recomendamos redistribuir actividades'
        };
    }

    return {
        energy,
        crowds,
        budget,
        pace,
        overallScore,
        recommendation
    };
}

/**
 * Predice la experiencia de todo el itinerario
 * @param {Array} days - Array de días
 * @returns {Object} Análisis completo del itinerario
 */
function predictItineraryExperience(days) {
    if (!days || days.length === 0) {
        return {
            days: [],
            summary: {
                avgEnergyScore: 0,
                avgCrowdScore: 0,
                totalBudget: 0,
                recommendedRestDays: 0
            }
        };
    }

    const predictions = days.map(day => ({
        day: day.day,
        date: day.date,
        prediction: predictDayExperience(day)
    }));

    // Calcular resumen
    const summary = {
        avgEnergyScore: Math.round(
            predictions.reduce((sum, p) => sum + p.prediction.energy.score, 0) / predictions.length
        ),
        avgCrowdScore: Math.round(
            predictions.reduce((sum, p) => sum + p.prediction.crowds.score, 0) / predictions.length
        ),
        totalBudget: predictions.reduce((sum, p) => sum + p.prediction.budget.total, 0),
        recommendedRestDays: predictions.filter(p => p.prediction.energy.level === 'low').length
    };

    return {
        days: predictions,
        summary
    };
}

// Exportar el sistema
export const DayExperiencePredictor = {
    predictEnergyLevel,
    predictCrowdLevel,
    analyzeBudget,
    analyzePace,
    predictDayExperience,
    predictItineraryExperience
};

// Exponer globalmente
if (typeof window !== 'undefined') {
    window.DayExperiencePredictor = DayExperiencePredictor;
}
