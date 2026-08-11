import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const widths = [1440, 1024, 768, 390];
const themes = ['light', 'dark'];

const trip = {
  id: 'visual-itinerary',
  name: 'Japón 2026',
  destination: 'Kyoto, Osaka y Tokio',
  dateStart: '2026-08-21',
  dateEnd: '2026-08-27',
  members: [{ name: 'Noelia' }, { name: 'David' }]
};

const itinerary = {
  days: [
    {
      day: 1,
      date: '2026-08-21',
      city: 'Kyoto',
      notes: 'Templos, jardines y tradición milenaria.',
      weather: { temperature: 28, condition: 'Soleado' },
      hotel: { name: 'Ryokan Sakura Kyoto' },
      activities: [
        { id: 'a1', time: '07:30', title: '% Arabica Kyoto', category: 'Comida', area: 'Higashiyama', duration: 60, cost: 600, description: 'Café junto al río para comenzar el día con calma.', location: { lat: 34.995, lng: 135.771 } },
        { id: 'a2', time: '10:00', title: 'Templo Kiyomizu-dera', category: 'Cultura', area: 'Higashiyama', duration: 120, cost: 400, description: 'Vistas panorámicas y senderos entre arces.', location: { lat: 34.9949, lng: 135.785 } },
        { id: 'a3', time: '12:30', title: 'Almuerzo en Nishiki Market', category: 'Comida', area: 'Centro de Kyoto', duration: 75, cost: 1500, description: 'Prueba takoyaki, sushi y snacks locales.', location: { lat: 35.005, lng: 135.764 } },
        { id: 'a4', time: '15:00', title: 'Paseo por Gion', category: 'Cultura', area: 'Gion', duration: 90, cost: 0, description: 'Calles tradicionales y casas de té.', location: { lat: 35.003, lng: 135.775 } },
        { id: 'a5', time: '17:30', title: 'Santuario Yasaka', category: 'Cultura', area: 'Gion', duration: 60, cost: 400, description: 'El santuario iluminado al atardecer.', location: { lat: 35.004, lng: 135.778 } }
      ]
    },
    { day: 2, date: '2026-08-22', city: 'Kyoto', activities: [{ id: 'b1', time: '08:00', title: 'Camino del Filósofo', category: 'Naturaleza', duration: 90, cost: 0 }] },
    { day: 3, date: '2026-08-23', city: 'Osaka', activities: [{ id: 'c1', time: '10:00', title: 'Castillo de Osaka', category: 'Cultura', duration: 120, cost: 600 }] },
    { day: 4, date: '2026-08-24', city: 'Osaka', activities: [{ id: 'd1', time: '18:00', title: 'Dotonbori', category: 'Comida', duration: 120, cost: 2200 }] },
    { day: 5, date: '2026-08-25', city: 'Tokio', activities: [{ id: 'e1', time: '11:00', title: 'Asakusa', category: 'Cultura', duration: 150, cost: 500 }] }
  ]
};

for (const width of widths) for (const theme of themes) {
  test(`itinerary page ${theme} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.addInitScript(({ selectedTheme }) => {
      sessionStorage.setItem('authenticated', 'true');
      localStorage.setItem('theme-preference', selectedTheme);
    }, { selectedTheme: theme });
    await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(async ({ selectedTheme, itineraryFixture, tripFixture }) => {
      document.querySelector('#appDashboard')?.classList.remove('hidden');
      document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
      document.documentElement.dataset.theme = selectedTheme;
      document.querySelector('#currentTripHeader')?.classList.add('hidden');
      document.querySelectorAll('.tab-content').forEach(node => node.classList.add('hidden'));
      document.querySelector('#content-itinerary')?.classList.remove('hidden');
      const { ItineraryHandler } = await import('/js/features/itinerary/itinerary-v3.js');
      await ItineraryHandler.preview(itineraryFixture, { day: 1, trip: tripFixture });
    }, { selectedTheme: theme, itineraryFixture: itinerary, tripFixture: trip });
    await page.addStyleTag({ content: '#appDashboard.hidden{display:block!important} body > .fixed:not(#mobile-bottom-nav){display:none!important}' });
    await expect(page.locator('.itinerary-page-shell')).toBeVisible();
    await expect(page.locator('.day-ticket--active')).toContainText('Día 1');
    await expect(page.locator('.activity-card')).toHaveCount(5);
    await expect(page.locator('.activity-card').first()).toContainText('% Arabica Kyoto');
    await expect(page.locator('.jp-trip-dog')).toBeVisible();
    await expect(page.locator('.activity-card__location').first()).not.toContainText('[object Object]');
    if (width === 1440 && theme === 'light') {
      const more = page.locator('.activity-more').first();
      await more.locator('summary').click();
      await expect(more.locator('.activity-more__menu')).toBeVisible();
      await expect(more.locator('.activity-more__menu button')).toHaveCount(5);
      await more.locator('summary').click();
      const quickEdit = page.locator('.activity-quick-edit').first();
      await quickEdit.locator('summary').click();
      await expect(quickEdit.locator('.activity-quick-edit__form')).toBeVisible();
      await expect(quickEdit.locator('input')).toHaveCount(5);
      await quickEdit.locator('summary').click();
      await expect(page.locator('.activity-card').first()).toContainText('07:30–08:30');
      await expect(page.locator('.activity-card__location button').first()).toHaveText('Ver mapa');
      const mapFocus = await page.evaluate(() => {
        window.DashboardApp = { switchTab: () => {} };
        window.ItineraryHandler.openActivityMap('a1', 1);
        return {
          focus: JSON.parse(sessionStorage.getItem('japitin-map-focus')),
          day: sessionStorage.getItem('japitin_map_day')
        };
      });
      expect(mapFocus.focus).toMatchObject({ activityId: 'a1', day: 1, title: '% Arabica Kyoto' });
      expect(mapFocus.focus.location).toMatchObject({ lat: 34.995, lng: 135.771 });
      expect(mapFocus.day).toBe('1');
      const companionCorners = await page.evaluate(async () => {
        const paths = [
          '/images/illustrations/generated/companions/cat-guide.png',
          '/images/illustrations/generated/companions/dog-explorer.png'
        ];
        return Promise.all(paths.map(src => new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            const points = [[0, 0], [canvas.width - 1, 0], [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]];
            resolve(points.map(([x, y]) => context.getImageData(x, y, 1, 1).data[3]));
          };
          image.onerror = reject;
          image.src = src;
        })));
      });
      expect(companionCorners).toEqual([[0, 0, 0, 0], [0, 0, 0, 0]]);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    const target = path.resolve('artifacts/itinerary-page', theme, `${width}.png`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    await page.screenshot({ path: target, fullPage: true, animations: 'disabled' });
  });
}

test('itinerary conflicts expose deterministic schedule actions', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.addInitScript(() => {
    sessionStorage.setItem('authenticated', 'true');
    localStorage.setItem('theme-preference', 'light');
  });
  await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
  const conflictingItinerary = structuredClone(itinerary);
  conflictingItinerary.days[0].activities[1].time = '08:00';
  conflictingItinerary.days[0].activities[1].travelTimeMinutes = 45;
  await page.evaluate(async ({ itineraryFixture, tripFixture }) => {
    document.querySelector('#appDashboard')?.classList.remove('hidden');
    document.querySelector('#currentTripHeader')?.classList.add('hidden');
    document.querySelectorAll('.tab-content').forEach(node => node.classList.add('hidden'));
    document.querySelector('#content-itinerary')?.classList.remove('hidden');
    const { ItineraryHandler } = await import('/js/features/itinerary/itinerary-v3.js');
    await ItineraryHandler.preview(itineraryFixture, { day: 1, trip: tripFixture });
  }, { itineraryFixture: conflictingItinerary, tripFixture: trip });
  await page.addStyleTag({ content: '#appDashboard.hidden{display:block!important} body > .fixed:not(#mobile-bottom-nav){display:none!important}' });

  const conflict = page.locator('.itinerary-conflict').first();
  await expect(conflict).toBeVisible();
  await expect(conflict.locator('.itinerary-conflict__actions button')).toHaveCount(3);
  await expect(conflict.locator('.itinerary-conflict__actions')).toContainText(/Mover al siguiente espacio|Aumentar margen de traslado/);
});
