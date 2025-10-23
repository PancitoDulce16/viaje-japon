// js/theme-manager.js - Sistema completo de temas con persistencia y auto-detección

export const ThemeManager = {
  themes: {
    light: {
      name: 'Modo Claro',
      icon: 'fa-sun',
      class: ''
    },
    dark: {
      name: 'Modo Oscuro',
      icon: 'fa-moon',
      class: 'dark'
    },
    auto: {
      name: 'Automático',
      icon: 'fa-adjust',
      class: 'auto'
    }
  },

  currentTheme: 'auto',
  systemPreference: null,
  mediaQuery: null,

  // Inicializar sistema de temas
  init() {
    console.log('🎨 Inicializando Theme Manager...');

    // Detectar preferencia del sistema
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemPreference = this.mediaQuery.matches ? 'dark' : 'light';

    // Cargar preferencia guardada
    const savedTheme = localStorage.getItem('theme-preference') || 'auto';
    this.currentTheme = savedTheme;

    // Aplicar tema inicial
    this.applyTheme(this.currentTheme);

    // Escuchar cambios en preferencia del sistema
    this.mediaQuery.addEventListener('change', (e) => {
      this.systemPreference = e.matches ? 'dark' : 'light';
      console.log('🎨 Sistema cambió a:', this.systemPreference);

      // Si está en modo auto, actualizar
      if (this.currentTheme === 'auto') {
        this.applyTheme('auto');
      }
    });

    // Setup UI
    this.setupUI();

    console.log('✅ Theme Manager listo:', this.currentTheme);
  },

  // Aplicar tema
  applyTheme(theme) {
    const html = document.documentElement;

    // Remover todas las clases de tema
    html.classList.remove('dark', 'light', 'auto');

    let effectiveTheme = theme;

    // Si es auto, usar preferencia del sistema
    if (theme === 'auto') {
      effectiveTheme = this.systemPreference;
      html.classList.add('auto'); // Marcar que está en modo auto
    }

    // Aplicar clase dark si corresponde
    if (effectiveTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Guardar preferencia
    localStorage.setItem('theme-preference', theme);
    this.currentTheme = theme;

    // Actualizar meta theme-color para PWA
    this.updateThemeColor(effectiveTheme);

    // Actualizar icono del botón
    this.updateThemeIcon(theme);

    // Dispatch evento para otros módulos
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme, effectiveTheme }
    }));

    console.log('🎨 Tema aplicado:', theme, '(efectivo:', effectiveTheme, ')');
  },

  // Actualizar color del tema para PWA
  updateThemeColor(effectiveTheme) {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }

    // Colores para PWA
    const colors = {
      light: '#dc2626', // Japan red
      dark: '#111827'   // Dark gray
    };

    themeColorMeta.content = colors[effectiveTheme];
  },

  // Actualizar icono del botón de tema
  updateThemeIcon(theme) {
    const icon = document.getElementById('darkModeIcon');
    if (!icon) return;

    // Remover todos los iconos
    icon.classList.remove('fa-sun', 'fa-moon', 'fa-adjust');

    // Agregar icono correspondiente
    icon.classList.add(this.themes[theme].icon);

    // Agregar tooltip
    const button = document.getElementById('themeToggle');
    if (button) {
      button.title = this.themes[theme].name;
      button.setAttribute('aria-label', this.themes[theme].name);
    }
  },

  // Ciclar entre temas
  cycleTheme() {
    const themeOrder = ['light', 'dark', 'auto'];
    const currentIndex = themeOrder.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];

    this.applyTheme(nextTheme);

    // Mostrar notificación
    if (window.Notifications) {
      const effectiveTheme = nextTheme === 'auto' ? this.systemPreference : nextTheme;
      const emoji = effectiveTheme === 'dark' ? '🌙' : '☀️';
      const themeName = nextTheme === 'auto' ? `${this.themes[nextTheme].name} (${effectiveTheme === 'dark' ? 'Oscuro' : 'Claro'})` : this.themes[nextTheme].name;
      window.Notifications.info(`${emoji} ${themeName} activado`);
    }

    // Vibración táctil si está disponible
    if (window.MobileEnhancements) {
      window.MobileEnhancements.vibrate([20]);
    }
  },

  // Setup UI del selector de tema
  setupUI() {
    const themeButton = document.getElementById('themeToggle');
    if (themeButton) {
      // Remover listeners anteriores
      const newButton = themeButton.cloneNode(true);
      themeButton.parentNode.replaceChild(newButton, themeButton);

      // Agregar nuevo listener
      newButton.addEventListener('click', () => {
        this.cycleTheme();
      });
    }

    // Agregar selector de tema al settings si existe
    this.addThemeSelector();
  },

  // Agregar selector de tema avanzado
  addThemeSelector() {
    // Este método puede expandirse para agregar un selector más completo
    // en un modal de configuración
  },

  // Obtener tema efectivo actual
  getEffectiveTheme() {
    if (this.currentTheme === 'auto') {
      return this.systemPreference;
    }
    return this.currentTheme;
  },

  // Detectar si es dark mode actualmente
  isDarkMode() {
    return this.getEffectiveTheme() === 'dark';
  },

  // Forzar tema temporalmente (útil para demos)
  forceTheme(theme) {
    if (!this.themes[theme]) return;

    const html = document.documentElement;
    html.classList.remove('dark', 'light', 'auto');

    if (theme === 'dark') {
      html.classList.add('dark');
    }
  },

  // Resetear a preferencia guardada
  resetTheme() {
    this.applyTheme(this.currentTheme);
  }
};

// Auto-inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
  });
} else {
  ThemeManager.init();
}

// Exportar globalmente
window.ThemeManager = ThemeManager;
