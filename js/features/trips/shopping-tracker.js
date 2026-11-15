import { shoppingState, shoppingText as safe } from './shopping-state.js';
import { enhanceDialog } from '../../ui/dialog-a11y.js';
﻿// js/shopping-tracker.js - Sistema de seguimiento de compras para viajes

/**
 * Shopping Tracker - Gestión de compras durante el viaje
 * Ayuda a planificar y rastrear compras con control de presupuesto y logística
 */
export const ShoppingTracker = {
  currentTripId: null,
  shoppingList: [],

  // Categorías predefinidas de compras en Japón
  CATEGORIES: {
    electronics: { name: 'Electrónicos', icon: '💻', color: 'blue' },
    fashion: { name: 'Ropa & Moda', icon: '👗', color: 'pink' },
    souvenirs: { name: 'Souvenirs', icon: '🎁', color: 'purple' },
    anime: { name: 'Anime & Manga', icon: '📚', color: 'red' },
    beauty: { name: 'Belleza & Skincare', icon: '💄', color: 'rose' },
    food: { name: 'Comida & Snacks', icon: '🍡', color: 'orange' },
    collectibles: { name: 'Coleccionables', icon: '🎨', color: 'indigo' },
    stationery: { name: 'Papelería', icon: '✏️', color: 'yellow' },
    other: { name: 'Otros', icon: '📦', color: 'gray' }
  },

  // Tiendas populares en Japón
  STORES: {
    akihabara: { name: 'Akihabara (Electrónicos/Anime)', city: 'Tokyo', area: 'Akihabara' },
    harajuku: { name: 'Harajuku (Moda)', city: 'Tokyo', area: 'Harajuku' },
    shibuya: { name: 'Shibuya (Moda/General)', city: 'Tokyo', area: 'Shibuya' },
    shinjuku: { name: 'Shinjuku (General)', city: 'Tokyo', area: 'Shinjuku' },
    donki: { name: 'Don Quijote (Todo)', city: 'Multiple', area: 'Multiple' },
    bic_camera: { name: 'Bic Camera (Electrónicos)', city: 'Multiple', area: 'Multiple' },
    yodobashi: { name: 'Yodobashi Camera (Electrónicos)', city: 'Multiple', area: 'Multiple' },
    muji: { name: 'MUJI', city: 'Multiple', area: 'Multiple' },
    uniqlo: { name: 'UNIQLO', city: 'Multiple', area: 'Multiple' },
    daiso: { name: 'Daiso (¥100)', city: 'Multiple', area: 'Multiple' },
    animate: { name: 'Animate (Anime)', city: 'Multiple', area: 'Multiple' },
    mandarake: { name: 'Mandarake (Anime usado)', city: 'Multiple', area: 'Multiple' },
    tokyu_hands: { name: 'Tokyu Hands', city: 'Tokyo', area: 'Shibuya' },
    loft: { name: 'LOFT', city: 'Multiple', area: 'Multiple' },
    nishiki_market: { name: 'Mercado Nishiki', city: 'Kyoto', area: 'Nakagyo' },
    dotonbori: { name: 'Dotonbori', city: 'Osaka', area: 'Namba' }
  },

  /**
   * Inicializa el tracker para un trip específico
   */
  ...shoppingState,

  open() {
    const tripId=window.TripsManager?.currentTrip?.id;
    if(tripId!==this.currentTripId)this.init(tripId);
    this.renderShoppingTracker();
  },

  /**
   * Renderiza el Shopping Tracker completo
   */
  renderShoppingTracker() {
    // Remover modal existente si existe
    const existingModal = document.getElementById('shoppingTrackerModal');
    if (existingModal) existingModal.remove();

    const stats = this.getStats();

    const modalHTML = `
      <div id="shoppingTrackerModal" class="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">

          <!-- Header -->
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold">🛍️ Shopping Tracker</h2>
                <p class="text-purple-100 mt-1">Gestiona tus compras en Japón</p>
              </div>
              <button onclick="window.ShoppingTracker.close()" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Stats Bar -->
            <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-white/10 backdrop-blur rounded-lg p-3">
                <div class="text-xs text-purple-100">Total Items</div>
                <div class="text-2xl font-bold">${stats.total}</div>
              </div>
              <div class="bg-white/10 backdrop-blur rounded-lg p-3">
                <div class="text-xs text-purple-100">Comprados</div>
                <div class="text-2xl font-bold text-green-300">${stats.purchased}</div>
              </div>
              <div class="bg-white/10 backdrop-blur rounded-lg p-3">
                <div class="text-xs text-purple-100">Presupuesto</div>
                <div class="text-lg font-bold">¥${stats.totalEstimated.toLocaleString()}</div>
              </div>
              <div class="bg-white/10 backdrop-blur rounded-lg p-3">
                <div class="text-xs text-purple-100">Gastado registrado</div>
                <div class="text-lg font-bold text-yellow-300">¥${stats.totalActual.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <!-- Actions Bar -->
          <div class="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <button onclick="window.ShoppingTracker.showAddItemForm()"
                    class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg transition">
              ➕ Agregar Item
            </button>
          </div>

          <!-- Shopping List -->
          <div class="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            ${stats.missingActual ? `<p role="status">${stats.missingActual} compras sin precio real registrado.</p>` : ""}
            ${this.renderShoppingList()}
          </div>

          <!-- Footer with Weight Warning -->
          ${stats.totalWeight > 15 ? `
            <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t-2 border-yellow-400">
              <p class="text-sm text-yellow-800 dark:text-yellow-300 font-semibold">
                ⚠️ Peso total: ${stats.totalWeight.toFixed(1)} kg - ¡Cuidado con el límite de equipaje!
              </p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal=document.getElementById('shoppingTrackerModal');
    modal.addEventListener('click',event=>{const button=event.target.closest('[data-shopping-action]');if(!button)return;const id=button.dataset.shoppingId;({purchase:()=>this.showPurchaseDialog(id),edit:()=>this.editItem(id),delete:()=>this.deleteItem(id)})[button.dataset.shoppingAction]?.();});
    enhanceDialog(modal,{onClose:()=>this.close()});
  },

  /**
   * Renderiza la lista de items
   */
  renderShoppingList() {
    if(this.loadState==='loading')return '<p role="status">Cargando compras...</p>';
    if(this.loadState==='error')return '<p role="alert">No se pudieron cargar las compras.</p><button onclick="window.ShoppingTracker.loadShoppingList()">Reintentar</button>';

    if (this.shoppingList.length === 0) {
      return `
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🛒</div>
          <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            No hay items en tu lista
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Empieza agregando cosas que quieras comprar en Japón
          </p>
        </div>
      `;
    }

    // Agrupar por categoría
    const byCategory = {};
    this.shoppingList.forEach(item => {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item);
    });

    let html = '';

    Object.keys(byCategory).forEach(categoryKey => {
      const category = this.CATEGORIES[categoryKey];
      const items = byCategory[categoryKey];

      html += `
        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <span class="text-2xl">${category.icon}</span>
            ${category.name}
            <span class="text-sm font-normal text-gray-500">(${items.length})</span>
          </h3>

          <div class="space-y-3">
            ${items.map(item => this.renderShoppingItem(item)).join('')}
          </div>
        </div>
      `;
    });

    return html;
  },

  /**
   * Renderiza un item individual
   */
  renderShoppingItem(item) {
    item=this.normalizeItem(item);if(!item)return "";
    const category = this.CATEGORIES[item.category];
    const isPurchased = item.status === 'purchased';
    const isSkipped = item.status === 'skipped';

    const priorityColors = {
      high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      low: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
    };

    return `
      <div class="border-2 ${isPurchased ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : isSkipped ? 'border-gray-300 bg-gray-50 dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'} rounded-xl p-4 hover:shadow-lg transition">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <!-- Item Info -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h4 class="text-lg font-bold text-gray-900 dark:text-white ${isPurchased ? 'line-through' : ''}">
                ${safe(item.name)}
              </h4>
              ${isPurchased ? '<span class="text-xl">✅</span>' : ''}
              ${isSkipped ? '<span class="text-xl">⏭️</span>' : ''}
            </div>

            <div class="flex flex-wrap gap-2 mb-2">
              <span class="${priorityColors[item.priority]} px-2 py-1 rounded-full text-xs font-semibold">
                ${item.priority === 'high' ? '🔥' : item.priority === 'medium' ? '⚡' : '💤'} ${item.priority.toUpperCase()}
              </span>

              ${item.store ? `
                <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                  📍 ${safe(this.STORES[item.store]?.name || item.store)}
                </span>
              ` : ''}

              ${item.quantity > 1 ? `
                <span class="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs">
                  ×${item.quantity}
                </span>
              ` : ''}
            </div>

            ${item.notes ? `
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${safe(item.notes)}</p>
            ` : ''}

            <div class="flex flex-wrap items-center gap-4 text-sm">
              <span class="text-gray-700 dark:text-gray-300">
                💰 Estimado: <strong>¥${(item.estimatedPrice * item.quantity).toLocaleString()}</strong>
              </span>
              ${isPurchased ? `
                <span class="text-green-700 dark:text-green-300">
                  ✅ Real: <strong>¥${item.actualPrice===null ? "Sin registrar" : (item.actualPrice*item.quantity).toLocaleString()}</strong>
                </span>
              ` : ''}
              ${item.weight > 0 ? `
                <span class="text-gray-600 dark:text-gray-400">
                  ⚖️ ${(item.weight * item.quantity).toFixed(1)} kg
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2 ml-4">
            ${!isPurchased && !isSkipped ? `
              <button data-shopping-action="purchase" data-shopping-id="${safe(item.id)}"
                      class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition">
                ✅ Comprado
              </button>
              <button data-shopping-action="edit" data-shopping-id="${safe(item.id)}"
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition">
                ✏️ Editar
              </button>
            ` : ''}
            <button data-shopping-action="delete" data-shopping-id="${safe(item.id)}"
                    class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Muestra el formulario para agregar un item
   */
  showAddItemForm(editId=null) {
    const context=this.context();if(!this.isCurrent(context)||this.loadState!=='ready')return;
    const item=editId?this.shoppingList.find(row=>row.id===editId):null;if(editId&&!item)return;
    document.getElementById('addItemForm')?.remove();
    const formHTML = `
      <div id="addItemForm" class="fixed inset-0 z-[10002] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

          <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <h2 class="text-2xl font-bold">➕ Agregar Item a la Lista</h2>
          </div>

          <div class="p-6 space-y-4">
            <!-- Nombre -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nombre del producto <span class="text-red-500">*</span>
              </label>
              <input type="text" id="itemName" maxlength="160"
                     class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                     placeholder="Ej: Nintendo Switch">
            </div>

            <!-- Categoría -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Categoría <span class="text-red-500">*</span>
              </label>
              <select id="itemCategory" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                ${Object.entries(this.CATEGORIES).map(([key, cat]) => `
                  <option value="${key}">${cat.icon} ${cat.name}</option>
                `).join('')}
              </select>
            </div>

            <!-- Tienda -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tienda (opcional)
              </label>
              <select id="itemStore" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Sin especificar</option>
                ${Object.entries(this.STORES).map(([key, store]) => `
                  <option value="${key}">${store.name}</option>
                `).join('')}
              </select>
            </div>

            <!-- Precio y Cantidad -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Precio estimado por unidad (JPY)
                </label>
                <input type="number" id="itemPrice" value="0" min="0" step="1"
                       class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad
                </label>
                <input type="number" id="itemQuantity" value="1" min="1" max="999" step="1"
                       class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              </div>
            </div>

            <!-- Prioridad y Peso -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Prioridad
                </label>
                <select id="itemPriority" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                  <option value="low">💤 Baja</option>
                  <option value="medium" selected>⚡ Media</option>
                  <option value="high">🔥 Alta</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Peso estimado (kg)
                </label>
                <input type="number" id="itemWeight" value="0" min="0" step="0.1"
                       class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              </div>
            </div>

            <!-- Notas -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Notas (opcional)
              </label>
              <textarea id="itemNotes" maxlength="2000" rows="2"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="Ej: Comprar en oferta, tax-free"></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-6 bg-gray-50 dark:bg-gray-900 border-t flex gap-3">
            <button onclick="window.ShoppingTracker.saveNewItem()"
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition">
              ✅ Agregar Item
            </button>
            <button onclick="document.getElementById('addItemForm').remove()"
                    class="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-lg transition">
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);
    const form=document.getElementById('addItemForm');form.shoppingContext=context;form.shoppingItem=item?{...item}:null;
    if(item){form.querySelector('h2').textContent='Editar art\u00edculo';form.querySelector('button').textContent='Guardar cambios';
      for(const [field,key] of Object.entries({itemName:'name',itemCategory:'category',itemStore:'store',itemPrice:'estimatedPrice',itemQuantity:'quantity',itemPriority:'priority',itemWeight:'weight',itemNotes:'notes'})){
        const input=form.querySelector('#'+field);if(key==='store'&&item.store&&!this.STORES[item.store])input.add(new Option(item.store,item.store));input.value=item[key]??'';
      }
    }
    form.querySelectorAll('input,select,textarea').forEach(input=>{const label=input.parentElement.querySelector('label');if(label)label.htmlFor=input.id;});
    enhanceDialog(form,{onClose:()=>{if(!form.saving)form.remove();}});
  },

  /**
   * Guarda un nuevo item desde el formulario
   */
  showPurchaseDialog(itemId) {
    const context=this.context();if(!this.isCurrent(context))return;
    document.getElementById("purchaseDialog")?.remove();
    const item = this.shoppingList.find(i => i.id === itemId);
    if (!item) return;

    const dialogHTML = `
      <div id="purchaseDialog" class="fixed inset-0 z-[10002] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ✅ Marcar como comprado
          </h3>

          <p class="text-gray-700 dark:text-gray-300 mb-4">
            <strong>${safe(item.name)}</strong>
          </p>

          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Precio real por unidad (JPY)
          </label>
          <input type="number" id="actualPrice" value="${item.estimatedPrice}" min="0" step="1"
                 class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-4">

          <div class="flex gap-3">
            <button data-confirm-purchase
                    class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition">
              ✅ Confirmar
            </button>
            <button onclick="document.getElementById('purchaseDialog').remove()"
                    class="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-white font-bold rounded-lg transition">
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    const dialog=document.getElementById('purchaseDialog');dialog.shoppingContext=context;
    dialog.querySelector('[data-confirm-purchase]').onclick=()=>this.confirmPurchase(itemId);
    dialog.querySelector('label').htmlFor='actualPrice';
    enhanceDialog(dialog,{onClose:()=>{if(!dialog.saving)dialog.remove();}});
  },

  /**
   * Confirma la compra con el precio real
   */
  close() {
    const modal = document.getElementById('shoppingTrackerModal');
    if (modal) modal.remove();
  }
};

// Exportar globalmente
window.ShoppingTracker = ShoppingTracker;
window.addEventListener('tripSelected',event=>ShoppingTracker.init(event.detail?.trip?.id||null));
window.addEventListener('auth:loggedOut',()=>ShoppingTracker.init(null));

console.log('✅ Shopping Tracker cargado');

export default ShoppingTracker;
