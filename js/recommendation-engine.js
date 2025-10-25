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
              'calligraphy', 'ikebana', 'kabuki', 'noh', 'sumo', 'kimono', 'torii'],
    food: ['ramen', 'sushi', 'restaurant', 'cafe', 'market', 'food', 'izakaya',
           'yakiniku', 'wagyu', 'vegan', 'tempura', 'tonkatsu', 'okonomiyaki', 'takoyaki',
           'udon', 'soba', 'bento', 'kaiseki', 'tsukemen', 'gyoza', 'kushikatsu',
           'yakitori', 'motsunabe', 'chanko nabe', 'shabu shabu', 'sukiyaki', 'matcha',
           'taiyaki', 'mochi', 'wagashi', 'conveyor belt', 'street food'],
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
    // Primero actividades caras/importantes, luego gratis/casuales
    selectedActivities.sort((a, b) => {
      // Priorizar actividades con reserva necesaria (hacerlas primero)
      if (a.reserveDays > 0 && b.reserveDays === 0) return -1;
      if (a.reserveDays === 0 && b.reserveDays > 0) return 1;

      // Luego por score de recomendación
      return b.recommendationScore - a.recommendationScore;
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
  }
};

// Exponer globalmente
window.RecommendationEngine = RecommendationEngine;
