// js/master-itinerary-optimizer.js - Sistema Maestro de Optimización Inteligente
// Arquitectura modular que entiende el viaje como una narrativa completa
// VERSION: 2025-11-12-V2-CLEAN-DETECTION

console.log('🚀 ═══════════════════════════════════════════════════════════════');
console.log('🚀 MASTER OPTIMIZER v2025-11-12-V2-CLEAN-DETECTION');
console.log('🚀 ✨ NUEVA ARQUITECTURA V2:');
console.log('🚀    ✅ CityDetectionV2: Detección robusta sin bugs');
console.log('🚀    ✅ AutoCorrectionV2: Corrección simplificada y funcional');
console.log('🚀    ✅ Sin hardcoded cities, sin tratamiento especial de Tokyo');
console.log('🚀 ═══════════════════════════════════════════════════════════════');

import { RouteOptimizer } from '../../map/route-optimizer-v2.js';
import { HotelBaseSystem } from '../../api/hotel-base-system.js';
import { MasterValidator, DistanceValidator } from './itinerary-intelligence-validator.js';
import { ItineraryHealthChecker } from './itinerary-health-checker.js';
import { CityDetectionV2 } from '../../ai/city-detection-v2.js';
import { AutoCorrectionV2 } from './auto-correction-v2.js';

/**
 * 1️⃣ TRIP CONTEXT ANALYZER
 * Analiza el contexto completo del viaje para entender su estructura
 */
export const TripContextAnalyzer = {
  /**
   * Detecta el flujo de ciudades y segmentos del viaje
   * @param {Object} itinerary
   * @returns {Object} Trip context con flujo, fases y transiciones
   */
  analyzeTripContext(itinerary) {
    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
      return null;
    }

    console.log('🌍 Analizando contexto del viaje completo...');

    const cityFlow = this.detectCityFlow(itinerary);
    const phases = this.detectTripPhases(itinerary);
    const transitions = this.detectTransitionDays(cityFlow);

    const context = {
      cityFlow,
      phases,
      transitions,
      totalDays: itinerary.days.length
    };

    console.log('✅ Contexto analizado:', context);
    return context;
  },

  /**
   * Detecta la secuencia de ciudades en el viaje
   * @param {Object} itinerary
   * @returns {Array} Flujo de ciudades con días y fase
   */
  detectCityFlow(itinerary) {
    const flow = [];
    let currentCity = null;
    let currentSegment = null;

    itinerary.days.forEach((day, index) => {
      // 🔥 USANDO CityDetectionV2 - Sistema robusto sin bugs
      const detection = CityDetectionV2.detectDayCity(day);
      const city = detection.city || 'Unknown';

      if (city !== currentCity) {
        // Nueva ciudad - guardar segmento anterior si existe
        if (currentSegment) {
          flow.push(currentSegment);
        }

        // Crear nuevo segmento
        currentSegment = {
          city: city,
          startDay: day.day,
          endDay: day.day,
          days: [day.day],
          phase: this.calculateSegmentPhase(index, itinerary.days.length)
        };
        currentCity = city;
      } else {
        // Misma ciudad - agregar día al segmento actual
        currentSegment.endDay = day.day;
        currentSegment.days.push(day.day);
      }
    });

    // Agregar último segmento
    if (currentSegment) {
      flow.push(currentSegment);
    }

    console.log(`📍 Flujo de ciudades detectado: ${flow.length} segmentos`);
    flow.forEach(segment => {
      console.log(`   ${segment.city}: Días ${segment.startDay}-${segment.endDay} (${segment.phase})`);
    });

    return flow;
  },

  /**
   * Calcula la fase del segmento en el viaje
   * @param {number} index - Índice del día
   * @param {number} totalDays - Total de días
   * @returns {string} Fase (arrival, exploration, deepDive, closure, departure)
   */
  calculateSegmentPhase(index, totalDays) {
    const percentage = (index + 1) / totalDays;

    if (index === 0) return 'arrival';
    if (index === totalDays - 1) return 'departure';
    if (percentage <= 0.3) return 'exploration';
    if (percentage <= 0.7) return 'deepDive';
    return 'closure';
  },

  /**
   * Detecta las fases del viaje completo
   * @param {Object} itinerary
   * @returns {Array} Fases con días y características
   */
  detectTripPhases(itinerary) {
    const totalDays = itinerary.days.length;
    const phases = [];

    // FASE 1: Arrival (Días 1-2)
    phases.push({
      name: 'arrival',
      label: '🛬 Llegada & Adaptación',
      days: [1, 2].filter(d => d <= totalDays),
      intensity: 'low',
      maxActivitiesPerDay: 3,
      characteristics: [
        'Jetlag-friendly',
        'Lugares icónicos',
        'Actividades ligeras',
        'Cerca del hotel'
      ],
      priorityFactors: ['iconicScore', 'proximity', 'easiness']
    });

    // FASE 2: Exploration (Días 3-40% del viaje)
    const explorationEnd = Math.ceil(totalDays * 0.4);
    if (totalDays >= 3) {
      phases.push({
        name: 'exploration',
        label: '🗺️ Exploración',
        days: Array.from({ length: explorationEnd - 2 }, (_, i) => i + 3).filter(d => d <= totalDays),
        intensity: 'medium',
        maxActivitiesPerDay: 5,
        characteristics: [
          'Cuerpo adaptado',
          'Mix de actividades',
          'Mayor distancia OK',
          'Diversidad'
        ],
        priorityFactors: ['diversity', 'proximity', 'interest']
      });
    }

    // FASE 3: Deep Dive (40%-70% del viaje)
    const deepDiveStart = explorationEnd + 1;
    const deepDiveEnd = Math.ceil(totalDays * 0.7);
    if (deepDiveStart <= totalDays) {
      phases.push({
        name: 'deepDive',
        label: '🎌 Inmersión Profunda',
        days: Array.from({ length: deepDiveEnd - deepDiveStart + 1 }, (_, i) => i + deepDiveStart).filter(d => d <= totalDays),
        intensity: 'medium-high',
        maxActivitiesPerDay: 6,
        characteristics: [
          'Experiencias únicas',
          'Lugares menos turísticos',
          'Actividades auténticas',
          'Mayor flexibilidad'
        ],
        priorityFactors: ['authenticity', 'uniqueness', 'localExperience']
      });
    }

    // FASE 4: Closure (70%-última día)
    const closureStart = deepDiveEnd + 1;
    if (closureStart < totalDays) {
      phases.push({
        name: 'closure',
        label: '🛍️ Cierre & Despedidas',
        days: Array.from({ length: totalDays - closureStart }, (_, i) => i + closureStart),
        intensity: 'low-medium',
        maxActivitiesPerDay: 4,
        characteristics: [
          'Últimas compras',
          'Lugares favoritos',
          'Souvenirs',
          'Preparar regreso'
        ],
        priorityFactors: ['convenience', 'shopping', 'favorites']
      });
    }

    // FASE 5: Departure (Último día)
    phases.push({
      name: 'departure',
      label: '✈️ Salida',
      days: [totalDays],
      intensity: 'very-low',
      maxActivitiesPerDay: 2,
      characteristics: [
        'Check-out',
        'Rumbo al aeropuerto',
        'Solo actividades cercanas',
        'Tiempo flexible'
      ],
      priorityFactors: ['proximity', 'time', 'flexibility']
    });

    console.log(`📖 Fases del viaje detectadas: ${phases.length}`);
    phases.forEach(phase => {
      console.log(`   ${phase.label}: Días ${phase.days.join(', ')} (intensidad: ${phase.intensity})`);
    });

    return phases;
  },

  /**
   * Detecta días de transición entre ciudades
   * @param {Array} cityFlow
   * @returns {Array} Días de transición con info
   */
  detectTransitionDays(cityFlow) {
    const transitions = [];

    for (let i = 0; i < cityFlow.length - 1; i++) {
      const currentSegment = cityFlow[i];
      const nextSegment = cityFlow[i + 1];

      transitions.push({
        day: currentSegment.endDay,
        from: currentSegment.city,
        to: nextSegment.city,
        type: 'city-change',
        splitDay: true // Este día debe dividirse en pre/post transición
      });
    }

    if (transitions.length > 0) {
      console.log(`🔄 Días de transición detectados: ${transitions.length}`);
      transitions.forEach(t => {
        console.log(`   Día ${t.day}: ${t.from} → ${t.to}`);
      });
    }

    return transitions;
  },

  /**
   * Obtiene la fase de un día específico
   * @param {number} dayNumber
   * @param {Array} phases
   * @returns {Object} Fase correspondiente
   */
  getPhaseForDay(dayNumber, phases) {
    // Para viajes cortos (2-3 días) los rangos de fase pueden solaparse en el
    // último día (ej: aparece en 'arrival', 'deepDive' Y 'departure' a la
    // vez). 'departure' es la regla de negocio más estricta (día de salida,
    // siempre exactamente 1 día), así que tiene prioridad sobre cualquier
    // otra fase que también reclame ese día.
    const departure = phases.find(phase => phase.name === 'departure' && phase.days.includes(dayNumber));
    if (departure) return departure;
    return phases.find(phase => phase.days.includes(dayNumber)) || null;
  },

  /**
   * Verifica si un día es de transición
   * @param {number} dayNumber
   * @param {Array} transitions
   * @returns {Object|null} Información de transición si existe
   */
  isTransitionDay(dayNumber, transitions) {
    return transitions.find(t => t.day === dayNumber) || null;
  }
};

/**
 * 2️⃣ GEOGRAPHIC CLUSTERING SYSTEM
 * Agrupa actividades por zonas geográficas para optimizar distancias
 */
export const GeographicClusteringSystem = {
  /**
   * Crea clusters geográficos de actividades
   * @param {Array} activities
   * @param {string} city
   * @returns {Array} Clusters con actividades agrupadas
   */
  clusterActivitiesByZone(activities, city) {
    console.log(`📍 Agrupando actividades por zona en ${city}...`);

    // Zonas conocidas de Japón
    const knownZones = this.getKnownZones(city);

    // Crear clusters por zona conocida
    const clusters = [];
    const unassigned = [];

    activities.forEach(activity => {
      const zone = this.detectActivityZone(activity, knownZones);

      if (zone) {
        // Buscar cluster existente para esta zona
        let cluster = clusters.find(c => c.zoneId === zone.id);

        if (!cluster) {
          cluster = {
            zoneId: zone.id,
            zoneName: zone.name,
            city: city,
            center: zone.center,
            activities: [],
            iconicScore: 0,
            averagePopularity: 0
          };
          clusters.push(cluster);
        }

        cluster.activities.push(activity);
      } else {
        unassigned.push(activity);
      }
    });

    // Calcular métricas de cada cluster
    clusters.forEach(cluster => {
      cluster.iconicScore = this.calculateClusterIconicScore(cluster.activities);
      cluster.averagePopularity = this.calculateAveragePopularity(cluster.activities);
      cluster.activityCount = cluster.activities.length;
    });

    // Crear clusters para actividades no asignadas usando K-means
    if (unassigned.length > 0) {
      const dynamicClusters = this.createDynamicClusters(unassigned, 3);
      clusters.push(...dynamicClusters);
    }

    console.log(`✅ ${clusters.length} clusters creados`);
    clusters.forEach(c => {
      console.log(`   ${c.zoneName}: ${c.activityCount} actividades (iconic: ${c.iconicScore}/100)`);
    });

    return clusters;
  },

  /**
   * Obtiene zonas conocidas de una ciudad
   * @param {string} city
   * @returns {Array} Zonas con nombre y coordenadas
   */
  getKnownZones(city) {
    const zones = {
      'Tokyo': [
        // Zonas MÁS ESTRICTAS (radius reducido para mejor agrupación)
        { id: 'asakusa', name: 'Asakusa', center: { lat: 35.7148, lng: 139.7967 }, radius: 1.0,
          shoppingType: 'traditional', day1Appropriate: true, intensity: 'low' },
        { id: 'shibuya', name: 'Shibuya', center: { lat: 35.6595, lng: 139.7004 }, radius: 0.8,
          shoppingType: 'fashion', day1Appropriate: false, intensity: 'high' },
        { id: 'shinjuku', name: 'Shinjuku', center: { lat: 35.6938, lng: 139.7034 }, radius: 1.0,
          shoppingType: 'department', day1Appropriate: true, intensity: 'medium' },
        { id: 'harajuku', name: 'Harajuku', center: { lat: 35.6702, lng: 139.7029 }, radius: 0.7,
          shoppingType: 'fashion', day1Appropriate: false, intensity: 'high' },
        { id: 'akihabara', name: 'Akihabara', center: { lat: 35.7022, lng: 139.7745 }, radius: 0.6,
          shoppingType: 'anime_electronics', day1Appropriate: false, intensity: 'very_high' },
        { id: 'ginza', name: 'Ginza', center: { lat: 35.6717, lng: 139.7647 }, radius: 0.8,
          shoppingType: 'luxury', day1Appropriate: true, intensity: 'low' },
        { id: 'ueno', name: 'Ueno', center: { lat: 35.7148, lng: 139.7744 }, radius: 1.0,
          shoppingType: 'general', day1Appropriate: true, intensity: 'medium' }
      ],
      'Kyoto': [
        { id: 'gion', name: 'Gion', center: { lat: 35.0036, lng: 135.7778 }, radius: 1.0 },
        { id: 'arashiyama', name: 'Arashiyama', center: { lat: 35.0094, lng: 135.6728 }, radius: 2.0 },
        { id: 'fushimi', name: 'Fushimi Inari', center: { lat: 34.9671, lng: 135.7727 }, radius: 1.5 },
        { id: 'higashiyama', name: 'Higashiyama', center: { lat: 34.9966, lng: 135.7828 }, radius: 1.5 }
      ],
      'Osaka': [
        { id: 'dotonbori', name: 'Dotonbori', center: { lat: 34.6686, lng: 135.5005 }, radius: 0.8 },
        { id: 'namba', name: 'Namba', center: { lat: 34.6659, lng: 135.5006 }, radius: 1.0 },
        { id: 'umeda', name: 'Umeda', center: { lat: 34.7024, lng: 135.4959 }, radius: 1.2 },
        { id: 'castle', name: 'Osaka Castle Area', center: { lat: 34.6873, lng: 135.5262 }, radius: 1.5 }
      ]
    };

    return zones[city] || [];
  },

  /**
   * Detecta la zona de una actividad
   * @param {Object} activity
   * @param {Array} zones
   * @returns {Object|null} Zona detectada
   */
  detectActivityZone(activity, zones) {
    if (!activity.coordinates) return null;

    // Primero intentar por nombre/área
    const activityText = `${activity.title || activity.name || ''} ${activity.area || ''} ${activity.zone || ''}`.toLowerCase();

    for (const zone of zones) {
      if (activityText.includes(zone.id) || activityText.includes(zone.name.toLowerCase())) {
        return zone;
      }
    }

    // Si no, buscar por proximidad
    for (const zone of zones) {
      const distance = RouteOptimizer.calculateDistance(activity.coordinates, zone.center);
      if (distance <= zone.radius) {
        return zone;
      }
    }

    return null;
  },

  /**
   * Calcula score emblemático de un cluster
   * @param {Array} activities
   * @returns {number} Score 0-100
   */
  calculateClusterIconicScore(activities) {
    if (activities.length === 0) return 0;

    const iconicKeywords = ['senso-ji', 'asakusa', 'shibuya crossing', 'fushimi inari',
                           'kinkaku-ji', 'todai-ji', 'meiji shrine', 'tokyo tower', 'skytree'];

    let totalScore = 0;

    activities.forEach(activity => {
      const title = (activity.title || activity.name || '').toLowerCase();
      let score = 0;

      // Check iconic keywords
      for (const keyword of iconicKeywords) {
        if (title.includes(keyword)) {
          score += 50;
          break;
        }
      }

      // Check category
      if (activity.category === 'culture' || activity.category === 'landmark') {
        score += 30;
      }

      // Check popularity
      if (activity.popularity >= 85) {
        score += 20;
      } else if (activity.popularity >= 70) {
        score += 10;
      }

      totalScore += score;
    });

    return Math.round(totalScore / activities.length);
  },

  /**
   * Calcula popularidad promedio
   * @param {Array} activities
   * @returns {number} Promedio 0-100
   */
  calculateAveragePopularity(activities) {
    if (activities.length === 0) return 0;

    const total = activities.reduce((sum, act) => sum + (act.popularity || 50), 0);
    return Math.round(total / activities.length);
  },

  /**
   * Crea clusters dinámicos para actividades no asignadas
   * @param {Array} activities
   * @param {number} k - Número de clusters
   * @returns {Array} Clusters dinámicos
   */
  createDynamicClusters(activities, k) {
    // Implementación simplificada de K-means
    // En producción, usar una librería de clustering

    const clusters = [];
    const assigned = new Map();

    // Agrupar por cercanía simple
    activities.forEach(activity => {
      if (!activity.coordinates) return;

      let closestCluster = null;
      let minDist = Infinity;

      clusters.forEach(cluster => {
        const dist = RouteOptimizer.calculateDistance(activity.coordinates, cluster.center);
        if (dist < minDist) {
          minDist = dist;
          closestCluster = cluster;
        }
      });

      if (closestCluster && minDist < 2) {
        closestCluster.activities.push(activity);
      } else {
        // Crear nuevo cluster
        clusters.push({
          zoneId: `dynamic_${clusters.length + 1}`,
          zoneName: `Zona ${clusters.length + 1}`,
          center: activity.coordinates,
          activities: [activity],
          iconicScore: 0,
          averagePopularity: 0,
          activityCount: 1
        });
      }
    });

    return clusters;
  }
};

/**
 * 3️⃣ JOURNEY ARC OPTIMIZER
 * Estructura el viaje como una narrativa coherente
 */
export const JourneyArcOptimizer = {
  /**
   * Asigna clusters a días basándose en la fase del viaje
   * @param {Array} clusters
   * @param {Array} days
   * @param {Object} context
   * @param {string} [city] - Ciudad de estos clusters; si se provee, SOLO se consideran
   *   días de esa misma ciudad (evita mezclar actividades de una ciudad en el día de otra
   *   en itinerarios multi-ciudad)
   * @returns {Object} Asignación optimizada
   */
  assignClustersToOptimalDays(clusters, days, context, city = null) {
    console.log('📖 Asignando clusters según narrativa del viaje...');

    const assignments = new Map(); // day -> clusters[]

    // 🏙️ Restringir a días de la misma ciudad que estos clusters (si se conoce la ciudad
    // y al menos un día del itinerario tiene ciudad registrada)
    const cityDays = city
      ? days.filter(d => d.city && String(d.city).toLowerCase() === String(city).toLowerCase())
      : days;
    const effectiveDays = cityDays.length > 0 ? cityDays : days; // fallback si no hay match

    // Ordenar clusters por emblematicidad
    const sortedClusters = [...clusters].sort((a, b) => b.iconicScore - a.iconicScore);

    // FASE 1: Arrival - Asignar clusters más emblemáticos
    const arrivalPhase = context.phases.find(p => p.name === 'arrival');
    if (arrivalPhase) {
      arrivalPhase.days.forEach(dayNum => {
        if (!effectiveDays.some(d => d.day === dayNum)) return; // día de otra ciudad, saltar
        const cluster = sortedClusters.shift();
        if (cluster) {
          assignments.set(dayNum, [cluster]);
          console.log(`   Día ${dayNum} (Arrival): ${cluster.zoneName} (iconic: ${cluster.iconicScore})`);
        }
      });
    }

    // FASES 2-3: Exploration & Deep Dive - Distribuir el resto SOLO entre días de esta ciudad
    const remainingDays = effectiveDays.filter(d =>
      !assignments.has(d.day) &&
      d.day !== days.length // Excluir último día
    );

    sortedClusters.forEach((cluster, index) => {
      if (remainingDays.length > 0) {
        const targetDay = remainingDays[index % remainingDays.length];
        if (!assignments.has(targetDay.day)) {
          assignments.set(targetDay.day, []);
        }
        assignments.get(targetDay.day).push(cluster);
      }
    });

    return assignments;
  },

  /**
   * Calcula la intensidad recomendada para un día
   * @param {number} dayNumber
   * @param {Object} context
   * @returns {string} Intensidad (low, medium, high)
   */
  calculateRecommendedIntensity(dayNumber, context) {
    const phase = TripContextAnalyzer.getPhaseForDay(dayNumber, context.phases);
    return phase ? phase.intensity : 'medium';
  }
};

/**
 * 4️⃣ TRANSITION OPTIMIZER
 * Optimiza días de cambio entre ciudades
 */
export const TransitionOptimizer = {
  /**
   * Optimiza un día de transición
   * @param {Object} day
   * @param {Object} transition
   * @param {Object} itinerary
   * @returns {Object} Día optimizado
   */
  optimizeTransitionDay(day, transition, itinerary) {
    console.log(`🔄 Optimizando día de transición ${day.day}: ${transition.from} → ${transition.to}`);

    if (day.activities.length === 0) {
      console.log('   Sin actividades para optimizar');
      return day;
    }

    // Dividir actividades en pre/post transición
    const preTransitionActivities = [];
    const postTransitionActivities = [];

    // Obtener hoteles
    const fromHotel = HotelBaseSystem.getHotelForCity(itinerary, transition.from, day.day);
    const toHotel = HotelBaseSystem.getHotelForCity(itinerary, transition.to, day.day + 1);

    day.activities.forEach(activity => {
      if (!activity.coordinates) {
        preTransitionActivities.push(activity);
        return;
      }

      let distanceFromOrigin = Infinity;
      let distanceFromDestination = Infinity;

      if (fromHotel && fromHotel.coordinates) {
        distanceFromOrigin = RouteOptimizer.calculateDistance(activity.coordinates, fromHotel.coordinates);
      }

      if (toHotel && toHotel.coordinates) {
        distanceFromDestination = RouteOptimizer.calculateDistance(activity.coordinates, toHotel.coordinates);
      }

      // Asignar según cercanía
      if (distanceFromOrigin < distanceFromDestination) {
        preTransitionActivities.push(activity);
      } else {
        postTransitionActivities.push(activity);
      }
    });

    console.log(`   Pre-transición: ${preTransitionActivities.length} actividades`);
    console.log(`   Post-transición: ${postTransitionActivities.length} actividades`);

    // Marcar actividades como pre/post (sin descartar ninguna - el límite de
    // 2 pre / 1 post era solo aspiracional y borraba actividades del usuario
    // permanentemente; el horario nunca se recalcula después de esto, así
    // que tampoco se toca act.time).
    preTransitionActivities.forEach(act => {
      act.transitionPhase = 'pre';
    });

    postTransitionActivities.forEach(act => {
      act.transitionPhase = 'post';
    });

    day.activities = [...preTransitionActivities, ...postTransitionActivities];
    day.isTransitionDay = true;

    return day;
  }
};

/**
 * 5️⃣ ZONE CONTINUITY SYSTEM
 * Asegura flujo natural entre días
 */
export const ZoneContinuitySystem = {
  /**
   * Optimiza continuidad de zonas entre días
   * @param {Object} itinerary
   * @returns {Object} Itinerario optimizado
   */
  ensureZoneContinuity(itinerary) {
    console.log('🔗 Asegurando continuidad de zonas...');

    for (let i = 0; i < itinerary.days.length - 1; i++) {
      const currentDay = itinerary.days[i];
      const nextDay = itinerary.days[i + 1];

      if (!currentDay.activities || currentDay.activities.length === 0) continue;
      if (!nextDay.activities || nextDay.activities.length === 0) continue;

      // Obtener última actividad del día actual
      const lastActivity = currentDay.activities[currentDay.activities.length - 1];

      // Ordenar actividades del siguiente día por cercanía a la última actividad
      if (lastActivity.coordinates) {
        nextDay.activities.sort((a, b) => {
          if (!a.coordinates || !b.coordinates) return 0;

          const distA = RouteOptimizer.calculateDistance(lastActivity.coordinates, a.coordinates);
          const distB = RouteOptimizer.calculateDistance(lastActivity.coordinates, b.coordinates);

          return distA - distB;
        });

        const firstNextActivity = nextDay.activities[0];
        const distance = RouteOptimizer.calculateDistance(
          lastActivity.coordinates,
          firstNextActivity.coordinates
        );

        console.log(`   Día ${currentDay.day} → ${nextDay.day}: ${distance.toFixed(2)}km`);
      }
    }

    return itinerary;
  }
};

/**
 * 6️⃣ ENERGY MANAGEMENT SYSTEM
 * Gestiona fatiga y niveles de energía
 */
export const EnergyManagementSystem = {
  /**
   * Calcula nivel de intensidad de un día
   * @param {Object} day
   * @returns {number} Intensidad 1-3
   */
  calculateDayIntensity(day) {
    const activityCount = day.activities ? day.activities.length : 0;

    if (activityCount <= 3) return 1; // Low
    if (activityCount <= 5) return 2; // Medium
    return 3; // High
  },

  /**
   * Balancea niveles de energía del itinerario
   * @param {Object} itinerary
   * @returns {Object} Reporte de balance
   */
  balanceEnergyLevels(itinerary) {
    console.log('💪 Balanceando niveles de energía...');

    const intensityPattern = [];
    let consecutiveHigh = 0;

    itinerary.days.forEach((day, index) => {
      const intensity = this.calculateDayIntensity(day);
      intensityPattern.push(intensity);

      if (intensity === 3) {
        consecutiveHigh++;

        if (consecutiveHigh >= 2) {
          console.warn(`   ⚠️ Día ${day.day}: ${consecutiveHigh} días intensos consecutivos`);
        }
      } else {
        consecutiveHigh = 0;
      }
    });

    const report = {
      pattern: intensityPattern,
      warnings: [],
      balanced: consecutiveHigh < 2
    };

    console.log(`   Patrón de intensidad: ${intensityPattern.map(i => '⚫'.repeat(i)).join(' ')}`);

    return report;
  }
};

/**
 * 7️⃣ MASTER ITINERARY OPTIMIZER
 * Sistema maestro que coordina todos los módulos
 */
export const MasterItineraryOptimizer = {
  /**
   * Optimiza el itinerario completo de forma inteligente
   * @param {Object} itinerary
   * @returns {Object} Resultado con itinerario optimizado y métricas
   */
  async optimizeCompleteItinerary(itinerary) {
    console.log('🚀 ═══════════════════════════════════════');
    console.log('🚀 INICIANDO OPTIMIZACIÓN MAESTRA');
    console.log('🚀 ═══════════════════════════════════════\n');

    const startTime = Date.now();

    try {
      // PASO 0: DIAGNÓSTICO DE SALUD (PREVENTIVO)
      console.log('📍 PASO 0: Diagnóstico preventivo de salud del itinerario...');
      const healthReport = ItineraryHealthChecker.analyzeHealth(itinerary);

      // Si hay problemas críticos, abortar
      if (!healthReport.healthy && healthReport.issues.critical.length > 0) {
        console.error('🔴 ABORTANDO: Problemas críticos detectados que impiden la optimización');
        return {
          success: false,
          error: 'Critical health issues',
          healthReport: healthReport
        };
      }

      // Si hay warnings, continuar pero guardar el reporte
      if (healthReport.issues.warnings.length > 0) {
        console.warn(`⚠️ Continuando optimización con ${healthReport.issues.warnings.length} advertencias`);
      }

      // PASO 1: Analizar contexto del viaje
      console.log('\n📍 PASO 1: Analizando contexto del viaje...');
      const context = TripContextAnalyzer.analyzeTripContext(itinerary);

      if (!context) {
        console.error('❌ No se pudo analizar el contexto del viaje');
        return { success: false, error: 'No context' };
      }

      // PASO 2: Crear clusters geográficos
      console.log('\n📍 PASO 2: Creando clusters geográficos...');
      const allActivities = [];
      itinerary.days.forEach(day => {
        if (day.activities) {
          allActivities.push(...day.activities);
        }
      });

      const clustersByCity = {};
      context.cityFlow.forEach(segment => {
        const cityActivities = allActivities.filter(act => {
          const actCity = act.city || (act.area && act.area.includes(segment.city) ? segment.city : null);
          return actCity === segment.city;
        });

        if (cityActivities.length > 0) {
          clustersByCity[segment.city] = GeographicClusteringSystem.clusterActivitiesByZone(
            cityActivities,
            segment.city
          );
        }
      });

      // PASO 3: Asignar clusters a días según narrativa
      console.log('\n📍 PASO 3: Asignando actividades según narrativa del viaje...');
      Object.entries(clustersByCity).forEach(([city, clusters]) => {
        JourneyArcOptimizer.assignClustersToOptimalDays(clusters, itinerary.days, context, city);
      });

      // PASO 4: Optimizar días de transición
      console.log('\n📍 PASO 4: Optimizando días de transición...');
      context.transitions.forEach(transition => {
        const day = itinerary.days.find(d => d.day === transition.day);
        if (day) {
          TransitionOptimizer.optimizeTransitionDay(day, transition, itinerary);
        }
      });

      // PASO 5: Asegurar continuidad de zonas
      console.log('\n📍 PASO 5: Asegurando continuidad de zonas...');
      ZoneContinuitySystem.ensureZoneContinuity(itinerary);

      // PASO 6: Balance de energía
      console.log('\n📍 PASO 6: Balanceando niveles de energía...');
      const energyReport = EnergyManagementSystem.balanceEnergyLevels(itinerary);

      // ❌ PASO 7: Optimización Automática de Rutas - DESACTIVADO
      //
      // RAZÓN: Reorganiza actividades sin permiso del usuario
      //
      // PROBLEMA:
      // - Cambia el orden que el usuario estableció intencionalmente
      // - Recalcula horarios automáticamente (puede no ser deseado)
      // - A veces "optimiza" pero empeora la experiencia real
      // - No hay preview ni confirmación
      //
      // DECISIÓN: DESACTIVADO - El usuario controla el orden manualmente
      //
      // ALTERNATIVA:
      // - Agregar botón "Optimizar día X" (opcional, por día)
      // - Mostrar preview antes de aplicar
      // - Usuario tiene control total
      //
      console.log('\n📍 PASO 7: Optimización de rutas (DESACTIVADO)');
      console.log('   💡 TIP: Usa drag & drop para organizar el orden de actividades');
      console.log('   📏 Las distancias entre actividades se muestran en el validador');

      /* ═══════════════════════════════════════════════════════════════
       * CÓDIGO DESACTIVADO - Mantener para referencia
       * ═══════════════════════════════════════════════════════════════
       *
       * itinerary.days.forEach(day => {
       *   if (day.activities && day.activities.length > 1) {
       *     const city = HotelBaseSystem.detectCityForDay(day);
       *     const hotel = HotelBaseSystem.getHotelForCity(itinerary, city, day.day);
       *
       *     if (hotel && hotel.coordinates) {
       *       const result = RouteOptimizer.optimizeRoute(day.activities, {
       *         startPoint: hotel.coordinates,
       *         optimizationMode: 'balanced',
       *         shouldRecalculateTimings: true
       *       });
       *
       *       if (result.wasOptimized) {
       *         day.activities = result.optimizedActivities;
       *       }
       *     }
       *   }
       * });
       *
       * ═══════════════════════════════════════════════════════════════
       */

      // PASO 8: VALIDAR el itinerario resultante
      console.log('\n📍 PASO 8: Validando itinerario resultante...');
      let validation = MasterValidator.validateCompleteItinerary(itinerary, { verbose: true });

      // 🔍 DEBUG: Mostrar estructura completa de validación (sin imprimir objetos grandes)
      console.log('\n🔍 DEBUG - Estructura de validación recibida:');
      console.log('   validation.valid:', validation.valid);
      console.log('   validation.summary.totalErrors:', validation.summary?.totalErrors);
      console.log('   validation.validations?.distances:', validation.validations?.distances ? 'EXISTS' : 'NULL');

      const distanceValidation = validation.validations?.distances;
      if (distanceValidation) {
        console.log('   distanceValidation.valid:', distanceValidation.valid);
        console.log('   distanceValidation.daysWithErrors count:', distanceValidation.daysWithErrors?.length || 0);
        console.log('   distanceValidation.totalErrors:', distanceValidation.totalErrors);
      }

      // ❌ PASO 9: AUTO-CORRECCIÓN - DESACTIVADO
      //
      // RAZÓN: Feature semi-roto que genera falsas expectativas
      //
      // PROBLEMA:
      // - Solo puede mover actividades si YA existen días puros disponibles
      // - Si no hay días disponibles → falla silenciosamente
      // - Genera confusión: "dice que arreglará pero no lo hace"
      // - Gastó muchas sesiones de debugging sin valor real
      //
      // DECISIÓN: DESACTIVADO hasta que se reimplemente correctamente
      //
      // ALTERNATIVA ACTUAL:
      // - El validador muestra errores de distancia claramente
      // - El usuario decide cómo resolverlos (manual)
      // - Más transparente y predecible
      //
      console.log('\n📍 PASO 9: Auto-corrección (DESACTIVADO)');

      if (distanceValidation && !distanceValidation.valid) {
        const errorCount = distanceValidation.daysWithErrors?.length || 0;
        console.log(`   ⚠️  ${errorCount} días con errores de distancia detectados`);
        console.log('   💡 Revisa manualmente estos días en el reporte de validación');
        console.log('   📝 TIP: Arrastra actividades entre días para organizarlas mejor');
      } else {
        console.log('   ✅ No hay errores de distancia');
      }

      /* ═══════════════════════════════════════════════════════════════
       * CÓDIGO DESACTIVADO - No borrar (puede ser útil como referencia)
       * ═══════════════════════════════════════════════════════════════
       *
       * const check1 = distanceValidation?.daysWithErrors?.length > 0;
       * const check2 = distanceValidation?.totalErrors > 0;
       * const check3 = distanceValidation?.valid === false;
       *
       * if (check1 || check2 || check3) {
       *   const correctionResult = await this.autoCorrectDistanceErrors(itinerary, distanceValidation);
       *   // ... resto del código
       * }
       *
       * ═══════════════════════════════════════════════════════════════
       */

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log('\n🚀 ═══════════════════════════════════════');
      if (validation.valid) {
        console.log(`🚀 OPTIMIZACIÓN COMPLETADA EN ${duration}s ✅`);
      } else {
        console.error(`🚀 OPTIMIZACIÓN COMPLETADA CON ERRORES EN ${duration}s ❌`);
        console.error(`   ${validation.summary.totalErrors} errores críticos encontrados`);
      }
      console.log('🚀 ═══════════════════════════════════════\n');

      return {
        success: validation.valid,
        itinerary: itinerary,
        context: context,
        energyReport: energyReport,
        validation: validation,  // 🔥 NUEVO: Reporte de validación
        duration: duration,
        metrics: this.calculateMetrics(itinerary, context),
        warnings: validation.summary.totalWarnings,
        errors: validation.summary.totalErrors
      };

    } catch (error) {
      console.error('❌ Error en optimización maestra:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Calcula métricas del itinerario optimizado
   * @param {Object} itinerary
   * @param {Object} context
   * @returns {Object} Métricas
   */
  calculateMetrics(itinerary, context) {
    let totalDistance = 0;
    let totalActivities = 0;

    itinerary.days.forEach(day => {
      totalActivities += day.activities ? day.activities.length : 0;

      if (day.activities && day.activities.length > 1) {
        for (let i = 0; i < day.activities.length - 1; i++) {
          const act1 = day.activities[i];
          const act2 = day.activities[i + 1];

          if (act1.coordinates && act2.coordinates) {
            totalDistance += RouteOptimizer.calculateDistance(act1.coordinates, act2.coordinates);
          }
        }
      }
    });

    return {
      totalDays: itinerary.days.length,
      totalActivities: totalActivities,
      averageActivitiesPerDay: (totalActivities / itinerary.days.length).toFixed(1),
      totalDistance: totalDistance.toFixed(2),
      cities: context.cityFlow.length,
      transitions: context.transitions.length
    };
  },

  /**
   * AUTO-CORRECCIÓN V2 - Sistema simplificado y robusto
   * Delega la corrección al módulo AutoCorrectionV2
   * @param {Object} itinerary
   * @param {Object} distanceValidation - Resultado de DistanceValidator
   * @returns {Object} { corrected: boolean, itinerary, correctionsMade }
   */
  async autoCorrectDistanceErrors(itinerary, distanceValidation) {
    console.log('   🔧 Usando AutoCorrectionV2 para corregir días mezclados...');

    // 🔒 VALIDACIÓN: Verificar que tenemos un itinerario válido
    if (!itinerary || !itinerary.days || !Array.isArray(itinerary.days)) {
      console.error('   ❌ Itinerario inválido o sin días');
      return {
        corrected: false,
        itinerary: itinerary,
        correctionsMade: 0,
        correctionsFailed: distanceValidation?.daysWithErrors?.length || 0,
        error: 'Itinerario inválido'
      };
    }

    try {
      // Delegar TODA la lógica de corrección al módulo V2
      const result = await AutoCorrectionV2.correctMixedDays(itinerary);

      if (!result.success) {
        console.error('   ❌ Error en AutoCorrectionV2:', result.error);
        return {
          corrected: false,
          itinerary: itinerary,
          correctionsMade: 0,
          correctionsFailed: distanceValidation.daysWithErrors?.length || 0,
          error: result.error
        };
      }

      // Re-optimizar rutas de días afectados si hubo correcciones
      if (result.corrected && result.stats.activitiesMoved > 0) {
        console.log(`\n   🔄 Re-optimizando días afectados...`);

        let reoptimizedCount = 0;
        let reoptimizationErrors = 0;

        // Re-optimizar TODOS los días (es más seguro)
        itinerary.days.forEach(day => {
          if (!day.activities || day.activities.length < 2) return;

          try {
            const detection = CityDetectionV2.detectDayCity(day);
            if (!detection.city) return;

            const hotel = HotelBaseSystem.getHotelForCity(itinerary, detection.city, day.day);

            if (hotel && hotel.coordinates) {
              const routeResult = RouteOptimizer.optimizeRoute(day.activities, {
                startPoint: hotel.coordinates,
                optimizationMode: 'balanced',
                shouldRecalculateTimings: true
              });

              if (routeResult && routeResult.wasOptimized) {
                day.activities = routeResult.optimizedActivities;
                reoptimizedCount++;
              }
            }
          } catch (routeError) {
            console.error(`      ⚠️ Error re-optimizando día ${day.day}:`, routeError.message);
            reoptimizationErrors++;
          }
        });

        console.log(`      ✅ ${reoptimizedCount} días re-optimizados`);
        if (reoptimizationErrors > 0) {
          console.warn(`      ⚠️ ${reoptimizationErrors} errores en re-optimización`);
        }
      }

      // Retornar en el formato esperado
      return {
        corrected: result.corrected || false,
        itinerary: itinerary,
        correctionsMade: result.stats?.activitiesMoved || 0,
        correctionsFailed: result.stats?.failed || 0,
        affectedDays: [] // V2 no rastrea esto explícitamente
      };

    } catch (error) {
      console.error(`   ❌ Error crítico en auto-corrección V2:`, error);
      return {
        corrected: false,
        itinerary: itinerary,
        correctionsMade: 0,
        correctionsFailed: distanceValidation.daysWithErrors?.length || 0,
        error: error.message
      };
    }
  }
};

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.MasterItineraryOptimizer = MasterItineraryOptimizer;
  window.TripContextAnalyzer = TripContextAnalyzer;
  window.GeographicClusteringSystem = GeographicClusteringSystem;
  window.JourneyArcOptimizer = JourneyArcOptimizer;
  window.TransitionOptimizer = TransitionOptimizer;
  window.ZoneContinuitySystem = ZoneContinuitySystem;
  window.EnergyManagementSystem = EnergyManagementSystem;
}

export default MasterItineraryOptimizer;
