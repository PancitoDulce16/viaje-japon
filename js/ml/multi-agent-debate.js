/**
 * 🗣️ FASE 11.5: MULTI-AGENT DEBATE SIMULATOR
 * ============================================
 *
 * "Debate interno para llegar a mejor decisión"
 *
 * Simula "agentes internos" (conservador, creativo, práctico) que debaten
 * para llegar a consenso, como un humano que considera múltiples perspectivas.
 *
 * Características:
 * - Genera agents dinámicamente basado en query
 * - Limita rounds a 3-5 para eficiencia
 * - Vota por mayoría para consenso
 * - Para temprano si hay acuerdo unánime
 *
 * Como un comité interno que:
 * - Considera diferentes ángulos del problema
 * - Debate pros y contras
 * - Llega a decisión balanceada
 * - No se queda atascado en análisis infinito
 */

class MultiAgentDebate {
  constructor() {
    this.initialized = false;

    // Agent archetypes (can be expanded dynamically)
    this.agentTypes = {
      'conservative': {
        name: 'Agente Conservador',
        personality: 'Prioriza seguridad, confiabilidad y lo probado',
        biases: ['safety', 'reliability', 'tradition'],
        weight: 0.35
      },
      'creative': {
        name: 'Agente Creativo',
        personality: 'Busca originalidad, variedad y experiencias únicas',
        biases: ['novelty', 'variety', 'uniqueness'],
        weight: 0.25
      },
      'practical': {
        name: 'Agente Práctico',
        personality: 'Optimiza eficiencia, tiempo y recursos',
        biases: ['efficiency', 'value', 'optimization'],
        weight: 0.30
      },
      'empathetic': {
        name: 'Agente Empático',
        personality: 'Considera bienestar, comodidad y preferencias del usuario',
        biases: ['comfort', 'preferences', 'wellbeing'],
        weight: 0.10
      }
    };

    // Debate settings
    this.settings = {
      maxRounds: 5,
      consensusThreshold: 0.75, // 75% agreement = consensus
      minRounds: 2 // At least 2 rounds before can declare consensus
    };

    // Debate history
    this.debateHistory = [];

    console.log('🗣️ Multi-Agent Debate Simulator initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load debate history
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('multi_agent_debate');
      if (stored) {
        this.debateHistory = stored.history || [];
      }
    }

    this.initialized = true;
    console.log('✅ Multi-Agent Debate Simulator ready');
  }

  /**
   * 🗣️ Run debate on a decision
   * @param {string} query - Decision to debate
   * @param {Array} options - Options to consider
   * @param {Object} context - Current context
   * @returns {Object} Debate result with final decision
   */
  debate(query, options = [], context = {}) {
    console.log(`🗣️ Starting debate on: "${query}"`);

    // Select relevant agents for this query
    const agents = this.selectAgents(query, context);

    // Initialize agents
    const activeAgents = agents.map(type => ({
      type,
      ...this.agentTypes[type],
      opinion: null,
      reasoning: '',
      votes: []
    }));

    // Run debate rounds
    let round = 0;
    let consensus = null;

    while (round < this.settings.maxRounds) {
      round++;
      console.log(`\n📢 Round ${round}/${this.settings.maxRounds}`);

      // Each agent forms opinion
      for (const agent of activeAgents) {
        const opinion = this.formOpinion(agent, query, options, context, round);
        agent.opinion = opinion.choice;
        agent.reasoning = opinion.reasoning;
        agent.votes.push(opinion.choice);

        console.log(`  ${agent.name}: ${opinion.choice} (${opinion.reasoning.substring(0, 50)}...)`);
      }

      // Check for consensus
      consensus = this.checkConsensus(activeAgents, round);

      if (consensus.reached) {
        console.log(`✅ Consensus reached in round ${round}!`);
        break;
      }

      // Allow agents to respond to each other
      if (round < this.settings.maxRounds) {
        this.crossDebate(activeAgents, context);
      }
    }

    // Final decision
    const finalDecision = this.makeFinalDecision(activeAgents, consensus, query, options);

    // Record debate
    this.recordDebate({
      query,
      options,
      agents: activeAgents.map(a => ({ type: a.type, opinion: a.opinion, reasoning: a.reasoning })),
      rounds: round,
      consensus: consensus.reached,
      decision: finalDecision,
      timestamp: Date.now()
    });

    return {
      query,
      decision: finalDecision.choice,
      reasoning: finalDecision.reasoning,
      confidence: finalDecision.confidence,
      rounds: round,
      consensusReached: consensus.reached,
      agentOpinions: activeAgents.map(a => ({
        agent: a.name,
        opinion: a.opinion,
        reasoning: a.reasoning
      })),
      debate: this.generateDebateTranscript(activeAgents, round)
    };
  }

  /**
   * 🎯 Select relevant agents for query
   */
  selectAgents(query, context) {
    const agents = ['conservative', 'practical']; // Always include these base agents

    const lowerQuery = query.toLowerCase();

    // Add creative if query suggests exploration
    if (lowerQuery.includes('único') || lowerQuery.includes('diferente') || lowerQuery.includes('nuevo')) {
      agents.push('creative');
    }

    // Add empathetic if user-focused
    if (lowerQuery.includes('cansado') || lowerQuery.includes('cómodo') || context.userType === 'needs-guidance') {
      agents.push('empathetic');
    }

    // If still only 2 agents, add creative for diversity
    if (agents.length === 2) {
      agents.push('creative');
    }

    return agents;
  }

  /**
   * 💭 Agent forms opinion
   */
  formOpinion(agent, query, options, context, round) {
    const queryLower = query.toLowerCase();

    // Generate opinion based on agent type
    let choice = '';
    let reasoning = '';

    if (agent.type === 'conservative') {
      if (queryLower.includes('agregar') || queryLower.includes('add')) {
        choice = 'Agregar actividades seguras y populares';
        reasoning = 'Priorizo seguridad y confiabilidad. Las actividades populares son probadas y seguras.';
      } else if (queryLower.includes('reducir') || queryLower.includes('reduce')) {
        choice = 'Reducir manteniendo lo esencial';
        reasoning = 'Debemos mantener las experiencias core de Japón, eliminar solo extras.';
      } else {
        choice = 'Enfoque conservador';
        reasoning = 'Prefiero lo seguro y probado sobre lo experimental.';
      }
    }
    else if (agent.type === 'creative') {
      if (queryLower.includes('agregar') || queryLower.includes('add')) {
        choice = 'Agregar experiencias únicas y off-the-beaten-path';
        reasoning = 'Busco originalidad. Los lugares menos turísticos ofrecen experiencias auténticas.';
      } else if (queryLower.includes('optimizar') || queryLower.includes('optimize')) {
        choice = 'Optimizar para variedad y sorpresa';
        reasoning = 'La variedad hace el viaje memorable. Mezclar tradición con modernidad.';
      } else {
        choice = 'Enfoque creativo';
        reasoning = 'Prefiero lo único y memorable sobre lo convencional.';
      }
    }
    else if (agent.type === 'practical') {
      if (queryLower.includes('barato') || queryLower.includes('budget')) {
        choice = 'Reducir costos estratégicamente';
        reasoning = 'Optimizamos presupuesto sin sacrificar value. Priorizar lo esencial.';
      } else if (queryLower.includes('rápido') || queryLower.includes('optimize')) {
        choice = 'Minimizar tiempo de viaje';
        reasoning = 'Eficiencia es clave. Agrupar actividades por zona reduce transporte.';
      } else {
        choice = 'Enfoque eficiente';
        reasoning = 'Maximizar value por yen y minuto gastado.';
      }
    }
    else if (agent.type === 'empathetic') {
      if (queryLower.includes('cansado') || queryLower.includes('fatiga')) {
        choice = 'Reducir fatiga con descansos';
        reasoning = 'El bienestar del viajero es primero. Más descanso = mejor experiencia.';
      } else {
        choice = 'Priorizar comodidad';
        reasoning = 'Considero las preferencias y limitaciones del usuario.';
      }
    }

    // In later rounds, agents can be influenced by others
    if (round > 1) {
      // Simple influence: if majority agrees, conservative/empathetic might change
      // (simulates compromise)
    }

    return { choice, reasoning };
  }

  /**
   * 🔄 Allow agents to cross-debate
   */
  crossDebate(agents, context) {
    // Agents respond to conflicting opinions
    const opinions = agents.map(a => a.opinion);
    const unique = [...new Set(opinions)];

    // If all agree, nothing to debate
    if (unique.length === 1) {
      return;
    }

    // Simple cross-debate: agents adjust based on others
    for (const agent of agents) {
      // Count how many disagree
      const disagreements = agents.filter(a => a.opinion !== agent.opinion).length;

      // If isolated, might reconsider (especially empathetic/creative)
      if (disagreements > agents.length / 2 && (agent.type === 'empathetic' || agent.type === 'creative')) {
        // Agent becomes less certain but maintains position
        agent.reasoning += ' (Aunque reconozco otras perspectivas válidas)';
      }
    }
  }

  /**
   * ✅ Check for consensus
   */
  checkConsensus(agents, round) {
    // Count opinions
    const opinions = agents.map(a => a.opinion);
    const counts = {};

    for (const opinion of opinions) {
      counts[opinion] = (counts[opinion] || 0) + 1;
    }

    // Find majority
    const maxCount = Math.max(...Object.values(counts));
    const total = agents.length;
    const agreement = maxCount / total;

    // Consensus if:
    // 1. Agreement >= threshold
    // 2. At least minimum rounds completed
    const reached = agreement >= this.settings.consensusThreshold && round >= this.settings.minRounds;

    return {
      reached,
      agreement,
      majorityOpinion: Object.keys(counts).find(k => counts[k] === maxCount),
      distribution: counts
    };
  }

  /**
   * 🎯 Make final decision
   */
  makeFinalDecision(agents, consensus, query, options) {
    let choice = '';
    let reasoning = '';
    let confidence = 0;

    if (consensus.reached) {
      // Use consensus decision
      choice = consensus.majorityOpinion;
      reasoning = `Consenso alcanzado con ${(consensus.agreement * 100).toFixed(0)}% de acuerdo. `;

      // Combine reasoning from agreeing agents
      const agreeingAgents = agents.filter(a => a.opinion === choice);
      const reasons = agreeingAgents.map(a => a.reasoning).join(' ');
      reasoning += reasons;

      confidence = consensus.agreement;
    }
    else {
      // No consensus - use weighted voting
      const votes = {};
      for (const agent of agents) {
        votes[agent.opinion] = (votes[agent.opinion] || 0) + agent.weight;
      }

      // Find highest weighted vote
      choice = Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b);

      reasoning = `No hubo consenso total, pero decisión por voto ponderado. `;

      // Get reasoning from agents who voted for this
      const supporters = agents.filter(a => a.opinion === choice);
      reasoning += supporters.map(a => `${a.name}: ${a.reasoning}`).join(' | ');

      confidence = votes[choice] / agents.reduce((sum, a) => sum + a.weight, 0);
    }

    return {
      choice,
      reasoning,
      confidence: Math.min(0.95, confidence) // Cap at 95%
    };
  }

  /**
   * 📝 Generate debate transcript
   */
  generateDebateTranscript(agents, rounds) {
    let transcript = `Debate (${rounds} rounds):\n\n`;

    for (let r = 1; r <= rounds; r++) {
      transcript += `Round ${r}:\n`;
      for (const agent of agents) {
        transcript += `- ${agent.name}: "${agent.opinion}"\n`;
        transcript += `  Razón: ${agent.reasoning}\n`;
      }
      transcript += '\n';
    }

    return transcript;
  }

  /**
   * 📝 Record debate
   */
  recordDebate(debate) {
    this.debateHistory.push(debate);

    // Keep last 50 debates
    if (this.debateHistory.length > 50) {
      this.debateHistory.shift();
    }

    this.save();
  }

  /**
   * 💾 Save to storage
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('multi_agent_debate', {
        history: this.debateHistory
      });
    }
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    const consensusRate = this.debateHistory.filter(d => d.consensus).length / (this.debateHistory.length || 1);
    const avgRounds = this.debateHistory.reduce((sum, d) => sum + d.rounds, 0) / (this.debateHistory.length || 1);

    return {
      totalDebates: this.debateHistory.length,
      consensusRate,
      avgRounds,
      recentDebates: this.debateHistory.slice(-5)
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.MultiAgentDebate = new MultiAgentDebate();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.MultiAgentDebate.initialize();
    });
  } else {
    window.MultiAgentDebate.initialize();
  }

  console.log('🗣️ Multi-Agent Debate Simulator loaded!');
}
