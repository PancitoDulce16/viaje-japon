import {test,expect} from './fixtures.mjs';
import fs from 'node:fs';
for(const width of [390,1440])for(const theme of ['light','dark']){
  test(`backup download and safe import ${theme} ${width}`,async({page})=>{
    await page.setViewportSize({width,height:900});
    const source=fs.readFileSync('js/features/trips/backup-service.js','utf8').replace(/^import .*;\r?\n/gm,'');
    await page.route('**/js/features/trips/backup-service.js*',route=>route.fulfill({contentType:'application/javascript',body:`
      const app={},db={},storage={},auth={currentUser:{uid:'preview-user',email:'preview@example.test'}};
      const collection=(_,path)=>path,query=(base,...clauses)=>({base,clauses}),where=(...parts)=>parts,ref=(_,path)=>path;
      async function getDocsFromServer(q){
        if(window.backupOffline)throw new Error('No hay conexión para crear un respaldo completo.');
        const base=q.base||q;
        if(base==='trips')return{docs:[{id:'A',data:()=>({info:{name:'Japón guardado',createdBy:'preview-user'},members:['preview-user']})}]};
        if(base.endsWith('/data'))return{docs:[{id:'itinerary',data:()=>({days:[{date:'2027-01-01',activities:[]}]})}]};
        if(base.endsWith('/documents'))return{docs:[{id:'ticket',data:()=>({storagePath:'trips/A/documents/preview-user/ticket/reserva.pdf',mimeType:'application/pdf',sensitive:true,uploadedBy:'preview-user'})}]};
        return{docs:[]};
      }
      async function getBlob(){return new Blob(['%PDF-1.4 test'],{type:'application/pdf'});}
      async function uploadBytes(path,blob){window.backupUploads.push({path,data:JSON.parse(await blob.text())});if(window.backupUploadFails)throw new Error('Falló la copia previa.');}
      const deleteObject=async()=>{};const getFunctions=()=>({}),httpsCallable=()=>async()=>{window.backupCalls++;return{data:{tripCount:1,tripIds:['new-copy']}};};
      window.backupUploads=[];window.backupCalls=0;
      ${source}
    `}));
    await page.goto('/dashboard.html',{waitUntil:'domcontentloaded'});
    await page.evaluate(async theme=>{
      document.documentElement.classList.toggle('dark',theme==='dark');document.documentElement.dataset.theme=theme;
      document.querySelector('#appDashboard').classList.remove('hidden');
      document.querySelectorAll('.tab-content').forEach(node=>node.classList.add('hidden'));
      const content=document.querySelector('#content-preparation');content.classList.remove('hidden');
      const {default:ExportImportSystem}=await import('/js/features/trips/export-import-system.js');
      window.ExportImportSystem=new ExportImportSystem();content.innerHTML=window.ExportImportSystem.renderUI();
      window.Dialogs={confirm:async()=>true};window.Notifications={show(){}};
      localStorage.setItem('firebase:authUser:fixture','secret');localStorage.setItem('japitin_last_backup','recursive');
    },theme);
    const download=page.waitForEvent('download');await page.getByRole('button',{name:/Exportar datos \(JSON\)/}).click();
    const file=await download;const bytes=fs.readFileSync(await file.path());const archive=JSON.parse(bytes.toString());
    expect(archive.trips).toHaveLength(1);expect(archive.trips[0].collections.data[0].id).toBe('itinerary');
    expect(Buffer.from(archive.trips[0].collections.documents[0].file.base64,'base64').toString()).toBe('%PDF-1.4 test');
    expect(archive.localStorage['firebase:authUser:fixture']).toBeUndefined();expect(archive.localStorage.japitin_last_backup).toBeUndefined();
    await page.locator('[data-backup-ui] input[type=file]').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:bytes});
    await expect(page.locator('[data-backup-status]')).toContainText('1 copias privadas');
    expect(await page.evaluate(()=>window.backupUploads[0].path)).toContain('/before-');
    expect(await page.evaluate(()=>window.backupCalls)).toBe(1);
    expect(await page.evaluate(()=>localStorage.getItem('firebase:authUser:fixture'))).toBe('secret');
    // A failed safety backup must stop restoration and allow selecting the same file again.
    await page.evaluate(()=>{window.backupUploadFails=true;});
    await page.locator('[data-backup-ui] input[type=file]').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:bytes});
    await expect(page.locator('[data-backup-status]')).toContainText('Falló la copia previa');
    expect(await page.evaluate(()=>window.backupCalls)).toBe(1);
    await expect(page.getByRole('button',{name:/Exportar datos \(JSON\)/})).toBeEnabled();
    await page.screenshot({path:`artifacts/backup-repairs/${theme}-${width}.png`});
  });
}
