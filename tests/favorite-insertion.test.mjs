import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
let stored={days:[{day:1,activities:[{id:'shared',title:'Existing'}]},{day:2,activities:[]}]},writes=0,fail=false,switchDuringRead=false;
const context={auth:{currentUser:{uid:'one'}},db:{},crypto:{randomUUID},window:{TripsManager:{currentTrip:{id:'A'}}},
  doc:(_, ...parts)=>parts.join('/'),itinerarySaveStatus:{track:operation=>operation()},
  runTransaction:async(_,callback)=>{
    if(fail)throw new Error('offline');let next;
    const result=await callback({get:async()=>{if(switchDuringRead)context.window.TripsManager.currentTrip={id:'B'};return{exists:()=>true,data:()=>stored};},update:(path,data)=>{assert.equal(path,'trips/A/data/itinerary');next=data;}});
    if(next){stored={...stored,...next};writes++;}return result;
  }};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../js/features/itinerary/favorite-insertion.js',import.meta.url),'utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replaceAll('export ','')+'\nthis.insert=insertFavorite;',context);
const scope={uid:'one',tripId:'A',day:2},favorite={name:'Tea',city:'Tokyo',lat:0,lng:0};
fail=true;await assert.rejects(context.insert(favorite,scope),/offline/);assert.equal(writes,0);fail=false;
const result=await context.insert(favorite,scope);assert.equal(result.days[0].activities[0].id,'shared');assert.equal(result.days[1].activities[0].title,'Tea');assert.equal(result.days[1].activities[0].coordinates.lat,0);assert.equal(result.days[1].activities[0].cost,null);
await assert.rejects(context.insert(favorite,{...scope,day:99}),/existe/);assert.equal(writes,1);
switchDuringRead=true;await assert.rejects(context.insert(favorite,scope),/cambi/);assert.equal(writes,1);
console.log('favorite insertion: confirmed persistence, correct day/trip, preserved shared activities, failure and identity guards ok');
