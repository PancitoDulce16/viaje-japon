// js/itinerary-intelligence-validator.js - Validador de Inteligencia del Itinerario
// Detecta y RECHAZA itinerarios ilógicos, incoherentes o poco prácticos

import { RouteOptimizer } from './route-optimizer-v2.js';

/**
 * 🚫 DISTANCE VALIDATOR
 * Rechaza días con distancias absurdas entre actividades
 */
export const DistanceValidator = {
  // Límites de distancia por tipo de transporte
  DISTANCE_LIMITS: {
    WALKING: 2,        // Máximo 2km caminando entre actividades
    LOCAL_TRAIN: 5,    // Máximo 5km en tren local (mismo barrio/zona)
    SUBWAY: 10,        // Máximo 10km en metro (dentro de misma ciudad)
    SHINKANSEN: 50     // Shinkansen = CAMBIO DE CIUDAD (nunca en mismo día)
  },

  /**
   * Valida que un día NO tenga distancias absurdas
   * @param {Object} day
   * @returns {Object} { valid: boolean, errors: [], warnings: [] }
   */
  validateDayDistances(day) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      maxDistance: 0,
      totalDistance: 0,
      transportType: 'walking'
    };

    if (!day.activities || day.activities.length < 2) {
      return result;
    }

    // Calcular distancias entre actividades consecutivas
    for (let i = 0; i < day.activities.length - 1; i++) {
      const act1 = day.activities[i];
      const act2 = day.activities[i + 1];

      if (!act1.coordinates || !act2.coordinates) continue;

      const distance = RouteOptimizer.calculateDistance(act1.coordinates, act2.coordinates);
      result.totalDistance += distance;

      if (distance > result.maxDistance) {
        result.maxDistance = distance;
      }

      // 🚨 CRÍTICO: Distancia de Shinkansen en mismo día
      if (distance > this.DISTANCE_LIMITS.SHINKANSEN) {
        result.valid = false;
        result.errors.push({
          type: 'SHINKANSEN_IN_SAME_DAY',
          severity: 'CRITICAL',
          message: `❌ ILÓGICO: ${act1.title || act1.name} → ${act2.title || act2.name} (${distance.toFixed(1)}km)`,
          detail: 'Esta distancia requiere Shinkansen. El Shinkansen es para CAMBIOS DE CIUDAD, no para actividades del mismo día.',
          activities: [act1, act2],
          distance: distance
        });
      }
      // 🚨 ERROR: Distancia muy larga (>10km)
      else if (distance > this.DISTANCE_LIMITS.SUBWAY) {
        result.valid = false;
        result.errors.push({
          type: 'EXCESSIVE_DISTANCE',
          severity: 'HIGH',
          message: `❌ Distancia excesiva: ${act1.title || act1.name} → ${act2.title || act2.name} (${distance.toFixed(1)}km)`,
          detail: 'Las actividades del mismo día deberían estar en la misma zona o zonas adyacentes (máximo 10km).',
          activities: [act1, act2],
          distance: distance
        });
      }
      // ⚠️ WARNING: Distancia considerable (5-10km)
      else if (distance > this.DISTANCE_LIMITS.LOCAL_TRAIN) {
        result.warnings.push({
          type: 'LONG_DISTANCE',
          severity: 'MEDIUM',
          message: `⚠️ Distancia considerable: ${act1.title || act1.name} → ${act2.title || act2.name} (${distance.toFixed(1)}km)`,
          detail: 'Considera agrupar actividades más cercanas para reducir tiempo de traslado.',
          activities: [act1, act2],
          distance: distance
        });
      }
    }

    // Determinar tipo de transporte necesario
    if (result.maxDistance > this.DISTANCE_LIMITS.SUBWAY) {
      result.transportType = 'shinkansen';
    } else if (result.maxDistance > this.DISTANCE_LIMITS.LOCAL_TRAIN) {
      result.transportType = 'subway';
    } else if (result.maxDistance > this.DISTANCE_LIMITS.WALKING) {
      result.transportType = 'local_train';
    }

    return result;
  },

  /**
   * Valida todo el itinerario
   * @param {Object} itinerary
   * @returns {Object} Reporte completo
   */
  validateItinerary(itinerary) {
    console.log('🔍 Validando distancias del itinerario...');

    const report = {
      valid: true,
      daysWithErrors: [],
      daysWithWarnings: [],
      totalErrors: 0,
      totalWarnings: 0
    };

    itinerary.days.forEach(day => {
      const validation = this.validateDayDistances(day);

      if (!validation.valid) {
        report.valid = false;
        report.daysWithErrors.push({
          day: day.day,
          errors: validation.errors,
          maxDistance: validation.maxDistance
        });
        report.totalErrors += validation.errors.length;
      }

      if (validation.warnings.length > 0) {
        report.daysWithWarnings.push({
          day: day.day,
          warnings: validation.warnings,
          maxDistance: validation.maxDistance
        });
        report.totalWarnings += validation.warnings.length;
      }
    });

    if (!report.valid) {
      console.error(`❌ ITINERARIO INVÁLIDO: ${report.totalErrors} errores críticos`);
      report.daysWithErrors.forEach(d => {
        console.error(`   Día ${d.day}: ${d.errors.length} errores (máx ${d.maxDistance.toFixed(1)}km)`);
        d.errors.forEach(err => {
          console.error(`      ${err.message}`);
        });
      });
    } else {
      console.log('✅ Distancias válidas en todo el itinerario');
    }

    if (report.totalWarnings > 0) {
      console.warn(`⚠️ ${report.totalWarnings} advertencias de distancia`);
    }

    return report;
  }
};

/**
 * 🛍️ SHOPPING EXPERIENCE SYSTEM
 * Detecta y categoriza experiencias de shopping en Japón
 */
export const ShoppingExperienceSystem = {
  // Categorías de shopping emblemáticas de Japón
  SHOPPING_CATEGORIES: {
    ANIME_OTAKU: {
      name: 'Anime & Otaku',
      keywords: ['akihabara', 'anime', 'manga', 'otaku', 'figure', 'pokemon', 'nintendo', 'gaming'],
      emblematicStores: ['Akihabara Electric Town', 'Pokemon Center', 'Jump Shop', 'Animate'],
      recommendedPhase: 'exploration', // Día 3-6
      intensity: 'high' // Requiere energía (muchas tiendas)
    },
    FASHION_CLOTHING: {
      name: 'Moda & Ropa',
      keywords: ['shibuya 109', 'harajuku', 'takeshita', 'fashion', 'clothing', 'streetwear', 'uniqlo'],
      emblematicStores: ['Shibuya 109', 'Takeshita Street', 'Cat Street', 'Uniqlo Flagship'],
      recommendedPhase: 'exploration',
      intensity: 'medium'
    },
    SNACKS_FOOD: {
      name: 'Snacks & Dulces',
      keywords: ['don quijote', 'donki', 'dagashi', 'kit kat', 'pocky', 'convenience', 'snack'],
      emblematicStores: ['Don Quijote', 'Tokyo Solamachi', 'Asakusa Nakamise'],
      recommendedPhase: 'closure', // Últimos días (souvenirs)
      intensity: 'low'
    },
    ELECTRONICS: {
      name: 'Electrónica',
      keywords: ['yodobashi', 'bic camera', 'electronics', 'camera', 'gadget'],
      emblematicStores: ['Yodobashi Akiba', 'Bic Camera Shinjuku'],
      recommendedPhase: 'exploration',
      intensity: 'medium'
    },
    LUXURY_DEPARTMENT: {
      name: 'Tiendas Departamentales',
      keywords: ['ginza', 'isetan', 'takashimaya', 'mitsukoshi', 'department store', 'luxury'],
      emblematicStores: ['Ginza Six', 'Isetan Shinjuku', 'Takashimaya'],
      recommendedPhase: 'deepDive',
      intensity: 'low'
    },
    SOUVENIRS_TRADITIONAL: {
      name: 'Souvenirs Tradicionales',
      keywords: ['nakamise', 'souvenir', 'traditional', 'omiyage', 'craft'],
      emblematicStores: ['Nakamise Street Asakusa', 'Nishiki Market Kyoto'],
      recommendedPhase: 'closure', // Últimos días
      intensity: 'low'
    }
  },

  /**
   * Detecta si una actividad es de shopping
   * @param {Object} activity
   * @returns {Object|null} Categoría de shopping o null
   */
  detectShoppingCategory(activity) {
    const title = (activity.title || activity.name || '').toLowerCase();
    const category = (activity.category || '').toLowerCase();
    const subCategory = (activity.subCategory || '').toLowerCase();
    const description = (activity.description || '').toLowerCase();

    const searchText = `${title} ${category} ${subCategory} ${description}`;

    // Check if it's shopping related
    if (!searchText.includes('shop') && !searchText.includes('store') &&
        !searchText.includes('market') && !searchText.includes('mall') &&
        category !== 'shopping') {
      return null;
    }

    // Detectar categoría específica
    for (const [key, cat] of Object.entries(this.SHOPPING_CATEGORIES)) {
      for (const keyword of cat.keywords) {
        if (searchText.includes(keyword)) {
          return {
            categoryKey: key,
            ...cat
          };
        }
      }
    }

    // Shopping genérico
    return {
      categoryKey: 'GENERIC',
      name: 'Shopping General',
      recommendedPhase: 'exploration',
      intensity: 'medium'
    };
  },

  /**
   * Analiza el balance de shopping en el itinerario
   * @param {Object} itinerary
   * @returns {Object} Análisis
   */
  analyzeShoppingBalance(itinerary) {
    const analysis = {
      totalShoppingActivities: 0,
      byCategory: {},
      byDay: {},
      recommendations: []
    };

    // Inicializar categorías
    Object.keys(this.SHOPPING_CATEGORIES).forEach(key => {
      analysis.byCategory[key] = 0;
    });

    // Analizar cada día
    itinerary.days.forEach(day => {
      analysis.byDay[day.day] = [];

      if (day.activities) {
        day.activities.forEach(activity => {
          const shoppingCat = this.detectShoppingCategory(activity);

          if (shoppingCat) {
            analysis.totalShoppingActivities++;
            if (shoppingCat.categoryKey !== 'GENERIC') {
              analysis.byCategory[shoppingCat.categoryKey]++;
            }
            analysis.byDay[day.day].push({
              activity: activity.title || activity.name,
              category: shoppingCat.name
            });
          }
        });
      }
    });

    // Generar recomendaciones
    if (analysis.totalShoppingActivities === 0) {
      analysis.recommendations.push({
        type: 'missing',
        severity: 'HIGH',
        message: '🛍️ ¡Falta shopping! Japón es famoso por sus experiencias de compra.',
        suggestions: [
          'Akihabara para anime/gaming (Días 3-6)',
          'Harajuku/Shibuya para moda (Días 3-6)',
          'Don Quijote para snacks/souvenirs (Últimos días)'
        ]
      });
    }

    // Recomendar categorías faltantes emblemáticas
    if (analysis.byCategory.ANIME_OTAKU === 0) {
      analysis.recommendations.push({
        type: 'missing_category',
        severity: 'MEDIUM',
        message: '🎮 Considera agregar Akihabara (shopping de anime/gaming)',
        category: 'ANIME_OTAKU',
        emblematicStores: this.SHOPPING_CATEGORIES.ANIME_OTAKU.emblematicStores
      });
    }

    if (analysis.byCategory.SNACKS_FOOD === 0) {
      analysis.recommendations.push({
        type: 'missing_category',
        severity: 'MEDIUM',
        message: '🍬 Considera agregar Don Quijote o tiendas de snacks',
        category: 'SNACKS_FOOD',
        emblematicStores: this.SHOPPING_CATEGORIES.SNACKS_FOOD.emblematicStores
      });
    }

    console.log(`🛍️ Shopping Balance: ${analysis.totalShoppingActivities} actividades`);
    Object.entries(analysis.byCategory).forEach(([key, count]) => {
      if (count > 0) {
        console.log(`   ${this.SHOPPING_CATEGORIES[key].name}: ${count}`);
      }
    });

    return analysis;
  }
};

/**
 * 📅 DAY COHERENCE VALIDATOR
 * Valida que cada día tenga coherencia temática y geográfica
 */
export const DayCoherenceValidator = {
  /**
   * Valida coherencia de un día
   * @param {Object} day
   * @param {number} dayNumber
   * @param {number} totalDays
   * @returns {Object} Validación
   */
  validateDayCoherence(day, dayNumber, totalDays) {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      coherenceScore: 100
    };

    if (!day.activities || day.activities.length === 0) {
      return validation;
    }

    // VALIDACIÓN 1: Día 1 NO debe tener actividades intensas o lejanas
    if (dayNumber === 1) {
      const inappropriateActivities = [];

      day.activities.forEach(activity => {
        const title = (activity.title || activity.name || '').toLowerCase();

        // ❌ NO apropiado para día 1
        const notDay1Appropriate = [
          'akihabara',  // Intenso, muchas tiendas
          'onsen',
          'hiking',
          'mount',
          'nightlife'
        ];

        for (const keyword of notDay1Appropriate) {
          if (title.includes(keyword)) {
            inappropriateActivities.push({
              activity: activity.title || activity.name,
              reason: `"${keyword}" no es apropiado para día 1 con jetlag`
            });
            validation.coherenceScore -= 20;
          }
        }
      });

      if (inappropriateActivities.length > 0) {
        validation.valid = false;
        validation.errors.push({
          type: 'DAY1_INAPPROPRIATE',
          severity: 'HIGH',
          message: `❌ Día 1 tiene actividades inapropiadas para jetlag`,
          activities: inappropriateActivities,
          suggestion: 'Día 1 debe tener actividades emblemáticas PERO ligeras y cercanas (templos, jardines, áreas céntricas)'
        });
      }
    }

    // VALIDACIÓN 2: Coherencia geográfica (zonas mezcladas)
    const zones = new Set();
    day.activities.forEach(activity => {
      const area = (activity.area || activity.zone || '').toLowerCase();
      if (area) {
        zones.add(area);
      }
    });

    if (zones.size > 3) {
      validation.warnings.push({
        type: 'TOO_MANY_ZONES',
        severity: 'MEDIUM',
        message: `⚠️ Día ${dayNumber} visita ${zones.size} zonas diferentes`,
        zones: Array.from(zones),
        suggestion: 'Considera agrupar actividades en 2-3 zonas adyacentes máximo'
      });
      validation.coherenceScore -= 10;
    }

    // VALIDACIÓN 3: Balance de tipos de actividades
    const types = {
      culture: 0,
      food: 0,
      shopping: 0,
      nature: 0,
      entertainment: 0
    };

    day.activities.forEach(activity => {
      const category = (activity.category || '').toLowerCase();
      if (types.hasOwnProperty(category)) {
        types[category]++;
      }
    });

    // Si el día es SOLO de un tipo (excepto días especiales)
    const nonZeroTypes = Object.values(types).filter(v => v > 0).length;
    if (nonZeroTypes === 1 && day.activities.length > 3) {
      validation.warnings.push({
        type: 'MONOTONOUS_DAY',
        severity: 'LOW',
        message: `⚠️ Día ${dayNumber} solo tiene un tipo de actividad`,
        suggestion: 'Considera agregar variedad (cultura + food + shopping, etc.)'
      });
      validation.coherenceScore -= 5;
    }

    validation.valid = validation.errors.length === 0;
    return validation;
  },

  /**
   * Valida coherencia de todo el itinerario
   * @param {Object} itinerary
   * @returns {Object} Reporte
   */
  validateItineraryCoherence(itinerary) {
    console.log('🔍 Validando coherencia del itinerario...');

    const report = {
      valid: true,
      daysWithErrors: [],
      daysWithWarnings: [],
      averageCoherence: 0
    };

    let totalCoherence = 0;

    itinerary.days.forEach((day, index) => {
      const validation = this.validateDayCoherence(day, day.day, itinerary.days.length);
      totalCoherence += validation.coherenceScore;

      if (!validation.valid) {
        report.valid = false;
        report.daysWithErrors.push({
          day: day.day,
          errors: validation.errors,
          coherence: validation.coherenceScore
        });
      }

      if (validation.warnings.length > 0) {
        report.daysWithWarnings.push({
          day: day.day,
          warnings: validation.warnings,
          coherence: validation.coherenceScore
        });
      }
    });

    report.averageCoherence = Math.round(totalCoherence / itinerary.days.length);

    if (!report.valid) {
      console.error(`❌ Itinerario tiene problemas de coherencia`);
      report.daysWithErrors.forEach(d => {
        console.error(`   Día ${d.day}: ${d.errors.length} errores (coherencia: ${d.coherence}/100)`);
      });
    } else {
      console.log(`✅ Coherencia promedio: ${report.averageCoherence}/100`);
    }

    return report;
  }
};

/**
 * 🧠 MASTER VALIDATOR
 * Ejecuta todas las validaciones
 */
export const MasterValidator = {
  /**
   * Valida itinerario completo con todas las reglas
   * @param {Object} itinerary
   * @returns {Object} Reporte completo
   */
  validateCompleteItinerary(itinerary, options = {}) {
    // 🔥 MODO SIMPLIFICADO (default): Solo errores críticos
    const verbose = options.verbose || false;

    console.log('🔍 ═══════════════════════════════════════');
    console.log('🔍 VALIDACIÓN DE ITINERARIO (MODO SIMPLE)');
    console.log('🔍 ═══════════════════════════════════════\n');

    const report = {
      valid: true,
      timestamp: new Date().toISOString(),
      validations: {},
      summary: {
        totalErrors: 0,
        totalWarnings: 0,
        criticalIssues: []
      }
    };

    // ✅ VALIDACIÓN CRÍTICA 1: Distancias imposibles
    console.log('📏 Validando distancias entre actividades...');
    report.validations.distances = DistanceValidator.validateItinerary(itinerary);
    if (!report.validations.distances.valid) {
      report.valid = false;
      report.summary.totalErrors += report.validations.distances.totalErrors;
      report.summary.criticalIssues.push('Distancias excesivas entre actividades');
    }
    // Solo contar warnings críticos (>10km), no los de 5-10km
    const criticalWarnings = report.validations.distances.daysWithWarnings?.filter(
      d => d.maxDistance > 10
    ).length || 0;
    report.summary.totalWarnings += criticalWarnings;

    // ❌ VALIDACIONES OPCIONALES DESACTIVADAS (pueden activarse con verbose:true)
    if (verbose) {
      // Solo ejecutar si el usuario lo pide explícitamente
      console.log('\n🎯 Validación 2: Coherencia de días...');
      report.validations.coherence = DayCoherenceValidator.validateItineraryCoherence(itinerary);

      console.log('\n🛍️ Análisis 3: Experiencias de shopping...');
      report.validations.shopping = ShoppingExperienceSystem.analyzeShoppingBalance(itinerary);
    } else {
      // Modo simple: Skip estas validaciones
      report.validations.coherence = { valid: true, daysWithErrors: [], daysWithWarnings: [], skipped: true };
      report.validations.shopping = { recommendations: [], skipped: true };
    }

    // Resumen final - SOLO errores críticos
    console.log('\n🔍 ═══════════════════════════════════════');
    if (report.valid) {
      console.log('✅ ITINERARIO VÁLIDO');
    } else {
      console.error('❌ ERRORES CRÍTICOS ENCONTRADOS');
      console.error(`   Total: ${report.summary.totalErrors} errores`);
      report.summary.criticalIssues.forEach(issue => {
        console.error(`   • ${issue}`);
      });
    }
    if (report.summary.totalWarnings > 0) {
      console.warn(`   ⚠️  ${report.summary.totalWarnings} advertencias`);
    }
    console.log('🔍 ═══════════════════════════════════════\n');

    return report;
  }
};

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.DistanceValidator = DistanceValidator;
  window.ShoppingExperienceSystem = ShoppingExperienceSystem;
  window.DayCoherenceValidator = DayCoherenceValidator;
  window.MasterValidator = MasterValidator;
}

export default MasterValidator;
