// js/activity-autocomplete.js - Autocomplete simple para actividades
import { ATTRACTIONS_DATA } from '../../../data/attractions-data.js';

/**
 * Autocomplete Handler para el formulario de actividades
 * Usa datos locales de atracciones + permite input libre
 */
export const ActivityAutocomplete = {
    suggestions: [],
    currentIndex: -1,

    /**
     * Inicializar autocomplete en el campo de título
     */
    init() {
        const input = document.getElementById('activityTitle');
        if (!input) return;

        // Crear array de sugerencias desde attractions-data
        this.buildSuggestionsDatabase();

        // Event listeners
        input.addEventListener('input', (e) => this.handleInput(e));
        input.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#activityTitle') && !e.target.closest('#activityTitleAutocomplete')) {
                this.hideDropdown();
            }
        });

        console.log('✅ Activity Autocomplete initialized with', this.suggestions.length, 'suggestions');
    },

    /**
     * Construir base de datos de sugerencias
     */
    buildSuggestionsDatabase() {
        this.suggestions = [];

        // Agregar todas las atracciones
        Object.values(ATTRACTIONS_DATA).forEach(category => {
            category.items.forEach(item => {
                this.suggestions.push({
                    name: item.name,
                    city: item.city,
                    category: category.category,
                    icon: item.icon || '🎯',
                    description: item.description,
                    price: item.price,
                    rating: item.rating
                });
            });
        });

        // Agregar sugerencias comunes de transporte
        const transportSuggestions = [
            { name: 'Narita Express → Shinjuku', city: 'Aeropuerto Narita', category: 'Transporte', icon: '🚄', description: 'Tren del aeropuerto a Shinjuku', price: 3200, rating: null },
            { name: 'Shinkansen Tokyo → Kyoto', city: 'Transporte Interurbano', category: 'Transporte', icon: '🚅', description: 'Bullet train cubierto por JR Pass', price: 13320, rating: null },
            { name: 'Recoger Pocket WiFi', city: 'Aeropuerto', category: 'Logística', icon: '📶', description: 'Recoger dispositivo de internet móvil', price: 0, rating: null },
            { name: 'Comprar Suica/Pasmo Card', city: 'Estación de Tren', category: 'Logística', icon: '💳', description: 'Tarjeta recargable para transporte', price: 2000, rating: null },
            { name: 'Limousine Bus al Hotel', city: 'Aeropuerto', category: 'Transporte', icon: '🚌', description: 'Bus del aeropuerto al hotel', price: 3200, rating: null },
            { name: 'Reservar asientos Shinkansen', city: 'Estación JR', category: 'Logística', icon: '🎟️', description: 'Reservar asientos para tren bala', price: 0, rating: null },
            { name: 'Ferry a Miyajima', city: 'Hiroshima', category: 'Transporte', icon: '⛴️', description: 'Ferry a la isla de Miyajima', price: 180, rating: null }
        ];

        this.suggestions.push(...transportSuggestions);

        // Agregar sugerencias de comida
        const foodSuggestions = [
            { name: 'Desayuno en Konbini', city: 'Cualquiera', category: 'Comida', icon: '🍙', description: 'Comida rápida de convenience store', price: 500, rating: null },
            { name: 'Almuerzo', city: '', category: 'Comida', icon: '🍽️', description: 'Por definir', price: 1500, rating: null },
            { name: 'Cena', city: '', category: 'Comida', icon: '🍜', description: 'Por definir', price: 2000, rating: null },
            { name: 'Ramen', city: '', category: 'Comida', icon: '🍜', description: 'Ramen auténtico japonés', price: 1200, rating: null },
            { name: 'Sushi', city: '', category: 'Comida', icon: '🍣', description: 'Sushi fresco', price: 3000, rating: null },
            { name: 'Izakaya (cena y bebidas)', city: '', category: 'Comida', icon: '🍻', description: 'Bar japonés tradicional', price: 3500, rating: null },
            { name: 'Okonomiyaki', city: 'Osaka/Hiroshima', category: 'Comida', icon: '🍳', description: 'Pizza/pancake japonés', price: 1500, rating: null },
            { name: 'Takoyaki', city: 'Osaka', category: 'Comida', icon: '🐙', description: 'Bolas de pulpo', price: 600, rating: null },
            { name: 'Tonkatsu', city: '', category: 'Comida', icon: '🐖', description: 'Chuleta de cerdo empanizada', price: 1800, rating: null },
            { name: 'Tempura', city: '', category: 'Comida', icon: '🍤', description: 'Fritura japonesa', price: 2000, rating: null },
            { name: 'Udon/Soba', city: '', category: 'Comida', icon: '🥢', description: 'Fideos japoneses', price: 900, rating: null },
            { name: 'Matcha Parfait / Dulces', city: 'Kyoto', category: 'Comida', icon: '🍵', description: 'Postre de té verde', price: 1000, rating: null },
            { name: 'Depachika (sótano de comida)', city: 'Grandes Almacenes', category: 'Comida', icon: '🍱', description: 'Explorar comida gourmet', price: 1500, rating: null }
        ];

        this.suggestions.push(...foodSuggestions);

        // Agregar sugerencias de tiempo libre
        const otherSuggestions = [
            { name: 'Check-in Hotel', city: 'Hotel', category: 'Logística', icon: '🏨', description: 'Registro en el hotel', price: 0, rating: null },
            { name: 'Check-out Hotel', city: 'Hotel', category: 'Logística', icon: '🧳', description: 'Salida del hotel', price: 0, rating: null },
            { name: 'Tiempo libre', city: '', category: 'Tiempo Libre', icon: '🚶', description: 'Exploración libre', price: 0, rating: null },
            { name: 'Descanso en hotel', city: 'Hotel', category: 'Descanso', icon: '😴', description: 'Tiempo de recuperación', price: 0, rating: null },
            { name: 'Compras de souvenirs', city: '', category: 'Shopping', icon: '🛍️', description: 'Comprar recuerdos', price: 5000, rating: null },
            { name: 'Enviar equipaje (Takkyubin)', city: 'Hotel/Konbini', category: 'Logística', icon: '📦', description: 'Enviar maletas a la siguiente ciudad', price: 2000, rating: null },
            { name: 'Hacer lavandería', city: 'Hotel/Lavandería', category: 'Logística', icon: '🧺', description: 'Lavar ropa', price: 600, rating: null },
            { name: 'Sacar dinero de ATM', city: '7-Eleven', category: 'Logística', icon: '🏧', description: 'Retirar efectivo', price: 0, rating: null },
            { name: 'Explorar barrio local', city: '', category: 'Exploración', icon: '🗺️', description: 'Caminar sin rumbo fijo', price: 0, rating: null }
        ];

        this.suggestions.push(...otherSuggestions);
    },

    /**
     * Manejar input del usuario
     */
    handleInput(event) {
        const query = event.target.value.trim().toLowerCase();

        if (query.length < 2) {
            this.hideDropdown();
            return;
        }

        // Filtrar sugerencias
        const filtered = this.suggestions.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.city.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        ).slice(0, 8); // Máximo 8 resultados

        if (filtered.length > 0) {
            this.showDropdown(filtered);
        } else {
            this.hideDropdown();
        }
    },

    /**
     * Manejar teclas de navegación
     */
    handleKeydown(event) {
        const dropdown = document.getElementById('activityTitleAutocomplete');
        if (!dropdown || dropdown.classList.contains('hidden')) return;

        const items = dropdown.querySelectorAll('.autocomplete-item');

        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.currentIndex = (this.currentIndex + 1) % items.length;
                this.highlightItem(items);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.currentIndex = this.currentIndex <= 0 ? items.length - 1 : this.currentIndex - 1;
                this.highlightItem(items);
                break;
            case 'Enter':
                event.preventDefault();
                if (this.currentIndex >= 0 && items[this.currentIndex]) {
                    items[this.currentIndex].click();
                }
                break;
            case 'Escape':
                this.hideDropdown();
                break;
        }
    },

    /**
     * Resaltar item seleccionado
     */
    highlightItem(items) {
        items.forEach((item, index) => {
            if (index === this.currentIndex) {
                item.classList.add('bg-purple-100', 'dark:bg-purple-900/50');
            } else {
                item.classList.remove('bg-purple-100', 'dark:bg-purple-900/50');
            }
        });
    },

    /**
     * Mostrar dropdown con sugerencias
     */
    showDropdown(filtered) {
        const dropdown = document.getElementById('activityTitleAutocomplete');
        if (!dropdown) return;

        dropdown.innerHTML = filtered.map((item, index) => `
            <div
                class="autocomplete-item p-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                data-index="${index}"
                onclick="ActivityAutocomplete.selectSuggestion(${index}, ${JSON.stringify(item).replace(/"/g, '&quot;')})"
            >
                <div class="flex items-start gap-3">
                    <span class="text-2xl">${item.icon}</span>
                    <div class="flex-1">
                        <div class="font-semibold dark:text-white">${item.name}</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            ${item.city ? `📍 ${item.city}` : ''}
                            ${item.category ? `• ${item.category}` : ''}
                            ${item.price ? `• ¥${item.price.toLocaleString()}` : ''}
                            ${item.rating ? `• ⭐ ${item.rating}/5` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        dropdown.classList.remove('hidden');
        this.currentIndex = -1;
    },

    /**
     * Ocultar dropdown
     */
    hideDropdown() {
        const dropdown = document.getElementById('activityTitleAutocomplete');
        if (dropdown) {
            dropdown.classList.add('hidden');
            this.currentIndex = -1;
        }
    },

    /**
     * Seleccionar una sugerencia
     */
    selectSuggestion(index, item) {
        const titleInput = document.getElementById('activityTitle');
        const descInput = document.getElementById('activityDesc');
        const costInput = document.getElementById('activityCost');
        const stationInput = document.getElementById('activityStation');
        const iconInput = document.getElementById('activityIcon');

        if (titleInput) titleInput.value = item.name;
        if (descInput && item.description) descInput.value = item.description;
        if (costInput && item.price) costInput.value = item.price;
        if (stationInput && item.city) stationInput.value = item.city;
        if (iconInput && item.icon) iconInput.value = item.icon;

        this.hideDropdown();

        // Focus en el siguiente campo (hora o descripción)
        const timeInput = document.getElementById('activityTime');
        if (timeInput) timeInput.focus();
    }
};

// Exportar globalmente
window.ActivityAutocomplete = ActivityAutocomplete;

export default ActivityAutocomplete;
