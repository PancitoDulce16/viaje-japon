import assert from 'node:assert/strict';
import { createFeatureLoader } from '../js/core/feature-loader.js';

let calls = 0;
const load = createFeatureLoader([
  async () => { calls += 1; await new Promise(resolve => setTimeout(resolve, 10)); },
  async () => { calls += 1; }
]);
assert.deepEqual(await Promise.all([load(), load(), load()]), [true, true, true]);
assert.equal(calls, 2, 'concurrent calls share one load');
await load();
assert.equal(calls, 2, 'a completed feature stays cached');

let attempts = 0;
const retryable = createFeatureLoader([async () => {
  attempts += 1;
  if (attempts === 1) throw new Error('offline');
}]);
await assert.rejects(retryable(), /offline/);
assert.equal(await retryable(), true);
assert.equal(attempts, 2, 'a failed feature can be retried');
assert.throws(() => createFeatureLoader([]), /non-empty array/);
console.log('feature loader: ok');
