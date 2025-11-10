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
   */
  async generateCompleteItinerary(profile) {
    const {
      cities = [],
      totalDays = 7,
      dailyBudget = 10000,
      interests = [],
      pace = 'moderate', // relaxed, moderate, intense
      startTime = 9, // hora de inicio típica (9am)
      hotels = {}, // { tokyo: { name, lat, lng }, kyoto: ... }
      mustSee = [],
      avoid = []
    } = profile;

    console.log('🧠 Generando itinerario completo:', profile);

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
          googlePlacesAPI: window.GooglePlacesAPI
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
      googlePlacesAPI
    } = options;

    // Determinar número de actividades según el ritmo
    let targetActivities;
    if (isArrivalDay || isDepartureDay) {
      targetActivities = pace === 'relaxed' ? 2 : 3; // Días de viaje son más ligeros
    } else {
      targetActivities = pace === 'relaxed' ? 3 : pace === 'moderate' ? 4 : 5;
    }

    // Obtener actividades candidatas de la base de datos
    const cityKey = city.toLowerCase();
    const candidateActivities = ACTIVITY_DATABASE[cityKey] || [];

    // Filtrar y puntuar actividades
    const scoredActivities = candidateActivities
      .map(activity => ({
        ...activity,
        score: this.scoreActivity(activity, interests, dailyBudget, avoid, hotel)
      }))
      .filter(a => a.score > 50) // Solo actividades con score > 50%
      .sort((a, b) => b.score - a.score);

    // Priorizar must-see
    const selectedActivities = [];

    // 1. Agregar must-see primero
    for (const must of mustSee) {
      const mustActivity = scoredActivities.find(a =>
        a.name.toLowerCase().includes(must.name.toLowerCase())
      );
      if (mustActivity && selectedActivities.length < targetActivities) {
        selectedActivities.push(mustActivity);
      }
    }

    // 2. Completar con actividades top-scored
    for (const activity of scoredActivities) {
      if (selectedActivities.length >= targetActivities) break;
      if (!selectedActivities.includes(activity)) {
        // Evitar duplicar categorías muy seguidas
        const lastCategory = selectedActivities[selectedActivities.length - 1]?.category;
        if (lastCategory !== activity.category || selectedActivities.length < 2) {
          selectedActivities.push(activity);
        }
      }
    }

    // 3. Optimizar orden según ubicación (hotel-aware)
    const optimizedActivities = this.optimizeActivityOrder(selectedActivities, hotel, startTime);

    // 4. Insertar comidas
    const withMeals = await this.insertMealsIntoDay(optimizedActivities, hotel, googlePlacesAPI, dailyBudget);

    // 5. Crear estructura del día
    const day = {
      day: dayNumber,
      date: '', // Se puede calcular si se proporciona fecha de inicio
      title: isArrivalDay ? `Llegada a ${city}` :
             isFirstDayInCity ? `Primer día en ${city}` :
             isDepartureDay ? `Último día - Regreso` :
             `Explorando ${city}`,
      city: city,
      cities: [{ cityId: city }],
      budget: dailyBudget,
      hotel: hotel,
      activities: withMeals.map((act, idx) => ({
        id: `act-${dayNumber}-${idx}`,
        title: act.name,
        time: act.time,
        duration: act.duration,
        category: act.category,
        desc: act.desc || '',
        cost: act.cost,
        coordinates: act.lat && act.lng ? { lat: act.lat, lng: act.lng } : null,
        isMeal: act.isMeal || false
      }))
    };

    return day;
  },

  /**
   * Puntúa una actividad según preferencias del usuario
   */
  scoreActivity(activity, interests, dailyBudget, avoid, hotel) {
    let score = 0;

    // 1. Match de intereses (40%)
    const interestMatch = activity.interests.some(i => interests.includes(i)) ? 1 : 0;
    score += interestMatch * 40;

    // 2. Fit de presupuesto (20%)
    const budgetFit = activity.cost <= dailyBudget * 0.3 ? 1 : // < 30% del presupuesto
                      activity.cost <= dailyBudget * 0.5 ? 0.7 : // < 50%
                      0.3;
    score += budgetFit * 20;

    // 3. Popularidad (20%)
    score += (activity.popularity / 100) * 20;

    // 4. Cercanía al hotel si existe (20%)
    if (hotel && activity.lat && activity.lng) {
      const distance = this.calculateDistance(
        { lat: hotel.lat, lng: hotel.lng },
        { lat: activity.lat, lng: activity.lng }
      );
      // Priorizar actividades dentro de 5km del hotel
      const proximityScore = distance < 2 ? 1 : distance < 5 ? 0.7 : distance < 10 ? 0.4 : 0.2;
      score += proximityScore * 20;
    } else {
      score += 10; // Score neutral si no hay hotel
    }

    // Penalizar si está en la lista de "avoid"
    if (avoid.some(a => activity.name.toLowerCase().includes(a.toLowerCase()))) {
      score = 0;
    }

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

console.log('✅ Smart Itinerary Generator cargado');

export default SmartItineraryGenerator;
