import { test, expect } from './fixtures.mjs';
import fs from 'node:fs';
import path from 'node:path';

const widths = [1440, 1024, 768, 390];
const themes = ['light', 'dark'];

const fixture = {
  trip: {
    name: 'Japón 2026',
    destination: 'Tokio, Kyoto y Osaka',
    dateStart: '2027-02-15',
    dateEnd: '2027-03-06',
    countdown: { state: 'upcoming', days: 11 }
  },
  itinerary: {
    total: 10,
    completed: 3,
    percent: 30,
    next: { title: 'Camino del Filósofo', location: 'Kyoto', dayDate: '2026-08-22', time: '08:00' }
  },
  weather: { temp: 28, description: 'parcialmente nublado', icon: '02d' },
  tasks: {
    pendingCount: 5,
    upcoming: [
      { id: 't1', title: 'Confirmar reserva en Ryokan Sakura', dueDate: '2026-08-14' },
      { id: 't2', title: 'Comprar Japan Rail Pass', dueDate: '2026-08-15' },
      { id: 't3', title: 'Reservar entradas en Gion', dueDate: '2026-08-16' },
      { id: 't4', title: 'Guardar mapas offline', dueDate: '2026-08-18' }
    ]
  },
  packing: { total: 12, packed: 6, pending: 6, percent: 50 },
  budget: { currency: 'CRC', budgetMinor: 115580, spentMinor: 38450, availableMinor: 77130, percentUsed: 33.27, recent: [] },
  reservations: { next: { title: 'Ryokan Sakura', location: 'Kyoto', startAt: '21 ago · 15:00', status: 'Confirmada' }, pendingCount: 0, missingDocuments: 0 },
  personalBalance: { netMinor: 0, toPayMinor: 0, toReceiveMinor: 0, currency: 'CRC' },
  importantAlerts: [],
  images: [
    { url: '/images/illustrations/generated/cities/kyoto-fushimi-inari-torii-sakura-day.jpg', name: 'Fushimi Inari' },
    { url: '/images/illustrations/generated/cities/osaka-dotonbori-neon-night.jpg', name: 'Noche en Osaka' },
    { url: '/images/illustrations/generated/cities/nara-todaiji-deer-garden-day.jpg', name: 'Un día en Nara' }
  ]
};

for (const width of widths) for (const theme of themes) {
  test(`dashboard home ${theme} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.addInitScript(({ selectedTheme }) => {
      sessionStorage.setItem('authenticated', 'true');
      localStorage.setItem('theme-preference', selectedTheme);
    }, { selectedTheme: theme });
    await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(async ({ selectedTheme, dashboardFixture }) => {
      document.querySelector('#appDashboard')?.classList.remove('hidden');
      document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
      document.documentElement.dataset.theme = selectedTheme;
      window.AuthHandler = { currentUser: { displayName: 'Noelia' } };
      const { renderTripDashboard } = await import('/js/features/dashboard/progressive-content.js');
      const home = document.querySelector('#content-home');
      home?.classList.remove('hidden');
      document.querySelectorAll('.tab-content:not(#content-home)').forEach((node) => node.classList.add('hidden'));
      const header = document.querySelector('#currentTripHeader');
      header.innerHTML = `<div id="dashboardTopSection" class="has-journey-home"><div id="dashboardProgressiveContent">${renderTripDashboard(dashboardFixture)}</div></div>`;
    }, { selectedTheme: theme, dashboardFixture: fixture });
    await page.addStyleTag({ content: '#appDashboard.hidden{display:block!important} body > .fixed:not(#mobile-bottom-nav){display:none!important}' });
    await expect(page.locator('.journey-home')).toBeVisible();
    await expect(page.locator('.journey-home .hero-moment')).toBeVisible();
    const scene = page.locator(`.hero-moment__art--${theme === 'dark' ? 'night' : 'day'}`);
    await expect(scene).toHaveCSS('opacity', '1');
    await page.locator('.hero-moment__art').evaluateAll(async images => {
      await Promise.all(images.map(image => image.decode()));
    });
    if (theme === 'dark') {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      const animation = await page.locator('.hero-moment__petal').first().evaluate(node => getComputedStyle(node, '::after').animationName);
      expect(animation).toBe('fireflyPulse');
      await page.emulateMedia({ reducedMotion: 'reduce' });
    }
    await expect(page.locator('.next-stop')).toContainText('Camino del Filósofo');
    await expect(page.locator('.journey-ticket__guide img')).toBeVisible();
    await expect(page.locator('.next-stop__dog')).toBeVisible();
    await expect(page.locator('.budget-receipt')).toContainText('disponibles');
    await page.evaluate(() => document.querySelectorAll('.memory-strip img').forEach((image) => { image.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.querySelectorAll('.memory-strip img')].every((image) => image.complete));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    const target = path.resolve('artifacts/dashboard-home', theme, `${width}.png`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    await page.screenshot({ path: target, fullPage: true, animations: 'disabled' });
    const layout = await page.evaluate(() => ['.japan-nav','#main-content','#content-home','#currentTripHeader','.journey-home','.journey-home__intro'].map(selector => {
      const node = document.querySelector(selector), style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return {selector,top:rect.top,height:rect.height,padding:style.padding,margin:style.margin,display:style.display};
    }));
    fs.writeFileSync(target.replace('.png','.json'),JSON.stringify(layout,null,2));
  });
}

test('empty home offers the next action and escapes trip names', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/dashboard.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(async dashboardFixture => {
    document.querySelector('#appDashboard')?.classList.remove('hidden');
    document.querySelector('#content-home')?.classList.remove('hidden');
    const { renderTripDashboard } = await import('/js/features/dashboard/progressive-content.js');
    const empty = structuredClone(dashboardFixture);
    empty.trip.name = '<img src=x onerror="window.injectionRan=true">';
    empty.itinerary = {total:0,completed:0,percent:0,next:null};
    empty.packing = {total:0,packed:0,pending:0,percent:0};
    empty.tasks = {pendingCount:2,upcoming:[]};
    empty.budget = {currency:'CRC',budgetMinor:0,spentMinor:0,availableMinor:0,percentUsed:0};
    document.querySelector('#currentTripHeader').innerHTML = `<div id="dashboardTopSection" class="has-journey-home"><div id="dashboardProgressiveContent">${renderTripDashboard(empty)}</div></div>`;
    window.DashboardApp = {switchTab:tab => { window.clickedTab = tab; }};
  },fixture);
  await expect(page.locator('.luggage-tag')).toContainText('Empieza tu lista');
  await expect(page.locator('.budget-receipt')).toContainText('Define un presupuesto');
  await expect(page.locator('.journey-note--tasks')).toContainText('Tienes tareas pendientes');
  await expect(page.locator('.hero-moment__headline img')).toHaveCount(0);
  expect(await page.evaluate(() => window.injectionRan)).toBeUndefined();
  await page.locator('.next-stop button').click();
  expect(await page.evaluate(() => window.clickedTab)).toBe('itinerary');
});
