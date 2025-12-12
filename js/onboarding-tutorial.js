/**
 * 🎓 ONBOARDING TUTORIAL
 * ======================
 *
 * Tutorial interactivo para nuevos usuarios
 */

class OnboardingTutorial {
  constructor() {
    this.hasSeenTutorial = localStorage.getItem('hasSeenTutorial') === 'true';
    this.currentStep = 0;
    this.steps = [
      {
        title: '¡Bienvenido a Japitin! 🇯🇵',
        message: 'Tu asistente inteligente para planear el viaje perfecto a Japón',
        target: null,
        position: 'center'
      },
      {
        title: 'Empieza aquí 👆',
        message: 'Este botón abre TODAS las herramientas: optimizador de rutas, presupuesto, guía cultural, AI chat y más',
        target: '#main-fab-button',
        position: 'left'
      },
      {
        title: '11+ Features Inteligentes 🧠',
        message: 'Geo-optimización, ML predictions, chat AI, modo live cuando estés en Japón, y mucho más',
        target: '#main-fab-button',
        position: 'left'
      },
      {
        title: '¡Listo para empezar! ✨',
        message: 'Haz clic en el botón para explorar todas las herramientas',
        target: '#main-fab-button',
        position: 'left'
      }
    ];
  }

  /**
   * Mostrar tutorial si es primera vez
   */
  showIfFirstTime() {
    if (!this.hasSeenTutorial) {
      setTimeout(() => this.start(), 1000);
    }
  }

  /**
   * Iniciar tutorial
   */
  start() {
    this.currentStep = 0;
    this.showStep(0);
  }

  /**
   * Mostrar paso específico
   */
  showStep(index) {
    const step = this.steps[index];
    if (!step) return this.complete();

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.className = 'fixed inset-0 bg-black/70 z-[100000] transition-opacity';

    // Highlight del elemento target
    if (step.target) {
      const targetEl = document.querySelector(step.target);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const spotlight = document.createElement('div');
        spotlight.className = 'fixed rounded-full bg-transparent border-4 border-purple-500 z-[100001] animate-pulse';
        spotlight.style.cssText = `
          left: ${rect.left - 10}px;
          top: ${rect.top - 10}px;
          width: ${rect.width + 20}px;
          height: ${rect.height + 20}px;
          pointer-events: none;
        `;
        document.body.appendChild(spotlight);

        // Guardar referencia para limpiar después
        this.spotlight = spotlight;
      }
    }

    // Crear tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'onboarding-tooltip';
    tooltip.className = 'fixed z-[100002] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md';

    // Posicionar tooltip
    if (step.position === 'center') {
      tooltip.style.cssText = 'left: 50%; top: 50%; transform: translate(-50%, -50%);';
    } else if (step.position === 'left' && step.target) {
      const targetEl = document.querySelector(step.target);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        tooltip.style.cssText = `
          right: ${window.innerWidth - rect.left + 30}px;
          top: ${rect.top}px;
        `;
      }
    }

    tooltip.innerHTML = `
      <div class="mb-4">
        <h3 class="text-2xl font-bold mb-2">${step.title}</h3>
        <p class="text-gray-600 dark:text-gray-300">${step.message}</p>
      </div>
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Paso ${index + 1} de ${this.steps.length}
        </div>
        <div class="flex gap-2">
          ${index > 0 ? '<button id="onboarding-skip" class="px-4 py-2 text-gray-600 hover:text-gray-800">Saltar</button>' : ''}
          <button id="onboarding-next" class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition">
            ${index < this.steps.length - 1 ? 'Siguiente' : 'Comenzar'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(tooltip);

    // Event listeners
    document.getElementById('onboarding-next')?.addEventListener('click', () => {
      this.cleanup();
      this.currentStep++;
      this.showStep(this.currentStep);
    });

    document.getElementById('onboarding-skip')?.addEventListener('click', () => {
      this.complete();
    });

    overlay.addEventListener('click', () => {
      // Allow clicking outside to close only on last step
      if (index === this.steps.length - 1) {
        this.complete();
      }
    });
  }

  /**
   * Limpiar elementos del tutorial
   */
  cleanup() {
    document.getElementById('onboarding-overlay')?.remove();
    document.getElementById('onboarding-tooltip')?.remove();
    if (this.spotlight) {
      this.spotlight.remove();
      this.spotlight = null;
    }
  }

  /**
   * Completar tutorial
   */
  complete() {
    this.cleanup();
    localStorage.setItem('hasSeenTutorial', 'true');
    this.hasSeenTutorial = true;

    // Mostrar toast de bienvenida
    if (window.showToast) {
      window.showToast('¡Bienvenido a Japitin! 🎉', 'success');
    }
  }

  /**
   * Resetear tutorial (para testing)
   */
  reset() {
    localStorage.removeItem('hasSeenTutorial');
    this.hasSeenTutorial = false;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.OnboardingTutorial = new OnboardingTutorial();
  console.log('🎓 Onboarding Tutorial loaded!');
}
