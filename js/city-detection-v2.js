// js/city-detection-v2.js - Sistema de Detección de Ciudades SIMPLIFICADO Y ROBUSTO
// Reescritura completa desde cero con lógica clara y sin bugs

/**
 * Sistema de Detección de Ciudades V2
 * PRINCIPIOS:
 * 1. SIMPLE: Cuenta actividades por ciudad, gana la mayoría
 * 2. ROBUSTO: Maneja todos los casos edge
 * 3. CONSISTENTE: Trata TODAS las ciudades igual (incluyendo Tokyo)
 * 4. TRANSPARENTE: Log claro de cada decisión
 */
export const CityDetectionV2 = {

  /**
   * Detecta la ciudad DOMINANTE de un día
   * @param {Object} day - Día del itinerario
   * @returns {Object} { city: string, confidence: 'high'|'medium'|'low', mixed: boolean, breakdown: {} }
   */
  detectDayCity(day, debug = false) {
    // Validación básica
    if (!day) {
      return { city: null, confidence: 'none', mixed: false, breakdown: {} };
    }

    // Si el día tiene location explícito, úsalo
    if (day.location) {
      return {
        city: this.normalizeCity(day.location),
        confidence: 'high',
        mixed: false,
        breakdown: { [this.normalizeCity(day.location)]: day.activities?.length || 0 },
        source: 'day.location'
      };
    }

    // Si no hay actividades
    if (!day.activities || day.activities.length === 0) {
      return { city: null, confidence: 'none', mixed: false, breakdown: {} };
    }

    if (debug) {
      console.log(`\n🔍 DEBUG detectDayCity - Día ${day.day}:`);
      console.log(`   Total actividades: ${day.activities.length}`);
    }

    // Contar actividades por ciudad
    const cityCounts = {};
    const activitiesWithCity = [];
    const activitiesWithoutCity = [];

    day.activities.forEach(activity => {
      const city = this.extractCityFromActivity(activity);
      const activityName = activity.title || activity.name || 'Sin nombre';

      if (debug) {
        console.log(`   - "${activityName}": ${city || 'NO DETECTADA'}`);
        if (!city && activity.coordinates) {
          console.log(`     Coords: ${activity.coordinates.lat}, ${activity.coordinates.lng}`);
        }
      }

      if (city) {
        cityCounts[city] = (cityCounts[city] || 0) + 1;
        activitiesWithCity.push({ activity: activityName, city });
      } else {
        activitiesWithoutCity.push(activityName);
      }
    });

    // Si NINGUNA actividad tiene ciudad, no podemos determinar
    if (Object.keys(cityCounts).length === 0) {
      return {
        city: null,
        confidence: 'none',
        mixed: false,
        breakdown: {},
        activitiesWithoutCity: activitiesWithoutCity
      };
    }

    // Ordenar ciudades por número de actividades
    const sortedCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1]);

    const dominantCity = sortedCities[0][0];
    const dominantCount = sortedCities[0][1];
    const totalActivitiesWithCity = activitiesWithCity.length;

    // Determinar si es un día mezclado
    const isMixed = sortedCities.length > 1;

    // Calcular confianza
    const percentage = (dominantCount / day.activities.length) * 100;
    let confidence;

    if (percentage >= 80) {
      confidence = 'high'; // ≥80% de actividades son de esta ciudad
    } else if (percentage >= 60) {
      confidence = 'medium'; // 60-79%
    } else {
      confidence = 'low'; // <60%
    }

    if (debug) {
      console.log(`   📊 Resultado:`);
      console.log(`      Ciudad dominante: ${dominantCity} (${dominantCount}/${day.activities.length} actividades)`);
      console.log(`      ¿Mezclado?: ${isMixed ? 'SÍ' : 'NO'}`);
      if (isMixed) {
        console.log(`      Otras ciudades: ${sortedCities.slice(1).map(([c, n]) => `${c}(${n})`).join(', ')}`);
      }
      console.log(`      Confianza: ${confidence} (${percentage.toFixed(0)}%)`);
    }

    return {
      city: dominantCity,
      confidence: confidence,
      mixed: isMixed,
      breakdown: cityCounts,
      percentage: Math.round(percentage),
      activitiesWithCity: activitiesWithCity,
      activitiesWithoutCity: activitiesWithoutCity,
      otherCities: sortedCities.slice(1).map(([city, count]) => ({ city, count }))
    };
  },

  /**
   * Extrae la ciudad de una actividad
   * PRIORIDAD: cityName > city > texto > coordenadas
   */
  extractCityFromActivity(activity) {
    if (!activity) return null;

    // Prioridad 1: cityName
    if (activity.cityName) {
      return this.normalizeCity(activity.cityName);
    }

    // Prioridad 2: city
    if (activity.city) {
      return this.normalizeCity(activity.city);
    }

    // Prioridad 3: Buscar en texto
    const text = `${activity.title || ''} ${activity.name || ''} ${activity.area || ''} ${activity.description || ''}`.toLowerCase();

    const cityKeywords = {
      'Tokyo': ['tokyo', 'shibuya', 'shinjuku', 'harajuku', 'asakusa', 'ginza', 'roppongi', 'akihabara'],
      'Kyoto': ['kyoto', 'gion', 'arashiyama', 'kiyomizu', 'fushimi'],
      'Osaka': ['osaka', 'dotonbori', 'namba', 'umeda', 'shinsekai'],
      'Hakone': ['hakone', 'ashi', 'owakudani'],
      'Kamakura': ['kamakura', 'enoshima', 'daibutsu', 'hase'],
      'Nara': ['nara', 'todaiji', 'deer park'],
      'Hiroshima': ['hiroshima', 'miyajima'],
      'Yokohama': ['yokohama'],
      'Nagoya': ['nagoya'],
      'Nikko': ['nikko']
    };

    for (const [city, keywords] of Object.entries(cityKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return city;
        }
      }
    }

    // Prioridad 4: Usar coordenadas para detectar ciudad
    if (activity.coordinates && activity.coordinates.lat && activity.coordinates.lng) {
      const cityFromCoords = this.detectCityFromCoordinates(activity.coordinates);
      if (cityFromCoords) {
        return cityFromCoords;
      }
    }

    return null;
  },

  /**
   * Detecta ciudad basándose en coordenadas geográficas
   * Usa bounding boxes para las ciudades más comunes de Japón
   * @param {Object} coordinates - { lat, lng }
   * @returns {string|null} - Nombre de la ciudad
   */
  detectCityFromCoordinates(coordinates) {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return null;
    }

    const { lat, lng } = coordinates;

    // Bounding boxes de ciudades principales de Japón
    // Formato: [latMin, latMax, lngMin, lngMax]
    const cityBounds = {
      'Tokyo': [35.5, 35.85, 139.5, 139.95],
      'Kyoto': [34.9, 35.15, 135.6, 135.85],
      'Osaka': [34.6, 34.75, 135.4, 135.6],
      'Hakone': [35.1, 35.35, 138.95, 139.15],
      'Kamakura': [35.25, 35.35, 139.5, 139.6],
      'Nara': [34.6, 34.75, 135.75, 135.9],
      'Hiroshima': [34.35, 34.45, 132.4, 132.5],
      'Yokohama': [35.3, 35.55, 139.55, 139.7],
      'Nagoya': [35.1, 35.25, 136.85, 137.0],
      'Nikko': [36.7, 36.85, 139.55, 139.65]
    };

    // Buscar ciudad que contenga estas coordenadas
    for (const [city, [latMin, latMax, lngMin, lngMax]] of Object.entries(cityBounds)) {
      if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
        return city;
      }
    }

    return null;
  },

  /**
   * Normaliza nombre de ciudad
   */
  normalizeCity(cityName) {
    if (!cityName) return null;

    const normalized = cityName.toLowerCase().trim();

    const cityMap = {
      'tokyo': 'Tokyo',
      'tokio': 'Tokyo',
      'kyoto': 'Kyoto',
      'osaka': 'Osaka',
      'ōsaka': 'Osaka',
      'hakone': 'Hakone',
      '箱根': 'Hakone',
      'kamakura': 'Kamakura',
      'nara': 'Nara',
      'hiroshima': 'Hiroshima',
      'yokohama': 'Yokohama',
      'nagoya': 'Nagoya',
      'nikko': 'Nikko',
      'takayama': 'Takayama',
      'kanazawa': 'Kanazawa',
      'sapporo': 'Sapporo',
      'fukuoka': 'Fukuoka'
    };

    if (cityMap[normalized]) {
      return cityMap[normalized];
    }

    // Capitalizar primera letra
    return cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();
  },

  /**
   * Analiza TODO el itinerario y agrupa días por ciudad
   * @param {Object} itinerary
   * @returns {Object} Mapa de ciudades a días
   */
  analyzeCityDistribution(itinerary) {
    // 🔒 VALIDACIÓN: Verificar que el itinerario es válido
    if (!itinerary || !itinerary.days || !Array.isArray(itinerary.days)) {
      console.error('❌ Itinerario inválido en analyzeCityDistribution');
      return {
        cityToDays: {},
        mixedDays: [],
        lowConfidenceDays: [],
        totalDays: 0,
        citiesDetected: []
      };
    }

    const cityToDays = {}; // { 'Tokyo': [1, 2, 3], 'Kyoto': [4, 5] }
    const mixedDays = [];
    const lowConfidenceDays = [];

    itinerary.days.forEach(day => {
      // 🔒 Validar que el día tiene estructura válida
      if (!day || typeof day.day !== 'number') {
        console.warn('⚠️ Día inválido encontrado en itinerario');
        return;
      }

      // 🔍 DEBUG: Activar debug para días que históricamente han tenido problemas (11-15)
      const debugThis = day.day >= 11 && day.day <= 15;
      const detection = this.detectDayCity(day, debugThis);

      if (detection.city) {
        if (!cityToDays[detection.city]) {
          cityToDays[detection.city] = [];
        }
        cityToDays[detection.city].push(day.day);

        if (detection.mixed) {
          mixedDays.push({
            day: day.day,
            mainCity: detection.city,
            otherCities: detection.otherCities,
            breakdown: detection.breakdown
          });
        }

        if (detection.confidence === 'low') {
          lowConfidenceDays.push({
            day: day.day,
            city: detection.city,
            percentage: detection.percentage
          });
        }
      }
    });

    return {
      cityToDays,
      mixedDays,
      lowConfidenceDays,
      totalDays: itinerary.days.length,
      citiesDetected: Object.keys(cityToDays)
    };
  },

  /**
   * Encuentra el mejor día para una actividad basándose en su ciudad
   * @param {Object} itinerary
   * @param {Object} activity - Actividad a reubicar
   * @param {number} currentDay - Día actual (para excluir)
   * @param {Object} cityDistribution - Resultado de analyzeCityDistribution()
   * @returns {number|null} Número del día recomendado
   */
  findBestDayForActivity(itinerary, activity, currentDay, cityDistribution) {
    const activityCity = this.extractCityFromActivity(activity);

    if (!activityCity) {
      // No sabemos la ciudad de esta actividad, no podemos recomendar
      return null;
    }

    // Buscar días de esta ciudad
    const daysOfCity = cityDistribution.cityToDays[activityCity] || [];

    // Filtrar el día actual
    const availableDays = daysOfCity.filter(d => d !== currentDay);

    if (availableDays.length === 0) {
      // No hay días de esta ciudad
      return null;
    }

    // Elegir el día con MENOS actividades (para balancear)
    let bestDay = null;
    let minActivities = Infinity;

    availableDays.forEach(dayNum => {
      const day = itinerary.days.find(d => d.day === dayNum);

      // 🔒 VALIDACIÓN DEFENSIVA: Verificar que el día existe y tiene array de actividades
      if (!day) {
        console.warn(`⚠️ Día ${dayNum} no encontrado en itinerario`);
        return;
      }

      // Inicializar activities si no existe
      if (!day.activities) {
        day.activities = [];
      }

      const activityCount = day.activities.length;

      if (activityCount < minActivities) {
        minActivities = activityCount;
        bestDay = dayNum;
      }
    });

    return bestDay;
  },

  /**
   * Imprime reporte de análisis de ciudades
   */
  printCityReport(analysis) {
    console.log('\n📊 ═══════════════════════════════════════');
    console.log('📊 ANÁLISIS DE DISTRIBUCIÓN DE CIUDADES');
    console.log('📊 ═══════════════════════════════════════\n');

    console.log(`Ciudades detectadas: ${analysis.citiesDetected.length}`);
    console.log(`Total de días: ${analysis.totalDays}\n`);

    Object.entries(analysis.cityToDays).forEach(([city, days]) => {
      console.log(`🏙️ ${city}: ${days.length} días`);
      console.log(`   Días: ${days.join(', ')}`);
    });

    if (analysis.mixedDays.length > 0) {
      console.log(`\n⚠️ DÍAS MEZCLADOS: ${analysis.mixedDays.length}`);
      analysis.mixedDays.forEach(mixed => {
        const otherCitiesStr = mixed.otherCities.map(c => `${c.city} (${c.count})`).join(', ');
        console.log(`   Día ${mixed.day}: ${mixed.mainCity} (principal) + ${otherCitiesStr}`);
      });
    }

    if (analysis.lowConfidenceDays.length > 0) {
      console.log(`\n⚠️ BAJA CONFIANZA: ${analysis.lowConfidenceDays.length} días`);
      analysis.lowConfidenceDays.forEach(low => {
        console.log(`   Día ${low.day}: ${low.city} (${low.percentage}%)`);
      });
    }

    console.log('\n📊 ═══════════════════════════════════════\n');
  }
};

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.CityDetectionV2 = CityDetectionV2;
}

export default CityDetectionV2;
