// js/notifications.js - Sistema de notificaciones elegante

export const Notifications = {
  container: null,

  init() {
    // Crear contenedor de notificaciones si no existe
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notificationsContainer';
      this.container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 4000) {
    this.init();

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 ${colors[type]} text-white px-5 py-3 rounded-lg shadow-xl transform transition-all duration-300 ease-out`;
    toast.style.transform = 'translateX(400px)';
    toast.innerHTML = `
      <span class="text-2xl">${icons[type]}</span>
      <span class="font-medium">${message}</span>
      <button class="ml-3 text-white hover:text-gray-200 transition" onclick="this.parentElement.remove()">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    `;

    this.container.appendChild(toast);

    // Animar entrada
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto-remover
    if (duration > 0) {
      setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return toast;
  },

  success(message, duration) {
    return this.show(message, 'success', duration);
  },

  error(message, duration) {
    return this.show(message, 'error', duration);
  },

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  },

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
};

window.Notifications = Notifications;
