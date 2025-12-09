/**
 * ⚙️ DATA PIPELINE
 * =================
 *
 * Pipeline de procesamiento de datos para ML.
 * Convierte datos crudos del Sensor Layer en features listas para ML.
 *
 * Responsabilidades:
 * - Data cleaning y validation
 * - Transformación de datos
 * - Feature extraction
 * - Normalization y scaling
 * - Data aggregation
 * - Real-time processing
 */

class DataPipeline {
  constructor() {
    this.processingQueue = [];
    this.isProcessing = false;
    this.batchSize = 100;
    this.processInterval = 5000; // Procesar cada 5 segundos

    console.log('⚙️ Data Pipeline initialized');
    this.startProcessing();
  }

  /**
   * 🎯 MAIN PROCESSING ENTRY POINT
   */
  async process(rawData) {
    // Agregar a cola de procesamiento
    this.processingQueue.push({
      data: rawData,
      timestamp: Date.now(),
      processed: false
    });

    // Si la cola está muy grande, procesar inmediatamente
    if (this.processingQueue.length >= this.batchSize) {
      await this.processBatch();
    }
  }

  /**
   * 🔄 CONTINUOUS PROCESSING
   */
  startProcessing() {
    setInterval(async () => {
      if (this.processingQueue.length > 0 && !this.isProcessing) {
        await this.processBatch();
      }
    }, this.processInterval);

    console.log('✅ Continuous processing started');
  }

  async processBatch() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    console.log(`⚙️ Processing batch of ${this.processingQueue.length} items...`);

    try {
      // Tomar items de la cola
      const batch = this.processingQueue.splice(0, this.batchSize);

      // Pipeline stages
      const cleaned = await this.cleanData(batch);
      const validated = await this.validateData(cleaned);
      const transformed = await this.transformData(validated);
      const features = await this.extractFeatures(transformed);
      const normalized = await this.normalizeData(features);
      const aggregated = await this.aggregateData(normalized);

      // Guardar resultados procesados
      await this.saveProcessedData(aggregated);

      // Emitir evento de datos procesados
      window.dispatchEvent(new CustomEvent('dataPipelineProcessed', {
        detail: { processedData: aggregated, count: batch.length }
      }));

      console.log(`✅ Batch processed: ${batch.length} items`);
    } catch (error) {
      console.error('❌ Error processing batch:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 🧹 DATA CLEANING
   */
  async cleanData(batch) {
    return batch.map(item => {
      const cleaned = { ...item };

      // Remover datos inválidos
      if (cleaned.data.behavioral) {
        // Limpiar clicks con posiciones inválidas
        cleaned.data.behavioral.clicks = cleaned.data.behavioral.clicks.filter(click =>
          click.position &&
          click.position.x >= 0 &&
          click.position.y >= 0
        );

        // Limpiar scrolls duplicados
        cleaned.data.behavioral.scrolls = this.removeDuplicateScrolls(
          cleaned.data.behavioral.scrolls
        );

        // Limpiar hovers sin duración
        cleaned.data.behavioral.hovers = cleaned.data.behavioral.hovers.filter(hover =>
          hover.duration !== undefined
        );
      }

      // Limpiar timestamps inválidos
      if (cleaned.timestamp && !this.isValidTimestamp(cleaned.timestamp)) {
        cleaned.timestamp = Date.now();
      }

      return cleaned;
    });
  }

  removeDuplicateScrolls(scrolls) {
    if (!scrolls || scrolls.length === 0) return [];

    const unique = [];
    let lastScroll = null;

    scrolls.forEach(scroll => {
      if (!lastScroll ||
          scroll.timestamp - lastScroll.timestamp > 100 ||
          Math.abs(scroll.scrollY - lastScroll.scrollY) > 10) {
        unique.push(scroll);
        lastScroll = scroll;
      }
    });

    return unique;
  }

  isValidTimestamp(timestamp) {
    const now = Date.now();
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
    return timestamp >= oneYearAgo && timestamp <= now;
  }

  /**
   * ✅ DATA VALIDATION
   */
  async validateData(batch) {
    return batch.filter(item => {
      // Validar estructura básica
      if (!item.data || !item.timestamp) {
        console.warn('Invalid item structure:', item);
        return false;
      }

      // Validar behavioral data
      if (item.data.behavioral) {
        if (!Array.isArray(item.data.behavioral.clicks) ||
            !Array.isArray(item.data.behavioral.scrolls)) {
          console.warn('Invalid behavioral data structure');
          return false;
        }
      }

      // Validar contextual data
      if (item.data.contextual) {
        if (!item.data.contextual.deviceInfo) {
          console.warn('Missing device info');
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 🔄 DATA TRANSFORMATION
   */
  async transformData(batch) {
    return batch.map(item => {
      const transformed = { ...item };

      // Transform behavioral data
      if (transformed.data.behavioral) {
        // Calcular métricas derivadas
        transformed.data.behavioral.clickRate = this.calculateClickRate(
          transformed.data.behavioral.clicks,
          transformed.data.duration
        );

        transformed.data.behavioral.scrollVelocity = this.calculateScrollVelocity(
          transformed.data.behavioral.scrolls
        );

        transformed.data.behavioral.hoverIntensity = this.calculateHoverIntensity(
          transformed.data.behavioral.hovers
        );

        // Engagement score
        transformed.data.behavioral.engagementScore = this.calculateEngagementScore(
          transformed.data.behavioral
        );
      }

      // Transform contextual data
      if (transformed.data.contextual) {
        // Categorizar hora del día
        transformed.data.contextual.timeOfDayCategory = this.categorizeTimeOfDay(
          new Date(transformed.timestamp).getHours()
        );

        // Categorizar día de la semana
        transformed.data.contextual.dayCategory = this.categorizeDayOfWeek(
          new Date(transformed.timestamp).getDay()
        );

        // Device category
        transformed.data.contextual.deviceCategory = this.categorizeDevice(
          transformed.data.contextual.deviceInfo
        );
      }

      return transformed;
    });
  }

  calculateClickRate(clicks, duration) {
    if (!clicks || !duration || duration === 0) return 0;
    return (clicks.length / duration) * 60000; // clicks per minute
  }

  calculateScrollVelocity(scrolls) {
    if (!scrolls || scrolls.length < 2) return 0;

    const velocities = [];
    for (let i = 1; i < scrolls.length; i++) {
      const distance = Math.abs(scrolls[i].scrollY - scrolls[i-1].scrollY);
      const time = (scrolls[i].timestamp - scrolls[i-1].timestamp) / 1000; // seconds

      if (time > 0) {
        velocities.push(distance / time);
      }
    }

    return velocities.length > 0
      ? velocities.reduce((a, b) => a + b, 0) / velocities.length
      : 0;
  }

  calculateHoverIntensity(hovers) {
    if (!hovers || hovers.length === 0) return 0;

    const totalDuration = hovers.reduce((sum, h) => sum + (h.duration || 0), 0);
    return totalDuration / hovers.length; // average hover duration
  }

  calculateEngagementScore(behavioral) {
    // Score de 0-100 basado en múltiples factores
    let score = 0;

    // Clicks (max 30 points)
    const clickRate = behavioral.clickRate || 0;
    score += Math.min(30, clickRate * 5);

    // Scrolls (max 25 points)
    const scrollVelocity = behavioral.scrollVelocity || 0;
    score += Math.min(25, (scrollVelocity / 100) * 25);

    // Hovers (max 25 points)
    const hoverIntensity = behavioral.hoverIntensity || 0;
    score += Math.min(25, (hoverIntensity / 2000) * 25);

    // Time on page (max 20 points)
    const timeOnPage = behavioral.timeOnPage || {};
    const totalTime = Object.values(timeOnPage).reduce((a, b) => a + b, 0);
    score += Math.min(20, (totalTime / 60000) * 5); // 1 point per minute, max 20

    return Math.min(100, Math.round(score));
  }

  categorizeTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  categorizeDayOfWeek(day) {
    return [0, 6].includes(day) ? 'weekend' : 'weekday';
  }

  categorizeDevice(deviceInfo) {
    if (deviceInfo.isMobile) return 'mobile';
    if (deviceInfo.isTablet) return 'tablet';
    return 'desktop';
  }

  /**
   * 🎨 FEATURE EXTRACTION
   */
  async extractFeatures(batch) {
    return batch.map(item => {
      const features = {
        ...item,
        extractedFeatures: {}
      };

      // Behavioral features
      if (item.data.behavioral) {
        features.extractedFeatures.behavioral = {
          clickCount: item.data.behavioral.clicks?.length || 0,
          scrollCount: item.data.behavioral.scrolls?.length || 0,
          hoverCount: item.data.behavioral.hovers?.length || 0,
          clickRate: item.data.behavioral.clickRate || 0,
          scrollVelocity: item.data.behavioral.scrollVelocity || 0,
          hoverIntensity: item.data.behavioral.hoverIntensity || 0,
          engagementScore: item.data.behavioral.engagementScore || 0,
          avgDecisionTime: this.calculateAvgDecisionTime(item.data.behavioral.decisionTimes),
          editPatternCount: item.data.behavioral.editPatterns?.length || 0
        };
      }

      // Contextual features
      if (item.data.contextual) {
        features.extractedFeatures.contextual = {
          hour: new Date(item.timestamp).getHours(),
          dayOfWeek: new Date(item.timestamp).getDay(),
          timeCategory: item.data.contextual.timeOfDayCategory,
          dayCategory: item.data.contextual.dayCategory,
          deviceCategory: item.data.contextual.deviceCategory,
          isMobile: item.data.contextual.deviceInfo?.isMobile ? 1 : 0,
          isTablet: item.data.contextual.deviceInfo?.isTablet ? 1 : 0,
          isDesktop: item.data.contextual.deviceInfo?.isDesktop ? 1 : 0,
          isWeekend: item.data.contextual.dayCategory === 'weekend' ? 1 : 0
        };
      }

      // Preference features
      if (item.data.preferences) {
        features.extractedFeatures.preferences = {
          explicitCount: Object.values(item.data.preferences.explicit || {}).flat().length,
          implicitCount: Object.keys(item.data.preferences.implicit || {}).length,
          hasRatings: (item.data.preferences.explicit?.rating?.length || 0) > 0 ? 1 : 0,
          hasLikes: (item.data.preferences.explicit?.like?.length || 0) > 0 ? 1 : 0,
          hasDislikes: (item.data.preferences.explicit?.dislike?.length || 0) > 0 ? 1 : 0
        };
      }

      // Temporal features
      features.extractedFeatures.temporal = {
        sessionDuration: item.data.duration || 0,
        timestamp: item.timestamp,
        hourSin: Math.sin(2 * Math.PI * new Date(item.timestamp).getHours() / 24),
        hourCos: Math.cos(2 * Math.PI * new Date(item.timestamp).getHours() / 24),
        dayOfWeekSin: Math.sin(2 * Math.PI * new Date(item.timestamp).getDay() / 7),
        dayOfWeekCos: Math.cos(2 * Math.PI * new Date(item.timestamp).getDay() / 7)
      };

      return features;
    });
  }

  calculateAvgDecisionTime(decisionTimes) {
    if (!decisionTimes || decisionTimes.length === 0) return 0;
    const total = decisionTimes.reduce((sum, d) => sum + d.duration, 0);
    return total / decisionTimes.length;
  }

  /**
   * 📊 NORMALIZATION & SCALING
   */
  async normalizeData(batch) {
    // Calcular stats globales para normalización
    const stats = this.calculateGlobalStats(batch);

    return batch.map(item => {
      const normalized = { ...item };

      if (item.extractedFeatures) {
        normalized.normalizedFeatures = {};

        // Normalizar behavioral features
        if (item.extractedFeatures.behavioral) {
          normalized.normalizedFeatures.behavioral = this.normalizeFeatureSet(
            item.extractedFeatures.behavioral,
            stats.behavioral
          );
        }

        // Normalizar contextual features (ya son categóricas en su mayoría)
        if (item.extractedFeatures.contextual) {
          normalized.normalizedFeatures.contextual = {
            ...item.extractedFeatures.contextual
          };
        }

        // Normalizar temporal features
        if (item.extractedFeatures.temporal) {
          normalized.normalizedFeatures.temporal = this.normalizeFeatureSet(
            item.extractedFeatures.temporal,
            stats.temporal
          );
        }
      }

      return normalized;
    });
  }

  calculateGlobalStats(batch) {
    const stats = {
      behavioral: {},
      temporal: {}
    };

    // Calcular min, max, mean, std para cada feature
    const behavioralFeatures = batch
      .map(b => b.extractedFeatures?.behavioral)
      .filter(Boolean);

    const temporalFeatures = batch
      .map(b => b.extractedFeatures?.temporal)
      .filter(Boolean);

    // Behavioral stats
    if (behavioralFeatures.length > 0) {
      const keys = Object.keys(behavioralFeatures[0]);
      keys.forEach(key => {
        const values = behavioralFeatures.map(f => f[key]).filter(v => typeof v === 'number');
        if (values.length > 0) {
          stats.behavioral[key] = this.calculateStats(values);
        }
      });
    }

    // Temporal stats
    if (temporalFeatures.length > 0) {
      const keys = Object.keys(temporalFeatures[0]);
      keys.forEach(key => {
        const values = temporalFeatures.map(f => f[key]).filter(v => typeof v === 'number');
        if (values.length > 0) {
          stats.temporal[key] = this.calculateStats(values);
        }
      });
    }

    return stats;
  }

  calculateStats(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    // Standard deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    return { min, max, mean, std };
  }

  normalizeFeatureSet(features, stats) {
    const normalized = {};

    Object.entries(features).forEach(([key, value]) => {
      if (typeof value !== 'number') {
        normalized[key] = value;
        return;
      }

      if (stats[key]) {
        // Z-score normalization
        normalized[key] = stats[key].std > 0
          ? (value - stats[key].mean) / stats[key].std
          : 0;
      } else {
        normalized[key] = value;
      }
    });

    return normalized;
  }

  /**
   * 📦 DATA AGGREGATION
   */
  async aggregateData(batch) {
    // Agregar por sesión
    const sessionMap = {};

    batch.forEach(item => {
      const sessionId = item.data.sessionId || item.sessionId;

      if (!sessionMap[sessionId]) {
        sessionMap[sessionId] = {
          sessionId,
          items: [],
          aggregated: null
        };
      }

      sessionMap[sessionId].items.push(item);
    });

    // Agregar features por sesión
    Object.values(sessionMap).forEach(session => {
      session.aggregated = this.aggregateSession(session.items);
    });

    return Object.values(sessionMap);
  }

  aggregateSession(items) {
    if (items.length === 0) return null;

    const aggregated = {
      totalItems: items.length,
      firstTimestamp: Math.min(...items.map(i => i.timestamp)),
      lastTimestamp: Math.max(...items.map(i => i.timestamp)),
      features: {}
    };

    // Agregar behavioral features
    const behavioralFeatures = items
      .map(i => i.normalizedFeatures?.behavioral)
      .filter(Boolean);

    if (behavioralFeatures.length > 0) {
      aggregated.features.behavioral = this.aggregateFeatures(behavioralFeatures);
    }

    // Agregar contextual features (mode para categóricas)
    const contextualFeatures = items
      .map(i => i.extractedFeatures?.contextual)
      .filter(Boolean);

    if (contextualFeatures.length > 0) {
      aggregated.features.contextual = {
        deviceCategory: this.mode(contextualFeatures.map(f => f.deviceCategory)),
        timeCategory: this.mode(contextualFeatures.map(f => f.timeCategory)),
        dayCategory: this.mode(contextualFeatures.map(f => f.dayCategory)),
        isMobile: this.mode(contextualFeatures.map(f => f.isMobile)),
        isWeekend: this.mode(contextualFeatures.map(f => f.isWeekend))
      };
    }

    // Agregar temporal features
    const temporalFeatures = items
      .map(i => i.normalizedFeatures?.temporal)
      .filter(Boolean);

    if (temporalFeatures.length > 0) {
      aggregated.features.temporal = this.aggregateFeatures(temporalFeatures);
    }

    return aggregated;
  }

  aggregateFeatures(featuresList) {
    const aggregated = {};
    const keys = Object.keys(featuresList[0]);

    keys.forEach(key => {
      const values = featuresList.map(f => f[key]).filter(v => typeof v === 'number');

      if (values.length > 0) {
        aggregated[`${key}_mean`] = values.reduce((a, b) => a + b, 0) / values.length;
        aggregated[`${key}_max`] = Math.max(...values);
        aggregated[`${key}_min`] = Math.min(...values);
        aggregated[`${key}_std`] = this.calculateStd(values);
      }
    });

    return aggregated;
  }

  calculateStd(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  mode(array) {
    const counts = {};
    array.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });

    let maxCount = 0;
    let modeValue = null;

    Object.entries(counts).forEach(([val, count]) => {
      if (count > maxCount) {
        maxCount = count;
        modeValue = val;
      }
    });

    return modeValue;
  }

  /**
   * 💾 SAVE PROCESSED DATA
   */
  async saveProcessedData(processedSessions) {
    const userId = window.firebase?.auth()?.currentUser?.uid || 'anonymous';
    const key = `processed_data_${userId}`;

    try {
      // Cargar datos existentes
      const existing = JSON.parse(localStorage.getItem(key) || '[]');

      // Agregar nuevas sesiones
      processedSessions.forEach(session => {
        existing.push(session);
      });

      // Mantener solo últimas 100 sesiones
      const trimmed = existing.slice(-100);

      localStorage.setItem(key, JSON.stringify(trimmed));

      console.log(`💾 Saved ${processedSessions.length} processed sessions`);
    } catch (e) {
      console.warn('Failed to save processed data:', e);
    }
  }

  /**
   * 📊 GET PROCESSED DATA
   */
  async getProcessedData(userId = null) {
    const uid = userId || window.firebase?.auth()?.currentUser?.uid || 'anonymous';
    const key = `processed_data_${uid}`;

    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load processed data:', e);
      return [];
    }
  }

  /**
   * 🔍 GET STATISTICS
   */
  async getStatistics() {
    const data = await this.getProcessedData();

    if (data.length === 0) {
      return {
        totalSessions: 0,
        totalItems: 0,
        avgItemsPerSession: 0,
        avgSessionDuration: 0
      };
    }

    const totalSessions = data.length;
    const totalItems = data.reduce((sum, s) => sum + (s.totalItems || 0), 0);
    const avgItemsPerSession = totalItems / totalSessions;

    const durations = data.map(s => s.lastTimestamp - s.firstTimestamp).filter(d => d > 0);
    const avgSessionDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    return {
      totalSessions,
      totalItems,
      avgItemsPerSession,
      avgSessionDuration: avgSessionDuration / 1000 // seconds
    };
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.DataPipeline = new DataPipeline();
}

export default DataPipeline;
