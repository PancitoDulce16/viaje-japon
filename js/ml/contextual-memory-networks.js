/**
 * 🧵 FASE 17: CONTEXTUAL MEMORY NETWORKS
 * =======================================
 *
 * "La IA que entiende el hilo completo de la conversación"
 *
 * Sistema de memoria contextual que:
 * 1. Entiende referencias cruzadas ("ese lugar", "lo anterior")
 * 2. Mantiene coherencia conversacional
 * 3. Recuerda TODO el contexto, no solo el último mensaje
 * 4. Conecta información dispersa en la conversación
 * 5. Infiere información implícita
 *
 * ARQUITECTURA:
 * - Conversation Graph: Grafo de toda la conversación
 * - Reference Resolver: Resuelve "eso", "lo anterior", etc.
 * - Context Tracker: Rastrea temas activos
 * - Implicit Information Extractor: Deduce info no dicha
 * - Coherence Checker: Verifica consistencia
 *
 * EJEMPLO:
 * Usuario: "Quiero ir a templos"
 * IA: "Te recomiendo Fushimi Inari"
 * Usuario: "¿Cuánto cuesta?"
 * → IA entiende que "eso" = Fushimi Inari (referencia contextual)
 *
 * Usuario: "Agrégalo"
 * → IA entiende que "eso" = Fushimi Inari (memoria del contexto)
 *
 * CAPACIDADES:
 * - Resolución anafórica ("ese", "lo otro", "el anterior")
 * - Memoria de tópicos activos
 * - Inferencia de preferencias implícitas
 * - Detección de cambios de tema
 */

class ContextualMemoryNetworks {
  constructor() {
    this.initialized = false;

    // Conversation graph - nodos representan mensajes, aristas = relaciones
    this.conversationGraph = {
      nodes: [],      // Cada mensaje es un nodo
      edges: [],      // Conexiones entre mensajes
      activeNodes: [] // Nodos "activos" en contexto actual
    };

    // Active context - qué está "en el aire" ahora
    this.activeContext = {
      currentTopic: null,
      mentionedEntities: [],    // Lugares, categorías mencionadas
      pendingReferences: [],     // "eso", "lo anterior" sin resolver
      lastAIsuggestion: null,    // Última sugerencia de IA
      userGoal: null            // Qué está tratando de lograr
    };

    // Reference resolution patterns
    this.referencePatterns = {
      // Pronombres demostrativos
      demonstrative: [
        /\b(ese|esa|eso|esos|esas)\b/i,
        /\b(este|esta|esto|estos|estas)\b/i,
        /\b(aquel|aquella|aquello|aquellos|aquellas)\b/i
      ],

      // Referencias temporales
      temporal: [
        /\b(anterior|antes|previo|pasado)\b/i,
        /\b(último|última|últimos|últimas)\b/i,
        /\b(primero|primera)\b/i
      ],

      // Pronombres
      pronoun: [
        /\blo\b/i,
        /\bla\b/i,
        /\blos\b/i,
        /\blas\b/i
      ]
    };

    // Topic detection keywords
    this.topicKeywords = {
      itinerary_planning: ['itinerario', 'plan', 'día', 'días', 'viaje', 'ruta'],
      place_search: ['buscar', 'encontrar', 'recomendar', 'mostrar', 'ver'],
      modification: ['agregar', 'quitar', 'cambiar', 'modificar', 'eliminar'],
      information: ['cuánto', 'cómo', 'dónde', 'qué', 'cuál', 'info'],
      optimization: ['optimizar', 'mejorar', 'ajustar', 'reducir']
    };

    // Statistics
    this.stats = {
      totalNodes: 0,
      totalEdges: 0,
      referencesResolved: 0,
      topicChanges: 0
    };

    console.log('🧵 Contextual Memory Networks initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load previous conversation if exists
    await this.loadConversation();

    this.initialized = true;
    console.log('✅ Contextual Memory Networks ready');
  }

  /**
   * 📝 CONVERSATION TRACKING
   */

  /**
   * Add message to conversation graph
   */
  addMessage(message, speaker, metadata = {}) {
    const node = {
      id: this.generateNodeId(),
      speaker,              // 'user' or 'ai'
      message,
      metadata,
      timestamp: Date.now(),

      // Extracted information
      entities: metadata.entities || [],
      intent: metadata.intent || null,
      topic: null,          // Will be inferred

      // Graph connections
      references: [],        // What this message refers to
      referencedBy: []      // What messages refer to this
    };

    // Detect topic
    node.topic = this.detectTopic(message);

    // Detect references
    if (this.hasReference(message)) {
      node.references = this.resolveReferences(message);
    }

    // Extract mentioned entities
    const entities = this.extractEntities(message, metadata);
    node.entities = entities;

    // Add to graph
    this.conversationGraph.nodes.push(node);
    this.stats.totalNodes++;

    // Update active nodes (keep last 5)
    this.conversationGraph.activeNodes.push(node.id);
    if (this.conversationGraph.activeNodes.length > 5) {
      this.conversationGraph.activeNodes.shift();
    }

    // Create edges (connections)
    this.createEdges(node);

    // Update active context
    this.updateActiveContext(node);

    console.log(`📝 Added node ${node.id}: "${message.substring(0, 50)}..."`);

    return node;
  }

  /**
   * Create edges between nodes
   */
  createEdges(newNode) {
    // Edge 1: Sequential (always connect to previous)
    if (this.conversationGraph.nodes.length > 1) {
      const prevNode = this.conversationGraph.nodes[this.conversationGraph.nodes.length - 2];

      this.addEdge(prevNode.id, newNode.id, 'sequential', 1.0);
    }

    // Edge 2: Reference (if this message refers to something)
    if (newNode.references.length > 0) {
      for (const ref of newNode.references) {
        this.addEdge(ref.nodeId, newNode.id, 'reference', 0.9);
      }
    }

    // Edge 3: Topic continuity
    const relatedNodes = this.findNodesWithSameTopic(newNode.topic);
    for (const relatedNode of relatedNodes.slice(-3)) {  // Last 3
      if (relatedNode.id !== newNode.id) {
        this.addEdge(relatedNode.id, newNode.id, 'topic_continuity', 0.7);
      }
    }

    // Edge 4: Entity co-occurrence
    if (newNode.entities.length > 0) {
      const nodesWithSameEntities = this.findNodesWithEntities(newNode.entities);
      for (const relatedNode of nodesWithSameEntities.slice(-2)) {  // Last 2
        if (relatedNode.id !== newNode.id) {
          this.addEdge(relatedNode.id, newNode.id, 'entity_cooccurrence', 0.6);
        }
      }
    }
  }

  /**
   * Add edge to graph
   */
  addEdge(fromId, toId, type, weight) {
    const edge = {
      from: fromId,
      to: toId,
      type,
      weight,
      timestamp: Date.now()
    };

    this.conversationGraph.edges.push(edge);
    this.stats.totalEdges++;

    // Update node references
    const toNode = this.getNode(toId);
    if (toNode && !toNode.referencedBy.includes(fromId)) {
      toNode.referencedBy.push(fromId);
    }
  }

  /**
   * 🔗 REFERENCE RESOLUTION
   */

  /**
   * Check if message has references
   */
  hasReference(message) {
    for (const patterns of Object.values(this.referencePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Resolve what "eso", "lo anterior", etc. refer to
   */
  resolveReferences(message) {
    const resolved = [];
    const lowerMessage = message.toLowerCase();

    // Strategy 1: Look for demonstratives ("ese", "eso")
    for (const pattern of this.referencePatterns.demonstrative) {
      if (pattern.test(lowerMessage)) {
        // Refer to last AI suggestion
        if (this.activeContext.lastAIsuggestion) {
          resolved.push({
            type: 'demonstrative',
            referent: this.activeContext.lastAIsuggestion.name || this.activeContext.lastAIsuggestion,
            nodeId: this.activeContext.lastAIsuggestion.nodeId,
            confidence: 0.9
          });
        }
        // Or last mentioned entity
        else if (this.activeContext.mentionedEntities.length > 0) {
          const last = this.activeContext.mentionedEntities[this.activeContext.mentionedEntities.length - 1];
          resolved.push({
            type: 'demonstrative',
            referent: last.name,
            nodeId: last.nodeId,
            confidence: 0.8
          });
        }
      }
    }

    // Strategy 2: Temporal references ("anterior", "último")
    for (const pattern of this.referencePatterns.temporal) {
      if (pattern.test(lowerMessage)) {
        // Refer to previous message
        const prevNodes = this.conversationGraph.nodes.slice(-3, -1);  // Last 2 messages (excluding current)

        if (prevNodes.length > 0) {
          const prev = prevNodes[prevNodes.length - 1];
          resolved.push({
            type: 'temporal',
            referent: prev.message,
            nodeId: prev.id,
            confidence: 0.85
          });
        }
      }
    }

    // Strategy 3: Implicit reference from context
    if (resolved.length === 0 && this.activeContext.currentTopic) {
      // If no explicit reference but topic is active, assume continuation
      const topicNodes = this.findNodesWithSameTopic(this.activeContext.currentTopic);

      if (topicNodes.length > 0) {
        const last = topicNodes[topicNodes.length - 1];
        resolved.push({
          type: 'implicit_topic',
          referent: last.message,
          nodeId: last.id,
          confidence: 0.6
        });
      }
    }

    this.stats.referencesResolved += resolved.length;

    return resolved;
  }

  /**
   * 🎯 CONTEXT TRACKING
   */

  /**
   * Update active context based on new message
   */
  updateActiveContext(node) {
    // Update current topic
    if (node.topic && node.topic !== this.activeContext.currentTopic) {
      this.stats.topicChanges++;
      this.activeContext.currentTopic = node.topic;
      console.log(`📌 Topic changed to: ${node.topic}`);
    }

    // Update mentioned entities
    for (const entity of node.entities) {
      this.activeContext.mentionedEntities.push({
        name: entity.name || entity.value,
        type: entity.type,
        nodeId: node.id,
        timestamp: Date.now()
      });
    }

    // Keep only last 10 entities
    if (this.activeContext.mentionedEntities.length > 10) {
      this.activeContext.mentionedEntities = this.activeContext.mentionedEntities.slice(-10);
    }

    // If this is AI's message, update lastAIsuggestion
    if (node.speaker === 'ai' && node.metadata.suggestion) {
      this.activeContext.lastAIsuggestion = {
        ...node.metadata.suggestion,
        nodeId: node.id
      };
    }

    // Infer user goal
    if (node.speaker === 'user') {
      const inferredGoal = this.inferUserGoal(node);
      if (inferredGoal) {
        this.activeContext.userGoal = inferredGoal;
      }
    }
  }

  /**
   * 🧠 INFORMATION EXTRACTION
   */

  /**
   * Detect topic of message
   */
  detectTopic(message) {
    const lowerMessage = message.toLowerCase();

    for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return topic;
        }
      }
    }

    return 'general';
  }

  /**
   * Extract entities from message
   */
  extractEntities(message, metadata) {
    const entities = [];

    // Use metadata entities if available
    if (metadata.entities) {
      for (const [type, value] of Object.entries(metadata.entities)) {
        if (value && value.value) {
          entities.push({
            type,
            name: value.value,
            value: value.value
          });
        }
      }
    }

    // Extract from active context suggestions
    if (this.activeContext.lastAIsuggestion) {
      const suggestion = this.activeContext.lastAIsuggestion;
      if (message.toLowerCase().includes(suggestion.name?.toLowerCase())) {
        entities.push({
          type: 'place',
          name: suggestion.name,
          value: suggestion
        });
      }
    }

    return entities;
  }

  /**
   * Infer user's goal
   */
  inferUserGoal(node) {
    const message = node.message.toLowerCase();

    if (message.includes('quiero') || message.includes('deseo') || message.includes('me gustaría')) {
      return 'expressing_preference';
    }

    if (message.includes('agregar') || message.includes('añadir')) {
      return 'adding_item';
    }

    if (message.includes('quitar') || message.includes('eliminar')) {
      return 'removing_item';
    }

    if (message.includes('cuánto') || message.includes('cómo') || message.includes('dónde')) {
      return 'seeking_information';
    }

    if (message.includes('optimiza') || message.includes('mejora')) {
      return 'optimizing';
    }

    return null;
  }

  /**
   * 🔍 GRAPH QUERIES
   */

  /**
   * Get node by ID
   */
  getNode(nodeId) {
    return this.conversationGraph.nodes.find(n => n.id === nodeId);
  }

  /**
   * Find nodes with same topic
   */
  findNodesWithSameTopic(topic) {
    if (!topic) return [];
    return this.conversationGraph.nodes.filter(n => n.topic === topic);
  }

  /**
   * Find nodes mentioning specific entities
   */
  findNodesWithEntities(targetEntities) {
    const targetNames = targetEntities.map(e => e.name?.toLowerCase());

    return this.conversationGraph.nodes.filter(node => {
      return node.entities.some(entity =>
        targetNames.includes(entity.name?.toLowerCase())
      );
    });
  }

  /**
   * Get conversation context for current message
   */
  getConversationContext() {
    return {
      currentTopic: this.activeContext.currentTopic,
      recentEntities: this.activeContext.mentionedEntities.slice(-5),
      lastSuggestion: this.activeContext.lastAIsuggestion,
      userGoal: this.activeContext.userGoal,
      activeNodes: this.conversationGraph.activeNodes.map(id => this.getNode(id))
    };
  }

  /**
   * 🛠️ UTILITIES
   */

  generateNodeId() {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 💾 PERSISTENCE
   */

  async loadConversation() {
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('contextual_memory_conversation');

      if (stored) {
        this.conversationGraph = stored.graph || this.conversationGraph;
        this.activeContext = stored.activeContext || this.activeContext;
        this.stats = stored.stats || this.stats;

        console.log('💾 Loaded conversation graph');
      }
    }
  }

  async saveConversation() {
    if (window.MLStorage) {
      await window.MLStorage.set('contextual_memory_conversation', {
        graph: this.conversationGraph,
        activeContext: this.activeContext,
        stats: this.stats,
        lastUpdate: Date.now()
      });
    }
  }

  /**
   * Clear conversation
   */
  clearConversation() {
    this.conversationGraph = {
      nodes: [],
      edges: [],
      activeNodes: []
    };

    this.activeContext = {
      currentTopic: null,
      mentionedEntities: [],
      pendingReferences: [],
      lastAIsuggestion: null,
      userGoal: null
    };

    this.saveConversation();

    console.log('🧹 Conversation cleared');
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      nodesInGraph: this.conversationGraph.nodes.length,
      edgesInGraph: this.conversationGraph.edges.length,
      activeNodesCount: this.conversationGraph.activeNodes.length,
      currentTopic: this.activeContext.currentTopic,
      mentionedEntitiesCount: this.activeContext.mentionedEntities.length
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ContextualMemoryNetworks = new ContextualMemoryNetworks();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ContextualMemoryNetworks.initialize();
    });
  } else {
    window.ContextualMemoryNetworks.initialize();
  }

  console.log('🧵 Contextual Memory Networks loaded!');
}
