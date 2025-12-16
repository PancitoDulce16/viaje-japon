/**
 * 📚 FEEDBACK LEARNING SYSTEM
 * ============================
 *
 * Learns from user feedback to improve responses over time
 * Tracks what works and what doesn't
 */

class FeedbackLearning {
  constructor() {
    this.initialized = false;
    this.feedbackHistory = [];
    this.patterns = {
      successful: [],
      unsuccessful: [],
      corrections: []
    };
    this.metrics = {
      totalInteractions: 0,
      positiveResponses: 0,
      negativeResponses: 0,
      corrections: 0,
      averageSentiment: 0
    };
  }

  async initialize() {
    if (this.initialized) return;

    console.log('📚 Feedback Learning initializing...');

    // Load learning data
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('feedback_learning');
      if (stored) {
        this.patterns = stored.patterns || this.patterns;
        this.metrics = stored.metrics || this.metrics;
        this.feedbackHistory = stored.feedbackHistory || [];
      }
    }

    this.initialized = true;
    console.log('✅ Feedback Learning ready with', this.feedbackHistory.length, 'interactions');
  }

  /**
   * Record user feedback on an AI response
   */
  async recordFeedback(interaction, feedback) {
    if (!this.initialized) await this.initialize();

    const record = {
      timestamp: Date.now(),
      userInput: interaction.input,
      aiResponse: interaction.response,
      intent: interaction.intent,
      entities: interaction.entities,
      feedback: feedback,
      sentiment: this.analyzeFeedback(feedback)
    };

    this.feedbackHistory.push(record);
    this.metrics.totalInteractions++;

    // Update patterns based on sentiment
    if (record.sentiment === 'positive') {
      this.metrics.positiveResponses++;
      this.patterns.successful.push({
        input: interaction.input,
        response: interaction.response,
        intent: interaction.intent,
        score: 1.0
      });
    } else if (record.sentiment === 'negative') {
      this.metrics.negativeResponses++;
      this.patterns.unsuccessful.push({
        input: interaction.input,
        response: interaction.response,
        intent: interaction.intent,
        score: -1.0
      });
    }

    // Calculate average sentiment
    this.metrics.averageSentiment =
      (this.metrics.positiveResponses - this.metrics.negativeResponses) /
      this.metrics.totalInteractions;

    // Save to storage
    await this.save();

    return record;
  }

  /**
   * Record when user corrects the AI
   */
  async recordCorrection(originalIntent, correctedIntent, context) {
    if (!this.initialized) await this.initialize();

    this.patterns.corrections.push({
      timestamp: Date.now(),
      original: originalIntent,
      corrected: correctedIntent,
      context: context
    });

    this.metrics.corrections++;

    await this.save();
  }

  /**
   * Analyze feedback sentiment
   */
  analyzeFeedback(feedback) {
    const text = (feedback.text || '').toLowerCase();

    const positivePatterns = [
      /gra+cia+s/i,
      /perfecto/i,
      /genial/i,
      /excelente/i,
      /increíble/i,
      /me\s+gusta/i,
      /bien/i,
      /bueno/i,
      /si+\s*[!.]*/i,
      /ok+/i,
      /claro/i,
      /exacto/i,
      /correcto/i,
      /👍/,
      /❤️/,
      /😊/,
      /🎉/
    ];

    const negativePatterns = [
      /no+\s*[!.]*/i,
      /mal/i,
      /error/i,
      /incorrecto/i,
      /equivocado/i,
      /no\s+entend/i,
      /no\s+funciona/i,
      /no\s+sirve/i,
      /horrible/i,
      /terrible/i,
      /👎/,
      /😠/,
      /😡/,
      /❌/
    ];

    // Check positive patterns
    for (const pattern of positivePatterns) {
      if (pattern.test(text)) {
        return 'positive';
      }
    }

    // Check negative patterns
    for (const pattern of negativePatterns) {
      if (pattern.test(text)) {
        return 'negative';
      }
    }

    return 'neutral';
  }

  /**
   * Get insights from learning data
   */
  getInsights() {
    const insights = {
      metrics: this.metrics,
      topSuccessfulIntents: this.getTopIntents(this.patterns.successful),
      topUnsuccessfulIntents: this.getTopIntents(this.patterns.unsuccessful),
      commonCorrections: this.getCommonCorrections(),
      successRate: this.metrics.totalInteractions > 0
        ? (this.metrics.positiveResponses / this.metrics.totalInteractions) * 100
        : 0,
      needsImprovement: []
    };

    // Identify areas needing improvement
    const unsuccessfulIntents = this.getTopIntents(this.patterns.unsuccessful, 3);
    unsuccessfulIntents.forEach(([intent, count]) => {
      insights.needsImprovement.push({
        intent,
        count,
        recommendation: `La IA tiene problemas con intent "${intent}". Considera mejorar los patrones de detección.`
      });
    });

    return insights;
  }

  /**
   * Get top intents from pattern list
   */
  getTopIntents(patterns, limit = 5) {
    const intentCounts = {};

    patterns.forEach(p => {
      const intent = typeof p.intent === 'string' ? p.intent : p.intent?.action || 'unknown';
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;
    });

    return Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  /**
   * Get common corrections
   */
  getCommonCorrections() {
    const correctionPairs = {};

    this.patterns.corrections.forEach(c => {
      const key = `${c.original} → ${c.corrected}`;
      correctionPairs[key] = (correctionPairs[key] || 0) + 1;
    });

    return Object.entries(correctionPairs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  /**
   * Get recommendations for improving the AI
   */
  getRecommendations() {
    const recommendations = [];

    // Low success rate
    if (this.metrics.totalInteractions >= 10) {
      const successRate = (this.metrics.positiveResponses / this.metrics.totalInteractions) * 100;

      if (successRate < 60) {
        recommendations.push({
          type: 'low_success_rate',
          priority: 'high',
          message: `La tasa de éxito es solo ${successRate.toFixed(1)}%. Considera revisar los patrones de intents más problemáticos.`
        });
      }
    }

    // Frequent corrections
    if (this.metrics.corrections > this.metrics.totalInteractions * 0.2) {
      recommendations.push({
        type: 'frequent_corrections',
        priority: 'high',
        message: 'Los usuarios corrigen frecuentemente a la IA. Revisa los intent patterns más comunes.'
      });
    }

    // Negative trend
    if (this.metrics.averageSentiment < -0.2) {
      recommendations.push({
        type: 'negative_trend',
        priority: 'critical',
        message: 'El sentiment promedio es negativo. La IA necesita mejoras urgentes.'
      });
    }

    return recommendations;
  }

  /**
   * Save learning data
   */
  async save() {
    if (window.MLStorage) {
      // Keep only last 200 interactions
      const recentFeedback = this.feedbackHistory.slice(-200);

      await window.MLStorage.set('feedback_learning', {
        patterns: this.patterns,
        metrics: this.metrics,
        feedbackHistory: recentFeedback
      });
    }
  }

  /**
   * Export learning data for analysis
   */
  exportData() {
    return {
      metrics: this.metrics,
      insights: this.getInsights(),
      recommendations: this.getRecommendations(),
      recentFeedback: this.feedbackHistory.slice(-50)
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.FeedbackLearning = new FeedbackLearning();
  console.log('📚 Feedback Learning loaded!');
}
