/**
 * 📊 PERFORMANCE MONITOR
 * ======================
 *
 * Tracks and reports performance metrics:
 * - Page load times
 * - Resource loading
 * - User interactions
 * - Core Web Vitals (LCP, FID, CLS)
 *
 * MONITORS:
 * - First Contentful Paint (FCP)
 * - Largest Contentful Paint (LCP)
 * - First Input Delay (FID)
 * - Cumulative Layout Shift (CLS)
 * - Time to Interactive (TTI)
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      navigation: {},
      paint: {},
      resources: [],
      vitals: {},
      userInteractions: []
    };

    this.thresholds = {
      // Core Web Vitals thresholds (good, needs improvement, poor)
      LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
      FID: { good: 100, poor: 300 },        // First Input Delay
      CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
      FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
      TTFB: { good: 800, poor: 1800 }       // Time to First Byte
    };

    this.init();
  }

  /**
   * Initialize monitoring
   */
  init() {
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', () => this.startMonitoring());
    } else {
      this.startMonitoring();
    }

    console.log('📊 Performance Monitor initialized');
  }

  /**
   * Start monitoring
   */
  startMonitoring() {
    this.measureNavigationTiming();
    this.measurePaintTiming();
    this.measureResourceTiming();
    this.measureCoreWebVitals();
    this.setupUserInteractionTracking();

    // Report after page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => this.generateReport(), 1000);
    });
  }

  /**
   * Measure navigation timing
   */
  measureNavigationTiming() {
    if (!performance.getEntriesByType) return;

    const navEntry = performance.getEntriesByType('navigation')[0];
    if (!navEntry) return;

    this.metrics.navigation = {
      // DNS lookup
      dnsTime: navEntry.domainLookupEnd - navEntry.domainLookupStart,

      // TCP connection
      tcpTime: navEntry.connectEnd - navEntry.connectStart,

      // SSL/TLS handshake
      tlsTime: navEntry.secureConnectionStart > 0
        ? navEntry.connectEnd - navEntry.secureConnectionStart
        : 0,

      // Time to First Byte
      ttfb: navEntry.responseStart - navEntry.requestStart,

      // Response download
      downloadTime: navEntry.responseEnd - navEntry.responseStart,

      // DOM processing
      domProcessingTime: navEntry.domComplete - navEntry.domInteractive,

      // Total page load time
      totalLoadTime: navEntry.loadEventEnd - navEntry.fetchStart,

      // DOM Content Loaded
      domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
    };
  }

  /**
   * Measure paint timing
   */
  measurePaintTiming() {
    if (!performance.getEntriesByType) return;

    const paintEntries = performance.getEntriesByType('paint');

    paintEntries.forEach(entry => {
      this.metrics.paint[entry.name] = entry.startTime;
    });

    // First Contentful Paint
    const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
    if (fcp) {
      this.metrics.vitals.FCP = fcp.startTime;
    }
  }

  /**
   * Measure resource timing
   */
  measureResourceTiming() {
    if (!performance.getEntriesByType) return;

    const resourceEntries = performance.getEntriesByType('resource');

    const resourceSummary = {
      scripts: { count: 0, size: 0, duration: 0 },
      stylesheets: { count: 0, size: 0, duration: 0 },
      images: { count: 0, size: 0, duration: 0 },
      fonts: { count: 0, size: 0, duration: 0 },
      other: { count: 0, size: 0, duration: 0 }
    };

    resourceEntries.forEach(entry => {
      const type = this.getResourceType(entry.name);
      const category = resourceSummary[type] || resourceSummary.other;

      category.count++;
      category.size += entry.transferSize || 0;
      category.duration += entry.duration || 0;

      // Store detailed resource info
      this.metrics.resources.push({
        name: entry.name,
        type: type,
        duration: entry.duration,
        size: entry.transferSize,
        cached: entry.transferSize === 0
      });
    });

    this.metrics.resourceSummary = resourceSummary;
  }

  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.endsWith('.js')) return 'scripts';
    if (url.endsWith('.css')) return 'stylesheets';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return 'images';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'fonts';
    return 'other';
  }

  /**
   * Measure Core Web Vitals
   */
  measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.vitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observation not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.metrics.vitals.FID = entry.processingStart - entry.startTime;
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observation not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.vitals.CLS = clsValue;
            }
          }
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observation not supported');
      }
    }
  }

  /**
   * Setup user interaction tracking
   */
  setupUserInteractionTracking() {
    // Track first click
    const trackFirstClick = () => {
      const timeToFirstClick = performance.now();
      this.metrics.userInteractions.push({
        type: 'first-click',
        time: timeToFirstClick
      });
      document.removeEventListener('click', trackFirstClick);
    };

    document.addEventListener('click', trackFirstClick, { once: true });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.metrics.userInteractions.maxScrollDepth = Math.round(scrollDepth * 100);
      }
    }, { passive: true });
  }

  /**
   * Generate performance report
   */
  generateReport() {
    console.log('📊 PERFORMANCE REPORT');
    console.log('=====================');

    // Navigation timing
    if (this.metrics.navigation.totalLoadTime) {
      console.log('\n🚀 Navigation Timing:');
      console.log(`  DNS Lookup: ${this.metrics.navigation.dnsTime.toFixed(2)}ms`);
      console.log(`  TCP Connection: ${this.metrics.navigation.tcpTime.toFixed(2)}ms`);
      console.log(`  TTFB: ${this.metrics.navigation.ttfb.toFixed(2)}ms ${this.getRating('TTFB', this.metrics.navigation.ttfb)}`);
      console.log(`  Download: ${this.metrics.navigation.downloadTime.toFixed(2)}ms`);
      console.log(`  DOM Processing: ${this.metrics.navigation.domProcessingTime.toFixed(2)}ms`);
      console.log(`  Total Load: ${this.metrics.navigation.totalLoadTime.toFixed(2)}ms`);
    }

    // Paint timing
    if (Object.keys(this.metrics.paint).length > 0) {
      console.log('\n🎨 Paint Timing:');
      Object.entries(this.metrics.paint).forEach(([name, time]) => {
        console.log(`  ${name}: ${time.toFixed(2)}ms`);
      });
    }

    // Core Web Vitals
    if (Object.keys(this.metrics.vitals).length > 0) {
      console.log('\n💚 Core Web Vitals:');
      if (this.metrics.vitals.FCP) {
        console.log(`  FCP: ${this.metrics.vitals.FCP.toFixed(2)}ms ${this.getRating('FCP', this.metrics.vitals.FCP)}`);
      }
      if (this.metrics.vitals.LCP) {
        console.log(`  LCP: ${this.metrics.vitals.LCP.toFixed(2)}ms ${this.getRating('LCP', this.metrics.vitals.LCP)}`);
      }
      if (this.metrics.vitals.FID) {
        console.log(`  FID: ${this.metrics.vitals.FID.toFixed(2)}ms ${this.getRating('FID', this.metrics.vitals.FID)}`);
      }
      if (this.metrics.vitals.CLS) {
        console.log(`  CLS: ${this.metrics.vitals.CLS.toFixed(3)} ${this.getRating('CLS', this.metrics.vitals.CLS)}`);
      }
    }

    // Resource summary
    if (this.metrics.resourceSummary) {
      console.log('\n📦 Resources:');
      Object.entries(this.metrics.resourceSummary).forEach(([type, data]) => {
        if (data.count > 0) {
          console.log(`  ${type}: ${data.count} files, ${this.formatBytes(data.size)}, ${data.duration.toFixed(2)}ms`);
        }
      });

      const totalSize = Object.values(this.metrics.resourceSummary)
        .reduce((sum, data) => sum + data.size, 0);
      console.log(`  TOTAL: ${this.formatBytes(totalSize)}`);
    }

    // Warnings
    this.generateWarnings();

    return this.metrics;
  }

  /**
   * Generate performance warnings
   */
  generateWarnings() {
    const warnings = [];

    // Check TTFB
    if (this.metrics.navigation.ttfb > this.thresholds.TTFB.poor) {
      warnings.push(`⚠️ TTFB is slow (${this.metrics.navigation.ttfb.toFixed(2)}ms). Consider server optimization or CDN.`);
    }

    // Check LCP
    if (this.metrics.vitals.LCP > this.thresholds.LCP.poor) {
      warnings.push(`⚠️ LCP is poor (${this.metrics.vitals.LCP.toFixed(2)}ms). Optimize largest content element.`);
    }

    // Check FID
    if (this.metrics.vitals.FID > this.thresholds.FID.poor) {
      warnings.push(`⚠️ FID is poor (${this.metrics.vitals.FID.toFixed(2)}ms). Reduce JavaScript execution time.`);
    }

    // Check CLS
    if (this.metrics.vitals.CLS > this.thresholds.CLS.poor) {
      warnings.push(`⚠️ CLS is poor (${this.metrics.vitals.CLS.toFixed(3)}). Fix layout shifts.`);
    }

    // Check total resources size
    if (this.metrics.resourceSummary) {
      const totalSize = Object.values(this.metrics.resourceSummary)
        .reduce((sum, data) => sum + data.size, 0);

      if (totalSize > 2 * 1024 * 1024) { // > 2MB
        warnings.push(`⚠️ Total resource size is large (${this.formatBytes(totalSize)}). Consider code splitting and lazy loading.`);
      }

      // Check JavaScript size
      if (this.metrics.resourceSummary.scripts.size > 1024 * 1024) { // > 1MB
        warnings.push(`⚠️ JavaScript bundle is large (${this.formatBytes(this.metrics.resourceSummary.scripts.size)}). Implement code splitting.`);
      }
    }

    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.forEach(warning => console.log(`  ${warning}`));
    } else {
      console.log('\n✅ No performance warnings! Great job!');
    }
  }

  /**
   * Get rating for metric
   */
  getRating(metric, value) {
    const threshold = this.thresholds[metric];
    if (!threshold) return '';

    if (value <= threshold.good) {
      return '🟢';
    } else if (value <= threshold.poor) {
      return '🟡';
    } else {
      return '🔴';
    }
  }

  /**
   * Format bytes to human-readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get metrics object
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics() {
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = new PerformanceMonitor();

  // Expose report function
  window.showPerformanceReport = () => window.PerformanceMonitor.generateReport();

  console.log('📊 Performance Monitor ready! Type showPerformanceReport() to see metrics.');
}
