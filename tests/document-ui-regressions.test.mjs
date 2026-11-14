import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const revoked = [], opened = [], reads = [], uploads = [];
let modal = null;
const host = { innerHTML: '', setAttribute() {}, removeAttribute() {}, querySelectorAll: () => [] };
const context = {
  auth: { currentUser: { uid: 'user' } }, db: {},
  window: { TripsManager: { currentTrip: null }, open: url => opened.push(url) },
  localStorage: { getItem: () => null },
  document: { getElementById: id => id === 'tripDocumentsModal' ? modal : id === 'tripDocumentsList' ? host : null, createElement: () => ({ click() {} }) },
  URL: { revokeObjectURL: url => revoked.push(url) },
  collection: (_, path) => path,
  getDocs: () => { const request = deferred(); reads.push(request); return request.promise; },
  tripDocumentService: {
    upload: options => { const request = deferred(); const operation = { promise: request.promise, cancel: () => request.reject({ code: 'storage/canceled' }) }; uploads.push({ options, request, operation }); return operation; }
  },
  FormData: class { constructor(form) { this.values = form.values; } get(key) { return this.values[key]; } },
  alert: message => { throw new Error(`Unexpected alert: ${message}`); }, confirm: () => true
};
vm.createContext(context);
const source = fs.readFileSync(new URL('../js/features/documents/trip-documents.js', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?;\r?\n/gm, '').replace('export const TripDocuments', 'const TripDocuments');
vm.runInContext(source, context);
const documents = context.window.TripDocuments;
function mount(tripId = 'A', reservationId = 'r1') {
  context.window.TripsManager.currentTrip = { id: tripId, info: { createdBy: 'user' } };
  modal = { remove() { if (documents.session?.modal !== this) modal = null; } };
  documents.session = { tripId, userId: 'user', context: { reservationId }, modal, deleting: new Set() };
  return documents.session;
}
const snapshot = (id, reservationId) => ({ docs: [{ id, data: () => ({ reservationId, visibleName: id, size: 100 }) }] });

// A response from a previous reservation view cannot replace the new one.
mount('A', 'old-reservation');
const oldLoad = documents.load();
mount('A', 'new-reservation');
const newLoad = documents.load();
reads[1].resolve(snapshot('new', 'new-reservation')); await newLoad;
reads[0].resolve(snapshot('old', 'old-reservation')); await oldLoad;
assert.equal(documents.documents[0].id, 'new');
const olderRefresh = documents.load(), newerRefresh = documents.load();
reads[3].resolve(snapshot('latest', 'new-reservation')); await newerRefresh;
reads[2].resolve(snapshot('stale', 'new-reservation')); await olderRefresh;
assert.equal(documents.documents[0].id, 'latest');
const closingLoad = documents.load();
documents.close();
reads[4].reject(new Error('network failed after close')); await closingLoad;
assert.equal(documents.documents.length, 0);

function uploadForm(session) {
  const controls = { '[data-status]': { textContent: '' }, progress: { hidden: true }, '[data-cancel]': { disabled: true }, '[type="submit"]': { disabled: false }, '[data-preview]': { hidden: false, removeAttribute() {} } };
  return { dataset: {}, values: { file: {}, visibleName: 'Ticket', category: 'Boletos' }, resetCount: 0, reset() { this.resetCount++; }, querySelector: selector => controls[selector], querySelectorAll: () => [], closest: () => session.modal };
}
const session = mount();
const form = uploadForm(session), event = { preventDefault() {}, currentTarget: form };
const uploading = documents.upload(event);
await documents.upload(event);
assert.equal(uploads.length, 1, 'Duplicate submits must not create a second upload');
assert.equal(uploads[0].options.tripId, 'A');
assert.equal(uploads[0].options.reservationId, 'r1');
documents.close();
const nextSession = mount('B');
await uploading;
assert.equal(documents.session, nextSession);
assert.equal(form.resetCount, 0, 'Cancelled uploads must preserve the selected form data');
assert.equal(documents.uploadOperation, null);

const staleForm = uploadForm(session);
await documents.upload({ preventDefault() {}, currentTarget: staleForm });
assert.equal(uploads.length, 1, 'Old modal forms cannot upload into a new trip');

// Successful upload resets only its own form and clears the selected image URL.
const activeForm = uploadForm(nextSession);
documents.previewUrl = 'blob:preview';
const successfulUpload = documents.upload({ preventDefault() {}, currentTarget: activeForm });
uploads[1].request.resolve();
await new Promise(setImmediate);
reads[5].resolve(snapshot('saved', 'r1'));
await successfulUpload;
assert.equal(activeForm.resetCount, 1);
assert.equal(activeForm.querySelector('[data-preview]').hidden, true);
assert.ok(revoked.includes('blob:preview'));

// Fetching an object URL after closing the viewer must not open a window or leak the URL.
documents.documents = [{ id: 'doc', visibleName: 'Ticket' }];
const blob = deferred();
context.tripDocumentService.open = () => blob.promise;
const viewing = documents.view('doc', false);
documents.close();
blob.resolve('blob:late'); await viewing;
assert.equal(opened.length, 0);
assert.ok(revoked.includes('blob:late'));

// Duplicate deletion clicks share one operation; its completion cannot refresh a new trip.
mount(); documents.documents = [{ id: 'doc', visibleName: 'Ticket' }];
let removals = 0;
const removal = deferred();
context.tripDocumentService.remove = (tripId) => { assert.equal(tripId, 'A'); removals++; return removal.promise; };
const deleting = documents.remove('doc'); await documents.remove('doc');
assert.equal(removals, 1);
mount('B');
const before = reads.length;
removal.resolve(); await deleting;
assert.equal(reads.length, before);
console.log('document UI regressions: stale loads, closed views, cancelled/duplicate uploads, preview cleanup and scoped deletion ok');
