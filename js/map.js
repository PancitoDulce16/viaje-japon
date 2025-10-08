// js/map.js

export const MapHandler = {
    renderMap() {
        const container = document.getElementById('content-map');
        if (!container) return;
        
        container.innerHTML = `
            <div class="max-w-6xl mx-auto p-4 md:p-6">
                <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-white">🗺️ Mapa del Viaje</h2>
                
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center mb-6">
                    <div class="text-6xl mb-4">🗾</div>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">
                        Próximamente: Mapa interactivo con todos los destinos
                    </p>
                </div>

                <div class="grid md:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-red-500 hover:shadow-xl transition">
                        <div class="text-center">
                            <div class="text-4xl mb-3">🗼</div>
                            <h3 class="font-bold text-xl text-red-600 dark:text-red-400 mb-2">Tokyo</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Capital y metrópolis</p>
                            <div class="space-y-2 text-xs">
                                <div class="flex justify-between">
                                    <span class="text-gray-500 dark:text-gray-500">Días:</span>
                                    <span class="font-semibold dark:text-white">9 días</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500 dark:text-gray-500">Distrito:</span>
                                    <span class="font-semibold dark:text-white">Shinjuku</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500 dark:text-gray-500">Highlights:</span>
                                    <span class="font-semibold dark:text-white">Shibuya, Akiba</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition">
                        <div class="text-center">
                            <div class="text-4xl mb-3">⛩️</div>
                            <h3 class="font-bold text-xl text-purple-600 dark:text-purple-400 mb-2">Kyoto</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Ciudad histórica</p>
                            <div class="space-y-2 text-xs">
                                <div class="flex justify-between">
                                    <span class="text-gray-500 dark:text-gray-500">Días:</span>
                                    <span class="font-semibold dark:text-white">2 días</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500 dark:text-gray-500">Templos:</span>
                                    <span class="font-semibold dark:text-white">Fushimi Inari</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500 dark:text-gray-500">Excursión:</span>
                                    <span class="font-semibold dark:text-white">Nara</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-orange-500 hover:shadow-xl transition">
                        <div class="text-center">
                            <div class="text-4xl mb-3">🏯</div>
                            <h3 class="font-bold text-xl text-orange-600 dark:text-orange-400 mb-2">Osaka</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Ciudad gastronómica</p>
                            <div class="space-y-2 text-xs">
                                <div class="flex justify-between">
                                    <span class="text-gray-500 dark:text-gray-500">Días:</span>
                                    <span class="font-semibold dark:text-white">3 días</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500 dark:text-gray-500">Distrito:</span>
                                    <span class="font-semibold dark:text-white">Namba</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500 dark:text-gray-500">Food:</span>
                                    <span class="font-semibold dark:text-white">Dotonbori</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                    <h3 class="font-bold text-lg mb-3 dark:text-white">📍 Rutas principales</h3>
                    <div class="space-y-2 text-sm dark:text-gray-300">
                        <div class="flex items-center gap-2">
                            <span>🚄</span>
                            <span><strong>Tokyo → Kyoto:</strong> Shinkansen Hikari (2h 20min)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span>🚄</span>
                            <span><strong>Kyoto → Osaka:</strong> JR Kyoto Line (30min)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span>🚄</span>
                            <span><strong>Osaka → Tokyo:</strong> Shinkansen Hikari (2h 40min)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
