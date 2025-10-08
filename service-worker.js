/* ===================================
   SERVICE WORKER - SOPORTE OFFLINE
   =================================== */

   const CACHE_NAME = 'japan-trip-v1';
   const urlsToCache = [
       '/',
       '/index.html',
       '/css/main.css',
       '/js/app.js',
       '/js/itinerary-data.js',
       '/js/budget-tracker.js',
       '/js/map.js',
       '/js/gallery.js',
       '/manifest.json'
   ];
   
   // Install - Cache resources
   self.addEventListener('install', event => {
       console.log('✅ Service Worker: Installing...');
       event.waitUntil(
           caches.open(CACHE_NAME)
               .then(cache => {
                   console.log('✅ Service Worker: Caching files');
                   return cache.addAll(urlsToCache);
               })
               .then(() => self.skipWaiting())
       );
   });
   
   // Activate - Clean old caches
   self.addEventListener('activate', event => {
       console.log('✅ Service Worker: Activating...');
       event.waitUntil(
           caches.keys().then(cacheNames => {
               return Promise.all(
                   cacheNames.map(cacheName => {
                       if (cacheName !== CACHE_NAME) {
                           console.log('✅ Service Worker: Removing old cache', cacheName);
                           return caches.delete(cacheName);
                       }
                   })
               );
           }).then(() => self.clients.claim())
       );
   });
   
   // Fetch - Serve from cache when offline
   self.addEventListener('fetch', event => {
       event.respondWith(
           caches.match(event.request)
               .then(response => {
                   // Return cached version or fetch from network
                   return response || fetch(event.request)
                       .catch(() => {
                           // If both cache and network fail, return offline page
                           if (event.request.destination === 'document') {
                               return caches.match('/index.html');
                           }
                       });
               })
       );
   });