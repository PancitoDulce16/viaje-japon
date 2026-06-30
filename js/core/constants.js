// js/constants.js - Constantes centralizadas de la aplicación

/**
 * Configuración de la aplicación
 */
export const APP_CONFIG = {
    NAME: 'Japan Trip Planner',
    VERSION: '1.0.0',
    DEFAULT_LOCALE: 'es',
    DEFAULT_CURRENCY: 'JPY',
    DEFAULT_TIMEZONE: 'Asia/Tokyo'
};

/**
 * Configuración de caché
 */
export const CACHE_CONFIG = {
    EXCHANGE_RATE_TTL: 3600000, // 1 hora
    WEATHER_TTL: 1800000, // 30 minutos
    ITINERARY_TTL: 300000, // 5 minutos
    ATTRACTIONS_TTL: 86400000 // 24 horas
};

/**
 * Tiempos de espera y límites
 */
export const TIMEOUTS = {
    API_REQUEST: 10000, // 10 segundos
    DEBOUNCE_SEARCH: 300, // 300ms
    DEBOUNCE_INPUT: 500, // 500ms
    NOTIFICATION_DURATION: 3000, // 3 segundos
    AUTO_SAVE: 2000 // 2 segundos
};

/**
 * Z-index hierarchy para mantener orden de capas
 */
export const Z_INDEX = {
    BASE: 1,
    STICKY_HEADER: 10,
    STICKY_NAV: 20,
    DROPDOWN: 50,
    TOOLTIP: 100,
    MODAL_BACKDROP: 9999,
    MODAL: 10000,
    NOTIFICATION: 10001
};

/**
 * Breakpoints responsive (debe coincidir con Tailwind)
 */
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
};

/**
 * Códigos de error personalizados
 */
export const ERROR_CODES = {
    // Firebase
    AUTH_FAILED: 'AUTH_FAILED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    NETWORK_ERROR: 'NETWORK_ERROR',

    // Validación
    INVALID_INPUT: 'INVALID_INPUT',
    REQUIRED_FIELD: 'REQUIRED_FIELD',

    // Itinerario
    NO_ITINERARY: 'NO_ITINERARY',
    NO_TRIP: 'NO_TRIP',
    INVALID_DAY: 'INVALID_DAY',

    // General
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Mensajes de error amigables
 */
export const ERROR_MESSAGES = {
    [ERROR_CODES.AUTH_FAILED]: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
    [ERROR_CODES.PERMISSION_DENIED]: 'No tienes permisos para realizar esta acción.',
    [ERROR_CODES.NETWORK_ERROR]: 'Error de conexión. Verifica tu internet.',
    [ERROR_CODES.INVALID_INPUT]: 'Los datos ingresados no son válidos.',
    [ERROR_CODES.REQUIRED_FIELD]: 'Este campo es obligatorio.',
    [ERROR_CODES.NO_ITINERARY]: 'Primero debes crear un itinerario.',
    [ERROR_CODES.NO_TRIP]: 'Primero debes crear o seleccionar un viaje.',
    [ERROR_CODES.INVALID_DAY]: 'El día seleccionado no es válido.',
    [ERROR_CODES.UNKNOWN_ERROR]: 'Ocurrió un error inesperado. Intenta de nuevo.'
};

/**
 * Rutas de Firebase
 */
export const FIREBASE_PATHS = {
    TRIPS: 'trips',
    ITINERARY: (tripId) => `trips/${tripId}/data/itinerary`,
    ACTIVITIES: (tripId) => `trips/${tripId}/activities`,
    CHECKLIST: (tripId) => `trips/${tripId}/activities/checklist`,
    BUDGET: (tripId) => `trips/${tripId}/budget`
};

/**
 * Claves de localStorage
 */
export const STORAGE_KEYS = {
    THEME: 'theme',
    CURRENT_TRIP_ID: 'currentTripId',
    SAVED_ATTRACTIONS: 'savedAttractions',
    CHECKED_ACTIVITIES: 'checkedActivities',
    USER_PREFERENCES: 'userPreferences',
    LAST_SYNC: 'lastSync'
};

/**
 * Iconos por tipo de actividad
 */
export const ACTIVITY_ICONS = {
    // Comida
    RAMEN: '🍜',
    SUSHI: '🍣',
    CAFE: '☕',
    RESTAURANT: '🍴',
    IZAKAYA: '🍻',

    // Lugares
    TEMPLE: '⛩️',
    CASTLE: '🏯',
    MUSEUM: '🏛️',
    PARK: '🌳',
    TOWER: '🌆',
    MARKET: '🏪',

    // Transporte
    TRAIN: '🚄',
    SUBWAY: '🚇',
    BUS: '🚌',
    TAXI: '🚕',
    FLIGHT: '✈️',

    // Entretenimiento
    THEME_PARK: '🎢',
    AQUARIUM: '🐋',
    ARCADE: '🎮',
    SHOPPING: '🛍️',

    // Hoteles
    HOTEL: '🏨',
    HOSTEL: '🏠',
    RYOKAN: '🏯',

    // Default
    DEFAULT: '📍'
};

/**
 * Categorías de colores para Tailwind
 */
export const COLOR_SCHEMES = {
    pink: 'from-pink-500 to-rose-500',
    orange: 'from-orange-500 to-amber-500',
    purple: 'from-purple-500 to-fuchsia-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    emerald: 'from-emerald-500 to-teal-500',
    red: 'from-red-500 to-pink-500',
    indigo: 'from-indigo-500 to-purple-500'
};

/**
 * Regex patterns útiles
 */
export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    DURATION: /(\d+)\s*(h|hora|horas|min|minuto|minutos)/gi,
    PRICE: /^\d+(\.\d{1,2})?$/,
    TIME_24H: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
};

/**
 * Límites de la aplicación
 */
export const LIMITS = {
    MAX_TRIP_DAYS: 30,
    MAX_ACTIVITIES_PER_DAY: 20,
    MAX_TRIPS_PER_USER: 50,
    MAX_FILE_SIZE: 5242880, // 5MB
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_TITLE_LENGTH: 100
};

/**
 * URLs de APIs externas
 */
export const API_URLS = {
    EXCHANGE_RATE: 'https://v6.exchangerate-api.com/v6',
    OPEN_WEATHER: 'https://api.openweathermap.org/data/2.5/weather',
    GOOGLE_MAPS: 'https://www.google.com/maps/search'
};

/**
 * Ciudades principales de Japón
 */
export const JAPAN_CITIES = [
    'Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Nara',
    'Yokohama', 'Fukuoka', 'Sapporo', 'Nagoya', 'Kobe'
];

/**
 * Meses del año en español
 */
export const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Días de la semana en español
 */
export const DAYS_ES = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles',
    'Jueves', 'Viernes', 'Sábado'
];
