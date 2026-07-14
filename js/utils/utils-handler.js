// js/utils-handler.js - Handler para utilidades con sub-pestañas

export const UtilsHandler = {
    currentView: 'cultural', // cultural, practical, fun

    init() {
        console.log('🛠️ Inicializando Utils Handler...');
        this.render();
    },

    render() {
        const container = document.getElementById('content-utils');
        if (!container) {
            console.warn('⚠️ Container #content-utils no encontrado');
            return;
        }

        container.innerHTML = `
            <div class="max-w-7xl mx-auto p-4 md:p-6">
                <!-- Header -->
                <div class="mb-8">
                    <h2 class="text-4xl font-bold mb-3 text-gray-800 dark:text-white">🛠️ Utilidades para tu Viaje</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">
                        Herramientas culturales, prácticas y divertidas para tu aventura en Japón.
                    </p>

                    <!-- View Selector Tabs -->
                    <div class="flex gap-2 overflow-x-auto scrollbar-hide mb-6 border-b-2 border-gray-200 dark:border-gray-700">
                        <button
                            onclick="UtilsHandler.switchView('cultural')"
                            class="utils-tab px-6 py-3 font-semibold transition rounded-t-lg whitespace-nowrap ${this.currentView === 'cultural' ? 'bg-red-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
                        >
                            🎌 Cultural
                        </button>
                        <button
                            onclick="UtilsHandler.switchView('practical')"
                            class="utils-tab px-6 py-3 font-semibold transition rounded-t-lg whitespace-nowrap ${this.currentView === 'practical' ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
                        >
                            💼 Práctico
                        </button>
                        <button
                            onclick="UtilsHandler.switchView('fun')"
                            class="utils-tab px-6 py-3 font-semibold transition rounded-t-lg whitespace-nowrap ${this.currentView === 'fun' ? 'bg-purple-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
                        >
                            🎮 Diversión
                        </button>
                    </div>
                </div>

                <!-- Content Area -->
                <div id="utilsContent">
                    ${this.renderCurrentView()}
                </div>
            </div>
        `;

        // Inicializar funcionalidades del view actual
        this.initCurrentView();
    },

    renderCurrentView() {
        switch(this.currentView) {
            case 'cultural':
                return this.renderCulturalView();
            case 'practical':
                return this.renderPracticalView();
            case 'fun':
                return this.renderFunView();
            default:
                return '';
        }
    },

    switchView(view) {
        this.currentView = view;
        this.render();
    },

    // ============================================
    // CULTURAL VIEW
    // ============================================
    renderCulturalView() {
        return `
            <div class="space-y-4">
                ${this.renderAccordion('survival', '🆘', 'Survival Guide', 'Frases esenciales y emergencias')}
                ${this.renderAccordion('japanrules', '📌', '30 Reglas Anti-Error', 'Etiqueta japonesa esencial para evitar errores')}
                ${this.renderAccordion('festivals', '🎊', 'Festivales Locales', 'Matsuri y eventos por mes y ciudad')}
                ${this.renderAccordion('etiquette', '🙇', 'Guía de Etiqueta', 'Reglas de cortesía japonesa')}
                ${this.renderAccordion('phrases', '🗣️', 'Frases Útiles', 'Aprende japonés básico')}
                ${this.renderAccordion('onsen', '♨️', 'Guía de Onsen', 'Cómo usar baños termales')}
                ${this.renderAccordion('allergies', '⚠️', 'Tarjetas de Alergias', 'Comunica restricciones alimentarias')}
                ${this.renderAccordion('tips', '💴', 'Cultura de Propinas', 'Info sobre propinas en Japón')}
            </div>
        `;
    },

    // ============================================
    // PRACTICAL VIEW
    // ============================================
    renderPracticalView() {
        return `
            <div class="space-y-4">
                ${this.renderAccordion('countdown', '⏳', 'Contador de Días', '¿Cuánto falta para tu aventura?')}
                ${this.renderAccordion('jrpass', '🚄', 'JR Pass Calculator', '¿Te conviene comprar el Japan Rail Pass?')}
                ${this.renderAccordion('zonas', '🗾', 'Regiones de Japón', 'Guía de zonas: Kanto, Kansai, Hokkaido, etc.')}
                ${this.renderAccordion('horarios', '🕐', 'Control de Horarios', 'Horarios de apertura/cierre y días festivos')}
                ${this.renderAccordion('currency', '💸', 'Conversor de Moneda', 'JPY ↔ USD en tiempo real')}
                ${this.renderAccordion('timezone', '🕐', 'Zona Horaria', 'Hora en Japón vs tu país')}
                ${this.renderAccordion('weather', '🌤️', 'Clima', 'Pronóstico en Tokyo, Kyoto, Osaka')}
                ${this.renderAccordion('sizes', '👔', 'Conversor de Tallas', 'Ropa y zapatos USA → Japón')}
                ${this.renderAccordion('budget', '💰', 'División de Gastos', 'Administra presupuesto del grupo')}
                ${this.renderAccordion('reservations', '🎫', 'Mis Reservas', 'Hoteles, restaurantes, actividades')}
            </div>
        `;
    },

    // ============================================
    // FUN VIEW
    // ============================================
    renderFunView() {
        return `
            <div class="space-y-4">
                ${this.renderAccordion('ramen', '🍜', 'Ramen Passport', 'Colecciona y califica todos los ramen que pruebes')}
                ${this.renderAccordion('goshuin', '⛩️', 'Goshuin Book', 'Libro digital de sellos de templos y santuarios')}
                ${this.renderAccordion('timeline', '📱', 'Timeline Compartido', 'Feed de actividad del grupo en tiempo real')}
                ${this.renderAccordion('photogallery', '📸', 'Memorias Compartidas', 'Galería de fotos con comentarios y likes')}
                ${this.renderAccordion('achievements', '🎏', 'Tus Recuerdos', 'Momentos memorables de tu viaje, capturados como logros')}
                ${this.renderAccordion('polls', '🗳️', 'Sistema de Votaciones', 'Decide en grupo: restaurantes, actividades, etc.')}
                ${this.renderAccordion('journal', '📔', 'Diario de Viaje', 'Comparte tus experiencias diarias')}
                ${this.renderAccordion('quiz', '🎌', 'Quiz Cultural', 'Pon a prueba tu conocimiento')}
                ${this.renderAccordion('namegen', '🏯', 'Tu Nombre en Japonés', 'Convierte a Katakana')}
                ${this.renderAccordion('randomFood', '🍜', 'Restaurante Aleatorio', '¿Dónde comemos hoy?')}
                ${this.renderAccordion('foodDict', '📖', 'Diccionario de Comida', 'Nombres en japonés con fotos')}
                ${this.renderAccordion('bingo', '🎯', 'Bingo de Viaje', 'Completa experiencias típicas')}
                ${this.renderAccordion('stamps', '🎫', 'Colección de Sellos', 'Sella cada lugar que visitas')}
                ${this.renderAccordion('counter', '📊', 'Contador de Experiencias', 'Estadísticas de tu viaje')}
                ${this.renderAccordion('streaks', '✨', 'Momentos Registrados', 'Pequeños hábitos del viaje, sin presión')}
                ${this.renderAccordion('tags', '🏷️', 'Tags de Favoritos', 'Organiza lugares guardados')}
            </div>
        `;
    },

    // ============================================
    // HELPER: Render Accordion
    // ============================================
    renderAccordion(id, icon, title, description) {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <button onclick="UtilsHandler.toggleSection('${id}')" class="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">${icon}</span>
                        <div class="text-left">
                            <h3 class="text-xl font-bold text-gray-800 dark:text-white">${title}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${description}</p>
                        </div>
                    </div>
                    <svg id="${id}-chevron" class="w-6 h-6 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="${id}-content" class="hidden p-6 pt-0 border-t border-gray-200 dark:border-gray-700">
                    <div id="${id}Section"></div>
                </div>
            </div>
        `;
    },

    // ============================================
    // Toggle Section
    // ============================================
    toggleSection(sectionName) {
        const content = document.getElementById(`${sectionName}-content`);
        const chevron = document.getElementById(`${sectionName}-chevron`);

        if (!content || !chevron) return;

        const isHidden = content.classList.contains('hidden');

        if (isHidden) {
            content.classList.remove('hidden');
            chevron.style.transform = 'rotate(180deg)';
            this.loadSectionContent(sectionName);
        } else {
            content.classList.add('hidden');
            chevron.style.transform = 'rotate(0deg)';
        }
    },

    // ============================================
    // Load Section Content
    // ============================================
    loadSectionContent(sectionName) {
        const sectionDiv = document.getElementById(`${sectionName}Section`);
        if (!sectionDiv) return;

        // Festivals section
        if (window.Festivals && sectionName === 'festivals') {
            sectionDiv.innerHTML = window.Festivals.render();
        }

        // JapanUtils sections
        if (window.JapanUtils) {
            switch(sectionName) {
                case 'countdown':
                    sectionDiv.innerHTML = window.JapanUtils.renderCountdown();
                    window.JapanUtils.updateCountdown();
                    break;
                case 'jrpass':
                    sectionDiv.innerHTML = '<div id="jrpass-container"></div>';
                    setTimeout(() => window.JRPassUI.render('jrpass-container'), 100);
                    break;
                case 'zonas':
                    sectionDiv.innerHTML = `
                        <div style="text-align: center; padding: 40px 20px;">
                            <div style="font-size: 4rem; margin-bottom: 20px;">🗾</div>
                            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 12px;">Regiones de Japón</h3>
                            <p style="color: #6b7280; margin-bottom: 24px;">
                                Descubre las 9 regiones principales: clima, cultura, ciudades y qué esperar
                            </p>
                            <button onclick="ZonasUI.openModal()" class="view-horarios-btn">
                                🗺️ Explorar Regiones
                            </button>
                        </div>
                    `;
                    break;
                case 'horarios':
                    sectionDiv.innerHTML = `
                        <div style="text-align: center; padding: 40px 20px;">
                            <div style="font-size: 4rem; margin-bottom: 20px;">🕐</div>
                            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 12px;">Control de Horarios</h3>
                            <p style="color: #6b7280; margin-bottom: 24px;">
                                Consulta horarios típicos de lugares en Japón y días festivos importantes
                            </p>
                            <button onclick="HorariosUI.openModal()" class="view-horarios-btn">
                                📅 Ver Horarios y Festivos
                            </button>
                        </div>
                    `;
                    break;
                case 'tips':
                    sectionDiv.innerHTML = window.JapanUtils.renderTipCalculator();
                    setTimeout(() => window.JapanUtils.initTipCalculator(), 100);
                    break;
                case 'survival':
                    sectionDiv.innerHTML = `
                        <div style="text-align: center; padding: 40px 20px;">
                            <div style="font-size: 4rem; margin-bottom: 20px;">🆘</div>
                            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 12px;">Survival Guide</h3>
                            <p style="color: #6b7280; margin-bottom: 24px;">
                                Frases esenciales, números, emergencias y todo lo que necesitas para sobrevivir
                            </p>
                            <button onclick="SurvivalUI.openModal()" class="view-horarios-btn" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                                🗣️ Abrir Guía de Supervivencia
                            </button>
                        </div>
                    `;
                    break;
                case 'japanrules':
                    sectionDiv.innerHTML = `
                        <div style="text-align: center; padding: 40px 20px;">
                            <div style="font-size: 4rem; margin-bottom: 20px;">📌</div>
                            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 12px;">30 Reglas Anti-Error</h3>
                            <p style="color: #6b7280; margin-bottom: 24px;">
                                Etiqueta japonesa esencial para no meter la pata durante tu viaje
                            </p>
                            <button onclick="JapanRulesUI.openModal()" class="view-all-rules-btn" style="font-size: 1rem; padding: 12px 24px;">
                                📚 Ver todas las reglas
                            </button>
                        </div>
                    `;
                    break;
                case 'etiquette':
                    sectionDiv.innerHTML = window.JapanUtils.renderEtiquetteGuide();
                    break;
                case 'namegen':
                    sectionDiv.innerHTML = window.JapanUtils.renderNameGenerator();
                    break;
                case 'sizes':
                    sectionDiv.innerHTML = window.JapanUtils.renderSizeConverter();
                    break;
                case 'quiz':
                    sectionDiv.innerHTML = window.JapanUtils.renderCulturalQuiz();
                    window.JapanUtils.startQuiz();
                    break;
                case 'phrases':
                    sectionDiv.innerHTML = window.JapanUtils.renderDailyPhrases();
                    window.JapanUtils.showDailyPhrases();
                    break;
                case 'allergies':
                    sectionDiv.innerHTML = window.JapanUtils.renderAllergyCards();
                    break;
                case 'onsen':
                    sectionDiv.innerHTML = window.JapanUtils.renderOnsenGuide();
                    break;
                case 'ramen':
                    sectionDiv.innerHTML = '<div id="ramen-container"></div>';
                    setTimeout(() => window.RamenPassportUI.init('ramen-container'), 100);
                    break;
                case 'goshuin':
                    sectionDiv.innerHTML = '<div id="goshuin-container"></div>';
                    setTimeout(() => window.GoshuinBookUI.init('goshuin-container'), 100);
                    break;
                case 'randomFood':
                    sectionDiv.innerHTML = window.JapanUtils.renderRandomRestaurant();
                    break;
                case 'foodTracker':
                    sectionDiv.innerHTML = window.JapanUtils.renderFoodTracker();
                    window.JapanUtils.loadFoodTracker();
                    break;
                case 'bingo':
                    sectionDiv.innerHTML = window.JapanUtils.renderTravelBingo();
                    window.JapanUtils.loadBingo();
                    break;
                case 'foodDict':
                    sectionDiv.innerHTML = window.JapanUtils.renderFoodDictionary();
                    break;
                case 'stamps':
                    sectionDiv.innerHTML = window.JapanUtils.renderStampCollection();
                    window.JapanUtils.loadStamps();
                    break;
                case 'counter':
                    sectionDiv.innerHTML = window.JapanUtils.renderExperienceCounter();
                    window.JapanUtils.refreshExperienceCounter();
                    break;
                case 'streaks':
                    sectionDiv.innerHTML = window.JapanUtils.renderActivityStreak();
                    window.JapanUtils.loadStreaks();
                    break;
                case 'tags':
                    sectionDiv.innerHTML = window.JapanUtils.renderFavoriteTags();
                    break;
            }
        }

        // SocialFeatures sections
        if (window.SocialFeatures) {
            switch(sectionName) {
                case 'achievements':
                    sectionDiv.innerHTML = window.SocialFeatures.renderAchievements();
                    window.SocialFeatures.loadAchievements();
                    break;
                case 'polls':
                    sectionDiv.innerHTML = window.SocialFeatures.renderVotingSystem();
                    window.SocialFeatures.loadPolls();
                    break;
                case 'journal':
                    sectionDiv.innerHTML = window.SocialFeatures.renderJournal();
                    window.SocialFeatures.loadJournal();
                    break;
            }
        }

        // PhotoGallery section
        if (window.PhotoGallery && sectionName === 'photogallery') {
            sectionDiv.innerHTML = window.PhotoGallery.render();
            window.PhotoGallery.loadGallery();
        }

        // UserProfile section
        if (window.UserProfile && sectionName === 'profile') {
            sectionDiv.innerHTML = window.UserProfile.render();
            window.UserProfile.loadProfile();
        }

        // ActivityTimeline section
        if (window.ActivityTimeline && sectionName === 'timeline') {
            sectionDiv.innerHTML = window.ActivityTimeline.render();
            window.ActivityTimeline.loadTimeline();
        }

        // Currency converter (from utils.js)
        if (sectionName === 'currency') {
            sectionDiv.innerHTML = this.renderCurrencyConverter();
            if (window.AppUtils) {
                window.AppUtils.setupCurrencyConverter();
            }
        }

        // Timezone (from utils.js)
        if (sectionName === 'timezone') {
            sectionDiv.innerHTML = this.renderTimezone();
            if (window.AppUtils) {
                setTimeout(() => {
                    window.AppUtils.startClocks();
                }, 100);
            }
        }

        // Weather
        if (sectionName === 'weather') {
            sectionDiv.innerHTML = this.renderWeather();
            if (window.AppUtils) {
                window.AppUtils.loadWeatherData();
            }
        }

        // Budget
        if (sectionName === 'budget') {
            const tripId = window.currentTripId || localStorage.getItem('currentTripId');
            sectionDiv.innerHTML = `
                <div id="budgetTrackerContent" class="mb-6"></div>
                <div class="border-t border-gray-300 dark:border-gray-600 pt-6">
                    <h4 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                        <span>👥</span>
                        <span>División de Gastos entre Miembros</span>
                    </h4>
                    <div id="expenseSplitterContent"></div>
                </div>
            `;

            if (window.BudgetTracker) {
                setTimeout(() => {
                    window.BudgetTracker.initRealtimeSync();
                    window.BudgetTracker.renderInTab();
                }, 100);
            }

            if (window.ExpenseSplitter && tripId) {
                setTimeout(() => window.ExpenseSplitter.init(tripId), 150);
            }
        }

        // Reservations
        if (sectionName === 'reservations') {
            const tripId = window.currentTripId || localStorage.getItem('currentTripId');
            sectionDiv.innerHTML = `<div id="reservationsContent"></div>`;
            if (window.ReservationsManager && tripId) {
                setTimeout(() => window.ReservationsManager.init(tripId), 100);
            }
        }
    },

    // ============================================
    // Render helpers for existing sections
    // ============================================
    renderCurrencyConverter() {
        return `
            <div class="space-y-3">
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="text-xs text-emerald-700 dark:text-emerald-300 block mb-1 font-semibold">💵 USD (Dólares)</label>
                        <input
                            id="usdInput"
                            type="number"
                            class="w-full p-3 border-2 border-emerald-300 rounded-lg bg-white dark:bg-gray-800 dark:border-emerald-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:placeholder-gray-500 font-semibold text-lg"
                            placeholder="0.00"
                            step="0.01"
                        >
                    </div>
                    <div class="flex-1">
                        <label class="text-xs text-emerald-700 dark:text-emerald-300 block mb-1 font-semibold">💴 JPY (Yenes)</label>
                        <input
                            id="jpyInput"
                            type="number"
                            class="w-full p-3 border-2 border-emerald-300 rounded-lg bg-white dark:bg-gray-800 dark:border-emerald-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:placeholder-gray-500 font-semibold text-lg"
                            placeholder="0"
                            step="1"
                        >
                    </div>
                </div>
                <div class="flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                    <p class="text-xs text-emerald-700 dark:text-emerald-300 exchange-rate-text font-bold">
                        Cargando tasa de cambio...
                    </p>
                    <button
                        onclick="AppUtils.fetchExchangeRate().then(() => location.reload())"
                        class="text-xs bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-3 py-1 rounded-lg transition font-semibold shadow-md"
                        title="Actualizar tasa"
                    >
                        🔄 Actualizar
                    </button>
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <button class="quick-convert bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-lg transition text-sm font-bold shadow-md" data-amount="10">
                        💵 10 USD
                    </button>
                    <button class="quick-convert bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-lg transition text-sm font-bold shadow-md" data-amount="50">
                        💵 50 USD
                    </button>
                    <button class="quick-convert bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-lg transition text-sm font-bold shadow-md" data-amount="100">
                        💵 100 USD
                    </button>
                </div>
            </div>
        `;
    },

    renderTimezone() {
        return `
            <div class="space-y-4">
                <div class="p-4 bg-blue-50 dark:bg-blue-900/40 rounded-lg border dark:border-blue-700">
                    <p class="text-sm text-gray-600 dark:text-gray-200 mb-1 font-semibold">Costa Rica (GMT-6)</p>
                    <p id="crTime" class="text-2xl font-bold dark:text-white font-mono">--:--:--</p>
                </div>
                <div class="p-4 bg-red-50 dark:bg-red-900/40 rounded-lg border dark:border-red-700">
                    <p class="text-sm text-gray-600 dark:text-gray-200 mb-1 font-semibold">Japón (GMT+9)</p>
                    <p id="jpTime" class="text-2xl font-bold dark:text-white font-mono">--:--:--</p>
                </div>
                <p class="text-xs text-center text-gray-500 dark:text-gray-200 font-medium">
                    📍 Diferencia: <strong class="dark:text-white">15 horas</strong> adelante
                </p>
            </div>
        `;
    },

    renderWeather() {
        return `
            <div class="space-y-3">
                <div id="weather-tokyo" class="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg border dark:border-blue-700">
                    <div class="animate-pulse">
                        <div class="h-4 bg-gray-300 dark:bg-gray-500 rounded w-20 mb-2"></div>
                        <div class="h-6 bg-gray-300 dark:bg-gray-500 rounded w-32"></div>
                    </div>
                </div>
                <div id="weather-kyoto" class="p-3 bg-purple-50 dark:bg-purple-900/40 rounded-lg border dark:border-purple-700">
                    <div class="animate-pulse">
                        <div class="h-4 bg-gray-300 dark:bg-gray-500 rounded w-20 mb-2"></div>
                        <div class="h-6 bg-gray-300 dark:bg-gray-500 rounded w-32"></div>
                    </div>
                </div>
                <div id="weather-osaka" class="p-3 bg-orange-50 dark:bg-orange-900/40 rounded-lg border dark:border-orange-700">
                    <div class="animate-pulse">
                        <div class="h-4 bg-gray-300 dark:bg-gray-500 rounded w-20 mb-2"></div>
                        <div class="h-6 bg-gray-300 dark:bg-gray-500 rounded w-32"></div>
                    </div>
                </div>
                <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg text-sm border dark:border-gray-500">
                    <p class="font-semibold mb-2 dark:text-white">👕 Qué llevar:</p>
                    <ul class="space-y-1 text-gray-600 dark:text-gray-100 text-xs font-medium">
                        <li>• Abrigo o chamarra</li>
                        <li>• Suéteres y capas</li>
                        <li>• Pantalones largos</li>
                        <li>• Paraguas (puede llover)</li>
                    </ul>
                </div>
            </div>
        `;
    },

    initCurrentView() {
        // Cualquier inicialización específica por view
    }
};

// Exportar para uso global
window.UtilsHandler = UtilsHandler;
