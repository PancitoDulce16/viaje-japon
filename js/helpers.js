// js/helpers.js - Funciones auxiliares reutilizables

import { TIMEOUTS, REGEX, ERROR_CODES, ERROR_MESSAGES } from '/js/constants.js';

/**
 * Sistema de logging consistente
 */
export const Logger = {
    _format(level, message, data) {
        const timestamp = new Date().toISOString();
        const emoji = {
            info: 'ℹ️',
            success: '✅',
            warn: '⚠️',
            error: '❌',
            debug: '🐛'
        }[level] || '📝';

        return { timestamp, level, emoji, message, data };
    },

    info(message, data = null) {
        const log = this._format('info', message, data);
        console.log(`${log.emoji} [${log.level.toUpperCase()}] ${log.message}`, data || '');
    },

    success(message, data = null) {
        const log = this._format('success', message, data);
        console.log(`${log.emoji} [${log.level.toUpperCase()}] ${log.message}`, data || '');
    },

    warn(message, data = null) {
        const log = this._format('warn', message, data);
        console.warn(`${log.emoji} [${log.level.toUpperCase()}] ${log.message}`, data || '');
    },

    error(message, error = null) {
        const log = this._format('error', message, error);
        console.error(`${log.emoji} [${log.level.toUpperCase()}] ${log.message}`, error || '');

        // En producción podrías enviar esto a un servicio de logging
        if (error instanceof Error) {
            console.error('Stack trace:', error.stack);
        }
    },

    debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            const log = this._format('debug', message, data);
            console.log(`${log.emoji} [${log.level.toUpperCase()}] ${log.message}`, data || '');
        }
    }
};

/**
 * Debounce function para optimizar eventos frecuentes
 */
export function debounce(func, wait = TIMEOUTS.DEBOUNCE_INPUT) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function para limitar frecuencia de ejecución
 */
export function throttle(func, limit = 1000) {
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
 * Retry logic para operaciones que pueden fallar
 */
export async function retry(fn, options = {}) {
    const {
        maxAttempts = 3,
        delay = 1000,
        backoff = true,
        onRetry = null
    } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) {
                Logger.error(`Failed after ${maxAttempts} attempts`, error);
                throw error;
            }

            const waitTime = backoff ? delay * attempt : delay;
            Logger.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`);

            if (onRetry) {
                onRetry(attempt, error);
            }

            await sleep(waitTime);
        }
    }
}

/**
 * Sleep helper para async/await
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validador de datos mejorado
 */
export const Validator = {
    isEmail(email) {
        return REGEX.EMAIL.test(email);
    },

    isValidPrice(price) {
        return typeof price === 'number' && price >= 0 && isFinite(price);
    },

    isValidDuration(duration) {
        if (!duration) return false;
        return REGEX.DURATION.test(duration);
    },

    isValidTime(time) {
        return REGEX.TIME_24H.test(time);
    },

    isRequired(value) {
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'number') return !isNaN(value);
        return value != null;
    },

    maxLength(value, max) {
        return value.length <= max;
    },

    minLength(value, min) {
        return value.length >= min;
    },

    /**
     * Valida actividad del itinerario
     */
    validateActivity(activity) {
        const errors = [];

        if (!activity.title || activity.title.trim().length === 0) {
            errors.push('El título es obligatorio');
        }

        if (activity.title && activity.title.length > 200) {
            errors.push('El título no puede exceder 200 caracteres');
        }

        if (activity.desc && activity.desc.length > 1000) {
            errors.push('La descripción no puede exceder 1000 caracteres');
        }

        if (activity.cost !== undefined && activity.cost !== null) {
            if (activity.cost < 0 || !isFinite(activity.cost)) {
                errors.push('El costo debe ser un número positivo válido');
            }

            if (activity.cost > 1000000) {
                errors.push('El costo parece demasiado alto. Por favor verifica el monto.');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Valida gasto del presupuesto
     */
    validateExpense(expense) {
        const errors = [];

        if (!expense.description || expense.description.trim().length === 0) {
            errors.push('La descripción es obligatoria');
        }

        if (expense.description && expense.description.length > 200) {
            errors.push('La descripción no puede exceder 200 caracteres');
        }

        if (!expense.amount || expense.amount <= 0 || !isFinite(expense.amount)) {
            errors.push('El monto debe ser un número positivo válido');
        }

        if (expense.amount > 10000000) {
            errors.push('El monto parece demasiado alto. Por favor verifica.');
        }

        if (!expense.category) {
            errors.push('La categoría es obligatoria');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Valida nombre de viaje
     */
    validateTripName(name) {
        const errors = [];

        if (!name || name.trim().length === 0) {
            errors.push('El nombre del viaje es obligatorio');
        }

        if (name && name.length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }

        if (name && name.length > 100) {
            errors.push('El nombre no puede exceder 100 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Valida mensaje de chat
     */
    validateChatMessage(message) {
        const errors = [];

        if (!message || message.trim().length === 0) {
            errors.push('El mensaje no puede estar vacío');
        }

        if (message && message.length > 500) {
            errors.push('El mensaje no puede exceder 500 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Valida un objeto contra un schema
     */
    validate(data, schema) {
        const errors = {};

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            if (rules.required && !this.isRequired(value)) {
                errors[field] = `${field} es obligatorio`;
                continue;
            }

            if (rules.email && value && !this.isEmail(value)) {
                errors[field] = `${field} debe ser un email válido`;
            }

            if (rules.maxLength && value && !this.maxLength(value, rules.maxLength)) {
                errors[field] = `${field} debe tener máximo ${rules.maxLength} caracteres`;
            }

            if (rules.minLength && value && !this.minLength(value, rules.minLength)) {
                errors[field] = `${field} debe tener mínimo ${rules.minLength} caracteres`;
            }

            if (rules.custom && value) {
                const customError = rules.custom(value);
                if (customError) {
                    errors[field] = customError;
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

/**
 * Manejo de errores estandarizado
 */
export class AppError extends Error {
    constructor(code, message = null, originalError = null) {
        super(message || ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]);
        this.name = 'AppError';
        this.code = code;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            timestamp: this.timestamp
        };
    }
}

/**
 * Manejo seguro de errores
 */
export function handleError(error, context = '') {
    Logger.error(`Error in ${context}:`, error);

    if (error instanceof AppError) {
        return {
            code: error.code,
            message: error.message
        };
    }

    // Firebase errors
    if (error.code?.startsWith('auth/')) {
        return {
            code: ERROR_CODES.AUTH_FAILED,
            message: ERROR_MESSAGES[ERROR_CODES.AUTH_FAILED]
        };
    }

    if (error.code === 'permission-denied') {
        return {
            code: ERROR_CODES.PERMISSION_DENIED,
            message: ERROR_MESSAGES[ERROR_CODES.PERMISSION_DENIED]
        };
    }

    // Network errors
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
        return {
            code: ERROR_CODES.NETWORK_ERROR,
            message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]
        };
    }

    // Default
    return {
        code: ERROR_CODES.UNKNOWN_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
    };
}

/**
 * Formateo de fechas
 */
export const DateFormatter = {
    toLocaleDateString(date, locale = 'es') {
        return new Date(date).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    toShortDate(date, locale = 'es') {
        return new Date(date).toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric'
        });
    },

    toTimeString(date, locale = 'es') {
        return new Date(date).toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    toISO(date) {
        return new Date(date).toISOString();
    },

    fromISO(isoString) {
        return new Date(isoString);
    },

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    diffInDays(date1, date2) {
        const diff = Math.abs(new Date(date2) - new Date(date1));
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
};

/**
 * Formateo de moneda
 */
export const CurrencyFormatter = {
    toYen(amount) {
        return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
    },

    toUSD(amount) {
        return `$${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },

    format(amount, currency = 'JPY') {
        const formatters = {
            JPY: this.toYen,
            USD: this.toUSD
        };
        return formatters[currency]?.(amount) || amount.toString();
    }
};

/**
 * Parseador de duración
 */
export function parseDuration(durationString) {
    if (!durationString) return 0;

    let totalMinutes = 0;
    const matches = durationString.matchAll(REGEX.DURATION);

    for (const match of matches) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        if (unit.includes('h') || unit.includes('hora')) {
            totalMinutes += value * 60;
        } else {
            totalMinutes += value;
        }
    }

    return totalMinutes;
}

/**
 * Formateador de duración
 */
export function formatDuration(minutes) {
    if (!minutes || minutes === 0) return 'No definido';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
    if (hours > 0) return `${hours}h`;
    if (mins > 0) return `${mins}min`;

    return 'No definido';
}

/**
 * Sanitizador de HTML para prevenir XSS - VERSIÓN SÍNCRONA POR DEFECTO
 * Usa escapado básico de caracteres para compatibilidad con código existente
 */
export function sanitizeHTML(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

/**
 * Escapar strings para usar en HTML (protección básica)
 */
export function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Sanitizar texto simple (solo texto, sin HTML)
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto escapado
 */
export function sanitizeText(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizador avanzado con DOMPurify (async) - OPCIONAL para casos especiales
 * Solo usar cuando necesites permitir HTML complejo
 */
let DOMPurify = null;
async function loadDOMPurify() {
    if (!DOMPurify) {
        try {
            const module = await import('dompurify');
            DOMPurify = module.default;
        } catch (error) {
            console.warn('DOMPurify not available:', error);
            return null;
        }
    }
    return DOMPurify;
}

export async function sanitizeHTMLAdvanced(dirty, config = {}) {
    const purify = await loadDOMPurify();
    if (!purify) {
        return sanitizeHTML(dirty);
    }
    return purify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'title', 'class', 'id'],
        ...config
    });
}

/**
 * Generador de IDs únicos
 */
export function generateId(prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Deep clone de objetos
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Detectar si es móvil
 */
export function isMobile() {
    return window.innerWidth < 768;
}

/**
 * Detectar si está en modo oscuro
 */
export function isDarkMode() {
    return document.documentElement.classList.contains('dark');
}

/**
 * Copiar al portapapeles
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        Logger.success('Copiado al portapapeles');
        return true;
    } catch (error) {
        Logger.error('Error al copiar', error);
        return false;
    }
}

/**
 * Scroll suave a un elemento
 */
export function scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
}

/**
 * Verificar si un elemento está visible en el viewport
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Crear elemento HTML desde string
 */
export function createElementFromHTML(htmlString) {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstChild;
}

/**
 * Agregar clase con animación
 */
export function addClassWithAnimation(element, className, duration = 300) {
    element.classList.add(className);
    setTimeout(() => {
        element.classList.remove(className);
    }, duration);
}

/**
 * Verificar soporte de características
 */
export const FeatureDetection = {
    hasLocalStorage() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    },

    hasServiceWorker() {
        return 'serviceWorker' in navigator;
    },

    hasNotifications() {
        return 'Notification' in window;
    },

    hasGeolocation() {
        return 'geolocation' in navigator;
    },

    isOnline() {
        return navigator.onLine;
    }
};
