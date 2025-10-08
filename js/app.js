// js/app.js
import { AppCore } from './core.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';
import { ModalRenderer } from './modals.js';
import { MapHandler } from './map.js';
import { GalleryHandler } from './gallery.js';

function initApp() {
  // 1. Renderizar todos los componentes estáticos en sus contenedores
  ItineraryHandler.renderItinerary();
  MapHandler.renderMap();
  GalleryHandler.renderGallery();
  TabsHandler.renderAllTabs(); // Para Vuelos, Comida, etc.
  ModalRenderer.renderModals();

  // 2. Iniciar el núcleo de la aplicación (eventos, pestañas, etc.)
  AppCore.init();
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
