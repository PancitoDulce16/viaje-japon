/**
 * 🔮 TIME SERIES FORECASTER - FASE 2.2
 * ======================================
 *
 * Predicción de series temporales para:
 * - Fatiga del usuario a lo largo del viaje
 * - Gasto de presupuesto por día
 * - Engagement en diferentes horarios
 * - Patrones de actividad futuros
 *
 * Técnicas implementadas:
 * - Exponential Smoothing (Simple, Double, Triple/Holt-Winters)
 * - Moving Average
 * - Trend Analysis (Linear, Polynomial)
 * - Seasonal Decomposition
 * - ARIMA simplificado
 */

class TimeSeriesForecaster {
  constructor() {
    this.models = {};
    this.forecasts = new Map();
    this.initialized = false;

    console.log('🔮 Time Series Forecaster initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Cargar modelos guardados si existen
    if (window.MLStorage) {
      await this.loadSavedModels();
    }

    this.initialized = true;
    console.log('✅ Time Series Forecaster initialized');
  }

  async loadSavedModels() {
    try {
      const savedModels = await window.MLStorage.getModels();
      const tsModels = savedModels.filter(m => m.type?.startsWith('timeseries_'));

      tsModels.forEach(model => {
        this.models[model.modelId] = model;
      });

      console.log(`📥 Loaded ${tsModels.length} time series models`);
    } catch (error) {
      console.warn('Could not load saved TS models:', error);
    }
  }

  // ============================================
  // 📊 EXPONENTIAL SMOOTHING
  // ============================================

  /**
   * Simple Exponential Smoothing
   * Best for data without trend or seasonality
   */
  simpleExponentialSmoothing(timeSeries, alpha = 0.3, steps = 5) {
    if (!timeSeries || timeSeries.length < 2) {
      throw new Error('Time series must have at least 2 data points');
    }

    const smoothed = [];
    smoothed[0] = timeSeries[0];

    // Smooth historical data
    for (let t = 1; t < timeSeries.length; t++) {
      smoothed[t] = alpha * timeSeries[t] + (1 - alpha) * smoothed[t - 1];
    }

    // Forecast future values
    const forecast = [];
    const lastSmoothed = smoothed[smoothed.length - 1];

    for (let i = 0; i < steps; i++) {
      forecast.push(lastSmoothed);
    }

    return {
      method: 'simple_exponential_smoothing',
      alpha,
      smoothed,
      forecast,
      lastValue: timeSeries[timeSeries.length - 1],
      lastSmoothed
    };
  }

  /**
   * Double Exponential Smoothing (Holt's Method)
   * For data with trend but no seasonality
   */
  doubleExponentialSmoothing(timeSeries, alpha = 0.3, beta = 0.1, steps = 5) {
    if (timeSeries.length < 3) {
      throw new Error('Need at least 3 data points for double smoothing');
    }

    const level = [];
    const trend = [];

    // Initialize
    level[0] = timeSeries[0];
    trend[0] = timeSeries[1] - timeSeries[0];

    // Calculate level and trend
    for (let t = 1; t < timeSeries.length; t++) {
      level[t] = alpha * timeSeries[t] + (1 - alpha) * (level[t - 1] + trend[t - 1]);
      trend[t] = beta * (level[t] - level[t - 1]) + (1 - beta) * trend[t - 1];
    }

    // Forecast
    const forecast = [];
    const lastLevel = level[level.length - 1];
    const lastTrend = trend[trend.length - 1];

    for (let h = 1; h <= steps; h++) {
      forecast.push(lastLevel + h * lastTrend);
    }

    return {
      method: 'double_exponential_smoothing',
      alpha,
      beta,
      level,
      trend,
      forecast,
      trendDirection: lastTrend > 0 ? 'increasing' : lastTrend < 0 ? 'decreasing' : 'stable'
    };
  }

  /**
   * Triple Exponential Smoothing (Holt-Winters)
   * For data with both trend and seasonality
   */
  tripleExponentialSmoothing(timeSeries, seasonLength, alpha = 0.3, beta = 0.1, gamma = 0.1, steps = 5) {
    if (timeSeries.length < seasonLength * 2) {
      throw new Error(`Need at least ${seasonLength * 2} data points for seasonal smoothing`);
    }

    const level = [];
    const trend = [];
    const seasonal = [];

    // Initialize seasonal indices
    for (let i = 0; i < seasonLength; i++) {
      seasonal[i] = timeSeries[i] / (timeSeries.reduce((a, b) => a + b, 0) / timeSeries.length);
    }

    // Initialize level and trend
    level[0] = timeSeries[0];
    trend[0] = (timeSeries[seasonLength] - timeSeries[0]) / seasonLength;

    // Calculate components
    for (let t = 0; t < timeSeries.length; t++) {
      const seasonalIndex = t % seasonLength;

      if (t === 0) {
        level[t] = timeSeries[t];
        continue;
      }

      const prevLevel = level[t - 1];
      const prevTrend = trend[t - 1] || 0;
      const prevSeasonal = seasonal[seasonalIndex] || 1;

      level[t] = alpha * (timeSeries[t] / prevSeasonal) + (1 - alpha) * (prevLevel + prevTrend);
      trend[t] = beta * (level[t] - prevLevel) + (1 - beta) * prevTrend;
      seasonal[t] = gamma * (timeSeries[t] / level[t]) + (1 - gamma) * prevSeasonal;
    }

    // Forecast
    const forecast = [];
    const lastLevel = level[level.length - 1];
    const lastTrend = trend[trend.length - 1];

    for (let h = 1; h <= steps; h++) {
      const seasonalIndex = (timeSeries.length + h - 1) % seasonLength;
      const seasonalFactor = seasonal[seasonalIndex] || 1;
      forecast.push((lastLevel + h * lastTrend) * seasonalFactor);
    }

    return {
      method: 'triple_exponential_smoothing',
      alpha,
      beta,
      gamma,
      seasonLength,
      level,
      trend,
      seasonal,
      forecast
    };
  }

  // ============================================
  // 📈 TREND ANALYSIS
  // ============================================

  /**
   * Linear Trend Analysis
   * Fits y = mx + b
   */
  linearTrend(timeSeries) {
    const n = timeSeries.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = timeSeries;

    // Calculate means
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    // Calculate slope and intercept
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (y[i] - yMean);
      denominator += (x[i] - xMean) ** 2;
    }

    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    // Calculate R²
    const yPredicted = x.map(xi => slope * xi + intercept);
    const ssTotal = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
    const ssResidual = y.reduce((sum, yi, i) => sum + (yi - yPredicted[i]) ** 2, 0);
    const rSquared = 1 - (ssResidual / ssTotal);

    return {
      slope,
      intercept,
      rSquared,
      equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
      trendDirection: slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable',
      strength: Math.abs(rSquared) > 0.7 ? 'strong' : Math.abs(rSquared) > 0.4 ? 'moderate' : 'weak'
    };
  }

  /**
   * Polynomial Trend (degree 2)
   * Fits y = ax² + bx + c
   */
  polynomialTrend(timeSeries, degree = 2) {
    // For simplicity, implementing only degree 2 (quadratic)
    if (degree !== 2) {
      console.warn('Only degree 2 polynomial supported, falling back to linear');
      return this.linearTrend(timeSeries);
    }

    const n = timeSeries.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = timeSeries;

    // Build normal equations for quadratic fit
    // Using least squares: [X^T X] * coeffs = X^T * y
    // Where X = [1, x, x²] for each point

    let s00 = n;
    let s10 = 0, s20 = 0, s30 = 0, s40 = 0;
    let sy0 = 0, sy1 = 0, sy2 = 0;

    for (let i = 0; i < n; i++) {
      const xi = x[i];
      const yi = y[i];
      const xi2 = xi * xi;
      const xi3 = xi2 * xi;
      const xi4 = xi2 * xi2;

      s10 += xi;
      s20 += xi2;
      s30 += xi3;
      s40 += xi4;

      sy0 += yi;
      sy1 += xi * yi;
      sy2 += xi2 * yi;
    }

    // Solve 3x3 system using Gaussian elimination
    const matrix = [
      [s00, s10, s20, sy0],
      [s10, s20, s30, sy1],
      [s20, s30, s40, sy2]
    ];

    const coeffs = this.gaussianElimination(matrix);

    const [c, b, a] = coeffs;

    return {
      coefficients: { a, b, c },
      degree,
      equation: `y = ${a.toFixed(4)}x² + ${b.toFixed(4)}x + ${c.toFixed(4)}`,
      curvature: a > 0 ? 'concave_up' : a < 0 ? 'concave_down' : 'linear'
    };
  }

  gaussianElimination(matrix) {
    const n = matrix.length;

    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];

      // Make all rows below this one 0 in current column
      for (let k = i + 1; k < n; k++) {
        const factor = matrix[k][i] / matrix[i][i];
        for (let j = i; j <= n; j++) {
          matrix[k][j] -= factor * matrix[i][j];
        }
      }
    }

    // Back substitution
    const solution = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      solution[i] = matrix[i][n];
      for (let j = i + 1; j < n; j++) {
        solution[i] -= matrix[i][j] * solution[j];
      }
      solution[i] /= matrix[i][i];
    }

    return solution;
  }

  // ============================================
  // 🔄 SEASONAL DECOMPOSITION
  // ============================================

  /**
   * Decompose time series into:
   * - Trend
   * - Seasonal
   * - Residual
   */
  seasonalDecompose(timeSeries, seasonLength) {
    if (timeSeries.length < seasonLength * 2) {
      throw new Error('Need at least 2 full seasons for decomposition');
    }

    // 1. Calculate trend using moving average
    const trend = this.movingAverage(timeSeries, seasonLength);

    // 2. Detrend the series
    const detrended = timeSeries.map((val, i) => {
      return trend[i] !== null ? val - trend[i] : null;
    });

    // 3. Calculate seasonal component
    const seasonal = new Array(timeSeries.length).fill(0);
    const seasonalAverages = new Array(seasonLength).fill(0);
    const seasonalCounts = new Array(seasonLength).fill(0);

    detrended.forEach((val, i) => {
      if (val !== null) {
        const seasonIndex = i % seasonLength;
        seasonalAverages[seasonIndex] += val;
        seasonalCounts[seasonIndex]++;
      }
    });

    // Average seasonal components
    for (let i = 0; i < seasonLength; i++) {
      if (seasonalCounts[i] > 0) {
        seasonalAverages[i] /= seasonalCounts[i];
      }
    }

    // Normalize seasonal component (mean = 0)
    const seasonalMean = seasonalAverages.reduce((a, b) => a + b, 0) / seasonLength;
    const normalizedSeasonal = seasonalAverages.map(v => v - seasonalMean);

    // Apply to full series
    timeSeries.forEach((_, i) => {
      seasonal[i] = normalizedSeasonal[i % seasonLength];
    });

    // 4. Calculate residual
    const residual = timeSeries.map((val, i) => {
      if (trend[i] === null) return null;
      return val - trend[i] - seasonal[i];
    });

    return {
      original: timeSeries,
      trend,
      seasonal,
      seasonalPattern: normalizedSeasonal,
      residual,
      seasonLength
    };
  }

  /**
   * Moving Average
   */
  movingAverage(timeSeries, windowSize) {
    const result = new Array(timeSeries.length).fill(null);

    for (let i = 0; i < timeSeries.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(timeSeries.length, i + Math.ceil(windowSize / 2));

      if (end - start === windowSize) {
        const window = timeSeries.slice(start, end);
        result[i] = window.reduce((a, b) => a + b, 0) / windowSize;
      }
    }

    return result;
  }

  // ============================================
  // 🎯 SPECIALIZED FORECASTERS
  // ============================================

  /**
   * Fatigue Trajectory Predictor
   * Predicts user fatigue over course of trip
   */
  async predictFatigueTrajectory(tripData) {
    const { days, activitiesPerDay, userProfile } = tripData;

    // Base fatigue accumulation rate
    let baseFatigueRate = 15; // Points per day

    // Adjust based on user archetype
    if (userProfile?.archetype?.primary?.type === 'relaxer') {
      baseFatigueRate *= 0.7;
    } else if (userProfile?.archetype?.primary?.type === 'explorer') {
      baseFatigueRate *= 1.3;
    }

    // Generate fatigue trajectory
    const trajectory = [];
    let currentFatigue = 0;

    for (let day = 0; day < days; day++) {
      const activitiesCount = activitiesPerDay?.[day]?.length || 3;

      // Daily fatigue accumulation
      const dailyFatigue = baseFatigueRate * (activitiesCount / 3);

      // Recovery (better on days with fewer activities)
      const recovery = activitiesCount < 3 ? 10 : 5;

      currentFatigue = Math.max(0, Math.min(100, currentFatigue + dailyFatigue - recovery));

      trajectory.push({
        day: day + 1,
        fatigue: Math.round(currentFatigue),
        status: currentFatigue < 30 ? 'fresh' : currentFatigue < 60 ? 'moderate' : currentFatigue < 80 ? 'tired' : 'exhausted',
        recommendation: currentFatigue > 70 ? 'Consider rest day or light activities' : null
      });
    }

    // Use exponential smoothing to smooth the trajectory
    const fatigueValues = trajectory.map(t => t.fatigue);
    const smoothed = this.simpleExponentialSmoothing(fatigueValues, 0.4, 0);

    return {
      trajectory,
      smoothedTrajectory: smoothed.smoothed,
      peakFatigue: Math.max(...fatigueValues),
      peakDay: fatigueValues.indexOf(Math.max(...fatigueValues)) + 1,
      averageFatigue: fatigueValues.reduce((a, b) => a + b, 0) / fatigueValues.length,
      warnings: trajectory.filter(t => t.fatigue > 70).map(t => ({
        day: t.day,
        message: `High fatigue expected on day ${t.day}`
      }))
    };
  }

  /**
   * Budget Burn Rate Predictor
   * Predicts daily spending and total budget consumption
   */
  async predictBudgetBurnRate(tripData) {
    const { totalBudget, days, activities, userProfile } = tripData;

    const dailyBudget = totalBudget / days;

    // Calculate expected spending by category
    const categorizedSpending = {
      accommodation: dailyBudget * 0.35,
      food: dailyBudget * 0.30,
      activities: dailyBudget * 0.25,
      transport: dailyBudget * 0.10
    };

    // Adjust based on user type
    if (userProfile?.archetype?.primary?.type === 'foodie') {
      categorizedSpending.food *= 1.3;
      categorizedSpending.activities *= 0.9;
    } else if (userProfile?.archetype?.primary?.type === 'cultural') {
      categorizedSpending.activities *= 1.2;
      categorizedSpending.food *= 0.95;
    }

    // Generate spending trajectory
    const trajectory = [];
    let cumulativeSpending = 0;

    for (let day = 0; day < days; day++) {
      const dayActivities = activities?.filter(a => a.day === day + 1) || [];
      const activitiesCost = dayActivities.reduce((sum, a) => sum + (a.price || 0), 0);

      const daySpending = categorizedSpending.accommodation +
                         categorizedSpending.food +
                         activitiesCost +
                         categorizedSpending.transport;

      cumulativeSpending += daySpending;

      trajectory.push({
        day: day + 1,
        dailySpending: Math.round(daySpending),
        cumulativeSpending: Math.round(cumulativeSpending),
        budgetRemaining: Math.round(totalBudget - cumulativeSpending),
        percentUsed: Math.round((cumulativeSpending / totalBudget) * 100),
        onTrack: cumulativeSpending <= (totalBudget / days) * (day + 1)
      });
    }

    // Trend analysis
    const spendingValues = trajectory.map(t => t.dailySpending);
    const trend = this.linearTrend(spendingValues);

    return {
      trajectory,
      trend,
      totalProjectedSpending: Math.round(cumulativeSpending),
      budgetUtilization: Math.round((cumulativeSpending / totalBudget) * 100),
      averageDailySpending: Math.round(cumulativeSpending / days),
      warnings: trajectory.filter(t => !t.onTrack).map(t => ({
        day: t.day,
        message: `Budget overrun detected on day ${t.day}`
      }))
    };
  }

  /**
   * Engagement Pattern Predictor
   * Predicts when user is most engaged during planning
   */
  async predictEngagementPattern(historicalData) {
    if (!historicalData || historicalData.length < 7) {
      return null;
    }

    // Extract engagement by hour of day
    const hourlyEngagement = new Array(24).fill(0);
    const hourlyCounts = new Array(24).fill(0);

    historicalData.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      const engagement = session.behavioral?.engagementScore || 0;

      hourlyEngagement[hour] += engagement;
      hourlyCounts[hour]++;
    });

    // Average engagement per hour
    const avgEngagement = hourlyEngagement.map((total, hour) => {
      return hourlyCounts[hour] > 0 ? total / hourlyCounts[hour] : 0;
    });

    // Find peak hours
    const peakHour = avgEngagement.indexOf(Math.max(...avgEngagement));
    const lowHour = avgEngagement.indexOf(Math.min(...avgEngagement.filter(e => e > 0)));

    // Seasonal decomposition (24-hour cycle)
    const decomposed = this.seasonalDecompose(avgEngagement, 24);

    return {
      hourlyPattern: avgEngagement.map((eng, hour) => ({
        hour,
        engagement: Math.round(eng),
        label: hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
      })),
      peakHour,
      lowHour,
      recommendation: `Best planning time: ${peakHour}:00 - ${(peakHour + 2) % 24}:00`,
      decomposition: decomposed
    };
  }

  // ============================================
  // 💾 MODEL PERSISTENCE
  // ============================================

  async saveModel(modelId, modelData) {
    this.models[modelId] = modelData;

    if (window.MLStorage) {
      await window.MLStorage.saveModel({
        modelId,
        type: 'timeseries_' + modelData.method,
        ...modelData,
        savedAt: Date.now()
      });
    }

    console.log(`💾 Time series model saved: ${modelId}`);
  }

  async getForecast(forecastId) {
    return this.forecasts.get(forecastId);
  }

  saveForecast(forecastId, forecastData) {
    this.forecasts.set(forecastId, {
      ...forecastData,
      createdAt: Date.now()
    });
  }

  // ============================================
  // 📊 UTILITIES
  // ============================================

  /**
   * Calculate forecast accuracy metrics
   */
  evaluateForecast(actual, predicted) {
    if (actual.length !== predicted.length) {
      throw new Error('Actual and predicted arrays must have same length');
    }

    const n = actual.length;

    // Mean Absolute Error
    const mae = actual.reduce((sum, val, i) => sum + Math.abs(val - predicted[i]), 0) / n;

    // Mean Squared Error
    const mse = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0) / n;

    // Root Mean Squared Error
    const rmse = Math.sqrt(mse);

    // Mean Absolute Percentage Error
    const mape = actual.reduce((sum, val, i) => {
      return sum + (val !== 0 ? Math.abs((val - predicted[i]) / val) : 0);
    }, 0) / n * 100;

    return {
      mae: mae.toFixed(4),
      mse: mse.toFixed(4),
      rmse: rmse.toFixed(4),
      mape: mape.toFixed(2) + '%',
      accuracy: (100 - mape).toFixed(2) + '%'
    };
  }

  /**
   * Detect outliers in time series
   */
  detectOutliers(timeSeries, threshold = 2.5) {
    const mean = timeSeries.reduce((a, b) => a + b, 0) / timeSeries.length;
    const stdDev = Math.sqrt(
      timeSeries.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / timeSeries.length
    );

    const outliers = timeSeries.map((val, i) => {
      const zScore = Math.abs((val - mean) / stdDev);
      return {
        index: i,
        value: val,
        zScore: zScore.toFixed(2),
        isOutlier: zScore > threshold
      };
    }).filter(o => o.isOutlier);

    return {
      outliers,
      count: outliers.length,
      percentage: ((outliers.length / timeSeries.length) * 100).toFixed(2) + '%'
    };
  }
}

// 🌐 Global instance
if (typeof window !== 'undefined') {
  window.TimeSeriesForecaster = new TimeSeriesForecaster();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.TimeSeriesForecaster.initialize().catch(e => {
        console.error('Failed to initialize Time Series Forecaster:', e);
      });
    });
  } else {
    window.TimeSeriesForecaster.initialize().catch(e => {
      console.error('Failed to initialize Time Series Forecaster:', e);
    });
  }
}

export default TimeSeriesForecaster;
