// Version tracking must never erase drafts, preferences, or authentication state.
import { APP_VERSION } from '../core/version.js';

const VERSION_KEY = 'app_version';

export function checkAndClearCache() {
  try {
    const previous = localStorage.getItem(VERSION_KEY);
    if (previous !== APP_VERSION) localStorage.setItem(VERSION_KEY, APP_VERSION);
    // HTTP revalidation and the versioned worker update assets without reloading an active form.
    return previous !== null && previous !== APP_VERSION;
  } catch (error) {
    console.warn('No se pudo registrar la versión local.', error);
    return false;
  }
}

export async function cleanupLegacyServiceWorker() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        const script = (registration.active || registration.waiting || registration.installing)?.scriptURL;
        if (!script) continue;
        const url = new URL(script, window.location.href);
        if (url.origin === window.location.origin && url.pathname === '/sw.js') await registration.unregister();
      }
    }
  } catch (error) { console.warn('No se pudo limpiar el worker antiguo.', error); }
  try {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.filter(name => name === 'japitin-v1').map(name => caches.delete(name)));
    }
  } catch (error) { console.warn('No se pudo limpiar la caché antigua.', error); }
}

checkAndClearCache();
cleanupLegacyServiceWorker();
