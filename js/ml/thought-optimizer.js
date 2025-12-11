/**
 * ⚡ FASE 12.5: THOUGHT OPTIMIZER
 * ================================
 *
 * "Pensamiento eficiente como humano experto"
 *
 * Asegura que el razonamiento sea:
 * - RÁPIDO: Cachea thoughts pasados
 * - EFICIENTE: Prune branches innecesarios
 * - RESOURCE-LIGHT: No divaga, va al grano
 *
 * Como un humano eficiente que:
 * - No repite análisis ya hechos
 * - Descarta opciones malas rápido
 * - Usa memoria de corto plazo
 * - Optimiza uso de recursos mentales
 */

class ThoughtOptimizer {
  constructor() {
    this.initialized = false;

    // Thought cache (LRU - Least Recently Used)
    this.cache = new Map();
    this.cacheMaxSize = 100;

    // Pruning settings
    this.pruneSettings = {
      minScore: 0.3,           // Branches below this are pruned
      maxBranches: 5,          // Max branches to explore
      earlyStopThreshold: 0.9  // If found >0.9 score, stop searching
    };

    // Performance metrics
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalThoughts: 0,
      prunedThoughts: 0,
      avgProcessingTime: 0
    };

    console.log('⚡ Thought Optimizer initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load cache from storage
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('thought_optimizer');
      if (stored) {
        this.cache = new Map(stored.cache || []);
        this.metrics = stored.metrics || this.metrics;
      }
    }

    this.initialized = true;
    console.log('✅ Thought Optimizer ready');
    console.log(`💾 Cache size: ${this.cache.size} entries`);
  }

  /**
   * ⚡ Optimize a reasoning function with caching
   * @param {Function} reasoningFunc - Function that does reasoning
   * @param {*} query - Query to reason about
   * @param {Object} options - Optimization options
   * @returns {*} Result (cached or computed)
   */
  optimize(reasoningFunc, query, options = {}) {
    const startTime = Date.now();
    this.metrics.totalThoughts++;

    // Generate cache key
    const cacheKey = this.generateCacheKey(query, options);

    // Check cache
    if (this.cache.has(cacheKey)) {
      this.metrics.cacheHits++;
      const cached = this.cache.get(cacheKey);

      // Update LRU (move to end)
      this.cache.delete(cacheKey);
      this.cache.set(cacheKey, cached);

      const processingTime = Date.now() - startTime;
      this.updateAvgTime(processingTime);

      console.log(`⚡ Cache HIT for "${this.truncate(query, 30)}" (${processingTime}ms)`);

      return { ...cached, fromCache: true, processingTime };
    }

    // Cache miss - compute
    this.metrics.cacheMisses++;
    console.log(`⚡ Cache MISS for "${this.truncate(query, 30)}" - computing...`);

    const result = reasoningFunc(query);

    // Cache result
    this.cacheResult(cacheKey, result);

    const processingTime = Date.now() - startTime;
    this.updateAvgTime(processingTime);

    return { ...result, fromCache: false, processingTime };
  }

  /**
   * ✂️ Prune a tree structure
   * @param {Object} tree - Tree with nodes having 'score' and 'children'
   * @returns {Object} Pruned tree
   */
  prune(tree) {
    if (!tree) return tree;

    let prunedCount = 0;

    const pruneRecursive = (node) => {
      if (!node.children || node.children.length === 0) {
        return node;
      }

      // Filter low-score children
      const originalCount = node.children.length;
      node.children = node.children.filter(child => {
        if (child.score < this.pruneSettings.minScore) {
          prunedCount++;
          return false;
        }
        return true;
      });

      // Limit branches
      if (node.children.length > this.pruneSettings.maxBranches) {
        // Keep only top-N by score
        node.children.sort((a, b) => b.score - a.score);
        const removed = node.children.length - this.pruneSettings.maxBranches;
        node.children = node.children.slice(0, this.pruneSettings.maxBranches);
        prunedCount += removed;
      }

      // Recursively prune children
      node.children = node.children.map(child => pruneRecursive(child));

      return node;
    };

    const prunedTree = pruneRecursive(tree);

    this.metrics.prunedThoughts += prunedCount;

    if (prunedCount > 0) {
      console.log(`✂️ Pruned ${prunedCount} low-value branches`);
    }

    return prunedTree;
  }

  /**
   * 🎯 Early stop if high-confidence solution found
   * @param {Array} results - Array of results with scores
   * @returns {boolean} Should stop searching
   */
  shouldEarlyStop(results) {
    if (!results || results.length === 0) return false;

    const maxScore = Math.max(...results.map(r => r.score || 0));

    return maxScore >= this.pruneSettings.earlyStopThreshold;
  }

  /**
   * 🔑 Generate cache key
   */
  generateCacheKey(query, options = {}) {
    const queryStr = typeof query === 'string' ? query : JSON.stringify(query);
    const normalized = queryStr.toLowerCase().trim();

    // Simple hash function
    const hash = this.simpleHash(normalized);

    // Include relevant options in key
    const optionsStr = Object.keys(options).length > 0
      ? ':' + JSON.stringify(options)
      : '';

    return `${hash}${optionsStr}`;
  }

  /**
   * 🔢 Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 💾 Cache a result
   */
  cacheResult(key, result) {
    // Check cache size
    if (this.cache.size >= this.cacheMaxSize) {
      // Remove oldest (LRU - first entry)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    // Add to cache
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * 🧹 Clear cache
   */
  clearCache() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🧹 Cleared cache (${size} entries)`);
  }

  /**
   * ⏰ Clear old cache entries
   */
  clearOldCache(maxAgeMs = 60 * 60 * 1000) { // Default 1 hour
    const now = Date.now();
    let cleared = 0;

    for (const [key, value] of this.cache) {
      if (now - value.timestamp > maxAgeMs) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(`⏰ Cleared ${cleared} old cache entries`);
    }
  }

  /**
   * 📊 Update average processing time
   */
  updateAvgTime(time) {
    const n = this.metrics.totalThoughts;
    this.metrics.avgProcessingTime = (this.metrics.avgProcessingTime * (n - 1) + time) / n;
  }

  /**
   * ✂️ Truncate string
   */
  truncate(str, maxLen) {
    if (typeof str !== 'string') str = String(str);
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
  }

  /**
   * 💾 Save to storage
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('thought_optimizer', {
        cache: Array.from(this.cache.entries()),
        metrics: this.metrics
      });
    }
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    const hitRate = this.metrics.totalThoughts > 0
      ? this.metrics.cacheHits / this.metrics.totalThoughts
      : 0;

    const pruneRate = this.metrics.totalThoughts > 0
      ? this.metrics.prunedThoughts / this.metrics.totalThoughts
      : 0;

    return {
      ...this.metrics,
      hitRate,
      pruneRate,
      cacheSize: this.cache.size,
      cacheSavings: `${(hitRate * 100).toFixed(1)}% faster via cache`
    };
  }

  /**
   * 🔧 Configure optimizer
   */
  configure(settings) {
    if (settings.cacheMaxSize !== undefined) {
      this.cacheMaxSize = settings.cacheMaxSize;
    }

    if (settings.pruneSettings) {
      this.pruneSettings = { ...this.pruneSettings, ...settings.pruneSettings };
    }

    console.log('⚙️ Thought Optimizer configured:', { cacheMaxSize: this.cacheMaxSize, pruneSettings: this.pruneSettings });
  }

  /**
   * 🎯 Optimize multiple reasoning functions in batch
   */
  batchOptimize(reasoningFuncs, queries, options = {}) {
    if (reasoningFuncs.length !== queries.length) {
      throw new Error('reasoningFuncs and queries must have same length');
    }

    const results = [];

    for (let i = 0; i < reasoningFuncs.length; i++) {
      const result = this.optimize(reasoningFuncs[i], queries[i], options);
      results.push(result);

      // Early stop if configured
      if (options.earlyStop && this.shouldEarlyStop(results)) {
        console.log('⏹️ Early stop triggered');
        break;
      }
    }

    return results;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ThoughtOptimizer = new ThoughtOptimizer();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ThoughtOptimizer.initialize();

      // Clear old cache entries every 10 minutes
      setInterval(() => {
        window.ThoughtOptimizer.clearOldCache();
      }, 10 * 60 * 1000);
    });
  } else {
    window.ThoughtOptimizer.initialize();

    // Clear old cache entries every 10 minutes
    setInterval(() => {
      window.ThoughtOptimizer.clearOldCache();
    }, 10 * 60 * 1000);
  }

  console.log('⚡ Thought Optimizer loaded!');
}
