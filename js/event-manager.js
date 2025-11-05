// js/event-manager.js - Sistema centralizado de gestión de event listeners

import { Logger } from './helpers.js';

/**
 * EventManager - Gestiona todos los event listeners de la aplicación
 * Previene memory leaks al proporcionar cleanup automático
 */
class EventManager {
    constructor() {
        this.listeners = new Map(); // Map<element, Array<{type, handler, options}>>
        this.moduleListeners = new Map(); // Map<moduleName, Set<listenerIds>>
        this.listenerIdCounter = 0;
    }

    /**
     * Agrega un event listener con tracking automático
     * @param {HTMLElement|Window|Document} element - Elemento al que agregar el listener
     * @param {string} eventType - Tipo de evento (click, input, etc.)
     * @param {Function} handler - Función handler
     * @param {Object|boolean} options - Opciones del addEventListener
     * @param {string} moduleName - Nombre del módulo que registra el listener
     * @returns {number} - ID del listener para referencia
     */
    add(element, eventType, handler, options = false, moduleName = 'global') {
        if (!element || !eventType || !handler) {
            Logger.error('EventManager.add: Missing required parameters');
            return null;
        }

        const listenerId = ++this.listenerIdCounter;

        // Agregar el listener al elemento
        element.addEventListener(eventType, handler, options);

        // Guardar la referencia
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }

        this.listeners.get(element).push({
            id: listenerId,
            type: eventType,
            handler,
            options,
            moduleName
        });

        // Trackear por módulo
        if (!this.moduleListeners.has(moduleName)) {
            this.moduleListeners.set(moduleName, new Set());
        }
        this.moduleListeners.get(moduleName).add(listenerId);

        Logger.debug(`EventManager: Added listener #${listenerId} (${eventType}) to ${moduleName}`);

        return listenerId;
    }

    /**
     * Remueve un listener específico por su ID
     * @param {number} listenerId - ID del listener a remover
     */
    removeById(listenerId) {
        for (const [element, listeners] of this.listeners.entries()) {
            const index = listeners.findIndex(l => l.id === listenerId);
            if (index !== -1) {
                const listener = listeners[index];
                element.removeEventListener(listener.type, listener.handler, listener.options);
                listeners.splice(index, 1);

                // Limpiar del tracking de módulos
                for (const [, ids] of this.moduleListeners.entries()) {
                    ids.delete(listenerId);
                }

                Logger.debug(`EventManager: Removed listener #${listenerId}`);

                // Si no quedan listeners en el elemento, remover la entrada
                if (listeners.length === 0) {
                    this.listeners.delete(element);
                }

                return true;
            }
        }
        return false;
    }

    /**
     * Remueve todos los listeners de un elemento
     * @param {HTMLElement|Window|Document} element - Elemento del que remover listeners
     */
    removeFromElement(element) {
        const listeners = this.listeners.get(element);
        if (!listeners) return 0;

        let count = 0;
        for (const listener of listeners) {
            element.removeEventListener(listener.type, listener.handler, listener.options);

            // Limpiar del tracking de módulos
            for (const [, ids] of this.moduleListeners.entries()) {
                ids.delete(listener.id);
            }
            count++;
        }

        this.listeners.delete(element);
        Logger.debug(`EventManager: Removed ${count} listeners from element`);
        return count;
    }

    /**
     * Remueve todos los listeners de un módulo específico
     * @param {string} moduleName - Nombre del módulo
     * @returns {number} - Cantidad de listeners removidos
     */
    removeByModule(moduleName) {
        const moduleIds = this.moduleListeners.get(moduleName);
        if (!moduleIds || moduleIds.size === 0) {
            Logger.debug(`EventManager: No listeners found for module ${moduleName}`);
            return 0;
        }

        let count = 0;
        const idsToRemove = Array.from(moduleIds);

        for (const listenerId of idsToRemove) {
            if (this.removeById(listenerId)) {
                count++;
            }
        }

        this.moduleListeners.delete(moduleName);
        Logger.debug(`EventManager: Removed ${count} listeners from module ${moduleName}`);
        return count;
    }

    /**
     * Limpia todos los listeners de la aplicación
     */
    removeAll() {
        let count = 0;
        for (const [element, listeners] of this.listeners.entries()) {
            for (const listener of listeners) {
                element.removeEventListener(listener.type, listener.handler, listener.options);
                count++;
            }
        }

        this.listeners.clear();
        this.moduleListeners.clear();
        Logger.info(`EventManager: Removed all ${count} listeners`);
        return count;
    }

    /**
     * Obtiene estadísticas de listeners registrados
     */
    getStats() {
        const stats = {
            totalListeners: 0,
            byModule: {},
            byEventType: {}
        };

        for (const [, listeners] of this.listeners.entries()) {
            stats.totalListeners += listeners.length;

            for (const listener of listeners) {
                // Por módulo
                if (!stats.byModule[listener.moduleName]) {
                    stats.byModule[listener.moduleName] = 0;
                }
                stats.byModule[listener.moduleName]++;

                // Por tipo de evento
                if (!stats.byEventType[listener.type]) {
                    stats.byEventType[listener.type] = 0;
                }
                stats.byEventType[listener.type]++;
            }
        }

        return stats;
    }

    /**
     * Imprime estadísticas de listeners en consola
     */
    logStats() {
        const stats = this.getStats();
        console.log('📊 EventManager Stats:');
        console.log(`  Total listeners: ${stats.totalListeners}`);
        console.log('  By module:', stats.byModule);
        console.log('  By event type:', stats.byEventType);
    }
}

// Exportar instancia singleton
export const eventManager = new EventManager();

// Cleanup automático al cerrar/refrescar la página
window.addEventListener('beforeunload', () => {
    eventManager.removeAll();
});

// Exponer globalmente para debugging
if (typeof window !== 'undefined') {
    window.eventManager = eventManager;
}
