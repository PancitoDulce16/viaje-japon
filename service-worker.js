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
const STATIC_CACHE_VERSION = 'japan-trip-planner-static-v3.2';
const DYNAMIC_CACHE_VERSION = 'japan-trip-planner-dynamic-v3.2';
const STATIC_CACHE_NAME = `static-${STATIC_CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-${DYNAMIC_CACHE_VERSION}`;

// Lista de archivos base (el "cascarón" de la app) que se guardarán en caché.
// Estos son los archivos mínimos para que la app se muestre, incluso sin conexión.
const APP_SHELL_URLS = [
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
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log(`[SW] 📥 Abriendo caché estático "${STATIC_CACHE_NAME}" y guardando el App Shell.`);
                return cache.addAll(APP_SHELL_URLS.map(url => new Request(url, { cache: 'reload' })));
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
    console.log(`[SW] ✅ Evento ACTIVATE: Activando nuevas versiones de caché.`);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Si el nombre del caché no es el actual, se elimina.
                    if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
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

// --- Estrategias de Caché ---

// Estrategia: Network First, falling back to Cache (para documentos HTML)
const networkFirst = (request) => {
    return fetch(request)
        .then(networkResponse => {
            return networkResponse;
        })
        .catch(() => {
            console.log(`[SW] ❌ Red falló para ${request.url}. Sirviendo desde caché como fallback.`);
            return caches.match(request) || caches.match('/index.html');
        });
};

// Estrategia: Cache First, falling back to Network (para App Shell y recursos estáticos)
const cacheFirst = (request, cacheName) => {
    return caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
            // console.log(`[SW] ⚡️ Sirviendo desde caché: ${request.url}`);
            return cachedResponse;
        }
        // Si no está en caché, vamos a la red y lo guardamos.
        return fetch(request).then(networkResponse => {
            return caches.open(cacheName).then(cache => {
                cache.put(request, networkResponse.clone());
                // console.log(`[SW] 📥 Guardado en caché dinámico: ${request.url}`);
                return networkResponse;
            });
        });
    });
};

// 📡 --- FASE 3: INTERCEPTACIÓN DE PETICIONES (FETCH) ---
// Se ejecuta cada vez que la página pide un recurso (un script, una imagen, una API, etc.).
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // --- REGLA 1: IGNORAR PETICIONES QUE NO DEBEN SER CACHEADAS (Firebase, etc.) ---
    if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension') || url.hostname.includes('googleapis.com') || url.hostname.includes('firestore.googleapis.com')) {
        return;
    }

    // --- REGLA 2: ESTRATEGIA PARA NAVEGACIÓN (HTML) ---
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    // --- REGLA 3: ESTRATEGIA PARA RECURSOS DEL APP SHELL ---
    // Si la petición es para un recurso que ya debería estar en el caché estático.
    if (APP_SHELL_URLS.includes(url.pathname)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
        return;
    }

    // --- REGLA 4: ESTRATEGIA PARA RECURSOS DINÁMICOS (Imágenes, Fuentes, etc.) ---
    // Para cualquier otra petición, usamos el caché dinámico.
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE_NAME));
});
