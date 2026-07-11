/**
 * 📍 LIVE MODE - "I'm in Japan Now"
 * ===================================
 *
 * Real-time assistance when in Japan:
 * - Geolocation detection
 * - Nearby recommendations (Foursquare, via APIsIntegration)
 * - Context-aware suggestions
 * - Emergency assistance
 * - Offline mode
 * - Quick phrases
 * - Local services (ATM, konbini, pharmacy)
 */

import { APIsIntegration } from '../../api/apis-integration.js';

class LiveMode {
  constructor() {
    this.initialized = false;
    this.isInJapan = false;
    this.currentLocation = null;
    this.watchId = null;
    this.nearbyPlaces = [];

    // Japan boundaries (approximate)
    this.japanBounds = {
      north: 45.5,
      south: 24,
      east: 154,
      west: 122
    };

    console.log('📍 Live Mode System initialized');
  }

  /**
   * Initialize live mode
   */
  async init() {
    if (this.initialized) return;

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('❌ Geolocation not supported');
      return;
    }

    // Request location permission
    try {
      await this.getCurrentPosition();
      this.initialized = true;
      console.log('✅ Live Mode initialized');
    } catch (error) {
      console.error('❌ Location permission denied:', error);
    }
  }

  /**
   * Get current position
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          // Check if in Japan
          this.isInJapan = this.checkIfInJapan(
            this.currentLocation.lat,
            this.currentLocation.lng
          );

          console.log('📍 Current location:', this.currentLocation);
          console.log('🇯🇵 In Japan:', this.isInJapan);

          resolve(this.currentLocation);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // Cache for 1 minute
        }
      );
    });
  }

  /**
   * Check if coordinates are in Japan
   */
  checkIfInJapan(lat, lng) {
    return (
      lat >= this.japanBounds.south &&
      lat <= this.japanBounds.north &&
      lng >= this.japanBounds.west &&
      lng <= this.japanBounds.east
    );
  }

  /**
   * Start watching position
   */
  startWatching() {
    if (!navigator.geolocation) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        this.isInJapan = this.checkIfInJapan(
          this.currentLocation.lat,
          this.currentLocation.lng
        );

        console.log('📍 Location updated:', this.currentLocation);
      },
      (error) => {
        console.error('❌ Watch position error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }

  /**
   * Stop watching position
   */
  stopWatching() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('⏹️ Stopped watching position');
    }
  }

  /**
   * Formatea una distancia en metros (la que devuelve Foursquare) para mostrarla
   */
  formatDistance(meters) {
    if (meters === null || meters === undefined || isNaN(meters)) return '';
    return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
  }

  /**
   * Get nearby recommendations (llamadas reales a Foursquare vía APIsIntegration,
   * usando la ubicación GPS actual - antes esto devolvía listas fijas por ciudad)
   */
  async getNearbyRecommendations() {
    if (!this.currentLocation) {
      return {
        error: 'Location not available'
      };
    }

    // Determine city/area based on coordinates (solo para mostrar el nombre del área)
    const area = this.detectArea(this.currentLocation.lat, this.currentLocation.lng);

    const [restaurants, attractions, services] = await Promise.all([
      this.getNearbyRestaurants(),
      this.getNearbyAttractions(),
      this.getNearbyServices()
    ]);

    return {
      area: area,
      restaurants,
      attractions,
      services,
      tips: this.getContextualTips(area)
    };
  }

  /**
   * Detect area/city from coordinates
   */
  detectArea(lat, lng) {
    // Tokyo regions
    if (lat >= 35.5 && lat <= 35.9 && lng >= 139.5 && lng <= 139.9) {
      // Specific Tokyo areas
      if (lat >= 35.65 && lat <= 35.68 && lng >= 139.69 && lng <= 139.71) {
        return 'Shibuya';
      } else if (lat >= 35.68 && lat <= 35.71 && lng >= 139.69 && lng <= 139.72) {
        return 'Shinjuku';
      } else if (lat >= 35.71 && lat <= 35.73 && lng >= 139.79 && lng <= 139.81) {
        return 'Asakusa';
      } else if (lat >= 35.66 && lat <= 35.68 && lng >= 139.76 && lng <= 139.78) {
        return 'Ginza';
      } else if (lat >= 35.70 && lat <= 35.72 && lng >= 139.77 && lng <= 139.79) {
        return 'Akihabara';
      } else {
        return 'Tokyo';
      }
    }

    // Kyoto
    if (lat >= 34.9 && lat <= 35.1 && lng >= 135.7 && lng <= 135.8) {
      return 'Kyoto';
    }

    // Osaka
    if (lat >= 34.6 && lat <= 34.8 && lng >= 135.4 && lng <= 135.6) {
      return 'Osaka';
    }

    // Hokkaido
    if (lat >= 42 && lat <= 45 && lng >= 140 && lng <= 145) {
      return 'Hokkaido';
    }

    return 'Japan';
  }

  /**
   * Get nearby restaurants (Foursquare, radio 1.5km alrededor de la posición actual)
   */
  async getNearbyRestaurants() {
    const { lat, lng } = this.currentLocation;
    const result = await APIsIntegration.searchNearbyPlaces(lat, lng, 'restaurant', 1500);
    if (!result.success) return [];

    return result.places.slice(0, 6).map(place => ({
      name: place.name,
      type: place.category,
      distance: this.formatDistance(place.distance),
      rating: place.rating || null,
      lat: place.lat,
      lng: place.lng
    }));
  }

  /**
   * Get nearby attractions (Foursquare, radio 3km)
   */
  async getNearbyAttractions() {
    const { lat, lng } = this.currentLocation;
    const result = await APIsIntegration.searchNearbyPlaces(lat, lng, 'attraction', 3000);
    if (!result.success) return [];

    return result.places.slice(0, 6).map(place => ({
      name: place.name,
      type: place.category,
      distance: this.formatDistance(place.distance),
      lat: place.lat,
      lng: place.lng
    }));
  }

  /**
   * Get nearby services: konbini, farmacia, ATM (Foursquare, radio 800m)
   */
  async getNearbyServices() {
    const { lat, lng } = this.currentLocation;
    const categories = [
      { category: 'convenience_store', type: 'Konbini' },
      { category: 'pharmacy', type: 'Pharmacy' },
      { category: 'atm', type: 'ATM' }
    ];

    const results = await Promise.all(
      categories.map(({ category }) => APIsIntegration.searchNearbyPlaces(lat, lng, category, 800))
    );

    const services = results.flatMap((result, i) =>
      result.success
        ? result.places.slice(0, 3).map(place => ({
            name: place.name,
            type: categories[i].type,
            distanceMeters: place.distance ?? Infinity,
            distance: this.formatDistance(place.distance),
            lat: place.lat,
            lng: place.lng
          }))
        : []
    );

    return services
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .map(({ distanceMeters, ...service }) => service);
  }

  /**
   * Get contextual tips based on area
   */
  getContextualTips(area) {
    const tips = {
      Shibuya: [
        'Best view of crossing: Starbucks 2nd floor',
        'Avoid rush hour (5-7pm) if possible',
        'Free WiFi at Shibuya Station'
      ],
      Shinjuku: [
        'Tokyo Metropolitan Building observatory is FREE',
        'Omoide Yokocho gets crowded after 7pm',
        'Shinjuku Station has 200+ exits - use Google Maps'
      ],
      Asakusa: [
        'Visit Sensoji early morning (6am) to avoid crowds',
        'Nakamise street best for souvenirs',
        'Tokyo Skytree visible from here'
      ],
      Kyoto: [
        'Buses are better than trains in Kyoto',
        'Buy Kyoto bus day pass (¥700)',
        'Temples close early (5pm) - go morning'
      ],
      Osaka: [
        'Try both takoyaki AND okonomiyaki',
        'Dotonbori best at night (neon lights)',
        'Osaka Castle closes at 5pm'
      ]
    };

    return tips[area] || [
      'Download offline maps before traveling',
      'Konbinis have ATMs that accept foreign cards',
      'Free WiFi at most train stations'
    ];
  }

  /**
   * Get emergency contacts
   */
  getEmergencyContacts() {
    return {
      police: {
        number: '110',
        description: 'Police emergency (free call)'
      },
      ambulance: {
        number: '119',
        description: 'Fire/Ambulance (free call)'
      },
      touristHotline: {
        number: '050-3816-2787',
        description: 'Japan Visitor Hotline (English, 24/7)'
      },
      embassy: {
        number: 'Varies by country',
        description: 'Contact your embassy if needed'
      }
    };
  }

  /**
   * Get quick phrases for current situation
   */
  getQuickPhrases() {
    return [
      { japanese: 'すみません', romaji: 'Sumimasen', english: 'Excuse me / Sorry' },
      { japanese: 'トイレはどこですか？', romaji: 'Toire wa doko desu ka?', english: 'Where is the bathroom?' },
      { japanese: 'これをください', romaji: 'Kore wo kudasai', english: 'This one please' },
      { japanese: 'いくらですか？', romaji: 'Ikura desu ka?', english: 'How much?' },
      { japanese: '英語を話せますか？', romaji: 'Eigo wo hanasemasu ka?', english: 'Do you speak English?' },
      { japanese: '助けて！', romaji: 'Tasukete!', english: 'Help!' },
      { japanese: '駅はどこですか？', romaji: 'Eki wa doko desu ka?', english: 'Where is the station?' },
      { japanese: 'お会計お願いします', romaji: 'Okaikei onegaishimasu', english: 'Check please' }
    ];
  }

  /**
   * Check if currently during business hours
   */
  isDuringBusinessHours() {
    const now = new Date();
    const hour = now.getHours();

    return {
      restaurants: hour >= 11 && hour <= 22,
      shops: hour >= 10 && hour <= 20,
      temples: hour >= 6 && hour <= 17,
      convenience: true // Always open
    };
  }

  /**
   * Get weather-based suggestions
   */
  getWeatherSuggestions(weather = 'sunny') {
    const suggestions = {
      sunny: [
        'Perfect for outdoor sightseeing',
        'Visit parks and gardens',
        'Bring sunscreen and hat'
      ],
      rainy: [
        'Great day for museums and indoor attractions',
        'Buy umbrella at konbini (¥500)',
        'Wet pavement = perfect photo reflections'
      ],
      cloudy: [
        'Ideal for photography (soft light)',
        'Good for walking tours',
        'Less crowded at popular spots'
      ],
      hot: [
        'Stay hydrated - buy drinks at vending machines',
        'Seek AC in department stores',
        'Visit temples early morning or late afternoon'
      ],
      cold: [
        'Perfect onsen weather',
        'Try hot ramen or oden',
        'Layer clothing - buildings are heated'
      ]
    };

    return suggestions[weather] || suggestions.sunny;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.LiveMode = new LiveMode();
  console.log('📍 Live Mode System loaded!');
}
