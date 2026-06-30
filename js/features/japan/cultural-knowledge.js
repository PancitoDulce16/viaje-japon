/**
 * ⛩️ CULTURAL KNOWLEDGE SYSTEM
 * ============================
 *
 * Deep cultural knowledge base for Japan:
 * - Etiquette rules and customs
 * - Essential phrases with context
 * - Festival calendar
 * - Cultural taboos and do's/don'ts
 * - Situation-specific guidance
 *
 * GOAL: Help travelers respect Japanese culture and avoid faux pas
 */

class CulturalKnowledge {
  constructor() {
    this.initialized = false;

    // Etiquette rules organized by context
    this.etiquette = {
      general: [
        {
          title: 'Arco (Bow) - お辞儀',
          icon: '🙇',
          rule: 'Inclínate al saludar, agradecer o disculparte',
          details: 'Inclinación ligera (15°) para saludos informales. Inclinación media (30°) para situaciones formales. Inclinación profunda (45°) para disculpas serias.',
          importance: 'high',
          doExample: 'Inclínate ligeramente al entrar a una tienda',
          dontExample: 'No solo agites la mano sin inclinarte'
        },
        {
          title: 'Zapatos - くつ',
          icon: '👞',
          rule: 'Quítate los zapatos al entrar a casas, templos, ryokans',
          details: 'Busca un genkan (入口) o área de entrada. Usa las pantuflas proporcionadas. NUNCA uses zapatos de calle en tatami.',
          importance: 'critical',
          doExample: 'Coloca zapatos ordenadamente apuntando hacia la salida',
          dontExample: 'NUNCA pises tatami con zapatos o calcetines sucios'
        },
        {
          title: 'Mascarilla - マスク',
          icon: '😷',
          rule: 'Usa mascarilla si estás enfermo o en transporte',
          details: 'Es considerado de buena educación usar mascarilla si tienes tos, gripe o alergias. Común en trenes y lugares concurridos.',
          importance: 'medium',
          doExample: 'Lleva mascarillas en tu mochila por si acaso',
          dontExample: 'No tosas o estornudes sin cubrirte'
        }
      ],

      dining: [
        {
          title: 'Palillos - 箸 (hashi)',
          icon: '🥢',
          rule: 'Nunca claves palillos verticalmente en el arroz',
          details: 'Esto se hace solo en funerales. Tampoco pases comida de palillos a palillos.',
          importance: 'critical',
          doExample: 'Apoya los palillos en el hashioki (soporte)',
          dontExample: 'NUNCA: palillos verticales en arroz = funeral'
        },
        {
          title: 'Itadakimasu - いただきます',
          icon: '🙏',
          rule: 'Di "itadakimasu" antes de comer',
          details: 'Junta las manos y di "itadakimasu" (いただきます) antes de empezar. Significa "humildemente recibo". Al terminar di "gochisousama deshita" (ごちそうさまでした).',
          importance: 'high',
          doExample: 'Di itadakimasu incluso solo en un konbini',
          dontExample: 'No empieces a comer sin decir nada'
        },
        {
          title: 'Slurping - ズルズル',
          icon: '🍜',
          rule: 'Sorber ramen/soba es CORRECTO y educado',
          details: 'Hacer ruido al comer fideos muestra que disfrutas la comida. Es totalmente aceptable.',
          importance: 'medium',
          doExample: 'Sorbe tus fideos con entusiasmo',
          dontExample: 'No comas ramen en silencio completo'
        },
        {
          title: 'Propinas - チップ',
          icon: '💴',
          rule: 'NO des propina - es considerado ofensivo',
          details: 'El servicio excelente está incluido. Dar propina implica que necesitan caridad.',
          importance: 'critical',
          doExample: 'Di "arigato gozaimasu" como agradecimiento',
          dontExample: 'NUNCA dejes dinero extra en la mesa'
        }
      ],

      temples: [
        {
          title: 'Purificación - 手水',
          icon: '⛲',
          rule: 'Purif ícate en el temizuya antes de entrar',
          details: 'Toma el cazo con mano derecha, enjuaga la izquierda. Cambia de mano, enjuaga la derecha. Vierte agua en la mano izquierda para enjuagar la boca. Nunca toques el cazo con la boca.',
          importance: 'high',
          doExample: 'Observa a otros y sigue el ritual completo',
          dontExample: 'No bebas directamente del cazo'
        },
        {
          title: 'Fotografías - 写真',
          icon: '📸',
          rule: 'Revisa los signos - muchos interiores prohíben fotos',
          details: 'Especialmente en templos con estatuas sagradas o áreas de oración.',
          importance: 'high',
          doExample: 'Pregunta "shashin wa ii desu ka?" (¿puedo tomar fotos?)',
          dontExample: 'No uses flash en interiores de templos'
        },
        {
          title: 'Reverencia - 参拝',
          icon: '🙏',
          rule: 'En santuarios: inclínate 2 veces, aplaude 2 veces, inclínate 1 vez',
          details: 'Ritual 2-2-1: Dos arcos, dos aplausos, un arco final.',
          importance: 'medium',
          doExample: 'Observa a los locales y sigue su ritmo',
          dontExample: 'No te saltes el ritual si vas a orar'
        }
      ],

      transport: [
        {
          title: 'Silencio en Trenes - 静か',
          icon: '🤫',
          rule: 'Habla en voz baja o silencia tu teléfono',
          details: 'Los trenes son lugares tranquilos. Llamadas telefónicas son muy mal vistas.',
          importance: 'high',
          doExample: 'Usa auriculares y mantén conversaciones en susurros',
          dontExample: 'No contestes llamadas ni hables alto'
        },
        {
          title: 'Fila de Subida - 整列',
          icon: '👥',
          rule: 'Forma filas a los lados de las puertas',
          details: 'Deja que la gente baje primero. Fórmate en las marcas del piso.',
          importance: 'high',
          doExample: 'Espera a los lados, deja bajar, luego sube',
          dontExample: 'No te metas antes de que bajen todos'
        },
        {
          title: 'Asientos Prioritarios - 優先席',
          icon: '♿',
          rule: 'Cede asientos prioritarios (azules/plateados)',
          details: 'Para embarazadas, ancianos, discapacitados. Son los cercanos a las puertas.',
          importance: 'high',
          doExample: 'Levántate si ves alguien que lo necesita',
          dontExample: 'No ocupes asientos prioritarios si hay gente de pie'
        }
      ],

      onsen: [
        {
          title: 'Tatuajes - 入れ墨',
          icon: '🚫',
          rule: 'Muchos onsens prohíben tatuajes (asociados a yakuza)',
          details: 'Algunos permiten cubrir tatuajes pequeños con parches. Busca "tatuaje OK" (刺青OK).',
          importance: 'critical',
          doExample: 'Investiga onsens "tattoo-friendly" antes de ir',
          dontExample: 'No intentes entrar sin preguntar si hay tatuajes'
        },
        {
          title: 'Desnudez Total - 裸',
          icon: '🧖',
          rule: 'Debes estar completamente desnudo (sin traje de baño)',
          details: 'Solo llevas una toalla pequeña para secar/cubrir al caminar. NO la metas al agua.',
          importance: 'critical',
          doExample: 'Lávate completamente antes de entrar al onsen',
          dontExample: 'NUNCA entres con ropa interior o traje de baño'
        },
        {
          title: 'Lavado Previo - 洗う',
          icon: '🚿',
          rule: 'Lávate COMPLETAMENTE antes de entrar al baño',
          details: 'Usa las duchas/grifos proporcionados. Jabón y enjuaga TODO tu cuerpo.',
          importance: 'critical',
          doExample: 'Siéntate en los banquitos y lávate bien',
          dontExample: 'NUNCA entres al agua sin lavarte primero'
        }
      ]
    };

    // Essential phrases with context
    this.phrases = {
      greetings: [
        { japanese: 'おはようございます', romaji: 'Ohayou gozaimasu', english: 'Buenos días (formal)', context: 'Hasta las 10am' },
        { japanese: 'こんにちは', romaji: 'Konnichiwa', english: 'Buenas tardes', context: '10am - 6pm' },
        { japanese: 'こんばんは', romaji: 'Konbanwa', english: 'Buenas noches', context: 'Después de 6pm' },
        { japanese: 'おやすみなさい', romaji: 'Oyasuminasai', english: 'Buenas noches (al dormir)', context: 'Al ir a dormir' }
      ],

      gratitude: [
        { japanese: 'ありがとうございます', romaji: 'Arigatou gozaimasu', english: 'Muchas gracias (formal)', context: 'Situación formal' },
        { japanese: 'どうもありがとう', romaji: 'Doumo arigatou', english: 'Muchas gracias (casual)', context: 'Con amigos' },
        { japanese: 'すみません', romaji: 'Sumimasen', english: 'Disculpe / Gracias', context: 'Multi-uso importante' },
        { japanese: 'ごちそうさまでした', romaji: 'Gochisousama deshita', english: 'Gracias por la comida', context: 'Después de comer' }
      ],

      dining: [
        { japanese: 'いただきます', romaji: 'Itadakimasu', english: 'Buen provecho (literal: recibo humildemente)', context: 'Antes de comer' },
        { japanese: 'お水をください', romaji: 'O-mizu wo kudasai', english: 'Agua por favor', context: 'En restaurantes' },
        { japanese: 'お会計お願いします', romaji: 'O-kaikei onegaishimasu', english: 'La cuenta por favor', context: 'Para pagar' },
        { japanese: 'おいしい!', romaji: 'Oishii!', english: 'Delicioso!', context: 'Elogio genuino' },
        { japanese: 'これをください', romaji: 'Kore wo kudasai', english: 'Esto por favor', context: 'Señalando en menú' }
      ],

      emergencies: [
        { japanese: '助けて!', romaji: 'Tasukete!', english: 'Ayuda!', context: 'Emergencia' },
        { japanese: '英語を話せますか?', romaji: 'Eigo wo hanasemasu ka?', english: '¿Habla inglés?', context: 'Buscar ayuda' },
        { japanese: '病院はどこですか?', romaji: 'Byouin wa doko desu ka?', english: '¿Dónde está el hospital?', context: 'Emergencia médica' },
        { japanese: '警察を呼んでください', romaji: 'Keisatsu wo yonde kudasai', english: 'Llame a la policía', context: 'Emergencia seguridad' }
      ],

      shopping: [
        { japanese: 'いくらですか?', romaji: 'Ikura desu ka?', english: '¿Cuánto cuesta?', context: 'Preguntar precio' },
        { japanese: '見てるだけです', romaji: 'Miteru dake desu', english: 'Solo estoy mirando', context: 'Al entrar a tienda' },
        { japanese: 'これ試してもいいですか?', romaji: 'Kore tameshite mo ii desu ka?', english: '¿Puedo probarme esto?', context: 'Ropa' },
        { japanese: 'ちょっと考えます', romaji: 'Chotto kangaemasu', english: 'Déjame pensarlo', context: 'Rechazar cortésmente' }
      ]
    };

    // Festival calendar
    this.festivals = [
      {
        name: 'Hanami - 花見 (Cherry Blossoms)',
        icon: '🌸',
        months: [3, 4],
        peakWeeks: 'Late March - Early April',
        description: 'Contemplación de sakura (cerezos). Picnics bajo los árboles en parques',
        bestPlaces: ['Parque Ueno (Tokyo)', 'Philosopher\'s Path (Kyoto)', 'Parque del Castillo de Osaka'],
        tips: 'Reserva hanami spots temprano. Lleva lona, comida de konbini, sake'
      },
      {
        name: 'Golden Week - ゴールデンウィーク',
        icon: '🎌',
        months: [4, 5],
        peakWeeks: 'April 29 - May 5',
        description: 'Semana de festivos nacionales consecutivos',
        bestPlaces: ['En TODAS partes'],
        tips: '⚠️ EVITA viajar en estas fechas. Precios altos, multitudes extremas, reservas imposibles'
      },
      {
        name: 'Tanabata - 七夕 (Festival de Estrellas)',
        icon: '🎋',
        months: [7],
        peakWeeks: 'July 7',
        description: 'Festival de las estrellas. Escribe deseos en tanzaku (papel)',
        bestPlaces: ['Sendai (más grande)', 'Hiratsuka', 'Asagaya (Tokyo)'],
        tips: 'Escribe tu deseo en japonés si puedes. Decoraciones hermosas en la noche'
      },
      {
        name: 'Obon - お盆',
        icon: '🏮',
        months: [8],
        peakWeeks: 'Mid-August (13-16)',
        description: 'Festival de los ancestros. Muchos japoneses viajan a sus pueblos',
        bestPlaces: ['Kyoto (Gozan no Okuribi - fogatas en montañas)'],
        tips: '⚠️ Transporte muy lleno. Reserva con anticipación'
      },
      {
        name: 'Koyo - 紅葉 (Autumn Leaves)',
        icon: '🍁',
        months: [10, 11],
        peakWeeks: 'Late October - November',
        description: 'Contemplación de momiji (arces rojos). Colores otoñales',
        bestPlaces: ['Nikko', 'Kyoto (Tofukuji)', 'Kamakura'],
        tips: 'Similar a hanami pero con hojas rojas/doradas. Menos crowded'
      },
      {
        name: 'Año Nuevo - お正月 (Oshogatsu)',
        icon: '🎍',
        months: [1],
        peakWeeks: 'January 1-3',
        description: 'Festival más importante. Visita a templos (hatsumode)',
        bestPlaces: ['Meiji Jingu (Tokyo)', 'Fushimi Inari (Kyoto)'],
        tips: '⚠️ Muchas tiendas cerradas 1-3 de enero. Templos muy llenos'
      }
    ];

    // Cultural taboos and do's/don'ts
    this.taboos = [
      {
        category: 'Critical Taboos',
        icon: '🚫',
        items: [
          { dont: 'Clavar palillos verticalmente en arroz', because: 'Es gesto funerario', severity: 'critical' },
          { dont: 'Entrar con zapatos a tatami o casas', because: 'Tatami es sagrado y caro', severity: 'critical' },
          { dont: 'Dar propinas', because: 'Es insultante (implica caridad)', severity: 'critical' },
          { dont: 'Señalar con dedos a personas', because: 'Es grosero', severity: 'high' },
          { dont: 'Hablar alto en trenes', because: 'Rompe la armonía social', severity: 'high' }
        ]
      },
      {
        category: 'Social Courtesies',
        icon: '🙇',
        items: [
          { do: 'Inclínate al saludar y agradecer', because: 'Muestra respeto', severity: 'high' },
          { do: 'Di "sumimasen" frecuentemente', because: 'Es palabra mágica multi-uso', severity: 'high' },
          { do: 'Quítate zapatos sin que te lo pidan', because: 'Demuestra que conoces la cultura', severity: 'medium' },
          { do: 'Sorbe fideos ruidosamente', because: 'Muestra que te gusta la comida', severity: 'low' },
          { do: 'Espera tu turno en filas', because: 'Orden es esencial en Japón', severity: 'high' }
        ]
      }
    ];

    console.log('⛩️ Cultural Knowledge System initialized');
  }

  /**
   * Get etiquette rules by category
   */
  getEtiquette(category = 'all') {
    if (category === 'all') {
      return this.etiquette;
    }
    return this.etiquette[category] || [];
  }

  /**
   * Get phrases by category
   */
  getPhrases(category = 'all') {
    if (category === 'all') {
      return this.phrases;
    }
    return this.phrases[category] || [];
  }

  /**
   * Get festivals for a specific month
   */
  getFestivalsForMonth(month) {
    return this.festivals.filter(f => f.months.includes(month));
  }

  /**
   * Get current season's festivals
   */
  getCurrentSeasonFestivals() {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    return this.getFestivalsForMonth(month);
  }

  /**
   * Get contextual tips based on situation
   */
  getContextualTips(situation) {
    const tips = {
      restaurant: [
        'Di "itadakimasu" antes de comer',
        'NO des propina',
        'Sorber fideos es correcto',
        'Usa el oshibori (toalla húmeda) para manos solamente'
      ],
      temple: [
        'Purific ate en el temizuya (fuente)',
        'Arco 2-2-1 en santuarios',
        'No fotografíes si hay señal prohibida',
        'Habla en voz baja'
      ],
      train: [
        'Silencia tu teléfono',
        'No comas ni bebas (excepto agua)',
        'Forma fila a los lados de puertas',
        'Cede asientos prioritarios'
      ],
      shopping: [
        'Di "sumimasen" al entrar',
        'No regatees (excepto en mercados antiguos)',
        'Tax-free disponible >5000 yen con pasaporte',
        'Muchas tiendas cierran temprano (8pm)'
      ]
    };

    return tips[situation] || [];
  }

  /**
   * Search cultural knowledge
   */
  search(query) {
    query = query.toLowerCase();
    const results = [];

    // Search etiquette
    Object.entries(this.etiquette).forEach(([category, rules]) => {
      rules.forEach(rule => {
        if (
          rule.title.toLowerCase().includes(query) ||
          rule.rule.toLowerCase().includes(query) ||
          rule.details.toLowerCase().includes(query)
        ) {
          results.push({ type: 'etiquette', category, data: rule });
        }
      });
    });

    // Search phrases
    Object.entries(this.phrases).forEach(([category, phrases]) => {
      phrases.forEach(phrase => {
        if (
          phrase.romaji.toLowerCase().includes(query) ||
          phrase.english.toLowerCase().includes(query) ||
          phrase.japanese.includes(query)
        ) {
          results.push({ type: 'phrase', category, data: phrase });
        }
      });
    });

    // Search festivals
    this.festivals.forEach(festival => {
      if (
        festival.name.toLowerCase().includes(query) ||
        festival.description.toLowerCase().includes(query)
      ) {
        results.push({ type: 'festival', data: festival });
      }
    });

    return results;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.CulturalKnowledge = new CulturalKnowledge();
  console.log('⛩️ Cultural Knowledge System loaded!');
}
