/**
 * 🎯 MODAL MANAGER SYSTEM
 * Sistema centralizado para gestión de modales con UX perfecto
 */

class ModalManager {
  constructor() {
    this.activeModals = new Set();
    this.setupGlobalHandlers();
  }

  /**
   * Setup global event handlers
   */
  setupGlobalHandlers() {
    // ESC key cierra la modal activa más reciente
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModals.size > 0) {
        const modals = Array.from(this.activeModals);
        const lastModal = modals[modals.length - 1];
        if (lastModal && lastModal.closeCallback) {
          lastModal.closeCallback();
        }
      }
    });

    // Prevenir scroll del body cuando hay modales abiertas
    this.updateBodyScroll();
  }

  /**
   * Crea y muestra una modal
   */
  createModal(config) {
    const {
      id,
      content,
      className = '',
      closeCallback,
      closeOnOutsideClick = true,
      closeOnEsc = true,
      showCloseButton = true,
      backdrop = 'blur'
    } = config;

    // Crear modal element
    const modal = document.createElement('div');
    modal.id = id;

    const backdropClass = backdrop === 'blur'
      ? 'backdrop-blur-strong'
      : backdrop === 'dark'
      ? 'bg-black/80'
      : 'bg-black/50';

    modal.className = `fixed inset-0 z-50 ${backdropClass} flex items-center justify-center p-4 animate-fadeInUp ${className}`;
    modal.innerHTML = content;

    // Close on outside click
    if (closeOnOutsideClick) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal && closeCallback) {
          closeCallback();
        }
      });
    }

    // Track this modal
    const modalData = {
      id,
      element: modal,
      closeCallback: closeOnEsc ? closeCallback : null
    };
    this.activeModals.add(modalData);

    // Add to DOM
    document.body.appendChild(modal);
    this.updateBodyScroll();

    // Return modal element
    return modal;
  }

  /**
   * Cierra una modal por ID
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      // Animación de salida
      modal.classList.remove('animate-fadeInUp');
      modal.classList.add('animate-fadeOut');

      setTimeout(() => {
        modal.remove();
        // Remove from tracking
        this.activeModals.forEach(m => {
          if (m.id === modalId) {
            this.activeModals.delete(m);
          }
        });
        this.updateBodyScroll();
      }, 200);
    }
  }

  /**
   * Cierra todas las modales
   */
  closeAllModals() {
    this.activeModals.forEach(modalData => {
      this.closeModal(modalData.id);
    });
  }

  /**
   * Actualiza el scroll del body
   */
  updateBodyScroll() {
    if (this.activeModals.size > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * Muestra loading state en una modal
   */
  showLoading(modalId, message = 'Cargando...') {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
    loadingOverlay.id = `${modalId}-loading`;
    loadingOverlay.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center glass-card">
        <div class="flex gap-2 justify-center mb-4">
          <div class="loading-dot bg-purple-600"></div>
          <div class="loading-dot bg-pink-600"></div>
          <div class="loading-dot bg-blue-600"></div>
        </div>
        <p class="text-gray-700 dark:text-gray-300 font-medium">${message}</p>
      </div>
    `;

    modal.appendChild(loadingOverlay);
  }

  /**
   * Oculta loading state
   */
  hideLoading(modalId) {
    const loading = document.getElementById(`${modalId}-loading`);
    if (loading) {
      loading.classList.add('animate-fadeOut');
      setTimeout(() => loading.remove(), 200);
    }
  }

  /**
   * Muestra un error en la modal
   */
  showError(modalId, errorMessage) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'absolute top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeInUp z-50';
    errorDiv.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
        </svg>
        <span>${errorMessage}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
    `;

    modal.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorDiv.classList.add('animate-fadeOut');
      setTimeout(() => errorDiv.remove(), 200);
    }, 5000);
  }

  /**
   * Muestra un success message en la modal
   */
  showSuccess(modalId, successMessage) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const successDiv = document.createElement('div');
    successDiv.className = 'absolute top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeInUp z-50';
    successDiv.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
        <span>${successMessage}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
    `;

    modal.appendChild(successDiv);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      successDiv.classList.add('animate-fadeOut');
      setTimeout(() => successDiv.remove(), 200);
    }, 3000);
  }

  /**
   * Valida un formulario dentro de una modal
   */
  validateForm(formElement) {
    const errors = [];
    const inputs = formElement.querySelectorAll('input[required], textarea[required], select[required]');

    inputs.forEach(input => {
      if (!input.value.trim()) {
        errors.push({
          field: input.name || input.id,
          message: `${input.placeholder || 'Este campo'} es requerido`
        });
        input.classList.add('border-red-500');
      } else {
        input.classList.remove('border-red-500');
      }

      // Email validation
      if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
          errors.push({
            field: input.name || input.id,
            message: 'Email inválido'
          });
          input.classList.add('border-red-500');
        }
      }

      // URL validation
      if (input.type === 'url' && input.value) {
        try {
          new URL(input.value);
          input.classList.remove('border-red-500');
        } catch {
          errors.push({
            field: input.name || input.id,
            message: 'URL inválida'
          });
          input.classList.add('border-red-500');
        }
      }

      // Number validation
      if (input.type === 'number' && input.value) {
        const min = input.getAttribute('min');
        const max = input.getAttribute('max');
        const value = parseFloat(input.value);

        if (min && value < parseFloat(min)) {
          errors.push({
            field: input.name || input.id,
            message: `Valor mínimo: ${min}`
          });
          input.classList.add('border-red-500');
        }

        if (max && value > parseFloat(max)) {
          errors.push({
            field: input.name || input.id,
            message: `Valor máximo: ${max}`
          });
          input.classList.add('border-red-500');
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Muestra errores de validación en la modal
   */
  showValidationErrors(modalId, errors) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const errorContainer = document.createElement('div');
    errorContainer.className = 'absolute top-4 right-4 max-w-md bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 animate-fadeInUp z-50';
    errorContainer.innerHTML = `
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
        </svg>
        <div class="flex-1">
          <h4 class="font-bold text-red-800 dark:text-red-300 mb-2">Errores de validación:</h4>
          <ul class="text-sm text-red-700 dark:text-red-400 space-y-1">
            ${errors.map(err => `<li>• ${err.message}</li>`).join('')}
          </ul>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-red-600">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
    `;

    modal.appendChild(errorContainer);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorContainer.classList.add('animate-fadeOut');
      setTimeout(() => errorContainer.remove(), 200);
    }, 5000);
  }
}

// Crear instancia global
window.ModalManager = new ModalManager();

// Añadir animación fadeOut si no existe
if (!document.querySelector('style[data-modal-animations]')) {
  const style = document.createElement('style');
  style.setAttribute('data-modal-animations', 'true');
  style.textContent = `
    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }

    .animate-fadeOut {
      animation: fadeOut 0.2s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}

console.log('✅ Modal Manager System loaded');

export default ModalManager;
