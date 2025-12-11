/**
 * 🎯 FASE 15: ACTIVE LEARNING
 * ============================
 *
 * "La IA que sabe cuándo pedir ayuda"
 *
 * Sistema inteligente que:
 * 1. Detecta cuándo NO está segura
 * 2. Pide feedback estratégicamente
 * 3. Aprende de las respuestas del usuario
 * 4. Minimiza preguntas innecesarias
 * 5. Maximiza aprendizaje con mínimas interacciones
 *
 * ARQUITECTURA:
 * - Uncertainty Detector: Detecta cuándo pedir ayuda
 * - Query Strategy: Elige QUÉ preguntar
 * - Sample Selector: Elige CUÁNDO preguntar
 * - Feedback Processor: Aprende de respuestas
 * - Budget Manager: No hacer demasiadas preguntas
 *
 * ESTRATEGIAS DE QUERY:
 * 1. Uncertainty Sampling: Pregunta cuando confianza < 60%
 * 2. Diversity Sampling: Pregunta sobre casos diversos
 * 3. Committee Disagreement: Pregunta cuando agentes debaten
 * 4. Expected Model Change: Pregunta lo que más mejorará el modelo
 * 5. Margin Sampling: Pregunta cuando top-2 opciones están cerca
 *
 * EJEMPLO:
 * IA (confianza 45%): "No estoy seguro si prefieres templos tradicionales o modernos.
 *                      ¿Podrías decirme cuál te interesa más?"
 * Usuario: "Tradicionales"
 * IA: "¡Gracias! Ahora sé que priorizar templos históricos en tus recomendaciones."
 *
 * BUDGET:
 * - Máximo 3 preguntas por sesión
 * - Solo pregunta si incertidumbre > 60%
 * - Espera al menos 5 interacciones entre preguntas
 */

class ActiveLearning {
  constructor() {
    this.initialized = false;

    // Query budget - no hacer demasiadas preguntas
    this.budget = {
      maxQueriesPerSession: 3,    // Máximo 3 preguntas por sesión
      queriesAsked: 0,             // Cuántas se han hecho
      minInteractionsBetween: 5,   // Esperar 5 interacciones entre preguntas
      interactionsSinceLastQuery: 0,
      sessionStart: Date.now()
    };

    // Query thresholds
    this.thresholds = {
      uncertainty: 0.6,            // Preguntar si confianza < 60%
      marginDifference: 0.15,      // Preguntar si top-2 están a menos de 15%
      diversityThreshold: 0.7      // Preguntar si diversidad < 70%
    };

    // Pending queries - preguntas que queremos hacer
    this.pendingQueries = [];

    // Query history - historial de preguntas
    this.queryHistory = [];

    // Learning data - qué hemos aprendido
    this.learnedPreferences = new Map();

    // Query strategies
    this.strategies = {
      uncertainty: this.uncertaintySampling.bind(this),
      margin: this.marginSampling.bind(this),
      diversity: this.diversitySampling.bind(this),
      committee: this.committeeSampling.bind(this)
    };

    // Statistics
    this.stats = {
      queriesAsked: 0,
      queriesAnswered: 0,
      learningRate: 0,
      avgConfidenceIncrease: 0
    };

    console.log('🎯 Active Learning initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load history
    await this.loadHistory();

    // Reset session budget
    this.resetSessionBudget();

    this.initialized = true;
    console.log('✅ Active Learning ready');
  }

  /**
   * 🎯 QUERY DECISION
   */

  /**
   * Main entry point - should we ask a question?
   */
  shouldQuery(context) {
    // Check budget
    if (!this.hasBudget()) {
      console.log('🚫 Query budget exhausted');
      return {
        should: false,
        reason: 'budget_exhausted'
      };
    }

    // Check minimum interactions
    if (this.budget.interactionsSinceLastQuery < this.budget.minInteractionsBetween) {
      console.log('⏳ Too soon to ask another question');
      return {
        should: false,
        reason: 'too_soon'
      };
    }

    // Run query strategies
    const strategies = ['uncertainty', 'margin', 'diversity'];
    let bestQuery = null;
    let maxUtility = 0;

    for (const strategyName of strategies) {
      const query = this.strategies[strategyName](context);

      if (query && query.utility > maxUtility) {
        bestQuery = query;
        maxUtility = query.utility;
      }
    }

    // Decide if we should ask
    if (bestQuery && maxUtility > 0.5) {
      console.log(`❓ Should ask: ${bestQuery.question} (utility: ${(maxUtility * 100).toFixed(1)}%)`);

      return {
        should: true,
        query: bestQuery,
        utility: maxUtility,
        strategy: bestQuery.strategy
      };
    }

    return {
      should: false,
      reason: 'no_good_query'
    };
  }

  /**
   * Actually ask the question
   */
  askQuery(query) {
    // Add to pending
    this.pendingQueries.push({
      ...query,
      id: this.generateId(),
      timestamp: Date.now(),
      status: 'pending'
    });

    // Update budget
    this.budget.queriesAsked++;
    this.budget.interactionsSinceLastQuery = 0;

    // Save to history
    this.queryHistory.push({
      ...query,
      askedAt: Date.now()
    });

    this.stats.queriesAsked++;

    this.saveHistory();

    console.log(`❓ Asked query: ${query.question}`);

    return query;
  }

  /**
   * Process user's answer
   */
  async processAnswer(queryId, answer) {
    // Find query
    const queryIndex = this.pendingQueries.findIndex(q => q.id === queryId);

    if (queryIndex === -1) {
      console.warn('Query not found');
      return { success: false };
    }

    const query = this.pendingQueries[queryIndex];

    // Update query status
    query.status = 'answered';
    query.answer = answer;
    query.answeredAt = Date.now();

    // Remove from pending
    this.pendingQueries.splice(queryIndex, 1);

    // Update history
    const historyQuery = this.queryHistory.find(q =>
      q.question === query.question && !q.answeredAt
    );

    if (historyQuery) {
      historyQuery.answer = answer;
      historyQuery.answeredAt = Date.now();
    }

    // Learn from answer
    await this.learnFromAnswer(query, answer);

    this.stats.queriesAnswered++;

    this.saveHistory();

    console.log(`✅ Processed answer for: ${query.question}`);

    return {
      success: true,
      learned: true
    };
  }

  /**
   * 🧠 QUERY STRATEGIES
   */

  /**
   * Uncertainty Sampling - pregunta cuando no está seguro
   */
  uncertaintySampling(context) {
    // Check if there's uncertainty in current decision
    const confidence = context.confidence || 0.5;

    if (confidence >= this.thresholds.uncertainty) {
      return null; // Confident enough, no need to ask
    }

    // Generate question about uncertainty
    const uncertainty = 1 - confidence;

    let question = '';
    let expectedImpact = uncertainty;

    // Uncertainty about category
    if (context.category && !context.categoryConfirmed) {
      question = `¿Confirmas que te interesan lugares de tipo "${context.category}"?`;
      expectedImpact = uncertainty * 0.8;
    }
    // Uncertainty about preference
    else if (context.recommendation) {
      question = `No estoy seguro si esto es lo que buscas. ¿Te gusta este tipo de lugar?`;
      expectedImpact = uncertainty * 0.7;
    }
    // General uncertainty
    else {
      question = `¿Podrías darme más detalles sobre lo que buscas?`;
      expectedImpact = uncertainty * 0.6;
    }

    return {
      strategy: 'uncertainty',
      question,
      options: ['Sí', 'No', 'No estoy seguro'],
      utility: expectedImpact,
      context: { ...context }
    };
  }

  /**
   * Margin Sampling - pregunta cuando top-2 opciones están cerca
   */
  marginSampling(context) {
    // Need at least 2 options
    if (!context.alternatives || context.alternatives.length < 2) {
      return null;
    }

    const sorted = [...context.alternatives].sort((a, b) => b.score - a.score);
    const margin = sorted[0].score - sorted[1].score;

    if (margin > this.thresholds.marginDifference) {
      return null; // Clear winner, no need to ask
    }

    // Ask user to disambiguate
    const question = `No estoy seguro entre "${sorted[0].name}" y "${sorted[1].name}". ¿Cuál prefieres?`;

    return {
      strategy: 'margin',
      question,
      options: [sorted[0].name, sorted[1].name, 'Ninguno'],
      utility: 1 - margin, // Smaller margin = higher utility
      context: {
        ...context,
        option1: sorted[0],
        option2: sorted[1]
      }
    };
  }

  /**
   * Diversity Sampling - pregunta para explorar área desconocida
   */
  diversitySampling(context) {
    // Check if user has diverse preferences
    const categories = context.userHistory
      ? new Set(context.userHistory.map(h => h.category))
      : new Set();

    const diversity = categories.size / 6; // Assume 6 possible categories

    if (diversity > this.thresholds.diversityThreshold) {
      return null; // Diverse enough
    }

    // Suggest exploring new category
    const knownCategories = Array.from(categories);
    const allCategories = ['temples', 'food', 'shopping', 'parks', 'culture', 'nightlife'];
    const unexplored = allCategories.filter(c => !knownCategories.includes(c));

    if (unexplored.length === 0) {
      return null;
    }

    const suggestion = unexplored[0];

    const question = `He notado que no has explorado mucho "${suggestion}". ¿Te gustaría ver recomendaciones de esa categoría?`;

    return {
      strategy: 'diversity',
      question,
      options: ['Sí, muéstrame', 'No me interesa', 'Tal vez después'],
      utility: 1 - diversity,
      context: {
        ...context,
        suggestedCategory: suggestion
      }
    };
  }

  /**
   * Committee Sampling - pregunta cuando agentes internos debaten
   */
  committeeSampling(context) {
    // Check if there's a debate result
    if (!context.debate || !context.debate.disagreement) {
      return null;
    }

    const disagreement = context.debate.disagreement;

    if (disagreement < 0.5) {
      return null; // Committee agrees
    }

    // Ask user to resolve debate
    const question = `Hay diferentes opiniones sobre esto. ${context.debate.question} ¿Tú qué opinas?`;

    return {
      strategy: 'committee',
      question,
      options: context.debate.options || ['Opción 1', 'Opción 2', 'Otra cosa'],
      utility: disagreement,
      context: {
        ...context,
        debateDetails: context.debate
      }
    };
  }

  /**
   * 📚 LEARNING FROM ANSWERS
   */

  /**
   * Learn from user's answer
   */
  async learnFromAnswer(query, answer) {
    const strategy = query.strategy;
    const context = query.context;

    switch (strategy) {
      case 'uncertainty':
        await this.learnFromUncertainty(query, answer, context);
        break;

      case 'margin':
        await this.learnFromMargin(query, answer, context);
        break;

      case 'diversity':
        await this.learnFromDiversity(query, answer, context);
        break;

      case 'committee':
        await this.learnFromCommittee(query, answer, context);
        break;
    }

    // Update learning stats
    this.stats.learningRate = this.stats.queriesAnswered / Math.max(this.stats.queriesAsked, 1);
  }

  /**
   * Learn from uncertainty query
   */
  async learnFromUncertainty(query, answer, context) {
    if (answer.toLowerCase().includes('sí') || answer.toLowerCase().includes('confirmo')) {
      // User confirmed - increase confidence
      if (context.category) {
        this.learnedPreferences.set(`category_${context.category}`, {
          preference: 'confirmed',
          confidence: 0.9,
          learnedAt: Date.now()
        });

        console.log(`✅ Learned: User confirms interest in ${context.category}`);
      }
    } else if (answer.toLowerCase().includes('no')) {
      // User rejected - decrease weight
      if (context.category) {
        this.learnedPreferences.set(`category_${context.category}`, {
          preference: 'rejected',
          confidence: 0.1,
          learnedAt: Date.now()
        });

        console.log(`❌ Learned: User NOT interested in ${context.category}`);
      }
    }
  }

  /**
   * Learn from margin query
   */
  async learnFromMargin(query, answer, context) {
    const lowerAnswer = answer.toLowerCase();

    if (lowerAnswer.includes(context.option1.name.toLowerCase())) {
      // User prefers option 1
      this.learnedPreferences.set(`prefer_${context.option1.id}`, {
        preference: 'preferred',
        over: context.option2.id,
        confidence: 0.8,
        learnedAt: Date.now()
      });

      console.log(`✅ Learned: User prefers ${context.option1.name} over ${context.option2.name}`);
    } else if (lowerAnswer.includes(context.option2.name.toLowerCase())) {
      // User prefers option 2
      this.learnedPreferences.set(`prefer_${context.option2.id}`, {
        preference: 'preferred',
        over: context.option1.id,
        confidence: 0.8,
        learnedAt: Date.now()
      });

      console.log(`✅ Learned: User prefers ${context.option2.name} over ${context.option1.name}`);
    }
  }

  /**
   * Learn from diversity query
   */
  async learnFromDiversity(query, answer, context) {
    const lowerAnswer = answer.toLowerCase();

    if (lowerAnswer.includes('sí') || lowerAnswer.includes('muéstrame')) {
      // User wants to explore
      this.learnedPreferences.set(`explore_${context.suggestedCategory}`, {
        preference: 'interested',
        confidence: 0.7,
        learnedAt: Date.now()
      });

      console.log(`✅ Learned: User interested in exploring ${context.suggestedCategory}`);
    } else if (lowerAnswer.includes('no') || lowerAnswer.includes('no me interesa')) {
      // User NOT interested
      this.learnedPreferences.set(`explore_${context.suggestedCategory}`, {
        preference: 'not_interested',
        confidence: 0.3,
        learnedAt: Date.now()
      });

      console.log(`❌ Learned: User NOT interested in ${context.suggestedCategory}`);
    }
  }

  /**
   * Learn from committee query
   */
  async learnFromCommittee(query, answer, context) {
    // Store user's resolution of debate
    this.learnedPreferences.set(`debate_resolution_${Date.now()}`, {
      question: query.question,
      answer,
      debateContext: context.debateDetails,
      learnedAt: Date.now()
    });

    console.log(`✅ Learned: User resolved debate with "${answer}"`);
  }

  /**
   * 🔧 BUDGET MANAGEMENT
   */

  /**
   * Check if we have budget to ask
   */
  hasBudget() {
    return this.budget.queriesAsked < this.budget.maxQueriesPerSession;
  }

  /**
   * Reset session budget (call on new session)
   */
  resetSessionBudget() {
    this.budget.queriesAsked = 0;
    this.budget.interactionsSinceLastQuery = 0;
    this.budget.sessionStart = Date.now();

    console.log('🔄 Session budget reset');
  }

  /**
   * Increment interaction counter
   */
  recordInteraction() {
    this.budget.interactionsSinceLastQuery++;
  }

  /**
   * 💾 PERSISTENCE
   */

  async loadHistory() {
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('active_learning_data');

      if (stored) {
        this.queryHistory = stored.queryHistory || [];
        this.learnedPreferences = new Map(stored.learnedPreferences || []);
        this.stats = stored.stats || this.stats;

        console.log('💾 Loaded Active Learning data');
      }
    }
  }

  async saveHistory() {
    if (window.MLStorage) {
      await window.MLStorage.set('active_learning_data', {
        queryHistory: this.queryHistory,
        learnedPreferences: Array.from(this.learnedPreferences.entries()),
        stats: this.stats,
        lastUpdate: Date.now()
      });
    }
  }

  /**
   * 🛠️ UTILITIES
   */

  generateId() {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      budgetRemaining: this.budget.maxQueriesPerSession - this.budget.queriesAsked,
      pendingQueries: this.pendingQueries.length,
      learnedPreferences: this.learnedPreferences.size
    };
  }

  /**
   * Get learned preferences
   */
  getLearnedPreferences() {
    return Array.from(this.learnedPreferences.entries()).map(([key, value]) => ({
      key,
      ...value
    }));
  }

  /**
   * Clear all data
   */
  clearData() {
    this.queryHistory = [];
    this.learnedPreferences.clear();
    this.pendingQueries = [];
    this.resetSessionBudget();
    this.saveHistory();

    console.log('🧹 Active Learning data cleared');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ActiveLearning = new ActiveLearning();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ActiveLearning.initialize();
    });
  } else {
    window.ActiveLearning.initialize();
  }

  console.log('🎯 Active Learning loaded!');
}
