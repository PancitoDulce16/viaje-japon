// service-worker.js

// Incrementa la versión para forzar la actualización del caché.
// Cada vez que hagas un cambio importante, incrementa este número (v1.8, v1.9, etc.).
const CACHE_NAME = 'japan-trip-planner-cache-v2.0'; 

// Lista de archivos esenciales para que la app funcione sin conexión.
// Las rutas son relativas a la raíz del sitio, correctas para Firebase Hosting.
const urlsToCache = [
    '/',
    '/index.html',
    // CSS
    '/css/main.css',
    '/css/sakura.css',
    '/css/japan-theme.css',
    // JS Core & Modules
    '/js/app.js',
    '/js/core.js',
    '/js/auth.js',
    '/js/itinerary.js',
    '/js/tabs.js',
    '/js/modals.js',
    '/js/map.js',
    '/js/attractions.js',
    '/js/preparation.js',
    '/js/transport.js',
    '/js/flights.js',
    '/js/hotels.js',
    '/js/notifications.js',
    '/js/itinerary-builder.js',
    '/js/itinerary-builder-part2.js',
    '/js/trips-manager.js',
    '/js/helpers.js',
    '/js/utils.js',
    '/js/constants.js',
    // Data
    '/data/activities-database.js',
    '/data/airlines-data.js',
    '/data/attractions-data.js',
    '/data/categories-data.js',
    '/data/japan-cities.js',
    // Manifest & Icons
    '/manifest.json',
    '/images/icons/icon-192.png',
    '/images/icons/icon-512.png'
    // Los archivos de configuración (firebase-config.js, etc.) se excluyen 
    // intencionalmente para que siempre se descarguen de la red.
];

// Evento 'install': Se dispara cuando el navegador instala el service worker.
self.addEventListener('install', event => {
    console.log('[Service Worker] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Abriendo caché y guardando archivos principales.');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // Forzar la activación del nuevo service worker inmediatamente.
                return self.skipWaiting(); 
            })
            .catch(error => {
                console.error('[Service Worker] Falló el cacheo de archivos durante la instalación:', error);
            })
    );
});

// Evento 'activate': Se dispara cuando el service worker se activa.
// Es el momento ideal para limpiar cachés antiguos.
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Si el nombre del caché no es el actual, se borra.
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Borrando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Reclamando control de las páginas abiertas.');
            // Tomar control inmediato de las páginas para que usen este service worker.
            return self.clients.claim();
        })
    );
});

// Evento 'fetch': Se dispara cada vez que la página realiza una petición de red.
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Para archivos JavaScript y HTML: usar estrategia "Network First"
    // Esto asegura que siempre se obtenga la última versión cuando hay conexión
    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.html') || url.pathname === '/') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Guardar la nueva versión en caché
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Si falla la red, usar caché como fallback
                    return caches.match(event.request);
                })
        );
    } else {
        // Para otros recursos (CSS, imágenes, etc.): usar estrategia "Cache First"
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request);
                })
                .catch(error => {
                    console.error(`[Service Worker] Error de fetch para ${event.request.url}:`, error);
                })
        );
    }
});
