// js/app.js - App principal con Firebase
import { AppCore } from './core.js';

// 🔥 IMPORTANTE: Importar el CSS principal para que Vite lo procese
import '../css/main.css';

import './mobile-enhancements.js'; // Import for side effects
import './theme-manager.js'; // Import for side effects
import { PackingList } from './packing-list.js';
import { FavoritesManager } from './favorites-manager.js';
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
import { Dialogs } from './dialogs.js';
import { EmergencyAssistant } from './emergency-assistant.js';
import { ExpenseSplitter } from './expense-splitter.js';

// 🔥 Firebase imports
import { AuthHandler } from './auth.js';
import { TripsManager } from './trips-manager.js';
import { FCMManager } from './fcm-manager.js'; // Importar el nuevo módulo
import './chat.js'; // Importar el módulo de Chat
import './firebase-config.js'; // Inicializar Firebase primero

// 🖼️ Image Service imports
import './image-service.js'; // Unsplash images service

// 🔌 APIs imports
// APIs integration is imported dynamically at runtime so CI-generated config files are optional
// (avoid breaking the app if js/apis-config.js is missing during local dev)

// Error page display
function showErrorPage(error) {
    console.error('💥 Critical initialization error:', error);

    const appContainer = document.getElementById('appDashboard') || document.body;
    appContainer.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 px-4">
            <div class="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                <div class="text-6xl mb-6">⚠️</div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Error al iniciar la aplicación
                </h1>
                <p class="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Lo sentimos, hubo un problema al cargar la aplicación. Por favor, intenta recargar la página.
                </p>
                <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
                    <p class="text-sm font-mono text-red-800 dark:text-red-400 break-all">
                        ${error.message || error.toString()}
                    </p>
                </div>
                <div class="flex gap-4 justify-center flex-wrap">
                    <button
                        onclick="location.reload()"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md"
                    >
                        🔄 Recargar Página
                    </button>
                    <button
                        onclick="localStorage.clear(); location.reload();"
                        class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md"
                    >
                        🗑️ Limpiar Cache y Recargar
                    </button>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-6">
                    Si el problema persiste, contacta al soporte técnico.
                </p>
            </div>
        </div>
    `;
}

async function initApp() {
    try {
        console.log('🚀 Iniciando aplicación...');

        // 🔔 Inicializar sistema de notificaciones
        Notifications.init();

        // 🔥 Inicializar Firebase Auth PRIMERO y ESPERAR a que esté listo
        console.log('⏳ Esperando a que la autenticación esté lista...');

        try {
            await AuthHandler.init();
            console.log('✅ Autenticación lista, continuando con la inicialización...');
        } catch (authError) {
            console.error('❌ Error crítico en autenticación:', authError);
            // Continue with app initialization even if auth fails - allow offline mode
            console.warn('⚠️ Continuando sin autenticación (modo offline)');
        }

        // Inicializar el resto de la app (NO usar setTimeout - ya esperamos auth)
        ModalRenderer.renderModals();

        // Obtener tripId actual (si existe)
        const currentTripId = localStorage.getItem('currentTripId');

        // Solo inicializar estos si el usuario está autenticado
        // (se verificará dentro de cada módulo)
        try {
            await ItineraryHandler.init();
        } catch (e) {
            console.error('❌ Error inicializando ItineraryHandler:', e);
        }

        try {
            ItineraryBuilder.init();
        } catch (e) {
            console.error('❌ Error inicializando ItineraryBuilder:', e);
        }

        try {
            MapHandler.renderMap();
        } catch (e) {
            console.error('❌ Error inicializando MapHandler:', e);
        }

        try {
            TabsHandler.renderAllTabs();
        } catch (e) {
            console.error('❌ Error inicializando TabsHandler:', e);
        }

        try {
            AttractionsHandler.renderAttractions();
        } catch (e) {
            console.error('❌ Error inicializando AttractionsHandler:', e);
        }

        try {
            PreparationHandler.init();
        } catch (e) {
            console.error('❌ Error inicializando PreparationHandler:', e);
        }

        try {
            FlightsHandler.init(currentTripId);
        } catch (e) {
            console.error('❌ Error inicializando FlightsHandler:', e);
        }

        try {
            HotelsHandler.init(currentTripId);
        } catch (e) {
            console.error('❌ Error inicializando HotelsHandler:', e);
        }

        try {
            TransportHandler.renderTransport();
        } catch (e) {
            console.error('❌ Error inicializando TransportHandler:', e);
        }

        try {
            AppCore.init();
        } catch (e) {
            console.error('❌ Error inicializando AppCore:', e);
        }

        // Inicializar nuevos módulos
        try {
            await PackingList.init();
            window.PackingList = PackingList;
        } catch (e) {
            console.error('❌ Error inicializando PackingList:', e);
        }

        try {
            await FavoritesManager.init();
            window.FavoritesManager = FavoritesManager;
        } catch (e) {
            console.error('❌ Error inicializando FavoritesManager:', e);
        }

        try {
            // EmergencyAssistant se inicializa cuando se abre el modal
            window.EmergencyAssistant = EmergencyAssistant;

            // Agregar listener para el botón de emergencias
            document.querySelectorAll('[data-modal="emergency"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('emergencyModal')?.classList.remove('hidden');
                    EmergencyAssistant.init();
                });
            });

            // Listener para cerrar modal
            document.querySelectorAll('.close-modal[data-modal="emergency"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('emergencyModal')?.classList.add('hidden');
                });
            });
        } catch (e) {
            console.error('❌ Error configurando EmergencyAssistant:', e);
        }

        try {
            // ExpenseSplitter disponible globalmente
            window.ExpenseSplitter = ExpenseSplitter;
        } catch (e) {
            console.error('❌ Error configurando ExpenseSplitter:', e);
        }

        console.log('✅ Aplicación iniciada correctamente');
        console.log('🔥 Firebase listo');
        console.log('✨ Itinerary Builder listo');
        console.log('🎒 Packing List listo');
        console.log('⭐ Favorites Manager listo');
        console.log('🎨 Theme Manager listo');
        console.log('📱 Mobile Enhancements listo');

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
        })();

        // Inicializar Lucide (si disponible) para iconos <i data-lucide>
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            try {
                window.lucide.createIcons();
            } catch (e) {
                console.warn('Lucide init warning:', e);
            }
        }
    } catch (criticalError) {
        // Only show error page for truly critical errors that prevent app from working
        console.error('💥 CRITICAL ERROR during app initialization:', criticalError);
        showErrorPage(criticalError);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
