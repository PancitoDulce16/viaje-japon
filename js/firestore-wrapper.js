// js/firestore-wrapper.js - Wrapper seguro para operaciones de Firestore
// Previene errores no manejados y proporciona fallbacks automáticos

import { db, auth } from './firebase-config.js';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
  onSnapshot,
  addDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/**
 * 🛡️ Wrapper Seguro para Firestore
 * Todos los métodos manejan errores automáticamente y proporcionan fallbacks
 */
export const SafeFirestore = {

  /**
   * Listener seguro con manejo automático de errores
   */
  onSnapshotSafe(ref, onSuccess, onError = null, fallbackData = null) {
    const defaultErrorHandler = (error) => {
      console.error('❌ SafeFirestore onSnapshot error:', {
        code: error.code,
        message: error.message,
        path: ref.path || 'unknown',
        userId: auth.currentUser?.uid
      });

      // Si hay datos de fallback, usarlos
      if (fallbackData !== null && onSuccess) {
        console.log('⚠️ Usando fallback data debido al error');
        onSuccess(fallbackData);
      }

      // Llamar al error handler custom si existe
      if (onError) {
        onError(error);
      }
    };

    // Crear el listener con error handler
    const unsubscribe = onSnapshot(ref, onSuccess, defaultErrorHandler);

    return unsubscribe;
  },

  /**
   * getDoc seguro con retry automático
   */
  async getDocSafe(docRef, options = {}) {
    const {
      maxRetries = 3,
      fallback = null,
      silent = false
    } = options;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const docSnap = await getDoc(docRef);
        return { success: true, data: docSnap, error: null };
      } catch (error) {
        if (!silent) {
          console.error(`❌ SafeFirestore getDoc error (attempt ${attempt + 1}/${maxRetries}):`, {
            code: error.code,
            message: error.message,
            path: docRef.path
          });
        }

        // Si es permission-denied, no reintentar
        if (error.code === 'permission-denied') {
          return { success: false, data: fallback, error };
        }

        // Si es el último intento, devolver fallback
        if (attempt === maxRetries - 1) {
          return { success: false, data: fallback, error };
        }

        // Esperar antes de reintentar (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  },

  /**
   * setDoc seguro
   */
  async setDocSafe(docRef, data, options = {}) {
    const { merge = false, silent = false } = options;

    try {
      await setDoc(docRef, data, { merge });
      return { success: true, error: null };
    } catch (error) {
      if (!silent) {
        console.error('❌ SafeFirestore setDoc error:', {
          code: error.code,
          message: error.message,
          path: docRef.path
        });
      }
      return { success: false, error };
    }
  },

  /**
   * updateDoc seguro (verifica existencia primero)
   */
  async updateDocSafe(docRef, data, options = {}) {
    const { createIfNotExists = true, silent = false } = options;

    try {
      // Intentar actualizar
      await updateDoc(docRef, data);
      return { success: true, error: null };
    } catch (error) {
      // Si no existe y createIfNotExists está activo, crear
      if (error.code === 'not-found' && createIfNotExists) {
        if (!silent) {
          console.log('📝 Documento no existe, creándolo...');
        }
        return await this.setDocSafe(docRef, data, { merge: true, silent });
      }

      if (!silent) {
        console.error('❌ SafeFirestore updateDoc error:', {
          code: error.code,
          message: error.message,
          path: docRef.path
        });
      }
      return { success: false, error };
    }
  },

  /**
   * deleteDoc seguro
   */
  async deleteDocSafe(docRef, options = {}) {
    const { silent = false } = options;

    try {
      await deleteDoc(docRef);
      return { success: true, error: null };
    } catch (error) {
      if (!silent) {
        console.error('❌ SafeFirestore deleteDoc error:', {
          code: error.code,
          message: error.message,
          path: docRef.path
        });
      }
      return { success: false, error };
    }
  },

  /**
   * Query segura con manejo automático de errores
   */
  async queryDocsSafe(queryRef, options = {}) {
    const {
      maxRetries = 3,
      fallback = [],
      silent = false
    } = options;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const snapshot = await getDocs(queryRef);
        const docs = [];
        snapshot.forEach(doc => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: docs, error: null };
      } catch (error) {
        if (!silent) {
          console.error(`❌ SafeFirestore query error (attempt ${attempt + 1}/${maxRetries}):`, {
            code: error.code,
            message: error.message
          });
        }

        // Si es permission-denied, no reintentar
        if (error.code === 'permission-denied') {
          return { success: false, data: fallback, error };
        }

        // Si es el último intento, devolver fallback
        if (attempt === maxRetries - 1) {
          return { success: false, data: fallback, error };
        }

        // Esperar antes de reintentar
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  },

  /**
   * addDoc seguro
   */
  async addDocSafe(collectionRef, data, options = {}) {
    const { silent = false } = options;

    try {
      const docRef = await addDoc(collectionRef, data);
      return { success: true, docRef, error: null };
    } catch (error) {
      if (!silent) {
        console.error('❌ SafeFirestore addDoc error:', {
          code: error.code,
          message: error.message,
          path: collectionRef.path
        });
      }
      return { success: false, docRef: null, error };
    }
  },

  /**
   * Helper: Verificar si el usuario tiene acceso
   */
  async checkAccess(docRef) {
    const result = await this.getDocSafe(docRef, {
      silent: true,
      maxRetries: 1
    });

    if (result.error?.code === 'permission-denied') {
      return false;
    }

    return result.success;
  }
};

// Exponer globalmente
window.SafeFirestore = SafeFirestore;

console.log('🛡️ SafeFirestore wrapper loaded');

export default SafeFirestore;
