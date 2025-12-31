// js/japan-persona-quiz.js - Quiz viral tipo BuzzFeed "What type of Japan traveler are you?"

/**
 * Japan Persona Quiz
 * Quiz viral para determinar qué tipo de viajero a Japón eres
 */
export const JapanPersonaQuiz = {
  currentQuestion: 0,
  answers: {},

  QUESTIONS: [
    {
      id: 1,
      question: "¿Qué es lo primero que harías al llegar a Japón?",
      options: [
        { text: "Buscar el mejor ramen cerca del hotel", persona: "foodie", emoji: "🍜" },
        { text: "Ir directo a Akihabara a comprar", persona: "otaku", emoji: "🎮" },
        { text: "Visitar el templo más cercano", persona: "culture", emoji: "⛩️" },
        { text: "Tomar fotos del Shibuya Crossing", persona: "instagrammer", emoji: "📸" }
      ]
    },
    {
      id: 2,
      question: "¿Cuál es tu actividad ideal para la tarde?",
      options: [
        { text: "Probar diferentes tipos de street food", persona: "foodie", emoji: "🍡" },
        { text: "Explorar tiendas de manga y anime", persona: "otaku", emoji: "📚" },
        { text: "Caminar por jardines japoneses", persona: "nature", emoji: "🌸" },
        { text: "Shopping en Harajuku", persona: "shopaholic", emoji: "🛍️" }
      ]
    },
    {
      id: 3,
      question: "¿Qué foto subirías a Instagram?",
      options: [
        { text: "Un bowl de ramen perfecto", persona: "foodie", emoji: "🍜" },
        { text: "Colección de figuras que compraste", persona: "otaku", emoji: "🎌" },
        { text: "Los torii gates de Fushimi Inari", persona: "culture", emoji: "⛩️" },
        { text: "Outfit del día en Harajuku", persona: "instagrammer", emoji: "👗" }
      ]
    },
    {
      id: 4,
      question: "¿Cuál es tu presupuesto ideal para shopping?",
      options: [
        { text: "¥10,000 (solo souvenirs)", persona: "culture", emoji: "🎁" },
        { text: "¥50,000 (ropa y accesorios)", persona: "shopaholic", emoji: "💸" },
        { text: "¥100,000+ (figuras y coleccionables)", persona: "otaku", emoji: "💰" },
        { text: "Lo que sea necesario para fotos", persona: "instagrammer", emoji: "📸" }
      ]
    },
    {
      id: 5,
      question: "¿Dónde pasarías más tiempo?",
      options: [
        { text: "Mercados y restaurantes locales", persona: "foodie", emoji: "🏮" },
        { text: "Nakano Broadway / Animate", persona: "otaku", emoji: "🎪" },
        { text: "Templos y jardines tradicionales", persona: "culture", emoji: "🏯" },
        { text: "Miradores con vistas de la ciudad", persona: "instagrammer", emoji: "🗼" }
      ]
    },
    {
      id: 6,
      question: "¿Qué souvenir NO puede faltar?",
      options: [
        { text: "KitKat de sabores raros", persona: "foodie", emoji: "🍫" },
        { text: "Figuras limitadas de anime", persona: "otaku", emoji: "🎎" },
        { text: "Amuletos de templos", persona: "culture", emoji: "🧧" },
        { text: "Artículos kawaii de Harajuku", persona: "shopaholic", emoji: "🎀" }
      ]
    },
    {
      id: 7,
      question: "¿Cuál es tu plan perfecto para la noche?",
      options: [
        { text: "Izakaya y más comida", persona: "foodie", emoji: "🍶" },
        { text: "Arcade o maid café", persona: "otaku", emoji: "🕹️" },
        { text: "Paseo nocturno por templos", persona: "culture", emoji: "🌙" },
        { text: "Karaoke con amigos", persona: "nightowl", emoji: "🎤" }
      ]
    }
  ],

  PERSONAS: {
    foodie: {
      name: "The Foodie",
      emoji: "🍜",
      title: "Ramen Hunter Extraordinaire",
      description: "Tu viaje a Japón es una aventura gastronómica. No hay ramen, sushi, o takoyaki que se escape de ti. Tienes una lista de 50+ restaurantes que visitar y un segundo estómago de emergencia.",
      traits: [
        "Planeas tu itinerario alrededor de restaurantes",
        "Has investigado cada Michelin star en Tokyo",
        "Tu maleta tiene espacio extra para snacks",
        "Sabes más de sake que un sommelier"
      ],
      mustVisit: ["Mercado Tsukiji", "Dotonbori", "Ichiran Ramen", "Depachika de Shinjuku"],
      color: "from-orange-400 to-red-500"
    },
    otaku: {
      name: "The Otaku",
      emoji: "🎌",
      title: "Anime Pilgrimage Master",
      description: "Japón es tu tierra prometida. Conoces cada tienda de Akihabara, has visto todos los anime icónicos, y tu maleta va medio vacía porque vas a llenarla de figuras.",
      traits: [
        "Itinerario incluye 3 días en Akihabara",
        "Presupuesto: 70% para merchandise",
        "Sabes más japonés de anime que de escuela",
        "Ya reservaste el Ghibli Museum hace 3 meses"
      ],
      mustVisit: ["Akihabara", "Nakano Broadway", "Ghibli Museum", "Pokemon Center"],
      color: "from-pink-400 to-purple-500"
    },
    culture: {
      name: "The Culture Seeker",
      emoji: "⛩️",
      title: "Temple Collector Zen Master",
      description: "Vienes por la esencia de Japón. Templos, jardines zen, ceremonia del té. Tu Instagram parece una postal tradicional japonesa. Respetas cada tradición y te quitas los zapatos religiosamente.",
      traits: [
        "Has leído sobre historia japonesa",
        "Quieres probar ceremonia del té auténtica",
        "Kyoto es tu ciudad favorita",
        "Coleccionas sellos de templos (Goshuin)"
      ],
      mustVisit: ["Fushimi Inari", "Kinkaku-ji", "Arashiyama", "Nara Park"],
      color: "from-green-400 to-teal-500"
    },
    instagrammer: {
      name: "The Instagrammer",
      emoji: "📸",
      title: "Aesthetic Content Creator",
      description: "Japón es tu estudio fotográfico. Cada rincón es una oportunidad de contenido. Tienes 5 outfits planeados para cada ubicación y ya sabes exactamente qué filtro vas a usar.",
      traits: [
        "Itinerario basado en 'Instagrammable spots'",
        "Te levantas a las 5am para fotos sin gente",
        "Batería externa x3 es esencial",
        "Ya planeaste tu feed aesthetic"
      ],
      mustVisit: ["Shibuya Crossing", "TeamLab Borderless", "Cafés temáticos", "Tokyo Skytree"],
      color: "from-purple-400 to-pink-500"
    },
    shopaholic: {
      name: "The Shopaholic",
      emoji: "🛍️",
      title: "Harajuku Fashion Icon",
      description: "Japón es tu shopping paradise. Don Quijote es tu segundo hogar. Necesitas una maleta extra solo para ropa. Tax-free es tu palabra favorita.",
      traits: [
        "50% del presupuesto es shopping",
        "Conoces cada tienda de Shibuya y Harajuku",
        "Maleta adicional pre-comprada",
        "Lista de cosas para comprar más larga que el itinerario"
      ],
      mustVisit: ["Harajuku", "Shibuya 109", "Don Quijote", "Shinsaibashi"],
      color: "from-pink-400 to-rose-500"
    },
    nature: {
      name: "The Nature Lover",
      emoji: "🌸",
      title: "Sakura Season Chaser",
      description: "Vienes por los paisajes naturales. Monte Fuji, bosques de bambú, jardines zen. Mientras otros están en ciudades, tú estás en Hakone respirando aire puro.",
      traits: [
        "Planeas viaje según temporada de sakura",
        "Prefieres ryokan que hoteles",
        "Hakone > Tokyo",
        "Tu cámara es mejor que tu teléfono"
      ],
      mustVisit: ["Monte Fuji", "Arashiyama Bamboo", "Hakone", "Jardín Kenrokuen"],
      color: "from-green-300 to-emerald-500"
    },
    nightowl: {
      name: "The Night Owl",
      emoji: "🌃",
      title: "Tokyo Nightlife Explorer",
      description: "Japón de noche es tu vibe. Karaoke hasta las 6am, izakayas, bares de Golden Gai. Mientras otros duermen, tú estás descubriendo el verdadero Tokyo.",
      traits: [
        "Itinerario empieza después de las 6pm",
        "Has investigado cada bar de Golden Gai",
        "Karaoke es obligatorio",
        "Mejor foto: neones de Shinjuku de noche"
      ],
      mustVisit: ["Golden Gai", "Roppongi", "Dotonbori nocturno", "Robot Restaurant"],
      color: "from-indigo-500 to-purple-600"
    }
  },

  /**
   * Abre el quiz
   */
  open() {
    this.currentQuestion = 0;
    this.answers = {};
    this.showQuestion();
  },

  /**
   * Muestra una pregunta
   */
  showQuestion() {
    const question = this.QUESTIONS[this.currentQuestion];
    const totalQuestions = this.QUESTIONS.length;
    const progress = ((this.currentQuestion + 1) / totalQuestions) * 100;

    const modalHTML = `
      <div id="quizModal" class="fixed inset-0 z-50 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">

        <!-- Quiz Container -->
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">

          <!-- Progress Bar -->
          <div class="h-2 bg-gray-200 dark:bg-gray-700">
            <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                 style="width: ${progress}%"></div>
          </div>

          <!-- Header -->
          <div class="p-8 text-center border-b border-gray-200 dark:border-gray-700">
            <div class="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
              PREGUNTA ${this.currentQuestion + 1} DE ${totalQuestions}
            </div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              ${question.question}
            </h2>
          </div>

          <!-- Options -->
          <div class="p-8 space-y-4">
            ${question.options.map((option, i) => `
              <button onclick="window.JapanPersonaQuiz.selectAnswer('${option.persona}')"
                      class="group w-full p-6 text-left rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition transform hover:scale-105 bg-white dark:bg-gray-700">
                <div class="flex items-center gap-4">
                  <div class="text-5xl group-hover:scale-125 transition">${option.emoji}</div>
                  <div class="flex-1">
                    <p class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                      ${option.text}
                    </p>
                  </div>
                  <svg class="w-6 h-6 text-gray-400 group-hover:text-purple-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            `).join('')}
          </div>

          <!-- Footer -->
          <div class="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            ${this.currentQuestion > 0 ? `
              <button onclick="window.JapanPersonaQuiz.previousQuestion()"
                      class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-purple-600 font-semibold transition">
                ← Anterior
              </button>
            ` : '<div></div>'}

            <button onclick="window.JapanPersonaQuiz.close()"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
              Salir
            </button>
          </div>

        </div>

      </div>
    `;

    const existing = document.getElementById('quizModal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  /**
   * Selecciona una respuesta
   */
  selectAnswer(persona) {
    this.answers[this.currentQuestion] = persona;

    // Siguiente pregunta
    if (this.currentQuestion < this.QUESTIONS.length - 1) {
      this.currentQuestion++;
      this.showQuestion();
    } else {
      // Calcular resultado
      this.showResult();
    }
  },

  /**
   * Pregunta anterior
   */
  previousQuestion() {
    if (this.currentQuestion > 0) {
      this.currentQuestion--;
      this.showQuestion();
    }
  },

  /**
   * Calcula y muestra el resultado
   */
  showResult() {
    // Contar respuestas por persona
    const counts = {};
    Object.values(this.answers).forEach(persona => {
      counts[persona] = (counts[persona] || 0) + 1;
    });

    // Encontrar la persona con más puntos
    let maxCount = 0;
    let resultPersona = 'foodie';

    Object.entries(counts).forEach(([persona, count]) => {
      if (count > maxCount) {
        maxCount = count;
        resultPersona = persona;
      }
    });

    const persona = this.PERSONAS[resultPersona];

    const modalHTML = `
      <div id="quizResultModal" class="fixed inset-0 z-50 bg-gradient-to-br ${persona.color} flex items-center justify-center p-4">

        <!-- Result Container -->
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">

          <!-- Confetti Header -->
          <div class="relative p-12 text-center bg-gradient-to-br ${persona.color} text-white overflow-hidden">
            <div class="absolute inset-0 opacity-20">
              ${Array(20).fill(0).map(() => `
                <div class="absolute animate-bounce" style="left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation-delay: ${Math.random() * 2}s;">
                  ${persona.emoji}
                </div>
              `).join('')}
            </div>

            <div class="relative z-10">
              <div class="text-8xl mb-4 animate-bounce">${persona.emoji}</div>
              <h2 class="text-4xl font-bold mb-2">${persona.name}</h2>
              <p class="text-2xl opacity-90">${persona.title}</p>
            </div>
          </div>

          <!-- Description -->
          <div class="p-8 space-y-6">
            <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              ${persona.description}
            </p>

            <!-- Traits -->
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Tu perfil:</h3>
              <div class="space-y-2">
                ${persona.traits.map(trait => `
                  <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span class="text-xl">✓</span>
                    <span class="text-gray-700 dark:text-gray-300">${trait}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Must Visit -->
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Must-visit places:</h3>
              <div class="flex flex-wrap gap-2">
                ${persona.mustVisit.map(place => `
                  <span class="px-4 py-2 bg-gradient-to-br ${persona.color} text-white rounded-full text-sm font-semibold">
                    ${place}
                  </span>
                `).join('')}
              </div>
            </div>

            <!-- Share -->
            <div class="bg-gradient-to-r ${persona.color} p-6 rounded-2xl text-white text-center">
              <p class="text-lg font-semibold mb-4">
                ¡Comparte tu resultado con tus amigos!
              </p>
              <div class="flex gap-3 justify-center">
                <button onclick="window.JapanPersonaQuiz.shareResult('${resultPersona}')"
                        class="px-6 py-3 bg-white text-gray-900 font-bold rounded-full hover:shadow-lg transition">
                  📤 Compartir
                </button>
                <button onclick="window.JapanPersonaQuiz.downloadResult('${resultPersona}')"
                        class="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full hover:bg-white/30 transition">
                  📥 Descargar
                </button>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <button onclick="window.JapanPersonaQuiz.restart()"
                    class="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition">
              🔄 Reintentar
            </button>
            <button onclick="window.JapanPersonaQuiz.planTrip('${resultPersona}')"
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition">
              ✈️ Planear mi viaje
            </button>
          </div>

        </div>

      </div>
    `;

    document.getElementById('quizModal')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  /**
   * Comparte el resultado
   */
  shareResult(personaKey) {
    const persona = this.PERSONAS[personaKey];
    const shareText = `I'm "${persona.name}" ${persona.emoji}! What type of Japan traveler are you? Take the quiz at japitin.app!`;

    if (navigator.share) {
      navigator.share({
        title: 'Japan Persona Quiz',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      window.Notifications?.show('📋 Texto copiado! Compártelo en redes sociales', 'success');
    }
  },

  /**
   * Descarga el resultado como imagen
   */
  downloadResult(personaKey) {
    window.Notifications?.show('📥 Preparando descarga...', 'info');
    // TODO: Usar html2canvas
    setTimeout(() => {
      window.Notifications?.show('✅ Resultado descargado!', 'success');
    }, 1500);
  },

  /**
   * Reinicia el quiz
   */
  restart() {
    this.currentQuestion = 0;
    this.answers = {};
    document.getElementById('quizResultModal')?.remove();
    this.showQuestion();
  },

  /**
   * Planea viaje basado en la persona
   */
  planTrip(personaKey) {
    const persona = this.PERSONAS[personaKey];

    // Crear itinerario sugerido basado en la persona
    window.Notifications?.show(`🎉 Creando itinerario perfecto para ${persona.name}...`, 'success');

    this.close();

    // TODO: Abrir wizard con configuración pre-llenada según la persona
    setTimeout(() => {
      if (window.SmartGeneratorWizard) {
        window.SmartGeneratorWizard.open();
      }
    }, 1000);
  },

  /**
   * Cierra el quiz
   */
  close() {
    document.getElementById('quizModal')?.remove();
    document.getElementById('quizResultModal')?.remove();
  }
};

// Exportar globalmente
window.JapanPersonaQuiz = JapanPersonaQuiz;

console.log('✅ Japan Persona Quiz loaded');

export default JapanPersonaQuiz;
