// data/activities-database.js

export const activities = {
  tokyo: [
    {
      id: 'TKY001',
      name: 'Templo Senso-ji',
      area: 'Asakusa',
      categories: ['culture', 'history', 'photography'],
      quality_rating: 4.8,
      cost: 0, // en JPY
      duration: 90, // en minutos
      opening_hours: { start: 6, end: 17 },
      crowd_level: 'high',
      energy_cost: 4, // Nivel de energía: Bajo-Medio
      jetlag_friendly: true, // Bueno para el primer día
      best_time: ['early_morning', 'late_afternoon'],
      coordinates: { lat: 35.7147, lng: 139.7967 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['temple', 'iconic', 'must_see'],
      interest_vectors: { // Qué tan relevante es para cada interés (0 a 1)
        culture: 0.9,
        history: 0.8,
        photography: 0.7,
        pop_culture: 0.1,
        gastronomy: 0.2,
        nature: 0.1
      },
    },
    {
      id: 'TKY002',
      name: 'Cruce de Shibuya',
      area: 'Shibuya',
      categories: ['photography', 'nightlife'],
      quality_rating: 4.7,
      cost: 0,
      duration: 60,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'very_high',
      energy_cost: 2,
      jetlag_friendly: true,
      best_time: ['evening'],
      coordinates: { lat: 35.6595, lng: 139.7005 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['modern', 'busy', 'iconic'],
      interest_vectors: {
        photography: 1.0,
        nightlife: 0.8,
        pop_culture: 0.9,
        modern: 1.0
      }
    },
    {
      id: 'TKY003',
      name: 'Tokyo Skytree',
      area: 'Sumida',
      categories: ['photography', 'modern'],
      quality_rating: 4.6,
      cost: 3100,
      duration: 120,
      opening_hours: { start: 10, end: 21 },
      crowd_level: 'high',
      energy_cost: 3,
      jetlag_friendly: true,
      best_time: ['evening'],
      coordinates: { lat: 35.7101, lng: 139.8107 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['observation_deck', 'city_view'],
      interest_vectors: {
        photography: 0.9,
        modern: 0.8,
        romance: 0.7
      }
    },
    {
      id: 'TKY004',
      name: 'Ghibli Museum',
      area: 'Mitaka',
      categories: ['pop_culture', 'art'],
      quality_rating: 4.9,
      cost: 1000,
      duration: 180,
      opening_hours: { start: 10, end: 18 },
      crowd_level: 'medium',
      energy_cost: 5, // Nivel de energía: Medio
      jetlag_friendly: false, // Requiere más atención y energía
      best_time: ['any'],
      coordinates: { lat: 35.7060, lng: 139.5701 },
      accessibility: { reduced_mobility_friendly: false },
      tags: ['anime', 'family_friendly', 'requires_booking'],
      booking_details: { // Información estructurada para reservas
        required: true,
        rule: '10th_of_previous_month', // Regla para la alerta
        url: 'https://l-tike.com/ghibli/',
        sellout_speed: 'extremely_fast'
      },
      interest_vectors: { culture: 0.4, art: 0.9, pop_culture: 1.0, anime: 1.0 },
    },
    {
      id: 'TKY005',
      name: 'Akihabara Electric Town',
      area: 'Akihabara',
      categories: ['pop_culture', 'shopping', 'nightlife'],
      quality_rating: 4.5,
      cost: 0,
      duration: 180,
      opening_hours: { start: 11, end: 22 },
      crowd_level: 'high',
      energy_cost: 7, // Caminar mucho, estimulante
      jetlag_friendly: false,
      best_time: ['afternoon', 'evening'],
      coordinates: { lat: 35.7022, lng: 139.7741 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['anime', 'gaming', 'electronics'],
      interest_vectors: { pop_culture: 1.0, anime: 0.9, gaming: 1.0, shopping: 0.8 },
    }
  ],
  kyoto: [
    {
      id: 'KYO001',
      name: 'Fushimi Inari-taisha',
      area: 'Fushimi',
      categories: ['culture', 'nature', 'photography', 'adventure'],
      quality_rating: 4.9,
      cost: 0,
      duration: 180,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'very_high',
      best_time: ['very_early_morning', 'evening'], // Mejor muy temprano o de noche
      coordinates: { lat: 34.9671, lng: 135.7726 },
      accessibility: { reduced_mobility_friendly: false },
      tags: ['shrine', 'torii_gates', 'hiking', 'iconic']
    },
    {
      id: 'KYO002',
      name: 'Bosque de Bambú de Arashiyama',
      area: 'Arashiyama',
      categories: ['nature', 'photography', 'wellness'],
      quality_rating: 4.6,
      cost: 0,
      duration: 90,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'very_high',
      best_time: ['early_morning'], // Esencial ir temprano
      coordinates: { lat: 35.0170, lng: 135.6730 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['nature', 'iconic', 'beautiful']
    },
    {
      id: 'KYO003',
      name: 'Kinkaku-ji (Pabellón Dorado)',
      area: 'Kita',
      categories: ['culture', 'history', 'photography'],
      quality_rating: 4.7,
      cost: 400,
      duration: 60,
      opening_hours: { start: 9, end: 17 },
      crowd_level: 'high',
      best_time: ['afternoon'], // Brilla más con el sol de la tarde
      coordinates: { lat: 35.0394, lng: 135.7292 },
      accessibility: { reduced_mobility_friendly: false },
      tags: ['temple', 'zen', 'gold']
    },
    {
      id: 'KYO004',
      name: 'Mercado Nishiki',
      area: 'Nakagyo',
      categories: ['gastronomy', 'shopping'],
      quality_rating: 4.5,
      cost: 0,
      duration: 120,
      opening_hours: { start: 10, end: 18 },
      crowd_level: 'high',
      best_time: ['late_morning', 'lunchtime'], // Mejor antes de que se llene para el almuerzo
      coordinates: { lat: 35.0049, lng: 135.7656 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['market', 'street_food', 'local']
    }
  ],
  osaka: [
    {
      id: 'OSA001',
      name: 'Dotonbori',
      area: 'Namba',
      categories: ['gastronomy', 'nightlife', 'photography'],
      quality_rating: 4.8,
      cost: 0,
      duration: 150,
      opening_hours: { start: 17, end: 24 },
      crowd_level: 'very_high',
      best_time: ['evening'], // Las luces de neón son la atracción principal
      coordinates: { lat: 34.6687, lng: 135.5013 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['iconic', 'foodie', 'neon_lights']
    },
    {
      id: 'OSA002',
      name: 'Castillo de Osaka',
      area: 'Chuo',
      categories: ['history', 'culture', 'photography'],
      quality_rating: 4.5,
      cost: 600,
      duration: 120,
      opening_hours: { start: 9, end: 17 },
      crowd_level: 'high',
      best_time: ['morning'], // Menos multitudes por la mañana
      coordinates: { lat: 34.6873, lng: 135.5262 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['castle', 'museum', 'park']
    },
    {
      id: 'OSA003',
      name: 'Universal Studios Japan (USJ)',
      area: 'Bay Area',
      categories: ['pop_culture', 'adventure'],
      quality_rating: 4.7,
      cost: 8600,
      duration: 480,
      opening_hours: { start: 9, end: 21 },
      crowd_level: 'very_high',
      best_time: ['full_day'], // Requiere un día completo
      coordinates: { lat: 34.6656, lng: 135.4325 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['theme_park', 'family_friendly']
    }
  ]
};

// Export alias para compatibilidad con código existente
export const ACTIVITIES_DATABASE = activities;

/**
 * Obtiene actividades filtradas por categoría
 * @param {string} category - Categoría a filtrar
 * @param {string} city - Ciudad (opcional)
 * @returns {Array} Actividades que coinciden con la categoría
 */
export function getActivitiesByCategory(category, city = null) {
  let results = [];

  const citiesToSearch = city ? [city] : Object.keys(activities);

  for (const cityKey of citiesToSearch) {
    if (activities[cityKey]) {
      const cityActivities = activities[cityKey].filter(activity => {
        if (Array.isArray(activity.categories)) {
          return activity.categories.includes(category);
        }
        return activity.category === category;
      });
      results = results.concat(cityActivities);
    }
  }

  return results;
}

/**
 * Obtiene todas las actividades de una ciudad
 * @param {string} city - Nombre de la ciudad
 * @returns {Array} Todas las actividades de la ciudad
 */
export function getActivitiesByCity(city) {
  const cityKey = city.toLowerCase();
  return activities[cityKey] || [];
}

/**
 * Busca actividades por texto en nombre, área o tags
 * @param {string} query - Texto a buscar
 * @param {string} city - Ciudad (opcional)
 * @returns {Array} Actividades que coinciden con la búsqueda
 */
export function searchActivities(query, city = null) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  let results = [];

  const citiesToSearch = city ? [city] : Object.keys(activities);

  for (const cityKey of citiesToSearch) {
    if (activities[cityKey]) {
      const cityActivities = activities[cityKey].filter(activity => {
        // Buscar en nombre
        if (activity.name && activity.name.toLowerCase().includes(searchTerm)) {
          return true;
        }
        // Buscar en área
        if (activity.area && activity.area.toLowerCase().includes(searchTerm)) {
          return true;
        }
        // Buscar en tags
        if (activity.tags && Array.isArray(activity.tags)) {
          return activity.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        }
        return false;
      });
      results = results.concat(cityActivities);
    }
  }

  return results;
}
