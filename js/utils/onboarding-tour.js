/**
 * 🎯 ONBOARDING TOUR SYSTEM
 * Sistema de tour guiado para nuevos usuarios con tooltips interactivos
 */

class OnboardingTour {
  constructor() {
    this.currentStep = 0;
    this.isActive = false;
    this.hasSeenTour = this.checkIfSeenTour();
    this.overlay = null;
    this.tooltip = null;

    // Tour steps para dashboard
    this.dashboardSteps = [
      {
        target: '#itinerary-section, [data-tour="itinerary"]',
        title: '📅 Tu Itinerario',
        description: 'Aquí planificas día a día tu viaje. Puedes agregar lugares, horarios, y notas.',
        position: 'bottom',
        highlightPadding: 20,
        action: 'Empezar tour'
      },
      {
        target: '#budget-section, [data-tour="budget"]',
        title: '💰 Control de Gastos',
        description: 'Trackea todos tus gastos en tiempo real. Ver categorías, límites, y exportar reportes.',
        position: 'bottom',
        highlightPadding: 15
      },
      {
        target: '[data-feature="locationGame"], .viral-features',
        title: '🎮 Features Virales',
        description: 'Descubre 7 features sociales: juegos, challenges, travel twins, hidden gems y más!',
        position: 'left',
        highlightPadding: 15
      },
      {
        target: '#map-section, [data-tour="map"]',
        title: '🗺️ Mapa Interactivo',
        description: 'Visualiza todas tus ubicaciones en el mapa. Conecta con otros viajeros.',
        position: 'top',
        highlightPadding: 10
      },
      {
        target: '[data-tour="shortcuts"], .keyboard-shortcuts-trigger',
        title: '⌨️ Atajos de Teclado',
        description: 'Presiona ? para ver todos los shortcuts. Ctrl+K para command palette.',
        position: 'left',
        highlightPadding: 10
      }
    ];

    this.setupEventListeners();
  }

  /**
   * Check if user has seen tour
   */
  checkIfSeenTour() {
    return localStorage.getItem('japitin_tour_completed') === 'true';
  }

  /**
   * Mark tour as completed
   */
  markTourCompleted() {
    localStorage.setItem('japitin_tour_completed', 'true');
    localStorage.setItem('japitin_tour_completed_date', new Date().toISOString());
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Auto-start tour for new users after 2 seconds
    if (!this.hasSeenTour) {
      setTimeout(() => {
        this.showWelcomeModal();
      }, 2000);
    }

    // Keyboard shortcut to restart tour (Shift+?)
    document.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        this.start();
      }
    });
  }

  /**
   * Show welcome modal
   */
  showWelcomeModal() {
    const modal = document.createElement('div');
    modal.id = 'welcomeModal';
    modal.className = 'fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeInUp';

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">

        <!-- Hero -->
        <div class="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-8 text-center text-white relative overflow-hidden">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div class="relative z-10">
            <div class="text-7xl mb-4 animate-float">🇯🇵</div>
            <h1 class="text-4xl font-bold mb-2">¡Bienvenida a Japitin!</h1>
            <p class="text-lg text-white/90">Tu compañero perfecto para viajar a Japón</p>
          </div>
        </div>

        <!-- Content -->
        <div class="p-8">
          <div class="space-y-4 mb-6">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span class="text-xl">📅</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-1">Planifica tu itinerario</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Día a día, con horarios, mapas, y notas</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <span class="text-xl">💰</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-1">Controla tus gastos</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Track en tiempo real con presupuesto inteligente</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span class="text-xl">🎮</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-1">Features virales</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Juegos, challenges, social, y mucho más</p>
              </div>
            </div>
          </div>

          <div class="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
            <div class="flex items-center gap-2 text-purple-800 dark:text-purple-300 mb-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span class="font-semibold">¿Primera vez?</span>
            </div>
            <p class="text-sm text-purple-700 dark:text-purple-400">
              Te recomendamos hacer el tour guiado (2 min) para conocer todas las features.
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button onclick="window.OnboardingTour.start()"
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">
              🚀 Empezar Tour
            </button>
            <button onclick="window.OnboardingTour.skipTour()"
                    class="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl transition-all">
              Saltar
            </button>
          </div>

          <p class="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Puedes reiniciar el tour cuando quieras con Shift+?
          </p>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Skip tour
   */
  skipTour() {
    this.markTourCompleted();
    document.getElementById('welcomeModal')?.remove();
    window.Notifications?.show('👋 ¡Bienvenida! Explora a tu ritmo. Presiona Shift+? para ver el tour.', 'info');
  }

  /**
   * Start tour
   */
  start() {
    // Close welcome modal if open
    document.getElementById('welcomeModal')?.remove();

    this.currentStep = 0;
    this.isActive = true;
    this.createOverlay();
    this.showStep(0);
  }

  /**
   * Create overlay
   */
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'tourOverlay';
    this.overlay.className = 'fixed inset-0 z-[9998] pointer-events-none';
    this.overlay.style.background = 'rgba(0, 0, 0, 0.7)';
    this.overlay.style.transition = 'opacity 0.3s';
    document.body.appendChild(this.overlay);
  }

  /**
   * Show step
   */
  showStep(stepIndex) {
    if (stepIndex >= this.dashboardSteps.length) {
      this.complete();
      return;
    }

    const step = this.dashboardSteps[stepIndex];
    this.currentStep = stepIndex;

    // Find target element
    const targetSelectors = step.target.split(',').map(s => s.trim());
    let targetElement = null;

    for (const selector of targetSelectors) {
      targetElement = document.querySelector(selector);
      if (targetElement) break;
    }

    if (!targetElement) {
      console.warn(`Tour target not found: ${step.target}, skipping to next step`);
      this.next();
      return;
    }

    // Highlight element
    this.highlightElement(targetElement, step.highlightPadding || 10);

    // Show tooltip
    this.showTooltip(targetElement, step);
  }

  /**
   * Highlight element
   */
  highlightElement(element, padding) {
    const rect = element.getBoundingClientRect();

    // Create spotlight effect
    const spotlight = document.createElement('div');
    spotlight.id = 'tourSpotlight';
    spotlight.className = 'fixed z-[9999] pointer-events-none';
    spotlight.style.cssText = `
      top: ${rect.top - padding}px;
      left: ${rect.left - padding}px;
      width: ${rect.width + padding * 2}px;
      height: ${rect.height + padding * 2}px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Remove existing spotlight
    document.getElementById('tourSpotlight')?.remove();
    document.body.appendChild(spotlight);

    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Show tooltip
   */
  showTooltip(targetElement, step) {
    const rect = targetElement.getBoundingClientRect();

    // Remove existing tooltip
    document.getElementById('tourTooltip')?.remove();

    const tooltip = document.createElement('div');
    tooltip.id = 'tourTooltip';
    tooltip.className = 'fixed z-[10000] animate-fadeInUp';

    const totalSteps = this.dashboardSteps.length;
    const isFirstStep = this.currentStep === 0;
    const isLastStep = this.currentStep === totalSteps - 1;

    tooltip.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm border-2 border-purple-500">

        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white rounded-t-lg">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-bold">${step.title}</h3>
            <span class="text-xs bg-white/20 px-2 py-1 rounded-full">
              ${this.currentStep + 1}/${totalSteps}
            </span>
          </div>
          <p class="text-sm text-white/90">${step.description}</p>
        </div>

        <!-- Progress -->
        <div class="h-1 bg-gray-200 dark:bg-gray-700">
          <div class="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
               style="width: ${((this.currentStep + 1) / totalSteps) * 100}%"></div>
        </div>

        <!-- Actions -->
        <div class="p-4 flex items-center justify-between gap-3">
          <button onclick="window.OnboardingTour.skip()"
                  class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium">
            Saltar tour
          </button>

          <div class="flex gap-2">
            ${!isFirstStep ? `
              <button onclick="window.OnboardingTour.previous()"
                      class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition">
                ← Atrás
              </button>
            ` : ''}

            <button onclick="window.OnboardingTour.next()"
                    class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition shadow-lg">
              ${isLastStep ? '✓ Finalizar' : step.action || 'Siguiente →'}
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(tooltip);

    // Position tooltip
    this.positionTooltip(tooltip, targetElement, step.position || 'bottom');
  }

  /**
   * Position tooltip
   */
  positionTooltip(tooltip, targetElement, position) {
    const rect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const gap = 20;

    let top, left;

    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - gap;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.right + gap;
        break;
      default:
        top = rect.bottom + gap;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    }

    // Keep tooltip in viewport
    const padding = 20;
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  /**
   * Next step
   */
  next() {
    this.showStep(this.currentStep + 1);
  }

  /**
   * Previous step
   */
  previous() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  /**
   * Skip tour
   */
  skip() {
    this.cleanup();
    window.Notifications?.show('Tour cancelado. Presiona Shift+? para reiniciar.', 'info');
  }

  /**
   * Complete tour
   */
  complete() {
    this.markTourCompleted();
    this.cleanup();

    // Show completion message
    const confetti = '🎉';
    window.Notifications?.show(`${confetti} ¡Tour completado! Ya conoces Japitin. ¡A planificar tu viaje!`, 'success');
  }

  /**
   * Cleanup tour elements
   */
  cleanup() {
    this.isActive = false;
    document.getElementById('tourOverlay')?.remove();
    document.getElementById('tourSpotlight')?.remove();
    document.getElementById('tourTooltip')?.remove();
  }

  /**
   * Reset tour (for testing)
   */
  reset() {
    localStorage.removeItem('japitin_tour_completed');
    localStorage.removeItem('japitin_tour_completed_date');
    this.hasSeenTour = false;
    window.Notifications?.show('Tour reseteado. Recarga la página para verlo de nuevo.', 'success');
  }
}

// Create global instance
window.OnboardingTour = new OnboardingTour();

console.log('✅ Onboarding Tour System loaded - Shift+? to restart tour');

export default OnboardingTour;
