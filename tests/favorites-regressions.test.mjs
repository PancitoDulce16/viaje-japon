import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const cache=new Map(),listeners=[],notices=[];let items=[],fail=false,commits=0;
const context={console:{log(){},error(){}},db:{},auth:{currentUser:{uid:'one',email:null}},
  window:{TripsManager:{currentTrip:{id:'A'}},addEventListener(){},Notifications:Object.fromEntries(['success','error','info','warning'].map(key=>[key,text=>notices.push({key,text})]))},
  localStorage:{getItem:key=>cache.get(key)??null,setItem:(key,value)=>cache.set(key,value)},
  doc:(_,path,id)=>`${path}/${id}`,onSnapshot:(path,success,error)=>{listeners.push({path,success,error});return()=>{};},
  runTransaction:async(_,callback)=>{if(fail)throw new Error('offline');let next;const result=await callback({get:async()=>({exists:()=>true,data:()=>({items})}),set:(path,data)=>{next=data.items;}});items=next;commits++;return result;}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../js/features/trips/favorites-manager.js',import.meta.url),'utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replace('export const FavoritesManager','const FavoritesManager'),context);
const manager=context.window.FavoritesManager;manager.updateFavoritesUI=()=>{};
cache.set('favorites',JSON.stringify([{name:'Legacy from another account'}]));
await manager.initSync();assert.equal(manager.favorites.length,0);
fail=true;await manager.addFavorite({name:'Tokio',lat:0,lng:0});assert.equal(manager.favorites.length,0);assert.equal(notices.at(-1).key,'error');assert.equal(commits,0);
fail=false;items=[{id:'shared',name:'Kyoto',city:'Kyoto'},null];
await manager.addFavorite({name:'Tokio',city:'Tokio',lat:0,lng:0});assert.equal(items.length,3);assert.equal(manager.favorites.length,2);assert.equal(manager.favorites.at(-1).lat,0);
fail=true;await manager.removeFavorite('shared');assert.equal(manager.favorites.length,2);assert.equal(items[0].id,'shared');
context.window.TripsManager.currentTrip={id:'B'};await manager.initSync();
listeners[0].success({exists:()=>true,data:()=>({items:[{name:'Wrong trip'}]})});assert.equal(manager.favorites.length,0);
cache.set(manager.cacheKey(),'{broken');listeners.at(-1).error(new Error('offline'));assert.equal(manager.favorites.length,0);
context.auth.currentUser={uid:'two'};await manager.initSync();assert.equal(manager.favorites.length,0);
// Identity changing during a transaction read must prevent its write.
let writes=0;context.runTransaction=async(_,callback)=>callback({get:async()=>{context.auth.currentUser={uid:'three'};return{exists:()=>true,data:()=>({items:[]})};},set:()=>writes++});
assert.equal(await manager.mutateFavorite(rows=>rows),false);assert.equal(writes,0);
console.log('favorites: retryable failures, scoped caches/listeners, preserved concurrent additions, zero coordinates and changed identity ok');
