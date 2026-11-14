import { test, expect } from '@playwright/test';
import fs from 'node:fs';

for (const width of [1440, 1024, 768, 390]) for (const theme of ['light', 'dark']) {
  test(`packing filtered actions and failed save ${theme} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/js/core/firebase-config.js*', route => route.fulfill({ contentType: 'application/javascript', body: `export const db={},auth={currentUser:{uid:'preview-user'}};` }));
    await page.route('**/js/features/trips/packing-list.js*', route => route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync('js/features/trips/packing-list.js', 'utf8').replace("'firebase/firestore'", "'/packing-test-store.js'") }));
    await page.route('**/packing-test-store.js', route => route.fulfill({ contentType: 'application/javascript', body: `
      export const collection=(_,path)=>path,doc=(_,path)=>path,serverTimestamp=()=>1,query=value=>value,orderBy=()=>null;
      export async function addDoc(){throw new Error('offline');} export const updateDoc=addDoc,deleteDoc=addDoc;
      export const getDocs=async()=>({empty:false}),getDoc=async()=>({exists:()=>false});
      export function onSnapshot(path,callback){queueMicrotask(()=>callback({docs:window.packingFixture.map(item=>({id:item.id,data:()=>item}))}));return ()=>{};}
      export function writeBatch(){const writes=[];return{set(){},update:(path,data)=>writes.push({path,data}),commit:async()=>{window.packingBulkWrites=writes;}};}
    ` }));
    await page.goto('/design-system', { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ url: '/css/app.css' });
    await page.evaluate(async theme => {
      document.documentElement.classList.toggle('dark', theme === 'dark'); document.documentElement.dataset.theme = theme;
      document.body.innerHTML = '<button id="packingTrigger">Abrir equipaje</button><p id="packingNotice" role="status"></p>';
      window.TripsManager = { currentTrip: { id: 'A' } };
      window.Notifications = { error: text => { document.querySelector('#packingNotice').textContent = text; } };
      window.packingFixture = [{ id: 'mine', name: 'Camiseta', category: 'Ropa', assignee: 'Ana', packed: false }, { id: 'other', name: 'Abrigo', category: 'Ropa', assignee: 'Luis', packed: false }];
      const { PackingList } = await import('/js/features/trips/packing-list.js');
      document.querySelector('#packingTrigger').onclick = () => PackingList.open({ create: true });
    }, theme);
    await page.locator('#packingTrigger').click();
    const dialog = page.getByRole('dialog', { name: 'Lista de equipaje' });
    await expect(dialog.locator('.checklist-row')).toHaveCount(2);
    await dialog.getByLabel('Responsable', { exact: true }).last().fill('Ana');
    await expect(dialog.locator('.checklist-row')).toHaveCount(1);
    await dialog.getByRole('button', { name: 'Empacar categoría' }).click();
    expect(await page.evaluate(() => window.packingBulkWrites.map(item => item.path))).toEqual(['trips/A/packingItems/mine']);
    await dialog.getByLabel('Nombre*', { exact: true }).fill('Artículo que debo conservar');
    await dialog.getByRole('button', { name: 'Guardar artículo' }).click();
    await expect(page.locator('#packingNotice')).toContainText('Tus datos siguen en el formulario');
    await expect(dialog.getByLabel('Nombre*', { exact: true })).toHaveValue('Artículo que debo conservar');
    await expect(dialog.getByRole('button', { name: 'Guardar artículo' })).toBeEnabled();
    expect(await dialog.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('#packingTrigger')).toBeFocused();
  });
}
