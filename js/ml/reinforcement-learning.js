/**
 * 🎮 FASE 5: REINFORCEMENT LEARNING ENGINE
 * ==========================================
 *
 * Learn from every user interaction to continuously improve suggestions.
 *
 * Implements:
 * - Q-Learning for trip planning decisions
 * - Reward signal calculation from user feedback
 * - Experience replay for better learning
 * - Multi-armed bandit for exploration/exploitation
 * - Policy improvement over time
 *
 * The AI learns:
 * - Which activities users accept/reject
 * - What optimizations work best
 * - How to adapt to different user types
 * - When to explore vs. exploit knowledge
 *
 * 100% local - no external training data needed
 */

class ReinforcementLearningEngine {
  constructor() {
    this.initialized = false;

    // Q-Table: Maps (state, action) → expected reward
    // State: itinerary configuration
    // Action: suggestion type
    // Reward: user acceptance (+1) or rejection (-1)
    this.qTable = new Map();

    // Experience replay buffer
    this.experiences = [];
    this.maxExperiences = 1000; // Keep last 1000 interactions

    // Learning parameters
    this.alpha = 0.1; // Learning rate
    this.gamma = 0.9; // Discount factor (how much we value future rewards)
    this.epsilon = 0.2; // Exploration rate (20% exploration, 80% exploitation)

    // Multi-armed bandit for algorithm selection
    this.bandits = {
      'route_optimization': { pulls: 0, totalReward: 0 },
      'fatigue_reduction': { pulls: 0, totalReward: 0 },
      'budget_optimization': { pulls: 0, totalReward: 0 },
      'activity_suggestion': { pulls: 0, totalReward: 0 },
      'pace_adjustment': { pulls: 0, totalReward: 0 }
    };

    // Performance tracking
    this.metrics = {
      totalInteractions: 0,
      totalReward: 0,
      acceptanceRate: 0,
      learningCurve: []
    };

    console.log('🎮 Reinforcement Learning Engine initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load Q-Table and experiences from storage
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('rl_state');
      if (stored) {
        if (stored.qTable) {
          // Convert array back to Map
          this.qTable = new Map(stored.qTable);
        }
        if (stored.experiences) {
          this.experiences = stored.experiences;
        }
        if (stored.bandits) {
          this.bandits = stored.bandits;
        }
        if (stored.metrics) {
          this.metrics = stored.metrics;
        }
      }
    }

    this.initialized = true;
    console.log('✅ Reinforcement Learning Engine ready');
    console.log(`📊 Loaded ${this.qTable.size} Q-values, ${this.experiences.length} experiences`);
  }

  /**
   * 🎯 Get best action for current state (exploration vs. exploitation)
   * @param {Object} state - Current itinerary state
   * @returns {string} Recommended action
   */
  selectAction(state) {
    const stateKey = this.serializeState(state);

    // Epsilon-greedy strategy
    if (Math.random() < this.epsilon) {
      // EXPLORE: Try random action
      const actions = Object.keys(this.bandits);
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      console.log(`🔍 Exploring: trying ${randomAction}`);
      return randomAction;
    } else {
      // EXPLOIT: Use best known action
      const bestAction = this.getBestAction(stateKey);
      console.log(`🎯 Exploiting: using ${bestAction}`);
      return bestAction;
    }
  }

  /**
   * 🏆 Get best action based on Q-values
   */
  getBestAction(stateKey) {
    const actions = Object.keys(this.bandits);
    let bestAction = actions[0];
    let bestQValue = this.getQValue(stateKey, bestAction);

    for (const action of actions) {
      const qValue = this.getQValue(stateKey, action);
      if (qValue > bestQValue) {
        bestQValue = qValue;
        bestAction = action;
      }
    }

    // If all Q-values are 0, use multi-armed bandit
    if (bestQValue === 0) {
      return this.selectBanditArm();
    }

    return bestAction;
  }

  /**
   * 📈 Get Q-value for (state, action) pair
   */
  getQValue(stateKey, action) {
    const key = `${stateKey}|${action}`;
    return this.qTable.get(key) || 0;
  }

  /**
   * 📝 Update Q-value based on reward
   */
  updateQValue(stateKey, action, reward, nextStateKey) {
    const key = `${stateKey}|${action}`;
    const currentQ = this.getQValue(stateKey, action);

    // Get max Q-value for next state
    const actions = Object.keys(this.bandits);
    const nextQValues = actions.map(a => this.getQValue(nextStateKey, a));
    const maxNextQ = Math.max(...nextQValues, 0);

    // Q-learning update rule
    const newQ = currentQ + this.alpha * (reward + this.gamma * maxNextQ - currentQ);

    this.qTable.set(key, newQ);

    console.log(`📊 Updated Q(${stateKey.slice(0, 20)}..., ${action}): ${currentQ.toFixed(3)} → ${newQ.toFixed(3)}`);
  }

  /**
   * 🎰 Multi-armed bandit: Select arm with highest UCB score
   */
  selectBanditArm() {
    let bestArm = null;
    let bestScore = -Infinity;
    const totalPulls = Object.values(this.bandits).reduce((sum, b) => sum + b.pulls, 0);

    for (const [arm, stats] of Object.entries(this.bandits)) {
      if (stats.pulls === 0) {
        // Always try untested arms first
        return arm;
      }

      // UCB1 formula
      const avgReward = stats.totalReward / stats.pulls;
      const exploration = Math.sqrt((2 * Math.log(totalPulls)) / stats.pulls);
      const ucbScore = avgReward + exploration;

      if (ucbScore > bestScore) {
        bestScore = ucbScore;
        bestArm = arm;
      }
    }

    return bestArm;
  }

  /**
   * 🔄 Record user feedback and learn from it
   * @param {Object} interaction - User interaction data
   */
  async recordFeedback(interaction) {
    const {
      state,
      action,
      feedback, // 'accept', 'reject', 'edit'
      nextState
    } = interaction;

    // Calculate reward
    const reward = this.calculateReward(feedback, interaction);

    // Serialize states
    const stateKey = this.serializeState(state);
    const nextStateKey = this.serializeState(nextState);

    // Update Q-value
    this.updateQValue(stateKey, action, reward, nextStateKey);

    // Update bandit statistics
    if (this.bandits[action]) {
      this.bandits[action].pulls++;
      this.bandits[action].totalReward += reward;
    }

    // Store experience
    const experience = {
      state: stateKey,
      action,
      reward,
      nextState: nextStateKey,
      feedback,
      timestamp: Date.now()
    };

    this.experiences.push(experience);

    // Limit experience buffer
    if (this.experiences.length > this.maxExperiences) {
      this.experiences = this.experiences.slice(-this.maxExperiences);
    }

    // Update metrics
    this.updateMetrics(reward, feedback);

    // Replay experiences (batch learning)
    if (this.experiences.length % 10 === 0) {
      await this.replayExperiences();
    }

    // Save state
    await this.saveState();

    console.log(`📝 Recorded feedback: ${feedback} → reward: ${reward.toFixed(2)}`);
  }

  /**
   * 🏅 Calculate reward from user feedback
   */
  calculateReward(feedback, interaction) {
    let baseReward = 0;

    // Primary reward from feedback type
    switch (feedback) {
      case 'accept':
        baseReward = 1.0;
        break;
      case 'reject':
        baseReward = -1.0;
        break;
      case 'edit':
        baseReward = 0.3; // Partial acceptance
        break;
      case 'ignore':
        baseReward = -0.2; // Slight negative
        break;
      default:
        baseReward = 0;
    }

    // Bonuses for positive outcomes
    if (interaction.metrics) {
      // Bonus for reducing fatigue
      if (interaction.metrics.fatigueReduced > 0) {
        baseReward += 0.2;
      }

      // Bonus for saving money
      if (interaction.metrics.moneySaved > 0) {
        baseReward += 0.1;
      }

      // Bonus for reducing distance
      if (interaction.metrics.distanceReduced > 0) {
        baseReward += 0.15;
      }
    }

    // Penalty for user expressing negative sentiment
    if (interaction.sentiment && interaction.sentiment.label === 'negative') {
      baseReward -= 0.3;
    }

    // Bonus for user expressing positive sentiment
    if (interaction.sentiment && interaction.sentiment.label === 'positive') {
      baseReward += 0.2;
    }

    return Math.max(-2, Math.min(2, baseReward)); // Clamp to [-2, 2]
  }

  /**
   * 📼 Experience replay - Learn from past interactions
   */
  async replayExperiences() {
    if (this.experiences.length < 10) return;

    // Sample 10 random experiences
    const sampleSize = Math.min(10, this.experiences.length);
    const samples = [];

    for (let i = 0; i < sampleSize; i++) {
      const idx = Math.floor(Math.random() * this.experiences.length);
      samples.push(this.experiences[idx]);
    }

    // Learn from each sample
    for (const exp of samples) {
      this.updateQValue(exp.state, exp.action, exp.reward, exp.nextState);
    }

    console.log(`📼 Replayed ${samples.length} experiences`);
  }

  /**
   * 🔑 Serialize state to string key
   */
  serializeState(state) {
    if (!state) return 'empty';

    // Extract key features
    const features = {
      dayCount: state.dayCount || state.days?.length || 0,
      activityCount: state.activityCount || 0,
      budgetLevel: this.categorizeBudget(state.budget),
      paceLevel: state.pace || 'moderate',
      userType: state.userType || state.archetype || 'explorer'
    };

    return JSON.stringify(features);
  }

  /**
   * 💰 Categorize budget into levels
   */
  categorizeBudget(budget) {
    if (!budget) return 'medium';
    if (budget < 50000) return 'low';
    if (budget < 150000) return 'medium';
    return 'high';
  }

  /**
   * 📊 Update performance metrics
   */
  updateMetrics(reward, feedback) {
    this.metrics.totalInteractions++;
    this.metrics.totalReward += reward;

    // Calculate acceptance rate
    const acceptCount = this.experiences.filter(e => e.feedback === 'accept').length;
    this.metrics.acceptanceRate = acceptCount / this.experiences.length;

    // Add to learning curve (track every 10 interactions)
    if (this.metrics.totalInteractions % 10 === 0) {
      this.metrics.learningCurve.push({
        interaction: this.metrics.totalInteractions,
        avgReward: this.metrics.totalReward / this.metrics.totalInteractions,
        acceptanceRate: this.metrics.acceptanceRate,
        timestamp: Date.now()
      });

      // Keep only last 100 points
      if (this.metrics.learningCurve.length > 100) {
        this.metrics.learningCurve = this.metrics.learningCurve.slice(-100);
      }
    }
  }

  /**
   * 💾 Save RL state to storage
   */
  async saveState() {
    if (!window.MLStorage) return;

    await window.MLStorage.set('rl_state', {
      qTable: Array.from(this.qTable.entries()),
      experiences: this.experiences,
      bandits: this.bandits,
      metrics: this.metrics,
      timestamp: Date.now()
    });
  }

  /**
   * 📊 Get learning statistics
   */
  getStats() {
    return {
      totalInteractions: this.metrics.totalInteractions,
      acceptanceRate: (this.metrics.acceptanceRate * 100).toFixed(1) + '%',
      averageReward: (this.metrics.totalReward / Math.max(this.metrics.totalInteractions, 1)).toFixed(3),
      qTableSize: this.qTable.size,
      experienceCount: this.experiences.length,
      bestAlgorithm: this.getBestAlgorithm(),
      learningCurve: this.metrics.learningCurve
    };
  }

  /**
   * 🏆 Get best performing algorithm
   */
  getBestAlgorithm() {
    let best = { name: 'none', avgReward: 0 };

    for (const [name, stats] of Object.entries(this.bandits)) {
      if (stats.pulls > 0) {
        const avgReward = stats.totalReward / stats.pulls;
        if (avgReward > best.avgReward) {
          best = { name, avgReward };
        }
      }
    }

    return best;
  }

  /**
   * 🎓 Get recommendation with confidence
   */
  getRecommendation(state) {
    const stateKey = this.serializeState(state);
    const action = this.selectAction(state);

    // Get Q-value as confidence
    const qValue = this.getQValue(stateKey, action);

    // Get bandit stats
    const banditStats = this.bandits[action];
    const confidence = banditStats && banditStats.pulls > 0
      ? Math.min(banditStats.totalReward / banditStats.pulls, 1.0)
      : 0.5;

    return {
      action,
      qValue,
      confidence,
      isExploring: Math.random() < this.epsilon,
      banditStats: banditStats || { pulls: 0, totalReward: 0 }
    };
  }

  /**
   * 🧹 Reset learning (for testing)
   */
  async reset() {
    this.qTable.clear();
    this.experiences = [];
    this.metrics = {
      totalInteractions: 0,
      totalReward: 0,
      acceptanceRate: 0,
      learningCurve: []
    };

    for (const key of Object.keys(this.bandits)) {
      this.bandits[key] = { pulls: 0, totalReward: 0 };
    }

    await this.saveState();
    console.log('🧹 RL state reset');
  }

  /**
   * 🔬 Run A/B test between two algorithms
   */
  async runABTest(algorithmA, algorithmB, duration = 100) {
    const results = {
      algorithmA: { accepts: 0, rejects: 0, total: 0 },
      algorithmB: { accepts: 0, rejects: 0, total: 0 }
    };

    console.log(`🔬 Starting A/B test: ${algorithmA} vs ${algorithmB} (${duration} trials)`);

    // This would be integrated with actual user interactions
    // For now, just log the setup

    return {
      winner: null,
      results,
      confidence: 0
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ReinforcementLearningEngine = new ReinforcementLearningEngine();

  // Auto-initialize (check if DOM already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ReinforcementLearningEngine.initialize().catch(e => {
        console.error('Failed to initialize RL Engine:', e);
      });
    });
  } else {
    // DOM already loaded, initialize immediately
    window.ReinforcementLearningEngine.initialize().catch(e => {
      console.error('Failed to initialize RL Engine:', e);
    });
  }

  console.log('🎮 Reinforcement Learning Engine loaded!');
}
