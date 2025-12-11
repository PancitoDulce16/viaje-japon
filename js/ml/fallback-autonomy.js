/**
 * 🛡️ FASE 11.5: FALLBACK AUTONOMY LAYER
 * =======================================
 *
 * "Maneja CUALQUIER input independientemente"
 *
 * Para cualquier input:
 * - Razona si on-topic (via semantic matching)
 * - Si no, mapea creativamente al dominio core
 * - Siempre útil, nunca dice "no puedo"
 *
 * Criterio: Siempre encuentra forma de ayudar, redirigiendo elegantemente.
 *
 * Como un asistente excepcional que:
 * - Nunca rechaza una pregunta
 * - Busca conexiones creativas
 * - Redirige con gracia si off-topic
 * - Siempre aporta valor
 */

class FallbackAutonomy {
  constructor() {
    this.initialized = false;

    // Core domain definition
    this.coreDomain = {
      name: 'Viajes a Japón',
      keywords: ['japón', 'japan', 'tokyo', 'kyoto', 'osaka', 'viaje', 'trip', 'itinerario', 'itinerary'],
      categories: ['templos', 'comida', 'shopping', 'naturaleza', 'cultura', 'transporte', 'alojamiento']
    };

    // Similarity threshold for on-topic detection
    this.onTopicThreshold = 0.3;

    // Mapping strategies for off-topic queries
    this.mappingStrategies = [
      'direct_connection',   // Buscar conexión directa
      'analogous_mapping',   // Mapeo por analogía
      'category_transfer',   // Transferir categoría
      'creative_reframe'     // Reframe creativo
    ];

    // Fallback history
    this.fallbackHistory = [];

    console.log('🛡️ Fallback Autonomy Layer initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load history
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('fallback_autonomy');
      if (stored) {
        this.fallbackHistory = stored.history || [];
      }
    }

    this.initialized = true;
    console.log('✅ Fallback Autonomy Layer ready');
  }

  /**
   * 🎯 Handle any input autonomously
   * @param {string} query - User query (can be ANYTHING)
   * @param {Object} context - Current context
   * @returns {Object} Response (always useful)
   */
  handle(query, context = {}) {
    console.log(`🛡️ Fallback handling: "${query}"`);

    // Step 1: Check if on-topic
    const topicAnalysis = this.analyzeTopicRelevance(query);

    // Step 2: Route to appropriate handler
    let response;

    if (topicAnalysis.isOnTopic) {
      // On-topic → process normally
      response = this.handleOnTopic(query, context, topicAnalysis);
    }
    else {
      // Off-topic → map creatively to domain
      response = this.handleOffTopic(query, context, topicAnalysis);
    }

    // Record fallback
    this.recordFallback({
      query,
      isOnTopic: topicAnalysis.isOnTopic,
      similarity: topicAnalysis.similarity,
      response,
      timestamp: Date.now()
    });

    return response;
  }

  /**
   * 🔍 Analyze topic relevance
   */
  analyzeTopicRelevance(query) {
    const similarity = this.calculateSemanticSimilarity(query, this.coreDomain);

    return {
      isOnTopic: similarity >= this.onTopicThreshold,
      similarity,
      matchedKeywords: this.findMatchedKeywords(query),
      suggestedCategory: this.suggestCategory(query)
    };
  }

  /**
   * 📊 Calculate semantic similarity (simple Jaccard)
   */
  calculateSemanticSimilarity(query, domain) {
    const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const domainWords = new Set([
      ...domain.keywords,
      ...domain.categories
    ]);

    // Intersection
    const intersection = new Set([...queryWords].filter(w => domainWords.has(w)));

    // Union
    const union = new Set([...queryWords, ...domainWords]);

    // Jaccard similarity
    return intersection.size / union.size;
  }

  /**
   * 🔍 Find matched keywords
   */
  findMatchedKeywords(query) {
    const lowerQuery = query.toLowerCase();
    const matched = [];

    for (const keyword of this.coreDomain.keywords) {
      if (lowerQuery.includes(keyword)) {
        matched.push(keyword);
      }
    }

    return matched;
  }

  /**
   * 🏷️ Suggest category
   */
  suggestCategory(query) {
    const lowerQuery = query.toLowerCase();

    for (const category of this.coreDomain.categories) {
      if (lowerQuery.includes(category)) {
        return category;
      }
    }

    // Try synonyms
    const synonyms = {
      'templos': ['temple', 'shrine', 'santuario', 'religión'],
      'comida': ['food', 'restaurant', 'ramen', 'sushi', 'comer'],
      'shopping': ['tienda', 'compra', 'store', 'mall'],
      'naturaleza': ['nature', 'park', 'jardín', 'garden', 'monte'],
      'cultura': ['museum', 'art', 'arte', 'museo', 'tradición']
    };

    for (const [cat, syns] of Object.entries(synonyms)) {
      if (syns.some(syn => lowerQuery.includes(syn))) {
        return cat;
      }
    }

    return null;
  }

  /**
   * ✅ Handle on-topic query
   */
  handleOnTopic(query, context, analysis) {
    return {
      response: `Entiendo, quieres saber sobre ${analysis.suggestedCategory || 'tu viaje a Japón'}. Déjame ayudarte con eso.`,
      isOnTopic: true,
      action: {
        type: 'process_normally',
        category: analysis.suggestedCategory
      },
      confidence: analysis.similarity,
      reasoning: `Query relacionado con dominio core (similaridad: ${(analysis.similarity * 100).toFixed(0)}%)`
    };
  }

  /**
   * 🔄 Handle off-topic query (map creatively)
   */
  handleOffTopic(query, context, analysis) {
    console.log(`🔄 Off-topic query detected, mapping to domain...`);

    // Try different mapping strategies
    for (const strategy of this.mappingStrategies) {
      const mapping = this.tryMapping(query, strategy, context);

      if (mapping.success) {
        return {
          response: mapping.response,
          isOnTopic: false,
          mappedTo: mapping.mappedQuery,
          strategy: strategy,
          action: mapping.action,
          confidence: mapping.confidence,
          reasoning: mapping.reasoning
        };
      }
    }

    // Fallback to generic helpful response
    return this.genericFallback(query, context);
  }

  /**
   * 🗺️ Try a mapping strategy
   */
  tryMapping(query, strategy, context) {
    const lowerQuery = query.toLowerCase();

    if (strategy === 'direct_connection') {
      // Look for ANY connection to Japan
      if (lowerQuery.includes('comida') || lowerQuery.includes('food') || lowerQuery.includes('restaurante')) {
        return {
          success: true,
          response: `Razonando: Mencionas comida. En Japón, la gastronomía es increíble. ¿Quieres que agregue experiencias gastronómicas a tu itinerario?`,
          mappedQuery: 'Agregar restaurantes y experiencias de comida',
          action: { type: 'add_activity', category: 'comida' },
          confidence: 0.7,
          reasoning: 'Conexión directa: comida → gastronomía japonesa'
        };
      }

      if (lowerQuery.includes('arte') || lowerQuery.includes('art') || lowerQuery.includes('museo')) {
        return {
          success: true,
          response: `Razonando: Hablas de arte. Japón tiene museos y galerías extraordinarios. ¿Te interesa explorar el arte japonés?`,
          mappedQuery: 'Agregar museos y galerías de arte',
          action: { type: 'add_activity', category: 'cultura' },
          confidence: 0.7,
          reasoning: 'Conexión directa: arte → museos japoneses'
        };
      }
    }

    else if (strategy === 'analogous_mapping') {
      // Map by analogy
      if (lowerQuery.includes('playa') || lowerQuery.includes('beach')) {
        return {
          success: true,
          response: `Razonando: Mencionas playas. Aunque Japón no es famoso por playas tropicales, tiene costas hermosas y onsen (aguas termales). ¿Te interesa eso?`,
          mappedQuery: 'Agregar experiencias costeras o onsen',
          action: { type: 'add_activity', category: 'naturaleza' },
          confidence: 0.6,
          reasoning: 'Mapeo análogo: playa → costa/onsen japonés'
        };
      }

      if (lowerQuery.includes('montaña') || lowerQuery.includes('mountain') || lowerQuery.includes('hiking')) {
        return {
          success: true,
          response: `Razonando: Hablas de montañas. Japón tiene increíbles montañas y rutas de senderismo, incluyendo el Monte Fuji. ¿Quieres explorar eso?`,
          mappedQuery: 'Agregar actividades de montaña',
          action: { type: 'add_activity', category: 'naturaleza' },
          confidence: 0.8,
          reasoning: 'Mapeo análogo: montaña → senderismo japonés'
        };
      }
    }

    else if (strategy === 'category_transfer') {
      // Transfer to closest category
      if (lowerQuery.includes('historia') || lowerQuery.includes('history')) {
        return {
          success: true,
          response: `Razonando: Te interesa la historia. Japón tiene una historia fascinante. Templos, castillos y museos históricos son perfectos para ti.`,
          mappedQuery: 'Agregar sitios históricos',
          action: { type: 'add_activity', category: 'cultura' },
          confidence: 0.75,
          reasoning: 'Transferencia de categoría: historia → cultura/templos'
        };
      }
    }

    else if (strategy === 'creative_reframe') {
      // Creative reframing
      if (lowerQuery.includes('marte') || lowerQuery.includes('mars') || lowerQuery.includes('espacio')) {
        return {
          success: true,
          response: `Razonando: Mencionas espacio/Marte. En Tokio hay un planetario increíble y museos de ciencia. ¿Te gustaría visitar esos lugares "espaciales"?`,
          mappedQuery: 'Agregar museos de ciencia y planetario',
          action: { type: 'add_activity', category: 'cultura' },
          confidence: 0.5,
          reasoning: 'Reframe creativo: Marte → planetario/ciencia en Japón'
        };
      }

      if (lowerQuery.includes('francia') || lowerQuery.includes('french') || lowerQuery.includes('parís')) {
        return {
          success: true,
          response: `Razonando: Hablas de Francia. Curiosamente, Japón tiene barrios con influencia francesa y restaurantes de fusión franco-japonesa. ¿Te interesa explorar eso?`,
          mappedQuery: 'Agregar experiencias de fusión cultural',
          action: { type: 'add_activity', category: 'comida' },
          confidence: 0.5,
          reasoning: 'Reframe creativo: Francia → fusión franco-japonesa'
        };
      }
    }

    return { success: false };
  }

  /**
   * 🆘 Generic fallback
   */
  genericFallback(query, context) {
    return {
      response: `Razonando: Tu consulta es interesante, pero está fuera del ámbito de viajes a Japón. Sin embargo, puedo ayudarte a planificar un itinerario increíble. ¿Qué te parece si empezamos por ahí?`,
      isOnTopic: false,
      mappedTo: 'Planificación general de viaje',
      strategy: 'generic_redirect',
      action: { type: 'show_help' },
      confidence: 0.3,
      reasoning: 'No se encontró mapeo directo. Redirigiendo a funcionalidad core.'
    };
  }

  /**
   * 📝 Record fallback
   */
  recordFallback(fallback) {
    this.fallbackHistory.push(fallback);

    // Keep last 100
    if (this.fallbackHistory.length > 100) {
      this.fallbackHistory.shift();
    }

    this.save();
  }

  /**
   * 💾 Save to storage
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('fallback_autonomy', {
        history: this.fallbackHistory
      });
    }
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    const onTopicCount = this.fallbackHistory.filter(f => f.isOnTopic).length;
    const offTopicCount = this.fallbackHistory.filter(f => !f.isOnTopic).length;

    return {
      totalQueries: this.fallbackHistory.length,
      onTopicCount,
      offTopicCount,
      onTopicRate: onTopicCount / (this.fallbackHistory.length || 1),
      avgSimilarity: this.fallbackHistory.reduce((sum, f) => sum + f.similarity, 0) / (this.fallbackHistory.length || 1),
      recentFallbacks: this.fallbackHistory.slice(-10)
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.FallbackAutonomy = new FallbackAutonomy();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.FallbackAutonomy.initialize();
    });
  } else {
    window.FallbackAutonomy.initialize();
  }

  console.log('🛡️ Fallback Autonomy Layer loaded!');
}
