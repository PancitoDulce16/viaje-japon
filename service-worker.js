/* ===================================
   SERVICE WORKER - SOPORTE OFFLINE
   =================================== */

const CACHE_NAME = 'japan-trip-v1.1';

// Rutas corregidas con el prefijo del repositorio
const urlsToCache = [
    '/viaje-japon/',
    '/viaje-japon/index.html',
    '/viaje-japon/css/main.css',
    '/viaje-japon/js/app.js',
    '/viaje-japon/js/itinerary-data.js',
    '/viaje-japon/js/budget-tracker.js',
    '/viaje-japon/js/map.js',
    '/viaje-japon/js/gallery.js',
    '/viaje-japon/manifest.json',
    '/viaje-japon/images/icons/icon-192.png',
    '/viaje-japon/images/icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
            .catch(err => console.error('Cache failed:', err))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('/viaje-japon/index.html');
                }
            })
    );
});
