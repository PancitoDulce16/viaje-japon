// js/apis-config.js - Configuración REAL de APIs

export const API_KEYS = {
  // AviationStack - Vuelos
  aviationStack: {
    apiKey: '4374cea236b04a5bf7e6d0c7d2cbf676',
    endpoint: 'http://api.aviationstack.com/v1'
  },
  
  // LiteAPI - Hoteles (Sandbox)
  liteAPI: {
    apiKey: '1757d988-56b3-4b5a-9618-c7b5053ac3aa', // Sandbox public key
    searchEndpoint: 'https://api.liteapi.travel/v3.0',
    bookingEndpoint: 'https://book.liteapi.travel/v3.0',
    dataEndpoint: 'https://api.liteapi.travel/v3.0/data'
  },
  
  // Geoapify - Mapas y Geocoding
  geoapify: {
    apiKey: '4ed258337c3d4edb94841d6001273ad7',
    endpoint: 'https://api.geoapify.com/v1'
  },
  
  // Foursquare - Lugares y Atracciones
  foursquare: {
    apiKey: 'MDWP4CPLGUO1AUSDLDCWC3JHWYTWGWEJ5UXIPT3Q5DLI0EKO',
    endpoint: 'https://api.foursquare.com/v3'
  },
  
  // LocationIQ - Geocoding
  locationIQ: {
    apiKey: '994358ef247499e7bf49de710d455da3',
    endpoint: 'https://us1.locationiq.com/v1'
  },
  
  // Nominatim (OpenStreetMap) - Gratuito, sin key
  nominatim: {
    endpoint: 'https://nominatim.openstreetmap.org'
  }
};

// Endpoints específicos
export const API_ENDPOINTS = {
  // Vuelos
  flights: {
    search: (params) => 
      `${API_KEYS.aviationStack.endpoint}/flights?access_key=${API_KEYS.aviationStack.apiKey}&${new URLSearchParams(params).toString()}`,
    airlines: () =>
      `${API_KEYS.aviationStack.endpoint}/airlines?access_key=${API_KEYS.aviationStack.apiKey}`,
    airports: (search) =>
      `${API_KEYS.aviationStack.endpoint}/airports?access_key=${API_KEYS.aviationStack.apiKey}&search=${search}`
  },
  
  // Hoteles
  hotels: {
    search: () => `${API_KEYS.liteAPI.searchEndpoint}/hotels/search`,
    list: (params) => `${API_KEYS.liteAPI.dataEndpoint}/hotels?${new URLSearchParams(params).toString()}`,
    details: (hotelId) => `${API_KEYS.liteAPI.dataEndpoint}/hotel?hotelId=${hotelId}`,
    reviews: (hotelId) => `${API_KEYS.liteAPI.dataEndpoint}/reviews?hotelId=${hotelId}`,
    cities: (countryCode) => `${API_KEYS.liteAPI.dataEndpoint}/cities?countryCode=${countryCode}`,
    countries: () => `${API_KEYS.liteAPI.dataEndpoint}/countries`,
    prebook: () => `${API_KEYS.liteAPI.bookingEndpoint}/rates/prebook`,
    book: () => `${API_KEYS.liteAPI.bookingEndpoint}/rates/book`,
    bookings: () => `${API_KEYS.liteAPI.bookingEndpoint}/bookings`,
    bookingDetails: (bookingId) => `${API_KEYS.liteAPI.bookingEndpoint}/bookings/${bookingId}`
  },
  
  // Lugares y Atracciones (Foursquare)
  places: {
    search: (lat, lng, query, radius = 5000) =>
      `${API_KEYS.foursquare.endpoint}/places/search?ll=${lat},${lng}&query=${query}&radius=${radius}`,
    nearby: (lat, lng, categories, radius = 5000) =>
      `${API_KEYS.foursquare.endpoint}/places/nearby?ll=${lat},${lng}&categories=${categories}&radius=${radius}`,
    details: (fsqId) =>
      `${API_KEYS.foursquare.endpoint}/places/${fsqId}`,
    photos: (fsqId) =>
      `${API_KEYS.foursquare.endpoint}/places/${fsqId}/photos`
  },
  
  // Geocoding (LocationIQ)
  geocoding: {
    forward: (address) =>
      `${API_KEYS.locationIQ.endpoint}/search?key=${API_KEYS.locationIQ.apiKey}&q=${encodeURIComponent(address)}&format=json`,
    reverse: (lat, lng) =>
      `${API_KEYS.locationIQ.endpoint}/reverse?key=${API_KEYS.locationIQ.apiKey}&lat=${lat}&lon=${lng}&format=json`,
    autocomplete: (query) =>
      `${API_KEYS.locationIQ.endpoint}/autocomplete?key=${API_KEYS.locationIQ.apiKey}&q=${encodeURIComponent(query)}&format=json`
  },
  
  // Nominatim (backup gratuito)
  nominatimGeocode: {
    forward: (address) =>
      `${API_KEYS.nominatim.endpoint}/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
    reverse: (lat, lng) =>
      `${API_KEYS.nominatim.endpoint}/reverse?lat=${lat}&lon=${lng}&format=json`
  },
  
  // Mapas (Geoapify)
  maps: {
    staticMap: (lat, lng, zoom = 14) =>
      `${API_KEYS.geoapify.endpoint}/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${lng},${lat}&zoom=${zoom}&apiKey=${API_KEYS.geoapify.apiKey}`,
    routing: (start, end) =>
      `${API_KEYS.geoapify.endpoint}/routing?waypoints=${start}|${end}&mode=walk&apiKey=${API_KEYS.geoapify.apiKey}`,
    places: (lat, lng, categories, radius = 5000) =>
      `${API_KEYS.geoapify.endpoint}/places?categories=${categories}&filter=circle:${lng},${lat},${radius}&limit=20&apiKey=${API_KEYS.geoapify.apiKey}`
  }
};

// Helper para hacer requests con headers correctos
export async function apiRequest(url, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Agregar header específico para LiteAPI
    if (url.includes('liteapi.travel')) {
      headers['X-API-Key'] = API_KEYS.liteAPI.apiKey;
    }
    
    // Agregar header para Foursquare
    if (url.includes('foursquare.com')) {
      headers['Authorization'] = API_KEYS.foursquare.apiKey;
      headers['Accept'] = 'application/json';
    }
    
    // Agregar User-Agent para Nominatim (requerido)
    if (url.includes('nominatim.openstreetmap.org')) {
      headers['User-Agent'] = 'JapanTripPlanner/1.0';
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ API Request failed:', error);
    throw error;
  }
}

// Verificar configuración
export function checkAPIConfiguration() {
  console.log('🔑 Verificando APIs configuradas:');
  console.log('✅ AviationStack (Vuelos):', API_KEYS.aviationStack.apiKey ? 'Configurado' : 'No configurado');
  console.log('✅ LiteAPI (Hoteles):', API_KEYS.liteAPI.apiKey ? 'Configurado' : 'No configurado');
  console.log('✅ Geoapify (Mapas):', API_KEYS.geoapify.apiKey ? 'Configurado' : 'No configurado');
  console.log('✅ Foursquare (Lugares):', API_KEYS.foursquare.apiKey ? 'Configurado' : 'No configurado');
  console.log('✅ LocationIQ (Geocoding):', API_KEYS.locationIQ.apiKey ? 'Configurado' : 'No configurado');
  console.log('✅ Nominatim (Backup):', 'Siempre disponible (gratis)');
  
  return true;
}

// Test rápido de APIs
export async function testAPIs() {
  console.log('🧪 Probando APIs...');
  
  try {
    // Test Foursquare - buscar lugares en Tokyo
    const placesTest = await apiRequest(
      API_ENDPOINTS.places.nearby(35.6762, 139.6503, '16000', 1000)
    );
    console.log('✅ Foursquare funciona:', placesTest.results?.length || 0, 'lugares encontrados');
  } catch (error) {
    console.log('❌ Foursquare falló:', error.message);
  }
  
  try {
    // Test LiteAPI - obtener países
    const hotelsTest = await apiRequest(API_ENDPOINTS.hotels.countries());
    console.log('✅ LiteAPI funciona:', hotelsTest.data?.length || 0, 'países disponibles');
  } catch (error) {
    console.log('❌ LiteAPI falló:', error.message);
  }
  
  try {
    // Test LocationIQ - geocode Tokyo
    const geocodeTest = await apiRequest(
      API_ENDPOINTS.geocoding.forward('Tokyo, Japan')
    );
    console.log('✅ LocationIQ funciona:', geocodeTest.length > 0 ? 'Geocoding OK' : 'Sin resultados');
  } catch (error) {
    console.log('❌ LocationIQ falló:', error.message);
  }
}

// Exportar para uso global
window.API_KEYS = API_KEYS;
window.API_ENDPOINTS = API_ENDPOINTS;
window.apiRequest = apiRequest;
window.checkAPIConfiguration = checkAPIConfiguration;
window.testAPIs = testAPIs;

// Auto-check al cargar
checkAPIConfiguration();
