import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {validateArchive,COLLECTIONS}=require('../functions/backup-archive.js');
const stored=new Map([['theme-preference','dark'],['japitin_a11y_settings','{}'],['firebase:authUser:key','secret'],['authenticated','true'],['japitin_last_backup','recursive'],['japitin_chat_draft_A','private draft']]);
const notices=[],uploads=[],deletes=[];
const context={Blob,URL,crypto,CustomEvent:class{},console, setTimeout,app:{},db:{},storage:{},auth:{currentUser:{uid:'me'}},document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{Notifications:{show:(...args)=>notices.push(args)},confirm:()=>true,dispatchEvent(){}},
  localStorage:{getItem:key=>stored.get(key)??null,setItem:(key,value)=>stored.set(key,value),removeItem:key=>stored.delete(key)},
  collection:(_,path)=>path,query:(...args)=>args,where:(...args)=>args,
  getDocsFromServer:async()=>({docs:[]}),ref:(_,path)=>path,uploadBytes:async(path,blob)=>uploads.push({path,blob}),deleteObject:async path=>deletes.push(path),
  getFunctions:()=>({}),httpsCallable:()=>async()=>({data:{tripCount:1,tripIds:['copy']}})};
vm.createContext(context);
const source=fs.readFileSync(new URL('../js/features/trips/backup-service.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
vm.runInContext(source+';globalThis.Backup=BackupService;globalThis.encode=encodeBackupValue;globalThis.collections=BACKUP_COLLECTIONS;',context);
assert.deepEqual(Array.from(context.collections),COLLECTIONS);
const backup=new context.Backup();
assert.deepEqual(Object.keys(backup.exportLocalStorage()).sort(),['japitin_a11y_settings','theme-preference']);
for(const bad of [null,[],{}, {metadata:{version:'99'},trips:[]},{metadata:{version:'2.0.0'},trips:{}},JSON.parse('{"metadata":{"version":"2.0.0"},"settings":{"__proto__":{}}}')]){
  assert.equal(backup.validateImportData(bad),false);
  assert.throws(()=>validateArchive(bad));
}
const archive={metadata:{version:'2.0.0'},trips:[{id:'source',info:{name:'Japón'},collections:{}}],localStorage:{'theme-preference':'light','firebase:authUser:key':'malicious','authenticated':'false'},settings:{security:{twoFactorEnabled:false},appConfig:{language:'es'}}};
assert.equal(backup.validateImportData(archive),true);validateArchive(archive);
assert.throws(()=>validateArchive({...archive,trips:[{...archive.trips[0],id:'../escape'}]}));
assert.throws(()=>validateArchive({...archive,trips:[{...archive.trips[0],collections:{unknown:[]}}]}));
assert.throws(()=>validateArchive({...archive,trips:[{...archive.trips[0],collections:{documents:[{id:'file',data:{storagePath:'missing'}}]}}]}));
const timestamp=context.encode({seconds:123,nanoseconds:456,toDate(){}});assert.equal(timestamp.__japitinType,'timestamp');assert.equal(timestamp.nanoseconds,456);
const coordinates=context.encode({latitude:35,longitude:139,label:'Tokio'});assert.equal(coordinates.label,'Tokio');assert.equal(coordinates.__japitinType,undefined);
assert.equal(context.encode({latitude:35,longitude:139,isEqual(){}}).__japitinType,'geo');
stored.set('user_settings',JSON.stringify({appConfig:{theme:'dark'}}));
backup.applyLocalData(archive,context.auth.currentUser);
assert.equal(stored.get('firebase:authUser:key'),'secret');assert.equal(stored.get('authenticated'),'true');
assert.equal(stored.get('theme-preference'),'light');assert.equal(JSON.parse(stored.get('user_settings')).security,undefined);
assert.equal(JSON.parse(stored.get('user_settings')).appConfig.theme,'dark');
assert.equal(backup.validateImportData({...archive,settings:{appConfig:42}}),false);

backup.collectBackup=async()=>({metadata:{version:'2.0.0'},trips:[]});
context.window.confirm=()=>false;
assert.equal((await backup.importAllFromData(archive)).cancelled,true);assert.equal(uploads.length,0);
context.window.confirm=()=>true;
context.uploadBytes=async()=>{throw new Error('pre-import backup failed');};
assert.equal((await backup.importAllFromData(archive)).success,false);assert.equal(deletes.length,0);
context.uploadBytes=async(path,blob)=>uploads.push({path,blob});
assert.equal((await backup.importAllFromData(archive)).success,true);
assert.match(uploads[0].path,/^backups\/me\/before-/);assert.match(uploads[1].path,/^backups\/me\/import-/);assert.equal(deletes.length,1);
// Changed identity after a confirmation must prevent uploads and writes.
uploads.length=0;context.window.confirm=()=>{context.auth.currentUser={uid:'other'};return true;};
assert.equal((await backup.importAllFromData(archive)).success,false);assert.equal(uploads.length,0);
assert.equal(stored.get('firebase:authUser:key'),'secret');
context.auth.currentUser={uid:'me'};
let readPath;
context.getBlob=async path=>{readPath=path;return new Blob([JSON.stringify(archive)]);};
backup.restoreData=async()=>({success:true});
assert.equal((await backup.restoreFromCloud(true)).success,true);assert.equal(readPath,'backups/me/before-import.json');
console.log('backup format: validation, restricted preferences, session preservation, confirmation, pre-backup failure and identity changes ok');
