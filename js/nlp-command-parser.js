/**
 * 🗣️ NLP COMMAND PARSER
 * ======================
 *
 * Parser de lenguaje natural para comandos del usuario.
 *
 * Permite al usuario dar órdenes en español como:
 * - "Agrega más templos al día 3"
 * - "Quita restaurantes del día 2"
 * - "Haz el día 4 más relajado"
 * - "Optimiza las rutas del día 1"
 * - "Cambia el orden de las actividades"
 *
 * Técnicas usadas:
 * - Tokenización y normalización
 * - Pattern matching con regex
 * - Entity recognition (números, categorías, acciones)
 * - Intent classification
 *
 * 100% local - no usa APIs externas.
 */

class NLPCommandParser {
  constructor() {
    // Intents (intenciones) que el parser puede reconocer
    this.intents = {
      ADD_ACTIVITY: {
        patterns: [
          /agrega?\s+(más\s+)?(\w+)/i,
          /añad[ei]\s+(más\s+)?(\w+)/i,
          /incluye?\s+(más\s+)?(\w+)/i,
          /pon\s+(más\s+)?(\w+)/i
        ],
        action: 'addActivity'
      },
      REMOVE_ACTIVITY: {
        patterns: [
          /quit[ae]\s+(\w+)/i,
          /elimin[ae]\s+(\w+)/i,
          /borra\s+(\w+)/i,
          /sac[ae]\s+(\w+)/i,
          /remueve\s+(\w+)/i
        ],
        action: 'removeActivity'
      },
      CHANGE_PACE: {
        patterns: [
          /haz\s+(?:el\s+)?día\s+(\d+)\s+más\s+(relajado|intenso|ligero|pesado)/i,
          /cambia\s+(?:el\s+)?día\s+(\d+)\s+a\s+(relajado|intenso|ligero|pesado)/i,
          /(?:el\s+)?día\s+(\d+)\s+(?:que\s+sea|debe\s+ser)\s+(más\s+)?(relajado|intenso)/i
        ],
        action: 'changePace'
      },
      OPTIMIZE_ROUTE: {
        patterns: [
          /optimiza?\s+(?:las?\s+)?ruta[s]?\s+(?:del?\s+)?día\s+(\d+)/i,
          /mejora\s+(?:el\s+)?orden\s+(?:del?\s+)?día\s+(\d+)/i,
          /reorganiza\s+(?:el\s+)?día\s+(\d+)/i,
          /ordena\s+mejor\s+(?:el\s+)?día\s+(\d+)/i
        ],
        action: 'optimizeRoute'
      },
      CHANGE_ORDER: {
        patterns: [
          /cambia\s+(?:el\s+)?orden\s+(?:de\s+las\s+actividades)?/i,
          /reordena\s+(?:las\s+)?actividades/i,
          /mueve\s+(\w+)\s+(?:al\s+)?(?:inicio|final|principio)/i
        ],
        action: 'changeOrder'
      },
      ADD_REST_DAY: {
        patterns: [
          /agrega\s+(?:un\s+)?día\s+de\s+descanso/i,
          /añade\s+(?:un\s+)?día\s+libre/i,
          /inserta\s+(?:un\s+)?día\s+de\s+descanso/i,
          /necesito\s+(?:un\s+)?día\s+para\s+descansar/i
        ],
        action: 'addRestDay'
      },
      REGENERATE_DAY: {
        patterns: [
          /regenera\s+(?:el\s+)?día\s+(\d+)/i,
          /vuelve\s+a\s+hacer\s+(?:el\s+)?día\s+(\d+)/i,
          /rehacer?\s+(?:el\s+)?día\s+(\d+)/i,
          /cambia\s+(?:todo\s+)?(?:el\s+)?día\s+(\d+)/i
        ],
        action: 'regenerateDay'
      },
      FILTER_CATEGORY: {
        patterns: [
          /(?:solo|solamente|únicamente)\s+(\w+)/i,
          /filtra\s+(?:por\s+)?(\w+)/i,
          /muestra\s+(?:solo|únicamente)\s+(\w+)/i
        ],
        action: 'filterCategory'
      },
      SET_BUDGET: {
        patterns: [
          /(?:establece|pon|ajusta)\s+(?:el\s+)?presupuesto\s+(?:en|a|de)\s+(\d+)/i,
          /(?:el\s+)?presupuesto\s+(?:debe\s+ser|es)\s+(?:de\s+)?(\d+)/i,
          /no\s+quiero\s+gastar\s+más\s+de\s+(\d+)/i
        ],
        action: 'setBudget'
      },
      GET_RECOMMENDATIONS: {
        patterns: [
          /recomienda\s+algo/i,
          /qué\s+me\s+recomiendas?/i,
          /suger[ei]ncias?/i,
          /qué\s+más\s+puedo\s+hacer/i
        ],
        action: 'getRecommendations'
      },
      EXPLAIN: {
        patterns: [
          /explica\s+(?:el\s+)?día\s+(\d+)/i,
          /qué\s+voy\s+a\s+hacer\s+(?:el\s+)?día\s+(\d+)/i,
          /cuéntame\s+(?:sobre|del)\s+día\s+(\d+)/i,
          /detalles?\s+(?:del?\s+)?día\s+(\d+)/i
        ],
        action: 'explainDay'
      }
    };

    // Categorías reconocidas
    this.categories = {
      templos: 'temple',
      templo: 'temple',
      santuarios: 'shrine',
      santuario: 'shrine',
      museos: 'museum',
      museo: 'museum',
      parques: 'park',
      parque: 'park',
      jardines: 'garden',
      jardín: 'garden',
      tiendas: 'shopping',
      compras: 'shopping',
      shopping: 'shopping',
      restaurantes: 'restaurant',
      restaurante: 'restaurant',
      comida: 'restaurant',
      mercados: 'market',
      mercado: 'market',
      miradores: 'viewpoint',
      mirador: 'viewpoint',
      castillos: 'castle',
      castillo: 'castle',
      onsen: 'onsen',
      naturaleza: 'nature',
      entretenimiento: 'entertainment'
    };

    // Modificadores de intensidad
    this.paceModifiers = {
      relajado: 'relaxed',
      ligero: 'relaxed',
      tranquilo: 'relaxed',
      suave: 'relaxed',
      intenso: 'intense',
      pesado: 'intense',
      activo: 'intense',
      extremo: 'extreme'
    };

    console.log('🗣️ NLP Command Parser initialized');
  }

  /**
   * 🎯 Parsea un comando en lenguaje natural
   * @param {string} command - Comando del usuario
   * @returns {Object} Comando parseado con intent, entities y confianza
   */
  parse(command) {
    console.log('🗣️ Parsing command:', command);

    // Normalizar comando
    const normalized = this.normalize(command);

    // Intentar reconocer intent
    const intent = this.recognizeIntent(normalized);

    if (!intent) {
      return {
        success: false,
        error: 'No pude entender el comando',
        suggestion: 'Intenta comandos como "Agrega más templos al día 3" o "Optimiza las rutas del día 1"'
      };
    }

    // Extraer entidades
    const entities = this.extractEntities(normalized, intent);

    // Construir comando parseado
    const parsedCommand = {
      success: true,
      intent: intent.action,
      entities,
      originalCommand: command,
      confidence: this.calculateConfidence(intent, entities)
    };

    console.log('✅ Parsed:', parsedCommand);

    return parsedCommand;
  }

  /**
   * 🔧 Normaliza el comando
   */
  normalize(command) {
    return command
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Múltiples espacios a uno
      .replace(/[¿?!¡]/g, ''); // Remover signos de interrogación/exclamación
  }

  /**
   * 🎯 Reconoce el intent del comando
   */
  recognizeIntent(command) {
    for (const [intentName, intentData] of Object.entries(this.intents)) {
      for (const pattern of intentData.patterns) {
        if (pattern.test(command)) {
          return {
            name: intentName,
            action: intentData.action,
            pattern
          };
        }
      }
    }

    return null;
  }

  /**
   * 🏷️ Extrae entidades del comando
   */
  extractEntities(command, intent) {
    const entities = {};

    // Extraer números (días)
    const dayMatch = command.match(/día\s+(\d+)/i);
    if (dayMatch) {
      entities.dayNumber = parseInt(dayMatch[1]);
    }

    // Extraer categorías
    for (const [keyword, category] of Object.entries(this.categories)) {
      if (command.includes(keyword)) {
        entities.category = category;
        entities.categoryKeyword = keyword;
        break;
      }
    }

    // Extraer modificadores de ritmo
    for (const [keyword, pace] of Object.entries(this.paceModifiers)) {
      if (command.includes(keyword)) {
        entities.pace = pace;
        entities.paceKeyword = keyword;
        break;
      }
    }

    // Extraer números (presupuesto, cantidad)
    const numberMatch = command.match(/(\d+)/);
    if (numberMatch && !entities.dayNumber) {
      entities.number = parseInt(numberMatch[1]);
    }

    // Extraer posición (inicio, final)
    if (/inicio|principio|comienzo/i.test(command)) {
      entities.position = 'start';
    } else if (/final|fin|último/i.test(command)) {
      entities.position = 'end';
    }

    // Extraer más/menos
    if (/más/i.test(command)) {
      entities.modifier = 'more';
    } else if (/menos/i.test(command)) {
      entities.modifier = 'less';
    }

    return entities;
  }

  /**
   * 📊 Calcula confianza del parsing
   */
  calculateConfidence(intent, entities) {
    let confidence = 0.6; // Base confidence

    // Boost si reconocimos el intent
    if (intent) confidence += 0.2;

    // Boost por entidades encontradas
    const entityCount = Object.keys(entities).length;
    confidence += Math.min(0.2, entityCount * 0.05);

    return Math.min(1.0, confidence);
  }

  /**
   * ⚡ Ejecuta el comando parseado
   * @param {Object} parsedCommand - Comando parseado
   * @param {Object} context - Contexto (itinerario, etc.)
   * @returns {Object} Resultado de la ejecución
   */
  async execute(parsedCommand, context) {
    if (!parsedCommand.success) {
      return {
        success: false,
        error: parsedCommand.error
      };
    }

    const { intent, entities } = parsedCommand;

    try {
      switch (intent) {
        case 'addActivity':
          return await this.executeAddActivity(entities, context);

        case 'removeActivity':
          return await this.executeRemoveActivity(entities, context);

        case 'changePace':
          return await this.executeChangePace(entities, context);

        case 'optimizeRoute':
          return await this.executeOptimizeRoute(entities, context);

        case 'changeOrder':
          return await this.executeChangeOrder(entities, context);

        case 'addRestDay':
          return await this.executeAddRestDay(entities, context);

        case 'regenerateDay':
          return await this.executeRegenerateDay(entities, context);

        case 'filterCategory':
          return await this.executeFilterCategory(entities, context);

        case 'setBudget':
          return await this.executeSetBudget(entities, context);

        case 'getRecommendations':
          return await this.executeGetRecommendations(entities, context);

        case 'explainDay':
          return await this.executeExplainDay(entities, context);

        default:
          return {
            success: false,
            error: 'Intent no implementado: ' + intent
          };
      }
    } catch (error) {
      console.error('Error executing command:', error);
      return {
        success: false,
        error: 'Error ejecutando el comando: ' + error.message
      };
    }
  }

  // ========== EJECUTORES DE COMANDOS ==========

  async executeAddActivity(entities, context) {
    const { category, dayNumber } = entities;
    const { itinerary } = context;

    if (!category) {
      return {
        success: false,
        error: 'No pude identificar qué tipo de actividad agregar'
      };
    }

    if (dayNumber && dayNumber > itinerary.days.length) {
      return {
        success: false,
        error: `El día ${dayNumber} no existe en el itinerario`
      };
    }

    // Aquí se integraría con el generador de itinerarios
    return {
      success: true,
      action: 'addActivity',
      message: `Agregando actividades de categoría "${category}"${dayNumber ? ` al día ${dayNumber}` : ''}...`,
      params: { category, dayNumber }
    };
  }

  async executeRemoveActivity(entities, context) {
    const { category, dayNumber } = entities;

    return {
      success: true,
      action: 'removeActivity',
      message: `Eliminando actividades de categoría "${category}"${dayNumber ? ` del día ${dayNumber}` : ''}...`,
      params: { category, dayNumber }
    };
  }

  async executeChangePace(entities, context) {
    const { dayNumber, pace } = entities;

    if (!dayNumber) {
      return {
        success: false,
        error: 'Necesito saber qué día modificar'
      };
    }

    return {
      success: true,
      action: 'changePace',
      message: `Cambiando el día ${dayNumber} a ritmo ${pace}...`,
      params: { dayNumber, pace }
    };
  }

  async executeOptimizeRoute(entities, context) {
    const { dayNumber } = entities;

    if (!dayNumber) {
      return {
        success: false,
        error: 'Necesito saber qué día optimizar'
      };
    }

    return {
      success: true,
      action: 'optimizeRoute',
      message: `Optimizando rutas del día ${dayNumber}...`,
      params: { dayNumber }
    };
  }

  async executeChangeOrder(entities, context) {
    const { position, category } = entities;

    return {
      success: true,
      action: 'changeOrder',
      message: 'Reordenando actividades...',
      params: { position, category }
    };
  }

  async executeAddRestDay(entities, context) {
    return {
      success: true,
      action: 'addRestDay',
      message: 'Agregando día de descanso...',
      params: {}
    };
  }

  async executeRegenerateDay(entities, context) {
    const { dayNumber } = entities;

    if (!dayNumber) {
      return {
        success: false,
        error: 'Necesito saber qué día regenerar'
      };
    }

    return {
      success: true,
      action: 'regenerateDay',
      message: `Regenerando día ${dayNumber}...`,
      params: { dayNumber }
    };
  }

  async executeFilterCategory(entities, context) {
    const { category } = entities;

    return {
      success: true,
      action: 'filterCategory',
      message: `Filtrando por categoría: ${category}`,
      params: { category }
    };
  }

  async executeSetBudget(entities, context) {
    const { number } = entities;

    if (!number) {
      return {
        success: false,
        error: 'Necesito saber el presupuesto'
      };
    }

    return {
      success: true,
      action: 'setBudget',
      message: `Ajustando presupuesto a ¥${number}...`,
      params: { budget: number }
    };
  }

  async executeGetRecommendations(entities, context) {
    return {
      success: true,
      action: 'getRecommendations',
      message: 'Generando recomendaciones...',
      params: {}
    };
  }

  async executeExplainDay(entities, context) {
    const { dayNumber } = entities;

    if (!dayNumber) {
      return {
        success: false,
        error: 'Necesito saber qué día explicar'
      };
    }

    return {
      success: true,
      action: 'explainDay',
      message: `Generando explicación del día ${dayNumber}...`,
      params: { dayNumber }
    };
  }

  /**
   * 🎨 Renderiza interfaz de comandos de voz/texto
   */
  renderCommandInterface(containerId, onCommand) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const html = `
      <div class="nlp-command-interface bg-white dark:bg-gray-800 rounded-xl border-2 border-purple-200 dark:border-purple-700 p-6">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-4">
          <div class="text-3xl">🗣️</div>
          <div>
            <h3 class="text-xl font-bold">Comandos en Lenguaje Natural</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Dime qué quieres hacer con tu itinerario</p>
          </div>
        </div>

        <!-- Input -->
        <div class="relative mb-4">
          <input
            type="text"
            id="nlpCommandInput"
            placeholder='Ej: "Agrega más templos al día 3" o "Optimiza las rutas del día 1"'
            class="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-purple-500 focus:outline-none"
          />
          <button
            id="nlpSubmitBtn"
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Enviar
          </button>
        </div>

        <!-- Ejemplos -->
        <div class="mb-4">
          <div class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Ejemplos:</div>
          <div class="flex flex-wrap gap-2">
            <button class="example-btn text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition">
              Agrega más templos al día 2
            </button>
            <button class="example-btn text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition">
              Haz el día 3 más relajado
            </button>
            <button class="example-btn text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition">
              Optimiza las rutas del día 1
            </button>
            <button class="example-btn text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition">
              Quita restaurantes del día 4
            </button>
            <button class="example-btn text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition">
              Regenera el día 2
            </button>
          </div>
        </div>

        <!-- Output -->
        <div id="nlpCommandOutput" class="hidden"></div>
      </div>
    `;

    container.innerHTML = html;

    // Event listeners
    const input = document.getElementById('nlpCommandInput');
    const submitBtn = document.getElementById('nlpSubmitBtn');
    const output = document.getElementById('nlpCommandOutput');
    const exampleBtns = container.querySelectorAll('.example-btn');

    const handleCommand = () => {
      const command = input.value.trim();
      if (!command) return;

      const parsed = this.parse(command);

      // Mostrar resultado
      this.displayResult(output, parsed);

      // Callback
      if (onCommand && parsed.success) {
        onCommand(parsed);
      }

      input.value = '';
    };

    submitBtn.onclick = handleCommand;
    input.onkeypress = (e) => {
      if (e.key === 'Enter') handleCommand();
    };

    // Ejemplos clickeables
    exampleBtns.forEach(btn => {
      btn.onclick = () => {
        input.value = btn.textContent;
        handleCommand();
      };
    });
  }

  /**
   * 🎨 Muestra resultado del parsing
   */
  displayResult(container, parsed) {
    container.classList.remove('hidden');

    if (parsed.success) {
      container.innerHTML = `
        <div class="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
          <div class="flex items-start gap-3">
            <div class="text-2xl">✅</div>
            <div class="flex-1">
              <div class="font-semibold text-green-800 dark:text-green-200">Comando entendido</div>
              <div class="text-sm text-green-700 dark:text-green-300 mt-1">
                <strong>Acción:</strong> ${parsed.intent}<br>
                <strong>Confianza:</strong> ${Math.round(parsed.confidence * 100)}%
                ${Object.keys(parsed.entities).length > 0 ? `<br><strong>Parámetros:</strong> ${JSON.stringify(parsed.entities)}` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
          <div class="flex items-start gap-3">
            <div class="text-2xl">❌</div>
            <div class="flex-1">
              <div class="font-semibold text-red-800 dark:text-red-200">No entendí el comando</div>
              <div class="text-sm text-red-700 dark:text-red-300 mt-1">
                ${parsed.error || 'Error desconocido'}
                ${parsed.suggestion ? `<br><br><em>${parsed.suggestion}</em>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.NLPCommandParser = new NLPCommandParser();
}

export default NLPCommandParser;
