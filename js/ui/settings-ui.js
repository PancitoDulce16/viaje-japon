/**
 * ⚙️ INTERFAZ DE CONFIGURACIONES
 * =================================
 *
 * Renderiza la UI completa de configuraciones del usuario
 * con todas las secciones organizadas en tabs.
 */

class SettingsUI {
  constructor() {
    this.settings = window.UserSettings;
    this.currentTab = 'basic';
  }

  /**
   * 🎨 Renderiza la página completa de configuraciones
   */
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="settings-page max-w-6xl mx-auto p-6">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">⚙️ Configuración</h1>
          <p class="text-gray-600 dark:text-gray-400">Personaliza tu experiencia en Japitin</p>
        </div>

        <!-- Tabs Navigation -->
        <div class="tabs-navigation mb-6 overflow-x-auto">
          <div class="flex gap-2 border-b border-gray-200 dark:border-gray-700 min-w-max">
            ${this.renderTabButtons()}
          </div>
        </div>

        <!-- Tab Content -->
        <div id="settings-tab-content" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          ${this.renderTabContent(this.currentTab)}
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex gap-4 justify-end">
          <button onclick="SettingsUIInstance.exportSettings()" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
            📥 Exportar Configuración
          </button>
          <button onclick="SettingsUIInstance.importSettings()" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
            📤 Importar Configuración
          </button>
          <button onclick="SettingsUIInstance.resetToDefaults()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            🔄 Restaurar Valores Predeterminados
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * 🎯 Renderiza botones de tabs
   */
  renderTabButtons() {
    const tabs = [
      { id: 'basic', icon: '👤', label: 'Datos Básicos' },
      { id: 'app', icon: '🎨', label: 'Aplicación' },
      { id: 'notifications', icon: '🔔', label: 'Notificaciones' },
      { id: 'ai', icon: '🧠', label: 'Inteligencia Artificial' },
      { id: 'itinerary', icon: '🗺️', label: 'Itinerarios' },
      { id: 'travel', icon: '✈️', label: 'Preferencias de Viaje' },
      { id: 'security', icon: '🔒', label: 'Seguridad' },
      { id: 'privacy', icon: '🛡️', label: 'Privacidad' },
      { id: 'export-import', icon: '📦', label: 'Exportar/Importar' },
      { id: 'advanced', icon: '⚡', label: 'Avanzado' }
    ];

    return tabs.map(tab => `
      <button
        class="tab-btn px-4 py-3 font-semibold transition-colors ${
          this.currentTab === tab.id
            ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
            : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
        }"
        data-tab="${tab.id}"
        onclick="SettingsUIInstance.switchTab('${tab.id}')"
      >
        <span class="mr-2">${tab.icon}</span>
        <span>${tab.label}</span>
      </button>
    `).join('');
  }

  /**
   * 📄 Renderiza contenido del tab actual
   */
  renderTabContent(tabId) {
    switch (tabId) {
      case 'basic':
        return this.renderBasicInfo();
      case 'app':
        return this.renderAppConfig();
      case 'notifications':
        return this.renderNotifications();
      case 'ai':
        return this.renderAIConfig();
      case 'itinerary':
        return this.renderItineraryConfig();
      case 'travel':
        return this.renderTravelPreferences();
      case 'security':
        return this.renderSecurity();
      case 'privacy':
        return this.renderPrivacy();
      case 'export-import':
        return this.renderExportImport();
      case 'advanced':
        return this.renderAdvanced();
      default:
        return '<p>Tab no encontrado</p>';
    }
  }

  /**
   * 👤 Datos Básicos
   */
  renderBasicInfo() {
    const data = this.settings.getSetting('basicInfo');

    return `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">👤 Datos Básicos</h2>

        <!-- Nombre -->
        <div>
          <label class="block font-semibold mb-2">Nombre Completo</label>
          <input
            type="text"
            value="${data.displayName || ''}"
            onchange="SettingsUIInstance.updateSetting('basicInfo.displayName', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            placeholder="Tu nombre"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block font-semibold mb-2">Correo Electrónico</label>
          <input
            type="email"
            value="${data.email || ''}"
            onchange="SettingsUIInstance.updateSetting('basicInfo.email', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <!-- País de Origen -->
        <div>
          <label class="block font-semibold mb-2">🌍 País de Residencia</label>
          <select
            onchange="SettingsUIInstance.updateSetting('basicInfo.originCountry', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            ${this.renderCountryOptions(data.originCountry)}
          </select>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Se usa para conversión de moneda y relevancia cultural
          </p>
        </div>

        <!-- Moneda Preferida -->
        <div>
          <label class="block font-semibold mb-2">💰 Moneda Preferida</label>
          <select
            onchange="SettingsUIInstance.updateSetting('basicInfo.preferredCurrency', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            ${this.renderCurrencyOptions(data.preferredCurrency)}
          </select>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            💱 Conversión automática usando tasas de cambio en tiempo real (API Exchange Rate)
          </p>
        </div>

        <!-- Teléfono -->
        <div>
          <label class="block font-semibold mb-2">📱 Teléfono (Opcional)</label>
          <input
            type="tel"
            value="${data.phoneNumber || ''}"
            onchange="SettingsUIInstance.updateSetting('basicInfo.phoneNumber', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            placeholder="+52 1 234 567 8900"
          />
        </div>
      </div>
    `;
  }

  /**
   * 🎨 Configuración de la Aplicación
   */
  renderAppConfig() {
    const data = this.settings.getSetting('appConfig');

    return `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">🎨 Configuración de la Aplicación</h2>

        <!-- Idioma -->
        <div>
          <label class="block font-semibold mb-2">🌐 Idioma de la Aplicación</label>
          <select
            onchange="SettingsUIInstance.updateSetting('appConfig.language', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="es" ${data.language === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
            <option value="en" ${data.language === 'en' ? 'selected' : ''}>🇺🇸 English</option>
            <option value="ja" ${data.language === 'ja' ? 'selected' : ''}>🇯🇵 日本語</option>
          </select>
        </div>

        <!-- Tema -->
        <div>
          <label class="block font-semibold mb-2">🌓 Tema de Color</label>
          <div class="grid grid-cols-3 gap-4">
            ${this.renderRadioButton('appConfig.theme', 'light', '☀️ Claro', data.theme === 'light')}
            ${this.renderRadioButton('appConfig.theme', 'dark', '🌙 Oscuro', data.theme === 'dark')}
            ${this.renderRadioButton('appConfig.theme', 'auto', '🔄 Automático', data.theme === 'auto')}
          </div>
        </div>

        <!-- Tamaño de Fuente -->
        <div>
          <label class="block font-semibold mb-2">📏 Tamaño de Fuente</label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${this.renderRadioButton('appConfig.fontSize', 'small', 'Pequeña', data.fontSize === 'small')}
            ${this.renderRadioButton('appConfig.fontSize', 'medium', 'Mediana', data.fontSize === 'medium')}
            ${this.renderRadioButton('appConfig.fontSize', 'large', 'Grande', data.fontSize === 'large')}
            ${this.renderRadioButton('appConfig.fontSize', 'xlarge', 'Muy Grande', data.fontSize === 'xlarge')}
          </div>
        </div>

        <!-- Accesibilidad -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">♿ Accesibilidad</h3>

          ${this.renderToggle('appConfig.highContrast', '🎨 Contraste Alto', data.highContrast)}
          ${this.renderToggle('appConfig.screenReaderSupport', '📢 Soporte de Lector de Pantalla', data.screenReaderSupport)}
        </div>
      </div>
    `;
  }

  /**
   * 🔔 Notificaciones
   */
  renderNotifications() {
    const data = this.settings.getSetting('notifications');

    return `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">🔔 Preferencias de Notificaciones</h2>

        <!-- Método de Notificación -->
        <div>
          <label class="block font-semibold mb-2">📧 Método de Notificación Preferido</label>
          <select
            onchange="SettingsUIInstance.updateSetting('notifications.method', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="in-app" ${data.method === 'in-app' ? 'selected' : ''}>📱 En la Aplicación</option>
            <option value="email" ${data.method === 'email' ? 'selected' : ''}>📧 Correo Electrónico</option>
            <option value="both" ${data.method === 'both' ? 'selected' : ''}>📱📧 Ambos</option>
            <option value="none" ${data.method === 'none' ? 'selected' : ''}>🔇 Ninguno</option>
          </select>
        </div>

        <!-- Tipos de Alertas -->
        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">⚠️ Tipos de Alertas</h3>

          ${this.renderToggle('notifications.lastMinuteAlerts', '🚨 Alertas de Último Minuto', data.lastMinuteAlerts, 'Cancelaciones de trenes, cierres inesperados')}
          ${this.renderToggle('notifications.weatherAlerts', '🌦️ Notificaciones de Clima', data.weatherAlerts, 'Alertas de vestimenta según el clima')}
          ${this.renderToggle('notifications.proactiveSuggestions', '💡 Sugerencias Proactivas de la IA', data.proactiveSuggestions, 'Recomendaciones automáticas en el itinerario')}
        </div>

        <!-- Notificaciones Generales -->
        <div class="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">📬 Notificaciones Generales</h3>

          ${this.renderToggle('notifications.marketingEmails', '📰 Correo de Marketing/Novedades', data.marketingEmails)}
          ${this.renderToggle('notifications.accountAlerts', '🔐 Alertas de Cuenta', data.accountAlerts, 'Cambios de seguridad e intentos de inicio de sesión')}
        </div>

        <!-- Frecuencia de Emails -->
        <div>
          <label class="block font-semibold mb-2">📨 Frecuencia de Emails</label>
          <select
            onchange="SettingsUIInstance.updateSetting('notifications.emailFrequency', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="all" ${data.emailFrequency === 'all' ? 'selected' : ''}>Todos los correos</option>
            <option value="important" ${data.emailFrequency === 'important' ? 'selected' : ''}>Solo importantes</option>
            <option value="none" ${data.emailFrequency === 'none' ? 'selected' : ''}>Ninguno</option>
          </select>
        </div>
      </div>
    `;
  }

  /**
   * 🧠 Configuración de IA
   */
  renderAIConfig() {
    const data = this.settings.getSetting('aiConfig');

    return `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">🧠 Configuración Específica de IA</h2>

        <!-- Prioridad de Optimización -->
        <div>
          <label class="block font-semibold mb-2">🎯 Prioridad de Optimización de Rutas</label>
          <select
            onchange="SettingsUIInstance.updateSetting('aiConfig.optimizationPriority', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="time" ${data.optimizationPriority === 'time' ? 'selected' : ''}>⏱️ Minimizar Tiempo de Viaje</option>
            <option value="cost" ${data.optimizationPriority === 'cost' ? 'selected' : ''}>💰 Minimizar Costo de Transporte</option>
            <option value="crowds" ${data.optimizationPriority === 'crowds' ? 'selected' : ''}>👥 Evitar Multitudes</option>
            <option value="balanced" ${data.optimizationPriority === 'balanced' ? 'selected' : ''}>⚖️ Balanceado</option>
          </select>
        </div>

        <!-- Umbral de Novedad -->
        <div>
          <label class="block font-semibold mb-2">🗺️ Umbral de Novedad</label>
          <div class="grid grid-cols-3 gap-4">
            ${this.renderRadioButton('aiConfig.noveltyThreshold', 'famous', '⭐ Lugares Famosos (Seguro)', data.noveltyThreshold === 'famous')}
            ${this.renderRadioButton('aiConfig.noveltyThreshold', 'mixed', '🎭 Mezcla', data.noveltyThreshold === 'mixed')}
            ${this.renderRadioButton('aiConfig.noveltyThreshold', 'hidden', '🔍 Lugares Escondidos (Aventura)', data.noveltyThreshold === 'hidden')}
          </div>
        </div>

        <!-- Filtros de Exclusión -->
        <div>
          <label class="block font-semibold mb-2">🚫 Filtros de Exclusión</label>
          <textarea
            onchange="SettingsUIInstance.updateSetting('aiConfig.exclusionFilters', this.value.split(',').map(x => x.trim()).filter(Boolean))"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            rows="3"
            placeholder="Ej: museos de arte moderno, parques de atracciones, karaoke"
          >${(data.exclusionFilters || []).join(', ')}</textarea>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Separa con comas las categorías que nunca quieres que se te recomienden
          </p>
        </div>

        <!-- Configuraciones de IA -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">🤖 Control de Sugerencias de IA</h3>

          ${this.renderToggle('aiConfig.aiSuggestionsEnabled', '💡 Habilitar Sugerencias de IA', data.aiSuggestionsEnabled)}
          ${this.renderToggle('aiConfig.autoOptimizeRoutes', '🧬 Auto-Optimizar Rutas con Algoritmo Genético', data.autoOptimizeRoutes)}
          ${this.renderToggle('aiConfig.learnFromBehavior', '📚 Aprender de mi Comportamiento', data.learnFromBehavior)}
          ${this.renderToggle('aiConfig.mlInsightsEnabled', '📊 Mostrar Insights de ML', data.mlInsightsEnabled)}
        </div>

        <!-- Nivel de Personalización -->
        <div>
          <label class="block font-semibold mb-2">🎨 Nivel de Personalización</label>
          <select
            onchange="SettingsUIInstance.updateSetting('aiConfig.personalizationLevel', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="low" ${data.personalizationLevel === 'low' ? 'selected' : ''}>Bajo - Recomendaciones generales</option>
            <option value="medium" ${data.personalizationLevel === 'medium' ? 'selected' : ''}>Medio - Balance</option>
            <option value="high" ${data.personalizationLevel === 'high' ? 'selected' : ''}>Alto - Altamente personalizado</option>
          </select>
        </div>

        <!-- Privacidad de Datos -->
        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">🔒 Privacidad de Datos de ML</h3>

          ${this.renderToggle('aiConfig.allowAnonymousDataUsage', '📈 Permitir Anonimización de Datos', data.allowAnonymousDataUsage, 'Tus itinerarios se usarán (de forma anónima) para mejorar el sistema de recomendación')}
        </div>
      </div>
    `;
  }

  /**
   * 🗺️ Configuración de Itinerarios
   */
  renderItineraryConfig() {
    const data = this.settings.getSetting('itineraryConfig');

    return `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">🗺️ Configuración de Itinerarios</h2>

        <!-- Vista Predeterminada -->
        <div>
          <label class="block font-semibold mb-2">👁️ Vista Predeterminada de Itinerarios</label>
          <div class="grid grid-cols-3 gap-4">
            ${this.renderRadioButton('itineraryConfig.defaultView', 'map', '🗺️ Vista de Mapa', data.defaultView === 'map')}
            ${this.renderRadioButton('itineraryConfig.defaultView', 'list', '📋 Vista de Lista', data.defaultView === 'list')}
            ${this.renderRadioButton('itineraryConfig.defaultView', 'calendar', '📅 Vista de Calendario', data.defaultView === 'calendar')}
          </div>
        </div>

        <!-- Unidades de Medida -->
        <div>
          <label class="block font-semibold mb-2">📏 Unidades de Medida</label>
          <div class="grid grid-cols-2 gap-4">
            ${this.renderRadioButton('itineraryConfig.measurementUnits', 'metric', '📏 Métrico (km, m)', data.measurementUnits === 'metric')}
            ${this.renderRadioButton('itineraryConfig.measurementUnits', 'imperial', '📐 Imperial (mi, ft)', data.measurementUnits === 'imperial')}
          </div>
        </div>

        <!-- Nivel de Detalle de Costos -->
        <div>
          <label class="block font-semibold mb-2">💰 Nivel de Detalle del Costo</label>
          <div class="grid grid-cols-3 gap-4">
            ${this.renderRadioButton('itineraryConfig.priceDetailLevel', 'exact', '¥15,000', data.priceDetailLevel === 'exact')}
            ${this.renderRadioButton('itineraryConfig.priceDetailLevel', 'range', '$$', data.priceDetailLevel === 'range')}
            ${this.renderRadioButton('itineraryConfig.priceDetailLevel', 'hidden', '🚫 Ocultar', data.priceDetailLevel === 'hidden')}
          </div>
        </div>

        <!-- Opciones de Visualización -->
        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">👁️ Opciones de Visualización</h3>

          ${this.renderToggle('itineraryConfig.roundPriceConversion', '🔢 Redondear Conversión de Precios', data.roundPriceConversion)}
          ${this.renderToggle('itineraryConfig.showTransitTime', '🚇 Mostrar Tiempo de Tránsito', data.showTransitTime)}
          ${this.renderToggle('itineraryConfig.showWalkingDistance', '🚶 Mostrar Distancia de Caminata', data.showWalkingDistance)}
        </div>

        <!-- Guardado Automático -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">💾 Guardado Automático</h3>

          ${this.renderToggle('itineraryConfig.autoSaveEnabled', '🔄 Habilitar Guardado Automático', data.autoSaveEnabled)}

          ${data.autoSaveEnabled ? `
            <div class="mt-4">
              <label class="block font-semibold mb-2">⏱️ Intervalo de Guardado (minutos)</label>
              <input
                type="number"
                value="${data.autoSaveInterval || 5}"
                min="1"
                max="60"
                onchange="SettingsUIInstance.updateSetting('itineraryConfig.autoSaveInterval', parseInt(this.value))"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * ✈️ Preferencias de Viaje
   */
  renderTravelPreferences() {
    const data = this.settings.getSetting('travelPreferences');

    return `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">✈️ Preferencias de Viaje</h2>

        <!-- Estilo de Viaje -->
        <div>
          <label class="block font-semibold mb-2">🎭 Estilo de Viaje</label>
          <select
            onchange="SettingsUIInstance.updateSetting('travelPreferences.travelStyle', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="explorer" ${data.travelStyle === 'explorer' ? 'selected' : ''}>🗺️ Explorador</option>
            <option value="foodie" ${data.travelStyle === 'foodie' ? 'selected' : ''}>🍜 Foodie</option>
            <option value="photographer" ${data.travelStyle === 'photographer' ? 'selected' : ''}>📸 Fotógrafo</option>
            <option value="culture" ${data.travelStyle === 'culture' ? 'selected' : ''}>🏯 Amante Cultural</option>
            <option value="nature" ${data.travelStyle === 'nature' ? 'selected' : ''}>🌸 Naturaleza</option>
            <option value="urban" ${data.travelStyle === 'urban' ? 'selected' : ''}>🏙️ Urbano</option>
          </select>
        </div>

        <!-- Nivel de Ritmo -->
        <div>
          <label class="block font-semibold mb-2">⚡ Nivel de Ritmo</label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${this.renderRadioButton('travelPreferences.paceLevel', 'relaxed', '🐢 Relajado', data.paceLevel === 'relaxed')}
            ${this.renderRadioButton('travelPreferences.paceLevel', 'moderate', '🚶 Moderado', data.paceLevel === 'moderate')}
            ${this.renderRadioButton('travelPreferences.paceLevel', 'intense', '🏃 Intenso', data.paceLevel === 'intense')}
            ${this.renderRadioButton('travelPreferences.paceLevel', 'extreme', '⚡ Extremo', data.paceLevel === 'extreme')}
          </div>
        </div>

        <!-- Nivel de Presupuesto -->
        <div>
          <label class="block font-semibold mb-2">💰 Nivel de Presupuesto</label>
          <div class="grid grid-cols-3 gap-4">
            ${this.renderRadioButton('travelPreferences.budgetLevel', 'budget', '🏦 Económico', data.budgetLevel === 'budget')}
            ${this.renderRadioButton('travelPreferences.budgetLevel', 'moderate', '💳 Moderado', data.budgetLevel === 'moderate')}
            ${this.renderRadioButton('travelPreferences.budgetLevel', 'luxury', '💎 Lujo', data.budgetLevel === 'luxury')}
          </div>
        </div>

        <!-- Preferencias de Transporte -->
        <div>
          <label class="block font-semibold mb-2">🚇 Transporte Preferido</label>
          <select
            onchange="SettingsUIInstance.updateSetting('travelPreferences.preferredTransport', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="public" ${data.preferredTransport === 'public' ? 'selected' : ''}>🚇 Transporte Público</option>
            <option value="walk" ${data.preferredTransport === 'walk' ? 'selected' : ''}>🚶 Principalmente Caminata</option>
            <option value="mix" ${data.preferredTransport === 'mix' ? 'selected' : ''}>🔄 Mezcla de ambos</option>
          </select>
        </div>

        <!-- Horarios Preferidos -->
        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">⏰ Horarios Preferidos</h3>

          ${this.renderToggle('travelPreferences.morningPerson', '🌅 Madrugador (Empezar temprano)', data.morningPerson)}
          ${this.renderToggle('travelPreferences.nightOwl', '🌙 Noctámbulo (Actividades nocturnas)', data.nightOwl)}
        </div>

        <!-- Restricciones -->
        <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">⚠️ Restricciones</h3>

          ${this.renderToggle('travelPreferences.mobilityRestrictions', '♿ Restricciones de Movilidad', data.mobilityRestrictions)}

          <!-- Restricciones Dietéticas -->
          <div class="mt-4">
            <label class="block font-semibold mb-2">🥗 Restricciones Dietéticas</label>
            <div class="space-y-2">
              ${this.renderCheckbox('travelPreferences.dietaryRestrictions', 'vegetarian', '🥗 Vegetariano', (data.dietaryRestrictions || []).includes('vegetarian'))}
              ${this.renderCheckbox('travelPreferences.dietaryRestrictions', 'vegan', '🌱 Vegano', (data.dietaryRestrictions || []).includes('vegan'))}
              ${this.renderCheckbox('travelPreferences.dietaryRestrictions', 'halal', '🕌 Halal', (data.dietaryRestrictions || []).includes('halal'))}
              ${this.renderCheckbox('travelPreferences.dietaryRestrictions', 'kosher', '✡️ Kosher', (data.dietaryRestrictions || []).includes('kosher'))}
              ${this.renderCheckbox('travelPreferences.dietaryRestrictions', 'gluten-free', '🌾 Sin Gluten', (data.dietaryRestrictions || []).includes('gluten-free'))}
            </div>
          </div>
        </div>

        <!-- Intereses (Sliders) -->
        <div>
          <h3 class="font-semibold mb-3">🎯 Intereses (0-10)</h3>
          <div class="space-y-4">
            ${this.renderSlider('travelPreferences.interests.culture', '🏯 Cultura', data.interests?.culture || 5)}
            ${this.renderSlider('travelPreferences.interests.food', '🍜 Comida', data.interests?.food || 5)}
            ${this.renderSlider('travelPreferences.interests.nature', '🌸 Naturaleza', data.interests?.nature || 5)}
            ${this.renderSlider('travelPreferences.interests.shopping', '🛍️ Compras', data.interests?.shopping || 5)}
            ${this.renderSlider('travelPreferences.interests.nightlife', '🌃 Vida Nocturna', data.interests?.nightlife || 5)}
            ${this.renderSlider('travelPreferences.interests.photography', '📸 Fotografía', data.interests?.photography || 5)}
            ${this.renderSlider('travelPreferences.interests.anime', '🎌 Anime/Manga', data.interests?.anime || 5)}
            ${this.renderSlider('travelPreferences.interests.technology', '💻 Tecnología', data.interests?.technology || 5)}
            ${this.renderSlider('travelPreferences.interests.history', '📚 Historia', data.interests?.history || 5)}
            ${this.renderSlider('travelPreferences.interests.art', '🎨 Arte', data.interests?.art || 5)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 🔒 Seguridad
   */
  renderSecurity() {
    const data = this.settings.getSetting('security');

    return `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">🔒 Seguridad y Cuenta</h2>

        <!-- Cambiar Contraseña -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 class="font-semibold mb-4">🔑 Cambiar Contraseña</h3>
          <button onclick="SettingsUIInstance.changePassword()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Cambiar Contraseña
          </button>
        </div>

        <!-- Autenticación de Dos Factores -->
        <div class="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <h3 class="font-semibold mb-4">🔐 Autenticación de Dos Factores (2FA)</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Agrega una capa extra de seguridad a tu cuenta
          </p>

          ${this.renderToggle('security.twoFactorEnabled', '🛡️ Habilitar 2FA', data.twoFactorEnabled)}

          ${!data.twoFactorEnabled ? `
            <button onclick="SettingsUIInstance.enable2FA()" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Configurar 2FA
            </button>
          ` : ''}
        </div>

        <!-- Sesiones y Dispositivos -->
        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 class="font-semibold mb-4">📱 Sesiones Activas</h3>

          ${this.renderToggle('security.deviceTracking', '📍 Rastrear Dispositivos', data.deviceTracking)}
          ${this.renderToggle('security.loginNotifications', '🔔 Notificar Nuevos Inicios de Sesión', data.loginNotifications)}

          <div class="mt-4">
            <label class="block font-semibold mb-2">⏱️ Tiempo de Sesión (días)</label>
            <input
              type="number"
              value="${data.sessionTimeout || 30}"
              min="1"
              max="90"
              onchange="SettingsUIInstance.updateSetting('security.sessionTimeout', parseInt(this.value))"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>

          <button onclick="SettingsUIInstance.viewActiveSessions()" class="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
            Ver Sesiones Activas
          </button>
        </div>

        <!-- Exportar/Eliminar Datos -->
        <div class="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <h3 class="font-semibold mb-4 text-red-700 dark:text-red-400">⚠️ Zona de Peligro</h3>

          <button onclick="SettingsUIInstance.exportUserData()" class="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full">
            📥 Exportar Mis Datos
          </button>

          <button onclick="SettingsUIInstance.deleteAccount()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full">
            🗑️ Eliminar Cuenta Permanentemente
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 🛡️ Privacidad
   */
  renderPrivacy() {
    const data = this.settings.getSetting('privacy');

    return `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">🛡️ Privacidad</h2>

        <!-- Visibilidad del Perfil -->
        <div>
          <label class="block font-semibold mb-2">👁️ Visibilidad del Perfil</label>
          <select
            onchange="SettingsUIInstance.updateSetting('privacy.profileVisibility', this.value)"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="public" ${data.profileVisibility === 'public' ? 'selected' : ''}>🌍 Público</option>
            <option value="friends" ${data.profileVisibility === 'friends' ? 'selected' : ''}>👥 Solo Amigos</option>
            <option value="private" ${data.profileVisibility === 'private' ? 'selected' : ''}>🔒 Privado</option>
          </select>
        </div>

        <!-- Opciones de Compartir -->
        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">📤 Compartir</h3>

          ${this.renderToggle('privacy.shareItineraries', '🗺️ Permitir Compartir Itinerarios', data.shareItineraries)}
          ${this.renderToggle('privacy.allowDataExport', '📊 Permitir Exportación de Datos', data.allowDataExport)}
        </div>

        <!-- Rastreo y Cookies -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">🍪 Rastreo y Cookies</h3>

          ${this.renderToggle('privacy.trackingConsent', '📍 Consentimiento de Rastreo', data.trackingConsent)}
          ${this.renderToggle('privacy.cookiesConsent', '🍪 Cookies Esenciales', data.cookiesConsent)}

          <p class="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Las cookies esenciales son necesarias para el funcionamiento de la aplicación
          </p>
        </div>

        <!-- Integraciones Sociales -->
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 class="font-semibold mb-3">🔗 Integraciones Conectadas</h3>

          <div class="space-y-2">
            ${this.renderIntegrationStatus('Google', this.settings.getSetting('integrations.googleConnected', false))}
            ${this.renderIntegrationStatus('Apple', this.settings.getSetting('integrations.appleConnected', false))}
            ${this.renderIntegrationStatus('Facebook', this.settings.getSetting('integrations.facebookConnected', false))}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * ⚡ Avanzado
   */
  renderAdvanced() {
    const data = this.settings.getSetting('advanced');
    const syncData = this.settings.getSetting('sync');

    return `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">⚡ Configuración Avanzada</h2>

        <!-- Sincronización -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 class="font-semibold mb-4">🔄 Sincronización y Respaldo</h3>

          ${this.renderToggle('sync.autoBackup', '💾 Respaldo Automático', syncData.autoBackup)}
          ${this.renderToggle('sync.cloudSyncEnabled', '☁️ Sincronización en la Nube', syncData.cloudSyncEnabled)}
          ${this.renderToggle('sync.offlineMode', '📴 Modo Sin Conexión', syncData.offlineMode)}

          <div class="mt-4">
            <label class="block font-semibold mb-2">⏱️ Frecuencia de Respaldo</label>
            <select
              onchange="SettingsUIInstance.updateSetting('sync.backupFrequency', this.value)"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="continuous" ${syncData.backupFrequency === 'continuous' ? 'selected' : ''}>Continuo</option>
              <option value="daily" ${syncData.backupFrequency === 'daily' ? 'selected' : ''}>Diario</option>
              <option value="manual" ${syncData.backupFrequency === 'manual' ? 'selected' : ''}>Manual</option>
            </select>
          </div>

          ${this.renderToggle('sync.dataSaverMode', '📶 Modo Ahorro de Datos', syncData.dataSaverMode, 'Reduce la calidad de imágenes en conexiones lentas')}
        </div>

        <!-- Modo Desarrollador -->
        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 class="font-semibold mb-4">👨‍💻 Opciones de Desarrollador</h3>

          ${this.renderToggle('advanced.developerMode', '🛠️ Modo Desarrollador', data.developerMode)}
          ${this.renderToggle('advanced.debugMode', '🐛 Modo Debug', data.debugMode)}
          ${this.renderToggle('advanced.experimentalFeatures', '🧪 Features Experimentales', data.experimentalFeatures)}
          ${this.renderToggle('advanced.betaTester', '🚀 Beta Tester', data.betaTester)}
        </div>

        <!-- Información del Sistema -->
        <div class="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-lg">
          <h3 class="font-semibold mb-4">ℹ️ Información del Sistema</h3>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Versión:</span>
              <span class="font-semibold">${this.settings.getSetting('metadata.version')}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Última Actualización:</span>
              <span class="font-semibold">${new Date(this.settings.getSetting('metadata.updatedAt')).toLocaleDateString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Último Sincronización:</span>
              <span class="font-semibold">${this.settings.getSetting('metadata.lastSync') || 'Nunca'}</span>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <button onclick="window.open('/about', '_blank')" class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              📖 Acerca de Japitin
            </button>
            <button onclick="window.open('/licenses', '_blank')" class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              📜 Licencias y Créditos
            </button>
            <button onclick="window.open('/help', '_blank')" class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              ❓ Ayuda y Soporte
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 📦 Export/Import
   */
  renderExportImport() {
    return window.ExportImportSystem?.renderUI() || `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span>📦</span>
          <span>Exportar e Importar Datos</span>
        </h3>

        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Respalda tus viajes, preferencias y archivos accesibles. La restauración crea copias privadas sin reemplazar tus viajes actuales.
        </p>

        <!-- EXPORTAR -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">📤 Exportar</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onclick="window.ExportImportSystem?.exportAll()"
              class="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              <span>💾</span>
              <span>Exportar Todo (JSON)</span>
            </button>

            <button
              onclick="window.ExportImportSystem?.backupToCloud()"
              class="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
            >
              <span>☁️</span>
              <span>Backup a la Nube</span>
            </button>
          </div>
        </div>

        <!-- IMPORTAR -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">📥 Importar</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label class="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold cursor-pointer transition">
              <span>📂</span>
              <span>Importar desde Archivo</span>
              <input
                type="file"
                accept=".json"
                onchange="if(this.files[0]) window.ExportImportSystem?.importAll(this.files[0])"
                class="hidden"
              >
            </label>

            <button
              onclick="window.ExportImportSystem?.restoreFromCloud()"
              class="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
            >
              <span>☁️</span>
              <span>Restaurar de la Nube</span>
            </button>
          </div>
        </div>

        <!-- INFORMACIÓN -->
        <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            <strong>💡 Consejo:</strong> Exporta tus datos regularmente para tener un respaldo.
            El backup en la nube requiere inicio de sesión.
          </p>
        </div>

        <!-- ACCIONES RÁPIDAS DE CONFIGURACIÓN -->
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">⚙️ Exportar/Importar Solo Configuraciones</h4>

          <div class="flex gap-3">
            <button
              onclick="window.UserSettings?.exportSettings()"
              class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition"
            >
              📥 Exportar Config
            </button>

            <label class="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".json"
                onchange="if(this.files[0]) { const reader = new FileReader(); reader.onload = (e) => window.UserSettings?.importSettings(e.target.result); reader.readAsText(this.files[0]); }"
                class="hidden"
              >
              <div class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition text-center">
                📤 Importar Config
              </div>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  // ====================================
  // HELPER METHODS PARA RENDERIZADO
  // ====================================

  renderToggle(path, label, checked, description = '') {
    return `
      <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
        <div class="flex-1">
          <label class="font-semibold cursor-pointer">${label}</label>
          ${description ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${description}</p>` : ''}
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            ${checked ? 'checked' : ''}
            onchange="SettingsUIInstance.updateSetting('${path}', this.checked)"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
        </label>
      </div>
    `;
  }

  renderRadioButton(path, value, label, checked) {
    return `
      <label class="relative flex items-center p-3 rounded-lg border-2 cursor-pointer ${
        checked ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-600'
      }">
        <input
          type="radio"
          name="${path}"
          value="${value}"
          ${checked ? 'checked' : ''}
          onchange="SettingsUIInstance.updateSetting('${path}', '${value}')"
          class="mr-3"
        />
        <span class="font-semibold">${label}</span>
      </label>
    `;
  }

  renderCheckbox(path, value, label, checked) {
    return `
      <label class="flex items-center cursor-pointer">
        <input
          type="checkbox"
          ${checked ? 'checked' : ''}
          onchange="SettingsUIInstance.updateArraySetting('${path}', '${value}', this.checked)"
          class="mr-3 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <span>${label}</span>
      </label>
    `;
  }

  renderSlider(path, label, value) {
    return `
      <div>
        <div class="flex justify-between mb-2">
          <label class="font-semibold">${label}</label>
          <span id="${path}-value" class="font-bold text-purple-600 dark:text-purple-400">${value}/10</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value="${value}"
          oninput="document.getElementById('${path}-value').textContent = this.value + '/10'"
          onchange="SettingsUIInstance.updateSetting('${path}', parseInt(this.value))"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
      </div>
    `;
  }

  renderCountryOptions(selected) {
    const countries = [
      { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦' },
      { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
      { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
      { code: 'CL', name: 'Chile', flag: '🇨🇱' },
      { code: 'PE', name: 'Peru', flag: '🇵🇪' },
      { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
      { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
      { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
      { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
      { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
      { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
      { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
      { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
      { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
      { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
      { code: 'PA', name: 'Panama', flag: '🇵🇦' },
      { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
      { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
      { code: 'ES', name: 'Spain', flag: '🇪🇸' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'IT', name: 'Italy', flag: '🇮🇹' },
      { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
      { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
      { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
      { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
      { code: 'AT', name: 'Austria', flag: '🇦🇹' },
      { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
      { code: 'NO', name: 'Norway', flag: '🇳🇴' },
      { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
      { code: 'FI', name: 'Finland', flag: '🇫🇮' },
      { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
      { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
      { code: 'PL', name: 'Poland', flag: '🇵🇱' },
      { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
      { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
      { code: 'RO', name: 'Romania', flag: '🇷🇴' },
      { code: 'GR', name: 'Greece', flag: '🇬🇷' },
      { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
      { code: 'RU', name: 'Russia', flag: '🇷🇺' },
      { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵' },
      { code: 'CN', name: 'China', flag: '🇨🇳' },
      { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
      { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
      { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
      { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
      { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
      { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
      { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
      { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
      { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
      { code: 'IN', name: 'India', flag: '🇮🇳' },
      { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
      { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
      { code: 'AU', name: 'Australia', flag: '🇦🇺' },
      { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
      { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
      { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
      { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
      { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
      { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
      { code: 'IL', name: 'Israel', flag: '🇮🇱' },
      { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
      { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' }
    ];

    return countries
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(country =>
        `<option value="${country.name}" ${selected === country.name ? 'selected' : ''}>
          ${country.flag} ${country.name}
        </option>`
      ).join('');
  }

  renderCurrencyOptions(selected) {
    const currencies = [
      // Américas
      { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
      { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
      { code: 'CRC', name: 'Costa Rican Colón', flag: '🇨🇷' },
      { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
      { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
      { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷' },
      { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱' },
      { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴' },
      { code: 'PEN', name: 'Peruvian Sol', flag: '🇵🇪' },
      { code: 'UYU', name: 'Uruguayan Peso', flag: '🇺🇾' },
      // Europa
      { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
      { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
      { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
      { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
      { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
      { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' },
      { code: 'PLN', name: 'Polish Złoty', flag: '🇵🇱' },
      { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿' },
      { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺' },
      { code: 'RON', name: 'Romanian Leu', flag: '🇷🇴' },
      { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
      { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
      // Asia-Pacífico
      { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
      { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
      { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
      { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
      { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
      { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
      { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
      { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭' },
      { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳' },
      { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩' },
      { code: 'TWD', name: 'Taiwan Dollar', flag: '🇹🇼' },
      { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
      { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
      { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
      // África y Medio Oriente
      { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
      { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
      { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦' },
      { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
      { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
      { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
      { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
      { code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱' }
    ];

    return currencies.map(curr =>
      `<option value="${curr.code}" ${selected === curr.code ? 'selected' : ''}>
        ${curr.flag} ${curr.name} (${curr.code})
      </option>`
    ).join('');
  }

  renderIntegrationStatus(name, connected) {
    return `
      <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
        <span class="font-semibold">${name}</span>
        ${connected
          ? `<button onclick="SettingsUIInstance.disconnectIntegration('${name.toLowerCase()}')" class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Desconectar</button>`
          : `<button onclick="SettingsUIInstance.connectIntegration('${name.toLowerCase()}')" class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Conectar</button>`
        }
      </div>
    `;
  }

  // ====================================
  // MÉTODOS DE INTERACCIÓN
  // ====================================

  switchTab(tabId) {
    this.currentTab = tabId;
    const content = document.getElementById('settings-tab-content');
    if (content) {
      content.innerHTML = this.renderTabContent(tabId);
    }

    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('text-purple-600', 'dark:text-purple-400', 'border-b-2', 'border-purple-600');
        btn.classList.remove('text-gray-600', 'dark:text-gray-400');
      } else {
        btn.classList.remove('text-purple-600', 'dark:text-purple-400', 'border-b-2', 'border-purple-600');
        btn.classList.add('text-gray-600', 'dark:text-gray-400');
      }
    });
  }

  updateSetting(path, value) {
    this.settings.updateSetting(path, value);

    // Aplicar cambios inmediatos si es necesario
    if (path === 'appConfig.theme') {
      this.settings.applyTheme();
    } else if (path === 'appConfig.fontSize') {
      this.settings.applyFontSize();
    }
  }

  updateArraySetting(path, value, add) {
    const current = this.settings.getSetting(path, []);

    if (add) {
      if (!current.includes(value)) {
        current.push(value);
      }
    } else {
      const index = current.indexOf(value);
      if (index > -1) {
        current.splice(index, 1);
      }
    }

    this.settings.updateSetting(path, current);
  }

  exportSettings() {
    this.settings.exportSettings();
  }

  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = this.settings.importSettings(event.target.result);
        if (result.success) {
          alert('✅ ' + result.message);
          window.location.reload();
        } else {
          alert('❌ ' + result.message);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  resetToDefaults() {
    this.settings.resetToDefaults();
  }

  changePassword() {
    alert('🔑 Funcionalidad de cambio de contraseña - Implementar con Firebase Auth');
  }

  enable2FA() {
    alert('🔐 Configuración de 2FA - Implementar con Firebase Auth');
  }

  viewActiveSessions() {
    alert('📱 Ver sesiones activas - Implementar con Firebase');
  }

  exportUserData() {
    this.settings.exportSettings();
    alert('📥 Todos tus datos han sido exportados');
  }

  deleteAccount() {
    this.settings.deleteAllUserData();
  }

  connectIntegration(service) {
    alert(`Conectando con ${service}...`);
  }

  disconnectIntegration(service) {
    if (confirm(`¿Desconectar ${service}?`)) {
      this.settings.updateSetting(`integrations.${service}Connected`, false);
      this.switchTab(this.currentTab); // Refresh
    }
  }

  attachEventListeners() {
    // Event listeners adicionales si es necesario
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  const instance = new SettingsUI();
  window.SettingsUIInstance = instance;
  window.SettingsUI = instance; // Alias para fácil acceso
}

export default SettingsUI;
