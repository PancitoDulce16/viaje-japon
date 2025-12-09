// js/smart-generator-wizard.js - UI Wizard para generador inteligente de itinerarios
// Wizard de 3 pasos que guía al usuario a crear un itinerario completo

/**
 * Smart Generator Wizard
 */
export const SmartGeneratorWizard = {

  currentStep: 1,
  wizardData: {
    // Step 1 - Información básica del viaje
    cities: [],
    totalDays: 7,
    dailyBudget: 10000,
    groupSize: 1,              // 🆕 Número de personas
    travelerAges: [],          // 🆕 Edades de los viajeros [25, 30, 5]
    tripStartDate: null,       // 🆕 Fecha de inicio (para eventos estacionales)
    tripEndDate: null,         // 🆕 Fecha de fin
    dietaryRestrictions: [],   // 🆕 ['vegetarian', 'halal', 'gluten-free']
    mobilityNeeds: null,       // 🆕 'wheelchair', 'limited', null

    // Step 2
    interests: [],
    pace: 'moderate',
    startTime: 9,

    // Step 3
    hotels: {},
    mustSee: [],
    avoid: []
  },

  /**
   * Abre el wizard
   */
  open() {
    this.currentStep = 1;

    // Intentar cargar datos guardados
    const hasStoredData = this.loadFromSessionStorage();

    if (!hasStoredData) {
      this.resetWizardData();
    } else {
      // Mostrar notificación de que se recuperó progreso
      window.Notifications?.show('✅ Se recuperó tu progreso anterior', 'success');
    }

    this.renderWizard();
  },

  /**
   * Resetea los datos del wizard
   */
  resetWizardData() {
    this.wizardData = {
      cities: [],
      totalDays: 7,
      dailyBudget: 10000,
      groupSize: 1,
      travelerAges: [],
      tripStartDate: null,
      tripEndDate: null,
      dietaryRestrictions: [],
      mobilityNeeds: null,
      interests: [],
      pace: 'moderate', // light, moderate, packed, extreme, maximum
      startTime: 9,
      companionType: null, // solo, couple, family, seniors, friends
      hotels: {},
      mustSee: [],
      avoid: []
    };
  },

  /**
   * Renderiza el wizard completo
   */
  renderWizard() {
    const modalHTML = `
      <div id="smartGeneratorWizard" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold">🧠 Generador Inteligente de Itinerarios</h2>
                <p class="text-blue-100 mt-1">Crea un itinerario completo basado en tus preferencias</p>
              </div>
              <button onclick="window.SmartGeneratorWizard.close()" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Progress Bar -->
            <div class="mt-6 flex items-center gap-2">
              ${this.renderProgressBar()}
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            ${this.renderStepContent()}
          </div>

          <!-- Footer Navigation -->
          <div class="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between">
            ${this.renderFooterButtons()}
          </div>

        </div>
      </div>
    `;

    // Insertar en el DOM
    const existingModal = document.getElementById('smartGeneratorWizard');
    if (existingModal) {
      existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Restaurar valores guardados en los inputs
    this.restoreFormValues();
  },

  /**
   * Renderiza la barra de progreso
   */
  renderProgressBar() {
    const steps = [
      { num: 1, label: 'Básico', icon: '🌏' },
      { num: 2, label: 'Preferencias', icon: '❤️' },
      { num: 3, label: 'Hoteles', icon: '🏨' }
    ];

    return steps.map(step => {
      const isActive = step.num === this.currentStep;
      const isCompleted = step.num < this.currentStep;

      return `
        <div class="flex-1 flex items-center gap-2">
          <div class="${isActive ? 'bg-white text-blue-600' : isCompleted ? 'bg-green-500 text-white' : 'bg-white/30 text-white'}
                      w-10 h-10 rounded-full flex items-center justify-center font-bold transition">
            ${isCompleted ? '✓' : step.icon}
          </div>
          <span class="${isActive ? 'text-white font-semibold' : 'text-blue-100'} text-sm">${step.label}</span>
          ${step.num < 3 ? '<div class="flex-1 h-1 bg-white/30 rounded mx-2"></div>' : ''}
        </div>
      `;
    }).join('');
  },

  /**
   * Renderiza el contenido del paso actual
   */
  renderStepContent() {
    switch(this.currentStep) {
      case 1: return this.renderStep1();
      case 2: return this.renderStep2();
      case 3: return this.renderStep3();
      default: return '';
    }
  },

  /**
   * STEP 1: Básico (Ciudades, Días, Presupuesto)
   */
  renderStep1() {
    return `
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">📍 Configuración Básica</h3>

        <!-- Ciudades -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ¿Qué ciudades quieres visitar? <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-3 gap-3" id="citiesContainer">
            ${this.renderCityCheckbox('Tokyo', '🗼')}
            ${this.renderCityCheckbox('Kyoto', '⛩️')}
            ${this.renderCityCheckbox('Osaka', '🏯')}
          </div>
          <p class="text-xs text-gray-500 mt-2">Selecciona al menos una ciudad</p>
          <div id="citiesError" class="hidden mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">⚠️ Debes seleccionar al menos una ciudad</p>
          </div>
        </div>

        <!-- Fechas del viaje -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              📅 Fecha de inicio
            </label>
            <input
              type="date"
              id="tripStartDate"
              value="${this.wizardData.tripStartDate || ''}"
              onchange="window.SmartGeneratorWizard.updateTripDates()"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            >
            <p class="text-xs text-gray-500 mt-1">Para detectar eventos estacionales</p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              📅 Fecha de fin
            </label>
            <input
              type="date"
              id="tripEndDate"
              value="${this.wizardData.tripEndDate || ''}"
              onchange="window.SmartGeneratorWizard.updateTripDates()"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            >
          </div>
        </div>

        <!-- Días totales -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ¿Cuántos días durará tu viaje? <span class="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="totalDays"
            min="1"
            max="30"
            value="${this.wizardData.totalDays}"
            onchange="window.SmartGeneratorWizard.validateField('totalDays')"
            oninput="window.SmartGeneratorWizard.validateField('totalDays')"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            placeholder="Ej: 7"
          >
          <p class="text-xs text-gray-500 mt-1">Se calcula automático con las fechas o configura manual</p>
          <div id="totalDaysError" class="hidden mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">⚠️ El viaje debe durar al menos 1 día</p>
          </div>
        </div>

        <!-- Grupo de viajeros -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              👥 ¿Cuántas personas viajan?
            </label>
            <input
              type="number"
              id="groupSize"
              min="1"
              max="20"
              value="${this.wizardData.groupSize}"
              onchange="window.SmartGeneratorWizard.updateGroupSize()"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
              placeholder="Ej: 2"
            >
            <p class="text-xs text-gray-500 mt-1">Afecta recomendaciones de restaurantes</p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              🎂 Edades (separadas por comas)
            </label>
            <input
              type="text"
              id="travelerAges"
              value="${this.wizardData.travelerAges.join(', ')}"
              placeholder="Ej: 30, 28, 5"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            >
            <p class="text-xs text-gray-500 mt-1">Para actividades familiares o seniors</p>
          </div>
        </div>

        <!-- Presupuesto diario -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ¿Cuál es tu presupuesto diario? (JPY) <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
            <input
              type="number"
              id="dailyBudget"
              min="3000"
              max="100000"
              step="1000"
              value="${this.wizardData.dailyBudget}"
              onchange="window.SmartGeneratorWizard.validateField('dailyBudget')"
              oninput="window.SmartGeneratorWizard.validateField('dailyBudget')"
              class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
              placeholder="Ej: 10000"
            >
          </div>
          <div class="flex gap-2 mt-2">
            <button onclick="document.getElementById('dailyBudget').value = 5000; window.SmartGeneratorWizard.validateField('dailyBudget');" class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
              ¥5,000 (Económico)
            </button>
            <button onclick="document.getElementById('dailyBudget').value = 10000; window.SmartGeneratorWizard.validateField('dailyBudget');" class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
              ¥10,000 (Moderado)
            </button>
            <button onclick="document.getElementById('dailyBudget').value = 20000; window.SmartGeneratorWizard.validateField('dailyBudget');" class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
              ¥20,000 (Premium)
            </button>
          </div>
          <div id="dailyBudgetError" class="hidden mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">⚠️ El presupuesto debe ser al menos ¥3,000</p>
          </div>

          <!-- 🆕 Preview de Presupuesto Real-Time -->
          <div id="budgetPreview" class="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-bold text-gray-800 dark:text-white text-sm">💰 Estimación de Presupuesto Total</h4>
              <span class="text-2xl font-bold text-blue-600 dark:text-blue-400" id="totalBudgetPreview">¥70,000</span>
            </div>

            <div class="grid grid-cols-2 gap-2 mb-3">
              <div class="bg-white/60 dark:bg-gray-800/60 p-2 rounded">
                <div class="text-xs text-gray-500 dark:text-gray-400">Actividades (40%)</div>
                <div class="font-semibold text-sm text-gray-700 dark:text-gray-300" id="activitiesBudgetPreview">¥28,000</div>
              </div>
              <div class="bg-white/60 dark:bg-gray-800/60 p-2 rounded">
                <div class="text-xs text-gray-500 dark:text-gray-400">Comidas (35%)</div>
                <div class="font-semibold text-sm text-gray-700 dark:text-gray-300" id="mealsBudgetPreview">¥24,500</div>
              </div>
              <div class="bg-white/60 dark:bg-gray-800/60 p-2 rounded">
                <div class="text-xs text-gray-500 dark:text-gray-400">Transporte (25%)</div>
                <div class="font-semibold text-sm text-gray-700 dark:text-gray-300" id="transportBudgetPreview">¥17,500</div>
              </div>
              <div class="bg-white/60 dark:bg-gray-800/60 p-2 rounded">
                <div class="text-xs text-gray-500 dark:text-gray-400">Hotel estimado</div>
                <div class="font-semibold text-sm text-gray-700 dark:text-gray-300" id="hotelBudgetPreview">¥420,000</div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
              <span class="text-xs text-gray-600 dark:text-gray-400">Presupuesto Total Estimado</span>
              <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400" id="grandTotalPreview">¥490,000</span>
            </div>

            <div class="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
              <p class="text-xs text-yellow-800 dark:text-yellow-300" id="budgetComparison">
                📊 Promedio para viajeros similares: ¥450,000 - <span class="font-semibold">Tu presupuesto es 9% mayor</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Restricciones dietarias -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🍽️ Restricciones alimentarias (opcional)
          </label>
          <div class="grid grid-cols-2 gap-2">
            ${this.renderDietaryCheckbox('vegetarian', '🥗 Vegetariano')}
            ${this.renderDietaryCheckbox('vegan', '🌱 Vegano')}
            ${this.renderDietaryCheckbox('halal', '☪️ Halal')}
            ${this.renderDietaryCheckbox('kosher', '✡️ Kosher')}
            ${this.renderDietaryCheckbox('gluten-free', '🌾 Sin gluten')}
            ${this.renderDietaryCheckbox('no-seafood', '🚫🐟 Sin mariscos')}
          </div>
        </div>

        <!-- Necesidades de movilidad -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ♿ Necesidades de accesibilidad (opcional)
          </label>
          <div class="grid grid-cols-3 gap-2">
            ${this.renderMobilityOption('none', '✅ Sin limitaciones')}
            ${this.renderMobilityOption('limited', '🚶 Movilidad limitada')}
            ${this.renderMobilityOption('wheelchair', '♿ Silla de ruedas')}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Helper para renderizar checkbox de ciudad
   */
  renderCityCheckbox(city, icon) {
    const isChecked = this.wizardData.cities.includes(city);
    return `
      <label class="flex items-center gap-2 p-4 border-2 ${isChecked ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}
                     rounded-lg cursor-pointer hover:border-blue-400 transition">
        <input
          type="checkbox"
          class="city-checkbox w-5 h-5"
          data-city="${city}"
          onchange="window.SmartGeneratorWizard.validateField('cities')"
          ${isChecked ? 'checked' : ''}
        >
        <span class="text-2xl">${icon}</span>
        <span class="font-semibold text-gray-700 dark:text-gray-200">${city}</span>
      </label>
    `;
  },

  /**
   * Helper para renderizar checkbox de restricción dietaria
   */
  renderDietaryCheckbox(restriction, label) {
    const isChecked = this.wizardData.dietaryRestrictions.includes(restriction);
    return `
      <label class="flex items-center gap-2 p-2 border ${isChecked ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-300 dark:border-gray-600'}
                     rounded-lg cursor-pointer hover:border-green-400 transition">
        <input
          type="checkbox"
          class="dietary-checkbox w-4 h-4"
          data-restriction="${restriction}"
          ${isChecked ? 'checked' : ''}
        >
        <span class="text-sm text-gray-700 dark:text-gray-200">${label}</span>
      </label>
    `;
  },

  /**
   * Helper para renderizar opción de movilidad
   */
  renderMobilityOption(type, label) {
    const isSelected = (type === 'none' && !this.wizardData.mobilityNeeds) || this.wizardData.mobilityNeeds === type;
    return `
      <label class="flex items-center gap-2 p-2 border ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'border-gray-300 dark:border-gray-600'}
                     rounded-lg cursor-pointer hover:border-purple-400 transition">
        <input
          type="radio"
          name="mobilityNeeds"
          class="mobility-radio w-4 h-4"
          data-mobility="${type}"
          ${isSelected ? 'checked' : ''}
        >
        <span class="text-sm text-gray-700 dark:text-gray-200">${label}</span>
      </label>
    `;
  },

  /**
   * ✅ Inline validation for individual fields
   */
  validateField(fieldName) {
    let isValid = true;
    let errorElement, inputElement, containerElement;

    switch(fieldName) {
      case 'cities':
        // Save data first
        this.saveStep1Data();
        errorElement = document.getElementById('citiesError');
        containerElement = document.getElementById('citiesContainer');

        if (this.wizardData.cities.length === 0) {
          isValid = false;
          if (errorElement) errorElement.classList.remove('hidden');
          if (containerElement) containerElement.classList.add('ring-2', 'ring-red-500', 'rounded-lg');
        } else {
          if (errorElement) errorElement.classList.add('hidden');
          if (containerElement) containerElement.classList.remove('ring-2', 'ring-red-500');
        }
        break;

      case 'totalDays':
        inputElement = document.getElementById('totalDays');
        errorElement = document.getElementById('totalDaysError');
        const days = parseInt(inputElement?.value) || 0;

        if (days < 1) {
          isValid = false;
          if (errorElement) errorElement.classList.remove('hidden');
          if (inputElement) {
            inputElement.classList.remove('border-gray-300', 'dark:border-gray-600');
            inputElement.classList.add('border-red-500', 'dark:border-red-500');
          }
        } else {
          if (errorElement) errorElement.classList.add('hidden');
          if (inputElement) {
            inputElement.classList.remove('border-red-500', 'dark:border-red-500');
            inputElement.classList.add('border-gray-300', 'dark:border-gray-600');
          }
        }
        // 🆕 Actualizar preview de presupuesto
        this.updateBudgetPreview();
        break;

      case 'dailyBudget':
        inputElement = document.getElementById('dailyBudget');
        errorElement = document.getElementById('dailyBudgetError');
        const budget = parseInt(inputElement?.value) || 0;

        if (budget < 3000) {
          isValid = false;
          if (errorElement) errorElement.classList.remove('hidden');
          if (inputElement) {
            inputElement.classList.remove('border-gray-300', 'dark:border-gray-600');
            inputElement.classList.add('border-red-500', 'dark:border-red-500');
          }
        } else {
          if (errorElement) errorElement.classList.add('hidden');
          if (inputElement) {
            inputElement.classList.remove('border-red-500', 'dark:border-red-500');
            inputElement.classList.add('border-gray-300', 'dark:border-gray-600');
          }
        }
        // 🆕 Actualizar preview de presupuesto
        this.updateBudgetPreview();
        break;

      case 'interests':
        // Save data first
        this.saveStep2Data();
        errorElement = document.getElementById('interestsError');
        containerElement = document.getElementById('interestsContainer');

        if (this.wizardData.interests.length === 0) {
          isValid = false;
          if (errorElement) errorElement.classList.remove('hidden');
          if (containerElement) containerElement.classList.add('ring-2', 'ring-red-500', 'rounded-lg', 'p-2');
        } else {
          if (errorElement) errorElement.classList.add('hidden');
          if (containerElement) containerElement.classList.remove('ring-2', 'ring-red-500', 'p-2');
        }
        break;
    }

    return isValid;
  },

  /**
   * STEP 2: Preferencias (Intereses, Intensity, Companion, Hora inicio)
   * NUEVO: Con Intensity Levels slider y Companion Type selector
   */
  renderStep2() {
    const allInterests = [
      { id: 'cultural', label: 'Cultura & Templos', icon: '⛩️' },
      { id: 'food', label: 'Gastronomía', icon: '🍜' },
      { id: 'shopping', label: 'Compras', icon: '🛍️' },
      { id: 'nature', label: 'Naturaleza', icon: '🌸' },
      { id: 'art', label: 'Arte & Museos', icon: '🎨' },
      { id: 'anime', label: 'Anime & Manga', icon: '🎌' },
      { id: 'nightlife', label: 'Vida Nocturna', icon: '🌃' },
      { id: 'technology', label: 'Tecnología', icon: '🤖' },
      { id: 'history', label: 'Historia', icon: '📜' },
      { id: 'photography', label: 'Fotografía', icon: '📸' }
    ];

    // Intensity levels data
    const intensityLevels = ['light', 'moderate', 'packed', 'extreme', 'maximum'];
    const intensityLabels = {
      light: { icon: '🐢', label: 'Light', desc: '2-3/día' },
      moderate: { icon: '🚶', label: 'Moderate', desc: '4-5/día' },
      packed: { icon: '🏃', label: 'Packed', desc: '6-8/día' },
      extreme: { icon: '⚡', label: 'Extreme', desc: '9-11/día' },
      maximum: { icon: '🌪️', label: 'Maximum', desc: '12-15/día' }
    };
    const currentIntensityIndex = intensityLevels.indexOf(this.wizardData.pace);

    return `
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">❤️ Tus Preferencias</h3>

        <!-- Intereses -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ¿Qué te interesa? (Selecciona varios) <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-3" id="interestsContainer">
            ${allInterests.map(interest => this.renderInterestCheckbox(interest)).join('')}
          </div>
          <p class="text-xs text-gray-500 mt-2">Selecciona al menos un interés para personalizar tu itinerario</p>
          <div id="interestsError" class="hidden mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">⚠️ Debes seleccionar al menos un interés</p>
          </div>
        </div>

        <!-- ⚡ INTENSITY LEVELS SLIDER -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ⚡ Intensidad del Viaje: <span class="text-blue-600 dark:text-blue-400 font-bold" id="intensityLabel">${intensityLabels[this.wizardData.pace].icon} ${intensityLabels[this.wizardData.pace].label}</span>
          </label>
          <div class="px-2">
            <input
              type="range"
              id="intensitySlider"
              min="0"
              max="4"
              step="1"
              value="${currentIntensityIndex}"
              class="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 dark:from-green-800 dark:via-yellow-800 dark:to-red-800 rounded-lg appearance-none cursor-pointer"
              style="accent-color: #3b82f6;"
              onchange="window.SmartGeneratorWizard.updateIntensity(this.value)"
            >
            <div class="flex justify-between text-xs text-gray-500 mt-2 px-1">
              ${intensityLevels.map((level, idx) => `
                <div class="text-center flex-1">
                  <div class="text-lg">${intensityLabels[level].icon}</div>
                  <div class="font-medium">${intensityLabels[level].label}</div>
                  <div class="text-gray-400">${intensityLabels[level].desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">💡 Días más llenos = más actividades y experiencias</p>
        </div>

        <!-- 👥 COMPANION TYPE SELECTOR -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            👥 ¿Con quién viajas?
          </label>
          <div class="grid grid-cols-2 gap-3">
            ${this.renderCompanionOption(null, 'Sin especificar', '👤', 'Genérico')}
            ${this.renderCompanionOption('solo', 'Solo Traveler', '🧍', 'Flexible')}
            ${this.renderCompanionOption('couple', 'Pareja', '❤️', 'Romántico')}
            ${this.renderCompanionOption('family', 'Familia', '👨‍👩‍👧‍👦', 'Pausado')}
            ${this.renderCompanionOption('seniors', 'Seniors', '👴👵', 'Relajado')}
            ${this.renderCompanionOption('friends', 'Amigos', '🎉', 'Intenso')}
          </div>
        </div>

        <!-- Hora de inicio -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ¿A qué hora prefieres empezar tus días?
          </label>
          <select
            id="startTime"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7" ${this.wizardData.startTime === 7 ? 'selected' : ''}>7:00 AM (Madrugador)</option>
            <option value="8" ${this.wizardData.startTime === 8 ? 'selected' : ''}>8:00 AM</option>
            <option value="9" ${this.wizardData.startTime === 9 ? 'selected' : ''}>9:00 AM (Recomendado)</option>
            <option value="10" ${this.wizardData.startTime === 10 ? 'selected' : ''}>10:00 AM</option>
            <option value="11" ${this.wizardData.startTime === 11 ? 'selected' : ''}>11:00 AM (Relajado)</option>
          </select>
        </div>
      </div>
    `;
  },

  /**
   * Actualiza la intensidad del viaje
   */
  updateIntensity(value) {
    const intensityLevels = ['light', 'moderate', 'packed', 'extreme', 'maximum'];
    const intensityLabels = {
      light: { icon: '🐢', label: 'Light' },
      moderate: { icon: '🚶', label: 'Moderate' },
      packed: { icon: '🏃', label: 'Packed (¡Días llenos!)' },
      extreme: { icon: '⚡', label: 'Extreme' },
      maximum: { icon: '🌪️', label: 'Maximum' }
    };

    this.wizardData.pace = intensityLevels[parseInt(value)];
    const label = intensityLabels[this.wizardData.pace];

    const labelElement = document.getElementById('intensityLabel');
    if (labelElement) {
      labelElement.textContent = `${label.icon} ${label.label}`;
    }
  },

  /**
   * 🆕 Actualiza las fechas del viaje y calcula días automáticamente
   */
  updateTripDates() {
    const startInput = document.getElementById('tripStartDate');
    const endInput = document.getElementById('tripEndDate');
    const totalDaysInput = document.getElementById('totalDays');

    if (startInput && endInput && startInput.value && endInput.value) {
      const startDate = new Date(startInput.value);
      const endDate = new Date(endInput.value);

      // Calcular días entre fechas
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días

      if (totalDaysInput && diffDays > 0) {
        totalDaysInput.value = diffDays;
        this.wizardData.totalDays = diffDays;
        this.validateField('totalDays');
      }
    }

    if (startInput) this.wizardData.tripStartDate = startInput.value || null;
    if (endInput) this.wizardData.tripEndDate = endInput.value || null;

    this.saveToSessionStorage();
  },

  /**
   * 🆕 Actualiza el tamaño del grupo
   */
  updateGroupSize() {
    const groupSizeInput = document.getElementById('groupSize');
    if (groupSizeInput) {
      this.wizardData.groupSize = parseInt(groupSizeInput.value) || 1;
      this.saveToSessionStorage();
      // 🆕 Actualizar preview de presupuesto
      this.updateBudgetPreview();
    }
  },

  /**
   * Renderiza opción de companion type
   */
  renderCompanionOption(type, label, icon, desc) {
    const isSelected = this.wizardData.companionType === type;
    return `
      <label class="flex items-center gap-2 p-3 border-2 ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'border-gray-300 dark:border-gray-600'}
                     rounded-lg cursor-pointer hover:border-purple-400 transition">
        <input
          type="radio"
          name="companionType"
          class="companion-radio"
          data-companion="${type}"
          ${isSelected ? 'checked' : ''}
        >
        <span class="text-2xl">${icon}</span>
        <div class="flex-1">
          <div class="font-semibold text-sm text-gray-700 dark:text-gray-200">${label}</div>
          <div class="text-xs text-gray-500">${desc}</div>
        </div>
      </label>
    `;
  },

  /**
   * Helper para renderizar checkbox de interés
   */
  renderInterestCheckbox(interest) {
    const isChecked = this.wizardData.interests.includes(interest.id);
    return `
      <label class="flex items-center gap-3 p-3 border-2 ${isChecked ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}
                     rounded-lg cursor-pointer hover:border-blue-400 transition">
        <input
          type="checkbox"
          class="interest-checkbox w-5 h-5"
          data-interest="${interest.id}"
          onchange="window.SmartGeneratorWizard.validateField('interests')"
          ${isChecked ? 'checked' : ''}
        >
        <span class="text-xl">${interest.icon}</span>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-200">${interest.label}</span>
      </label>
    `;
  },

  /**
   * Helper para renderizar opción de ritmo
   */
  renderPaceOption(pace, label, icon, desc) {
    const isSelected = this.wizardData.pace === pace;
    return `
      <label class="flex flex-col items-center gap-2 p-4 border-2 ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}
                     rounded-lg cursor-pointer hover:border-blue-400 transition">
        <input
          type="radio"
          name="pace"
          class="pace-radio"
          data-pace="${pace}"
          ${isSelected ? 'checked' : ''}
        >
        <span class="text-3xl">${icon}</span>
        <span class="font-semibold text-gray-700 dark:text-gray-200">${label}</span>
        <span class="text-xs text-gray-500 text-center">${desc}</span>
      </label>
    `;
  },

  /**
   * STEP 3: Hoteles & Must-See
   */
  renderStep3() {
    const selectedCities = this.wizardData.cities;

    return `
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">🏨 Hoteles & Lugares Imperdibles</h3>

        <!-- Hoteles por ciudad -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ¿En qué hoteles te quedarás? (Opcional pero recomendado)
          </label>
          <p class="text-sm text-gray-500 mb-4">
            Esto permite que el itinerario empiece cerca de tu hotel cada día 🎯
          </p>
          <div class="space-y-3">
            ${selectedCities.map(city => this.renderHotelInput(city)).join('')}
          </div>
        </div>

        <!-- Must-See Places -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Lugares que NO te quieres perder (Opcional)
          </label>
          <div id="mustSeeList" class="space-y-2 mb-2">
            ${this.wizardData.mustSee.map((place, idx) => this.renderMustSeeItem(place, idx)).join('')}
          </div>
          <button
            onclick="window.SmartGeneratorWizard.addMustSeePlace()"
            class="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition"
          >
            + Agregar lugar imperdible
          </button>
        </div>

        <!-- Avoid Places -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Lugares o actividades que prefieres evitar (Opcional)
          </label>
          <textarea
            id="avoidPlaces"
            rows="2"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Ej: clubes, museos de guerra, lugares muy turísticos..."
          >${this.wizardData.avoid.join(', ')}</textarea>
        </div>
      </div>
    `;
  },

  /**
   * Helper para renderizar input de hotel
   */
  renderHotelInput(city) {
    const hotel = this.wizardData.hotels[city.toLowerCase()] || { name: '', area: '' };
    return `
      <div class="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">${city === 'Tokyo' ? '🗼' : city === 'Kyoto' ? '⛩️' : '🏯'}</span>
          <span class="font-semibold text-gray-700 dark:text-gray-200">${city}</span>
        </div>
        <div class="space-y-2">
          <input
            type="text"
            class="hotel-name-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            data-city="${city.toLowerCase()}"
            placeholder="Nombre del hotel"
            value="${hotel.name}"
          >
          <input
            type="text"
            class="hotel-area-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            data-city="${city.toLowerCase()}"
            placeholder="Área (Ej: Shinjuku, Shibuya, Gion...)"
            value="${hotel.area}"
          >
        </div>
      </div>
    `;
  },

  /**
   * Helper para renderizar item de must-see
   */
  renderMustSeeItem(place, idx) {
    return `
      <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <input
          type="text"
          class="mustSee-name-input flex-1 px-3 py-2 border-0 bg-transparent dark:text-white"
          data-idx="${idx}"
          placeholder="Nombre del lugar"
          value="${place.name}"
        >
        <select
          class="mustSee-city-select px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
          data-idx="${idx}"
        >
          <option value="">Ciudad...</option>
          ${this.wizardData.cities.map(city => `<option value="${city}" ${place.city === city ? 'selected' : ''}>${city}</option>`).join('')}
        </select>
        <button
          onclick="window.SmartGeneratorWizard.removeMustSeePlace(${idx})"
          class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
        >
          ✕
        </button>
      </div>
    `;
  },

  /**
   * Renderiza botones del footer
   */
  renderFooterButtons() {
    const isFirstStep = this.currentStep === 1;
    const isLastStep = this.currentStep === 3;

    return `
      <button
        onclick="window.SmartGeneratorWizard.close()"
        class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
      >
        Cancelar
      </button>
      <div class="flex gap-3">
        ${!isFirstStep ? `
          <button
            onclick="window.SmartGeneratorWizard.prevStep()"
            class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            ← Anterior
          </button>
        ` : ''}
        ${!isLastStep ? `
          <button
            onclick="window.SmartGeneratorWizard.nextStep()"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Siguiente →
          </button>
        ` : `
          <button
            onclick="window.SmartGeneratorWizard.generateItinerary()"
            class="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-semibold shadow-lg"
          >
            🚀 ¡Generar Itinerario!
          </button>
        `}
      </div>
    `;
  },

  /**
   * Restaura valores del form desde wizardData
   */
  restoreFormValues() {
    // Step 1
    document.querySelectorAll('.city-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.saveStep1Data());
    });

    // 🆕 Event listeners para nuevos campos
    document.querySelectorAll('.dietary-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.saveStep1Data());
    });

    document.querySelectorAll('.mobility-radio').forEach(radio => {
      radio.addEventListener('change', () => this.saveStep1Data());
    });

    // Step 2
    document.querySelectorAll('.interest-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.saveStep2Data());
    });

    document.querySelectorAll('.pace-radio').forEach(radio => {
      radio.addEventListener('change', () => this.saveStep2Data());
    });

    document.querySelectorAll('.companion-radio').forEach(radio => {
      radio.addEventListener('change', () => this.saveStep2Data());
    });

    // Step 3
    document.querySelectorAll('.hotel-name-input, .hotel-area-input').forEach(input => {
      input.addEventListener('input', () => this.saveStep3Data());
    });
  },

  /**
   * Guarda datos del Step 1
   */
  saveStep1Data() {
    this.wizardData.cities = Array.from(document.querySelectorAll('.city-checkbox:checked'))
      .map(cb => cb.dataset.city);

    const totalDaysInput = document.getElementById('totalDays');
    if (totalDaysInput) {
      this.wizardData.totalDays = parseInt(totalDaysInput.value) || 7;
    }

    const dailyBudgetInput = document.getElementById('dailyBudget');
    if (dailyBudgetInput) {
      this.wizardData.dailyBudget = parseInt(dailyBudgetInput.value) || 10000;
    }

    // 🆕 Guardar nuevos campos de contexto
    const groupSizeInput = document.getElementById('groupSize');
    if (groupSizeInput) {
      this.wizardData.groupSize = parseInt(groupSizeInput.value) || 1;
    }

    const travelerAgesInput = document.getElementById('travelerAges');
    if (travelerAgesInput && travelerAgesInput.value.trim()) {
      this.wizardData.travelerAges = travelerAgesInput.value.split(',')
        .map(age => parseInt(age.trim()))
        .filter(age => !isNaN(age) && age > 0);
    } else {
      this.wizardData.travelerAges = [];
    }

    const tripStartDateInput = document.getElementById('tripStartDate');
    if (tripStartDateInput) {
      this.wizardData.tripStartDate = tripStartDateInput.value || null;
    }

    const tripEndDateInput = document.getElementById('tripEndDate');
    if (tripEndDateInput) {
      this.wizardData.tripEndDate = tripEndDateInput.value || null;
    }

    // Dietary restrictions
    this.wizardData.dietaryRestrictions = Array.from(document.querySelectorAll('.dietary-checkbox:checked'))
      .map(cb => cb.dataset.restriction);

    // Mobility needs
    const mobilityRadio = document.querySelector('.mobility-radio:checked');
    if (mobilityRadio) {
      const mobilityValue = mobilityRadio.dataset.mobility;
      this.wizardData.mobilityNeeds = mobilityValue === 'none' ? null : mobilityValue;
    }

    this.saveToSessionStorage(); // 💾 Guardar progreso
  },

  /**
   * Guarda datos del Step 2
   */
  saveStep2Data() {
    this.wizardData.interests = Array.from(document.querySelectorAll('.interest-checkbox:checked'))
      .map(cb => cb.dataset.interest);

    const paceRadio = document.querySelector('.pace-radio:checked');
    if (paceRadio) {
      this.wizardData.pace = paceRadio.dataset.pace;
    }

    // 👥 Guardar companion type
    const companionRadio = document.querySelector('.companion-radio:checked');
    if (companionRadio) {
      const companionValue = companionRadio.dataset.companion;
      this.wizardData.companionType = companionValue === 'null' ? null : companionValue;
    }

    const startTimeSelect = document.getElementById('startTime');
    if (startTimeSelect) {
      this.wizardData.startTime = parseInt(startTimeSelect.value) || 9;
    }

    this.saveToSessionStorage(); // 💾 Guardar progreso
  },

  /**
   * Guarda datos del Step 3
   */
  saveStep3Data() {
    // Hoteles
    this.wizardData.hotels = {};
    document.querySelectorAll('.hotel-name-input').forEach(input => {
      const city = input.dataset.city;
      const areaInput = document.querySelector(`.hotel-area-input[data-city="${city}"]`);
      if (input.value.trim()) {
        this.wizardData.hotels[city] = {
          name: input.value.trim(),
          area: areaInput ? areaInput.value.trim() : ''
        };
      }
    });

    // Must-See places
    this.wizardData.mustSee = [];
    document.querySelectorAll('.mustSee-name-input').forEach(input => {
      const idx = input.dataset.idx;
      const citySelect = document.querySelector(`.mustSee-city-select[data-idx="${idx}"]`);
      if (input.value.trim() && citySelect && citySelect.value) {
        this.wizardData.mustSee.push({
          name: input.value.trim(),
          city: citySelect.value
        });
      }
    });

    // Avoid places
    const avoidInput = document.getElementById('avoidPlaces');
    if (avoidInput && avoidInput.value.trim()) {
      this.wizardData.avoid = avoidInput.value.split(',').map(s => s.trim()).filter(s => s);
    } else {
      this.wizardData.avoid = [];
    }

    this.saveToSessionStorage(); // 💾 Guardar progreso
  },

  /**
   * Valida el paso actual
   */
  validateCurrentStep() {
    if (this.currentStep === 1) {
      this.saveStep1Data();
      if (this.wizardData.cities.length === 0) {
        window.Notifications?.show('❌ Selecciona al menos una ciudad', 'error');
        return false;
      }
      if (this.wizardData.totalDays < 1) {
        window.Notifications?.show('❌ El viaje debe durar al menos 1 día', 'error');
        return false;
      }
    } else if (this.currentStep === 2) {
      this.saveStep2Data();
      if (this.wizardData.interests.length === 0) {
        window.Notifications?.show('❌ Selecciona al menos un interés', 'error');
        return false;
      }
    } else if (this.currentStep === 3) {
      this.saveStep3Data();
      // Step 3 es opcional, no requiere validación estricta
    }
    return true;
  },

  /**
   * Navega al siguiente paso
   */
  nextStep() {
    if (!this.validateCurrentStep()) return;

    if (this.currentStep < 3) {
      this.currentStep++;
      this.saveToSessionStorage(); // 💾 Guardar progreso
      this.renderWizard();
    }
  },

  /**
   * Navega al paso anterior
   */
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderWizard();
    }
  },

  /**
   * Cierra el wizard
   */
  close() {
    const modal = document.getElementById('smartGeneratorWizard');
    if (modal) {
      modal.remove();
    }
    // No borramos el sessionStorage aquí, solo cuando se completa o el usuario lo cancela explícitamente
  },

  /**
   * 💾 Guarda el progreso en sessionStorage
   */
  saveToSessionStorage() {
    try {
      const dataToSave = {
        currentStep: this.currentStep,
        wizardData: this.wizardData,
        timestamp: Date.now()
      };
      sessionStorage.setItem('smartGeneratorWizard_progress', JSON.stringify(dataToSave));
      console.log('💾 Progreso guardado en sessionStorage');
    } catch (error) {
      console.error('❌ Error guardando progreso:', error);
    }
  },

  /**
   * 📂 Carga el progreso desde sessionStorage
   * @returns {boolean} true si se cargaron datos, false si no había datos guardados
   */
  loadFromSessionStorage() {
    try {
      const saved = sessionStorage.getItem('smartGeneratorWizard_progress');
      if (!saved) return false;

      const data = JSON.parse(saved);

      // Verificar que los datos no sean muy antiguos (más de 24 horas)
      const hoursSinceLastSave = (Date.now() - data.timestamp) / (1000 * 60 * 60);
      if (hoursSinceLastSave > 24) {
        console.log('⚠️ Progreso guardado muy antiguo, descartando...');
        this.clearSessionStorage();
        return false;
      }

      // Restaurar datos
      this.currentStep = data.currentStep || 1;
      this.wizardData = data.wizardData || this.wizardData;

      console.log('📂 Progreso cargado desde sessionStorage:', data);
      return true;
    } catch (error) {
      console.error('❌ Error cargando progreso:', error);
      return false;
    }
  },

  /**
   * 🗑️ Limpia el progreso guardado
   */
  clearSessionStorage() {
    try {
      sessionStorage.removeItem('smartGeneratorWizard_progress');
      console.log('🗑️ Progreso eliminado de sessionStorage');
    } catch (error) {
      console.error('❌ Error limpiando progreso:', error);
    }
  },

  /**
   * Agrega un lugar must-see
   */
  addMustSeePlace() {
    this.saveStep3Data();
    this.wizardData.mustSee.push({ name: '', city: '' });
    this.renderWizard();
  },

  /**
   * Elimina un lugar must-see
   */
  removeMustSeePlace(idx) {
    this.wizardData.mustSee.splice(idx, 1);
    this.renderWizard();
  },

  /**
   * Genera MÚLTIPLES VARIACIONES de itinerarios
   */
  async generateItinerary() {
    if (!this.validateCurrentStep()) return;

    console.log('🚀 Generando itinerarios con:', this.wizardData);

    // Mostrar loading con pasos detallados
    const modal = document.getElementById('smartGeneratorWizard');
    if (modal) {
      modal.innerHTML = `
        <div class="flex items-center justify-center h-full p-12">
          <div class="text-center max-w-2xl">
            <div class="relative mb-8">
              <div class="animate-spin rounded-full h-24 w-24 border-b-4 border-t-4 border-purple-600 mx-auto"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-4xl">🎨</span>
              </div>
            </div>

            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Generando 3 Variaciones</h3>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6">Creando itinerarios personalizados para ti</p>

            <!-- Pasos de progreso -->
            <div class="space-y-3 text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-4">
              <div class="flex items-center gap-3 text-blue-600 dark:text-blue-400" id="step1">
                <div class="animate-pulse">⏳</div>
                <span class="font-medium">Analizando tus preferencias...</span>
              </div>
              <div class="flex items-center gap-3 text-gray-400" id="step2">
                <div>⏳</div>
                <span>Buscando coordenadas de hoteles...</span>
              </div>
              <div class="flex items-center gap-3 text-gray-400" id="step3">
                <div>⏳</div>
                <span>Optimizando rutas y tiempos...</span>
              </div>
              <div class="flex items-center gap-3 text-gray-400" id="step4">
                <div>⏳</div>
                <span>Generando 3 itinerarios únicos...</span>
              </div>
            </div>

            <p class="text-sm text-gray-500">
              ⏱️ Tiempo estimado: <span class="font-bold">10-20 segundos</span>
            </p>
          </div>
        </div>
      `;

      // Simular progreso de pasos
      setTimeout(() => {
        const step1 = document.getElementById('step1');
        if (step1) {
          step1.innerHTML = '<div>✅</div><span class="text-gray-600 dark:text-gray-300">Preferencias analizadas</span>';
          step1.classList.remove('text-blue-600', 'dark:text-blue-400');
          step1.classList.add('text-gray-600', 'dark:text-gray-300');
        }
        const step2 = document.getElementById('step2');
        if (step2) {
          step2.classList.remove('text-gray-400');
          step2.classList.add('text-blue-600', 'dark:text-blue-400');
          step2.querySelector('div').classList.add('animate-pulse');
        }
      }, 2000);

      setTimeout(() => {
        const step2 = document.getElementById('step2');
        if (step2) {
          step2.innerHTML = '<div>✅</div><span class="text-gray-600 dark:text-gray-300">Coordenadas encontradas</span>';
          step2.classList.remove('text-blue-600', 'dark:text-blue-400');
          step2.classList.add('text-gray-600', 'dark:text-gray-300');
        }
        const step3 = document.getElementById('step3');
        if (step3) {
          step3.classList.remove('text-gray-400');
          step3.classList.add('text-blue-600', 'dark:text-blue-400');
          step3.querySelector('div').classList.add('animate-pulse');
        }
      }, 5000);

      setTimeout(() => {
        const step3 = document.getElementById('step3');
        if (step3) {
          step3.innerHTML = '<div>✅</div><span class="text-gray-600 dark:text-gray-300">Rutas optimizadas</span>';
          step3.classList.remove('text-blue-600', 'dark:text-blue-400');
          step3.classList.add('text-gray-600', 'dark:text-gray-300');
        }
        const step4 = document.getElementById('step4');
        if (step4) {
          step4.classList.remove('text-gray-400');
          step4.classList.add('text-blue-600', 'dark:text-blue-400');
          step4.querySelector('div').classList.add('animate-pulse');
        }
      }, 10000);
    }

    try {
      // Convertir hoteles a formato con coordenadas
      const hotelsWithCoords = {};
      for (const [city, hotelData] of Object.entries(this.wizardData.hotels)) {
        if (hotelData.name && hotelData.area) {
          // Usar IntelligentGeocoder para buscar coordenadas
          const query = `${hotelData.name}, ${hotelData.area}, ${city}, Japan`;
          console.log(`🔍 Buscando coordenadas para: ${query}`);

          if (window.IntelligentGeocoder) {
            const result = await window.IntelligentGeocoder.getCoordinates(
              hotelData.name,
              `${hotelData.area}, ${city}, Japan`
            );

            if (result.success && result.lat && result.lng) {
              hotelsWithCoords[city] = {
                name: hotelData.name,
                lat: result.lat,
                lng: result.lng,
                area: hotelData.area
              };
              console.log(`✅ Hotel encontrado en ${city}:`, hotelsWithCoords[city]);
            } else {
              console.warn(`⚠️ No se encontraron coordenadas para hotel en ${city}`);
            }
          }
        }
      }

      // Preparar perfil para el generador
      const profile = {
        cities: this.wizardData.cities,
        totalDays: this.wizardData.totalDays,
        dailyBudget: this.wizardData.dailyBudget,
        interests: this.wizardData.interests,
        pace: this.wizardData.pace,
        startTime: this.wizardData.startTime,
        companionType: this.wizardData.companionType, // 👥 Companion-aware generation
        hotels: hotelsWithCoords,
        mustSee: this.wizardData.mustSee,
        avoid: this.wizardData.avoid,
        // 🆕 Nuevos parámetros de contexto
        groupSize: this.wizardData.groupSize,
        travelerAges: this.wizardData.travelerAges,
        tripStartDate: this.wizardData.tripStartDate,
        tripEndDate: this.wizardData.tripEndDate,
        dietaryRestrictions: this.wizardData.dietaryRestrictions,
        mobilityNeeds: this.wizardData.mobilityNeeds
      };

      console.log('📋 Perfil final:', profile);

      // Generar MÚLTIPLES VARIACIONES
      const variations = await window.SmartItineraryGenerator.generateMultipleVariations(profile);

      console.log('✅ 3 variaciones generadas:', variations);

      // Mostrar selector de variaciones
      this.showVariationsSelector(variations);

    } catch (error) {
      console.error('❌ Error generando itinerario:', error);
      window.Notifications?.show('❌ Error al generar itinerario: ' + error.message, 'error');
      this.close();
    }
  },

  /**
   * 🎨 Muestra selector para elegir entre las 3 variaciones
   */
  showVariationsSelector(variations) {
    const modal = document.getElementById('smartGeneratorWizard');
    if (!modal) return;

    // Guardar variaciones en el objeto para acceso global
    this.currentVariations = variations;
    this.comparisonMode = false; // Por defecto vista grid

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold mb-2">🎨 ¡3 Itinerarios Creados!</h2>
              <p class="text-purple-100">Elige el que más te guste o crea uno personalizado</p>
            </div>
            <button
              onclick="window.SmartGeneratorWizard.toggleComparisonMode()"
              class="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              <span id="comparisonToggleIcon">📊</span>
              <span id="comparisonToggleText">Modo Comparación</span>
            </button>
          </div>
        </div>

        <!-- Content Container -->
        <div id="variationsContent" class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${variations.map(variation => this.renderVariationCard(variation)).join('')}
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between">
          <button
            onclick="window.SmartGeneratorWizard.close()"
            class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    `;
  },

  /**
   * 🔄 Alterna entre vista grid y vista comparación
   */
  toggleComparisonMode() {
    this.comparisonMode = !this.comparisonMode;
    const contentContainer = document.getElementById('variationsContent');
    const toggleIcon = document.getElementById('comparisonToggleIcon');
    const toggleText = document.getElementById('comparisonToggleText');

    if (this.comparisonMode) {
      // Mostrar vista comparación detallada
      toggleIcon.textContent = '🃏';
      toggleText.textContent = 'Vista Tarjetas';
      contentContainer.innerHTML = this.renderComparisonView(this.currentVariations);

      // 🏆 Tracking de gamificación - comparaciones
      if (window.GamificationSystem) {
        window.GamificationSystem.trackAction('variationsCompared', 1);
      }
    } else {
      // Volver a vista grid
      toggleIcon.textContent = '📊';
      toggleText.textContent = 'Modo Comparación';
      contentContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${this.currentVariations.map(variation => this.renderVariationCard(variation)).join('')}
        </div>
      `;
    }
  },

  /**
   * 📊 Renderiza vista de comparación detallada
   */
  renderComparisonView(variations) {
    const maxDays = Math.max(...variations.map(v => v.itinerary.days.length));

    return `
      <div class="space-y-6">
        <!-- Summary Table -->
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6">
          <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">📋 Resumen Comparativo</h3>
          <div class="grid grid-cols-4 gap-4">
            <div class="font-semibold text-gray-700 dark:text-gray-300">Criterio</div>
            ${variations.map(v => `
              <div class="text-center">
                <div class="text-3xl mb-2">${v.icon}</div>
                <div class="font-bold text-gray-900 dark:text-white">${v.name}</div>
              </div>
            `).join('')}

            <div class="text-gray-600 dark:text-gray-400">📅 Días</div>
            ${variations.map(v => `
              <div class="text-center font-semibold text-gray-900 dark:text-white">${v.itinerary.days.length}</div>
            `).join('')}

            <div class="text-gray-600 dark:text-gray-400">🎯 Actividades</div>
            ${variations.map(v => {
              const total = v.itinerary.days.reduce((sum, day) => sum + day.activities.length, 0);
              return `<div class="text-center font-semibold text-gray-900 dark:text-white">${total}</div>`;
            }).join('')}

            <div class="text-gray-600 dark:text-gray-400">💰 Presupuesto</div>
            ${variations.map(v => `
              <div class="text-center font-semibold text-gray-900 dark:text-white">¥${(v.itinerary.totalBudget || 0).toLocaleString()}</div>
            `).join('')}

            <div class="text-gray-600 dark:text-gray-400">⚡ Ritmo</div>
            ${variations.map(v => {
              const pace = v.name.includes('Relajado') ? '🐢 Tranquilo' :
                          v.name.includes('Equilibrado') ? '🚶 Moderado' : '🏃 Intenso';
              return `<div class="text-center font-semibold text-gray-900 dark:text-white">${pace}</div>`;
            }).join('')}
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-3 gap-4 mt-6">
            ${variations.map(v => `
              <button
                onclick="window.SmartGeneratorWizard.selectVariation('${v.id}', ${JSON.stringify(v.itinerary).replace(/"/g, '&quot;')})"
                class="py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg"
              >
                ✅ Elegir ${v.name}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Day-by-Day Comparison -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">📅 Comparación Día por Día</h3>
            <button
              onclick="window.SmartGeneratorWizard.showHybridBuilder()"
              class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              🎨 Crear Híbrido
            </button>
          </div>

          <div class="space-y-6">
            ${Array.from({length: maxDays}, (_, i) => {
              const dayNumber = i + 1;
              return `
                <div class="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div class="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 font-bold">
                    📅 Día ${dayNumber}
                  </div>
                  <div class="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
                    ${variations.map((v, vIndex) => {
                      const day = v.itinerary.days[i];
                      if (!day) {
                        return `<div class="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-gray-400">Sin actividades</div>`;
                      }
                      return `
                        <div class="p-4 bg-white dark:bg-gray-800">
                          <div class="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
                            ${v.icon} ${v.name}
                          </div>
                          <div class="space-y-2">
                            ${day.activities.slice(0, 4).map(act => `
                              <div class="text-sm">
                                <div class="font-semibold text-gray-900 dark:text-white">${act.name}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                  ${act.category} • ${Math.floor(act.duration / 60)}h ${act.duration % 60}m
                                </div>
                              </div>
                            `).join('')}
                            ${day.activities.length > 4 ? `
                              <div class="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                                +${day.activities.length - 4} actividades más
                              </div>
                            ` : ''}
                          </div>
                          <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs">
                            <span class="text-gray-600 dark:text-gray-400">💰 ${day.dailyBudget?.toLocaleString() || '0'} ¥</span>
                            <span class="text-gray-600 dark:text-gray-400">${day.activities.length} act.</span>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Tags Comparison -->
        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-6">
          <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">🏷️ Categorías de Interés</h3>
          <div class="grid grid-cols-3 gap-4">
            ${variations.map(v => `
              <div class="space-y-2">
                <div class="font-semibold text-center text-gray-900 dark:text-white">
                  ${v.icon} ${v.name}
                </div>
                <div class="flex flex-wrap gap-2 justify-center">
                  ${v.tags.map(tag => `
                    <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                      ${tag}
                    </span>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 🎨 Muestra el constructor de itinerario híbrido
   */
  showHybridBuilder() {
    const modal = document.getElementById('smartGeneratorWizard');
    if (!modal || !this.currentVariations) return;

    const maxDays = Math.max(...this.currentVariations.map(v => v.itinerary.days.length));

    // Inicializar selección híbrida (por defecto variación 0 para todos los días)
    if (!this.hybridSelection) {
      this.hybridSelection = Array(maxDays).fill(0);
    }

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold mb-2">🎨 Constructor de Itinerario Híbrido</h2>
              <p class="text-blue-100">Selecciona qué variación usar para cada día</p>
            </div>
            <button
              onclick="window.SmartGeneratorWizard.showVariationsSelector(window.SmartGeneratorWizard.currentVariations)"
              class="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition"
            >
              ← Volver
            </button>
          </div>
        </div>

        <!-- Hybrid Builder Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-4">
            ${Array.from({length: maxDays}, (_, i) => {
              const dayNumber = i + 1;
              return `
                <div class="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div class="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 px-6 py-3">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-bold text-gray-900 dark:text-white">📅 Día ${dayNumber}</h3>
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        Seleccionado: <span class="font-bold text-purple-600 dark:text-purple-400" id="selectedVar${i}">
                          ${this.currentVariations[this.hybridSelection[i]].name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
                    ${this.currentVariations.map((v, vIndex) => {
                      const day = v.itinerary.days[i];
                      const isSelected = this.hybridSelection[i] === vIndex;

                      if (!day) {
                        return `<div class="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-gray-400">Sin actividades</div>`;
                      }

                      return `
                        <div class="p-4 ${isSelected ? 'bg-purple-50 dark:bg-purple-900/30 border-4 border-purple-500' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'} cursor-pointer transition"
                             onclick="window.SmartGeneratorWizard.selectDayVariation(${i}, ${vIndex})">

                          <!-- Header -->
                          <div class="flex items-center justify-between mb-3">
                            <div class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              ${isSelected ? '✅' : ''} ${v.icon} ${v.name}
                            </div>
                          </div>

                          <!-- Activities -->
                          <div class="space-y-2">
                            ${day.activities.slice(0, 3).map(act => `
                              <div class="text-sm bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                                <div class="font-semibold text-gray-900 dark:text-white truncate">${act.name}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                  ${act.category} • ${Math.floor(act.duration / 60)}h ${act.duration % 60}m
                                </div>
                              </div>
                            `).join('')}
                            ${day.activities.length > 3 ? `
                              <div class="text-xs text-center text-purple-600 dark:text-purple-400 font-semibold">
                                +${day.activities.length - 3} más
                              </div>
                            ` : ''}
                          </div>

                          <!-- Stats -->
                          <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs">
                            <span class="text-gray-600 dark:text-gray-400">💰 ¥${day.dailyBudget?.toLocaleString() || '0'}</span>
                            <span class="text-gray-600 dark:text-gray-400">${day.activities.length} actividades</span>
                          </div>

                          <!-- Select Button -->
                          <button class="w-full mt-3 py-2 ${isSelected ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-lg font-semibold transition">
                            ${isSelected ? '✅ Seleccionado' : 'Usar Esta Variación'}
                          </button>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Footer with Save -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <button
            onclick="window.SmartGeneratorWizard.showVariationsSelector(window.SmartGeneratorWizard.currentVariations)"
            class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onclick="window.SmartGeneratorWizard.saveHybridItinerary()"
            class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold transition shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            💾 Guardar Itinerario Híbrido
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Selecciona qué variación usar para un día específico
   */
  selectDayVariation(dayIndex, variationIndex) {
    this.hybridSelection[dayIndex] = variationIndex;
    // Actualizar la vista
    this.showHybridBuilder();
  },

  /**
   * 💾 Guarda el itinerario híbrido creado por el usuario
   */
  async saveHybridItinerary() {
    if (!this.currentVariations || !this.hybridSelection) {
      window.Notifications?.show('⚠️ Error creando híbrido', 'error');
      return;
    }

    console.log('🎨 Creando itinerario híbrido con selección:', this.hybridSelection);

    // Construir el itinerario híbrido
    const baseVariation = this.currentVariations[0];
    const hybridItinerary = {
      ...baseVariation.itinerary,
      days: []
    };

    let totalBudget = 0;

    // Construir días del híbrido
    this.hybridSelection.forEach((varIndex, dayIndex) => {
      const selectedVariation = this.currentVariations[varIndex];
      const day = selectedVariation.itinerary.days[dayIndex];

      if (day) {
        hybridItinerary.days.push({...day});
        totalBudget += (day.dailyBudget || 0);
      }
    });

    hybridItinerary.totalBudget = totalBudget;

    console.log('✅ Itinerario híbrido creado:', hybridItinerary);

    // Mostrar loading
    const modal = document.getElementById('smartGeneratorWizard');
    if (modal) {
      modal.innerHTML = `
        <div class="flex items-center justify-center h-full p-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">💾 Guardando itinerario híbrido...</h3>
            <p class="text-gray-600 dark:text-gray-400">🎨 Combinando lo mejor de cada variación</p>
          </div>
        </div>
      `;
    }

    try {
      // Guardar itinerario
      await this.saveGeneratedItinerary(hybridItinerary);

      // 🏆 Tracking de gamificación - híbridos
      if (window.GamificationSystem) {
        await window.GamificationSystem.trackAction('hybridsCreated', 1);
      }

      // 🗑️ Limpiar sessionStorage y datos temporales
      this.clearSessionStorage();
      this.hybridSelection = null;
      this.currentVariations = null;

      // Cerrar modal
      this.close();

      // Mostrar éxito
      window.Notifications?.show('✅ ¡Itinerario híbrido guardado exitosamente!', 'success');

      // Recargar la página
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Error guardando itinerario híbrido:', error);
      window.Notifications?.show('❌ Error al guardar: ' + error.message, 'error');
      this.close();
    }
  },

  /**
   * Renderiza una tarjeta de variación
   */
  renderVariationCard(variation) {
    const itinerary = variation.itinerary;
    const totalActivities = itinerary.days.reduce((sum, day) => sum + day.activities.length, 0);
    const totalBudget = itinerary.totalBudget || 0;

    return `
      <div class="border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition cursor-pointer overflow-hidden"
           onclick="window.SmartGeneratorWizard.selectVariation('${variation.id}', ${JSON.stringify(variation.itinerary).replace(/"/g, '&quot;')})">

        <!-- Header -->
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-6 text-center">
          <div class="text-5xl mb-3">${variation.icon}</div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${variation.name}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">${variation.description}</p>
        </div>

        <!-- Tags -->
        <div class="px-6 py-4 flex flex-wrap gap-2 justify-center bg-white dark:bg-gray-800">
          ${variation.tags.map(tag => `
            <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
              ${tag}
            </span>
          `).join('')}
        </div>

        <!-- Stats -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">📅 Días</span>
            <span class="font-semibold text-gray-900 dark:text-white">${itinerary.days.length}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">🎯 Actividades</span>
            <span class="font-semibold text-gray-900 dark:text-white">${totalActivities}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">💰 Presupuesto</span>
            <span class="font-semibold text-gray-900 dark:text-white">¥${totalBudget.toLocaleString()}</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="p-6 bg-white dark:bg-gray-800">
          <button class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg">
            ✅ Elegir Este Itinerario
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Selecciona una variación y la guarda
   */
  async selectVariation(variationId, itinerary) {
    console.log(`✅ Variación seleccionada: ${variationId}`);

    // Mostrar loading
    const modal = document.getElementById('smartGeneratorWizard');
    if (modal) {
      modal.innerHTML = `
        <div class="flex items-center justify-center h-full p-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">💾 Guardando itinerario...</h3>
          </div>
        </div>
      `;
    }

    try {
      // Guardar itinerario
      await this.saveGeneratedItinerary(itinerary);

      // 🗑️ Limpiar sessionStorage ya que completamos exitosamente
      this.clearSessionStorage();

      // Cerrar modal
      this.close();

      // Mostrar éxito
      window.Notifications?.show('✅ ¡Itinerario guardado exitosamente!', 'success');

      // Recargar la página
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Error guardando itinerario:', error);
      window.Notifications?.show('❌ Error al guardar: ' + error.message, 'error');
      this.close();
    }
  },

  /**
   * Guarda el itinerario generado en Firebase
   */
  async saveGeneratedItinerary(itinerary) {
    if (!window.TripsManager || !window.TripsManager.currentTripId) {
      console.warn('⚠️ No hay trip activo, no se puede guardar');
      return;
    }

    const tripId = window.TripsManager.currentTripId;

    // Guardar en Firebase
    try {
      const tripRef = window.firebase.firestore().collection('trips').doc(tripId);

      await tripRef.update({
        itinerary: itinerary.days,
        generatedBy: 'SmartGenerator',
        generatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        generatorProfile: itinerary.profile
      });

      console.log('✅ Itinerario guardado en Firebase');

      // 🏆 Tracking de gamificación
      if (window.GamificationSystem) {
        await window.GamificationSystem.trackAction('itinerariesGenerated', 1);
      }
    } catch (error) {
      console.error('❌ Error guardando itinerario:', error);
      throw error;
    }
  },

  /**
   * 🆕 ACTUALIZAR PREVIEW DE PRESUPUESTO EN TIEMPO REAL
   * Calcula y muestra estimación de presupuesto total
   */
  updateBudgetPreview() {
    const totalDaysInput = document.getElementById('totalDays');
    const dailyBudgetInput = document.getElementById('dailyBudget');
    const groupSizeInput = document.getElementById('groupSize');

    const totalDays = parseInt(totalDaysInput?.value) || 7;
    const dailyBudget = parseInt(dailyBudgetInput?.value) || 10000;
    const groupSize = parseInt(groupSizeInput?.value) || 1;

    // Calcular presupuesto de actividades (40% del daily budget)
    const activitiesDaily = dailyBudget * 0.40;
    const activitiesTotal = activitiesDaily * totalDays;

    // Calcular presupuesto de comidas (35% del daily budget)
    const mealsDaily = dailyBudget * 0.35;
    const mealsTotal = mealsDaily * totalDays;

    // Calcular presupuesto de transporte (25% del daily budget)
    const transportDaily = dailyBudget * 0.25;
    const transportTotal = transportDaily * totalDays;

    // Presupuesto total de actividades
    const dailyTotal = activitiesTotal + mealsTotal + transportTotal;

    // Estimar hotel (promedio ¥10,000 por noche por persona)
    const hotelPerNight = 10000 * groupSize;
    const hotelTotal = hotelPerNight * totalDays;

    // Gran total
    const grandTotal = dailyTotal + hotelTotal;

    // Actualizar DOM
    const totalBudgetPreview = document.getElementById('totalBudgetPreview');
    const activitiesBudgetPreview = document.getElementById('activitiesBudgetPreview');
    const mealsBudgetPreview = document.getElementById('mealsBudgetPreview');
    const transportBudgetPreview = document.getElementById('transportBudgetPreview');
    const hotelBudgetPreview = document.getElementById('hotelBudgetPreview');
    const grandTotalPreview = document.getElementById('grandTotalPreview');
    const budgetComparison = document.getElementById('budgetComparison');

    if (totalBudgetPreview) totalBudgetPreview.textContent = `¥${dailyTotal.toLocaleString()}`;
    if (activitiesBudgetPreview) activitiesBudgetPreview.textContent = `¥${Math.round(activitiesTotal).toLocaleString()}`;
    if (mealsBudgetPreview) mealsBudgetPreview.textContent = `¥${Math.round(mealsTotal).toLocaleString()}`;
    if (transportBudgetPreview) transportBudgetPreview.textContent = `¥${Math.round(transportTotal).toLocaleString()}`;
    if (hotelBudgetPreview) hotelBudgetPreview.textContent = `¥${hotelTotal.toLocaleString()}`;
    if (grandTotalPreview) grandTotalPreview.textContent = `¥${grandTotal.toLocaleString()}`;

    // Calcular comparación con promedio
    // Promedio estimado: ¥12,000/día para moderate travelers
    const averageDailyBudget = 12000;
    const averageTotal = (averageDailyBudget * totalDays) + hotelTotal;
    const difference = grandTotal - averageTotal;
    const percentDiff = Math.abs(Math.round((difference / averageTotal) * 100));

    if (budgetComparison) {
      let comparisonText = '';
      let comparisonClass = '';

      if (Math.abs(difference) < averageTotal * 0.05) {
        // Within 5% is similar
        comparisonText = `📊 Promedio para viajeros similares: ¥${averageTotal.toLocaleString()} - <span class="font-semibold">Tu presupuesto es similar</span>`;
        comparisonClass = 'text-green-800 dark:text-green-300';
      } else if (difference > 0) {
        comparisonText = `📊 Promedio para viajeros similares: ¥${averageTotal.toLocaleString()} - <span class="font-semibold">Tu presupuesto es ${percentDiff}% mayor</span>`;
        comparisonClass = 'text-yellow-800 dark:text-yellow-300';
      } else {
        comparisonText = `📊 Promedio para viajeros similares: ¥${averageTotal.toLocaleString()} - <span class="font-semibold">Tu presupuesto es ${percentDiff}% menor (¡Ahorro!)</span>`;
        comparisonClass = 'text-blue-800 dark:text-blue-300';
      }

      budgetComparison.innerHTML = comparisonText;
      budgetComparison.className = `text-xs ${comparisonClass}`;
    }

    console.log('📊 Preview actualizado:', { dailyTotal, hotelTotal, grandTotal });
  }
};

// Exportar globalmente
window.SmartGeneratorWizard = SmartGeneratorWizard;

console.log('✅ Smart Generator Wizard cargado');

export default SmartGeneratorWizard;
