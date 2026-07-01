// js/hotel-base-system.js - Sistema de Hotel Base Inteligente
// Gestiona hoteles por ciudad y optimiza sugerencias basadas en ubicación

import { GooglePlacesAPI } from './google-places.js';
import { APP_CONFIG } from '../core/config.js';

/**
 * Sistema de Hotel Base - Gestiona hoteles por ciudad
 */
export const HotelBaseSystem = {
  // 🏙️ Coordenadas aproximadas del centro de cada ciudad cubierta por la app.
  // Se usan como último recurso para inferir la ciudad de actividades ANTIGUAS que no
  // tienen cityName/city guardado (itinerarios creados antes de que ese campo existiera).
  CITY_CENTERS: {
    tokyo: { lat: 35.6762, lng: 139.6503 },
    kyoto: { lat: 35.0116, lng: 135.7681 },
    osaka: { lat: 34.6937, lng: 135.5023 },
    hiroshima: { lat: 34.3853, lng: 132.4553 },
    nara: { lat: 34.6851, lng: 135.8048 },
    hakone: { lat: 35.2323, lng: 139.1069 },
    kamakura: { lat: 35.3193, lng: 139.5466 },
    yokohama: { lat: 35.4437, lng: 139.6380 },
    sapporo: { lat: 43.0618, lng: 141.3545 },
    nagoya: { lat: 35.1815, lng: 136.9066 },
    kobe: { lat: 34.6901, lng: 135.1955 },
    nikko: { lat: 36.7199, lng: 139.6982 },
    takayama: { lat: 36.1461, lng: 137.2521 },
    kanazawa: { lat: 36.5613, lng: 136.6562 },
    fukuoka: { lat: 33.5904, lng: 130.4017 },
    sendai: { lat: 38.2682, lng: 140.8694 },
    matsumoto: { lat: 36.2380, lng: 137.9720 },
    shirakawago: { lat: 36.2578, lng: 136.9059 },
    himeji: { lat: 34.8154, lng: 134.6853 }
  },

  /**
   * Encuentra la ciudad conocida más cercana a unas coordenadas (distancia euclidiana
   * simple, suficiente para esta escala - no necesita precisión de metros)
   * @param {Object} coordinates - {lat, lng}
   * @returns {string|null} Ciudad normalizada o null si no hay coordenadas válidas
   */
  findNearestCityCenter(coordinates) {
    if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
      return null;
    }

    let bestCity = null;
    let bestDistance = Infinity;

    Object.entries(this.CITY_CENTERS).forEach(([key, center]) => {
      const distance = Math.sqrt(
        Math.pow(coordinates.lat - center.lat, 2) +
        Math.pow(coordinates.lng - center.lng, 2)
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        bestCity = key;
      }
    });

    return bestCity ? this.normalizeCityName(bestCity) : null;
  },

  /**
   * Resuelve la ciudad de UNA actividad individual con la mejor información disponible:
   * 1. cityName / city explícitos (más confiable)
   * 2. Coordenadas → ciudad conocida más cercana (funciona con itinerarios viejos que
   *    tienen coordenadas geocodificadas pero nunca guardaron el campo city/cityName)
   * 3. Texto del título/descripción (menos confiable, último recurso)
   * @param {Object} activity
   * @returns {string|null} Ciudad normalizada, o null si no se pudo determinar
   */
  resolveActivityCity(activity) {
    if (!activity) return null;
    if (activity.cityName) return this.normalizeCityName(activity.cityName);
    if (activity.city) return this.normalizeCityName(activity.city);

    const coords = activity.coordinates || (activity.lat && activity.lng ? { lat: activity.lat, lng: activity.lng } : null);
    if (coords) {
      const byCoords = this.findNearestCityCenter(coords);
      if (byCoords) return byCoords;
    }

    return this.extractCityFromText(activity);
  },

  /**
   * Compara la ciudad de un día contra la de una actividad para decidir si pueden
   * convivir. A diferencia de una simple comparación de strings, esto reconoce los
   * DÍAS DE TRANSICIÓN (ej. "Tokyo/Kyoto", día en que se viaja de una ciudad a otra) y
   * los trata como compatibles con CUALQUIER ciudad - de lo contrario, un día de
   * transición nunca podría "ganar" ninguna actividad de ninguna de sus dos ciudades
   * (ninguna coincide con el string compuesto completo) y terminaría vacío tras
   * cualquier reasignación.
   * @param {string|null} dayCity
   * @param {string|null} activityCity
   * @returns {boolean}
   */
  isCityCompatible(dayCity, activityCity) {
    if (!dayCity || !activityCity) return true; // dato desconocido, no bloquear
    const dayStr = String(dayCity);
    // Día de transición (ej. "Tokyo/Kyoto", "Kyoto-Osaka", "Kyoto → Osaka"): acepta
    // actividades de cualquiera de las ciudades que menciona.
    if (/[/\-→]/.test(dayStr)) {
      return dayStr.toLowerCase().includes(String(activityCity).toLowerCase());
    }
    return dayStr.toLowerCase().trim() === String(activityCity).toLowerCase().trim();
  },

  /**
   * Busca hoteles usando Google Places
   * @param {string} query - Búsqueda (ej: "Hotel Shinjuku Tokyo")
   * @param {Object} coordinates - {lat, lng} para búsqueda cercana
   * @returns {Promise<Array>} Lista de hoteles
   */
  async searchHotels(query, coordinates = null) {
    console.log(`🏨 Buscando hoteles: "${query}" en`, coordinates);

    try {
      let results = [];

      // Si hay un query específico (búsqueda manual), usar Text Search
      if (query && query.trim() && query.toLowerCase() !== 'hotel') {
        console.log('🔍 Usando Text Search para:', query);

        // Usar textSearch con el query completo
        const response = await GooglePlacesAPI.textSearch({
          query: query,
          lat: coordinates?.lat,
          lng: coordinates?.lng,
          radius: coordinates ? 10000 : 50000, // 10km si hay coords, 50km si no
          includedTypes: ['hotel', 'lodging'],
          maxResults: 50
        });

        if (response.success) {
          results = response.places || [];
          console.log(`✅ Text Search encontró ${results.length} hoteles`);
        }
      }
      // Si solo hay coordenadas, búsqueda nearby
      else if (coordinates) {
        console.log('📍 Usando Nearby Search');
        const response = await GooglePlacesAPI.searchNearbyNew({
          lat: coordinates.lat,
          lng: coordinates.lng,
          radius: 10000, // 10km - más que antes
          includedTypes: ['hotel', 'lodging'],
          maxResults: 50
        });

        if (response.success) {
          results = response.places || [];
          console.log(`✅ Nearby Search encontró ${results.length} hoteles`);
        }
      }

      console.log(`✅ Total encontrados: ${results.length} hoteles`);
      return results;

    } catch (error) {
      console.error('❌ Error buscando hoteles:', error);
      return [];
    }
  },

  /**
   * Detecta rangos de días por ciudad (para soportar múltiples visitas a la misma ciudad)
   * @param {Object} itinerary - Itinerario completo
   * @returns {Array} Segmentos [{ city, startDay, endDay }]
   */
  detectCitySegments(itinerary) {
    if (!itinerary.days || itinerary.days.length === 0) return [];

    const segments = [];
    let currentCity = null;
    let currentStart = null;

    itinerary.days.forEach((day, index) => {
      const dayCity = this.detectCityForDay(day);

      if (dayCity !== currentCity) {
        // Nueva ciudad o nuevo segmento
        if (currentCity !== null) {
          // Guardar segmento anterior
          segments.push({
            city: currentCity,
            startDay: currentStart,
            endDay: index // El día anterior
          });
        }
        currentCity = dayCity;
        currentStart = index + 1; // dayNumber es 1-based
      }
    });

    // Guardar último segmento
    if (currentCity !== null) {
      segments.push({
        city: currentCity,
        startDay: currentStart,
        endDay: itinerary.days.length
      });
    }

    console.log('📊 City segments detected:', segments);
    return segments;
  },

  /**
   * Agrega un hotel como base del itinerario
   * @param {Object} itinerary - Itinerario actual
   * @param {Object} hotel - Datos del hotel de Google Places
   * @param {string} city - Ciudad (Tokyo, Kyoto, Osaka)
   * @param {number} dayNumber - Día actual (para detectar segmento)
   * @returns {Object} Itinerario actualizado
   */
  addHotelToItinerary(itinerary, hotel, city, dayNumber = null) {
    if (!itinerary.hotels) {
      itinerary.hotels = {};
    }

    // Estructura del hotel
    const hotelData = {
      id: hotel.id,
      name: hotel.name,
      address: hotel.address,
      coordinates: hotel.coordinates,
      city: city,
      rating: hotel.rating || 0,
      addedAt: new Date().toISOString()
    };

    // Detectar segmentos de ciudades para soportar múltiples visitas
    const segments = this.detectCitySegments(itinerary);
    const citySegments = segments.filter(s => s.city === city);

    let hotelKey = city;

    if (citySegments.length > 1 && dayNumber) {
      // Múltiples visitas a la misma ciudad - usar rango de días
      const segment = citySegments.find(s => dayNumber >= s.startDay && dayNumber <= s.endDay);
      if (segment) {
        hotelKey = `${city}_${segment.startDay}-${segment.endDay}`;
        console.log(`🔑 Using segment key: ${hotelKey} (múltiples visitas a ${city})`);
      }
    } else if (citySegments.length > 1) {
      // Si no sabemos el día, usar el primer segmento por defecto
      const segment = citySegments[0];
      hotelKey = `${city}_${segment.startDay}-${segment.endDay}`;
      console.warn(`⚠️ Múltiples segmentos de ${city} pero sin dayNumber. Usando primer segmento: ${hotelKey}`);
    }

    itinerary.hotels[hotelKey] = hotelData;

    console.log(`✅ Hotel agregado con key "${hotelKey}":`, hotelData.name);
    return itinerary;
  },

  /**
   * Obtiene el hotel base para una ciudad en un día específico
   * @param {Object} itinerary - Itinerario
   * @param {string} city - Ciudad
   * @param {number} dayNumber - Número del día (opcional, para detectar segmento correcto)
   * @returns {Object|null} Hotel o null
   */
  getHotelForCity(itinerary, city, dayNumber = null) {
    if (!itinerary.hotels) {
      return null;
    }

    // Si hay dayNumber, buscar el hotel del segmento correcto
    if (dayNumber && itinerary.days) {
      const segments = this.detectCitySegments(itinerary);
      const segment = segments.find(s => s.city === city && dayNumber >= s.startDay && dayNumber <= s.endDay);

      if (segment) {
        const segmentKey = `${city}_${segment.startDay}-${segment.endDay}`;
        if (itinerary.hotels[segmentKey]) {
          console.log(`🏨 Hotel found for ${city} day ${dayNumber} using segment key: ${segmentKey}`);
          return itinerary.hotels[segmentKey];
        }
      }
    }

    // Fallback: buscar por nombre de ciudad simple
    if (itinerary.hotels[city]) {
      return itinerary.hotels[city];
    }

    // Fallback 2: buscar cualquier key que empiece con la ciudad
    const cityKeys = Object.keys(itinerary.hotels).filter(key => key.startsWith(city));
    if (cityKeys.length > 0) {
      console.log(`🏨 Using first available hotel for ${city}: ${cityKeys[0]}`);
      return itinerary.hotels[cityKeys[0]];
    }

    return null;
  },

  /**
   * Detecta la ciudad principal de un día basándose en las actividades
   * @param {Object} day - Día del itinerario
   * @returns {string} Ciudad detectada (Tokyo, Kyoto, Osaka, etc.)
   */
  detectCityForDay(day) {
    // Prioridad 0: Si el día YA tiene una ciudad explícita guardada, usarla directamente
    // sin volver a analizar actividades. Esto es crítico durante una reasignación: pasos
    // como ActivityDayAssignment vacían day.activities temporalmente antes de repartir
    // las actividades de nuevo, y sin este atajo detectCityForDay caía siempre en el
    // fallback "sin actividades" y devolvía 'Tokyo' para TODOS los días por igual,
    // rompiendo el emparejamiento por ciudad para el resto del proceso.
    if (day.city) {
      return this.normalizeCityName(day.city);
    }

    if (!day.activities || day.activities.length === 0) {
      // Fallback 1: Usar day.location si existe
      if (day.location) {
        const normalized = this.normalizeCityName(day.location);
        console.log(`📍 Ciudad detectada para día ${day.day}: ${normalized} (desde day.location)`);
        return normalized;
      }
      console.log(`📍 Ciudad detectada para día ${day.day}: Tokyo (por defecto - sin actividades)`);
      return 'Tokyo'; // Por defecto
    }

    // ESTRATEGIA 1 (PRINCIPAL): Usar cityName o city de las actividades
    // Esta es la fuente MÁS CONFIABLE y funciona con CUALQUIER ciudad
    const cityVotes = {};

    day.activities.forEach(activity => {
      // Prioridad 1: cityName explícito (SIEMPRE usar esto primero)
      if (activity.cityName) {
        const normalized = this.normalizeCityName(activity.cityName);
        cityVotes[normalized] = (cityVotes[normalized] || 0) + 100; // Peso MÁXIMO
      }
      // Prioridad 2: city property
      else if (activity.city) {
        const normalized = this.normalizeCityName(activity.city);
        cityVotes[normalized] = (cityVotes[normalized] || 0) + 80; // Peso alto
      }
      // Prioridad 3: Coordenadas → ciudad conocida más cercana (itinerarios viejos que
      // nunca guardaron cityName/city pero SÍ tienen coordenadas geocodificadas)
      else if (activity.coordinates || (activity.lat && activity.lng)) {
        const coords = activity.coordinates || { lat: activity.lat, lng: activity.lng };
        const byCoords = this.findNearestCityCenter(coords);
        if (byCoords) {
          cityVotes[byCoords] = (cityVotes[byCoords] || 0) + 50; // Peso medio
        }
      }
      // Prioridad 4: Analizar el título/nombre de la actividad
      else {
        // Extraer ciudad del texto de la actividad
        const extractedCity = this.extractCityFromText(activity);
        if (extractedCity) {
          cityVotes[extractedCity] = (cityVotes[extractedCity] || 0) + 5; // Peso bajo (menos confiable)
        }
      }
    });

    // ESTRATEGIA 2: Si NO se encontró ninguna ciudad por propiedades, usar coordenadas
    if (Object.keys(cityVotes).length === 0) {
      console.log(`      ⚠️ No se encontró cityName/city en actividades, usando coordenadas...`);
      const cityByCoords = this.detectCityByCoordinates(day.activities);
      if (cityByCoords) {
        console.log(`📍 Ciudad detectada para día ${day.day}: ${cityByCoords} (por coordenadas)`);
        return cityByCoords;
      }
      // Último fallback
      console.log(`📍 Ciudad detectada para día ${day.day}: Tokyo (fallback final - sin datos)`);
      return 'Tokyo';
    }

    // DETECTAR DÍAS MEZCLADOS (múltiples ciudades con votos similares)
    const cityEntries = Object.entries(cityVotes).sort((a, b) => b[1] - a[1]);

    if (cityEntries.length >= 2) {
      const topCity = cityEntries[0];
      const secondCity = cityEntries[1];

      // Si hay empate o casi empate (diferencia < 20 votos)
      if (Math.abs(topCity[1] - secondCity[1]) < 20) {
        if (day.isTransitionDay) {
          // Esperado: un día de transición entre ciudades legítimamente tiene
          // actividades de ambas. No es un error a corregir.
          console.log(`ℹ️ Día ${day.day} es día de transición: ${topCity[0]} (${topCity[1]}) ↔ ${secondCity[0]} (${secondCity[1]})`);
        } else {
          console.warn(`⚠️ DÍA ${day.day} MEZCLADO: ${topCity[0]} (${topCity[1]}) vs ${secondCity[0]} (${secondCity[1]})`);
          console.warn(`   → Actividades de múltiples ciudades en el mismo día sin marcar como transición - revisar`);
        }

        // Usar la ciudad con actividades de mayor prioridad (mayor peso individual)
        // Si ambas son cityName (peso 100), usar la primera actividad del día
        if (day.activities && day.activities.length > 0) {
          const firstActivity = day.activities[0];
          const firstCity = this.normalizeCityName(firstActivity.cityName || firstActivity.city || '');
          if (firstCity && cityVotes[firstCity]) {
            console.log(`   → Usando ciudad de primera actividad: ${firstCity}`);
            return firstCity;
          }
        }
      }
    }

    // Retornar la ciudad con más votos
    let maxCity = null;
    let maxVotes = 0;

    Object.entries(cityVotes).forEach(([city, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        maxCity = city;
      }
    });

    console.log(`📍 Ciudad detectada para día ${day.day}: ${maxCity} (${maxVotes} votos) - Ciudades evaluadas:`, cityVotes);
    return maxCity || 'Tokyo';
  },

  /**
   * Extrae ciudad del texto de una actividad (fallback menos confiable)
   */
  extractCityFromText(activity) {
    const text = `${activity.title || ''} ${activity.name || ''} ${activity.area || ''} ${activity.zone || ''} ${activity.description || ''}`.toLowerCase();

    // Lista de ciudades comunes en Japón (como fallback)
    // Esta lista es solo para ayudar cuando NO hay cityName/city
    const commonCities = [
      'tokyo', 'kyoto', 'osaka', 'hakone', 'kamakura', 'nara', 'hiroshima',
      'yokohama', 'nagoya', 'sapporo', 'fukuoka', 'kobe', 'kawasaki',
      'nikko', 'takayama', 'kanazawa', 'matsumoto', 'nagano', 'sendai',
      'okinawa', 'ishigaki', 'miyajima', 'himeji', 'kumamoto'
    ];

    for (const city of commonCities) {
      if (text.includes(city)) {
        return this.normalizeCityName(city);
      }
    }

    return null;
  },

  /**
   * Normaliza nombres de ciudades a formato estándar
   */
  normalizeCityName(cityName) {
    if (!cityName) return 'Tokyo';

    const normalized = cityName.toLowerCase().trim();

    // Mapeo de variaciones a nombre estándar
    const cityMap = {
      'tokyo': 'Tokyo',
      'tokio': 'Tokyo',
      'kyoto': 'Kyoto',
      'kioto': 'Kyoto',
      'osaka': 'Osaka',
      'ōsaka': 'Osaka',
      'hakone': 'Hakone',
      '箱根': 'Hakone',
      'kamakura': 'Kamakura',
      'nara': 'Nara',
      'hiroshima': 'Hiroshima'
    };

    // Buscar coincidencia exacta
    if (cityMap[normalized]) {
      return cityMap[normalized];
    }

    // Buscar coincidencia parcial
    for (const [key, value] of Object.entries(cityMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    // Capitalizar primera letra si no encontramos
    return cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();
  },

  /**
   * Detecta ciudad por coordenadas de las actividades
   * COMPLETAMENTE DINÁMICO - No depende de listas hardcodeadas
   */
  detectCityByCoordinates(activities) {
    if (!activities || activities.length === 0) return null;

    // 🎯 ESTRATEGIA DINÁMICA: Agrupar actividades por proximidad geográfica
    // Si las actividades están cerca unas de otras, probablemente están en la misma ciudad

    const activitiesWithCoords = activities.filter(
      a => a.coordinates && a.coordinates.lat && a.coordinates.lng
    );

    if (activitiesWithCoords.length === 0) return null;

    // Si solo hay una actividad con coordenadas, usar su cityName si existe
    if (activitiesWithCoords.length === 1) {
      const activity = activitiesWithCoords[0];
      if (activity.cityName) return this.normalizeCityName(activity.cityName);
      if (activity.city) return this.normalizeCityName(activity.city);
    }

    // Calcular centro geográfico (centroid) de todas las actividades
    let sumLat = 0, sumLng = 0;
    activitiesWithCoords.forEach(activity => {
      sumLat += activity.coordinates.lat;
      sumLng += activity.coordinates.lng;
    });

    const centerLat = sumLat / activitiesWithCoords.length;
    const centerLng = sumLng / activitiesWithCoords.length;

    console.log(`      🌍 Centro geográfico del día: {lat: ${centerLat.toFixed(4)}, lng: ${centerLng.toFixed(4)}}`);

    // 🔍 MÉTODO 1: Buscar si alguna actividad con cityName está cerca del centro
    let bestMatch = null;
    let minDistanceToCenter = Infinity;

    activitiesWithCoords.forEach(activity => {
      if (activity.cityName || activity.city) {
        const distance = Math.sqrt(
          Math.pow(activity.coordinates.lat - centerLat, 2) +
          Math.pow(activity.coordinates.lng - centerLng, 2)
        );

        if (distance < minDistanceToCenter) {
          minDistanceToCenter = distance;
          bestMatch = activity.cityName || activity.city;
        }
      }
    });

    if (bestMatch) {
      console.log(`      ✅ Ciudad más cercana al centro: ${bestMatch}`);
      return this.normalizeCityName(bestMatch);
    }

    // 🔍 MÉTODO 2 (Fallback): Usar actividad más céntrica y geocoding inverso (simulado)
    // Buscar en referencia de ciudades japonesas comunes (solo como último recurso)
    const japanCityRefs = {
      Tokyo: { lat: 35.6762, lng: 139.6503 },
      Kyoto: { lat: 35.0116, lng: 135.7681 },
      Osaka: { lat: 34.6937, lng: 135.5023 },
      Hakone: { lat: 35.2325, lng: 139.1069 },
      Kamakura: { lat: 35.3193, lng: 139.5463 },
      Nara: { lat: 34.6851, lng: 135.8048 },
      Hiroshima: { lat: 34.3853, lng: 132.4553 },
      Yokohama: { lat: 35.4437, lng: 139.6380 },
      Nagoya: { lat: 35.1815, lng: 136.9066 },
      Sapporo: { lat: 43.0642, lng: 141.3469 },
      Fukuoka: { lat: 33.5904, lng: 130.4017 },
      Nikko: { lat: 36.7199, lng: 139.6982 },
      Takayama: { lat: 36.1460, lng: 137.2531 },
      Kanazawa: { lat: 36.5944, lng: 136.6256 }
    };

    let closestRefCity = null;
    let minRefDistance = Infinity;

    Object.entries(japanCityRefs).forEach(([city, coords]) => {
      const distance = Math.sqrt(
        Math.pow(coords.lat - centerLat, 2) + Math.pow(coords.lng - centerLng, 2)
      );

      if (distance < minRefDistance) {
        minRefDistance = distance;
        closestRefCity = city;
      }
    });

    if (closestRefCity && minRefDistance < 0.5) { // Solo si está muy cerca (~50km)
      console.log(`      ⚠️ Usando referencia geográfica cercana: ${closestRefCity} (distancia: ${(minRefDistance * 111).toFixed(1)}km)`);
      return closestRefCity;
    }

    console.log(`      ❌ No se pudo determinar ciudad por coordenadas`);
    return null;
  },

  /**
   * Calcula la distancia desde el hotel a una actividad
   * @param {Object} hotel - Hotel base
   * @param {Object} activity - Actividad
   * @returns {number} Distancia en km
   */
  calculateDistanceFromHotel(hotel, activity) {
    if (!hotel || !hotel.coordinates || !activity.coordinates) {
      return Infinity;
    }

    const R = 6371; // Radio de la Tierra en km
    const dLat = (activity.coordinates.lat - hotel.coordinates.lat) * Math.PI / 180;
    const dLon = (activity.coordinates.lng - hotel.coordinates.lng) * Math.PI / 180;

    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(hotel.coordinates.lat * Math.PI / 180) *
      Math.cos(activity.coordinates.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return Math.round(distance * 100) / 100;
  },

  /**
   * Genera análisis de distancias desde el hotel para un día
   * @param {Object} itinerary - Itinerario completo
   * @param {number} dayNumber - Número del día
   * @returns {Object} Análisis con distancias y sugerencias
   */
  analyzeDayFromHotel(itinerary, dayNumber) {
    const day = itinerary.days.find(d => d.day === dayNumber);
    if (!day) return null;

    const city = this.detectCityForDay(day);
    const hotel = this.getHotelForCity(itinerary, city);

    if (!hotel) {
      return {
        hasHotel: false,
        city: city,
        message: `No hay hotel configurado para ${city}`
      };
    }

    const analysis = {
      hasHotel: true,
      city: city,
      hotel: hotel,
      activities: [],
      avgDistance: 0,
      maxDistance: 0,
      suggestions: []
    };

    // Analizar cada actividad
    let totalDistance = 0;
    day.activities.forEach(activity => {
      const distance = this.calculateDistanceFromHotel(hotel, activity);

      analysis.activities.push({
        name: activity.title || activity.name,
        distance: distance,
        coordinates: activity.coordinates
      });

      totalDistance += distance;
      if (distance > analysis.maxDistance) {
        analysis.maxDistance = distance;
      }
    });

    if (day.activities.length > 0) {
      analysis.avgDistance = Math.round((totalDistance / day.activities.length) * 100) / 100;
    }

    // Generar sugerencias
    if (analysis.avgDistance > 5) {
      analysis.suggestions.push({
        type: 'warning',
        message: `Las actividades están lejos del hotel (promedio ${analysis.avgDistance}km). Considera reordenar o agrupar por zona.`
      });
    }

    if (analysis.maxDistance > 10) {
      analysis.suggestions.push({
        type: 'warning',
        message: `Hay actividades muy lejanas (hasta ${analysis.maxDistance}km). El tiempo de traslado será significativo.`
      });
    }

    if (analysis.avgDistance < 2) {
      analysis.suggestions.push({
        type: 'success',
        message: `¡Excelente! Las actividades están cerca del hotel (promedio ${analysis.avgDistance}km).`
      });
    }

    return analysis;
  },

  /**
   * Renderiza la UI para gestionar hoteles
   * @param {Object} itinerary - Itinerario actual
   * @param {Function} onHotelAdded - Callback cuando se agrega un hotel
   */
  renderHotelManagementUI(itinerary, onHotelAdded) {
    const cities = ['Tokyo', 'Kyoto', 'Osaka', 'Nara', 'Hiroshima'];

    let html = `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          <span>🏨</span> Hoteles Base por Ciudad
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Configura dónde te hospedarás en cada ciudad para optimizar las sugerencias y rutas.
        </p>

        <div class="space-y-4">
    `;

    cities.forEach(city => {
      const hotel = this.getHotelForCity(itinerary, city);

      html += `
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-bold text-lg text-gray-800 dark:text-white">${city}</h4>
            ${hotel ? '<span class="text-green-600 dark:text-green-400 text-sm">✓ Configurado</span>' : '<span class="text-gray-400 text-sm">Sin hotel</span>'}
          </div>

          ${hotel ? `
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
              <p class="font-semibold text-gray-800 dark:text-white">${hotel.name}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">${hotel.address}</p>
              ${hotel.rating ? `<p class="text-sm text-yellow-600 dark:text-yellow-400 mt-1">⭐ ${hotel.rating}</p>` : ''}
            </div>
          ` : ''}

          <button
            onclick="HotelBaseSystem.openHotelSearch('${city}')"
            class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            ${hotel ? '🔄 Cambiar Hotel' : '➕ Agregar Hotel'}
          </button>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  },

  /**
   * Abre el modal de búsqueda de hoteles
   * @param {string} city - Ciudad para buscar
   */
  async openHotelSearch(city) {
    console.log(`🔍 Abriendo búsqueda de hoteles para ${city}`);

    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'hotelSearchModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold text-gray-800 dark:text-white">
              🏨 Buscar Hotel en ${city}
            </h3>
            <button onclick="document.getElementById('hotelSearchModal').remove()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="relative">
            <input
              id="hotelSearchInput"
              type="text"
              placeholder="Buscar hotel (ej: Hotel Shinjuku, Tokyo Station Hotel...)"
              class="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onclick="HotelBaseSystem.performHotelSearch('${city}')"
              class="absolute right-2 top-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
            >
              🔍
            </button>
          </div>
        </div>

        <div id="hotelSearchResults" class="flex-1 overflow-y-auto p-6">
          <div class="text-center text-gray-500 dark:text-gray-400 py-12">
            Escribe el nombre de un hotel y presiona buscar
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Auto-buscar hoteles populares
    setTimeout(() => this.performHotelSearch(city), 500);
  },

  /**
   * Realiza la búsqueda de hoteles
   * @param {string} city - Ciudad
   */
  async performHotelSearch(city) {
    const resultsDiv = document.getElementById('hotelSearchResults');
    resultsDiv.innerHTML = `
      <div class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Buscando hoteles...</p>
      </div>
    `;

    // Coordenadas de las ciudades
    const cityCoords = {
      Tokyo: { lat: 35.6762, lng: 139.6503 },
      Kyoto: { lat: 35.0116, lng: 135.7681 },
      Osaka: { lat: 34.6937, lng: 135.5023 },
      Nara: { lat: 34.6851, lng: 135.8050 },
      Hiroshima: { lat: 34.3853, lng: 132.4553 }
    };

    const coords = cityCoords[city] || cityCoords.Tokyo;
    const hotels = await this.searchHotels('', coords);

    if (hotels.length === 0) {
      resultsDiv.innerHTML = `
        <div class="text-center text-gray-500 dark:text-gray-400 py-12">
          No se encontraron hoteles. Intenta con otro término de búsqueda.
        </div>
      `;
      return;
    }

    let html = '<div class="grid gap-4">';
    hotels.forEach(hotel => {
      html += `
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer"
             onclick="HotelBaseSystem.selectHotel('${city}', ${JSON.stringify(hotel).replace(/"/g, '&quot;')})">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-bold text-gray-800 dark:text-white mb-1">${hotel.name}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${hotel.address}</p>
              <div class="flex items-center gap-3 text-sm">
                ${hotel.rating ? `<span class="text-yellow-600 dark:text-yellow-400">⭐ ${hotel.rating}</span>` : ''}
                ${hotel.userRatingsTotal ? `<span class="text-gray-500 dark:text-gray-400">(${hotel.userRatingsTotal} reviews)</span>` : ''}
              </div>
            </div>
            <button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition text-sm">
              Seleccionar
            </button>
          </div>
        </div>
      `;
    });
    html += '</div>';

    resultsDiv.innerHTML = html;
  },

  /**
   * Selecciona un hotel
   * @param {string} city - Ciudad
   * @param {Object} hotel - Hotel seleccionado
   */
  async selectHotel(city, hotel) {
    console.log(`✅ Hotel seleccionado para ${city}:`, hotel.name);

    if (!window.ItineraryHandler) {
      alert('Error: No hay itinerario activo');
      return;
    }

    // Delega al flujo existente (agrega el hotel y persiste en Firebase)
    await window.ItineraryHandler.selectHotelForCity({
      id: hotel.id,
      displayName: hotel.displayName || hotel.name,
      formattedAddress: hotel.formattedAddress || hotel.address,
      location: hotel.location || hotel.coordinates,
      rating: hotel.rating
    }, city);

    // Cerrar modal
    document.getElementById('hotelSearchModal')?.remove();

    // Recargar UI si existe
    if (window.location.href.includes('dashboard.html')) {
      // Trigger refresh del dashboard o la sección relevante
      window.dispatchEvent(new CustomEvent('hotel:updated', { detail: { city, hotel } }));
    }
  }
};

// Exponer globalmente
window.HotelBaseSystem = HotelBaseSystem;

export default HotelBaseSystem;
