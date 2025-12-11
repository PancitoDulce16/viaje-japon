/**
 * 🎯 LEARNING STRATEGIES MANAGER
 * ===============================
 *
 * "El Maestro que elige la mejor forma de enseñar a cada estudiante"
 *
 * Este módulo implementa diferentes estrategias de aprendizaje y selecciona
 * la más apropiada para cada usuario basándose en:
 * - Tipo de usuario (quick-learner, needs-guidance, explorer)
 * - Contexto actual (nueva función, problema complejo, etc.)
 * - Historial de éxito de cada estrategia
 *
 * Estrategias implementadas:
 * 1. Few-Shot Learning: Aprende con pocos ejemplos
 * 2. Supervised Learning: Aprende con instrucciones claras
 * 3. Reinforcement Learning: Aprende por ensayo y error
 * 4. Transfer Learning: Usa conocimiento de contextos similares
 * 5. Curriculum Learning: Progresión gradual de simple a complejo
 * 6. Active Learning: Pregunta cuando tiene dudas
 */

class LearningStrategiesManager {
  constructor() {
    this.initialized = false;

    // Available strategies
    this.strategies = {
      'few-shot': {
        name: 'Few-Shot Learning',
        description: 'Aprende con muy pocos ejemplos (3-5)',
        minExamples: 3,
        bestFor: ['quick-learner', 'experienced'],
        strengths: ['Rápido', 'Eficiente'],
        weaknesses: ['Puede sobre-generalizar'],
        successRate: 0.7
      },
      'supervised': {
        name: 'Supervised Learning',
        description: 'Aprende con ejemplos etiquetados y guía clara',
        minExamples: 10,
        bestFor: ['needs-guidance', 'beginner'],
        strengths: ['Confiable', 'Predecible'],
        weaknesses: ['Necesita muchos ejemplos'],
        successRate: 0.85
      },
      'reinforcement': {
        name: 'Reinforcement Learning',
        description: 'Aprende por ensayo y error con feedback',
        minExamples: 20,
        bestFor: ['explorer', 'experimental'],
        strengths: ['Descubre soluciones óptimas', 'Adaptativo'],
        weaknesses: ['Lento', 'Puede hacer errores'],
        successRate: 0.75
      },
      'transfer': {
        name: 'Transfer Learning',
        description: 'Reutiliza conocimiento de situaciones similares',
        minExamples: 0, // No necesita ejemplos del nuevo contexto
        bestFor: ['all'],
        strengths: ['Muy rápido', 'Generaliza bien'],
        weaknesses: ['Puede aplicar mal el conocimiento'],
        successRate: 0.8
      },
      'curriculum': {
        name: 'Curriculum Learning',
        description: 'Progresión gradual de simple a complejo',
        minExamples: 15,
        bestFor: ['needs-guidance', 'beginner'],
        strengths: ['Aprendizaje sólido', 'Menos errores'],
        weaknesses: ['Más lento'],
        successRate: 0.82
      },
      'active': {
        name: 'Active Learning',
        description: 'Pregunta cuando no está seguro',
        minExamples: 5,
        bestFor: ['all'],
        strengths: ['Aprende exactamente lo que necesita', 'Eficiente'],
        weaknesses: ['Requiere interacción del usuario'],
        successRate: 0.88
      }
    };

    // Strategy selection history
    this.selectionHistory = [];

    // Performance tracking per strategy
    this.strategyPerformance = new Map();

    // Current active strategy per user
    this.activeStrategies = new Map(); // userId -> strategy

    console.log('🎯 Learning Strategies Manager initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load history
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('learning_strategies');
      if (stored) {
        this.selectionHistory = stored.history || [];
        this.strategyPerformance = new Map(stored.performance || []);
        this.activeStrategies = new Map(stored.active || []);
      }
    }

    this.initialized = true;
    console.log('✅ Learning Strategies Manager ready');
    console.log(`📊 ${this.strategyPerformance.size} strategies tracked`);
  }

  /**
   * 🎯 Select the best learning strategy for a user
   * @param {Object} context - User context (type, task, history)
   * @returns {string} Strategy name
   */
  selectStrategy(context) {
    const {
      userId = 'default',
      userType = 'explorer',
      taskComplexity = 'medium', // simple, medium, complex
      availableExamples = 0,
      taskType = 'general', // general, optimization, classification, etc.
      urgency = 'normal' // low, normal, high
    } = context;

    console.log(`🎯 Selecting strategy for ${userType} user, ${taskComplexity} task`);

    // Score each strategy
    const scores = new Map();

    for (const [strategyName, strategy] of Object.entries(this.strategies)) {
      let score = 0;

      // 1. User type compatibility (40% weight)
      if (strategy.bestFor.includes(userType) || strategy.bestFor.includes('all')) {
        score += 0.4;
      } else {
        score += 0.1;
      }

      // 2. Example availability (20% weight)
      if (availableExamples >= strategy.minExamples) {
        score += 0.2;
      } else if (strategyName === 'transfer') {
        // Transfer learning doesn't need examples
        score += 0.2;
      } else {
        score += 0.05;
      }

      // 3. Task complexity match (20% weight)
      if (taskComplexity === 'simple' && strategyName === 'few-shot') {
        score += 0.2;
      } else if (taskComplexity === 'medium' && (strategyName === 'supervised' || strategyName === 'active')) {
        score += 0.2;
      } else if (taskComplexity === 'complex' && (strategyName === 'curriculum' || strategyName === 'reinforcement')) {
        score += 0.2;
      } else {
        score += 0.1;
      }

      // 4. Historical success rate (20% weight)
      const performance = this.strategyPerformance.get(strategyName);
      if (performance) {
        score += 0.2 * performance.successRate;
      } else {
        score += 0.2 * strategy.successRate;
      }

      // Bonus: Urgency consideration
      if (urgency === 'high' && (strategyName === 'few-shot' || strategyName === 'transfer')) {
        score += 0.1;
      }

      scores.set(strategyName, score);
    }

    // Select strategy with highest score
    let bestStrategy = 'supervised'; // Default
    let bestScore = 0;

    for (const [strategyName, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = strategyName;
      }
    }

    // Record selection
    this.recordSelection(userId, bestStrategy, context, bestScore);

    console.log(`✅ Selected strategy: ${bestStrategy} (score: ${bestScore.toFixed(2)})`);

    return bestStrategy;
  }

  /**
   * 📝 Record strategy selection
   */
  recordSelection(userId, strategy, context, score) {
    this.selectionHistory.push({
      timestamp: Date.now(),
      userId,
      strategy,
      context,
      score
    });

    // Keep last 1000 selections
    if (this.selectionHistory.length > 1000) {
      this.selectionHistory.shift();
    }

    // Update active strategy
    this.activeStrategies.set(userId, strategy);

    this.save();
  }

  /**
   * 📊 Record strategy performance
   */
  recordPerformance(userId, success, metrics = {}) {
    const strategy = this.activeStrategies.get(userId);
    if (!strategy) return;

    if (!this.strategyPerformance.has(strategy)) {
      this.strategyPerformance.set(strategy, {
        totalUses: 0,
        successes: 0,
        successRate: 0,
        avgMetrics: {
          learningSpeed: 0,
          accuracy: 0,
          confidence: 0
        }
      });
    }

    const perf = this.strategyPerformance.get(strategy);
    perf.totalUses++;

    if (success) {
      perf.successes++;
    }

    perf.successRate = perf.successes / perf.totalUses;

    // Update metrics
    if (metrics.learningSpeed !== undefined) {
      perf.avgMetrics.learningSpeed =
        (perf.avgMetrics.learningSpeed * (perf.totalUses - 1) + metrics.learningSpeed) / perf.totalUses;
    }

    if (metrics.accuracy !== undefined) {
      perf.avgMetrics.accuracy =
        (perf.avgMetrics.accuracy * (perf.totalUses - 1) + metrics.accuracy) / perf.totalUses;
    }

    if (metrics.confidence !== undefined) {
      perf.avgMetrics.confidence =
        (perf.avgMetrics.confidence * (perf.totalUses - 1) + metrics.confidence) / perf.totalUses;
    }

    console.log(`📊 ${strategy} performance: ${(perf.successRate * 100).toFixed(1)}% success rate`);

    this.save();
  }

  /**
   * 🔄 Switch strategy if current one is failing
   */
  switchStrategyIfNeeded(userId, currentPerformance) {
    const currentStrategy = this.activeStrategies.get(userId);
    if (!currentStrategy) return null;

    const perf = this.strategyPerformance.get(currentStrategy);

    // If success rate is too low, switch
    if (perf && perf.totalUses >= 5 && perf.successRate < 0.5) {
      console.log(`⚠️ ${currentStrategy} performing poorly, switching...`);

      // Get all strategies except current
      const alternatives = Object.keys(this.strategies).filter(s => s !== currentStrategy);

      // Sort by success rate
      alternatives.sort((a, b) => {
        const perfA = this.strategyPerformance.get(a);
        const perfB = this.strategyPerformance.get(b);
        const rateA = perfA ? perfA.successRate : this.strategies[a].successRate;
        const rateB = perfB ? perfB.successRate : this.strategies[b].successRate;
        return rateB - rateA;
      });

      const newStrategy = alternatives[0];
      this.activeStrategies.set(userId, newStrategy);

      console.log(`✅ Switched to: ${newStrategy}`);

      return newStrategy;
    }

    return null;
  }

  /**
   * 🎓 Get recommended strategy for specific task
   */
  getRecommendationForTask(taskType) {
    const recommendations = {
      'quick_decision': 'few-shot',
      'pattern_recognition': 'supervised',
      'optimization': 'reinforcement',
      'new_context': 'transfer',
      'learning_progression': 'curriculum',
      'uncertainty_handling': 'active'
    };

    return recommendations[taskType] || 'supervised';
  }

  /**
   * 📚 Apply curriculum learning (progressive difficulty)
   */
  getCurriculumStage(userId) {
    const history = this.selectionHistory.filter(s => s.userId === userId);

    if (history.length < 5) {
      return 'beginner'; // Simple tasks
    } else if (history.length < 20) {
      return 'intermediate'; // Medium tasks
    } else {
      return 'advanced'; // Complex tasks
    }
  }

  /**
   * 🤔 Should use active learning? (ask user for clarification)
   */
  shouldAskForClarification(confidence, context) {
    // If confidence is low and active learning is beneficial
    if (confidence < 0.6) {
      const strategy = this.activeStrategies.get(context.userId);
      if (strategy === 'active') {
        return {
          ask: true,
          reason: 'Low confidence, active learning enabled',
          questions: this.generateClarificationQuestions(context)
        };
      }
    }

    return { ask: false };
  }

  /**
   * ❓ Generate clarification questions
   */
  generateClarificationQuestions(context) {
    const questions = [];

    if (context.taskType === 'add_activity') {
      questions.push('¿Qué tipo de actividad prefieres?');
      questions.push('¿En qué parte del día?');
      questions.push('¿Cuál es tu presupuesto aproximado?');
    } else if (context.taskType === 'optimize_routes') {
      questions.push('¿Prefieres minimizar distancia o tiempo?');
      questions.push('¿Qué tan importante es visitar todos los lugares?');
    } else if (context.taskType === 'adjust_budget') {
      questions.push('¿Cuánto quieres reducir el presupuesto?');
      questions.push('¿Qué categorías son más importantes para ti?');
    }

    return questions.slice(0, 2); // Max 2 questions
  }

  /**
   * 💾 Save to storage
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('learning_strategies', {
        history: this.selectionHistory,
        performance: Array.from(this.strategyPerformance.entries()),
        active: Array.from(this.activeStrategies.entries())
      });
    }
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    const strategyUsage = new Map();

    for (const selection of this.selectionHistory) {
      const count = strategyUsage.get(selection.strategy) || 0;
      strategyUsage.set(selection.strategy, count + 1);
    }

    return {
      totalSelections: this.selectionHistory.length,
      strategyDistribution: Object.fromEntries(strategyUsage),
      performance: Object.fromEntries(this.strategyPerformance),
      activeUsers: this.activeStrategies.size,
      availableStrategies: Object.keys(this.strategies)
    };
  }

  /**
   * 📈 Get performance report
   */
  getPerformanceReport() {
    const report = {
      strategies: [],
      bestStrategy: null,
      worstStrategy: null
    };

    for (const [name, strategy] of Object.entries(this.strategies)) {
      const perf = this.strategyPerformance.get(name);

      report.strategies.push({
        name,
        description: strategy.description,
        bestFor: strategy.bestFor,
        successRate: perf ? perf.successRate : strategy.successRate,
        totalUses: perf ? perf.totalUses : 0,
        avgMetrics: perf ? perf.avgMetrics : null
      });
    }

    // Sort by success rate
    report.strategies.sort((a, b) => b.successRate - a.successRate);

    report.bestStrategy = report.strategies[0];
    report.worstStrategy = report.strategies[report.strategies.length - 1];

    return report;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.LearningStrategiesManager = new LearningStrategiesManager();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.LearningStrategiesManager.initialize();
    });
  } else {
    window.LearningStrategiesManager.initialize();
  }

  console.log('🎯 Learning Strategies Manager loaded!');
}
