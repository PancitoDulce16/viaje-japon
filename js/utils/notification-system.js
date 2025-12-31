/**
 * 🔔 IN-APP NOTIFICATION SYSTEM
 * Sistema de notificaciones toast mejorado con queue y prioridades
 */

class NotificationSystem {
  constructor() {
    this.queue = [];
    this.activeNotifications = new Set();
    this.maxVisible = 3;
    this.container = null;
    this.sounds = {
      success: null,
      error: null,
      warning: null,
      info: null
    };

    this.init();
  }

  /**
   * Initialize notification system
   */
  init() {
    this.createContainer();
    this.loadSounds();
  }

  /**
   * Create notifications container
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'notificationContainer';
    this.container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none';
    this.container.style.maxWidth = '420px';
    document.body.appendChild(this.container);
  }

  /**
   * Load notification sounds (optional)
   */
  loadSounds() {
    // Optional: Add sound effects
    // this.sounds.success = new Audio('/sounds/success.mp3');
  }

  /**
   * Show notification
   */
  show(message, type = 'info', options = {}) {
    const {
      duration = this.getDefaultDuration(type),
      title = null,
      action = null,
      actionLabel = null,
      icon = this.getDefaultIcon(type),
      priority = 0,
      sound = false,
      dismissible = true
    } = options;

    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      title,
      action,
      actionLabel,
      icon,
      duration,
      priority,
      sound,
      dismissible,
      timestamp: Date.now()
    };

    // Add to queue
    this.queue.push(notification);
    this.queue.sort((a, b) => b.priority - a.priority);

    // Process queue
    this.processQueue();

    return notification.id;
  }

  /**
   * Process notification queue
   */
  processQueue() {
    while (this.activeNotifications.size < this.maxVisible && this.queue.length > 0) {
      const notification = this.queue.shift();
      this.displayNotification(notification);
    }
  }

  /**
   * Display notification
   */
  displayNotification(notification) {
    this.activeNotifications.add(notification);

    const element = document.createElement('div');
    element.id = notification.id;
    element.className = `notification-toast pointer-events-auto transform transition-all duration-300 ${this.getNotificationClass(notification.type)}`;
    element.setAttribute('role', 'alert');
    element.setAttribute('aria-live', notification.type === 'error' ? 'assertive' : 'polite');

    element.innerHTML = `
      <div class="flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-sm ${this.getBackgroundClass(notification.type)} border-2 ${this.getBorderClass(notification.type)} min-w-[300px] max-w-[420px]">

        <!-- Icon -->
        <div class="flex-shrink-0">
          <div class="w-10 h-10 rounded-full ${this.getIconBgClass(notification.type)} flex items-center justify-center">
            <span class="text-2xl">${notification.icon}</span>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          ${notification.title ? `
            <h4 class="font-bold ${this.getTextClass(notification.type)} mb-1">
              ${notification.title}
            </h4>
          ` : ''}

          <p class="text-sm ${this.getTextClass(notification.type)} break-words">
            ${notification.message}
          </p>

          ${notification.action && notification.actionLabel ? `
            <button onclick="${notification.action}"
                    class="mt-2 text-sm font-bold ${this.getActionClass(notification.type)} hover:underline">
              ${notification.actionLabel} →
            </button>
          ` : ''}
        </div>

        <!-- Close button -->
        ${notification.dismissible ? `
          <button onclick="window.NotificationSystem.dismiss('${notification.id}')"
                  class="flex-shrink-0 ${this.getTextClass(notification.type)} hover:opacity-80 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        ` : ''}

      </div>
    `;

    // Add animation classes
    element.style.opacity = '0';
    element.style.transform = 'translateX(400px)';

    this.container.appendChild(element);

    // Trigger animation
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateX(0)';
    });

    // Play sound if enabled
    if (notification.sound && this.sounds[notification.type]) {
      this.sounds[notification.type].play().catch(() => {});
    }

    // Auto-dismiss
    if (notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Dismiss notification
   */
  dismiss(notificationId) {
    const element = document.getElementById(notificationId);
    if (!element) return;

    // Animate out
    element.style.opacity = '0';
    element.style.transform = 'translateX(400px)';

    setTimeout(() => {
      element.remove();

      // Remove from active set
      this.activeNotifications.forEach(n => {
        if (n.id === notificationId) {
          this.activeNotifications.delete(n);
        }
      });

      // Process queue
      this.processQueue();
    }, 300);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll() {
    this.activeNotifications.forEach(n => {
      this.dismiss(n.id);
    });
    this.queue = [];
  }

  /**
   * Shorthand methods
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', { ...options, duration: options.duration || 6000 });
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * Get default duration based on type
   */
  getDefaultDuration(type) {
    const durations = {
      success: 4000,
      error: 6000,
      warning: 5000,
      info: 4000
    };
    return durations[type] || 4000;
  }

  /**
   * Get default icon
   */
  getDefaultIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }

  /**
   * Get notification classes
   */
  getNotificationClass(type) {
    return 'animate-slideInRight';
  }

  getBackgroundClass(type) {
    const classes = {
      success: 'bg-green-50 dark:bg-green-900/30',
      error: 'bg-red-50 dark:bg-red-900/30',
      warning: 'bg-yellow-50 dark:bg-yellow-900/30',
      info: 'bg-blue-50 dark:bg-blue-900/30'
    };
    return classes[type] || classes.info;
  }

  getBorderClass(type) {
    const classes = {
      success: 'border-green-300 dark:border-green-700',
      error: 'border-red-300 dark:border-red-700',
      warning: 'border-yellow-300 dark:border-yellow-700',
      info: 'border-blue-300 dark:border-blue-700'
    };
    return classes[type] || classes.info;
  }

  getIconBgClass(type) {
    const classes = {
      success: 'bg-green-100 dark:bg-green-800',
      error: 'bg-red-100 dark:bg-red-800',
      warning: 'bg-yellow-100 dark:bg-yellow-800',
      info: 'bg-blue-100 dark:bg-blue-800'
    };
    return classes[type] || classes.info;
  }

  getTextClass(type) {
    const classes = {
      success: 'text-green-800 dark:text-green-200',
      error: 'text-red-800 dark:text-red-200',
      warning: 'text-yellow-800 dark:text-yellow-200',
      info: 'text-blue-800 dark:text-blue-200'
    };
    return classes[type] || classes.info;
  }

  getActionClass(type) {
    const classes = {
      success: 'text-green-700 dark:text-green-300',
      error: 'text-red-700 dark:text-red-300',
      warning: 'text-yellow-700 dark:text-yellow-300',
      info: 'text-blue-700 dark:text-blue-300'
    };
    return classes[type] || classes.info;
  }

  /**
   * Show update notification
   */
  showUpdate(message, action = null) {
    return this.show(message, 'info', {
      title: '🔄 Actualización disponible',
      action: action || 'location.reload()',
      actionLabel: 'Actualizar ahora',
      duration: 0,
      priority: 10,
      icon: '🔄'
    });
  }

  /**
   * Show achievement notification
   */
  showAchievement(title, message) {
    return this.show(message, 'success', {
      title: `🏆 ${title}`,
      duration: 6000,
      priority: 5,
      icon: '🏆',
      sound: true
    });
  }

  /**
   * Show tip notification
   */
  showTip(message) {
    return this.show(message, 'info', {
      title: '💡 Tip',
      duration: 8000,
      icon: '💡'
    });
  }
}

// Create global instance
window.NotificationSystem = new NotificationSystem();

// Add CSS for slide animation if not exists
if (!document.getElementById('notification-animations')) {
  const style = document.createElement('style');
  style.id = 'notification-animations';
  style.textContent = `
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(400px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .animate-slideInRight {
      animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .notification-toast:hover {
      transform: scale(1.02);
    }
  `;
  document.head.appendChild(style);
}

console.log('✅ Notification System loaded');

export default NotificationSystem;
