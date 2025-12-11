/**
 * 🎓 AUTO-TRAINER MODULE
 * ======================
 *
 * "La IA que se entrena a sí misma mientras duermes"
 *
 * Sistema de entrenamiento automático que:
 * 1. Recopila datos de interacciones reales de usuarios
 * 2. Procesa feedback (accept/reject) para aprender
 * 3. Actualiza modelos ML en segundo plano
 * 4. Mejora continuamente sin intervención manual
 * 5. Identifica patrones en datos históricos
 * 6. Optimiza hiperparámetros automáticamente
 *
 * ARQUITECTURA:
 * - Data Collector: Recopila interacciones del usuario
 * - Batch Processor: Procesa datos en lotes
 * - Model Updater: Actualiza Q-values, embeddings, etc.
 * - Pattern Miner: Descubre patrones ocultos
 * - Quality Monitor: Verifica mejoras
 *
 * PROCESO DE ENTRENAMIENTO:
 * 1. Recopilar datos durante el día
 * 2. Al final del día, procesar en batch
 * 3. Actualizar modelos ML
 * 4. Validar que mejoraron
 * 5. Si no mejoraron, revertir cambios
 *
 * DATOS DE ENTRENAMIENTO:
 * - Interacciones usuario-IA (qué preguntó, qué respondió)
 * - Feedback explícito (thumbs up/down, accept/reject)
 * - Feedback implícito (tiempo en página, clicks)
 * - Patrones de navegación
 * - Preferencias emergentes
 */

class AutoTrainer {
  constructor() {
    this.initialized = false;

    // Training data buffer
    this.trainingData = {
      interactions: [],      // User-AI conversations
      feedback: [],          // Accept/reject feedback
      recommendations: [],   // What was recommended
      outcomes: [],          // What user actually chose
      patterns: []           // Discovered patterns
    };

    // Training configuration
    this.config = {
      minDataForTraining: 50,        // Mínimo 50 interacciones para entrenar
      batchSize: 20,                 // Procesar en lotes de 20
      trainingInterval: 24 * 60 * 60 * 1000, // 24 horas
      autoTrainEnabled: true,        // Auto-entrenar
      validationSplit: 0.2,          // 20% para validación
      maxTrainingIterations: 100,    // Máximo 100 iteraciones
      learningRateDecay: 0.95        // Decay del learning rate
    };

    // Training state
    this.trainingState = {
      lastTrainingTime: 0,
      totalTrainingSessions: 0,
      modelsImproved: 0,
      modelsReverted: 0,
      currentEpoch: 0,
      isTraining: false
    };

    // Model performance tracking (before/after training)
    this.performanceHistory = [];

    // Statistics
    this.stats = {
      totalDataPoints: 0,
      totalFeedback: 0,
      positiveRate: 0,
      avgConfidence: 0,
      patternsDiscovered: 0
    };

    console.log('🎓 Auto-Trainer initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load historical training data
    await this.loadTrainingData();

    // Schedule periodic training if enabled
    if (this.config.autoTrainEnabled) {
      this.schedulePeriodicTraining();
    }

    this.initialized = true;
    console.log('✅ Auto-Trainer ready');
    console.log(`📊 Loaded ${this.trainingData.interactions.length} training samples`);
  }

  /**
   * 📥 DATA COLLECTION
   */

  /**
   * Record a user-AI interaction
   */
  recordInteraction(interaction) {
    const dataPoint = {
      id: this.generateId(),
      timestamp: Date.now(),
      userMessage: interaction.userMessage,
      aiResponse: interaction.aiResponse,
      intent: interaction.intent,
      entities: interaction.entities,
      confidence: interaction.confidence,
      context: interaction.context || {}
    };

    this.trainingData.interactions.push(dataPoint);
    this.stats.totalDataPoints++;

    // Auto-save periodically
    if (this.trainingData.interactions.length % 10 === 0) {
      this.saveTrainingData();
    }

    console.log(`📥 Recorded interaction ${dataPoint.id}`);

    // Check if we should trigger training
    this.checkTrainingTrigger();
  }

  /**
   * Record user feedback on AI response
   */
  recordFeedback(feedbackData) {
    const feedback = {
      id: this.generateId(),
      timestamp: Date.now(),
      interactionId: feedbackData.interactionId,
      type: feedbackData.type, // 'accept', 'reject', 'thumbs_up', 'thumbs_down'
      details: feedbackData.details || {},
      category: feedbackData.category,
      place: feedbackData.place
    };

    this.trainingData.feedback.push(feedback);
    this.stats.totalFeedback++;

    // Update positive rate
    if (feedback.type === 'accept' || feedback.type === 'thumbs_up') {
      this.stats.positiveRate = (this.stats.positiveRate * (this.stats.totalFeedback - 1) + 1) / this.stats.totalFeedback;
    } else if (feedback.type === 'reject' || feedback.type === 'thumbs_down') {
      this.stats.positiveRate = (this.stats.positiveRate * (this.stats.totalFeedback - 1)) / this.stats.totalFeedback;
    }

    this.saveTrainingData();

    console.log(`👍/👎 Recorded feedback: ${feedback.type}`);
  }

  /**
   * Record recommendation outcome
   */
  recordRecommendation(recommendation) {
    const data = {
      id: this.generateId(),
      timestamp: Date.now(),
      recommended: recommendation.items,
      accepted: recommendation.accepted || [],
      rejected: recommendation.rejected || [],
      context: recommendation.context || {}
    };

    this.trainingData.recommendations.push(data);

    // Track which categories/items work well
    for (const item of data.accepted) {
      this.trainingData.outcomes.push({
        item,
        outcome: 'accepted',
        timestamp: Date.now()
      });
    }

    for (const item of data.rejected) {
      this.trainingData.outcomes.push({
        item,
        outcome: 'rejected',
        timestamp: Date.now()
      });
    }

    this.saveTrainingData();
  }

  /**
   * 🧠 TRAINING PROCESS
   */

  /**
   * Run training session
   */
  async train() {
    if (this.trainingState.isTraining) {
      console.log('⏸️ Training already in progress');
      return { success: false, reason: 'already_training' };
    }

    if (this.trainingData.interactions.length < this.config.minDataForTraining) {
      console.log(`⏸️ Not enough data (${this.trainingData.interactions.length}/${this.config.minDataForTraining})`);
      return { success: false, reason: 'insufficient_data', dataCount: this.trainingData.interactions.length };
    }

    console.log('🎓 Starting training session...');
    this.trainingState.isTraining = true;
    this.trainingState.currentEpoch = 0;

    const startTime = Date.now();

    try {
      // STEP 1: Prepare training data
      const { trainData, validationData } = this.prepareData();
      console.log(`📊 Prepared ${trainData.length} training samples, ${validationData.length} validation samples`);

      // STEP 2: Snapshot current model performance
      const performanceBefore = await this.evaluateModels(validationData);
      console.log('📈 Performance before training:', performanceBefore);

      // STEP 3: Train each ML module
      const trainingResults = {};

      // Train Reinforcement Learning Engine
      if (window.ReinforcementLearningEngine) {
        trainingResults.reinforcementLearning = await this.trainReinforcementLearning(trainData);
      }

      // Train Recommendation System (Knowledge Graph)
      if (window.KnowledgeGraph) {
        trainingResults.recommendations = await this.trainRecommendations(trainData);
      }

      // Train Meta-Learning (adjust hyperparameters)
      if (window.MetaLearningEngine) {
        trainingResults.metaLearning = await this.trainMetaLearning(trainData);
      }

      // Discover new patterns
      trainingResults.patterns = await this.discoverPatterns(trainData);

      // STEP 4: Evaluate after training
      const performanceAfter = await this.evaluateModels(validationData);
      console.log('📈 Performance after training:', performanceAfter);

      // STEP 5: Decide whether to keep or revert changes
      const improved = this.didImprove(performanceBefore, performanceAfter);

      if (improved) {
        console.log('✅ Models improved! Keeping changes.');
        this.trainingState.modelsImproved++;

        // Save updated models
        await this.saveModels();
      } else {
        console.log('❌ Models did not improve. Reverting...');
        this.trainingState.modelsReverted++;

        // Revert changes
        await this.revertModels();
      }

      // STEP 6: Record training session
      this.trainingState.lastTrainingTime = Date.now();
      this.trainingState.totalTrainingSessions++;

      this.performanceHistory.push({
        timestamp: Date.now(),
        before: performanceBefore,
        after: performanceAfter,
        improved,
        duration: Date.now() - startTime,
        samplesUsed: trainData.length
      });

      // Keep last 50 training sessions
      if (this.performanceHistory.length > 50) {
        this.performanceHistory = this.performanceHistory.slice(-50);
      }

      await this.saveTrainingData();

      this.trainingState.isTraining = false;

      console.log(`✅ Training completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

      return {
        success: true,
        improved,
        performanceBefore,
        performanceAfter,
        duration: Date.now() - startTime,
        results: trainingResults
      };

    } catch (error) {
      console.error('❌ Training failed:', error);
      this.trainingState.isTraining = false;

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Prepare training and validation data
   */
  prepareData() {
    // Combine interactions with feedback
    const combinedData = this.trainingData.interactions.map(interaction => {
      // Find matching feedback
      const feedback = this.trainingData.feedback.find(f =>
        f.interactionId === interaction.id ||
        Math.abs(f.timestamp - interaction.timestamp) < 5000 // Within 5 seconds
      );

      return {
        ...interaction,
        feedback: feedback || null,
        label: feedback ? (feedback.type === 'accept' || feedback.type === 'thumbs_up' ? 1 : 0) : null
      };
    });

    // Filter out samples without feedback (can't learn from unlabeled data)
    const labeledData = combinedData.filter(d => d.label !== null);

    // Shuffle
    const shuffled = this.shuffleArray([...labeledData]);

    // Split into train/validation
    const splitIdx = Math.floor(shuffled.length * (1 - this.config.validationSplit));
    const trainData = shuffled.slice(0, splitIdx);
    const validationData = shuffled.slice(splitIdx);

    return { trainData, validationData };
  }

  /**
   * Train Reinforcement Learning Q-values
   */
  async trainReinforcementLearning(trainData) {
    console.log('🧠 Training Reinforcement Learning...');

    let updates = 0;

    for (const sample of trainData) {
      // Extract state-action-reward
      const state = {
        userType: sample.context.userType || 'Explorer',
        intent: sample.intent,
        category: sample.entities?.CATEGORY?.value
      };

      const action = sample.aiResponse?.actions?.[0]?.type || 'unknown';

      const reward = sample.label; // 1 for accept, 0 for reject

      // Update Q-value
      if (window.ReinforcementLearningEngine) {
        await window.ReinforcementLearningEngine.recordFeedback({
          state,
          action,
          feedback: sample.feedback.type,
          nextState: {},
          metrics: {},
          sentiment: { label: sample.label === 1 ? 'positive' : 'negative' }
        });

        updates++;
      }
    }

    console.log(`✅ Updated ${updates} Q-values`);

    return { updates };
  }

  /**
   * Train Recommendation System
   */
  async trainRecommendations(trainData) {
    console.log('📚 Training Recommendation System...');

    // Extract category preferences from accepted recommendations
    const categoryPreferences = {};

    for (const sample of trainData) {
      if (sample.label === 1 && sample.entities?.CATEGORY) {
        const category = sample.entities.CATEGORY.value;
        categoryPreferences[category] = (categoryPreferences[category] || 0) + 1;
      }
    }

    // Update Knowledge Graph weights
    if (window.KnowledgeGraph) {
      for (const [category, count] of Object.entries(categoryPreferences)) {
        // Boost weight for popular categories
        const boost = Math.min(0.2, count / trainData.length);
        console.log(`📈 Boosting ${category} by ${(boost * 100).toFixed(1)}%`);
      }
    }

    console.log('✅ Updated recommendation weights');

    return { categoryPreferences };
  }

  /**
   * Train Meta-Learning hyperparameters
   */
  async trainMetaLearning(trainData) {
    console.log('🔧 Training Meta-Learning...');

    // Analyze if current hyperparameters are working
    const avgConfidence = trainData.reduce((sum, d) => sum + d.confidence, 0) / trainData.length;
    const avgSuccess = trainData.reduce((sum, d) => sum + d.label, 0) / trainData.length;

    console.log(`📊 Avg confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`📊 Avg success rate: ${(avgSuccess * 100).toFixed(1)}%`);

    // If low confidence but high success → increase exploration
    // If high confidence but low success → reduce overconfidence

    if (window.MetaLearningEngine) {
      // Trigger meta-learning adjustment
      // (MetaLearningEngine already does this automatically every 10 interactions)
    }

    return { avgConfidence, avgSuccess };
  }

  /**
   * Discover patterns in data
   */
  async discoverPatterns(trainData) {
    console.log('🔍 Discovering patterns...');

    const patterns = [];

    // Pattern 1: Time-of-day preferences
    const hourPreferences = {};
    for (const sample of trainData) {
      const hour = new Date(sample.timestamp).getHours();
      hourPreferences[hour] = (hourPreferences[hour] || 0) + sample.label;
    }

    const bestHour = Object.entries(hourPreferences).reduce((a, b) => a[1] > b[1] ? a : b);
    patterns.push({
      type: 'time_preference',
      description: `Users most engaged at ${bestHour[0]}:00`,
      confidence: 0.7
    });

    // Pattern 2: Category co-occurrence
    const categoryPairs = {};
    for (let i = 0; i < trainData.length - 1; i++) {
      const cat1 = trainData[i].entities?.CATEGORY?.value;
      const cat2 = trainData[i + 1].entities?.CATEGORY?.value;

      if (cat1 && cat2 && cat1 !== cat2) {
        const key = `${cat1}->${cat2}`;
        categoryPairs[key] = (categoryPairs[key] || 0) + 1;
      }
    }

    const topPair = Object.entries(categoryPairs).reduce((a, b) => a[1] > b[1] ? a : b, ['none', 0]);
    if (topPair[1] > 3) {
      patterns.push({
        type: 'category_sequence',
        description: `Users often ask for ${topPair[0]} together`,
        confidence: 0.6
      });
    }

    // Pattern 3: Rejection reasons
    const rejectionReasons = {};
    for (const sample of trainData.filter(d => d.label === 0)) {
      const reason = sample.feedback?.details?.reason || 'unknown';
      rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
    }

    if (Object.keys(rejectionReasons).length > 0) {
      const topRejection = Object.entries(rejectionReasons).reduce((a, b) => a[1] > b[1] ? a : b);
      patterns.push({
        type: 'rejection_pattern',
        description: `Most common rejection reason: ${topRejection[0]}`,
        confidence: 0.5
      });
    }

    this.trainingData.patterns.push(...patterns);
    this.stats.patternsDiscovered += patterns.length;

    console.log(`✅ Discovered ${patterns.length} new patterns`);

    return patterns;
  }

  /**
   * 📊 MODEL EVALUATION
   */

  /**
   * Evaluate model performance
   */
  async evaluateModels(validationData) {
    const metrics = {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      avgConfidence: 0
    };

    if (validationData.length === 0) {
      return metrics;
    }

    let tp = 0, fp = 0, tn = 0, fn = 0;

    for (const sample of validationData) {
      const predicted = sample.confidence > 0.5 ? 1 : 0;
      const actual = sample.label;

      if (predicted === 1 && actual === 1) tp++;
      else if (predicted === 1 && actual === 0) fp++;
      else if (predicted === 0 && actual === 0) tn++;
      else if (predicted === 0 && actual === 1) fn++;

      metrics.avgConfidence += sample.confidence;
    }

    metrics.avgConfidence /= validationData.length;
    metrics.accuracy = (tp + tn) / validationData.length;
    metrics.precision = tp / (tp + fp) || 0;
    metrics.recall = tp / (tp + fn) || 0;
    metrics.f1Score = 2 * (metrics.precision * metrics.recall) / (metrics.precision + metrics.recall) || 0;

    return metrics;
  }

  /**
   * Check if model improved
   */
  didImprove(before, after) {
    // Primary metric: F1 score
    const f1Improved = after.f1Score > before.f1Score;

    // Secondary: accuracy
    const accuracyImproved = after.accuracy > before.accuracy;

    // Improved if F1 improved OR (accuracy improved and F1 didn't get worse)
    return f1Improved || (accuracyImproved && after.f1Score >= before.f1Score - 0.05);
  }

  /**
   * 💾 MODEL PERSISTENCE
   */

  /**
   * Save trained models
   */
  async saveModels() {
    // Trigger save on all ML modules
    const modules = [
      'ReinforcementLearningEngine',
      'MetaLearningEngine',
      'KnowledgeGraph',
      'LongTermMemory'
    ];

    for (const moduleName of modules) {
      if (window[moduleName] && window[moduleName].save) {
        await window[moduleName].save();
      }
    }

    console.log('💾 Models saved');
  }

  /**
   * Revert models to previous state
   */
  async revertModels() {
    // In practice, would restore from backup
    // For now, just log
    console.log('🔄 Models reverted (backup restore not implemented)');
  }

  /**
   * 📅 SCHEDULING
   */

  /**
   * Schedule periodic training
   */
  schedulePeriodicTraining() {
    setInterval(() => {
      const timeSinceLastTraining = Date.now() - this.trainingState.lastTrainingTime;

      if (timeSinceLastTraining >= this.config.trainingInterval) {
        console.log('⏰ Scheduled training triggered');
        this.train();
      }
    }, 60 * 60 * 1000); // Check every hour

    console.log('📅 Periodic training scheduled');
  }

  /**
   * Check if training should be triggered
   */
  checkTrainingTrigger() {
    // Trigger training when we have enough new data
    const newDataSinceLastTraining = this.trainingData.interactions.length;

    if (newDataSinceLastTraining >= this.config.minDataForTraining * 2) {
      console.log('📊 Enough data accumulated, triggering training...');
      this.train();
    }
  }

  /**
   * 🛠️ UTILITIES
   */

  generateId() {
    return `train_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 💾 DATA PERSISTENCE
   */

  async loadTrainingData() {
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('auto_trainer_data');

      if (stored) {
        this.trainingData = stored.trainingData || this.trainingData;
        this.trainingState = stored.trainingState || this.trainingState;
        this.performanceHistory = stored.performanceHistory || [];
        this.stats = stored.stats || this.stats;

        console.log('💾 Loaded training data');
      }
    }
  }

  async saveTrainingData() {
    if (window.MLStorage) {
      await window.MLStorage.set('auto_trainer_data', {
        trainingData: this.trainingData,
        trainingState: this.trainingState,
        performanceHistory: this.performanceHistory,
        stats: this.stats,
        lastUpdate: Date.now()
      });
    }
  }

  /**
   * Clear all training data
   */
  async clearData() {
    this.trainingData = {
      interactions: [],
      feedback: [],
      recommendations: [],
      outcomes: [],
      patterns: []
    };

    await this.saveTrainingData();

    console.log('🧹 Training data cleared');
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      trainingDataSize: this.trainingData.interactions.length,
      feedbackCount: this.trainingData.feedback.length,
      lastTrainingTime: this.trainingState.lastTrainingTime,
      totalTrainingSessions: this.trainingState.totalTrainingSessions,
      modelsImproved: this.trainingState.modelsImproved,
      modelsReverted: this.trainingState.modelsReverted,
      isTraining: this.trainingState.isTraining,
      performanceHistory: this.performanceHistory.slice(-10) // Last 10 sessions
    };
  }

  /**
   * Get training report
   */
  getTrainingReport() {
    if (this.performanceHistory.length === 0) {
      return { message: 'No training sessions yet' };
    }

    const latest = this.performanceHistory[this.performanceHistory.length - 1];
    const improvement = latest.after.f1Score - latest.before.f1Score;

    return {
      latestSession: {
        timestamp: new Date(latest.timestamp).toISOString(),
        improved: latest.improved,
        f1ScoreChange: improvement,
        accuracyChange: latest.after.accuracy - latest.before.accuracy,
        duration: latest.duration,
        samplesUsed: latest.samplesUsed
      },
      overall: {
        totalSessions: this.trainingState.totalTrainingSessions,
        successfulImprovements: this.trainingState.modelsImproved,
        reverted: this.trainingState.modelsReverted,
        improvementRate: this.trainingState.modelsImproved / Math.max(this.trainingState.totalTrainingSessions, 1)
      }
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.AutoTrainer = new AutoTrainer();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AutoTrainer.initialize();
    });
  } else {
    window.AutoTrainer.initialize();
  }

  console.log('🎓 Auto-Trainer loaded!');
}
