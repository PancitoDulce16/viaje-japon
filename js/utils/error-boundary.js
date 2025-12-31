/**
 * 🛡️ ERROR BOUNDARY SYSTEM
 * Sistema de manejo de errores global con recovery y logging
 */

class ErrorBoundary {
  constructor() {
    this.errors = [];
    this.maxErrors = 50; // Keep last 50 errors
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'uncaught_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date().toISOString()
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandled_rejection',
        message: event.reason?.message || 'Promise rejection',
        reason: event.reason,
        timestamp: new Date().toISOString()
      });
    });

    // Console error override (for development debugging)
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.handleError({
        type: 'console_error',
        message: args.join(' '),
        args,
        timestamp: new Date().toISOString()
      });
      originalConsoleError.apply(console, args);
    };
  }

  /**
   * Handle an error
   */
  handleError(errorInfo) {
    // Add to error log
    this.errors.push(errorInfo);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.warn('🛡️ ErrorBoundary caught:', errorInfo);
    }

    // TODO: Send to analytics/logging service in production
    // this.sendToLoggingService(errorInfo);

    // Show user-friendly message for critical errors
    if (this.isCriticalError(errorInfo)) {
      this.showErrorNotification(errorInfo);
    }
  }

  /**
   * Check if error is critical
   */
  isCriticalError(errorInfo) {
    const criticalPatterns = [
      /firebase/i,
      /authentication/i,
      /network/i,
      /fetch/i,
      /cannot read property/i,
      /undefined is not/i
    ];

    return criticalPatterns.some(pattern =>
      pattern.test(errorInfo.message)
    );
  }

  /**
   * Show error notification to user
   */
  showErrorNotification(errorInfo) {
    // Only show if not already showing
    if (document.getElementById('error-notification')) return;

    const notification = document.createElement('div');
    notification.id = 'error-notification';
    notification.className = 'fixed bottom-4 right-4 z-[9999] max-w-md bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 shadow-xl animate-fadeInUp';

    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="font-bold text-red-800 dark:text-red-300 mb-1">Oops! Algo salió mal</h4>
          <p class="text-sm text-red-700 dark:text-red-400 mb-3">
            Hubo un error. No te preocupes, puedes continuar usando la app.
          </p>
          <div class="flex gap-2">
            <button onclick="window.ErrorBoundary.retry()"
                    class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition">
              🔄 Reintentar
            </button>
            <button onclick="window.ErrorBoundary.hideNotification()"
                    class="px-3 py-1 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-800 dark:text-red-300 text-sm font-medium rounded transition">
              Cerrar
            </button>
          </div>
        </div>
        <button onclick="window.ErrorBoundary.hideNotification()"
                class="flex-shrink-0 text-red-600 hover:text-red-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => this.hideNotification(), 10000);
  }

  /**
   * Hide error notification
   */
  hideNotification() {
    const notification = document.getElementById('error-notification');
    if (notification) {
      notification.classList.add('animate-fadeOut');
      setTimeout(() => notification.remove(), 200);
    }
  }

  /**
   * Retry last action (reload page)
   */
  retry() {
    this.hideNotification();
    window.location.reload();
  }

  /**
   * Get error log
   */
  getErrors(filter = null) {
    if (!filter) return this.errors;
    return this.errors.filter(e => e.type === filter);
  }

  /**
   * Clear error log
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Wrap async function with error handling
   */
  async wrap(fn, context = 'operation') {
    try {
      return await fn();
    } catch (error) {
      this.handleError({
        type: 'wrapped_error',
        message: `Error in ${context}: ${error.message}`,
        context,
        error,
        timestamp: new Date().toISOString()
      });
      throw error; // Re-throw for caller to handle
    }
  }

  /**
   * Safe execute (doesn't throw)
   */
  async safeExecute(fn, fallback = null, context = 'operation') {
    try {
      return await fn();
    } catch (error) {
      this.handleError({
        type: 'safe_execute_error',
        message: `Error in ${context}: ${error.message}`,
        context,
        error,
        timestamp: new Date().toISOString()
      });
      return fallback;
    }
  }

  /**
   * Get error stats
   */
  getStats() {
    const types = {};
    this.errors.forEach(err => {
      types[err.type] = (types[err.type] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byType: types,
      lastError: this.errors[this.errors.length - 1],
      criticalCount: this.errors.filter(e => this.isCriticalError(e)).length
    };
  }
}

// Create global instance
window.ErrorBoundary = new ErrorBoundary();

console.log('✅ Error Boundary System loaded');

export default ErrorBoundary;
