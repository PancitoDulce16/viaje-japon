/**
 * 🚨 ANOMALY DETECTOR V2 - FASE 2.4
 * ==================================
 *
 * Detecta patrones anómalos en:
 * - Comportamiento del usuario (clicks, navegación inusual)
 * - Planificación de itinerario (días sobrecargados, distribución extraña)
 * - Presupuesto (gastos fuera de rango)
 * - Preferencias inconsistentes
 * - Datos sospechosos o erróneos
 *
 * Técnicas:
 * - Statistical Outlier Detection (Z-score, IQR)
 * - Isolation Forest (simplificado)
 * - DBSCAN-based anomaly detection
 * - Pattern deviation analysis
 * - Contextual anomaly detection
 */

class AnomalyDetector {
  constructor() {
    this.initialized = false;
    this.baselineMetrics = null;
    this.anomalyHistory = [];
    this.detectionThresholds = {
      zScore: 2.5,
      iqrMultiplier: 1.5,
      isolationScore: 0.6,
      contextualDeviation: 0.7
    };

    console.log('🚨 Anomaly Detector V2 initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load baseline metrics from historical data
    await this.loadBaselineMetrics();

    this.initialized = true;
    console.log('✅ Anomaly Detector V2 initialized');
  }

  async loadBaselineMetrics() {
    if (!window.MLStorage) {
      this.baselineMetrics = this.getDefaultBaseline();
      return;
    }

    try {
      const sessions = await window.MLStorage.getUserSessions(null, 50);

      if (sessions.length >= 10) {
        this.baselineMetrics = this.calculateBaseline(sessions);
        console.log('📊 Baseline metrics calculated from historical data');
      } else {
        this.baselineMetrics = this.getDefaultBaseline();
      }
    } catch (error) {
      console.warn('Could not load baseline metrics:', error);
      this.baselineMetrics = this.getDefaultBaseline();
    }
  }

  calculateBaseline(sessions) {
    // Calculate normal ranges from historical sessions
    const clickCounts = sessions.map(s => s.behavioral?.clicks?.length || 0);
    const sessionDurations = sessions.map(s => s.duration || 0);
    const engagementScores = sessions.map(s => s.behavioral?.engagementScore || 0);

    return {
      clicks: this.calculateStatistics(clickCounts),
      duration: this.calculateStatistics(sessionDurations),
      engagement: this.calculateStatistics(engagementScores),
      updatedAt: Date.now()
    };
  }

  calculateStatistics(data) {
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;

    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const q1 = sorted[Math.floor(n * 0.25)];
    const median = sorted[Math.floor(n * 0.5)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;

    return {
      mean,
      median,
      stdDev,
      variance,
      q1,
      q3,
      iqr,
      min: sorted[0],
      max: sorted[n - 1]
    };
  }

  getDefaultBaseline() {
    return {
      clicks: {
        mean: 15,
        median: 12,
        stdDev: 8,
        q1: 8,
        q3: 20,
        iqr: 12,
        min: 2,
        max: 50
      },
      duration: {
        mean: 900000, // 15 minutes
        median: 720000,
        stdDev: 600000,
        q1: 480000,
        q3: 1200000,
        iqr: 720000,
        min: 120000,
        max: 3600000
      },
      engagement: {
        mean: 50,
        median: 48,
        stdDev: 20,
        q1: 35,
        q3: 65,
        iqr: 30,
        min: 10,
        max: 95
      }
    };
  }

  // ============================================
  // 📊 STATISTICAL ANOMALY DETECTION
  // ============================================

  /**
   * Z-Score based outlier detection
   */
  detectZScoreAnomalies(value, metric) {
    if (!this.baselineMetrics || !this.baselineMetrics[metric]) {
      return { isAnomaly: false, reason: 'No baseline data' };
    }

    const stats = this.baselineMetrics[metric];
    const zScore = Math.abs((value - stats.mean) / stats.stdDev);

    const isAnomaly = zScore > this.detectionThresholds.zScore;

    return {
      isAnomaly,
      zScore: zScore.toFixed(2),
      severity: zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low',
      deviation: ((value - stats.mean) / stats.mean * 100).toFixed(1) + '%',
      reason: isAnomaly ? `Value deviates ${zScore.toFixed(1)} standard deviations from mean` : null
    };
  }

  /**
   * IQR (Interquartile Range) based outlier detection
   */
  detectIQRAnomalies(value, metric) {
    if (!this.baselineMetrics || !this.baselineMetrics[metric]) {
      return { isAnomaly: false, reason: 'No baseline data' };
    }

    const stats = this.baselineMetrics[metric];
    const lowerBound = stats.q1 - (this.detectionThresholds.iqrMultiplier * stats.iqr);
    const upperBound = stats.q3 + (this.detectionThresholds.iqrMultiplier * stats.iqr);

    const isAnomaly = value < lowerBound || value > upperBound;

    return {
      isAnomaly,
      bounds: { lower: lowerBound.toFixed(2), upper: upperBound.toFixed(2) },
      value,
      severity: isAnomaly ?
        (value < lowerBound - stats.iqr || value > upperBound + stats.iqr ? 'high' : 'medium') :
        'none',
      reason: isAnomaly ?
        (value < lowerBound ? 'Below normal range' : 'Above normal range') :
        null
    };
  }

  /**
   * Combined statistical anomaly detection
   */
  detectStatisticalAnomaly(value, metric, method = 'both') {
    const results = {};

    if (method === 'zscore' || method === 'both') {
      results.zscore = this.detectZScoreAnomalies(value, metric);
    }

    if (method === 'iqr' || method === 'both') {
      results.iqr = this.detectIQRAnomalies(value, metric);
    }

    // Combined decision
    const isAnomaly = method === 'both' ?
      (results.zscore.isAnomaly || results.iqr.isAnomaly) :
      (results.zscore?.isAnomaly || results.iqr?.isAnomaly);

    return {
      isAnomaly,
      metric,
      value,
      results,
      confidence: this.calculateAnomalyConfidence(results)
    };
  }

  calculateAnomalyConfidence(results) {
    let confidence = 0;
    let count = 0;

    if (results.zscore) {
      confidence += results.zscore.isAnomaly ? parseFloat(results.zscore.zScore) / 3 : 0;
      count++;
    }

    if (results.iqr) {
      confidence += results.iqr.isAnomaly ? 0.5 : 0;
      count++;
    }

    return Math.min(1, confidence / count).toFixed(2);
  }

  // ============================================
  // 🌲 ISOLATION FOREST (Simplified)
  // ============================================

  /**
   * Simplified Isolation Forest for multivariate anomaly detection
   */
  isolationForestDetection(dataPoint, historicalData, numTrees = 10, sampleSize = 256) {
    if (historicalData.length < 10) {
      return { isAnomaly: false, reason: 'Insufficient historical data' };
    }

    // Build isolation trees
    const trees = [];
    for (let i = 0; i < numTrees; i++) {
      const sample = this.randomSample(historicalData, Math.min(sampleSize, historicalData.length));
      const tree = this.buildIsolationTree(sample, 0, Math.log2(sampleSize));
      trees.push(tree);
    }

    // Calculate average path length for data point
    const pathLengths = trees.map(tree => this.pathLength(dataPoint, tree, 0));
    const avgPathLength = pathLengths.reduce((a, b) => a + b, 0) / numTrees;

    // Normalize (shorter path = more anomalous)
    const c = this.averagePathLengthOfUnsuccessfulSearch(sampleSize);
    const anomalyScore = Math.pow(2, -avgPathLength / c);

    const isAnomaly = anomalyScore > this.detectionThresholds.isolationScore;

    return {
      isAnomaly,
      anomalyScore: anomalyScore.toFixed(3),
      avgPathLength: avgPathLength.toFixed(2),
      severity: anomalyScore > 0.7 ? 'high' : anomalyScore > 0.6 ? 'medium' : 'low',
      reason: isAnomaly ? `Anomaly score ${anomalyScore.toFixed(2)} exceeds threshold` : null
    };
  }

  buildIsolationTree(data, depth, maxDepth) {
    if (depth >= maxDepth || data.length <= 1) {
      return { type: 'leaf', size: data.length };
    }

    // Random feature and split
    const features = Object.keys(data[0]);
    const splitFeature = features[Math.floor(Math.random() * features.length)];

    const values = data.map(d => d[splitFeature]).filter(v => typeof v === 'number');
    if (values.length === 0) {
      return { type: 'leaf', size: data.length };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const splitValue = min + Math.random() * (max - min);

    const left = data.filter(d => d[splitFeature] < splitValue);
    const right = data.filter(d => d[splitFeature] >= splitValue);

    if (left.length === 0 || right.length === 0) {
      return { type: 'leaf', size: data.length };
    }

    return {
      type: 'node',
      feature: splitFeature,
      splitValue,
      left: this.buildIsolationTree(left, depth + 1, maxDepth),
      right: this.buildIsolationTree(right, depth + 1, maxDepth)
    };
  }

  pathLength(dataPoint, tree, currentDepth) {
    if (tree.type === 'leaf') {
      return currentDepth + this.averagePathLengthOfUnsuccessfulSearch(tree.size);
    }

    const value = dataPoint[tree.feature];
    if (typeof value !== 'number') {
      return currentDepth;
    }

    if (value < tree.splitValue) {
      return this.pathLength(dataPoint, tree.left, currentDepth + 1);
    } else {
      return this.pathLength(dataPoint, tree.right, currentDepth + 1);
    }
  }

  averagePathLengthOfUnsuccessfulSearch(n) {
    if (n <= 1) return 0;
    const H = Math.log(n - 1) + 0.5772156649; // Euler's constant
    return 2 * H - (2 * (n - 1) / n);
  }

  randomSample(array, size) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }

  // ============================================
  // 🎯 CONTEXTUAL ANOMALY DETECTION
  // ============================================

  /**
   * Detect anomalies in context (e.g., behavior for specific user type)
   */
  detectContextualAnomaly(currentBehavior, userContext) {
    const anomalies = [];

    // 1. Budget anomalies
    if (currentBehavior.budget && userContext.archetype) {
      const budgetAnomaly = this.detectBudgetAnomaly(currentBehavior.budget, userContext.archetype);
      if (budgetAnomaly.isAnomaly) {
        anomalies.push({
          type: 'budget',
          ...budgetAnomaly
        });
      }
    }

    // 2. Activity pattern anomalies
    if (currentBehavior.activities) {
      const activityAnomaly = this.detectActivityPatternAnomaly(currentBehavior.activities, userContext);
      if (activityAnomaly.isAnomaly) {
        anomalies.push({
          type: 'activities',
          ...activityAnomaly
        });
      }
    }

    // 3. Navigation anomalies
    if (currentBehavior.navigation) {
      const navAnomaly = this.detectNavigationAnomaly(currentBehavior.navigation);
      if (navAnomaly.isAnomaly) {
        anomalies.push({
          type: 'navigation',
          ...navAnomaly
        });
      }
    }

    // 4. Preference inconsistency
    if (currentBehavior.preferences && userContext.historicalPreferences) {
      const prefAnomaly = this.detectPreferenceInconsistency(
        currentBehavior.preferences,
        userContext.historicalPreferences
      );
      if (prefAnomaly.isAnomaly) {
        anomalies.push({
          type: 'preferences',
          ...prefAnomaly
        });
      }
    }

    return {
      hasAnomalies: anomalies.length > 0,
      count: anomalies.length,
      anomalies,
      overallSeverity: this.calculateOverallSeverity(anomalies)
    };
  }

  detectBudgetAnomaly(budget, archetype) {
    const expectedBudgetRanges = {
      'budget_traveler': { min: 50000, max: 150000 },
      'foodie': { min: 100000, max: 300000 },
      'cultural': { min: 80000, max: 250000 },
      'relaxer': { min: 150000, max: 400000 },
      'explorer': { min: 100000, max: 300000 },
      'photographer': { min: 120000, max: 350000 },
      'planner': { min: 100000, max: 300000 },
      'social': { min: 120000, max: 350000 }
    };

    const archetypeType = archetype.primary?.type || 'explorer';
    const expectedRange = expectedBudgetRanges[archetypeType] || { min: 100000, max: 300000 };

    const isAnomaly = budget < expectedRange.min * 0.5 || budget > expectedRange.max * 2;

    return {
      isAnomaly,
      budget,
      expectedRange,
      deviation: budget < expectedRange.min ?
        `${((expectedRange.min - budget) / expectedRange.min * 100).toFixed(0)}% below expected` :
        `${((budget - expectedRange.max) / expectedRange.max * 100).toFixed(0)}% above expected`,
      severity: budget < expectedRange.min * 0.3 || budget > expectedRange.max * 3 ? 'high' : 'medium',
      reason: budget < expectedRange.min ?
        'Budget unusually low for user profile' :
        'Budget unusually high for user profile'
    };
  }

  detectActivityPatternAnomaly(activities, userContext) {
    const activitiesPerDay = {};

    activities.forEach(activity => {
      const day = activity.day || 1;
      activitiesPerDay[day] = (activitiesPerDay[day] || 0) + 1;
    });

    const counts = Object.values(activitiesPerDay);
    const avgActivities = counts.reduce((a, b) => a + b, 0) / counts.length;
    const maxActivities = Math.max(...counts);

    // Too many activities in one day
    const isOverloaded = maxActivities > 8;

    // Too few activities overall
    const isUnderplanned = avgActivities < 1.5;

    const isAnomaly = isOverloaded || isUnderplanned;

    return {
      isAnomaly,
      avgActivitiesPerDay: avgActivities.toFixed(1),
      maxActivitiesPerDay: maxActivities,
      severity: (isOverloaded && maxActivities > 10) || (isUnderplanned && avgActivities < 1) ? 'high' : 'medium',
      reason: isOverloaded ?
        `Day with ${maxActivities} activities may cause fatigue` :
        isUnderplanned ?
        'Very few activities planned' :
        null
    };
  }

  detectNavigationAnomaly(navigation) {
    // Detect erratic navigation patterns
    const { clicks, scrolls, backtrackingRate, pageJumps } = navigation;

    // Too many clicks without progress
    const clicksPerPage = clicks / (pageJumps || 1);
    const isErratic = clicksPerPage > 30;

    // Excessive backtracking
    const isConfused = backtrackingRate > 0.5;

    const isAnomaly = isErratic || isConfused;

    return {
      isAnomaly,
      clicksPerPage: clicksPerPage.toFixed(1),
      backtrackingRate: (backtrackingRate * 100).toFixed(0) + '%',
      severity: (isErratic && clicksPerPage > 50) || backtrackingRate > 0.7 ? 'high' : 'medium',
      reason: isErratic ?
        'Unusual number of clicks may indicate UI confusion' :
        isConfused ?
        'High backtracking rate suggests difficulty finding information' :
        null
    };
  }

  detectPreferenceInconsistency(currentPreferences, historicalPreferences) {
    // Compare current vs historical preferences
    let inconsistencies = 0;
    let totalChecks = 0;

    const keysToCheck = ['budget', 'pace', 'foodie', 'cultural', 'nature', 'shopping'];

    keysToCheck.forEach(key => {
      if (currentPreferences[key] !== undefined && historicalPreferences[key] !== undefined) {
        totalChecks++;

        // For numeric values
        if (typeof currentPreferences[key] === 'number' && typeof historicalPreferences[key] === 'number') {
          const deviation = Math.abs(currentPreferences[key] - historicalPreferences[key]) / historicalPreferences[key];
          if (deviation > 0.5) {
            inconsistencies++;
          }
        }
        // For boolean values
        else if (currentPreferences[key] !== historicalPreferences[key]) {
          inconsistencies++;
        }
      }
    });

    const inconsistencyRate = totalChecks > 0 ? inconsistencies / totalChecks : 0;
    const isAnomaly = inconsistencyRate > this.detectionThresholds.contextualDeviation;

    return {
      isAnomaly,
      inconsistencyRate: (inconsistencyRate * 100).toFixed(0) + '%',
      inconsistencies,
      totalChecks,
      severity: inconsistencyRate > 0.8 ? 'high' : 'medium',
      reason: isAnomaly ? 'Current preferences differ significantly from historical patterns' : null
    };
  }

  calculateOverallSeverity(anomalies) {
    if (anomalies.length === 0) return 'none';

    const severityScores = {
      low: 1,
      medium: 2,
      high: 3
    };

    const avgScore = anomalies.reduce((sum, a) => sum + (severityScores[a.severity] || 0), 0) / anomalies.length;

    if (avgScore >= 2.5) return 'high';
    if (avgScore >= 1.5) return 'medium';
    return 'low';
  }

  // ============================================
  // 🔍 COMPREHENSIVE SCAN
  // ============================================

  /**
   * Run comprehensive anomaly detection on entire dataset
   */
  async comprehensiveScan(userData) {
    const report = {
      timestamp: Date.now(),
      anomalies: [],
      summary: {}
    };

    // 1. Session behavior anomalies
    if (userData.sessionData) {
      const clickAnomaly = this.detectStatisticalAnomaly(
        userData.sessionData.clicks?.length || 0,
        'clicks'
      );

      if (clickAnomaly.isAnomaly) {
        report.anomalies.push({
          category: 'behavior',
          subcategory: 'clicks',
          ...clickAnomaly
        });
      }

      const durationAnomaly = this.detectStatisticalAnomaly(
        userData.sessionData.duration || 0,
        'duration'
      );

      if (durationAnomaly.isAnomaly) {
        report.anomalies.push({
          category: 'behavior',
          subcategory: 'duration',
          ...durationAnomaly
        });
      }
    }

    // 2. Contextual anomalies
    if (userData.behavior && userData.context) {
      const contextualAnomalies = this.detectContextualAnomaly(
        userData.behavior,
        userData.context
      );

      if (contextualAnomalies.hasAnomalies) {
        contextualAnomalies.anomalies.forEach(anomaly => {
          report.anomalies.push({
            category: 'contextual',
            ...anomaly
          });
        });
      }
    }

    // 3. Data quality anomalies
    const dataQualityAnomalies = this.detectDataQualityIssues(userData);
    if (dataQualityAnomalies.hasIssues) {
      dataQualityAnomalies.issues.forEach(issue => {
        report.anomalies.push({
          category: 'data_quality',
          ...issue
        });
      });
    }

    // Generate summary
    report.summary = {
      totalAnomalies: report.anomalies.length,
      byCategory: this.groupByCategory(report.anomalies),
      bySeverity: this.groupBySeverity(report.anomalies),
      overallRisk: this.calculateOverallRisk(report.anomalies)
    };

    // Store in history
    this.anomalyHistory.push(report);

    // Save to storage
    if (window.MLStorage) {
      await window.MLStorage.savePattern({
        type: 'anomaly_detection',
        data: report,
        userId: window.firebase?.auth()?.currentUser?.uid
      });
    }

    return report;
  }

  detectDataQualityIssues(userData) {
    const issues = [];

    // Missing required fields
    if (!userData.sessionData) {
      issues.push({
        type: 'missing_data',
        field: 'sessionData',
        severity: 'high',
        reason: 'Critical session data is missing'
      });
    }

    // Invalid values
    if (userData.budget && userData.budget < 0) {
      issues.push({
        type: 'invalid_value',
        field: 'budget',
        value: userData.budget,
        severity: 'high',
        reason: 'Budget cannot be negative'
      });
    }

    if (userData.days && (userData.days < 1 || userData.days > 90)) {
      issues.push({
        type: 'invalid_value',
        field: 'days',
        value: userData.days,
        severity: 'medium',
        reason: 'Trip duration outside reasonable range (1-90 days)'
      });
    }

    // Duplicate data
    if (userData.activities) {
      const activityNames = userData.activities.map(a => a.name);
      const duplicates = activityNames.filter((name, index) => activityNames.indexOf(name) !== index);

      if (duplicates.length > 0) {
        issues.push({
          type: 'duplicate_data',
          field: 'activities',
          duplicates: [...new Set(duplicates)],
          severity: 'low',
          reason: `${duplicates.length} duplicate activities detected`
        });
      }
    }

    return {
      hasIssues: issues.length > 0,
      count: issues.length,
      issues
    };
  }

  groupByCategory(anomalies) {
    return anomalies.reduce((acc, anomaly) => {
      const cat = anomaly.category || 'other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
  }

  groupBySeverity(anomalies) {
    return anomalies.reduce((acc, anomaly) => {
      const sev = anomaly.severity || 'unknown';
      acc[sev] = (acc[sev] || 0) + 1;
      return acc;
    }, {});
  }

  calculateOverallRisk(anomalies) {
    if (anomalies.length === 0) return 'none';

    const highCount = anomalies.filter(a => a.severity === 'high').length;
    const mediumCount = anomalies.filter(a => a.severity === 'medium').length;

    if (highCount >= 3 || (highCount >= 1 && mediumCount >= 3)) return 'high';
    if (highCount >= 1 || mediumCount >= 2) return 'medium';
    if (anomalies.length >= 3) return 'low';
    return 'minimal';
  }

  // ============================================
  // 📊 REPORTING
  // ============================================

  generateAnomalyReport(scanResult) {
    return {
      summary: `Found ${scanResult.summary.totalAnomalies} anomalies`,
      risk: scanResult.summary.overallRisk,
      details: scanResult.anomalies.map(a => ({
        category: a.category,
        type: a.type || a.subcategory,
        severity: a.severity,
        reason: a.reason
      })),
      recommendations: this.generateRecommendations(scanResult)
    };
  }

  generateRecommendations(scanResult) {
    const recommendations = [];

    // High severity anomalies
    const highSeverity = scanResult.anomalies.filter(a => a.severity === 'high');
    if (highSeverity.length > 0) {
      recommendations.push({
        priority: 'high',
        message: `Review ${highSeverity.length} high-severity anomalies immediately`,
        actions: highSeverity.map(a => `Check ${a.category}: ${a.reason}`)
      });
    }

    // Data quality issues
    const dataQuality = scanResult.anomalies.filter(a => a.category === 'data_quality');
    if (dataQuality.length > 0) {
      recommendations.push({
        priority: 'medium',
        message: 'Clean up data quality issues',
        actions: ['Validate input data', 'Remove duplicates', 'Fill missing fields']
      });
    }

    return recommendations;
  }
}

// 🌐 Global instance
if (typeof window !== 'undefined') {
  window.AnomalyDetector = new AnomalyDetector();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AnomalyDetector.initialize().catch(e => {
        console.error('Failed to initialize Anomaly Detector:', e);
      });
    });
  } else {
    window.AnomalyDetector.initialize().catch(e => {
      console.error('Failed to initialize Anomaly Detector:', e);
    });
  }
}

export default AnomalyDetector;
