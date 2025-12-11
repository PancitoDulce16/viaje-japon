/**
 * 🚀 PROACTIVE ASSISTANT
 * ======================
 *
 * "El AI que anticipa tus necesidades antes de que las pidas"
 *
 * Este módulo implementa asistencia proactiva inspirada en Claude:
 * - Anticipa necesidades del usuario
 * - Sugiere mejoras antes de que las pidan
 * - Detecta problemas potenciales
 * - Ofrece ayuda en momentos oportunos
 * - Sabe cuándo ser silencioso (no ser molesto)
 *
 * Como un buen asistente de viaje que:
 * - Te recuerda llevar paraguas cuando va a llover
 * - Sugiere descansar cuando nota que estás cansado
 * - Te avisa de un lugar cerrado antes de que llegues
 * - Pero no te interrumpe cuando estás concentrado
 */

class ProactiveAssistant {
  constructor() {
    this.initialized = false;

    // Proactivity settings
    this.settings = {
      enabled: true,
      aggressiveness: 'balanced', // low, balanced, high
      quietHours: { start: 22, end: 7 }, // Don't suggest during these hours
      maxSuggestionsPerHour: 3,
      minConfidenceThreshold: 0.6
    };

    // Suggestion types with priorities
    this.suggestionTypes = {
      'warning': {
        priority: 1,
        description: 'Warnings about potential problems',
        cooldown: 0 // Can suggest immediately
      },
      'optimization': {
        priority: 2,
        description: 'Opportunities to optimize',
        cooldown: 5 * 60 * 1000 // 5 minutes
      },
      'tip': {
        priority: 3,
        description: 'Helpful tips and suggestions',
        cooldown: 15 * 60 * 1000 // 15 minutes
      },
      'information': {
        priority: 4,
        description: 'Interesting information',
        cooldown: 30 * 60 * 1000 // 30 minutes
      }
    };

    // Suggestion history
    this.suggestions = [];

    // Last suggestion time per type
    this.lastSuggestionTime = new Map();

    // User interaction patterns
    this.interactionPatterns = {
      lastActivity: Date.now(),
      activeHours: [],
      averageSessionDuration: 0,
      preferredResponseTypes: new Map()
    };

    // Opportunity detection rules
    this.rules = [
      {
        id: 'high_fatigue_warning',
        type: 'warning',
        condition: (context) => context.fatigue > 75,
        suggestion: (context) => ({
          message: `⚠️ Veo que el día ${context.day} tiene un nivel de fatiga muy alto (${context.fatigue}%). ¿Quieres que lo ajuste?`,
          action: 'reduce_fatigue',
          priority: 1
        })
      },
      {
        id: 'budget_overrun',
        type: 'warning',
        condition: (context) => context.budgetUsed > context.budgetTotal * 0.9,
        suggestion: (context) => ({
          message: `💰 Estás usando el ${((context.budgetUsed / context.budgetTotal) * 100).toFixed(0)}% de tu presupuesto. ¿Quieres que busque opciones más económicas?`,
          action: 'reduce_budget',
          priority: 1
        })
      },
      {
        id: 'route_optimization',
        type: 'optimization',
        condition: (context) => context.travelTime > 120,
        suggestion: (context) => ({
          message: `🗺️ Noto que pasarás ${context.travelTime} minutos viajando hoy. Puedo optimizar la ruta para ahorrar tiempo.`,
          action: 'optimize_routes',
          priority: 2
        })
      },
      {
        id: 'similar_categories',
        type: 'optimization',
        condition: (context) => context.categoryRepetition > 2,
        suggestion: (context) => ({
          message: `🎨 Tienes varias actividades de ${context.category} seguidas. ¿Quieres variar más?`,
          action: 'diversify_activities',
          priority: 2
        })
      },
      {
        id: 'weather_consideration',
        type: 'tip',
        condition: (context) => context.weather && context.weather.rain && context.hasOutdoorActivities,
        suggestion: (context) => ({
          message: `☔ Veo que hay probabilidad de lluvia y tienes actividades al aire libre. ¿Quieres que sugiera alternativas cubiertas?`,
          action: 'suggest_indoor',
          priority: 3
        })
      },
      {
        id: 'unused_preferences',
        type: 'tip',
        condition: (context) => context.unusedPreferences && context.unusedPreferences.length > 0,
        suggestion: (context) => ({
          message: `💡 Noto que te interesan ${context.unusedPreferences.join(', ')}, pero no tienes actividades de esas categorías. ¿Quieres que agregue algunas?`,
          action: 'add_preferred_activities',
          priority: 3
        })
      },
      {
        id: 'time_slot_suggestion',
        type: 'information',
        condition: (context) => context.hasEmptyTimeSlots,
        suggestion: (context) => ({
          message: `🕐 Tienes tiempo libre en tu itinerario. ¿Quieres que sugiera actividades para llenar esos espacios?`,
          action: 'fill_time_slots',
          priority: 4
        })
      },
      {
        id: 'first_time_user',
        type: 'tip',
        condition: (context) => context.isNewUser && context.interactionCount === 1,
        suggestion: (context) => ({
          message: `👋 ¡Hola! Puedo ayudarte a optimizar tu itinerario, ajustar presupuesto, reducir fatiga y más. ¿Quieres que te muestre qué puedo hacer?`,
          action: 'show_capabilities',
          priority: 3
        })
      },
      {
        id: 'long_inactivity',
        type: 'information',
        condition: (context) => context.inactivityMinutes > 60,
        suggestion: (context) => ({
          message: `🤔 ¿Necesitas ayuda con algo? Puedo revisar tu itinerario y sugerirte mejoras.`,
          action: 'offer_help',
          priority: 4
        })
      },
      {
        id: 'success_pattern',
        type: 'tip',
        condition: (context) => context.acceptanceRate > 0.8 && context.totalSuggestions > 5,
        suggestion: (context) => ({
          message: `✨ Veo que te gustan mis sugerencias. ¿Quieres que sea más proactivo y te haga más recomendaciones automáticamente?`,
          action: 'increase_proactivity',
          priority: 3
        })
      }
    ];

    console.log('🚀 Proactive Assistant initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load settings and history
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('proactive_assistant');
      if (stored) {
        this.settings = stored.settings || this.settings;
        this.suggestions = stored.suggestions || [];
        this.interactionPatterns = stored.patterns || this.interactionPatterns;
      }
    }

    // Start monitoring
    this.startMonitoring();

    this.initialized = true;
    console.log('✅ Proactive Assistant ready');
    console.log(`📊 Proactivity level: ${this.settings.aggressiveness}`);
  }

  /**
   * 🔍 Analyze context and generate suggestions
   * @param {Object} context - Current state of the app
   * @returns {Array} Array of suggestions
   */
  analyzeSituation(context) {
    if (!this.settings.enabled) {
      return [];
    }

    // Check if it's quiet hours
    if (this.isQuietHours()) {
      return [];
    }

    // Check rate limiting
    if (this.isRateLimited()) {
      return [];
    }

    const suggestions = [];

    // Evaluate each rule
    for (const rule of this.rules) {
      try {
        // Check if rule condition is met
        if (rule.condition(context)) {
          // Check cooldown
          if (this.isOnCooldown(rule.type)) {
            continue;
          }

          // Generate suggestion
          const suggestion = rule.suggestion(context);

          // Add metadata
          const fullSuggestion = {
            id: rule.id,
            type: rule.type,
            timestamp: Date.now(),
            ...suggestion,
            confidence: this.calculateConfidence(rule, context)
          };

          // Only suggest if confidence is high enough
          if (fullSuggestion.confidence >= this.settings.minConfidenceThreshold) {
            suggestions.push(fullSuggestion);
          }
        }
      } catch (e) {
        console.warn(`Error evaluating rule ${rule.id}:`, e);
      }
    }

    // Sort by priority
    suggestions.sort((a, b) => a.priority - b.priority);

    // Limit based on aggressiveness
    const limit = this.getSuggestionLimit();
    const limitedSuggestions = suggestions.slice(0, limit);

    // Record suggestions
    limitedSuggestions.forEach(s => this.recordSuggestion(s));

    return limitedSuggestions;
  }

  /**
   * ⏰ Check if it's quiet hours
   */
  isQuietHours() {
    const hour = new Date().getHours();
    const { start, end } = this.settings.quietHours;

    if (start < end) {
      return hour >= start || hour < end;
    } else {
      return hour >= start && hour < end;
    }
  }

  /**
   * 🚫 Check if rate limited
   */
  isRateLimited() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentSuggestions = this.suggestions.filter(s => s.timestamp > oneHourAgo);

    return recentSuggestions.length >= this.settings.maxSuggestionsPerHour;
  }

  /**
   * ❄️ Check if suggestion type is on cooldown
   */
  isOnCooldown(type) {
    const lastTime = this.lastSuggestionTime.get(type);
    if (!lastTime) return false;

    const cooldown = this.suggestionTypes[type]?.cooldown || 0;
    return Date.now() - lastTime < cooldown;
  }

  /**
   * 📊 Calculate confidence for a suggestion
   */
  calculateConfidence(rule, context) {
    let confidence = 0.7; // Base confidence

    // Increase confidence for warnings
    if (rule.type === 'warning') {
      confidence += 0.2;
    }

    // Increase if user has accepted similar suggestions before
    const similarAccepted = this.suggestions.filter(s =>
      s.id === rule.id && s.userResponse === 'accepted'
    );

    if (similarAccepted.length > 0) {
      confidence += 0.1;
    }

    // Decrease if user has rejected similar suggestions
    const similarRejected = this.suggestions.filter(s =>
      s.id === rule.id && s.userResponse === 'rejected'
    );

    if (similarRejected.length > similarAccepted.length) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * 📏 Get suggestion limit based on aggressiveness
   */
  getSuggestionLimit() {
    const limits = {
      'low': 1,
      'balanced': 2,
      'high': 3
    };

    return limits[this.settings.aggressiveness] || 2;
  }

  /**
   * 📝 Record a suggestion
   */
  recordSuggestion(suggestion) {
    this.suggestions.push(suggestion);

    // Update last suggestion time
    this.lastSuggestionTime.set(suggestion.type, Date.now());

    // Keep only last 100 suggestions
    if (this.suggestions.length > 100) {
      this.suggestions.shift();
    }

    this.save();
  }

  /**
   * 👍👎 Record user response to suggestion
   */
  recordResponse(suggestionId, response) {
    const suggestion = this.suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      suggestion.userResponse = response; // 'accepted', 'rejected', 'dismissed'
      suggestion.responseTime = Date.now();

      // Learn from response
      this.learnFromResponse(suggestion, response);

      this.save();
    }
  }

  /**
   * 🧠 Learn from user response
   */
  learnFromResponse(suggestion, response) {
    // Track preferred response types
    const type = suggestion.type;
    if (!this.interactionPatterns.preferredResponseTypes.has(type)) {
      this.interactionPatterns.preferredResponseTypes.set(type, {
        accepted: 0,
        rejected: 0,
        dismissed: 0
      });
    }

    const stats = this.interactionPatterns.preferredResponseTypes.get(type);
    stats[response] = (stats[response] || 0) + 1;

    // Adjust aggressiveness based on feedback
    if (response === 'rejected' || response === 'dismissed') {
      const recentRejections = this.suggestions
        .slice(-10)
        .filter(s => s.userResponse === 'rejected' || s.userResponse === 'dismissed').length;

      if (recentRejections >= 5) {
        // Too many rejections, reduce aggressiveness
        if (this.settings.aggressiveness === 'high') {
          this.settings.aggressiveness = 'balanced';
          console.log('🔽 Reducing proactivity to balanced');
        } else if (this.settings.aggressiveness === 'balanced') {
          this.settings.aggressiveness = 'low';
          console.log('🔽 Reducing proactivity to low');
        }
      }
    } else if (response === 'accepted') {
      const recentAcceptances = this.suggestions
        .slice(-10)
        .filter(s => s.userResponse === 'accepted').length;

      if (recentAcceptances >= 7) {
        // Lots of acceptances, can be more proactive
        if (this.settings.aggressiveness === 'low') {
          this.settings.aggressiveness = 'balanced';
          console.log('🔼 Increasing proactivity to balanced');
        } else if (this.settings.aggressiveness === 'balanced') {
          this.settings.aggressiveness = 'high';
          console.log('🔼 Increasing proactivity to high');
        }
      }
    }
  }

  /**
   * 👀 Start monitoring for opportunities
   */
  startMonitoring() {
    // Monitor every 30 seconds
    setInterval(() => {
      this.checkForOpportunities();
    }, 30 * 1000);

    // Track user activity
    document.addEventListener('click', () => {
      this.interactionPatterns.lastActivity = Date.now();
    });

    // Save periodically
    setInterval(() => {
      this.save();
    }, 60 * 1000); // Every minute
  }

  /**
   * 🔍 Check for opportunities to help
   */
  async checkForOpportunities() {
    // Build context from current state
    const context = await this.buildContext();

    // Analyze and get suggestions
    const suggestions = this.analyzeSituation(context);

    // If we have suggestions, notify
    if (suggestions.length > 0) {
      this.notifySuggestions(suggestions);
    }
  }

  /**
   * 🏗️ Build context from current app state
   */
  async buildContext() {
    const context = {
      timestamp: Date.now(),
      inactivityMinutes: (Date.now() - this.interactionPatterns.lastActivity) / (60 * 1000)
    };

    // Get current itinerary state
    if (window.currentItinerary) {
      const itinerary = window.currentItinerary;

      // Calculate metrics
      context.budgetTotal = itinerary.totalBudget || 100000;
      context.budgetUsed = this.calculateBudgetUsed(itinerary);
      context.days = itinerary.days?.length || 0;

      // Check fatigue
      if (window.FatiguePredictor) {
        const fatiguePrediction = await window.FatiguePredictor.predictTripFatigue({
          days: context.days,
          itinerary: itinerary.days || []
        });

        if (fatiguePrediction.summary.peakFatigue > 75) {
          context.fatigue = fatiguePrediction.summary.peakFatigue;
          context.day = fatiguePrediction.summary.peakDay;
        }
      }

      // Check travel time
      context.travelTime = this.estimateTravelTime(itinerary);

      // Check category repetition
      const categoryCount = this.countCategories(itinerary);
      for (const [category, count] of categoryCount) {
        if (count > 2) {
          context.categoryRepetition = count;
          context.category = category;
          break;
        }
      }

      // Check outdoor activities (for weather)
      context.hasOutdoorActivities = this.hasOutdoorActivities(itinerary);

      // Check empty time slots
      context.hasEmptyTimeSlots = this.hasEmptyTimeSlots(itinerary);
    }

    // Check user profile
    if (window.MLBrain) {
      const analysis = await window.MLBrain.analyzeCurrentBehavior();
      context.userArchetype = analysis.archetype?.primary?.name || 'Explorer';
    }

    // Check if new user
    context.isNewUser = this.suggestions.length < 5;
    context.interactionCount = this.suggestions.length;

    // Calculate acceptance rate
    const accepted = this.suggestions.filter(s => s.userResponse === 'accepted').length;
    context.acceptanceRate = this.suggestions.length > 0 ? accepted / this.suggestions.length : 0;
    context.totalSuggestions = this.suggestions.length;

    return context;
  }

  /**
   * 💰 Calculate budget used
   */
  calculateBudgetUsed(itinerary) {
    // Simplified - would need actual implementation
    return 0;
  }

  /**
   * 🚗 Estimate travel time
   */
  estimateTravelTime(itinerary) {
    // Simplified - would need actual implementation
    return 0;
  }

  /**
   * 📊 Count activity categories
   */
  countCategories(itinerary) {
    const counts = new Map();
    // Simplified - would need actual implementation
    return counts;
  }

  /**
   * 🌳 Check if has outdoor activities
   */
  hasOutdoorActivities(itinerary) {
    // Simplified - would need actual implementation
    return false;
  }

  /**
   * 🕐 Check if has empty time slots
   */
  hasEmptyTimeSlots(itinerary) {
    // Simplified - would need actual implementation
    return false;
  }

  /**
   * 📢 Notify user of suggestions
   */
  notifySuggestions(suggestions) {
    // Show suggestions through UI
    if (window.AIChatUI) {
      suggestions.forEach(suggestion => {
        console.log(`💡 Proactive suggestion: ${suggestion.message}`);
        // Could integrate with AI Chat UI to show suggestions
      });
    }
  }

  /**
   * 💾 Save to storage
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('proactive_assistant', {
        settings: this.settings,
        suggestions: this.suggestions.slice(-100), // Keep last 100
        patterns: this.interactionPatterns
      });
    }
  }

  /**
   * ⚙️ Update settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    console.log('⚙️ Proactive Assistant settings updated:', this.settings);
    this.save();
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    const accepted = this.suggestions.filter(s => s.userResponse === 'accepted').length;
    const rejected = this.suggestions.filter(s => s.userResponse === 'rejected').length;
    const dismissed = this.suggestions.filter(s => s.userResponse === 'dismissed').length;

    return {
      totalSuggestions: this.suggestions.length,
      accepted,
      rejected,
      dismissed,
      acceptanceRate: this.suggestions.length > 0 ? accepted / this.suggestions.length : 0,
      aggressiveness: this.settings.aggressiveness,
      enabled: this.settings.enabled,
      recentSuggestions: this.suggestions.slice(-10)
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ProactiveAssistant = new ProactiveAssistant();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ProactiveAssistant.initialize();
    });
  } else {
    window.ProactiveAssistant.initialize();
  }

  console.log('🚀 Proactive Assistant loaded!');
}
