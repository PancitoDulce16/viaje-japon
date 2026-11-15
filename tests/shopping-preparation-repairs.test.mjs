import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { randomUUID } from 'node:crypto';

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const records=new Map(),cache=new Map(),listeners=[],notices=[],forms=new Map();
let fail=false,reads=null,beforeRead=null,writes=0;
const context={console,crypto:{randomUUID},db:{},auth:{currentUser:{uid:'u1',email:'one@example.test'}},
  window:{TripsManager:{currentTrip:{id:'A'}},addEventListener(){},Notifications:{show:(message,type)=>notices.push({message,type})}},
  document:{getElementById:id=>forms.get(id)||null},
  localStorage:{getItem:key=>cache.get(key)||null,setItem:(key,value)=>cache.set(key,value)},
  doc:(_, ...parts)=>parts.join('/'),
  getDoc:async path=>reads?reads.promise:snapshot(path),
  onSnapshot:(path,success,error)=>{listeners.push({path,success,error});return()=>{};},
  runTransaction:async(_,callback)=>{
    if(fail)throw new Error('offline');let pending;
    const result=await callback({get:async path=>{await beforeRead?.();return snapshot(path);},set:(path,data)=>{pending={path,data};}});
    if(pending){records.set(pending.path,pending.data);writes++;}return result;
  }};
function snapshot(path){return {exists:()=>records.has(path),data:()=>records.get(path)};}
vm.createContext(context);
function evaluate(path){vm.runInContext(fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replaceAll('export const ','var '),context);}
evaluate('js/features/trips/shopping-state.js');
const shopping={...context.shoppingState,CATEGORIES:{other:{}},shoppingList:[],renderShoppingTracker(){},close(){}};
await shopping.init('A');
const value={name:'Camera',category:'other',priority:'medium',quantity:3,estimatedPrice:100,weight:0.5};
fail=true;assert.equal(await shopping.addItem(value),false);assert.equal(shopping.shoppingList.length,0);assert.equal(notices.at(-1).type,'error');
fail=false;records.set('trips/A/data/shopping',{items:[{...value,id:'shared'}]});
await shopping.addItem({...value,name:'Tea'});assert.equal(shopping.shoppingList.length,2);assert.equal(records.get('trips/A/data/shopping').items[0].id,'shared');
await shopping.markAsPurchased('shared',0);assert.equal(shopping.getStats().totalActual,0);
await shopping.markAsPurchased('shared',120);assert.equal(shopping.getStats().totalActual,360);assert.equal(shopping.getStats().totalWeight,1.5);
fail=true;await shopping.editItem('shared',{name:'Wrong'});assert.equal(shopping.shoppingList[0].name,'Camera');await shopping.deleteItem('shared');assert.equal(shopping.shoppingList.length,2);fail=false;
for(const patch of [{quantity:1.5},{quantity:0},{quantity:1000},{estimatedPrice:-1},{estimatedPrice:1.2},{estimatedPrice:Infinity},{weight:-0.1}])assert.throws(()=>shopping.validateItem({...value,...patch}));
assert.equal(shopping.normalizeItem(null),null);assert.equal(shopping.normalizeItem({...value,id:'bad',category:'__proto__',priority:null}).priority,'medium');assert.equal(shopping.normalizeItem({...value,id:'bad',category:'__proto__'}).category,'other');
// Form failure preserves values and permits retry; a double click produces one write.
const controls=[{disabled:false}],fields={itemName:'Camera',itemCategory:'other',itemStore:'',itemPrice:'100',itemQuantity:'3',itemPriority:'medium',itemWeight:'0.5',itemNotes:'draft'};
let removed=false;
const form={shoppingContext:shopping.context(),querySelector:selector=>({value:fields[selector.slice(1)]}),querySelectorAll:()=>controls,remove:()=>{removed=true;forms.delete('addItemForm');}};forms.set('addItemForm',form);
fail=true;await shopping.saveNewItem();assert.equal(removed,false);assert.equal(fields.itemNotes,'draft');assert.equal(controls[0].disabled,false);fail=false;
const gate=deferred();beforeRead=()=>gate.promise;const saving=shopping.saveNewItem();const before=writes;await shopping.saveNewItem();gate.resolve();await saving;beforeRead=null;assert.equal(writes,before+1);assert.equal(removed,true);
// Captured forms and late loads cannot use another trip/account.
const oldScope=shopping.context();context.window.TripsManager.currentTrip={id:'B'};await shopping.init('B');assert.equal(await shopping.addItem(value,oldScope),false);
reads=deferred();const loading=shopping.loadShoppingList();context.window.TripsManager.currentTrip={id:'C'};reads.resolve({exists:()=>true,data:()=>({items:[{...value,id:'stale'}]})});await loading;assert.equal(shopping.shoppingList.length,0);reads=null;
context.window.TripsManager.currentTrip={id:'A'};await shopping.init('A');
beforeRead=()=>{context.auth.currentUser={uid:'u2'};};const oldWrites=writes;assert.equal(await shopping.addItem(value),false);assert.equal(writes,oldWrites);beforeRead=null;context.auth.currentUser={uid:'u1'};

evaluate('js/features/trips/preparation-state.js');
const defaults=()=>({documents:[],clothing:[],electronics:[],health:[],money:[],misc:[]});
const prep={...context.preparationState,packingList:defaults(),getCurrentTripId:()=>context.window.TripsManager.currentTrip?.id||null,getDefaultPackingList:defaults,renderPreparation(){}};
cache.set('packingList',JSON.stringify({documents:[{name:'Another account'}]}));await prep.initRealtimeSync();assert.equal(prep.packingList.documents.length,0);
const first=listeners.at(-1);context.window.TripsManager.currentTrip={id:'B'};await prep.initRealtimeSync();first.success({exists:()=>true,data:()=>({items:{...defaults(),documents:[{name:'Wrong trip'}]}})});assert.equal(prep.packingList.documents.length,0);
const path='trips/B/data/packing';records.set(path,{items:{...defaults(),misc:[{id:'one',name:'First'},{id:'two',name:'Second'}]}});listeners.at(-1).success(snapshot(path));
const confirm=deferred();context.window.Dialogs={confirm:()=>confirm.promise};const deleting=prep.deleteCustomItem('misc',1);
records.get(path).items.misc.unshift({id:'new',name:'Concurrent'});prep.packingList=prep.normalizePacking(records.get(path).items);confirm.resolve(true);assert.equal(await deleting,true);assert.deepEqual(records.get(path).items.misc.map(item=>item.id),['new','one']);
fail=true;const item=prep.packingList.misc[0];await prep.assignItem('misc',0,'owner@example.test');assert.equal(item.owner,null);assert.equal(notices.at(-1).type,'error');fail=false;
const prompt=deferred();context.window.Dialogs.prompt=()=>prompt.promise;const adding=prep.addCustomItem('misc');context.window.TripsManager.currentTrip={id:'C'};await prep.initRealtimeSync();prompt.resolve('Wrong trip item');assert.equal(await adding,false);assert.equal(records.has('trips/C/data/packing'),false);
const oldKey=prep.packingCacheKey(prep.packingScope());context.auth.currentUser={uid:'u3'};await prep.initRealtimeSync();assert.notEqual(prep.packingCacheKey(prep.packingScope()),oldKey);assert.equal(prep.packingList.misc.length,0);
console.log('shopping/preparation: scoped forms and loads, transactions, retry, duplicate clicks, exact quantities/zero prices, stable deletion and failures ok');
