/**
 * 🎨 EMPTY STATES
 * ===============
 *
 * Estados vacíos bonitos y útiles
 * IMPROVED.md Quick Win #6
 */

import { JAPITIN_ILLUSTRATIONS } from './illustration-library.js';

class EmptyStates {
  /**
   * Crear empty state genérico
   */
  static create(options = {}) {
    const {
      icon = '📭',
      image = null,
      title = 'No hay nada aquí',
      message = 'Agrega algo para empezar',
      actionText = null,
      actionCallback = null
    } = options;

    const container = document.createElement('div');
    container.className = 'jp-empty-state';
    container.innerHTML = `
      <div class="jp-empty-state__art">
        ${image
          ? `<img src="${image}" alt="" aria-hidden="true" loading="lazy">`
          : `<span aria-hidden="true">${icon}</span>`}
      </div>
      <h3 class="jp-empty-state__title">${title}</h3>
      <p class="jp-empty-state__message">${message}</p>
      ${actionText && actionCallback ? `
        <button class="jp-empty-state__action">
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
      image: JAPITIN_ILLUSTRATIONS.empty.favorites,
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
      image: JAPITIN_ILLUSTRATIONS.empty.notes,
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
      image: JAPITIN_ILLUSTRATIONS.empty.itinerary,
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
      image: JAPITIN_ILLUSTRATIONS.empty.expenses,
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
      image: JAPITIN_ILLUSTRATIONS.empty.search,
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
      image: JAPITIN_ILLUSTRATIONS.empty.packing,
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
      image: JAPITIN_ILLUSTRATIONS.empty.chat,
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
    container.className = 'jp-loading-state';
    container.innerHTML = `
      <img src="${JAPITIN_ILLUSTRATIONS.loading.generic}" alt="" aria-hidden="true">
      <span class="jp-loading-state__route" aria-hidden="true"></span>
      <p>${message}</p>
    `;
    return container;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.EmptyStates = EmptyStates;
  console.log('🎨 Empty States loaded!');
}
