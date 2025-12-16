/**
 * 🎨 EMPTY STATES
 * ===============
 *
 * Estados vacíos bonitos y útiles
 * IMPROVED.md Quick Win #6
 */

class EmptyStates {
  /**
   * Crear empty state genérico
   */
  static create(options = {}) {
    const {
      icon = '📭',
      title = 'No hay nada aquí',
      message = 'Agrega algo para empezar',
      actionText = null,
      actionCallback = null
    } = options;

    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center p-12 text-center';
    container.innerHTML = `
      <div class="w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
        <span class="text-5xl">${icon}</span>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${title}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">${message}</p>
      ${actionText && actionCallback ? `
        <button class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold">
          ${actionText}
        </button>
      ` : ''}
    `;

    if (actionText && actionCallback) {
      container.querySelector('button')?.addEventListener('click', actionCallback);
    }

    return container;
  }

  /**
   * Empty state para favoritos
   */
  static favorites() {
    return this.create({
      icon: '⭐',
      title: 'No tienes favoritos aún',
      message: 'Explora lugares increíbles en Japón y agrégalos a tus favoritos',
      actionText: '🔍 Explorar Lugares',
      actionCallback: () => {
        if (window.showToast) {
          window.showToast('Abriendo explorador de lugares...', 'info');
        }
      }
    });
  }

  /**
   * Empty state para notas
   */
  static notes() {
    return this.create({
      icon: '📝',
      title: 'Sin notas todavía',
      message: 'Crea notas para recordar detalles importantes de tu viaje',
      actionText: '✍️ Crear Primera Nota',
      actionCallback: () => {
        if (window.DashboardApp?.openFloatingModal) {
          window.DashboardApp.openFloatingModal('notes');
        }
      }
    });
  }

  /**
   * Empty state para itinerario
   */
  static itinerary() {
    return this.create({
      icon: '📅',
      title: 'Tu itinerario está vacío',
      message: '¡Empieza a planear tu aventura en Japón! Agrega días y actividades',
      actionText: '🎌 Comenzar a Planear',
      actionCallback: () => {
        if (window.showMainMenu) {
          window.showMainMenu();
        }
      }
    });
  }

  /**
   * Empty state para gastos
   */
  static expenses() {
    return this.create({
      icon: '💰',
      title: 'No hay gastos registrados',
      message: 'Comienza a registrar tus gastos para mantener el control de tu presupuesto',
      actionText: '💵 Agregar Primer Gasto',
      actionCallback: () => {
        if (window.DashboardApp?.openFloatingModal) {
          window.DashboardApp.openFloatingModal('budget');
        }
      }
    });
  }

  /**
   * Empty state para búsqueda sin resultados
   */
  static searchNoResults(query) {
    return this.create({
      icon: '🔍',
      title: 'No se encontraron resultados',
      message: `No encontramos nada para "${query}". Intenta con otros términos`,
      actionText: null,
      actionCallback: null
    });
  }

  /**
   * Empty state para packing list
   */
  static packing() {
    return this.create({
      icon: '🎒',
      title: 'Lista de equipaje vacía',
      message: '¿Qué vas a llevar a Japón? Crea tu lista de equipaje personalizada',
      actionText: '📦 Crear Lista',
      actionCallback: () => {
        if (window.DashboardApp?.openFloatingModal) {
          window.DashboardApp.openFloatingModal('packing');
        }
      }
    });
  }

  /**
   * Empty state para chat
   */
  static chat() {
    return this.create({
      icon: '💬',
      title: 'Sin mensajes',
      message: 'Comienza una conversación con tu asistente IA',
      actionText: '🤖 Iniciar Chat',
      actionCallback: () => {
        if (window.AIChatUI?.open) {
          window.AIChatUI.open();
        }
      }
    });
  }

  /**
   * Loading/cargando state
   */
  static loading(message = 'Cargando...') {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center p-12 text-center';
    container.innerHTML = `
      <div class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">${message}</p>
    `;
    return container;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.EmptyStates = EmptyStates;
  console.log('🎨 Empty States loaded!');
}
