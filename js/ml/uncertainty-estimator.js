/**
 * 🎲 UNCERTAINTY ESTIMATOR - FASE 2.5
 * ====================================
 *
 * Estima la confianza e incertidumbre en las predicciones de la IA.
 *
 * "Una IA que sabe cuando NO sabe" - Critical for trustworthy AI
 *
 * Técnicas:
 * - Monte Carlo Dropout (simulado)
 * - Bootstrap Sampling
 * - Ensemble Variance
 * - Bayesian Confidence Intervals
 * - Prediction Intervals
 * - Epistemic vs Aleatoric Uncertainty
 *
 * Aplicaciones:
 * - Confianza en recomendaciones de actividades
 * - Incertidumbre en predicción de fatiga
 * - Fiabilidad de presupuesto estimado
 * - Riesgo en decisiones de itinerario
 */

class UncertaintyEstimator {
  constructor() {
    this.initialized = false;
    this.uncertaintyHistory = [];
    this.confidenceThresholds = {
      high: 0.85,
      medium: 0.65,
      low: 0.45
    };

    console.log('🎲 Uncertainty Estimator initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    this.initialized = true;
    console.log('✅ Uncertainty Estimator initialized');
  }

  // ============================================
  // 🎯 PREDICTION UNCERTAINTY
  // ============================================

  /**
   * Estimate uncertainty for a single prediction
   */
  estimatePredictionUncertainty(prediction, context = {}) {
    const uncertainties = {};

    // 1. Data sufficiency uncertainty
    uncertainties.dataSufficiency = this.estimateDataSufficiency(context);

    // 2. Model uncertainty (epistemic)
    uncertainties.modelUncertainty = this.estimateModelUncertainty(prediction, context);

    // 3. Inherent randomness (aleatoric)
    uncertainties.aleatoricUncertainty = this.estimateAleatoricUncertainty(prediction, context);

    // 4. Context uncertainty
    uncertainties.contextUncertainty = this.estimateContextUncertainty(context);

    // Combined uncertainty
    const totalUncertainty = this.combineUncertainties(uncertainties);

    return {
      confidence: (1 - totalUncertainty).toFixed(3),
      uncertainty: totalUncertainty.toFixed(3),
      breakdown: uncertainties,
      level: this.getConfidenceLevel(1 - totalUncertainty),
      interpretation: this.interpretUncertainty(totalUncertainty),
      recommendation: this.generateUncertaintyRecommendation(totalUncertainty)
    };
  }

  /**
   * Data sufficiency - do we have enough data?
   */
  estimateDataSufficiency(context) {
    const { historicalDataPoints = 0, requiredMinimum = 10 } = context;

    if (historicalDataPoints === 0) {
      return {
        uncertainty: 0.8,
        reason: 'No historical data available'
      };
    }

    if (historicalDataPoints < requiredMinimum) {
      const ratio = historicalDataPoints / requiredMinimum;
      return {
        uncertainty: 0.6 * (1 - ratio),
        reason: `Limited data: ${historicalDataPoints}/${requiredMinimum} required`
      };
    }

    return {
      uncertainty: 0.1,
      reason: 'Sufficient historical data'
    };
  }

  /**
   * Model uncertainty (epistemic) - uncertainty due to model limitations
   */
  estimateModelUncertainty(prediction, context) {
    let uncertainty = 0.2; // Base model uncertainty

    // If prediction is at extremes, more uncertain
    if (typeof prediction === 'number') {
      if (prediction > 0.9 || prediction < 0.1) {
        uncertainty += 0.15;
      }
    }

    // Complex contexts increase uncertainty
    const complexity = context.complexity || 'simple';
    const complexityFactors = {
      simple: 0,
      moderate: 0.1,
      complex: 0.25,
      very_complex: 0.4
    };

    uncertainty += complexityFactors[complexity] || 0;

    return {
      uncertainty: Math.min(uncertainty, 0.8),
      reason: `Model uncertainty for ${complexity} context`
    };
  }

  /**
   * Aleatoric uncertainty - inherent randomness
   */
  estimateAleatoricUncertainty(prediction, context) {
    // Human behavior is inherently unpredictable
    let baseUncertainty = 0.15;

    // Increase for behavioral predictions
    if (context.predictionType === 'behavior') {
      baseUncertainty = 0.25;
    }

    // Decrease for deterministic predictions (budget math)
    if (context.predictionType === 'calculation') {
      baseUncertainty = 0.05;
    }

    return {
      uncertainty: baseUncertainty,
      reason: 'Inherent randomness in human behavior'
    };
  }

  /**
   * Context uncertainty - how well do we understand the context?
   */
  estimateContextUncertainty(context) {
    let uncertainty = 0.1;

    // Missing context information
    const requiredFields = ['userProfile', 'historicalData', 'currentState'];
    const missingFields = requiredFields.filter(field => !context[field]);

    uncertainty += missingFields.length * 0.15;

    return {
      uncertainty: Math.min(uncertainty, 0.7),
      reason: missingFields.length > 0 ?
        `Missing context: ${missingFields.join(', ')}` :
        'Complete context available'
    };
  }

  combineUncertainties(uncertainties) {
    // Combine using quadratic mean (RMS) to emphasize larger uncertainties
    const values = Object.values(uncertainties).map(u => u.uncertainty);
    const sumSquares = values.reduce((sum, val) => sum + val * val, 0);
    const combined = Math.sqrt(sumSquares / values.length);

    return Math.min(combined, 0.95); // Cap at 95% uncertainty
  }

  getConfidenceLevel(confidence) {
    if (confidence >= this.confidenceThresholds.high) return 'high';
    if (confidence >= this.confidenceThresholds.medium) return 'medium';
    if (confidence >= this.confidenceThresholds.low) return 'low';
    return 'very_low';
  }

  interpretUncertainty(uncertainty) {
    if (uncertainty < 0.15) {
      return 'Very confident in this prediction';
    } else if (uncertainty < 0.35) {
      return 'Reasonably confident in this prediction';
    } else if (uncertainty < 0.55) {
      return 'Moderate uncertainty - use with caution';
    } else if (uncertainty < 0.75) {
      return 'High uncertainty - prediction may be unreliable';
    } else {
      return 'Very high uncertainty - insufficient data for reliable prediction';
    }
  }

  generateUncertaintyRecommendation(uncertainty) {
    if (uncertainty < 0.2) {
      return 'Safe to rely on this prediction';
    } else if (uncertainty < 0.4) {
      return 'Use prediction but consider alternatives';
    } else if (uncertainty < 0.6) {
      return 'Gather more data before relying on prediction';
    } else {
      return 'Do not rely on this prediction - collect more data first';
    }
  }

  // ============================================
  // 📊 BOOTSTRAP CONFIDENCE INTERVALS
  // ============================================

  /**
   * Bootstrap sampling to estimate prediction intervals
   */
  bootstrapConfidenceInterval(data, estimator, numSamples = 1000, confidenceLevel = 0.95) {
    if (data.length < 5) {
      return {
        error: 'Insufficient data for bootstrap',
        minRequired: 5
      };
    }

    const bootstrapEstimates = [];

    for (let i = 0; i < numSamples; i++) {
      // Resample with replacement
      const sample = this.resampleWithReplacement(data);

      // Apply estimator function
      const estimate = estimator(sample);
      bootstrapEstimates.push(estimate);
    }

    // Sort estimates
    bootstrapEstimates.sort((a, b) => a - b);

    // Calculate confidence interval
    const alpha = 1 - confidenceLevel;
    const lowerIndex = Math.floor(numSamples * (alpha / 2));
    const upperIndex = Math.ceil(numSamples * (1 - alpha / 2)) - 1;

    const lowerBound = bootstrapEstimates[lowerIndex];
    const upperBound = bootstrapEstimates[upperIndex];
    const median = bootstrapEstimates[Math.floor(numSamples / 2)];

    // Uncertainty = interval width
    const intervalWidth = upperBound - lowerBound;
    const relativeUncertainty = median !== 0 ? intervalWidth / Math.abs(median) : 1;

    return {
      estimate: median,
      confidenceInterval: {
        lower: lowerBound,
        upper: upperBound,
        level: confidenceLevel
      },
      uncertainty: relativeUncertainty,
      standardError: this.calculateStandardError(bootstrapEstimates),
      distribution: {
        mean: bootstrapEstimates.reduce((a, b) => a + b, 0) / numSamples,
        min: bootstrapEstimates[0],
        max: bootstrapEstimates[numSamples - 1]
      }
    };
  }

  resampleWithReplacement(data) {
    const sample = [];
    for (let i = 0; i < data.length; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      sample.push(data[randomIndex]);
    }
    return sample;
  }

  calculateStandardError(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // ============================================
  // 🎲 MONTE CARLO SIMULATION
  // ============================================

  /**
   * Monte Carlo simulation for uncertainty estimation
   */
  monteCarloSimulation(predictorFunction, inputDistributions, numSimulations = 1000) {
    const results = [];

    for (let i = 0; i < numSimulations; i++) {
      // Sample from input distributions
      const sampledInputs = {};

      Object.keys(inputDistributions).forEach(key => {
        const dist = inputDistributions[key];
        sampledInputs[key] = this.sampleFromDistribution(dist);
      });

      // Run prediction
      const result = predictorFunction(sampledInputs);
      results.push(result);
    }

    // Analyze results
    const sorted = [...results].sort((a, b) => a - b);
    const mean = results.reduce((a, b) => a + b, 0) / numSimulations;
    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numSimulations;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      median: sorted[Math.floor(numSimulations / 2)],
      stdDev,
      variance,
      min: sorted[0],
      max: sorted[numSimulations - 1],
      percentiles: {
        p5: sorted[Math.floor(numSimulations * 0.05)],
        p25: sorted[Math.floor(numSimulations * 0.25)],
        p50: sorted[Math.floor(numSimulations * 0.50)],
        p75: sorted[Math.floor(numSimulations * 0.75)],
        p95: sorted[Math.floor(numSimulations * 0.95)]
      },
      uncertainty: stdDev / Math.abs(mean) || 0,
      confidenceInterval: {
        lower: sorted[Math.floor(numSimulations * 0.025)],
        upper: sorted[Math.floor(numSimulations * 0.975)],
        level: 0.95
      }
    };
  }

  sampleFromDistribution(distribution) {
    const { type, params } = distribution;

    switch (type) {
      case 'normal':
        return this.sampleNormal(params.mean, params.stdDev);

      case 'uniform':
        return this.sampleUniform(params.min, params.max);

      case 'triangular':
        return this.sampleTriangular(params.min, params.mode, params.max);

      default:
        return params.mean || 0;
    }
  }

  sampleNormal(mean, stdDev) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
  }

  sampleUniform(min, max) {
    return min + Math.random() * (max - min);
  }

  sampleTriangular(min, mode, max) {
    const u = Math.random();
    const f = (mode - min) / (max - min);

    if (u < f) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }

  // ============================================
  // 🎯 ENSEMBLE UNCERTAINTY
  // ============================================

  /**
   * Estimate uncertainty using ensemble of predictions
   */
  ensembleUncertainty(predictions) {
    if (predictions.length < 2) {
      return {
        error: 'Need at least 2 predictions for ensemble',
        uncertainty: 1.0
      };
    }

    // Calculate ensemble statistics
    const mean = predictions.reduce((a, b) => a + b, 0) / predictions.length;
    const variance = predictions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / predictions.length;
    const stdDev = Math.sqrt(variance);

    // Disagreement between models = uncertainty
    const coefficientOfVariation = stdDev / Math.abs(mean) || 0;

    // Range of predictions
    const min = Math.min(...predictions);
    const max = Math.max(...predictions);
    const range = max - min;

    return {
      ensembleMean: mean,
      ensembleStdDev: stdDev,
      ensembleVariance: variance,
      range,
      coefficientOfVariation,
      uncertainty: Math.min(coefficientOfVariation, 1.0),
      confidence: Math.max(0, 1 - coefficientOfVariation),
      interpretation: coefficientOfVariation < 0.1 ?
        'Models agree strongly' :
        coefficientOfVariation < 0.3 ?
        'Models moderately agree' :
        'Models disagree significantly'
    };
  }

  // ============================================
  // 🎓 CALIBRATION & RELIABILITY
  // ============================================

  /**
   * Evaluate if confidence estimates are well-calibrated
   */
  evaluateCalibration(predictions) {
    // predictions = array of { confidence, wasCorrect (boolean) }

    if (predictions.length < 20) {
      return {
        error: 'Need at least 20 predictions for calibration analysis',
        recommendation: 'Collect more prediction-outcome pairs'
      };
    }

    // Group predictions by confidence bins
    const bins = [
      { min: 0.0, max: 0.2, label: '0-20%' },
      { min: 0.2, max: 0.4, label: '20-40%' },
      { min: 0.4, max: 0.6, label: '40-60%' },
      { min: 0.6, max: 0.8, label: '60-80%' },
      { min: 0.8, max: 1.0, label: '80-100%' }
    ];

    const binData = bins.map(bin => {
      const inBin = predictions.filter(p =>
        p.confidence >= bin.min && p.confidence < bin.max
      );

      const accuracy = inBin.length > 0 ?
        inBin.filter(p => p.wasCorrect).length / inBin.length :
        null;

      const avgConfidence = inBin.length > 0 ?
        inBin.reduce((sum, p) => sum + p.confidence, 0) / inBin.length :
        null;

      return {
        ...bin,
        count: inBin.length,
        accuracy,
        avgConfidence,
        calibrationError: accuracy !== null && avgConfidence !== null ?
          Math.abs(avgConfidence - accuracy) :
          null
      };
    });

    // Expected Calibration Error (ECE)
    const totalPredictions = predictions.length;
    const ece = binData.reduce((sum, bin) => {
      if (bin.calibrationError === null) return sum;
      const weight = bin.count / totalPredictions;
      return sum + weight * bin.calibrationError;
    }, 0);

    return {
      expectedCalibrationError: ece.toFixed(4),
      binData,
      isWellCalibrated: ece < 0.1,
      interpretation: ece < 0.05 ?
        'Excellent calibration' :
        ece < 0.1 ?
        'Good calibration' :
        ece < 0.2 ?
        'Fair calibration - needs improvement' :
        'Poor calibration - confidence estimates unreliable',
      recommendation: ece > 0.1 ?
        'Recalibrate confidence estimates using temperature scaling' :
        'Confidence estimates are reliable'
    };
  }

  // ============================================
  // 🎯 SPECIALIZED UNCERTAINTY ESTIMATORS
  // ============================================

  /**
   * Fatigue prediction uncertainty
   */
  estimateFatigueUncertainty(fatigePrediction, context) {
    const { historicalAccuracy = 0.7, userProfile, dayNumber } = context;

    let baseUncertainty = 0.25;

    // New users = higher uncertainty
    if (!userProfile || !userProfile.historicalData) {
      baseUncertainty = 0.5;
    }

    // Later in trip = higher uncertainty (accumulating factors)
    if (dayNumber > 7) {
      baseUncertainty += 0.1;
    }

    // Adjust by historical accuracy
    const accuracyFactor = 1 - historicalAccuracy;
    const totalUncertainty = baseUncertainty + accuracyFactor * 0.3;

    return {
      confidence: (1 - totalUncertainty).toFixed(2),
      uncertainty: totalUncertainty.toFixed(2),
      factors: {
        baseUncertainty,
        historicalAccuracy,
        dayNumberFactor: dayNumber > 7 ? 0.1 : 0
      },
      predictionInterval: {
        lower: Math.max(0, fatigePrediction - fatigePrediction * totalUncertainty),
        upper: Math.min(100, fatigePrediction + fatigePrediction * totalUncertainty)
      }
    };
  }

  /**
   * Budget prediction uncertainty
   */
  estimateBudgetUncertainty(budgetPrediction, context) {
    const { hasDetailedBreakdown = false, exchangeRateVolatility = 0.05 } = context;

    let uncertainty = 0.15; // Base budget uncertainty

    // Without detailed breakdown, more uncertain
    if (!hasDetailedBreakdown) {
      uncertainty += 0.2;
    }

    // Exchange rate adds uncertainty
    uncertainty += exchangeRateVolatility;

    return {
      confidence: (1 - uncertainty).toFixed(2),
      uncertainty: uncertainty.toFixed(2),
      predictionInterval: {
        lower: Math.round(budgetPrediction * (1 - uncertainty)),
        upper: Math.round(budgetPrediction * (1 + uncertainty))
      },
      recommendation: uncertainty > 0.3 ?
        'Add 20% buffer for unexpected expenses' :
        'Budget estimate is reliable'
    };
  }

  /**
   * Activity recommendation uncertainty
   */
  estimateRecommendationUncertainty(score, context) {
    const { userDataPoints = 0, activityPopularity = 0.5 } = context;

    let uncertainty = 0.3;

    // Less data = more uncertainty
    if (userDataPoints < 5) {
      uncertainty = 0.6;
    } else if (userDataPoints < 20) {
      uncertainty = 0.4;
    }

    // Obscure activities = more uncertain
    if (activityPopularity < 0.2) {
      uncertainty += 0.15;
    }

    return {
      confidence: (1 - uncertainty).toFixed(2),
      uncertainty: uncertainty.toFixed(2),
      recommendationStrength: this.getRecommendationStrength(score, uncertainty),
      shouldDisplay: uncertainty < 0.7 // Don't show if too uncertain
    };
  }

  getRecommendationStrength(score, uncertainty) {
    const adjustedScore = score * (1 - uncertainty);

    if (adjustedScore > 0.75) return 'strong';
    if (adjustedScore > 0.55) return 'moderate';
    if (adjustedScore > 0.35) return 'weak';
    return 'very_weak';
  }

  // ============================================
  // 📈 TRACKING & LEARNING
  // ============================================

  /**
   * Track prediction outcomes to improve uncertainty estimates
   */
  async recordPredictionOutcome(predictionId, predicted, actual, confidence) {
    const error = Math.abs(predicted - actual);
    const wasAccurate = error < Math.abs(predicted * 0.2); // Within 20%

    const record = {
      predictionId,
      predicted,
      actual,
      error,
      confidence,
      wasAccurate,
      timestamp: Date.now()
    };

    this.uncertaintyHistory.push(record);

    // Save to storage
    if (window.MLStorage) {
      await window.MLStorage.savePattern({
        type: 'uncertainty_tracking',
        data: record,
        userId: window.firebase?.auth()?.currentUser?.uid
      });
    }

    // Recalibrate if enough history
    if (this.uncertaintyHistory.length >= 50) {
      this.recalibrateConfidence();
    }
  }

  recalibrateConfidence() {
    // Analyze if confidence estimates match actual accuracy
    const calibration = this.evaluateCalibration(
      this.uncertaintyHistory.map(h => ({
        confidence: h.confidence,
        wasCorrect: h.wasAccurate
      }))
    );

    console.log('🎓 Confidence recalibration:', calibration.interpretation);

    // Store calibration results
    this.lastCalibration = calibration;
  }
}

// 🌐 Global instance
if (typeof window !== 'undefined') {
  window.UncertaintyEstimator = new UncertaintyEstimator();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.UncertaintyEstimator.initialize().catch(e => {
        console.error('Failed to initialize Uncertainty Estimator:', e);
      });
    });
  } else {
    window.UncertaintyEstimator.initialize().catch(e => {
      console.error('Failed to initialize Uncertainty Estimator:', e);
    });
  }
}

export default UncertaintyEstimator;
