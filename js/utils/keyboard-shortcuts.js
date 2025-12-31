/**
 * ⌨️ KEYBOARD SHORTCUTS SYSTEM
 * Sistema de atajos de teclado para power users
 */

class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.enabled = true;
    this.commandPaletteVisible = false;

    this.setupDefaultShortcuts();
    this.setupEventListeners();
  }

  /**
   * Setup default shortcuts
   */
  setupDefaultShortcuts() {
    // Global shortcuts
    this.register('Escape', () => this.closeTopModal(), 'Cerrar modal');
    this.register('/', () => this.focusSearch(), 'Buscar');
    this.register('?', () => this.toggleHelpModal(), 'Mostrar ayuda');
    this.register('k', () => this.toggleCommandPalette(), 'Command palette', { ctrl: true });

    // Navigation shortcuts
    this.register('h', () => this.goHome(), 'Ir a inicio', { alt: true });
    this.register('i', () => this.openItinerary(), 'Abrir itinerario', { alt: true });
    this.register('d', () => this.openDashboard(), 'Abrir dashboard', { alt: true });

    // Feature shortcuts
    this.register('1', () => this.openFeature('locationGame'), 'Location Game', { alt: true });
    this.register('2', () => this.openFeature('challengeSystem'), 'Challenges', { alt: true });
    this.register('3', () => this.openFeature('travelTwins'), 'Travel Twins', { alt: true });
    this.register('4', () => this.openFeature('hiddenGems'), 'Hidden Gems', { alt: true });

    // Utility shortcuts
    this.register('s', () => this.saveData(), 'Guardar', { ctrl: true });
    this.register('p', () => window.print(), 'Imprimir', { ctrl: true });
    this.register('f', () => this.toggleFullscreen(), 'Pantalla completa', { alt: true });
  }

  /**
   * Register a shortcut
   */
  register(key, callback, description = '', modifiers = {}) {
    const shortcutKey = this.getShortcutKey(key, modifiers);
    this.shortcuts.set(shortcutKey, {
      key,
      callback,
      description,
      modifiers
    });
  }

  /**
   * Unregister a shortcut
   */
  unregister(key, modifiers = {}) {
    const shortcutKey = this.getShortcutKey(key, modifiers);
    this.shortcuts.delete(shortcutKey);
  }

  /**
   * Get shortcut key with modifiers
   */
  getShortcutKey(key, modifiers) {
    const parts = [];
    if (modifiers.ctrl) parts.push('ctrl');
    if (modifiers.alt) parts.push('alt');
    if (modifiers.shift) parts.push('shift');
    if (modifiers.meta) parts.push('meta');
    parts.push(key.toLowerCase());
    return parts.join('+');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const activeElement = document.activeElement;
      if (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable) {
        // Allow Escape and Ctrl+K even in inputs
        if (e.key !== 'Escape' && !(e.ctrlKey && e.key === 'k')) {
          return;
        }
      }

      const shortcutKey = this.getShortcutKey(e.key, {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        meta: e.metaKey
      });

      const shortcut = this.shortcuts.get(shortcutKey);
      if (shortcut) {
        e.preventDefault();
        shortcut.callback();
      }
    });
  }

  /**
   * Close top modal
   */
  closeTopModal() {
    if (window.ModalManager && window.ModalManager.activeModals.size > 0) {
      const modals = Array.from(window.ModalManager.activeModals);
      const lastModal = modals[modals.length - 1];
      if (lastModal && lastModal.closeCallback) {
        lastModal.closeCallback();
      }
    }
  }

  /**
   * Focus search input
   */
  focusSearch() {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="Buscar"], input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  /**
   * Toggle help modal
   */
  toggleHelpModal() {
    if (document.getElementById('keyboardShortcutsHelp')) {
      if (window.ModalManager) {
        window.ModalManager.closeModal('keyboardShortcutsHelp');
      } else {
        document.getElementById('keyboardShortcutsHelp')?.remove();
      }
      return;
    }

    this.showHelpModal();
  }

  /**
   * Show help modal with all shortcuts
   */
  showHelpModal() {
    const groups = {
      'Navegación': [],
      'Features': [],
      'Utilidades': [],
      'Global': []
    };

    this.shortcuts.forEach((shortcut, key) => {
      const { modifiers, description } = shortcut;
      let group = 'Global';

      if (modifiers.alt && /^[hid]$/.test(shortcut.key)) group = 'Navegación';
      else if (modifiers.alt && /^[1234]$/.test(shortcut.key)) group = 'Features';
      else if (modifiers.ctrl) group = 'Utilidades';

      const keys = [];
      if (modifiers.ctrl) keys.push('<kbd>Ctrl</kbd>');
      if (modifiers.alt) keys.push('<kbd>Alt</kbd>');
      if (modifiers.shift) keys.push('<kbd>Shift</kbd>');
      keys.push(`<kbd>${shortcut.key}</kbd>`);

      groups[group].push({
        keys: keys.join(' + '),
        description
      });
    });

    const modalHTML = `
      <div id="keyboardShortcutsHelp" class="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeInUp">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">

          <!-- Header -->
          <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold mb-1">⌨️ Atajos de Teclado</h2>
                <p class="text-purple-100">Power user shortcuts</p>
              </div>
              <button onclick="window.KeyboardShortcuts.toggleHelpModal()"
                      class="text-white hover:bg-white/20 rounded-lg p-2 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            ${Object.entries(groups).map(([groupName, shortcuts]) => {
              if (shortcuts.length === 0) return '';
              return `
                <div class="mb-6">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">${groupName}</h3>
                  <div class="space-y-2">
                    ${shortcuts.map(s => `
                      <div class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span class="text-gray-700 dark:text-gray-300">${s.description}</span>
                        <div class="shortcut-keys">${s.keys}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add styles for kbd
    if (!document.getElementById('kbd-styles')) {
      const style = document.createElement('style');
      style.id = 'kbd-styles';
      style.textContent = `
        kbd {
          display: inline-block;
          padding: 3px 8px;
          font-family: monospace;
          font-size: 12px;
          line-height: 1;
          color: #333;
          background-color: #f7f7f7;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 1px 0 rgba(0,0,0,0.2), inset 0 0 0 2px #fff;
        }
        .dark kbd {
          color: #fff;
          background-color: #555;
          border-color: #777;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Toggle command palette
   */
  toggleCommandPalette() {
    if (this.commandPaletteVisible) {
      this.hideCommandPalette();
    } else {
      this.showCommandPalette();
    }
  }

  /**
   * Show command palette
   */
  showCommandPalette() {
    // TODO: Implement command palette (like VSCode Ctrl+K)
    window.Notifications?.show('⌨️ Command palette coming soon!', 'info');
    this.commandPaletteVisible = true;
  }

  /**
   * Hide command palette
   */
  hideCommandPalette() {
    this.commandPaletteVisible = false;
  }

  /**
   * Go home
   */
  goHome() {
    window.location.href = '/';
  }

  /**
   * Open itinerary
   */
  openItinerary() {
    if (window.ItineraryV3 && window.ItineraryV3.open) {
      window.ItineraryV3.open();
    }
  }

  /**
   * Open dashboard
   */
  openDashboard() {
    window.location.href = '/dashboard.html';
  }

  /**
   * Open feature by ID
   */
  openFeature(featureId) {
    const features = {
      locationGame: () => window.locationGame?.open(),
      challengeSystem: () => window.challengeSystem?.open(),
      travelTwins: () => window.TravelTwinsMatcher?.open(),
      hiddenGems: () => window.HiddenGemsMap?.open()
    };

    if (features[featureId]) {
      features[featureId]();
    }
  }

  /**
   * Save data
   */
  saveData() {
    // Trigger save in current context
    window.Notifications?.show('💾 Datos guardados automáticamente', 'success');
  }

  /**
   * Toggle fullscreen
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Enable shortcuts
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable shortcuts
   */
  disable() {
    this.enabled = false;
  }
}

// Create global instance
window.KeyboardShortcuts = new KeyboardShortcuts();

console.log('✅ Keyboard Shortcuts System loaded - Press ? for help');

export default KeyboardShortcuts;
