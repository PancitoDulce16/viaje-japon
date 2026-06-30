// js/itinerary-orchestrator.js - Orquestador Inteligente del Itinerario
// "Cerebro" que coordina autom�ticamente todos los m�dulos de inteligencia

import { eventBus } from '../../core/event-bus.js';
import { DayBalancer } from './day-balancer-v3.js';
import { RouteOptimizer } from '../../map/route-optimizer-v2.js';
import { ActivityDayAssignment } from './activity-day-assignment.js';
import { MasterItineraryOptimizer } from './master-itinerary-optimizer-v2025.js'; // 🚀 UPDATED to use new file with DEBUG
import { HotelBaseSystem } from '../../api/hotel-base-system.js';

/**
 * >� ITINERARY ORCHESTRATOR
 * Sistema de orquestaci�n autom�tico que reacciona a cambios en el itinerario
 *
 * Escucha eventos y ejecuta autom�ticamente:
 * - Balance de d�as
 * - Optimizaci�n de rutas
 * - Validaciones
 * - Sugerencias inteligentes
 */
export const ItineraryOrchestrator = {
  // Estado
  isProcessing: false,
  pendingChanges: [],
  debounceTimer: null,
  config: {
    debounceDelay: 1000, // Esperar 1s despu�s del �ltimo cambio
    autoOptimize: true,
    autoBalance: true,
    autoValidate: true,
    showNotifications: true
  },

  /**
   * Inicializa el orquestador y registra listeners
   */
  init() {
    console.log('>� Inicializando ItineraryOrchestrator...');

    // Escuchar eventos del itinerario
    this.registerEventListeners();

    console.log(' ItineraryOrchestrator inicializado');
    console.log('=� Configuraci�n:', this.config);
  },

  /**
   * Registra todos los event listeners necesarios
   */
  registerEventListeners() {
    // Eventos de modificaci�n del itinerario
    eventBus.on('itinerary:activity:added', (data) => this.onItineraryChanged('activity_added', data));
    eventBus.on('itinerary:activity:updated', (data) => this.onItineraryChanged('activity_updated', data));
    eventBus.on('itinerary:activity:deleted', (data) => this.onItineraryChanged('activity_deleted', data));
    eventBus.on('itinerary:activity:moved', (data) => this.onItineraryChanged('activity_moved', data));
    eventBus.on('itinerary:day:modified', (data) => this.onItineraryChanged('day_modified', data));
    eventBus.on('itinerary:loaded', (data) => this.onItineraryLoaded(data));

    // Eventos de hoteles (importante para optimizaci�n)
    eventBus.on('hotel:added', (data) => this.onHotelChanged('hotel_added', data));
    eventBus.on('hotel:updated', (data) => this.onHotelChanged('hotel_updated', data));
    eventBus.on('hotel:deleted', (data) => this.onHotelChanged('hotel_deleted', data));

    console.log(' Event listeners registrados');
  },

  /**
   * Handler: Itinerario cargado
   */
  async onItineraryLoaded(data) {
    console.log('=� Itinerario cargado:', data.tripId);

    // No hacer optimizaci�n autom�tica al cargar
    // Solo validar
    if (this.config.autoValidate && data.itinerary) {
      await this.validateItinerary(data.itinerary);
    }
  },

  /**
   * Handler: Itinerario modificado
   */
  async onItineraryChanged(changeType, data) {
    console.log(`=� Cambio detectado: ${changeType}`, data);

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
   * Handler: Hotel modificado (importante para optimizaci�n geogr�fica)
   */
  async onHotelChanged(changeType, data) {
    console.log(`<� Hotel modificado: ${changeType}`, data);

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
      console.log('� Ya hay un proceso en ejecuci�n, saltando...');
      return;
    }

    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
      console.log('� No hay itinerario v�lido para procesar');
      return;
    }

    this.isProcessing = true;
    console.log('=� Procesando cambios pendientes:', this.pendingChanges.length);

    try {
      // Analizar tipo de cambios
      const hasActivityChanges = this.pendingChanges.some(c =>
        c.type.includes('activity')
      );
      const hasHotelChanges = this.pendingChanges.some(c =>
        c.type.includes('hotel')
      );

      // FLUJO AUTOM�TICO
      let result = { itinerary };

      // 1. Si hay cambios de hotel, re-asignar actividades por proximidad
      if (hasHotelChanges && this.config.autoOptimize) {
        console.log('<� Paso 1: Re-asignando actividades por proximidad al hotel...');
        if (ActivityDayAssignment && ActivityDayAssignment.assignActivitiesOptimally) {
          result.itinerary = await ActivityDayAssignment.assignActivitiesOptimally(itinerary);
        }
      }

      // 2. Balance autom�tico de d�as
      if (hasActivityChanges && this.config.autoBalance) {
        console.log('� Paso 2: Balanceando d�as autom�ticamente...');
        if (DayBalancer && DayBalancer.smartBalanceItinerary) {
          const balanceResult = await DayBalancer.smartBalanceItinerary(result.itinerary);
          result.itinerary = balanceResult.itinerary;
          result.analysis = balanceResult.analysis;
        }
      }

      // 3. Optimizaci�n de rutas por d�a
      if (hasActivityChanges && this.config.autoOptimize) {
        console.log('=� Paso 3: Optimizando rutas...');
        await this.optimizeAllDayRoutes(result.itinerary);
      }

      // 4. Validaci�n final
      if (this.config.autoValidate) {
        console.log(' Paso 4: Validando itinerario...');
        await this.validateItinerary(result.itinerary);
      }

      // Emitir evento de optimizaci�n completada
      await eventBus.emit('itinerary:optimized', {
        itinerary: result.itinerary,
        analysis: result.analysis,
        changesProcessed: this.pendingChanges.length
      });

      // Mostrar notificaci�n sutil
      if (this.config.showNotifications && typeof window !== 'undefined' && window.Notifications) {
        window.Notifications.show(
          `( Itinerario optimizado autom�ticamente (${this.pendingChanges.length} cambios procesados)`,
          'success',
          3000
        );
      }

      console.log(' Optimizaci�n autom�tica completada');

    } catch (error) {
      console.error('L Error en orquestaci�n autom�tica:', error);

      if (this.config.showNotifications && typeof window !== 'undefined' && window.Notifications) {
        window.Notifications.show(
          '� Error en optimizaci�n autom�tica',
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
   * Optimiza rutas de todos los d�as afectados
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
            console.log(`    D�a ${day.day}: Ruta optimizada`);
          }
        }
      } catch (error) {
        console.warn(`   � Error optimizando d�a ${day.day}:`, error.message);
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
        console.warn('� Validaci�n encontr� problemas:', {
          errors: validation.summary.totalErrors,
          warnings: validation.summary.totalWarnings
        });

        // Emitir evento de problemas de validaci�n
        await eventBus.emit('itinerary:validation:issues', {
          validation,
          itinerary
        });
      } else {
        console.log(' Validaci�n exitosa');
      }

      return validation;
    } catch (error) {
      console.error('L Error en validaci�n:', error);
      return null;
    }
  },

  /**
   * Actualiza la configuraci�n del orquestador
   */
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);
    console.log('� Configuraci�n actualizada:', this.config);
  },

  /**
   * Activa/desactiva la optimizaci�n autom�tica
   */
  setAutoOptimize(enabled) {
    this.config.autoOptimize = enabled;
    console.log(`> Auto-optimizaci�n: ${enabled ? 'ACTIVADA' : 'DESACTIVADA'}`);
  },

  /**
   * Activa/desactiva el balance autom�tico
   */
  setAutoBalance(enabled) {
    this.config.autoBalance = enabled;
    console.log(`� Auto-balance: ${enabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
  },

  /**
   * Obtiene estad�sticas del orquestador
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
