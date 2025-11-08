// js/smart-suggestions-engine.js - Motor de Sugerencias Contextuales Inteligente
// Sistema que analiza el itinerario y sugiere actividades para mejorar la experiencia

console.log('🔄 [SuggestionsEngine] Iniciando carga del módulo...');

import { ATTRACTIONS_DATA } from '../data/attractions-data.js';
import { LocationAutocomplete } from './location-autocomplete.js';
import { RouteOptimizer } from './route-optimizer.js?v=2025-11-07-ROUTE-FIX-2';
import { GooglePlacesAPI } from './google-places.js';
import { APP_CONFIG } from './config.js';

console.log('✅ [SuggestionsEngine] Imports completados');

// Extraer las funciones del RouteOptimizer
const { calculateDistance, estimateTransportTime } = RouteOptimizer;

console.log('✅ [SuggestionsEngine] Funciones extraídas de RouteOptimizer');

/**
 * Motor de Sugerencias Inteligente
 * Analiza el itinerario del usuario y sugiere actividades contextuales
 */
export const SuggestionsEngine = {

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════════════════════════════

  config: {
    minGapMinutes: 45,         // Hueco mínimo (reducido de 60 a 45)
    maxGapMinutes: 300,        // Hueco máximo (aumentado a 5 horas)
    maxNearbyDistance: 1.5,    // 1.5km (antes 500m) - MUCHO más generoso
    maxSuggestionsPerGap: 10,  // Top 10 sugerencias por hueco (antes 5)
    maxNearbySuggestions: 8,   // Top 8 cercanas por actividad (antes 3)
    overloadedThreshold: 7,    // 7+ actividades = día cargado
    fatigueThreshold: 3,       // 3+ actividades misma categoría = fatiga
    transportWarning: 120      // 2+ horas en transporte = alerta
  },

  // ═══════════════════════════════════════════════════════════════
  // FUNCIÓN PRINCIPAL - Mostrar Sugerencias
  // ═══════════════════════════════════════════════════════════════

  /**
   * Muestra el modal de sugerencias para un día específico
   * @param {number} dayNumber - Número del día
   */
  async showSuggestionsForDay(dayNumber) {
    console.log(`💡 Generando sugerencias para Día ${dayNumber}...`);

    // 1. Obtener actividades del día
    const dayActivities = this.getDayActivities(dayNumber);

    if (!dayActivities || dayActivities.length === 0) {
      this.showEmptyDayMessage(dayNumber);
      return;
    }

    // 2. Analizar y generar sugerencias (ahora async con Google Places)
    const suggestions = await this.analyzeDayAndGenerateSuggestions(dayActivities, dayNumber);

    // 3. Renderizar modal
    this.renderSuggestionsModal(dayNumber, suggestions);

    console.log('✅ Sugerencias generadas:', suggestions);
  },

  /**
   * Refresca las sugerencias (genera nuevas con randomización)
   * @param {number} dayNumber - Número del día
   */
  refreshSuggestions(dayNumber) {
    console.log(`🔄 Refrescando sugerencias para Día ${dayNumber}...`);
    // Simplemente regenerar - la randomización interna hará que sean diferentes
    this.showSuggestionsForDay(dayNumber);
  },

  // ═══════════════════════════════════════════════════════════════
  // OBTENER ACTIVIDADES DEL DÍA
  // ═══════════════════════════════════════════════════════════════

  getDayActivities(dayNumber) {
    // Obtener del state global de itinerary
    const itinerary = window.ItineraryHandler?.currentItinerary;
    if (!itinerary || !itinerary.days) {
      console.warn('⚠️ No hay itinerario cargado');
      return [];
    }

    const day = itinerary.days.find(d => d.day === dayNumber);
    return day ? day.activities : [];
  },

  // ═══════════════════════════════════════════════════════════════
  // ANÁLISIS Y GENERACIÓN DE SUGERENCIAS
  // ═══════════════════════════════════════════════════════════════

  async analyzeDayAndGenerateSuggestions(activities, dayNumber) {
    return {
      dayNumber: dayNumber,
      totalActivities: activities.length,
      gaps: await this.detectTimeGaps(activities, dayNumber),
      nearby: await this.findNearbyOpportunities(activities),
      alerts: this.detectAlerts(activities),
      fatigue: this.analyzeFatigue(activities)
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // DETECCIÓN DE HUECOS DE TIEMPO
  // ═══════════════════════════════════════════════════════════════

  async detectTimeGaps(activities, dayNumber) {
    const gaps = [];

    console.log(`🔍 Detectando huecos en día ${dayNumber}:`, activities.length, 'actividades');

    // Verificar que las actividades tengan horario
    const withTime = activities.filter(a => a.time);
    console.log(`⏰ Actividades con horario: ${withTime.length}/${activities.length}`);

    if (withTime.length < 2) {
      console.warn('⚠️ Se necesitan al menos 2 actividades con horario para detectar huecos');
      return gaps;
    }

    // Ordenar por tiempo
    const sorted = [...withTime].sort((a, b) =>
      this.parseTime(a.time) - this.parseTime(b.time)
    );

    console.log('📅 Actividades ordenadas:', sorted.map(a => `${a.time} - ${a.title}`));

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      // Calcular fin de actividad actual
      const currentEnd = this.parseTime(current.time) + (current.duration || 90);
      const nextStart = this.parseTime(next.time);

      // Calcular hueco
      const gapMinutes = nextStart - currentEnd;

      // Validar si es un hueco "útil"
      if (gapMinutes >= this.config.minGapMinutes &&
          gapMinutes <= this.config.maxGapMinutes) {

        console.log(`🕐 Hueco detectado: ${this.formatTime(currentEnd)} - ${this.formatTime(nextStart)} (${gapMinutes} min)`);

        // Encontrar sugerencias para este hueco (ahora async)
        const suggestions = await this.findSuggestionsForGap(
          current,
          gapMinutes,
          currentEnd,
          dayNumber
        );

        gaps.push({
          startTime: this.formatTime(currentEnd),
          endTime: this.formatTime(nextStart),
          duration: gapMinutes,
          afterActivity: current,
          beforeActivity: next,
          suggestions: suggestions,
          insertAfterIndex: i  // Para saber dónde insertar
        });
      }
    }

    return gaps;
  },

  // ═══════════════════════════════════════════════════════════════
  // BUSCAR SUGERENCIAS PARA LLENAR HUECOS
  // ═══════════════════════════════════════════════════════════════

  async findSuggestionsForGap(lastActivity, gapMinutes, startTimeMinutes, dayNumber) {
    let suggestions = [];

    // Si no tiene coordenadas, no podemos sugerir nada cercano
    if (!lastActivity.coordinates) {
      console.warn(`⚠️ Actividad "${lastActivity.title}" no tiene coordenadas`);
      return suggestions;
    }

    // Detectar ciudad (necesario para buscar en la base de datos correcta)
    const city = this.detectCity(lastActivity);

    // 🏨 Obtener hotel base de la ciudad (si existe)
    const itinerary = window.ItineraryHandler?.currentItinerary;
    let hotelBase = null;
    if (itinerary && window.HotelBaseSystem) {
      hotelBase = window.HotelBaseSystem.getHotelForCity(itinerary, city);
      if (hotelBase) {
        console.log(`🏨 Hotel base detectado en ${city}:`, hotelBase.name);
      }
    }

    // 🎯 PARTE 1: Buscar en base de datos local
    const allAttractions = this.getAllAttractions(city);
    console.log(`🔍 Buscando en DB local: ${city} (${allAttractions.length} atracciones)...`);

    for (const attraction of allAttractions) {
      // Filtro 1: Tiene coordenadas
      if (!attraction.coordinates) continue;

      // Filtro 2: Está cerca (< 2km para huecos, más flexible)
      const distance = calculateDistance(
        lastActivity.coordinates,
        attraction.coordinates
      );
      if (distance > 2.0) continue; // Aumentado de 1km a 2km

      // Filtro 3: Cabe en el tiempo disponible
      const transport = estimateTransportTime(distance);
      const travelTime = transport.minutes;
      const activityDuration = attraction.duration || 60;
      const totalTime = activityDuration + travelTime + 15; // 15 min buffer

      if (totalTime > gapMinutes) continue;

      // Filtro 4: No está ya en el itinerario del día
      if (this.isInDayItinerary(attraction.id || attraction.name, dayNumber)) continue;

      // ✅ Es candidato válido
      // Normalizar campos (price -> cost, duration string -> number)
      const normalizedDuration = typeof attraction.duration === 'string'
        ? 60 // Default 60 min si es string
        : (attraction.duration || 60);

      // 🏨 Calcular distancia al hotel (si existe)
      let distanceToHotel = null;
      if (hotelBase && hotelBase.coordinates) {
        distanceToHotel = calculateDistance(attraction.coordinates, hotelBase.coordinates);
      }

      suggestions.push({
        ...attraction,
        cost: attraction.cost || attraction.price || 0,
        duration: normalizedDuration,
        walkingTime: travelTime,
        totalTime: totalTime,
        distance: distance,
        distanceKm: Math.round(distance * 100) / 100,
        transportMode: transport.mode,
        transportCost: transport.cost,
        // 🏨 Información del hotel
        distanceToHotel: distanceToHotel,
        distanceToHotelKm: distanceToHotel ? Math.round(distanceToHotel * 100) / 100 : null,
        nearHotel: distanceToHotel ? distanceToHotel < 1.0 : false, // Cerca = < 1km
        // Horario sugerido
        suggestedTime: this.formatTime(startTimeMinutes + travelTime)
      });
    }

    // 🏨 Ordenar con prioridad al hotel base (si existe)
    suggestions.sort((a, b) => {
      let scoreA = (a.rating || 4) * 10 - (a.distance * 5);
      let scoreB = (b.rating || 4) * 10 - (b.distance * 5);

      // 🏨 BOOST: Si está cerca del hotel (+20 puntos)
      if (a.nearHotel) scoreA += 20;
      if (b.nearHotel) scoreB += 20;

      // 🏨 BONUS: Reducir penalización por distancia si está cerca del hotel
      if (a.distanceToHotel && a.distanceToHotel < 0.5) scoreA += 10; // Muy cerca del hotel
      if (b.distanceToHotel && b.distanceToHotel < 0.5) scoreB += 10;

      return scoreB - scoreA;
    });

    console.log(`✅ DB Local: ${suggestions.length} sugerencias encontradas`);

    // 🎯 PARTE 2: Buscar en Google Places (si está configurado)
    if (APP_CONFIG.GOOGLE_PLACES_API_KEY) {
      console.log(`🌍 Buscando en Google Places...`);

      try {
        // Determinar tipos según el hueco
        const types = gapMinutes < 90
          ? ['coffee_shop', 'bakery', 'convenience_store'] // Hueco corto: cafés, panaderías
          : ['tourist_attraction', 'museum', 'park', 'shopping_mall', 'japanese_restaurant', 'ramen_restaurant']; // Hueco largo: más opciones

        const googleResult = await GooglePlacesAPI.searchNearbyNew({
          lat: lastActivity.coordinates.lat,
          lng: lastActivity.coordinates.lng,
          radius: 2000, // 2km
          includedTypes: types,
          maxResults: 20
        });

        if (googleResult.success && googleResult.places) {
          console.log(`✅ Google Places: ${googleResult.places.length} lugares encontrados`);

          // Procesar y agregar resultados de Google Places
          for (const place of googleResult.places) {
            // Calcular distancia y tiempo
            const distance = calculateDistance(lastActivity.coordinates, place.coordinates);
            const transport = estimateTransportTime(distance);
            const travelTime = transport.minutes;
            const activityDuration = 60; // Default para lugares de Google
            const totalTime = activityDuration + travelTime + 15;

            if (totalTime <= gapMinutes && distance <= 2.0) {
              // 🏨 Calcular distancia al hotel (si existe)
              let distanceToHotel = null;
              if (hotelBase && hotelBase.coordinates) {
                distanceToHotel = calculateDistance(place.coordinates, hotelBase.coordinates);
              }

              suggestions.push({
                id: place.id,
                name: place.name,
                title: place.name,
                address: place.address,
                category: place.category,
                icon: this.getCategoryIcon(place.types),
                coordinates: place.coordinates,
                rating: place.rating,
                cost: 0, // Default
                duration: activityDuration,
                walkingTime: travelTime,
                totalTime: totalTime,
                distance: distance,
                distanceKm: Math.round(distance * 100) / 100,
                transportMode: transport.mode,
                transportCost: transport.cost,
                // 🏨 Información del hotel
                distanceToHotel: distanceToHotel,
                distanceToHotelKm: distanceToHotel ? Math.round(distanceToHotel * 100) / 100 : null,
                nearHotel: distanceToHotel ? distanceToHotel < 1.0 : false,
                suggestedTime: this.formatTime(startTimeMinutes + travelTime),
                source: 'google-places' // Identificar fuente
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ Error buscando en Google Places:', error);
      }
    }

    console.log(`✅ TOTAL: ${suggestions.length} sugerencias (DB + Google Places)`);

    // 🏨 Re-ordenar TODAS las sugerencias con prioridad al hotel
    if (hotelBase) {
      suggestions.sort((a, b) => {
        let scoreA = (a.rating || 4) * 10 - (a.distance * 5);
        let scoreB = (b.rating || 4) * 10 - (b.distance * 5);

        // 🏨 BOOST: Si está cerca del hotel (+20 puntos)
        if (a.nearHotel) scoreA += 20;
        if (b.nearHotel) scoreB += 20;

        // 🏨 BONUS: Reducir penalización por distancia si está cerca del hotel
        if (a.distanceToHotel && a.distanceToHotel < 0.5) scoreA += 10; // Muy cerca del hotel
        if (b.distanceToHotel && b.distanceToHotel < 0.5) scoreB += 10;

        return scoreB - scoreA;
      });
      console.log(`🏨 Sugerencias reordenadas con prioridad al hotel base`);
    }

    // 🎲 Randomización mejorada para el botón de refresh
    // Tomar el top 20-30 candidatos para luego mezclarlos
    const pool = suggestions.slice(0, Math.min(suggestions.length, this.config.maxSuggestionsPerGap * 3));

    // Mezclar el pool completo (Fisher-Yates shuffle)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Retornar top N después de mezclar
    return pool.slice(0, this.config.maxSuggestionsPerGap);
  },

  // Helper: Obtener icono según categoría
  getCategoryIcon(types) {
    if (!types || types.length === 0) return '📍';
    const type = types[0];
    const iconMap = {
      'restaurant': '🍽️',
      'cafe': '☕',
      'tourist_attraction': '🎯',
      'museum': '🏛️',
      'park': '🌳',
      'temple': '⛩️',
      'shrine': '⛩️',
      'shopping_mall': '🛍️',
      'bakery': '🥐',
      'convenience_store': '🏪'
    };
    return iconMap[type] || '📍';
  },

  // ═══════════════════════════════════════════════════════════════
  // SUGERENCIAS CERCANAS (sin huecos específicos)
  // ═══════════════════════════════════════════════════════════════

  async findNearbyOpportunities(activities) {
    const opportunities = [];

    for (const activity of activities) {
      if (!activity.coordinates) continue;

      // Buscar atracciones cercanas en DB local
      const nearbyLocal = this.findNearbyAttractions(activity, this.config.maxNearbyDistance);

      // 🌍 Buscar también en Google Places
      let nearbyGoogle = [];
      if (APP_CONFIG.GOOGLE_PLACES_API_KEY) {
        console.log(`🌍 Buscando lugares cercanos a "${activity.title}" en Google Places...`);
        try {
          const googleResult = await GooglePlacesAPI.searchNearbyNew({
            lat: activity.coordinates.lat,
            lng: activity.coordinates.lng,
            radius: 1500, // 1.5km
            includedTypes: ['coffee_shop', 'tourist_attraction', 'museum', 'park', 'shopping_mall', 'japanese_restaurant', 'ramen_restaurant'],
            maxResults: 20
          });

          if (googleResult.success && googleResult.places) {
            console.log(`✅ Google Places: ${googleResult.places.length} lugares cerca de "${activity.title}"`);
            nearbyGoogle = googleResult.places.map(place => ({
              ...place,
              name: place.name,
              title: place.name,
              category: place.category,
              icon: this.getCategoryIcon(place.types),
              source: 'google-places'
            }));
          }
        } catch (error) {
          console.error('❌ Error buscando en Google Places:', error);
        }
      }

      // Combinar resultados
      const allNearby = [...nearbyLocal, ...nearbyGoogle];

      if (allNearby.length > 0) {
        opportunities.push({
          nearActivity: activity,
          suggestions: allNearby.slice(0, this.config.maxNearbySuggestions) // Limitar a top N
        });
      }
    }

    console.log(`📍 TOTAL: ${opportunities.length} oportunidades cercanas`);
    return opportunities;
  },

  findNearbyAttractions(activity, maxDistanceKm) {
    const nearby = [];
    const city = this.detectCity(activity);
    const allAttractions = this.getAllAttractions(city);

    for (const attr of allAttractions) {
      if (!attr.coordinates) continue;

      const distance = calculateDistance(
        activity.coordinates,
        attr.coordinates
      );

      if (distance <= maxDistanceKm && distance > 0) {
        // No incluir si ya está en el itinerario
        if (this.isInAnyDayItinerary(attr.id || attr.name)) continue;

        nearby.push({
          ...attr,
          distance: distance,
          distanceMeters: Math.round(distance * 1000),
          walkingTime: Math.ceil(distance * 12) // 12 min/km
        });
      }
    }

    // Ordenar por rating y distancia
    nearby.sort((a, b) => {
      const scoreA = (a.rating || 4) * 5 - (a.distance * 3);
      const scoreB = (b.rating || 4) * 5 - (b.distance * 3);
      return scoreB - scoreA;
    });

    return nearby.slice(0, this.config.maxNearbySuggestions);
  },

  // ═══════════════════════════════════════════════════════════════
  // DETECCIÓN DE ALERTAS
  // ═══════════════════════════════════════════════════════════════

  detectAlerts(activities) {
    const alerts = [];

    // Alerta 1: Día muy cargado
    if (activities.length >= this.config.overloadedThreshold) {
      alerts.push({
        type: 'overloaded',
        severity: 'warning',
        icon: '⚠️',
        title: 'Día muy cargado',
        message: `Tienes ${activities.length} actividades programadas.`,
        suggestions: [
          'Eliminar 1-2 actividades menos prioritarias',
          'Dividir actividades entre dos días',
          'Agregar tiempo de descanso entre actividades'
        ]
      });
    }

    // Alerta 2: Mucho tiempo en transporte
    const totalTransport = this.calculateTotalTransport(activities);
    if (totalTransport > this.config.transportWarning) {
      const hours = Math.round(totalTransport / 60 * 10) / 10;
      alerts.push({
        type: 'transport',
        severity: 'info',
        icon: 'ℹ️',
        title: 'Mucho tiempo en transporte',
        message: `Aproximadamente ${hours}h en traslados.`,
        suggestions: [
          'Agrupar actividades por zona geográfica',
          'Usar el botón "Optimizar Ruta" para reducir traslados'
        ]
      });
    }

    // Alerta 3: Actividades sin coordenadas
    const withoutCoords = activities.filter(a => !a.coordinates);
    if (withoutCoords.length > 0) {
      alerts.push({
        type: 'missing-coords',
        severity: 'info',
        icon: '📍',
        title: 'Actividades sin ubicación',
        message: `${withoutCoords.length} actividad(es) no tienen coordenadas.`,
        suggestions: [
          'Agregar ubicaciones para usar el optimizador de rutas',
          'Sugerencias más precisas si las actividades tienen coordenadas'
        ],
        activities: withoutCoords.map(a => a.title)
      });
    }

    return alerts;
  },

  calculateTotalTransport(activities) {
    let total = 0;

    for (let i = 0; i < activities.length - 1; i++) {
      const current = activities[i];
      const next = activities[i + 1];

      if (current.coordinates && next.coordinates) {
        const distance = calculateDistance(current.coordinates, next.coordinates);
        const transport = estimateTransportTime(distance);
        total += transport.minutes;
      }
    }

    return total;
  },

  // ═══════════════════════════════════════════════════════════════
  // ANÁLISIS DE FATIGA
  // ═══════════════════════════════════════════════════════════════

  analyzeFatigue(activities) {
    const categories = activities
      .map(a => a.category)
      .filter(Boolean);

    if (categories.length === 0) {
      return { hasIssue: false };
    }

    // Contar repeticiones de categorías
    const categoryCounts = {};
    for (const cat of categories) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    // Detectar categorías repetidas
    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count >= this.config.fatigueThreshold) {
        return {
          hasIssue: true,
          category: category,
          count: count,
          icon: '😴',
          title: 'Posible fatiga',
          message: `${count} actividades de tipo "${category}"`,
          suggestion: 'Considera agregar variedad: cafés, parques, o experiencias diferentes'
        };
      }
    }

    return {
      hasIssue: false,
      message: 'Tu día tiene buena variedad de categorías'
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════

  parseTime(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  },

  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },

  detectCity(activity) {
    // Intentar detectar ciudad de varias formas
    if (activity.city) return activity.city;
    if (activity.station && activity.station.includes('Tokyo')) return 'Tokyo';
    if (activity.station && activity.station.includes('Kyoto')) return 'Kyoto';
    if (activity.station && activity.station.includes('Osaka')) return 'Osaka';

    // Default: Tokyo (la mayoría de actividades)
    return 'Tokyo';
  },

  getAllAttractions(city) {
    // Combinar de múltiples fuentes
    const attractions = [];
    const cityLower = city.toLowerCase();

    // 1. De ATTRACTIONS_DATA - cada categoría tiene un array de items
    if (ATTRACTIONS_DATA) {
      for (const category of Object.values(ATTRACTIONS_DATA)) {
        if (category && category.items && Array.isArray(category.items)) {
          // Filtrar por ciudad
          const cityItems = category.items
            .filter(item => {
              if (!item.city) return false;
              const itemCity = item.city.toLowerCase();
              return itemCity.includes(cityLower);
            })
            .map(item => ({
              ...item,
              // Heredar icono y categoría de la categoría padre si no lo tiene
              icon: item.icon || category.icon || '📍',
              category: item.category || category.category || 'Atracción'
            }));
          attractions.push(...cityItems);
        }
      }
    }

    // 2. De LocationAutocomplete
    if (LocationAutocomplete && LocationAutocomplete.locations) {
      const locationsByCity = LocationAutocomplete.locations.filter(
        loc => {
          if (!loc.city) return false;
          return loc.city.toLowerCase().includes(cityLower);
        }
      );
      attractions.push(...locationsByCity);
    }

    console.log(`📚 Cargadas ${attractions.length} atracciones de ${city}`);
    return attractions;
  },

  isInDayItinerary(activityId, dayNumber) {
    const dayActivities = this.getDayActivities(dayNumber);
    return dayActivities.some(a =>
      a.id === activityId ||
      a.title === activityId ||
      a.name === activityId
    );
  },

  isInAnyDayItinerary(activityId) {
    if (!window.currentItinerary || !window.currentItinerary.days) return false;

    const allDays = window.currentItinerary.days;
    for (const day of allDays) {
      if (day.activities.some(a =>
        a.id === activityId ||
        a.title === activityId ||
        a.name === activityId
      )) {
        return true;
      }
    }
    return false;
  },

  // ═══════════════════════════════════════════════════════════════
  // UI - RENDERIZADO (continuará en el siguiente archivo...)
  // ═══════════════════════════════════════════════════════════════

  showEmptyDayMessage(dayNumber) {
    if (window.Notifications) {
      window.Notifications.info(
        `El Día ${dayNumber} no tiene actividades aún. Agrega algunas para recibir sugerencias.`,
        5000
      );
    }
  }
};

// Exportar globalmente
window.SuggestionsEngine = SuggestionsEngine;

console.log('✅ Smart Suggestions Engine cargado');
