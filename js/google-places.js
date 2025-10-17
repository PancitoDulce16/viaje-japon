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
   * Buscar lugares cercanos usando Nearby Search
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
    return this.searchNearby({
      lat,
      lng,
      radius,
      type: 'restaurant'
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
    return this.searchNearby({
      lat,
      lng,
      radius,
      type: 'cafe'
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
    return this.searchNearby({
      lat,
      lng,
      radius,
      type: 'tourist_attraction'
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
