/**
 * 🎓 ONBOARDING SYSTEM
 * ====================
 *
 * Progressive disclosure and feature discovery
 *
 * FEATURES:
 * - Step-by-step tour
 * - Contextual hints
 * - Feature highlights
 * - Skip/complete tracking
 */

class OnboardingSystem {
  constructor() {
    this.currentStep = 0;
    this.completed = this.checkCompleted();

    // Onboarding steps
    this.steps = [
      {
        target: '#create-trip-btn',
        title: '¡Bienvenido a Japitin! 🇯🇵',
        content: 'Empieza creando tu primer viaje a Japón. Es gratis y fácil.',
        position: 'bottom'
      },
      {
        target: '#add-activity-btn',
        title: 'Agrega actividades ✨',
        content: 'Templos, restaurantes, parques... La IA te ayudará a encontrar lo mejor.',
        position: 'bottom'
      },
      {
        target: '#ai-chat-btn',
        title: 'Tu Asistente IA 🤖',
        content: 'Pregúntale lo que sea sobre tu viaje. Entiende TU estilo.',
        position: 'left'
      },
      {
        target: '#jr-pass-tab',
        title: 'JR Pass Calculator 🚄',
        content: '¿Te conviene? Calculamos si ahorras dinero automáticamente.',
        position: 'right'
      },
      {
        target: '#ramen-tab',
        title: 'Ramen Passport 🍜',
        content: 'Colecciona todos los ramens que pruebes. Feature exclusiva de Japitin.',
        position: 'right'
      }
    ];

    console.log('🎓 Onboarding System initialized');
  }

  /**
   * Start onboarding tour
   */
  start() {
    if (this.completed) {
      console.log('⏭️ Onboarding already completed');
      return;
    }

    this.currentStep = 0;
    this.showStep(this.currentStep);

    console.log('🎓 Onboarding started');
  }

  /**
   * Show specific step
   */
  showStep(stepIndex) {
    const step = this.steps[stepIndex];
    if (!step) {
      this.complete();
      return;
    }

    // Create tooltip
    const tooltip = this.createTooltip(step);

    // Position tooltip
    const target = document.querySelector(step.target);
    if (target) {
      this.positionTooltip(tooltip, target, step.position);
    }

    // Highlight target
    this.highlightElement(target);

    console.log(`📍 Step ${stepIndex + 1}/${this.steps.length}:`, step.title);
  }

  /**
   * Create tooltip element
   */
  createTooltip(step) {
    // Remove existing tooltip
    const existing = document.querySelector('.onboarding-tooltip');
    if (existing) existing.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'onboarding-tooltip';
    tooltip.innerHTML = `
      <div class="onboarding-tooltip__content">
        <h3 class="onboarding-tooltip__title">${step.title}</h3>
        <p class="onboarding-tooltip__text">${step.content}</p>
        <div class="onboarding-tooltip__actions">
          <button class="onboarding-tooltip__skip">Saltar</button>
          <button class="onboarding-tooltip__next">
            ${this.currentStep === this.steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
        <div class="onboarding-tooltip__progress">
          ${this.currentStep + 1} / ${this.steps.length}
        </div>
      </div>
    `;

    // Event listeners
    tooltip.querySelector('.onboarding-tooltip__skip').addEventListener('click', () => {
      this.skip();
    });

    tooltip.querySelector('.onboarding-tooltip__next').addEventListener('click', () => {
      this.next();
    });

    document.body.appendChild(tooltip);

    return tooltip;
  }

  /**
   * Position tooltip relative to target
   */
  positionTooltip(tooltip, target, position) {
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top, left;

    switch (position) {
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'top':
        top = rect.top - tooltipRect.height - 10;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left - tooltipRect.width - 10;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.right + 10;
        break;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  /**
   * Highlight target element
   */
  highlightElement(target) {
    // Remove previous highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });

    // Add new highlight
    if (target) {
      target.classList.add('onboarding-highlight');
    }
  }

  /**
   * Go to next step
   */
  next() {
    this.currentStep++;

    if (this.currentStep >= this.steps.length) {
      this.complete();
    } else {
      this.showStep(this.currentStep);
    }
  }

  /**
   * Skip onboarding
   */
  skip() {
    this.complete();
  }

  /**
   * Complete onboarding
   */
  complete() {
    // Remove tooltip and highlights
    const tooltip = document.querySelector('.onboarding-tooltip');
    if (tooltip) tooltip.remove();

    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });

    // Mark as completed
    localStorage.setItem('onboarding_completed', 'true');
    this.completed = true;

    console.log('✅ Onboarding completed');

    // Track completion
    if (window.Analytics) {
      window.Analytics.trackConversion('onboarding_completed');
    }
  }

  /**
   * Check if onboarding completed
   */
  checkCompleted() {
    return localStorage.getItem('onboarding_completed') === 'true';
  }

  /**
   * Reset onboarding (for testing)
   */
  reset() {
    localStorage.removeItem('onboarding_completed');
    this.completed = false;
    console.log('🔄 Onboarding reset');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.Onboarding = new OnboardingSystem();

  // Auto-start for new users
  window.addEventListener('load', () => {
    const isNewUser = !localStorage.getItem('onboarding_completed');

    if (isNewUser) {
      setTimeout(() => {
        window.Onboarding.start();
      }, 1000);
    }
  });

  console.log('🎓 Onboarding System loaded!');
}
