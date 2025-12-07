/* ========================================
   TRAVELER PROFILER - Sistema de Perfilado Inteligente
   ======================================== */

/**
 * Sistema que crea un perfil completo del viajero
 * basado en un cuestionario de 2 minutos
 */

export class TravelerProfiler {
  constructor() {
    this.profile = this.getDefaultProfile();
  }

  getDefaultProfile() {
    return {
      // Perfil de grupo
      groupSize: 1,
      groupType: 'solo', // solo, couple, family, friends, large-group
      ages: [25], // Edades de los viajeros

      // Presupuesto
      budget: {
        total: 0,
        perDay: 0,
        category: 'medium' // ultra-low, backpacker, medium, comfort, luxury, unlimited
      },

      // Ritmo de viaje
      pace: 'moderate', // relaxed, moderate, intense

      // Intereses (0-10)
      interests: {
        culture: 5,        // 🏯 Templos, museos, tradiciones
        food: 5,           // 🍜 Gastronomía
        nature: 5,         // 🌸 Jardines, montañas, onsen
        popCulture: 5,     // 🎮 Anime, manga, gaming
        shopping: 5,       // 🛍️ Compras
        nightlife: 5,      // 🌃 Vida nocturna
        art: 5,            // 🎨 Arte y diseño
        adventure: 5,      // 🏃 Aventura, deportes
        photography: 5,    // 📸 Lugares fotogénicos
        relaxation: 5      // 🧘 Relax, bienestar
      },

      // Preferencias especiales
      preferences: {
        avoidCrowds: false,
        timeOfDay: 'balanced', // morning, evening, balanced
        dietary: 'flexible',   // flexible, vegetarian, vegan, halal, kosher
        mobility: 'full',      // full, limited
        firstTimeJapan: true
      },

      // Calculado
      topInterests: [],
      travelStyle: '',
      recommendations: {}
    };
  }

  /**
   * Mostrar cuestionario modal
   */
  async showQuestionnaire() {
    return new Promise((resolve) => {
      const modal = this.createQuestionnaireModal(resolve);
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';
    });
  }

  /**
   * Crear modal de cuestionario
   */
  createQuestionnaireModal(onComplete) {
    const modal = document.createElement('div');
    modal.id = 'travelerProfilerModal';
    modal.className = 'modal active';
    modal.style.zIndex = '10002';

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white p-6 rounded-t-xl z-10">
          <h2 class="text-3xl font-bold flex items-center gap-3">
            🎯 Personaliza tu Viaje Perfecto
          </h2>
          <p class="text-sm text-white/90 mt-2">Solo 2 minutos para crear un itinerario hecho a tu medida</p>
        </div>

        <!-- Progress Bar -->
        <div class="bg-gray-200 dark:bg-gray-700 h-2">
          <div id="questionnaireProgress" class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 transition-all duration-300" style="width: 0%"></div>
        </div>

        <!-- Questions Container -->
        <div class="p-6 space-y-8" id="questionsContainer">
          ${this.renderQuestions()}
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between">
          <button
            onclick="document.getElementById('travelerProfilerModal').remove(); document.body.style.overflow = 'auto';"
            class="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 transition font-semibold"
          >
            Cancelar
          </button>
          <button
            id="completeProfileBtn"
            class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold flex items-center gap-2"
          >
            <span>✨</span>
            <span>Generar Mi Itinerario Perfecto</span>
          </button>
        </div>
      </div>
    `;

    // Event listeners
    const completeBtn = modal.querySelector('#completeProfileBtn');
    completeBtn.addEventListener('click', () => {
      this.collectAnswers();
      this.analyzeProfile();
      modal.remove();
      document.body.style.overflow = 'auto';
      onComplete(this.profile);
    });

    // Update progress on input changes
    modal.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('change', () => this.updateProgress());
    });

    return modal;
  }

  /**
   * Renderizar preguntas del cuestionario
   */
  renderQuestions() {
    return `
      <!-- Sección 1: Perfil de Grupo -->
      <div class="question-section">
        <h3 class="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
          👥 <span>¿Quién viaja?</span>
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">¿Cuántas personas?</label>
            <input
              type="number"
              id="groupSize"
              min="1"
              max="20"
              value="1"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Tipo de grupo</label>
            <select
              id="groupType"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="solo">🚶 Viajo solo/a</option>
              <option value="couple">💑 Pareja</option>
              <option value="family">👨‍👩‍👧‍👦 Familia con niños</option>
              <option value="friends">👫 Amigos</option>
              <option value="large-group">👥 Grupo grande (5+)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Rango de edad principal</label>
            <select
              id="ageRange"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="18-25">18-25 años</option>
              <option value="26-35">26-35 años</option>
              <option value="36-50">36-50 años</option>
              <option value="51-65">51-65 años</option>
              <option value="66+">66+ años</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Sección 2: Presupuesto -->
      <div class="question-section">
        <h3 class="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
          💰 <span>Presupuesto</span>
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Presupuesto total del viaje (¥)</label>
            <input
              type="number"
              id="totalBudget"
              min="0"
              step="10000"
              placeholder="500000"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <p class="text-xs text-gray-500 mt-1">Aproximadamente ¥50,000-100,000 por día por persona</p>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Categoría de presupuesto</label>
            <select
              id="budgetCategory"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="ultra-low">💸 Ultra Low (Couchsurfing, konbini)</option>
              <option value="backpacker">🎒 Backpacker (Hostales, comida económica)</option>
              <option value="medium" selected>🏨 Medio (Hoteles modestos, mix de comidas)</option>
              <option value="comfort">⭐ Confort (Buenos hoteles, buenos restaurantes)</option>
              <option value="luxury">💎 Lujo (Ryokans, Michelin, experiencias premium)</option>
              <option value="unlimited">♾️ Sin límite</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Sección 3: Ritmo de Viaje -->
      <div class="question-section">
        <h3 class="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
          ⚡ <span>Ritmo de Viaje</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${this.renderPaceOptions()}
        </div>
      </div>

      <!-- Sección 4: Intereses (LA MÁS IMPORTANTE) -->
      <div class="question-section">
        <h3 class="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
          ❤️ <span>¿Qué te interesa más?</span>
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Califica cada categoría de 0 a 10 (0 = nada interesado, 10 = muy interesado)
        </p>

        <div class="space-y-4">
          ${this.renderInterestSliders()}
        </div>
      </div>

      <!-- Sección 5: Preferencias Especiales -->
      <div class="question-section">
        <h3 class="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
          🎲 <span>Preferencias Especiales</span>
        </h3>

        <div class="space-y-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" id="avoidCrowds" class="w-5 h-5">
            <span class="dark:text-gray-300">Evitar multitudes (priorizar horarios/lugares menos concurridos)</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" id="firstTime" checked class="w-5 h-5">
            <span class="dark:text-gray-300">Es mi primera vez en Japón</span>
          </label>

          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Preferencia de horario</label>
            <select
              id="timeOfDay"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="morning">🌅 Mañanas (Madrugador)</option>
              <option value="balanced" selected>☀️ Balanceado</option>
              <option value="evening">🌙 Tardes/Noches (Noctámbulo)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Restricciones alimentarias</label>
            <select
              id="dietary"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="flexible" selected>Ninguna (Como de todo)</option>
              <option value="vegetarian">Vegetariano</option>
              <option value="vegan">Vegano</option>
              <option value="halal">Halal</option>
              <option value="kosher">Kosher</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2 dark:text-gray-300">Movilidad</label>
            <select
              id="mobility"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="full" selected>Movilidad completa</option>
              <option value="limited">Movilidad reducida (necesito accesibilidad)</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderizar opciones de ritmo de viaje
   */
  renderPaceOptions() {
    const paces = [
      {
        id: 'relaxed',
        name: 'Relajado',
        icon: '🏖️',
        description: '2-3 actividades/día, mucho tiempo libre',
        color: 'blue'
      },
      {
        id: 'moderate',
        name: 'Moderado',
        icon: '🚶',
        description: '4-5 actividades/día, balanceado',
        color: 'purple'
      },
      {
        id: 'intense',
        name: 'Intenso',
        icon: '🏃',
        description: '6+ actividades/día, maximizar experiencias',
        color: 'red'
      }
    ];

    return paces.map((pace, index) => `
      <label class="pace-option cursor-pointer">
        <input type="radio" name="pace" value="${pace.id}" ${index === 1 ? 'checked' : ''} class="hidden">
        <div class="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-${pace.color}-500 transition">
          <div class="text-4xl mb-2 text-center">${pace.icon}</div>
          <div class="font-bold text-center dark:text-white">${pace.name}</div>
          <div class="text-xs text-center text-gray-600 dark:text-gray-400 mt-2">${pace.description}</div>
        </div>
      </label>
    `).join('');
  }

  /**
   * Renderizar sliders de intereses
   */
  renderInterestSliders() {
    const interests = [
      { id: 'culture', name: 'Cultura e Historia', icon: '🏯', description: 'Templos, museos, tradiciones' },
      { id: 'food', name: 'Gastronomía', icon: '🍜', description: 'Ramen, sushi, experiencias culinarias' },
      { id: 'nature', name: 'Naturaleza', icon: '🌸', description: 'Jardines, montañas, onsen' },
      { id: 'popCulture', name: 'Pop Culture', icon: '🎮', description: 'Anime, manga, gaming, Akihabara' },
      { id: 'shopping', name: 'Shopping', icon: '🛍️', description: 'Electrónicos, moda, souvenirs' },
      { id: 'nightlife', name: 'Vida Nocturna', icon: '🌃', description: 'Bares, karaoke, clubes' },
      { id: 'art', name: 'Arte y Diseño', icon: '🎨', description: 'Galerías, arquitectura moderna' },
      { id: 'adventure', name: 'Aventura', icon: '🏃', description: 'Hiking, deportes, actividades físicas' },
      { id: 'photography', name: 'Fotografía', icon: '📸', description: 'Lugares instagrameables' },
      { id: 'relaxation', name: 'Relax', icon: '🧘', description: 'Spas, onsen, meditación' }
    ];

    return interests.map(interest => `
      <div class="interest-slider">
        <div class="flex justify-between mb-2">
          <label class="font-semibold dark:text-white flex items-center gap-2">
            <span>${interest.icon}</span>
            <span>${interest.name}</span>
          </label>
          <span id="${interest.id}Value" class="text-purple-600 dark:text-purple-400 font-bold">5</span>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">${interest.description}</p>
        <input
          type="range"
          id="${interest.id}Slider"
          min="0"
          max="10"
          value="5"
          class="w-full"
          oninput="document.getElementById('${interest.id}Value').textContent = this.value"
        />
      </div>
    `).join('');
  }

  /**
   * Actualizar barra de progreso
   */
  updateProgress() {
    const totalQuestions = 15;
    let answered = 0;

    const inputs = document.querySelectorAll('#questionsContainer input, #questionsContainer select');
    inputs.forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        // Count as answered if any in group is checked
      } else if (input.value) {
        answered++;
      }
    });

    const progress = Math.min((answered / totalQuestions) * 100, 100);
    const progressBar = document.getElementById('questionnaireProgress');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  /**
   * Recopilar respuestas del cuestionario
   */
  collectAnswers() {
    // Grupo
    this.profile.groupSize = parseInt(document.getElementById('groupSize')?.value) || 1;
    this.profile.groupType = document.getElementById('groupType')?.value || 'solo';
    const ageRange = document.getElementById('ageRange')?.value || '26-35';
    this.profile.ages = this.parseAgeRange(ageRange);

    // Presupuesto
    this.profile.budget.total = parseInt(document.getElementById('totalBudget')?.value) || 0;
    this.profile.budget.category = document.getElementById('budgetCategory')?.value || 'medium';

    // Ritmo
    const paceInput = document.querySelector('input[name="pace"]:checked');
    this.profile.pace = paceInput?.value || 'moderate';

    // Intereses
    const interestIds = ['culture', 'food', 'nature', 'popCulture', 'shopping', 'nightlife', 'art', 'adventure', 'photography', 'relaxation'];
    interestIds.forEach(id => {
      const slider = document.getElementById(`${id}Slider`);
      if (slider) {
        this.profile.interests[id] = parseInt(slider.value);
      }
    });

    // Preferencias
    this.profile.preferences.avoidCrowds = document.getElementById('avoidCrowds')?.checked || false;
    this.profile.preferences.firstTimeJapan = document.getElementById('firstTime')?.checked !== false;
    this.profile.preferences.timeOfDay = document.getElementById('timeOfDay')?.value || 'balanced';
    this.profile.preferences.dietary = document.getElementById('dietary')?.value || 'flexible';
    this.profile.preferences.mobility = document.getElementById('mobility')?.value || 'full';

    console.log('✅ Profile collected:', this.profile);
  }

  /**
   * Parsear rango de edad a array
   */
  parseAgeRange(range) {
    const ranges = {
      '18-25': [18, 25],
      '26-35': [26, 35],
      '36-50': [36, 50],
      '51-65': [51, 65],
      '66+': [66, 80]
    };
    return ranges[range] || [30];
  }

  /**
   * Analizar perfil y generar recomendaciones
   */
  analyzeProfile() {
    // Identificar top 3 intereses
    const interestEntries = Object.entries(this.profile.interests)
      .sort((a, b) => b[1] - a[1]);

    this.profile.topInterests = interestEntries.slice(0, 3).map(([key, value]) => ({
      category: key,
      score: value
    }));

    // Determinar estilo de viaje
    this.profile.travelStyle = this.determineTravelStyle();

    // Generar recomendaciones específicas
    this.profile.recommendations = this.generateRecommendations();

    console.log('🎯 Profile analyzed:', this.profile);
    console.log('⭐ Top interests:', this.profile.topInterests);
    console.log('🎨 Travel style:', this.profile.travelStyle);
  }

  /**
   * Determinar estilo de viaje
   */
  determineTravelStyle() {
    const { topInterests, groupType, pace, budget } = this.profile;

    const primary = topInterests[0]?.category;

    // Estilos basados en interés principal
    const styles = {
      culture: 'Cultural Explorer',
      food: 'Foodie Adventurer',
      nature: 'Nature Seeker',
      popCulture: 'Pop Culture Fan',
      shopping: 'Shopping Enthusiast',
      nightlife: 'Night Owl',
      art: 'Art Connoisseur',
      adventure: 'Adventure Seeker',
      photography: 'Instagram Traveler',
      relaxation: 'Zen Traveler'
    };

    let style = styles[primary] || 'Balanced Traveler';

    // Modificadores
    if (groupType === 'family') style = 'Family ' + style;
    if (pace === 'intense') style = 'Intense ' + style;
    if (budget.category === 'luxury') style = 'Luxury ' + style;

    return style;
  }

  /**
   * Generar recomendaciones personalizadas
   */
  generateRecommendations() {
    const recommendations = {
      cities: [],
      daysPerCity: {},
      activityTypes: [],
      avoidances: [],
      specialTips: []
    };

    // Recomendaciones basadas en intereses
    const { topInterests, budget, groupType, preferences } = this.profile;

    // Ciudades recomendadas
    if (topInterests.find(i => i.category === 'culture')) {
      recommendations.cities.push({ city: 'Kyoto', priority: 10, reason: 'Capital cultural con templos históricos' });
    }
    if (topInterests.find(i => i.category === 'food')) {
      recommendations.cities.push({ city: 'Osaka', priority: 9, reason: 'Paraíso gastronómico de Japón' });
    }
    if (topInterests.find(i => i.category === 'popCulture')) {
      recommendations.cities.push({ city: 'Tokyo', priority: 10, reason: 'Epicentro del anime y tecnología' });
    }
    if (topInterests.find(i => i.category === 'nature')) {
      recommendations.cities.push({ city: 'Hakone', priority: 8, reason: 'Onsen y vistas del Monte Fuji' });
    }

    // Tips especiales
    if (groupType === 'family') {
      recommendations.specialTips.push('Incluir actividades kid-friendly como Ghibli Museum y Pokemon Center');
    }
    if (budget.category === 'luxury') {
      recommendations.specialTips.push('Reservar experiencias premium: Kaiseki, ryokan tradicional, tours privados');
    }
    if (preferences.avoidCrowds) {
      recommendations.specialTips.push('Visitar atracciones temprano en la mañana o en días laborables');
    }

    return recommendations;
  }

  /**
   * Guardar perfil en localStorage
   */
  saveProfile() {
    import('/js/utils/safe-helpers.js').then(({ safeLocalStorageSet }) => {
      safeLocalStorageSet('traveler_profile', this.profile);
      console.log('💾 Profile saved to localStorage');
    });
  }

  /**
   * Cargar perfil desde localStorage
   */
  loadProfile() {
    import('/js/utils/safe-helpers.js').then(({ safeLocalStorageGet }) => {
      const saved = safeLocalStorageGet('traveler_profile', null);
      if (saved) {
        this.profile = { ...this.getDefaultProfile(), ...saved };
        console.log('✅ Profile loaded from localStorage');
      }
    });
  }
}

// Export
export default TravelerProfiler;
