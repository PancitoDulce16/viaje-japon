/**
 * 🧠 PREDICTOR DE PREFERENCIAS ML (#11)
 * ========================================
 *
 * Sistema de Machine Learning básico que predice qué le gustará al usuario
 * ANTES de que lo haga, usando análisis de patrones históricos.
 *
 * Características:
 * - Análisis de patrones de comportamiento
 * - Matriz de confianza por categorías
 * - Predicción de actividades favoritas
 * - Auto-ajuste de recomendaciones
 * - No requiere APIs externas
 */

class PreferencePredictor {
  constructor() {
    this.STORAGE_KEY = 'ml_preference_predictor';
    this.MIN_ACTIONS_FOR_PREDICTION = 5; // Mínimo de acciones para hacer predicciones confiables
    this.model = this.loadModel();
  }

  /**
   * 📊 Carga el modelo de ML desde localStorage
   */
  loadModel() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('No se pudo cargar el modelo ML:', e);
    }

    // Modelo inicial vacío
    return {
      categoryConfidence: {},      // { temples: 0.8, museums: 0.3, nightlife: 0.1 }
      interestConfidence: {},       // { culture: 0.9, food: 0.8, technology: 0.5 }
      activitySuccess: {},          // { 'Senso-ji': 0.95, 'Akihabara': 0.6 }
      totalActions: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 💾 Guarda el modelo en localStorage
   */
  saveModel() {
    try {
      this.model.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.model));
    } catch (e) {
      console.error('Error guardando modelo ML:', e);
    }
  }

  /**
   * 🎯 Entrena el modelo con una acción del usuario
   * @param {string} action - 'completed', 'skipped', 'removed', 'added', 'rated'
   * @param {Object} activity - Datos de la actividad
   * @param {Object} metadata - { rating: 1-5, actualDuration: minutes }
   */
  train(action, activity, metadata = {}) {
    this.model.totalActions++;

    const { category, interests = [], name } = activity;
    const rating = metadata.rating || 0;

    // 1️⃣ Actualizar confianza de categorías
    if (category) {
      if (!this.model.categoryConfidence[category]) {
        this.model.categoryConfidence[category] = {
          completed: 0,
          skipped: 0,
          total: 0,
          confidence: 0.5 // Neutral al inicio
        };
      }

      const cat = this.model.categoryConfidence[category];
      cat.total++;

      if (action === 'completed' || action === 'added') {
        cat.completed++;
      } else if (action === 'skipped' || action === 'removed') {
        cat.skipped++;
      }

      // Calcular confianza: completed / total
      cat.confidence = cat.completed / cat.total;

      // Boost si tiene rating alto
      if (rating >= 4) {
        cat.confidence = Math.min(1.0, cat.confidence + 0.1);
      }
    }

    // 2️⃣ Actualizar confianza de intereses
    interests.forEach(interest => {
      if (!this.model.interestConfidence[interest]) {
        this.model.interestConfidence[interest] = {
          completed: 0,
          skipped: 0,
          total: 0,
          confidence: 0.5
        };
      }

      const int = this.model.interestConfidence[interest];
      int.total++;

      if (action === 'completed' || action === 'added') {
        int.completed++;
      } else if (action === 'skipped' || action === 'removed') {
        int.skipped++;
      }

      int.confidence = int.completed / int.total;

      if (rating >= 4) {
        int.confidence = Math.min(1.0, int.confidence + 0.1);
      }
    });

    // 3️⃣ Actualizar éxito de actividad específica
    if (name) {
      if (!this.model.activitySuccess[name]) {
        this.model.activitySuccess[name] = {
          completed: 0,
          skipped: 0,
          ratings: [],
          avgRating: 0,
          confidence: 0.5
        };
      }

      const act = this.model.activitySuccess[name];

      if (action === 'completed') {
        act.completed++;
      } else if (action === 'skipped') {
        act.skipped++;
      }

      if (rating > 0) {
        act.ratings.push(rating);
        act.avgRating = act.ratings.reduce((a, b) => a + b, 0) / act.ratings.length;
        act.confidence = act.avgRating / 5; // Normalizar a 0-1
      } else {
        act.confidence = act.completed / (act.completed + act.skipped);
      }
    }

    this.saveModel();
    console.log('🧠 Modelo ML actualizado:', this.model);
  }

  /**
   * 🔮 Predice qué tan probable es que al usuario le guste una actividad
   * @param {Object} activity - Actividad a evaluar
   * @returns {Object} { confidence: 0-1, reasons: [], recommendation: string }
   */
  predict(activity) {
    const { category, interests = [], name } = activity;

    // Si no hay suficientes datos, retornar neutral
    if (this.model.totalActions < this.MIN_ACTIONS_FOR_PREDICTION) {
      return {
        confidence: 0.5,
        reasons: ['Aún no hay suficientes datos para hacer una predicción confiable'],
        recommendation: 'neutral',
        canPredict: false
      };
    }

    let totalConfidence = 0;
    let factorCount = 0;
    const reasons = [];

    // 1️⃣ Confianza de categoría
    if (category && this.model.categoryConfidence[category]) {
      const catConf = this.model.categoryConfidence[category].confidence;
      totalConfidence += catConf;
      factorCount++;

      if (catConf >= 0.7) {
        reasons.push(`✅ Te encantan las actividades de ${category} (${Math.round(catConf * 100)}% confianza)`);
      } else if (catConf <= 0.3) {
        reasons.push(`⚠️ Históricamente no te gustan mucho las actividades de ${category} (${Math.round(catConf * 100)}% confianza)`);
      }
    }

    // 2️⃣ Confianza de intereses
    let interestScore = 0;
    let interestCount = 0;
    interests.forEach(interest => {
      if (this.model.interestConfidence[interest]) {
        const intConf = this.model.interestConfidence[interest].confidence;
        interestScore += intConf;
        interestCount++;

        if (intConf >= 0.8) {
          reasons.push(`💚 Incluye "${interest}" que te encanta (${Math.round(intConf * 100)}% confianza)`);
        }
      }
    });

    if (interestCount > 0) {
      totalConfidence += interestScore / interestCount;
      factorCount++;
    }

    // 3️⃣ Confianza de actividad específica (si ya la visitaste antes)
    if (name && this.model.activitySuccess[name]) {
      const actConf = this.model.activitySuccess[name];
      totalConfidence += actConf.confidence;
      factorCount++;

      if (actConf.avgRating > 0) {
        reasons.push(`⭐ Rating anterior: ${actConf.avgRating.toFixed(1)}/5`);
      }
    }

    // 📊 Calcular confianza promedio
    const finalConfidence = factorCount > 0 ? totalConfidence / factorCount : 0.5;

    // 🎯 Generar recomendación
    let recommendation = 'neutral';
    if (finalConfidence >= 0.75) {
      recommendation = 'highly_recommended';
    } else if (finalConfidence >= 0.6) {
      recommendation = 'recommended';
    } else if (finalConfidence <= 0.3) {
      recommendation = 'not_recommended';
    } else if (finalConfidence <= 0.45) {
      recommendation = 'maybe';
    }

    return {
      confidence: finalConfidence,
      reasons,
      recommendation,
      canPredict: true
    };
  }

  /**
   * 📋 Obtiene las categorías top del usuario
   * @param {number} limit - Número de categorías a retornar
   * @returns {Array} [{ category: 'temples', confidence: 0.9, count: 10 }]
   */
  getTopCategories(limit = 5) {
    return Object.entries(this.model.categoryConfidence)
      .map(([category, data]) => ({
        category,
        confidence: data.confidence,
        count: data.completed
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * 📋 Obtiene los intereses top del usuario
   * @param {number} limit - Número de intereses a retornar
   * @returns {Array} [{ interest: 'culture', confidence: 0.95, count: 15 }]
   */
  getTopInterests(limit = 5) {
    return Object.entries(this.model.interestConfidence)
      .map(([interest, data]) => ({
        interest,
        confidence: data.confidence,
        count: data.completed
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * 🎯 Score de una lista de actividades basado en predicciones
   * @param {Array} activities - Lista de actividades a evaluar
   * @returns {Array} Actividades ordenadas por score predicho
   */
  scoreActivities(activities) {
    return activities
      .map(activity => {
        const prediction = this.predict(activity);
        return {
          ...activity,
          mlScore: prediction.confidence,
          mlRecommendation: prediction.recommendation,
          mlReasons: prediction.reasons
        };
      })
      .sort((a, b) => b.mlScore - a.mlScore);
  }

  /**
   * 📊 Genera un reporte de insights del usuario
   * @returns {Object} Reporte completo de preferencias
   */
  generateInsights() {
    const topCategories = this.getTopCategories(3);
    const topInterests = this.getTopInterests(5);

    const insights = {
      totalActions: this.model.totalActions,
      canPredict: this.model.totalActions >= this.MIN_ACTIONS_FOR_PREDICTION,
      topCategories,
      topInterests,
      suggestions: []
    };

    // Generar sugerencias personalizadas
    if (topCategories.length > 0 && topCategories[0].confidence >= 0.7) {
      insights.suggestions.push(
        `💡 Te encantan las actividades de ${topCategories[0].category}. Te recomendamos incluir más en tu próximo itinerario.`
      );
    }

    if (topInterests.length > 0) {
      insights.suggestions.push(
        `🎯 Tus intereses principales: ${topInterests.map(i => i.interest).join(', ')}`
      );
    }

    // Detectar categorías evitadas
    const avoided = Object.entries(this.model.categoryConfidence)
      .filter(([_, data]) => data.confidence <= 0.3 && data.total >= 3)
      .map(([cat, _]) => cat);

    if (avoided.length > 0) {
      insights.suggestions.push(
        `⚠️ Evitas: ${avoided.join(', ')}. Los próximos itinerarios reducirán estas actividades.`
      );
    }

    return insights;
  }

  /**
   * 🔄 Resetear modelo (útil para testing o empezar de cero)
   */
  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.model = this.loadModel();
    console.log('🔄 Modelo ML reseteado');
  }
}

// 🌐 Exportar para uso global
if (typeof window !== 'undefined') {
  window.PreferencePredictor = PreferencePredictor;
}
