import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const handlers = {};
const removed = [];
const context = { URL, Request, Response, console: { log() {}, error() {} }, self: {
  location: { origin: 'https://japitin.test' },
  addEventListener: (type, listener) => { handlers[type] = listener; }, clients: { claim: async () => {} }
}, caches: {
  keys: async () => ['other-app-cache', 'firebase-messaging', 'static-japan-trip-planner-static-v19.0', 'dynamic-japan-trip-planner-dynamic-v20.0'],
  delete: async name => { removed.push(name); }
} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8'), context);
await new Promise((resolve, reject) => handlers.activate({ waitUntil: promise => promise.then(resolve, reject) }));
assert.deepEqual(removed, ['static-japan-trip-planner-static-v19.0']);
for (const url of ['https://other.test/image.png', 'https://japitin.test/api/places', 'https://japitin.test/flightsProxy', 'https://japitin.test/hotelsProxy', 'https://japitin.test/__/auth/handler', 'https://japitin.test/js/config-local.js']) {
  handlers.fetch({ request: new Request(url), respondWith: () => assert.fail(`must not intercept ${url}`) });
}
context.fetch = async () => { throw new Error('offline'); };
context.caches.match = async key => key === '/index.html' ? new Response('cached index') : undefined;
let response;
handlers.fetch({ request: { url: 'https://japitin.test/dashboard.html', method: 'GET', mode: 'navigate' }, respondWith: promise => { response = promise; } });
assert.equal(await (await response).text(), 'cached index', 'an empty cache lookup must fall back to the app shell');
context.caches.match = async () => undefined;
handlers.fetch({ request: { url: 'https://japitin.test/dashboard.html', method: 'GET', mode: 'navigate' }, respondWith: promise => { response = promise; } });
assert.equal((await response).status, 503, 'offline with no shell must still return a valid Response');
console.log('service worker: private APIs bypass caching, unrelated caches preserved');
