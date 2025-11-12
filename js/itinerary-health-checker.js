// js/itinerary-health-checker.js - Sistema de Auto-Diagnóstico del Itinerario
// Analiza profundamente el itinerario ANTES de optimizarlo para prevenir errores

import { HotelBaseSystem } from './hotel-base-system.js';

/**
 * Sistema de Salud del Itinerario
 * Verifica integridad de datos y detecta problemas ANTES de la optimización
 */
export const ItineraryHealthChecker = {

  /**
   * Análisis completo de salud del itinerario
   * @param {Object} itinerary - Itinerario completo
   * @returns {Object} Reporte de salud con problemas identificados
   */
  analyzeHealth(itinerary) {
    console.log('\n🏥 ═══════════════════════════════════════');
    console.log('🏥 DIAGNÓSTICO DE SALUD DEL ITINERARIO');
    console.log('🏥 ═══════════════════════════════════════\n');

    const report = {
      healthy: true,
      score: 100,
      issues: {
        critical: [],
        warnings: [],
        suggestions: []
      },
      dataQuality: {
        activitiesWithoutCity: [],
        activitiesWithoutCoordinates: [],
        daysWithoutActivities: [],
        mixedDays: []
      },
      cityDistribution: {},
      recommendations: []
    };

    // 1. VALIDAR ESTRUCTURA BÁSICA
    this._validateStructure(itinerary, report);

    // 2. ANALIZAR CALIDAD DE DATOS DE ACTIVIDADES
    this._analyzeDataQuality(itinerary, report);

    // 3. DETECTAR DÍAS MEZCLADOS
    this._detectMixedDays(itinerary, report);

    // 4. ANALIZAR DISTRIBUCIÓN DE CIUDADES
    this._analyzeCityDistribution(itinerary, report);

    // 5. VALIDAR HOTELES CONFIGURADOS
    this._validateHotels(itinerary, report);

    // 6. CALCULAR SCORE DE SALUD
    this._calculateHealthScore(report);

    // 7. GENERAR RECOMENDACIONES
    this._generateRecommendations(report);

    // 8. MOSTRAR REPORTE
    this._printReport(report);

    return report;
  },

  /**
   * Valida estructura básica del itinerario
   */
  _validateStructure(itinerary, report) {
    if (!itinerary) {
      report.issues.critical.push('Itinerario es null o undefined');
      report.healthy = false;
      return;
    }

    if (!itinerary.days || !Array.isArray(itinerary.days)) {
      report.issues.critical.push('Itinerario.days no es un array válido');
      report.healthy = false;
      return;
    }

    if (itinerary.days.length === 0) {
      report.issues.critical.push('Itinerario no tiene días');
      report.healthy = false;
      return;
    }

    console.log(`✅ Estructura válida: ${itinerary.days.length} días`);
  },

  /**
   * Analiza calidad de datos de todas las actividades
   */
  _analyzeDataQuality(itinerary, report) {
    console.log('\n📊 Analizando calidad de datos...');

    let totalActivities = 0;
    let activitiesWithCity = 0;
    let activitiesWithCoordinates = 0;

    itinerary.days.forEach(day => {
      if (!day.activities || day.activities.length === 0) {
        report.dataQuality.daysWithoutActivities.push(day.day);
        return;
      }

      day.activities.forEach(activity => {
        totalActivities++;

        // Verificar cityName o city
        const hasCity = !!(activity.cityName || activity.city);
        if (hasCity) {
          activitiesWithCity++;
        } else {
          report.dataQuality.activitiesWithoutCity.push({
            day: day.day,
            activity: activity.title || activity.name || 'Sin nombre',
            coordinates: activity.coordinates
          });
        }

        // Verificar coordenadas
        if (activity.coordinates && activity.coordinates.lat && activity.coordinates.lng) {
          activitiesWithCoordinates++;
        } else {
          report.dataQuality.activitiesWithoutCoordinates.push({
            day: day.day,
            activity: activity.title || activity.name || 'Sin nombre',
            cityName: activity.cityName || activity.city
          });
        }
      });
    });

    const cityPercentage = Math.round((activitiesWithCity / totalActivities) * 100);
    const coordsPercentage = Math.round((activitiesWithCoordinates / totalActivities) * 100);

    console.log(`   Total actividades: ${totalActivities}`);
    console.log(`   Con cityName/city: ${activitiesWithCity} (${cityPercentage}%)`);
    console.log(`   Con coordenadas: ${activitiesWithCoordinates} (${coordsPercentage}%)`);

    // CRÍTICO: Si menos del 50% tiene ciudad
    if (cityPercentage < 50) {
      report.issues.critical.push(
        `Solo ${cityPercentage}% de actividades tienen cityName/city. Se necesita ≥50%`
      );
      report.healthy = false;
    } else if (cityPercentage < 80) {
      report.issues.warnings.push(
        `${cityPercentage}% de actividades tienen cityName/city. Recomendado: ≥80%`
      );
    }

    // WARNING: Si menos del 70% tiene coordenadas
    if (coordsPercentage < 70) {
      report.issues.warnings.push(
        `Solo ${coordsPercentage}% de actividades tienen coordenadas. Recomendado: ≥80%`
      );
    }

    if (report.dataQuality.activitiesWithoutCity.length > 0) {
      console.warn(`   ⚠️ ${report.dataQuality.activitiesWithoutCity.length} actividades sin cityName/city`);
    }

    if (report.dataQuality.activitiesWithoutCoordinates.length > 0) {
      console.warn(`   ⚠️ ${report.dataQuality.activitiesWithoutCoordinates.length} actividades sin coordenadas`);
    }
  },

  /**
   * Detecta días con actividades mezcladas de múltiples ciudades
   */
  _detectMixedDays(itinerary, report) {
    console.log('\n🔀 Detectando días mezclados...');

    itinerary.days.forEach(day => {
      if (!day.activities || day.activities.length < 2) return;

      // Contar actividades por ciudad
      const cityCounts = {};

      day.activities.forEach(activity => {
        const city = HotelBaseSystem.normalizeCityName(activity.cityName || activity.city || '');
        if (!city || city === 'Tokyo') return; // Skip desconocidas o Tokyo (por defecto)

        cityCounts[city] = (cityCounts[city] || 0) + 1;
      });

      const cities = Object.keys(cityCounts);

      // Si hay 2+ ciudades, es un día mezclado
      if (cities.length >= 2) {
        const cityList = cities.map(c => `${c} (${cityCounts[c]})`).join(', ');

        report.dataQuality.mixedDays.push({
          day: day.day,
          cities: cities,
          distribution: cityCounts,
          totalActivities: day.activities.length
        });

        report.issues.warnings.push(
          `Día ${day.day} tiene actividades mezcladas: ${cityList}`
        );

        console.warn(`   ⚠️ Día ${day.day}: ${cityList}`);
      }
    });

    if (report.dataQuality.mixedDays.length === 0) {
      console.log('   ✅ No se detectaron días mezclados');
    } else {
      console.warn(`   ⚠️ ${report.dataQuality.mixedDays.length} días mezclados detectados`);
    }
  },

  /**
   * Analiza distribución de ciudades en el itinerario
   */
  _analyzeCityDistribution(itinerary, report) {
    console.log('\n🗺️ Analizando distribución de ciudades...');

    const cityDays = {};

    itinerary.days.forEach(day => {
      const city = HotelBaseSystem.detectCityForDay(day);
      const normalized = HotelBaseSystem.normalizeCityName(city);

      if (!cityDays[normalized]) {
        cityDays[normalized] = [];
      }
      cityDays[normalized].push(day.day);
    });

    report.cityDistribution = cityDays;

    Object.entries(cityDays).forEach(([city, days]) => {
      console.log(`   ${city}: ${days.length} días (${days.join(', ')})`);
    });

    // Verificar que actividades problemáticas tengan días asignados
    const uniqueCities = Object.keys(cityDays);
    report.issues.suggestions.push(
      `Ciudades detectadas en el itinerario: ${uniqueCities.join(', ')}`
    );
  },

  /**
   * Valida que hoteles estén configurados para las ciudades necesarias
   */
  _validateHotels(itinerary, report) {
    console.log('\n🏨 Validando hoteles configurados...');

    const citiesNeeded = Object.keys(report.cityDistribution);
    const hotelsMissing = [];

    citiesNeeded.forEach(city => {
      const hotel = HotelBaseSystem.getHotelForCity(itinerary, city, 1);

      if (!hotel || !hotel.coordinates) {
        hotelsMissing.push(city);
        report.issues.warnings.push(`No hay hotel configurado para ${city}`);
        console.warn(`   ⚠️ Falta hotel para: ${city}`);
      } else {
        console.log(`   ✅ Hotel configurado para: ${city}`);
      }
    });

    if (hotelsMissing.length > 0) {
      report.issues.suggestions.push(
        `Configura hoteles para: ${hotelsMissing.join(', ')}`
      );
    }
  },

  /**
   * Calcula score de salud (0-100)
   */
  _calculateHealthScore(report) {
    let score = 100;

    // Penalizar por problemas críticos
    score -= report.issues.critical.length * 30;

    // Penalizar por warnings
    score -= report.issues.warnings.length * 10;

    // Penalizar por días mezclados
    score -= report.dataQuality.mixedDays.length * 5;

    // Penalizar por actividades sin datos
    score -= report.dataQuality.activitiesWithoutCity.length * 2;
    score -= report.dataQuality.activitiesWithoutCoordinates.length * 1;

    report.score = Math.max(0, score);
    report.healthy = score >= 70; // Saludable si ≥70
  },

  /**
   * Genera recomendaciones basadas en problemas detectados
   */
  _generateRecommendations(report) {
    if (report.dataQuality.activitiesWithoutCity.length > 0) {
      report.recommendations.push(
        `Agrega cityName o city a ${report.dataQuality.activitiesWithoutCity.length} actividades sin ciudad`
      );
    }

    if (report.dataQuality.mixedDays.length > 0) {
      report.recommendations.push(
        `PASO 9 intentará separar automáticamente ${report.dataQuality.mixedDays.length} días mezclados`
      );
    }

    if (report.dataQuality.activitiesWithoutCoordinates.length > 0) {
      report.recommendations.push(
        `Agrega coordenadas a ${report.dataQuality.activitiesWithoutCoordinates.length} actividades para mejor precisión`
      );
    }
  },

  /**
   * Imprime reporte de salud
   */
  _printReport(report) {
    console.log('\n🏥 ═══════════════════════════════════════');
    console.log('🏥 REPORTE DE SALUD DEL ITINERARIO');
    console.log('🏥 ═══════════════════════════════════════\n');

    // Score
    const scoreEmoji = report.score >= 90 ? '💚' : report.score >= 70 ? '💛' : '🔴';
    console.log(`${scoreEmoji} Score de Salud: ${report.score}/100`);
    console.log(`   Estado: ${report.healthy ? '✅ SALUDABLE' : '❌ NECESITA ATENCIÓN'}\n`);

    // Problemas críticos
    if (report.issues.critical.length > 0) {
      console.error('🔴 PROBLEMAS CRÍTICOS:');
      report.issues.critical.forEach(issue => {
        console.error(`   ❌ ${issue}`);
      });
      console.log('');
    }

    // Warnings
    if (report.issues.warnings.length > 0) {
      console.warn('⚠️ ADVERTENCIAS:');
      report.issues.warnings.forEach(issue => {
        console.warn(`   ⚠️ ${issue}`);
      });
      console.log('');
    }

    // Recomendaciones
    if (report.recommendations.length > 0) {
      console.log('💡 RECOMENDACIONES:');
      report.recommendations.forEach(rec => {
        console.log(`   → ${rec}`);
      });
      console.log('');
    }

    console.log('🏥 ═══════════════════════════════════════\n');
  }
};

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.ItineraryHealthChecker = ItineraryHealthChecker;
}

export default ItineraryHealthChecker;
