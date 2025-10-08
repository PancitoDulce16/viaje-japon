// js/map.js

export const MapHandler = {
    renderMap() {
        const container = document.getElementById('content-map');
        if (!container) return;
        
        container.innerHTML = `
            <div class="max-w-6xl mx-auto p-4 md:p-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">🗺️ Ubicaciones del Viaje</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">Click en cualquier lugar para abrirlo en Google Maps y obtener direcciones 📍</p>
                    
                    <!-- Hotels Section -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            🏨 Hoteles
                        </h3>
                        <div class="grid md:grid-cols-2 gap-4">
                            <a href="https://www.google.com/maps/search/APA+Hotel+Shinjuku+Gyoemmae" target="_blank" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500 hover:shadow-lg transition">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-gray-800 dark:text-white">APA Hotel Shinjuku Gyoemmae</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Feb 16-19, 2026 (Días 1-3)</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">📍 Shinjuku-Gyoemmae, Tokyo</p>
                                    </div>
                                    <span class="text-2xl">🗺️</span>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Hotel+Kyoto+Tune+Stay" target="_blank" class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500 hover:shadow-lg transition">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-gray-800 dark:text-white">Hotel Kyoto Tune Stay</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Feb 19-21, 2026 (Días 4-5)</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">📍 5 min de Kyoto Station</p>
                                    </div>
                                    <span class="text-2xl">🗺️</span>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Toyoko+Inn+Osaka+Namba" target="_blank" class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500 hover:shadow-lg transition">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-gray-800 dark:text-white">Toyoko Inn Osaka Namba</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Feb 21-24, 2026 (Días 6-8)</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">📍 10 min de Dotonbori</p>
                                    </div>
                                    <span class="text-2xl">🗺️</span>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/APA+Hotel+Yamanote+Otsuka+Eki+Mae" target="_blank" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500 hover:shadow-lg transition">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-gray-800 dark:text-white">APA Hotel Yamanote Otsuka Eki Mae</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Feb 24 - Mar 2, 2026 (Días 8-15)</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">📍 Otsuka Station, Tokyo</p>
                                    </div>
                                    <span class="text-2xl">🗺️</span>
                                </div>
                            </a>
                        </div>
                    </div>

                    <!-- Top Attractions -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            ⭐ Atracciones Principales
                        </h3>
                        <div class="grid md:grid-cols-2 gap-3">
                            <a href="https://www.google.com/maps/search/Shibuya+Crossing+Tokyo" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🚶</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Shibuya Crossing</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Tokyo • Día 2</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Shibuya+Sky+Tokyo" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🌆</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Shibuya Sky</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Tokyo • Día 2</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Kamakura+Great+Buddha" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🗿</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Great Buddha Kamakura</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Kamakura • Día 2</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Akihabara+Electric+Town+Tokyo" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🎮</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Akihabara</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Tokyo • Día 3</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Fushimi+Inari+Taisha+Kyoto" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">⛩️</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Fushimi Inari Shrine</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Kyoto • Día 4</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Nara+Park+Deer" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🦌</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Nara Park (Venados)</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Nara • Día 5</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Todaiji+Temple+Nara" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🏯</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Todai-ji Temple</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Nara • Día 5</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Arashiyama+Bamboo+Grove+Kyoto" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🎋</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Arashiyama Bamboo Forest</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Kyoto • Día 5</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Kiyomizu+dera+Temple+Kyoto" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">⛩️</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Kiyomizu-dera Temple</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Kyoto • Día 6</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Dotonbori+Osaka" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🌃</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Dotonbori</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Osaka • Día 6</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Osaka+Aquarium+Kaiyukan" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🐋</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Osaka Aquarium Kaiyukan</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Osaka • Día 7</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Tokyo+Skytree" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🏯</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Tokyo Skytree</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Tokyo • Día 10</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Sensoji+Temple+Asakusa+Tokyo" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🏮</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Sensoji Temple</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Asakusa • Día 10</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Harajuku+Takeshita+Street" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">👗</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Harajuku Takeshita Street</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Tokyo • Día 11</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Meiji+Shrine+Tokyo" target="_blank" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">⛩️</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Meiji Shrine</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Tokyo • Día 11</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    <!-- Stations -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            🚆 Estaciones Principales
                        </h3>
                        <div class="grid md:grid-cols-3 gap-3">
                            <a href="https://www.google.com/maps/search/Narita+Airport+Terminal+1" target="_blank" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:shadow-md transition text-center">
                                <p class="font-semibold dark:text-white">✈️ Narita Airport</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Llegada/Salida</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Shinjuku+Station+Tokyo" target="_blank" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:shadow-md transition text-center">
                                <p class="font-semibold dark:text-white">🚉 Shinjuku Station</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Tokyo - Base 1</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Kyoto+Station" target="_blank" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:shadow-md transition text-center">
                                <p class="font-semibold dark:text-white">🚉 Kyoto Station</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Kyoto - Base 2</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Namba+Station+Osaka" target="_blank" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:shadow-md transition text-center">
                                <p class="font-semibold dark:text-white">🚉 Namba Station</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Osaka - Base 3</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Otsuka+Station+Tokyo" target="_blank" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:shadow-md transition text-center">
                                <p class="font-semibold dark:text-white">🚉 Otsuka Station</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Tokyo - Base 4</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Tokyo+Station" target="_blank" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:shadow-md transition text-center">
                                <p class="font-semibold dark:text-white">🚉 Tokyo Station</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Hub Principal</p>
                            </a>
                        </div>
                    </div>

                    <!-- Food Spots -->
                    <div>
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            🍜 Lugares de Comida
                        </h3>
                        <div class="grid md:grid-cols-2 gap-3">
                            <a href="https://www.google.com/maps/search/Ichiran+Ramen+Shinjuku" target="_blank" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🍜</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Ichiran Ramen</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Shinjuku • Múltiples ubicaciones</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Omoide+Yokocho+Shinjuku" target="_blank" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🍢</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Omoide Yokocho</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Shinjuku • Yakitori</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Takoyaki+Wanaka+Dotonbori" target="_blank" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🐙</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Takoyaki Wanaka</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Dotonbori, Osaka</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Chibo+Okonomiyaki+Osaka" target="_blank" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🥞</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Chibo Okonomiyaki</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Osaka</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Nemuro+Hanamaru+Sushi+Tokyo+Station" target="_blank" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🍣</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Nemuro Hanamaru</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Tokyo Station • Kaiten Sushi</p>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Gyukaku+Yakiniku" target="_blank" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">🍖</span>
                                <div>
                                    <p class="font-semibold dark:text-white">Gyukaku Yakiniku</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Múltiples ubicaciones</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <p class="text-sm dark:text-gray-300">
                            💡 <strong>Tip:</strong> Al hacer click en cualquier lugar, se abrirá Google Maps en tu celular. 
                            Desde ahí puedes obtener direcciones en tiempo real y ver fotos del lugar.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
};
