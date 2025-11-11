// js/activity-day-assignment.js - Sistema Inteligente de Asignación de Actividades
// Asigna actividades a días basándose en proximidad al hotel, balance y reglas especiales

import { HotelBaseSystem } from './hotel-base-system.js';
import { RouteOptimizer } from './route-optimizer-v2.js';

/**
 * Sistema de Asignación Inteligente de Actividades
 * Resuelve el problema de actividades mal ubicadas y días vacíos
 */
export const ActivityDayAssignment = {
  /**
   * Asigna todas las actividades del itinerario a los días óptimos
   * basándose en la ubicación de los hoteles
   * @param {Object} itinerary - Itinerario completo con days[] y hotels{}
   * @returns {Object} Itinerario con actividades reasignadas
   */
  assignActivitiesOptimally(itinerary) {
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

    // 7. Optimizar rutas de cada día desde el hotel
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
   * @param {Array} activities - Lista de actividades
   * @param {Array} days - Días del itinerario
   * @param {Object} hotelsByDay - Mapa de hoteles
   * @returns {Object} Estadísticas de asignación
   */
  assignActivitiesToOptimalDays(activities, days, hotelsByDay) {
    let assigned = 0;
    let unassigned = 0;

    activities.forEach(activity => {
      if (!activity.coordinates || !activity.coordinates.lat) {
        // Sin coordenadas, no podemos asignar por proximidad
        // Dejar en el día original o primer día disponible
        const targetDay = days.find(d => d.day === activity.originalDay) || days[0];
        targetDay.activities.push(activity);
        assigned++;
        return;
      }

      // Encontrar el día cuyo hotel esté más cerca
      let bestDay = null;
      let minDistance = Infinity;

      Object.entries(hotelsByDay).forEach(([dayNum, hotel]) => {
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
          console.log(`✅ "${activity.title || activity.name}" asignada a Día ${bestDay} (${minDistance.toFixed(2)}km del hotel)`);
        } else {
          unassigned++;
          console.error(`❌ No se encontró Día ${bestDay} para "${activity.title || activity.name}"`);
        }
      } else {
        // Si no hay hoteles, asignar al primer día disponible
        days[0].activities.push(activity);
        unassigned++;
        console.warn(`⚠️ "${activity.title || activity.name}" asignada al Día 1 (sin hotel disponible)`);
      }
    });

    return { assigned, unassigned };
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

      // Mover actividades inapropiadas a días posteriores
      inappropriateActivities.forEach(activity => {
        const targetDays = itinerary.days
          .slice(1, -1)
          .sort((a, b) => a.activities.length - b.activities.length);

        if (targetDays.length > 0) {
          targetDays[0].activities.push(activity);
          console.log(`   ↪ "${activity.title || activity.name}" movida del día 1 (inapropiada para jetlag)`);
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
          const targetDays = itinerary.days
            .slice(1, -1)
            .sort((a, b) => a.activities.length - b.activities.length);

          if (targetDays.length > 0) {
            targetDays[0].activities.push(activity);
            console.log(`   ↪ "${activity.title || activity.name}" movida a Día ${targetDays[0].day}`);
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

      // Mover las actividades extras a días anteriores
      const extraActivities = lastDay.activities.splice(2);
      extraActivities.forEach(activity => {
        // Encontrar el día con menos actividades (pero no el primero ni el último)
        const targetDays = itinerary.days
          .slice(1, -1) // Excluir primer y último día
          .sort((a, b) => a.activities.length - b.activities.length);

        if (targetDays.length > 0) {
          targetDays[0].activities.push(activity);
          console.log(`   ↪ "${activity.title || activity.name}" movida a Día ${targetDays[0].day}`);
        }
      });
    }
  },

  /**
   * Balance para asegurar que TODOS los días tengan al menos 3 actividades
   * @param {Object} itinerary
   */
  balanceEmptyDays(itinerary) {
    console.log('⚖️ Balanceando días para asegurar mínimo 3 actividades por día...');

    const MIN_ACTIVITIES = 3;
    const MAX_ACTIVITIES = 6;

    // Encontrar días con pocas actividades (menos de 3)
    const lightDays = itinerary.days.filter(d => d.activities.length < MIN_ACTIVITIES && d.activities.length > 0);
    const emptyDays = itinerary.days.filter(d => d.activities.length === 0);
    const fullDays = itinerary.days.filter(d => d.activities.length >= MIN_ACTIVITIES && d.activities.length <= MAX_ACTIVITIES);
    const overloadedDays = itinerary.days.filter(d => d.activities.length > MAX_ACTIVITIES);

    console.log(`📊 Estado actual:
      - Días vacíos (0): ${emptyDays.length}
      - Días ligeros (1-2): ${lightDays.length}
      - Días balanceados (3-6): ${fullDays.length}
      - Días sobrecargados (7+): ${overloadedDays.length}`);

    // PASO 1: Redistribuir desde días sobrecargados
    overloadedDays.forEach(overloadedDay => {
      // No tocar día 1 y último día (ya tienen sus reglas)
      if (overloadedDay.day === 1 || overloadedDay.day === itinerary.days.length) {
        return;
      }

      const activitiesToMove = overloadedDay.activities.length - MAX_ACTIVITIES;
      if (activitiesToMove > 0) {
        console.log(`📤 Día ${overloadedDay.day} tiene ${overloadedDay.activities.length} actividades - redistribuyendo ${activitiesToMove}`);

        // Mover actividades a días ligeros/vacíos
        const targetDays = [...emptyDays, ...lightDays, ...fullDays]
          .filter(d => d.day !== overloadedDay.day && d.activities.length < MAX_ACTIVITIES)
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

    // PASO 2: Llenar días vacíos redistribuyendo de días normales
    const allDaysNeedingActivities = [...emptyDays, ...lightDays];

    allDaysNeedingActivities.forEach(needyDay => {
      const needed = MIN_ACTIVITIES - needyDay.activities.length;
      if (needed <= 0) return;

      console.log(`📥 Día ${needyDay.day} necesita ${needed} actividades más`);

      // Buscar días donantes (que tengan MÁS de MIN_ACTIVITIES)
      const donorDays = itinerary.days
        .filter(d => d.day !== needyDay.day &&
                     d.day !== 1 && // No quitar del día 1
                     d.day !== itinerary.days.length && // No quitar del último día
                     d.activities.length > MIN_ACTIVITIES)
        .sort((a, b) => b.activities.length - a.activities.length);

      let filled = 0;
      for (const donorDay of donorDays) {
        if (filled >= needed) break;

        // Mover 1 actividad del donante al necesitado
        if (donorDay.activities.length > MIN_ACTIVITIES) {
          const activity = donorDay.activities.pop();
          needyDay.activities.push(activity);
          console.log(`   ↪ "${activity.title || activity.name}" del Día ${donorDay.day} → Día ${needyDay.day}`);
          filled++;
        }
      }

      if (filled < needed) {
        console.warn(`⚠️ Día ${needyDay.day} solo se llenó con ${filled} de ${needed} actividades necesarias`);
        console.warn(`💡 SUGERENCIA: Agrega más actividades al itinerario para llenar este día`);
      }
    });

    // Resumen final
    const finalEmpty = itinerary.days.filter(d => d.activities.length === 0).length;
    const finalLight = itinerary.days.filter(d => d.activities.length < MIN_ACTIVITIES && d.activities.length > 0).length;
    const finalBalanced = itinerary.days.filter(d => d.activities.length >= MIN_ACTIVITIES && d.activities.length <= MAX_ACTIVITIES).length;

    console.log(`✅ Balance final:
      - Días vacíos: ${finalEmpty}
      - Días ligeros (1-2): ${finalLight}
      - Días balanceados (3-6): ${finalBalanced}
      ${finalEmpty > 0 || finalLight > 0 ? '⚠️ Aún hay días con pocas actividades - considera agregar más al itinerario' : '✨ Todos los días están balanceados'}`);

    // 🎯 MOSTRAR NOTIFICACIÓN si hay días que necesitan más actividades
    if ((finalEmpty > 0 || finalLight > 0) && typeof window !== 'undefined' && window.Notifications) {
      const daysNeedingActivities = itinerary.days
        .filter(d => d.activities.length < MIN_ACTIVITIES)
        .map(d => `Día ${d.day}`)
        .join(', ');

      window.Notifications.show(
        `⚠️ Algunos días tienen pocas actividades (${daysNeedingActivities}). Usa el botón "🕳️ Llenar Huecos" para agregar actividades sugeridas.`,
        'warning',
        8000
      );
    }
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
      if (!hotel) {
        console.warn(`⚠️ Día ${day.day}: Sin hotel para optimización`);
        return;
      }

      // Optimizar usando el hotel como punto de inicio
      const result = RouteOptimizer.optimizeRoute(day.activities, {
        startPoint: hotel.coordinates,
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
