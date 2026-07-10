// js/route-optimizer.js - Optimizador Inteligente de Rutas
// Sistema de optimización de rutas usando algoritmo Nearest Neighbor
// NO requiere APIs pagadas - todo es matemática pura
// Version: 2025-11-07-FIXED - recalculateTimings defined before use

// ⏰ Esperar a que TimeUtils esté disponible
function waitForTimeUtils() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.TimeUtils) {
      resolve();
    } else {
      // Esperar hasta que TimeUtils esté disponible
      const checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && window.TimeUtils) {
          clearInterval(checkInterval);
          console.log('✅ TimeUtils loaded successfully');
          resolve();
        }
      }, 50); // Check every 50ms

      // Timeout después de 5 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        console.error('❌ TimeUtils failed to load after 5 seconds');
        resolve(); // Resolve anyway para no bloquear
      }, 5000);
    }
  });
}

// Safe wrapper para TimeUtils
const SafeTimeUtils = {
  parseTime: (timeStr) => {
    if (window.TimeUtils) {
      return window.TimeUtils.parseTime(timeStr);
    }
    console.error('TimeUtils not available, using fallback parseTime');
    // Fallback básico
    if (!timeStr) return 0;
    const parts = String(timeStr).split(':');
    if (parts.length !== 2) return 0;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  },

  formatTime: (minutes) => {
    if (window.TimeUtils) {
      return window.TimeUtils.formatTime(minutes);
    }
    console.error('TimeUtils not available, using fallback formatTime');
    // Fallback básico
    if (!isFinite(minutes) || isNaN(minutes)) minutes = 9 * 60;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
};

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distancia en kilómetros
 */
function calculateDistance(point1, point2) {
    // 🛡️ Validación de entrada
    if (!point1 || !point2 ||
        typeof point1.lat !== 'number' || typeof point1.lng !== 'number' ||
        typeof point2.lat !== 'number' || typeof point2.lng !== 'number') {
        console.warn('⚠️ Invalid coordinates for distance calculation:', { point1, point2 });
        return 0;
    }

    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lng - point1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// ⏰ Time utilities (parseTime, formatTime) moved to time-utils.js for consistency across the app

/**
 * Obtiene el tiempo de finalización de una actividad en minutos desde medianoche
 */
function getActivityEndTime(activity) {
    const startTime = SafeTimeUtils.parseTime(activity.time);
    const duration = activity.duration || 60;
    return startTime + duration;
}

/**
 * Estima el tiempo de traslado basado en distancia y modo de transporte
 * @param {number} distanceKm - Distancia en kilómetros
 * @returns {Object} {minutes, mode, cost}
 */
function estimateTransportTime(distanceKm) {
    // Reglas para Japón
    if (distanceKm < 0.5) {
        // Menos de 500m - Caminar
        return {
            minutes: Math.ceil(distanceKm * 12), // 12 min por km caminando
            mode: '🚶 Caminar',
            cost: 0
        };
    } else if (distanceKm < 2) {
        // 500m - 2km - Caminar o tren corto
        return {
            minutes: Math.ceil(distanceKm * 10) + 5, // 10 min/km + 5 min espera
            mode: '🚶/🚇 Caminar/Tren',
            cost: 170 // Tarifa mínima JR
        };
    } else if (distanceKm < 10) {
        // 2-10km - Tren local
        return {
            minutes: Math.ceil(distanceKm * 3) + 10, // 3 min/km + 10 min espera/transbordo
            mode: '🚇 Tren',
            cost: Math.min(200 + Math.ceil(distanceKm * 20), 500)
        };
    } else {
        // >10km - Tren expreso
        return {
            minutes: Math.ceil(distanceKm * 2) + 15, // 2 min/km + 15 min espera
            mode: '🚄 Tren Expreso',
            cost: Math.min(300 + Math.ceil(distanceKm * 25), 1500)
        };
    }
}

/**
 * Recalcula los horarios de actividades después de reorganizar
 * Mantiene el primer horario y recalcula el resto considerando duración + transporte
 * @param {Array} activities - Actividades reorganizadas
 * @param {Object} options - {startTime: 'HH:MM', defaultDuration: 60}
 * @returns {Array} Actividades con horarios recalculados
 */
function recalculateTimings(activities, options = {}) {
    const {
        startTime = null,
        defaultDuration = 60,
        transportBuffer = 10 // Buffer adicional entre actividades
    } = options;

    if (!activities || activities.length === 0) return activities;

    const result = [...activities];

    // Determinar hora de inicio
    let currentTime;
    if (startTime) {
        currentTime = SafeTimeUtils.parseTime(startTime);
    } else if (result[0].time) {
        currentTime = SafeTimeUtils.parseTime(result[0].time);
    } else {
        currentTime = 9 * 60; // Default: 09:00
    }

    // 🛡️ LÍMITE MÁXIMO: 23:00 (1380 minutos) para dejar margen
    const MAX_TIME = 23 * 60; // 23:00
    let activitiesOverLimit = 0;

    // Recalcular cada actividad
    for (let i = 0; i < result.length; i++) {
        const activity = result[i];

        // 🛡️ VERIFICAR si ya sobrepasamos el límite del día
        if (currentTime >= MAX_TIME) {
            // Marcar actividad como "no cabe en el día"
            activity.time = '23:59';
            activity.overLimit = true;
            activitiesOverLimit++;
            console.warn(`⚠️ Actividad "${activity.title || activity.name}" no cabe en el día (${activitiesOverLimit})`);
            continue;
        }

        // Asignar nuevo horario
        activity.time = SafeTimeUtils.formatTime(currentTime);
        activity.overLimit = false;

        // Calcular cuándo termina esta actividad
        const duration = activity.duration || defaultDuration;
        currentTime += duration;

        // Si hay una siguiente actividad, calcular tiempo de transporte
        if (i < result.length - 1) {
            const next = result[i + 1];

            if (activity.coordinates && next.coordinates) {
                const distance = calculateDistance(activity.coordinates, next.coordinates);
                const transport = estimateTransportTime(distance);

                // Agregar tiempo de transporte + buffer
                currentTime += transport.minutes + transportBuffer;

                // Guardar info de transporte para UI
                activity.transportToNext = {
                    distance: Math.round(distance * 10) / 10,
                    time: transport.minutes,
                    mode: transport.mode,
                    cost: transport.cost
                };
            } else {
                // Sin coordenadas, solo agregar buffer
                currentTime += transportBuffer;
            }
        }
    }

    // 🚨 Si hay actividades que no caben, loguear advertencia
    if (activitiesOverLimit > 0) {
        console.warn(`⚠️ ${activitiesOverLimit} actividades NO caben en el día. Considera moverlas a otro día o reducir duraciones.`);
    }

    return result;
}

/**
 * Encuentra la actividad más cercana a un punto
 */
function findNearestActivity(point, activities) {
    // 🛡️ Robustness: handle empty or invalid input
    if (!activities || activities.length === 0 || !point) {
        console.warn('⚠️ findNearestActivity recibió datos inválidos', { point, activities });
        return null;
    }

    let nearest = null;
    let minDistance = Infinity;

    console.log('--- DEBUG: Inside findNearestActivity ---');
    for (const activity of activities) {
        // 🛡️ Asegurarse de que la actividad tenga coordenadas válidas
        if (activity.coordinates && typeof activity.coordinates.lat === 'number' && typeof activity.coordinates.lng === 'number') {
            const distance = calculateDistance(point, activity.coordinates);
            console.log(`  - Checking: ${activity.title || activity.name}, Distance: ${distance.toFixed(2)}km`);
            if (distance < minDistance) {
                console.log(`    New nearest found: ${activity.title || activity.name} (was ${nearest ? (nearest.title || nearest.name) : 'null'})`);
                minDistance = distance;
                nearest = activity;
            }
        } else {
            console.warn(`️⚠️ Actividad sin coordenadas válidas en findNearestActivity: "${activity.title || activity.name}"`);
        }
    }
    console.log(`--- DEBUG: Exiting findNearestActivity, Nearest: ${nearest ? (nearest.title || nearest.name) : 'null'} ---`);

    return nearest;
}

/**
 * Ordena actividades solo por tiempo
 */
function sortByTime(activities) {
    const withTime = activities.filter(a => a.time).sort((a, b) =>
        SafeTimeUtils.parseTime(a.time) - SafeTimeUtils.parseTime(b.time)
    );
    const withoutTime = activities.filter(a => !a.time);

    return [...withTime, ...withoutTime];
}

/**
 * Optimiza solo por geografía (ignora horarios)
 */
function optimizeByGeography(activities, options) {
    const { startPoint } = options;
    const unvisited = [...activities];
    const optimized = [];

    let current = startPoint
        ? findNearestActivity(startPoint, unvisited)
        : unvisited[0];

    unvisited.splice(unvisited.indexOf(current), 1);
    optimized.push(current);

    while (unvisited.length > 0) {
        const nearest = findNearestActivity(current.coordinates, unvisited);
        unvisited.splice(unvisited.indexOf(nearest), 1);
        optimized.push(nearest);
        current = nearest;
    }

    // 🔧 Nearest-neighbor es voraz (mira solo el paso siguiente) y puede dejar una
    // parada "aislada" que solo se visita al final con un salto largo innecesario -
    // causa real confirmada de saltos como "Camino del Filósofo → Bosque de Bambú
    // de Arashiyama" el mismo día, pese a que la selección de actividades ya las
    // había agrupado bien. 2-opt es la corrección estándar para este defecto
    // conocido: solo aplica intercambios que ACORTAN la distancia total de la
    // ruta, así que nunca puede empeorarla.
    return twoOptImprove(optimized);
}

/**
 * 🔧 2-OPT: mejora una ruta ya construida revisando pares de tramos y, si
 * invertir el segmento entre ellos acorta la distancia total, aplica el
 * cambio. No toca la parada inicial (índice 0) - el llamador puede haberla
 * fijado a propósito (ej. la más cercana al hotel).
 * @param {Array} route - Ruta ya ordenada (ej. por nearest-neighbor)
 * @returns {Array} Ruta igual o más corta que la de entrada
 */
function twoOptImprove(route) {
    if (route.length < 4) return route;
    if (!route.every(a => a.coordinates?.lat && a.coordinates?.lng)) return route;

    let result = [...route];
    let improved = true;
    let iterations = 0;
    const maxIterations = 60; // rutas de un día son cortas (<20 paradas); converge mucho antes, esto es solo un límite de seguridad

    while (improved && iterations < maxIterations) {
        improved = false;
        iterations++;
        for (let i = 0; i < result.length - 3; i++) {
            for (let j = i + 2; j < result.length - 1; j++) {
                const distBefore =
                    calculateDistance(result[i].coordinates, result[i + 1].coordinates) +
                    calculateDistance(result[j].coordinates, result[j + 1].coordinates);
                const distAfter =
                    calculateDistance(result[i].coordinates, result[j].coordinates) +
                    calculateDistance(result[i + 1].coordinates, result[j + 1].coordinates);

                if (distAfter < distBefore - 0.01) {
                    const segment = result.slice(i + 1, j + 1).reverse();
                    result = [...result.slice(0, i + 1), ...segment, ...result.slice(j + 1)];
                    improved = true;
                }
            }
        }
    }
    return result;
}

/**
 * Inserta actividades flexibles (sin horario) en una ruta existente de la forma más eficiente.
 * @param {Array} route - La ruta de actividades con horarios.
 * @param {Array} flexibleActivities - Las actividades sin horarios a insertar.
 * @returns {Array} La nueva ruta con las actividades insertadas.
 */
function insertFlexibleActivities(route, flexibleActivities) {
    const activitiesToInsert = flexibleActivities.filter(a => a.coordinates && a.coordinates.lat);
    const activitiesWithoutCoords = flexibleActivities.filter(a => !a.coordinates || !a.coordinates.lat);

    if (activitiesToInsert.length === 0) {
        return [...route, ...activitiesWithoutCoords];
    }

    let currentRoute;
    if (route.length === 0) {
        // If route is empty, just optimize the flexible ones geographically
        currentRoute = optimizeByGeography(activitiesToInsert, {});
    } else {
        // Start with the existing route and insert into it.
        currentRoute = [...route];
        activitiesToInsert.forEach(activityToInsert => {
            let bestRoute = [];
            let minTotalLength = Infinity;

            for (let i = 0; i <= currentRoute.length; i++) {
                const tempRoute = [...currentRoute];
                tempRoute.splice(i, 0, activityToInsert);
                
                let currentLength = 0;
                for (let j = 0; j < tempRoute.length - 1; j++) {
                    currentLength += calculateDistance(tempRoute[j].coordinates, tempRoute[j+1].coordinates);
                }

                if (currentLength < minTotalLength) {
                    minTotalLength = currentLength;
                    bestRoute = tempRoute;
                }
            }
            currentRoute = bestRoute;
        });
    }
    
    return [...currentRoute, ...activitiesWithoutCoords];
}

/**
 * Optimiza de forma balanceada (geografía + tiempo)
 */
function optimizeBalanced(activities, options) {
    const { startPoint } = options;

    // 🏨 PRIORIDAD ABSOLUTA AL PUNTO DE PARTIDA (HOTEL)
    // La primera actividad SIEMPRE debe ser la más cercana al hotel
    // NO importa si hay "grupos" más eficientes - la lógica humana es empezar por lo más cercano
    if (startPoint) {
        console.log('🏨 HOTEL DETECTED - PRIORIDAD ABSOLUTA al punto de partida');
        console.log(`📍 Analizando ${activities.length} actividades para encontrar la más cercana al hotel`);
        console.log(`🏨 Hotel: lat ${startPoint.lat}, lng ${startPoint.lng}`);

        // Encontrar la actividad más cercana al hotel
        const nearestToHotel = findNearestActivity(startPoint, activities);

        if (nearestToHotel) {
            const distanceToHotel = calculateDistance(startPoint, nearestToHotel.coordinates);
            console.log(`✅ PRIMERA ACTIVIDAD (más cercana al hotel): "${nearestToHotel.title || nearestToHotel.name}"`);
            console.log(`📏 Distancia al hotel: ${distanceToHotel.toFixed(2)} km`);

            // 🚨 VALIDACIÓN: Asegurar que realmente es la más cercana
            const allDistances = activities.map(a => ({
                activity: a,
                distance: calculateDistance(startPoint, a.coordinates)
            })).sort((a, b) => a.distance - b.distance);

            if (allDistances[0].activity !== nearestToHotel) {
                console.error('❌ ERROR: findNearestActivity no devolvió la actividad más cercana!');
                console.error('   Se esperaba:', allDistances[0].activity.title || allDistances[0].activity.name);
                console.error('   Se obtuvo:', nearestToHotel.title || nearestToHotel.name);
            }

            // Remover esa actividad de la lista
            const remainingActivities = activities.filter(a => a !== nearestToHotel);

            // Optimizar el resto normalmente
            const optimized = [nearestToHotel];

            if (remainingActivities.length > 0) {
                console.log(`🔄 Optimizando las ${remainingActivities.length} actividades restantes desde "${nearestToHotel.title || nearestToHotel.name}"`);
                // Ahora optimizar desde la primera actividad (la más cercana al hotel)
                const restOptimized = optimizeByGeography(remainingActivities, {
                    ...options,
                    startPoint: nearestToHotel.coordinates // Empezar desde la primera actividad
                });
                optimized.push(...restOptimized);
            }

            console.log('✅ Orden final de actividades:', optimized.map((a, i) => `${i + 1}. ${a.title || a.name}`));

            // 🚨 VALIDACIÓN FINAL: Verificar que la primera actividad sigue siendo la más cercana
            const finalFirst = optimized[0];
            const finalFirstDistance = calculateDistance(startPoint, finalFirst.coordinates);
            console.log(`🎯 VALIDACIÓN FINAL: Primera actividad "${finalFirst.title || finalFirst.name}" a ${finalFirstDistance.toFixed(2)}km del hotel`);

            return optimized;
        } else {
            console.warn('⚠️ No se encontró actividad más cercana al hotel (esto no debería pasar)');
        }
    } else {
        console.log('⚠️ NO hay hotel (startPoint) - usando optimización sin hotel');
    }

    // Si no hay startPoint, usar la lógica original
    // Primero ordenar por tiempo
    const sortedByTime = sortByTime(activities.filter(a => a.time));
    const withoutTime = activities.filter(a => !a.time);

    // Agrupar actividades cercanas temporalmente (ventanas de 3 horas)
    const timeWindows = [];
    let currentWindow = [];

    sortedByTime.forEach((activity, index) => {
        if (currentWindow.length === 0) {
            currentWindow.push(activity);
        } else {
            const lastTime = SafeTimeUtils.parseTime(currentWindow[currentWindow.length - 1].time);
            const currentActivityTime = SafeTimeUtils.parseTime(activity.time);

            // Si está dentro de la ventana de 3 horas, agregar
            if (currentActivityTime - lastTime <= 180) {
                currentWindow.push(activity);
            } else {
                // Nueva ventana
                timeWindows.push(currentWindow);
                currentWindow = [activity];
            }
        }
    });

    if (currentWindow.length > 0) {
        timeWindows.push(currentWindow);
    }

    // Optimizar cada ventana geográficamente
    const optimized = [];
    timeWindows.forEach(window => {
        if (window.length <= 1) {
            optimized.push(...window);
        } else {
            const geoOptimized = optimizeByGeography(window, options);
            optimized.push(...geoOptimized);
        }
    });

    return [...optimized, ...withoutTime];
}

/**
 * Algoritmo Nearest Neighbor para optimizar ruta
 * Complejidad: O(n²) - perfecto para n < 20 actividades por día
 * @param {Array} activities - Array de actividades con coordenadas
 * @param {Object} options - Opciones de optimización
 * @returns {Object} {optimizedActivities, savings, stats}
 */
function optimizeRoute(activities, options = {}) {
    const {
        considerOpeningHours = true,
        startPoint = null, // Puede ser coordenadas del hotel
        endPoint = null,
        optimizationMode = 'balanced', // 'geography', 'time', 'balanced'
        shouldRecalculateTimings = true // Recalcular horarios después de optimizar
    } = options;

    if (!activities || activities.length < 2) {
        return {
            optimizedActivities: activities,
            savings: { time: 0, cost: 0, distance: 0 },
            stats: { totalDistance: 0, totalTime: 0, totalCost: 0 },
            wasOptimized: false
        };
    }

    // Filtrar actividades que tienen coordenadas
    const activitiesWithCoords = activities.filter(act =>
        act.coordinates &&
        act.coordinates.lat &&
        act.coordinates.lng
    );

    if (activitiesWithCoords.length < 2) {
        console.warn('⚠️ Not enough activities with coordinates to optimize');
        return {
            optimizedActivities: activities,
            savings: { time: 0, cost: 0, distance: 0 },
            stats: { totalDistance: 0, totalTime: 0, totalCost: 0 },
            wasOptimized: false
        };
    }

    // Calcular ruta original
    const originalStats = calculateRouteStats(activitiesWithCoords);

    // Optimizar según el modo seleccionado
    let optimized;
    if (optimizationMode === 'time') {
        // Solo ordenar por tiempo
        optimized = sortByTime(activitiesWithCoords);
    } else if (optimizationMode === 'geography') {
        // Solo optimizar geográficamente
        optimized = optimizeByGeography(activitiesWithCoords, { startPoint });
    } else {
        // Modo balanceado: considerar tiempo Y geografía
        optimized = optimizeBalanced(activitiesWithCoords, { startPoint });
    }

    // Recalcular horarios si está habilitado
    if (shouldRecalculateTimings && optimized.length > 0) {
        // 🌅 Determinar hora de inicio INTELIGENTE
        // Opción 1: Si las actividades ya tienen horarios, usar el MÁS TEMPRANO
        // Opción 2: Si no, usar default (09:00)

        let startTime = '09:00'; // Default

        // Buscar el horario más temprano entre las actividades
        const activitiesWithTime = optimized.filter(a => a.time);
        if (activitiesWithTime.length > 0) {
            const earliestTime = activitiesWithTime
                .map(a => SafeTimeUtils.parseTime(a.time))
                .sort((a, b) => a - b)[0];

            startTime = SafeTimeUtils.formatTime(earliestTime);
            console.log(`⏰ Usando hora más temprana de las actividades existentes: ${startTime}`);
        } else {
            console.log(`⏰ No hay horarios previos, usando default: ${startTime}`);
        }

        console.log(`🌅 Recalculando horarios desde las ${startTime}`);

        optimized = recalculateTimings(optimized, {
            startTime: startTime,
            defaultDuration: 60,
            transportBuffer: 10
        });
    }

    // 🚨 Contar actividades que sobrepasan el límite del día
    const activitiesOverLimit = optimized.filter(act => act.overLimit === true);

    // Calcular estadísticas de ruta optimizada
    const optimizedStats = calculateRouteStats(optimized);

    // Calcular ahorros
    const savings = {
        time: originalStats.totalTime - optimizedStats.totalTime,
        cost: originalStats.totalCost - optimizedStats.totalCost,
        distance: originalStats.totalDistance - optimizedStats.totalDistance,
        percentage: Math.round(
            ((originalStats.totalTime - optimizedStats.totalTime) / originalStats.totalTime) * 100
        )
    };

    // Mantener actividades sin coordenadas en su orden original
    const activitiesWithoutCoords = activities.filter(act =>
        !act.coordinates || !act.coordinates.lat || !act.coordinates.lng
    );

    console.log('✅ Route optimized:', {
        original: originalStats,
        optimized: optimizedStats,
        savings,
        activitiesOverLimit: activitiesOverLimit.length
    });

    return {
        optimizedActivities: [...optimized, ...activitiesWithoutCoords],
        savings,
        stats: optimizedStats,
        originalStats,
        wasOptimized: true,
        activitiesOverLimit: activitiesOverLimit.length,  // 🚨 Número de actividades que no caben
        overLimitActivities: activitiesOverLimit  // 🚨 Lista de actividades que no caben
    };
}

/**
 * Verifica si es factible visitar una actividad considerando horarios
 */
function isVisitFeasible(current, next, visitedSoFar) {
    // Si no tienen horarios asignados, siempre es factible
    if (!current.time && !next.time) return true;
    if (!next.time) return true;

    // Obtener tiempo actual después de completar la actividad actual
    const currentEndTime = getActivityEndTime(current);
    const nextStartTime = SafeTimeUtils.parseTime(next.time);

    // Calcular tiempo de transporte
    if (current.coordinates && next.coordinates) {
        const distance = calculateDistance(current.coordinates, next.coordinates);
        const transport = estimateTransportTime(distance);
        const arrivalTime = currentEndTime + transport.minutes;

        // Verificar si llegamos a tiempo (con 15 min de margen)
        return arrivalTime <= nextStartTime + 15;
    }

    // Si no hay coordenadas, solo verificar orden temporal
    return currentEndTime <= nextStartTime;
}

/**
 * Encuentra una actividad alternativa si la más cercana no es factible
 */
function findAlternativeActivity(point, activities, visitedSoFar) {
    // Buscar la segunda o tercera más cercana
    const distances = activities.map((act, index) => ({
        index,
        distance: calculateDistance(point, act.coordinates)
    }));

    distances.sort((a, b) => a.distance - b.distance);

    // Retornar la segunda más cercana si existe
    return distances.length > 1 ? distances[1].index : -1;
}

/**
 * Calcula estadísticas de una ruta
 */
function calculateRouteStats(activities) {
    let totalDistance = 0;
    let totalTime = 0;
    let totalCost = 0;
    const segments = [];

    for (let i = 0; i < activities.length - 1; i++) {
        const from = activities[i];
        const to = activities[i + 1];

        const distance = calculateDistance(from.coordinates, to.coordinates);
        const transport = estimateTransportTime(distance);

        totalDistance += distance;
        totalTime += transport.minutes;
        totalCost += transport.cost;

        segments.push({
            from: from.title || from.name,
            to: to.title || to.name,
            distance,
            time: transport.minutes,
            mode: transport.mode,
            cost: transport.cost
        });
    }

    return {
        totalDistance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal
        totalTime: Math.round(totalTime),
        totalCost: Math.round(totalCost),
        segments
    };
}

/**
 * Agrupa actividades por proximidad geográfica (clustering)
 * Útil para visualizar zonas del día
 */
function clusterActivities(activities, maxDistanceKm = 2) {
    if (!activities || activities.length === 0) return [];

    const activitiesWithCoords = activities.filter(act =>
        act.coordinates && act.coordinates.lat && act.coordinates.lng
    );

    if (activitiesWithCoords.length === 0) return [];

    const clusters = [];
    const assigned = new Set();

    for (let i = 0; i < activitiesWithCoords.length; i++) {
        if (assigned.has(i)) continue;

        const cluster = {
            center: activitiesWithCoords[i].coordinates,
            activities: [activitiesWithCoords[i]],
            name: activitiesWithCoords[i].zone || 'Zona desconocida'
        };

        assigned.add(i);

        // Buscar actividades cercanas
        for (let j = i + 1; j < activitiesWithCoords.length; j++) {
            if (assigned.has(j)) continue;

            const distance = calculateDistance(
                cluster.center,
                activitiesWithCoords[j].coordinates
            );

            if (distance <= maxDistanceKm) {
                cluster.activities.push(activitiesWithCoords[j]);
                assigned.add(j);
            }
        }

        clusters.push(cluster);
    }

    return clusters;
}

/**
 * Detecta si dos actividades están muy lejos (alerta de traslado largo)
 */
function detectLongTransfers(activities, thresholdKm = 5) {
    const warnings = [];

    for (let i = 0; i < activities.length - 1; i++) {
        const from = activities[i];
        const to = activities[i + 1];

        if (!from.coordinates || !to.coordinates) continue;

        const distance = calculateDistance(from.coordinates, to.coordinates);

        if (distance > thresholdKm) {
            const transport = estimateTransportTime(distance);
            warnings.push({
                from: from.title || from.name,
                to: to.title || to.name,
                distance: Math.round(distance * 10) / 10,
                time: transport.minutes,
                mode: transport.mode,
                cost: transport.cost,
                warning: `⚠️ Traslado largo: ${transport.minutes} min`
            });
        }
    }

    return warnings;
}

/**
 * Genera sugerencia de orden óptimo en texto
 */
function generateOptimizationSuggestion(originalActivities, optimizedResult) {
    if (!optimizedResult.wasOptimized) {
        return 'No se pudo optimizar la ruta (faltan coordenadas)';
    }

    const { savings, stats } = optimizedResult;

    if (savings.time < 5) {
        return '✅ La ruta actual ya está bien optimizada';
    }

    const suggestions = [];

    suggestions.push(`🎯 Reorganizando las actividades ahorrarías:`);
    suggestions.push(`  ⏱️ ${savings.time} minutos de traslado`);
    suggestions.push(`  💴 ¥${savings.cost} en transporte`);
    suggestions.push(`  🚶 ${savings.distance.toFixed(1)} km de distancia`);
    suggestions.push(``);
    suggestions.push(`📊 Ruta optimizada:`);
    suggestions.push(`  Total traslados: ${stats.totalTime} min`);
    suggestions.push(`  Costo transporte: ¥${stats.totalCost}`);
    suggestions.push(`  Distancia: ${stats.totalDistance} km`);

    return suggestions.join('\n');
}

// Exportar funciones
export const RouteOptimizer = {
    optimizeRoute,
    calculateDistance,
    estimateTransportTime,
    calculateRouteStats,
    clusterActivities,
    detectLongTransfers,
    generateOptimizationSuggestion,
    recalculateTimings,
    parseTime: SafeTimeUtils.parseTime,
    formatTime: SafeTimeUtils.formatTime,
    sortByTime,
    optimizeByGeography,
    optimizeBalanced
};

// También exportar como objeto global para acceso desde HTML
if (typeof window !== 'undefined') {
    window.RouteOptimizer = RouteOptimizer;
}
