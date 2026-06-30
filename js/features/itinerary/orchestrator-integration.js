// js/orchestrator-integration.js - Integración del Orquestador con módulos existentes
// Este archivo "parchea" las funciones existentes para emitir eventos automáticamente

import { eventBus } from '../../core/event-bus.js';

/**
 * Integra el EventBus con las acciones del itinerario
 * Envuelve las funciones existentes para que emitan eventos automáticamente
 */
export function integrateOrchestrator() {
  console.log('🔗 Integrando orquestador con acciones del itinerario...');

  // Esperar a que el DOM y los módulos estén cargados
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => patchItineraryFunctions());
  } else {
    patchItineraryFunctions();
  }
}

/**
 * Parchea las funciones del itinerario para emitir eventos
 */
function patchItineraryFunctions() {
  // Esperar a que window.currentItinerary esté disponible
  const checkInterval = setInterval(() => {
    if (typeof window.saveCurrentItineraryToFirebase === 'function') {
      clearInterval(checkInterval);
      setupEventEmitters();
    }
  }, 100);

  // Timeout de seguridad
  setTimeout(() => clearInterval(checkInterval), 5000);
}

/**
 * Configura los emisores de eventos
 */
function setupEventEmitters() {
  console.log('✅ Configurando emisores de eventos...');

  // Envolver saveCurrentItineraryToFirebase
  const originalSave = window.saveCurrentItineraryToFirebase;
  if (originalSave) {
    window.saveCurrentItineraryToFirebase = async function(...args) {
      // Ejecutar función original
      const result = await originalSave.apply(this, args);

      // Emitir evento después de guardar
      if (window.currentItinerary) {
        await eventBus.emit('itinerary:saved', {
          itinerary: window.currentItinerary,
          tripId: window.currentItinerary.tripId
        });
      }

      return result;
    };
    console.log('  ✓ saveCurrentItineraryToFirebase parcheada');
  }

  // Crear funciones helper globales para emitir eventos
  window.emitItineraryEvent = async (eventType, data) => {
    await eventBus.emit(eventType, {
      itinerary: window.currentItinerary,
      ...data
    });
  };

  // Exponer el eventBus globalmente
  window.EventBus = eventBus;

  console.log('✅ Emisores de eventos configurados');
  console.log('💡 Uso: await window.emitItineraryEvent("itinerary:activity:added", { activity, dayNumber })');
}

// Auto-integrar al cargar
integrateOrchestrator();

console.log('✅ Orchestrator integration cargado');
