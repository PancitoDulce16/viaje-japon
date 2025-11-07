// js/config.js - Application configuration
// ⚠️ NOTA: Este archivo SÍ debe estar en Git
// Solo contiene configuración no sensible

// 🔐 IMPORTANTE: Para API keys sensibles, usar variables de entorno o config local
// Las API keys se pueden configurar de 3 formas (en orden de prioridad):
// 1. Variable de entorno (más seguro)
// 2. Firebase Remote Config (recomendado para producción)
// 3. Archivo local config-local.js (para desarrollo)

export const APP_CONFIG = {
  // Google Places API Key
  // ⚠️ TEMPORAL: Key hardcodeada para producción
  // TODO: Mover a Firebase Remote Config o variables de entorno
  GOOGLE_PLACES_API_KEY: 'AIzaSyDNuDDafAWJdtQO0cJBi6yhG-UalCX1XhU',

  // Se cargará desde config-local.js si existe (no trackeado en git)
  async loadLocalConfig() {
    try {
      const localConfig = await import('./config-local.js');
      if (localConfig.LOCAL_CONFIG) {
        Object.assign(this, localConfig.LOCAL_CONFIG);
        console.log('✅ Configuración local cargada');
      }
    } catch (e) {
      // config-local.js no existe, usar valores por defecto
      console.log('ℹ️ No hay configuración local (esto es normal en producción)');
    }
  }
};
