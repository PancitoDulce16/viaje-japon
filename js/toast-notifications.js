/**
 * 🍞 TOAST NOTIFICATIONS
 * ======================
 *
 * Sistema de notificaciones toast elegante y simple
 */

class ToastNotifications {
  constructor() {
    this.container = null;
    this.createContainer();
  }

  /**
   * Crear contenedor para toasts
   */
  createContainer() {
    if (document.getElementById('toast-container')) return;

    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-[100000] space-y-2 pointer-events-none';
    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * Mostrar toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - success | error | warning | info
   * @param {number} duration - Duración en ms (default 3000)
   */
  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast-notification pointer-events-auto transform transition-all duration-300 translate-x-[400px] opacity-0`;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const colors = {
      success: 'from-green-500 to-green-600',
      error: 'from-red-500 to-red-600',
      warning: 'from-yellow-500 to-yellow-600',
      info: 'from-blue-500 to-blue-600'
    };

    toast.innerHTML = `
      <div class="flex items-center gap-3 bg-gradient-to-r ${colors[type]} text-white px-4 py-3 rounded-lg shadow-2xl min-w-[300px] max-w-md">
        <span class="text-2xl">${icons[type]}</span>
        <span class="flex-1">${message}</span>
        <button class="toast-close text-white/80 hover:text-white ml-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;

    this.container.appendChild(toast);

    // Animar entrada
    setTimeout(() => {
      toast.classList.remove('translate-x-[400px]', 'opacity-0');
    }, 10);

    // Auto-cerrar
    const autoCloseTimeout = setTimeout(() => {
      this.remove(toast);
    }, duration);

    // Botón cerrar
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(autoCloseTimeout);
      this.remove(toast);
    });

    return toast;
  }

  /**
   * Remover toast con animación
   */
  remove(toast) {
    toast.classList.add('translate-x-[400px]', 'opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  /**
   * Shortcuts para tipos comunes
   */
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ToastNotifications = new ToastNotifications();

  // Helper global function
  window.showToast = (message, type, duration) => {
    return window.ToastNotifications.show(message, type, duration);
  };

  console.log('🍞 Toast Notifications loaded!');
}
