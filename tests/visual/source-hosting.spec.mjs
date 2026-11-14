import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('image export works with native modules on source hosting', async ({ page }) => {
  // Source hosting does not inject Vite's live-reload client.
  await page.route('**/@vite/client', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  // Fulfill the original file to bypass Vite's npm-import rewriting, as Firebase source hosting does.
  await page.route('**/js/utils/image-export.js*', route => route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync('js/utils/image-export.js', 'utf8') }));
  await page.goto('/design-system', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    window.html2canvas = async () => {
      const canvas = document.createElement('canvas'); canvas.width = 10; canvas.height = 10; return canvas;
    };
    const { downloadElementAsImage } = await import('/js/utils/image-export.js');
    const button = document.createElement('button'); button.textContent = 'Exportar prueba';
    button.onclick = () => downloadElementAsImage(button, 'japitin-test.png');
    document.body.append(button);
  });
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar prueba' }).click();
  expect((await download).suggestedFilename()).toBe('japitin-test.png');
});
