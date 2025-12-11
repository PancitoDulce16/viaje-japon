/**
 * 🎨 CSS LOADER - Async CSS Loading
 * ==================================
 *
 * Load CSS files asynchronously to improve initial page load
 *
 * STRATEGY:
 * 1. Critical CSS is inlined in HTML (<14KB)
 * 2. Core CSS loaded with high priority
 * 3. Feature CSS loaded on-demand
 * 4. Theme CSS loaded based on preference
 *
 * BENEFITS:
 * - Faster First Contentful Paint
 * - Non-blocking CSS loading
 * - Reduced initial bundle size
 */

class CSSLoader {
  constructor() {
    this.loadedStyles = new Set();
    this.loadingPromises = new Map();

    // CSS Registry
    this.registry = {
      // Core styles (load immediately after critical)
      core: [
        '/css/main.css',
        '/css/japan-theme.css',
        '/css/forms.css',
        '/css/tooltips.css'
      ],

      // Theme styles (load based on user preference)
      themes: {
        kawaii: [
          '/css/theme-kawaii.css',
          '/css/kawaii-animations.css',
          '/css/wallpapers.css'
        ],
        ninja: [
          '/css/theme-ninja.css',
          '/css/dark-mode-fixes.css'
        ]
      },

      // Feature styles (load on-demand)
      features: {
        animations: [
          '/css/animations.css',
          '/css/enhanced-animations.css',
          '/css/smooth-animations.css'
        ],
        itinerary: [
          '/css/calendar-planner.css',
          '/css/calendar-fix.css'
        ],
        budget: [
          // Budget-specific styles (if any)
        ],
        'jr-pass': [
          '/css/jr-pass-calculator.css'
        ],
        ramen: [
          '/css/ramen-passport.css'
        ],
        goshuin: [
          '/css/goshuin-book.css'
        ],
        health: [
          '/css/health-dashboard.css'
        ],
        survival: [
          '/css/survival-guide.css'
        ],
        japan-rules: [
          '/css/japan-rules.css'
        ],
        horarios: [
          '/css/horarios-system.css'
        ],
        zonas: [
          '/css/zonas-system.css'
        ],
        ai: [
          '/css/ai-planner.css'
        ]
      },

      // Mobile styles (load on mobile devices)
      mobile: [
        '/css/mobile-optimizations.css'
      ],

      // Visual enhancements (load after core)
      visual: [
        '/css/ui-improvements.css',
        '/css/visual-redesign.css',
        '/css/dashboard-visual-upgrade.css',
        '/css/dashboard-background.css',
        '/css/contrast-fixes.css'
      ]
    };

    console.log('🎨 CSS Loader initialized');
  }

  /**
   * Load CSS file asynchronously
   */
  loadCSS(href, priority = 'low') {
    // Check if already loaded
    if (this.loadedStyles.has(href)) {
      return Promise.resolve();
    }

    // Check if currently loading
    if (this.loadingPromises.has(href)) {
      return this.loadingPromises.get(href);
    }

    // Create loading promise
    const loadingPromise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;

      // Set priority
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }

      link.onload = () => {
        this.loadedStyles.add(href);
        this.loadingPromises.delete(href);
        console.log(`✅ Loaded CSS: ${href}`);
        resolve();
      };

      link.onerror = () => {
        this.loadingPromises.delete(href);
        console.error(`❌ Failed to load CSS: ${href}`);
        reject(new Error(`Failed to load CSS: ${href}`));
      };

      document.head.appendChild(link);
    });

    this.loadingPromises.set(href, loadingPromise);
    return loadingPromise;
  }

  /**
   * Load core styles
   */
  async loadCore() {
    console.log('🎨 Loading core styles...');

    try {
      await Promise.all(
        this.registry.core.map(href => this.loadCSS(href, 'high'))
      );

      console.log('✅ Core styles loaded');
      return true;
    } catch (error) {
      console.error('❌ Failed to load core styles:', error);
      return false;
    }
  }

  /**
   * Load theme styles
   */
  async loadTheme(themeName = 'kawaii') {
    const themeStyles = this.registry.themes[themeName];

    if (!themeStyles) {
      console.warn(`⚠️ Unknown theme: ${themeName}`);
      return false;
    }

    console.log(`🎨 Loading theme: ${themeName}`);

    try {
      await Promise.all(
        themeStyles.map(href => this.loadCSS(href))
      );

      console.log(`✅ Theme loaded: ${themeName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load theme ${themeName}:`, error);
      return false;
    }
  }

  /**
   * Load feature styles
   */
  async loadFeature(featureName) {
    const featureStyles = this.registry.features[featureName];

    if (!featureStyles || featureStyles.length === 0) {
      // No specific styles for this feature
      return true;
    }

    console.log(`🎨 Loading feature styles: ${featureName}`);

    try {
      await Promise.all(
        featureStyles.map(href => this.loadCSS(href))
      );

      console.log(`✅ Feature styles loaded: ${featureName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load feature styles ${featureName}:`, error);
      return false;
    }
  }

  /**
   * Load mobile styles (if on mobile device)
   */
  async loadMobile() {
    if (!this.isMobile()) {
      return true;
    }

    console.log('📱 Loading mobile styles...');

    try {
      await Promise.all(
        this.registry.mobile.map(href => this.loadCSS(href))
      );

      console.log('✅ Mobile styles loaded');
      return true;
    } catch (error) {
      console.error('❌ Failed to load mobile styles:', error);
      return false;
    }
  }

  /**
   * Load visual enhancement styles
   */
  async loadVisual() {
    console.log('🎨 Loading visual enhancements...');

    try {
      // Load with low priority (don't block rendering)
      await Promise.all(
        this.registry.visual.map(href => this.loadCSS(href, 'low'))
      );

      console.log('✅ Visual enhancements loaded');
      return true;
    } catch (error) {
      console.error('❌ Failed to load visual enhancements:', error);
      return false;
    }
  }

  /**
   * Load animation styles
   */
  async loadAnimations() {
    // Don't load animations if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('⏸️ Animations disabled (user prefers reduced motion)');
      return true;
    }

    console.log('🎬 Loading animations...');

    try {
      await Promise.all(
        this.registry.features.animations.map(href => this.loadCSS(href))
      );

      console.log('✅ Animations loaded');
      return true;
    } catch (error) {
      console.error('❌ Failed to load animations:', error);
      return false;
    }
  }

  /**
   * Load all essential styles
   */
  async loadEssential() {
    const startTime = performance.now();

    try {
      // Load in parallel
      await Promise.all([
        this.loadCore(),
        this.loadMobile(),
        this.loadTheme(this.getCurrentTheme())
      ]);

      const loadTime = performance.now() - startTime;
      console.log(`✅ Essential styles loaded in ${loadTime.toFixed(2)}ms`);

      // Load visual enhancements and animations after essential (low priority)
      requestIdleCallback(() => {
        this.loadVisual();
        this.loadAnimations();
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to load essential styles:', error);
      return false;
    }
  }

  /**
   * Preload CSS (fetch but don't apply)
   */
  preloadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * Prefetch CSS (low priority, for future use)
   */
  prefetchCSS(href) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * Check if mobile device
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || window.innerWidth < 768;
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;

    // Check if dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'ninja' : 'kawaii';
  }

  /**
   * Get loaded styles count
   */
  getLoadedCount() {
    return this.loadedStyles.size;
  }

  /**
   * Clear cache (for development)
   */
  clearCache() {
    this.loadedStyles.clear();
    this.loadingPromises.clear();
    console.log('🧹 CSS cache cleared');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.CSSLoader = new CSSLoader();

  // Expose helper function
  window.loadFeatureStyles = (name) => window.CSSLoader.loadFeature(name);

  console.log('🎨 CSS Loader ready!');
}
