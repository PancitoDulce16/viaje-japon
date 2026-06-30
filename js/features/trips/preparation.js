// js/preparation.js - Tab de Preparación con Modo Colaborativo

import { db, auth } from '../../core/firebase-config.js';
import { 
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';

export const PreparationHandler = {
    init() {
        this.renderPreparation();
        this.initRealtimeSync();
    },
    packingList: {
        documents: [],
        clothing: [],
        electronics: [],
        health: [],
        money: [],
        misc: []
    },
    unsubscribe: null,

    // Obtener el tripId actual
    getCurrentTripId() {
        if (window.TripsManager && window.TripsManager.currentTrip) {
            return window.TripsManager.currentTrip.id;
        }
        return localStorage.getItem('currentTripId');
    },

    // 🔥 Inicializar listener en tiempo real
    async initRealtimeSync() {
        // Si ya hay un listener, limpiarlo
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Si no hay usuario, cargar de localStorage
        if (!auth.currentUser) {
            const saved = localStorage.getItem('packingList');
            if (saved) {
                this.packingList = JSON.parse(saved);
            } else {
                this.initializeDefaultPackingList();
            }
            this.renderPreparation();
            return;
        }

        const tripId = this.getCurrentTripId();
        const userId = auth.currentUser.uid;

        // Si NO hay trip, usar el sistema antiguo (por usuario)
        if (!tripId) {
            console.log('⚠️ Packing: No hay trip seleccionado, usando modo individual');
            const packingRef = doc(db, `users/${userId}/packing`, 'list');

            this.unsubscribe = onSnapshot(packingRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    this.packingList = docSnapshot.data().items || this.getDefaultPackingList();
                } else {
                    this.initializeDefaultPackingList();
                }
                
                localStorage.setItem('packingList', JSON.stringify(this.packingList));
                this.renderPreparation();
                
                console.log('✅ Packing list (individual) sincronizado');
            }, (error) => {
                console.error('❌ Error en sync de packing list:', error);
                const saved = localStorage.getItem('packingList');
                this.packingList = saved ? JSON.parse(saved) : this.getDefaultPackingList();
                this.renderPreparation();
            });

            return;
        }

        // 🔥 MODO COLABORATIVO: Usar el trip compartido
        console.log('🤝 Packing: Modo colaborativo activado para trip:', tripId);
        const packingRef = doc(db, `trips/${tripId}/data`, 'packing');

        this.unsubscribe = onSnapshot(packingRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                this.packingList = docSnapshot.data().items || this.getDefaultPackingList();
            } else {
                this.initializeDefaultPackingList();
            }
            
            // También guardar en localStorage como backup
            localStorage.setItem('packingList', JSON.stringify(this.packingList));
            
            // Re-renderizar
            this.renderPreparation();
            
            console.log('✅ Packing list COMPARTIDO sincronizado');
        }, (error) => {
            console.error('❌ Error en sync de packing list compartido:', error);
            const saved = localStorage.getItem('packingList');
            this.packingList = saved ? JSON.parse(saved) : this.getDefaultPackingList();
            this.renderPreparation();
        });
    },

    // Inicializar lista por defecto
    initializeDefaultPackingList() {
        const defaults = this.getDefaultPackingList();
        Object.keys(defaults).forEach(category => {
            if (!this.packingList[category] || this.packingList[category].length === 0) {
                this.packingList[category] = defaults[category];
            }
        });
    },

    getDefaultPackingList() {
        const defaultItems = {
            documents: ['Pasaporte (válido 6+ meses)', 'Visa (si aplica)', 'JR Pass voucher', 'Seguro de viaje', 'Reservas de hotel', 'Boletos de avión'],
            clothing: ['Abrigo/chamarra', 'Suéteres (3-4)', 'Camisetas (5-6)', 'Pantalones (3-4)', 'Ropa interior', 'Calcetines', 'Zapatos cómodos', 'Pijama'],
            electronics: ['Celular + cargador', 'Adaptador Type A (100V)', 'Power bank', 'Cámara (opcional)', 'Audífonos', 'Cable USB'],
            health: ['Medicamentos personales', 'Analgésicos', 'Medicina para estómago', 'Banditas', 'Desinfectante de manos', 'Mascarillas'],
            money: ['Tarjetas de crédito (2)', 'Efectivo (¥20,000-30,000)', 'Suica/Pasmo card', 'Copias de tarjetas'],
            misc: ['Mochila pequeña', 'Botella de agua', 'Paraguas', 'Bolsas ziplock', 'Snacks', 'Guía de conversación']
        };

        const packingList = {};
        Object.keys(defaultItems).forEach(category => {
            packingList[category] = defaultItems[category].map(item => ({
                name: item,
                checked: false,
                isDefault: true // Marcar como item por defecto (no se puede eliminar)
            }));
        });

        return packingList;
    },

    
    renderPreparation() {
        const container = document.getElementById('content-preparation');
        if (!container) return;

        const totalItems = this.getTotalItems();
        const checkedItems = this.getCheckedItems();
        const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

        const tripId = this.getCurrentTripId();
        let syncStatus;
        
        if (!auth.currentUser) {
            syncStatus = '<span class="text-yellow-600 dark:text-yellow-400">📱 Solo local</span>';
        } else if (tripId) {
            syncStatus = '<span class="text-green-600 dark:text-green-400">🤝 Modo Colaborativo</span>';
        } else {
            syncStatus = '<span class="text-blue-600 dark:text-blue-400">☁️ Sincronizado</span>';
        }

        // Get current trip for budget calculation
        // BudgetCalculator espera trip.itinerary.days, pero el itinerario real
        // vive en un documento separado (trips/{id}/data/itinerary), no como
        // campo del trip - hay que combinarlos explícitamente.
        const currentTrip = window.TripsManager?.currentTrip;
        let budgetHTML = '';

        if (currentTrip && window.BudgetCalculator) {
            const tripWithItinerary = { ...currentTrip, itinerary: window.ItineraryHandler?.currentItinerary };
            budgetHTML = window.BudgetCalculator.generateBudgetSummary(tripWithItinerary);
        }

        container.innerHTML = `
            <div class="max-w-6xl mx-auto p-4 md:p-6">
                <h2 class="text-4xl font-bold mb-6 text-gray-800 dark:text-white">📦 Preparación del Viaje</h2>

                <!-- Budget Calculator -->
                ${budgetHTML ? `<div class="mb-6">${budgetHTML}</div>` : ''}

                <!-- Progress Overview -->
                <div class="bg-gradient-to-r ${progress === 100 ? 'from-green-500 to-emerald-500 animate-pulse' : 'from-blue-500 to-purple-500'} text-white rounded-xl p-6 mb-6 shadow-lg transition-all duration-500">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <h3 class="text-2xl font-bold">${progress === 100 ? '¡Todo Listo! 🎊' : '¿Listo para Japón?'}</h3>
                            <p class="text-sm opacity-90">${checkedItems} de ${totalItems} items completados</p>
                            ${progress === 100 ? '<p class="text-xs mt-1 font-bold">¡Excelente preparación! Ya puedes viajar tranquilo.</p>' : ''}
                            <p class="text-xs mt-1">${syncStatus}</p>
                        </div>
                        <div class="text-5xl ${progress === 100 ? 'animate-bounce' : ''}">${progress === 100 ? '🎉' : progress > 75 ? '🛫' : progress > 50 ? '📦' : progress > 25 ? '📝' : '✈️'}</div>
                    </div>
                    <div class="w-full bg-white/30 rounded-full h-4 overflow-hidden">
                        <div class="bg-white h-4 rounded-full transition-all duration-500 ${progress === 100 ? 'animate-pulse' : ''}" style="width: ${progress}%"></div>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <p class="text-sm opacity-90">${progress.toFixed(0)}% completo</p>
                        ${progress === 100 ? '<p class="text-sm font-bold">🌟 ¡Perfecto!</p>' : progress > 75 ? '<p class="text-sm">¡Casi listo! 💪</p>' : progress > 50 ? '<p class="text-sm">Vas muy bien 👍</p>' : ''}
                    </div>
                </div>

                <div class="grid lg:grid-cols-2 gap-6">
                    <!-- Packing Checklist -->
                    <div class="space-y-6">
                        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">📋 Checklist de Equipaje</h3>
                            ${this.renderPackingSection()}
                        </div>
                    </div>

                    <!-- Guides Column -->
                    <div class="space-y-6">
                        <!-- JR Pass Guide -->
                        ${this.renderJRPassGuide()}
                        
                        <!-- Essential Apps -->
                        ${this.renderEssentialApps()}
                        
                        <!-- Emergency Info -->
                        ${this.renderEmergencyInfo()}
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    },

    renderPackingSection() {
        const categories = {
            documents: { name: 'Documentos 📄', icon: '📄', color: 'red' },
            clothing: { name: 'Ropa 👔', icon: '👔', color: 'blue' },
            electronics: { name: 'Electrónica 🔌', icon: '🔌', color: 'yellow' },
            health: { name: 'Salud 💊', icon: '💊', color: 'green' },
            money: { name: 'Dinero 💰', icon: '💰', color: 'purple' },
            misc: { name: 'Otros 🎒', icon: '🎒', color: 'gray' }
        };

        return `
            <div class="space-y-4">
                ${Object.entries(categories).map(([key, cat]) => {
                    const items = this.packingList[key] || [];
                    const checked = items.filter(i => i.checked).length;
                    const total = items.length;
                    const progress = total > 0 ? (checked / total) * 100 : 0;

                    return `
                        <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button 
                                class="w-full p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center justify-between category-toggle-btn"
                                data-category="${key}"
                            >
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl">${cat.icon}</span>
                                    <div class="text-left">
                                        <p class="font-bold dark:text-white">${cat.name}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">${checked}/${total} completados</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                                        <div class="h-2 bg-${cat.color}-500 rounded-full transition-all" style="width: ${progress}%"></div>
                                    </div>
                                    <span class="text-gray-400 category-arrow" data-category="${key}">▼</span>
                                </div>
                            </button>
                            <div class="category-content hidden p-4 space-y-2 bg-white dark:bg-gray-800" data-category="${key}">
                                ${items.map((item, index) => `
                                    <div class="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded group ${item.checked ? 'opacity-50' : ''}">
                                        <input
                                            type="checkbox"
                                            ${item.checked ? 'checked' : ''}
                                            class="packing-checkbox w-5 h-5 accent-${cat.color}-500 cursor-pointer"
                                            data-category="${key}"
                                            data-index="${index}"
                                        >
                                        <span class="flex-1 dark:text-gray-300 ${item.checked ? 'line-through' : ''}">${item.name}</span>
                                        ${!item.isDefault ? `
                                            <button
                                                class="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition text-sm delete-item-btn"
                                                data-category="${key}"
                                                data-index="${index}"
                                                title="Eliminar"
                                            >🗑️</button>
                                        ` : ''}
                                    </div>
                                `).join('')}
                                <!-- Add Item Button -->
                                <button
                                    class="w-full mt-2 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-${cat.color}-500 hover:text-${cat.color}-600 dark:hover:text-${cat.color}-400 transition add-item-btn"
                                    data-category="${key}"
                                >
                                    + Agregar item personalizado
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderJRPassGuide() {
        return `
            <div class="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg p-6">
                <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
                    🚆 Guía del JR Pass
                </h3>
                <div class="space-y-3 text-sm">
                    <div class="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                        <p class="font-bold mb-1">¿Qué es?</p>
                        <p class="text-xs opacity-90">Pase ilimitado para todos los trenes JR (incluyendo Shinkansen) por 7, 14 o 21 días.</p>
                    </div>
                    <div class="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                        <p class="font-bold mb-1">💰 Precio: ~$280 USD (7 días)</p>
                        <p class="text-xs opacity-90">Tu ahorro estimado: <strong>$520+</strong></p>
                    </div>
                    <div class="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                        <p class="font-bold mb-1">⚠️ MUY IMPORTANTE:</p>
                        <ul class="text-xs space-y-1 opacity-90">
                            <li>• Comprar ANTES de llegar a Japón</li>
                            <li>• Activar en aeropuerto Narita</li>
                            <li>• Mostrar pass en gates, NO máquinas</li>
                            <li>• NO cubre metros ni trenes privados</li>
                        </ul>
                    </div>
                    <a href="https://www.jrpass.com/" target="_blank" class="block w-full bg-white text-green-600 py-2 rounded-lg font-bold text-center hover:bg-gray-100 transition">
                        🌐 Comprar JR Pass
                    </a>
                </div>
            </div>
        `;
    },

    renderEssentialApps() {
        const apps = [
            { name: 'Google Maps', icon: '🗺️', desc: 'Navegación + offline', link: 'https://maps.google.com' },
            { name: 'Google Translate', icon: '🗣️', desc: 'Cámara para menús', link: 'https://translate.google.com' },
            { name: 'Hyperdia', icon: '🚆', desc: 'Horarios de trenes', link: 'https://www.hyperdia.com/en/' },
            { name: 'Japan Official Travel', icon: '🇯🇵', desc: 'Guía oficial', link: 'https://www.jnto.go.jp/smartapp/eng/' },
            { name: 'XE Currency', icon: '💱', desc: 'Conversor offline', link: 'https://www.xe.com/apps/' }
        ];

        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">📱 Apps Esenciales</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Descargar ANTES del viaje:</p>
                <div class="space-y-2">
                    ${apps.map(app => `
                        <a href="${app.link}" target="_blank" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                            <span class="text-2xl">${app.icon}</span>
                            <div class="flex-1">
                                <p class="font-semibold dark:text-white">${app.name}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${app.desc}</p>
                            </div>
                            <span class="text-gray-400">→</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderEmergencyInfo() {
        return `
            <div class="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <h3 class="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">🚨 Info de Emergencia</h3>
                <div class="space-y-3 text-sm">
                    <div>
                        <p class="font-bold text-gray-800 dark:text-white mb-1">Japón:</p>
                        <div class="space-y-1">
                            <a href="tel:110" class="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <span class="dark:text-gray-300">🚓 Policía</span>
                                <span class="font-bold text-red-600 dark:text-red-400">110</span>
                            </a>
                            <a href="tel:119" class="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <span class="dark:text-gray-300">🚑 Ambulancia</span>
                                <span class="font-bold text-red-600 dark:text-red-400">119</span>
                            </a>
                        </div>
                    </div>
                    <div>
                        <p class="font-bold text-gray-800 dark:text-white mb-1">Embajada CR:</p>
                        <a href="tel:+81-3-3486-1812" class="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <span class="dark:text-gray-300">📞 Contacto</span>
                            <span class="font-bold text-blue-600 dark:text-blue-400">+81-3-3486-1812</span>
                        </a>
                    </div>
                    <div>
                        <p class="font-bold text-gray-800 dark:text-white mb-1">💊 Farmacias 24/7:</p>
                        <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <p>• Matsumoto Kiyoshi (grandes ciudades)</p>
                            <p>• Sundrug (múltiples ubicaciones)</p>
                            <p>• Palabra clave: "薬局" (Yakkyoku)</p>
                        </div>
                    </div>
                    <div>
                        <p class="font-bold text-gray-800 dark:text-white mb-1">🏧 ATMs 24/7:</p>
                        <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <p>• 7-Eleven (acepta tarjetas extranjeras)</p>
                            <p>• FamilyMart, Lawson</p>
                            <p>• Japan Post Bank</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    toggleCategory(category) {
        const content = document.querySelector(`.category-content[data-category="${category}"]`);
        const arrow = document.querySelector(`.category-arrow[data-category="${category}"]`);
        
        if (content && arrow) {
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                arrow.textContent = '▲';
            } else {
                content.classList.add('hidden');
                arrow.textContent = '▼';
            }
        }
    },

    async toggleItem(category, index) {
        if (this.packingList[category] && this.packingList[category][index]) {
            this.packingList[category][index].checked = !this.packingList[category][index].checked;
            
            try {
                if (!auth.currentUser) {
                    // Sin usuario, solo guardar localmente
                    localStorage.setItem('packingList', JSON.stringify(this.packingList));
                    this.renderPreparation();
                    return;
                }

                const tripId = this.getCurrentTripId();

                if (!tripId) {
                    // Modo individual
                    const userId = auth.currentUser.uid;
                    const packingRef = doc(db, `users/${userId}/packing`, 'list');
                    
                    await setDoc(packingRef, {
                        items: this.packingList,
                        lastUpdated: new Date().toISOString(),
                        updatedBy: auth.currentUser.email
                    });
                    
                    console.log('✅ Packing list sincronizado (individual)');
                } else {
                    // 🔥 Modo colaborativo
                    const packingRef = doc(db, `trips/${tripId}/data`, 'packing');
                    
                    await setDoc(packingRef, {
                        items: this.packingList,
                        lastUpdated: new Date().toISOString(),
                        updatedBy: auth.currentUser.email
                    });
                    
                    console.log('✅ Packing list sincronizado (COMPARTIDO) por:', auth.currentUser.email);
                }
            } catch (error) {
                console.error('❌ Error guardando packing list:', error);
                // Revertir cambio si falla
                this.packingList[category][index].checked = !this.packingList[category][index].checked;
                this.renderPreparation();
                window.Notifications.error('Error al sincronizar. Intenta de nuevo.');
            }
        }
    },

    getTotalItems() {
        return Object.values(this.packingList).reduce((total, items) => total + items.length, 0);
    },

    getCheckedItems() {
        return Object.values(this.packingList).reduce((total, items) => 
            total + items.filter(i => i.checked).length, 0
        );
    },

    async addCustomItem(category) {
        const itemName = await window.Dialogs.prompt({
            title: '➕ Agregar Item Personalizado',
            message: `Ingresa el nombre del item para la categoría "${category}".`,
            placeholder: 'Ej: Batería extra'
        });
        if (!itemName) return; // El usuario canceló

        if (!this.packingList[category]) {
            this.packingList[category] = [];
        }

        this.packingList[category].push({
            name: itemName.trim(),
            checked: false,
            isDefault: false // Item personalizado, puede ser eliminado
        });

        await this.savePackingList('Item agregado');
    },

    async deleteCustomItem(category, index) {
        const confirmed = await window.Dialogs.confirm({
            title: '🗑️ ¿Eliminar Item?',
            message: 'Esta acción no se puede deshacer. ¿Estás seguro?',
            okText: 'Sí, eliminar',
            isDestructive: true
        });
        if (!confirmed) return;

        if (this.packingList[category] && this.packingList[category][index]) {
            this.packingList[category].splice(index, 1);
            await this.savePackingList('Item eliminado');
        }
    },

    async savePackingList(successMessage = 'Lista guardada') {
        try {
            if (!auth.currentUser) {
                // Sin usuario, solo guardar localmente
                localStorage.setItem('packingList', JSON.stringify(this.packingList));
                this.renderPreparation();
                return;
            }

            const tripId = this.getCurrentTripId();

            if (!tripId) {
                // Modo individual
                const userId = auth.currentUser.uid;
                const packingRef = doc(db, `users/${userId}/packing`, 'list');

                await setDoc(packingRef, {
                    items: this.packingList,
                    lastUpdated: new Date().toISOString(),
                    updatedBy: auth.currentUser.email
                });
            } else {
                // Modo colaborativo
                const packingRef = doc(db, `trips/${tripId}/data`, 'packing');

                await setDoc(packingRef, {
                    items: this.packingList,
                    lastUpdated: new Date().toISOString(),
                    updatedBy: auth.currentUser.email
                });
            }

            console.log('✅', successMessage);
        } catch (error) {
            console.error('❌ Error guardando packing list:', error);
            window.Notifications.error('Error al guardar. Intenta de nuevo.');
        }
    },

    attachEventListeners() {
        // Category toggles
        document.querySelectorAll('.category-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.currentTarget.dataset.category;
                this.toggleCategory(category);
            });
        });

        // Checkbox toggles
        document.querySelectorAll('.packing-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const category = e.target.dataset.category;
                const index = parseInt(e.target.dataset.index);
                this.toggleItem(category, index);
            });
        });

        // Add item buttons
        document.querySelectorAll('.add-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.currentTarget.dataset.category;
                this.addCustomItem(category);
            });
        });

        // Delete item buttons
        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Evitar que se marque el checkbox
                const category = e.currentTarget.dataset.category;
                const index = parseInt(e.currentTarget.dataset.index);
                this.deleteCustomItem(category, index);
            });
        });
    },

    // Re-inicializar cuando cambie el trip
    reinitialize() {
        this.initRealtimeSync();
    },

    // Cleanup
    cleanup() {
        if (this.unsubscribe) this.unsubscribe();
        this.unsubscribe = null;
        this.packingList = this.getDefaultPackingList();
        localStorage.removeItem('packingList');
        this.renderPreparation();
        console.log('[PreparationHandler] 🧹 Estado de preparación limpiado.');
    }
};

// Exponer globalmente
window.PreparationHandler = PreparationHandler;

// ====================================================================================
// MANEJO DE EVENTOS DE AUTENTICACIÓN
// ====================================================================================
window.addEventListener('auth:initialized', () => PreparationHandler.initRealtimeSync());
window.addEventListener('auth:loggedOut', () => PreparationHandler.cleanup());
