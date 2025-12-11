/**
 * 🔍 FASE 14: EXPLAINABLE AI (XAI)
 * ==================================
 *
 * "La IA que explica sus decisiones"
 *
 * Sistema que hace la IA transparente y confiable:
 * 1. Explica POR QUÉ tomó una decisión
 * 2. Muestra QUÉ FACTORES influyeron
 * 3. Genera explicaciones en lenguaje natural
 * 4. Visualiza el razonamiento
 * 5. Permite cuestionar decisiones
 *
 * ARQUITECTURA:
 * - Decision Tracer: Rastrea el proceso de decisión
 * - Factor Analyzer: Identifica factores clave
 * - Natural Explainer: Convierte a lenguaje humano
 * - Counterfactual Generator: "¿Qué pasaría si...?"
 * - Confidence Explainer: Explica nivel de confianza
 *
 * TIPOS DE EXPLICACIONES:
 * 1. Feature Importance: "Recomendé X porque tiene rating 4.8"
 * 2. Counterfactual: "Si el rating fuera menor a 4.0, no lo recomendaría"
 * 3. Similar Examples: "Similar a lugares que te gustaron antes"
 * 4. Rule-based: "Regla: Si budget < ¥5000 → opciones económicas"
 * 5. Confidence: "Estoy 85% seguro porque tienes historial similar"
 *
 * EJEMPLOS DE USO:
 * Usuario: "¿Por qué recomendaste Fushimi Inari?"
 * XAI: "Te recomendé Fushimi Inari por 3 razones:
 *       1. Rating 4.7/5 (peso: 40%) - lugar muy valorado
 *       2. Categoría 'temples' (peso: 35%) - coincide con tu interés
 *       3. Distancia 8km (peso: 25%) - accesible desde tu ubicación"
 */

class ExplainableAI {
  constructor() {
    this.initialized = false;

    // Decision history - almacena todas las decisiones con su contexto
    this.decisionHistory = [];

    // Explanation templates
    this.templates = {
      recommendation: {
        short: 'Recomendé {item} porque {main_reason}.',
        detailed: 'Te recomendé {item} por {num_factors} factores principales:\n{factors}',
        confidence: 'Confianza {confidence}% basada en {evidence}.'
      },
      rejection: {
        short: 'Descarté {item} porque {main_reason}.',
        detailed: 'No incluí {item} porque:\n{factors}'
      },
      preference: {
        pattern: 'Detecté que prefieres {preference} porque {evidence}.'
      }
    };

    // Factor weights - cuánto peso tiene cada factor en decisiones
    this.factorWeights = {
      rating: 0.30,           // 30% - rating del lugar
      category_match: 0.25,   // 25% - coincide con categoría de interés
      distance: 0.15,         // 15% - distancia desde ubicación
      price: 0.10,            // 10% - precio
      popularity: 0.10,       // 10% - popularidad
      user_history: 0.10      // 10% - historial del usuario
    };

    // Explanation cache - para no regenerar explicaciones
    this.explanationCache = new Map();

    // Statistics
    this.stats = {
      explanationsGenerated: 0,
      questionsAsked: 0,
      satisfactionRate: 0
    };

    console.log('🔍 Explainable AI initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load decision history
    await this.loadHistory();

    this.initialized = true;
    console.log('✅ Explainable AI ready');
  }

  /**
   * 📝 DECISION RECORDING
   */

  /**
   * Record a decision made by the AI
   */
  recordDecision(decision) {
    const record = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: decision.type,          // 'recommendation', 'rejection', 'optimization', etc.
      item: decision.item,           // What was decided
      factors: decision.factors || {},  // Factors that influenced decision
      confidence: decision.confidence || 0.5,
      context: decision.context || {},
      outcome: null                  // Will be filled when user provides feedback
    };

    this.decisionHistory.push(record);

    // Keep last 100 decisions
    if (this.decisionHistory.length > 100) {
      this.decisionHistory = this.decisionHistory.slice(-100);
    }

    this.saveHistory();

    console.log(`📝 Recorded decision: ${record.type} for ${record.item?.name || 'unknown'}`);

    return record.id;
  }

  /**
   * Update decision outcome (user accepted/rejected)
   */
  updateDecisionOutcome(decisionId, outcome) {
    const decision = this.decisionHistory.find(d => d.id === decisionId);

    if (decision) {
      decision.outcome = outcome; // 'accepted', 'rejected', 'modified'
      decision.outcomeTimestamp = Date.now();

      this.saveHistory();

      console.log(`✅ Updated decision ${decisionId} outcome: ${outcome}`);
    }
  }

  /**
   * 💬 EXPLANATION GENERATION
   */

  /**
   * Main entry point - explain a decision
   */
  explainDecision(decisionId, detailLevel = 'medium') {
    const decision = this.decisionHistory.find(d => d.id === decisionId);

    if (!decision) {
      return {
        success: false,
        error: 'Decision not found'
      };
    }

    // Check cache
    const cacheKey = `${decisionId}_${detailLevel}`;
    if (this.explanationCache.has(cacheKey)) {
      console.log('💨 Using cached explanation');
      return this.explanationCache.get(cacheKey);
    }

    // Generate explanation
    let explanation;

    switch (detailLevel) {
      case 'short':
        explanation = this.generateShortExplanation(decision);
        break;
      case 'detailed':
        explanation = this.generateDetailedExplanation(decision);
        break;
      default:
        explanation = this.generateMediumExplanation(decision);
    }

    // Add confidence explanation
    explanation.confidence = this.explainConfidence(decision);

    // Add counterfactuals
    explanation.counterfactuals = this.generateCounterfactuals(decision);

    // Cache explanation
    this.explanationCache.set(cacheKey, explanation);

    this.stats.explanationsGenerated++;

    return explanation;
  }

  /**
   * Generate short explanation (1 sentence)
   */
  generateShortExplanation(decision) {
    const mainFactor = this.getMainFactor(decision.factors);

    let mainReason = 'cumple con tus preferencias';

    if (mainFactor) {
      mainReason = this.factorToHumanReason(mainFactor);
    }

    const text = this.fillTemplate(
      this.templates[decision.type].short,
      {
        item: decision.item?.name || 'este lugar',
        main_reason: mainReason
      }
    );

    return {
      level: 'short',
      text,
      mainFactor
    };
  }

  /**
   * Generate medium explanation (2-3 sentences)
   */
  generateMediumExplanation(decision) {
    const topFactors = this.getTopFactors(decision.factors, 2);

    const reasons = topFactors.map(f => this.factorToHumanReason(f)).join(' y ');

    return {
      level: 'medium',
      text: `Te recomendé ${decision.item?.name || 'esto'} porque ${reasons}.`,
      factors: topFactors
    };
  }

  /**
   * Generate detailed explanation (full breakdown)
   */
  generateDetailedExplanation(decision) {
    const allFactors = this.getTopFactors(decision.factors, 5);

    const factorLines = allFactors.map((factor, index) => {
      const weight = Math.round(factor.weight * 100);
      const reason = this.factorToHumanReason(factor);

      return `${index + 1}. ${reason} (peso: ${weight}%)`;
    }).join('\n');

    const text = this.fillTemplate(
      this.templates[decision.type].detailed,
      {
        item: decision.item?.name || 'este lugar',
        num_factors: allFactors.length,
        factors: factorLines
      }
    );

    return {
      level: 'detailed',
      text,
      factors: allFactors,
      breakdown: this.generateFactorBreakdown(decision.factors)
    };
  }

  /**
   * Explain confidence level
   */
  explainConfidence(decision) {
    const confidence = Math.round(decision.confidence * 100);

    let explanation = '';
    let evidence = [];

    // High confidence
    if (confidence >= 80) {
      explanation = `Estoy muy seguro (${confidence}%) de esta recomendación`;

      if (decision.context.userHistory?.length > 10) {
        evidence.push('tienes un historial extenso de preferencias');
      }
      if (decision.factors.rating?.value > 4.5) {
        evidence.push('el lugar tiene excelentes calificaciones');
      }
      if (decision.factors.category_match?.score > 0.9) {
        evidence.push('coincide perfectamente con tus intereses');
      }
    }
    // Medium confidence
    else if (confidence >= 50) {
      explanation = `Tengo confianza moderada (${confidence}%)`;

      evidence.push('la información disponible es limitada');

      if (decision.context.userHistory?.length < 5) {
        evidence.push('aún estoy aprendiendo tus preferencias');
      }
    }
    // Low confidence
    else {
      explanation = `Mi confianza es baja (${confidence}%)`;

      evidence.push('necesito más información');

      if (!decision.context.userHistory || decision.context.userHistory.length === 0) {
        evidence.push('no tengo historial previo');
      }
    }

    return {
      score: confidence,
      level: confidence >= 80 ? 'high' : confidence >= 50 ? 'medium' : 'low',
      text: explanation + (evidence.length > 0 ? ` porque ${evidence.join(' y ')}.` : '.'),
      evidence
    };
  }

  /**
   * 🔮 COUNTERFACTUAL EXPLANATIONS
   */

  /**
   * Generate "what if" scenarios
   */
  generateCounterfactuals(decision) {
    const counterfactuals = [];

    // Counterfactual based on rating
    if (decision.factors.rating) {
      const currentRating = decision.factors.rating.value;

      if (decision.type === 'recommendation') {
        const threshold = 4.0;
        if (currentRating >= threshold) {
          counterfactuals.push({
            condition: `Si el rating fuera menor a ${threshold}`,
            result: 'probablemente no lo recomendaría',
            factor: 'rating'
          });
        }
      }
    }

    // Counterfactual based on distance
    if (decision.factors.distance) {
      const currentDistance = decision.factors.distance.value;

      if (currentDistance < 10) {
        counterfactuals.push({
          condition: 'Si estuviera a más de 20km',
          result: 'lo consideraría menos prioritario',
          factor: 'distance'
        });
      }
    }

    // Counterfactual based on category
    if (decision.factors.category_match) {
      counterfactuals.push({
        condition: 'Si fuera de una categoría diferente',
        result: 'no aparecería en tus recomendaciones principales',
        factor: 'category'
      });
    }

    // Counterfactual based on price
    if (decision.factors.price) {
      const currentPrice = decision.factors.price.value;

      if (decision.context.budget && currentPrice < decision.context.budget * 0.5) {
        counterfactuals.push({
          condition: `Si el precio fuera mayor a ¥${decision.context.budget}`,
          result: 'lo descartaría por exceder tu presupuesto',
          factor: 'price'
        });
      }
    }

    return counterfactuals;
  }

  /**
   * 🧠 FACTOR ANALYSIS
   */

  /**
   * Get main (most influential) factor
   */
  getMainFactor(factors) {
    const sorted = Object.entries(factors)
      .map(([name, data]) => ({
        name,
        ...data,
        weight: this.factorWeights[name] || 0.1
      }))
      .sort((a, b) => (b.score * b.weight) - (a.score * a.weight));

    return sorted.length > 0 ? sorted[0] : null;
  }

  /**
   * Get top N factors
   */
  getTopFactors(factors, n = 3) {
    return Object.entries(factors)
      .map(([name, data]) => ({
        name,
        ...data,
        weight: this.factorWeights[name] || 0.1,
        effectiveScore: (data.score || 0.5) * (this.factorWeights[name] || 0.1)
      }))
      .sort((a, b) => b.effectiveScore - a.effectiveScore)
      .slice(0, n);
  }

  /**
   * Generate visual breakdown of factors
   */
  generateFactorBreakdown(factors) {
    const breakdown = [];

    for (const [name, data] of Object.entries(factors)) {
      const weight = this.factorWeights[name] || 0.1;
      const score = data.score || 0.5;

      breakdown.push({
        factor: name,
        value: data.value,
        score: Math.round(score * 100),
        weight: Math.round(weight * 100),
        contribution: Math.round(score * weight * 100),
        humanName: this.factorToHumanName(name)
      });
    }

    // Sort by contribution
    breakdown.sort((a, b) => b.contribution - a.contribution);

    return breakdown;
  }

  /**
   * 📖 HUMAN-READABLE CONVERSIONS
   */

  /**
   * Convert factor to human-readable reason
   */
  factorToHumanReason(factor) {
    const name = factor.name;
    const value = factor.value;
    const score = factor.score || 0.5;

    switch (name) {
      case 'rating':
        if (score > 0.8) {
          return `tiene una excelente calificación (${value}/5)`;
        } else if (score > 0.6) {
          return `tiene buena calificación (${value}/5)`;
        } else {
          return `tiene calificación aceptable (${value}/5)`;
        }

      case 'category_match':
        if (score > 0.9) {
          return 'coincide perfectamente con tus intereses';
        } else if (score > 0.7) {
          return 'se alinea con tus preferencias';
        } else {
          return 'es relevante para ti';
        }

      case 'distance':
        if (value < 2) {
          return 'está muy cerca de tu ubicación';
        } else if (value < 10) {
          return `está a ${Math.round(value)}km, distancia accesible`;
        } else {
          return `está a ${Math.round(value)}km`;
        }

      case 'price':
        if (score > 0.8) {
          return `tiene precio excelente (¥${value})`;
        } else if (score > 0.6) {
          return `tiene precio razonable (¥${value})`;
        } else {
          return `cuesta ¥${value}`;
        }

      case 'popularity':
        if (score > 0.8) {
          return 'es muy popular entre visitantes';
        } else {
          return 'es conocido';
        }

      case 'user_history':
        if (score > 0.8) {
          return 'es similar a lugares que amaste antes';
        } else if (score > 0.6) {
          return 'es similar a lugares que te gustaron';
        } else {
          return 'coincide con tu historial';
        }

      default:
        return `cumple con ${name}`;
    }
  }

  /**
   * Convert factor name to human name
   */
  factorToHumanName(factorName) {
    const mapping = {
      rating: 'Calificación',
      category_match: 'Coincidencia de categoría',
      distance: 'Distancia',
      price: 'Precio',
      popularity: 'Popularidad',
      user_history: 'Historial del usuario'
    };

    return mapping[factorName] || factorName;
  }

  /**
   * 🛠️ UTILITIES
   */

  /**
   * Fill template with values
   */
  fillTemplate(template, values) {
    let result = template;

    for (const [key, value] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    return result;
  }

  generateId() {
    return `xai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 💾 PERSISTENCE
   */

  async loadHistory() {
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('xai_history');

      if (stored) {
        this.decisionHistory = stored.decisionHistory || [];
        this.stats = stored.stats || this.stats;

        console.log('💾 Loaded XAI history');
      }
    }
  }

  async saveHistory() {
    if (window.MLStorage) {
      await window.MLStorage.set('xai_history', {
        decisionHistory: this.decisionHistory,
        stats: this.stats,
        lastUpdate: Date.now()
      });
    }
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      decisionsTracked: this.decisionHistory.length,
      cacheSize: this.explanationCache.size
    };
  }

  /**
   * Get recent decisions
   */
  getRecentDecisions(n = 10) {
    return this.decisionHistory.slice(-n).reverse();
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.decisionHistory = [];
    this.explanationCache.clear();
    this.saveHistory();

    console.log('🧹 XAI history cleared');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ExplainableAI = new ExplainableAI();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ExplainableAI.initialize();
    });
  } else {
    window.ExplainableAI.initialize();
  }

  console.log('🔍 Explainable AI loaded!');
}
