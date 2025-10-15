// js/app.js - App principal con Firebase
import { AppCore } from './core.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';
import { ModalRenderer } from './modals.js';
import { MapHandler } from './map.js';
import { AttractionsHandler } from './attractions.js';
import { PreparationHandler } from './preparation.js';
import { TransportHandler } from './transport.js';
import { FlightsHandler } from './flights.js';
import { HotelsHandler } from './hotels.js';
import { Notifications } from './notifications.js';
import { ItineraryBuilder } from './itinerary-builder.js';
import { ItineraryBuilderExtensions } from './itinerary-builder-part2.js';

// 🔥 Firebase imports
import { AuthHandler } from './auth.js';
import { TripsManager } from './trips-manager.js';
import './firebase-config.js'; // Inicializar Firebase primero

// 🔌 APIs imports
// APIs integration is imported dynamically at runtime so CI-generated config files are optional
// (avoid breaking the app if js/apis-config.js is missing during local dev)

// 🤖 AI Integration imports
import { AIIntegration } from './ai-integration.js'; // OpenAI Integration

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
        
        // Obtener tripId actual (si existe)
        const currentTripId = localStorage.getItem('currentTripId');
        
        // Solo inicializar estos si el usuario está autenticado
        // (se verificará dentro de cada módulo)
        ItineraryHandler.init();
        ItineraryBuilder.init();
        MapHandler.renderMap();
        TabsHandler.renderAllTabs();
        AttractionsHandler.renderAttractions();
        PreparationHandler.init();
        FlightsHandler.init(currentTripId);
        HotelsHandler.init(currentTripId);
        TransportHandler.renderTransport();
        AppCore.init();
        
        console.log('✅ Aplicación iniciada correctamente');
        console.log('🔥 Firebase listo');
        console.log('✨ Itinerary Builder listo');
        console.log('🔌 APIs Integration listo');
        console.log('🤖 AI Integration listo');
        
        // Cargar integraciones opcionalmente y de forma asíncrona
        (async () => {
            try {
                await import('./apis-config.js'); // may be generated at build time
                const apisModule = await import('./apis-integration.js');
                window.APIsIntegration = apisModule.APIsIntegration;

                // Interceptar fetch para endpoints locales /api/* (mock backend)
                const originalFetch = window.fetch.bind(window);
                window.fetch = async (input, init) => {
                    const req = new Request(input, init);
                    if (new URL(req.url, window.location.origin).pathname.startsWith('/api/')) {
                        const handled = await window.APIsIntegration?.handleLocalApi(req);
                        if (handled) return handled;
                    }
                    return originalFetch(input, init);
                };
            } catch (e) {
                console.warn('⚠️ APIs integration not available:', e);
            }

            try {
                const aiModule = await import('./ai-integration.js');
                window.AIIntegration = aiModule.AIIntegration;
            } catch (e) {
                console.warn('⚠️ AI integration not available:', e);
            }
        })();

        // Inicializar Lucide (si disponible) para iconos <i data-lucide>
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            try {
                window.lucide.createIcons();
            } catch (e) {
                console.warn('Lucide init warning:', e);
            }
        }
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
