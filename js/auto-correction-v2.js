// js/auto-correction-v2.js - Sistema de Auto-Corrección V2 SIMPLIFICADO
// Usa CityDetectionV2 para corregir días mezclados de forma simple y robusta

import { CityDetectionV2 } from './city-detection-v2.js';

/**
 * Sistema de Auto-Corrección V2
 * ENFOQUE: Simple, directo, sin lógica complicada
 */
export const AutoCorrectionV2 = {

  /**
   * Corrige automáticamente días mezclados
   * @param {Object} itinerary
   * @returns {Object} Resultado con estadísticas
   */
  async correctMixedDays(itinerary) {
    console.log('\n🔧 ═══════════════════════════════════════');
    console.log('🔧 AUTO-CORRECCIÓN DE DÍAS MEZCLADOS');
    console.log('🔧 ═══════════════════════════════════════\n');

    // 🔒 VALIDACIÓN: Verificar que el itinerario es válido
    if (!itinerary || !itinerary.days || !Array.isArray(itinerary.days)) {
      console.error('❌ Itinerario inválido - no se puede corregir');
      return {
        success: false,
        error: 'Itinerario inválido o sin días',
        stats: {
          activitiesMoved: 0,
          daysCorrected: 0,
          failed: 0,
          details: []
        }
      };
    }

    if (itinerary.days.length === 0) {
      console.warn('⚠️ Itinerario vacío - no hay nada que corregir');
      return {
        success: true,
        stats: {
          activitiesMoved: 0,
          daysCorrected: 0,
          failed: 0,
          details: []
        }
      };
    }

    const stats = {
      activitiesMoved: 0,
      daysCorrected: 0,
      failed: 0,
      details: []
    };

    try {
      // PASO 1: Analizar distribución de ciudades
      console.log('📊 Analizando distribución de ciudades...');
      const analysis = CityDetectionV2.analyzeCityDistribution(itinerary);
      CityDetectionV2.printCityReport(analysis);

      // PASO 2: Si no hay días mezclados, no hay nada que hacer
      if (analysis.mixedDays.length === 0) {
        console.log('✅ No hay días mezclados - no se necesitan correcciones\n');
        return { success: true, stats };
      }

      console.log(`🔧 Corrigiendo ${analysis.mixedDays.length} días mezclados...\n`);

      // PASO 3: Para cada día mezclado
      for (const mixedDay of analysis.mixedDays) {
        const day = itinerary.days.find(d => d.day === mixedDay.day);
        if (!day || !day.activities) continue;

        console.log(`📍 Día ${mixedDay.day} (${mixedDay.mainCity} + ${mixedDay.otherCities.length} otras):`);

        // Detectar ciudad dominante del día
        const detection = CityDetectionV2.detectDayCity(day);
        const mainCity = detection.city;

        console.log(`   Ciudad principal: ${mainCity}`);

        // Identificar actividades que NO son de la ciudad principal
        const activitiesToMove = [];

        day.activities.forEach((activity, index) => {
          const activityCity = CityDetectionV2.extractCityFromActivity(activity);

          if (activityCity && activityCity !== mainCity) {
            activitiesToMove.push({ activity, index, city: activityCity });
          }
        });

        console.log(`   Actividades a mover: ${activitiesToMove.length}`);

        // 🔥 FIX CRÍTICO: Ordenar por índice DESCENDENTE sin modificar array original
        // Esto asegura que splice() elimine las actividades correctas
        const sortedToMove = [...activitiesToMove].sort((a, b) => b.index - a.index);

        // Mover cada actividad a su ciudad correcta
        for (const { activity, index, city } of sortedToMove) {
          const activityName = activity.title || activity.name || 'Sin nombre';

          // Encontrar mejor día para esta actividad
          const bestDay = CityDetectionV2.findBestDayForActivity(
            itinerary,
            activity,
            mixedDay.day,
            analysis
          );

          if (bestDay) {
            // 🔒 VALIDACIÓN: Verificar que el día destino existe
            const targetDay = itinerary.days.find(d => d.day === bestDay);

            if (!targetDay) {
              console.error(`      ❌ Día ${bestDay} no existe en itinerario`);
              stats.failed++;
              stats.details.push({
                activity: activityName,
                from: mixedDay.day,
                to: bestDay,
                city: city,
                failed: true,
                reason: `Día ${bestDay} no encontrado`
              });
              continue;
            }

            // Inicializar activities si no existe
            if (!targetDay.activities) {
              targetDay.activities = [];
            }

            // 🔒 VALIDACIÓN: Verificar que el índice es válido
            if (index < 0 || index >= day.activities.length) {
              console.error(`      ❌ Índice ${index} fuera de rango (array size: ${day.activities.length})`);
              stats.failed++;
              continue;
            }

            // Remover del día actual (splice devuelve array de elementos removidos)
            const [removed] = day.activities.splice(index, 1);

            // Agregar al día correcto
            targetDay.activities.push(removed);

            stats.activitiesMoved++;
            console.log(`      ✅ "${activityName}" (${city}) → Día ${bestDay}`);

            stats.details.push({
              activity: activityName,
              from: mixedDay.day,
              to: bestDay,
              city: city
            });

          } else {
            stats.failed++;
            console.log(`      ⚠️ "${activityName}" (${city}) - No hay días de ${city} disponibles`);

            stats.details.push({
              activity: activityName,
              from: mixedDay.day,
              to: null,
              city: city,
              failed: true,
              reason: `No hay días dedicados a ${city}`
            });
          }
        }

        if (activitiesToMove.length > 0) {
          stats.daysCorrected++;
        }
      }

      // PASO 4: Reportar resultados
      console.log('\n📊 ═══════════════════════════════════════');
      console.log('📊 RESULTADOS DE AUTO-CORRECCIÓN');
      console.log('📊 ═══════════════════════════════════════\n');
      console.log(`   ✅ Actividades movidas: ${stats.activitiesMoved}`);
      console.log(`   📅 Días corregidos: ${stats.daysCorrected}`);
      console.log(`   ⚠️ Fallos: ${stats.failed}`);

      if (stats.failed > 0) {
        console.log(`\n   💡 TIP: ${stats.failed} actividades no se pudieron mover`);
        console.log(`      porque no hay días dedicados a sus ciudades.`);
        console.log(`      Considera agregar días para esas ciudades.`);
      }

      console.log('\n📊 ═══════════════════════════════════════\n');

      return {
        success: true,
        stats,
        corrected: stats.activitiesMoved > 0
      };

    } catch (error) {
      console.error('❌ Error en auto-corrección:', error);
      return {
        success: false,
        error: error.message,
        stats
      };
    }
  },

  /**
   * Genera reporte detallado para el usuario
   */
  generateUserReport(result) {
    if (!result.success) {
      return {
        type: 'error',
        message: 'La auto-corrección falló',
        error: result.error
      };
    }

    if (result.stats.activitiesMoved === 0 && result.stats.failed === 0) {
      return {
        type: 'success',
        message: 'Tu itinerario está bien organizado - no necesita correcciones',
        icon: '✅'
      };
    }

    const messages = [];

    if (result.stats.activitiesMoved > 0) {
      messages.push({
        type: 'success',
        message: `${result.stats.activitiesMoved} actividades fueron movidas a días más apropiados`,
        icon: '✅'
      });
    }

    if (result.stats.failed > 0) {
      const failedActivities = result.stats.details
        .filter(d => d.failed)
        .map(d => `${d.activity} (${d.city})`)
        .slice(0, 3); // Max 3

      messages.push({
        type: 'warning',
        message: `${result.stats.failed} actividades no se pudieron mover automáticamente`,
        details: failedActivities,
        suggestion: 'Considera agregar días dedicados a esas ciudades o moverlas manualmente',
        icon: '⚠️'
      });
    }

    return { messages };
  }
};

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.AutoCorrectionV2 = AutoCorrectionV2;
}

export default AutoCorrectionV2;
