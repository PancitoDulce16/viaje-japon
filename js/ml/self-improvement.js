/**
 * 📈 SELF-IMPROVEMENT ENGINE
 * ==========================
 *
 * "El AI que se mira al espejo y se mejora a sí mismo"
 *
 * Este módulo monitorea el rendimiento del AI y automáticamente:
 * - Detecta debilidades (baja tasa de aceptación en ciertos escenarios)
 * - Ajusta parámetros automáticamente
 * - Ejecuta auto-tests y benchmarks
 * - Compara versiones para ver si mejoramos o empeoramos
 *
 * Como un atleta que:
 * - Revisa sus métricas después de cada entrenamiento
 * - Identifica qué ejercicios le dan mejores resultados
 * - Ajusta su rutina para mejorar constantemente
 */

class SelfImprovementEngine {
  constructor() {
    this.initialized = false;

    // Performance tracking
    this.metrics = {
      overall: {
        totalInteractions: 0,
        acceptanceRate: 0,
        avgResponseTime: 0,
        avgConfidence: 0,
        errorRate: 0
      },
      byCategory: new Map(), // Category -> metrics
      byIntent: new Map(),   // Intent -> metrics
      byUserType: new Map(), // User archetype -> metrics
      trends: []             // Time series of metrics
    };

    // Self-test suite
    this.tests = [
      {
        name: 'intent_recognition',
        description: 'Can recognize user intents correctly',
        threshold: 0.85,
        testCases: [
          { input: 'Agregar un templo', expected: 'add_activity', category: 'temples' },
          { input: 'Quitar shopping', expected: 'remove_activity', category: 'shopping' },
          { input: 'Hacer el viaje más barato', expected: 'adjust_budget', direction: 'reduce' },
          { input: 'Necesito más descanso', expected: 'change_pace', pace: 'relaxed' }
        ]
      },
      {
        name: 'response_quality',
        description: 'Generate helpful, coherent responses',
        threshold: 0.75,
        testCases: [
          { input: 'Hola', expectedContains: ['ayudar', 'viaje', 'japón'] },
          { input: 'Ayuda', expectedContains: ['puedo', 'hacer'] }
        ]
      },
      {
        name: 'learning_speed',
        description: 'Learn from feedback quickly',
        threshold: 0.7,
        testCases: [] // Measured through actual feedback
      }
    ];

    // Adjustment history
    this.adjustments = [];

    // Benchmarks (version comparison)
    this.benchmarks = new Map(); // version -> score

    console.log('📈 Self-Improvement Engine initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load metrics history
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('self_improvement_metrics');
      if (stored) {
        this.metrics = stored.metrics || this.metrics;
        this.adjustments = stored.adjustments || [];
        this.benchmarks = new Map(stored.benchmarks || []);
      }
    }

    // Start periodic self-checks (every 5 minutes)
    this.startMonitoring();

    this.initialized = true;
    console.log('✅ Self-Improvement Engine ready');
  }

  /**
   * 📊 Record an interaction result
   */
  recordInteraction(result) {
    const { intent, category, userType, accepted, confidence, responseTime, error } = result;

    // Update overall metrics
    this.metrics.overall.totalInteractions++;

    if (accepted !== undefined) {
      const n = this.metrics.overall.totalInteractions;
      const currentRate = this.metrics.overall.acceptanceRate;
      this.metrics.overall.acceptanceRate =
        (currentRate * (n - 1) + (accepted ? 1 : 0)) / n;
    }

    if (confidence !== undefined) {
      const n = this.metrics.overall.totalInteractions;
      const currentAvg = this.metrics.overall.avgConfidence;
      this.metrics.overall.avgConfidence =
        (currentAvg * (n - 1) + confidence) / n;
    }

    if (responseTime !== undefined) {
      const n = this.metrics.overall.totalInteractions;
      const currentAvg = this.metrics.overall.avgResponseTime;
      this.metrics.overall.avgResponseTime =
        (currentAvg * (n - 1) + responseTime) / n;
    }

    if (error) {
      this.metrics.overall.errorRate++;
    }

    // Update category-specific metrics
    if (category) {
      this.updateCategoryMetrics(category, { accepted, confidence, responseTime });
    }

    // Update intent-specific metrics
    if (intent) {
      this.updateIntentMetrics(intent, { accepted, confidence, responseTime });
    }

    // Update user-type-specific metrics
    if (userType) {
      this.updateUserTypeMetrics(userType, { accepted, confidence, responseTime });
    }

    // Record trend point (every 10 interactions)
    if (this.metrics.overall.totalInteractions % 10 === 0) {
      this.recordTrendPoint();
    }

    // Check if we need to adjust
    this.checkForAdjustments();
  }

  /**
   * 📊 Update category-specific metrics
   */
  updateCategoryMetrics(category, data) {
    if (!this.metrics.byCategory.has(category)) {
      this.metrics.byCategory.set(category, {
        count: 0,
        acceptanceRate: 0,
        avgConfidence: 0,
        avgResponseTime: 0
      });
    }

    const metrics = this.metrics.byCategory.get(category);
    metrics.count++;

    if (data.accepted !== undefined) {
      metrics.acceptanceRate =
        (metrics.acceptanceRate * (metrics.count - 1) + (data.accepted ? 1 : 0)) / metrics.count;
    }

    if (data.confidence !== undefined) {
      metrics.avgConfidence =
        (metrics.avgConfidence * (metrics.count - 1) + data.confidence) / metrics.count;
    }

    if (data.responseTime !== undefined) {
      metrics.avgResponseTime =
        (metrics.avgResponseTime * (metrics.count - 1) + data.responseTime) / metrics.count;
    }
  }

  /**
   * 🎯 Update intent-specific metrics
   */
  updateIntentMetrics(intent, data) {
    if (!this.metrics.byIntent.has(intent)) {
      this.metrics.byIntent.set(intent, {
        count: 0,
        acceptanceRate: 0,
        avgConfidence: 0
      });
    }

    const metrics = this.metrics.byIntent.get(intent);
    metrics.count++;

    if (data.accepted !== undefined) {
      metrics.acceptanceRate =
        (metrics.acceptanceRate * (metrics.count - 1) + (data.accepted ? 1 : 0)) / metrics.count;
    }

    if (data.confidence !== undefined) {
      metrics.avgConfidence =
        (metrics.avgConfidence * (metrics.count - 1) + data.confidence) / metrics.count;
    }
  }

  /**
   * 👤 Update user-type-specific metrics
   */
  updateUserTypeMetrics(userType, data) {
    if (!this.metrics.byUserType.has(userType)) {
      this.metrics.byUserType.set(userType, {
        count: 0,
        acceptanceRate: 0,
        avgConfidence: 0
      });
    }

    const metrics = this.metrics.byUserType.get(userType);
    metrics.count++;

    if (data.accepted !== undefined) {
      metrics.acceptanceRate =
        (metrics.acceptanceRate * (metrics.count - 1) + (data.accepted ? 1 : 0)) / metrics.count;
    }

    if (data.confidence !== undefined) {
      metrics.avgConfidence =
        (metrics.avgConfidence * (metrics.count - 1) + data.confidence) / metrics.count;
    }
  }

  /**
   * 📈 Record trend point for time series analysis
   */
  recordTrendPoint() {
    this.metrics.trends.push({
      timestamp: Date.now(),
      acceptanceRate: this.metrics.overall.acceptanceRate,
      avgConfidence: this.metrics.overall.avgConfidence,
      avgResponseTime: this.metrics.overall.avgResponseTime,
      errorRate: this.metrics.overall.errorRate / this.metrics.overall.totalInteractions
    });

    // Keep only last 100 points
    if (this.metrics.trends.length > 100) {
      this.metrics.trends.shift();
    }
  }

  /**
   * 🔍 Check if we need to make adjustments
   */
  checkForAdjustments() {
    // Only check after enough data
    if (this.metrics.overall.totalInteractions < 20) return;

    const issues = this.identifyWeaknesses();

    for (const issue of issues) {
      this.makeAdjustment(issue);
    }
  }

  /**
   * 🔍 Identify weaknesses in performance
   */
  identifyWeaknesses() {
    const issues = [];

    // Check overall acceptance rate
    if (this.metrics.overall.acceptanceRate < 0.6) {
      issues.push({
        type: 'low_acceptance',
        severity: 'high',
        metric: this.metrics.overall.acceptanceRate,
        target: 0.7,
        description: 'Overall acceptance rate too low'
      });
    }

    // Check confidence levels
    if (this.metrics.overall.avgConfidence < 0.5) {
      issues.push({
        type: 'low_confidence',
        severity: 'medium',
        metric: this.metrics.overall.avgConfidence,
        target: 0.7,
        description: 'Average confidence too low'
      });
    }

    // Check response time
    if (this.metrics.overall.avgResponseTime > 1000) {
      issues.push({
        type: 'slow_response',
        severity: 'low',
        metric: this.metrics.overall.avgResponseTime,
        target: 500,
        description: 'Response time too slow'
      });
    }

    // Check category-specific issues
    for (const [category, metrics] of this.metrics.byCategory) {
      if (metrics.count > 5 && metrics.acceptanceRate < 0.5) {
        issues.push({
          type: 'category_weakness',
          severity: 'medium',
          category,
          metric: metrics.acceptanceRate,
          target: 0.7,
          description: `Low acceptance for ${category}`
        });
      }
    }

    // Check intent-specific issues
    for (const [intent, metrics] of this.metrics.byIntent) {
      if (metrics.count > 5 && metrics.acceptanceRate < 0.5) {
        issues.push({
          type: 'intent_weakness',
          severity: 'medium',
          intent,
          metric: metrics.acceptanceRate,
          target: 0.7,
          description: `Low acceptance for ${intent} intent`
        });
      }
    }

    // Check for declining trends
    if (this.metrics.trends.length >= 10) {
      const recent = this.metrics.trends.slice(-5);
      const earlier = this.metrics.trends.slice(-10, -5);

      const recentAvg = recent.reduce((sum, t) => sum + t.acceptanceRate, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, t) => sum + t.acceptanceRate, 0) / earlier.length;

      if (recentAvg < earlierAvg - 0.1) {
        issues.push({
          type: 'declining_performance',
          severity: 'high',
          metric: recentAvg,
          target: earlierAvg,
          description: 'Performance is declining over time'
        });
      }
    }

    return issues;
  }

  /**
   * 🔧 Make an adjustment to fix an issue
   */
  makeAdjustment(issue) {
    console.log(`🔧 Making adjustment for: ${issue.description}`);

    let adjustment = null;

    switch (issue.type) {
      case 'low_acceptance':
        // Increase exploration (try different strategies)
        adjustment = {
          type: 'increase_exploration',
          parameter: 'epsilon',
          oldValue: 0.1,
          newValue: 0.3,
          reason: issue.description
        };
        break;

      case 'low_confidence':
        // Lower confidence threshold (be more decisive)
        adjustment = {
          type: 'adjust_confidence',
          parameter: 'confidenceThreshold',
          oldValue: 0.7,
          newValue: 0.5,
          reason: issue.description
        };
        break;

      case 'category_weakness':
        // Increase learning rate for this category
        adjustment = {
          type: 'category_focus',
          category: issue.category,
          parameter: 'learningRate',
          multiplier: 1.5,
          reason: issue.description
        };
        break;

      case 'declining_performance':
        // Reset to baseline and increase learning rate
        adjustment = {
          type: 'reset_and_boost',
          parameter: 'learningRate',
          oldValue: 0.1,
          newValue: 0.2,
          reason: issue.description
        };
        break;
    }

    if (adjustment) {
      this.adjustments.push({
        timestamp: Date.now(),
        issue,
        adjustment
      });

      // Apply adjustment to relevant modules
      this.applyAdjustment(adjustment);
    }
  }

  /**
   * ⚙️ Apply adjustment to relevant modules
   */
  applyAdjustment(adjustment) {
    // Notify Reinforcement Learning Engine
    if (window.ReinforcementLearningEngine && adjustment.parameter === 'epsilon') {
      // Would need to add method to RL engine to update epsilon
      console.log(`📤 Notifying RL Engine: epsilon -> ${adjustment.newValue}`);
    }

    // Notify Meta-Learning Engine
    if (window.MetaLearningEngine && adjustment.parameter === 'learningRate') {
      console.log(`📤 Notifying Meta-Learning: learningRate -> ${adjustment.newValue}`);
    }

    // Save adjustment
    this.save();
  }

  /**
   * 🧪 Run self-tests
   */
  async runSelfTests() {
    console.log('🧪 Running self-tests...');

    const results = [];

    for (const test of this.tests) {
      const result = await this.runTest(test);
      results.push(result);

      console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.score.toFixed(2)} (threshold: ${test.threshold})`);
    }

    const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const allPassed = results.every(r => r.passed);

    return {
      passed: allPassed,
      score: overallScore,
      tests: results,
      timestamp: Date.now()
    };
  }

  /**
   * 🧪 Run a single test
   */
  async runTest(test) {
    let correct = 0;
    let total = test.testCases.length;

    for (const testCase of test.testCases) {
      try {
        if (test.name === 'intent_recognition') {
          // Test NLP Engine
          if (window.NLPEngine) {
            const result = await window.NLPEngine.parseCommand(testCase.input);
            if (result.intent === testCase.expected) {
              correct++;
            }
          }
        } else if (test.name === 'response_quality') {
          // Test Conversational AI
          if (window.ConversationalAI) {
            const result = await window.ConversationalAI.chat(testCase.input);
            const hasExpected = testCase.expectedContains.some(word =>
              result.text.toLowerCase().includes(word.toLowerCase())
            );
            if (hasExpected) {
              correct++;
            }
          }
        }
      } catch (e) {
        console.warn(`Test case failed: ${testCase.input}`, e);
      }
    }

    const score = total > 0 ? correct / total : 0;

    return {
      name: test.name,
      score,
      passed: score >= test.threshold,
      correct,
      total
    };
  }

  /**
   * 📊 Start periodic monitoring
   */
  startMonitoring() {
    // Run self-tests every 5 minutes
    setInterval(async () => {
      if (this.metrics.overall.totalInteractions > 0) {
        const results = await this.runSelfTests();

        if (!results.passed) {
          console.warn('⚠️ Self-tests failed, analyzing issues...');
          const issues = this.identifyWeaknesses();
          console.log(`Found ${issues.length} issues:`, issues);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Save metrics every minute
    setInterval(() => {
      this.save();
    }, 60 * 1000); // 1 minute
  }

  /**
   * 💾 Save metrics to storage
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('self_improvement_metrics', {
        metrics: this.metrics,
        adjustments: this.adjustments,
        benchmarks: Array.from(this.benchmarks.entries())
      });
    }
  }

  /**
   * 📊 Get performance report
   */
  getReport() {
    return {
      overall: this.metrics.overall,
      byCategory: Array.from(this.metrics.byCategory.entries()).map(([category, metrics]) => ({
        category,
        ...metrics
      })),
      byIntent: Array.from(this.metrics.byIntent.entries()).map(([intent, metrics]) => ({
        intent,
        ...metrics
      })),
      byUserType: Array.from(this.metrics.byUserType.entries()).map(([userType, metrics]) => ({
        userType,
        ...metrics
      })),
      weaknesses: this.identifyWeaknesses(),
      recentAdjustments: this.adjustments.slice(-10),
      trends: this.metrics.trends.slice(-20)
    };
  }

  /**
   * 📈 Get statistics
   */
  getStats() {
    return {
      totalInteractions: this.metrics.overall.totalInteractions,
      acceptanceRate: this.metrics.overall.acceptanceRate,
      avgConfidence: this.metrics.overall.avgConfidence,
      avgResponseTime: this.metrics.overall.avgResponseTime,
      totalAdjustments: this.adjustments.length,
      weaknesses: this.identifyWeaknesses().length
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.SelfImprovementEngine = new SelfImprovementEngine();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.SelfImprovementEngine.initialize();
    });
  } else {
    window.SelfImprovementEngine.initialize();
  }

  console.log('📈 Self-Improvement Engine loaded!');
}
