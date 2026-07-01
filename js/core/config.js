// js/config.js - Application configuration
// ⚠️ NOTA: Este archivo SÍ debe estar en Git
// Solo contiene configuración no sensible

// 🔐 IMPORTANTE: Firebase Hosting sirve el código fuente SIN procesar por Vite
// (firebase.json usa "public": "."), así que import.meta.env.VITE_* NUNCA
// está disponible en producción (solo existe durante `npm run dev` / `vite build`).
// Las API keys reales viven en js/config-local.js, un archivo NO trackeado en
// git (ver .gitignore) que sí está presente en disco al desplegar, por lo que
// se sube con `firebase deploy` sin llegar nunca al repositorio de GitHub.

export const APP_CONFIG = {
  // Valor por defecto seguro; se sobreescribe con la key real por loadLocalConfig()
  GOOGLE_PLACES_API_KEY: '',

  // Carga las keys reales desde config-local.js (no trackeado en git, pero sí desplegado)
  async loadLocalConfig() {
    try {
      const localConfig = await import('../config-local.js');
      if (localConfig.LOCAL_CONFIG) {
        Object.assign(this, localConfig.LOCAL_CONFIG);
        console.log('✅ Configuración local cargada');
      }
    } catch (e) {
      // config-local.js no existe (ej. clon nuevo del repo) - usar valores por defecto
      console.log('ℹ️ No hay configuración local (config-local.js no encontrado)');
    }
  }
};
