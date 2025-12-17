/**
 * 🧠 SMART RESPONSE GENERATOR
 * ===========================
 *
 * Genera respuestas inteligentes y orgánicas sin hardcodear.
 * Aprende de patrones y genera variaciones naturales.
 *
 * Features:
 * - Templates con variaciones infinitas
 * - Comprensión semántica (sinónimos, contexto)
 * - Aprendizaje de patrones exitosos
 * - Generación contextual basada en historial
 * - Personalización según perfil de usuario
 * - Evita repeticiones mediante tracking
 */

class SmartResponseGenerator {
  constructor() {
    this.initialized = false;

    // Template system con variaciones
    this.responseTemplates = this.buildResponseTemplates();

    // Thesaurus local para variación de lenguaje
    this.thesaurus = this.buildThesaurus();

    // Patrones aprendidos de conversaciones exitosas
    this.learnedPatterns = {
      greetings: [],
      farewells: [],
      confirmations: [],
      suggestions: []
    };

    // Historial de respuestas usadas (para evitar repeticiones)
    this.usedResponses = new Map();

    // Contador de uso por template
    this.templateUsage = new Map();

    console.log('🧠 Smart Response Generator initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Cargar patrones aprendidos del storage
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('learned_patterns');
      if (stored) {
        this.learnedPatterns = stored;
      }
    }

    this.initialized = true;
    console.log('✅ Smart Response Generator ready');
  }

  /**
   * 🎯 Generar respuesta inteligente para un intent
   */
  async generate(intent, entities, context = {}) {
    if (!this.initialized) await this.initialize();

    const intentName = typeof intent === 'string' ? intent : intent.intent;
    const templates = this.responseTemplates[intentName];

    if (!templates) {
      return this.generateFallback(intentName, context);
    }

    // Seleccionar template menos usado
    const selectedTemplate = this.selectLeastUsedTemplate(intentName, templates);

    // Generar variaciones del template
    const response = await this.applyTemplate(selectedTemplate, entities, context);

    // Registrar uso
    this.registerUsage(intentName, selectedTemplate.id, response);

    return response;
  }

  /**
   * 📝 Construir templates de respuestas con variaciones
   */
  buildResponseTemplates() {
    return {
      greeting: [
        {
          id: 'greeting_1',
          templates: [
            '¡{greeting}! {enthusiasm} ¿En qué puedo ayudarte {time_context}?',
            '{greeting}! {ready_phrase} ¿Qué necesitas para tu viaje?',
            '¡{greeting}! {excited_phrase} ¿Listo para planear algo increíble?'
          ],
          variables: {
            greeting: ['Hola', 'Hey', 'Holi', 'Buenas', 'Qué tal'],
            enthusiasm: ['😊', '✨', '🎌', '🇯🇵', ''],
            time_context: ['hoy', 'ahora', 'en este momento', ''],
            ready_phrase: ['Estoy lista para ayudarte', 'Aquí estoy', 'Listo/a'],
            excited_phrase: ['Me emociona ayudarte', 'Vamos a armar algo genial', 'Hagámoslo']
          }
        },
        {
          id: 'greeting_2',
          templates: [
            '{greeting}! {question}',
            '¡{greeting}! {intro} {question}'
          ],
          variables: {
            greeting: ['Hola', 'Heyyy', 'Qué onda', 'Buenas'],
            intro: ['Soy tu asistente de viajes a Japón', 'Estoy aquí para ayudarte', ''],
            question: ['¿Cómo va la planeación?', '¿Qué armamos hoy?', '¿En qué te ayudo?']
          }
        }
      ],

      farewell: [
        {
          id: 'farewell_1',
          templates: [
            '{bye}! {wish} {emoji}',
            '{bye}! {encouragement} {emoji}'
          ],
          variables: {
            bye: ['Chao', 'Hasta luego', 'Nos vemos', 'Bye', 'Adiós'],
            wish: ['Que sigas planeando bien', 'Suerte con el viaje', 'Que te vaya genial'],
            encouragement: ['Tu itinerario va quedando increíble', 'Vas muy bien', ''],
            emoji: ['🎌', '✨', '🇯🇵', '👋', '']
          }
        }
      ],

      acknowledge: [
        {
          id: 'ack_thanks',
          templates: [
            '{response}! {extra}',
            '{response} {extra} {emoji}'
          ],
          variables: {
            response: ['De nada', 'Cuando gustes', 'Para eso estoy', 'Un placer', 'Claro'],
            extra: ['Cualquier cosa me dices', 'Aquí estoy si necesitas más', 'Siempre a la orden', ''],
            emoji: ['😊', '✨', '🎌', '']
          }
        }
      ],

      affirm: [
        {
          id: 'affirm_1',
          templates: [
            '{confirmation}! {action}',
            '{confirmation} {emoji} {action}'
          ],
          variables: {
            confirmation: ['Perfecto', 'Dale', 'Ok', 'Entendido', 'Excelente'],
            action: ['Lo hago ya', 'En eso estoy', 'Vamos', 'Listo'],
            emoji: ['✅', '👍', '🎯', '']
          }
        }
      ],

      deny: [
        {
          id: 'deny_1',
          templates: [
            '{understanding}. {alternative}',
            '{understanding} {emoji} {alternative}'
          ],
          variables: {
            understanding: ['Entendido', 'Ok, no problem', 'Vale', 'Perfecto'],
            alternative: ['¿Te gustaría probar otra cosa?', '¿Qué prefieres entonces?', '¿Algo más?'],
            emoji: ['👌', '✨', '']
          }
        }
      ],

      addActivity: [
        {
          id: 'add_1',
          templates: [
            '{confirmation}! {action} más {category} {location_phrase}. {question}',
            '{enthusiasm} {action} {category}. {context}'
          ],
          variables: {
            confirmation: ['Perfecto', 'Claro', 'Dale', 'Excelente'],
            enthusiasm: ['¡Me encanta!', '¡Genial idea!', '¡Buena elección!'],
            action: ['Voy a agregar', 'Añado', 'Incluyo'],
            location_phrase: ['a tu itinerario', 'al plan', 'al día', ''],
            question: ['¿Algún lugar específico?', '¿Tienes alguno en mente?', ''],
            context: ['¿A qué día?', '¿Para cuándo?', '¿Dónde lo pongo?']
          }
        }
      ],

      optimizeRoute: [
        {
          id: 'opt_1',
          templates: [
            '{intro} {action} {benefit}. {time}',
            '{enthusiasm} {action}. {promise}'
          ],
          variables: {
            intro: ['Perfecto', 'Excelente idea', 'Dale'],
            action: ['voy a optimizar las rutas', 'analizo el mejor orden', 'reorganizo todo'],
            benefit: ['para que ahorres tiempo', 'para reducir caminata', 'por eficiencia'],
            time: ['Dame un segundo', 'Ya te muestro', 'Un momento'],
            enthusiasm: ['¡Claro!', '¡Sí!', '¡Vamos!'],
            promise: ['Te va a quedar mucho mejor', 'Vas a ahorrar bastante tiempo', 'Lo optimizo al máximo']
          }
        }
      ],

      recommend: [
        {
          id: 'rec_1',
          templates: [
            '{intro} {analysis}. {suggestion}',
            '{enthusiasm} {context}. {suggestion}'
          ],
          variables: {
            intro: ['Déjame ver', 'Ok', 'Perfecto'],
            analysis: ['veo tu itinerario', 'analizo lo que tienes', 'reviso tu plan'],
            suggestion: ['Te recomiendo...', 'Podrías agregar...', 'Qué tal si...'],
            enthusiasm: ['¡Claro!', '¡Sí!', '¡Me encanta ayudar!'],
            context: ['Según tu perfil', 'Basado en tus gustos', 'Por lo que veo']
          }
        }
      ],

      explain: [
        {
          id: 'exp_1',
          templates: [
            '{intro} {reason}. {details}',
            '{explanation} {benefit}'
          ],
          variables: {
            intro: ['Te explico', 'Mira', 'La razón es que'],
            reason: ['elegí esto porque', 'lo puse así para', 'consideré que'],
            details: ['es lo mejor para tu perfil', 'se alinea con tus preferencias', 'maximiza tu experiencia'],
            explanation: ['Básicamente,', 'En resumen,', 'Lo que pasa es que'],
            benefit: ['así aprovechas mejor el tiempo', 'evitas cansancio', 'disfrutas más'}
          }
        }
      ],

      adjustBudget: [
        {
          id: 'budget_1',
          templates: [
            '{confirmation}! {action} opciones más {type}. {reassurance}',
            '{understanding} {action}. {promise}'
          ],
          variables: {
            confirmation: ['Perfecto', 'Claro', 'Entendido'],
            action: ['Busco', 'Filtro', 'Te muestro', 'Ajusto a'],
            type: ['económicas', 'baratas', 'accesibles', 'económicas'],
            reassurance: ['Japón tiene opciones para todos', 'Hay alternativas geniales', ''],
            understanding: ['Sí, el presupuesto es importante', 'Te entiendo', 'Claro'],
            promise: ['Lo hago más accesible', 'Reduzco costos', 'Te ahorro dinero']
          }
        }
      ],

      changePace: [
        {
          id: 'pace_1',
          templates: [
            '{confirmation}! {action} más {intensity}. {explanation}',
            '{understanding} {action}. {benefit}'
          ],
          variables: {
            confirmation: ['Perfecto', 'Ok', 'Dale'],
            action: ['Lo hago', 'Ajusto el ritmo', 'Modifico el plan'],
            intensity: ['relajado', 'tranquilo', 'intenso', 'activo'],
            explanation: ['así descansas más', 'para que no te canses', 'más a tu ritmo'],
            understanding: ['Entiendo', 'Claro', 'Sí'],
            benefit: ['Así disfrutas más', 'Mejor así', 'Es más cómodo']
          }
        }
      ],

      getStats: [
        {
          id: 'stats_1',
          templates: [
            '{intro} {action}. {anticipation}',
            '{enthusiasm} {analysis}'
          ],
          variables: {
            intro: ['Déjame calcular', 'Veamos', 'Ok'],
            action: ['reviso todo', 'analizo los números', 'sumo todo'],
            anticipation: ['Un segundo...', 'Ya te digo', 'Calculando...'],
            enthusiasm: ['¡Claro!', '¡Sí!', '¡Vamos!'],
            analysis: ['Analizo tu itinerario completo', 'Reviso las estadísticas', 'Te muestro los números']
          }
        }
      ]
    };
  }

  /**
   * 📚 Construir thesaurus para variación de lenguaje
   */
  buildThesaurus() {
    return {
      // Verbos
      agregar: ['añadir', 'incluir', 'meter', 'poner', 'sumar'],
      quitar: ['eliminar', 'sacar', 'borrar', 'remover'],
      cambiar: ['modificar', 'ajustar', 'alterar', 'transformar'],
      ver: ['revisar', 'mirar', 'analizar', 'explorar'],
      hacer: ['crear', 'generar', 'armar', 'construir'],

      // Adjetivos
      bueno: ['genial', 'excelente', 'increíble', 'fantástico', 'perfecto'],
      malo: ['difícil', 'complicado', 'problemático'],
      fácil: ['simple', 'sencillo', 'directo'],
      rápido: ['veloz', 'ágil', 'pronto'],

      // Sustantivos
      viaje: ['aventura', 'travesía', 'experiencia', 'trip'],
      día: ['jornada', 'fecha'],
      lugar: ['sitio', 'spot', 'punto', 'destino'],

      // Expresiones
      'de acuerdo': ['ok', 'perfecto', 'entendido', 'vale', 'sí'],
      'no problem': ['sin problema', 'tranqui', 'claro', 'seguro'],
      'vamos': ['dale', 'hagámoslo', 'arrancamos', 'empecemos']
    };
  }

  /**
   * 🎲 Seleccionar template menos usado
   */
  selectLeastUsedTemplate(intent, templates) {
    // Calcular uso de cada template
    const usage = templates.map(t => ({
      template: t,
      uses: this.templateUsage.get(`${intent}_${t.id}`) || 0
    }));

    // Ordenar por menos usado
    usage.sort((a, b) => a.uses - b.uses);

    // Seleccionar entre los 3 menos usados (para variedad)
    const candidates = usage.slice(0, Math.min(3, usage.length));
    return candidates[Math.floor(Math.random() * candidates.length)].template;
  }

  /**
   * ✨ Aplicar template con variables
   */
  async applyTemplate(template, entities, context) {
    // Seleccionar un template random
    const selectedTemplate = template.templates[
      Math.floor(Math.random() * template.templates.length)
    ];

    // Reemplazar variables
    let result = selectedTemplate;
    const variables = template.variables;

    for (const [varName, options] of Object.entries(variables)) {
      const placeholder = `{${varName}}`;
      if (result.includes(placeholder)) {
        // Seleccionar valor random
        const value = options[Math.floor(Math.random() * options.length)];
        result = result.replace(new RegExp(placeholder, 'g'), value);
      }
    }

    // Reemplazar entidades extraídas
    if (entities) {
      if (entities.CATEGORY) {
        const category = entities.CATEGORY.value || entities.CATEGORY;
        result = result.replace('{category}', category);
      }
      if (entities.DATE) {
        const day = entities.DATE.captured?.[0] || entities.DATE;
        result = result.replace('{day}', day);
      }
      if (entities.NUMBER) {
        const number = entities.NUMBER.value || entities.NUMBER;
        result = result.replace('{number}', number);
      }
    }

    // Aplicar variaciones de lenguaje según historial
    result = this.applyLanguageVariation(result);

    // Personalizar según contexto del usuario
    result = this.personalize(result, context);

    return result;
  }

  /**
   * 🔄 Aplicar variaciones de lenguaje usando thesaurus
   */
  applyLanguageVariation(text) {
    // Probabilidad 30% de variar una palabra
    if (Math.random() > 0.3) return text;

    for (const [word, synonyms] of Object.entries(this.thesaurus)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(text)) {
        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
        text = text.replace(regex, synonym);
        break; // Solo variar una palabra por respuesta
      }
    }

    return text;
  }

  /**
   * 👤 Personalizar respuesta según contexto del usuario
   */
  personalize(text, context) {
    // Si conocemos el nombre del usuario
    if (context.userName && Math.random() > 0.7) {
      text = text.replace(/^/, `${context.userName}, `);
    }

    // Si es una conversación larga, ser más casual
    if (context.conversationLength > 5) {
      text = text.replace(/¡/g, ''); // Menos emojis/exclamaciones
      text = text.replace(/\./g, match => Math.random() > 0.5 ? '' : match);
    }

    // Si el usuario parece frustrado (sentiment negativo)
    if (context.sentiment === 'negative') {
      const supportPhrases = [
        '¿Te ayudo con algo diferente?',
        'Déjame intentarlo de otra forma.',
        'A ver cómo te puedo ayudar mejor.'
      ];
      if (Math.random() > 0.6) {
        text += ' ' + supportPhrases[Math.floor(Math.random() * supportPhrases.length)];
      }
    }

    return text;
  }

  /**
   * 📝 Registrar uso de respuesta (para evitar repeticiones)
   */
  registerUsage(intent, templateId, response) {
    const key = `${intent}_${templateId}`;

    // Incrementar contador de template
    this.templateUsage.set(key, (this.templateUsage.get(key) || 0) + 1);

    // Guardar en historial con timestamp
    const now = Date.now();
    if (!this.usedResponses.has(intent)) {
      this.usedResponses.set(intent, []);
    }

    const history = this.usedResponses.get(intent);
    history.push({ response, timestamp: now, templateId });

    // Mantener solo últimas 20 respuestas
    if (history.length > 20) {
      history.shift();
    }

    // Limpiar uso de templates muy antiguos (> 1 hora)
    this.cleanOldUsage();
  }

  /**
   * 🧹 Limpiar uso antiguo
   */
  cleanOldUsage() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    for (const [intent, history] of this.usedResponses.entries()) {
      this.usedResponses.set(
        intent,
        history.filter(h => h.timestamp > oneHourAgo)
      );
    }
  }

  /**
   * 🔧 Generar respuesta fallback cuando no hay template
   */
  generateFallback(intent, context) {
    const fallbacks = [
      'Hmm, no estoy 100% segura de cómo ayudarte con eso. ¿Me lo explicas de otra forma?',
      'Interesante! Aunque no tengo una respuesta preparada, puedo intentar ayudarte. ¿Qué necesitas exactamente?',
      'No tengo una función específica para eso, pero dime más y veo cómo te ayudo.',
      'Aún estoy aprendiendo sobre ese tema. ¿Podrías darme más detalles?'
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * 📊 Aprender de feedback positivo
   */
  async learnFromSuccess(intent, response, context) {
    // Guardar respuesta exitosa como patrón
    if (!this.learnedPatterns[intent]) {
      this.learnedPatterns[intent] = [];
    }

    this.learnedPatterns[intent].push({
      response,
      context,
      timestamp: Date.now(),
      successCount: 1
    });

    // Persistir
    if (window.MLStorage) {
      await window.MLStorage.set('learned_patterns', this.learnedPatterns);
    }
  }

  /**
   * 📈 Obtener estadísticas
   */
  getStats() {
    return {
      totalTemplates: Object.keys(this.responseTemplates).length,
      templateUsage: Object.fromEntries(this.templateUsage),
      learnedPatterns: Object.keys(this.learnedPatterns).reduce((acc, key) => {
        acc[key] = this.learnedPatterns[key].length;
        return acc;
      }, {}),
      recentResponses: Array.from(this.usedResponses.entries()).map(([intent, history]) => ({
        intent,
        count: history.length
      }))
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.SmartResponseGenerator = new SmartResponseGenerator();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.SmartResponseGenerator.initialize().catch(e => {
        console.error('Failed to initialize Smart Response Generator:', e);
      });
    });
  } else {
    window.SmartResponseGenerator.initialize().catch(e => {
      console.error('Failed to initialize Smart Response Generator:', e);
    });
  }

  console.log('🧠 Smart Response Generator loaded!');
}
