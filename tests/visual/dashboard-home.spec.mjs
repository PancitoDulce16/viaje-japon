import { test, expect } from './fixtures.mjs';
import fs from 'node:fs';
import path from 'node:path';

const widths = [1440, 1024, 768, 390];
const themes = ['light', 'dark'];

const fixture = {
  trip: {
    id: 'trip-dashboard-test',
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
    next: { id: 'walk', dayNumber: 4, title: 'Camino del Filósofo', city: 'Kyoto', dayDate: '2026-08-22', time: '8:00', coordinates: { lat: 35.026, lng: 135.794 } }
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
  reservations: { next: { id: 'ryokan-1', title: 'Ryokan Sakura', location: 'Kyoto', startAt: '2027-02-21T15:00', status: 'Confirmada', requiresDocument: true, documentCount: 0 }, pendingCount: 0, missingDocuments: 0 },
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
    if (width === 390) {
      const hero = await page.locator('.hero-moment--compact').boundingBox();
      expect(hero.height).toBeLessThan(300);
    }
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

for (const outcome of ['saved', 'failed']) {
  test(`dashboard task completion ${outcome}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(async data => {
      const { TravelTasks } = await import('/js/features/trips/travel-tasks.js');
      const { renderTripDashboard } = await import('/js/features/dashboard/progressive-content.js');
      document.querySelector('#currentTripHeader').innerHTML = `<div id="dashboardTopSection" class="has-journey-home"><div id="dashboardProgressiveContent">${renderTripDashboard(data)}</div></div>`;
      TravelTasks.setCompleted = (id, completed, tripId) => {
        window.taskWrite = { id, completed, tripId };
        return new Promise((resolve, reject) => { window.confirmTaskWrite = resolve; window.rejectTaskWrite = reject; });
      };
      window.TripsManager = { loadDashboardProgressiveContent: () => { window.taskRefreshCount = (window.taskRefreshCount || 0) + 1; } };
    }, fixture);
    const row = page.locator('.dashboard-task').first();
    const checkbox = row.getByRole('checkbox');
    await checkbox.check();
    await expect(checkbox).toBeDisabled();
    await expect(row.getByRole('status')).toContainText('Guardando');
    expect(await page.evaluate(() => window.taskWrite)).toEqual({ id: 't1', completed: true, tripId: 'trip-dashboard-test' });
    await page.evaluate(outcome => {
      if (outcome === 'saved') window.confirmTaskWrite();
      else window.rejectTaskWrite(new Error('permission denied'));
    }, outcome);
    await expect(checkbox).toBeEnabled();
    if (outcome === 'saved') {
      await expect(checkbox).toBeChecked();
      await expect(row.getByRole('status')).toContainText('Tarea completada');
      expect(await page.evaluate(() => window.taskRefreshCount)).toBe(1);
    } else {
      await expect(checkbox).not.toBeChecked();
      await expect(row.getByRole('status')).toContainText('No se pudo guardar');
      expect(await page.evaluate(() => window.taskRefreshCount || 0)).toBe(0);
    }
  });
}

test('reservation editor supports keyboard navigation and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ReservationsManager);
  await page.evaluate(() => {
    const trigger = document.createElement('button');
    trigger.id = 'reservationTestTrigger';
    trigger.textContent = 'Abrir reservación';
    document.body.append(trigger);
    trigger.focus();
    window.ReservationsManager.showReservationModal({ title: 'Ryokan Sakura', type: 'Hospedaje', status: 'Confirmada', startAt: '2027-02-21T15:00', provider: 'Ryokan', details: {} });
  });
  const dialog = page.getByRole('dialog', { name: 'Editar reservación' });
  const close = dialog.getByRole('button', { name: 'Cerrar', exact: true });
  await expect(close).toBeFocused();
  await expect(dialog.getByLabel('Proveedor', { exact: true })).toHaveValue('Ryokan');
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Guardar reservación' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('#reservationTestTrigger')).toBeFocused();
});

test('reservation shortcuts keep the reservation context', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ReservationsManager && window.TripDocuments);
  await page.evaluate(async data => {
    const { renderTripDashboard } = await import('/js/features/dashboard/progressive-content.js');
    document.querySelector('#currentTripHeader').innerHTML = `<div id="dashboardTopSection" class="has-journey-home"><div id="dashboardProgressiveContent">${renderTripDashboard(data)}</div></div>`;
    window.ReservationsManager.openReservation = id => { window.reservationOpened = id; };
    window.TripDocuments.open = context => { window.documentContext = context; };
  }, fixture);
  const ticket = page.locator('.reservation-ticket');
  await expect(ticket.locator('time')).toHaveAttribute('datetime', '2027-02-21T15:00');
  await expect(ticket.locator('time')).toContainText('15:00');
  await expect(ticket).toContainText('Falta adjuntar el documento requerido');
  await ticket.getByRole('button', { name: 'Ver reserva', exact: true }).click();
  expect(await page.evaluate(() => window.reservationOpened)).toBe('ryokan-1');
  await ticket.getByRole('button', { name: 'Adjuntar documento' }).click();
  expect(await page.evaluate(() => window.documentContext)).toEqual({ reservationId: 'ryokan-1' });
});

test('next stop selects its day and coordinates on the map', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async data => {
    const { renderTripDashboard } = await import('/js/features/dashboard/progressive-content.js');
    document.querySelector('#currentTripHeader').innerHTML = `<div id="dashboardTopSection" class="has-journey-home"><div id="dashboardProgressiveContent">${renderTripDashboard(data)}</div></div>`;
    window.DashboardApp = { switchTab: tab => { window.nextStopTab = tab; } };
  }, fixture);
  await expect(page.locator('.next-stop time')).toContainText('08:00');
  await expect(page.locator('.next-stop time')).toHaveAttribute('datetime', '2026-08-22T08:00');
  await expect(page.locator('.next-stop__copy')).toContainText('Kyoto');
  const directions = page.getByRole('link', { name: /Cómo llegar/ });
  const destination = new URL(await directions.getAttribute('href')).searchParams.get('destination');
  expect(destination).toBe('35.026,135.794');
  await page.locator('.next-stop button').click();
  expect(await page.evaluate(() => window.nextStopTab)).toBe('map');
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('japitin-map-focus')))).toMatchObject({ day: 4, activityId: 'walk', coordinates: { lat: 35.026, lng: 135.794 } });
  await page.evaluate(async () => {
    const { MapHandler } = await import('/js/map/map.js');
    MapHandler.addItineraryMarkers = () => {};
    MapHandler.focusOnActivity = (lat, lng) => { window.nextStopCoordinates = [lat, lng]; };
    MapHandler.syncWithItinerary();
    window.nextStopDay = MapHandler.selectedDay;
  });
  expect(await page.evaluate(() => window.nextStopDay)).toBe('4');
  await expect.poll(() => page.evaluate(() => window.nextStopCoordinates)).toEqual([35.026, 135.794]);
  expect(await page.evaluate(() => sessionStorage.getItem('japitin-map-focus'))).toBeNull();
});

for (const scenario of ['task', 'traveling', 'finished']) {
  test(`guide opens the next action: ${scenario}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(async ({ dashboardFixture, scenario }) => {
      document.querySelector('#appDashboard')?.classList.remove('hidden');
      const data = structuredClone(dashboardFixture);
      data.trip.dateStart = scenario === 'task' ? '2099-01-01' : '2000-01-01';
      data.trip.dateEnd = scenario === 'finished' ? '2000-01-02' : '2099-01-02';
      data.tasks.upcoming = scenario === 'task' ? [{ id: 'late', title: '<img src=x onerror=alert(1)>', dueDate: '2000-01-01' }] : [];
      data.reservations = {};
      data.packing.pending = 0;
      data.budget.percentUsed = 0;
      const { renderTripDashboard } = await import('/js/features/dashboard/progressive-content.js');
      document.querySelector('#currentTripHeader').innerHTML = `<div id="dashboardTopSection" class="has-journey-home"><div id="dashboardProgressiveContent">${renderTripDashboard(data)}</div></div>`;
      window.TravelTasks = { open: () => { window.guideDestination = 'tasks'; } };
      window.DashboardApp = { switchTab: tab => { window.guideDestination = tab; } };
    }, { dashboardFixture: fixture, scenario });
    await expect(page.locator('.journey-ticket__advice img')).toHaveCount(0);
    if (scenario === 'finished') {
      await expect(page.locator('.journey-home__intro')).toContainText('recuerdos');
      await expect(page.locator('.journey-ticket__advice')).not.toContainText('vencida');
    }
    await page.locator('.journey-ticket__action').click();
    if (scenario === 'finished') {
      await expect(page.getByRole('heading', { name: /Mi Diario de Viaje/ })).toBeVisible();
    } else {
      expect(await page.evaluate(() => window.guideDestination)).toBe({ task: 'tasks', traveling: 'map' }[scenario]);
    }
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
