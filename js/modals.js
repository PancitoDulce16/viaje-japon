// js/modals.js

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export const AppModals = {};

export const ModalRenderer = {
    renderModals() {
        const container = document.getElementById('modalsContainer');
        if (!container) return;
        
        container.innerHTML = `
            ${this.getAuthModal()}
            ${this.getEmergencyModal()}
            ${this.getBudgetModal()}
            ${this.getPhrasesModal()}
            ${this.getNotesModal()}
            ${this.getCreateTripModal()}
            ${this.getTripsListModal()}
        `;

        this.setupNotesModal();
    },

    setupNotesModal() {
        setTimeout(() => {
            const saveBtn = document.getElementById('saveNotesBtn');
            if (saveBtn) {
                saveBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.AppCore) {
                        window.AppCore.saveNotes();
                    }
                });
            }
        }, 100);
    },

    getAuthModal() {
        return `
            <div id="modal-auth" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">🔐 Iniciar Sesión</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="auth" aria-label="Cerrar">&times;</button>
                        </div>

                        <!-- Tabs -->
                        <div class="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                            <button 
                                id="loginTab" 
                                class="auth-tab px-4 py-2 font-semibold border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                            >
                                Iniciar Sesión
                            </button>
                            <button 
                                id="registerTab" 
                                class="auth-tab px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Registrarse
                            </button>
                        </div>

                        <!-- Login Form -->
                        <form id="loginForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input 
                                    id="loginEmail" 
                                    type="email" 
                                    required
                                    class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="tu@email.com"
                                >
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Contraseña
                                </label>
                                <input 
                                    id="loginPassword" 
                                    type="password" 
                                    required
                                    class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="••••••••"
                                >
                            </div>
                            <div class="text-right mb-3">
                                <a 
                                    href="#" 
                                    id="forgotPasswordLink"
                                    class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                            <button 
                                type="submit" 
                                class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                            >
                                Iniciar Sesión
                            </button>
                        </form>

                        <!-- Register Form (Hidden by default) -->
                        <form id="registerForm" class="space-y-4 hidden">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input 
                                    id="registerEmail" 
                                    type="email" 
                                    required
                                    class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="tu@email.com"
                                >
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Contraseña (mínimo 6 caracteres)
                                </label>
                                <input 
                                    id="registerPassword" 
                                    type="password" 
                                    required
                                    minlength="6"
                                    class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="••••••••"
                                >
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Confirmar Contraseña
                                </label>
                                <input 
                                    id="registerConfirmPassword" 
                                    type="password" 
                                    required
                                    minlength="6"
                                    class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="••••••••"
                                >
                            </div>
                            <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-3">
                                <p class="text-xs text-gray-700 dark:text-gray-300">
                                    ⚠️ <strong>Seguridad:</strong> Usa una contraseña única que no uses en otros sitios. 
                                    Mínimo 6 caracteres, recomendado 8+.
                                </p>
                            </div>
                            <button 
                                type="submit" 
                                class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                            >
                                Crear Cuenta
                            </button>
                        </form>

                        <!-- Divider -->
                        <div class="flex items-center gap-4 my-6">
                            <div class="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                            <span class="text-sm text-gray-500 dark:text-gray-400">o</span>
                            <div class="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                        </div>

                        <!-- Google Login -->
                        <button 
                            onclick="AuthHandler.loginWithGoogle()" 
                            class="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-semibold"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                                <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                                <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                                <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
                            </svg>
                            Continuar con Google
                        </button>

                        <!-- Info -->
                        <div class="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p class="text-xs text-gray-600 dark:text-gray-400">
                                💡 <strong>¿Por qué registrarse?</strong> Para sincronizar tu presupuesto, 
                                checklist y fotos en todos tus dispositivos y compartir con tu hermano.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getEmergencyModal() {
        return `
            <div id="modal-emergency" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-red-600 dark:text-red-400">🚨 Emergencias</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="emergency" aria-label="Cerrar">&times;</button>
                        </div>
                        <div class="space-y-4">
                            <div class="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border-l-4 border-red-500">
                                <h3 class="font-bold text-lg mb-3 dark:text-white">Japón</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center">
                                        <span class="dark:text-gray-300">🚓 Policía:</span>
                                        <a href="tel:110" class="text-2xl font-bold text-red-600 dark:text-red-400 hover:underline">110</a>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="dark:text-gray-300">🚑 Ambulancia/Bomberos:</span>
                                        <a href="tel:119" class="text-2xl font-bold text-red-600 dark:text-red-400 hover:underline">119</a>
                                    </div>
                                </div>
                            </div>
                            <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <h3 class="font-bold mb-2 dark:text-white">🇨🇷 Embajada Costa Rica</h3>
                                <p class="text-sm dark:text-gray-300">📞 <a href="tel:+81-3-3486-1812" class="font-semibold hover:underline">+81-3-3486-1812</a></p>
                                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Shibuya-ku, Tokyo</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getBudgetModal() {
        return `
            <div id="modal-budget" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">💰 Budget Tracker</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="budget" aria-label="Cerrar">&times;</button>
                        </div>
                        <div class="sync-badge mb-4"></div>
                        <div id="budgetModalContent"></div>
                    </div>
                </div>
            </div>
        `;
    },

    getPhrasesModal() {
        const phrases = [
            { jp: 'こんにちは (Konnichiwa)', es: 'Hola (día)' },
            { jp: 'おはようございます (Ohayou gozaimasu)', es: 'Buenos días' },
            { jp: 'こんばんは (Konbanwa)', es: 'Buenas noches' },
            { jp: 'ありがとう (Arigatou)', es: 'Gracias' },
            { jp: 'ありがとうございます (Arigatou gozaimasu)', es: 'Muchas gracias (formal)' },
            { jp: 'すみません (Sumimasen)', es: 'Disculpe / Perdón' },
            { jp: 'ごめんなさい (Gomen nasai)', es: 'Lo siento' },
            { jp: 'はい (Hai)', es: 'Sí' },
            { jp: 'いいえ (Iie)', es: 'No' },
            { jp: 'トイレはどこですか？ (Toire wa doko desu ka?)', es: '¿Dónde está el baño?' },
            { jp: 'いくらですか？ (Ikura desu ka?)', es: '¿Cuánto cuesta?' },
            { jp: '英語を話せますか？ (Eigo wo hanasemasu ka?)', es: '¿Habla inglés?' },
            { jp: 'おいしい (Oishii)', es: 'Delicioso' },
            { jp: 'お水をください (Omizu wo kudasai)', es: 'Agua por favor' },
            { jp: 'お会計お願いします (Okaikei onegaishimasu)', es: 'La cuenta por favor' }
        ];
        
        return `
            <div id="modal-phrases" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">🗣️ Frases Útiles</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="phrases" aria-label="Cerrar">&times;</button>
                        </div>
                        <div class="space-y-3 max-h-96 overflow-y-auto">
                            ${phrases.map(p => `
                                <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer">
                                    <p class="font-semibold dark:text-white">${escapeHtml(p.jp)}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">${escapeHtml(p.es)}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getCreateTripModal() {
        return `
            <div id="modal-create-trip" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">✈️ Crear Nuevo Viaje</h2>
                            <button onclick="TripsManager.closeCreateTripModal()" class="text-3xl hover:text-red-600 transition" aria-label="Cerrar">&times;</button>
                        </div>

                        <div class="text-center py-8">
                            <div class="text-6xl mb-4">🎉</div>
                            <h3 class="text-xl font-bold dark:text-white mb-4">¡Empecemos a planear tu viaje!</h3>
                            <p class="text-gray-600 dark:text-gray-400 mb-6">
                                Puedes crear un viaje simple o uno completo con itinerario detallado
                            </p>
                            
                            <div class="grid md:grid-cols-2 gap-4">
                                <!-- Viaje Simple -->
                                <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500 transition">
                                    <div class="text-4xl mb-3">📋</div>
                                    <h4 class="font-bold text-lg dark:text-white mb-2">Viaje Simple</h4>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Solo fechas y vuelos básicos. Agrega itinerario después.
                                    </p>
                                    <button 
                                        onclick="TripsManager.showSimpleTripForm()"
                                        class="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                                    >
                                        Crear Simple
                                    </button>
                                </div>

                                <!-- Viaje Completo con Itinerario -->
                                <div class="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-2 border-purple-300 dark:border-purple-600 hover:border-purple-500 transition">
                                    <div class="text-4xl mb-3">✨</div>
                                    <h4 class="font-bold text-lg dark:text-white mb-2">Con Itinerario</h4>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Wizard completo: ciudades, intereses, plantillas y más.
                                    </p>
                                    <button 
                                        onclick="TripsManager.showFullTripWizard()"
                                        class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-semibold"
                                    >
                                        ✨ Crear Completo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getTripsListModal() {
        return `
            <div id="modal-trips-list" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">🗂️ Mis Viajes</h2>
                            <button onclick="TripsManager.closeTripsListModal()" class="text-3xl hover:text-red-600 transition" aria-label="Cerrar">&times;</button>
                        </div>
                        <div id="tripsListContainer"></div>
                    </div>
                </div>
            </div>
        `;
    },

    getNotesModal() {
        return `
            <div id="modal-notes" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">📝 Mis Notas</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition cursor-pointer" data-modal-close="notes" aria-label="Cerrar">&times;</button>
                        </div>
                        <div class="sync-badge mb-4"></div>
                        <textarea 
                            id="notesTextarea" 
                            class="w-full h-64 p-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500" 
                            placeholder="Escribe tus notas del viaje aquí..."
                        ></textarea>
                        <button 
                            id="saveNotesBtn" 
                            class="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
                        >
                            💾 Guardar Notas
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};
