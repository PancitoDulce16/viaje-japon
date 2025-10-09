// js/app.js - App principal con Firebase
import { AppCore } from './core.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';
import { ModalRenderer } from './modals.js';
import { MapHandler } from './map.js';
import { AttractionsHandler } from './attractions.js';
import { PreparationHandler } from './preparation.js';
import { TransportHandler } from './transport.js';
import { Notifications } from './notifications.js';

// 🔥 Firebase imports
import { AuthHandler } from './auth.js';
import { TripsManager } from './trips-manager.js';
import './firebase-config.js'; // Inicializar Firebase primero

function initApp() {
    console.log('🚀 Iniciando aplicación...');
    
    // 🔔 Inicializar sistema de notificaciones
    Notifications.init();
    
    // 🔥 Inicializar Firebase Auth PRIMERO
    AuthHandler.init();
    
    // Esperar un momento para que el DOM esté listo
    setTimeout(() => {
        // Inicializar el resto de la app
        ModalRenderer.renderModals();
        
        // Solo inicializar estos si el usuario está autenticado
        // (se verificará dentro de cada módulo)
        ItineraryHandler.init();
        MapHandler.renderMap();
        TabsHandler.renderAllTabs();
        AttractionsHandler.renderAttractions();
        PreparationHandler.init();
        TransportHandler.renderTransport();
        AppCore.init();
        
        console.log('✅ Aplicación iniciada correctamente');
        console.log('🔥 Firebase listo');
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
