/**
 * 🧠 FASE 6: META-LEARNING ENGINE
 * ==================================
 *
 * "Aprender a Aprender Más Rápido"
 *
 * Este módulo identifica QUÉ tipo de aprendiz es cada usuario y adapta
 * la estrategia de aprendizaje para maximizar la velocidad de aprendizaje.
 *
 * Implementa:
 * - User Type Classification (quick-learner, needs-guidance, explorer)
 * - Adaptive Learning Rate
 * - Strategy Selection (few-shot, supervised, reinforcement)
 * - Performance Tracking per User Type
 *
 * Como un maestro que reconoce si un estudiante aprende mejor:
 * - Viendo ejemplos (few-shot)
 * - Con instrucciones paso a paso (supervised)
 * - Experimentando por su cuenta (reinforcement)
 */

class MetaLearningEngine {
  constructor() {
    this.initialized = false;

    // User type profiles
    this.userTypes = {
      'quick-learner': {
        description: 'Aprende rápido con pocos ejemplos',
        strategy: 'few-shot',
        epsilon: 0.1,  // Baja exploración (ya sabe lo que quiere)
        learningRate: 0.3,  // Alta (aprende rápido)
        minExamples: 3,
        confidenceThreshold: 0.8
      },
      'needs-guidance': {
        description: 'Necesita más instrucciones y ejemplos',
        strategy: 'supervised',
        epsilon: 0.3,  // Media exploración
        learningRate: 0.15,  // Media
        minExamples: 8,
        confidenceThreshold: 0.6
      },
      'explorer': {
        description: 'Le gusta experimentar y descubrir',
        strategy: 'reinforcement',
        epsilon: 0.5,  // Alta exploración (prueba muchas cosas)
        learningRate: 0.1,  // Más lenta (aprende de la experiencia)
        minExamples: 15,
        confidenceThreshold: 0.5
      },
      'undecided': {
        description: 'Cambia de opinión frecuentemente',
        strategy: 'adaptive',
        epsilon: 0.4,
        learningRate: 0.2,
        minExamples: 10,
        confidenceThreshold: 0.55
      }
    };

    // User profiles (userId -> profile)
    this.userProfiles = new Map();

    // Global statistics
    this.stats = {
      totalUsers: 0,
      typeDistribution: {
        'quick-learner': 0,
        'needs-guidance': 0,
        'explorer': 0,
        'undecided': 0
      },
      avgLearningSpeed: {},
      bestStrategy: null
    };

    console.log('🧠 Meta-Learning Engine initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load user profiles from storage
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('meta_learning_profiles');
      if (stored) {
        // Convert array back to Map
        this.userProfiles = new Map(stored.profiles || []);
        this.stats = stored.stats || this.stats;
      }
    }

    this.initialized = true;
    console.log('✅ Meta-Learning Engine ready');
    console.log(`📊 Loaded ${this.userProfiles.size} user profiles`);
  }

  /**
   * 🎯 Classify user type based on interaction history
   * @param {string} userId - User ID
   * @param {Array} interactions - User's interaction history
   * @returns {Object} User type profile
   */
  classifyUserType(userId, interactions) {
    if (interactions.length < 5) {
      // Not enough data, default to needs-guidance
      return this.userTypes['needs-guidance'];
    }

    // Extract features from interactions
    const features = this.extractUserFeatures(interactions);

    // Score each user type
    const scores = {
      'quick-learner': this.scoreQuickLearner(features),
      'needs-guidance': this.scoreNeedsGuidance(features),
      'explorer': this.scoreExplorer(features),
      'undecided': this.scoreUndecided(features)
    };

    // Get best matching type
    const bestType = Object.entries(scores).reduce((best, [type, score]) => {
      return score > best.score ? { type, score } : best;
    }, { type: 'needs-guidance', score: 0 });

    console.log(`👤 User ${userId} classified as: ${bestType.type} (confidence: ${bestType.score.toFixed(2)})`);

    return {
      ...this.userTypes[bestType.type],
      classification: bestType.type,
      confidence: bestType.score,
      features
    };
  }

  /**
   * 📊 Extract features from user interaction history
   */
  extractUserFeatures(interactions) {
    const total = interactions.length;

    // Time between interactions (learning speed indicator)
    const avgTimeBetween = this.calculateAvgTimeBetween(interactions);

    // Decision consistency
    const consistency = this.calculateConsistency(interactions);

    // Acceptance rate
    const acceptanceRate = interactions.filter(i => i.feedback === 'accept').length / total;

    // Exploration rate (how varied are their choices)
    const explorationRate = this.calculateExplorationRate(interactions);

    // Edit rate (how often they modify suggestions)
    const editRate = interactions.filter(i => i.feedback === 'edit').length / total;

    // Question rate (how often they ask for help)
    const questionRate = interactions.filter(i => i.type === 'question').length / total;

    return {
      total,
      avgTimeBetween,
      consistency,
      acceptanceRate,
      explorationRate,
      editRate,
      questionRate
    };
  }

  /**
   * ⚡ Score: Quick Learner
   * Characteristics: Fast decisions, high consistency, high acceptance
   */
  scoreQuickLearner(features) {
    let score = 0;

    // Fast decisions (< 30 seconds between actions)
    if (features.avgTimeBetween < 30000) score += 0.3;

    // High consistency (> 0.7)
    if (features.consistency > 0.7) score += 0.3;

    // High acceptance rate (> 0.7)
    if (features.acceptanceRate > 0.7) score += 0.2;

    // Low exploration (< 0.3)
    if (features.explorationRate < 0.3) score += 0.1;

    // Few questions (< 0.2)
    if (features.questionRate < 0.2) score += 0.1;

    return score;
  }

  /**
   * 🆘 Score: Needs Guidance
   * Characteristics: Slow decisions, asks many questions, low confidence
   */
  scoreNeedsGuidance(features) {
    let score = 0;

    // Slow decisions (> 60 seconds)
    if (features.avgTimeBetween > 60000) score += 0.3;

    // Many questions (> 0.3)
    if (features.questionRate > 0.3) score += 0.3;

    // High edit rate (> 0.4)
    if (features.editRate > 0.4) score += 0.2;

    // Low acceptance rate (< 0.5)
    if (features.acceptanceRate < 0.5) score += 0.2;

    return score;
  }

  /**
   * 🔍 Score: Explorer
   * Characteristics: High exploration, varied choices, willing to try new things
   */
  scoreExplorer(features) {
    let score = 0;

    // High exploration (> 0.5)
    if (features.explorationRate > 0.5) score += 0.4;

    // Medium acceptance (0.5-0.7) - tries things
    if (features.acceptanceRate >= 0.5 && features.acceptanceRate <= 0.7) score += 0.2;

    // Medium consistency (0.4-0.6) - varies choices
    if (features.consistency >= 0.4 && features.consistency <= 0.6) score += 0.2;

    // Low questions (< 0.2) - self-sufficient
    if (features.questionRate < 0.2) score += 0.2;

    return score;
  }

  /**
   * 🤔 Score: Undecided
   * Characteristics: Inconsistent, changes mind frequently
   */
  scoreUndecided(features) {
    let score = 0;

    // Low consistency (< 0.4)
    if (features.consistency < 0.4) score += 0.4;

    // High edit rate (> 0.5)
    if (features.editRate > 0.5) score += 0.3;

    // Medium exploration
    if (features.explorationRate >= 0.3 && features.explorationRate <= 0.5) score += 0.2;

    // Medium questions
    if (features.questionRate >= 0.2 && features.questionRate <= 0.4) score += 0.1;

    return score;
  }

  /**
   * ⏱️ Calculate average time between interactions
   */
  calculateAvgTimeBetween(interactions) {
    if (interactions.length < 2) return 0;

    let totalTime = 0;
    for (let i = 1; i < interactions.length; i++) {
      const timeDiff = interactions[i].timestamp - interactions[i - 1].timestamp;
      totalTime += timeDiff;
    }

    return totalTime / (interactions.length - 1);
  }

  /**
   * 📏 Calculate decision consistency
   * How often user makes similar decisions in similar contexts
   */
  calculateConsistency(interactions) {
    if (interactions.length < 3) return 0.5;

    // Group interactions by similar contexts
    const contexts = {};
    for (const interaction of interactions) {
      const contextKey = this.getContextKey(interaction);
      if (!contexts[contextKey]) contexts[contextKey] = [];
      contexts[contextKey].push(interaction.feedback);
    }

    // Calculate consistency within each context
    let totalConsistency = 0;
    let contextCount = 0;

    for (const feedbacks of Object.values(contexts)) {
      if (feedbacks.length < 2) continue;

      // Most common feedback in this context
      const mode = this.getMostCommon(feedbacks);
      const consistency = feedbacks.filter(f => f === mode).length / feedbacks.length;

      totalConsistency += consistency;
      contextCount++;
    }

    return contextCount > 0 ? totalConsistency / contextCount : 0.5;
  }

  /**
   * 🗺️ Calculate exploration rate
   * How varied are the user's choices
   */
  calculateExplorationRate(interactions) {
    if (interactions.length < 3) return 0.5;

    // Count unique categories/actions
    const categories = new Set();
    const actions = new Set();

    for (const interaction of interactions) {
      if (interaction.category) categories.add(interaction.category);
      if (interaction.action) actions.add(interaction.action);
    }

    // Normalize by total interactions
    const categoryDiversity = categories.size / Math.min(interactions.length, 10);
    const actionDiversity = actions.size / Math.min(interactions.length, 8);

    return (categoryDiversity + actionDiversity) / 2;
  }

  /**
   * 🔑 Get context key for grouping similar interactions
   */
  getContextKey(interaction) {
    return `${interaction.intent || 'unknown'}_${interaction.category || 'general'}`;
  }

  /**
   * 📊 Get most common element in array
   */
  getMostCommon(arr) {
    const counts = {};
    let maxCount = 0;
    let mode = arr[0];

    for (const item of arr) {
      counts[item] = (counts[item] || 0) + 1;
      if (counts[item] > maxCount) {
        maxCount = counts[item];
        mode = item;
      }
    }

    return mode;
  }

  /**
   * 🎓 Get or create user profile
   */
  async getUserProfile(userId, interactions = []) {
    // Check cache
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId);
    }

    // Classify new user
    const classification = this.classifyUserType(userId, interactions);

    const profile = {
      userId,
      type: classification.classification,
      strategy: classification.strategy,
      confidence: classification.confidence,
      features: classification.features,
      learningRate: classification.learningRate,
      epsilon: classification.epsilon,
      minExamples: classification.minExamples,
      interactionCount: interactions.length,
      lastUpdated: Date.now(),
      createdAt: Date.now()
    };

    // Cache profile
    this.userProfiles.set(userId, profile);

    // Update stats
    this.stats.totalUsers++;
    this.stats.typeDistribution[profile.type]++;

    // Save
    await this.saveState();

    return profile;
  }

  /**
   * 🔄 Update user profile based on new interactions
   */
  async updateUserProfile(userId, newInteractions) {
    const profile = await this.getUserProfile(userId);

    // Get all interactions
    const allInteractions = [...profile.interactions || [], ...newInteractions];

    // Re-classify
    const newClassification = this.classifyUserType(userId, allInteractions);

    // Check if type changed
    if (newClassification.classification !== profile.type) {
      console.log(`🔄 User ${userId} type changed: ${profile.type} → ${newClassification.classification}`);

      // Update stats
      this.stats.typeDistribution[profile.type]--;
      this.stats.typeDistribution[newClassification.classification]++;
    }

    // Update profile
    profile.type = newClassification.classification;
    profile.strategy = newClassification.strategy;
    profile.confidence = newClassification.confidence;
    profile.features = newClassification.features;
    profile.learningRate = newClassification.learningRate;
    profile.epsilon = newClassification.epsilon;
    profile.interactionCount = allInteractions.length;
    profile.lastUpdated = Date.now();

    // Save
    await this.saveState();

    return profile;
  }

  /**
   * 🎯 Get recommended strategy for user
   */
  getRecommendedStrategy(userId) {
    const profile = this.userProfiles.get(userId);

    if (!profile) {
      return {
        strategy: 'supervised',  // Default for new users
        epsilon: 0.3,
        learningRate: 0.15,
        reason: 'New user, using default strategy'
      };
    }

    return {
      strategy: profile.strategy,
      epsilon: profile.epsilon,
      learningRate: profile.learningRate,
      confidence: profile.confidence,
      reason: `User type: ${profile.type}`
    };
  }

  /**
   * 📊 Get meta-learning statistics
   */
  getStats() {
    const totalUsers = this.stats.totalUsers || 1;

    return {
      totalUsers: this.stats.totalUsers,
      typeDistribution: Object.entries(this.stats.typeDistribution).map(([type, count]) => ({
        type,
        count,
        percentage: ((count / totalUsers) * 100).toFixed(1) + '%'
      })),
      activeProfiles: this.userProfiles.size,
      avgLearningSpeed: this.stats.avgLearningSpeed,
      bestStrategy: this.stats.bestStrategy
    };
  }

  /**
   * 💾 Save state to storage
   */
  async saveState() {
    if (!window.MLStorage) return;

    await window.MLStorage.set('meta_learning_profiles', {
      profiles: Array.from(this.userProfiles.entries()),
      stats: this.stats,
      timestamp: Date.now()
    });
  }

  /**
   * 🧹 Reset (for testing)
   */
  async reset() {
    this.userProfiles.clear();
    this.stats = {
      totalUsers: 0,
      typeDistribution: {
        'quick-learner': 0,
        'needs-guidance': 0,
        'explorer': 0,
        'undecided': 0
      },
      avgLearningSpeed: {},
      bestStrategy: null
    };

    await this.saveState();
    console.log('🧹 Meta-Learning state reset');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.MetaLearningEngine = new MetaLearningEngine();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.MetaLearningEngine.initialize().catch(e => {
        console.error('Failed to initialize Meta-Learning Engine:', e);
      });
    });
  } else {
    window.MetaLearningEngine.initialize().catch(e => {
      console.error('Failed to initialize Meta-Learning Engine:', e);
    });
  }

  console.log('🧠 Meta-Learning Engine loaded!');
}
