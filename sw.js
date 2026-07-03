// sw.js — SERVICE WORKER KAMIKAZE (auto-destrucción)
//
// Este archivo fue un service worker cache-first SIN versión ('japitin-v1'):
// servía el HTML/CSS cacheado la primera vez y NUNCA volvía a pedir nada a la
// red. Cualquier navegador que lo registró quedó congelado en una versión
// vieja de la app para siempre — aunque ya nadie registre este archivo, el SW
// registrado persiste en el navegador hasta ser desregistrado.
//
// Al ser byte-diferente, el navegador instala esta versión en el próximo
// update-check (cada navegación / 24 h), y esta versión: borra TODOS los
// cachés, se desregistra a sí misma y recarga las pestañas para que el
// service worker bueno (service-worker.js) tome el control.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      console.log('[sw.js] 💣 Auto-destrucción: limpiando cachés y desregistrando');
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
