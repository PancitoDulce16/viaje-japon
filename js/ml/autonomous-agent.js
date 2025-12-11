/**
 * 🤖 AUTONOMOUS AGENT - FASE 11
 * ==============================
 *
 * "El cerebro ejecutivo: De la intención a la acción"
 *
 * Un agente autónomo que puede:
 * 1. Tomar objetivos de alto nivel ("Planea mi viaje a Japón")
 * 2. Descomponerlos en tareas accionables
 * 3. Ejecutar esas tareas usando otros módulos ML
 * 4. Monitorear progreso
 * 5. Adaptarse cuando algo no sale según lo planeado
 * 6. Reportar resultados al usuario
 *
 * ARQUITECTURA:
 * - Goal Parser: Entiende intenciones del usuario
 * - Task Decomposer: Divide goals en subtareas
 * - Execution Engine: Ejecuta tareas paso a paso
 * - Progress Monitor: Rastrea completitud
 * - Adaptation Layer: Re-planea cuando es necesario
 *
 * EJEMPLO:
 * Usuario: "Quiero un itinerario de 5 días en Tokio con templos y gastronomía"
 *
 * Agent descompone en:
 * 1. Identificar días disponibles (5)
 * 2. Obtener preferencias (templos, gastronomía)
 * 3. Buscar templos en Tokio
 * 4. Buscar lugares de gastronomía
 * 5. Optimizar ruta por día
 * 6. Generar itinerario final
 *
 * Ejecuta cada tarea, monitorea, adapta si falla algo.
 */

class AutonomousAgent {
  constructor() {
    this.initialized = false;

    // Agent state
    this.state = {
      currentGoal: null,
      tasks: [],
      completedTasks: [],
      failedTasks: [],
      context: {},
      status: 'idle' // idle, planning, executing, adapting, completed, failed
    };

    // Task execution history
    this.executionHistory = [];

    // Agent configuration
    this.config = {
      maxRetries: 3,              // Reintentos por tarea
      timeoutPerTask: 30000,      // 30 segundos por tarea
      adaptationThreshold: 0.3,   // Si 30% de tareas fallan, re-planear
      planningDepth: 3,           // Niveles de descomposición
      parallelExecution: false    // Ejecutar tareas en paralelo (futuro)
    };

    // Module references (will be set during initialize)
    this.modules = {
      treeOfThoughts: null,
      multiAgentDebate: null,
      swarmIntelligence: null,
      dataIntegration: null,
      longTermMemory: null,
      conversationalAI: null
    };

    // Task templates - common tasks the agent knows how to execute
    this.taskTemplates = {
      'search_places': {
        executor: 'dataIntegration',
        method: 'fetchPlaces',
        requiredParams: ['city', 'category']
      },
      'optimize_route': {
        executor: 'swarmIntelligence',
        method: 'optimizeFullRoute',
        requiredParams: ['places', 'context']
      },
      'make_recommendation': {
        executor: 'conversationalAI',
        method: 'processMessage',
        requiredParams: ['query']
      },
      'check_weather': {
        executor: 'dataIntegration',
        method: 'fetchWeather',
        requiredParams: ['city']
      },
      'recall_memory': {
        executor: 'longTermMemory',
        method: 'recall',
        requiredParams: ['query']
      },
      'reason_about': {
        executor: 'treeOfThoughts',
        method: 'explore',
        requiredParams: ['query', 'context']
      },
      'debate_decision': {
        executor: 'multiAgentDebate',
        method: 'debate',
        requiredParams: ['query', 'options', 'context']
      }
    };

    // Statistics
    this.stats = {
      goalsCompleted: 0,
      goalsFailed: 0,
      tasksExecuted: 0,
      tasksFailed: 0,
      adaptations: 0,
      avgExecutionTime: 0,
      successRate: 0
    };

    console.log('🤖 Autonomous Agent initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Get references to other ML modules
    this.modules.treeOfThoughts = window.TreeOfThoughts;
    this.modules.multiAgentDebate = window.MultiAgentDebate;
    this.modules.swarmIntelligence = window.SwarmIntelligenceAdvanced || window.SwarmIntelligence;
    this.modules.dataIntegration = window.JapanDataIntegration;
    this.modules.longTermMemory = window.LongTermMemory;
    this.modules.conversationalAI = window.ConversationalAI;

    // Load execution history
    await this.loadHistory();

    this.initialized = true;
    console.log('✅ Autonomous Agent ready');
    console.log(`📊 Goals completed: ${this.stats.goalsCompleted}`);
  }

  /**
   * 🎯 GOAL PROCESSING
   */

  /**
   * Main entry point - accepts a high-level goal
   */
  async executeGoal(goal, context = {}) {
    const startTime = Date.now();

    console.log(`🎯 New goal received: "${goal}"`);

    // Reset state
    this.state = {
      currentGoal: goal,
      tasks: [],
      completedTasks: [],
      failedTasks: [],
      context: { ...context, startTime },
      status: 'planning'
    };

    try {
      // PHASE 1: Parse goal
      const parsedGoal = await this.parseGoal(goal, context);
      console.log('📝 Goal parsed:', parsedGoal);

      // PHASE 2: Decompose into tasks
      this.state.status = 'planning';
      const tasks = await this.decomposeTasks(parsedGoal, context);
      this.state.tasks = tasks;
      console.log(`📋 Generated ${tasks.length} tasks`);

      // PHASE 3: Execute tasks
      this.state.status = 'executing';
      const results = await this.executeTasks(tasks);

      // PHASE 4: Check if adaptation needed
      const failureRate = this.state.failedTasks.length / tasks.length;
      if (failureRate > this.config.adaptationThreshold && failureRate < 1.0) {
        console.log('🔄 Adaptation needed, re-planning...');
        this.state.status = 'adapting';
        this.stats.adaptations++;

        // Re-plan with what we learned
        const adaptedTasks = await this.adaptPlan(parsedGoal, results, context);
        const adaptedResults = await this.executeTasks(adaptedTasks);

        results.push(...adaptedResults);
      }

      // PHASE 5: Synthesize final result
      const finalResult = await this.synthesizeResult(results, parsedGoal);

      // Update stats
      this.state.status = 'completed';
      this.stats.goalsCompleted++;
      this.stats.avgExecutionTime = (this.stats.avgExecutionTime * (this.stats.goalsCompleted - 1) + (Date.now() - startTime)) / this.stats.goalsCompleted;
      this.stats.successRate = this.stats.goalsCompleted / (this.stats.goalsCompleted + this.stats.goalsFailed);

      // Save to history
      await this.saveToHistory({
        goal,
        parsedGoal,
        tasks: this.state.tasks,
        completedTasks: this.state.completedTasks,
        failedTasks: this.state.failedTasks,
        result: finalResult,
        executionTime: Date.now() - startTime,
        timestamp: Date.now()
      });

      console.log(`✅ Goal completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

      return {
        success: true,
        result: finalResult,
        executionTime: Date.now() - startTime,
        tasksCompleted: this.state.completedTasks.length,
        tasksFailed: this.state.failedTasks.length
      };

    } catch (error) {
      console.error('❌ Goal execution failed:', error);

      this.state.status = 'failed';
      this.stats.goalsFailed++;

      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        tasksCompleted: this.state.completedTasks.length,
        tasksFailed: this.state.failedTasks.length
      };
    }
  }

  /**
   * Parse natural language goal into structured format
   */
  async parseGoal(goal, context) {
    const lowerGoal = goal.toLowerCase();

    // Extract intent
    let intent = 'unknown';
    if (lowerGoal.includes('itinerario') || lowerGoal.includes('planea') || lowerGoal.includes('organiza')) {
      intent = 'create_itinerary';
    } else if (lowerGoal.includes('busca') || lowerGoal.includes('encuentra') || lowerGoal.includes('recomienda')) {
      intent = 'search_and_recommend';
    } else if (lowerGoal.includes('optimiza') || lowerGoal.includes('ruta') || lowerGoal.includes('mejor camino')) {
      intent = 'optimize_route';
    } else if (lowerGoal.includes('aprende') || lowerGoal.includes('analiza')) {
      intent = 'learn_and_analyze';
    }

    // Extract entities
    const entities = {};

    // Duration (días)
    const daysMatch = lowerGoal.match(/(\d+)\s*(día|dias|day|days)/i);
    if (daysMatch) {
      entities.days = parseInt(daysMatch[1]);
    }

    // Cities
    const cities = ['tokyo', 'kyoto', 'osaka', 'hiroshima', 'nara', 'fukuoka', 'sapporo'];
    for (const city of cities) {
      if (lowerGoal.includes(city)) {
        entities.city = city;
        break;
      }
    }

    // Categories/interests
    const categories = [];
    if (lowerGoal.includes('templo')) categories.push('temples');
    if (lowerGoal.includes('comida') || lowerGoal.includes('gastronomía') || lowerGoal.includes('restaurante')) categories.push('food');
    if (lowerGoal.includes('compra') || lowerGoal.includes('shopping')) categories.push('shopping');
    if (lowerGoal.includes('parque') || lowerGoal.includes('jardín')) categories.push('parks');
    if (lowerGoal.includes('museo') || lowerGoal.includes('cultura')) categories.push('culture');
    if (lowerGoal.includes('vida nocturna') || lowerGoal.includes('nightlife')) categories.push('nightlife');

    if (categories.length > 0) {
      entities.categories = categories;
    }

    // Budget
    const budgetMatch = lowerGoal.match(/(\d+)\s*(yen|yenes|¥|\$|dolares|euros)/i);
    if (budgetMatch) {
      entities.budget = parseInt(budgetMatch[1]);
    }

    return {
      intent,
      entities,
      originalGoal: goal,
      context
    };
  }

  /**
   * 📋 TASK DECOMPOSITION
   */

  /**
   * Decompose goal into executable tasks
   */
  async decomposeTasks(parsedGoal, context) {
    const { intent, entities } = parsedGoal;
    const tasks = [];

    // Use Tree of Thoughts for complex planning if available
    if (this.modules.treeOfThoughts) {
      const reasoningResult = await this.modules.treeOfThoughts.explore(
        `¿Cómo descomponer este objetivo en tareas? Intent: ${intent}, Entities: ${JSON.stringify(entities)}`,
        context
      );

      console.log('🌳 Tree of Thoughts reasoning:', reasoningResult.reasoning);
    }

    // Generate tasks based on intent
    switch (intent) {
      case 'create_itinerary':
        tasks.push(...this.generateItineraryTasks(entities, context));
        break;

      case 'search_and_recommend':
        tasks.push(...this.generateSearchTasks(entities, context));
        break;

      case 'optimize_route':
        tasks.push(...this.generateOptimizationTasks(entities, context));
        break;

      case 'learn_and_analyze':
        tasks.push(...this.generateLearningTasks(entities, context));
        break;

      default:
        // Unknown intent - use multi-agent debate to decide
        if (this.modules.multiAgentDebate) {
          const debateResult = await this.modules.multiAgentDebate.debate(
            `¿Qué tareas debería ejecutar para este objetivo? ${parsedGoal.originalGoal}`,
            ['search', 'recommend', 'optimize', 'learn'],
            context
          );

          console.log('💬 Multi-agent debate result:', debateResult);

          // Generate generic tasks based on debate
          tasks.push({
            id: this.generateTaskId(),
            type: 'reason_about',
            params: {
              query: parsedGoal.originalGoal,
              context
            },
            priority: 1
          });
        }
    }

    return tasks;
  }

  /**
   * Generate tasks for itinerary creation
   */
  generateItineraryTasks(entities, context) {
    const tasks = [];
    const city = entities.city || 'tokyo';
    const days = entities.days || 3;
    const categories = entities.categories || ['temples', 'food'];

    // Task 1: Check weather for planning
    tasks.push({
      id: this.generateTaskId(),
      type: 'check_weather',
      params: { city },
      priority: 3,
      description: `Verificar clima en ${city}`
    });

    // Task 2: Search places for each category
    for (const category of categories) {
      tasks.push({
        id: this.generateTaskId(),
        type: 'search_places',
        params: { city, category },
        priority: 2,
        description: `Buscar ${category} en ${city}`
      });
    }

    // Task 3: Recall user preferences from memory
    tasks.push({
      id: this.generateTaskId(),
      type: 'recall_memory',
      params: {
        query: { city, categories },
        filters: { type: 'procedural' }
      },
      priority: 2,
      description: 'Recordar preferencias del usuario'
    });

    // Task 4: Optimize route (will use results from previous tasks)
    tasks.push({
      id: this.generateTaskId(),
      type: 'optimize_route',
      params: {
        places: [], // Will be filled with results from search tasks
        context: { days, city, categories }
      },
      priority: 1,
      dependencies: tasks.filter(t => t.type === 'search_places').map(t => t.id),
      description: `Optimizar ruta para ${days} días`
    });

    return tasks;
  }

  /**
   * Generate tasks for search and recommendation
   */
  generateSearchTasks(entities, context) {
    const tasks = [];
    const city = entities.city || 'tokyo';
    const categories = entities.categories || ['temples'];

    for (const category of categories) {
      tasks.push({
        id: this.generateTaskId(),
        type: 'search_places',
        params: { city, category },
        priority: 2,
        description: `Buscar ${category} en ${city}`
      });

      tasks.push({
        id: this.generateTaskId(),
        type: 'make_recommendation',
        params: {
          query: `Recomienda los mejores ${category} en ${city}`
        },
        priority: 1,
        description: `Recomendar mejores ${category}`
      });
    }

    return tasks;
  }

  /**
   * Generate tasks for route optimization
   */
  generateOptimizationTasks(entities, context) {
    const tasks = [];

    // If we have places in context, optimize them
    if (context.places && context.places.length > 0) {
      tasks.push({
        id: this.generateTaskId(),
        type: 'optimize_route',
        params: {
          places: context.places,
          context: entities
        },
        priority: 1,
        description: 'Optimizar ruta existente'
      });
    } else {
      // Need to search for places first
      tasks.push({
        id: this.generateTaskId(),
        type: 'search_places',
        params: {
          city: entities.city || 'tokyo',
          category: null // All categories
        },
        priority: 2,
        description: 'Buscar lugares para optimizar'
      });

      tasks.push({
        id: this.generateTaskId(),
        type: 'optimize_route',
        params: {
          places: [],
          context: entities
        },
        priority: 1,
        dependencies: [tasks[0].id],
        description: 'Optimizar ruta'
      });
    }

    return tasks;
  }

  /**
   * Generate tasks for learning and analysis
   */
  generateLearningTasks(entities, context) {
    const tasks = [];

    tasks.push({
      id: this.generateTaskId(),
      type: 'recall_memory',
      params: {
        query: entities,
        filters: {}
      },
      priority: 2,
      description: 'Recuperar información relevante'
    });

    tasks.push({
      id: this.generateTaskId(),
      type: 'reason_about',
      params: {
        query: `Analizar: ${JSON.stringify(entities)}`,
        context
      },
      priority: 1,
      description: 'Razonar sobre la información'
    });

    return tasks;
  }

  /**
   * ⚙️ TASK EXECUTION
   */

  /**
   * Execute all tasks
   */
  async executeTasks(tasks) {
    const results = [];

    // Sort by priority (higher first)
    const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);

    for (const task of sortedTasks) {
      // Check dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        const dependenciesMet = task.dependencies.every(depId =>
          this.state.completedTasks.some(ct => ct.id === depId)
        );

        if (!dependenciesMet) {
          console.log(`⏳ Task ${task.id} waiting for dependencies...`);
          continue;
        }

        // Fill params with results from dependencies
        task.params = this.fillTaskParams(task, results);
      }

      // Execute task
      const result = await this.executeTask(task);
      results.push(result);

      if (result.success) {
        this.state.completedTasks.push({ ...task, result: result.data });
        console.log(`✅ Task completed: ${task.description || task.type}`);
      } else {
        this.state.failedTasks.push({ ...task, error: result.error });
        console.log(`❌ Task failed: ${task.description || task.type}`);
      }
    }

    return results;
  }

  /**
   * Execute a single task
   */
  async executeTask(task) {
    const startTime = Date.now();

    console.log(`⚙️ Executing task: ${task.type}`);

    try {
      const template = this.taskTemplates[task.type];

      if (!template) {
        throw new Error(`Unknown task type: ${task.type}`);
      }

      const module = this.modules[template.executor];

      if (!module) {
        throw new Error(`Module not available: ${template.executor}`);
      }

      // Validate required params
      for (const param of template.requiredParams) {
        if (!(param in task.params)) {
          throw new Error(`Missing required parameter: ${param}`);
        }
      }

      // Execute with timeout and retries
      let retries = 0;
      let lastError = null;

      while (retries < this.config.maxRetries) {
        try {
          const result = await this.executeWithTimeout(
            module[template.method].bind(module),
            Object.values(task.params),
            this.config.timeoutPerTask
          );

          this.stats.tasksExecuted++;

          return {
            success: true,
            taskId: task.id,
            data: result,
            executionTime: Date.now() - startTime,
            retries
          };

        } catch (error) {
          lastError = error;
          retries++;
          console.log(`⚠️ Task failed, retry ${retries}/${this.config.maxRetries}`);

          if (retries < this.config.maxRetries) {
            await this.sleep(1000 * retries); // Exponential backoff
          }
        }
      }

      // All retries failed
      this.stats.tasksFailed++;
      throw lastError;

    } catch (error) {
      this.stats.tasksFailed++;

      return {
        success: false,
        taskId: task.id,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Execute function with timeout
   */
  async executeWithTimeout(fn, args, timeout) {
    return Promise.race([
      fn(...args),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Task timeout')), timeout)
      )
    ]);
  }

  /**
   * Fill task params with results from dependencies
   */
  fillTaskParams(task, results) {
    const params = { ...task.params };

    if (task.type === 'optimize_route' && params.places && params.places.length === 0) {
      // Fill places from search_places tasks
      const searchResults = results.filter(r =>
        task.dependencies.includes(r.taskId) && r.success
      );

      params.places = searchResults.flatMap(r => r.data || []);
    }

    return params;
  }

  /**
   * 🔄 ADAPTATION
   */

  /**
   * Adapt plan when tasks fail
   */
  async adaptPlan(parsedGoal, results, context) {
    console.log('🔄 Adapting plan based on failures...');

    const failedTaskTypes = this.state.failedTasks.map(t => t.type);
    const successfulResults = results.filter(r => r.success);

    // Identify what worked
    const workingModules = new Set(
      successfulResults.map(r => {
        const task = this.state.completedTasks.find(t => t.id === r.taskId);
        return task ? this.taskTemplates[task.type]?.executor : null;
      }).filter(Boolean)
    );

    console.log('✅ Working modules:', Array.from(workingModules));
    console.log('❌ Failed task types:', failedTaskTypes);

    // Generate alternative tasks that avoid failed modules
    const alternativeTasks = [];

    // If data integration failed, use reasoning instead
    if (failedTaskTypes.includes('search_places') && workingModules.has('treeOfThoughts')) {
      alternativeTasks.push({
        id: this.generateTaskId(),
        type: 'reason_about',
        params: {
          query: `Recomienda lugares en ${parsedGoal.entities.city} basándote en conocimiento previo`,
          context
        },
        priority: 2,
        description: 'Razonar sobre lugares (fallback)'
      });
    }

    // If optimization failed, use debate for manual selection
    if (failedTaskTypes.includes('optimize_route') && workingModules.has('multiAgentDebate')) {
      const places = successfulResults
        .filter(r => r.data && Array.isArray(r.data))
        .flatMap(r => r.data);

      if (places.length > 0) {
        alternativeTasks.push({
          id: this.generateTaskId(),
          type: 'debate_decision',
          params: {
            query: '¿Qué lugares priorizar en el itinerario?',
            options: places.slice(0, 10).map(p => p.name || p.id),
            context
          },
          priority: 1,
          description: 'Debatir selección de lugares (fallback)'
        });
      }
    }

    return alternativeTasks;
  }

  /**
   * 📊 RESULT SYNTHESIS
   */

  /**
   * Synthesize final result from all task results
   */
  async synthesizeResult(results, parsedGoal) {
    const successfulResults = results.filter(r => r.success);

    // Aggregate data by type
    const synthesis = {
      intent: parsedGoal.intent,
      places: [],
      routes: [],
      recommendations: [],
      insights: [],
      metadata: {
        tasksCompleted: this.state.completedTasks.length,
        tasksFailed: this.state.failedTasks.length,
        totalExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0)
      }
    };

    // Extract places from search results
    const placeResults = successfulResults.filter(r => {
      const task = this.state.completedTasks.find(t => t.id === r.taskId);
      return task?.type === 'search_places';
    });

    synthesis.places = placeResults.flatMap(r => r.data || []);

    // Extract routes from optimization results
    const routeResults = successfulResults.filter(r => {
      const task = this.state.completedTasks.find(t => t.id === r.taskId);
      return task?.type === 'optimize_route';
    });

    synthesis.routes = routeResults.map(r => r.data).filter(Boolean);

    // Extract reasoning/insights
    const reasoningResults = successfulResults.filter(r => {
      const task = this.state.completedTasks.find(t => t.id === r.taskId);
      return task?.type === 'reason_about' || task?.type === 'debate_decision';
    });

    synthesis.insights = reasoningResults.map(r => r.data).filter(Boolean);

    return synthesis;
  }

  /**
   * 🛠️ UTILITIES
   */

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 💾 PERSISTENCE
   */

  async loadHistory() {
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('autonomous_agent_history');

      if (stored) {
        this.executionHistory = stored.history || [];
        this.stats = stored.stats || this.stats;

        console.log('💾 Loaded execution history');
      }
    }
  }

  async saveToHistory(execution) {
    this.executionHistory.push(execution);

    // Keep last 100 executions
    if (this.executionHistory.length > 100) {
      this.executionHistory = this.executionHistory.slice(-100);
    }

    if (window.MLStorage) {
      await window.MLStorage.set('autonomous_agent_history', {
        history: this.executionHistory,
        stats: this.stats,
        lastUpdate: Date.now()
      });
    }
  }

  async clearHistory() {
    this.executionHistory = [];

    if (window.MLStorage) {
      await window.MLStorage.set('autonomous_agent_history', {
        history: [],
        stats: this.stats,
        lastUpdate: Date.now()
      });
    }

    console.log('🧹 History cleared');
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      historySize: this.executionHistory.length,
      currentState: this.state.status,
      activeTasks: this.state.tasks.length,
      completedTasks: this.state.completedTasks.length,
      failedTasks: this.state.failedTasks.length
    };
  }

  /**
   * Get current state
   */
  getState() {
    return {
      ...this.state,
      stats: this.getStats()
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.AutonomousAgent = new AutonomousAgent();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AutonomousAgent.initialize();
    });
  } else {
    window.AutonomousAgent.initialize();
  }

  console.log('🤖 Autonomous Agent loaded!');
}
