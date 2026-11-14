import { test, expect } from './fixtures.mjs';
import fs from 'node:fs';
import path from 'node:path';

const widths = [1440, 1024, 768, 390];
const themes = ['light', 'dark'];

test('itinerary save status reflects completed and rejected writes', async ({ page }) => {
  await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    const { itinerarySaveStatus } = await import('/js/core/itinerary-save-status.js');
    window.finishWrite = null;
    window.writeResult = itinerarySaveStatus.track(() => new Promise(resolve => { window.finishWrite = resolve; }));
  });
  const status = page.locator('#itinerarySaveStatus');
  await expect(status).toContainText('guardando cambios');
  await page.evaluate(async () => { window.finishWrite(); await window.writeResult; });
  await expect(status).toContainText('cambios guardados');
  await page.evaluate(async () => {
    const { itinerarySaveStatus } = await import('/js/core/itinerary-save-status.js');
    await itinerarySaveStatus.track(() => Promise.reject(new Error('write denied'))).catch(() => {});
  });
  await expect(status).toContainText('no se pudieron guardar');
});

test('desktop reservations shortcut opens reservations', async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/dashboard.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(() => {
    document.querySelector('#appDashboard')?.classList.remove('hidden');
    window.DashboardApp = {openFloatingModal:name => { window.openedPanel = name; }};
  });
  await page.locator('[data-rail-action="reservations"]').click();
  expect(await page.evaluate(() => window.openedPanel)).toBe('reservations');
});

for (const width of widths) for (const theme of themes) {
  test(`app shell ${theme} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.addInitScript(({ selectedTheme }) => {
      sessionStorage.setItem('authenticated', 'true');
      localStorage.setItem('theme-preference', selectedTheme);
    }, { selectedTheme: theme });
    await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate((selectedTheme) => {
      document.querySelector('#appDashboard')?.classList.remove('hidden');
      document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
      document.documentElement.dataset.theme = selectedTheme;
    }, theme);
    await page.addStyleTag({ content: '#appDashboard.hidden{display:block!important} body > .fixed:not(#mobile-bottom-nav){display:none!important}' });
    await expect(page.locator('.japan-header')).toBeVisible();
    if (width >= 1180) {
      await expect(page.locator('.jp-desktop-rail')).toBeVisible();
      await expect(page.locator('#tabSelector [data-tab="home"]')).toBeHidden();
      await expect(page.locator('#tabSelector [data-tab="flights"]')).toBeVisible();
    }
    if (width <= 768) await expect(page.locator('#mobile-bottom-nav')).toBeVisible({ timeout: 15000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    const target = path.resolve('artifacts/shell-phase1', theme, `${width}.png`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    await page.screenshot({ path: target, animations: 'disabled' });
  });
}

test('mobile quick create dialog restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => sessionStorage.setItem('authenticated', 'true'));
  await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.querySelector('#appDashboard')?.classList.remove('hidden'));
  await page.addStyleTag({ content: '#appDashboard.hidden{display:block!important} body > .fixed:not(#mobile-bottom-nav){display:none!important}' });
  const trigger = page.locator('.mobile-nav-item--create');
  await expect(trigger).toBeVisible({ timeout: 15000 });
  await trigger.click();
  await expect(page.locator('.jp-quick-create')).toBeVisible();
  await expect(page.locator('.jp-quick-create [data-close]')).toBeFocused();
  const target = path.resolve('artifacts/shell-phase1/light/390-quick-create.png');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await page.screenshot({ path: target, animations: 'disabled' });
  await page.keyboard.press('Escape');
  await expect(page.locator('.jp-quick-create')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
