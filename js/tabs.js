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
                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border-l-4 border-blue-500">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="text-3xl">🛫</span>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800 dark:text-white">Ida: Costa Rica → Japón</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Domingo, 16 de Febrero 2025</p>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                            <div class="flex items-center justify-between mb-3">
                                <span class="font-bold text-gray-800 dark:text-white">Vuelo AM58</span>
                                <span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">Aeroméxico</span>
                            </div>
                            <div class="grid grid-cols-3 gap-4 text-sm dark:text-gray-300">
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
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-l-4 border-orange-500">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="text-3xl">🛬</span>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800 dark:text-white">Regreso: Japón → Costa Rica</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-300">Domingo, 2 de Marzo 2025</p>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                            <div class="flex items-center justify-between mb-3">
                                <span class="font-bold text-gray-800 dark:text-white">Vuelo AM58</span>
                                <span class="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-semibold">Aeroméxico</span>
                            </div>
                            <div class="mt-3 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border-l-4 border-red-500">
                                <p class="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ ¡IMPORTANTE! Día de salida</p>
                                <div class="space-y-1 text-xs text-red-600 dark:text-red-400">
                                    <p>⏰ <strong>Wake up:</strong> 4:30 AM</p>
                                    <p>🚪 <strong>Salida del hotel:</strong> 5:30 AM</p>
                                    <p>✈️ <strong>Vuelo:</strong> 9:30 AM desde Narita</p>
                                </div>
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
                </div>
            </div>
        `;

        AppUtils.setupCurrencyConverter();
        AppUtils.startClocks();
    }
};
