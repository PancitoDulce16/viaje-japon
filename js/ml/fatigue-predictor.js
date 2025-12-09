/**
 * 😴 FATIGUE PREDICTOR 2.0 - FASE 2.3
 * ====================================
 *
 * Predictor avanzado de fatiga del usuario durante el viaje.
 *
 * Factores considerados:
 * - Número de actividades por día
 * - Duración de cada actividad
 * - Intensidad física (walking, stairs, etc.)
 * - Jet lag y adaptación horaria
 * - Recuperación nocturna
 * - Historial de resistencia del usuario
 * - Tipo de actividades (cultural vs física)
 * - Clima y temperatura
 * - Altitud
 *
 * Modelos:
 * - Modelo fisiológico de fatiga (inspirado en Task-Capability Interface)
 * - Aprendizaje de patrones individuales
 * - Predicción temporal con recuperación
 */

class FatiguePredictor {
  constructor() {
    this.initialized = false;
    this.userFatigueProfile = null;
    this.fatigueHistory = [];
    this.thresholds = {
      low: 30,
      moderate: 60,
      high: 80,
      critical: 95
    };

    console.log('😴 Fatigue Predictor 2.0 initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load user fatigue profile if exists
    await this.loadUserProfile();

    this.initialized = true;
    console.log('✅ Fatigue Predictor 2.0 initialized');
  }

  async loadUserProfile() {
    if (!window.MLStorage) return;

    try {
      const sessions = await window.MLStorage.getUserSessions(null, 20);

      if (sessions.length > 0) {
        this.userFatigueProfile = this.buildFatigueProfile(sessions);
        console.log('👤 User fatigue profile loaded');
      } else {
        this.userFatigueProfile = this.getDefaultProfile();
      }
    } catch (error) {
      console.warn('Could not load fatigue profile:', error);
      this.userFatigueProfile = this.getDefaultProfile();
    }
  }

  buildFatigueProfile(sessions) {
    // Analyze historical behavior to determine fatigue resistance
    const avgSessionDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
    const avgEngagement = sessions.reduce((sum, s) => sum + (s.behavioral?.engagementScore || 50), 0) / sessions.length;

    return {
      baseResistance: this.calculateBaseResistance(avgEngagement, avgSessionDuration),
      recoveryRate: this.calculateRecoveryRate(sessions),
      activityTolerance: this.calculateActivityTolerance(sessions),
      adaptability: this.calculateAdaptability(sessions)
    };
  }

  calculateBaseResistance(avgEngagement, avgDuration) {
    // Higher engagement + longer sessions = better resistance
    let resistance = 50; // Base

    if (avgEngagement > 70) resistance += 15;
    else if (avgEngagement > 50) resistance += 5;
    else resistance -= 10;

    if (avgDuration > 1800000) resistance += 10; // > 30 min sessions
    else if (avgDuration < 600000) resistance -= 10; // < 10 min sessions

    return Math.max(20, Math.min(100, resistance));
  }

  calculateRecoveryRate(sessions) {
    // How quickly user bounces back
    // Base rate: 20 points per rest period
    return 20;
  }

  calculateActivityTolerance(sessions) {
    // How many activities user can handle before fatigue
    return {
      light: 6,
      moderate: 4,
      intense: 2
    };
  }

  calculateAdaptability(sessions) {
    // How well user adapts to changing conditions
    // Based on variety in session patterns
    return 0.7; // 0-1 scale
  }

  getDefaultProfile() {
    return {
      baseResistance: 50,
      recoveryRate: 20,
      activityTolerance: {
        light: 5,
        moderate: 3,
        intense: 2
      },
      adaptability: 0.5
    };
  }

  // ============================================
  // 🎯 CORE PREDICTION ENGINE
  // ============================================

  /**
   * Predict fatigue for entire trip
   */
  async predictTripFatigue(tripData) {
    const {
      days,
      itinerary,
      userProfile,
      origin,
      destination
    } = tripData;

    // Calculate jet lag impact
    const jetLagFactor = this.calculateJetLag(origin, destination);

    // Initialize state
    let currentFatigue = jetLagFactor.initialFatigue;
    const dailyFatigue = [];
    const warnings = [];
    const recommendations = [];

    for (let day = 0; day < days; day++) {
      const dayActivities = itinerary?.filter(a => a.day === day + 1) || [];

      // Calculate daily fatigue accumulation
      const dayAnalysis = this.analyzeDayFatigue(
        dayActivities,
        currentFatigue,
        day,
        jetLagFactor,
        userProfile
      );

      // Apply recovery (sleep, rest periods)
      const recovery = this.calculateRecovery(dayActivities, day, jetLagFactor);

      // Update fatigue
      currentFatigue = Math.max(0, Math.min(100,
        currentFatigue + dayAnalysis.accumulation - recovery
      ));

      dailyFatigue.push({
        day: day + 1,
        startFatigue: Math.round(dayAnalysis.startFatigue),
        endFatigue: Math.round(currentFatigue),
        accumulation: Math.round(dayAnalysis.accumulation),
        recovery: Math.round(recovery),
        status: this.getFatigueStatus(currentFatigue),
        breakdown: dayAnalysis.breakdown,
        criticalPeriods: dayAnalysis.criticalPeriods
      });

      // Generate warnings
      if (currentFatigue > this.thresholds.high) {
        warnings.push({
          day: day + 1,
          level: currentFatigue > this.thresholds.critical ? 'critical' : 'high',
          message: `High fatigue risk on day ${day + 1}`,
          fatigue: Math.round(currentFatigue)
        });
      }

      // Generate recommendations
      if (currentFatigue > this.thresholds.moderate && dayActivities.length > 3) {
        recommendations.push({
          day: day + 1,
          type: 'reduce_activities',
          message: `Consider reducing activities on day ${day + 1} to ${dayActivities.length - 1} activities`,
          impact: 'Could reduce fatigue by ~15 points'
        });
      }

      if (day < days - 1 && currentFatigue > this.thresholds.high) {
        recommendations.push({
          day: day + 2,
          type: 'rest_day',
          message: `Insert rest day after day ${day + 1}`,
          impact: 'Could recover 30-40 fatigue points'
        });
      }
    }

    // Use Time Series Forecaster for smoothed predictions
    let smoothedFatigue = null;
    if (window.TimeSeriesForecaster) {
      const fatigueValues = dailyFatigue.map(d => d.endFatigue);
      const forecast = window.TimeSeriesForecaster.doubleExponentialSmoothing(fatigueValues, 0.3, 0.1, 0);
      smoothedFatigue = forecast.level;
    }

    return {
      dailyFatigue,
      smoothedFatigue,
      warnings,
      recommendations,
      summary: {
        averageFatigue: dailyFatigue.reduce((sum, d) => sum + d.endFatigue, 0) / days,
        peakFatigue: Math.max(...dailyFatigue.map(d => d.endFatigue)),
        peakDay: dailyFatigue.findIndex(d => d.endFatigue === Math.max(...dailyFatigue.map(d => d.endFatigue))) + 1,
        daysAboveThreshold: dailyFatigue.filter(d => d.endFatigue > this.thresholds.moderate).length,
        jetLagRecoveryDay: jetLagFactor.recoveryDays
      },
      jetLagAnalysis: jetLagFactor
    };
  }

  /**
   * Analyze fatigue for a single day
   */
  analyzeDayFatigue(activities, startFatigue, dayNumber, jetLagFactor, userProfile) {
    const breakdown = {
      activities: 0,
      jetLag: 0,
      cumulative: 0,
      environmental: 0
    };

    const criticalPeriods = [];

    // 1. Activity-based fatigue
    activities.forEach((activity, idx) => {
      const activityFatigue = this.calculateActivityFatigue(activity, userProfile);
      breakdown.activities += activityFatigue.total;

      if (activityFatigue.total > 15) {
        criticalPeriods.push({
          time: activity.startTime || `Activity ${idx + 1}`,
          activity: activity.name,
          fatigueImpact: Math.round(activityFatigue.total),
          reason: activityFatigue.reason
        });
      }
    });

    // 2. Jet lag impact (decreases over days)
    if (dayNumber < jetLagFactor.recoveryDays) {
      const jetLagImpact = jetLagFactor.dailyImpact * (1 - dayNumber / jetLagFactor.recoveryDays);
      breakdown.jetLag = jetLagImpact;
    }

    // 3. Cumulative fatigue (builds up over trip)
    const cumulativeFactor = Math.min(dayNumber * 2, 15);
    breakdown.cumulative = cumulativeFactor;

    // 4. Environmental factors
    breakdown.environmental = this.calculateEnvironmentalFatigue(activities);

    const totalAccumulation = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return {
      startFatigue,
      accumulation: totalAccumulation,
      breakdown,
      criticalPeriods
    };
  }

  /**
   * Calculate fatigue from a single activity
   */
  calculateActivityFatigue(activity, userProfile) {
    let fatigue = 0;
    const reasons = [];

    // Base fatigue by activity type
    const baseFatigue = {
      temple: 8,
      shrine: 7,
      museum: 6,
      shopping: 10,
      hiking: 20,
      walking_tour: 12,
      food_tour: 8,
      onsen: -5, // Recovery!
      tea_ceremony: 4,
      show: 3,
      restaurant: 3
    };

    const activityType = activity.type || 'default';
    fatigue += baseFatigue[activityType] || 8;

    // Duration impact
    const duration = activity.duration || 120; // minutes
    if (duration > 180) {
      const extraFatigue = (duration - 180) / 60 * 3;
      fatigue += extraFatigue;
      reasons.push(`Long duration (+${extraFatigue.toFixed(1)})`);
    }

    // Physical intensity
    const intensity = activity.intensity || 'moderate';
    const intensityMultiplier = {
      low: 0.7,
      moderate: 1.0,
      high: 1.5,
      extreme: 2.0
    };
    fatigue *= intensityMultiplier[intensity] || 1.0;

    if (intensity === 'high' || intensity === 'extreme') {
      reasons.push(`High intensity (x${intensityMultiplier[intensity]})`);
    }

    // Walking distance
    if (activity.walkingDistance) {
      const km = activity.walkingDistance;
      if (km > 3) {
        const walkingFatigue = (km - 3) * 2;
        fatigue += walkingFatigue;
        reasons.push(`Extra walking: ${km}km (+${walkingFatigue.toFixed(1)})`);
      }
    }

    // Crowdedness (drains energy)
    if (activity.crowdedness === 'very_crowded') {
      fatigue += 5;
      reasons.push('Very crowded (+5)');
    } else if (activity.crowdedness === 'crowded') {
      fatigue += 2;
    }

    // User profile adjustments
    if (userProfile?.archetype?.primary?.type === 'relaxer') {
      fatigue *= 1.2; // Relaxers tire easier
    } else if (userProfile?.archetype?.primary?.type === 'explorer') {
      fatigue *= 0.85; // Explorers have more stamina
    }

    return {
      total: fatigue,
      reason: reasons.join(', ') || 'Standard activity'
    };
  }

  /**
   * Calculate recovery from sleep and rest
   */
  calculateRecovery(activities, dayNumber, jetLagFactor) {
    let recovery = this.userFatigueProfile.recoveryRate;

    // Sleep quality (affected by jet lag)
    if (dayNumber < jetLagFactor.recoveryDays) {
      const sleepQuality = 0.6 + (dayNumber / jetLagFactor.recoveryDays) * 0.4;
      recovery *= sleepQuality;
    }

    // Rest periods during day
    const restActivities = activities.filter(a =>
      a.type === 'onsen' || a.type === 'cafe' || a.type === 'rest'
    );

    restActivities.forEach(activity => {
      recovery += 10; // Each rest period adds recovery
    });

    // Light day bonus
    if (activities.length <= 2) {
      recovery += 15;
    }

    return recovery;
  }

  /**
   * Calculate jet lag impact
   */
  calculateJetLag(origin, destination) {
    // Simplified: assumes origin timezone and Japan timezone (JST = UTC+9)
    const timeZones = {
      'Los Angeles': -8,
      'New York': -5,
      'London': 0,
      'Paris': 1,
      'Dubai': 4,
      'Singapore': 8,
      'Tokyo': 9,
      'Sydney': 10
    };

    const originTZ = timeZones[origin] || 0;
    const destTZ = 9; // Japan = UTC+9

    const hoursDifference = Math.abs(destTZ - originTZ);

    // Jet lag severity
    const severity = hoursDifference <= 3 ? 'mild' :
                    hoursDifference <= 6 ? 'moderate' :
                    hoursDifference <= 9 ? 'severe' : 'extreme';

    // Initial fatigue from jet lag
    const initialFatigue = Math.min(hoursDifference * 3, 40);

    // Days to recover (rule: 1 day per timezone crossed)
    const recoveryDays = Math.ceil(hoursDifference / 2);

    // Daily impact
    const dailyImpact = initialFatigue / recoveryDays;

    return {
      hoursDifference,
      severity,
      initialFatigue,
      recoveryDays,
      dailyImpact,
      recommendation: hoursDifference > 6 ?
        'Plan light activities for first 2-3 days' :
        'Minimal jet lag impact'
    };
  }

  /**
   * Calculate environmental fatigue factors
   */
  calculateEnvironmentalFatigue(activities) {
    let envFatigue = 0;

    activities.forEach(activity => {
      // Weather impact
      if (activity.weather) {
        if (activity.weather.temp > 32) envFatigue += 5; // Hot
        if (activity.weather.temp < 5) envFatigue += 5; // Cold
        if (activity.weather.condition === 'rain') envFatigue += 3;
        if (activity.weather.humidity > 80) envFatigue += 3;
      }

      // Altitude (if applicable)
      if (activity.altitude && activity.altitude > 1500) {
        envFatigue += (activity.altitude - 1500) / 500;
      }
    });

    return Math.min(envFatigue, 15); // Cap environmental fatigue
  }

  // ============================================
  // 📊 REAL-TIME MONITORING
  // ============================================

  /**
   * Monitor fatigue in real-time during trip
   */
  async monitorRealTimeFatigue(currentDay, completedActivities, remainingActivities) {
    // Calculate current fatigue based on completed activities
    let currentFatigue = 0;

    completedActivities.forEach(activity => {
      const activityFatigue = this.calculateActivityFatigue(activity, this.userFatigueProfile);
      currentFatigue += activityFatigue.total;
    });

    // Predict fatigue after remaining activities
    const predictedFatigue = currentFatigue;
    remainingActivities.forEach(activity => {
      const activityFatigue = this.calculateActivityFatigue(activity, this.userFatigueProfile);
      predictedFatigue += activityFatigue.total;
    });

    const status = this.getFatigueStatus(currentFatigue);
    const predictedStatus = this.getFatigueStatus(predictedFatigue);

    return {
      current: {
        fatigue: Math.round(currentFatigue),
        status,
        message: this.getFatigueMessage(status)
      },
      predicted: {
        fatigue: Math.round(predictedFatigue),
        status: predictedStatus,
        message: this.getFatigueMessage(predictedStatus)
      },
      recommendation: this.getRealtimeRecommendation(currentFatigue, predictedFatigue, remainingActivities)
    };
  }

  getFatigueStatus(fatigue) {
    if (fatigue < this.thresholds.low) return 'fresh';
    if (fatigue < this.thresholds.moderate) return 'slight';
    if (fatigue < this.thresholds.high) return 'moderate';
    if (fatigue < this.thresholds.critical) return 'high';
    return 'critical';
  }

  getFatigueMessage(status) {
    const messages = {
      fresh: 'Feeling energetic and ready to explore!',
      slight: 'Slightly tired but still going strong',
      moderate: 'Starting to feel tired. Consider a break soon.',
      high: 'High fatigue detected. Rest recommended.',
      critical: 'Critical fatigue! Immediate rest needed.'
    };
    return messages[status];
  }

  getRealtimeRecommendation(current, predicted, remaining) {
    if (predicted > this.thresholds.high && remaining.length > 2) {
      return {
        type: 'warning',
        message: 'Consider skipping 1-2 activities to avoid exhaustion',
        suggestedActivitiesToSkip: remaining.slice(-2).map(a => a.name)
      };
    }

    if (current > this.thresholds.moderate && remaining.length > 0) {
      return {
        type: 'suggestion',
        message: 'Take a 30-minute break before next activity',
        expectedRecovery: 10
      };
    }

    if (current < this.thresholds.low) {
      return {
        type: 'positive',
        message: 'Energy levels are great! Perfect time for intensive activities.'
      };
    }

    return {
      type: 'neutral',
      message: 'Fatigue levels are normal. Continue as planned.'
    };
  }

  // ============================================
  // 🎓 LEARNING & ADAPTATION
  // ============================================

  /**
   * Learn from actual fatigue reports
   */
  async learnFromFeedback(day, reportedFatigue, actualActivities) {
    // Store actual fatigue data
    this.fatigueHistory.push({
      day,
      reportedFatigue,
      activities: actualActivities,
      timestamp: Date.now()
    });

    // Update user profile based on observations
    if (this.fatigueHistory.length >= 3) {
      await this.updateFatigueProfile();
    }

    // Save to storage
    if (window.MLStorage) {
      await window.MLStorage.savePattern({
        type: 'fatigue_learning',
        data: {
          day,
          reportedFatigue,
          activitiesCount: actualActivities.length
        },
        userId: window.firebase?.auth()?.currentUser?.uid
      });
    }
  }

  async updateFatigueProfile() {
    // Analyze history to adjust resistance and recovery
    const avgReportedFatigue = this.fatigueHistory.reduce((sum, h) => sum + h.reportedFatigue, 0) / this.fatigueHistory.length;

    // If user consistently reports lower fatigue than predicted, increase resistance
    // This is simplified - in production you'd compare predicted vs actual

    if (avgReportedFatigue < 40) {
      this.userFatigueProfile.baseResistance = Math.min(100, this.userFatigueProfile.baseResistance + 5);
    } else if (avgReportedFatigue > 70) {
      this.userFatigueProfile.baseResistance = Math.max(20, this.userFatigueProfile.baseResistance - 5);
    }

    console.log('🎓 Fatigue profile updated based on feedback');
  }

  // ============================================
  // 📈 ANALYTICS
  // ============================================

  /**
   * Generate fatigue insights
   */
  generateInsights(tripAnalysis) {
    const insights = [];

    // High fatigue days
    const highFatigueDays = tripAnalysis.dailyFatigue.filter(d => d.endFatigue > this.thresholds.high);
    if (highFatigueDays.length > 0) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'High Fatigue Risk',
        message: `${highFatigueDays.length} day(s) with high fatigue: Days ${highFatigueDays.map(d => d.day).join(', ')}`,
        days: highFatigueDays.map(d => d.day)
      });
    }

    // Jet lag
    if (tripAnalysis.jetLagAnalysis.severity !== 'mild') {
      insights.push({
        type: 'info',
        icon: '✈️',
        title: 'Jet Lag Impact',
        message: `${tripAnalysis.jetLagAnalysis.severity} jet lag (${tripAnalysis.jetLagAnalysis.hoursDifference}h difference). Recovery: ${tripAnalysis.jetLagAnalysis.recoveryDays} days.`,
        recommendation: tripAnalysis.jetLagAnalysis.recommendation
      });
    }

    // Fatigue trend
    const firstHalf = tripAnalysis.dailyFatigue.slice(0, Math.floor(tripAnalysis.dailyFatigue.length / 2));
    const secondHalf = tripAnalysis.dailyFatigue.slice(Math.floor(tripAnalysis.dailyFatigue.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.endFatigue, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.endFatigue, 0) / secondHalf.length;

    if (secondHalfAvg > firstHalfAvg + 15) {
      insights.push({
        type: 'suggestion',
        icon: '📈',
        title: 'Increasing Fatigue Trend',
        message: 'Fatigue increases significantly in second half of trip',
        recommendation: 'Consider redistributing activities more evenly'
      });
    }

    return insights;
  }
}

// 🌐 Global instance
if (typeof window !== 'undefined') {
  window.FatiguePredictor = new FatiguePredictor();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.FatiguePredictor.initialize().catch(e => {
        console.error('Failed to initialize Fatigue Predictor:', e);
      });
    });
  } else {
    window.FatiguePredictor.initialize().catch(e => {
      console.error('Failed to initialize Fatigue Predictor:', e);
    });
  }
}

export default FatiguePredictor;
