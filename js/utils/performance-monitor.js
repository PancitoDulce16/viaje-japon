/**
 * 📊 PERFORMANCE MONITOR SYSTEM
 * Sistema de monitoreo de performance con métricas y optimizaciones
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: null,
      firstPaint: null,
      firstContentfulPaint: null,
      largestContentfulPaint: null,
      firstInputDelay: null,
      cumulativeLayoutShift: 0,
      timeToInteractive: null
    };

    this.marks = new Map();
    this.measures = new Map();
    this.observations = [];
    this.slowOperations = [];

    this.init();
  }

  /**
   * Initialize monitoring
   */
  init() {
    // Wait for page to load
    if (document.readyState === 'complete') {
      this.captureMetrics();
    } else {
      // navigation.loadEventEnd no está finalizado todavía dentro del propio
      // handler del evento 'load' - leerlo ahí mismo puede dar 0 y producir
      // un pageLoad negativo. Difiere la lectura un tick para que el
      // navegador termine de escribirlo.
      window.addEventListener('load', () => setTimeout(() => this.captureMetrics(), 0));
    }

    // Monitor long tasks
    this.observeLongTasks();

    // Monitor layout shifts
    this.observeLayoutShifts();

    // Monitor largest contentful paint
    this.observeLCP();

    // Monitor first input delay
    this.observeFID();

    // Log metrics after 5 seconds
    setTimeout(() => this.logMetrics(), 5000);
  }

  /**
   * Capture core web vitals
   */
  captureMetrics() {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    if (navigation) {
      this.metrics.pageLoad = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
    }

    paint.forEach(entry => {
      if (entry.name === 'first-paint') {
        this.metrics.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        this.metrics.firstContentfulPaint = entry.startTime;
      }
    });
  }

  /**
   * Observe long tasks (>50ms)
   */
  observeLongTasks() {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.slowOperations.push({
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime,
              type: 'long-task'
            });
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // longtask not supported in all browsers
    }
  }

  /**
   * Observe layout shifts (CLS)
   */
  observeLayoutShifts() {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            this.metrics.cumulativeLayoutShift += entry.value;
          }
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // layout-shift not supported
    }
  }

  /**
   * Observe Largest Contentful Paint (LCP)
   */
  observeLCP() {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // LCP not supported
    }
  }

  /**
   * Observe First Input Delay (FID)
   */
  observeFID() {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        }
      });

      observer.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // FID not supported
    }
  }

  /**
   * Mark a performance point
   */
  mark(name) {
    if (!window.performance) return;

    const markName = `mark-${name}`;
    performance.mark(markName);
    this.marks.set(name, performance.now());
  }

  /**
   * Measure time between two marks
   */
  measure(name, startMark, endMark = null) {
    if (!window.performance) return;

    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (!start) {
      console.warn(`No start mark found for ${startMark}`);
      return;
    }

    const duration = endMark ? end - start : end - start;
    this.measures.set(name, duration);

    // Track slow operations
    if (duration > 100) {
      this.slowOperations.push({
        name,
        duration,
        startTime: start,
        type: 'measure'
      });
    }

    return duration;
  }

  /**
   * Time a function execution
   */
  async timeFunction(name, fn) {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;

      this.measures.set(name, duration);

      if (duration > 100) {
        this.slowOperations.push({
          name,
          duration,
          startTime,
          type: 'function'
        });
      }

      return { result, duration };
    } catch (error) {
      const duration = performance.now() - startTime;
      this.measures.set(`${name}-error`, duration);
      throw error;
    }
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage() {
    if (!performance.memory) return null;

    return {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      percentage: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1) + '%'
    };
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return {
      coreWebVitals: this.metrics,
      customMeasures: Object.fromEntries(this.measures),
      slowOperations: this.slowOperations,
      memory: this.getMemoryUsage()
    };
  }

  /**
   * Log metrics to console
   */
  logMetrics() {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isDev) return;

    console.group('📊 Performance Metrics');

    console.log('🎯 Core Web Vitals:');
    console.table({
      'Page Load': this.metrics.pageLoad ? `${this.metrics.pageLoad.toFixed(0)}ms` : 'N/A',
      'First Paint (FP)': this.metrics.firstPaint ? `${this.metrics.firstPaint.toFixed(0)}ms` : 'N/A',
      'First Contentful Paint (FCP)': this.metrics.firstContentfulPaint ? `${this.metrics.firstContentfulPaint.toFixed(0)}ms` : 'N/A',
      'Largest Contentful Paint (LCP)': this.metrics.largestContentfulPaint ? `${this.metrics.largestContentfulPaint.toFixed(0)}ms` : 'N/A',
      'First Input Delay (FID)': this.metrics.firstInputDelay ? `${this.metrics.firstInputDelay.toFixed(0)}ms` : 'N/A',
      'Cumulative Layout Shift (CLS)': this.metrics.cumulativeLayoutShift.toFixed(3),
      'Time to Interactive (TTI)': this.metrics.timeToInteractive ? `${this.metrics.timeToInteractive.toFixed(0)}ms` : 'N/A'
    });

    if (this.slowOperations.length > 0) {
      // Mezcla long-tasks del navegador (umbral 50ms, ver observeLongTasks)
      // con mediciones manuales (umbral 100ms, ver mark/measure) - no es un
      // único umbral fijo, así que no se etiqueta con un número específico.
      console.warn('⚠️ Slow Operations:');
      console.table(this.slowOperations.map(op => ({
        Name: op.name,
        Duration: `${op.duration.toFixed(0)}ms`,
        Type: op.type
      })));
    }

    const memory = this.getMemoryUsage();
    if (memory) {
      console.log('💾 Memory Usage:');
      console.table(memory);
    }

    if (this.measures.size > 0) {
      console.log('⏱️ Custom Measures:');
      const measuresObj = {};
      this.measures.forEach((duration, name) => {
        measuresObj[name] = `${duration.toFixed(0)}ms`;
      });
      console.table(measuresObj);
    }

    console.groupEnd();

    // Performance score
    this.displayPerformanceScore();
  }

  /**
   * Calculate and display performance score
   */
  displayPerformanceScore() {
    let score = 100;

    // Deduct points for slow metrics
    if (this.metrics.firstContentfulPaint > 1800) score -= 20;
    else if (this.metrics.firstContentfulPaint > 1000) score -= 10;

    if (this.metrics.largestContentfulPaint > 2500) score -= 20;
    else if (this.metrics.largestContentfulPaint > 1500) score -= 10;

    if (this.metrics.firstInputDelay > 100) score -= 20;
    else if (this.metrics.firstInputDelay > 50) score -= 10;

    if (this.metrics.cumulativeLayoutShift > 0.25) score -= 20;
    else if (this.metrics.cumulativeLayoutShift > 0.1) score -= 10;

    if (this.slowOperations.length > 5) score -= 10;

    score = Math.max(0, score);

    const emoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    const label = score >= 90 ? 'Excelente' : score >= 70 ? 'Bueno' : 'Necesita mejora';

    console.log(`\n${emoji} Performance Score: ${score}/100 (${label})\n`);
  }

  /**
   * Show performance panel (for development)
   */
  showPanel() {
    const metrics = this.getMetrics();
    const panelHTML = `
      <div id="performancePanel" class="fixed bottom-4 right-4 z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 max-w-md border-2 border-purple-500">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📊 Performance Monitor
          </h3>
          <button onclick="window.PerformanceMonitor.hidePanel()"
                  class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="space-y-2 text-sm">
          ${metrics.coreWebVitals.firstContentfulPaint ? `
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">FCP:</span>
              <span class="font-mono font-bold ${metrics.coreWebVitals.firstContentfulPaint < 1000 ? 'text-green-600' : 'text-yellow-600'}">
                ${metrics.coreWebVitals.firstContentfulPaint.toFixed(0)}ms
              </span>
            </div>
          ` : ''}

          ${metrics.coreWebVitals.largestContentfulPaint ? `
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">LCP:</span>
              <span class="font-mono font-bold ${metrics.coreWebVitals.largestContentfulPaint < 1500 ? 'text-green-600' : 'text-yellow-600'}">
                ${metrics.coreWebVitals.largestContentfulPaint.toFixed(0)}ms
              </span>
            </div>
          ` : ''}

          ${metrics.coreWebVitals.cumulativeLayoutShift !== undefined ? `
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">CLS:</span>
              <span class="font-mono font-bold ${metrics.coreWebVitals.cumulativeLayoutShift < 0.1 ? 'text-green-600' : 'text-yellow-600'}">
                ${metrics.coreWebVitals.cumulativeLayoutShift.toFixed(3)}
              </span>
            </div>
          ` : ''}

          ${metrics.memory ? `
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Memory:</span>
              <span class="font-mono font-bold text-blue-600">
                ${metrics.memory.usedJSHeapSize}
              </span>
            </div>
          ` : ''}

          ${this.slowOperations.length > 0 ? `
            <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div class="text-yellow-600 dark:text-yellow-400 font-semibold mb-2">
                ⚠️ ${this.slowOperations.length} Slow Operations
              </div>
              ${this.slowOperations.slice(0, 3).map(op => `
                <div class="text-xs text-gray-600 dark:text-gray-400">
                  • ${op.name}: ${op.duration.toFixed(0)}ms
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <button onclick="window.PerformanceMonitor.logMetrics()"
                class="mt-3 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition">
          📋 Log to Console
        </button>
      </div>
    `;

    // Remove existing panel
    this.hidePanel();

    // Add new panel
    document.body.insertAdjacentHTML('beforeend', panelHTML);
  }

  /**
   * Hide performance panel
   */
  hidePanel() {
    const panel = document.getElementById('performancePanel');
    if (panel) {
      panel.remove();
    }
  }

  /**
   * Get recommendations
   */
  getRecommendations() {
    const recommendations = [];

    if (this.metrics.firstContentfulPaint > 1800) {
      recommendations.push('🔴 FCP es lento. Considera: lazy loading, code splitting, optimizar CSS crítico');
    }

    if (this.metrics.largestContentfulPaint > 2500) {
      recommendations.push('🔴 LCP es lento. Considera: optimizar imágenes, preload recursos críticos, reducir JS blocking');
    }

    if (this.metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('🔴 CLS alto. Considera: reservar espacio para imágenes/ads, evitar insertar contenido dinámico');
    }

    if (this.slowOperations.length > 5) {
      recommendations.push('⚠️ Múltiples operaciones lentas detectadas. Revisar código asíncrono y optimizar loops');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance está en buen estado!');
    }

    return recommendations;
  }
}

// Create global instance
window.PerformanceMonitor = new PerformanceMonitor();

// Add keyboard shortcut to show panel (Alt+P)
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'p') {
    e.preventDefault();
    window.PerformanceMonitor.showPanel();
  }
});

console.log('✅ Performance Monitor System loaded - Press Alt+P to show panel');

export default PerformanceMonitor;
