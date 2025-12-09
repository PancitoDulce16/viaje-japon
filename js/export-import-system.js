/**
 * 📦 EXPORT/IMPORT SYSTEM
 * =======================
 *
 * Sistema completo de exportación e importación de datos
 * Permite respaldar y restaurar toda la información del usuario
 *
 * Características:
 * - Exportar/Importar configuraciones
 * - Exportar/Importar itinerarios
 * - Exportar/Importar datos de gamificación
 * - Exportar/Importar historial de ML/IA
 * - Backup automático a Firebase
 * - Sincronización entre dispositivos
 * - Exportar datos completos en JSON
 */

class ExportImportSystem {
  constructor() {
    this.exportVersion = '1.0.0';
    console.log('📦 Export/Import System initialized');
  }

  /**
   * 📤 EXPORTAR TODO - Genera archivo JSON con todos los datos
   */
  async exportAll() {
    try {
      const exportData = {
        metadata: {
          version: this.exportVersion,
          exportedAt: new Date().toISOString(),
          exportedBy: window.firebase?.auth()?.currentUser?.email || 'anonymous',
          appVersion: '1.0.0',
          dataTypes: ['settings', 'trips', 'gamification', 'mlHistory', 'preferences']
        },

        // 1. Configuraciones de usuario
        settings: await this.exportSettings(),

        // 2. Todos los viajes
        trips: await this.exportTrips(),

        // 3. Datos de gamificación
        gamification: await this.exportGamification(),

        // 4. Historial de ML/IA
        mlHistory: await this.exportMLHistory(),

        // 5. Preferencias y perfil
        userProfile: await this.exportUserProfile(),

        // 6. Datos de localStorage
        localStorage: this.exportLocalStorage()
      };

      // Generar archivo JSON
      this.downloadJSON(exportData, `japitin-backup-${Date.now()}.json`);

      window.Notifications?.show('✅ Datos exportados correctamente', 'success');

      return { success: true, data: exportData };
    } catch (error) {
      console.error('Error exportando datos:', error);
      window.Notifications?.show('❌ Error al exportar datos', 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * 📥 IMPORTAR TODO - Restaura datos desde archivo JSON
   */
  async importAll(file) {
    try {
      const data = await this.readJSONFile(file);

      // Validar versión y estructura
      if (!this.validateImportData(data)) {
        throw new Error('Archivo de importación inválido o incompatible');
      }

      // Mostrar confirmación
      const confirm = await this.showImportConfirmation(data);
      if (!confirm) {
        return { success: false, message: 'Importación cancelada por el usuario' };
      }

      // Crear backup antes de importar
      await this.createBackupBeforeImport();

      // Importar cada sección
      let results = {
        settings: false,
        trips: false,
        gamification: false,
        mlHistory: false,
        userProfile: false,
        localStorage: false
      };

      if (data.settings) {
        results.settings = await this.importSettings(data.settings);
      }

      if (data.trips) {
        results.trips = await this.importTrips(data.trips);
      }

      if (data.gamification) {
        results.gamification = await this.importGamification(data.gamification);
      }

      if (data.mlHistory) {
        results.mlHistory = await this.importMLHistory(data.mlHistory);
      }

      if (data.userProfile) {
        results.userProfile = await this.importUserProfile(data.userProfile);
      }

      if (data.localStorage) {
        results.localStorage = this.importLocalStorage(data.localStorage);
      }

      // Mostrar resultados
      const successCount = Object.values(results).filter(r => r).length;
      const totalCount = Object.values(results).length;

      window.Notifications?.show(
        `✅ Importación completada: ${successCount}/${totalCount} secciones`,
        'success'
      );

      // Recargar página para aplicar cambios
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      return { success: true, results };
    } catch (error) {
      console.error('Error importando datos:', error);
      window.Notifications?.show('❌ Error al importar datos: ' + error.message, 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔧 EXPORTAR CONFIGURACIONES
   */
  async exportSettings() {
    if (window.UserSettings) {
      return window.UserSettings.settings;
    }

    // Fallback a localStorage
    const settings = localStorage.getItem('user_settings');
    return settings ? JSON.parse(settings) : null;
  }

  /**
   * 🔧 IMPORTAR CONFIGURACIONES
   */
  async importSettings(settings) {
    try {
      if (window.UserSettings) {
        window.UserSettings.settings = settings;
        window.UserSettings.saveSettings();
      } else {
        localStorage.setItem('user_settings', JSON.stringify(settings));
      }
      return true;
    } catch (error) {
      console.error('Error importando settings:', error);
      return false;
    }
  }

  /**
   * 🗺️ EXPORTAR TODOS LOS VIAJES
   */
  async exportTrips() {
    const userId = window.firebase?.auth()?.currentUser?.uid;
    if (!userId) {
      // Si no hay usuario autenticado, exportar de localStorage
      return this.exportTripsFromLocalStorage();
    }

    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const { db } = await import('/js/firebase-config.js');

      const tripsRef = collection(db, 'trips');
      const snapshot = await getDocs(tripsRef);

      const trips = [];
      snapshot.forEach(doc => {
        if (doc.data().userId === userId) {
          trips.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });

      return trips;
    } catch (error) {
      console.error('Error exportando trips:', error);
      return [];
    }
  }

  /**
   * 🗺️ IMPORTAR VIAJES
   */
  async importTrips(trips) {
    const userId = window.firebase?.auth()?.currentUser?.uid;
    if (!userId) {
      console.warn('No authenticated user, skipping trips import to Firebase');
      return false;
    }

    try {
      const { collection, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const { db } = await import('/js/firebase-config.js');

      for (const trip of trips) {
        const tripRef = doc(db, 'trips', trip.id);
        await setDoc(tripRef, {
          ...trip,
          userId: userId, // Asegurar que el userId sea el correcto
          importedAt: new Date().toISOString()
        });
      }

      return true;
    } catch (error) {
      console.error('Error importando trips:', error);
      return false;
    }
  }

  /**
   * 🏆 EXPORTAR GAMIFICACIÓN
   */
  async exportGamification() {
    if (window.GamificationSystem) {
      return {
        points: window.GamificationSystem.points,
        level: window.GamificationSystem.level,
        badges: window.GamificationSystem.badges,
        achievements: window.GamificationSystem.achievements,
        stats: window.GamificationSystem.stats
      };
    }

    return null;
  }

  /**
   * 🏆 IMPORTAR GAMIFICACIÓN
   */
  async importGamification(data) {
    try {
      if (window.GamificationSystem) {
        window.GamificationSystem.points = data.points || 0;
        window.GamificationSystem.level = data.level || 1;
        window.GamificationSystem.badges = data.badges || [];
        window.GamificationSystem.achievements = data.achievements || [];
        window.GamificationSystem.stats = data.stats || {};
        window.GamificationSystem.save();
      }
      return true;
    } catch (error) {
      console.error('Error importando gamification:', error);
      return false;
    }
  }

  /**
   * 🧠 EXPORTAR HISTORIAL DE ML/IA
   */
  async exportMLHistory() {
    const mlData = {
      preferences: localStorage.getItem('ml_learned_preferences'),
      patterns: localStorage.getItem('ml_user_patterns'),
      recommendations: localStorage.getItem('collaborative_recommendations'),
      anomalies: localStorage.getItem('detected_anomalies'),
      insights: localStorage.getItem('ml_insights')
    };

    // Parse JSON strings
    Object.keys(mlData).forEach(key => {
      if (mlData[key]) {
        try {
          mlData[key] = JSON.parse(mlData[key]);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
    });

    return mlData;
  }

  /**
   * 🧠 IMPORTAR HISTORIAL DE ML/IA
   */
  async importMLHistory(data) {
    try {
      if (data.preferences) {
        localStorage.setItem('ml_learned_preferences', JSON.stringify(data.preferences));
      }
      if (data.patterns) {
        localStorage.setItem('ml_user_patterns', JSON.stringify(data.patterns));
      }
      if (data.recommendations) {
        localStorage.setItem('collaborative_recommendations', JSON.stringify(data.recommendations));
      }
      if (data.anomalies) {
        localStorage.setItem('detected_anomalies', JSON.stringify(data.anomalies));
      }
      if (data.insights) {
        localStorage.setItem('ml_insights', JSON.stringify(data.insights));
      }
      return true;
    } catch (error) {
      console.error('Error importando ML history:', error);
      return false;
    }
  }

  /**
   * 👤 EXPORTAR PERFIL DE USUARIO
   */
  async exportUserProfile() {
    return {
      basicInfo: window.UserSettings?.getSetting('basicInfo'),
      travelPreferences: window.UserSettings?.getSetting('travelPreferences'),
      interests: window.UserSettings?.getSetting('travelPreferences.interests')
    };
  }

  /**
   * 👤 IMPORTAR PERFIL DE USUARIO
   */
  async importUserProfile(data) {
    try {
      if (data.basicInfo) {
        window.UserSettings?.updateSetting('basicInfo', data.basicInfo);
      }
      if (data.travelPreferences) {
        window.UserSettings?.updateSetting('travelPreferences', data.travelPreferences);
      }
      return true;
    } catch (error) {
      console.error('Error importando user profile:', error);
      return false;
    }
  }

  /**
   * 💾 EXPORTAR LOCALSTORAGE COMPLETO
   */
  exportLocalStorage() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  }

  /**
   * 💾 IMPORTAR LOCALSTORAGE
   */
  importLocalStorage(data) {
    try {
      Object.keys(data).forEach(key => {
        localStorage.setItem(key, data[key]);
      });
      return true;
    } catch (error) {
      console.error('Error importando localStorage:', error);
      return false;
    }
  }

  /**
   * ☁️ BACKUP AUTOMÁTICO A FIREBASE
   */
  async backupToCloud() {
    const userId = window.firebase?.auth()?.currentUser?.uid;
    if (!userId) {
      window.Notifications?.show('⚠️ Debes iniciar sesión para hacer backup en la nube', 'warning');
      return { success: false, message: 'No authenticated user' };
    }

    try {
      const exportData = await this.exportAll();

      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const { db } = await import('/js/firebase-config.js');

      const backupRef = doc(db, 'backups', userId);
      await setDoc(backupRef, {
        data: exportData.data,
        createdAt: new Date().toISOString(),
        userId: userId
      });

      window.Notifications?.show('☁️ Backup guardado en la nube', 'success');
      return { success: true };
    } catch (error) {
      console.error('Error en backup to cloud:', error);
      window.Notifications?.show('❌ Error al guardar backup en la nube', 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * ☁️ RESTAURAR DESDE LA NUBE
   */
  async restoreFromCloud() {
    const userId = window.firebase?.auth()?.currentUser?.uid;
    if (!userId) {
      window.Notifications?.show('⚠️ Debes iniciar sesión para restaurar desde la nube', 'warning');
      return { success: false, message: 'No authenticated user' };
    }

    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const { db } = await import('/js/firebase-config.js');

      const backupRef = doc(db, 'backups', userId);
      const backupSnap = await getDoc(backupRef);

      if (!backupSnap.exists()) {
        window.Notifications?.show('⚠️ No se encontró backup en la nube', 'warning');
        return { success: false, message: 'No backup found' };
      }

      const backupData = backupSnap.data();

      // Importar datos
      const result = await this.importAllFromData(backupData.data);

      if (result.success) {
        window.Notifications?.show('☁️ Datos restaurados desde la nube', 'success');
      }

      return result;
    } catch (error) {
      console.error('Error restoring from cloud:', error);
      window.Notifications?.show('❌ Error al restaurar desde la nube', 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 VALIDAR DATOS DE IMPORTACIÓN
   */
  validateImportData(data) {
    // Verificar que tenga metadata
    if (!data.metadata) {
      console.error('Missing metadata');
      return false;
    }

    // Verificar versión compatible
    if (data.metadata.version !== this.exportVersion) {
      console.warn('Version mismatch, but attempting import anyway');
    }

    // Verificar que tenga al menos una sección de datos
    const hasSections = data.settings || data.trips || data.gamification || data.mlHistory;
    if (!hasSections) {
      console.error('No data sections found');
      return false;
    }

    return true;
  }

  /**
   * 💬 MOSTRAR CONFIRMACIÓN DE IMPORTACIÓN
   */
  async showImportConfirmation(data) {
    const sectionsCount = [
      data.settings ? 'Configuraciones' : null,
      data.trips ? `${data.trips.length} Viajes` : null,
      data.gamification ? 'Gamificación' : null,
      data.mlHistory ? 'Historial de IA' : null,
      data.userProfile ? 'Perfil' : null
    ].filter(Boolean).join(', ');

    return confirm(
      `¿Deseas importar los siguientes datos?\n\n` +
      `${sectionsCount}\n\n` +
      `Exportado: ${new Date(data.metadata.exportedAt).toLocaleString()}\n\n` +
      `⚠️ ADVERTENCIA: Esto sobrescribirá tus datos actuales.\n` +
      `Se creará un backup automático antes de continuar.`
    );
  }

  /**
   * 🛡️ CREAR BACKUP ANTES DE IMPORTAR
   */
  async createBackupBeforeImport() {
    try {
      const backupData = {
        metadata: {
          version: this.exportVersion,
          exportedAt: new Date().toISOString(),
          exportReason: 'auto-backup-before-import'
        },
        settings: await this.exportSettings(),
        trips: await this.exportTrips(),
        gamification: await this.exportGamification(),
        mlHistory: await this.exportMLHistory()
      };

      // Guardar en localStorage temporal
      localStorage.setItem('japitin_last_backup', JSON.stringify(backupData));

      console.log('✅ Backup creado antes de importar');
      return true;
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }

  /**
   * 📄 DESCARGAR JSON
   */
  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * 📄 LEER ARCHIVO JSON
   */
  async readJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Archivo JSON inválido'));
        }
      };

      reader.onerror = () => reject(new Error('Error leyendo archivo'));

      reader.readAsText(file);
    });
  }

  /**
   * 📦 EXPORTAR SOLO VIAJES (desde localStorage)
   */
  exportTripsFromLocalStorage() {
    const trips = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('trip_')) {
        try {
          trips.push(JSON.parse(localStorage.getItem(key)));
        } catch (e) {
          console.warn('Error parsing trip:', key);
        }
      }
    }
    return trips;
  }

  /**
   * 📋 IMPORTAR DESDE DATOS (sin archivo)
   */
  async importAllFromData(data) {
    // Similar a importAll pero sin leer archivo
    try {
      if (!this.validateImportData(data)) {
        throw new Error('Datos de importación inválidos');
      }

      let results = {};

      if (data.settings) {
        results.settings = await this.importSettings(data.settings);
      }

      if (data.trips) {
        results.trips = await this.importTrips(data.trips);
      }

      if (data.gamification) {
        results.gamification = await this.importGamification(data.gamification);
      }

      if (data.mlHistory) {
        results.mlHistory = await this.importMLHistory(data.mlHistory);
      }

      if (data.userProfile) {
        results.userProfile = await this.importUserProfile(data.userProfile);
      }

      return { success: true, results };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎨 RENDERIZAR UI DE EXPORT/IMPORT
   */
  renderUI() {
    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span>📦</span>
          <span>Exportar e Importar Datos</span>
        </h3>

        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Respalda y restaura toda tu información: configuraciones, itinerarios, logros y más.
        </p>

        <!-- EXPORTAR -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">📤 Exportar</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onclick="window.ExportImportSystem.exportAll()"
              class="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              <span>💾</span>
              <span>Exportar Todo (JSON)</span>
            </button>

            <button
              onclick="window.ExportImportSystem.backupToCloud()"
              class="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
            >
              <span>☁️</span>
              <span>Backup a la Nube</span>
            </button>
          </div>
        </div>

        <!-- IMPORTAR -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">📥 Importar</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label class="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold cursor-pointer transition">
              <span>📂</span>
              <span>Importar desde Archivo</span>
              <input
                type="file"
                accept=".json"
                onchange="window.ExportImportSystem.handleFileImport(event)"
                class="hidden"
              >
            </label>

            <button
              onclick="window.ExportImportSystem.restoreFromCloud()"
              class="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
            >
              <span>☁️</span>
              <span>Restaurar de la Nube</span>
            </button>
          </div>
        </div>

        <!-- INFORMACIÓN -->
        <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            <strong>💡 Consejo:</strong> Exporta tus datos regularmente para tener un respaldo.
            El backup en la nube requiere inicio de sesión.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * 📁 MANEJAR IMPORTACIÓN DE ARCHIVO
   */
  handleFileImport(event) {
    const file = event.target.files[0];
    if (file) {
      this.importAll(file);
    }
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.ExportImportSystem = new ExportImportSystem();
}

export default ExportImportSystem;
