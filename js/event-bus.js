// js/event-bus.js - Sistema de Eventos Global
// Permite comunicación entre módulos sin acoplamiento directo

/**
 * EventBus - Patrón Pub/Sub para eventos de la aplicación
 * Permite que diferentes módulos se comuniquen sin conocerse entre sí
 */
export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Registra un listener para un tipo de evento
   * @param {string} eventType - Tipo de evento (ej. 'itinerary:changed')
   * @param {Function} callback - Función a ejecutar cuando ocurre el evento
   * @param {Object} options - Opciones: { once: boolean, priority: number }
   * @returns {Function} Función para cancelar la suscripción
   */
  on(eventType, callback, options = {}) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const listener = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      id: Date.now() + Math.random()
    };

    const listeners = this.listeners.get(eventType);
    listeners.push(listener);

    // Ordenar por prioridad (mayor prioridad primero)
    listeners.sort((a, b) => b.priority - a.priority);

    // Retornar función para cancelar suscripción
    return () => this.off(eventType, listener.id);
  }

  /**
   * Registra un listener que solo se ejecuta una vez
   * @param {string} eventType
   * @param {Function} callback
   * @returns {Function} Función para cancelar la suscripción
   */
  once(eventType, callback) {
    return this.on(eventType, callback, { once: true });
  }

  /**
   * Cancela la suscripción a un evento
   * @param {string} eventType
   * @param {string} listenerId
   */
  off(eventType, listenerId) {
    if (!this.listeners.has(eventType)) return;

    const listeners = this.listeners.get(eventType);
    const index = listeners.findIndex(l => l.id === listenerId);

    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Dispara un evento
   * @param {string} eventType - Tipo de evento
   * @param {*} data - Datos del evento
   * @returns {Promise<void>}
   */
  async emit(eventType, data = {}) {
    console.log(`📡 EventBus: ${eventType}`, data);

    // Guardar en historial
    this.eventHistory.push({
      type: eventType,
      data,
      timestamp: Date.now()
    });

    // Mantener historial limitado
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Ejecutar listeners
    if (!this.listeners.has(eventType)) return;

    const listeners = [...this.listeners.get(eventType)];

    for (const listener of listeners) {
      try {
        await listener.callback(data);

        // Si es 'once', eliminar después de ejecutar
        if (listener.once) {
          this.off(eventType, listener.id);
        }
      } catch (error) {
        console.error(`❌ Error en listener de ${eventType}:`, error);
      }
    }
  }

  /**
   * Obtiene el historial de eventos
   * @param {string} eventType - Opcional: filtrar por tipo
   * @returns {Array}
   */
  getHistory(eventType = null) {
    if (eventType) {
      return this.eventHistory.filter(e => e.type === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * Limpia todos los listeners
   */
  clear() {
    this.listeners.clear();
    console.log('🧹 EventBus: Todos los listeners limpiados');
  }

  /**
   * Obtiene estadísticas del EventBus
   */
  getStats() {
    const stats = {
      totalEventTypes: this.listeners.size,
      totalListeners: 0,
      eventTypes: []
    };

    for (const [eventType, listeners] of this.listeners.entries()) {
      stats.totalListeners += listeners.length;
      stats.eventTypes.push({
        type: eventType,
        listeners: listeners.length
      });
    }

    return stats;
  }
}

// Instancia global del EventBus
export const eventBus = new EventBus();

// Exponer globalmente para debugging
if (typeof window !== 'undefined') {
  window.EventBus = eventBus;
}

console.log('✅ EventBus inicializado');
