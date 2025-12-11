/**
 * 🤔 REASONING ENGINE
 * ===================
 *
 * "El AI que piensa en voz alta y explica su razonamiento"
 *
 * Este módulo implementa razonamiento de estilo Chain-of-Thought (CoT)
 * como el que usa Claude para resolver problemas complejos.
 *
 * Capacidades:
 * - Descomponer problemas complejos en pasos
 * - Explicar decisiones paso a paso
 * - Considerar trade-offs explícitamente
 * - Razonar sobre consecuencias
 * - Detectar contradicciones
 * - Generar alternativas
 * - Justificar recomendaciones
 *
 * Como un asistente que:
 * - No solo te da la respuesta, sino que te explica CÓMO llegó a ella
 * - Considera pros y contras antes de decidir
 * - Te muestra su proceso de pensamiento
 * - Te ayuda a entender por qué algo es mejor que otra cosa
 */

class ReasoningEngine {
  constructor() {
    this.initialized = false;

    // Reasoning chains (task -> reasoning steps)
    this.reasoningChains = new Map();

    // Trade-off weights for decision making
    this.tradeoffWeights = {
      cost: 0.3,          // Importance of budget
      time: 0.2,          // Importance of time efficiency
      experience: 0.3,    // Importance of experience quality
      energy: 0.2         // Importance of managing fatigue
    };

    // Decision history
    this.decisions = [];

    console.log('🤔 Reasoning Engine initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load reasoning history
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('reasoning_engine');
      if (stored) {
        this.reasoningChains = new Map(stored.chains || []);
        this.decisions = stored.decisions || [];
        this.tradeoffWeights = stored.weights || this.tradeoffWeights;
      }
    }

    this.initialized = true;
    console.log('✅ Reasoning Engine ready');
  }

  /**
   * 🧠 Perform chain-of-thought reasoning for a decision
   * @param {Object} problem - The problem to reason about
   * @returns {Object} Reasoning chain with steps and conclusion
   */
  reason(problem) {
    const {
      type,           // Type of problem (optimize_route, adjust_budget, etc.)
      context,        // Current state
      goal,           // What we want to achieve
      constraints,    // Limitations
      options         // Possible solutions
    } = problem;

    console.log(`🤔 Reasoning about: ${type}`);

    // Step 1: Understand the problem
    const understanding = this.understandProblem(problem);

    // Step 2: Break down into sub-problems
    const decomposition = this.decomposeProblem(problem);

    // Step 3: Consider each option
    const optionAnalysis = this.analyzeOptions(options, context, goal, constraints);

    // Step 4: Evaluate trade-offs
    const tradeoffs = this.evaluateTradeoffs(optionAnalysis, goal);

    // Step 5: Make decision
    const decision = this.makeDecision(tradeoffs, goal);

    // Step 6: Generate explanation
    const explanation = this.generateExplanation(
      understanding,
      decomposition,
      optionAnalysis,
      tradeoffs,
      decision
    );

    // Build reasoning chain
    const reasoningChain = {
      problem: type,
      timestamp: Date.now(),
      steps: [
        {
          step: 1,
          name: 'Understanding',
          content: understanding,
          confidence: 0.9
        },
        {
          step: 2,
          name: 'Decomposition',
          content: decomposition,
          confidence: 0.85
        },
        {
          step: 3,
          name: 'Option Analysis',
          content: optionAnalysis,
          confidence: 0.8
        },
        {
          step: 4,
          name: 'Trade-off Evaluation',
          content: tradeoffs,
          confidence: 0.75
        },
        {
          step: 5,
          name: 'Decision',
          content: decision,
          confidence: decision.confidence
        }
      ],
      explanation,
      decision: decision.choice,
      reasoning: explanation.summary
    };

    // Store reasoning chain
    this.reasoningChains.set(problem.id || Date.now(), reasoningChain);

    // Record decision
    this.recordDecision(reasoningChain);

    return reasoningChain;
  }

  /**
   * 📖 Understand the problem
   */
  understandProblem(problem) {
    return {
      type: problem.type,
      goal: problem.goal,
      constraints: problem.constraints,
      contextSummary: this.summarizeContext(problem.context),
      keyFactors: this.identifyKeyFactors(problem)
    };
  }

  /**
   * 🔨 Decompose problem into sub-problems
   */
  decomposeProblem(problem) {
    const subProblems = [];

    if (problem.type === 'optimize_route') {
      subProblems.push({
        subProblem: 'Minimize travel time',
        importance: 'high',
        difficulty: 'medium'
      });
      subProblems.push({
        subProblem: 'Minimize cost',
        importance: 'medium',
        difficulty: 'low'
      });
      subProblems.push({
        subProblem: 'Maximize experiences',
        importance: 'high',
        difficulty: 'high'
      });
    } else if (problem.type === 'adjust_budget') {
      subProblems.push({
        subProblem: 'Identify expensive activities',
        importance: 'high',
        difficulty: 'low'
      });
      subProblems.push({
        subProblem: 'Find cheaper alternatives',
        importance: 'high',
        difficulty: 'medium'
      });
      subProblems.push({
        subProblem: 'Maintain experience quality',
        importance: 'high',
        difficulty: 'high'
      });
    } else if (problem.type === 'reduce_fatigue') {
      subProblems.push({
        subProblem: 'Identify high-fatigue activities',
        importance: 'high',
        difficulty: 'low'
      });
      subProblems.push({
        subProblem: 'Add rest breaks',
        importance: 'high',
        difficulty: 'low'
      });
      subProblems.push({
        subProblem: 'Reorder activities',
        importance: 'medium',
        difficulty: 'medium'
      });
    }

    return {
      totalSubProblems: subProblems.length,
      subProblems,
      complexity: this.estimateComplexity(subProblems)
    };
  }

  /**
   * 🔍 Analyze each option
   */
  analyzeOptions(options, context, goal, constraints) {
    if (!options || options.length === 0) {
      return {
        options: [],
        analyzed: 0
      };
    }

    const analyzed = options.map(option => {
      // Score each option against goal
      const goalScore = this.scoreAgainstGoal(option, goal);

      // Check constraints
      const constraintViolations = this.checkConstraints(option, constraints);

      // Estimate consequences
      const consequences = this.estimateConsequences(option, context);

      // Calculate pros and cons
      const prosAndCons = this.identifyProsAndCons(option, context, goal);

      return {
        option,
        goalScore,
        constraintViolations,
        consequences,
        pros: prosAndCons.pros,
        cons: prosAndCons.cons,
        overallScore: goalScore - (constraintViolations.length * 0.2)
      };
    });

    // Sort by overall score
    analyzed.sort((a, b) => b.overallScore - a.overallScore);

    return {
      options: analyzed,
      analyzed: analyzed.length,
      bestOption: analyzed[0],
      worstOption: analyzed[analyzed.length - 1]
    };
  }

  /**
   * ⚖️ Evaluate trade-offs
   */
  evaluateTradeoffs(analysis, goal) {
    const tradeoffs = [];

    if (!analysis.options || analysis.options.length < 2) {
      return { tradeoffs: [], significant: [] };
    }

    const topOptions = analysis.options.slice(0, 3);

    for (let i = 0; i < topOptions.length - 1; i++) {
      for (let j = i + 1; j < topOptions.length; j++) {
        const optionA = topOptions[i];
        const optionB = topOptions[j];

        const tradeoff = this.compareOptions(optionA, optionB, goal);
        tradeoffs.push(tradeoff);
      }
    }

    // Identify significant trade-offs
    const significant = tradeoffs.filter(t => Math.abs(t.difference) > 0.2);

    return {
      tradeoffs,
      significant,
      count: tradeoffs.length
    };
  }

  /**
   * 🎯 Make final decision
   */
  makeDecision(tradeoffs, goal) {
    // If no options, can't decide
    if (!tradeoffs.tradeoffs || tradeoffs.tradeoffs.length === 0) {
      return {
        choice: null,
        confidence: 0,
        reasoning: 'No options available'
      };
    }

    // Pick option with best overall score
    const allOptions = tradeoffs.tradeoffs.flatMap(t => [t.optionA, t.optionB]);
    const uniqueOptions = [...new Map(allOptions.map(o => [o.option.id || JSON.stringify(o.option), o])).values()];

    uniqueOptions.sort((a, b) => b.overallScore - a.overallScore);

    const bestOption = uniqueOptions[0];
    const secondBest = uniqueOptions[1];

    // Calculate confidence based on margin
    let confidence = 0.5;
    if (secondBest) {
      const margin = bestOption.overallScore - secondBest.overallScore;
      confidence = Math.min(0.95, 0.5 + margin);
    } else {
      confidence = 0.7; // Only one option
    }

    return {
      choice: bestOption.option,
      confidence,
      reasoning: this.generateDecisionReasoning(bestOption, secondBest),
      alternatives: uniqueOptions.slice(1, 3)
    };
  }

  /**
   * 📝 Generate human-readable explanation
   */
  generateExplanation(understanding, decomposition, analysis, tradeoffs, decision) {
    // Build explanation text
    let explanation = '';

    // 1. Problem understanding
    explanation += `🎯 Objetivo: ${understanding.goal}\n\n`;

    // 2. Key factors
    if (understanding.keyFactors && understanding.keyFactors.length > 0) {
      explanation += `📊 Factores clave:\n`;
      understanding.keyFactors.forEach(f => {
        explanation += `- ${f}\n`;
      });
      explanation += '\n';
    }

    // 3. Analysis
    if (analysis.options && analysis.options.length > 0) {
      explanation += `🔍 Analicé ${analysis.options.length} opciones:\n\n`;

      // Show top 3 options
      analysis.options.slice(0, 3).forEach((opt, i) => {
        explanation += `${i + 1}. **Opción ${i + 1}**\n`;
        if (opt.pros && opt.pros.length > 0) {
          explanation += `   ✅ Pros: ${opt.pros.join(', ')}\n`;
        }
        if (opt.cons && opt.cons.length > 0) {
          explanation += `   ❌ Contras: ${opt.cons.join(', ')}\n`;
        }
        explanation += `   📊 Puntuación: ${opt.overallScore.toFixed(2)}\n\n`;
      });
    }

    // 4. Trade-offs
    if (tradeoffs.significant && tradeoffs.significant.length > 0) {
      explanation += `⚖️ Trade-offs importantes:\n`;
      tradeoffs.significant.slice(0, 2).forEach(t => {
        explanation += `- ${t.description}\n`;
      });
      explanation += '\n';
    }

    // 5. Decision
    explanation += `✅ Decisión: ${decision.reasoning}\n`;
    explanation += `📊 Confianza: ${(decision.confidence * 100).toFixed(0)}%\n`;

    return {
      fullText: explanation,
      summary: decision.reasoning,
      steps: [understanding, decomposition, analysis, tradeoffs, decision]
    };
  }

  /**
   * 🎯 Score option against goal
   */
  scoreAgainstGoal(option, goal) {
    // Simple scoring based on goal keywords
    let score = 0.5; // Neutral

    const goalLower = goal.toLowerCase();

    if (goalLower.includes('barato') || goalLower.includes('económico')) {
      // Goal is to save money
      if (option.costSaving > 0) score += 0.3;
      if (option.costIncrease > 0) score -= 0.3;
    }

    if (goalLower.includes('rápido') || goalLower.includes('eficiente')) {
      // Goal is to save time
      if (option.timeSaving > 0) score += 0.3;
      if (option.timeIncrease > 0) score -= 0.3;
    }

    if (goalLower.includes('relajado') || goalLower.includes('descanso')) {
      // Goal is to reduce fatigue
      if (option.fatigueReduction > 0) score += 0.3;
      if (option.fatigueIncrease > 0) score -= 0.3;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * ⚠️ Check constraint violations
   */
  checkConstraints(option, constraints) {
    const violations = [];

    if (!constraints) return violations;

    // Check budget constraint
    if (constraints.maxBudget && option.cost > constraints.maxBudget) {
      violations.push({
        type: 'budget',
        severity: 'high',
        message: `Excede presupuesto: ¥${option.cost} > ¥${constraints.maxBudget}`
      });
    }

    // Check time constraint
    if (constraints.maxDuration && option.duration > constraints.maxDuration) {
      violations.push({
        type: 'time',
        severity: 'medium',
        message: `Excede duración: ${option.duration}h > ${constraints.maxDuration}h`
      });
    }

    // Check fatigue constraint
    if (constraints.maxFatigue && option.fatigueLevel > constraints.maxFatigue) {
      violations.push({
        type: 'fatigue',
        severity: 'medium',
        message: `Nivel de fatiga muy alto: ${option.fatigueLevel}`
      });
    }

    return violations;
  }

  /**
   * 🔮 Estimate consequences of choosing an option
   */
  estimateConsequences(option, context) {
    const consequences = [];

    // Budget consequences
    if (option.costSaving > 0) {
      consequences.push({
        type: 'positive',
        aspect: 'budget',
        description: `Ahorrarás ¥${option.costSaving}`
      });
    }

    // Time consequences
    if (option.timeSaving > 0) {
      consequences.push({
        type: 'positive',
        aspect: 'time',
        description: `Ahorrarás ${option.timeSaving} minutos`
      });
    }

    // Experience consequences
    if (option.experienceImpact < 0) {
      consequences.push({
        type: 'negative',
        aspect: 'experience',
        description: 'Podrías perder algunas experiencias interesantes'
      });
    }

    return consequences;
  }

  /**
   * ✅❌ Identify pros and cons
   */
  identifyProsAndCons(option, context, goal) {
    const pros = [];
    const cons = [];

    // Cost pros/cons
    if (option.costSaving > 0) {
      pros.push(`Ahorra ¥${option.costSaving}`);
    }
    if (option.costIncrease > 0) {
      cons.push(`Incrementa costo en ¥${option.costIncrease}`);
    }

    // Time pros/cons
    if (option.timeSaving > 0) {
      pros.push(`Ahorra ${option.timeSaving} min`);
    }
    if (option.timeIncrease > 0) {
      cons.push(`Toma ${option.timeIncrease} min más`);
    }

    // Fatigue pros/cons
    if (option.fatigueReduction > 0) {
      pros.push(`Reduce fatiga`);
    }
    if (option.fatigueIncrease > 0) {
      cons.push(`Aumenta fatiga`);
    }

    // Experience pros/cons
    if (option.experienceImpact > 0) {
      pros.push(`Mejor experiencia`);
    }
    if (option.experienceImpact < 0) {
      cons.push(`Experiencia reducida`);
    }

    return { pros, cons };
  }

  /**
   * 🆚 Compare two options
   */
  compareOptions(optionA, optionB, goal) {
    const difference = optionA.overallScore - optionB.overallScore;

    let description = '';

    if (difference > 0) {
      description = `Opción A es mejor que B por ${(difference * 100).toFixed(0)} puntos`;
    } else {
      description = `Opción B es mejor que A por ${(-difference * 100).toFixed(0)} puntos`;
    }

    return {
      optionA,
      optionB,
      difference,
      description,
      significant: Math.abs(difference) > 0.2
    };
  }

  /**
   * 📝 Generate decision reasoning text
   */
  generateDecisionReasoning(bestOption, secondBest) {
    let reasoning = 'Recomiendo esta opción porque ';

    const reasons = [];

    if (bestOption.pros && bestOption.pros.length > 0) {
      reasons.push(bestOption.pros[0].toLowerCase());
    }

    if (secondBest) {
      const margin = bestOption.overallScore - secondBest.overallScore;
      if (margin > 0.3) {
        reasons.push('es significativamente mejor que las alternativas');
      } else {
        reasons.push('es ligeramente mejor que las alternativas');
      }
    }

    reasoning += reasons.join(' y ');
    reasoning += '.';

    return reasoning;
  }

  /**
   * 📊 Summarize context
   */
  summarizeContext(context) {
    if (!context) return 'No context available';

    const summary = [];

    if (context.currentBudget) {
      summary.push(`Presupuesto: ¥${context.currentBudget}`);
    }

    if (context.currentFatigue) {
      summary.push(`Fatiga: ${context.currentFatigue}%`);
    }

    if (context.daysRemaining) {
      summary.push(`Días restantes: ${context.daysRemaining}`);
    }

    return summary.join(', ');
  }

  /**
   * 🔑 Identify key factors
   */
  identifyKeyFactors(problem) {
    const factors = [];

    if (problem.constraints?.maxBudget) {
      factors.push(`Presupuesto máximo: ¥${problem.constraints.maxBudget}`);
    }

    if (problem.context?.userPreferences) {
      factors.push(`Preferencias: ${problem.context.userPreferences.join(', ')}`);
    }

    if (problem.goal) {
      factors.push(`Prioridad: ${problem.goal}`);
    }

    return factors;
  }

  /**
   * 📏 Estimate complexity
   */
  estimateComplexity(subProblems) {
    const difficultyScores = {
      'low': 1,
      'medium': 2,
      'high': 3
    };

    const totalDifficulty = subProblems.reduce((sum, sp) => {
      return sum + (difficultyScores[sp.difficulty] || 2);
    }, 0);

    if (totalDifficulty <= 3) return 'simple';
    if (totalDifficulty <= 6) return 'medium';
    return 'complex';
  }

  /**
   * 📝 Record decision
   */
  recordDecision(reasoningChain) {
    this.decisions.push({
      timestamp: reasoningChain.timestamp,
      problem: reasoningChain.problem,
      decision: reasoningChain.decision,
      confidence: reasoningChain.steps[4].confidence,
      reasoning: reasoningChain.reasoning
    });

    // Keep last 100 decisions
    if (this.decisions.length > 100) {
      this.decisions.shift();
    }

    this.save();
  }

  /**
   * 💾 Save to storage
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('reasoning_engine', {
        chains: Array.from(this.reasoningChains.entries()),
        decisions: this.decisions,
        weights: this.tradeoffWeights
      });
    }
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      totalReasoningChains: this.reasoningChains.size,
      totalDecisions: this.decisions.length,
      avgConfidence: this.decisions.reduce((sum, d) => sum + d.confidence, 0) / (this.decisions.length || 1),
      recentDecisions: this.decisions.slice(-5)
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ReasoningEngine = new ReasoningEngine();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ReasoningEngine.initialize();
    });
  } else {
    window.ReasoningEngine.initialize();
  }

  console.log('🤔 Reasoning Engine loaded!');
}
