// js/cache-buster.js - Sistema de detección y corrección automática de cache
// Este archivo FUERZA reloads cuando detecta archivos viejos

const APP_VERSION = '2025-11-11-SIMPLIFIED-CONDITION-FIX';
const VERSION_KEY = 'app_version';

/**
 * Detecta si hay una versión vieja cacheada y fuerza reload
 */
export function checkAndClearCache() {
  const storedVersion = localStorage.getItem(VERSION_KEY);

  if (storedVersion !== APP_VERSION) {
    console.warn(`🔄 Nueva versión detectada: ${storedVersion} → ${APP_VERSION}`);
    console.warn('🧹 Limpiando cache y recargando...');

    // 🛡️ PROTECCIÓN CRÍTICA: Hacer backup de TODO localStorage antes de limpiar
    const backup = {};

    // Guardar TODAS las keys que empiecen con prefijos críticos
    const criticalPrefixes = ['currentTripId', 'darkMode', 'backup_', 'firebase:', 'user_'];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && criticalPrefixes.some(prefix => key.startsWith(prefix) || key === prefix)) {
        backup[key] = localStorage.getItem(key);
      }
    }

    console.log('🛡️ Backup creado de', Object.keys(backup).length, 'keys críticas');

    localStorage.clear();

    // Restaurar TODAS las keys críticas
    Object.entries(backup).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    console.log('✅ Datos críticos restaurados');

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
 * 🔇 TEMPORALMENTE DESHABILITADO para evitar bucles infinitos
 */
window.addEventListener('error', (event) => {
  try {
    const errorMsg = event.message || '';
    const errorFilename = event.filename || '';

    // 🔇 AUTO-RELOAD DESHABILITADO TEMPORALMENTE
    // Solo loguear el error sin recargar
    console.error('💥 Error detectado:', errorMsg);
    console.error('📍 Archivo:', errorFilename);
    console.warn('ℹ️ Auto-reload deshabilitado temporalmente. Recarga manualmente si es necesario.');

    // NO RECARGAR - comentado para evitar bucle
    /*
    // Detectar errores comunes de cache
    const cacheErrors = [
      'is not a function',
      'is not defined',
      'Cannot read property',
      'undefined is not an object',
      'Failed to fetch',
      'Importing a module script failed',
      'dynamically imported module'
    ];

    const isCacheError = cacheErrors.some(err => errorMsg.includes(err));

    if (isCacheError) {
      console.error('💥 Error de cache detectado:', errorMsg);
      console.error('📍 Archivo:', errorFilename);
      console.warn('🔄 Limpiando cache y recargando en 2 segundos...');

      // Limpiar versión para forzar limpieza en próximo reload
      localStorage.removeItem(VERSION_KEY);

      // Reload después de 2 segundos
      setTimeout(() => {
        window.location.reload(true);
      }, 2000);

      // Prevenir propagación del error
      event.preventDefault();
      return false;
    }
    */
  } catch (handlerError) {
    console.error('Error en el manejador de errores:', handlerError);
  }
});

/**
 * Detectar errores de carga de módulos (promesas rechazadas)
 * 🔇 TEMPORALMENTE DESHABILITADO para evitar bucles infinitos
 */
window.addEventListener('unhandledrejection', (event) => {
  try {
    const reason = event.reason?.message || event.reason || '';

    // 🔇 AUTO-RELOAD DESHABILITADO TEMPORALMENTE
    // Solo loguear el error sin recargar
    console.error('💥 Promesa rechazada:', reason);
    console.warn('ℹ️ Auto-reload deshabilitado temporalmente. Recarga manualmente si es necesario.');

    // NO RECARGAR - comentado para evitar bucle
    /*
    const reasonStr = String(reason).toLowerCase();

    // Detectar errores relacionados con módulos o Service Worker
    const moduleErrors = [
      'failed to fetch',
      'import',
      'module',
      'serviceworker',
      'network error'
    ];

    const isModuleError = moduleErrors.some(err => reasonStr.includes(err));

    if (isModuleError) {
      console.error('💥 Error cargando módulo:', reason);
      console.warn('🔄 Iniciando recarga automática en 1 segundo...');

      localStorage.removeItem(VERSION_KEY);

      setTimeout(() => {
        window.location.reload(true);
      }, 1000);

      event.preventDefault();
    }
    */
  } catch (handlerError) {
    console.error('Error en el manejador de unhandledrejection:', handlerError);
  }
});

/**
 * 🔥 DESREGISTRAR Service Worker completamente (ya no lo usamos)
 */
async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();

      if (registrations.length > 0) {
        console.log('🔥 DESREGISTRANDO Service Worker viejo...');

        for (const registration of registrations) {
          const success = await registration.unregister();
          if (success) {
            console.log('✅ Service Worker desregistrado exitosamente');
          } else {
            console.warn('⚠️ No se pudo desregistrar Service Worker');
          }
        }
      } else {
        console.log('✅ No hay Service Workers registrados');
      }
    } catch (error) {
      console.error('❌ Error desregistrando Service Worker:', error);
    }
  }

  // Limpiar TODOS los caches del Service Worker
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();

      if (cacheNames.length > 0) {
        console.log('🧹 Limpiando', cacheNames.length, 'caches del Service Worker...');

        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Eliminando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );

        console.log('✅ Todos los caches del Service Worker eliminados');
      } else {
        console.log('✅ No hay caches para limpiar');
      }
    } catch (error) {
      console.error('❌ Error limpiando caches:', error);
    }
  }
}

// Auto-ejecutar al cargar
checkAndClearCache();
unregisterServiceWorker(); // 🔥 Desregistrar Service Worker viejo

console.log('✅ Cache Buster activo - Versión:', APP_VERSION);
