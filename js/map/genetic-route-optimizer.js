/**
 * 🧬 ALGORITMO GENÉTICO PARA RUTAS ÓPTIMAS (#13)
 * ================================================
 *
 * Encuentra la MEJOR ruta entre actividades minimizando tiempo de viaje
 * usando un algoritmo genético evolutivo.
 *
 * Características:
 * - Genera población inicial de rutas aleatorias
 * - Selección natural (las mejores sobreviven)
 * - Crossover (reproducción de rutas)
 * - Mutación (cambios aleatorios)
 * - Evolución por generaciones
 * - Converge a la ruta óptima en segundos
 */

class GeneticRouteOptimizer {
  constructor(options = {}) {
    this.config = {
      populationSize: 100,      // Población por generación
      generations: 50,          // Número de generaciones
      survivalRate: 0.2,        // Top 20% sobreviven
      mutationRate: 0.15,       // 15% probabilidad de mutación
      crossoverRate: 0.7,       // 70% probabilidad de crossover
      eliteCount: 5,            // Top 5 pasan directo a siguiente generación
      ...options
    };

    this.bestRoute = null;
    this.evolutionHistory = [];
  }

  /**
   * 🎯 Punto de entrada principal - Optimiza una ruta
   * @param {Array} activities - Lista de actividades a ordenar
   * @param {Object} options - { fixedStart?, fixedEnd?, hotel? }
   * @returns {Object} { route: [], totalDistance: number, totalTime: number, generations: [] }
   */
  optimize(activities, options = {}) {
    console.log('🧬 Iniciando optimización genética...');
    console.time('genetic-optimization');

    const { fixedStart, fixedEnd, hotel } = options;

    // Actividades que se pueden reordenar
    let optimizableActivities = [...activities];

    // Remover start/end fijos si existen
    if (fixedStart) {
      optimizableActivities = optimizableActivities.filter(a => a.id !== fixedStart.id);
    }
    if (fixedEnd) {
      optimizableActivities = optimizableActivities.filter(a => a.id !== fixedEnd.id);
    }

    if (optimizableActivities.length === 0) {
      return { route: activities, totalDistance: 0, totalTime: 0, generations: [] };
    }

    // 1️⃣ Generar población inicial
    let population = this.generateInitialPopulation(optimizableActivities);

    // 2️⃣ Evolucionar por N generaciones
    for (let gen = 0; gen < this.config.generations; gen++) {
      // Evaluar fitness de cada ruta
      const fitnessScores = population.map(route => ({
        route,
        fitness: this.calculateFitness(route, { fixedStart, fixedEnd, hotel })
      }));

      // Ordenar por fitness (menor es mejor en este caso)
      fitnessScores.sort((a, b) => a.fitness.totalCost - b.fitness.totalCost);

      // Guardar mejor ruta de esta generación
      const bestOfGen = fitnessScores[0];
      this.evolutionHistory.push({
        generation: gen,
        bestFitness: bestOfGen.fitness.totalCost,
        bestDistance: bestOfGen.fitness.totalDistance,
        bestTime: bestOfGen.fitness.totalTime,
        avgFitness: fitnessScores.reduce((sum, f) => sum + f.fitness.totalCost, 0) / fitnessScores.length
      });

      // 3️⃣ Selección natural - sobreviven los mejores
      const survivors = fitnessScores
        .slice(0, Math.ceil(this.config.populationSize * this.config.survivalRate))
        .map(f => f.route);

      // 4️⃣ Elitismo - los mejores pasan directo
      const nextGeneration = survivors.slice(0, this.config.eliteCount);

      // 5️⃣ Reproducción (crossover) para llenar nueva población
      while (nextGeneration.length < this.config.populationSize) {
        if (Math.random() < this.config.crossoverRate) {
          // Seleccionar 2 padres aleatorios de los sobrevivientes
          const parent1 = survivors[Math.floor(Math.random() * survivors.length)];
          const parent2 = survivors[Math.floor(Math.random() * survivors.length)];

          // Crear hijo mediante crossover
          const child = this.crossover(parent1, parent2);
          nextGeneration.push(child);
        } else {
          // Clonar un sobreviviente aleatorio
          const clone = [...survivors[Math.floor(Math.random() * survivors.length)]];
          nextGeneration.push(clone);
        }
      }

      // 6️⃣ Mutación
      for (let i = this.config.eliteCount; i < nextGeneration.length; i++) {
        if (Math.random() < this.config.mutationRate) {
          nextGeneration[i] = this.mutate(nextGeneration[i]);
        }
      }

      population = nextGeneration;

      // Log progreso cada 10 generaciones
      if (gen % 10 === 0) {
        console.log(`Gen ${gen}: Best=${bestOfGen.fitness.totalCost.toFixed(2)}km, Avg=${this.evolutionHistory[gen].avgFitness.toFixed(2)}km`);
      }
    }

    // 7️⃣ Obtener la mejor ruta final
    const finalFitness = population.map(route => ({
      route,
      fitness: this.calculateFitness(route, { fixedStart, fixedEnd, hotel })
    }));
    finalFitness.sort((a, b) => a.fitness.totalCost - b.fitness.totalCost);

    const bestSolution = finalFitness[0];

    // Construir ruta completa (con start/end fijos)
    let finalRoute = [];
    if (fixedStart) finalRoute.push(fixedStart);
    finalRoute.push(...bestSolution.route);
    if (fixedEnd) finalRoute.push(fixedEnd);

    console.timeEnd('genetic-optimization');
    console.log(`✅ Optimización completa - Mejor distancia: ${bestSolution.fitness.totalDistance.toFixed(2)}km`);

    return {
      route: finalRoute,
      totalDistance: bestSolution.fitness.totalDistance,
      totalTime: bestSolution.fitness.totalTime,
      generations: this.evolutionHistory,
      improvement: this.calculateImprovement()
    };
  }

  /**
   * 🌱 Genera población inicial de rutas aleatorias
   */
  generateInitialPopulation(activities) {
    const population = [];

    // Primera ruta: orden original
    population.push([...activities]);

    // Resto: permutaciones aleatorias
    for (let i = 1; i < this.config.populationSize; i++) {
      const shuffled = [...activities];

      // Fisher-Yates shuffle
      for (let j = shuffled.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
      }

      population.push(shuffled);
    }

    return population;
  }

  /**
   * 📊 Calcula fitness de una ruta (menor es mejor)
   * @param {Array} route - Ruta a evaluar
   * @param {Object} options - { fixedStart, fixedEnd, hotel }
   * @returns {Object} { totalCost, totalDistance, totalTime }
   */
  calculateFitness(route, options = {}) {
    const { fixedStart, fixedEnd, hotel } = options;

    let totalDistance = 0;
    let totalTime = 0;

    // Construir ruta completa para evaluación
    let fullRoute = [];
    if (fixedStart) fullRoute.push(fixedStart);
    fullRoute.push(...route);
    if (fixedEnd) fullRoute.push(fixedEnd);

    // Calcular distancia total
    for (let i = 0; i < fullRoute.length - 1; i++) {
      const distance = this.calculateDistance(fullRoute[i], fullRoute[i + 1]);
      totalDistance += distance;

      // Tiempo = distancia en km * 10 min/km (asumiendo transporte público)
      totalTime += distance * 10;
    }

    // Si hay hotel, considerar distancia desde última actividad al hotel
    if (hotel && fullRoute.length > 0) {
      const lastActivity = fullRoute[fullRoute.length - 1];
      const distanceToHotel = this.calculateDistance(lastActivity, hotel);
      totalDistance += distanceToHotel;
      totalTime += distanceToHotel * 10;
    }

    // Penalizar rutas con mucho backtracking
    const backtrackingPenalty = this.calculateBacktrackingPenalty(fullRoute);

    const totalCost = totalDistance + backtrackingPenalty;

    return {
      totalCost,
      totalDistance,
      totalTime,
      backtrackingPenalty
    };
  }

  /**
   * 📏 Calcula distancia entre dos puntos (Haversine)
   */
  calculateDistance(point1, point2) {
    if (!point1.coordinates || !point2.coordinates) {
      // Si no hay coordenadas, usar distancia arbitraria
      return 5; // 5km default
    }

    const [lat1, lon1] = point1.coordinates;
    const [lat2, lon2] = point2.coordinates;

    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * 🔀 Crossover - Combina dos rutas padres (Order Crossover - OX)
   */
  crossover(parent1, parent2) {
    const length = parent1.length;

    // Seleccionar punto de corte aleatorio
    const start = Math.floor(Math.random() * length);
    const end = Math.floor(Math.random() * (length - start)) + start;

    // Crear hijo tomando segmento de parent1
    const child = new Array(length).fill(null);

    // Copiar segmento de parent1
    for (let i = start; i <= end; i++) {
      child[i] = parent1[i];
    }

    // Llenar resto con genes de parent2 (en orden)
    let parent2Index = 0;
    for (let i = 0; i < length; i++) {
      if (child[i] === null) {
        // Buscar siguiente gen de parent2 que no esté ya en child
        while (child.includes(parent2[parent2Index])) {
          parent2Index++;
        }
        child[i] = parent2[parent2Index];
        parent2Index++;
      }
    }

    return child;
  }

  /**
   * 🧬 Mutación - Altera ligeramente una ruta
   */
  mutate(route) {
    const mutated = [...route];
    const mutationType = Math.random();

    if (mutationType < 0.5) {
      // Swap mutation - intercambiar 2 posiciones aleatorias
      const i = Math.floor(Math.random() * mutated.length);
      const j = Math.floor(Math.random() * mutated.length);
      [mutated[i], mutated[j]] = [mutated[j], mutated[i]];
    } else {
      // Inversion mutation - invertir un segmento
      const start = Math.floor(Math.random() * mutated.length);
      const end = Math.floor(Math.random() * (mutated.length - start)) + start;

      const segment = mutated.slice(start, end + 1).reverse();
      mutated.splice(start, segment.length, ...segment);
    }

    return mutated;
  }

  /**
   * 🔙 Calcula penalización por backtracking (ir y volver)
   */
  calculateBacktrackingPenalty(route) {
    if (route.length < 3) return 0;

    let penalty = 0;

    // Detectar si vamos A -> B -> A (o cerca)
    for (let i = 0; i < route.length - 2; i++) {
      const dist_i_to_i1 = this.calculateDistance(route[i], route[i + 1]);
      const dist_i1_to_i2 = this.calculateDistance(route[i + 1], route[i + 2]);
      const dist_i_to_i2 = this.calculateDistance(route[i], route[i + 2]);

      // Si volver directo es más corto, hay backtracking
      if (dist_i_to_i2 < (dist_i_to_i1 + dist_i1_to_i2) * 0.7) {
        penalty += 2; // Penalización de 2km
      }
    }

    return penalty;
  }

  /**
   * 📈 Calcula la mejora respecto a la ruta inicial
   */
  calculateImprovement() {
    if (this.evolutionHistory.length < 2) return 0;

    const initial = this.evolutionHistory[0].bestFitness;
    const final = this.evolutionHistory[this.evolutionHistory.length - 1].bestFitness;

    const improvement = ((initial - final) / initial) * 100;
    return improvement;
  }

  /**
   * 📊 Exporta historial de evolución para gráficos
   */
  getEvolutionData() {
    return {
      generations: this.evolutionHistory.map(h => h.generation),
      bestFitness: this.evolutionHistory.map(h => h.bestFitness),
      avgFitness: this.evolutionHistory.map(h => h.avgFitness),
      improvement: this.calculateImprovement()
    };
  }
}

// 🌐 Exportar para uso global
if (typeof window !== 'undefined') {
  window.GeneticRouteOptimizer = GeneticRouteOptimizer;
}
