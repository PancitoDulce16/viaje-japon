/**
 * 💾 ML STORAGE MANAGER
 * ======================
 *
 * Sistema de almacenamiento para datos de Machine Learning.
 * Usa IndexedDB para almacenamiento eficiente local y Firebase para sync.
 *
 * Stores:
 * - Sessions (sensor data por sesión)
 * - Patterns (patrones detectados)
 * - Features (features procesadas)
 * - Models (datos de modelos entrenados)
 * - Predictions (predicciones históricas)
 */

class MLStorage {
  constructor() {
    this.dbName = 'JapitinMLDatabase';
    this.version = 1;
    this.db = null;

    this.stores = {
      sessions: 'sessions',
      patterns: 'patterns',
      features: 'features',
      models: 'models',
      predictions: 'predictions',
      clusters: 'clusters'
    };

    console.log('💾 ML Storage Manager initializing...');
    this.initDB();
  }

  /**
   * 🔧 INITIALIZE INDEXEDDB
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('❌ Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        console.log('🔄 Upgrading IndexedDB schema...');
        const db = event.target.result;

        // Sessions store
        if (!db.objectStoreNames.contains(this.stores.sessions)) {
          const sessionsStore = db.createObjectStore(this.stores.sessions, {
            keyPath: 'sessionId'
          });
          sessionsStore.createIndex('userId', 'userId', { unique: false });
          sessionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Patterns store
        if (!db.objectStoreNames.contains(this.stores.patterns)) {
          const patternsStore = db.createObjectStore(this.stores.patterns, {
            keyPath: 'id',
            autoIncrement: true
          });
          patternsStore.createIndex('userId', 'userId', { unique: false });
          patternsStore.createIndex('type', 'type', { unique: false });
          patternsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Features store
        if (!db.objectStoreNames.contains(this.stores.features)) {
          const featuresStore = db.createObjectStore(this.stores.features, {
            keyPath: 'id',
            autoIncrement: true
          });
          featuresStore.createIndex('userId', 'userId', { unique: false });
          featuresStore.createIndex('sessionId', 'sessionId', { unique: false });
          featuresStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Models store
        if (!db.objectStoreNames.contains(this.stores.models)) {
          const modelsStore = db.createObjectStore(this.stores.models, {
            keyPath: 'modelId'
          });
          modelsStore.createIndex('type', 'type', { unique: false });
          modelsStore.createIndex('version', 'version', { unique: false });
        }

        // Predictions store
        if (!db.objectStoreNames.contains(this.stores.predictions)) {
          const predictionsStore = db.createObjectStore(this.stores.predictions, {
            keyPath: 'id',
            autoIncrement: true
          });
          predictionsStore.createIndex('userId', 'userId', { unique: false });
          predictionsStore.createIndex('modelId', 'modelId', { unique: false });
          predictionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Clusters store
        if (!db.objectStoreNames.contains(this.stores.clusters)) {
          const clustersStore = db.createObjectStore(this.stores.clusters, {
            keyPath: 'id',
            autoIncrement: true
          });
          clustersStore.createIndex('algorithm', 'algorithm', { unique: false });
          clustersStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('✅ IndexedDB schema upgraded');
      };
    });
  }

  /**
   * 💾 SAVE SESSION DATA
   */
  async saveSession(sessionData) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.sessions], 'readwrite');
      const store = transaction.objectStore(this.stores.sessions);

      const data = {
        ...sessionData,
        savedAt: Date.now(),
        userId: window.firebase?.auth()?.currentUser?.uid || 'anonymous'
      };

      const request = store.put(data);

      request.onsuccess = () => {
        console.log('💾 Session saved:', sessionData.sessionId);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error saving session:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 📖 GET SESSION DATA
   */
  async getSession(sessionId) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.sessions], 'readonly');
      const store = transaction.objectStore(this.stores.sessions);
      const request = store.get(sessionId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 📊 GET ALL SESSIONS FOR USER
   */
  async getUserSessions(userId = null, limit = 100) {
    if (!this.db) await this.initDB();

    const uid = userId || window.firebase?.auth()?.currentUser?.uid || 'anonymous';

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.sessions], 'readonly');
      const store = transaction.objectStore(this.stores.sessions);
      const index = store.index('userId');
      const request = index.getAll(uid, limit);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 💾 SAVE PATTERN
   */
  async savePattern(patternData) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.patterns], 'readwrite');
      const store = transaction.objectStore(this.stores.patterns);

      const data = {
        ...patternData,
        savedAt: Date.now(),
        userId: window.firebase?.auth()?.currentUser?.uid || 'anonymous',
        timestamp: Date.now()
      };

      const request = store.add(data);

      request.onsuccess = () => {
        console.log('💾 Pattern saved');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error saving pattern:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 📖 GET PATTERNS
   */
  async getPatterns(userId = null, type = null) {
    if (!this.db) await this.initDB();

    const uid = userId || window.firebase?.auth()?.currentUser?.uid || 'anonymous';

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.patterns], 'readonly');
      const store = transaction.objectStore(this.stores.patterns);
      const index = type ? store.index('type') : store.index('userId');
      const key = type || uid;
      const request = index.getAll(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 💾 SAVE FEATURES
   */
  async saveFeatures(featuresData) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.features], 'readwrite');
      const store = transaction.objectStore(this.stores.features);

      const data = {
        ...featuresData,
        savedAt: Date.now(),
        userId: window.firebase?.auth()?.currentUser?.uid || 'anonymous',
        timestamp: Date.now()
      };

      const request = store.add(data);

      request.onsuccess = () => {
        console.log('💾 Features saved');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error saving features:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 📖 GET FEATURES
   */
  async getFeatures(userId = null, sessionId = null) {
    if (!this.db) await this.initDB();

    const uid = userId || window.firebase?.auth()?.currentUser?.uid || 'anonymous';

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.features], 'readonly');
      const store = transaction.objectStore(this.stores.features);
      const index = sessionId ? store.index('sessionId') : store.index('userId');
      const key = sessionId || uid;
      const request = index.getAll(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 💾 SAVE MODEL
   */
  async saveModel(modelData) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.models], 'readwrite');
      const store = transaction.objectStore(this.stores.models);

      const data = {
        ...modelData,
        savedAt: Date.now()
      };

      const request = store.put(data);

      request.onsuccess = () => {
        console.log('💾 Model saved:', modelData.modelId);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error saving model:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 📖 GET MODEL
   */
  async getModel(modelId) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.models], 'readonly');
      const store = transaction.objectStore(this.stores.models);
      const request = store.get(modelId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 💾 SAVE PREDICTION
   */
  async savePrediction(predictionData) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.predictions], 'readwrite');
      const store = transaction.objectStore(this.stores.predictions);

      const data = {
        ...predictionData,
        savedAt: Date.now(),
        userId: window.firebase?.auth()?.currentUser?.uid || 'anonymous',
        timestamp: Date.now()
      };

      const request = store.add(data);

      request.onsuccess = () => {
        console.log('💾 Prediction saved');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error saving prediction:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 📖 GET PREDICTIONS
   */
  async getPredictions(userId = null, modelId = null) {
    if (!this.db) await this.initDB();

    const uid = userId || window.firebase?.auth()?.currentUser?.uid || 'anonymous';

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.predictions], 'readonly');
      const store = transaction.objectStore(this.stores.predictions);
      const index = modelId ? store.index('modelId') : store.index('userId');
      const key = modelId || uid;
      const request = index.getAll(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 💾 SAVE CLUSTERS
   */
  async saveClusters(clusterData) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.clusters], 'readwrite');
      const store = transaction.objectStore(this.stores.clusters);

      const data = {
        ...clusterData,
        savedAt: Date.now(),
        timestamp: Date.now()
      };

      const request = store.add(data);

      request.onsuccess = () => {
        console.log('💾 Clusters saved');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error saving clusters:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 🗑️ CLEANUP OLD DATA
   */
  async cleanup(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 días
    if (!this.db) await this.initDB();

    const cutoffTime = Date.now() - maxAge;
    let deletedCount = 0;

    // Limpiar cada store
    for (const storeName of Object.values(this.stores)) {
      try {
        const count = await this.cleanupStore(storeName, cutoffTime);
        deletedCount += count;
      } catch (e) {
        console.error(`Error cleaning ${storeName}:`, e);
      }
    }

    console.log(`🗑️ Cleanup completed: ${deletedCount} items deleted`);
    return deletedCount;
  }

  async cleanupStore(storeName, cutoffTime) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      let deletedCount = 0;

      // Si tiene índice timestamp, úsalo
      if (store.indexNames.contains('timestamp')) {
        const index = store.index('timestamp');
        const range = IDBKeyRange.upperBound(cutoffTime);
        const request = index.openCursor(range);

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            resolve(deletedCount);
          }
        };

        request.onerror = () => reject(request.error);
      } else {
        resolve(0);
      }
    });
  }

  /**
   * 📊 GET STATISTICS
   */
  async getStatistics() {
    if (!this.db) await this.initDB();

    const stats = {};

    for (const [key, storeName] of Object.entries(this.stores)) {
      stats[key] = await this.getStoreCount(storeName);
    }

    return stats;
  }

  async getStoreCount(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * ☁️ SYNC TO FIREBASE (opcional)
   */
  async syncToFirebase() {
    const userId = window.firebase?.auth()?.currentUser?.uid;
    if (!userId) {
      console.warn('⚠️ No authenticated user, skipping Firebase sync');
      return;
    }

    try {
      // Obtener todos los datos locales
      const sessions = await this.getUserSessions(userId);
      const patterns = await this.getPatterns(userId);
      const features = await this.getFeatures(userId);
      const predictions = await this.getPredictions(userId);

      // Guardar en Firebase
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const { db } = await import('/js/firebase-config.js');

      const mlDataRef = doc(db, 'ml_data', userId);

      await setDoc(mlDataRef, {
        sessions: sessions.slice(-50), // Últimas 50 sesiones
        patterns: patterns.slice(-100),
        features: features.slice(-100),
        predictions: predictions.slice(-100),
        lastSync: Date.now()
      }, { merge: true });

      console.log('☁️ ML data synced to Firebase');
    } catch (error) {
      console.error('❌ Error syncing to Firebase:', error);
    }
  }

  /**
   * 📥 RESTORE FROM FIREBASE
   */
  async restoreFromFirebase() {
    const userId = window.firebase?.auth()?.currentUser?.uid;
    if (!userId) {
      console.warn('⚠️ No authenticated user, cannot restore from Firebase');
      return;
    }

    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const { db } = await import('/js/firebase-config.js');

      const mlDataRef = doc(db, 'ml_data', userId);
      const mlDataSnap = await getDoc(mlDataRef);

      if (!mlDataSnap.exists()) {
        console.log('ℹ️ No ML data found in Firebase');
        return;
      }

      const data = mlDataSnap.data();

      // Restaurar sesiones
      if (data.sessions) {
        for (const session of data.sessions) {
          await this.saveSession(session);
        }
      }

      // Restaurar patrones
      if (data.patterns) {
        for (const pattern of data.patterns) {
          await this.savePattern(pattern);
        }
      }

      // Restaurar features
      if (data.features) {
        for (const feature of data.features) {
          await this.saveFeatures(feature);
        }
      }

      // Restaurar predictions
      if (data.predictions) {
        for (const prediction of data.predictions) {
          await this.savePrediction(prediction);
        }
      }

      console.log('📥 ML data restored from Firebase');
    } catch (error) {
      console.error('❌ Error restoring from Firebase:', error);
    }
  }

  /**
   * 🗑️ CLEAR ALL DATA
   */
  async clearAll() {
    if (!confirm('⚠️ Esta acción eliminará TODOS los datos de ML. ¿Continuar?')) {
      return false;
    }

    if (!this.db) await this.initDB();

    for (const storeName of Object.values(this.stores)) {
      await this.clearStore(storeName);
    }

    console.log('🗑️ All ML data cleared');
    return true;
  }

  async clearStore(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.MLStorage = new MLStorage();
}

export default MLStorage;
