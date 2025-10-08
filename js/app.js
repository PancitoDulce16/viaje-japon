// js/app.js - App principal con Firebase
import { AppCore } from './core.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';
import { ModalRenderer } from './modals.js';
import { MapHandler } from './map.js';
import { AttractionsHandler } from './attractions.js';
import { PreparationHandler } from './preparation.js';
import { TransportHandler } from './transport.js';

// 🔥 NUEVO: Firebase imports
import { AuthHandler } from './auth.js';
import './firebase-config.js'; // Inicializar Firebase primero

function initApp() {
    console.log('🚀 Iniciando aplicación...');
    
    // 🔥 NUEVO: Inicializar Firebase Auth primero
    AuthHandler.init();
    
    // Inicializar el resto de la app
    ModalRenderer.renderModals();
    ItineraryHandler.init();
    MapHandler.renderMap();
    TabsHandler.renderAllTabs();
    AttractionsHandler.renderAttractions();
    PreparationHandler.renderPreparation();
    TransportHandler.renderTransport();
    AppCore.init();
    
    console.log('✅ Aplicación iniciada correctamente');
    console.log('🔥 Firebase listo');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
