/**
 * 🔍 AI INSIGHTS ENGINE
 * ======================
 *
 * Deep analysis of itineraries to provide valuable insights
 * Goes beyond simple recommendations to understand patterns and provide strategic advice
 */

class AIInsights {
  constructor() {
    this.initialized = false;
    this.insights = [];
    this.travelPatterns = {};
    this.knowledgeBase = this.buildKnowledgeBase();
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🔍 AI Insights initializing...');

    this.initialized = true;
    console.log('✅ AI Insights ready');
  }

  /**
   * Build knowledge base about Japan travel
   */
  buildKnowledgeBase() {
    return {
      // City characteristics
      cities: {
        tokyo: {
          pace: 'fast',
          idealDays: [3, 5],
          mustSee: ['shibuya crossing', 'senso-ji', 'tokyo tower', 'meiji jingu'],
          neighborhoods: ['shibuya', 'shinjuku', 'harajuku', 'asakusa', 'akihabara'],
          character: 'modern, energetic, technology, fashion'
        },
        kyoto: {
          pace: 'moderate',
          idealDays: [2, 4],
          mustSee: ['fushimi inari', 'kinkaku-ji', 'arashiyama', 'gion'],
          neighborhoods: ['gion', 'arashiyama', 'higashiyama'],
          character: 'traditional, temples, gardens, culture'
        },
        osaka: {
          pace: 'moderate',
          idealDays: [1, 2],
          mustSee: ['dotonbori', 'osaka castle', 'universal studios'],
          neighborhoods: ['dotonbori', 'namba', 'umeda'],
          character: 'food, street life, friendly, energetic'
        },
        nara: {
          pace: 'slow',
          idealDays: [1, 1],
          mustSee: ['todai-ji', 'nara park', 'kasuga taisha'],
          character: 'peaceful, deer, temples, nature'
        }
      },

      // Activity characteristics
      activities: {
        temple: {
          timeNeeded: 60,
          bestTime: 'morning',
          energy: 'low',
          crowd: 'varies'
        },
        restaurant: {
          timeNeeded: 60,
          bestTime: 'lunch|dinner',
          energy: 'low',
          crowd: 'high'
        },
        attraction: {
          timeNeeded: 120,
          bestTime: 'flexible',
          energy: 'medium',
          crowd: 'high'
        },
        shopping: {
          timeNeeded: 90,
          bestTime: 'afternoon',
          energy: 'medium',
          crowd: 'high'
        },
        nature: {
          timeNeeded: 180,
          bestTime: 'morning',
          energy: 'high',
          crowd: 'low'
        }
      },

      // Travel wisdom
      wisdom: {
        pacing: 'Japanese trips work best with a mix of busy and relaxed days',
        timing: 'Start early to beat crowds at major attractions',
        food: 'Reserve popular restaurants in advance, especially for kaiseki',
        transport: 'JR Pass is worth it for 7+ days with intercity travel',
        culture: 'Visit at least one traditional area and one modern area',
        seasonal: 'Cherry blossoms (March-April) and fall foliage (Nov) are peak seasons'
      }
    };
  }

  /**
   * Generate comprehensive insights
   */
  async analyze() {
    if (!this.initialized) await this.initialize();

    const itinerary = this.getCurrentItinerary();

    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
      return {
        insights: [],
        summary: 'No hay itinerario para analizar'
      };
    }

    this.insights = [];

    // Run all analysis
    this.analyzeTripStructure(itinerary);
    this.analyzePacing(itinerary);
    this.analyzeCityDistribution(itinerary);
    this.analyzeActivityBalance(itinerary);
    this.analyzeTiming(itinerary);
    this.analyzeTransportNeeds(itinerary);
    this.analyzeBudgetImplications(itinerary);
    this.analyzeSeasonalConsiderations(itinerary);
    this.analyzeCulturalBalance(itinerary);

    // Sort by importance
    this.insights.sort((a, b) => b.importance - a.importance);

    return {
      insights: this.insights,
      summary: this.generateSummary(),
      travelPatterns: this.travelPatterns
    };
  }

  /**
   * Analyze overall trip structure
   */
  analyzeTripStructure(itinerary) {
    const totalDays = itinerary.days.length;
    const citiesVisited = this.extractCities(itinerary);

    // Check if trip length is appropriate
    if (totalDays < 7) {
      this.insights.push({
        type: 'structure',
        importance: 8,
        title: 'Viaje corto',
        message: `Tu viaje de ${totalDays} días es corto. Considera enfocarte en 1-2 ciudades para disfrutar mejor sin prisas.`,
        suggestion: 'Reduce el número de ciudades o extiende el viaje',
        icon: '🗓️'
      });
    }

    // Check cities-to-days ratio
    const daysPerCity = totalDays / citiesVisited.length;
    if (daysPerCity < 2 && citiesVisited.length > 1) {
      this.insights.push({
        type: 'structure',
        importance: 9,
        title: 'Demasiadas ciudades',
        message: `Visitarás ${citiesVisited.length} ciudades en ${totalDays} días (${daysPerCity.toFixed(1)} días/ciudad). Esto puede ser apresurado.`,
        suggestion: 'Considera reducir ciudades o agregar más días',
        icon: '⚡'
      });
    }

    this.travelPatterns.structure = {
      totalDays,
      citiesVisited,
      daysPerCity
    };
  }

  /**
   * Analyze pacing
   */
  analyzePacing(itinerary) {
    const activitiesPerDay = itinerary.days.map(d => d.activities?.length || 0);
    const average = activitiesPerDay.reduce((a, b) => a + b, 0) / activitiesPerDay.length;
    const max = Math.max(...activitiesPerDay);
    const min = Math.min(...activitiesPerDay);

    // Check for overload
    if (average > 6) {
      this.insights.push({
        type: 'pacing',
        importance: 8,
        title: 'Ritmo muy intenso',
        message: `Promedio de ${average.toFixed(1)} actividades/día. Esto puede ser agotador con el jetlag y caminar mucho.`,
        suggestion: 'Reduce a 4-5 actividades/día para disfrutar más',
        icon: '🏃'
      });
    }

    // Check for imbalance
    if (max - min >= 5) {
      this.insights.push({
        type: 'pacing',
        importance: 7,
        title: 'Ritmo desbalanceado',
        message: `Tienes días con ${max} actividades y otros con ${min}. Intenta distribuir mejor.`,
        suggestion: 'Balancea las actividades entre días',
        icon: '⚖️'
      });
    }

    // Suggest rest days
    if (itinerary.days.length >= 7 && !activitiesPerDay.some(a => a <= 2)) {
      this.insights.push({
        type: 'pacing',
        importance: 6,
        title: 'Falta día de descanso',
        message: 'En un viaje de 7+ días, es bueno tener al menos un día más relajado.',
        suggestion: 'Agrega un "día ligero" con 2-3 actividades máximo',
        icon: '🛋️'
      });
    }

    this.travelPatterns.pacing = {
      average,
      max,
      min,
      variation: max - min
    };
  }

  /**
   * Analyze city distribution
   */
  analyzeCityDistribution(itinerary) {
    const cities = {};
    itinerary.days.forEach(day => {
      day.activities?.forEach(activity => {
        const city = this.detectCity(activity);
        cities[city] = (cities[city] || 0) + 1;
      });
    });

    // Check if visiting recommended cities
    if (!cities.tokyo && !cities.kyoto) {
      this.insights.push({
        type: 'cities',
        importance: 9,
        title: 'Ciudades esenciales faltantes',
        message: 'No veo Tokyo ni Kyoto en tu itinerario. Son las ciudades más icónicas de Japón.',
        suggestion: 'Considera agregar al menos una de estas ciudades',
        icon: '🏙️'
      });
    }

    // Check for good classic-modern balance
    const hasTraditional = cities.kyoto || cities.nara;
    const hasModern = cities.tokyo || cities.osaka;

    if (!hasTraditional || !hasModern) {
      this.insights.push({
        type: 'cities',
        importance: 7,
        title: 'Balance tradicional-moderno',
        message: hasTraditional
          ? 'Tu viaje es muy tradicional. Agrega una ciudad moderna como Tokyo.'
          : 'Tu viaje es muy moderno. Agrega una ciudad tradicional como Kyoto.',
        suggestion: 'Balancea entre Japón tradicional y moderno',
        icon: '🎎'
      });
    }

    this.travelPatterns.cities = cities;
  }

  /**
   * Analyze activity balance
   */
  analyzeActivityBalance(itinerary) {
    const categories = {};
    let totalActivities = 0;

    itinerary.days.forEach(day => {
      day.activities?.forEach(activity => {
        const cat = activity.category || 'other';
        categories[cat] = (categories[cat] || 0) + 1;
        totalActivities++;
      });
    });

    // Check for missing categories
    if (!categories.temple && !categories.shrine) {
      this.insights.push({
        type: 'balance',
        importance: 8,
        title: 'Sin templos/santuarios',
        message: 'No tienes templos o santuarios. Son una parte esencial de la experiencia japonesa.',
        suggestion: 'Agrega al menos 2-3 templos famosos',
        icon: '⛩️'
      });
    }

    if (!categories.restaurant && !categories.food) {
      this.insights.push({
        type: 'balance',
        importance: 7,
        title: 'Sin experiencias gastronómicas',
        message: 'La comida es fundamental en Japón. No veo restaurantes planificados.',
        suggestion: 'Planifica al menos 3-4 experiencias gastronómicas',
        icon: '🍜'
      });
    }

    // Check for overemphasis
    for (const [category, count] of Object.entries(categories)) {
      const percentage = (count / totalActivities) * 100;
      if (percentage > 40) {
        this.insights.push({
          type: 'balance',
          importance: 6,
          title: `Mucho énfasis en ${category}`,
          message: `${percentage.toFixed(0)}% de tus actividades son de tipo "${category}".`,
          suggestion: 'Agrega más variedad a tu itinerario',
          icon: '🎨'
        });
      }
    }

    this.travelPatterns.categories = categories;
  }

  /**
   * Analyze timing considerations
   */
  analyzeTiming(itinerary) {
    // Check if activities have time information
    const hasTimeInfo = itinerary.days.some(day =>
      day.activities?.some(a => a.time || a.startTime)
    );

    if (!hasTimeInfo) {
      this.insights.push({
        type: 'timing',
        importance: 7,
        title: 'Falta información de horarios',
        message: 'No tienes horarios asignados a las actividades. Esto puede causar problemas de logística.',
        suggestion: 'Agrega horarios aproximados para mejor organización',
        icon: '⏰'
      });
    }

    // Check for jetlag day
    const firstDay = itinerary.days[0];
    if (firstDay && firstDay.activities && firstDay.activities.length > 4) {
      this.insights.push({
        type: 'timing',
        importance: 8,
        title: 'Primer día sobrecargado',
        message: `El primer día tiene ${firstDay.activities.length} actividades. Considera el jetlag y cansancio del viaje.`,
        suggestion: 'Reduce el primer día a 2-3 actividades ligeras',
        icon: '✈️'
      });
    }
  }

  /**
   * Analyze transport needs
   */
  analyzeTransportNeeds(itinerary) {
    const cities = this.extractCities(itinerary);
    const intercityTravel = cities.length > 1;

    if (intercityTravel && itinerary.days.length >= 7) {
      this.insights.push({
        type: 'transport',
        importance: 9,
        title: 'JR Pass recomendado',
        message: `Viajarás entre ${cities.length} ciudades en ${itinerary.days.length} días. El JR Pass probablemente valga la pena.`,
        suggestion: 'Calcula si el JR Pass (7 días: ~¥29,650) te conviene',
        icon: '🚄'
      });
    }

    // Check for efficient routing
    const routeEfficiency = this.analyzeRouteEfficiency(cities);
    if (!routeEfficiency.efficient) {
      this.insights.push({
        type: 'transport',
        importance: 8,
        title: 'Ruta ineficiente',
        message: routeEfficiency.message,
        suggestion: routeEfficiency.suggestion,
        icon: '🗺️'
      });
    }
  }

  /**
   * Analyze budget implications
   */
  analyzeBudgetImplications(itinerary) {
    let estimatedCost = 0;
    let activitiesCounted = 0;

    // Rough cost estimation
    itinerary.days.forEach(day => {
      // Basic daily cost (food, local transport, misc)
      estimatedCost += 8000; // ~¥8,000/day base

      day.activities?.forEach(activity => {
        const category = activity.category || 'attraction';
        const costs = {
          temple: 500,
          shrine: 300,
          attraction: 2000,
          restaurant: 2000,
          shopping: 5000,
          museum: 1500
        };

        estimatedCost += costs[category] || 1000;
        activitiesCounted++;
      });
    });

    // Add intercity transport estimate
    const cities = this.extractCities(itinerary);
    if (cities.length > 1) {
      estimatedCost += (cities.length - 1) * 13000; // ~¥13,000 per intercity trip
    }

    this.insights.push({
      type: 'budget',
      importance: 7,
      title: 'Estimación de presupuesto',
      message: `Estimación aproximada: ¥${estimatedCost.toLocaleString()} (~$${Math.round(estimatedCost / 150)} USD) sin hotel ni vuelo.`,
      suggestion: 'Considera reservar con anticipación para mejores precios',
      icon: '💰'
    });

    this.travelPatterns.estimatedCost = estimatedCost;
  }

  /**
   * Analyze seasonal considerations
   */
  analyzeSeasonalConsiderations(itinerary) {
    const firstDay = itinerary.days[0];
    if (!firstDay || !firstDay.date) return;

    const date = new Date(firstDay.date);
    const month = date.getMonth() + 1;

    const seasonalAdvice = {
      3: {
        season: 'Primavera (Sakura)',
        message: 'Viajas en temporada de cerezos. Reserva con mucha anticipación y espera multitudes.',
        icon: '🌸'
      },
      4: {
        season: 'Primavera (Sakura)',
        message: 'Temporada de cerezos. Los parques estarán preciosos pero muy llenos.',
        icon: '🌸'
      },
      7: {
        season: 'Verano',
        message: 'Viajas en verano. Prepárate para calor y humedad intensa. Hidratación es clave.',
        icon: '☀️'
      },
      8: {
        season: 'Verano',
        message: 'Agosto es muy caluroso y húmedo. Considera actividades indoor y lleva toalla.',
        icon: '🌡️'
      },
      11: {
        season: 'Otoño (Momiji)',
        message: 'Temporada de follaje otoñal. Los templos de Kyoto estarán espectaculares.',
        icon: '🍁'
      },
      12: {
        season: 'Invierno',
        message: 'Invierno en Japón. Hace frío pero menos turistas. Excelente para onsen.',
        icon: '❄️'
      }
    };

    const advice = seasonalAdvice[month];
    if (advice) {
      this.insights.push({
        type: 'seasonal',
        importance: 6,
        title: advice.season,
        message: advice.message,
        suggestion: 'Planifica según el clima y temporada',
        icon: advice.icon
      });
    }
  }

  /**
   * Analyze cultural balance
   */
  analyzeCulturalBalance(itinerary) {
    let hasTraditionalExperience = false;
    let hasModernExperience = false;
    let hasFoodExperience = false;
    let hasNatureExperience = false;

    itinerary.days.forEach(day => {
      day.activities?.forEach(activity => {
        const name = (activity.name || '').toLowerCase();
        const category = (activity.category || '').toLowerCase();

        if (category.includes('temple') || category.includes('shrine') || name.includes('temple') || name.includes('shrine')) {
          hasTraditionalExperience = true;
        }

        if (name.includes('tokyo') || name.includes('shibuya') || name.includes('akihabara')) {
          hasModernExperience = true;
        }

        if (category.includes('restaurant') || category.includes('food') || name.includes('market')) {
          hasFoodExperience = true;
        }

        if (category.includes('nature') || name.includes('park') || name.includes('garden') || name.includes('mountain')) {
          hasNatureExperience = true;
        }
      });
    });

    const experiences = [
      { has: hasTraditionalExperience, name: 'tradicional', icon: '⛩️' },
      { has: hasModernExperience, name: 'moderno', icon: '🏙️' },
      { has: hasFoodExperience, name: 'gastronómico', icon: '🍜' },
      { has: hasNatureExperience, name: 'natural', icon: '🌳' }
    ];

    const missing = experiences.filter(e => !e.has);

    if (missing.length > 0) {
      this.insights.push({
        type: 'cultural',
        importance: 7,
        title: 'Experiencias faltantes',
        message: `Te faltan experiencias: ${missing.map(m => m.name).join(', ')}. Un viaje completo incluye los 4 aspectos.`,
        suggestion: `Agrega actividades de tipo: ${missing.map(m => m.icon + ' ' + m.name).join(', ')}`,
        icon: '🎌'
      });
    }
  }

  /**
   * Helper: Extract cities from itinerary
   */
  extractCities(itinerary) {
    const cities = new Set();

    itinerary.days.forEach(day => {
      day.activities?.forEach(activity => {
        const city = this.detectCity(activity);
        cities.add(city);
      });
    });

    return Array.from(cities);
  }

  /**
   * Helper: Detect city from activity
   */
  detectCity(activity) {
    const name = (activity.name || '').toLowerCase();
    const location = (activity.location || '').toLowerCase();
    const text = name + ' ' + location;

    if (text.includes('tokyo') || text.includes('shibuya') || text.includes('shinjuku') || text.includes('asakusa')) {
      return 'tokyo';
    }
    if (text.includes('kyoto') || text.includes('gion') || text.includes('arashiyama')) {
      return 'kyoto';
    }
    if (text.includes('osaka') || text.includes('dotonbori') || text.includes('namba')) {
      return 'osaka';
    }
    if (text.includes('nara')) {
      return 'nara';
    }

    return 'unknown';
  }

  /**
   * Helper: Analyze route efficiency
   */
  analyzeRouteEfficiency(cities) {
    const optimalRoutes = {
      'tokyo-kyoto-osaka': { efficient: true },
      'tokyo-osaka-kyoto': { efficient: false, message: 'Kyoto está entre Tokyo y Osaka', suggestion: 'Cambia el orden a Tokyo → Kyoto → Osaka' },
      'kyoto-tokyo-osaka': { efficient: false, message: 'Volver de Tokyo a Osaka no es eficiente', suggestion: 'Reorganiza: Tokyo → Kyoto → Osaka' }
    };

    const route = cities.join('-');
    return optimalRoutes[route] || { efficient: true };
  }

  /**
   * Generate summary
   */
  generateSummary() {
    const highPriority = this.insights.filter(i => i.importance >= 8);
    const mediumPriority = this.insights.filter(i => i.importance >= 5 && i.importance < 8);

    return {
      total: this.insights.length,
      critical: highPriority.length,
      important: mediumPriority.length,
      overview: highPriority.length > 0
        ? `Hay ${highPriority.length} aspectos críticos que deberías revisar.`
        : 'Tu itinerario está bien estructurado en general.'
    };
  }

  /**
   * Get current itinerary
   */
  getCurrentItinerary() {
    if (window.currentItinerary && window.currentItinerary.days) {
      return window.currentItinerary;
    }

    if (window.TripsManager && window.TripsManager.currentTrip) {
      return window.TripsManager.currentTrip;
    }

    if (window.ItineraryManager && window.ItineraryManager.getCurrentItinerary) {
      return window.ItineraryManager.getCurrentItinerary();
    }

    return null;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.AIInsights = new AIInsights();
  console.log('🔍 AI Insights loaded!');
}
