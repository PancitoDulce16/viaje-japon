import {test,expect} from '@playwright/test';
import fs from 'node:fs';

for(const width of [390,1440])for(const theme of ['light','dark']){
  test(`chat journal gallery ${width} ${theme}`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.route('**/js/core/firebase-config.js*',route=>route.fulfill({contentType:'application/javascript',body:`export const db={},storage={},auth={currentUser:{uid:'preview',email:null,displayName:'Ana'}};`}));
    for(const path of ['journal/gallery-state','journal/photo-gallery','journal/journal-state','social/chat-conversions','social/group-chat'])await page.route(`**/js/features/${path}.js*`,route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync(`js/features/${path}.js`,'utf8').replaceAll("'firebase/firestore'","'/story-test-store.js'").replaceAll("'firebase/storage'","'/story-test-store.js'")}));
    await page.route('**/story-test-store.js',route=>route.fulfill({contentType:'application/javascript',body:`
      export const collection=(_, ...parts)=>parts.join('/'),doc=collection,query=value=>value,orderBy=()=>null,where=()=>null,limit=()=>null,serverTimestamp=()=>1;
      const snapshot=path=>({exists:()=>Boolean(window.storyRecords[path]),data:()=>structuredClone(window.storyRecords[path]),id:path.split('/').at(-1)});
      const listing=path=>{const docs=Object.keys(window.storyRecords).filter(key=>key.startsWith(path+'/')).map(snapshot);return{docs,forEach:callback=>docs.forEach(callback)};};
      export const getDoc=async path=>snapshot(path),getDocFromServer=getDoc,getDocs=async path=>listing(path);
      export const onSnapshot=(path,callback,error)=>{queueMicrotask(()=>callback(listing(path)));return()=>{};};
      export async function setDoc(path,data){if(window.storyFail)throw new Error('offline');window.storyRecords[path]=structuredClone(data);}
      export async function updateDoc(path,data){if(window.storyFail)throw new Error('offline');const row=window.storyRecords[path];for(const [key,value]of Object.entries(data)){if(value?.op==='union')row[key]=[...(row[key]||[]),...value.rows];else if(value?.op==='remove')row[key]=(row[key]||[]).filter(item=>!value.rows.includes(item));else row[key]=value;}}
      export const deleteDoc=async path=>delete window.storyRecords[path],addDoc=async()=>({id:'unused'});
      export const arrayUnion=(...rows)=>({op:'union',rows}),arrayRemove=(...rows)=>({op:'remove',rows});
      export async function runTransaction(_,callback){if(window.storyFail)throw new Error('offline');return callback({get:getDoc,set:setDoc,update:updateDoc});}
      export const ref=(_,path)=>path,uploadBytes=async()=>{},getDownloadURL=async()=>'/images/illustrations/generated/food/tonkotsu-ramen.webp',deleteObject=async()=>{};
    `}));
    await page.goto('/design-system',{waitUntil:'domcontentloaded'});
    await page.locator('link[href*="design-system-lab"]').evaluateAll(nodes=>nodes.forEach(node=>node.remove()));
    await page.addStyleTag({url:'/css/tailwind.min.css'});await page.addStyleTag({url:'/css/app.css'});
    await page.evaluate(async theme=>{
      document.documentElement.classList.toggle('dark',theme==='dark');document.documentElement.dataset.theme=theme;
      document.body.innerHTML='<p id="storyNotice" role="status"></p><main id="main-content"></main><section id="photoHost"></section>';
      window.storyRecords={};window.TripsManager={currentTrip:{id:'A'}};
      window.Notifications={error:text=>document.querySelector('#storyNotice').textContent=text,show:text=>document.querySelector('#storyNotice').textContent=text};
      await import('/js/features/journal/travel-journal.js');await window.TravelJournal.show();window.TravelJournal.showEntryModal();
    },theme);
    const journal=page.locator('.journal-modal-overlay');
    await journal.getByLabel('Título',{exact:true}).fill('Mi recuerdo');await journal.getByLabel('Contenido',{exact:true}).fill('Texto que debo conservar');
    await page.evaluate(()=>window.storyFail=true);
    await journal.getByRole('button',{name:'Crear Entrada'}).click();
    await expect(page.locator('#storyNotice')).toContainText('Tu texto sigue');
    await expect(journal.getByLabel('Contenido',{exact:true})).toHaveValue('Texto que debo conservar');
    await expect(journal.getByRole('button',{name:'Crear Entrada'})).toBeEnabled();
    await page.screenshot({path:`artifacts/story-journal-${width}-${theme}.png`});
    await page.evaluate(()=>window.storyFail=false);await journal.getByRole('button',{name:'Crear Entrada'}).click();await expect(journal).toHaveCount(0);
    await expect(page.locator('.entry-title')).toContainText('Mi recuerdo');
    await page.locator('.edit-entry-btn').click();await expect(journal.getByLabel('Título',{exact:true})).toHaveValue('Mi recuerdo');await page.keyboard.press('Escape');await expect(journal).toHaveCount(0);
    await page.evaluate(async()=>{
      const {PhotoGallery}=await import('/js/features/journal/photo-gallery.js');window.storyGallery=PhotoGallery;
      document.querySelector('#photoHost').innerHTML=PhotoGallery.render();
      window.storyPhotoId=`photo'\"<bad>`;
      window.storyRecords['trips/A/photos/'+window.storyPhotoId]={photoURL:'/images/illustrations/generated/food/tonkotsu-ramen.webp',userId:'preview',userName:'<img src=x onerror=alert(1)>',caption:'<svg onload=alert(1)>',likes:[],comments:[{id:'comment1',userId:'other',userName:'<img>',text:'<script>alert(1)</script>'}]};
      await PhotoGallery.loadGallery();
    });
    await page.locator('[data-gallery-open]').click();
    const detail=page.locator('#photoDetailModal');await expect(detail).toBeVisible();
    await expect(detail.locator('svg,script')).toHaveCount(0);await expect(detail.locator('img')).toHaveCount(1);
    await expect(detail).toContainText('<script>alert(1)</script>');
    await detail.getByLabel('Comentario',{exact:true}).fill('Mi comentario');await page.evaluate(()=>window.storyFail=true);
    await detail.getByRole('button',{name:'Enviar',exact:true}).click();await expect(detail.getByLabel('Comentario',{exact:true})).toHaveValue('Mi comentario');
    await page.evaluate(()=>window.storyFail=false);await detail.getByRole('button',{name:'Enviar',exact:true}).click();
    await expect(detail).toContainText('Mi comentario');
    expect(await page.evaluate(()=>window.storyRecords['trips/A/photos/'+window.storyPhotoId].comments.length)).toBe(2);
    expect(await detail.evaluate(node=>node.scrollWidth-node.clientWidth)).toBeLessThanOrEqual(2);
    const send=await detail.locator('[data-gallery-send]').boundingBox(),field=await detail.getByLabel('Comentario',{exact:true}).boundingBox();
    expect(send.x+send.width).toBeLessThanOrEqual(width);expect(send.x).toBeGreaterThanOrEqual(field.x+field.width);
    await page.screenshot({path:`artifacts/story-gallery-${width}-${theme}.png`});
    await page.keyboard.press('Escape');await expect(detail).toBeHidden();
    // The actual chat dialog must display markup literally, then persist one exact expense.
    await page.evaluate(async()=>{await import('/js/ui/dialogs-v2.js');const {GroupChat}=await import('/js/features/social/group-chat.js');window.BudgetTracker={baseCurrency:'USD'};GroupChat.messages=[{id:'m1',message:'<img src=x onerror=alert(1)>'}];window.conversionResult=GroupChat.convertMessage('m1','expense');});
    await expect(page.locator('#customDialog img')).toHaveCount(0);await page.locator('#dialogInput').fill('2,50');await page.locator('#dialogOkBtn').click();
    await expect.poll(()=>page.evaluate(()=>window.storyRecords['trips/A/expenses/chat_m1']?.amountMinor)).toBe(250);
  });
}
