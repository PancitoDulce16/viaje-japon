import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const stored = new Map([['app_version', 'previous'], ['japitin_chat_draft_A', 'unsent message'], ['budget_draft', 'expense'], ['theme-preference', 'dark'], ['firebase:authUser:test', 'session']]);
const removed = [], unregistered = [];
const registrations = ['service-worker.js', 'firebase-messaging-sw.js', 'another-worker.js', 'sw.js'].map(name => ({ active: { scriptURL: `https://japitin.test/${name}` }, unregister: async () => unregistered.push(name) }));
const context = {
  APP_VERSION: 'current', URL, console: { warn() {} },
  localStorage: { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), clear: () => assert.fail('Version updates must not clear localStorage') },
  window: { caches: {}, location: { href: 'https://japitin.test/login.html', origin: 'https://japitin.test', reload: () => assert.fail('Version tracking must not reload active forms') } },
  navigator: { serviceWorker: { getRegistrations: async () => registrations } },
  caches: { keys: async () => ['japitin-v1', 'static-japan-trip-planner-static-v20.0', 'firebase-messaging', 'another-app-cache'], delete: async name => removed.push(name) }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../js/utils/cache-buster.js', import.meta.url), 'utf8').replace(/^import[\s\S]*?;\r?\n/gm, '').replace(/^export /gm, ''), context);
await new Promise(setImmediate);
assert.equal(stored.get('app_version'), 'current');
assert.equal(stored.get('japitin_chat_draft_A'), 'unsent message');
assert.equal(stored.get('budget_draft'), 'expense');
assert.equal(stored.get('theme-preference'), 'dark');
assert.equal(stored.get('firebase:authUser:test'), 'session');
assert.deepEqual(unregistered, ['sw.js']);
assert.deepEqual(removed, ['japitin-v1']);
context.localStorage.getItem = () => { throw new Error('storage blocked'); };
assert.equal(vm.runInContext('checkAndClearCache()', context), false);

const legacyHandlers = {}, legacyRemoved = [];
const legacyContext = {
  self: { addEventListener: (type, handler) => { legacyHandlers[type] = handler; }, registration: { unregister: async () => {} } },
  caches: { keys: async () => ['japitin-v1', 'firebase-messaging', 'other-app'], delete: async name => legacyRemoved.push(name) }
};
vm.createContext(legacyContext);
vm.runInContext(fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), legacyContext);
let activation;
legacyHandlers.activate({ waitUntil: promise => { activation = promise; } });
await activation;
assert.deepEqual(legacyRemoved, ['japitin-v1']);
const login = fs.readFileSync(new URL('../login.html', import.meta.url), 'utf8');
assert.ok(!login.includes("!scriptURL.endsWith('/service-worker.js')"));
assert.ok(login.includes("new URL(scriptURL).pathname === '/sw.js'"));
console.log('cache preservation: drafts, preferences, authentication, push workers and unrelated caches survive updates');
