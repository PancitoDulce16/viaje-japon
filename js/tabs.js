// js/tabs.js - Con APIs integradas

import { MapHandler } from './map.js';
import { AppUtils } from './utils.js';

export const TabsHandler = {
    renderAllTabs() {
        // Utils tab ahora usa UtilsHandler
        if (window.UtilsHandler) {
            window.UtilsHandler.init();
        }
        MapHandler.renderMap();
    },

    renderFlightsTab_OLD() {
        // Este método ya no se usa - ahora FlightsHandler.init() maneja todo
        const container = document.getElementById('content-flights');
        if (!container) return;
        
        container.innerHTML = `
            <div class="max-w-6xl mx-auto p-4 md:p-6">
                <h2 class="text-3xl font-bold mb-6 text-gray-800 dark:text-white">✈️ Información de Vuelos</h2>
                
                <div class="space-y-6">
                    <!-- Vuelo de Ida -->
                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border-l-4 border-blue-500">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="text-3xl">🛫</span>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800 dark:text-white">Ida: Costa Rica → Japón</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Domingo, 16 de Febrero 2026</p>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                            <div class="flex items-center justify-between mb-3">
                                <span class="font-bold text-gray-800 dark:text-white">Vuelo AM58</span>
                                <span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">Aeroméxico</span>
                            </div>
                            <div class="grid grid-cols-3 gap-4 text-sm dark:text-gray-300 mb-4">
                                <div>
                                    <p class="text-gray-500 dark:text-gray-400 text-xs mb-1">Salida</p>
                                    <p class="font-semibold">MTY - Monterrey</p>
                                </div>
                                <div class="text-center flex items-center justify-center">
                                    <p class="text-2xl text-gray-400">→</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-gray-500 dark:text-gray-400 text-xs mb-1">Llegada</p>
                                    <p class="font-semibold text-green-600 dark:text-green-400">NRT 6:30 AM</p>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <a href="https://www.flightradar24.com/data/flights/am58" target="_blank" class="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                                    📡 Track Live (FlightRadar24)
                                </a>
                                <a href="https://flightaware.com/live/flight/AMX58" target="_blank" class="text-xs bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition font-semibold">
                                    📊 FlightAware
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Vuelo de Regreso -->
                    <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-l-4 border-orange-500">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="text-3xl">🛬</span>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800 dark:text-white">Regreso: Japón → Costa Rica</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Domingo, 2 de Marzo 2026</p>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                            <div class="flex items-center justify-between mb-3">
                                <span class="font-bold text-gray-800 dark:text-white">Vuelo AM58</span>
                                <span class="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-semibold">Aeroméxico</span>
                            </div>
                            <div class="grid grid-cols-3 gap-4 text-sm dark:text-gray-300 mb-3">
                                <div>
                                    <p class="text-gray-500 dark:text-gray-400 text-xs mb-1">Salida</p>
                                    <p class="font-semibold text-red-600 dark:text-red-400">⚠️ 9:30 AM</p>
                                    <p class="text-xs text-gray-600 dark:text-gray-400">Narita Airport</p>
                                </div>
                                <div class="text-center flex items-center justify-center">
                                    <p class="text-2xl text-gray-400">→</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-gray-500 dark:text-gray-400 text-xs mb-1">Llegada</p>
                                    <p class="font-semibold">SJO</p>
                                    <p class="text-xs text-gray-600 dark:text-gray-400">Costa Rica (vía MTY)</p>
                                </div>
                            </div>
                            <div class="mt-3 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border-l-4 border-red-500">
                                <p class="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ ¡IMPORTANTE! Día de salida</p>
                                <div class="space-y-1 text-xs text-red-600 dark:text-red-400">
                                    <p>⏰ <strong>Wake up:</strong> 4:30 AM</p>
                                    <p>🚪 <strong>Salida del hotel:</strong> 5:30 AM</p>
                                    <p>✈️ <strong>Vuelo:</strong> 9:30 AM desde Narita</p>
                                </div>
                            </div>
                            <div class="flex gap-2 mt-3">
                                <a href="https://www.flightradar24.com/data/flights/am58" target="_blank" class="text-xs bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition font-semibold">
                                    📡 Track Live
                                </a>
                                <a href="https://flightaware.com/live/flight/AMX58" target="_blank" class="text-xs bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition font-semibold">
                                    📊 Status
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // NOTA: renderUtilsTab ahora lo maneja utils-handler.js

    renderUtilsTab_OLD() {
        // DEPRECATED - ahora usa UtilsHandler.init()
        // Método mantenido por compatibilidad, pero no se usa
        const container = document.getElementById('content-utils');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-6xl mx-auto p-4 md:p-6">
                <h2 class="text-3xl font-bold mb-6 text-gray-800 dark:text-white">🛠️ Utilidades</h2>
                <p class="text-gray-600 dark:text-gray-400 mb-6">Herramientas útiles para tu viaje. Click para expandir cada sección.</p>

                <!-- Accordions Menu -->
                <div class="space-y-4">

                    <!-- Budget Accordion -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button onclick="TabsHandler.toggleUtilSection('budget')" class="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">💰</span>
                                <div class="text-left">
                                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">División de Gastos</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Divide gastos entre miembros del grupo</p>
                                </div>
                            </div>
                            <svg id="budget-chevron" class="w-6 h-6 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div id="budget-content" class="hidden p-6 pt-0 border-t border-gray-200 dark:border-gray-700">
                            <!-- Budget Tracker Section -->
                            <div id="budgetTrackerContent" class="mb-6"></div>

                            <!-- Expense Splitter Section -->
                            <div class="border-t border-gray-300 dark:border-gray-600 pt-6">
                                <h4 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                                    <span>👥</span>
                                    <span>División de Gastos entre Miembros</span>
                                </h4>
                                <div id="expenseSplitterContent"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Reservations Accordion -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button onclick="TabsHandler.toggleUtilSection('reservations')" class="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">🎫</span>
                                <div class="text-left">
                                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">Mis Reservas</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Gestiona reservas de hoteles, restaurantes y actividades</p>
                                </div>
                            </div>
                            <svg id="reservations-chevron" class="w-6 h-6 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div id="reservations-content" class="hidden p-6 pt-0 border-t border-gray-200 dark:border-gray-700">
                            <div id="reservationsContent"></div>
                        </div>
                    </div>

                    <!-- Currency Converter Accordion -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button onclick="TabsHandler.toggleUtilSection('currency')" class="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">💸</span>
                                <div class="text-left">
                                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">Conversor de Moneda</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Convierte entre USD y JPY en tiempo real</p>
                                </div>
                            </div>
                            <svg id="currency-chevron" class="w-6 h-6 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div id="currency-content" class="hidden p-6 pt-0 border-t border-gray-200 dark:border-gray-700">
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
                        </div>
                    </div>

                    <!-- Weather Accordion -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button onclick="TabsHandler.toggleUtilSection('weather')" class="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">🌤️</span>
                                <div class="text-left">
                                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">Clima en Tiempo Real</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Pronóstico del clima en Tokyo, Kyoto y Osaka</p>
                                </div>
                            </div>
                            <svg id="weather-chevron" class="w-6 h-6 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div id="weather-content" class="hidden p-6 pt-0 border-t border-gray-200 dark:border-gray-700">
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
                        </div>
                    </div>

                    <!-- TimeZone Accordion -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button onclick="TabsHandler.toggleUtilSection('timezone')" class="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">🕐</span>
                                <div class="text-left">
                                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">Zona Horaria</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Hora actual en Costa Rica y Japón</p>
                                </div>
                            </div>
                            <svg id="timezone-chevron" class="w-6 h-6 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div id="timezone-content" class="hidden p-6 pt-0 border-t border-gray-200 dark:border-gray-700">
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
                        </div>
                    </div>

                </div>
            </div>
        `;

        AppUtils.setupCurrencyConverter();
        AppUtils.startClocks();
        AppUtils.loadWeatherData(); // ← NUEVO: Cargar clima en tiempo real
    }

    // NOTA: toggleUtilSection ahora lo maneja UtilsHandler.toggleSection
};
