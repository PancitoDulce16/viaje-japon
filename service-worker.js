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
const STATIC_CACHE_VERSION = 'japan-trip-planner-static-v17.0';
const DYNAMIC_CACHE_VERSION = 'japan-trip-planner-dynamic-v17.0';
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

// Estrategia: Stale-While-Revalidate (sirve caché al instante y actualiza en
// segundo plano). Para CSS: con cache-first puro, cada fix de estilos que se
// desplegaba SIN bumpear la versión del SW nunca llegaba a navegadores que ya
// habían visitado la app — la causa recurrente de "sigo viendo la versión rota".
const staleWhileRevalidate = (request, cacheName) => {
    return caches.match(request).then(cachedResponse => {
        const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
                const responseToCache = networkResponse.clone();
                caches.open(cacheName).then(cache => cache.put(request, responseToCache));
            }
            return networkResponse;
        }).catch(() => cachedResponse || new Response('', { status: 404, statusText: 'Not Found' }));

        return cachedResponse || fetchPromise;
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
            // ⚠️ clone() debe llamarse SINCRÓNICAMENTE aquí, antes de devolver
            // networkResponse - si se llama dentro del .then() de abajo, el
            // body de networkResponse ya puede haber sido consumido por el
            // navegador para cuando ese callback async se ejecuta.
            if (networkResponse.ok) {
                const responseToCache = networkResponse.clone();
                caches.open(cacheName).then(cache => cache.put(request, responseToCache));
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

    // --- REGLA 1.5: NUNCA interceptar config-local.js ---
    // Se carga vía dynamic import() para las API keys locales; interceptarlo con
    // respondWith() ha producido NS_ERROR_CORRUPTED_CONTENT en algunos navegadores.
    // Dejar que el navegador lo pida directamente a la red, sin pasar por el SW.
    if (url.pathname.endsWith('/config-local.js')) {
        return;
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

    // --- REGLA 3.5: CSS SIEMPRE STALE-WHILE-REVALIDATE ---
    // Se sirve del caché (rápido) pero se refresca de la red en segundo plano:
    // los fixes de estilos llegan a todos en la siguiente visita, sin depender
    // de que alguien se acuerde de bumpear la versión del SW.
    if (url.pathname.endsWith('.css')) {
        event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
        return;
    }

    // --- REGLA 4: ESTRATEGIA PARA RECURSOS DEL APP SHELL ---
    // Si la petición es para un recurso que ya debería estar en el caché estático.
    if (APP_SHELL_URLS.includes(url.pathname)) {
        event.respondWith(staleWhileRevalidate(request, STATIC_CACHE_NAME));
        return;
    }

    // --- REGLA 5: ESTRATEGIA PARA RECURSOS DINÁMICOS (Imágenes, Fuentes, etc.) ---
    // Para cualquier otra petición (imágenes, fuentes), caché primero: casi
    // nunca cambian y ahorra datos.
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE_NAME));
});
