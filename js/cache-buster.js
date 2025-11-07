// js/cache-buster.js - Sistema de detección y corrección automática de cache
// Este archivo FUERZA reloads cuando detecta archivos viejos

const APP_VERSION = '2025-11-07-FINAL';
const VERSION_KEY = 'app_version';

/**
 * Detecta si hay una versión vieja cacheada y fuerza reload
 */
export function checkAndClearCache() {
  const storedVersion = localStorage.getItem(VERSION_KEY);

  if (storedVersion !== APP_VERSION) {
    console.warn(`🔄 Nueva versión detectada: ${storedVersion} → ${APP_VERSION}`);
    console.warn('🧹 Limpiando cache y recargando...');

    // Limpiar localStorage excepto datos críticos
    const criticalKeys = ['currentTripId', 'darkMode'];
    const backup = {};
    criticalKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        backup[key] = localStorage.getItem(key);
      }
    });

    localStorage.clear();

    // Restaurar datos críticos
    Object.entries(backup).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // Guardar nueva versión
    localStorage.setItem(VERSION_KEY, APP_VERSION);

    // Forzar reload con cache bypass
    window.location.reload(true);
    return true;
  }

  // Guardar versión actual
  localStorage.setItem(VERSION_KEY, APP_VERSION);
  return false;
}

/**
 * Manejador global de errores de módulos
 */
window.addEventListener('error', (event) => {
  const errorMsg = event.message || '';

  // Detectar errores comunes de cache
  const cacheErrors = [
    'is not a function',
    'is not defined',
    'Cannot read property',
    'undefined is not an object',
    'Failed to fetch',
    'Importing a module script failed'
  ];

  const isCacheError = cacheErrors.some(err => errorMsg.includes(err));

  if (isCacheError) {
    console.error('💥 Error de cache detectado:', errorMsg);
    console.warn('🔄 Limpiando cache y recargando en 2 segundos...');

    // Limpiar versión para forzar limpieza en próximo reload
    localStorage.removeItem(VERSION_KEY);

    // Mostrar mensaje al usuario
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #dc2626;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 99999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        text-align: center;
      ">
        🔄 Detectamos archivos antiguos. Actualizando automáticamente...<br>
        <small style="opacity: 0.9;">No cierres esta ventana</small>
      </div>
    `;
    document.body.appendChild(notification);

    // Reload después de 2 segundos
    setTimeout(() => {
      window.location.reload(true);
    }, 2000);

    // Prevenir propagación del error
    event.preventDefault();
    return false;
  }
});

/**
 * Detectar errores de carga de módulos
 */
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || event.reason || '';

  if (reason.includes('Failed to fetch') ||
      reason.includes('import') ||
      reason.includes('module')) {
    console.error('💥 Error cargando módulo:', reason);
    console.warn('🔄 Iniciando recarga automática...');

    localStorage.removeItem(VERSION_KEY);

    setTimeout(() => {
      window.location.reload(true);
    }, 1000);

    event.preventDefault();
  }
});

// Auto-ejecutar al cargar
checkAndClearCache();

console.log('✅ Cache Buster activo - Versión:', APP_VERSION);
