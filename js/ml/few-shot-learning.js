/**
 * 🎯 FASE 6: FEW-SHOT LEARNING ENGINE
 * =====================================
 *
 * "Aprender con POCOS Ejemplos (Como Humanos)"
 *
 * Los humanos pueden aprender conceptos nuevos con solo 3-5 ejemplos.
 * Este módulo replica esa capacidad para la AI.
 *
 * Implementa:
 * - Prototype Learning: Crear "prototipos" de categorías con pocos ejemplos
 * - Similarity Matching: Comparar nuevas situaciones con prototipos conocidos
 * - Rapid Generalization: Generalizar rápido desde ejemplos limitados
 * - Confidence Estimation: Saber qué tan seguro está de sus inferencias
 *
 * Ejemplo:
 * Usuario rechaza shopping 3 veces → AI infiere "No le gusta shopping"
 * Usuario acepta templos 2 veces → AI infiere "Le gusta cultura"
 * → AI recomienda: tea ceremony, museos, jardines (cultural, no shopping)
 */

class FewShotLearningEngine {
  constructor() {
    this.initialized = false;

    // Learned prototypes (concept → examples)
    this.prototypes = new Map();

    // Minimum examples needed for different confidence levels
    this.confidenceThresholds = {
      high: 5,      // 5+ examples = 90% confidence
      medium: 3,    // 3-4 examples = 70% confidence
      low: 2        // 2 examples = 50% confidence
    };

    // Feature extractors for different data types
    this.featureExtractors = {
      category: this.extractCategoryFeatures.bind(this),
      activity: this.extractActivityFeatures.bind(this),
      preference: this.extractPreferenceFeatures.bind(this),
      budget: this.extractBudgetFeatures.bind(this)
    };

    // Learning statistics
    this.stats = {
      totalPrototypes: 0,
      totalExamples: 0,
      avgExamplesPerPrototype: 0,
      predictionAccuracy: 0,
      predictions: []
    };

    console.log('🎯 Few-Shot Learning Engine initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load prototypes from storage
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('few_shot_prototypes');
      if (stored) {
        // Convert array back to Map
        this.prototypes = new Map(stored.prototypes || []);
        this.stats = stored.stats || this.stats;
      }
    }

    this.initialized = true;
    console.log('✅ Few-Shot Learning Engine ready');
    console.log(`🎯 Loaded ${this.prototypes.size} prototypes`);
  }

  /**
   * 📖 Learn from few examples
   * @param {string} concept - What we're learning (e.g., "user_123_likes_temples")
   * @param {Array} examples - Small set of examples (2-5 typically)
   * @param {string} type - Type of data (category, activity, preference, etc.)
   * @returns {Object} Learned prototype
   */
  async learnFromExamples(concept, examples, type = 'category') {
    if (examples.length === 0) {
      console.warn('⚠️ No examples provided for learning');
      return null;
    }

    console.log(`📖 Learning concept "${concept}" from ${examples.length} examples`);

    // Extract features from examples
    const extractor = this.featureExtractors[type] || this.featureExtractors.category;
    const features = examples.map(ex => extractor(ex));

    // Create or update prototype
    let prototype = this.prototypes.get(concept);

    if (!prototype) {
      prototype = {
        concept,
        type,
        examples: [],
        features: [],
        centroid: null,
        confidence: 0,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };
    }

    // Add new examples
    prototype.examples.push(...examples);
    prototype.features.push(...features);

    // Calculate centroid (average of all features)
    prototype.centroid = this.calculateCentroid(prototype.features);

    // Update confidence based on number of examples
    prototype.confidence = this.calculateConfidence(prototype.examples.length);

    // Update timestamp
    prototype.lastUpdated = Date.now();

    // Store prototype
    this.prototypes.set(concept, prototype);

    // Update stats
    this.updateStats();

    // Save
    await this.saveState();

    console.log(`✅ Learned prototype "${concept}" with ${prototype.examples.length} examples (confidence: ${(prototype.confidence * 100).toFixed(0)}%)`);

    return prototype;
  }

  /**
   * 🔍 Predict for new instance using learned prototypes
   * @param {Object} instance - New instance to classify/predict
   * @param {string} type - Type of instance
   * @returns {Object} Prediction with confidence
   */
  predict(instance, type = 'category') {
    if (this.prototypes.size === 0) {
      return {
        prediction: null,
        confidence: 0,
        reason: 'No prototypes learned yet'
      };
    }

    // Extract features from instance
    const extractor = this.featureExtractors[type] || this.featureExtractors.category;
    const instanceFeatures = extractor(instance);

    // Find closest prototype
    let closestPrototype = null;
    let minDistance = Infinity;

    for (const [concept, prototype] of this.prototypes.entries()) {
      if (prototype.type !== type) continue;

      const distance = this.calculateDistance(instanceFeatures, prototype.centroid);

      if (distance < minDistance) {
        minDistance = distance;
        closestPrototype = { concept, ...prototype, distance };
      }
    }

    if (!closestPrototype) {
      return {
        prediction: null,
        confidence: 0,
        reason: 'No matching prototypes found'
      };
    }

    // Calculate prediction confidence
    // Closer distance = higher confidence
    // More examples in prototype = higher confidence
    const distanceConfidence = 1 / (1 + minDistance);  // 0 to 1
    const exampleConfidence = closestPrototype.confidence;
    const overallConfidence = (distanceConfidence + exampleConfidence) / 2;

    const prediction = {
      prediction: closestPrototype.concept,
      confidence: overallConfidence,
      distance: minDistance,
      prototypeExamples: closestPrototype.examples.length,
      reason: `Matches "${closestPrototype.concept}" (${closestPrototype.examples.length} examples, distance: ${minDistance.toFixed(3)})`
    };

    // Record prediction for accuracy tracking
    this.stats.predictions.push({
      instance,
      prediction: prediction.prediction,
      confidence: prediction.confidence,
      timestamp: Date.now(),
      actual: null  // Will be updated with feedback
    });

    console.log(`🔍 Prediction: ${prediction.prediction} (${(prediction.confidence * 100).toFixed(0)}% confidence)`);

    return prediction;
  }

  /**
   * 🎨 Extract features from category data
   */
  extractCategoryFeatures(data) {
    return {
      category: data.category || 'unknown',
      feedback: data.feedback === 'accept' ? 1 : (data.feedback === 'reject' ? -1 : 0),
      budget: data.budget || 0,
      time: data.time || 0,
      day: data.day || 0,
      sentiment: data.sentiment?.score || 0
    };
  }

  /**
   * 🏯 Extract features from activity data
   */
  extractActivityFeatures(data) {
    return {
      type: this.encodeType(data.type),
      price: data.price || 0,
      duration: data.duration || 0,
      rating: data.rating || 0,
      distance: data.distance || 0,
      cultural: data.tags?.includes('cultural') ? 1 : 0,
      modern: data.tags?.includes('modern') ? 1 : 0,
      outdoor: data.tags?.includes('outdoor') ? 1 : 0
    };
  }

  /**
   * ⭐ Extract features from preference data
   */
  extractPreferenceFeatures(data) {
    return {
      preference: data.preference || 0,
      strength: data.strength || 0.5,
      count: data.count || 1,
      recency: data.timestamp ? (Date.now() - data.timestamp) / 86400000 : 0  // Days ago
    };
  }

  /**
   * 💰 Extract features from budget data
   */
  extractBudgetFeatures(data) {
    return {
      amount: data.amount || 0,
      category: this.encodeType(data.category),
      approved: data.approved ? 1 : 0
    };
  }

  /**
   * 🔢 Encode type as number
   */
  encodeType(type) {
    const types = {
      'temple': 1,
      'shrine': 2,
      'museum': 3,
      'food': 4,
      'shopping': 5,
      'nature': 6,
      'modern': 7,
      'cultural': 8
    };

    return types[type] || 0;
  }

  /**
   * 📊 Calculate centroid (average) of feature vectors
   */
  calculateCentroid(features) {
    if (features.length === 0) return {};

    const centroid = {};
    const keys = Object.keys(features[0]);

    for (const key of keys) {
      const values = features.map(f => f[key] || 0);
      centroid[key] = values.reduce((sum, v) => sum + v, 0) / values.length;
    }

    return centroid;
  }

  /**
   * 📏 Calculate Euclidean distance between two feature vectors
   */
  calculateDistance(features1, features2) {
    const keys = Object.keys(features1);
    let sumSquares = 0;

    for (const key of keys) {
      const diff = (features1[key] || 0) - (features2[key] || 0);
      sumSquares += diff * diff;
    }

    return Math.sqrt(sumSquares);
  }

  /**
   * 💯 Calculate confidence based on number of examples
   */
  calculateConfidence(numExamples) {
    if (numExamples >= this.confidenceThresholds.high) {
      return 0.9;  // High confidence
    } else if (numExamples >= this.confidenceThresholds.medium) {
      return 0.7;  // Medium confidence
    } else if (numExamples >= this.confidenceThresholds.low) {
      return 0.5;  // Low confidence
    } else {
      return 0.3;  // Very low confidence
    }
  }

  /**
   * ✅ Record prediction outcome (for accuracy tracking)
   */
  recordOutcome(instance, actual) {
    // Find most recent prediction for this instance
    const prediction = this.stats.predictions
      .reverse()
      .find(p => JSON.stringify(p.instance) === JSON.stringify(instance));

    if (!prediction) return;

    prediction.actual = actual;
    prediction.correct = prediction.prediction === actual;

    // Update accuracy
    const completedPredictions = this.stats.predictions.filter(p => p.actual !== null);
    const correctPredictions = completedPredictions.filter(p => p.correct);

    this.stats.predictionAccuracy =
      completedPredictions.length > 0
        ? correctPredictions.length / completedPredictions.length
        : 0;

    console.log(`📊 Prediction accuracy: ${(this.stats.predictionAccuracy * 100).toFixed(1)}%`);
  }

  /**
   * 🔄 Infer pattern from examples
   * High-level helper that combines learning and prediction
   */
  async inferPattern(examples, type = 'category') {
    if (examples.length < 2) {
      return {
        pattern: null,
        confidence: 0,
        reason: 'Need at least 2 examples to infer a pattern'
      };
    }

    // Analyze examples to find common pattern
    const pattern = this.findCommonPattern(examples, type);

    if (!pattern) {
      return {
        pattern: null,
        confidence: 0,
        reason: 'No clear pattern found in examples'
      };
    }

    // Learn this pattern as a prototype
    const concept = `inferred_${pattern.type}_${Date.now()}`;
    const prototype = await this.learnFromExamples(concept, examples, type);

    return {
      pattern: pattern.description,
      concept,
      confidence: prototype.confidence,
      examples: examples.length,
      prototype
    };
  }

  /**
   * 🔍 Find common pattern in examples
   */
  findCommonPattern(examples, type) {
    // Count occurrences of different values
    const counts = {};

    for (const example of examples) {
      const key = this.getPatternKey(example, type);
      counts[key] = (counts[key] || 0) + 1;
    }

    // Find most common pattern
    let maxCount = 0;
    let mostCommon = null;

    for (const [key, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = key;
      }
    }

    // Need at least 60% of examples to share the pattern
    if (maxCount / examples.length < 0.6) {
      return null;
    }

    return {
      type: mostCommon,
      description: `Pattern: ${mostCommon} (${maxCount}/${examples.length} examples)`,
      strength: maxCount / examples.length
    };
  }

  /**
   * 🔑 Get pattern key from example
   */
  getPatternKey(example, type) {
    switch (type) {
      case 'category':
        return `${example.category}_${example.feedback}`;
      case 'activity':
        return example.type || 'unknown';
      case 'preference':
        return example.preference > 0 ? 'likes' : 'dislikes';
      case 'budget':
        return example.approved ? 'accepts' : 'rejects';
      default:
        return 'unknown';
    }
  }

  /**
   * 📊 Update statistics
   */
  updateStats() {
    this.stats.totalPrototypes = this.prototypes.size;
    this.stats.totalExamples = Array.from(this.prototypes.values())
      .reduce((sum, p) => sum + p.examples.length, 0);
    this.stats.avgExamplesPerPrototype =
      this.stats.totalPrototypes > 0
        ? this.stats.totalExamples / this.stats.totalPrototypes
        : 0;
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      totalPrototypes: this.stats.totalPrototypes,
      totalExamples: this.stats.totalExamples,
      avgExamplesPerPrototype: this.stats.avgExamplesPerPrototype.toFixed(2),
      predictionAccuracy: (this.stats.predictionAccuracy * 100).toFixed(1) + '%',
      totalPredictions: this.stats.predictions.length,
      confidenceThresholds: this.confidenceThresholds
    };
  }

  /**
   * 💾 Save state
   */
  async saveState() {
    if (!window.MLStorage) return;

    await window.MLStorage.set('few_shot_prototypes', {
      prototypes: Array.from(this.prototypes.entries()),
      stats: this.stats,
      timestamp: Date.now()
    });
  }

  /**
   * 🧹 Reset
   */
  async reset() {
    this.prototypes.clear();
    this.stats = {
      totalPrototypes: 0,
      totalExamples: 0,
      avgExamplesPerPrototype: 0,
      predictionAccuracy: 0,
      predictions: []
    };

    await this.saveState();
    console.log('🧹 Few-Shot Learning state reset');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.FewShotLearningEngine = new FewShotLearningEngine();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.FewShotLearningEngine.initialize().catch(e => {
        console.error('Failed to initialize Few-Shot Learning Engine:', e);
      });
    });
  } else {
    window.FewShotLearningEngine.initialize().catch(e => {
      console.error('Failed to initialize Few-Shot Learning Engine:', e);
    });
  }

  console.log('🎯 Few-Shot Learning Engine loaded!');
}
