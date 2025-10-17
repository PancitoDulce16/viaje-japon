// js/map.js

export const MapHandler = {
    renderMap() {
        const container = document.getElementById('content-map');
        if (!container) return;

        // Get city images from ImageService with fallbacks
        const getImage = (city) => {
            if (window.ImageService && window.ImageService.CITY_IMAGES) {
                return window.ImageService.getCityImage(city);
            }
            // Fallback URLs if ImageService isn't loaded
            const fallbackImages = {
                tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
                kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
                osaka: 'https://unsplash.com/photos/OwbvX2iahvw/download?force=true&w=1200', // Dotonbori
                nara: 'https://unsplash.com/photos/OugwfKxatME/download?force=true&w=1200' // Nara deer
            };
            return fallbackImages[city] || fallbackImages.tokyo;
        };

        const tokyoImage = getImage('tokyo');
        const kyotoImage = getImage('kyoto');
        const osakaImage = getImage('osaka');
        const naraImage = getImage('nara');

        container.innerHTML = `
            <div class="max-w-6xl mx-auto p-4 md:p-6">
                <!-- Hero Map Section with Image -->
                <div class="relative mb-6 rounded-xl overflow-hidden shadow-2xl">
                    <div class="relative h-64 md:h-80">
                        <img src="${tokyoImage}" alt="Japan Travel Map"
                             class="w-full h-full object-cover" loading="eager" />
                        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
                        <div class="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
                            <h1 class="text-4xl md:text-5xl font-bold mb-3 text-center drop-shadow-lg">🗺️ Mapa del Viaje</h1>
                            <p class="text-lg md:text-xl text-center max-w-2xl drop-shadow-md">
                                Explora todas las ubicaciones de tu aventura por Japón
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <p class="text-gray-600 dark:text-gray-400 mb-6 text-center">
                        Click en cualquier lugar para abrirlo en Google Maps y obtener direcciones 📍
                    </p>
                    
                    <!-- Hotels Section -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            🏨 Hoteles
                        </h3>
                        <div class="grid md:grid-cols-2 gap-4">
                            <a href="https://www.google.com/maps/search/APA+Hotel+Shinjuku+Gyoemmae" target="_blank" class="group relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300">
                                <div class="relative h-40">
                                    <img src="${tokyoImage}" alt="Tokyo" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    <div class="absolute inset-0 p-4 flex flex-col justify-end">
                                        <p class="font-bold text-white text-lg mb-1">🏨 APA Hotel Shinjuku Gyoemmae</p>
                                        <p class="text-sm text-white/90">Feb 16-19, 2026 (Días 1-3)</p>
                                        <p class="text-xs text-white/80 mt-1">📍 Shinjuku-Gyoemmae, Tokyo</p>
                                    </div>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Hotel+Kyoto+Tune+Stay" target="_blank" class="group relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300">
                                <div class="relative h-40">
                                    <img src="${kyotoImage}" alt="Kyoto" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    <div class="absolute inset-0 p-4 flex flex-col justify-end">
                                        <p class="font-bold text-white text-lg mb-1">🏨 Hotel Kyoto Tune Stay</p>
                                        <p class="text-sm text-white/90">Feb 19-21, 2026 (Días 4-5)</p>
                                        <p class="text-xs text-white/80 mt-1">📍 5 min de Kyoto Station</p>
                                    </div>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/Toyoko+Inn+Osaka+Namba" target="_blank" class="group relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300">
                                <div class="relative h-40">
                                    <img src="${osakaImage}" alt="Osaka" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    <div class="absolute inset-0 p-4 flex flex-col justify-end">
                                        <p class="font-bold text-white text-lg mb-1">🏨 Toyoko Inn Osaka Namba</p>
                                        <p class="text-sm text-white/90">Feb 21-24, 2026 (Días 6-8)</p>
                                        <p class="text-xs text-white/80 mt-1">📍 10 min de Dotonbori</p>
                                    </div>
                                </div>
                            </a>

                            <a href="https://www.google.com/maps/search/APA+Hotel+Yamanote+Otsuka+Eki+Mae" target="_blank" class="group relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300">
                                <div class="relative h-40">
                                    <img src="${tokyoImage}" alt="Tokyo" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    <div class="absolute inset-0 p-4 flex flex-col justify-end">
                                        <p class="font-bold text-white text-lg mb-1">🏨 APA Hotel Yamanote Otsuka Eki Mae</p>
                                        <p class="text-sm text-white/90">Feb 24 - Mar 2, 2026 (Días 8-15)</p>
                                        <p class="text-xs text-white/80 mt-1">📍 Otsuka Station, Tokyo</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>

                    <!-- Top Attractions -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            ⭐ Atracciones Principales
                        </h3>
                        <div class="grid md:grid-cols-3 gap-3">
                            <a href="https://www.google.com/maps/search/Shibuya+Crossing+Tokyo" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🚶 Shibuya Crossing</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Tokyo • Día 2</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Shibuya+Sky+Tokyo" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🌆 Shibuya Sky</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Tokyo • Día 2</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Kamakura+Great+Buddha" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🗿 Great Buddha</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Kamakura • Día 2</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Akihabara+Electric+Town+Tokyo" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🎮 Akihabara</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Tokyo • Día 3</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Fushimi+Inari+Taisha+Kyoto" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">⛩️ Fushimi Inari Shrine</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Kyoto • Día 4</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Nara+Park+Deer" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🦌 Nara Park</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Nara • Día 5</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Todaiji+Temple+Nara" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🏯 Todai-ji Temple</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Nara • Día 5</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Arashiyama+Bamboo+Grove+Kyoto" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🎋 Arashiyama Bamboo</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Kyoto • Día 5</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Kiyomizu+dera+Temple+Kyoto" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">⛩️ Kiyomizu-dera</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Kyoto • Día 6</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Dotonbori+Osaka" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🌃 Dotonbori</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Osaka • Día 6</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Osaka+Aquarium+Kaiyukan" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🐋 Osaka Aquarium</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Osaka • Día 7</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Tokyo+Skytree" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🏯 Tokyo Skytree</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Tokyo • Día 10</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Sensoji+Temple+Asakusa+Tokyo" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🏮 Sensoji Temple</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Asakusa • Día 10</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Harajuku+Takeshita+Street" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">👗 Harajuku Takeshita Street</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Tokyo • Día 11</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Meiji+Shrine+Tokyo" target="_blank" class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-lg transition-all border border-red-100 dark:border-red-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">⛩️ Meiji Shrine</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Tokyo • Día 11</p>
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
                        <div class="grid md:grid-cols-3 gap-3">
                            <a href="https://www.google.com/maps/search/Ichiran+Ramen+Shinjuku" target="_blank" class="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg hover:shadow-lg transition-all border border-orange-100 dark:border-orange-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🍜 Ichiran Ramen</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Shinjuku • Múltiples ubicaciones</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Omoide+Yokocho+Shinjuku" target="_blank" class="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg hover:shadow-lg transition-all border border-orange-100 dark:border-orange-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🍢 Omoide Yokocho</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Shinjuku • Yakitori</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Takoyaki+Wanaka+Dotonbori" target="_blank" class="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg hover:shadow-lg transition-all border border-orange-100 dark:border-orange-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🐙 Takoyaki Wanaka</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Dotonbori, Osaka</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Chibo+Okonomiyaki+Osaka" target="_blank" class="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg hover:shadow-lg transition-all border border-orange-100 dark:border-orange-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🥞 Chibo Okonomiyaki</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Osaka</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Nemuro+Hanamaru+Sushi+Tokyo+Station" target="_blank" class="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg hover:shadow-lg transition-all border border-orange-100 dark:border-orange-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🍣 Nemuro Hanamaru</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Tokyo Station • Kaiten Sushi</p>
                            </a>
                            <a href="https://www.google.com/maps/search/Gyukaku+Yakiniku" target="_blank" class="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg hover:shadow-lg transition-all border border-orange-100 dark:border-orange-800">
                                <p class="font-bold text-gray-800 dark:text-white mb-1">🍖 Gyukaku Yakiniku</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Múltiples ubicaciones</p>
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
