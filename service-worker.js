// ====================================================================================
// SERVICE WORKER ROBUSTO PARA JAPAN TRIP PLANNER
// Versión: 3.0 (Anti-Errores de Autenticación)
// Creador: Gemini AI
// Descripción: Este Service Worker está diseñado para ser seguro, eficiente y
// evitar conflictos con la autenticación de Firebase y las APIs externas.
// ====================================================================================

// 📦 --- CONFIGURACIÓN DEL CACHÉ ---
// IMPORTANTE: Cambia este número de versión CADA VEZ que hagas un cambio en los
// archivos de la aplicación (JS, CSS, HTML) para forzar la actualización.
const CACHE_VERSION = 'japan-trip-planner-v3.1';
const CACHE_NAME = `static-${CACHE_VERSION}`;

// Lista de archivos base (el "cascarón" de la app) que se guardarán en caché.
// Estos son los archivos mínimos para que la app se muestre, incluso sin conexión.
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/main.css',
    '/css/japan-theme.css',
    '/js/app.js', // El archivo principal que carga todo lo demás
    '/js/auth.js', // Esencial para la lógica de inicio de sesión
    '/images/icons/icon-192.png',
    '/images/icons/icon-512.png'
];

// 📜 --- FASE 1: INSTALACIÓN ---
// Se ejecuta una sola vez cuando el navegador instala el Service Worker.
self.addEventListener('install', event => {
    console.log(`[SW] ✅ Evento INSTALL: Iniciando instalación para la versión ${CACHE_VERSION}`);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log(`[SW] 📥 Abriendo caché "${CACHE_NAME}" y guardando el App Shell.`);
                return cache.addAll(APP_SHELL_URLS);
            })
            .then(() => {
                console.log('[SW] 🚀 App Shell guardado en caché correctamente. Pasando a la activación.');
                // Forzamos al nuevo Service Worker a activarse inmediatamente.
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] 🛑 ERROR CRÍTICO durante la instalación:', error);
            })
    );
});

// 🧹 --- FASE 2: ACTIVACIÓN ---
// Se ejecuta después de la instalación. Es el lugar perfecto para limpiar cachés antiguos.
self.addEventListener('activate', event => {
    console.log(`[SW] ✅ Evento ACTIVATE: Activando la versión ${CACHE_VERSION}`);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Si el nombre del caché no es el actual, se elimina.
                    if (cacheName !== CACHE_NAME) {
                        console.log(`[SW] 🗑️ Limpiando caché antiguo: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] 👑 Service Worker activado y controlando la página.');
            // Toma control de todas las pestañas abiertas de la app inmediatamente.
            return self.clients.claim();
        })
    );
});

// 📡 --- FASE 3: INTERCEPTACIÓN DE PETICIONES (FETCH) ---
// Se ejecuta cada vez que la página pide un recurso (un script, una imagen, una API, etc.).
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // --- REGLA 1: IGNORAR PETICIONES QUE NO DEBEN SER CACHEADAS ---
    // Ignoramos peticiones que no son GET y las de Firebase/Google APIs para no interferir.
    if (request.method !== 'GET' || url.protocol !== 'https:' || url.hostname.includes('googleapis.com')) {
        // console.log(`[SW] ➡️ Ignorando petición (No-GET o API externa): ${url.pathname}`);
        return; // Dejamos que el navegador la maneje normalmente.
    }

    // --- REGLA 2: ESTRATEGIA PARA NAVEGACIÓN (LA MÁS IMPORTANTE) ---
    // Para peticiones de páginas (cuando el usuario entra o refresca).
    // Esta es la solución al bucle de autenticación.
    if (request.mode === 'navigate') {
        // console.log(`[SW] 🧭 Navegación detectada para: ${url.pathname}. Usando estrategia "Network First".`);
        event.respondWith(
            fetch(request)
                .then(response => {
                    // console.log(`[SW]     ✅ Red disponible. Sirviendo página fresca desde el servidor.`);
                    return response;
                })
                .catch(error => {
                    console.log(`[SW]     ❌ Red falló. Sirviendo página de inicio desde el caché como fallback.`);
                    return caches.match('/index.html');
                })
        );
        return;
    }

    // --- REGLA 3: ESTRATEGIA PARA RECURSOS ESTÁTICOS (JS, CSS, IMÁGENES) ---
    // Para todos los demás archivos (el "cascarón" de la app y otros).
    // "Cache First, falling back to Network": es la más rápida.
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // console.log(`[SW] ⚡️ Sirviendo desde caché: ${url.pathname}`);
                    return cachedResponse;
                }

                // Si no está en caché, vamos a la red.
                // console.log(`[SW] 🌐 No está en caché. Buscando en la red: ${url.pathname}`);
                return fetch(request).then(networkResponse => {
                    // Y lo guardamos en caché para la próxima vez.
                    return caches.open(CACHE_NAME).then(cache => {
                        // Guardamos una copia de la respuesta.
                        cache.put(request, networkResponse.clone());
                        // console.log(`[SW]     📥 Guardado en caché para el futuro: ${url.pathname}`);
                        return networkResponse;
                    });
                });
            })
            .catch(error => {
                console.error(`[SW] 🛑 ERROR CRÍTICO al manejar fetch para ${request.url}:`, error);
                // Opcional: podrías devolver una imagen o recurso de "error" genérico.
            })
    );
});

