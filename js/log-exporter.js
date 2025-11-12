// js/log-exporter.js - Sistema automático de captura y exportación de logs
// Intercepta TODOS los console.log/error/warn y permite exportarlos fácilmente

class LogExporter {
  constructor() {
    this.logs = [];
    this.maxLogs = 5000; // Máximo de logs a guardar
    this.startTime = Date.now();

    // Interceptar console methods
    this.interceptConsoleMethods();

    console.log('📝 Log Exporter activado - usa window.exportLogs() para exportar');
  }

  interceptConsoleMethods() {
    // Guardar métodos originales
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Interceptar console.log
    console.log = (...args) => {
      this.captureLog('LOG', args);
      originalLog.apply(console, args);
    };

    // Interceptar console.error
    console.error = (...args) => {
      this.captureLog('ERROR', args);
      originalError.apply(console, args);
    };

    // Interceptar console.warn
    console.warn = (...args) => {
      this.captureLog('WARN', args);
      originalWarn.apply(console, args);
    };

    // Interceptar console.info
    console.info = (...args) => {
      this.captureLog('INFO', args);
      originalInfo.apply(console, args);
    };
  }

  captureLog(type, args) {
    const timestamp = Date.now() - this.startTime;
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    this.logs.push({
      type,
      timestamp,
      message
    });

    // Limitar tamaño
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  exportAsText() {
    let text = '═══════════════════════════════════════\n';
    text += 'CONSOLE LOGS EXPORT\n';
    text += `Fecha: ${new Date().toISOString()}\n`;
    text += `Total logs: ${this.logs.length}\n`;
    text += '═══════════════════════════════════════\n\n';

    this.logs.forEach(log => {
      const timeStr = `[${(log.timestamp / 1000).toFixed(2)}s]`;
      const typeStr = `[${log.type}]`;
      text += `${timeStr} ${typeStr} ${log.message}\n`;
    });

    return text;
  }

  downloadAsFile() {
    const text = this.exportAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Logs descargados como archivo');
  }

  /**
   * Sube logs a dpaste.com y devuelve la URL
   * dpaste.com es un servicio temporal de paste que NO requiere autenticación
   */
  async uploadToPaste() {
    try {
      console.log('📤 Subiendo logs a dpaste.com...');

      const text = this.exportAsText();

      const formData = new FormData();
      formData.append('content', text);
      formData.append('syntax', 'text');
      formData.append('expiry_days', '7'); // Expira en 7 días

      const response = await fetch('https://dpaste.com/api/v2/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const url = await response.text();
      const cleanUrl = url.trim();

      console.log('✅ Logs subidos exitosamente!');
      console.log('🔗 URL:', cleanUrl);

      // Mostrar modal con la URL
      this.showUrlModal(cleanUrl);

      return cleanUrl;

    } catch (error) {
      console.error('❌ Error subiendo logs:', error);
      alert('❌ Error subiendo logs. Usa copyLogs() o exportLogs() en su lugar.');
      return null;
    }
  }

  showUrlModal(url) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 30px;
      max-width: 600px;
      width: 100%;
      text-align: center;
    `;

    const title = document.createElement('h2');
    title.textContent = '✅ Logs Subidos Exitosamente';
    title.style.cssText = 'margin: 0 0 20px 0; color: #4CAF50; font-size: 24px;';

    const message = document.createElement('p');
    message.textContent = 'Copia esta URL y pégala en el chat:';
    message.style.cssText = 'margin: 0 0 15px 0; color: #666; font-size: 16px;';

    const urlBox = document.createElement('input');
    urlBox.value = url;
    urlBox.readOnly = true;
    urlBox.style.cssText = `
      width: 100%;
      padding: 12px;
      font-family: monospace;
      font-size: 14px;
      border: 2px solid #4CAF50;
      border-radius: 4px;
      margin-bottom: 20px;
      text-align: center;
      background: #f0f9f0;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center;';

    const copyButton = document.createElement('button');
    copyButton.textContent = '📋 Copiar URL';
    copyButton.style.cssText = `
      padding: 12px 24px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    `;
    copyButton.onclick = () => {
      urlBox.select();
      navigator.clipboard.writeText(url).then(() => {
        copyButton.textContent = '✅ ¡Copiado!';
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 1000);
      });
    };

    const openButton = document.createElement('button');
    openButton.textContent = '🔗 Abrir en Nueva Pestaña';
    openButton.style.cssText = `
      padding: 12px 24px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    `;
    openButton.onclick = () => {
      window.open(url, '_blank');
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.style.cssText = `
      padding: 12px 24px;
      background: #666;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    `;
    closeButton.onclick = () => document.body.removeChild(modal);

    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(openButton);
    buttonContainer.appendChild(closeButton);

    container.appendChild(title);
    container.appendChild(message);
    container.appendChild(urlBox);
    container.appendChild(buttonContainer);
    modal.appendChild(container);
    document.body.appendChild(modal);

    // Auto-seleccionar URL
    urlBox.select();
  }

  copyToClipboard() {
    const text = this.exportAsText();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('✅ Logs copiados al portapapeles');
        alert('✅ Logs copiados al portapapeles - Pégalos donde quieras (Ctrl+V)');
      }).catch(err => {
        console.error('❌ Error copiando al portapapeles:', err);
        this.showLogsInModal(text);
      });
    } else {
      // Fallback para navegadores sin clipboard API
      this.showLogsInModal(text);
    }
  }

  showLogsInModal(text) {
    // Crear modal con textarea
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 20px;
      max-width: 800px;
      width: 100%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    `;

    const title = document.createElement('h2');
    title.textContent = 'Console Logs Export';
    title.style.cssText = 'margin: 0 0 15px 0; color: #333;';

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = `
      width: 100%;
      height: 400px;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 15px;
    `;
    textarea.readOnly = true;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';

    const selectButton = document.createElement('button');
    selectButton.textContent = 'Seleccionar Todo';
    selectButton.style.cssText = `
      padding: 10px 20px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    selectButton.onclick = () => {
      textarea.select();
      document.execCommand('copy');
      alert('✅ Logs copiados - puedes pegarlos con Ctrl+V');
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.style.cssText = `
      padding: 10px 20px;
      background: #666;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    closeButton.onclick = () => document.body.removeChild(modal);

    buttonContainer.appendChild(selectButton);
    buttonContainer.appendChild(closeButton);

    container.appendChild(title);
    container.appendChild(textarea);
    container.appendChild(buttonContainer);
    modal.appendChild(container);
    document.body.appendChild(modal);

    // Auto-seleccionar texto
    textarea.select();
  }

  filterByKeyword(keyword) {
    return this.logs.filter(log =>
      log.message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  exportFiltered(keyword) {
    const filtered = this.filterByKeyword(keyword);

    let text = '═══════════════════════════════════════\n';
    text += `FILTERED LOGS (keyword: "${keyword}")\n`;
    text += `Total matches: ${filtered.length}\n`;
    text += '═══════════════════════════════════════\n\n';

    filtered.forEach(log => {
      const timeStr = `[${(log.timestamp / 1000).toFixed(2)}s]`;
      const typeStr = `[${log.type}]`;
      text += `${timeStr} ${typeStr} ${log.message}\n`;
    });

    return text;
  }

  clear() {
    this.logs = [];
    this.startTime = Date.now();
    console.log('🧹 Logs limpiados');
  }
}

// Instancia global
const logExporter = new LogExporter();

// Exponer funciones globales para uso fácil
window.exportLogs = () => logExporter.downloadAsFile();
window.copyLogs = () => logExporter.copyToClipboard();
window.showLogs = () => logExporter.showLogsInModal(logExporter.exportAsText());
window.clearLogs = () => logExporter.clear();
window.uploadLogs = () => logExporter.uploadToPaste(); // 🚀 NUEVA: Sube logs automáticamente
window.filterLogs = (keyword) => {
  const text = logExporter.exportFiltered(keyword);
  logExporter.showLogsInModal(text);
};

// 🎯 HELPER: Mostrar todas las funciones disponibles
window.logHelp = () => {
  console.log('📝 LOG EXPORTER - Funciones Disponibles:');
  console.log('  uploadLogs()  - 🚀 Sube logs a dpaste.com (compartir URL con Claude)');
  console.log('  copyLogs()    - 📋 Copia logs al portapapeles');
  console.log('  exportLogs()  - 💾 Descarga logs como archivo .txt');
  console.log('  showLogs()    - 👁️  Muestra logs en modal');
  console.log('  filterLogs(keyword) - 🔍 Filtra logs por palabra clave');
  console.log('  clearLogs()   - 🧹 Limpia logs capturados');
};

// Exponer para otros módulos
export { logExporter, LogExporter };
