// js/hotel-base-system.js - Sistema de Hotel Base Inteligente
// Gestiona hoteles por ciudad y optimiza sugerencias basadas en ubicación

import { GooglePlacesAPI } from './google-places.js';
import { APP_CONFIG } from './config.js';

/**
 * Sistema de Hotel Base - Gestiona hoteles por ciudad
 */
export const HotelBaseSystem = {
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
    if (!day.activities || day.activities.length === 0) {
      return 'Tokyo'; // Por defecto
    }

    // Contar menciones de ciudades en las actividades
    const cityMentions = {
      Tokyo: 0,
      Kyoto: 0,
      Osaka: 0,
      Nara: 0,
      Hiroshima: 0
    };

    day.activities.forEach(activity => {
      const text = `${activity.title || ''} ${activity.name || ''} ${activity.area || ''} ${activity.zone || ''}`.toLowerCase();

      if (text.includes('tokyo') || text.includes('shibuya') || text.includes('shinjuku') || text.includes('asakusa')) {
        cityMentions.Tokyo++;
      }
      if (text.includes('kyoto') || text.includes('gion') || text.includes('arashiyama')) {
        cityMentions.Kyoto++;
      }
      if (text.includes('osaka') || text.includes('dotonbori') || text.includes('namba')) {
        cityMentions.Osaka++;
      }
      if (text.includes('nara')) {
        cityMentions.Nara++;
      }
      if (text.includes('hiroshima')) {
        cityMentions.Hiroshima++;
      }
    });

    // Retornar la ciudad con más menciones
    let maxCity = 'Tokyo';
    let maxCount = 0;

    Object.entries(cityMentions).forEach(([city, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxCity = city;
      }
    });

    console.log(`📍 Ciudad detectada para día ${day.day}: ${maxCity} (${maxCount} menciones)`);
    return maxCity;
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
  selectHotel(city, hotel) {
    console.log(`✅ Hotel seleccionado para ${city}:`, hotel.name);

    // Obtener itinerario actual
    const currentItinerary = window.ItineraryHandler?.currentItinerary;
    if (!currentItinerary) {
      alert('Error: No hay itinerario activo');
      return;
    }

    // Agregar hotel al itinerario
    this.addHotelToItinerary(currentItinerary, hotel, city);

    // Guardar itinerario actualizado
    if (window.ItineraryHandler && window.ItineraryHandler.saveCurrentItinerary) {
      window.ItineraryHandler.saveCurrentItinerary();
    }

    // Cerrar modal
    document.getElementById('hotelSearchModal')?.remove();

    // Notificar
    if (window.Notifications) {
      window.Notifications.show(`Hotel configurado para ${city}: ${hotel.name}`, 'success');
    }

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
