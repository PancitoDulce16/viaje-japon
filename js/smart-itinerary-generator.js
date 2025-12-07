// js/smart-itinerary-generator.js - Smart Complete Itinerary Generator
// Sistema inteligente que genera itinerarios completos basados en preferencias del usuario

import { activities as NEW_ACTIVITY_DATABASE } from '../data/activities-database.js';

/**
 * ----------------------------------------------------------------
 * ADAPTER FOR NEW DATABASE
 * ----------------------------------------------------------------
 */

function inferInterests(category, name) {
    const mapping = {
        'culture': ['cultural', 'history'],
        'food': ['food'],
        'photography': ['photography', 'sightseeing'],
        'nature': ['nature', 'relax'],
        'shopping': ['shopping', 'fashion'],
        'anime': ['anime', 'pop-culture'],
        'nightlife': ['nightlife'],
        'relaxation': ['relax'],
        'family': ['family-friendly']
    };
    let interests = mapping[category] || [category];

    // Add interests based on keywords in name
    if (name.toLowerCase().includes('temple') || name.toLowerCase().includes('santuario') || name.toLowerCase().includes('shrine')) {
        interests.push('cultural', 'history');
    }
    if (name.toLowerCase().includes('ramen') || name.toLowerCase().includes('market')) {
        interests.push('food');
    }
    if (name.toLowerCase().includes('park') || name.toLowerCase().includes('garden')) {
        interests.push('nature', 'relax');
    }

    return [...new Set(interests)]; // return unique interests
}

function adaptNewToOldDB(newDb) {
  const oldDb = {};

  // Mapeo de categorías nuevas a antiguas (para compatibilidad)
  const categoryMapping = {
    'culture': 'cultural',
    'history': 'cultural',
    'food': 'food',
    'gastronomy': 'food',
    'photography': 'attraction',
    'modern': 'attraction',
    'nature': 'nature',
    'shopping': 'shopping',
    'nightlife': 'nightlife',
    'anime': 'shopping',
    'relaxation': 'relax',
    'wellness': 'relax',
    'art': 'museum',
    'adventure': 'attraction'
  };

  for (const cityKey in newDb) {
    if (newDb.hasOwnProperty(cityKey)) {
        // La nueva estructura es directo array, no { activities: [...] }
        const cityActivities = Array.isArray(newDb[cityKey]) ? newDb[cityKey] : (newDb[cityKey].activities || []);

        oldDb[cityKey] = cityActivities.map(activity => {
          // Usar primera categoría del array para inferir interests
          const firstCategory = Array.isArray(activity.categories) ? activity.categories[0] : activity.category;
          const interests = inferInterests(firstCategory, activity.name);

          // Mapear categoría principal
          const mappedCategory = categoryMapping[firstCategory] || firstCategory || 'attraction';

          return {
            name: activity.name,
            category: mappedCategory,
            // Soportar ambas estructuras de coordenadas
            lat: activity.coordinates?.lat || activity.location?.lat || 0,
            lng: activity.coordinates?.lon || activity.coordinates?.lng || activity.location?.lng || 0,
            lon: activity.coordinates?.lon || activity.location?.lon || 0, // Preservar para Gemini
            duration: activity.duration,
            cost: activity.cost,
            interests: interests,
            area: activity.area || activity.station?.replace(' Station', '') || 'Unknown',
            popularity: (activity.quality_rating || activity.rating || 3.5) * 20,
            timeOfDay: Array.isArray(activity.best_time) ? activity.best_time[0] : (activity.timeOfDay || 'any'),
            description: activity.description,
            id: activity.id,
            // Preservar propiedades nuevas de Gemini
            opening_hours: activity.opening_hours,
            quality_rating: activity.quality_rating,
            accessibility: activity.accessibility,
            tags: activity.tags,
            crowd_level: activity.crowd_level
          };
        });
    }
  }
  return oldDb;
}

const ACTIVITY_DATABASE = adaptNewToOldDB(NEW_ACTIVITY_DATABASE);


/**
 * ⚡ INTENSITY LEVELS - Controla qué tan lleno está cada día
 */
const INTENSITY_LEVELS = {
  light: {
    label: '🐢 Light',
    description: 'Relajado, 2-3 actividades/día',
    activitiesPerDay: { min: 2, max: 3 },
    startTime: 9,
    endTime: 18,
    includeShortActivities: false
  },
  moderate: {
    label: '🚶 Moderate',
    description: 'Balanceado, 4-5 actividades/día',
    activitiesPerDay: { min: 4, max: 5 },
    startTime: 8,
    endTime: 20,
    includeShortActivities: false
  },
  packed: {
    label: '🏃 Packed',
    description: '¡Días llenos! 6-8 actividades/día',
    activitiesPerDay: { min: 6, max: 8 },
    startTime: 7,
    endTime: 21,
    includeShortActivities: true
  },
  extreme: {
    label: '⚡ Extreme',
    description: 'Super intenso, 9-11 actividades/día',
    activitiesPerDay: { min: 9, max: 11 },
    startTime: 6,
    endTime: 22,
    includeShortActivities: true
  },
  maximum: {
    label: '🌪️ Maximum',
    description: 'TODO el día lleno, 12-15 actividades',
    activitiesPerDay: { min: 12, max: 15 },
    startTime: 6,
    endTime: 23,
    includeShortActivities: true
  }
};

/**
 * 🎨 THEMED DAYS - Temas específicos para cada día
 */
const THEMED_DAYS = {
  traditional: {
    name: '⛩️ Traditional Japan',
    description: 'Templos, jardines, ceremonia de té',
    interests: ['cultural', 'history'],
    categories: ['cultural', 'nature'],
    avoidCategories: ['nightlife', 'shopping']
  },
  foodie: {
    name: '🍜 Ultimate Food Tour',
    description: 'Mercados, street food, restaurantes',
    interests: ['food'],
    categories: ['food', 'market'],
    avoidCategories: ['museum']
  },
  nature: {
    name: '🌸 Nature & Zen',
    description: 'Parques, bambú, jardines, onsen',
    interests: ['nature', 'relax'],
    categories: ['nature', 'relax'],
    avoidCategories: ['shopping', 'nightlife']
  },
  popculture: {
    name: '🎌 Anime & Pop Culture',
    description: 'Akihabara, cafés temáticos, Pokemon',
    interests: ['anime', 'technology'],
    categories: ['shopping', 'attraction'],
    specificPlaces: ['Akihabara', 'Nakano', 'Ikebukuro']
  },
  nightlife: {
    name: '🌃 Tokyo Nightlife',
    description: 'Bares, karaoke, observatorios nocturnos',
    interests: ['nightlife'],
    categories: ['nightlife', 'food'],
    startTime: 17,
    endTime: 23
  },
  photogenic: {
    name: '📸 Instagram Perfect',
    description: 'Lugares ultra photogenic',
    interests: ['photography'],
    prioritizePopularity: true
  },
  shopping: {
    name: '🛍️ Shopping Spree',
    description: 'De Uniqlo a Louis Vuitton',
    interests: ['shopping', 'fashion'],
    categories: ['shopping'],
    avoidCategories: ['museum', 'cultural']
  },
  local: {
    name: '🎎 Local Experience',
    description: 'Barrios residenciales, mercados locales',
    interests: ['culture', 'food'],
    avoidTouristy: true,
    maxPopularity: 70
  }
};

/**
 * 👥 COMPANION TYPES - Ajusta según con quién viajas
 */
const COMPANION_TYPES = {
  solo: {
    name: '🧍 Solo Traveler',
    paceMultiplier: 1.1,
    preferences: {
      socialPlaces: true,
      flexibleSchedule: true
    }
  },
  couple: {
    name: '❤️ Couple / Honeymoon',
    paceMultiplier: 0.9,
    preferences: {
      romanticSpots: true,
      fancyRestaurants: true,
      sunsetViews: true
    },
    avoidCategories: ['crowded']
  },
  family: {
    name: '👨‍👩‍👧‍👦 Family with Kids',
    paceMultiplier: 0.7,
    preferences: {
      kidFriendly: true,
      interactiveMuseums: true,
      parks: true
    },
    categories: ['nature', 'attraction'],
    avoidCategories: ['nightlife'],
    maxWalkingTime: 120,
    includeRestBreaks: true
  },
  seniors: {
    name: '👴👵 Seniors',
    paceMultiplier: 0.6,
    preferences: {
      accessible: true,
      lessWalking: true,
      benchBreaks: true
    },
    maxWalkingTime: 90,
    startTime: 9,
    endTime: 18
  },
  friends: {
    name: '🎉 Group of Friends',
    paceMultiplier: 1.2,
    preferences: {
      nightlife: true,
      groupActivities: true,
      foodTours: true
    },
    categories: ['nightlife', 'food', 'shopping']
  }
};

/**
 * 🌸 SEASON INTELLIGENCE - Detecta temporadas especiales en Japón
 */
const SEASON_INTELLIGENCE = {
  cherryBlossom: {
    name: '🌸 Cherry Blossom Season',
    icon: '🌸',
    months: [3, 4], // March - April
    peakDates: { start: { month: 3, day: 25 }, end: { month: 4, day: 10 } },
    recommendations: ['Ueno Park', 'Shinjuku Gyoen', 'Maruyama Park', 'Arashiyama'],
    tips: 'Visita parques temprano en la mañana para evitar multitudes',
    specialEvents: ['Hanami (picnic bajo los cerezos)', 'Night illuminations'],
    bonus: 20 // Bonus score para actividades relacionadas
  },
  autumn: {
    name: '🍂 Autumn Foliage',
    icon: '🍂',
    months: [11], // November
    peakDates: { start: { month: 11, day: 15 }, end: { month: 11, day: 30 } },
    recommendations: ['Arashiyama', 'Tofuku-ji Temple', 'Eikando Temple'],
    tips: 'Los templos en Kyoto son especialmente hermosos en otoño',
    specialEvents: ['Momiji viewing', 'Autumn light-ups'],
    bonus: 20
  },
  newYear: {
    name: '🎊 New Year',
    icon: '🎊',
    months: [1], // January
    peakDates: { start: { month: 1, day: 1 }, end: { month: 1, day: 3 } },
    recommendations: ['Meiji Shrine', 'Senso-ji Temple', 'Fushimi Inari'],
    tips: 'Muchas tiendas cierran 1-3 de enero. Templos muy concurridos.',
    specialEvents: ['Hatsumode (primera visita del año al templo)'],
    bonus: 15
  },
  goldenWeek: {
    name: '🎌 Golden Week',
    icon: '🎌',
    months: [5], // May
    peakDates: { start: { month: 4, day: 29 }, end: { month: 5, day: 5 } },
    recommendations: [],
    tips: '⚠️ Todo muy concurrido y caro. Evita si es posible.',
    specialEvents: [],
    bonus: -10 // Penalización por multitudes
  },
  summer: {
    name: '☀️ Summer Festivals',
    icon: '☀️',
    months: [7, 8], // July - August
    peakDates: { start: { month: 7, day: 1 }, end: { month: 8, day: 31 } },
    recommendations: ['Sumida River Fireworks', 'Gion Matsuri'],
    tips: 'Muy caluroso y húmedo. Lleva agua y busca aire acondicionado.',
    specialEvents: ['Matsuri (festivales de verano)', 'Fireworks (hanabi)'],
    bonus: 10
  },
  winter: {
    name: '❄️ Winter Illuminations',
    icon: '❄️',
    months: [12], // December
    peakDates: { start: { month: 12, day: 1 }, end: { month: 12, day: 25 } },
    recommendations: ['Roppongi Hills', 'Tokyo Station', 'Shibuya Blue Cave'],
    tips: 'Hermosas iluminaciones navideñas en toda la ciudad',
    specialEvents: ['Christmas illuminations', 'New Year preparations'],
    bonus: 15
  }
};

/**
 * 🗺️ GEOGRAPHIC CLUSTERS - Agrupación inteligente por zonas
 * Para evitar cruzar la ciudad múltiples veces al día
 */
const GEOGRAPHIC_CLUSTERS = {
  tokyo: {
    asakusa: {
      name: 'Asakusa',
      center: { lat: 35.7147, lng: 139.7967 },
      keywords: ['Senso-ji', 'Tokyo Skytree', 'Nakamise', 'Sumida'],
      stations: ['Asakusa', 'Skytree', 'Oshiage']
    },
    shibuya: {
      name: 'Shibuya & Harajuku',
      center: { lat: 35.6595, lng: 139.7005 },
      keywords: ['Shibuya', 'Harajuku', 'Meiji Shrine', 'Yoyogi', 'Omotesando'],
      stations: ['Shibuya', 'Harajuku', 'Omotesando']
    },
    shinjuku: {
      name: 'Shinjuku',
      center: { lat: 35.6938, lng: 139.7034 },
      keywords: ['Shinjuku', 'Kabukicho', 'Tokyo Metropolitan', 'Shinjuku Gyoen'],
      stations: ['Shinjuku', 'Shinjuku-sanchome']
    },
    akihabara: {
      name: 'Akihabara & Ueno',
      center: { lat: 35.7022, lng: 139.7741 },
      keywords: ['Akihabara', 'Ueno Park', 'Ameyoko', 'Electric Town'],
      stations: ['Akihabara', 'Ueno']
    },
    roppongi: {
      name: 'Roppongi & Tokyo Tower',
      center: { lat: 35.6586, lng: 139.7454 },
      keywords: ['Roppongi', 'Tokyo Tower', 'Mori Art Museum', 'TeamLab'],
      stations: ['Roppongi', 'Azabu-juban', 'Kamiyacho']
    },
    ginza: {
      name: 'Ginza & Tokyo Station',
      center: { lat: 35.6762, lng: 139.7653 },
      keywords: ['Ginza', 'Tokyo Station', 'Imperial Palace', 'Marunouchi'],
      stations: ['Ginza', 'Tokyo', 'Yurakucho']
    },
    odaiba: {
      name: 'Odaiba',
      center: { lat: 35.6262, lng: 139.7744 },
      keywords: ['Odaiba', 'teamLab Borderless', 'Rainbow Bridge', 'DiverCity'],
      stations: ['Odaiba-kaihinkoen', 'Tokyo Teleport']
    }
  },
  kyoto: {
    central: {
      name: 'Central Kyoto',
      center: { lat: 35.0116, lng: 135.7681 },
      keywords: ['Nishiki Market', 'Gion', 'Pontocho', 'Downtown'],
      stations: ['Kawaramachi', 'Gion-Shijo']
    },
    arashiyama: {
      name: 'Arashiyama',
      center: { lat: 35.0170, lng: 135.6730 },
      keywords: ['Arashiyama', 'Bamboo Grove', 'Tenryu-ji', 'Togetsukyo Bridge'],
      stations: ['Arashiyama', 'Saga-Arashiyama']
    },
    higashiyama: {
      name: 'Higashiyama',
      center: { lat: 34.9946, lng: 135.7809 },
      keywords: ['Kiyomizu-dera', 'Sannenzaka', 'Yasaka Shrine', 'Ninenzaka'],
      stations: ['Gion-Shijo', 'Kiyomizu-Gojo']
    },
    northern: {
      name: 'Northern Kyoto',
      center: { lat: 35.0394, lng: 135.7292 },
      keywords: ['Kinkaku-ji', 'Ryoan-ji', 'Kitano Tenmangu'],
      stations: ['Kitaoji', 'Kinkakuji-michi']
    },
    fushimi: {
      name: 'Fushimi',
      center: { lat: 34.9671, lng: 135.7726 },
      keywords: ['Fushimi Inari', 'Inari'],
      stations: ['Fushimi-Inari', 'Inari']
    }
  },
  osaka: {
    namba: {
      name: 'Namba & Dotonbori',
      center: { lat: 34.6687, lng: 135.5013 },
      keywords: ['Dotonbori', 'Namba', 'Shinsaibashi', 'Kuromon Market'],
      stations: ['Namba', 'Shinsaibashi', 'Nipponbashi']
    },
    umeda: {
      name: 'Umeda & Osaka Station',
      center: { lat: 34.7024, lng: 135.4959 },
      keywords: ['Umeda', 'Osaka Station', 'Umeda Sky Building'],
      stations: ['Osaka', 'Umeda']
    },
    castle: {
      name: 'Osaka Castle Area',
      center: { lat: 34.6873, lng: 135.5262 },
      keywords: ['Osaka Castle', 'Castle Park'],
      stations: ['Osakajokoen', 'Tanimachi-yonchome']
    },
    bayarea: {
      name: 'Bay Area',
      center: { lat: 34.6656, lng: 135.4325 },
      keywords: ['Universal Studios', 'Kaiyukan', 'Tempozan'],
      stations: ['Universal City', 'Osakako']
    }
  }
};

/**
 * 📸 PHOTOGRAPHY INTELLIGENCE - Mejores spots y horarios
 */
const PHOTOGRAPHY_SPOTS = {
  goldenHour: {
    name: 'Golden Hour Photography',
    description: 'Mejor luz para fotos (6-7am, 5-6pm)',
    spots: [
      'Tokyo Tower',
      'Shibuya Sky',
      'Fushimi Inari',
      'Arashiyama Bamboo',
      'Tokyo Skytree'
    ],
    timeRanges: [
      { start: 6, end: 7 }, // Morning
      { start: 17, end: 18 } // Evening
    ]
  },
  blueHour: {
    name: 'Blue Hour Photography',
    description: 'Cielo azul profundo, luces encendidas',
    spots: [
      'Shibuya Crossing',
      'Tokyo Tower',
      'Dotonbori',
      'Fushimi Inari gates'
    ],
    timeRanges: [
      { start: 18, end: 19 }, // Evening
      { start: 5, end: 6 } // Dawn
    ]
  },
  nightPhotography: {
    name: 'Night Photography',
    description: 'Luces de neón y vida nocturna',
    spots: [
      'Shibuya Crossing',
      'Shinjuku Golden Gai',
      'Dotonbori',
      'teamLab Borderless'
    ],
    timeRanges: [
      { start: 19, end: 23 }
    ]
  },
  earlyMorning: {
    name: 'Early Morning (Avoid Crowds)',
    description: 'Temprano para evitar multitudes',
    spots: [
      'Fushimi Inari',
      'Meiji Shrine',
      'Tsukiji Market',
      'Sensoji Temple'
    ],
    timeRanges: [
      { start: 6, end: 8 }
    ]
  }
};

/**
 * ⛅ WEATHER CATEGORIES - Actividades según clima
 */
const WEATHER_CATEGORIES = {
  sunny: {
    name: 'Sunny Day',
    icon: '☀️',
    preferred: ['nature', 'outdoor', 'photography', 'parks'],
    avoid: ['indoor']
  },
  rainy: {
    name: 'Rainy Day',
    icon: '🌧️',
    preferred: ['museum', 'shopping', 'indoor', 'food'],
    avoid: ['nature', 'parks', 'outdoor']
  },
  cloudy: {
    name: 'Cloudy',
    icon: '☁️',
    preferred: ['any'],
    avoid: []
  },
  hot: {
    name: 'Very Hot',
    icon: '🥵',
    preferred: ['indoor', 'air-conditioned', 'early-morning'],
    avoid: ['long-walks']
  },
  cold: {
    name: 'Cold',
    icon: '🥶',
    preferred: ['indoor', 'short-outdoor'],
    avoid: ['long-outdoor']
  }
};

/**
 * Smart Itinerary Generator
 */
export const SmartItineraryGenerator = {

  /**
   * 🎨 VARIACIONES PERSONALIZADAS DINÁMICAS
   * Genera 3 variaciones basadas en tus intereses dominantes (no fijas)
   */
  async generateMultipleVariations(profile) {
    console.log('🎨 Generando 3 variaciones personalizadas del itinerario...');

    const variations = [];
    const userInterests = profile.interests || [];

    // Definir arquetipos de variaciones basados en combinaciones de intereses
    const VARIATION_TEMPLATES = {
      cultural: {
        icon: '⛩️', name: 'Cultural Explorer',
        description: 'Templos, historia y arte tradicional japonés',
        interests: ['cultural', 'history', 'art'],
        tags: ['Templos', 'Historia', 'Arte', 'Tradición']
      },
      foodie: {
        icon: '🍜', name: 'Ultimate Foodie',
        description: 'Gastronomía, mercados y experiencias culinarias',
        interests: ['food', 'market'],
        tags: ['Comida', 'Mercados', 'Restaurantes', 'Street Food']
      },
      nature: {
        icon: '🌸', name: 'Nature Lover',
        description: 'Jardines, onsen, naturaleza y relax',
        interests: ['nature', 'relax'],
        tags: ['Jardines', 'Onsen', 'Naturaleza', 'Relax']
      },
      popculture: {
        icon: '🎮', name: 'Otaku Paradise',
        description: 'Anime, manga, gaming y cultura pop',
        interests: ['anime', 'pop-culture', 'technology'],
        tags: ['Anime', 'Gaming', 'Akihabara', 'Pop Culture']
      },
      shopping: {
        icon: '🛍️', name: 'Shopping Spree',
        description: 'Fashion, electrónicos y souvenirs',
        interests: ['shopping', 'fashion'],
        tags: ['Shopping', 'Fashion', 'Electrónicos', 'Souvenirs']
      },
      nightlife: {
        icon: '🌃', name: 'Night Owl',
        description: 'Bares, karaoke, clubes y vida nocturna',
        interests: ['nightlife', 'food'],
        tags: ['Bares', 'Karaoke', 'Clubes', 'Nightlife']
      },
      photography: {
        icon: '📸', name: 'Instagram Perfect',
        description: 'Spots fotogénicos y escénicos',
        interests: ['photography', 'nature', 'cultural'],
        tags: ['Fotografía', 'Paisajes', 'Instagrameable']
      },
      adventure: {
        icon: '🏃', name: 'Adventure Seeker',
        description: 'Hiking, actividades físicas y aventuras',
        interests: ['adventure', 'nature'],
        tags: ['Hiking', 'Aventura', 'Deportes', 'Activo']
      },
      balanced: {
        icon: '⚖️', name: 'Experiencia Completa',
        description: 'Mix equilibrado de todo lo mejor',
        interests: userInterests, // Usar todos los intereses del usuario
        tags: ['Equilibrado', 'Variado', 'Completo', 'Recomendado']
      }
    };

    // Calcular qué variaciones son más relevantes para el usuario
    const relevantVariations = this.selectRelevantVariations(userInterests, VARIATION_TEMPLATES);

    console.log('✨ Variaciones seleccionadas:', relevantVariations.map(v => v.name).join(', '));

    // Generar las 3 variaciones
    for (const template of relevantVariations.slice(0, 3)) {
      const variationProfile = {
        ...profile,
        interests: template.interests,
        _variationType: template.icon
      };

      const itinerary = await this.generateCompleteItinerary(variationProfile);

      variations.push({
        id: template.name.toLowerCase().replace(/\s+/g, '-'),
        name: `${template.icon} ${template.name}`,
        description: template.description,
        icon: template.icon,
        itinerary: itinerary,
        tags: template.tags
      });
    }

    console.log('✅ 3 variaciones personalizadas generadas exitosamente');
    return variations;
  },

  /**
   * 🎯 Selecciona las variaciones más relevantes basadas en intereses del usuario
   */
  selectRelevantVariations(userInterests, templates) {
    const scores = [];

    for (const [key, template] of Object.entries(templates)) {
      // Skip balanced, lo agregaremos siempre al final
      if (key === 'balanced') continue;

      // Calcular match score
      let matchScore = 0;
      for (const interest of userInterests) {
        if (template.interests.includes(interest)) {
          matchScore += 10;
        }
      }

      scores.push({
        ...template,
        key,
        matchScore
      });
    }

    // Ordenar por score descendente
    scores.sort((a, b) => b.matchScore - a.matchScore);

    // Tomar top 2 + balanced
    const top2 = scores.slice(0, 2);
    const result = [...top2, templates.balanced];

    // Si no hay buenos matches, usar defaults
    if (top2.every(v => v.matchScore === 0)) {
      return [templates.cultural, templates.foodie, templates.balanced];
    }

    return result;
  },

  /**
   * Prioriza ciertos intereses sobre otros
   */
  prioritizeInterests(originalInterests, priorityInterests) {
    // Combinar intereses originales + prioridades
    const allInterests = [...new Set([...priorityInterests, ...originalInterests])];
    return allInterests;
  },

  /**
   * Genera un itinerario completo basado en preferencias
   * MEJORADO: Con intensity levels, companion-aware, themed days
   */
  async generateCompleteItinerary(profile) {
    const {
      cities = [],
      totalDays = 7,
      dailyBudget = 10000,
      interests = [],
      pace = 'moderate', // light, moderate, packed, extreme, maximum
      startTime = 9,
      hotels = {},
      mustSee = [],
      avoid = [],
      companionType = null, // solo, couple, family, seniors, friends
      themedDays = {}, // { 1: 'traditional', 3: 'foodie', ... }
      tripStartDate = null, // Para detectar temporada
      // 🆕 Nuevos parámetros de contexto
      groupSize = 1,
      travelerAges = [],
      tripEndDate = null,
      dietaryRestrictions = [],
      mobilityNeeds = null
    } = profile;

    console.log('🧠 Generando itinerario completo:', profile);
    console.log(`👥 Companion: ${companionType || 'none'}`);
    console.log(`⚡ Intensity: ${pace}`);
    console.log(`🎫 Group size: ${groupSize} personas`);
    console.log(`🎂 Ages: ${travelerAges.length > 0 ? travelerAges.join(', ') : 'N/A'}`);
    console.log(`🍽️ Dietary: ${dietaryRestrictions.join(', ') || 'none'}`);
    console.log(`♿ Mobility: ${mobilityNeeds || 'none'}`);

    // 🚨 NUEVO: Tracker global de actividades usadas para prevenir duplicados
    const usedActivities = new Set();

    // Distribuir días entre ciudades (basado en intereses)
    const cityDistribution = this.distributeDaysAcrossCities(cities, totalDays, interests);

    const itinerary = {
      title: `Viaje a Japón - ${totalDays} días`,
      days: [],
      totalBudget: dailyBudget * totalDays,
      profile: profile
    };

    let currentDayNumber = 1;

    // Generar días para cada ciudad
    for (const cityAllocation of cityDistribution) {
      const { city, days: daysInCity } = cityAllocation;
      const hotel = hotels[city.toLowerCase()] || null;

      for (let dayInCity = 1; dayInCity <= daysInCity; dayInCity++) {
        const isArrivalDay = currentDayNumber === 1;
        const isDepartureDay = currentDayNumber === totalDays;
        const isFirstDayInCity = dayInCity === 1 && currentDayNumber > 1;

        // 🎨 Obtener tema del día (si fue asignado)
        const themedDay = themedDays[currentDayNumber] || null;

        const day = await this.generateSingleDay({
          dayNumber: currentDayNumber,
          city: city,
          hotel: hotel,
          dailyBudget: dailyBudget,
          interests: interests,
          pace: pace,
          startTime: startTime,
          isArrivalDay: isArrivalDay,
          isDepartureDay: isDepartureDay,
          isFirstDayInCity: isFirstDayInCity,
          mustSee: mustSee.filter(m => m.city === city),
          avoid: avoid,
          googlePlacesAPI: window.GooglePlacesAPI,
          totalDays: totalDays,
          companionType: companionType,
          themedDay: themedDay,
          tripStartDate: tripStartDate,
          usedActivities: usedActivities, // 🚨 Pasar tracker global
          // 🆕 Nuevos parámetros de contexto
          groupSize: groupSize,
          travelerAges: travelerAges,
          dietaryRestrictions: dietaryRestrictions,
          mobilityNeeds: mobilityNeeds
        });

        itinerary.days.push(day);
        currentDayNumber++;
      }
    }

    // 📊 RESUMEN FINAL
    const totalActivities = itinerary.days.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
    const uniqueActivities = usedActivities.size;
    const avgActivitiesPerDay = (totalActivities / itinerary.days.length).toFixed(1);

    console.log('✅ ========== ITINERARIO GENERADO ==========');
    console.log(`📅 Total días: ${itinerary.days.length}`);
    console.log(`🎯 Total actividades: ${totalActivities} (promedio: ${avgActivitiesPerDay}/día)`);
    console.log(`✨ Actividades únicas: ${uniqueActivities}`);
    console.log(`🚫 Duplicados: ${totalActivities - uniqueActivities}`);
    console.log('==========================================');

    return itinerary;
  },

  /**
   * 🎯 DISTRIBUCIÓN INTELIGENTE DE CIUDADES - Basada en intereses
   * No distribución uniforme, sino optimizada por match de intereses
   */
  distributeDaysAcrossCities(cities, totalDays, interests = []) {
    if (cities.length === 0) return [];
    if (cities.length === 1) return [{ city: cities[0], days: totalDays }];

    // Scoring de ciudades basado en intereses
    const CITY_PROFILES = {
      tokyo: {
        strengths: ['pop-culture', 'anime', 'technology', 'shopping', 'nightlife', 'modern'],
        score: { 'pop-culture': 10, 'anime': 10, 'technology': 9, 'shopping': 9, 'nightlife': 9, 'cultural': 6, 'food': 8, 'nature': 4 }
      },
      kyoto: {
        strengths: ['cultural', 'history', 'art', 'nature', 'traditional', 'photography'],
        score: { 'cultural': 10, 'history': 10, 'art': 8, 'nature': 8, 'photography': 9, 'food': 7, 'shopping': 5, 'nightlife': 3 }
      },
      osaka: {
        strengths: ['food', 'nightlife', 'shopping', 'entertainment', 'local'],
        score: { 'food': 10, 'nightlife': 9, 'shopping': 8, 'entertainment': 8, 'cultural': 5, 'nature': 3 }
      },
      nara: {
        strengths: ['nature', 'cultural', 'relax', 'photography'],
        score: { 'nature': 9, 'cultural': 8, 'relax': 9, 'photography': 8, 'history': 7 }
      },
      hakone: {
        strengths: ['nature', 'relax', 'onsen', 'photography'],
        score: { 'nature': 10, 'relax': 10, 'onsen': 10, 'photography': 8, 'cultural': 4 }
      },
      hiroshima: {
        strengths: ['history', 'cultural', 'food', 'photography'],
        score: { 'history': 10, 'cultural': 8, 'food': 7, 'photography': 7, 'nature': 5 }
      }
    };

    // Calcular score de cada ciudad basado en intereses
    const cityScores = cities.map(city => {
      const cityKey = city.toLowerCase();
      const profile = CITY_PROFILES[cityKey];

      if (!profile) {
        // Default si la ciudad no tiene perfil
        return { city, score: 50, days: 0 };
      }

      // Calcular match score
      let matchScore = 0;
      let matchCount = 0;

      for (const interest of interests) {
        if (profile.score[interest]) {
          matchScore += profile.score[interest];
          matchCount++;
        }
      }

      // Average score (0-10 scale)
      const avgScore = matchCount > 0 ? matchScore / matchCount : 5;

      return { city, score: avgScore * 10, days: 0 }; // Normalizar a 0-100
    });

    console.log('🎯 City Scores basados en intereses:', cityScores);

    // Calcular días proporcionalmente al score
    const totalScore = cityScores.reduce((sum, c) => sum + c.score, 0);

    cityScores.forEach(cityData => {
      const proportion = cityData.score / totalScore;
      cityData.days = Math.max(1, Math.round(totalDays * proportion)); // Mínimo 1 día
    });

    // Ajustar si la suma no coincide con totalDays
    let assignedDays = cityScores.reduce((sum, c) => sum + c.days, 0);

    while (assignedDays !== totalDays) {
      if (assignedDays < totalDays) {
        // Agregar días a la ciudad con mayor score
        const topCity = cityScores.reduce((max, c) => c.score > max.score ? c : max);
        topCity.days++;
        assignedDays++;
      } else {
        // Quitar días de la ciudad con menor score (pero mantener mínimo 1)
        const bottomCity = cityScores
          .filter(c => c.days > 1)
          .reduce((min, c) => c.score < min.score ? c : min);
        if (bottomCity) {
          bottomCity.days--;
          assignedDays--;
        } else break;
      }
    }

    console.log('📊 Distribución final de días:', cityScores.map(c => `${c.city}: ${c.days} días`).join(', '));

    return cityScores.map(({ city, days }) => ({ city, days }));
  },

  /**
   * Genera un día completo del itinerario
   * NUEVO: Con Intensity Levels, Companion-Aware, Themed Days, Progressive Energy
   */
  async generateSingleDay(options) {
    const {
      dayNumber,
      city,
      hotel,
      dailyBudget,
      interests,
      pace,
      startTime,
      isArrivalDay,
      isDepartureDay,
      isFirstDayInCity,
      mustSee,
      avoid,
      googlePlacesAPI,
      totalDays,
      companionType,
      themedDay,
      tripStartDate,
      usedActivities = new Set(), // 🚨 NUEVO: Tracker de actividades usadas
      // 🆕 Nuevos parámetros de contexto
      groupSize = 1,
      travelerAges = [],
      dietaryRestrictions = [],
      mobilityNeeds = null
    } = options;

    // 🌸 SEASON INTELLIGENCE: Detectar temporada y ajustar recomendaciones
    const season = this.detectSeason(tripStartDate);
    if (season) {
      console.log(`🌸 Temporada detectada: ${season.name} ${season.inPeak ? '(PEAK!)' : ''}`);
      if (season.tips) {
        console.log(`💡 Tip: ${season.tips}`);
      }
    }

    // ⚡ INTENSITY LEVELS: Determinar número de actividades
    const intensityConfig = INTENSITY_LEVELS[pace] || INTENSITY_LEVELS.moderate;
    const { min, max } = intensityConfig.activitiesPerDay;

    // 📈 PROGRESSIVE ENERGY MANAGEMENT
    const energyLevel = this.calculateEnergyLevel(dayNumber, totalDays, isArrivalDay, isDepartureDay);
    console.log(`⚡ Día ${dayNumber}: Nivel de energía ${energyLevel}%`);

    // Ajustar target activities según energía
    let targetActivities = Math.round(min + ((max - min) * (energyLevel / 100)));

    // 👥 COMPANION-AWARE: Ajustar según tipo de compañero
    if (companionType && COMPANION_TYPES[companionType]) {
      const companionConfig = COMPANION_TYPES[companionType];
      targetActivities = Math.round(targetActivities * companionConfig.paceMultiplier);
      console.log(`👥 Companion: ${companionConfig.name}, Activities ajustadas a ${targetActivities}`);
    }

    // 🛫 DÍA 1 JETLAG-FRIENDLY: Reducir drásticamente actividades y filtrar inapropiadas
    if (isArrivalDay) {
      targetActivities = Math.min(3, Math.max(2, Math.floor(targetActivities * 0.3))); // Máximo 3 actividades
      console.log(`🛫 Día 1 (JETLAG): Reducido a ${targetActivities} actividades`);
    } else if (isDepartureDay) {
      targetActivities = Math.max(2, Math.floor(targetActivities * 0.4));
    }

    // 🌐 REAL-TIME GOOGLE PLACES: Buscar actividades
    let candidateActivities = [];

    // PASO 1: Actividades de la base de datos
    const cityKey = city.toLowerCase();
    const dbActivities = ACTIVITY_DATABASE[cityKey] || [];
    candidateActivities = [...dbActivities];

    // ⚠️ ADVERTENCIA: Si la ciudad tiene pocas actividades
    if (candidateActivities.length < 20) {
      console.warn(`⚠️ ADVERTENCIA: ${city} solo tiene ${candidateActivities.length} actividades en la base de datos`);
    }

    // PASO 2: Buscar en Google Places API (si disponible)
    if (googlePlacesAPI && window.APP_CONFIG?.GOOGLE_PLACES_API_KEY) {
      try {
        const googleActivities = await this.searchGooglePlaces(city, hotel, interests, themedDay);
        console.log(`🌐 Google Places: ${googleActivities.length} actividades encontradas`);
        candidateActivities = [...candidateActivities, ...googleActivities];
      } catch (error) {
        console.warn('⚠️ Error buscando en Google Places:', error);
      }
    }

    // 🎨 THEMED DAYS: Filtrar según tema del día
    if (themedDay && THEMED_DAYS[themedDay]) {
      const theme = THEMED_DAYS[themedDay];
      candidateActivities = this.filterByTheme(candidateActivities, theme);
      console.log(`🎨 Themed Day: ${theme.name}, ${candidateActivities.length} actividades filtradas`);
    }

    // 🛫 JETLAG FILTER: Filtrar actividades inapropiadas para día 1
    if (isArrivalDay) {
      const beforeFilter = candidateActivities.length;
      candidateActivities = candidateActivities.filter(activity => {
        const name = (activity.name || '').toLowerCase();
        const category = (activity.category || '').toLowerCase();

        // ❌ Actividades PROHIBIDAS en día 1 (requieren mucha energía)
        const jetlagInappropriate = [
          'onsen', 'spa', 'hot spring', 'baño', 'termal',
          'hiking', 'mount', 'mountain', 'trek', 'hike', 'monte',
          'nightlife', 'bar', 'club', 'karaoke',
          'intensive', 'marathon', 'tour largo',
          'sumo', 'baseball', 'sporting',
          'teamlab', 'borderless', // Requiere mucha atención
          'disney', 'universal' // Parks muy intensos
        ];

        const isInappropriate = jetlagInappropriate.some(keyword =>
          name.includes(keyword) || category.includes(keyword)
        );

        if (isInappropriate) {
          console.log(`  🛫 Filtrando "${activity.name}" (inapropiado para jetlag)`);
          return false;
        }

        // ✅ Priorizar actividades ligeras y culturales para día 1
        const jetlagFriendly = [
          'temple', 'shrine', 'templo', 'santuario',
          'garden', 'park', 'jardín', 'parque',
          'shopping', 'compras', 'market', 'mercado',
          'museum', 'museo', 'gallery',
          'cultural', 'cultura'
        ];

        return true;
      });
      console.log(`🛫 Jetlag filter: ${beforeFilter} → ${candidateActivities.length} actividades`);
    }

    // 🆕 MOBILITY FILTER: Filtrar por accesibilidad
    if (mobilityNeeds) {
      const beforeFilter = candidateActivities.length;
      candidateActivities = candidateActivities.filter(activity => {
        return this.isAccessible(activity, mobilityNeeds);
      });
      console.log(`♿ Mobility filter (${mobilityNeeds}): ${beforeFilter} → ${candidateActivities.length} actividades`);
    }

    // 🆕 AGE FILTER: Filtrar por edades apropiadas
    if (travelerAges.length > 0) {
      const beforeFilter = candidateActivities.length;
      candidateActivities = candidateActivities.filter(activity => {
        return this.isAgeAppropriate(activity, travelerAges);
      });
      console.log(`🎂 Age filter (${travelerAges.join(', ')}): ${beforeFilter} → ${candidateActivities.length} actividades`);
    }

    // 🆕 DIETARY FILTER: Filtrar restaurantes por restricciones
    if (dietaryRestrictions.length > 0) {
      const beforeFilter = candidateActivities.length;
      candidateActivities = candidateActivities.filter(activity => {
        return this.matchesDietaryRestrictions(activity, dietaryRestrictions);
      });
      console.log(`🍽️ Dietary filter (${dietaryRestrictions.join(', ')}): ${beforeFilter} → ${candidateActivities.length} actividades`);
    }

    // Filtrar y puntuar actividades
    const scoredActivities = candidateActivities
      .map(activity => {
        let score = this.scoreActivity(activity, interests, dailyBudget, avoid, hotel, companionType, themedDay, 9, groupSize, travelerAges);

        // 🌸 SEASON BONUS: Bonus por actividades recomendadas en temporada
        if (season && season.recommendations) {
          const isSeasonRecommended = season.recommendations.some(rec =>
            activity.name.toLowerCase().includes(rec.toLowerCase()) ||
            activity.area?.toLowerCase().includes(rec.toLowerCase())
          );
          if (isSeasonRecommended) {
            score += season.bonus || 0;
            console.log(`🌸 Season bonus +${season.bonus} para ${activity.name}`);
          }
        }

        // 🛫 JETLAG BONUS: Dar bonus a actividades ligeras en día 1
        if (isArrivalDay) {
          const name = (activity.name || '').toLowerCase();
          const category = (activity.category || '').toLowerCase();
          const jetlagFriendlyKeywords = [
            'temple', 'shrine', 'garden', 'park', 'shopping', 'market', 'museum', 'gallery'
          ];

          const isJetlagFriendly = jetlagFriendlyKeywords.some(kw =>
            name.includes(kw) || category.includes(kw)
          );

          if (isJetlagFriendly) {
            score += 30; // Bonus significativo para actividades jetlag-friendly
            console.log(`🛫 Jetlag bonus +30 para "${activity.name}"`);
          }
          
          if (activity.interests?.includes('relax')) {
            score += 40; // Extra bonus for relaxing activities
            console.log(`🛫 Jetlag bonus +40 for relaxing activity "${activity.name}"`);
          }

          // Penalizar actividades largas (>2.5 horas)
          if (activity.duration && activity.duration > 150) {
            score -= 20;
          }
        }

        return {
          ...activity,
          score: score
        };
      })
      .filter(a => a.score > 50)
      .sort((a, b) => b.score - a.score);

    // Selección de actividades
    const selectedActivities = [];

    // 1. Must-see primero
    for (const must of mustSee || []) {
      const mustActivity = scoredActivities.find(a =>
        a.name.toLowerCase().includes(must.name.toLowerCase()) &&
        !usedActivities.has(a.name) // 🚨 Prevenir duplicados
      );
      if (mustActivity && selectedActivities.length < targetActivities) {
        selectedActivities.push(mustActivity);
        usedActivities.add(mustActivity.name); // 🚨 Marcar como usada
        console.log(`✅ Must-see agregada: "${mustActivity.name}"`);
      }
    }

    // 2. Completar con top-scored (prevenir duplicados y mejorar diversidad)
    const categoriesUsed = new Map(); // Tracking de categorías por día
    for (const activity of scoredActivities) {
      if (selectedActivities.length >= targetActivities) break;

      // 🚨 PREVENIR DUPLICADOS: No usar actividades ya usadas en días anteriores
      if (usedActivities.has(activity.name)) {
        console.log(`⏭️ Saltando "${activity.name}" (ya usada en día anterior)`);
        continue;
      }

      // No agregar si ya está en la selección del día actual
      if (selectedActivities.includes(activity)) {
        continue;
      }

      // Diversidad de categorías: Evitar más de 2 actividades de la misma categoría por día
      const categoryCount = categoriesUsed.get(activity.category) || 0;
      if (categoryCount >= 2) {
        console.log(`⏭️ Saltando "${activity.name}" (demasiadas de categoría "${activity.category}")`);
        continue;
      }

      // Agregar actividad
      selectedActivities.push(activity);
      usedActivities.add(activity.name); // 🚨 Marcar como usada globalmente
      categoriesUsed.set(activity.category, categoryCount + 1);
      console.log(`✅ Actividad ${selectedActivities.length}/${targetActivities}: "${activity.name}" (${activity.category})`);
    }

    console.log(`📊 Día ${dayNumber}: ${selectedActivities.length} actividades seleccionadas (target: ${targetActivities})`);

    // 🚨 CALIDAD: Si no llegamos al target, intentar agregar actividades SIN restricción de categoría
    if (selectedActivities.length < targetActivities - 1) {
      console.log(`⚠️ Solo ${selectedActivities.length}/${targetActivities} actividades - buscando más sin restricciones...`);
      for (const activity of scoredActivities) {
        if (selectedActivities.length >= targetActivities) break;
        if (!usedActivities.has(activity.name) && !selectedActivities.includes(activity)) {
          selectedActivities.push(activity);
          usedActivities.add(activity.name);
          console.log(`   ✅ Agregada: "${activity.name}" (completando día)`);
        }
      }
    }

    // 3. Optimizar ruta
    const dayStartTime = intensityConfig.startTime;
    const optimizedActivities = this.optimizeActivityOrder(selectedActivities, hotel, dayStartTime, city);

    // 4. Insertar comidas
    const withMeals = await this.insertMealsIntoDay(optimizedActivities, hotel, googlePlacesAPI, dailyBudget);

    // 4.5 💰 Calcular presupuesto real predictivo
    const budgetBreakdown = this.calculateDayBudget(withMeals, dailyBudget);

    // 5. Crear estructura del día con ALTERNATIVAS y PHOTO INTELLIGENCE
    const day = {
      day: dayNumber,
      date: '',
      title: isArrivalDay ? `Llegada a ${city}` :
             isFirstDayInCity ? `Primer día en ${city}` :
             isDepartureDay ? `Último día - Regreso` :
             themedDay && THEMED_DAYS[themedDay] ? THEMED_DAYS[themedDay].name :
             `Explorando ${city}`,
      city: city,
      cities: [{ cityId: city }],
      budget: dailyBudget,
      budgetBreakdown: budgetBreakdown, // 💰 NUEVO: Presupuesto detallado
      hotel: hotel,
      energyLevel: energyLevel,
      intensity: pace,
      theme: themedDay,
      season: season ? {
        name: season.name,
        icon: season.icon,
        inPeak: season.inPeak,
        tips: season.tips
      } : null,
      activities: withMeals.map((act, idx) => {
        // 📸 Detectar si es buen momento para fotografía
        const activityHour = act.time ? parseInt(act.time.split(':')[0]) : dayStartTime;
        const photoInfo = this.isPhotographyTime(activityHour, act.name);

        // 🎯 Generar alternativas inteligentes
        const alternatives = !act.isMeal ? this.generateSmartAlternatives(act, candidateActivities) : [];

        return {
          id: `act-${dayNumber}-${idx}`,
          title: act.name,
          time: act.time,
          duration: act.duration,
          category: act.category,
          desc: act.desc || act.description || '',
          cost: act.cost || 0,
          coordinates: act.lat && act.lng ? { lat: act.lat, lng: act.lng } : null,
          isMeal: act.isMeal || false,
          rating: act.rating || null,
          source: act.source || 'database',
          // 🎯 SMART ALTERNATIVES
          alternatives: alternatives.length > 0 ? alternatives.map(alt => ({
            name: alt.name,
            category: alt.category,
            cost: alt.cost,
            reason: alt.alternativeReason,
            coordinates: alt.lat && alt.lng ? { lat: alt.lat, lng: alt.lng } : null
          })) : undefined,
          // 📸 PHOTOGRAPHY INTELLIGENCE
          photographyInfo: photoInfo ? {
            type: photoInfo.type,
            name: photoInfo.name,
            description: photoInfo.description
          } : undefined
        };
      })
    };

    return day;
  },

  /**
   * 📈 Calcula nivel de energía según día del viaje
   */
  calculateEnergyLevel(dayNumber, totalDays, isArrival, isDeparture) {
    if (isArrival) return 30; // Jet lag
    if (isDeparture) return 40; // Cansado, packing

    // Curva de energía: empieza bajo, sube al pico, baja al final
    if (dayNumber === 2) return 60;
    if (dayNumber === 3 || dayNumber === 4) return 100; // PEAK!
    if (dayNumber >= totalDays - 1) return 70; // Cansancio acumulado

    return 90; // Días intermedios
  },

  /**
   * 🌐 Busca actividades en Google Places API
   */
  async searchGooglePlaces(city, hotel, interests, themedDay) {
    // Esta función buscaría en Google Places API en tiempo real
    // Por ahora, retornamos array vacío (se implementará después)
    // TODO: Implementar búsqueda real con Google Places API
    return [];
  },

  /**
   * 🎨 Filtra actividades según tema del día
   */
  filterByTheme(activities, theme) {
    return activities.filter(activity => {
      // Filtrar por categorías del tema
      if (theme.categories && !theme.categories.includes(activity.category)) {
        return false;
      }

      // Evitar categorías prohibidas
      if (theme.avoidCategories && theme.avoidCategories.includes(activity.category)) {
        return false;
      }

      // Filtrar por lugares específicos
      if (theme.specificPlaces) {
        const matchesPlace = theme.specificPlaces.some(place =>
          activity.area?.toLowerCase().includes(place.toLowerCase())
        );
        if (!matchesPlace) return false;
      }

      // Evitar lugares muy turísticos (para temas "local")
      if (theme.avoidTouristy && activity.popularity > 85) {
        return false;
      }

      // Max popularidad (para temas locales)
      if (theme.maxPopularity && activity.popularity > theme.maxPopularity) {
        return false;
      }

      return true;
    });
  },

  /**
   * 🌸 Detecta la temporada basada en las fechas del viaje
   */
  detectSeason(tripStartDate) {
    if (!tripStartDate) return null;

    const date = new Date(tripStartDate);
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Buscar temporada que coincida
    for (const [key, season] of Object.entries(SEASON_INTELLIGENCE)) {
      if (season.months.includes(month)) {
        // Verificar si está en el peak
        const peakStart = season.peakDates?.start;
        const peakEnd = season.peakDates?.end;

        let inPeak = false;
        if (peakStart && peakEnd) {
          const isAfterStart = month > peakStart.month || (month === peakStart.month && day >= peakStart.day);
          const isBeforeEnd = month < peakEnd.month || (month === peakEnd.month && day <= peakEnd.day);
          inPeak = isAfterStart && isBeforeEnd;
        }

        return {
          key: key,
          ...season,
          inPeak: inPeak
        };
      }
    }

    return null;
  },

  /**
   * 📸 Verifica si es buen momento para fotografía
   */
  isPhotographyTime(hour, activityName) {
    for (const [key, photoType] of Object.entries(PHOTOGRAPHY_SPOTS)) {
      // Check if activity is in recommended spots
      const isRecommendedSpot = photoType.spots.some(spot =>
        activityName.toLowerCase().includes(spot.toLowerCase())
      );

      if (!isRecommendedSpot) continue;

      // Check if time matches
      const isGoodTime = photoType.timeRanges.some(range =>
        hour >= range.start && hour <= range.end
      );

      if (isGoodTime) {
        return {
          type: key,
          name: photoType.name,
          description: photoType.description,
          bonus: 15 // Photography bonus
        };
      }
    }

    return null;
  },

  /**
   * 🎯 Genera alternativas inteligentes para una actividad
   */
  generateSmartAlternatives(activity, allActivities, reason = 'general') {
    const alternatives = [];

    // Filtrar actividades similares
    const similar = allActivities.filter(alt => {
      if (alt.name === activity.name) return false;

      // Similar category
      if (alt.category === activity.category) return true;

      // Similar interests
      const sharedInterests = alt.interests?.filter(i => activity.interests?.includes(i)) || [];
      if (sharedInterests.length > 0) return true;

      // Similar area
      if (alt.area === activity.area) return true;

      return false;
    });

    // Score alternatives
    const scored = similar.map(alt => ({
      ...alt,
      alternativeReason: this.getAlternativeReason(activity, alt, reason),
      score: this.scoreAlternative(activity, alt)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Top 3 alternatives

    return scored;
  },

  /**
   * Helper para scoring de alternativas
   */
  scoreAlternative(original, alternative) {
    let score = 50;

    // Same category = bonus
    if (original.category === alternative.category) score += 20;

    // Shared interests
    const sharedInterests = alternative.interests?.filter(i =>
      original.interests?.includes(i)
    ) || [];
    score += sharedInterests.length * 10;

    // Same area = bonus
    if (original.area === alternative.area) score += 15;

    // Similar cost
    const costDiff = Math.abs((original.cost || 0) - (alternative.cost || 0));
    if (costDiff < 500) score += 10;

    return score;
  },

  /**
   * Helper para razón de alternativa
   */
  getAlternativeReason(original, alternative, reason) {
    if (reason === 'weather') {
      if (alternative.category === 'museum' || alternative.category === 'shopping') {
        return '☔ Alternativa para día lluvioso';
      }
    }

    if (alternative.area === original.area) {
      return `📍 En la misma área (${alternative.area})`;
    }

    if (alternative.category === original.category) {
      return `🎯 Similar (${alternative.category})`;
    }

    return '✨ Alternativa recomendada';
  },

  /**
   * 🚇 Calcula tiempo real de tránsito (considera rush hour)
   */
  calculateRealTransitTime(origin, destination, departureHour) {
    const baseTime = this.calculateDistance(origin, destination);
    const transitMinutes = Math.round(baseTime * 10); // ~10 min per km aprox

    // Rush hour multiplier (7-9am, 5-7pm)
    let multiplier = 1.0;
    if ((departureHour >= 7 && departureHour < 9) || (departureHour >= 17 && departureHour < 19)) {
      multiplier = 1.5; // 50% más tiempo en rush hour
    }

    // Late night discount (faster transit)
    if (departureHour >= 22 || departureHour < 6) {
      multiplier = 0.8; // 20% menos tiempo de noche
    }

    const realTime = Math.round(transitMinutes * multiplier);

    return {
      minutes: realTime,
      baseMinutes: transitMinutes,
      isRushHour: multiplier > 1.0,
      warning: multiplier > 1.0 ? '⚠️ Rush hour - considera más tiempo' : null
    };
  },

  /**
   * ⛅ Obtiene recomendaciones según clima (PLACEHOLDER para API)
   */
  async getWeatherRecommendations(city, date) {
    // TODO: Integrar con OpenWeatherMap API (gratis)
    // Por ahora retornamos null (clima desconocido)
    // La API key sería: process.env.OPENWEATHER_API_KEY

    // Ejemplo de uso futuro:
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=API_KEY`);
    // const weather = await response.json();
    // return weather.main.temp > 30 ? 'hot' : weather.rain ? 'rainy' : 'sunny';

    return null;
  },

  /**
   * 📊 Sistema de aprendizaje: Carga pesos del usuario desde localStorage
   */
  loadUserLearningWeights() {
    try {
      const saved = localStorage.getItem('smartGenerator_learningWeights');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('No se pudieron cargar learning weights');
    }

    return {
      categoryPreferences: {}, // { 'museum': -5, 'food': +10, etc }
      interestWeights: {},      // { 'cultural': 1.2, 'anime': 0.8, etc }
      editCount: 0
    };
  },

  /**
   * 📊 SISTEMA DE APRENDIZAJE ML BÁSICO - Mejorado
   * Guarda edición del usuario y aprende preferencias
   */
  saveUserEdit(editType, activityData) {
    const weights = this.loadUserLearningWeights();
    weights.editCount = (weights.editCount || 0) + 1;

    if (editType === 'removed' || editType === 'skipped') {
      // Usuario eliminó/skipped esta actividad - reduce peso de su categoría
      const category = activityData.category;
      weights.categoryPreferences[category] = (weights.categoryPreferences[category] || 0) - 2;

      // Reduce peso de sus intereses
      activityData.interests?.forEach(interest => {
        weights.interestWeights[interest] = (weights.interestWeights[interest] || 1.0) - 0.1;
      });
    } else if (editType === 'added' || editType === 'completed') {
      // Usuario agregó/completó esta actividad - aumenta peso de su categoría
      const category = activityData.category;
      weights.categoryPreferences[category] = (weights.categoryPreferences[category] || 0) + 3;

      // Aumenta peso de sus intereses
      activityData.interests?.forEach(interest => {
        weights.interestWeights[interest] = (weights.interestWeights[interest] || 1.0) + 0.15;
      });
    }

    try {
      localStorage.setItem('smartGenerator_learningWeights', JSON.stringify(weights));
      console.log('📊 Learning weights actualizados:', weights);
    } catch (e) {
      console.warn('No se pudieron guardar learning weights');
    }
  },

  /**
   * 🧠 TRACKING AVANZADO - Trackea acciones del usuario
   * Llamar desde el itinerario cuando el usuario interactúa
   */
  trackUserAction(action, activityData, metadata = {}) {
    try {
      // Cargar historial
      let history = JSON.parse(localStorage.getItem('smartGenerator_userHistory') || '[]');

      // Agregar nueva acción
      const entry = {
        timestamp: new Date().toISOString(),
        action: action, // 'completed', 'skipped', 'added', 'removed', 'rated'
        activity: {
          name: activityData.name,
          category: activityData.category,
          interests: activityData.interests,
          city: activityData.city || metadata.city
        },
        metadata: metadata // { rating: 5, duration_actual: 120, etc }
      };

      history.push(entry);

      // Mantener solo últimas 100 acciones
      if (history.length > 100) {
        history = history.slice(-100);
      }

      localStorage.setItem('smartGenerator_userHistory', JSON.stringify(history));

      // Actualizar learning weights automáticamente
      this.saveUserEdit(action, activityData);

      console.log('🧠 User action tracked:', action, activityData.name);
    } catch (e) {
      console.warn('Error tracking user action:', e);
    }
  },

  /**
   * 📈 ANÁLISIS DE PREFERENCIAS - Genera insights del usuario
   */
  analyzeUserPreferences() {
    try {
      const history = JSON.parse(localStorage.getItem('smartGenerator_userHistory') || '[]');
      const weights = this.loadUserLearningWeights();

      if (history.length === 0) {
        return {
          topCategories: [],
          topInterests: [],
          suggestions: ['Aún no hay historial suficiente para generar recomendaciones']
        };
      }

      // Contar actividades completadas por categoría
      const categoryCount = {};
      const interestCount = {};

      history.filter(h => h.action === 'completed').forEach(entry => {
        const category = entry.activity.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;

        entry.activity.interests?.forEach(interest => {
          interestCount[interest] = (interestCount[interest] || 0) + 1;
        });
      });

      // Top categories e interests
      const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, count]) => ({ category: cat, count }));

      const topInterests = Object.entries(interestCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([interest, count]) => ({ interest, count }));

      // Generar sugerencias
      const suggestions = [];
      if (topCategories.length > 0) {
        suggestions.push(`Te encanta: ${topCategories.map(c => c.category).join(', ')}`);
      }
      if (topInterests.length > 0) {
        suggestions.push(`Tus intereses principales: ${topInterests.map(i => i.interest).join(', ')}`);
      }

      const analysis = {
        topCategories,
        topInterests,
        totalActions: history.length,
        completedCount: history.filter(h => h.action === 'completed').length,
        skippedCount: history.filter(h => h.action === 'skipped').length,
        suggestions,
        weights
      };

      console.log('📈 User Preferences Analysis:', analysis);
      return analysis;
    } catch (e) {
      console.warn('Error analyzing preferences:', e);
      return { topCategories: [], topInterests: [], suggestions: [] };
    }
  },

  /**
   * 📊 Aplica pesos de aprendizaje al scoring
   */
  applyLearningWeights(score, activity) {
    const weights = this.loadUserLearningWeights();

    // Ajustar por categoría
    if (weights.categoryPreferences[activity.category]) {
      score += weights.categoryPreferences[activity.category];
    }

    // Ajustar por intereses
    activity.interests?.forEach(interest => {
      if (weights.interestWeights[interest]) {
        score *= weights.interestWeights[interest];
      }
    });

    return Math.round(score);
  },

  /**
   * 💰 PRESUPUESTO PREDICTIVO REAL-TIME
   * Calcula el presupuesto detallado del día incluyendo transporte
   */
  calculateDayBudget(activities, dailyBudget) {
    let activitiesCost = 0;
    let mealsCost = 0;
    let transportCost = 0;

    // Calcular costos de actividades y comidas
    activities.forEach((act, idx) => {
      const cost = act.cost || 0;

      if (act.isMeal) {
        mealsCost += cost;
      } else {
        activitiesCost += cost;
      }

      // Estimar transporte entre actividades (excepto última)
      if (idx < activities.length - 1) {
        const nextAct = activities[idx + 1];

        // Calcular distancia si hay coordenadas
        if (act.lat && act.lng && nextAct.lat && nextAct.lng) {
          const distance = this.calculateDistance(
            { lat: act.lat, lng: act.lng },
            { lat: nextAct.lat, lng: nextAct.lng }
          );

          // Estimar costo de transporte basado en distancia
          if (distance < 0.8) {
            transportCost += 0; // Caminar
          } else if (distance < 3) {
            transportCost += 200; // Metro/tren corto
          } else if (distance < 10) {
            transportCost += 400; // Metro/tren largo
          } else if (distance < 50) {
            transportCost += 2500; // Tren regional
          } else {
            transportCost += 8000; // Shinkansen
          }
        } else {
          // Default si no hay coordenadas
          transportCost += 300;
        }
      }
    });

    const totalCost = activitiesCost + mealsCost + transportCost;
    const remaining = dailyBudget - totalCost;
    const percentage = dailyBudget > 0 ? (totalCost / dailyBudget) * 100 : 0;

    const breakdown = {
      total: Math.round(totalCost),
      activities: Math.round(activitiesCost),
      meals: Math.round(mealsCost),
      transport: Math.round(transportCost),
      dailyBudget: dailyBudget,
      remaining: Math.round(remaining),
      percentage: Math.round(percentage),
      status: percentage > 110 ? 'over_budget' :
              percentage > 90 ? 'at_limit' :
              percentage > 70 ? 'healthy' :
              'under_budget'
    };

    console.log(`💰 Presupuesto día: ¥${breakdown.total} / ¥${dailyBudget} (${breakdown.percentage}%) - ${breakdown.status}`);
    console.log(`   Actividades: ¥${breakdown.activities}, Comidas: ¥${breakdown.meals}, Transporte: ¥${breakdown.transport}`);

    return breakdown;
  },

  /**
   * 🎯 SCORING MULTI-FACTOR - Versión mejorada
   * Evalúa actividades con múltiples factores ponderados
   */
  scoreActivity(activity, interests, dailyBudget, avoid, hotel, companionType, themedDay, currentTime = 9, groupSize = 1, travelerAges = []) {
    let score = 0;
    const weights = {
      interestMatch: 0.25,      // 25% - Match con intereses
      qualityRating: 0.20,      // 20% - Quality/rating de la actividad
      proximity: 0.18,          // 18% - Cercanía al hotel
      budgetFit: 0.12,          // 12% - Fit con presupuesto
      popularity: 0.10,         // 10% - Popularidad ajustada
      openingHours: 0.10,       // 10% - Disponibilidad/horarios
      seasonality: 0.05         //  5% - Temporada/clima
    };

    // 1️⃣ INTEREST MATCH (25%)
    let interestScore = 0;
    if (activity.interests && interests && interests.length > 0) {
      const matchCount = activity.interests.filter(i => interests.includes(i)).length;
      const matchRatio = matchCount / Math.max(interests.length, activity.interests.length);
      interestScore = matchRatio * 100;
    } else if (interests.includes(activity.category)) {
      interestScore = 70; // Match parcial si solo matchea categoría
    }
    score += interestScore * weights.interestMatch;

    // 2️⃣ QUALITY RATING (20%)
    const qualityRating = activity.quality_rating || activity.rating || 3.5;
    const qualityScore = (qualityRating / 5.0) * 100; // Normalizar a 0-100
    score += qualityScore * weights.qualityRating;

    // 3️⃣ PROXIMITY TO HOTEL (18%)
    let proximityScore = 50; // Default score si no hay coordenadas
    if (hotel && hotel.lat && hotel.lng && activity.lat && activity.lng) {
      const distance = this.calculateDistance(
        { lat: hotel.lat, lng: hotel.lng },
        { lat: activity.lat, lng: activity.lng }
      );
      // Scoring basado en distancia (km)
      if (distance < 1) proximityScore = 100;
      else if (distance < 2) proximityScore = 85;
      else if (distance < 3) proximityScore = 70;
      else if (distance < 5) proximityScore = 55;
      else if (distance < 8) proximityScore = 40;
      else proximityScore = 25;
    }
    score += proximityScore * weights.proximity;

    // 4️⃣ BUDGET FIT (12%)
    const activityCost = activity.cost || 0;
    let budgetScore = 0;
    if (activityCost === 0) {
      budgetScore = 100; // Actividades gratis son ideales
    } else if (activityCost <= dailyBudget * 0.15) {
      budgetScore = 90;
    } else if (activityCost <= dailyBudget * 0.30) {
      budgetScore = 75;
    } else if (activityCost <= dailyBudget * 0.50) {
      budgetScore = 50;
    } else if (activityCost <= dailyBudget * 0.70) {
      budgetScore = 30;
    } else {
      budgetScore = 10; // Muy caro
    }
    score += budgetScore * weights.budgetFit;

    // 5️⃣ POPULARITY ADJUSTED (10%)
    const popularity = activity.popularity || 50;
    const crowdLevel = activity.crowd_level || 'medium';
    let popularityScore = popularity;

    // Ajustar por nivel de multitudes
    if (crowdLevel === 'very_high') popularityScore -= 15;
    else if (crowdLevel === 'high') popularityScore -= 5;
    else if (crowdLevel === 'low') popularityScore += 10;

    score += popularityScore * weights.popularity;

    // 6️⃣ OPENING HOURS & TIME APPROPRIATENESS (10%)
    let timeScore = this.scoreTimeAppropriatenessAdvanced(activity, currentTime);
    score += timeScore * weights.openingHours;

    // 7️⃣ SEASONALITY (5%)
    const seasonScore = 50; // Por ahora neutro, se puede mejorar
    score += seasonScore * weights.seasonality;

    // ========== BONUSES & PENALTIES ==========

    // 🎨 THEMED DAY BONUS
    if (themedDay && THEMED_DAYS[themedDay]) {
      const theme = THEMED_DAYS[themedDay];
      if (theme.interests && activity.interests) {
        const themeMatch = theme.interests.some(ti => activity.interests.includes(ti));
        if (themeMatch) score += 15;
      }
      if (theme.categories && theme.categories.includes(activity.category)) {
        score += 12;
      }
      if (theme.prioritizePopularity && popularity > 85) {
        score += 10;
      }
    }

    // 👥 COMPANION-AWARE BONUS
    if (companionType && COMPANION_TYPES[companionType]) {
      const companion = COMPANION_TYPES[companionType];
      if (companion.categories && companion.categories.includes(activity.category)) {
        score += 12;
      }
      if (companion.preferences) {
        if (companion.preferences.kidFriendly && activity.category === 'nature') score += 8;
        if (companion.preferences.romanticSpots && popularity > 80) score += 8;
        if (companion.preferences.nightlife && activity.category === 'nightlife') score += 12;
        if (companion.preferences.accessible && activity.accessibility?.reduced_mobility_friendly) score += 15;
      }
      if (companion.avoidCategories && companion.avoidCategories.includes(activity.category)) {
        score -= 25;
      }
    }

    // ❌ AVOID LIST PENALTY
    if (avoid && avoid.some(a => activity.name.toLowerCase().includes(a.toLowerCase()))) {
      return 0; // Eliminación total
    }

    // 🆕 GROUP SIZE BONUS: Restaurantes y actividades aptas para grupos
    if (groupSize > 1) {
      const isRestaurant = activity.category === 'food' || activity.category === 'market';
      const name = (activity.name || '').toLowerCase();

      if (isRestaurant) {
        // Bonus para restaurantes con capacidad para grupos
        const groupFriendlyKeywords = ['izakaya', 'yakiniku', 'shabu', 'hotpot', 'buffet', 'all you can eat', 'nabe'];
        if (groupFriendlyKeywords.some(k => name.includes(k))) {
          score += 10 + (groupSize > 4 ? 5 : 0); // Extra bonus para grupos grandes
        }
      }

      // Bonus para actividades familiares si el grupo es grande
      if (groupSize >= 3 && (name.includes('park') || name.includes('garden') || name.includes('museum'))) {
        score += 8;
      }
    }

    // 🆕 AGE-BASED ADJUSTMENTS: Ajustar según edades de los viajeros
    if (travelerAges.length > 0) {
      const hasKids = travelerAges.some(age => age < 12);
      const hasSeniors = travelerAges.some(age => age >= 65);
      const hasTeens = travelerAges.some(age => age >= 12 && age < 18);
      const name = (activity.name || '').toLowerCase();
      const category = activity.category;

      if (hasKids) {
        // Bonus para actividades kid-friendly
        const kidFriendly = ['aquarium', 'zoo', 'park', 'disney', 'ghibli', 'pokemon', 'doraemon', 'garden'];
        if (kidFriendly.some(k => name.includes(k) || category === k)) score += 15;

        // Penalty para lugares no aptos para niños
        const notKidFriendly = ['nightlife', 'bar', 'club', 'sake', 'brewery', 'adult'];
        if (notKidFriendly.some(k => name.includes(k) || category === k)) score -= 30;
      }

      if (hasSeniors) {
        // Bonus para actividades de ritmo lento
        const seniorFriendly = ['temple', 'shrine', 'garden', 'tea ceremony', 'museum', 'gallery', 'cruise'];
        if (seniorFriendly.some(k => name.includes(k))) score += 12;

        // Penalty para actividades intensas
        const tooIntense = ['hiking', 'mountain', 'trek', 'climb', 'amusement park', 'roller coaster'];
        if (tooIntense.some(k => name.includes(k))) score -= 25;
      }

      if (hasTeens) {
        // Bonus para actividades cool para teenagers
        const teenFriendly = ['anime', 'manga', 'arcade', 'technology', 'gaming', 'shibuya', 'harajuku', 'akihabara'];
        if (teenFriendly.some(k => name.includes(k))) score += 10;
      }
    }

    // 📊 LEARNING WEIGHTS
    score = this.applyLearningWeights(score, activity);

    return Math.round(Math.max(0, Math.min(100, score))); // Clamp entre 0-100
  },

  /**
   * ⏰ VERIFICACIÓN AVANZADA DE HORARIOS
   * Evalúa si la actividad está disponible y es apropiada para el horario
   */
  scoreTimeAppropriatenessAdvanced(activity, currentTimeHour) {
    let score = 50; // Default neutro

    // 1. Verificar opening_hours
    if (activity.opening_hours) {
      const { start, end } = activity.opening_hours;
      const duration = (activity.duration || 60) / 60; // Convertir a horas

      // ❌ Cerrado antes de que termine la actividad
      if (currentTimeHour < start || currentTimeHour + duration > end) {
        console.log(`⏰ "${activity.name}" cerrado/cierra a las ${end}h (actual: ${currentTimeHour}h)`);
        return 0; // No disponible
      }

      // ✅ Disponible pero evaluar timing óptimo
      const hoursFromOpening = currentTimeHour - start;
      const hoursToClosing = end - currentTimeHour;

      // Mejor: 2-3 horas después de abrir, al menos 1.5h antes de cerrar
      if (hoursFromOpening >= 2 && hoursToClosing >= 1.5) {
        score = 100; // Timing perfecto
      } else if (hoursFromOpening >= 1 && hoursToClosing >= 1) {
        score = 80; // Buen timing
      } else if (hoursToClosing < 1) {
        score = 30; // Muy apurado, va a cerrar pronto
      } else {
        score = 60; // Timing OK
      }
    }

    // 2. Time-of-day preferences (templos mejor en mañana, nightlife en noche)
    const timeOfDay = activity.timeOfDay || activity.best_time?.[0] || 'any';

    if (timeOfDay === 'any') {
      score += 0; // Neutral
    } else if (timeOfDay === 'early_morning' || timeOfDay === 'morning') {
      score += currentTimeHour >= 6 && currentTimeHour <= 11 ? 20 : -10;
    } else if (timeOfDay === 'afternoon') {
      score += currentTimeHour >= 12 && currentTimeHour <= 17 ? 20 : -10;
    } else if (timeOfDay === 'evening') {
      score += currentTimeHour >= 17 && currentTimeHour <= 21 ? 20 : -10;
    } else if (timeOfDay === 'night') {
      score += currentTimeHour >= 19 ? 20 : -10;
    }

    return Math.max(0, Math.min(100, score));
  },

  /**
   * 🗺️ Optimiza el orden de actividades usando Geographic Clustering + TSP
   * NUEVO: Agrupa por área geográfica y encuentra la ruta óptima
   */
  optimizeActivityOrder(activities, hotel, startTime, city = 'tokyo') {
    if (activities.length === 0) {
      return activities;
    }

    if (activities.length === 1) {
      const act = { ...activities[0], time: this.formatTime(startTime * 60) };
      return [act];
    }

    // PASO 1: Geographic Clustering - Agrupar actividades por área
    const clusters = this.clusterActivitiesByArea(activities, city);
    console.log(`📍 Agrupadas en ${Object.keys(clusters).length} áreas:`, Object.keys(clusters));

    // PASO 2: Ordenar clusters por proximidad al hotel (si existe)
    let orderedClusters = Object.keys(clusters);
    if (hotel && hotel.lat && hotel.lng) {
      orderedClusters = this.orderClustersByProximity(clusters, hotel);
    }

    // PASO 3: Dentro de cada cluster, optimizar ruta con TSP
    let optimizedActivities = [];
    for (const clusterName of orderedClusters) {
      const clusterActivities = clusters[clusterName];
      const optimizedCluster = this.optimizeClusterRoute(clusterActivities, hotel);
      optimizedActivities = optimizedActivities.concat(optimizedCluster);
    }

    // PASO 4: Ordenar por time-of-day preference
    optimizedActivities = this.sortByTimeOfDay(optimizedActivities, startTime);

    // PASO 5: Asignar horarios
    let currentTime = startTime * 60; // En minutos desde medianoche

    return optimizedActivities.map((act, idx) => {
      // Estimar tiempo de transporte al siguiente lugar
      let transportTime = 30; // Default: 30min
      if (idx > 0) {
        const prev = optimizedActivities[idx - 1];
        if (prev.lat && prev.lng && act.lat && act.lng) {
          const distance = this.calculateDistance(
            { lat: prev.lat, lng: prev.lng },
            { lat: act.lat, lng: act.lng }
          );
          // Misma área = 15min, diferente área = 30-60min
          transportTime = distance < 1 ? 15 : distance < 3 ? 30 : 45;
        }
      }

      const actWithTime = {
        ...act,
        time: this.formatTime(currentTime)
      };

      // Avanzar tiempo
      currentTime += act.duration + (idx < optimizedActivities.length - 1 ? transportTime : 0);

      return actWithTime;
    });
  },

  /**
   * 🌐 CLUSTERING INTELIGENTE - Agrupa actividades por área geográfica
   * Usa clusters predefinidos y keywords para agrupar mejor
   */
  clusterActivitiesByArea(activities, city = 'tokyo') {
    const clusters = {};
    const cityKey = city.toLowerCase();
    const cityClusters = GEOGRAPHIC_CLUSTERS[cityKey] || {};

    for (const activity of activities) {
      let assignedCluster = null;

      // 1. Intentar asignar usando clusters predefinidos
      if (Object.keys(cityClusters).length > 0) {
        for (const [clusterKey, clusterData] of Object.entries(cityClusters)) {
          // Match por keywords en nombre o área
          const activityText = `${activity.name} ${activity.area || ''}`.toLowerCase();
          const matchesKeyword = clusterData.keywords.some(keyword =>
            activityText.includes(keyword.toLowerCase())
          );

          // Match por estación
          const matchesStation = activity.station && clusterData.stations.some(station =>
            activity.station.toLowerCase().includes(station.toLowerCase())
          );

          // Match por coordenadas (si está cerca del centro del cluster)
          let matchesCoords = false;
          if (activity.lat && activity.lng && clusterData.center) {
            const distance = this.calculateDistance(
              { lat: activity.lat, lng: activity.lng },
              { lat: clusterData.center.lat, lng: clusterData.center.lng }
            );
            matchesCoords = distance < 2; // Dentro de 2km del centro
          }

          if (matchesKeyword || matchesStation || matchesCoords) {
            assignedCluster = clusterData.name;
            break;
          }
        }
      }

      // 2. Fallback: usar área existente o "General"
      if (!assignedCluster) {
        assignedCluster = activity.area || 'General';
      }

      // 3. Agregar al cluster
      if (!clusters[assignedCluster]) {
        clusters[assignedCluster] = [];
      }
      clusters[assignedCluster].push(activity);
    }

    // Log de clustering para debugging
    console.log(`📍 Clustered into ${Object.keys(clusters).length} areas:`,
      Object.entries(clusters).map(([name, acts]) => `${name} (${acts.length})`).join(', ')
    );

    return clusters;
  },

  /**
   * 📏 Ordena clusters por proximidad al hotel
   */
  orderClustersByProximity(clusters, hotel) {
    const clusterCenters = {};

    // Calcular centro de cada cluster
    for (const [clusterName, activities] of Object.entries(clusters)) {
      const avgLat = activities.reduce((sum, a) => sum + (a.lat || 0), 0) / activities.length;
      const avgLng = activities.reduce((sum, a) => sum + (a.lng || 0), 0) / activities.length;
      clusterCenters[clusterName] = { lat: avgLat, lng: avgLng };
    }

    // Ordenar por distancia al hotel
    return Object.keys(clusters).sort((a, b) => {
      const distA = this.calculateDistance(hotel, clusterCenters[a]);
      const distB = this.calculateDistance(hotel, clusterCenters[b]);
      return distA - distB;
    });
  },

  /**
   * 🔀 Optimiza ruta dentro de un cluster usando Nearest Neighbor TSP
   */
  optimizeClusterRoute(activities, hotel) {
    if (activities.length <= 1) return activities;

    const unvisited = [...activities];
    const route = [];

    // Punto de inicio: actividad más cercana al hotel (si existe) o primera
    let current = unvisited[0];
    if (hotel && hotel.lat && hotel.lng) {
      current = unvisited.reduce((closest, act) => {
        const distCurrent = this.calculateDistance(hotel, current);
        const distAct = this.calculateDistance(hotel, act);
        return distAct < distCurrent ? act : closest;
      }, unvisited[0]);
    }

    route.push(current);
    unvisited.splice(unvisited.indexOf(current), 1);

    // Nearest Neighbor: siempre elegir el punto más cercano
    while (unvisited.length > 0) {
      let nearest = unvisited[0];
      let minDist = this.calculateDistance(current, nearest);

      for (const candidate of unvisited) {
        const dist = this.calculateDistance(current, candidate);
        if (dist < minDist) {
          minDist = dist;
          nearest = candidate;
        }
      }

      route.push(nearest);
      current = nearest;
      unvisited.splice(unvisited.indexOf(nearest), 1);
    }

    return route;
  },

  /**
   * ⏰ Ordena actividades por time-of-day preference
   */
  sortByTimeOfDay(activities, startTime) {
    const timeSlots = {
      morning: [],    // 6-11am
      afternoon: [],  // 12-5pm
      evening: [],    // 6-9pm
      night: [],      // 9pm+
      any: []
    };

    // Clasificar por time-of-day
    for (const act of activities) {
      const timeOfDay = act.timeOfDay || 'any';
      if (timeSlots[timeOfDay]) {
        timeSlots[timeOfDay].push(act);
      } else {
        timeSlots.any.push(act);
      }
    }

    // Ensamblar en orden lógico
    const result = [];

    // Mañana (si empieza temprano)
    if (startTime <= 11) {
      result.push(...timeSlots.morning);
    }

    // Tarde
    result.push(...timeSlots.afternoon);

    // Actividades "any time" en el medio
    result.push(...timeSlots.any);

    // Noche
    result.push(...timeSlots.evening);
    result.push(...timeSlots.night);

    // Mañana (si empieza tarde, poner al final)
    if (startTime > 11) {
      result.push(...timeSlots.morning);
    }

    return result;
  },

  /**
   * Inserta comidas en el día
   */
  async insertMealsIntoDay(activities, hotel, googlePlacesAPI, dailyBudget) {
    if (activities.length === 0) return activities;

    const result = [];
    const mealBudget = dailyBudget * 0.4; // 40% del presupuesto para comidas

    // Buscar slots para breakfast, lunch, dinner
    const mealConfigs = [
      { type: 'breakfast', start: 7, end: 10, cost: mealBudget * 0.2, duration: 45 },
      { type: 'lunch', start: 12, end: 14, cost: mealBudget * 0.3, duration: 60 },
      { type: 'dinner', start: 18, end: 21, cost: mealBudget * 0.5, duration: 90 }
    ];

    let activityIndex = 0;

    for (const mealConfig of mealConfigs) {
      const mealStartMinutes = mealConfig.start * 60;
      const mealEndMinutes = mealConfig.end * 60;

      // Buscar dónde insertar la comida
      let inserted = false;

      // Verificar entre actividades
      while (activityIndex < activities.length) {
        const currentActivity = activities[activityIndex];
        const currentTime = this.parseTime(currentActivity.time);

        if (currentTime > mealEndMinutes) {
          // Ya pasó la hora de esta comida, no insertar
          break;
        }

        if (currentTime >= mealStartMinutes && currentTime <= mealEndMinutes) {
          // Insertar comida antes de esta actividad
          const mealActivity = {
            name: `${mealConfig.type.charAt(0).toUpperCase() + mealConfig.type.slice(1)} (a definir)`,
            time: this.formatTime(Math.max(mealStartMinutes, currentTime - 30)),
            duration: mealConfig.duration,
            cost: mealConfig.cost,
            category: 'meal',
            isMeal: true,
            desc: 'Comida sugerida - puedes buscar restaurantes cercanos'
          };

          result.push(mealActivity);
          inserted = true;
          break;
        }

        result.push(currentActivity);
        activityIndex++;
      }

      if (!inserted && mealConfig.type !== 'breakfast') {
        // Si no se insertó y no es desayuno, agregar al final si corresponde
        const lastActivity = result[result.length - 1];
        if (lastActivity) {
          const lastTime = this.parseTime(lastActivity.time) + lastActivity.duration;
          if (lastTime < mealEndMinutes) {
            result.push({
              name: `${mealConfig.type.charAt(0).toUpperCase() + mealConfig.type.slice(1)} (a definir)`,
              time: this.formatTime(Math.max(mealStartMinutes, lastTime + 15)),
              duration: mealConfig.duration,
              cost: mealConfig.cost,
              category: 'meal',
              isMeal: true,
              desc: 'Comida sugerida - puedes buscar restaurantes cercanos'
            });
          }
        }
      }
    }

    // Agregar actividades restantes
    while (activityIndex < activities.length) {
      result.push(activities[activityIndex]);
      activityIndex++;
    }

    return result;
  },

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  calculateDistance(coord1, coord2) {
    if (!coord1 || !coord2) return 0;
    const R = 6371; // Radio de la Tierra en km

    // Soportar tanto lng como lon (compatibilidad con ambas bases de datos)
    const lng1 = coord1.lng || coord1.lon || 0;
    const lng2 = coord2.lng || coord2.lon || 0;

    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLon = this.deg2rad(lng2 - lng1);

    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en km (fórmula de Haversine)
  },

  deg2rad(deg) {
    return deg * (Math.PI/180);
  },

  parseTime(timeStr) {
    if (!timeStr) return 540;
    const parts = String(timeStr).split(':');
    if (parts.length !== 2) return 540;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return 540;
    return hours * 60 + minutes;
  },

  formatTime(minutes) {
    if (!isFinite(minutes) || isNaN(minutes)) minutes = 540;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },

  /**
   * 🆕 ♿ ACCESSIBILITY CHECK
   * Verifica si una actividad es accesible según necesidades de movilidad
   */
  isAccessible(activity, mobilityNeeds) {
    if (!mobilityNeeds) return true; // Sin restricciones

    const name = (activity.name || '').toLowerCase();
    const category = activity.category || '';
    const area = (activity.area || '').toLowerCase();

    // Actividades que típicamente NO son accesibles
    const difficultAccess = [
      'mountain', 'mount', 'hiking', 'trek', 'climb', 'monte', 'escalada',
      'bamboo grove', 'fushimi inari', // Muchas escaleras
      'steep', 'stairs', 'escaleras'
    ];

    if (mobilityNeeds === 'wheelchair') {
      // Filtrado estricto para silla de ruedas
      if (difficultAccess.some(k => name.includes(k) || area.includes(k))) {
        console.log(`  ♿ Filtrando "${activity.name}" (no accesible para silla de ruedas)`);
        return false;
      }

      // Si la actividad específica que es accesible, permitirla
      if (activity.accessibility?.wheelchair_friendly) return true;

      // Templos y santuarios en colinas son generalmente difíciles
      if ((category === 'cultural' || category === 'temple') &&
          (name.includes('kiyomizu') || name.includes('fushimi'))) {
        return false;
      }

      // Parques modernos y museos suelen ser accesibles
      if (category === 'museum' || category === 'shopping' || category === 'park') return true;

      return true; // Default: permitir a menos que haya evidencia contraria

    } else if (mobilityNeeds === 'limited') {
      // Filtrado menos estricto para movilidad limitada
      const veryDifficult = ['mountain', 'mount', 'hiking', 'trek', 'steep climb'];
      if (veryDifficult.some(k => name.includes(k))) {
        console.log(`  ♿ Filtrando "${activity.name}" (demasiado intenso para movilidad limitada)`);
        return false;
      }
      return true;
    }

    return true;
  },

  /**
   * 🆕 🎂 AGE APPROPRIATENESS CHECK
   * Verifica si una actividad es apropiada para las edades del grupo
   */
  isAgeAppropriate(activity, travelerAges) {
    if (!travelerAges || travelerAges.length === 0) return true;

    const hasKids = travelerAges.some(age => age < 12);
    const hasToddlers = travelerAges.some(age => age < 5);
    const name = (activity.name || '').toLowerCase();
    const category = activity.category || '';

    // Filtrado estricto si hay niños pequeños
    if (hasKids) {
      // Lugares NO aptos para niños (filtrado estricto)
      const notForKids = [
        'nightclub', 'bar', 'club', 'sake brewery', 'wine', 'adult', 'red light',
        'pachinko', 'casino', 'gambling'
      ];

      if (notForKids.some(k => name.includes(k) || category.includes(k))) {
        console.log(`  🎂 Filtrando "${activity.name}" (no apto para niños)`);
        return false;
      }
    }

    // Filtrado estricto si hay bebés/toddlers
    if (hasToddlers) {
      const notForToddlers = [
        'long hike', 'intensive', 'theme park', // Los parques temáticos pueden ser demasiado largos
        'late night', 'nightlife'
      ];

      if (notForToddlers.some(k => name.includes(k))) {
        console.log(`  🎂 Filtrando "${activity.name}" (no apto para bebés/toddlers)`);
        return false;
      }

      // Actividades muy largas no son ideales con bebés
      if (activity.duration && activity.duration > 180) { // Más de 3 horas
        return false;
      }
    }

    return true;
  },

  /**
   * 🆕 🍽️ DIETARY RESTRICTIONS FILTER
   * Filtra restaurantes según restricciones alimentarias
   */
  matchesDietaryRestrictions(activity, dietaryRestrictions) {
    if (!dietaryRestrictions || dietaryRestrictions.length === 0) return true;

    // Solo aplicar a restaurantes
    const isRestaurant = activity.category === 'food' || activity.category === 'market';
    if (!isRestaurant) return true; // No filtrar actividades que no son comida

    const name = (activity.name || '').toLowerCase();
    const tags = (activity.tags || []).map(t => t.toLowerCase());
    const category = (activity.category || '').toLowerCase();

    for (const restriction of dietaryRestrictions) {
      if (restriction === 'vegetarian') {
        // Restaurantes problemáticos para vegetarianos
        const nonVegetarian = ['yakiniku', 'sushi', 'ramen', 'tonkatsu', 'yakitori', 'sukiyaki', 'wagyu', 'beef', 'pork'];
        if (nonVegetarian.some(k => name.includes(k) || tags.includes(k))) {
          console.log(`  🍽️ Filtrando "${activity.name}" (no vegetariano)`);
          return false;
        }

        // Permitir si específicamente tiene opciones vegetarianas
        if (tags.includes('vegetarian') || tags.includes('vegan') || name.includes('vegetarian')) {
          return true;
        }

      } else if (restriction === 'vegan') {
        const nonVegan = ['sushi', 'ramen', 'dairy', 'cheese', 'yogurt', 'milk', 'egg', 'meat', 'fish'];
        if (nonVegan.some(k => name.includes(k) || tags.includes(k))) {
          console.log(`  🍽️ Filtrando "${activity.name}" (no vegano)`);
          return false;
        }

        if (tags.includes('vegan') || name.includes('vegan') || name.includes('shojin')) {
          return true;
        }

      } else if (restriction === 'halal') {
        const nonHalal = ['pork', 'alcohol', 'sake', 'wine', 'beer', 'tonkatsu', 'bacon'];
        if (nonHalal.some(k => name.includes(k) || tags.includes(k))) {
          console.log(`  🍽️ Filtrando "${activity.name}" (no halal)`);
          return false;
        }

        if (tags.includes('halal') || name.includes('halal')) {
          return true;
        }

      } else if (restriction === 'gluten-free') {
        const hasGluten = ['ramen', 'udon', 'soba', 'bread', 'pasta', 'wheat'];
        if (hasGluten.some(k => name.includes(k) || tags.includes(k))) {
          console.log(`  🍽️ Filtrando "${activity.name}" (contiene gluten)`);
          return false;
        }

      } else if (restriction === 'no-seafood') {
        const seafood = ['sushi', 'sashimi', 'fish', 'seafood', 'oyster', 'crab', 'shrimp', 'octopus', 'squid'];
        if (seafood.some(k => name.includes(k) || tags.includes(k))) {
          console.log(`  🍽️ Filtrando "${activity.name}" (mariscos)`);
          return false;
        }
      }
    }

    return true;
  }
};

// Exportar globalmente
window.SmartItineraryGenerator = SmartItineraryGenerator;
window.INTENSITY_LEVELS = INTENSITY_LEVELS;
window.THEMED_DAYS = THEMED_DAYS;
window.COMPANION_TYPES = COMPANION_TYPES;
window.SEASON_INTELLIGENCE = SEASON_INTELLIGENCE;
window.PHOTOGRAPHY_SPOTS = PHOTOGRAPHY_SPOTS;
window.WEATHER_CATEGORIES = WEATHER_CATEGORIES;

console.log('✅ Smart Itinerary Generator cargado con TODAS las features avanzadas');
console.log('⚡ Intensity Levels:', Object.keys(INTENSITY_LEVELS));
console.log('🎨 Themed Days:', Object.keys(THEMED_DAYS));
console.log('👥 Companion Types:', Object.keys(COMPANION_TYPES));
console.log('🌸 Season Intelligence:', Object.keys(SEASON_INTELLIGENCE));
console.log('📸 Photography Spots:', Object.keys(PHOTOGRAPHY_SPOTS));
console.log('⛅ Weather Categories:', Object.keys(WEATHER_CATEGORIES));

export default SmartItineraryGenerator;