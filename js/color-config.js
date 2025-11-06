// js/color-config.js - Configuración centralizada de colores para modo oscuro
//
// ⚠️ REGLAS IMPORTANTES PARA MODO OSCURO:
// 1. NUNCA usar opacidades (/10, /20, /30, /50) en fondos oscuros
// 2. SIEMPRE usar colores sólidos: -700, -800, -900
// 3. Texto en modo oscuro: SIEMPRE white o -100
// 4. Bordes en modo oscuro: SIEMPRE -500 o más brillante
// 5. Fondos de texto en modo oscuro: SIEMPRE -700 o más oscuro

/**
 * Colores con alto contraste garantizado para modo oscuro
 */
export const DARK_MODE_COLORS = {
  // Backgrounds (fondos de contenedores)
  backgrounds: {
    gray: 'bg-gray-200 dark:bg-gray-800',
    blue: 'bg-blue-100 dark:bg-blue-800',
    green: 'bg-green-100 dark:bg-green-800',
    emerald: 'bg-emerald-100 dark:bg-emerald-800',
    orange: 'bg-orange-100 dark:bg-orange-800',
    red: 'bg-red-100 dark:bg-red-800',
    purple: 'bg-purple-100 dark:bg-purple-800',
    yellow: 'bg-yellow-100 dark:bg-yellow-800',
    indigo: 'bg-indigo-100 dark:bg-indigo-800'
  },

  // Text (texto principal - MÁXIMO CONTRASTE)
  text: {
    gray: 'text-gray-900 dark:text-white',
    blue: 'text-blue-900 dark:text-white',
    green: 'text-green-900 dark:text-white',
    emerald: 'text-emerald-900 dark:text-white',
    orange: 'text-orange-900 dark:text-white',
    red: 'text-red-900 dark:text-white',
    purple: 'text-purple-900 dark:text-white',
    yellow: 'text-yellow-900 dark:text-white',
    indigo: 'text-indigo-900 dark:text-white'
  },

  // Secondary text (texto secundario - ALTO CONTRASTE)
  textSecondary: {
    gray: 'text-gray-800 dark:text-gray-100',
    blue: 'text-blue-800 dark:text-blue-100',
    green: 'text-green-800 dark:text-green-100',
    emerald: 'text-emerald-800 dark:text-emerald-100',
    orange: 'text-orange-800 dark:text-orange-100',
    red: 'text-red-800 dark:text-red-100',
    purple: 'text-purple-800 dark:text-purple-100',
    yellow: 'text-yellow-800 dark:text-yellow-100',
    indigo: 'text-indigo-800 dark:text-indigo-100'
  },

  // Borders (bordes visibles)
  borders: {
    gray: 'border-gray-400 dark:border-gray-500',
    blue: 'border-blue-400 dark:border-blue-500',
    green: 'border-green-400 dark:border-green-500',
    emerald: 'border-emerald-400 dark:border-emerald-500',
    orange: 'border-orange-400 dark:border-orange-500',
    red: 'border-red-400 dark:border-red-500',
    purple: 'border-purple-400 dark:border-purple-500',
    yellow: 'border-yellow-400 dark:border-yellow-500',
    indigo: 'border-indigo-400 dark:border-indigo-500'
  },

  // Container backgrounds (fondos de página/modales)
  containers: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    card: 'bg-white dark:bg-gray-700'
  }
};

/**
 * Configuraciones pre-hechas para diferentes tipos de indicadores
 */
export const INDICATOR_CONFIGS = {
  // Para indicadores de carga/balance
  load: {
    empty: {
      icon: '⚪',
      label: 'Vacío',
      ...DARK_MODE_COLORS.backgrounds.gray,
      ...DARK_MODE_COLORS.text.gray,
      ...DARK_MODE_COLORS.borders.gray
    },
    low: {
      icon: '🔵',
      label: 'Ligero',
      bg: DARK_MODE_COLORS.backgrounds.blue,
      text: DARK_MODE_COLORS.text.blue,
      textSecondary: DARK_MODE_COLORS.textSecondary.blue,
      border: DARK_MODE_COLORS.borders.blue
    },
    light: {
      icon: '🟢',
      label: 'Moderado',
      bg: DARK_MODE_COLORS.backgrounds.green,
      text: DARK_MODE_COLORS.text.green,
      textSecondary: DARK_MODE_COLORS.textSecondary.green,
      border: DARK_MODE_COLORS.borders.green
    },
    balanced: {
      icon: '✅',
      label: 'Balanceado',
      bg: DARK_MODE_COLORS.backgrounds.emerald,
      text: DARK_MODE_COLORS.text.emerald,
      textSecondary: DARK_MODE_COLORS.textSecondary.emerald,
      border: DARK_MODE_COLORS.borders.emerald
    },
    heavy: {
      icon: '🟠',
      label: 'Cargado',
      bg: DARK_MODE_COLORS.backgrounds.orange,
      text: DARK_MODE_COLORS.text.orange,
      textSecondary: DARK_MODE_COLORS.textSecondary.orange,
      border: DARK_MODE_COLORS.borders.orange
    },
    overloaded: {
      icon: '🔴',
      label: 'Sobrecargado',
      bg: DARK_MODE_COLORS.backgrounds.red,
      text: DARK_MODE_COLORS.text.red,
      textSecondary: DARK_MODE_COLORS.textSecondary.red,
      border: DARK_MODE_COLORS.borders.red
    }
  }
};

/**
 * Valida que un color no tenga opacidad en modo oscuro
 */
export function validateDarkModeColor(colorClass) {
  if (colorClass.includes('dark:') && colorClass.match(/dark:[^/]+\/\d+/)) {
    console.error(`❌ ERROR: Color con opacidad detectado en modo oscuro: ${colorClass}`);
    console.error('🔧 Usar colores sólidos (-700, -800, -900) en lugar de opacidades');
    return false;
  }
  return true;
}

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.DarkModeColors = DARK_MODE_COLORS;
  window.IndicatorConfigs = INDICATOR_CONFIGS;
}
