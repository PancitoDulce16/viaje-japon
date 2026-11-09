import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
for (const name of ['dashboard.html', 'login.html', 'manifest.json', 'service-worker.js', 'firebase-messaging-sw.js', 'css/main.css', 'css/japan-theme.css', 'images/illustrations/generated/companions/cat-guide.png', 'images/illustrations/generated/companions/dog-explorer.png', 'images/wizard/map-backdrop-day.webp', 'data/templates/japan-february-2027.js']) {
  assert.ok(fs.statSync(path.join('dist', name)).size > 0, `missing runtime asset: ${name}`);
}
const manifest = JSON.parse(fs.readFileSync('dist/manifest.json', 'utf8'));
for (const icon of manifest.icons) assert.ok(fs.existsSync(path.join('dist', icon.src.replace(/^\//, ''))), `missing manifest icon: ${icon.src}`);
assert.equal(fs.existsSync('dist/docs'), false);
assert.equal(fs.existsSync('dist/js/config-local.js'), false, 'private local configuration must not be copied into the build');
console.log('production artifact: runtime assets, data, workers and manifest icons available');
