// js/app.js
import { AppCore } from './core.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';
import { ModalRenderer } from './modals.js';

// Inicializar la aplicación
function initApp() {
  AppCore.init();
  ItineraryHandler.renderItinerary();
  TabsHandler.renderAllTabs();
  ModalRenderer.renderModals();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
