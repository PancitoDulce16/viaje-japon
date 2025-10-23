// js/apis-config.js - API Configuration for production
// ⚠️ NOTA: Este archivo SÍ debe estar en Git
// Contiene placeholders vacíos - las APIs funcionarán en modo offline/demo
// Para desarrollo local, copia tus keys desde apis-config.js.local_backup

// API Keys exportadas (vacías por defecto para producción)
export const API_KEYS = {
  aviationStack: {
    apiKey: '',
    endpoint: 'http://api.aviationstack.com/v1'
  },
  liteAPI: {
    apiKey: '',
    searchEndpoint: 'https://api.liteapi.travel/v3.0',
    bookingEndpoint: 'https://book.liteapi.travel/v3.0',
    dataEndpoint: 'https://api.liteapi.travel/v3.0/data'
  },
  geoapify: {
    apiKey: '',
    endpoint: 'https://api.geoapify.com/v1'
  },
  foursquare: {
    apiKey: '',
    endpoint: 'https://api.foursquare.com/v3'
  },
  locationIQ: {
    apiKey: '',
    endpoint: 'https://us1.locationiq.com/v1'
  },
  nominatim: {
    endpoint: 'https://nominatim.openstreetmap.org'
  }
};

// Endpoints de las APIs
export const API_ENDPOINTS = {
  flights: API_KEYS.aviationStack.endpoint,
  hotels: API_KEYS.liteAPI.searchEndpoint,
  geocoding: API_KEYS.geoapify.endpoint,
  places: API_KEYS.foursquare.endpoint,
  reverseGeo: API_KEYS.locationIQ.endpoint,
  osmNominatim: API_KEYS.nominatim.endpoint
};

// Helper para hacer requests a las APIs
export async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ API Request Error:', error);
    throw error;
  }
}

// Verificar si las APIs están configuradas
export function isAPIConfigured(apiName) {
  return API_KEYS[apiName]?.apiKey && API_KEYS[apiName].apiKey !== '';
}

// Exportar también como window global para compatibilidad
if (typeof window !== 'undefined') {
  window.API_KEYS = API_KEYS;
  window.API_ENDPOINTS = API_ENDPOINTS;
  window.RUNTIME_API_KEYS = API_KEYS; // Alias para compatibilidad
}

console.log('📡 APIs Config cargado (modo producción - keys vacías)');
