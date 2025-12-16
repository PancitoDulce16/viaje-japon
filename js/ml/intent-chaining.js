/**
 * 🔗 INTENT CHAINING ENGINE
 * ==========================
 *
 * Handles multi-turn conversations where intents connect logically
 * Enables natural workflow execution across multiple messages
 */

class IntentChaining {
  constructor() {
    this.initialized = false;
    this.activeChains = [];
    this.chainPatterns = this.buildChainPatterns();
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🔗 Intent Chaining initializing...');

    // Load active chains
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('intent_chains');
      if (stored) {
        this.activeChains = stored.chains || [];
      }
    }

    this.initialized = true;
    console.log('✅ Intent Chaining ready');
  }

  /**
   * Build patterns for intent chaining
   */
  buildChainPatterns() {
    return {
      // Sequence indicators
      continuation: {
        patterns: [
          /^y\s+(?:luego|después|entonces)/i,
          /^(?:luego|después|entonces)\s+/i,
          /^(?:también|tambien)\s+/i,
          /^ahora\s+/i,
          /^y\s+/i
        ],
        behavior: 'continue_chain'
      },

      // Reference to previous result
      reference: {
        patterns: [
          /^(?:eso|esto|lo\s+mismo)/i,
          /^(?:el|la|los|las)\s+(?:mismo|misma|mismos|mismas)/i,
          /^(?:para\s+)?(?:el|la|ese|esa)\s+(?:día|lugar|actividad)/i,
          /^ahí|allí/i
        ],
        behavior: 'reference_previous'
      },

      // Comparison or alternative
      comparison: {
        patterns: [
          /^pero\s+/i,
          /^en\s+vez\s+de/i,
          /^en\s+lugar\s+de/i,
          /^mejor\s+/i,
          /^o\s+(?:mejor|también)/i
        ],
        behavior: 'modify_previous'
      },

      // Confirmation of chain step
      confirmation: {
        patterns: [
          /^(?:si|sí|ok|okay|dale|perfecto|claro|exacto|correcto)/i,
          /^(?:hazlo|hacelo|adelante|continúa|continua)/i
        ],
        behavior: 'execute_pending'
      },

      // Cancellation of chain
      cancellation: {
        patterns: [
          /^no\s+(?:ya|mejor\s+no|gracias)/i,
          /^(?:cancela|olvida|déjalo|dejalo)/i,
          /^mejor\s+no/i
        ],
        behavior: 'cancel_chain'
      }
    };
  }

  /**
   * Detect if user input is chaining with previous intent
   */
  detectChain(userInput, conversationContext) {
    for (const [type, config] of Object.entries(this.chainPatterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(userInput)) {
          console.log(`🔗 Detected ${type} chain:`, userInput);
          return {
            type,
            behavior: config.behavior,
            originalInput: userInput
          };
        }
      }
    }

    return null;
  }

  /**
   * Start a new intent chain
   */
  startChain(intent, data = {}) {
    const chain = {
      id: this.generateChainId(),
      startedAt: Date.now(),
      steps: [{
        intent,
        data,
        timestamp: Date.now(),
        status: 'completed'
      }],
      status: 'active'
    };

    this.activeChains.push(chain);
    console.log('🔗 Started new chain:', chain.id);

    return chain;
  }

  /**
   * Add step to active chain
   */
  addStep(intent, data = {}, chainId = null) {
    const chain = chainId
      ? this.activeChains.find(c => c.id === chainId)
      : this.getActiveChain();

    if (!chain) {
      return this.startChain(intent, data);
    }

    chain.steps.push({
      intent,
      data,
      timestamp: Date.now(),
      status: 'completed'
    });

    console.log(`🔗 Added step to chain ${chain.id}:`, intent);
    return chain;
  }

  /**
   * Get currently active chain
   */
  getActiveChain() {
    const now = Date.now();
    // Consider chain active if last step was within 2 minutes
    return this.activeChains.find(chain =>
      chain.status === 'active' &&
      now - chain.steps[chain.steps.length - 1].timestamp < 120000
    );
  }

  /**
   * Get last step from active chain
   */
  getLastStep() {
    const chain = this.getActiveChain();
    if (!chain || chain.steps.length === 0) return null;

    return chain.steps[chain.steps.length - 1];
  }

  /**
   * Process chained input
   */
  processChain(chainInfo, currentInput, parsedIntent, entities) {
    const lastStep = this.getLastStep();
    const behavior = chainInfo.behavior;

    console.log(`🔗 Processing chain with behavior: ${behavior}`);

    switch (behavior) {
      case 'continue_chain':
        // Continue with new intent, inheriting context
        return this.continueChain(parsedIntent, entities, lastStep);

      case 'reference_previous':
        // Reference previous result, apply same intent
        return this.referencePrevious(parsedIntent, entities, lastStep);

      case 'modify_previous':
        // Modify previous intent with new parameters
        return this.modifyPrevious(parsedIntent, entities, lastStep);

      case 'execute_pending':
        // User confirmed, execute pending action
        return this.executePending(lastStep);

      case 'cancel_chain':
        // Cancel the chain
        return this.cancelChain();

      default:
        return null;
    }
  }

  /**
   * Continue chain with inherited context
   */
  continueChain(parsedIntent, entities, lastStep) {
    if (!lastStep) return null;

    // Inherit entities from last step
    const inheritedEntities = { ...lastStep.data.entities };

    // Merge with current entities (current takes precedence)
    const mergedEntities = { ...inheritedEntities, ...entities };

    console.log('🔗 Continuing chain with merged entities:', mergedEntities);

    return {
      intent: parsedIntent,
      entities: mergedEntities,
      chainContext: {
        previousIntent: lastStep.intent,
        inherited: true
      }
    };
  }

  /**
   * Reference previous result
   */
  referencePrevious(parsedIntent, entities, lastStep) {
    if (!lastStep) return null;

    // If user says "eso" or "lo mismo", use same intent with same data
    if (parsedIntent.intent === 'UNKNOWN' || !parsedIntent.intent) {
      return {
        intent: { intent: lastStep.intent, action: lastStep.intent },
        entities: lastStep.data.entities || entities,
        chainContext: {
          reference: true,
          referencedStep: lastStep
        }
      };
    }

    // Otherwise, apply new intent to referenced entity
    return {
      intent: parsedIntent,
      entities: { ...lastStep.data.entities, ...entities },
      chainContext: {
        reference: true,
        referencedStep: lastStep
      }
    };
  }

  /**
   * Modify previous intent
   */
  modifyPrevious(parsedIntent, entities, lastStep) {
    if (!lastStep) return null;

    return {
      intent: parsedIntent.intent ? parsedIntent : { intent: lastStep.intent },
      entities: { ...lastStep.data.entities, ...entities },
      chainContext: {
        modification: true,
        modifiedStep: lastStep
      }
    };
  }

  /**
   * Execute pending action
   */
  executePending(lastStep) {
    // Mark last step as confirmed
    if (lastStep) {
      lastStep.confirmed = true;
    }

    return {
      intent: { intent: 'EXECUTE_CONFIRMED', action: 'executeConfirmed' },
      entities: {},
      chainContext: {
        confirmation: true,
        confirmedStep: lastStep
      }
    };
  }

  /**
   * Cancel active chain
   */
  cancelChain() {
    const chain = this.getActiveChain();
    if (chain) {
      chain.status = 'cancelled';
      console.log('🔗 Chain cancelled:', chain.id);
    }

    return {
      intent: { intent: 'CANCEL_CHAIN', action: 'cancelChain' },
      entities: {},
      chainContext: {
        cancellation: true
      }
    };
  }

  /**
   * Complete chain
   */
  completeChain(chainId = null) {
    const chain = chainId
      ? this.activeChains.find(c => c.id === chainId)
      : this.getActiveChain();

    if (chain) {
      chain.status = 'completed';
      chain.completedAt = Date.now();
      console.log('✅ Chain completed:', chain.id);
    }
  }

  /**
   * Get chain summary for debugging
   */
  getChainSummary(chainId = null) {
    const chain = chainId
      ? this.activeChains.find(c => c.id === chainId)
      : this.getActiveChain();

    if (!chain) return null;

    return {
      id: chain.id,
      stepCount: chain.steps.length,
      duration: Date.now() - chain.startedAt,
      steps: chain.steps.map(s => ({
        intent: s.intent,
        timestamp: s.timestamp
      })),
      status: chain.status
    };
  }

  /**
   * Clean up old chains
   */
  cleanupChains() {
    const now = Date.now();
    const maxAge = 600000; // 10 minutes

    this.activeChains = this.activeChains.filter(chain => {
      const age = now - chain.startedAt;
      return age < maxAge && chain.status !== 'completed';
    });
  }

  /**
   * Generate unique chain ID
   */
  generateChainId() {
    return `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save chains to storage
   */
  async save() {
    this.cleanupChains();

    if (window.MLStorage) {
      await window.MLStorage.set('intent_chains', {
        chains: this.activeChains,
        lastUpdated: Date.now()
      });
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.IntentChaining = new IntentChaining();
  console.log('🔗 Intent Chaining loaded!');
}
