// js/config.js - Application configuration
// ⚠️ NOTA: Este archivo SÍ debe estar en Git
// Solo contiene configuración no sensible

// 🔐 IMPORTANTE: Para API keys sensibles, usar variables de entorno o config local
// Las API keys se pueden configurar de 3 formas (en orden de prioridad):
// 1. Variable de entorno (más seguro)
// 2. Firebase Remote Config (recomendado para producción)
// 3. Archivo local config-local.js (para desarrollo)

export const APP_CONFIG = {
  // Google Places API Key — injected at build time from .env (gitignored, see .env.example)
  GOOGLE_PLACES_API_KEY: import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '',

  // Se cargará desde config-local.js si existe (no trackeado en git)
  async loadLocalConfig() {
    // Solo intentar cargar en desarrollo (localhost)
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('localhost');

    if (!isLocalhost) {
      // En producción, usar las API keys hardcodeadas arriba
      return;
    }

    // Solo en desarrollo: intentar cargar config-local.js
    try {
      const localConfig = await import('../config-local.js');
      if (localConfig.LOCAL_CONFIG) {
        Object.assign(this, localConfig.LOCAL_CONFIG);
        console.log('✅ Configuración local cargada');
      }
    } catch (e) {
      // config-local.js no existe en desarrollo - usar valores por defecto
      console.log('ℹ️ No hay configuración local en desarrollo');
    }
  }
};
