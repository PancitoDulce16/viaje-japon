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
            ${this.getActivityModal()}
            ${this.getAuthModal()}
            ${this.getEmergencyModal()}
            ${this.getBudgetModal()}
            ${this.getChatModal()}
            ${this.getPhrasesModal()}
            ${this.getNotesModal()}
            ${this.getPackingListModal()}
            ${this.getFavoritesModal()}
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

            // El formulario de crear viaje ahora se maneja en trips-manager.js
            // Ya no hay un solo formulario, sino dos opciones

            // Setup Activity Form - YA NO SE NECESITA AQUÍ
            // El event listener se maneja en itinerary.js para evitar duplicados
        }, 100);
    },

    getActivityModal() {
        return `
            <div id="activityModal" class="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 hidden animate__animated animate__fadeIn" style="z-index: 10001;">
                <div class="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 animate__animated animate__slideInUp">
                    <div class="flex justify-between items-center mb-4">
                        <h2 id="activityModalTitle" class="text-2xl font-bold dark:text-white">Añadir Actividad</h2>
                        <button onclick="ItineraryHandler.closeActivityModal()" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>
                    <form id="activityForm">
                        <input type="hidden" id="activityId">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label for="activityDay" class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">📅 Día</label>
                                <select id="activityDay" class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-semibold">
                                    <!-- Se llenará dinámicamente -->
                                </select>
                            </div>
                            <div>
                                <label for="activityIcon" class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">Icono</label>
                                <input type="text" id="activityIcon" placeholder="✈️" class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            </div>
                            <div>
                                <label for="activityTime" class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">Hora</label>
                                <input type="text" id="activityTime" placeholder="8:00 AM" class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            </div>
                        </div>
                        <div class="mt-4 relative">
                            <label for="activityTitle" class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">Título</label>
                            <input type="text" id="activityTitle" required placeholder="Narita Express → Shinjuku" class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" autocomplete="off">
                            <!-- Autocomplete Dropdown -->
                            <div id="activityTitleAutocomplete" class="hidden absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto"></div>
                        </div>
                        <div class="mt-4">
                            <label for="activityDesc" class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">Descripción</label>
                            <textarea id="activityDesc" rows="3" placeholder="Tren cubierto por JR Pass." class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label for="activityCost" class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">Costo (JPY)</label>
                                <input type="number" id="activityCost" placeholder="3200" class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            </div>
                            <div>
                                <label for="activityStation" class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">Estación</label>
                                <input type="text" id="activityStation" placeholder="Shinjuku Station" class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end gap-4">
                            <button type="button" onclick="ItineraryHandler.closeActivityModal()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition">Cancelar</button>
                            <button type="submit" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    getAuthModal() {
        return `
            <div id="modal-auth" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">Iniciar Sesión</h2>
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
                                <label class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
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
                                <label class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
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
                                <label class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
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
                                <label class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
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
                                <label class="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
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
                            <div class="p-3 bg-yellow-50 dark:bg-yellow-800 rounded-lg mb-3">
                                <p class="text-xs text-gray-700 dark:text-white">
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
                        <div class="mt-6 p-3 bg-blue-50 dark:bg-blue-800 rounded-lg">
                            <p class="text-xs text-gray-600 dark:text-gray-200">
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
                            <h2 class="text-2xl font-bold text-red-600 dark:text-red-400">Emergencias</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="emergency" aria-label="Cerrar">&times;</button>
                        </div>
                        <div class="space-y-4">
                            <div class="p-4 bg-red-50 dark:bg-red-800 rounded-lg border-l-4 border-red-500">
                                <h3 class="font-bold text-lg mb-3 dark:text-white">Japón</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center">
                                        <span class="dark:text-white">🚓 Policía:</span>
                                        <a href="tel:110" class="text-2xl font-bold text-red-600 dark:text-red-200 hover:underline">110</a>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="dark:text-white">🚑 Ambulancia/Bomberos:</span>
                                        <a href="tel:119" class="text-2xl font-bold text-red-600 dark:text-red-200 hover:underline">119</a>
                                    </div>
                                </div>
                            </div>
                            <div class="p-4 bg-blue-50 dark:bg-blue-800 rounded-lg">
                                <h3 class="font-bold mb-2 dark:text-white">🇨🇷 Embajada Costa Rica</h3>
                                <p class="text-sm dark:text-white">📞 <a href="tel:+81-3-3486-1812" class="font-semibold hover:underline">+81-3-3486-1812</a></p>
                                <p class="text-xs text-gray-600 dark:text-gray-200 mt-1">Shibuya-ku, Tokyo</p>
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
                        <!-- Sin <h2> propio: bento-budget.js ya renderiza su
                             cabecera dentro de #budgetModalContent, así que
                             había DOS títulos apilados. Queda solo el cierre. -->
                        <button class="jp-modal-close modal-close" data-modal-close="budget" aria-label="Cerrar presupuesto">&times;</button>
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
                            <h2 class="text-2xl font-bold dark:text-white">Frases Útiles</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="phrases" aria-label="Cerrar">&times;</button>
                        </div>
                        <div class="space-y-3 max-h-96 overflow-y-auto">
                            ${phrases.map(p => `
                                <div class="p-3 bg-blue-50 dark:bg-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-700 transition cursor-pointer">
                                    <p class="font-semibold dark:text-white">${escapeHtml(p.jp)}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-100">${escapeHtml(p.es)}</p>
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
                <div class="jp-create-modal shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="createTripHeading">
                    <div class="jp-create-pad">
                        <div class="flex justify-between items-start jp-create-headrow">
                            <div class="flex items-start gap-3">
                                <span class="jp-create-stamp" aria-hidden="true">
                                    <svg width="32" height="26" viewBox="0 0 32 26">
                                        <path d="M2 3 a1.6 1.6 0 010 3.2 a1.6 1.6 0 010 3.2 a1.6 1.6 0 010 3.2 a1.6 1.6 0 010 3.2 a1.6 1.6 0 010 3.2 L30 22 a1.6 1.6 0 010-3.2 a1.6 1.6 0 010-3.2 a1.6 1.6 0 010-3.2 a1.6 1.6 0 010-3.2 a1.6 1.6 0 010-3.2 Z" fill="none" stroke="#C9BBA8" stroke-width="1.2"/>
                                        <rect x="5.5" y="5.5" width="21" height="15" fill="none" stroke="#B8A88F" stroke-width="0.9"/>
                                        <g transform="translate(16 13) rotate(-38) translate(-12 -12)" fill="#F4A6C6">
                                            <path d="M21 13.5v-1.7l-6.5-4V4.2c0-.7-.55-1.2-1.2-1.2s-1.2.5-1.2 1.2v3.6l-6.5 4v1.7l6.5-2V15l-2 1.2v1.2l3.2-.8 3.2.8v-1.2L15 15v-3.5z"/>
                                        </g>
                                    </svg>
                                </span>
                                <div>
                                    <h2 id="createTripHeading" class="jp-create-title">Crear Nuevo Viaje</h2>
                                    <p class="jp-create-sub">Elige cómo quieres comenzar tu próxima aventura</p>
                                </div>
                            </div>
                            <button type="button" onclick="TripsManager.closeCreateTripModal()" class="jp-create-close" aria-label="Cerrar">&times;</button>
                        </div>
                        <svg class="jp-postmark" viewBox="0 0 300 190" aria-hidden="true">
                            <g fill="none" stroke="#9C8FA6" stroke-width="1.6" stroke-linecap="round" opacity="0.55">
                                <path d="M6 46 Q40 30 74 46 T142 46"/>
                                <path d="M6 66 Q40 50 74 66 T142 66"/>
                                <path d="M6 86 Q40 70 74 86 T142 86"/>
                            </g>
                            <g transform="translate(205,95)" opacity="0.55">
                                <circle r="72" fill="none" stroke="#9C8FA6" stroke-width="2"/>
                                <circle r="63" fill="none" stroke="#9C8FA6" stroke-width="1.2"/>
                                <text x="0" y="-34" text-anchor="middle" font-size="20" font-weight="700" fill="#9C8FA6" font-family="var(--jp-font-display)">日本</text>
                                <path d="M-34 18 L-14 -14 L2 8 L18 -22 L38 18 Z" fill="none" stroke="#9C8FA6" stroke-width="2.4" stroke-linejoin="round"/>
                                <circle cx="18" cy="-22" r="3" fill="#E8A3B3" stroke="none"/>
                                <text x="0" y="46" text-anchor="middle" font-size="15" font-weight="700" letter-spacing="2" fill="#9C8FA6" font-family="var(--jp-font-display)">JAPAN</text>
                            </g>
                        </svg>

                        <!-- Selección de Tipo de Viaje — cada BOLETO es una ilustración
                             completa (Nano Banana) para su mitad superior; el HTML posa
                             la tinta encima y continúa el papel hacia abajo con el
                             checklist y el botón, reales y reales. -->
                        <div id="tripTypeSelection">
                            <div class="jps-head">
                                <img class="jps-head__cat" src="/images/illustrations/generated/components/tk-cathead-final.png" alt="" aria-hidden="true">
                                <h3>¿Cómo quieres comenzar tu aventura? <span class="jps-head__flower" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em"><g fill="#F4A6C6"><ellipse cx="12" cy="7" rx="3.4" ry="4.2" transform="rotate(0 12 7)"/><ellipse cx="12" cy="7" rx="3.4" ry="4.2" transform="rotate(72 12 12)"/><ellipse cx="12" cy="7" rx="3.4" ry="4.2" transform="rotate(144 12 12)"/><ellipse cx="12" cy="7" rx="3.4" ry="4.2" transform="rotate(216 12 12)"/><ellipse cx="12" cy="7" rx="3.4" ry="4.2" transform="rotate(288 12 12)"/></g><circle cx="12" cy="12" r="2.2" fill="#F7C9DE"/></svg></span></h3>
                                <img class="jps-head__dog" src="/images/illustrations/generated/components/tk-doghead-final.png" alt="" aria-hidden="true">
                                <p>Elige la opción que mejor se adapte a tu viaje.</p>
                            </div>

                            <div class="jps-tickets">
                                <!-- BOLETO 1: Viaje Simple -->
                                <button type="button" class="jps-card jps-card--simple"
                                        aria-label="Viaje Simple: solo nombre y fechas, listo en 30 segundos. Incluye: solo necesito lo básico, empieza a construir tu itinerario cuando quieras, añade ciudades y actividades después."
                                        onclick="TripsManager.showSimpleTripForm()">
                                    <span class="jps-card__stub" aria-hidden="true"></span>
                                    <span class="jps-stubtext"><span>IT'S TIME TO EXPLORE</span></span>
                                    <span class="jps-card__top" aria-hidden="true">
                                        <img class="jps-card__img" src="/images/illustrations/generated/components/tk-simple-crop-head.webp" alt="" draggable="false">
                                        <span class="jps-card__ink">
                                            <span class="jps-badge">Tu viaje, a tu manera</span>
                                            <span class="jps-title">Viaje Simple</span>
                                        </span>
                                    </span>
                                    <span class="jps-body">
                                        <span class="jps-desc">Para cuando quieres empezar a soñar primero y organizar después.</span>
                                        <span class="jps-divider" aria-hidden="true"></span>
                                        <span class="jps-includes"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Incluye</span>
                                        <span class="jps-check"><span class="jps-check__dot"><svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>Solo necesito lo básico (nombre y fechas)</span>
                                        <span class="jps-check"><span class="jps-check__dot"><svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>Empieza a construir tu itinerario cuando quieras</span>
                                        <span class="jps-check"><span class="jps-check__dot"><svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>Añade ciudades y actividades después</span>
                                        <span class="jps-timebadge" aria-hidden="true">
                                            <svg class="jps-timebadge__face" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2.2"/>
                                                <circle cx="50" cy="50" r="37" fill="none" stroke="currentColor" stroke-width="1.4"/>
                                                <path d="M50 5 L50 13 M50 87 L50 95 M5 50 L13 50 M87 50 L95 50 M18 18 L24 24 M76 76 L82 82 M18 82 L24 76 M76 24 L82 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                                                <path d="M50 3 L45 12 L55 12 Z" fill="currentColor"/>
                                            </svg>
                                            <span class="jps-timebadge__text"><b>~30</b><i>SEGUNDOS</i></span>
                                            <svg class="jps-timebadge__star" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l2.4 6.8L21 11l-6.6 2.2L12 20l-2.4-6.8L3 11l6.6-2.2z"/></svg>
                                        </span>
                                        <span class="jps-cta">Empezar Viaje Simple
                                            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                                        </span>
                                    </span>
                                </button>

                                <!-- BOLETO 2: Wizard Completo -->
                                <button type="button" class="jps-card jps-card--wizard"
                                        aria-label="Wizard Completo: cuéntale a Japitin qué te gusta y genera tu itinerario, 2 a 3 minutos. Incluye: destinos y conexiones, tus intereses y estilo de viaje, plantillas de viaje, itinerario generado automáticamente."
                                        onclick="TripsManager.showFullTripWizard()">
                                    <span class="jps-card__stub" aria-hidden="true"></span>
                                    <span class="jps-stubtext"><span>JAPITIN MAGIC</span></span>
                                    <span class="jps-card__top" aria-hidden="true">
                                        <img class="jps-card__img" src="/images/illustrations/generated/components/tk-wizard-crop-head-mirrored.webp" alt="" draggable="false">
                                        <span class="jps-card__ink">
                                            <span class="jps-badge">Todo listo para despegar</span>
                                            <span class="jps-title">Wizard Completo</span>
                                        </span>
                                    </span>
                                    <span class="jps-body">
                                        <span class="jps-desc">Cuéntame qué te gusta y Japitin preparará el viaje contigo.</span>
                                        <span class="jps-divider" aria-hidden="true"></span>
                                        <span class="jps-includes"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Incluye</span>
                                        <span class="jps-check"><span class="jps-check__dot"><svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>Destinos y conexiones</span>
                                        <span class="jps-check"><span class="jps-check__dot"><svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>Tus intereses y estilo de viaje</span>
                                        <span class="jps-check"><span class="jps-check__dot"><svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>Plantillas de viaje</span>
                                        <span class="jps-check"><span class="jps-check__dot"><svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>Itinerario generado automáticamente</span>
                                        <span class="jps-timebadge" aria-hidden="true">
                                            <svg class="jps-timebadge__face" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2.2"/>
                                                <circle cx="50" cy="50" r="37" fill="none" stroke="currentColor" stroke-width="1.4"/>
                                                <path d="M50 5 L50 13 M50 87 L50 95 M5 50 L13 50 M87 50 L95 50 M18 18 L24 24 M76 76 L82 82 M18 82 L24 76 M76 24 L82 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                                                <path d="M50 3 L45 12 L55 12 Z" fill="currentColor"/>
                                            </svg>
                                            <span class="jps-timebadge__text"><b>~2-3</b><i>MINUTOS</i></span>
                                            <svg class="jps-timebadge__star" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l2.4 6.8L21 11l-6.6 2.2L12 20l-2.4-6.8L3 11l6.6-2.2z"/></svg>
                                        </span>
                                        <span class="jps-cta">Crear mi itinerario completo
                                            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                                        </span>
                                    </span>
                                </button>
                            </div>

                            <!-- NOTA: papel plano + 2 stickers como capas FÍSICAS
                                 independientes que sobresalen del borde del papel
                                 (troquelados, con rotación y sombra propia) — no
                                 una sola ilustración plana. -->
                            <div class="jps-note">
                                <img class="jps-note__tape jps-note__tape--a" src="/images/illustrations/generated/components/note-tape-pink-final.png" alt="" aria-hidden="true">
                                <img class="jps-note__tape jps-note__tape--b" src="/images/illustrations/generated/components/note-tape-blue-final.png" alt="" aria-hidden="true">
                                <span class="jps-note__ink" aria-hidden="true">
                                    <b>¿No estás seguro?</b> Empieza con un Viaje Simple. <em>Puedes</em> convertirlo en una aventura completa cuando quieras.
                                </span>
                                <img class="jps-note__sticker jps-note__sticker--dog" src="/images/illustrations/generated/components/note-sticker-dog-v2.png" alt="" aria-hidden="true">
                                <img class="jps-note__sticker jps-note__sticker--cat" src="/images/illustrations/generated/components/note-sticker-cat-cutout.png" alt="" aria-hidden="true">
                            </div>
                        </div>

                        <!-- Formulario Simple (Hidden) -->
                        <div id="simpleTripForm" class="hidden">
                            <button 
                                onclick="document.getElementById('tripTypeSelection').classList.remove('hidden'); document.getElementById('simpleTripForm').classList.add('hidden');"
                                class="mb-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 jpf-back"
                            >
                                ← Volver a opciones
                            </button>

                            <form id="createTripFormSimple" class="space-y-6 jpf-form">
                                <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 jpf-main">
                                    <img class="jpf-cat" src="/images/illustrations/generated/characters/cat-suitcase.webp" alt="" aria-hidden="true">
                                    <div class="jpf-kicker">旅の記録 · Registro de aventura</div>
                                    <h3 class="font-bold text-xl mb-4 dark:text-white flex items-center gap-2 jpf-title">
                                        Tu próximo viaje
                                    </h3>
                                    <p class="jpf-lead">Ponle nombre a la historia y marca cuándo empieza.</p>
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Nombre del Viaje *
                                            </label>
                                            <input
                                                id="simpleTripName"
                                                type="text"
                                                required
                                                class="w-full p-3 border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:outline-none"
                                                placeholder="Ej: Aventura en Japón 2026"
                                            >
                                        </div>
                                        <div class="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Fecha de Inicio *
                                                </label>
                                                <input
                                                    id="simpleTripDateStart"
                                                    type="date"
                                                    required
                                                    class="w-full p-3 border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:outline-none"
                                                >
                                            </div>
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Fecha de Fin *
                                                </label>
                                                <input
                                                    id="simpleTripDateEnd"
                                                    type="date"
                                                    required
                                                    class="w-full p-3 border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:outline-none"
                                                >
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 🔥 NUEVO: Selector de Template -->
                                <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 jpf-template">
                                    <span class="jpf-template__stub" aria-hidden="true">JAPITIN PASS</span>
                                    <h3 class="font-bold text-xl mb-4 dark:text-white flex items-center gap-2">
                                        ¿Quieres una ruta preparada?
                                    </h3>
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                ¿Quieres usar una plantilla pre-hecha?
                                            </label>
                                            <select
                                                id="simpleTripTemplate"
                                                class="w-full p-3 border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-purple-500 focus:outline-none font-semibold"
                                            >
                                                <option value="">Sin plantilla · Itinerario vacío</option>
                                                <option value="otaku-paradise">Otaku Paradise · 16 días</option>
                                            </select>
                                        </div>
                                        <div class="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 text-sm jpf-tip">
                                            <p class="text-purple-900 dark:text-purple-200 font-semibold">
                                                💡 <strong>Tip:</strong> Las plantillas incluyen itinerarios completos con actividades, horarios, ubicaciones y coordenadas para el mapa. Puedes editarlo después.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex gap-4 jpf-actions">
                                    <button
                                        type="button"
                                        onclick="TripsManager.closeCreateTripModal()"
                                        class="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold jpf-cancel"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg jpf-submit"
                                    >
                                        ✨ Crear Viaje
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getTripsListModal() {
        return `
            <div id="modal-trips-list" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl z-10">
                        <div class="flex justify-between items-center">
                            <div>
                                <h2 class="text-3xl font-bold">Mis Viajes</h2>
                                <p class="text-sm text-white/80 mt-1">Gestiona todos tus viajes a Japón</p>
                            </div>
                            <button
                                onclick="TripsManager.closeTripsListModal()"
                                class="text-4xl hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition"
                                aria-label="Cerrar"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
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
                            <h2 class="text-2xl font-bold dark:text-white">Mis Notas</h2>
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
    },

    getPackingListModal() {
        return `
            <div id="modal-packing" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">Checklist de Equipaje</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="packing" aria-label="Cerrar">&times;</button>
                        </div>
                        <div id="packingListContainer"></div>
                    </div>
                </div>
            </div>
        `;
    },

    getFavoritesModal() {
        return `
            <div id="modal-favorites" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <!-- Sin <h2> propio: favorites-manager.js ya rotula
                             "Mis Favoritos" dentro del contenedor — el título
                             aparecía literalmente dos veces seguidas. -->
                        <button class="jp-modal-close modal-close" data-modal-close="favorites" aria-label="Cerrar favoritos">&times;</button>
                        <div id="favoritesListContainer"></div>
                    </div>
                </div>
            </div>
        `;
    },

    getChatModal() {
        return `
            <!-- El marco es mínimo a propósito: el chat trae su propia
                 cabecera de papel (.jc-head, css/chat-washi.css), así que
                 aquí solo queda el cierre. Antes había una segunda barra
                 blanca con "💬 Chat Grupal" encima, duplicando el título. -->
            <div id="modal-chat" class="modal">
                <div class="jc-shell">
                    <button class="jc-close modal-close" onclick="window.GroupChat.close()" aria-label="Cerrar chat">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                             stroke-width="3" stroke-linecap="round" aria-hidden="true">
                            <path d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                    <div id="chatModalContent"></div>
                </div>
            </div>
        `;
    }
};
