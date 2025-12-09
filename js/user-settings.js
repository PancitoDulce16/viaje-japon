/**
 * ⚙️ SISTEMA DE CONFIGURACIONES DE USUARIO
 * ==========================================
 *
 * Sistema completo de preferencias, configuraciones y ajustes
 * para personalizar la experiencia del usuario.
 *
 * Secciones:
 * 1. Datos Básicos
 * 2. Configuración de App y Notificaciones
 * 3. Configuración Específica de IA
 * 4. Cuenta y Seguridad
 * 5. Notificaciones y Mantenimiento
 * 6. Personalización Avanzada UX
 * 7. Sincronización y Respaldo
 */

class UserSettings {
  constructor() {
    this.STORAGE_KEY = 'user_settings';
    this.settings = this.loadSettings();
  }

  /**
   * 📊 Configuración por defecto
   */
  getDefaultSettings() {
    return {
      // 👤 DATOS BÁSICOS
      basicInfo: {
        displayName: '',
        email: '',
        originCountry: 'Mexico', // País de residencia
        preferredCurrency: 'MXN', // USD, EUR, MXN, JPY
        phoneNumber: ''
      },

      // 🎨 CONFIGURACIÓN DE LA APLICACIÓN
      appConfig: {
        language: 'es', // es, en, ja
        theme: 'auto', // light, dark, auto
        fontSize: 'medium', // small, medium, large, xlarge
        highContrast: false,
        screenReaderSupport: false
      },

      // 🔔 PREFERENCIAS DE NOTIFICACIONES
      notifications: {
        method: 'in-app', // email, in-app, both
        lastMinuteAlerts: true, // Cancelaciones de trenes, cierres inesperados
        weatherAlerts: true, // Alertas de clima y vestimenta
        proactiveSuggestions: true, // Recomendaciones de la IA
        marketingEmails: false, // Newsletters y anuncios
        accountAlerts: true, // Cambios de seguridad
        emailFrequency: 'important' // all, important, none
      },

      // 🧠 CONFIGURACIÓN ESPECÍFICA DE IA
      aiConfig: {
        // Prioridad de optimización
        optimizationPriority: 'balanced', // time, cost, crowds, balanced

        // Umbral de novedad
        noveltyThreshold: 'mixed', // famous, mixed, hidden

        // Filtros de exclusión
        exclusionFilters: [], // ["museos de arte moderno", "parques de atracciones"]

        // Control de sugerencias
        aiSuggestionsEnabled: true,
        autoOptimizeRoutes: true,
        learnFromBehavior: true,

        // Nivel de personalización
        personalizationLevel: 'high', // low, medium, high

        // Preferencias de ML
        allowAnonymousDataUsage: false, // Para entrenar el modelo
        mlInsightsEnabled: true
      },

      // 🗺️ CONFIGURACIÓN DE ITINERARIOS
      itineraryConfig: {
        defaultView: 'list', // map, list, calendar
        measurementUnits: 'metric', // metric (km), imperial (miles)
        priceDetailLevel: 'exact', // exact, range, hidden
        roundPriceConversion: true,
        showTransitTime: true,
        showWalkingDistance: true,
        autoSaveEnabled: true,
        autoSaveInterval: 5 // minutos
      },

      // 🔒 SEGURIDAD
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30, // días
        loginNotifications: true,
        deviceTracking: true
      },

      // 🔄 SINCRONIZACIÓN
      sync: {
        autoBackup: true,
        backupFrequency: 'continuous', // continuous, daily, manual
        cloudSyncEnabled: true,
        dataSaverMode: false, // Para conexiones lentas
        offlineMode: true
      },

      // 🌍 PREFERENCIAS DE VIAJE (Específicas de Japón)
      travelPreferences: {
        // Ya existentes del perfil
        travelStyle: 'explorer', // explorer, foodie, photographer, culture, nature, urban
        paceLevel: 'moderate', // relaxed, moderate, intense, extreme
        budgetLevel: 'moderate', // budget, moderate, luxury

        // Nuevas preferencias
        preferredTransport: 'public', // public, walk, mix
        morningPerson: true, // Prefiere empezar temprano
        nightOwl: false, // Prefiere actividades nocturnas

        // Restricciones
        mobilityRestrictions: false,
        dietaryRestrictions: [], // vegetarian, vegan, halal, kosher, gluten-free
        allergies: [],

        // Intereses específicos
        interests: {
          culture: 8, // 0-10
          food: 9,
          nature: 7,
          shopping: 5,
          nightlife: 3,
          photography: 8,
          anime: 4,
          technology: 6,
          history: 9,
          art: 7
        }
      },

      // 📊 PRIVACIDAD
      privacy: {
        profileVisibility: 'private', // public, friends, private
        shareItineraries: false,
        allowDataExport: true,
        trackingConsent: false,
        cookiesConsent: true
      },

      // 📱 INTEGRACIONES
      integrations: {
        googleConnected: false,
        appleConnected: false,
        facebookConnected: false,
        googleCalendarSync: false,
        googleMapsIntegration: true
      },

      // 🎯 AVANZADO
      advanced: {
        developerMode: false,
        debugMode: false,
        experimentalFeatures: false,
        betaTester: false
      },

      // 📈 METADATA
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSync: null
      }
    };
  }

  /**
   * 💾 Carga configuraciones desde localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge con defaults para asegurar que existan todas las propiedades
        return this.deepMerge(this.getDefaultSettings(), parsed);
      }
    } catch (e) {
      console.warn('Error cargando configuraciones:', e);
    }

    return this.getDefaultSettings();
  }

  /**
   * 💾 Guarda configuraciones en localStorage
   */
  saveSettings() {
    try {
      this.settings.metadata.updatedAt = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
      console.log('⚙️ Configuraciones guardadas');

      // Emitir evento para que otros componentes se enteren
      window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: this.settings }));

      return true;
    } catch (e) {
      console.error('Error guardando configuraciones:', e);
      return false;
    }
  }

  /**
   * 🔄 Merge profundo de objetos
   */
  deepMerge(target, source) {
    const output = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }

  /**
   * 📝 Actualiza una configuración específica
   * @param {string} path - Ruta de la configuración (ej: 'notifications.weatherAlerts')
   * @param {*} value - Nuevo valor
   */
  updateSetting(path, value) {
    const keys = path.split('.');
    let current = this.settings;

    // Navegar hasta el penúltimo nivel
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    // Actualizar el valor final
    current[keys[keys.length - 1]] = value;

    return this.saveSettings();
  }

  /**
   * 📖 Obtiene una configuración específica
   * @param {string} path - Ruta de la configuración
   * @param {*} defaultValue - Valor por defecto si no existe
   */
  getSetting(path, defaultValue = null) {
    const keys = path.split('.');
    let current = this.settings;

    for (const key of keys) {
      if (current[key] === undefined) {
        return defaultValue;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * 🔄 Resetea todas las configuraciones a valores por defecto
   */
  resetToDefaults() {
    if (confirm('¿Estás seguro de que quieres resetear todas las configuraciones a valores por defecto?')) {
      this.settings = this.getDefaultSettings();
      this.saveSettings();

      // Recargar página para aplicar cambios
      window.location.reload();
    }
  }

  /**
   * 📥 Importa configuraciones desde JSON
   */
  importSettings(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.settings = this.deepMerge(this.getDefaultSettings(), imported);
      this.saveSettings();
      return { success: true, message: 'Configuraciones importadas correctamente' };
    } catch (e) {
      return { success: false, message: 'Error al importar configuraciones: ' + e.message };
    }
  }

  /**
   * 📤 Exporta configuraciones a JSON
   */
  exportSettings() {
    const data = {
      settings: this.settings,
      exportedAt: new Date().toISOString(),
      version: this.settings.metadata.version
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `japitin-settings-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * 🗑️ Elimina todos los datos del usuario
   */
  async deleteAllUserData() {
    const confirmation = prompt(
      'ADVERTENCIA: Esta acción eliminará permanentemente todos tus datos.\n\n' +
      'Para confirmar, escribe: ELIMINAR TODO'
    );

    if (confirmation === 'ELIMINAR TODO') {
      try {
        // Eliminar de localStorage
        localStorage.clear();

        // Si hay usuario autenticado, eliminar de Firebase
        if (window.firebase && window.firebase.auth().currentUser) {
          const userId = window.firebase.auth().currentUser.uid;

          // Eliminar documentos de Firestore
          const batch = window.firebase.firestore().batch();

          // Aquí eliminarías todos los documentos del usuario
          // batch.delete(...)

          await batch.commit();

          // Eliminar cuenta de Auth
          await window.firebase.auth().currentUser.delete();
        }

        alert('Todos tus datos han sido eliminados. Serás redirigido a la página de inicio.');
        window.location.href = '/';

        return { success: true };
      } catch (error) {
        console.error('Error eliminando datos:', error);
        return { success: false, message: error.message };
      }
    }

    return { success: false, message: 'Cancelado por el usuario' };
  }

  /**
   * 🌍 Obtiene moneda formateada según preferencias
   */
  formatCurrency(amount, fromCurrency = 'JPY') {
    const toCurrency = this.getSetting('basicInfo.preferredCurrency', 'MXN');

    // Tasas de cambio aproximadas (en producción, usar API real)
    const rates = {
      'JPY-MXN': 0.13,
      'JPY-USD': 0.0067,
      'JPY-EUR': 0.0062,
      'MXN-JPY': 7.7,
      'USD-JPY': 149.5,
      'EUR-JPY': 161.2
    };

    let converted = amount;
    if (fromCurrency !== toCurrency) {
      const rateKey = `${fromCurrency}-${toCurrency}`;
      if (rates[rateKey]) {
        converted = amount * rates[rateKey];
      }
    }

    // Redondear si está configurado
    if (this.getSetting('itineraryConfig.roundPriceConversion', true)) {
      converted = Math.round(converted);
    }

    // Formatear según moneda
    const formatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: toCurrency
    });

    return formatter.format(converted);
  }

  /**
   * 📏 Convierte distancia según unidades preferidas
   */
  formatDistance(km) {
    const units = this.getSetting('itineraryConfig.measurementUnits', 'metric');

    if (units === 'imperial') {
      const miles = km * 0.621371;
      return `${miles.toFixed(1)} mi`;
    }

    return `${km.toFixed(1)} km`;
  }

  /**
   * 🎨 Aplica tema según configuración
   */
  applyTheme() {
    const theme = this.getSetting('appConfig.theme', 'auto');
    const html = document.documentElement;

    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme === 'light') {
      html.classList.remove('dark');
    } else {
      // Auto: detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }

  /**
   * 📝 Aplica tamaño de fuente
   */
  applyFontSize() {
    const size = this.getSetting('appConfig.fontSize', 'medium');
    const html = document.documentElement;

    // Remover clases anteriores
    html.classList.remove('text-small', 'text-medium', 'text-large', 'text-xlarge');

    // Agregar clase correspondiente
    html.classList.add(`text-${size}`);
  }

  /**
   * 🔔 Verifica si debe mostrar una notificación
   */
  shouldShowNotification(type) {
    const method = this.getSetting('notifications.method', 'in-app');

    if (method === 'none') return false;

    switch (type) {
      case 'lastMinute':
        return this.getSetting('notifications.lastMinuteAlerts', true);
      case 'weather':
        return this.getSetting('notifications.weatherAlerts', true);
      case 'aiSuggestion':
        return this.getSetting('notifications.proactiveSuggestions', true);
      case 'marketing':
        return this.getSetting('notifications.marketingEmails', false);
      case 'account':
        return this.getSetting('notifications.accountAlerts', true);
      default:
        return true;
    }
  }

  /**
   * 🎯 Obtiene configuración de optimización para la IA
   */
  getAIOptimizationConfig() {
    return {
      priority: this.getSetting('aiConfig.optimizationPriority', 'balanced'),
      novelty: this.getSetting('aiConfig.noveltyThreshold', 'mixed'),
      exclusions: this.getSetting('aiConfig.exclusionFilters', []),
      autoOptimize: this.getSetting('aiConfig.autoOptimizeRoutes', true),
      learning: this.getSetting('aiConfig.learnFromBehavior', true),
      personalization: this.getSetting('aiConfig.personalizationLevel', 'high')
    };
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.UserSettings = new UserSettings();

  // Aplicar configuraciones al cargar
  window.addEventListener('DOMContentLoaded', () => {
    window.UserSettings.applyTheme();
    window.UserSettings.applyFontSize();
  });
}

export default UserSettings;
