/**
 * 🎓 MOTOR DE DECISIONES SISTEMA EXPERTO (#12)
 * ===============================================
 *
 * Sistema de reglas inteligentes que toma decisiones complejas
 * basándose en múltiples factores del viaje.
 *
 * Características:
 * - Reglas basadas en clima, presupuesto, grupo, experiencia
 * - Matriz de compatibilidad de actividades
 * - Auto-ajuste de itinerarios
 * - Recomendaciones contextuales
 */

class ExpertDecisionEngine {
  constructor() {
    this.rules = this.initializeRules();
    this.compatibilityMatrix = this.initializeCompatibilityMatrix();
  }

  /**
   * 📋 Inicializa el sistema de reglas expertas
   */
  initializeRules() {
    return [
      // 🌧️ REGLA 1: Día lluvioso
      {
        id: 'rainy_day',
        priority: 10,
        condition: (context) => context.weather?.rain > 70,
        actions: {
          prioritize: ['museum', 'shopping', 'arcade', 'aquarium', 'indoor-entertainment'],
          avoid: ['park', 'garden', 'outdoor-market', 'hiking', 'beach'],
          message: '🌧️ Día lluvioso detectado - priorizando actividades bajo techo',
          adjustments: {
            addUmbrellaTip: true,
            reduceWalkingTime: 0.3 // 30% menos caminata
          }
        }
      },

      // ☀️ REGLA 2: Día muy caluroso
      {
        id: 'hot_day',
        priority: 9,
        condition: (context) => context.weather?.temp > 32,
        actions: {
          prioritize: ['aquarium', 'museum', 'shopping', 'indoor-activities'],
          avoid: ['hiking', 'long-walks'],
          message: '🌡️ Día muy caluroso - priorizando lugares con aire acondicionado',
          adjustments: {
            addWaterBreaks: true,
            reduceOutdoorTime: 0.4,
            addHydrationTip: true
          }
        }
      },

      // 👶 REGLA 3: Viaje con niños
      {
        id: 'traveling_with_kids',
        priority: 10,
        condition: (context) => context.travelers?.some(t => t.age < 12),
        actions: {
          prioritize: ['aquarium', 'zoo', 'ghibli-museum', 'pokemon-center', 'park', 'arcade'],
          avoid: ['temples-long-walks', 'nightlife', 'bars', 'late-night-activities'],
          message: '👨‍👩‍👧‍👦 Grupo con niños - ajustando actividades kid-friendly',
          adjustments: {
            maxActivityDuration: 90, // max 90 min por actividad
            restBreaksEvery: 2, // descanso cada 2 actividades
            endDayBy: 20, // terminar día antes de las 8pm
            addPlaygrounds: true
          }
        }
      },

      // 💰 REGLA 4: Presupuesto bajo
      {
        id: 'low_budget',
        priority: 8,
        condition: (context) => context.dailyBudget < 8000,
        actions: {
          prioritize: ['free-temple', 'park', 'shrine', 'walking-tour', 'free-observation-deck'],
          avoid: ['premium-restaurant', 'expensive-attraction', 'luxury-experience'],
          message: '💰 Presupuesto ajustado - priorizando actividades económicas',
          adjustments: {
            maxActivityCost: 2000,
            suggest100YenShops: true,
            suggestConvenienceStores: true,
            addBudgetTips: [
              'Visita templos y santuarios (mayoría gratuitos)',
              'Come en tiendas de conveniencia (¥500-800)',
              'Usa tiendas ¥100 para souvenirs'
            ]
          }
        }
      },

      // 💎 REGLA 5: Presupuesto alto
      {
        id: 'high_budget',
        priority: 6,
        condition: (context) => context.dailyBudget > 20000,
        actions: {
          prioritize: ['premium-dining', 'luxury-experience', 'private-tour', 'michelin-restaurant'],
          message: '💎 Presupuesto premium - incluyendo experiencias exclusivas',
          adjustments: {
            includeOmakase: true,
            includeRyokan: true,
            includePrivateGuides: true
          }
        }
      },

      // 🆕 REGLA 6: Primera vez en Japón
      {
        id: 'first_time_japan',
        priority: 10,
        condition: (context) => context.userProfile?.tripsToJapan === 0,
        actions: {
          mustInclude: [
            { name: 'Senso-ji', city: 'Tokyo' },
            { name: 'Shibuya Crossing', city: 'Tokyo' },
            { name: 'Fushimi Inari', city: 'Kyoto' },
            { name: 'Arashiyama Bamboo Grove', city: 'Kyoto' }
          ],
          message: '🆕 Primera vez en Japón - incluyendo lugares icónicos imperdibles',
          adjustments: {
            addCultureTips: true,
            addEtiquetteTips: true,
            addEssentialPhrases: true,
            tips: [
              '📱 Obtén una tarjeta IC (Suica/Pasmo)',
              '🗣️ Descarga Google Translate offline',
              '💴 Lleva efectivo (muchos lugares no aceptan tarjeta)',
              '🙇 Aprende saludos básicos: Arigatou gozaimasu (gracias)'
            ]
          }
        }
      },

      // 🔁 REGLA 7: Visitante frecuente
      {
        id: 'frequent_visitor',
        priority: 7,
        condition: (context) => context.userProfile?.tripsToJapan >= 3,
        actions: {
          prioritize: ['hidden-gems', 'local-spots', 'off-beaten-path'],
          avoid: ['tourist-traps', 'overly-crowded-spots'],
          message: '🔁 Visitante frecuente - explorando lugares auténticos y menos conocidos',
          adjustments: {
            includeLocalNeighborhoods: true,
            includeSeasonalEvents: true
          }
        }
      },

      // 🌸 REGLA 8: Temporada de Sakura
      {
        id: 'cherry_blossom_season',
        priority: 9,
        condition: (context) => {
          const month = new Date(context.startDate).getMonth() + 1;
          return month >= 3 && month <= 4; // Marzo-Abril
        },
        actions: {
          prioritize: ['ueno-park', 'yoyogi-park', 'meguro-river', 'philosopher-path', 'maruyama-park'],
          message: '🌸 Temporada de Sakura - incluyendo los mejores spots de hanami',
          adjustments: {
            addHanamiTips: true,
            expectCrowds: true,
            bookEarly: true
          }
        }
      },

      // 🍂 REGLA 9: Temporada de momiji (otoño)
      {
        id: 'autumn_foliage',
        priority: 9,
        condition: (context) => {
          const month = new Date(context.startDate).getMonth() + 1;
          return month >= 10 && month <= 11; // Octubre-Noviembre
        },
        actions: {
          prioritize: ['arashiyama', 'tofuku-ji', 'nikko', 'kamakura', 'hakone'],
          message: '🍂 Temporada de momiji - incluyendo los mejores spots de koyo',
          adjustments: {
            addMomijiTips: true,
            expectCrowds: true
          }
        }
      },

      // 🍜 REGLA 10: Foodie traveler
      {
        id: 'foodie_traveler',
        priority: 7,
        condition: (context) => context.interests?.includes('food') || context.preferences?.foodieLevel > 7,
        actions: {
          prioritize: ['tsukiji-market', 'dotonbori', 'ramen-street', 'depachika', 'food-tour'],
          message: '🍜 Foodie detectado - maximizando experiencias gastronómicas',
          adjustments: {
            mealActivityRatio: 0.4, // 40% del día dedicado a comida
            includeStreetFood: true,
            includeLocalMarkets: true,
            includeMichelinSpots: true
          }
        }
      },

      // 🏃 REGLA 11: Viajero activo
      {
        id: 'active_traveler',
        priority: 6,
        condition: (context) => context.preferences?.activityLevel === 'high',
        actions: {
          prioritize: ['hiking', 'cycling', 'walking-tours', 'climbing'],
          message: '🏃 Viajero activo - incluyendo actividades físicas',
          adjustments: {
            maxWalkingPerDay: 20, // hasta 20km
            activitiesPerDay: 8, // más actividades
            shorterRestBreaks: true
          }
        }
      },

      // 😴 REGLA 12: Viajero relajado
      {
        id: 'relaxed_traveler',
        priority: 6,
        condition: (context) => context.preferences?.activityLevel === 'low',
        actions: {
          prioritize: ['onsen', 'tea-ceremony', 'zen-garden', 'peaceful-temple'],
          avoid: ['packed-schedule', 'rush-activities'],
          message: '😴 Viajero relajado - priorizando experiencias tranquilas',
          adjustments: {
            maxWalkingPerDay: 8, // máx 8km
            activitiesPerDay: 4, // menos actividades
            longerRestBreaks: true,
            endDayEarly: true
          }
        }
      },

      // 🌙 REGLA 13: Night owl
      {
        id: 'night_owl',
        priority: 5,
        condition: (context) => context.preferences?.nightOwl === true,
        actions: {
          prioritize: ['nightlife', 'izakaya', 'karaoke', 'night-views', 'late-night-ramen'],
          message: '🌙 Night owl - incluyendo actividades nocturnas',
          adjustments: {
            startDayLater: 10, // empezar a las 10am
            endDayLater: 23, // terminar a las 11pm
            includeNightActivities: true
          }
        }
      },

      // 🎌 REGLA 14: Culture enthusiast
      {
        id: 'culture_enthusiast',
        priority: 8,
        condition: (context) => context.interests?.includes('culture') || context.interests?.includes('history'),
        actions: {
          prioritize: ['temple', 'shrine', 'museum', 'tea-ceremony', 'traditional-craft'],
          message: '🎌 Amante de la cultura - maximizando experiencias tradicionales',
          adjustments: {
            culturalActivityRatio: 0.6, // 60% actividades culturales
            includeGuidedTours: true,
            addHistoricalContext: true
          }
        }
      },

      // 🎮 REGLA 15: Tech & Anime fan
      {
        id: 'tech_anime_fan',
        priority: 7,
        condition: (context) => context.interests?.includes('anime') || context.interests?.includes('technology'),
        actions: {
          prioritize: ['akihabara', 'pokemon-center', 'ghibli-museum', 'teamlab', 'manga-cafe', 'anime-shops'],
          message: '🎮 Tech & Anime fan - incluyendo la cultura otaku',
          adjustments: {
            includeAkihabara: true,
            includePokemonCenter: true,
            includeAnimeSpots: true
          }
        }
      }
    ];
  }

  /**
   * 🔗 Inicializa la matriz de compatibilidad entre actividades
   * Score: 0 (mala combinación) a 1 (excelente combinación)
   */
  initializeCompatibilityMatrix() {
    return {
      'temple + garden': 0.9,           // Excelente combinación
      'temple + shrine': 0.85,          // Muy buena
      'temple + tea-ceremony': 0.95,    // Perfecta
      'temple + nightlife': 0.2,        // Mala
      'temple + arcade': 0.3,           // No recomendada

      'museum + museum': 0.4,           // Puede ser aburrido
      'museum + park': 0.7,             // Buena para descansar
      'museum + shopping': 0.6,         // Decente

      'food-market + restaurant': 0.3,  // Muy similar
      'food-market + street-food': 0.8, // Buena

      'shopping + shopping': 0.6,       // OK si áreas diferentes
      'shopping + cafe': 0.8,           // Buena

      'hiking + onsen': 0.95,           // Perfecta
      'hiking + museum': 0.4,           // No fluye bien

      'cultural + nature': 0.85,        // Excelente variedad
      'cultural + modern': 0.75,        // Buen contraste

      'nightlife + early-morning': 0.1, // Imposible
      'nightlife + izakaya': 0.9,       // Perfecta

      'park + garden': 0.5,             // Repetitivo
      'park + outdoor-market': 0.8,     // Buena

      'onsen + tea-ceremony': 0.9,      // Excelente experiencia relajante
      'onsen + nightlife': 0.3          // No combina bien
    };
  }

  /**
   * 🎯 Evalúa el contexto del viaje y aplica reglas
   * @param {Object} context - Contexto del viaje
   * @returns {Object} Decisiones y recomendaciones
   */
  evaluate(context) {
    const applicableRules = [];
    const decisions = {
      prioritize: [],
      avoid: [],
      mustInclude: [],
      adjustments: {},
      tips: [],
      messages: []
    };

    // Evaluar cada regla
    this.rules.forEach(rule => {
      try {
        if (rule.condition(context)) {
          applicableRules.push(rule);
        }
      } catch (e) {
        console.warn(`Error evaluando regla ${rule.id}:`, e);
      }
    });

    // Ordenar por prioridad
    applicableRules.sort((a, b) => b.priority - a.priority);

    // Aplicar acciones de reglas aplicables
    applicableRules.forEach(rule => {
      const actions = rule.actions;

      if (actions.prioritize) {
        decisions.prioritize.push(...actions.prioritize);
      }

      if (actions.avoid) {
        decisions.avoid.push(...actions.avoid);
      }

      if (actions.mustInclude) {
        decisions.mustInclude.push(...actions.mustInclude);
      }

      if (actions.message) {
        decisions.messages.push(actions.message);
      }

      if (actions.adjustments) {
        Object.assign(decisions.adjustments, actions.adjustments);
      }

      if (actions.adjustments?.tips) {
        decisions.tips.push(...actions.adjustments.tips);
      }

      if (actions.adjustments?.addBudgetTips) {
        decisions.tips.push(...actions.adjustments.addBudgetTips);
      }
    });

    // Eliminar duplicados
    decisions.prioritize = [...new Set(decisions.prioritize)];
    decisions.avoid = [...new Set(decisions.avoid)];
    decisions.tips = [...new Set(decisions.tips)];

    return {
      applicableRules: applicableRules.map(r => r.id),
      decisions,
      ruleCount: applicableRules.length
    };
  }

  /**
   * 🔍 Calcula compatibilidad entre dos actividades
   * @param {Object} activity1
   * @param {Object} activity2
   * @returns {number} Score 0-1
   */
  checkCompatibility(activity1, activity2) {
    const cat1 = activity1.category || '';
    const cat2 = activity2.category || '';

    // Buscar en matriz
    const key1 = `${cat1} + ${cat2}`;
    const key2 = `${cat2} + ${cat1}`;

    if (this.compatibilityMatrix[key1]) {
      return this.compatibilityMatrix[key1];
    }

    if (this.compatibilityMatrix[key2]) {
      return this.compatibilityMatrix[key2];
    }

    // Si son exactamente la misma categoría
    if (cat1 === cat2) {
      return 0.5; // Neutral - puede ser repetitivo
    }

    // Default: neutral
    return 0.6;
  }

  /**
   * 📊 Evalúa compatibilidad de un día completo
   * @param {Array} dayActivities - Actividades del día
   * @returns {Object} { score: 0-1, suggestions: [] }
   */
  evaluateDayCompatibility(dayActivities) {
    if (dayActivities.length < 2) {
      return { score: 1.0, suggestions: [] };
    }

    let totalScore = 0;
    let comparisons = 0;
    const suggestions = [];

    // Comparar actividades consecutivas
    for (let i = 0; i < dayActivities.length - 1; i++) {
      const compatibility = this.checkCompatibility(
        dayActivities[i],
        dayActivities[i + 1]
      );

      totalScore += compatibility;
      comparisons++;

      if (compatibility < 0.4) {
        suggestions.push(
          `⚠️ "${dayActivities[i].name}" seguido de "${dayActivities[i + 1].name}" puede no fluir bien`
        );
      }
    }

    const avgScore = comparisons > 0 ? totalScore / comparisons : 1.0;

    if (avgScore >= 0.8) {
      suggestions.push('✅ Excelente balance de actividades para este día');
    } else if (avgScore < 0.5) {
      suggestions.push('⚠️ Este día podría beneficiarse de reorganizar las actividades');
    }

    return {
      score: avgScore,
      suggestions
    };
  }

  /**
   * 🔧 Sugiere mejoras para un itinerario
   * @param {Object} itinerary - Itinerario completo
   * @param {Object} context - Contexto del viaje
   * @returns {Object} Sugerencias de mejora
   */
  suggestImprovements(itinerary, context) {
    const evaluation = this.evaluate(context);
    const improvements = {
      criticalIssues: [],
      suggestions: [],
      optimizations: []
    };

    // Verificar must-include
    if (evaluation.decisions.mustInclude.length > 0) {
      evaluation.decisions.mustInclude.forEach(mustInclude => {
        const found = itinerary.days.some(day =>
          day.activities.some(act => act.name === mustInclude.name)
        );

        if (!found) {
          improvements.criticalIssues.push(
            `❌ Falta actividad imperdible: ${mustInclude.name} en ${mustInclude.city}`
          );
        }
      });
    }

    // Evaluar cada día
    itinerary.days.forEach((day, index) => {
      const dayCompat = this.evaluateDayCompatibility(day.activities);

      if (dayCompat.score < 0.5) {
        improvements.suggestions.push(
          `Día ${index + 1}: ${dayCompat.suggestions.join(', ')}`
        );
      }
    });

    // Agregar mensajes de reglas aplicables
    improvements.optimizations.push(...evaluation.decisions.messages);

    return improvements;
  }
}

// 🌐 Exportar para uso global
if (typeof window !== 'undefined') {
  window.ExpertDecisionEngine = ExpertDecisionEngine;
}
