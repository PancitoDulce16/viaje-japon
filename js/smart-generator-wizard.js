// js/smart-generator-wizard.js - UI Wizard para generador inteligente de itinerarios
// Wizard de 3 pasos que guía al usuario a crear un itinerario completo

/**
 * Smart Generator Wizard
 */
export const SmartGeneratorWizard = {

  currentStep: 1,
  wizardData: {
    // Step 1
    cities: [],
    totalDays: 7,
    dailyBudget: 10000,

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
    this.resetWizardData();
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
      interests: [],
      pace: 'moderate',
      startTime: 9,
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
            ¿Qué ciudades quieres visitar?
          </label>
          <div class="grid grid-cols-3 gap-3">
            ${this.renderCityCheckbox('Tokyo', '🗼')}
            ${this.renderCityCheckbox('Kyoto', '⛩️')}
            ${this.renderCityCheckbox('Osaka', '🏯')}
          </div>
          <p class="text-xs text-gray-500 mt-2">Selecciona al menos una ciudad</p>
        </div>

        <!-- Días totales -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ¿Cuántos días durará tu viaje?
          </label>
          <input
            type="number"
            id="totalDays"
            min="1"
            max="30"
            value="${this.wizardData.totalDays}"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Ej: 7"
          >
          <p class="text-xs text-gray-500 mt-1">Recomendamos 5-14 días para un viaje completo</p>
        </div>

        <!-- Presupuesto diario -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ¿Cuál es tu presupuesto diario? (JPY)
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
              class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: 10000"
            >
          </div>
          <div class="flex gap-2 mt-2">
            <button onclick="document.getElementById('dailyBudget').value = 5000" class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
              ¥5,000 (Económico)
            </button>
            <button onclick="document.getElementById('dailyBudget').value = 10000" class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
              ¥10,000 (Moderado)
            </button>
            <button onclick="document.getElementById('dailyBudget').value = 20000" class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
              ¥20,000 (Premium)
            </button>
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
          ${isChecked ? 'checked' : ''}
        >
        <span class="text-2xl">${icon}</span>
        <span class="font-semibold text-gray-700 dark:text-gray-200">${city}</span>
      </label>
    `;
  },

  /**
   * STEP 2: Preferencias (Intereses, Ritmo, Hora inicio)
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

    return `
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">❤️ Tus Preferencias</h3>

        <!-- Intereses -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ¿Qué te interesa? (Selecciona varios)
          </label>
          <div class="grid grid-cols-2 gap-3">
            ${allInterests.map(interest => this.renderInterestCheckbox(interest)).join('')}
          </div>
        </div>

        <!-- Ritmo del viaje -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ¿Qué ritmo prefieres?
          </label>
          <div class="grid grid-cols-3 gap-3">
            ${this.renderPaceOption('relaxed', 'Relajado', '🐢', '2-3 actividades/día')}
            ${this.renderPaceOption('moderate', 'Moderado', '🚶', '4-5 actividades/día')}
            ${this.renderPaceOption('intense', 'Intenso', '🏃', '6+ actividades/día')}
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

    // Step 2
    document.querySelectorAll('.interest-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.saveStep2Data());
    });

    document.querySelectorAll('.pace-radio').forEach(radio => {
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

    const startTimeSelect = document.getElementById('startTime');
    if (startTimeSelect) {
      this.wizardData.startTime = parseInt(startTimeSelect.value) || 9;
    }
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
   * Genera el itinerario usando el SmartItineraryGenerator
   */
  async generateItinerary() {
    if (!this.validateCurrentStep()) return;

    console.log('🚀 Generando itinerario con:', this.wizardData);

    // Mostrar loading
    const modal = document.getElementById('smartGeneratorWizard');
    if (modal) {
      modal.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">🧠 Generando tu itinerario...</h3>
            <p class="text-gray-600 dark:text-gray-400">Esto puede tomar unos segundos</p>
          </div>
        </div>
      `;
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
        hotels: hotelsWithCoords,
        mustSee: this.wizardData.mustSee,
        avoid: this.wizardData.avoid
      };

      console.log('📋 Perfil final:', profile);

      // Generar itinerario
      const itinerary = await window.SmartItineraryGenerator.generateCompleteItinerary(profile);

      console.log('✅ Itinerario generado:', itinerary);

      // Guardar itinerario generado
      await this.saveGeneratedItinerary(itinerary);

      // Cerrar modal
      this.close();

      // Mostrar éxito
      window.Notifications?.show('✅ ¡Itinerario generado exitosamente!', 'success');

      // Recargar la página para mostrar el nuevo itinerario
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Error generando itinerario:', error);
      window.Notifications?.show('❌ Error al generar itinerario: ' + error.message, 'error');
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
    } catch (error) {
      console.error('❌ Error guardando itinerario:', error);
      throw error;
    }
  }
};

// Exportar globalmente
window.SmartGeneratorWizard = SmartGeneratorWizard;

console.log('✅ Smart Generator Wizard cargado');

export default SmartGeneratorWizard;
