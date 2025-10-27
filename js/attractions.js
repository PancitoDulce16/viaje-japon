import { ATTRACTIONS_DATA } from '/data/attractions-data.js';
import { enrichAttraction } from '/data/coordinates-data.js';
import { MapsHelper } from './maps-helper.js';
import { Logger, debounce, AppError } from './helpers.js';
import { STORAGE_KEYS, ERROR_CODES, TIMEOUTS, Z_INDEX, COLOR_SCHEMES, ACTIVITY_ICONS } from '/js/constants.js';

/**
 * Handler para la gestión de atracciones
 * @namespace AttractionsHandler
 */
export const AttractionsHandler = {
    savedAttractions: JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_ATTRACTIONS) || '[]'),
    currentFilter: 'all',
    searchTerm: '',
    
    renderAttractions() {
        const container = document.getElementById('content-attractions');
        if (!container) return;
        
        container.innerHTML = `
            <div class="max-w-7xl mx-auto p-4 md:p-6">
                <!-- Header -->
                <div class="mb-8">
                    <h2 class="text-4xl font-bold mb-3 text-gray-800 dark:text-white">🎯 Atracciones de Japón</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">
                        Guía completa de las mejores atracciones. Marca tus favoritas con ⭐
                    </p>
                    
                    <!-- Stats -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div class="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border-l-4 border-pink-500">
                            <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Guardadas</p>
                            <p class="text-2xl font-bold text-pink-600 dark:text-pink-400" id="savedCount">0</p>
                        </div>
                        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                            <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
                            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">${this.getTotalCount()}</p>
                        </div>
                        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                            <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Gratis</p>
                            <p class="text-2xl font-bold text-green-600 dark:text-green-400">${this.getFreeCount()}</p>
                        </div>
                        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                            <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Categorías</p>
                            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">${Object.keys(ATTRACTIONS_DATA).length}</p>
                        </div>
                    </div>

                    <!-- 🔍 Barra de Búsqueda -->
                    <div class="mb-4">
                        <div class="relative">
                            <input
                                type="text"
                                id="attractionSearch"
                                placeholder="🔍 Buscar por nombre, ciudad, categoría o descripción..."
                                class="w-full p-3 pl-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                                oninput="AttractionsHandler.searchAttractions(this.value)"
                            >
                            <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>

                    <!-- Filter Buttons -->
                    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
                        <button onclick="AttractionsHandler.filterCategory('all')" class="filter-btn active px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-sm whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            🎯 Todas
                        </button>
                        <button onclick="AttractionsHandler.filterCategory('saved')" class="filter-btn px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-sm whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            ⭐ Guardadas
                        </button>
                        <button onclick="AttractionsHandler.filterCategory('free')" class="filter-btn px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-sm whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            🆓 Gratis
                        </button>
                        <button onclick="AttractionsHandler.filterCategory('reservation')" class="filter-btn px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-sm whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            📅 Requiere Reserva
                        </button>
                    </div>

                    <!-- 🔥 Advanced Filters -->
                    <div class="grid md:grid-cols-3 gap-4 mb-6">
                        <!-- City Filter -->
                        <div>
                            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">📍 Ciudad</label>
                            <select
                                id="cityFilter"
                                onchange="AttractionsHandler.applyAdvancedFilters()"
                                class="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="all">Todas las ciudades</option>${this.getUniqueCities().map(city => `<option value="${city}">${city}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Price Filter -->
                        <div>
                            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">💰 Precio</label>
                            <select
                                id="priceFilter"
                                onchange="AttractionsHandler.applyAdvancedFilters()"
                                class="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="all">Todos los precios</option>
                                <option value="free">Gratis</option>
                                <option value="0-1000">¥0 - ¥1,000</option>
                                <option value="1000-3000">¥1,000 - ¥3,000</option>
                                <option value="3000-plus">¥3,000+</option>
                            </select>
                        </div>

                        <!-- Rating Filter -->
                        <div>
                            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">⭐ Rating mínimo</label>
                            <select
                                id="ratingFilter"
                                onchange="AttractionsHandler.applyAdvancedFilters()"
                                class="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="0">Todos los ratings</option>
                                <option value="4.5">4.5+ ⭐⭐⭐⭐⭐</option>
                                <option value="4.0">4.0+ ⭐⭐⭐⭐</option>
                                <option value="3.5">3.5+ ⭐⭐⭐</option>
                            </select>
                        </div>
                    </div>

                    <!-- Clear Filters Button -->
                    <div class="mb-6">
                        <button
                            onclick="AttractionsHandler.clearAllFilters()"
                            class="w-full md:w-auto px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold text-sm transition"
                        >
                            🔄 Limpiar Filtros
                        </button>
                    </div>
                </div>

                <!-- Categories -->
                <div class="space-y-8" id="categoriesContainer">
                    ${this.renderAllCategories()}
                </div>
            </div>
        `;
    
        this.updateSavedCount();
    },

    renderAllCategories() {
        return Object.entries(ATTRACTIONS_DATA).map(([key, category]) => 
            this.renderCategory(key, category)
        ).join('');
    },

    renderCategory(key, category) {
        const colorClasses = {
            pink: 'from-pink-500 to-rose-500',
            orange: 'from-orange-500 to-amber-500',
            purple: 'from-purple-500 to-fuchsia-500',
            blue: 'from-blue-500 to-cyan-500',
            green: 'from-green-500 to-emerald-500',
            emerald: 'from-emerald-500 to-teal-500',
            red: 'from-red-500 to-pink-500',
            indigo: 'from-indigo-500 to-purple-500'
        };

        return `
        <div class="category-section bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden" data-category="${key}">
                <!-- Category Header -->
                <div class="bg-gradient-to-r ${colorClasses[category.color]} p-6 text-white">
                    <div class="flex items-center gap-3">
                        <span class="text-4xl">${category.icon}</span>
                        <div>
                            <h3 class="text-2xl font-bold">${category.category}</h3>
                            <p class="text-sm opacity-90">${category.items.length} atracciones</p>
                        </div>
                    </div>
                </div>

                <!-- Items Grid -->
                <div class="p-6">
                    <div class="grid md:grid-cols-2 gap-4">
                        ${category.items.map(item => this.renderAttractionCard(item, key)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderAttractionCard(item, categoryKey) {
        // Enriquecer con coordenadas y datos de transporte
        const enrichedItem = enrichAttraction(item);

        const isSaved = this.savedAttractions.includes(enrichedItem.name);
        const priceDisplay = enrichedItem.price === 0 ? 'GRATIS' : `¥${enrichedItem.price.toLocaleString()}`;
        const needsReservation = enrichedItem.reserveDays > 0;

        return `
            <div class="attraction-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all ${
                isSaved ? 'border-2 border-yellow-400' : 'border border-gray-200 dark:border-gray-700'
            }" data-attraction="${item.name}" data-price="${item.price}" data-reservation="${needsReservation}" data-city="${item.city}" data-rating="${item.rating}">
                
                <!-- Imagen -->
                <div class="relative h-40 w-full group">
                    <img 
                        src="${window.ImageService.getActivityImage(item.id || item.name, categoryKey)}" 
                        alt="${item.name}"
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                    >
                    <div class="absolute top-2 right-2">
                        <button 
                            onclick="AttractionsHandler.toggleSave('${item.name}')" 
                            class="text-3xl text-white drop-shadow-lg hover:scale-110 transition"
                            title="${isSaved ? 'Quitar de guardados' : 'Guardar'}"
                        >
                            ${isSaved ? '⭐' : '☆'}
                        </button>
                    </div>
                </div>

                <!-- Contenido -->
                <div class="p-4">
                    <h4 class="font-bold text-lg dark:text-white mb-1">${item.name}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3">
                        📍 ${item.city}
                    </p>

                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 h-10">
                        ${item.description}
                    </p>

                    <!-- Info Tags -->
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="text-xs px-2 py-1 rounded-full font-semibold ${
                            item.price === 0
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }">💰 ${priceDisplay}
                        </span>
                        <span class="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-semibold">
                            ⏱️ ${item.duration}
                        </span>
                        <span class="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full font-semibold">
                            ⭐ ${item.rating}/5
                        </span>
                        ${item.season ? `
                            <span class="text-xs px-2 py-1 rounded-full font-semibold ${
                                item.season === 'winter'
                                    ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                                    : item.season === 'summer'
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }">
                                ${item.season === 'winter' ? '❄️ Invierno' : item.season === 'summer' ? '☀️ Verano' : '🌸 Todo el año'}
                            </span>
                        ` : ''}
                    </div>

                    ${needsReservation ? `
                        <div class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded mb-4">
                            <p class="text-xs font-semibold text-red-700 dark:text-red-400">
                                ⚠️ Reservar ${item.reserveDays} días antes
                            </p>
                        </div>
                    ` : ''}

                    ${enrichedItem.tips ? `
                        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded mb-4">
                            <p class="text-xs text-gray-700 dark:text-gray-300">
                                💡 <strong>Tip:</strong> ${enrichedItem.tips}
                            </p>
                        </div>
                    ` : ''}

                    ${item.winterProducts || item.summerProducts ? `
                        <div class="bg-gradient-to-r ${
                            item.winterProducts
                                ? 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-l-4 border-cyan-500'
                                : 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500'
                        } p-3 rounded mb-4">
                            <p class="text-xs font-bold ${
                                item.winterProducts ? 'text-cyan-700 dark:text-cyan-300' : 'text-amber-700 dark:text-amber-300'
                            } mb-2">
                                ${item.winterProducts ? '❄️ Ropa de Invierno Disponible:' : '☀️ Ropa de Verano Disponible:'}
                            </p>
                            <div class="flex flex-wrap gap-1">
                                ${(item.winterProducts || item.summerProducts || []).slice(0, 4).map(product => `
                                    <span class="text-xs px-2 py-0.5 bg-white dark:bg-gray-700 rounded-full ${
                                        item.winterProducts ? 'text-cyan-700 dark:text-cyan-300' : 'text-amber-700 dark:text-amber-300'
                                    }">${product}</span>
                                `).join('')}
                                ${(item.winterProducts || item.summerProducts || []).length > 4 ? `
                                    <span class="text-xs px-2 py-0.5 text-gray-500 dark:text-gray-400">+${(item.winterProducts || item.summerProducts).length - 4} más</span>
                                ` : ''}
                            </div>
                            ${item.bestMonths && item.bestMonths.length > 0 && item.bestMonths[0] !== 'All year' ? `
                                <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                    📅 Mejor época: ${item.bestMonths.slice(0, 3).join(', ')}${item.bestMonths.length > 3 ? '...' : ''}
                                </p>
                            ` : ''}
                        </div>
                    ` : ''}

                    <!-- Transport & Hours Info -->
                    ${MapsHelper.createTransportInfo(enrichedItem)}
                    ${MapsHelper.createHoursInfo(enrichedItem)}

                    <!-- Maps Button -->
                    ${enrichedItem.coordinates || enrichedItem.name ? `
                        <div class="mt-3 mb-4">
                            ${MapsHelper.createMapsButton(enrichedItem)}
                        </div>
                    ` : ''}

                    <!-- Actions -->
                    <div class="flex gap-2">
                        <button 
                            onclick="AttractionsHandler.addToItinerary('${item.name.replace(/'/g, "\\'")}')"
                            class="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition text-sm font-semibold"
                            title="Añadir al itinerario"
                        >
                            ➕ Itinerario
                        </button>
                        ${item.reservationUrl ? `
                            <a href="${item.reservationUrl}" target="_blank" class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition text-sm font-semibold">
                                📅 Reservar
                            </a>
                        ` : ''}
                        <a href="https://www.google.com/maps/search/${encodeURIComponent(item.name + ' ' + item.city)}" target="_blank" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition text-sm font-semibold">
                            🗺️
                        </a>
                    </div>
                </div>
            </div>
        `;
    },

    filterCategory(filter) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        const cards = document.querySelectorAll('.attraction-card');
        const sections = document.querySelectorAll('.category-section');

        if (filter === 'all') {
            cards.forEach(card => card.style.display = 'block');
            sections.forEach(section => section.style.display = 'block');
        } else if (filter === 'saved') {
            sections.forEach(section => {
                const visibleCards = Array.from(section.querySelectorAll('.attraction-card')).filter(card => {
                    const isSaved = this.savedAttractions.includes(card.dataset.attraction);
                    card.style.display = isSaved ? 'block' : 'none';
                    return isSaved;
                });
                section.style.display = visibleCards.length > 0 ? 'block' : 'none';
            });
        } else if (filter === 'free') {
            sections.forEach(section => {
                const visibleCards = Array.from(section.querySelectorAll('.attraction-card')).filter(card => {
                    const isFree = card.dataset.price === '0';
                    card.style.display = isFree ? 'block' : 'none';
                    return isFree;
                });
                section.style.display = visibleCards.length > 0 ? 'block' : 'none';
            });
        } else if (filter === 'reservation') {
            sections.forEach(section => {
                const visibleCards = Array.from(section.querySelectorAll('.attraction-card')).filter(card => {
                    const needsReservation = card.dataset.reservation === 'true';
                    card.style.display = needsReservation ? 'block' : 'none';
                    return needsReservation;
                });
                section.style.display = visibleCards.length > 0 ? 'block' : 'none';
            });
        }
    },

    updateSavedCount() {
        const countElem = document.getElementById('savedCount');
        if (countElem) {
            countElem.textContent = this.savedAttractions.length;
        }
    },

    getTotalCount() {
        return Object.values(ATTRACTIONS_DATA).reduce((total, category) => 
            total + category.items.length, 0
        );
    },

    getFreeCount() {
        return Object.values(ATTRACTIONS_DATA).reduce((total, category) => 
            total + category.items.filter(item => item.price === 0).length, 0
        );
    },

    async addToItinerary(attractionName) {
        let attraction = null;
        for (const category of Object.values(ATTRACTIONS_DATA)) {
            attraction = category.items.find(item => item.name === attractionName);
            if (attraction) break;
        }

        if (!attraction) {
            alert('⚠️ No se encontró la atracción');
            return;
        }

        if (!window.ItineraryHandler) {
            alert('⚠️ El módulo de itinerario no está disponible');
            return;
        }

        this.showDaySelectionModal(attraction);
    },

    async showDaySelectionModal(attraction) {
        try {
            if (!window.ItineraryHandler) {
                console.error('ItineraryHandler no disponible');
                if (window.Notifications) {
                    window.Notifications.warning('⚠️ El módulo de itinerario no está disponible');
                } else {
                    alert('⚠️ El módulo de itinerario no está disponible');
                }
                return;
            }

            let currentItinerary = window.ItineraryHandler.currentItinerary;

            if (!currentItinerary || !currentItinerary.days || currentItinerary.days.length === 0) {
                const currentTripId = localStorage.getItem('currentTripId');
                if (currentTripId && typeof window.ItineraryHandler.loadItinerary === 'function') {
                    try {
                        await window.ItineraryHandler.loadItinerary(currentTripId);
                        currentItinerary = window.ItineraryHandler.currentItinerary;
                    } catch (e) {
                        console.error('Error cargando itinerario:', e);
                    }
                }
            }

            if (!currentItinerary || !currentItinerary.days || !Array.isArray(currentItinerary.days) || currentItinerary.days.length === 0) {
                if (window.Notifications) {
                    window.Notifications.warning('⚠️ Primero debes crear días en tu itinerario. Ve a la sección de Itinerario y añade días a tu viaje.');
                } else {
                    alert('⚠️ Primero debes crear días en tu itinerario. Ve a la sección de Itinerario y añade días a tu viaje.');
                }
                return;
            }
        } catch (error) {
            console.error('Error en showDaySelectionModal:', error);
            if (window.Notifications) {
                window.Notifications.error('❌ Error al cargar el itinerario');
            } else {
                alert('❌ Error al cargar el itinerario');
            }
            return;
        }

        const currentItinerary = window.ItineraryHandler.currentItinerary;
        const modalHtml = `
            <div id="daySelectionModal" class="modal active" style="z-index: 10000;">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                    <div class="mb-4">
                        <h2 class="text-2xl font-bold dark:text-white mb-2">➕ Añadir al Itinerario</h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            <strong>${attraction.name}</strong><br>
                            ${attraction.city} • ${attraction.price === 0 ? 'GRATIS' : '¥' + attraction.price.toLocaleString()}
                        </p>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                            Selecciona el día:
                        </label>
                        <div class="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                            ${currentItinerary.days.map(day => `
                                <button 
                                    onclick="AttractionsHandler.addAttractionToDay(${day.day}, '${attraction.name.replace(/'/g, "\\'")}')"
                                    class="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition text-center"
                                >
                                    <div class="text-xs text-gray-500 dark:text-gray-400">Día</div>
                                    <div class="text-xl font-bold dark:text-white">${day.day}</div>
                                    <div class="text-xs text-gray-600 dark:text-gray-400">${day.title}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <button 
                        onclick="AttractionsHandler.closeDaySelectionModal()"
                        class="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        `;

        const existing = document.getElementById('daySelectionModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
    },

    async addAttractionToDay(dayNumber, attractionName) {
        let attraction = null;
        for (const category of Object.values(ATTRACTIONS_DATA)) {
            attraction = category.items.find(item => item.name === attractionName);
            if (attraction) break;
        }
        if (!attraction) return;

        const activity = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            icon: this.getCategoryIcon(attraction),
            time: 'Por definir',
            title: attraction.name,
            desc: attraction.description,
            cost: attraction.price,
            station: attraction.city,
            rating: attraction.rating,
            duration: attraction.duration
        };

        if (window.ItineraryHandler) {
            const modal = document.getElementById('activityModal');
            if (modal) {
                document.getElementById('activityDay').value = dayNumber;
                document.getElementById('activityIcon').value = activity.icon;
                document.getElementById('activityTime').value = activity.time;
                document.getElementById('activityTitle').value = activity.title;
                document.getElementById('activityDesc').value = activity.desc;
                document.getElementById('activityCost').value = activity.cost;
                document.getElementById('activityStation').value = activity.station;

                await window.ItineraryHandler.saveActivity();
                this.closeDaySelectionModal();
                
                if (window.Notifications) {
                    window.Notifications.success(`✅ "${attraction.name}" añadido al Día ${dayNumber}!`);
                }

                setTimeout(() => {
                    const itineraryTab = document.querySelector('[data-tab="itinerary"]');
                    if (itineraryTab) itineraryTab.click();
                }, 500);
            }
        }
    },

    closeDaySelectionModal() {
        const modal = document.getElementById('daySelectionModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    getCategoryIcon(attraction) {
        const name = attraction.name.toLowerCase();
        const desc = attraction.description.toLowerCase();
        if (name.includes('ramen') || desc.includes('ramen')) return '🍜';
        if (name.includes('sushi') || desc.includes('sushi')) return '🍣';
        if (name.includes('cafe') || desc.includes('café')) return '☕';
        if (name.includes('restaurant') || desc.includes('restaurant')) return '🍴';
        if (name.includes('izakaya') || desc.includes('izakaya')) return '🍻';
        if (name.includes('temple') || name.includes('shrine') || desc.includes('temple')) return '⛩️';
        if (name.includes('castle') || desc.includes('castle')) return '🏯';
        if (name.includes('museum') || desc.includes('museum')) return '🏛️';
        if (name.includes('park') || name.includes('garden')) return '🌳';
        if (name.includes('tower') || name.includes('sky')) return '🌆';
        if (name.includes('market') || desc.includes('market')) return '🏪';
        if (name.includes('disney') || name.includes('universal')) return '🎢';
        if (name.includes('aquarium') || desc.includes('aquarium')) return '🐋';
        if (name.includes('arcade') || desc.includes('arcade')) return '🎮';
        return '🎯';
    },

    searchAttractions(query) {
        if (this._searchTimeout) {
            clearTimeout(this._searchTimeout);
        }
        this._searchTimeout = setTimeout(() => {
            try {
                const searchTerm = query.toLowerCase().trim();
                AttractionsHandler.searchTerm = searchTerm;
                const cards = document.querySelectorAll('.attraction-card');
                const sections = document.querySelectorAll('.category-section');

                if (!searchTerm) {
                    cards.forEach(card => card.style.display = 'block');
                    sections.forEach(section => section.style.display = 'block');
                    Logger.info('Búsqueda limpiada, mostrando todas las atracciones');
                    return;
                }

                let totalResults = 0;
                const searchableData = new Map();
                Object.entries(ATTRACTIONS_DATA).forEach(([categoryKey, category]) => {
                    category.items.forEach(item => {
                        searchableData.set(item.name, {
                            name: item.name.toLowerCase(),
                            city: item.city.toLowerCase(),
                            description: item.description.toLowerCase(),
                            tips: (item.tips || '').toLowerCase(),
                            category: category.category.toLowerCase()
                        });
                    });
                });

                sections.forEach(section => {
                    const visibleCards = Array.from(section.querySelectorAll('.attraction-card')).filter(card => {
                        const attractionName = card.dataset.attraction;
                        const searchData = searchableData.get(attractionName);
                        if (!searchData) {
                            card.style.display = 'none';
                            return false;
                        }
                        const matches = searchData.name.includes(searchTerm) ||
                                      searchData.city.includes(searchTerm) ||
                                      searchData.description.includes(searchTerm) ||
                                      searchData.tips.includes(searchTerm) ||
                                      searchData.category.includes(searchTerm);
                        card.style.display = matches ? 'block' : 'none';
                        return matches;
                    });
                    totalResults += visibleCards.length;
                    section.style.display = visibleCards.length > 0 ? 'block' : 'none';
                });

                Logger.info(`Búsqueda completada: "${searchTerm}" - ${totalResults} resultados`);
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                const firstFilterBtn = document.querySelector('.filter-btn');
                if (firstFilterBtn) {
                    firstFilterBtn.classList.add('active');
                }
            } catch (error) {
                Logger.error('Error en búsqueda de atracciones', error);
            }
        }, 300);
    },

    toggleSave(attractionName) {
        try {
            const index = this.savedAttractions.indexOf(attractionName);
            if (index > -1) {
                this.savedAttractions.splice(index, 1);
                Logger.info(`Atracción removida de favoritos: ${attractionName}`);
            } else {
                this.savedAttractions.push(attractionName);
                Logger.success(`Atracción agregada a favoritos: ${attractionName}`);
            }
            localStorage.setItem(STORAGE_KEYS.SAVED_ATTRACTIONS, JSON.stringify(this.savedAttractions));
            this.renderAttractions();
        } catch (error) {
            Logger.error('Error al guardar atracción', error);
            if (window.Notifications) {
                window.Notifications.error('Error al guardar la atracción');
            }
        }
    },

    getUniqueCities() {
        const cities = new Set();
        Object.values(ATTRACTIONS_DATA).forEach(category => {
            category.items.forEach(item => cities.add(item.city));
        });
        return Array.from(cities).sort();
    },

    applyAdvancedFilters() {
        try {
            const cityFilter = document.getElementById('cityFilter')?.value || 'all';
            const priceFilter = document.getElementById('priceFilter')?.value || 'all';
            const ratingFilter = parseFloat(document.getElementById('ratingFilter')?.value || '0');
            const cards = document.querySelectorAll('.attraction-card');
            const sections = document.querySelectorAll('.category-section');

            sections.forEach(section => {
                const visibleCards = Array.from(section.querySelectorAll('.attraction-card')).filter(card => {
                    const cardCity = card.dataset.city || '';
                    const cardPrice = parseFloat(card.dataset.price || '0');
                    const cardRating = parseFloat(card.dataset.rating || '0');
                    const cityMatch = cityFilter === 'all' || cardCity === cityFilter;
                    let priceMatch = true;
                    if (priceFilter === 'free') {
                        priceMatch = cardPrice === 0;
                    } else if (priceFilter === '0-1000') {
                        priceMatch = cardPrice >= 0 && cardPrice <= 1000;
                    } else if (priceFilter === '1000-3000') {
                        priceMatch = cardPrice > 1000 && cardPrice <= 3000;
                    } else if (priceFilter === '3000-plus') {
                        priceMatch = cardPrice > 3000;
                    }
                    const ratingMatch = cardRating >= ratingFilter;
                    const matches = cityMatch && priceMatch && ratingMatch;
                    card.style.display = matches ? 'block' : 'none';
                    return matches;
                });
                section.style.display = visibleCards.length > 0 ? 'block' : 'none';
            });

            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            const firstFilterBtn = document.querySelector('.filter-btn');
            if (firstFilterBtn) {
                firstFilterBtn.classList.add('active');
            }
            Logger.info(`Filtros aplicados - Ciudad: ${cityFilter}, Precio: ${priceFilter}, Rating: ${ratingFilter}`);
        } catch (error) {
            Logger.error('Error aplicando filtros avanzados', error);
        }
    },

    clearAllFilters() {
        try {
            const cityFilter = document.getElementById('cityFilter');
            const priceFilter = document.getElementById('priceFilter');
            const ratingFilter = document.getElementById('ratingFilter');
            const searchInput = document.getElementById('attractionSearch');
            if (cityFilter) cityFilter.value = 'all';
            if (priceFilter) priceFilter.value = 'all';
            if (ratingFilter) ratingFilter.value = '0';
            if (searchInput) searchInput.value = '';
            this.searchTerm = '';
            const cards = document.querySelectorAll('.attraction-card');
            const sections = document.querySelectorAll('.category-section');
            cards.forEach(card => card.style.display = 'block');
            sections.forEach(section => section.style.display = 'block');
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            const allBtn = document.querySelector('.filter-btn');
            if (allBtn) allBtn.classList.add('active');
            Logger.info('Todos los filtros limpiados');
        } catch (error) {
            Logger.error('Error limpiando filtros', error);
        }
    }
};

// Exponer globalmente
window.AttractionsHandler = AttractionsHandler;
