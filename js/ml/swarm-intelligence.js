/**
 * 🐝 SWARM INTELLIGENCE - FASE 3.3
 * =================================
 *
 * Optimización basada en comportamiento colectivo de enjambres.
 *
 * "Muchos agentes simples resuelven problemas complejos"
 *
 * Algoritmos implementados:
 * - Particle Swarm Optimization (PSO)
 * - Ant Colony Optimization (ACO)
 * - Bee Algorithm (simplificado)
 * - Firefly Algorithm
 *
 * Aplicaciones:
 * - Optimización de itinerarios (ruta óptima)
 * - Distribución de presupuesto
 * - Selección de actividades
 * - Balanceo fatiga/disfrute
 *
 * Inspiración:
 * - Comportamiento de hormigas encontrando comida
 * - Pájaros volando en formación
 * - Abejas explorando flores
 */

class SwarmIntelligence {
  constructor() {
    this.initialized = false;

    // Swarm parameters
    this.swarmSize = 30;
    this.maxIterations = 100;

    // PSO parameters
    this.inertiaWeight = 0.7;
    this.cognitiveWeight = 1.5; // c1 - personal best influence
    this.socialWeight = 1.5; // c2 - global best influence

    // ACO parameters
    this.pheromoneEvaporation = 0.1;
    this.pheromoneIntensity = 100;
    this.alpha = 1.0; // Pheromone importance
    this.beta = 2.0; // Heuristic importance

    console.log('🐝 Swarm Intelligence initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    this.initialized = true;
    console.log('✅ Swarm Intelligence initialized');
  }

  // ============================================
  // 🌊 PARTICLE SWARM OPTIMIZATION (PSO)
  // ============================================

  /**
   * Optimize using Particle Swarm Optimization
   * @param {Function} objectiveFunction - Function to optimize (maximize)
   * @param {Object} bounds - { min: [...], max: [...] } for each dimension
   * @param {Object} options - { swarmSize, maxIterations }
   */
  async particleSwarmOptimization(objectiveFunction, bounds, options = {}) {
    const swarmSize = options.swarmSize || this.swarmSize;
    const maxIterations = options.maxIterations || this.maxIterations;
    const dimensions = bounds.min.length;

    // Initialize swarm
    const particles = [];
    let globalBest = {
      position: null,
      fitness: -Infinity
    };

    for (let i = 0; i < swarmSize; i++) {
      const particle = {
        position: this.randomPosition(bounds),
        velocity: this.randomVelocity(bounds),
        personalBest: {
          position: null,
          fitness: -Infinity
        }
      };

      // Evaluate initial fitness
      particle.fitness = objectiveFunction(particle.position);
      particle.personalBest.position = [...particle.position];
      particle.personalBest.fitness = particle.fitness;

      // Update global best
      if (particle.fitness > globalBest.fitness) {
        globalBest.position = [...particle.position];
        globalBest.fitness = particle.fitness;
      }

      particles.push(particle);
    }

    // Main PSO loop
    const history = [];

    for (let iter = 0; iter < maxIterations; iter++) {
      particles.forEach(particle => {
        // Update velocity
        for (let d = 0; d < dimensions; d++) {
          const r1 = Math.random();
          const r2 = Math.random();

          const cognitive = this.cognitiveWeight * r1 *
            (particle.personalBest.position[d] - particle.position[d]);

          const social = this.socialWeight * r2 *
            (globalBest.position[d] - particle.position[d]);

          particle.velocity[d] = this.inertiaWeight * particle.velocity[d] +
                                cognitive + social;

          // Clamp velocity
          const maxVel = (bounds.max[d] - bounds.min[d]) * 0.2;
          particle.velocity[d] = Math.max(-maxVel, Math.min(maxVel, particle.velocity[d]));
        }

        // Update position
        for (let d = 0; d < dimensions; d++) {
          particle.position[d] += particle.velocity[d];

          // Clamp position to bounds
          particle.position[d] = Math.max(bounds.min[d],
            Math.min(bounds.max[d], particle.position[d]));
        }

        // Evaluate fitness
        particle.fitness = objectiveFunction(particle.position);

        // Update personal best
        if (particle.fitness > particle.personalBest.fitness) {
          particle.personalBest.position = [...particle.position];
          particle.personalBest.fitness = particle.fitness;
        }

        // Update global best
        if (particle.fitness > globalBest.fitness) {
          globalBest.position = [...particle.position];
          globalBest.fitness = particle.fitness;
        }
      });

      history.push({
        iteration: iter,
        bestFitness: globalBest.fitness,
        avgFitness: particles.reduce((sum, p) => sum + p.fitness, 0) / swarmSize
      });

      // Early stopping if converged
      if (iter > 20 && this.hasConverged(history.slice(-20))) {
        console.log(`✅ PSO converged at iteration ${iter}`);
        break;
      }
    }

    return {
      bestSolution: globalBest.position,
      bestFitness: globalBest.fitness,
      history,
      iterations: history.length
    };
  }

  randomPosition(bounds) {
    return bounds.min.map((min, i) => {
      return min + Math.random() * (bounds.max[i] - min);
    });
  }

  randomVelocity(bounds) {
    return bounds.min.map((min, i) => {
      const range = bounds.max[i] - min;
      return (Math.random() - 0.5) * range * 0.1;
    });
  }

  hasConverged(recentHistory) {
    const fitnessValues = recentHistory.map(h => h.bestFitness);
    const variance = this.calculateVariance(fitnessValues);
    return variance < 0.001;
  }

  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  // ============================================
  // 🐜 ANT COLONY OPTIMIZATION (ACO)
  // ============================================

  /**
   * Solve Traveling Salesman Problem using Ant Colony Optimization
   * @param {Array} locations - Array of locations with coordinates
   * @param {Object} options - { numAnts, maxIterations }
   */
  async antColonyOptimization(locations, options = {}) {
    const numAnts = options.numAnts || this.swarmSize;
    const maxIterations = options.maxIterations || this.maxIterations;
    const numLocations = locations.length;

    // Calculate distance matrix
    const distances = this.calculateDistanceMatrix(locations);

    // Initialize pheromones
    const pheromones = Array(numLocations).fill(null)
      .map(() => Array(numLocations).fill(1.0));

    let globalBest = {
      tour: null,
      distance: Infinity
    };

    const history = [];

    for (let iter = 0; iter < maxIterations; iter++) {
      const ants = [];

      // Each ant constructs a tour
      for (let ant = 0; ant < numAnts; ant++) {
        const tour = this.constructTour(distances, pheromones, numLocations);
        const distance = this.calculateTourDistance(tour, distances);

        ants.push({ tour, distance });

        // Update global best
        if (distance < globalBest.distance) {
          globalBest.tour = [...tour];
          globalBest.distance = distance;
        }
      }

      // Evaporate pheromones
      for (let i = 0; i < numLocations; i++) {
        for (let j = 0; j < numLocations; j++) {
          pheromones[i][j] *= (1 - this.pheromoneEvaporation);
        }
      }

      // Deposit pheromones
      ants.forEach(ant => {
        const pheromoneDeposit = this.pheromoneIntensity / ant.distance;

        for (let i = 0; i < ant.tour.length - 1; i++) {
          const from = ant.tour[i];
          const to = ant.tour[i + 1];

          pheromones[from][to] += pheromoneDeposit;
          pheromones[to][from] += pheromoneDeposit;
        }
      });

      history.push({
        iteration: iter,
        bestDistance: globalBest.distance,
        avgDistance: ants.reduce((sum, a) => sum + a.distance, 0) / numAnts
      });
    }

    return {
      bestTour: globalBest.tour.map(idx => locations[idx]),
      bestDistance: globalBest.distance,
      tourIndices: globalBest.tour,
      history,
      improvement: ((history[0].bestDistance - globalBest.distance) /
                   history[0].bestDistance * 100).toFixed(2) + '%'
    };
  }

  calculateDistanceMatrix(locations) {
    const n = locations.length;
    const distances = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dist = this.euclideanDistance(locations[i], locations[j]);
        distances[i][j] = dist;
        distances[j][i] = dist;
      }
    }

    return distances;
  }

  euclideanDistance(loc1, loc2) {
    const dx = loc1.x - loc2.x;
    const dy = loc1.y - loc2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  constructTour(distances, pheromones, numLocations) {
    const tour = [];
    const visited = new Set();

    // Start at random location
    let current = Math.floor(Math.random() * numLocations);
    tour.push(current);
    visited.add(current);

    // Construct rest of tour
    while (visited.size < numLocations) {
      const next = this.selectNextLocation(current, visited, distances, pheromones, numLocations);
      tour.push(next);
      visited.add(next);
      current = next;
    }

    // Return to start
    tour.push(tour[0]);

    return tour;
  }

  selectNextLocation(current, visited, distances, pheromones, numLocations) {
    const probabilities = [];
    let totalProb = 0;

    for (let i = 0; i < numLocations; i++) {
      if (visited.has(i)) {
        probabilities[i] = 0;
        continue;
      }

      const pheromone = Math.pow(pheromones[current][i], this.alpha);
      const heuristic = Math.pow(1.0 / (distances[current][i] + 0.001), this.beta);

      probabilities[i] = pheromone * heuristic;
      totalProb += probabilities[i];
    }

    // Roulette wheel selection
    let random = Math.random() * totalProb;
    let cumulative = 0;

    for (let i = 0; i < numLocations; i++) {
      if (visited.has(i)) continue;

      cumulative += probabilities[i];
      if (cumulative >= random) {
        return i;
      }
    }

    // Fallback: return first unvisited
    for (let i = 0; i < numLocations; i++) {
      if (!visited.has(i)) return i;
    }

    return 0;
  }

  calculateTourDistance(tour, distances) {
    let total = 0;
    for (let i = 0; i < tour.length - 1; i++) {
      total += distances[tour[i]][tour[i + 1]];
    }
    return total;
  }

  // ============================================
  // 🔥 FIREFLY ALGORITHM
  // ============================================

  /**
   * Firefly Algorithm for optimization
   * Fireflies attracted to brighter fireflies
   */
  async fireflyAlgorithm(objectiveFunction, bounds, options = {}) {
    const numFireflies = options.numFireflies || this.swarmSize;
    const maxIterations = options.maxIterations || this.maxIterations;
    const dimensions = bounds.min.length;

    const alpha = 0.2; // Randomness
    const beta0 = 1.0; // Initial attractiveness
    const gamma = 1.0; // Light absorption

    // Initialize fireflies
    const fireflies = [];

    for (let i = 0; i < numFireflies; i++) {
      const position = this.randomPosition(bounds);
      const brightness = objectiveFunction(position);

      fireflies.push({ position, brightness });
    }

    const history = [];
    let globalBest = {
      position: null,
      brightness: -Infinity
    };

    for (let iter = 0; iter < maxIterations; iter++) {
      // Move fireflies towards brighter ones
      for (let i = 0; i < numFireflies; i++) {
        for (let j = 0; j < numFireflies; j++) {
          if (fireflies[j].brightness > fireflies[i].brightness) {
            // Calculate distance
            const r = this.calculateDistance(fireflies[i].position, fireflies[j].position);

            // Calculate attractiveness
            const beta = beta0 * Math.exp(-gamma * r * r);

            // Move towards brighter firefly
            for (let d = 0; d < dimensions; d++) {
              fireflies[i].position[d] +=
                beta * (fireflies[j].position[d] - fireflies[i].position[d]) +
                alpha * (Math.random() - 0.5);

              // Clamp to bounds
              fireflies[i].position[d] = Math.max(bounds.min[d],
                Math.min(bounds.max[d], fireflies[i].position[d]));
            }

            // Update brightness
            fireflies[i].brightness = objectiveFunction(fireflies[i].position);
          }
        }

        // Update global best
        if (fireflies[i].brightness > globalBest.brightness) {
          globalBest.position = [...fireflies[i].position];
          globalBest.brightness = fireflies[i].brightness;
        }
      }

      history.push({
        iteration: iter,
        bestBrightness: globalBest.brightness,
        avgBrightness: fireflies.reduce((sum, f) => sum + f.brightness, 0) / numFireflies
      });
    }

    return {
      bestSolution: globalBest.position,
      bestFitness: globalBest.brightness,
      history,
      iterations: history.length
    };
  }

  calculateDistance(pos1, pos2) {
    return Math.sqrt(
      pos1.reduce((sum, val, i) => sum + Math.pow(val - pos2[i], 2), 0)
    );
  }

  // ============================================
  // 🎯 SPECIALIZED APPLICATIONS
  // ============================================

  /**
   * Optimize itinerary using swarm intelligence
   */
  async optimizeItinerary(activities, constraints) {
    const {
      days,
      maxActivitiesPerDay = 5,
      budget,
      prioritizeLowFatigue = false
    } = constraints;

    // Objective function: maximize enjoyment while respecting constraints
    const objectiveFunction = (solution) => {
      return this.evaluateItinerarySolution(solution, activities, constraints);
    };

    // Use PSO to find optimal activity selection
    const numActivities = activities.length;
    const bounds = {
      min: Array(days * maxActivitiesPerDay).fill(0),
      max: Array(days * maxActivitiesPerDay).fill(numActivities - 1)
    };

    const result = await this.particleSwarmOptimization(objectiveFunction, bounds, {
      swarmSize: 20,
      maxIterations: 50
    });

    // Decode solution to actual itinerary
    const itinerary = this.decodeSolution(result.bestSolution, activities, days, maxActivitiesPerDay);

    return {
      itinerary,
      score: result.bestFitness,
      optimizationHistory: result.history
    };
  }

  evaluateItinerarySolution(solution, activities, constraints) {
    const { days, budget, prioritizeLowFatigue } = constraints;

    let totalEnjoyment = 0;
    let totalCost = 0;
    let totalFatigue = 0;
    let penalties = 0;

    // Decode solution
    const itinerary = this.decodeSolution(solution, activities, days, 5);

    itinerary.forEach((dayActivities, dayIndex) => {
      let dailyFatigue = 0;

      dayActivities.forEach(activity => {
        if (!activity) return;

        totalEnjoyment += activity.rating || 4.0;
        totalCost += activity.price || 0;
        dailyFatigue += activity.fatigueImpact || 10;
      });

      totalFatigue += dailyFatigue;

      // Penalty for too many activities in one day
      if (dayActivities.length > 6) {
        penalties += (dayActivities.length - 6) * 10;
      }

      // Penalty for very high daily fatigue
      if (dailyFatigue > 60) {
        penalties += (dailyFatigue - 60);
      }
    });

    // Penalty for exceeding budget
    if (totalCost > budget) {
      penalties += (totalCost - budget) / 1000;
    }

    // Calculate final score
    let score = totalEnjoyment;

    if (prioritizeLowFatigue) {
      score -= totalFatigue * 0.1;
    }

    score -= penalties;

    return Math.max(0, score);
  }

  decodeSolution(solution, activities, days, maxPerDay) {
    const itinerary = Array(days).fill(null).map(() => []);
    const usedActivities = new Set();

    for (let day = 0; day < days; day++) {
      for (let slot = 0; slot < maxPerDay; slot++) {
        const index = day * maxPerDay + slot;
        if (index >= solution.length) break;

        const activityIndex = Math.floor(solution[index]) % activities.length;

        // Skip if already used
        if (usedActivities.has(activityIndex)) continue;

        itinerary[day].push(activities[activityIndex]);
        usedActivities.add(activityIndex);
      }
    }

    return itinerary;
  }

  /**
   * Optimize route using ACO
   */
  async optimizeRoute(locations, startLocation = null) {
    // If start location specified, ensure it's first
    if (startLocation) {
      const startIndex = locations.findIndex(loc =>
        loc.id === startLocation.id || loc === startLocation
      );

      if (startIndex > 0) {
        [locations[0], locations[startIndex]] = [locations[startIndex], locations[0]];
      }
    }

    const result = await this.antColonyOptimization(locations, {
      numAnts: 25,
      maxIterations: 50
    });

    return {
      optimizedRoute: result.bestTour,
      totalDistance: result.bestDistance,
      improvement: result.improvement,
      visualization: result.history.map(h => ({
        iteration: h.iteration,
        bestDistance: h.bestDistance
      }))
    };
  }

  /**
   * Budget allocation optimization
   */
  async optimizeBudgetAllocation(totalBudget, categories) {
    // categories = [{ name, minPercent, maxPercent, importance }]

    const objectiveFunction = (allocation) => {
      let score = 0;

      allocation.forEach((percent, i) => {
        const category = categories[i];

        // Score based on importance
        score += percent * category.importance;

        // Penalty for being outside preferred range
        if (percent < category.minPercent) {
          score -= (category.minPercent - percent) * 10;
        }
        if (percent > category.maxPercent) {
          score -= (percent - category.maxPercent) * 10;
        }
      });

      // Penalty if doesn't sum to 100%
      const total = allocation.reduce((a, b) => a + b, 0);
      score -= Math.abs(100 - total) * 100;

      return score;
    };

    const bounds = {
      min: categories.map(c => c.minPercent || 0),
      max: categories.map(c => c.maxPercent || 100)
    };

    const result = await this.particleSwarmOptimization(objectiveFunction, bounds, {
      swarmSize: 15,
      maxIterations: 30
    });

    // Convert percentages to actual amounts
    const allocation = result.bestSolution.map((percent, i) => ({
      category: categories[i].name,
      percentage: percent.toFixed(1) + '%',
      amount: Math.round(totalBudget * percent / 100)
    }));

    return {
      allocation,
      totalAllocated: allocation.reduce((sum, a) => sum + a.amount, 0),
      optimizationScore: result.bestFitness
    };
  }

  // ============================================
  // 📊 VISUALIZATION & ANALYSIS
  // ============================================

  /**
   * Generate visualization data for swarm behavior
   */
  visualizeSwarm(history) {
    return {
      convergence: history.map(h => ({
        iteration: h.iteration,
        best: h.bestFitness || h.bestDistance || h.bestBrightness,
        average: h.avgFitness || h.avgDistance || h.avgBrightness
      })),
      convergenceRate: this.calculateConvergenceRate(history),
      finalImprovement: this.calculateImprovement(history)
    };
  }

  calculateConvergenceRate(history) {
    if (history.length < 2) return 0;

    const improvements = [];
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1].bestFitness || history[i - 1].bestDistance;
      const curr = history[i].bestFitness || history[i].bestDistance;
      improvements.push(Math.abs(curr - prev));
    }

    return improvements.reduce((a, b) => a + b, 0) / improvements.length;
  }

  calculateImprovement(history) {
    if (history.length === 0) return 0;

    const first = history[0].bestFitness || history[0].bestDistance || 0;
    const last = history[history.length - 1].bestFitness || history[history.length - 1].bestDistance || 0;

    return ((last - first) / Math.abs(first) * 100).toFixed(2) + '%';
  }
}

// 🌐 Global instance
if (typeof window !== 'undefined') {
  window.SwarmIntelligence = new SwarmIntelligence();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.SwarmIntelligence.initialize().catch(e => {
        console.error('Failed to initialize Swarm Intelligence:', e);
      });
    });
  } else {
    window.SwarmIntelligence.initialize().catch(e => {
      console.error('Failed to initialize Swarm Intelligence:', e);
    });
  }
}

export default SwarmIntelligence;
