// js/activity-day-assignment.js - Sistema Inteligente de Asignación de Actividades
// Asigna actividades a días basándose en proximidad al hotel, balance y reglas especiales

import { HotelBaseSystem } from '../../api/hotel-base-system.js';
import { RouteOptimizer } from '../../map/route-optimizer-v2.js';

/**
 * Sistema de Asignación Inteligente de Actividades
 * Resuelve el problema de actividades mal ubicadas y días vacíos
 */
export const ActivityDayAssignment = {
  /**
   * Asigna todas las actividades del itinerario a los días óptimos
   * basándose en la ubicación de los hoteles
   * @param {Object} itinerary - Itinerario completo con days[] y hotels{}
   * @returns {Promise<Object>} Itinerario con actividades reasignadas
   */
  async assignActivitiesOptimally(itinerary) {
    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
      console.warn('⚠️ No hay días en el itinerario');
      return itinerary;
    }

    console.log('🎯 INICIANDO ASIGNACIÓN INTELIGENTE DE ACTIVIDADES');

    // 1. Recopilar TODAS las actividades de todos los días
    const allActivities = [];
    itinerary.days.forEach(day => {
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach(activity => {
          allActivities.push({
            ...activity,
            originalDay: day.day // Guardar día original para referencia
          });
        });
      }
    });

    console.log(`📦 Total actividades a reasignar: ${allActivities.length}`);

    if (allActivities.length === 0) {
      console.warn('⚠️ No hay actividades para asignar');
      return itinerary;
    }

    // 🏙️ RESOLVER Y GUARDAR la ciudad de cada día ANTES de vaciarlo. Si no lo hacemos
    // aquí, el paso 2 deja cada día sin actividades, y cualquier intento posterior de
    // "¿qué ciudad es este día?" (via detectCityForDay, que analiza day.activities) ya
    // no tiene nada que analizar - quedan todos indistinguibles entre sí. Esto también
    // sirve para "reparar" permanentemente itinerarios viejos que nunca guardaron
    // day.city, dejándolo escrito para futuras operaciones.
    itinerary.days.forEach(day => {
      if (!day.city) {
        day.city = HotelBaseSystem.detectCityForDay(day);
      }
    });

    // 2. Vaciar todos los días (vamos a reasignar desde cero)
    itinerary.days.forEach(day => {
      day.activities = [];
    });

    // 3. Crear mapa de hoteles por día
    const hotelsByDay = this.buildHotelMapByDay(itinerary);
    console.log('🏨 Hoteles detectados:', Object.keys(hotelsByDay).length, 'días');

    // 4. Asignar cada actividad al día óptimo
    const assignmentResults = this.assignActivitiesToOptimalDays(
      allActivities,
      itinerary.days,
      hotelsByDay
    );

    console.log('✅ Asignación completada:', assignmentResults);

    // 5. Aplicar reglas especiales (día 1 jetlag, último día ligero)
    this.applySpecialDayRules(itinerary);

    // 6. Balance final para evitar días vacíos
    this.balanceEmptyDays(itinerary);

    // 7. AUTO-COMPLETAR actividades si faltan
    const autoResult = await this.autoCompleteActivities(itinerary);
    if (autoResult.added > 0) {
      console.log(`🤖 ${autoResult.added} actividades agregadas automáticamente`);
    }

    // 8. Optimizar rutas de cada día desde el hotel
    this.optimizeAllDaysFromHotel(itinerary, hotelsByDay);

    console.log('🎉 ASIGNACIÓN INTELIGENTE COMPLETADA');
    return itinerary;
  },

  /**
   * Construye un mapa de hoteles por día
   * @param {Object} itinerary
   * @returns {Object} {dayNumber: hotelCoordinates}
   */
  buildHotelMapByDay(itinerary) {
    const hotelsByDay = {};

    itinerary.days.forEach(day => {
      const city = HotelBaseSystem.detectCityForDay(day);
      const hotel = HotelBaseSystem.getHotelForCity(itinerary, city, day.day);

      if (hotel && hotel.coordinates) {
        hotelsByDay[day.day] = {
          city: city,
          coordinates: hotel.coordinates,
          name: hotel.name
        };
        console.log(`🏨 Día ${day.day}: ${hotel.name} (${city})`);
      } else {
        console.warn(`⚠️ Día ${day.day}: Sin hotel configurado (${city})`);
      }
    });

    return hotelsByDay;
  },

  /**
   * Asigna cada actividad al día cuyo hotel esté más cerca
   * PRIORIDAD CRÍTICA: Actividades MUY cercanas al hotel (< 1km) van SIEMPRE a ese día
   * @param {Array} activities - Lista de actividades
   * @param {Array} days - Días del itinerario
   * @param {Object} hotelsByDay - Mapa de hoteles
   * @returns {Object} Estadísticas de asignación
   */
  assignActivitiesToOptimalDays(activities, days, hotelsByDay) {
    let assigned = 0;
    let unassigned = 0;

    // 🔥 PASO 1: Asignar actividades MUY CERCANAS al hotel primero (< 1km)
    console.log('🎯 PRIORIDAD: Asignando actividades MUY cercanas al hotel...');
    const veryCloseActivities = [];
    const remainingActivities = [];

    activities.forEach(activity => {
      if (!activity.coordinates || !activity.coordinates.lat) {
        remainingActivities.push(activity);
        return;
      }

      let closestDistance = Infinity;
      let closestDay = null;

      // 🏙️ Resolver la ciudad real de la actividad, incluso si el itinerario es viejo y
      // nunca guardó cityName/city (usa coordenadas como respaldo - ver hotel-base-system.js)
      const activityCity = HotelBaseSystem.resolveActivityCity(activity);

      // 🏙️ RESTRINGIR a hoteles de la MISMA CIUDAD que la actividad. Sin este filtro,
      // una actividad de Kyoto puede terminar "asignada" a un día de Tokyo solo porque
      // ese hotel resultó geográficamente más cercano en el cálculo bruto (ej. si faltan
      // hoteles configurados para algunos días). Nunca mezclar ciudades entre sí.
      Object.entries(hotelsByDay).forEach(([dayNum, hotel]) => {
        if (!HotelBaseSystem.isCityCompatible(hotel.city, activityCity)) {
          return; // ciudad distinta, no es candidato
        }

        const distance = RouteOptimizer.calculateDistance(
          activity.coordinates,
          hotel.coordinates
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestDay = parseInt(dayNum);
        }
      });

      // Si está MUY cerca (< 1km), asignar inmediatamente
      if (closestDistance < 1.0 && closestDay !== null) {
        veryCloseActivities.push({
          activity,
          day: closestDay,
          distance: closestDistance
        });
        console.log(`🎯 "${activity.title || activity.name}" MUY CERCA del hotel día ${closestDay} (${closestDistance.toFixed(2)}km) - ASIGNADA`);
      } else {
        remainingActivities.push(activity);
      }
    });

    // Asignar actividades muy cercanas
    veryCloseActivities.forEach(({ activity, day: dayNum }) => {
      const day = days.find(d => d.day === dayNum);
      if (day) {
        day.activities.push(activity);
        assigned++;
      }
    });

    // 🔥 PASO 2: Asignar resto de actividades por proximidad (misma ciudad SIEMPRE)
    console.log('📍 Asignando actividades restantes por proximidad...');
    remainingActivities.forEach(activity => {
      if (!activity.coordinates || !activity.coordinates.lat) {
        const targetDay = this.findFallbackDayForActivity(activity, days);
        targetDay.activities.push(activity);
        assigned++;
        return;
      }

      let bestDay = null;
      let minDistance = Infinity;
      const activityCity = HotelBaseSystem.resolveActivityCity(activity);

      // 🏙️ Igual que en PASO 1: nunca considerar hoteles de otra ciudad
      Object.entries(hotelsByDay).forEach(([dayNum, hotel]) => {
        if (!HotelBaseSystem.isCityCompatible(hotel.city, activityCity)) {
          return;
        }

        const distance = RouteOptimizer.calculateDistance(
          activity.coordinates,
          hotel.coordinates
        );

        if (distance < minDistance) {
          minDistance = distance;
          bestDay = parseInt(dayNum);
        }
      });

      if (bestDay !== null) {
        const day = days.find(d => d.day === bestDay);
        if (day) {
          day.activities.push(activity);
          assigned++;
          console.log(`✅ "${activity.title || activity.name}" → Día ${bestDay} (${minDistance.toFixed(2)}km)`);
        } else {
          unassigned++;
        }
      } else {
        // 🏙️ No hay hotel conocido en la ciudad de esta actividad (ej. hoteles sin
        // configurar). En vez de mandarla al Día 1 (que puede ser de OTRA ciudad),
        // buscar el día más apropiado que sí coincida en ciudad.
        const fallbackDay = this.findFallbackDayForActivity(activity, days);
        fallbackDay.activities.push(activity);
        unassigned++;
        console.log(`⚠️ "${activity.title || activity.name}" sin hotel en su ciudad (${activityCity || 'desconocida'}) → Día ${fallbackDay.day} (fallback)`);
      }
    });

    return { assigned, unassigned };
  },

  /**
   * Encuentra el mejor día "de respaldo" para una actividad cuando no se pudo asignar
   * por proximidad de hotel. SIEMPRE prioriza un día de la MISMA CIUDAD que la actividad
   * (aunque no tenga hotel configurado) antes que caer en el día 1 por defecto, que
   * podría ser de otra ciudad por completo.
   * @param {Object} activity
   * @param {Array} days
   * @returns {Object} día del itinerario
   */
  findFallbackDayForActivity(activity, days) {
    const activityCity = HotelBaseSystem.resolveActivityCity(activity);
    if (activityCity) {
      const sameCityDays = days.filter(d => {
        const dayCity = d.city || HotelBaseSystem.detectCityForDay(d);
        return dayCity && HotelBaseSystem.isCityCompatible(dayCity, activityCity);
      });
      if (sameCityDays.length > 0) {
        // Preferir su día original si sigue siendo de la misma ciudad
        const original = sameCityDays.find(d => d.day === activity.originalDay);
        return original || sameCityDays[0];
      }
    }
    // Sin dato de ciudad (o ningún día coincide): comportamiento anterior como último recurso
    return days.find(d => d.day === activity.originalDay) || days[0];
  },

  /**
   * Encuentra el día intermedio (no primero/último) menos cargado que sea de la MISMA
   * CIUDAD que la actividad. A propósito devuelve null (en vez de caer a cualquier ciudad)
   * cuando la actividad tiene ciudad conocida pero ningún día intermedio la comparte -
   * ej. una ciudad con un solo día en todo el viaje, que además resultó ser el último día.
   * En ese caso es preferible que el llamador MANTENGA la actividad donde está a que la
   * traslademos a la ciudad equivocada.
   * @param {Object} itinerary
   * @param {Object} activity
   * @returns {Object|null} día destino, o null si no hay un día intermedio seguro
   */
  findLeastLoadedMiddleDay(itinerary, activity) {
    const middleDays = itinerary.days.slice(1, -1);
    if (middleDays.length === 0) return null;

    const activityCity = HotelBaseSystem.resolveActivityCity(activity);
    if (activityCity) {
      const sameCity = middleDays
        .filter(d => {
          const dayCity = d.city || HotelBaseSystem.detectCityForDay(d);
          return dayCity && HotelBaseSystem.isCityCompatible(dayCity, activityCity);
        })
        .sort((a, b) => a.activities.length - b.activities.length);
      // Si la actividad tiene ciudad conocida, SOLO se puede mover a un día de esa
      // ciudad. Si no hay ninguno (o ningún día intermedio tiene ciudad registrada),
      // no se mueve - null le indica al llamador que la deje donde está.
      return sameCity.length > 0 ? sameCity[0] : null;
    }

    // Actividad sin ciudad conocida (dato legado): comportamiento anterior como último recurso
    return [...middleDays].sort((a, b) => a.activities.length - b.activities.length)[0];
  },

  /**
   * Determina si una actividad es apropiada para el día 1 (jetlag)
   * @param {Object} activity
   * @returns {boolean}
   */
  isDay1Appropriate(activity) {
    const title = (activity.title || activity.name || '').toLowerCase();
    const category = (activity.category || '').toLowerCase();
    const subCategory = (activity.subCategory || '').toLowerCase();

    // ❌ NO apropiadas para día 1 (jetlag)
    const notAppropriate = [
      'onsen', 'spa', 'hot spring', 'baño termal',
      'hiking', 'mount', 'mountain', 'trek', 'hike',
      'nightlife', 'bar', 'club', 'karaoke',
      'intensive', 'marathon', 'tour largo'
    ];

    for (const keyword of notAppropriate) {
      if (title.includes(keyword) || category.includes(keyword) || subCategory.includes(keyword)) {
        console.log(`❌ "${activity.title || activity.name}" NO es apropiada para día 1 (${keyword})`);
        return false;
      }
    }

    // ✅ Apropiadas para día 1
    const appropriate = [
      'temple', 'shrine', 'templo', 'santuario',
      'culture', 'cultural', 'museo', 'museum',
      'garden', 'park', 'jardín', 'parque',
      'shopping', 'compras', 'market', 'mercado',
      'landmark', 'iconic', 'emblemático'
    ];

    for (const keyword of appropriate) {
      if (title.includes(keyword) || category.includes(keyword) || subCategory.includes(keyword)) {
        return true;
      }
    }

    // Por defecto, asumir que es apropiada si no está en la lista negra
    return true;
  },

  /**
   * Calcula score de "emblematicidad" de una actividad
   * @param {Object} activity
   * @returns {number} Score (0-100)
   */
  calculateIconicScore(activity) {
    const title = (activity.title || activity.name || '').toLowerCase();
    let score = 0;

    // Lugares super emblemáticos
    const iconic = ['senso-ji', 'asakusa', 'shibuya crossing', 'fushimi inari',
                    'kinkaku-ji', 'todai-ji', 'meiji shrine', 'tokyo tower',
                    'skytree', 'arashiyama', 'nara park', 'dotonbori'];

    for (const place of iconic) {
      if (title.includes(place)) {
        score += 50;
      }
    }

    // Categorías emblemáticas
    if (activity.category === 'culture' || activity.category === 'landmark') {
      score += 30;
    }

    // Popularidad
    if (activity.popularity >= 85) {
      score += 20;
    } else if (activity.popularity >= 70) {
      score += 10;
    }

    return score;
  },

  /**
   * Aplica reglas especiales para día 1 (jetlag) y último día (aeropuerto)
   * @param {Object} itinerary
   */
  applySpecialDayRules(itinerary) {
    const firstDay = itinerary.days[0];
    const lastDay = itinerary.days[itinerary.days.length - 1];

    console.log('🛫 Aplicando reglas especiales para días 1 y último...');

    // NOTA: Antes había una regla que VACIABA COMPLETAMENTE el último día ("solo
    // aeropuerto"). Se eliminó porque asumía que el último día del viaje es siempre un
    // día de puro traslado sin tiempo para nada más, lo cual no es cierto en la mayoría
    // de los viajes reales (ej. un vuelo de tarde deja toda una mañana libre) y además
    // le quitaba al usuario actividades que había planeado deliberadamente. La regla de
    // "Máximo 2 actividades" más abajo ya cubre la idea de mantener el último día ligero,
    // sin vaciarlo por completo.

    // 🛫 DÍA 1: Máximo 3 actividades (jetlag-friendly)
    if (firstDay && firstDay.activities.length > 0) {
      console.log(`🛫 Día 1 tiene ${firstDay.activities.length} actividades`);

      // PASO 1: Filtrar actividades NO apropiadas para día 1
      const inappropriateActivities = [];
      firstDay.activities = firstDay.activities.filter(activity => {
        if (!this.isDay1Appropriate(activity)) {
          inappropriateActivities.push(activity);
          return false;
        }
        return true;
      });

      // Mover actividades inapropiadas a días posteriores de la MISMA CIUDAD
      inappropriateActivities.forEach(activity => {
        const targetDay = this.findLeastLoadedMiddleDay(itinerary, activity);

        if (targetDay) {
          targetDay.activities.push(activity);
          console.log(`   ↪ "${activity.title || activity.name}" movida del día 1 (inapropiada para jetlag)`);
        } else {
          // Viaje corto sin días intermedios: no hay dónde moverla, mantenerla en día 1
          // en vez de perderla.
          firstDay.activities.push(activity);
          console.warn(`   ⚠️ "${activity.title || activity.name}" mantenida en Día 1 (no hay días intermedios)`);
        }
      });

      // PASO 2: Ordenar por emblematicidad y proximidad
      const city = HotelBaseSystem.detectCityForDay(firstDay);
      const hotel = HotelBaseSystem.getHotelForCity(itinerary, city, 1);

      firstDay.activities.sort((a, b) => {
        // Priorizar actividades emblemáticas
        const iconicScoreA = this.calculateIconicScore(a);
        const iconicScoreB = this.calculateIconicScore(b);

        if (iconicScoreA !== iconicScoreB) {
          return iconicScoreB - iconicScoreA; // Más emblemática primero
        }

        // Si tienen mismo score, ordenar por proximidad al hotel
        if (hotel && hotel.coordinates && a.coordinates && b.coordinates) {
          const distA = RouteOptimizer.calculateDistance(a.coordinates, hotel.coordinates);
          const distB = RouteOptimizer.calculateDistance(b.coordinates, hotel.coordinates);
          return distA - distB;
        }

        return 0;
      });

      // PASO 3: Limitar a 3 actividades
      if (firstDay.activities.length > 3) {
        console.log(`   Reduciendo de ${firstDay.activities.length} a 3 actividades`);
        const extraActivities = firstDay.activities.splice(3);
        extraActivities.forEach(activity => {
          const targetDay = this.findLeastLoadedMiddleDay(itinerary, activity);

          if (targetDay) {
            targetDay.activities.push(activity);
            console.log(`   ↪ "${activity.title || activity.name}" movida a Día ${targetDay.day}`);
          } else {
            // Viaje corto sin días intermedios: no hay dónde moverla, mantenerla en día 1
            // en vez de perderla (excede el límite de 3, pero es preferible a borrarla).
            firstDay.activities.push(activity);
            console.warn(`   ⚠️ "${activity.title || activity.name}" mantenida en Día 1 (no hay días intermedios)`);
          }
        });
      }

      console.log(`✅ Día 1 final: ${firstDay.activities.length} actividades emblemáticas apropiadas`);
      firstDay.activities.forEach((act, i) => {
        console.log(`   ${i + 1}. ${act.title || act.name} (iconic score: ${this.calculateIconicScore(act)})`);
      });
    }

    // 🛬 ÚLTIMO DÍA: Máximo 2 actividades (salida al aeropuerto)
    if (lastDay && lastDay.activities.length > 2) {
      console.log(`🛬 Último día (${lastDay.day}) tiene ${lastDay.activities.length} actividades - reduciendo a 2`);

      // Ordenar por proximidad al hotel (mantener las más cercanas)
      const city = HotelBaseSystem.detectCityForDay(lastDay);
      const hotel = HotelBaseSystem.getHotelForCity(itinerary, city, lastDay.day);

      if (hotel && hotel.coordinates) {
        lastDay.activities.sort((a, b) => {
          const distA = RouteOptimizer.calculateDistance(a.coordinates, hotel.coordinates);
          const distB = RouteOptimizer.calculateDistance(b.coordinates, hotel.coordinates);
          return distA - distB;
        });
      }

      // Mover las actividades extras a días anteriores de la MISMA CIUDAD
      const extraActivities = lastDay.activities.splice(2);
      extraActivities.forEach(activity => {
        const targetDay = this.findLeastLoadedMiddleDay(itinerary, activity);

        if (targetDay) {
          targetDay.activities.push(activity);
          console.log(`   ↪ "${activity.title || activity.name}" movida a Día ${targetDay.day}`);
        } else {
          // 🏙️ Sin día intermedio de la misma ciudad: dejarla en el último día en vez de
          // perderla (rompe el límite de 2 actividades, pero es preferible a extraviarla
          // o mandarla a la ciudad equivocada).
          lastDay.activities.push(activity);
          console.warn(`   ⚠️ "${activity.title || activity.name}" (${activity.city || 'ciudad desconocida'}) se queda en el Día ${lastDay.day}: no hay otro día de su ciudad.`);
        }
      });
    }
  },

  /**
   * Balance para asegurar que TODOS los días tengan actividades suficientes
   * @param {Object} itinerary
   */
  balanceEmptyDays(itinerary) {
    console.log('⚖️ Balanceando días para asegurar actividades suficientes...');

    // Día 1: 3 actividades máx (jetlag)
    // Días 2-penúltimo: MÍNIMO 4-5 actividades (días normales)
    // Último día: 0 actividades (aeropuerto)

    const MIN_ACTIVITIES_DAY1 = 2;
    const MAX_ACTIVITIES_DAY1 = 3;
    const MIN_ACTIVITIES_NORMAL = 4;  // 🔥 AUMENTADO de 3 a 4
    const MAX_ACTIVITIES = 6;

    // Encontrar días con pocas actividades (excluir día 1 y último)
    const normalDays = itinerary.days.slice(1, -1); // Días 2 al penúltimo

    const lightDays = normalDays.filter(d => d.activities.length < MIN_ACTIVITIES_NORMAL && d.activities.length > 0);
    const emptyDays = normalDays.filter(d => d.activities.length === 0);
    const fullDays = normalDays.filter(d => d.activities.length >= MIN_ACTIVITIES_NORMAL && d.activities.length <= MAX_ACTIVITIES);
    const overloadedDays = normalDays.filter(d => d.activities.length > MAX_ACTIVITIES);

    console.log(`📊 Estado actual (días 2-${itinerary.days.length - 1}):
      - Días vacíos (0): ${emptyDays.length}
      - Días ligeros (< ${MIN_ACTIVITIES_NORMAL}): ${lightDays.length}
      - Días balanceados (${MIN_ACTIVITIES_NORMAL}-${MAX_ACTIVITIES}): ${fullDays.length}
      - Días sobrecargados (${MAX_ACTIVITIES}+): ${overloadedDays.length}`);

    // PASO 1: Redistribuir desde días sobrecargados
    overloadedDays.forEach(overloadedDay => {
      // No tocar día 1 y último día (ya tienen sus reglas)
      if (overloadedDay.day === 1 || overloadedDay.day === itinerary.days.length) {
        return;
      }

      const activitiesToMove = overloadedDay.activities.length - MAX_ACTIVITIES;
      if (activitiesToMove > 0) {
        console.log(`📤 Día ${overloadedDay.day} tiene ${overloadedDay.activities.length} actividades - redistribuyendo ${activitiesToMove}`);

        const overloadedCity = overloadedDay.city || HotelBaseSystem.detectCityForDay(overloadedDay);

        // Mover actividades a días ligeros/vacíos de la MISMA CIUDAD (nunca mezclar ciudades)
        const targetDays = [...emptyDays, ...lightDays, ...fullDays]
          .filter(d => {
            if (d.day === overloadedDay.day || d.activities.length >= MAX_ACTIVITIES) return false;
            const dCity = d.city || HotelBaseSystem.detectCityForDay(d);
            return !dCity || !overloadedCity || HotelBaseSystem.isCityCompatible(dCity, overloadedCity) || HotelBaseSystem.isCityCompatible(overloadedCity, dCity);
          })
          .sort((a, b) => a.activities.length - b.activities.length);

        for (let i = 0; i < activitiesToMove && targetDays.length > 0; i++) {
          const activity = overloadedDay.activities.pop();
          const targetDay = targetDays[0];
          targetDay.activities.push(activity);
          console.log(`   ↪ "${activity.title || activity.name}" → Día ${targetDay.day}`);

          // Si el día objetivo ya tiene suficientes, quitarlo de la lista
          if (targetDay.activities.length >= MAX_ACTIVITIES) {
            targetDays.shift();
          }
        }
      }
    });

    // PASO 2: Llenar días vacíos/ligeros redistribuyendo de días normales
    const allDaysNeedingActivities = [...emptyDays, ...lightDays];

    allDaysNeedingActivities.forEach(needyDay => {
      const needed = MIN_ACTIVITIES_NORMAL - needyDay.activities.length;
      if (needed <= 0) return;

      console.log(`📥 Día ${needyDay.day} necesita ${needed} actividades más (mín ${MIN_ACTIVITIES_NORMAL})`);

      const needyCity = needyDay.city || HotelBaseSystem.detectCityForDay(needyDay);

      // Buscar días donantes de la MISMA CIUDAD (que tengan MÁS de MIN_ACTIVITIES_NORMAL)
      const donorDays = itinerary.days
        .filter(d => {
          if (d.day === needyDay.day || d.day === 1 || d.day === itinerary.days.length) return false; // No quitar del día 1 ni último
          if (d.activities.length <= MIN_ACTIVITIES_NORMAL) return false;
          const dCity = d.city || HotelBaseSystem.detectCityForDay(d);
          return !dCity || !needyCity || HotelBaseSystem.isCityCompatible(dCity, needyCity) || HotelBaseSystem.isCityCompatible(needyCity, dCity);
        })
        .sort((a, b) => b.activities.length - a.activities.length);

      let filled = 0;
      for (const donorDay of donorDays) {
        if (filled >= needed) break;

        // Mover 1 actividad del donante al necesitado
        if (donorDay.activities.length > MIN_ACTIVITIES_NORMAL) {
          const activity = donorDay.activities.pop();
          needyDay.activities.push(activity);
          console.log(`   ↪ "${activity.title || activity.name}" del Día ${donorDay.day} → Día ${needyDay.day}`);
          filled++;
        }
      }

      if (filled < needed) {
        console.log(`ℹ️ Día ${needyDay.day} tiene ${needyDay.activities.length} actividades (objetivo: ${MIN_ACTIVITIES_NORMAL})`);
        // NO hacer nada más - será manejado por el sistema de auto-sugerencias
      }
    });

    // Resumen final (excluir día 1 y último día del conteo)
    const normalDaysFinal = itinerary.days.slice(1, -1);
    const finalEmpty = normalDaysFinal.filter(d => d.activities.length === 0).length;
    const finalLight = normalDaysFinal.filter(d => d.activities.length < MIN_ACTIVITIES_NORMAL && d.activities.length > 0).length;
    const finalBalanced = normalDaysFinal.filter(d => d.activities.length >= MIN_ACTIVITIES_NORMAL && d.activities.length <= MAX_ACTIVITIES).length;

    // Verificar día 1
    const day1 = itinerary.days[0];
    const day1Count = day1.activities.length;
    const day1Status = day1Count >= MIN_ACTIVITIES_DAY1 && day1Count <= MAX_ACTIVITIES_DAY1 ? '✅' : '⚠️';

    // Verificar último día
    const lastDay = itinerary.days[itinerary.days.length - 1];
    // Un último día vacío ya NO es el objetivo (ver applySpecialDayRules) - si quedó en 0
    // es porque genuinamente no tenía actividades, no porque se vació a propósito.
    const MIN_ACTIVITIES_LASTDAY = 1;
    const lastDayStatus = lastDay.activities.length > 0 ? '✅' : '⚠️ vacío';

    console.log(`✅ Balance final:
      - Día 1: ${day1Count} actividades ${day1Status} (debe tener ${MIN_ACTIVITIES_DAY1}-${MAX_ACTIVITIES_DAY1})
      - Días normales (2-${itinerary.days.length - 1}):
        * Vacíos (0): ${finalEmpty}
        * Ligeros (< ${MIN_ACTIVITIES_NORMAL}): ${finalLight}
        * Balanceados (${MIN_ACTIVITIES_NORMAL}-${MAX_ACTIVITIES}): ${finalBalanced}
      - Último día: ${lastDay.activities.length} actividades ${lastDayStatus}

      ${finalEmpty > 0 || finalLight > 0 ? '❌ CRÍTICO: Días insuficientes - AGREGA MÁS ACTIVIDADES' : '✨ Todos los días están balanceados'}`);

    // 🎯 AUTO-SUGERIR y AGREGAR actividades automáticamente
    if ((finalEmpty > 0 || finalLight > 0)) {
      const daysNeedingActivities = normalDaysFinal.filter(d => d.activities.length < MIN_ACTIVITIES_NORMAL);

      console.log(`🤖 AUTO-COMPLETANDO ${daysNeedingActivities.length} días con pocas actividades...`);

      // Auto-completar cada día
      daysNeedingActivities.forEach(day => {
        const needed = MIN_ACTIVITIES_NORMAL - day.activities.length;
        if (needed > 0) {
          console.log(`   Día ${day.day}: agregando ${needed} actividades automáticamente...`);
          // La función autoSuggestActivities se ejecutará después
          day._needsActivities = needed; // Marcar para auto-sugerencia
        }
      });

      // Mostrar notificación informativa (no error)
      if (typeof window !== 'undefined' && window.Notifications) {
        const count = daysNeedingActivities.length;
        window.Notifications.show(
          `🤖 Auto-completando ${count} días con actividades sugeridas...`,
          'info',
          3000
        );
      }
    }

    // 🏙️ Día 1 y último día quedaban SIEMPRE excluidos del auto-completado (solo
    // normalDaysFinal se marca arriba). Si genuinamente están vacíos o muy ligeros -no
    // porque se hayan vaciado a propósito, sino porque nunca tuvieron actividades- también
    // merecen rellenarse, respetando sus topes más bajos (día 1: jetlag, último día: salida).
    if (day1Count < MIN_ACTIVITIES_DAY1) {
      const needed = MIN_ACTIVITIES_DAY1 - day1Count;
      console.log(`   Día 1: agregando ${needed} actividad(es) automáticamente (mín ${MIN_ACTIVITIES_DAY1})...`);
      day1._needsActivities = needed;
    }
    if (lastDay.activities.length < MIN_ACTIVITIES_LASTDAY && lastDay.day !== day1.day) {
      const needed = MIN_ACTIVITIES_LASTDAY - lastDay.activities.length;
      console.log(`   Último día: agregando ${needed} actividad(es) automáticamente (mín ${MIN_ACTIVITIES_LASTDAY})...`);
      lastDay._needsActivities = needed;
    }
  },

  /**
   * 🤖 AUTO-SUGIERE Y AGREGA actividades a días con pocas actividades
   * @param {Object} itinerary
   * @returns {Object} Resultado con actividades agregadas
   */
  async autoCompleteActivities(itinerary) {
    if (!itinerary || !itinerary.days) return { added: 0 };

    console.log('🤖 SISTEMA DE AUTO-COMPLETADO DE ACTIVIDADES');

    // Obtener base de datos de actividades
    const availableActivities = await this.getAvailableActivities();
    if (!availableActivities || availableActivities.length === 0) {
      console.warn('⚠️ No hay actividades disponibles en la base de datos');
      return { added: 0 };
    }

    // IDs de actividades ya en el itinerario
    const usedActivityIds = new Set();
    itinerary.days.forEach(day => {
      if (day.activities) {
        day.activities.forEach(act => {
          if (act.id) usedActivityIds.add(act.id);
        });
      }
    });

    let totalAdded = 0;

    // Procesar cada día que necesita actividades
    itinerary.days.forEach(day => {
      if (!day._needsActivities || day._needsActivities === 0) return;

      const needed = day._needsActivities;
      const city = HotelBaseSystem.detectCityForDay(day);
      const hotel = HotelBaseSystem.getHotelForCity(itinerary, city, day.day);

      console.log(`   Día ${day.day} (${city}): buscando ${needed} actividades cercanas...`);

      // Filtrar actividades disponibles para esta ciudad
      const cityActivities = availableActivities.filter(act => {
        // No usar actividades ya agregadas
        if (usedActivityIds.has(act.id)) return false;

        // Verificar que sea de la ciudad correcta
        const actCity = act.city || act.area;
        if (!actCity) return false;

        return actCity.toLowerCase().includes(city.toLowerCase()) ||
               city.toLowerCase().includes(actCity.toLowerCase());
      });

      if (cityActivities.length === 0) {
        console.warn(`   ⚠️ No hay actividades disponibles para ${city}`);
        return;
      }

      // 📍 Punto de referencia para elegir candidatas CERCANAS ENTRE SÍ, no solo cercanas
      // al hotel por separado. Ordenar solo por distancia al hotel puede elegir N
      // actividades que individualmente están "cerca del hotel" pero dispersas entre sí
      // (ej. Ikebukuro + Odaiba + Mitaka en el mismo día) - usar el centroide de las
      // actividades YA existentes en el día como referencia mantiene las nuevas
      // agrupadas con lo que ya está planeado, y solo cae al hotel si el día está
      // completamente vacío.
      const existingWithCoords = (day.activities || []).filter(a => a.coordinates?.lat && a.coordinates?.lng);
      let referencePoint = hotel?.coordinates || null;
      if (existingWithCoords.length > 0) {
        referencePoint = {
          lat: existingWithCoords.reduce((s, a) => s + a.coordinates.lat, 0) / existingWithCoords.length,
          lng: existingWithCoords.reduce((s, a) => s + a.coordinates.lng, 0) / existingWithCoords.length
        };
      }

      if (referencePoint) {
        cityActivities.sort((a, b) => {
          if (!a.coordinates || !b.coordinates) return 0;

          const distA = RouteOptimizer.calculateDistance(a.coordinates, referencePoint);
          const distB = RouteOptimizer.calculateDistance(b.coordinates, referencePoint);
          return distA - distB;
        });
      }

      // Agregar las N más cercanas (mapeadas al esquema que espera el resto de la app:
      // .title en vez de .name, .category en vez de .categories[], .rating en vez de
      // .quality_rating - de lo contrario estas actividades se agregan "de verdad" pero
      // se renderizan en blanco/rotas en la UI, dando la sensación de que el hueco sigue
      // sin llenarse)
      const toAdd = cityActivities.slice(0, needed);
      toAdd.forEach(rawActivity => {
        const activity = {
          id: rawActivity.id,
          title: rawActivity.title || rawActivity.name,
          time: rawActivity.time || null, // se recalcula después en optimizeAllDaysFromHotel
          duration: rawActivity.duration || 60,
          category: rawActivity.category || rawActivity.categories?.[0] || 'general',
          desc: rawActivity.desc || rawActivity.description || (rawActivity.tags ? rawActivity.tags.join(', ') : ''),
          cost: rawActivity.cost || 0,
          coordinates: rawActivity.coordinates || (rawActivity.lat && rawActivity.lng ? { lat: rawActivity.lat, lng: rawActivity.lng } : null),
          rating: rawActivity.rating || rawActivity.quality_rating || null,
          city: rawActivity.city,
          source: 'auto-complete'
        };
        day.activities.push(activity);
        usedActivityIds.add(activity.id);
        totalAdded++;
        console.log(`      ✅ "${activity.title}" agregada`);
      });

      delete day._needsActivities; // Limpiar flag
    });

    console.log(`🎉 AUTO-COMPLETADO: ${totalAdded} actividades agregadas`);

    return { added: totalAdded };
  },

  /**
   * Obtiene actividades disponibles de la base de datos
   * @returns {Promise<Array>} Lista de actividades
   */
  async getAvailableActivities() {
    // 🥇 PRIORIDAD 1: activities-database.js - la base de datos REAL de la app (148
    // actividades reales en 19 ciudades). Antes esta función probaba primero
    // window.UNIFIED_DATABASE / data/database.js, que nunca tiene más de 12 actividades
    // y SOLO de Tokyo (nada se asigna nunca a window.UNIFIED_DATABASE en todo el
    // proyecto) - por eso el auto-completado nunca lograba llenar huecos en ninguna
    // ciudad que no fuera Tokyo. También se corrige que `activities` es un objeto
    // {ciudad: [...]}, no un array - hay que aplanarlo.
    try {
      const { ACTIVITIES_DATABASE } = await import('../../../data/activities-database.js');
      if (ACTIVITIES_DATABASE) {
        const flattened = [];
        Object.values(ACTIVITIES_DATABASE).forEach(cityData => {
          (cityData.activities || []).forEach(act => {
            flattened.push({ ...act, city: act.city || cityData.city });
          });
        });
        if (flattened.length > 0) {
          console.log(`📦 Actividades cargadas desde activities-database.js: ${flattened.length}`);
          return flattened;
        }
      }
    } catch (error) {
      console.warn('⚠️ No se pudo cargar activities-database.js', error);
    }

    // Fallback: window.UNIFIED_DATABASE (nunca se asigna actualmente, pero se deja por
    // si algún día se popula en runtime)
    if (typeof window !== 'undefined' && window.UNIFIED_DATABASE) {
      const activities = Object.values(window.UNIFIED_DATABASE);
      console.log(`📦 Actividades cargadas desde UNIFIED_DATABASE: ${activities.length}`);
      return activities;
    }

    // Último fallback: database.js (base legada, solo 12 actividades de Tokyo)
    try {
      const { UNIFIED_DATABASE } = await import('../../../data/database.js');
      if (UNIFIED_DATABASE) {
        const activities = Object.values(UNIFIED_DATABASE);
        console.log(`📦 Actividades cargadas desde database.js: ${activities.length}`);
        return activities;
      }
    } catch (error) {
      console.warn('⚠️ No se pudo cargar database.js');
    }

    console.error('❌ No se encontró ninguna base de datos de actividades');
    return [];
  },

  /**
   * Optimiza la ruta de cada día desde el hotel base
   * @param {Object} itinerary
   * @param {Object} hotelsByDay
   */
  optimizeAllDaysFromHotel(itinerary, hotelsByDay) {
    console.log('🗺️ Optimizando rutas desde hoteles...');

    itinerary.days.forEach(day => {
      if (day.activities.length <= 1) {
        return; // No hay nada que optimizar
      }

      const hotel = hotelsByDay[day.day];
      // 🗺️ Sin hotel configurado para este día, seguir optimizando la ruta ENTRE las
      // actividades (RouteOptimizer acepta startPoint: null y ordena por proximidad
      // mutua). Antes esto se saltaba el día por completo, dejando el orden de
      // inserción tal cual - por eso días recién auto-completados (cada actividad
      // elegida individualmente por cercanía al hotel, no entre sí) podían terminar con
      // saltos de 10-20km entre actividades consecutivas sin que nada los reordenara.
      if (!hotel) {
        console.warn(`⚠️ Día ${day.day}: Sin hotel, optimizando solo por proximidad mutua entre actividades`);
      }

      const result = RouteOptimizer.optimizeRoute(day.activities, {
        startPoint: hotel?.coordinates || null,
        optimizationMode: 'balanced',
        shouldRecalculateTimings: true
      });

      if (result.wasOptimized) {
        day.activities = result.optimizedActivities;
        console.log(`✅ Día ${day.day}: Ruta optimizada (ahorro: ${result.savings.time} min)`);
      }
    });
  },

  /**
   * Función de utilidad: Verifica el estado del itinerario
   * @param {Object} itinerary
   * @returns {Object} Reporte del estado
   */
  verifyItineraryState(itinerary) {
    // Validación de seguridad
    if (!itinerary || !itinerary.days || !Array.isArray(itinerary.days)) {
      console.warn('⚠️ verifyItineraryState: Itinerario inválido o sin días');
      return {
        totalDays: 0,
        totalActivities: 0,
        emptyDays: [],
        overloadedDays: [],
        wellBalancedDays: [],
        firstDayActivities: 0,
        lastDayActivities: 0,
        error: 'Itinerario inválido'
      };
    }

    const report = {
      totalDays: itinerary.days.length,
      totalActivities: 0,
      emptyDays: [],
      overloadedDays: [],
      wellBalancedDays: [],
      firstDayActivities: 0,
      lastDayActivities: 0
    };

    itinerary.days.forEach(day => {
      const count = day.activities.length;
      report.totalActivities += count;

      if (count === 0) {
        report.emptyDays.push(day.day);
      } else if (count > 7) {
        report.overloadedDays.push(day.day);
      } else if (count >= 3 && count <= 6) {
        report.wellBalancedDays.push(day.day);
      }

      if (day.day === 1) {
        report.firstDayActivities = count;
      }
      if (day.day === itinerary.days.length) {
        report.lastDayActivities = count;
      }
    });

    return report;
  }
};

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.ActivityDayAssignment = ActivityDayAssignment;
}

export default ActivityDayAssignment;
