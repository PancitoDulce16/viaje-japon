// js/dashboard.js - Lógica específica para el dashboard v2.1
// AppCore removed - functionality migrated to dashboard.js

// CSS se carga via <link> en dashboard.html
// No importar CSS aquí para evitar errores de MIME type

import './mobile-enhancements.js'; // Import for side effects
import './theme-manager.js?v=2025-10-26-08'; // Import for side effects - cache bust
// import './dark-mode-enforcer.js'; // DISABLED - Was causing contrast issues and overriding balanced dark mode
import { SafeFirestore } from '../core/firestore-wrapper.js'; // 🛡️ Wrapper seguro para Firestore
import { MapsHelper } from '../map/maps-helper.js'; // 🗺️ Helper para Google Maps
import { PackingList } from '../features/trips/packing-list.js';
import { FavoritesManager } from '../features/trips/favorites-manager.js';
import { ItineraryHandler } from '../features/itinerary/itinerary-v3.js'; // Renamed to force cache bypass
import { TabsHandler } from './tabs.js';
import { ModalRenderer } from './modals.js';
import { MapHandler } from '../map/map.js';
import { AttractionsHandler } from '../api/attractions.js';
import { PreparationHandler } from '../features/trips/preparation.js';
import { TransportHandler } from '../api/transport.js';
import { FlightsHandler } from '../api/flights.js';
import { HotelsHandler } from '../api/hotels.js';
import { Notifications } from '../core/notifications.js';
import { ItineraryBuilder } from '../features/itinerary/itinerary-builder.js';
import { ItineraryBuilderExtensions } from '../features/itinerary/itinerary-builder-part2.js';
import { Dialogs } from './dialogs-v2.js'; // Renamed to force cache bypass
import { RecommendationEngine } from '../ai/recommendation-engine.js';
import { FeedbackTracker } from '../analytics/feedback-tracker.js';
import { CostCalculator } from '../features/budget/cost-calculator.js';
import { EssentialsHandler } from '../features/planning/essentials-handler.js';
import { BudgetCalculator } from '../features/budget/budget-calculator.js';
import { RouteOptimizer } from '../map/route-optimizer-v2.js'; // 🗺️ Optimizador de rutas
import { DayBalancer } from '../features/itinerary/day-balancer-v3.js'; // ⚖️ Balanceador inteligente de días
import { DayExperiencePredictor } from '../features/itinerary/day-experience-predictor.js'; // 🔮 Predictor de experiencia
import { IntelligentGeocoder } from '../map/intelligent-geocoder.js'; // 🧠 Geocodificación inteligente
import { APP_CONFIG } from '../core/config.js'; // 🔐 Configuración de la app
import { HotelBaseSystem } from '../api/hotel-base-system.js'; // 🏨 Sistema de hotel base
import { MealInsertionSystem } from '../features/itinerary/meal-insertion-system.js'; // 🍽️ Sistema de inserción de comidas
import { ItineraryIntelligence } from '../features/itinerary/itinerary-intelligence.js'; // 🧠 Sistema de inteligencia del itinerario
import { ItineraryIntelligenceTier2 } from '../features/itinerary/itinerary-intelligence-tier2.js'; // 🤖 TIER 2 - Automatización avanzada
import { SmartItineraryGenerator } from '../features/itinerary/smart-itinerary-generator.js'; // 🧠 Generador inteligente de itinerarios
import { SmartGeneratorWizard } from '../features/itinerary/smart-generator-wizard.js'; // 🎯 Wizard de generación
import { MasterItineraryOptimizer } from '../features/itinerary/master-itinerary-optimizer.js';
import { eventBus } from '../core/event-bus.js'; // 📡 Sistema de eventos global
import { ItineraryOrchestrator } from '../features/itinerary/itinerary-orchestrator.js'; // 🧠 Orquestador automático
import '../features/itinerary/orchestrator-integration.js'; // 🔗 Integración automática del orquestador
import { HealthDashboard } from '../tools/health-dashboard.js'; // 🏥 Health Dashboard
// Smart Suggestions se cargan desde HTML usando dynamic imports

// 🔥 Firebase imports
import { AuthHandler } from '../core/auth.js';
import { TripsManager } from '../features/trips/trips-manager.js';
import { FCMManager } from '../core/fcm-manager.js';
import '../features/social/chat.js';
import { GroupChat } from '../features/social/group-chat.js';
import '../core/firebase-config.js';

// 🛡️ Firebase Resilience and Integration Tests
import '../core/firebase-resilience.js'; // Sistema de resiliencia para Firebase

// Exportar handlers a window para acceso global
window.MapHandler = MapHandler;
window.AttractionsHandler = AttractionsHandler;
window.TransportHandler = TransportHandler;
window.TabsHandler = TabsHandler;
window.FlightsHandler = FlightsHandler;
window.HotelsHandler = HotelsHandler;
window.PreparationHandler = PreparationHandler;
window.ItineraryHandler = ItineraryHandler;
window.EssentialsHandler = EssentialsHandler;
window.HotelBaseSystem = HotelBaseSystem;
window.MealInsertionSystem = MealInsertionSystem;
window.ItineraryIntelligence = ItineraryIntelligence;
window.ItineraryIntelligenceTier2 = ItineraryIntelligenceTier2;
window.SmartItineraryGenerator = SmartItineraryGenerator;
window.SmartGeneratorWizard = SmartGeneratorWizard;

// 🖼️ Image Service imports
import '../utils/image-service.js';

class DashboardManager {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Iniciando dashboard...');

            // 🔐 Cargar configuración local (API keys) - opcional en producción
            try {
                await APP_CONFIG.loadLocalConfig();
            } catch (error) {
                // config-local.js no existe en producción - esto es normal
                console.log('ℹ️ No hay configuración local (normal en producción)');
            }

            // 🔔 Inicializar sistema de notificaciones
            Notifications.init();

            // 🎯 Inicializar Feedback Tracker
            FeedbackTracker.init();

            // 🔥 Inicializar Firebase Auth PRIMERO
            console.log('⏳ Esperando a que la autenticación esté lista...');
            try {
                await AuthHandler.init();
                console.log('✅ Autenticación lista, continuando con la inicialización...');
            } catch (authError) {
                console.error('❌ Error crítico en autenticación:', authError);
                console.warn('⚠️ Continuando sin autenticación (modo offline)');
            }

            // Verificar autenticación DESPUÉS de init
            if (!this.checkAuthentication()) {
                this.redirectToLogin();
                return;
            }

            // Inicializar el resto de la app
            await this.initializeApp();

            // Configurar eventos del dashboard
            this.setupDashboardEvents();

            this.isInitialized = true;
            console.log('✅ Dashboard inicializado correctamente');

        } catch (error) {
            console.error('💥 Error crítico al inicializar dashboard:', error);
            this.showErrorPage(error);
        }
    }

    checkAuthentication() {
        // Verificar si está autenticado
        const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
        const user = AuthHandler.currentUser;
        
        return isAuthenticated || user;
    }

    redirectToLogin() {
        console.log('🔐 Usuario no autenticado, redirigiendo al login...');
        window.location.href = '/login.html';
    }

    async initializeApp() {
        try {
            // AppCore.init() removed - functionality migrated to initializeDashboardComponents()

            // Inicializar componentes específicos del dashboard
            await this.initializeDashboardComponents();

            console.log('✅ Aplicación inicializada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar aplicación:', error);
            throw error;
        }
    }

    async initializeDashboardComponents() {
        try {
            // Inicializar componentes básicos
            const initPromises = [
                this.initUserInfo(),
                this.initTabs(),
                this.initModals(),
                this.initNotifications()
            ];

            await Promise.all(initPromises);

            // 🧠 Inicializar orquestador automático
            console.log('🧠 Inicializando sistema de orquestación automático...');
            ItineraryOrchestrator.init();

            // 🏥 Inicializar Health Dashboard
            console.log('🏥 Inicializando Health Dashboard...');
            if (window.HealthDashboard) {
                window.HealthDashboard.init();
            }

            // 🏆 Inicializar Sistema de Gamificación
            console.log('🏆 Inicializando Sistema de Gamificación...');
            if (window.GamificationSystem && AuthHandler.currentUser) {
                try {
                    await window.GamificationSystem.initialize(AuthHandler.currentUser.uid);
                    this.renderGamificationPanel();
                } catch (error) {
                    console.error('❌ Error inicializando gamificación:', error);
                }
            }

            // 🤖 Inicializar Panel Central de IA
            console.log('🤖 Inicializando Panel Central de IA...');
            if (window.AIControlPanel) {
                try {
                    window.AIControlPanel.render();
                    console.log('✅ Panel de IA renderizado');
                } catch (error) {
                    console.error('❌ Error inicializando Panel de IA:', error);
                }
            }

            // Inicializar tabs con contenido
            await this.initializeTabContents();

            console.log('✅ Componentes del dashboard inicializados');
        } catch (error) {
            console.error('❌ Error al inicializar componentes del dashboard:', error);
            throw error;
        }
    }

    async initializeTabContents() {
        try {
            // Inicializar MapHandler
            if (window.MapHandler) {
                try {
                    MapHandler.renderMap();
                } catch (e) {
                    console.error('❌ Error inicializando MapHandler:', e);
                }
            }

            // Inicializar TabsHandler (Utils)
            if (window.TabsHandler) {
                try {
                    TabsHandler.renderAllTabs();
                } catch (e) {
                    console.error('❌ Error inicializando TabsHandler:', e);
                }
            }

            // Inicializar AttractionsHandler
            if (window.AttractionsHandler) {
                try {
                    AttractionsHandler.renderAttractions();
                } catch (e) {
                    console.error('❌ Error inicializando AttractionsHandler:', e);
                }
            }

            // Inicializar TransportHandler
            if (window.TransportHandler) {
                try {
                    TransportHandler.renderTransport();
                } catch (e) {
                    console.error('❌ Error inicializando TransportHandler:', e);
                }
            }

            console.log('✅ Contenido de tabs inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar contenido de tabs:', error);
        }
    }

    async initUserInfo() {
        try {
            // Email ahora se muestra en el perfil de usuario, no en el navbar
            const user = AuthHandler.currentUser;
        } catch (error) {
            console.error('❌ Error al inicializar información del usuario:', error);
        }
    }

    async initTabs() {
        try {
            // TabsHandler ya está exportado como objeto en window.TabsHandler
            // No necesita inicialización especial
            console.log('✅ TabsHandler disponible');
        } catch (error) {
            console.error('❌ Error al inicializar tabs:', error);
        }
    }

    async initModals() {
        try {
            // Inicializar el renderizador de modales
            if (ModalRenderer && ModalRenderer.renderModals) {
                console.log('🎭 Rendering modals...');
                ModalRenderer.renderModals();
                console.log('✅ Modals rendered');
            }
        } catch (error) {
            console.error('❌ Error al inicializar modales:', error);
        }
    }

    async initNotifications() {
        try {
            // Inicializar notificaciones push si está disponible
            if (FCMManager) {
                await FCMManager.init();
            }
        } catch (error) {
            console.error('❌ Error al inicializar notificaciones:', error);
            throw error;
        }
    }

    renderGamificationPanel() {
        try {
            const panel = document.getElementById('gamification-panel');
            if (!panel || !window.GamificationSystem) return;

            const html = window.GamificationSystem.renderGamificationPanel();
            panel.innerHTML = html;

            console.log('🏆 Panel de gamificación renderizado');
        } catch (error) {
            console.error('❌ Error renderizando gamificación:', error);
        }
    }

    setupDashboardEvents() {
        // ========================================
        // TAB NAVIGATION - Event listeners for tab buttons
        // ========================================
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Evento de logout (Desktop y Mobile)
        const logoutBtn = document.getElementById('logoutBtn');
        const logoutBtnMobile = document.getElementById('logoutBtnMobile');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        if (logoutBtnMobile) {
            logoutBtnMobile.addEventListener('click', () => {
                this.closeMobileMenu();
                this.handleLogout();
            });
        }

        // Evento de cambio de tema - Solo Mobile (Desktop lo maneja ThemeManager)
        const themeToggleMobile = document.getElementById('themeToggleMobile');
        if (themeToggleMobile && window.ThemeManager) {
            themeToggleMobile.addEventListener('click', () => {
                window.ThemeManager.cycleTheme();
            });
        }

        // Verificar que ThemeManager esté activo
        if (window.ThemeManager) {
            console.log('✅ ThemeManager activo');
        } else {
            console.error('❌ ThemeManager no está disponible');
        }

        // Notificaciones (Desktop y Mobile)
        const enableNotificationsBtn = document.getElementById('enableNotificationsBtn');
        const enableNotificationsBtnMobile = document.getElementById('enableNotificationsBtnMobile');
        if (enableNotificationsBtn) {
            enableNotificationsBtn.addEventListener('click', () => {
                if (window.FCMManager) {
                    window.FCMManager.requestPermissionAndToken();
                }
            });
        }
        if (enableNotificationsBtnMobile) {
            enableNotificationsBtnMobile.addEventListener('click', () => {
                this.closeMobileMenu();
                if (window.FCMManager) {
                    window.FCMManager.requestPermissionAndToken();
                }
            });
        }

        // Menú Hamburguesa Mobile
        this.setupMobileMenu();

        // Emergencia mobile
        const emergencyBtnMobile = document.querySelector('.mobile-menu-emergency');
        if (emergencyBtnMobile) {
            emergencyBtnMobile.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // ========================================
        // FLOATING BUTTONS - Event listeners for floating action buttons
        // ========================================
        const floatingButtons = document.querySelectorAll('.floating-btn[data-modal]');
        floatingButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modalType = button.getAttribute('data-modal');
                this.openFloatingModal(modalType);
            });
        });

        // Sincronizar email del usuario en ambos lugares
        this.syncUserEmail();

        // Prevenir navegación accidental
        window.addEventListener('beforeunload', (e) => {
            if (!this.isInitialized) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const menuClose = document.getElementById('menuClose');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuPanel = document.getElementById('mobileMenuPanel');

        if (!menuToggle || !mobileMenu || !mobileMenuPanel) return;

        // Abrir menú
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => {
                mobileMenuPanel.classList.remove('translate-x-full');
            }, 10);
        });

        // Cerrar menú
        const closeMenu = () => {
            mobileMenuPanel.classList.add('translate-x-full');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        };

        if (menuClose) {
            menuClose.addEventListener('click', closeMenu);
        }

        // Cerrar al hacer click fuera del panel
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMenu();
            }
        });
    }

    switchTab(tabName) {
        console.log(`🔄 Switching to tab: ${tabName}`);

        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        const activeButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Hide all tab content sections
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.add('hidden'));

        // Show the selected tab content
        const activeContent = document.getElementById(`content-${tabName}`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        } else {
            console.error(`❌ Tab content not found: content-${tabName}`);
        }

        // 📊 Refrescar los charts de Analytics con datos actuales al entrar al tab
        if (tabName === 'analytics' && window.AnalyticsIntegration) {
            window.AnalyticsIntegration.showAnalytics();
        }

        // 💰 Refrescar el resumen de presupuesto con el itinerario actual al entrar al tab.
        // renderPreparation() también se dispara desde un listener de Firestore sobre la
        // packing list, independiente de cuándo termina de cargar el itinerario - por eso
        // el presupuesto puede quedar en ¥0 si esa carga inicial fue antes de que
        // ItineraryHandler.currentItinerary estuviera listo. Forzar un re-render aquí
        // asegura que siempre use los datos más recientes disponibles.
        if (tabName === 'preparation' && window.PreparationHandler) {
            window.PreparationHandler.renderPreparation();
        }

        // 🔥 NUEVO: Sincronizar el mapa con el itinerario cuando se cambie al tab del mapa
        if (tabName === 'map' && window.MapHandler) {
            console.log('🗺️ Sincronizando mapa con itinerario...');
            // Pequeño delay para asegurar que el mapa se haya renderizado
            setTimeout(() => {
                window.MapHandler.fixMapSize();
                window.MapHandler.syncWithItinerary();
            }, 100);
        }

        // 🆕 Inicializar módulos de Utils cuando se cambie al tab
        if (tabName === 'utils') {
            console.log('🛠️ Inicializando módulos de Utilidades...');
            setTimeout(() => {
                // Inicializar ExpenseSplitter si existe
                if (window.ExpenseSplitter && !window.ExpenseSplitter.currentTrip) {
                    const tripId = this.getCurrentTripId();
                    if (tripId) {
                        window.ExpenseSplitter.init(tripId);
                    }
                }

                // Inicializar ReservationsManager si existe
                if (window.ReservationsManager && !window.ReservationsManager.currentTrip) {
                    const tripId = this.getCurrentTripId();
                    if (tripId) {
                        window.ReservationsManager.init(tripId);
                    }
                }
            }, 100);
        }

        // 🆕 Inicializar Essentials cuando se cambie al tab
        if (tabName === 'essentials') {
            console.log('🏪 Inicializando Essentials Handler...');
            setTimeout(() => {
                if (window.EssentialsHandler) {
                    window.EssentialsHandler.init();
                }
            }, 100);
        }
    }

    getCurrentTripId() {
        // Obtener el tripId del estado actual
        return window.currentTripId || localStorage.getItem('currentTripId') || null;
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuPanel = document.getElementById('mobileMenuPanel');
        if (mobileMenuPanel && mobileMenu) {
            mobileMenuPanel.classList.add('translate-x-full');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        }
    }

    /**
     * Abrir modal flotante según el tipo
     */
    openFloatingModal(modalType) {
        console.log('🎯 Opening floating modal:', modalType);

        // Mapeo de modales a tabs y secciones
        const modalMapping = {
            'budget': { tab: 'utils', section: 'budgetSection' },          // 💰 Budget → Utils tab
            'packing': { tab: 'preparation', section: null },              // 🎒 Packing → Preparation tab
            'favorites': { tab: 'attractions', section: null },            // ⭐ Favorites → Attractions tab
            'phrases': { tab: 'essentials', section: null },               // 🗣️ Phrases → Essentials tab
            'notes': { tab: 'utils', section: null },                      // 📝 Notes → Utils tab
            'chat': { tab: 'utils', section: null },                       // 💬 Chat → Utils tab
            'emergency': { tab: 'essentials', section: null },             // 🚨 Emergency → Essentials tab
            'reservations': { tab: 'utils', section: 'reservationsSection' } // 🎫 Reservations → Utils tab (backup)
        };

        const mapping = modalMapping[modalType];

        if (mapping) {
            // Cambiar a la tab correspondiente
            this.switchTab(mapping.tab);

            // Scroll suave a la sección específica si existe
            if (mapping.section) {
                setTimeout(() => {
                    const section = document.getElementById(mapping.section);
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        // Highlight temporal
                        section.classList.add('ring-4', 'ring-yellow-400', 'dark:ring-yellow-600');
                        setTimeout(() => {
                            section.classList.remove('ring-4', 'ring-yellow-400', 'dark:ring-yellow-600');
                        }, 2000);
                    }
                }, 300);
            }
        } else {
            console.warn('⚠️ No mapping found for modal type:', modalType);
        }
    }

    syncUserEmail() {
        // Email ahora se muestra en el perfil de usuario
        // Esta función ya no es necesaria
    }

    async handleLogout() {
        try {
            const confirmed = confirm('¿Estás seguro de que quieres cerrar sesión?');
            if (!confirmed) return;

            this.showLoading('Cerrando sesión...');

            // Cerrar sesión en Firebase
            await AuthHandler.logout();

            // Limpiar datos de sesión
            sessionStorage.removeItem('authenticated');
            localStorage.removeItem('currentTrip');

            // Redirigir al login
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1000);

        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
            this.showError('Error al cerrar sesión. Inténtalo de nuevo.');
        }
    }

    handleThemeToggle() {
        // Delegado a ThemeManager
        if (window.ThemeManager) {
            window.ThemeManager.cycleTheme();
        }
    }

    showLoading(message) {
        // Crear overlay de loading
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        loadingOverlay.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p class="text-gray-700 dark:text-gray-300">${message}</p>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    showError(message) {
        this.hideLoading();
        Notifications.show(message, 'error');
    }

    showErrorPage(error) {
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
                        <button
                            onclick="window.location.href='/login.html'"
                            class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md"
                        >
                            🔐 Volver al Login
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-6">
                        Si el problema persiste, contacta al soporte técnico.
                    </p>
                </div>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const instance = new DashboardManager();
    // Exponer como window.DashboardApp para compatibilidad con el menú principal
    window.DashboardApp = instance;
    console.log('✅ DashboardApp exposed to window');
});

// Exportar para uso en otros módulos si es necesario
export { DashboardManager };
