import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const scripts = [];
const context = { window: {}, Map, console, document: {
  addEventListener() {},
  createElement: () => ({}),
  querySelector: () => ({ remove() {} }),
  head: { appendChild: node => scripts.push(node) }
} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../js/performance/lazy-vendors.js', import.meta.url), 'utf8').replace(/^export /gm, ''), context);
const load = context.window.JapitinPerformance.loadScript;
const first = load('chart');
assert.equal(load('chart'), first, 'concurrent requests share one script');
scripts[0].onerror();
await assert.rejects(first, /chart/);
const retry = load('chart');
assert.notEqual(retry, first, 'a failed network request can be retried');
assert.equal(scripts.length, 2);
scripts[1].onload();
await retry;
await assert.rejects(load('unknown'), /desconocido/);
console.log('vendor loader: deduplicates requests and retries failures');
