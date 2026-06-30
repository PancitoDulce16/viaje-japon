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
const STATIC_CACHE_VERSION = 'japan-trip-planner-static-v12.0';
const DYNAMIC_CACHE_VERSION = 'japan-trip-planner-dynamic-v12.0';
const STATIC_CACHE_NAME = `static-${STATIC_CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-${DYNAMIC_CACHE_VERSION}`;

// ⚠️ NUNCA CACHEAR ARCHIVOS .js PARA EVITAR PROBLEMAS DE VERSIONES
// Solo cachear imágenes, CSS, y HTML estático
const APP_SHELL_URLS = [
    '/index.html',
    '/manifest.json',
    '/css/main.css',
    '/css/japan-theme.css',
    '/images/icons/icon-192.png',
    '/images/icons/icon-512.png'
];

// 📜 --- FASE 1: INSTALACIÓN ---
// Se ejecuta una sola vez cuando el navegador instala el Service Worker.
self.addEventListener('install', event => {
    console.log(`[SW] ✅ Evento INSTALL: Iniciando instalación para la versión ${STATIC_CACHE_VERSION}`);
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
            return cachedResponse;
        }
        return fetch(request).then(networkResponse => {
            // Only cache successful responses — never cache 404s or errors
            if (networkResponse.ok) {
                caches.open(cacheName).then(cache => cache.put(request, networkResponse.clone()));
            }
            return networkResponse;
        }).catch(() => new Response('', { status: 404, statusText: 'Not Found' }));
    }).catch(() => new Response('', { status: 404, statusText: 'Not Found' }));
};

// 📡 --- FASE 3: INTERCEPTACIÓN DE PETICIONES (FETCH) ---
// Se ejecuta cada vez que la página pide un recurso (un script, una imagen, una API, etc.).
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // --- REGLA 1: IGNORAR PETICIONES QUE NO DEBEN SER CACHEADAS (Firebase, CDNs externos, etc.) ---
    // ⚠️ NO interceptar dominios externos para evitar errores de CORS y carga de fuentes
    const externalDomains = [
        'googleapis.com',
        'firestore.googleapis.com',
        'gstatic.com',           // Google Fonts
        'fonts.gstatic.com',      // Google Fonts
        'fonts.googleapis.com',   // Google Fonts CSS
        'cdnjs.cloudflare.com'    // Font Awesome y otros CDNs
    ];

    const isExternalDomain = externalDomains.some(domain => url.hostname.includes(domain));

    if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension') || isExternalDomain) {
        return; // Dejar que el navegador maneje estas solicitudes directamente
    }

    // --- REGLA 2: ESTRATEGIA PARA NAVEGACIÓN (HTML) ---
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    // --- REGLA 3: NUNCA CACHEAR ARCHIVOS .js (SIEMPRE RED) ---
    // ⚠️ CRÍTICO: Los archivos .js SIEMPRE deben venir de la red para evitar problemas de versiones
    if (url.pathname.endsWith('.js')) {
        console.log(`[SW] 🚫 NEVER CACHE: ${url.pathname} - Siempre desde la red`);
        event.respondWith(
            fetch(request).catch(() => new Response('', { status: 404, statusText: 'Not Found' }))
        );
        return;
    }

    // --- REGLA 4: ESTRATEGIA PARA RECURSOS DEL APP SHELL ---
    // Si la petición es para un recurso que ya debería estar en el caché estático.
    if (APP_SHELL_URLS.includes(url.pathname)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
        return;
    }

    // --- REGLA 5: ESTRATEGIA PARA RECURSOS DINÁMICOS (Imágenes, Fuentes, etc.) ---
    // Para cualquier otra petición, usamos el caché dinámico.
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE_NAME));
});
