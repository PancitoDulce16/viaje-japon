import { BackupService } from './backup-service.js';

class ExportImportSystem extends BackupService {
  renderUI() {
    return `
      <div data-backup-ui aria-busy="false" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span>📦</span>
          <span>Exportar e Importar Datos</span>
        </h3>

        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Respalda tus viajes, preferencias y archivos accesibles. La restauración crea copias privadas sin reemplazar tus viajes actuales.
        </p>
        <p data-backup-status role="status" aria-live="polite" class="text-sm mb-4"></p>

        <!-- EXPORTAR -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">📤 Exportar</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onclick="window.ExportImportSystem.exportAll()"
              class="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              <span>💾</span>
              <span>Exportar datos (JSON)</span>
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
            <button
              onclick="window.ExportImportSystem.restoreFromCloud(true)"
              class="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
            >
              <span>Restaurar copia previa</span>
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
  async handleFileImport(event) {
    const file = event.target.files[0];
    if (file) {
      try { await this.importAll(file); } finally { event.target.value=''; }
    }
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.ExportImportSystem = new ExportImportSystem();
}

export default ExportImportSystem;
