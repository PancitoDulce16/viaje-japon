/**
 * ♿ ACCESSIBILITY MANAGER
 * Sistema completo de accesibilidad (A11y) para WCAG 2.1 AA compliance
 */

class AccessibilityManager {
  constructor() {
    this.settings = {
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      screenReader: false,
      keyboardNav: true,
      focusIndicators: true
    };

    this.init();
  }

  /**
   * Initialize accessibility features
   */
  init() {
    this.loadSettings();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.detectPreferences();
    this.applySettings();
    this.createAccessibilityPanel();
  }

  /**
   * Load saved settings
   */
  loadSettings() {
    const saved = localStorage.getItem('japitin_a11y_settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  /**
   * Save settings
   */
  saveSettings() {
    localStorage.setItem('japitin_a11y_settings', JSON.stringify(this.settings));
  }

  /**
   * Detect system preferences
   */
  detectPreferences() {
    // Detect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.settings.reduceMotion = true;
    }

    // Detect high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.settings.highContrast = true;
    }

    // Detect screen reader (basic detection)
    this.settings.screenReader = this.detectScreenReader();
  }

  /**
   * Basic screen reader detection
   */
  detectScreenReader() {
    // Check for common screen reader indicators
    return !!(
      navigator.userAgent.match(/\b(JAWS|NVDA|VoiceOver|TalkBack)\b/i) ||
      document.querySelector('[aria-live]')
    );
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    // Tab trap for modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const modal = document.querySelector('[role="dialog"]:not(.hidden)');
        if (modal) {
          this.trapFocus(e, modal);
        }
      }
    });

    // Skip to main content
    this.addSkipLink();

    // Arrow key navigation for lists
    this.setupArrowKeyNavigation();
  }

  /**
   * Add skip to main content link
   */
  addSkipLink() {
    if (document.getElementById('skipLink')) return;

    const skipLink = document.createElement('a');
    skipLink.id = 'skipLink';
    skipLink.href = '#main-content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg';
    skipLink.textContent = 'Saltar al contenido principal';

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * Setup arrow key navigation
   */
  setupArrowKeyNavigation() {
    document.addEventListener('keydown', (e) => {
      const activeElement = document.activeElement;

      // Handle arrow keys in lists
      if (activeElement.matches('[role="listitem"], [role="option"], [role="tab"]')) {
        const parent = activeElement.closest('[role="list"], [role="listbox"], [role="tablist"]');
        if (!parent) return;

        const items = Array.from(parent.querySelectorAll('[role="listitem"], [role="option"], [role="tab"]'));
        const currentIndex = items.indexOf(activeElement);

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex].focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex].focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          items[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          items[items.length - 1].focus();
        }
      }
    });
  }

  /**
   * Trap focus within element (for modals)
   */
  trapFocus(event, element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Remember last focused element before modal
    this.lastFocusedElement = null;

    // Observe modal creation
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node.matches('[role="dialog"]') || node.classList?.contains('modal'))) {
            this.lastFocusedElement = document.activeElement;
            this.focusFirstElement(node);
          }
        });

        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node.matches('[role="dialog"]') || node.classList?.contains('modal'))) {
            if (this.lastFocusedElement) {
              this.lastFocusedElement.focus();
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Focus first focusable element
   */
  focusFirstElement(container) {
    const focusable = container.querySelector(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusable) {
      setTimeout(() => focusable.focus(), 100);
    }
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Create live region for announcements
    if (!document.getElementById('ariaLive')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'ariaLive';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    // Create assertive live region for errors
    if (!document.getElementById('ariaLiveAssertive')) {
      const assertiveRegion = document.createElement('div');
      assertiveRegion.id = 'ariaLiveAssertive';
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.className = 'sr-only';
      document.body.appendChild(assertiveRegion);
    }
  }

  /**
   * Announce to screen reader
   */
  announce(message, assertive = false) {
    const regionId = assertive ? 'ariaLiveAssertive' : 'ariaLive';
    const region = document.getElementById(regionId);

    if (region) {
      // Clear first
      region.textContent = '';

      // Then announce
      setTimeout(() => {
        region.textContent = message;
      }, 100);

      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 3000);
    }
  }

  /**
   * Apply accessibility settings
   */
  applySettings() {
    const root = document.documentElement;

    // High contrast mode
    if (this.settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (this.settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduce motion
    if (this.settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Focus indicators
    if (!this.settings.focusIndicators) {
      root.classList.add('no-focus-indicators');
    } else {
      root.classList.remove('no-focus-indicators');
    }

    this.saveSettings();
  }

  /**
   * Toggle setting
   */
  toggleSetting(setting) {
    this.settings[setting] = !this.settings[setting];
    this.applySettings();

    // Announce change
    const settingNames = {
      highContrast: 'Alto contraste',
      largeText: 'Texto grande',
      reduceMotion: 'Reducir animaciones',
      screenReader: 'Lector de pantalla',
      focusIndicators: 'Indicadores de foco'
    };

    const status = this.settings[setting] ? 'activado' : 'desactivado';
    this.announce(`${settingNames[setting]} ${status}`);
  }

  /**
   * Create accessibility panel
   */
  createAccessibilityPanel() {
    // Add keyboard shortcut Alt+A to open panel
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        this.showPanel();
      }
    });

    // Add button to dashboard
    this.addAccessibilityButton();
  }

  /**
   * Add accessibility button to page
   */
  addAccessibilityButton() {
    if (document.getElementById('a11yButton')) return;

    const button = document.createElement('button');
    button.id = 'a11yButton';
    button.className = 'fixed bottom-4 left-4 z-[9998] w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110';
    button.setAttribute('aria-label', 'Abrir panel de accesibilidad');
    button.setAttribute('title', 'Accesibilidad (Alt+A)');

    button.innerHTML = `
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    `;

    button.onclick = () => this.showPanel();
    document.body.appendChild(button);
  }

  /**
   * Show accessibility panel
   */
  showPanel() {
    if (document.getElementById('a11yPanel')) {
      this.hidePanel();
      return;
    }

    const panel = document.createElement('div');
    panel.id = 'a11yPanel';
    panel.className = 'fixed bottom-20 left-4 z-[9999] bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-80 border-2 border-purple-500 animate-fadeInUp';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Panel de accesibilidad');

    panel.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">♿ Accesibilidad</h3>
        <button onclick="window.AccessibilityManager.hidePanel()"
                class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Cerrar panel">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="space-y-3">
        ${this.renderToggle('highContrast', '🎨 Alto Contraste', 'Mejora la legibilidad con colores de alto contraste')}
        ${this.renderToggle('largeText', '📝 Texto Grande', 'Aumenta el tamaño de todo el texto')}
        ${this.renderToggle('reduceMotion', '🎬 Reducir Animaciones', 'Desactiva animaciones y transiciones')}
        ${this.renderToggle('focusIndicators', '🎯 Indicadores de Foco', 'Muestra indicadores visuales al navegar con teclado')}
      </div>

      <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">⌨️ Atajos de Teclado</h4>
        <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <kbd>Alt+A</kbd> - Abrir este panel</li>
          <li>• <kbd>Tab</kbd> - Navegar elementos</li>
          <li>• <kbd>Esc</kbd> - Cerrar modales</li>
          <li>• <kbd>?</kbd> - Ver todos los atajos</li>
        </ul>
      </div>
    `;

    document.body.appendChild(panel);
    this.announce('Panel de accesibilidad abierto');
  }

  /**
   * Render toggle switch
   */
  renderToggle(setting, label, description) {
    const isEnabled = this.settings[setting];

    return `
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex-1 mr-3">
          <div class="font-medium text-gray-900 dark:text-white text-sm">${label}</div>
          <div class="text-xs text-gray-600 dark:text-gray-400">${description}</div>
        </div>
        <button onclick="window.AccessibilityManager.toggleSetting('${setting}')"
                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}"
                role="switch"
                aria-checked="${isEnabled}"
                aria-label="Alternar ${label}">
          <span class="inline-block w-4 h-4 transform transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'} bg-white rounded-full"></span>
        </button>
      </div>
    `;
  }

  /**
   * Hide accessibility panel
   */
  hidePanel() {
    const panel = document.getElementById('a11yPanel');
    if (panel) {
      panel.remove();
      this.announce('Panel de accesibilidad cerrado');
    }
  }

  /**
   * Check contrast ratio
   */
  checkContrast(foreground, background) {
    const luminance = (color) => {
      const rgb = parseInt(color.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;

      const sRGB = [r, g, b].map(val => {
        val /= 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const l1 = luminance(foreground);
    const l2 = luminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio: ratio.toFixed(2),
      AA: ratio >= 4.5,
      AAA: ratio >= 7,
      AALarge: ratio >= 3,
      AAALarge: ratio >= 4.5
    };
  }
}

// Add CSS for accessibility features
const style = document.createElement('style');
style.textContent = `
  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .sr-only:focus {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }

  /* High contrast mode */
  .high-contrast {
    filter: contrast(1.5);
  }

  .high-contrast * {
    border-width: 2px !important;
  }

  /* Large text */
  .large-text {
    font-size: 120% !important;
  }

  .large-text * {
    line-height: 1.6 !important;
  }

  /* Reduce motion */
  .reduce-motion *,
  .reduce-motion *::before,
  .reduce-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* No focus indicators (not recommended but available) */
  .no-focus-indicators *:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  /* Keyboard styles */
  kbd {
    display: inline-block;
    padding: 2px 6px;
    font-family: monospace;
    font-size: 0.875em;
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 4px;
  }

  .dark kbd {
    background-color: #374151;
    border-color: #4b5563;
  }
`;
document.head.appendChild(style);

// Create global instance
window.AccessibilityManager = new AccessibilityManager();

console.log('✅ Accessibility Manager loaded - Press Alt+A for accessibility panel');

export default AccessibilityManager;
