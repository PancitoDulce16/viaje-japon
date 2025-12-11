/**
 * ❓ FASE 8.5: UNCERTAINTY HANDLER
 * ==================================
 *
 * "Maneja lo inesperado con gracia, como un humano experto"
 *
 * Para inputs ambiguos o inesperados:
 * - Razona "como humano" estimando gaps de información
 * - Pide clarificación si necesario
 * - Resuelve solo si posible con confianza
 * - Cachea patrones comunes para eficiencia
 *
 * Usa razonamiento bayesiano simple para estimar incertidumbre.
 *
 * Como un asistente experto que:
 * - Reconoce cuando no entiende algo
 * - Hace preguntas inteligentes para clarificar
 * - No inventa respuestas si no está seguro
 * - Aprende de interacciones pasadas
 */

class UncertaintyHandler {
  constructor() {
    this.initialized = false;

    // Knowledge base of known patterns
    this.knownPatterns = new Map();

    // Uncertainty thresholds
    this.thresholds = {
      veryLow: 0.2,     // < 20% uncertainty → muy confiado
      low: 0.4,         // < 40% uncertainty → confiado
      medium: 0.6,      // < 60% uncertainty → neutral
      high: 0.8,        // < 80% uncertainty → inseguro
      veryHigh: 1.0     // ≥ 80% uncertainty → muy inseguro
    };

    // Cache of past resolutions
    this.resolutionCache = new Map();

    // Metrics
    this.metrics = {
      totalQueries: 0,
      resolvedDirectly: 0,
      needsClarification: 0,
      avgUncertainty: 0
    };

    console.log('❓ Uncertainty Handler initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load known patterns and cache
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('uncertainty_handler');
      if (stored) {
        this.knownPatterns = new Map(stored.patterns || []);
        this.resolutionCache = new Map(stored.cache || []);
        this.metrics = stored.metrics || this.metrics;
      }
    }

    // Build initial knowledge base
    this.buildKnowledgeBase();

    this.initialized = true;
    console.log('✅ Uncertainty Handler ready');
    console.log(`📚 ${this.knownPatterns.size} known patterns loaded`);
  }

  /**
   * 📚 Build knowledge base of common patterns
   */
  buildKnowledgeBase() {
    // Common Japan travel patterns
    const patterns = [
      { keywords: ['templo', 'temple', 'santuario', 'shrine'], category: 'religious', confidence: 0.9 },
      { keywords: ['comida', 'food', 'restaurante', 'restaurant', 'ramen', 'sushi'], category: 'food', confidence: 0.9 },
      { keywords: ['shopping', 'compras', 'tienda', 'store'], category: 'shopping', confidence: 0.9 },
      { keywords: ['parque', 'park', 'jardín', 'garden'], category: 'nature', confidence: 0.9 },
      { keywords: ['museo', 'museum', 'arte', 'art'], category: 'culture', confidence: 0.9 },
      { keywords: ['barato', 'cheap', 'económico', 'budget'], category: 'budget_concern', confidence: 0.85 },
      { keywords: ['cansado', 'tired', 'fatiga', 'descanso', 'rest'], category: 'fatigue_concern', confidence: 0.85 },
      { keywords: ['rápido', 'fast', 'quick', 'eficiente'], category: 'time_concern', confidence: 0.85 }
    ];

    for (const pattern of patterns) {
      const key = pattern.keywords.join('|');
      this.knownPatterns.set(key, pattern);
    }
  }

  /**
   * 🔍 Estimate uncertainty for a query
   * @param {string} query - User query
   * @param {Object} context - Current context
   * @returns {number} Uncertainty score (0-1, higher = more uncertain)
   */
  estimateUncertainty(query, context = {}) {
    let uncertainty = 0.5; // Base uncertainty

    // Factor 1: Pattern matching (-0.3 if matches known pattern)
    if (this.matchesKnownPattern(query)) {
      uncertainty -= 0.3;
    }

    // Factor 2: Query length (+0.2 if very long, complex)
    if (query.length > 150) {
      uncertainty += 0.2;
    } else if (query.length < 20) {
      uncertainty += 0.1; // Too short, might be ambiguous
    }

    // Factor 3: Word count (+0.1 if too many words)
    const wordCount = query.split(' ').length;
    if (wordCount > 30) {
      uncertainty += 0.1;
    }

    // Factor 4: Context availability (-0.2 if good context)
    if (context.itinerary && context.userPreferences) {
      uncertainty -= 0.2;
    } else if (!context.itinerary) {
      uncertainty += 0.15;
    }

    // Factor 5: Special characters/numbers (+0.1 if many)
    const specialChars = (query.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialChars > 5) {
      uncertainty += 0.1;
    }

    // Factor 6: Question words (-0.1 if contains clear question words)
    const questionWords = ['qué', 'what', 'cómo', 'how', 'cuándo', 'when', 'dónde', 'where', 'por qué', 'why'];
    const hasQuestionWord = questionWords.some(word => query.toLowerCase().includes(word));
    if (hasQuestionWord) {
      uncertainty -= 0.1; // Clear question is better than ambiguous statement
    }

    // Factor 7: Negations (+0.15 if contains negations)
    const negations = ['no', 'not', 'nunca', 'never', 'sin', 'without'];
    const hasNegation = negations.some(word => query.toLowerCase().includes(word));
    if (hasNegation) {
      uncertainty += 0.15; // Negations add complexity
    }

    // Clamp to [0, 1]
    return Math.max(0, Math.min(1, uncertainty));
  }

  /**
   * 🎯 Check if query matches known pattern
   */
  matchesKnownPattern(query) {
    const lowerQuery = query.toLowerCase();

    for (const [key, pattern] of this.knownPatterns) {
      const keywords = key.split('|');
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        return true;
      }
    }

    return false;
  }

  /**
   * 🔧 Resolve query with uncertainty handling
   * @param {string} query - User query
   * @param {Object} context - Current context
   * @returns {Object} Resolution result
   */
  resolve(query, context = {}) {
    this.metrics.totalQueries++;

    // Check cache first (efficiency)
    const cacheKey = this.generateCacheKey(query, context);
    if (this.resolutionCache.has(cacheKey)) {
      const cached = this.resolutionCache.get(cacheKey);
      console.log(`💨 Cache hit for "${query.substring(0, 30)}..."`);
      return { ...cached, fromCache: true };
    }

    // Estimate uncertainty
    const uncertainty = this.estimateUncertainty(query, context);

    // Update metrics
    const n = this.metrics.totalQueries;
    this.metrics.avgUncertainty = (this.metrics.avgUncertainty * (n - 1) + uncertainty) / n;

    // Get uncertainty level
    const level = this.getUncertaintyLevel(uncertainty);

    let result;

    // High uncertainty → ask for clarification
    if (uncertainty >= this.thresholds.high) {
      result = this.requestClarification(query, context, uncertainty);
      this.metrics.needsClarification++;
    }
    // Low/medium uncertainty → try to resolve
    else {
      result = this.attemptResolution(query, context, uncertainty);
      this.metrics.resolvedDirectly++;
    }

    // Cache result
    this.cacheResolution(cacheKey, result);

    // Learn from this query
    this.learnFromQuery(query, uncertainty, result);

    return result;
  }

  /**
   * ❓ Request clarification from user
   */
  requestClarification(query, context, uncertainty) {
    // Generate smart clarifying questions
    const questions = this.generateClarifyingQuestions(query, context);

    return {
      response: `Necesito más información para ayudarte mejor.`,
      needsClarification: true,
      uncertainty,
      uncertaintyLevel: this.getUncertaintyLevel(uncertainty),
      questions,
      confidence: 1 - uncertainty,
      reasoning: `Alta incertidumbre (${(uncertainty * 100).toFixed(0)}%) detectada. Necesito clarificación para proceder con confianza.`
    };
  }

  /**
   * 💡 Attempt to resolve with available information
   */
  attemptResolution(query, context, uncertainty) {
    // Find matching pattern
    const matchedPattern = this.findMatchingPattern(query);

    // Build reasoned response
    let response = '';
    let action = null;

    if (matchedPattern) {
      // Use pattern to infer intent
      response = `Razonando: Detecté que tu consulta se relaciona con ${matchedPattern.category}. `;

      if (matchedPattern.category === 'food') {
        response += `Asumo que quieres agregar más restaurantes o experiencias gastronómicas.`;
        action = { type: 'add_activity', category: 'food' };
      } else if (matchedPattern.category === 'budget_concern') {
        response += `Asumo que quieres reducir el presupuesto del viaje.`;
        action = { type: 'adjust_budget', direction: 'reduce' };
      } else if (matchedPattern.category === 'fatigue_concern') {
        response += `Asumo que necesitas reducir la fatiga del itinerario.`;
        action = { type: 'change_pace', pace: 'relaxed' };
      }
    } else {
      // No pattern match, use context to infer
      response = `Razonando: Aunque tu consulta es algo ambigua, basándome en el contexto, voy a asumir que quieres `;

      if (context.userPreferences && context.userPreferences.length > 0) {
        response += `agregar actividades relacionadas con tus preferencias: ${context.userPreferences.join(', ')}.`;
        action = { type: 'add_activity', category: context.userPreferences[0] };
      } else {
        response += `optimizar tu itinerario actual.`;
        action = { type: 'optimize' };
      }
    }

    return {
      response,
      action,
      needsClarification: false,
      uncertainty,
      uncertaintyLevel: this.getUncertaintyLevel(uncertainty),
      confidence: 1 - uncertainty,
      reasoning: `Incertidumbre media (${(uncertainty * 100).toFixed(0)}%). Procediendo con mejor inferencia basada en ${matchedPattern ? 'patrón conocido' : 'contexto'}.`,
      suggestions: this.generateSuggestions(query, context, matchedPattern)
    };
  }

  /**
   * 🔍 Find matching pattern in knowledge base
   */
  findMatchingPattern(query) {
    const lowerQuery = query.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const [key, pattern] of this.knownPatterns) {
      const keywords = key.split('|');
      let score = 0;

      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          score += pattern.confidence;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern;
      }
    }

    return bestScore > 0 ? bestMatch : null;
  }

  /**
   * ❓ Generate clarifying questions
   */
  generateClarifyingQuestions(query, context) {
    const questions = [];

    // Generic questions
    questions.push('¿Qué aspecto específico de tu viaje te gustaría ajustar?');

    // Context-specific questions
    if (!context.itinerary) {
      questions.push('¿Ya tienes un itinerario o estás empezando desde cero?');
    }

    if (!context.userPreferences || context.userPreferences.length === 0) {
      questions.push('¿Qué tipo de actividades te interesan más? (templos, comida, naturaleza, etc.)');
    }

    // Query-specific questions
    if (query.includes('mejor') || query.includes('best')) {
      questions.push('¿Qué significa "mejor" para ti? (más económico, más rápido, más experiencias, etc.)');
    }

    return questions.slice(0, 3); // Max 3 questions
  }

  /**
   * 💡 Generate suggestions
   */
  generateSuggestions(query, context, matchedPattern) {
    const suggestions = [];

    if (matchedPattern) {
      suggestions.push({
        text: `Ver actividades de ${matchedPattern.category}`,
        action: 'browse',
        category: matchedPattern.category
      });
    }

    suggestions.push({
      text: 'Mostrar resumen del itinerario',
      action: 'show_summary'
    });

    suggestions.push({
      text: 'Optimizar todo el viaje',
      action: 'optimize_all'
    });

    return suggestions;
  }

  /**
   * 📊 Get uncertainty level label
   */
  getUncertaintyLevel(uncertainty) {
    if (uncertainty < this.thresholds.veryLow) return 'very_low';
    if (uncertainty < this.thresholds.low) return 'low';
    if (uncertainty < this.thresholds.medium) return 'medium';
    if (uncertainty < this.thresholds.high) return 'high';
    return 'very_high';
  }

  /**
   * 🔑 Generate cache key
   */
  generateCacheKey(query, context) {
    const normalized = query.toLowerCase().trim();
    const contextHash = context.itinerary ? 'with_itin' : 'no_itin';
    return `${normalized}:${contextHash}`;
  }

  /**
   * 💾 Cache resolution
   */
  cacheResolution(key, result) {
    this.resolutionCache.set(key, result);

    // Keep cache size limited
    if (this.resolutionCache.size > 100) {
      // Remove oldest entry
      const firstKey = this.resolutionCache.keys().next().value;
      this.resolutionCache.delete(firstKey);
    }
  }

  /**
   * 🧠 Learn from query
   */
  learnFromQuery(query, uncertainty, result) {
    // If resolution was successful and uncertainty was medium/high,
    // add to known patterns
    if (!result.needsClarification && uncertainty > 0.4) {
      // Extract keywords
      const words = query.toLowerCase().split(' ').filter(w => w.length > 3);

      if (words.length > 0 && result.action) {
        const newPattern = {
          keywords: words.slice(0, 3),
          category: result.action.category || result.action.type,
          confidence: 0.7 // Start with medium confidence
        };

        const key = newPattern.keywords.join('|');
        this.knownPatterns.set(key, newPattern);

        console.log(`🧠 Learned new pattern: ${key} → ${newPattern.category}`);
      }
    }

    this.save();
  }

  /**
   * 💾 Save to storage
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('uncertainty_handler', {
        patterns: Array.from(this.knownPatterns.entries()),
        cache: Array.from(this.resolutionCache.entries()),
        metrics: this.metrics
      });
    }
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      ...this.metrics,
      cacheSize: this.resolutionCache.size,
      patternsLearned: this.knownPatterns.size,
      clarificationRate: this.metrics.totalQueries > 0
        ? this.metrics.needsClarification / this.metrics.totalQueries
        : 0,
      resolutionRate: this.metrics.totalQueries > 0
        ? this.metrics.resolvedDirectly / this.metrics.totalQueries
        : 0
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.UncertaintyHandler = new UncertaintyHandler();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.UncertaintyHandler.initialize();
    });
  } else {
    window.UncertaintyHandler.initialize();
  }

  console.log('❓ Uncertainty Handler loaded!');
}
