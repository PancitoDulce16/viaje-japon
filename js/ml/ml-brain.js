/**
 * 🧠 ML BRAIN - Central Intelligence Coordinator
 * ===============================================
 *
 * El cerebro central que coordina todos los módulos de ML.
 * API unificada para acceder a todas las capacidades de inteligencia artificial.
 *
 * Módulos integrados:
 * - SensorLayer (recopilación de datos)
 * - DataPipeline (procesamiento)
 * - FeatureEngineering (features avanzadas)
 * - PatternRecognition (clustering y patrones)
 * - MLStorage (almacenamiento)
 */

class MLBrain {
  constructor() {
    this.initialized = false;
    this.modules = {
      sensors: null,
      pipeline: null,
      features: null,
      patterns: null,
      storage: null
    };

    this.userProfile = null;
    this.learningEnabled = true;

    console.log('🧠 ML Brain initializing...');
  }

  /**
   * 🚀 INITIALIZE ALL MODULES
   */
  async initialize() {
    if (this.initialized) {
      console.log('✅ ML Brain already initialized');
      return;
    }

    console.log('🧠 Initializing ML modules...');

    try {
      // Los módulos ya se auto-inicializan globalmente
      this.modules.sensors = window.SensorLayer;
      this.modules.pipeline = window.DataPipeline;
      this.modules.features = window.FeatureEngineering;
      this.modules.patterns = window.PatternRecognitionEngine;
      this.modules.storage = window.MLStorage;

      // Verificar que todos estén disponibles
      const allModulesReady = Object.values(this.modules).every(m => m !== null);

      if (!allModulesReady) {
        throw new Error('Not all ML modules are available');
      }

      // Cargar perfil del usuario
      await this.loadUserProfile();

      // Setup event listeners
      this.setupEventListeners();

      // Auto-save cada 5 minutos
      this.startAutoSave();

      this.initialized = true;
      console.log('✅ ML Brain initialized successfully');

      // Emitir evento
      window.dispatchEvent(new CustomEvent('mlBrainReady'));

    } catch (error) {
      console.error('❌ Error initializing ML Brain:', error);
      throw error;
    }
  }

  /**
   * 🔔 SETUP EVENT LISTENERS
   */
  setupEventListeners() {
    // Escuchar eventos del Data Pipeline
    window.addEventListener('dataPipelineProcessed', (e) => {
      console.log('🔔 Data processed:', e.detail.count);
    });

    // Escuchar eventos del sensor layer
    window.addEventListener('sensor:high_engagement', (e) => {
      console.log('🔔 High engagement detected:', e.detail);
    });

    window.addEventListener('sensor:low_engagement', (e) => {
      console.log('🔔 Low engagement detected:', e.detail);
    });

    // Escuchar cambios de configuración
    window.addEventListener('settingsUpdated', (e) => {
      this.handleSettingsChange(e.detail);
    });
  }

  /**
   * 💾 AUTO-SAVE
   */
  startAutoSave() {
    setInterval(async () => {
      if (!this.learningEnabled) return;

      try {
        // Guardar estado actual
        await this.saveCurrentState();
      } catch (e) {
        console.warn('Error in auto-save:', e);
      }
    }, 300000); // Cada 5 minutos
  }

  async saveCurrentState() {
    const sessionSummary = this.modules.sensors.getSessionSummary();
    await this.modules.storage.saveSession(sessionSummary);

    const behavioral = this.modules.sensors.getBehavioralPatterns();
    await this.modules.storage.savePattern({
      type: 'behavioral',
      data: behavioral
    });

    console.log('💾 Current state auto-saved');
  }

  /**
   * 👤 USER PROFILE MANAGEMENT
   */
  async loadUserProfile() {
    const userId = window.firebase?.auth()?.currentUser?.uid || 'anonymous';

    // Intentar cargar de storage
    const sessions = await this.modules.storage.getUserSessions(userId, 10);
    const patterns = await this.modules.storage.getPatterns(userId);

    if (sessions.length > 0 || patterns.length > 0) {
      this.userProfile = this.buildProfileFromHistory(sessions, patterns);
    } else {
      this.userProfile = this.createDefaultProfile();
    }

    console.log('👤 User profile loaded:', this.userProfile.archetype?.primary?.name);
  }

  buildProfileFromHistory(sessions, patterns) {
    // Agregar datos de múltiples sesiones
    const aggregated = {
      totalSessions: sessions.length,
      behavioral: this.aggregateBehavioral(sessions),
      preferences: this.aggregatePreferences(sessions),
      patterns: patterns
    };

    // Clasificar usuario en arquetipo
    const archetype = this.modules.patterns.classifyUser(aggregated);

    return {
      archetype,
      aggregated,
      lastUpdated: Date.now()
    };
  }

  aggregateBehavioral(sessions) {
    if (sessions.length === 0) return {};

    const totalClicks = sessions.reduce((sum, s) => sum + (s.behavioral?.clicks?.length || 0), 0);
    const totalScrolls = sessions.reduce((sum, s) => sum + (s.behavioral?.scrolls?.length || 0), 0);
    const avgEngagement = sessions.reduce((sum, s) => sum + (s.behavioral?.engagementScore || 0), 0) / sessions.length;

    return {
      avgClickRate: totalClicks / sessions.length,
      avgScrollCount: totalScrolls / sessions.length,
      avgEngagementScore: avgEngagement
    };
  }

  aggregatePreferences(sessions) {
    // Combinar preferencias explícitas e implícitas
    const allPrefs = sessions
      .map(s => s.preferences)
      .filter(Boolean);

    if (allPrefs.length === 0) return {};

    return {
      // Aquí combinarías las preferencias
      combined: true
    };
  }

  createDefaultProfile() {
    return {
      archetype: {
        primary: {
          type: 'explorer',
          name: 'The Explorer',
          score: 0.5
        }
      },
      aggregated: {},
      lastUpdated: Date.now()
    };
  }

  /**
   * 🎯 ANALYZE USER BEHAVIOR
   */
  async analyzeCurrentBehavior() {
    const sessionData = this.modules.sensors.getSessionSummary();
    const behavioral = this.modules.sensors.getBehavioralPatterns();

    // Crear features
    const userData = {
      behavioral,
      session: sessionData,
      profile: this.userProfile
    };

    const features = this.modules.features.createAdvancedFeatures(userData);

    return {
      sessionData,
      behavioral,
      features,
      archetype: this.userProfile?.archetype
    };
  }

  /**
   * 🔮 PREDICT USER PREFERENCES
   */
  async predictPreferences(activityOptions) {
    const analysis = await this.analyzeCurrentBehavior();

    // Rankear opciones basándose en el perfil del usuario
    const ranked = activityOptions.map(activity => {
      const score = this.scoreActivity(activity, analysis);

      return {
        activity,
        score,
        reasoning: this.explainScore(activity, analysis, score)
      };
    });

    // Ordenar por score
    ranked.sort((a, b) => b.score - a.score);

    // Guardar predicción
    await this.modules.storage.savePrediction({
      input: activityOptions,
      output: ranked,
      modelId: 'preference_predictor_v1',
      features: analysis.features
    });

    return ranked;
  }

  scoreActivity(activity, analysis) {
    const archetype = analysis.archetype;
    if (!archetype) return 0.5;

    let score = 0.5; // Base score

    // Score basado en el tipo de actividad y arquetipo
    const archetypeType = archetype.primary?.type;

    if (archetypeType === 'foodie' && activity.category === 'food') {
      score += 0.3;
    } else if (archetypeType === 'cultural' && activity.category === 'culture') {
      score += 0.3;
    } else if (archetypeType === 'photographer' && activity.photoOpportunity) {
      score += 0.3;
    } else if (archetypeType === 'explorer' && activity.unique) {
      score += 0.3;
    }

    // Ajustar por budget
    if (analysis.features?.derived?.budgetCategory === 'budget' && activity.price < 5000) {
      score += 0.1;
    } else if (analysis.features?.derived?.budgetCategory === 'luxury' && activity.price > 20000) {
      score += 0.1;
    }

    // Ajustar por pace
    if (analysis.features?.basic?.paceLevel === 'intense' && activity.duration < 120) {
      score += 0.1;
    } else if (analysis.features?.basic?.paceLevel === 'relaxed' && activity.duration > 180) {
      score += 0.1;
    }

    return Math.min(1, Math.max(0, score));
  }

  explainScore(activity, analysis, score) {
    const reasons = [];

    const archetypeType = analysis.archetype?.primary?.type;
    const archetypeName = analysis.archetype?.primary?.name;

    if (archetypeType && archetypeName) {
      reasons.push(`Tu perfil es "${archetypeName}" (${Math.round(analysis.archetype.primary.score * 100)}% match)`);
    }

    if (activity.category && archetypeType) {
      if ((archetypeType === 'foodie' && activity.category === 'food') ||
          (archetypeType === 'cultural' && activity.category === 'culture')) {
        reasons.push(`Esta actividad coincide con tu interés principal`);
      }
    }

    if (score > 0.7) {
      reasons.push('Altamente recomendado para ti');
    } else if (score < 0.3) {
      reasons.push('Podría no ser de tu interés');
    }

    return reasons;
  }

  /**
   * 🔍 DETECT PATTERNS
   */
  async detectPatterns() {
    const sessions = await this.modules.storage.getUserSessions();

    if (sessions.length < 5) {
      console.log('ℹ️ No hay suficientes sesiones para detectar patrones');
      return null;
    }

    // Extract feature vectors
    const dataPoints = sessions.map(session => {
      const userData = { behavioral: session.behavioral };
      const features = this.modules.features.createAdvancedFeatures(userData);
      return this.modules.features.flattenToVector(features).vector;
    });

    // Run K-Means
    const clusters = await this.modules.patterns.kMeansClustering(dataPoints, 3);

    // Guardar clusters
    await this.modules.storage.saveClusters({
      algorithm: 'kmeans',
      clusters: clusters.clusters,
      centroids: clusters.centroids,
      k: clusters.k
    });

    console.log(`✅ Detected ${clusters.k} behavior patterns`);

    return clusters;
  }

  /**
   * 📊 GET INSIGHTS
   */
  async getInsights() {
    const analysis = await this.analyzeCurrentBehavior();
    const stats = await this.modules.storage.getStatistics();

    return {
      profile: {
        archetype: this.userProfile?.archetype,
        traits: this.userProfile?.archetype?.traits
      },
      currentSession: {
        engagement: analysis.behavioral?.engagementScore,
        clickRate: analysis.behavioral?.clickFrequency,
        decisionSpeed: analysis.behavioral?.averageDecisionTime
      },
      dataStats: stats,
      insights: this.generateInsights(analysis, stats)
    };
  }

  generateInsights(analysis, stats) {
    const insights = [];

    // Insight basado en engagement
    const engagement = analysis.behavioral?.engagementScore || 0;
    if (engagement > 80) {
      insights.push({
        type: 'positive',
        message: '¡Estás muy comprometido! Aprovecha este momento para planificar.',
        icon: '🔥'
      });
    } else if (engagement < 30) {
      insights.push({
        type: 'suggestion',
        message: 'Parece que estás distraído. ¿Quizás volver más tarde?',
        icon: '💭'
      });
    }

    // Insight basado en sesiones totales
    if (stats.sessions > 10) {
      insights.push({
        type: 'achievement',
        message: `Has planificado en ${stats.sessions} sesiones. ¡Eres un planificador dedicado!`,
        icon: '🎯'
      });
    }

    // Insight basado en arquetipo
    const archetype = this.userProfile?.archetype?.primary;
    if (archetype) {
      insights.push({
        type: 'profile',
        message: `Tu estilo de viaje es "${archetype.name}". Te recomendaremos actividades acorde.`,
        icon: '👤'
      });
    }

    return insights;
  }

  /**
   * ⚙️ HANDLE SETTINGS CHANGE
   */
  handleSettingsChange(settings) {
    console.log('⚙️ Settings changed, updating profile...');

    // Re-clasificar usuario si las preferencias cambiaron significativamente
    if (settings.travelPreferences || settings.basicInfo) {
      this.loadUserProfile();
    }
  }

  /**
   * 🧹 CLEANUP
   */
  async cleanup(days = 30) {
    const maxAge = days * 24 * 60 * 60 * 1000;
    const deleted = await this.modules.storage.cleanup(maxAge);

    console.log(`🧹 Cleanup: ${deleted} items deleted`);
    return deleted;
  }

  /**
   * 📊 GET STATUS
   */
  getStatus() {
    return {
      initialized: this.initialized,
      learningEnabled: this.learningEnabled,
      userProfile: this.userProfile,
      modules: {
        sensors: !!this.modules.sensors,
        pipeline: !!this.modules.pipeline,
        features: !!this.modules.features,
        patterns: !!this.modules.patterns,
        storage: !!this.modules.storage
      }
    };
  }

  /**
   * 🎛️ ENABLE/DISABLE LEARNING
   */
  setLearningEnabled(enabled) {
    this.learningEnabled = enabled;
    console.log(`🎛️ Learning ${enabled ? 'enabled' : 'disabled'}`);

    if (window.UserSettings) {
      window.UserSettings.updateSetting('aiConfig.learnFromBehavior', enabled);
    }
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.MLBrain = new MLBrain();

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.MLBrain.initialize().catch(e => {
        console.error('Failed to initialize ML Brain:', e);
      });
    });
  } else {
    window.MLBrain.initialize().catch(e => {
      console.error('Failed to initialize ML Brain:', e);
    });
  }
}

export default MLBrain;
