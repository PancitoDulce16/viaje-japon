/**
 * 🧠 SEMANTIC INTENT RECOGNITION
 * ===============================
 *
 * "Entender la intención, no solo las palabras"
 *
 * Sistema que entiende QUÉ quiere decir el usuario sin importar CÓMO lo dice.
 *
 * NO usa regex hardcodeados. USA:
 * 1. Características semánticas (longitud, repeticiones, emoción)
 * 2. Posición en conversación (inicio = probablemente saludo)
 * 3. Palabras clave semánticas (no exactas)
 * 4. Contexto conversacional
 * 5. Análisis de sentimiento
 *
 * EJEMPLOS QUE DEBE ENTENDER:
 * - "holaaaaaaaaaaa" (50 'a's) → GREETING
 * - "HOLA!!!!!!" (mayúsculas + exclamaciones) → GREETING
 * - "ey que tal amigo" → GREETING
 * - "graaaaaacias" → THANKS
 * - "okokokok" → AFFIRMATIVE
 * - "nononono" → NEGATIVE
 *
 * CARACTERÍSTICAS SEMÁNTICAS:
 * - Repetición de letras (holaaaa)
 * - Repetición de palabras (ok ok ok)
 * - Exclamaciones (!!!)
 * - Mayúsculas (HOLA)
 * - Posición en conversación
 * - Longitud
 * - Emociones detectadas
 */

class SemanticIntentRecognition {
  constructor() {
    this.initialized = false;

    // Semantic features for each intent type
    this.intentSignatures = {
      GREETING: {
        semanticRoots: ['hol', 'hey', 'hi', 'hello', 'buen', 'salud', 'que tal', 'como est', 'ey', 'wenas'],
        typicalPosition: 'start',  // Usually at conversation start
        typicalLength: 'short',    // Usually short messages
        sentiment: 'positive',
        excitement: 'medium'       // Can have excitement (hola!!!)
      },

      THANKS: {
        semanticRoots: ['graci', 'thank', 'agradec', 'ty'],
        typicalPosition: 'any',
        typicalLength: 'short',
        sentiment: 'positive',
        excitement: 'medium'
      },

      AFFIRMATIVE: {
        semanticRoots: ['si', 'ok', 'yes', 'yep', 'dale', 'claro', 'perfect', 'exact', 'correct', 'sep', 'ya'],
        typicalPosition: 'any',
        typicalLength: 'short',
        sentiment: 'positive',
        excitement: 'low'
      },

      NEGATIVE: {
        semanticRoots: ['no', 'nah', 'nope', 'nel', 'nunca', 'jamas', 'tampoco'],
        typicalPosition: 'any',
        typicalLength: 'short',
        sentiment: 'negative',
        excitement: 'low'
      },

      FAREWELL: {
        semanticRoots: ['adio', 'chao', 'bye', 'hasta', 'vemo', 'sayonara', 'mata ne', 'me voy'],
        typicalPosition: 'end',    // Usually at conversation end
        typicalLength: 'short',
        sentiment: 'neutral',
        excitement: 'medium'
      }
    };

    // Conversation context
    this.conversationState = {
      messageCount: 0,
      lastIntent: null,
      conversationStart: Date.now()
    };

    console.log('🧠 Semantic Intent Recognition initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    this.initialized = true;
    console.log('✅ Semantic Intent Recognition ready');
  }

  /**
   * 🎯 MAIN ENTRY POINT
   */

  /**
   * Recognize intent using semantic understanding
   */
  recognizeIntent(text, context = {}) {
    this.conversationState.messageCount++;

    // Extract semantic features from text
    const features = this.extractSemanticFeatures(text, context);

    console.log('🔍 Semantic features:', features);

    // Calculate scores for each intent
    const scores = {};

    for (const [intentName, signature] of Object.entries(this.intentSignatures)) {
      scores[intentName] = this.calculateIntentScore(features, signature);
    }

    // Get best match
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0.3);  // Minimum threshold

    if (sorted.length === 0) {
      return {
        intent: 'UNKNOWN',
        confidence: 0,
        reasoning: 'No semantic match found'
      };
    }

    const [intent, confidence] = sorted[0];

    // Update conversation state
    this.conversationState.lastIntent = intent;

    console.log(`✅ Semantic intent: ${intent} (confidence: ${(confidence * 100).toFixed(1)}%)`);

    return {
      intent,
      confidence,
      features,
      reasoning: this.explainRecognition(intent, features, sorted[0][1])
    };
  }

  /**
   * 🔬 SEMANTIC FEATURE EXTRACTION
   */

  /**
   * Extract semantic features from text
   */
  extractSemanticFeatures(text, context) {
    const normalized = this.normalizeText(text);

    return {
      // Text characteristics
      originalText: text,
      normalizedText: normalized,
      length: text.length,
      wordCount: text.split(/\s+/).length,

      // Repetition features
      hasLetterRepetition: this.detectLetterRepetition(text),
      letterRepetitionCount: this.countLetterRepetitions(text),
      hasWordRepetition: this.detectWordRepetition(text),

      // Emphasis features
      hasExclamation: text.includes('!'),
      exclamationCount: (text.match(/!/g) || []).length,
      hasAllCaps: text === text.toUpperCase() && text.length > 2,
      capsRatio: this.calculateCapsRatio(text),

      // Emotional features
      sentiment: this.detectSentiment(text),
      excitement: this.detectExcitement(text),

      // Contextual features
      isConversationStart: this.conversationState.messageCount <= 2,
      isShortMessage: text.length < 30,
      isVeryShortMessage: text.length < 10,

      // Semantic roots present
      semanticRoots: this.findSemanticRoots(normalized)
    };
  }

  /**
   * Normalize text for analysis
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s]/g, '')  // Remove special chars
      .trim();
  }

  /**
   * Detect letter repetition (holaaaaa)
   */
  detectLetterRepetition(text) {
    return /(.)\1{2,}/.test(text);  // Same letter 3+ times
  }

  /**
   * Count how many letter repetitions
   */
  countLetterRepetitions(text) {
    const matches = text.match(/(.)\1{2,}/g);
    return matches ? matches.length : 0;
  }

  /**
   * Detect word repetition (ok ok ok)
   */
  detectWordRepetition(text) {
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    return words.length > uniqueWords.size;
  }

  /**
   * Calculate ratio of capital letters
   */
  calculateCapsRatio(text) {
    const letters = text.replace(/[^a-zA-Z]/g, '');
    if (letters.length === 0) return 0;

    const caps = text.replace(/[^A-Z]/g, '');
    return caps.length / letters.length;
  }

  /**
   * Detect sentiment
   */
  detectSentiment(text) {
    const positiveWords = ['gracias', 'bien', 'genial', 'perfecto', 'excelente', 'bueno', 'si'];
    const negativeWords = ['no', 'mal', 'terrible', 'nunca', 'nada'];

    const normalized = text.toLowerCase();
    let score = 0;

    for (const word of positiveWords) {
      if (normalized.includes(word)) score += 1;
    }

    for (const word of negativeWords) {
      if (normalized.includes(word)) score -= 1;
    }

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  /**
   * Detect excitement level
   */
  detectExcitement(text) {
    let score = 0;

    // Exclamation marks
    score += (text.match(/!/g) || []).length * 0.3;

    // All caps
    if (text === text.toUpperCase() && text.length > 2) {
      score += 0.5;
    }

    // Letter repetition
    if (this.detectLetterRepetition(text)) {
      score += 0.4;
    }

    if (score > 0.7) return 'high';
    if (score > 0.3) return 'medium';
    return 'low';
  }

  /**
   * Find semantic roots in text
   */
  findSemanticRoots(normalizedText) {
    const found = [];

    // Check all intent signatures
    for (const signature of Object.values(this.intentSignatures)) {
      for (const root of signature.semanticRoots) {
        if (normalizedText.includes(root)) {
          found.push(root);
        }
      }
    }

    return found;
  }

  /**
   * 🎯 INTENT SCORING
   */

  /**
   * Calculate how likely this text matches an intent
   */
  calculateIntentScore(features, signature) {
    let score = 0;
    let maxScore = 0;

    // Feature 1: Semantic roots (most important - 40%)
    maxScore += 0.4;
    if (features.semanticRoots.length > 0) {
      const matchingRoots = features.semanticRoots.filter(root =>
        signature.semanticRoots.includes(root)
      );

      if (matchingRoots.length > 0) {
        score += 0.4;
      }
    }

    // Feature 2: Position in conversation (20%)
    maxScore += 0.2;
    if (signature.typicalPosition === 'start' && features.isConversationStart) {
      score += 0.2;
    } else if (signature.typicalPosition === 'any') {
      score += 0.1;
    }

    // Feature 3: Message length (15%)
    maxScore += 0.15;
    if (signature.typicalLength === 'short' && features.isShortMessage) {
      score += 0.15;
    } else if (signature.typicalLength === 'short' && features.isVeryShortMessage) {
      score += 0.15;
    }

    // Feature 4: Sentiment match (15%)
    maxScore += 0.15;
    if (features.sentiment === signature.sentiment || signature.sentiment === 'neutral') {
      score += 0.15;
    }

    // Feature 5: Excitement match (10%)
    maxScore += 0.1;
    if (features.excitement === signature.excitement) {
      score += 0.1;
    } else if (signature.excitement === 'medium') {
      // Medium is flexible
      score += 0.05;
    }

    // Normalize score
    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * 📖 EXPLANATION
   */

  /**
   * Explain why we recognized this intent
   */
  explainRecognition(intent, features, score) {
    const reasons = [];

    // Check what contributed to recognition
    const signature = this.intentSignatures[intent];

    if (features.semanticRoots.length > 0) {
      const matchingRoots = features.semanticRoots.filter(root =>
        signature.semanticRoots.includes(root)
      );

      if (matchingRoots.length > 0) {
        reasons.push(`contiene raíz semántica: "${matchingRoots[0]}"`);
      }
    }

    if (signature.typicalPosition === 'start' && features.isConversationStart) {
      reasons.push('al inicio de conversación');
    }

    if (features.isVeryShortMessage) {
      reasons.push('mensaje corto típico de ' + intent.toLowerCase());
    }

    if (features.hasLetterRepetition) {
      reasons.push('tiene repetición de letras (emoción)');
    }

    if (features.hasExclamation) {
      reasons.push('tiene exclamaciones');
    }

    if (features.hasAllCaps) {
      reasons.push('usa mayúsculas (énfasis)');
    }

    return {
      intent,
      confidence: score,
      reasons: reasons.length > 0 ? reasons.join(', ') : 'características semánticas generales',
      features: {
        semanticRoots: features.semanticRoots,
        hasEmphasis: features.hasExclamation || features.hasAllCaps || features.hasLetterRepetition,
        sentiment: features.sentiment,
        excitement: features.excitement
      }
    };
  }

  /**
   * 🔄 Reset conversation state
   */
  resetConversation() {
    this.conversationState = {
      messageCount: 0,
      lastIntent: null,
      conversationStart: Date.now()
    };

    console.log('🔄 Conversation state reset');
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      messageCount: this.conversationState.messageCount,
      lastIntent: this.conversationState.lastIntent,
      conversationAge: Date.now() - this.conversationState.conversationStart
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.SemanticIntentRecognition = new SemanticIntentRecognition();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.SemanticIntentRecognition.initialize();
    });
  } else {
    window.SemanticIntentRecognition.initialize();
  }

  console.log('🧠 Semantic Intent Recognition loaded!');
}
