/**
 * Keyboard Shortcuts System
 *
 * Provides keyboard shortcuts for power users and a command palette (Ctrl+K / Cmd+K).
 *
 * Features:
 * - Command palette for quick navigation
 * - Global keyboard shortcuts
 * - Visual hints for available shortcuts
 * - Cross-platform support (Windows/Mac)
 */

const KeyboardShortcuts = {
  isCommandPaletteOpen: false,
  isMac: navigator.platform.toUpperCase().indexOf('MAC') >= 0,

  /**
   * Initializes the keyboard shortcuts system
   */
  init() {
    console.log('⌨️ Initializing Keyboard Shortcuts System...');

    // Register global keyboard event listener
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));

    // Create command palette modal
    this.createCommandPalette();

    console.log('✅ Keyboard Shortcuts System initialized');
  },

  /**
   * Handles all keyboard shortcuts
   */
  handleKeyPress(e) {
    const key = e.key.toLowerCase();
    const ctrl = this.isMac ? e.metaKey : e.ctrlKey;
    const shift = e.shiftKey;
    const alt = e.altKey;

    // Command Palette: Ctrl+K or Cmd+K
    if (ctrl && key === 'k') {
      e.preventDefault();
      this.toggleCommandPalette();
      return;
    }

    // Close command palette with Escape
    if (this.isCommandPaletteOpen && key === 'escape') {
      e.preventDefault();
      this.toggleCommandPalette();
      return;
    }

    // Don't trigger shortcuts if user is typing in an input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    // Global Navigation Shortcuts
    if (ctrl) {
      switch (key) {
        case 'h': // Ctrl+H: Go to Home
          e.preventDefault();
          window.location.href = '/dashboard.html';
          break;

        case 'i': // Ctrl+I: Go to Itinerary
          e.preventDefault();
          this.switchTab('itinerary');
          break;

        case 'e': // Ctrl+E: Go to Expenses
          e.preventDefault();
          this.switchTab('expenses');
          break;

        case 'm': // Ctrl+M: Go to Map
          e.preventDefault();
          this.switchTab('map');
          break;

        case 'n': // Ctrl+N: New Activity (only in itinerary)
          e.preventDefault();
          if (window.location.pathname.includes('dashboard')) {
            this.switchTab('itinerary');
            setTimeout(() => {
              const addBtn = document.querySelector('[onclick*="addActivity"]');
              if (addBtn) addBtn.click();
            }, 500);
          }
          break;

        case 's': // Ctrl+S: Save (prevent default browser save)
          e.preventDefault();
          window.Notifications?.show('✅ Los cambios se guardan automáticamente', 'success');
          break;

        case 'g': // Ctrl+G: Open Smart Generator
          e.preventDefault();
          if (window.SmartGeneratorWizard) {
            window.SmartGeneratorWizard.open();
          }
          break;
      }
    }

    // Single-key shortcuts (no modifiers)
    if (!ctrl && !shift && !alt) {
      switch (key) {
        case '?': // ?: Show keyboard shortcuts help
          e.preventDefault();
          this.showShortcutsHelp();
          break;

        case 'a': // A: Add Activity (only in itinerary tab)
          if (document.querySelector('.tab-button[data-tab="itinerary"]')?.classList.contains('active')) {
            e.preventDefault();
            const addBtn = document.querySelector('[onclick*="addActivity"]');
            if (addBtn) addBtn.click();
          }
          break;

        case 'd': // D: Toggle Dark Mode
          e.preventDefault();
          if (window.toggleDarkMode) {
            window.toggleDarkMode();
          }
          break;
      }
    }
  },

  /**
   * Switches to a specific tab
   */
  switchTab(tabName) {
    const tabButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    if (tabButton) {
      tabButton.click();
      window.Notifications?.show(`📍 Navegando a: ${this.capitalizeFirst(tabName)}`, 'info');
    }
  },

  /**
   * Toggles the command palette
   */
  toggleCommandPalette() {
    const palette = document.getElementById('commandPalette');
    if (!palette) return;

    this.isCommandPaletteOpen = !this.isCommandPaletteOpen;

    if (this.isCommandPaletteOpen) {
      palette.classList.remove('hidden');
      setTimeout(() => {
        const searchInput = document.getElementById('commandPaletteSearch');
        if (searchInput) searchInput.focus();
      }, 100);
    } else {
      palette.classList.add('hidden');
      const searchInput = document.getElementById('commandPaletteSearch');
      if (searchInput) searchInput.value = '';
      this.renderCommandList();
    }
  },

  /**
   * Creates the command palette modal
   */
  createCommandPalette() {
    const paletteHTML = `
      <div id="commandPalette" class="hidden fixed inset-0 z-[9999] flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm" onclick="if(event.target.id === 'commandPalette') KeyboardShortcuts.toggleCommandPalette()">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden" onclick="event.stopPropagation()">
          <!-- Search Input -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="relative">
              <input
                type="text"
                id="commandPaletteSearch"
                placeholder="Buscar comando o acción..."
                oninput="KeyboardShortcuts.filterCommands(this.value)"
                class="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                ESC para cerrar
              </span>
            </div>
          </div>

          <!-- Command List -->
          <div id="commandList" class="max-h-96 overflow-y-auto">
            ${this.renderCommandList()}
          </div>

          <!-- Footer -->
          <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center">
            <p class="text-xs text-gray-500">
              Tip: Presiona <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">?</kbd> para ver todos los atajos
            </p>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', paletteHTML);
  },

  /**
   * Renders the list of available commands
   */
  renderCommandList(filter = '') {
    const commands = this.getCommands();
    const filtered = filter
      ? commands.filter(cmd =>
          cmd.name.toLowerCase().includes(filter.toLowerCase()) ||
          cmd.description.toLowerCase().includes(filter.toLowerCase())
        )
      : commands;

    if (filtered.length === 0) {
      return `
        <div class="p-8 text-center text-gray-500">
          <p class="text-2xl mb-2">🔍</p>
          <p>No se encontraron comandos</p>
        </div>
      `;
    }

    return filtered.map(cmd => `
      <div
        onclick="KeyboardShortcuts.executeCommand('${cmd.action}')"
        class="flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition border-b border-gray-100 dark:border-gray-700 last:border-b-0"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl">${cmd.icon}</span>
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">${cmd.name}</p>
            <p class="text-xs text-gray-500">${cmd.description}</p>
          </div>
        </div>
        <kbd class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-300">
          ${this.formatShortcut(cmd.shortcut)}
        </kbd>
      </div>
    `).join('');
  },

  /**
   * Filters commands based on search input
   */
  filterCommands(query) {
    const commandList = document.getElementById('commandList');
    if (commandList) {
      commandList.innerHTML = this.renderCommandList(query);
    }
  },

  /**
   * Executes a command from the palette
   */
  executeCommand(action) {
    this.toggleCommandPalette();

    switch (action) {
      case 'home':
        window.location.href = '/dashboard.html';
        break;
      case 'itinerary':
        this.switchTab('itinerary');
        break;
      case 'expenses':
        this.switchTab('expenses');
        break;
      case 'map':
        this.switchTab('map');
        break;
      case 'attractions':
        this.switchTab('attractions');
        break;
      case 'smartGenerator':
        if (window.SmartGeneratorWizard) {
          window.SmartGeneratorWizard.open();
        }
        break;
      case 'newActivity':
        this.switchTab('itinerary');
        setTimeout(() => {
          const addBtn = document.querySelector('[onclick*="addActivity"]');
          if (addBtn) addBtn.click();
        }, 500);
        break;
      case 'darkMode':
        if (window.toggleDarkMode) {
          window.toggleDarkMode();
        }
        break;
      case 'help':
        this.showShortcutsHelp();
        break;
    }
  },

  /**
   * Gets the list of all available commands
   */
  getCommands() {
    return [
      {
        name: 'Ir a Inicio',
        description: 'Regresar al dashboard principal',
        icon: '🏠',
        shortcut: 'Ctrl+H',
        action: 'home'
      },
      {
        name: 'Ir a Itinerario',
        description: 'Ver y editar tu itinerario',
        icon: '📅',
        shortcut: 'Ctrl+I',
        action: 'itinerary'
      },
      {
        name: 'Ir a Gastos',
        description: 'Controlar tus gastos del viaje',
        icon: '💰',
        shortcut: 'Ctrl+E',
        action: 'expenses'
      },
      {
        name: 'Ir a Mapa',
        description: 'Ver mapa interactivo',
        icon: '🗺️',
        shortcut: 'Ctrl+M',
        action: 'map'
      },
      {
        name: 'Ir a Atracciones',
        description: 'Explorar lugares de interés',
        icon: '🎯',
        shortcut: 'Alt+A',
        action: 'attractions'
      },
      {
        name: 'Generador Inteligente',
        description: 'Crear itinerario con IA',
        icon: '🧠',
        shortcut: 'Ctrl+G',
        action: 'smartGenerator'
      },
      {
        name: 'Nueva Actividad',
        description: 'Agregar actividad al itinerario',
        icon: '➕',
        shortcut: 'Ctrl+N',
        action: 'newActivity'
      },
      {
        name: 'Modo Oscuro',
        description: 'Cambiar entre modo claro/oscuro',
        icon: '🌙',
        shortcut: 'D',
        action: 'darkMode'
      },
      {
        name: 'Ayuda de Atajos',
        description: 'Ver todos los atajos de teclado',
        icon: '❓',
        shortcut: '?',
        action: 'help'
      }
    ];
  },

  /**
   * Formats a keyboard shortcut for display
   */
  formatShortcut(shortcut) {
    if (this.isMac) {
      return shortcut
        .replace('Ctrl', '⌘')
        .replace('Alt', '⌥')
        .replace('Shift', '⇧');
    }
    return shortcut;
  },

  /**
   * Shows a help modal with all keyboard shortcuts
   */
  showShortcutsHelp() {
    const helpHTML = `
      <div id="shortcutsHelpModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onclick="if(event.target.id === 'shortcutsHelpModal') this.remove()">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onclick="event.stopPropagation()">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold">⌨️ Atajos de Teclado</h2>
                <p class="text-blue-100 mt-1">Navega más rápido con estos atajos</p>
              </div>
              <button onclick="this.closest('#shortcutsHelpModal').remove()" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${this.getCommands().map(cmd => `
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">${cmd.icon}</span>
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white text-sm">${cmd.name}</p>
                      <p class="text-xs text-gray-500">${cmd.description}</p>
                    </div>
                  </div>
                  <kbd class="px-3 py-1 bg-white dark:bg-gray-600 rounded text-xs font-mono text-gray-600 dark:text-gray-200 whitespace-nowrap">
                    ${this.formatShortcut(cmd.shortcut)}
                  </kbd>
                </div>
              `).join('')}
            </div>

            <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                <strong>💡 Tip:</strong> Presiona <kbd class="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs">${this.formatShortcut('Ctrl+K')}</kbd>
                para abrir la paleta de comandos y buscar cualquier acción.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center">
            <button onclick="this.closest('#shortcutsHelpModal').remove()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `;

    // Remove existing help modal if present
    const existingModal = document.getElementById('shortcutsHelpModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', helpHTML);
  },

  /**
   * Capitalizes the first letter of a string
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => KeyboardShortcuts.init());
} else {
  KeyboardShortcuts.init();
}

// Make available globally
if (typeof window !== 'undefined') {
  window.KeyboardShortcuts = KeyboardShortcuts;
}
