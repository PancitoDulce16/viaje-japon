/* ========================================
   SAFE HELPERS - Utilidades robustas
   ======================================== */

/**
 * SAFE JSON PARSE
 * Wrapper seguro para JSON.parse que nunca crashea
 */
export function safeJSONParse(jsonString, defaultValue = null) {
  if (!jsonString || typeof jsonString !== 'string') {
    return defaultValue;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('❌ Failed to parse JSON, returning default:', error.message);
    return defaultValue;
  }
}

/**
 * SAFE LOCALSTORAGE GET
 * Obtiene item de localStorage con parsing seguro
 */
export function safeLocalStorageGet(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return safeJSONParse(item, defaultValue);
  } catch (error) {
    console.warn(`❌ Failed to get localStorage item "${key}":`, error.message);
    return defaultValue;
  }
}

/**
 * SAFE LOCALSTORAGE SET
 * Guarda item en localStorage con manejo de errores
 */
export function safeLocalStorageSet(key, value) {
  try {
    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('❌ localStorage is full! Attempting cleanup...');
      // Intentar limpiar items viejos
      cleanupOldLocalStorageItems();
      // Reintentar
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.error('❌ Still failed after cleanup:', retryError);
        return false;
      }
    }
    console.error(`❌ Failed to set localStorage item "${key}":`, error.message);
    return false;
  }
}

/**
 * CLEANUP OLD LOCALSTORAGE ITEMS
 * Limpia items viejos de localStorage para liberar espacio
 */
function cleanupOldLocalStorageItems() {
  const keysToClean = [];

  // Identificar items viejos (puedes ajustar la lógica)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('temp_') ||
      key.startsWith('cache_') ||
      key.includes('_old')
    )) {
      keysToClean.push(key);
    }
  }

  // Eliminar
  keysToClean.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Cleaned up: ${key}`);
  });

  console.log(`✅ Cleaned ${keysToClean.length} old items`);
}

/**
 * GET ELEMENT SAFELY
 * Obtiene elemento del DOM con validación
 */
export function getElement(id, options = {}) {
  const { required = true, type = 'any' } = options;

  const element = document.getElementById(id);

  if (!element && required) {
    console.error(`❌ Required element not found: #${id}`);
    throw new Error(`Element not found: ${id}`);
  }

  if (element && type !== 'any') {
    const tagName = element.tagName.toLowerCase();
    if (type === 'input' && tagName !== 'input' && tagName !== 'textarea') {
      console.warn(`⚠️ Element #${id} is ${tagName}, expected input/textarea`);
    }
    if (type === 'select' && tagName !== 'select') {
      console.warn(`⚠️ Element #${id} is ${tagName}, expected select`);
    }
  }

  return element;
}

/**
 * GET ELEMENT VALUE SAFELY
 * Obtiene el valor de un input/select con valor por defecto
 */
export function getElementValue(id, defaultValue = '') {
  try {
    const element = getElement(id, { required: false });
    if (!element) return defaultValue;

    // Manejar diferentes tipos de elementos
    if (element.type === 'checkbox') {
      return element.checked;
    }

    return element.value || defaultValue;
  } catch (error) {
    console.warn(`❌ Failed to get value from #${id}:`, error.message);
    return defaultValue;
  }
}

/**
 * SET ELEMENT VALUE SAFELY
 * Establece el valor de un input/select con validación
 */
export function setElementValue(id, value) {
  try {
    const element = getElement(id, { required: false });
    if (!element) return false;

    if (element.type === 'checkbox') {
      element.checked = !!value;
    } else {
      element.value = value;
    }

    return true;
  } catch (error) {
    console.warn(`❌ Failed to set value for #${id}:`, error.message);
    return false;
  }
}

/**
 * SAFE FIRESTORE OPERATION
 * Wrapper para operaciones de Firestore con manejo de errores
 */
export async function safeFirestoreOperation(operation, options = {}) {
  const {
    requireAuth = true,
    fallback = null,
    showNotifications = true
  } = options;

  // Verificar autenticación
  if (requireAuth) {
    const auth = await import('../core/firebase-config.js').then(m => m.auth);
    if (!auth.currentUser) {
      if (showNotifications && window.Notifications) {
        window.Notifications.error('Debes iniciar sesión para esta operación');
      }
      throw new Error('User not authenticated');
    }
  }

  try {
    return await operation();
  } catch (error) {
    console.error('❌ Firestore operation failed:', error);

    // Manejo específico por tipo de error
    if (error.code === 'permission-denied') {
      if (showNotifications && window.Notifications) {
        window.Notifications.error('No tienes permisos para esta operación');
      }
      throw new Error('Permission denied');
    } else if (error.code === 'unavailable') {
      if (showNotifications && window.Notifications) {
        window.Notifications.warning('Sin conexión. Intenta de nuevo más tarde.');
      }
      return fallback;
    } else if (error.code === 'not-found') {
      console.warn('⚠️ Document not found');
      return fallback;
    }

    // Error genérico
    if (showNotifications && window.Notifications) {
      window.Notifications.error('Error al procesar la operación');
    }
    throw error;
  }
}

/**
 * VALIDATE DATE STRING
 * Valida que un string sea una fecha válida en formato YYYY-MM-DD
 */
export function validateDateString(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateString)) {
    return { valid: false, error: 'Formato inválido. Usa YYYY-MM-DD' };
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // Verificar que la fecha es válida
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Fecha inválida' };
  }

  // Verificar que los componentes coinciden (evita fechas como 2024-02-30)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { valid: false, error: 'Fecha inválida (día/mes fuera de rango)' };
  }

  return { valid: true, date };
}

/**
 * VALIDATE DATE RANGE
 * Valida un rango de fechas
 */
export function validateDateRange(startDate, endDate, options = {}) {
  const { maxDays = 90 } = options;

  const startValidation = validateDateString(startDate);
  if (!startValidation.valid) {
    return { valid: false, error: `Fecha inicio: ${startValidation.error}` };
  }

  const endValidation = validateDateString(endDate);
  if (!endValidation.valid) {
    return { valid: false, error: `Fecha fin: ${endValidation.error}` };
  }

  const start = startValidation.date;
  const end = endValidation.date;

  // Verificar orden
  if (start > end) {
    return { valid: false, error: 'La fecha de inicio debe ser antes que la fecha fin' };
  }

  // Verificar duración máxima
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (daysDiff > maxDays) {
    return { valid: false, error: `La duración no puede exceder ${maxDays} días` };
  }

  return { valid: true, start, end, days: daysDiff + 1 };
}

/**
 * SANITIZE HTML
 * Limpia strings para prevenir XSS
 */
export function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

/**
 * VALIDATE NUMBER IN RANGE
 * Valida que un número esté en un rango específico
 */
export function validateNumberInRange(value, min, max, options = {}) {
  const { fieldName = 'Valor', allowDecimals = true } = options;

  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} debe ser un número válido` };
  }

  if (!allowDecimals && num !== Math.floor(num)) {
    return { valid: false, error: `${fieldName} debe ser un número entero` };
  }

  if (num < min) {
    return { valid: false, error: `${fieldName} debe ser mayor o igual a ${min}` };
  }

  if (num > max) {
    return { valid: false, error: `${fieldName} debe ser menor o igual a ${max}` };
  }

  return { valid: true, value: num };
}

/**
 * DEBOUNCE
 * Crea una función debounced
 */
export function debounce(func, delay) {
  let timeoutId;

  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * THROTTLE
 * Crea una función throttled
 */
export function throttle(func, limit) {
  let inThrottle;

  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * RETRY ASYNC OPERATION
 * Reintenta una operación async con backoff exponencial
 */
export async function retryAsync(operation, options = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    onRetry = null
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        break;
      }

      const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
      console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);

      if (onRetry) {
        onRetry(attempt, delay, error);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Operation failed after ${maxAttempts} attempts: ${lastError.message}`);
}

/**
 * IS ONLINE
 * Verifica si hay conexión a internet
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * WAIT FOR ONLINE
 * Espera hasta que haya conexión a internet
 */
export async function waitForOnline(timeout = 30000) {
  if (isOnline()) return true;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      reject(new Error('Timeout waiting for internet connection'));
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };

    window.addEventListener('online', onlineHandler);
  });
}

/**
 * FORMAT CURRENCY
 * Formatea números como moneda
 */
export function formatCurrency(amount, currency = 'JPY') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '¥0';
  }

  if (currency === 'JPY') {
    return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * GENERATE UNIQUE ID
 * Genera un ID único
 */
export function generateUniqueId(prefix = '') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * DEEP CLONE
 * Clona profundamente un objeto
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('❌ Failed to deep clone, using shallow clone:', error);
    return { ...obj };
  }
}

/**
 * BATCH PROCESS
 * Procesa items en batches para evitar bloquear el UI
 */
export async function batchProcess(items, processor, batchSize = 50) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);

    // Dar tiempo al navegador para respirar
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return results;
}

// Export all utilities
export default {
  safeJSONParse,
  safeLocalStorageGet,
  safeLocalStorageSet,
  getElement,
  getElementValue,
  setElementValue,
  safeFirestoreOperation,
  validateDateString,
  validateDateRange,
  sanitizeHTML,
  validateNumberInRange,
  debounce,
  throttle,
  retryAsync,
  isOnline,
  waitForOnline,
  formatCurrency,
  generateUniqueId,
  deepClone,
  batchProcess
};
