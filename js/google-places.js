// js/google-places.js - Google Places API Integration
import { APP_CONFIG } from './config.js';

/**
 * Google Places API Handler
 * Usa la nueva Places API (New) de Google
 */
export const GooglePlacesAPI = {
  apiKey: null,
  isLoaded: false,

  /**
   * Inicializar la API de Google Places
   */
  async init() {
    // Intentar cargar API key desde config o runtime
    this.apiKey = APP_CONFIG?.GOOGLE_PLACES_API_KEY ||
                  window.RUNTIME_API_KEYS?.googlePlaces?.apiKey ||
                  '';

    if (!this.apiKey) {
      console.warn('⚠️ Google Places API key no configurado');
      return false;
    }

    // Cargar la librería de Google Places si no está cargada
    if (!window.google?.maps?.places) {
      await this.loadGoogleMapsScript();
    }

    this.isLoaded = true;
    console.log('✅ Google Places API inicializado');
    return true;
  },

  /**
   * Cargar el script de Google Maps
   */
  async loadGoogleMapsScript() {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&language=en`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      document.head.appendChild(script);
    });
  },

  /**
   * 🆕 Buscar lugares cercanos usando Places API (New) - Sin CORS!
   * @param {Object} params - {lat, lng, radius, includedTypes, maxResults}
   * @returns {Promise<Object>} {success, places}
   */
  async searchNearbyNew(params) {
    const {
      lat,
      lng,
      radius = 2000,
      includedTypes = ['restaurant', 'tourist_attraction', 'cafe'],
      maxResults = 20,
      keyword = null
    } = params;

    const apiKey = this.apiKey || APP_CONFIG?.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ Google Places API key no configurado');
      return { success: false, places: [], error: 'No API key' };
    }

    try {
      const url = 'https://places.googleapis.com/v1/places:searchNearby';

      const requestBody = {
        includedTypes: includedTypes,
        maxResultCount: Math.min(maxResults, 20), // Max 20
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng
            },
            radius: radius
          }
        },
        languageCode: 'es'
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.priceLevel,places.primaryTypeDisplayName'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Google Places API error:', response.status, response.statusText);
        console.error('📋 Error details:', errorData);
        console.error('📤 Request body:', requestBody);
        return { success: false, places: [], error: response.statusText, details: errorData };
      }

      const data = await response.json();

      if (!data.places || data.places.length === 0) {
        return { success: true, places: [] };
      }

      const places = data.places.map(place => ({
        id: place.id,
        name: place.displayName?.text || 'Sin nombre',
        address: place.formattedAddress || '',
        lat: place.location?.latitude,
        lng: place.location?.longitude,
        rating: place.rating || 0,
        userRatingsTotal: place.userRatingCount || 0,
        types: place.types || [],
        category: place.primaryTypeDisplayName?.text || 'Lugar',
        priceLevel: place.priceLevel || 'PRICE_LEVEL_UNSPECIFIED',
        coordinates: {
          lat: place.location?.latitude,
          lng: place.location?.longitude
        }
      }));

      console.log(`✅ Google Places encontró ${places.length} lugares`);

      return {
        success: true,
        places: places
      };

    } catch (error) {
      console.error('❌ Error en Google Places API:', error);
      return {
        success: false,
        places: [],
        error: error.message
      };
    }
  },

  /**
   * 🆕 Buscar lugares por texto usando Places API (New) - Sin CORS!
   * @param {Object} params - {query, lat, lng, radius, includedTypes, maxResults}
   * @returns {Promise<Object>} {success, places}
   */
  async textSearch(params) {
    const {
      query,
      lat = null,
      lng = null,
      radius = 50000,
      includedTypes = ['restaurant', 'hotel', 'lodging'],
      maxResults = 20
    } = params;

    const apiKey = this.apiKey || APP_CONFIG?.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ Google Places API key no configurado');
      return { success: false, places: [], error: 'No API key' };
    }

    if (!query || !query.trim()) {
      console.warn('⚠️ Query vacío para textSearch');
      return { success: false, places: [], error: 'No query provided' };
    }

    try {
      const url = 'https://places.googleapis.com/v1/places:searchText';

      const requestBody = {
        textQuery: query,
        languageCode: 'es',
        maxResultCount: Math.min(maxResults, 20) // Max 20
      };

      // Si hay coordenadas, agregar location bias
      if (lat && lng) {
        requestBody.locationBias = {
          circle: {
            center: {
              latitude: lat,
              longitude: lng
            },
            radius: radius
          }
        };
      }

      // Si hay tipos incluidos, agregarlos
      if (includedTypes && includedTypes.length > 0) {
        requestBody.includedType = includedTypes[0]; // La API solo acepta un tipo en textSearch
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.priceLevel,places.primaryTypeDisplayName'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Google Places Text Search error:', response.status, response.statusText);
        console.error('📋 Error details:', errorData);
        console.error('📤 Request body:', requestBody);
        return { success: false, places: [], error: response.statusText, details: errorData };
      }

      const data = await response.json();

      if (!data.places || data.places.length === 0) {
        console.log(`ℹ️ Text Search para "${query}" no encontró resultados`);
        return { success: true, places: [] };
      }

      const places = data.places.map(place => ({
        id: place.id,
        name: place.displayName?.text || 'Sin nombre',
        displayName: place.displayName?.text || 'Sin nombre',
        address: place.formattedAddress || '',
        formattedAddress: place.formattedAddress || '',
        lat: place.location?.latitude,
        lng: place.location?.longitude,
        rating: place.rating || 0,
        userRatingsTotal: place.userRatingCount || 0,
        types: place.types || [],
        category: place.primaryTypeDisplayName?.text || 'Lugar',
        priceLevel: place.priceLevel || 'PRICE_LEVEL_UNSPECIFIED',
        location: {
          lat: place.location?.latitude,
          lng: place.location?.longitude
        },
        coordinates: {
          lat: place.location?.latitude,
          lng: place.location?.longitude
        }
      }));

      console.log(`✅ Text Search encontró ${places.length} lugares para "${query}"`);

      return {
        success: true,
        places: places
      };

    } catch (error) {
      console.error('❌ Error en Google Places Text Search:', error);
      return {
        success: false,
        places: [],
        error: error.message
      };
    }
  },

  /**
   * Buscar lugares cercanos usando Nearby Search (API antigua - requiere proxy)
   * @param {Object} params - {lat, lng, radius, type, keyword}
   * @returns {Promise<Array>} Lista de lugares
   */
  async searchNearby(params) {
    const { lat, lng, radius = 1000, type = null, keyword = null } = params;

    if (!this.apiKey) {
      throw new Error('Google Places API key no configurado');
    }

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('location', `${lat},${lng}`);
      url.searchParams.append('radius', radius);

      if (type) url.searchParams.append('type', type);
      if (keyword) url.searchParams.append('keyword', keyword);

      // Nota: Esto requiere un proxy porque la API no soporta CORS directamente
      // En producción, esto debería ir a través de tu backend
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
        return {
          success: true,
          places: data.results.map(place => ({
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            types: place.types,
            photoReference: place.photos?.[0]?.photo_reference,
            priceLevel: place.price_level,
            openNow: place.opening_hours?.open_now
          }))
        };
      } else {
        return {
          success: false,
          error: data.status,
          message: data.error_message || 'Error en búsqueda'
        };
      }
    } catch (error) {
      console.error('❌ Error en Google Places API:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Obtener detalles de un lugar
   * @param {string} placeId - ID del lugar
   * @returns {Promise<Object>} Detalles del lugar
   */
  async getPlaceDetails(placeId) {
    if (!this.apiKey) {
      throw new Error('Google Places API key no configurado');
    }

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('place_id', placeId);
      url.searchParams.append('fields', 'name,rating,formatted_address,geometry,opening_hours,photos,price_level,reviews,website,formatted_phone_number');

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status === 'OK') {
        const place = data.result;
        return {
          success: true,
          place: {
            id: placeId,
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            rating: place.rating,
            website: place.website,
            phone: place.formatted_phone_number,
            priceLevel: place.price_level,
            openingHours: place.opening_hours,
            photos: place.photos?.map(p => p.photo_reference),
            reviews: place.reviews
          }
        };
      } else {
        return {
          success: false,
          error: data.status
        };
      }
    } catch (error) {
      console.error('❌ Error obteniendo detalles:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Obtener URL de foto
   * @param {string} photoReference - Referencia de la foto
   * @param {number} maxWidth - Ancho máximo
   * @returns {string} URL de la foto
   */
  getPhotoUrl(photoReference, maxWidth = 400) {
    if (!this.apiKey || !photoReference) return null;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  },

  /**
   * Autocomplete de lugares
   * @param {string} input - Texto de búsqueda
   * @param {Object} options - {lat, lng, radius, types}
   * @returns {Promise<Array>} Sugerencias
   */
  async autocomplete(input, options = {}) {
    if (!this.apiKey) {
      throw new Error('Google Places API key no configurado');
    }

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('input', input);

      if (options.lat && options.lng) {
        url.searchParams.append('location', `${options.lat},${options.lng}`);
        url.searchParams.append('radius', options.radius || 50000);
      }

      if (options.types) {
        url.searchParams.append('types', options.types);
      }

      // Bias hacia Japón
      url.searchParams.append('components', 'country:jp');

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
        return {
          success: true,
          predictions: data.predictions.map(p => ({
            placeId: p.place_id,
            description: p.description,
            mainText: p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text
          }))
        };
      } else {
        return {
          success: false,
          error: data.status
        };
      }
    } catch (error) {
      console.error('❌ Error en autocomplete:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Buscar restaurantes cercanos a un lugar
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @param {number} radius - Radio en metros
   * @returns {Promise<Object>} Restaurantes
   */
  async findNearbyRestaurants(lat, lng, radius = 1000) {
    return this.searchNearbyNew({
      lat,
      lng,
      radius,
      includedTypes: ['japanese_restaurant', 'ramen_restaurant'],
      maxResults: 20
    });
  },

  /**
   * Buscar cafés cercanos
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @param {number} radius - Radio en metros
   * @returns {Promise<Object>} Cafés
   */
  async findNearbyCafes(lat, lng, radius = 1000) {
    return this.searchNearbyNew({
      lat,
      lng,
      radius,
      includedTypes: ['coffee_shop', 'cafe'],
      maxResults: 20
    });
  },

  /**
   * Buscar atracciones turísticas
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @param {number} radius - Radio en metros
   * @returns {Promise<Object>} Atracciones
   */
  async findNearbyAttractions(lat, lng, radius = 5000) {
    return this.searchNearbyNew({
      lat,
      lng,
      radius,
      includedTypes: ['tourist_attraction'],
      maxResults: 20
    });
  },

  /**
   * Verificar si la API está configurada
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey;
  }
};

// Exportar globalmente
window.GooglePlacesAPI = GooglePlacesAPI;

// Auto-inicializar si hay API key
if (APP_CONFIG?.GOOGLE_PLACES_API_KEY) {
  GooglePlacesAPI.init().catch(err => {
    console.warn('⚠️ No se pudo inicializar Google Places API:', err.message);
  });
}

export default GooglePlacesAPI;
