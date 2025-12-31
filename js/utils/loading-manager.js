/**
 * ⏳ LOADING MANAGER SYSTEM
 * Sistema centralizado de loading states
 */

class LoadingManager {
  constructor() {
    this.activeLoaders = new Map();
  }

  /**
   * Muestra loading en un elemento específico
   */
  show(elementId, options = {}) {
    const {
      message = 'Cargando...',
      type = 'spinner', // spinner, dots, pulse, skeleton
      overlay = true,
      size = 'md' // sm, md, lg
    } = options;

    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element ${elementId} not found`);
      return;
    }

    // Remove existing loader if any
    this.hide(elementId);

    const loader = document.createElement('div');
    loader.className = `loading-overlay ${overlay ? 'absolute' : 'relative'} inset-0 flex items-center justify-center z-50`;
    loader.id = `${elementId}-loader`;

    if (overlay) {
      loader.classList.add('bg-white/80', 'dark:bg-gray-900/80', 'backdrop-blur-sm');
    }

    loader.innerHTML = this.getLoaderHTML(type, message, size);

    if (overlay) {
      element.style.position = 'relative';
    }

    element.appendChild(loader);
    this.activeLoaders.set(elementId, loader);

    return loader;
  }

  /**
   * Oculta loading de un elemento
   */
  hide(elementId) {
    const loader = this.activeLoaders.get(elementId);
    if (loader) {
      loader.classList.add('animate-fadeOut');
      setTimeout(() => {
        loader.remove();
        this.activeLoaders.delete(elementId);
      }, 200);
    }
  }

  /**
   * Oculta todos los loaders
   */
  hideAll() {
    this.activeLoaders.forEach((loader, elementId) => {
      this.hide(elementId);
    });
  }

  /**
   * Obtiene el HTML del loader según el tipo
   */
  getLoaderHTML(type, message, size) {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    const loaderSize = sizeClasses[size] || sizeClasses.md;

    switch (type) {
      case 'spinner':
        return `
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 ${size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-16 w-16' : 'h-12 w-12'}"></div>
            ${message ? `<p class="mt-4 text-gray-700 dark:text-gray-300 ${loaderSize}">${message}</p>` : ''}
          </div>
        `;

      case 'dots':
        return `
          <div class="text-center">
            <div class="flex gap-2 justify-center mb-4">
              <div class="loading-dot bg-purple-600 ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}"></div>
              <div class="loading-dot bg-pink-600 ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}"></div>
              <div class="loading-dot bg-blue-600 ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}"></div>
            </div>
            ${message ? `<p class="text-gray-700 dark:text-gray-300 ${loaderSize}">${message}</p>` : ''}
          </div>
        `;

      case 'pulse':
        return `
          <div class="text-center">
            <div class="inline-block">
              <div class="pulse-glow ${size === 'sm' ? 'text-4xl' : size === 'lg' ? 'text-8xl' : 'text-6xl'}">⏳</div>
            </div>
            ${message ? `<p class="mt-4 text-gray-700 dark:text-gray-300 ${loaderSize}">${message}</p>` : ''}
          </div>
        `;

      case 'skeleton':
        return `
          <div class="space-y-4 w-full max-w-md">
            <div class="skeleton h-4 w-3/4"></div>
            <div class="skeleton h-4 w-full"></div>
            <div class="skeleton h-4 w-5/6"></div>
            ${message ? `<p class="text-center text-gray-700 dark:text-gray-300 ${loaderSize} mt-6">${message}</p>` : ''}
          </div>
        `;

      case 'progress':
        return `
          <div class="w-full max-w-md">
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-progress"></div>
            </div>
            ${message ? `<p class="text-center text-gray-700 dark:text-gray-300 ${loaderSize} mt-4">${message}</p>` : ''}
          </div>
        `;

      default:
        return this.getLoaderHTML('spinner', message, size);
    }
  }

  /**
   * Muestra loading en un botón
   */
  showButtonLoading(buttonElement, options = {}) {
    const {
      text = 'Cargando...',
      disabled = true
    } = options;

    if (!buttonElement) return;

    // Store original content
    if (!buttonElement.dataset.originalContent) {
      buttonElement.dataset.originalContent = buttonElement.innerHTML;
    }

    if (disabled) {
      buttonElement.disabled = true;
      buttonElement.classList.add('opacity-75', 'cursor-not-allowed');
    }

    buttonElement.innerHTML = `
      <span class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>${text}</span>
      </span>
    `;
  }

  /**
   * Oculta loading de un botón
   */
  hideButtonLoading(buttonElement) {
    if (!buttonElement) return;

    const originalContent = buttonElement.dataset.originalContent;
    if (originalContent) {
      buttonElement.innerHTML = originalContent;
      delete buttonElement.dataset.originalContent;
    }

    buttonElement.disabled = false;
    buttonElement.classList.remove('opacity-75', 'cursor-not-allowed');
  }

  /**
   * Muestra loading en toda la pantalla
   */
  showFullScreen(message = 'Cargando...') {
    const overlay = document.createElement('div');
    overlay.id = 'fullscreen-loader';
    overlay.className = 'fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999]';
    overlay.innerHTML = `
      <div class="text-center">
        <div class="flex gap-3 justify-center mb-6">
          <div class="loading-dot bg-purple-600 w-4 h-4"></div>
          <div class="loading-dot bg-pink-600 w-4 h-4"></div>
          <div class="loading-dot bg-blue-600 w-4 h-4"></div>
        </div>
        <p class="text-white text-xl font-medium">${message}</p>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    this.activeLoaders.set('fullscreen', overlay);
  }

  /**
   * Oculta loading de pantalla completa
   */
  hideFullScreen() {
    const overlay = this.activeLoaders.get('fullscreen');
    if (overlay) {
      overlay.classList.add('animate-fadeOut');
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
        this.activeLoaders.delete('fullscreen');
      }, 200);
    }
  }

  /**
   * Crea skeleton loader para cards
   */
  createSkeletonCard(count = 1) {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      skeletons.push(`
        <div class="glass-card rounded-xl p-6 space-y-4 animate-fadeInUp" style="animation-delay: ${i * 0.1}s">
          <div class="flex items-center gap-4">
            <div class="skeleton w-12 h-12 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="skeleton h-4 w-1/3"></div>
              <div class="skeleton h-3 w-1/2"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="skeleton h-3 w-full"></div>
            <div class="skeleton h-3 w-5/6"></div>
            <div class="skeleton h-3 w-4/6"></div>
          </div>
          <div class="flex gap-2">
            <div class="skeleton h-8 w-20 rounded-full"></div>
            <div class="skeleton h-8 w-20 rounded-full"></div>
          </div>
        </div>
      `);
    }
    return skeletons.join('');
  }

  /**
   * Muestra skeleton en un contenedor
   */
  showSkeleton(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = this.createSkeletonCard(count);
  }
}

// Añadir animación de progress si no existe
if (!document.querySelector('style[data-progress-animation]')) {
  const style = document.createElement('style');
  style.setAttribute('data-progress-animation', 'true');
  style.textContent = `
    @keyframes progress {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(400%);
      }
    }

    .animate-progress {
      animation: progress 1.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

// Crear instancia global
window.LoadingManager = new LoadingManager();

console.log('✅ Loading Manager System loaded');

export default LoadingManager;
