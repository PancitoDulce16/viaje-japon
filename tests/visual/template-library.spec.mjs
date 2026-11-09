import { test, expect } from './fixtures.mjs';
import fs from 'node:fs';
import { instantiateTemplate } from '../../js/features/itinerary/template-library.js';

async function mount(page, theme, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.addInitScript(theme => {
    sessionStorage.setItem('authenticated', 'true');
    localStorage.setItem('theme-preference', theme);
  }, theme);
  await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(theme => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    document.querySelector('#appDashboard')?.classList.remove('hidden');
  }, theme);
  await page.addStyleTag({ content: '#appDashboard.hidden{display:block!important} body > .fixed:not(#mobile-bottom-nav){display:none!important}' });
}

for (const width of [1440, 1024, 768, 390]) for (const theme of ['light', 'dark']) {
  test(`template library ${theme} ${width}`, async ({ page }) => {
    await mount(page, theme, width);
    await page.evaluate(async () => {
      const { openTemplateLibrary } = await import('/js/features/itinerary/template-selector.js');
      openTemplateLibrary({ onCreate: async prepared => { window.createdTemplatePreview = prepared; } });
    });
    const dialog = page.locator('#templateSelectorModal');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cerrar plantillas' })).toBeFocused();
    expect((await dialog.getByRole('button', { name: 'Cerrar plantillas' }).boundingBox()).width).toBeLessThanOrEqual(50);
    const card = dialog.locator('[data-template-id="japan-february-2027"]');
    await expect(card).toContainText('20 días');
    await expect(card.locator('input[type="date"]')).toHaveValue('2027-02-15');
    const contrast = await card.locator('[type="submit"]').evaluate(node => {
      const style = getComputedStyle(node);
      const luminance = color => {
        const [r,g,b] = color.match(/[\d.]+/g).slice(0,3).map(Number).map(n => {
          const channel = n / 255;
          return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        });
        return .2126*r + .7152*g + .0722*b;
      };
      const a = luminance(style.color), b = luminance(style.backgroundColor);
      return (Math.max(a,b) + .05) / (Math.min(a,b) + .05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    await card.locator('summary').click();
    await expect(card.locator('ol > li')).toHaveCount(20);
    await expect(card).toContainText('Cherm Side');
    await expect(card).toContainText('2026-11-30');
    await card.locator('summary').click();
    expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.querySelectorAll('#templateSelectorModal img')].map(image => image.decode()));
      document.querySelector('.jp-template-library__paper').scrollTop = 0;
    });
    fs.mkdirSync('artifacts/template-library', { recursive: true });
    await page.screenshot({ path: `artifacts/template-library/${theme}-${width}.png`, fullPage: true });
    await card.getByRole('button', { name: 'Crear viaje con esta plantilla' }).click();
    await expect(dialog).toHaveCount(0);
    const captured = await page.evaluate(() => ({ trip: window.createdTemplatePreview.tripData, days: window.createdTemplatePreview.itineraryData.days.length }));
    expect(captured.days).toBe(20);
    expect(captured.trip).toMatchObject({ dateStart: '2027-02-15', dateEnd: '2027-03-06', useTemplate: true, templateId: 'japan-february-2027' });
  });
}

test('template errors stay visible and keyboard focus stays in the dialog', async ({ page }) => {
  await mount(page, 'light', 390);
  await page.evaluate(async () => {
    const { openTemplateLibrary } = await import('/js/features/itinerary/template-selector.js');
    const trigger = document.createElement('button'); trigger.id = 'template-trigger'; trigger.textContent = 'Abrir plantillas'; document.body.append(trigger); trigger.focus();
    openTemplateLibrary({ onCreate: async () => { throw new Error('Sin conexión. Intentá de nuevo.'); } });
  });
  const dialog = page.locator('#templateSelectorModal');
  const card = dialog.locator('[data-template-id="japan-february-2027"]');
  await card.getByRole('button', { name: 'Crear viaje con esta plantilla' }).click();
  await expect(card.getByRole('alert')).toHaveText('Sin conexión. Intentá de nuevo.');
  await expect(card.getByRole('button', { name: 'Crear viaje con esta plantilla' })).toBeEnabled();
  const finalButton = dialog.getByRole('button', { name: 'Crear viaje con esta plantilla' }).last();
  await finalButton.focus(); await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Cerrar plantillas' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('#template-trigger')).toBeFocused();
});

test('February template renders all days, hotels and booking notes in the real itinerary', async ({ page }) => {
  await mount(page, 'dark', 390);
  const prepared = instantiateTemplate('japan-february-2027');
  await page.evaluate(async prepared => {
    document.querySelectorAll('.tab-content').forEach(node => node.classList.add('hidden'));
    document.querySelector('#content-itinerary').classList.remove('hidden');
    document.querySelector('#currentTripHeader')?.classList.add('hidden');
    const { ItineraryHandler } = await import('/js/features/itinerary/itinerary-v3.js');
    await ItineraryHandler.preview(prepared.itineraryData, { day: 12, trip: { id: 'template-preview', info: prepared.tripData } });
  }, prepared);
  await expect(page.locator('.day-ticket')).toHaveCount(20);
  await expect(page.locator('.jp-template-planning')).toBeVisible();
  await page.locator('.jp-template-planning > summary').click();
  await expect(page.locator('.jp-template-planning')).toContainText('2026-11-30');
  await expect(page.locator('.jp-template-planning')).toContainText('Cherm Side');
  await page.locator('.jp-template-planning > summary').click();
  await expect(page.locator('.activity-card')).toHaveCount(5);
  await expect(page.locator('.activity-card').first()).toContainText('Precio por confirmar');
  await expect(page.locator('#dayOverview')).toContainText('Osaka Namba');
  expect(await page.locator('.itinerary-day-nav').evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe('rgb(0, 0, 0)');
  fs.mkdirSync('artifacts/template-library', { recursive: true });
  await page.screenshot({ path: 'artifacts/template-library/february-itinerary-dark-390.png', fullPage: true });
});
