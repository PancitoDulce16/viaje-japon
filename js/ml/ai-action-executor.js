/**
 * 🎬 AI ACTION EXECUTOR
 * =====================
 *
 * Makes the AI actually DO things instead of just talking
 * Executes real actions based on user intent
 */

class AIActionExecutor {
  constructor() {
    this.initialized = false;
    this.actionHistory = [];
    this.pendingActions = [];
    this.capabilities = this.buildCapabilities();
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🎬 Action Executor initializing...');

    // Load action history
    if (window.MLStorage) {
      const history = await window.MLStorage.get('action_history');
      if (history) {
        this.actionHistory = history;
      }
    }

    this.initialized = true;
    console.log('✅ Action Executor ready with', Object.keys(this.capabilities).length, 'capabilities');
  }

  /**
   * Build all action capabilities
   */
  buildCapabilities() {
    return {
      // ==================
      // ITINERARY ACTIONS
      // ==================
      addActivity: {
        description: 'Add an activity to the itinerary',
        params: ['activityName', 'day', 'category'],
        optional: ['time', 'notes', 'location'],
        execute: async (params) => {
          const itinerary = this.getCurrentItinerary();
          if (!itinerary || !itinerary.days) {
            return { success: false, error: 'No hay itinerario creado' };
          }

          const dayIndex = params.day ? params.day - 1 : itinerary.days.length - 1;

          if (dayIndex < 0 || dayIndex >= itinerary.days.length) {
            return { success: false, error: `El día ${params.day} no existe` };
          }

          const activity = {
            name: params.activityName,
            category: params.category || 'attraction',
            time: params.time || null,
            notes: params.notes || '',
            location: params.location || null,
            addedBy: 'ai',
            addedAt: new Date().toISOString()
          };

          if (!itinerary.days[dayIndex].activities) {
            itinerary.days[dayIndex].activities = [];
          }

          itinerary.days[dayIndex].activities.push(activity);

          // Save itinerary
          await this.saveItinerary(itinerary);

          return {
            success: true,
            message: `✅ Agregué "${params.activityName}" al día ${params.day}`,
            data: { activity, dayIndex }
          };
        }
      },

      removeActivity: {
        description: 'Remove an activity from the itinerary',
        params: ['activityName', 'day'],
        execute: async (params) => {
          const itinerary = this.getCurrentItinerary();
          if (!itinerary || !itinerary.days) {
            return { success: false, error: 'No hay itinerario creado' };
          }

          const dayIndex = params.day - 1;
          const day = itinerary.days[dayIndex];

          if (!day || !day.activities) {
            return { success: false, error: 'No hay actividades en ese día' };
          }

          const activityIndex = day.activities.findIndex(a =>
            a.name.toLowerCase().includes(params.activityName.toLowerCase())
          );

          if (activityIndex === -1) {
            return { success: false, error: `No encontré "${params.activityName}" en el día ${params.day}` };
          }

          const removed = day.activities.splice(activityIndex, 1)[0];
          await this.saveItinerary(itinerary);

          return {
            success: true,
            message: `✅ Eliminé "${removed.name}" del día ${params.day}`,
            data: { removed, dayIndex }
          };
        }
      },

      moveActivity: {
        description: 'Move an activity to a different day',
        params: ['activityName', 'fromDay', 'toDay'],
        execute: async (params) => {
          const itinerary = this.getCurrentItinerary();
          if (!itinerary || !itinerary.days) {
            return { success: false, error: 'No hay itinerario creado' };
          }

          const fromDayIndex = params.fromDay - 1;
          const toDayIndex = params.toDay - 1;

          const fromDay = itinerary.days[fromDayIndex];
          const toDay = itinerary.days[toDayIndex];

          if (!fromDay || !toDay) {
            return { success: false, error: 'Uno de los días no existe' };
          }

          const activityIndex = fromDay.activities.findIndex(a =>
            a.name.toLowerCase().includes(params.activityName.toLowerCase())
          );

          if (activityIndex === -1) {
            return { success: false, error: `No encontré "${params.activityName}"` };
          }

          const activity = fromDay.activities.splice(activityIndex, 1)[0];

          if (!toDay.activities) toDay.activities = [];
          toDay.activities.push(activity);

          await this.saveItinerary(itinerary);

          return {
            success: true,
            message: `✅ Moví "${activity.name}" del día ${params.fromDay} al día ${params.toDay}`,
            data: { activity, fromDayIndex, toDayIndex }
          };
        }
      },

      // ==================
      // OPTIMIZATION ACTIONS
      // ==================
      optimizeRoute: {
        description: 'Optimize the route for specified days',
        params: [],
        optional: ['days'],
        execute: async (params) => {
          if (!window.GeoOptimizerUI) {
            return { success: false, error: 'Optimizador no disponible' };
          }

          try {
            // This will open the optimizer UI
            window.GeoOptimizerUI.runOptimization();

            return {
              success: true,
              message: '🗺️ Abrí el optimizador de rutas. ¡Selecciona los días que quieres optimizar!',
              action: 'ui_opened'
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
      },

      // ==================
      // SEARCH ACTIONS
      // ==================
      searchPlaces: {
        description: 'Search for places',
        params: ['category'],
        optional: ['location', 'limit'],
        execute: async (params) => {
          // This would integrate with a places database or API
          const suggestions = this.getPlaceSuggestions(params.category, params.location);

          return {
            success: true,
            message: `🔍 Encontré ${suggestions.length} lugares de tipo "${params.category}"`,
            data: { suggestions }
          };
        }
      },

      // ==================
      // STATS ACTIONS
      // ==================
      showStats: {
        description: 'Show trip statistics',
        params: [],
        execute: async (params) => {
          const itinerary = this.getCurrentItinerary();
          if (!itinerary || !itinerary.days) {
            return { success: false, error: 'No hay itinerario creado' };
          }

          const stats = {
            totalDays: itinerary.days.length,
            totalActivities: itinerary.days.reduce((sum, day) =>
              sum + (day.activities?.length || 0), 0),
            activitiesByCategory: {},
            averageActivitiesPerDay: 0
          };

          // Count by category
          itinerary.days.forEach(day => {
            day.activities?.forEach(activity => {
              const cat = activity.category || 'other';
              stats.activitiesByCategory[cat] = (stats.activitiesByCategory[cat] || 0) + 1;
            });
          });

          stats.averageActivitiesPerDay = (stats.totalActivities / stats.totalDays).toFixed(1);

          return {
            success: true,
            message: `📊 Tu viaje tiene ${stats.totalDays} días con ${stats.totalActivities} actividades`,
            data: { stats }
          };
        }
      },

      // ==================
      // RECOMMENDATION ACTIONS
      // ==================
      recommend: {
        description: 'Recommend activities or improvements',
        params: [],
        optional: ['category', 'day'],
        execute: async (params) => {
          // Use AI Insights for deep analysis
          if (window.AIInsights && window.AIInsights.initialized) {
            const analysis = await window.AIInsights.analyze();

            if (analysis && analysis.insights && analysis.insights.length > 0) {
              // Format insights for display
              let message = `🔍 Analicé tu itinerario en profundidad:\n\n`;
              analysis.insights.slice(0, 3).forEach((insight, i) => {
                message += `${insight.icon} **${insight.title}**: ${insight.message}\n`;
              });

              if (analysis.insights.length > 3) {
                message += `\n...y ${analysis.insights.length - 3} insights más.`;
              }

              return {
                success: true,
                message,
                data: {
                  insights: analysis.insights,
                  summary: analysis.summary,
                  travelPatterns: analysis.travelPatterns
                }
              };
            }
          }

          // Fallback to basic recommendations
          const itinerary = this.getCurrentItinerary();
          const recommendations = [];

          if (itinerary && itinerary.days) {
            itinerary.days.forEach((day, index) => {
              if (!day.activities || day.activities.length === 0) {
                recommendations.push({
                  type: 'empty_day',
                  message: `El día ${index + 1} está vacío. ¿Te ayudo a agregar actividades?`,
                  day: index + 1
                });
              }
            });

            // Check for balance
            const hasTemples = itinerary.days.some(d =>
              d.activities?.some(a => a.category === 'temple')
            );
            const hasFood = itinerary.days.some(d =>
              d.activities?.some(a => a.category === 'restaurant')
            );

            if (!hasTemples) {
              recommendations.push({
                type: 'missing_category',
                message: '⛩️ No tienes templos en tu itinerario. ¡Los templos japoneses son increíbles!',
                category: 'temple'
              });
            }

            if (!hasFood) {
              recommendations.push({
                type: 'missing_category',
                message: '🍜 No veo restaurantes planificados. ¡La comida es parte esencial del viaje!',
                category: 'restaurant'
              });
            }
          }

          if (recommendations.length === 0) {
            recommendations.push({
              type: 'general',
              message: '✨ Tu itinerario se ve bien equilibrado. Podrías optimizar las rutas para ahorrar tiempo.'
            });
          }

          return {
            success: true,
            message: `💡 Tengo ${recommendations.length} recomendaciones para ti`,
            data: { recommendations }
          };
        }
      },

      // ==================
      // BUDGET ACTIONS
      // ==================
      showBudget: {
        description: 'Show budget information',
        params: [],
        execute: async (params) => {
          if (window.BudgetIntelligenceUI) {
            const data = window.BudgetIntelligenceUI.getMockTripData();
            if (data) {
              window.BudgetIntelligenceUI.showDashboard(data);
              return {
                success: true,
                message: '💰 Abrí el panel de presupuesto',
                action: 'ui_opened'
              };
            }
          }

          return {
            success: false,
            error: 'Sistema de presupuesto no disponible'
          };
        }
      },

      // ==================
      // UI ACTIONS
      // ==================
      openTimeline: {
        description: 'Open Instagram timeline',
        params: [],
        execute: async (params) => {
          if (window.InstagramTimeline) {
            window.InstagramTimeline.open();
            return {
              success: true,
              message: '📸 Abrí tu timeline de Instagram',
              action: 'ui_opened'
            };
          }
          return { success: false, error: 'Timeline no disponible' };
        }
      },

      openCulturalGuide: {
        description: 'Open cultural knowledge guide',
        params: [],
        execute: async (params) => {
          if (window.CulturalKnowledgeUI) {
            window.CulturalKnowledgeUI.showGuide();
            return {
              success: true,
              message: '⛩️ Abrí la guía cultural de Japón',
              action: 'ui_opened'
            };
          }
          return { success: false, error: 'Guía cultural no disponible' };
        }
      },

      activateLiveMode: {
        description: 'Activate live mode',
        params: [],
        execute: async (params) => {
          if (window.LiveModeUI) {
            window.LiveModeUI.activate();
            return {
              success: true,
              message: '📍 Activé el modo live. ¡Disfruta tu viaje!',
              action: 'ui_opened'
            };
          }
          return { success: false, error: 'Modo live no disponible' };
        }
      }
    };
  }

  /**
   * Execute an action based on intent
   */
  async execute(intent, entities, context = {}) {
    if (!this.initialized) await this.initialize();

    console.log('🎬 Executing action:', intent, entities);

    // Map intent to action
    const actionName = this.mapIntentToAction(intent);

    if (!actionName) {
      return {
        success: false,
        error: 'No sé cómo hacer eso todavía',
        intent
      };
    }

    const capability = this.capabilities[actionName];

    if (!capability) {
      return {
        success: false,
        error: `Acción "${actionName}" no implementada`,
        intent
      };
    }

    try {
      // Extract parameters from entities
      const params = this.extractParameters(capability, entities, context);

      // Execute the action
      const result = await capability.execute(params);

      // Record in history
      this.actionHistory.push({
        action: actionName,
        intent,
        params,
        result,
        timestamp: Date.now()
      });

      // Save history
      if (window.MLStorage) {
        await window.MLStorage.set('action_history', this.actionHistory.slice(-50));
      }

      return result;

    } catch (error) {
      console.error('❌ Action execution failed:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Map intent to action name
   */
  mapIntentToAction(intent) {
    const intentName = typeof intent === 'string' ? intent : intent.action || intent.intent;

    const mapping = {
      // Itinerary
      'addActivity': 'addActivity',
      'add': 'addActivity',
      'removeActivity': 'removeActivity',
      'remove': 'removeActivity',
      'delete': 'removeActivity',
      'moveActivity': 'moveActivity',
      'move': 'moveActivity',

      // Optimization
      'optimizeRoute': 'optimizeRoute',
      'optimize': 'optimizeRoute',

      // Search
      'searchPlaces': 'searchPlaces',
      'search': 'searchPlaces',
      'find': 'searchPlaces',

      // Stats
      'showStats': 'showStats',
      'stats': 'showStats',
      'statistics': 'showStats',

      // Recommendations
      'recommend': 'recommend',
      'suggestion': 'recommend',
      'help': 'recommend',

      // Budget
      'showBudget': 'showBudget',
      'budget': 'showBudget',

      // UI
      'openTimeline': 'openTimeline',
      'timeline': 'openTimeline',
      'instagram': 'openTimeline',
      'openCulturalGuide': 'openCulturalGuide',
      'culture': 'openCulturalGuide',
      'etiquette': 'openCulturalGuide',
      'activateLiveMode': 'activateLiveMode',
      'live': 'activateLiveMode'
    };

    return mapping[intentName];
  }

  /**
   * Extract parameters from entities
   */
  extractParameters(capability, entities, context) {
    const params = {};
    const missingParams = [];

    // Try to fill required params
    for (const paramName of capability.params || []) {
      // Try to extract from entities
      const value = this.extractParamValue(paramName, entities, context);
      if (value !== null && value !== undefined) {
        params[paramName] = value;
      } else {
        missingParams.push(paramName);
      }
    }

    // 🧠 NEW: Use conversational memory to infer missing parameters
    try {
      if (missingParams.length > 0 && window.ConversationalMemory && window.ConversationalMemory.initialized) {
        console.log('🧠 Inferring missing parameters from memory:', missingParams);
        const inferred = window.ConversationalMemory.inferParameters(missingParams);

        for (const [paramName, value] of Object.entries(inferred)) {
          if (value !== null && value !== undefined) {
            console.log(`  ✅ Inferred ${paramName} = ${value} from context`);
            params[paramName] = value;
            // Remove from missing list
            const index = missingParams.indexOf(paramName);
            if (index > -1) missingParams.splice(index, 1);
          }
        }

        if (missingParams.length > 0) {
          console.log('  ⚠️ Still missing:', missingParams);
        }
      }
    } catch (e) {
      console.warn('⚠️ Parameter inference error:', e);
    }

    // Try to fill optional params
    for (const paramName of capability.optional || []) {
      const value = this.extractParamValue(paramName, entities, context);
      if (value !== null && value !== undefined) {
        params[paramName] = value;
      }
    }

    return params;
  }

  /**
   * Extract a single parameter value
   */
  extractParamValue(paramName, entities, context) {
    // Map parameter names to entity types
    const paramMapping = {
      'activityName': () => {
        // Try to find activity name in the text
        if (context.originalText) {
          const patterns = [
            /(?:agregar|añadir|add)\s+(?:el\s+)?(?:templo\s+)?(?:de\s+)?([^a-z]+)/i,
            /(?:visitar|ir a|conocer)\s+([^a-z]+)/i,
            /(?:templo|santuario|restaurante|lugar)\s+(?:de\s+)?([^a-z]+)/i
          ];

          for (const pattern of patterns) {
            const match = context.originalText.match(pattern);
            if (match && match[1]) {
              return match[1].trim();
            }
          }
        }
        return null;
      },
      'day': () => {
        if (entities.DATE && entities.DATE.captured && entities.DATE.captured[0]) {
          return parseInt(entities.DATE.captured[0]);
        }
        return null;
      },
      'category': () => {
        if (entities.CATEGORY && entities.CATEGORY.value) {
          return entities.CATEGORY.value;
        }
        return null;
      },
      'fromDay': () => {
        if (entities.DATE && entities.DATE.captured && entities.DATE.captured[0]) {
          return parseInt(entities.DATE.captured[0]);
        }
        return null;
      },
      'toDay': () => {
        if (entities.DATE && entities.DATE.captured && entities.DATE.captured[1]) {
          return parseInt(entities.DATE.captured[1]);
        }
        return null;
      }
    };

    const extractor = paramMapping[paramName];
    if (extractor) {
      return extractor();
    }

    return null;
  }

  /**
   * Get current itinerary
   */
  getCurrentItinerary() {
    // Try window.currentItinerary first
    if (window.currentItinerary && window.currentItinerary.days) {
      console.log('✅ Found itinerary in window.currentItinerary');
      return window.currentItinerary;
    }

    // Try TripsManager.currentTrip
    if (window.TripsManager && window.TripsManager.currentTrip) {
      const trip = window.TripsManager.currentTrip;

      // Check if it has itinerary.days
      if (trip.itinerary && trip.itinerary.days) {
        console.log('✅ Found itinerary in TripsManager.currentTrip.itinerary');
        return trip.itinerary;
      }

      // Check if trip itself has days
      if (trip.days) {
        console.log('✅ Found itinerary in TripsManager.currentTrip.days');
        return trip;
      }
    }

    // Try ItineraryManager
    if (window.ItineraryManager && window.ItineraryManager.getCurrentItinerary) {
      const itinerary = window.ItineraryManager.getCurrentItinerary();
      if (itinerary && itinerary.days) {
        console.log('✅ Found itinerary in ItineraryManager');
        return itinerary;
      }
    }

    // Last resort: try localStorage
    try {
      const storedItinerary = localStorage.getItem('currentItinerary');
      if (storedItinerary) {
        const parsed = JSON.parse(storedItinerary);
        if (parsed && parsed.days) {
          console.log('✅ Found itinerary in localStorage');
          return parsed;
        }
      }

      // Try also from trip data in localStorage
      const currentTripId = localStorage.getItem('currentTripId');
      if (currentTripId) {
        const tripKey = `trip_${currentTripId}`;
        const tripData = localStorage.getItem(tripKey);
        if (tripData) {
          const trip = JSON.parse(tripData);
          if (trip.itinerary && trip.itinerary.days) {
            console.log('✅ Found itinerary in localStorage trip data');
            return trip.itinerary;
          }
        }
      }
    } catch (e) {
      console.warn('Error loading itinerary from localStorage:', e);
    }

    console.warn('❌ No itinerary found from any source');
    return null;
  }

  /**
   * Save itinerary
   */
  async saveItinerary(itinerary) {
    // Update window.currentItinerary
    if (window.currentItinerary) {
      window.currentItinerary.days = itinerary.days;
    }

    // Save to Firebase
    if (typeof saveCurrentItineraryToFirebase === 'function') {
      await saveCurrentItineraryToFirebase();
    } else if (window.TripsManager && window.TripsManager.saveCurrentTrip) {
      await window.TripsManager.saveCurrentTrip();
    }

    // Refresh view
    if (typeof render === 'function') {
      await render();
    } else if (window.TripsManager && window.TripsManager.displayCurrentTrip) {
      window.TripsManager.displayCurrentTrip();
    }
  }

  /**
   * Get place suggestions
   */
  getPlaceSuggestions(category, location) {
    const database = {
      temple: [
        { name: 'Senso-ji Temple', location: 'Asakusa, Tokyo', rating: 4.8 },
        { name: 'Fushimi Inari Taisha', location: 'Kyoto', rating: 4.9 },
        { name: 'Kinkaku-ji', location: 'Kyoto', rating: 4.7 },
        { name: 'Meiji Jingu', location: 'Shibuya, Tokyo', rating: 4.6 }
      ],
      restaurant: [
        { name: 'Ichiran Ramen', location: 'Shibuya', rating: 4.5 },
        { name: 'Sukiyabashi Jiro', location: 'Ginza', rating: 4.9 },
        { name: 'Tsukiji Market', location: 'Tokyo', rating: 4.7 }
      ],
      attraction: [
        { name: 'Tokyo Skytree', location: 'Tokyo', rating: 4.6 },
        { name: 'Shibuya Crossing', location: 'Shibuya', rating: 4.5 },
        { name: 'Mount Fuji', location: 'Fujinomiya', rating: 4.9 }
      ]
    };

    return database[category] || [];
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.AIActionExecutor = new AIActionExecutor();
  console.log('🎬 AI Action Executor loaded!');
}
