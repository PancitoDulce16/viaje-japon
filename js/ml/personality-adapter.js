/**
 * 🎭 PERSONALITY & TONE ADAPTATION ENGINE
 * ========================================
 *
 * Adapts AI personality and tone to match user's conversation style
 * Makes conversations feel more natural and personalized
 */

class PersonalityAdapter {
  constructor() {
    this.initialized = false;
    this.userStyle = null;
    this.adaptationLevel = 0.7; // How much to adapt (0-1)
    this.basePersonality = {
      friendliness: 0.8,
      formality: 0.4,
      enthusiasm: 0.7,
      helpfulness: 0.9,
      humor: 0.3
    };
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🎭 Personality Adapter initializing...');

    // Load saved adaptation settings
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('personality_adaptation');
      if (stored) {
        this.adaptationLevel = stored.adaptationLevel || 0.7;
        this.basePersonality = stored.basePersonality || this.basePersonality;
      }
    }

    this.initialized = true;
    console.log('✅ Personality Adapter ready');
  }

  /**
   * Analyze user's conversation style and adapt
   */
  analyzeAndAdapt() {
    if (!window.ConversationalMemory || !window.ConversationalMemory.initialized) {
      return this.basePersonality;
    }

    const style = window.ConversationalMemory.detectConversationStyle();
    const patterns = window.ConversationalMemory.detectPatterns();

    this.userStyle = style;

    // Create adapted personality
    const adapted = { ...this.basePersonality };

    // 1. FORMALITY ADAPTATION
    if (style.tone === 'casual') {
      adapted.formality = this.lerp(adapted.formality, 0.2, this.adaptationLevel);
      adapted.enthusiasm = this.lerp(adapted.enthusiasm, 0.9, this.adaptationLevel);
      adapted.humor = this.lerp(adapted.humor, 0.5, this.adaptationLevel);
    } else {
      adapted.formality = this.lerp(adapted.formality, 0.7, this.adaptationLevel);
      adapted.enthusiasm = this.lerp(adapted.enthusiasm, 0.5, this.adaptationLevel);
      adapted.humor = this.lerp(adapted.humor, 0.1, this.adaptationLevel);
    }

    // 2. MESSAGE LENGTH ADAPTATION
    if (style.length === 'short') {
      // User prefers brief messages - be concise
      adapted.verbosity = 0.3;
    } else if (style.length === 'long') {
      // User writes long messages - can be more detailed
      adapted.verbosity = 0.8;
    } else {
      adapted.verbosity = 0.5;
    }

    // 3. EMOJI ADAPTATION
    if (style.usesEmojis) {
      adapted.emojiUsage = 0.7;
    } else {
      adapted.emojiUsage = 0.1;
    }

    // 4. TIME OF DAY ADAPTATION
    if (patterns.preferredTime) {
      adapted.greeting = this.getTimeBasedGreeting(patterns.preferredTime);
    }

    console.log('🎭 Adapted personality:', adapted);
    return adapted;
  }

  /**
   * Adapt response text based on user style
   */
  adaptResponse(baseResponse, metadata = {}) {
    if (!this.userStyle && window.ConversationalMemory) {
      this.userStyle = window.ConversationalMemory.detectConversationStyle();
    }

    if (!this.userStyle) {
      return baseResponse;
    }

    let adapted = baseResponse;
    const personality = this.analyzeAndAdapt();

    // 1. EMOJI ADAPTATION
    if (personality.emojiUsage < 0.3) {
      // Remove emojis if user doesn't use them
      adapted = adapted.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    } else if (personality.emojiUsage > 0.6 && !this.hasEmojis(adapted)) {
      // Add appropriate emojis if user uses them
      adapted = this.addContextualEmojis(adapted, metadata);
    }

    // 2. FORMALITY ADAPTATION
    if (personality.formality < 0.3) {
      // Make more casual
      adapted = this.makeCasual(adapted);
    } else if (personality.formality > 0.6) {
      // Make more formal
      adapted = this.makeFormal(adapted);
    }

    // 3. LENGTH ADAPTATION
    if (personality.verbosity < 0.4 && adapted.length > 200) {
      // Shorten response
      adapted = this.shortenResponse(adapted);
    } else if (personality.verbosity > 0.7 && adapted.length < 100) {
      // Add more detail
      adapted = this.expandResponse(adapted, metadata);
    }

    // 4. ENTHUSIASM ADAPTATION
    if (personality.enthusiasm > 0.7) {
      adapted = this.addEnthusiasm(adapted);
    } else if (personality.enthusiasm < 0.3) {
      adapted = this.reduceEnthusiasm(adapted);
    }

    return adapted;
  }

  /**
   * Linear interpolation helper
   */
  lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  /**
   * Check if text has emojis
   */
  hasEmojis(text) {
    return /[\u{1F300}-\u{1F9FF}]/u.test(text);
  }

  /**
   * Add contextual emojis based on message type
   */
  addContextualEmojis(text, metadata) {
    const { intent, sentiment } = metadata;

    const emojiMap = {
      greeting: ['👋', '😊', '🙏'],
      farewell: ['👋', '✨', '🌸'],
      recommend: ['💡', '✨', '🎌'],
      optimizeRoute: ['🗺️', '✅', '🚆'],
      showStats: ['📊', '📈', '🔍'],
      addActivity: ['✅', '➕', '🎯'],
      success: ['✅', '🎉', '👍'],
      error: ['⚠️', '🤔', '❌']
    };

    let emoji = '';
    if (intent && emojiMap[intent]) {
      emoji = emojiMap[intent][Math.floor(Math.random() * emojiMap[intent].length)];
    } else if (sentiment === 'positive' && emojiMap.success) {
      emoji = emojiMap.success[Math.floor(Math.random() * emojiMap.success.length)];
    }

    if (emoji) {
      // Add emoji at the beginning or end
      return Math.random() > 0.5 ? `${emoji} ${text}` : `${text} ${emoji}`;
    }

    return text;
  }

  /**
   * Make text more casual
   */
  makeCasual(text) {
    const replacements = {
      'Por favor': 'Porfa',
      'Muchas gracias': 'Gracias!',
      'Le puedo': 'Te puedo',
      'Usted': 'Tú',
      'quisiera': 'quiero',
      'podría': 'puedes',
      'Disculpe': 'Oye',
      'Excelente': 'Genial',
      'Perfecto': 'Perfecto!',
      'De acuerdo': 'Dale'
    };

    let casual = text;
    for (const [formal, casualForm] of Object.entries(replacements)) {
      casual = casual.replace(new RegExp(formal, 'gi'), casualForm);
    }

    return casual;
  }

  /**
   * Make text more formal
   */
  makeFormal(text) {
    const replacements = {
      'Porfa': 'Por favor',
      'Genial': 'Excelente',
      'Dale': 'De acuerdo',
      'Oye': 'Disculpe',
      '!': '.',
      'jaja': '',
      'jeje': ''
    };

    let formal = text;
    for (const [casual, formalForm] of Object.entries(replacements)) {
      formal = formal.replace(new RegExp(casual, 'gi'), formalForm);
    }

    return formal;
  }

  /**
   * Shorten response for users who prefer brief messages
   */
  shortenResponse(text) {
    // Split into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());

    if (sentences.length <= 2) {
      return text; // Already short
    }

    // Keep first sentence and last sentence (usually most important)
    return `${sentences[0].trim()}. ${sentences[sentences.length - 1].trim()}.`;
  }

  /**
   * Expand response for users who prefer detailed messages
   */
  expandResponse(text, metadata) {
    const { intent } = metadata;

    const expansions = {
      recommend: '\n\n¿Te gustaría que profundice en alguna recomendación específica?',
      showStats: '\n\n¿Quieres que analice algo en particular?',
      optimizeRoute: '\n\n¿Hay algún día específico que te gustaría optimizar?',
      default: '\n\n¿En qué más puedo ayudarte?'
    };

    const expansion = expansions[intent] || expansions.default;
    return text + expansion;
  }

  /**
   * Add enthusiasm to response
   */
  addEnthusiasm(text) {
    // Add exclamation marks strategically
    let enthusiastic = text.replace(/\.$/, '!');

    // Add positive intensifiers
    enthusiastic = enthusiastic
      .replace(/bueno/gi, 'muy bueno')
      .replace(/bien/gi, 'súper bien')
      .replace(/interesante/gi, 'muy interesante');

    return enthusiastic;
  }

  /**
   * Reduce enthusiasm to sound more neutral
   */
  reduceEnthusiasm(text) {
    let neutral = text.replace(/!/g, '.');

    // Remove intensifiers
    neutral = neutral
      .replace(/muy\s+/gi, '')
      .replace(/súper\s+/gi, '')
      .replace(/increíble/gi, 'bueno')
      .replace(/genial/gi, 'bien');

    return neutral;
  }

  /**
   * Get time-based greeting
   */
  getTimeBasedGreeting(timeOfDay) {
    const greetings = {
      morning: ['Buenos días', 'Buen día', '¡Hola! ☀️'],
      afternoon: ['Buenas tardes', '¡Hola!', 'Buenas'],
      evening: ['Buenas noches', '¡Hola!', 'Buenas'],
      night: ['¡Hola!', 'Buenas noches', 'Hey']
    };

    const options = greetings[timeOfDay] || greetings.afternoon;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get personality description for debugging
   */
  describePersonality(personality) {
    const traits = [];

    if (personality.formality > 0.6) traits.push('formal');
    else if (personality.formality < 0.4) traits.push('casual');

    if (personality.enthusiasm > 0.7) traits.push('enthusiastic');
    else if (personality.enthusiasm < 0.3) traits.push('neutral');

    if (personality.emojiUsage > 0.6) traits.push('expressive');
    else if (personality.emojiUsage < 0.3) traits.push('text-only');

    if (personality.verbosity > 0.7) traits.push('detailed');
    else if (personality.verbosity < 0.4) traits.push('concise');

    return traits.join(', ');
  }

  /**
   * Save adaptation settings
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('personality_adaptation', {
        adaptationLevel: this.adaptationLevel,
        basePersonality: this.basePersonality,
        lastUpdated: Date.now()
      });
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.PersonalityAdapter = new PersonalityAdapter();
  console.log('🎭 Personality Adapter loaded!');
}
