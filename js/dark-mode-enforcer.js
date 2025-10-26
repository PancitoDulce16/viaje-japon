// js/dark-mode-enforcer.js - FORZAR CONTRASTE EN MODO OSCURO

export function enforceDarkModeContrast() {
  // Solo ejecutar si estamos en modo oscuro
  if (!document.documentElement.classList.contains('dark')) {
    return;
  }

  // Crear o actualizar el style tag
  let styleTag = document.getElementById('dark-mode-enforcer-styles');

  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dark-mode-enforcer-styles';
    document.head.appendChild(styleTag);
  }

  // Estilos ultra agresivos
  styleTag.textContent = `
    /* FORCE DARK BACKGROUNDS */
    html.dark,
    html.dark body,
    html.dark #appDashboard {
      background-color: #000000 !important;
      color: #ffffff !important;
    }

    /* FORCE ALL CARDS TO BE DARK */
    html.dark .bg-white,
    html.dark .bg-gray-50,
    html.dark .bg-gray-100,
    html.dark .bg-gray-200 {
      background-color: #1a1a1a !important;
      border: 1px solid #404040 !important;
    }

    /* FORCE ALL TEXT TO BE WHITE */
    html.dark .bg-white *,
    html.dark .bg-gray-50 *,
    html.dark .bg-gray-100 *,
    html.dark .bg-gray-200 * {
      color: #ffffff !important;
    }

    /* FORCE SPECIFIC TEXT COLORS */
    html.dark h1,
    html.dark h2,
    html.dark h3,
    html.dark h4,
    html.dark h5,
    html.dark h6,
    html.dark p,
    html.dark span,
    html.dark div:not([class*="bg-gradient"]) {
      color: #ffffff !important;
    }

    /* FORCE GRAY TEXT TO BE LIGHT */
    html.dark .text-gray-300,
    html.dark .text-gray-400,
    html.dark .text-gray-500,
    html.dark .text-gray-600,
    html.dark .text-gray-700,
    html.dark .text-gray-800 {
      color: #e5e5e5 !important;
    }

    /* KEEP COLORED TEXT VISIBLE */
    html.dark .text-red-600,
    html.dark .text-red-500 {
      color: #fca5a5 !important;
    }

    html.dark .text-blue-600,
    html.dark .text-blue-500 {
      color: #93c5fd !important;
    }

    html.dark .text-green-600,
    html.dark .text-green-500 {
      color: #86efac !important;
    }

    html.dark .text-yellow-600,
    html.dark .text-yellow-500 {
      color: #fde047 !important;
    }

    /* INPUTS */
    html.dark input,
    html.dark textarea,
    html.dark select {
      background-color: #2d2d2d !important;
      color: #ffffff !important;
      border: 2px solid #404040 !important;
    }

    html.dark input::placeholder,
    html.dark textarea::placeholder {
      color: #888888 !important;
    }

    /* BUTTONS */
    html.dark button:not([class*="bg-gradient"]):not([class*="bg-red"]):not([class*="bg-blue"]):not([class*="bg-green"]):not([class*="bg-purple"]):not([class*="bg-pink"]) {
      background-color: #2d2d2d !important;
      color: #ffffff !important;
      border: 1px solid #404040 !important;
    }

    /* NAV */
    html.dark nav {
      background-color: rgba(0, 0, 0, 0.98) !important;
      border-bottom: 1px solid #404040 !important;
    }

    html.dark nav * {
      color: #ffffff !important;
    }

    /* TABS */
    html.dark .tab-btn {
      color: #b0b0b0 !important;
    }

    html.dark .tab-btn.active {
      color: #fca5a5 !important;
    }

    /* MODALS */
    html.dark .modal > div,
    html.dark .modal .bg-white {
      background-color: #1a1a1a !important;
      border: 2px solid #404040 !important;
    }

    /* EXCEPTION FOR GRADIENTS - Keep their text as designed */
    html.dark [class*="bg-gradient"] {
      color: inherit !important;
    }

    html.dark [class*="bg-gradient"] * {
      color: inherit !important;
    }
  `;

  console.log('✅ Dark mode contrast enforced!');
}

// Auto-enforce on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enforceDarkModeContrast);
} else {
  enforceDarkModeContrast();
}

// Re-enforce when dark mode is toggled
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
      enforceDarkModeContrast();
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class']
});

// Export
window.enforceDarkModeContrast = enforceDarkModeContrast;
