import { test, expect } from './fixtures.mjs';
import fs from 'node:fs';
for (const width of [1440, 1024, 768, 390]) for (const theme of ['light', 'dark']) {
  test(`city selection and independent days ${theme} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.route('**/wizard-regression-preview', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><link rel="stylesheet" href="/css/tokens.css"><link rel="stylesheet" href="/css/city-route-map.css"></head><body><main style="max-width:720px;margin:auto"><div id="map"></div><div id="days"></div></main></body></html>' }));
    await page.goto('/wizard-regression-preview');
    await page.evaluate(async theme => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.body.style.background = 'var(--background)';
      document.body.style.color = 'var(--text-primary)';
      const { CityRouteMap } = await import('/js/features/itinerary/city-route-map.js');
      const { DayAllocationBar } = await import('/js/features/itinerary/day-allocation-bar.js');
      const data = { totalDays: 10, cities: ['Tokyo', 'Kyoto', 'Nara'], cityStops: [{ city: 'Tokyo', days: 5 }, { city: 'Kyoto', days: 4 }, { city: 'Nara', days: 1, isDayTrip: true }] };
      window.SmartGeneratorWizard = { wizardData: data, saveToSessionStorage() {}, cityLabel: key => key.charAt(0).toUpperCase() + key.slice(1), toggleCityFromMap(key) { this.lastCity = key; } };
      document.querySelector('#map').innerHTML = CityRouteMap.render(data);
      document.querySelector('#days').innerHTML = DayAllocationBar.render(data.cityStops, data.totalDays);
    }, theme);
    await expect(page.locator('.city-route-land')).toHaveAttribute('d', /^M/);
    await expect(page.locator('.city-hotspot')).toHaveCount(19);
    await page.locator('[data-city-hotspot="tokyo"]').click();
    expect(await page.evaluate(() => window.SmartGeneratorWizard.lastCity)).toBe('tokyo');
    await page.locator('.day-stop-control-row').last().getByRole('button', { name: 'Agregar un d' }).click();
    await expect(page.locator('.day-stop-control-row').last().getByRole('button', { name: 'Agregar un d' })).toBeFocused();
    expect(await page.evaluate(() => window.SmartGeneratorWizard.wizardData.cityStops.map(s => s.days))).toEqual([5, 4, 2]);
    await expect(page.locator('.day-allocation-help')).toContainText('Quita 1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    fs.mkdirSync('artifacts/wizard-fixes', { recursive: true });
    await page.screenshot({ path: `artifacts/wizard-fixes/${theme}-${width}.png`, fullPage: true });
  });
}
