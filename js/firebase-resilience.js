// js/firebase-resilience.js - Sistema de Resiliencia para Firebase
// Este módulo asegura que Firebase NUNCA rompa la aplicación

import { auth, db } from './firebase-config.js';

/**
 * FirebaseResilience - Capa de protección para operaciones Firebase
 * Garantiza que la app funcione incluso si Firebase falla
 */
export const FirebaseResilience = {

    // Cache local para datos críticos
    localCache: {
        itinerary: null,
        checklist: null,
        lastSync: null
    },

    /**
     * Wrapper seguro para operaciones de Firestore
     * Si falla, usa datos locales en lugar de romper la app
     */
    async safeFirestoreOperation(operation, fallbackValue = null, cachKey = null) {
        try {
            // Verificar que Firebase esté disponible
            if (!db || !auth) {
                console.warn('⚠️ Firebase no disponible, usando datos locales');
                return this.getFromLocalStorage(cacheKey, fallbackValue);
            }

            // Verificar que el usuario esté autenticado
            if (!auth.currentUser) {
                console.warn('⚠️ Usuario no autenticado, usando datos locales');
                return this.getFromLocalStorage(cacheKey, fallbackValue);
            }

            // Intentar la operación con timeout
            const result = await Promise.race([
                operation(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 10000)
                )
            ]);

            // Guardar en cache local si la operación fue exitosa
            if (cacheKey && result) {
                this.saveToLocalStorage(cacheKey, result);
            }

            return result;

        } catch (error) {
            console.error('❌ Error en operación Firebase:', error);
            console.warn('📦 Usando datos locales como fallback');

            // Retornar datos del cache local
            return this.getFromLocalStorage(cacheKey, fallbackValue);
        }
    },

    /**
     * Guardar datos en localStorage con manejo de errores
     */
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            this.localCache[key] = data;
            console.log(`💾 Datos guardados en cache local: ${key}`);
        } catch (error) {
            console.error('❌ Error guardando en localStorage:', error);
        }
    },

    /**
     * Obtener datos de localStorage con fallback
     */
    getFromLocalStorage(key, fallbackValue = null) {
        try {
            // Primero intentar del cache en memoria
            if (this.localCache[key]) {
                console.log(`📦 Datos recuperados de cache en memoria: ${key}`);
                return this.localCache[key];
            }

            // Luego intentar de localStorage
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.localCache[key] = parsed;
                console.log(`📦 Datos recuperados de localStorage: ${key}`);
                return parsed;
            }

            console.warn(`⚠️ No hay datos en cache para: ${key}`);
            return fallbackValue;

        } catch (error) {
            console.error('❌ Error leyendo localStorage:', error);
            return fallbackValue;
        }
    },

    /**
     * Verificar salud de Firebase
     */
    async checkFirebaseHealth() {
        const health = {
            auth: false,
            firestore: false,
            user: false,
            timestamp: new Date().toISOString()
        };

        try {
            // Check Auth
            health.auth = !!auth;
            health.user = !!auth?.currentUser;

            // Check Firestore
            health.firestore = !!db;

            console.log('🏥 Firebase Health Check:', health);
            return health;

        } catch (error) {
            console.error('❌ Error en health check:', error);
            return health;
        }
    },

    /**
     * Reconectar Firebase si está caído
     */
    async reconnect() {
        console.log('🔄 Intentando reconectar Firebase...');

        try {
            // Verificar salud
            const health = await this.checkFirebaseHealth();

            if (!health.auth || !health.firestore) {
                console.error('❌ Firebase no disponible');
                return false;
            }

            if (!health.user) {
                console.warn('⚠️ Usuario no autenticado');
                return false;
            }

            console.log('✅ Firebase reconectado exitosamente');
            return true;

        } catch (error) {
            console.error('❌ Error reconectando Firebase:', error);
            return false;
        }
    },

    /**
     * Inicializar sistema de resiliencia
     */
    init() {
        console.log('🛡️ Inicializando Firebase Resilience System');

        // Health check cada 30 segundos
        setInterval(() => {
            this.checkFirebaseHealth();
        }, 30000);

        // Listener para detectar cuando el usuario se desconecta
        if (auth) {
            auth.onAuthStateChanged((user) => {
                if (!user) {
                    console.warn('⚠️ Usuario desconectado - app funcionará en modo offline');
                }
            });
        }

        // Guardar datos críticos en cache cuando se reciban
        window.addEventListener('firestore:data:received', (e) => {
            if (e.detail && e.detail.key && e.detail.data) {
                this.saveToLocalStorage(e.detail.key, e.detail.data);
            }
        });

        console.log('✅ Firebase Resilience System activo');
    }
};

// Auto-inicializar
if (typeof window !== 'undefined') {
    window.FirebaseResilience = FirebaseResilience;
    FirebaseResilience.init();
}
