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
   * Aplica reglas especiales para día 1 (jetlag) y último día (aeropuerto)
   * @param {Object} itinerary
   */
  applySpecialDayRules(itinerary) {
    const firstDay = itinerary.days[0];
    const lastDay = itinerary.days[itinerary.days.length - 1];

    console.log('🛫 Aplicando reglas especiales para días 1 y último...');

    // 🛫 DÍA 1: Máximo 3 actividades (jetlag-friendly)
    if (firstDay && firstDay.activities.length > 3) {
      console.log(`🛫 Día 1 tiene ${firstDay.activities.length} actividades - reduciendo a 3`);

      // Ordenar por proximidad al hotel (mantener las más cercanas)
      const city = HotelBaseSystem.detectCityForDay(firstDay);
      const hotel = HotelBaseSystem.getHotelForCity(itinerary, city, 1);

      if (hotel && hotel.coordinates) {
        firstDay.activities.sort((a, b) => {
          const distA = RouteOptimizer.calculateDistance(a.coordinates, hotel.coordinates);
          const distB = RouteOptimizer.calculateDistance(b.coordinates, hotel.coordinates);
          return distA - distB;
        });
      }

      // Mover las actividades extras a días posteriores
      const extraActivities = firstDay.activities.splice(3);
      extraActivities.forEach(activity => {
        // Encontrar el día con menos actividades (pero no el último)
        const targetDays = itinerary.days
          .slice(1, -1) // Excluir primer y último día
          .sort((a, b) => a.activities.length - b.activities.length);

        if (targetDays.length > 0) {
          targetDays[0].activities.push(activity);
          console.log(`   ↪ "${activity.title || activity.name}" movida a Día ${targetDays[0].day}`);
        }
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
   * Balance para evitar días vacíos - redistribuye actividades
   * @param {Object} itinerary
   */
  balanceEmptyDays(itinerary) {
    console.log('⚖️ Balanceando días vacíos...');

    const emptyDays = itinerary.days.filter(d => d.activities.length === 0);
    const fullDays = itinerary.days.filter(d => d.activities.length > 3);

    if (emptyDays.length === 0) {
      console.log('✅ No hay días vacíos');
      return;
    }

    console.log(`⚠️ Encontrados ${emptyDays.length} días vacíos`);

    emptyDays.forEach(emptyDay => {
      // Encontrar días con muchas actividades para redistribuir
      const donorDays = fullDays
        .filter(d => d.day !== emptyDay.day && d.activities.length > 4)
        .sort((a, b) => b.activities.length - a.activities.length);

      if (donorDays.length > 0) {
        const donorDay = donorDays[0];

        // Mover 1-2 actividades del día donante al día vacío
        const toMove = Math.min(2, Math.floor(donorDay.activities.length / 2));
        const movedActivities = donorDay.activities.splice(-toMove);

        movedActivities.forEach(activity => {
          emptyDay.activities.push(activity);
          console.log(`   ↪ "${activity.title || activity.name}" movida del Día ${donorDay.day} al Día ${emptyDay.day}`);
        });
      } else {
        console.warn(`⚠️ No hay días donantes disponibles para llenar Día ${emptyDay.day}`);
      }
    });
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
