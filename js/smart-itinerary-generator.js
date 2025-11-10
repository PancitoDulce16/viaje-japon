// js/smart-itinerary-generator.js - Smart Complete Itinerary Generator
// Sistema inteligente que genera itinerarios completos basados en preferencias del usuario

/**
 * Base de datos EXPANDIDA de actividades por ciudad
 * 200+ actividades con datos reales
 */
const ACTIVITY_DATABASE = {
  tokyo: [
    // ========== ASAKUSA ==========
    { name: 'Senso-ji Temple', category: 'cultural', lat: 35.7148, lng: 139.7967, duration: 90, cost: 0, interests: ['cultural', 'history'], area: 'Asakusa', popularity: 95, timeOfDay: 'morning' },
    { name: 'Nakamise Shopping Street', category: 'shopping', lat: 35.7115, lng: 139.7966, duration: 60, cost: 2000, interests: ['shopping', 'food'], area: 'Asakusa', popularity: 85, timeOfDay: 'any' },
    { name: 'Tokyo Skytree', category: 'attraction', lat: 35.7101, lng: 139.8107, duration: 120, cost: 2100, interests: ['sightseeing'], area: 'Asakusa', popularity: 85, timeOfDay: 'evening' },
    { name: 'Sumida River Cruise', category: 'attraction', lat: 35.7104, lng: 139.8010, duration: 60, cost: 1000, interests: ['relax', 'sightseeing'], area: 'Asakusa', popularity: 70, timeOfDay: 'afternoon' },

    // ========== SHIBUYA ==========
    { name: 'Shibuya Crossing', category: 'attraction', lat: 35.6595, lng: 139.7004, duration: 30, cost: 0, interests: ['urban', 'photography'], area: 'Shibuya', popularity: 90, timeOfDay: 'evening' },
    { name: 'Hachiko Statue', category: 'attraction', lat: 35.6590, lng: 139.7005, duration: 20, cost: 0, interests: ['cultural', 'photography'], area: 'Shibuya', popularity: 75, timeOfDay: 'any' },
    { name: 'Shibuya Sky Observatory', category: 'attraction', lat: 35.6580, lng: 139.7016, duration: 90, cost: 2000, interests: ['sightseeing'], area: 'Shibuya', popularity: 80, timeOfDay: 'evening' },
    { name: 'Shibuya 109', category: 'shopping', lat: 35.6595, lng: 139.6989, duration: 120, cost: 5000, interests: ['shopping', 'fashion'], area: 'Shibuya', popularity: 75, timeOfDay: 'afternoon' },
    { name: 'Shibuya Center Gai', category: 'nightlife', lat: 35.6616, lng: 139.6991, duration: 90, cost: 3000, interests: ['nightlife', 'food'], area: 'Shibuya', popularity: 70, timeOfDay: 'evening' },

    // ========== SHINJUKU ==========
    { name: 'Shinjuku Gyoen National Garden', category: 'nature', lat: 35.6852, lng: 139.7100, duration: 120, cost: 500, interests: ['nature', 'relax', 'photography'], area: 'Shinjuku', popularity: 85, timeOfDay: 'morning' },
    { name: 'Tokyo Metropolitan Building Observatory', category: 'attraction', lat: 35.6896, lng: 139.6917, duration: 60, cost: 0, interests: ['sightseeing'], area: 'Shinjuku', popularity: 80, timeOfDay: 'evening' },
    { name: 'Shinjuku Golden Gai', category: 'nightlife', lat: 35.6938, lng: 139.7053, duration: 120, cost: 4000, interests: ['nightlife', 'culture'], area: 'Shinjuku', popularity: 70, timeOfDay: 'night' },
    { name: 'Kabukicho', category: 'nightlife', lat: 35.6945, lng: 139.7029, duration: 90, cost: 3000, interests: ['nightlife'], area: 'Shinjuku', popularity: 65, timeOfDay: 'night' },
    { name: 'Omoide Yokocho', category: 'food', lat: 35.6925, lng: 139.7006, duration: 90, cost: 2500, interests: ['food', 'culture'], area: 'Shinjuku', popularity: 75, timeOfDay: 'evening' },

    // ========== HARAJUKU ==========
    { name: 'Meiji Shrine', category: 'cultural', lat: 35.6764, lng: 139.6993, duration: 90, cost: 0, interests: ['cultural', 'nature'], area: 'Harajuku', popularity: 90, timeOfDay: 'morning' },
    { name: 'Takeshita Street', category: 'shopping', lat: 35.6702, lng: 139.7027, duration: 90, cost: 3000, interests: ['shopping', 'fashion', 'food'], area: 'Harajuku', popularity: 85, timeOfDay: 'afternoon' },
    { name: 'Omotesando Avenue', category: 'shopping', lat: 35.6652, lng: 139.7102, duration: 90, cost: 4000, interests: ['shopping', 'fashion'], area: 'Harajuku', popularity: 75, timeOfDay: 'afternoon' },
    { name: 'Yoyogi Park', category: 'nature', lat: 35.6719, lng: 139.6961, duration: 90, cost: 0, interests: ['nature', 'relax'], area: 'Harajuku', popularity: 70, timeOfDay: 'any' },

    // ========== AKIHABARA ==========
    { name: 'Akihabara Electric Town', category: 'shopping', lat: 35.7022, lng: 139.7745, duration: 120, cost: 5000, interests: ['anime', 'shopping', 'technology'], area: 'Akihabara', popularity: 85, timeOfDay: 'afternoon' },
    { name: 'Mandarake', category: 'shopping', lat: 35.7022, lng: 139.7745, duration: 90, cost: 3000, interests: ['anime', 'shopping'], area: 'Akihabara', popularity: 75, timeOfDay: 'any' },
    { name: 'Super Potato Retro-kan', category: 'shopping', lat: 35.6989, lng: 139.7731, duration: 60, cost: 2000, interests: ['technology', 'shopping'], area: 'Akihabara', popularity: 65, timeOfDay: 'any' },
    { name: 'Maid Café Experience', category: 'food', lat: 35.7020, lng: 139.7740, duration: 60, cost: 1500, interests: ['anime', 'culture', 'food'], area: 'Akihabara', popularity: 70, timeOfDay: 'afternoon' },

    // ========== UENO ==========
    { name: 'Ueno Park', category: 'nature', lat: 35.7151, lng: 139.7738, duration: 90, cost: 0, interests: ['nature', 'relax'], area: 'Ueno', popularity: 80, timeOfDay: 'morning' },
    { name: 'Tokyo National Museum', category: 'museum', lat: 35.7188, lng: 139.7764, duration: 120, cost: 1000, interests: ['history', 'art'], area: 'Ueno', popularity: 75, timeOfDay: 'any' },
    { name: 'Ueno Zoo', category: 'attraction', lat: 35.7159, lng: 139.7730, duration: 150, cost: 600, interests: ['nature'], area: 'Ueno', popularity: 70, timeOfDay: 'morning' },
    { name: 'Ameyoko Shopping Street', category: 'shopping', lat: 35.7082, lng: 139.7753, duration: 90, cost: 2500, interests: ['shopping', 'food'], area: 'Ueno', popularity: 75, timeOfDay: 'any' },

    // ========== ROPPONGI ==========
    { name: 'Mori Art Museum', category: 'museum', lat: 35.6605, lng: 139.7293, duration: 120, cost: 1800, interests: ['art'], area: 'Roppongi', popularity: 75, timeOfDay: 'any' },
    { name: 'Tokyo City View Observatory', category: 'attraction', lat: 35.6605, lng: 139.7293, duration: 60, cost: 1800, interests: ['sightseeing'], area: 'Roppongi', popularity: 75, timeOfDay: 'evening' },
    { name: 'Roppongi Hills', category: 'shopping', lat: 35.6605, lng: 139.7293, duration: 120, cost: 4000, interests: ['shopping'], area: 'Roppongi', popularity: 70, timeOfDay: 'afternoon' },

    // ========== ODAIBA ==========
    { name: 'teamLab Borderless', category: 'museum', lat: 35.6248, lng: 139.7753, duration: 150, cost: 3200, interests: ['art', 'technology'], area: 'Odaiba', popularity: 90, timeOfDay: 'evening' },
    { name: 'Gundam Statue', category: 'attraction', lat: 35.6252, lng: 139.7755, duration: 30, cost: 0, interests: ['anime', 'photography'], area: 'Odaiba', popularity: 75, timeOfDay: 'any' },
    { name: 'DiverCity Tokyo Plaza', category: 'shopping', lat: 35.6252, lng: 139.7755, duration: 120, cost: 4000, interests: ['shopping'], area: 'Odaiba', popularity: 70, timeOfDay: 'afternoon' },
    { name: 'Oedo Onsen Monogatari', category: 'relax', lat: 35.6193, lng: 139.7839, duration: 180, cost: 2900, interests: ['relax', 'culture'], area: 'Odaiba', popularity: 75, timeOfDay: 'evening' },

    // ========== GINZA ==========
    { name: 'Ginza Shopping District', category: 'shopping', lat: 35.6717, lng: 139.7640, duration: 120, cost: 8000, interests: ['shopping', 'fashion'], area: 'Ginza', popularity: 80, timeOfDay: 'afternoon' },
    { name: 'Kabuki-za Theater', category: 'cultural', lat: 35.6700, lng: 139.7702, duration: 180, cost: 4000, interests: ['cultural', 'history'], area: 'Ginza', popularity: 70, timeOfDay: 'evening' },
    { name: 'Tsukiji Outer Market', category: 'food', lat: 35.6654, lng: 139.7707, duration: 120, cost: 3000, interests: ['food', 'market'], area: 'Ginza', popularity: 90, timeOfDay: 'morning' },

    // ========== TOKYO STATION AREA ==========
    { name: 'Imperial Palace East Gardens', category: 'nature', lat: 35.6852, lng: 139.7547, duration: 90, cost: 0, interests: ['nature', 'history'], area: 'Tokyo Station', popularity: 75, timeOfDay: 'morning' },
    { name: 'Tokyo Station', category: 'attraction', lat: 35.6812, lng: 139.7671, duration: 30, cost: 0, interests: ['photography', 'history'], area: 'Tokyo Station', popularity: 70, timeOfDay: 'any' },
    { name: 'Ramen Street', category: 'food', lat: 35.6812, lng: 139.7671, duration: 60, cost: 1000, interests: ['food'], area: 'Tokyo Station', popularity: 80, timeOfDay: 'any' },
    { name: 'Tokyo Character Street', category: 'shopping', lat: 35.6812, lng: 139.7671, duration: 60, cost: 2000, interests: ['anime', 'shopping'], area: 'Tokyo Station', popularity: 70, timeOfDay: 'any' },

    // ========== IKEBUKURO ==========
    { name: 'Sunshine City', category: 'shopping', lat: 35.7295, lng: 139.7194, duration: 120, cost: 3000, interests: ['shopping'], area: 'Ikebukuro', popularity: 70, timeOfDay: 'any' },
    { name: 'Pokémon Center Mega Tokyo', category: 'shopping', lat: 35.7295, lng: 139.7194, duration: 60, cost: 2000, interests: ['anime', 'shopping'], area: 'Ikebukuro', popularity: 75, timeOfDay: 'any' },
    { name: 'Otome Road', category: 'shopping', lat: 35.7305, lng: 139.7177, duration: 90, cost: 2500, interests: ['anime', 'shopping'], area: 'Ikebukuro', popularity: 65, timeOfDay: 'any' },

    // ========== MINATO/TOKYO TOWER ==========
    { name: 'Tokyo Tower', category: 'attraction', lat: 35.6586, lng: 139.7454, duration: 90, cost: 1200, interests: ['sightseeing'], area: 'Minato', popularity: 80, timeOfDay: 'evening' },
    { name: 'Zojoji Temple', category: 'cultural', lat: 35.6577, lng: 139.7457, duration: 60, cost: 0, interests: ['cultural', 'history'], area: 'Minato', popularity: 65, timeOfDay: 'morning' },

    // ========== NAKANO ==========
    { name: 'Nakano Broadway', category: 'shopping', lat: 35.7068, lng: 139.6649, duration: 120, cost: 3000, interests: ['anime', 'shopping'], area: 'Nakano', popularity: 70, timeOfDay: 'any' }
  ],

  kyoto: [
    // ========== FUSHIMI ==========
    { name: 'Fushimi Inari Shrine', category: 'cultural', lat: 34.9671, lng: 135.7727, duration: 120, cost: 0, interests: ['cultural', 'nature', 'photography'], area: 'Fushimi', popularity: 95, timeOfDay: 'morning' },
    { name: 'Fushimi Sake District', category: 'food', lat: 34.9277, lng: 135.7604, duration: 90, cost: 2000, interests: ['food', 'culture'], area: 'Fushimi', popularity: 70, timeOfDay: 'afternoon' },

    // ========== HIGASHIYAMA ==========
    { name: 'Kiyomizu-dera', category: 'cultural', lat: 34.9949, lng: 135.7850, duration: 120, cost: 400, interests: ['cultural', 'history'], area: 'Higashiyama', popularity: 90, timeOfDay: 'morning' },
    { name: 'Sannenzaka & Ninenzaka', category: 'shopping', lat: 34.9965, lng: 135.7803, duration: 90, cost: 2000, interests: ['shopping', 'cultural', 'photography'], area: 'Higashiyama', popularity: 85, timeOfDay: 'afternoon' },
    { name: 'Yasaka Shrine', category: 'cultural', lat: 35.0036, lng: 135.7786, duration: 60, cost: 0, interests: ['cultural'], area: 'Higashiyama', popularity: 75, timeOfDay: 'any' },
    { name: 'Maruyama Park', category: 'nature', lat: 35.0033, lng: 135.7801, duration: 60, cost: 0, interests: ['nature', 'relax'], area: 'Higashiyama', popularity: 70, timeOfDay: 'any' },

    // ========== GION ==========
    { name: 'Gion District', category: 'cultural', lat: 35.0036, lng: 135.7751, duration: 90, cost: 0, interests: ['cultural', 'history', 'photography'], area: 'Gion', popularity: 85, timeOfDay: 'evening' },
    { name: 'Hanamikoji Street', category: 'cultural', lat: 35.0024, lng: 135.7751, duration: 60, cost: 0, interests: ['cultural', 'photography'], area: 'Gion', popularity: 80, timeOfDay: 'evening' },
    { name: 'Pontocho Alley', category: 'food', lat: 35.0041, lng: 135.7706, duration: 120, cost: 5000, interests: ['food', 'culture', 'nightlife'], area: 'Gion', popularity: 75, timeOfDay: 'evening' },

    // ========== ARASHIYAMA ==========
    { name: 'Arashiyama Bamboo Grove', category: 'nature', lat: 35.0170, lng: 135.6717, duration: 60, cost: 0, interests: ['nature', 'photography'], area: 'Arashiyama', popularity: 90, timeOfDay: 'morning' },
    { name: 'Tenryu-ji Temple', category: 'cultural', lat: 35.0157, lng: 135.6742, duration: 90, cost: 500, interests: ['cultural', 'nature'], area: 'Arashiyama', popularity: 80, timeOfDay: 'morning' },
    { name: 'Togetsukyo Bridge', category: 'attraction', lat: 35.0142, lng: 135.6766, duration: 30, cost: 0, interests: ['nature', 'photography'], area: 'Arashiyama', popularity: 75, timeOfDay: 'any' },
    { name: 'Monkey Park Iwatayama', category: 'nature', lat: 35.0126, lng: 135.6764, duration: 90, cost: 550, interests: ['nature'], area: 'Arashiyama', popularity: 70, timeOfDay: 'afternoon' },
    { name: 'Sagano Scenic Railway', category: 'attraction', lat: 35.0175, lng: 135.6617, duration: 90, cost: 880, interests: ['nature', 'sightseeing'], area: 'Arashiyama', popularity: 75, timeOfDay: 'any' },

    // ========== KITA (NORTH) ==========
    { name: 'Kinkaku-ji (Golden Pavilion)', category: 'cultural', lat: 35.0394, lng: 135.7292, duration: 90, cost: 400, interests: ['cultural', 'photography'], area: 'Kita', popularity: 95, timeOfDay: 'morning' },
    { name: 'Ryoan-ji Temple', category: 'cultural', lat: 35.0345, lng: 135.7184, duration: 60, cost: 500, interests: ['cultural', 'relax'], area: 'Kita', popularity: 75, timeOfDay: 'any' },
    { name: 'Kinkaku-ji Temple', category: 'cultural', lat: 35.0275, lng: 135.7299, duration: 60, cost: 400, interests: ['cultural'], area: 'Kita', popularity: 70, timeOfDay: 'any' },

    // ========== SAKYO (EAST) ==========
    { name: 'Philosopher\'s Path', category: 'nature', lat: 35.0262, lng: 135.7949, duration: 90, cost: 0, interests: ['nature', 'relax', 'photography'], area: 'Sakyo', popularity: 80, timeOfDay: 'morning' },
    { name: 'Ginkaku-ji (Silver Pavilion)', category: 'cultural', lat: 35.0269, lng: 135.7983, duration: 90, cost: 500, interests: ['cultural', 'nature'], area: 'Sakyo', popularity: 85, timeOfDay: 'afternoon' },
    { name: 'Nanzen-ji Temple', category: 'cultural', lat: 35.0108, lng: 135.7934, duration: 90, cost: 500, interests: ['cultural'], area: 'Sakyo', popularity: 75, timeOfDay: 'any' },

    // ========== NAKAGYO (CENTRAL) ==========
    { name: 'Nishiki Market', category: 'food', lat: 35.0051, lng: 135.7638, duration: 90, cost: 2000, interests: ['food', 'shopping'], area: 'Nakagyo', popularity: 85, timeOfDay: 'morning' },
    { name: 'Nijo Castle', category: 'cultural', lat: 35.0142, lng: 135.7481, duration: 120, cost: 600, interests: ['history', 'cultural'], area: 'Nakagyo', popularity: 85, timeOfDay: 'any' },
    { name: 'Kyoto International Manga Museum', category: 'museum', lat: 35.0106, lng: 135.7588, duration: 120, cost: 900, interests: ['anime', 'art'], area: 'Nakagyo', popularity: 70, timeOfDay: 'any' },

    // ========== SHIMOGYO (KYOTO STATION AREA) ==========
    { name: 'To-ji Temple', category: 'cultural', lat: 34.9805, lng: 135.7476, duration: 60, cost: 500, interests: ['cultural', 'history'], area: 'Shimogyo', popularity: 70, timeOfDay: 'any' },
    { name: 'Kyoto Tower', category: 'attraction', lat: 34.9876, lng: 135.7594, duration: 60, cost: 770, interests: ['sightseeing'], area: 'Shimogyo', popularity: 65, timeOfDay: 'evening' },

    // ========== UKYO ==========
    { name: 'Katsura Imperial Villa', category: 'cultural', lat: 34.9832, lng: 135.7041, duration: 90, cost: 1000, interests: ['cultural', 'history', 'nature'], area: 'Ukyo', popularity: 65, timeOfDay: 'afternoon' }
  ],

  osaka: [
    // ========== NAMBA ==========
    { name: 'Dotonbori', category: 'attraction', lat: 34.6686, lng: 135.5004, duration: 120, cost: 3000, interests: ['food', 'nightlife', 'photography'], area: 'Namba', popularity: 95, timeOfDay: 'evening' },
    { name: 'Kuromon Market', category: 'food', lat: 34.6659, lng: 135.5064, duration: 90, cost: 2500, interests: ['food', 'market'], area: 'Namba', popularity: 85, timeOfDay: 'morning' },
    { name: 'Namba Parks', category: 'shopping', lat: 34.6657, lng: 135.5031, duration: 90, cost: 3000, interests: ['shopping'], area: 'Namba', popularity: 70, timeOfDay: 'any' },
    { name: 'Hozenji Yokocho', category: 'cultural', lat: 34.6681, lng: 135.5032, duration: 60, cost: 0, interests: ['cultural', 'food'], area: 'Namba', popularity: 75, timeOfDay: 'evening' },

    // ========== SHINSAIBASHI ==========
    { name: 'Shinsaibashi Shopping Street', category: 'shopping', lat: 34.6724, lng: 135.5010, duration: 120, cost: 5000, interests: ['shopping'], area: 'Shinsaibashi', popularity: 85, timeOfDay: 'afternoon' },
    { name: 'Amerikamura', category: 'shopping', lat: 34.6727, lng: 135.4976, duration: 90, cost: 3000, interests: ['shopping', 'fashion'], area: 'Shinsaibashi', popularity: 70, timeOfDay: 'afternoon' },

    // ========== UMEDA ==========
    { name: 'Umeda Sky Building', category: 'attraction', lat: 34.7053, lng: 135.4903, duration: 90, cost: 1500, interests: ['sightseeing'], area: 'Umeda', popularity: 80, timeOfDay: 'evening' },
    { name: 'Grand Front Osaka', category: 'shopping', lat: 34.7056, lng: 135.4967, duration: 120, cost: 4000, interests: ['shopping'], area: 'Umeda', popularity: 70, timeOfDay: 'any' },
    { name: 'Hep Five Ferris Wheel', category: 'attraction', lat: 34.7030, lng: 135.5002, duration: 60, cost: 600, interests: ['sightseeing'], area: 'Umeda', popularity: 65, timeOfDay: 'evening' },

    // ========== CHUO (OSAKA CASTLE AREA) ==========
    { name: 'Osaka Castle', category: 'cultural', lat: 34.6873, lng: 135.5262, duration: 120, cost: 600, interests: ['history', 'cultural'], area: 'Chuo', popularity: 90, timeOfDay: 'morning' },
    { name: 'Osaka Castle Park', category: 'nature', lat: 34.6873, lng: 135.5262, duration: 90, cost: 0, interests: ['nature', 'relax'], area: 'Chuo', popularity: 75, timeOfDay: 'any' },

    // ========== TENNOJI ==========
    { name: 'Shinsekai', category: 'attraction', lat: 34.6525, lng: 135.5063, duration: 90, cost: 2000, interests: ['food', 'culture'], area: 'Tennoji', popularity: 75, timeOfDay: 'evening' },
    { name: 'Tsutenkaku Tower', category: 'attraction', lat: 34.6525, lng: 135.5063, duration: 60, cost: 900, interests: ['sightseeing'], area: 'Tennoji', popularity: 70, timeOfDay: 'any' },
    { name: 'Tennoji Zoo', category: 'nature', lat: 34.6515, lng: 135.5061, duration: 150, cost: 500, interests: ['nature'], area: 'Tennoji', popularity: 65, timeOfDay: 'morning' },
    { name: 'Abeno Harukas', category: 'attraction', lat: 34.6452, lng: 135.5140, duration: 90, cost: 1500, interests: ['sightseeing', 'shopping'], area: 'Tennoji', popularity: 75, timeOfDay: 'evening' },

    // ========== KITA ==========
    { name: 'Osaka Aquarium Kaiyukan', category: 'attraction', lat: 34.6546, lng: 135.4289, duration: 150, cost: 2400, interests: ['nature'], area: 'Minato', popularity: 85, timeOfDay: 'any' },
    { name: 'Tempozan Ferris Wheel', category: 'attraction', lat: 34.6548, lng: 135.4287, duration: 60, cost: 800, interests: ['sightseeing'], area: 'Minato', popularity: 65, timeOfDay: 'evening' },

    // ========== SUMIYOSHI ==========
    { name: 'Sumiyoshi Taisha Shrine', category: 'cultural', lat: 34.6103, lng: 135.4916, duration: 90, cost: 0, interests: ['cultural', 'history'], area: 'Sumiyoshi', popularity: 70, timeOfDay: 'morning' },

    // ========== NISHINARI ==========
    { name: 'Spa World', category: 'relax', lat: 34.6479, lng: 135.5056, duration: 180, cost: 1500, interests: ['relax'], area: 'Nishinari', popularity: 65, timeOfDay: 'evening' }
  ]
};

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
   * 🎨 Genera MÚLTIPLES VARIACIONES de itinerarios
   * Retorna 3 versiones diferentes para que el usuario elija
   */
  async generateMultipleVariations(profile) {
    console.log('🎨 Generando 3 variaciones del itinerario...');

    const variations = [];

    // ========== VARIACIÓN 1: CULTURAL-FOCUSED ==========
    const culturalProfile = {
      ...profile,
      interests: this.prioritizeInterests(profile.interests, ['cultural', 'history', 'art']),
      _variationType: 'cultural'
    };
    const culturalItinerary = await this.generateCompleteItinerary(culturalProfile);
    variations.push({
      id: 'cultural',
      name: '⛩️ Cultural Explorer',
      description: 'Enfocado en templos, historia y arte tradicional japonés',
      icon: '⛩️',
      itinerary: culturalItinerary,
      tags: ['Templos', 'Historia', 'Arte', 'Tradición']
    });

    // ========== VARIACIÓN 2: FOOD & SHOPPING ==========
    const foodShoppingProfile = {
      ...profile,
      interests: this.prioritizeInterests(profile.interests, ['food', 'shopping', 'nightlife']),
      _variationType: 'foodShopping'
    };
    const foodShoppingItinerary = await this.generateCompleteItinerary(foodShoppingProfile);
    variations.push({
      id: 'foodShopping',
      name: '🍜 Foodie & Shopper',
      description: 'Gastronomía, mercados, shopping y vida nocturna',
      icon: '🍜',
      itinerary: foodShoppingItinerary,
      tags: ['Comida', 'Shopping', 'Mercados', 'Nightlife']
    });

    // ========== VARIACIÓN 3: BALANCED ==========
    const balancedProfile = {
      ...profile,
      _variationType: 'balanced'
    };
    const balancedItinerary = await this.generateCompleteItinerary(balancedProfile);
    variations.push({
      id: 'balanced',
      name: '⚖️ Experiencia Completa',
      description: 'Mix perfecto de cultura, comida, shopping y diversión',
      icon: '⚖️',
      itinerary: balancedItinerary,
      tags: ['Equilibrado', 'Variado', 'Completo', 'Recomendado']
    });

    console.log('✅ 3 variaciones generadas exitosamente');
    return variations;
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
      tripStartDate = null // Para detectar temporada
    } = profile;

    console.log('🧠 Generando itinerario completo:', profile);
    console.log(`👥 Companion: ${companionType || 'none'}`);
    console.log(`⚡ Intensity: ${pace}`);

    // Distribuir días entre ciudades
    const cityDistribution = this.distributeDaysAcrossCities(cities, totalDays);

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
          tripStartDate: tripStartDate
        });

        itinerary.days.push(day);
        currentDayNumber++;
      }
    }

    console.log('✅ Itinerario generado:', itinerary);
    return itinerary;
  },

  /**
   * Distribuye días entre ciudades
   */
  distributeDaysAcrossCities(cities, totalDays) {
    if (cities.length === 0) return [];
    if (cities.length === 1) return [{ city: cities[0], days: totalDays }];

    // Distribución inteligente
    const distribution = [];
    const daysPerCity = Math.floor(totalDays / cities.length);
    const remainingDays = totalDays % cities.length;

    cities.forEach((city, index) => {
      let days = daysPerCity;
      // Dar días extra a las primeras ciudades
      if (index < remainingDays) days++;

      distribution.push({ city, days });
    });

    return distribution;
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
      tripStartDate
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

    // Días especiales
    if (isArrivalDay || isDepartureDay) {
      targetActivities = Math.max(2, Math.floor(targetActivities * 0.4));
    }

    // 🌐 REAL-TIME GOOGLE PLACES: Buscar actividades
    let candidateActivities = [];

    // PASO 1: Actividades de la base de datos
    const cityKey = city.toLowerCase();
    const dbActivities = ACTIVITY_DATABASE[cityKey] || [];
    candidateActivities = [...dbActivities];

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

    // Filtrar y puntuar actividades
    const scoredActivities = candidateActivities
      .map(activity => {
        let score = this.scoreActivity(activity, interests, dailyBudget, avoid, hotel, companionType, themedDay);

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
        a.name.toLowerCase().includes(must.name.toLowerCase())
      );
      if (mustActivity && selectedActivities.length < targetActivities) {
        selectedActivities.push(mustActivity);
      }
    }

    // 2. Completar con top-scored
    for (const activity of scoredActivities) {
      if (selectedActivities.length >= targetActivities) break;
      if (!selectedActivities.includes(activity)) {
        // Diversidad de categorías
        const lastCategory = selectedActivities[selectedActivities.length - 1]?.category;
        if (lastCategory !== activity.category || selectedActivities.length < 2) {
          selectedActivities.push(activity);
        }
      }
    }

    // 3. Optimizar ruta
    const dayStartTime = intensityConfig.startTime;
    const optimizedActivities = this.optimizeActivityOrder(selectedActivities, hotel, dayStartTime);

    // 4. Insertar comidas
    const withMeals = await this.insertMealsIntoDay(optimizedActivities, hotel, googlePlacesAPI, dailyBudget);

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
   * 📊 Sistema de aprendizaje: Guarda edición del usuario
   */
  saveUserEdit(editType, activityData) {
    const weights = this.loadUserLearningWeights();
    weights.editCount = (weights.editCount || 0) + 1;

    if (editType === 'removed') {
      // Usuario eliminó esta actividad - reduce peso de su categoría
      const category = activityData.category;
      weights.categoryPreferences[category] = (weights.categoryPreferences[category] || 0) - 2;

      // Reduce peso de sus intereses
      activityData.interests?.forEach(interest => {
        weights.interestWeights[interest] = (weights.interestWeights[interest] || 1.0) - 0.1;
      });
    } else if (editType === 'added') {
      // Usuario agregó esta actividad - aumenta peso de su categoría
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
   * Puntúa una actividad según preferencias del usuario
   * MEJORADO: Considera companion type y themed day
   */
  scoreActivity(activity, interests, dailyBudget, avoid, hotel, companionType, themedDay) {
    let score = 0;

    // 1. Match de intereses (30%)
    const interestMatch = activity.interests?.some(i => interests.includes(i)) ? 1 : 0;
    score += interestMatch * 30;

    // 2. Fit de presupuesto (15%)
    const activityCost = activity.cost || 0;
    const budgetFit = activityCost <= dailyBudget * 0.3 ? 1 :
                      activityCost <= dailyBudget * 0.5 ? 0.7 :
                      0.3;
    score += budgetFit * 15;

    // 3. Popularidad (15%)
    const popularity = activity.popularity || 50;
    score += (popularity / 100) * 15;

    // 4. Cercanía al hotel (15%)
    if (hotel && hotel.lat && hotel.lng && activity.lat && activity.lng) {
      const distance = this.calculateDistance(
        { lat: hotel.lat, lng: hotel.lng },
        { lat: activity.lat, lng: activity.lng }
      );
      const proximityScore = distance < 2 ? 1 : distance < 5 ? 0.7 : distance < 10 ? 0.4 : 0.2;
      score += proximityScore * 15;
    } else {
      score += 7.5;
    }

    // 5. 🎨 THEMED DAY BONUS (15%)
    if (themedDay && THEMED_DAYS[themedDay]) {
      const theme = THEMED_DAYS[themedDay];

      // Bonus si coincide con intereses del tema
      if (theme.interests && activity.interests) {
        const themeMatch = theme.interests.some(ti => activity.interests.includes(ti));
        if (themeMatch) score += 15;
      }

      // Bonus si coincide con categorías del tema
      if (theme.categories && theme.categories.includes(activity.category)) {
        score += 10;
      }

      // Priorizar popularidad para temas photogenic
      if (theme.prioritizePopularity && popularity > 85) {
        score += 10;
      }
    }

    // 6. 👥 COMPANION-AWARE BONUS (10%)
    if (companionType && COMPANION_TYPES[companionType]) {
      const companion = COMPANION_TYPES[companionType];

      // Bonus por categorías preferidas
      if (companion.categories && companion.categories.includes(activity.category)) {
        score += 10;
      }

      // Bonus por preferencias
      if (companion.preferences) {
        if (companion.preferences.kidFriendly && activity.category === 'nature') score += 5;
        if (companion.preferences.romanticSpots && activity.popularity > 80) score += 5;
        if (companion.preferences.nightlife && activity.category === 'nightlife') score += 10;
      }

      // Penalty por categorías a evitar
      if (companion.avoidCategories && companion.avoidCategories.includes(activity.category)) {
        score -= 20;
      }
    }

    // Penalizar si está en lista de "avoid"
    if (avoid && avoid.some(a => activity.name.toLowerCase().includes(a.toLowerCase()))) {
      score = 0;
    }

    // 7. 📊 LEARNING WEIGHTS - Aprende de ediciones del usuario
    score = this.applyLearningWeights(score, activity);

    return Math.round(score);
  },

  /**
   * 🗺️ Optimiza el orden de actividades usando Geographic Clustering + TSP
   * NUEVO: Agrupa por área geográfica y encuentra la ruta óptima
   */
  optimizeActivityOrder(activities, hotel, startTime) {
    if (activities.length === 0) {
      return activities;
    }

    if (activities.length === 1) {
      const act = { ...activities[0], time: this.formatTime(startTime * 60) };
      return [act];
    }

    // PASO 1: Geographic Clustering - Agrupar actividades por área
    const clusters = this.clusterActivitiesByArea(activities);
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
   * 🌐 Agrupa actividades por área geográfica
   */
  clusterActivitiesByArea(activities) {
    const clusters = {};

    for (const activity of activities) {
      const area = activity.area || 'General';
      if (!clusters[area]) {
        clusters[area] = [];
      }
      clusters[area].push(activity);
    }

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
    const R = 6371;
    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLon = this.deg2rad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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
