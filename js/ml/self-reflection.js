/**
 * 🪞 SELF-REFLECTION ENGINE - FASE 12
 * ====================================
 *
 * "La IA que se conoce a sí misma y mejora continuamente"
 *
 * Un sistema de auto-evaluación que permite a la IA:
 * 1. Monitorear su propio rendimiento
 * 2. Detectar patrones en errores y aciertos
 * 3. Identificar áreas de mejora
 * 4. Ajustar su comportamiento automáticamente
 * 5. Aprender de sus propios errores
 *
 * ARQUITECTURA:
 * - Performance Monitor: Rastrea métricas en tiempo real
 * - Error Analyzer: Detecta patrones en fallos
 * - Quality Assessor: Evalúa calidad de decisiones
 * - Improvement Suggester: Propone mejoras
 * - Self-Correction: Ajusta comportamiento
 *
 * MÉTRICAS MONITOREADAS:
 * - Precisión de recomendaciones (¿usuario aceptó?)
 * - Tiempo de respuesta
 * - Tasa de error por módulo
 * - Satisfacción del usuario (implícita)
 * - Calidad de razonamiento
 *
 * EJEMPLO:
 * La IA detecta que 70% de sus recomendaciones de templos son rechazadas
 * → Analiza el patrón: siempre recomienda templos muy turísticos
 * → Identifica mejora: dar más peso a templos menos conocidos
 * → Ajusta parámetros de recomendación
 * → Monitorea si mejora
 */

class SelfReflectionEngine {
  constructor() {
    this.initialized = false;

    // Performance metrics (real-time)
    this.metrics = {
      // Recommendation accuracy
      recommendationsAccepted: 0,
      recommendationsRejected: 0,
      recommendationsTotal: 0,

      // Response quality
      avgResponseTime: 0,
      responseCount: 0,

      // Error tracking
      errorsByModule: new Map(),
      errorsByType: new Map(),
      totalErrors: 0,

      // User satisfaction (implicit)
      positiveInteractions: 0,
      negativeInteractions: 0,
      neutralInteractions: 0,

      // Decision quality
      decisionsCorrect: 0,
      decisionsIncorrect: 0,
      decisionsUncertain: 0
    };

    // Reflection history
    this.reflections = [];

    // Identified issues
    this.issues = [];

    // Suggested improvements
    this.improvements = [];

    // Self-correction actions taken
    this.corrections = [];

    // Configuration
    this.config = {
      reflectionInterval: 50,        // Reflexionar cada 50 interacciones
      minDataForReflection: 20,      // Mínimo 20 datos para reflexionar
      errorThreshold: 0.3,            // 30% de error = problema
      improvementThreshold: 0.1,      // 10% de mejora = acción correcta
      autoCorrect: true               // Auto-corregir cuando sea posible
    };

    // Pattern detection
    this.patterns = {
      errorPatterns: [],              // Patrones en errores
      successPatterns: [],            // Patrones en aciertos
      userPreferencePatterns: []      // Patrones en preferencias del usuario
    };

    // Module quality scores (0-1)
    this.moduleScores = {
      conversationalAI: 1.0,
      recommendationEngine: 1.0,
      swarmIntelligence: 1.0,
      dataIntegration: 1.0,
      treeOfThoughts: 1.0,
      multiAgentDebate: 1.0,
      autonomousAgent: 1.0
    };

    // Last reflection timestamp
    this.lastReflection = Date.now();

    console.log('🪞 Self-Reflection Engine initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load historical data
    await this.loadReflectionData();

    // Start periodic reflection
    this.startPeriodicReflection();

    this.initialized = true;
    console.log('✅ Self-Reflection Engine ready');
    console.log(`📊 Historical reflections: ${this.reflections.length}`);
  }

  /**
   * 📊 PERFORMANCE MONITORING
   */

  /**
   * Record a recommendation outcome
   */
  recordRecommendation(accepted, metadata = {}) {
    this.metrics.recommendationsTotal++;

    if (accepted) {
      this.metrics.recommendationsAccepted++;
      this.metrics.positiveInteractions++;
    } else {
      this.metrics.recommendationsRejected++;
      this.metrics.negativeInteractions++;
    }

    // Store for pattern detection
    this.storeEvent('recommendation', {
      accepted,
      ...metadata,
      timestamp: Date.now()
    });

    // Update module score
    if (metadata.module) {
      this.updateModuleScore(metadata.module, accepted ? 1 : 0);
    }

    // Check if reflection needed
    this.checkReflectionTrigger();
  }

  /**
   * Record response time
   */
  recordResponseTime(timeMs, metadata = {}) {
    this.metrics.responseCount++;
    this.metrics.avgResponseTime =
      (this.metrics.avgResponseTime * (this.metrics.responseCount - 1) + timeMs) /
      this.metrics.responseCount;

    // Detect slow responses
    if (timeMs > 5000) {
      this.recordIssue({
        type: 'performance',
        severity: timeMs > 10000 ? 'high' : 'medium',
        description: `Respuesta lenta: ${timeMs}ms`,
        metadata,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Record an error
   */
  recordError(module, errorType, details = {}) {
    this.metrics.totalErrors++;

    // Track by module
    const moduleCount = this.metrics.errorsByModule.get(module) || 0;
    this.metrics.errorsByModule.set(module, moduleCount + 1);

    // Track by type
    const typeCount = this.metrics.errorsByType.get(errorType) || 0;
    this.metrics.errorsByType.set(errorType, typeCount + 1);

    // Store for analysis
    this.storeEvent('error', {
      module,
      errorType,
      details,
      timestamp: Date.now()
    });

    // Update module score
    this.updateModuleScore(module, 0);

    // Check if critical issue
    const errorRate = moduleCount / this.metrics.responseCount;
    if (errorRate > this.config.errorThreshold) {
      this.recordIssue({
        type: 'high_error_rate',
        severity: 'high',
        description: `Módulo ${module} tiene ${(errorRate * 100).toFixed(1)}% de errores`,
        module,
        errorRate,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Record decision quality
   */
  recordDecision(correct, confidence, metadata = {}) {
    if (correct) {
      this.metrics.decisionsCorrect++;
    } else if (correct === false) {
      this.metrics.decisionsIncorrect++;
    } else {
      this.metrics.decisionsUncertain++;
    }

    // If low confidence but correct, that's good
    // If high confidence but incorrect, that's bad (overconfidence)
    if (correct === false && confidence > 0.8) {
      this.recordIssue({
        type: 'overconfidence',
        severity: 'medium',
        description: 'Decisión incorrecta con alta confianza',
        confidence,
        metadata,
        timestamp: Date.now()
      });
    }

    this.storeEvent('decision', {
      correct,
      confidence,
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Record user interaction sentiment
   */
  recordInteraction(sentiment, metadata = {}) {
    // sentiment: 'positive', 'negative', 'neutral'
    if (sentiment === 'positive') {
      this.metrics.positiveInteractions++;
    } else if (sentiment === 'negative') {
      this.metrics.negativeInteractions++;
    } else {
      this.metrics.neutralInteractions++;
    }

    this.storeEvent('interaction', {
      sentiment,
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * 🔍 PATTERN DETECTION
   */

  /**
   * Analyze errors for patterns
   */
  analyzeErrorPatterns() {
    const recentErrors = this.getRecentEvents('error', 100);

    if (recentErrors.length < this.config.minDataForReflection) {
      return [];
    }

    const patterns = [];

    // Pattern 1: Errors clustered by module
    const moduleDistribution = {};
    for (const error of recentErrors) {
      moduleDistribution[error.module] = (moduleDistribution[error.module] || 0) + 1;
    }

    for (const [module, count] of Object.entries(moduleDistribution)) {
      if (count / recentErrors.length > 0.4) {
        patterns.push({
          type: 'module_concentration',
          description: `${((count / recentErrors.length) * 100).toFixed(1)}% de errores vienen de ${module}`,
          module,
          severity: 'high',
          suggestion: `Revisar implementación de ${module}`
        });
      }
    }

    // Pattern 2: Errors clustered by type
    const typeDistribution = {};
    for (const error of recentErrors) {
      typeDistribution[error.errorType] = (typeDistribution[error.errorType] || 0) + 1;
    }

    for (const [type, count] of Object.entries(typeDistribution)) {
      if (count / recentErrors.length > 0.3) {
        patterns.push({
          type: 'error_type_concentration',
          description: `Error común: ${type} (${count} veces)`,
          errorType: type,
          severity: 'medium',
          suggestion: `Agregar validación o manejo especial para ${type}`
        });
      }
    }

    // Pattern 3: Temporal clustering (errors happening together)
    const timeWindows = this.clusterByTime(recentErrors, 5 * 60 * 1000); // 5 min windows

    for (const window of timeWindows) {
      if (window.events.length > 5) {
        patterns.push({
          type: 'temporal_cluster',
          description: `${window.events.length} errores en 5 minutos`,
          time: new Date(window.start).toISOString(),
          severity: 'medium',
          suggestion: 'Posible problema sistémico o entrada problemática del usuario'
        });
      }
    }

    this.patterns.errorPatterns = patterns;
    return patterns;
  }

  /**
   * Analyze success patterns
   */
  analyzeSuccessPatterns() {
    const recentRecommendations = this.getRecentEvents('recommendation', 100);
    const accepted = recentRecommendations.filter(r => r.accepted);

    if (accepted.length < this.config.minDataForReflection) {
      return [];
    }

    const patterns = [];

    // Pattern 1: What categories work well?
    const categorySuccess = {};
    const categoryTotal = {};

    for (const rec of recentRecommendations) {
      if (rec.category) {
        categoryTotal[rec.category] = (categoryTotal[rec.category] || 0) + 1;
        if (rec.accepted) {
          categorySuccess[rec.category] = (categorySuccess[rec.category] || 0) + 1;
        }
      }
    }

    for (const [category, successCount] of Object.entries(categorySuccess)) {
      const total = categoryTotal[category];
      const rate = successCount / total;

      if (rate > 0.7 && total > 5) {
        patterns.push({
          type: 'high_success_category',
          description: `${category}: ${(rate * 100).toFixed(1)}% aceptación`,
          category,
          successRate: rate,
          suggestion: `Priorizar ${category} en recomendaciones`
        });
      } else if (rate < 0.3 && total > 5) {
        patterns.push({
          type: 'low_success_category',
          description: `${category}: solo ${(rate * 100).toFixed(1)}% aceptación`,
          category,
          successRate: rate,
          suggestion: `Mejorar calidad de recomendaciones de ${category}`
        });
      }
    }

    // Pattern 2: Time of day patterns
    const hourSuccess = {};
    const hourTotal = {};

    for (const rec of recentRecommendations) {
      const hour = new Date(rec.timestamp).getHours();
      hourTotal[hour] = (hourTotal[hour] || 0) + 1;
      if (rec.accepted) {
        hourSuccess[hour] = (hourSuccess[hour] || 0) + 1;
      }
    }

    // Identify best and worst hours
    const hourRates = Object.entries(hourSuccess).map(([hour, count]) => ({
      hour: parseInt(hour),
      rate: count / hourTotal[hour]
    }));

    if (hourRates.length > 0) {
      const bestHour = hourRates.reduce((a, b) => a.rate > b.rate ? a : b);
      const worstHour = hourRates.reduce((a, b) => a.rate < b.rate ? a : b);

      if (bestHour.rate - worstHour.rate > 0.3) {
        patterns.push({
          type: 'time_of_day_pattern',
          description: `Usuario más receptivo a las ${bestHour.hour}:00 (${(bestHour.rate * 100).toFixed(1)}% vs ${(worstHour.rate * 100).toFixed(1)}%)`,
          bestHour: bestHour.hour,
          worstHour: worstHour.hour,
          suggestion: 'Considerar hora del día al personalizar'
        });
      }
    }

    this.patterns.successPatterns = patterns;
    return patterns;
  }

  /**
   * Analyze user preference patterns
   */
  analyzeUserPreferences() {
    const recentInteractions = this.getRecentEvents('interaction', 200);

    if (recentInteractions.length < this.config.minDataForReflection) {
      return [];
    }

    const patterns = [];

    // Extract preferences from positive interactions
    const positive = recentInteractions.filter(i => i.sentiment === 'positive');

    // Common attributes in positive interactions
    const attributes = {
      city: {},
      category: {},
      priceLevel: {},
      responseStyle: {}
    };

    for (const interaction of positive) {
      if (interaction.city) {
        attributes.city[interaction.city] = (attributes.city[interaction.city] || 0) + 1;
      }
      if (interaction.category) {
        attributes.category[interaction.category] = (attributes.category[interaction.category] || 0) + 1;
      }
      if (interaction.priceLevel !== undefined) {
        attributes.priceLevel[interaction.priceLevel] = (attributes.priceLevel[interaction.priceLevel] || 0) + 1;
      }
      if (interaction.responseStyle) {
        attributes.responseStyle[interaction.responseStyle] = (attributes.responseStyle[interaction.responseStyle] || 0) + 1;
      }
    }

    // Identify strong preferences
    for (const [attrType, distribution] of Object.entries(attributes)) {
      const total = Object.values(distribution).reduce((a, b) => a + b, 0);
      const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);

      if (sorted.length > 0 && sorted[0][1] / total > 0.5) {
        patterns.push({
          type: 'strong_preference',
          description: `Usuario prefiere ${attrType}: ${sorted[0][0]} (${((sorted[0][1] / total) * 100).toFixed(1)}%)`,
          attribute: attrType,
          value: sorted[0][0],
          strength: sorted[0][1] / total,
          suggestion: `Priorizar ${sorted[0][0]} en ${attrType}`
        });
      }
    }

    this.patterns.userPreferencePatterns = patterns;
    return patterns;
  }

  /**
   * 💡 IMPROVEMENT SUGGESTIONS
   */

  /**
   * Generate improvement suggestions based on analysis
   */
  generateImprovements() {
    const improvements = [];

    // Analyze all patterns
    const errorPatterns = this.analyzeErrorPatterns();
    const successPatterns = this.analyzeSuccessPatterns();
    const preferencePatterns = this.analyzeUserPreferences();

    // From error patterns
    for (const pattern of errorPatterns) {
      if (pattern.severity === 'high') {
        improvements.push({
          type: 'fix_critical_issue',
          priority: 'high',
          description: pattern.description,
          suggestion: pattern.suggestion,
          pattern,
          timestamp: Date.now()
        });
      }
    }

    // From success patterns
    for (const pattern of successPatterns) {
      if (pattern.type === 'high_success_category') {
        improvements.push({
          type: 'amplify_success',
          priority: 'medium',
          description: `Amplificar éxito en ${pattern.category}`,
          suggestion: pattern.suggestion,
          pattern,
          timestamp: Date.now()
        });
      } else if (pattern.type === 'low_success_category') {
        improvements.push({
          type: 'improve_weakness',
          priority: 'medium',
          description: `Mejorar ${pattern.category}`,
          suggestion: pattern.suggestion,
          pattern,
          timestamp: Date.now()
        });
      }
    }

    // From preference patterns
    for (const pattern of preferencePatterns) {
      if (pattern.strength > 0.7) {
        improvements.push({
          type: 'personalize',
          priority: 'low',
          description: `Personalizar según preferencia: ${pattern.attribute}`,
          suggestion: pattern.suggestion,
          pattern,
          timestamp: Date.now()
        });
      }
    }

    // Check overall performance
    const acceptanceRate = this.metrics.recommendationsTotal > 0
      ? this.metrics.recommendationsAccepted / this.metrics.recommendationsTotal
      : 0;

    if (acceptanceRate < 0.5 && this.metrics.recommendationsTotal > 20) {
      improvements.push({
        type: 'low_acceptance_rate',
        priority: 'high',
        description: `Tasa de aceptación baja: ${(acceptanceRate * 100).toFixed(1)}%`,
        suggestion: 'Revisar estrategia general de recomendaciones',
        timestamp: Date.now()
      });
    }

    this.improvements = improvements;
    return improvements;
  }

  /**
   * 🔧 SELF-CORRECTION
   */

  /**
   * Apply automatic corrections
   */
  async applySelfCorrections() {
    if (!this.config.autoCorrect) {
      console.log('⏸️ Auto-correction disabled');
      return [];
    }

    const corrections = [];

    // Get high-priority improvements
    const highPriority = this.improvements.filter(i => i.priority === 'high');

    for (const improvement of highPriority) {
      const correction = await this.attemptCorrection(improvement);

      if (correction) {
        corrections.push(correction);
        this.corrections.push({
          ...correction,
          timestamp: Date.now()
        });
      }
    }

    if (corrections.length > 0) {
      console.log(`🔧 Applied ${corrections.length} self-corrections`);
      await this.saveReflectionData();
    }

    return corrections;
  }

  /**
   * Attempt to apply a correction
   */
  async attemptCorrection(improvement) {
    switch (improvement.type) {
      case 'fix_critical_issue':
        // If a module is failing, reduce its usage weight
        if (improvement.pattern.module) {
          const module = improvement.pattern.module;
          this.moduleScores[module] = Math.max(0.3, this.moduleScores[module] - 0.2);

          console.log(`⚖️ Reduced weight for ${module} to ${this.moduleScores[module]}`);

          return {
            type: 'reduce_module_weight',
            module,
            newWeight: this.moduleScores[module],
            reason: improvement.description
          };
        }
        break;

      case 'amplify_success':
        // If a category is successful, we could boost its recommendations
        // This would require integrating with recommendation engine
        console.log(`📈 Would boost ${improvement.pattern.category} recommendations`);
        return {
          type: 'boost_category',
          category: improvement.pattern.category,
          reason: improvement.description
        };

      case 'low_acceptance_rate':
        // Global issue - could adjust exploration rate
        console.log('🔄 Would increase exploration rate to find better recommendations');
        return {
          type: 'increase_exploration',
          reason: improvement.description
        };
    }

    return null;
  }

  /**
   * 🪞 REFLECTION CYCLE
   */

  /**
   * Perform a full reflection
   */
  async performReflection() {
    const startTime = Date.now();

    console.log('🪞 Starting self-reflection...');

    // Analyze patterns
    const errorPatterns = this.analyzeErrorPatterns();
    const successPatterns = this.analyzeSuccessPatterns();
    const preferencePatterns = this.analyzeUserPreferences();

    // Generate improvements
    const improvements = this.generateImprovements();

    // Apply corrections
    const corrections = await this.applySelfCorrections();

    // Calculate quality scores
    const qualityScore = this.calculateOverallQuality();

    // Create reflection record
    const reflection = {
      timestamp: Date.now(),
      metrics: { ...this.metrics },
      moduleScores: { ...this.moduleScores },
      errorPatterns,
      successPatterns,
      preferencePatterns,
      improvements,
      corrections,
      qualityScore,
      duration: Date.now() - startTime
    };

    this.reflections.push(reflection);

    // Keep last 50 reflections
    if (this.reflections.length > 50) {
      this.reflections = this.reflections.slice(-50);
    }

    await this.saveReflectionData();

    this.lastReflection = Date.now();

    console.log(`✅ Reflection completed in ${reflection.duration}ms`);
    console.log(`📊 Quality score: ${(qualityScore * 100).toFixed(1)}/100`);
    console.log(`💡 Found ${improvements.length} improvements, applied ${corrections.length} corrections`);

    return reflection;
  }

  /**
   * Calculate overall quality score (0-1)
   */
  calculateOverallQuality() {
    let score = 0;
    let weight = 0;

    // Recommendation acceptance rate (30%)
    if (this.metrics.recommendationsTotal > 0) {
      const acceptanceRate = this.metrics.recommendationsAccepted / this.metrics.recommendationsTotal;
      score += acceptanceRate * 0.3;
      weight += 0.3;
    }

    // Decision accuracy (25%)
    const totalDecisions = this.metrics.decisionsCorrect + this.metrics.decisionsIncorrect;
    if (totalDecisions > 0) {
      const decisionAccuracy = this.metrics.decisionsCorrect / totalDecisions;
      score += decisionAccuracy * 0.25;
      weight += 0.25;
    }

    // Error rate (20%, inverted)
    if (this.metrics.responseCount > 0) {
      const errorRate = this.metrics.totalErrors / this.metrics.responseCount;
      const errorScore = Math.max(0, 1 - errorRate);
      score += errorScore * 0.2;
      weight += 0.2;
    }

    // User sentiment (15%)
    const totalInteractions = this.metrics.positiveInteractions + this.metrics.negativeInteractions + this.metrics.neutralInteractions;
    if (totalInteractions > 0) {
      const sentimentScore = (this.metrics.positiveInteractions + 0.5 * this.metrics.neutralInteractions) / totalInteractions;
      score += sentimentScore * 0.15;
      weight += 0.15;
    }

    // Response time (10%, inverted)
    if (this.metrics.avgResponseTime > 0) {
      const timeScore = Math.max(0, 1 - (this.metrics.avgResponseTime / 10000)); // 10s = worst
      score += timeScore * 0.1;
      weight += 0.1;
    }

    return weight > 0 ? score / weight : 0.5;
  }

  /**
   * Start periodic reflection
   */
  startPeriodicReflection() {
    // Check every 10 interactions
    // (actual reflection happens every reflectionInterval)
    this.reflectionCheckInterval = setInterval(() => {
      this.checkReflectionTrigger();
    }, 60000); // Check every minute
  }

  /**
   * Check if reflection should be triggered
   */
  checkReflectionTrigger() {
    const totalInteractions = this.metrics.recommendationsTotal + this.metrics.responseCount;

    // Trigger reflection every N interactions
    if (totalInteractions > 0 && totalInteractions % this.config.reflectionInterval === 0) {
      console.log('⏰ Reflection interval reached, performing reflection...');
      this.performReflection();
    }

    // Also trigger on critical issues
    if (this.issues.filter(i => i.severity === 'high').length > 3) {
      console.log('🚨 Critical issues detected, performing emergency reflection...');
      this.performReflection();
    }
  }

  /**
   * 🛠️ UTILITIES
   */

  /**
   * Store event for analysis
   */
  storeEvent(type, data) {
    // Events are stored in memory for analysis
    // Could be persisted to IndexedDB for long-term analysis
    if (!this._events) {
      this._events = [];
    }

    this._events.push({
      type,
      data,
      timestamp: Date.now()
    });

    // Keep last 1000 events in memory
    if (this._events.length > 1000) {
      this._events = this._events.slice(-1000);
    }
  }

  /**
   * Get recent events of a type
   */
  getRecentEvents(type, limit = 100) {
    if (!this._events) return [];

    return this._events
      .filter(e => e.type === type)
      .slice(-limit)
      .map(e => e.data);
  }

  /**
   * Cluster events by time windows
   */
  clusterByTime(events, windowMs) {
    if (events.length === 0) return [];

    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
    const clusters = [];
    let currentCluster = {
      start: sorted[0].timestamp,
      end: sorted[0].timestamp + windowMs,
      events: [sorted[0]]
    };

    for (let i = 1; i < sorted.length; i++) {
      const event = sorted[i];

      if (event.timestamp <= currentCluster.end) {
        currentCluster.events.push(event);
      } else {
        clusters.push(currentCluster);
        currentCluster = {
          start: event.timestamp,
          end: event.timestamp + windowMs,
          events: [event]
        };
      }
    }

    clusters.push(currentCluster);

    return clusters;
  }

  /**
   * Update module quality score
   */
  updateModuleScore(module, outcome) {
    if (!(module in this.moduleScores)) {
      this.moduleScores[module] = 0.5;
    }

    // Exponential moving average
    const alpha = 0.1;
    this.moduleScores[module] = (1 - alpha) * this.moduleScores[module] + alpha * outcome;
  }

  /**
   * Record an issue
   */
  recordIssue(issue) {
    this.issues.push(issue);

    // Keep last 100 issues
    if (this.issues.length > 100) {
      this.issues = this.issues.slice(-100);
    }

    console.log(`⚠️ Issue recorded: ${issue.description}`);
  }

  /**
   * 💾 PERSISTENCE
   */

  async loadReflectionData() {
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('self_reflection_data');

      if (stored) {
        this.metrics = stored.metrics || this.metrics;
        this.reflections = stored.reflections || [];
        this.moduleScores = stored.moduleScores || this.moduleScores;
        this.corrections = stored.corrections || [];
        this._events = stored.events || [];

        console.log('💾 Loaded reflection data');
      }
    }
  }

  async saveReflectionData() {
    if (window.MLStorage) {
      await window.MLStorage.set('self_reflection_data', {
        metrics: this.metrics,
        reflections: this.reflections.slice(-50), // Last 50
        moduleScores: this.moduleScores,
        corrections: this.corrections.slice(-100), // Last 100
        events: this._events?.slice(-1000), // Last 1000
        lastUpdate: Date.now()
      });
    }
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    const qualityScore = this.calculateOverallQuality();
    const acceptanceRate = this.metrics.recommendationsTotal > 0
      ? this.metrics.recommendationsAccepted / this.metrics.recommendationsTotal
      : 0;

    return {
      qualityScore,
      acceptanceRate,
      totalReflections: this.reflections.length,
      totalCorrections: this.corrections.length,
      activeIssues: this.issues.filter(i => i.severity === 'high').length,
      ...this.metrics,
      moduleScores: this.moduleScores
    };
  }

  /**
   * Get latest reflection
   */
  getLatestReflection() {
    return this.reflections[this.reflections.length - 1] || null;
  }

  /**
   * Get improvement suggestions
   */
  getImprovements() {
    return this.improvements;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.SelfReflectionEngine = new SelfReflectionEngine();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.SelfReflectionEngine.initialize();
    });
  } else {
    window.SelfReflectionEngine.initialize();
  }

  console.log('🪞 Self-Reflection Engine loaded!');
}
