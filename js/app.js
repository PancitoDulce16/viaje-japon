// js/app.js - CORREGIDO

import { AppCore } from './core.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';
import { ModalRenderer } from './modals.js';
import { MapHandler } from './map.js';

function initApp() {
    console.log('🚀 Iniciando aplicación...');
    
    // Renderizar modales primero
    ModalRenderer.renderModals();
    
    // Inicializar itinerario
    ItineraryHandler.init();
    
    // Renderizar otras tabs
    MapHandler.renderMap();
    TabsHandler.renderAllTabs();
    
    // Inicializar el núcleo (event listeners, countdown, etc.)
    AppCore.init();
    
    console.log('✅ Aplicación iniciada correctamente');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
