/**
 * Logger System
 *
 * Centralized logging system with debug mode toggle.
 * Replaces 1,005+ scattered console.log statements.
 *
 * Features:
 * - Debug mode toggle (localStorage)
 * - Log levels: debug, info, warn, error
 * - Grouped logs
 * - Performance timing
 * - Export logs for debugging
 * - Production-safe (no logs in prod unless debug enabled)
 */

const Logger = {
  // Configuration
  config: {
    debugMode: false,
    maxLogs: 1000, // Maximum logs to keep in memory
    levels: {
      DEBUG: { priority: 0, emoji: '🔍', color: '#6B7280' },
      INFO: { priority: 1, emoji: '📘', color: '#3B82F6' },
      SUCCESS: { priority: 2, emoji: '✅', color: '#10B981' },
      WARN: { priority: 3, emoji: '⚠️', color: '#F59E0B' },
      ERROR: { priority: 4, emoji: '❌', color: '#EF4444' }
    }
  },

  // In-memory log storage
  logs: [],

  // Performance timers
  timers: {},

  /**
   * Initializes the logger system
   */
  init() {
    // Check if debug mode is enabled in localStorage
    const debugEnabled = localStorage.getItem('debugMode') === 'true';
    this.config.debugMode = debugEnabled;

    console.log(`🔧 Logger initialized (Debug Mode: ${debugEnabled ? 'ON' : 'OFF'})`);

    // Add keyboard shortcut to toggle debug mode (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.toggleDebugMode();
      }
    });

    // Make logger available globally
    if (typeof window !== 'undefined') {
      window.Logger = this;
    }
  },

  /**
   * Toggles debug mode
   */
  toggleDebugMode() {
    this.config.debugMode = !this.config.debugMode;
    localStorage.setItem('debugMode', this.config.debugMode.toString());

    const message = this.config.debugMode
      ? '🔍 Debug Mode ENABLED - Logs will now be visible'
      : '🔇 Debug Mode DISABLED - Logs are hidden';

    console.log(message);

    if (window.Notifications) {
      window.Notifications.show(message, this.config.debugMode ? 'success' : 'info');
    }

    return this.config.debugMode;
  },

  /**
   * Core logging function
   */
  log(level, message, data = null, component = null) {
    const levelConfig = this.config.levels[level];
    if (!levelConfig) {
      console.error('Invalid log level:', level);
      return;
    }

    // Skip DEBUG logs if debug mode is off
    if (level === 'DEBUG' && !this.config.debugMode) {
      return;
    }

    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      component,
      emoji: levelConfig.emoji
    };

    // Store in memory (FIFO if exceeds max)
    this.logs.push(logEntry);
    if (this.logs.length > this.config.maxLogs) {
      this.logs.shift();
    }

    // Format console output
    const prefix = component ? `[${component}]` : '';
    const fullMessage = `${levelConfig.emoji} ${prefix} ${message}`;

    // Output to console based on level
    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
    const style = `color: ${levelConfig.color}; font-weight: bold;`;

    if (data) {
      console[consoleMethod](`%c${fullMessage}`, style, data);
    } else {
      console[consoleMethod](`%c${fullMessage}`, style);
    }
  },

  /**
   * Debug level logs (only shown when debug mode is enabled)
   */
  debug(message, data = null, component = null) {
    this.log('DEBUG', message, data, component);
  },

  /**
   * Info level logs
   */
  info(message, data = null, component = null) {
    this.log('INFO', message, data, component);
  },

  /**
   * Success level logs
   */
  success(message, data = null, component = null) {
    this.log('SUCCESS', message, data, component);
  },

  /**
   * Warning level logs
   */
  warn(message, data = null, component = null) {
    this.log('WARN', message, data, component);
  },

  /**
   * Error level logs (always shown)
   */
  error(message, data = null, component = null) {
    this.log('ERROR', message, data, component);
  },

  /**
   * Grouped logs
   */
  group(title, callback, collapsed = false) {
    if (!this.config.debugMode && collapsed) return;

    if (collapsed) {
      console.groupCollapsed(`📦 ${title}`);
    } else {
      console.group(`📦 ${title}`);
    }

    if (callback) callback();

    console.groupEnd();
  },

  /**
   * Performance timing
   */
  time(label, component = null) {
    const key = component ? `${component}:${label}` : label;
    this.timers[key] = performance.now();
    this.debug(`⏱️ Timer started: ${label}`, null, component);
  },

  /**
   * End performance timing
   */
  timeEnd(label, component = null) {
    const key = component ? `${component}:${label}` : label;
    const startTime = this.timers[key];

    if (!startTime) {
      this.warn(`No timer found for: ${label}`, null, component);
      return;
    }

    const duration = (performance.now() - startTime).toFixed(2);
    delete this.timers[key];

    this.info(`⏱️ ${label}: ${duration}ms`, null, component);
    return duration;
  },

  /**
   * Logs table data
   */
  table(data, title = null) {
    if (!this.config.debugMode) return;

    if (title) {
      console.log(`📊 ${title}`);
    }
    console.table(data);
  },

  /**
   * Exports logs as JSON
   */
  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      debugMode: this.config.debugMode,
      logs: this.logs,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `japan-trip-logs-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.success(`Logs exported: ${this.logs.length} entries`);
  },

  /**
   * Clears all stored logs
   */
  clearLogs() {
    const count = this.logs.length;
    this.logs = [];
    console.clear();
    this.info(`Cleared ${count} log entries`);
  },

  /**
   * Shows logger status
   */
  status() {
    this.group('Logger Status', () => {
      console.log('Debug Mode:', this.config.debugMode ? '✅ ENABLED' : '❌ DISABLED');
      console.log('Logs Stored:', this.logs.length);
      console.log('Active Timers:', Object.keys(this.timers).length);
      console.log('Max Logs:', this.config.maxLogs);
      console.log('');
      console.log('Commands:');
      console.log('  Logger.toggleDebugMode() - Toggle debug mode');
      console.log('  Logger.exportLogs() - Export logs as JSON');
      console.log('  Logger.clearLogs() - Clear all logs');
      console.log('  Logger.status() - Show this status');
      console.log('');
      console.log('Keyboard Shortcuts:');
      console.log('  Ctrl+Shift+D - Toggle debug mode');
    });
  },

  /**
   * Usage examples
   */
  examples() {
    console.log(`
Logger Usage Examples:

// Basic logging
Logger.debug('User clicked button', { buttonId: 'submit' }, 'UI');
Logger.info('Data loaded successfully', data, 'API');
Logger.success('Profile saved', null, 'Settings');
Logger.warn('Slow network detected', { latency: 2000 }, 'Network');
Logger.error('Failed to save', error, 'Database');

// Performance timing
Logger.time('loadItinerary', 'ItineraryLoader');
// ... your code ...
Logger.timeEnd('loadItinerary', 'ItineraryLoader');

// Grouped logs
Logger.group('User Actions', () => {
  Logger.info('User logged in');
  Logger.info('Navigated to itinerary');
  Logger.info('Added new activity');
});

// Table data
Logger.table(activities, 'Activities List');

// Toggle debug mode
Logger.toggleDebugMode(); // or press Ctrl+Shift+D

// Export logs
Logger.exportLogs();
    `);
  }
};

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Logger.init());
} else {
  Logger.init();
}

// Make available globally
if (typeof window !== 'undefined') {
  window.Logger = Logger;
}

// Also export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Logger };
}
