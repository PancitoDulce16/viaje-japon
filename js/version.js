// js/version.js - Sistema de Versionado para Cache Busting
// Este archivo se actualiza automáticamente con cada fix importante

/**
 * VERSION ACTUAL DEL CÓDIGO
 * Formato: YYYY-MM-DD-HH-MM
 * Se incrementa con cada deploy importante
 */
export const APP_VERSION = 'v1763241633';

/**
 * Changelog de versiones
 */
export const VERSION_HISTORY = {
  '2025-11-15-22-00-SIMPLE': {
    date: '2025-11-15',
    changes: [
      '🧹 LIMPIEZA RADICAL: Features semi-rotos DESACTIVADOS',
      '❌ Auto-corrección automática (PASO 9) - desactivada',
      '❌ Optimización automática de rutas (PASO 7) - desactivada',
      '✅ Validaciones simplificadas - solo errores críticos',
      '🎯 Filosofía: Usuario tiene control total, app solo sugiere'
    ],
    breaking: true,
    philosophy: 'Menos features, todos funcionando 100%'
  },
  '2025-11-15-20-30': {
    date: '2025-11-15',
    changes: [
      'FIX CRÍTICO: detectDayCity ya no confía ciegamente en day.location',
      'Detección de ciudad por coordenadas GPS',
      'Logging detallado para debugging',
      'Sistema de cache busting implementado'
    ],
    breaking: true
  }
};

/**
 * Obtiene parámetro de versión para cache busting
 * Úsalo en imports dinámicos: import(`./module.js?v=${getVersionParam()}`)
 */
export function getVersionParam() {
  return `v=${APP_VERSION}`;
}

/**
 * Muestra información de versión en consola
 */
export function logVersion() {
  const current = VERSION_HISTORY[APP_VERSION];

  console.log('%c🚀 Japan Trip Planner', 'font-size: 16px; font-weight: bold; color: #dc2626;');
  console.log(`%cVersion: ${APP_VERSION}`, 'font-weight: bold; color: #2563eb;');

  if (current) {
    console.log(`%c📅 Fecha: ${current.date}`, 'color: #059669;');
    console.log('%c✨ Cambios en esta versión:', 'font-weight: bold; color: #7c3aed;');
    current.changes.forEach(change => {
      console.log(`   • ${change}`);
    });

    if (current.breaking) {
      console.log('%c⚠️ BREAKING CHANGES - Recarga forzada necesaria (Ctrl+Shift+R)', 'background: #fbbf24; color: #000; padding: 4px 8px; font-weight: bold;');
    }
  }

  console.log('');
}

// Log automático al cargar
logVersion();

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.APP_VERSION = APP_VERSION;
  window.getVersionParam = getVersionParam;
}
