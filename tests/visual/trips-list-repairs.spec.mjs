import { test, expect } from './fixtures.mjs';
import fs from 'node:fs';

for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
  test(`Mis viajes from menu ${theme} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const source = fs.readFileSync('js/features/trips/trips-manager.js', 'utf8').replace(/^import[\s\S]*?;\r?\n/gm, '');
    await page.route('**/js/features/trips/trips-manager.js*', route => route.fulfill({ contentType: 'application/javascript', body: `
      import { TimeUtils } from '/js/utils/time-utils.js';
      const auth={currentUser:null},db={},collection=()=>null,query=()=>null,where=()=>null;
      const onSnapshot=(q,success,error)=>{window.tripListeners.push({success,error});return ()=>{};};
      ${source}
      window.tripTestAuth=auth; window.tripListeners=[];
    ` }));
    await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(async theme => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.dataset.theme = theme;
      document.querySelector('#appDashboard').classList.remove('hidden');
      const { ModalRenderer } = await import('/js/ui/modals.js');
      ModalRenderer.renderModals();
      const { DashboardManager } = await import('/js/ui/dashboard.js');
      DashboardManager.prototype.setupMobileMenu.call({});
      const manager = window.TripsManager;
      manager.currentTrip = { id: 'saved', info: { name: 'Japón guardado' } };
      manager.userTrips = [manager.currentTrip, { id: 'incomplete' }, { id: 'quote', info: { name: 'Viaje "<Tokio>"', dateStart: '2027-01-01', dateEnd: '2027-01-03' }, members: ['me'] }];
      manager.tripsLoadState = 'ready';
      // The list must not depend on another script populating a global first.
      delete window.TimeUtils;
    }, theme);
    await page.locator(width === 390 ? '#menuToggle' : '#menuToggleDesktop').click();
    await page.locator('#mobileMenuPanel button').filter({ hasText: 'Mis Viajes' }).click();
    const modal = page.locator('#modal-trips-list');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.trip-card')).toHaveCount(3);
    await expect(modal).toContainText('Japón guardado');
    await expect(modal).toContainText('Viaje sin nombre');
    await expect(modal).toContainText('Viaje "<Tokio>"');
    await expect(page.locator('#mobileMenu')).toBeHidden();
    const heading = await modal.getByRole('heading', { name: 'Mis Viajes', exact: true }).boundingBox();
    expect(heading.y).toBeGreaterThanOrEqual(0);
    expect(await modal.locator('.trip-card').first().evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2);
    await expect(modal).toContainText('Fechas pendientes');
    await page.screenshot({ path: `artifacts/trips-list/${theme}-${width}.png` });
    await page.evaluate(async () => {
      window.tripTestAuth.currentUser = { uid: 'me' };
      await window.TripsManager.initUserTrips();
      window.tripListeners.at(-1).error(new Error('offline'));
    });
    await expect(modal.getByRole('alert')).toContainText('No pudimos cargar');
    expect(await page.evaluate(() => window.TripsManager.currentTrip.id)).toBe('saved');
    await modal.getByRole('button', { name: 'Reintentar', exact: true }).click();
    await page.evaluate(() => window.tripListeners.at(-1).success({ forEach: fn => fn({ id: 'saved', data: () => ({ info: { name: 'Japón guardado' }, members: ['me'] }) }) }));
    await expect(modal.locator('.trip-card')).toHaveCount(1);
    await expect(modal.getByRole('alert')).toHaveCount(0);
    await page.evaluate(() => window.tripListeners[0].error(new Error('stale listener')));
    await expect(modal.getByRole('alert')).toHaveCount(0);
  });
}
