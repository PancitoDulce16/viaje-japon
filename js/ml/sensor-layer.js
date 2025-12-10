/**
 * 📡 SENSOR LAYER - Data Collection System
 * ==========================================
 *
 * Sistema de sensores para recopilar datos exhaustivos del comportamiento del usuario.
 * Esta es la CAPA 1 del cerebro IA - Los "sentidos" de la inteligencia.
 *
 * Tipos de datos recopilados:
 * - Behavioral (clicks, scrolls, tiempos)
 * - Contextual (cuando usa app, device, location)
 * - Preference (likes/dislikes explícitos e implícitos)
 * - Outcome (feedback post-actividad)
 */

class SensorLayer {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.behavioralData = {
      clicks: [],
      scrolls: [],
      hovers: [],
      timeOnPage: {},
      editPatterns: [],
      decisionTimes: []
    };
    this.contextualData = {
      sessions: [],
      deviceInfo: this.detectDevice(),
      timePatterns: [],
      planningStyle: null
    };
    this.preferenceData = {
      explicit: {},
      implicit: {},
      interactions: []
    };
    this.outcomeData = {
      ratings: [],
      completions: [],
      modifications: []
    };

    console.log('📡 Sensor Layer initialized - Session:', this.sessionId);
    this.initializeSensors();
  }

  /**
   * 🔧 Inicializa todos los sensores
   */
  initializeSensors() {
    this.initBehavioralSensors();
    this.initContextualSensors();
    this.initPreferenceSensors();
    this.startSessionTracking();
  }

  /**
   * 🖱️ BEHAVIORAL SENSORS
   */
  initBehavioralSensors() {
    // Click tracking
    document.addEventListener('click', (e) => {
      this.recordClick(e);
    });

    // Scroll tracking
    let scrollTimeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.recordScroll();
      }, 150);
    });

    // Hover tracking (para ver qué les interesa)
    document.addEventListener('mouseover', (e) => {
      if (e.target.dataset.trackHover) {
        this.recordHover(e);
      }
    });

    // Time on page tracking
    this.trackTimeOnPage();

    // Visibility tracking (si cambian de tab)
    document.addEventListener('visibilitychange', () => {
      this.recordVisibilityChange();
    });

    // Input tracking (para medir velocidad de decisión)
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        this.recordInputActivity(e);
      }
    });

    console.log('✅ Behavioral sensors active');
  }

  /**
   * 🌍 CONTEXTUAL SENSORS
   */
  initContextualSensors() {
    // Session start tracking
    this.contextualData.sessions.push({
      id: this.sessionId,
      startTime: this.startTime,
      dayOfWeek: new Date().getDay(),
      hour: new Date().getHours(),
      device: this.contextualData.deviceInfo,
      referrer: document.referrer
    });

    // Network quality
    if ('connection' in navigator) {
      this.contextualData.networkQuality = {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      };
    }

    // Screen size
    this.contextualData.screenSize = {
      width: window.innerWidth,
      height: window.innerHeight,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight
    };

    // Browser capabilities
    this.contextualData.capabilities = {
      localStorage: this.testLocalStorage(),
      indexedDB: 'indexedDB' in window,
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window
    };

    console.log('✅ Contextual sensors active');
  }

  /**
   * ❤️ PREFERENCE SENSORS
   */
  initPreferenceSensors() {
    // Track explicit preferences (ratings, likes, etc)
    window.addEventListener('userRating', (e) => {
      this.recordExplicitPreference('rating', e.detail);
    });

    window.addEventListener('activityLiked', (e) => {
      this.recordExplicitPreference('like', e.detail);
    });

    window.addEventListener('activityDisliked', (e) => {
      this.recordExplicitPreference('dislike', e.detail);
    });

    // Track implicit preferences (tiempo en cada tipo de actividad)
    this.trackImplicitPreferences();

    console.log('✅ Preference sensors active');
  }

  /**
   * 📊 TRACKING METHODS
   */

  recordClick(event) {
    const clickData = {
      timestamp: Date.now(),
      sessionTime: Date.now() - this.startTime,
      element: {
        tag: event.target.tagName,
        id: event.target.id,
        class: event.target.className,
        text: event.target.textContent?.substring(0, 50),
        dataset: event.target.dataset
      },
      position: {
        x: event.clientX,
        y: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY
      },
      page: window.location.pathname
    };

    this.behavioralData.clicks.push(clickData);
    this.emit('click', clickData);

    // Inferir intención del click
    this.inferClickIntention(clickData);
  }

  recordScroll() {
    const scrollData = {
      timestamp: Date.now(),
      scrollY: window.scrollY,
      scrollX: window.scrollX,
      scrollPercentage: (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100,
      page: window.location.pathname
    };

    this.behavioralData.scrolls.push(scrollData);

    // Inferir engagement por scroll depth
    this.inferEngagement(scrollData);
  }

  recordHover(event) {
    const hoverData = {
      timestamp: Date.now(),
      element: event.target.dataset.trackHover,
      duration: 0, // Se actualizará en mouseout
      elementType: event.target.dataset.elementType
    };

    this.behavioralData.hovers.push(hoverData);

    // Track hover duration
    const startTime = Date.now();
    event.target.addEventListener('mouseout', () => {
      hoverData.duration = Date.now() - startTime;
    }, { once: true });
  }

  trackTimeOnPage() {
    let currentPage = window.location.pathname;
    let pageStartTime = Date.now();

    // Inicializar
    this.behavioralData.timeOnPage[currentPage] = 0;

    // Update cada 5 segundos
    setInterval(() => {
      const currentTime = Date.now();
      const timeSpent = currentTime - pageStartTime;

      this.behavioralData.timeOnPage[currentPage] =
        (this.behavioralData.timeOnPage[currentPage] || 0) + 5000;

      // Detectar cambio de página/tab
      if (window.location.pathname !== currentPage) {
        currentPage = window.location.pathname;
        pageStartTime = currentTime;
        this.behavioralData.timeOnPage[currentPage] = 0;
      }
    }, 5000);
  }

  recordVisibilityChange() {
    this.events.push({
      type: 'visibility_change',
      timestamp: Date.now(),
      hidden: document.hidden
    });
  }

  recordInputActivity(event) {
    const inputData = {
      timestamp: Date.now(),
      fieldId: event.target.id,
      fieldType: event.target.type,
      valueLength: event.target.value.length,
      page: window.location.pathname
    };

    this.behavioralData.editPatterns.push(inputData);
  }

  startSessionTracking() {
    // Track session duration
    setInterval(() => {
      this.saveBehavioralSnapshot();
    }, 60000); // Cada minuto

    // Track when leaving
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  /**
   * 🎯 PREFERENCE TRACKING
   */

  recordExplicitPreference(type, data) {
    const preference = {
      type,
      data,
      timestamp: Date.now(),
      session: this.sessionId
    };

    if (!this.preferenceData.explicit[type]) {
      this.preferenceData.explicit[type] = [];
    }

    this.preferenceData.explicit[type].push(preference);

    // Guardar inmediatamente (es data valiosa)
    this.savePreferences();
  }

  trackImplicitPreferences() {
    // Track qué tipos de actividades mira más tiempo
    const activityCards = document.querySelectorAll('[data-activity-type]');

    activityCards.forEach(card => {
      let hoverStartTime = null;

      card.addEventListener('mouseenter', () => {
        hoverStartTime = Date.now();
      });

      card.addEventListener('mouseleave', () => {
        if (hoverStartTime) {
          const duration = Date.now() - hoverStartTime;
          const activityType = card.dataset.activityType;

          this.preferenceData.implicit[activityType] =
            (this.preferenceData.implicit[activityType] || 0) + duration;

          hoverStartTime = null;
        }
      });
    });
  }

  /**
   * 🧠 INFERENCE METHODS (extraer inteligencia de datos raw)
   */

  inferClickIntention(clickData) {
    const intentions = [];

    // FIX: Use className (string) instead of class (DOMTokenList)
    const className = clickData.element.className || '';

    // Detectar si está explorando vs decidiendo
    if (className.includes('activity-card')) {
      intentions.push('exploring_activities');
    }

    if (className.includes('btn-select') || className.includes('btn-choose')) {
      intentions.push('making_decision');

      // Medir tiempo de decisión
      const decisionTime = this.measureDecisionTime(clickData);
      if (decisionTime) {
        this.behavioralData.decisionTimes.push({
          context: clickData.element.dataset.context,
          duration: decisionTime,
          timestamp: Date.now()
        });
      }
    }

    if (className.includes('settings') || className.includes('config')) {
      intentions.push('adjusting_preferences');
    }

    clickData.inferredIntentions = intentions;
  }

  inferEngagement(scrollData) {
    // Scroll profundo = alto engagement
    if (scrollData.scrollPercentage > 75) {
      this.emit('high_engagement', {
        page: scrollData.page,
        scrollDepth: scrollData.scrollPercentage
      });
    }

    // Scroll rápido = bajo interés
    const recentScrolls = this.behavioralData.scrolls.slice(-5);
    if (recentScrolls.length === 5) {
      const scrollSpeed = this.calculateScrollSpeed(recentScrolls);
      if (scrollSpeed > 1000) { // pixels per second
        this.emit('low_engagement', {
          page: scrollData.page,
          scrollSpeed
        });
      }
    }
  }

  calculateScrollSpeed(scrolls) {
    if (scrolls.length < 2) return 0;

    const first = scrolls[0];
    const last = scrolls[scrolls.length - 1];

    const distance = Math.abs(last.scrollY - first.scrollY);
    const time = (last.timestamp - first.timestamp) / 1000; // seconds

    return time > 0 ? distance / time : 0;
  }

  measureDecisionTime(clickData) {
    // Buscar cuánto tiempo pasó desde que vio la opción
    const relevantHovers = this.behavioralData.hovers.filter(h =>
      h.timestamp < clickData.timestamp &&
      clickData.timestamp - h.timestamp < 300000 // Últimos 5 minutos
    );

    if (relevantHovers.length > 0) {
      const firstHover = relevantHovers[0];
      return clickData.timestamp - firstHover.timestamp;
    }

    return null;
  }

  /**
   * 🔍 UTILITY METHODS
   */

  detectDevice() {
    const ua = navigator.userAgent;

    return {
      isMobile: /Mobile|Android|iPhone/i.test(ua),
      isTablet: /Tablet|iPad/i.test(ua),
      isDesktop: !/Mobile|Android|iPhone|Tablet|iPad/i.test(ua),
      browser: this.detectBrowser(),
      os: this.detectOS(),
      touchEnabled: 'ontouchstart' in window
    };
  }

  detectBrowser() {
    const ua = navigator.userAgent;

    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  detectOS() {
    const ua = navigator.userAgent;

    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Other';
  }

  testLocalStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 💾 DATA PERSISTENCE
   */

  async saveBehavioralSnapshot() {
    const snapshot = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      duration: Date.now() - this.startTime,
      behavioral: this.behavioralData,
      contextual: this.contextualData,
      preferences: this.preferenceData
    };

    // Guardar en localStorage temporalmente
    try {
      const key = `sensor_snapshot_${this.sessionId}`;
      localStorage.setItem(key, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('Failed to save behavioral snapshot:', e);
    }

    // Enviar a pipeline de procesamiento
    if (window.DataPipeline) {
      window.DataPipeline.process(snapshot);
    }

    return snapshot;
  }

  async savePreferences() {
    const key = `preferences_${window.firebase?.auth()?.currentUser?.uid || 'anonymous'}`;

    try {
      localStorage.setItem(key, JSON.stringify(this.preferenceData));
    } catch (e) {
      console.warn('Failed to save preferences:', e);
    }
  }

  endSession() {
    const sessionData = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: Date.now(),
      duration: Date.now() - this.startTime,
      behavioral: this.behavioralData,
      contextual: this.contextualData,
      preferences: this.preferenceData,
      outcomes: this.outcomeData
    };

    // Guardar sesión completa
    try {
      const sessionsKey = 'all_sessions';
      const sessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
      sessions.push(sessionData);

      // Mantener solo últimas 50 sesiones
      if (sessions.length > 50) {
        sessions.shift();
      }

      localStorage.setItem(sessionsKey, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save session:', e);
    }

    console.log('📡 Session ended:', this.sessionId);
  }

  /**
   * 📊 DATA EXPORT & ANALYSIS
   */

  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.startTime,
      clicks: this.behavioralData.clicks.length,
      scrolls: this.behavioralData.scrolls.length,
      hovers: this.behavioralData.hovers.length,
      pages: Object.keys(this.behavioralData.timeOnPage),
      totalTimeOnPages: Object.values(this.behavioralData.timeOnPage).reduce((a, b) => a + b, 0),
      deviceInfo: this.contextualData.deviceInfo,
      explicitPreferences: Object.keys(this.preferenceData.explicit).length,
      implicitPreferences: Object.keys(this.preferenceData.implicit).length
    };
  }

  getBehavioralPatterns() {
    // Analiza patrones en el comportamiento
    return {
      clickFrequency: this.calculateClickFrequency(),
      averageDecisionTime: this.calculateAverageDecisionTime(),
      scrollBehavior: this.analyzeScrollBehavior(),
      pagePreferences: this.analyzePagePreferences(),
      timePatterns: this.analyzeTimePatterns()
    };
  }

  calculateClickFrequency() {
    const duration = (Date.now() - this.startTime) / 60000; // minutos
    return this.behavioralData.clicks.length / duration;
  }

  calculateAverageDecisionTime() {
    if (this.behavioralData.decisionTimes.length === 0) return null;

    const total = this.behavioralData.decisionTimes.reduce((sum, d) => sum + d.duration, 0);
    return total / this.behavioralData.decisionTimes.length;
  }

  analyzeScrollBehavior() {
    const scrolls = this.behavioralData.scrolls;
    if (scrolls.length < 2) return null;

    const speeds = [];
    for (let i = 1; i < scrolls.length; i++) {
      const distance = Math.abs(scrolls[i].scrollY - scrolls[i-1].scrollY);
      const time = (scrolls[i].timestamp - scrolls[i-1].timestamp) / 1000;
      if (time > 0) speeds.push(distance / time);
    }

    return {
      averageSpeed: speeds.reduce((a, b) => a + b, 0) / speeds.length,
      maxScrollDepth: Math.max(...scrolls.map(s => s.scrollPercentage)),
      scrollCount: scrolls.length
    };
  }

  analyzePagePreferences() {
    const times = this.behavioralData.timeOnPage;
    const sorted = Object.entries(times).sort((a, b) => b[1] - a[1]);

    return {
      mostVisited: sorted[0]?.[0],
      longestTime: sorted[0]?.[1],
      distribution: Object.fromEntries(sorted)
    };
  }

  analyzeTimePatterns() {
    return {
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      isWeekend: [0, 6].includes(new Date().getDay()),
      sessionStartHour: new Date(this.startTime).getHours()
    };
  }

  /**
   * 🎯 EVENT SYSTEM
   */

  emit(eventName, data) {
    this.events.push({
      type: eventName,
      data,
      timestamp: Date.now()
    });

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent(`sensor:${eventName}`, {
      detail: data
    }));
  }

  /**
   * 📈 FEATURE VECTORS (para ML)
   */

  generateFeatureVector() {
    // Genera un vector de features para algoritmos de ML
    const behavioral = this.getBehavioralPatterns();
    const summary = this.getSessionSummary();

    return {
      // Behavioral features
      clickFrequency: behavioral.clickFrequency || 0,
      avgDecisionTime: behavioral.averageDecisionTime || 0,
      scrollSpeed: behavioral.scrollBehavior?.averageSpeed || 0,
      scrollDepth: behavioral.scrollBehavior?.maxScrollDepth || 0,

      // Session features
      sessionDuration: summary.duration / 60000, // minutes
      pageCount: summary.pages.length,
      clickCount: summary.clicks,

      // Device features
      isMobile: summary.deviceInfo.isMobile ? 1 : 0,
      isTablet: summary.deviceInfo.isTablet ? 1 : 0,
      isDesktop: summary.deviceInfo.isDesktop ? 1 : 0,

      // Temporal features
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      isWeekend: [0, 6].includes(new Date().getDay()) ? 1 : 0,

      // Preference features
      explicitPreferenceCount: summary.explicitPreferences,
      implicitPreferenceCount: summary.implicitPreferences
    };
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.SensorLayer = new SensorLayer();
}

export default SensorLayer;
