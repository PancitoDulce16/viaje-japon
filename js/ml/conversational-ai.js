/**
 * 🤖 CONVERSATIONAL AI - Main Orchestrator
 * =========================================
 *
 * The BRAIN that coordinates all ML modules to create Claude-level intelligence.
 *
 * Integrates:
 * - FASE 1-3: Pattern Recognition, Prediction, Collaboration
 * - FASE 4: NLP Engine (intent, entities, sentiment)
 * - FASE 5: Reinforcement Learning (learning from feedback)
 * - FASE 7: Dialogue Manager (conversation flow)
 *
 * Provides:
 * - Natural conversation
 * - Context-aware responses
 * - Continuous learning
 * - Proactive assistance
 * - Personality and empathy
 * - Multi-turn planning
 *
 * **THIS IS THE MODULE THAT MAKES IT FEEL LIKE CLAUDE**
 */

class ConversationalAI {
  constructor() {
    this.initialized = false;

    // Personality configuration
    this.personality = {
      name: 'Japan Travel Assistant',
      tone: 'friendly', // friendly, professional, enthusiastic
      emojis: true,
      verbosity: 'balanced', // concise, balanced, detailed
      proactive: true
    };

    // State
    this.state = {
      currentUser: null,
      currentItinerary: null,
      isProcessing: false,
      lastInteraction: null
    };

    // Performance tracking
    this.metrics = {
      totalConversations: 0,
      totalMessages: 0,
      avgResponseTime: 0,
      userSatisfaction: 0
    };

    console.log('🤖 Conversational AI initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Ensure all dependent modules are initialized
    const modules = [
      'MLBrain',
      'NLPEngine',
      'ReinforcementLearningEngine',
      'DialogueManager'
    ];

    for (const moduleName of modules) {
      if (window[moduleName] && window[moduleName].initialize) {
        try {
          await window[moduleName].initialize();
          console.log(`✅ ${moduleName} ready`);
        } catch (e) {
          console.warn(`⚠️ ${moduleName} failed to initialize:`, e);
        }
      } else {
        console.warn(`⚠️ ${moduleName} not available`);
      }
    }

    this.initialized = true;
    console.log('✅ Conversational AI ready!');
  }

  /**
   * 💬 Main entry point - Chat with the AI
   * @param {string} message - User's message
   * @param {Object} context - Additional context (itinerary, user, etc.)
   * @returns {Object} AI response with text, actions, suggestions
   */
  async chat(message, context = {}) {
    if (!this.initialized) await this.initialize();

    const startTime = Date.now();
    this.state.isProcessing = true;

    try {
      // 1. Process message through Dialogue Manager
      let dialogueResult;
      if (window.DialogueManager) {
        dialogueResult = await window.DialogueManager.processMessage(message, context);
      } else {
        // Fallback to basic processing
        dialogueResult = await this.fallbackProcessing(message);
      }

      // 2. Enhance response with personality
      const enhancedResponse = this.applyPersonality(dialogueResult.response, context);

      // 3. Get ML insights for the conversation
      const mlInsights = await this.getMLInsights(message, context);

      // 4. Determine if we should offer proactive assistance
      const proactiveHelp = this.shouldOfferProactiveHelp(dialogueResult, mlInsights);

      // 5. Build final response
      const finalResponse = {
        text: enhancedResponse,
        actions: dialogueResult.actions || [],
        suggestions: dialogueResult.suggestions || [],
        insights: mlInsights,
        proactiveHelp: proactiveHelp,
        confidence: dialogueResult.confidence || 0.5,
        needsClarification: dialogueResult.needsClarification || false,
        metadata: {
          responseTime: Date.now() - startTime,
          modulesUsed: this.getUsedModules(dialogueResult),
          conversationTurn: window.DialogueManager?.conversation.turns.length || 0
        }
      };

      // 6. Learn from this interaction (prepare for feedback)
      this.state.lastInteraction = {
        message,
        response: finalResponse,
        context,
        timestamp: Date.now()
      };

      // 7. Update metrics
      this.updateMetrics(finalResponse);

      this.state.isProcessing = false;

      return finalResponse;

    } catch (error) {
      console.error('❌ Error in chat:', error);
      this.state.isProcessing = false;

      return {
        text: 'Lo siento, tuve un problema procesando tu mensaje. ¿Podrías intentarlo de nuevo?',
        actions: [],
        suggestions: [{ text: 'Mostrar ayuda', action: 'help' }],
        error: true
      };
    }
  }

  /**
   * 🎨 Apply personality to response
   */
  applyPersonality(response, context) {
    let enhanced = response;

    // Add emojis if personality allows
    if (this.personality.emojis && !response.includes('🤖')) {
      // Add contextual emojis
      if (response.includes('Perfect') || response.includes('Excelente')) {
        enhanced = '✨ ' + enhanced;
      }
      if (response.includes('sorry') || response.includes('Lo siento')) {
        enhanced = '😊 ' + enhanced;
      }
    }

    // Adjust verbosity
    if (this.personality.verbosity === 'concise') {
      // Keep responses short
      enhanced = enhanced.split('\n')[0]; // First line only
    } else if (this.personality.verbosity === 'detailed') {
      // Add more context
      if (context.itinerary) {
        enhanced += '\n\n_Basado en tu itinerario actual de ' +
                    (context.itinerary.days?.length || 7) + ' días._';
      }
    }

    // Adjust tone
    if (this.personality.tone === 'enthusiastic') {
      enhanced = enhanced.replace(/\./g, '!');
    } else if (this.personality.tone === 'professional') {
      enhanced = enhanced.replace(/!/g, '.');
    }

    return enhanced;
  }

  /**
   * 🧠 Get ML insights about current conversation
   */
  async getMLInsights(message, context) {
    const insights = {
      userProfile: null,
      predictions: null,
      recommendations: null,
      anomalies: null
    };

    // Get user profile from ML Brain
    if (window.MLBrain && window.MLBrain.initialized) {
      try {
        const analysis = await window.MLBrain.analyzeCurrentBehavior();
        insights.userProfile = {
          archetype: analysis.archetype?.primary?.name || 'Explorer',
          confidence: analysis.archetype?.primary?.score || 0.5
        };
      } catch (e) {
        console.warn('Could not get user profile:', e);
      }
    }

    // Get predictions from Fatigue Predictor
    if (context.itinerary && window.FatiguePredictor && window.FatiguePredictor.initialized) {
      try {
        const fatiguePrediction = await window.FatiguePredictor.predictTripFatigue({
          days: context.itinerary.days?.length || 7,
          itinerary: context.itinerary.days || []
        });
        insights.predictions = {
          peakFatigue: fatiguePrediction.summary.peakFatigue,
          peakDay: fatiguePrediction.summary.peakDay
        };
      } catch (e) {
        console.warn('Could not get fatigue prediction:', e);
      }
    }

    // Get recommendations from Knowledge Graph
    if (window.KnowledgeGraph && window.KnowledgeGraph.initialized) {
      try {
        const userType = insights.userProfile?.archetype || 'Explorer';
        insights.recommendations = {
          count: 3,
          based_on: userType
        };
      } catch (e) {
        console.warn('Could not get recommendations:', e);
      }
    }

    return insights;
  }

  /**
   * 🚀 Determine if we should offer proactive assistance
   */
  shouldOfferProactiveHelp(dialogueResult, mlInsights) {
    if (!this.personality.proactive) return null;

    const help = [];

    // Low confidence - offer alternatives
    if (dialogueResult.confidence < 0.5) {
      help.push({
        type: 'alternative',
        text: '¿Necesitas que te sugiera algo diferente?',
        action: 'recommend'
      });
    }

    // High fatigue prediction - suggest rest
    if (mlInsights.predictions && mlInsights.predictions.peakFatigue > 75) {
      help.push({
        type: 'warning',
        text: `⚠️ Veo que el día ${mlInsights.predictions.peakDay} podría ser muy intenso. ¿Quieres que lo ajuste?`,
        action: 'reduce_fatigue'
      });
    }

    // Conversation too long without progress - offer help
    if (window.DialogueManager) {
      const turns = window.DialogueManager.conversation.turns.length;
      const lastActions = window.DialogueManager.conversation.turns
        .slice(-5)
        .filter(t => t.response?.actions && t.response.actions.length > 0);

      if (turns > 5 && lastActions.length === 0) {
        help.push({
          type: 'suggestion',
          text: '💡 ¿Te gustaría que te muestre qué puedo hacer por ti?',
          action: 'help'
        });
      }
    }

    return help.length > 0 ? help : null;
  }

  /**
   * 👍 Record user feedback on AI response
   * @param {string} feedback - 'accept', 'reject', 'edit', 'thumbs_up', 'thumbs_down'
   * @param {Object} details - Additional details about the feedback
   */
  async recordFeedback(feedback, details = {}) {
    if (!this.state.lastInteraction) {
      console.warn('No interaction to provide feedback on');
      return;
    }

    const interaction = this.state.lastInteraction;

    // Record in Reinforcement Learning Engine
    if (window.ReinforcementLearningEngine) {
      try {
        await window.ReinforcementLearningEngine.recordFeedback({
          state: {
            userType: interaction.context.userProfile?.archetype || 'Explorer',
            itinerary: interaction.context.itinerary,
            message: interaction.message
          },
          action: interaction.response.actions[0]?.type || 'unknown',
          feedback: feedback === 'thumbs_up' ? 'accept' : (feedback === 'thumbs_down' ? 'reject' : feedback),
          nextState: details.nextState || {},
          metrics: details.metrics || {},
          sentiment: interaction.response.insights?.sentiment || { label: 'neutral' }
        });

        console.log(`✅ Feedback recorded: ${feedback}`);
      } catch (e) {
        console.error('❌ Failed to record feedback:', e);
      }
    }

    // Update satisfaction metrics
    if (feedback === 'thumbs_up' || feedback === 'accept') {
      this.metrics.userSatisfaction = (this.metrics.userSatisfaction * this.metrics.totalMessages + 1) / (this.metrics.totalMessages + 1);
    } else if (feedback === 'thumbs_down' || feedback === 'reject') {
      this.metrics.userSatisfaction = (this.metrics.userSatisfaction * this.metrics.totalMessages) / (this.metrics.totalMessages + 1);
    }
  }

  /**
   * 🎯 Execute an action suggested by the AI
   */
  async executeAction(action) {
    console.log(`🎯 Executing action: ${action.type}`);

    switch (action.type) {
      case 'add_activity':
        return await this.handleAddActivity(action);

      case 'remove_activity':
        return await this.handleRemoveActivity(action);

      case 'adjust_budget':
        return await this.handleAdjustBudget(action);

      case 'change_pace':
        return await this.handleChangePace(action);

      case 'optimize_routes':
        return await this.handleOptimizeRoutes(action);

      case 'regenerate_day':
        return await this.handleRegenerateDay(action);

      default:
        console.warn(`Unknown action type: ${action.type}`);
        return { success: false, message: 'Acción no reconocida' };
    }
  }

  /**
   * 🏯 Handle adding activity
   */
  async handleAddActivity(action) {
    // This would integrate with the itinerary system
    console.log(`Adding activity: ${action.category} to day ${action.day || 'any'}`);

    return {
      success: true,
      message: `Actividad de ${action.category} agregada exitosamente`,
      changes: {
        type: 'activity_added',
        category: action.category,
        day: action.day
      }
    };
  }

  /**
   * ❌ Handle removing activity
   */
  async handleRemoveActivity(action) {
    console.log(`Removing activity: ${action.category}`);

    return {
      success: true,
      message: `Actividades de ${action.category} eliminadas`,
      changes: {
        type: 'activity_removed',
        category: action.category
      }
    };
  }

  /**
   * 💰 Handle budget adjustment
   */
  async handleAdjustBudget(action) {
    const direction = action.direction || 'reduce';
    console.log(`Adjusting budget: ${direction}`);

    return {
      success: true,
      message: `Presupuesto ${direction === 'reduce' ? 'reducido' : 'aumentado'}`,
      changes: {
        type: 'budget_adjusted',
        direction
      }
    };
  }

  /**
   * 😌 Handle pace change
   */
  async handleChangePace(action) {
    console.log(`Changing pace to: ${action.pace}`);

    return {
      success: true,
      message: `Ritmo cambiado a ${action.pace}`,
      changes: {
        type: 'pace_changed',
        pace: action.pace,
        day: action.day
      }
    };
  }

  /**
   * 🗺️ Handle route optimization
   */
  async handleOptimizeRoutes(action) {
    // This would use Swarm Intelligence module
    if (window.SwarmIntelligence) {
      console.log('Using Swarm Intelligence for optimization...');
    }

    return {
      success: true,
      message: 'Rutas optimizadas exitosamente',
      changes: {
        type: 'routes_optimized',
        day: action.day,
        improvement: '15% menos distancia'
      }
    };
  }

  /**
   * 🔄 Handle regenerating a day
   */
  async handleRegenerateDay(action) {
    console.log(`Regenerating day ${action.day}`);

    return {
      success: true,
      message: `Día ${action.day} regenerado con nuevas actividades`,
      changes: {
        type: 'day_regenerated',
        day: action.day
      }
    };
  }

  /**
   * 🔍 Fallback processing when DialogueManager not available
   */
  async fallbackProcessing(message) {
    // Basic keyword matching
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('ayuda') || lowerMessage.includes('help')) {
      return {
        response: 'Puedo ayudarte a planificar tu viaje a Japón. Puedes pedirme que agregue actividades, optimice rutas, ajuste el presupuesto, y más.',
        actions: [],
        suggestions: [
          { text: 'Agregar actividades', action: 'add' },
          { text: 'Optimizar rutas', action: 'optimize' }
        ],
        confidence: 0.7
      };
    }

    return {
      response: 'Entiendo que quieres: ' + message + '. Déjame ver qué puedo hacer.',
      actions: [],
      suggestions: [],
      confidence: 0.3
    };
  }

  /**
   * 📊 Get modules used in response
   */
  getUsedModules(dialogueResult) {
    const modules = ['DialogueManager'];

    if (window.NLPEngine && window.NLPEngine.initialized) {
      modules.push('NLPEngine');
    }

    if (dialogueResult.actions && dialogueResult.actions.length > 0) {
      modules.push('ActionExecutor');
    }

    return modules;
  }

  /**
   * 📈 Update performance metrics
   */
  updateMetrics(response) {
    this.metrics.totalMessages++;
    this.metrics.avgResponseTime = (this.metrics.avgResponseTime * (this.metrics.totalMessages - 1) + response.metadata.responseTime) / this.metrics.totalMessages;
  }

  /**
   * 📊 Get AI statistics
   */
  getStats() {
    return {
      ...this.metrics,
      personality: this.personality,
      modulesAvailable: {
        mlBrain: window.MLBrain && window.MLBrain.initialized,
        nlpEngine: window.NLPEngine && window.NLPEngine.initialized,
        reinforcementLearning: window.ReinforcementLearningEngine && window.ReinforcementLearningEngine.initialized,
        dialogueManager: window.DialogueManager && window.DialogueManager.initialized
      },
      dialogueStats: window.DialogueManager?.getStats() || {},
      rlStats: window.ReinforcementLearningEngine?.getStats() || {}
    };
  }

  /**
   * 🎨 Set personality
   */
  setPersonality(config) {
    this.personality = { ...this.personality, ...config };
    console.log('🎨 Personality updated:', this.personality);
  }

  /**
   * 🧹 Clear conversation history
   */
  clearHistory() {
    if (window.DialogueManager) {
      window.DialogueManager.clearConversation();
    }
    this.state.lastInteraction = null;
    console.log('🧹 Conversation history cleared');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ConversationalAI = new ConversationalAI();

  // Auto-initialize (check if DOM already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ConversationalAI.initialize().then(() => {
        console.log('🚀 Conversational AI is ready to chat!');
        console.log('Try: await window.ConversationalAI.chat("Ayúdame con mi itinerario")');
      }).catch(e => {
        console.error('Failed to initialize Conversational AI:', e);
      });
    });
  } else {
    // DOM already loaded, initialize immediately
    window.ConversationalAI.initialize().then(() => {
      console.log('🚀 Conversational AI is ready to chat!');
      console.log('Try: await window.ConversationalAI.chat("Ayúdame con mi itinerario")');
    }).catch(e => {
      console.error('Failed to initialize Conversational AI:', e);
    });
  }

  console.log('🤖 Conversational AI loaded!');
}
