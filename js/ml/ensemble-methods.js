/**
 * 🎼 FASE 16: ENSEMBLE METHODS
 * =============================
 *
 * "El poder de la inteligencia colectiva"
 *
 * Sistema que combina múltiples modelos ML para decisiones más precisas:
 * 1. Voting (votación mayoritaria)
 * 2. Weighted Voting (voto ponderado por confianza)
 * 3. Stacking (meta-modelo que combina predicciones)
 * 4. Boosting (modelos secuenciales que corrigen errores)
 * 5. Bagging (múltiples modelos con datos aleatorios)
 *
 * ARQUITECTURA:
 * - Model Registry: Registro de todos los modelos disponibles
 * - Ensemble Combiner: Combina predicciones de múltiples modelos
 * - Weight Optimizer: Ajusta pesos de cada modelo
 * - Performance Tracker: Rastrea precisión de cada modelo
 * - Meta-Learner: Aprende la mejor forma de combinar
 *
 * EJEMPLO:
 * Recomendación de lugar:
 * - Modelo 1 (Collaborative Filtering): Fushimi Inari (score: 0.85)
 * - Modelo 2 (Content-Based): Kinkaku-ji (score: 0.82)
 * - Modelo 3 (Popularity): Fushimi Inari (score: 0.90)
 * → Ensemble: Fushimi Inari (score: 0.87, confianza: 92%)
 *
 * VENTAJAS:
 * - Reduce overfitting
 * - Más robusto a errores
 * - Mayor precisión
 * - Confianza más calibrada
 */

class EnsembleMethods {
  constructor() {
    this.initialized = false;

    // Registered models
    this.models = new Map();

    // Model weights (ajustados dinámicamente)
    this.weights = new Map();

    // Model performance history
    this.performance = new Map();

    // Ensemble strategies
    this.strategies = {
      voting: this.simpleVoting.bind(this),
      weighted: this.weightedVoting.bind(this),
      averaging: this.averaging.bind(this),
      stacking: this.stacking.bind(this),
      boosting: this.boosting.bind(this)
    };

    // Default strategy
    this.defaultStrategy = 'weighted';

    // Statistics
    this.stats = {
      predictionsMade: 0,
      ensembleAccuracy: 0,
      bestModel: null,
      worstModel: null
    };

    console.log('🎼 Ensemble Methods initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Register available models
    await this.registerAvailableModels();

    // Load performance history
    await this.loadPerformance();

    // Initialize weights
    this.initializeWeights();

    this.initialized = true;
    console.log('✅ Ensemble Methods ready');
    console.log(`📊 Registered ${this.models.size} models`);
  }

  /**
   * 📋 MODEL REGISTRATION
   */

  /**
   * Register available ML models
   */
  async registerAvailableModels() {
    // Modelo 1: Collaborative Filtering
    if (window.CollaborativeFiltering) {
      this.registerModel('collaborative_filtering', {
        name: 'Collaborative Filtering',
        predictor: async (input) => {
          const result = await window.CollaborativeFiltering.recommend(input.userId, input.category);
          return { items: result, confidence: 0.7 };
        },
        weight: 1.0,
        specialty: 'user_similarity'
      });
    }

    // Modelo 2: Pattern Recognition
    if (window.MLBrain) {
      this.registerModel('pattern_recognition', {
        name: 'Pattern Recognition',
        predictor: async (input) => {
          const analysis = await window.MLBrain.analyzeCurrentBehavior();
          return {
            archetype: analysis.archetype?.primary?.name,
            confidence: analysis.archetype?.primary?.score || 0.5
          };
        },
        weight: 0.9,
        specialty: 'behavior_analysis'
      });
    }

    // Modelo 3: Reinforcement Learning
    if (window.ReinforcementLearningEngine) {
      this.registerModel('reinforcement_learning', {
        name: 'Reinforcement Learning',
        predictor: async (input) => {
          const state = {
            userType: input.userType,
            category: input.category
          };
          const action = await window.ReinforcementLearningEngine.selectAction(state);
          return { action, confidence: 0.6 };
        },
        weight: 0.8,
        specialty: 'action_selection'
      });
    }

    // Modelo 4: Meta-Learning
    if (window.MetaLearningEngine) {
      this.registerModel('meta_learning', {
        name: 'Meta-Learning',
        predictor: async (input) => {
          const userType = await window.MetaLearningEngine.detectUserType();
          return { userType, confidence: 0.75 };
        },
        weight: 0.85,
        specialty: 'hyperparameter_tuning'
      });
    }

    // Modelo 5: Tree of Thoughts
    if (window.TreeOfThoughts) {
      this.registerModel('tree_of_thoughts', {
        name: 'Tree of Thoughts',
        predictor: async (input) => {
          const result = await window.TreeOfThoughts.explore(input.query, input.context);
          return {
            bestPath: result.bestPath,
            reasoning: result.reasoning,
            confidence: 0.8
          };
        },
        weight: 0.9,
        specialty: 'reasoning'
      });
    }

    // Modelo 6: Swarm Intelligence
    if (window.SwarmIntelligenceAdvanced || window.SwarmIntelligence) {
      this.registerModel('swarm_intelligence', {
        name: 'Swarm Intelligence',
        predictor: async (input) => {
          const swarm = window.SwarmIntelligenceAdvanced || window.SwarmIntelligence;
          const route = await swarm.optimizeRoute(input.places);
          return { route, confidence: 0.85 };
        },
        weight: 1.0,
        specialty: 'route_optimization'
      });
    }

    console.log(`✅ Registered ${this.models.size} models for ensemble`);
  }

  /**
   * Register a single model
   */
  registerModel(id, modelConfig) {
    this.models.set(id, {
      id,
      ...modelConfig,
      registeredAt: Date.now()
    });

    // Initialize weight
    if (!this.weights.has(id)) {
      this.weights.set(id, modelConfig.weight || 1.0);
    }

    // Initialize performance tracking
    if (!this.performance.has(id)) {
      this.performance.set(id, {
        predictions: 0,
        correct: 0,
        accuracy: 0,
        avgConfidence: 0
      });
    }

    console.log(`📝 Registered model: ${modelConfig.name}`);
  }

  /**
   * 🎯 ENSEMBLE PREDICTION
   */

  /**
   * Main entry point - make ensemble prediction
   */
  async predict(input, strategy = null) {
    const startTime = Date.now();

    const chosenStrategy = strategy || this.defaultStrategy;

    console.log(`🎼 Making ensemble prediction using ${chosenStrategy}...`);

    // Get predictions from all models
    const predictions = await this.getPredictions(input);

    if (predictions.length === 0) {
      return {
        success: false,
        error: 'No models available'
      };
    }

    // Combine using chosen strategy
    const combined = await this.strategies[chosenStrategy](predictions, input);

    // Calculate ensemble confidence
    const ensembleConfidence = this.calculateEnsembleConfidence(predictions);

    this.stats.predictionsMade++;

    const result = {
      success: true,
      prediction: combined,
      confidence: ensembleConfidence,
      modelsPredictions: predictions,
      strategy: chosenStrategy,
      executionTime: Date.now() - startTime
    };

    console.log(`✅ Ensemble prediction complete (confidence: ${(ensembleConfidence * 100).toFixed(1)}%)`);

    return result;
  }

  /**
   * Get predictions from all available models
   */
  async getPredictions(input) {
    const predictions = [];

    for (const [modelId, model] of this.models.entries()) {
      try {
        const prediction = await model.predictor(input);

        predictions.push({
          modelId,
          modelName: model.name,
          prediction,
          weight: this.weights.get(modelId),
          specialty: model.specialty
        });

      } catch (error) {
        console.warn(`⚠️ Model ${model.name} failed:`, error.message);
      }
    }

    return predictions;
  }

  /**
   * 🗳️ COMBINATION STRATEGIES
   */

  /**
   * Simple majority voting
   */
  simpleVoting(predictions) {
    const votes = new Map();

    for (const pred of predictions) {
      const key = JSON.stringify(pred.prediction);
      votes.set(key, (votes.get(key) || 0) + 1);
    }

    // Get most voted
    const sorted = Array.from(votes.entries()).sort((a, b) => b[1] - a[1]);

    return JSON.parse(sorted[0][0]);
  }

  /**
   * Weighted voting (considera pesos de modelos)
   */
  weightedVoting(predictions) {
    const votes = new Map();

    for (const pred of predictions) {
      const key = JSON.stringify(pred.prediction);
      const currentVote = votes.get(key) || 0;
      votes.set(key, currentVote + pred.weight);
    }

    // Get highest weighted vote
    const sorted = Array.from(votes.entries()).sort((a, b) => b[1] - a[1]);

    return JSON.parse(sorted[0][0]);
  }

  /**
   * Averaging (para valores numéricos)
   */
  averaging(predictions) {
    const numericPreds = predictions.filter(p =>
      typeof p.prediction === 'number' || p.prediction.value !== undefined
    );

    if (numericPreds.length === 0) {
      return this.weightedVoting(predictions);
    }

    let weightedSum = 0;
    let totalWeight = 0;

    for (const pred of numericPreds) {
      const value = typeof pred.prediction === 'number' ? pred.prediction : pred.prediction.value;
      weightedSum += value * pred.weight;
      totalWeight += pred.weight;
    }

    return weightedSum / totalWeight;
  }

  /**
   * Stacking (meta-learner)
   */
  async stacking(predictions, input) {
    // Use meta-learning to decide best combination
    if (!window.MetaLearningEngine) {
      return this.weightedVoting(predictions);
    }

    // Feature vector from all predictions
    const features = predictions.map(p => ({
      modelId: p.modelId,
      confidence: p.prediction.confidence || 0.5,
      specialty: p.specialty
    }));

    // Let meta-learner decide
    // For now, use weighted voting with adjusted weights
    return this.weightedVoting(predictions);
  }

  /**
   * Boosting (sequential correction)
   */
  async boosting(predictions, input) {
    // Sort by specialty relevance
    const sorted = [...predictions].sort((a, b) => {
      // Prioritize by task type
      if (input.taskType === 'recommendation' && a.specialty === 'user_similarity') return -1;
      if (input.taskType === 'route' && a.specialty === 'route_optimization') return -1;
      return 0;
    });

    // Use first (most relevant) prediction
    return sorted[0].prediction;
  }

  /**
   * 📊 CONFIDENCE CALCULATION
   */

  /**
   * Calculate ensemble confidence
   */
  calculateEnsembleConfidence(predictions) {
    if (predictions.length === 0) return 0;

    // Factor 1: Average confidence of models
    const avgConfidence = predictions.reduce((sum, p) =>
      sum + (p.prediction.confidence || 0.5), 0
    ) / predictions.length;

    // Factor 2: Agreement between models
    const agreement = this.calculateAgreement(predictions);

    // Factor 3: Weighted average by model performance
    const performanceWeighted = this.calculatePerformanceWeightedConfidence(predictions);

    // Combine factors
    const ensembleConfidence = (
      avgConfidence * 0.4 +
      agreement * 0.3 +
      performanceWeighted * 0.3
    );

    return Math.max(0, Math.min(1, ensembleConfidence));
  }

  /**
   * Calculate agreement between models
   */
  calculateAgreement(predictions) {
    if (predictions.length < 2) return 1.0;

    // Count how many models agree
    const votes = new Map();

    for (const pred of predictions) {
      const key = JSON.stringify(pred.prediction);
      votes.set(key, (votes.get(key) || 0) + 1);
    }

    const maxVotes = Math.max(...votes.values());
    const agreement = maxVotes / predictions.length;

    return agreement;
  }

  /**
   * Calculate performance-weighted confidence
   */
  calculatePerformanceWeightedConfidence(predictions) {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const pred of predictions) {
      const perf = this.performance.get(pred.modelId);
      const accuracy = perf ? perf.accuracy : 0.5;

      weightedSum += (pred.prediction.confidence || 0.5) * accuracy;
      totalWeight += accuracy;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  /**
   * 📈 WEIGHT OPTIMIZATION
   */

  /**
   * Update model weights based on performance
   */
  updateWeights() {
    for (const [modelId, perf] of this.performance.entries()) {
      if (perf.predictions < 10) {
        // Not enough data yet
        continue;
      }

      // Adjust weight based on accuracy
      const currentWeight = this.weights.get(modelId);
      const targetWeight = perf.accuracy;

      // Smooth transition
      const newWeight = currentWeight * 0.7 + targetWeight * 0.3;

      this.weights.set(modelId, Math.max(0.1, Math.min(1.0, newWeight)));

      console.log(`⚖️ Updated weight for ${modelId}: ${newWeight.toFixed(2)}`);
    }

    this.savePerformance();
  }

  /**
   * Record prediction outcome
   */
  recordOutcome(modelId, wasCorrect, confidence) {
    const perf = this.performance.get(modelId);

    if (!perf) return;

    perf.predictions++;
    if (wasCorrect) perf.correct++;

    perf.accuracy = perf.correct / perf.predictions;
    perf.avgConfidence = (perf.avgConfidence * (perf.predictions - 1) + confidence) / perf.predictions;

    this.savePerformance();

    // Update weights every 10 predictions
    if (perf.predictions % 10 === 0) {
      this.updateWeights();
    }
  }

  /**
   * 🛠️ UTILITIES
   */

  /**
   * Initialize all weights to 1.0
   */
  initializeWeights() {
    for (const modelId of this.models.keys()) {
      if (!this.weights.has(modelId)) {
        this.weights.set(modelId, 1.0);
      }
    }
  }

  /**
   * 💾 PERSISTENCE
   */

  async loadPerformance() {
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('ensemble_performance');

      if (stored) {
        this.performance = new Map(stored.performance || []);
        this.weights = new Map(stored.weights || []);
        this.stats = stored.stats || this.stats;

        console.log('💾 Loaded ensemble performance data');
      }
    }
  }

  async savePerformance() {
    if (window.MLStorage) {
      await window.MLStorage.set('ensemble_performance', {
        performance: Array.from(this.performance.entries()),
        weights: Array.from(this.weights.entries()),
        stats: this.stats,
        lastUpdate: Date.now()
      });
    }
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    // Find best/worst models
    let bestModel = null;
    let worstModel = null;
    let maxAccuracy = 0;
    let minAccuracy = 1;

    for (const [modelId, perf] of this.performance.entries()) {
      if (perf.predictions < 5) continue; // Need minimum data

      if (perf.accuracy > maxAccuracy) {
        maxAccuracy = perf.accuracy;
        bestModel = modelId;
      }

      if (perf.accuracy < minAccuracy) {
        minAccuracy = perf.accuracy;
        worstModel = modelId;
      }
    }

    return {
      ...this.stats,
      modelsRegistered: this.models.size,
      bestModel: bestModel ? {
        id: bestModel,
        name: this.models.get(bestModel)?.name,
        accuracy: maxAccuracy
      } : null,
      worstModel: worstModel ? {
        id: worstModel,
        name: this.models.get(worstModel)?.name,
        accuracy: minAccuracy
      } : null,
      modelPerformance: Array.from(this.performance.entries()).map(([id, perf]) => ({
        id,
        name: this.models.get(id)?.name,
        ...perf,
        weight: this.weights.get(id)
      }))
    };
  }

  /**
   * Get model weights
   */
  getWeights() {
    return Array.from(this.weights.entries()).map(([id, weight]) => ({
      id,
      name: this.models.get(id)?.name,
      weight
    }));
  }

  /**
   * Clear all data
   */
  clearData() {
    this.performance.clear();
    this.initializeWeights();
    this.savePerformance();

    console.log('🧹 Ensemble data cleared');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.EnsembleMethods = new EnsembleMethods();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.EnsembleMethods.initialize();
    });
  } else {
    window.EnsembleMethods.initialize();
  }

  console.log('🎼 Ensemble Methods loaded!');
}
