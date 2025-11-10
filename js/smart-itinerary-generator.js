// js/smart-itinerary-generator.js - Smart Complete Itinerary Generator
// Sistema inteligente que genera itinerarios completos basados en preferencias del usuario

/**
 * Base de datos de actividades populares por ciudad
 */
const ACTIVITY_DATABASE = {
  tokyo: [
    // Templos & Cultura
    { name: 'Senso-ji Temple', category: 'cultural', lat: 35.7148, lng: 139.7967, duration: 90, cost: 0, interests: ['cultural', 'history'], area: 'Asakusa', popularity: 95 },
    { name: 'Meiji Shrine', category: 'cultural', lat: 35.6764, lng: 139.6993, duration: 90, cost: 0, interests: ['cultural', 'nature'], area: 'Harajuku', popularity: 90 },
    { name: 'Tokyo Skytree', category: 'attraction', lat: 35.7101, lng: 139.8107, duration: 120, cost: 2100, interests: ['sightseeing'], area: 'Sumida', popularity: 85 },
    { name: 'Tokyo Tower', category: 'attraction', lat: 35.6586, lng: 139.7454, duration: 90, cost: 1200, interests: ['sightseeing'], area: 'Minato', popularity: 80 },

    // Shopping & Entretenimiento
    { name: 'Shibuya Crossing', category: 'attraction', lat: 35.6595, lng: 139.7004, duration: 60, cost: 0, interests: ['urban', 'photography'], area: 'Shibuya', popularity: 90 },
    { name: 'Akihabara Electric Town', category: 'shopping', lat: 35.7022, lng: 139.7745, duration: 120, cost: 5000, interests: ['anime', 'shopping', 'technology'], area: 'Akihabara', popularity: 85 },
    { name: 'Harajuku Takeshita Street', category: 'shopping', lat: 35.6702, lng: 139.7027, duration: 90, cost: 3000, interests: ['shopping', 'fashion', 'food'], area: 'Harajuku', popularity: 85 },
    { name: 'Shinjuku Golden Gai', category: 'nightlife', lat: 35.6938, lng: 139.7053, duration: 120, cost: 4000, interests: ['nightlife', 'culture'], area: 'Shinjuku', popularity: 70 },

    // Museos & Arte
    { name: 'teamLab Borderless', category: 'museum', lat: 35.6248, lng: 139.7753, duration: 150, cost: 3200, interests: ['art', 'technology'], area: 'Odaiba', popularity: 90 },
    { name: 'Tokyo National Museum', category: 'museum', lat: 35.7188, lng: 139.7764, duration: 120, cost: 1000, interests: ['history', 'art'], area: 'Ueno', popularity: 75 },

    // Naturaleza & Parques
    { name: 'Ueno Park', category: 'nature', lat: 35.7151, lng: 139.7738, duration: 90, cost: 0, interests: ['nature', 'relax'], area: 'Ueno', popularity: 80 },
    { name: 'Shinjuku Gyoen', category: 'nature', lat: 35.6852, lng: 139.7100, duration: 120, cost: 500, interests: ['nature', 'relax'], area: 'Shinjuku', popularity: 85 },

    // Gastronomía
    { name: 'Tsukiji Outer Market', category: 'food', lat: 35.6654, lng: 139.7707, duration: 120, cost: 3000, interests: ['food', 'market'], area: 'Tsukiji', popularity: 90 },
    { name: 'Ramen Street Tokyo Station', category: 'food', lat: 35.6812, lng: 139.7671, duration: 60, cost: 1000, interests: ['food'], area: 'Tokyo Station', popularity: 80 }
  ],

  kyoto: [
    // Templos & Cultura
    { name: 'Fushimi Inari Shrine', category: 'cultural', lat: 34.9671, lng: 135.7727, duration: 120, cost: 0, interests: ['cultural', 'nature', 'photography'], area: 'Fushimi', popularity: 95 },
    { name: 'Kinkaku-ji (Golden Pavilion)', category: 'cultural', lat: 35.0394, lng: 135.7292, duration: 90, cost: 400, interests: ['cultural', 'photography'], area: 'Kita', popularity: 95 },
    { name: 'Kiyomizu-dera', category: 'cultural', lat: 34.9949, lng: 135.7850, duration: 120, cost: 400, interests: ['cultural', 'history'], area: 'Higashiyama', popularity: 90 },
    { name: 'Arashiyama Bamboo Grove', category: 'nature', lat: 35.0170, lng: 135.6717, duration: 90, cost: 0, interests: ['nature', 'photography'], area: 'Arashiyama', popularity: 90 },
    { name: 'Gion District', category: 'cultural', lat: 35.0036, lng: 135.7751, duration: 90, cost: 0, interests: ['cultural', 'history', 'photography'], area: 'Gion', popularity: 85 },

    // Shopping & Entretenimiento
    { name: 'Nishiki Market', category: 'shopping', lat: 35.0051, lng: 135.7638, duration: 90, cost: 2000, interests: ['food', 'shopping'], area: 'Nakagyo', popularity: 85 },
    { name: 'Pontocho Alley', category: 'nightlife', lat: 35.0041, lng: 135.7706, duration: 120, cost: 5000, interests: ['food', 'culture', 'nightlife'], area: 'Pontocho', popularity: 75 },

    // Naturaleza
    { name: 'Philosopher\'s Path', category: 'nature', lat: 35.0262, lng: 135.7949, duration: 90, cost: 0, interests: ['nature', 'relax', 'photography'], area: 'Sakyo', popularity: 80 }
  ],

  osaka: [
    // Atracciones
    { name: 'Osaka Castle', category: 'cultural', lat: 34.6873, lng: 135.5262, duration: 120, cost: 600, interests: ['history', 'cultural'], area: 'Chuo', popularity: 90 },
    { name: 'Dotonbori', category: 'attraction', lat: 34.6686, lng: 135.5004, duration: 120, cost: 3000, interests: ['food', 'nightlife', 'photography'], area: 'Namba', popularity: 95 },
    { name: 'Shinsekai', category: 'attraction', lat: 34.6525, lng: 135.5063, duration: 90, cost: 2000, interests: ['food', 'culture'], area: 'Naniwa', popularity: 75 },
    { name: 'Umeda Sky Building', category: 'attraction', lat: 34.7053, lng: 135.4903, duration: 90, cost: 1500, interests: ['sightseeing'], area: 'Umeda', popularity: 80 },

    // Shopping
    { name: 'Shinsaibashi Shopping Street', category: 'shopping', lat: 34.6724, lng: 135.5010, duration: 120, cost: 5000, interests: ['shopping'], area: 'Shinsaibashi', popularity: 85 },

    // Gastronomía
    { name: 'Kuromon Market', category: 'food', lat: 34.6659, lng: 135.5064, duration: 90, cost: 2500, interests: ['food', 'market'], area: 'Namba', popularity: 85 }
  ]
};

/**
 * Smart Itinerary Generator
 */
export const SmartItineraryGenerator = {

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
   * Optimiza el orden de actividades considerando el hotel como punto de partida
   */
  optimizeActivityOrder(activities, hotel, startTime) {
    if (!hotel || activities.length === 0) {
      return activities;
    }

    // Encontrar actividad más cercana al hotel para empezar
    const withDistances = activities.map(act => ({
      ...act,
      distanceFromHotel: this.calculateDistance(
        { lat: hotel.lat, lng: hotel.lng },
        { lat: act.lat, lng: act.lng }
      )
    }));

    // Ordenar: primero la más cercana al hotel, luego optimizar ruta
    withDistances.sort((a, b) => a.distanceFromHotel - b.distanceFromHotel);

    // Asignar horarios
    let currentTime = startTime * 60; // En minutos desde medianoche

    return withDistances.map((act, idx) => {
      const actWithTime = {
        ...act,
        time: this.formatTime(currentTime)
      };

      // Avanzar tiempo: duración + 30min de transporte entre actividades
      currentTime += act.duration + (idx < withDistances.length - 1 ? 30 : 0);

      return actWithTime;
    });
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
