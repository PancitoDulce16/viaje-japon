// js/packing-list.js - Checklist de equipaje personalizable con sync

import { db, auth } from '/js/firebase-config.js';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const PackingList = {
  items: [],
  unsubscribe: null,

  // Plantilla predefinida de equipaje para Japón
  defaultItems: [
    // Documentos
    { category: 'Documentos', name: 'Pasaporte', checked: false, icon: '🛂' },
    { category: 'Documentos', name: 'Visa (si aplica)', checked: false, icon: '📄' },
    { category: 'Documentos', name: 'Seguro de viaje', checked: false, icon: '🏥' },
    { category: 'Documentos', name: 'Reservas de hotel (impresas)', checked: false, icon: '🏨' },
    { category: 'Documentos', name: 'Boletos de avión', checked: false, icon: '✈️' },
    { category: 'Documentos', name: 'JR Pass (si compraste)', checked: false, icon: '🎫' },
    { category: 'Documentos', name: 'Tarjetas de crédito/débito', checked: false, icon: '💳' },
    { category: 'Documentos', name: 'Efectivo (yenes)', checked: false, icon: '💴' },

    // Electrónicos
    { category: 'Electrónicos', name: 'Teléfono móvil', checked: false, icon: '📱' },
    { category: 'Electrónicos', name: 'Cargador de teléfono', checked: false, icon: '🔌' },
    { category: 'Electrónicos', name: 'Power bank', checked: false, icon: '🔋' },
    { category: 'Electrónicos', name: 'Adaptador de enchufe (Tipo A)', checked: false, icon: '🔌' },
    { category: 'Electrónicos', name: 'Cámara', checked: false, icon: '📷' },
    { category: 'Electrónicos', name: 'Auriculares', checked: false, icon: '🎧' },
    { category: 'Electrónicos', name: 'Pocket WiFi / SIM card', checked: false, icon: '📡' },

    // Ropa
    { category: 'Ropa', name: 'Ropa interior (7 días)', checked: false, icon: '👙' },
    { category: 'Ropa', name: 'Calcetines (7 pares)', checked: false, icon: '🧦' },
    { category: 'Ropa', name: 'Camisetas (5-7)', checked: false, icon: '👕' },
    { category: 'Ropa', name: 'Pantalones (3-4)', checked: false, icon: '👖' },
    { category: 'Ropa', name: 'Chaqueta / Abrigo', checked: false, icon: '🧥' },
    { category: 'Ropa', name: 'Zapatos cómodos para caminar', checked: false, icon: '👟' },
    { category: 'Ropa', name: 'Sandalias / Zapatos fáciles de quitar', checked: false, icon: '👡' },
    { category: 'Ropa', name: 'Pijama', checked: false, icon: '🩲' },
    { category: 'Ropa', name: 'Ropa deportiva (opcional)', checked: false, icon: '👟' },

    // Higiene Personal
    { category: 'Higiene', name: 'Cepillo y pasta de dientes', checked: false, icon: '🪥' },
    { category: 'Higiene', name: 'Champú / Acondicionador', checked: false, icon: '🧴' },
    { category: 'Higiene', name: 'Jabón / Gel de ducha', checked: false, icon: '🧼' },
    { category: 'Higiene', name: 'Desodorante', checked: false, icon: '💨' },
    { category: 'Higiene', name: 'Protector solar', checked: false, icon: '☀️' },
    { category: 'Higiene', name: 'Medicamentos personales', checked: false, icon: '💊' },
    { category: 'Higiene', name: 'Toallas sanitarias (para templos)', checked: false, icon: '🧻' },
    { category: 'Higiene', name: 'Mascarillas (cortesía japonesa)', checked: false, icon: '😷' },

    // Accesorios
    { category: 'Accesorios', name: 'Mochila pequeña / daypack', checked: false, icon: '🎒' },
    { category: 'Accesorios', name: 'Botella de agua reutilizable', checked: false, icon: '💧' },
    { category: 'Accesorios', name: 'Paraguas plegable', checked: false, icon: '☂️' },
    { category: 'Accesorios', name: 'Gafas de sol', checked: false, icon: '🕶️' },
    { category: 'Accesorios', name: 'Gorro / Sombrero', checked: false, icon: '🎩' },
    { category: 'Accesorios', name: 'Bolsas para ropa sucia', checked: false, icon: '👜' },
    { category: 'Accesorios', name: 'Candado para maleta', checked: false, icon: '🔒' },

    // Opcionales
    { category: 'Opcionales', name: 'Libro / E-reader', checked: false, icon: '📚' },
    { category: 'Opcionales', name: 'Cuaderno de viaje', checked: false, icon: '📔' },
    { category: 'Opcionales', name: 'Snacks para el viaje', checked: false, icon: '🍪' },
    { category: 'Opcionales', name: 'Almohada de viaje', checked: false, icon: '🛏️' },
    { category: 'Opcionales', name: 'Tapones para oídos', checked: false, icon: '👂' },
    { category: 'Opcionales', name: 'Antifaz para dormir', checked: false, icon: '😴' }
  ],

  // Inicializar
  async init() {
    console.log('🎒 Inicializando Packing List...');

    // Cargar desde localStorage como fallback
    const localData = localStorage.getItem('packingList');
    if (localData) {
      try {
        this.items = JSON.parse(localData);
      } catch (e) {
        console.error('Error parsing local packing list:', e);
        this.items = [...this.defaultItems];
      }
    } else {
      this.items = [...this.defaultItems];
    }

    // Si hay usuario autenticado, sincronizar
    if (auth.currentUser) {
      await this.initSync();
    }

    console.log('✅ Packing List listo con', this.items.length, 'items');
  },

  // Inicializar sync en tiempo real
  async initSync() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    if (!auth.currentUser) return;

    const tripId = this.getCurrentTripId();
    const userId = auth.currentUser.uid;

    let packingRef;

    if (tripId) {
      // Modo colaborativo: lista compartida del trip
      packingRef = doc(db, `trips/${tripId}/data`, 'packing');
      console.log('🎒 Packing List en modo colaborativo');
    } else {
      // Modo individual
      packingRef = doc(db, `users/${userId}/data`, 'packing');
      console.log('🎒 Packing List en modo individual');
    }

    this.unsubscribe = onSnapshot(packingRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        this.items = data.items || [...this.defaultItems];
      } else {
        // Si no existe, usar default
        this.items = [...this.defaultItems];
      }

      // Guardar en localStorage
      localStorage.setItem('packingList', JSON.stringify(this.items));

      // Actualizar UI si el modal está abierto
      this.renderList();

      console.log('✅ Packing List sincronizado');
    }, (error) => {
      console.error('❌ Error en sync de packing list:', error);
    });
  },

  // Obtener trip ID actual
  getCurrentTripId() {
    if (window.TripsManager && window.TripsManager.currentTrip) {
      return window.TripsManager.currentTrip.id;
    }
    return localStorage.getItem('currentTripId');
  },

  // Renderizar lista
  renderList() {
    const container = document.getElementById('packingListContainer');
    if (!container) return;

    // Agrupar por categoría
    const byCategory = this.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    // Calcular progreso
    const total = this.items.length;
    const checked = this.items.filter(item => item.checked).length;
    const progress = total > 0 ? (checked / total * 100).toFixed(0) : 0;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Progress bar -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-bold dark:text-white">Progreso de Equipaje</h3>
            <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">${progress}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold" style="width: ${progress}%">
              ${checked}/${total}
            </div>
          </div>
        </div>

        <!-- Categorías -->
        ${Object.entries(byCategory).map(([category, categoryItems]) => {
          const categoryChecked = categoryItems.filter(item => item.checked).length;
          const categoryTotal = categoryItems.length;
          const categoryProgress = categoryTotal > 0 ? (categoryChecked / categoryTotal * 100).toFixed(0) : 0;

          return `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <div class="flex justify-between items-center mb-3">
                <h4 class="text-md font-bold dark:text-white">${category}</h4>
                <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">${categoryChecked}/${categoryTotal}</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div class="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300" style="width: ${categoryProgress}%"></div>
              </div>
              <div class="space-y-2">
                ${categoryItems.map((item, index) => `
                  <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${item.checked ? 'opacity-60' : ''}">
                    <input
                      type="checkbox"
                      ${item.checked ? 'checked' : ''}
                      onchange="PackingList.toggleItem('${category}', ${index})"
                      class="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    >
                    <span class="text-2xl">${item.icon}</span>
                    <span class="flex-1 dark:text-white ${item.checked ? 'line-through' : ''}">${item.name}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}

        <!-- Botones de acción -->
        <div class="flex gap-3 flex-wrap">
          <button
            onclick="PackingList.addCustomItem()"
            class="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
          >
            ➕ Agregar Item Personalizado
          </button>
          <button
            onclick="PackingList.resetToDefault()"
            class="bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition"
          >
            🔄 Restaurar Lista Predeterminada
          </button>
        </div>
      </div>
    `;
  },

  // Toggle item check
  async toggleItem(category, index) {
    const categoryItems = this.items.filter(item => item.category === category);
    const item = categoryItems[index];

    if (!item) return;

    // Toggle checked status
    item.checked = !item.checked;

    // Guardar
    await this.saveList();

    // Vibración táctil
    if (window.MobileEnhancements) {
      window.MobileEnhancements.vibrate(item.checked ? [30] : [15]);
    }
  },

  // Agregar item personalizado
  async addCustomItem() {
    const name = prompt('Nombre del item:');
    if (!name || name.trim() === '') return;

    const category = prompt('Categoría (Documentos, Electrónicos, Ropa, Higiene, Accesorios, Opcionales):', 'Opcionales');
    if (!category) return;

    const icon = prompt('Emoji (opcional):', '📦');

    const newItem = {
      category: category.trim(),
      name: name.trim(),
      icon: icon || '📦',
      checked: false,
      custom: true
    };

    this.items.push(newItem);

    await this.saveList();

    if (window.Notifications) {
      window.Notifications.success(`✅ "${name}" agregado a la lista`);
    }
  },

  // Resetear a lista predeterminada
  async resetToDefault() {
    if (!confirm('¿Estás seguro de restaurar la lista predeterminada? Se perderán tus items personalizados.')) {
      return;
    }

    this.items = [...this.defaultItems];
    await this.saveList();

    if (window.Notifications) {
      window.Notifications.success('🔄 Lista restaurada');
    }
  },

  // Guardar lista
  async saveList() {
    // Guardar localmente
    localStorage.setItem('packingList', JSON.stringify(this.items));

    // Renderizar
    this.renderList();

    // Sincronizar con Firebase si hay usuario
    if (!auth.currentUser) return;

    try {
      const tripId = this.getCurrentTripId();
      const userId = auth.currentUser.uid;

      let packingRef;

      if (tripId) {
        packingRef = doc(db, `trips/${tripId}/data`, 'packing');
      } else {
        packingRef = doc(db, `users/${userId}/data`, 'packing');
      }

      await setDoc(packingRef, {
        items: this.items,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser.email
      });

      console.log('✅ Packing List guardado');
    } catch (error) {
      console.error('❌ Error guardando packing list:', error);
    }
  },

  // Re-inicializar cuando cambie el trip
  reinitialize() {
    this.initSync();
  }
};

// Exportar globalmente
window.PackingList = PackingList;
