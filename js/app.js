// js/app.js
import { AppCore } from './core.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';
import { ModalRenderer } from './modals.js';
import { MapHandler } from './map.js';

function initApp() {
  AppCore.init();
  ItineraryHandler.renderItinerary();
  TabsHandler.renderAllTabs();
  MapHandler.renderMap();
  ModalRenderer.renderModals();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
