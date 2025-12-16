/**
 * 🧠 CONVERSATIONAL MEMORY ENGINE
 * ================================
 *
 * Advanced memory system that remembers conversation context
 * Enables multi-turn conversations and contextual understanding
 */

class ConversationalMemory {
  constructor() {
    this.initialized = false;
    this.conversationHistory = [];
    this.entityMemory = new Map(); // Remember extracted entities
    this.topicStack = []; // Track conversation topics
    this.userPreferences = {};
    this.lastIntents = [];
    this.pendingActions = [];
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🧠 Conversational Memory initializing...');

    // Load from storage
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('conversational_memory');
      if (stored) {
        this.conversationHistory = stored.history || [];
        this.userPreferences = stored.preferences || {};
        this.entityMemory = new Map(stored.entities || []);
      }
    }

    this.initialized = true;
    console.log('✅ Conversational Memory ready with', this.conversationHistory.length, 'messages');
  }

  /**
   * Add a message to conversation history
   */
  addMessage(role, content, metadata = {}) {
    const message = {
      role, // 'user' or 'assistant'
      content,
      timestamp: Date.now(),
      metadata
    };

    this.conversationHistory.push(message);

    // Keep only last 50 messages
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }

    // Extract and remember entities
    if (metadata.entities) {
      this.rememberEntities(metadata.entities);
    }

    // Track intent
    if (metadata.intent) {
      this.lastIntents.push(metadata.intent);
      if (this.lastIntents.length > 10) {
        this.lastIntents.shift();
      }
    }

    // Update topic if changed
    if (metadata.topic) {
      this.updateTopic(metadata.topic);
    }

    this.save();
  }

  /**
   * Remember entities for future context
   */
  rememberEntities(entities) {
    for (const [type, value] of Object.entries(entities)) {
      if (value && value.captured && value.captured.length > 0) {
        // Store with timestamp
        this.entityMemory.set(type, {
          value: value.captured[0],
          timestamp: Date.now(),
          confidence: value.confidence || 1.0
        });
      }
    }
  }

  /**
   * Get last mentioned entity of a type
   */
  getLastEntity(type) {
    const entity = this.entityMemory.get(type);

    // Return if recent (within 5 minutes)
    if (entity && Date.now() - entity.timestamp < 300000) {
      return entity.value;
    }

    return null;
  }

  /**
   * Update conversation topic
   */
  updateTopic(topic) {
    // If same topic, don't duplicate
    if (this.topicStack.length > 0 && this.topicStack[this.topicStack.length - 1] === topic) {
      return;
    }

    this.topicStack.push(topic);

    // Keep only last 5 topics
    if (this.topicStack.length > 5) {
      this.topicStack.shift();
    }
  }

  /**
   * Get current conversation topic
   */
  getCurrentTopic() {
    return this.topicStack[this.topicStack.length - 1] || 'general';
  }

  /**
   * Get conversation context for AI
   */
  getContext() {
    const recentMessages = this.conversationHistory.slice(-10);
    const currentTopic = this.getCurrentTopic();
    const recentIntents = this.lastIntents.slice(-5);

    return {
      recentMessages,
      currentTopic,
      recentIntents,
      messageCount: this.conversationHistory.length,
      userPreferences: this.userPreferences,
      pendingActions: this.pendingActions
    };
  }

  /**
   * Infer missing parameters from context
   */
  inferParameters(requiredParams) {
    const inferred = {};

    for (const param of requiredParams) {
      // Try to infer from entity memory
      switch (param) {
        case 'day':
        case 'dayNumber':
          const lastDay = this.getLastEntity('DATE');
          if (lastDay) inferred[param] = parseInt(lastDay);
          break;

        case 'category':
          const lastCategory = this.getLastEntity('CATEGORY');
          if (lastCategory) inferred[param] = lastCategory;
          break;

        case 'location':
          const lastLocation = this.getLastEntity('LOCATION');
          if (lastLocation) inferred[param] = lastLocation;
          break;

        case 'activityName':
          const lastPlace = this.getLastEntity('PLACE_NAME');
          if (lastPlace) inferred[param] = lastPlace;
          break;
      }
    }

    return inferred;
  }

  /**
   * Detect if user is following up on previous message
   */
  isFollowUp(currentInput) {
    if (this.conversationHistory.length < 2) return false;

    const followUpPhrases = [
      /^(si|sí|ok|okay|dale|perfecto|claro|exacto)/i,
      /^(no|nope|nah|tampoco)/i,
      /^(y\s+)?(?:eso|esto|lo\s+mismo)/i,
      /^(?:el|la|los|las)\s+(?:mismo|misma|mismos|mismas)/i,
      /^tambien/i,
      /^otro/i
    ];

    return followUpPhrases.some(pattern => pattern.test(currentInput.trim()));
  }

  /**
   * Get suggested next actions based on context
   */
  getSuggestedNextActions() {
    const lastIntent = this.lastIntents[this.lastIntents.length - 1];
    const suggestions = [];

    if (!lastIntent) {
      return [
        { text: 'Ver estadísticas', action: 'showStats', icon: '📊' },
        { text: 'Analizar viaje', action: 'recommend', icon: '🔍' },
        { text: 'Optimizar ruta', action: 'optimizeRoute', icon: '🗺️' }
      ];
    }

    // Suggest logical next steps based on last intent
    switch (lastIntent.action || lastIntent) {
      case 'showStats':
        suggestions.push(
          { text: 'Analizar en profundidad', action: 'recommend', icon: '🔍' },
          { text: 'Optimizar ruta', action: 'optimizeRoute', icon: '🗺️' },
          { text: 'Agregar actividades', action: 'addActivity', icon: '➕' }
        );
        break;

      case 'recommend':
        suggestions.push(
          { text: 'Agregar sugerencias', action: 'addActivity', icon: '➕' },
          { text: 'Optimizar ruta', action: 'optimizeRoute', icon: '🗺️' },
          { text: 'Ver presupuesto', action: 'showBudget', icon: '💰' }
        );
        break;

      case 'addActivity':
        suggestions.push(
          { text: 'Agregar más', action: 'addActivity', icon: '➕' },
          { text: 'Ver estadísticas', action: 'showStats', icon: '📊' },
          { text: 'Optimizar orden', action: 'optimizeRoute', icon: '🗺️' }
        );
        break;

      case 'optimizeRoute':
        suggestions.push(
          { text: 'Ver resultados', action: 'showStats', icon: '📊' },
          { text: 'Más recomendaciones', action: 'recommend', icon: '💡' },
          { text: 'Abrir timeline', action: 'openTimeline', icon: '📸' }
        );
        break;

      default:
        suggestions.push(
          { text: 'Analizar viaje', action: 'recommend', icon: '🔍' },
          { text: 'Ver estadísticas', action: 'showStats', icon: '📊' },
          { text: 'Optimizar ruta', action: 'optimizeRoute', icon: '🗺️' }
        );
    }

    return suggestions.slice(0, 4);
  }

  /**
   * Learn user preferences
   */
  learnPreference(category, value, positive = true) {
    if (!this.userPreferences[category]) {
      this.userPreferences[category] = {
        likes: [],
        dislikes: []
      };
    }

    if (positive) {
      if (!this.userPreferences[category].likes.includes(value)) {
        this.userPreferences[category].likes.push(value);
      }
    } else {
      if (!this.userPreferences[category].dislikes.includes(value)) {
        this.userPreferences[category].dislikes.push(value);
      }
    }

    this.save();
  }

  /**
   * Get user preference for something
   */
  getUserPreference(category) {
    return this.userPreferences[category] || { likes: [], dislikes: [] };
  }

  /**
   * Detect patterns in user behavior
   */
  detectPatterns() {
    const patterns = {
      mostUsedIntents: this.getMostFrequentIntents(),
      conversationStyle: this.detectConversationStyle(),
      preferredTime: this.detectPreferredTime(),
      topicPreferences: this.detectTopicPreferences()
    };

    return patterns;
  }

  /**
   * Get most frequent intents
   */
  getMostFrequentIntents() {
    const counts = {};

    this.lastIntents.forEach(intent => {
      const action = intent.action || intent;
      counts[action] = (counts[action] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([intent, count]) => ({ intent, count }));
  }

  /**
   * Detect conversation style
   */
  detectConversationStyle() {
    const userMessages = this.conversationHistory
      .filter(m => m.role === 'user')
      .slice(-10);

    const avgLength = userMessages.reduce((sum, m) =>
      sum + m.content.length, 0) / userMessages.length || 0;

    const hasEmojis = userMessages.some(m =>
      /[\u{1F300}-\u{1F9FF}]/u.test(m.content));

    const isCasual = userMessages.some(m =>
      /\b(jaja|jeje|lol|xd)\b/i.test(m.content));

    return {
      length: avgLength < 30 ? 'short' : avgLength < 80 ? 'medium' : 'long',
      tone: isCasual ? 'casual' : 'formal',
      usesEmojis: hasEmojis
    };
  }

  /**
   * Detect preferred conversation time
   */
  detectPreferredTime() {
    const hours = this.conversationHistory
      .map(m => new Date(m.timestamp).getHours());

    const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;

    if (avgHour >= 6 && avgHour < 12) return 'morning';
    if (avgHour >= 12 && avgHour < 18) return 'afternoon';
    if (avgHour >= 18 && avgHour < 22) return 'evening';
    return 'night';
  }

  /**
   * Detect topic preferences
   */
  detectTopicPreferences() {
    const topicCounts = {};

    this.topicStack.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    return Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic, count]) => ({ topic, count }));
  }

  /**
   * Add pending action
   */
  addPendingAction(action, data) {
    this.pendingActions.push({
      action,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get pending action
   */
  getPendingAction() {
    return this.pendingActions.shift();
  }

  /**
   * Clear pending actions
   */
  clearPendingActions() {
    this.pendingActions = [];
  }

  /**
   * Save to storage
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('conversational_memory', {
        history: this.conversationHistory.slice(-50),
        preferences: this.userPreferences,
        entities: Array.from(this.entityMemory.entries())
      });
    }
  }

  /**
   * Clear conversation history
   */
  clear() {
    this.conversationHistory = [];
    this.entityMemory.clear();
    this.topicStack = [];
    this.lastIntents = [];
    this.pendingActions = [];
    this.save();
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ConversationalMemory = new ConversationalMemory();
  console.log('🧠 Conversational Memory loaded!');
}
