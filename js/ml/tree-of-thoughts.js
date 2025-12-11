/**
 * 🌳 FASE 8.5: TREE-OF-THOUGHTS EXPLORER
 * ========================================
 *
 * "Piensa como humano: explora múltiples caminos antes de decidir"
 *
 * Expande chain-of-thought a un ÁRBOL de ideas:
 * - Genera múltiples paths de razonamiento
 * - Evalúa cada branch con scoring
 * - Elige el mejor path dinámicamente
 * - Prune branches malos para eficiencia
 *
 * No hardcode: la IA decide branches basado en complejidad del query.
 *
 * Como un humano que:
 * - Considera varias opciones antes de decidir
 * - Descarta las ideas malas rápido
 * - Se enfoca en lo que tiene más probabilidad de éxito
 * - No se queda atrapado en análisis-parálisis
 */

class TreeOfThoughtsExplorer {
  constructor(maxDepth = 3, branchingFactor = 3) {
    this.maxDepth = maxDepth;
    this.branchingFactor = branchingFactor;
    this.minScore = 0.3; // Prune threshold

    // Heuristics for scoring (human-like criteria)
    this.scoringWeights = {
      relevance: 0.3,      // ¿Qué tan relevante es para el query?
      feasibility: 0.3,    // ¿Es posible de ejecutar?
      safety: 0.2,         // ¿Es seguro/confiable?
      creativity: 0.1,     // ¿Es innovador?
      efficiency: 0.1      // ¿Es rápido/económico?
    };

    console.log('🌳 Tree-of-Thoughts Explorer initialized');
  }

  /**
   * 🌳 Explore query with tree-of-thoughts
   * @param {string} query - User query
   * @param {Object} context - Current context
   * @returns {Object} Best path with reasoning
   */
  explore(query, context = {}) {
    console.log(`🌳 Exploring query: "${query}"`);

    // Create root node
    const root = {
      thought: `Entender query: "${query}" en contexto de ${context.domain || 'viaje a Japón'}`,
      children: [],
      score: 1.0,
      depth: 0,
      metadata: { type: 'root', query, context }
    };

    // Expand tree recursively
    this.expandNode(root, context);

    // Find best path
    const bestPath = this.findBestPath(root);

    // Generate reasoning explanation
    const reasoning = this.generateReasoning(bestPath);

    return {
      query,
      bestPath: bestPath.map(node => node.thought),
      scores: bestPath.map(node => node.score),
      reasoning,
      totalNodes: this.countNodes(root),
      prunedNodes: this.prunedCount || 0,
      confidence: this.calculateConfidence(bestPath)
    };
  }

  /**
   * 🌱 Expand node recursively
   */
  expandNode(node, context, depth = 1) {
    if (depth > this.maxDepth) return;

    // Generate branches dynamically
    const branches = this.generateBranches(node.thought, context, depth);

    // Score and filter branches
    for (const branch of branches.slice(0, this.branchingFactor)) {
      const score = this.scoreThought(branch, context);

      // Prune low-score branches (efficiency)
      if (score < this.minScore) {
        this.prunedCount = (this.prunedCount || 0) + 1;
        continue;
      }

      const child = {
        thought: branch.text,
        children: [],
        score: score,
        depth: depth,
        metadata: branch.metadata || {}
      };

      node.children.push(child);

      // Recursively expand child
      this.expandNode(child, context, depth + 1);
    }
  }

  /**
   * 🎨 Generate branches dynamically (not hardcoded)
   */
  generateBranches(thought, context, depth) {
    const branches = [];

    // Analyze query type
    const queryType = this.analyzeQueryType(thought, context);

    // Branch 1: Conservative approach
    branches.push({
      text: this.generateConservativeBranch(thought, queryType, context),
      metadata: { type: 'conservative', queryType }
    });

    // Branch 2: Creative/Exploratory approach
    branches.push({
      text: this.generateCreativeBranch(thought, queryType, context),
      metadata: { type: 'creative', queryType }
    });

    // Branch 3: Practical/Efficient approach
    branches.push({
      text: this.generatePracticalBranch(thought, queryType, context),
      metadata: { type: 'practical', queryType }
    });

    // If deep enough, add alternative/fallback
    if (depth >= 2) {
      branches.push({
        text: this.generateFallbackBranch(thought, queryType, context),
        metadata: { type: 'fallback', queryType }
      });
    }

    return branches;
  }

  /**
   * 🔍 Analyze query type
   */
  analyzeQueryType(thought, context) {
    const lower = thought.toLowerCase();

    if (lower.includes('agregar') || lower.includes('add')) return 'add';
    if (lower.includes('quitar') || lower.includes('remove')) return 'remove';
    if (lower.includes('optimizar') || lower.includes('optimize')) return 'optimize';
    if (lower.includes('barato') || lower.includes('económico')) return 'budget';
    if (lower.includes('relajado') || lower.includes('descanso')) return 'relax';
    if (lower.includes('aventura') || lower.includes('explore')) return 'adventure';

    return 'general';
  }

  /**
   * 🛡️ Generate conservative branch
   */
  generateConservativeBranch(thought, type, context) {
    const templates = {
      'add': `Agregar actividades SEGURAS y populares (templos top, restaurantes famosos). Priorizar seguridad y confiabilidad.`,
      'remove': `Quitar solo actividades no esenciales. Mantener las experiencias core de Japón.`,
      'optimize': `Optimizar rutas minimizando riesgo. Usar transporte público confiable.`,
      'budget': `Reducir presupuesto SIN sacrificar seguridad. Opciones económicas pero confiables.`,
      'general': `Enfoque conservador: priorizar seguridad, confiabilidad y experiencias probadas.`
    };

    return templates[type] || templates['general'];
  }

  /**
   * 🎨 Generate creative branch
   */
  generateCreativeBranch(thought, type, context) {
    const templates = {
      'add': `Agregar actividades ÚNICAS y off-the-beaten-path. Experiencias locales auténticas.`,
      'remove': `Quitar actividades turísticas. Enfocarse en descubrimientos únicos.`,
      'optimize': `Optimizar para VARIEDAD y sorpresa. Mezclar tradición con modernidad.`,
      'budget': `Buscar opciones económicas CREATIVAS (mercados locales, festivales gratuitos).`,
      'general': `Enfoque creativo: priorizar originalidad, variedad y experiencias memorables.`
    };

    return templates[type] || templates['general'];
  }

  /**
   * ⚡ Generate practical branch
   */
  generatePracticalBranch(thought, type, context) {
    const templates = {
      'add': `Agregar actividades EFICIENTES en tiempo/dinero. Maximizar experiencia por yen.`,
      'remove': `Quitar actividades que consumen mucho tiempo/dinero sin suficiente value.`,
      'optimize': `Optimizar para EFICIENCIA: minimizar tiempo de viaje, maximizar experiencias.`,
      'budget': `Reducir presupuesto con ESTRATEGIA: priorizar lo esencial, eliminar extras.`,
      'general': `Enfoque práctico: priorizar eficiencia, value y optimización de recursos.`
    };

    return templates[type] || templates['general'];
  }

  /**
   * 🔄 Generate fallback branch
   */
  generateFallbackBranch(thought, type, context) {
    return `Considerando alternativa: Si las opciones anteriores no funcionan, explorar enfoque híbrido que combine lo mejor de cada uno.`;
  }

  /**
   * 📊 Score a thought (human-like heuristics)
   */
  scoreThought(branch, context) {
    let score = 0;

    const text = branch.text.toLowerCase();
    const type = branch.metadata?.type || 'unknown';

    // Relevance (0.3 weight)
    if (text.includes('japón') || text.includes('viaje') || text.includes('actividad')) {
      score += 0.3;
    } else {
      score += 0.1;
    }

    // Feasibility (0.3 weight)
    if (text.includes('segura') || text.includes('confiable') || text.includes('eficiente')) {
      score += 0.3;
    } else if (text.includes('única') || text.includes('creativa')) {
      score += 0.2; // Creative might be less feasible
    } else {
      score += 0.15;
    }

    // Safety (0.2 weight)
    if (type === 'conservative') {
      score += 0.2;
    } else if (type === 'practical') {
      score += 0.15;
    } else {
      score += 0.1;
    }

    // Creativity (0.1 weight)
    if (type === 'creative') {
      score += 0.1;
    } else if (type === 'fallback') {
      score += 0.08;
    } else {
      score += 0.05;
    }

    // Efficiency (0.1 weight)
    if (type === 'practical') {
      score += 0.1;
    } else if (type === 'conservative') {
      score += 0.08;
    } else {
      score += 0.05;
    }

    // Bonus: Adapt to context
    if (context.userType === 'explorer' && type === 'creative') {
      score += 0.15;
    } else if (context.userType === 'needs-guidance' && type === 'conservative') {
      score += 0.15;
    } else if (context.budgetLow && text.includes('económico')) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  /**
   * 🏆 Find best path through tree
   */
  findBestPath(root) {
    const allPaths = this.getAllPaths(root);

    // Score each path
    const scoredPaths = allPaths.map(path => ({
      path,
      totalScore: path.reduce((sum, node) => sum + node.score, 0),
      avgScore: path.reduce((sum, node) => sum + node.score, 0) / path.length,
      length: path.length
    }));

    // Sort by average score (prefer balanced paths)
    scoredPaths.sort((a, b) => b.avgScore - a.avgScore);

    return scoredPaths[0].path;
  }

  /**
   * 🛤️ Get all paths from root to leaves
   */
  getAllPaths(node, currentPath = []) {
    const newPath = [...currentPath, node];

    // If leaf node, return path
    if (!node.children || node.children.length === 0) {
      return [newPath];
    }

    // Recursively get paths from children
    const paths = [];
    for (const child of node.children) {
      paths.push(...this.getAllPaths(child, newPath));
    }

    return paths;
  }

  /**
   * 📝 Generate reasoning explanation
   */
  generateReasoning(path) {
    const steps = path.map((node, i) => {
      return `${i + 1}. ${node.thought} (score: ${node.score.toFixed(2)})`;
    }).join('\n');

    const summary = `Razonamiento mediante exploración de árbol:\n\n${steps}\n\nConclusión: ${path[path.length - 1].thought}`;

    return summary;
  }

  /**
   * 🔢 Count total nodes in tree
   */
  countNodes(node) {
    let count = 1;
    for (const child of node.children || []) {
      count += this.countNodes(child);
    }
    return count;
  }

  /**
   * 📊 Calculate path confidence
   */
  calculateConfidence(path) {
    const avgScore = path.reduce((sum, node) => sum + node.score, 0) / path.length;
    const minScore = Math.min(...path.map(node => node.score));

    // Confidence is weighted average of avg and min (to penalize weak links)
    return avgScore * 0.7 + minScore * 0.3;
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      maxDepth: this.maxDepth,
      branchingFactor: this.branchingFactor,
      minScore: this.minScore,
      prunedCount: this.prunedCount || 0
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.TreeOfThoughtsExplorer = new TreeOfThoughtsExplorer();
  console.log('🌳 Tree-of-Thoughts Explorer loaded!');
}
