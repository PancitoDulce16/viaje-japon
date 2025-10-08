// js/app.js
import { AppCore } from './core.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';
import { ModalRenderer } from './modals.js';
import { MapHandler } from './map.js';
import { AttractionsHandler } from './attractions.js'; // ← NUEVO

function initApp() {
    console.log('🚀 Iniciando aplicación...');
    
    ModalRenderer.renderModals();
    ItineraryHandler.init();
    MapHandler.renderMap();
    TabsHandler.renderAllTabs();
    AttractionsHandler.renderAttractions(); // ← NUEVO
    AppCore.init();
    
    console.log('✅ Aplicación iniciada correctamente');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
