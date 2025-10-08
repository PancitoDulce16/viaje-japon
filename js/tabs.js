// js/tabs.js

import { MapHandler } from './map.js';
import { AppUtils } from './utils.js';

export const TabsHandler = {
    renderAllTabs() {
        this.renderFlightsTab();
        this.renderUtilsTab();
        MapHandler.renderMap();
    },

    renderFlightsTab() {
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

    renderUtilsTab() {
        const container = document.getElementById('content-utils');
        if (!container) return;
        
        container.innerHTML = `
            <div class="max-w-6xl mx-auto p-4 md:p-6">
                <h2 class="text-3xl font-bold mb-6 text-gray-800 dark:text-white">🛠️ Utilidades</h2>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Conversor de Moneda -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            💸 Conversor de Moneda
                        </h3>
                        <div class="space-y-3">
                            <div class="flex gap-2">
                                <div class="flex-1">
                                    <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">USD (Dólares)</label>
                                    <input 
                                        id="usdInput" 
                                        type="number" 
                                        class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
                                        placeholder="0.00" 
                                        step="0.01"
                                    >
                                </div>
                                <div class="flex-1">
                                    <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">JPY (Yenes)</label>
                                    <input 
                                        id="jpyInput" 
                                        type="number" 
                                        class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
                                        placeholder="0" 
                                        step="1"
                                    >
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 text-center">1 USD = 143 JPY (aprox.)</p>
                            <div class="grid grid-cols-3 gap-2">
                                <button class="quick-convert bg-gray-100 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-semibold" data-amount="10">
                                    10 USD
                                </button>
                                <button class="quick-convert bg-gray-100 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-semibold" data-amount="50">
                                    50 USD
                                </button>
                                <button class="quick-convert bg-gray-100 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-semibold" data-amount="100">
                                    100 USD
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Clima en Japón -->
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
                                <ul class="space-y-1 text-gray-600 dark:text-gray-300 text-xs">
                                    <li>• Abrigo o chamarra</li>
                                    <li>• Suéteres y capas</li>
                                    <li>• Pantalones largos</li>
                                    <li>• Paraguas (puede llover)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Zona Horaria -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            🕐 Zona Horaria
                        </h3>
                        <div class="space-y-4">
                            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Costa Rica (GMT-6)</p>
                                <p id="crTime" class="text-2xl font-bold dark:text-white font-mono">--:--:--</p>
                            </div>
                            <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Japón (GMT+9)</p>
                                <p id="jpTime" class="text-2xl font-bold dark:text-white font-mono">--:--:--</p>
                            </div>
                            <p class="text-xs text-center text-gray-500 dark:text-gray-400">
                                📍 Diferencia: <strong>15 horas</strong> adelante
                            </p>
                        </div>
                    </div>

                    <!-- Acciones Rápidas -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            ⚡ Acciones Rápidas
                        </h3>
                        <div class="grid grid-cols-2 gap-3">
                            <button data-modal="phrases" class="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition">
                                <div class="text-2xl mb-1">🗣️</div>
                                <div class="text-sm font-semibold">Frases</div>
                            </button>
                            <button data-modal="emergency" class="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition">
                                <div class="text-2xl mb-1">🚨</div>
                                <div class="text-sm font-semibold">SOS</div>
                            </button>
                            <button data-modal="budget" class="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition">
                                <div class="text-2xl mb-1">💰</div>
                                <div class="text-sm font-semibold">Budget</div>
                            </button>
                            <button data-modal="notes" class="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition">
                                <div class="text-2xl mb-1">📝</div>
                                <div class="text-sm font-semibold">Notas</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        AppUtils.setupCurrencyConverter();
        AppUtils.startClocks();
    }
};
