// js/user-menu.js - Menú hamburguesa/kebab con perfil y opciones de usuario

import { auth } from './firebase-config.js';

export const UserMenu = {
    isOpen: false,

    init() {
        this.injectMenu();
        this.attachListeners();
    },

    injectMenu() {
        const existingMenu = document.getElementById('userMenuContainer');
        if (existingMenu) return; // Ya existe

        const menuHTML = `
            <!-- User Menu Container -->
            <div id="userMenuContainer" class="fixed top-4 right-4 z-50">
                <!-- Menu Button -->
                <button
                    id="userMenuBtn"
                    class="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 smooth-scale btn-press"
                    aria-label="Menú de usuario"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                    id="userMenuDropdown"
                    class="hidden absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in glass"
                >
                    <!-- User Header -->
                    <div class="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
                        <div class="flex items-center gap-3">
                            <div id="menuUserAvatar" class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg overflow-hidden">
                                ?
                            </div>
                            <div class="flex-1 min-w-0">
                                <p id="menuUserName" class="font-bold truncate">Usuario</p>
                                <p id="menuUserEmail" class="text-xs opacity-90 truncate">email@example.com</p>
                            </div>
                        </div>
                    </div>

                    <!-- Menu Items -->
                    <div class="py-2">
                        <button
                            onclick="UserMenu.openProfile()"
                            class="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition smooth-hover flex items-center gap-3 text-left"
                        >
                            <span class="text-2xl">👤</span>
                            <div>
                                <p class="font-semibold text-gray-800 dark:text-white">Mi Perfil</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Ver y editar información</p>
                            </div>
                        </button>

                        <button
                            onclick="UserMenu.openSettings()"
                            class="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition smooth-hover flex items-center gap-3 text-left"
                        >
                            <span class="text-2xl">⚙️</span>
                            <div>
                                <p class="font-semibold text-gray-800 dark:text-white">Configuración</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Preferencias de la app</p>
                            </div>
                        </button>

                        <button
                            onclick="UserMenu.toggleDarkMode()"
                            class="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition smooth-hover flex items-center gap-3 text-left"
                        >
                            <span class="text-2xl">🌓</span>
                            <div>
                                <p class="font-semibold text-gray-800 dark:text-white">Modo Oscuro</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400" id="darkModeStatus">Activar/Desactivar</p>
                            </div>
                        </button>

                        <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                        <button
                            onclick="UserMenu.logout()"
                            class="w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition smooth-hover flex items-center gap-3 text-left text-red-600 dark:text-red-400"
                        >
                            <span class="text-2xl">🚪</span>
                            <div>
                                <p class="font-semibold">Cerrar Sesión</p>
                                <p class="text-xs opacity-75">Salir de la cuenta</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

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
        const menuBtn = document.getElementById('userMenuBtn');
        const menuDropdown = document.getElementById('userMenuDropdown');

        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (this.isOpen && menuDropdown && !menuDropdown.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Actualizar info del usuario
        this.updateUserInfo();

        // Listen auth changes
        auth.onAuthStateChanged(() => {
            this.updateUserInfo();
        });
    },

    toggleMenu() {
        this.isOpen = !this.isOpen;
        const dropdown = document.getElementById('userMenuDropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden', !this.isOpen);
        }
    },

    closeMenu() {
        this.isOpen = false;
        const dropdown = document.getElementById('userMenuDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
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
        alert('⚙️ Configuración próximamente...');
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
