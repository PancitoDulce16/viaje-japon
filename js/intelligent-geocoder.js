// js/intelligent-geocoder.js - Sistema inteligente de geocodificación automática
// 🧠 Auto-detecta y corrige actividades sin coordenadas usando múltiples fuentes

import { APP_CONFIG } from './config.js';
import { ATTRACTIONS_DATA } from '../data/attractions-data.js';

/**
 * 🧠 INTELLIGENT GEOCODER
 * Sistema de geocodificación multi-fuente con cache y fallbacks
 */
export const IntelligentGeocoder = {
  // Cache de geocodificación para evitar requests repetidos
  cache: new Map(),

  // Estadísticas
  stats: {
    cached: 0,
    attractionsDB: 0,
    googlePlaces: 0,
    locationIQ: 0,
    nominatim: 0,
    failed: 0
  },

  /**
   * 🎯 FUNCIÓN PRINCIPAL: Obtener coordenadas de cualquier lugar
   * Intenta múltiples fuentes en orden de precisión
   */
  async getCoordinates(query, context = {}) {
    console.log(`🔍 IntelligentGeocoder: Buscando coordenadas para "${query}"`);

    // 1. Verificar cache
    const cacheKey = this.getCacheKey(query, context);
    if (this.cache.has(cacheKey)) {
      console.log(`✅ Cache hit para "${query}"`);
      this.stats.cached++;
      return this.cache.get(cacheKey);
    }

    let result = null;

    // 2. Buscar en base de datos de atracciones (más rápido y preciso)
    result = await this.searchInAttractionsDB(query, context);
    if (result) {
      console.log(`✅ Encontrado en Attractions DB: ${result.source}`);
      this.stats.attractionsDB++;
      this.cache.set(cacheKey, result);
      return result;
    }

    // 3. Google Places API (si está configurado)
    if (APP_CONFIG.GOOGLE_PLACES_API_KEY) {
      result = await this.searchGooglePlaces(query, context);
      if (result) {
        console.log(`✅ Encontrado en Google Places`);
        this.stats.googlePlaces++;
        this.cache.set(cacheKey, result);
        return result;
      }
    }

    // 4. LocationIQ Geocoding
    result = await this.searchLocationIQ(query, context);
    if (result) {
      console.log(`✅ Encontrado en LocationIQ`);
      this.stats.locationIQ++;
      this.cache.set(cacheKey, result);
      return result;
    }

    // 5. Nominatim (fallback gratuito)
    result = await this.searchNominatim(query, context);
    if (result) {
      console.log(`✅ Encontrado en Nominatim`);
      this.stats.nominatim++;
      this.cache.set(cacheKey, result);
      return result;
    }

    // 6. No encontrado
    console.warn(`⚠️ No se encontraron coordenadas para "${query}"`);
    this.stats.failed++;
    return null;
  },

  /**
   * 🔑 Generar clave de cache única
   */
  getCacheKey(query, context) {
    const normalized = query.toLowerCase().trim();
    const city = context.city?.toLowerCase() || '';
    return `${normalized}|${city}`;
  },

  /**
   * 📚 FUENTE 1: Base de datos de atracciones local
   */
  async searchInAttractionsDB(query, context) {
    const queryLower = query.toLowerCase();
    const cityLower = context.city?.toLowerCase() || '';

    // Buscar en todas las categorías
    for (const [categoryKey, category] of Object.entries(ATTRACTIONS_DATA)) {
      if (!category.items || !Array.isArray(category.items)) continue;

      for (const item of category.items) {
        // Verificar match por nombre
        const itemName = (item.name || item.title || '').toLowerCase();
        const itemCity = (item.city || '').toLowerCase();

        // Match exacto o muy similar
        if (this.isMatch(queryLower, itemName, itemCity, cityLower)) {
          if (item.coordinates?.lat && item.coordinates?.lng) {
            return {
              lat: item.coordinates.lat,
              lng: item.coordinates.lng,
              name: item.name || item.title,
              source: 'attractions-db',
              category: category.category || categoryKey,
              confidence: 'high'
            };
          }
        }
      }
    }

    return null;
  },

  /**
   * 🎯 Verificar si hay match entre query y item
   */
  isMatch(queryLower, itemName, itemCity, contextCity) {
    // Match exacto
    if (queryLower === itemName) return true;

    // Match con ciudad incluida
    if (queryLower.includes(itemName) || itemName.includes(queryLower)) {
      // Si hay contexto de ciudad, verificar que coincida
      if (contextCity && itemCity) {
        return itemCity.includes(contextCity) || contextCity.includes(itemCity);
      }
      return true;
    }

    return false;
  },

  /**
   * 🗺️ FUENTE 2: Google Places API (New)
   * Usa Text Search (New) que es más moderno y potente
   */
  async searchGooglePlaces(query, context) {
    try {
      const key = APP_CONFIG.GOOGLE_PLACES_API_KEY;
      if (!key) return null;

      // Construir query con contexto
      let searchQuery = query;
      if (context.city) {
        searchQuery = `${query}, ${context.city}, Japan`;
      } else {
        searchQuery = `${query}, Japan`;
      }

      // Usar Text Search (New) API
      const url = `https://places.googleapis.com/v1/places:searchText`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
        },
        body: JSON.stringify({
          textQuery: searchQuery,
          languageCode: 'es'
        })
      });

      const data = await response.json();

      if (data.places && data.places.length > 0) {
        const place = data.places[0];
        return {
          lat: place.location.latitude,
          lng: place.location.longitude,
          name: place.displayName?.text || query,
          address: place.formattedAddress,
          source: 'google-places-new',
          confidence: 'high'
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error en Google Places:', error);
      return null;
    }
  },

  /**
   * 🌍 FUENTE 3: LocationIQ Geocoding
   */
  async searchLocationIQ(query, context) {
    try {
      // Usar la función existente de APIs integration si está disponible
      if (window.APIs && window.APIs.geocodeAddress) {
        let searchQuery = query;
        if (context.city) {
          searchQuery = `${query}, ${context.city}, Japan`;
        } else {
          searchQuery = `${query}, Japan`;
        }

        const result = await window.APIs.geocodeAddress(searchQuery);

        if (result.success) {
          return {
            lat: result.lat,
            lng: result.lng,
            name: query,
            address: result.displayName,
            source: 'locationiq',
            confidence: 'medium'
          };
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error en LocationIQ:', error);
      return null;
    }
  },

  /**
   * 🆓 FUENTE 4: Nominatim (OpenStreetMap) - Fallback gratuito
   */
  async searchNominatim(query, context) {
    try {
      let searchQuery = query;
      if (context.city) {
        searchQuery = `${query}, ${context.city}, Japan`;
      } else {
        searchQuery = `${query}, Japan`;
      }

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'JapanItineraryPlanner/1.0'
        }
      });

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          name: query,
          address: result.display_name,
          source: 'nominatim',
          confidence: 'low'
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error en Nominatim:', error);
      return null;
    }
  },

  /**
   * 🔧 AUTO-CORREGIR: Corregir actividad sin coordenadas
   */
  async fixActivity(activity, dayContext = {}) {
    if (!activity.title && !activity.name) {
      console.warn('⚠️ Actividad sin título, no se puede geocodificar');
      return false;
    }

    // Si ya tiene coordenadas válidas, no hacer nada
    if (activity.coordinates?.lat && activity.coordinates?.lng) {
      return false;
    }

    const query = activity.title || activity.name;
    const context = {
      city: dayContext.city || activity.city
    };

    console.log(`🔧 Auto-corrigiendo actividad: "${query}"`);

    const result = await this.getCoordinates(query, context);

    if (result) {
      activity.coordinates = {
        lat: result.lat,
        lng: result.lng
      };

      // Agregar metadata opcional
      if (!activity.location && result.address) {
        activity.location = result.address;
      }

      console.log(`✅ Actividad corregida: "${query}" -> (${result.lat}, ${result.lng})`);
      return true;
    }

    console.warn(`⚠️ No se pudieron encontrar coordenadas para: "${query}"`);
    return false;
  },

  /**
   * 🔄 AUTO-CORREGIR TODO EL ITINERARIO
   */
  async fixItinerary(itinerary, options = {}) {
    if (!itinerary || !itinerary.days) {
      console.warn('⚠️ Itinerario inválido');
      return { fixed: 0, failed: 0 };
    }

    let fixed = 0;
    let failed = 0;

    console.log('🔄 Iniciando auto-corrección del itinerario...');

    for (const day of itinerary.days) {
      const dayContext = {
        city: day.cities?.[0]?.cityId || day.city
      };

      if (!day.activities || !Array.isArray(day.activities)) continue;

      for (const activity of day.activities) {
        // Si no tiene coordenadas, intentar corregir
        if (!activity.coordinates?.lat || !activity.coordinates?.lng) {
          const success = await this.fixActivity(activity, dayContext);

          if (success) {
            fixed++;
          } else {
            failed++;
          }

          // Rate limiting: esperar un poco entre requests
          if (options.rateLimit !== false) {
            await this.sleep(200);
          }
        }
      }
    }

    console.log(`✅ Auto-corrección completada: ${fixed} corregidas, ${failed} fallidas`);

    return { fixed, failed };
  },

  /**
   * 💤 Función auxiliar para rate limiting
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 📊 Obtener estadísticas
   */
  getStats() {
    const total = Object.values(this.stats).reduce((a, b) => a + b, 0);
    return {
      ...this.stats,
      total,
      cacheSize: this.cache.size
    };
  },

  /**
   * 🗑️ Limpiar cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache de geocodificación limpiado');
  }
};

// Exponer globalmente
window.IntelligentGeocoder = IntelligentGeocoder;

console.log('✅ IntelligentGeocoder cargado');
