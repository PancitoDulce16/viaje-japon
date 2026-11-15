import {test,expect} from '@playwright/test';
import fs from 'node:fs';

for(const width of [390,1440])for(const theme of ['light','dark']){
  test(`shopping, preparation and favorites repairs ${width} ${theme}`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.route('**/js/core/firebase-config.js*',route=>route.fulfill({contentType:'application/javascript',body:`export const db={},auth={currentUser:{uid:'preview',email:'ana@example.test'}};`}));
    for(const file of ['shopping-state','preparation','preparation-state','favorites-manager'])await page.route(`**/js/features/trips/${file}.js*`,route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync(`js/features/trips/${file}.js`,'utf8').replaceAll("'firebase/firestore'","'/repair-store.js'")}));
    await page.route('**/js/features/itinerary/favorite-insertion.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('js/features/itinerary/favorite-insertion.js','utf8').replaceAll("'firebase/firestore'","'/repair-store.js'")}));
    await page.route('**/repair-store.js',route=>route.fulfill({contentType:'application/javascript',body:`
      export const doc=(_, ...parts)=>parts.join('/'),setDoc=async()=>{},getDoc=async path=>({exists:()=>Boolean(window.repairDocs[path]),data:()=>structuredClone(window.repairDocs[path])});
      export const onSnapshot=(path,callback)=>{queueMicrotask(async()=>callback(await getDoc(path)));return()=>{};};
      export async function runTransaction(_,callback){if(window.repairFail)throw new Error('offline');let pending;const result=await callback({get:getDoc,set:(path,data)=>{pending={path,data};},update:(path,data)=>{pending={path,data:{...window.repairDocs[path],...data}};}});if(pending)window.repairDocs[pending.path]=pending.data;return result;}
    `}));
    await page.goto('/design-system',{waitUntil:'domcontentloaded'});
    await page.locator('link[href*="design-system-lab"]').evaluateAll(nodes=>nodes.forEach(node=>node.remove()));
    await page.addStyleTag({url:'/css/tailwind.min.css'});
    await page.addStyleTag({url:'/css/app.css'});
    await page.evaluate(async theme=>{
      document.documentElement.classList.toggle('dark',theme==='dark');document.documentElement.dataset.theme=theme;
      document.body.innerHTML='<p id="notice" role="status"></p><div id="content-preparation"></div><div id="favoritesListContainer"></div>';
      window.TripsManager={currentTrip:{id:'A',memberEmails:['ana@example.test','luis@example.test']}};
      window.Notifications={show:text=>document.querySelector('#notice').textContent=text,error:text=>document.querySelector('#notice').textContent=text,success:text=>document.querySelector('#notice').textContent=text};
      window.repairDocs={'trips/A/data/shopping':{items:[{id:`quote'\"<img>`,name:'<img src=x onerror="window.injected=true">',category:'other',quantity:3,estimatedPrice:100,priority:null,notes:'<script>bad()</script>',status:'pending'}]}};
      const {ShoppingTracker}=await import('/js/features/trips/shopping-tracker.js');await ShoppingTracker.init('A');ShoppingTracker.open();
    },theme);
    const main=page.locator('#shoppingTrackerModal');
    await expect(main.locator('img,script')).toHaveCount(0);
    await main.getByRole('button',{name:'Editar'}).click();
    const form=page.locator('#addItemForm');
    await expect(form.locator('#itemQuantity')).toHaveValue('3');
    await form.locator('#itemName').fill('Recuerdo');
    await page.evaluate(()=>window.repairFail=true);
    await form.getByRole('button',{name:'Guardar cambios'}).click();
    await expect(form.locator('#itemName')).toHaveValue('Recuerdo');
    await expect(form.getByRole('button',{name:'Guardar cambios'})).toBeEnabled();
    expect(await form.evaluate(node=>node.scrollWidth-node.clientWidth)).toBeLessThanOrEqual(2);
    await page.screenshot({path:`artifacts/repair-shopping-${width}-${theme}.png`});
    await page.evaluate(()=>window.repairFail=false);
    await form.getByRole('button',{name:'Guardar cambios'}).click();await expect(form).toHaveCount(0);
    await main.getByRole('button',{name:'Comprado',exact:false}).click();
    await page.locator('#actualPrice').fill('0');await page.locator('[data-confirm-purchase]').click();
    await expect(page.locator('#purchaseDialog')).toHaveCount(0);await expect(main).toContainText('Real:');
    expect(await page.evaluate(()=>window.repairDocs['trips/A/data/shopping'].items[0].actualPrice)).toBe(0);
    await page.keyboard.press('Escape');await expect(main).toHaveCount(0);
    await page.evaluate(async()=>{
      const {PreparationHandler}=await import('/js/features/trips/preparation.js');PreparationHandler.init();
      const {FavoritesManager}=await import('/js/features/trips/favorites-manager.js');
      FavoritesManager.favorites=[{id:`bad'\"`,name:'<img src=x onerror=alert(1)>',city:'__proto__',description:'<script>bad()</script>',icon:'<img>',category:'<svg>',lat:0,lng:0}];FavoritesManager.renderFavoritesList();
    });
    await page.getByRole('button',{name:'Documentos'}).click();
    await expect(page.locator('.category-content[data-category="documents"]')).toBeVisible();
    await expect(page.locator('#favoritesListContainer img,#favoritesListContainer script,#favoritesListContainer svg')).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Ver en mapa'})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
    await page.screenshot({path:`artifacts/repair-preparation-${width}-${theme}.png`,fullPage:true});
    await page.evaluate(async()=>{
      await import('/js/ui/dialogs-v2.js');const {insertFavorite}=await import('/js/features/itinerary/favorite-insertion.js');
      const itinerary={days:[{day:1,activities:[]},{day:2,activities:[{id:'shared',title:'Ya guardado'}]}]};window.repairDocs['trips/A/data/itinerary']=itinerary;
      window.ItineraryHandler={currentItinerary:itinerary,__getCurrentDay:()=>2,addFavoriteToItinerary:async(favorite,scope)=>{await insertFavorite(favorite,scope);return true;}};
      window.repairFail=true;
    });
    await page.getByRole('button',{name:'Agregar al itinerario',exact:true}).click();await page.locator('#dialogInput').fill('2');await page.locator('#dialogOkBtn').click();
    await expect(page.locator('#notice')).toContainText('offline');
    expect(await page.evaluate(()=>window.repairDocs['trips/A/data/itinerary'].days[1].activities.length)).toBe(1);
    await page.evaluate(()=>window.repairFail=false);
    await page.getByRole('button',{name:'Agregar al itinerario',exact:true}).click();await page.locator('#dialogInput').fill('2');await page.locator('#dialogOkBtn').click();
    await expect(page.locator('#notice')).toContainText('Lugar guardado');
    expect(await page.evaluate(()=>window.repairDocs['trips/A/data/itinerary'].days.map(day=>day.activities.length))).toEqual([0,2]);
  });
}
