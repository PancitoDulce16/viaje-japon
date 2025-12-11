/**
 * 🧠 FASE 13: LONG-TERM MEMORY SYSTEM
 * ====================================
 *
 * "La IA que NUNCA OLVIDA"
 *
 * Sistema de memoria a largo plazo inspirado en neurociencia:
 * - Memoria Episódica: Eventos específicos (viajes pasados)
 * - Memoria Semántica: Conocimiento general (hechos sobre Japón)
 * - Memoria Procedimental: Cómo hacer cosas (optimizar rutas)
 * - Memoria de Trabajo: Contexto actual (sesión activa)
 *
 * Como un humano que:
 * - Recuerda experiencias pasadas
 * - Sabe hechos culturales
 * - Aprende habilidades que mejoran con práctica
 * - Mantiene contexto de conversación
 *
 * ALMACENAMIENTO:
 * - IndexedDB para persistencia (50-100MB)
 * - Estructuras optimizadas para búsqueda rápida
 * - Compresión de datos antiguos
 * - Auto-consolidación durante inactividad
 */

class LongTermMemory {
  constructor() {
    this.initialized = false;

    // Memory stores
    this.memories = {
      episodic: [],      // Specific events/trips
      semantic: new Map(),  // General knowledge
      procedural: new Map(), // Learned skills
      working: null      // Current context
    };

    // Memory settings
    this.settings = {
      maxEpisodicMemories: 1000,
      maxSemanticFacts: 10000,
      consolidationThreshold: 0.7, // Memories above this are consolidated
      forgettingCurve: 0.05 // Decay rate per day
    };

    // Memory indexes for fast retrieval
    this.indexes = {
      byUser: new Map(),
      byLocation: new Map(),
      byCategory: new Map(),
      byDate: new Map(),
      byImportance: []
    };

    // Statistics
    this.stats = {
      totalMemories: 0,
      consolidations: 0,
      retrievals: 0,
      avgRetrievalTime: 0
    };

    console.log('🧠 Long-Term Memory System initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load from IndexedDB
    await this.loadFromStorage();

    // Start background consolidation
    this.startConsolidation();

    this.initialized = true;
    console.log('✅ Long-Term Memory ready');
    console.log(`📊 Loaded ${this.stats.totalMemories} memories`);
  }

  /**
   * 💾 EPISODIC MEMORY: Remember specific events
   */

  /**
   * Store an episodic memory (specific trip/event)
   */
  async storeEpisode(episode) {
    const memory = {
      id: this.generateId(),
      type: 'episodic',
      timestamp: Date.now(),
      ...episode,
      importance: this.calculateImportance(episode),
      retrievalCount: 0,
      lastRetrieved: null,
      strength: 1.0 // Memory strength (decays over time)
    };

    this.memories.episodic.push(memory);
    this.stats.totalMemories++;

    // Index for fast retrieval
    this.indexMemory(memory);

    // Limit size
    if (this.memories.episodic.length > this.settings.maxEpisodicMemories) {
      this.pruneOldMemories();
    }

    await this.save();

    console.log(`💾 Stored episodic memory: ${memory.id}`);

    return memory.id;
  }

  /**
   * Retrieve episodic memories by query
   */
  async retrieveEpisodes(query) {
    const startTime = Date.now();

    let results = [];

    // Query by user
    if (query.userId) {
      const userMemories = this.indexes.byUser.get(query.userId) || [];
      results = this.memories.episodic.filter(m => userMemories.includes(m.id));
    }

    // Query by location
    else if (query.location) {
      const locationMemories = this.indexes.byLocation.get(query.location) || [];
      results = this.memories.episodic.filter(m => locationMemories.includes(m.id));
    }

    // Query by category
    else if (query.category) {
      const categoryMemories = this.indexes.byCategory.get(query.category) || [];
      results = this.memories.episodic.filter(m => categoryMemories.includes(m.id));
    }

    // Query by date range
    else if (query.startDate && query.endDate) {
      results = this.memories.episodic.filter(m =>
        m.timestamp >= query.startDate && m.timestamp <= query.endDate
      );
    }

    // Full scan (fallback)
    else {
      results = this.memories.episodic;
    }

    // Apply filters
    if (query.minImportance) {
      results = results.filter(m => m.importance >= query.minImportance);
    }

    // Sort by relevance
    results = this.sortByRelevance(results, query);

    // Limit results
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    // Update retrieval stats
    results.forEach(m => {
      m.retrievalCount++;
      m.lastRetrieved = Date.now();
      m.strength = Math.min(1.0, m.strength + 0.1); // Retrieval strengthens memory
    });

    const retrievalTime = Date.now() - startTime;
    this.updateRetrievalStats(retrievalTime);

    console.log(`🔍 Retrieved ${results.length} episodes in ${retrievalTime}ms`);

    return results;
  }

  /**
   * 📚 SEMANTIC MEMORY: General knowledge
   */

  /**
   * Store semantic knowledge (facts about Japan)
   */
  async storeFact(key, value, metadata = {}) {
    const fact = {
      value,
      confidence: metadata.confidence || 0.8,
      source: metadata.source || 'user',
      timestamp: Date.now(),
      updateCount: 0,
      ...metadata
    };

    // If fact exists, update it
    if (this.memories.semantic.has(key)) {
      const existing = this.memories.semantic.get(key);

      // Weighted average of confidence
      fact.confidence = (existing.confidence + fact.confidence) / 2;
      fact.updateCount = existing.updateCount + 1;

      console.log(`🔄 Updated fact: ${key}`);
    } else {
      console.log(`➕ New fact: ${key}`);
    }

    this.memories.semantic.set(key, fact);

    await this.save();

    return key;
  }

  /**
   * Retrieve semantic knowledge
   */
  async retrieveFact(key) {
    const fact = this.memories.semantic.get(key);

    if (fact) {
      console.log(`📖 Retrieved fact: ${key} (confidence: ${fact.confidence})`);
      return fact.value;
    }

    return null;
  }

  /**
   * Query semantic memory with pattern matching
   */
  async queryFacts(pattern) {
    const results = [];

    for (const [key, fact] of this.memories.semantic) {
      if (key.includes(pattern) || JSON.stringify(fact.value).includes(pattern)) {
        results.push({ key, ...fact });
      }
    }

    return results;
  }

  /**
   * 🔧 PROCEDURAL MEMORY: Learned skills
   */

  /**
   * Store procedural knowledge (how to do things)
   */
  async storeProcedure(skill, procedure) {
    const existing = this.memories.procedural.get(skill);

    const proc = {
      steps: procedure.steps,
      successRate: procedure.successRate || 0,
      executionCount: existing ? existing.executionCount + 1 : 1,
      avgExecutionTime: procedure.avgExecutionTime || 0,
      lastUsed: Date.now(),
      improvements: existing ? existing.improvements + 1 : 0
    };

    this.memories.procedural.set(skill, proc);

    console.log(`🔧 Stored procedure: ${skill} (executions: ${proc.executionCount})`);

    await this.save();
  }

  /**
   * Retrieve and execute procedure
   */
  async executeProcedure(skill, context = {}) {
    const proc = this.memories.procedural.get(skill);

    if (!proc) {
      console.warn(`❌ Procedure not found: ${skill}`);
      return null;
    }

    const startTime = Date.now();

    // Execute steps
    const results = [];
    for (const step of proc.steps) {
      try {
        const result = await this.executeStep(step, context);
        results.push(result);
      } catch (e) {
        console.error(`Error in step: ${step.name}`, e);
        results.push({ error: e.message });
      }
    }

    const executionTime = Date.now() - startTime;

    // Update procedure stats
    proc.lastUsed = Date.now();
    proc.executionCount++;
    proc.avgExecutionTime = (proc.avgExecutionTime * (proc.executionCount - 1) + executionTime) / proc.executionCount;

    console.log(`⚙️ Executed procedure: ${skill} in ${executionTime}ms`);

    return results;
  }

  /**
   * Execute a single step
   */
  async executeStep(step, context) {
    // This would call relevant modules
    if (step.module && window[step.module]) {
      const module = window[step.module];
      if (module[step.method]) {
        return await module[step.method](step.params, context);
      }
    }

    return null;
  }

  /**
   * 💭 WORKING MEMORY: Current context
   */

  /**
   * Set working memory (current session context)
   */
  setWorkingMemory(context) {
    this.memories.working = {
      ...context,
      timestamp: Date.now(),
      ttl: 30 * 60 * 1000 // 30 minutes
    };

    console.log('💭 Working memory updated');
  }

  /**
   * Get working memory
   */
  getWorkingMemory() {
    if (!this.memories.working) return null;

    // Check if expired
    const age = Date.now() - this.memories.working.timestamp;
    if (age > this.memories.working.ttl) {
      console.log('⏰ Working memory expired, clearing...');
      this.memories.working = null;
      return null;
    }

    return this.memories.working;
  }

  /**
   * 🔍 MEMORY CONSOLIDATION
   */

  /**
   * Consolidate memories during idle time
   */
  async consolidateMemories() {
    console.log('🔄 Starting memory consolidation...');

    let consolidated = 0;

    // 1. Decay old memories
    for (const memory of this.memories.episodic) {
      const age = Date.now() - memory.timestamp;
      const daysSince = age / (24 * 60 * 60 * 1000);

      // Exponential decay
      memory.strength *= Math.exp(-this.settings.forgettingCurve * daysSince);

      // If retrieved recently, strengthen
      if (memory.lastRetrieved && Date.now() - memory.lastRetrieved < 7 * 24 * 60 * 60 * 1000) {
        memory.strength = Math.min(1.0, memory.strength * 1.2);
      }
    }

    // 2. Consolidate strong memories to semantic
    for (const memory of this.memories.episodic) {
      if (memory.strength > this.settings.consolidationThreshold && memory.retrievalCount > 5) {
        // Extract facts from episodic memory
        await this.extractSemanticKnowledge(memory);
        consolidated++;
      }
    }

    // 3. Remove very weak memories
    this.memories.episodic = this.memories.episodic.filter(m => m.strength > 0.1);

    this.stats.consolidations++;

    console.log(`✅ Consolidated ${consolidated} memories`);

    await this.save();
  }

  /**
   * Extract semantic knowledge from episodic memory
   */
  async extractSemanticKnowledge(episode) {
    // Example: If user repeatedly likes temples, store as semantic fact
    if (episode.category === 'temples' && episode.userRating > 4) {
      const key = `user:${episode.userId}:preference:temples`;
      const existing = this.memories.semantic.get(key);

      const newValue = {
        rating: episode.userRating,
        count: (existing?.value.count || 0) + 1
      };

      await this.storeFact(key, newValue, {
        confidence: 0.9,
        source: 'consolidation'
      });
    }

    // Extract location preferences
    if (episode.location && episode.userRating > 4) {
      const key = `location:${episode.location}:avgRating`;
      await this.storeFact(key, episode.userRating, {
        confidence: 0.8,
        source: 'consolidation'
      });
    }
  }

  /**
   * Start background consolidation
   */
  startConsolidation() {
    // Run every hour
    setInterval(() => {
      this.consolidateMemories();
    }, 60 * 60 * 1000);

    // Also run during idle time
    if ('requestIdleCallback' in window) {
      const scheduleConsolidation = () => {
        window.requestIdleCallback(() => {
          this.consolidateMemories();
          // Schedule next
          setTimeout(scheduleConsolidation, 60 * 60 * 1000);
        }, { timeout: 10000 });
      };

      scheduleConsolidation();
    }
  }

  /**
   * 🗑️ MEMORY PRUNING
   */

  /**
   * Prune old, weak memories
   */
  pruneOldMemories() {
    // Sort by importance and strength
    this.memories.episodic.sort((a, b) => {
      const scoreA = a.importance * a.strength;
      const scoreB = b.importance * b.strength;
      return scoreB - scoreA;
    });

    // Keep top N
    const removed = this.memories.episodic.splice(this.settings.maxEpisodicMemories);

    console.log(`🗑️ Pruned ${removed.length} weak memories`);
  }

  /**
   * 📇 INDEXING
   */

  /**
   * Index memory for fast retrieval
   */
  indexMemory(memory) {
    // By user
    if (memory.userId) {
      if (!this.indexes.byUser.has(memory.userId)) {
        this.indexes.byUser.set(memory.userId, []);
      }
      this.indexes.byUser.get(memory.userId).push(memory.id);
    }

    // By location
    if (memory.location) {
      if (!this.indexes.byLocation.has(memory.location)) {
        this.indexes.byLocation.set(memory.location, []);
      }
      this.indexes.byLocation.get(memory.location).push(memory.id);
    }

    // By category
    if (memory.category) {
      if (!this.indexes.byCategory.has(memory.category)) {
        this.indexes.byCategory.set(memory.category, []);
      }
      this.indexes.byCategory.get(memory.category).push(memory.id);
    }

    // By importance
    this.indexes.byImportance.push({ id: memory.id, importance: memory.importance });
    this.indexes.byImportance.sort((a, b) => b.importance - a.importance);
  }

  /**
   * 📊 UTILITY FUNCTIONS
   */

  /**
   * Calculate memory importance
   */
  calculateImportance(episode) {
    let importance = 0.5; // Base

    // High rating = more important
    if (episode.userRating > 4) importance += 0.3;

    // Long duration = more important
    if (episode.duration > 3600000) importance += 0.1; // > 1 hour

    // Shared with others = more important
    if (episode.shared) importance += 0.1;

    return Math.min(1.0, importance);
  }

  /**
   * Sort by relevance
   */
  sortByRelevance(memories, query) {
    return memories.sort((a, b) => {
      let scoreA = a.importance * a.strength;
      let scoreB = b.importance * b.strength;

      // Boost recent memories
      const ageA = Date.now() - a.timestamp;
      const ageB = Date.now() - b.timestamp;

      if (ageA < 7 * 24 * 60 * 60 * 1000) scoreA *= 1.2; // Last week
      if (ageB < 7 * 24 * 60 * 60 * 1000) scoreB *= 1.2;

      return scoreB - scoreA;
    });
  }

  /**
   * Update retrieval stats
   */
  updateRetrievalStats(time) {
    this.stats.retrievals++;
    this.stats.avgRetrievalTime =
      (this.stats.avgRetrievalTime * (this.stats.retrievals - 1) + time) / this.stats.retrievals;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 💾 PERSISTENCE
   */

  /**
   * Load from IndexedDB
   */
  async loadFromStorage() {
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('long_term_memory');

      if (stored) {
        this.memories.episodic = stored.episodic || [];
        this.memories.semantic = new Map(stored.semantic || []);
        this.memories.procedural = new Map(stored.procedural || []);
        this.stats = stored.stats || this.stats;

        // Rebuild indexes
        this.rebuildIndexes();

        console.log(`📂 Loaded memories from storage`);
      }
    }
  }

  /**
   * Save to IndexedDB
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('long_term_memory', {
        episodic: this.memories.episodic,
        semantic: Array.from(this.memories.semantic.entries()),
        procedural: Array.from(this.memories.procedural.entries()),
        stats: this.stats
      });
    }
  }

  /**
   * Rebuild indexes
   */
  rebuildIndexes() {
    this.indexes = {
      byUser: new Map(),
      byLocation: new Map(),
      byCategory: new Map(),
      byDate: new Map(),
      byImportance: []
    };

    for (const memory of this.memories.episodic) {
      this.indexMemory(memory);
    }

    console.log('🔨 Indexes rebuilt');
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      episodicCount: this.memories.episodic.length,
      semanticCount: this.memories.semantic.size,
      proceduralCount: this.memories.procedural.size,
      indexSizes: {
        byUser: this.indexes.byUser.size,
        byLocation: this.indexes.byLocation.size,
        byCategory: this.indexes.byCategory.size
      }
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.LongTermMemory = new LongTermMemory();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.LongTermMemory.initialize();
    });
  } else {
    window.LongTermMemory.initialize();
  }

  console.log('🧠 Long-Term Memory System loaded!');
}
