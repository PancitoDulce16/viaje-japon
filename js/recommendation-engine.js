// js/recommendation-engine.js - Motor de Recomendaciones Inteligente

import { ATTRACTIONS_DATA } from '/data/attractions-data.js';
import { CATEGORIES } from '/data/categories-data.js';

/**
 * Motor de Recomendaciones basado en preferencias del usuario
 * @namespace RecommendationEngine
 */
export const RecommendationEngine = {

  /**
   * Mapeo de categorías de usuario a categorías de atracciones
   */
  categoryMapping: {
    // Cultura → Templos, Museos, Jardines
    culture: [
      'templesShrines',
      'museums',
      'specialGardens',
      'freeAttractions', // Muchos templos son gratis
      'uniqueVenues'
    ],

    // Gastronomía → Todos los restaurantes y mercados
    food: [
      'ramenRestaurants',
      'sushiRestaurants',
      'yakiniku',
      'cafes',
      'izakayas',
      'moreRestaurants',
      'veganVegetarian',
      'markets',
      'maidCafes' // Experiencia culinaria única
    ],

    // Naturaleza → Parques, jardines, naturaleza
    nature: [
      'natureOutdoors',
      'specialGardens',
      'hakoneExperiences',
      'freeAttractions' // Muchos parques son gratis
    ],

    // Compras → Distritos comerciales, tiendas especializadas
    shopping: [
      'shoppingDistricts',
      'specialtyStores',
      'districtsNeighborhoods',
      'markets'
    ],

    // Vida Nocturna → Bares, izakayas, distritos
    nightlife: [
      'nightlifeBars',
      'izakayas',
      'districtsNeighborhoods'
    ],

    // Aventura → Experiencias únicas, parques temáticos
    adventure: [
      'themeParks',
      'uniqueExperiences',
      'hakoneExperiences',
      'natureOutdoors'
    ],

    // Relajación → Cafés, jardines, experiencias tranquilas
    relaxation: [
      'cafes',
      'animalCafes',
      'specialGardens',
      'natureOutdoors',
      'hakoneExperiences'
    ],

    // Fotografía → Observatorios, vistas, lugares icónicos
    photography: [
      'observatories',
      'freeAttractions',
      'specialGardens',
      'districtsNeighborhoods',
      'natureOutdoors'
    ],

    // Anime/Manga → Tiendas, cafés temáticos, distritos otaku
    anime: [
      'specialtyStores', // Pokemon Center, Jump Store, Nintendo
      'maidCafes',
      'animalCafes',
      'arcades',
      'districtsNeighborhoods', // Akihabara, Den Den Town
      'museums', // Manga Museum
      'craneGames'
    ],

    // Familia → Parques temáticos, cafés de animales, actividades para todos
    family: [
      'themeParks',
      'animalCafes',
      'arcades',
      'markets',
      'freeAttractions',
      'craneGames',
      'natureOutdoors'
    ]
  },

  /**
   * Keywords para identificar atracciones por intereses
   */
  keywordMapping: {
    anime: ['pokemon', 'jump', 'anime', 'manga', 'otaku', 'akihabara', 'nintendo',
            'geek', 'maid', 'arcade', 'gaming', 'rilakkuma', 'character', 'shonen',
            'pikachu', 'ghibli', 'sanrio', 'hello kitty', 'one piece', 'naruto',
            'dragon ball', 'sailor moon', 'gundam', 'evangelion', 'cosplay', 'doujinshi',
            'figure', 'plushie', 'crane game', 'ufo catcher', 'gacha', 'trading card',
            'den den town', 'nakano broadway', 'animate', 'mandarake', 'radio kaikan',
            'kawaii', 'moe', 'vtuber', 'idol', 'butler cafe', 'animal cafe', 'sega',
            'capcom', 'sonic', 'persona', 'yakuza', 'monster hunter', 'resident evil',
            'street fighter', 'mega man', 'hatsune miku', 'anakuma', 'mario', 'zelda',
            'animal crossing', 'splatoon', 'gunpla', 'square enix', 'final fantasy',
            'dragon quest', 'kingdom hearts', 'nier', 'kirby', 'nakano', 'ikebukuro',
            'vintage', 'retro game', 'light novel', 'collectible', 'merchandise'],
    culture: ['temple', 'shrine', 'museum', 'castle', 'garden', 'traditional',
              'heritage', 'historic', 'cultural', 'zen', 'samurai', 'geisha', 'tea ceremony',
              'calligraphy', 'ikebana', 'kabuki', 'noh', 'sumo', 'kimono', 'torii',
              'peace memorial', 'hiroshima', 'miyajima', 'dazaifu', 'tenmangu', 'unesco'],
    food: ['ramen', 'sushi', 'restaurant', 'cafe', 'market', 'food', 'izakaya',
           'yakiniku', 'wagyu', 'vegan', 'tempura', 'tonkatsu', 'okonomiyaki', 'takoyaki',
           'udon', 'soba', 'bento', 'kaiseki', 'tsukemen', 'gyoza', 'kushikatsu',
           'yakitori', 'motsunabe', 'chanko nabe', 'shabu shabu', 'sukiyaki', 'matcha',
           'taiyaki', 'mochi', 'wagashi', 'conveyor belt', 'street food', 'yatai',
           'hakata', 'fukuoka', 'oyster', 'okonomimura'],
    nature: ['park', 'garden', 'nature', 'mount', 'lake', 'bamboo', 'forest',
             'outdoor', 'hiking', 'sakura', 'cherry blossom', 'maple', 'autumn leaves',
             'mountain', 'river', 'waterfall', 'hot spring', 'onsen', 'ryokan'],
    shopping: ['shopping', 'store', 'mall', 'district', 'market', 'shop', 'boutique',
               '100 yen', 'depato', 'department store', 'electronics', 'fashion',
               'souvenir', 'duty free', 'outlet'],
    nightlife: ['bar', 'club', 'nightlife', 'izakaya', 'entertainment', 'karaoke',
                'pub', 'cocktail', 'rooftop', 'jazz', 'live music', 'golden gai'],
    adventure: ['theme park', 'adventure', 'experience', 'activity', 'disneyland',
                'universal', 'ski', 'snowboard', 'rafting', 'zip line', 'go kart',
                'samurai', 'ninja', 'robot restaurant'],
    relaxation: ['spa', 'onsen', 'cafe', 'quiet', 'peaceful', 'relax', 'meditation',
                 'massage', 'wellness', 'zen garden', 'tea house', 'slow',
                 'tranquil', 'serene'],
    photography: ['view', 'observatory', 'tower', 'panoramic', 'scenic', 'instagram',
                  'instagrammable', 'photogenic', 'sunset', 'sunrise', 'skyline',
                  'rooftop', 'illumination', 'night view', 'seasonal'],
    family: ['family', 'children', 'kid', 'theme park', 'animal cafe', 'aquarium',
             'zoo', 'playground', 'studio', 'workshop', 'interactive', 'educational',
             'all ages', 'child friendly']
  },

  /**
   * Obtiene recomendaciones basadas en las preferencias del usuario
   * @param {Array<string>} userPreferences - Categorías seleccionadas por el usuario
   * @param {string} city - Ciudad para filtrar (opcional)
   * @param {number} limit - Número máximo de recomendaciones
   * @returns {Array} Lista de atracciones recomendadas con score
   */
  getRecommendations(userPreferences = [], city = null, limit = 10) {
    if (!userPreferences || userPreferences.length === 0) {
      // Sin preferencias, devolver atracciones populares (rating alto)
      return this.getPopularAttractions(city, limit);
    }

    const allAttractions = this.getAllAttractions();
    const scoredAttractions = [];

    allAttractions.forEach(attraction => {
      // Filtrar por ciudad si se especifica
      if (city && !attraction.city.toLowerCase().includes(city.toLowerCase())) {
        return;
      }

      let score = 0;
      const matchedPreferences = [];

      // Calcular score basado en preferencias del usuario
      userPreferences.forEach(pref => {
        // Score por categoría mapeada
        if (this.categoryMapping[pref] &&
            this.categoryMapping[pref].includes(attraction.categoryKey)) {
          score += 10;
          matchedPreferences.push(pref);
        }

        // Score por keywords
        if (this.keywordMapping[pref]) {
          const keywords = this.keywordMapping[pref];
          const attractionText = `${attraction.name} ${attraction.description} ${attraction.tips || ''}`.toLowerCase();

          keywords.forEach(keyword => {
            if (attractionText.includes(keyword.toLowerCase())) {
              score += 5;
              if (!matchedPreferences.includes(pref)) {
                matchedPreferences.push(pref);
              }
            }
          });
        }
      });

      // Bonus por rating alto
      score += attraction.rating * 2;

      // Bonus por ser gratis
      if (attraction.price === 0) {
        score += 3;
      }

      // Solo incluir si tiene algún match
      if (score > 0) {
        scoredAttractions.push({
          ...attraction,
          recommendationScore: score,
          matchedPreferences: matchedPreferences,
          matchReason: this.getMatchReason(matchedPreferences)
        });
      }
    });

    // Ordenar por score descendente
    scoredAttractions.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scoredAttractions.slice(0, limit);
  },

  /**
   * Obtiene atracciones populares (fallback cuando no hay preferencias)
   */
  getPopularAttractions(city = null, limit = 10) {
    const allAttractions = this.getAllAttractions();

    let filtered = allAttractions;
    if (city) {
      filtered = allAttractions.filter(a =>
        a.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    // Ordenar por rating
    filtered.sort((a, b) => b.rating - a.rating);

    return filtered.slice(0, limit).map(a => ({
      ...a,
      recommendationScore: a.rating * 10,
      matchedPreferences: [],
      matchReason: `⭐ Alta calificación (${a.rating}/5)`
    }));
  },

  /**
   * Obtiene todas las atracciones de ATTRACTIONS_DATA con metadata adicional
   */
  getAllAttractions() {
    const attractions = [];

    Object.entries(ATTRACTIONS_DATA).forEach(([categoryKey, categoryData]) => {
      categoryData.items.forEach(item => {
        attractions.push({
          ...item,
          categoryKey: categoryKey,
          categoryName: categoryData.category,
          categoryIcon: categoryData.icon
        });
      });
    });

    return attractions;
  },

  /**
   * Genera una razón legible de por qué se recomienda
   */
  getMatchReason(matchedPreferences) {
    if (matchedPreferences.length === 0) {
      return '⭐ Popular';
    }

    const prefNames = matchedPreferences.map(pref => {
      const cat = CATEGORIES.find(c => c.id === pref);
      return cat ? `${cat.icon} ${cat.name}` : pref;
    });

    if (prefNames.length === 1) {
      return `✨ Porque te gusta ${prefNames[0]}`;
    } else if (prefNames.length === 2) {
      return `✨ Porque te gusta ${prefNames[0]} y ${prefNames[1]}`;
    } else {
      return `✨ Combina ${prefNames.slice(0, 2).join(', ')} y más`;
    }
  },

  /**
   * Clasificación de actividades por hora del día
   */
  timeOfDayClassification: {
    morning: ['temple', 'shrine', 'garden', 'market', 'park', 'museum', 'castle', 'nature', 'hiking', 'breakfast', 'cafe'],
    afternoon: ['shopping', 'district', 'museum', 'activity', 'theme park', 'aquarium', 'arcade', 'store', 'mall', 'cafe', 'lunch'],
    evening: ['restaurant', 'dinner', 'view', 'observatory', 'sunset', 'illumination', 'night view'],
    night: ['bar', 'izakaya', 'nightlife', 'club', 'karaoke', 'ramen', 'entertainment', 'golden gai']
  },

  /**
   * Determina el mejor momento del día para una actividad
   * @param {Object} attraction - Atracción a evaluar
   * @returns {string} 'morning', 'afternoon', 'evening', 'night', or 'anytime'
   */
  getBestTimeOfDay(attraction) {
    const text = `${attraction.name} ${attraction.description} ${attraction.tips || ''}`.toLowerCase();

    // Chequear keywords de cada momento del día
    for (const [timeOfDay, keywords] of Object.entries(this.timeOfDayClassification)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return timeOfDay;
        }
      }
    }

    // Default: anytime
    return 'anytime';
  },

  /**
   * Obtiene recomendaciones diarias basadas en la ciudad y día del viaje
   * @param {Array<string>} userPreferences - Preferencias del usuario
   * @param {string} city - Ciudad del día
   * @param {number} dayNumber - Número del día en el itinerario
   * @param {number} activitiesNeeded - Cantidad de actividades necesarias
   * @returns {Array} Actividades recomendadas para ese día
   */
  getDailyRecommendations(userPreferences, city, dayNumber, activitiesNeeded = 4) {
    // Obtener recomendaciones base (más cantidad para mejor diversificación)
    const recommendations = this.getRecommendations(
      userPreferences,
      city,
      activitiesNeeded * 4 // Pedir más para tener mejor variedad
    );

    // ALGORITMO DE DIVERSIFICACIÓN MEJORADO
    const selectedActivities = [];
    const usedCategories = new Map(); // Usar Map para contar frecuencia
    const usedPriceRanges = new Set();

    // Definir rangos de precio para diversificar
    const getPriceRange = (price) => {
      if (price === 0) return 'free';
      if (price <= 1000) return 'budget';
      if (price <= 3000) return 'moderate';
      return 'expensive';
    };

    // Fase 1: Seleccionar actividades diversificadas
    recommendations.forEach(rec => {
      if (selectedActivities.length >= activitiesNeeded) return;

      const categoryCount = usedCategories.get(rec.categoryKey) || 0;
      const priceRange = getPriceRange(rec.price);

      // Priorizar si:
      // 1. Es de una categoría poco usada
      // 2. Es gratis (siempre bueno tener opciones gratis)
      // 3. Es de un rango de precio diferente (para variedad de presupuesto)
      const shouldAdd =
        categoryCount === 0 || // Nueva categoría
        rec.price === 0 || // Gratis
        !usedPriceRanges.has(priceRange) || // Nuevo rango de precio
        selectedActivities.length < activitiesNeeded * 0.5; // Primera mitad: ser más flexible

      if (shouldAdd && categoryCount < 2) { // Máximo 2 por categoría
        selectedActivities.push(rec);
        usedCategories.set(rec.categoryKey, categoryCount + 1);
        usedPriceRanges.add(priceRange);
      }
    });

    // Fase 2: Completar con las mejores recomendaciones si falta
    if (selectedActivities.length < activitiesNeeded) {
      recommendations.forEach(rec => {
        if (selectedActivities.length >= activitiesNeeded) return;
        if (!selectedActivities.includes(rec)) {
          selectedActivities.push(rec);
        }
      });
    }

    // Fase 3: Ordenar para mejor flujo del día
    // ✨ NUEVO: Orden inteligente por momento del día
    const timeOrder = { morning: 1, afternoon: 2, evening: 3, night: 4, anytime: 2.5 };

    selectedActivities.sort((a, b) => {
      // 1. Ordenar por momento del día óptimo
      const aTime = this.getBestTimeOfDay(a);
      const bTime = this.getBestTimeOfDay(b);
      const timeComparison = timeOrder[aTime] - timeOrder[bTime];

      if (timeComparison !== 0) return timeComparison;

      // 2. Dentro del mismo momento, priorizar actividades con reserva
      if (a.reserveDays > 0 && b.reserveDays === 0) return -1;
      if (a.reserveDays === 0 && b.reserveDays > 0) return 1;

      // 3. Finalmente por score de recomendación
      return b.recommendationScore - a.recommendationScore;
    });

    // Agregar metadata de tiempo recomendado
    selectedActivities.forEach(activity => {
      activity.bestTimeOfDay = this.getBestTimeOfDay(activity);
    });

    return selectedActivities;
  },

  /**
   * Busca atracciones por nombre o descripción
   * @param {string} query - Término de búsqueda
   * @param {Array<string>} userPreferences - Para ordenar resultados por relevancia
   * @returns {Array} Atracciones que coinciden con la búsqueda
   */
  search(query, userPreferences = []) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const allAttractions = this.getAllAttractions();
    const results = [];

    allAttractions.forEach(attraction => {
      const searchableText = `${attraction.name} ${attraction.description} ${attraction.tips || ''} ${attraction.city}`.toLowerCase();

      if (searchableText.includes(searchTerm)) {
        let relevanceScore = 0;

        // Mayor relevancia si está en el nombre
        if (attraction.name.toLowerCase().includes(searchTerm)) {
          relevanceScore += 10;
        }

        // Relevancia por rating
        relevanceScore += attraction.rating * 2;

        // Bonus si coincide con preferencias
        if (userPreferences.length > 0) {
          const recScore = this.getRecommendations(userPreferences, attraction.city, 999)
            .find(r => r.name === attraction.name)?.recommendationScore || 0;
          relevanceScore += recScore * 0.1;
        }

        results.push({
          ...attraction,
          relevanceScore: relevanceScore
        });
      }
    });

    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return results;
  },

  /**
   * 🌍 NUEVA FUNCIÓN: Calcula la distancia entre dos coordenadas geográficas
   * Utiliza la fórmula de Haversine para calcular distancia en kilómetros
   * @param {Object} coord1 - {lat, lng} primera coordenada
   * @param {Object} coord2 - {lat, lng} segunda coordenada
   * @returns {number} Distancia en kilómetros
   */
  calculateDistance(coord1, coord2) {
    if (!coord1 || !coord2 || !coord1.lat || !coord1.lng || !coord2.lat || !coord2.lng) {
      return Infinity; // Sin coordenadas = distancia infinita
    }

    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLng = this.deg2rad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distancia en km

    return distance;
  },

  /**
   * Convierte grados a radianes
   */
  deg2rad(deg) {
    return deg * (Math.PI/180);
  },

  /**
   * 🏨 NUEVA FUNCIÓN: Obtiene atracciones cercanas a una ubicación específica
   * Ideal para recomendar lugares cerca del hotel donde te hospedas
   * @param {Object} location - {lat, lng, name} ubicación de referencia (hotel)
   * @param {Array<string>} userPreferences - Preferencias del usuario
   * @param {number} radiusKm - Radio de búsqueda en kilómetros (default: 5km)
   * @param {number} limit - Número máximo de recomendaciones
   * @returns {Array} Atracciones ordenadas por proximidad y relevancia
   */
  getNearbyRecommendations(location, userPreferences = [], radiusKm = 5, limit = 10) {
    if (!location || !location.lat || !location.lng) {
      console.warn('⚠️ getNearbyRecommendations: ubicación inválida', location);
      return [];
    }

    const allAttractions = this.getAllAttractions();
    const nearbyAttractions = [];

    allAttractions.forEach(attraction => {
      // Solo procesar atracciones con coordenadas
      if (!attraction.coordinates) {
        return;
      }

      const distance = this.calculateDistance(location, attraction.coordinates);

      // Filtrar por radio de búsqueda
      if (distance <= radiusKm) {
        // Calcular score base de recomendación
        let score = 0;
        const matchedPreferences = [];

        // Score por preferencias del usuario
        if (userPreferences && userPreferences.length > 0) {
          userPreferences.forEach(pref => {
            if (this.categoryMapping[pref] &&
                this.categoryMapping[pref].includes(attraction.categoryKey)) {
              score += 10;
              matchedPreferences.push(pref);
            }

            if (this.keywordMapping[pref]) {
              const keywords = this.keywordMapping[pref];
              const attractionText = `${attraction.name} ${attraction.description} ${attraction.tips || ''}`.toLowerCase();
              keywords.forEach(keyword => {
                if (attractionText.includes(keyword.toLowerCase())) {
                  score += 3;
                  if (!matchedPreferences.includes(pref)) {
                    matchedPreferences.push(pref);
                  }
                }
              });
            }
          });
        }

        // Bonus por rating alto
        score += attraction.rating * 3;

        // Bonus por proximidad (mientras más cerca, mayor score)
        // 0km = +20 puntos, 5km = +0 puntos (decremento lineal)
        const proximityBonus = Math.max(0, 20 * (1 - distance / radiusKm));
        score += proximityBonus;

        // Bonus por ser gratis
        if (attraction.price === 0) {
          score += 5;
        }

        nearbyAttractions.push({
          ...attraction,
          distanceKm: parseFloat(distance.toFixed(2)),
          recommendationScore: score,
          matchedPreferences: matchedPreferences,
          matchReason: this.getNearbyMatchReason(matchedPreferences, distance, location.name),
          proximityScore: proximityBonus
        });
      }
    });

    // Ordenar por score descendente
    nearbyAttractions.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return nearbyAttractions.slice(0, limit);
  },

  /**
   * Genera razón de recomendación para lugares cercanos
   */
  getNearbyMatchReason(matchedPreferences, distance, locationName) {
    const distanceText = distance < 1
      ? `A ${Math.round(distance * 1000)}m`
      : `A ${distance.toFixed(1)}km`;

    const locationText = locationName ? ` de ${locationName}` : '';

    if (matchedPreferences.length === 0) {
      return `📍 ${distanceText}${locationText}`;
    }

    const prefNames = matchedPreferences.map(pref => {
      const cat = CATEGORIES.find(c => c.id === pref);
      return cat ? cat.name : pref;
    });

    return `📍 ${distanceText}${locationText} • ${prefNames.slice(0, 2).join(', ')}`;
  },

  /**
   * 🏨 NUEVA FUNCIÓN: Obtiene recomendaciones inteligentes basadas en hoteles del itinerario
   * Esta función integra los hoteles guardados con las recomendaciones de atracciones
   * @param {Array} hotels - Array de hoteles del usuario [{name, city, checkIn, checkOut, ...}]
   * @param {Array<string>} userPreferences - Preferencias del usuario
   * @param {number} limit - Número máximo de recomendaciones por hotel
   * @returns {Object} Recomendaciones agrupadas por hotel
   */
  getHotelBasedRecommendations(hotels, userPreferences = [], limit = 5) {
    if (!hotels || hotels.length === 0) {
      return {
        hasHotels: false,
        message: 'Agrega tus hoteles en la sección "Hoteles" para recibir recomendaciones personalizadas de lugares cercanos.',
        recommendations: []
      };
    }

    const hotelRecommendations = [];

    // Ciudades de Japón con coordenadas (del archivo hotels.js)
    const japanCities = {
      'Tokyo': { lat: 35.6762, lng: 139.6503 },
      'Kyoto': { lat: 35.0116, lng: 135.7681 },
      'Osaka': { lat: 34.6937, lng: 135.5023 },
      'Nagoya': { lat: 35.1815, lng: 136.9066 },
      'Fukuoka': { lat: 33.5904, lng: 130.4017 },
      'Sapporo': { lat: 43.0642, lng: 141.3469 },
      'Hakone': { lat: 35.2324, lng: 139.1069 },
      'Hiroshima': { lat: 34.3853, lng: 132.4553 }
    };

    hotels.forEach(hotel => {
      // Intentar obtener coordenadas de la ciudad del hotel
      const cityCoords = japanCities[hotel.city] || this.getCityCoordinates(hotel.city);

      if (cityCoords) {
        const location = {
          lat: cityCoords.lat,
          lng: cityCoords.lng,
          name: hotel.name
        };

        // Obtener atracciones cercanas (radio de 5km)
        const nearby = this.getNearbyRecommendations(location, userPreferences, 5, limit);

        // Calcular duración de la estadía
        const checkIn = new Date(hotel.checkIn);
        const checkOut = new Date(hotel.checkOut);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        hotelRecommendations.push({
          hotel: {
            name: hotel.name,
            city: hotel.city,
            checkIn: hotel.checkIn,
            checkOut: hotel.checkOut,
            nights: nights,
            coordinates: location
          },
          attractions: nearby,
          totalAttractions: nearby.length,
          avgDistance: nearby.length > 0
            ? (nearby.reduce((sum, a) => sum + a.distanceKm, 0) / nearby.length).toFixed(2)
            : 0
        });
      } else {
        console.warn(`⚠️ No se encontraron coordenadas para la ciudad: ${hotel.city}`);
      }
    });

    return {
      hasHotels: true,
      totalHotels: hotels.length,
      recommendations: hotelRecommendations,
      message: `Se encontraron ${hotelRecommendations.length} hoteles con recomendaciones cercanas`
    };
  },

  /**
   * Obtiene coordenadas aproximadas de una ciudad (fallback)
   */
  getCityCoordinates(cityName) {
    // Mapeo básico de ciudades japonesas
    const cityMap = {
      'tokyo': { lat: 35.6762, lng: 139.6503 },
      'kyoto': { lat: 35.0116, lng: 135.7681 },
      'osaka': { lat: 34.6937, lng: 135.5023 },
      'nagoya': { lat: 35.1815, lng: 136.9066 },
      'fukuoka': { lat: 33.5904, lng: 130.4017 },
      'sapporo': { lat: 43.0642, lng: 141.3469 },
      'hakone': { lat: 35.2324, lng: 139.1069 },
      'hiroshima': { lat: 34.3853, lng: 132.4553 }
    };

    const normalized = cityName.toLowerCase().trim();
    return cityMap[normalized] || null;
  }
};

// Exponer globalmente
window.RecommendationEngine = RecommendationEngine;
