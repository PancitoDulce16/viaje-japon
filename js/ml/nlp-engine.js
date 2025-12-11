/**
 * 🗣️ FASE 4: NLP ENGINE - Advanced Natural Language Understanding
 * =================================================================
 *
 * Core NLP engine that powers conversational AI capabilities.
 *
 * Capabilities:
 * - Intent classification (20+ intents)
 * - Entity extraction (dates, locations, preferences)
 * - Context awareness (remember previous conversation)
 * - Multi-turn dialogue support
 * - Sentiment analysis
 * - Ambiguity resolution
 *
 * NO external APIs - 100% local processing
 */

class NLPEngine {
  constructor() {
    this.initialized = false;

    // Intent patterns (expanded from basic parser)
    this.intents = this.buildIntentPatterns();

    // Entity types we can extract
    this.entityTypes = {
      DATE: /(?:día|day)\s+(\d+)/gi,
      NUMBER: /(\d+)/g,
      CATEGORY: this.buildCategoryPattern(),
      LOCATION: /(?:en|cerca de|around)\s+(\w+)/gi,
      TIME: /(\d+)(?::(\d+))?\s*(?:am|pm|hrs?)?/gi,
      PRICE: /¥?(\d+(?:,\d{3})*)/g,
      INTENSITY: /(relajado|intenso|tranquilo|activo|moderado)/gi
    };

    // Conversation context
    this.context = {
      previousIntents: [],
      lastEntities: {},
      userPreferences: {},
      conversationHistory: [],
      currentTopic: null
    };

    // Sentiment lexicon
    this.sentimentLexicon = this.buildSentimentLexicon();

    console.log('🗣️ NLP Engine initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load user preferences from storage
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('nlp_context');
      if (stored && stored.userPreferences) {
        this.context.userPreferences = stored.userPreferences;
      }
    }

    this.initialized = true;
    console.log('✅ NLP Engine ready');
  }

  /**
   * 🎯 Main entry point - parse user input and extract meaning
   * @param {string} input - User's natural language input
   * @param {Object} context - Additional context
   * @returns {Object} Parsed result with intent, entities, sentiment
   */
  async parse(input) {
    if (!this.initialized) await this.initialize();

    const normalized = this.normalize(input);

    const result = {
      original: input,
      normalized,
      intent: await this.classifyIntent(normalized),
      entities: this.extractEntities(normalized),
      sentiment: this.analyzeSentiment(normalized),
      context: this.getRelevantContext(),
      confidence: 0,
      timestamp: Date.now()
    };

    // Calculate overall confidence
    result.confidence = this.calculateConfidence(result);

    // Update conversation context
    this.updateContext(result);

    // Save to history
    this.context.conversationHistory.push({
      input,
      result,
      timestamp: Date.now()
    });

    // Persist context
    this.saveContext();

    return result;
  }

  /**
   * 📝 Normalize text (lowercase, remove accents, etc.)
   */
  normalize(text) {
    return text
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .trim();
  }

  /**
   * 🎯 Classify user intent
   */
  async classifyIntent(text) {
    const scores = [];

    for (const [intentName, intentData] of Object.entries(this.intents)) {
      let score = 0;
      let matchedPattern = null;
      let extractedData = {};

      // Try each pattern
      for (const pattern of intentData.patterns) {
        const match = text.match(pattern);
        if (match) {
          score = 1.0; // Perfect match
          matchedPattern = pattern;
          extractedData = { match: match[0], groups: match.slice(1) };
          break;
        }
      }

      // If no exact match, try fuzzy matching with keywords
      if (score === 0 && intentData.keywords) {
        const keywordMatches = intentData.keywords.filter(kw => text.includes(kw));
        score = keywordMatches.length / intentData.keywords.length;
      }

      if (score > 0) {
        scores.push({
          intent: intentName,
          score,
          action: intentData.action,
          matchedPattern,
          extractedData,
          requiresContext: intentData.requiresContext || false
        });
      }
    }

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    // If no high-confidence intent, mark as unknown
    if (scores.length === 0 || scores[0].score < 0.3) {
      return {
        intent: 'UNKNOWN',
        score: 0,
        action: 'clarify',
        needsClarification: true
      };
    }

    // Check for ambiguity
    if (scores.length > 1 && scores[0].score - scores[1].score < 0.2) {
      return {
        ...scores[0],
        ambiguous: true,
        alternatives: scores.slice(1, 3)
      };
    }

    return scores[0];
  }

  /**
   * 📍 Extract entities from text
   */
  extractEntities(text) {
    const entities = {};

    // Extract each entity type
    for (const [type, pattern] of Object.entries(this.entityTypes)) {
      const matches = [];
      let match;

      // Reset regex
      pattern.lastIndex = 0;

      while ((match = pattern.exec(text)) !== null) {
        matches.push({
          value: match[0],
          captured: match.slice(1),
          position: match.index
        });
      }

      if (matches.length > 0) {
        entities[type] = matches.length === 1 ? matches[0] : matches;
      }
    }

    // Special handling for categories
    if (entities.CATEGORY) {
      entities.CATEGORY = this.normalizeCategoryEntity(entities.CATEGORY);
    }

    return entities;
  }

  /**
   * 😊 Analyze sentiment of user input
   */
  analyzeSentiment(text) {
    let score = 0;
    const words = text.split(/\s+/);
    let matchCount = 0;

    for (const word of words) {
      if (this.sentimentLexicon.positive.includes(word)) {
        score += 1;
        matchCount++;
      } else if (this.sentimentLexicon.negative.includes(word)) {
        score -= 1;
        matchCount++;
      }
    }

    // Normalize to -1 to 1
    const normalizedScore = matchCount > 0 ? score / matchCount : 0;

    return {
      score: normalizedScore,
      label: normalizedScore > 0.2 ? 'positive' : (normalizedScore < -0.2 ? 'negative' : 'neutral'),
      confidence: matchCount > 0 ? Math.min(matchCount / 10, 1) : 0.3
    };
  }

  /**
   * 🧠 Get relevant context from conversation history
   */
  getRelevantContext() {
    const recentHistory = this.context.conversationHistory.slice(-5);

    return {
      previousIntents: this.context.previousIntents.slice(-3),
      lastEntities: this.context.lastEntities,
      currentTopic: this.context.currentTopic,
      conversationLength: this.context.conversationHistory.length,
      recentSentiment: recentHistory.map(h => h.result?.sentiment?.label || 'neutral')
    };
  }

  /**
   * 🔄 Update conversation context
   */
  updateContext(result) {
    // Add to intent history
    this.context.previousIntents.push({
      intent: result.intent.intent || result.intent,
      timestamp: result.timestamp
    });

    // Keep only last 10 intents
    if (this.context.previousIntents.length > 10) {
      this.context.previousIntents = this.context.previousIntents.slice(-10);
    }

    // Update last entities
    this.context.lastEntities = {
      ...this.context.lastEntities,
      ...result.entities
    };

    // Update topic if intent suggests new topic
    if (result.intent.action) {
      this.context.currentTopic = result.intent.action;
    }
  }

  /**
   * 💾 Save context to storage
   */
  async saveContext() {
    if (window.MLStorage) {
      await window.MLStorage.set('nlp_context', {
        userPreferences: this.context.userPreferences,
        conversationHistory: this.context.conversationHistory.slice(-20), // Keep last 20
        timestamp: Date.now()
      });
    }
  }

  /**
   * 🎲 Calculate confidence score for parsed result
   */
  calculateConfidence(result) {
    let confidence = result.intent.score || 0;

    // Boost if we have entities
    const entityCount = Object.keys(result.entities).length;
    confidence += entityCount * 0.1;

    // Boost if sentiment is clear
    if (result.sentiment.confidence > 0.5) {
      confidence += 0.1;
    }

    // Boost if we have context
    if (this.context.conversationHistory.length > 0) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * 🏗️ Build intent patterns (20+ intents)
   */
  buildIntentPatterns() {
    return {
      // Conversational intents
      GREETING: {
        patterns: [
          // 🔥 FLEXIBLE GREETINGS - acepta variaciones emocionales
          /^ho+l[ai]+[!.]*$/i,        // holaaa, holii, holaaaa, hola!, holiii
          /^he+y+[!.]*$/i,            // hey, heyy, heyyy, hey!
          /^hi+[!.]*$/i,              // hi, hiii, hiiii, hi!
          /^hello+[!.]*$/i,           // hello, hellooo, hello!
          /^holi+[!.]*$/i,            // holi, holii, holiii
          /^que\s*tal[!.]*$/i,        // que tal, qué tal!
          /^como\s*esta[s]*[!.]*$/i,  // como estas, cómo estás!
          /^buenos\s+(?:dias|días|tardes|noches)[!.]*$/i,
          /^buenas[!.]*$/i,           // buenas, buenas!
          /^saludos[!.]*$/i,          // saludos!
          /^que\s*onda[!.]*$/i,       // qué onda!
          /^wenas[!.]*$/i,            // wenas (coloquial)
          /^ey+[!.]*$/i               // ey, eyy, eyyy
        ],
        keywords: ['hol', 'hey', 'hi', 'buenos', 'saludos', 'buenas', 'onda', 'hello'],
        action: 'greeting'
      },

      THANKS: {
        patterns: [
          // 🔥 FLEXIBLE THANKS - variaciones emocionales
          /^gra+cia+s+[!.]*$/i,           // gracias, graacias, graciaaas!
          /^mucha+s\s+gra+cia+s+[!.]*$/i, // muchas gracias, muchaaas graciaaas!
          /^than+k+s*[!.]*$/i,            // thanks, thaaanks, thankss!
          /^than+k\s*yo+u+[!.]*$/i,       // thank you, thaank youuu!
          /^te\s+agradezco+[!.]*$/i,
          /^mil\s+gra+cia+s+[!.]*$/i,     // mil gracias!
          /^ty+[!.]*$/i                    // ty, tyy (abreviación)
        ],
        keywords: ['graci', 'thank', 'agradezco'],
        action: 'acknowledge'
      },

      AFFIRMATIVE: {
        patterns: [
          // 🔥 FLEXIBLE AFFIRMATIVE - variaciones emocionales
          /^si+[!.]*$/i,                  // si, siii, siiiii!
          /^o+k+[!.]*$/i,                 // ok, okok, okkk!
          /^o+ka+y+[!.]*$/i,              // okay, okaaay, okayyy!
          /^de\s+acuerdo+[!.]*$/i,        // de acuerdo!
          /^perfecto+[!.]*$/i,            // perfecto, perfectooo!
          /^dale+[!.]*$/i,                // dale, daleee!
          /^cla+ro+[!.]*$/i,              // claro, clarooo!
          /^se+p+[!.]*$/i,                // sep, sepp!
          /^ya+[!.]*$/i,                  // ya, yaaa!
          /^yes+[!.]*$/i,                 // yes, yesss!
          /^yep+[!.]*$/i,                 // yep, yepp!
          /^exacto+[!.]*$/i,              // exacto, exactooo!
          /^correcto+[!.]*$/i             // correcto!
        ],
        keywords: ['si', 'ok', 'perfecto', 'dale', 'claro', 'yes', 'yep', 'exacto'],
        action: 'affirm'
      },

      NEGATIVE: {
        patterns: [
          // 🔥 FLEXIBLE NEGATIVE - variaciones emocionales
          /^no+[!.]*$/i,                  // no, nooo, noooo!
          /^na+h+[!.]*$/i,                // nah, naah, naaah!
          /^nope+[!.]*$/i,                // nope, nopee!
          /^para\s+nada+[!.]*$/i,         // para nada!
          /^ni\s+hablar+[!.]*$/i,         // ni hablar!
          /^nop+[!.]*$/i,                 // nop, nopp!
          /^nel+[!.]*$/i,                 // nel (coloquial)
          /^ni\s+modo+[!.]*$/i,           // ni modo!
          /^tampoco+[!.]*$/i,             // tampoco!
          /^nunca+[!.]*$/i,               // nunca!
          /^jamas+[!.]*$/i                // jamás!
        ],
        keywords: ['no', 'nah', 'nope', 'nel', 'tampoco', 'nunca'],
        action: 'deny'
      },

      FAREWELL: {
        patterns: [
          // 🔥 FLEXIBLE FAREWELL - variaciones emocionales
          /^adio+s+[!.]*$/i,              // adios, adioooos, adiós!
          /^cha+o+[!.]*$/i,               // chao, chaaao, chaoooo!
          /^hasta\s+luego+[!.]*$/i,       // hasta luego!
          /^nos\s+vemo+s+[!.]*$/i,        // nos vemos, nos vemoooos!
          /^by+e+[!.]*$/i,                // bye, byeee, byyyy!
          /^see\s*ya+[!.]*$/i,            // see ya, see yaaaa!
          /^hasta\s+pronto+[!.]*$/i,      // hasta pronto!
          /^me\s+vo+y+[!.]*$/i,           // me voy, me voyyyy!
          /^sayonara+[!.]*$/i,            // sayonara!
          /^mata\s*ne+[!.]*$/i            // mata ne! (japonés)
        ],
        keywords: ['adio', 'chao', 'bye', 'hasta', 'vemo', 'sayonara', 'mata'],
        action: 'farewell'
      },

      // Modification intents
      ADD_ACTIVITY: {
        patterns: [
          /agrega?(?:\s+más)?\s+(\w+)/i,
          /añad[ei](?:\s+más)?\s+(\w+)/i,
          /incluye?(?:\s+más)?\s+(\w+)/i,
          /quiero\s+(?:más\s+)?(\w+)/i
        ],
        keywords: ['agregar', 'añadir', 'incluir', 'mas'],
        action: 'addActivity'
      },

      REMOVE_ACTIVITY: {
        patterns: [
          /quit[ae]\s+(\w+)/i,
          /elimin[ae]\s+(\w+)/i,
          /no\s+quiero\s+(\w+)/i,
          /sac[ae]\s+(\w+)/i
        ],
        keywords: ['quitar', 'eliminar', 'sacar', 'borrar'],
        action: 'removeActivity'
      },

      CHANGE_BUDGET: {
        patterns: [
          /(?:haz|pon|ajusta)(?:lo)?\s+más\s+(barato|económico|caro)/i,
          /reduce\s+(?:el\s+)?(?:precio|presupuesto|gasto)/i,
          /(?:quiero|necesito)\s+algo\s+más\s+(barato|económico)/i
        ],
        keywords: ['barato', 'económico', 'presupuesto', 'precio'],
        action: 'adjustBudget'
      },

      CHANGE_PACE: {
        patterns: [
          /haz(?:lo)?\s+más\s+(relajado|intenso|tranquilo|activo)/i,
          /quiero\s+algo\s+(relajado|intenso|tranquilo)/i,
          /menos\s+(?:caminar|caminata|actividades)/i
        ],
        keywords: ['relajado', 'intenso', 'tranquilo', 'activo'],
        action: 'changePace'
      },

      OPTIMIZE_ROUTE: {
        patterns: [
          /optimiza?\s+(?:las?\s+)?ruta[s]?/i,
          /mejora\s+(?:el\s+)?orden/i,
          /reorganiza/i,
          /reduce\s+(?:el\s+)?tiempo\s+de\s+viaje/i
        ],
        keywords: ['optimizar', 'mejorar', 'reorganizar', 'ruta'],
        action: 'optimizeRoute'
      },

      REGENERATE_DAY: {
        patterns: [
          /regenera\s+(?:el\s+)?día\s+(\d+)/i,
          /vuelve\s+a\s+hacer\s+(?:el\s+)?día\s+(\d+)/i,
          /no\s+me\s+gusta\s+(?:el\s+)?día\s+(\d+)/i
        ],
        keywords: ['regenerar', 'rehacer', 'cambiar'],
        action: 'regenerateDay'
      },

      EXPLAIN: {
        patterns: [
          /explica(?:me)?\s+(?:el\s+)?día\s+(\d+)/i,
          /qué\s+(?:voy\s+a\s+)?hacer\s+(?:el\s+)?día\s+(\d+)/i,
          /cuéntame\s+(?:sobre|del)\s+día\s+(\d+)/i,
          /por\s+qué\s+(?:elegiste|pusiste)/i
        ],
        keywords: ['explicar', 'contar', 'por qué', 'razón'],
        action: 'explain'
      },

      GET_RECOMMENDATIONS: {
        patterns: [
          /recomienda(?:me)?\s+algo/i,
          /qué\s+me\s+recomiendas/i,
          /suger[ei]ncias?/i,
          /qué\s+(?:más|otra cosa)\s+puedo\s+(?:hacer|ver)/i
        ],
        keywords: ['recomendar', 'sugerir', 'qué hacer'],
        action: 'recommend'
      },

      HELP: {
        patterns: [
          /ayuda/i,
          /no\s+sé\s+(?:qué|cómo)/i,
          /cómo\s+(?:funciona|uso)/i,
          /qué\s+puedes\s+hacer/i
        ],
        keywords: ['ayuda', 'help', 'cómo'],
        action: 'showHelp'
      },

      SAVE_PREFERENCE: {
        patterns: [
          /(?:me|a\s+mí)\s+gusta\s+(\w+)/i,
          /prefiero\s+(\w+)/i,
          /(?:no\s+)?me\s+interesa\s+(\w+)/i
        ],
        keywords: ['gusta', 'prefiero', 'interesa'],
        action: 'savePreference',
        requiresContext: true
      },

      COMPARE: {
        patterns: [
          /compara\s+(\w+)\s+(?:con|y|vs)\s+(\w+)/i,
          /(?:cuál|qué)\s+es\s+mejor/i,
          /diferencia\s+entre/i
        ],
        keywords: ['comparar', 'mejor', 'diferencia'],
        action: 'compare'
      },

      FIND_ALTERNATIVE: {
        patterns: [
          /(?:hay|existe)\s+(?:algo|alguna)\s+alternativa/i,
          /en\s+vez\s+de\s+(\w+)/i,
          /otro\s+(\w+)/i,
          /algo\s+similar\s+a/i
        ],
        keywords: ['alternativa', 'otro', 'similar', 'diferente'],
        action: 'findAlternative'
      },

      CHECK_WEATHER: {
        patterns: [
          /(?:cómo|cuál)\s+(?:está|estará)\s+el\s+clima/i,
          /va\s+a\s+llover/i,
          /tiempo\s+(?:para|el\s+día)/i
        ],
        keywords: ['clima', 'tiempo', 'lluvia', 'weather'],
        action: 'checkWeather'
      },

      GET_STATS: {
        patterns: [
          /cuánto\s+(?:voy\s+a\s+)?(?:caminar|gastar|tiempo)/i,
          /distancia\s+total/i,
          /presupuesto\s+total/i,
          /resumen/i
        ],
        keywords: ['cuánto', 'total', 'resumen', 'estadísticas'],
        action: 'getStats'
      },

      EXPRESS_CONCERN: {
        patterns: [
          /(?:estoy|me\s+siento)\s+(?:preocupado|cansado|agobiado)/i,
          /(?:es|parece)\s+demasiado/i,
          /no\s+(?:puedo|podré)/i
        ],
        keywords: ['preocupado', 'cansado', 'demasiado', 'mucho'],
        action: 'addressConcern',
        requiresContext: true
      },

      CONFIRM: {
        patterns: [
          /(?:sí|si|yes|ok|vale|perfecto|exacto)/i,
          /estoy\s+de\s+acuerdo/i,
          /eso\s+está\s+bien/i
        ],
        keywords: ['sí', 'si', 'yes', 'ok', 'vale'],
        action: 'confirm',
        requiresContext: true
      },

      DENY: {
        patterns: [
          /no(?:\s+gracias)?/i,
          /(?:no\s+)?me\s+gusta/i,
          /mejor\s+no/i
        ],
        keywords: ['no', 'nope', 'mejor no'],
        action: 'deny',
        requiresContext: true
      },

      THANK: {
        patterns: [
          /gracias/i,
          /muchas\s+gracias/i,
          /te\s+agradezco/i,
          /thanks/i
        ],
        keywords: ['gracias', 'thanks', 'agradezco'],
        action: 'acknowledge'
      },

      COMPLIMENT: {
        patterns: [
          /(?:muy\s+)?(?:bien|bueno|genial|excelente|perfecto)/i,
          /me\s+encanta/i,
          /qué\s+(?:bien|bueno|genial)/i
        ],
        keywords: ['bien', 'genial', 'excelente', 'perfecto', 'encanta'],
        action: 'acknowledge'
      },

      COMPLAINT: {
        patterns: [
          /(?:no\s+)?(?:me\s+gusta|funciona)/i,
          /(?:está|es)\s+(?:mal|malo)/i,
          /(?:esto|eso)\s+no\s+(?:sirve|funciona)/i
        ],
        keywords: ['mal', 'malo', 'no funciona', 'no sirve'],
        action: 'handleComplaint',
        requiresContext: true
      }
    };
  }

  /**
   * 🏷️ Build category pattern
   */
  buildCategoryPattern() {
    const categories = {
      'templo(s)?': 'temple',
      'santuario(s)?': 'shrine',
      'museo(s)?': 'museum',
      'parque(s)?': 'park',
      'jardín|jardines': 'garden',
      'tienda(s)?|compra(s)?|shopping': 'shopping',
      'restaurante(s)?|comida': 'restaurant',
      'mercado(s)?': 'market',
      'castillo(s)?': 'castle',
      'onsen': 'onsen',
      'naturaleza': 'nature',
      'nocturna|nightlife': 'nightlife'
    };

    const pattern = Object.keys(categories).join('|');
    return new RegExp(`\\b(${pattern})\\b`, 'gi');
  }

  /**
   * 🏷️ Normalize category entity
   */
  normalizeCategoryEntity(entity) {
    const mapping = {
      'templo': 'temple',
      'templos': 'temple',
      'santuario': 'shrine',
      'santuarios': 'shrine',
      'museo': 'museum',
      'museos': 'museum',
      'parque': 'park',
      'parques': 'park',
      'jardín': 'garden',
      'jardines': 'garden',
      'tienda': 'shopping',
      'tiendas': 'shopping',
      'compras': 'shopping',
      'shopping': 'shopping',
      'restaurante': 'restaurant',
      'restaurantes': 'restaurant',
      'comida': 'restaurant',
      'mercado': 'market',
      'mercados': 'market',
      'castillo': 'castle',
      'castillos': 'castle',
      'onsen': 'onsen',
      'naturaleza': 'nature',
      'nocturna': 'nightlife',
      'nightlife': 'nightlife'
    };

    const value = entity.value || entity;
    return mapping[value.toLowerCase()] || value;
  }

  /**
   * 😊 Build sentiment lexicon
   */
  buildSentimentLexicon() {
    return {
      positive: [
        'bueno', 'bien', 'genial', 'excelente', 'perfecto', 'encanta', 'gusta',
        'maravilloso', 'fantástico', 'increíble', 'hermoso', 'precioso',
        'me agrada', 'amo', 'feliz', 'contento', 'satisfecho', 'alegre',
        'good', 'great', 'excellent', 'perfect', 'love', 'like', 'happy'
      ],
      negative: [
        'malo', 'mal', 'horrible', 'terrible', 'pésimo', 'no gusta',
        'odio', 'detesto', 'aburrido', 'cansado', 'triste', 'molesto',
        'frustrante', 'difícil', 'complicado', 'confuso', 'preocupado',
        'bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'angry'
      ]
    };
  }

  /**
   * 🧹 Clear conversation context
   */
  clearContext() {
    this.context = {
      previousIntents: [],
      lastEntities: {},
      userPreferences: this.context.userPreferences, // Keep preferences
      conversationHistory: [],
      currentTopic: null
    };

    this.saveContext();
  }

  /**
   * 📊 Get conversation statistics
   */
  getStats() {
    return {
      conversationLength: this.context.conversationHistory.length,
      uniqueIntents: new Set(this.context.previousIntents.map(p => p.intent)).size,
      averageSentiment: this.context.conversationHistory.reduce((sum, h) => {
        return sum + (h.result?.sentiment?.score || 0);
      }, 0) / Math.max(this.context.conversationHistory.length, 1),
      currentTopic: this.context.currentTopic,
      userPreferences: Object.keys(this.context.userPreferences).length
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.NLPEngine = new NLPEngine();

  // Auto-initialize (check if DOM already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.NLPEngine.initialize().catch(e => {
        console.error('Failed to initialize NLP Engine:', e);
      });
    });
  } else {
    // DOM already loaded, initialize immediately
    window.NLPEngine.initialize().catch(e => {
      console.error('Failed to initialize NLP Engine:', e);
    });
  }

  console.log('🗣️ NLP Engine loaded!');
}
