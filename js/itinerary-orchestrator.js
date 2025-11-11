// js/itinerary-orchestrator.js - Orquestador Inteligente del Itinerario
// "Cerebro" que coordina automáticamente todos los módulos de inteligencia

import { eventBus } from './event-bus.js';
import { DayBalancer } from './day-balancer-v3.js';
import { RouteOptimizer } from './route-optimizer-v2.js';
import { ActivityDayAssignment } from './activity-day-assignment.js';
import { MasterItineraryOptimizer } from './master-itinerary-optimizer.js';
import { HotelBaseSystem } from './hotel-base-system.js';

/**
 * >à ITINERARY ORCHESTRATOR
 * Sistema de orquestación automático que reacciona a cambios en el itinerario
 *
 * Escucha eventos y ejecuta automáticamente:
 * - Balance de días
 * - Optimización de rutas
 * - Validaciones
 * - Sugerencias inteligentes
 */
export const ItineraryOrchestrator = {
  // Estado
  isProcessing: false,
  pendingChanges: [],
  debounceTimer: null,
  config: {
    debounceDelay: 1000, // Esperar 1s después del último cambio
    autoOptimize: true,
    autoBalance: true,
    autoValidate: true,
    showNotifications: true
  },

  /**
   * Inicializa el orquestador y registra listeners
   */
  init() {
    console.log('>à Inicializando ItineraryOrchestrator...');

    // Escuchar eventos del itinerario
    this.registerEventListeners();

    console.log(' ItineraryOrchestrator inicializado');
    console.log('=Ê Configuración:', this.config);
  },

  /**
   * Registra todos los event listeners necesarios
   */
  registerEventListeners() {
    // Eventos de modificación del itinerario
    eventBus.on('itinerary:activity:added', (data) => this.onItineraryChanged('activity_added', data));
    eventBus.on('itinerary:activity:updated', (data) => this.onItineraryChanged('activity_updated', data));
    eventBus.on('itinerary:activity:deleted', (data) => this.onItineraryChanged('activity_deleted', data));
    eventBus.on('itinerary:activity:moved', (data) => this.onItineraryChanged('activity_moved', data));
    eventBus.on('itinerary:day:modified', (data) => this.onItineraryChanged('day_modified', data));
    eventBus.on('itinerary:loaded', (data) => this.onItineraryLoaded(data));

    // Eventos de hoteles (importante para optimización)
    eventBus.on('hotel:added', (data) => this.onHotelChanged('hotel_added', data));
    eventBus.on('hotel:updated', (data) => this.onHotelChanged('hotel_updated', data));
    eventBus.on('hotel:deleted', (data) => this.onHotelChanged('hotel_deleted', data));

    console.log(' Event listeners registrados');
  },

  /**
   * Handler: Itinerario cargado
   */
  async onItineraryLoaded(data) {
    console.log('=Ö Itinerario cargado:', data.tripId);

    // No hacer optimización automática al cargar
    // Solo validar
    if (this.config.autoValidate && data.itinerary) {
      await this.validateItinerary(data.itinerary);
    }
  },

  /**
   * Handler: Itinerario modificado
   */
  async onItineraryChanged(changeType, data) {
    console.log(`=Ý Cambio detectado: ${changeType}`, data);

    // Agregar a cola de cambios pendientes
    this.pendingChanges.push({
      type: changeType,
      data,
      timestamp: Date.now()
    });

    // Debounce: esperar a que el usuario termine de hacer cambios
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.processChanges(data.itinerary);
    }, this.config.debounceDelay);
  },

  /**
   * Handler: Hotel modificado (importante para optimización geográfica)
   */
  async onHotelChanged(changeType, data) {
    console.log(`<è Hotel modificado: ${changeType}`, data);

    // Si se agrega/modifica un hotel, re-optimizar proximidad
    if (changeType === 'hotel_added' || changeType === 'hotel_updated') {
      this.pendingChanges.push({
        type: 'hotel_proximity_optimization',
        data,
        timestamp: Date.now()
      });

      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.processChanges(data.itinerary);
      }, this.config.debounceDelay);
    }
  },

  /**
   * Procesa todos los cambios pendientes
   */
  async processChanges(itinerary) {
    if (this.isProcessing) {
      console.log('ó Ya hay un proceso en ejecución, saltando...');
      return;
    }

    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
      console.log('  No hay itinerario válido para procesar');
      return;
    }

    this.isProcessing = true;
    console.log('=€ Procesando cambios pendientes:', this.pendingChanges.length);

    try {
      // Analizar tipo de cambios
      const hasActivityChanges = this.pendingChanges.some(c =>
        c.type.includes('activity')
      );
      const hasHotelChanges = this.pendingChanges.some(c =>
        c.type.includes('hotel')
      );

      // FLUJO AUTOMÁTICO
      let result = { itinerary };

      // 1. Si hay cambios de hotel, re-asignar actividades por proximidad
      if (hasHotelChanges && this.config.autoOptimize) {
        console.log('<è Paso 1: Re-asignando actividades por proximidad al hotel...');
        if (ActivityDayAssignment && ActivityDayAssignment.assignActivitiesOptimally) {
          result.itinerary = await ActivityDayAssignment.assignActivitiesOptimally(itinerary);
        }
      }

      // 2. Balance automático de días
      if (hasActivityChanges && this.config.autoBalance) {
        console.log('– Paso 2: Balanceando días automáticamente...');
        if (DayBalancer && DayBalancer.smartBalanceItinerary) {
          const balanceResult = await DayBalancer.smartBalanceItinerary(result.itinerary);
          result.itinerary = balanceResult.itinerary;
          result.analysis = balanceResult.analysis;
        }
      }

      // 3. Optimización de rutas por día
      if (hasActivityChanges && this.config.autoOptimize) {
        console.log('=ú Paso 3: Optimizando rutas...');
        await this.optimizeAllDayRoutes(result.itinerary);
      }

      // 4. Validación final
      if (this.config.autoValidate) {
        console.log(' Paso 4: Validando itinerario...');
        await this.validateItinerary(result.itinerary);
      }

      // Emitir evento de optimización completada
      await eventBus.emit('itinerary:optimized', {
        itinerary: result.itinerary,
        analysis: result.analysis,
        changesProcessed: this.pendingChanges.length
      });

      // Mostrar notificación sutil
      if (this.config.showNotifications && typeof window !== 'undefined' && window.Notifications) {
        window.Notifications.show(
          `( Itinerario optimizado automáticamente (${this.pendingChanges.length} cambios procesados)`,
          'success',
          3000
        );
      }

      console.log(' Optimización automática completada');

    } catch (error) {
      console.error('L Error en orquestación automática:', error);

      if (this.config.showNotifications && typeof window !== 'undefined' && window.Notifications) {
        window.Notifications.show(
          '  Error en optimización automática',
          'warning',
          3000
        );
      }
    } finally {
      // Limpiar cola de cambios
      this.pendingChanges = [];
      this.isProcessing = false;
    }
  },

  /**
   * Optimiza rutas de todos los días afectados
   */
  async optimizeAllDayRoutes(itinerary) {
    if (!RouteOptimizer || !HotelBaseSystem) return;

    const daysToOptimize = itinerary.days.filter(day =>
      day.activities && day.activities.length > 1
    );

    for (const day of daysToOptimize) {
      try {
        const city = HotelBaseSystem.detectCityForDay(day);
        const hotel = HotelBaseSystem.getHotelForCity(itinerary, city, day.day);

        if (hotel && hotel.coordinates) {
          const result = RouteOptimizer.optimizeRoute(day.activities, {
            startPoint: hotel.coordinates,
            optimizationMode: 'balanced',
            shouldRecalculateTimings: true
          });

          if (result.wasOptimized) {
            day.activities = result.optimizedActivities;
            console.log(`    Día ${day.day}: Ruta optimizada`);
          }
        }
      } catch (error) {
        console.warn(`     Error optimizando día ${day.day}:`, error.message);
      }
    }
  },

  /**
   * Valida el itinerario completo
   */
  async validateItinerary(itinerary) {
    if (!window.MasterValidator) return;

    try {
      const validation = window.MasterValidator.validateCompleteItinerary(itinerary);

      if (!validation.valid) {
        console.warn('  Validación encontró problemas:', {
          errors: validation.summary.totalErrors,
          warnings: validation.summary.totalWarnings
        });

        // Emitir evento de problemas de validación
        await eventBus.emit('itinerary:validation:issues', {
          validation,
          itinerary
        });
      } else {
        console.log(' Validación exitosa');
      }

      return validation;
    } catch (error) {
      console.error('L Error en validación:', error);
      return null;
    }
  },

  /**
   * Actualiza la configuración del orquestador
   */
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);
    console.log('™ Configuración actualizada:', this.config);
  },

  /**
   * Activa/desactiva la optimización automática
   */
  setAutoOptimize(enabled) {
    this.config.autoOptimize = enabled;
    console.log(`> Auto-optimización: ${enabled ? 'ACTIVADA' : 'DESACTIVADA'}`);
  },

  /**
   * Activa/desactiva el balance automático
   */
  setAutoBalance(enabled) {
    this.config.autoBalance = enabled;
    console.log(`– Auto-balance: ${enabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
  },

  /**
   * Obtiene estadísticas del orquestador
   */
  getStats() {
    return {
      isProcessing: this.isProcessing,
      pendingChanges: this.pendingChanges.length,
      config: { ...this.config },
      eventBusStats: eventBus.getStats()
    };
  }
};

// Exponer globalmente para debugging y control
if (typeof window !== 'undefined') {
  window.ItineraryOrchestrator = ItineraryOrchestrator;
}

console.log(' ItineraryOrchestrator cargado');
