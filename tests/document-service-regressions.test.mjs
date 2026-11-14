import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const tasks = [], batches = [], deletedBlobs = [];
let sequence = 0, batchFails = false, transactionFails = false, blobExists = true, count = 1;
const records = new Map();
const reference = path => ({ path, id: path.split('/').at(-1) });
const context = {
  auth: { currentUser: { uid: 'original-user' } }, db: {}, storage: {},
  collection: (_, path) => reference(path),
  doc: (base, ...parts) => reference(parts.length ? parts.join('/') : `${base.path}/doc-${++sequence}`),
  ref: (_, path) => path, increment: delta => ({ delta }), serverTimestamp: () => 1,
  addDoc: async () => {},
  uploadBytesResumable: () => {
    const task = { on: (_event, progress, error, complete) => Object.assign(task, { progress, error, complete }), cancel: () => { queueMicrotask(() => task.error({ code: 'storage/canceled' })); return true; } };
    tasks.push(task); return task;
  },
  writeBatch: () => {
    const writes = [];
    return { set: (ref, data) => writes.push({ ref, data, type: 'set' }), update: (ref, data) => writes.push({ ref, data, type: 'update' }), commit: async () => { if (batchFails) throw new Error('commit denied'); batches.push(writes); } };
  },
  deleteObject: async path => {
    deletedBlobs.push(path);
    if (!blobExists) throw Object.assign(new Error('missing'), { code: 'storage/object-not-found' });
    blobExists = false;
  },
  updateDoc: async (ref, data) => {
    if (!records.has(ref.path)) throw new Error('missing record');
    records.set(ref.path, { ...records.get(ref.path), ...data });
  },
  runTransaction: async (_, work) => {
    const writes = [];
    await work({ get: async ref => ({ exists: () => records.has(ref.path), data: () => records.get(ref.path) }), delete: ref => writes.push({ remove: ref }), update: (ref, data) => writes.push({ ref, data }) });
    if (transactionFails) throw new Error('transaction denied');
    for (const write of writes) {
      if (write.remove) records.delete(write.remove.path);
      else count += write.data.documentCount.delta;
    }
  }
};
vm.createContext(context);
const source = fs.readFileSync(new URL('../js/features/documents/document-service.js', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?;\r?\n/gm, '').replaceAll('export ', '');
vm.runInContext(`${source}\nglobalThis.service = tripDocumentService;`, context);
const service = context.service;
const options = { tripId: 'A', file: { name: 'ticket.pdf', type: 'application/pdf', size: 100 }, category: 'Boletos', reservationId: 'r1' };

// Identity and counter changes belong to the original upload, in one commit.
const uploaded = service.upload(options);
assert.throws(() => service.upload(options), /carga en curso/);
context.auth.currentUser = { uid: 'different-user' };
await tasks[0].complete();
await uploaded.promise;
assert.equal(batches[0].length, 2);
assert.equal(batches[0][0].data.uploadedBy, 'original-user');
assert.match(batches[0][0].data.storagePath, /original-user/);
assert.equal(batches[0][1].data.documentCount.delta, 1);
assert.equal(service.activeUpload, null);

// A rejected metadata commit does not leave a counter increment or record.
batchFails = true; blobExists = true;
const failedUpload = service.upload(options);
const rejected = assert.rejects(failedUpload.promise, /metadatos/);
await tasks[1].complete();
await rejected;
assert.equal(batches.length, 1);
assert.equal(deletedBlobs.length, 1);
assert.equal(service.activeUpload, null);
batchFails = false;

// Cancellation releases the old task, and its delayed error cannot clear a new one.
const cancelled = service.upload(options);
const cancelResult = assert.rejects(cancelled.promise, error => error.code === 'storage/canceled');
cancelled.cancel();
const next = service.upload(options);
await cancelResult;
assert.equal(service.activeUpload, tasks[3]);
await tasks[3].complete(); await next.promise;
const networkFailure = service.upload(options);
const failure = assert.rejects(networkFailure.promise, /network/);
tasks[4].error(new Error('network'));
await failure;
assert.equal(service.activeUpload, null);

// Failed deletion metadata keeps the counter unchanged and can be retried after blob deletion.
const document = { id: 'ticket', storagePath: 'blob/ticket', reservationId: 'r1' };
records.set('trips/A/documents/ticket', { reservationId: 'r1' });
blobExists = true; transactionFails = true;
await assert.rejects(service.remove('A', document), /Reintenta/);
assert.equal(count, 1);
assert.equal(records.get('trips/A/documents/ticket').deletionState, 'storage-deleted');
transactionFails = false;
await service.remove('A', document);
assert.equal(count, 0);
assert.equal(records.has('trips/A/documents/ticket'), false);
await service.remove('A', document);
assert.equal(count, 0, 'A repeated removal must not decrement the counter twice');
console.log('document service regressions: original identity, atomic metadata, cancellation, failure cleanup and retryable deletion ok');
