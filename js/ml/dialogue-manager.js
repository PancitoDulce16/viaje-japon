/**
 * 💬 FASE 7: DIALOGUE MANAGER
 * ============================
 *
 * Manages conversation flow, context tracking, and multi-turn dialogue.
 *
 * Capabilities:
 * - Track conversation history
 * - Maintain context across turns
 * - Handle interruptions and topic changes
 * - Reference previous messages
 * - Multi-intent handling
 * - Contextual memory (short-term, long-term, working)
 *
 * Makes conversations feel natural and intelligent.
 */

class DialogueManager {
  constructor() {
    this.initialized = false;

    // Conversation state
    this.conversation = {
      id: this.generateConversationId(),
      startTime: Date.now(),
      turns: [],
      currentTopic: null,
      activeIntents: [],
      pendingQuestions: [],
      userProfile: {}
    };

    // Memory systems
    this.memory = {
      shortTerm: [], // Last 5 turns
      working: {},   // Current task/goal
      longTerm: {},  // User preferences, past trips
      episodic: []   // Specific memorable events
    };

    // Dialogue policies
    this.policies = {
      maxTurnsWithoutProgress: 5,
      clarificationThreshold: 0.5, // Ask for clarification if confidence < 0.5
      proactiveAssistanceEnabled: true,
      maxPendingQuestions: 3
    };

    console.log('💬 Dialogue Manager initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load conversation history
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('dialogue_state');
      if (stored) {
        if (stored.memory) {
          this.memory.longTerm = stored.memory.longTerm || {};
          this.memory.episodic = stored.memory.episodic || [];
        }
        if (stored.userProfile) {
          this.conversation.userProfile = stored.userProfile;
        }
      }
    }

    this.initialized = true;
    console.log('✅ Dialogue Manager ready');
  }

  /**
   * 🎯 Process user message and generate appropriate response
   */
  async processMessage(userMessage, context = {}) {
    if (!this.initialized) await this.initialize();

    // Parse message using NLP Engine
    let parsed;
    if (window.NLPEngine) {
      parsed = await window.NLPEngine.parse(userMessage);
    } else {
      // Fallback if NLP not available
      parsed = { intent: { intent: 'UNKNOWN' }, entities: {}, confidence: 0 };
    }

    // Create turn object
    const turn = {
      id: this.turns++,
      timestamp: Date.now(),
      userMessage,
      parsed,
      context,
      response: null,
      actions: []
    };

    // Determine response strategy
    const responseStrategy = this.selectResponseStrategy(turn);

    // Execute strategy
    const response = await this.executeStrategy(responseStrategy, turn);

    // Add to turn
    turn.response = response;

    // Update conversation state
    this.updateConversationState(turn);

    // Update memory
    this.updateMemory(turn);

    // Save state
    await this.saveState();

    return {
      response: response.text,
      actions: response.actions,
      suggestions: response.suggestions,
      confidence: response.confidence,
      needsClarification: response.needsClarification,
      turn
    };
  }

  /**
   * 🎲 Select appropriate response strategy
   */
  selectResponseStrategy(turn) {
    const intent = turn.parsed.intent.intent;
    const confidence = turn.parsed.confidence;

    // Low confidence - need clarification
    if (confidence < this.policies.clarificationThreshold) {
      return 'clarify';
    }

    // Unknown intent - offer help
    if (intent === 'UNKNOWN') {
      return 'help';
    }

    // Multi-intent - handle complex request
    if (turn.parsed.intent.ambiguous) {
      return 'disambiguate';
    }

    // Context-dependent intent
    if (turn.parsed.intent.requiresContext) {
      return 'contextual';
    }

    // Standard intent - execute directly
    return 'direct';
  }

  /**
   * 🚀 Execute response strategy
   */
  async executeStrategy(strategy, turn) {
    switch (strategy) {
      case 'clarify':
        return this.generateClarificationResponse(turn);

      case 'help':
        return this.generateHelpResponse(turn);

      case 'disambiguate':
        return this.generateDisambiguationResponse(turn);

      case 'contextual':
        return this.generateContextualResponse(turn);

      case 'direct':
        return this.generateDirectResponse(turn);

      default:
        return this.generateFallbackResponse(turn);
    }
  }

  /**
   * ❓ Generate clarification question
   */
  generateClarificationResponse(turn) {
    const questions = [
      '¿Podrías ser más específico? No estoy seguro de entender.',
      '¿A qué te refieres exactamente?',
      'Quiero ayudarte, pero necesito más información. ¿Puedes darme más detalles?',
      '¿Podrías reformular eso de otra manera?'
    ];

    const question = questions[Math.floor(Math.random() * questions.length)];

    // Try to guess what user might mean
    const guesses = [];
    if (turn.parsed.entities.CATEGORY) {
      guesses.push(`¿Quieres agregar más actividades de ${turn.parsed.entities.CATEGORY.value}?`);
    }
    if (turn.parsed.entities.DATE) {
      guesses.push(`¿Te refieres al día ${turn.parsed.entities.DATE.captured[0]}?`);
    }

    return {
      text: question + (guesses.length > 0 ? `\n\n${guesses.join('\n')}` : ''),
      actions: [],
      suggestions: this.generateSuggestions(['clarify']),
      confidence: 0.3,
      needsClarification: true
    };
  }

  /**
   * 🆘 Generate help response
   */
  generateHelpResponse(turn) {
    const helpText = `
🤖 **Puedo ayudarte con:**

- 🎯 Agregar o quitar actividades ("Agrega más templos al día 3")
- 💰 Ajustar presupuesto ("Hazlo más barato")
- 😌 Cambiar el ritmo ("Haz el día 2 más relajado")
- 🗺️ Optimizar rutas ("Optimiza las rutas del día 1")
- 🔄 Regenerar días ("Regenera el día 4")
- ✨ Recomendar actividades ("¿Qué me recomiendas?")
- 📊 Ver estadísticas ("¿Cuánto voy a caminar?")

**¿En qué te puedo ayudar?**
    `.trim();

    return {
      text: helpText,
      actions: [],
      suggestions: [
        { text: 'Recomiéndame algo', action: 'recommend' },
        { text: 'Hazlo más barato', action: 'adjust_budget' },
        { text: 'Optimiza rutas', action: 'optimize' }
      ],
      confidence: 1.0,
      needsClarification: false
    };
  }

  /**
   * 🔀 Generate disambiguation response (when intent is ambiguous)
   */
  generateDisambiguationResponse(turn) {
    const alternatives = turn.parsed.intent.alternatives || [];

    const text = `Podría hacer varias cosas con eso. ¿Te refieres a...?\n\n` +
      alternatives.map((alt, i) => `${i + 1}. ${this.intentToHumanReadable(alt.intent)}`).join('\n');

    return {
      text,
      actions: [],
      suggestions: alternatives.map(alt => ({
        text: this.intentToHumanReadable(alt.intent),
        action: alt.action
      })),
      confidence: 0.6,
      needsClarification: true
    };
  }

  /**
   * 🧠 Generate contextual response (requires previous context)
   */
  generateContextualResponse(turn) {
    const intent = turn.parsed.intent.intent;

    // Get relevant context from short-term memory
    const recentTurns = this.memory.shortTerm;
    const lastTurn = recentTurns[recentTurns.length - 1];

    // Handle based on intent
    switch (intent) {
      case 'CONFIRM':
        return this.handleConfirmation(lastTurn);

      case 'DENY':
        return this.handleDenial(lastTurn);

      case 'SAVE_PREFERENCE':
        return this.handlePreferenceSaving(turn);

      default:
        return this.generateDirectResponse(turn);
    }
  }

  /**
   * ✅ Handle user confirmation
   */
  handleConfirmation(lastTurn) {
    if (!lastTurn || !lastTurn.response || !lastTurn.response.pendingAction) {
      return {
        text: '¿Confirmar qué? No tengo ninguna acción pendiente.',
        actions: [],
        suggestions: [],
        confidence: 0.5,
        needsClarification: true
      };
    }

    // Execute pending action
    const action = lastTurn.response.pendingAction;

    return {
      text: `¡Perfecto! Voy a ${action.description}.`,
      actions: [action],
      suggestions: [],
      confidence: 1.0,
      needsClarification: false
    };
  }

  /**
   * ❌ Handle user denial
   */
  handleDenial(lastTurn) {
    return {
      text: 'Entendido, no haré ese cambio. ¿Hay algo más en lo que pueda ayudarte?',
      actions: [],
      suggestions: [
        { text: 'Recomiéndame algo diferente', action: 'recommend' },
        { text: 'Muestra estadísticas', action: 'stats' }
      ],
      confidence: 1.0,
      needsClarification: false
    };
  }

  /**
   * 💾 Handle preference saving
   */
  handlePreferenceSaving(turn) {
    const entities = turn.parsed.entities;
    const sentiment = turn.parsed.sentiment;

    // Extract preference
    let preference = null;
    if (entities.CATEGORY) {
      preference = {
        type: 'category',
        value: entities.CATEGORY,
        sentiment: sentiment.label
      };
    }

    if (preference) {
      // Save to long-term memory
      const key = `preference_${preference.type}_${preference.value}`;
      this.memory.longTerm[key] = {
        ...preference,
        timestamp: Date.now()
      };
    }

    return {
      text: '¡Anotado! Recordaré esa preferencia para futuras recomendaciones.',
      actions: [],
      suggestions: [],
      confidence: 0.9,
      needsClarification: false
    };
  }

  /**
   * 🎯 Generate direct response (standard intent execution)
   */
  async generateDirectResponse(turn) {
    const intent = turn.parsed.intent;
    const action = intent.action;

    // Map intent to response
    const responses = {
      addActivity: this.generateAddActivityResponse(turn),
      removeActivity: this.generateRemoveActivityResponse(turn),
      adjustBudget: this.generateBudgetResponse(turn),
      changePace: this.generatePaceResponse(turn),
      optimizeRoute: this.generateOptimizeResponse(turn),
      recommend: this.generateRecommendationResponse(turn),
      explain: this.generateExplanationResponse(turn),
      getStats: this.generateStatsResponse(turn),
      acknowledge: this.generateAcknowledgment(turn),
      handleComplaint: this.generateComplaintResponse(turn)
    };

    if (responses[action]) {
      return responses[action];
    }

    return this.generateFallbackResponse(turn);
  }

  /**
   * 🏯 Generate response for adding activity
   */
  generateAddActivityResponse(turn) {
    const category = turn.parsed.entities.CATEGORY;
    const day = turn.parsed.entities.DATE;

    let text = '¡Perfecto! ';
    if (category && day) {
      text += `Voy a agregar más actividades de ${category.value} al día ${day.captured[0]}.`;
    } else if (category) {
      text += `Voy a buscar más actividades de ${category.value} para tu itinerario.`;
    } else {
      text += 'Voy a agregar más actividades.';
    }

    return {
      text,
      actions: [{
        type: 'add_activity',
        category: category?.value,
        day: day?.captured[0]
      }],
      suggestions: [
        { text: 'Optimiza también las rutas', action: 'optimize' },
        { text: 'Muéstrame el resumen', action: 'stats' }
      ],
      confidence: 0.85,
      needsClarification: false
    };
  }

  /**
   * ❌ Generate response for removing activity
   */
  generateRemoveActivityResponse(turn) {
    const category = turn.parsed.entities.CATEGORY;

    return {
      text: `Entendido, voy a quitar actividades de ${category?.value || 'esa categoría'}.`,
      actions: [{
        type: 'remove_activity',
        category: category?.value
      }],
      suggestions: [],
      confidence: 0.8,
      needsClarification: false
    };
  }

  /**
   * 💰 Generate budget response
   */
  generateBudgetResponse(turn) {
    const text = turn.userMessage;

    let adjustment = 'reduce';
    if (text.includes('barato') || text.includes('económico') || text.includes('reduce')) {
      adjustment = 'reduce';
    } else if (text.includes('caro') || text.includes('premium') || text.includes('aumenta')) {
      adjustment = 'increase';
    }

    return {
      text: `Voy a ${adjustment === 'reduce' ? 'reducir' : 'aumentar'} el presupuesto y buscar opciones más ${adjustment === 'reduce' ? 'económicas' : 'premium'}.`,
      actions: [{
        type: 'adjust_budget',
        direction: adjustment
      }],
      suggestions: [],
      confidence: 0.9,
      needsClarification: false
    };
  }

  /**
   * 😌 Generate pace response
   */
  generatePaceResponse(turn) {
    const intensity = turn.parsed.entities.INTENSITY;
    const day = turn.parsed.entities.DATE;

    return {
      text: `Perfecto, voy a hacer ${day ? `el día ${day.captured[0]}` : 'el itinerario'} más ${intensity?.value || 'relajado'}.`,
      actions: [{
        type: 'change_pace',
        pace: intensity?.value || 'relaxed',
        day: day?.captured[0]
      }],
      suggestions: [],
      confidence: 0.85,
      needsClarification: false
    };
  }

  /**
   * 🗺️ Generate optimize response
   */
  generateOptimizeResponse(turn) {
    const day = turn.parsed.entities.DATE;

    return {
      text: `¡Excelente idea! Voy a optimizar ${day ? `el día ${day.captured[0]}` : 'todas las rutas'} para minimizar tiempo de viaje.`,
      actions: [{
        type: 'optimize_routes',
        day: day?.captured[0]
      }],
      suggestions: [
        { text: 'Muéstrame cuánto tiempo ahorré', action: 'stats' }
      ],
      confidence: 0.95,
      needsClarification: false,
      pendingAction: {
        type: 'optimize_routes',
        description: 'optimizar las rutas'
      }
    };
  }

  /**
   * ✨ Generate recommendation response
   */
  generateRecommendationResponse(turn) {
    // This would integrate with ML Brain's recommendation system
    return {
      text: 'Basándome en tus preferencias, te recomiendo:\n\n• Visitar Fushimi Inari al atardecer\n• Probar un onsen en Hakone\n• Explorar los cafés temáticos de Akihabara\n\n¿Te interesa alguna de estas?',
      actions: [],
      suggestions: [
        { text: 'Agregar Fushimi Inari', action: 'add' },
        { text: 'Más recomendaciones', action: 'recommend' }
      ],
      confidence: 0.75,
      needsClarification: false
    };
  }

  /**
   * 📖 Generate explanation response
   */
  generateExplanationResponse(turn) {
    const day = turn.parsed.entities.DATE;

    return {
      text: `El día ${day?.captured[0] || 'X'} está diseñado para combinar cultura y gastronomía. Empezamos temprano para evitar multitudes, luego un descanso para almorzar, y finalizamos con actividades más relajadas.`,
      actions: [],
      suggestions: [
        { text: 'Cambiar este día', action: 'regenerate' },
        { text: 'Ver estadísticas', action: 'stats' }
      ],
      confidence: 0.8,
      needsClarification: false
    };
  }

  /**
   * 📊 Generate stats response
   */
  generateStatsResponse(turn) {
    return {
      text: '📊 **Resumen del itinerario:**\n\n• Total de días: 7\n• Actividades: 42\n• Distancia estimada: 85km\n• Presupuesto total: ¥140,000\n• Fatiga promedio: 65%\n\n¿Quieres ajustar algo?',
      actions: [],
      suggestions: [
        { text: 'Reducir fatiga', action: 'reduce_fatigue' },
        { text: 'Optimizar rutas', action: 'optimize' }
      ],
      confidence: 1.0,
      needsClarification: false
    };
  }

  /**
   * 👍 Generate acknowledgment
   */
  generateAcknowledgment(turn) {
    const responses = [
      '¡Me alegra que te guste! 😊',
      '¡Genial! ¿Algo más en lo que pueda ayudarte?',
      '¡De nada! Estoy aquí para ayudarte.',
      '¡Gracias! Si necesitas algo más, avísame.'
    ];

    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      actions: [],
      suggestions: [
        { text: 'Ver resumen final', action: 'stats' },
        { text: 'Exportar itinerario', action: 'export' }
      ],
      confidence: 1.0,
      needsClarification: false
    };
  }

  /**
   * 😞 Generate complaint response
   */
  generateComplaintResponse(turn) {
    return {
      text: 'Lo siento si algo no está funcionando como esperabas. ¿Podrías decirme qué te gustaría cambiar? Estoy aquí para mejorar tu itinerario.',
      actions: [],
      suggestions: [
        { text: 'Regenerar todo', action: 'regenerate_all' },
        { text: 'Ajustar preferencias', action: 'adjust_prefs' }
      ],
      confidence: 0.7,
      needsClarification: false
    };
  }

  /**
   * 🆘 Generate fallback response
   */
  generateFallbackResponse(turn) {
    return {
      text: 'Hmm, no estoy seguro de cómo ayudarte con eso. ¿Podrías reformularlo o elegir una de estas opciones?',
      actions: [],
      suggestions: [
        { text: 'Ver ayuda', action: 'help' },
        { text: 'Recomiéndame algo', action: 'recommend' }
      ],
      confidence: 0.2,
      needsClarification: true
    };
  }

  /**
   * 🔄 Update conversation state
   */
  updateConversationState(turn) {
    // Add turn to conversation
    this.conversation.turns.push(turn);

    // Update current topic
    if (turn.parsed.intent.action) {
      this.conversation.currentTopic = turn.parsed.intent.action;
    }

    // Update active intents
    this.conversation.activeIntents.push({
      intent: turn.parsed.intent.intent,
      timestamp: turn.timestamp
    });

    // Keep only last 10 active intents
    if (this.conversation.activeIntents.length > 10) {
      this.conversation.activeIntents = this.conversation.activeIntents.slice(-10);
    }
  }

  /**
   * 🧠 Update memory systems
   */
  updateMemory(turn) {
    // Update short-term memory (last 5 turns)
    this.memory.shortTerm.push(turn);
    if (this.memory.shortTerm.length > 5) {
      this.memory.shortTerm = this.memory.shortTerm.slice(-5);
    }

    // Update working memory (current goal)
    if (turn.response.actions && turn.response.actions.length > 0) {
      this.memory.working.currentGoal = turn.response.actions[0].type;
      this.memory.working.startedAt = turn.timestamp;
    }

    // Add to episodic memory if significant
    if (turn.response.confidence > 0.8 || turn.parsed.sentiment.label === 'positive') {
      this.memory.episodic.push({
        summary: turn.userMessage.slice(0, 100),
        intent: turn.parsed.intent.intent,
        sentiment: turn.parsed.sentiment.label,
        timestamp: turn.timestamp
      });

      // Keep only last 50 episodes
      if (this.memory.episodic.length > 50) {
        this.memory.episodic = this.memory.episodic.slice(-50);
      }
    }
  }

  /**
   * 💾 Save dialogue state
   */
  async saveState() {
    if (!window.MLStorage) return;

    await window.MLStorage.set('dialogue_state', {
      memory: {
        longTerm: this.memory.longTerm,
        episodic: this.memory.episodic
      },
      userProfile: this.conversation.userProfile,
      timestamp: Date.now()
    });
  }

  /**
   * 🔑 Generate conversation ID
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * 💡 Generate suggestions based on context
   */
  generateSuggestions(intents) {
    const suggestions = [];

    for (const intent of intents) {
      switch (intent) {
        case 'clarify':
          suggestions.push({ text: 'Explicar mejor', action: 'clarify' });
          break;
        case 'help':
          suggestions.push({ text: 'Mostrar ayuda', action: 'help' });
          break;
        default:
          suggestions.push({ text: intent, action: intent });
      }
    }

    return suggestions.slice(0, 3); // Max 3 suggestions
  }

  /**
   * 📝 Convert intent to human-readable text
   */
  intentToHumanReadable(intent) {
    const mapping = {
      ADD_ACTIVITY: 'Agregar actividades',
      REMOVE_ACTIVITY: 'Quitar actividades',
      CHANGE_BUDGET: 'Ajustar presupuesto',
      CHANGE_PACE: 'Cambiar ritmo',
      OPTIMIZE_ROUTE: 'Optimizar rutas',
      REGENERATE_DAY: 'Regenerar día',
      GET_RECOMMENDATIONS: 'Obtener recomendaciones',
      EXPLAIN: 'Explicar decisiones',
      GET_STATS: 'Ver estadísticas'
    };

    return mapping[intent] || intent;
  }

  /**
   * 📊 Get dialogue statistics
   */
  getStats() {
    return {
      conversationLength: this.conversation.turns.length,
      currentTopic: this.conversation.currentTopic,
      shortTermMemorySize: this.memory.shortTerm.length,
      longTermMemorySize: Object.keys(this.memory.longTerm).length,
      episodicMemorySize: this.memory.episodic.length,
      averageConfidence: this.conversation.turns.reduce((sum, t) => sum + (t.response?.confidence || 0), 0) / Math.max(this.conversation.turns.length, 1)
    };
  }

  /**
   * 🧹 Clear conversation (start fresh)
   */
  clearConversation() {
    this.conversation = {
      id: this.generateConversationId(),
      startTime: Date.now(),
      turns: [],
      currentTopic: null,
      activeIntents: [],
      pendingQuestions: [],
      userProfile: this.conversation.userProfile // Keep profile
    };

    this.memory.shortTerm = [];
    this.memory.working = {};

    console.log('🧹 Conversation cleared');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.DialogueManager = new DialogueManager();

  // Auto-initialize (check if DOM already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.DialogueManager.initialize().catch(e => {
        console.error('Failed to initialize Dialogue Manager:', e);
      });
    });
  } else {
    // DOM already loaded, initialize immediately
    window.DialogueManager.initialize().catch(e => {
      console.error('Failed to initialize Dialogue Manager:', e);
    });
  }

  console.log('💬 Dialogue Manager loaded!');
}
