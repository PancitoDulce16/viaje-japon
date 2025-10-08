/* ===================================
   MAPA INTERACTIVO - LUGARES DE JAPÓN
   =================================== */

   const MapHandler = {
    init() {
        this.renderMap();
    },

    renderMap() {
        const container = document.getElementById('mapContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">🗺️ Ubicaciones del Viaje</h2>
                <p class="text-gray-600 dark:text-gray-400 mb-6">Click para abrir en Google Maps</p>
                
                <div class="mb-8">
                    <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">🏨 Hoteles</h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        ${this.getHotels().map(hotel => `
                            <a href="${hotel.mapsUrl}" target="_blank" rel="noopener" class="p-4 ${hotel.bgClass} rounded-lg border-l-4 ${hotel.borderClass} hover:shadow-lg transition">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-gray-800 dark:text-white">${hotel.name}</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">${hotel.dates}</p>
                                        <p class="text-xs text-gray-500 mt-1">📍 ${hotel.location}</p>
                                    </div>
                                    <span class="text-2xl">🗺️</span>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-8">
                    <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">⭐ Atracciones Principales</h3>
                    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        ${this.getAttractions().map(attr => `
                            <a href="${attr.mapsUrl}" target="_blank" rel="noopener" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition flex items-center gap-3">
                                <span class="text-2xl">${attr.icon}</span>
                                <div class="min-w-0">
                                    <p class="font-semibold dark:text-white truncate">${attr.name}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">${attr.location}</p>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    getHotels() {
        return [
            {
                name: 'Hotel Tokyo Papa Shinjuku',
                dates: 'Feb 16-19 (Días 1-3)',
                location: 'Shinjuku-Gyoemmae, Tokyo',
                mapsUrl: 'https://www.google.com/maps/search/Hotel+Tokyo+Papa+Shinjuku+Gyoemmae',
                bgClass: 'bg-red-50 dark:bg-red-900/20',
                borderClass: 'border-red-500'
            },
            {
                name: 'Tune Stay Kyoto',
                dates: 'Feb 19-21 (Días 4-5)',
                location: '5 min de Kyoto Station',
                mapsUrl: 'https://www.google.com/maps/search/Tune+Stay+Kyoto',
                bgClass: 'bg-purple-50 dark:bg-purple-900/20',
                borderClass: 'border-purple-500'
            },
            {
                name: 'Toyoko Inn Osaka Namba',
                dates: 'Feb 21-24 (Días 6-7)',
                location: '10 min de Dotonbori',
                mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Osaka+Namba',
                bgClass: 'bg-orange-50 dark:bg-orange-900/20',
                borderClass: 'border-orange-500'
            },
            {
                name: 'Hotel Apa Yamanote Otsuka',
                dates: 'Feb 24-Mar 2 (Días 8-15)',
                location: 'Otsuka Station, Tokyo',
                mapsUrl: 'https://www.google.com/maps/search/Hotel+Apa+Yamanote+Otsuka+Station',
                bgClass: 'bg-red-50 dark:bg-red-900/20',
                borderClass: 'border-red-500'
            }
        ];
    },

    getAttractions() {
        return [
            { icon: '🚶', name: 'Shibuya Crossing', location: 'Tokyo • Día 3', mapsUrl: 'https://www.google.com/maps/search/Shibuya+Crossing+Tokyo' },
            { icon: '🌆', name: 'Shibuya Sky', location: 'Tokyo • Día 3', mapsUrl: 'https://www.google.com/maps/search/Shibuya+Sky+Tokyo' },
            { icon: '🗿', name: 'Great Buddha', location: 'Kamakura • Día 2', mapsUrl: 'https://www.google.com/maps/search/Kamakura+Great+Buddha' },
            { icon: '⛩️', name: 'Fushimi Inari', location: 'Kyoto • Día 5', mapsUrl: 'https://www.google.com/maps/search/Fushimi+Inari+Taisha+Kyoto' },
            { icon: '🎋', name: 'Bamboo Forest', location: 'Kyoto • Día 6', mapsUrl: 'https://www.google.com/maps/search/Arashiyama+Bamboo+Grove+Kyoto' },
            { icon: '🌃', name: 'Dotonbori', location: 'Osaka • Día 6', mapsUrl: 'https://www.google.com/maps/search/Dotonbori+Osaka' },
            { icon: '🦌', name: 'Nara Park', location: 'Nara • Día 5', mapsUrl: 'https://www.google.com/maps/search/Nara+Park+Deer' },
            { icon: '🐋', name: 'Osaka Aquarium', location: 'Osaka • Día 7', mapsUrl: 'https://www.google.com/maps/search/Osaka+Aquarium+Kaiyukan' },
            { icon: '🎮', name: 'Akihabara', location: 'Tokyo • Día 3', mapsUrl: 'https://www.google.com/maps/search/Akihabara+Electric+Town+Tokyo' }
        ];
    }
};

// Initialize
MapHandler.init();