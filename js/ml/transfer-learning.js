/**
 * 🔄 FASE 6: TRANSFER LEARNING ENGINE
 * =====================================
 *
 * "Aprende de Usuario A, Aplica a Usuario B"
 *
 * Este módulo extrae conocimiento generalizado de las interacciones de
 * múltiples usuarios y lo aplica a nuevos usuarios o situaciones.
 *
 * Implementa:
 * - Pattern Extraction: Identificar patrones comunes entre usuarios
 * - Knowledge Abstraction: Generalizar conocimiento específico
 * - Knowledge Transfer: Aplicar conocimiento general a contextos nuevos
 * - Domain Adaptation: Adaptar conocimiento a diferentes situaciones
 *
 * Como un maestro que:
 * - Ve que 100 usuarios rechazan shopping → Aprende patrón general
 * - Usuario nuevo llega → Ya sabe preguntar sobre shopping
 * - Aprende 10x más rápido porque no empieza de cero
 */

class TransferLearningEngine {
  constructor() {
    this.initialized = false;

    // Generalized knowledge base
    this.knowledgeBase = {
      // Category preferences (what users generally like/dislike)
      categoryPreferences: {},

      // Combination patterns (what goes well together)
      combinationPatterns: {},

      // Rejection patterns (what users commonly reject)
      rejectionPatterns: {},

      // Success patterns (what commonly works)
      successPatterns: {},

      // Temporal patterns (time-based preferences)
      temporalPatterns: {},

      // Budget patterns (spending behavior)
      budgetPatterns: {}
    };

    // Source → Target transfer history
    this.transferHistory = [];

    // Transfer success metrics
    this.metrics = {
      totalTransfers: 0,
      successfulTransfers: 0,
      avgConfidenceGain: 0,
      bestSourceDomain: null,
      bestTargetDomain: null
    };

    console.log('🔄 Transfer Learning Engine initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load knowledge base from storage
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('transfer_learning_knowledge');
      if (stored) {
        this.knowledgeBase = stored.knowledgeBase || this.knowledgeBase;
        this.transferHistory = stored.transferHistory || [];
        this.metrics = stored.metrics || this.metrics;
      }
    }

    this.initialized = true;
    console.log('✅ Transfer Learning Engine ready');
    console.log(`📚 Knowledge base size: ${this.getKnowledgeBaseSize()} patterns`);
  }

  /**
   * 📖 Learn patterns from a user's interaction history
   * @param {string} userId - Source user ID
   * @param {Array} interactions - User's interactions
   */
  async learnFromUser(userId, interactions) {
    if (interactions.length < 5) {
      console.log(`⚠️ Not enough interactions from user ${userId} to extract patterns`);
      return null;
    }

    console.log(`📖 Learning patterns from user ${userId} (${interactions.length} interactions)`);

    // Extract different types of patterns
    const patterns = {
      userId,
      categoryPreferences: this.extractCategoryPreferences(interactions),
      combinationPatterns: this.extractCombinationPatterns(interactions),
      rejectionPatterns: this.extractRejectionPatterns(interactions),
      temporalPatterns: this.extractTemporalPatterns(interactions),
      budgetPatterns: this.extractBudgetPatterns(interactions),
      timestamp: Date.now()
    };

    // Abstract patterns to general knowledge
    await this.abstractToKnowledge(patterns);

    return patterns;
  }

  /**
   * 🎯 Extract category preferences
   * What categories this user likes/dislikes
   */
  extractCategoryPreferences(interactions) {
    const preferences = {};

    for (const interaction of interactions) {
      const category = interaction.category || 'general';

      if (!preferences[category]) {
        preferences[category] = {
          accepts: 0,
          rejects: 0,
          total: 0,
          score: 0
        };
      }

      preferences[category].total++;

      if (interaction.feedback === 'accept') {
        preferences[category].accepts++;
      } else if (interaction.feedback === 'reject') {
        preferences[category].rejects++;
      }

      // Calculate preference score (-1 to 1)
      preferences[category].score =
        (preferences[category].accepts - preferences[category].rejects) /
        preferences[category].total;
    }

    return preferences;
  }

  /**
   * 🔗 Extract combination patterns
   * What categories/activities work well together
   */
  extractCombinationPatterns(interactions) {
    const combinations = {};

    // Look at consecutive accepted activities
    const accepted = interactions.filter(i => i.feedback === 'accept');

    for (let i = 0; i < accepted.length - 1; i++) {
      const cat1 = accepted[i].category || 'general';
      const cat2 = accepted[i + 1].category || 'general';

      const key = [cat1, cat2].sort().join('_');

      if (!combinations[key]) {
        combinations[key] = {
          categories: [cat1, cat2],
          count: 0,
          strength: 0
        };
      }

      combinations[key].count++;
    }

    // Calculate combination strength
    for (const combo of Object.values(combinations)) {
      combo.strength = combo.count / Math.max(accepted.length - 1, 1);
    }

    return combinations;
  }

  /**
   * ❌ Extract rejection patterns
   * What do users commonly reject
   */
  extractRejectionPatterns(interactions) {
    const rejections = {};

    const rejected = interactions.filter(i => i.feedback === 'reject');

    for (const interaction of rejected) {
      const category = interaction.category || 'general';
      const reason = interaction.reason || 'unknown';

      const key = `${category}_${reason}`;

      if (!rejections[key]) {
        rejections[key] = {
          category,
          reason,
          count: 0,
          contexts: []
        };
      }

      rejections[key].count++;
      rejections[key].contexts.push({
        day: interaction.day,
        budget: interaction.budget,
        time: interaction.time
      });
    }

    return rejections;
  }

  /**
   * ⏰ Extract temporal patterns
   * Time-based preferences (morning/afternoon/evening)
   */
  extractTemporalPatterns(interactions) {
    const temporal = {
      morning: { accepts: 0, total: 0, categories: {} },
      afternoon: { accepts: 0, total: 0, categories: {} },
      evening: { accepts: 0, total: 0, categories: {} }
    };

    for (const interaction of interactions) {
      const time = this.getTimeOfDay(interaction.time || interaction.timestamp);
      const category = interaction.category || 'general';

      if (!temporal[time]) continue;

      temporal[time].total++;
      if (interaction.feedback === 'accept') {
        temporal[time].accepts++;
        temporal[time].categories[category] = (temporal[time].categories[category] || 0) + 1;
      }
    }

    // Calculate acceptance rates
    for (const period of Object.keys(temporal)) {
      temporal[period].acceptanceRate =
        temporal[period].total > 0
          ? temporal[period].accepts / temporal[period].total
          : 0;
    }

    return temporal;
  }

  /**
   * 💰 Extract budget patterns
   * Spending behavior and preferences
   */
  extractBudgetPatterns(interactions) {
    const budgets = interactions
      .filter(i => i.budget !== undefined)
      .map(i => i.budget);

    if (budgets.length === 0) return null;

    return {
      avg: budgets.reduce((sum, b) => sum + b, 0) / budgets.length,
      min: Math.min(...budgets),
      max: Math.max(...budgets),
      median: this.calculateMedian(budgets),
      range: Math.max(...budgets) - Math.min(...budgets)
    };
  }

  /**
   * 🧬 Abstract user-specific patterns to general knowledge
   */
  async abstractToKnowledge(patterns) {
    // Merge category preferences into knowledge base
    for (const [category, pref] of Object.entries(patterns.categoryPreferences)) {
      if (!this.knowledgeBase.categoryPreferences[category]) {
        this.knowledgeBase.categoryPreferences[category] = {
          totalUsers: 0,
          avgScore: 0,
          scores: []
        };
      }

      const kb = this.knowledgeBase.categoryPreferences[category];
      kb.totalUsers++;
      kb.scores.push(pref.score);
      kb.avgScore = kb.scores.reduce((sum, s) => sum + s, 0) / kb.scores.length;
    }

    // Merge combination patterns
    for (const [key, combo] of Object.entries(patterns.combinationPatterns)) {
      if (!this.knowledgeBase.combinationPatterns[key]) {
        this.knowledgeBase.combinationPatterns[key] = {
          categories: combo.categories,
          observations: 0,
          avgStrength: 0,
          strengths: []
        };
      }

      const kb = this.knowledgeBase.combinationPatterns[key];
      kb.observations++;
      kb.strengths.push(combo.strength);
      kb.avgStrength = kb.strengths.reduce((sum, s) => sum + s, 0) / kb.strengths.length;
    }

    // Merge rejection patterns
    for (const [key, rej] of Object.entries(patterns.rejectionPatterns)) {
      if (!this.knowledgeBase.rejectionPatterns[key]) {
        this.knowledgeBase.rejectionPatterns[key] = {
          category: rej.category,
          reason: rej.reason,
          totalOccurrences: 0,
          users: []
        };
      }

      const kb = this.knowledgeBase.rejectionPatterns[key];
      kb.totalOccurrences += rej.count;
      kb.users.push(patterns.userId);
    }

    // Save updated knowledge base
    await this.saveState();

    console.log(`🧬 Abstracted patterns from user ${patterns.userId} to knowledge base`);
  }

  /**
   * 🎁 Transfer knowledge to new user
   * @param {string} targetUserId - Target user ID
   * @param {Object} targetContext - Target user context
   * @returns {Object} Transferred knowledge
   */
  async transferToUser(targetUserId, targetContext = {}) {
    console.log(`🎁 Transferring knowledge to user ${targetUserId}`);

    // Adapt general knowledge to target context
    const adaptedKnowledge = this.adaptKnowledge(targetContext);

    // Record transfer
    const transfer = {
      targetUserId,
      targetContext,
      knowledge: adaptedKnowledge,
      timestamp: Date.now(),
      success: null  // Will be updated with feedback
    };

    this.transferHistory.push(transfer);
    this.metrics.totalTransfers++;

    await this.saveState();

    return adaptedKnowledge;
  }

  /**
   * 🎨 Adapt general knowledge to specific context
   */
  adaptKnowledge(context) {
    const adapted = {
      categoryRecommendations: this.adaptCategoryPreferences(context),
      suggestedCombinations: this.adaptCombinationPatterns(context),
      avoidCategories: this.adaptRejectionPatterns(context),
      temporalSuggestions: this.adaptTemporalPatterns(context),
      budgetGuidance: this.adaptBudgetPatterns(context)
    };

    return adapted;
  }

  /**
   * 🎯 Adapt category preferences to context
   */
  adaptCategoryPreferences(context) {
    const recommendations = [];

    for (const [category, kb] of Object.entries(this.knowledgeBase.categoryPreferences)) {
      if (kb.avgScore > 0.3 && kb.totalUsers >= 3) {
        recommendations.push({
          category,
          confidence: kb.avgScore,
          basedOnUsers: kb.totalUsers,
          reason: `${kb.totalUsers} users generally like this`
        });
      }
    }

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);

    return recommendations.slice(0, 10);  // Top 10
  }

  /**
   * 🔗 Adapt combination patterns to context
   */
  adaptCombinationPatterns(context) {
    const suggestions = [];

    for (const [key, kb] of Object.entries(this.knowledgeBase.combinationPatterns)) {
      if (kb.avgStrength > 0.5 && kb.observations >= 3) {
        suggestions.push({
          categories: kb.categories,
          strength: kb.avgStrength,
          observations: kb.observations,
          reason: `These work well together (${kb.observations} observations)`
        });
      }
    }

    // Sort by strength
    suggestions.sort((a, b) => b.strength - a.strength);

    return suggestions.slice(0, 5);  // Top 5
  }

  /**
   * ❌ Adapt rejection patterns to context
   */
  adaptRejectionPatterns(context) {
    const avoidances = [];

    for (const [key, kb] of Object.entries(this.knowledgeBase.rejectionPatterns)) {
      if (kb.totalOccurrences >= 3 && kb.users.length >= 2) {
        avoidances.push({
          category: kb.category,
          reason: kb.reason,
          occurrences: kb.totalOccurrences,
          warning: `${kb.users.length} users rejected this`
        });
      }
    }

    return avoidances;
  }

  /**
   * ⏰ Adapt temporal patterns to context
   */
  adaptTemporalPatterns(context) {
    // Return general temporal preferences from knowledge base
    return this.knowledgeBase.temporalPatterns || {};
  }

  /**
   * 💰 Adapt budget patterns to context
   */
  adaptBudgetPatterns(context) {
    if (!context.budget) return null;

    // Find similar budget patterns
    const similarPatterns = Object.values(this.knowledgeBase.budgetPatterns || {})
      .filter(p => Math.abs(p.avg - context.budget) < context.budget * 0.3);

    if (similarPatterns.length === 0) return null;

    return {
      similarUsers: similarPatterns.length,
      recommendations: 'Users with similar budgets typically...',
      patterns: similarPatterns
    };
  }

  /**
   * ✅ Record transfer success
   */
  async recordTransferSuccess(targetUserId, success, metrics = {}) {
    // Find last transfer for this user
    const transfer = this.transferHistory
      .reverse()
      .find(t => t.targetUserId === targetUserId);

    if (!transfer) return;

    transfer.success = success;
    transfer.metrics = metrics;

    if (success) {
      this.metrics.successfulTransfers++;
    }

    // Calculate success rate
    const completedTransfers = this.transferHistory.filter(t => t.success !== null);
    const successRate =
      completedTransfers.length > 0
        ? completedTransfers.filter(t => t.success).length / completedTransfers.length
        : 0;

    console.log(`📊 Transfer success rate: ${(successRate * 100).toFixed(1)}%`);

    await this.saveState();
  }

  /**
   * 🕐 Get time of day category
   */
  getTimeOfDay(timestamp) {
    const hour = new Date(timestamp).getHours();

    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  }

  /**
   * 📊 Calculate median
   */
  calculateMedian(numbers) {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * 📏 Get knowledge base size
   */
  getKnowledgeBaseSize() {
    return (
      Object.keys(this.knowledgeBase.categoryPreferences).length +
      Object.keys(this.knowledgeBase.combinationPatterns).length +
      Object.keys(this.knowledgeBase.rejectionPatterns).length
    );
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    const successRate =
      this.metrics.totalTransfers > 0
        ? (this.metrics.successfulTransfers / this.metrics.totalTransfers * 100).toFixed(1)
        : '0.0';

    return {
      knowledgeBaseSize: this.getKnowledgeBaseSize(),
      totalTransfers: this.metrics.totalTransfers,
      successfulTransfers: this.metrics.successfulTransfers,
      successRate: successRate + '%',
      categoryPatterns: Object.keys(this.knowledgeBase.categoryPreferences).length,
      combinationPatterns: Object.keys(this.knowledgeBase.combinationPatterns).length,
      rejectionPatterns: Object.keys(this.knowledgeBase.rejectionPatterns).length
    };
  }

  /**
   * 💾 Save state
   */
  async saveState() {
    if (!window.MLStorage) return;

    await window.MLStorage.set('transfer_learning_knowledge', {
      knowledgeBase: this.knowledgeBase,
      transferHistory: this.transferHistory.slice(-100),  // Keep last 100
      metrics: this.metrics,
      timestamp: Date.now()
    });
  }

  /**
   * 🧹 Reset
   */
  async reset() {
    this.knowledgeBase = {
      categoryPreferences: {},
      combinationPatterns: {},
      rejectionPatterns: {},
      successPatterns: {},
      temporalPatterns: {},
      budgetPatterns: {}
    };
    this.transferHistory = [];
    this.metrics = {
      totalTransfers: 0,
      successfulTransfers: 0,
      avgConfidenceGain: 0,
      bestSourceDomain: null,
      bestTargetDomain: null
    };

    await this.saveState();
    console.log('🧹 Transfer Learning state reset');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.TransferLearningEngine = new TransferLearningEngine();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.TransferLearningEngine.initialize().catch(e => {
        console.error('Failed to initialize Transfer Learning Engine:', e);
      });
    });
  } else {
    window.TransferLearningEngine.initialize().catch(e => {
      console.error('Failed to initialize Transfer Learning Engine:', e);
    });
  }

  console.log('🔄 Transfer Learning Engine loaded!');
}
