/**
 * 💡 PROACTIVE RECOMMENDATIONS ENGINE
 * ====================================
 *
 * Analyzes the user's itinerary and proactively suggests improvements
 * without waiting for the user to ask
 */

class ProactiveRecommendations {
  constructor() {
    this.initialized = false;
    this.lastAnalysis = null;
    this.suggestions = [];
    this.shownSuggestions = new Set();
  }

  async initialize() {
    if (this.initialized) return;

    console.log('💡 Proactive Recommendations initializing...');

    // Load shown suggestions to avoid repeating
    if (window.MLStorage) {
      const shown = await window.MLStorage.get('shown_suggestions');
      if (shown && Array.isArray(shown)) {
        this.shownSuggestions = new Set(shown);
      }
    }

    this.initialized = true;
    console.log('✅ Proactive Recommendations ready');
  }

  /**
   * Analyze itinerary and generate proactive suggestions
   */
  async analyze() {
    if (!this.initialized) await this.initialize();

    const itinerary = this.getCurrentItinerary();

    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
      return {
        suggestions: [],
        summary: 'No hay itinerario para analizar'
      };
    }

    this.suggestions = [];

    // Run all analysis methods
    this.analyzeEmptyDays(itinerary);
    this.analyzeBalance(itinerary);
    this.analyzeOptimization(itinerary);
    this.analyzeTiming(itinerary);
    this.analyzeVariety(itinerary);
    this.analyzeMissingEssentials(itinerary);

    // Sort by priority
    this.suggestions.sort((a, b) => b.priority - a.priority);

    // Filter out already shown suggestions
    const newSuggestions = this.suggestions.filter(s =>
      !this.shownSuggestions.has(s.id)
    );

    this.lastAnalysis = {
      timestamp: Date.now(),
      totalSuggestions: this.suggestions.length,
      newSuggestions: newSuggestions.length
    };

    return {
      suggestions: newSuggestions.slice(0, 5), // Show top 5
      allSuggestions: this.suggestions,
      analysis: this.lastAnalysis
    };
  }

  /**
   * Check for empty days
   */
  analyzeEmptyDays(itinerary) {
    itinerary.days.forEach((day, index) => {
      if (!day.activities || day.activities.length === 0) {
        this.suggestions.push({
          id: `empty-day-${index}`,
          type: 'empty_day',
          priority: 9,
          title: `El día ${index + 1} está vacío`,
          message: `No tienes actividades planeadas para el día ${index + 1}. ¿Te ayudo a agregar algunas?`,
          action: {
            type: 'recommend_activities',
            day: index + 1
          },
          icon: '📅'
        });
      }
    });
  }

  /**
   * Check for balanced itinerary
   */
  analyzeBalance(itinerary) {
    const categoryCounts = {};
    let totalActivities = 0;

    itinerary.days.forEach(day => {
      day.activities?.forEach(activity => {
        const cat = activity.category || 'other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        totalActivities++;
      });
    });

    // Check if too focused on one category
    for (const [category, count] of Object.entries(categoryCounts)) {
      const percentage = (count / totalActivities) * 100;

      if (percentage > 50) {
        this.suggestions.push({
          id: `balance-${category}`,
          type: 'balance',
          priority: 6,
          title: 'Itinerario desbalanceado',
          message: `Más del 50% de tus actividades son "${category}". ¿Te gustaría agregar más variedad?`,
          action: {
            type: 'add_variety',
            overrepresentedCategory: category
          },
          icon: '⚖️'
        });
      }
    }

    // Check for missing important categories
    const importantCategories = ['temple', 'restaurant', 'attraction'];
    const missingCategories = importantCategories.filter(cat =>
      !categoryCounts[cat] || categoryCounts[cat] === 0
    );

    missingCategories.forEach(category => {
      const messages = {
        temple: '⛩️ No tienes templos en tu itinerario. ¡Los templos son una parte esencial de Japón!',
        restaurant: '🍜 No veo restaurantes planificados. ¡La comida es parte clave de la experiencia!',
        attraction: '🗼 Faltan atracciones principales. ¿Quieres que te recomiende algunas?'
      };

      this.suggestions.push({
        id: `missing-${category}`,
        type: 'missing_category',
        priority: 7,
        title: `Faltan ${category}`,
        message: messages[category],
        action: {
          type: 'add_category',
          category
        },
        icon: '🎯'
      });
    });
  }

  /**
   * Check if route optimization would help
   */
  analyzeOptimization(itinerary) {
    // Check if there are days with enough activities to optimize
    const daysNeedingOptimization = itinerary.days.filter(day =>
      day.activities && day.activities.length >= 3
    );

    if (daysNeedingOptimization.length > 0) {
      this.suggestions.push({
        id: 'optimize-route',
        type: 'optimization',
        priority: 8,
        title: 'Optimiza tu ruta',
        message: `Tienes ${daysNeedingOptimization.length} días con 3+ actividades. Optimizar la ruta podría ahorrarte 2-3 horas.`,
        action: {
          type: 'optimize_route',
          days: daysNeedingOptimization.map((_, i) => i)
        },
        icon: '🗺️'
      });
    }
  }

  /**
   * Check timing and pacing
   */
  analyzeTiming(itinerary) {
    itinerary.days.forEach((day, index) => {
      if (day.activities && day.activities.length > 8) {
        this.suggestions.push({
          id: `overloaded-${index}`,
          type: 'pacing',
          priority: 7,
          title: `Día ${index + 1} sobrecargado`,
          message: `El día ${index + 1} tiene ${day.activities.length} actividades. Esto podría ser agotador. ¿Distribuyo algunas a otros días?`,
          action: {
            type: 'rebalance_day',
            day: index + 1
          },
          icon: '⚠️'
        });
      }

      if (day.activities && day.activities.length <= 2 && itinerary.days.length > 1) {
        this.suggestions.push({
          id: `underutilized-${index}`,
          type: 'pacing',
          priority: 5,
          title: `Día ${index + 1} con pocas actividades`,
          message: `Solo tienes ${day.activities.length} actividades en el día ${index + 1}. ¿Quieres aprovechar más el día?`,
          action: {
            type: 'add_activities',
            day: index + 1
          },
          icon: '📍'
        });
      }
    });
  }

  /**
   * Check for variety within days
   */
  analyzeVariety(itinerary) {
    itinerary.days.forEach((day, index) => {
      if (!day.activities || day.activities.length < 2) return;

      const categories = day.activities.map(a => a.category);
      const uniqueCategories = new Set(categories);

      // If all activities are the same category
      if (uniqueCategories.size === 1 && day.activities.length >= 3) {
        this.suggestions.push({
          id: `monotonous-${index}`,
          type: 'variety',
          priority: 5,
          title: `Día ${index + 1} necesita variedad`,
          message: `Todas las actividades del día ${index + 1} son del mismo tipo. ¿Agregamos algo diferente para balancear?`,
          action: {
            type: 'add_variety_to_day',
            day: index + 1,
            avoidCategory: Array.from(uniqueCategories)[0]
          },
          icon: '🎨'
        });
      }
    });
  }

  /**
   * Check for missing essentials
   */
  analyzeMissingEssentials(itinerary) {
    const essentials = {
      'tokyo tower': {
        name: 'Tokyo Tower',
        message: '🗼 ¿Visitarás Tokyo Tower? Es un ícono imperdible.'
      },
      'mount fuji': {
        name: 'Monte Fuji',
        message: '🗻 ¿Consideraste el Monte Fuji? Es la vista más icónica de Japón.'
      },
      'fushimi inari': {
        name: 'Fushimi Inari',
        message: '⛩️ Fushimi Inari con sus miles de torii es espectacular.'
      },
      'shibuya crossing': {
        name: 'Shibuya Crossing',
        message: '🚶 Shibuya Crossing es la intersección más famosa del mundo.'
      }
    };

    for (const [key, essential] of Object.entries(essentials)) {
      const hasIt = itinerary.days.some(day =>
        day.activities?.some(a =>
          a.name.toLowerCase().includes(key)
        )
      );

      if (!hasIt) {
        this.suggestions.push({
          id: `essential-${key}`,
          type: 'essential',
          priority: 4,
          title: `${essential.name} no está en tu lista`,
          message: essential.message,
          action: {
            type: 'add_essential',
            place: essential.name
          },
          icon: '⭐'
        });
      }
    }
  }

  /**
   * Mark a suggestion as shown
   */
  async markAsShown(suggestionId) {
    this.shownSuggestions.add(suggestionId);

    if (window.MLStorage) {
      await window.MLStorage.set(
        'shown_suggestions',
        Array.from(this.shownSuggestions)
      );
    }
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

  /**
   * Get a random suggestion to show
   */
  getRandomSuggestion() {
    const unshown = this.suggestions.filter(s =>
      !this.shownSuggestions.has(s.id)
    );

    if (unshown.length === 0) return null;

    return unshown[Math.floor(Math.random() * unshown.length)];
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ProactiveRecommendations = new ProactiveRecommendations();
  console.log('💡 Proactive Recommendations loaded!');
}
