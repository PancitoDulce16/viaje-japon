/**
 * 🎨 FASE 18: ADAPTIVE RESPONSE GENERATION
 * =========================================
 *
 * "Respuestas que se adaptan a TI"
 *
 * Sistema que aprende CÓMO te gusta que te respondan:
 * 1. Nivel de detalle (conciso vs detallado)
 * 2. Tono (formal vs casual)
 * 3. Uso de emojis
 * 4. Longitud de respuestas
 * 5. Estilo de explicaciones
 *
 * APRENDE DE:
 * - Longitud de tus mensajes → ajusta longitud de respuestas
 * - Tu uso de emojis → ajusta uso de emojis
 * - Feedback implícito (¿sigues preguntando? = necesitas más detalle)
 * - Hora del día (noche = más casual?)
 * - Tipo de dispositivo (móvil = más conciso)
 *
 * EJEMPLO:
 * Usuario siempre escribe mensajes cortos sin emojis →
 * IA adapta: respuestas concisas, sin emojis, directas
 *
 * Usuario escribe mensajes largos con emojis →
 * IA adapta: respuestas detalladas, con emojis, amigables
 *
 * ESTRATEGIAS:
 * - Mirror Matching: Imita el estilo del usuario
 * - Progressive Adaptation: Aprende con el tiempo
 * - Context-Aware: Adapta según la situación
 */

class AdaptiveResponseGeneration {
  constructor() {
    this.initialized = false;

    // User style profile (aprende con el tiempo)
    this.userStyle = {
      // Message characteristics
      avgMessageLength: 50,        // Average characters
      prefersEmojis: null,          // null = unknown, true/false
      prefersFormality: 'balanced', // 'formal', 'casual', 'balanced'
      prefersDetail: 'medium',      // 'brief', 'medium', 'detailed'

      // Communication patterns
      asksFollowUp: 0,              // Ratio of follow-up questions
      messageFrequency: 0,          // Messages per minute

      // Learning metrics
      samplesCollected: 0,
      lastUpdated: Date.now()
    };

    // Response templates by style
    this.templates = {
      greeting: {
        formal: '¡Hola! Soy tu asistente de viajes a Japón. ¿En qué puedo ayudarte?',
        casual: '¡Hey! 😊 ¿Qué necesitas para tu viaje a Japón?',
        balanced: '¡Hola! ¿En qué puedo ayudarte con tu viaje?'
      },

      confirmation: {
        formal: 'Entendido. He procesado tu solicitud.',
        casual: '¡Listo! 👍',
        balanced: 'Perfecto, hecho.'
      },

      explanation: {
        brief: 'Por rating alto y cercanía.',
        medium: 'Te recomendé esto por su excelente rating (4.8/5) y ubicación cercana.',
        detailed: 'Te recomendé este lugar por tres factores principales: tiene un rating excelente de 4.8/5 estrellas basado en más de 5000 reviews, está ubicado a solo 2km de tu posición actual, y coincide perfectamente con tus intereses en templos tradicionales.'
      }
    };

    // Adaptation rules
    this.adaptationRules = {
      messageLength: {
        short: { max: 30, responseStyle: 'brief' },
        medium: { min: 30, max: 100, responseStyle: 'medium' },
        long: { min: 100, responseStyle: 'detailed' }
      },

      emojiUsage: {
        threshold: 0.3  // If user uses emojis >30% of time, use them
      },

      formality: {
        indicators: {
          formal: ['usted', 'agradezco', 'podría', 'disculpe', 'gracias'],
          casual: ['q tal', 'wenas', 'ok', 'ya', 'dale', 'genial']
        }
      }
    };

    // Message history for learning
    this.messageHistory = [];

    // Statistics
    this.stats = {
      responsesGenerated: 0,
      adaptationsApplied: 0,
      styleChanges: 0
    };

    console.log('🎨 Adaptive Response Generation initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load user style profile
    await this.loadUserStyle();

    this.initialized = true;
    console.log('✅ Adaptive Response Generation ready');
    console.log(`📊 User style: ${this.userStyle.prefersDetail} detail, ${this.userStyle.prefersFormality} tone`);
  }

  /**
   * 📝 LEARNING FROM USER
   */

  /**
   * Observe user message and update style profile
   */
  observeUserMessage(message) {
    // Extract features
    const features = {
      length: message.length,
      hasEmojis: this.detectEmojis(message),
      emojiCount: this.countEmojis(message),
      formality: this.detectFormality(message),
      timestamp: Date.now()
    };

    // Add to history
    this.messageHistory.push({
      message,
      features,
      timestamp: Date.now()
    });

    // Keep last 50 messages
    if (this.messageHistory.length > 50) {
      this.messageHistory = this.messageHistory.slice(-50);
    }

    // Update profile every 5 messages
    if (this.messageHistory.length % 5 === 0) {
      this.updateUserStyleProfile();
    }

    return features;
  }

  /**
   * Update user style profile based on observations
   */
  updateUserStyleProfile() {
    if (this.messageHistory.length < 3) return;  // Need minimum data

    const recent = this.messageHistory.slice(-10);  // Last 10 messages

    // Update average message length
    const avgLength = recent.reduce((sum, m) => sum + m.features.length, 0) / recent.length;
    this.userStyle.avgMessageLength = avgLength;

    // Update emoji preference
    const emojiMessages = recent.filter(m => m.features.hasEmojis).length;
    const emojiRatio = emojiMessages / recent.length;

    if (emojiRatio > this.adaptationRules.emojiUsage.threshold) {
      if (this.userStyle.prefersEmojis !== true) {
        this.userStyle.prefersEmojis = true;
        this.stats.styleChanges++;
        console.log('😊 User prefers emojis - adapting');
      }
    } else {
      if (this.userStyle.prefersEmojis !== false) {
        this.userStyle.prefersEmojis = false;
        this.stats.styleChanges++;
        console.log('📝 User prefers no emojis - adapting');
      }
    }

    // Update formality preference
    const formalMessages = recent.filter(m => m.features.formality === 'formal').length;
    const casualMessages = recent.filter(m => m.features.formality === 'casual').length;

    if (formalMessages > casualMessages + 2) {
      if (this.userStyle.prefersFormality !== 'formal') {
        this.userStyle.prefersFormality = 'formal';
        this.stats.styleChanges++;
        console.log('🎩 User prefers formal - adapting');
      }
    } else if (casualMessages > formalMessages + 2) {
      if (this.userStyle.prefersFormality !== 'casual') {
        this.userStyle.prefersFormality = 'casual';
        this.stats.styleChanges++;
        console.log('👋 User prefers casual - adapting');
      }
    } else {
      this.userStyle.prefersFormality = 'balanced';
    }

    // Update detail preference based on message length
    if (avgLength < 30) {
      this.userStyle.prefersDetail = 'brief';
    } else if (avgLength < 100) {
      this.userStyle.prefersDetail = 'medium';
    } else {
      this.userStyle.prefersDetail = 'detailed';
    }

    this.userStyle.samplesCollected = this.messageHistory.length;
    this.userStyle.lastUpdated = Date.now();

    this.saveUserStyle();
  }

  /**
   * 🎨 RESPONSE GENERATION
   */

  /**
   * Generate adaptive response
   */
  generateResponse(baseResponse, context = {}) {
    this.stats.responsesGenerated++;

    // Apply adaptations
    let adaptedResponse = baseResponse;

    // Adaptation 1: Adjust length/detail
    adaptedResponse = this.adjustDetailLevel(adaptedResponse, context);

    // Adaptation 2: Adjust formality
    adaptedResponse = this.adjustFormality(adaptedResponse);

    // Adaptation 3: Adjust emoji usage
    adaptedResponse = this.adjustEmojis(adaptedResponse);

    // Adaptation 4: Adjust structure
    adaptedResponse = this.adjustStructure(adaptedResponse);

    this.stats.adaptationsApplied++;

    console.log(`🎨 Generated adaptive response (${this.userStyle.prefersDetail}, ${this.userStyle.prefersFormality})`);

    return {
      response: adaptedResponse,
      style: {
        detailLevel: this.userStyle.prefersDetail,
        formality: this.userStyle.prefersFormality,
        hasEmojis: this.userStyle.prefersEmojis
      }
    };
  }

  /**
   * Adjust detail level
   */
  adjustDetailLevel(response, context) {
    const detailLevel = this.userStyle.prefersDetail;

    // If response is already short, don't shorten further
    if (response.length < 100) return response;

    switch (detailLevel) {
      case 'brief':
        // Extract main point (first sentence)
        const firstSentence = response.split(/[.!?]/)[0];
        return firstSentence + '.';

      case 'medium':
        // Keep main points (first 2-3 sentences)
        const sentences = response.split(/[.!?]/).filter(s => s.trim());
        return sentences.slice(0, 2).join('. ') + '.';

      case 'detailed':
        // Keep full response
        return response;

      default:
        return response;
    }
  }

  /**
   * Adjust formality
   */
  adjustFormality(response) {
    const formality = this.userStyle.prefersFormality;

    if (formality === 'formal') {
      // Make more formal
      response = response.replace(/ok/gi, 'de acuerdo');
      response = response.replace(/ya/gi, 'entendido');
      response = response.replace(/dale/gi, 'perfecto');
      response = response.replace(/genial/gi, 'excelente');
    } else if (formality === 'casual') {
      // Make more casual
      response = response.replace(/entendido/gi, 'ok');
      response = response.replace(/de acuerdo/gi, 'dale');
      response = response.replace(/excelente/gi, 'genial');
    }

    return response;
  }

  /**
   * Adjust emoji usage
   */
  adjustEmojis(response) {
    const prefersEmojis = this.userStyle.prefersEmojis;

    if (prefersEmojis === false) {
      // Remove all emojis
      return response.replace(/[\u{1F600}-\u{1F64F}]/gu, '')  // Emoticons
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')  // Symbols & Pictographs
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')  // Transport & Map
        .replace(/[\u{2600}-\u{26FF}]/gu, '')    // Misc symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '')    // Dingbats
        .trim();
    } else if (prefersEmojis === true) {
      // Add appropriate emojis if not present
      if (!this.hasEmojis(response)) {
        // Add context-appropriate emoji
        if (response.includes('perfecto') || response.includes('excelente')) {
          response = '✅ ' + response;
        } else if (response.includes('recomiendo') || response.includes('suger')) {
          response = '🎯 ' + response;
        } else if (response.includes('templo') || response.includes('santuario')) {
          response = '⛩️ ' + response;
        }
      }
    }

    return response;
  }

  /**
   * Adjust structure (bullets vs paragraphs)
   */
  adjustStructure(response) {
    const detailLevel = this.userStyle.prefersDetail;

    // Brief = no structure changes
    if (detailLevel === 'brief') {
      return response;
    }

    // If response has list items, keep them
    // If user prefers detailed, add structure
    if (detailLevel === 'detailed' && !response.includes('\n') && response.length > 150) {
      // Try to break into bullets if it has multiple points
      const sentences = response.split(/\.\s+/).filter(s => s.trim());

      if (sentences.length > 2) {
        return sentences.map((s, i) => `${i + 1}. ${s}`).join('\n') + '.';
      }
    }

    return response;
  }

  /**
   * 🔍 DETECTION FUNCTIONS
   */

  /**
   * Detect if message has emojis
   */
  detectEmojis(text) {
    return /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu.test(text);
  }

  /**
   * Count emojis in text
   */
  countEmojis(text) {
    const matches = text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu);
    return matches ? matches.length : 0;
  }

  /**
   * Detect formality level
   */
  detectFormality(text) {
    const lowerText = text.toLowerCase();

    let formalScore = 0;
    let casualScore = 0;

    // Check formal indicators
    for (const indicator of this.adaptationRules.formality.indicators.formal) {
      if (lowerText.includes(indicator)) formalScore++;
    }

    // Check casual indicators
    for (const indicator of this.adaptationRules.formality.indicators.casual) {
      if (lowerText.includes(indicator)) casualScore++;
    }

    if (formalScore > casualScore) return 'formal';
    if (casualScore > formalScore) return 'casual';
    return 'balanced';
  }

  /**
   * Check if text has emojis
   */
  hasEmojis(text) {
    return this.detectEmojis(text);
  }

  /**
   * 💾 PERSISTENCE
   */

  async loadUserStyle() {
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('adaptive_response_user_style');

      if (stored) {
        this.userStyle = stored.userStyle || this.userStyle;
        this.messageHistory = stored.messageHistory || [];
        this.stats = stored.stats || this.stats;

        console.log('💾 Loaded user style profile');
      }
    }
  }

  async saveUserStyle() {
    if (window.MLStorage) {
      await window.MLStorage.set('adaptive_response_user_style', {
        userStyle: this.userStyle,
        messageHistory: this.messageHistory.slice(-50),  // Last 50
        stats: this.stats,
        lastUpdate: Date.now()
      });
    }
  }

  /**
   * Reset user style
   */
  resetUserStyle() {
    this.userStyle = {
      avgMessageLength: 50,
      prefersEmojis: null,
      prefersFormality: 'balanced',
      prefersDetail: 'medium',
      asksFollowUp: 0,
      messageFrequency: 0,
      samplesCollected: 0,
      lastUpdated: Date.now()
    };

    this.messageHistory = [];
    this.saveUserStyle();

    console.log('🔄 User style reset');
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      userStyle: this.userStyle,
      messageHistorySize: this.messageHistory.length
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.AdaptiveResponseGeneration = new AdaptiveResponseGeneration();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AdaptiveResponseGeneration.initialize();
    });
  } else {
    window.AdaptiveResponseGeneration.initialize();
  }

  console.log('🎨 Adaptive Response Generation loaded!');
}
