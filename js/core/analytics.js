/**
 * 📊 ANALYTICS MANAGER
 * ===================
 *
 * Unified analytics system for:
 * - Google Analytics 4
 * - Custom event tracking
 * - User behavior analysis
 * - Performance monitoring
 * - Conversion tracking
 *
 * PRIVACY-FIRST:
 * - No PII tracking
 * - GDPR compliant
 * - User opt-out support
 */

class AnalyticsManager {
  constructor() {
    this.initialized = false;
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.pageLoadTime = performance.now();

    // Event queue (in case GA not loaded yet)
    this.eventQueue = [];

    // User consent (GDPR)
    this.hasConsent = this.checkConsent();

    // Performance metrics
    this.metrics = {
      pageViews: 0,
      events: 0,
      errors: 0
    };

    console.log('📊 Analytics Manager initializing...');
  }

  /**
   * Initialize analytics
   */
  async initialize() {
    if (this.initialized) return;
    if (!this.hasConsent) {
      console.log('⚠️ Analytics disabled (no user consent)');
      return;
    }

    // Initialize Google Analytics 4
    await this.initGA4();

    // Setup automatic tracking
    this.setupAutoTracking();

    // Process queued events
    this.processQueue();

    this.initialized = true;
    console.log('✅ Analytics initialized');
  }

  /**
   * Initialize Google Analytics 4
   */
  async initGA4() {
    // GA4 Measurement ID (replace with actual ID)
    const GA4_ID = 'G-XXXXXXXXXX'; // TODO: Replace with real GA4 ID

    // Load gtag.js
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA4_ID, {
      send_page_view: false, // We'll send manually
      anonymize_ip: true,     // Privacy
      cookie_flags: 'SameSite=None;Secure'
    });

    console.log('✅ GA4 loaded');
  }

  /**
   * Track page view
   */
  trackPageView(path, title) {
    this.metrics.pageViews++;

    const event = {
      event: 'page_view',
      page_path: path || window.location.pathname,
      page_title: title || document.title,
      page_location: window.location.href,
      session_id: this.sessionId
    };

    this.sendEvent(event);

    console.log('📄 Page view tracked:', path);
  }

  /**
   * Track custom event
   */
  trackEvent(category, action, label, value) {
    this.metrics.events++;

    const event = {
      event: action,
      event_category: category,
      event_label: label,
      value: value,
      session_id: this.sessionId
    };

    this.sendEvent(event);

    console.log(`📊 Event tracked: ${category} / ${action}`, label);
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName, action = 'used') {
    this.trackEvent('Feature', action, featureName);
  }

  /**
   * Track user interaction
   */
  trackInteraction(element, action) {
    this.trackEvent('Interaction', action, element);
  }

  /**
   * Track conversion (important user actions)
   */
  trackConversion(conversionType, value = 0) {
    const event = {
      event: 'conversion',
      conversion_type: conversionType,
      value: value,
      session_id: this.sessionId
    };

    this.sendEvent(event);

    console.log(`🎯 Conversion tracked: ${conversionType}`, value);
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    this.metrics.errors++;

    const event = {
      event: 'error',
      error_message: error.message || error,
      error_stack: error.stack || '',
      error_context: JSON.stringify(context),
      session_id: this.sessionId
    };

    this.sendEvent(event);

    console.error('❌ Error tracked:', error);
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName, value, unit = 'ms') {
    const event = {
      event: 'performance',
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
      session_id: this.sessionId
    };

    this.sendEvent(event);

    console.log(`⚡ Performance tracked: ${metricName} = ${value}${unit}`);
  }

  /**
   * Track user timing
   */
  trackTiming(category, variable, time, label) {
    this.trackEvent('Timing', `${category}_${variable}`, label, time);
  }

  /**
   * Send event to GA4
   */
  sendEvent(event) {
    if (!this.hasConsent) return;

    // Add timestamp
    event.timestamp = Date.now();
    event.user_id = this.userId;

    if (window.gtag) {
      window.gtag('event', event.event, event);
    } else {
      // Queue event if GA not ready
      this.eventQueue.push(event);
    }
  }

  /**
   * Process queued events
   */
  processQueue() {
    if (this.eventQueue.length === 0) return;

    console.log(`📦 Processing ${this.eventQueue.length} queued events...`);

    this.eventQueue.forEach(event => {
      this.sendEvent(event);
    });

    this.eventQueue = [];
  }

  /**
   * Setup automatic tracking
   */
  setupAutoTracking() {
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.pageLoadTime;
      this.trackPerformance('page_load_time', Math.round(loadTime));
    });

    // Track clicks on important elements
    document.addEventListener('click', (e) => {
      const target = e.target;

      // Track button clicks
      if (target.matches('button, .btn')) {
        const label = target.textContent || target.getAttribute('aria-label') || 'Unknown';
        this.trackInteraction('button', label);
      }

      // Track link clicks
      if (target.matches('a[href]')) {
        const href = target.getAttribute('href');
        this.trackInteraction('link', href);
      }
    }, { passive: true });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      const formId = form.id || form.className || 'unknown';
      this.trackEvent('Form', 'submit', formId);
    }, { passive: true });

    // Track errors
    window.addEventListener('error', (e) => {
      this.trackError(e.error || e.message, {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackError(e.reason, {
        type: 'unhandledrejection'
      });
    });

    // Track visibility changes (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('Engagement', 'tab_hidden');
      } else {
        this.trackEvent('Engagement', 'tab_visible');
      }
    });

    // Track beforeunload (user leaving page)
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - this.sessionId;
      this.trackTiming('Session', 'duration', sessionDuration, 'session_end');
    });

    console.log('✅ Auto-tracking enabled');
  }

  /**
   * Check user consent (GDPR)
   */
  checkConsent() {
    // Check localStorage for consent
    const consent = localStorage.getItem('analytics_consent');

    if (consent === null) {
      // Ask for consent
      this.requestConsent();
      return false;
    }

    return consent === 'true';
  }

  /**
   * Request user consent
   */
  requestConsent() {
    // Show consent banner
    const banner = document.createElement('div');
    banner.className = 'analytics-consent-banner';
    banner.innerHTML = `
      <div class="analytics-consent-banner__content">
        <p>
          Usamos cookies para mejorar tu experiencia. No rastreamos información personal.
          <a href="/privacy" target="_blank">Política de Privacidad</a>
        </p>
        <div class="analytics-consent-banner__actions">
          <button id="analytics-accept" class="btn btn-primary">Aceptar</button>
          <button id="analytics-reject" class="btn btn-secondary">Rechazar</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Handle accept
    document.getElementById('analytics-accept').addEventListener('click', () => {
      this.setConsent(true);
      banner.remove();
    });

    // Handle reject
    document.getElementById('analytics-reject').addEventListener('click', () => {
      this.setConsent(false);
      banner.remove();
    });
  }

  /**
   * Set user consent
   */
  setConsent(consent) {
    localStorage.setItem('analytics_consent', consent.toString());
    this.hasConsent = consent;

    if (consent) {
      this.initialize();
    }

    console.log(`📊 Analytics consent: ${consent}`);
  }

  /**
   * Set user ID (for logged-in users)
   */
  setUserId(userId) {
    this.userId = userId;

    if (window.gtag) {
      window.gtag('set', { user_id: userId });
    }

    console.log(`👤 User ID set: ${userId}`);
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get analytics metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      sessionId: this.sessionId,
      userId: this.userId,
      hasConsent: this.hasConsent,
      initialized: this.initialized
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.Analytics = new AnalyticsManager();

  // Auto-initialize if consent already given
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.Analytics.hasConsent) {
        window.Analytics.initialize();
      }
    });
  } else {
    if (window.Analytics.hasConsent) {
      window.Analytics.initialize();
    }
  }

  // Track initial page view
  window.addEventListener('load', () => {
    if (window.Analytics.initialized) {
      window.Analytics.trackPageView();
    }
  });

  console.log('📊 Analytics Manager loaded!');
}
