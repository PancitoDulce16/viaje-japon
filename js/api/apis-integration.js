// js/apis-integration.js - Integración completa de APIs externas
import { API_KEYS, API_ENDPOINTS, apiRequest } from '../core/apis-config.js';
import { Notifications } from '../core/notifications.js';

/**
 * 🔌 API INTEGRATION MODULE
 * Conecta todas las APIs externas con la aplicación
 */

export const APIsIntegration = {
  /**
   * Mock fetch for local /api endpoints, bridging to Firebase data
   * Endpoints:
   * - GET /api/itinerary/:tripId
   * - POST /api/itinerary/:tripId/day
   * - GET /api/activities/:dayId
   * - POST /api/activities/:dayId
   */
  async handleLocalApi(request) {
    const url = new URL(request.url, window.location.origin);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    try {
      // Read current itinerary from ItineraryHandler to avoid duplicating Firebase code
      const Itinerary = window.ItineraryHandler;

      // GET /api/itinerary/:tripId
      const itineraryMatch = path.match(/^\/api\/itinerary\/(.+)$/);
      if (method === 'GET' && itineraryMatch) {
        const tripId = itineraryMatch[1];
        // Ensure itinerary is loaded for the active trip
        const data = await Itinerary.ensureLoaded();
        const response = (data?.days || []).map(d => ({
          id: `day-${d.day}`,
          tripId,
          day: d.day,
          date: d.date,
          city: d.city || '',
          heroImage: d.heroImage || '',
          activities: d.activities || []
        }));
        return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // POST /api/itinerary/:tripId/day
      const addDayMatch = path.match(/^\/api\/itinerary\/([^/]+)\/day$/);
      if (method === 'POST' && addDayMatch) {
        const tripId = addDayMatch[1];
        const body = await request.json();
        await Itinerary.ensureLoaded();
        const itinerary = Itinerary.currentItinerary;
        const newDay = {
          id: `day-${body.day}`,
          day: body.day,
          date: body.date,
          city: body.city || '',
          heroImage: body.heroImage || '',
          activities: []
        };
        // Insert or replace day
        const idx = itinerary.days.findIndex(d => d.day === body.day);
        if (idx >= 0) itinerary.days[idx] = newDay; else itinerary.days.push(newDay);
        // Persist via existing save method
        await (async () => {
          const { doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../core/firebase-config.js');
          const { FIREBASE_PATHS } = await import('../core/constants.js');
          const itineraryRef = doc(db, FIREBASE_PATHS.ITINERARY(tripId));
          await setDoc(itineraryRef, itinerary);
        })();
        return new Response(JSON.stringify(newDay), { status: 201, headers: { 'Content-Type': 'application/json' } });
      }

      // GET /api/activities/:dayId
      const getActsMatch = path.match(/^\/api\/activities\/([^/]+)$/);
      if (method === 'GET' && getActsMatch) {
        const dayId = getActsMatch[1];
        await Itinerary.ensureLoaded();
        const dayNum = parseInt(dayId.replace('day-', ''));
        const day = Itinerary.currentItinerary?.days?.find(d => d.day === dayNum);
        const response = (day?.activities || []).map(a => ({
          id: a.id,
          dayId,
          time: a.time || '',
          title: a.title || a.name || '',
          location: a.station || a.location || '',
          type: (a.category || 'activity'),
          weather: a.weather || null
        }));
        return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // POST /api/activities/:dayId
      if (method === 'POST' && getActsMatch) {
        const dayId = getActsMatch[1];
        const body = await request.json();
        await Itinerary.ensureLoaded();
        const dayNum = parseInt(dayId.replace('day-', ''));
        const itinerary = Itinerary.currentItinerary;
        const day = itinerary.days.find(d => d.day === dayNum);
        if (!day) {
          return new Response(JSON.stringify({ error: 'Day not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        const newActivity = {
          id: `act-${Date.now()}`,
          time: body.time || '',
          title: body.title || '',
          desc: body.description || '',
          station: body.location || '',
          cost: typeof body.cost === 'number' ? body.cost : 0,
          type: body.type || 'activity'
        };
        day.activities.push(newActivity);
        // Persist
        const tripId = window.TripsManager?.currentTrip?.id || localStorage.getItem('currentTripId');
        await (async () => {
          const { doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../core/firebase-config.js');
          const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
          await setDoc(itineraryRef, itinerary);
        })();
        return new Response(JSON.stringify(newActivity), { status: 201, headers: { 'Content-Type': 'application/json' } });
      }

      // Not handled
      return null;
    } catch (err) {
      console.error('Local API error:', err);
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  },
  
  // ==============================
  // ✈️ VUELOS (AviationStack)
  // ==============================
  
  /**
   * Buscar información de vuelo por número usando FlightRadar24
   * @param {string} flightNumber - Número de vuelo (ej: "AM58")
   * @param {string} date - Fecha en formato YYYY-MM-DD (opcional, no usado actualmente)
   * @returns {Promise<Object>} Información del vuelo
   */
  async searchFlights(flightNumber, date = null) {
    try {
      console.log('🔍 === SEARCH FLIGHTS (FlightRadar24) ===');
      console.log('📋 Parámetros:', { flightNumber, date });

      const url = `/flightsProxy?flight_number=${encodeURIComponent(flightNumber)}`;
      console.log('🔗 URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('📊 Respuesta completa:', data);

      if (data.success && data.data && data.data.length > 0) {
        console.log(`✈️ ${data.data.length} vuelo(s) encontrado(s)`);
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: 'No se encontró información para ese número de vuelo.'
        };
      }
    } catch (error) {
      console.error('❌ Error buscando vuelo:', error);
      return {
        success: false,
        error: error.message || 'Error al buscar el vuelo'
      };
    }
  },
  
  /**
   * Obtener información de aeropuerto por código IATA
   * @param {string} airportCode - Código IATA (ej: "NRT", "HND")
   * @returns {Promise<Object>} Información del aeropuerto
   */
  async getAirportInfo(airportCode) {
    try {
      const url = API_ENDPOINTS.flights.airports(airportCode);
      const data = await apiRequest(url);
      
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('❌ Error obteniendo info de aeropuerto:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Obtener estado de vuelo en tiempo real
   * @param {string} flightNumber - Número de vuelo
   * @param {string} date - Fecha del vuelo
   * @returns {Promise<Object>} Estado del vuelo
   */
  async getFlightStatus(flightNumber, date) {
    try {
      const result = await this.searchFlights(flightNumber, date);
      
      if (result.success && result.data.length > 0) {
        const flight = result.data[0];
        return {
          success: true,
          status: flight.flight_status,
          departure: flight.departure,
          arrival: flight.arrival,
          airline: flight.airline,
          aircraft: flight.aircraft
        };
      }
      
      return {
        success: false,
        message: 'No se pudo obtener el estado del vuelo'
      };
    } catch (error) {
      console.error('❌ Error obteniendo estado de vuelo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // ==============================
  // 🏨 HOTELES (LiteAPI)
  // ==============================
  
  /**
   * Buscar hoteles en una ciudad
   * @param {string} cityCode - Código IATA de la ciudad (ej: "TYO")
   * @param {string} checkIn - Fecha check-in (YYYY-MM-DD)
   * @param {string} checkOut - Fecha check-out (YYYY-MM-DD)
   * @param {number} guests - Número de huéspedes
   * @returns {Promise<Object>} Lista de hoteles
   */
  async searchHotels(cityCode, checkIn, checkOut, guests = 2) {
    try {
      console.log('🔍 Iniciando búsqueda de hoteles...');
      console.log('📋 Parámetros:', { cityCode, checkIn, checkOut, guests });

      const searchData = {
        checkin: checkIn,
        checkout: checkOut,
        currency: 'USD',
        guestNationality: 'MX',
        occupancies: [
          {
            rooms: 1,
            adults: guests,
            children: []
          }
        ],
        iataCode: cityCode
      };

      console.log('📦 Datos de búsqueda:', searchData);

      const url = API_ENDPOINTS.hotels.search();
      console.log('🔗 URL:', url);
      console.log('🔑 API Key presente:', API_KEYS?.liteAPI?.apiKey ? 'Sí (***' + API_KEYS.liteAPI.apiKey.slice(-4) + ')' : 'No');

      const data = await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(searchData)
      });

      console.log('📊 Respuesta de API:', data);

      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        console.log(`🏨 ${data.data.length} hoteles encontrados en ${cityCode}`);
        return {
          success: true,
          hotels: data.data,
          searchId: data.searchId
        };
      } else if (data.data && Array.isArray(data.data) && data.data.length === 0) {
        console.log('😕 Búsqueda exitosa pero sin resultados');
        return {
          success: false,
          message: 'No se encontraron hoteles para las fechas y ciudad seleccionadas'
        };
      } else if (data.error) {
        console.error('❌ Error en respuesta de API:', data.error);
        return {
          success: false,
          message: data.error.message || data.error.toString(),
          error: data.error
        };
      }

      console.log('⚠️ Respuesta inesperada de la API');
      return {
        success: false,
        message: 'Respuesta inesperada del servidor'
      };
    } catch (error) {
      console.error('❌ Error buscando hoteles:', error);

      // Analizar el tipo de error
      let errorMessage = error.message;

      if (error.message.includes('API Error 401')) {
        errorMessage = 'Error de autenticación con la API (401). La clave API es inválida.';
      } else if (error.message.includes('API Error 403')) {
        errorMessage = 'Acceso denegado (403). La API key no tiene permisos.';
      } else if (error.message.includes('API Error 429')) {
        errorMessage = 'Límite de solicitudes excedido (429). Intenta en unos minutos.';
      } else if (error.message.includes('API Error 404')) {
        errorMessage = 'Endpoint no encontrado (404). Verifica la configuración de la API.';
      } else if (error.message.includes('API Error 500')) {
        errorMessage = 'Error del servidor (500). Intenta más tarde.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      }

      return {
        success: false,
        error: errorMessage,
        originalError: error.message
      };
    }
  },
  
  /**
   * Obtener detalles de un hotel específico
   * @param {string} hotelId - ID del hotel
   * @returns {Promise<Object>} Detalles del hotel
   */
  async getHotelDetails(hotelId) {
    try {
      const url = API_ENDPOINTS.hotels.details(hotelId);
      const data = await apiRequest(url);
      
      return {
        success: true,
        hotel: data.data
      };
    } catch (error) {
      console.error('❌ Error obteniendo detalles del hotel:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Obtener ciudades disponibles por país
   * @param {string} countryCode - Código del país (ej: "JP" para Japón)
   * @returns {Promise<Object>} Lista de ciudades
   */
  async getCitiesByCountry(countryCode = 'JP') {
    try {
      const url = API_ENDPOINTS.hotels.cities(countryCode);
      const data = await apiRequest(url);
      
      return {
        success: true,
        cities: data.data
      };
    } catch (error) {
      console.error('❌ Error obteniendo ciudades:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // ==============================
  // 📍 LUGARES (Foursquare)
  // ==============================
  
  /**
   * Buscar lugares cercanos por categoría
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @param {string} category - Categoría (ej: "restaurant", "cafe", "attraction")
   * @param {number} radius - Radio en metros (default: 5000)
   * @returns {Promise<Object>} Lista de lugares
   */
  async searchNearbyPlaces(lat, lng, category, radius = 5000) {
    try {
      // Mapeo de categorías simples a IDs de Foursquare
      const categoryMap = {
        'restaurant': '13065',
        'cafe': '13032',
        'bar': '13003',
        'attraction': '16000',
        'temple': '12101',
        'museum': '10027',
        'park': '16032',
        'shopping': '17069',
        'entertainment': '10000'
      };
      
      const categoryId = categoryMap[category.toLowerCase()] || category;
      
      const url = API_ENDPOINTS.places.nearby(lat, lng, categoryId, radius);
      const data = await apiRequest(url);
      
      if (data.results) {
        console.log(`📍 ${data.results.length} lugares encontrados cerca de (${lat}, ${lng})`);
        return {
          success: true,
          places: data.results.map(place => ({
            id: place.fsq_id,
            name: place.name,
            category: place.categories?.[0]?.name || 'N/A',
            address: place.location?.formatted_address || 'N/A',
            distance: place.distance,
            lat: place.geocodes?.main?.latitude,
            lng: place.geocodes?.main?.longitude,
            rating: place.rating,
            photos: place.photos
          }))
        };
      }
      
      return {
        success: false,
        message: 'No se encontraron lugares'
      };
    } catch (error) {
      console.error('❌ Error buscando lugares:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Buscar lugares por término de búsqueda
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @param {string} query - Término de búsqueda
   * @param {number} radius - Radio en metros
   * @returns {Promise<Object>} Lista de lugares
   */
  async searchPlacesByQuery(lat, lng, query, radius = 5000) {
    try {
      const url = API_ENDPOINTS.places.search(lat, lng, query, radius);
      const data = await apiRequest(url);
      
      if (data.results) {
        return {
          success: true,
          places: data.results.map(place => ({
            id: place.fsq_id,
            name: place.name,
            category: place.categories?.[0]?.name || 'N/A',
            address: place.location?.formatted_address || 'N/A',
            distance: place.distance,
            lat: place.geocodes?.main?.latitude,
            lng: place.geocodes?.main?.longitude
          }))
        };
      }
      
      return {
        success: false,
        message: 'No se encontraron lugares'
      };
    } catch (error) {
      console.error('❌ Error buscando lugares:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Obtener detalles de un lugar específico
   * @param {string} placeId - ID de Foursquare
   * @returns {Promise<Object>} Detalles del lugar
   */
  async getPlaceDetails(placeId) {
    try {
      const url = API_ENDPOINTS.places.details(placeId);
      const data = await apiRequest(url);
      
      return {
        success: true,
        place: data
      };
    } catch (error) {
      console.error('❌ Error obteniendo detalles del lugar:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // ==============================
  // 🗺️ GEOCODING (LocationIQ)
  // ==============================
  
  /**
   * Convertir dirección a coordenadas
   * @param {string} address - Dirección
   * @returns {Promise<Object>} Coordenadas
   */
  async geocodeAddress(address) {
    try {
      const url = API_ENDPOINTS.geocoding.forward(address);
      const data = await apiRequest(url);
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          success: true,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
          boundingBox: result.boundingbox
        };
      }
      
      return {
        success: false,
        message: 'Dirección no encontrada'
      };
    } catch (error) {
      console.error('❌ Error en geocoding:', error);
      
      // Intentar con Nominatim como backup
      try {
        const backupUrl = API_ENDPOINTS.nominatimGeocode.forward(address);
        const backupData = await apiRequest(backupUrl);
        
        if (backupData && backupData.length > 0) {
          const result = backupData[0];
          return {
            success: true,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            displayName: result.display_name,
            source: 'nominatim'
          };
        }
      } catch (backupError) {
        console.error('❌ Backup geocoding también falló:', backupError);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Convertir coordenadas a dirección
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {Promise<Object>} Dirección
   */
  async reverseGeocode(lat, lng) {
    try {
      const url = API_ENDPOINTS.geocoding.reverse(lat, lng);
      const data = await apiRequest(url);
      
      if (data) {
        return {
          success: true,
          address: data.display_name,
          details: data.address
        };
      }
      
      return {
        success: false,
        message: 'No se pudo obtener la dirección'
      };
    } catch (error) {
      console.error('❌ Error en reverse geocoding:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Autocompletar direcciones mientras se escribe
   * @param {string} query - Texto de búsqueda
   * @returns {Promise<Object>} Sugerencias
   */
  async autocompleteAddress(query) {
    try {
      const url = API_ENDPOINTS.geocoding.autocomplete(query);
      const data = await apiRequest(url);
      
      if (data && data.length > 0) {
        return {
          success: true,
          suggestions: data.map(item => ({
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }))
        };
      }
      
      return {
        success: false,
        message: 'No se encontraron sugerencias'
      };
    } catch (error) {
      console.error('❌ Error en autocomplete:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // ==============================
  // 🗺️ MAPAS Y RUTAS (Geoapify)
  // ==============================
  
  /**
   * Generar URL de mapa estático
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @param {number} zoom - Nivel de zoom (default: 14)
   * @returns {string} URL de la imagen del mapa
   */
  getStaticMapUrl(lat, lng, zoom = 14) {
    return API_ENDPOINTS.maps.staticMap(lat, lng, zoom);
  },
  
  /**
   * Calcular ruta entre dos puntos
   * @param {Object} start - {lat, lng} punto inicial
   * @param {Object} end - {lat, lng} punto final
   * @param {string} mode - Modo de transporte (walk, drive, transit)
   * @returns {Promise<Object>} Información de la ruta
   */
  async calculateRoute(start, end, mode = 'walk') {
    try {
      const startCoords = `${start.lat},${start.lng}`;
      const endCoords = `${end.lat},${end.lng}`;
      
      const url = API_ENDPOINTS.maps.routing(startCoords, endCoords);
      const data = await apiRequest(url);
      
      if (data.features && data.features.length > 0) {
        const route = data.features[0];
        return {
          success: true,
          distance: route.properties.distance, // en metros
          duration: route.properties.time, // en segundos
          geometry: route.geometry,
          steps: route.properties.legs?.[0]?.steps || []
        };
      }
      
      return {
        success: false,
        message: 'No se pudo calcular la ruta'
      };
    } catch (error) {
      console.error('❌ Error calculando ruta:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Buscar lugares cercanos usando Geoapify
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @param {string} category - Categoría
   * @param {number} radius - Radio en metros
   * @returns {Promise<Object>} Lista de lugares
   */
  async findNearbyPlacesGeoapify(lat, lng, category, radius = 5000) {
    try {
      const url = API_ENDPOINTS.maps.places(lat, lng, category, radius);
      const data = await apiRequest(url);
      
      if (data.features) {
        return {
          success: true,
          places: data.features.map(place => ({
            name: place.properties.name,
            category: place.properties.categories,
            address: place.properties.formatted,
            lat: place.properties.lat,
            lng: place.properties.lon,
            distance: place.properties.distance
          }))
        };
      }
      
      return {
        success: false,
        message: 'No se encontraron lugares'
      };
    } catch (error) {
      console.error('❌ Error buscando lugares:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // ==============================
  // 🛠️ UTILIDADES
  // ==============================
  
  /**
   * Probar todas las APIs
   * @returns {Promise<Object>} Estado de cada API
   */
  async testAllAPIs() {
    console.log('🧪 Probando todas las APIs...');
    
    const results = {
      flights: false,
      hotels: false,
      places: false,
      geocoding: false,
      maps: false
    };
    
    try {
      // Test vuelos
      const flightTest = await this.getAirportInfo('NRT');
      results.flights = flightTest.success;
      console.log('✈️ Vuelos:', results.flights ? '✅' : '❌');
    } catch (error) {
      console.log('✈️ Vuelos: ❌', error.message);
    }
    
    try {
      // Test hoteles
      const hotelTest = await this.getCitiesByCountry('JP');
      results.hotels = hotelTest.success;
      console.log('🏨 Hoteles:', results.hotels ? '✅' : '❌');
    } catch (error) {
      console.log('🏨 Hoteles: ❌', error.message);
    }
    
    try {
      // Test lugares (Tokyo coordinates)
      const placesTest = await this.searchNearbyPlaces(35.6762, 139.6503, 'restaurant', 1000);
      results.places = placesTest.success;
      console.log('📍 Lugares:', results.places ? '✅' : '❌');
    } catch (error) {
      console.log('📍 Lugares: ❌', error.message);
    }
    
    try {
      // Test geocoding
      const geocodeTest = await this.geocodeAddress('Tokyo Tower, Japan');
      results.geocoding = geocodeTest.success;
      console.log('🗺️ Geocoding:', results.geocoding ? '✅' : '❌');
    } catch (error) {
      console.log('🗺️ Geocoding: ❌', error.message);
    }
    
    // Test mapas (no requiere request, solo genera URL)
    try {
      const mapUrl = this.getStaticMapUrl(35.6762, 139.6503, 14);
      results.maps = mapUrl.includes('geoapify');
      console.log('🗺️ Mapas:', results.maps ? '✅' : '❌');
    } catch (error) {
      console.log('🗺️ Mapas: ❌', error.message);
    }
    
    return results;
  },
  
  /**
   * Mostrar notificación de API
   * @param {boolean} success - Si la operación fue exitosa
   * @param {string} message - Mensaje a mostrar
   */
  notify(success, message) {
    if (success) {
      Notifications.success(message);
    } else {
      Notifications.error(message);
    }
  },
  
  /**
   * Obtener coordenadas de ciudades de Japón
   * @returns {Object} Coordenadas de ciudades principales
   */
  getJapanCityCoordinates() {
    return {
      tokyo: { lat: 35.6762, lng: 139.6503 },
      kyoto: { lat: 35.0116, lng: 135.7681 },
      osaka: { lat: 34.6937, lng: 135.5023 },
      hakone: { lat: 35.2324, lng: 139.1069 },
      nara: { lat: 34.6851, lng: 135.8048 },
      hiroshima: { lat: 34.3853, lng: 132.4553 },
      yokohama: { lat: 35.4437, lng: 139.6380 },
      kamakura: { lat: 35.3194, lng: 139.5467 }
    };
  }
};

// Exponer globalmente para uso en consola
window.APIsIntegration = APIsIntegration;

// Auto-test al cargar (comentar en producción)
// APIsIntegration.testAllAPIs();

console.log('🔌 APIs Integration module loaded');

export default APIsIntegration;
