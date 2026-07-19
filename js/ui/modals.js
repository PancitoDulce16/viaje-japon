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
                            <h2 class="text-2xl font-bold text-red-600 dark:text-red-400">🚨 Emergencias</h2>
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
                <div class="jp-create-modal shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-8">
                        <div class="flex justify-between items-start mb-6">
                            <div class="flex items-start gap-3">
                                <span class="jp-create-stamp" aria-hidden="true">
                                    <svg width="26" height="18" viewBox="0 0 30 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 L12 4 Q15 2 18 4 L28 12 Z"/><path d="M9 8 L15 4 L21 8"/></svg>
                                </span>
                                <div>
                                    <h2 class="jp-create-title">Crear Nuevo Viaje</h2>
                                    <p class="jp-create-sub">Elige cómo quieres comenzar tu próxima aventura</p>
                                </div>
                            </div>
                            <button onclick="TripsManager.closeCreateTripModal()" class="jp-create-close" aria-label="Cerrar">&times;</button>
                        </div>

                        <!-- Selección de Tipo de Viaje — dos tickets boarding-pass -->
                        <div id="tripTypeSelection">
                            <div class="jp-chooser__head">
                                <img class="jp-chooser__cat" src="/images/illustrations/generated/characters/cat-explorer.webp" alt="" aria-hidden="true">
                                <h3>¿Cómo quieres comenzar tu aventura? <span>✿</span></h3>
                                <p>Elige la opción que mejor se adapte a tu viaje.</p>
                            </div>

                            <div class="jp-tickets">
                                <!-- Ticket 1: Viaje Simple -->
                                <div class="jp-ticket jp-ticket--simple" role="button" tabindex="0"
                                     onclick="TripsManager.showSimpleTripForm()"
                                     onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}">
                                    <span class="jp-ticket__stub"><span>IT'S TIME TO EXPLORE</span></span>
                                    <span class="jp-ticket__body">
                                        <span class="jp-ticket__stamp">~30<small>SEG</small></span>
                                        <span class="jp-ticket__badge">TU VIAJE, A TU MANERA</span>
                                        <span class="jp-ticket__top">
                                            <span class="jp-ticket__title">Viaje<br>Simple</span>
                                            <img class="jp-ticket__cat" src="/images/illustrations/generated/characters/cat-explorer.webp" alt="">
                                        </span>
                                        <span class="jp-ticket__desc">Para cuando quieres empezar a soñar primero y organizar después.</span>
                                        <span class="jp-ticket__incluye">Incluye</span>
                                        <span class="jp-ticket__list">
                                            <span class="jp-ticket__li">Solo lo básico: nombre y fechas</span>
                                            <span class="jp-ticket__li">Construye tu itinerario cuando quieras</span>
                                            <span class="jp-ticket__li">Añade ciudades y actividades después</span>
                                        </span>
                                        <span class="jp-ticket__cta">Empezar Viaje Simple <span aria-hidden="true">→</span></span>
                                    </span>
                                </div>

                                <!-- Ticket 2: Wizard Completo -->
                                <div class="jp-ticket jp-ticket--wizard" role="button" tabindex="0"
                                     onclick="TripsManager.showFullTripWizard()"
                                     onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}">
                                    <span class="jp-ticket__stub"><span>JAPITIN MAGIC</span></span>
                                    <span class="jp-ticket__body">
                                        <span class="jp-ticket__stamp">~2-3<small>MIN</small></span>
                                        <span class="jp-ticket__badge">TODO LISTO PARA DESPEGAR</span>
                                        <span class="jp-ticket__top">
                                            <span class="jp-ticket__title">Wizard<br>Completo</span>
                                            <img class="jp-ticket__cat" src="/images/illustrations/generated/characters/cat-wizard.webp" alt="">
                                        </span>
                                        <span class="jp-ticket__desc">Cuéntame qué te gusta y Japitin preparará el viaje contigo.</span>
                                        <span class="jp-ticket__incluye">Incluye</span>
                                        <span class="jp-ticket__list">
                                            <span class="jp-ticket__li">Destinos y conexiones</span>
                                            <span class="jp-ticket__li">Tus intereses y estilo de viaje</span>
                                            <span class="jp-ticket__li">Plantillas de viaje</span>
                                            <span class="jp-ticket__li">Itinerario generado automáticamente</span>
                                        </span>
                                        <span class="jp-ticket__cta">Crear mi itinerario completo <span aria-hidden="true">→</span></span>
                                    </span>
                                </div>
                            </div>

                            <div class="jp-chooser__note">
                                <span class="jp-chooser__tape jp-chooser__tape--l" aria-hidden="true"></span>
                                <span class="jp-chooser__tape jp-chooser__tape--r" aria-hidden="true"></span>
                                <b>¿No estás segura?</b> Empieza con un Viaje Simple — puedes convertirlo en una aventura completa cuando quieras.
                            </div>
                        </div>

                        <!-- Formulario Simple (Hidden) -->
                        <div id="simpleTripForm" class="hidden">
                            <button 
                                onclick="document.getElementById('tripTypeSelection').classList.remove('hidden'); document.getElementById('simpleTripForm').classList.add('hidden');"
                                class="mb-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                            >
                                ← Volver a opciones
                            </button>

                            <form id="createTripFormSimple" class="space-y-6">
                                <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                                    <h3 class="font-bold text-xl mb-4 dark:text-white flex items-center gap-2">
                                        📝 Información Básica
                                    </h3>
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
                                <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
                                    <h3 class="font-bold text-xl mb-4 dark:text-white flex items-center gap-2">
                                        ✨ Plantilla de Itinerario
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
                                                <option value="">🔲 Sin Plantilla (Itinerario vacío)</option>
                                                <option value="otaku-paradise">🎮 Otaku Paradise - Gaming & Culture (16 días)</option>
                                            </select>
                                        </div>
                                        <div class="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 text-sm">
                                            <p class="text-purple-900 dark:text-purple-200 font-semibold">
                                                💡 <strong>Tip:</strong> Las plantillas incluyen itinerarios completos con actividades, horarios, ubicaciones y coordenadas para el mapa. Puedes editarlo después.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex gap-4">
                                    <button
                                        type="button"
                                        onclick="TripsManager.closeCreateTripModal()"
                                        class="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
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
                                <h2 class="text-3xl font-bold">🗂️ Mis Viajes</h2>
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
    },

    getPackingListModal() {
        return `
            <div id="modal-packing" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">🎒 Checklist de Equipaje</h2>
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
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">⭐ Mis Favoritos</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="favorites" aria-label="Cerrar">&times;</button>
                        </div>
                        <div id="favoritesListContainer"></div>
                    </div>
                </div>
            </div>
        `;
    },

    getChatModal() {
        return `
            <div id="modal-chat" class="modal">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full">
                    <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <h2 class="text-2xl font-bold dark:text-white">💬 Chat Grupal</h2>
                        <button class="modal-close text-3xl hover:text-red-600 transition" onclick="window.GroupChat.close()" aria-label="Cerrar">&times;</button>
                    </div>
                    <div id="chatModalContent"></div>
                </div>
            </div>
        `;
    }
};
