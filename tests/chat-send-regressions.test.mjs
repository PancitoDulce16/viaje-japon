import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const stored = new Map(), writes = [], notices = [];
let input = { value: 'Primero' }, button = { disabled: false }, operation = deferred();
const context = {
  db: {}, auth: { currentUser: { uid: 'user', email: null } },
  console: { error() {} },
  window: { addEventListener() {}, TripsManager: { currentTrip: { id: 'A' } }, Notifications: { show: text => notices.push(text), error: text => notices.push(text) } },
  document: { getElementById: id => id === 'chatInput' ? input : id === 'sendMessageBtn' ? button : null },
  localStorage: { getItem: key => stored.get(key) ?? null, removeItem: key => stored.delete(key) },
  collection: (_, path) => path, serverTimestamp: () => 1,
  addDoc: (path, data) => { writes.push({ path, data }); return operation.promise; }
};
vm.createContext(context);
const source = fs.readFileSync(new URL('../js/features/social/group-chat.js', import.meta.url), 'utf8').replace(/^import[\s\S]*?;\r?\n/gm, '').replace('export const GroupChat', 'const GroupChat');
vm.runInContext(source, context);
const chat = context.window.GroupChat;
chat.cancelReply = () => { chat.replyingTo = null; };
stored.set('japitin_chat_draft_A', input.value);
const first = chat.sendMessage(); await chat.sendMessage();
assert.equal(writes.length, 1);
assert.equal(button.disabled, true);
assert.equal(writes[0].data.userName, 'Viajero');
input.value = 'Nuevo borrador'; stored.set('japitin_chat_draft_A', input.value);
operation.resolve(); await first;
assert.equal(input.value, 'Nuevo borrador');
assert.equal(stored.get('japitin_chat_draft_A'), 'Nuevo borrador');
assert.equal(button.disabled, false);

operation = deferred();
const oldTripSend = chat.sendMessage();
context.window.TripsManager.currentTrip = { id: 'B' };
input = { value: 'Borrador del viaje B' }; button = { disabled: false };
stored.set('japitin_chat_draft_B', input.value);
operation.resolve(); await oldTripSend;
assert.equal(input.value, 'Borrador del viaje B');
assert.equal(stored.get('japitin_chat_draft_B'), 'Borrador del viaje B');
assert.equal(stored.has('japitin_chat_draft_A'), false);

operation = deferred();
const failed = chat.sendMessage(); operation.reject(new Error('offline')); await failed;
assert.equal(input.value, 'Borrador del viaje B');
assert.equal(button.disabled, false);
assert.match(notices.at(-1), /borrador se conserva/);
operation = deferred(); const retry = chat.sendMessage(); operation.resolve(); await retry;
assert.equal(input.value, '');
assert.equal(stored.has('japitin_chat_draft_B'), false);
input.value = 'Texto compartido'; stored.set('japitin_chat_draft_B', input.value);
operation = deferred(); const switchedUser = chat.sendMessage();
context.auth.currentUser = { uid: 'other-user', email: null };
input = { value: 'Texto compartido' };
operation.resolve(); await switchedUser;
assert.equal(stored.get('japitin_chat_draft_B'), 'Texto compartido', 'A completed old send must not clear another user draft');
operation = deferred(); const storageBlocked = chat.sendMessage();
context.localStorage.getItem = () => { throw new Error('storage blocked'); };
operation.resolve(); await storageBlocked;
assert.equal(input.value, '');
assert.equal(notices.at(-1), 'Mensaje enviado');
console.log('chat send regressions: duplicate sends, newer drafts, trip switching, nullable email and failed writes ok');
