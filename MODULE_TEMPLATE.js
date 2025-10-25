// js/MODULE_TEMPLATE.js - Template para nuevos módulos con Firestore
// Copia este archivo y reemplaza [MODULE_NAME] con el nombre de tu módulo

import { db, auth } from './firebase-config.js';
import { SafeFirestore } from './firestore-wrapper.js';
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  limit
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/**
 * 🎯 [MODULE_NAME] Handler
 * Ejemplo de módulo con manejo seguro de Firestore
 */
export const [MODULE_NAME]Handler = {

  // Estado interno
  data: [],
  currentTripId: null,
  unsubscribe: null,

  /**
   * Inicializar módulo
   */
  init(tripId) {
    console.log('🚀 Inicializando [MODULE_NAME]...');
    this.currentTripId = tripId;

    // Iniciar listener si hay trip
    if (tripId) {
      this.startRealtimeSync();
    } else {
      // Cargar datos locales si no hay trip
      this.loadFromLocalStorage();
    }
  },

  /**
   * 🔄 Sync en tiempo real con Firestore
   */
  startRealtimeSync() {
    // Limpiar listener anterior
    this.cleanup();

    if (!this.currentTripId) {
      console.log('⚠️ No hay tripId, usando solo localStorage');
      this.loadFromLocalStorage();
      return;
    }

    // Path del documento
    const docRef = doc(db, 'trips', this.currentTripId, 'modules', '[module_name]');

    console.log('🔍 [MODULE_NAME] - Path:', `trips/${this.currentTripId}/modules/[module_name]`);

    // ✅ USAR SAFEFIRESTORE - Maneja errores automáticamente
    this.unsubscribe = SafeFirestore.onSnapshotSafe(
      docRef,
      // onSuccess
      (docSnap) => {
        if (docSnap.exists()) {
          this.data = docSnap.data().items || [];
          console.log('✅ [MODULE_NAME] sincronizado:', this.data.length, 'items');
        } else {
          this.data = [];
          console.log('📝 Documento no existe aún');
        }

        // Guardar en localStorage como backup
        this.saveToLocalStorage();

        // Re-renderizar UI
        this.render();
      },
      // onError (opcional - SafeFirestore ya maneja errores)
      (error) => {
        console.error('❌ Error específico de [MODULE_NAME]:', error.code);
        // Puedes agregar lógica custom aquí si necesitas
      },
      // fallbackData (opcional - datos a usar si hay error)
      { exists: () => false, data: () => ({ items: [] }) }
    );
  },

  /**
   * 📥 Cargar datos de localStorage
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('[module_name]_data');
      this.data = stored ? JSON.parse(stored) : [];
      console.log('📱 [MODULE_NAME] cargado de localStorage:', this.data.length);
      this.render();
    } catch (error) {
      console.error('Error cargando localStorage:', error);
      this.data = [];
    }
  },

  /**
   * 💾 Guardar en localStorage
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem('[module_name]_data', JSON.stringify(this.data));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  },

  /**
   * ➕ Agregar nuevo item
   */
  async addItem(itemData) {
    if (!auth.currentUser) {
      console.log('⚠️ No hay usuario, guardando solo en localStorage');
      this.data.push({
        ...itemData,
        id: Date.now().toString(),
        addedAt: new Date().toISOString(),
        addedBy: 'local'
      });
      this.saveToLocalStorage();
      this.render();
      return { success: true };
    }

    if (!this.currentTripId) {
      console.log('⚠️ No hay trip, guardando solo en localStorage');
      this.data.push({
        ...itemData,
        id: Date.now().toString(),
        addedAt: new Date().toISOString(),
        addedBy: auth.currentUser.email
      });
      this.saveToLocalStorage();
      this.render();
      return { success: true };
    }

    // Guardar en Firestore
    const docRef = doc(db, 'trips', this.currentTripId, 'modules', '[module_name]');

    const newItem = {
      ...itemData,
      id: Date.now().toString(),
      addedAt: new Date().toISOString(),
      addedBy: auth.currentUser.email
    };

    const updatedItems = [...this.data, newItem];

    // ✅ USAR SAFEFIRESTORE
    const result = await SafeFirestore.setDocSafe(docRef, {
      items: updatedItems,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser.email
    }, { merge: true });

    if (result.success) {
      console.log('✅ Item agregado en Firestore');
    } else {
      console.error('❌ Error al agregar, guardando en localStorage');
      this.data = updatedItems;
      this.saveToLocalStorage();
      this.render();
    }

    return result;
  },

  /**
   * 🗑️ Eliminar item
   */
  async deleteItem(itemId) {
    if (!this.currentTripId || !auth.currentUser) {
      // Eliminar localmente
      this.data = this.data.filter(item => item.id !== itemId);
      this.saveToLocalStorage();
      this.render();
      return { success: true };
    }

    // Eliminar de Firestore
    const docRef = doc(db, 'trips', this.currentTripId, 'modules', '[module_name]');
    const updatedItems = this.data.filter(item => item.id !== itemId);

    const result = await SafeFirestore.setDocSafe(docRef, {
      items: updatedItems,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser.email
    }, { merge: true });

    if (!result.success) {
      console.error('❌ Error al eliminar, actualizando localmente');
      this.data = updatedItems;
      this.saveToLocalStorage();
      this.render();
    }

    return result;
  },

  /**
   * 🎨 Renderizar UI
   */
  render() {
    const container = document.getElementById('[module_name]Container');
    if (!container) return;

    if (this.data.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <p>No hay datos todavía</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.data.map(item => `
      <div class="item-card p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 class="font-bold">${item.name || 'Sin nombre'}</h3>
        <p class="text-sm text-gray-600">${item.description || ''}</p>
        <button
          onclick="[MODULE_NAME]Handler.deleteItem('${item.id}')"
          class="mt-2 text-red-500 hover:text-red-700"
        >
          🗑️ Eliminar
        </button>
      </div>
    `).join('');
  },

  /**
   * 🧹 Limpiar recursos
   */
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      console.log('🧹 [MODULE_NAME] listener limpiado');
    }
  },

  /**
   * 🔄 Re-inicializar con nuevo trip
   */
  reinitialize(newTripId) {
    console.log('🔄 [MODULE_NAME] reinicializando con trip:', newTripId);
    this.cleanup();
    this.init(newTripId);
  }
};

// Exponer globalmente
window.[MODULE_NAME]Handler = [MODULE_NAME]Handler;

// Escuchar cambios de trip
window.addEventListener('trip:changed', (event) => {
  const { tripId } = event.detail;
  [MODULE_NAME]Handler.reinitialize(tripId);
});

// Limpiar al salir
window.addEventListener('beforeunload', () => {
  [MODULE_NAME]Handler.cleanup();
});

console.log('✅ [MODULE_NAME]Handler module loaded');

export default [MODULE_NAME]Handler;
