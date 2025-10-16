// service-worker.js actualizado para Japan Trip Planner

const CACHE_NAME = 'japan-trip-planner-cache-v2.0';

// Archivos esenciales para funcionamiento offline
const urlsToCache = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/sakura.css',
    '/css/japan-theme.css',
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
    '/data/activities-database.js',
    '/data/airlines-data.js',
    '/data/attractions-data.js',
    '/data/categories-data.js',
    '/data/japan-cities.js',
    '/manifest.json',
    '/images/icons/icon-192.png',
    '/images/icons/icon-512.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    console.log('[Service Worker] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Guardando archivos en caché...');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
            .catch(error => {
                console.error('[Service Worker] Error al cachear archivos:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Controlando páginas abiertas...');
            return self.clients.claim();
        })
    );
});

// Intercepción de peticiones
self.addEventListener('fetch', event => {
    const url = event.request.url;

    // 🔐 Evitar interferencia con rutas de autenticación de Firebase
    const authUrls = [
        '/__/auth/handler',
        'https://www.gstatic.com/firebasejs/',
        'https://securetoken.googleapis.com/'
    ];
    if (authUrls.some(authUrl => url.includes(authUrl))) {
        return;
    }

    // 🧠 Evitar interceptar navegación HTML (redirecciones)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('/index.html'))
        );
        return;
    }

    const requestURL = new URL(url);

    // Estrategia "Network First" para JS y HTML
    if (requestURL.pathname.endsWith('.js') || requestURL.pathname.endsWith('.html') || requestURL.pathname === '/') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        // Estrategia "Cache First" para otros recursos
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    return cachedResponse || fetch(event.request);
                })
                .catch(error => {
                    console.error(`[Service Worker] Error al obtener ${event.request.url}:`, error);
                })
        );
    }
});

// Manejo de errores globales del Service Worker
self.addEventListener('error', event => {
    console.error('[Service Worker] Error global:', event);
});
