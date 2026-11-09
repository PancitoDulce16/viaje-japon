import assert from 'node:assert/strict';
import { preview } from 'vite';
import { chromium } from '@playwright/test';

const server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: false, open: false } });
let browser;
try {
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  for (const url of ['/dashboard.html', '/login.html', '/manifest.json', '/service-worker.js', '/firebase-messaging-sw.js', '/images/illustrations/generated/companions/cat-guide.png', '/images/wizard/map-backdrop-night.webp', '/data/templates/japan-february-2027.js']) {
    const response = await fetch(base + url);
    assert.equal(response.status, 200, url);
    assert.ok((await response.arrayBuffer()).byteLength > 0, url);
  }
  browser = await chromium.launch({ channel: 'msedge' });
  for (const route of ['/login.html', '/dashboard.html']) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    if (route === '/login.html') await page.locator('#loginEmail').waitFor();
    assert.equal(errors.length, 0, `${route}: ${errors.join('\n')}`);
    await page.close();
  }
  console.log('production smoke: login and dashboard bundles evaluate without errors; eight runtime resources available');
} finally {
  await browser?.close();
  await server.close();
}
