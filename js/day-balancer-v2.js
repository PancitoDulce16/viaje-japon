// js/day-balancer.js - Sistema de Balance Inteligente de Días
// Analiza el itinerario y sugiere redistribución de actividades para optimizar la experiencia

import { RouteOptimizer } from './route-optimizer-v2.js';

/**
 * Analiza la "carga" de un día basándose en múltiples factores
 * @param {Object} day - Día a analizar
 * @returns {Object} { load, score, factors, issues }
 */
function analyzeDayLoad(day) {
    if (!day || !day.activities) {
        return {
            load: 'empty',
            score: 0,
            factors: {},
            issues: ['Día vacío']
        };
    }

    const activities = day.activities;
    const activityCount = activities.length;

    // Factores de análisis
    const factors = {
        activityCount: activityCount,
        totalDuration: 0,
        totalCost: 0,
        totalDistance: 0,
        transportTime: 0,
        hasEarlyStart: false,
        hasLateEnd: false,
        zonesCount: 0
    };

    // Calcular duración total
    factors.totalDuration = activities.reduce((sum, act) => {
        return sum + (act.duration || 60); // Default 60 min
    }, 0);

    // Calcular costo total
    factors.totalCost = activities.reduce((sum, act) => {
        return sum + (act.cost || 0);
    }, 0);

    // Calcular distancia y tiempo de transporte
    if (activityCount > 1) {
        // Solo calcular si hay actividades con coordenadas
        const activitiesWithCoords = activities.filter(act =>
            act.coordinates && act.coordinates.lat && act.coordinates.lng
        );

        if (activitiesWithCoords.length > 1) {
            try {
                const routeStats = RouteOptimizer.calculateRouteStats(activitiesWithCoords);
                factors.totalDistance = routeStats.totalDistance;
                factors.transportTime = routeStats.totalTime;
            } catch (err) {
                console.warn('⚠️ Error calculating route stats:', err);
                // Continuar sin datos de ruta
            }
        }
    }

    // Detectar start/end times
    activities.forEach(act => {
        if (act.startTime) {
            const hour = parseInt(act.startTime.split(':')[0]);
            if (hour <= 7) factors.hasEarlyStart = true;
            if (hour >= 20) factors.hasLateEnd = true;
        }
    });

    // Contar zonas únicas
    const zones = new Set(activities.map(act => act.zone || act.area || 'unknown'));
    factors.zonesCount = zones.size;

    // SCORING: Calcular puntuación de sobrecarga (0-100)
    let score = 0;
    const issues = [];

    // 1. Cantidad de actividades (peso: 30%)
    if (activityCount === 0) {
        score = 0;
        issues.push('Día vacío - sin actividades');
    } else if (activityCount <= 2) {
        score += 10;
        issues.push('Día ligero - pocas actividades');
    } else if (activityCount <= 4) {
        score += 20; // Ideal
    } else if (activityCount <= 6) {
        score += 25;
    } else if (activityCount <= 8) {
        score += 28;
        issues.push('Día cargado - muchas actividades');
    } else {
        score += 30;
        issues.push('Día sobrecargado - demasiadas actividades');
    }

    // 2. Duración total (peso: 25%)
    const totalHours = factors.totalDuration / 60;
    if (totalHours <= 4) {
        score += 10;
    } else if (totalHours <= 8) {
        score += 20; // Ideal
    } else if (totalHours <= 10) {
        score += 23;
    } else if (totalHours <= 12) {
        score += 25;
        issues.push('Día largo - más de 10 horas de actividades');
    } else {
        score += 25;
        issues.push('Día extremadamente largo - agotador');
    }

    // 3. Tiempo de transporte (peso: 20%)
    if (factors.transportTime === 0) {
        score += 15;
    } else if (factors.transportTime <= 60) {
        score += 20; // Ideal
    } else if (factors.transportTime <= 120) {
        score += 18;
    } else if (factors.transportTime <= 180) {
        score += 15;
        issues.push('Mucho tiempo de traslado (>2h)');
    } else {
        score += 10;
        issues.push('Tiempo de traslado excesivo (>3h)');
    }

    // 4. Costo (peso: 15%)
    if (factors.totalCost === 0) {
        score += 10;
    } else if (factors.totalCost <= 5000) {
        score += 15; // Económico
    } else if (factors.totalCost <= 15000) {
        score += 15; // Moderado
    } else if (factors.totalCost <= 25000) {
        score += 12;
    } else {
        score += 8;
        issues.push('Día costoso (>¥25,000)');
    }

    // 5. Diversidad de zonas (peso: 10%)
    if (factors.zonesCount <= 1) {
        score += 10; // Ideal - una sola zona
    } else if (factors.zonesCount === 2) {
        score += 8;
    } else if (factors.zonesCount === 3) {
        score += 5;
        issues.push('Demasiadas zonas diferentes');
    } else {
        score += 3;
        issues.push('Muchas zonas - poco eficiente');
    }

    // Determinar nivel de carga
    let load;
    if (score === 0) {
        load = 'empty';
    } else if (score < 40) {
        load = 'low';
    } else if (score < 60) {
        load = 'light';
    } else if (score < 75) {
        load = 'balanced'; // ¡Ideal!
    } else if (score < 85) {
        load = 'heavy';
    } else {
        load = 'overloaded';
    }

    return {
        load,
        score,
        factors,
        issues: issues.length > 0 ? issues : ['Día bien balanceado']
    };
}

/**
 * Analiza todo el itinerario y detecta desequilibrios
 * @param {Array} days - Array de días del itinerario
 * @returns {Object} Análisis completo con sugerencias
 */
function analyzeItineraryBalance(days) {
    if (!days || days.length === 0) {
        return {
            balanced: false,
            overallScore: 0,
            daysAnalysis: [],
            issues: ['No hay días en el itinerario'],
            suggestions: []
        };
    }

    // Analizar cada día
    const daysAnalysis = days.map(day => ({
        day: day.day,
        date: day.date,
        analysis: analyzeDayLoad(day),
        activities: day.activities || []
    }));

    // Calcular score general
    const totalScore = daysAnalysis.reduce((sum, d) => sum + d.analysis.score, 0);
    const avgScore = totalScore / daysAnalysis.length;

    // Detectar problemas generales
    const issues = [];
    const emptyDays = daysAnalysis.filter(d => d.analysis.load === 'empty');
    const overloadedDays = daysAnalysis.filter(d => d.analysis.load === 'overloaded' || d.analysis.load === 'heavy');
    const lightDays = daysAnalysis.filter(d => d.analysis.load === 'low' || d.analysis.load === 'light');

    if (emptyDays.length > 0) {
        issues.push(`${emptyDays.length} día(s) vacío(s)`);
    }
    if (overloadedDays.length > 0) {
        issues.push(`${overloadedDays.length} día(s) sobrecargado(s)`);
    }

    // Calcular si está balanceado
    const stdDev = calculateStandardDeviation(daysAnalysis.map(d => d.analysis.score));
    const balanced = stdDev < 15 && emptyDays.length === 0 && overloadedDays.length <= 1;

    // Generar sugerencias
    const suggestions = generateBalancingSuggestions(daysAnalysis, {
        emptyDays,
        overloadedDays,
        lightDays
    });

    return {
        balanced,
        overallScore: Math.round(avgScore),
        standardDeviation: Math.round(stdDev),
        daysAnalysis,
        issues: issues.length > 0 ? issues : ['Itinerario bien balanceado'],
        suggestions
    };
}

/**
 * Detecta actividades duplicadas en el itinerario
 * @param {Array} days - Días del itinerario
 * @returns {Array} Lista de duplicados encontrados
 */
function detectDuplicateActivities(days) {
    const duplicates = [];
    const activitiesSeen = new Map(); // title -> [{day, activity}]

    days.forEach(day => {
        if (!day.activities) return;

        day.activities.forEach(activity => {
            const title = (activity.title || activity.name || '').trim().toLowerCase();
            if (!title) return;

            if (activitiesSeen.has(title)) {
                const previous = activitiesSeen.get(title);
                duplicates.push({
                    title: activity.title || activity.name,
                    days: [previous[0].day, day.day],
                    activities: [previous[0].activity, activity]
                });
            } else {
                activitiesSeen.set(title, [{ day: day.day, activity }]);
            }
        });
    });

    return duplicates;
}

/**
 * Genera sugerencias concretas para balancear el itinerario
 */
function generateBalancingSuggestions(daysAnalysis, { emptyDays, overloadedDays, lightDays }) {
    const suggestions = [];

    // Sugerencia 0: Eliminar actividades duplicadas
    const duplicates = detectDuplicateActivities(daysAnalysis.map(d => ({
        day: d.day,
        activities: d.activities
    })));

    if (duplicates.length > 0) {
        duplicates.forEach(dup => {
            suggestions.push({
                type: 'remove-duplicate',
                priority: 'high',
                description: `Eliminar actividad duplicada: "${dup.title}"`,
                reason: `Esta actividad aparece en los Días ${dup.days.join(' y ')}`,
                duplicateInfo: dup
            });
        });
    }

    // Sugerencia 1: Mover actividades de días sobrecargados a días vacíos/ligeros
    if (overloadedDays.length > 0 && (emptyDays.length > 0 || lightDays.length > 0)) {
        overloadedDays.forEach(overloadedDay => {
            const targetDays = [...emptyDays, ...lightDays].filter(d => d.day !== overloadedDay.day);

            if (targetDays.length > 0 && overloadedDay.activities.length > 6) {
                // Solo mover de días REALMENTE sobrecargados (más de 6 actividades)
                // Encontrar actividades candidatas para mover (las que están más lejos de las demás)
                const candidates = findMovableCandidates(overloadedDay.activities);

                // Limitar a mover máximo 2 actividades por día sobrecargado
                const toMove = Math.min(2, Math.floor(overloadedDay.activities.length / 3));

                candidates.slice(0, toMove).forEach(activity => {
                    // Buscar el mejor día destino (más cercano temporalmente)
                    const bestTarget = findBestTargetDay(overloadedDay, targetDays, activity);

                    // ✅ VERIFICAR que el día destino no termine con demasiadas actividades
                    if (bestTarget && bestTarget.activities.length < 6) {
                        suggestions.push({
                            type: 'move',
                            priority: 'high',
                            description: `Mover "${activity.title || activity.name}" del Día ${overloadedDay.day} al Día ${bestTarget.day}`,
                            reason: `Aliviará el Día ${overloadedDay.day} (${overloadedDay.activities.length} actividades) y llenará el Día ${bestTarget.day} (${bestTarget.activities.length} actividades)`,
                            from: { day: overloadedDay.day, activityId: activity.id },
                            to: { day: bestTarget.day },
                            activity: activity
                        });
                    }
                });
            }
        });
    }

    // Sugerencia 2: Optimizar rutas y horarios
    daysAnalysis.forEach(dayAnalysis => {
        if (dayAnalysis.activities.length > 3) {
            const longTransfers = RouteOptimizer.detectLongTransfers(dayAnalysis.activities, 3);

            // Si hay traslados largos O muchas zonas, sugerir reorganización
            if (longTransfers.length > 0 || dayAnalysis.analysis.factors.zonesCount > 2) {
                // Generar sugerencia con múltiples opciones de modo
                suggestions.push({
                    type: 'reorder',
                    priority: longTransfers.length > 0 ? 'high' : 'medium',
                    description: `Optimizar ruta del Día ${dayAnalysis.day}`,
                    reason: longTransfers.length > 0
                        ? `Hay ${longTransfers.length} traslado(s) largo(s) que se pueden optimizar`
                        : `${dayAnalysis.analysis.factors.zonesCount} zonas diferentes - se puede mejorar`,
                    day: dayAnalysis.day,
                    longTransfers: longTransfers,
                    // Opciones de optimización
                    modes: {
                        balanced: {
                            label: 'Balanceado (Recomendado)',
                            description: 'Optimiza geografía respetando horarios aproximados'
                        },
                        geography: {
                            label: 'Solo Geografía',
                            description: 'Minimiza distancia total (recalcula todos los horarios)'
                        },
                        time: {
                            label: 'Solo Horarios',
                            description: 'Mantiene horarios actuales, solo reordena por tiempo'
                        }
                    }
                });
            }
        }
    });

    // Sugerencia 3: Distribuir costo uniformemente
    const avgCost = daysAnalysis.reduce((sum, d) => sum + d.analysis.factors.totalCost, 0) / daysAnalysis.length;
    const expensiveDays = daysAnalysis.filter(d => d.analysis.factors.totalCost > avgCost * 1.5);

    if (expensiveDays.length > 0) {
        expensiveDays.forEach(day => {
            suggestions.push({
                type: 'redistribute-cost',
                priority: 'low',
                description: `El Día ${day.day} tiene un costo muy alto (¥${day.analysis.factors.totalCost})`,
                reason: `Considera mover actividades costosas a otros días para distribuir mejor el presupuesto`,
                day: day.day,
                currentCost: day.analysis.factors.totalCost,
                averageCost: Math.round(avgCost)
            });
        });
    }

    return suggestions;
}

/**
 * Encuentra actividades candidatas para mover (menos conectadas con las demás)
 */
function findMovableCandidates(activities) {
    if (!activities || activities.length <= 3) return [];

    const withCoords = activities.filter(act =>
        act.coordinates && act.coordinates.lat && act.coordinates.lng
    );

    if (withCoords.length < 2) {
        // Si no hay coordenadas, mover las últimas del día
        return activities.slice(-2);
    }

    // Calcular cuán "aislada" está cada actividad
    const isolation = withCoords.map((act, index) => {
        let totalDistance = 0;
        let count = 0;

        withCoords.forEach((other, otherIndex) => {
            if (index !== otherIndex) {
                const distance = RouteOptimizer.calculateDistance(
                    act.coordinates,
                    other.coordinates
                );
                totalDistance += distance;
                count++;
            }
        });

        return {
            activity: act,
            avgDistance: totalDistance / count,
            isolation: totalDistance / count
        };
    });

    // Ordenar por aislamiento (más aisladas primero)
    isolation.sort((a, b) => b.isolation - a.isolation);

    return isolation.slice(0, 2).map(i => i.activity);
}

/**
 * Encuentra el mejor día destino para una actividad
 */
function findBestTargetDay(sourceDay, targetDays, activity) {
    // Preferir días cercanos temporalmente
    const sortedByProximity = targetDays.sort((a, b) => {
        const distA = Math.abs(a.day - sourceDay.day);
        const distB = Math.abs(b.day - sourceDay.day);
        return distA - distB;
    });

    // Preferir días con menos carga
    const sortedByLoad = sortedByProximity.sort((a, b) => {
        return a.analysis.score - b.analysis.score;
    });

    return sortedByLoad[0];
}

/**
 * Calcula desviación estándar
 */
function calculateStandardDeviation(values) {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(variance);
}

/**
 * Verifica si una actividad cabe en el día sin solaparse con otras
 * @param {Object} targetDay - Día destino
 * @param {Object} activity - Actividad a agregar
 * @returns {boolean} true si cabe, false si se solaparía
 */
function canFitActivity(targetDay, activity) {
    if (!targetDay.activities || targetDay.activities.length === 0) {
        return true; // Día vacío, siempre cabe
    }

    // Si la actividad no tiene horario, no hay conflicto
    if (!activity.time && !activity.startTime) {
        return true;
    }

    const activityStart = parseTime(activity.time || activity.startTime);
    const activityDuration = activity.duration || 60;
    const activityEnd = activityStart + activityDuration;

    // Verificar contra todas las actividades del día
    for (const existing of targetDay.activities) {
        if (!existing.time && !existing.startTime) continue;

        const existingStart = parseTime(existing.time || existing.startTime);
        const existingDuration = existing.duration || 60;
        const existingEnd = existingStart + existingDuration;

        // Verificar solapamiento
        if (
            (activityStart >= existingStart && activityStart < existingEnd) ||
            (activityEnd > existingStart && activityEnd <= existingEnd) ||
            (activityStart <= existingStart && activityEnd >= existingEnd)
        ) {
            return false; // Se solapa
        }
    }

    return true; // No hay solapamiento
}

/**
 * Convierte tiempo "HH:MM" a minutos desde medianoche
 */
function parseTime(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Ordena actividades por hora de inicio
 */
function sortActivitiesByTime(activities) {
    return activities.sort((a, b) => {
        const timeA = a.time || a.startTime;
        const timeB = b.time || b.startTime;

        if (!timeA && !timeB) return 0;
        if (!timeA) return 1;
        if (!timeB) return -1;

        return parseTime(timeA) - parseTime(timeB);
    });
}

/**
 * Aplica una sugerencia de balanceo automáticamente
 * @param {Array} days - Array de días
 * @param {Object} suggestion - Sugerencia a aplicar
 * @param {Object} options - Opciones de aplicación
 * @returns {Array} Días modificados
 */
function applySuggestion(days, suggestion, options = {}) {
    const {
        recalculateTimings = true,
        optimizationMode = 'balanced' // 'time', 'geography', 'balanced'
    } = options;

    const newDays = JSON.parse(JSON.stringify(days)); // Deep clone

    if (suggestion.type === 'remove-duplicate') {
        // Eliminar actividad duplicada
        const { duplicateInfo } = suggestion;

        // Eliminar de todos los días excepto el primero
        for (let i = 1; i < duplicateInfo.days.length; i++) {
            const dayNum = duplicateInfo.days[i];
            const day = newDays.find(d => d.day === dayNum);

            if (day) {
                const activityTitle = duplicateInfo.title.toLowerCase();
                day.activities = day.activities.filter(act => {
                    const title = (act.title || act.name || '').trim().toLowerCase();
                    return title !== activityTitle;
                });

                console.log(`✅ Eliminada actividad duplicada "${duplicateInfo.title}" del Día ${dayNum}`);
            }
        }
    } else if (suggestion.type === 'move') {
        // Mover actividad de un día a otro
        const sourceDay = newDays.find(d => d.day === suggestion.from.day);
        const targetDay = newDays.find(d => d.day === suggestion.to.day);

        if (sourceDay && targetDay) {
            const activityIndex = sourceDay.activities.findIndex(
                act => (act.id === suggestion.from.activityId) ||
                       (act.title === suggestion.activity.title)
            );

            if (activityIndex !== -1) {
                const [activity] = sourceDay.activities.splice(activityIndex, 1);

                // ✅ VERIFICAR que la actividad no se solape con otras en el día destino
                if (canFitActivity(targetDay, activity)) {
                    targetDay.activities.push(activity);

                    // Reordenar por horario después de agregar
                    targetDay.activities = sortActivitiesByTime(targetDay.activities);

                    // Recalcular horarios si está habilitado
                    if (recalculateTimings) {
                        targetDay.activities = RouteOptimizer.recalculateTimings(
                            targetDay.activities,
                            { defaultDuration: 60, transportBuffer: 10 }
                        );
                        sourceDay.activities = RouteOptimizer.recalculateTimings(
                            sourceDay.activities,
                            { defaultDuration: 60, transportBuffer: 10 }
                        );
                    }
                } else {
                    // Si no cabe, devolver al día original
                    sourceDay.activities.splice(activityIndex, 0, activity);
                    console.warn(`⚠️ No se puede mover "${activity.title || activity.name}" - se solaparía con otra actividad`);
                }
            }
        }
    } else if (suggestion.type === 'reorder') {
        // Reordenar actividades usando el optimizador de rutas
        const day = newDays.find(d => d.day === suggestion.day);
        if (day && day.activities.length > 0) {
            // Usar el Route Optimizer para reorganizar
            const optimized = RouteOptimizer.optimizeRoute(day.activities, {
                optimizationMode: optimizationMode,
                recalculateTimings: recalculateTimings,
                considerOpeningHours: true
            });

            if (optimized.wasOptimized) {
                day.activities = optimized.optimizedActivities;

                // ✅ VALIDAR que no haya solapamientos después de reorganizar
                const hasOverlaps = detectTimeOverlaps(day.activities);
                if (hasOverlaps.length > 0) {
                    console.warn(`⚠️ Se detectaron ${hasOverlaps.length} solapamientos después de reorganizar`);

                    // Si hay solapamientos y recalculateTimings está deshabilitado,
                    // forzar recalculación
                    if (!recalculateTimings) {
                        day.activities = RouteOptimizer.recalculateTimings(
                            day.activities,
                            { defaultDuration: 60, transportBuffer: 10 }
                        );
                    }
                }
            }
        }
    }

    return newDays;
}

/**
 * Detecta solapamientos de horarios en un array de actividades
 * @param {Array} activities - Actividades a verificar
 * @returns {Array} Lista de solapamientos detectados
 */
function detectTimeOverlaps(activities) {
    const overlaps = [];
    const sorted = sortActivitiesByTime(activities);

    for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        if (!current.time || !next.time) continue;

        const currentEnd = parseTime(current.time) + (current.duration || 60);
        const nextStart = parseTime(next.time);

        if (currentEnd > nextStart) {
            overlaps.push({
                activity1: current.title || current.name,
                activity2: next.title || next.name,
                overlapMinutes: currentEnd - nextStart
            });
        }
    }

    return overlaps;
}

/**
 * Aplica todas las sugerencias automáticamente
 * @param {Array} days - Días del itinerario
 * @param {Array} suggestions - Sugerencias a aplicar
 * @param {Object} options - Opciones
 * @returns {Object} {days: Array, applied: number, skipped: number}
 */
function applyAllSuggestions(days, suggestions, options = {}) {
    let currentDays = JSON.parse(JSON.stringify(days));
    let applied = 0;
    let skipped = 0;

    // Ordenar sugerencias por prioridad
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const sortedSuggestions = suggestions.sort((a, b) =>
        (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
    );

    // Aplicar cada sugerencia
    for (const suggestion of sortedSuggestions) {
        try {
            const result = applySuggestion(currentDays, suggestion, options);

            // Verificar si realmente cambió algo
            if (JSON.stringify(result) !== JSON.stringify(currentDays)) {
                currentDays = result;
                applied++;
                console.log(`✅ Aplicada: ${suggestion.description}`);
            } else {
                skipped++;
                console.log(`⚠️ Omitida (sin cambios): ${suggestion.description}`);
            }
        } catch (error) {
            skipped++;
            console.error(`❌ Error aplicando "${suggestion.description}":`, error);
        }
    }

    return {
        days: currentDays,
        applied,
        skipped,
        total: suggestions.length
    };
}

// Exportar el sistema
export const DayBalancer = {
    analyzeDayLoad,
    analyzeItineraryBalance,
    generateBalancingSuggestions,
    applySuggestion,
    applyAllSuggestions,
    detectDuplicateActivities,
    detectTimeOverlaps,
    canFitActivity,
    sortActivitiesByTime,
    parseTime
};

// Exponer globalmente para uso desde HTML
if (typeof window !== 'undefined') {
    window.DayBalancer = DayBalancer;
}
