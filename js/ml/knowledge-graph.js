/**
 * 🕸️ KNOWLEDGE GRAPH - FASE 3.1
 * ===============================
 *
 * Grafo semántico de conocimiento que relaciona:
 * - Lugares y actividades
 * - Conceptos y categorías
 * - Preferencias de usuarios
 * - Patrones temporales
 * - Relaciones causales
 *
 * Inspiración:
 * - Google Knowledge Graph
 * - ConceptNet
 * - Ontologías semánticas
 *
 * Tipos de relaciones:
 * - is_a (temple is_a tourist_attraction)
 * - located_in (Fushimi_Inari located_in Kyoto)
 * - requires (hiking requires high_energy)
 * - similar_to (ramen similar_to udon)
 * - causes (long_walk causes fatigue)
 * - enables (budget enables luxury_activities)
 * - precedes (breakfast precedes lunch)
 * - conflicts_with (onsen conflicts_with tattoos)
 */

class KnowledgeGraph {
  constructor() {
    this.initialized = false;

    // Graph structure
    this.nodes = new Map(); // id -> node
    this.edges = new Map(); // id -> edge
    this.adjacencyList = new Map(); // nodeId -> [edge ids]

    // Indices for fast lookup
    this.typeIndex = new Map(); // type -> [node ids]
    this.relationIndex = new Map(); // relation type -> [edge ids]

    // Reasoning cache
    this.inferenceCache = new Map();

    console.log('🕸️ Knowledge Graph initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Build initial knowledge base
    await this.buildCoreKnowledge();

    // Load user-specific knowledge if available
    await this.loadUserKnowledge();

    this.initialized = true;
    console.log(`✅ Knowledge Graph initialized: ${this.nodes.size} nodes, ${this.edges.size} edges`);
  }

  // ============================================
  // 🏗️ GRAPH CONSTRUCTION
  // ============================================

  /**
   * Add a node to the graph
   */
  addNode(id, type, properties = {}) {
    if (this.nodes.has(id)) {
      // Update existing node
      const existing = this.nodes.get(id);
      Object.assign(existing.properties, properties);
      return existing;
    }

    const node = {
      id,
      type,
      properties,
      createdAt: Date.now()
    };

    this.nodes.set(id, node);

    // Update type index
    if (!this.typeIndex.has(type)) {
      this.typeIndex.set(type, []);
    }
    this.typeIndex.get(type).push(id);

    // Initialize adjacency list
    this.adjacencyList.set(id, []);

    return node;
  }

  /**
   * Add an edge (relationship) between nodes
   */
  addEdge(fromId, toId, relation, properties = {}) {
    // Ensure nodes exist
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
      console.warn(`Cannot add edge: one or both nodes don't exist (${fromId}, ${toId})`);
      return null;
    }

    const edgeId = `${fromId}_${relation}_${toId}`;

    const edge = {
      id: edgeId,
      from: fromId,
      to: toId,
      relation,
      properties: {
        weight: 1.0,
        confidence: 1.0,
        ...properties
      },
      createdAt: Date.now()
    };

    this.edges.set(edgeId, edge);

    // Update adjacency list
    this.adjacencyList.get(fromId).push(edgeId);

    // Update relation index
    if (!this.relationIndex.has(relation)) {
      this.relationIndex.set(relation, []);
    }
    this.relationIndex.get(relation).push(edgeId);

    return edge;
  }

  /**
   * Build core knowledge about Japan travel
   */
  async buildCoreKnowledge() {
    console.log('🏗️ Building core knowledge base...');

    // === LOCATIONS ===
    this.addNode('tokyo', 'city', { name: 'Tokyo', region: 'Kanto', population: 14000000 });
    this.addNode('kyoto', 'city', { name: 'Kyoto', region: 'Kansai', population: 1470000 });
    this.addNode('osaka', 'city', { name: 'Osaka', region: 'Kansai', population: 2750000 });
    this.addNode('hiroshima', 'city', { name: 'Hiroshima', region: 'Chugoku', population: 1200000 });
    this.addNode('nara', 'city', { name: 'Nara', region: 'Kansai', population: 360000 });

    // === ACTIVITY TYPES ===
    this.addNode('temple', 'activity_category', { name: 'Temple Visit' });
    this.addNode('shrine', 'activity_category', { name: 'Shrine Visit' });
    this.addNode('museum', 'activity_category', { name: 'Museum' });
    this.addNode('food_experience', 'activity_category', { name: 'Food Experience' });
    this.addNode('nature', 'activity_category', { name: 'Nature Activity' });
    this.addNode('shopping', 'activity_category', { name: 'Shopping' });
    this.addNode('entertainment', 'activity_category', { name: 'Entertainment' });

    // === SPECIFIC ATTRACTIONS ===
    this.addNode('fushimi_inari', 'attraction', {
      name: 'Fushimi Inari Shrine',
      popularity: 0.95,
      crowdedness: 0.9,
      duration: 120,
      cost: 0
    });

    this.addNode('kinkakuji', 'attraction', {
      name: 'Kinkaku-ji (Golden Pavilion)',
      popularity: 0.9,
      crowdedness: 0.85,
      duration: 60,
      cost: 500
    });

    this.addNode('arashiyama_bamboo', 'attraction', {
      name: 'Arashiyama Bamboo Grove',
      popularity: 0.88,
      crowdedness: 0.8,
      duration: 90,
      cost: 0
    });

    // === RELATIONSHIPS: Location ===
    this.addEdge('fushimi_inari', 'kyoto', 'located_in', { distance_from_center: 4 });
    this.addEdge('kinkakuji', 'kyoto', 'located_in', { distance_from_center: 5 });
    this.addEdge('arashiyama_bamboo', 'kyoto', 'located_in', { distance_from_center: 8 });

    // === RELATIONSHIPS: Category ===
    this.addEdge('fushimi_inari', 'shrine', 'is_a');
    this.addEdge('kinkakuji', 'temple', 'is_a');
    this.addEdge('arashiyama_bamboo', 'nature', 'is_a');

    // === RELATIONSHIPS: Similarity ===
    this.addEdge('fushimi_inari', 'kinkakuji', 'similar_to', { similarity: 0.6 });
    this.addEdge('temple', 'shrine', 'similar_to', { similarity: 0.8 });

    // === USER ARCHETYPES ===
    this.addNode('foodie', 'archetype', { name: 'Foodie' });
    this.addNode('cultural', 'archetype', { name: 'Culture Seeker' });
    this.addNode('photographer', 'archetype', { name: 'Photographer' });
    this.addNode('explorer', 'archetype', { name: 'Explorer' });

    // === ARCHETYPE PREFERENCES ===
    this.addEdge('foodie', 'food_experience', 'prefers', { weight: 0.9 });
    this.addEdge('cultural', 'temple', 'prefers', { weight: 0.85 });
    this.addEdge('cultural', 'shrine', 'prefers', { weight: 0.85 });
    this.addEdge('cultural', 'museum', 'prefers', { weight: 0.8 });
    this.addEdge('photographer', 'nature', 'prefers', { weight: 0.8 });
    this.addEdge('explorer', 'nature', 'prefers', { weight: 0.75 });

    // === CAUSAL RELATIONSHIPS ===
    this.addNode('walking', 'activity_property', { name: 'Walking' });
    this.addNode('fatigue', 'state', { name: 'Fatigue' });
    this.addNode('high_energy', 'requirement', { name: 'High Energy' });

    this.addEdge('walking', 'fatigue', 'causes', { strength: 0.6 });
    this.addEdge('arashiyama_bamboo', 'walking', 'requires', { amount: 0.7 });
    this.addEdge('fatigue', 'high_energy', 'prevents', { strength: 0.8 });

    // === TEMPORAL RELATIONSHIPS ===
    this.addNode('morning', 'time_period', { start: 6, end: 12 });
    this.addNode('afternoon', 'time_period', { start: 12, end: 18 });
    this.addNode('evening', 'time_period', { start: 18, end: 22 });

    this.addEdge('morning', 'afternoon', 'precedes');
    this.addEdge('afternoon', 'evening', 'precedes');

    // === BUDGET RELATIONSHIPS ===
    this.addNode('budget_low', 'budget_category', { max: 100000 });
    this.addNode('budget_medium', 'budget_category', { min: 100000, max: 250000 });
    this.addNode('budget_high', 'budget_category', { min: 250000 });

    console.log(`✅ Core knowledge built: ${this.nodes.size} nodes`);
  }

  async loadUserKnowledge() {
    // Load user-specific knowledge from storage
    if (!window.MLStorage) return;

    try {
      const patterns = await window.MLStorage.getPatterns();

      // Convert patterns to knowledge graph nodes/edges
      patterns.forEach(pattern => {
        if (pattern.type === 'preference_learned') {
          this.addLearningToGraph(pattern);
        }
      });

      console.log('📚 User knowledge loaded');
    } catch (error) {
      console.warn('Could not load user knowledge:', error);
    }
  }

  addLearningToGraph(pattern) {
    // Add learned patterns to graph
    const { userId, data } = pattern;

    if (data.likedActivity) {
      const activityNode = `user_${userId}_likes_${data.likedActivity}`;
      this.addNode(activityNode, 'user_preference', {
        userId,
        activity: data.likedActivity,
        strength: data.strength || 0.7
      });

      this.addEdge(`user_${userId}`, activityNode, 'has_preference');
    }
  }

  // ============================================
  // 🔍 GRAPH QUERIES
  // ============================================

  /**
   * Get node by ID
   */
  getNode(id) {
    return this.nodes.get(id);
  }

  /**
   * Get all nodes of a specific type
   */
  getNodesByType(type) {
    const nodeIds = this.typeIndex.get(type) || [];
    return nodeIds.map(id => this.nodes.get(id));
  }

  /**
   * Get outgoing edges from a node
   */
  getOutgoingEdges(nodeId) {
    const edgeIds = this.adjacencyList.get(nodeId) || [];
    return edgeIds.map(id => this.edges.get(id));
  }

  /**
   * Get incoming edges to a node
   */
  getIncomingEdges(nodeId) {
    const incoming = [];

    this.edges.forEach(edge => {
      if (edge.to === nodeId) {
        incoming.push(edge);
      }
    });

    return incoming;
  }

  /**
   * Get neighbors of a node via a specific relation
   */
  getNeighbors(nodeId, relation = null) {
    const outgoing = this.getOutgoingEdges(nodeId);

    const filtered = relation ?
      outgoing.filter(e => e.relation === relation) :
      outgoing;

    return filtered.map(edge => ({
      node: this.nodes.get(edge.to),
      edge,
      relation: edge.relation
    }));
  }

  /**
   * Find path between two nodes
   */
  findPath(startId, endId, maxDepth = 5) {
    if (!this.nodes.has(startId) || !this.nodes.has(endId)) {
      return null;
    }

    if (startId === endId) {
      return { path: [startId], length: 0 };
    }

    // BFS
    const queue = [{ nodeId: startId, path: [startId] }];
    const visited = new Set([startId]);

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift();

      if (path.length > maxDepth) continue;

      const neighbors = this.getNeighbors(nodeId);

      for (const { node } of neighbors) {
        if (node.id === endId) {
          return {
            path: [...path, node.id],
            length: path.length,
            nodes: [...path, node.id].map(id => this.getNode(id))
          };
        }

        if (!visited.has(node.id)) {
          visited.add(node.id);
          queue.push({ nodeId: node.id, path: [...path, node.id] });
        }
      }
    }

    return null; // No path found
  }

  // ============================================
  // 🧠 REASONING & INFERENCE
  // ============================================

  /**
   * Infer transitive relationships (if A->B and B->C, then A->C)
   */
  inferTransitiveRelations(relation) {
    const cacheKey = `transitive_${relation}`;
    if (this.inferenceCache.has(cacheKey)) {
      return this.inferenceCache.get(cacheKey);
    }

    const inferred = [];
    const relEdges = this.relationIndex.get(relation) || [];

    relEdges.forEach(edgeId1 => {
      const edge1 = this.edges.get(edgeId1);
      const intermediateNode = edge1.to;

      const outgoing = this.getOutgoingEdges(intermediateNode);
      const relEdges2 = outgoing.filter(e => e.relation === relation);

      relEdges2.forEach(edge2 => {
        // A -> B -> C, so infer A -> C
        const inferredRelation = {
          from: edge1.from,
          to: edge2.to,
          relation,
          confidence: Math.min(
            edge1.properties.confidence,
            edge2.properties.confidence
          ) * 0.8, // Reduce confidence for inferred
          inferred: true,
          via: intermediateNode
        };

        inferred.push(inferredRelation);
      });
    });

    this.inferenceCache.set(cacheKey, inferred);
    return inferred;
  }

  /**
   * Find all activities suitable for an archetype
   */
  getActivitiesForArchetype(archetypeId) {
    // Direct preferences
    const directPrefs = this.getNeighbors(archetypeId, 'prefers');

    const activities = [];

    directPrefs.forEach(({ node: categoryNode, edge }) => {
      // Find all activities that are of this category
      const categoryActivities = this.getIncomingEdges(categoryNode.id)
        .filter(e => e.relation === 'is_a')
        .map(e => ({
          activity: this.getNode(e.from),
          preference: edge.properties.weight,
          category: categoryNode.properties.name
        }));

      activities.push(...categoryActivities);
    });

    return activities.sort((a, b) => b.preference - a.preference);
  }

  /**
   * Explain why an activity is recommended
   */
  explainRecommendation(activityId, userId) {
    const explanations = [];

    // Find user's archetype
    const userNode = this.getNode(`user_${userId}`);
    if (!userNode) {
      return ['Based on general popularity'];
    }

    const archetypeEdges = this.getOutgoingEdges(`user_${userId}`)
      .filter(e => e.relation === 'has_archetype');

    if (archetypeEdges.length === 0) {
      return ['Based on general popularity'];
    }

    const archetypeId = archetypeEdges[0].to;
    const archetype = this.getNode(archetypeId);

    // Find activity category
    const categoryEdges = this.getOutgoingEdges(activityId)
      .filter(e => e.relation === 'is_a');

    if (categoryEdges.length === 0) {
      return [`Recommended for ${archetype.properties.name} travelers`];
    }

    const categoryId = categoryEdges[0].to;
    const category = this.getNode(categoryId);

    // Check if archetype prefers this category
    const prefEdges = this.getOutgoingEdges(archetypeId)
      .filter(e => e.relation === 'prefers' && e.to === categoryId);

    if (prefEdges.length > 0) {
      const weight = prefEdges[0].properties.weight;
      explanations.push(
        `Strong match for ${archetype.properties.name} profile (${Math.round(weight * 100)}% relevance)`
      );
      explanations.push(`${category.properties.name} activities align with your interests`);
    }

    // Find similar activities user liked
    const similarEdges = this.getOutgoingEdges(activityId)
      .filter(e => e.relation === 'similar_to');

    const userLikes = this.getOutgoingEdges(`user_${userId}`)
      .filter(e => e.relation === 'liked');

    similarEdges.forEach(edge => {
      const similarActivity = this.getNode(edge.to);
      const userLiked = userLikes.some(like => like.to === edge.to);

      if (userLiked) {
        explanations.push(
          `Similar to ${similarActivity.properties.name} which you enjoyed`
        );
      }
    });

    return explanations.length > 0 ? explanations : ['Recommended based on your profile'];
  }

  /**
   * Find potential conflicts or issues
   */
  findConflicts(activityIds, context = {}) {
    const conflicts = [];

    activityIds.forEach((activityId, index) => {
      // Check for conflict relationships
      const conflictEdges = this.getOutgoingEdges(activityId)
        .filter(e => e.relation === 'conflicts_with');

      conflictEdges.forEach(edge => {
        const conflictsWith = edge.to;

        // Check if conflicting activity/condition is in the itinerary or context
        if (activityIds.includes(conflictsWith)) {
          const conflictActivity = this.getNode(conflictsWith);
          conflicts.push({
            activity: this.getNode(activityId).properties.name,
            conflictsWith: conflictActivity.properties.name,
            reason: edge.properties.reason || 'These activities conflict',
            severity: edge.properties.severity || 'medium'
          });
        }
      });

      // Check for prerequisite/requirement issues
      const requires = this.getOutgoingEdges(activityId)
        .filter(e => e.relation === 'requires');

      requires.forEach(edge => {
        const requirement = this.getNode(edge.to);

        // Check if requirement is met in context
        if (context.userState && !context.userState[requirement.id]) {
          conflicts.push({
            activity: this.getNode(activityId).properties.name,
            requires: requirement.properties.name,
            reason: `This activity requires ${requirement.properties.name}`,
            severity: 'low'
          });
        }
      });
    });

    return conflicts;
  }

  /**
   * Semantic search - find nodes by concept
   */
  semanticSearch(query, topK = 10) {
    query = query.toLowerCase();
    const results = [];

    this.nodes.forEach(node => {
      const name = (node.properties.name || node.id).toLowerCase();
      const type = node.type.toLowerCase();

      let score = 0;

      // Exact match
      if (name === query) {
        score = 1.0;
      }
      // Contains
      else if (name.includes(query) || query.includes(name)) {
        score = 0.7;
      }
      // Fuzzy match (simple)
      else {
        const similarity = this.simpleSimilarity(query, name);
        if (similarity > 0.5) {
          score = similarity * 0.6;
        }
      }

      // Type boost
      if (type.includes(query)) {
        score += 0.2;
      }

      if (score > 0) {
        results.push({ node, score });
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(r => r.node);
  }

  simpleSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // ============================================
  // 📊 GRAPH ANALYTICS
  // ============================================

  /**
   * Get graph statistics
   */
  getStatistics() {
    const nodeTypes = {};
    const relationTypes = {};

    this.nodes.forEach(node => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    });

    this.edges.forEach(edge => {
      relationTypes[edge.relation] = (relationTypes[edge.relation] || 0) + 1;
    });

    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      nodeTypes,
      relationTypes,
      avgDegree: (this.edges.size * 2) / this.nodes.size,
      density: (this.edges.size / (this.nodes.size * (this.nodes.size - 1))).toFixed(4)
    };
  }

  /**
   * Find most connected nodes (hub detection)
   */
  findHubs(topK = 10) {
    const degrees = [];

    this.nodes.forEach(node => {
      const outDegree = this.getOutgoingEdges(node.id).length;
      const inDegree = this.getIncomingEdges(node.id).length;
      const totalDegree = outDegree + inDegree;

      degrees.push({
        node,
        inDegree,
        outDegree,
        totalDegree
      });
    });

    return degrees
      .sort((a, b) => b.totalDegree - a.totalDegree)
      .slice(0, topK);
  }

  // ============================================
  // 💾 PERSISTENCE
  // ============================================

  async saveGraph() {
    if (!window.MLStorage) return;

    const graphData = {
      nodes: Array.from(this.nodes.entries()),
      edges: Array.from(this.edges.entries()),
      timestamp: Date.now()
    };

    await window.MLStorage.savePattern({
      type: 'knowledge_graph',
      data: graphData,
      userId: window.firebase?.auth()?.currentUser?.uid
    });

    console.log('💾 Knowledge graph saved');
  }

  async loadGraph() {
    if (!window.MLStorage) return;

    try {
      const patterns = await window.MLStorage.getPatterns();
      const graphPattern = patterns.find(p => p.type === 'knowledge_graph');

      if (graphPattern) {
        this.nodes = new Map(graphPattern.data.nodes);
        this.edges = new Map(graphPattern.data.edges);

        // Rebuild indices
        this.rebuildIndices();

        console.log('📥 Knowledge graph loaded');
      }
    } catch (error) {
      console.warn('Could not load knowledge graph:', error);
    }
  }

  rebuildIndices() {
    this.typeIndex.clear();
    this.relationIndex.clear();
    this.adjacencyList.clear();

    this.nodes.forEach(node => {
      if (!this.typeIndex.has(node.type)) {
        this.typeIndex.set(node.type, []);
      }
      this.typeIndex.get(node.type).push(node.id);
      this.adjacencyList.set(node.id, []);
    });

    this.edges.forEach(edge => {
      if (!this.relationIndex.has(edge.relation)) {
        this.relationIndex.set(edge.relation, []);
      }
      this.relationIndex.get(edge.relation).push(edge.id);
      this.adjacencyList.get(edge.from).push(edge.id);
    });
  }
}

// 🌐 Global instance
if (typeof window !== 'undefined') {
  window.KnowledgeGraph = new KnowledgeGraph();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.KnowledgeGraph.initialize().catch(e => {
        console.error('Failed to initialize Knowledge Graph:', e);
      });
    });
  } else {
    window.KnowledgeGraph.initialize().catch(e => {
      console.error('Failed to initialize Knowledge Graph:', e);
    });
  }
}

export default KnowledgeGraph;
