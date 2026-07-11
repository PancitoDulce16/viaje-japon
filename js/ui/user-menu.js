// js/user-menu.js - Menú hamburguesa/kebab con perfil y opciones de usuario

import { auth } from '../core/firebase-config.js';

export const UserMenu = {
    isOpen: false,

    init() {
        this.injectMenu();
        this.attachListeners();
    },

    // El botón/opciones de este menú ahora viven en dashboard.html dentro de
    // #mobileMenuPanel (el mismo panel que abre el hamburguesa del header) -
    // antes este módulo creaba SU PROPIO botón flotante hamburguesa en la
    // esquina superior derecha, duplicando #menuToggle del header y confundiendo
    // cuál de los dos abría qué. Acá solo se inyecta el modal de perfil, que
    // sigue siendo propio de este módulo.
    injectMenu() {
        const existingModal = document.getElementById('userProfileModal');
        if (existingModal) return; // Ya existe

        const menuHTML = `
            <!-- Profile Modal -->
            <div id="userProfileModal" class="hidden fixed inset-0 bg-black/80 z-50 overflow-y-auto" onclick="UserMenu.closeProfileModal(event)">
                <div class="min-h-screen px-4 py-8">
                    <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl relative" onclick="event.stopPropagation()">
                        <button
                            onclick="UserMenu.closeProfileModal()"
                            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl z-10"
                        >
                            ✕
                        </button>
                        <div id="userProfileModalContent" class="p-6">
                            <!-- Profile content will be injected here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', menuHTML);
    },

    attachListeners() {
        // Actualizar info del usuario (avatar/nombre/email, ahora en #mobileMenuPanel)
        this.updateUserInfo();

        // Listen auth changes
        auth.onAuthStateChanged(() => {
            this.updateUserInfo();
        });
    },

    // El panel que contenía estos botones era un dropdown propio; ahora es
    // #mobileMenu (controlado por dashboard.js). Cerrarlo vía el botón de
    // cierre existente mantiene el resto de los métodos (openProfile, logout,
    // etc.) funcionando sin cambios.
    closeMenu() {
        this.isOpen = false;
        document.getElementById('menuClose')?.click();
    },

    updateUserInfo() {
        const user = auth.currentUser;

        const avatar = document.getElementById('menuUserAvatar');
        const name = document.getElementById('menuUserName');
        const email = document.getElementById('menuUserEmail');

        if (user) {
            if (avatar) {
                if (user.photoURL) {
                    avatar.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}" class="w-full h-full object-cover">`;
                } else {
                    avatar.textContent = (user.displayName || 'U').charAt(0).toUpperCase();
                }
            }
            if (name) name.textContent = user.displayName || 'Usuario';
            if (email) email.textContent = user.email || '';
        } else {
            if (avatar) avatar.textContent = '?';
            if (name) name.textContent = 'No autenticado';
            if (email) email.textContent = 'Inicia sesión';
        }

        // Update dark mode status
        this.updateDarkModeStatus();
    },

    openProfile() {
        this.closeMenu();

        if (!window.UserProfile) {
            alert('El módulo de perfil no está cargado');
            return;
        }

        const modal = document.getElementById('userProfileModal');
        const content = document.getElementById('userProfileModalContent');

        if (modal && content) {
            content.innerHTML = window.UserProfile.render();
            window.UserProfile.loadProfile();
            modal.classList.remove('hidden');
        }
    },

    closeProfileModal(event) {
        const modal = document.getElementById('userProfileModal');
        if (modal && (!event || event.target.id === 'userProfileModal')) {
            modal.classList.add('hidden');
        }
    },

    openSettings() {
        this.closeMenu();

        // Crear modal para configuraciones
        const modal = document.createElement('div');
        modal.id = 'settingsModal';
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto';
        modalContent.onclick = (e) => e.stopPropagation();

        // Header del modal
        const header = document.createElement('div');
        header.className = 'sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10';
        header.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span>⚙️</span>
                <span>Configuración</span>
            </h2>
            <button class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-3xl leading-none" onclick="document.getElementById('settingsModal').remove()">
                &times;
            </button>
        `;

        // Contenedor para SettingsUI
        const settingsContainer = document.createElement('div');
        settingsContainer.id = 'settingsUIContainer';
        settingsContainer.className = 'p-6';

        modalContent.appendChild(header);
        modalContent.appendChild(settingsContainer);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Renderizar SettingsUI
        // Usar instancia global (puede estar como SettingsUI o SettingsUIInstance)
        const settingsUI = window.SettingsUI || window.SettingsUIInstance;

        if (settingsUI) {
            settingsUI.render('settingsUIContainer');
        } else {
            // Si no existe, intentar crear una instancia
            console.warn('SettingsUI no encontrado, esperando carga...');

            // Retry después de un momento (módulos pueden cargar async)
            setTimeout(() => {
                const retryUI = window.SettingsUI || window.SettingsUIInstance;
                if (retryUI) {
                    retryUI.render('settingsUIContainer');
                } else {
                    settingsContainer.innerHTML = `
                        <div class="text-center py-12">
                            <div class="text-6xl mb-4">⚠️</div>
                            <p class="text-lg font-semibold mb-2">Error al cargar configuraciones</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">El sistema de configuraciones no está disponible.</p>
                            <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                Recargar página
                            </button>
                        </div>
                    `;
                }
            }, 500);
        }
    },

    toggleDarkMode() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');

        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }

        this.updateDarkModeStatus();
    },

    updateDarkModeStatus() {
        const status = document.getElementById('darkModeStatus');
        if (status) {
            const isDark = document.documentElement.classList.contains('dark');
            status.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
        }
    },

    async logout() {
        if (!confirm('¿Cerrar sesión?')) return;

        this.closeMenu();

        try {
            await auth.signOut();
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error al cerrar sesión');
        }
    }
};

// Auto-init when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UserMenu.init());
} else {
    UserMenu.init();
}

// Exportar para uso global
window.UserMenu = UserMenu;
