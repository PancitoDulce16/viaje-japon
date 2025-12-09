/**
 * 🔍 PATTERN RECOGNITION ENGINE
 * ===============================
 *
 * Motor de reconocimiento de patrones y clustering.
 * CAPA 2 del cerebro IA - Identifica patrones en comportamiento.
 *
 * Algoritmos implementados:
 * - K-Means Clustering (para segmentación de usuarios)
 * - DBSCAN (para detectar clusters de densidad)
 * - Association Rule Mining (para reglas de comportamiento)
 * - Temporal Pattern Detection (patrones en el tiempo)
 * - Personality Archetype Classification
 */

class PatternRecognitionEngine {
  constructor() {
    this.userArchetypes = this.defineArchetypes();
    this.behavioralPatterns = {};
    this.associationRules = [];
    this.clusters = null;

    console.log('🔍 Pattern Recognition Engine initialized');
  }

  /**
   * 👤 USER PERSONALITY ARCHETYPES
   */
  defineArchetypes() {
    return {
      explorer: {
        name: 'The Explorer',
        traits: {
          spontaneity: [0.7, 1.0],
          budgetSensitive: [0.0, 0.4],
          adventureLevel: [0.7, 1.0],
          culturalDepth: [0.6, 1.0],
          socialPreference: [0.4, 0.8]
        },
        description: 'Aventurero que busca experiencias únicas y auténticas'
      },
      foodie: {
        name: 'The Foodie',
        traits: {
          foodImportance: [0.8, 1.0],
          budgetSensitive: [0.0, 0.6],
          spontaneity: [0.5, 0.9],
          culturalDepth: [0.5, 0.9],
          socialPreference: [0.6, 1.0]
        },
        description: 'La comida es el centro de su experiencia de viaje'
      },
      photographer: {
        name: 'The Photographer',
        traits: {
          photoEnthusiasm: [0.8, 1.0],
          aestheticSensitivity: [0.7, 1.0],
          pacePreference: [0.3, 0.7], // Moderado (necesita tiempo para fotos)
          culturalDepth: [0.6, 1.0],
          spontaneity: [0.4, 0.8]
        },
        description: 'Busca momentos perfectos para capturar'
      },
      cultural: {
        name: 'The Culture Seeker',
        traits: {
          culturalDepth: [0.8, 1.0],
          historyInterest: [0.8, 1.0],
          pacePreference: [0.2, 0.6], // Lento, contemplativo
          budgetSensitive: [0.3, 0.7],
          adventureLevel: [0.3, 0.7]
        },
        description: 'Profundiza en historia, tradiciones y cultura local'
      },
      relaxer: {
        name: 'The Relaxer',
        traits: {
          pacePreference: [0.0, 0.4], // Muy lento
          comfortSeeker: [0.7, 1.0],
          spontaneity: [0.2, 0.6],
          budgetSensitive: [0.0, 0.5], // Dispuesto a pagar por confort
          adventureLevel: [0.0, 0.4]
        },
        description: 'Prioriza descanso y experiencias relajantes'
      },
      budget: {
        name: 'The Budget Traveler',
        traits: {
          budgetSensitive: [0.7, 1.0],
          valueSeeker: [0.8, 1.0],
          spontaneity: [0.5, 0.9],
          comfortSeeker: [0.2, 0.6],
          adventureLevel: [0.5, 0.9]
        },
        description: 'Maximiza experiencias minimizando gastos'
      },
      planner: {
        name: 'The Meticulous Planner',
        traits: {
          planningDepth: [0.8, 1.0],
          spontaneity: [0.0, 0.3],
          efficiency: [0.7, 1.0],
          controlPreference: [0.7, 1.0],
          riskTolerance: [0.0, 0.4]
        },
        description: 'Todo está investigado y organizado con detalle'
      },
      social: {
        name: 'The Social Butterfly',
        traits: {
          socialPreference: [0.8, 1.0],
          nightlifeInterest: [0.6, 1.0],
          groupOriented: [0.8, 1.0],
          spontaneity: [0.6, 0.9],
          adventureLevel: [0.5, 0.9]
        },
        description: 'Le encanta conocer gente y experiencias grupales'
      }
    };
  }

  /**
   * 🎯 CLASSIFY USER INTO ARCHETYPE
   */
  classifyUser(userData) {
    // Extrae traits del usuario de sus datos de comportamiento
    const userTraits = this.extractUserTraits(userData);

    // Calcula similaridad con cada arquetipo
    const scores = {};
    for (const [key, archetype] of Object.entries(this.userArchetypes)) {
      scores[key] = this.calculateArchetypeSimilarity(userTraits, archetype.traits);
    }

    // Ordena por score
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    return {
      primary: {
        type: sorted[0][0],
        name: this.userArchetypes[sorted[0][0]].name,
        score: sorted[0][1],
        description: this.userArchetypes[sorted[0][0]].description
      },
      secondary: sorted[1] ? {
        type: sorted[1][0],
        name: this.userArchetypes[sorted[1][0]].name,
        score: sorted[1][1]
      } : null,
      traits: userTraits,
      allScores: scores
    };
  }

  extractUserTraits(userData) {
    // Extrae traits cuantificables del comportamiento del usuario
    const traits = {};

    // Spontaneity (basado en tiempo de decisión)
    const avgDecisionTime = userData.behavioral?.avgDecisionTime || 30000;
    traits.spontaneity = this.normalize(Math.max(0, 60000 - avgDecisionTime), 0, 60000);

    // Budget sensitivity (basado en preferencias de precio)
    const budgetPreference = userData.preferences?.budgetLevel || 'moderate';
    traits.budgetSensitive = budgetPreference === 'budget' ? 0.9 :
                             budgetPreference === 'luxury' ? 0.2 : 0.5;

    // Adventure level (basado en tipos de actividades elegidas)
    const activityTypes = userData.preferences?.activityTypes || {};
    traits.adventureLevel = (activityTypes.adventure || 0) / 10;

    // Cultural depth
    traits.culturalDepth = ((activityTypes.culture || 0) + (activityTypes.history || 0)) / 20;

    // Social preference
    traits.socialPreference = userData.preferences?.companionType === 'group' ? 0.8 :
                              userData.preferences?.companionType === 'solo' ? 0.2 : 0.5;

    // Photo enthusiasm (basado en tiempo en actividades fotogénicas)
    traits.photoEnthusiasm = (activityTypes.photography || 0) / 10;

    // Food importance
    traits.foodImportance = (activityTypes.food || 0) / 10;

    // Pace preference (basado en actividades por día)
    const avgActivitiesPerDay = userData.preferences?.avgActivitiesPerDay || 4;
    traits.pacePreference = this.normalize(avgActivitiesPerDay, 2, 8);

    // Comfort seeking
    traits.comfortSeeker = budgetPreference === 'luxury' ? 0.9 :
                           budgetPreference === 'budget' ? 0.2 : 0.5;

    // Planning depth (basado en anticipación)
    const planningLeadTime = userData.preferences?.planningLeadTime || 60; // días
    traits.planningDepth = this.normalize(planningLeadTime, 7, 180);

    // Efficiency (basado en optimización de rutas)
    traits.efficiency = userData.preferences?.optimizeRoutes ? 0.8 : 0.4;

    return traits;
  }

  calculateArchetypeSimilarity(userTraits, archetypeTraits) {
    let totalScore = 0;
    let traitCount = 0;

    for (const [trait, range] of Object.entries(archetypeTraits)) {
      if (trait in userTraits) {
        const userValue = userTraits[trait];
        const [min, max] = range;

        // Score basado en qué tan bien el valor del usuario cae en el rango
        if (userValue >= min && userValue <= max) {
          // Dentro del rango: score alto
          const centerDistance = Math.abs(userValue - (min + max) / 2);
          const maxDistance = (max - min) / 2;
          totalScore += 1 - (centerDistance / maxDistance);
        } else {
          // Fuera del rango: score bajo basado en distancia
          const distance = userValue < min ? min - userValue : userValue - max;
          totalScore += Math.max(0, 1 - distance);
        }

        traitCount++;
      }
    }

    return traitCount > 0 ? totalScore / traitCount : 0;
  }

  /**
   * 📊 K-MEANS CLUSTERING
   */
  async kMeansClustering(dataPoints, k = 5, maxIterations = 100) {
    console.log(`🔬 Running K-Means with k=${k}...`);

    // 1. Inicializar centroides aleatoriamente
    let centroids = this.initializeCentroids(dataPoints, k);

    let iterations = 0;
    let converged = false;
    let clusters = [];

    while (!converged && iterations < maxIterations) {
      // 2. Asignar cada punto al centroide más cercano
      clusters = this.assignToClusters(dataPoints, centroids);

      // 3. Recalcular centroides
      const newCentroids = this.recalculateCentroids(clusters);

      // 4. Verificar convergencia
      converged = this.hasConverged(centroids, newCentroids);

      centroids = newCentroids;
      iterations++;
    }

    console.log(`✅ K-Means converged in ${iterations} iterations`);

    return {
      clusters,
      centroids,
      iterations,
      k
    };
  }

  initializeCentroids(dataPoints, k) {
    // K-Means++ initialization (mejor que random)
    const centroids = [];

    // Primer centroide aleatorio
    const firstIdx = Math.floor(Math.random() * dataPoints.length);
    centroids.push([...dataPoints[firstIdx]]);

    // Siguientes centroides basados en distancia
    while (centroids.length < k) {
      const distances = dataPoints.map(point => {
        const minDist = Math.min(...centroids.map(c => this.euclideanDistance(point, c)));
        return minDist * minDist; // Cuadrado de la distancia
      });

      // Probabilidad proporcional a distancia
      const totalDist = distances.reduce((a, b) => a + b, 0);
      const probabilities = distances.map(d => d / totalDist);

      // Seleccionar siguiente centroide
      const random = Math.random();
      let cumulative = 0;
      for (let i = 0; i < probabilities.length; i++) {
        cumulative += probabilities[i];
        if (random <= cumulative) {
          centroids.push([...dataPoints[i]]);
          break;
        }
      }
    }

    return centroids;
  }

  assignToClusters(dataPoints, centroids) {
    const clusters = centroids.map(() => []);

    dataPoints.forEach((point, idx) => {
      // Encontrar centroide más cercano
      const distances = centroids.map(c => this.euclideanDistance(point, c));
      const closestIdx = distances.indexOf(Math.min(...distances));

      clusters[closestIdx].push({ point, originalIndex: idx });
    });

    return clusters;
  }

  recalculateCentroids(clusters) {
    return clusters.map(cluster => {
      if (cluster.length === 0) return null;

      const dimensions = cluster[0].point.length;
      const newCentroid = Array(dimensions).fill(0);

      cluster.forEach(({ point }) => {
        point.forEach((value, dim) => {
          newCentroid[dim] += value;
        });
      });

      return newCentroid.map(sum => sum / cluster.length);
    }).filter(c => c !== null);
  }

  hasConverged(oldCentroids, newCentroids, threshold = 0.001) {
    for (let i = 0; i < oldCentroids.length; i++) {
      const distance = this.euclideanDistance(oldCentroids[i], newCentroids[i]);
      if (distance > threshold) return false;
    }
    return true;
  }

  euclideanDistance(a, b) {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
  }

  /**
   * 🌐 DBSCAN CLUSTERING (Density-based)
   */
  async dbscanClustering(dataPoints, epsilon = 0.5, minPoints = 5) {
    console.log(`🔬 Running DBSCAN with epsilon=${epsilon}, minPoints=${minPoints}...`);

    const labels = Array(dataPoints.length).fill(-1); // -1 = unvisited
    let clusterIdx = 0;

    for (let i = 0; i < dataPoints.length; i++) {
      if (labels[i] !== -1) continue; // Ya visitado

      // Encontrar vecinos
      const neighbors = this.regionQuery(dataPoints, i, epsilon);

      if (neighbors.length < minPoints) {
        labels[i] = 0; // Noise point
        continue;
      }

      // Expandir cluster
      clusterIdx++;
      this.expandCluster(dataPoints, labels, i, neighbors, clusterIdx, epsilon, minPoints);
    }

    // Organizar en clusters
    const clusters = {};
    labels.forEach((label, idx) => {
      if (label > 0) {
        if (!clusters[label]) clusters[label] = [];
        clusters[label].push({ point: dataPoints[idx], originalIndex: idx });
      }
    });

    console.log(`✅ DBSCAN found ${Object.keys(clusters).length} clusters`);

    return {
      clusters: Object.values(clusters),
      labels,
      noise: labels.filter(l => l === 0).length
    };
  }

  regionQuery(dataPoints, pointIdx, epsilon) {
    const neighbors = [];
    const point = dataPoints[pointIdx];

    dataPoints.forEach((otherPoint, idx) => {
      if (this.euclideanDistance(point, otherPoint) <= epsilon) {
        neighbors.push(idx);
      }
    });

    return neighbors;
  }

  expandCluster(dataPoints, labels, pointIdx, neighbors, clusterIdx, epsilon, minPoints) {
    labels[pointIdx] = clusterIdx;

    let i = 0;
    while (i < neighbors.length) {
      const neighborIdx = neighbors[i];

      if (labels[neighborIdx] === -1) {
        // Unvisited
        labels[neighborIdx] = clusterIdx;

        const newNeighbors = this.regionQuery(dataPoints, neighborIdx, epsilon);
        if (newNeighbors.length >= minPoints) {
          neighbors.push(...newNeighbors);
        }
      }

      if (labels[neighborIdx] === 0) {
        // Noise point becomes part of cluster
        labels[neighborIdx] = clusterIdx;
      }

      i++;
    }
  }

  /**
   * 📈 TEMPORAL PATTERN DETECTION
   */
  detectTemporalPatterns(userData) {
    const sessions = userData.sessions || [];

    if (sessions.length === 0) return null;

    // Analizar patrones de tiempo
    const hourCounts = Array(24).fill(0);
    const dayOfWeekCounts = Array(7).fill(0);
    const sessionLengths = [];

    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      const dayOfWeek = new Date(session.startTime).getDay();

      hourCounts[hour]++;
      dayOfWeekCounts[dayOfWeek]++;
      sessionLengths.push(session.duration);
    });

    // Encontrar patrones
    const preferredHours = this.findPeaks(hourCounts, 3);
    const preferredDays = this.findPeaks(dayOfWeekCounts, 2);
    const avgSessionLength = sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length;

    return {
      preferredHours,
      preferredDays: preferredDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]),
      avgSessionLength,
      totalSessions: sessions.length,
      pattern: this.classifyTimePattern(preferredHours, preferredDays)
    };
  }

  findPeaks(array, topN) {
    return array
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value)
      .slice(0, topN)
      .map(item => item.index);
  }

  classifyTimePattern(hours, days) {
    const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
    const isWeekend = days.some(d => d === 0 || d === 6);

    if (avgHour >= 20 && avgHour <= 23) {
      return 'night_owl';
    } else if (avgHour >= 6 && avgHour <= 9) {
      return 'early_bird';
    } else if (avgHour >= 12 && avgHour <= 14) {
      return 'lunch_break_planner';
    } else if (isWeekend) {
      return 'weekend_warrior';
    } else {
      return 'regular';
    }
  }

  /**
   * 🔗 ASSOCIATION RULE MINING (Apriori-like)
   */
  mineAssociationRules(transactions, minSupport = 0.3, minConfidence = 0.7) {
    console.log('🔗 Mining association rules...');

    // 1. Encontrar frequent itemsets
    const itemCounts = {};
    transactions.forEach(transaction => {
      transaction.forEach(item => {
        itemCounts[item] = (itemCounts[item] || 0) + 1;
      });
    });

    const frequentItems = Object.entries(itemCounts)
      .filter(([item, count]) => count / transactions.length >= minSupport)
      .map(([item]) => item);

    // 2. Generar reglas
    const rules = [];

    for (let i = 0; i < frequentItems.length; i++) {
      for (let j = 0; j < frequentItems.length; j++) {
        if (i === j) continue;

        const antecedent = frequentItems[i];
        const consequent = frequentItems[j];

        // Calcular support y confidence
        const support = this.calculateSupport(transactions, [antecedent, consequent]);
        const confidence = this.calculateConfidence(transactions, antecedent, consequent);

        if (support >= minSupport && confidence >= minConfidence) {
          rules.push({
            rule: `IF (${antecedent}) THEN (${consequent})`,
            antecedent,
            consequent,
            support,
            confidence,
            lift: this.calculateLift(transactions, antecedent, consequent)
          });
        }
      }
    }

    console.log(`✅ Found ${rules.length} association rules`);
    return rules.sort((a, b) => b.confidence - a.confidence);
  }

  calculateSupport(transactions, itemset) {
    const count = transactions.filter(t => itemset.every(item => t.includes(item))).length;
    return count / transactions.length;
  }

  calculateConfidence(transactions, antecedent, consequent) {
    const antecedentCount = transactions.filter(t => t.includes(antecedent)).length;
    if (antecedentCount === 0) return 0;

    const bothCount = transactions.filter(t => t.includes(antecedent) && t.includes(consequent)).length;
    return bothCount / antecedentCount;
  }

  calculateLift(transactions, antecedent, consequent) {
    const confidence = this.calculateConfidence(transactions, antecedent, consequent);
    const consequentSupport = this.calculateSupport(transactions, [consequent]);

    return consequentSupport === 0 ? 0 : confidence / consequentSupport;
  }

  /**
   * 🛠️ UTILITY FUNCTIONS
   */

  normalize(value, min, max) {
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
  }

  /**
   * 💾 SAVE PATTERNS
   */
  async savePatterns(userId, patterns) {
    const key = `patterns_${userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(patterns));
      console.log('💾 Patterns saved for user:', userId);
    } catch (e) {
      console.warn('Failed to save patterns:', e);
    }
  }

  async loadPatterns(userId) {
    const key = `patterns_${userId}`;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to load patterns:', e);
      return null;
    }
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.PatternRecognitionEngine = new PatternRecognitionEngine();
}

export default PatternRecognitionEngine;
