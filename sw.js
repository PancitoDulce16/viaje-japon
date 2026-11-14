// Retire only Japitin's obsolete cache-first worker; preserve other caches and active forms.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name === 'japitin-v1').map(name => caches.delete(name)));
    await self.registration.unregister();
  })());
});
