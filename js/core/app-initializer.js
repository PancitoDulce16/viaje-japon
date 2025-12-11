/**
 * 🚀 APP INITIALIZER - Smart Loading Orchestrator
 * ================================================
 *
 * Coordinates the loading of all app resources in optimal order
 *
 * LOADING SEQUENCE:
 * 1. Critical CSS (inlined in HTML)
 * 2. Core modules (auth, firebase, dashboard-core)
 * 3. Essential CSS (core + theme + mobile)
 * 4. Essential ML (user profiler)
 * 5. Feature modules (lazy loaded on-demand)
 * 6. Visual enhancements (low priority)
 *
 * GOAL: Time to Interactive < 2s on 3G
 */

class AppInitializer {
  constructor() {
    this.initStartTime = performance.now();
    this.loadingSteps = [];
    this.isInitialized = false;

    // Loading state
    this.state = {
      coreLoaded: false,
      cssLoaded: false,
      mlLoaded: false,
      ready: false
    };

    console.log('🚀 App Initializer starting...');
  }

  /**
   * Initialize the entire app
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('⚠️ App already initialized');
      return;
    }

    try {
      // Show loading screen
      this.showLoadingScreen();

      // Step 1: Load core modules (critical for app to function)
      await this.loadCoreModules();

      // Step 2: Load essential CSS (parallel with core)
      await this.loadEssentialCSS();

      // Step 3: Initialize Firebase and Auth
      await this.initializeAuth();

      // Step 4: Load essential ML (user profiler)
      await this.loadEssentialML();

      // Step 5: Initialize dashboard
      await this.initializeDashboard();

      // Step 6: Setup feature lazy loading
      this.setupFeatureLazyLoading();

      // Step 7: Load non-essential resources (low priority)
      this.loadNonEssentialResources();

      // Mark as ready
      this.state.ready = true;
      this.isInitialized = true;

      // Hide loading screen
      this.hideLoadingScreen();

      // Log performance
      this.logPerformance();

      console.log('✅ App initialized successfully!');

      // Trigger ready event
      this.dispatchReadyEvent();

    } catch (error) {
      console.error('❌ App initialization failed:', error);
      this.showErrorScreen(error);
    }
  }

  /**
   * Step 1: Load core modules
   */
  async loadCoreModules() {
    const stepStart = performance.now();
    this.updateLoadingText('Cargando módulos principales...');

    try {
      // Check if ModuleLoader is available
      if (!window.ModuleLoader) {
        throw new Error('ModuleLoader not available');
      }

      await window.ModuleLoader.loadCore();

      this.state.coreLoaded = true;
      this.loadingSteps.push({
        step: 'core-modules',
        duration: performance.now() - stepStart
      });

      console.log('✅ Core modules loaded');
    } catch (error) {
      console.error('❌ Failed to load core modules:', error);
      throw error;
    }
  }

  /**
   * Step 2: Load essential CSS
   */
  async loadEssentialCSS() {
    const stepStart = performance.now();
    this.updateLoadingText('Cargando estilos...');

    try {
      // Check if CSSLoader is available
      if (!window.CSSLoader) {
        console.warn('⚠️ CSSLoader not available, skipping CSS loading');
        return;
      }

      await window.CSSLoader.loadEssential();

      this.state.cssLoaded = true;
      this.loadingSteps.push({
        step: 'essential-css',
        duration: performance.now() - stepStart
      });

      console.log('✅ Essential CSS loaded');
    } catch (error) {
      console.error('❌ Failed to load CSS:', error);
      // Don't throw - CSS is not critical for functionality
    }
  }

  /**
   * Step 3: Initialize Auth
   */
  async initializeAuth() {
    const stepStart = performance.now();
    this.updateLoadingText('Verificando autenticación...');

    try {
      // Wait for Firebase to be ready
      await this.waitForFirebase();

      // Check auth state
      const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';

      if (!isAuthenticated) {
        // Redirect to login
        window.location.href = '/login.html';
        return;
      }

      this.loadingSteps.push({
        step: 'auth',
        duration: performance.now() - stepStart
      });

      console.log('✅ Auth verified');
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      throw error;
    }
  }

  /**
   * Step 4: Load essential ML
   */
  async loadEssentialML() {
    const stepStart = performance.now();
    this.updateLoadingText('Inicializando IA...');

    try {
      if (window.ModuleLoader) {
        await window.ModuleLoader.loadEssentialML();
      }

      this.state.mlLoaded = true;
      this.loadingSteps.push({
        step: 'essential-ml',
        duration: performance.now() - stepStart
      });

      console.log('✅ Essential ML loaded');
    } catch (error) {
      console.error('❌ Failed to load ML:', error);
      // Don't throw - ML is not critical for basic functionality
    }
  }

  /**
   * Step 5: Initialize dashboard
   */
  async initializeDashboard() {
    const stepStart = performance.now();
    this.updateLoadingText('Preparando dashboard...');

    try {
      // Initialize dashboard core
      if (window.DashboardManager) {
        await window.DashboardManager.initialize();
      }

      this.loadingSteps.push({
        step: 'dashboard',
        duration: performance.now() - stepStart
      });

      console.log('✅ Dashboard initialized');
    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
      throw error;
    }
  }

  /**
   * Step 6: Setup feature lazy loading
   */
  setupFeatureLazyLoading() {
    console.log('🔗 Setting up feature lazy loading...');

    // Setup intersection observers for lazy loading
    this.setupIntersectionObservers();

    // Setup tab/section listeners
    this.setupTabListeners();

    // Setup event delegation for dynamic content
    this.setupEventDelegation();

    console.log('✅ Feature lazy loading configured');
  }

  /**
   * Step 7: Load non-essential resources
   */
  loadNonEssentialResources() {
    // Use requestIdleCallback to load when browser is idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadVisualEnhancements();
        this.loadAnalytics();
        this.prefetchCommonFeatures();
      }, { timeout: 2000 });
    } else {
      // Fallback: use setTimeout
      setTimeout(() => {
        this.loadVisualEnhancements();
        this.loadAnalytics();
        this.prefetchCommonFeatures();
      }, 2000);
    }
  }

  /**
   * Load visual enhancements (animations, etc)
   */
  async loadVisualEnhancements() {
    console.log('🎨 Loading visual enhancements...');

    try {
      if (window.CSSLoader) {
        await window.CSSLoader.loadVisual();
        await window.CSSLoader.loadAnimations();
      }
    } catch (error) {
      console.error('❌ Failed to load visual enhancements:', error);
    }
  }

  /**
   * Load analytics
   */
  async loadAnalytics() {
    console.log('📊 Loading analytics...');

    try {
      if (window.ModuleLoader) {
        await window.ModuleLoader.loadModule('/js/core/analytics.js');
      }
    } catch (error) {
      console.error('❌ Failed to load analytics:', error);
    }
  }

  /**
   * Prefetch commonly used features
   */
  prefetchCommonFeatures() {
    console.log('🔮 Prefetching common features...');

    // Prefetch itinerary (most used feature)
    if (window.ModuleLoader) {
      window.ModuleLoader.preloadModule('/js/itinerary-manager.js');
      window.ModuleLoader.preloadModule('/js/activity-timeline.js');
    }

    if (window.CSSLoader) {
      window.CSSLoader.prefetchCSS('/css/calendar-planner.css');
    }
  }

  /**
   * Setup intersection observers
   */
  setupIntersectionObservers() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const featureName = target.dataset.feature;

          if (featureName) {
            this.loadFeatureOnDemand(featureName);
            observer.unobserve(target);
          }
        }
      });
    }, {
      rootMargin: '50px' // Load 50px before entering viewport
    });

    // Observe lazy-load sections
    document.querySelectorAll('[data-feature]').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Setup tab listeners for lazy loading
   */
  setupTabListeners() {
    document.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-tab]');
      if (!tab) return;

      const tabName = tab.dataset.tab;
      this.loadFeatureOnDemand(tabName);
    });
  }

  /**
   * Setup event delegation
   */
  setupEventDelegation() {
    // AI Chat button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#ai-chat-btn, [data-action="open-ai-chat"]')) {
        this.loadAIChat();
      }
    });

    // Map button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#map-btn, [data-action="open-map"]')) {
        this.loadMap();
      }
    });
  }

  /**
   * Load feature on demand
   */
  async loadFeatureOnDemand(featureName) {
    console.log(`📦 Loading feature on-demand: ${featureName}`);

    try {
      // Load JS modules
      if (window.ModuleLoader) {
        await window.ModuleLoader.loadFeature(featureName);
      }

      // Load CSS
      if (window.CSSLoader) {
        await window.CSSLoader.loadFeature(featureName);
      }

      console.log(`✅ Feature loaded: ${featureName}`);
    } catch (error) {
      console.error(`❌ Failed to load feature ${featureName}:`, error);
    }
  }

  /**
   * Load AI Chat modules
   */
  async loadAIChat() {
    console.log('🤖 Loading AI Chat...');

    try {
      if (window.ModuleLoader) {
        // Load NLP modules
        await window.ModuleLoader.loadNLP();

        // Load recommendation modules (for suggestions)
        await window.ModuleLoader.loadRecommendations();
      }

      console.log('✅ AI Chat ready');
    } catch (error) {
      console.error('❌ Failed to load AI Chat:', error);
    }
  }

  /**
   * Load Map modules
   */
  async loadMap() {
    console.log('🗺️ Loading Map...');

    try {
      // Load Leaflet library
      if (window.ModuleLoader) {
        await window.ModuleLoader.loadLibrary('leaflet');
      }

      // Load map module
      if (window.ModuleLoader) {
        await window.ModuleLoader.loadFeature('map');
      }

      console.log('✅ Map ready');
    } catch (error) {
      console.error('❌ Failed to load Map:', error);
    }
  }

  /**
   * Wait for Firebase to be ready
   */
  waitForFirebase() {
    return new Promise((resolve) => {
      if (window.firebase && window.db) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (window.firebase && window.db) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }

  /**
   * Show loading screen
   */
  showLoadingScreen() {
    const loadingScreen = document.getElementById('app-loading');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
    }
  }

  /**
   * Hide loading screen
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('app-loading');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }
  }

  /**
   * Update loading text
   */
  updateLoadingText(text) {
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
      loadingText.textContent = text;
    }
  }

  /**
   * Show error screen
   */
  showErrorScreen(error) {
    const loadingScreen = document.getElementById('app-loading');
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 48px; margin-bottom: 1rem;">😞</div>
          <h2 style="font-size: 24px; margin-bottom: 1rem; color: #dc2626;">
            Error al cargar la aplicación
          </h2>
          <p style="color: #6b7280; margin-bottom: 2rem;">
            ${error.message || 'Error desconocido'}
          </p>
          <button onclick="location.reload()" style="
            background: #9333ea;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            font-size: 16px;
          ">
            Reintentar
          </button>
        </div>
      `;
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance() {
    const totalTime = performance.now() - this.initStartTime;

    console.log('\n🎯 APP INITIALIZATION PERFORMANCE');
    console.log('==================================');

    this.loadingSteps.forEach(step => {
      console.log(`  ${step.step}: ${step.duration.toFixed(2)}ms`);
    });

    console.log(`\n  TOTAL: ${totalTime.toFixed(2)}ms`);
    console.log('==================================\n');

    // Send to analytics if available
    if (window.Analytics) {
      window.Analytics.trackEvent('Performance', 'app_initialization', 'duration', Math.round(totalTime));
    }
  }

  /**
   * Dispatch ready event
   */
  dispatchReadyEvent() {
    const event = new CustomEvent('app:ready', {
      detail: {
        loadTime: performance.now() - this.initStartTime,
        steps: this.loadingSteps
      }
    });

    window.dispatchEvent(event);
  }

  /**
   * Get initialization state
   */
  getState() {
    return this.state;
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.AppInitializer = new AppInitializer();

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AppInitializer.initialize();
    });
  } else {
    window.AppInitializer.initialize();
  }

  console.log('🚀 App Initializer loaded!');
}
