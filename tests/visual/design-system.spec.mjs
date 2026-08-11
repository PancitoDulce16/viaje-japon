import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// These snapshots share the same font and illustration-heavy laboratory page.
// Running all 32 variants concurrently can capture a transient fallback-font
// layout even after document.fonts.ready, producing random 5px height changes.
test.describe.configure({ mode: 'serial' });

const widths = [1440, 1024, 768, 390];
const themes = ['light', 'dark'];
const states = ['full', 'empty', 'error', 'loading'];

for (const width of widths) for (const theme of themes) for (const state of states) {
  test(`${theme} ${state} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(`/design-system?theme=${theme}&state=${state}`);
    await page.evaluate(async () => {
      await Promise.all([
        document.fonts.load('800 32px "Bricolage Grotesque"'),
        document.fonts.load('400 16px "Inter"')
      ]);
      await document.fonts.ready;
    });
    await expect(page.locator('main')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    if (state === 'full') {
      await expect(page.locator('.lab-reference')).toHaveCount(8);
      await expect(page.locator('.jp-companion')).toHaveCount(2);
      await expect(page.locator('.jp-companion img[src$="/companions/cat-guide.png"]')).toBeVisible();
      await expect(page.locator('.jp-companion img[src$="/companions/dog-explorer.png"]')).toBeVisible();
      await expect(page.locator('#movil')).toBeVisible();
    }
    const target = path.resolve('artifacts/design-system', theme, `${width}-${state}.png`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    await page.screenshot({ path: target, fullPage: true });
    await expect(page).toHaveScreenshot(`${theme}-${state}-${width}.png`, { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.01 });
  });
}
