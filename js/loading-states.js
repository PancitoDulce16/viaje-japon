/**
 * 🔄 LOADING STATES & SKELETON SCREENS
 * =====================================
 *
 * Sistema unificado de estados de carga
 * IMPROVED.md Priority #3
 */

class LoadingStates {
  constructor() {
    this.activeLoaders = new Set();
  }

  /**
   * Mostrar loading overlay con mensaje
   */
  show(message = 'Cargando...', emoji = '⏳') {
    const loaderId = `loader-${Date.now()}`;

    const overlay = document.createElement('div');
    overlay.id = loaderId;
    overlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] backdrop-blur-sm';
    overlay.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center text-3xl">
            ${emoji}
          </div>
        </div>
        <p class="text-lg font-semibold text-gray-900 dark:text-white text-center">${message}</p>
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeLoaders.add(loaderId);

    return loaderId;
  }

  /**
   * Ocultar loading específico
   */
  hide(loaderId) {
    const loader = document.getElementById(loaderId);
    if (loader) {
      loader.classList.add('opacity-0');
      setTimeout(() => {
        loader.remove();
        this.activeLoaders.delete(loaderId);
      }, 300);
    }
  }

  /**
   * Ocultar todos los loaders
   */
  hideAll() {
    this.activeLoaders.forEach(id => this.hide(id));
  }

  /**
   * Mostrar spinner inline
   */
  createSpinner(size = 'md') {
    const sizes = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-3',
      lg: 'w-12 h-12 border-4'
    };

    const spinner = document.createElement('div');
    spinner.className = `${sizes[size]} border-purple-200 border-t-purple-600 rounded-full animate-spin inline-block`;
    return spinner;
  }

  /**
   * Skeleton screen para cards
   */
  createSkeleton(type = 'card') {
    const templates = {
      card: `
        <div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl p-6">
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
          <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
      `,
      list: `
        <div class="animate-pulse space-y-3">
          ${Array(5).fill().map(() => `
            <div class="flex items-center gap-3 bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
              <div class="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          `).join('')}
        </div>
      `,
      text: `
        <div class="animate-pulse space-y-2">
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
        </div>
      `
    };

    const skeleton = document.createElement('div');
    skeleton.innerHTML = templates[type] || templates.card;
    return skeleton.firstElementChild;
  }

  /**
   * Progress bar para operaciones largas
   */
  createProgressBar(message = '') {
    const progressId = `progress-${Date.now()}`;

    const container = document.createElement('div');
    container.id = progressId;
    container.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 z-[100000]';
    container.innerHTML = `
      <p class="text-sm font-semibold mb-2 text-gray-900 dark:text-white">${message}</p>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-300" style="width: 0%"></div>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">0%</p>
    `;

    document.body.appendChild(container);

    return {
      id: progressId,
      update: (percent) => {
        const bar = container.querySelector('div > div');
        const text = container.querySelector('p.text-xs');
        if (bar) bar.style.width = `${percent}%`;
        if (text) text.textContent = `${Math.round(percent)}%`;
      },
      complete: () => {
        const bar = container.querySelector('div > div');
        const text = container.querySelector('p.text-xs');
        if (bar) bar.style.width = '100%';
        if (text) text.textContent = '¡Completado! ✅';
        setTimeout(() => container.remove(), 2000);
      },
      remove: () => container.remove()
    };
  }

  /**
   * Typing indicator para chat/AI
   */
  createTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'flex items-center gap-2 text-gray-500';
    indicator.innerHTML = `
      <span class="text-sm">Escribiendo</span>
      <div class="flex gap-1">
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
      </div>
    `;
    return indicator;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.LoadingStates = new LoadingStates();
  console.log('🔄 Loading States loaded!');
}
