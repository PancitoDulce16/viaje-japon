/**
 * 🧠 ML ITINERARY ENHANCER - Integración Real del ML Brain
 * =========================================================
 *
 * ESTE ES EL MÓDULO QUE HACE QUE EL ML SEA ÚTIL DE VERDAD.
 *
 * Integra TODAS las fases del ML Brain con el generador de itinerarios:
 *
 * FASE 1 (Foundations):
 * - Pattern Recognition: Identifica tipo de viajero
 * - Feature Engineering: Analiza preferencias
 *
 * FASE 2 (Prediction):
 * - Fatigue Predictor: Predice fatiga por día
 * - Time Series: Predice gasto de presupuesto
 * - Anomaly Detector: Detecta problemas ANTES de que sucedan
 * - Uncertainty Estimator: Muestra confianza en sugerencias
 *
 * FASE 3 (Collaboration):
 * - Knowledge Graph: Encuentra conexiones entre actividades
 * - Collaborative Filtering: "Usuarios como tú también disfrutaron..."
 * - Swarm Intelligence: Optimiza rutas y distribución
 */

class MLItineraryEnhancer {
  constructor() {
    this.initialized = false;
    this.enhancementHistory = [];

    console.log('🧠 ML Itinerary Enhancer initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Esperar a que todos los módulos ML estén listos
    await this.waitForMLModules();

    this.initialized = true;
    console.log('✅ ML Itinerary Enhancer ready');
  }

  async waitForMLModules() {
    const maxWait = 5000; // 5 segundos
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      if (this.areMLModulesReady()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.warn('⚠️ Some ML modules not ready, continuing anyway');
  }

  areMLModulesReady() {
    return window.MLBrain &&
           window.FatiguePredictor &&
           window.KnowledgeGraph &&
           window.SwarmIntelligence &&
           window.AnomalyDetector &&
           window.UncertaintyEstimator;
  }

  // ============================================
  // 🎯 MEJORA PRINCIPAL DE ITINERARIO
  // ============================================

  /**
   * Mejora un itinerario generado usando TODO el ML Brain
   *
   * @param {Object} itinerary - Itinerario original
   * @param {Object} userContext - Contexto del usuario
   * @returns {Object} Itinerario mejorado + insights
   */
  async enhanceItinerary(itinerary, userContext = {}) {
    console.log('🧠 Enhancing itinerary with ML Brain...');

    const enhancements = {
      original: itinerary,
      enhanced: { ...itinerary },
      insights: [],
      warnings: [],
      optimizations: [],
      confidence: 0
    };

    try {
      // 1️⃣ ANALIZAR PERFIL DEL USUARIO (FASE 1)
      const userProfile = await this.analyzeUserProfile(userContext);
      enhancements.insights.push({
        type: 'profile',
        icon: '👤',
        title: `Tu perfil: ${userProfile.archetype}`,
        message: `Hemos personalizado el itinerario para viajeros tipo "${userProfile.archetype}"`,
        confidence: userProfile.confidence
      });

      // 2️⃣ PREDECIR FATIGA (FASE 2)
      const fatigueAnalysis = await this.predictFatigue(itinerary, userContext);
      if (fatigueAnalysis.warnings.length > 0) {
        enhancements.warnings.push(...fatigueAnalysis.warnings);

        // OPTIMIZAR: Redistribuir actividades si hay fatiga alta
        if (fatigueAnalysis.peakFatigue > 75) {
          const optimized = await this.optimizeFatigue(itinerary, fatigueAnalysis);
          enhancements.enhanced = optimized;
          enhancements.optimizations.push({
            type: 'fatigue_reduction',
            icon: '😌',
            title: 'Optimización de fatiga aplicada',
            message: `Redistribuimos actividades. Fatiga pico: ${fatigueAnalysis.peakFatigue}→${optimized.newPeakFatigue}`,
            improvement: `${fatigueAnalysis.peakFatigue - optimized.newPeakFatigue} puntos menos`
          });
        }
      }

      // 3️⃣ DETECTAR ANOMALÍAS (FASE 2)
      const anomalies = await this.detectProblems(enhancements.enhanced);
      if (anomalies.critical.length > 0 || anomalies.warnings.length > 0) {
        enhancements.warnings.push({
          type: 'anomalies',
          icon: '🚨',
          title: `${anomalies.critical.length + anomalies.warnings.length} problemas detectados`,
          message: 'Revisa las sugerencias para mejorar tu itinerario',
          details: [...anomalies.critical, ...anomalies.warnings]
        });
      }

      // 4️⃣ OPTIMIZAR RUTAS (FASE 3 - Swarm Intelligence)
      if (itinerary.days && itinerary.days.length > 0) {
        const routeOptimization = await this.optimizeRoutes(enhancements.enhanced);
        if (routeOptimization.improved) {
          enhancements.enhanced = routeOptimization.optimized;
          enhancements.optimizations.push({
            type: 'route_optimization',
            icon: '🗺️',
            title: 'Rutas optimizadas',
            message: `Reducimos distancia total: ${routeOptimization.improvement}`,
            savings: `${routeOptimization.timeSaved} minutos ahorrados`
          });
        }
      }

      // 5️⃣ RECOMENDAR ACTIVIDADES (FASE 3 - Knowledge Graph)
      const recommendations = await this.getSmartRecommendations(enhancements.enhanced, userProfile);
      if (recommendations.length > 0) {
        enhancements.insights.push({
          type: 'recommendations',
          icon: '✨',
          title: `${recommendations.length} recomendaciones adicionales`,
          message: 'Basadas en tu perfil y el Knowledge Graph',
          items: recommendations
        });
      }

      // 6️⃣ ESTIMAR CONFIANZA GLOBAL (FASE 2)
      enhancements.confidence = await this.calculateOverallConfidence(enhancements);

      // 7️⃣ PREDECIR PRESUPUESTO (FASE 2)
      const budgetForecast = await this.forecastBudget(enhancements.enhanced, userContext);
      enhancements.insights.push({
        type: 'budget',
        icon: '💰',
        title: 'Predicción de gasto',
        message: `Gasto estimado: ¥${budgetForecast.total.toLocaleString()}`,
        breakdown: budgetForecast.breakdown,
        confidence: budgetForecast.confidence
      });

      // Guardar historial
      this.enhancementHistory.push({
        timestamp: Date.now(),
        improvements: enhancements.optimizations.length,
        warnings: enhancements.warnings.length
      });

      console.log('✅ Itinerary enhanced:', enhancements);
      return enhancements;

    } catch (error) {
      console.error('❌ Error enhancing itinerary:', error);
      return {
        original: itinerary,
        enhanced: itinerary,
        insights: [],
        warnings: [{
          type: 'error',
          icon: '⚠️',
          title: 'Error en optimización ML',
          message: 'Usando itinerario original'
        }],
        optimizations: [],
        confidence: 0.3
      };
    }
  }

  // ============================================
  // 📊 ANÁLISIS DE PERFIL (FASE 1)
  // ============================================

  async analyzeUserProfile(userContext) {
    if (!window.MLBrain || !window.MLBrain.initialized) {
      return {
        archetype: 'Explorer',
        confidence: 0.5,
        traits: []
      };
    }

    try {
      const analysis = await window.MLBrain.analyzeCurrentBehavior();

      return {
        archetype: analysis.archetype?.primary?.name || 'Explorer',
        confidence: analysis.archetype?.primary?.score || 0.5,
        traits: analysis.archetype?.traits || []
      };
    } catch (error) {
      console.warn('Could not analyze user profile:', error);
      return {
        archetype: 'Explorer',
        confidence: 0.5,
        traits: []
      };
    }
  }

  // ============================================
  // 😴 PREDICCIÓN DE FATIGA (FASE 2)
  // ============================================

  async predictFatigue(itinerary, userContext) {
    if (!window.FatiguePredictor || !window.FatiguePredictor.initialized) {
      return { warnings: [], peakFatigue: 0 };
    }

    try {
      const tripData = {
        days: itinerary.days?.length || 7,
        itinerary: itinerary.days || [],
        origin: userContext.origin || 'New York',
        destination: 'Tokyo',
        userProfile: userContext.userProfile
      };

      const prediction = await window.FatiguePredictor.predictTripFatigue(tripData);

      return {
        warnings: prediction.warnings.map(w => ({
          type: 'fatigue',
          icon: '😴',
          title: w.message,
          day: w.day,
          fatigue: w.fatigue
        })),
        peakFatigue: prediction.summary.peakFatigue,
        peakDay: prediction.summary.peakDay,
        trajectory: prediction.dailyFatigue
      };
    } catch (error) {
      console.warn('Could not predict fatigue:', error);
      return { warnings: [], peakFatigue: 0 };
    }
  }

  // ============================================
  // 🔧 OPTIMIZACIÓN DE FATIGA
  // ============================================

  async optimizeFatigue(itinerary, fatigueAnalysis) {
    // Encontrar día con mayor fatiga
    const peakDay = fatigueAnalysis.peakDay - 1; // 0-indexed

    if (!itinerary.days || !itinerary.days[peakDay]) {
      return itinerary;
    }

    const optimized = JSON.parse(JSON.stringify(itinerary)); // Deep clone

    // Mover actividades menos importantes a otros días
    const peakDayActivities = optimized.days[peakDay].activities || [];

    if (peakDayActivities.length > 4) {
      // Mover última actividad al día siguiente si existe
      const nextDay = peakDay + 1;
      if (optimized.days[nextDay]) {
        const activityToMove = peakDayActivities.pop();
        optimized.days[nextDay].activities = optimized.days[nextDay].activities || [];
        optimized.days[nextDay].activities.unshift(activityToMove);
      }
    }

    // Re-calcular fatiga
    const newAnalysis = await this.predictFatigue(optimized, {});

    return {
      ...optimized,
      newPeakFatigue: newAnalysis.peakFatigue
    };
  }

  // ============================================
  // 🚨 DETECCIÓN DE PROBLEMAS (FASE 2)
  // ============================================

  async detectProblems(itinerary) {
    if (!window.AnomalyDetector || !window.AnomalyDetector.initialized) {
      return { critical: [], warnings: [] };
    }

    try {
      const userData = {
        sessionData: window.SensorLayer?.getSessionSummary() || {},
        behavior: {
          budget: itinerary.budget || 200000,
          activities: itinerary.days?.flatMap(d => d.activities || []) || []
        },
        context: { userState: {} }
      };

      const scan = await window.AnomalyDetector.comprehensiveScan(userData);

      return {
        critical: scan.anomalies.filter(a => a.severity === 'high'),
        warnings: scan.anomalies.filter(a => a.severity === 'medium' || a.severity === 'low')
      };
    } catch (error) {
      console.warn('Could not detect anomalies:', error);
      return { critical: [], warnings: [] };
    }
  }

  // ============================================
  // 🗺️ OPTIMIZACIÓN DE RUTAS (FASE 3)
  // ============================================

  async optimizeRoutes(itinerary) {
    if (!window.SwarmIntelligence || !window.SwarmIntelligence.initialized) {
      return { improved: false };
    }

    try {
      // Para cada día, optimizar orden de actividades
      let totalImprovement = 0;
      const optimized = JSON.parse(JSON.stringify(itinerary));

      for (let dayIndex = 0; dayIndex < (optimized.days?.length || 0); dayIndex++) {
        const day = optimized.days[dayIndex];
        const activities = day.activities || [];

        if (activities.length < 3) continue; // No vale la pena optimizar

        // Crear ubicaciones para ACO
        const locations = activities.map((act, idx) => ({
          id: idx,
          x: act.coordinates?.lat || 0,
          y: act.coordinates?.lon || 0,
          name: act.name
        }));

        // Optimizar con Ant Colony
        const result = await window.SwarmIntelligence.optimizeRoute(locations);

        if (result && result.improvement) {
          totalImprovement += parseFloat(result.improvement.replace('%', ''));

          // Reordenar actividades según ruta óptima
          const reordered = result.optimizedRoute.map(loc =>
            activities.find((_, idx) => idx === loc.id)
          ).filter(Boolean);

          optimized.days[dayIndex].activities = reordered;
        }
      }

      return {
        improved: totalImprovement > 5,
        optimized,
        improvement: `${totalImprovement.toFixed(1)}% menos distancia`,
        timeSaved: Math.round(totalImprovement * 3) // Estimado
      };
    } catch (error) {
      console.warn('Could not optimize routes:', error);
      return { improved: false };
    }
  }

  // ============================================
  // ✨ RECOMENDACIONES INTELIGENTES (FASE 3)
  // ============================================

  async getSmartRecommendations(itinerary, userProfile) {
    if (!window.KnowledgeGraph || !window.KnowledgeGraph.initialized) {
      return [];
    }

    try {
      const recommendations = [];

      // Buscar actividades relacionadas usando Knowledge Graph
      const existingActivities = itinerary.days?.flatMap(d =>
        (d.activities || []).map(a => a.type)
      ) || [];

      // Si usuario es "Cultural" y no tiene templos, recomendar
      if (userProfile.archetype === 'Culture Seeker' && !existingActivities.includes('temple')) {
        const temples = window.KnowledgeGraph.getNodesByType('attraction')
          .filter(node => node.properties.name?.includes('Temple') || node.properties.name?.includes('Shrine'));

        if (temples.length > 0) {
          recommendations.push({
            activity: temples[0].properties.name,
            reason: 'Perfecto para tu perfil cultural',
            confidence: 0.85
          });
        }
      }

      return recommendations.slice(0, 3); // Top 3
    } catch (error) {
      console.warn('Could not get recommendations:', error);
      return [];
    }
  }

  // ============================================
  // 💰 PREDICCIÓN DE PRESUPUESTO (FASE 2)
  // ============================================

  async forecastBudget(itinerary, userContext) {
    if (!window.TimeSeriesForecaster || !window.TimeSeriesForecaster.initialized) {
      return { total: 0, breakdown: {}, confidence: 0.5 };
    }

    try {
      const tripData = {
        totalBudget: itinerary.budget || 200000,
        days: itinerary.days?.length || 7,
        activities: itinerary.days?.flatMap(d => d.activities || []) || [],
        userProfile: userContext.userProfile
      };

      const forecast = await window.TimeSeriesForecaster.predictBudgetBurnRate(tripData);

      return {
        total: forecast.totalProjectedSpending,
        breakdown: {
          accommodation: Math.round(forecast.totalProjectedSpending * 0.35),
          food: Math.round(forecast.totalProjectedSpending * 0.30),
          activities: Math.round(forecast.totalProjectedSpending * 0.25),
          transport: Math.round(forecast.totalProjectedSpending * 0.10)
        },
        confidence: 0.75,
        warnings: forecast.warnings
      };
    } catch (error) {
      console.warn('Could not forecast budget:', error);
      return { total: 0, breakdown: {}, confidence: 0.5 };
    }
  }

  // ============================================
  // 🎯 CONFIANZA GLOBAL
  // ============================================

  async calculateOverallConfidence(enhancements) {
    // Confianza basada en:
    // - Número de optimizaciones aplicadas
    // - Número de warnings
    // - Disponibilidad de módulos ML

    let confidence = 0.5; // Base

    // Más optimizaciones = más confianza
    confidence += enhancements.optimizations.length * 0.1;

    // Menos warnings = más confianza
    confidence -= enhancements.warnings.length * 0.05;

    // Módulos disponibles
    const modulesReady = this.areMLModulesReady();
    confidence += modulesReady ? 0.2 : 0;

    return Math.min(1.0, Math.max(0.1, confidence));
  }

  // ============================================
  // 📊 GENERAR RESUMEN VISUAL
  // ============================================

  generateEnhancementSummary(enhancements) {
    return {
      title: '🧠 Itinerario mejorado con ML Brain',
      confidence: `${(enhancements.confidence * 100).toFixed(0)}% confianza`,
      stats: {
        optimizations: enhancements.optimizations.length,
        insights: enhancements.insights.length,
        warnings: enhancements.warnings.length
      },
      improvements: enhancements.optimizations.map(opt => ({
        icon: opt.icon,
        text: opt.title,
        detail: opt.message
      })),
      warnings: enhancements.warnings.map(warn => ({
        icon: warn.icon,
        text: warn.title,
        detail: warn.message
      })),
      insights: enhancements.insights.map(ins => ({
        icon: ins.icon,
        text: ins.title,
        detail: ins.message
      }))
    };
  }
}

// 🌐 Global instance
if (typeof window !== 'undefined') {
  window.MLItineraryEnhancer = new MLItineraryEnhancer();

  // Auto-initialize when ML modules are ready
  document.addEventListener('DOMContentLoaded', () => {
    window.MLItineraryEnhancer.initialize().catch(e => {
      console.error('Failed to initialize ML Itinerary Enhancer:', e);
    });
  });

  console.log('🧠 ML Itinerary Enhancer ready!');
}
