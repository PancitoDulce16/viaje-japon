/**
 * 🧠 FASE 6: META-LEARNING ENGINE (RE-ENGINEERED)
 * =================================================
 *
 * "Aprender a Aprender Más Rápido" - Versión From Scratch
 *
 * Este NO es ajuste de prompts. Es ajuste DINÁMICO de hiperparámetros matemáticos
 * del algoritmo de Reinforcement Learning basado en el comportamiento del usuario.
 *
 * Hiperparámetros que se ajustan automáticamente:
 * - α (Alpha / Learning Rate): Qué tan rápido sobrescribo lo viejo con lo nuevo
 * - ε (Epsilon / Exploration Rate): Cuánto arriesgo a probar cosas nuevas vs. ir a lo seguro
 * - γ (Gamma / Discount Factor): Cuánto valoro recompensas futuras vs. inmediatas
 *
 * Detecta 3 tipos de usuarios basados en MÉTRICAS REALES:
 * 1. QUICK LEARNER (Impaciente): Rechaza rápido → α alto, ε bajo
 * 2. EXPLORER (Curioso): Acepta variedad → α medio, ε alto
 * 3. NEEDS GUIDANCE (Perdido): Tarda en decidir → α bajo, ε bajo
 *
 * Como un maestro que reconoce:
 * - Si un estudiante aprende rápido con pocos ejemplos
 * - Si le gusta experimentar y descubrir
 * - Si necesita guía paso a paso
 */

class MetaLearningEngine {
  constructor() {
    this.initialized = false;

    // Default hyperparameters (Conservative starting point)
    this.defaultConfig = {
      learningRate: 0.1,      // α - Aprende despacio (prudente)
      explorationRate: 0.2,   // ε - 20% de veces prueba cosas nuevas
      discountFactor: 0.9,    // γ - Valora el futuro (viajes de largo plazo)
      temperature: 1.0        // Para softmax en decisiones
    };

    // Current hyperparameters per user
    this.userConfigs = new Map(); // userId -> hyperparameters

    // User behavior metrics (tracked in real-time)
    this.userMetrics = new Map(); // userId -> metrics

    // User type profiles (mathematical definitions)
    this.userTypes = {
      'quick-learner': {
        description: 'Aprende rápido, impaciente, quiere resultados YA',
        hyperparams: {
          learningRate: 0.8,      // MUY alto - aprende super rápido
          explorationRate: 0.05,  // MUY bajo - no experimentes, dale lo seguro
          discountFactor: 0.7,    // Prioriza satisfacción inmediata
          temperature: 0.5        // Decisiones más determinísticas
        },
        detectionCriteria: {
          rejectVelocity: 'high',      // < 5 segundos para rechazar
          consecutiveRejects: 3,        // Rechaza 3 seguidas
          avgResponseTime: 'low'        // Responde rápido
        }
      },
      'explorer': {
        description: 'Curioso, le gusta variedad, experimentar',
        hyperparams: {
          learningRate: 0.3,      // Medio - aprende normal
          explorationRate: 0.6,   // ALTO - arriésgate, muéstrale cosas raras
          discountFactor: 0.85,   // Valora experiencias variadas
          temperature: 1.5        // Más aleatorio, más sorpresas
        },
        detectionCriteria: {
          categoryVariety: 'high',      // Acepta 4+ categorías distintas
          acceptanceRate: 'medium-high', // 50-80% aceptación
          explorationScore: 'high'       // Clickea cosas fuera de patrón
        }
      },
      'needs-guidance': {
        description: 'Perdido, necesita mano firme, dudas frecuentes',
        hyperparams: {
          learningRate: 0.1,      // Bajo - aprende lento, estable
          explorationRate: 0.1,   // MUY bajo - conservador, "Top Hits"
          discountFactor: 0.95,   // Planificación a largo plazo
          temperature: 0.3        // MUY determinístico
        },
        detectionCriteria: {
          hesitationTime: 'high',       // > 30 segs para decidir
          helpRequests: 'frequent',     // Pide ayuda seguido
          acceptanceRate: 'low'         // < 40% aceptación
        }
      },
      'undecided': {
        description: 'Cambia de opinión, inconsistente',
        hyperparams: {
          learningRate: 0.2,      // Medio-bajo
          explorationRate: 0.4,   // Medio
          discountFactor: 0.8,    // Medio
          temperature: 1.0        // Normal
        },
        detectionCriteria: {
          changeRate: 'high',         // Cambia decisiones
          acceptRejectRatio: 'close'  // 50/50
        }
      }
    };

    // Performance tracking per configuration
    this.configPerformance = new Map();

    // Adjustment history
    this.adjustmentHistory = [];

    console.log('🧠 Meta-Learning Engine (Mathematical) initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load configurations from storage
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('meta_learning_hyperparams');
      if (stored) {
        this.userConfigs = new Map(stored.configs || []);
        this.userMetrics = new Map(stored.metrics || []);
        this.configPerformance = new Map(stored.performance || []);
        this.adjustmentHistory = stored.history || [];
      }
    }

    this.initialized = true;
    console.log('✅ Meta-Learning Engine (Mathematical) ready');
    console.log(`📊 Tracking ${this.userConfigs.size} user configurations`);
  }

  /**
   * 🎯 Main entry point: Get optimal hyperparameters for user
   * @param {string} userId - User identifier
   * @returns {Object} Hyperparameters { learningRate, explorationRate, discountFactor, temperature }
   */
  getHyperparameters(userId = 'default') {
    // If we have a config for this user, return it
    if (this.userConfigs.has(userId)) {
      return this.userConfigs.get(userId);
    }

    // Otherwise, detect user type and assign appropriate hyperparameters
    const userType = this.detectUserType(userId);
    const config = this.userTypes[userType].hyperparams;

    // Store and return
    this.userConfigs.set(userId, { ...config, type: userType });

    console.log(`🎯 Assigned ${userType} hyperparameters to user ${userId}:`, config);

    return config;
  }

  /**
   * 🔍 Detect user type based on behavioral metrics
   * @param {string} userId - User identifier
   * @returns {string} User type ('quick-learner', 'explorer', 'needs-guidance', 'undecided')
   */
  detectUserType(userId) {
    const metrics = this.userMetrics.get(userId);

    if (!metrics || metrics.totalInteractions < 5) {
      // Not enough data, default to undecided
      return 'undecided';
    }

    // Check each type's criteria
    for (const [typeName, typeConfig] of Object.entries(this.userTypes)) {
      if (this.matchesCriteria(metrics, typeConfig.detectionCriteria)) {
        return typeName;
      }
    }

    return 'undecided';
  }

  /**
   * ✅ Check if metrics match detection criteria
   */
  matchesCriteria(metrics, criteria) {
    let matches = 0;
    let total = 0;

    for (const [key, value] of Object.entries(criteria)) {
      total++;

      if (key === 'rejectVelocity' && value === 'high') {
        if (metrics.avgRejectTime < 5000) matches++; // < 5 segundos
      }
      else if (key === 'consecutiveRejects') {
        if (metrics.maxConsecutiveRejects >= value) matches++;
      }
      else if (key === 'avgResponseTime' && value === 'low') {
        if (metrics.avgResponseTime < 10000) matches++; // < 10 segundos
      }
      else if (key === 'categoryVariety' && value === 'high') {
        if (metrics.uniqueCategories >= 4) matches++;
      }
      else if (key === 'acceptanceRate') {
        const rate = metrics.acceptedCount / metrics.totalInteractions;
        if (value === 'medium-high' && rate >= 0.5 && rate <= 0.8) matches++;
        else if (value === 'low' && rate < 0.4) matches++;
      }
      else if (key === 'hesitationTime' && value === 'high') {
        if (metrics.avgResponseTime > 30000) matches++; // > 30 segundos
      }
      else if (key === 'helpRequests' && value === 'frequent') {
        if (metrics.helpRequestCount > 3) matches++;
      }
      else if (key === 'changeRate' && value === 'high') {
        if (metrics.decisionChanges >= 3) matches++;
      }
    }

    // Need to match at least 70% of criteria
    return (matches / total) >= 0.7;
  }

  /**
   * 📊 Track user interaction for metrics
   * @param {string} userId - User identifier
   * @param {Object} interaction - Interaction data
   */
  trackInteraction(userId, interaction) {
    if (!this.userMetrics.has(userId)) {
      this.userMetrics.set(userId, {
        totalInteractions: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        avgResponseTime: 0,
        avgRejectTime: 0,
        maxConsecutiveRejects: 0,
        currentConsecutiveRejects: 0,
        uniqueCategories: new Set(),
        helpRequestCount: 0,
        decisionChanges: 0,
        explorationScore: 0,
        lastDecision: null,
        timestamps: []
      });
    }

    const metrics = this.userMetrics.get(userId);
    metrics.totalInteractions++;

    // Track acceptance/rejection
    if (interaction.accepted) {
      metrics.acceptedCount++;
      metrics.currentConsecutiveRejects = 0;
    } else if (interaction.rejected) {
      metrics.rejectedCount++;
      metrics.currentConsecutiveRejects++;

      if (metrics.currentConsecutiveRejects > metrics.maxConsecutiveRejects) {
        metrics.maxConsecutiveRejects = metrics.currentConsecutiveRejects;
      }

      // Track reject velocity
      if (interaction.responseTime && interaction.responseTime < 5000) {
        const n = metrics.rejectedCount;
        metrics.avgRejectTime = (metrics.avgRejectTime * (n - 1) + interaction.responseTime) / n;
      }
    }

    // Track response time
    if (interaction.responseTime) {
      const n = metrics.totalInteractions;
      metrics.avgResponseTime = (metrics.avgResponseTime * (n - 1) + interaction.responseTime) / n;
    }

    // Track category variety
    if (interaction.category) {
      metrics.uniqueCategories.add(interaction.category);
    }

    // Track help requests
    if (interaction.helpRequested) {
      metrics.helpRequestCount++;
    }

    // Track decision changes
    if (interaction.changedDecision) {
      metrics.decisionChanges++;
    }

    // Track exploration
    if (interaction.exploredNewCategory) {
      metrics.explorationScore++;
    }

    metrics.timestamps.push(Date.now());

    // Check if we need to adjust hyperparameters
    this.checkForHyperparameterAdjustment(userId);
  }

  /**
   * 🔧 Check if hyperparameters need adjustment
   */
  checkForHyperparameterAdjustment(userId) {
    const metrics = this.userMetrics.get(userId);

    // Need at least 10 interactions before adjusting
    if (metrics.totalInteractions < 10) return;

    // Re-detect user type every 10 interactions
    if (metrics.totalInteractions % 10 === 0) {
      const oldType = this.userConfigs.get(userId)?.type || 'undecided';
      const newType = this.detectUserType(userId);

      if (oldType !== newType) {
        console.log(`🔄 User ${userId} type changed: ${oldType} → ${newType}`);

        // Update hyperparameters
        const newConfig = {
          ...this.userTypes[newType].hyperparams,
          type: newType
        };

        this.userConfigs.set(userId, newConfig);

        // Record adjustment
        this.adjustmentHistory.push({
          timestamp: Date.now(),
          userId,
          oldType,
          newType,
          oldConfig: this.userTypes[oldType].hyperparams,
          newConfig: this.userTypes[newType].hyperparams,
          metrics: { ...metrics }
        });

        // Notify Reinforcement Learning Engine
        if (window.ReinforcementLearningEngine) {
          window.ReinforcementLearningEngine.updateHyperparameters(newConfig);
        }

        this.save();
      }
    }

    // Fine-tune based on recent performance
    if (metrics.totalInteractions % 20 === 0) {
      this.fineTuneHyperparameters(userId);
    }
  }

  /**
   * 🎛️ Fine-tune hyperparameters based on performance
   */
  fineTuneHyperparameters(userId) {
    const config = this.userConfigs.get(userId);
    const metrics = this.userMetrics.get(userId);

    if (!config || !metrics) return;

    const acceptanceRate = metrics.acceptedCount / metrics.totalInteractions;

    // If acceptance rate is dropping, adjust
    if (acceptanceRate < 0.3) {
      // Too many rejections - need to explore more
      config.explorationRate = Math.min(0.8, config.explorationRate * 1.3);
      console.log(`📈 Increasing exploration for ${userId}: ε → ${config.explorationRate.toFixed(2)}`);
    } else if (acceptanceRate > 0.8) {
      // High acceptance - can be more confident, less exploration
      config.explorationRate = Math.max(0.05, config.explorationRate * 0.8);
      console.log(`📉 Decreasing exploration for ${userId}: ε → ${config.explorationRate.toFixed(2)}`);
    }

    // Adjust learning rate based on consistency
    if (metrics.decisionChanges > 5) {
      // User is inconsistent - slow down learning
      config.learningRate = Math.max(0.05, config.learningRate * 0.8);
      console.log(`🐌 Slowing learning for ${userId}: α → ${config.learningRate.toFixed(2)}`);
    }

    this.save();
  }

  /**
   * 📊 Apply hyperparameters to Q-Learning update
   * This is the CORE mathematical formula
   */
  applyQLearningUpdate(oldQValue, reward, maxFutureQ, hyperparams) {
    const { learningRate, discountFactor } = hyperparams;

    // Q-Learning formula: Q(s,a) ← Q(s,a) + α[r + γ·max(Q(s',a')) - Q(s,a)]
    const tdTarget = reward + discountFactor * maxFutureQ;
    const tdError = tdTarget - oldQValue;
    const newQValue = oldQValue + learningRate * tdError;

    return newQValue;
  }

  /**
   * 🎲 Apply epsilon-greedy exploration
   * Returns true if should explore (random action), false if should exploit (best action)
   */
  shouldExplore(hyperparams) {
    return Math.random() < hyperparams.explorationRate;
  }

  /**
   * 🌡️ Apply softmax temperature to action selection
   * Higher temperature = more random, lower = more deterministic
   */
  softmaxSelection(qValues, hyperparams) {
    const { temperature } = hyperparams;

    // Compute softmax with temperature
    const expValues = qValues.map(q => Math.exp(q / temperature));
    const sumExp = expValues.reduce((a, b) => a + b, 0);
    const probabilities = expValues.map(exp => exp / sumExp);

    // Sample from distribution
    const rand = Math.random();
    let cumProb = 0;

    for (let i = 0; i < probabilities.length; i++) {
      cumProb += probabilities[i];
      if (rand < cumProb) {
        return i;
      }
    }

    return qValues.length - 1;
  }

  /**
   * 💾 Save to storage
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('meta_learning_hyperparams', {
        configs: Array.from(this.userConfigs.entries()),
        metrics: Array.from(this.userMetrics.entries()).map(([id, m]) => [
          id,
          { ...m, uniqueCategories: Array.from(m.uniqueCategories) }
        ]),
        performance: Array.from(this.configPerformance.entries()),
        history: this.adjustmentHistory.slice(-100)
      });
    }
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    const typeDistribution = {};
    for (const [userId, config] of this.userConfigs) {
      const type = config.type || 'undecided';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    }

    return {
      totalUsers: this.userConfigs.size,
      typeDistribution,
      recentAdjustments: this.adjustmentHistory.slice(-10),
      avgLearningRate: Array.from(this.userConfigs.values())
        .reduce((sum, c) => sum + c.learningRate, 0) / (this.userConfigs.size || 1),
      avgExplorationRate: Array.from(this.userConfigs.values())
        .reduce((sum, c) => sum + c.explorationRate, 0) / (this.userConfigs.size || 1)
    };
  }

  /**
   * 🎯 Get current configuration for user
   */
  getUserConfig(userId) {
    return this.userConfigs.get(userId) || { ...this.defaultConfig, type: 'undecided' };
  }

  /**
   * 📈 Get metrics for user
   */
  getUserMetrics(userId) {
    return this.userMetrics.get(userId) || null;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.MetaLearningEngine = new MetaLearningEngine();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.MetaLearningEngine.initialize();
    });
  } else {
    window.MetaLearningEngine.initialize();
  }

  console.log('🧠 Meta-Learning Engine (Mathematical) loaded!');
}
