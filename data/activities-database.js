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
    },
    {
      id: 'TKY006',
      name: 'Santuario Meiji',
      area: 'Harajuku',
      categories: ['culture', 'nature', 'history'],
      quality_rating: 4.7,
      cost: 0,
      duration: 90,
      opening_hours: { start: 6, end: 18 },
      crowd_level: 'medium',
      energy_cost: 3,
      jetlag_friendly: true,
      best_time: ['early_morning'],
      coordinates: { lat: 35.6764, lng: 139.6993 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['shrine', 'peaceful', 'forest', 'must_see'],
      interest_vectors: { culture: 0.9, nature: 0.7, history: 0.6, spirituality: 0.9 }
    },
    {
      id: 'TKY007',
      name: 'Takeshita Street (Harajuku)',
      area: 'Harajuku',
      categories: ['shopping', 'pop_culture', 'gastronomy'],
      quality_rating: 4.4,
      cost: 0,
      duration: 120,
      opening_hours: { start: 11, end: 20 },
      crowd_level: 'very_high',
      energy_cost: 6,
      jetlag_friendly: false,
      best_time: ['afternoon'],
      coordinates: { lat: 35.6703, lng: 139.7027 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['fashion', 'youth_culture', 'crepes', 'kawaii'],
      interest_vectors: { pop_culture: 0.9, shopping: 0.8, fashion: 1.0, gastronomy: 0.5 }
    },
    {
      id: 'TKY008',
      name: 'Parque Ueno',
      area: 'Ueno',
      categories: ['nature', 'culture', 'family'],
      quality_rating: 4.6,
      cost: 0,
      duration: 180,
      opening_hours: { start: 5, end: 23 },
      crowd_level: 'high',
      energy_cost: 5,
      jetlag_friendly: true,
      best_time: ['morning', 'afternoon'],
      coordinates: { lat: 35.7148, lng: 139.7742 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['park', 'museums', 'zoo', 'cherry_blossoms'],
      interest_vectors: { nature: 0.8, culture: 0.7, family: 0.9, art: 0.6 }
    },
    {
      id: 'TKY009',
      name: 'teamLab Borderless',
      area: 'Odaiba',
      categories: ['art', 'modern', 'photography'],
      quality_rating: 4.9,
      cost: 3800,
      duration: 180,
      opening_hours: { start: 10, end: 21 },
      crowd_level: 'very_high',
      energy_cost: 6,
      jetlag_friendly: false,
      best_time: ['evening'],
      coordinates: { lat: 35.6249, lng: 139.7750 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['digital_art', 'interactive', 'instagram', 'immersive', 'requires_booking'],
      booking_details: { required: true, sellout_speed: 'fast', url: 'https://www.teamlab.art/e/borderless/' },
      interest_vectors: { art: 1.0, modern: 1.0, photography: 0.9, technology: 0.8 }
    },
    {
      id: 'TKY010',
      name: 'Mercado Tsukiji Outer Market',
      area: 'Tsukiji',
      categories: ['gastronomy', 'culture'],
      quality_rating: 4.7,
      cost: 2000,
      duration: 150,
      opening_hours: { start: 5, end: 14 },
      crowd_level: 'very_high',
      energy_cost: 5,
      jetlag_friendly: true,
      best_time: ['early_morning'],
      coordinates: { lat: 35.6654, lng: 139.7707 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['seafood', 'sushi', 'market', 'breakfast', 'authentic'],
      interest_vectors: { gastronomy: 1.0, culture: 0.7, seafood: 1.0, local: 0.9 }
    },
    {
      id: 'TKY011',
      name: 'Barrio de Shimokitazawa',
      area: 'Shimokitazawa',
      categories: ['culture', 'shopping', 'nightlife'],
      quality_rating: 4.5,
      cost: 0,
      duration: 180,
      opening_hours: { start: 11, end: 23 },
      crowd_level: 'medium',
      energy_cost: 5,
      jetlag_friendly: false,
      best_time: ['afternoon', 'evening'],
      coordinates: { lat: 35.6617, lng: 139.6681 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['vintage', 'cafes', 'theater', 'hipster', 'local'],
      interest_vectors: { culture: 0.8, shopping: 0.7, nightlife: 0.6, hipster: 1.0 }
    },
    {
      id: 'TKY012',
      name: 'Tokyo Tower',
      area: 'Minato',
      categories: ['photography', 'modern'],
      quality_rating: 4.4,
      cost: 1200,
      duration: 120,
      opening_hours: { start: 9, end: 23 },
      crowd_level: 'high',
      energy_cost: 3,
      jetlag_friendly: true,
      best_time: ['evening', 'night'],
      coordinates: { lat: 35.6586, lng: 139.7454 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['tower', 'observation', 'iconic', 'night_view'],
      interest_vectors: { photography: 0.8, modern: 0.6, romance: 0.7 }
    },
    {
      id: 'TKY013',
      name: 'Palacio Imperial',
      area: 'Chiyoda',
      categories: ['history', 'culture', 'nature'],
      quality_rating: 4.5,
      cost: 0,
      duration: 120,
      opening_hours: { start: 9, end: 16 },
      crowd_level: 'medium',
      energy_cost: 4,
      jetlag_friendly: true,
      best_time: ['morning'],
      coordinates: { lat: 35.6852, lng: 139.7528 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['imperial', 'gardens', 'historic', 'peaceful'],
      interest_vectors: { history: 0.9, culture: 0.8, nature: 0.6 }
    },
    {
      id: 'TKY014',
      name: 'Roppongi Hills',
      area: 'Roppongi',
      categories: ['modern', 'art', 'shopping', 'nightlife'],
      quality_rating: 4.5,
      cost: 0,
      duration: 180,
      opening_hours: { start: 10, end: 23 },
      crowd_level: 'high',
      energy_cost: 5,
      jetlag_friendly: false,
      best_time: ['afternoon', 'evening'],
      coordinates: { lat: 35.6606, lng: 139.7298 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['luxury', 'museums', 'observation', 'international'],
      interest_vectors: { modern: 0.9, art: 0.8, shopping: 0.7, nightlife: 0.8 }
    },
    {
      id: 'TKY015',
      name: 'Odaiba',
      area: 'Odaiba',
      categories: ['modern', 'family', 'shopping'],
      quality_rating: 4.4,
      cost: 0,
      duration: 240,
      opening_hours: { start: 10, end: 22 },
      crowd_level: 'high',
      energy_cost: 7,
      jetlag_friendly: false,
      best_time: ['afternoon', 'evening'],
      coordinates: { lat: 35.6249, lng: 139.7750 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['waterfront', 'gundam', 'malls', 'entertainment'],
      interest_vectors: { modern: 0.9, family: 0.8, shopping: 0.7, entertainment: 0.8 }
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
    },
    {
      id: 'KYO005',
      name: 'Gion (Distrito de Geishas)',
      area: 'Gion',
      categories: ['culture', 'photography', 'history'],
      quality_rating: 4.8,
      cost: 0,
      duration: 120,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'very_high',
      best_time: ['early_evening'],
      coordinates: { lat: 35.0037, lng: 135.7751 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['geisha', 'traditional', 'tea_houses', 'historic', 'must_see'],
      interest_vectors: { culture: 1.0, photography: 0.9, history: 0.8, traditional: 1.0 }
    },
    {
      id: 'KYO006',
      name: 'Templo Kiyomizu-dera',
      area: 'Higashiyama',
      categories: ['culture', 'history', 'photography'],
      quality_rating: 4.8,
      cost: 400,
      duration: 120,
      opening_hours: { start: 6, end: 18 },
      crowd_level: 'very_high',
      best_time: ['early_morning'],
      coordinates: { lat: 34.9949, lng: 135.7850 },
      accessibility: { reduced_mobility_friendly: false },
      tags: ['temple', 'unesco', 'viewpoint', 'historic', 'must_see'],
      interest_vectors: { culture: 0.9, history: 0.9, photography: 0.8 }
    },
    {
      id: 'KYO007',
      name: 'Templo Ryoan-ji (Jardín Zen)',
      area: 'Ukyo',
      categories: ['culture', 'nature', 'wellness'],
      quality_rating: 4.6,
      cost: 500,
      duration: 90,
      opening_hours: { start: 8, end: 17 },
      crowd_level: 'medium',
      best_time: ['morning'],
      coordinates: { lat: 35.0345, lng: 135.7183 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['zen', 'garden', 'unesco', 'meditation', 'peaceful'],
      interest_vectors: { culture: 0.8, wellness: 0.9, nature: 0.7, spirituality: 0.9 }
    },
    {
      id: 'KYO008',
      name: 'Camino del Filósofo',
      area: 'Sakyo',
      categories: ['nature', 'culture', 'photography'],
      quality_rating: 4.5,
      cost: 0,
      duration: 90,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'medium',
      best_time: ['morning', 'afternoon'],
      coordinates: { lat: 35.0258, lng: 135.7954 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['walk', 'cherry_blossoms', 'canal', 'scenic', 'peaceful'],
      interest_vectors: { nature: 0.8, culture: 0.6, photography: 0.7 }
    },
    {
      id: 'KYO009',
      name: 'Pontocho Alley',
      area: 'Pontocho',
      categories: ['gastronomy', 'culture', 'nightlife'],
      quality_rating: 4.6,
      cost: 3000,
      duration: 150,
      opening_hours: { start: 17, end: 23 },
      crowd_level: 'high',
      best_time: ['evening'],
      coordinates: { lat: 35.0040, lng: 135.7710 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['restaurants', 'traditional', 'alley', 'atmospheric'],
      interest_vectors: { gastronomy: 0.9, culture: 0.8, nightlife: 0.6 }
    },
    {
      id: 'KYO010',
      name: 'Santuario Heian',
      area: 'Sakyo',
      categories: ['culture', 'history', 'photography'],
      quality_rating: 4.5,
      cost: 600,
      duration: 90,
      opening_hours: { start: 6, end: 18 },
      crowd_level: 'medium',
      best_time: ['afternoon'],
      coordinates: { lat: 35.0161, lng: 135.7829 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['shrine', 'gardens', 'torii_gate', 'vermillion'],
      interest_vectors: { culture: 0.8, history: 0.7, photography: 0.8 }
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
    },
    {
      id: 'OSA004',
      name: 'Kuromon Ichiba Market',
      area: 'Nipponbashi',
      categories: ['gastronomy', 'culture'],
      quality_rating: 4.6,
      cost: 1500,
      duration: 120,
      opening_hours: { start: 9, end: 18 },
      crowd_level: 'high',
      best_time: ['morning', 'lunch'],
      coordinates: { lat: 34.6660, lng: 135.5058 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['market', 'seafood', 'street_food', 'local', 'authentic'],
      interest_vectors: { gastronomy: 1.0, culture: 0.7, seafood: 0.9 }
    },
    {
      id: 'OSA005',
      name: 'Shinsekai & Tsutenkaku Tower',
      area: 'Naniwa',
      categories: ['culture', 'photography', 'gastronomy'],
      quality_rating: 4.4,
      cost: 800,
      duration: 180,
      opening_hours: { start: 10, end: 21 },
      crowd_level: 'medium',
      best_time: ['afternoon', 'evening'],
      coordinates: { lat: 34.6524, lng: 135.5063 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['retro', 'kushikatsu', 'tower', 'old_osaka'],
      interest_vectors: { culture: 0.8, gastronomy: 0.8, photography: 0.7, retro: 1.0 }
    },
    {
      id: 'OSA006',
      name: 'Umeda Sky Building',
      area: 'Umeda',
      categories: ['modern', 'photography'],
      quality_rating: 4.6,
      cost: 1500,
      duration: 90,
      opening_hours: { start: 10, end: 22 },
      crowd_level: 'medium',
      best_time: ['sunset', 'evening'],
      coordinates: { lat: 34.7053, lng: 135.4904 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['observation', 'architecture', 'modern', 'skyline'],
      interest_vectors: { modern: 0.9, photography: 0.9, architecture: 0.8 }
    },
    {
      id: 'OSA007',
      name: 'Sumiyoshi Taisha',
      area: 'Sumiyoshi',
      categories: ['culture', 'history'],
      quality_rating: 4.5,
      cost: 0,
      duration: 90,
      opening_hours: { start: 6, end: 17 },
      crowd_level: 'low',
      best_time: ['morning'],
      coordinates: { lat: 34.6105, lng: 135.4928 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['shrine', 'ancient', 'unique', 'peaceful'],
      interest_vectors: { culture: 0.9, history: 0.8, spirituality: 0.7 }
    },
    {
      id: 'OSA008',
      name: 'America-Mura (American Village)',
      area: 'Shinsaibashi',
      categories: ['shopping', 'culture', 'youth'],
      quality_rating: 4.3,
      cost: 0,
      duration: 120,
      opening_hours: { start: 11, end: 22 },
      crowd_level: 'high',
      best_time: ['afternoon'],
      coordinates: { lat: 34.6736, lng: 135.4983 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['fashion', 'street_art', 'cafes', 'young'],
      interest_vectors: { shopping: 0.8, culture: 0.6, youth: 1.0, fashion: 0.7 }
    },
    {
      id: 'OSA009',
      name: 'Acuario Kaiyukan',
      area: 'Bay Area',
      categories: ['family', 'nature'],
      quality_rating: 4.7,
      cost: 2700,
      duration: 180,
      opening_hours: { start: 10, end: 20 },
      crowd_level: 'high',
      best_time: ['morning', 'afternoon'],
      coordinates: { lat: 34.6547, lng: 135.4290 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['aquarium', 'whale_shark', 'family_friendly', 'educational'],
      interest_vectors: { family: 0.9, nature: 0.8, educational: 0.7 }
    }
  ],
  hiroshima: [
    {
      id: 'HIR001',
      name: 'Parque Memorial de la Paz',
      area: 'Centro',
      categories: ['history', 'culture'],
      quality_rating: 4.9,
      cost: 0,
      duration: 120,
      opening_hours: { start: 8, end: 18 },
      crowd_level: 'medium',
      best_time: ['morning'],
      coordinates: { lat: 34.3955, lng: 132.4536 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['memorial', 'unesco', 'must_see', 'moving']
    },
    {
      id: 'HIR002',
      name: 'Isla de Miyajima',
      area: 'Miyajima',
      categories: ['nature', 'culture', 'photography'],
      quality_rating: 5.0,
      cost: 360,
      duration: 300,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'high',
      best_time: ['full_day'],
      coordinates: { lat: 34.2958, lng: 132.3197 },
      accessibility: { reduced_mobility_friendly: false },
      tags: ['island', 'torii_gate', 'shrine', 'deer', 'iconic', 'unesco']
    }
  ],
  nara: [
    {
      id: 'NAR001',
      name: 'Parque de Nara',
      area: 'Centro',
      categories: ['nature', 'culture', 'photography'],
      quality_rating: 4.8,
      cost: 0,
      duration: 180,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'high',
      best_time: ['morning', 'afternoon'],
      coordinates: { lat: 34.6851, lng: 135.8431 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['park', 'deer', 'nature', 'family_friendly']
    },
    {
      id: 'NAR002',
      name: 'Todai-ji (Gran Buda)',
      area: 'Centro',
      categories: ['culture', 'history', 'photography'],
      quality_rating: 4.9,
      cost: 600,
      duration: 120,
      opening_hours: { start: 8, end: 17 },
      crowd_level: 'very_high',
      best_time: ['early_morning'],
      coordinates: { lat: 34.6889, lng: 135.8398 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['temple', 'buddha', 'unesco', 'iconic', 'must_see']
    }
  ],
  hakone: [
    {
      id: 'HAK001',
      name: 'Crucero por el Lago Ashi',
      area: 'Lago Ashi',
      categories: ['nature', 'photography'],
      quality_rating: 4.7,
      cost: 1200,
      duration: 90,
      opening_hours: { start: 9, end: 17 },
      crowd_level: 'medium',
      best_time: ['morning'],
      coordinates: { lat: 35.2043, lng: 139.0261 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['cruise', 'lake', 'mt_fuji_view', 'scenic']
    },
    {
      id: 'HAK002',
      name: 'Owakudani (Valle Volcánico)',
      area: 'Owakudani',
      categories: ['nature', 'adventure'],
      quality_rating: 4.6,
      cost: 0,
      duration: 120,
      opening_hours: { start: 9, end: 17 },
      crowd_level: 'high',
      best_time: ['afternoon'],
      coordinates: { lat: 35.2432, lng: 139.0197 },
      accessibility: { reduced_mobility_friendly: false },
      tags: ['volcano', 'onsen', 'black_eggs', 'nature']
    }
  ],
  kamakura: [
    {
      id: 'KAM001',
      name: 'Gran Buda de Kamakura',
      area: 'Kotoku-in',
      categories: ['culture', 'history', 'photography'],
      quality_rating: 4.8,
      cost: 300,
      duration: 60,
      opening_hours: { start: 8, end: 17 },
      crowd_level: 'high',
      best_time: ['morning'],
      coordinates: { lat: 35.3167, lng: 139.5361 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['buddha', 'statue', 'temple', 'iconic']
    },
    {
      id: 'KAM002',
      name: 'Playa Yuigahama',
      area: 'Costa',
      categories: ['nature', 'wellness'],
      quality_rating: 4.3,
      cost: 0,
      duration: 120,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'medium',
      best_time: ['afternoon'],
      coordinates: { lat: 35.3086, lng: 139.5464 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['beach', 'relaxing', 'summer']
    }
  ],
  yokohama: [
    {
      id: 'YOK001',
      name: 'Chinatown de Yokohama',
      area: 'Chinatown',
      categories: ['gastronomy', 'shopping'],
      quality_rating: 4.5,
      cost: 0,
      duration: 180,
      opening_hours: { start: 10, end: 22 },
      crowd_level: 'very_high',
      best_time: ['lunch', 'evening'],
      coordinates: { lat: 35.4437, lng: 139.6455 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['food', 'chinese', 'shopping', 'vibrant']
    },
    {
      id: 'YOK002',
      name: 'Minato Mirai 21',
      area: 'Puerto',
      categories: ['modern', 'photography', 'shopping'],
      quality_rating: 4.6,
      cost: 0,
      duration: 240,
      opening_hours: { start: 10, end: 22 },
      crowd_level: 'high',
      best_time: ['evening'],
      coordinates: { lat: 35.4563, lng: 139.6380 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['waterfront', 'modern', 'shopping', 'ferris_wheel']
    }
  ],
  sapporo: [
    {
      id: 'SAP001',
      name: 'Parque Odori',
      area: 'Centro',
      categories: ['nature', 'events'],
      quality_rating: 4.5,
      cost: 0,
      duration: 90,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'medium',
      best_time: ['afternoon'],
      coordinates: { lat: 43.0596, lng: 141.3548 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['park', 'events', 'snow_festival', 'relaxing']
    },
    {
      id: 'SAP002',
      name: 'Museo de la Cerveza Sapporo',
      area: 'Higashi',
      categories: ['culture', 'gastronomy'],
      quality_rating: 4.4,
      cost: 0,
      duration: 120,
      opening_hours: { start: 11, end: 20 },
      crowd_level: 'medium',
      best_time: ['afternoon'],
      coordinates: { lat: 43.0781, lng: 141.3689 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['beer', 'brewery', 'tasting', 'museum']
    }
  ],
  nagoya: [
    {
      id: 'NAG001',
      name: 'Castillo de Nagoya',
      area: 'Centro',
      categories: ['history', 'culture', 'photography'],
      quality_rating: 4.5,
      cost: 500,
      duration: 120,
      opening_hours: { start: 9, end: 16 },
      crowd_level: 'medium',
      best_time: ['morning'],
      coordinates: { lat: 35.1852, lng: 136.8992 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['castle', 'history', 'museum']
    },
    {
      id: 'NAG002',
      name: 'Atsuta Jingu',
      area: 'Atsuta',
      categories: ['culture', 'history'],
      quality_rating: 4.6,
      cost: 0,
      duration: 90,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'low',
      best_time: ['morning'],
      coordinates: { lat: 35.1279, lng: 136.9079 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['shrine', 'sacred', 'peaceful']
    }
  ],
  kobe: [
    {
      id: 'KOB001',
      name: 'Chinatown de Kobe (Nankinmachi)',
      area: 'Centro',
      categories: ['gastronomy', 'culture'],
      quality_rating: 4.4,
      cost: 0,
      duration: 120,
      opening_hours: { start: 10, end: 20 },
      crowd_level: 'high',
      best_time: ['lunch', 'evening'],
      coordinates: { lat: 34.6886, lng: 135.1899 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['food', 'chinese', 'vibrant']
    },
    {
      id: 'KOB002',
      name: 'Restaurante de Carne de Kobe',
      area: 'Sannomiya',
      categories: ['gastronomy'],
      quality_rating: 4.9,
      cost: 8000,
      duration: 120,
      opening_hours: { start: 11, end: 22 },
      crowd_level: 'medium',
      best_time: ['dinner'],
      coordinates: { lat: 34.6901, lng: 135.1955 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['wagyu', 'beef', 'luxury', 'must_try']
    }
  ],
  nikko: [
    {
      id: 'NIK001',
      name: 'Toshogu Shrine',
      area: 'Centro',
      categories: ['culture', 'history', 'photography'],
      quality_rating: 4.8,
      cost: 1300,
      duration: 150,
      opening_hours: { start: 8, end: 17 },
      crowd_level: 'high',
      best_time: ['morning'],
      coordinates: { lat: 36.7580, lng: 139.5988 },
      accessibility: { reduced_mobility_friendly: false },
      tags: ['shrine', 'unesco', 'ornate', 'historic']
    },
    {
      id: 'NIK002',
      name: 'Lago Chuzenji',
      area: 'Montaña',
      categories: ['nature', 'photography'],
      quality_rating: 4.6,
      cost: 0,
      duration: 180,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'low',
      best_time: ['afternoon'],
      coordinates: { lat: 36.7273, lng: 139.4759 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['lake', 'nature', 'scenic', 'peaceful']
    }
  ],
  takayama: [
    {
      id: 'TAK001',
      name: 'Casco Antiguo de Takayama',
      area: 'Sanmachi',
      categories: ['culture', 'history', 'shopping'],
      quality_rating: 4.7,
      cost: 0,
      duration: 180,
      opening_hours: { start: 9, end: 18 },
      crowd_level: 'medium',
      best_time: ['afternoon'],
      coordinates: { lat: 36.1467, lng: 137.2528 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['historic', 'traditional', 'shops', 'sake']
    },
    {
      id: 'TAK002',
      name: 'Mercado Matinal de Takayama',
      area: 'Río Miyagawa',
      categories: ['gastronomy', 'culture'],
      quality_rating: 4.5,
      cost: 0,
      duration: 90,
      opening_hours: { start: 7, end: 12 },
      crowd_level: 'high',
      best_time: ['early_morning'],
      coordinates: { lat: 36.1423, lng: 137.2547 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['market', 'local', 'food', 'morning']
    }
  ],
  kanazawa: [
    {
      id: 'KAN001',
      name: 'Jardín Kenroku-en',
      area: 'Centro',
      categories: ['nature', 'culture', 'photography'],
      quality_rating: 4.8,
      cost: 320,
      duration: 120,
      opening_hours: { start: 7, end: 18 },
      crowd_level: 'medium',
      best_time: ['morning'],
      coordinates: { lat: 36.5622, lng: 136.6623 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['garden', 'beautiful', 'must_see', 'seasonal']
    },
    {
      id: 'KAN002',
      name: 'Distrito de Geishas Higashi Chaya',
      area: 'Higashi',
      categories: ['culture', 'history', 'photography'],
      quality_rating: 4.7,
      cost: 0,
      duration: 120,
      opening_hours: { start: 9, end: 18 },
      crowd_level: 'medium',
      best_time: ['afternoon'],
      coordinates: { lat: 36.5705, lng: 136.6700 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['geisha', 'traditional', 'tea_house', 'historic']
    }
  ],
  fukuoka: [
    {
      id: 'FUK001',
      name: 'Yatai (Puestos de Ramen)',
      area: 'Nakasu',
      categories: ['gastronomy', 'nightlife'],
      quality_rating: 4.6,
      cost: 800,
      duration: 90,
      opening_hours: { start: 18, end: 2 },
      crowd_level: 'very_high',
      best_time: ['evening'],
      coordinates: { lat: 33.5950, lng: 130.4017 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['ramen', 'street_food', 'authentic', 'night']
    },
    {
      id: 'FUK002',
      name: 'Santuario Dazaifu Tenmangu',
      area: 'Dazaifu',
      categories: ['culture', 'history'],
      quality_rating: 4.7,
      cost: 0,
      duration: 150,
      opening_hours: { start: 6, end: 19 },
      crowd_level: 'high',
      best_time: ['morning'],
      coordinates: { lat: 33.5219, lng: 130.5234 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['shrine', 'students', 'plum_trees', 'historic']
    }
  ],
  sendai: [
    {
      id: 'SEN001',
      name: 'Ruinas del Castillo de Aoba',
      area: 'Aobayama',
      categories: ['history', 'photography'],
      quality_rating: 4.4,
      cost: 0,
      duration: 90,
      opening_hours: { start: 0, end: 24 },
      crowd_level: 'low',
      best_time: ['afternoon'],
      coordinates: { lat: 38.2551, lng: 140.8572 },
      accessibility: { reduced_mobility_friendly: false },
      tags: ['castle', 'ruins', 'view', 'history']
    },
    {
      id: 'SEN002',
      name: 'Calle Jozenji-dori',
      area: 'Centro',
      categories: ['shopping', 'culture'],
      quality_rating: 4.3,
      cost: 0,
      duration: 120,
      opening_hours: { start: 10, end: 20 },
      crowd_level: 'medium',
      best_time: ['afternoon'],
      coordinates: { lat: 38.2618, lng: 140.8758 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['shopping', 'trees', 'cafes', 'modern']
    }
  ],
  matsumoto: [
    {
      id: 'MAT001',
      name: 'Castillo de Matsumoto',
      area: 'Centro',
      categories: ['history', 'culture', 'photography'],
      quality_rating: 4.8,
      cost: 700,
      duration: 120,
      opening_hours: { start: 8, end: 17 },
      crowd_level: 'high',
      best_time: ['morning'],
      coordinates: { lat: 36.2384, lng: 137.9687 },
      accessibility: { reduced_mobility_friendly: false },
      tags: ['castle', 'black_castle', 'original', 'must_see']
    }
  ],
  shirakawago: [
    {
      id: 'SHI001',
      name: 'Aldea Histórica Shirakawa-go',
      area: 'Aldea',
      categories: ['culture', 'history', 'photography', 'nature'],
      quality_rating: 4.9,
      cost: 0,
      duration: 240,
      opening_hours: { start: 8, end: 17 },
      crowd_level: 'high',
      best_time: ['full_day'],
      coordinates: { lat: 36.2584, lng: 136.9060 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['unesco', 'gassho_houses', 'rural', 'winter', 'must_see']
    }
  ],
  himeji: [
    {
      id: 'HIM001',
      name: 'Castillo de Himeji',
      area: 'Centro',
      categories: ['history', 'culture', 'photography'],
      quality_rating: 5.0,
      cost: 1000,
      duration: 180,
      opening_hours: { start: 9, end: 17 },
      crowd_level: 'very_high',
      best_time: ['early_morning'],
      coordinates: { lat: 34.8394, lng: 134.6939 },
      accessibility: { reduced_mobility_friendly: false },
      tags: ['castle', 'unesco', 'white_heron', 'iconic', 'must_see']
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
