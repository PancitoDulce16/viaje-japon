/* ===================================
   SERVICE WORKER - SOPORTE OFFLINE
   =================================== */

const CACHE_NAME = 'japan-trip-v1.1';
const BASE_PATH = location.hostname === 'localhost' ? '' : '/viaje-japon';

const urlsToCache = [
    `${BASE_PATH}/`,
    `${BASE_PATH}/index.html`,
    `${BASE_PATH}/css/main.css`,
    `${BASE_PATH}/js/app.js`,
    `${BASE_PATH}/js/itinerary-data.js`,
    `${BASE_PATH}/js/budget-tracker.js`,
    `${BASE_PATH}/js/map.js`,
    `${BASE_PATH}/js/gallery.js`,
    `${BASE_PATH}/manifest.json`
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
                    return caches.match(`${BASE_PATH}/index.html`);
                }
            })
    );
});
