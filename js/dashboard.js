// js/dashboard.js - Lógica específica para el dashboard v2.1
import { AppCore } from './core.js';

// CSS se carga via <link> en dashboard.html
// No importar CSS aquí para evitar errores de MIME type

import './mobile-enhancements.js'; // Import for side effects
import './theme-manager.js?v=2025-10-26-08'; // Import for side effects - cache bust
// import './dark-mode-enforcer.js'; // DISABLED - Was causing contrast issues and overriding balanced dark mode
import { SafeFirestore } from './firestore-wrapper.js'; // 🛡️ Wrapper seguro para Firestore
import { MapsHelper } from './maps-helper.js'; // 🗺️ Helper para Google Maps
import { PackingList } from './packing-list.js';
import { FavoritesManager } from './favorites-manager.js';
import { ItineraryHandler } from './itinerary.js?v=2025-11-08-BALANCE-FIX';
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
import { RecommendationEngine } from './recommendation-engine.js';
import { FeedbackTracker } from './feedback-tracker.js';
import { CostCalculator } from './cost-calculator.js';
import { EssentialsHandler } from './essentials-handler.js';
import { BudgetCalculator } from './budget-calculator.js';
import { RouteOptimizer } from './route-optimizer-v2.js'; // 🗺️ Optimizador de rutas
import { DayBalancer } from './day-balancer-v2.js'; // ⚖️ Balanceador inteligente de días
import { DayExperiencePredictor } from './day-experience-predictor.js'; // 🔮 Predictor de experiencia
import { IntelligentGeocoder } from './intelligent-geocoder.js'; // 🧠 Geocodificación inteligente
import { APP_CONFIG } from './config.js'; // 🔐 Configuración de la app
import { HotelBaseSystem } from './hotel-base-system.js'; // 🏨 Sistema de hotel base
import { MealInsertionSystem } from './meal-insertion-system.js'; // 🍽️ Sistema de inserción de comidas
// Smart Suggestions se cargan desde HTML usando dynamic imports

// 🔥 Firebase imports
import { AuthHandler } from './auth.js';
import { TripsManager } from './trips-manager.js?v=2025-11-07-V2-FILES';
import { FCMManager } from './fcm-manager.js';
import './chat.js';
import { GroupChat } from './group-chat.js';
import './firebase-config.js';

// 🛡️ Firebase Resilience and Integration Tests
import './firebase-resilience.js'; // Sistema de resiliencia para Firebase
import './integration-tests.js'; // Pruebas de integración automáticas

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

// 🖼️ Image Service imports
import './image-service.js';

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
            // Inicializar el núcleo de la aplicación
            await AppCore.init();

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
            const user = AuthHandler.currentUser;
            if (user) {
                const userEmailDisplay = document.getElementById('userEmailDisplay');
                if (userEmailDisplay) {
                    userEmailDisplay.textContent = user.email;
                }
            }
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

    setupDashboardEvents() {
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

    syncUserEmail() {
        const userEmailDisplay = document.getElementById('userEmailDisplay');
        const userEmailDisplayMobile = document.getElementById('userEmailDisplayMobile');

        if (userEmailDisplay && userEmailDisplayMobile) {
            const email = userEmailDisplay.textContent;
            userEmailDisplayMobile.textContent = email;
        }

        // Observar cambios en el email
        if (userEmailDisplay) {
            const observer = new MutationObserver(() => {
                if (userEmailDisplayMobile) {
                    userEmailDisplayMobile.textContent = userEmailDisplay.textContent;
                }
            });
            observer.observe(userEmailDisplay, { childList: true, characterData: true, subtree: true });
        }
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
    new DashboardManager();
});

// Exportar para uso en otros módulos si es necesario
export { DashboardManager };
