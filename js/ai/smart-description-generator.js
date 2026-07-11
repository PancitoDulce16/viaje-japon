/**
 * ✍️ GENERADOR INTELIGENTE DE DESCRIPCIONES
 * ===========================================
 *
 * Genera descripciones automáticas y personalizadas para:
 * - Días completos del itinerario
 * - Actividades individuales
 * - Resúmenes del viaje
 *
 * Utiliza:
 * - Templates inteligentes
 * - Análisis de contexto
 * - Personalización según preferencias
 * - Tono natural y atractivo
 *
 * No usa IA externa - todo es local y basado en reglas.
 */

class SmartDescriptionGenerator {
  constructor() {
    // Templates base para diferentes tipos de días
    this.dayTemplates = {
      cultural: [
        'Día dedicado a sumergirse en la rica historia y cultura japonesa.',
        'Una jornada explorando el patrimonio cultural de {city}.',
        'Día enfocado en descubrir templos, santuarios y tradiciones.',
        'Inmersión cultural profunda en el corazón de {city}.'
      ],
      food: [
        'Día gastronómico explorando los sabores auténticos de Japón.',
        'Una aventura culinaria por {city}.',
        'Jornada dedicada a degustar la exquisita gastronomía japonesa.',
        'Recorrido gastronómico desde mercados locales hasta restaurantes tradicionales.'
      ],
      nature: [
        'Día de conexión con la naturaleza en espacios verdes de {city}.',
        'Escapada natural para disfrutar de jardines y paisajes.',
        'Jornada rodeado de la belleza natural japonesa.',
        'Día explorando parques, jardines y vistas panorámicas.'
      ],
      shopping: [
        'Día de compras explorando desde tiendas tradicionales hasta modernos centros comerciales.',
        'Jornada perfecta para encontrar souvenirs y productos únicos.',
        'Día dedicado a descubrir las mejores zonas comerciales de {city}.',
        'Recorrido por mercados, boutiques y distritos comerciales.'
      ],
      mixed: [
        'Día equilibrado combinando cultura, gastronomía y entretenimiento.',
        'Jornada variada explorando lo mejor de {city}.',
        'Día diverso con un poco de todo lo que {city} tiene para ofrecer.',
        'Mezcla perfecta de experiencias para aprovechar al máximo el día.'
      ],
      intense: [
        'Día intenso repleto de experiencias y actividades.',
        'Jornada acelerada para ver y hacer lo máximo posible.',
        'Día ambicioso visitando múltiples puntos de interés.',
        'Itinerario apretado pero bien organizado para optimizar el tiempo.'
      ],
      relaxed: [
        'Día relajado para disfrutar a tu propio ritmo.',
        'Jornada tranquila con tiempo para descansar y absorber el ambiente.',
        'Día pausado perfecto para recargar energías.',
        'Itinerario ligero con espacios para improvisar y relajarse.'
      ]
    };

    // Frases de contexto
    this.contextPhrases = {
      morning: ['Comenzando la mañana', 'Al iniciar el día', 'Temprano por la mañana', 'Para empezar'],
      midday: ['A media mañana', 'Antes del almuerzo', 'Hacia el mediodía', 'Continuando'],
      lunch: ['Para el almuerzo', 'A la hora de comer', 'Al mediodía', 'Momento perfecto para'],
      afternoon: ['Por la tarde', 'Después de comer', 'En la tarde', 'Continuando la tarde'],
      evening: ['Al atardecer', 'Cuando cae la tarde', 'Hacia el final del día', 'Para cerrar el día'],
      night: ['Por la noche', 'Después del anochecer', 'De noche', 'Para terminar']
    };

    // Conectores
    this.connectors = [
      'Luego,',
      'A continuación,',
      'Posteriormente,',
      'Seguido de',
      'Después,',
      'Para continuar,',
      'Más tarde,'
    ];

    console.log('✍️ Smart Description Generator initialized');
  }

  /**
   * 📝 Genera descripción para un día completo
   * @param {Object} day - Día del itinerario
   * @param {Object} context - Contexto adicional (ciudad, número de día, etc.)
   * @returns {string} Descripción generada
   */
  generateDayDescription(day, context = {}) {
    const activities = day.activities || [];
    const city = context.city || 'la ciudad';
    const dayNumber = context.dayNumber || 1;

    if (activities.length === 0) {
      return `Día ${dayNumber}: Día libre para explorar ${city} a tu ritmo.`;
    }

    // 1. Determinar tipo de día
    const dayType = this.analyzeDayType(day);

    // 2. Obtener template base
    const template = this.selectRandomTemplate(this.dayTemplates[dayType]);
    const baseDescription = template.replace('{city}', city);

    // 3. Agregar detalles de actividades destacadas
    const highlights = this.generateHighlights(activities, 3);

    // 4. Agregar información contextual
    const contextInfo = this.generateContextInfo(day);

    // 5. Construir descripción completa
    let description = `**Día ${dayNumber}**: ${baseDescription}`;

    if (highlights) {
      description += ` ${highlights}`;
    }

    if (contextInfo) {
      description += ` ${contextInfo}`;
    }

    return description;
  }

  /**
   * 🎯 Analiza el tipo de día según actividades
   */
  analyzeDayType(day) {
    const activities = day.activities || [];

    if (activities.length === 0) return 'relaxed';
    if (activities.length >= 7) return 'intense';

    // Contar categorías
    const categories = {};
    for (const activity of activities) {
      const cat = activity.category || 'other';
      categories[cat] = (categories[cat] || 0) + 1;
    }

    // Determinar categoría dominante
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length === 0) return 'mixed';

    const [dominantCategory, dominantCount] = sortedCategories[0];
    const totalActivities = activities.length;

    // Si una categoría domina >60%, es ese tipo de día
    if (dominantCount / totalActivities > 0.6) {
      return this.mapCategoryToDayType(dominantCategory);
    }

    // Si hay 3 o menos actividades, es relajado
    if (totalActivities <= 3) return 'relaxed';

    return 'mixed';
  }

  /**
   * 🗺️ Mapea categoría de actividad a tipo de día
   */
  mapCategoryToDayType(category) {
    const mapping = {
      temple: 'cultural',
      shrine: 'cultural',
      museum: 'cultural',
      castle: 'cultural',
      park: 'nature',
      garden: 'nature',
      nature: 'nature',
      restaurant: 'food',
      market: 'food',
      shopping: 'shopping',
      mall: 'shopping'
    };

    return mapping[category] || 'mixed';
  }

  /**
   * ⭐ Genera highlights de las actividades más importantes
   */
  generateHighlights(activities, maxHighlights = 3) {
    if (activities.length === 0) return '';

    // Seleccionar actividades más relevantes
    const highlights = activities
      .slice(0, maxHighlights)
      .map(a => a.name)
      .filter(Boolean);

    if (highlights.length === 0) return '';

    if (highlights.length === 1) {
      return `Destacando la visita a ${highlights[0]}.`;
    } else if (highlights.length === 2) {
      return `Incluyendo ${highlights[0]} y ${highlights[1]}.`;
    } else {
      const last = highlights.pop();
      return `Visitando ${highlights.join(', ')} y ${last}.`;
    }
  }

  /**
   * 📊 Genera información contextual del día
   */
  generateContextInfo(day) {
    const infoParts = [];

    // Distancia caminada
    const walkingDistance = this.estimateWalkingDistance(day);
    if (walkingDistance > 10) {
      infoParts.push(`Se estima caminar aproximadamente ${walkingDistance.toFixed(1)} km`);
    }

    // Duración estimada
    const duration = this.estimateDuration(day);
    if (duration > 0) {
      const hours = Math.floor(duration / 60);
      infoParts.push(`con una duración aproximada de ${hours} horas`);
    }

    if (infoParts.length > 0) {
      return infoParts.join(', ') + '.';
    }

    return '';
  }

  /**
   * 📝 Genera descripción narrativa del día (actividad por actividad)
   * @param {Object} day - Día del itinerario
   * @returns {string} Narrativa completa
   */
  generateDayNarrative(day) {
    const activities = day.activities || [];

    if (activities.length === 0) {
      return 'Día libre sin actividades programadas. Perfecto para explorar o descansar.';
    }

    let narrative = '';

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const timeOfDay = this.determineTimeOfDay(i, activities.length);

      // Primera actividad
      if (i === 0) {
        narrative += this.selectRandomPhrase(this.contextPhrases[timeOfDay]);
        narrative += ` visitarás ${activity.name}`;
      }
      // Última actividad
      else if (i === activities.length - 1) {
        narrative += `, y para finalizar el día, ${activity.name}`;
      }
      // Actividades intermedias
      else {
        const connector = this.selectRandomConnector();
        narrative += `. ${connector} ${activity.name}`;
      }

      // Agregar descripción corta si existe
      if (activity.description && activity.description.length < 100) {
        narrative += ` (${activity.description})`;
      }
    }

    narrative += '.';

    return narrative;
  }

  /**
   * 🕐 Determina momento del día según índice de actividad
   */
  determineTimeOfDay(index, total) {
    const progress = index / total;

    if (progress < 0.15) return 'morning';
    if (progress < 0.35) return 'midday';
    if (progress < 0.45) return 'lunch';
    if (progress < 0.7) return 'afternoon';
    if (progress < 0.85) return 'evening';
    return 'night';
  }

  /**
   * 📝 Genera descripción para actividad individual
   * @param {Object} activity - Actividad
   * @param {Object} context - Contexto (actividad previa, siguiente, etc.)
   * @returns {string} Descripción
   */
  generateActivityDescription(activity, context = {}) {
    const { previousActivity, nextActivity, isFirst, isLast } = context;

    let description = '';

    // Prefijo según posición
    if (isFirst) {
      description += 'Para comenzar el día, ';
    } else if (isLast) {
      description += 'Para cerrar el día, ';
    }

    // Nombre y categoría
    description += `${activity.name}`;

    // Agregar contexto de categoría
    const categoryDesc = this.getCategoryDescription(activity.category);
    if (categoryDesc) {
      description += `, ${categoryDesc}`;
    }

    // Duración
    if (activity.duration && activity.duration > 0) {
      description += `. Tiempo estimado: ${activity.duration} minutos`;
    }

    // Costo
    if (activity.cost && activity.cost > 0) {
      description += `. Costo aproximado: ¥${activity.cost}`;
    }

    // Tips específicos por categoría
    const tip = this.getCategoryTip(activity.category);
    if (tip) {
      description += `. ${tip}`;
    }

    return description;
  }

  /**
   * 📝 Descripción corta de categoría
   */
  getCategoryDescription(category) {
    const descriptions = {
      temple: 'un lugar sagrado lleno de historia y espiritualidad',
      shrine: 'un santuario tradicional japonés',
      museum: 'un museo con fascinantes exhibiciones',
      park: 'un espacio verde perfecto para relajarse',
      garden: 'un jardín japonés de gran belleza',
      shopping: 'una zona comercial vibrante',
      restaurant: 'un excelente lugar para disfrutar la gastronomía local',
      viewpoint: 'un mirador con vistas impresionantes',
      castle: 'un castillo histórico japonés',
      market: 'un mercado local lleno de vida'
    };

    return descriptions[category] || '';
  }

  /**
   * 💡 Tip específico por categoría
   */
  getCategoryTip(category) {
    const tips = {
      temple: 'Recuerda vestir apropiadamente y respetar las áreas sagradas',
      shrine: 'No olvides hacer una pequeña ofrenda y aprender sobre los rituales',
      museum: 'Considera tomar la audioguía para una experiencia más enriquecedora',
      park: 'Perfecto para hacer una pausa y tomar fotos',
      restaurant: 'Reserva con anticipación si es posible',
      market: 'Llega temprano para ver lo más fresco y evitar multitudes'
    };

    return tips[category] || '';
  }

  /**
   * 📝 Genera resumen del viaje completo
   * @param {Object} itinerary - Itinerario completo
   * @returns {string} Resumen ejecutivo
   */
  generateTripSummary(itinerary) {
    const days = itinerary.days || [];
    const totalDays = days.length;

    if (totalDays === 0) {
      return 'Itinerario vacío. Comienza agregando días y actividades.';
    }

    // Estadísticas generales
    const totalActivities = days.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
    const cities = this.extractCities(itinerary);
    const categories = this.analyzeCategories(days);

    let summary = `Viaje de ${totalDays} ${totalDays === 1 ? 'día' : 'días'} por Japón`;

    // Ciudades
    if (cities.length > 0) {
      if (cities.length === 1) {
        summary += ` en ${cities[0]}`;
      } else if (cities.length === 2) {
        summary += ` visitando ${cities[0]} y ${cities[1]}`;
      } else {
        const lastCity = cities.pop();
        summary += ` recorriendo ${cities.join(', ')} y ${lastCity}`;
      }
    }

    summary += `. `;

    // Actividades
    summary += `Incluye ${totalActivities} actividades cuidadosamente seleccionadas`;

    // Estilo del viaje (basado en categorías dominantes)
    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([cat]) => cat);

    if (topCategories.length > 0) {
      const styles = topCategories
        .map(cat => this.getCategoryStyle(cat))
        .filter(Boolean);

      if (styles.length > 0) {
        summary += ` con enfoque en ${styles.join(' y ')}`;
      }
    }

    summary += '.';

    // Recomendaciones generales
    const recommendations = this.generateTripRecommendations(itinerary);
    if (recommendations) {
      summary += ` ${recommendations}`;
    }

    return summary;
  }

  /**
   * 🌍 Extrae ciudades del itinerario
   */
  extractCities(itinerary) {
    const cities = new Set();

    for (const day of itinerary.days || []) {
      if (day.city) {
        cities.add(day.city);
      } else if (day.activities && day.activities.length > 0) {
        // Intentar extraer ciudad de la primera actividad
        const firstActivity = day.activities[0];
        if (firstActivity.location?.city) {
          cities.add(firstActivity.location.city);
        }
      }
    }

    return Array.from(cities);
  }

  /**
   * 📊 Analiza categorías de todas las actividades
   */
  analyzeCategories(days) {
    const categories = {};

    for (const day of days) {
      for (const activity of day.activities || []) {
        const cat = activity.category || 'other';
        categories[cat] = (categories[cat] || 0) + 1;
      }
    }

    return categories;
  }

  /**
   * 🎨 Estilo del viaje según categoría
   */
  getCategoryStyle(category) {
    const styles = {
      temple: 'exploración cultural',
      shrine: 'experiencias espirituales',
      museum: 'arte y cultura',
      park: 'naturaleza y relajación',
      garden: 'belleza natural',
      shopping: 'compras y souvenirs',
      restaurant: 'gastronomía',
      market: 'mercados locales',
      nightlife: 'vida nocturna'
    };

    return styles[category] || '';
  }

  /**
   * 💡 Genera recomendaciones generales del viaje
   */
  generateTripRecommendations(itinerary) {
    const days = itinerary.days || [];
    const totalDays = days.length;

    const recommendations = [];

    // Ritmo del viaje
    const avgActivitiesPerDay = days.reduce((sum, day) => sum + (day.activities?.length || 0), 0) / totalDays;

    if (avgActivitiesPerDay > 7) {
      recommendations.push('El ritmo es intenso, asegúrate de descansar adecuadamente');
    } else if (avgActivitiesPerDay < 3) {
      recommendations.push('El ritmo es relajado, perfecto para disfrutar sin prisas');
    }

    // JR Pass
    if (this.shouldRecommendJRPass(itinerary)) {
      recommendations.push('considera adquirir el JR Pass para optimizar el transporte');
    }

    // Mejor época
    const season = this.determineSeason(itinerary.startDate);
    if (season) {
      const seasonTip = this.getSeasonTip(season);
      if (seasonTip) {
        recommendations.push(seasonTip);
      }
    }

    if (recommendations.length > 0) {
      return recommendations.join(', ') + '.';
    }

    return '';
  }

  /**
   * 🚄 Determina si recomendar JR Pass
   */
  shouldRecommendJRPass(itinerary) {
    const cities = this.extractCities(itinerary);
    return cities.length >= 2; // Si visita 2+ ciudades, probablemente necesite JR Pass
  }

  /**
   * 🍂 Determina temporada del viaje
   */
  determineSeason(startDate) {
    if (!startDate) return null;

    const date = window.TimeUtils ? window.TimeUtils.parseDate(startDate) : new Date(startDate);
    if (!date) return null;
    const month = date.getMonth() + 1;

    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  }

  /**
   * 💡 Tip según temporada
   */
  getSeasonTip(season) {
    const tips = {
      spring: 'si viajas en primavera, no te pierdas los cerezos en flor (sakura)',
      summer: 'prepárate para el calor y humedad del verano japonés',
      fall: 'disfruta de los colores otoñales (momiji) en parques y templos',
      winter: 'el invierno es perfecto para onsen y deportes de nieve'
    };

    return tips[season] || '';
  }

  // ===== UTILIDADES =====

  selectRandomTemplate(templates) {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  selectRandomPhrase(phrases) {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  selectRandomConnector() {
    return this.connectors[Math.floor(Math.random() * this.connectors.length)];
  }

  estimateWalkingDistance(day) {
    const activities = day.activities || [];
    let distance = 0;

    for (let i = 0; i < activities.length - 1; i++) {
      const current = activities[i];
      const next = activities[i + 1];

      if (current.location?.coordinates && next.location?.coordinates) {
        distance += this.haversineDistance(
          current.location.coordinates,
          next.location.coordinates
        );
      }
    }

    // Agregar distancia estimada dentro de cada lugar
    distance += activities.length * 0.5;

    return distance;
  }

  estimateDuration(day) {
    return (day.activities || []).reduce((sum, activity) => {
      return sum + (activity.duration || 60);
    }, 0);
  }

  haversineDistance(coords1, coords2) {
    const R = 6371;
    const lat1 = coords1.lat * Math.PI / 180;
    const lat2 = coords2.lat * Math.PI / 180;
    const deltaLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const deltaLon = (coords2.lon - coords1.lon) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.SmartDescriptionGenerator = new SmartDescriptionGenerator();
}
