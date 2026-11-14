import { test, expect } from '@playwright/test';
import fs from 'node:fs';

for (const width of [1440, 1024, 768, 390]) for (const theme of ['light', 'dark']) {
  test(`reservation search and save recovery ${theme} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/js/core/firebase-config.js*', route => route.fulfill({ contentType: 'application/javascript', body: `export const db={},auth={currentUser:{uid:'preview-user'}};` }));
    await page.route('**/js/features/trips/reservations-manager.js*', route => {
      const source = fs.readFileSync('js/features/trips/reservations-manager.js', 'utf8').replace("'firebase/firestore'", "'/reservation-test-store.js'");
      return route.fulfill({ contentType: 'application/javascript', body: source });
    });
    await page.route('**/reservation-test-store.js', route => route.fulfill({ contentType: 'application/javascript', body: `
      export const collection=(_,path)=>path,doc=(_,path)=>path,serverTimestamp=()=>1;
      export async function addDoc(path,data){window.reservationWrites=(window.reservationWrites||0)+1;throw new Error('connection unavailable');}
      export async function updateDoc(){throw new Error('connection unavailable');}
      export const deleteDoc=updateDoc,setDoc=updateDoc,writeBatch=()=>({commit:updateDoc}),getDocs=async()=>({docs:[],empty:false}),getDoc=async()=>({exists:()=>false}),query=value=>value,orderBy=()=>null,onSnapshot=()=>()=>{};
    ` }));
    await page.goto('/design-system', { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ url: '/css/app.css' });
    await page.evaluate(async theme => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.dataset.theme = theme;
      document.body.innerHTML = '<div id="reservationsContent"></div>';
      window.TripsManager = { currentTrip: { id: 'A' } };
      const { ReservationsManager } = await import('/js/features/trips/reservations-manager.js');
      ReservationsManager.currentTrip = 'A';
      ReservationsManager.reservations = [{ id: 'r1', title: 'Ryokan Sakura', provider: 'Kyoto', type: 'Hospedaje', status: 'Confirmada', startAt: '2027-02-21T15:00', confirmationCode: 'ABC12345' }];
      ReservationsManager.render();
    }, theme);
    const search = page.getByRole('textbox', { name: 'Buscar', exact: true });
    await search.pressSequentially('Ryokan', { delay: 15 });
    await expect(search).toHaveValue('Ryokan');
    await expect(search).toBeFocused();
    await expect(page.locator('.reservation-row')).toHaveCount(1);
    await page.getByRole('button', { name: /Agregar reservación/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Nueva reservación' });
    await dialog.getByLabel('Título*', { exact: true }).fill('Reserva que debo conservar');
    await dialog.getByLabel('Inicio*', { exact: true }).fill('2027-02-21T15:00');
    await expect(dialog.getByLabel('Contacto', { exact: true })).toHaveCount(1);
    await dialog.getByRole('button', { name: 'Guardar reservación' }).click();
    await expect(dialog.locator('[data-error]')).toContainText('Tus datos siguen en el formulario');
    await expect(dialog.getByLabel('Título*', { exact: true })).toHaveValue('Reserva que debo conservar');
    await expect(dialog.getByRole('button', { name: 'Guardar reservación' })).toBeEnabled();
    expect(await page.evaluate(() => window.reservationWrites)).toBe(1);
    expect(await dialog.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2);
    fs.mkdirSync(`artifacts/reservation-repairs/${theme}`, { recursive: true });
    await page.screenshot({ path: `artifacts/reservation-repairs/${theme}/${width}.png`, animations: 'disabled' });
  });
}
