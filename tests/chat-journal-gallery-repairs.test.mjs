import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {parseMoneyToMinor,isSupportedCurrency,RATE_SCALE} from '../js/features/budget/money.js';

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
const records=new Map(),cache=new Map(),elements=new Map(),listeners=[],notices=[],deleted=[];
let failWrite=false,failRead=false,getGate=null,uploadGate=null,deleteFails=false,unsubscribeCount=0,writeCount=0;
const snapshot=path=>({id:path.split('/').at(-1),exists:()=>records.has(path),data:()=>structuredClone(records.get(path))});
const context={console:{log(){},warn(){},error(){}},crypto:{randomUUID},URL,setTimeout,clearTimeout,db:{},storage:{},auth:{currentUser:{uid:'u1',email:null,displayName:'Ana'}},parseMoneyToMinor,isSupportedCurrency,RATE_SCALE,
 window:{location:{origin:'https://preview.test'},TripsManager:{currentTrip:{id:'A'}},BudgetTracker:{baseCurrency:'USD'},addEventListener(){},Notifications:{error:text=>notices.push(text),show:text=>notices.push(text)},Dialogs:{}},
 document:{getElementById:id=>elements.get(id)||null,querySelectorAll:()=>[]},confirm:()=>true,
 localStorage:{getItem:key=>cache.get(key)||null,setItem:(key,value)=>cache.set(key,value)},
 collection:(_, ...parts)=>parts.join('/'),doc:(_, ...parts)=>parts.join('/'),query:value=>value,orderBy:()=>null,serverTimestamp:()=>1,
 getDocs:async path=>getGate?getGate.promise:{forEach:fn=>[...records].filter(([key])=>key.startsWith(path+'/')).forEach(([key])=>fn(snapshot(key)))},
 getDoc:async path=>snapshot(path),getDocFromServer:async path=>{if(failRead)throw Error('offline');return snapshot(path);},
 onSnapshot:(path,success,error)=>{listeners.push({path,success,error});return()=>unsubscribeCount++;},
 setDoc:async(path,value)=>{if(failWrite)throw Error('offline');records.set(path,structuredClone(value));writeCount++;},
 updateDoc:async(path,value)=>{if(failWrite)throw Error('offline');const previous=records.get(path)||{};for(const [key,item]of Object.entries(value)){if(item?.op==='union'){previous[key]||=[];for(const row of item.rows)if(!previous[key].some(existing=>JSON.stringify(existing)===JSON.stringify(row)))previous[key].push(row);}else if(item?.op==='remove')previous[key]=(previous[key]||[]).filter(row=>!item.rows.includes(row));else previous[key]=item;}records.set(path,previous);writeCount++;},
 deleteDoc:async path=>{if(failWrite)throw Error('offline');records.delete(path);},
 arrayUnion:(...rows)=>({op:'union',rows}),arrayRemove:(...rows)=>({op:'remove',rows}),
 runTransaction:async(_,callback)=>{if(failWrite)throw Error('offline');return callback({get:async path=>snapshot(path),set:contextSet,update:async(path,value)=>context.updateDoc(path,value)});},
 ref:(_,path)=>path,uploadBytes:async()=>{if(uploadGate)await uploadGate.promise;},getDownloadURL:async()=> 'https://preview.test/photo.jpg',
 deleteObject:async path=>{if(deleteFails)throw Error('offline cleanup');deleted.push(path);},structuredClone};
function contextSet(path,value){records.set(path,structuredClone(value));writeCount++;}
vm.createContext(context);
function evaluate(path){vm.runInContext(fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replaceAll('export const ','var ').replaceAll('export async function ','async function ').replaceAll('export function ','function '),context);}
evaluate('js/features/social/chat-conversions.js');
evaluate('js/features/social/group-chat.js');
const chat=context.window.GroupChat;chat.escapeHtml=value=>value.replaceAll('<','&lt;').replaceAll('>','&gt;');
chat.messages=[{id:'m1',message:'<img src=x onerror=alert(1)>'}];
let prompt=deferred(),options;
context.window.Dialogs.prompt=value=>{options=value;return prompt.promise;};
const conversion=chat.convertMessage('m1','expense');await chat.convertMessage('m1','expense');assert.equal(writeCount,0);assert.match(options.message,/&lt;img/);
context.window.TripsManager.currentTrip={id:'B'};prompt.resolve('2,50');assert.equal(await conversion,false);assert.equal(writeCount,0);
context.window.TripsManager.currentTrip={id:'A'};
context.window.Dialogs.prompt=async()=>'-2,50';assert.equal(await chat.convertMessage('m1','expense'),false);assert.equal(writeCount,0);
context.window.Dialogs.prompt=async()=> '2,50';assert.equal(await chat.convertMessage('m1','expense'),true);assert.equal(records.get('trips/A/expenses/chat_m1').amountMinor,250);assert.equal(records.get('trips/A/expenses/chat_m1').createdBy,'u1');
await chat.convertMessage('m1','expense');assert.equal(writeCount,1);
let opened=null;elements.set('activityTitle',{});elements.set('activityDesc',{});chat.close=()=>{};
context.window.ItineraryHandler={__getCurrentDay:()=>3,showActivityModal:(_,day)=>opened=day};
assert.equal(await chat.convertMessage('m1','activity'),true);assert.equal(opened,3);
opened=null;const opening=chat.convertMessage('m1','activity');context.window.TripsManager.currentTrip={id:'B'};await opening;assert.equal(opened,null);

evaluate('js/features/journal/journal-state.js');
const journal={...context.journalState,entries:[],setupUI(){},renderEntries(){}};
context.window.TripsManager.currentTrip={id:'A'};cache.set('journal_entries',JSON.stringify([{id:'old',title:'Wrong account',content:'Secret'}]));
await journal.initialize();assert.equal(journal.entries.length,0);
const entry={title:'Tokyo',content:'My memory',date:'2026-11-15',timestamp:1,tags:[]};
failWrite=true;assert.equal(await journal.addEntry(entry),false);assert.equal(journal.entries.length,0);failWrite=false;
await journal.addEntry(entry,journal.journalScope(),'new');assert.equal(journal.entries.length,1);assert.equal(records.get('trips/A/journal/new').title,'Tokyo');
const beforeDuplicate=writeCount;await Promise.all([journal.addEntry(entry,journal.journalScope(),'duplicate'),journal.addEntry(entry,journal.journalScope(),'duplicate')]);assert.equal(writeCount,beforeDuplicate+1);
assert.equal(journal.normalizeEntries({bad:'root'}).length,0);assert.equal(journal.normalizeEntries([null,{id:'bad',title:1,content:'x'}]).length,0);
const oldListener=listeners.at(-1);context.window.TripsManager.currentTrip={id:'B'};await journal.reinitialize();oldListener.success({forEach:callback=>callback({id:'stale',data:()=>entry})});assert.equal(journal.entries.length,0);
const staleScope=journal.journalScope();context.auth.currentUser={uid:'u2'};assert.equal(await journal.addEntry(entry,staleScope),false);
await journal.reinitialize();assert.equal(journal.entries.length,0);
getGate=deferred();const loading=journal.loadEntries();context.window.TripsManager.currentTrip={id:'C'};getGate.resolve({forEach:callback=>callback({id:'stale',data:()=>entry})});await loading;assert.equal(journal.entries.length,0);getGate=null;

evaluate('js/features/journal/gallery-state.js');
const gallery={...context.galleryState,currentTripId:null,unsubscribers:[],renderGallery(rows){this.rendered=rows;},closeDetailModal(){this.detailPhotoId=null;},showDetail:async()=>{}};
context.auth.currentUser={uid:'u1',displayName:'Ana'};context.window.TripsManager.currentTrip={id:'A'};
const grid={innerHTML:'',querySelector:()=>({})};elements.set('photoGalleryGrid',grid);
await gallery.loadGallery();const firstPhotoListener=listeners.at(-1);await gallery.loadGallery();assert.ok(unsubscribeCount>0);firstPhotoListener.success({docs:[{id:'stale',data:()=>({})}]});assert.equal(gallery.rendered,undefined);
listeners.at(-1).error(Error('permission denied'));assert.match(grid.innerHTML,/Reintentar/);
await gallery.loadGallery();listeners.at(-1).success({docs:[{id:'p1',data:()=>({likes:[],comments:[]})}]});assert.equal(gallery.rendered[0].id,'p1');
records.set('trips/A/photos/p1',{likes:['other'],comments:[{id:'other',text:'Concurrent',userId:'u2'}]});gallery.detailPhoto={id:'p1',likes:[]};
await gallery.toggleLike('A','p1');assert.deepEqual(records.get('trips/A/photos/p1').likes,['other','u1']);
const input={value:'New comment',isConnected:true};elements.set('galleryCommentInput',input);
await gallery.addComment('A','p1');assert.equal(records.get('trips/A/photos/p1').comments.length,2);assert.equal(input.value,'');
input.value='Retry me';failWrite=true;assert.equal(await gallery.addComment('A','p1'),false);assert.equal(input.value,'Retry me');failWrite=false;
assert.equal(context.galleryImageUrl('javascript:alert(1)'), '');
// A later selection and caption survive completion of the earlier upload.
const button={disabled:false},caption={value:'Original'},progress={classList:{add(){},remove(){}}};elements.set('uploadBtn',button);elements.set('photoCaption',caption);elements.set('uploadProgress',progress);
gallery.selectedFile={name:'first.jpg'};uploadGate=deferred();const upload=gallery.uploadPhoto();assert.equal(await gallery.uploadPhoto(),false);await Promise.resolve();gallery.selectedFile={name:'second.jpg'};gallery.selectionVersion++;caption.value='New draft';uploadGate.resolve();assert.equal(await upload,true);assert.equal(gallery.selectedFile.name,'second.jpg');assert.equal(caption.value,'New draft');uploadGate=null;
// A failed metadata write cleans up the uploaded binary and preserves the draft.
gallery.selectedFile={name:'retry.jpg'};failWrite=true;const cleanupBefore=deleted.length;assert.equal(await gallery.uploadPhoto(),false);assert.equal(deleted.length,cleanupBefore+1);assert.equal(gallery.selectedFile.name,'retry.jpg');failWrite=false;
// Offline confirmation preserves a potentially accepted file, then retries cleanup.
failWrite=true;failRead=true;await gallery.uploadPhoto();assert.equal(gallery.cleanupQueue('u1').length,1);failWrite=false;failRead=false;await gallery.retryPhotoCleanup(gallery.galleryScope());assert.equal(gallery.cleanupQueue('u1').length,0);
console.log('chat/journal/gallery: original scopes, exact money, dedupe, stale reads/listeners, isolated caches, atomic likes/comments, draft retention and upload cleanup ok');
