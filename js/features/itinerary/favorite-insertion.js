import { auth, db } from '../../core/firebase-config.js';
import { doc, runTransaction } from 'firebase/firestore';
import { itinerarySaveStatus } from '../../core/itinerary-save-status.js';

export function favoriteScopeIsCurrent(scope){return Boolean(scope.uid&&scope.tripId&&auth.currentUser?.uid===scope.uid&&window.TripsManager?.currentTrip?.id===scope.tripId);}

// Called through the itinerary's existing serial save queue. Retry the transaction
// against the authoritative document so a shared editor's additions survive.
export async function insertFavorite(favorite,scope){
  if(!favoriteScopeIsCurrent(scope))throw new Error('El viaje o la cuenta cambi\u00f3.');
  if(typeof favorite?.name!=='string'||!favorite.name.trim())throw new Error('El favorito no tiene nombre.');
  const activity={id:`fav_${crypto.randomUUID()}`,title:favorite.name.trim(),time:'10:00',duration:60,category:'other',desc:String(favorite.description||favorite.city||''),cost:null};
  const lat=Number(favorite.lat),lng=Number(favorite.lng);
  if(favorite.lat!=null&&favorite.lng!=null&&Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180)activity.coordinates={lat,lng};
  const target=doc(db,'trips',scope.tripId,'data','itinerary');
  return itinerarySaveStatus.track(()=>runTransaction(db,async transaction=>{
    if(!favoriteScopeIsCurrent(scope))throw new Error('El viaje o la cuenta cambi\u00f3.');
    const snapshot=await transaction.get(target);
    if(!favoriteScopeIsCurrent(scope))throw new Error('El viaje o la cuenta cambi\u00f3.');
    if(!snapshot.exists())throw new Error('Primero cre\u00e1 el itinerario de este viaje.');
    const itinerary=snapshot.data();
    if(!Array.isArray(itinerary.days))throw new Error('El itinerario no tiene d\u00edas v\u00e1lidos.');
    let found=false;
    const days=itinerary.days.map(day=>{
      if(Number(day.day)!==Number(scope.day))return day;
      if(day.activities!=null&&!Array.isArray(day.activities))throw new Error('Las actividades del d\u00eda no son v\u00e1lidas.');
      found=true;return {...day,activities:[...(day.activities||[]),activity]};
    });
    if(!found)throw new Error('Ese d\u00eda ya no existe en el itinerario.');
    transaction.update(target,{days,lastUpdated:new Date().toISOString()});
    return {...itinerary,days};
  }));
}
