// js/day-balancer.js - Sistema de Balance Inteligente de Días
// Analiza el itinerario y sugiere redistribución de actividades para optimizar la experiencia

import { RouteOptimizer } from './route-optimizer-v2.js';

// Safe wrapper para TimeUtils
const SafeTimeUtils = {
  parseTime: (timeStr) => {
    if (window.TimeUtils) {
      return window.TimeUtils.parseTime(timeStr);
    }
    // Fallback básico
    if (!timeStr) return 0;
    const parts = String(timeStr).split(':');
    if (parts.length !== 2) return 0;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  },

  calculateStandardDeviation: (values) => {
    if (window.TimeUtils) {
      return window.TimeUtils.calculateStandardDeviation(values);
    }
    // Fallback básico
    if (!values || values.length === 0) return 0;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(variance);
  }
};

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

    // 🛫 JETLAG: Detectar si es el primer día del viaje
    const isFirstDay = day.day === 1;
    if (isFirstDay) {
        issues.push('⚠️ Primer día - considera el jetlag');
    }

    // 1. Cantidad de actividades (peso: 30%)
    if (activityCount === 0) {
        score = 0;
        issues.push('Día vacío - sin actividades');
    } else if (activityCount <= 2) {
        score += 10;
        if (isFirstDay) {
            issues.push('✅ Día ligero - PERFECTO para el primer día con jetlag');
        } else {
            issues.push('Día ligero - pocas actividades');
        }
    } else if (activityCount <= 4) {
        score += 20; // Ideal para días normales
        if (isFirstDay) {
            score += 5; // Penalización leve por jetlag
            issues.push('⚠️ Día normal - puede ser pesado para el primer día con jetlag');
        }
    } else if (activityCount <= 6) {
        score += 25;
        if (isFirstDay) {
            score += 10; // Penalización moderada por jetlag
            issues.push('⚠️ Día cargado - NO recomendado para el primer día (jetlag)');
        }
    } else if (activityCount <= 8) {
        score += 28;
        issues.push('Día cargado - muchas actividades');
        if (isFirstDay) {
            score += 15; // Penalización fuerte por jetlag
            issues.push('🚨 DEMASIADAS actividades para el primer día - reduce al menos a 4');
        }
    } else {
        score += 30;
        issues.push('Día sobrecargado - demasiadas actividades');
        if (isFirstDay) {
            score += 20; // Penalización muy fuerte por jetlag
            issues.push('🚨 SOBRECARGA CRÍTICA en día 1 - tu cuerpo necesita adaptarse al jetlag');
        }
    }

    // 2. Duración total (peso: 25%)
    const totalHours = factors.totalDuration / 60;
    if (totalHours <= 4) {
        score += 10;
        if (isFirstDay && activityCount > 0) {
            issues.push('✅ Duración corta - ideal para adaptarse al jetlag');
        }
    } else if (totalHours <= 8) {
        score += 20; // Ideal
        if (isFirstDay) {
            score += 5; // Penalización leve
            issues.push('⚠️ Día completo - puede cansar con jetlag');
        }
    } else if (totalHours <= 10) {
        score += 23;
        if (isFirstDay) {
            score += 8; // Penalización moderada
            issues.push('⚠️ Día largo - difícil con jetlag el primer día');
        }
    } else if (totalHours <= 12) {
        score += 25;
        issues.push('Día largo - más de 10 horas de actividades');
        if (isFirstDay) {
            score += 12; // Penalización fuerte
            issues.push('🚨 MUY LARGO para el primer día - reduce duración');
        }
    } else {
        score += 25;
        issues.push('Día extremadamente largo - agotador');
        if (isFirstDay) {
            score += 15; // Penalización muy fuerte
            issues.push('🚨 INSOSTENIBLE con jetlag - recorta actividades');
        }
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
 * @param {Object} itinerary - Itinerario completo (para obtener hoteles)
 * @returns {Object} Análisis completo con sugerencias
 */
function analyzeItineraryBalance(days, itinerary = null) {
    if (!days || days.length === 0) {
        return {
            balanced: false,
            overallScore: 0,
            daysAnalysis: [],
            issues: ['No hay días en el itinerario'],
            suggestions: []
        };
    }

    // Analizar cada día y obtener hotel base si existe
    const daysAnalysis = days.map(day => {
        let hotelCoords = null;

        // 🏨 Intentar obtener hotel para este día
        if (itinerary && itinerary.hotels && window.HotelBaseSystem) {
            try {
                const city = window.HotelBaseSystem.detectCityForDay(day);
                const hotel = window.HotelBaseSystem.getHotelForCity(itinerary, city);
                if (hotel && hotel.coordinates) {
                    hotelCoords = hotel.coordinates;
                    console.log(`🏨 Hotel detectado para Día ${day.day} (${city}):`, hotel.name);
                }
            } catch (error) {
                console.warn(`⚠️ No se pudo obtener hotel para Día ${day.day}:`, error);
            }
        }

        return {
            day: day.day,
            date: day.date,
            analysis: analyzeDayLoad(day),
            activities: day.activities || [],
            hotelCoordinates: hotelCoords // 🔥 Incluir coordenadas del hotel
        };
    });

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
    const stdDev = SafeTimeUtils.calculateStandardDeviation(daysAnalysis.map(d => d.analysis.score));
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

                // Si es la primera vez que vemos un duplicado, crear la entrada
                if (previous.length === 1) {
                    duplicates.push({
                        title: activity.title || activity.name,
                        days: [previous[0].day, day.day],
                        activities: [previous[0].activity, activity]
                    });
                } else {
                    // Si ya existe, agregar este nuevo día a la lista
                    const existingDuplicate = duplicates.find(d =>
                        d.title.toLowerCase() === title
                    );
                    if (existingDuplicate) {
                        existingDuplicate.days.push(day.day);
                        existingDuplicate.activities.push(activity);
                    }
                }

                // Actualizar el Map para rastrear TODAS las ocurrencias
                activitiesSeen.set(title, [...previous, { day: day.day, activity }]);
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

    // 🚨 PRIORIDAD 0: Detectar y mover actividades que NO CABEN en el día (overLimit)
    console.log('🚨 DETECTANDO ACTIVIDADES QUE NO CABEN...');
    daysAnalysis.forEach(dayAnalysis => {
        const overLimitActivities = dayAnalysis.activities.filter(act => act.overLimit === true);

        if (overLimitActivities.length > 0) {
            console.log(`🚨 Día ${dayAnalysis.day}: ${overLimitActivities.length} actividades NO caben (sobrepasan 23:00)`);

            // Encontrar días con espacio (días ligeros o vacíos)
            const daysWithSpace = daysAnalysis
                .filter(d => d.day !== dayAnalysis.day && d.activities.length < 6 && !d.activities.some(a => a.overLimit))
                .sort((a, b) => a.activities.length - b.activities.length);

            overLimitActivities.forEach(activity => {
                if (daysWithSpace.length > 0) {
                    const targetDay = daysWithSpace[0];
                    console.log(`   → Sugerencia: Mover "${activity.title || activity.name}" a Día ${targetDay.day}`);

                    suggestions.push({
                        type: 'move',
                        priority: 'critical', // MÁS ALTA PRIORIDAD
                        description: `⚠️ URGENTE: Mover "${activity.title || activity.name}" del Día ${dayAnalysis.day} al Día ${targetDay.day}`,
                        reason: `Esta actividad NO CABE en el Día ${dayAnalysis.day} (sobrepasa las 23:00). Debe moverse a otro día.`,
                        from: { day: dayAnalysis.day, activityId: activity.id },
                        to: { day: targetDay.day },
                        activity: activity
                    });
                } else {
                    console.warn(`   ⚠️ No hay días con espacio para mover "${activity.title || activity.name}"`);
                    suggestions.push({
                        type: 'manual-action',
                        priority: 'critical',
                        description: `⚠️ URGENTE: "${activity.title || activity.name}" no cabe en el Día ${dayAnalysis.day}`,
                        reason: `Esta actividad sobrepasa las 23:00 en el Día ${dayAnalysis.day}. Por favor reduce la duración o muévela manualmente a otro día.`,
                        day: dayAnalysis.day
                    });
                }
            });
        }
    });

    // 🔥 PRIORIDAD 1: Llenar días vacíos PRIMERO
    if (emptyDays.length > 0) {
        console.log(`🚨 DÍAS VACÍOS DETECTADOS: ${emptyDays.length}`);
        console.log('📋 Días vacíos:', emptyDays.map(d => `Día ${d.day}`).join(', '));

        // Encontrar días con actividades para redistribuir
        const daysWithActivities = daysAnalysis.filter(d => d.activities.length > 0);
        console.log(`📊 Días con actividades: ${daysWithActivities.length}`);
        console.log('📊 Distribución:', daysWithActivities.map(d => `Día ${d.day}: ${d.activities.length} actividades`).join(', '));

        emptyDays.forEach(emptyDay => {
            console.log(`\n🔍 Procesando Día ${emptyDay.day} (vacío)`);

            // Intentar primero con días con 4+ actividades, luego 3+, luego 2+
            let donorDays = daysWithActivities
                .filter(d => d.activities.length >= 4)
                .sort((a, b) => b.activities.length - a.activities.length);

            // Si no hay días con 4+, intentar con 3+
            if (donorDays.length === 0) {
                donorDays = daysWithActivities
                    .filter(d => d.activities.length >= 3)
                    .sort((a, b) => b.activities.length - a.activities.length);
            }

            // Si no hay días con 3+, intentar con 2+
            if (donorDays.length === 0) {
                donorDays = daysWithActivities
                    .filter(d => d.activities.length >= 2)
                    .sort((a, b) => b.activities.length - a.activities.length);
            }

            // 🆕 Si no hay días con 2+, intentar con días con AL MENOS 1 actividad
            if (donorDays.length === 0) {
                donorDays = daysWithActivities
                    .filter(d => d.activities.length >= 1)
                    .sort((a, b) => b.activities.length - a.activities.length);
                console.log(`⚠️ No hay días con 2+ actividades. Intentando con días con 1+ actividades: ${donorDays.length} días encontrados`);
            }

            if (donorDays.length > 0) {
                const donorDay = donorDays[0];
                console.log(`✅ Día donante encontrado: Día ${donorDay.day} con ${donorDay.activities.length} actividades`);

                // Usar selección inteligente para encontrar mejor candidato
                const candidates = findMovableCandidates(donorDay.activities);
                const activityToMove = candidates.length > 0
                    ? candidates[0]
                    : donorDay.activities[Math.floor(donorDay.activities.length / 2)];

                console.log(`📦 Actividad a mover: "${activityToMove.title || activityToMove.name}" (ID: ${activityToMove.id})`);

                suggestions.push({
                    type: 'move',
                    priority: 'high',
                    description: `Llenar Día ${emptyDay.day} vacío moviendo "${activityToMove.title || activityToMove.name}"`,
                    reason: `El Día ${emptyDay.day} está completamente vacío. Moveremos 1 actividad del Día ${donorDay.day} (${donorDay.activities.length} actividades)`,
                    from: { day: donorDay.day, activityId: activityToMove.id },
                    to: { day: emptyDay.day },
                    activity: activityToMove
                });
                console.log(`✅ Sugerencia creada: Mover de Día ${donorDay.day} → Día ${emptyDay.day}`);
            } else {
                console.error(`❌ NO hay días donantes para Día ${emptyDay.day}. Todos los días tienen 0 actividades.`);
                // Si NO hay días donantes, sugerir al usuario agregar actividades manualmente
                suggestions.push({
                    type: 'manual-action',
                    priority: 'high',
                    description: `⚠️ Día ${emptyDay.day} vacío - Agrega actividades manualmente`,
                    reason: `No hay días con suficientes actividades para redistribuir. Por favor agrega actividades al Día ${emptyDay.day} manualmente.`,
                    day: emptyDay.day
                });
            }
        });
    }

    // Sugerencia 2: Balancear días sobrecargados con días ligeros (después de llenar vacíos)
    if (overloadedDays.length > 0 && lightDays.length > 0) {
        overloadedDays.forEach(overloadedDay => {
            const targetDays = lightDays.filter(d => d.day !== overloadedDay.day && d.activities.length < 6);

            if (targetDays.length > 0 && overloadedDay.activities.length > 6) {
                const candidates = findMovableCandidates(overloadedDay.activities);
                const toMove = Math.min(2, Math.floor((overloadedDay.activities.length - 5) / 2));

                candidates.slice(0, toMove).forEach(activity => {
                    const bestTarget = findBestTargetDay(overloadedDay, targetDays, activity);

                    if (bestTarget && bestTarget.activities.length < 6) {
                        suggestions.push({
                            type: 'move',
                            priority: 'medium',
                            description: `Balancear: mover "${activity.title || activity.name}" del Día ${overloadedDay.day} al Día ${bestTarget.day}`,
                            reason: `Equilibrar carga: Día ${overloadedDay.day} (${overloadedDay.activities.length}) → Día ${bestTarget.day} (${bestTarget.activities.length})`,
                            from: { day: overloadedDay.day, activityId: activity.id },
                            to: { day: bestTarget.day },
                            activity: activity
                        });
                    }
                });
            }
        });
    }

    // Sugerencia 3: Optimizar rutas y horarios (CON soporte para hotel base)
    daysAnalysis.forEach(dayAnalysis => {
        if (dayAnalysis.activities.length > 3) {
            const longTransfers = RouteOptimizer.detectLongTransfers(dayAnalysis.activities, 3);

            // Si hay traslados largos O muchas zonas, sugerir reorganización
            if (longTransfers.length > 0 || dayAnalysis.analysis.factors.zonesCount > 2) {
                // 🏨 Detectar hotel para este día
                const hotelCoords = dayAnalysis.hotelCoordinates || null;

                // Generar sugerencia con múltiples opciones de modo
                suggestions.push({
                    type: 'reorder',
                    priority: longTransfers.length > 0 ? 'high' : 'medium',
                    description: `Optimizar ruta del Día ${dayAnalysis.day}${hotelCoords ? ' (desde hotel)' : ''}`,
                    reason: longTransfers.length > 0
                        ? `Hay ${longTransfers.length} traslado(s) largo(s) que se pueden optimizar`
                        : `${dayAnalysis.analysis.factors.zonesCount} zonas diferentes - se puede mejorar`,
                    hotelCoordinates: hotelCoords, // 🔥 Incluir coordenadas del hotel
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

    // Sugerencia 4: Distribuir costo uniformemente - GENERAR SUGERENCIAS CONCRETAS
    const avgCost = daysAnalysis.reduce((sum, d) => sum + d.analysis.factors.totalCost, 0) / daysAnalysis.length;
    const expensiveDays = daysAnalysis.filter(d => d.analysis.factors.totalCost > avgCost * 1.5);
    const cheapDays = daysAnalysis.filter(d => d.analysis.factors.totalCost < avgCost * 0.7);

    if (expensiveDays.length > 0 && cheapDays.length > 0) {
        expensiveDays.forEach(expensiveDay => {
            // Encontrar actividad MÁS COSTOSA del día caro
            const mostExpensiveActivity = expensiveDay.activities
                .filter(a => a.cost > 0)
                .sort((a, b) => (b.cost || 0) - (a.cost || 0))[0];

            if (mostExpensiveActivity && mostExpensiveActivity.cost > avgCost * 0.3) {
                // Encontrar mejor día barato para moverla
                const targetDay = cheapDays
                    .filter(d => d.activities.length < 7) // No sobrecargar
                    .sort((a, b) => a.analysis.factors.totalCost - b.analysis.factors.totalCost)[0];

                if (targetDay) {
                    suggestions.push({
                        type: 'move',
                        priority: 'medium',
                        description: `Balancear costos: mover "${mostExpensiveActivity.title || mostExpensiveActivity.name}" (¥${mostExpensiveActivity.cost}) del Día ${expensiveDay.day} al Día ${targetDay.day}`,
                        reason: `El Día ${expensiveDay.day} cuesta ¥${expensiveDay.analysis.factors.totalCost} (promedio: ¥${Math.round(avgCost)}). El Día ${targetDay.day} solo cuesta ¥${targetDay.analysis.factors.totalCost}`,
                        from: { day: expensiveDay.day, activityId: mostExpensiveActivity.id },
                        to: { day: targetDay.day },
                        activity: mostExpensiveActivity
                    });
                }
            }
        });
    }

    // 🏨 PRIORIDAD ALTA: Detectar actividades cerca de hoteles pero en días incorrectos
    console.log('🏨 DETECTANDO ACTIVIDADES CERCA DE HOTELES EN DÍAS INCORRECTOS...');

    // Agrupar días por hotel
    const hotelGroups = new Map(); // hotel.name -> {days: [], coords: {}}
    daysAnalysis.forEach(dayAnalysis => {
        if (dayAnalysis.hotelCoordinates) {
            const hotelKey = `${dayAnalysis.hotelCoordinates.lat},${dayAnalysis.hotelCoordinates.lng}`;
            if (!hotelGroups.has(hotelKey)) {
                hotelGroups.set(hotelKey, {
                    days: [],
                    coords: dayAnalysis.hotelCoordinates
                });
            }
            hotelGroups.get(hotelKey).days.push(dayAnalysis.day);
        }
    });

    // Para cada día, verificar si tiene actividades cerca de OTROS hoteles
    daysAnalysis.forEach(dayAnalysis => {
        if (!dayAnalysis.activities || dayAnalysis.activities.length === 0) return;

        const currentHotelCoords = dayAnalysis.hotelCoordinates;
        if (!currentHotelCoords) return;

        const currentHotelKey = `${currentHotelCoords.lat},${currentHotelCoords.lng}`;

        // Verificar cada actividad del día
        dayAnalysis.activities.forEach(activity => {
            if (!activity.coordinates) return;

            // Calcular distancia a TODOS los hoteles
            hotelGroups.forEach((hotelInfo, hotelKey) => {
                // Saltar si es el hotel actual
                if (hotelKey === currentHotelKey) return;

                const distanceToOtherHotel = RouteOptimizer.calculateDistance(
                    activity.coordinates,
                    hotelInfo.coords
                );
                const distanceToCurrentHotel = RouteOptimizer.calculateDistance(
                    activity.coordinates,
                    currentHotelCoords
                );

                // Si la actividad está MUCHO más cerca del otro hotel (>3km de diferencia)
                if (distanceToOtherHotel < distanceToCurrentHotel - 3 && distanceToOtherHotel < 2) {
                    // Encontrar el primer día donde te quedas en ese hotel
                    const targetDay = hotelInfo.days[0];

                    console.log(`🏨 DETECTADO: "${activity.title || activity.name}" en Día ${dayAnalysis.day} está a ${distanceToOtherHotel.toFixed(2)}km del hotel de días ${hotelInfo.days.join(',')}, pero está programada en Día ${dayAnalysis.day}`);

                    suggestions.push({
                        type: 'move',
                        priority: 'high',
                        description: `🏨 Mover "${activity.title || activity.name}" del Día ${dayAnalysis.day} al Día ${targetDay}`,
                        reason: `Esta actividad está a solo ${distanceToOtherHotel.toFixed(1)}km del hotel donde te quedas los días ${hotelInfo.days.join(', ')}, pero está programada para el Día ${dayAnalysis.day} (${distanceToCurrentHotel.toFixed(1)}km del hotel de ese día). Será mucho más conveniente visitarla cuando estés cerca.`,
                        from: { day: dayAnalysis.day, activityId: activity.id },
                        to: { day: targetDay },
                        activity: activity
                    });
                }
            });
        });
    });

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
    // Ordenar por carga PRIMERO (más importante) y proximidad SEGUNDO
    const sorted = [...targetDays].sort((a, b) => {
        // Sort by load first (primary)
        const loadDiff = a.analysis.score - b.analysis.score;
        if (loadDiff !== 0) return loadDiff;

        // Then by proximity (secondary)
        const distA = Math.abs(a.day - sourceDay.day);
        const distB = Math.abs(b.day - sourceDay.day);
        return distA - distB;
    });

    return sorted[0];
}

// ⏰ calculateStandardDeviation moved to time-utils.js for consistency across the app

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

    const activityStart = SafeTimeUtils.parseTime(activity.time || activity.startTime);
    const activityDuration = activity.duration || 60;
    const activityEnd = activityStart + activityDuration;

    // Verificar contra todas las actividades del día
    for (const existing of targetDay.activities) {
        if (!existing.time && !existing.startTime) continue;

        const existingStart = SafeTimeUtils.parseTime(existing.time || existing.startTime);
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

// ⏰ Time utilities moved to time-utils.js for consistency across the app

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

        return SafeTimeUtils.parseTime(timeA) - SafeTimeUtils.parseTime(timeB);
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
        console.log(`\n🔄 APLICANDO MOVE: De Día ${suggestion.from.day} → Día ${suggestion.to.day}`);
        console.log(`📦 Actividad: "${suggestion.activity.title || suggestion.activity.name}" (ID: ${suggestion.from.activityId})`);

        // Mover actividad de un día a otro
        const sourceDay = newDays.find(d => d.day === suggestion.from.day);
        const targetDay = newDays.find(d => d.day === suggestion.to.day);

        if (!sourceDay) {
            console.error(`❌ ERROR: No se encontró día origen ${suggestion.from.day}`);
            return newDays;
        }
        if (!targetDay) {
            console.error(`❌ ERROR: No se encontró día destino ${suggestion.to.day}`);
            return newDays;
        }

        console.log(`✅ Días encontrados: Origen (${sourceDay.activities.length} act) → Destino (${targetDay.activities.length} act)`);

        const activityIndex = sourceDay.activities.findIndex(act => {
            // Primary: match by ID if both have valid IDs
            if (act.id && suggestion.from.activityId) {
                return act.id === suggestion.from.activityId;
            }
            // Fallback: match by title (case-insensitive) when IDs are not available
            const actTitle = (act.title || act.name || '').trim().toLowerCase();
            const suggestionTitle = (suggestion.activity.title || suggestion.activity.name || '').trim().toLowerCase();
            // Match by title if titles match (regardless of ID presence)
            if (actTitle && suggestionTitle && actTitle === suggestionTitle) {
                return true;
            }
            return false;
        });

        if (activityIndex === -1) {
            console.error(`❌ ERROR: Actividad NO encontrada en día origen`);
            console.error(`Buscando ID: ${suggestion.from.activityId}`);
            console.error(`Buscando título: ${suggestion.activity.title || suggestion.activity.name}`);
            console.error(`Actividades disponibles:`, sourceDay.activities.map(a => ({
                id: a.id,
                title: a.title || a.name
            })));
            return newDays;
        }

        const activity = sourceDay.activities[activityIndex];
        console.log(`✅ Actividad encontrada en índice ${activityIndex}: "${activity.title || activity.name}"`);
        console.log(`   Horario original: ${activity.time || activity.startTime || 'sin horario'}`);

        // 🧠 ESTRATEGIA INTELIGENTE: Intentar mover actividad
        // 1. Primero intentar con horario original
        // 2. Si hay conflicto, limpiar horario y reintentar
        // 3. Los horarios se recalcularán después

        let canFit = canFitActivity(targetDay, activity);
        let clearedTime = false;

        if (!canFit) {
            console.log(`⚠️ Conflicto de horario detectado - intentando limpiar horario...`);
            // Hacer copia sin horario para verificar
            const activityCopy = { ...activity, time: null, startTime: null };
            canFit = canFitActivity(targetDay, activityCopy);
            clearedTime = true;
        }

        if (canFit) {
            if (clearedTime) {
                console.log(`✅ Actividad CABE después de limpiar horario`);
                // Limpiar horario de la actividad real
                activity.time = null;
                activity.startTime = null;
            } else {
                console.log(`✅ Actividad CABE con horario original`);
            }

            // Mover la actividad
            sourceDay.activities.splice(activityIndex, 1);
            targetDay.activities.push(activity);

            console.log(`✅ MOVIMIENTO EXITOSO: Día ${suggestion.from.day} ahora tiene ${sourceDay.activities.length} act, Día ${suggestion.to.day} ahora tiene ${targetDay.activities.length} act`);

            // SIEMPRE recalcular horarios después de mover actividades
            console.log(`🔄 Recalculando horarios para ambos días...`);
            targetDay.activities = RouteOptimizer.recalculateTimings(
                targetDay.activities,
                { defaultDuration: 60, transportBuffer: 10 }
            );
            sourceDay.activities = RouteOptimizer.recalculateTimings(
                sourceDay.activities,
                { defaultDuration: 60, transportBuffer: 10 }
            );
            console.log(`✅ Horarios recalculados`);
        } else {
            console.error(`❌ FALLO: No se puede mover "${activity.title || activity.name}" - conflicto irresolvible`);
        }
    } else if (suggestion.type === 'reorder') {
        // Reordenar actividades usando el optimizador de rutas
        const day = newDays.find(d => d.day === suggestion.day);
        if (day && day.activities.length > 0) {
            // 🏨 Obtener coordenadas del hotel si existe
            let hotelCoords = null;
            if (suggestion.hotelCoordinates) {
                hotelCoords = suggestion.hotelCoordinates;
                console.log(`🏨 Usando hotel base para optimización:`, hotelCoords);
            }

            // Usar el Route Optimizer para reorganizar
            const optimized = RouteOptimizer.optimizeRoute(day.activities, {
                optimizationMode: optimizationMode,
                shouldRecalculateTimings: recalculateTimings,
                considerOpeningHours: true,
                startPoint: hotelCoords // 🔥 Pasar coordenadas del hotel
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
    } else if (suggestion.type === 'manual-action') {
        // Manual actions can't be applied automatically - these are informational only
        console.log(`ℹ️ Manual action (informational only): ${suggestion.description}`);
        // Return unchanged - this will be properly detected as "no change" by hash comparison
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

        const currentEnd = SafeTimeUtils.parseTime(current.time) + (current.duration || 60);
        const nextStart = SafeTimeUtils.parseTime(next.time);

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
 * Genera un hash simple del itinerario para detectar cambios
 * Mucho más rápido y confiable que JSON.stringify
 */
function generateItineraryHash(days) {
    return days.map(d =>
        `${d.day}:${(d.activities || []).map(a => `${a.id || a.title || a.name}`).join(',')}`
    ).join('|');
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

    // Ordenar sugerencias por prioridad (critical es MÁXIMA prioridad)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedSuggestions = [...suggestions].sort((a, b) =>
        (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
    );

    console.log(`📋 Aplicando ${sortedSuggestions.length} sugerencias ordenadas por prioridad...`);
    const criticalCount = sortedSuggestions.filter(s => s.priority === 'critical').length;
    const highCount = sortedSuggestions.filter(s => s.priority === 'high').length;
    if (criticalCount > 0) console.log(`   🚨 ${criticalCount} sugerencias CRÍTICAS (actividades que no caben)`);
    if (highCount > 0) console.log(`   ⚠️ ${highCount} sugerencias de alta prioridad`);

    // Aplicar cada sugerencia
    for (const suggestion of sortedSuggestions) {
        try {
            // Generar hash ANTES de aplicar
            const beforeHash = generateItineraryHash(currentDays);
            const result = applySuggestion(currentDays, suggestion, options);
            const afterHash = generateItineraryHash(result);

            // Verificar si realmente cambió algo comparando hashes
            if (beforeHash !== afterHash) {
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
    parseTime: SafeTimeUtils.parseTime,
    calculateStandardDeviation: SafeTimeUtils.calculateStandardDeviation
};

// Exponer globalmente para uso desde HTML
if (typeof window !== 'undefined') {
    window.DayBalancer = DayBalancer;
}
