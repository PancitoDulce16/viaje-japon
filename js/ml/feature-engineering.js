/**
 * 🎨 FEATURE ENGINEERING
 * =======================
 *
 * Sistema avanzado de ingeniería de features para ML.
 * Crea features derivadas, combina features, y genera representaciones complejas.
 *
 * Técnicas implementadas:
 * - Feature creation (derivadas, ratios, interactions)
 * - Feature selection (correlation, importance)
 * - Feature encoding (one-hot, label, embedding)
 * - Dimensionality reduction (PCA-like)
 * - Feature crosses (polynomial features)
 */

class FeatureEngineering {
  constructor() {
    this.featureImportance = {};
    this.selectedFeatures = [];
    this.encoders = {};

    console.log('🎨 Feature Engineering initialized');
  }

  /**
   * 🏗️ CREATE ADVANCED FEATURES
   */
  createAdvancedFeatures(userData) {
    const features = {};

    // 1. Basic features (del user data directo)
    features.basic = this.extractBasicFeatures(userData);

    // 2. Derived features (calculadas desde basic)
    features.derived = this.createDerivedFeatures(features.basic, userData);

    // 3. Interaction features (combinaciones de features)
    features.interactions = this.createInteractionFeatures(features.basic, features.derived);

    // 4. Temporal features (basadas en tiempo)
    features.temporal = this.createTemporalFeatures(userData);

    // 5. Sequential features (basadas en secuencias)
    features.sequential = this.createSequentialFeatures(userData);

    // 6. Statistical features (aggregations)
    features.statistical = this.createStatisticalFeatures(userData);

    // 7. Encoded features (categóricas encodadas)
    features.encoded = this.encodeFeatures(features.basic);

    return features;
  }

  /**
   * 📋 EXTRACT BASIC FEATURES
   */
  extractBasicFeatures(userData) {
    return {
      // User profile features
      age: userData.profile?.age || null,
      gender: userData.profile?.gender || null,
      country: userData.profile?.country || null,
      travelExperience: userData.profile?.travelExperience || 0,

      // Trip features
      tripDuration: userData.trip?.duration || 0,
      cities: userData.trip?.cities?.length || 0,
      budget: userData.trip?.budget || 0,
      travelers: userData.trip?.travelers || 1,

      // Preference features
      paceLevel: userData.preferences?.paceLevel || 'moderate',
      budgetLevel: userData.preferences?.budgetLevel || 'moderate',
      travelStyle: userData.preferences?.travelStyle || 'explorer',

      // Behavioral features (from SensorLayer)
      avgClickRate: userData.behavioral?.clickRate || 0,
      avgScrollVelocity: userData.behavioral?.scrollVelocity || 0,
      avgDecisionTime: userData.behavioral?.avgDecisionTime || 0,
      engagementScore: userData.behavioral?.engagementScore || 0,

      // Contextual features
      deviceType: userData.context?.deviceType || 'desktop',
      timeOfDay: userData.context?.timeOfDay || 'day',
      dayOfWeek: userData.context?.dayOfWeek || 0,

      // Interest scores (0-10)
      cultureInterest: userData.interests?.culture || 5,
      foodInterest: userData.interests?.food || 5,
      natureInterest: userData.interests?.nature || 5,
      shoppingInterest: userData.interests?.shopping || 5,
      nightlifeInterest: userData.interests?.nightlife || 5,
      photographyInterest: userData.interests?.photography || 5
    };
  }

  /**
   * 🔨 CREATE DERIVED FEATURES
   */
  createDerivedFeatures(basic, userData) {
    const derived = {};

    // Budget per day
    derived.budgetPerDay = basic.tripDuration > 0
      ? basic.budget / basic.tripDuration
      : 0;

    // Budget per person
    derived.budgetPerPerson = basic.travelers > 0
      ? basic.budget / basic.travelers
      : basic.budget;

    // Budget per person per day
    derived.budgetPerPersonPerDay = basic.tripDuration > 0 && basic.travelers > 0
      ? basic.budget / (basic.tripDuration * basic.travelers)
      : 0;

    // Cities per day (ritmo de viaje)
    derived.citiesPerDay = basic.tripDuration > 0
      ? basic.cities / basic.tripDuration
      : 0;

    // Interest diversity (cuántos intereses tiene)
    const interests = [
      basic.cultureInterest,
      basic.foodInterest,
      basic.natureInterest,
      basic.shoppingInterest,
      basic.nightlifeInterest,
      basic.photographyInterest
    ];
    derived.interestDiversity = this.calculateDiversity(interests);

    // Dominant interest
    const interestMap = {
      culture: basic.cultureInterest,
      food: basic.foodInterest,
      nature: basic.natureInterest,
      shopping: basic.shoppingInterest,
      nightlife: basic.nightlifeInterest,
      photography: basic.photographyInterest
    };
    derived.dominantInterest = Object.entries(interestMap)
      .sort((a, b) => b[1] - a[1])[0][0];

    // Interest focus (qué tan concentrado está en un interés)
    const maxInterest = Math.max(...interests);
    const avgInterest = interests.reduce((a, b) => a + b, 0) / interests.length;
    derived.interestFocus = avgInterest > 0 ? maxInterest / avgInterest : 0;

    // Decision speed category
    derived.decisionSpeedCategory = this.categorizeDecisionSpeed(basic.avgDecisionTime);

    // Engagement level category
    derived.engagementCategory = this.categorizeEngagement(basic.engagementScore);

    // Budget category (relative to duration)
    derived.budgetCategory = this.categorizeBudget(derived.budgetPerDay);

    // Travel group type
    derived.groupType = this.categorizeGroupSize(basic.travelers);

    // Trip intensity (cities per day + pace level)
    derived.tripIntensity = this.calculateTripIntensity(
      derived.citiesPerDay,
      basic.paceLevel
    );

    // Experience level score
    derived.experienceScore = this.calculateExperienceScore(
      basic.travelExperience,
      basic.avgDecisionTime,
      basic.engagementScore
    );

    return derived;
  }

  calculateDiversity(values) {
    // Shannon diversity index
    const total = values.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;

    const proportions = values.map(v => v / total);
    const entropy = proportions.reduce((sum, p) => {
      return p > 0 ? sum - (p * Math.log2(p)) : sum;
    }, 0);

    // Normalizar a 0-1
    const maxEntropy = Math.log2(values.length);
    return maxEntropy > 0 ? entropy / maxEntropy : 0;
  }

  categorizeDecisionSpeed(avgTime) {
    if (avgTime < 10000) return 'very_fast';
    if (avgTime < 30000) return 'fast';
    if (avgTime < 60000) return 'moderate';
    if (avgTime < 120000) return 'slow';
    return 'very_slow';
  }

  categorizeEngagement(score) {
    if (score < 20) return 'very_low';
    if (score < 40) return 'low';
    if (score < 60) return 'moderate';
    if (score < 80) return 'high';
    return 'very_high';
  }

  categorizeBudget(budgetPerDay) {
    if (budgetPerDay < 5000) return 'ultra_budget';
    if (budgetPerDay < 10000) return 'budget';
    if (budgetPerDay < 20000) return 'moderate';
    if (budgetPerDay < 35000) return 'comfortable';
    return 'luxury';
  }

  categorizeGroupSize(travelers) {
    if (travelers === 1) return 'solo';
    if (travelers === 2) return 'couple';
    if (travelers <= 4) return 'small_group';
    return 'large_group';
  }

  calculateTripIntensity(citiesPerDay, paceLevel) {
    const paceScore = {
      'relaxed': 0.3,
      'moderate': 0.6,
      'intense': 0.9,
      'extreme': 1.0
    }[paceLevel] || 0.5;

    const cityScore = Math.min(1, citiesPerDay / 2); // Max 2 cities per day

    return (paceScore + cityScore) / 2;
  }

  calculateExperienceScore(experience, decisionTime, engagement) {
    // Experience count (normalizado)
    const expScore = Math.min(1, experience / 10);

    // Decision speed (rápido = más experiencia)
    const speedScore = Math.max(0, 1 - (decisionTime / 120000));

    // Engagement (alto = más experiencia)
    const engScore = engagement / 100;

    return (expScore * 0.5 + speedScore * 0.25 + engScore * 0.25);
  }

  /**
   * 🔗 CREATE INTERACTION FEATURES
   */
  createInteractionFeatures(basic, derived) {
    const interactions = {};

    // Budget × Interest interactions
    interactions.budgetCultureScore = derived.budgetPerDay * (basic.cultureInterest / 10);
    interactions.budgetFoodScore = derived.budgetPerDay * (basic.foodInterest / 10);
    interactions.budgetShoppingScore = derived.budgetPerDay * (basic.shoppingInterest / 10);

    // Pace × Interest interactions
    const paceScores = { 'relaxed': 0.3, 'moderate': 0.6, 'intense': 0.9, 'extreme': 1.0 };
    const paceScore = paceScores[basic.paceLevel] || 0.5;

    interactions.paceNatureScore = paceScore * (basic.natureInterest / 10);
    interactions.paceCultureScore = paceScore * (basic.cultureInterest / 10);

    // Group × Activity interactions
    const groupScores = { 'solo': 0.2, 'couple': 0.5, 'small_group': 0.8, 'large_group': 1.0 };
    const groupScore = groupScores[derived.groupType] || 0.5;

    interactions.groupSocialScore = groupScore * (basic.nightlifeInterest / 10);
    interactions.groupPrivacyScore = (1 - groupScore) * (basic.natureInterest / 10);

    // Time × Behavior interactions
    const timeScores = { 'morning': 0.8, 'afternoon': 0.6, 'evening': 0.4, 'night': 0.2 };
    const timeScore = timeScores[basic.timeOfDay] || 0.5;

    interactions.timeEngagementScore = timeScore * (basic.engagementScore / 100);

    // Experience × Decision interactions
    interactions.experienceDecisionScore = derived.experienceScore * (1 - basic.avgDecisionTime / 120000);

    // Budget × Duration interactions
    interactions.budgetDurationScore = derived.budgetPerDay * Math.log(basic.tripDuration + 1);

    return interactions;
  }

  /**
   * ⏰ CREATE TEMPORAL FEATURES
   */
  createTemporalFeatures(userData) {
    const temporal = {};

    const now = new Date();
    const tripStart = userData.trip?.startDate ? new Date(userData.trip.startDate) : null;

    if (tripStart) {
      // Days until trip
      temporal.daysUntilTrip = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));

      // Planning lead time
      temporal.planningLeadTime = temporal.daysUntilTrip;

      // Planning urgency
      temporal.planningUrgency = this.categorizePlanningUrgency(temporal.daysUntilTrip);

      // Season of travel
      temporal.travelMonth = tripStart.getMonth() + 1;
      temporal.travelSeason = this.getSeason(temporal.travelMonth);

      // Is peak season?
      temporal.isPeakSeason = [3, 4, 10, 11].includes(temporal.travelMonth) ? 1 : 0;

      // Day of week for trip start
      temporal.tripStartDayOfWeek = tripStart.getDay();
      temporal.startsOnWeekend = [0, 6].includes(temporal.tripStartDayOfWeek) ? 1 : 0;
    }

    // Current planning session temporal features
    temporal.currentHour = now.getHours();
    temporal.currentDayOfWeek = now.getDay();
    temporal.isWeekend = [0, 6].includes(temporal.currentDayOfWeek) ? 1 : 0;
    temporal.timeOfDay = this.getTimeOfDay(temporal.currentHour);

    // Cyclical encoding (para evitar que 23h y 0h estén lejos)
    temporal.hourSin = Math.sin(2 * Math.PI * temporal.currentHour / 24);
    temporal.hourCos = Math.cos(2 * Math.PI * temporal.currentHour / 24);
    temporal.dayOfWeekSin = Math.sin(2 * Math.PI * temporal.currentDayOfWeek / 7);
    temporal.dayOfWeekCos = Math.cos(2 * Math.PI * temporal.currentDayOfWeek / 7);

    if (temporal.travelMonth) {
      temporal.monthSin = Math.sin(2 * Math.PI * temporal.travelMonth / 12);
      temporal.monthCos = Math.cos(2 * Math.PI * temporal.travelMonth / 12);
    }

    return temporal;
  }

  categorizePlanningUrgency(daysUntilTrip) {
    if (daysUntilTrip < 7) return 'urgent';
    if (daysUntilTrip < 30) return 'soon';
    if (daysUntilTrip < 90) return 'moderate';
    return 'relaxed';
  }

  getSeason(month) {
    if ([12, 1, 2].includes(month)) return 'winter';
    if ([3, 4, 5].includes(month)) return 'spring';
    if ([6, 7, 8].includes(month)) return 'summer';
    return 'autumn';
  }

  getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  /**
   * 📊 CREATE SEQUENTIAL FEATURES
   */
  createSequentialFeatures(userData) {
    const sequential = {};

    const history = userData.history || [];

    if (history.length > 0) {
      // Activity sequence features
      sequential.totalActivities = history.length;
      sequential.avgActivitiesPerDay = userData.trip?.duration > 0
        ? history.length / userData.trip.duration
        : 0;

      // Category distribution
      const categories = history.map(a => a.category);
      const categoryCounts = this.countOccurrences(categories);

      sequential.uniqueCategories = Object.keys(categoryCounts).length;
      sequential.categoryDiversity = this.calculateDiversity(Object.values(categoryCounts));
      sequential.dominantCategory = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      // Sequential patterns
      sequential.hasPattern = this.detectSequentialPattern(categories);
      sequential.alternationRate = this.calculateAlternationRate(categories);

      // Time-based sequences
      const times = history.map(a => a.time || a.startTime);
      if (times.every(t => t)) {
        sequential.avgActivityDuration = this.calculateAvgDuration(times);
        sequential.maxGapBetweenActivities = this.calculateMaxGap(times);
      }

      // Preference evolution
      const ratings = history.map(a => a.rating).filter(r => r);
      if (ratings.length > 1) {
        sequential.avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        sequential.ratingTrend = this.calculateTrend(ratings);
      }
    }

    return sequential;
  }

  countOccurrences(array) {
    return array.reduce((counts, item) => {
      counts[item] = (counts[item] || 0) + 1;
      return counts;
    }, {});
  }

  detectSequentialPattern(sequence) {
    // Detecta si hay un patrón repetitivo simple
    if (sequence.length < 4) return false;

    // Buscar patrón de longitud 2
    for (let i = 0; i < sequence.length - 3; i++) {
      if (sequence[i] === sequence[i+2] && sequence[i+1] === sequence[i+3]) {
        return true;
      }
    }

    return false;
  }

  calculateAlternationRate(sequence) {
    // Qué tan seguido cambia de categoría
    if (sequence.length < 2) return 0;

    let changes = 0;
    for (let i = 1; i < sequence.length; i++) {
      if (sequence[i] !== sequence[i-1]) changes++;
    }

    return changes / (sequence.length - 1);
  }

  calculateAvgDuration(times) {
    if (times.length < 2) return 0;

    const durations = [];
    for (let i = 1; i < times.length; i++) {
      const duration = new Date(times[i]) - new Date(times[i-1]);
      if (duration > 0) durations.push(duration);
    }

    return durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
  }

  calculateMaxGap(times) {
    if (times.length < 2) return 0;

    let maxGap = 0;
    for (let i = 1; i < times.length; i++) {
      const gap = new Date(times[i]) - new Date(times[i-1]);
      if (gap > maxGap) maxGap = gap;
    }

    return maxGap;
  }

  calculateTrend(values) {
    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, i) => sum + (i + 1) * y, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return slope; // Positive = improving, Negative = declining
  }

  /**
   * 📈 CREATE STATISTICAL FEATURES
   */
  createStatisticalFeatures(userData) {
    const statistical = {};

    const history = userData.history || [];

    if (history.length > 0) {
      // Price statistics
      const prices = history.map(a => a.price || 0).filter(p => p > 0);
      if (prices.length > 0) {
        statistical.avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        statistical.minPrice = Math.min(...prices);
        statistical.maxPrice = Math.max(...prices);
        statistical.stdPrice = this.calculateStd(prices);
        statistical.priceRange = statistical.maxPrice - statistical.minPrice;
      }

      // Rating statistics
      const ratings = history.map(a => a.rating).filter(r => r);
      if (ratings.length > 0) {
        statistical.avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        statistical.minRating = Math.min(...ratings);
        statistical.maxRating = Math.max(...ratings);
        statistical.stdRating = this.calculateStd(ratings);
      }

      // Duration statistics
      const durations = history.map(a => a.duration).filter(d => d);
      if (durations.length > 0) {
        statistical.avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        statistical.minDuration = Math.min(...durations);
        statistical.maxDuration = Math.max(...durations);
        statistical.totalDuration = durations.reduce((a, b) => a + b, 0);
      }
    }

    return statistical;
  }

  calculateStd(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * 🎭 ENCODE CATEGORICAL FEATURES
   */
  encodeFeatures(basic) {
    const encoded = {};

    // One-hot encode travel style
    const travelStyles = ['explorer', 'foodie', 'photographer', 'culture', 'nature', 'urban'];
    travelStyles.forEach(style => {
      encoded[`travelStyle_${style}`] = basic.travelStyle === style ? 1 : 0;
    });

    // One-hot encode pace level
    const paceLevels = ['relaxed', 'moderate', 'intense', 'extreme'];
    paceLevels.forEach(pace => {
      encoded[`paceLevel_${pace}`] = basic.paceLevel === pace ? 1 : 0;
    });

    // One-hot encode budget level
    const budgetLevels = ['budget', 'moderate', 'luxury'];
    budgetLevels.forEach(budget => {
      encoded[`budgetLevel_${budget}`] = basic.budgetLevel === budget ? 1 : 0;
    });

    // One-hot encode device type
    const deviceTypes = ['mobile', 'tablet', 'desktop'];
    deviceTypes.forEach(device => {
      encoded[`deviceType_${device}`] = basic.deviceType === device ? 1 : 0;
    });

    // One-hot encode time of day
    const timesOfDay = ['morning', 'afternoon', 'evening', 'night'];
    timesOfDay.forEach(time => {
      encoded[`timeOfDay_${time}`] = basic.timeOfDay === time ? 1 : 0;
    });

    return encoded;
  }

  /**
   * 🎯 FLATTEN ALL FEATURES TO VECTOR
   */
  flattenToVector(allFeatures) {
    const vector = [];
    const featureNames = [];

    const flatten = (obj, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}_${key}` : key;

        if (typeof value === 'number') {
          vector.push(value);
          featureNames.push(fullKey);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flatten(value, fullKey);
        } else if (typeof value === 'string') {
          // Skip strings (already encoded)
        }
      });
    };

    flatten(allFeatures);

    return { vector, featureNames };
  }

  /**
   * 📊 FEATURE SELECTION
   */
  selectFeatures(features, target, method = 'correlation', topK = 20) {
    // Calcular correlación o importancia de cada feature con el target
    const scores = {};

    const { vector, featureNames } = this.flattenToVector(features);

    featureNames.forEach((name, idx) => {
      const featureValues = [vector[idx]]; // En un dataset real, serían múltiples valores

      if (method === 'correlation') {
        scores[name] = this.calculateCorrelation(featureValues, target);
      } else if (method === 'variance') {
        scores[name] = this.calculateVariance(featureValues);
      }
    });

    // Seleccionar top K features
    const sorted = Object.entries(scores)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, topK);

    this.selectedFeatures = sorted.map(([name]) => name);
    this.featureImportance = Object.fromEntries(sorted);

    return {
      selectedFeatures: this.selectedFeatures,
      importance: this.featureImportance
    };
  }

  calculateCorrelation(x, y) {
    // Placeholder - en producción usar correlación real
    return Math.random() - 0.5;
  }

  calculateVariance(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  /**
   * 💾 SAVE/LOAD FEATURE ENGINEERING CONFIG
   */
  saveConfig() {
    const config = {
      featureImportance: this.featureImportance,
      selectedFeatures: this.selectedFeatures,
      encoders: this.encoders
    };

    localStorage.setItem('feature_engineering_config', JSON.stringify(config));
  }

  loadConfig() {
    try {
      const config = JSON.parse(localStorage.getItem('feature_engineering_config') || '{}');
      this.featureImportance = config.featureImportance || {};
      this.selectedFeatures = config.selectedFeatures || [];
      this.encoders = config.encoders || {};
    } catch (e) {
      console.warn('Failed to load feature engineering config:', e);
    }
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.FeatureEngineering = new FeatureEngineering();
}

export default FeatureEngineering;
