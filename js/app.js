/* ===================================
   APLICACIÓN PRINCIPAL - VIAJE A JAPÓN
   =================================== */

// CORE APP - Funcionalidades principales
const AppCore = {
    state: {
        currentDay: 1,
        currentTab: 'itinerary',
        checkedActivities: {},
        darkMode: false
    },

    init() {
        console.log('🇯🇵 Iniciando app Viaje a Japón...');
        this.loadState();
        this.setupEventListeners();
        this.updateCountdown();
        this.renderItinerary();
        this.renderAllTabs();
        
        // Update countdown cada minuto
        setInterval(() => this.updateCountdown(), 60000);
        
        console.log('✅ App inicializada correctamente');
    },

    loadState() {
        try {
            this.state.checkedActivities = JSON.parse(localStorage.getItem('checkedActivities') || '{}');
            this.state.darkMode = localStorage.getItem('darkMode') === 'true';
            
            if (this.state.darkMode) {
                document.documentElement.classList.add('dark');
                document.getElementById('darkModeIcon').textContent = '☀️';
            }
        } catch (error) {
            console.error('Error loading state:', error);
        }
    },

    setupEventListeners() {
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    },

    toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        this.state.darkMode = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', this.state.darkMode);
        document.getElementById('darkModeIcon').textContent = this.state.darkMode ? '☀️' : '🌙';
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        const content = document.getElementById('content-' + tabName);
        const btn = document.getElementById('tab-' + tabName);
        
        if (content) content.classList.remove('hidden');
        if (btn) btn.classList.add('active');
        
        this.state.currentTab = tabName;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    updateCountdown() {
        const tripStart = new Date('2025-02-16');
        const now = new Date();
        const diff = tripStart - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const elem = document.getElementById('countdown');
        
        if (!elem) return;
        
        if (days > 0) {
            elem.textContent = `Faltan ${days} días`;
        } else if (days === 0) {
            elem.textContent = '¡HOY es el día!';
        } else {
            const currentDay = Math.abs(days) + 1;
            if (currentDay <= 15) {
                elem.textContent = `Día ${currentDay} de 15`;
            } else {
                elem.textContent = 'Viaje completado ✓';
            }
        }
    },

    // ITINERARY RENDERING
    renderItinerary() {
        this.renderDaySelector();
        this.selectDay(1);
    },

    renderDaySelector() {
        const selector = document.getElementById('daySelector');
        if (!selector) return;
        
        selector.innerHTML = ITINERARY_DATA.map(day => `
            <button 
                onclick="AppCore.selectDay(${day.day})"
                class="day-btn px-3 md:px-4 py-2 rounded-lg whitespace-nowrap font-medium text-sm transition ${
                    this.state.currentDay === day.day 
                        ? 'bg-red-600 text-white shadow-md scale-105' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }"
            >
                Día ${day.day}
            </button>
        `).join('');
    },

    selectDay(dayNumber) {
        this.state.currentDay = dayNumber;
        const day = ITINERARY_DATA.find(d => d.day === dayNumber);
        if (!day) return;
        
        this.renderDaySelector();
        this.renderDayOverview(day);
        this.renderActivities(day);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderDayOverview(day) {
        const overview = document.getElementById('dayOverview');
        if (!overview) return;
        
        const completedActivities = day.activities.filter(a => this.state.checkedActivities[a.id]).length;
        const progress = (completedActivities / day.activities.length) * 100;
        
        overview.innerHTML = `
            <div class="flex items-center gap-2 mb-4">
                <span class="text-2xl">📅</span>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Día ${day.day}</h2>
            </div>
            
            <div class="mb-4">
                <div class="flex justify-between text-sm mb-1 dark:text-gray-300">
                    <span>Progreso</span>
                    <span>${completedActivities}/${day.activities.length}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            
            <div class="space-y-3 text-sm">
                <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Fecha</p>
                    <p class="font-semibold text-base dark:text-white">${day.date}</p>
                </div>
                
                <div class="p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border-l-4 border-red-500">
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Título</p>
                    <p class="font-bold text-base text-red-600 dark:text-red-400">${day.title}</p>
                </div>
                
                <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Ubicación</p>
                    <p class="font-semibold flex items-center gap-2 dark:text-white">
                        <span class="text-lg">📍</span> 
                        <span>${day.location}</span>
                    </p>
                </div>
                
                <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-l-4 border-green-500">
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-2">Presupuesto</p>
                    <p class="text-3xl font-bold text-green-600 dark:text-green-400">$${day.budget}</p>
                </div>
                
                <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Hotel</p>
                    <p class="font-semibold text-sm dark:text-white">${day.hotel}</p>
                </div>
            </div>
        `;
    },

    renderActivities(day) {
        const timeline = document.getElementById('activitiesTimeline');
        if (!timeline) return;
        
        timeline.innerHTML = day.activities.map((activity, index) => {
            const isChecked = this.state.checkedActivities[activity.id];
            return `
                <div class="activity-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-l-4 border-red-500 fade-in ${isChecked ? 'checkbox-done' : ''}" 
                     style="animation-delay: ${index * 0.05}s">
                    <div class="p-5">
                        <div class="flex items-start gap-4">
                            <input 
                                type="checkbox" 
                                ${isChecked ? 'checked' : ''} 
                                onchange="AppCore.toggleActivity('${activity.id}')"
                                class="mt-1 w-5 h-5 cursor-pointer accent-red-600"
                            >
                            
                            <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg flex-shrink-0 text-2xl">
                                ${activity.icon}
                            </div>
                            
                            <div class="flex-1 min-w-0">
                                <div class="flex flex-col gap-3">
                                    <div class="flex items-start justify-between gap-4">
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="text-base">🕐</span>
                                                <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">${activity.time}</span>
                                            </div>
                                            <h3 class="activity-title text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 leading-tight">
                                                ${this.escapeHtml(activity.title)}
                                            </h3>
                                            <p class="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">${this.escapeHtml(activity.desc)}</p>
                                        </div>
                                        
                                        <div class="flex-shrink-0">
                                            ${activity.cost > 0 
                                                ? `<div class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap">$${activity.cost}</div>`
                                                : `<div class="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap">GRATIS</div>`
                                            }
                                        </div>
                                    </div>

                                    ${activity.train ? `
                                        <div class="train-info text-white p-4 rounded-lg text-sm shadow-md">
                                            <div class="flex items-center gap-2 mb-3">
                                                <span class="text-xl">🚆</span>
                                                <span class="font-bold text-base">Info de Tren</span>
                                            </div>
                                            <div class="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span class="opacity-75">Desde:</span>
                                                    <p class="font-semibold mt-1">${this.escapeHtml(activity.train.from)}</p>
                                                </div>
                                                <div>
                                                    <span class="opacity-75">Hasta:</span>
                                                    <p class="font-semibold mt-1">${this.escapeHtml(activity.train.to)}</p>
                                                </div>
                                                <div class="col-span-2">
                                                    <span class="opacity-75">Línea:</span>
                                                    <p class="font-semibold mt-1">${this.escapeHtml(activity.train.line)}</p>
                                                </div>
                                                <div class="col-span-2">
                                                    <span class="opacity-75">Duración:</span>
                                                    <p class="font-semibold mt-1">${activity.train.duration}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}

                                    ${activity.station ? `
                                        <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <span class="text-base">📍</span>
                                            <span>${this.escapeHtml(activity.station)}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    toggleActivity(activityId) {
        this.state.checkedActivities[activityId] = !this.state.checkedActivities[activityId];
        localStorage.setItem('checkedActivities', JSON.stringify(this.state.checkedActivities));
        
        const day = ITINERARY_DATA.find(d => d.day === this.state.currentDay);
        if (day) {
            this.renderActivities(day);
            this.renderDayOverview(day);
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // RENDER ALL TABS
    renderAllTabs() {
        this.renderFlightsTab();
        this.renderFoodTab();
        this.renderSouvenirsTab();
        this.renderUtilsTab();
        this.renderModals();
    },

    renderFlightsTab() {
        const container = document.getElementById('flightsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">✈️ Información de Vuelos</h2>
                
                <div class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-l-4 border-blue-500">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-3xl">🛫</span>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800 dark:text-white">Ida: Costa Rica → Japón</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-300">Domingo, 16 de Febrero 2025</p>
                        </div>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-gray-800 dark:text-white">Vuelo AM58</span>
                            <span class="badge badge-info">Aeroméxico</span>
                        </div>
                        <div class="grid grid-cols-3 gap-4 text-sm dark:text-gray-300">
                            <div>
                                <p class="text-gray-500 dark:text-gray-400">Salida</p>
                                <p class="font-semibold">MTY - Monterrey</p>
                            </div>
                            <div class="text-center">
                                <p class="text-gray-500 dark:text-gray-400">→</p>
                            </div>
                            <div class="text-right">
                                <p class="text-gray-500 dark:text-gray-400">Llegada</p>
                                <p class="font-semibold text-green-600 dark:text-green-400">NRT 6:30 AM</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-l-4 border-orange-500">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-3xl">🛬</span>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800 dark:text-white">Regreso: Japón → Costa Rica</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-300">Domingo, 2 de Marzo 2025</p>
                        </div>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-gray-800 dark:text-white">Vuelo AM58</span>
                            <span class="badge badge-warning">Aeroméxico</span>
                        </div>
                        <div class="mt-3 p-3 bg-red-50 dark:bg-red-900/30 rounded border-l-4 border-red-500">
                            <p class="text-sm font-semibold text-red-700 dark:text-red-300">⚠️ ¡IMPORTANTE!</p>
                            <p class="text-xs text-red-600 dark:text-red-400 mt-1">Wake up: 4:30 AM • Salida hotel: 5:30 AM • Vuelo: 9:30 AM</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderFoodTab() {
        const container = document.getElementById('foodContainer');
        if (!container) return;
        
        container.innerHTML = `
            <h2 class="text-3xl font-bold mb-2 text-gray-800 dark:text-white">🍱 Comida Japonesa por Región</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">Explora los platos típicos y rangos de precio</p>
            
            <div class="space-y-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover-lift">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-4xl">🗼</span>
                        <h3 class="text-2xl font-bold text-red-600 dark:text-red-400">Tokyo</h3>
                    </div>
                    <ul class="space-y-3">
                        <li class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span class="text-2xl flex-shrink-0">🍣</span>
                            <div>
                                <p class="font-bold dark:text-white">Sushi Edomae</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">¥2,000–¥10,000 • Sushi Dai (Toyosu Market)</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span class="text-2xl flex-shrink-0">🥞</span>
                            <div>
                                <p class="font-bold dark:text-white">Monjayaki</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">¥800–¥1,500 • Tsukishima Monja Street</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span class="text-2xl flex-shrink-0">🍤</span>
                            <div>
                                <p class="font-bold dark:text-white">Tempura</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">¥1,500–¥5,000 • Tenmatsu Ginza</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover-lift">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-4xl">⛩️</span>
                        <h3 class="text-2xl font-bold text-purple-600 dark:text-purple-400">Kyoto</h3>
                    </div>
                    <ul class="space-y-3">
                        <li class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span class="text-2xl flex-shrink-0">🍱</span>
                            <div>
                                <p class="font-bold dark:text-white">Kaiseki Ryori</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">¥5,000–¥15,000 • Gion Karyo</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span class="text-2xl flex-shrink-0">🍲</span>
                            <div>
                                <p class="font-bold dark:text-white">Yudofu</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">¥1,000–¥2,000 • Nanzenji Junsei</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span class="text-2xl flex-shrink-0">🍵</span>
                            <div>
                                <p class="font-bold dark:text-white">Matcha y Wagashi</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">¥500–¥1,500 • Ippodo Tea Co.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover-lift">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-4xl">🏯</span>
                        <h3 class="text-2xl font-bold text-orange-600 dark:text-orange-400">Osaka</h3>
                    </div>
                    <ul class="space-y-3">
                        <li class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span class="text-2xl flex-shrink-0">🐙</span>
                            <div>
                                <p class="font-bold dark:text-white">Takoyaki</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">¥400–¥800 • Wanaka Dotonbori</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span class="text-2xl flex-shrink-0">🥞</span>
                            <div>
                                <p class="font-bold dark:text-white">Okonomiyaki</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">¥800–¥1,500 • Mizuno</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span class="text-2xl flex-shrink-0">🍢</span>
                            <div>
                                <p class="font-bold dark:text-white">Kushikatsu</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">¥1,000–¥2,000 • Daruma Shinsekai</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    },

    renderSouvenirsTab() {
        const container = document.getElementById('souvenirsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <h2 class="text-3xl font-bold mb-2 text-gray-800 dark:text-white">🎁 Souvenirs Japoneses</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">Los recuerdos más populares y dónde encontrarlos</p>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-4xl">🎎</span>
                        <h3 class="text-xl font-bold text-yellow-600 dark:text-yellow-400">Tradicionales</h3>
                    </div>
                    <ul class="space-y-3 text-sm">
                        <li class="flex items-start gap-2">
                            <span class="text-lg">🌸</span>
                            <div>
                                <p class="font-semibold dark:text-white">Abanicos japoneses</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Kyoto - Tiendas de artesanía</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-lg">👘</span>
                            <div>
                                <p class="font-semibold dark:text-white">Furoshiki</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Asakusa Nakamise Street</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-lg">🥢</span>
                            <div>
                                <p class="font-semibold dark:text-white">Palillos decorativos</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Don Quijote, Daiso</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-pink-500">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-4xl">🐱</span>
                        <h3 class="text-xl font-bold text-pink-600 dark:text-pink-400">Kawaii</h3>
                    </div>
                    <ul class="space-y-3 text-sm">
                        <li class="flex items-start gap-2">
                            <span class="text-lg">🧸</span>
                            <div>
                                <p class="font-semibold dark:text-white">Peluches de personajes</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Pokémon Center, Sanrio</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-lg">✏️</span>
                            <div>
                                <p class="font-semibold dark:text-white">Papelería adorable</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Loft, Tokyu Hands</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-lg">👜</span>
                            <div>
                                <p class="font-semibold dark:text-white">Accesorios de moda</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Takeshita Street</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-4xl">📚</span>
                        <h3 class="text-xl font-bold text-blue-600 dark:text-blue-400">Anime & Manga</h3>
                    </div>
                    <ul class="space-y-3 text-sm">
                        <li class="flex items-start gap-2">
                            <span class="text-lg">🎭</span>
                            <div>
                                <p class="font-semibold dark:text-white">Figuras coleccionables</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Akihabara, Mandarake</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-lg">📖</span>
                            <div>
                                <p class="font-semibold dark:text-white">Mangas y artbooks</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Animate, Book-Off</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-green-500">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-4xl">🍬</span>
                        <h3 class="text-xl font-bold text-green-600 dark:text-green-400">Snacks</h3>
                    </div>
                    <ul class="space-y-3 text-sm">
                        <li class="flex items-start gap-2">
                            <span class="text-lg">🍫</span>
                            <div>
                                <p class="font-semibold dark:text-white">Kit Kat sabores japoneses</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Don Quijote, Aeropuerto</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-lg">🍘</span>
                            <div>
                                <p class="font-semibold dark:text-white">Galletas de arroz</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Konbinis, supermercados</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    },

    renderUtilsTab() {
        const container = document.getElementById('utilsContainer');
        if (!container) return;
        
        container.innerHTML = `
                <!-- CONTACTOS DE EMERGENCIA - SECCIÓN PRINCIPAL -->
                <div class="mb-8 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-lg p-6 border-l-4 border-red-600">
                    <h2 class="text-2xl font-bold mb-6 text-red-700 dark:text-red-400 flex items-center gap-3">
                        <span class="text-3xl">🚨</span>
                        Contactos de Emergencia
                    </h2>
                    
                    <div class="grid md:grid-cols-2 gap-6">
                        <!-- Emergencias Japón -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md">
                            <h3 class="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                                <span class="text-2xl">🇯🇵</span> Emergencias en Japón
                            </h3>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center p-3 bg-red-100 dark:bg-red-900/30 rounded">
                                    <span class="font-semibold dark:text-gray-300">🚓 Policía</span>
                                    <a href="tel:110" class="text-3xl font-bold text-red-600 dark:text-red-400 hover:text-red-700">110</a>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-red-100 dark:bg-red-900/30 rounded">
                                    <span class="font-semibold dark:text-gray-300">🚑 Ambulancia/Bomberos</span>
                                    <a href="tel:119" class="text-3xl font-bold text-red-600 dark:text-red-400 hover:text-red-700">119</a>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded">
                                    <span class="font-semibold text-sm dark:text-gray-300">📞 Japan Helpline (24/7)</span>
                                    <a href="tel:0570-000-911" class="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700">0570-000-911</a>
                                </div>
                            </div>
                        </div>
        
                        <!-- Embajada Costa Rica -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md">
                            <h3 class="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                                <span class="text-2xl">🇨🇷</span> Embajada Costa Rica
                            </h3>
                            <div class="space-y-2 text-sm">
                                <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded">
                                    <p class="font-semibold dark:text-white">📞 Desde Japón</p>
                                    <a href="tel:+81-3-3486-1812" class="text-blue-600 dark:text-blue-400 font-bold text-lg">+81-3-3486-1812</a>
                                </div>
                                <div class="p-3 bg-green-50 dark:bg-green-900/30 rounded">
                                    <p class="font-semibold dark:text-white">📞 Desde Costa Rica</p>
                                    <a href="tel:+506-2257-5855" class="text-green-600 dark:text-green-400 font-bold">+506-2257-5855</a>
                                    <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Cancillería CR (emergencias)</p>
                                </div>
                                <div class="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                    <p class="text-xs text-gray-600 dark:text-gray-400">📍 4-12-24 Nishi-Azabu, Minato-ku, Tokyo</p>
                                    <p class="text-xs text-gray-600 dark:text-gray-400">⏰ Lun-Vie: 9:30-12:30, 14:00-17:00</p>
                                </div>
                            </div>
                        </div>
        
                        <!-- Hospitales -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md">
                            <h3 class="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                                <span class="text-2xl">🏥</span> Clínicas con Inglés
                            </h3>
                            <div class="space-y-3 text-sm">
                                <div class="p-3 bg-green-50 dark:bg-green-900/30 rounded">
                                    <p class="font-bold dark:text-white">Tokyo Medical & Surgical</p>
                                    <a href="tel:+81-3-3436-3028" class="text-blue-600 dark:text-blue-400">📞 +81-3-3436-3028</a>
                                    <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Shiba, Minato-ku, Tokyo</p>
                                </div>
                                <div class="p-3 bg-green-50 dark:bg-green-900/30 rounded">
                                    <p class="font-bold dark:text-white">St. Luke's International</p>
                                    <a href="tel:+81-3-5550-7166" class="text-blue-600 dark:text-blue-400">📞 +81-3-5550-7166</a>
                                    <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Akashi-cho, Chuo-ku, Tokyo</p>
                                </div>
                                <div class="p-3 bg-green-50 dark:bg-green-900/30 rounded">
                                    <p class="font-bold dark:text-white">Kyoto City Hospital</p>
                                    <a href="tel:+81-75-311-5311" class="text-blue-600 dark:text-blue-400">📞 +81-75-311-5311</a>
                                    <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Nakagyo-ku, Kyoto</p>
                                </div>
                            </div>
                        </div>
        
                        <!-- Tarjetas de Crédito -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md">
                            <h3 class="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                                <span class="text-2xl">💳</span> Bloquear Tarjetas
                            </h3>
                            <div class="space-y-3 text-sm">
                                <div class="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded">
                                    <p class="font-bold text-blue-800 dark:text-blue-300">Visa</p>
                                    <a href="tel:+1-303-967-1096" class="text-blue-600 dark:text-blue-400">📞 +1-303-967-1096</a>
                                </div>
                                <div class="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded">
                                    <p class="font-bold text-orange-800 dark:text-orange-300">Mastercard</p>
                                    <a href="tel:+1-636-722-7111" class="text-blue-600 dark:text-blue-400">📞 +1-636-722-7111</a>
                                </div>
                                <div class="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded">
                                    <p class="font-bold text-blue-900 dark:text-blue-200">American Express</p>
                                    <a href="tel:+1-336-393-1111" class="text-blue-600 dark:text-blue-400">📞 +1-336-393-1111</a>
                                </div>
                                <div class="p-2 bg-red-100 dark:bg-red-900/40 rounded text-xs text-red-700 dark:text-red-300">
                                    ⚠️ ¡Llama INMEDIATAMENTE si pierdes tu tarjeta!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        
                <!-- INFORMACIÓN DE HOTELES -->
                <div class="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
                    <h2 class="text-2xl font-bold mb-6 text-purple-700 dark:text-purple-400 flex items-center gap-3">
                        <span class="text-3xl">🏨</span>
                        Información de Hoteles
                    </h2>
                    
                    <div class="grid md:grid-cols-2 gap-6">
                        <!-- Hotel 1: APA Shinjuku -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border-l-4 border-red-500">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-2xl">🗼</span>
                                <div>
                                    <h3 class="font-bold text-lg dark:text-white">APA Hotel Shinjuku Gyoemmae</h3>
                                    <p class="text-xs text-gray-600 dark:text-gray-400">Feb 16-19 (Días 1-3)</p>
                                </div>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex items-start gap-2">
                                    <span>📍</span>
                                    <div>
                                        <p class="dark:text-gray-300">2-8, Shinjuku 2-chome</p>
                                        <p class="text-xs text-gray-600 dark:text-gray-400">Shinjuku-ku, Tokyo 160-0022</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>📞</span>
                                    <a href="tel:+81-3-5369-3622" class="text-blue-600 dark:text-blue-400">+81-3-5369-3622</a>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>🚉</span>
                                    <p class="text-xs dark:text-gray-300">Shinjuku-Gyoemmae Station (Exit 1) - 1 min walk</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>🕐</span>
                                    <p class="text-xs dark:text-gray-300">Check-in: 3:00 PM • Check-out: 10:00 AM</p>
                                </div>
                            </div>
                        </div>
        
                        <!-- Hotel 2: Tune Stay Kyoto -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border-l-4 border-purple-500">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-2xl">⛩️</span>
                                <div>
                                    <h3 class="font-bold text-lg dark:text-white">TUNE STAY Kyoto</h3>
                                    <p class="text-xs text-gray-600 dark:text-gray-400">Feb 19-21 (Días 4-5)</p>
                                </div>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex items-start gap-2">
                                    <span>📍</span>
                                    <div>
                                        <p class="dark:text-gray-300">Shimogyo-Ku Nanajo Shinmachi</p>
                                        <p class="text-xs text-gray-600 dark:text-gray-400">Ebisuno-Cho 708, Kyoto 600-8310</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>📞</span>
                                    <a href="tel:+81-75-644-6660" class="text-blue-600 dark:text-blue-400">+81-75-644-6660</a>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>🚉</span>
                                    <p class="text-xs dark:text-gray-300">Kyoto Station - 5 min walk</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>🕐</span>
                                    <p class="text-xs dark:text-gray-300">Check-in: 4:00 PM • Check-out: 11:00 AM</p>
                                </div>
                            </div>
                        </div>
        
                        <!-- Hotel 3: Toyoko Inn Osaka -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border-l-4 border-orange-500">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-2xl">🏯</span>
                                <div>
                                    <h3 class="font-bold text-lg dark:text-white">Toyoko Inn Osaka Namba Nishi</h3>
                                    <p class="text-xs text-gray-600 dark:text-gray-400">Feb 21-24 (Días 6-7)</p>
                                </div>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex items-start gap-2">
                                    <span>📍</span>
                                    <div>
                                        <p class="dark:text-gray-300">2-8-7 Moto-Machi</p>
                                        <p class="text-xs text-gray-600 dark:text-gray-400">Naniwa-ku, Osaka 556-0016</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>📞</span>
                                    <p class="text-xs dark:text-gray-300">Ver en recepción del hotel</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>🚉</span>
                                    <p class="text-xs dark:text-gray-300">Namba Station - 3 min walk</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>🕐</span>
                                    <p class="text-xs dark:text-gray-300">Check-in: 3:00 PM • Check-out: 10:00 AM</p>
                                </div>
                            </div>
                        </div>
        
                        <!-- Hotel 4: APA Otsuka -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border-l-4 border-red-500">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-2xl">🗼</span>
                                <div>
                                    <h3 class="font-bold text-lg dark:text-white">APA Hotel Yamanote Otsuka Ekimae</h3>
                                    <p class="text-xs text-gray-600 dark:text-gray-400">Feb 24 - Mar 2 (Días 8-15)</p>
                                </div>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex items-start gap-2">
                                    <span>📍</span>
                                    <div>
                                        <p class="dark:text-gray-300">3-31-10, Minami-Otsuka</p>
                                        <p class="text-xs text-gray-600 dark:text-gray-400">Toshima-ku, Tokyo 170-0005</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>📞</span>
                                    <a href="tel:+81-3-5985-5911" class="text-blue-600 dark:text-blue-400">+81-3-5985-5911</a>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>🚉</span>
                                    <p class="text-xs dark:text-gray-300">Otsuka Station (South Exit) - 3 min walk</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>🕐</span>
                                    <p class="text-xs dark:text-gray-300">Check-in: 3:00 PM • Check-out: 10:00 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>
        
                    <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <p class="text-sm dark:text-gray-300">
                            💡 <strong>Tip:</strong> Guarda las direcciones en Google Maps antes del viaje. 
                            Muestra la dirección en japonés al taxista si lo necesitas.
                        </p>
                    </div>
                </div>
        
                <!-- RESTO DE UTILIDADES (conversor, clima, etc) -->
                <div class="grid md:grid-cols-2 gap-6">
                    
                    <!-- Currency Converter -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            💴 Conversor de Moneda
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-2 dark:text-gray-300">USD Dólares</label>
                                <input type="number" id="usdInput" class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0.00">
                            </div>
                            <div class="text-center text-2xl">⇅</div>
                            <div>
                                <label class="block text-sm font-medium mb-2 dark:text-gray-300">JPY Yenes</label>
                                <input type="number" id="jpyInput" class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0">
                            </div>
                            <div class="text-sm text-gray-600 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                Tasa: 1 USD = 143 JPY
                            </div>
                            <div class="grid grid-cols-3 gap-2">
                                <button onclick="AppUtils.quickConvert(10)" class="bg-blue-100 dark:bg-blue-900 p-2 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition">$10</button>
                                <button onclick="AppUtils.quickConvert(50)" class="bg-blue-100 dark:bg-blue-900 p-2 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition">$50</button>
                                <button onclick="AppUtils.quickConvert(100)" class="bg-blue-100 dark:bg-blue-900 p-2 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition">$100</button>
                            </div>
                        </div>
                    </div>
        
                    <!-- Weather -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            🌤️ Clima en Japón (Febrero)
                        </h3>
                        <div class="space-y-3">
                            <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <p class="font-semibold dark:text-white">Tokyo</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">5-12°C (41-54°F)</p>
                                    </div>
                                    <span class="text-3xl">🌤️</span>
                                </div>
                            </div>
                            <div class="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <p class="font-semibold dark:text-white">Kyoto</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">4-10°C (39-50°F)</p>
                                    </div>
                                    <span class="text-3xl">⛅</span>
                                </div>
                            </div>
                            <div class="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <p class="font-semibold dark:text-white">Osaka</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">5-11°C (41-52°F)</p>
                                    </div>
                                    <span class="text-3xl">🌥️</span>
                                </div>
                            </div>
                            <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                                <p class="font-semibold mb-2 dark:text-white">👕 Qué llevar:</p>
                                <ul class="space-y-1 text-gray-600 dark:text-gray-300">
                                    <li>• Abrigo o chamarra</li>
                                    <li>• Suéteres y capas</li>
                                    <li>• Pantalones largos</li>
                                    <li>• Paraguas (puede llover)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
        
                    <!-- Quick Actions -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:col-span-2">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            ⚡ Acciones Rápidas
                        </h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button onclick="AppModals.open('phrases')" class="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition">
                                <div class="text-2xl mb-1">🗣️</div>
                                <div class="text-sm font-semibold">Frases</div>
                            </button>
                            <button onclick="AppModals.open('emergency')" class="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition">
                                <div class="text-2xl mb-1">🚨</div>
                                <div class="text-sm font-semibold">SOS</div>
                            </button>
                            <button onclick="AppModals.open('budget')" class="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition">
                                <div class="text-2xl mb-1">💰</div>
                                <div class="text-sm font-semibold">Budget</div>
                            </button>
                            <button onclick="AppModals.open('notes')" class="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition">
                                <div class="text-2xl mb-1">📝</div>
                                <div class="text-sm font-semibold">Notas</div>
                            </button>
                        </div>
                    </div>
        
                </div>
            `;
        
            // Setup currency converter
            AppUtils.setupCurrencyConverter();
        }
        
        /* ============================================
           EL RESTO DE TU app.js SE QUEDA IGUAL
           No cambies nada más - solo este método
           ============================================ */


        
    },

    renderModals() {
        const container = document.getElementById('modalsContainer');
        if (!container) return;
        
        container.innerHTML = `
            ${this.getEmergencyModal()}
            ${this.getBudgetModal()}
            ${this.getPhrasesModal()}
            ${this.getNotesModal()}
        `;
    },

    getEmergencyModal() {
        return `
            <div id="modal-emergency" class="modal">
                <div class="modal-content max-w-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-red-600 dark:text-red-400">🚨 Emergencias</h2>
                        <button onclick="AppModals.close('emergency')" class="text-3xl hover:text-red-600">&times;</button>
                    </div>
                    <div class="space-y-4">
                        <div class="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border-l-4 border-red-500">
                            <h3 class="font-bold text-lg mb-3 dark:text-white">Japón</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="dark:text-gray-300">🚓 Policía:</span>
                                    <a href="tel:110" class="text-2xl font-bold text-red-600 dark:text-red-400">110</a>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="dark:text-gray-300">🚑 Ambulancia:</span>
                                    <a href="tel:119" class="text-2xl font-bold text-red-600 dark:text-red-400">119</a>
                                </div>
                            </div>
                        </div>
                        <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <h3 class="font-bold mb-2 dark:text-white">🇨🇷 Embajada Costa Rica</h3>
                            <p class="text-sm dark:text-gray-300">📞 <a href="tel:+81-3-3486-1812" class="font-semibold">+81-3-3486-1812</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getBudgetModal() {
        return `
            <div id="modal-budget" class="modal">
                <div class="modal-content max-w-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold dark:text-white">💰 Budget Tracker</h2>
                        <button onclick="AppModals.close('budget')" class="text-3xl hover:text-red-600">&times;</button>
                    </div>
                    <div id="budgetModalContent"></div>
                </div>
            </div>
        `;
    },

    getPhrasesModal() {
        return `
            <div id="modal-phrases" class="modal">
                <div class="modal-content max-w-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold dark:text-white">🗣️ Frases Útiles</h2>
                        <button onclick="AppModals.close('phrases')" class="text-3xl hover:text-red-600">&times;</button>
                    </div>
                    <div class="space-y-3 max-h-96 overflow-y-auto">
                        <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <p class="font-semibold dark:text-white">こんにちは (Konnichiwa)</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Hola</p>
                        </div>
                        <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <p class="font-semibold dark:text-white">ありがとう (Arigatou)</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Gracias</p>
                        </div>
                        <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <p class="font-semibold dark:text-white">すみません (Sumimasen)</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Disculpe</p>
                        </div>
                        <div class="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                            <p class="font-semibold dark:text-white">トイレはどこですか？</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">¿Dónde está el baño?</p>
                        </div>
                        <div class="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <p class="font-semibold dark:text-white">いくらですか？</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">¿Cuánto cuesta?</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getNotesModal() {
        return `
            <div id="modal-notes" class="modal">
                <div class="modal-content max-w-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold dark:text-white">📝 Mis Notas</h2>
                        <button onclick="AppModals.close('notes')" class="text-3xl hover:text-red-600">&times;</button>
                    </div>
                    <textarea id="notesTextarea" class="w-full h-64 p-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Tus notas aquí..."></textarea>
                    <button onclick="AppModals.saveNotes()" class="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
                        💾 Guardar
                    </button>
                </div>
            </div>
        `;
    }
};

// MODALS HANDLER
const AppModals = {
    open(modalName) {
        const modal = document.getElementById('modal-' + modalName);
        if (!modal) return;
        
        modal.classList.add('active');
        
        if (modalName === 'notes') {
            document.getElementById('notesTextarea').value = localStorage.getItem('travelNotes') || '';
        }
        if (modalName === 'budget') {
            BudgetTracker.updateModal();
        }
    },

    close(modalName) {
        const modal = document.getElementById('modal-' + modalName);
        if (modal) modal.classList.remove('active');
    },

    saveNotes() {
        const notes = document.getElementById('notesTextarea').value;
        localStorage.setItem('travelNotes', notes);
        alert('✅ Notas guardadas!');
        this.close('notes');
    }
};

// UTILITIES
const AppUtils = {
    EXCHANGE_RATE: 143,

    setupCurrencyConverter() {
        const usdInput = document.getElementById('usdInput');
        const jpyInput = document.getElementById('jpyInput');
        
        if (!usdInput || !jpyInput) return;

        let timeout;
        usdInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const usd = parseFloat(e.target.value) || 0;
                jpyInput.value = Math.round(usd * this.EXCHANGE_RATE);
            }, 300);
        });

        jpyInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const jpy = parseFloat(e.target.value) || 0;
                usdInput.value = (jpy / this.EXCHANGE_RATE).toFixed(2);
            }, 300);
        });
    },

    quickConvert(amount) {
        document.getElementById('usdInput').value = amount;
        document.getElementById('jpyInput').value = Math.round(amount * this.EXCHANGE_RATE);
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AppCore.init());
} else {
    AppCore.init();
}