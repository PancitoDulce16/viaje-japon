// js/core/apis-config.js - API Configuration for production
// Las keys reales nunca viven en este archivo. En runtime se toman de
// window.RUNTIME_API_KEYS (ver js/apis-config.example.js) si algo las define
// antes de que este módulo cargue; si no, las APIs externas quedan sin
// configurar y cada llamada falla con un 401 manejado, no con un crash.

export const API_KEYS = (typeof window !== 'undefined' && window.RUNTIME_API_KEYS) ? window.RUNTIME_API_KEYS : {
  aviationStack: { apiKey: '', endpoint: 'http://api.aviationstack.com/v1' },
  liteAPI: {
    apiKey: '',
    searchEndpoint: 'https://api.liteapi.travel/v3.0',
    bookingEndpoint: 'https://book.liteapi.travel/v3.0',
    dataEndpoint: 'https://api.liteapi.travel/v3.0/data'
  },
  geoapify: { apiKey: '', endpoint: 'https://api.geoapify.com/v1' },
  foursquare: { apiKey: '', endpoint: 'https://api.foursquare.com/v3' },
  locationIQ: { apiKey: '', endpoint: 'https://us1.locationiq.com/v1' },
  nominatim: { endpoint: 'https://nominatim.openstreetmap.org' }
};

// Endpoints de las APIs, construidos como funciones (no strings planas) para
// que cada llamada arme la URL completa con query params y la key vigente
export const API_ENDPOINTS = {
  // Vuelos (AviationStack)
  flights: {
    search: (params) =>
      `${API_KEYS.aviationStack?.endpoint}/flights?access_key=${API_KEYS.aviationStack?.apiKey || ''}&${new URLSearchParams(params).toString()}`,
    airlines: () =>
      `${API_KEYS.aviationStack?.endpoint}/airlines?access_key=${API_KEYS.aviationStack?.apiKey || ''}`,
    airports: (search) =>
      `${API_KEYS.aviationStack?.endpoint}/airports?access_key=${API_KEYS.aviationStack?.apiKey || ''}&search=${encodeURIComponent(search)}`
  },

  // Hoteles (LiteAPI)
  hotels: {
    search: () => `${API_KEYS.liteAPI?.searchEndpoint}/hotels/search`,
    list: (params) => `${API_KEYS.liteAPI?.dataEndpoint}/hotels?${new URLSearchParams(params).toString()}`,
    details: (hotelId) => `${API_KEYS.liteAPI?.dataEndpoint}/hotel?hotelId=${encodeURIComponent(hotelId)}`,
    reviews: (hotelId) => `${API_KEYS.liteAPI?.dataEndpoint}/reviews?hotelId=${encodeURIComponent(hotelId)}`,
    cities: (countryCode) => `${API_KEYS.liteAPI?.dataEndpoint}/cities?countryCode=${encodeURIComponent(countryCode)}`,
    countries: () => `${API_KEYS.liteAPI?.dataEndpoint}/countries`,
    prebook: () => `${API_KEYS.liteAPI?.bookingEndpoint}/rates/prebook`,
    book: () => `${API_KEYS.liteAPI?.bookingEndpoint}/rates/book`,
    bookings: () => `${API_KEYS.liteAPI?.bookingEndpoint}/bookings`,
    bookingDetails: (bookingId) => `${API_KEYS.liteAPI?.bookingEndpoint}/bookings/${encodeURIComponent(bookingId)}`
  },

  // Lugares y atracciones (Foursquare)
  places: {
    search: (lat, lng, query, radius = 5000) =>
      `${API_KEYS.foursquare?.endpoint}/places/search?ll=${lat},${lng}&query=${encodeURIComponent(query)}&radius=${radius}`,
    nearby: (lat, lng, categories, radius = 5000) =>
      `${API_KEYS.foursquare?.endpoint}/places/nearby?ll=${lat},${lng}&categories=${encodeURIComponent(categories)}&radius=${radius}`,
    details: (fsqId) => `${API_KEYS.foursquare?.endpoint}/places/${encodeURIComponent(fsqId)}`,
    photos: (fsqId) => `${API_KEYS.foursquare?.endpoint}/places/${encodeURIComponent(fsqId)}/photos`
  },

  // Geocoding (LocationIQ)
  geocoding: {
    forward: (address) =>
      `${API_KEYS.locationIQ?.endpoint}/search?key=${API_KEYS.locationIQ?.apiKey || ''}&q=${encodeURIComponent(address)}&format=json`,
    reverse: (lat, lng) =>
      `${API_KEYS.locationIQ?.endpoint}/reverse?key=${API_KEYS.locationIQ?.apiKey || ''}&lat=${lat}&lon=${lng}&format=json`,
    autocomplete: (query) =>
      `${API_KEYS.locationIQ?.endpoint}/autocomplete?key=${API_KEYS.locationIQ?.apiKey || ''}&q=${encodeURIComponent(query)}&format=json`
  },

  // Nominatim (backup gratuito, sin key)
  nominatimGeocode: {
    forward: (address) =>
      `${API_KEYS.nominatim?.endpoint}/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
    reverse: (lat, lng) =>
      `${API_KEYS.nominatim?.endpoint}/reverse?lat=${lat}&lon=${lng}&format=json`
  },

  // Mapas y rutas (Geoapify)
  maps: {
    staticMap: (lat, lng, zoom = 14) =>
      `${API_KEYS.geoapify?.endpoint}/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${lng},${lat}&zoom=${zoom}&apiKey=${API_KEYS.geoapify?.apiKey || ''}`,
    routing: (start, end) =>
      `${API_KEYS.geoapify?.endpoint}/routing?waypoints=${encodeURIComponent(start)}|${encodeURIComponent(end)}&mode=walk&apiKey=${API_KEYS.geoapify?.apiKey || ''}`,
    places: (lat, lng, categories, radius = 5000) =>
      `${API_KEYS.geoapify?.endpoint}/places?categories=${encodeURIComponent(categories)}&filter=circle:${lng},${lat},${radius}&limit=20&apiKey=${API_KEYS.geoapify?.apiKey || ''}`
  }
};

// Helper para hacer requests a las APIs, con headers específicos por proveedor
export async function apiRequest(url, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (url.includes('liteapi.travel') && API_KEYS.liteAPI?.apiKey) {
      headers['X-API-Key'] = API_KEYS.liteAPI.apiKey;
    }
    if (url.includes('foursquare.com') && API_KEYS.foursquare?.apiKey) {
      headers['Authorization'] = API_KEYS.foursquare.apiKey;
      headers['Accept'] = 'application/json';
    }
    if (url.includes('nominatim.openstreetmap.org')) {
      headers['User-Agent'] = 'Japitin/1.0';
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ API Request Error:', error);
    throw error;
  }
}

// Verificar si una API específica tiene key configurada
export function isAPIConfigured(apiName) {
  return Boolean(API_KEYS[apiName]?.apiKey);
}

// Exportar también como window global para compatibilidad
if (typeof window !== 'undefined') {
  window.API_KEYS = API_KEYS;
  window.API_ENDPOINTS = API_ENDPOINTS;
  window.RUNTIME_API_KEYS = API_KEYS; // Alias para compatibilidad
}

console.log('📡 APIs Config cargado');
