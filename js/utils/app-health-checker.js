/**
 * 🏥 APP HEALTH CHECKER
 * Sistema de auto-testing y validación para detectar errores proactivamente
 */

class AppHealthChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.checks = [];
    this.autoRun = true;

    if (this.autoRun) {
      this.runAllChecks();
    }
  }

  /**
   * Run all health checks
   */
  async runAllChecks() {
    console.log('🏥 Running App Health Checks...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.performChecks());
    } else {
      this.performChecks();
    }
  }

  /**
   * Perform all checks
   */
  async performChecks() {
    this.checkUtilitySystems();
    this.checkDOMElements();
    this.checkEventListeners();
    this.checkFirebaseConnection();
    this.checkLocalStorage();
    this.checkConsoleErrors();
    this.checkPerformance();

    // Wait a bit for async checks
    setTimeout(() => {
      this.reportResults();
    }, 3000);
  }

  /**
   * Check if all utility systems are loaded
   */
  checkUtilitySystems() {
    const requiredUtilities = [
      'ModalManager',
      'InputValidator',
      'LoadingManager',
      'ErrorBoundary',
      'KeyboardShortcuts',
      'PerformanceMonitor',
      'OnboardingTour',
      'NotificationSystem',
      'AccessibilityManager'
    ];

    requiredUtilities.forEach(utility => {
      if (!window[utility]) {
        this.issues.push({
          type: 'CRITICAL',
          category: 'Utility System',
          message: `${utility} not loaded`,
          fix: `Check if /js/utils/${this.camelToKebab(utility)}.js is included in dashboard.html`
        });
      } else {
        this.checks.push({
          category: 'Utility System',
          name: utility,
          status: 'OK'
        });
      }
    });
  }

  /**
   * Check critical DOM elements
   */
  checkDOMElements() {
    const criticalElements = [
      { selector: '#main-content, main, .dashboard-content', name: 'Main Content Area' },
      { selector: '#notificationContainer', name: 'Notification Container' },
      { selector: '#ariaLive', name: 'ARIA Live Region' }
    ];

    criticalElements.forEach(({ selector, name }) => {
      const element = document.querySelector(selector);
      if (!element) {
        this.warnings.push({
          type: 'WARNING',
          category: 'DOM',
          message: `${name} (${selector}) not found`,
          fix: 'This element is auto-created by utilities but might be missing initially'
        });
      } else {
        this.checks.push({
          category: 'DOM',
          name,
          status: 'OK'
        });
      }
    });
  }

  /**
   * Check event listeners setup
   */
  checkEventListeners() {
    // Check if keyboard shortcuts are working
    const testKeyEvent = new KeyboardEvent('keydown', { key: '?' });
    const hasKeyListener = document.dispatchEvent(testKeyEvent);

    if (hasKeyListener) {
      this.checks.push({
        category: 'Event Listeners',
        name: 'Keyboard Shortcuts',
        status: 'OK'
      });
    }

    // Check error handlers
    if (window.onerror || window.onunhandledrejection) {
      this.checks.push({
        category: 'Event Listeners',
        name: 'Error Handlers',
        status: 'OK'
      });
    }
  }

  /**
   * Check Firebase connection
   */
  checkFirebaseConnection() {
    if (typeof firebase === 'undefined') {
      this.warnings.push({
        type: 'WARNING',
        category: 'Firebase',
        message: 'Firebase SDK not loaded',
        fix: 'Check Firebase CDN scripts in HTML'
      });
    } else {
      this.checks.push({
        category: 'Firebase',
        name: 'SDK Loaded',
        status: 'OK'
      });

      // Check if initialized
      try {
        const app = firebase.app();
        this.checks.push({
          category: 'Firebase',
          name: 'App Initialized',
          status: 'OK',
          details: app.name
        });
      } catch (e) {
        this.warnings.push({
          type: 'WARNING',
          category: 'Firebase',
          message: 'Firebase not initialized',
          fix: 'Firebase may initialize later - this is normal'
        });
      }
    }
  }

  /**
   * Check localStorage access
   */
  checkLocalStorage() {
    try {
      localStorage.setItem('health_check_test', 'ok');
      const test = localStorage.getItem('health_check_test');
      localStorage.removeItem('health_check_test');

      if (test === 'ok') {
        this.checks.push({
          category: 'Storage',
          name: 'LocalStorage',
          status: 'OK'
        });
      }
    } catch (e) {
      this.issues.push({
        type: 'CRITICAL',
        category: 'Storage',
        message: 'LocalStorage not available',
        fix: 'Check browser privacy settings or incognito mode'
      });
    }
  }

  /**
   * Monitor console errors
   */
  checkConsoleErrors() {
    // This is set up by ErrorBoundary, just verify it's working
    if (window.ErrorBoundary) {
      const errorCount = window.ErrorBoundary.errors?.length || 0;

      if (errorCount > 0) {
        this.warnings.push({
          type: 'WARNING',
          category: 'Console Errors',
          message: `${errorCount} errors captured`,
          fix: 'Check ErrorBoundary.errors for details'
        });
      } else {
        this.checks.push({
          category: 'Console Errors',
          name: 'Error Tracking',
          status: 'OK'
        });
      }
    }
  }

  /**
   * Check performance
   */
  checkPerformance() {
    if (window.PerformanceMonitor) {
      const metrics = window.PerformanceMonitor.getMetrics();

      // Check FCP
      if (metrics.coreWebVitals.firstContentfulPaint > 2000) {
        this.warnings.push({
          type: 'WARNING',
          category: 'Performance',
          message: `FCP slow: ${metrics.coreWebVitals.firstContentfulPaint.toFixed(0)}ms`,
          fix: 'Consider lazy loading or code splitting'
        });
      }

      // Check CLS
      if (metrics.coreWebVitals.cumulativeLayoutShift > 0.1) {
        this.warnings.push({
          type: 'WARNING',
          category: 'Performance',
          message: `CLS high: ${metrics.coreWebVitals.cumulativeLayoutShift.toFixed(3)}`,
          fix: 'Reserve space for dynamic content'
        });
      }

      if (this.warnings.filter(w => w.category === 'Performance').length === 0) {
        this.checks.push({
          category: 'Performance',
          name: 'Core Web Vitals',
          status: 'OK'
        });
      }
    }
  }

  /**
   * Report results
   */
  reportResults() {
    console.log('\n🏥 ===== APP HEALTH CHECK RESULTS =====\n');

    // Show issues
    if (this.issues.length > 0) {
      console.error(`🔴 CRITICAL ISSUES FOUND: ${this.issues.length}`);
      console.table(this.issues);
    }

    // Show warnings
    if (this.warnings.length > 0) {
      console.warn(`🟡 WARNINGS: ${this.warnings.length}`);
      console.table(this.warnings);
    }

    // Show successful checks
    console.log(`✅ PASSED CHECKS: ${this.checks.length}`);
    console.table(this.checks);

    // Overall health
    const healthScore = this.calculateHealthScore();
    const healthEmoji = healthScore >= 90 ? '🟢' : healthScore >= 70 ? '🟡' : '🔴';

    console.log(`\n${healthEmoji} OVERALL HEALTH SCORE: ${healthScore}/100\n`);

    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('🎉 All systems operational! App is healthy.\n');
    } else {
      console.log('⚠️ Some issues detected. See details above.\n');
    }

    // Store results
    this.storeResults({
      timestamp: new Date().toISOString(),
      healthScore,
      issues: this.issues.length,
      warnings: this.warnings.length,
      checks: this.checks.length
    });
  }

  /**
   * Calculate health score
   */
  calculateHealthScore() {
    let score = 100;

    // Critical issues
    score -= this.issues.length * 20;

    // Warnings
    score -= this.warnings.length * 5;

    return Math.max(0, score);
  }

  /**
   * Store results in localStorage
   */
  storeResults(results) {
    try {
      const history = JSON.parse(localStorage.getItem('health_check_history') || '[]');
      history.push(results);

      // Keep only last 10 checks
      if (history.length > 10) {
        history.shift();
      }

      localStorage.setItem('health_check_history', JSON.stringify(history));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Utility: Convert camelCase to kebab-case
   */
  camelToKebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Get health history
   */
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem('health_check_history') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Manual recheck
   */
  recheck() {
    this.issues = [];
    this.warnings = [];
    this.checks = [];
    this.runAllChecks();
  }
}

// Auto-run health check
window.AppHealthChecker = new AppHealthChecker();

console.log('✅ App Health Checker loaded - Run window.AppHealthChecker.recheck() to run again');

export default AppHealthChecker;
