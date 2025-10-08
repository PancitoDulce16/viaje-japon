// js/attractions.js - Módulo de atracciones

import { ATTRACTIONS_DATA } from '../data/attractions-data.js';

export const AttractionsHandler = {
    savedAttractions: JSON.parse(localStorage.getItem('savedAttractions') || '[]'),
    
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
        const isSaved = this.savedAttractions.includes(item.name);
        const priceDisplay = item.price === 0 ? 'GRATIS' : `¥${item.price.toLocaleString()}`;
        const needsReservation = item.reserveDays > 0;
        
        return `
            <div class="attraction-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-lg transition border-l-4 ${
                isSaved ? 'border-yellow-400' : 'border-gray-200 dark:border-gray-600'
            }" data-attraction="${item.name}" data-price="${item.price}" data-reservation="${needsReservation}">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h4 class="font-bold text-lg dark:text-white mb-1">${item.name}</h4>
                        <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            📍 ${item.city}
                        </p>
                    </div>
                    <button 
                        onclick="AttractionsHandler.toggleSave('${item.name}')" 
                        class="text-2xl hover:scale-110 transition"
                        title="${isSaved ? 'Quitar de guardados' : 'Guardar'}"
                    >
                        ${isSaved ? '⭐' : '☆'}
                    </button>
                </div>

                <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    ${item.description}
                </p>

                <!-- Info Tags -->
                <div class="flex flex-wrap gap-2 mb-3">
                    <span class="text-xs px-2 py-1 rounded-full font-semibold ${
                        item.price === 0 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }">
                        💰 ${priceDisplay}
                    </span>
                    <span class="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-semibold">
                        ⏱️ ${item.duration}
                    </span>
                    <span class="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-semibold">
                        ⭐ ${item.rating}/5
                    </span>
                </div>

                ${needsReservation ? `
                    <div class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded mb-3">
                        <p class="text-xs font-semibold text-red-700 dark:text-red-400">
                            ⚠️ Reservar ${item.reserveDays} días antes
                        </p>
                    </div>
                ` : ''}

                ${item.tips ? `
                    <div class="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded mb-3">
                        <p class="text-xs text-gray-700 dark:text-gray-300">
                            💡 <strong>Tip:</strong> ${item.tips}
                        </p>
                    </div>
                ` : ''}

                <!-- Actions -->
                <div class="flex gap-2">
                    ${item.reservationUrl ? `
                        <a href="${item.reservationUrl}" target="_blank" class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition text-sm font-semibold">
                            📅 Reservar
                        </a>
                    ` : `
                        <div class="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-center py-2 px-4 rounded-lg text-sm font-semibold">
                            Sin reserva
                        </div>
                    `}
                    <a href="https://www.google.com/maps/search/${encodeURIComponent(item.name + ' ' + item.city)}" target="_blank" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition text-sm font-semibold">
                        🗺️
                    </a>
                </div>
            </div>
        `;
    },

    toggleSave(attractionName) {
        const index = this.savedAttractions.indexOf(attractionName);
        if (index > -1) {
            this.savedAttractions.splice(index, 1);
        } else {
            this.savedAttractions.push(attractionName);
        }
        localStorage.setItem('savedAttractions', JSON.stringify(this.savedAttractions));
        this.renderAttractions();
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
    }
};

// Exponer globalmente
window.AttractionsHandler = AttractionsHandler;
