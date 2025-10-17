// js/map.js - Mapa Interactivo con Leaflet
import { GooglePlacesAPI } from './google-places.js';

let map = null;
let markersLayer = null;
let nearbyPlacesLayer = null;

// Coordenadas de ciudades principales de Japón
const CITY_COORDINATES = {
    tokyo: [35.6762, 139.6503],
    kyoto: [35.0116, 135.7681],
    osaka: [34.6937, 135.5023],
    nara: [34.6851, 135.8048],
    hiroshima: [34.3853, 132.4553],
    hakone: [35.2324, 139.1070],
    nikko: [36.7564, 139.6054],
    kamakura: [35.3192, 139.5466],
    yokohama: [35.4437, 139.6380],
    kanazawa: [36.5947, 136.6256],
    nagoya: [35.1815, 136.9066],
    sapporo: [43.0642, 141.3469],
    fukuoka: [33.5904, 130.4017],
    takayama: [36.1408, 137.2526]
};

// Ubicaciones de hoteles
const HOTEL_LOCATIONS = [
    {
        name: 'APA Hotel Shinjuku Gyoemmae',
        coords: [35.6893, 139.7108],
        city: 'Tokyo',
        dates: 'Feb 16-19, 2026 (Días 1-3)',
        icon: '🏨'
    },
    {
        name: 'Hotel Kyoto Tune Stay',
        coords: [34.9858, 135.7583],
        city: 'Kyoto',
        dates: 'Feb 19-21, 2026 (Días 4-5)',
        icon: '🏨'
    },
    {
        name: 'Toyoko Inn Osaka Namba',
        coords: [34.6651, 135.5012],
        city: 'Osaka',
        dates: 'Feb 21-24, 2026 (Días 6-8)',
        icon: '🏨'
    },
    {
        name: 'APA Hotel Yamanote Otsuka Eki Mae',
        coords: [35.7308, 139.7286],
        city: 'Tokyo',
        dates: 'Feb 24 - Mar 2, 2026 (Días 8-15)',
        icon: '🏨'
    }
];

// Atracciones principales con coordenadas
const TOP_ATTRACTIONS = [
    {
        name: 'Shibuya Crossing',
        coords: [35.6595, 139.7005],
        city: 'Tokyo',
        icon: '🚶',
        category: 'landmark'
    },
    {
        name: 'Tokyo Skytree',
        coords: [35.7101, 139.8107],
        city: 'Tokyo',
        icon: '🏯',
        category: 'landmark'
    },
    {
        name: 'Sensoji Temple',
        coords: [35.7148, 139.7967],
        city: 'Tokyo',
        icon: '🏮',
        category: 'temple'
    },
    {
        name: 'Fushimi Inari Shrine',
        coords: [34.9671, 135.7727],
        city: 'Kyoto',
        icon: '⛩️',
        category: 'temple'
    },
    {
        name: 'Kiyomizu-dera',
        coords: [34.9949, 135.7850],
        city: 'Kyoto',
        icon: '⛩️',
        category: 'temple'
    },
    {
        name: 'Arashiyama Bamboo',
        coords: [35.0170, 135.6731],
        city: 'Kyoto',
        icon: '🎋',
        category: 'nature'
    },
    {
        name: 'Dotonbori',
        coords: [34.6686, 135.5014],
        city: 'Osaka',
        icon: '🌃',
        category: 'nightlife'
    },
    {
        name: 'Osaka Aquarium',
        coords: [34.6546, 135.4291],
        city: 'Osaka',
        icon: '🐋',
        category: 'entertainment'
    },
    {
        name: 'Nara Park',
        coords: [34.6851, 135.8428],
        city: 'Nara',
        icon: '🦌',
        category: 'nature'
    },
    {
        name: 'Todai-ji Temple',
        coords: [34.6890, 135.8398],
        city: 'Nara',
        icon: '🏯',
        category: 'temple'
    },
    {
        name: 'Great Buddha Kamakura',
        coords: [35.3167, 139.5363],
        city: 'Kamakura',
        icon: '🗿',
        category: 'temple'
    }
];

// Iconos personalizados para marcadores
const createCustomIcon = (emoji, color = '#dc2626') => {
    return L.divIcon({
        html: `
            <div style="
                background: ${color};
                width: 36px;
                height: 36px;
                border-radius: 50% 50% 50% 0;
                border: 3px solid white;
                transform: rotate(-45deg);
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <span style="
                    transform: rotate(45deg);
                    font-size: 18px;
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
                ">${emoji}</span>
            </div>
        `,
        className: 'custom-marker',
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -42]
    });
};

export const MapHandler = {
    mapInitialized: false,

    renderMap() {
        const container = document.getElementById('content-map');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-7xl mx-auto p-4 md:p-6">
                <!-- Header -->
                <div class="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-6 mb-6 shadow-lg">
                    <h1 class="text-3xl font-bold mb-2">🗺️ Mapa Interactivo del Viaje</h1>
                    <p class="text-white/90">Explora todas las ubicaciones de tu aventura por Japón</p>
                </div>

                <!-- Map Container -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-6">
                    <div id="interactive-map" style="height: 600px; width: 100%;"></div>
                </div>

                <!-- Leyenda y Filtros -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 class="text-xl font-bold mb-4 dark:text-white">Leyenda del Mapa</h3>
                    <div class="grid md:grid-cols-3 gap-4">
                        <button onclick="MapHandler.filterMarkers('all')" class="map-filter-btn active" data-filter="all">
                            🗺️ Ver Todo
                        </button>
                        <button onclick="MapHandler.filterMarkers('hotels')" class="map-filter-btn" data-filter="hotels">
                            🏨 Hoteles
                        </button>
                        <button onclick="MapHandler.filterMarkers('attractions')" class="map-filter-btn" data-filter="attractions">
                            ⭐ Atracciones
                        </button>
                        <button onclick="MapHandler.filterMarkers('temple')" class="map-filter-btn" data-filter="temple">
                            ⛩️ Templos
                        </button>
                        <button onclick="MapHandler.filterMarkers('nature')" class="map-filter-btn" data-filter="nature">
                            🌿 Naturaleza
                        </button>
                        <button onclick="MapHandler.filterMarkers('nightlife')" class="map-filter-btn" data-filter="nightlife">
                            🌃 Vida Nocturna
                        </button>
                    </div>
                </div>

                <!-- Info Tips -->
                <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                    <p class="text-sm dark:text-gray-300">
                        💡 <strong>Tips:</strong> Haz clic en los marcadores para ver más información.
                        Usa los filtros para ver solo ciertos tipos de lugares.
                    </p>
                </div>

                <!-- 🔥 Búsqueda de Lugares Cercanos con Google Places -->
                ${GooglePlacesAPI.isConfigured() ? `
                <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 class="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        🔍 Buscar Lugares Cercanos
                        <span class="text-xs font-normal text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                            Powered by Google Places
                        </span>
                    </h3>

                    <div class="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Buscar cerca de:
                            </label>
                            <select
                                id="nearbySearchCity"
                                class="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="35.6762,139.6503">Tokyo</option>
                                <option value="35.0116,135.7681">Kyoto</option>
                                <option value="34.6937,135.5023">Osaka</option>
                                <option value="34.6851,135.8048">Nara</option>
                                <option value="35.3192,139.5466">Kamakura</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Tipo de lugar:
                            </label>
                            <select
                                id="nearbySearchType"
                                class="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="restaurant">🍽️ Restaurantes</option>
                                <option value="cafe">☕ Cafés</option>
                                <option value="tourist_attraction">🎯 Atracciones</option>
                                <option value="shopping_mall">🛍️ Centros Comerciales</option>
                                <option value="park">🌳 Parques</option>
                                <option value="museum">🏛️ Museos</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onclick="MapHandler.searchNearbyPlaces()"
                        class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition"
                    >
                        🔍 Buscar Lugares
                    </button>

                    <div id="nearbySearchResults" class="mt-4">
                        <!-- Results will appear here -->
                    </div>
                </div>
                ` : `
                <div class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                    <p class="text-sm dark:text-gray-300">
                        💡 <strong>Tip:</strong> Configura Google Places API key en config.js para buscar restaurantes, cafés y más lugares cercanos.
                    </p>
                </div>
                `}
            </div>
        `;

        // NO inicializar el mapa aquí - esperar a que el tab sea visible
    },

    initializeMap() {
        const mapElement = document.getElementById('interactive-map');
        if (!mapElement) {
            console.error('❌ Map element not found');
            return;
        }

        // Si el mapa ya existe, solo recalcular tamaño
        if (map && this.mapInitialized) {
            map.invalidateSize();
            console.log('✅ Map size recalculated');
            return;
        }

        // Si el mapa ya existe, destruirlo primero
        if (map) {
            map.remove();
            map = null;
        }

        // Crear el mapa centrado en Japón
        map = L.map('interactive-map').setView([36.2048, 138.2529], 6);

        // Añadir capa de tiles (CartoDB con nombres en inglés/romaji)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Crear capa de marcadores
        markersLayer = L.layerGroup().addTo(map);

        // Añadir todos los marcadores
        this.addAllMarkers();

        // Marcar como inicializado
        this.mapInitialized = true;

        // IMPORTANTE: Forzar recalculo del tamaño del mapa
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                console.log('✅ Map initialized and size calculated');
            }
        }, 100);

        console.log('✅ Interactive map created');
    },

    fixMapSize() {
        // Esta función es llamada cuando el tab del mapa se hace visible
        const mapElement = document.getElementById('interactive-map');
        if (!mapElement) return;

        // Si el mapa no está inicializado, inicializarlo ahora
        if (!this.mapInitialized) {
            this.initializeMap();
            return;
        }

        // Si ya está inicializado, solo recalcular el tamaño
        if (map) {
            map.invalidateSize();
            console.log('✅ Map size fixed after tab switch');
        }
    },

    addAllMarkers() {
        if (!markersLayer) return;

        // Limpiar marcadores existentes
        markersLayer.clearLayers();

        // Añadir marcadores de hoteles
        HOTEL_LOCATIONS.forEach(hotel => {
            const marker = L.marker(hotel.coords, {
                icon: createCustomIcon('🏨', '#3b82f6'),
                type: 'hotels'
            }).addTo(markersLayer);

            marker.bindPopup(`
                <div class="p-3 min-w-[200px]">
                    <h3 class="font-bold text-lg mb-2">${hotel.icon} ${hotel.name}</h3>
                    <p class="text-sm text-gray-600 mb-1">📍 ${hotel.city}</p>
                    <p class="text-sm text-gray-600 mb-2">📅 ${hotel.dates}</p>
                    <a href="https://www.google.com/maps/search/${encodeURIComponent(hotel.name)}"
                       target="_blank"
                       class="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                        Ver en Google Maps →
                    </a>
                </div>
            `);

            // Guardar tipo para filtrado
            marker.markerType = 'hotels';
        });

        // Añadir marcadores de atracciones
        TOP_ATTRACTIONS.forEach(attraction => {
            const marker = L.marker(attraction.coords, {
                icon: createCustomIcon(attraction.icon, '#dc2626'),
                type: 'attractions'
            }).addTo(markersLayer);

            marker.bindPopup(`
                <div class="p-3 min-w-[200px]">
                    <h3 class="font-bold text-lg mb-2">${attraction.icon} ${attraction.name}</h3>
                    <p class="text-sm text-gray-600 mb-2">📍 ${attraction.city}</p>
                    <a href="https://www.google.com/maps/search/${encodeURIComponent(attraction.name + ' ' + attraction.city)}"
                       target="_blank"
                       class="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                        Ver en Google Maps →
                    </a>
                </div>
            `);

            // Guardar tipos para filtrado
            marker.markerType = 'attractions';
            marker.markerCategory = attraction.category;
        });
    },

    filterMarkers(filterType) {
        if (!markersLayer) return;

        // Actualizar botones activos
        document.querySelectorAll('.map-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filterType) {
                btn.classList.add('active');
            }
        });

        // Filtrar marcadores
        markersLayer.eachLayer(marker => {
            if (filterType === 'all') {
                marker.setOpacity(1);
            } else if (filterType === 'hotels' || filterType === 'attractions') {
                marker.setOpacity(marker.markerType === filterType ? 1 : 0.2);
            } else {
                // Filtro por categoría de atracción
                marker.setOpacity(marker.markerCategory === filterType ? 1 : 0.2);
            }
        });
    },

    // 🔥 Buscar lugares cercanos con Google Places
    async searchNearbyPlaces() {
        const citySelect = document.getElementById('nearbySearchCity');
        const typeSelect = document.getElementById('nearbySearchType');
        const resultsDiv = document.getElementById('nearbySearchResults');

        if (!citySelect || !typeSelect) return;

        const [lat, lng] = citySelect.value.split(',').map(Number);
        const type = typeSelect.value;

        resultsDiv.innerHTML = `
            <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <p class="text-sm font-semibold dark:text-white">🔄 Buscando lugares...</p>
            </div>
        `;

        try {
            const result = await GooglePlacesAPI.searchNearby({
                lat,
                lng,
                radius: 2000,
                type: type
            });

            if (result.success && result.places.length > 0) {
                // Limpiar capa de lugares cercanos anterior
                if (nearbyPlacesLayer) {
                    nearbyPlacesLayer.clearLayers();
                } else {
                    nearbyPlacesLayer = L.layerGroup().addTo(map);
                }

                // Agregar nuevos marcadores
                result.places.slice(0, 10).forEach(place => {
                    const marker = L.marker([place.lat, place.lng], {
                        icon: createCustomIcon('📍', '#10b981')
                    }).addTo(nearbyPlacesLayer);

                    marker.bindPopup(`
                        <div class="p-3 min-w-[200px]">
                            <h3 class="font-bold text-lg mb-2">📍 ${place.name}</h3>
                            <p class="text-sm text-gray-600 mb-2">${place.address}</p>
                            ${place.rating ? `<p class="text-sm mb-2">⭐ ${place.rating} (${place.userRatingsTotal || 0} reviews)</p>` : ''}
                            ${place.openNow !== undefined ? `
                                <p class="text-xs ${place.openNow ? 'text-green-600' : 'text-red-600'} font-semibold mb-2">
                                    ${place.openNow ? '✅ Abierto ahora' : '🔴 Cerrado'}
                                </p>
                            ` : ''}
                            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}"
                               target="_blank"
                               class="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                                Ver en Google Maps →
                            </a>
                        </div>
                    `);
                });

                // Centrar mapa en los resultados
                map.setView([lat, lng], 14);

                // Mostrar resultados en lista
                resultsDiv.innerHTML = `
                    <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                        <p class="text-sm font-semibold text-green-700 dark:text-green-400">
                            ✅ ${result.places.length} lugares encontrados (mostrando 10)
                        </p>
                    </div>
                    <div class="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        ${result.places.slice(0, 10).map(place => `
                            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-green-500">
                                <h4 class="font-bold text-sm dark:text-white mb-1">${place.name}</h4>
                                <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">${place.address}</p>
                                ${place.rating ? `<p class="text-xs mb-1">⭐ ${place.rating}/5</p>` : ''}
                                <button
                                    onclick="MapHandler.centerOnPlace(${place.lat}, ${place.lng})"
                                    class="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                >
                                    📍 Ver en mapa
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                resultsDiv.innerHTML = `
                    <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                        <p class="text-sm font-semibold dark:text-white">⚠️ No se encontraron lugares</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error buscando lugares:', error);
            resultsDiv.innerHTML = `
                <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                    <p class="text-sm font-semibold text-red-700 dark:text-red-400">
                        ❌ Error: ${error.message}
                    </p>
                    <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Nota: Google Places API requiere un proxy o configuración de backend
                    </p>
                </div>
            `;
        }
    },

    // Centrar mapa en un lugar específico
    centerOnPlace(lat, lng) {
        if (map) {
            map.setView([lat, lng], 16);
            // Abrir popup del marcador más cercano
            nearbyPlacesLayer.eachLayer(marker => {
                const markerLatLng = marker.getLatLng();
                if (Math.abs(markerLatLng.lat - lat) < 0.0001 && Math.abs(markerLatLng.lng - lng) < 0.0001) {
                    marker.openPopup();
                }
            });
        }
    }
};

// Exportar para uso global
window.MapHandler = MapHandler;
